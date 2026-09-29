#!/usr/bin/env python3
"""SwingStats: read-only Swing Music library stats for the Homepage widget.

- GET /stats -> {"tracks": N, "albums": N, "artists": N} from a filesystem walk
  of /music (mounted read-only from the host's music library).

Counting semantics (matches the original host service):
- artists: top-level directories under /music
- albums: second-level directories containing more than one audio file
- tracks: audio files found recursively under each album directory

No auth; only aggregate counts are exposed. Never writes to the library.
"""
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

BASE = os.environ.get("MUSIC_DIR", "/music")
PORT = int(os.environ.get("PORT", "5001"))
AUDIO_EXTS = {".flac", ".m4a", ".mp3", ".ogg", ".wav", ".opus", ".aac"}


def count_audio_recursive(path):
    c = 0
    for _root, _dirs, files in os.walk(path):
        for f in files:
            if os.path.splitext(f)[1].lower() in AUDIO_EXTS:
                c += 1
    return c


def get_stats():
    artists = 0
    albums = 0
    tracks = 0
    try:
        entries = os.listdir(BASE)
    except OSError:
        return {"tracks": 0, "albums": 0, "artists": 0}
    for artist in entries:
        artist_path = os.path.join(BASE, artist)
        if not os.path.isdir(artist_path):
            continue
        artists += 1
        for album in os.listdir(artist_path):
            album_path = os.path.join(artist_path, album)
            if not os.path.isdir(album_path):
                continue
            n = count_audio_recursive(album_path)
            tracks += n
            if n > 1:
                albums += 1
    return {"tracks": tracks, "albums": albums, "artists": artists}


class Handler(BaseHTTPRequestHandler):
    server_version = "SwingStats/1.0"

    def _json(self, data, code=200):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/stats":
            self._json(get_stats())
        elif self.path in ("/", "/health"):
            self._json({"ok": True, "service": "swingstats"})
        else:
            self._json({"error": "not found"}, code=404)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()

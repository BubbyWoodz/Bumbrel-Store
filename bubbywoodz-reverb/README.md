# Reverb (Brumble package)

Packaged from [BubbyWoodz/swingmusic](https://github.com/BubbyWoodz/swingmusic)
— Rhydian's enhanced Swing Music fork. Image is digest-pinned; all data
persists under Umbrel's app-data dir.

## What's inside

- **Subsonic/OpenSubsonic API** under `/rest/` (toggle in Settings → Plugins)
- **Replay** page with yearly/monthly stats + animated highlight reel
- **Server-validated play logging** (Last.fm rule, skips flagged not counted)
- **Connect-style device sync** — per-user now-playing state, remote control,
  connected-devices settings page
- **On-the-fly transcoding** (mp3/opus/aac/ogg) with per-user quality setting
- **Custom playlist artwork** via the playlist edit dialog
- **Lean memory optimizations** from the v1.0.0-lean baseline

## After install

1. Open Reverb and register your account.
2. Add your music folders in Settings (the T7 library at `/music/t7` is
   pre-mounted read-only if your Samsung T7 is attached).
3. Optional: enable the Subsonic API in Settings → Plugins to use
   third-party clients like Arpeggi.

## Notes

- Runs on **port 1971** — the stock Swing Music app (port 1970) can stay
  installed alongside it during migration.
- Your existing Swing Music database is NOT shared: Reverb starts with a
  fresh library. Scrobble history from the old app won't carry over
  automatically (trackhash inputs changed upstream in July 2026 for
  multi-artist files).
- Everything lives in the app-data `config/` folder. Back it up and you
  back up the whole server state.

## Ports

- `1971` on the host → app, served as `https://umbrel.local:1971` through
  the umbrelOS 2.0 app gateway.

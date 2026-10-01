# Mneme (Brumble package)

Packaged from [mneme-blog/mneme](https://github.com/mneme-blog/mneme)
(v0.5.1) — local-first, end-to-end encrypted journal. All images are
digest-pinned; all data persists under Umbrel's app-data dir.

> **Heads-up:** Mneme is pre-1.0 and has **not had an external security
> audit**. Treat it as a promising beta: keep the automatic backups
> enabled and don't make it your only copy of anything irreplaceable yet.

## After install

1. Open the app — it redirects to `/mneme/`.
2. Create your vault. **Write down the 12-word recovery phrase** and store
   it somewhere safe (password manager and/or printed). There is **no
   password reset** — lose the words, lose the journal.
3. Optional: add a seed-sealing passphrase or FIDO2 security key for extra
   protection.
4. The relay takes encrypted backups automatically (every 24h, keeps 14)
   into the app-data dir.

## Admin

The relay's operator dashboard is disabled in this package (empty
`ADMIN_TOKEN` => `/admin` 404s). It only shows aggregate stats and isn't
needed: vault approval is off, so new vaults work immediately.

## Media uploads

Photo/voice attachments are stored in **Garage**, an S3-compatible object
store run by Deuxfleurs — a French non-profit focused on decentralization
and self-hosting. No telemetry, no phone-home: it fits Mneme's own
privacy philosophy. (MinIO was dropped because it left Docker Hub and its
new registry stopped allowing anonymous pulls.) The bucket is created
automatically on first boot; all credentials are per-install via Umbrel's
APP_SEED. A fallback image mirror is kept on GHCR in case Docker Hub ever
becomes unavailable.

## Ports

- `8092` on the host → web UI, served as `https://umbrel.local:8092`
  through the umbrelOS 2.0 app gateway (the app itself redirects `/` to
  `/mneme/`).

## What's inside

- `web`: Mneme PWA behind Caddy (plain HTTP internally — Umbrel's gateway
  provides the HTTPS browsers require for OPFS/media/service worker)
- `server`: Mneme relay (sync + encrypted backups)
- `postgres`: metadata database (password = per-install `APP_SEED`)

Secrets are per-install via Umbrel's `APP_SEED` — every install gets
unique credentials, nothing shared.

Voice transcription is omitted (upstream's ~1.6GB Whisper model); the
journal works fully without it.

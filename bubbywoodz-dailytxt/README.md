# DailyTxT (Brumble package)

Packaged from [PhiTux/dailytxt](https://github.com/PhiTux/dailytxt) (v2.6.3) —
self-hosted private journal & diary. Image is digest-pinned; all data
persists under Umbrel's app-data dir.

## After install

1. Open the app and **register your account** — registration starts open.
2. Log in to the **admin panel** with the `ADMIN_PASSWORD` from
   `docker-compose.yml`, then **close registration**
   (Admin → Settings → uncheck "Allow registration"). Umbrel has no
   install-time config, so this stays open on first boot — don't skip it.
3. Optional: install it as a PWA from your phone's browser for an
   app-like experience.

## Notes

- Sessions last 60 days (`LOGOUT_AFTER_DAYS`); set to `0` in the compose
  file for sessions that never expire.
- Everything lives in the app-data `data/` folder (SQLite database +
  uploads). Back up that folder and you back up the whole journal.
- File uploads are encrypted before being written to server storage.

## Ports

- `8091` on the host → app, served as `https://umbrel.local:8091` through
  the umbrelOS 2.0 app gateway.

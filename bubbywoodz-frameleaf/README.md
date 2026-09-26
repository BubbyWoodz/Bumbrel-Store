# Frameleaf for Umbrel

Frameleaf `frameleaf-v3.2.0-15` (Immich v3.2.0 fork) packaged as a community
app for the Bumbrel store. All images are pinned by digest to the certified
Frameleaf release manifest.

## What's inside

- `umbrel-app.yml` — Umbrel app manifest (id: `bubbywoodz-frameleaf`)
- `docker-compose.yml` — server, machine learning (OpenVINO), Redis, Postgres

## Notes

- **Fresh install.** This app creates its own database and library under its
  own app data dir. It does not touch the existing Immich app.
- **OpenVINO.** The machine-learning service uses the `-openvino` image and
  maps `/dev/dri` for Intel iGPU acceleration. If the ML container fails to
  start on your machine, comment out the `devices:` / `device_cgroup_rules:`
  lines in `docker-compose.yml` to fall back to CPU.
- **Secrets.** `DB_PASSWORD` and `JWT_SECRET` are random values generated at
  package time and baked into `docker-compose.yml`. The Postgres database is
  only reachable inside the app's Docker network.
- **External libraries.** The manifest declares a read-only `external-library`
  folder mount at `/mnt/external-library` if you want Frameleaf to import from
  an existing photo folder without copying.

## Enable NSFW detection after install

1. Open Frameleaf → Administration → Settings → Machine Learning Settings
2. Enable **Detect NSFW images**
3. Administration → Jobs → **NSFW Detection** → run for **All**
4. Review results and tune the threshold
5. Only then enable **Hide detected NSFW assets** and set the locked-folder PIN

## Release provenance

- Release: https://github.com/Frameleaf/frameleaf-app/releases/tag/frameleaf-v3.2.0-15
- Server digest: `sha256:b016ab3b03f75950d843bd17172a3dc67d89617ed3c518c61b4f71675315b6e4`
- ML (openvino) digest: `sha256:fb0b02fa17f8fe1411883cb6c9f6669ddd0184347ca6298ba19f2f459300d5ee`

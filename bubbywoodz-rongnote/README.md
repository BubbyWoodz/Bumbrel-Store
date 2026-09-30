# RongNote (Brumble package)

Packaged from [operator64/rongnote](https://github.com/operator64/rongnote) —
self-hosted, end-to-end encrypted notes/passwords/files/tasks vault.
Images are digest-pinned; data persists under Umbrel's app-data dir.

## After install

1. Open the app and **register your account**.
2. **Close registration** so nobody else can sign up: over SSH, edit
   `~/umbrel/app-data/bubbywoodz-rongnote/docker-compose.yml`, set
   `REGISTRATION_OPEN: "false"`, then restart the app from the Umbrel UI.
   (Umbrel has no install-time config, so this stays open on first boot.)

## Passkeys / YubiKey (needs HTTPS)

WebAuthn passkeys require a secure context. While on umbrelOS 1.x (plain
HTTP) the app runs with `APP_ENV: development` so login cookies work —
passkey *registration* will not work until HTTPS is in front.

Once on **umbrelOS 2.0** (automatic HTTPS):

1. Install the Umbrel CA on your iPhone (Settings → install profile → trust).
2. Over SSH, set `APP_ENV: production` and
   `PUBLIC_URL: https://umbrel.local:8090` in the compose file, restart.
   (The RP ID stays `umbrel.local`, so passkeys remain valid.)
3. Register your YubiKey in RongNote → Settings → Passkeys.

## Ports

- `8090` on the host → app (also reachable over Tailscale at
  `http://100.96.4.85:8090`, and via the Umbrel dashboard "Open" button).

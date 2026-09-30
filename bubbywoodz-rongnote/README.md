# RongNote (Brumble package)

Packaged from [operator64/rongnote](https://github.com/operator64/rongnote) —
self-hosted, end-to-end encrypted notes/passwords/files/tasks vault.
Images are digest-pinned; data persists under Umbrel's app-data dir.
Configured for **umbrelOS 2.0**: served over the automatic HTTPS gateway in
production mode, so WebAuthn passkeys work out of the box.

## After install

1. Make sure the **Umbrel CA is installed and trusted** on your iPhone
   (Settings → install the profile → trust it), otherwise Safari will warn
   on the https://umbrel.local address.
2. Open the app and **register your account**.
3. **Close registration** so nobody else can sign up: over SSH, edit
   `~/umbrel/app-data/bubbywoodz-rongnote/docker-compose.yml`, set
   `REGISTRATION_OPEN: "false"`, then restart the app from the Umbrel UI.
   (Umbrel has no install-time config, so this stays open on first boot.)
4. Register your **YubiKey** in RongNote → Settings → Passkeys. Add a second
   passkey or recovery method so losing one key doesn't lock you out.

## Ports

- `8090` on the host → app, served as `https://umbrel.local:8090` through the
  2.0 app gateway (also reachable over Tailscale at
  `https://100.96.4.85:8090`, cert warning on the raw IP — use umbrel.local).

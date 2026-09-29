# Micro Buddy (Umbrel app)

Umbrel package for the Micro Buddy sales dashboard. The app container bind-mounts
`/home/umbrel/microbuddy-dashboard` (the live dashboard code and its state: pairing
tokens, Supabase anon key, per-user data) and runs `microbuddy.py` on port 5002.

Auth is QR/app-pairing: scan with the Micro Buddy iOS app, which hands over its
Supabase session. No passwords or secrets are baked into the image.

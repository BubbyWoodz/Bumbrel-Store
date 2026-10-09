# Plaid MCP (Brumble store package)

Umbrel app store package for the self-hosted Plaid MCP server
([source repo](https://github.com/BubbyWoodz/plaid-mcp),
image `ghcr.io/bubbywoodz/plaid-mcp`, digest-pinned in `docker-compose.yml`).

## What it does

Exposes your bank accounts, balances, transactions, merchants, and spending
totals over remote MCP (Streamable HTTP) at `/mcp`, so an AI like Poke can
answer money questions. Google sign-in + email allowlist guards access; Plaid
access tokens are encrypted at rest on your Umbrel.

## Setup

1. Install from the Brumble store (port 8096).
2. Create `/data/.env` in the app data dir on the Umbrel:

   ```env
   PLAID_ENV=production
   PLAID_CLIENT_ID=<dashboard.plaid.com>
   PLAID_PRODUCTION_SECRET=<dashboard.plaid.com>
   GOOGLE_CLIENT_ID=<Google Cloud Console>
   GOOGLE_CLIENT_SECRET=<Google Cloud Console>
   ALLOWED_EMAIL=<your Google email>
   BASE_URL=<public https URL, e.g. Tailscale Funnel URL>
   ```

3. Register `BASE_URL/auth/google/callback` in the Google Cloud OAuth client.
4. Restart the app, open `BASE_URL`, sign in, connect your bank at
   `/plaid/link`.
5. In Poke: New Integration → MCP, Server URL `BASE_URL/mcp`.

## Privacy

Read-only. Plaid sees your transaction data (they're the aggregator —
unavoidable). Your AI sees whatever it queries. Nobody else.

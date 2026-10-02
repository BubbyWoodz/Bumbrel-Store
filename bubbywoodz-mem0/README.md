# Mem0 (Brumble package)

Packaged from [mem0ai/mem0](https://github.com/mem0ai/mem0) — self-hosted
long-term memory layer for AI agents. All images are digest-pinned (except
the BubbyWoodz dashboard build, which tracks a pinned upstream commit);
all data persists under Umbrel's app-data dir.

## What's inside

- `api`: Mem0 REST API server (`mem0/mem0-api-server`), OpenAPI docs at
  `/docs`
- `dashboard`: Mem0 dashboard UI, built from upstream source via
  [BubbyWoodz/mem0-dashboard](https://github.com/BubbyWoodz/mem0-dashboard)
  (GHCR, pinned upstream commit)
- `postgres`: pgvector/pgvector:pg17 — vector memory store + app database
  (password = per-install `APP_SEED`)

Secrets are per-install via Umbrel's `APP_SEED` — every install gets unique
credentials, nothing shared. Telemetry is disabled (`MEM0_TELEMETRY=false`).

## After install

1. Open the app (dashboard on `:8093`) and complete the setup wizard to
   create your admin account.
2. The package defaults to **fully local inference**: point Mem0's LLM and
   embedder at your Umbrel's Ollama (`Configuration` in the dashboard, or
   `POST /configure`):
   - LLM: provider `openai`, model `llama3.1`,
     `openai_base_url: http://ollama_ollama_1:11434/v1`
   - Embedder: provider `openai`, model `nomic-embed-text`,
     `openai_base_url: http://ollama_ollama_1:11434/v1`
   
   (The upstream server image only bundles OpenAI/Anthropic/Gemini
   providers, so Ollama is reached through its OpenAI-compatible API —
   no data leaves your network either way.)
3. Pull the models in Ollama first: `llama3.1:8b` and `nomic-embed-text`.
4. Create API keys in the dashboard (`API Keys`) for your agents; pass them
   as the `X-API-Key` header. The per-install `ADMIN_API_KEY`
   (= your `APP_SEED`) also works as an admin key.

## Ports

- `8093` on the host → dashboard UI
- `8888` on the host → REST API (`/docs`, `/configure`, `/memories`, …).
  The dashboard calls it at `http://umbrel.local:8888` from your browser.

## Notes

- On an Intel N100, `llama3.1:8b` extraction runs a few tokens/sec — fine
  for background memory filing, slow for interactive use. That's expected;
  memory extraction is async.
- Request logs accumulate in Postgres (`request_logs` table); prune
  periodically if the DB grows.

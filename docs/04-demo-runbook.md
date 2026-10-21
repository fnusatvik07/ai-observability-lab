# Live demo runbook (about 15 minutes)

Everything runs from this repository. The notebooks are the demo; the scripts in `demo/` are the same agent as plain Python files if you prefer a terminal.

## Before the session (30+ minutes ahead)

```bash
make setup      # .venv, dependencies, Jupyter kernel
make up         # Langfuse + OpenTelemetry Collector, waits until healthy
make test       # runs every notebook once so the Langfuse project is already full of traces
make lab        # opens JupyterLab
```

- Log in at http://localhost:3000 with `admin@observability.lab` / `observability123`
- Browser zoom 125 to 150%, JupyterLab font size up, notifications off
- Keep a second browser tab on the Langfuse **Tracing** page

## Flow

| Minutes | Notebook | What to show | The line to say |
|---|---|---|---|
| 3 | `00_setup` | The stack diagram, `docker compose ps` table | "Six containers, the same shape as most observability backends" |
| 3 | `01_signals` | Interleaved logs, the metrics histogram, the waterfall | "Metrics say p95 got worse. Traces say why." |
| 3 | `02_opentelemetry` | `traceparent` header, the flush demo, section 8 table | "We sent no Langfuse code, and it still knew which span was the LLM call." |
| 4 | `03_langfuse` | Guardrail + judge waterfall, then the same trace in the UI: Sessions, Users, Scores | "Every step, every token, every decision." |
| 2 | `06_enterprise_backends` | The privacy check table | "The app leaked an email. The Collector made sure it never left." |

Notebooks `04_langsmith` and `05_analytics` are great take-home material if time is short.

## If something breaks

| Symptom | Fix |
|---|---|
| Port 5432 already in use | Already handled: Postgres is published on host port 5433 |
| MinIO restarting with code 132 | Already handled: the compose file pins `platform: linux/amd64` for MinIO |
| Port 3000 busy | Change `3000:3000` to `3001:3000` and set `NEXTAUTH_URL` and `LANGFUSE_BASE_URL` to match |
| No traces appear | The script exited before flushing: every notebook calls `flush()` / `force_flush()`; re-run that cell |
| OTel to LangSmith returns 404 | In environment variables use the base `.../otel`; in code use the full `.../otel/v1/traces` |
| Wi-Fi dies | Langfuse is local; only the OpenAI calls need internet. The executed notebooks already contain outputs |

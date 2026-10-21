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

The full minute-by-minute plan is in [01-session-plan.md](01-session-plan.md). The live parts:

| Minutes | Notebook | What to show | The line to say |
|---|---|---|---|
| 5 | `01_what_is_observability` | The log lines, the three metric numbers, the trace picture | "Metrics say it is slow. The trace says which step." |
| 6 | `02_langfuse` | The two `# NEW` lines, then the trace in the Langfuse UI | "We never wrote code for the AI row. The import did it." |
| 3 | `03_langsmith` | `@traceable` next to `@observe()`, the vocabulary table | "Different words, same ideas." |
| 3 | `04_other_tools` | The plain OpenTelemetry trace arriving in Langfuse | "Choosing a tool is choosing an address." |

## If something breaks

| Symptom | Fix |
|---|---|
| Port 5432 already in use | Already handled: Postgres is published on host port 5433 |
| MinIO restarting with code 132 | Already handled: the compose file pins `platform: linux/amd64` for MinIO |
| Port 3000 busy | Change `3000:3000` to `3001:3000` and set `NEXTAUTH_URL` and `LANGFUSE_BASE_URL` to match |
| No traces appear | The script exited before flushing: every notebook calls `flush()` / `force_flush()`; re-run that cell |
| OTel to LangSmith returns 404 | In environment variables use the base `.../otel`; in code use the full `.../otel/v1/traces` |
| Wi-Fi dies | Langfuse is local; only the OpenAI calls need internet. The executed notebooks already contain outputs |

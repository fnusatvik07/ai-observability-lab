<p align="center">
  <img src="notebooks/assets/hero.svg" alt="AI Observability Lab" width="100%">
</p>

<p align="center">
  <b>Trace, measure and debug LLM apps and agents with OpenTelemetry, Langfuse and LangSmith.</b><br>
  Seven hands-on notebooks, a self-hosted stack in one command, and a narrated explainer video.
</p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/python-3.12-2DD4BF?style=flat-square&labelColor=0B1020">
  <img alt="OpenTelemetry" src="https://img.shields.io/badge/OpenTelemetry-GenAI%20semconv-8B5CF6?style=flat-square&labelColor=0B1020">
  <img alt="Langfuse" src="https://img.shields.io/badge/Langfuse-v4%20self--hosted-F59E0B?style=flat-square&labelColor=0B1020">
  <img alt="Docker" src="https://img.shields.io/badge/docker-compose-22D3EE?style=flat-square&labelColor=0B1020">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-94A3B8?style=flat-square&labelColor=0B1020">
</p>

---

## Watch first

<a href="video/out/ai-observability-explained.mp4">
  <img src="docs/assets/video-thumbnail.jpg" alt="Watch the AI Observability explainer" width="100%">
</a>

A four-minute explainer covering why AI systems need observability, logs, metrics, traces and spans, OpenTelemetry, what to measure, and the tool landscape. Captions are in [`video/out/ai-observability-explained.srt`](video/out/ai-observability-explained.srt).

## Quick start

You need **Docker**, **Python 3.12+** (or [uv](https://docs.astral.sh/uv/)), and an **OpenAI API key**.

```bash
git clone https://github.com/fnusatvik07/ai-observability-lab.git
cd ai-observability-lab

make setup        # creates .venv, installs dependencies, registers the Jupyter kernel
# put your OPENAI_API_KEY in .env

make up           # starts Langfuse + an OpenTelemetry Collector, waits until healthy
make lab          # opens JupyterLab on the notebooks
```

Open **http://localhost:3000** and sign in:

| | |
|---|---|
| Email | `admin@observability.lab` |
| Password | `observability123` |
| API keys | `pk-lf-local-demo-public` / `sk-lf-local-demo-secret` |

The user, organization, project and keys are created automatically on first boot. They are local demo credentials; change them in `langfuse/.env` before exposing the stack anywhere.

## The notebooks

Every notebook runs end to end against the local stack and ships with its outputs, so you can read it on GitHub before running anything.

| | Notebook | You will learn |
|---|---|---|
| <img src="notebooks/assets/banner-00.svg" width="220"> | [**00 Setup**](notebooks/00_setup.ipynb) | What each of Langfuse's six containers does, and how to verify the stack and your keys |
| <img src="notebooks/assets/banner-01.svg" width="220"> | [**01 Signals**](notebooks/01_signals.ipynb) | Logs, metrics, traces and spans on one function, with real data and why each one alone is not enough |
| <img src="notebooks/assets/banner-02.svg" width="220"> | [**02 OpenTelemetry**](notebooks/02_opentelemetry.ipynb) | Providers, processors, exporters, `traceparent` propagation, sampling, GenAI semantic conventions, OTLP to Langfuse |
| <img src="notebooks/assets/banner-03.svg" width="220"> | [**03 Langfuse**](notebooks/03_langfuse.ipynb) | `@observe`, the OpenAI drop-in, observation types, sessions, users, errors, guardrails, LLM-as-a-judge, feedback |
| <img src="notebooks/assets/banner-04.svg" width="220"> | [**04 LangSmith**](notebooks/04_langsmith.ipynb) | `@traceable`, `wrap_openai`, run types, threads, feedback, and OTLP into LangSmith |
| <img src="notebooks/assets/banner-05.svg" width="220"> | [**05 Analytics**](notebooks/05_analytics.ipynb) | Latency breakdown, p50 vs p95, cost per request and per month, prompt version comparison, SLO checks |
| <img src="notebooks/assets/banner-06.svg" width="220"> | [**06 Enterprise backends**](notebooks/06_enterprise_backends.ipynb) | An OpenTelemetry Collector that hashes user ids and strips prompts, plus Datadog and Dynatrace configuration |

## How it fits together

<p align="center">
  <img src="notebooks/assets/otel-pipeline.svg" alt="OpenTelemetry pipeline" width="100%">
</p>

The demo application is a small weather agent: it retrieves policy snippets, calls a deliberately flaky weather API, and asks an LLM to answer. The same agent is instrumented three ways, so you can compare them side by side:

| Approach | Where | Backend |
|---|---|---|
| Langfuse SDK (`@observe`, OpenAI drop-in) | notebook 03, `demo/langfuse_demo.py` | Langfuse |
| LangSmith SDK (`@traceable`, `wrap_openai`) | notebook 04, `demo/langsmith_demo.py` | LangSmith |
| Plain OpenTelemetry with GenAI conventions | notebooks 02 and 06, `demo/otel_demo.py` | Any OTLP backend |

<p align="center">
  <img src="notebooks/assets/langfuse-stack.svg" alt="Langfuse self-hosted stack" width="100%">
</p>

## Commands

| Command | What it does |
|---|---|
| `make setup` | Create `.venv`, install `requirements.txt`, register the `ai-observability` kernel |
| `make up` | Start Langfuse and the Collector, wait for health |
| `make lab` | Open JupyterLab |
| `make test` | Execute every notebook top to bottom against the running stack |
| `make demo` | Run the three standalone scripts in `demo/` |
| `make down` | Stop containers, keep data |
| `make reset` | Stop containers and delete all Langfuse data |

## Optional: LangSmith

Notebook 04 runs without a key (tracing is simply off). To send traces, add to `.env`:

```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=ai-observability-lab
```

## Repository layout

```text
.
├── notebooks/          seven notebooks, lab.py helpers, SVG banners and diagrams
├── demo/               the same agent as plain scripts (Langfuse, LangSmith, OpenTelemetry)
├── langfuse/           Docker Compose for self-hosted Langfuse v4 with headless init
├── collector/          OpenTelemetry Collector config: scrub, batch, fan out
├── docs/               session plan, slide content, video script, demo runbook
├── video/              HyperFrames source for the explainer, renders to video/out/
└── scripts/            banner generator
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `port 5432 already in use` | Already handled: Postgres is published on host port `5433` |
| MinIO restarts with exit code `132` on Apple Silicon | Already handled: MinIO runs as `linux/amd64` under Rosetta. On Linux you can remove that line |
| Port 3000 busy | Map `3001:3000` in `langfuse/docker-compose.yml`, then set `NEXTAUTH_URL` and `LANGFUSE_BASE_URL` to `http://localhost:3001` |
| Traces never show up | Short scripts must call `flush()` / `force_flush()` before exiting |
| LangSmith OTLP returns 404 | Environment variables take the base `.../otel`; exporters configured in code take `.../otel/v1/traces` |
| Langfuse API says "not available in v4 events_only mode" | Use the v2 endpoints (`/api/public/v2/observations`), as `notebooks/lab.py` does |

## Rebuilding the video

The explainer is a [HyperFrames](https://hyperframes.dev) project. Narration uses OpenAI `gpt-4o-mini-tts` with the `cedar` voice, and animation is GSAP. See [`video/README.md`](video/README.md) for the full pipeline and [`video/CREDITS.md`](video/CREDITS.md) for every logo, font and music source and license.

```bash
cd video
npx hyperframes preview                                  # edit in the browser
npx hyperframes render -o renders/master.mp4 --fps 30    # render
```

## Further reading

- [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai)
- [Langfuse docs](https://langfuse.com/docs) and [self-hosting guide](https://langfuse.com/self-hosting)
- [LangSmith observability](https://docs.langchain.com/langsmith/observability-quickstart) and [OpenTelemetry ingest](https://docs.langchain.com/langsmith/trace-with-opentelemetry)
- [Datadog LLM Observability](https://docs.datadoghq.com/llm_observability/)
- [Dynatrace OTLP ingest](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/otlp-api)

## License

Code and notebooks are released under the [MIT License](LICENSE). Third-party logos in `video/assets/logos` belong to their owners and are used to identify the products discussed; see `video/CREDITS.md`.

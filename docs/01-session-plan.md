# AI Observability: Foundations (60-minute plan)

**Promise to the audience:** by the end you can open a trace of an AI agent, point at the exact LLM call that failed, and say what it cost and how long it took.

## Run of show

| Time | Block | What happens | Slides |
|---|---|---|---|
| 0:00-0:04 | Hook | "Your agent gave a wrong answer. Why?" Show a single scary chat screenshot, ask the room how they'd debug it. | 1-3 |
| 0:04-0:09 | Video | Play the 5-minute explainer. It front-loads every term so the rest of the session builds on shared vocabulary. | 4 |
| 0:09-0:17 | Why AI needs observability | Traditional apps vs AI apps: non-determinism, multi-step agents, cost per request, quality failures that return HTTP 200. | 5-8 |
| 0:17-0:27 | The four signals | Logs, metrics, traces, spans, all explained through ONE function (`answer_question`). | 9-14 |
| 0:27-0:35 | OpenTelemetry | What OTel is, the pipeline (SDK → exporter → OTLP → collector → backend), GenAI semantic conventions. | 15-19 |
| 0:35-0:40 | What to measure | Latency (TTFT, end-to-end), errors, tokens, cost, quality scores, sessions/users. | 20-22 |
| 0:40-0:55 | **Live demo** | Langfuse on localhost → trace a small agent → same code to LangSmith via OTel → show one Datadog/OTel config. | 23-27 |
| 0:55-0:58 | Tool landscape | LangSmith, Langfuse, Arize Phoenix, Datadog, Dynatrace, Grafana, etc. How to choose. | 28-30 |
| 0:58-1:00 | Wrap + Q&A | Recap, what comes next (evals, prompt management, alerting, production pipelines). | 31-32 |

## Teaching principles for this session
1. **One running example.** Every concept is shown on the same tiny agent: user asks "What's the weather in Paris and should I carry an umbrella?" The agent calls a weather tool and an LLM. Logs, metrics, spans and traces all come from it.
2. **Vocabulary before tools.** Tools all rename the same idea (LangSmith "run", Langfuse "observation", Datadog "span", OTel "span"). Teach the idea once, then map names.
3. **Demo is the payoff.** Keep theory moving so you have a full 15 minutes of screen time.

## Pre-class checklist (do this 60+ min before)
- [ ] Docker Desktop running; `docker compose up -d` in the Langfuse repo; UI loads at http://localhost:3000
- [ ] Langfuse account + project created, API keys copied into `.env`
- [ ] LangSmith account, API key in `.env`, project `ai-observability-demo` exists (auto-created on first trace)
- [ ] `OPENAI_API_KEY` set; run each demo script once so traces already exist (backup if Wi-Fi fails)
- [ ] Screenshots of each UI saved in `backup-screens/` in case live demo fails
- [ ] Video file tested with audio on the presenting machine
- [ ] Browser zoom 125-150%, terminal font 18pt+, notifications off

## Audience questions to expect (and short answers)
- **"Isn't this just logging?"** Logs tell you *what* happened in one place. Traces tell you *how one request moved through every step*, with timing and cost attached.
- **"Does tracing send my prompts to a third party?"** Only if you use a hosted backend. Self-host Langfuse/Phoenix, or mask/redact inputs before export. OTel conventions mark prompt content as opt-in for this reason.
- **"Do I need OpenTelemetry if I use LangSmith/Langfuse SDKs?"** No, but Langfuse's SDK is built on OTel and LangSmith accepts OTLP, so learning OTel means you're never locked into one vendor.
- **"How much overhead?"** Spans are batched and exported in the background. Overhead is usually tiny compared with an LLM call that takes seconds. Remember to `flush()` in short scripts.
- **"Which tool should I pick?"** Prototype/LangChain-heavy → LangSmith. Open source/self-host/data control → Langfuse or Phoenix. Already on an APM vendor → Datadog/Dynatrace LLM Observability, fed by OTel.

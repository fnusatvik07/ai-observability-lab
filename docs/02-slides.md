# AI Observability: Foundations (slide content)

Each slide has **On slide** (what the audience sees; keep it short) and **Say** (speaker notes).

---

## 1. Title
**On slide**
- AI Observability: Foundations
- See inside your LLM apps and agents
- Data Sense

**Say:** Welcome. Building an AI agent is easy now. Knowing why it did what it did is the hard part. Today we fix that.

---

## 2. The question
**On slide**
> Your agent just told a customer the wrong refund policy.
> **Why?**

- Which prompt? Which tool call? Which model? How long? How much did it cost?

**Say:** Ask the room how they'd debug this today. Most will say "print statements" or "check the logs". Hold on to that, because we'll see why that breaks down.

---

## 3. Agenda
**On slide**
1. Why AI systems need observability
2. Logs, metrics, traces and spans
3. OpenTelemetry
4. What to measure: latency, errors, tokens, cost, quality
5. Live demo: Langfuse, LangSmith, OTel
6. The tool landscape

---

## 4. Video: AI Observability in 5 minutes
**On slide:** (embedded video)

**Say:** This gives us shared vocabulary. Everything after builds on it.

---

## 5. What is observability?
**On slide**
- **Monitoring:** "Is it broken?" (known questions, dashboards, alerts)
- **Observability:** "Why is it broken?" (new questions, answered from the data your system emits)
- A system is observable if you can understand its internal state from its outputs

**Say:** Monitoring checks for failures you predicted. Observability lets you investigate failures you didn't predict. For AI, most failures are ones you didn't predict.

---

## 6. Traditional apps vs AI apps
**On slide**

| Traditional app | AI app |
|---|---|
| Same input → same output | Same input → different output |
| Failure = exception / 500 | Failure = confident wrong answer, still HTTP 200 |
| Cost ≈ fixed infra | Cost per request (tokens) |
| Logic in code | Logic in prompts + model + tools |
| Fast, predictable latency | Seconds of latency, highly variable |

**Say:** The biggest line is the second one. An AI app can fail silently. Your uptime dashboard is green while users get hallucinations.

---

## 7. An agent is a chain of decisions
**On slide** (diagram)
```
User → Agent ─┬─ LLM call (plan)
              ├─ Tool: search_docs
              ├─ Tool: get_weather
              ├─ LLM call (answer)
              └─ Guardrail check → Response
```
- 5-20 steps per request, each one a possible failure point

**Say:** When the final answer is wrong, the bug can be in any step. Bad retrieval, a tool that timed out, a prompt that lost context. You need to see every step.

---

## 8. What AI observability answers
**On slide**
- **Debugging:** which step failed, and with what input?
- **Performance:** where did the 8 seconds go?
- **Cost:** which feature/user/model burns the budget?
- **Quality:** are answers getting worse after the prompt change?
- **Safety:** PII leaks, prompt injection, policy violations
- **Product:** what are users actually asking?

---

## 9. The building blocks
**On slide**
- **Logs:** timestamped events ("what happened")
- **Metrics:** numbers over time ("how much / how often")
- **Traces:** the full journey of one request ("where and why")
- **Spans:** one timed step inside a trace

**Say:** Let's make these concrete with one function.

---

## 10. Our running example
**On slide**
```python
def answer_question(question: str) -> str:
    docs = search_docs(question)          # retrieval
    weather = get_weather("Paris")         # tool call
    answer = call_llm(question, docs, weather)  # LLM
    return answer
```
"What's the weather in Paris, and should I carry an umbrella?"

---

## 11. Logs
**On slide**
```text
2026-10-20T19:02:11Z INFO  request received user=u_42
2026-10-20T19:02:11Z INFO  search_docs returned 3 docs
2026-10-20T19:02:12Z WARN  get_weather retry 1/3 (timeout)
2026-10-20T19:02:15Z INFO  llm call model=gpt-4o-mini tokens=812
2026-10-20T19:02:15Z ERROR answer failed JSON parse
```
- Discrete events, rich detail
- **Weakness:** with 1,000 concurrent users, which lines belong to which request?

**Say:** Structured (JSON) logs with a trace_id solve half of that. That's where traces come in.

---

## 12. Metrics
**On slide**
- `llm_requests_total` = 12,430 (counter)
- `llm_latency_seconds` p50 = 1.8s, p95 = 6.2s (histogram)
- `llm_tokens_total{model="gpt-4o-mini"}` = 9.1M
- `llm_cost_usd_daily` = $41.20
- `tool_errors_total{tool="get_weather"}` = 37

- Cheap, aggregated, great for dashboards and alerts
- **Weakness:** tells you p95 got worse, not *which request* or *why*

---

## 13. Traces and spans
**On slide** (waterfall)
```
trace_id = 4bf92f35...                        total 3.9s
└─ answer_question                 [=================] 3.9s
   ├─ search_docs                  [==]               0.3s
   ├─ get_weather                  [=======]          1.4s  ⚠ retry
   └─ call_llm (gpt-4o-mini)            [========]    2.1s  812 tok  $0.0004
```
- **Trace:** one request end to end, one `trace_id`
- **Span:** one step. Has name, start/end time, parent, attributes, status
- Spans nest: parent → children

**Say:** Now look: in one picture you see that the weather tool retried and ate 1.4 seconds, and the LLM call cost a fraction of a cent. That's the power of a trace.

---

## 14. Anatomy of a span
**On slide**
```json
{
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "parent_span_id": "a3ce929d0e0e4736",
  "name": "chat gpt-4o-mini",
  "start": "19:02:13.100", "end": "19:02:15.200",
  "status": "OK",
  "attributes": {
    "gen_ai.operation.name": "chat",
    "gen_ai.provider.name": "openai",
    "gen_ai.request.model": "gpt-4o-mini",
    "gen_ai.usage.input_tokens": 640,
    "gen_ai.usage.output_tokens": 172,
    "gen_ai.response.finish_reasons": ["stop"]
  }
}
```

**Say:** Every tool you'll use stores something shaped like this. Names differ, the shape doesn't.

---

## 15. OpenTelemetry (OTel)
**On slide**
- Open-source, vendor-neutral standard for telemetry (CNCF project)
- Defines: **API + SDKs** (create data), **OTLP** protocol (ship data), **Collector** (process/route data), **Semantic conventions** (name data)
- Instrument once → send anywhere

**Say:** Before OTel, every vendor had its own agent and format. Switching vendors meant re-instrumenting. OTel makes telemetry portable.

---

## 16. How telemetry flows
**On slide**
```
Your app
  └─ OTel SDK (TracerProvider)
       └─ BatchSpanProcessor  (buffers, async)
            └─ OTLP Exporter  (HTTP/gRPC)
                 └─ [optional] OTel Collector  (filter, redact, sample, fan-out)
                      ├─ Langfuse
                      ├─ LangSmith
                      └─ Datadog / Dynatrace / Grafana
```

**Say:** Spans are created in memory, batched, and sent in the background, so your request isn't blocked. The Collector is optional but powerful: it can strip PII and send the same data to two backends.

---

## 17. Creating a span with OTel
**On slide**
```python
from opentelemetry import trace
tracer = trace.get_tracer("weather-agent")

def get_weather(city):
    with tracer.start_as_current_span("execute_tool get_weather") as span:
        span.set_attribute("gen_ai.operation.name", "execute_tool")
        span.set_attribute("gen_ai.tool.name", "get_weather")
        span.set_attribute("city", city)
        return fetch(city)
```
- `start_as_current_span` sets the parent automatically, and that's how nesting works

---

## 18. GenAI semantic conventions
**On slide**
- Shared names for AI telemetry, so every backend understands it
- Operations: `chat`, `embeddings`, `retrieval`, `execute_tool`, `invoke_agent`, `create_agent`, `invoke_workflow`
- Key attributes:
  - `gen_ai.provider.name`, `gen_ai.request.model`, `gen_ai.response.model`
  - `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`
  - `gen_ai.response.finish_reasons`, `error.type`
- Span name: `{operation} {model}` → `chat gpt-4o-mini`
- Prompt/response content is **opt-in** (privacy)
- Status: still *Development*, so names may change. Datadog supports v1.37+

**Say:** Don't memorize these. Know they exist, so when you see `gen_ai.usage.input_tokens` in Datadog or Langfuse you know it's the same field.

---

## 19. Context propagation
**On slide**
- The `trace_id` travels with the request: across functions, threads, and services (W3C `traceparent` header)
- Lets one trace cover: frontend → API → agent service → tool microservice
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

---

## 20. What to measure: performance
**On slide**
- **End-to-end latency:** p50 / p95 / p99, not averages
- **Time to first token (TTFT):** what the user *feels* when streaming
- **Per-step latency:** retrieval vs tools vs LLM
- **Throughput:** requests/min, tokens/sec
- **Errors:** rate limits (429), timeouts, tool failures, parse failures, refusals

---

## 21. What to measure: tokens and cost
**On slide**
- Input tokens, output tokens, cached tokens, reasoning tokens
- Cost = tokens × model price, computed per span, rolled up per trace / user / feature
- Watch for: runaway agent loops, huge context windows, retries multiplying cost
- Example: 10k requests/day × 3k tokens × $0.15/1M = **$4.50/day**. A loop bug × 20 steps = **$90/day**

**Say:** Cost is a first-class signal in AI. A bug in a normal app makes it slow. A bug in an agent makes it expensive.

---

## 22. What to measure: quality and context
**On slide**
- **Scores / feedback:** thumbs up/down, LLM-as-judge, human labels
- **Sessions:** multi-turn conversations grouped together
- **Users:** per-user cost, usage, issues
- **Metadata & tags:** prompt version, release, environment, feature flag
- **Guardrails:** PII detected, injection attempts, policy blocks

**Say:** Tags like prompt version are how you answer "did yesterday's prompt change make things worse?"

---

## 23. Demo plan
**On slide**
1. Run Langfuse locally (Docker)
2. Trace an agent with `@observe` and the OpenAI wrapper
3. Explore: trace tree, latency, tokens, cost, sessions, users
4. Same agent → LangSmith
5. Same agent → any backend with plain OpenTelemetry

---

## 24. Demo 1: Langfuse on localhost
**On slide**
```bash
git clone https://github.com/langfuse/langfuse.git
cd langfuse
docker compose up -d
# open http://localhost:3000 → sign up → create project → API keys
```
- Components: web (UI/API), worker, Postgres, ClickHouse, Redis, MinIO (S3)

---

## 25. Demo 2: Instrument with Langfuse
**On slide**
```python
from langfuse import observe, propagate_attributes
from langfuse.openai import OpenAI   # drop-in wrapper

client = OpenAI()

@observe(as_type="tool")
def get_weather(city): ...

@observe()
def answer_question(q, user_id, session_id):
    with propagate_attributes(user_id=user_id, session_id=session_id):
        w = get_weather("Paris")
        return client.chat.completions.create(...)
```
- Langfuse types: span, generation, agent, tool, chain, retriever, embedding, evaluator, guardrail, event

---

## 26. Demo 3: LangSmith
**On slide**
```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=lsv2_...
export LANGSMITH_PROJECT=ai-observability-demo
```
```python
from langsmith import traceable
from langsmith.wrappers import wrap_openai
client = wrap_openai(OpenAI())

@traceable(run_type="tool")
def get_weather(city): ...
```
- LangSmith terms: **project** → **trace** → **runs** (llm, chain, tool, retriever, prompt, parser); **threads** for conversations; **feedback**, **monitoring dashboards**, **datasets & experiments**

---

## 27. Demo 4: Vendor-neutral OpenTelemetry
**On slide**
```bash
# Langfuse (self-hosted)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:3000/api/public/otel
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <base64(pk:sk)>"

# LangSmith
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.smith.langchain.com/otel
OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<key>,Langsmith-Project=demo"
```
- Same code, change two env vars, different backend

**Say:** This is the slide to remember. Instrument once with OTel and the backend becomes a config choice.

---

## 28. Tool landscape
**On slide**

| Category | Tools | Best for |
|---|---|---|
| LLM-native, hosted | **LangSmith** | LangChain/LangGraph teams, evals + prompt iteration |
| LLM-native, open source | **Langfuse**, **Arize Phoenix**, Opik, Helicone | Self-hosting, data control, cost tracking |
| APM / enterprise | **Datadog LLM Obs**, **Dynatrace**, New Relic, Grafana | Teams already on APM; AI next to infra metrics |
| Instrumentation libs | OpenLLMetry (Traceloop), OpenInference, OTel GenAI instrumentations | Auto-instrument SDKs into OTel |

---

## 29. Datadog and Dynatrace
**On slide**
- **Datadog LLM Observability:** span kinds `llm`, `workflow`, `agent`, `tool`, `task`, `embedding`, `retrieval`; cost/latency dashboards; evaluations; PII & prompt-injection scanning; native OTel GenAI ingest (v1.37+)
```bash
DD_LLMOBS_ENABLED=1 DD_LLMOBS_ML_APP=weather-agent \
DD_API_KEY=... DD_SITE=datadoghq.com ddtrace-run python app.py
```
- **Dynatrace:** AI Observability on top of its APM; ingests OTel/OpenLLMetry traces; links LLM spans to infra, services, and business metrics

**Say:** If your company already pays for one of these, start there. Your AI traces will sit next to your database and Kubernetes metrics.

---

## 30. How to choose
**On slide**
- **Data must stay in-house?** → Self-host Langfuse / Phoenix
- **Heavy LangChain / LangGraph?** → LangSmith
- **Already on Datadog / Dynatrace?** → their LLM module, fed by OTel
- **Unsure?** → Instrument with OTel, try 2 backends, keep the one your team actually opens

---

## 31. Recap
**On slide**
- AI fails silently, so observe every step, not just uptime
- Logs = events, metrics = numbers, traces = journey, spans = steps
- OTel = instrument once, export anywhere; GenAI conventions name the fields
- Measure latency, errors, tokens, cost, and quality, and tag by user, session, and version
- Tools differ in names, not concepts

---

## 32. Next up + Q&A
**On slide**
- Coming next: evaluations (LLM-as-judge), prompt management & versioning, alerts & dashboards, production pipelines with the OTel Collector
- Questions?

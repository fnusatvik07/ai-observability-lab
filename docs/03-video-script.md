# Video: "AI Observability in 5 Minutes" (narration script)

- **Length target:** ~5:00 (about 720 words at about 145 wpm)
- **Voice:** OpenAI `gpt-4o-mini-tts`, voice `cedar`
- **TTS instructions (style prompt):** "Warm, confident technical educator. Clear and unhurried. Slight emphasis on key terms. Short pauses between sections. Not salesy."
- **Format:** 1920×1080, faceless explainer (typography, diagrams, animated trace waterfall), built with HyperFrames

---

### Scene 1: Hook (0:00-0:25)
**Visual:** Chat bubble: "Can I get a refund after 60 days?" → Agent: "Yes, anytime!" A red stamp: WRONG. Then a green dashboard: "Uptime 100%".

**Narration:**
Your AI agent just told a customer they can get a refund anytime. That's wrong. Your policy says thirty days. But your dashboard is green. No errors. No crashes. Just a confident, wrong answer. So how do you find out *why* it happened? That's what AI observability is for.

### Scene 2: What observability means (0:25-0:55)
**Visual:** Two cards: MONITORING ("Is it broken?") and OBSERVABILITY ("Why is it broken?"). Then a glass box with gears inside.

**Narration:**
Monitoring tells you *whether* something is broken. Observability tells you *why*. A system is observable when you can understand what's happening inside it just from the data it emits. For traditional software, that was already important. For AI, it's essential.

### Scene 3: Why AI is different (0:55-1:35)
**Visual:** Three icons appear one by one: dice (non-deterministic), branching path (multi-step agent), coin stack (cost per request).

**Narration:**
AI systems break the old rules in three ways. First, they're non-deterministic. The same question can produce a different answer every time. Second, agents are chains of decisions. One request might plan, search documents, call two tools, and call the model three times. A mistake anywhere ruins the final answer. And third, every request costs money, measured in tokens. A bug in a normal app makes it slow. A bug in an agent can make it expensive.

### Scene 4: The four signals (1:35-2:40)
**Visual:** Running example code: `answer_question()` → `search_docs` → `get_weather` → `call_llm`. Then each signal animates in:
- Logs: scrolling timestamped lines
- Metrics: line chart with p95 latency, a cost counter ticking up
- Trace: waterfall bars nesting under one root bar
- Span: zoom into one bar showing name, duration, model, tokens

**Narration:**
Observability is built on four ideas. Let's use one simple agent. It answers, "What's the weather in Paris, and do I need an umbrella?"
**Logs** are timestamped events. "Request received." "Weather tool timed out, retrying." Great detail, but with thousands of users, it's hard to know which lines belong together.
**Metrics** are numbers over time. Requests per minute. Ninety-fifth percentile latency. Tokens used. Dollars spent today. Perfect for dashboards and alerts, but they tell you *that* something changed, not *which* request.
**Traces** connect it all. A trace follows one request from start to finish, under a single trace ID.
And each step inside a trace is a **span**. The document search is a span. The weather tool is a span. The model call is a span, with its model name, input and output tokens, cost, and how long it took. Spans nest inside each other, so you see the whole tree.

### Scene 5: OpenTelemetry (2:40-3:30)
**Visual:** Pipeline diagram animates left to right: App → OTel SDK → OTLP → Collector → three logos/labels (Langfuse, LangSmith, Datadog). Then a span card with `gen_ai.request.model`, `gen_ai.usage.input_tokens`.

**Narration:**
So how does this data get out of your app? Through **OpenTelemetry**, or OTel. It's an open, vendor-neutral standard. Your code uses the OTel SDK to create spans. They're batched in the background and sent using a protocol called OTLP, either straight to a backend or through an optional Collector that can filter, redact, and route them.
For AI, OTel adds **GenAI semantic conventions**. These are shared names like `gen_ai.request.model` and `gen_ai.usage.input_tokens`, so every tool understands your data the same way. Instrument once, and send it anywhere.

### Scene 6: What to watch (3:30-4:10)
**Visual:** Five tiles light up: LATENCY (p95, time to first token) · ERRORS (timeouts, rate limits) · TOKENS · COST · QUALITY (scores, feedback). Under them: tags "user", "session", "prompt v3".

**Narration:**
What should you actually watch? **Latency**: not the average, but p95, and time to first token, which is what users feel. **Errors**: rate limits, timeouts, failed tools. **Tokens and cost**, per request, per user, per feature. And **quality**, from user feedback or automated evaluations. Tag everything with the user, the session, and the prompt version, so you can answer: "Did yesterday's change make things worse?"

### Scene 7: The tools (4:10-4:40)
**Visual:** Three columns: LLM-native (LangSmith, Langfuse, Arize Phoenix) · Enterprise APM (Datadog, Dynatrace, Grafana) · Standard underneath: OpenTelemetry.

**Narration:**
There are great tools for this. LangSmith and Langfuse are built for LLM apps. Langfuse is open source and you can run it on your laptop. Datadog and Dynatrace put AI traces right next to your infrastructure. They use different words, like runs, observations, and spans, but they share the same ideas, and increasingly, the same OpenTelemetry foundation.

### Scene 8: Close (4:40-5:00)
**Visual:** Return to the wrong refund answer. Click it, and the trace opens. The retrieval span is highlighted: "Retrieved: refund_policy_2023.pdf (outdated)". Fade to: "See every step."

**Narration:**
Back to our wrong refund answer. With a trace, you open it and see it in seconds. The retrieval step pulled an outdated policy document. No guessing. That's AI observability. You can see every step, every token, and every decision.

---

**Word count check:** about 730 words of narration. If the TTS output runs long, trim Scene 3's last sentence and Scene 7's last sentence first.

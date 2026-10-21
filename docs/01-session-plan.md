# Session plan: AI Observability Foundations (60 minutes)

**Who it is for:** people who build with LLMs but have never heard the words *trace*, *span* or *telemetry*.

**What they leave with:** they can explain logs, metrics, traces and spans in plain words, they have seen a real trace in Langfuse and LangSmith, and they know that other tools exist and how to choose one.

**The one sentence to repeat all session:** *a trace is the story of one request, and spans are its steps.*

## Materials

| What | Where |
|---|---|
| Slides, 32 in total, with speaker notes and the embedded video | `slides/AI-Observability.pptx` |
| Handout version | `slides/AI-Observability.pdf` |
| Notebooks you run live | `notebooks/01` to `04` |
| Optional deep dives, not for tonight | `notebooks/advanced/` |

## Run of show

| Time | Block | Slides | Screen | What you do |
|---|---|---|---|---|
| 0:00 to 0:05 | **Hook** | 1 to 3 | Slides | Show the wrong refund answer (slide 2). Ask the room: *"How would you find out why?"* Take 2 or 3 answers. |
| 0:05 to 0:10 | **Video** | 4 | Slides | Play the 4 minute overview. It gives everyone the vocabulary. |
| 0:10 to 0:15 | **Why AI is different** | 5 to 7 | Slides | Stress slide 7, row "When it fails": an AI app fails *without an error*. |
| 0:15 to 0:28 | **The four signals** | 8 to 12, then notebook 01 | Slides, then JupyterLab | Slide 8 (parcel tracking) is the most important slide of the night. Then run **notebook 01** down to the trace picture. Ask: *"Which step was slow?"* |
| 0:28 to 0:35 | **OpenTelemetry** | 13 to 16, notebook 01 "What did those four lines do?" | Slides and JupyterLab | Slide 14 explains provider, tracer, span processor, exporter and collector with the courier comparison. Show the `ConsoleSpanExporter` cell printing a span. |
| 0:35 to 0:38 | **What to measure** | 17, 18 | Slides | Move fast. One story: a friendlier prompt doubled the bill. |
| 0:38 to 0:50 | **Langfuse, live** | 19 to 23, then notebook 02 | Slides, JupyterLab, browser | Slide 21 shows the five setup steps: install Docker, download Langfuse, start it, create the admin account, create API keys. Tonight `make up` already did it. Run **notebook 02**, point at the two `# NEW` lines, then open http://localhost:3000, **Tracing**, newest trace, click each row. |
| 0:50 to 0:54 | **LangSmith** | 24 to 26, notebook 03 | Slides and JupyterLab | `@observe()` becomes `@traceable`. Slide 26: same ideas, different words. |
| 0:54 to 0:58 | **Other tools** | 27 to 30, notebook 04 | Slides and JupyterLab | Run **notebook 04**: plain OpenTelemetry lands in Langfuse with zero Langfuse code. Then the landscape and the decision table. |
| 0:58 to 1:00 | **Recap and Q&A** | 31, 32 | Slides | Read the four points on slide 31 aloud. Share the repo link. |

**If you are running late:** skip slides 6, 15 and 17, and show notebook 04 only as slides 28 to 30.

**If you are early:** open `notebooks/advanced/03_langfuse_in_depth.ipynb` and show sessions, users and scores in the Langfuse UI.

## The OpenTelemetry pieces in one breath

*"The **tracer provider** is the courier company. The **tracer** is the clerk who writes tracking entries: it creates spans. The **span processor** is the mailroom: it decides **when** to send, one at a time (Simple) or in batches (Batch, for real apps, which is why short scripts call `flush()`). The **exporter** is the truck: it decides **where** spans go: the console, memory, or over the network with OTLP to Langfuse, LangSmith or Datadog. A **collector** is an optional sorting hub, a separate program such as the OpenTelemetry Collector, Grafana Alloy or the Datadog Agent, that receives spans from many apps, cleans them, and forwards them."*

## How to teach it

- **Definitions before tools.** Nobody should see Langfuse before they can say what a span is. Notebook 01 exists for this.
- **One function the whole night.** `weather_assistant(city)` calls `get_weather` and then `ask_ai`. Every notebook uses exactly this function, so the only new thing in each notebook is the tool.
- **Ask, then show.** Before each trace picture ask *"Which step do you think is slower?"* People remember answers they guessed first.
- **Translate words, every time.** Whenever a tool says *observation*, *run* or *generation*, say "that is a span" out loud. Slide 30 has the table.
- **Keep code on screen short.** In notebooks 02 and 03, scroll to the `# NEW` lines and stop there. The rest is the code they already saw.
- **Do not explain every container.** For Langfuse it is enough to say: "it is a website and a database running on my laptop".

## Questions you will probably get

| Question | Short answer |
|---|---|
| Isn't this just logging? | Logs are single messages. A trace connects every step of one request, with timing and cost. |
| Does this send my prompts somewhere? | Only to the tool you choose. Langfuse can run on your own machine, as tonight. |
| Does tracing slow my app down? | Barely. Spans are sent in the background. The AI call itself takes far longer. |
| Which tool should I use? | Langfuse to learn and self-host, LangSmith if you use LangChain, Datadog or Dynatrace if your company already has them. |
| What is OpenTelemetry, in one line? | The common standard for this data, so you can switch tools without rewriting code. |

## Checklist, one hour before

- [ ] Docker Desktop running, then `make up`. http://localhost:3000 loads and the demo login works
- [ ] `make test`: all notebooks pass (this also fills Langfuse with example traces)
- [ ] LangSmith key in `.env` if you want to show notebook 03 live; otherwise show the code and the vocabulary table
- [ ] Open the deck in PowerPoint and test the video on slide 4 with sound
- [ ] JupyterLab open on `notebooks/`, browser tab open on Langfuse **Tracing**
- [ ] Font sizes up: browser zoom 125%, JupyterLab `Cmd +` twice
- [ ] Notifications off

# Session plan: AI Observability Foundations (60 minutes)

**Who it is for:** people who build with LLMs but have never heard the words *trace*, *span* or *telemetry*.

**What they leave with:** they can explain logs, metrics, traces and spans in plain words, they have seen a real trace in Langfuse and LangSmith, and they know that other tools exist and how to choose one.

**The one sentence to repeat all session:** *a trace is the story of one request, and spans are its steps.*

## Materials

| What | Where |
|---|---|
| Slides (with speaker notes and the embedded video) | `slides/AI-Observability.pptx` |
| Handout version | `slides/AI-Observability.pdf` |
| Notebooks you run live | `notebooks/01` to `04` |
| Optional deep dives, not for tonight | `notebooks/advanced/` |

## Run of show

| Time | Block | Slides | Screen | What you do |
|---|---|---|---|---|
| 0:00 to 0:05 | **Hook** | 1 to 3 | Slides | Show the wrong refund answer (slide 2). Ask the room: *"How would you find out why?"* Take 2 or 3 answers. |
| 0:05 to 0:10 | **Video** | 4 | Slides | Play the 4 minute explainer. It gives everyone the vocabulary. |
| 0:10 to 0:16 | **Why AI is different** | 5 to 9 | Slides | Stress slide 7, row 2: an AI app fails *without an error*. That is why classic monitoring is not enough. |
| 0:16 to 0:30 | **The four signals** | 10 to 16, then notebook 01 | Slides, then JupyterLab | Use the parcel tracking comparison: log = driver note, metric = parcels per day, trace = your parcel's history, span = one line of it. Then run **notebook 01** top to bottom and stop at the trace picture. Ask: *"Which step was slow?"* |
| 0:30 to 0:36 | **OpenTelemetry** | 17 to 20 | Slides | One idea only: OpenTelemetry is the common language, so you are not locked into a tool. Slide 20 shows the same `with` blocks they just ran. |
| 0:36 to 0:40 | **What to measure** | 21 to 24 | Slides | Move fast. The one story to tell: slide 23, a friendlier prompt doubled the bill. |
| 0:40 to 0:50 | **Langfuse, live** | 25 to 29, then notebook 02 | JupyterLab and browser | Run **notebook 02**. Point at the two `# NEW` lines. Then switch to http://localhost:3000, open **Tracing**, click the newest trace, and click each row. Finish on the `OpenAI-generation` row: prompt, tokens, cost. |
| 0:50 to 0:54 | **LangSmith** | 30, then notebook 03 | JupyterLab and browser | Show that the code is almost identical: `@observe()` becomes `@traceable`. Show the vocabulary table: same ideas, different words. |
| 0:54 to 0:58 | **Other tools** | 31 to 35, notebook 04 | Slides and JupyterLab | Run **notebook 04**: plain OpenTelemetry lands in Langfuse with zero Langfuse code. Then the landscape and the decision guide. |
| 0:58 to 1:00 | **Recap and Q&A** | 36, 37 | Slides | Read the five points on slide 36 aloud. Share the repo link. |

**If you are running late:** skip slides 6, 9, 16 and 24, and show notebook 04 only as slides 31 to 35.

**If you are early:** open `notebooks/advanced/03_langfuse_in_depth.ipynb` and show sessions, users and scores in the Langfuse UI.

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

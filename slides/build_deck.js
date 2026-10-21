// Builds slides/AI-Observability.pptx. Run: node slides/build_deck.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");

const A = (f) => path.join(__dirname, "assets", f);
const VIDEO = path.join(__dirname, "..", "video", "out", "ai-observability-explained.mp4");
const REPO = "github.com/fnusatvik07/ai-observability-lab";

const W = 13.333, H = 7.5, M = 0.6;
const C = {
  bg: "0B1020", panel: "141A31", panel2: "1B2340", line: "2A3456",
  text: "F8FAFC", body: "CBD5E1", muted: "8A97B0",
  teal: "2DD4BF", amber: "F5B53F", violet: "8B5CF6", cyan: "22D3EE",
  rose: "F43F5E", pink: "F472B6", lime: "A3E635",
};
const F = { head: "Georgia", body: "Calibri", mono: "Consolas" };

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Data Sense";
pres.title = "AI Observability: Foundations";

let n = 0;

// ---------------------------------------------------------------- building blocks

function motif(s, x, y, k = 1) {
  const bars = [[0, 1, C.violet], [0.04, 0.22, C.cyan], [0.27, 0.36, C.amber], [0.64, 0.34, C.teal]];
  bars.forEach(([start, width, color], i) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + start * 1.5 * k, y: y + i * 0.13 * k, w: width * 1.5 * k, h: 0.07 * k,
      fill: { color }, line: { color, width: 0 }, rectRadius: 0.03,
    })
  );
}

function base(s, { footer = true } = {}) {
  n += 1;
  s.background = { color: C.bg };
  if (!footer) return;
  motif(s, W - M - 1.5, 0.42, 0.75);
  s.addText("AI OBSERVABILITY", {
    x: M, y: H - 0.48, w: 4, h: 0.3, fontFace: F.body, fontSize: 9, bold: true,
    color: C.muted, charSpacing: 3, margin: 0,
  });
  s.addText(String(n).padStart(2, "0"), {
    x: W - M - 1, y: H - 0.48, w: 1, h: 0.3, fontFace: F.mono, fontSize: 10,
    color: C.muted, align: "right", margin: 0,
  });
}

function head(s, kicker, title, sub) {
  s.addText(kicker.toUpperCase(), {
    x: M, y: 0.45, w: 9, h: 0.3, fontFace: F.body, fontSize: 11, bold: true,
    color: C.teal, charSpacing: 4, margin: 0,
  });
  s.addText(title, {
    x: M, y: 0.78, w: W - 2 * M - 1.8, h: 0.75, fontFace: F.head, fontSize: 32, bold: true,
    color: C.text, margin: 0, valign: "top",
  });
  if (sub) {
    s.addText(sub, {
      x: M, y: 1.5, w: W - 2 * M, h: 0.4, fontFace: F.body, fontSize: 15, color: C.muted, margin: 0,
    });
  }
}

function card(s, x, y, w, h, accent, fill = C.panel) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: C.line, width: 0.75 } });
  if (accent) s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h, fill: { color: accent }, line: { color: accent, width: 0 } });
}

function text(s, str, opts) {
  s.addText(str, { fontFace: F.body, fontSize: 15, color: C.body, margin: 0, valign: "top", ...opts });
}

function code(s, x, y, w, h, lines, size = 13) {
  card(s, x, y, w, h, null, "0F1428");
  const runs = [];
  lines.forEach((line, i) => {
    const parts = Array.isArray(line) ? line : [[line, C.body]];
    parts.forEach(([t, color], j) =>
      runs.push({ text: t, options: { color, breakLine: j === parts.length - 1 && i < lines.length - 1 } })
    );
  });
  s.addText(runs, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h - 0.4, fontFace: F.mono, fontSize: size, valign: "top", margin: 0, paraSpaceAfter: 2 });
}

function chip(s, x, y, label, color, w) {
  const width = w || 0.2 + label.length * 0.095;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: width, h: 0.36, fill: { color: C.panel2 }, line: { color, width: 1 }, rectRadius: 0.18,
  });
  s.addText(label, { x, y, w: width, h: 0.36, fontFace: F.mono, fontSize: 11, color, align: "center", valign: "middle", margin: 0 });
  return width;
}

function divider(num, title, sub, notes) {
  const s = pres.addSlide();
  base(s, { footer: false });
  s.addText(num, { x: M, y: 1.6, w: 4, h: 1.6, fontFace: F.head, fontSize: 110, bold: true, color: C.panel2, margin: 0 });
  s.addText(title, { x: M, y: 3.25, w: 9, h: 0.9, fontFace: F.head, fontSize: 44, bold: true, color: C.text, margin: 0 });
  s.addText(sub, { x: M, y: 4.2, w: 9, h: 0.5, fontFace: F.body, fontSize: 18, color: C.muted, margin: 0 });
  motif(s, W - M - 3.6, 1.0, 2.4);
  s.addNotes(notes);
  return s;
}

function img(s, file, x, y, w, ratio) {
  s.addImage({ path: A(file), x, y, w, h: w / ratio });
}

// ---------------------------------------------------------------- slides

async function build() {
  const ic = {};
  const want = {
    bug: [fa.FaBug, C.rose], gauge: [fa.FaGaugeHigh, C.amber], coins: [fa.FaCoins, C.amber],
    star: [fa.FaStar, C.teal], shield: [fa.FaShieldHalved, C.violet], users: [fa.FaUsers, C.cyan],
    list: [fa.FaListUl, C.cyan], chart: [fa.FaChartLine, C.amber], sitemap: [fa.FaSitemap, C.violet],
    square: [fa.FaSquare, C.teal], dice: [fa.FaDice, C.cyan], route: [fa.FaRoute, C.violet],
    dollar: [fa.FaDollarSign, C.amber], comments: [fa.FaComments, C.cyan], tag: [fa.FaTags, C.violet],
    thumbs: [fa.FaThumbsUp, C.teal], user: [fa.FaUser, C.cyan], lock: [fa.FaLock, C.rose],
    github: [fa.FaGithub, C.text], play: [fa.FaPlay, C.bg], check: [fa.FaCircleCheck, C.teal],
    clock: [fa.FaClock, C.amber], plug: [fa.FaPlug, C.violet], paper: [fa.FaPaperPlane, C.amber],
    filter: [fa.FaFilter, C.teal], book: [fa.FaBookOpen, C.cyan],
  };
  for (const [k, [Comp, color]] of Object.entries(want)) ic[k] = await icon(Comp, color);

  // 1. Title ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s, { footer: false });
    s.addText("DATA SENSE  ·  AI DISCUSSIONS", { x: M, y: 1.5, w: 8, h: 0.35, fontFace: F.body, fontSize: 13, bold: true, color: C.teal, charSpacing: 5, margin: 0 });
    s.addText("AI Observability", { x: M, y: 2.0, w: 8.5, h: 1.3, fontFace: F.head, fontSize: 66, bold: true, color: C.text, margin: 0 });
    s.addText("Foundations", { x: M, y: 3.25, w: 8.5, h: 0.9, fontFace: F.head, fontSize: 44, italic: true, color: C.amber, margin: 0 });
    s.addText("See inside your LLM apps and agents: every step, every token, every decision.", { x: M, y: 4.45, w: 7.4, h: 0.8, fontFace: F.body, fontSize: 18, color: C.body, margin: 0 });
    s.addText("Tuesday, October 20, 2026  ·  7:00 PM PT", { x: M, y: 6.3, w: 6, h: 0.35, fontFace: F.mono, fontSize: 12, color: C.muted, margin: 0 });
    motif(s, 8.9, 2.3, 2.6);
    s.addNotes("Welcome. Building an AI agent is easy now. Knowing why it did what it did is the hard part. Tonight we fix that: by the end you will be able to open a trace of an agent, point at the step that failed, and say what it cost and how long it took.");
  }

  // 2. The question ---------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Start with a failure", "Your agent just gave a wrong answer. Why?");
    card(s, M, 2.0, 5.6, 3.9, null);
    text(s, "CUSTOMER", { x: M + 0.35, y: 2.3, w: 3, h: 0.3, fontSize: 10, bold: true, color: C.muted, charSpacing: 3 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.35, y: 2.65, w: 4.6, h: 0.75, fill: { color: C.panel2 }, line: { color: C.line, width: 0.75 }, rectRadius: 0.12 });
    text(s, "Can I get a refund after 60 days?", { x: M + 0.55, y: 2.65, w: 4.3, h: 0.75, fontSize: 16, color: C.text, valign: "middle" });
    text(s, "AGENT", { x: M + 0.35, y: 3.65, w: 3, h: 0.3, fontSize: 10, bold: true, color: C.muted, charSpacing: 3 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.35, y: 4.0, w: 4.6, h: 0.75, fill: { color: "2A1220" }, line: { color: C.rose, width: 1.25 }, rectRadius: 0.12 });
    text(s, "Yes! Refunds are available anytime.", { x: M + 0.55, y: 4.0, w: 4.3, h: 0.75, fontSize: 16, color: C.text, valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 3.75, y: 4.95, w: 1.2, h: 0.4, fill: { color: C.rose }, line: { color: C.rose, width: 0 }, rectRadius: 0.06 });
    text(s, "WRONG", { x: M + 3.75, y: 4.95, w: 1.2, h: 0.4, fontSize: 12, bold: true, color: C.bg, align: "center", valign: "middle", charSpacing: 3 });
    text(s, "Policy says 30 days. Uptime dashboard: 100% green.", { x: M + 0.35, y: 5.45, w: 5, h: 0.3, fontSize: 12, color: C.muted, italic: true });

    const qs = [["Which prompt was sent?", ic.list], ["Which tool returned what?", ic.plug], ["Which model, which version?", ic.route], ["How long did each step take?", ic.clock], ["What did it cost?", ic.coins]];
    qs.forEach(([q, i], k) => {
      const y = 2.05 + k * 0.78;
      s.addImage({ data: i, x: 7.05, y: y + 0.08, w: 0.36, h: 0.36 });
      text(s, q, { x: 7.65, y, w: 5, h: 0.55, fontSize: 19, color: C.text, valign: "middle" });
    });
    s.addNotes("Ask the room: how would you debug this today? Most people say print statements or check the logs. Hold on to that answer. The dashboard is green because nothing crashed. AI systems fail by being confidently wrong, and that is invisible to classic monitoring.");
  }

  // 3. Agenda ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Tonight", "Six parts, one running example");
    const items = [
      ["01", "Why AI needs observability", "Non-determinism, agents, cost, silent failures", C.teal],
      ["02", "The four signals", "Logs, metrics, traces and spans on one function", C.cyan],
      ["03", "OpenTelemetry", "The open standard, the pipeline, GenAI conventions", C.violet],
      ["04", "What to measure", "Latency, errors, tokens, cost, quality", C.amber],
      ["05", "Hands-on", "Langfuse on localhost, LangSmith, plain OTel", C.pink],
      ["06", "The landscape", "Datadog, Dynatrace and how to choose", C.lime],
    ];
    items.forEach(([num, t, d, color], i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = M + col * 4.1, y = 2.0 + row * 2.3, w = 3.85, h = 2.05;
      card(s, x, y, w, h, color);
      s.addText(num, { x: x + 0.35, y: y + 0.25, w: 1.2, h: 0.55, fontFace: F.head, fontSize: 28, bold: true, color, margin: 0 });
      text(s, t, { x: x + 0.35, y: y + 0.85, w: w - 0.6, h: 0.45, fontSize: 18, bold: true, color: C.text });
      text(s, d, { x: x + 0.35, y: y + 1.3, w: w - 0.6, h: 0.6, fontSize: 13, color: C.muted });
    });
    s.addNotes("Theory moves quickly so the hands-on part gets a full fifteen minutes. One running example throughout: a weather assistant that calls a document search, a weather API and an LLM.");
  }

  // 4. Video ----------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Four minutes", "AI observability, explained");
    if (process.env.NO_VIDEO) s.addImage({ path: A("video-thumbnail.jpg"), x: (W - 9.2) / 2, y: 1.65, w: 9.2, h: 5.175 });
    else s.addMedia({ type: "video", path: VIDEO, cover: "data:image/jpeg;base64," + require("fs").readFileSync(A("video-thumbnail.jpg")).toString("base64"), x: (W - 9.2) / 2, y: 1.65, w: 9.2, h: 5.175 });
    s.addNotes("Play the explainer video (click to play in slideshow mode). It front-loads every term, so the rest of the session builds on shared vocabulary.");
  }

  // 5. Divider ---------------------------------------------------------------
  divider("01", "Why AI needs observability", "Monitoring tells you that. Observability tells you why.", "Section one: why AI systems need a different approach.");

  // 6. Monitoring vs observability ----------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Two different questions", "Monitoring vs observability");
    const cols = [
      ["MONITORING", "Is it broken?", ["Known questions, decided in advance", "Dashboards and threshold alerts", "Great for failures you predicted"], C.cyan],
      ["OBSERVABILITY", "Why is it broken?", ["New questions, asked after the fact", "Answered from data the system emits", "Built for failures you did not predict"], C.amber],
    ];
    cols.forEach(([k, q, pts, color], i) => {
      const x = M + i * 6.15, w = 5.9;
      card(s, x, 2.0, w, 4.4, color);
      text(s, k, { x: x + 0.45, y: 2.35, w: 4, h: 0.3, fontSize: 12, bold: true, color, charSpacing: 4 });
      s.addText(q, { x: x + 0.45, y: 2.75, w: w - 0.8, h: 0.9, fontFace: F.head, fontSize: 34, italic: true, color: C.text, margin: 0 });
      s.addText(pts.map((p, j) => ({ text: p, options: { bullet: { indent: 18 }, breakLine: j < pts.length - 1 } })), {
        x: x + 0.45, y: 3.9, w: w - 0.8, h: 2.2, fontFace: F.body, fontSize: 17, color: C.body, paraSpaceAfter: 10, valign: "top", margin: 0,
      });
    });
    s.addNotes("Monitoring checks for failures you predicted. Observability lets you investigate failures you did not predict. A system is observable when you can understand its internal state from its outputs. For AI, most failures are ones nobody predicted.");
  }

  // 7. Traditional vs AI ------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "The rules changed", "Traditional apps vs AI apps");
    const rows = [
      [ic.dice, "Same input, same output", "Same input, different output"],
      [ic.bug, "Failure is an exception or a 500", "Failure is a confident wrong answer with HTTP 200"],
      [ic.coins, "Cost is roughly fixed infrastructure", "Every request costs money, measured in tokens"],
      [ic.route, "Logic lives in code", "Logic lives in prompts, models and tools"],
      [ic.clock, "Milliseconds, predictable", "Seconds, highly variable"],
    ];
    text(s, "TRADITIONAL APP", { x: 1.45, y: 1.85, w: 4, h: 0.3, fontSize: 11, bold: true, color: C.muted, charSpacing: 3 });
    text(s, "AI APP", { x: 6.95, y: 1.85, w: 4, h: 0.3, fontSize: 11, bold: true, color: C.amber, charSpacing: 3 });
    rows.forEach(([i, a, b], k) => {
      const y = 2.25 + k * 0.88;
      card(s, M, y, W - 2 * M, 0.74, k === 1 ? C.rose : null);
      s.addImage({ data: i, x: M + 0.3, y: y + 0.2, w: 0.34, h: 0.34 });
      text(s, a, { x: 1.45, y, w: 5.2, h: 0.74, fontSize: 16, color: C.muted, valign: "middle" });
      text(s, b, { x: 6.95, y, w: 5.6, h: 0.74, fontSize: 16, bold: true, color: C.text, valign: "middle" });
    });
    s.addNotes("The biggest line is the second one. An AI app can fail silently: your uptime dashboard is green while users get hallucinations. And the third line: a bug in a normal app makes it slow; a bug in an agent makes it expensive.");
  }

  // 8. Agent chain ------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Where things go wrong", "An agent is a chain of decisions", "Five to twenty steps per request. Any one of them can ruin the final answer.");
    const steps = [["User", C.muted], ["Plan", C.violet], ["search_docs", C.cyan], ["get_weather", C.amber], ["LLM answer", C.teal], ["Guardrail", C.pink], ["Response", C.muted]];
    const bw = 1.48, gap = 0.27, y = 3.2;
    steps.forEach(([label, color], i) => {
      const x = M + i * (bw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: bw, h: 1.0, fill: { color: C.panel }, line: { color, width: 1.5 }, rectRadius: 0.1 });
      text(s, label, { x, y, w: bw, h: 1.0, fontFace: F.mono, fontSize: 13, color: C.text, align: "center", valign: "middle" });
      if (i < steps.length - 1)
        s.addShape(pres.shapes.LINE, { x: x + bw + 0.03, y: y + 0.5, w: gap - 0.06, h: 0, line: { color: C.muted, width: 1.5, endArrowType: "triangle" } });
    });
    const fails = [["Wrong or outdated document", 2], ["Timeout, retries, bad data", 3], ["Hallucination, lost context", 4]];
    fails.forEach(([f, idx]) => {
      const x = M + idx * (bw + gap);
      s.addShape(pres.shapes.LINE, { x: x + bw / 2, y: y + 1.05, w: 0, h: 0.55, line: { color: C.rose, width: 1, dashType: "dash" } });
      text(s, f, { x: x - 0.25, y: y + 1.7, w: bw + 0.5, h: 0.7, fontSize: 12, color: C.rose, align: "center" });
    });
    s.addNotes("When the final answer is wrong, the bug can be in any step: bad retrieval, a tool that timed out and returned stale data, a prompt that lost context. You need to see every step, with its input and output, to know which one.");
  }

  // 9. What it answers ----------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Six questions", "What AI observability answers");
    const items = [
      [ic.bug, "Debugging", "Which step failed, and with what input?"],
      [ic.gauge, "Performance", "Where did the eight seconds go?"],
      [ic.coins, "Cost", "Which feature, user or model burns the budget?"],
      [ic.star, "Quality", "Did answers get worse after the prompt change?"],
      [ic.shield, "Safety", "PII leaks, prompt injection, policy violations"],
      [ic.users, "Product", "What are users actually asking for?"],
    ];
    items.forEach(([i, t, d], k) => {
      const col = k % 3, row = Math.floor(k / 3);
      const x = M + col * 4.1, y = 2.0 + row * 2.3, w = 3.85, h = 2.05;
      card(s, x, y, w, h, null);
      s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: y + 0.32, w: 0.62, h: 0.62, fill: { color: C.panel2 }, line: { color: C.line, width: 0.75 } });
      s.addImage({ data: i, x: x + 0.5, y: y + 0.47, w: 0.32, h: 0.32 });
      text(s, t, { x: x + 0.35, y: y + 1.08, w: w - 0.6, h: 0.4, fontSize: 18, bold: true, color: C.text });
      text(s, d, { x: x + 0.35, y: y + 1.45, w: w - 0.6, h: 0.55, fontSize: 13, color: C.muted });
    });
    s.addNotes("These six questions are the job description of an AI observability tool. Keep them in mind when we look at Langfuse and LangSmith: every feature maps to one of them.");
  }

  // 10. Divider ---------------------------------------------------------------
  divider("02", "The four signals", "Logs, metrics, traces and spans, on one function.", "Section two: the building blocks. We use one function for all of them.");

  // 11. Building blocks -----------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Vocabulary", "Four signals, four questions");
    const items = [
      [ic.list, "Logs", "What happened?", "Timestamped events with rich detail", C.cyan],
      [ic.chart, "Metrics", "How much, how often?", "Numbers aggregated over time", C.amber],
      [ic.sitemap, "Traces", "Where, and why?", "The full journey of one request", C.violet],
      [ic.square, "Spans", "Which step?", "One timed operation inside a trace", C.teal],
    ];
    items.forEach(([i, t, q, d, color], k) => {
      const x = M + k * 3.07, w = 2.85;
      card(s, x, 2.0, w, 4.3, color);
      s.addImage({ data: i, x: x + 0.4, y: 2.4, w: 0.5, h: 0.5 });
      s.addText(t, { x: x + 0.4, y: 3.15, w: w - 0.6, h: 0.6, fontFace: F.head, fontSize: 28, bold: true, color: C.text, margin: 0 });
      s.addText(q, { x: x + 0.4, y: 3.8, w: w - 0.6, h: 0.5, fontFace: F.head, fontSize: 17, italic: true, color, margin: 0 });
      text(s, d, { x: x + 0.4, y: 4.45, w: w - 0.65, h: 1.2, fontSize: 15, color: C.body });
    });
    s.addNotes("Logs answer what happened. Metrics answer how much and how often. Traces answer where and why. A span is one step inside a trace. Let us make each of these concrete with one function.");
  }

  // 12. Running example ---------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "The running example", "One tiny weather assistant");
    code(s, M, 2.0, 7.2, 3.6, [
      [["def ", C.violet], ["get_weather", C.amber], ["(city):", C.body]],
      [["    return ", C.violet], ["FAKE_WEATHER[city]          ", C.body], ["# step 1", C.muted]],
      [" "],
      [["def ", C.violet], ["ask_ai", C.amber], ["(question):", C.body]],
      [["    return ", C.violet], ["call gpt-4o-mini            ", C.body], ["# step 2", C.muted]],
      [" "],
      [["def ", C.violet], ["weather_assistant", C.amber], ["(city):", C.body]],
      [["    weather = get_weather(city)", C.body]],
      [["    return ", C.violet], ["ask_ai(", C.body], ['f"Weather is {weather}. Umbrella?"', C.teal], [")", C.body]],
    ], 14);
    s.addText("“It’s rainy in Paris. Should I carry an umbrella?”", { x: 8.3, y: 2.1, w: 4.4, h: 1.8, fontFace: F.head, fontSize: 24, italic: true, color: C.text, margin: 0, valign: "top" });
    const steps = [["get_weather", "looks up the weather", C.amber], ["ask_ai", "asks the AI model, costs tokens", C.teal]];
    steps.forEach(([nm, d, color], k) => {
      chip(s, 8.3, 4.15 + k * 0.5, nm, color, 1.6);
      text(s, d, { x: 10.05, y: 4.15 + k * 0.5, w: 2.8, h: 0.36, fontSize: 13, color: C.muted, valign: "middle" });
    });
    text(s, "Two steps, plain Python. This exact function is in notebook 01, and we trace it in Langfuse and LangSmith later.", { x: M, y: 5.6, w: 11, h: 0.5, fontSize: 14, color: C.muted, italic: true });
    s.addNotes("Three steps: search documents, call a weather API that is deliberately flaky, and ask gpt-4o-mini to answer. Every chart in the next slides comes from running this agent for real, in notebook 01.");
  }

  // 13. Logs --------------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Signal 1", "Logs: what happened");
    const L = (ts, lvl, msg, color) => [[ts + "  ", C.muted], [lvl.padEnd(6), color], [msg, C.body]];
    code(s, M, 2.0, 7.6, 3.9, [
      L("19:02:11.746", "INFO", 'request received  city="London"', C.teal),
      L("19:02:11.747", "INFO", 'request received  city="Tokyo"', C.teal),
      L("19:02:11.747", "INFO", 'request received  city="Dubai"', C.teal),
      L("19:02:11.874", "INFO", "docs retrieved  count=1", C.teal),
      L("19:02:11.880", "INFO", "docs retrieved  count=1", C.teal),
      L("19:02:12.931", "ERROR", "weather failed  timeout", C.rose),
      L("19:02:13.402", "INFO", "llm answered  tokens=97", C.teal),
      L("19:02:13.655", "INFO", "llm answered  tokens=104", C.teal),
    ], 13);
    card(s, 8.55, 2.0, 4.18, 1.75, C.teal);
    text(s, "GOOD AT", { x: 8.85, y: 2.2, w: 3, h: 0.3, fontSize: 11, bold: true, color: C.teal, charSpacing: 3 });
    text(s, "Rich detail: error messages, parameters, audit trails.", { x: 8.85, y: 2.55, w: 3.7, h: 1.0, fontSize: 15, color: C.body });
    card(s, 8.55, 4.0, 4.18, 1.9, C.rose);
    text(s, "BLIND SPOT", { x: 8.85, y: 4.2, w: 3, h: 0.3, fontSize: 11, bold: true, color: C.rose, charSpacing: 3 });
    text(s, "Three users at once. Which “llm answered” belongs to London? Which request did the error break?", { x: 8.85, y: 4.55, w: 3.7, h: 1.25, fontSize: 15, color: C.body });
    s.addNotes("For one request, logs read beautifully. With three concurrent users the lines interleave and you cannot tell which belongs to which request. The fix, which we will see in a moment, is to stamp every log line with a trace id.");
  }

  // 14. Metrics -----------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Signal 2", "Metrics: how much, how often");
    const stats = [["1.18s", "p50 latency", C.teal], ["2.74s", "p95 latency", C.amber], ["25%", "requests failed", C.rose], ["16", "requests", C.cyan]];
    stats.forEach(([v, l, color], k) => {
      const x = M + k * 3.07;
      s.addText(v, { x, y: 1.85, w: 2.9, h: 0.9, fontFace: F.head, fontSize: 46, bold: true, color, margin: 0 });
      text(s, l, { x, y: 2.75, w: 2.9, h: 0.35, fontSize: 13, color: C.muted });
    });
    img(s, "metrics-hist.png", M, 3.3, 9.5, 1305 / 425);
    text(s, "Cheap, aggregated, perfect for dashboards and alerts. But it tells you p95 got worse, not which request or why.", { x: 10.35, y: 3.5, w: 2.4, h: 2.8, fontSize: 14, color: C.body });
    s.addNotes("Real data from notebook 01: sixteen requests. Metrics tell us that p95 is more than double p50, and that a quarter of requests failed. They cannot tell us why a particular request was slow. Was it the weather API or the model? For that we need the shape of each request.");
  }

  // 15. Traces and spans ------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Signals 3 and 4", "Traces and spans: where, and why");
    img(s, "waterfall-simple.png", M, 2.0, 7.6, 1315 / 351);
    const defs = [
      ["Trace", "One request end to end, one trace_id", C.violet],
      ["Span", "One step: name, start, end, parent, attributes, status", C.teal],
      ["Nesting", "Child spans sit inside their parent, so the tree draws itself", C.amber],
    ];
    defs.forEach(([t, d, color], k) => {
      const y = 1.85 + k * 1.45;
      card(s, 8.55, y, 4.18, 1.25, color);
      text(s, t, { x: 8.85, y: y + 0.18, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: C.text });
      text(s, d, { x: 8.85, y: y + 0.58, w: 3.7, h: 0.6, fontSize: 13, color: C.muted });
    });
    text(s, "A real trace of weather_assistant(\"Tokyo\") from notebook 01. Time runs left to right.", { x: M, y: 4.25, w: 7.6, h: 0.4, fontSize: 12, color: C.muted, italic: true });
    s.addNotes("In one picture: the weather tool took 1.4 seconds, the LLM call took about a second and cost a fraction of a cent, and a second LLM graded the answer. This is the power of a trace: the question metrics could not answer now has an answer.");
  }

  // 16. Anatomy of a span ------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Under the hood", "Anatomy of a span");
    const K = (k, v, vc = C.teal) => [["  \"" + k + "\": ", C.cyan], [v, vc]];
    code(s, M, 1.9, 7.4, 4.9, [
      [["{", C.body]],
      K("trace_id", '"4bf92f3577b34da6a3ce929d0e0e4736",', C.amber),
      K("span_id", '"00f067aa0ba902b7",', C.amber),
      K("parent_span_id", '"a3ce929d0e0e4736",', C.amber),
      K("name", '"chat gpt-4o-mini",'),
      K("start / end", '"19:02:13.100" / "19:02:15.200",'),
      K("status", '"OK",'),
      [["  \"attributes\": {", C.cyan]],
      [["    \"gen_ai.operation.name\": ", C.violet], ['"chat",', C.teal]],
      [["    \"gen_ai.request.model\": ", C.violet], ['"gpt-4o-mini",', C.teal]],
      [["    \"gen_ai.usage.input_tokens\": ", C.violet], ["640,", C.amber]],
      [["    \"gen_ai.usage.output_tokens\": ", C.violet], ["172", C.amber]],
      [["  }", C.cyan]],
      [["}", C.body]],
    ], 13);
    const notes = [["IDENTITY", "trace_id + span_id + parent", "How four flat records become one tree", C.amber], ["TIMING", "start, end, status", "Latency and errors per step", C.teal], ["ATTRIBUTES", "gen_ai.*", "Model, tokens, and from them, cost", C.violet]];
    notes.forEach(([k, t, d, color], i) => {
      const y = 1.9 + i * 1.65;
      text(s, k, { x: 8.4, y, w: 4, h: 0.3, fontSize: 11, bold: true, color, charSpacing: 3 });
      text(s, t, { x: 8.4, y: y + 0.35, w: 4.3, h: 0.4, fontFace: F.mono, fontSize: 15, color: C.text });
      text(s, d, { x: 8.4, y: y + 0.8, w: 4.3, h: 0.5, fontSize: 14, color: C.muted });
    });
    s.addNotes("Every tool you will use stores something shaped like this. Names differ: LangSmith calls it a run, Langfuse an observation, Datadog a span. The shape does not.");
  }

  // 17. Divider ---------------------------------------------------------------
  divider("03", "OpenTelemetry", "Instrument once, export anywhere.", "Section three: OpenTelemetry, the open standard underneath all of this.");

  // 18. What OTel is ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "The open standard", "What is OpenTelemetry?", "An open source, vendor-neutral CNCF project, supported by every major observability vendor.");
    s.addImage({ path: A("logo-otel-color.png"), x: W - M - 1.3, y: 1.95, w: 1.1, h: 1.1 });
    const items = [
      ["API + SDK", "Create spans, metrics and logs in your code", C.violet],
      ["OTLP", "The wire protocol that ships them, over HTTP or gRPC", C.amber],
      ["Collector", "Optional process that filters, redacts, samples and routes", C.teal],
      ["Semantic conventions", "Agreed names, such as gen_ai.request.model", C.cyan],
    ];
    items.forEach(([t, d, color], k) => {
      const x = M + k * 3.07, w = 2.85, y = 3.25;
      card(s, x, y, w, 2.6, color);
      text(s, t, { x: x + 0.35, y: y + 0.35, w: w - 0.55, h: 0.8, fontSize: 20, bold: true, color: C.text });
      text(s, d, { x: x + 0.35, y: y + 1.2, w: w - 0.55, h: 1.2, fontSize: 14, color: C.muted });
    });
    s.addNotes("Before OpenTelemetry, every vendor had its own agent and format, and switching vendors meant re-instrumenting. OTel makes telemetry portable. Four pieces: the API and SDK create data, OTLP ships it, the Collector processes it, and semantic conventions name it.");
  }

  // 19. Pipeline diagram -------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "How telemetry flows", "From your process to any backend");
    img(s, "otel-pipeline.png", M + 0.15, 1.75, W - 2 * M - 0.3, 2400 / 840);
    s.addNotes("Spans are created in memory, handed to a processor that batches them, and sent in the background by an exporter, so your request is never blocked. The Collector is optional but powerful: it can strip PII and send the same data to two backends. Switching backends is two environment variables.");
  }

  // 20. Creating a span -------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "In code", "Creating spans with OpenTelemetry");
    code(s, M, 1.9, 8.1, 4.3, [
      [["def ", C.violet], ["weather_assistant", C.amber], ["(city):", C.body]],
      [["    with ", C.violet], ["tracer.start_as_current_span(", C.body], ['"weather_assistant"', C.teal], ["):", C.body]],
      [" "],
      [["        with ", C.violet], ["tracer.start_as_current_span(", C.body], ['"get_weather"', C.teal], ["):", C.body]],
      [["            weather = get_weather(city)", C.body]],
      [" "],
      [["        with ", C.violet], ["tracer.start_as_current_span(", C.body], ['"ask_ai"', C.teal], ["):", C.body]],
      [["            return ", C.violet], ["ask_ai(...)", C.body]],
    ], 14);
    const pts = [["with ... :", "everything inside the block is timed and recorded as one span"], ["nested with", "a span started inside another becomes its child, so you get a tree"], ["one line per step", "no other changes to your function"]];
    pts.forEach(([t, d], k) => {
      const y = 1.95 + k * 1.4;
      text(s, t, { x: 9.0, y, w: 3.75, h: 0.4, fontFace: F.mono, fontSize: 14, color: C.amber });
      text(s, d, { x: 9.0, y: y + 0.42, w: 3.75, h: 0.8, fontSize: 14, color: C.body });
    });
    s.addNotes("This is all it takes. start_as_current_span sets the parent automatically, which is how nesting works across function calls. One gotcha we will see live: spans are batched, so a short script must flush before it exits or the spans are silently lost.");
  }

  // 23. Divider ---------------------------------------------------------------
  divider("04", "What to measure", "Latency, errors, tokens, cost and quality.", "Section four: what to actually watch.");

  // 24. Performance -------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Performance", "Watch the tail, not the average");
    img(s, "latency-cdf.png", M, 1.8, 8.3, 1305 / 425);
    const pts = [["p50 / p95 / p99", "end-to-end latency percentiles"], ["Time to first token", "what users feel when streaming"], ["Per-step latency", "retrieval vs tools vs LLM"], ["Errors", "429s, timeouts, tool and parse failures, refusals"]];
    pts.forEach(([t, d], k) => {
      const y = 1.85 + k * 1.0;
      text(s, t, { x: 9.3, y, w: 3.5, h: 0.35, fontSize: 16, bold: true, color: C.text });
      text(s, d, { x: 9.3, y: y + 0.36, w: 3.5, h: 0.5, fontSize: 13, color: C.muted });
    });
    img(s, "latency-breakdown.png", M, 4.75, 8.3, 1195 / 227);
    s.addNotes("Real data from notebook 05: forty-eight requests across two models. Averages hide pain. Look at the CDF: the slow tail comes from the weather tool retrying. The bar below shows where time goes on average: the LLM call, then the tool.");
  }

  // 25. Cost -------------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Tokens and cost", "A one-line prompt change doubled the bill");
    img(s, "monthly-cost.png", M, 1.8, 7.7, 1195 / 425);
    const stats = [["31", "avg output tokens, concise prompt", C.teal], ["87", "avg output tokens, friendly prompt", C.violet], ["2.1×", "monthly cost, same model", C.amber]];
    stats.forEach(([v, l, color], k) => {
      const y = 1.75 + k * 1.05;
      s.addText(v, { x: 8.75, y, w: 3.9, h: 0.65, fontFace: F.head, fontSize: 40, bold: true, color, margin: 0 });
      text(s, l, { x: 8.75, y: y + 0.62, w: 3.9, h: 0.35, fontSize: 13, color: C.muted });
    });
    card(s, M, 5.0, W - 2 * M, 1.25, C.amber);
    text(s, "Cost = tokens × model price, per span, rolled up per trace, user and feature. Watch for runaway agent loops, bloated context windows and retries multiplying spend.", { x: M + 0.35, y: 5.0, w: W - 2 * M - 0.6, h: 1.25, fontSize: 15, color: C.body, valign: "middle" });
    s.addNotes("Also from notebook 05. The friendly prompt writes almost three times more output tokens, and output tokens are priced higher than input tokens. A one-line prompt change roughly doubled the monthly bill. That is why prompt version belongs on every trace.");
  }

  // 26. Quality and context ----------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Quality and context", "For whom, and how good?");
    const items = [
      [ic.thumbs, "Scores and feedback", "Thumbs up or down, LLM-as-a-judge, human labels", C.teal],
      [ic.comments, "Sessions", "Multi-turn conversations grouped together", C.cyan],
      [ic.user, "Users", "Per-user usage, cost and issues", C.cyan],
      [ic.tag, "Metadata and tags", "Prompt version, release, environment, feature flag", C.violet],
      [ic.lock, "Guardrails", "PII detected, injection attempts, policy blocks", C.rose],
    ];
    items.forEach(([i, t, d, color], k) => {
      const y = 1.85 + k * 0.9;
      card(s, M, y, W - 2 * M, 0.76, null);
      s.addImage({ data: i, x: M + 0.3, y: y + 0.2, w: 0.36, h: 0.36 });
      text(s, t, { x: M + 0.95, y, w: 3.6, h: 0.76, fontSize: 17, bold: true, color: C.text, valign: "middle" });
      text(s, d, { x: M + 4.6, y, w: 7.4, h: 0.76, fontSize: 15, color: C.muted, valign: "middle" });
    });
    s.addNotes("Tags like prompt version are how you answer: did yesterday's change make things worse? Sessions and users turn a pile of traces into customer stories.");
  }

  // 27. Divider ---------------------------------------------------------------
  divider("05", "Hands-on", "Langfuse on localhost, LangSmith, and plain OpenTelemetry.", "Section five: the live demo. Switch to JupyterLab now.");

  // 28. The lab ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Follow along", "The AI Observability Lab");
    card(s, M, 1.9, 5.4, 4.4, C.teal);
    s.addImage({ data: ic.github, x: M + 0.4, y: 2.25, w: 0.5, h: 0.5 });
    text(s, REPO, { x: M + 0.4, y: 2.95, w: 4.8, h: 0.5, fontFace: F.mono, fontSize: 14, color: C.teal });
    code(s, M + 0.4, 3.6, 4.6, 2.4, [
      [["make ", C.amber], ["setup", C.body]],
      [["make ", C.amber], ["up", C.body]],
      [["make ", C.amber], ["lab", C.body]],
    ], 16);
    const nbs = [["00", "Setup: start the local stack"], ["01", "What is observability?"], ["02", "Your first trace in Langfuse"], ["03", "The same function in LangSmith"], ["04", "Beyond Langfuse and LangSmith"], ["+", "advanced/: deeper notebooks for later"]];
    nbs.forEach(([num, t], k) => {
      const y = 2.0 + k * 0.7;
      s.addText(num, { x: 6.5, y, w: 0.7, h: 0.5, fontFace: F.head, fontSize: 20, bold: true, color: C.amber, margin: 0, valign: "middle" });
      text(s, t, { x: 7.25, y, w: 5.5, h: 0.5, fontSize: 17, color: C.text, valign: "middle" });
    });
    s.addNotes("Everything tonight lives in this repo. Three commands: setup installs Python dependencies, up starts Langfuse and an OpenTelemetry Collector in Docker, lab opens JupyterLab. The notebooks are saved with outputs, so people can read them on GitHub before running anything.");
  }

  // 29. Langfuse stack ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Demo 1", "Langfuse on localhost");
    s.addImage({ path: A("logo-langfuse-color.png"), x: W - M - 1.8, y: 0.85, w: 0.55, h: 0.55 });
    img(s, "langfuse-stack.png", M, 1.7, 8.3, 2400 / 1040);
    code(s, 9.15, 1.75, 3.58, 2.1, [
      [["git clone ", C.amber], ["langfuse", C.body]],
      [["docker compose ", C.amber], ["up -d", C.body]],
      [["open ", C.amber], ["localhost:3000", C.teal]],
    ], 13);
    text(s, "Headless init creates the user, project and API keys on first boot. No sign-up form.", { x: 9.15, y: 4.05, w: 3.58, h: 1.2, fontSize: 14, color: C.body });
    s.addNotes("Open notebook 00. Six containers: web for the UI and ingestion API, a worker that processes events and computes cost, Redis as the queue, MinIO for raw events, ClickHouse for analytics and Postgres for users and keys. This split is the same pattern most observability backends use.");
  }

  // 30. Instrument with Langfuse ---------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Demo 2", "Add Langfuse in two changes");
    code(s, M, 1.85, 7.6, 4.6, [
      [["from ", C.violet], ["langfuse ", C.body], ["import ", C.violet], ["observe", C.body]],
      [["from ", C.violet], ["langfuse.openai ", C.body], ["import ", C.violet], ["OpenAI      ", C.body], ["# NEW 1", C.amber]],
      [" "],
      [["@observe()                             ", C.body], ["# NEW 2", C.amber]],
      [["def ", C.violet], ["get_weather", C.amber], ["(city): ...", C.body]],
      [" "],
      [["@observe()", C.body]],
      [["def ", C.violet], ["ask_ai", C.amber], ["(question): ...", C.body]],
      [" "],
      [["@observe()", C.body]],
      [["def ", C.violet], ["weather_assistant", C.amber], ["(city): ...", C.body]],
    ], 14);
    const changes = [["NEW 1", "Import OpenAI from langfuse.openai. Every AI call is recorded: prompt, answer, model, tokens, cost.", C.amber], ["NEW 2", "@observe() turns each function into a span. Nested calls become child spans.", C.teal], ["then", "langfuse.flush() sends everything. Open localhost:3000, click Tracing.", C.violet]];
    changes.forEach(([t, d, color], k) => {
      const y = 1.9 + k * 1.5;
      card(s, 8.55, y, 4.18, 1.3, color);
      text(s, t, { x: 8.85, y: y + 0.15, w: 3.6, h: 0.35, fontFace: F.mono, fontSize: 14, bold: true, color });
      text(s, d, { x: 8.85, y: y + 0.5, w: 3.7, h: 0.75, fontSize: 13, color: C.body });
    });
    s.addNotes("Open notebook 02. Same function as notebook 01, two changes: the import and the decorator. Run it, then open localhost:3000, click Tracing, and click the newest weather_assistant trace.");
  }

  // 31. What Langfuse shows ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Demo 2, result", "What you see in Langfuse");
    img(s, "waterfall-langfuse.png", M, 1.85, 8.3, 1315 / 410);
    text(s, "The same weather_assistant trace, fetched from Langfuse. The last row was added for us by the OpenAI import.", { x: M, y: 4.6, w: 8.3, h: 0.5, fontSize: 13, color: C.muted, italic: true });
    const rows = [["weather_assistant", "input, final answer, total time"], ["get_weather", "about 0.5 s"], ["OpenAI-generation", "prompt, reply, model, tokens, cost"], ["Users page", "who asked (optional step)"]];
    rows.forEach(([t, d], k) => {
      const y = 1.9 + k * 1.0;
      text(s, t, { x: 9.25, y, w: 3.5, h: 0.35, fontFace: F.mono, fontSize: 14, color: C.teal });
      text(s, d, { x: 9.25, y: y + 0.38, w: 3.5, h: 0.45, fontSize: 13, color: C.body });
    });
    s.addNotes("Click through the trace in the Langfuse UI: the outer span, the weather step, and the generation with prompt, reply, tokens and cost. Point out that we never wrote code for the generation row; the import did it.");
  }

  // 32. LangSmith ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Demo 3", "Same agent, in LangSmith");
    s.addImage({ path: A("logo-langchain-color.png"), x: W - M - 1.8, y: 0.85, w: 0.55, h: 0.55 });
    code(s, M, 1.85, 6.2, 3.0, [
      [["from ", C.violet], ["langsmith ", C.body], ["import ", C.violet], ["traceable", C.body]],
      [["from ", C.violet], ["langsmith.wrappers ", C.body], ["import ", C.violet], ["wrap_openai", C.body]],
      [" "],
      [["client = wrap_openai(OpenAI())", C.body]],
      [" "],
      [["@traceable", C.amber]],
      [["def ", C.violet], ["get_weather", C.amber], ["(city): ...", C.body]],
    ], 13);
    code(s, M, 5.05, 6.2, 1.3, [
      [["LANGSMITH_TRACING", C.cyan], ["=true", C.body]],
      [["LANGSMITH_API_KEY", C.cyan], ["=lsv2_...", C.body]],
    ], 12);
    const head2 = ["LangSmith", "Langfuse", "OpenTelemetry"].map((t) => ({ text: t, options: { bold: true, color: C.teal, fontSize: 12, fill: { color: "0F1428" } } }));
    const rows = [["Project", "Project", "service.name"], ["Trace", "Trace", "Trace"], ["Run", "Observation", "Span"], ["Run type", "Observation type", "operation.name"], ["Thread", "Session", ""], ["Feedback", "Score", ""]];
    s.addTable([head2, ...rows.map((r, i) => r.map((t) => ({ text: t, options: { color: C.body, fontSize: 13, fill: { color: i % 2 ? "0F1428" : C.panel } } })))], {
      x: 7.2, y: 1.85, w: 5.53, colW: [1.8, 1.95, 1.78], rowH: 0.5, border: { type: "none" }, fontFace: F.body, margin: [0, 0.08, 0, 0.12], valign: "middle",
    });
    text(s, "Same ideas, different names. Learn the concept once.", { x: 7.2, y: 5.6, w: 5.5, h: 0.5, fontSize: 14, italic: true, color: C.muted });
    s.addNotes("Open notebook 03. @traceable and wrap_openai mirror @observe and the Langfuse OpenAI import. LangSmith adds monitoring dashboards, datasets and experiments, annotation queues and a prompt hub. The table is the slide to remember: different names, same model.");
  }

  // 33. OTel anywhere ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Demo 4", "Other tools: change the address, not the code");
    const blocks = [
      ["Langfuse", [["endpoint ", "http://localhost:3000/api/public/otel"], ["headers  ", "Authorization: Basic <your keys>"]], C.amber],
      ["LangSmith", [["endpoint ", "https://api.smith.langchain.com/otel"], ["headers  ", "x-api-key: <your key>"]], C.teal],
      ["Dynatrace", [["endpoint ", "https://<id>.live.dynatrace.com/api/v2/otlp"], ["headers  ", "Authorization: Bearer <token>"]], C.violet],
    ];
    blocks.forEach(([t, lines, color], k) => {
      const y = 1.85 + k * 1.45;
      text(s, t, { x: M, y: y + 0.35, w: 2.0, h: 0.5, fontSize: 18, bold: true, color });
      code(s, M + 2.1, y, 9.95, 1.2, lines.map(([a2, b2]) => [[a2, C.cyan], [b2, C.body]]), 13);
    });
    text(s, "Your functions and your with blocks stay exactly the same. Notebook 04 sends plain OpenTelemetry to Langfuse with zero Langfuse code.", { x: M, y: 6.25, w: W - 2 * M, h: 0.45, fontSize: 14, italic: true, color: C.muted });
    s.addNotes("This is the slide to remember. If spans are created with OpenTelemetry, choosing a tool is only choosing where to send them. Run notebook 04: it sends the notebook 01 function to Langfuse without any Langfuse code.");
  }

  // 34. Divider ---------------------------------------------------------------
  divider("06", "The landscape", "Different names, same ideas.", "Section six: the tool landscape and how to choose.");

  // 35. Tool landscape ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Who does what", "The tool landscape");
    const groups = [
      ["LLM-NATIVE", "Built for prompts, agents and evals", [["logo-langchain-color.png", "LangSmith", "Managed, LangChain depth"], ["logo-langfuse-color.png", "Langfuse", "Open source, self-host"], ["logo-phoenix-color.png", "Arize Phoenix", "Open source, OpenInference"]], C.teal],
      ["APM AND ENTERPRISE", "AI next to your infrastructure", [["logo-datadog-color.png", "Datadog", "LLM Observability"], ["logo-dynatrace-color.png", "Dynatrace", "Full-stack, AI root cause"], ["logo-grafana-color.png", "Grafana", "Tempo, open source"]], C.amber],
    ];
    groups.forEach(([k, d, tools, color], g) => {
      const y = 1.85 + g * 2.35;
      text(s, k, { x: M, y, w: 4, h: 0.3, fontSize: 11, bold: true, color, charSpacing: 3 });
      text(s, d, { x: M, y: y + 0.32, w: 4, h: 0.3, fontSize: 13, color: C.muted });
      tools.forEach(([logo, name, desc], t) => {
        const x = M + t * 4.1, cy = y + 0.75;
        card(s, x, cy, 3.85, 1.3, null);
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.25, y: cy + 0.25, w: 0.8, h: 0.8, fill: { color: "FFFFFF" }, line: { color: "FFFFFF", width: 0 }, rectRadius: 0.12 });
        s.addImage({ path: A(logo), x: x + 0.35, y: cy + 0.35, w: 0.6, h: 0.6, sizing: { type: "contain", w: 0.6, h: 0.6 } });
        text(s, name, { x: x + 1.25, y: cy + 0.25, w: 2.5, h: 0.4, fontSize: 17, bold: true, color: C.text });
        text(s, desc, { x: x + 1.25, y: cy + 0.68, w: 2.5, h: 0.4, fontSize: 12, color: C.muted });
      });
    });
    s.addImage({ path: A("logo-otel-color.png"), x: M, y: 6.55, w: 0.4, h: 0.4 });
    text(s, "Underneath, increasingly: OpenTelemetry", { x: M + 0.55, y: 6.55, w: 6, h: 0.4, fontSize: 13, color: C.body, valign: "middle" });
    s.addNotes("Two families. LLM-native tools are built around prompts, agents and evaluations. APM vendors put AI traces next to your databases and Kubernetes metrics. Increasingly, all of them accept OpenTelemetry.");
  }

  // 36. Datadog and Dynatrace ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Enterprise", "Datadog and Dynatrace");
    const cols = [
      ["logo-datadog-color.png", "Datadog LLM Observability", ["Span kinds: llm, workflow, agent, tool, task, embedding, retrieval", "Cost and latency dashboards, evaluations", "PII and prompt-injection scanning", "Native OTel GenAI ingest, v1.37+"], [[["DD_LLMOBS_ENABLED", C.cyan], ["=1 ", C.body], ["ddtrace-run", C.amber], [" python app.py", C.body]]]],
      ["logo-dynatrace-color.png", "Dynatrace", ["AI observability on top of full-stack APM", "Ingests OTLP and OpenLLMetry traces", "Links LLM spans to services, infra and business metrics", "Davis AI for root cause analysis"], [[["endpoint: ", C.cyan], [".../api/v2/otlp", C.body]], [["Authorization: ", C.cyan], ["Bearer <token>", C.body]]]],
    ];
    cols.forEach(([logo, title, pts, codeLines], i) => {
      const x = M + i * 6.15, w = 5.9;
      card(s, x, 1.85, w, 4.5, null);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35, y: 2.15, w: 0.75, h: 0.75, fill: { color: "FFFFFF" }, line: { color: "FFFFFF", width: 0 }, rectRadius: 0.12 });
      s.addImage({ path: A(logo), x: x + 0.45, y: 2.25, w: 0.55, h: 0.55, sizing: { type: "contain", w: 0.55, h: 0.55 } });
      text(s, title, { x: x + 1.3, y: 2.15, w: w - 1.5, h: 0.75, fontSize: 20, bold: true, color: C.text, valign: "middle" });
      s.addText(pts.map((p, j) => ({ text: p, options: { bullet: { indent: 16 }, breakLine: j < pts.length - 1 } })), {
        x: x + 0.35, y: 3.1, w: w - 0.7, h: 1.9, fontFace: F.body, fontSize: 14, color: C.body, paraSpaceAfter: 6, valign: "top", margin: 0,
      });
      code(s, x + 0.35, 5.15, w - 0.7, 0.95, codeLines, 12);
    });
    s.addNotes("If your company already pays for one of these, start there, fed by OpenTelemetry. Your AI traces sit next to your database and Kubernetes metrics. Notebook 06 has ready-to-enable Collector config for both.");
  }

  // 37. How to choose ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Decision guide", "How to choose");
    const rows = [
      ["Data must stay in-house?", "Self-host Langfuse or Phoenix", C.teal],
      ["LangChain or LangGraph everywhere?", "LangSmith", C.violet],
      ["Company already on Datadog or Dynatrace?", "Their LLM module, fed by OpenTelemetry", C.amber],
      ["Not sure yet?", "Instrument with OTel, try two backends, keep the one your team opens daily", C.cyan],
    ];
    rows.forEach(([q, a, color], k) => {
      const y = 1.9 + k * 1.1;
      card(s, M, y, W - 2 * M, 0.92, color);
      text(s, q, { x: M + 0.4, y, w: 5.4, h: 0.92, fontSize: 18, bold: true, color: C.text, valign: "middle" });
      s.addShape(pres.shapes.LINE, { x: 6.35, y: y + 0.46, w: 0.55, h: 0, line: { color, width: 1.5, endArrowType: "triangle" } });
      text(s, a, { x: 7.15, y, w: 5.4, h: 0.92, fontSize: 17, color: C.body, valign: "middle" });
    });
    s.addNotes("Close the tools section with this. The honest answer to which tool is best: the one your team actually opens every day. OpenTelemetry keeps that choice reversible.");
  }

  // 38. Recap ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s);
    head(s, "Recap", "Five things to remember");
    const items = [
      ["AI fails silently.", "Observe every step, not just uptime."],
      ["Four signals.", "Logs are events, metrics are numbers, traces are journeys, spans are steps."],
      ["OpenTelemetry.", "Instrument once, export anywhere. GenAI conventions name the fields."],
      ["Measure what matters.", "Latency, errors, tokens, cost, quality. Tag user, session and version."],
      ["Tools differ in names,", "not in concepts."],
    ];
    items.forEach(([a, b], k) => {
      const y = 1.9 + k * 0.92;
      s.addImage({ data: ic.check, x: M, y: y + 0.12, w: 0.42, h: 0.42 });
      s.addText([{ text: a + " ", options: { bold: true, color: C.text } }, { text: b, options: { color: C.body } }], { x: M + 0.7, y, w: 11.5, h: 0.66, fontFace: F.body, fontSize: 20, margin: 0, valign: "middle" });
    });
    s.addNotes("Recap the five ideas. If people remember one slide, it should be: instrument once with OpenTelemetry, and the backend is a configuration choice.");
  }

  // 39. Next + Q&A ---------------------------------------------------------------
  {
    const s = pres.addSlide();
    base(s, { footer: false });
    s.addText("Questions?", { x: M, y: 1.5, w: 8, h: 1.3, fontFace: F.head, fontSize: 64, bold: true, color: C.text, margin: 0 });
    text(s, "COMING NEXT", { x: M, y: 3.2, w: 5, h: 0.3, fontSize: 12, bold: true, color: C.teal, charSpacing: 4 });
    const next = [["Evaluations", "LLM-as-a-judge, datasets, experiments"], ["Prompt management", "Versioning and linking prompts to traces"], ["Alerts and dashboards", "SLOs on latency, cost and quality"], ["Production pipelines", "Collector, sampling, redaction at scale"]];
    next.forEach(([t, d], k) => {
      const x = M + (k % 2) * 4.4, y = 3.65 + Math.floor(k / 2) * 1.05;
      text(s, t, { x, y, w: 4.2, h: 0.4, fontSize: 18, bold: true, color: C.text });
      text(s, d, { x, y: y + 0.4, w: 4.2, h: 0.4, fontSize: 13, color: C.muted });
    });
    s.addImage({ data: ic.github, x: M, y: 6.2, w: 0.35, h: 0.35 });
    text(s, REPO, { x: M + 0.5, y: 6.2, w: 7, h: 0.35, fontFace: F.mono, fontSize: 14, color: C.teal, valign: "middle" });
    motif(s, 9.3, 2.0, 2.4);
    s.addNotes("Take questions. Point people to the repo: the notebooks run on their laptops with three make commands. Next session builds on this: evaluations, prompt management, alerting and production pipelines.");
  }

  await pres.writeFile({ fileName: path.join(__dirname, process.env.NO_VIDEO ? "AI-Observability-print.pptx" : "AI-Observability.pptx") });
  console.log(`wrote ${n} slides`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Builds slides/AI-Observability.pptx (and a print variant with NO_VIDEO=1).
// Run from the repo root: NODE_PATH=$(npm root -g) node slides/build_deck.js
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const A = (f) => path.join(__dirname, "assets", f);
const VIDEO = path.join(__dirname, "..", "video", "out", "ai-observability-explained.mp4");
const REPO = "github.com/fnusatvik07/ai-observability-lab";

const W = 13.333, H = 7.5, M = 0.7;
const LIGHT = {
  bg: "F0EEE6", section: "E8E6DC", card: "FAF9F5", line: "D9D5C8",
  ink: "141413", body: "3D3D3A", muted: "87867F",
};
const DARK = {
  bg: "141413", section: "1F1E1D", card: "262624", line: "3A3936",
  ink: "F0EEE6", body: "C9C6BC", muted: "8F8D86",
};
const C = {
  ...LIGHT,
  clay: "D97757", blue: "D97757", orange: "D97757", green: "788C5D", purple: "6A9BCC", red: "BF4D43",
  kraft: "D4A27F", slate: "3D3D3A",
  codeBg: "1A1918", codeInk: "E8E6DC", kw: "E08C6B", fn: "8DB4DC", str: "A7BC86", cm: "85837C",
};
function theme(dark) { Object.assign(C, dark ? DARK : LIGHT); }

// Key phrase of each title, drawn in clay orange
const HL = {
  "Your AI assistant gave a wrong answer, and nothing told you why": "nothing told you why",
  "Tonight: the basics first, then three tools on the same tiny example": "the basics first",
  "Four-minute overview": "Four-minute",
  "Monitoring tells you something is wrong; observability tells you why": "observability tells you why",
  "AI apps break the old rules, so a green dashboard is not enough": "a green dashboard is not enough",
  "You already use observability every time you track a parcel": "track a parcel",
  "Our example is a two-step weather assistant, used in every notebook": "two-step weather assistant",
  "Logs record what happened, but get hard to follow with many users": "Logs",
  "Metrics summarize many requests, but not which step was slow": "Metrics",
  "A trace shows one request step by step, and where time went": "A trace",
  "Creating spans takes one line per step with OpenTelemetry": "one line per step",
  "Four pieces move a span from your code to a tool": "Four pieces",
  "For AI steps, a span also records the model, tokens and cost": "model, tokens and cost",
  "OpenTelemetry is the common language all tools understand": "common language",
  "Five things are worth watching in every AI app": "Five things",
  "A friendlier prompt made answers longer and doubled the monthly bill": "doubled the monthly bill",
  "Langfuse is a free, open source dashboard for AI traces": "free, open source",
  "Setting up Langfuse on your laptop takes five steps": "five steps",
  "Adding Langfuse takes two changes to the same function": "two changes",
  "Langfuse adds the AI call details we never wrote": "we never wrote",
  "LangSmith needs the same two changes, with different names": "different names",
  "Each tool uses its own words for the same few ideas": "the same few ideas",
  "Tools come in two groups: built for AI apps, or general monitoring": "two groups",
  "Switching tools means changing an address, not code": "an address, not code",
  "Pick the tool that fits your situation": "fits your situation",
  "Four things to remember": "remember",
};
const DARK_SLIDES = new Set(["Four things to remember",
  "Your AI assistant gave a wrong answer, and nothing told you why",
  "You already use observability every time you track a parcel",
  "A trace shows one request step by step, and where time went",
  "OpenTelemetry is the common language all tools understand",
  "Langfuse adds the AI call details we never wrote",
  "Each tool uses its own words for the same few ideas",
]);

const F = { sans: "Avenir Next", serif: "Charter", mono: "Menlo" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Data Sense";
pres.title = "AI Observability: Foundations";

let page = 0;

// ---------------------------------------------------------------- building blocks

function slide(section, dark = false) {
  theme(dark);
  const s = pres.addSlide();
  page += 1;
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: H, fill: { color: C.clay }, line: { color: C.clay, width: 0 } });
  if (section) {
    s.addText(section, { x: M, y: 0.4, w: 6, h: 0.3, fontFace: F.sans, fontSize: 11, color: C.muted, margin: 0 });
  }
  s.addText("AI Observability: Foundations", { x: M, y: H - 0.5, w: 6, h: 0.3, fontFace: F.sans, fontSize: 9, color: C.muted, margin: 0 });
  s.addText(String(page), { x: W - M - 1, y: H - 0.5, w: 1, h: 0.3, fontFace: F.sans, fontSize: 9, color: C.muted, align: "right", margin: 0 });
  return s;
}

function title(s, t, sub) {
  const hl = HL[t];
  let runs = [{ text: t, options: { color: C.ink } }];
  if (hl && t.includes(hl)) {
    const [pre, post] = [t.slice(0, t.indexOf(hl)), t.slice(t.indexOf(hl) + hl.length)];
    runs = [pre && { text: pre, options: { color: C.ink } }, { text: hl, options: { color: C.clay, italic: true } }, post && { text: post, options: { color: C.ink } }].filter(Boolean);
  }
  s.addText(runs, { x: M, y: 0.72, w: W - 2 * M, h: 0.8, fontFace: F.serif, fontSize: 28, margin: 0, valign: "top" });
  if (sub) s.addText(sub, { x: M, y: 1.5, w: W - 2 * M, h: 0.4, fontFace: F.sans, fontSize: 15, color: C.muted, margin: 0 });
}

function text(s, str, o) {
  s.addText(str, { fontFace: F.sans, fontSize: 15, color: C.body, margin: 0, valign: "top", ...o });
}

function panel(s, x, y, w, h, fill = C.card) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: C.line, width: 0.75 } });
}

function code(s, x, y, w, h, lines, size = 14) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.codeBg }, line: { color: C.codeBg, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h, fill: { color: C.clay }, line: { color: C.clay, width: 0 } });
  const runs = [];
  lines.forEach((line, i) => {
    const parts = Array.isArray(line) ? line : [[line, C.body]];
    parts.forEach(([t, color], j) =>
      runs.push({ text: t, options: { color: color === C.ink || color === C.body ? C.codeInk : color, breakLine: j === parts.length - 1 && i < lines.length - 1 } })
    );
  });
  s.addText(runs, { x: x + 0.3, y: y + 0.25, w: w - 0.6, h: h - 0.5, fontFace: F.mono, fontSize: size, valign: "top", margin: 0, paraSpaceAfter: 3 });
}

function bullets(s, items, o) {
  s.addText(
    items.map((t, i) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: i < items.length - 1 } })),
    { fontFace: F.sans, fontSize: 16, color: C.body, paraSpaceAfter: 8, valign: "top", margin: 0, ...o }
  );
}

function nextHeadFill() { return C.bg === DARK.bg ? C.clay : "141413"; }
function table(s, rows, o) {
  const [head, ...body] = rows;
  const data = [
    head.map((t) => ({ text: t, options: { bold: true, color: "F0EEE6", fontFace: F.sans, fontSize: 13, fill: { color: nextHeadFill() } } })),
    ...body.map((r) => r.map((t, j) => ({ text: t, options: { color: j === 0 ? C.ink : C.body, fontSize: 13, fill: { color: C.card } } }))),
  ];
  s.addTable(data, {
    fontFace: F.sans, border: { type: "solid", pt: 0.75, color: C.line }, margin: [0.06, 0.12, 0.06, 0.12], valign: "middle", ...o,
  });
}

function source(s, str) {
  s.addText(str, { x: M, y: H - 0.85, w: W - 2 * M, h: 0.3, fontFace: F.sans, fontSize: 10, italic: true, color: C.muted, margin: 0 });
}

function divider(num, name, line, notes) {
  theme(true);
  const s = pres.addSlide();
  page += 1;
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: W - 4.4, y: 0, w: 4.4, h: H, fill: { color: C.clay }, line: { color: C.clay, width: 0 } });
  s.addText(num, { x: W - 4.4, y: 1.6, w: 4.4, h: 4.2, fontFace: F.serif, fontSize: 240, color: "141413", align: "center", valign: "middle", margin: 0 });
  s.addText("Part " + num, { x: M, y: 2.35, w: 7, h: 0.4, fontFace: F.sans, fontSize: 14, color: C.clay, bold: true, charSpacing: 2, margin: 0 });
  s.addText(name, { x: M, y: 2.85, w: 7.8, h: 1.1, fontFace: F.serif, fontSize: 52, color: C.ink, margin: 0 });
  s.addText(line, { x: M, y: 4.1, w: 7.4, h: 0.9, fontFace: F.sans, fontSize: 18, color: C.body, margin: 0, valign: "top" });
  s.addNotes(notes);
  theme(false);
}

// A trace drawn as native shapes: rows of { name, start, dur, color, depth, note }
function waterfall(s, x, y, w, rows, ticks) {
  const labelW = 2.7, barX = x + labelW, barW = w - labelW - 2.6, rowH = 0.52;
  const max = ticks[ticks.length - 1];
  const h = rows.length * rowH + 0.15;
  ticks.forEach((t) => {
    const tx = barX + (t / max) * barW;
    s.addShape(pres.shapes.LINE, { x: tx, y, w: 0, h, line: { color: C.line, width: 0.75 } });
    text(s, `${t}s`, { x: tx - 0.4, y: y + h + 0.05, w: 0.8, h: 0.25, fontSize: 10, color: C.muted, align: "center" });
  });
  rows.forEach((r, i) => {
    const ry = y + 0.1 + i * rowH;
    text(s, r.name, { x: x + r.depth * 0.3, y: ry, w: labelW - r.depth * 0.3, h: 0.36, fontFace: F.mono, fontSize: 12, color: C.ink, valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, {
      x: barX + (r.start / max) * barW, y: ry + 0.04, w: Math.max((r.dur / max) * barW, 0.04), h: 0.28,
      fill: { color: r.color }, line: { color: r.color, width: 0 },
    });
    text(s, r.note, { x: barX + ((r.start + r.dur) / max) * barW + 0.1, y: ry, w: 2.6, h: 0.36, fontSize: 11, color: C.muted, valign: "middle" });
  });
}

function box(s, x, y, w, h, head, sub) {
  panel(s, x, y, w, h);
  text(s, head, { x, y: y + 0.2, w, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.ink, align: "center" });
  if (sub) text(s, sub, { x: x + 0.15, y: y + 0.6, w: w - 0.3, h: h - 0.7, fontSize: 12, color: C.muted, align: "center" });
}

function arrow(s, x, y, w) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: C.muted, width: 1.25, endArrowType: "triangle" } });
}

// ---------------------------------------------------------------- slides

// 1. Title
{
  theme(true);
  const s = pres.addSlide();
  page += 1;
  s.background = { color: C.bg };
  s.addText("Data Sense  ·  AI Discussions", { x: M, y: 1.35, w: 8, h: 0.35, fontFace: F.sans, fontSize: 14, bold: true, color: C.clay, charSpacing: 2, margin: 0 });
  s.addText([{ text: "AI ", options: { color: C.ink } }, { text: "Observability", options: { color: C.clay, italic: true } }], { x: M, y: 1.9, w: 8, h: 1.3, fontFace: F.serif, fontSize: 66, margin: 0 });
  s.addText("See what your AI app is doing, step by step.", { x: M, y: 3.3, w: 7.5, h: 0.6, fontFace: F.serif, fontSize: 24, color: C.body, margin: 0 });
  s.addText("Foundations  ·  Tuesday, October 20, 2026  ·  7:00 PM PT", { x: M, y: 6.35, w: 8, h: 0.35, fontFace: F.sans, fontSize: 12, color: C.muted, margin: 0 });
  // a trace, drawn as the cover art
  const bars = [[0, 4.0, C.clay], [0, 1.5, C.kraft], [1.5, 2.5, "6A9BCC"], [1.6, 2.4, "788C5D"]];
  const names = ["weather_assistant", "get_weather", "ask_ai", "gpt-4o-mini"];
  s.addShape(pres.shapes.RECTANGLE, { x: 8.55, y: 1.55, w: 4.35, h: 3.3, fill: { color: C.card }, line: { color: C.line, width: 0.75 } });
  bars.forEach(([st, w, color], i) => {
    const y = 1.85 + i * 0.72;
    s.addText(names[i], { x: 8.8 + (i ? 0.2 : 0) + (i === 3 ? 0.2 : 0), y, w: 3.5, h: 0.25, fontFace: F.mono, fontSize: 10, color: C.muted, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 8.8 + st * 0.95, y: y + 0.28, w: w * 0.95, h: 0.2, fill: { color }, line: { color, width: 0 } });
  });
  s.addNotes("Welcome. Tonight is about one skill: when an AI app misbehaves, being able to see exactly what happened inside it. No prior knowledge needed.");
  theme(false);
}

// 2. The problem
{
  const s = slide("Why we are here", true);
  title(s, "Your AI assistant gave a wrong answer, and nothing told you why");
  panel(s, M, 2.0, 5.8, 3.9);
  text(s, "Customer", { x: M + 0.4, y: 2.3, w: 3, h: 0.3, fontSize: 11, color: C.muted });
  text(s, "Can I get a refund after 60 days?", { x: M + 0.4, y: 2.6, w: 5, h: 0.4, fontSize: 17, color: C.ink });
  text(s, "Assistant", { x: M + 0.4, y: 3.35, w: 3, h: 0.3, fontSize: 11, color: C.muted });
  text(s, "Yes, refunds are available anytime.", { x: M + 0.4, y: 3.65, w: 5, h: 0.4, fontSize: 17, color: C.red });
  s.addShape(pres.shapes.LINE, { x: M + 0.4, y: 4.45, w: 5.0, h: 0, line: { color: C.line, width: 0.75 } });
  text(s, "The real policy is 30 days. The server dashboard showed no errors.", { x: M + 0.4, y: 4.65, w: 5.0, h: 0.9, fontSize: 14, color: C.body });

  text(s, "To fix it you need answers to:", { x: 7.3, y: 2.0, w: 5.3, h: 0.4, fontFace: F.sans, bold: true, fontSize: 17, color: C.ink });
  bullets(s, ["Which question was sent to the AI model?", "What did each step return?", "How long did each step take?", "What did it cost?"], { x: 7.3, y: 2.6, w: 5.3, h: 3 });
  s.addNotes("Ask the room: how would you find out why this happened? Most people say print statements or logs. Keep that answer in mind. The dashboard was green because nothing crashed. AI apps often fail by being confidently wrong.");
}

// 3. Agenda
{
  const s = slide("Agenda");
  title(s, "Tonight: the basics first, then three tools on the same tiny example");
  const rows = [
    ["1", "The basics", "Logs, metrics, traces and spans in plain words", "Notebook 01"],
    ["2", "Langfuse", "Send your first trace to a real dashboard", "Notebook 02"],
    ["3", "LangSmith", "The same example in a second tool", "Notebook 03"],
    ["4", "Other tools", "OpenTelemetry, Datadog, Dynatrace, and how to choose", "Notebook 04"],
  ];
  rows.forEach(([n, t, d, nb], i) => {
    const y = 2.0 + i * 1.05;
    s.addShape(pres.shapes.LINE, { x: M, y: y - 0.12, w: W - 2 * M, h: 0, line: { color: C.line, width: 0.75 } });
    text(s, n, { x: M, y, w: 0.6, h: 0.7, fontFace: F.serif, fontSize: 32, color: C.clay });
    text(s, t, { x: M + 0.8, y: y + 0.05, w: 3.2, h: 0.5, fontFace: F.sans, bold: true, fontSize: 19, color: C.ink });
    text(s, d, { x: M + 4.1, y: y + 0.08, w: 5.8, h: 0.5, fontSize: 16 });
    text(s, nb, { x: W - M - 2, y: y + 0.08, w: 2, h: 0.5, fontSize: 13, color: C.muted, align: "right" });
  });
  s.addNotes("Four parts. The basics take the longest, because once you understand traces and spans every tool feels familiar. One example all night: a tiny weather assistant.");
}

// 4. Video
{
  const s = slide("Warm-up");
  title(s, "Four-minute overview");
  const vw = 9.2, vh = vw * 9 / 16, vx = (W - vw) / 2;
  if (process.env.NO_VIDEO) s.addImage({ path: A("video-thumbnail.jpg"), x: vx, y: 1.55, w: vw, h: vh });
  else s.addMedia({ type: "video", path: VIDEO, cover: "data:image/jpeg;base64," + fs.readFileSync(A("video-thumbnail.jpg")).toString("base64"), x: vx, y: 1.55, w: vw, h: vh });
  s.addNotes("Play the video. It introduces every word we use tonight, so the rest of the session can build on it.");
}

// ---------------------------------------------------------------- Part 1
divider("1", "The basics", "What observability means, and the four kinds of information an app can leave behind.", "Part one. No tools yet, only ideas.");

// 6. Monitoring vs observability
{
  const s = slide("1  The basics");
  title(s, "Monitoring tells you something is wrong; observability tells you why");
  [["Monitoring", "Is it broken?", ["Questions decided in advance", "Dashboards and alerts", "Catches problems you expected"]],
   ["Observability", "Why is it broken?", ["Questions you ask afterwards", "Answered from data the app leaves behind", "Explains problems you did not expect"]]].forEach(([h, q, pts], i) => {
    const x = M + i * 6.05, w = 5.8;
    panel(s, x, 2.0, w, 4.0);
    text(s, h, { x: x + 0.4, y: 2.3, w: 4, h: 0.3, fontSize: 13, color: i ? C.blue : C.muted, fontFace: F.sans, bold: true });
    text(s, q, { x: x + 0.4, y: 2.7, w: w - 0.8, h: 0.7, fontFace: F.sans, bold: true, fontSize: 28, color: C.ink });
    bullets(s, pts, { x: x + 0.4, y: 3.65, w: w - 0.8, h: 2.1 });
  });
  s.addNotes("Monitoring checks for problems you predicted. Observability lets you investigate problems you did not predict. With AI apps, most problems are ones nobody predicted.");
}

// 7. AI is different
{
  const s = slide("1  The basics");
  title(s, "AI apps break the old rules, so a green dashboard is not enough");
  table(s, [
    ["", "Traditional app", "AI app"],
    ["Same input", "Same output every time", "A different answer each time"],
    ["When it fails", "An error message, a crash", "A confident wrong answer, no error"],
    ["Cost", "Fixed server cost", "Every request costs money (tokens)"],
    ["Where the logic lives", "In the code", "In prompts, the model and its tools"],
    ["Speed", "Milliseconds", "Seconds, and it varies a lot"],
  ], { x: M, y: 2.0, w: W - 2 * M, colW: [2.9, 4.5, 4.53], rowH: 0.62 });
  s.addNotes("The key row is 'when it fails'. A normal app crashes. An AI app gives a polite, confident, wrong answer, and every dashboard stays green.");
}

// 8. Parcel analogy
{
  const s = slide("1  The basics", true);
  title(s, "You already use observability every time you track a parcel");
  const rows = [
    ["Log", "“Door locked, will retry tomorrow”", "A short message about one moment", C.green],
    ["Metric", "“12,400 parcels delivered today”", "A number that summarizes many things", C.orange],
    ["Trace", "The full tracking history of your parcel", "Everything that happened to one request", C.kraft],
    ["Span", "“Left warehouse, took 3 hours”", "One step inside a trace, with its duration", C.purple],
  ];
  text(s, "Software word", { x: M + 0.3, y: 1.95, w: 2, h: 0.3, fontSize: 11, color: C.muted });
  text(s, "Parcel example", { x: M + 2.2, y: 1.95, w: 4, h: 0.3, fontSize: 11, color: C.muted });
  text(s, "What it means", { x: M + 7.4, y: 1.95, w: 4, h: 0.3, fontSize: 11, color: C.muted });
  rows.forEach(([w, ex, m, color], i) => {
    const y = 2.35 + i * 1.0;
    panel(s, M, y, W - 2 * M, 0.82);
    text(s, w, { x: M + 0.3, y, w: 1.9, h: 0.82, fontFace: F.sans, bold: true, fontSize: 20, color, valign: "middle" });
    text(s, ex, { x: M + 2.2, y, w: 5.0, h: 0.82, fontSize: 16, color: C.ink, valign: "middle" });
    text(s, m, { x: M + 7.4, y, w: 4.5, h: 0.82, fontSize: 15, valign: "middle" });
  });
  s.addNotes("This is the most important slide of the night. Keep coming back to it. A log is the driver's note. A metric is the daily total. A trace is your parcel's whole history. A span is one line in that history, with how long it took.");
}

// 9. The example
{
  const s = slide("1  The basics");
  title(s, "Our example is a two-step weather assistant, used in every notebook");
  code(s, M, 1.95, 7.4, 4.3, [
    [["def ", C.kw], ["get_weather", C.fn], ["(city):", C.ink]],
    [["    time.sleep(0.5)           ", C.ink], ["# pretend: slow website", C.cm]],
    [["    return ", C.kw], ["FAKE_WEATHER[city]", C.ink]],
    [" "],
    [["def ", C.kw], ["ask_ai", C.fn], ["(question):", C.ink]],
    [["    return ", C.kw], ["...call gpt-4o-mini...", C.ink]],
    [" "],
    [["def ", C.kw], ["weather_assistant", C.fn], ["(city):", C.ink]],
    [["    weather = get_weather(city)", C.ink]],
    [["    return ", C.kw], ["ask_ai(", C.ink], ['f"It is {weather}. Umbrella?"', C.str], [")", C.ink]],
  ], 14);
  text(s, "Step 1", { x: 8.6, y: 2.0, w: 4, h: 0.3, fontSize: 12, color: C.muted });
  text(s, "Look up the weather for a city", { x: 8.6, y: 2.3, w: 4, h: 0.4, fontSize: 17, color: C.ink });
  text(s, "Step 2", { x: 8.6, y: 3.0, w: 4, h: 0.3, fontSize: 12, color: C.muted });
  text(s, "Ask an AI model: should I carry an umbrella?", { x: 8.6, y: 3.3, w: 4, h: 0.7, fontSize: 17, color: C.ink });
  text(s, "Plain Python. The rest of tonight only adds a few lines to it.", { x: 8.6, y: 4.6, w: 4, h: 0.8, fontSize: 14, color: C.muted, italic: true });
  s.addNotes("Read the code with the room. Two steps: get_weather pretends to call a website and takes half a second, ask_ai calls gpt-4o-mini. This exact function is in notebook 01.");
}

// 10. Logs
{
  const s = slide("1  The basics");
  title(s, "Logs record what happened, but get hard to follow with many users");
  code(s, M, 1.95, 7.4, 2.0, [
    [["17:54:28  INFO  ", C.cm], ["request started for London", C.ink]],
    [["17:54:29  INFO  ", C.cm], ["weather is stormy, 11°C", C.ink]],
    [["17:54:30  INFO  ", C.cm], ["AI answered: Yes, you should carry an umbrella.", C.ink]],
  ], 13);
  text(s, "Output from notebook 01: three log lines for one request.", { x: M, y: 4.05, w: 7.4, h: 0.3, fontSize: 11, color: C.muted, italic: true });
  text(s, "Good at", { x: 8.6, y: 1.95, w: 4, h: 0.3, fontFace: F.sans, bold: true, fontSize: 15, color: C.green });
  text(s, "Details: error messages, values, what the code decided.", { x: 8.6, y: 2.3, w: 4, h: 0.8, fontSize: 15 });
  text(s, "Weak at", { x: 8.6, y: 3.3, w: 4, h: 0.3, fontFace: F.sans, bold: true, fontSize: 15, color: C.red });
  text(s, "With a thousand users at once, lines from different people are mixed together.", { x: 8.6, y: 3.65, w: 4, h: 1.0, fontSize: 15 });
  s.addNotes("Logs are messages your code writes at important moments. Perfect for one request. With many users at once, the lines interleave and you cannot tell which belong together.");
}

// 11. Metrics
{
  const s = slide("1  The basics");
  title(s, "Metrics summarize many requests, but not which step was slow");
  [["4", "requests served"], ["1.20 s", "average time"], ["1.29 s", "slowest request"]].forEach(([v, l], i) => {
    const x = M + i * 4.05;
    panel(s, x, 2.0, 3.8, 2.0);
    text(s, v, { x: x + 0.4, y: 2.2, w: 3.2, h: 0.95, fontFace: F.serif, fontSize: 50, color: C.clay });
    text(s, l, { x: x + 0.4, y: 3.25, w: 3.2, h: 0.4, fontSize: 15 });
  });
  text(s, "On a real system these numbers live on a dashboard, with an alert when the average goes above a limit.", { x: M, y: 4.4, w: 11.9, h: 0.5, fontSize: 16 });
  text(s, "But “the average is 1.2 seconds” does not say whether the weather lookup or the AI model was slow.", { x: M, y: 5.0, w: 11.9, h: 0.5, fontSize: 16, color: C.ink });
  source(s, "Numbers from notebook 01, four cities.");
  s.addNotes("Metrics are numbers that summarize: how many, how fast, how many failed. They tell you that something is slow, not why. For why, we need to look inside one request.");
}

// 12. Trace
{
  const s = slide("1  The basics", true);
  title(s, "A trace shows one request step by step, and where time went");
  panel(s, M, 1.95, W - 2 * M, 2.6);
  waterfall(s, M + 0.3, 2.15, W - 2 * M - 0.6, [
    { name: "weather_assistant", start: 0, dur: 1.17, color: C.clay, depth: 0, note: "1.17 s  (whole request)" },
    { name: "get_weather", start: 0, dur: 0.50, color: C.kraft, depth: 1, note: "0.50 s" },
    { name: "ask_ai", start: 0.50, dur: 0.66, color: C.green, depth: 1, note: "0.66 s" },
  ], [0, 0.5, 1.0, 1.5]);
  text(s, "Trace", { x: M, y: 4.85, w: 2, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.blue });
  text(s, "The whole story of one request (the top bar).", { x: M + 1.4, y: 4.85, w: 10, h: 0.35, fontSize: 15 });
  text(s, "Span", { x: M, y: 5.35, w: 2, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.purple });
  text(s, "One step, with a start and an end (each bar). Steps sit inside the request.", { x: M + 1.4, y: 5.35, w: 10, h: 0.35, fontSize: 15 });
  source(s, "Real trace of weather_assistant(\"Tokyo\") from notebook 01. Time runs left to right.");
  s.addNotes("Every tool draws traces like this. The top bar is the whole request; the bars below are its steps. Now the question metrics could not answer has an answer: you can see how much time each step took.");
}

// 13. Creating spans
{
  const s = slide("1  The basics");
  title(s, "Creating spans takes one line per step with OpenTelemetry");
  code(s, M, 1.95, 7.9, 3.4, [
    [["def ", C.kw], ["weather_assistant", C.fn], ["(city):", C.ink]],
    [["    with ", C.kw], ["tracer.start_as_current_span(", C.ink], ['"weather_assistant"', C.str], ["):", C.ink]],
    [["        with ", C.kw], ["tracer.start_as_current_span(", C.ink], ['"get_weather"', C.str], ["):", C.ink]],
    [["            weather = get_weather(city)", C.ink]],
    [["        with ", C.kw], ["tracer.start_as_current_span(", C.ink], ['"ask_ai"', C.str], ["):", C.ink]],
    [["            return ", C.kw], ["ask_ai(...)", C.ink]],
  ], 13);
  text(s, "with ... :", { x: 9.1, y: 2.0, w: 3.6, h: 0.35, fontFace: F.mono, fontSize: 14, color: C.blue });
  text(s, "Everything inside the block is timed and saved as one span.", { x: 9.1, y: 2.4, w: 3.6, h: 0.8, fontSize: 14 });
  text(s, "A block inside a block", { x: 9.1, y: 3.4, w: 3.6, h: 0.35, fontFace: F.sans, bold: true, fontSize: 14, color: C.blue });
  text(s, "becomes a child step, so you get the tree on the previous slide.", { x: 9.1, y: 3.8, w: 3.6, h: 0.8, fontSize: 14 });
  text(s, "OpenTelemetry is a free, standard library. Setting it up is four lines, once per app (notebook 01).", { x: M, y: 5.65, w: 11.9, h: 0.5, fontSize: 15, color: C.muted, italic: true });
  s.addNotes("This is the only new code pattern in the basics. Wrap each step in a with block. Nested blocks become child spans. The setup lines are in notebook 01.");
}

// 14b. The pieces of OpenTelemetry
{
  const s = slide("1  The basics");
  title(s, "Four pieces move a span from your code to a tool");
  table(s, [
    ["Piece", "What it does", "Parcel comparison", "Examples"],
    ["Tracer provider", "Holds the settings for your whole app", "The courier company", "TracerProvider()"],
    ["Tracer", "Creates spans in your code", "The clerk writing tracking entries", "provider.get_tracer(\"weather-assistant\")"],
    ["Span processor", "Decides when finished spans are handed on: one at a time, or in batches", "Mailroom: send each parcel now, or wait and fill a truck", "SimpleSpanProcessor (now), BatchSpanProcessor (in batches, for real apps)"],
    ["Exporter", "Sends spans to a destination", "The delivery truck", "ConsoleSpanExporter (print), InMemorySpanExporter (keep), OTLPSpanExporter (to Langfuse, LangSmith, Datadog...)"],
    ["Collector (optional)", "A separate program that receives spans from many apps, cleans them and forwards them", "A regional sorting hub", "OpenTelemetry Collector, Grafana Alloy, Datadog Agent"],
  ], { x: M, y: 1.85, w: W - 2 * M, colW: [2.05, 3.4, 2.75, 3.73], rowH: 0.72 });
  source(s, "Notebook 01 uses Simple + InMemory so you can see the spans. Notebooks 02 and 04 use batching and OTLP to send them to Langfuse.");
  s.addNotes("Walk through the setup lines from notebook 01 with this table. The provider holds settings, the tracer creates spans, the processor decides when to pass them on, and the exporter delivers them. Simple processor sends each span immediately, which is easy to see in a demo. Batch processor collects spans and sends them in groups in the background, which is what real apps use; that is why short scripts must call flush. The collector is optional: a separate program, like a sorting hub, that many apps send to, which can remove personal data and forward to one or more tools.");
}

// 14. Inside a span
{
  const s = slide("1  The basics");
  title(s, "For AI steps, a span also records the model, tokens and cost");
  table(s, [
    ["What a span stores", "Example: the AI call in our assistant"],
    ["Name", "OpenAI-generation"],
    ["Start and end time", "0.50 s to 1.03 s"],
    ["Inside of", "ask_ai, inside weather_assistant"],
    ["Model", "gpt-4o-mini"],
    ["Tokens in / out", "31 / 8"],
    ["Cost", "$0.000009"],
    ["Input and output", "The question sent, the answer received"],
  ], { x: M, y: 1.95, w: 8.2, colW: [3.2, 5.0], rowH: 0.5 });
  text(s, "Tokens", { x: 9.4, y: 2.0, w: 3.3, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.ink });
  text(s, "Pieces of words. AI providers charge per token, so tokens are how you see cost.", { x: 9.4, y: 2.4, w: 3.3, h: 1.2, fontSize: 14 });
  text(s, "You do not record these by hand. Langfuse and LangSmith fill them in for you.", { x: 9.4, y: 3.8, w: 3.3, h: 1.2, fontSize: 14 });
  source(s, "Values from a real trace in the local Langfuse (notebook 02).");
  s.addNotes("A span is just a record with fields. For AI calls, the useful extra fields are model, tokens and cost. Tokens are pieces of words; you pay per token.");
}

// 15. OpenTelemetry pipeline
{
  const s = slide("1  The basics", true);
  title(s, "OpenTelemetry is the common language all tools understand");
  const y = 2.5;
  box(s, M, y, 2.8, 1.4, "Your app", "creates spans with OpenTelemetry");
  arrow(s, M + 2.9, y + 0.7, 0.8);
  box(s, M + 3.8, y, 2.8, 1.4, "Exporter", "sends spans in the background");
  arrow(s, M + 6.7, y + 0.7, 0.8);
  ["Langfuse", "LangSmith", "Datadog", "Dynatrace"].forEach((t, i) => {
    const ty = 1.95 + i * 0.68;
    panel(s, M + 7.6, ty, 2.3, 0.55);
    text(s, t, { x: M + 7.6, y: ty, w: 2.3, h: 0.55, fontFace: F.sans, bold: true, fontSize: 14, color: C.ink, align: "center", valign: "middle" });
  });
  text(s, "Each tool stores the spans and shows them on a web page.", { x: M + 10.2, y: 2.4, w: 1.75, h: 1.8, fontSize: 13 });
  text(s, "Switching tools means changing where the exporter sends data. Your functions stay the same.", { x: M, y: 5.0, w: 11.9, h: 0.5, fontSize: 16, color: C.ink });
  s.addNotes("OpenTelemetry is a free, open standard. Your app creates spans, an exporter sends them, and a tool displays them. Because every tool understands it, you are never locked in.");
}

// 16. What to measure
{
  const s = slide("1  The basics");
  title(s, "Five things are worth watching in every AI app");
  [
    ["Speed", "How long requests take, especially the slowest ones"],
    ["Errors", "Timeouts, failed tools, rate limits"],
    ["Tokens", "How much text goes in and out of the model"],
    ["Cost", "Money per request, per user, per day"],
    ["Quality", "Thumbs up or down, or another AI grading answers"],
  ].forEach(([t, d], i) => {
    const x = M + i * 2.42, w = 2.25;
    panel(s, x, 2.0, w, 2.6);
    text(s, String(i + 1), { x: x + 0.25, y: 2.2, w: 1, h: 0.5, fontFace: F.serif, fontSize: 28, color: C.clay });
    text(s, t, { x: x + 0.25, y: 2.75, w: w - 0.4, h: 0.4, fontFace: F.sans, bold: true, fontSize: 18, color: C.ink });
    text(s, d, { x: x + 0.25, y: 3.25, w: w - 0.4, h: 1.2, fontSize: 13 });
  });
  text(s, "Also record who asked (user) and which prompt version you used, so you can compare later.", { x: M, y: 5.0, w: 11.9, h: 0.5, fontSize: 16, color: C.ink });
  s.addNotes("Keep this light. Five things: speed, errors, tokens, cost, quality. And always record who asked and which prompt version, so you can answer 'did yesterday's change make it worse?'");
}

// 17. Cost example
{
  const s = slide("1  The basics");
  title(s, "A friendlier prompt made answers longer and doubled the monthly bill");
  s.addChart(pres.charts.BAR, [
    { name: "Concise prompt", labels: ["gpt-4.1-nano", "gpt-4o-mini"], values: [6.3, 10.1] },
    { name: "Friendly prompt", labels: ["gpt-4.1-nano", "gpt-4o-mini"], values: [12.6, 21.5] },
  ], {
    x: M, y: 1.95, w: 7.6, h: 4.4, barDir: "col", barGapWidthPct: 60,
    chartColors: ["3D3D3A", C.clay], chartArea: { fill: { color: C.card }, border: { color: C.line, pt: 0.75 } },
    plotArea: { fill: { color: C.card } },
    catAxisLabelColor: C.body, valAxisLabelColor: C.muted, catAxisLabelFontFace: F.sans, valAxisLabelFontFace: F.sans,
    catAxisLabelFontSize: 12, valAxisLabelFontSize: 10, valGridLine: { color: "E8E4DB", size: 0.5 }, catGridLine: { style: "none" },
    showValue: true, dataLabelFormatCode: "$0", dataLabelColor: C.ink, dataLabelFontSize: 12, dataLabelPosition: "outEnd",
    showLegend: true, legendPos: "t", legendFontFace: F.sans, legendFontSize: 12, legendColor: C.body,
    valAxisLabelFormatCode: "$0",
  });
  text(s, "31 tokens", { x: 8.8, y: 2.0, w: 4, h: 0.6, fontFace: F.serif, fontSize: 32, color: C.ink });
  text(s, "average answer, concise prompt", { x: 8.8, y: 2.6, w: 4, h: 0.35, fontSize: 13, color: C.muted });
  text(s, "87 tokens", { x: 8.8, y: 3.2, w: 4, h: 0.6, fontFace: F.serif, fontSize: 32, color: C.clay });
  text(s, "average answer, friendly prompt", { x: 8.8, y: 3.8, w: 4, h: 0.35, fontSize: 13, color: C.muted });
  text(s, "Longer answers mean more tokens, and more tokens mean more money. You only see this if you measure it.", { x: 8.8, y: 4.5, w: 3.9, h: 1.4, fontSize: 14 });
  source(s, "Projected cost at 10,000 requests per day, USD per month. Measured on 48 real requests (notebooks/advanced/05).");
  s.addNotes("A one-line prompt change, 'be warm and chatty', made answers almost three times longer. Same model, double the bill. This is why cost belongs in observability.");
}

// ---------------------------------------------------------------- Part 2
divider("2", "Langfuse", "Send the same assistant to a real dashboard, running on this laptop.", "Part two. Switch to JupyterLab, notebook 02.");

// 19. Langfuse intro
{
  const s = slide("2  Langfuse");
  title(s, "Langfuse is a free, open source dashboard for AI traces");
  s.addImage({ path: A("logo-langfuse-color.png"), x: W - M - 0.6, y: 0.3, w: 0.55, h: 0.55 });
  code(s, M, 2.0, 5.6, 1.5, [
    [["make ", C.fn], ["up", C.ink]],
    [["open ", C.fn], ["http://localhost:3000", C.str]],
  ], 15);
  text(s, "Login: admin@observability.lab  /  observability123", { x: M, y: 3.65, w: 5.6, h: 0.35, fontSize: 13, color: C.muted });
  text(s, "What starts in Docker", { x: 7.0, y: 2.0, w: 5.6, h: 0.35, fontFace: F.sans, bold: true, fontSize: 15, color: C.ink });
  table(s, [
    ["Part", "Job"],
    ["Web app", "The dashboard; receives traces"],
    ["Worker", "Processes traces, works out cost"],
    ["Databases", "Postgres, ClickHouse, Redis and MinIO store everything"],
  ], { x: 7.0, y: 2.45, w: 5.63, colW: [1.6, 4.03], rowH: 0.5 });
  text(s, "In short: a website and a database on your own machine. Nothing leaves your laptop except the AI call itself.", { x: M, y: 4.9, w: 11.9, h: 0.6, fontSize: 16, color: C.ink });
  s.addNotes("Do not explain every container. It is a website and a database on my laptop. The login is created automatically when it starts.");
}

// 19b. Setting up Langfuse
{
  const s = slide("2  Langfuse");
  title(s, "Setting up Langfuse on your laptop takes five steps");
  const steps = [
    ["1", "Install Docker Desktop", "From docker.com, install, then open it once", "docker --version"],
    ["2", "Download Langfuse", "The official setup files from GitHub", "git clone https://github.com/langfuse/langfuse.git"],
    ["3", "Start it", "First start takes 2 to 3 minutes", "cd langfuse && docker compose up -d"],
    ["4", "Create the admin account", "Click Sign up. No default admin: you pick the password", "http://localhost:3000"],
    ["5", "Create a project and API keys", "Settings, API Keys. Copy both keys into .env", "LANGFUSE_PUBLIC_KEY=pk-lf-..."],
  ];
  steps.forEach(([n, t, d, cmd], i) => {
    const y = 1.85 + i * 0.93;
    panel(s, M, y, W - 2 * M, 0.8);
    text(s, n, { x: M + 0.25, y, w: 0.5, h: 0.8, fontFace: F.serif, fontSize: 28, color: C.clay, valign: "middle" });
    text(s, t, { x: M + 0.8, y: y + 0.1, w: 3.4, h: 0.35, fontFace: F.sans, bold: true, fontSize: 15, color: C.ink });
    text(s, d, { x: M + 0.8, y: y + 0.42, w: 4.7, h: 0.3, fontSize: 12, color: C.muted });
    text(s, cmd, { x: M + 5.6, y, w: 6.2, h: 0.8, fontFace: F.mono, fontSize: 12, color: C.ink, valign: "middle" });
  });
  source(s, "Shortcut used tonight: the repo's make up starts the same stack and creates the admin login and keys automatically.");
  s.addNotes("Walk through the five steps once, slowly. Docker Desktop runs the containers. The official repo contains the docker compose file. There is no default admin: you sign up, and you own the organization and project you create. API keys belong to a project. Tonight I used the repo's make up, which does the same thing and pre-creates the admin login and keys through Langfuse's headless initialization settings.");
}

// 20. Two changes
{
  const s = slide("2  Langfuse");
  title(s, "Adding Langfuse takes two changes to the same function");
  code(s, M, 1.95, 7.6, 4.4, [
    [["from ", C.kw], ["langfuse ", C.ink], ["import ", C.kw], ["observe", C.ink]],
    [["from ", C.kw], ["langfuse.openai ", C.ink], ["import ", C.kw], ["OpenAI   ", C.ink], ["# change 1", C.orange]],
    [" "],
    [["@observe()                         ", C.ink], ["# change 2", C.orange]],
    [["def ", C.kw], ["get_weather", C.fn], ["(city): ...", C.ink]],
    [" "],
    [["@observe()", C.ink]],
    [["def ", C.kw], ["ask_ai", C.fn], ["(question): ...", C.ink]],
    [" "],
    [["@observe()", C.ink]],
    [["def ", C.kw], ["weather_assistant", C.fn], ["(city): ...", C.ink]],
  ], 14);
  text(s, "Change 1", { x: 8.8, y: 2.0, w: 3.9, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.orange });
  text(s, "Import OpenAI from Langfuse. Every AI call is recorded: question, answer, model, tokens, cost.", { x: 8.8, y: 2.4, w: 3.9, h: 1.2, fontSize: 14 });
  text(s, "Change 2", { x: 8.8, y: 3.75, w: 3.9, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.orange });
  text(s, "@observe() turns each function into a span, like the with blocks before.", { x: 8.8, y: 4.15, w: 3.9, h: 1.0, fontSize: 14 });
  text(s, "Then call langfuse.flush() to send.", { x: 8.8, y: 5.3, w: 3.9, h: 0.5, fontSize: 14, color: C.muted, italic: true });
  s.addNotes("Run notebook 02. Scroll to the change comments and stop there. Everything else is the code they already know.");
}

// 21. Result
{
  const s = slide("2  Langfuse", true);
  title(s, "Langfuse adds the AI call details we never wrote");
  panel(s, M, 1.95, W - 2 * M, 2.95);
  waterfall(s, M + 0.3, 2.15, W - 2 * M - 0.6, [
    { name: "weather_assistant", start: 0, dur: 1.03, color: C.clay, depth: 0, note: "1.03 s" },
    { name: "get_weather", start: 0, dur: 0.50, color: C.kraft, depth: 1, note: "0.50 s" },
    { name: "ask_ai", start: 0.50, dur: 0.53, color: C.green, depth: 1, note: "0.53 s" },
    { name: "OpenAI-generation", start: 0.50, dur: 0.53, color: C.purple, depth: 2, note: "39 tokens  ·  $0.000009" },
  ], [0, 0.5, 1.0, 1.5]);
  text(s, "In the Langfuse page: click Tracing, open the newest trace, then click each row. The last row shows the exact question sent, the reply, the model, tokens and cost.", { x: M, y: 5.15, w: 11.9, h: 0.8, fontSize: 15 });
  source(s, "Real trace fetched from the local Langfuse (notebook 02).");
  s.addNotes("Switch to the browser. Tracing, newest trace, click every row. Finish on OpenAI-generation: the import recorded it for us.");
}

// ---------------------------------------------------------------- Part 3
divider("3", "LangSmith", "The same assistant in a second tool. Notice how little changes.", "Part three. Notebook 03.");

// 23. LangSmith
{
  const s = slide("3  LangSmith");
  title(s, "LangSmith needs the same two changes, with different names");
  s.addImage({ path: A("logo-langchain-color.png"), x: W - M - 0.6, y: 0.3, w: 0.55, h: 0.55 });
  table(s, [
    ["Purpose", "Langfuse", "LangSmith"],
    ["Record every AI call", "from langfuse.openai import OpenAI", "client = wrap_openai(OpenAI())"],
    ["Turn a function into a span", "@observe()", "@traceable"],
    ["Settings in .env", "LANGFUSE_PUBLIC_KEY, ..._SECRET_KEY", "LANGSMITH_API_KEY, LANGSMITH_TRACING=true"],
    ["Where it runs", "Your laptop or their cloud", "Their cloud (smith.langchain.com)"],
  ], { x: M, y: 1.95, w: W - 2 * M, colW: [3.0, 4.45, 4.48], rowH: 0.62 });
  text(s, "Get a free key at smith.langchain.com, add it to .env, and run notebook 03.", { x: M, y: 5.4, w: 11.9, h: 0.5, fontSize: 16, color: C.ink });
  s.addNotes("Put notebook 02 and 03 side by side. observe becomes traceable, the import becomes wrap_openai. The trace tree in LangSmith looks the same.");
}

// 24. Vocabulary
{
  const s = slide("3  LangSmith", true);
  title(s, "Each tool uses its own words for the same few ideas");
  table(s, [
    ["The idea", "OpenTelemetry", "Langfuse", "LangSmith"],
    ["One request, start to finish", "Trace", "Trace", "Trace"],
    ["One step", "Span", "Observation", "Run"],
    ["An AI model call", "Span with AI details", "Generation", "LLM run"],
    ["A folder of traces", "Service", "Project", "Project"],
    ["A conversation", "", "Session", "Thread"],
  ], { x: M, y: 1.95, w: W - 2 * M, colW: [3.5, 2.8, 2.8, 2.83], rowH: 0.62 });
  text(s, "When a tool says observation, run or generation, read it as “a span”.", { x: M, y: 5.95, w: 11.9, h: 0.5, fontSize: 16, color: C.ink });
  s.addNotes("This table removes most of the confusion. Say it out loud every time a tool uses its own word: that is a span.");
}

// ---------------------------------------------------------------- Part 4
divider("4", "Other tools", "Langfuse and LangSmith are not the only options.", "Part four. Notebook 04, then the landscape.");

// 26. Landscape
{
  const s = slide("4  Other tools");
  title(s, "Tools come in two groups: built for AI apps, or general monitoring");
  [
    ["Built for AI apps", "Understand prompts, tokens and cost out of the box", [["logo-langfuse-color.png", "Langfuse", "Open source, self-host"], ["logo-langchain-color.png", "LangSmith", "Hosted, from the LangChain team"], ["logo-phoenix-color.png", "Arize Phoenix", "Open source, lightweight"]]],
    ["General monitoring platforms", "Put AI traces next to servers and databases", [["logo-datadog-color.png", "Datadog", "LLM Observability add-on"], ["logo-dynatrace-color.png", "Dynatrace", "AI features on full monitoring"], ["logo-grafana-color.png", "Grafana", "Open source dashboards"]]],
  ].forEach(([h, d, tools], g) => {
    const x = M + g * 6.05, w = 5.8;
    text(s, h, { x, y: 1.95, w, h: 0.35, fontFace: F.sans, bold: true, fontSize: 17, color: C.ink });
    text(s, d, { x, y: 2.3, w, h: 0.35, fontSize: 13, color: C.muted });
    tools.forEach(([logo, name, desc], i) => {
      const y = 2.85 + i * 1.05;
      panel(s, x, y, w, 0.88);
      s.addImage({ path: A(logo), x: x + 0.25, y: y + 0.17, w: 0.54, h: 0.54, sizing: { type: "contain", w: 0.54, h: 0.54 } });
      text(s, name, { x: x + 1.05, y: y + 0.12, w: 2.4, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.ink });
      text(s, desc, { x: x + 1.05, y: y + 0.47, w: 4.5, h: 0.3, fontSize: 12, color: C.muted });
    });
  });
  s.addNotes("Two families. AI-first tools understand prompts and tokens. Big monitoring platforms put AI traces next to everything else the company runs. All of them understand OpenTelemetry.");
}

// 27. Change the address
{
  const s = slide("4  Other tools");
  title(s, "Switching tools means changing an address, not code");
  table(s, [
    ["Tool", "Where to send spans (endpoint)", "Key (header)"],
    ["Langfuse", "http://localhost:3000/api/public/otel", "Authorization: Basic <keys>"],
    ["LangSmith", "https://api.smith.langchain.com/otel", "x-api-key: <key>"],
    ["Dynatrace", "https://<id>.live.dynatrace.com/api/v2/otlp", "Authorization: Bearer <token>"],
    ["Datadog", "Your Datadog site's OTLP address", "dd-api-key: <key>"],
  ], { x: M, y: 1.95, w: W - 2 * M, colW: [2.0, 5.6, 4.33], rowH: 0.62 });
  text(s, "Notebook 04 sends the notebook 01 assistant to Langfuse using only OpenTelemetry, with no Langfuse code at all.", { x: M, y: 5.4, w: 11.9, h: 0.5, fontSize: 16, color: C.ink });
  s.addNotes("Run notebook 04 and show the trace named 'plain OpenTelemetry' arriving in Langfuse. Then this table: same code, different address.");
}

// 28. How to choose
{
  const s = slide("4  Other tools");
  title(s, "Pick the tool that fits your situation");
  table(s, [
    ["If...", "Then try"],
    ["You are learning or building a side project", "Langfuse, on your laptop like tonight"],
    ["Your app uses LangChain or LangGraph", "LangSmith"],
    ["Your data must not leave the company", "Langfuse or Phoenix, self-hosted"],
    ["Your company already pays for Datadog or Dynatrace", "Their AI features, fed by OpenTelemetry"],
  ], { x: M, y: 1.95, w: W - 2 * M, colW: [6.2, 5.73], rowH: 0.7 });
  s.addNotes("There is no single best tool. Match it to the situation. And because of OpenTelemetry, the choice is reversible.");
}

// 29. Recap
{
  const s = slide("Recap", true);
  title(s, "Four things to remember");
  [
    ["Observability", "means your app leaves enough behind to explain what happened."],
    ["Logs, metrics, traces, spans:", "messages, numbers, the story of one request, and its steps."],
    ["Langfuse and LangSmith", "add tracing with two small changes and record AI details for you."],
    ["OpenTelemetry", "is the common language, so you can switch tools without rewriting code."],
  ].forEach(([a, b], i) => {
    const y = 2.0 + i * 1.0;
    text(s, String(i + 1), { x: M, y, w: 0.6, h: 0.6, fontFace: F.serif, fontSize: 30, color: C.clay });
    s.addText([{ text: a + " ", options: { fontFace: F.sans, bold: true, color: C.ink } }, { text: b, options: { color: C.body } }], { x: M + 0.7, y: y + 0.05, w: 11.2, h: 0.6, fontFace: F.sans, fontSize: 19, margin: 0, valign: "top" });
  });
  s.addNotes("Read the four points aloud. If people remember one thing: a trace is the story of one request, and spans are its steps.");
}

// 30. Questions
{
  const s = slide(null, true);
  s.addText([{ text: "Questions", options: { color: C.ink } }, { text: "?", options: { color: C.clay } }], { x: M, y: 1.5, w: 8, h: 1.2, fontFace: F.serif, fontSize: 64, margin: 0 });
  text(s, "Try it yourself", { x: M, y: 3.1, w: 6, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.ink });
  text(s, REPO, { x: M, y: 3.5, w: 8, h: 0.4, fontFace: F.mono, fontSize: 15, color: C.blue });
  text(s, "make setup  ·  make up  ·  make lab", { x: M, y: 3.95, w: 8, h: 0.4, fontFace: F.mono, fontSize: 13, color: C.muted });
  text(s, "Next session", { x: M, y: 4.8, w: 6, h: 0.35, fontFace: F.sans, bold: true, fontSize: 16, color: C.ink });
  text(s, "Grading answers automatically, managing prompt versions, alerts and dashboards.", { x: M, y: 5.2, w: 11, h: 0.4, fontSize: 15 });
  s.addNotes("Take questions. Share the repo: three commands and the notebooks run on their own laptops.");
}

pres
  .writeFile({ fileName: path.join(__dirname, process.env.NO_VIDEO ? "AI-Observability-print.pptx" : "AI-Observability.pptx") })
  .then(() => console.log(`wrote ${page} slides`));

"""Write index.html from timing.json: global theme, persistent background, audio, and one host per scene.

Run after scripts/build_vo.py:  python3 scripts/build_index.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
timing = json.loads((ROOT / "timing.json").read_text())
total = timing["total"]

CHAPTERS = {
    "s01-hook": "", "s02-define": "01  What it is", "s03-different": "02  Why AI is different",
    "s04-logs": "03  The four signals", "s05-metrics": "03  The four signals", "s06-traces": "03  The four signals",
    "s07-otel": "04  OpenTelemetry", "s08-semconv": "04  OpenTelemetry", "s08b-code": "04  OpenTelemetry",
    "s09-measure": "05  What to watch", "s10-tools": "06  The tools", "s11-close": "",
}

hosts, ticks = [], []
for i, s in enumerate(timing["scenes"]):
    if not (ROOT / f"compositions/{s['id']}.html").exists():
        continue
    hosts.append(
        f'      <div id="{s["id"]}" data-composition-id="{s["id"]}" data-composition-src="compositions/{s["id"]}.html" '
        f'data-start="{s["start"] if i else 0}" data-duration="{s["duration"] + (s["start"] if i == 0 else 0):.3f}" '
        f'data-track-index="{2 + i % 2}" data-width="1920" data-height="1080"></div>')
    if i:
        ticks.append(f'<i class="tick" style="left:{s["start"] / total * 100:.3f}%"></i>')

chapter_js = json.dumps([[s["start"] if i else 0, CHAPTERS[s["id"]]] for i, s in enumerate(timing["scenes"])])

html = (ROOT / "scripts/index.template.html").read_text()
html = (html.replace("{{TOTAL}}", f"{total:.3f}")
            .replace("{{HOSTS}}", "\n".join(hosts))
            .replace("{{TICKS}}", "".join(ticks))
            .replace("{{CHAPTERS}}", chapter_js))
(ROOT / "index.html").write_text(html)
print("index.html written,", len(hosts), "scenes,", total, "s")

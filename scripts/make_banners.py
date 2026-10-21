"""Generate the SVG banners used at the top of each notebook and the README."""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "notebooks" / "assets"

BANNERS = [
    ("00", "Setup", "Start the local stack before class"),
    ("01", "What Is Observability?", "Logs, metrics, traces and spans in plain words"),
    ("02", "Your First Trace in Langfuse", "Three small changes to a simple function"),
    ("03", "The Same Function in LangSmith", "Different tool, same ideas"),
    ("04", "Beyond Langfuse and LangSmith", "OpenTelemetry, Datadog, Dynatrace and more"),
]

ADVANCED = [
    ("01", "Signals Deep Dive", "Concurrency, metrics instruments and trace context"),
    ("02", "OpenTelemetry in Depth", "Providers, processors, exporters and context"),
    ("03", "Langfuse in Depth", "Sessions, users, errors, guardrails and scores"),
    ("04", "LangSmith in Depth", "Runs, threads, feedback and OTLP ingest"),
    ("05", "Latency and Cost Analytics", "Turn traces into answers your team can act on"),
    ("06", "Enterprise Backends", "A Collector, Datadog and Dynatrace"),
]

# (start, width, row, color) in a 0..100 timeline: a stylised trace waterfall
BARS = [
    (0, 100, 0, "#8B5CF6"),
    (2, 12, 1, "#22D3EE"),
    (15, 38, 2, "#F59E0B"),
    (55, 43, 3, "#2DD4BF"),
    (58, 9, 4, "#F472B6"),
]


def waterfall(x0: int, y0: int, w: int) -> str:
    rows = []
    for start, width, row, color in BARS:
        x = x0 + start * w / 100
        bw = width * w / 100
        y = y0 + row * 30
        rows.append(
            f'<rect x="{x:.1f}" y="{y}" width="{bw:.1f}" height="16" rx="5" fill="{color}" opacity="0.92"/>'
        )
        rows.append(
            f'<line x1="{x0}" y1="{y + 8}" x2="{x0 + w}" y2="{y + 8}" stroke="#ffffff" stroke-opacity="0.05"/>'
        )
    return "\n  ".join(rows)


def banner(num: str, title: str, subtitle: str, kicker: str = "AI OBSERVABILITY LAB") -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" width="1200" height="300" role="img" aria-label="{title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B1020"/>
      <stop offset="1" stop-color="#151B33"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.7">
      <stop offset="0" stop-color="#8B5CF6" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="#ffffff" stroke-opacity="0.035"/>
    </pattern>
  </defs>
  <rect width="1200" height="300" rx="20" fill="url(#bg)"/>
  <rect width="1200" height="300" rx="20" fill="url(#grid)"/>
  <rect width="1200" height="300" rx="20" fill="url(#glow)"/>
  <text x="64" y="92" font-family="Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="3" fill="#2DD4BF">{kicker}  ·  {num}</text>
  <text x="64" y="160" font-family="Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="50" font-weight="800" fill="#F8FAFC">{title}</text>
  <text x="64" y="206" font-family="Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="22" fill="#94A3B8">{subtitle}</text>
  <rect x="64" y="236" width="56" height="4" rx="2" fill="#2DD4BF"/>
  {waterfall(840, 92, 300)}
</svg>
"""


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for num, title, subtitle in BANNERS:
        (OUT / f"banner-{num}.svg").write_text(banner(num, title, subtitle))
    for num, title, subtitle in ADVANCED:
        (OUT / f"banner-adv-{num}.svg").write_text(banner(num, title, subtitle, kicker="GOING FURTHER"))
    (OUT / "hero.svg").write_text(
        banner("OPEN SOURCE", "AI Observability Lab", "Trace, measure and debug LLM apps and agents", kicker="HANDS-ON")
    )
    print("wrote", len(BANNERS) + len(ADVANCED) + 1, "banners to", OUT)

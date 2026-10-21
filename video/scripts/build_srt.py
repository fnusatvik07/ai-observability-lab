"""Write out/ai-observability-explained.srt from the narration text and word timings (for YouTube captions)."""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
timing = json.loads((ROOT / "timing.json").read_text())
lines = {l["id"]: l["text"] for l in json.loads((ROOT / "narration.json").read_text())}
SPOKEN = {"O Tel": "OTel", "O T L P": "OTLP", "S D K": "SDK", "Gen A I": "GenAI", "L L M": "LLM", "I D": "ID",
          "gen A I dot request dot model": "gen_ai.request.model", "gen A I dot usage dot input tokens": "gen_ai.usage.input_tokens"}


def fmt(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


cues = []
for s in timing["scenes"]:
    text = lines[s["id"]]
    for k, v in sorted(SPOKEN.items(), key=lambda kv: -len(kv[0])):
        text = text.replace(k, v)
    sentences = re.split(r"(?<=[.?!])\s+", text)
    words, n = s["words"], len(s["words"])
    counts = [len(x.split()) for x in sentences]
    total_words = sum(counts)
    acc = 0
    for sent, c in zip(sentences, counts):
        a = acc / total_words
        acc += c
        b = acc / total_words
        i0, i1 = min(n - 1, int(a * n)), min(n - 1, max(int(a * n), int(b * n) - 1))
        cues.append((s["start"] + words[i0]["s"], s["start"] + words[i1]["e"] + 0.15, sent))

# never let a cue run into the next one
cues = [(a, min(b, cues[i + 1][0] - 0.02) if i + 1 < len(cues) else b, t) for i, (a, b, t) in enumerate(cues)]
out = ROOT / "out/ai-observability-explained.srt"
out.write_text("\n".join(f"{i + 1}\n{fmt(a)} --> {fmt(b)}\n{t}\n" for i, (a, b, t) in enumerate(cues)))
print("wrote", out, len(cues), "cues")

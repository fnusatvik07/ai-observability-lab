"""Generate narration with OpenAI gpt-4o-mini-tts (voice: cedar) and word timestamps with whisper-1.

Usage: python scripts/tts.py   (reads OPENAI_API_KEY from ../.env)
Outputs: assets/audio/vo/<id>.mp3, assets/audio/vo/<id>.words.json
"""
import json
import os
import pathlib
import sys

from dotenv import load_dotenv
from openai import OpenAI

ROOT = pathlib.Path(__file__).resolve().parents[1]
load_dotenv(ROOT.parent / ".env")
client = OpenAI()

INSTRUCTIONS = (
    "Voice: a warm, confident technical educator recording a polished YouTube explainer. "
    "Pacing: natural and steady, slightly brisk, never rushed. "
    "Tone: clear, curious, grounded. Not salesy, not dramatic. "
    "Emphasis: lean lightly on key terms like logs, metrics, traces, spans, and OpenTelemetry. "
    "Pauses: brief natural pauses at sentence ends only."
)

lines = json.loads((ROOT / "narration.json").read_text())
only = set(sys.argv[1:])
out_dir = ROOT / "assets/audio/vo"
for line in lines:
    if only and line["id"] not in only:
        continue
    mp3 = out_dir / f"{line['id']}.mp3"
    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="cedar",
        input=line["text"],
        instructions=INSTRUCTIONS,
        response_format="mp3",
    ) as resp:
        resp.stream_to_file(mp3)
    with open(mp3, "rb") as f:
        tr = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["word"],
        )
    words = [{"w": w.word, "s": round(w.start, 3), "e": round(w.end, 3)} for w in tr.words]
    (out_dir / f"{line['id']}.words.json").write_text(json.dumps(words, indent=1))
    print(line["id"], "ok", words[-1]["e"] if words else None)

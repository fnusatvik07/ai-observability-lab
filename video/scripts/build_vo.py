"""Trim each narration segment's edge silence and join them into one continuous track.

Writes assets/audio/narration.m4a and timing.json (scene start/duration + word times, scene-local).
Run after scripts/tts.py:  python3 scripts/build_vo.py
"""
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
VO = ROOT / "assets/audio/vo"
LEAD_IN = 0.5      # seconds before the first word
GAP = 0.45         # pause between segments, like a paragraph break
TAIL = 4.5         # end card after the last word


def speech_bounds(path):
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "silencedetect=n=-42dB:d=0.12", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                               capture_output=True, text=True).stdout)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    begin = ends[0] if starts and starts[0] < 0.01 and ends else 0.0
    finish = starts[-1] if starts and starts[-1] > dur - 1.5 and (len(ends) < len(starts)) else dur
    return max(0.0, begin - 0.04), min(dur, finish + 0.12)


lines = json.loads((ROOT / "narration.json").read_text())
parts, timing, cursor = [], [], LEAD_IN
for line in lines:
    src = VO / f"{line['id']}.mp3"
    a, b = speech_bounds(src)
    trimmed = VO / f"{line['id']}.trim.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
                    "-ar", "48000", "-ac", "1", str(trimmed)], check=True)
    words = json.loads((VO / f"{line['id']}.words.json").read_text())
    words = [{"w": w["w"], "s": round(max(0, w["s"] - a), 3), "e": round(max(0, w["e"] - a), 3)} for w in words]
    seg = b - a
    timing.append({"id": line["id"], "start": round(cursor, 3), "speech": round(seg, 3), "words": words})
    parts.append((trimmed, cursor))
    cursor += seg + GAP

total = cursor - GAP + TAIL
# scene durations: each scene runs until the next one starts; last one includes the tail
for i, t in enumerate(timing):
    t["duration"] = round((timing[i + 1]["start"] if i + 1 < len(timing) else total) - t["start"], 3)

inputs, filters = [], []
for i, (p, start) in enumerate(parts):
    inputs += ["-i", str(p)]
    filters.append(f"[{i}]adelay={int(start * 1000)}|{int(start * 1000)}[d{i}]")
mix = "".join(f"[d{i}]" for i in range(len(parts)))
filters.append(f"{mix}amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total:.3f},loudnorm=I=-16:TP=-1.5:LRA=11,apad=whole_dur={total:.3f}[out]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]",
                "-ar", "48000", "-c:a", "aac", "-b:a", "192k", str(ROOT / "assets/audio/narration.m4a")], check=True)
(ROOT / "timing.json").write_text(json.dumps({"total": round(total, 3), "scenes": timing}, indent=1))
for t in timing:
    print(f"{t['id']:<16} start {t['start']:7.2f}  dur {t['duration']:6.2f}")
print("total", round(total, 2))

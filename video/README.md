# AI Observability, Explained (video source)

A 4 minute 13 second faceless explainer, built as HTML with [HyperFrames](https://hyperframes.heygen.com) and animated with GSAP.

- Final render: `out/ai-observability-explained.mp4` (1920x1080, 30 fps)
- Captions for YouTube: `out/ai-observability-explained.srt`

## How it is built

| Piece | File |
|---|---|
| Narration script, one entry per scene | `narration.json` |
| Voice generation (OpenAI `gpt-4o-mini-tts`, voice `cedar`) and word timings | `scripts/tts.py` |
| Trim and join the voice into one continuous track, write `timing.json` | `scripts/build_vo.py` |
| Music bed, quiet and ducked under the voice | `scripts/build_bed.sh` |
| Root composition (background, chapter labels, progress bar, audio) | `scripts/index.template.html` → `index.html` via `scripts/build_index.py` |
| One sub-composition per scene | `compositions/s01-hook.html` … `compositions/s11-close.html` |
| Captions | `scripts/build_srt.py` |

Scene animations are cued to the word timestamps in `timing.json`, so the picture follows the voice.

## Re-render

```bash
cd video
# 1. voice (needs OPENAI_API_KEY in ../.env)
uv run --with openai --with python-dotenv python scripts/tts.py
python3 scripts/build_vo.py
./scripts/build_bed.sh
python3 scripts/build_index.py
python3 scripts/build_srt.py

# 2. check and render
npx hyperframes check
npx hyperframes render -o out/ai-observability-explained.mp4 --fps 30
```

If you only change visuals, skip step 1. If you regenerate the voice, the word timings move and the cue times inside `compositions/*.html` may need a small nudge.

Preview and edit in the browser:

```bash
npx hyperframes preview
```

See `CREDITS.md` for music, font, and logo sources.

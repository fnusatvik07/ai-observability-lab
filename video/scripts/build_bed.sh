#!/usr/bin/env bash
# Music bed: "Random F Lydian BellScape" by itinerantmonk108 (CC0), freesound.org/s/677533
# Trimmed to the narration length, quiet, faded, and sidechain-ducked under the voice.
set -euo pipefail
cd "$(dirname "$0")/.."
TOTAL=$(python3 -c "import json;print(json.load(open('timing.json'))['total'])")
ffmpeg -y -loglevel error -i assets/audio/music/bellscape-cc0.mp3 -i assets/audio/narration.m4a -filter_complex "
[0:a]atrim=0:${TOTAL},asetpts=N/SR/TB,aresample=48000,volume=-9dB,afade=t=in:d=2.5,afade=t=out:st=$(python3 -c "print(${TOTAL}-5)"):d=5[m];
[1:a]aresample=48000,apad=whole_dur=${TOTAL}[sc];
[m][sc]sidechaincompress=threshold=0.03:ratio=4:attack=40:release=600:makeup=1[out]" \
  -map "[out]" -c:a aac -b:a 160k assets/audio/bed.m4a
echo "bed written"

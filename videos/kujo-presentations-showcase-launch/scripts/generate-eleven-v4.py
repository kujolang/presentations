"""Generate the approved narration cues with ElevenLabs v4.

This script makes paid provider calls only when --allow-tts is present. Each
request is guarded by a pending receipt so an uncertain outcome is never
retried automatically.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"
TAKES = AUDIO / "takes"


def api_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if key:
        return key
    result = subprocess.run(
        ["security", "find-generic-password", "-s", "kujo-videoops-elevenlabs", "-a", "videoops", "-w"],
        capture_output=True,
        text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else ""


def get_json(url: str, key: str) -> dict:
    request = urllib.request.Request(url, headers={"xi-api-key": key})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def post_json(url: str, payload: dict, key: str) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, separators=(",", ":")).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": key},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        return json.load(response)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-tts", action="store_true")
    parser.add_argument("--max-characters", type=int, default=260)
    parser.add_argument("--cue", action="append", dest="cue_ids")
    args = parser.parse_args()
    if not args.allow_tts:
        raise SystemExit("Refusing paid TTS calls without --allow-tts")

    plan = json.loads((ROOT / "plan.json").read_text())
    voice = plan["voice"]
    if voice["model_id"] != "eleven_v4":
        raise SystemExit("plan.json must explicitly select eleven_v4")
    unsupported = {"style", "speed", "use_speaker_boost"} & set(voice["settings"])
    if unsupported:
        raise SystemExit(f"Unsupported Eleven v4 settings remain: {sorted(unsupported)}")

    cues = json.loads((AUDIO / "voiceover.json").read_text())["cues"]
    total = sum(len(cue.get("spoken_text", cue["text"])) for cue in cues)
    if total > args.max_characters:
        raise SystemExit(f"Narration is {total} characters; maximum is {args.max_characters}")

    key = api_key()
    if not key:
        raise SystemExit("ELEVENLABS_API_KEY is unavailable")
    subscription = get_json("https://api.elevenlabs.io/v1/user/subscription", key)
    tier = str(subscription.get("tier", "unknown")).lower()
    if tier in {"free", "unknown", ""}:
        raise SystemExit(f"Commercial narration requires a paid tier; found {tier!r}")

    TAKES.mkdir(parents=True, exist_ok=True)
    endpoint = (
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice['voice_id']}"
        "/with-timestamps?output_format=mp3_44100_128"
    )
    spoken = [cue.get("spoken_text", cue["text"]) for cue in cues]
    for index, cue in enumerate(cues):
        if args.cue_ids and cue["id"] not in args.cue_ids:
            continue
        text = spoken[index]
        payload = {
            "text": text,
            "model_id": voice["model_id"],
            "voice_settings": voice["settings"],
        }
        if index:
            payload["previous_text"] = spoken[index - 1]
        if index + 1 < len(cues):
            payload["next_text"] = spoken[index + 1]

        pending = TAKES / f"{cue['id']}.pending.json"
        receipt_path = TAKES / f"{cue['id']}.json"
        audio_path = TAKES / f"{cue['id']}.mp3"
        pending.write_text(json.dumps({"started_at": time.time(), "request": payload}, indent=2) + "\n")
        try:
            result = post_json(endpoint, payload, key)
        except urllib.error.HTTPError as error:
            if error.code in {400, 401, 403, 404, 422}:
                pending.unlink(missing_ok=True)
            raise

        audio = base64.b64decode(result["audio_base64"])
        audio_path.write_bytes(audio)
        receipt = {
            "provider": "ElevenLabs",
            "voice_id": voice["voice_id"],
            "input_sha256": sha256(text.encode()),
            "audio_sha256": sha256(audio),
            "generation_tier": tier,
            "generated_at": time.time(),
            "request": payload,
            "alignment": result.get("alignment"),
            "normalized_alignment": result.get("normalized_alignment"),
            "quality_check": None,
        }
        receipt_path.write_text(json.dumps(receipt, indent=2) + "\n")
        pending.unlink()
        print(f"Generated {cue['id']} ({len(text)} chars, {voice['model_id']})")


if __name__ == "__main__":
    main()

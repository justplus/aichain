#!/usr/bin/env python3

import importlib
import json
import os
import pathlib
import sys


REQUIRED = ["AICHAIN_ENDPOINT", "AICHAIN_APP_ID", "AICHAIN_API_KEY"]
missing = [name for name in REQUIRED if not os.environ.get(name)]

if missing:
    print(f"Missing required environment variables: {', '.join(missing)}", file=sys.stderr)
    sys.exit(2)

sdk_package = os.environ.get("AICHAIN_PYTHON_SDK_PACKAGE")
if not sdk_package:
    print(
        "Missing AICHAIN_PYTHON_SDK_PACKAGE. Set it to the official AIChain Python SDK package name from Yuque.",
        file=sys.stderr,
    )
    sys.exit(2)

skill_root = pathlib.Path(__file__).resolve().parent.parent
text = (skill_root / "assets" / "text" / "sample.txt").read_text(encoding="utf-8")
image_question = (skill_root / "assets" / "image" / "expected_question.txt").read_text(
    encoding="utf-8"
).strip()
image_expected = (skill_root / "assets" / "image" / "expected_answer_contains.txt").read_text(
    encoding="utf-8"
).strip()

profile = json.loads(
    os.environ.get(
        "AICHAIN_PROFILE",
        json.dumps(
            {
                "region": os.environ.get("AICHAIN_REGION", "cn"),
                "modelId": os.environ.get("AICHAIN_MODEL_ID", "b16924f42ffe4fd895d4ba4778278bc3"),
                "capabilities": "nlu",
                "language": None,
                "duplex": None,
                "vad": None,
                "interrupt": "none",
                "image_understanding": False,
                "chunk_tts": (
                    os.environ.get("AICHAIN_CHUNK_TTS") == "true"
                    if os.environ.get("AICHAIN_CHUNK_TTS") is not None
                    else None
                ),
                "audio": {"input": "pcm", "output": "pcm"},
                "integration": "python_sdk",
            }
        ),
    )
)

sdk = importlib.import_module(sdk_package)
client_cls = getattr(sdk, "AIChainClient", None) or getattr(sdk, "Client", None)

if client_cls is None:
    print(
        f"Could not find AIChainClient or Client in {sdk_package}. Align this harness with the official Python SDK class name.",
        file=sys.stderr,
    )
    sys.exit(1)

client = client_cls(
    endpoint=os.environ["AICHAIN_ENDPOINT"],
    app_id=os.environ["AICHAIN_APP_ID"],
    api_key=os.environ["AICHAIN_API_KEY"],
    user_id=os.environ.get("AICHAIN_USER_ID"),
    device_id=os.environ.get("AICHAIN_DEVICE_ID"),
    model_id=profile.get("modelId"),
    chunk_tts=profile.get("chunk_tts"),
    profile=profile,
)

results = []

if hasattr(client, "send_text"):
    results.append(client.send_text(text))
elif hasattr(client, "chat"):
    results.append(client.chat({"text": text, "profile": profile}))
else:
    print(
        "SDK client must expose send_text() or chat(). Align this harness with the official Python SDK method names.",
        file=sys.stderr,
    )
    sys.exit(1)

if profile.get("image_understanding") and hasattr(client, "chat"):
    image = (skill_root / "assets" / "image" / "sample.png").read_bytes()
    results.append(
        client.chat(
            {
                "text": image_question,
                "image": image,
                "mime_type": "image/png",
                "profile": profile,
            }
        )
    )

output = json.dumps(results, ensure_ascii=False, indent=2, default=str)
print(output)

if profile.get("image_understanding") and image_expected not in output:
    print(
        f"Image understanding validation failed: expected answer to contain {image_expected}",
        file=sys.stderr,
    )
    sys.exit(1)

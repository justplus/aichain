#!/usr/bin/env python3

import argparse
import importlib
import json
import os
import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parent.parent


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", default="self-check", choices=["self-check", "sdk-python"])
    args = parser.parse_args()

    profile = load_profile(args.mode)
    fixtures = load_fixtures()
    validate_profile(profile)
    validate_fixtures(fixtures)

    if args.mode == "self-check":
        print(
            json.dumps(
                {
                    "ok": True,
                    "mode": args.mode,
                    "profile": profile,
                    "fixtures": {
                        "textZhBytes": len(fixtures["text_zh"].encode("utf-8")),
                        "textEnBytes": len(fixtures["text_en"].encode("utf-8")),
                        "zhAudioBytes": len(fixtures["zh_audio"]),
                        "enAudioBytes": len(fixtures["en_audio"]),
                        "imageBytes": len(fixtures["image"]),
                        "imageQuestion": fixtures["image_question"],
                        "imageExpected": fixtures["image_expected"],
                    },
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    run_python_sdk(profile, fixtures)
    return 0


def load_profile(mode: str) -> dict:
    if os.environ.get("AICHAIN_PROFILE_FILE"):
        return json.loads(pathlib.Path(os.environ["AICHAIN_PROFILE_FILE"]).read_text(encoding="utf-8"))
    if os.environ.get("AICHAIN_PROFILE"):
        return json.loads(os.environ["AICHAIN_PROFILE"])
    return {
        "region": {"code": os.environ.get("AICHAIN_REGION", "cn"), "endpoint": os.environ.get("AICHAIN_ENDPOINT")},
        "integration": "python_sdk" if mode == "sdk-python" else "webapi",
        "modelId": os.environ.get("AICHAIN_MODEL_ID", "b16924f42ffe4fd895d4ba4778278bc3"),
        "capabilities": {"asr": False, "nlu": True, "tts": False, "image": False},
        "asr": {"language": None, "duplex": None, "vad": None},
        "interruption": "none",
        "audio": {"input": None, "output": None, "notes": None},
        "tts": {"chunk": None},
        "runtime": {
            "appIdEnv": "AICHAIN_APP_ID",
            "appKeyEnv": "AICHAIN_APP_KEY",
            "endpointEnv": "AICHAIN_ENDPOINT",
            "snEnv": "AICHAIN_SN",
        },
        "android": {
            "language": None,
            "ui": None,
            "minSdk": None,
            "targetSdk": None,
            "credentialStrategy": None,
            "testStrategy": None,
        },
    }


def load_fixtures() -> dict:
    return {
        "text_zh": (ROOT / "assets/text/sample_zh.txt").read_text(encoding="utf-8"),
        "text_en": (ROOT / "assets/text/sample_en.txt").read_text(encoding="utf-8"),
        "zh_audio": (ROOT / "assets/audio/zh_16k_pcm.wav").read_bytes(),
        "en_audio": (ROOT / "assets/audio/en_16k_pcm.wav").read_bytes(),
        "image": (ROOT / "assets/image/apple.png").read_bytes(),
        "image_question": (ROOT / "assets/image/apple_question_zh.txt").read_text(encoding="utf-8").strip(),
        "image_expected": (ROOT / "assets/image/apple_expected_zh.txt").read_text(encoding="utf-8").strip(),
    }


def validate_profile(profile: dict) -> None:
    missing = []
    if not profile.get("region", {}).get("code"):
        missing.append("region.code")
    if not profile.get("integration"):
        missing.append("integration")
    if not profile.get("modelId"):
        missing.append("modelId")
    for key in ("asr", "nlu", "tts", "image"):
        if not isinstance(profile.get("capabilities", {}).get(key), bool):
            missing.append(f"capabilities.{key}")
    if not profile.get("runtime", {}).get("appIdEnv"):
        missing.append("runtime.appIdEnv")
    if not profile.get("runtime", {}).get("appKeyEnv") and not profile.get("runtime", {}).get("apiKeyEnv"):
        missing.append("runtime.appKeyEnv")
    if not profile.get("runtime", {}).get("endpointEnv"):
        missing.append("runtime.endpointEnv")
    if missing:
        raise SystemExit(f"Invalid AIChainProfile. Missing: {', '.join(missing)}")


def validate_fixtures(fixtures: dict) -> None:
    failed = []
    if not fixtures["text_zh"]:
        failed.append("text_zh")
    if not fixtures["text_en"]:
        failed.append("text_en")
    if not is_wav(fixtures["zh_audio"]):
        failed.append("zh_audio")
    if not is_wav(fixtures["en_audio"]):
        failed.append("en_audio")
    if not fixtures["image"].startswith(b"\x89PNG\r\n\x1a\n"):
        failed.append("image")
    if not fixtures["image_question"]:
        failed.append("image_question")
    if not fixtures["image_expected"]:
        failed.append("image_expected")
    if failed:
        raise SystemExit(f"Invalid bundled fixtures: {', '.join(failed)}")


def is_wav(data: bytes) -> bool:
    return data[:4] == b"RIFF" and data[8:12] == b"WAVE"


def require_runtime(profile: dict) -> dict:
    endpoint_env = profile["runtime"]["endpointEnv"]
    app_id_env = profile["runtime"]["appIdEnv"]
    app_key_env = profile["runtime"].get("appKeyEnv") or profile["runtime"].get("apiKeyEnv") or "AICHAIN_APP_KEY"
    fallback_app_key_env = "AICHAIN_APP_KEY" if app_key_env == "AICHAIN_API_KEY" else "AICHAIN_API_KEY"
    endpoint = os.environ.get(endpoint_env) or resolve_endpoint(profile.get("region", {}).get("code"))
    missing = []
    if not endpoint:
        missing.append(f"{endpoint_env} or mapped AICHAIN_REGION")
    if not os.environ.get(app_id_env):
        missing.append(app_id_env)
    if not os.environ.get(app_key_env) and not os.environ.get(fallback_app_key_env):
        missing.append(f"{app_key_env} or {fallback_app_key_env}")
    if missing:
        raise SystemExit(f"Missing required environment variables: {', '.join(missing)}")
    return {
        "endpoint": endpoint,
        "app_id": os.environ[app_id_env],
        "app_key": os.environ.get(app_key_env) or os.environ.get(fallback_app_key_env),
        "user_id": os.environ.get("AICHAIN_USER_ID"),
        "sn": os.environ.get("AICHAIN_SN") or os.environ.get("AICHAIN_DEVICE_ID") or "codex-smoke-001",
    }


def resolve_endpoint(region_code: str | None) -> str | None:
    endpoints = {
        "shanghai": "wss://aichain-sh.xfyun.cn",
        "us": "wss://aichain-us.iflyoversea.com",
        "rus": "wss://aichain-rus.iflyoversea.com",
    }
    return endpoints.get(str(region_code or "cn").lower())


def run_python_sdk(profile: dict, fixtures: dict) -> None:
    runtime = require_runtime(profile)
    package_name = os.environ.get("AICHAIN_PYTHON_SDK_PACKAGE")
    if not package_name:
        raise SystemExit("Missing AICHAIN_PYTHON_SDK_PACKAGE for generic Python SDK mode.")

    sdk = importlib.import_module(package_name)
    client_cls = getattr(sdk, "AIChainClient", None) or getattr(sdk, "Client", None)
    if client_cls is None:
        raise SystemExit(f"Cannot find AIChainClient or Client in {package_name}")

    client = client_cls(
        host=runtime["endpoint"],
        app_id=runtime["app_id"],
        app_key=runtime["app_key"],
        user_id=runtime["user_id"],
        sn=runtime["sn"],
        model_id=profile["modelId"],
        profile=profile,
    )

    results = []
    if profile["capabilities"]["nlu"] or profile["capabilities"]["tts"]:
        results.append(call_first(client, ("send_text", "chat"), fixtures["text_zh"], {"text": fixtures["text_zh"], "profile": profile}))
    if profile["capabilities"]["asr"]:
        audio = fixtures["en_audio"] if profile.get("asr", {}).get("language") == "en" else fixtures["zh_audio"]
        results.append(call_first(client, ("send_audio", "recognize"), audio, {"audio": audio, "profile": profile}))
    if profile["capabilities"]["image"]:
        results.append(
            call_first(
                client,
                ("send_image", "chat"),
                fixtures["image"],
                {
                    "image": fixtures["image"],
                    "prompt": fixtures["image_question"],
                    "mime_type": "image/png",
                    "profile": profile,
                },
            )
        )

    output = json.dumps(results, ensure_ascii=False, indent=2, default=str)
    print(output)
    validate_service_output(profile, output, fixtures)


def call_first(client, names, positional, object_arg):
    for name in names:
        method = getattr(client, name, None)
        if callable(method):
            try:
                return method(object_arg)
            except TypeError:
                return method(positional)
    raise SystemExit(f"SDK client must expose one of: {', '.join(names)}")


def validate_service_output(profile: dict, output: str, fixtures: dict) -> None:
    lower = output.lower()
    failures = []
    if profile["capabilities"]["asr"]:
        expected = ("hello", "weather") if profile.get("asr", {}).get("language") == "en" else ("北京", "天气")
        for term in expected:
            if term.lower() not in lower:
                failures.append(f"ASR output missing {term}")
    if profile["capabilities"]["nlu"] and not output.strip():
        failures.append("NLU output is empty")
    if profile["capabilities"]["tts"] and not any(term in lower for term in ("audio", "tts", "pcm", "opus", "wav", "base64")):
        failures.append("TTS output did not mention or contain audio")
    if profile["capabilities"]["image"] and fixtures["image_expected"].lower() not in lower:
        failures.append(f"Image output missing {fixtures['image_expected']}")
    if failures:
        raise SystemExit("AIChain E2E validation failed:\n- " + "\n- ".join(failures))


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)

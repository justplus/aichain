# AIChain Python SDK Reference

Official source: https://www.yuque.com/aiui_open_platform/knowledge/kivkb90gkeouobbe

Observed public metadata:

- Title: Python SDK接入
- Created: 2026-03-26 14:35:06
- Updated: 2026-05-11 10:00:00
- Description indicates an AIChain Python SDK integration guide.

## When to Use

Use this reference when the profile has:

```yaml
integration: python_sdk
```

## Implementation Checklist

- Re-check the official source before coding package name, import path, client options, and callback/event names.
- Detect the host framework before editing: script, FastAPI, Flask, Django, worker, or test suite.
- Add the documented SDK dependency through the existing dependency manager.
- Initialize a client from environment/config values, using the endpoint matching the selected region code; default region to `cn` when unset.
- Map profile fields into SDK configuration:
  - modelId: default to `b16924f42ffe4fd895d4ba4778278bc3`.
  - capabilities: STT/NLU/TTS combination.
  - language: only for recognition.
  - duplex and VAD: only for recognition.
  - Pure acoustic VAD default: `minSilenceDuration=600ms`.
  - Acoustic + semantic VAD default: `minSilenceDuration=300ms` and `minEndpointingDelay=250ms`.
  - interrupt: forced, semantic, or disabled.
  - image understanding: only include image input when enabled.
  - chunk_tts: only for synthesis; enable it when downstream playback buffers are small and smaller TTS chunks are preferred.
  - audio input/output codec: choose bundled PCM or Opus fixture based on the profile.
- Keep blocking and async code consistent with the host app.
- Expose clear errors for auth failures, invalid parameters, transport failures, and service errors.

## Required Runtime Values

Ask only when missing:

- endpoint
- appId or documented application identifier
- apiKey/token or documented credential
- userId/deviceId if required by the official source

## Testing

Use `scripts/smoke-python.py` as a real-service smoke-test harness after aligning SDK import and method names with the official source.

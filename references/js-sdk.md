# AIChain JavaScript SDK Reference

Official source: https://www.yuque.com/aiui_open_platform/knowledge/uwyv0442g4050ipg

Observed public metadata:

- Title: JS SDK接入
- Created: 2026-03-26 14:35:52
- Updated: 2026-05-11 10:00:27
- Description indicates a JavaScript/TypeScript AIChain SDK integration guide.

## When to Use

Use this reference when the profile has:

```yaml
integration: js_sdk
```

## Implementation Checklist

- Re-check the official source before coding package name, import path, constructor options, and event names.
- Detect whether the host project is browser, Node.js, or framework-based before editing.
- Install or add the documented SDK dependency using the project's package manager.
- Initialize the SDK with the endpoint matching the selected region code and credentials; default region to `cn` when unset.
- Map profile fields into SDK configuration:
  - modelId: default to `b16924f42ffe4fd895d4ba4778278bc3`.
  - capabilities: STT/NLU/TTS combination.
  - language: only for recognition.
  - duplex and VAD: only for recognition.
  - Pure acoustic VAD default: `minSilenceDuration=600ms`.
  - Acoustic + semantic VAD default: `minSilenceDuration=300ms` and `minEndpointingDelay=250ms`.
  - interrupt: forced, semantic, or disabled.
  - image understanding: only include image input when enabled.
  - chunk_tts: only for synthesis; enable it when device playback buffers are small and smaller TTS chunks are preferred.
  - audio input/output codec: configure capture, frame encoding, decoding, and playback.
- Browser integrations should use existing UI state management and microphone permission patterns.
- Node.js integrations should stream local audio or server-side audio buffers without browser APIs.

## Required Runtime Values

Ask only when missing:

- endpoint
- appId or documented application identifier
- apiKey/token or documented credential
- userId/deviceId if required by the official source

## Testing

Use `scripts/smoke-js.mjs` as a real-service smoke-test harness after aligning SDK import and method names with the official source.

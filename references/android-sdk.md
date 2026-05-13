# AIChain Android SDK Reference

Official source: https://www.yuque.com/aiui_open_platform/knowledge/mbq79tvlq9vnbia5

Observed public metadata:

- Title: Android SDK接入
- Created: 2026-03-26 14:33:40
- Updated: 2026-05-11 09:59:41
- Description indicates an AIChain Android SDK integration guide.

## When to Use

Use this reference when the profile has:

```yaml
integration: android_sdk
```

## Implementation Checklist

- Re-check the official source before coding Maven coordinates, Gradle configuration, permissions, initialization APIs, and callback names.
- Detect whether the project uses Kotlin or Java and whether it uses Android Views, Compose, or a hybrid WebView.
- Add SDK dependency and required repository configuration to Gradle using existing project conventions.
- Add microphone, network, and storage/media permissions only when needed.
- Initialize the SDK from `BuildConfig`, `local.properties`, or the project's existing secret mechanism, using the endpoint matching the selected region code; default region to `cn` when unset.
- Map profile fields into SDK configuration:
  - modelId: default to `b16924f42ffe4fd895d4ba4778278bc3`.
  - capabilities: STT/NLU/TTS combination.
  - language: only for recognition.
  - duplex and VAD: only for recognition.
  - Pure acoustic VAD default: `minSilenceDuration=600ms`.
  - Acoustic + semantic VAD default: `minSilenceDuration=300ms` and `minEndpointingDelay=250ms`.
  - interrupt: forced, semantic, or disabled.
  - image understanding: only include image input when enabled.
  - chunk_tts: only for synthesis; enable it for phones, embedded devices, or other clients with small playback buffers.
  - audio input/output codec: configure recorder and player pipeline.
- For full-duplex recognition, separate recording, streaming, receiving, playback, and interruption state.
- For half-duplex recognition, make end-of-speech/end-of-input explicit.

## Required Runtime Values

Ask only when missing:

- endpoint
- appId or documented application identifier
- apiKey/token or documented credential
- userId/deviceId if required by the official source

## Testing

Prefer Android instrumented or debug-app smoke tests for microphone/playback paths. Reuse bundled fixtures where the host app can load assets; otherwise copy equivalent fixtures into Android test resources.

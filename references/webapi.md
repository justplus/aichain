# AIChain WebAPI Reference

Official source: https://www.yuque.com/aiui_open_platform/knowledge/hf7xdluok2yz3dib

Observed public metadata:

- Title: API接口文档
- Created: 2026-02-01 11:20:31
- Updated: 2026-05-07 17:02:08
- Description indicates AIChain WebSocket API v2.1, connection-level authentication, and event-based parameter transfer such as `session.config` and conversation events.
- Stated capabilities include speech recognition (STT), semantic understanding (NLU), text-to-speech (TTS), and combinations of those capabilities.

## When to Use

Use this reference when the profile has:

```yaml
integration: webapi
```

## Implementation Checklist

- Re-check the official source before coding exact endpoint, auth, event names, and parameter names.
- Treat `region` as an endpoint selection key. `cn`, `us`, and any other supported region code must map to the corresponding AIChain endpoint.
- Create a WebSocket client with connection-level authentication.
- Send session configuration before sending user input.
- Map the profile to WebAPI configuration:
  - `region`: choose the endpoint that matches the selected region code; default to `cn` when unset.
  - `modelId`: default to `b16924f42ffe4fd895d4ba4778278bc3`.
  - `capabilities`: enable STT, NLU, TTS, or combinations.
  - `language`: set recognition language only when STT is enabled.
  - `duplex` and `vad`: configure half-duplex, acoustic VAD, or acoustic + semantic VAD only when STT is enabled.
  - Pure acoustic VAD default: `minSilenceDuration=600ms`.
  - Acoustic + semantic VAD default: `minSilenceDuration=300ms` and `minEndpointingDelay=250ms`.
  - `interrupt`: map to forced interruption, semantic interruption, or no interruption.
  - `image_understanding`: include image payloads only when enabled.
  - `chunk_tts`: include this optional synthesis parameter when TTS is enabled; enable it for small playback buffers to reduce per-chunk audio size.
  - `audio.input` and `audio.output`: configure input/output codec and frame handling.
- Implement event handlers for connection open, configuration ack, partial result, final result, audio output, error, interruption, and close.
- For full-duplex, keep audio send and event receive independent.
- For half-duplex, send an explicit end-of-input event after the audio/text payload.

## Required Runtime Values

Ask only when missing:

- endpoint
- appId or documented application identifier
- apiKey/token or documented credential
- userId/deviceId if required by the official source

## Testing

Use `scripts/smoke-webapi.mjs` for a real-service smoke test after adapting any official event names that differ from the generic script.

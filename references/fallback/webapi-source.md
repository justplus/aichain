# AIChain WebAPI Fallback Reference

Use this file only when the official Yuque WebAPI page is unreadable. If official documentation becomes available, prefer it for exact endpoint, event, payload, and authentication names.

## Overview

AIChain WebAPI uses a WebSocket session for realtime ASR, NLU, TTS, and optional image understanding. Clients connect to a regional base host, authenticate with app credentials and a timestamp checksum, configure the session, send user input, then consume streamed events until the conversation turn ends.

## Endpoint And Authentication

Resolve the base host from official docs or `references/region-endpoints.md`.

Known fallback base hosts:

- `cn`: `wss://aichain-sh.xfyun.cn`
- `overseas`: `wss://aichain-us.iflyoversea.com`
- `rus`: `wss://aichain-rus.iflyoversea.com`

Build the WebSocket URL:

```text
wss://<host>/v1/chat/<appId>?curtime=<unixSeconds>&checksum=<sha256(appKey+curtime)>&sn=<deviceSerial>&scene=<scene>
```

Rules:

- Strip any path from the base host before composing `/v1/chat/<appId>`.
- Use `scene=main` when the project has no scenario naming.
- Use a stable device serial number from config; fallback smoke tests may use `codex-smoke-001`.
- Never log `appKey` or full URLs containing the raw checksum.

## Session Flow

Expected fallback flow:

1. Open WebSocket.
2. Wait for `session.created` and capture `sid`.
3. Send `session.config` with `sid` and session configuration.
4. Wait for `session.configed`.
5. Send user input with `conversation.user.append`.
6. Consume ASR/NLU/TTS/image events.
7. Treat `event.cid_end` as the normal end-of-turn marker.
8. Close cleanly or keep the session open for the next turn according to host app needs.

## Session Config Shape

Build config from `AIChainProfile` and include only selected capabilities.

```json
{
  "mode": "half_duplex",
  "simplifiedResponse": true,
  "multiTurnEnabled": true,
  "stt": {
    "enable": true,
    "language": "zh",
    "audioConfig": {
      "audioEncoding": "raw",
      "format": "plain",
      "sampleRate": 16000,
      "bitDepth": 16,
      "channels": 1
    },
    "vad": {
      "enable": true,
      "minSilenceDuration": 600
    },
    "turnDetection": {
      "enable": false
    },
    "interrupt": {
      "enable": true
    }
  },
  "nlu": {
    "enable": true,
    "streamingFlushInterval": 300,
    "tools": {
      "model": {
        "modelId": "b16924f42ffe4fd895d4ba4778278bc3",
        "maxTokens": 1000,
        "temperature": 0.7,
        "topP": 0.9
      }
    }
  },
  "tts": {
    "enable": true,
    "audioConfig": {
      "audioEncoding": "raw",
      "format": "plain",
      "sampleRate": 16000,
      "bitDepth": 16,
      "channels": 1
    },
    "extraConfig": {
      "chunk_tts": true
    }
  }
}
```

Capability mapping:

- No ASR: set `stt.enable=false` and omit microphone, audio upload, language, duplex, and VAD logic.
- Half-duplex ASR: use `mode=half_duplex` and send an explicit final/end flag after the last audio frame.
- Full-duplex ASR: use `mode=full_duplex`; upload audio while receiving events concurrently.
- Acoustic VAD: `minSilenceDuration=600`.
- Acoustic + semantic VAD: `minSilenceDuration=300` and `turnDetection.minEndpointingDelay=250`.
- No NLU: set `nlu.enable=false`.
- No TTS: set `tts.enable=false` and omit playback handling.
- TTS chunking: include `chunk_tts` only when documented or accepted by the service.
- Image understanding: send image items only when `capabilities.image=true`.

## User Input

Use a conversation id that is unique enough for the app/session. One practical fallback format is `<appId>@<yyyyMMddHHmmss>-<random>`.

Text input:

```json
{
  "type": "conversation.user.append",
  "sid": "<sid>",
  "cid": "<cid>",
  "items": [
    { "type": "text", "data": "你好" }
  ],
  "endFlag": true
}
```

Audio input:

```json
{
  "type": "conversation.user.append",
  "sid": "<sid>",
  "cid": "<cid>",
  "items": [
    { "type": "audio", "data": "<base64-audio-frame-or-file>" }
  ],
  "endFlag": true
}
```

Image input:

```json
{
  "type": "conversation.user.append",
  "sid": "<sid>",
  "cid": "<cid>",
  "items": [
    { "type": "text", "data": "图片里主要是什么水果？" },
    { "type": "image", "data": "<base64-image>", "extend": { "mimeType": "image/png" } }
  ],
  "endFlag": true
}
```

For streaming audio or text, send multiple append messages and mark only the last message as `endFlag=true` unless official docs require a different marker.

## Events

Known fallback event names:

- `session.created`: server created a session and returned `sid`.
- `session.configed`: server accepted session config.
- `stt.result`: ASR partial/final text.
- `nlu.answer`: NLU answer chunks or final semantic answer.
- `tts.audio`: TTS audio bytes or encoded audio chunk.
- `response.cancel`: client cancellation/interruption.
- `event.cid_end`: response turn complete.
- `session.error`: business/protocol error.
- `ping` / `pong`: heartbeat.

Treat unknown events as observable output and log them without credentials. Do not fail solely because an optional event is present.

## Error Handling

Handle these failure classes separately:

- Missing endpoint, app id, app key, or serial number.
- Region cannot be mapped to an endpoint.
- WebSocket open/connect timeout.
- Authentication or checksum rejection.
- `session.error` from the service.
- Session closes before `session.created` or `session.configed`.
- Output validation fails for the selected capability.

## Testing

Use `references/e2e-testing.md` for fixtures and commands. The generic Node runner implements this fallback protocol and can be used as a smoke test:

```bash
AICHAIN_REGION=cn \
AICHAIN_APP_ID="your-app-id" \
AICHAIN_APP_KEY="your-app-key" \
node scripts/aichain-e2e.mjs --mode webapi
```

If the official docs use different event or payload names, update the host-project adapter or the smoke test to match the official protocol.

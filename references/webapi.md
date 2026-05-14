# WebAPI Integration Notes

Use this file only when `AIChainProfile.integration` is `webapi`.

If the official Yuque WebAPI page is not readable, read `references/fallback/webapi-source.md` before coding. If that fallback does not contain WebAPI content, report the mismatch and use this concise reference for the known protocol details.

## Shape of the Implementation

- Add a small AIChain client module around the documented WebSocket/API protocol.
- Read `AICHAIN_ENDPOINT`, `AICHAIN_APP_ID`, `AICHAIN_APP_KEY`, and `AICHAIN_SN` from environment or the host project's secret system.
- Derive `AICHAIN_ENDPOINT` from the selected region using official docs or `references/region-endpoints.md`; ask for endpoint only for an unmapped custom region.
- Build the session configuration from `AIChainProfile`.
- Open `wss://<host>/v1/chat/<appId>?curtime=<ts>&checksum=<sha256(appKey+ts)>&sn=<sn>&scene=<scene>`.
- Wait for `session.created`, send `session.config`, wait for `session.configed`, then send user input with `conversation.user.append`.
- Use `event.cid_end` as the normal end-of-turn marker.
- Expose callbacks or events for partial text, final text, TTS audio, image/NLU result, interruption, errors, and close.

## Capability Mapping

- ASR: stream or upload audio using `profile.audio.input`; include language, duplex, and VAD only when ASR is selected.
- Pure acoustic VAD uses `minSilenceDuration=600ms`.
- Acoustic + semantic VAD uses `minSilenceDuration=300ms` and `minEndpointingDelay=250ms`.
- NLU: send text or structured input and surface the final semantic response.
- TTS: request synthesis and handle returned audio using `profile.audio.output`; include `chunk_tts` from `profile.tts.chunk` when documented, defaulting to enabled when the developer chose "不确定".
- Image: encode and send image input only when `profile.capabilities.image` is true.

## Core Events

- `session.created`: server assigns `sid`.
- `session.config`: client sends `sid` and session config.
- `session.configed`: server confirms config.
- `conversation.user.append`: client sends `{ sid, cid, items, endFlag }`.
- `stt.result`: ASR partial/final result.
- `nlu.answer`: NLU answer chunks.
- `tts.audio`: TTS audio chunks.
- `response.cancel`: client cancellation for interruption.
- `ping` / `pong`: heartbeat.
- `event.cid_end`: response turn complete.
- `session.error`: business/protocol error.

## Full-Duplex State Model

Represent states explicitly:

```text
idle -> connecting -> configuring -> listening -> speaking -> closing -> closed
                          |              |           |
                          v              v           v
                        failed        interrupted   failed
```

Full-duplex clients must keep audio upload and server-event receive loops independent. Playback interruption must not close the network connection unless the official protocol requires it.

## Half-Duplex Behavior

For half-duplex ASR, provide an explicit end-of-input method after the last audio frame or upload. Do not depend on connection close as the end-of-speech signal unless the official document requires that behavior.

## Testing Hook

Prefer adding a host-project test or example that can call the WebAPI client with:

- `assets/text/sample_zh.txt` for NLU/TTS
- `assets/audio/zh_16k_pcm.wav` or `assets/audio/en_16k_pcm.wav` for ASR
- `assets/image/apple.png` for image understanding

If the exact protocol event names differ from the generic runner, adapt `scripts/aichain-e2e.mjs` inside the project or create a project-local adapter.

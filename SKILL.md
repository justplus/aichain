---
name: aichain-integration
description: Guide developers through AIChain integration with multiple-choice requirement discovery, then implement WebAPI, JavaScript SDK, Python SDK, or Android SDK code and run end-to-end tests using bundled text, audio, and image fixtures.
---

# AIChain Integration

Use this skill when a developer wants to add AIChain to an app, service, SDK sample, or test project.

Do not write integration code until an `AIChainProfile` is complete.

## Required Flow

1. Inspect the host project briefly: language, framework, dependency manager, test runner, and where integration code should live.
2. Read `references/requirements.md`.
3. Ask the multiple-choice questions from `references/requirements.md`.
   - Use `request_user_input` when available, with no more than three questions per call.
   - If that tool is unavailable, ask concise numbered choices in chat and wait for the answer.
   - Skip questions already answered by the user or project config.
   - Skip conditional questions that do not apply.
4. Normalize answers into an `AIChainProfile` YAML block and show it before coding.
   - For Android SDK integrations, include `AIChainProfile.android` from project detection before coding.
5. Read `references/official-sources.md`, then try to refresh the relevant official Yuque document before using exact endpoint, auth, event, package, class, method, or parameter names. If the official page cannot be accessed or parsed, use the mapped `references/fallback/*-source.md` file and continue.
6. Read only the implementation reference matching the chosen integration path:
   - WebAPI: `references/webapi.md`
   - JavaScript SDK: `references/js-sdk.md`
   - Python SDK: `references/python-sdk.md`
   - Android SDK: `references/android-sdk.md`
7. Resolve endpoint from the selected region using the official document or `references/region-endpoints.md`. Ask only for missing runtime values: app id, app key/token, device serial number, model id override, endpoint for an unmapped custom region, or any required value named by the official docs.
8. Implement in the host project style. Keep secrets in environment variables or the existing secret/config system.
9. Read `references/e2e-testing.md`, copy or reference the bundled fixtures as needed, and run the relevant end-to-end test. If credentials are missing, run the local fixture/profile self-check and report that real service testing is blocked.

## Implementation Rules

- Keep changes scoped to AIChain integration and its tests.
- Prefer the host project's existing abstractions over new wrappers.
- Default `modelId` to `b16924f42ffe4fd895d4ba4778278bc3` unless the developer requests another model.
- Treat region as a routing key. The selected region must map to a documented endpoint; do not ask the developer to type an endpoint when the docs or `references/region-endpoints.md` already provide it.
- Configure only the selected capabilities: ASR, NLU, TTS, and optional image understanding.
- When ASR is not selected, do not add microphone, recording, audio-upload, language, duplex, or VAD code.
- When TTS is not selected, do not add playback, audio-output, or synthesis options.
- Full-duplex code must separate capture/upload, receive, playback, interruption, error, and shutdown states.
- Half-duplex code must expose an explicit end-of-input operation.
- Pure acoustic VAD must set `minSilenceDuration=600ms`.
- Acoustic + semantic VAD must set `minSilenceDuration=300ms` and `minEndpointingDelay=250ms`.
- For TTS-enabled integrations, ask the optional `chunk_tts` question and configure it from the answer; default to enabled when the developer is unsure.
- Image understanding code must be absent unless the profile enables it.
- Do not hardcode secrets, user-specific credentials, or undocumented endpoints.

## End State

Finish with:

- The final `AIChainProfile`.
- Files changed.
- Exact command used for local checks and real end-to-end tests.
- Whether real AIChain service testing passed, failed, or was blocked by missing credentials.

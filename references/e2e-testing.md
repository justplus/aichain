# End-to-End Testing

Use bundled fixtures to test only the capabilities selected in `AIChainProfile`.

## Fixtures

- `assets/text/sample_zh.txt`: Chinese text prompt for NLU and TTS.
- `assets/text/sample_en.txt`: English text prompt for NLU and TTS.
- `assets/audio/zh_16k_pcm.wav`: Chinese 16 kHz mono PCM WAV. Expected ASR terms: `北京`, `天气`.
- `assets/audio/en_16k_pcm.wav`: English 16 kHz mono PCM WAV. Expected ASR terms: `hello`, `weather`.
- `assets/image/apple.png`: image-understanding fixture.
- `assets/image/apple_question_zh.txt`: question for the image fixture.
- `assets/image/apple_expected_zh.txt`: expected answer substring.

## Environment

Generic runners use:

- `AICHAIN_ENDPOINT`
- `AICHAIN_APP_ID`
- `AICHAIN_APP_KEY`
- `AICHAIN_API_KEY` legacy alias for `AICHAIN_APP_KEY`
- `AICHAIN_SN` optional device serial number; defaults to `codex-smoke-001`
- `AICHAIN_DEVICE_ID` legacy alias for `AICHAIN_SN`
- `AICHAIN_USER_ID` optional unless the official docs require it
- `AICHAIN_PROFILE_FILE` optional path to a JSON profile
- `AICHAIN_PROFILE` optional JSON profile string
- `AICHAIN_JS_SDK_PACKAGE` for generic JavaScript SDK smoke tests
- `AICHAIN_PYTHON_SDK_PACKAGE` for generic Python SDK smoke tests

Android projects should map the same values into the app's existing config mechanism, such as `local.properties`, generated `BuildConfig` fields, Gradle Secrets, remote config, or encrypted storage. Do not commit real Android credentials.

## Commands

Local fixture/profile self-check:

```bash
node scripts/aichain-e2e.mjs --mode self-check
python3 scripts/aichain_e2e.py --mode self-check
```

Generic service checks:

```bash
node scripts/aichain-e2e.mjs --mode webapi
node scripts/aichain-e2e.mjs --mode sdk-js
python3 scripts/aichain_e2e.py --mode sdk-python
```

Android service checks:

```bash
./gradlew testDebugUnitTest
./gradlew connectedDebugAndroidTest
adb logcat -s AIChainClient:D AIChainSmoke:D
```

For Android SDK integrations, create one of these host-project test hooks:

- An instrumented smoke test using fixtures copied to `app/src/androidTest/assets/aichain/...`.
- A debug-only screen or command entry using fixtures copied to `app/src/debug/assets/aichain/...`.
- A unit-level adapter test for profile-to-`SessionConfig` mapping when no device/emulator is available.

The Android hook should initialize the SDK, apply the selected `AIChainProfile`, send only selected fixture types, assert capability-specific outputs, and close recorder/player/network resources.

For WebAPI, `AICHAIN_ENDPOINT` may be the base host such as `wss://aichain-sh.xfyun.cn`; the runner builds the documented `wss://<host>/v1/chat/<appId>?curtime=<ts>&checksum=<sha256(appKey+ts)>&sn=<sn>&scene=<scene>` URL.

If `AICHAIN_ENDPOINT` is unset, the runner resolves it from `AICHAIN_REGION` using `references/region-endpoints.md` built-in mappings. Ask for endpoint only when the selected region is custom and unmapped.

## Acceptance Criteria

- Missing credentials fail loudly before any network call.
- ASR tests check expected terms for the selected language.
- NLU tests require a non-empty semantic/text result.
- TTS tests require non-empty audio bytes or a documented audio output event.
- Image tests ask the bundled image question and require the expected answer substring.
- Android tests must also verify runtime permission denial handling when ASR or camera capture is selected.
- Android tests must verify lifecycle cleanup, either by closing the adapter directly or by exercising the host lifecycle hook.
- A passing local self-check is not a substitute for a real AIChain service test.

The generic runners are intentionally adapters, not protocol authority. If the official docs use different event or method names, update the project-local test to match the docs.

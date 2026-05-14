# Android SDK Integration Notes

Use this file only when `AIChainProfile.integration` is `android_sdk`.

If the official Yuque Android SDK page is not readable, read `references/fallback/android-sdk-source.md` before coding. Prefer official names over this summary whenever they differ.

## Project Detection

Before editing, identify:

- Kotlin or Java
- Gradle convention: version catalog, buildSrc, Kotlin DSL, Groovy DSL
- UI stack: Compose, Views, hybrid WebView, foreground/background service
- minimum SDK and target SDK
- existing permission request flow
- existing audio recorder/player utilities
- existing secret/config mechanism
- existing Android test runner and whether an emulator/device is available

Record these in `AIChainProfile.android`. Fill values from the project when possible and ask only for missing values that affect code generation.

```yaml
android:
  language: kotlin | java | null
  ui: compose | views | service | hybrid | null
  minSdk: 21 | <project-min-sdk> | null
  targetSdk: 34 | <project-target-sdk> | null
  credentialStrategy: local_properties_build_config | gradle_secrets | remote_config | encrypted_storage | existing | null
  testStrategy: instrumented | debug_screen | unit_adapter | null
```

## Dependencies

Add the official AIChain Android SDK dependency and repository exactly as documented. If the official page is unreadable, the fallback currently names:

```groovy
dependencies {
    implementation 'asia.aijh:dispatch-sdk:1.0.1'
}
```

Use the host project's Gradle style:

```kotlin
dependencies {
    implementation("asia.aijh:dispatch-sdk:1.0.1")
}
```

For version catalogs, add a library alias instead of hardcoding in app module dependencies. Do not add a custom Maven repository unless the official document requires it; otherwise use the project's existing repositories such as `mavenCentral()`.

## Credentials And Endpoint

Store `appId`, `appKey`, endpoint, and `sn` in the app's existing secret/config system. Preferred options:

- Existing project config or DI settings object.
- `local.properties` plus generated `BuildConfig` fields for debug/internal builds.
- Gradle Secrets plugin if already used.
- Remote config or encrypted storage when credentials are provisioned after install.

Never hardcode real credentials. Resolve endpoint from the selected region using official docs or `references/region-endpoints.md`; ask for endpoint only for an unmapped custom region. Pass the base host to the SDK's `host`/endpoint field unless official docs require a full path.

## Manifest And Permissions

Always include network permission when the app does not already have it:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Add only capability-driven permissions:

- ASR/live microphone: `android.permission.RECORD_AUDIO`
- Network state handling: `android.permission.ACCESS_NETWORK_STATE`
- Long-running live voice in background: foreground service permissions required by the target SDK and existing app policy.
- Image understanding from camera: camera permission only when capturing new photos; do not add it for gallery/file inputs.

For Android 6.0+, wire runtime permission requests through the app's existing permission flow. Handle denial as a first-class UI/error state and do not initialize recording until permission is granted.

## Client Boundary

Create a small app-local adapter around `AIChainClient` instead of spreading SDK calls through UI classes. Adapt names to the project, but keep these responsibilities visible:

```kotlin
interface AiChainSession {
    suspend fun connect()
    suspend fun configure(profile: AIChainProfile)
    suspend fun sendText(text: String)
    suspend fun sendAudioFrame(bytes: ByteArray, isEnd: Boolean)
    suspend fun sendImage(dataUrlOrBase64: String, prompt: String? = null)
    suspend fun interrupt()
    fun close()
}
```

Implement only the methods required by selected capabilities. In Java projects, keep the same boundary with callbacks/Futures matching the host style.

## Profile To SDK Mapping

Map only enabled capabilities:

- `region.endpoint` -> SDK `host` or documented endpoint field.
- `runtime.appIdEnv` / project config -> SDK `appId`.
- `runtime.appKeyEnv` / project config -> SDK `appKey`.
- `runtime.snEnv` / project config -> SDK `sn`.
- `modelId` -> documented NLU/model field.
- `asr.duplex=full` -> `SessionConfig.mode="full_duplex"`.
- `asr.duplex=half` or no ASR -> `SessionConfig.mode="half_duplex"`.
- `asr.language=zh` -> documented Chinese language code, usually `zh-CN`.
- `asr.language=en` -> documented English language code, usually `en-US`.
- `asr.language=auto` -> documented auto language value.
- `asr.vad=acoustic` -> VAD enabled with `minSilenceDuration=600`.
- `asr.vad=acoustic_semantic` -> VAD enabled with `minSilenceDuration=300` and turn detection `minEndpointingDelay=250`.
- `interruption=none` -> interruption disabled.
- `interruption=force|semantic` -> enable SDK interruption if documented; implement semantic gating locally only if the SDK exposes the required signal.
- `audio.input/output` -> documented `AudioConfig` encoding, sample rate, bit depth, and channel fields.
- `tts.chunk` -> documented `chunk_tts` or equivalent extra config when present.
- `capabilities.image` -> image send path only when enabled.

Use the fallback names `AIChainClient.Builder`, `SessionConfig`, `STTConfig`, `NLUConfig`, `TTSConfig`, `AudioConfig`, `VadConfig`, `TurnDetectionConfig`, and callback types only after official doc verification or fallback confirmation.

## Lifecycle And Concurrency

Keep these concerns separate in code:

- SDK connection/session state
- microphone capture
- audio frame upload
- server event/callback receive
- TTS playback
- interruption/cancel behavior
- lifecycle cleanup
- permission and network errors

For Compose, hold session state in a `ViewModel` and collect it from UI; release resources from `onCleared` and lifecycle stop hooks as appropriate. For Views, bind to `LifecycleOwner`/`onStart`/`onStop` or the project's existing presenter pattern. For a service, use a foreground service only when background capture/playback is truly required.

Full-duplex voice must upload frames off the main thread while receiving callbacks concurrently. Half-duplex voice must expose an explicit end-of-input operation after the last audio frame or uploaded file; do not depend on disconnect as the end-of-speech signal.

TTS playback should request audio focus, duck or stop according to the selected interruption strategy, and abandon focus on completion or close. Always release microphone, player, and SDK/network resources on lifecycle stop/destroy according to host app patterns.

## Image Input

When image understanding is enabled:

- Prefer existing image picker/camera abstractions.
- Downscale large images before encoding when the project lacks a policy.
- Send base64/data URL and MIME metadata in the SDK's documented shape.
- Use camera permission only for direct camera capture.

When image understanding is disabled, do not add camera, gallery, bitmap encoding, or multimodal message code.

## Error Handling

Surface these distinctly where the host app allows it:

- Missing credentials/config.
- Endpoint/region mapping failure.
- Microphone/camera permission denied.
- Network unavailable or WebSocket disconnected.
- SDK business/protocol error callback.
- Recorder/player initialization failure.
- Unsupported codec or sample rate.

Reconnect only through the SDK's documented reconnect behavior or the project's existing retry policy.

## Android Smoke Test

Prefer an instrumented smoke test when an emulator/device is available; otherwise add a debug-only screen or command entry wired to the same adapter.

Copy only selected fixtures:

- NLU/TTS: `assets/text/sample_zh.txt` or `assets/text/sample_en.txt`
- ASR: `assets/audio/zh_16k_pcm.wav` or `assets/audio/en_16k_pcm.wav`
- Image: `assets/image/apple.png`, `assets/image/apple_question_zh.txt`, `assets/image/apple_expected_zh.txt`

Suggested locations:

- `app/src/androidTest/assets/aichain/...` for instrumented tests.
- `app/src/debug/assets/aichain/...` for debug screens.

Minimum validation:

- SDK initializes with selected endpoint and credentials.
- Session config matches `AIChainProfile`.
- Text fixture returns a non-empty NLU/TTS result when selected.
- Audio fixture returns expected ASR terms when ASR is selected.
- Image fixture answer contains the expected term when image understanding is selected.
- Resources close after the test or debug run.

Suggested commands:

```bash
./gradlew testDebugUnitTest
./gradlew connectedDebugAndroidTest
adb logcat -s AIChainClient:D AIChainSmoke:D
```

If credentials or a device/emulator are missing, run the local fixture/profile self-check from `references/e2e-testing.md` and report real Android service testing as blocked.

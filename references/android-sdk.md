# Android SDK Integration Notes

Use this file only when `AIChainProfile.integration` is `android_sdk`.

If the official Yuque Android SDK page is not readable, read `references/fallback/android-sdk-source.md` before coding.

## Project Detection

Before editing, identify:

- Kotlin or Java
- Gradle convention: version catalog, buildSrc, Kotlin DSL, Groovy DSL
- UI stack: Compose, Views, hybrid WebView, background service
- minimum SDK and target SDK
- existing permission request flow
- existing audio recorder/player utilities

## Implementation

- Add the official AIChain Android SDK dependency and repository exactly as documented.
- Store endpoint and credentials in the app's existing secret mechanism, such as Gradle properties, BuildConfig, remote config, or encrypted storage.
- Resolve endpoint from the selected region using official docs or `references/region-endpoints.md`; ask for endpoint only for an unmapped custom region.
- Add microphone, network, foreground service, media, or camera permissions only when selected capabilities require them.
- Map `AIChainProfile` to the SDK's documented configuration object.
- Keep recorder, network session, playback, interruption, lifecycle cleanup, and error state separate.
- Release microphone, player, and network resources on lifecycle stop/destroy according to the host app's pattern.

## Full-Duplex Mobile Requirements

- Capture audio on a background-safe path.
- Upload frames without blocking UI.
- Receive ASR/NLU/TTS callbacks while capture may still be active.
- Stop or duck playback according to the selected interruption strategy.
- Recover cleanly from permission denial, network loss, and SDK error callbacks.

## Testing Hook

Prefer an Android instrumented smoke test or a debug screen wired to bundled fixtures copied into `androidTest/assets` or `src/debug/assets`.

Minimum validation:

- SDK initializes with selected endpoint and credentials.
- Text fixture returns an NLU/TTS result when those capabilities are selected.
- Audio fixture returns expected ASR terms when ASR is selected.
- Image fixture returns an answer containing the expected term when image understanding is selected.

# AIChain Smoke Testing

Use real AIChain service tests after integration code is written.

## Environment

Smoke scripts expect these generic variables unless the official source uses different names:

- `AICHAIN_ENDPOINT`
- `AICHAIN_APP_ID`
- `AICHAIN_API_KEY`
- `AICHAIN_USER_ID` optional unless required
- `AICHAIN_DEVICE_ID` optional unless required
- `AICHAIN_REGION` optional: `cn`, `us`, or another AIChain region code; defaults to `cn`
- `AICHAIN_MODEL_ID` optional: defaults to `b16924f42ffe4fd895d4ba4778278bc3`
- `AICHAIN_CHUNK_TTS` optional: maps to `chunk_tts`; use `true` or `false`, only when TTS is enabled
- `AICHAIN_PROFILE` optional JSON profile override

`AICHAIN_ENDPOINT` must match `AICHAIN_REGION`. For example, `cn`, `us`, and any other supported region code should each use its corresponding AIChain endpoint.

Do not silently skip missing credentials. Print the missing variables and stop.

## Fixtures

- `assets/text/sample.txt`: semantic/text request fixture.
- `assets/audio/zh_sample_pcm.raw`: Chinese STT fixture. Expected transcript: `北京今天天气怎么样`.
- `assets/audio/en_sample_wav.wav`: English STT fixture. Expected transcript: `hello please introduce yourself briefly`.
- `assets/image/sample.png`: image-understanding fixture. Ask `手里是什么？`; expected answer contains `苹果`.
- Expected values are also stored next to fixtures in `assets/audio/*_expected.txt` and `assets/image/expected_*.txt`.

Use the fixture that matches the generated profile.

## Acceptance Criteria

- Connection/authentication succeeds.
- The selected input type is accepted by AIChain.
- The response contains at least one expected result event or SDK callback.
- For Chinese STT, the recognition result contains `北京` and `天气`.
- For English STT, the recognition result contains `hello`, `introduce`, `yourself`, and `briefly` case-insensitively.
- For NLU, a semantic/text result is produced.
- For TTS, an audio response is produced or written to the documented output sink.
- For image understanding, the image answer to `手里是什么？` contains `苹果`.

## Script Notes

The included scripts are intentionally conservative harnesses. Align payload names, event names, and SDK method names with the official Yuque source before relying on them for production CI.

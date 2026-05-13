# AIChain Skills

Agent skill for AIChain developer integration. This skill helps coding assistants gather the minimum AIChain-specific requirements, generate an integration profile, implement WebAPI/SDK code, and run real-service smoke tests with bundled text, audio, and image fixtures.

## Installation

Install this repository with any Agent Skills compatible installer:

```bash
npx skills add <github-owner>/<github-repo>
```

For this local checkout, the skill entrypoint is:

```text
SKILL.md
```

This repository is a standard skill package. It intentionally does not include a custom CLI or npm package wrapper.

## Available Skills

| Skill | Description |
| --- | --- |
| `aichain-integration` | Integrate AIChain through WebAPI, JavaScript SDK, Python SDK, or Android SDK with guided profile collection and smoke testing. |

## Configuration

Real smoke tests require AIChain credentials:

```bash
export AICHAIN_ENDPOINT=""
export AICHAIN_APP_ID=""
export AICHAIN_API_KEY=""
```

`AICHAIN_ENDPOINT` must match `AICHAIN_REGION`. For example, use the `cn` endpoint with `AICHAIN_REGION="cn"` and the `us` endpoint with `AICHAIN_REGION="us"`.

Optional configuration:

```bash
export AICHAIN_REGION="cn"
export AICHAIN_MODEL_ID="b16924f42ffe4fd895d4ba4778278bc3"
export AICHAIN_CHUNK_TTS="true"
export AICHAIN_PROFILE='{"region":"cn","modelId":"b16924f42ffe4fd895d4ba4778278bc3","capabilities":"nlu"}'
export AICHAIN_JS_SDK_PACKAGE=""
export AICHAIN_PYTHON_SDK_PACKAGE=""
```

Defaults:

- `region`: `cn`; use `us` or another region code when the client is deployed outside China, with the matching endpoint
- `modelId`: `b16924f42ffe4fd895d4ba4778278bc3`
- Pure acoustic VAD: `minSilenceDuration=600ms`
- Acoustic + semantic VAD: `minSilenceDuration=300ms`, `minEndpointingDelay=250ms`
- `chunk_tts`: enabled when the developer is unsure and TTS is enabled

## Integration Support

The skill supports:

- WebAPI / WebSocket
- JavaScript / TypeScript SDK
- Python SDK
- Android SDK

Before coding, the skill asks focused multiple-choice questions for client region, capability mix, ASR language, duplex/VAD mode, interruption strategy, image understanding, audio codec, optional `chunk_tts`, and integration path. Every option includes a short explanation.

## References

Reference files are loaded only when needed:

- `references/webapi.md`
- `references/js-sdk.md`
- `references/python-sdk.md`
- `references/android-sdk.md`
- `references/testing.md`

The references keep links to the official Yuque docs. Exact endpoint, auth, event, SDK method, and parameter names should be checked against the official docs before production code generation.

## Smoke Tests

Run the path that matches the selected integration:

```bash
node scripts/smoke-webapi.mjs
node scripts/smoke-js.mjs
python3 scripts/smoke-python.py
```

Bundled fixtures:

- Chinese STT audio: `assets/audio/zh_sample_pcm.raw`
- Chinese expected text: `assets/audio/zh_expected.txt`
- English STT audio: `assets/audio/en_sample_wav.wav`
- English expected text: `assets/audio/en_expected.txt`
- Image fixture: `assets/image/sample.png`
- Image question: `assets/image/expected_question.txt`
- Image expected answer substring: `assets/image/expected_answer_contains.txt`
- Text fixture: `assets/text/sample.txt`

The scripts fail explicitly when required credentials are missing. STT checks validate Chinese and English expected terms; image understanding asks `手里是什么？` and expects an answer containing `苹果`.

## License

MIT

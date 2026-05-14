# Python SDK Integration Notes

Use this file only when `AIChainProfile.integration` is `python_sdk`.

If the official Yuque Python SDK page is not readable, read `references/fallback/python-sdk-source.md` before coding.

## Project Detection

Before editing, identify:

- dependency manager: uv, poetry, pip, pip-tools, conda
- runtime: script, FastAPI, Flask, Django, worker, notebook, or test utility
- sync or async conventions
- existing config/secrets pattern
- test runner: pytest, unittest, no runner

## Implementation

- Install the official AIChain Python SDK package named by the Yuque document.
- Keep a thin project adapter around SDK calls.
- Read `app_id`, `app_key`, base host endpoint, and device `sn` from environment or existing settings.
- Resolve the base host endpoint from the selected region using official docs or `references/region-endpoints.md`; ask for endpoint only for an unmapped custom region.
- Convert `AIChainProfile` into the SDK's documented configuration object.
- Keep async code async when the host project already uses async.
- Surface auth, transport, parameter, service, and timeout failures distinctly where practical.

## Expected Adapter Surface

Adapt names to the host project, but keep these responsibilities visible:

```python
connect()
send_text(text: str)
send_audio(data: bytes | Iterable[bytes])
send_image(data: bytes, prompt: str, mime_type: str = "image/png")
interrupt(reason: str | None = None)
close()
```

Implement only methods required by the selected capabilities.

## Testing Hook

Add a pytest or script entry that can run with:

```bash
AICHAIN_PROFILE_FILE=./aichain.profile.json python3 scripts/aichain_e2e.py --mode sdk-python
```

Set `AICHAIN_PYTHON_SDK_PACKAGE` only if the generic runner is used directly. Prefer the project's real integration test once code has been generated.

Known SDK constructor fields include `app_id`, `app_key`, `host`, `sn`, `scene`, `secure`, reconnect options, and logging options.

# Official Sources and Local Fallbacks

Try the relevant official Yuque document first. If the agent has no browser/network access, the page is unavailable, the page is behind login, or the rendered page does not expose the needed details, use the matching local markdown in `references/fallback/` and continue.

## Source Links

- WebAPI: https://www.yuque.com/aiui_open_platform/knowledge/hf7xdluok2yz3dib
  - Local fallback: `references/fallback/webapi-source.md`
- JavaScript SDK: https://www.yuque.com/aiui_open_platform/knowledge/uwyv0442g4050ipg
  - Local fallback: `references/fallback/js-sdk-source.md`
- Python SDK: https://www.yuque.com/aiui_open_platform/knowledge/kivkb90gkeouobbe
  - Local fallback: `references/fallback/python-sdk-source.md`
- Android SDK: https://www.yuque.com/aiui_open_platform/knowledge/mbq79tvlq9vnbia5
  - Local fallback: `references/fallback/android-sdk-source.md`

## Access Procedure

1. Attempt to read the official URL for the selected integration path.
2. Treat these as access failures: timeout, HTTP error, login wall, empty body, unreadable dynamic shell, unavailable browser/network tool, or missing visible protocol/API details.
3. On access failure, state briefly: `Official document was not readable in this environment; using local fallback markdown.`
4. Read the mapped `references/fallback/*-source.md` file.
5. Also read the concise implementation reference for the selected path, such as `references/webapi.md` or `references/js-sdk.md`.
6. For endpoint selection, resolve the selected region from official docs first, then `references/region-endpoints.md`.
7. Ask the developer only for exact values missing from both the official page and local fallback.

Before trusting a fallback file, confirm its title/content matches the selected integration path. If, for example, `webapi-source.md` contains Android SDK content, report that mismatch and rely on the concise local implementation reference for known protocol details while asking only for any missing exact WebAPI fields.

## Verification Rules

Before coding exact values, verify these against the official AIChain document for the selected integration path:

- endpoint by region
- authentication scheme and credential names
- signed WebSocket URL format: `/v1/chat/<appId>` with `curtime`, `checksum`, `sn`, and `scene`
- WebSocket URL, headers, events, payload shapes, close/error behavior
- SDK package or Maven coordinates
- SDK class names, constructor options, callbacks, and method names
- model id field name
- ASR language parameter names
- duplex and VAD parameter names
- interruption parameter names and event behavior
- image input encoding and supported MIME types
- audio codec identifiers, sample rates, containers, and frame size rules
- TTS output events, chunking controls, and output codec behavior

If both the official page and local fallback lack a required exact value, ask only for that missing value.

# JavaScript SDK Integration Notes

Use this file only when `AIChainProfile.integration` is `js_sdk`.

If the official Yuque JS SDK page is not readable, read `references/fallback/js-sdk-source.md` before coding.

## Project Detection

Before editing, identify:

- package manager: npm, pnpm, yarn, bun
- runtime: browser, Node.js, SSR, Electron, React Native, or hybrid
- TypeScript or JavaScript
- existing config/secrets pattern
- existing test runner

## Implementation

- Install the official AIChain JavaScript SDK package named by the Yuque document.
- Create a small adapter module rather than spreading SDK calls through UI or route handlers.
- Read `appId`, `appKey`, base host endpoint, and device `sn` from the host config.
- Resolve the base host endpoint from the selected region using official docs or `references/region-endpoints.md`; ask for endpoint only for an unmapped custom region.
- Convert `AIChainProfile` into the SDK's documented configuration object.
- Browser code must handle microphone permission, stream cleanup, and component unmount.
- Node.js code must avoid browser APIs and stream files/buffers from server-side sources.

## Expected Adapter Surface

Adapt names to the host project, but keep these responsibilities visible:

```ts
connect(): Promise<void>
sendText(text: string): Promise<AIChainResult>
sendAudio(input: AsyncIterable<Uint8Array> | Uint8Array): Promise<AIChainResult>
sendImage(input: Uint8Array | Blob, prompt: string): Promise<AIChainResult>
interrupt(reason?: string): Promise<void>
close(): Promise<void>
```

Implement only methods required by the selected capabilities.

## Testing Hook

Add a script or test that can run with:

```bash
AICHAIN_PROFILE_FILE=./aichain.profile.json node scripts/aichain-e2e.mjs --mode sdk-js
```

Set `AICHAIN_JS_SDK_PACKAGE` only if the generic runner is used directly. Prefer the project's real integration test once code has been generated.

Known SDK constructor fields include `appId`, `appKey`, `host`, `sn`, `scene`, `secure`, `autoReconnect`, and log/reconnect options.

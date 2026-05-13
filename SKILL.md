---
name: aichain-integration
description: Use when integrating AIChain through WebAPI, JavaScript SDK, Python SDK, or Android SDK, especially when the developer needs guided multiple-choice requirements gathering for region, capability mix, ASR language, duplex/VAD mode, interruption policy, image understanding, audio codec, and integration path before code generation and real end-to-end smoke testing.
---

# AIChain Integration

Use this skill to implement AIChain integrations. Do not start coding until the AIChain Integration Profile is complete.

## Workflow

1. Inspect the current project just enough to understand the tech stack and where integration code should live.
2. Ask only the required multiple-choice questions below. Every option must include its explanation so the developer can choose without prior AIChain expertise. Use `request_user_input` when available. If it is unavailable, ask concise numbered choices in chat with the explanation after each option.
3. Skip conditional questions that do not apply.
4. Convert answers into an `AIChain Integration Profile` YAML block.
5. Load only the reference files needed by the chosen integration path and capability mix.
6. If required runtime values are missing, ask only for the missing values: endpoint, appId, apiKey/token, userId/deviceId, or the documented equivalent.
7. Implement the integration in the project style.
8. Run real-service smoke tests when credentials are available. Missing credentials must be reported explicitly.

Do not ask broad product-background questions unless the current project makes implementation impossible without them.

## Required Questions

Ask in this order.

1. 客户端区域
   - cn: 客户端主要在中国大陆网络环境使用，使用 `cn` 对应的 AIChain endpoint。
   - us: 客户端主要在美国或北美网络环境使用，使用 `us` 对应的 AIChain endpoint。
   - 其他区域代码: 客户端主要在其他区域使用，用户需要提供区域代码及其对应 endpoint。

2. 能力要求
   - 识别 + 语义 + 合成: 用户说话或上传音频，AIChain 先做语音识别，再理解语义，最后返回语音播报。
   - 语义 + 合成: 用户输入文本或结构化内容，AIChain 做语义理解并返回语音播报。
   - 识别: 只把语音转成文字，不需要语义理解或语音合成。
   - 语义: 只处理文本、图片或结构化输入的语义理解，不需要语音识别或语音合成。
   - 合成: 只把文本转成语音，不需要语音识别或语义理解。

3. 识别语种
   - Ask only when capability includes 识别.
   - 中文: 音频主要是中文，使用中文识别配置。
   - 英文: 音频主要是英文，使用英文识别配置。
   - 多语言: 已知会混合多种语言，需要显式启用多语言识别能力。
   - 自动识别: 不确定用户会说什么语言，由 AIChain 自动判断语种。

4. 识别模式
   - Ask only when capability includes 识别.
   - 半双工: 用户说完或上传完成后再请求结果，实现简单，适合按住说话、录音文件、一次性语音输入。
   - 全双工 + 声学 VAD: 边采集边发送音频，基于声音停顿判断一句话结束，默认 `minSilenceDuration=600ms`，适合实时语音交互。
   - 全双工 + 声学 VAD + 语义 VAD: 在声音停顿基础上结合语义判断是否说完，默认 `minSilenceDuration=300ms`、`minEndpointingDelay=250ms`，适合更自然的连续对话。

5. 打断策略
   - 强制打断: 用户一开口或触发输入就立即停止当前合成/播放，响应最快但可能误打断。
   - 语义判断后打断: 先判断用户输入是否真的要打断当前回复，再停止输出，体验更稳但链路更复杂。
   - 不打断: 当前回复播放完成前不接受打断，实现最简单，适合播报型场景。

6. 图片理解
   - 需要: 用户会上传图片或拍照，需要把图片作为多模态输入一起理解。
   - 不需要: 只处理文本或音频，不生成图片上传、编码或多模态参数。

7. 音频编码
   - 输入 opus-wb，输出 opus-wb: 上下行都使用压缩宽带语音，节省带宽，适合移动端或弱网。
   - 输入 pcm，输出 pcm: 上下行都使用原始 PCM，链路直观，便于调试，但带宽占用更高。
   - 输入 opus-wb，输出 pcm: 上传音频节省带宽，服务端返回原始 PCM 方便本地播放或处理。
   - 输入 pcm，输出 opus-wb: 上传保留原始音频，返回压缩语音节省下行带宽。
   - 其他: 项目已有特定编码、采样率、容器格式或转码链路，需要用户补充。

8. TTS 分片发送
   - Ask only when capability includes 合成.
   - 开启 chunk_tts: 服务端按更小片段返回合成音频，适合设备播放缓冲区较小、需要降低单次下发数据量的场景，但发送频次可能增加。
   - 关闭 chunk_tts: 服务端按默认策略返回合成音频，适合缓冲区充足或希望减少分片处理复杂度的场景。
   - 不确定: 先按设备缓冲区较小处理，默认开启 `chunk_tts`，后续可根据播放稳定性调整。

9. 接入方式
   - WebAPI: 直接按 WebSocket/API 协议接入，控制最完整，适合自定义客户端或服务端封装。
   - JS SDK: 使用 JavaScript/TypeScript SDK，适合浏览器、Node.js 或前端项目快速接入。
   - Python SDK: 使用 Python SDK，适合 Python 服务端、脚本、测试工具或后端任务。
   - Android SDK: 使用 Android 原生 SDK，适合 Kotlin/Java App 直接接入麦克风、播放和移动端生命周期。

## Profile Schema

Always normalize answers into this shape:

```yaml
region: cn | us | <region-code>
modelId: b16924f42ffe4fd895d4ba4778278bc3
capabilities: stt_nlu_tts | nlu_tts | stt | nlu | tts
language: zh | en | multilingual | auto | null
duplex: half | full | null
vad: none | acoustic | acoustic_semantic | null
vad_config:
  minSilenceDuration: 600 | 300 | null
  minEndpointingDelay: 250 | null
interrupt: force | semantic | none
image_understanding: true | false
chunk_tts: true | false | null
audio:
  input: opus-wb | pcm | other
  output: opus-wb | pcm | other
integration: webapi | js_sdk | python_sdk | android_sdk
```

When capability does not include recognition, set `language`, `duplex`, `vad`, and all `vad_config` fields to `null`.
When capability does not include synthesis, set `chunk_tts` to `null`.

Default region mapping:

- Default `region` to `cn` when the developer has not answered or when `AICHAIN_REGION` is unset.
- Treat `region` as an endpoint selection key. Every region code, such as `cn`, `us`, or another code, must map to its corresponding AIChain endpoint.
- If the selected region's endpoint is not already known from official docs or project config, ask only for that endpoint.

Default VAD mapping:

- `vad: acoustic`: set `vad_config.minSilenceDuration` to `600` and `vad_config.minEndpointingDelay` to `null`.
- `vad: acoustic_semantic`: set `vad_config.minSilenceDuration` to `300` and `vad_config.minEndpointingDelay` to `250`.
- `duplex: half` or `vad: none`: set all `vad_config` fields to `null`.

Default model mapping:

- Always set `modelId` to `b16924f42ffe4fd895d4ba4778278bc3` unless the developer explicitly requests another model.
- Include `modelId` in session configuration, SDK initialization, or request payload according to the selected integration path.

Default TTS chunking:

- Ask the optional `chunk_tts` question only when `capabilities` includes TTS.
- Set `chunk_tts: true` when the developer chooses "开启 chunk_tts" or "不确定".
- Set `chunk_tts: false` when the developer chooses "关闭 chunk_tts".
- Include `chunk_tts` in session configuration, SDK initialization, or request payload according to the selected integration path.

## Reference Loading

- WebAPI: read `references/webapi.md`.
- JS SDK: read `references/js-sdk.md`.
- Python SDK: read `references/python-sdk.md`.
- Android SDK: read `references/android-sdk.md`.
- Real smoke tests and bundled fixtures: read `references/testing.md`.

Read the official Yuque source before implementing fields that are likely to change, including endpoint, auth, event names, parameter names, codec names, VAD flags, and interruption controls.

## Implementation Rules

- Keep generated code scoped to the selected integration path.
- Prefer the repository's existing framework, configuration style, and test runner.
- Store credentials in environment variables or existing secret/config mechanisms; never hardcode secrets.
- Default `modelId` to `b16924f42ffe4fd895d4ba4778278bc3` in generated AIChain configuration.
- For TTS-enabled integrations, configure `chunk_tts` from the profile. Default to enabled when the developer is unsure because many devices have small playback buffers.
- Surface protocol events and errors in a way the host app can log or handle.
- For full-duplex recognition, implement a clear state machine for connect, configure, stream audio, receive partial/final events, interrupt, and close.
- For pure acoustic VAD, configure `minSilenceDuration=600ms`.
- For acoustic + semantic VAD, configure `minSilenceDuration=300ms` and `minEndpointingDelay=250ms`.
- For half-duplex recognition, implement explicit upload/end-of-input behavior.
- For TTS, handle output codec and playback/storage according to the selected audio profile.
- For image understanding, include image encoding/upload logic only when `image_understanding` is true.

## Smoke Testing

Use the bundled fixtures:

- Text: `assets/text/sample.txt`
- Chinese recognition audio: `assets/audio/zh_sample_pcm.raw`, expected transcript contains `北京` and `天气`.
- English recognition audio: `assets/audio/en_sample_wav.wav`, expected transcript contains `hello`, `introduce`, `yourself`, and `briefly`.
- Image understanding: `assets/image/sample.png`, ask `手里是什么？`, expected answer contains `苹果`.

Use these scripts when they match the selected path:

- WebAPI: `scripts/smoke-webapi.mjs`
- JS SDK: `scripts/smoke-js.mjs`
- Python SDK: `scripts/smoke-python.py`

Smoke tests must fail loudly when credentials or required endpoint values are missing.

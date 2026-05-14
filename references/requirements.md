# AIChain Requirement Discovery

Ask these questions before implementation. Preserve the user's wording when it contains project-specific details, but normalize the final profile to the schema below.

## Question Set

1. 客户端区域
   - A. 中国大陆: 客户端主要在中国大陆网络环境使用，endpoint 从官方文档或 `references/region-endpoints.md` 自动解析。
   - B. 海外: 客户端主要在海外网络环境使用，endpoint 从官方文档或 `references/region-endpoints.md` 自动解析。
   - C. 自定义区域: 客户端部署在特定区域，先从官方文档或 `references/region-endpoints.md` 查找；只有找不到时才要求用户提供 endpoint。

2. 能力要求
   - A. 识别 + 语义 + 合成: 语音输入，经过 ASR 转写、NLU 理解，再用 TTS 返回语音。
   - B. 语义 + 合成: 文本或结构化输入，经过 NLU 理解，再用 TTS 返回语音。
   - C. 识别: 只做 ASR，把音频转文本。
   - D. 语义: 只做 NLU，处理文本、图片或结构化输入。
   - E. 合成: 只做 TTS，把文本转语音。

3. 识别语种
   - Ask only when ASR is selected.
   - A. 中文: 主要识别中文语音。
   - B. 英文: 主要识别英文语音。
   - C. 多语言: 已知会混合多种语言。
   - D. 自动识别: 不确定用户会说什么语言，由服务判断。

4. 识别交互模式
   - Ask only when ASR is selected.
   - A. 半双工: 用户说完或文件上传完成后再取结果，适合按住说话、录音文件、一次性语音输入。
   - B. 全双工 + 声学 VAD: 采集时持续上传音频，用声音停顿判断一句话结束，适合实时语音交互。
   - C. 全双工 + 声学 VAD + 语义 VAD: 在声音停顿基础上结合语义判断是否说完，适合更自然的连续对话。

5. 打断策略
   - A. 强制打断: 用户一开口或输入一到达就停止当前回复，响应最快但更容易误打断。
   - B. 语义判断后打断: 先判断用户输入是否真的要打断当前回复，再停止输出，体验更稳但实现更复杂。
   - C. 不打断: 当前回复播完前不接受打断，适合播报型场景。

6. 图片理解
   - A. 需要: 用户会上传图片、拍照或提供截图，集成需要处理图片输入。
   - B. 不需要: 只处理文本或音频，不增加图片编码、上传和多模态参数。

7. 音频输入和输出编码
   - A. 输入 opus-wb，输出 opus-wb: 上下行都压缩，适合移动端或弱网。
   - B. 输入 pcm，输出 pcm: 原始音频链路，调试直观但带宽更高。
   - C. 输入 opus-wb，输出 pcm: 上传节省带宽，返回原始音频便于本地播放或处理。
   - D. 输入 pcm，输出 opus-wb: 上传保留原始音频，返回压缩音频节省下行带宽。
   - E. 其他: 项目已有明确采样率、容器、编码或转码链路，需要用户补充。

8. 接入方式
   - A. WebAPI: 直接按 WebSocket/API 协议接入，控制最完整，适合自定义客户端或服务端封装。
   - B. JavaScript SDK: 适合浏览器、Node.js、前端或 TypeScript 项目快速接入。
   - C. Python SDK: 适合 Python 服务端、脚本、测试工具或后端任务。
   - D. Android SDK: 适合 Kotlin/Java 原生 App，直接接入麦克风、播放和移动端生命周期。

9. TTS 分片策略
   - Ask only when TTS is selected.
   - A. 开启 chunk_tts: 更适合设备播放缓冲区较小、需要减少服务端单次发送频次或降低设备处理压力的场景。
   - B. 关闭 chunk_tts: 更适合缓冲充足、希望减少分片处理复杂度的服务端或播放器。
   - C. 不确定: 先开启，并在端到端测试中观察播放稳定性。

## Profile Schema

```yaml
AIChainProfile:
  region:
    code: cn | overseas | custom | <documented-region-code>
    endpoint: null
  integration: webapi | js_sdk | python_sdk | android_sdk
  modelId: b16924f42ffe4fd895d4ba4778278bc3
  capabilities:
    asr: true | false
    nlu: true | false
    tts: true | false
    image: true | false
  asr:
    language: zh | en | multilingual | auto | null
    duplex: half | full | null
    vad: none | acoustic | acoustic_semantic | null
  interruption: force | semantic | none
  audio:
    input: opus-wb | pcm | other | null
    output: opus-wb | pcm | other | null
    notes: null
  tts:
    chunk: true | false | null
  runtime:
    appIdEnv: AICHAIN_APP_ID
    appKeyEnv: AICHAIN_APP_KEY
    endpointEnv: AICHAIN_ENDPOINT
    snEnv: AICHAIN_SN
```

## Normalization

- `识别 + 语义 + 合成` maps to `asr: true`, `nlu: true`, `tts: true`.
- `语义 + 合成` maps to `asr: false`, `nlu: true`, `tts: true`.
- `识别` maps to `asr: true`, `nlu: false`, `tts: false`.
- `语义` maps to `asr: false`, `nlu: true`, `tts: false`.
- `合成` maps to `asr: false`, `nlu: false`, `tts: true`.
- If ASR is false, set `asr.language`, `asr.duplex`, and `asr.vad` to `null`.
- Half-duplex ASR maps to `duplex: half` and `vad: none`.
- Full-duplex acoustic VAD maps to `duplex: full` and `vad: acoustic`.
- Full-duplex acoustic + semantic VAD maps to `duplex: full` and `vad: acoustic_semantic`.
- For pure acoustic VAD, set `minSilenceDuration: 600`.
- For acoustic + semantic VAD, set `minSilenceDuration: 300` and `minEndpointingDelay: 250`.
- If TTS is false, set `tts.chunk` to `null`.
- If TTS is true and the developer selects `不确定`, set `tts.chunk` to `true`.
- If audio is irrelevant to the selected capability mix, set audio input/output to `null`.
- Region codes are not endpoints. Resolve selected region from official docs first, then `references/region-endpoints.md`. Ask the user for endpoint only when neither source has a mapping.

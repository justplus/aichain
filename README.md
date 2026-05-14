# AIChain Skills

[中文](#中文) | [English](#english)

---

## 中文

面向 AIChain 开发者集成的 Agent Skill。该 skill 会先通过选择题收集接入背景，再生成 `AIChainProfile`，最后按 WebAPI、JavaScript SDK、Python SDK 或 Android SDK 完成代码集成与端到端测试。

## 安装

从当前仓库安装：

```bash
npx skills add justplus/aichain
```

## 可用 Skill

| Skill | 说明 |
| --- | --- |
| `aichain-integration` | 通过选择题收集区域、能力、语种、VAD、打断、图片理解、编码、接入方式和 `chunk_tts` 要求，并生成 AIChain 集成代码与测试。 |

## 配置

真实服务端到端测试需要：

```bash
export AICHAIN_REGION="cn"
export AICHAIN_APP_ID="your-app-id"
export AICHAIN_APP_KEY="your-app-key"
```

`AICHAIN_ENDPOINT` 可选。用户选择 region 后，skill 会优先从官方文档或 `references/region-endpoints.md` 自动解析 endpoint，例如：

| Region | Endpoint |
| --- | --- |
| `cn` | `wss://aichain-sh.xfyun.cn` |
| `us` | `wss://aichain-us.iflyoversea.com` |
| `rus` | `wss://aichain-rus.iflyoversea.com` |

可选配置：

```bash
export AICHAIN_SN="device-or-test-sn"
export AICHAIN_MODEL_ID="b16924f42ffe4fd895d4ba4778278bc3"
export AICHAIN_PROFILE_FILE="./aichain.profile.json"
export AICHAIN_PROFILE='{"region":{"code":"cn"},"capabilities":{"nlu":true}}'
```

## 能力覆盖

该 skill 支持以下能力组合：

- 识别 + 语义 + 合成
- 语义 + 合成
- 识别
- 语义
- 合成

ASR 场景会继续确认语种、半双工/全双工、声学 VAD 或声学 + 语义 VAD。默认规则：

- 纯声学 VAD：`minSilenceDuration=600ms`
- 声学 + 语义 VAD：`minSilenceDuration=300ms`，`minEndpointingDelay=250ms`

TTS 场景会询问可选的 `chunk_tts`。设备播放缓冲区较小时建议开启；用户不确定时默认开启。

## 文档 Fallback

skill 会先尝试读取官方 Yuque 文档；如果当前 AI 环境没有浏览器/网络访问能力，或页面不可读，会自动使用本地 markdown：

| 接入方式 | 官方文档 | 本地 fallback |
| --- | --- | --- |
| WebAPI | `https://www.yuque.com/aiui_open_platform/knowledge/hf7xdluok2yz3dib` | `references/fallback/webapi-source.md` |
| JS SDK | `https://www.yuque.com/aiui_open_platform/knowledge/uwyv0442g4050ipg` | `references/fallback/js-sdk-source.md` |
| Python SDK | `https://www.yuque.com/aiui_open_platform/knowledge/kivkb90gkeouobbe` | `references/fallback/python-sdk-source.md` |
| Android SDK | `https://www.yuque.com/aiui_open_platform/knowledge/mbq79tvlq9vnbia5` | `references/fallback/android-sdk-source.md` |

## SDK 支持

- WebAPI / WebSocket
- JavaScript / TypeScript SDK
- Python SDK
- Android SDK

## 测试

本地 profile 和 fixture 自检：

```bash
node scripts/aichain-e2e.mjs --mode self-check
python3 scripts/aichain_e2e.py --mode self-check
```

真实 WebAPI smoke test：

```bash
AICHAIN_REGION=cn \
AICHAIN_APP_ID="your-app-id" \
AICHAIN_APP_KEY="your-app-key" \
node scripts/aichain-e2e.mjs --mode webapi
```

测试资产位于 `assets/`：

- 文本：`assets/text/sample_zh.txt`、`assets/text/sample_en.txt`
- 语音：`assets/audio/zh_16k_pcm.wav`、`assets/audio/en_16k_pcm.wav`
- 图片：`assets/image/apple.png`

## 许可证

MIT

---

## English

Agent Skill for AIChain developer integration. The skill first collects integration requirements with multiple-choice questions, normalizes them into an `AIChainProfile`, then implements WebAPI, JavaScript SDK, Python SDK, or Android SDK integration code and runs end-to-end tests.

## Installation

Install from this repository:

```bash
npx skills add justplus/aichain
```


## Available Skill

| Skill | Description |
| --- | --- |
| `aichain-integration` | Collects region, capability mix, language, VAD, interruption, image understanding, codecs, integration path, and `chunk_tts` requirements, then generates AIChain integration code and tests. |

## Configuration

Real service end-to-end tests require:

```bash
export AICHAIN_REGION="cn"
export AICHAIN_APP_ID="your-app-id"
export AICHAIN_APP_KEY="your-app-key"
```

`AICHAIN_ENDPOINT` is optional. After the user selects a region, the skill resolves the endpoint from official docs or `references/region-endpoints.md`, for example:

| Region | Endpoint |
| --- | --- |
| `cn` | `wss://aichain-sh.xfyun.cn` |
| `us` | `wss://aichain-us.iflyoversea.com` |
| `rus` | `wss://aichain-rus.iflyoversea.com` |

Optional configuration:

```bash
export AICHAIN_SN="device-or-test-sn"
export AICHAIN_MODEL_ID="b16924f42ffe4fd895d4ba4778278bc3"
export AICHAIN_PROFILE_FILE="./aichain.profile.json"
export AICHAIN_PROFILE='{"region":{"code":"cn"},"capabilities":{"nlu":true}}'
```

## Capability Coverage

The skill supports these capability mixes:

- ASR + NLU + TTS
- NLU + TTS
- ASR only
- NLU only
- TTS only

ASR flows ask follow-up questions for language, half/full duplex, acoustic VAD, and acoustic + semantic VAD. Defaults:

- Acoustic VAD: `minSilenceDuration=600ms`
- Acoustic + semantic VAD: `minSilenceDuration=300ms`, `minEndpointingDelay=250ms`

TTS flows ask the optional `chunk_tts` question. Enable it for devices with smaller playback buffers; default to enabled when the developer is unsure.

## Documentation Fallback

The skill tries the official Yuque docs first. If the AI environment has no browser/network access, or the page is unreadable, it uses local markdown fallbacks:

| Integration | Official doc | Local fallback |
| --- | --- | --- |
| WebAPI | `https://www.yuque.com/aiui_open_platform/knowledge/hf7xdluok2yz3dib` | `references/fallback/webapi-source.md` |
| JS SDK | `https://www.yuque.com/aiui_open_platform/knowledge/uwyv0442g4050ipg` | `references/fallback/js-sdk-source.md` |
| Python SDK | `https://www.yuque.com/aiui_open_platform/knowledge/kivkb90gkeouobbe` | `references/fallback/python-sdk-source.md` |
| Android SDK | `https://www.yuque.com/aiui_open_platform/knowledge/mbq79tvlq9vnbia5` | `references/fallback/android-sdk-source.md` |

## SDK Support

- WebAPI / WebSocket
- JavaScript / TypeScript SDK
- Python SDK
- Android SDK

## Testing

Local profile and fixture self-checks:

```bash
node scripts/aichain-e2e.mjs --mode self-check
python3 scripts/aichain_e2e.py --mode self-check
```

Real WebAPI smoke test:

```bash
AICHAIN_REGION=cn \
AICHAIN_APP_ID="your-app-id" \
AICHAIN_APP_KEY="your-app-key" \
node scripts/aichain-e2e.mjs --mode webapi
```

Fixtures live under `assets/`:

- Text: `assets/text/sample_zh.txt`, `assets/text/sample_en.txt`
- Audio: `assets/audio/zh_16k_pcm.wav`, `assets/audio/en_16k_pcm.wav`
- Image: `assets/image/apple.png`

## License

MIT

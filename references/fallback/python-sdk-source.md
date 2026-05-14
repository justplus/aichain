# AIChain Python SDK 集成指南
## 目录
+ [简介](#简介)
+ [快速开始](#快速开始)
+ [详细配置](#详细配置)
+ [API 参考](#api-参考)
+ [事件系统](#事件系统)
+ [完整集成流程](#完整集成流程)
+ [最佳实践](#最佳实践)
+ [错误处理](#错误处理)
+ [常见问题](#常见问题)

---

## 简介
AIChain Python SDK 是一个基于 WebSocket 的实时通信 SDK，支持语音识别（STT）、自然语言理解（NLU）和语音合成（TTS）功能。本 SDK 提供了完整的 Python 异步支持，基于 asyncio 和 websockets 实现。

### 主要特性
+ ✅ WebSocket 实时双向通信
+ ✅ 自动重连机制
+ ✅ 多模态消息支持（文本、语音、图片）
+ ✅ 流式数据传输
+ ✅ 完整的事件系统
+ ✅ 异步 I/O 设计（基于 asyncio）
+ ✅ 按序回调缓存机制
+ ✅ 类型提示支持（Type Hints）

### 系统要求
+ **Python 版本**: Python 3.9+
+ **操作系统**: Windows / Linux / macOS
+ **依赖库**: websockets, pydantic, numpy, soundfile

---

## 快速开始
### 1. 安装依赖
使用 pip 安装 SDK：

```bash
pip install -i https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple aichain-sdk
```

### 2. 初始化客户端
```python
import asyncio
from aichain_sdk import AIChainClient

client = AIChainClient(
    app_id="your-app-id",
    app_key="your-app-key",
    host="your-host",
    sn="your-device-sn"
)
```

### 3. 连接服务器
```python
async def main():
    await client.connect()
    print("连接成功")

asyncio.run(main())
```

### 4. 发送消息
```python
@client.on("nlu.answer")
def on_answer(cid: str, result, is_last: bool):
    print(result.answer, end="", flush=True)
    if is_last:
        print()

async def main():
    await client.connect()
    await client.set_config({
        "nlu": {"enable": True}
    })

    await client.send_text("你好，世界！")
    await asyncio.sleep(5)
    await client.disconnect()

asyncio.run(main())
```

---

## 详细配置
### 客户端初始化参数
`AIChainClient` 构造函数提供了丰富的配置选项：

| 参数                     | 类型 | 必填 | 默认值      | 说明                                |
| ------------------------ | ---- | ---- | ----------- | ----------------------------------- |
| `app_id`                 | str  | ✅    | -           | 应用 ID，由平台分配                 |
| `app_key`                | str  | ✅    | -           | 应用密钥，用于身份验证              |
| `host`                   | str  | ✅    | -           | 服务器地址（不含协议前缀）          |
| `sn`                     | str  | ✅    | -           | 设备序列号，唯一标识设备            |
| `scene`                  | str  | ❌    | "main"      | 场景名称，用于多场景应用            |
| `channel`                | str  | ❌    | "real_time" | 通道名称                            |
| `secure`                 | bool | ❌    | False       | 是否使用安全连接（wss://）          |
| `auto_reconnect`         | bool | ❌    | True        | 是否启用自动重连                    |
| `reconnect_interval`     | int  | ❌    | 1000        | 初始重连间隔（毫秒）                |
| `max_reconnect_interval` | int  | ❌    | 30000       | 最大重连间隔（毫秒）                |
| `max_reconnect_attempts` | int  | ❌    | 10          | 最大重连次数                        |
| `log_level`              | str  | ❌    | "INFO"      | 日志级别（DEBUG/INFO/WARN/ERROR）   |
| `debug`                  | bool | ❌    | False       | 是否启用调试模式（保存音频文件）    |
| `log_file`               | str  | ❌    | None        | 日志文件路径（None 则输出到控制台） |


#### 完整配置示例
```python
client = AIChainClient(
    app_id="your-app-id",
    app_key="your-app-key",
    host="your-host.com",
    sn="device-12345",
    scene="main",
    channel="real_time",
    secure=True,
    auto_reconnect=True,
    reconnect_interval=2000,
    max_reconnect_interval=60000,
    max_reconnect_attempts=20,
    log_level="DEBUG",
    debug=True,
    log_file="aichain.log"
)
```

### 会话配置（SessionConfig）
连接成功后，需要配置会话参数。配置可以使用字典或 `SessionConfig` 数据类。

#### 配置参数说明
**基础配置**

| 参数                 | 类型 | 默认值        | 说明                                                            |
| -------------------- | ---- | ------------- | --------------------------------------------------------------- |
| `mode`               | str  | "full_duplex" | 工作模式：`"full_duplex"`（全双工）或 `"half_duplex"`（半双工） |
| `simplifiedResponse` | bool | True          | 是否简化响应内容                                                |
| `multiTurnEnabled`   | bool | True          | 是否启用多轮对话                                                |
| `extraConfig`        | dict | {}            | 额外配置参数                                                    |


**STTConfig（语音识别配置）**

| 参数            | 类型                | 默认值 | 说明                              |
| --------------- | ------------------- | ------ | --------------------------------- |
| `enable`        | bool                | False  | 是否启用 STT                      |
| `sttEngineId`   | str                 | ""     | STT 引擎 ID                       |
| `language`      | str                 | "auto" | 语言代码（如 "zh", "en", "auto"） |
| `audioConfig`   | AudioConfig         | -      | 音频配置                          |
| `vad`           | VadConfig           | -      | 语音活动检测配置                  |
| `turnDetection` | TurnDetectionConfig | -      | 轮次检测配置                      |
| `interrupt`     | InterruptConfig     | -      | 打断配置                          |


**AudioConfig（音频配置）**

| 参数            | 类型 | 默认值  | 说明                          |
| --------------- | ---- | ------- | ----------------------------- |
| `audioEncoding` | str  | "raw"   | 音频编码格式（"raw", "opus"） |
| `format`        | str  | "plain" | 音频格式                      |
| `sampleRate`    | int  | 16000   | 采样率（Hz）                  |
| `bitDepth`      | int  | 16      | 位深度                        |
| `channels`      | int  | 1       | 声道数（1=单声道, 2=立体声）  |


**VadConfig（语音活动检测配置）**

| 参数                  | 类型  | 默认值 | 说明                     |
| --------------------- | ----- | ------ | ------------------------ |
| `enable`              | bool  | True   | 是否启用 VAD             |
| `minSpeechDuration`   | int   | 50     | 最小语音持续时间（毫秒） |
| `minSilenceDuration`  | int   | 600    | 最小静音持续时间（毫秒） |
| `activationThreshold` | float | 0.5    | 激活阈值（0.0-1.0）      |


**TurnDetectionConfig（轮次检测配置）**

| 参数                  | 类型 | 默认值 | 说明                 |
| --------------------- | ---- | ------ | -------------------- |
| `enable`              | bool | True   | 是否启用轮次检测     |
| `minEndpointingDelay` | int  | 500    | 最小端点延迟（毫秒） |
| `maxEndpointingDelay` | int  | 3000   | 最大端点延迟（毫秒） |


**InterruptConfig（打断配置）**

| 参数     | 类型 | 默认值 | 说明             |
| -------- | ---- | ------ | ---------------- |
| `enable` | bool | True   | 是否允许用户打断 |


**NLUConfig（自然语言理解配置）**

| 参数                     | 类型        | 默认值 | 说明                     |
| ------------------------ | ----------- | ------ | ------------------------ |
| `enable`                 | bool        | False  | 是否启用 NLU             |
| `streamingFlushInterval` | int         | 500    | 流式输出刷新间隔（毫秒） |
| `welcomeReply`           | list        | []     | 欢迎语列表               |
| `tools`                  | ToolsConfig | None   | 工具调用配置             |
| `rag`                    | RagConfig   | None   | RAG 检索配置             |


**ToolsConfig（工具配置）**

| 参数             | 类型     | 默认值                         | 说明           |
| ---------------- | -------- | ------------------------------ | -------------- |
| `model`          | LLMModel | -                              | LLM 模型配置   |
| `toolCallPrompt` | str      | "请根据用户需求选择合适的工具" | 工具调用提示词 |


**RagConfig（RAG 配置）**

| 参数             | 类型           | 默认值                     | 说明            |
| ---------------- | -------------- | -------------------------- | --------------- |
| `model`          | LLMModel       | -                          | LLM 模型配置    |
| `threshold`      | float          | 0.7                        | 相似度阈值      |
| `contextLength`  | int            | 2000                       | 上下文长度      |
| `topN`           | int            | 5                          | 返回前 N 个结果 |
| `polishPrompt`   | str            | "请根据引文润色之后再返回" | 润色提示词      |
| `dialogueConfig` | DialogueConfig | -                          | 对话配置        |


**LLMModel（大语言模型配置）**

| 参数          | 类型  | 默认值       | 说明                      |
| ------------- | ----- | ------------ | ------------------------- |
| `modelId`     | str   | "spark-v3.5" | 模型 ID                   |
| `maxTokens`   | int   | 2000         | 最大 token 数             |
| `temperature` | float | 0.7          | 温度参数（0.0-2.0）       |
| `topP`        | float | 0.9          | Top-P 采样参数（0.0-1.0） |
| `extraConfig` | dict  | {}           | 额外配置                  |


**TTSConfig（语音合成配置）**

| 参数          | 类型 | 默认值                              | 说明                                |
| ------------- | ---- | ----------------------------------- | ----------------------------------- |
| `enable`      | bool | False                               | 是否启用 TTS                        |
| `textFilters` | list | ["filter_markdown", "filter_emoji"] | 文本过滤器列表                      |
| `voices`      | dict | {}                                  | 语音配置字典（语言 -> VoiceConfig） |


**VoiceConfig（语音配置）**

| 参数          | 类型        | 默认值 | 说明         |
| ------------- | ----------- | ------ | ------------ |
| `voiceId`     | str         | "4"    | 发音人 ID    |
| `speed`       | int         | 5      | 语速（1-9）  |
| `pitch`       | int         | 5      | 音调（1-9）  |
| `volume`      | int         | 5      | 音量（1-9）  |
| `audioConfig` | AudioConfig | None   | 音频输出配置 |


#### 完整配置示例
```python
# 使用字典配置
config = {
    "mode": "full_duplex",
    "simplifiedResponse": True,
    "multiTurnEnabled": True,
    "stt": {
        "enable": True,
        "language": "zh",
        "audioConfig": {
            "audioEncoding": "raw",
            "format": "plain",
            "sampleRate": 16000,
            "bitDepth": 16,
            "channels": 1
        },
        "vad": {
            "enable": True,
            "minSpeechDuration": 50,
            "minSilenceDuration": 600,
            "activationThreshold": 0.5
        },
        "turnDetection": {
            "enable": True,
            "minEndpointingDelay": 500,
            "maxEndpointingDelay": 3000
        },
        "interrupt": {
            "enable": True
        }
    },
    "nlu": {
        "enable": True,
        "streamingFlushInterval": 100,
        "tools": {
            "model": {
                "modelId": "spark-v3.5",
                "maxTokens": 2000,
                "temperature": 0.7,
                "topP": 0.9
            }
        }
    },
    "tts": {
        "enable": True,
        "textFilters": ["filter_markdown", "filter_emoji"],
        "voices": {
            "zh": {
                "voiceId": "4",
                "speed": 5,
                "pitch": 5,
                "volume": 5,
                "audioConfig": {
                    "audioEncoding": "raw",
                    "sampleRate": 24000,
                    "bitDepth": 16,
                    "channels": 1
                }
            }
        }
    }
}

await client.set_config(config)
```

---

## API 参考
### 连接管理
#### `async connect() -> None`
建立 WebSocket 连接并等待会话创建。

**示例:**

```python
await client.connect()
print("连接成功")
```

#### `async disconnect() -> None`
关闭 WebSocket 连接。

**示例:**

```python
await client.disconnect()
```

#### `async reconnect() -> None`
手动重连到服务器。

**示例:**

```python
await client.reconnect()
```

#### `is_connected() -> bool`
检查当前是否已连接。

**返回值:**

+ `True`: 已连接
+ `False`: 未连接

**示例:**

```python
if client.is_connected():
    await client.send_text("Hello")
```

#### `get_connection_state() -> ConnectionState`
获取当前连接状态。

**返回值:**

+ `ConnectionState.DISCONNECTED`: 未连接
+ `ConnectionState.CONNECTING`: 连接中
+ `ConnectionState.CONNECTED`: 已连接
+ `ConnectionState.RECONNECTING`: 重连中
+ `ConnectionState.CLOSED`: 已关闭

**示例:**

```python
state = client.get_connection_state()
print(f"当前状态: {state}")

#### `get_connection_info() -> ConnectionInfo`

获取详细的连接信息。

**返回值:**
- `ConnectionInfo` 对象，包含：
  - `state`: 连接状态
  - `sid`: 会话 ID
  - `connected_at`: 连接时间戳
  - `reconnect_attempts`: 重连次数
  - `last_error`: 最后一次错误

**示例:**

```python
info = client.get_connection_info()
print(f"会话ID: {info.sid}")
print(f"重连次数: {info.reconnect_attempts}")
```

### 配置管理
#### `async set_config(config: dict | SessionConfig) -> None`
设置会话配置。

**参数:**

+ `config`: 会话配置对象（字典或 SessionConfig 实例）

**示例:**

```python
config = {
    "mode": "full_duplex",
    "stt": {"enable": True},
    "nlu": {"enable": True},
    "tts": {"enable": True}
}

await client.set_config(config)
```

#### `get_config() -> SessionConfig | None`
获取当前会话配置。

**返回值:**

+ 当前配置对象，如果未设置则返回 `None`

**示例:**

```python
current_config = client.get_config()
if current_config:
    print(f"当前模式: {current_config.mode}")
```

### 消息发送
#### `async begin_send() -> None`
生成新的对话 ID（CID），开始新一轮对话。

**示例:**

```python
await client.begin_send()
```

#### `async cancel() -> None`
取消当前对话。

**示例:**

```python
await client.cancel()
```

#### `async send_text(text: str) -> None`
发送文本消息（自动调用 begin_send）。

**参数:**

+ `text`: 文本内容

**示例:**

```python
await client.send_text("你好，世界！")
```

#### `async send_text_stream(text: str, is_end: bool) -> None`
以流式方式发送文本。

**参数:**

+ `text`: 文本内容
+ `is_end`: 是否为最后一个分片

**示例:**

```python
await client.begin_send()
await client.send_text_stream("这是第一部分", False)
await client.send_text_stream("这是第二部分", False)
await client.send_text_stream("这是最后一部分", True)
```

#### `async send_audio(audio_data: bytes) -> None`
发送音频数据（单帧，自动调用 begin_send）。

**参数:**

+ `audio_data`: 音频字节数组

**示例:**

```python
audio_data = b'\x00\x01\x02...'
await client.send_audio(audio_data)
```

#### `async send_audio_stream(audio_data: bytes, is_end: bool) -> None`
以流式方式发送音频。

**参数:**

+ `audio_data`: 音频字节数组
+ `is_end`: 是否为最后一帧

**示例:**

```python
await client.begin_send()

# 持续发送音频流
for chunk in audio_chunks:
    await client.send_audio_stream(chunk, False)

# 发送最后一帧
await client.send_audio_stream(last_chunk, True)
```

#### `async send_image(image_data: str, extend: dict | None = None) -> None`
发送图片（自动调用 begin_send）。

**参数:**

+ `image_data`: Base64 编码的图片数据或图片 URL
+ `extend`: 扩展信息（可选）

**示例:**

```python
base64_image = "data:image/png;base64,iVBORw0KGgo..."
await client.send_image(base64_image, {"format": "png"})
```

#### `async send_msgs(items: list) -> None`
发送多模态消息（自动调用 begin_send）。

**参数:**

+ `items`: 消息项列表（TextItem, ImageItem, AudioItem）

**示例:**

```python
from aichain_sdk.events import TextItem, ImageItem

items = [
    TextItem(data="请看这张图片"),
    ImageItem(data="base64-image-data", extend={"format": "jpg"}),
    TextItem(data="这是什么？")
]
await client.send_msgs(items)
```

### 事件监听
#### `on(event: str) -> Callable`
添加事件监听器（装饰器方式）。

**参数:**

+ `event`: 事件名称

**示例:**

```python
@client.on("nlu.answer")
def on_answer(cid: str, result, is_last: bool):
    print(result.answer, end="", flush=True)
    if is_last:
        print()
```

#### `off(event: str, listener: Callable | None = None) -> None`
移除事件监听器。

**参数:**

+ `event`: 事件名称
+ `listener`: 要移除的监听器，如果为 `None` 则移除该事件的所有监听器

**示例:**

```python
def my_listener(cid, result, is_last):
    print(result.answer)

client.on("nlu.answer")(my_listener)
# 移除特定监听器
client.off("nlu.answer", my_listener)
# 移除所有监听器
client.off("nlu.answer")
```

#### `remove_all_listeners(event: str | None = None) -> None`
移除所有事件监听器。

**参数:**

+ `event`: 事件名称，如果为 `None` 则移除所有事件的所有监听器

**示例:**

```python
# 移除特定事件的所有监听器
client.remove_all_listeners("nlu.answer")
# 移除所有监听器
client.remove_all_listeners()
```

---

## 事件系统
SDK 提供了完整的事件系统，所有事件回调都在异步上下文中执行。

### 连接事件
#### `connecting`
连接开始时触发。

**回调参数:** 无

**示例:**

```python
@client.on("connecting")
def on_connecting():
    print("开始连接...")
```

#### `session.created`
会话创建成功时触发。

**回调参数:**

+ `sid` (str): 会话 ID

**示例:**

```python
@client.on("session.created")
def on_session_created(sid: str):
    print(f"会话已创建: {sid}")
```

#### `session.configed`
会话配置成功时触发。

**回调参数:**

+ `sid` (str): 会话 ID
+ `config` (SessionConfig): 配置对象

**示例:**

```python
@client.on("session.configed")
def on_session_configed(sid: str, config):
    print(f"会话已配置: {sid}")
```

#### `session.error`
会话错误时触发。

**回调参数:**

+ `error` (ErrorMessage): 错误对象

**示例:**

```python
@client.on("session.error")
def on_session_error(error):
    print(f"会话错误: {error.message} (code: {error.code})")
```

#### `reconnecting`
重连开始时触发。

**回调参数:**

+ `attempt` (int): 当前重连次数
+ `max_attempts` (int): 最大重连次数

**示例:**

```python
@client.on("reconnecting")
def on_reconnecting(attempt: int, max_attempts: int):
    print(f"重连中: {attempt}/{max_attempts}")

#### `close`

连接关闭时触发。

**回调参数:**
- `code` (int): 关闭代码
- `reason` (str): 关闭原因

**示例:**

```python
@client.on("close")
def on_close(code: int, reason: str):
    print(f"连接已关闭: {code} - {reason}")
```

#### `error`
WebSocket 错误时触发。

**回调参数:**

+ `code` (int): 错误代码
+ `message` (str): 错误消息

**示例:**

```python
@client.on("error")
def on_error(code: int, message: str):
    print(f"错误: {code} - {message}")
```

#### `pong`
收到心跳响应时触发。

**回调参数:** 无

**示例:**

```python
@client.on("pong")
def on_pong():
    print("心跳正常")
```

### STT 事件
#### `stt.result`
语音识别结果。

**回调参数:**

+ `cid` (str): 对话 ID
+ `result` (STTAnswerResult): 识别结果
+ `is_last` (bool): 是否为最后一个结果

**STTAnswerResult 字段:**

+ `text`: 识别的文本
+ `action`: 动作类型（"append", "replace", "clear"）
+ `position`: 替换位置（如果 action 为 "replace"）
+ `index`: 结果索引

**示例:**

```python
@client.on("stt.result")
def on_stt_result(cid: str, result, is_last: bool):
    if result.action == "append":
        print(f"追加文本: {result.text}")
    elif result.action == "replace":
        print(f"替换文本: {result.text}")
    elif result.action == "clear":
        print("清除文本")

    if is_last:
        print("识别完成")
```

### NLU 事件
#### `nlu.answer`
NLU 回答结果。

**回调参数:**

+ `cid` (str): 对话 ID
+ `result` (NLUAnswerResult): 回答结果
+ `is_last` (bool): 是否为最后一个分片

**NLUAnswerResult 字段:**

+ `answer`: 回答文本
+ `index`: 分片索引
+ `answerSource`: 回答来源（"llm", "rag", "faq" 等）

**示例:**

```python
@client.on("nlu.answer")
def on_nlu_answer(cid: str, result, is_last: bool):
    print(result.answer, end="", flush=True)  # 流式输出

    if is_last:
        print(f"\n回答完成，来源: {result.answerSource}")
```

#### `nlu.tool_selection`
工具选择事件。

**回调参数:**

+ `cid` (str): 对话 ID
+ `result` (NLUToolSelectionResult): 工具选择结果

**NLUToolSelectionResult 字段:**

+ `tool`: 工具名称
+ `toolArgs`: 工具参数
+ `toolSelectedDuration`: 选择耗时（毫秒）

**示例:**

```python
@client.on("nlu.tool_selection")
def on_tool_selection(cid: str, result):
    print(f"选择工具: {result.tool}")
    print(f"参数: {result.toolArgs}")
```

#### `nlu.tool_execution`
工具执行结果。

**回调参数:**

+ `cid` (str): 对话 ID
+ `result` (NLUToolExecutionResult): 执行结果

**NLUToolExecutionResult 字段:**

+ `tool`: 工具名称
+ `result`: 执行结果
+ `executionDuration`: 执行耗时（毫秒）

**示例:**

```python
@client.on("nlu.tool_execution")
def on_tool_execution(cid: str, result):
    print(f"工具 {result.tool} 执行完成")
    print(f"结果: {result.result}")
    print(f"耗时: {result.executionDuration}ms")

#### `nlu.rag_retrieval`

RAG 检索结果。

**回调参数:**
- `cid` (str): 对话 ID
- `result` (NLURagRetrievalResult): 检索结果

**NLURagRetrievalResult 字段:**
- `docSource`: 文档来源列表
- `retrievalDuration`: 检索耗时（毫秒）

**DocSource 字段:**
- `docId`: 文档 ID
- `title`: 文档标题
- `score`: 相似度分数
- `content`: 文档内容

**示例:**

```python
@client.on("nlu.rag_retrieval")
def on_rag_retrieval(cid: str, result):
    print(f"检索到 {len(result.docSource)} 个文档")
    for doc in result.docSource:
        print(f"文档: {doc.title}, 分数: {doc.score}")
```

#### `nlu.trace`
NLU 追踪信息。

**回调参数:**

+ `cid` (str): 对话 ID
+ `result` (NLUTraceResult): 追踪信息

**NLUTraceResult 字段:**

+ `nluTimeConsuming`: NLU 总耗时（毫秒）
+ `extend`: 扩展信息
+ `otherParam`: 其他参数

**示例:**

```python
@client.on("nlu.trace")
def on_nlu_trace(cid: str, result):
    print(f"NLU 耗时: {result.nluTimeConsuming}ms")
```

### TTS 事件
#### `tts.audio`
TTS 音频数据。

**回调参数:**

+ `cid` (str): 对话 ID
+ `audio` (TTSAudioResult): 音频数据
+ `is_last` (bool): 是否为最后一帧

**TTSAudioResult 字段:**

+ `data`: 解码后的音频字节数据
+ `index`: 音频帧索引

**示例:**

```python
import wave

audio_chunks = []

@client.on("tts.audio")
def on_tts_audio(cid: str, audio, is_last: bool):
    audio_chunks.append(audio.data)

    if is_last:
        # 保存为 WAV 文件
        pcm_data = b"".join(audio_chunks)
        with wave.open("output.wav", "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(24000)
            wf.writeframes(pcm_data)
        audio_chunks.clear()
        print("音频已保存")
```

### 欢迎消息事件
#### `welcome.answer`
欢迎消息文本。

**回调参数:**

+ `cid` (str): 对话 ID
+ `result` (WelcomeAnswerResult): 欢迎消息

**WelcomeAnswerResult 字段:**

+ `answer`: 欢迎文本
+ `answerSource`: 来源（通常为 "welcome"）

**示例:**

```python
@client.on("welcome.answer")
def on_welcome_answer(cid: str, result):
    print(f"欢迎消息: {result.answer}")
```

#### `welcome.audio`
欢迎消息音频。

**回调参数:**

+ `cid` (str): 对话 ID
+ `result` (WelcomeAudioResult): 音频数据

**WelcomeAudioResult 字段:**

+ `data`: 解码后的音频字节数据

**示例:**

```python
@client.on("welcome.audio")
def on_welcome_audio(cid: str, result):
    # 播放欢迎音频
    play_audio(result.data)
```

### 对话控制事件
#### `event.interrupted`
对话被打断。

**回调参数:**

+ `cid` (str): 对话 ID

**示例:**

```python
@client.on("event.interrupted")
def on_interrupted(cid: str):
    print(f"对话 {cid} 被打断")
    # 停止音频播放
    audio_player.stop()
```

#### `event.user_speech_started`
用户开始说话。

**回调参数:**

+ `cid` (str): 对话 ID

**示例:**

```python
@client.on("event.user_speech_started")
def on_speech_started(cid: str):
    print("用户开始说话")
    # 显示监听指示器
```

#### `event.user_speech_stopped`
用户停止说话。

**回调参数:**

+ `cid` (str): 对话 ID

**示例:**

```python
@client.on("event.user_speech_stopped")
def on_speech_stopped(cid: str):
    print("用户停止说话")
    # 隐藏监听指示器

#### `event.cid_end`

对话结束。

**回调参数:**
- `cid` (str): 对话 ID
- `stats` (CidEndStats): 统计信息

**CidEndStats 字段:**
- `totalDuration`: 总耗时（毫秒）
- `sttDuration`: STT 耗时（毫秒）
- `nluDuration`: NLU 耗时（毫秒）
- `ttsDuration`: TTS 耗时（毫秒）

**示例:**

```python
@client.on("event.cid_end")
def on_cid_end(cid: str, stats):
    print(f"对话结束")
    print(f"总耗时: {stats.totalDuration}ms")
    print(f"STT: {stats.sttDuration}ms, NLU: {stats.nluDuration}ms, TTS: {stats.ttsDuration}ms")
```

---

## 完整集成流程
### 1. 基础文本对话集成
```python
import asyncio
from aichain_sdk import AIChainClient

async def main():
    # 1. 初始化客户端
    client = AIChainClient(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345",
        log_level="INFO"
    )

    # 2. 注册事件监听
    @client.on("session.created")
    def on_session_created(sid: str):
        print(f"会话创建: {sid}")

    @client.on("nlu.answer")
    def on_answer(cid: str, result, is_last: bool):
        print(result.answer, end="", flush=True)
        if is_last:
            print(f"\n[来源: {result.answerSource}]")

    @client.on("error")
    def on_error(code: int, message: str):
        print(f"错误: {code} - {message}")

    # 3. 连接服务器
    await client.connect()

    # 4. 配置会话
    await client.set_config({
        "multiTurnEnabled": True,
        "nlu": {"enable": True}
    })

    # 5. 发送消息
    questions = ["北京的天气怎么样？", "那上海呢？", "两个城市哪个更适合旅游？"]
    for q in questions:
        print(f"\n[Q] {q}")
        await client.send_text(q)
        await asyncio.sleep(10)  # 等待回答

    # 6. 断开连接
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

### 2. 半双工语音识别集成
```python
import asyncio
import wave
from aichain_sdk import AIChainClient

def read_wav_chunks(path: str, chunk_ms: int = 40, sample_rate: int = 16000):
    """将 WAV 文件按 chunk_ms 毫秒切片"""
    with wave.open(path, "rb") as wf:
        chunk_frames = int(sample_rate * chunk_ms / 1000)
        chunks = []
        while True:
            data = wf.readframes(chunk_frames)
            if not data:
                break
            chunks.append(data)
    return chunks

async def main():
    client = AIChainClient(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345"
    )

    stt_text = []

    @client.on("stt.result")
    def on_stt(cid: str, result, is_last: bool):
        if result.action == "append":
            stt_text.append(result.text)
        elif result.action == "replace":
            if not result.position:
                stt_text.clear()
                stt_text.append(result.text)

        display_text = "".join(stt_text)
        print(f"[STT] {display_text}", end="\r", flush=True)
        if is_last:
            print(f"\n[STT 完成] {display_text}")

    @client.on("event.cid_end")
    def on_cid_end(cid: str, stats):
        print(f"[完成] 总耗时: {stats.totalDuration}ms")

    await client.connect()
    await client.set_config({
        "mode": "half_duplex",
        "stt": {
            "enable": True,
            "language": "zh",
            "audioConfig": {
                "audioEncoding": "raw",
                "sampleRate": 16000,
                "bitDepth": 16,
                "channels": 1
            }
        }
    })

    # 读取并发送音频文件
    wav_path = "test.wav"
    chunks = read_wav_chunks(wav_path)

    await client.begin_send()
    for i, chunk in enumerate(chunks):
        is_end = i == len(chunks) - 1
        await client.send_audio_stream(chunk, is_end)
        await asyncio.sleep(0.04)  # 模拟实时发送

    await asyncio.sleep(5)
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

### 3. 全双工语音对话集成（麦克风输入）
```python
import asyncio
import queue
import sounddevice as sd
import numpy as np
from aichain_sdk import AIChainClient

async def main():
    client = AIChainClient(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345"
    )

    # 音频队列，用于线程安全的跨线程数据传递
    audio_queue = queue.Queue(maxsize=100)
    recording = True

    def audio_callback(indata, frames, time, status):
        """麦克风录音回调"""
        if status:
            print(f"[audio] {status}")
        audio_data = indata.tobytes()
        try:
            audio_queue.put_nowait(audio_data)
        except queue.Full:
            pass

    @client.on("stt.result")
    def on_stt(cid: str, result, is_last: bool):
        print(f"[STT] {result.text}", end="\r", flush=True)
        if is_last:
            print()

    @client.on("nlu.answer")
    def on_nlu(cid: str, result, is_last: bool):
        print(result.answer, end="", flush=True)
        if is_last:
            print()

    @client.on("tts.audio")
    def on_tts(cid: str, audio, is_last: bool):
        # 播放 TTS 音频
        pass

    @client.on("event.interrupted")
    def on_interrupted(cid: str):
        print(f"\n[打断] cid={cid}")

    await client.connect()
    await client.set_config({
        "mode": "full_duplex",
        "stt": {
            "enable": True,
            "language": "zh",
            "audioConfig": {
                "audioEncoding": "raw",
                "sampleRate": 16000,
                "bitDepth": 16,
                "channels": 1
            },
            "vad": {"enable": True},
            "interrupt": {"enable": True}
        },
        "nlu": {"enable": True},
        "tts": {
            "enable": True,
            "voices": {
                "zh": {
                    "voiceId": "4",
                    "audioConfig": {"audioEncoding": "raw"}
                }
            }
        }
    })

    # 启动麦克风录音
    stream = sd.InputStream(
        samplerate=16000,
        channels=1,
        dtype='int16',
        blocksize=int(16000 * 0.04),  # 40ms
        callback=audio_callback
    )
    stream.start()

    print("开始录音，按 Ctrl+C 结束...")

    await client.begin_send()

    # 从队列读取音频并发送
    loop = asyncio.get_running_loop()
    try:
        while recording:
            try:
                audio_data = await loop.run_in_executor(
                    None, audio_queue.get_nowait
                )
                await client.send_audio_stream(audio_data, False)
            except queue.Empty:
                await asyncio.sleep(0.01)
    except KeyboardInterrupt:
        recording = False
    finally:
        stream.stop()
        stream.close()
        await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 最佳实践
### 1. 异步编程最佳实践
```python
import asyncio
from aichain_sdk import AIChainClient

# 使用 async with 管理客户端生命周期
class AIChainClientManager:
    def __init__(self, **kwargs):
        self.client = AIChainClient(**kwargs)

    async def __aenter__(self):
        await self.client.connect()
        return self.client

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.disconnect()

# 使用示例
async def main():
    async with AIChainClientManager(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345"
    ) as client:
        await client.set_config({"nlu": {"enable": True}})
        await client.send_text("你好")
        await asyncio.sleep(5)
```

### 2. 错误处理和重试
```python
import asyncio
from aichain_sdk import AIChainClient

async def connect_with_retry(client, max_retries=3):
    """带重试的连接"""
    for attempt in range(max_retries):
        try:
            await client.connect()
            print("连接成功")
            return True
        except Exception as e:
            print(f"连接失败 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)  # 指数退避
    return False

async def main():
    client = AIChainClient(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345"
    )

    if await connect_with_retry(client):
        # 继续执行
        pass
```

### 3. 日志管理
```python
import logging
from aichain_sdk import AIChainClient

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
    handlers=[
        logging.FileHandler('aichain.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

client = AIChainClient(
    app_id="your-app-id",
    app_key="your-app-key",
    host="your-host",
    sn="device-12345",
    log_level="DEBUG",
    log_file="aichain_sdk.log"
)
```

### 4. 内存管理
```python
import asyncio
from collections import deque

class AudioBufferPool:
    """音频缓冲区对象池"""
    def __init__(self, buffer_size=4096, max_pool_size=10):
        self.buffer_size = buffer_size
        self.pool = deque(maxlen=max_pool_size)

    def get_buffer(self):
        """获取缓冲区"""
        if self.pool:
            return self.pool.pop()
        return bytearray(self.buffer_size)

    def return_buffer(self, buffer):
        """归还缓冲区"""
        if len(self.pool) < self.pool.maxlen:
            self.pool.append(buffer)

# 使用示例
buffer_pool = AudioBufferPool()

async def process_audio():
    buffer = buffer_pool.get_buffer()
    try:
        # 使用缓冲区
        pass
    finally:
        buffer_pool.return_buffer(buffer)
```

### 5. 并发任务管理
```python
import asyncio
from aichain_sdk import AIChainClient

async def handle_multiple_conversations():
    """处理多个并发对话"""
    client = AIChainClient(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345"
    )

    await client.connect()
    await client.set_config({"nlu": {"enable": True}})

    # 并发发送多个问题
    questions = ["问题1", "问题2", "问题3"]
    tasks = []

    for q in questions:
        async def send_question(question):
            await client.send_text(question)
            await asyncio.sleep(5)

        tasks.append(send_question(q))

    # 等待所有任务完成
    await asyncio.gather(*tasks)
    await client.disconnect()
```

### 6. 优雅关闭
```python
import asyncio
import signal
from aichain_sdk import AIChainClient

async def main():
    client = AIChainClient(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345"
    )

    # 设置信号处理
    stop_event = asyncio.Event()

    def signal_handler():
        print("\n收到退出信号，正在关闭...")
        stop_event.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, signal_handler)
        except NotImplementedError:
            # Windows 不支持 add_signal_handler
            pass

    await client.connect()
    await client.set_config({"nlu": {"enable": True}})

    try:
        # 主循环
        while not stop_event.is_set():
            await asyncio.sleep(1)
    finally:
        # 优雅关闭
        await client.disconnect()
        print("已断开连接")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 错误处理
### 错误码列表
| 错误码 | 说明               | 处理建议                 |
| ------ | ------------------ | ------------------------ |
| 10001  | 未连接             | 检查连接状态，重新连接   |
| 10010  | WebSocket 连接失败 | 检查网络，检查服务器地址 |
| 10011  | 认证失败           | 检查 appId 和 appKey     |
| 10012  | 会话创建失败       | 重试连接                 |
| 10013  | 配置失败           | 检查配置参数             |
| 10020  | STT 错误           | 检查音频格式和配置       |
| 10021  | NLU 错误           | 检查输入内容             |
| 10022  | TTS 错误           | 检查 TTS 配置            |
| 10030  | 超时               | 检查网络，重试           |
| 10040  | 服务器内部错误     | 联系技术支持             |


### 错误处理示例
```python
import asyncio
from aichain_sdk import AIChainClient
from aichain_sdk.errors import AIChainError

async def main():
    client = AIChainClient(
        app_id="your-app-id",
        app_key="your-app-key",
        host="your-host",
        sn="device-12345"
    )

    @client.on("error")
    def on_error(code: int, message: str):
        if code == 10001:
            # 未连接
            print("连接已断开，尝试重连...")
            asyncio.create_task(client.reconnect())
        elif code == 10010:
            # WebSocket 连接失败
            print("网络连接失败，请检查网络设置")
        elif code == 10011:
            # 认证失败
            print("认证失败，请检查应用凭证")
        elif code in (10020, 10021, 10022):
            # 功能错误
            print("服务暂时不可用，请稍后重试")
        elif code == 10030:
            # 超时
            print("请求超时，请重试")
        else:
            # 其他错误
            print(f"发生错误: {message}")

    try:
        await client.connect()
        await client.set_config({"nlu": {"enable": True}})
        await client.send_text("你好")
        await asyncio.sleep(5)
    except Exception as e:
        print(f"异常: {e}")
    finally:
        await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 常见问题
### Q1: 如何处理音频格式转换？
**A:** SDK 接受 PCM 格式的音频数据。如果你的音频是其他格式，需要先转换：

```python
import wave
import numpy as np

def convert_to_pcm(input_file: str) -> bytes:
    """将音频文件转换为 PCM 格式"""
    with wave.open(input_file, "rb") as wf:
        # 读取音频参数
        channels = wf.getnchannels()
        sample_width = wf.getsampwidth()
        framerate = wf.getframerate()

        # 读取所有帧
        frames = wf.readframes(wf.getnframes())

        # 如果需要重采样到 16kHz
        if framerate != 16000:
            # 使用 scipy 或 librosa 进行重采样
            pass

        return frames
```

### Q2: 如何实现语音打断？
**A:** 启用 interrupt 配置，并监听 `event.interrupted` 事件：

```python
config = {
    "stt": {
        "interrupt": {"enable": True}
    }
}

@client.on("event.interrupted")
def on_interrupted(cid: str):
    # 停止当前播放
    audio_player.stop()
    # 开始新的对话
    asyncio.create_task(client.begin_send())
```

### Q3: 如何实现多轮对话？
**A:** 启用 `multiTurnEnabled` 并使用 `begin_send()` 管理对话轮次：

```python
config = {
    "mode": "half_duplex",
    "multiTurnEnabled": True
}

await client.set_config(config)

# 第一轮对话
await client.send_text("今天天气怎么样？")
await asyncio.sleep(10)

# 第二轮对话（上下文保持）
await client.send_text("明天呢？")
```

### Q4: 如何优化内存使用？
**A:** 使用对象池和及时清理资源：

```python
from collections import deque

class AudioBufferPool:
    def __init__(self, buffer_size=4096, max_pool_size=10):
        self.buffer_size = buffer_size
        self.pool = deque(maxlen=max_pool_size)

    def get_buffer(self):
        return self.pool.pop() if self.pool else bytearray(self.buffer_size)

    def return_buffer(self, buffer):
        if len(self.pool) < self.pool.maxlen:
            self.pool.append(buffer)

# 使用示例
buffer_pool = AudioBufferPool()

async def process_audio():
    buffer = buffer_pool.get_buffer()
    try:
        # 使用缓冲区
        pass
    finally:
        buffer_pool.return_buffer(buffer)
```

### Q5: 如何处理网络切换？
**A:** 监听连接状态并自动重连：

```python
@client.on("close")
def on_close(code: int, reason: str):
    print(f"连接关闭: {code} - {reason}")
    if client.auto_reconnect:
        print("自动重连中...")

@client.on("reconnecting")
def on_reconnecting(attempt: int, max_attempts: int):
    print(f"重连尝试: {attempt}/{max_attempts}")
```

### Q6: 如何实现流式文本输入？
**A:** 使用 `send_text_stream()` 方法：

```python
await client.begin_send()

text_chunks = ["这是", "一段", "流式", "文本"]
for i, chunk in enumerate(text_chunks):
    is_last = i == len(text_chunks) - 1
    await client.send_text_stream(chunk, is_last)
```

### Q7: 如何调试 WebSocket 连接？
**A:** 启用 DEBUG 日志级别：

```python
client = AIChainClient(
    app_id="your-app-id",
    app_key="your-app-key",
    host="your-host",
    sn="your-sn",
    log_level="DEBUG",  # 启用详细日志
    log_file="debug.log"
)

# 查看日志文件
# tail -f debug.log
```

### Q8: 如何处理大文件上传（如图片）？
**A:** 将图片转换为 Base64 并发送：

```python
import base64

def image_to_base64(image_path: str) -> str:
    """将图片文件转换为 Base64"""
    with open(image_path, "rb") as f:
        image_data = f.read()
    return base64.b64encode(image_data).decode("utf-8")

# 发送图片
image_base64 = image_to_base64("photo.jpg")
await client.send_image(
    f"data:image/jpeg;base64,{image_base64}",
    {"format": "jpeg"}
)
```

### Q9: 如何在 Windows 上使用信号处理？
**A:** Windows 不支持 `add_signal_handler`，使用替代方案：

```python
import asyncio
import signal
import sys

async def main():
    client = AIChainClient(...)
    stop_event = asyncio.Event()

    def signal_handler(sig, frame):
        print("\n收到退出信号")
        stop_event.set()

    # Windows 兼容的信号处理
    signal.signal(signal.SIGINT, signal_handler)
    if sys.platform != "win32":
        signal.signal(signal.SIGTERM, signal_handler)

    await client.connect()

    try:
        while not stop_event.is_set():
            await asyncio.sleep(1)
    finally:
        await client.disconnect()
```

### Q10: 如何实现音频实时播放？
**A:** 使用 sounddevice 进行实时播放：

```python
import queue
import sounddevice as sd
import numpy as np

tts_queue = queue.Queue(maxsize=100)

def tts_play_callback(outdata, frames, time, status):
    """TTS 播放回调"""
    try:
        audio_data = tts_queue.get_nowait()
        audio_np = np.frombuffer(audio_data, dtype=np.int16)
        if len(audio_np) < frames:
            outdata[:len(audio_np), 0] = audio_np
            outdata[len(audio_np):, 0] = 0
        else:
            outdata[:, 0] = audio_np[:frames]
    except queue.Empty:
        outdata[:] = 0

# 启动播放流
tts_stream = sd.OutputStream(
    samplerate=24000,
    channels=1,
    dtype='int16',
    blocksize=int(24000 * 0.04),
    callback=tts_play_callback
)
tts_stream.start()

@client.on("tts.audio")
def on_tts(cid: str, audio, is_last: bool):
    try:
        tts_queue.put_nowait(audio.data)
    except queue.Full:
        pass
```

---

## 附录
### A. 完整类型定义
SDK 使用 Pydantic 提供完整的类型定义，支持 IDE 自动补全和类型检查。

```python
from aichain_sdk.config import (
    SessionConfig,
    STTConfig,
    NLUConfig,
    TTSConfig,
    AudioConfig,
    VadConfig,
    TurnDetectionConfig,
    InterruptConfig,
    LLMModel,
    ToolsConfig,
    RagConfig,
    VoiceConfig
)

from aichain_sdk.events import (
    STTAnswerResult,
    NLUAnswerResult,
    NLUToolSelectionResult,
    NLUToolExecutionResult,
    NLURagRetrievalResult,
    NLUTraceResult,
    TTSAudioResult,
    WelcomeAnswerResult,
    WelcomeAudioResult,
    CidEndStats,
    TextItem,
    ImageItem,
    AudioItem
)

from aichain_sdk.types import (
    ConnectionState,
    ConnectionInfo
)
```

### B. 环境变量配置
可以使用环境变量配置客户端：

```python
import os
from aichain_sdk import AIChainClient

client = AIChainClient(
    app_id=os.getenv("AICHAIN_APP_ID"),
    app_key=os.getenv("AICHAIN_APP_KEY"),
    host=os.getenv("AICHAIN_HOST"),
    sn=os.getenv("AICHAIN_SN"),
    log_level=os.getenv("AICHAIN_LOG_LEVEL", "INFO")
)
```

### C. 性能优化建议
1. **使用连接池**: 对于高并发场景，考虑使用连接池管理多个客户端实例
2. **音频缓冲**: 使用适当的缓冲区大小（推荐 40ms）
3. **异步处理**: 充分利用 asyncio 的并发能力
4. **内存管理**: 使用对象池减少内存分配
5. **日志级别**: 生产环境使用 INFO 或 WARN 级别

### D. 相关资源
+ **协议文档**: 参考项目根目录的 `交互协议设计文档.md`
+ **示例代码**: 查看 `examples/` 目录下的完整示例
+ **API 文档**: 查看源码中的 docstring 注释
+ **问题反馈**: 提交 Issue 到项目仓库

---

**文档版本**: v1.0.0  
**最后更新**: 2026-03-23  
**SDK 版本**: 1.0.0+

# AIChain Android SDK 集成指南
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
AIChain Android SDK 是一个基于 WebSocket 的实时通信 SDK，支持语音识别（STT）、自然语言理解（NLU）和语音合成（TTS）功能。本 SDK 提供了完整的 Android 原生支持，兼容 Java 和 Kotlin。

### 主要特性
+ ✅ WebSocket 实时双向通信
+ ✅ 自动重连机制
+ ✅ 多模态消息支持（文本、语音、图片）
+ ✅ 流式数据传输
+ ✅ 完整的事件系统
+ ✅ 线程安全设计
+ ✅ Java/Kotlin 双语言支持

### 系统要求
+ **最低 SDK 版本**: Android 5.0 (API Level 21)
+ **目标 SDK 版本**: Android 14 (API Level 34)
+ **编程语言**: Java 8+ / Kotlin 1.8+
+ **依赖库**: OkHttp 4.x, Moshi 1.x

---

## 快速开始
### 1. 添加依赖
在项目的 `build.gradle` 文件中添加：

```groovy
dependencies {
    implementation 'asia.aijh:dispatch-sdk:1.0.1'
}
```

### 2. 添加权限
在 `AndroidManifest.xml` 中添加必要的权限：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 3. 初始化客户端
#### Kotlin 示例
```kotlin
val client = AIChainClient.Builder()
    .appId("your-app-id")
    .appKey("your-app-key")
    .host("your-host")
    .sn("your-device-sn")
    .build()
```

#### Java 示例
```java
AIChainClient client = new AIChainClient.Builder()
    .appId("your-app-id")
    .appKey("your-app-key")
    .host("your-host")
    .sn("your-device-sn")
    .build();
```

### 4. 连接服务器
#### Kotlin 示例
```kotlin
client.connect(object : ConnectionCallback {
    override fun onSuccess() {
        println("连接成功")
    }
    
    override fun onError(error: AIChainError) {
        println("连接失败: ${error.message}")
    }
})
```

#### Java 示例
```java
client.connect(new ConnectionCallback() {
    @Override
    public void onSuccess() {
        System.out.println("连接成功");
    }
    
    @Override
    public void onError(AIChainError error) {
        System.out.println("连接失败: " + error.getMessage());
    }
});
```

---

## 详细配置
### Builder 配置参数
`AIChainClient.Builder` 提供了丰富的配置选项：

| 参数                   | 类型     | 必填 | 默认值      | 说明                                    |
| ---------------------- | -------- | ---- | ----------- | --------------------------------------- |
| `appId`                | String   | ✅    | -           | 应用 ID，由平台分配                     |
| `appKey`               | String   | ✅    | -           | 应用密钥，用于身份验证                  |
| `host`                 | String   | ✅    | -           | 服务器地址（支持 ws:// 或 wss:// 前缀） |
| `sn`                   | String   | ✅    | -           | 设备序列号，唯一标识设备                |
| `scene`                | String   | ❌    | "main"      | 场景名称，用于多场景应用                |
| `channel`              | String   | ❌    | "real_time" | 通道名称                                |
| `secure`               | Boolean  | ❌    | false       | 是否使用安全连接（wss://）              |
| `autoReconnect`        | Boolean  | ❌    | true        | 是否启用自动重连                        |
| `reconnectInterval`    | Long     | ❌    | 1000        | 初始重连间隔（毫秒）                    |
| `maxReconnectInterval` | Long     | ❌    | 30000       | 最大重连间隔（毫秒）                    |
| `maxReconnectAttempts` | Int      | ❌    | 10          | 最大重连次数                            |
| `logLevel`             | LogLevel | ❌    | INFO        | 日志级别（DEBUG/INFO/WARN/ERROR）       |


#### 完整配置示例
```kotlin
val client = AIChainClient.Builder()
    .appId("your-app-id")
    .appKey("your-app-key")
    .host("wss://your-host.com")
    .sn("device-12345")
    .scene("main")
    .channel("real_time")
    .secure(true)
    .autoReconnect(true)
    .reconnectInterval(2000)
    .maxReconnectInterval(60000)
    .maxReconnectAttempts(20)
    .logLevel(LogLevel.DEBUG)
    .build()
```

### 会话配置（SessionConfig）
连接成功后，需要配置会话参数：

#### SessionConfig 参数
| 参数                 | 类型             | 说明                                                            |
| -------------------- | ---------------- | --------------------------------------------------------------- |
| `mode`               | String           | 工作模式：`"full_duplex"`（全双工）或 `"half_duplex"`（半双工） |
| `simplifiedResponse` | Boolean          | 是否简化响应内容                                                |
| `multiTurnEnabled`   | Boolean          | 是否启用多轮对话                                                |
| `extraConfig`        | Map<String, Any> | 额外配置参数                                                    |
| `stt`                | STTConfig        | 语音识别配置                                                    |
| `nlu`                | NLUConfig        | 自然语言理解配置                                                |
| `tts`                | TTSConfig        | 语音合成配置                                                    |


#### STTConfig（语音识别配置）
| 参数            | 类型                | 说明                                    |
| --------------- | ------------------- | --------------------------------------- |
| `enable`        | Boolean             | 是否启用 STT                            |
| `sttEngineId`   | String              | STT 引擎 ID                             |
| `language`      | String              | 语言代码（如 "zh-CN", "en-US", "auto"） |
| `audioConfig`   | AudioConfig         | 音频配置                                |
| `hotWords`      | List                | 热词列表                                |
| `vad`           | VadConfig           | 语音活动检测配置                        |
| `turnDetection` | TurnDetectionConfig | 轮次检测配置                            |
| `interrupt`     | InterruptConfig     | 打断配置                                |


#### AudioConfig（音频配置）
| 参数            | 类型   | 说明                             |
| --------------- | ------ | -------------------------------- |
| `audioEncoding` | String | 音频编码格式（如 "pcm", "opus"） |
| `format`        | String | 音频格式                         |
| `sampleRate`    | Int    | 采样率（如 16000, 48000）        |
| `bitDepth`      | Int    | 位深度（如 16）                  |
| `channels`      | Int    | 声道数（1=单声道, 2=立体声）     |


#### VadConfig（语音活动检测配置）
| 参数                  | 类型    | 说明                     |
| --------------------- | ------- | ------------------------ |
| `enable`              | Boolean | 是否启用 VAD             |
| `minSpeechDuration`   | Int     | 最小语音持续时间（毫秒） |
| `minSilenceDuration`  | Int     | 最小静音持续时间（毫秒） |
| `activationThreshold` | Float   | 激活阈值（0.0-1.0）      |


#### TurnDetectionConfig（轮次检测配置）
| 参数                  | 类型    | 说明                 |
| --------------------- | ------- | -------------------- |
| `enable`              | Boolean | 是否启用轮次检测     |
| `minEndpointingDelay` | Int     | 最小端点延迟（毫秒） |
| `maxEndpointingDelay` | Int     | 最大端点延迟（毫秒） |


#### InterruptConfig（打断配置）
| 参数     | 类型    | 说明             |
| -------- | ------- | ---------------- |
| `enable` | Boolean | 是否允许用户打断 |


#### NLUConfig（自然语言理解配置）
| 参数                     | 类型        | 说明                     |
| ------------------------ | ----------- | ------------------------ |
| `enable`                 | Boolean     | 是否启用 NLU             |
| `streamingFlushInterval` | Int         | 流式输出刷新间隔（毫秒） |
| `tools`                  | ToolsConfig | 工具调用配置             |
| `rag`                    | RagConfig   | RAG 检索配置             |


#### ToolsConfig（工具配置）
| 参数             | 类型   | 说明                                |
| ---------------- | ------ | ----------------------------------- |
| `models`         | List   | LLM 模型列表                        |
| `modelId`        | String | 引用的模型 ID（需在 models 中定义） |
| `toolCallPrompt` | String | 工具调用提示词                      |


#### RagConfig（RAG 配置）
| 参数             | 类型           | 说明                                |
| ---------------- | -------------- | ----------------------------------- |
| `models`         | List           | LLM 模型列表                        |
| `modelId`        | String         | 引用的模型 ID（需在 models 中定义） |
| `threshold`      | Float          | 相似度阈值                          |
| `contextLength`  | Int            | 上下文长度                          |
| `topN`           | Int            | 返回前 N 个结果                     |
| `polishPrompt`   | String         | 润色提示词                          |
| `dialogueConfig` | DialogueConfig | 对话配置                            |


#### LLMModel（大语言模型配置）
| 参数          | 类型             | 说明                      |
| ------------- | ---------------- | ------------------------- |
| `modelId`     | String           | 模型 ID                   |
| `maxTokens`   | Int              | 最大 token 数             |
| `temperature` | Float            | 温度参数（0.0-2.0）       |
| `topP`        | Float            | Top-P 采样参数（0.0-1.0） |
| `extraConfig` | Map<String, Any> | 额外配置                  |


#### TTSConfig（语音合成配置）
| 参数          | 类型        | 说明                                 |
| ------------- | ----------- | ------------------------------------ |
| `enable`      | Boolean     | 是否启用 TTS                         |
| `ttsEngineId` | String      | TTS 引擎 ID                          |
| `language`    | String      | 语言代码                             |
| `vcn`         | String      | 发音人标识，默认 "x5yunlingxiaoying" |
| `speed`       | Float       | 语速（0.5-2.0）                      |
| `pitch`       | Float       | 音调（0.5-2.0）                      |
| `volume`      | Float       | 音量（0.0-1.0）                      |
| `textFilters` | List        | 文本过滤器列表                       |
| `audioConfig` | AudioConfig | 音频输出配置                         |


#### 完整配置示例
```kotlin
val config = SessionConfig(
    mode = "full_duplex",
    simplifiedResponse = true,
    multiTurnEnabled = true,
    stt = STTConfig(
        enable = true,
        language = "zh-CN",
        audioConfig = AudioConfig(
            audioEncoding = "pcm",
            sampleRate = 16000,
            bitDepth = 16,
            channels = 1
        ),
        vad = VadConfig(
            enable = true,
            minSpeechDuration = 300,
            minSilenceDuration = 500,
            activationThreshold = 0.5f
        ),
        turnDetection = TurnDetectionConfig(
            enable = true,
            minEndpointingDelay = 500,
            maxEndpointingDelay = 2000
        ),
        interrupt = InterruptConfig(
            enable = true
        )
    ),
    nlu = NLUConfig(
        enable = true,
        streamingFlushInterval = 100,
        tools = ToolsConfig(
            models = listOf(
                LLMModel(
                    modelId = "spark-v3.5",
                    maxTokens = 2000,
                    temperature = 0.7f,
                    topP = 0.9f
                )
            ),
            modelId = "spark-v3.5"
        ),
        rag = RagConfig(
            models = listOf(
                LLMModel(
                    modelId = "gpt-4",
                    maxTokens = 2000,
                    temperature = 0.7f,
                    topP = 0.9f
                )
            ),
            modelId = "gpt-4",
            threshold = 0.75f,
            topN = 5
        )
    ),
    tts = TTSConfig(
        enable = true,
        language = "zh-CN",
        vcn = "x5yunlingxiaoying",
        speed = 1.0f,
        pitch = 1.0f,
        volume = 0.8f,
        audioConfig = AudioConfig(
            audioEncoding = "pcm",
            sampleRate = 24000,
            bitDepth = 16,
            channels = 1
        )
    )
)

client.setConfig(config, object : ConfigCallback {
    override fun onSuccess() {
        println("配置成功")
    }
    
    override fun onError(error: AIChainError) {
        println("配置失败: ${error.message}")
    }
})
```

---

## API 参考
### 连接管理
#### `connect(callback: ConnectionCallback)`
建立 WebSocket 连接并等待会话创建。

**参数:**

+ `callback`: 连接结果回调

**示例:**

```kotlin
client.connect(object : ConnectionCallback {
    override fun onSuccess() {
        // 连接成功
    }
    override fun onError(error: AIChainError) {
        // 连接失败
    }
})
```

#### `disconnect()`
关闭 WebSocket 连接。

**示例:**

```kotlin
client.disconnect()
```

#### `reconnect(callback: ConnectionCallback)`
手动重连到服务器。

**参数:**

+ `callback`: 重连结果回调

**示例:**

```kotlin
client.reconnect(object : ConnectionCallback {
    override fun onSuccess() {
        // 重连成功
    }
    override fun onError(error: AIChainError) {
        // 重连失败
    }
})
```

#### `isConnected(): Boolean`
检查当前是否已连接。

**返回值:**

+ `true`: 已连接
+ `false`: 未连接

**示例:**

```kotlin
if (client.isConnected()) {
    // 执行操作
}
```

#### `getConnectionState(): ConnectionState`
获取当前连接状态。

**返回值:**

+ `DISCONNECTED`: 未连接
+ `CONNECTING`: 连接中
+ `CONNECTED`: 已连接
+ `RECONNECTING`: 重连中
+ `CLOSED`: 已关闭

**示例:**

```kotlin
val state = client.getConnectionState()
when (state) {
    ConnectionState.CONNECTED -> println("已连接")
    ConnectionState.CONNECTING -> println("连接中")
    else -> println("其他状态")
}
```

#### `getConnectionInfo(): ConnectionInfo`
获取详细的连接信息。

**返回值:**

+ `ConnectionInfo` 对象，包含：
    - `state`: 连接状态
    - `sid`: 会话 ID
    - `connectedAt`: 连接时间戳
    - `reconnectAttempts`: 重连次数
    - `lastError`: 最后一次错误

**示例:**

```kotlin
val info = client.getConnectionInfo()
println("会话ID: ${info.sid}")
println("重连次数: ${info.reconnectAttempts}")
```

### 配置管理
#### `setConfig(config: SessionConfig, callback: ConfigCallback)`
设置会话配置。

**参数:**

+ `config`: 会话配置对象
+ `callback`: 配置结果回调

**示例:**

```kotlin
val config = SessionConfig(
    mode = "full_duplex",
    stt = STTConfig(enable = true),
    nlu = NLUConfig(enable = true),
    tts = TTSConfig(enable = true)
)

client.setConfig(config, object : ConfigCallback {
    override fun onSuccess() {
        println("配置成功")
    }
    override fun onError(error: AIChainError) {
        println("配置失败: ${error.message}")
    }
})
```

#### `getConfig(): SessionConfig?`
获取当前会话配置。

**返回值:**

+ 当前配置对象，如果未设置则返回 `null`

**示例:**

```kotlin
val currentConfig = client.getConfig()
println("当前模式: ${currentConfig?.mode}")
```

### 消息发送
#### `beginSend()`
生成新的对话 ID（CID），开始新一轮对话。

**示例:**

```kotlin
client.beginSend()
```

#### `cancel()`
取消当前对话。

**示例:**

```kotlin
client.cancel()
```

#### `sendText(text: String)`
发送文本消息。

**参数:**

+ `text`: 文本内容

**示例:**

```kotlin
client.sendText("你好，世界！")
```

#### `sendTextStream(text: String, isEnd: Boolean)`
以流式方式发送文本。

**参数:**

+ `text`: 文本内容
+ `isEnd`: 是否为最后一个分片

**示例:**

```kotlin
client.sendTextStream("这是第一部分", false)
client.sendTextStream("这是第二部分", false)
client.sendTextStream("这是最后一部分", true)
```

#### `sendAudio(audioData: ByteArray)`
发送音频数据（单帧）。

**参数:**

+ `audioData`: 音频字节数组

**示例:**

```kotlin
val audioData = ByteArray(1024)
// ... 填充音频数据
client.sendAudio(audioData)
```

#### `sendAudioStream(audioData: ByteArray, isEnd: Boolean)`
以流式方式发送音频。

**参数:**

+ `audioData`: 音频字节数组
+ `isEnd`: 是否为最后一帧

**示例:**

```kotlin
// 持续发送音频流
while (recording) {
    val audioChunk = recordAudioChunk()
    client.sendAudioStream(audioChunk, false)
}
// 发送最后一帧
client.sendAudioStream(lastChunk, true)
```

#### `sendImage(imageData: String, extend: Map<String, Any>?)`
发送图片。

**参数:**

+ `imageData`: Base64 编码的图片数据或图片 URL
+ `extend`: 扩展信息（可选）

**示例:**

```kotlin
val base64Image = "data:image/png;base64,iVBORw0KGgo..."
client.sendImage(base64Image, mapOf("format" to "png"))
```

#### `sendMsgs(items: List<MessageItem>)`
发送多模态消息。

**参数:**

+ `items`: 消息项列表

**示例:**

```kotlin
val items = listOf(
    TextItem(data = "请看这张图片"),
    ImageItem(data = "base64-image-data", extend = mapOf("format" to "jpg")),
    TextItem(data = "这是什么？")
)
client.sendMsgs(items)
```

### 事件监听
#### `on(event: String, listener: EventListener)`
添加事件监听器。

**参数:**

+ `event`: 事件名称
+ `listener`: 事件监听器

**示例:**

```kotlin
client.on("nlu.answer") { args ->
    val cid = args[0] as String
    val result = args[1] as NLUAnswerResult
    val last = args[2] as Boolean
    println("答案: ${result.answer}")
}
```

#### `off(event: String, listener: EventListener?)`
移除事件监听器。

**参数:**

+ `event`: 事件名称
+ `listener`: 要移除的监听器，如果为 `null` 则移除该事件的所有监听器

**示例:**

```kotlin
val listener = EventListener { args -> /* ... */ }
client.on("nlu.answer", listener)
// 移除特定监听器
client.off("nlu.answer", listener)
// 移除所有监听器
client.off("nlu.answer", null)
```

#### `removeAllListeners(event: String?)`
移除所有事件监听器。

**参数:**

+ `event`: 事件名称，如果为 `null` 则移除所有事件的所有监听器

**示例:**

```kotlin
// 移除特定事件的所有监听器
client.removeAllListeners("nlu.answer")
// 移除所有监听器
client.removeAllListeners(null)
```

### 工具方法
#### `AIChainClient.getVersion(): String`
获取 SDK 版本号（静态方法）。

**返回值:**

+ SDK 版本字符串

**示例:**

```kotlin
val version = AIChainClient.getVersion()
println("SDK 版本: $version")
```

**Java 示例:**

```java
String version = AIChainClient.getVersion();
System.out.println("SDK 版本: " + version);
```

---

## 事件系统
SDK 提供了完整的事件系统，所有事件回调都在主线程执行。

### 连接事件
#### `connecting`
连接开始时触发。

**回调参数:** 无

**示例:**

```kotlin
client.on("connecting") { args ->
    println("开始连接...")
}
```

#### `session.created`
会话创建成功时触发。

**回调参数:**

+ `args[0]`: `String` - 会话 ID (sid)

**示例:**

```kotlin
client.on("session.created") { args ->
    val sid = args[0] as String
    println("会话已创建: $sid")
}
```

#### `session.configed`
会话配置成功时触发。

**回调参数:**

+ `args[0]`: `String` - 会话 ID (sid)
+ `args[1]`: `SessionConfig?` - 配置对象

**示例:**

```kotlin
client.on("session.configed") { args ->
    val sid = args[0] as String
    val config = args[1] as SessionConfig?
    println("会话已配置: $sid")
}
```

#### `session.error`
会话错误时触发。

**回调参数:**

+ `args[0]`: `AIChainError` - 错误对象

**示例:**

```kotlin
client.on("session.error") { args ->
    val error = args[0] as AIChainError
    println("会话错误: ${error.message} (code: ${error.code})")
}
```

#### `reconnecting`
重连开始时触发。

**回调参数:**

+ `args[0]`: `Int` - 当前重连次数
+ `args[1]`: `Int` - 最大重连次数

**示例:**

```kotlin
client.on("reconnecting") { args ->
    val attempt = args[0] as Int
    val maxAttempts = args[1] as Int
    println("重连中: $attempt/$maxAttempts")
}
```

#### `close`
连接关闭时触发。

**回调参数:**

+ `args[0]`: `Int` - 关闭代码
+ `args[1]`: `String` - 关闭原因

**示例:**

```kotlin
client.on("close") { args ->
    val code = args[0] as Int
    val reason = args[1] as String
    println("连接已关闭: $code - $reason")
}
```

#### `error`
WebSocket 错误时触发。

**回调参数:**

+ `args[0]`: `Int` - 错误代码
+ `args[1]`: `String` - 错误消息

**示例:**

```kotlin
client.on("error") { args ->
    val code = args[0] as Int
    val message = args[1] as String
    println("错误: $code - $message")
}
```

#### `pong`
收到心跳响应时触发。

**回调参数:** 无

**示例:**

```kotlin
client.on("pong") { args ->
    println("心跳正常")
}
```

### STT 事件
#### `stt.result`
语音识别结果。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `STTAnswerResult` - 识别结果
+ `args[2]`: `Boolean` - 是否为最后一个结果

**STTAnswerResult 字段:**

+ `text`: 识别的文本
+ `action`: 动作类型（"append", "replace", "clear"）
+ `position`: 替换位置（如果 action 为 "replace"）
+ `index`: 结果索引

**示例:**

```kotlin
client.on("stt.result") { args ->
    val cid = args[0] as String
    val result = args[1] as STTAnswerResult
    val last = args[2] as Boolean
    
    when (result.action) {
        "append" -> println("追加文本: ${result.text}")
        "replace" -> println("替换文本: ${result.text}")
        "clear" -> println("清除文本")
    }
    
    if (last) {
        println("识别完成")
    }
}
```

### NLU 事件
#### `nlu.answer`
NLU 回答结果。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `NLUAnswerResult` - 回答结果
+ `args[2]`: `Boolean` - 是否为最后一个分片

**NLUAnswerResult 字段:**

+ `answer`: 回答文本
+ `index`: 分片索引
+ `answerSource`: 回答来源（"llm", "rag", "faq" 等）

**示例:**

```kotlin
client.on("nlu.answer") { args ->
    val cid = args[0] as String
    val result = args[1] as NLUAnswerResult
    val last = args[2] as Boolean
    
    print(result.answer)  // 流式输出
    
    if (last) {
        println("\n回答完成，来源: ${result.answerSource}")
    }
}
```

#### `nlu.tool_selection`
工具选择事件。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `NLUToolSelectionResult` - 工具选择结果

**NLUToolSelectionResult 字段:**

+ `tool`: 工具名称
+ `toolArgs`: 工具参数
+ `toolSelectedDuration`: 选择耗时（毫秒）

**示例:**

```kotlin
client.on("nlu.tool_selection") { args ->
    val cid = args[0] as String
    val result = args[1] as NLUToolSelectionResult
    println("选择工具: ${result.tool}")
    println("参数: ${result.toolArgs}")
}
```

#### `nlu.tool_execution`
工具执行结果。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `NLUToolExecutionResult` - 执行结果

**NLUToolExecutionResult 字段:**

+ `tool`: 工具名称
+ `result`: 执行结果
+ `executionDuration`: 执行耗时（毫秒）

**示例:**

```kotlin
client.on("nlu.tool_execution") { args ->
    val cid = args[0] as String
    val result = args[1] as NLUToolExecutionResult
    println("工具 ${result.tool} 执行完成")
    println("结果: ${result.result}")
    println("耗时: ${result.executionDuration}ms")
}
```

#### `nlu.rag_retrieval`
RAG 检索结果。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `NLURAGRetrievalResult` - 检索结果

**NLURAGRetrievalResult 字段:**

+ `docSource`: 文档来源列表
+ `retrievalDuration`: 检索耗时（毫秒）

**DocSource 字段:**

+ `docId`: 文档 ID
+ `title`: 文档标题
+ `score`: 相似度分数
+ `content`: 文档内容

**示例:**

```kotlin
client.on("nlu.rag_retrieval") { args ->
    val cid = args[0] as String
    val result = args[1] as NLURAGRetrievalResult
    
    println("检索到 ${result.docSource.size} 个文档")
    result.docSource.forEach { doc ->
        println("文档: ${doc.title}, 分数: ${doc.score}")
    }
}
```

#### `nlu.trace`
NLU 追踪信息。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `NLUTraceResult` - 追踪信息

**NLUTraceResult 字段:**

+ `nluTimeConsuming`: NLU 总耗时（毫秒）
+ `extend`: 扩展信息
+ `otherParam`: 其他参数

**示例:**

```kotlin
client.on("nlu.trace") { args ->
    val cid = args[0] as String
    val result = args[1] as NLUTraceResult
    println("NLU 耗时: ${result.nluTimeConsuming}ms")
}
```

### TTS 事件
#### `tts.audio`
TTS 音频数据。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `TTSAudioResult` - 音频数据
+ `args[2]`: `Boolean` - 是否为最后一帧

**TTSAudioResult 字段:**

+ `data`: Base64 编码的音频数据
+ `index`: 音频帧索引

**示例:**

```kotlin
client.on("tts.audio") { args ->
    val cid = args[0] as String
    val result = args[1] as TTSAudioResult
    val last = args[2] as Boolean
    
    // 解码并播放音频
    val audioBytes = Base64.decode(result.data, Base64.DEFAULT)
    audioPlayer.play(audioBytes)
    
    if (last) {
        println("音频播放完成")
    }
}
```

### 欢迎消息事件
#### `welcome.answer`
欢迎消息文本。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `WelcomeAnswerResult` - 欢迎消息

**WelcomeAnswerResult 字段:**

+ `answer`: 欢迎文本
+ `answerSource`: 来源（通常为 "welcome"）

**示例:**

```kotlin
client.on("welcome.answer") { args ->
    val cid = args[0] as String
    val result = args[1] as WelcomeAnswerResult
    println("欢迎消息: ${result.answer}")
}
```

#### `welcome.audio`
欢迎消息音频。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `WelcomeAudioResult` - 音频数据

**WelcomeAudioResult 字段:**

+ `data`: Base64 编码的音频数据

**示例:**

```kotlin
client.on("welcome.audio") { args ->
    val cid = args[0] as String
    val result = args[1] as WelcomeAudioResult
    val audioBytes = Base64.decode(result.data, Base64.DEFAULT)
    audioPlayer.play(audioBytes)
}
```

### 对话控制事件
#### `event.interrupted`
对话被打断。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)

**示例:**

```kotlin
client.on("event.interrupted") { args ->
    val cid = args[0] as String
    println("对话 $cid 被打断")
    audioPlayer.stop()
}
```

#### `event.user_speech_started`
用户开始说话。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)

**示例:**

```kotlin
client.on("event.user_speech_started") { args ->
    val cid = args[0] as String
    println("用户开始说话")
    showListeningIndicator()
}
```

#### `event.user_speech_stopped`
用户停止说话。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)

**示例:**

```kotlin
client.on("event.user_speech_stopped") { args ->
    val cid = args[0] as String
    println("用户停止说话")
    hideListeningIndicator()
}
```

#### `event.cid_end`
对话结束。

**回调参数:**

+ `args[0]`: `String` - 对话 ID (cid)
+ `args[1]`: `CidEndStats` - 统计信息

**CidEndStats 字段:**

+ `totalDuration`: 总耗时（毫秒）
+ `sttDuration`: STT 耗时（毫秒）
+ `nluDuration`: NLU 耗时（毫秒）
+ `ttsDuration`: TTS 耗时（毫秒）

**示例:**

```kotlin
client.on("event.cid_end") { args ->
    val cid = args[0] as String
    val stats = args[1] as CidEndStats
    println("对话结束")
    println("总耗时: ${stats.totalDuration}ms")
    println("STT: ${stats.sttDuration}ms, NLU: ${stats.nluDuration}ms, TTS: ${stats.ttsDuration}ms")
}
```

---

## 完整集成流程
### 1. 基础集成流程
```kotlin
class VoiceAssistantActivity : AppCompatActivity() {
    private lateinit var client: AIChainClient
    private var audioRecorder: AudioRecorder? = null
    private var audioPlayer: AudioPlayer? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_voice_assistant)
        
        // 1. 初始化客户端
        initClient()
        
        // 2. 注册事件监听
        registerEventListeners()
        
        // 3. 连接服务器
        connectToServer()
    }
    
    private fun initClient() {
        client = AIChainClient.Builder()
            .appId(BuildConfig.APP_ID)
            .appKey(BuildConfig.APP_KEY)
            .host(BuildConfig.HOST)
            .sn(getDeviceSN())
            .scene("main")
            .autoReconnect(true)
            .logLevel(LogLevel.DEBUG)
            .build()
    }
    
    private fun registerEventListeners() {
        // 连接事件
        client.on("session.created") { args ->
            val sid = args[0] as String
            Log.d(TAG, "会话创建: $sid")
            configureSession()
        }
        
        // STT 结果
        client.on("stt.result") { args ->
            val result = args[1] as STTAnswerResult
            val last = args[2] as Boolean
            updateTranscript(result.text, last)
        }
        
        // NLU 回答
        client.on("nlu.answer") { args ->
            val result = args[1] as NLUAnswerResult
            val last = args[2] as Boolean
            displayAnswer(result.answer, last)
        }
        
        // TTS 音频
        client.on("tts.audio") { args ->
            val result = args[1] as TTSAudioResult
            val last = args[2] as Boolean
            playAudio(result.data, last)
        }
        
        // 用户语音事件
        client.on("event.user_speech_started") { args ->
            showListening()
        }
        
        client.on("event.user_speech_stopped") { args ->
            showProcessing()
        }
        
        // 对话结束
        client.on("event.cid_end") { args ->
            val stats = args[1] as CidEndStats
            Log.d(TAG, "对话结束，耗时: ${stats.totalDuration}ms")
            showIdle()
        }
        
        // 错误处理
        client.on("error") { args ->
            val code = args[0] as Int
            val message = args[1] as String
            handleError(code, message)
        }
    }
    
    private fun connectToServer() {
        showConnecting()
        
        client.connect(object : ConnectionCallback {
            override fun onSuccess() {
                Log.d(TAG, "连接成功")
                showConnected()
            }
            
            override fun onError(error: AIChainError) {
                Log.e(TAG, "连接失败: ${error.message}")
                showError(error.message)
            }
        })
    }
    
    private fun configureSession() {
        val config = SessionConfig(
            mode = "full_duplex",
            simplifiedResponse = true,
            multiTurnEnabled = true,
            stt = STTConfig(
                enable = true,
                language = "zh-CN",
                audioConfig = AudioConfig(
                    sampleRate = 16000,
                    bitDepth = 16,
                    channels = 1
                ),
                vad = VadConfig(
                    enable = true,
                    minSpeechDuration = 300,
                    minSilenceDuration = 500
                ),
                interrupt = InterruptConfig(enable = true)
            ),
            nlu = NLUConfig(enable = true),
            tts = TTSConfig(
                enable = true,
                language = "zh-CN",
                speed = 1.0f,
                audioConfig = AudioConfig(
                    sampleRate = 24000,
                    bitDepth = 16,
                    channels = 1
                )
            )
        )
        
        client.setConfig(config, object : ConfigCallback {
            override fun onSuccess() {
                Log.d(TAG, "配置成功")
                showReady()
            }
            
            override fun onError(error: AIChainError) {
                Log.e(TAG, "配置失败: ${error.message}")
                showError(error.message)
            }
        })
    }
    
    // 开始录音并发送
    private fun startVoiceInput() {
        client.beginSend()
        
        audioRecorder = AudioRecorder(16000, 1).apply {
            startRecording { audioData ->
                client.sendAudioStream(audioData, false)
            }
        }
    }
    
    // 停止录音
    private fun stopVoiceInput() {
        audioRecorder?.stopRecording { lastChunk ->
            client.sendAudioStream(lastChunk, true)
        }
        audioRecorder = null
    }
    
    // 发送文本消息
    private fun sendTextMessage(text: String) {
        client.beginSend()
        client.sendText(text)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        audioRecorder?.release()
        audioPlayer?.release()
        client.disconnect()
    }
    
    companion object {
        private const val TAG = "VoiceAssistant"
    }
}
```

### 2. 音频录制集成
```kotlin
class AudioRecorder(
    private val sampleRate: Int,
    private val channels: Int
) {
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var recordingThread: Thread? = null
    
    fun startRecording(onAudioData: (ByteArray) -> Unit) {
        val channelConfig = if (channels == 1) 
            AudioFormat.CHANNEL_IN_MONO 
        else 
            AudioFormat.CHANNEL_IN_STEREO
            
        val bufferSize = AudioRecord.getMinBufferSize(
            sampleRate,
            channelConfig,
            AudioFormat.ENCODING_PCM_16BIT
        )
        
        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            channelConfig,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )
        
        audioRecord?.startRecording()
        isRecording = true
        
        recordingThread = Thread {
            val buffer = ByteArray(bufferSize)
            while (isRecording) {
                val read = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                if (read > 0) {
                    val audioData = buffer.copyOf(read)
                    onAudioData(audioData)
                }
            }
        }
        recordingThread?.start()
    }
    
    fun stopRecording(onLastChunk: (ByteArray) -> Unit) {
        isRecording = false
        recordingThread?.join()
        audioRecord?.stop()
        onLastChunk(ByteArray(0))
    }
    
    fun release() {
        audioRecord?.release()
        audioRecord = null
    }
}
```

### 3. 音频播放集成
```kotlin
class AudioPlayer(
    private val sampleRate: Int,
    private val channels: Int
) {
    private var audioTrack: AudioTrack? = null
    private val audioQueue = LinkedBlockingQueue<ByteArray>()
    private var isPlaying = false
    private var playbackThread: Thread? = null
    
    init {
        initAudioTrack()
        startPlaybackThread()
    }
    
    private fun initAudioTrack() {
        val channelConfig = if (channels == 1)
            AudioFormat.CHANNEL_OUT_MONO
        else
            AudioFormat.CHANNEL_OUT_STEREO
            
        val bufferSize = AudioTrack.getMinBufferSize(
            sampleRate,
            channelConfig,
            AudioFormat.ENCODING_PCM_16BIT
        )
        
        audioTrack = AudioTrack(
            AudioManager.STREAM_MUSIC,
            sampleRate,
            channelConfig,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize,
            AudioTrack.MODE_STREAM
        )
    }
    
    private fun startPlaybackThread() {
        isPlaying = true
        playbackThread = Thread {
            audioTrack?.play()
            while (isPlaying) {
                try {
                    val audioData = audioQueue.poll(100, TimeUnit.MILLISECONDS)
                    audioData?.let {
                        audioTrack?.write(it, 0, it.size)
                    }
                } catch (e: InterruptedException) {
                    break
                }
            }
        }
        playbackThread?.start()
    }
    
    fun play(base64Audio: String) {
        val audioData = Base64.decode(base64Audio, Base64.DEFAULT)
        audioQueue.offer(audioData)
    }
    
    fun stop() {
        audioQueue.clear()
        audioTrack?.pause()
        audioTrack?.flush()
    }
    
    fun release() {
        isPlaying = false
        playbackThread?.interrupt()
        playbackThread?.join()
        audioTrack?.release()
        audioTrack = null
    }
}
```

### 4. 完整的 Java 集成示例
```java
public class VoiceAssistantActivity extends AppCompatActivity {
    private AIChainClient client;
    private AudioRecorder audioRecorder;
    private AudioPlayer audioPlayer;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_voice_assistant);
        
        initClient();
        registerEventListeners();
        connectToServer();
    }
    
    private void initClient() {
        client = new AIChainClient.Builder()
            .appId(BuildConfig.APP_ID)
            .appKey(BuildConfig.APP_KEY)
            .host(BuildConfig.HOST)
            .sn(getDeviceSN())
            .scene("main")
            .autoReconnect(true)
            .logLevel(LogLevel.DEBUG)
            .build();
    }
    
    private void registerEventListeners() {
        // 会话创建
        client.on("session.created", args -> {
            String sid = (String) args[0];
            Log.d(TAG, "会话创建: " + sid);
            configureSession();
        });
        
        // STT 结果
        client.on("stt.result", args -> {
            STTAnswerResult result = (STTAnswerResult) args[1];
            Boolean last = (Boolean) args[2];
            updateTranscript(result.getText(), last);
        });
        
        // NLU 回答
        client.on("nlu.answer", args -> {
            NLUAnswerResult result = (NLUAnswerResult) args[1];
            Boolean last = (Boolean) args[2];
            displayAnswer(result.getAnswer(), last);
        });
        
        // TTS 音频
        client.on("tts.audio", args -> {
            TTSAudioResult result = (TTSAudioResult) args[1];
            Boolean last = (Boolean) args[2];
            playAudio(result.getData(), last);
        });
        
        // 对话结束
        client.on("event.cid_end", args -> {
            CidEndStats stats = (CidEndStats) args[1];
            Log.d(TAG, "对话结束，耗时: " + stats.getTotalDuration() + "ms");
        });
    }
    
    private void connectToServer() {
        client.connect(new ConnectionCallback() {
            @Override
            public void onSuccess() {
                Log.d(TAG, "连接成功");
                showConnected();
            }
            
            @Override
            public void onError(AIChainError error) {
                Log.e(TAG, "连接失败: " + error.getMessage());
                showError(error.getMessage());
            }
        });
    }
    
    private void configureSession() {
        SessionConfig config = new SessionConfig(
            "full_duplex",
            true,
            true,
            null,
            new STTConfig(
                true,
                null,
                "zh-CN",
                new AudioConfig(null, null, 16000, 16, 1),
                null,
                new VadConfig(true, 300, 500, null),
                null,
                new InterruptConfig(true)
            ),
            new NLUConfig(true, null, null, null),
            new TTSConfig(
                true,
                null,
                "zh-CN",
                1.0f,
                null,
                null,
                null,
                new AudioConfig(null, null, 24000, 16, 1)
            )
        );
        
        client.setConfig(config, new ConfigCallback() {
            @Override
            public void onSuccess() {
                Log.d(TAG, "配置成功");
                showReady();
            }
            
            @Override
            public void onError(AIChainError error) {
                Log.e(TAG, "配置失败: " + error.getMessage());
                showError(error.getMessage());
            }
        });
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (audioRecorder != null) {
            audioRecorder.release();
        }
        if (audioPlayer != null) {
            audioPlayer.release();
        }
        client.disconnect();
    }
    
    private static final String TAG = "VoiceAssistant";
}
```

---

## 最佳实践
### 1. 生命周期管理
```kotlin
class VoiceAssistantViewModel : ViewModel() {
    private val client: AIChainClient = // ... 初始化
    
    override fun onCleared() {
        super.onCleared()
        client.disconnect()
    }
}
```

### 2. 权限请求
```kotlin
class VoiceAssistantActivity : AppCompatActivity() {
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startVoiceInput()
        } else {
            showPermissionDenied()
        }
    }
    
    private fun checkAndRequestPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED -> {
                startVoiceInput()
            }
            else -> {
                requestPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
            }
        }
    }
}
```

### 3. 网络状态监听
```kotlin
class NetworkMonitor(context: Context) {
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    
    fun observeNetworkState(onNetworkAvailable: () -> Unit, onNetworkLost: () -> Unit) {
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                onNetworkAvailable()
            }
            
            override fun onLost(network: Network) {
                onNetworkLost()
            }
        }
        
        connectivityManager.registerDefaultNetworkCallback(networkCallback)
    }
}
```

### 4. 错误重试策略
```kotlin
class RetryHelper {
    private var retryCount = 0
    private val maxRetries = 3
    
    fun retryWithBackoff(operation: () -> Unit, onFailed: () -> Unit) {
        if (retryCount >= maxRetries) {
            onFailed()
            return
        }
        
        retryCount++
        val delay = (2.0.pow(retryCount) * 1000).toLong()
        
        Handler(Looper.getMainLooper()).postDelayed({
            operation()
        }, delay)
    }
    
    fun reset() {
        retryCount = 0
    }
}
```

### 5. 内存管理
```kotlin
class AudioBufferManager {
    private val bufferPool = mutableListOf<ByteArray>()
    private val maxPoolSize = 10
    
    fun obtainBuffer(size: Int): ByteArray {
        return synchronized(bufferPool) {
            bufferPool.removeFirstOrNull() ?: ByteArray(size)
        }
    }
    
    fun recycleBuffer(buffer: ByteArray) {
        synchronized(bufferPool) {
            if (bufferPool.size < maxPoolSize) {
                bufferPool.add(buffer)
            }
        }
    }
}
```

### 6. 日志管理
```kotlin
object Logger {
    private var logLevel = LogLevel.INFO
    
    fun setLogLevel(level: LogLevel) {
        logLevel = level
    }
    
    fun d(tag: String, message: String) {
        if (logLevel.ordinal <= LogLevel.DEBUG.ordinal) {
            Log.d(tag, message)
        }
    }
    
    fun i(tag: String, message: String) {
        if (logLevel.ordinal <= LogLevel.INFO.ordinal) {
            Log.i(tag, message)
        }
    }
    
    fun e(tag: String, message: String, throwable: Throwable? = null) {
        if (logLevel.ordinal <= LogLevel.ERROR.ordinal) {
            Log.e(tag, message, throwable)
        }
    }
}
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
```kotlin
class ErrorHandler {
    fun handleError(error: AIChainError, client: AIChainClient) {
        when (error.code) {
            10001 -> {
                // 未连接
                client.reconnect(object : ConnectionCallback {
                    override fun onSuccess() {
                        Log.d(TAG, "重连成功")
                    }
                    override fun onError(error: AIChainError) {
                        Log.e(TAG, "重连失败: ${error.message}")
                    }
                })
            }
            10010 -> {
                // WebSocket 连接失败
                showError("网络连接失败，请检查网络设置")
            }
            10011 -> {
                // 认证失败
                showError("认证失败，请检查应用凭证")
            }
            10020, 10021, 10022 -> {
                // 功能错误
                showError("服务暂时不可用，请稍后重试")
            }
            10030 -> {
                // 超时
                showError("请求超时，请重试")
            }
            else -> {
                // 其他错误
                showError("发生错误: ${error.message}")
            }
        }
    }
}
```

---

## 常见问题
### Q1: 如何处理音频格式转换？
**A:** SDK 接受 PCM 格式的音频数据。如果你的音频是其他格式，需要先转换：

```kotlin
fun convertToPCM(inputFile: File): ByteArray {
    val mediaExtractor = MediaExtractor()
    mediaExtractor.setDataSource(inputFile.path)
    
    // 选择音频轨道
    val trackIndex = selectAudioTrack(mediaExtractor)
    mediaExtractor.selectTrack(trackIndex)
    
    val format = mediaExtractor.getTrackFormat(trackIndex)
    val mime = format.getString(MediaFormat.KEY_MIME)
    
    // 创建解码器
    val codec = MediaCodec.createDecoderByType(mime!!)
    codec.configure(format, null, null, 0)
    codec.start()
    
    // 解码为 PCM
    val pcmData = mutableListOf<Byte>()
    // ... 解码逻辑
    
    return pcmData.toByteArray()
}
```

### Q2: 如何实现语音打断？
**A:** 启用 interrupt 配置，并监听 `event.interrupted` 事件：

```kotlin
val config = SessionConfig(
    stt = STTConfig(
        interrupt = InterruptConfig(enable = true)
    )
)

client.on("event.interrupted") { args ->
    val cid = args[0] as String
    // 停止当前播放
    audioPlayer.stop()
    // 开始新的对话
    client.beginSend()
}
```

### Q3: 如何实现多轮对话？
**A:** 启用 `multiTurnEnabled` 并使用 `beginSend()` 管理对话轮次：

```kotlin
val config = SessionConfig(
    mode = "half_duplex",
    multiTurnEnabled = true
)

// 第一轮对话
client.beginSend()
client.sendText("今天天气怎么样？")

// 等待回答后，继续下一轮
client.on("event.cid_end") { args ->
    // 开始新一轮
    client.beginSend()
    client.sendText("明天呢？")
}
```

### Q4: 如何优化内存使用？
**A:** 使用对象池和及时释放资源：

```kotlin
// 1. 使用对象池
val bufferPool = ArrayDeque<ByteArray>()

fun getBuffer(): ByteArray {
    return bufferPool.removeFirstOrNull() ?: ByteArray(4096)
}

fun recycleBuffer(buffer: ByteArray) {
    if (bufferPool.size < 10) {
        bufferPool.addLast(buffer)
    }
}

// 2. 及时释放
override fun onPause() {
    super.onPause()
    audioRecorder?.release()
    audioPlayer?.stop()
}

// 3. 移除不需要的监听器
client.off("tts.audio", ttsListener)
```

### Q5: 如何处理网络切换？
**A:** 监听网络状态变化并重连：

```kotlin
val networkCallback = object : ConnectivityManager.NetworkCallback() {
    override fun onAvailable(network: Network) {
        if (!client.isConnected()) {
            client.reconnect(object : ConnectionCallback {
                override fun onSuccess() {
                    Log.d(TAG, "网络恢复，重连成功")
                }
                override fun onError(error: AIChainError) {
                    Log.e(TAG, "重连失败")
                }
            })
        }
    }
    
    override fun onLost(network: Network) {
        Log.w(TAG, "网络断开")
    }
}

connectivityManager.registerDefaultNetworkCallback(networkCallback)
```

### Q6: 如何实现流式文本输入？
**A:** 使用 `sendTextStream()` 方法：

```kotlin
val textChunks = listOf("这是", "一段", "流式", "文本")

textChunks.forEachIndexed { index, chunk ->
    val isLast = index == textChunks.size - 1
    client.sendTextStream(chunk, isLast)
}
```

### Q7: 如何调试 WebSocket 连接？
**A:** 启用 DEBUG 日志级别：

```kotlin
val client = AIChainClient.Builder()
    .appId("your-app-id")
    .appKey("your-app-key")
    .host("your-host")
    .sn("your-sn")
    .logLevel(LogLevel.DEBUG)  // 启用详细日志
    .build()

// 查看 Logcat 输出
// adb logcat -s AIChainClient:D
```

### Q8: 如何处理大文件上传（如图片）？
**A:** 将图片转换为 Base64 并分块发送：

```kotlin
fun sendLargeImage(imageFile: File) {
    val bitmap = BitmapFactory.decodeFile(imageFile.path)
    
    // 压缩图片
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, 80, stream)
    val imageBytes = stream.toByteArray()
    
    // 转换为 Base64
    val base64Image = Base64.encodeToString(imageBytes, Base64.NO_WRAP)
    
    // 发送
    client.sendImage(base64Image, mapOf(
        "format" to "jpeg",
        "size" to imageBytes.size
    ))
}
```

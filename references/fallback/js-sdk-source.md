# AIChain JavaScript/TypeScript SDK 集成指南
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
AIChain JavaScript/TypeScript SDK 是一个基于 WebSocket 的实时通信 SDK，支持语音识别（STT）、自然语言理解（NLU）和语音合成（TTS）功能。本 SDK 提供了完整的 JavaScript/TypeScript 支持，可在 Node.js 和浏览器环境中使用。

### 主要特性
+ ✅ WebSocket 实时双向通信
+ ✅ 自动重连机制
+ ✅ 多模态消息支持（文本、语音、图片）
+ ✅ 流式数据传输
+ ✅ 完整的事件系统
+ ✅ Promise/async-await 异步编程
+ ✅ TypeScript 类型定义
+ ✅ Node.js 和浏览器双环境支持
+ ✅ 按序回调缓存机制（确保消息有序到达）

### 系统要求
+ **Node.js**: 14.0.0 或更高版本
+ **浏览器**: 支持 WebSocket 的现代浏览器（Chrome 16+, Firefox 11+, Safari 7+, Edge 12+）
+ **TypeScript**: 5.0+ (可选，用于类型支持)

---

## 快速开始
### 1. 安装依赖
```bash
npm install @iflytek-aichain/sdk --registry=https://registry.npmjs.com/
```

### 2. 引入 SDK
#### ES Module (推荐)
```javascript
import { AIChainClient } from '@iflytek-aichain/sdk';
```

#### CommonJS
```javascript
const { AIChainClient } = require('@iflytek-aichain/sdk');
```

#### TypeScript
```typescript
import { AIChainClient, SessionConfig, ConnectionState } from '@iflytek-aichain/sdk';
```

### 3. 初始化客户端
#### JavaScript 示例
```javascript
const client = new AIChainClient({
  appId: 'your-app-id',
  appKey: 'your-app-key',
  host: 'your-host',
  sn: 'your-device-sn'
});
```

#### TypeScript 示例
```typescript
const client = new AIChainClient({
  appId: 'your-app-id',
  appKey: 'your-app-key',
  host: 'your-host',
  sn: 'your-device-sn',
  scene: 'main',
  channel: 'real_time',
  autoReconnect: true,
  logLevel: 'INFO'
});
```

### 4. 连接服务器
```javascript
// 连接到服务器
await client.connect();

console.log('连接成功');
```

### 5. 配置会话
```javascript
await client.setConfig({
  mode: 'full_duplex',
  simplifiedResponse: true,
  multiTurnEnabled: true,
  stt: {
    enable: true,
    language: 'zh',
    audioConfig: {
      audioEncoding: 'raw',
      sampleRate: 16000,
      bitDepth: 16,
      channels: 1
    }
  },
  nlu: {
    enable: true
  },
  tts: {
    enable: true
  }
});
```

### 6. 发送消息并监听事件
```javascript
// 监听 NLU 回答
client.on('nlu.answer', (cid, result, isLast) => {
  console.log('回答:', result.answer);
  if (isLast) {
    console.log('回答完成');
  }
});

// 开始新对话
await client.beginSend();

// 发送文本消息
await client.sendText('你好，世界！');
```

---

## 详细配置
### 构造函数配置参数
`AIChainClient` 构造函数接受以下配置选项：

| 参数                   | 类型    | 必填 | 默认值      | 说明                                                            |
| ---------------------- | ------- | ---- | ----------- | --------------------------------------------------------------- |
| `appId`                | string  | ✅    | -           | 应用 ID，由平台分配                                             |
| `appKey`               | string  | ✅    | -           | 应用密钥，用于身份验证                                          |
| `host`                 | string  | ✅    | -           | 服务器地址（支持 ws:// 或 wss:// 前缀，或纯 host）              |
| `sn`                   | string  | ✅    | -           | 设备序列号，唯一标识设备                                        |
| `scene`                | string  | ❌    | "main"      | 场景名称，用于多场景应用                                        |
| `channel`              | string  | ❌    | "real_time" | 通道名称                                                        |
| `secure`               | boolean | ❌    | false       | 是否使用安全连接（wss://），如果 host 包含 wss:// 则自动为 true |
| `autoReconnect`        | boolean | ❌    | true        | 是否启用自动重连                                                |
| `reconnectInterval`    | number  | ❌    | 1000        | 初始重连间隔（毫秒）                                            |
| `maxReconnectInterval` | number  | ❌    | 30000       | 最大重连间隔（毫秒）                                            |
| `maxReconnectAttempts` | number  | ❌    | 10          | 最大重连次数                                                    |
| `logLevel`             | string  | ❌    | "INFO"      | 日志级别（DEBUG/INFO/WARN/ERROR）                               |


#### 完整配置示例
```javascript
const client = new AIChainClient({
  appId: 'your-app-id',
  appKey: 'your-app-key',
  host: 'wss://your-host.com',
  sn: 'device-12345',
  scene: 'main',
  channel: 'real_time',
  secure: true,
  autoReconnect: true,
  reconnectInterval: 2000,
  maxReconnectInterval: 60000,
  maxReconnectAttempts: 20,
  logLevel: 'DEBUG'
});
```

### 会话配置（SessionConfig）
连接成功后，需要配置会话参数：

#### SessionConfig 参数
| 参数                 | 类型                | 说明                                                            |
| -------------------- | ------------------- | --------------------------------------------------------------- |
| `mode`               | string              | 工作模式：`"full_duplex"`（全双工）或 `"half_duplex"`（半双工） |
| `simplifiedResponse` | boolean             | 是否简化响应内容                                                |
| `multiTurnEnabled`   | boolean             | 是否启用多轮对话                                                |
| `extraConfig`        | Record<string, any> | 额外配置参数                                                    |
| `stt`                | STTConfig           | 语音识别配置                                                    |
| `nlu`                | NLUConfig           | 自然语言理解配置                                                |
| `tts`                | TTSConfig           | 语音合成配置                                                    |


#### STTConfig（语音识别配置）
| 参数            | 类型                | 说明                              |
| --------------- | ------------------- | --------------------------------- |
| `enable`        | boolean             | 是否启用 STT                      |
| `sttEngineId`   | string              | STT 引擎 ID                       |
| `language`      | string              | 语言代码（如 "zh", "en", "auto"） |
| `audioConfig`   | AudioConfig         | 音频配置                          |
| `vad`           | VadConfig           | 语音活动检测配置                  |
| `turnDetection` | TurnDetectionConfig | 轮次检测配置                      |
| `interrupt`     | InterruptConfig     | 打断配置                          |


#### AudioConfig（音频配置）
| 参数            | 类型   | 说明                                        |
| --------------- | ------ | ------------------------------------------- |
| `audioEncoding` | string | 音频编码格式（如 "raw", "opus", "opus-wb"） |
| `format`        | string | 音频格式（如 "plain"）                      |
| `sampleRate`    | number | 采样率（如 16000, 48000）                   |
| `bitDepth`      | number | 位深度（如 16）                             |
| `channels`      | number | 声道数（1=单声道, 2=立体声）                |


#### VadConfig（语音活动检测配置）
| 参数                  | 类型    | 说明                                 |
| --------------------- | ------- | ------------------------------------ |
| `enable`              | boolean | 是否启用 VAD                         |
| `minSpeechDuration`   | number  | 最小语音持续时间（毫秒），默认 50ms  |
| `minSilenceDuration`  | number  | 最小静音持续时间（毫秒），默认 600ms |
| `activationThreshold` | number  | 激活阈值（0.0-1.0），默认 0.5        |


#### TurnDetectionConfig（轮次检测配置）
| 参数                  | 类型    | 说明                 |
| --------------------- | ------- | -------------------- |
| `enable`              | boolean | 是否启用轮次检测     |
| `minEndpointingDelay` | number  | 最小端点延迟（毫秒） |
| `maxEndpointingDelay` | number  | 最大端点延迟（毫秒） |


#### InterruptConfig（打断配置）
| 参数     | 类型    | 说明             |
| -------- | ------- | ---------------- |
| `enable` | boolean | 是否允许用户打断 |


#### NLUConfig（自然语言理解配置）
| 参数                     | 类型        | 说明                                 |
| ------------------------ | ----------- | ------------------------------------ |
| `enable`                 | boolean     | 是否启用 NLU                         |
| `streamingFlushInterval` | number      | 流式输出刷新间隔（毫秒）             |
| `welcomeReply`           | string[]    | 欢迎语列表，服务端会随机选择一条返回 |
| `tools`                  | ToolsConfig | 工具调用配置                         |
| `rag`                    | RagConfig   | RAG 检索配置                         |


#### ToolsConfig（工具配置）
| 参数             | 类型     | 说明           |
| ---------------- | -------- | -------------- |
| `model`          | LLMModel | LLM 模型配置   |
| `toolCallPrompt` | string   | 工具调用提示词 |


#### RagConfig（RAG 配置）
| 参数             | 类型           | 说明            |
| ---------------- | -------------- | --------------- |
| `model`          | LLMModel       | LLM 模型配置    |
| `threshold`      | number         | 相似度阈值      |
| `contextLength`  | number         | 上下文长度      |
| `topN`           | number         | 返回前 N 个结果 |
| `polishPrompt`   | string         | 润色提示词      |
| `dialogueConfig` | DialogueConfig | 对话配置        |


#### LLMModel（大语言模型配置）
| 参数          | 类型                | 说明                      |
| ------------- | ------------------- | ------------------------- |
| `modelId`     | string              | 模型 ID                   |
| `maxTokens`   | number              | 最大 token 数             |
| `temperature` | number              | 温度参数（0.0-2.0）       |
| `topP`        | number              | Top-P 采样参数（0.0-1.0） |
| `extraConfig` | Record<string, any> | 额外配置                  |


#### DialogueConfig（对话配置）
| 参数               | 类型     | 说明         |
| ------------------ | -------- | ------------ |
| `enableFaq`        | boolean  | 是否启用 FAQ |
| `enableChitchat`   | boolean  | 是否启用闲聊 |
| `fallbackResponse` | string[] | 兜底回复列表 |
| `welcomeReply`     | string[] | 欢迎语列表   |


#### TTSConfig（语音合成配置）
| 参数          | 类型                        | 说明                                                   |
| ------------- | --------------------------- | ------------------------------------------------------ |
| `enable`      | boolean                     | 是否启用 TTS                                           |
| `textFilters` | string[]                    | 文本过滤器列表（如 "filter_markdown", "filter_emoji"） |
| `voices`      | Record<string, VoiceConfig> | 语音配置，按语言分组                                   |


#### VoiceConfig（语音配置）
| 参数          | 类型        | 说明         |
| ------------- | ----------- | ------------ |
| `voiceId`     | string      | 发音人 ID    |
| `speed`       | number      | 语速（0-10） |
| `pitch`       | number      | 音调（0-10） |
| `volume`      | number      | 音量（0-10） |
| `audioConfig` | AudioConfig | 音频输出配置 |


#### 完整配置示例
```javascript
const config = {
  mode: 'full_duplex',
  simplifiedResponse: true,
  multiTurnEnabled: true,
  stt: {
    enable: true,
    language: 'zh',
    audioConfig: {
      audioEncoding: 'raw',
      format: 'plain',
      sampleRate: 16000,
      bitDepth: 16,
      channels: 1
    },
    vad: {
      enable: true,
      minSpeechDuration: 50,
      minSilenceDuration: 600,
      activationThreshold: 0.5
    },
    turnDetection: {
      enable: true,
      minEndpointingDelay: 500,
      maxEndpointingDelay: 3000
    },
    interrupt: {
      enable: true
    }
  },
  nlu: {
    enable: true,
    streamingFlushInterval: 300,
    tools: {
      model: {
        modelId: 'spark-v3.5',
        maxTokens: 2000,
        temperature: 0.7,
        topP: 0.9
      }
    },
    rag: {
      model: {
        modelId: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7,
        topP: 0.9
      },
      threshold: 0.75,
      topN: 5
    }
  },
  tts: {
    enable: true,
    textFilters: ['filter_markdown', 'filter_emoji'],
    voices: {
      zh: {
        voiceId: '4',
        speed: 5,
        pitch: 5,
        volume: 5,
        audioConfig: {
          audioEncoding: 'opus-wb',
          sampleRate: 16000,
          bitDepth: 16,
          channels: 1
        }
      }
    }
  }
};

await client.setConfig(config);
```

---

## API 参考
### 连接管理
#### `connect(): Promise<void>`
建立 WebSocket 连接并等待会话创建。

**返回值:**

+ `Promise<void>`: 连接成功后 resolve

**示例:**

```javascript
try {
  await client.connect();
  console.log('连接成功');
} catch (error) {
  console.error('连接失败:', error);
}
```

#### `disconnect(): void`
关闭 WebSocket 连接。

**示例:**

```javascript
client.disconnect();
```

#### `reconnect(): Promise<void>`
手动重连到服务器。

**返回值:**

+ `Promise<void>`: 重连成功后 resolve

**示例:**

```javascript
try {
  await client.reconnect();
  console.log('重连成功');
} catch (error) {
  console.error('重连失败:', error);
}
```

#### `isConnected(): boolean`
检查当前是否已连接。

**返回值:**

+ `boolean`: true 表示已连接，false 表示未连接

**示例:**

```javascript
if (client.isConnected()) {
  console.log('已连接');
} else {
  console.log('未连接');
}
```

#### `getConnectionState(): ConnectionState`
获取当前连接状态。

**返回值:**

+ `ConnectionState`: 连接状态枚举值
    - `ConnectionState.DISCONNECTED` (0): 未连接
    - `ConnectionState.CONNECTING` (1): 连接中
    - `ConnectionState.CONNECTED` (2): 已连接
    - `ConnectionState.RECONNECTING` (3): 重连中
    - `ConnectionState.CLOSED` (4): 已关闭

**示例:**

```javascript
import { ConnectionState } from '@aichain/sdk';

const state = client.getConnectionState();
switch (state) {
  case ConnectionState.CONNECTED:
    console.log('已连接');
    break;
  case ConnectionState.CONNECTING:
    console.log('连接中');
    break;
  default:
    console.log('其他状态');
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

```javascript
const info = client.getConnectionInfo();
console.log('会话ID:', info.sid);
console.log('重连次数:', info.reconnectAttempts);
console.log('连接时间:', new Date(info.connectedAt));
```

### 配置管理
#### `setConfig(config: SessionConfig): Promise<void>`
设置会话配置。

**参数:**

+ `config`: 会话配置对象

**返回值:**

+ `Promise<void>`: 配置成功后 resolve

**示例:**

```javascript
const config = {
  mode: 'full_duplex',
  stt: { enable: true },
  nlu: { enable: true },
  tts: { enable: true }
};

try {
  await client.setConfig(config);
  console.log('配置成功');
} catch (error) {
  console.error('配置失败:', error);
}
```

#### `getConfig(): SessionConfig | null`
获取当前会话配置。

**返回值:**

+ 当前配置对象，如果未设置则返回 `null`

**示例:**

```javascript
const currentConfig = client.getConfig();
if (currentConfig) {
  console.log('当前模式:', currentConfig.mode);
}
```

### 消息发送
#### `beginSend(): Promise<void>`
生成新的对话 ID（CID），开始新一轮对话。

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
await client.beginSend();
```

#### `cancel(): Promise<void>`
取消当前对话。

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
await client.cancel();
```

#### `sendText(text: string): Promise<void>`
发送文本消息。

**参数:**

+ `text`: 文本内容

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
await client.sendText('你好，世界！');
```

#### `sendTextStream(text: string, isEnd: boolean): Promise<void>`
以流式方式发送文本。

**参数:**

+ `text`: 文本内容
+ `isEnd`: 是否为最后一个分片

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
await client.sendTextStream('这是第一部分', false);
await client.sendTextStream('这是第二部分', false);
await client.sendTextStream('这是最后一部分', true);
```

#### `sendAudio(audioData: Uint8Array | Buffer): Promise<void>`
发送音频数据（单帧）。

**参数:**

+ `audioData`: 音频字节数组

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
const audioData = new Uint8Array(1024);
// ... 填充音频数据
await client.sendAudio(audioData);
```

#### `sendAudioStream(audioData: Uint8Array | Buffer, isEnd: boolean): Promise<void>`
以流式方式发送音频。

**参数:**

+ `audioData`: 音频字节数组
+ `isEnd`: 是否为最后一帧

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
// 持续发送音频流
while (recording) {
  const audioChunk = await recordAudioChunk();
  await client.sendAudioStream(audioChunk, false);
}
// 发送最后一帧
await client.sendAudioStream(lastChunk, true);
```

#### `sendImage(imageData: string, extend?: Record<string, any>): Promise<void>`
发送图片。

**参数:**

+ `imageData`: Base64 编码的图片数据或图片 URL
+ `extend`: 扩展信息（可选）

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
const base64Image = 'data:image/png;base64,iVBORw0KGgo...';
await client.sendImage(base64Image, { format: 'png' });
```

#### `sendMsgs(items: Array<TextItem | ImageItem | AudioItem>): Promise<void>`
发送多模态消息。

**参数:**

+ `items`: 消息项列表

**返回值:**

+ `Promise<void>`

**示例:**

```javascript
const items = [
  { type: 'text', data: '请看这张图片' },
  { type: 'image', data: 'base64-image-data', extend: { format: 'jpg' } },
  { type: 'text', data: '这是什么？' }
];
await client.sendMsgs(items);
```

### 事件监听
#### `on(event: string, callback: EventCallback): void`
添加事件监听器。

**参数:**

+ `event`: 事件名称
+ `callback`: 事件监听器函数

**示例:**

```javascript
client.on('nlu.answer', (cid, result, isLast) => {
  console.log('答案:', result.answer);
});
```

#### `off(event: string, callback?: EventCallback): void`
移除事件监听器。

**参数:**

+ `event`: 事件名称
+ `callback`: 要移除的监听器，如果不提供则移除该事件的所有监听器

**示例:**

```javascript
const listener = (cid, result, isLast) => {
  console.log(result.answer);
};

client.on('nlu.answer', listener);
// 移除特定监听器
client.off('nlu.answer', listener);
// 移除所有监听器
client.off('nlu.answer');
```

#### `removeAllListeners(event?: string): void`
移除所有事件监听器。

**参数:**

+ `event`: 事件名称，如果不提供则移除所有事件的所有监听器

**示例:**

```javascript
// 移除特定事件的所有监听器
client.removeAllListeners('nlu.answer');
// 移除所有监听器
client.removeAllListeners();
```

---

## 事件系统
SDK 提供了完整的事件系统，所有事件回调都是异步的，支持 Promise。

### 连接事件
#### `connecting`
连接开始时触发。

**回调参数:** 无

**示例:**

```javascript
client.on('connecting', () => {
  console.log('开始连接...');
});
```

#### `session.created`
会话创建成功时触发。

**回调参数:**

+ `sid` (string): 会话 ID

**示例:**

```javascript
client.on('session.created', (sid) => {
  console.log('会话已创建:', sid);
});
```

#### `session.configed`
会话配置成功时触发。

**回调参数:**

+ `sid` (string): 会话 ID
+ `config` (SessionConfig | null): 配置对象

**示例:**

```javascript
client.on('session.configed', (sid, config) => {
  console.log('会话已配置:', sid);
});
```

#### `session.error`
会话错误时触发。

**回调参数:**

+ `error` (AIChainError): 错误对象

**示例:**

```javascript
client.on('session.error', (error) => {
  console.error('会话错误:', error.message, '代码:', error.code);
});
```

#### `reconnecting`
重连开始时触发。

**回调参数:**

+ `attempt` (number): 当前重连次数
+ `maxAttempts` (number): 最大重连次数

**示例:**

```javascript
client.on('reconnecting', (attempt, maxAttempts) => {
  console.log(`重连中: ${attempt}/${maxAttempts}`);
});
```

#### `close`
连接关闭时触发。

**回调参数:**

+ `code` (number): 关闭代码
+ `reason` (string): 关闭原因

**示例:**

```javascript
client.on('close', (code, reason) => {
  console.log('连接已关闭:', code, '-', reason);
});
```

#### `error`
WebSocket 错误时触发。

**回调参数:**

+ `code` (number): 错误代码
+ `message` (string): 错误消息

**示例:**

```javascript
client.on('error', (code, message) => {
  console.error('错误:', code, '-', message);
});
```

#### `pong`
收到心跳响应时触发。

**回调参数:** 无

**示例:**

```javascript
client.on('pong', () => {
  console.log('心跳正常');
});
```

### STT 事件
#### `stt.result`
语音识别结果。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (STTAnswerResult): 识别结果
+ `isLast` (boolean): 是否为最后一个结果

**STTAnswerResult 字段:**

+ `text`: 识别的文本
+ `action`: 动作类型（"append", "replace", "clear"）
+ `position`: 替换位置（如果 action 为 "replace"）
+ `index`: 结果索引

**示例:**

```javascript
client.on('stt.result', (cid, result, isLast) => {
  switch (result.action) {
    case 'append':
      process.stdout.write(result.text);
      break;
    case 'replace':
      console.log('替换文本:', result.text);
      break;
    case 'clear':
      console.log('清除文本');
      break;
  }

  if (isLast) {
    console.log('\n识别完成');
  }
});
```

### NLU 事件
#### `nlu.answer`
NLU 回答结果。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (NLUAnswerResult): 回答结果
+ `isLast` (boolean): 是否为最后一个分片

**NLUAnswerResult 字段:**

+ `answer`: 回答文本
+ `index`: 分片索引
+ `answerSource`: 回答来源（"llm", "rag", "faq" 等）

**示例:**

```javascript
client.on('nlu.answer', (cid, result, isLast) => {
  process.stdout.write(result.answer);  // 流式输出

  if (isLast) {
    console.log('\n回答完成，来源:', result.answerSource);
  }
});
```

#### `nlu.tool_selection`
工具选择事件。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (NLUToolSelectionResult): 工具选择结果

**NLUToolSelectionResult 字段:**

+ `tool`: 工具名称
+ `toolArgs`: 工具参数
+ `toolSelectedDuration`: 选择耗时（毫秒）

**示例:**

```javascript
client.on('nlu.tool_selection', (cid, result) => {
  console.log('选择工具:', result.tool);
  console.log('参数:', result.toolArgs);
});
```

#### `nlu.tool_execution`
工具执行结果。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (NLUToolExecutionResult): 执行结果

**NLUToolExecutionResult 字段:**

+ `tool`: 工具名称
+ `result`: 执行结果
+ `executionDuration`: 执行耗时（毫秒）

**示例:**

```javascript
client.on('nlu.tool_execution', (cid, result) => {
  console.log(`工具 ${result.tool} 执行完成`);
  console.log('结果:', result.result);
  console.log('耗时:', result.executionDuration, 'ms');
});
```

#### `nlu.rag_retrieval`
RAG 检索结果。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (NLURAGRetrievalResult): 检索结果

**NLURAGRetrievalResult 字段:**

+ `docSource`: 文档来源列表
+ `retrievalDuration`: 检索耗时（毫秒）

**DocSource 字段:**

+ `docId`: 文档 ID
+ `title`: 文档标题
+ `score`: 相似度分数
+ `content`: 文档内容

**示例:**

```javascript
client.on('nlu.rag_retrieval', (cid, result) => {
  console.log(`检索到 ${result.docSource.length} 个文档`);
  result.docSource.forEach(doc => {
    console.log(`文档: ${doc.title}, 分数: ${doc.score}`);
  });
});
```

#### `nlu.trace`
NLU 追踪信息。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (NLUTraceResult): 追踪信息

**NLUTraceResult 字段:**

+ `nluTimeConsuming`: NLU 总耗时（毫秒）
+ `extend`: 扩展信息
+ `otherParam`: 其他参数

**示例:**

```javascript
client.on('nlu.trace', (cid, result) => {
  console.log('NLU 耗时:', result.nluTimeConsuming, 'ms');
});
```

### TTS 事件
#### `tts.audio`
TTS 音频数据。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (TTSAudioResult): 音频数据
+ `isLast` (boolean): 是否为最后一帧

**TTSAudioResult 字段:**

+ `data`: Base64 编码的音频数据
+ `index`: 音频帧索引

**示例:**

```javascript
client.on('tts.audio', (cid, result, isLast) => {
  // 解码并播放音频
  const audioBytes = Buffer.from(result.data, 'base64');
  playAudio(audioBytes);

  if (isLast) {
    console.log('音频播放完成');
  }
});
```

### 欢迎消息事件
#### `welcome.answer`
欢迎消息文本。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (WelcomeAnswerResult): 欢迎消息

**WelcomeAnswerResult 字段:**

+ `answer`: 欢迎文本
+ `answerSource`: 来源（通常为 "welcome"）

**示例:**

```javascript
client.on('welcome.answer', (cid, result) => {
  console.log('欢迎消息:', result.answer);
});
```

#### `welcome.audio`
欢迎消息音频。

**回调参数:**

+ `cid` (string): 对话 ID
+ `result` (WelcomeAudioResult): 音频数据

**WelcomeAudioResult 字段:**

+ `data`: Base64 编码的音频数据

**示例:**

```javascript
client.on('welcome.audio', (cid, result) => {
  const audioBytes = Buffer.from(result.data, 'base64');
  playAudio(audioBytes);
});
```

### 对话控制事件
#### `event.interrupted`
对话被打断。

**回调参数:**

+ `cid` (string): 对话 ID

**示例:**

```javascript
client.on('event.interrupted', (cid) => {
  console.log('对话', cid, '被打断');
  stopAudioPlayback();
});
```

#### `event.user_speech_started`
用户开始说话。

**回调参数:**

+ `cid` (string): 对话 ID

**示例:**

```javascript
client.on('event.user_speech_started', (cid) => {
  console.log('用户开始说话');
  showListeningIndicator();
});
```

#### `event.user_speech_stopped`
用户停止说话。

**回调参数:**

+ `cid` (string): 对话 ID

**示例:**

```javascript
client.on('event.user_speech_stopped', (cid) => {
  console.log('用户停止说话');
  hideListeningIndicator();
});
```

#### `event.cid_end`
对话结束。

**回调参数:**

+ `cid` (string): 对话 ID
+ `stats` (CidEndStats): 统计信息

**CidEndStats 字段:**

+ `totalDuration`: 总耗时（毫秒）
+ `sttDuration`: STT 耗时（毫秒）
+ `nluDuration`: NLU 耗时（毫秒）
+ `ttsDuration`: TTS 耗时（毫秒）

**示例:**

```javascript
client.on('event.cid_end', (cid, stats) => {
  console.log('对话结束');
  console.log('总耗时:', stats.totalDuration, 'ms');
  console.log(`STT: ${stats.sttDuration}ms, NLU: ${stats.nluDuration}ms, TTS: ${stats.ttsDuration}ms`);
});
```

---

## 完整集成流程
### 1. Node.js 基础集成流程
```javascript
const { AIChainClient } = require('@aichain/sdk');

async function main() {
  // 1. 初始化客户端
  const client = new AIChainClient({
    appId: process.env.APP_ID,
    appKey: process.env.APP_KEY,
    host: process.env.HOST,
    sn: process.env.SN,
    scene: 'main',
    autoReconnect: true,
    logLevel: 'DEBUG'
  });

  // 2. 注册事件监听
  client.on('session.created', (sid) => {
    console.log('会话创建:', sid);
  });

  client.on('stt.result', (cid, result, isLast) => {
    process.stdout.write(result.text);
    if (isLast) console.log(' (识别完成)');
  });

  client.on('nlu.answer', (cid, result, isLast) => {
    process.stdout.write(result.answer);
    if (isLast) console.log(`\n[来源: ${result.answerSource}]`);
  });

  client.on('tts.audio', (cid, result, isLast) => {
    // 播放音频
    const audioBytes = Buffer.from(result.data, 'base64');
    playAudio(audioBytes);
    if (isLast) console.log('音频播放完成');
  });

  client.on('event.cid_end', (cid, stats) => {
    console.log(`对话结束，耗时: ${stats.totalDuration}ms`);
  });

  client.on('error', (code, message) => {
    console.error('错误:', code, message);
  });

  // 3. 连接服务器
  try {
    await client.connect();
    console.log('连接成功');
  } catch (error) {
    console.error('连接失败:', error);
    return;
  }

  // 4. 配置会话
  await client.setConfig({
    mode: 'full_duplex',
    simplifiedResponse: true,
    multiTurnEnabled: true,
    stt: {
      enable: true,
      language: 'zh',
      audioConfig: {
        audioEncoding: 'raw',
        sampleRate: 16000,
        bitDepth: 16,
        channels: 1
      },
      vad: {
        enable: true,
        minSpeechDuration: 300,
        minSilenceDuration: 500
      },
      interrupt: {
        enable: true
      }
    },
    nlu: {
      enable: true
    },
    tts: {
      enable: true,
      textFilters: ['filter_markdown', 'filter_emoji'],
      voices: {
        zh: {
          voiceId: '4',
          speed: 5,
          pitch: 5,
          volume: 5,
          audioConfig: {
            audioEncoding: 'opus-wb',
            sampleRate: 16000,
            bitDepth: 16,
            channels: 1
          }
        }
      }
    }
  });

  // 5. 发送消息
  await client.beginSend();
  await client.sendText('你好，介绍一下你自己');

  // 等待响应...
  await new Promise(resolve => {
    client.on('event.cid_end', () => resolve());
  });

  // 6. 断开连接
  client.disconnect();
}

main().catch(console.error);
```



### 2. TypeScript 集成流程
```typescript
import { AIChainClient, SessionConfig } from '@aichain/sdk';

async function main() {
  const client = new AIChainClient({
    appId: process.env.APP_ID!,
    appKey: process.env.APP_KEY!,
    host: process.env.HOST!,
    sn: process.env.SN!
  });

  client.on('nlu.answer', (cid: string, result, isLast: boolean) => {
    process.stdout.write(result.answer);
  });

  await client.connect();
  await client.setConfig({
    nlu: { enable: true }
  });

  await client.beginSend();
  await client.sendText('你好');
}

main().catch(console.error);
```

---

## 最佳实践
### 1. 错误处理和重试
```javascript
async function connectWithRetry(client, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.connect();
      return;
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
  throw new Error('连接失败');
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
| 10020  | STT 错误           | 检查音频格式和配置       |
| 10021  | NLU 错误           | 检查输入内容             |
| 10022  | TTS 错误           | 检查 TTS 配置            |


---

## 常见问题
### Q1: 如何在浏览器中使用 SDK？
**A:** SDK 支持浏览器环境，使用 ES Module 导入即可。

### Q2: 如何实现语音打断？
**A:** 启用 interrupt 配置，并监听 `event.interrupted` 事件。

### Q3: 如何实现多轮对话？
**A:** 启用 `multiTurnEnabled` 并使用 `beginSend()` 管理对话轮次。

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-23  
**SDK 版本**: 0.1.10

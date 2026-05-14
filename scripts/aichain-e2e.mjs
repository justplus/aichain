#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const item = process.argv[i];
  if (item.startsWith("--")) {
    const [key, inlineValue] = item.slice(2).split("=", 2);
    const next = process.argv[i + 1];
    if (inlineValue !== undefined) args.set(key, inlineValue);
    else if (next && !next.startsWith("--")) {
      args.set(key, next);
      i += 1;
    } else args.set(key, "true");
  }
}

const mode = args.get("mode") || "self-check";
const profile = loadProfile();
const fixtures = loadFixtures();

if (mode === "self-check") {
  validateProfile(profile);
  validateFixtures(fixtures);
  console.log(JSON.stringify({ ok: true, mode, profile, fixtures: fixtureSummary(fixtures) }, null, 2));
} else if (mode === "webapi") {
  await runWebApi(profile, fixtures);
} else if (mode === "sdk-js") {
  await runJsSdk(profile, fixtures);
} else {
  fail(`Unsupported mode: ${mode}`);
}

function loadProfile() {
  const fromFile = process.env.AICHAIN_PROFILE_FILE;
  if (fromFile) return JSON.parse(fs.readFileSync(path.resolve(fromFile), "utf8"));
  if (process.env.AICHAIN_PROFILE) return JSON.parse(process.env.AICHAIN_PROFILE);
  return {
    region: { code: process.env.AICHAIN_REGION || "cn", endpoint: process.env.AICHAIN_ENDPOINT || null },
    integration: mode === "sdk-js" ? "js_sdk" : "webapi",
    modelId: process.env.AICHAIN_MODEL_ID || "b16924f42ffe4fd895d4ba4778278bc3",
    capabilities: { asr: false, nlu: true, tts: false, image: false },
    asr: { language: null, duplex: null, vad: null },
    interruption: "none",
    audio: { input: null, output: null, notes: null },
    tts: { chunk: null },
    runtime: {
      appIdEnv: "AICHAIN_APP_ID",
      appKeyEnv: "AICHAIN_APP_KEY",
      endpointEnv: "AICHAIN_ENDPOINT",
      snEnv: "AICHAIN_SN",
    },
    android: {
      language: null,
      ui: null,
      minSdk: null,
      targetSdk: null,
      credentialStrategy: null,
      testStrategy: null,
    },
  };
}

function loadFixtures() {
  return {
    textZh: readText("assets/text/sample_zh.txt"),
    textEn: readText("assets/text/sample_en.txt"),
    zhAudio: readBytes("assets/audio/zh_16k_pcm.wav"),
    enAudio: readBytes("assets/audio/en_16k_pcm.wav"),
    image: readBytes("assets/image/apple.png"),
    imageQuestion: readText("assets/image/apple_question_zh.txt").trim(),
    imageExpected: readText("assets/image/apple_expected_zh.txt").trim(),
  };
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readBytes(relativePath) {
  return fs.readFileSync(path.join(root, relativePath));
}

function validateProfile(value) {
  const missing = [];
  if (!value || typeof value !== "object") missing.push("profile");
  if (!value?.region?.code) missing.push("region.code");
  if (!value?.integration) missing.push("integration");
  if (!value?.modelId) missing.push("modelId");
  for (const key of ["asr", "nlu", "tts", "image"]) {
    if (typeof value?.capabilities?.[key] !== "boolean") missing.push(`capabilities.${key}`);
  }
  if (!value?.runtime?.appIdEnv) missing.push("runtime.appIdEnv");
  if (!value?.runtime?.appKeyEnv && !value?.runtime?.apiKeyEnv) missing.push("runtime.appKeyEnv");
  if (!value?.runtime?.endpointEnv) missing.push("runtime.endpointEnv");
  if (missing.length) fail(`Invalid AIChainProfile. Missing: ${missing.join(", ")}`);
}

function validateFixtures(value) {
  const checks = [
    ["textZh", value.textZh.length > 0],
    ["textEn", value.textEn.length > 0],
    ["zhAudio", isWav(value.zhAudio)],
    ["enAudio", isWav(value.enAudio)],
    ["image", value.image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
    ["imageQuestion", value.imageQuestion.length > 0],
    ["imageExpected", value.imageExpected.length > 0],
  ];
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  if (failed.length) fail(`Invalid bundled fixtures: ${failed.join(", ")}`);
}

function isWav(buffer) {
  return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WAVE";
}

function fixtureSummary(value) {
  return {
    textZhBytes: Buffer.byteLength(value.textZh),
    textEnBytes: Buffer.byteLength(value.textEn),
    zhAudioBytes: value.zhAudio.length,
    enAudioBytes: value.enAudio.length,
    imageBytes: value.image.length,
    imageQuestion: value.imageQuestion,
    imageExpected: value.imageExpected,
  };
}

function requireRuntime(profileValue) {
  const endpointEnv = profileValue.runtime.endpointEnv;
  const appIdEnv = profileValue.runtime.appIdEnv;
  const appKeyEnv = profileValue.runtime.appKeyEnv || profileValue.runtime.apiKeyEnv || "AICHAIN_APP_KEY";
  const fallbackAppKeyEnv = appKeyEnv === "AICHAIN_API_KEY" ? "AICHAIN_APP_KEY" : "AICHAIN_API_KEY";
  const endpoint = process.env[endpointEnv] || resolveEndpoint(profileValue.region?.code);
  const missing = [];
  if (!endpoint) missing.push(`${endpointEnv} or mapped AICHAIN_REGION`);
  if (!process.env[appIdEnv]) missing.push(appIdEnv);
  if (!process.env[appKeyEnv] && !process.env[fallbackAppKeyEnv]) missing.push(`${appKeyEnv} or ${fallbackAppKeyEnv}`);
  if (missing.length) fail(`Missing required environment variables: ${missing.join(", ")}`);
  return {
    endpoint,
    appId: process.env[appIdEnv],
    appKey: process.env[appKeyEnv] || process.env[fallbackAppKeyEnv],
    userId: process.env.AICHAIN_USER_ID,
    sn: process.env.AICHAIN_SN || process.env.AICHAIN_DEVICE_ID || "codex-smoke-001",
    scene: process.env.AICHAIN_SCENE || "main",
  };
}

function resolveEndpoint(regionCode) {
  const endpoints = {
    cn: "wss://aichain-sh.xfyun.cn",
    shanghai: "wss://aichain-sh.xfyun.cn",
    us: "wss://aichain-us.iflyoversea.com",
    rus: "wss://aichain-rus.iflyoversea.com",
  };
  return endpoints[String(regionCode || "cn").toLowerCase()] || null;
}

async function runWebApi(profileValue, fixtureValue) {
  validateProfile(profileValue);
  validateFixtures(fixtureValue);
  const runtime = requireRuntime(profileValue);
  if (!globalThis.WebSocket) fail("WebAPI mode requires Node.js with global WebSocket support.");

  const url = buildAiChainUrl(runtime);
  const transcript = [];
  let sid = null;
  let configed = false;
  const ws = new WebSocket(url);

  const timeout = Number(process.env.AICHAIN_TIMEOUT_MS || 30000);
  const done = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${timeout}ms`)), timeout);
    ws.addEventListener("open", () => {
      transcript.push("[open]");
    });
    ws.addEventListener("message", (event) => {
      const text = String(event.data);
      transcript.push(text);
      console.log(text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return;
      }

      if (data.type === "session.created") {
        sid = data.sid;
        ws.send(JSON.stringify({ type: "session.config", sid, config: buildSessionConfig(profileValue) }));
        return;
      }

      if (data.type === "session.configed") {
        configed = true;
        const cid = buildCid(runtime.appId);
        for (const message of buildConversationMessages(profileValue, fixtureValue, sid, cid)) {
          ws.send(JSON.stringify(message));
        }
        return;
      }

      if (data.type === "session.error") {
        clearTimeout(timer);
        ws.close();
        reject(new Error(`AIChain session.error: ${JSON.stringify(data.error || data)}`));
        return;
      }

      if (data.type === "event.cid_end") {
        clearTimeout(timer);
        ws.close();
        resolve();
      }
    });
    ws.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error(`WebSocket error while connecting to ${redactUrl(url)}`));
    });
    ws.addEventListener("close", () => {
      clearTimeout(timer);
      if (!transcript.length) reject(new Error("Connection closed before any response"));
      else if (!sid) reject(new Error("Connection closed before session.created"));
      else if (!configed) reject(new Error("Connection closed before session.configed"));
    });
  });

  await done;
  validateServiceOutput(profileValue, transcript.join("\n"), fixtureValue);
}

function buildAiChainUrl(runtime) {
  const protocol = runtime.endpoint.toLowerCase().startsWith("ws://") ? "ws" : "wss";
  const host = runtime.endpoint.replace(/^wss?:\/\//i, "").split("/")[0];
  const curtime = Math.floor(Date.now() / 1000);
  const checksum = crypto.createHash("sha256").update(`${runtime.appKey}${curtime}`, "utf8").digest("hex");
  const params = new URLSearchParams({
    curtime: String(curtime),
    checksum,
    sn: runtime.sn,
    scene: runtime.scene,
  });
  return `${protocol}://${host}/v1/chat/${runtime.appId}?${params.toString()}`;
}

function redactUrl(url) {
  return url.replace(/checksum=[^&]+/g, "checksum=<redacted>");
}

function buildSessionConfig(profileValue) {
  const asrEnabled = Boolean(profileValue.capabilities.asr);
  const nluEnabled = Boolean(profileValue.capabilities.nlu);
  const ttsEnabled = Boolean(profileValue.capabilities.tts);
  return {
    mode: profileValue.asr?.duplex === "full" ? "full_duplex" : "half_duplex",
    simplifiedResponse: true,
    multiTurnEnabled: true,
    stt: asrEnabled
      ? {
          enable: true,
          language: profileValue.asr.language || "zh",
          audioConfig: buildAudioConfig(profileValue.audio?.input),
          vad: profileValue.asr.vad && profileValue.asr.vad !== "none"
            ? {
                enable: true,
                minSilenceDuration: profileValue.asr.vad === "acoustic_semantic" ? 300 : 600,
              }
            : { enable: false },
          turnDetection: profileValue.asr.vad === "acoustic_semantic"
            ? { enable: true, minEndpointingDelay: 250 }
            : { enable: false },
          interrupt: { enable: profileValue.interruption !== "none" },
        }
      : { enable: false },
    nlu: nluEnabled
      ? {
          enable: true,
          streamingFlushInterval: 300,
          tools: {
            model: {
              modelId: profileValue.modelId,
              maxTokens: 1000,
              temperature: 0.7,
              topP: 0.9,
            },
          },
        }
      : { enable: false },
    tts: ttsEnabled
      ? {
          enable: true,
          audioConfig: buildAudioConfig(profileValue.audio?.output),
          extraConfig: profileValue.tts?.chunk === null ? undefined : { chunk_tts: profileValue.tts?.chunk },
        }
      : { enable: false },
  };
}

function buildAudioConfig(codec) {
  if (!codec) return undefined;
  return {
    audioEncoding: codec === "pcm" ? "raw" : codec,
    format: "plain",
    sampleRate: 16000,
    bitDepth: 16,
    channels: 1,
  };
}

function buildConversationMessages(profileValue, fixtureValue, sid, cid) {
  const items = [];
  if (profileValue.capabilities.nlu || profileValue.capabilities.tts) {
    items.push({ type: "text", data: fixtureValue.textZh });
  }
  if (profileValue.capabilities.asr) {
    const audio = selectAudio(profileValue, fixtureValue);
    items.push({ type: "audio", data: audio.toString("base64") });
  }
  if (profileValue.capabilities.image) {
    items.push({ type: "text", data: fixtureValue.imageQuestion });
    items.push({ type: "image", data: fixtureValue.image.toString("base64"), extend: { mimeType: "image/png" } });
  }
  return [{ type: "conversation.user.append", sid, cid, items, endFlag: true }];
}

function buildCid(appId) {
  const now = new Date();
  const ts = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ].join("");
  return `${appId}@${ts}-${crypto.randomBytes(3).toString("hex")}`;
}

async function runJsSdk(profileValue, fixtureValue) {
  validateProfile(profileValue);
  validateFixtures(fixtureValue);
  const runtime = requireRuntime(profileValue);
  const packageName = process.env.AICHAIN_JS_SDK_PACKAGE;
  if (!packageName) fail("Missing AICHAIN_JS_SDK_PACKAGE for generic JS SDK mode.");

  const sdk = await import(packageName);
  const Client = sdk.default || sdk.AIChainClient || sdk.Client;
  if (!Client) fail(`Cannot find default export, AIChainClient, or Client in ${packageName}`);

  const client = new Client({
    endpoint: runtime.endpoint,
    appId: runtime.appId,
    appKey: runtime.appKey,
    userId: runtime.userId,
    sn: runtime.sn,
    modelId: profileValue.modelId,
    profile: profileValue,
  });

  const results = [];
  if (profileValue.capabilities.nlu || profileValue.capabilities.tts) {
    results.push(await callFirst(client, ["sendText", "chat"], fixtureValue.textZh, { text: fixtureValue.textZh, profile: profileValue }));
  }
  if (profileValue.capabilities.asr) {
    results.push(await callFirst(client, ["sendAudio", "recognize"], selectAudio(profileValue, fixtureValue), { audio: selectAudio(profileValue, fixtureValue), profile: profileValue }));
  }
  if (profileValue.capabilities.image) {
    results.push(await callFirst(client, ["sendImage", "chat"], fixtureValue.image, { image: fixtureValue.image, prompt: fixtureValue.imageQuestion, mimeType: "image/png", profile: profileValue }));
  }

  const output = JSON.stringify(results, null, 2);
  console.log(output);
  validateServiceOutput(profileValue, output, fixtureValue);
}

async function callFirst(client, names, positional, objectArg) {
  for (const name of names) {
    if (typeof client[name] === "function") {
      return client[name].length <= 1 ? client[name](objectArg) : client[name](positional, objectArg);
    }
  }
  fail(`SDK client must expose one of: ${names.join(", ")}`);
}

function selectAudio(profileValue, fixtureValue) {
  if (profileValue.asr?.language === "en") return fixtureValue.enAudio;
  return fixtureValue.zhAudio;
}

function validateServiceOutput(profileValue, output, fixtureValue) {
  const lower = output.toLowerCase();
  const failures = [];
  if (profileValue.capabilities.asr) {
    const expected = profileValue.asr?.language === "en" ? ["hello", "weather"] : ["北京", "天气"];
    for (const term of expected) {
      if (!lower.includes(term.toLowerCase())) failures.push(`ASR output missing ${term}`);
    }
  }
  if (profileValue.capabilities.nlu && output.trim().length === 0) failures.push("NLU output is empty");
  if (profileValue.capabilities.tts && !/audio|tts|pcm|opus|wav|base64/i.test(output)) failures.push("TTS output did not mention or contain audio");
  if (profileValue.capabilities.image && !lower.includes(fixtureValue.imageExpected.toLowerCase())) {
    failures.push(`Image output missing ${fixtureValue.imageExpected}`);
  }
  if (failures.length) fail(`AIChain E2E validation failed:\n- ${failures.join("\n- ")}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

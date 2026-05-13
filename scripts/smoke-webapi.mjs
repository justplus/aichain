#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");

const required = ["AICHAIN_ENDPOINT", "AICHAIN_APP_ID", "AICHAIN_API_KEY"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(2);
}

const profile = process.env.AICHAIN_PROFILE
  ? JSON.parse(process.env.AICHAIN_PROFILE)
  : {
      region: process.env.AICHAIN_REGION || "cn",
      modelId: process.env.AICHAIN_MODEL_ID || "b16924f42ffe4fd895d4ba4778278bc3",
        capabilities: "nlu",
      language: null,
      duplex: null,
      vad: null,
        interrupt: "none",
        image_understanding: false,
        chunk_tts: process.env.AICHAIN_CHUNK_TTS
          ? process.env.AICHAIN_CHUNK_TTS === "true"
          : null,
        audio: { input: "pcm", output: "pcm" },
      integration: "webapi",
    };

const text = fs.readFileSync(
  path.join(skillRoot, "assets", "text", "sample.txt"),
  "utf8",
);
const zhExpected = fs.readFileSync(
  path.join(skillRoot, "assets", "audio", "zh_expected.txt"),
  "utf8",
).trim();
const enExpected = fs.readFileSync(
  path.join(skillRoot, "assets", "audio", "en_expected.txt"),
  "utf8",
).trim();
const imageQuestion = fs.readFileSync(
  path.join(skillRoot, "assets", "image", "expected_question.txt"),
  "utf8",
).trim();
const imageExpected = fs.readFileSync(
  path.join(skillRoot, "assets", "image", "expected_answer_contains.txt"),
  "utf8",
).trim();
const sttCases = {
  zh: {
    id: "zh_stt",
    file: "zh_sample_pcm.raw",
    codec: "pcm",
    expected: ["北京", "天气"],
    expectedText: zhExpected,
  },
  en: {
    id: "en_stt",
    file: "en_sample_wav.wav",
    codec: "wav",
    expected: ["hello", "introduce", "yourself", "briefly"],
    expectedText: enExpected,
  },
};
const imageCase = {
  question: imageQuestion,
  file: "sample.png",
  mimeType: "image/png",
  expected: [imageExpected],
};

const endpoint = process.env.AICHAIN_ENDPOINT;
const timeoutMs = Number(process.env.AICHAIN_TIMEOUT_MS || 30000);
const WebSocketImpl = globalThis.WebSocket;

if (!WebSocketImpl) {
  console.error("This smoke test requires a Node.js runtime with global WebSocket support. Use Node.js 22+.");
  process.exit(2);
}

function buildMessages() {
  const messages = [
    {
      event: "session.config",
      appId: process.env.AICHAIN_APP_ID,
      apiKey: process.env.AICHAIN_API_KEY,
      userId: process.env.AICHAIN_USER_ID,
      deviceId: process.env.AICHAIN_DEVICE_ID,
      profile,
      modelId: profile.modelId,
      chunk_tts: profile.chunk_tts,
    },
    {
      event: "conversation.input",
      type: "text",
      text,
    },
  ];

  if (profile.capabilities.includes("stt")) {
    for (const testCase of selectedSttCases(profile)) {
      const audio = fs.readFileSync(path.join(skillRoot, "assets", "audio", testCase.file));
      messages.push({
        event: "conversation.audio",
        caseId: testCase.id,
        codec: testCase.codec,
        expectedText: testCase.expectedText,
        data: audio.toString("base64"),
      });
      messages.push({ event: "conversation.end_input", caseId: testCase.id });
    }
  }

  if (profile.image_understanding) {
    const image = fs.readFileSync(path.join(skillRoot, "assets", "image", imageCase.file));
    messages.push({
      event: "conversation.image",
      question: imageCase.question,
      mimeType: imageCase.mimeType,
      expectedText: imageCase.expected.join(" "),
      data: image.toString("base64"),
    });
  }

  return messages;
}

function selectedSttCases(currentProfile) {
  if (currentProfile.language === "zh") return [sttCases.zh];
  if (currentProfile.language === "en") return [sttCases.en];
  return [sttCases.zh, sttCases.en];
}

function normalize(value) {
  return value.toString().toLowerCase();
}

function validateExpected(responseText) {
  const failures = [];
  const normalized = normalize(responseText);

  if (profile.capabilities.includes("stt")) {
    for (const testCase of selectedSttCases(profile)) {
      const missing = testCase.expected.filter((term) => !normalized.includes(normalize(term)));
      if (missing.length) {
        failures.push(`${testCase.id} missing expected terms: ${missing.join(", ")}`);
      }
    }
  }

  if (profile.image_understanding) {
    const missing = imageCase.expected.filter((term) => !normalized.includes(normalize(term)));
    if (missing.length) {
      failures.push(`image understanding missing expected terms: ${missing.join(", ")}`);
    }
  }

  return failures;
}

const ws = new WebSocketImpl(endpoint, {
  headers: {
    "X-AIChain-AppId": process.env.AICHAIN_APP_ID,
    "X-AIChain-ApiKey": process.env.AICHAIN_API_KEY,
  },
});

let received = 0;
let closed = false;
let responseText = "";

const timer = setTimeout(() => {
  if (!closed) {
    console.error(`Timed out after ${timeoutMs}ms waiting for AIChain response`);
    ws.close();
    process.exitCode = 1;
  }
}, timeoutMs);

ws.on("open", () => {
  for (const message of buildMessages()) {
    ws.send(JSON.stringify(message));
  }
});

ws.on("message", (data) => {
  received += 1;
  const textData = data.toString();
  responseText += `\n${textData}`;
  console.log(textData);

  if (/final|complete|result|audio|tts|nlu|stt/i.test(textData)) {
    closed = true;
    clearTimeout(timer);
    ws.close();
  }
});

ws.on("error", (error) => {
  clearTimeout(timer);
  console.error(error.message);
  process.exitCode = 1;
});

ws.on("close", () => {
  clearTimeout(timer);
  if (!received && !process.exitCode) {
    console.error("Connection closed before any AIChain response was received");
    process.exitCode = 1;
    return;
  }

  if (!process.exitCode) {
    const failures = validateExpected(responseText);
    if (failures.length) {
      console.error(`AIChain smoke validation failed:\n- ${failures.join("\n- ")}`);
      process.exitCode = 1;
    }
  }
});

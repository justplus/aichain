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

const sdkPackage = process.env.AICHAIN_JS_SDK_PACKAGE;
if (!sdkPackage) {
  console.error("Missing AICHAIN_JS_SDK_PACKAGE. Set it to the official AIChain JS SDK package name from Yuque.");
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
      integration: "js_sdk",
    };

const text = fs.readFileSync(path.join(skillRoot, "assets", "text", "sample.txt"), "utf8");
const imageQuestion = fs.readFileSync(
  path.join(skillRoot, "assets", "image", "expected_question.txt"),
  "utf8",
).trim();
const imageExpected = fs.readFileSync(
  path.join(skillRoot, "assets", "image", "expected_answer_contains.txt"),
  "utf8",
).trim();

const sdk = await import(sdkPackage);
const Client = sdk.default || sdk.AIChainClient || sdk.Client;

if (!Client) {
  console.error(`Could not find default export, AIChainClient, or Client in ${sdkPackage}`);
  process.exit(1);
}

const client = new Client({
  endpoint: process.env.AICHAIN_ENDPOINT,
  appId: process.env.AICHAIN_APP_ID,
  apiKey: process.env.AICHAIN_API_KEY,
  userId: process.env.AICHAIN_USER_ID,
  deviceId: process.env.AICHAIN_DEVICE_ID,
  modelId: profile.modelId,
  chunk_tts: profile.chunk_tts,
  profile,
});

if (typeof client.sendText !== "function" && typeof client.chat !== "function") {
  console.error("SDK client must expose sendText() or chat(). Align this harness with the official JS SDK method names.");
  process.exit(1);
}

const result = typeof client.sendText === "function"
  ? await client.sendText(text)
  : await client.chat({ text, profile });

const results = [result];

if (profile.image_understanding && typeof client.chat === "function") {
  const image = fs.readFileSync(path.join(skillRoot, "assets", "image", "sample.png"));
  results.push(await client.chat({
    text: imageQuestion,
    image,
    mimeType: "image/png",
    profile,
  }));
}

const output = JSON.stringify(results, null, 2);
console.log(output);

if (profile.image_understanding && !output.includes(imageExpected)) {
  console.error(`Image understanding validation failed: expected answer to contain ${imageExpected}`);
  process.exit(1);
}

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const PACKAGES_DIR = path.join(ROOT, "packages");

const platformAliases = {
  chatgpt: "chatgpt-mobile",
  mobile: "chatgpt-mobile",
  claude: "claude-mobile",
  kimi: "kimi-doubao",
  doubao: "kimi-doubao",
  codex: "codex",
  cursor: "cursor",
  notion: "notion-feishu",
  feishu: "notion-feishu",
};

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "list") {
    listPacks();
    return;
  }

  if (command === "platforms") {
    listPlatforms();
    return;
  }

  if (command === "show") {
    showPack(args[1]);
    return;
  }

  if (command === "init") {
    initPack(args.slice(1));
    return;
  }

  fail(`Unknown command: ${command}`);
}

function printHelp() {
  console.log(`RecoWork CLI

Usage:
  rw list
  rw platforms
  rw show <pack>
  rw init <pack> --platform <platform> <target>

Examples:
  rw init general --platform chatgpt-mobile ./my-ai-workflow
  rw init project --platform codex .
  rw init learning -p notion ./langchain-study
`);
}

function listPacks() {
  for (const pack of getPacks()) {
    console.log(`${pack.id}\n  ${pack.name}\n  ${pack.description}\n`);
  }
}

function listPlatforms() {
  const platforms = new Set();
  for (const pack of getPacks()) {
    for (const platform of pack.supported_platforms || []) {
      platforms.add(platform);
    }
  }
  console.log([...platforms].sort().join("\n"));
}

function showPack(packRef) {
  const pack = resolvePack(packRef);
  console.log(`${pack.name}

id: ${pack.id}
description: ${pack.description}
default_platform: ${pack.default_platform}
supported_platforms:
${(pack.supported_platforms || []).map((platform) => `  - ${platform}`).join("\n")}
aliases:
${(pack.aliases || []).map((alias) => `  - ${alias}`).join("\n")}
`);
}

function initPack(args) {
  const packRef = args[0];
  if (!packRef) {
    fail("Missing pack name.");
  }

  const platform = normalizePlatform(readOption(args, "platform", "p"));
  const targetArg = readTarget(args);
  const targetDir = path.resolve(process.cwd(), targetArg || ".");
  const pack = resolvePack(packRef);
  const selectedPlatform = platform || pack.default_platform;

  if (!pack.supported_platforms.includes(selectedPlatform)) {
    fail(`${pack.id} does not support platform: ${selectedPlatform}`);
  }

  const packDir = path.join(PACKAGES_DIR, pack.id);
  const adapterDir = path.join(packDir, "adapters", selectedPlatform);
  if (!fs.existsSync(adapterDir)) {
    fail(`Adapter not found: ${selectedPlatform}`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  copyIfExists(path.join(packDir, "README.md"), path.join(targetDir, "README.md"));
  copyDir(path.join(packDir, "core"), path.join(targetDir, "core"));
  copyDir(adapterDir, targetDir);
  writeManifest(targetDir, pack, selectedPlatform);

  console.log(`Initialized ${pack.id} for ${selectedPlatform}`);
  console.log(`Target: ${targetDir}`);
}

function getPacks() {
  if (!fs.existsSync(PACKAGES_DIR)) {
    fail(`Packages directory not found: ${PACKAGES_DIR}`);
  }

  return fs
    .readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readPack(path.join(PACKAGES_DIR, entry.name)))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function resolvePack(packRef) {
  if (!packRef) {
    fail("Missing pack name.");
  }

  const packs = getPacks();
  const pack = packs.find((item) => {
    return item.id === packRef || (item.aliases || []).includes(packRef);
  });

  if (!pack) {
    fail(`Unknown pack: ${packRef}`);
  }

  return pack;
}

function readPack(packDir) {
  const yamlPath = path.join(packDir, "pack.yaml");
  const source = fs.readFileSync(yamlPath, "utf8");
  return parseSimpleYaml(source);
}

function parseSimpleYaml(source) {
  const result = {};
  let currentList = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentList) {
      result[currentList].push(listItem[1].trim());
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) {
      continue;
    }

    const key = pair[1];
    const value = pair[2].trim();
    if (value) {
      result[key] = value;
      currentList = null;
    } else {
      result[key] = [];
      currentList = key;
    }
  }

  return result;
}

function normalizePlatform(platform) {
  if (!platform) {
    return null;
  }
  return platformAliases[platform] || platform;
}

function readOption(args, longName, shortName) {
  const longIndex = args.indexOf(`--${longName}`);
  if (longIndex >= 0) {
    return args[longIndex + 1];
  }

  const shortIndex = args.indexOf(`-${shortName}`);
  if (shortIndex >= 0) {
    return args[shortIndex + 1];
  }

  return null;
}

function readTarget(args) {
  const skipped = new Set();
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--platform" || args[index] === "-p") {
      skipped.add(index);
      skipped.add(index + 1);
    }
  }

  return args.find((arg, index) => index > 0 && !skipped.has(index));
}

function copyIfExists(from, to) {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    return;
  }

  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const destination = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, destination);
    } else {
      fs.copyFileSync(source, destination);
    }
  }
}

function writeManifest(targetDir, pack, platform) {
  const manifest = {
    tool: "RecoWork",
    pack: pack.id,
    platform,
    generated_at: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(targetDir, "rw-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function fail(message) {
  console.error(`rw: ${message}`);
  process.exit(1);
}

main();

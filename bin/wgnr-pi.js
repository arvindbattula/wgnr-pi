#!/usr/bin/env node
// wgnr-pi CLI entry point
// Allows running via: npx wgnr-pi  or  wgnr-pi
//
// Multi-instance support: each CWD gets a stable port derived from a hash
// of the absolute path, in the range 4815–5814.  You can override with:
//   --port <n>   or   WGPI_PORT=<n>
//   --cwd  <p>   or   WGPI_CWD=<p>

import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "..", "server.js");

// ── Parse --port / --cwd from argv ──────────────────────────────────────
const args = process.argv.slice(2);
let cliPort = null;
let cliCwd = null;
const forwardArgs = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) {
    cliPort = args[++i];
  } else if (args[i] === "--cwd" && args[i + 1]) {
    cliCwd = args[++i];
  } else {
    forwardArgs.push(args[i]);
  }
}

// ── Resolve CWD ──────────────────────────────────────────────────────────
// Priority: --cwd arg > WGPI_CWD env > process.cwd()
const effectiveCwd = resolve(cliCwd || process.env.WGPI_CWD || process.cwd());

// ── Resolve port ─────────────────────────────────────────────────────────
// Priority: --port arg > WGPI_PORT env > stable hash of CWD
function cwdToPort(cwdPath) {
  const BASE = 4815;
  const RANGE = 1000; // ports 4815–5814
  const hash = createHash("sha256").update(cwdPath).digest();
  const offset = ((hash[0] << 8) | hash[1]) % RANGE;
  return BASE + offset;
}

const effectivePort =
  cliPort ||
  process.env.WGPI_PORT ||
  String(cwdToPort(effectiveCwd));

// ── Spawn server ─────────────────────────────────────────────────────────
const child = spawn("node", [serverPath, ...forwardArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    WGPI_CWD: effectiveCwd,
    WGPI_PORT: effectivePort,
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error("Failed to start wgnr-pi:", err.message);
  process.exit(1);
});

process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));

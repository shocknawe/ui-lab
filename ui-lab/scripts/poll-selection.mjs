#!/usr/bin/env node
// poll-selection.mjs — wait for a fresh user selection from a ui-lab viewer.
// Reads state/selected.json and returns only when a record newer than --since is found.
//
// Usage:
//   node poll-selection.mjs --since <epoch-ms> [--data <dir>] [--timeout <seconds>]
//
// Exit codes:
//   0 — selection found, JSON printed to stdout
//   1 — timeout or read error

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = process.argv.slice(2);
function flag(name) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = argv[i + 1];
  return next !== undefined && !next.startsWith('--') ? next : true;
}

const DATA_DIR = flag('data') || path.join(os.homedir(), '.agents', '.ui-lab');
const STATE_FILE = path.join(DATA_DIR, 'state', 'selected.json');
const SINCE = Number(flag('since') || 0);
const TIMEOUT_MS = Number(flag('timeout') || 0) * 1000;
const INTERVAL_MS = 1200;

async function readSelection() {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isFresh(rec) {
  return rec && typeof rec.ts === 'number' && rec.ts > SINCE;
}

async function main() {
  const deadline = TIMEOUT_MS > 0 ? Date.now() + TIMEOUT_MS : Infinity;

  while (true) {
    const rec = await readSelection();
    if (isFresh(rec)) {
      console.log(JSON.stringify(rec));
      process.exit(0);
    }

    if (Date.now() + INTERVAL_MS > deadline) {
      console.error(`Timed out waiting for a selection newer than ${SINCE}.`);
      process.exit(1);
    }

    await new Promise(r => setTimeout(r, INTERVAL_MS));
  }
}

main().catch(err => {
  console.error(String(err));
  process.exit(1);
});

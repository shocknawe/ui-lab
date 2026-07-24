#!/usr/bin/env node
// gallery.mjs — single localhost server for the ui-lab skill.
// Serves one of three viewers (peg-library | prototype | images) and the data
// they render, and records the user's selection to state/selected.json.
// Node built-ins only. See CONTRACT.md for the full data contract.

import http from 'node:http';
import { promises as fs } from 'node:fs';
import fss from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');

// ---- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const MODE = argv[0];
const VALID = ['peg-library', 'prototype', 'images'];
if (!VALID.includes(MODE)) {
  console.error(`Usage: node gallery.mjs <${VALID.join('|')}> [--session <id>] [--data <dir>] [--multi] [--port <n>]`);
  process.exit(1);
}
function flag(name) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && (argv[i + 1] === undefined || !argv[i + 1].startsWith('--')) ? argv[i + 1] : (i !== -1 ? true : undefined);
}
const DATA_DIR = flag('data') || path.join(os.homedir(), '.agents', '.ui-lab');
const SESSION = flag('session');
const MULTI = argv.includes('--multi');
const WANT_PORT = flag('port') ? Number(flag('port')) : 4123;
const WEB_DIR = path.join(SKILL_ROOT, 'web', MODE);
const STATE_DIR = path.join(DATA_DIR, 'state');

// ---- helpers ----------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.avif': 'image/avif', '.ico': 'image/x-icon',
};
const mimeFor = (p) => MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

// Serve a file only if it stays within `root` (path-traversal guard).
async function serveFile(res, root, relPath) {
  const target = path.join(root, relPath);
  if (!target.startsWith(path.resolve(root) + path.sep) && target !== path.resolve(root)) {
    return send(res, 403, 'Forbidden');
  }
  try {
    const data = await fs.readFile(target);
    res.writeHead(200, { 'Content-Type': mimeFor(target), 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    send(res, 404, 'Not found');
  }
}

// Minimal, tolerant frontmatter reader for peg sidecars we author ourselves.
// Values may be an inline JSON array, a quoted string, or a bare string.
function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!mm) continue;
    const key = mm[1];
    let val = mm[2].trim();
    if (val.startsWith('[') || val.startsWith('"')) {
      try { out[key] = JSON.parse(val); continue; } catch { /* fall through */ }
    }
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

async function readJSON(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return fallback; }
}

// ---- data builders ----------------------------------------------------------
async function pegLibraryData() {
  const libDir = path.join(DATA_DIR, 'library');
  const pegs = [];
  let slugs = [];
  try { slugs = (await fs.readdir(libDir, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name); }
  catch { slugs = []; }
  for (const slug of slugs.sort()) {
    const mdPath = path.join(libDir, slug, `${slug}.md`);
    let meta = {};
    try { meta = parseFrontmatter(await fs.readFile(mdPath, 'utf8')); } catch { /* skip */ }
    // find the image file in the slug dir
    let img = null;
    try {
      const files = await fs.readdir(path.join(libDir, slug));
      img = files.find(f => /\.(jpe?g|png|webp|avif|gif)$/i.test(f)) || null;
    } catch { /* none */ }
    pegs.push({
      slug,
      image: img ? `/media/library/${encodeURIComponent(slug)}/${encodeURIComponent(img)}` : null,
      design_family: meta.design_family || 'untagged',
      keywords: Array.isArray(meta.keywords) ? meta.keywords : (meta.keywords ? [meta.keywords] : []),
      image_prompt: meta.image_prompt || '',
      copy_brief: meta.copy_brief || '',
    });
  }
  return { mode: 'peg-library', pegs };
}

async function prototypeData() {
  if (!SESSION) return { mode: 'prototype', session: null, brief: '', styles: [], prototypes: [] };
  const sessDir = path.join(DATA_DIR, 'prototypes', SESSION);
  const meta = await readJSON(path.join(sessDir, 'data.json'), { brief: '', styles: [], prototypes: [] });
  const prototypes = (meta.prototypes || []).map(p => ({
    id: p.id, style: p.style, engine: p.engine,
    src: p.src || `/proto/${encodeURIComponent(p.file)}`,
  }));
  return { mode: 'prototype', session: SESSION, brief: meta.brief || '', styles: meta.styles || [], prototypes };
}

async function imagesData() {
  if (!SESSION) return { mode: 'images', prototype: '', multiSelect: MULTI, images: [] };
  const sessDir = path.join(DATA_DIR, 'images', SESSION);
  const meta = await readJSON(path.join(sessDir, 'data.json'), { prototype: '', images: [] });
  const images = (meta.images || []).map(im => ({
    id: im.id, label: im.label || im.id,
    src: im.src || `/media/images/${encodeURIComponent(SESSION)}/${encodeURIComponent(im.file)}`,
  }));
  return {
    mode: 'images',
    prototype: meta.prototype || '',
    multiSelect: meta.multiSelect ?? MULTI,
    images,
  };
}

async function dataForMode() {
  if (MODE === 'peg-library') return pegLibraryData();
  if (MODE === 'prototype') return prototypeData();
  return imagesData();
}

async function writeSelection(body) {
  await fs.mkdir(STATE_DIR, { recursive: true });
  const record = { ...body, ts: Date.now() };
  await fs.writeFile(path.join(STATE_DIR, 'selected.json'), JSON.stringify(record, null, 2));
  return record;
}

// ---- request handler --------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  if (req.method === 'POST' && (pathname === '/select' || pathname === '/apply')) {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', async () => {
      try {
        const body = raw ? JSON.parse(raw) : {};
        const rec = await writeSelection(body);
        send(res, 200, JSON.stringify({ ok: true, saved: rec }), 'application/json; charset=utf-8');
      } catch (e) {
        send(res, 400, JSON.stringify({ ok: false, error: String(e) }), 'application/json; charset=utf-8');
      }
    });
    return;
  }

  if (req.method !== 'GET') return send(res, 405, 'Method not allowed');

  if (pathname === '/data.json') {
    const data = await dataForMode();
    return send(res, 200, JSON.stringify(data), 'application/json; charset=utf-8');
  }
  if (pathname.startsWith('/media/')) {
    return serveFile(res, DATA_DIR, pathname.slice('/media/'.length));
  }
  if (pathname.startsWith('/proto/')) {
    if (!SESSION) return send(res, 404, 'No session');
    return serveFile(res, path.join(DATA_DIR, 'prototypes', SESSION), pathname.slice('/proto/'.length));
  }
  // static assets from the mode's web folder
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  return serveFile(res, WEB_DIR, rel);
});

// ---- listen with free-port fallback ----------------------------------------
// Register handlers once (persistent), not per-attempt: passing a callback to
// server.listen() adds a one-shot 'listening' listener on every retry, and they
// ALL fire once a port finally binds — printing a stale URL for each skipped
// port. A single 'listening' handler that reads the actually-bound port avoids
// that and guarantees exactly one UI_LAB_URL line.
let attemptsLeft = 40;
let nextPort = WANT_PORT;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && attemptsLeft-- > 0) { server.listen(nextPort++, '127.0.0.1'); }
  else { console.error(err); process.exit(1); }
});
server.on('listening', () => {
  const { port } = server.address();
  console.log(`UI_LAB_URL=http://localhost:${port}`);
  console.error(`[ui-lab] ${MODE} viewer serving ${WEB_DIR}${SESSION ? ` (session ${SESSION})` : ''}`);
});
// sanity: web dir must exist
if (!fss.existsSync(WEB_DIR)) { console.error(`Missing web dir: ${WEB_DIR}`); process.exit(1); }
server.listen(nextPort++, '127.0.0.1');

#!/usr/bin/env node
// library.mjs — add a peg to the taste library.
// Claude does the vision analysis, then calls this with the resulting metadata.
// It copies the image into ~/.agents/.zuhlke-design/library/<slug>/ and writes
// a <slug>.md sidecar whose frontmatter gallery.mjs reads back.
//
// Usage:
//   node library.mjs add --image <path> --meta <meta.json | ->  [--data <dir>]
//
// meta json shape:
//   { "slug": "vast-quiet-alps", "design_family": "vast-quiet",
//     "keywords": ["minimalist","cinematic"], "image_prompt": "...",
//     "copy_brief": "...", "notes": "optional prose" }

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = process.argv.slice(2);
if (argv[0] !== 'add') {
  console.error('Usage: node library.mjs add --image <path> --meta <meta.json|-> [--data <dir>]');
  process.exit(1);
}
function opt(name) { const i = argv.indexOf(`--${name}`); return i !== -1 ? argv[i + 1] : undefined; }

const imagePath = opt('image');
const metaArg = opt('meta');
const DATA_DIR = opt('data') || path.join(os.homedir(), '.agents', '.zuhlke-design');

if (!imagePath || !metaArg) {
  console.error('Both --image and --meta are required.');
  process.exit(1);
}

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'peg';
}

async function readMeta() {
  const raw = metaArg === '-' ? await readStdin() : await fs.readFile(metaArg, 'utf8');
  return JSON.parse(raw);
}
function readStdin() {
  return new Promise((resolve, reject) => {
    let d = ''; process.stdin.setEncoding('utf8');
    process.stdin.on('data', c => d += c);
    process.stdin.on('end', () => resolve(d));
    process.stdin.on('error', reject);
  });
}

const main = async () => {
  const meta = await readMeta();
  const slug = slugify(meta.slug || meta.design_family || path.parse(imagePath).name);
  const destDir = path.join(DATA_DIR, 'library', slug);
  await fs.mkdir(destDir, { recursive: true });

  // copy image, preserving extension
  const ext = (path.extname(imagePath) || '.jpg').toLowerCase();
  const imgName = `image${ext}`;
  await fs.copyFile(imagePath, path.join(destDir, imgName));

  const keywords = Array.isArray(meta.keywords) ? meta.keywords : [];
  const fm = [
    '---',
    `slug: ${JSON.stringify(slug)}`,
    `design_family: ${JSON.stringify(meta.design_family || 'untagged')}`,
    `keywords: ${JSON.stringify(keywords)}`,
    `image_prompt: ${JSON.stringify(meta.image_prompt || '')}`,
    `copy_brief: ${JSON.stringify(meta.copy_brief || '')}`,
    '---',
    '',
    `# ${meta.design_family || slug}`,
    '',
    meta.notes ? String(meta.notes) : '',
    '',
    `**Image prompt:** ${meta.image_prompt || ''}`,
    '',
    `**Copy brief:** ${meta.copy_brief || ''}`,
    '',
  ].join('\n');

  await fs.writeFile(path.join(destDir, `${slug}.md`), fm);
  console.log(JSON.stringify({ ok: true, slug, dir: destDir, image: imgName }));
};

main().catch(e => { console.error(String(e)); process.exit(1); });

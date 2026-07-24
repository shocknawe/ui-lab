/* Tweak Studio — live, real-time design controls for one prototype.
   - Fetches /data.json (mode:"tweak") for the prototype src.
   - Loads it in an iframe; every control mutates it LIVE by (re)injecting a
     single <style id="ui-lab-tweaks"> into the iframe document.
   - Whole-page scope. Two override mechanisms combined:
       (a) candidate CSS-variable names (prototypes name tokens inconsistently)
       (b) element-level !important overrides (guaranteed regardless of naming)
   - "Apply & save" POSTs the generated CSS to /apply; the server bakes it into
     a saved copy of the prototype HTML.  No alert/confirm/prompt anywhere. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  const frame      = $('#frame');
  const stageEmpty = $('#empty');
  const emptyMsg   = $('#empty-msg');
  const controlsEl = $('#controls');
  const dock       = $('#dock');
  const reopenBtn  = $('#reopen');
  const nameEl     = $('#proto-name');
  const toastEl    = $('#toast');

  let PROTO = null;   // { id, style, engine, src, ... }

  // ---- font stacks (system-available only; no external fonts) ----------------
  const FONTS = {
    '':          'Untouched',
    system:      "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    grotesque:   "'Helvetica Neue', Helvetica, Arial, sans-serif",
    geometric:   "'Avenir Next', Avenir, 'Century Gothic', Futura, system-ui, sans-serif",
    humanist:    "Optima, 'Gill Sans', 'Segoe UI', system-ui, sans-serif",
    rounded:     "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Quicksand, system-ui, sans-serif",
    transitional:"Georgia, 'Times New Roman', Times, serif",
    oldstyle:    "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
    slab:        "Rockwell, 'Roboto Slab', 'Courier New', Georgia, serif",
    modern:      "Didot, 'Bodoni MT', 'Playfair Display', Georgia, serif",
    mono:        "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  };
  const FONT_LABELS = {
    '': 'Untouched', system: 'System UI', grotesque: 'Grotesque', geometric: 'Geometric sans',
    humanist: 'Humanist sans', rounded: 'Rounded', transitional: 'Transitional serif',
    oldstyle: 'Old-style serif', slab: 'Slab serif', modern: 'Modern serif', mono: 'Monospace',
  };

  // ---- palette presets (accent / bg / text / surface) ------------------------
  const PALETTES = [
    { name: 'Noir',      accent: '#10b981', bg: '#0a0a0a', text: '#e8e8e8', surface: '#141414' },
    { name: 'Paper',     accent: '#c8102e', bg: '#faf9f6', text: '#1a1a1a', surface: '#ffffff' },
    { name: 'Blueprint', accent: '#4da3ff', bg: '#0b1e3f', text: '#dce6f5', surface: '#12274d' },
    { name: 'Sunset',    accent: '#ff6b4a', bg: '#1a1114', text: '#f5e6dc', surface: '#241619' },
    { name: 'Mint',      accent: '#0f9d6b', bg: '#f2f7f4', text: '#10231b', surface: '#ffffff' },
    { name: 'Mono',      accent: '#111111', bg: '#ffffff', text: '#111111', surface: '#f4f4f4' },
    { name: 'Acid',      accent: '#d4ff00', bg: '#0d0d0d', text: '#f0f0f0', surface: '#171717' },
    { name: 'Royal',     accent: '#a855f7', bg: '#12091f', text: '#ece3f7', surface: '#1d1030' },
  ];

  // ---- candidate CSS variable names per role ---------------------------------
  const VARS = {
    accent: ['--accent', '--accent-color', '--accent-fg', '--primary', '--primary-color', '--brand',
             '--brand-color', '--color-accent', '--color-primary', '--color-brand', '--cta', '--link',
             '--highlight', '--theme', '--theme-color', '--green', '--blue'],
    bg:     ['--bg', '--background', '--bg-color', '--color-bg', '--page-bg', '--body-bg', '--bg-base',
             '--bg-primary', '--background-color'],
    text:   ['--text', '--fg', '--foreground', '--color-text', '--text-color', '--color-fg', '--body-color',
             '--ink', '--text-primary', '--content'],
    surface:['--surface', '--card', '--panel', '--bg-elev', '--bg-card', '--bg-panel', '--bg-secondary',
             '--bg-sunken', '--muted', '--surface-color'],
    border: ['--border', '--line', '--hairline', '--border-color', '--rule', '--divider', '--stroke'],
    radius: ['--radius', '--radius-sm', '--radius-md', '--radius-lg', '--border-radius', '--rounded',
             '--br', '--corner'],
  };

  // ---- state -----------------------------------------------------------------
  const DEFAULTS = {
    bodyFont: '', headingFont: '',
    scale: 1, letterSpacing: 0,
    bodySize: '', lineHeight: '', bodyWeight: '', headingWeight: '',
    upperHeadings: false,
    accent: '', bg: '', text: '', surface: '', border: '',
    radius: '', maxWidth: '', shadow: '',
    invert: false,
  };
  let state = { ...DEFAULTS };

  // ---------------------------------------------------------------------------
  // Color helpers
  const hexToRgb = (hex) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  // Readable ink (#fff or #111) for a given background color.
  const contrastFg = (hex) => {
    try {
      const [r, g, b] = hexToRgb(hex).map(v => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return L > 0.45 ? '#111111' : '#ffffff';
    } catch { return '#ffffff'; }
  };

  // ---------------------------------------------------------------------------
  // Build the override stylesheet from the full state.
  function buildCSS(s) {
    const out = [];
    const rootVars = [];
    const setVars = (names, val) => names.forEach(n => rootVars.push(`${n}:${val};`));

    // --- colors → candidate vars ---
    if (s.accent)  setVars(VARS.accent, s.accent);
    if (s.bg)      setVars(VARS.bg, s.bg);
    if (s.text)    setVars(VARS.text, s.text);
    if (s.surface) setVars(VARS.surface, s.surface);
    if (s.border)  setVars(VARS.border, s.border);
    if (s.radius !== '') setVars(VARS.radius, `${s.radius}px`);
    if (rootVars.length) out.push(`:root{${rootVars.join('')}}`);

    // --- fonts ---
    if (s.bodyFont) {
      out.push(`html,body,body *:not(i):not(.fa):not([class*="icon"]){font-family:${FONTS[s.bodyFont]} !important}`);
    }
    if (s.headingFont) {
      out.push(`h1,h2,h3,h4,h5,h6,[class*="title"],[class*="heading"],[class*="headline"]{font-family:${FONTS[s.headingFont]} !important}`);
    }

    // --- overall scale (zoom reliably scales px-based prototypes) ---
    if (s.scale && Number(s.scale) !== 1) out.push(`html{zoom:${s.scale}}`);

    // --- body copy size ---
    if (s.bodySize !== '') {
      out.push(`p,li,td,th,dd,dt,blockquote,figcaption,label,small{font-size:${s.bodySize}px !important}`);
    }
    // --- line height ---
    if (s.lineHeight !== '') {
      out.push(`body,p,li,td,blockquote,dd{line-height:${s.lineHeight} !important}`);
    }
    // --- letter spacing ---
    if (s.letterSpacing && Number(s.letterSpacing) !== 0) {
      out.push(`body,p,li,a,span,h1,h2,h3,h4,h5,h6,button,.btn{letter-spacing:${s.letterSpacing}em !important}`);
    }
    // --- weights ---
    if (s.bodyWeight !== '') out.push(`body,p,li,td,dd,span{font-weight:${s.bodyWeight} !important}`);
    if (s.headingWeight !== '') out.push(`h1,h2,h3,h4,h5,h6,[class*="title"],[class*="heading"]{font-weight:${s.headingWeight} !important}`);
    // --- uppercase headings ---
    if (s.upperHeadings) out.push(`h1,h2,h3,h4,h5,h6{text-transform:uppercase !important}`);

    // --- color element overrides (guaranteed regardless of var naming) ---
    if (s.bg)   out.push(`html,body{background-color:${s.bg} !important}`);
    if (s.text) out.push(`body,p,li,dd,dt,blockquote,figcaption,label,h1,h2,h3,h4,h5,h6,th,td{color:${s.text} !important}`);
    if (s.surface) out.push(`[class*="card"],[class*="panel"],[class*="surface"],[class*="tile"],aside,article,dialog{background-color:${s.surface} !important}`);
    if (s.border) out.push(`hr,[class*="card"],[class*="panel"],[class*="divider"]{border-color:${s.border} !important}hr{background-color:${s.border} !important}`);
    if (s.accent) {
      const fg = contrastFg(s.accent);
      out.push(`a,[class*="accent"],[class*="highlight"]{color:${s.accent} !important}`);
      out.push(`button,.btn,[class*="btn"],[class*="button"],[type="submit"],[class*="cta"]{background-color:${s.accent} !important;border-color:${s.accent} !important;color:${fg} !important}`);
      out.push(`::selection{background:${s.accent};color:${fg}}`);
    }

    // --- shape / space ---
    if (s.radius !== '') {
      out.push(`.btn,button,input,textarea,select,img,[class*="card"],[class*="panel"],[class*="btn"],[class*="tile"]{border-radius:${s.radius}px !important}`);
    }
    if (s.maxWidth !== '') {
      out.push(`main,[class*="container"],[class*="wrapper"],[class*="content"],[class*="inner"]{max-width:${s.maxWidth}px !important;margin-left:auto !important;margin-right:auto !important}`);
    }
    if (s.shadow !== '') {
      const shadows = ['none', '0 1px 2px rgba(0,0,0,.08)', '0 6px 18px rgba(0,0,0,.14)', '0 18px 48px rgba(0,0,0,.28)'];
      const sh = shadows[Number(s.shadow)] || 'none';
      out.push(`[class*="card"],[class*="panel"],[class*="btn"],[class*="tile"]{box-shadow:${sh} !important}`);
    }

    // --- invert (fun/aggressive; keep media upright) ---
    if (s.invert) {
      out.push(`html{filter:invert(1) hue-rotate(180deg)}`);
      out.push(`img,video,picture,canvas,svg,[style*="background-image"],iframe{filter:invert(1) hue-rotate(180deg)}`);
    }

    return out.join('\n');
  }

  // Inject / update the live stylesheet inside the iframe.
  function applyTweaks() {
    const doc = frame.contentDocument;
    if (!doc || !doc.head && !doc.documentElement) return;
    let styleEl = doc.getElementById('ui-lab-tweaks');
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = 'ui-lab-tweaks';
      (doc.head || doc.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = buildCSS(state);
  }

  // ---------------------------------------------------------------------------
  // Control factory. Each control mutates `state` then calls applyTweaks().
  function el(tag, props = {}, kids = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k in n) n[k] = v; else n.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  }

  const rows = {};   // key -> refresh fn, so Reset/Randomize/palette can sync the UI

  function group(title, kids) {
    return el('section', { class: 'group' }, [
      el('h2', { class: 'group__title', text: title }),
      el('div', { class: 'group__body' }, kids),
    ]);
  }

  function selectRow(key, label, options) {
    const sel = el('select', { class: 'field__input' });
    for (const [val, txt] of options) sel.append(el('option', { value: val, text: txt }));
    sel.value = state[key];
    sel.addEventListener('change', () => { state[key] = sel.value; applyTweaks(); });
    rows[key] = () => { sel.value = state[key]; };
    return el('label', { class: 'field' }, [el('span', { class: 'field__label', text: label }), sel]);
  }

  // Range with optional enable checkbox (for overrides with no natural neutral).
  function rangeRow(key, label, { min, max, step = 1, def, unit = '', enable = false, fmt } = {}) {
    const wrap = el('div', { class: 'field field--range' });
    const head = el('div', { class: 'field__head' });
    const out = el('output', { class: 'field__val' });
    let toggle = null;

    const input = el('input', { type: 'range', class: 'field__slider', min, max, step });
    const active = () => (enable ? (toggle && toggle.checked) : true);
    const neutral = def;

    const paint = () => {
      const on = active();
      input.disabled = enable && !on;
      const shown = (state[key] === '' ? neutral : state[key]);
      input.value = shown;
      out.textContent = on ? (fmt ? fmt(shown) : `${shown}${unit}`) : '—';
      wrap.classList.toggle('is-off', enable && !on);
    };

    input.addEventListener('input', () => {
      if (enable && toggle && !toggle.checked) toggle.checked = true;
      state[key] = input.value;
      paint(); applyTweaks();
    });

    if (enable) {
      toggle = el('input', { type: 'checkbox', class: 'field__toggle', 'aria-label': `Enable ${label}` });
      toggle.addEventListener('change', () => {
        state[key] = toggle.checked ? input.value : '';
        paint(); applyTweaks();
      });
      head.append(
        el('span', { class: 'field__label' }, [toggle, ' ', label]),
        out,
      );
    } else {
      head.append(el('span', { class: 'field__label', text: label }), out);
    }
    wrap.append(head, input);
    rows[key] = () => {
      if (toggle) toggle.checked = state[key] !== '';
      paint();
    };
    paint();
    return wrap;
  }

  function colorRow(key, label) {
    const wrap = el('div', { class: 'field field--color' });
    const input = el('input', { type: 'color', class: 'field__color', value: '#888888' });
    const clear = el('button', { class: 'field__clear', type: 'button', text: '×', title: 'Clear', 'aria-label': `Clear ${label}` });
    input.addEventListener('input', () => { state[key] = input.value; wrap.classList.add('is-set'); applyTweaks(); });
    clear.addEventListener('click', () => { state[key] = ''; wrap.classList.remove('is-set'); applyTweaks(); });
    rows[key] = () => {
      if (state[key]) { input.value = state[key]; wrap.classList.add('is-set'); }
      else wrap.classList.remove('is-set');
    };
    if (state[key]) { input.value = state[key]; wrap.classList.add('is-set'); }
    return el('label', { class: 'field field--color' }, [
      el('span', { class: 'field__label', text: label }),
      el('span', { class: 'field__color-wrap' }, [input, clear]),
    ]);
  }

  function toggleRow(key, label) {
    const input = el('input', { type: 'checkbox', class: 'switch__input' });
    input.checked = !!state[key];
    input.addEventListener('change', () => { state[key] = input.checked; applyTweaks(); });
    rows[key] = () => { input.checked = !!state[key]; };
    return el('label', { class: 'switch' }, [
      input, el('span', { class: 'switch__track', 'aria-hidden': 'true' }),
      el('span', { class: 'switch__label', text: label }),
    ]);
  }

  function palettesRow() {
    const grid = el('div', { class: 'palettes' });
    for (const p of PALETTES) {
      const btn = el('button', {
        class: 'palette', type: 'button', title: p.name, 'aria-label': `Apply ${p.name} palette`,
      });
      btn.style.background = p.bg;
      btn.append(
        el('span', { class: 'palette__dot', style: `background:${p.accent}` }),
        el('span', { class: 'palette__dot', style: `background:${p.text}` }),
        el('span', { class: 'palette__dot', style: `background:${p.surface}` }),
        el('span', { class: 'palette__name', text: p.name }),
      );
      btn.addEventListener('click', () => {
        state.accent = p.accent; state.bg = p.bg; state.text = p.text; state.surface = p.surface;
        ['accent', 'bg', 'text', 'surface'].forEach(k => rows[k] && rows[k]());
        applyTweaks();
      });
      grid.append(btn);
    }
    return el('div', { class: 'field field--stack' }, [
      el('span', { class: 'field__label', text: 'Palette presets' }), grid,
    ]);
  }

  function buildControls() {
    const fontOpts = Object.keys(FONTS).map(k => [k, FONT_LABELS[k]]);
    const weightOpts = ['', '300', '400', '500', '600', '700', '800', '900'];

    controlsEl.replaceChildren(
      group('Typography', [
        selectRow('bodyFont', 'Body font', fontOpts),
        selectRow('headingFont', 'Heading font', fontOpts),
        rangeRow('scale', 'Overall scale', { min: 0.7, max: 1.6, step: 0.01, def: 1, fmt: v => `${Math.round(v * 100)}%` }),
        rangeRow('bodySize', 'Body text size', { min: 11, max: 26, step: 1, def: 16, unit: 'px', enable: true }),
        rangeRow('lineHeight', 'Line height', { min: 1, max: 2.2, step: 0.05, def: 1.5, enable: true }),
        rangeRow('letterSpacing', 'Letter spacing', { min: -0.05, max: 0.3, step: 0.005, def: 0, unit: 'em' }),
        rangeRow('bodyWeight', 'Body weight', { min: 100, max: 900, step: 100, def: 400, enable: true }),
        rangeRow('headingWeight', 'Heading weight', { min: 100, max: 900, step: 100, def: 700, enable: true }),
        toggleRow('upperHeadings', 'Uppercase headings'),
      ]),
      group('Color', [
        palettesRow(),
        colorRow('accent', 'Accent'),
        colorRow('bg', 'Background'),
        colorRow('text', 'Text'),
        colorRow('surface', 'Surface / cards'),
        colorRow('border', 'Borders / rules'),
        toggleRow('invert', 'Invert everything'),
      ]),
      group('Shape & space', [
        rangeRow('radius', 'Corner radius', { min: 0, max: 40, step: 1, def: 10, unit: 'px', enable: true }),
        rangeRow('maxWidth', 'Content width', { min: 640, max: 1600, step: 20, def: 1100, unit: 'px', enable: true }),
        rangeRow('shadow', 'Shadow depth', { min: 0, max: 3, step: 1, def: 1, enable: true, fmt: v => ['none', 'soft', 'medium', 'dramatic'][Number(v)] || v }),
      ]),
    );
    // ignore the weightOpts var (kept for clarity of intent)
    void weightOpts;
  }

  // ---------------------------------------------------------------------------
  // Footer actions
  function toast(msg, ms = 2600) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add('is-shown');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toastEl.classList.remove('is-shown'); toastEl.hidden = true; }, ms);
  }

  function resetAll() {
    state = { ...DEFAULTS };
    Object.values(rows).forEach(fn => fn && fn());
    applyTweaks();
    toast('Reset to the original design.');
  }

  function randomHex() {
    const h = Math.floor(Math.random() * 360);
    const s = 55 + Math.floor(Math.random() * 35);
    const l = 45 + Math.floor(Math.random() * 15);
    // hsl → hex
    const a = s / 100 * Math.min(l / 100, 1 - l / 100);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function randomize() {
    const fontKeys = Object.keys(FONTS).filter(k => k);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pal = pick(PALETTES);
    Object.assign(state, {
      bodyFont: pick(fontKeys),
      headingFont: pick(fontKeys),
      accent: randomHex(), bg: pal.bg, text: pal.text, surface: pal.surface,
      radius: String(pick([0, 2, 6, 12, 20, 28])),
      letterSpacing: pick([0, 0, 0.02, -0.01, 0.04]),
      upperHeadings: Math.random() < 0.35,
    });
    Object.values(rows).forEach(fn => fn && fn());
    applyTweaks();
    toast('Randomized — keep dragging to refine.');
  }

  async function copyCSS() {
    const css = buildCSS(state);
    if (!css.trim()) { toast('No tweaks yet — nothing to copy.'); return; }
    try { await navigator.clipboard.writeText(css); toast('Tweak CSS copied to clipboard.'); }
    catch { toast('Could not copy — clipboard blocked.'); }
  }

  async function applySave(btn) {
    const css = buildCSS(state);
    const label = btn.textContent;
    btn.disabled = true;
    btn.replaceChildren(el('span', { class: 'spinner' }), ' Saving…');
    try {
      const res = await fetch('/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'tweak', id: PROTO && PROTO.id, action: 'apply', css }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = await res.json().catch(() => ({}));
      if (json && json.ok === false) throw new Error('Server rejected the save.');
      const file = json.saved && json.saved.file;
      btn.disabled = false; btn.textContent = label;
      toast(file ? `Saved → ${file}. Return to your terminal.` : 'Saved. Return to your terminal.', 6000);
    } catch (err) {
      btn.disabled = false; btn.textContent = label;
      toast(`Could not save: ${err.message}`, 5000);
    }
  }

  // ---------------------------------------------------------------------------
  // Dock collapse
  function setCollapsed(collapsed) {
    dock.classList.toggle('is-collapsed', collapsed);
    reopenBtn.hidden = !collapsed;
    document.body.classList.toggle('dock-hidden', collapsed);
  }

  // ---------------------------------------------------------------------------
  async function boot() {
    // wire footer + dock
    $('#reset').addEventListener('click', resetAll);
    $('#randomize').addEventListener('click', randomize);
    $('#copy').addEventListener('click', copyCSS);
    $('#apply').addEventListener('click', (e) => applySave(e.currentTarget));
    $('#collapse').addEventListener('click', () => setCollapsed(true));
    reopenBtn.addEventListener('click', () => setCollapsed(false));

    buildControls();

    let data;
    try {
      const res = await fetch('/data.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`data.json ${res.status}`);
      data = await res.json();
    } catch (err) {
      emptyMsg.textContent = `Failed to load /data.json (${err.message}).`;
      stageEmpty.hidden = false; frame.hidden = true; return;
    }

    if (!data || !data.src) {
      stageEmpty.hidden = false; frame.hidden = true;
      dock.classList.add('is-disabled');
      return;
    }

    PROTO = data;
    nameEl.textContent = data.style ? `${data.style}` : (data.id || 'Prototype');
    nameEl.title = data.id || '';
    document.title = `${data.id || 'Prototype'} — Tweak Studio`;

    // Re-apply live styles whenever the frame (re)loads.
    frame.addEventListener('load', applyTweaks);
    frame.src = data.src;
  }

  boot();
})();

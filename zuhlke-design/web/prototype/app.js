/* ==========================================================================
   Prototype Compare viewer
   - Fetches /data.json (mode:"prototype")
   - One row per style (styles order); impeccable LEFT, taste RIGHT
   - "Continue with this" -> in-page modal (no alert/confirm/prompt)
   - Modal offers refine / images actions -> POST /select
   ========================================================================== */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);

  const grid      = $('#grid');
  const stateEl   = $('#state');
  const briefEl   = $('#brief');
  const sessionEl = $('#session-name');

  const modal     = $('#modal');
  const modalBody = $('#modal-body');

  // Track focus so it can be restored when the modal closes.
  let lastFocused = null;

  /* ---- helpers -------------------------------------------------------- */

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('data-')) node.setAttribute(k, v);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  function showState(title, message) {
    grid.hidden = true;
    stateEl.hidden = false;
    stateEl.replaceChildren(
      el('h2', { text: title }),
      el('p', { text: message })
    );
  }

  /* ---- rendering ------------------------------------------------------ */

  function cell(proto, style) {
    const engine = proto.engine;                 // "impeccable" | "taste"
    const engineClass = engine === 'taste' ? 'taste' : 'impeccable';

    const frame = el('iframe', {
      class: 'cell__frame',
      src: proto.src,
      title: `${style} — ${engine} prototype`,
      loading: 'lazy'
    });

    const continueBtn = el('button', {
      class: 'btn btn--primary',
      type: 'button',
      text: 'Continue with this'
    });
    continueBtn.addEventListener('click', () => openModal(proto, style));

    return el('div', { class: 'cell' }, [
      el('div', { class: 'cell__bar' }, [
        el('div', { class: 'cell__labels' }, [
          el('span', { class: `engine-tag engine-tag--${engineClass}`, text: engine }),
          el('span', { class: 'cell__style', title: style, text: style })
        ])
      ]),
      el('div', { class: 'cell__frame-wrap' }, [frame]),
      el('div', { class: 'cell__foot' }, [continueBtn])
    ]);
  }

  function render(data) {
    const styles = Array.isArray(data.styles) ? data.styles : [];
    const protos = Array.isArray(data.prototypes) ? data.prototypes : [];

    briefEl.textContent = data.brief || '';
    briefEl.title = data.brief || '';
    if (data.session) {
      sessionEl.textContent = data.session;
      document.title = `${data.session} — Prototype Compare`;
    }

    if (!styles.length || !protos.length) {
      showState('No prototypes yet', 'The session has no prototypes to compare. Generate some and reload.');
      return;
    }

    const byStyleEngine = new Map();
    for (const p of protos) byStyleEngine.set(`${p.style}__${p.engine}`, p);

    const rows = styles.map((style, i) => {
      const impeccable = byStyleEngine.get(`${style}__impeccable`);
      const taste      = byStyleEngine.get(`${style}__taste`);

      const pair = el('div', { class: 'pair' });
      // impeccable LEFT, taste RIGHT
      pair.append(
        impeccable ? cell(impeccable, style) : missingCell('impeccable', style),
        taste      ? cell(taste, style)      : missingCell('taste', style)
      );

      return el('section', { class: 'style-row', 'aria-label': `Style: ${style}` }, [
        el('div', { class: 'style-row__head' }, [
          el('span', { class: 'style-row__index', text: String(i + 1).padStart(2, '0') }),
          el('h2', { class: 'style-row__name', text: style })
        ]),
        pair
      ]);
    });

    grid.replaceChildren(...rows);
    grid.hidden = false;
    stateEl.hidden = true;
  }

  function missingCell(engine, style) {
    const engineClass = engine === 'taste' ? 'taste' : 'impeccable';
    return el('div', { class: 'cell' }, [
      el('div', { class: 'cell__bar' }, [
        el('div', { class: 'cell__labels' }, [
          el('span', { class: `engine-tag engine-tag--${engineClass}`, text: engine }),
          el('span', { class: 'cell__style', text: style })
        ])
      ]),
      el('div', { class: 'cell__frame-wrap', style: 'display:grid;place-items:center;' }, [
        el('p', { style: 'color:var(--fg-faint);font-size:.85rem;', text: 'No prototype for this cell' })
      ])
    ]);
  }

  /* ---- modal ---------------------------------------------------------- */

  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function openModal(proto, style) {
    lastFocused = document.activeElement;
    modalBody.replaceChildren(buildConfirm(proto, style));
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
    // focus first actionable control
    const first = modalBody.querySelector(FOCUSABLE);
    (first || $('.modal__close', modal)).focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    // focus trap
    const focusables = [...modal.querySelectorAll(FOCUSABLE)].filter(n => n.offsetParent !== null || n === document.activeElement);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function buildConfirm(proto, style) {
    const engineClass = proto.engine === 'taste' ? 'taste' : 'impeccable';

    const errorBox = el('div', { class: 'modal__error', role: 'alert', hidden: true });

    const refineBtn = el('button', {
      class: 'btn btn--primary btn--block',
      type: 'button',
      text: 'Refine this (3 variations)'
    });
    const imagesBtn = el('button', {
      class: 'btn btn--block',
      type: 'button',
      text: 'Populate images'
    });
    const cancelBtn = el('button', {
      class: 'btn btn--ghost btn--block',
      type: 'button',
      text: 'Cancel'
    });

    refineBtn.addEventListener('click', () => submit(proto, 'refine', errorBox, [refineBtn, imagesBtn, cancelBtn]));
    imagesBtn.addEventListener('click', () => submit(proto, 'images', errorBox, [refineBtn, imagesBtn, cancelBtn]));
    cancelBtn.addEventListener('click', closeModal);

    return el('div', {}, [
      el('p', { class: 'modal__eyebrow', text: 'Continue with' }),
      el('h2', { class: 'modal__title', id: 'modal-title', text: style }),
      el('div', { class: 'modal__meta' }, [
        el('span', { class: `engine-tag engine-tag--${engineClass}`, text: proto.engine })
      ]),
      el('p', { class: 'modal__text', id: 'modal-desc',
        text: 'Pick a next step for this prototype. Your choice is sent back to the terminal session.' }),
      errorBox,
      el('div', { class: 'modal__actions' }, [refineBtn, imagesBtn, cancelBtn])
    ]);
  }

  /* ---- POST /select --------------------------------------------------- */

  async function submit(proto, action, errorBox, buttons) {
    errorBox.hidden = true;
    const clicked = action === 'refine' ? buttons[0] : buttons[1];
    const originalLabel = clicked.textContent;
    buttons.forEach(b => (b.disabled = true));
    clicked.classList.add('is-busy');
    clicked.replaceChildren(el('span', { class: 'spinner' }), ' Saving…');

    try {
      const res = await fetch('/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'prototype', id: proto.id, action })
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = await res.json().catch(() => ({}));
      if (json && json.ok === false) throw new Error('Server rejected the selection.');
      showSaved(proto, action);
    } catch (err) {
      buttons.forEach(b => (b.disabled = false));
      clicked.classList.remove('is-busy');
      clicked.textContent = originalLabel;
      errorBox.textContent = `Could not save your choice: ${err.message}. Please try again.`;
      errorBox.hidden = false;
    }
  }

  function showSaved(proto, action) {
    const label = action === 'refine' ? 'Refine this (3 variations)' : 'Populate images';
    const doneBtn = el('button', { class: 'btn btn--primary btn--block', type: 'button', text: 'Close' });
    doneBtn.addEventListener('click', closeModal);

    modalBody.replaceChildren(
      el('div', { class: 'saved' }, [
        el('div', { class: 'saved__check', 'aria-hidden': 'true', text: '✓' }),
        el('h2', { class: 'modal__title', id: 'modal-title', text: 'Saved' }),
        el('p', { class: 'modal__text',
          text: `Choice recorded: “${label}” for ${proto.style} · ${proto.engine}. Return to your terminal — the session will continue there.` }),
        doneBtn
      ])
    );
    doneBtn.focus();
  }

  /* ---- modal close wiring --------------------------------------------- */

  modal.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });

  /* ---- boot ----------------------------------------------------------- */

  async function boot() {
    try {
      const res = await fetch('/data.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`data.json returned ${res.status}`);
      const data = await res.json();
      render(data);
    } catch (err) {
      showState('Could not load prototypes', `Failed to fetch /data.json (${err.message}).`);
    }
  }

  boot();
})();

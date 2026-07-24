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

  const tabsEl    = $('#tabs');
  const panelsEl  = $('#panels');
  const stateEl   = $('#state');
  const briefEl   = $('#brief');
  const sessionEl = $('#session-name');

  const modal     = $('#modal');
  const modalBody = $('#modal-body');

  // Track focus so it can be restored when the modal closes.
  let lastFocused = null;

  // Display name for an engine. The data + ids keep "taste"; the UI shows
  // "taste-skill" so the label matches how users refer to the skill.
  const engineLabel = (engine) => (engine === 'taste' ? 'taste-skill' : engine);

  // Live registry of tabs/panels for keyboard navigation and activation.
  let tabButtons = [];

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
    tabsEl.hidden = true;
    panelsEl.hidden = true;
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
      title: `${style} — ${engineLabel(engine)} prototype`,
      loading: 'lazy'
    });

    const continueBtn = el('button', {
      class: 'btn btn--primary',
      type: 'button',
      text: 'Continue with this'
    });
    continueBtn.addEventListener('click', () => openModal(proto, style));

    return el('div', { class: `cell cell--${engineClass}` }, [
      el('div', { class: 'cell__bar' }, [
        el('span', { class: `engine-tag engine-tag--${engineClass}`, text: engineLabel(engine) }),
        continueBtn
      ]),
      el('div', { class: 'cell__frame-wrap' }, [frame])
    ]);
  }

  /* ---- tabs ----------------------------------------------------------- */

  // Show one style's panel; hide the rest. Uses ARIA tab semantics with a
  // roving tabindex so only the active tab is in the tab order.
  function activateTab(target, { focus = false } = {}) {
    for (const btn of tabButtons) {
      const selected = btn === target;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    }
    if (focus) target.focus();
    // Keep the active tab visible when the strip overflows.
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function onTabKeydown(e) {
    const i = tabButtons.indexOf(e.currentTarget);
    if (i === -1) return;
    let next = null;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': next = tabButtons[(i + 1) % tabButtons.length]; break;
      case 'ArrowLeft':  case 'ArrowUp':   next = tabButtons[(i - 1 + tabButtons.length) % tabButtons.length]; break;
      case 'Home': next = tabButtons[0]; break;
      case 'End':  next = tabButtons[tabButtons.length - 1]; break;
      default: return;
    }
    e.preventDefault();
    activateTab(next, { focus: true });
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

    // Only render tabs for styles that actually have at least one prototype.
    const shown = styles.filter(style =>
      byStyleEngine.has(`${style}__impeccable`) || byStyleEngine.has(`${style}__taste`));

    if (!shown.length) {
      showState('No prototypes yet', 'The session has no prototypes to compare. Generate some and reload.');
      return;
    }

    tabButtons = [];
    const tabs = [];
    const panels = [];

    shown.forEach((style, i) => {
      const tabId   = `tab-${i}`;
      const panelId = `panel-${i}`;

      const tab = el('button', {
        class: 'tab',
        type: 'button',
        role: 'tab',
        id: tabId,
        'aria-controls': panelId,
        'aria-selected': 'false',
        tabIndex: -1,
        text: style
      });
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', onTabKeydown);
      tabButtons.push(tab);
      tabs.push(tab);

      const impeccable = byStyleEngine.get(`${style}__impeccable`);
      const taste      = byStyleEngine.get(`${style}__taste`);

      const cells = [];
      if (impeccable) cells.push(cell(impeccable, style));
      if (taste)      cells.push(cell(taste, style));

      // Refine sessions carry only one engine per style; a single-engine style
      // renders as one column so there are no empty placeholder cells.
      const pairClass = cells.length === 1 ? 'pair pair--single' : 'pair';
      const pair = el('div', { class: pairClass });
      pair.append(...cells);

      panels.push(el('section', {
        class: 'panel',
        id: panelId,
        role: 'tabpanel',
        'aria-labelledby': tabId,
        tabIndex: 0,
        hidden: true
      }, [pair]));
    });

    tabsEl.replaceChildren(...tabs);
    panelsEl.replaceChildren(...panels);
    tabsEl.hidden = false;
    panelsEl.hidden = false;
    stateEl.hidden = true;

    activateTab(tabButtons[0]);
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
    const tweakBtn = el('button', {
      class: 'btn btn--block btn--stacked',
      type: 'button'
    });
    tweakBtn.append(
      el('span', { class: 'btn__label', text: 'Refine this' }),
      el('span', { class: 'btn__hint', text: 'open the live tweak studio' })
    );
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

    const all = [refineBtn, tweakBtn, imagesBtn, cancelBtn];
    refineBtn.addEventListener('click', () => submit(proto, 'refine', errorBox, all, refineBtn));
    tweakBtn.addEventListener('click',  () => submit(proto, 'tweak',  errorBox, all, tweakBtn));
    imagesBtn.addEventListener('click', () => submit(proto, 'images', errorBox, all, imagesBtn));
    cancelBtn.addEventListener('click', closeModal);

    return el('div', {}, [
      el('p', { class: 'modal__eyebrow', text: 'Continue with' }),
      el('h2', { class: 'modal__title', id: 'modal-title', text: style }),
      el('div', { class: 'modal__meta' }, [
        el('span', { class: `engine-tag engine-tag--${engineClass}`, text: engineLabel(proto.engine) })
      ]),
      el('p', { class: 'modal__text', id: 'modal-desc',
        text: 'Pick a next step for this prototype. Your choice is sent back to the terminal session.' }),
      errorBox,
      el('div', { class: 'modal__actions' }, [refineBtn, tweakBtn, imagesBtn, cancelBtn])
    ]);
  }

  /* ---- POST /select --------------------------------------------------- */

  async function submit(proto, action, errorBox, buttons, clicked) {
    errorBox.hidden = true;
    const originalChildren = [...clicked.childNodes];
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
      clicked.replaceChildren(...originalChildren);
      errorBox.textContent = `Could not save your choice: ${err.message}. Please try again.`;
      errorBox.hidden = false;
    }
  }

  function showSaved(proto, action) {
    const labels = { refine: 'Refine this (3 variations)', tweak: 'Refine this', images: 'Populate images' };
    const label = labels[action] || action;
    const doneBtn = el('button', { class: 'btn btn--primary btn--block', type: 'button', text: 'Close' });
    doneBtn.addEventListener('click', closeModal);

    modalBody.replaceChildren(
      el('div', { class: 'saved' }, [
        el('div', { class: 'saved__check', 'aria-hidden': 'true', text: '✓' }),
        el('h2', { class: 'modal__title', id: 'modal-title', text: 'Saved' }),
        el('p', { class: 'modal__text',
          text: `Choice recorded: “${label}” for ${proto.style} · ${engineLabel(proto.engine)}. Return to your terminal — the session will continue there.` }),
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

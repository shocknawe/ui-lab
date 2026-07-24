/* Pegs Library — peg-library viewer (read-only)
   Fetches /data.json at runtime, renders a card grid.
   No external network calls. No alert/confirm/prompt. */

(function () {
  "use strict";

  var gridEl = document.getElementById("grid");
  var stateEl = document.getElementById("state");
  var countEl = document.getElementById("count");
  var toastEl = document.getElementById("toast");

  // --- tiny DOM helpers ---------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2), attrs[k]);
        } else if (attrs[k] != null) {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  var copyIcon =
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="9" width="11" height="11" rx="2"/>' +
    '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  var chevIcon =
    '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M9 6l6 6-6 6"/></svg>';

  // --- toast --------------------------------------------------------------
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs even on rapid repeats
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1600);
  }

  // --- clipboard ----------------------------------------------------------
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts / older engines.
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      }
    });
  }

  function wireCopy(btn, getText, label) {
    var revertTimer = null;
    var original = btn.querySelector(".btn__label");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      copyText(getText()).then(
        function () {
          btn.classList.add("btn--copied");
          if (original) original.textContent = "Copied";
          toast(label + " copied");
          if (revertTimer) clearTimeout(revertTimer);
          revertTimer = setTimeout(function () {
            btn.classList.remove("btn--copied");
            if (original) original.textContent = "Copy";
          }, 1500);
        },
        function () {
          toast("Copy failed — select and copy manually");
        }
      );
    });
  }

  function copyButton(getText, label) {
    var btn = el("button", { class: "btn", type: "button",
      "aria-label": "Copy " + label });
    btn.innerHTML = copyIcon + '<span class="btn__label">Copy</span>';
    wireCopy(btn, getText, label);
    return btn;
  }

  // --- field (label + text + copy) ---------------------------------------
  function field(label, text) {
    var value = (text == null || text === "") ? "—" : String(text);
    var head = el("div", { class: "field__head" }, [
      el("span", { class: "field__label", text: label }),
      copyButton(function () { return value; }, label)
    ]);
    var body = el("p", { class: "field__text", text: value });
    return el("div", { class: "field" }, [head, body]);
  }

  // --- card ---------------------------------------------------------------
  function makeCard(peg, index) {
    var slug = peg.slug || "peg-" + (index + 1);
    var panelId = "panel-" + index;

    // Media
    var media;
    if (peg.image) {
      media = el("div", { class: "card__media" }, [
        el("img", {
          src: peg.image,
          alt: slug + " peg thumbnail",
          loading: "lazy",
          decoding: "async",
          onerror: function () {
            this.parentNode.classList.add("card__media--empty");
            this.remove();
            this.parentNode.textContent = "Image unavailable";
          }
        })
      ]);
    } else {
      media = el("div", { class: "card__media card__media--empty", text: "No image" });
    }

    // Keyword chips
    var chipItems = (peg.keywords || []).map(function (k) {
      return el("li", { class: "chip", text: k });
    });
    var chips = chipItems.length
      ? el("ul", { class: "chips" }, chipItems)
      : null;

    var heading = el("div", { class: "card__heading" }, [
      el("h2", { class: "card__slug", text: slug }),
      peg.design_family
        ? el("span", { class: "badge", text: peg.design_family })
        : null
    ]);

    var hint = el("span", { class: "card__hint" }, [
      el("span", { class: "chev", html: chevIcon }),
      el("span", { class: "card__hint-text", text: "Show prompt & copy brief" })
    ]);

    var body = el("div", { class: "card__body" }, [heading, chips, hint]);

    var trigger = el("button", {
      class: "card__trigger",
      type: "button",
      "aria-expanded": "false",
      "aria-controls": panelId
    }, [media, body]);

    // Details
    var details = el("div", { class: "details", id: panelId }, [
      el("div", { class: "details__inner" }, [
        el("div", { class: "details__pad" }, [
          field("Image prompt", peg.image_prompt),
          field("Copy brief", peg.copy_brief)
        ])
      ])
    ]);

    var card = el("article", { class: "card" }, [trigger, details]);

    trigger.addEventListener("click", function () {
      var open = card.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      hint.querySelector(".card__hint-text").textContent =
        open ? "Hide prompt & copy brief" : "Show prompt & copy brief";
    });

    return card;
  }

  // --- render states ------------------------------------------------------
  function setCount(n) {
    countEl.innerHTML =
      "<strong>" + n + "</strong> " + (n === 1 ? "peg" : "pegs");
  }

  function showState(iconGlyph, title, bodyNodes) {
    gridEl.hidden = true;
    stateEl.hidden = false;
    stateEl.innerHTML = "";
    stateEl.appendChild(el("div", { class: "state__icon", text: iconGlyph,
      "aria-hidden": "true" }));
    stateEl.appendChild(el("h2", { text: title }));
    (bodyNodes || []).forEach(function (n) { stateEl.appendChild(n); });
  }

  function showEmpty() {
    setCount(0);
    showState("🗂️", "No pegs yet", [
      el("p", { text: "Your pegs library is empty. Add a reference image to get started:" }),
      el("p", {}, [el("code", { text: "/ui-lab pegs <image.jpg>" })]),
      el("p", { class: "muted", text: "Once added, each peg shows its design family, keywords, image prompt and copy brief here." })
    ]);
  }

  function showError(detail) {
    countEl.textContent = "Unavailable";
    showState("⚠️", "Couldn’t load the library", [
      el("p", { text: "The viewer couldn’t fetch its data from the server." }),
      el("p", {}, [el("code", { text: "GET /data.json" })]),
      detail ? el("p", { class: "muted", text: String(detail) }) : null
    ].filter(Boolean));
  }

  function render(pegs) {
    if (!pegs.length) { showEmpty(); return; }
    stateEl.hidden = true;
    gridEl.hidden = false;
    gridEl.innerHTML = "";
    setCount(pegs.length);
    var frag = document.createDocumentFragment();
    pegs.forEach(function (peg, i) { frag.appendChild(makeCard(peg, i)); });
    gridEl.appendChild(frag);
  }

  // --- boot ---------------------------------------------------------------
  function boot() {
    fetch("/data.json", { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var pegs = (data && Array.isArray(data.pegs)) ? data.pegs : [];
        render(pegs);
      })
      .catch(function (err) {
        showError(err && err.message);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

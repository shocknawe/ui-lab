/* ==========================================================================
   UI Lab — images viewer
   Fetches /data.json, renders a selectable thumbnail grid under a sticky
   header, and POSTs the chosen action to /apply.
   Self-contained: no external libraries or network calls beyond same-origin.
   ========================================================================== */

(function () {
  "use strict";

  /* ---- State ---------------------------------------------------------- */
  var data = { mode: "images", prototype: "", multiSelect: false, images: [] };
  var selected = new Set(); // ids of currently-selected thumbs (insertion order)
  var busy = false; // true while a POST is in flight

  /* ---- Elements ------------------------------------------------------- */
  var els = {
    prototypeName: document.getElementById("prototype-name"),
    status: document.getElementById("selection-status"),
    grid: document.getElementById("grid"),
    state: document.getElementById("state"),
    banner: document.getElementById("banner"),
    btnRegenerate: document.getElementById("btn-regenerate"),
    btnVariations: document.getElementById("btn-variations"),
    btnApply: document.getElementById("btn-apply")
  };

  /* ---- Utilities ------------------------------------------------------ */
  function setDisabled(btn, disabled) {
    btn.disabled = disabled;
    btn.setAttribute("aria-disabled", disabled ? "true" : "false");
  }

  function showState(icon, title, text) {
    els.state.innerHTML = "";
    var i = document.createElement("div");
    i.className = "state__icon";
    i.setAttribute("aria-hidden", "true");
    i.textContent = icon;
    var h = document.createElement("p");
    h.className = "state__title";
    h.textContent = title;
    var p = document.createElement("p");
    p.className = "state__text";
    p.textContent = text;
    els.state.append(i, h, p);
    els.state.hidden = false;
  }

  function hideState() { els.state.hidden = true; }

  function showBanner(kind, headline, detail) {
    els.banner.className = "banner banner--" + kind;
    els.banner.innerHTML = "";
    var icon = document.createElement("span");
    icon.className = "banner__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = kind === "ok" ? "✓" : "⚠";
    var text = document.createElement("span");
    text.className = "banner__text";
    var strong = document.createElement("strong");
    strong.textContent = headline;
    text.appendChild(strong);
    if (detail) { text.appendChild(document.createTextNode(" — " + detail)); }
    els.banner.append(icon, text);
    els.banner.hidden = false;
  }

  function hideBanner() { els.banner.hidden = true; }

  /* ---- Selection ------------------------------------------------------ */
  function toggleSelection(id) {
    if (data.multiSelect) {
      if (selected.has(id)) { selected.delete(id); }
      else { selected.add(id); }
    } else {
      // single-select: replace unless clicking the already-selected one (toggle off)
      if (selected.has(id) && selected.size === 1) { selected.clear(); }
      else { selected.clear(); selected.add(id); }
    }
    syncSelectionUI();
    hideBanner();
  }

  function syncSelectionUI() {
    var cards = els.grid.querySelectorAll(".thumb");
    Array.prototype.forEach.call(cards, function (card) {
      var isSel = selected.has(card.dataset.id);
      card.classList.toggle("is-selected", isSel);
      card.setAttribute("aria-pressed", isSel ? "true" : "false");
    });

    var count = selected.size;
    // Apply: enabled when >=1 selected
    setDisabled(els.btnApply, count === 0 || busy);
    // Variations: enabled only when exactly one selected
    setDisabled(els.btnVariations, count !== 1 || busy);
    // Regenerate: always available (unless busy)
    setDisabled(els.btnRegenerate, busy);

    if (!data.images.length) {
      els.status.textContent = "No images to show.";
    } else if (count === 0) {
      els.status.textContent = data.multiSelect
        ? "Select one or more images."
        : "Select an image.";
    } else {
      els.status.textContent =
        count + (count === 1 ? " image selected." : " images selected.");
    }
  }

  /* ---- Rendering ------------------------------------------------------ */
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" ' +
    'stroke="currentColor" stroke-width="3.5" stroke-linecap="round" ' +
    'stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7"/></svg>';

  function renderGrid() {
    els.grid.innerHTML = "";

    if (!data.images.length) {
      els.grid.hidden = true;
      showState(
        "🖼️",
        "No images yet",
        "There are no images to pick from for this prototype. Regenerate from your terminal or trigger a fresh run."
      );
      return;
    }

    hideState();
    els.grid.hidden = false;

    data.images.forEach(function (img) {
      var li = document.createElement("li");

      var card = document.createElement("button");
      card.type = "button";
      card.className = "thumb";
      card.dataset.id = img.id;
      card.setAttribute("aria-pressed", "false");
      var labelText = img.label || img.id;
      card.setAttribute("aria-label", labelText);

      var frame = document.createElement("div");
      frame.className = "thumb__frame";

      if (img.src) {
        var im = document.createElement("img");
        im.className = "thumb__img";
        im.src = img.src;
        im.alt = labelText;
        im.loading = "lazy";
        im.decoding = "async";
        im.addEventListener("error", function () {
          var fallback = document.createElement("div");
          fallback.className = "thumb__img thumb__img--broken";
          fallback.textContent = "Image unavailable";
          im.replaceWith(fallback);
        });
        frame.appendChild(im);
      } else {
        var noimg = document.createElement("div");
        noimg.className = "thumb__img thumb__img--broken";
        noimg.textContent = "No image";
        frame.appendChild(noimg);
      }

      var check = document.createElement("span");
      check.className = "thumb__check";
      check.setAttribute("aria-hidden", "true");
      check.innerHTML = CHECK_SVG;
      frame.appendChild(check);

      var caption = document.createElement("span");
      caption.className = "thumb__caption";
      var lab = document.createElement("span");
      lab.className = "thumb__label";
      lab.textContent = labelText;
      caption.appendChild(lab);

      card.append(frame, caption);
      card.addEventListener("click", function () {
        toggleSelection(img.id);
      });

      li.appendChild(card);
      els.grid.appendChild(li);
    });

    syncSelectionUI();
  }

  /* ---- POST /apply ---------------------------------------------------- */
  function setBusy(state) {
    busy = state;
    syncSelectionUI();
  }

  function postApply(body) {
    if (busy) { return; }
    hideBanner();
    setBusy(true);

    fetch("/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (!res.ok) { throw new Error("Server responded " + res.status); }
        return res.json().catch(function () { return {}; });
      })
      .then(function (json) {
        if (json && json.ok === false) {
          throw new Error("The server rejected the request.");
        }
        showBanner("ok", "Saved", "return to your terminal.");
      })
      .catch(function (err) {
        showBanner(
          "err",
          "Couldn't save",
          (err && err.message ? err.message : "Please try again.")
        );
      })
      .then(function () { setBusy(false); });
  }

  /* ---- Action wiring -------------------------------------------------- */
  function wireActions() {
    els.btnRegenerate.addEventListener("click", function () {
      if (els.btnRegenerate.disabled) { return; }
      postApply({ action: "regenerate" });
    });

    els.btnVariations.addEventListener("click", function () {
      if (els.btnVariations.disabled) { return; }
      var ids = Array.from(selected);
      if (ids.length !== 1) { return; }
      postApply({ action: "variations", targetId: ids[0] });
    });

    els.btnApply.addEventListener("click", function () {
      if (els.btnApply.disabled) { return; }
      var ids = Array.from(selected);
      if (!ids.length) { return; }
      postApply({ action: "apply", ids: ids });
    });
  }

  /* ---- Boot ----------------------------------------------------------- */
  function boot() {
    wireActions();
    els.status.textContent = "Loading…";

    fetch("/data.json", { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) { throw new Error("Failed to load data (" + res.status + ")"); }
        return res.json();
      })
      .then(function (json) {
        data = {
          mode: "images",
          prototype: (json && json.prototype) || "",
          multiSelect: !!(json && json.multiSelect),
          images: (json && Array.isArray(json.images)) ? json.images : []
        };
        els.prototypeName.textContent = data.prototype || "Images";
        document.title = (data.prototype ? data.prototype + " — " : "") + "Image Picker";
        renderGrid();
      })
      .catch(function (err) {
        els.grid.hidden = true;
        els.prototypeName.textContent = "Images";
        els.status.textContent = "Couldn't load images.";
        setDisabled(els.btnRegenerate, true);
        setDisabled(els.btnVariations, true);
        setDisabled(els.btnApply, true);
        showState(
          "⚠️",
          "Couldn't load images",
          (err && err.message ? err.message : "Unknown error") +
            ". Check that the gallery server is running."
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

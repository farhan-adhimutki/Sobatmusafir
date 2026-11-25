/* =========================================================
   auth/ui.js — komponen tampilan halaman autentikasi
   Memakai komponen yang sudah ada di situs (panel, form, input, btn,
   chip, crumb, promo-item) agar desainnya seragam.
   ========================================================= */
window.SM_AUTH_UI = (() => {
  const A = window.SM_APP;
  const { esc, ic } = A;

  /* Kerangka halaman auth: formulir di kiri, keuntungan akun di kanan */
  function shell({ crumb, judul, sub, isi, aside = true }) {
    return `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${esc(A.t("nav.home"))}</a><span class="sep">/</span><span>${esc(crumb)}</span></nav>
    </div>
    <div class="wrap auth-wrap">
      <section class="panel auth-card">
        <span class="brand-mark">${ic("shield")}</span>
        <h1 class="auth-title">${esc(judul)}</h1>
        ${sub ? `<p class="muted">${sub}</p>` : ""}
        ${isi}
      </section>
      ${aside ? `<aside class="promo auth-aside" aria-label="Keuntungan akun">
        <div>
          <span class="eyebrow">${ic("users")}Akun SobatMusafir</span>
          <h2>Perjalanan Anda, tersimpan di satu akun</h2>
          <p>Masuk sekali, lalu buka dari HP atau laptop mana pun.</p>
        </div>
        <div class="promo-list">
          <div class="promo-item"><span class="qi">${ic("bookmark")}</span><div><strong>Favorit tersinkron</strong><span>Kuliner & UMKM halal pilihan Anda ikut ke semua perangkat.</span></div></div>
          <div class="promo-item"><span class="qi">${ic("route")}</span><div><strong>Itinerary aman</strong><span>Rencana perjalanan & jeda sholat tersimpan di akun.</span></div></div>
          <div class="promo-item"><span class="qi">${ic("shield")}</span><div><strong>Data terlindungi</strong><span>Hanya Anda yang bisa melihat dan mengubah profil Anda.</span></div></div>
        </div>
      </aside>` : ""}
    </div>`;
  }

  /* Kolom input standar dengan tempat pesan kesalahan */
  function field({ name, label, type = "text", auto = "", icon = "", value = "", hint = "", extra = "" }) {
    const id = "f-" + name;
    return `<div class="auth-field">
      <label for="${id}">${esc(label)}</label>
      <div class="field">${icon ? ic(icon) : ""}<input class="input ${icon ? "" : "plain"}" id="${id}" name="${name}" type="${type}" ${auto ? `autocomplete="${auto}"` : ""} value="${esc(value)}" aria-describedby="${id}-err${hint ? ` ${id}-hint` : ""}" ${extra}></div>
      ${hint ? `<small class="muted" id="${id}-hint">${hint}</small>` : ""}
      <small class="field-err" id="${id}-err" role="alert"></small>
    </div>`;
  }

  /* Kolom kata sandi: tombol lihat/sembunyikan + meteran kekuatan (opsional) */
  function sandi({ name, label, auto = "new-password", meter = false, hint = "" }) {
    const id = "f-" + name;
    return `<div class="auth-field">
      <label for="${id}">${esc(label)}</label>
      <div class="field">${ic("lock")}<input class="input pw-input" id="${id}" name="${name}" type="password" autocomplete="${auto}" aria-describedby="${id}-err${hint ? ` ${id}-hint` : ""}" maxlength="128">
        <button class="pw-toggle" type="button" data-pw-toggle="${id}" aria-label="Tampilkan kata sandi" aria-pressed="false">${ic("eye")}</button></div>
      ${meter ? `<div class="pw-meter" aria-hidden="true"><i data-meter="${id}"></i></div><small class="muted" id="${id}-hint" data-meter-label="${id}">${hint || `Minimal ${window.SM_VALID.PANJANG_MIN} karakter. Disarankan kombinasi huruf besar, kecil, angka & simbol.`}</small>` : hint ? `<small class="muted" id="${id}-hint">${hint}</small>` : ""}
      <small class="field-err" id="${id}-err" role="alert"></small>
    </div>`;
  }

  function setErr(form, name, msg) {
    const input = form.elements[name];
    const out = form.querySelector(`#f-${name}-err`);
    if (out) out.textContent = msg || "";
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function clearErr(form) { form.querySelectorAll(".field-err").forEach((e) => (e.textContent = "")); form.querySelectorAll("[aria-invalid]").forEach((i) => i.setAttribute("aria-invalid", "false")); }
  function focusFirstErr(form) { const bad = form.querySelector("[aria-invalid=true]"); if (bad) bad.focus(); }

  /* Kotak pesan di atas formulir: jenis "ok" | "warn" | "info" */
  function banner(el, jenis, html) {
    if (!el) return;
    if (!html) { el.hidden = true; el.innerHTML = ""; return; }
    el.hidden = false;
    el.className = "auth-banner " + jenis;
    el.innerHTML = `${ic(jenis === "ok" ? "check" : jenis === "warn" ? "info" : "bell")}<div>${html}</div>`;
    A.replay(el, "pop");
  }

  /* Tombol sibuk saat menunggu server (mencegah klik ganda) */
  function busy(btn, on, teks) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.innerHTML = `<span class="spin" aria-hidden="true"></span>${esc(teks || "Memproses…")}`; }
    else { btn.disabled = false; btn.removeAttribute("aria-busy"); if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  }

  /* Tombol dengan hitung mundur (mis. kirim ulang email) */
  function cooldown(btn, kunci, labelAsli) {
    const tick = () => {
      if (!btn.isConnected) return;
      const sisa = window.SM_VALID.jeda(kunci);
      if (sisa > 0) { btn.disabled = true; btn.textContent = `${labelAsli} (${sisa} dtk)`; setTimeout(tick, 1000); }
      else { btn.disabled = false; btn.textContent = labelAsli; }
    };
    tick();
  }

  /* Interaksi umum: lihat sandi & meteran kekuatan */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pw-toggle]"); if (!b) return;
    const input = document.getElementById(b.dataset.pwToggle); if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    b.setAttribute("aria-pressed", String(show));
    b.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
    b.innerHTML = ic(show ? "eye-off" : "eye");
  });
  document.addEventListener("input", (e) => {
    const input = e.target;
    if (!input.classList || !input.classList.contains("pw-input")) return;
    const bar = document.querySelector(`[data-meter="${input.id}"]`);
    if (bar) {
      const k = window.SM_VALID.kekuatan(input.value);
      bar.style.width = input.value ? (k.skor + 1) * 20 + "%" : "0";
      bar.dataset.skor = k.skor;
      const lbl = document.querySelector(`[data-meter-label="${input.id}"]`);
      if (lbl) lbl.textContent = input.value ? `Kekuatan: ${k.label} • ${input.value.length} karakter` : `Minimal ${window.SM_VALID.PANJANG_MIN} karakter.`;
    }
  });

  return { shell, field, sandi, setErr, clearErr, focusFirstErr, banner, busy, cooldown };
})();

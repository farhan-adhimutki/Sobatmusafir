/* =========================================================
   auth/recovery.js — Lupa & Reset Kata Sandi
   #lupa-sandi  : minta tautan reset → supabase.auth.resetPasswordForEmail()
   #reset-sandi : setel sandi baru (setelah klik tautan) → supabase.auth.updateUser()
   ========================================================= */
(() => {
  const A = window.SM_APP, UI = window.SM_AUTH_UI, VAL = window.SM_VALID, AUTH = window.SM_AUTH;
  const { esc, ic } = A;
  const sb = () => AUTH.client;

  /* ---------- Lupa kata sandi ---------- */
  function lupaView() {
    return UI.shell({
      crumb: "Lupa kata sandi",
      judul: "Lupa kata sandi?",
      sub: "Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.",
      isi: `
        <div id="lupaBanner" hidden></div>
        <form class="form auth-form" id="lupaForm" novalidate>
          ${UI.field({ name: "email", label: "Email", type: "email", auto: "email", icon: "mail", extra: 'maxlength="254" required inputmode="email"' })}
          <button class="btn btn-primary btn-block" type="submit">${ic("bell")}Kirim tautan reset</button>
          <p class="small muted center-text"><a class="link" href="#masuk">${ic("back")}Kembali ke Masuk</a></p>
        </form>`
    });
  }
  function lupaAfter() {
    const n = AUTH.ambilNotice("lupa-sandi");
    if (n) UI.banner(document.getElementById("lupaBanner"), n.jenis, n.html);
    document.getElementById("f-email")?.focus();
  }
  async function lupaSubmit(form) {
    UI.clearErr(form);
    const banner = document.getElementById("lupaBanner");
    const email = VAL.rapikanEmail(form.email.value);
    if (!UI.setErr(form, "email", VAL.email(email))) { UI.focusFirstErr(form); return; }
    if (!sb()) { UI.banner(banner, "warn", "Tidak dapat terhubung ke server akun."); return; }
    const kunci = "reset:" + email;
    const sisa = VAL.jeda(kunci);
    if (sisa > 0) { UI.banner(banner, "warn", `Tautan baru saja dikirim. Coba lagi dalam ${sisa} detik.`); return; }
    const btn = form.querySelector("button[type=submit]");
    UI.busy(btn, true, "Mengirim…");
    const { error } = await sb().auth.resetPasswordForEmail(email, { redirectTo: AUTH.redirectUrl("reset") }).catch((e) => ({ error: e }));
    UI.busy(btn, false);
    VAL.jeda(kunci, 60);
    // Pesan sama untuk email terdaftar/tidak terdaftar (mencegah orang menebak email pengguna)
    if (error && /rate limit|seconds|Failed to fetch|fetch/i.test(error.message || "")) UI.banner(banner, "warn", esc(VAL.pesan(error)));
    else UI.banner(banner, "ok", `Jika <b>${esc(email)}</b> terdaftar, tautan reset kata sandi sudah dikirim. Tautan hanya bisa dipakai sekali dan berlaku terbatas. Cek juga folder spam.`);
  }

  /* ---------- Reset kata sandi ---------- */
  function resetView() {
    const user = AUTH.state.user;
    if (!user) {
      return UI.shell({
        crumb: "Reset kata sandi",
        judul: "Tautan tidak berlaku",
        sub: "",
        isi: `<div class="auth-banner warn">${ic("info")}<div><b>Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.</b> Minta tautan baru untuk melanjutkan.</div></div>
          <a class="btn btn-primary btn-block" href="#lupa-sandi">${ic("bell")}Minta tautan baru</a>`
      });
    }
    return UI.shell({
      crumb: "Reset kata sandi",
      judul: "Buat kata sandi baru",
      sub: `Untuk akun <b>${esc(user.email || "")}</b>.`,
      isi: `
        <div id="resetBanner" hidden></div>
        <form class="form auth-form" id="resetForm" novalidate>
          <input type="text" name="username" autocomplete="username" value="${esc(user.email || "")}" hidden>
          ${UI.sandi({ name: "password", label: "Kata sandi baru", meter: true })}
          ${UI.sandi({ name: "konfirmasi", label: "Ulangi kata sandi baru" })}
          <button class="btn btn-primary btn-block" type="submit">${ic("check")}Simpan kata sandi baru</button>
        </form>`
    });
  }
  async function resetSubmit(form, { tujuan = "#dashboard", bannerId = "resetBanner" } = {}) {
    UI.clearErr(form);
    const banner = document.getElementById(bannerId);
    const pw = form.password.value, k = form.konfirmasi.value;
    const email = AUTH.state.user ? AUTH.state.user.email : "";
    const ok = [UI.setErr(form, "password", VAL.password(pw, email)), UI.setErr(form, "konfirmasi", VAL.konfirmasi(pw, k))].every(Boolean);
    if (!ok) { UI.focusFirstErr(form); return false; }
    const btn = form.querySelector("button[type=submit]");
    UI.busy(btn, true, "Menyimpan…");
    const { error } = await sb().auth.updateUser({ password: pw }).catch((e) => ({ error: e }));
    UI.busy(btn, false);
    form.password.value = ""; form.konfirmasi.value = "";
    if (error) { UI.banner(banner, "warn", esc(VAL.pesan(error))); return false; }
    // Keluarkan sesi di perangkat lain setelah sandi diganti
    await sb().auth.signOut({ scope: "others" }).catch(() => null);
    AUTH.state.recovery = false;
    try { sessionStorage.removeItem("sm:recovery"); } catch { /* abaikan */ }
    A.toast("Kata sandi baru tersimpan. Sesi di perangkat lain sudah dikeluarkan.");
    if (tujuan) location.hash = tujuan;
    return true;
  }

  document.addEventListener("submit", (e) => {
    if (e.target.id === "lupaForm") { e.preventDefault(); lupaSubmit(e.target); }
    if (e.target.id === "resetForm") { e.preventDefault(); resetSubmit(e.target); }
  });

  A.addView("lupa-sandi", lupaView, { navKey: "akun", after: lupaAfter });
  A.addView("reset-sandi", resetView, { navKey: "akun", after: () => document.getElementById("f-password")?.focus() });
  window.SM_RECOVERY = { resetSubmit };
})();

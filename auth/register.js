/* =========================================================
   auth/register.js — Registrasi (#daftar)
   Nama lengkap, email, kata sandi (min. 12), konfirmasi.
   → supabase.auth.signUp() → email verifikasi dikirim Supabase.
   Profil otomatis dibuat oleh trigger database (public.profiles).
   ========================================================= */
(() => {
  const A = window.SM_APP, UI = window.SM_AUTH_UI, VAL = window.SM_VALID, AUTH = window.SM_AUTH;
  const { esc, ic } = A;
  const sb = () => AUTH.client;

  function view() {
    return UI.shell({
      crumb: "Daftar",
      judul: "Buat akun SobatMusafir",
      sub: "Gratis. Simpan favorit & itinerary ramah Muslim Anda di satu akun.",
      isi: `
        <div id="regBanner" hidden></div>
        <form class="form auth-form" id="registerForm" novalidate>
          ${UI.field({ name: "nama", label: "Nama lengkap", auto: "name", icon: "users", extra: 'maxlength="100" required' })}
          ${UI.field({ name: "email", label: "Email", type: "email", auto: "email", icon: "mail", extra: 'maxlength="254" required inputmode="email"' })}
          ${UI.sandi({ name: "password", label: "Kata sandi", meter: true })}
          ${UI.sandi({ name: "konfirmasi", label: "Ulangi kata sandi" })}
          <button class="btn btn-primary btn-block" type="submit">${ic("check")}Daftar</button>
          <p class="small muted center-text">Sudah punya akun? <a class="link" href="#masuk">Masuk di sini</a></p>
        </form>
        ${AUTH.client ? "" : `<p class="auth-banner warn">${ic("info")}<span>Koneksi ke server akun belum tersedia di tampilan ini.</span></p>`}`
    });
  }

  /* Layar "cek email" setelah berhasil daftar, dengan tombol kirim ulang */
  function cekEmail(email) {
    return `<div class="auth-done" role="status">
      <span class="brand-mark big">${ic("bell")}</span>
      <h2>Cek email Anda</h2>
      <p>Kami mengirim tautan verifikasi ke <b>${esc(email)}</b>. Klik tautan itu untuk mengaktifkan akun, lalu Anda akan langsung masuk.</p>
      <p class="small muted">Tidak menerima email? Periksa folder <b>Spam/Promosi</b>. Tautan berlaku terbatas.</p>
      <div id="resendBanner" hidden></div>
      <div class="chips center-chips">
        <button class="btn btn-soft" type="button" data-resend="${esc(email)}">Kirim ulang email verifikasi</button>
        <a class="btn btn-ghost" href="#masuk">${ic("login")}Ke halaman Masuk</a>
      </div>
      <button class="link" type="button" data-daftar-ulang>Salah email? Daftar dengan email lain</button>
    </div>`;
  }

  async function kirimUlang(btn) {
    const email = btn.dataset.resend;
    const kunci = "verifikasi:" + email;
    if (VAL.jeda(kunci) > 0) return;
    const out = document.getElementById("resendBanner");
    UI.busy(btn, true, "Mengirim…");
    const { error } = await sb().auth.resend({ type: "signup", email, options: { emailRedirectTo: AUTH.redirectUrl("verifikasi") } });
    UI.busy(btn, false);
    if (error) UI.banner(out, "warn", esc(VAL.pesan(error)));
    else UI.banner(out, "ok", "Email verifikasi baru sudah dikirim. Tautan lama tidak berlaku lagi.");
    VAL.jeda(kunci, 60);
    UI.cooldown(btn, kunci, "Kirim ulang email verifikasi");
  }

  async function submit(form) {
    UI.clearErr(form);
    const banner = document.getElementById("regBanner");
    UI.banner(banner, "", "");
    const nama = VAL.rapikanNama(form.nama.value);
    const email = VAL.rapikanEmail(form.email.value);
    const pw = form.password.value, k = form.konfirmasi.value;
    const ok = [
      UI.setErr(form, "nama", VAL.nama(nama)),
      UI.setErr(form, "email", VAL.email(email)),
      UI.setErr(form, "password", VAL.password(pw, email)),
      UI.setErr(form, "konfirmasi", VAL.konfirmasi(pw, k))
    ].every(Boolean);
    if (!ok) { UI.focusFirstErr(form); return; }
    if (!sb()) { UI.banner(banner, "warn", "Tidak dapat terhubung ke server akun."); return; }

    const btn = form.querySelector("button[type=submit]");
    UI.busy(btn, true, "Mendaftarkan…");
    const { data, error } = await sb().auth.signUp({
      email, password: pw,
      options: { data: { nama_lengkap: nama }, emailRedirectTo: AUTH.redirectUrl("verifikasi") }
    }).catch((e) => ({ data: null, error: e }));
    UI.busy(btn, false);
    form.password.value = ""; form.konfirmasi.value = ""; // jangan biarkan sandi tertinggal di form

    if (error) { UI.banner(banner, "warn", esc(VAL.pesan(error))); return; }
    // Supabase tidak membocorkan email terdaftar: akun lama dikembalikan tanpa "identities".
    if (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      UI.setErr(form, "email", "Email ini sudah terdaftar.");
      UI.banner(banner, "warn", `Email <b>${esc(email)}</b> sudah terdaftar. Silakan <a class="link" href="#masuk">masuk</a> atau gunakan <a class="link" href="#lupa-sandi">Lupa kata sandi</a>.`);
      UI.focusFirstErr(form);
      return;
    }
    if (data && data.session) {
      // Seharusnya tidak terjadi bila "Confirm email" aktif di Supabase
      A.toast("Akun dibuat.");
      AUTH.go("#dashboard");
      return;
    }
    VAL.jeda("verifikasi:" + email, 60);
    const card = form.closest(".auth-card");
    card.innerHTML = cekEmail(email);
    const rb = card.querySelector("[data-resend]");
    UI.cooldown(rb, "verifikasi:" + email, "Kirim ulang email verifikasi");
    A.afterPaint(card);
  }

  document.addEventListener("submit", (e) => { if (e.target.id === "registerForm") { e.preventDefault(); submit(e.target); } });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-resend]"); if (b) kirimUlang(b);
    if (e.target.closest("[data-daftar-ulang]")) A.route({ quiet: true });
  });

  A.addView("daftar", view, { guestOnly: true, navKey: "akun", after: () => document.getElementById("f-nama")?.focus() });
  window.SM_REGISTER = { kirimUlang };
})();

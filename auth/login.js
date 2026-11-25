/* =========================================================
   auth/login.js — Masuk (#masuk)
   Email + kata sandi → supabase.auth.signInWithPassword().
   Akun yang belum diverifikasi ditolak (oleh server Supabase) dan
   pengguna ditawari kirim ulang email verifikasi.
   ========================================================= */
(() => {
  const A = window.SM_APP, UI = window.SM_AUTH_UI, VAL = window.SM_VALID, AUTH = window.SM_AUTH;
  const { esc, ic } = A;
  const sb = () => AUTH.client;
  let gagal = []; // waktu percobaan gagal (jeda bertahap di sisi browser; batas utama tetap di server)

  function view() {
    return UI.shell({
      crumb: "Masuk",
      judul: "Masuk ke SobatMusafir",
      sub: "Gunakan email dan kata sandi akun Anda.",
      isi: `
        <div id="loginBanner" hidden></div>
        <form class="form auth-form" id="loginForm" novalidate>
          ${UI.field({ name: "email", label: "Email", type: "email", auto: "username", icon: "mail", extra: 'maxlength="254" required inputmode="email"' })}
          ${UI.sandi({ name: "password", label: "Kata sandi", auto: "current-password" })}
          <div class="auth-row"><span></span><a class="link" href="#lupa-sandi">Lupa kata sandi?</a></div>
          <button class="btn btn-primary btn-block" type="submit">${ic("login")}Masuk</button>
          <p class="small muted center-text">Belum punya akun? <a class="link" href="#daftar">Daftar gratis</a></p>
        </form>
        ${AUTH.client ? "" : `<p class="auth-banner warn">${ic("info")}<span>Koneksi ke server akun belum tersedia di tampilan ini.</span></p>`}`
    });
  }

  function after() {
    const n = AUTH.ambilNotice("masuk");
    const banner = document.getElementById("loginBanner");
    if (n) UI.banner(banner, n.jenis, n.html + (n.kirimUlang ? tombolKirimUlang() : ""));
    else {
      let next = null; try { next = sessionStorage.getItem("sm:next"); } catch { /* abaikan */ }
      if (next) UI.banner(banner, "info", "Silakan masuk terlebih dahulu untuk membuka halaman tersebut.");
    }
    document.getElementById("f-email")?.focus();
  }
  const tombolKirimUlang = () => `<div class="chips" style="margin-top:8px"><button class="btn btn-soft btn-sm" type="button" data-resend-login>Kirim ulang email verifikasi</button></div>`;

  async function submit(form) {
    UI.clearErr(form);
    const banner = document.getElementById("loginBanner");
    UI.banner(banner, "", "");
    const email = VAL.rapikanEmail(form.email.value);
    const pw = form.password.value;
    const ok = [UI.setErr(form, "email", VAL.email(email)), UI.setErr(form, "password", pw ? "" : "Kata sandi wajib diisi.")].every(Boolean);
    if (!ok) { UI.focusFirstErr(form); return; }
    if (!sb()) { UI.banner(banner, "warn", "Tidak dapat terhubung ke server akun."); return; }

    // Jeda bertahap setelah 5 kali gagal dalam 10 menit
    const now = Date.now();
    gagal = gagal.filter((t) => now - t < 10 * 60 * 1000);
    const sisa = VAL.jeda("login");
    if (sisa > 0) { UI.banner(banner, "warn", `Terlalu banyak percobaan. Coba lagi dalam ${sisa} detik.`); return; }

    const btn = form.querySelector("button[type=submit]");
    UI.busy(btn, true, "Memeriksa…");
    const { data, error } = await sb().auth.signInWithPassword({ email, password: pw }).catch((e) => ({ data: null, error: e }));
    UI.busy(btn, false);

    if (error) {
      form.password.value = "";
      const kode = error.code || "";
      if (kode === "email_not_confirmed" || /not confirmed/i.test(error.message || "")) {
        form.dataset.email = email;
        UI.banner(banner, "warn", esc(VAL.pesan(error)) + tombolKirimUlang());
      } else {
        if (kode === "invalid_credentials" || /Invalid login/i.test(error.message || "")) {
          gagal.push(now);
          if (gagal.length >= 5) { VAL.jeda("login", 60); gagal = []; }
        }
        UI.banner(banner, "warn", esc(VAL.pesan(error)));
      }
      form.password.focus();
      return;
    }
    const user = data && data.user;
    if (user && !user.email_confirmed_at && !user.confirmed_at) { // pertahanan tambahan
      await sb().auth.signOut({ scope: "local" });
      UI.banner(banner, "warn", "Email Anda belum diverifikasi." + tombolKirimUlang());
      return;
    }
    gagal = [];
    try { sessionStorage.removeItem("sm:recovery"); } catch { /* abaikan */ }
    await AUTH.setUser(user); // status sesi diperbarui sebelum pindah ke halaman terproteksi
    A.toast("Berhasil masuk. Selamat datang!");
    location.hash = AUTH.tujuanSetelahLogin();
  }

  async function kirimUlang(btn) {
    const form = document.getElementById("loginForm");
    const email = VAL.rapikanEmail((form && (form.dataset.email || form.email.value)) || "");
    const banner = document.getElementById("loginBanner");
    if (VAL.email(email)) { UI.setErr(form, "email", "Isi email Anda terlebih dahulu."); form.email.focus(); return; }
    const kunci = "verifikasi:" + email;
    if (VAL.jeda(kunci) > 0) { UI.cooldown(btn, kunci, "Kirim ulang email verifikasi"); return; }
    UI.busy(btn, true, "Mengirim…");
    const { error } = await sb().auth.resend({ type: "signup", email, options: { emailRedirectTo: AUTH.redirectUrl("verifikasi") } });
    VAL.jeda(kunci, 60);
    if (error) UI.banner(banner, "warn", esc(VAL.pesan(error)));
    else UI.banner(banner, "ok", `Jika <b>${esc(email)}</b> terdaftar dan belum aktif, email verifikasi baru sudah dikirim. Cek kotak masuk & folder spam.`);
  }

  document.addEventListener("submit", (e) => { if (e.target.id === "loginForm") { e.preventDefault(); submit(e.target); } });
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-resend-login]"); if (b) kirimUlang(b); });

  A.addView("masuk", view, { guestOnly: true, navKey: "akun", after });
})();

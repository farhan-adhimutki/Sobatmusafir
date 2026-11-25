/* =========================================================
   auth/session.js — manajemen sesi (Supabase Auth)
   - Membaca sesi tersimpan saat halaman dibuka (tidak perlu login ulang).
   - Memverifikasi sesi ke server Supabase (getUser).
   - Memproses tautan email: verifikasi berhasil, reset password, kedaluwarsa.
   - Memuat profil dari tabel public.profiles (dilindungi RLS).
   ========================================================= */
window.SM_AUTH = (() => {
  const sb = window.SM_SB;
  const URLINFO = window.SM_AUTH_URL || {};
  const state = {
    ready: false,                 // status sesi sudah diketahui
    user: null,                   // pengguna Supabase Auth
    profile: null,                // baris public.profiles milik pengguna
    recovery: false,              // sedang dalam alur reset password
    processing: URLINFO.adaToken || !!URLINFO.errorCode, // sedang memproses tautan email
    sambutan: false,
    notice: null                  // pesan untuk halaman berikutnya { jenis, html, untuk }
  };
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } });

  const baseUrl = () => location.origin + location.pathname;
  /* Alamat tujuan tautan email. Harus didaftarkan di Supabase → Authentication → URL Configuration */
  const redirectUrl = (tujuan) => `${baseUrl()}?auth=${tujuan}`;

  function bersihkanUrl() {
    if (location.search && /[?&](auth|error|error_code|error_description|type)=/.test(location.search)) {
      history.replaceState(history.state, "", location.pathname + location.hash);
    }
  }
  function go(hash) { if (location.hash !== hash) location.hash = hash; else window.SM_APP.route({ quiet: true }); }
  function tujuanSetelahLogin() {
    let next = "#dashboard";
    try { next = sessionStorage.getItem("sm:next") || next; sessionStorage.removeItem("sm:next"); } catch { /* abaikan */ }
    return /^#[a-z0-9-]+$/.test(next) ? next : "#dashboard";
  }

  async function loadProfile() {
    if (!sb || !state.user) { state.profile = null; return null; }
    const { data, error } = await sb.from("profiles").select("id, nama_lengkap, created_at, updated_at").eq("id", state.user.id).maybeSingle();
    if (error) throw error;
    state.profile = data || null;
    return state.profile;
  }
  async function updateNama(nama) {
    const { data, error } = await sb.from("profiles").update({ nama_lengkap: nama }).eq("id", state.user.id).select("id, nama_lengkap, created_at, updated_at").single();
    if (error) throw error;
    state.profile = data;
    emit();
    return data;
  }

  async function setUser(user) {
    const sebelum = state.user ? state.user.id : null;
    // Tolak sesi akun yang belum terverifikasi (pertahanan tambahan selain dari server)
    if (user && !user.email_confirmed_at && !user.confirmed_at) {
      await sb.auth.signOut({ scope: "local" }).catch(() => null);
      user = null;
    }
    state.user = user || null;
    if (!user) state.profile = null;
    else if (sebelum !== user.id) await loadProfile().catch(() => null);
    window.SM_APP.setUser(state.user);
    emit();
  }

  /* Dipanggil sekali saat tautan email berhasil diproses */
  function selesaiVerifikasi() {
    if (state.sambutan) return;
    state.sambutan = true; state.processing = false; state.ready = true; bersihkanUrl();
    window.SM_APP.toast("Email berhasil diverifikasi. Selamat datang di SobatMusafir!");
    go("#dashboard");
  }
  function mulaiReset() {
    state.recovery = true; state.processing = false; state.ready = true;
    try { sessionStorage.setItem("sm:recovery", "1"); } catch { /* abaikan */ }
    bersihkanUrl();
    go("#reset-sandi");
  }

  async function init() {
    if (!sb) { state.ready = true; state.processing = false; emit(); return; }

    sb.auth.onAuthStateChange((event, session) => {
      // Jangan memanggil API Supabase lain secara langsung di sini (rekomendasi SDK) → tunda.
      setTimeout(async () => {
        const user = session ? session.user : null;
        if (event === "PASSWORD_RECOVERY") { await setUser(user); mulaiReset(); return; }
        if (event === "SIGNED_OUT") { state.recovery = false; await setUser(null); return; }
        if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
          if (user && (!state.user || state.user.id !== user.id || event === "USER_UPDATED")) await setUser(user);
          if (event === "SIGNED_IN" && state.processing && (URLINFO.tipe === "signup" || URLINFO.tujuan === "verifikasi")) selesaiVerifikasi();
        }
      }, 0);
    });

    // 1) Sesi tersimpan (cepat, dari penyimpanan browser)
    const { data } = await sb.auth.getSession();
    try { state.recovery = sessionStorage.getItem("sm:recovery") === "1" && !!data.session; } catch { /* abaikan */ }
    if (data.session) {
      // 2) Pastikan sesi masih sah di server Supabase (token tidak dicabut/kedaluwarsa)
      const { data: u, error } = await sb.auth.getUser();
      if (error || !u.user) { await sb.auth.signOut({ scope: "local" }).catch(() => null); await setUser(null); }
      else await setUser(u.user);
    } else {
      await setUser(null);
    }

    // Tautan email berhasil diproses SDK sebelum pendengar event terpasang
    if (state.processing && state.user) {
      if (URLINFO.tipe === "recovery" || URLINFO.tujuan === "reset") mulaiReset(); else selesaiVerifikasi();
      emit();
      return;
    }

    // 3) Tautan email kedaluwarsa / tidak valid
    if (URLINFO.errorCode) {
      const reset = URLINFO.tujuan === "reset" || URLINFO.tipe === "recovery";
      state.notice = {
        untuk: reset ? "lupa-sandi" : "masuk",
        jenis: "warn",
        html: reset
          ? "<b>Tautan reset kata sandi sudah kedaluwarsa atau sudah dipakai.</b> Masukkan email Anda untuk menerima tautan baru."
          : "<b>Tautan verifikasi sudah kedaluwarsa atau sudah dipakai.</b> Jika akun belum aktif, kirim ulang email verifikasi di bawah. Jika sudah aktif, silakan masuk.",
        kirimUlang: !reset
      };
      state.processing = false; bersihkanUrl();
      if (location.hash && /error/.test(location.hash)) history.replaceState(history.state, "", location.pathname);
      state.ready = true; emit();
      go(reset ? "#lupa-sandi" : "#masuk");
      return;
    }
    // Tautan verifikasi dibuka tetapi sesi tidak terbentuk (mis. sudah terverifikasi sebelumnya)
    if (state.processing && !state.user && !URLINFO.adaToken) state.processing = false;
    if (URLINFO.tujuan === "verifikasi" && !URLINFO.adaToken && !state.user) {
      state.notice = { untuk: "masuk", jenis: "ok", html: "Email Anda sudah terverifikasi. Silakan masuk." };
      bersihkanUrl();
    }
    // Pengaman: jangan tertahan di layar "memproses" lebih dari 6 detik
    if (state.processing) setTimeout(() => { if (state.processing) { state.processing = false; bersihkanUrl(); window.SM_APP.route({ quiet: true }); } }, 6000);

    state.ready = true;
    emit();
    window.SM_APP.route({ quiet: true });
  }

  function ambilNotice(halaman) {
    if (state.notice && state.notice.untuk === halaman) { const n = state.notice; state.notice = null; return n; }
    return null;
  }

  return {
    state, init, setUser, loadProfile, updateNama, redirectUrl, tujuanSetelahLogin, ambilNotice, go,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get client() { return sb; }
  };
})();

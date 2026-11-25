/* =========================================================
   auth/supabase-client.js — konfigurasi Supabase
   Membuat SATU klien Supabase (SDK JavaScript v2) untuk seluruh situs.
   - Memakai Publishable Key dari config.js (aman di browser).
   - Sesi disimpan & diperpanjang otomatis oleh SDK (mekanisme bawaan Supabase).
     Password TIDAK PERNAH disimpan di browser.
   ========================================================= */
(() => {
  const C = window.SM_CONFIG || {};

  // Catat parameter dari tautan email Supabase SEBELUM SDK membersihkan URL,
  // supaya halaman tahu: verifikasi berhasil, reset password, atau tautan kedaluwarsa.
  const baca = (str) => {
    const out = {};
    new URLSearchParams(str.replace(/^[#?]/, "")).forEach((v, k) => { out[k] = v; });
    return out;
  };
  const q = baca(location.search);
  const h = /access_token=|error=|error_code=/.test(location.hash) ? baca(location.hash) : {};
  window.SM_AUTH_URL = {
    tujuan: q.auth || null,                                   // "verifikasi" | "reset" (dipasang di redirect URL)
    tipe: h.type || q.type || null,                           // "signup" | "recovery" | ...
    adaToken: !!h.access_token,
    errorCode: h.error_code || q.error_code || null,          // mis. "otp_expired"
    errorDesc: h.error_description || q.error_description || null
  };

  window.SM_SB = null;
  if (!window.supabase || !C.supabaseUrl || !C.supabaseKey) return;
  if (/service_role|sb_secret_/i.test(C.supabaseKey)) {
    console.error("config.js berisi secret/service_role key. Ganti dengan Publishable Key!");
    return;
  }
  try {
    window.SM_SB = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, {
      auth: {
        persistSession: true,      // sesi tetap aktif setelah halaman dimuat ulang
        autoRefreshToken: true,    // token diperpanjang otomatis
        detectSessionInUrl: true,  // proses tautan verifikasi/reset dari email
        flowType: "implicit",      // tautan email bisa dibuka di perangkat lain
        storageKey: "sobatmusafir-auth"
      }
    });
  } catch (e) {
    console.error("Gagal membuat klien Supabase", e);
  }
})();

/* =========================================================
   auth/validasi.js — validasi input & pesan kesalahan
   Validasi di sini untuk kenyamanan pengguna. Keamanan sebenarnya tetap
   dijaga server: Supabase Auth (email, password, rate limit) dan
   constraint + RLS di database (tabel profiles).
   ========================================================= */
window.SM_VALID = (() => {
  const POLA_NAMA_TERLARANG = /[<>"/\\;{}=@#$%^&*_+|~`0-9[\]\u0000-\u001f\u007f]/; // sama dengan constraint database
  const PANJANG_MIN = 12;
  const PANJANG_MAX_BYTE = 72; // batas bcrypt

  const rapikanNama = (v) => String(v || "").replace(/\s+/g, " ").trim();
  const rapikanEmail = (v) => String(v || "").trim().toLowerCase();

  function nama(v) {
    const n = rapikanNama(v);
    if (!n) return "Nama lengkap wajib diisi.";
    if (n.length < 2) return "Nama lengkap minimal 2 huruf.";
    if (n.length > 100) return "Nama lengkap maksimal 100 karakter.";
    if (POLA_NAMA_TERLARANG.test(n)) return "Nama hanya boleh berisi huruf, spasi, titik, koma, apostrof, atau tanda hubung.";
    return "";
  }
  function email(v) {
    const e = rapikanEmail(v);
    if (!e) return "Email wajib diisi.";
    if (e.length > 254 || !/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(e)) return "Format email tidak valid. Contoh: nama@email.com";
    return "";
  }
  function password(v, emailVal = "") {
    const p = String(v || "");
    if (!p) return "Kata sandi wajib diisi.";
    if (p.length < PANJANG_MIN) return `Kata sandi minimal ${PANJANG_MIN} karakter (sekarang ${p.length}).`;
    if (new TextEncoder().encode(p).length > PANJANG_MAX_BYTE) return "Kata sandi terlalu panjang (maksimal 72 byte).";
    if (p.trim() !== p) return "Kata sandi tidak boleh diawali atau diakhiri spasi.";
    const e = rapikanEmail(emailVal);
    if (e && p.toLowerCase() === e) return "Kata sandi tidak boleh sama dengan email.";
    return "";
  }
  function konfirmasi(p, k) {
    if (!k) return "Ulangi kata sandi Anda.";
    if (p !== k) return "Konfirmasi kata sandi tidak sama.";
    return "";
  }
  /* Kekuatan 0–4 (saran, bukan syarat) */
  function kekuatan(p) {
    p = String(p || "");
    let skor = 0;
    if (p.length >= PANJANG_MIN) skor++;
    if (p.length >= 16) skor++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) skor++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) skor++;
    if (/(.)\1{3,}/.test(p) || /^(?:123456|password|sandi|qwerty)/i.test(p)) skor = Math.min(skor, 1);
    const label = ["Sangat lemah", "Lemah", "Cukup", "Kuat", "Sangat kuat"][skor];
    return { skor, label };
  }

  /* Pesan kesalahan Supabase Auth → bahasa yang mudah dipahami */
  function pesan(err) {
    const kode = (err && (err.code || err.error_code)) || "";
    const m = String((err && (err.message || err.msg || err.error_description)) || err || "");
    const tunggu = m.match(/after (\d+) seconds?/i);
    if (kode === "invalid_credentials" || /Invalid login credentials/i.test(m)) return "Email atau kata sandi salah.";
    if (kode === "email_not_confirmed" || /Email not confirmed/i.test(m)) return "Email Anda belum diverifikasi. Buka tautan verifikasi di kotak masuk (cek juga folder spam), atau kirim ulang emailnya.";
    if (kode === "user_already_exists" || /already registered/i.test(m)) return "Email ini sudah terdaftar. Silakan masuk atau gunakan Lupa kata sandi.";
    if (kode === "weak_password" || /Password should/i.test(m)) return "Kata sandi terlalu lemah. Gunakan minimal 12 karakter dengan kombinasi huruf, angka, dan simbol.";
    if (kode === "same_password") return "Kata sandi baru harus berbeda dari kata sandi lama.";
    if (kode === "email_address_invalid") return "Alamat email ini tidak dapat digunakan. Periksa kembali penulisannya.";
    if (kode === "email_address_not_authorized" || /not authorized/i.test(m)) return "Server email belum mengizinkan pengiriman ke alamat ini. Hubungi admin SobatMusafir.";
    if (kode === "over_email_send_rate_limit" || /email rate limit/i.test(m)) return "Terlalu banyak email dikirim. Coba lagi beberapa menit lagi.";
    if (tunggu) return `Demi keamanan, tunggu ${tunggu[1]} detik sebelum mencoba lagi.`;
    if (kode === "over_request_rate_limit" || /rate limit|too many/i.test(m)) return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
    if (kode === "otp_expired" || /expired|invalid.*link/i.test(m)) return "Tautan sudah kedaluwarsa atau sudah pernah dipakai.";
    if (kode === "session_not_found" || kode === "refresh_token_not_found" || /Auth session missing/i.test(m)) return "Sesi Anda sudah berakhir. Silakan masuk kembali.";
    if (kode === "reauthentication_needed") return "Demi keamanan, silakan masuk ulang sebelum mengganti kata sandi.";
    if (kode === "23514" || /check constraint/i.test(m)) return "Data tidak sesuai format yang diizinkan.";
    if (/Failed to fetch|NetworkError|Load failed|fetch|terlalu lama|timeout/i.test(m)) return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    return "Terjadi kesalahan. Silakan coba lagi.";
  }

  /* Jeda tombol (mis. kirim ulang email) — mencegah klik beruntun */
  function jeda(kunci, detik) {
    const k = "sm:jeda:" + kunci;
    if (detik) { try { sessionStorage.setItem(k, String(Date.now() + detik * 1000)); } catch { /* abaikan */ } }
    let sampai = 0;
    try { sampai = Number(sessionStorage.getItem(k) || 0); } catch { /* abaikan */ }
    return Math.max(0, Math.ceil((sampai - Date.now()) / 1000));
  }

  return { nama, email, password, konfirmasi, kekuatan, pesan, jeda, rapikanNama, rapikanEmail, PANJANG_MIN };
})();

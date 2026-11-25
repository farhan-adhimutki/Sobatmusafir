/* =========================================================
   auth/logout.js — Keluar
   supabase.auth.signOut() menghapus sesi bawaan Supabase dari browser
   dan mencabut refresh token di server. Setelah itu → halaman Masuk.
   Tombol: elemen apa pun dengan data-logout (atau data-logout="global"
   untuk keluar dari semua perangkat).
   ========================================================= */
window.SM_LOGOUT = (() => {
  const A = window.SM_APP, AUTH = window.SM_AUTH;

  async function logout(scope = "local") {
    const sb = AUTH.client;
    if (sb) {
      const { error } = await sb.auth.signOut({ scope }).catch((e) => ({ error: e }));
      // Jika server tidak terjangkau, tetap hapus sesi lokal
      if (error) await sb.auth.signOut({ scope: "local" }).catch(() => null);
    }
    try { sessionStorage.removeItem("sm:recovery"); sessionStorage.removeItem("sm:next"); } catch { /* abaikan */ }
    AUTH.state.recovery = false;
    await AUTH.setUser(null);
    A.closeModal();
    A.toast(scope === "global" ? "Anda sudah keluar dari semua perangkat." : "Anda sudah keluar.");
    location.hash = "#masuk";
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-logout]"); if (!b) return;
    e.preventDefault();
    b.disabled = true;
    logout(b.dataset.logout === "global" ? "global" : "local").finally(() => { b.disabled = false; });
  });

  return { logout };
})();

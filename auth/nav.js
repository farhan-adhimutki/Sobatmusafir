/* =========================================================
   auth/nav.js — tombol akun di header (memakai tombol "Masuk" yang sudah ada)
   Belum login : tombol "Masuk" → #masuk
   Sudah login : avatar + nama → menu (Dashboard, Itinerary, Keluar)
   ========================================================= */
window.SM_NAV = (() => {
  const A = window.SM_APP, AUTH = window.SM_AUTH;
  const { $, esc, ic } = A;
  const btn = $("#loginBtn");
  if (!btn) return { render() {} };

  // Bungkus tombol lama dengan komponen dropdown (.dd) yang sudah dipakai menu "Panduan Halal"
  const wrap = document.createElement("div");
  wrap.className = "dd dd-akun";
  btn.parentNode.insertBefore(wrap, btn);
  wrap.appendChild(btn);
  const menu = document.createElement("div");
  menu.className = "dd-menu dd-right";
  menu.setAttribute("role", "menu");
  menu.id = "akunMenu";
  wrap.appendChild(menu);
  btn.setAttribute("aria-haspopup", "menu");

  const inisial = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();

  function render() {
    const u = AUTH.state.user;
    if (!u) {
      btn.innerHTML = `${ic("login")}<span>${esc(A.t("nav.login"))}</span>`;
      btn.setAttribute("aria-label", A.t("nav.login"));
      btn.removeAttribute("aria-expanded");
      btn.classList.remove("is-user");
      wrap.classList.remove("open");
      menu.innerHTML = "";
      return;
    }
    const nama = (AUTH.state.profile && AUTH.state.profile.nama_lengkap) || (u.email || "Akun").split("@")[0];
    const depan = nama.split(" ")[0];
    btn.classList.add("is-user");
    btn.innerHTML = `<span class="avatar sm" aria-hidden="true">${esc(inisial(nama))}</span><span>${esc(depan.length > 12 ? depan.slice(0, 11) + "…" : depan)}</span>`;
    btn.setAttribute("aria-label", `Akun ${nama}`);
    btn.setAttribute("aria-expanded", String(wrap.classList.contains("open")));
    menu.innerHTML = `
      <div class="dd-head"><b>${esc(nama)}</b><small>${esc(u.email || "")}</small></div>
      <a href="#dashboard" role="menuitem">${ic("users")}<span>Dashboard</span></a>
      <a href="#rencana" role="menuitem">${ic("route")}<span>Itinerary saya</span></a>
      <a href="#kuliner" role="menuitem">${ic("bookmark")}<span>Favorit saya</span></a>
      <button type="button" role="menuitem" data-logout>${ic("login")}<span>Keluar</span></button>`;
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!AUTH.state.user) { location.hash = "#masuk"; return; }
    const open = wrap.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target) || e.target.closest(".dd-menu a,[data-logout]")) { wrap.classList.remove("open"); if (AUTH.state.user) btn.setAttribute("aria-expanded", "false"); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") wrap.classList.remove("open"); });

  AUTH.onChange(render);
  render();
  return { render };
})();

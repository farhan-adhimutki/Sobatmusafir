/* =========================================================
   auth/dashboard.js — Dashboard (#dashboard), HANYA untuk pengguna login
   Proteksi berlapis:
   1) Router menolak membuka #dashboard tanpa sesi Supabase (→ #masuk).
   2) Data profil dibaca dari public.profiles yang dilindungi RLS:
      tanpa token login yang sah, database tidak mengembalikan apa pun.
   ========================================================= */
(() => {
  const A = window.SM_APP, UI = window.SM_AUTH_UI, VAL = window.SM_VALID, AUTH = window.SM_AUTH;
  const { esc, ic, D, S } = A;

  const tgl = (iso) => iso ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(iso)) : "-";
  const jam = (iso) => iso ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(iso)) + " WIB" : "-";
  const inisial = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();

  function view() {
    const u = AUTH.state.user, p = AUTH.state.profile || {};
    const nama = p.nama_lengkap || (u.email || "").split("@")[0];
    const favs = D.tempat.filter((t) => S.favs.includes(t.id));
    const stops = S.plan || [];
    const sholat = stops.filter((s) => s.jenis === "sholat").length;
    const next = [...stops].sort((a, b) => a.hari - b.hari || a.mulai.localeCompare(b.mulai)).find((s) => !s.selesaiDikunjungi);
    return `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${esc(A.t("nav.home"))}</a><span class="sep">/</span><span>Dashboard</span></nav>
      <div class="head-row">
        <div class="dash-hello">
          <span class="avatar" aria-hidden="true">${esc(inisial(nama))}</span>
          <div><h1>Halo, ${esc(nama.split(" ")[0])}!</h1>
          <div class="chips" style="margin-top:10px"><span class="chip chip-solid">${ic("badge")}Email terverifikasi</span><span class="chip">${ic("cal")}Bergabung ${esc(tgl(p.created_at || u.created_at))}</span></div></div>
        </div>
        <div class="chips"><a class="btn btn-soft btn-sm" href="#rencana">${ic("route")}Buka Itinerary</a><button class="btn btn-ghost btn-sm" type="button" data-logout>${ic("login")}Keluar</button></div>
      </div>
    </div>
    <div class="wrap dash">
      <div class="dash-stats">
        <div class="fact"><span class="qi">${ic("bookmark")}</span><div><b><span data-count="${favs.length}">0</span> tempat</b><small>Favorit tersimpan</small></div></div>
        <div class="fact"><span class="qi">${ic("route")}</span><div><b><span data-count="${stops.length - sholat}">0</span> titik</b><small>Itinerary perjalanan</small></div></div>
        <div class="fact"><span class="qi">${ic("mosque")}</span><div><b><span data-count="${sholat}">0</span> jeda</b><small>Sholat terjadwal</small></div></div>
        <div class="fact"><span class="qi">${ic("pin")}</span><div><b>${next ? esc(next.mulai) + " WIB" : "Selesai"}</b><small>${next ? "Next stop: " + esc(next.judul) : "Semua titik dikunjungi"}</small></div></div>
      </div>

      <div class="split">
        <section class="panel">
          <div class="card-row"><h2 class="dash-h">Profil saya</h2><span class="small muted">Diperbarui ${esc(jam(p.updated_at))}</span></div>
          <div class="kv">
            <div><span>Email</span><b>${esc(u.email || "-")}</b></div>
            <div><span>Terakhir masuk</span><b>${esc(jam(u.last_sign_in_at))}</b></div>
            <div><span>ID akun</span><b class="mono">${esc(u.id.slice(0, 8))}…</b></div>
          </div>
          <div id="profilBanner" hidden style="margin-top:12px"></div>
          <form class="form auth-form" id="profilForm" novalidate style="margin-top:14px">
            ${UI.field({ name: "nama", label: "Nama lengkap", auto: "name", icon: "users", value: p.nama_lengkap || "", extra: 'maxlength="100" required' })}
            <button class="btn btn-primary" type="submit">${ic("check")}Simpan nama</button>
          </form>
        </section>

        <section class="panel">
          <h2 class="dash-h">Keamanan akun</h2>
          <p class="small muted" style="margin-top:4px">Ganti kata sandi. Sesi di perangkat lain akan dikeluarkan.</p>
          <div id="sandiBanner" hidden style="margin-top:12px"></div>
          <form class="form auth-form" id="gantiSandiForm" novalidate style="margin-top:12px">
            <input type="text" name="username" autocomplete="username" value="${esc(u.email || "")}" hidden>
            ${UI.sandi({ name: "password", label: "Kata sandi baru", meter: true })}
            ${UI.sandi({ name: "konfirmasi", label: "Ulangi kata sandi baru" })}
            <button class="btn btn-primary" type="submit">${ic("shield")}Ganti kata sandi</button>
          </form>
          <div class="dash-danger">
            <button class="btn btn-ghost btn-sm" type="button" data-logout>${ic("login")}Keluar</button>
            <button class="btn btn-ghost btn-sm" type="button" data-logout="global">${ic("users")}Keluar dari semua perangkat</button>
          </div>
        </section>
      </div>

      <section>
        <div class="sec-head" style="margin:28px 0 16px"><div><span class="eyebrow">${ic("bookmark")}Tersimpan di akun Anda</span><h2>Favorit saya</h2></div><a class="link" href="#kuliner">Cari tempat lain${ic("arrow")}</a></div>
        ${favs.length ? `<div class="grid g3">${favs.map((t) => A.tempatCard(t, "list")).join("")}</div>`
          : `<div class="empty">${ic("bookmark")}<p>Belum ada favorit. Buka detail tempat lalu tekan <b>Simpan</b>.</p><a class="btn btn-soft btn-sm" href="#kuliner">Jelajahi kuliner halal</a></div>`}
      </section>
    </div>`;
  }

  async function simpanNama(form) {
    UI.clearErr(form);
    const banner = document.getElementById("profilBanner");
    const nama = VAL.rapikanNama(form.nama.value);
    if (!UI.setErr(form, "nama", VAL.nama(nama))) { UI.focusFirstErr(form); return; }
    const btn = form.querySelector("button[type=submit]");
    UI.busy(btn, true, "Menyimpan…");
    try {
      await AUTH.updateNama(nama);
      UI.banner(banner, "ok", "Nama berhasil disimpan.");
      window.SM_NAV?.render();
      const h1 = document.querySelector(".dash-hello h1"); if (h1) h1.textContent = `Halo, ${nama.split(" ")[0]}!`;
      const av = document.querySelector(".dash-hello .avatar"); if (av) av.textContent = inisial(nama);
    } catch (e) { UI.banner(banner, "warn", esc(VAL.pesan(e))); }
    UI.busy(btn, false);
  }

  document.addEventListener("submit", (e) => {
    if (e.target.id === "profilForm") { e.preventDefault(); simpanNama(e.target); }
    if (e.target.id === "gantiSandiForm") { e.preventDefault(); window.SM_RECOVERY.resetSubmit(e.target, { tujuan: null, bannerId: "sandiBanner" }).then((ok) => ok && UI.banner(document.getElementById("sandiBanner"), "ok", "Kata sandi berhasil diganti.")); }
  });

  // Jika sesi berakhir saat dashboard terbuka (mis. logout di tab lain) → ke halaman Masuk
  AUTH.onChange((st) => { if (st.ready && !st.user && location.hash === "#dashboard" && document.querySelector(".dash")) A.route({ quiet: true }); });

  A.addView("dashboard", view, { protected: true, navKey: "akun" });
})();

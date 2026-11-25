/* =========================================================
   SobatMusafir Jambi — script.js
   Navigasi halaman (hash), jadwal sholat & kiblat (dihitung),
   filter/pencarian, itinerary, mode gelap, bahasa ID/EN,
   koneksi Supabase (konten, akun, favorit, itinerary, mitra) lewat db.js.
   ========================================================= */
{
  const D = window.SM_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (n, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const rp = (n) => "Rp " + Number(n).toLocaleString("id-ID");
  const app = $("#app");

  /* ---------- Penyimpanan lokal (aman bila diblokir) ---------- */
  const store = {
    get(k, def) { try { const v = localStorage.getItem("sm:" + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
    set(k, v) { try { localStorage.setItem("sm:" + k, JSON.stringify(v)); } catch { /* abaikan */ } }
  };
  /* Konten terakhir dari database (cache) → tampilan langsung terbaru, lalu diperbarui di latar */
  const DB = window.SM_DB || { ready: false };
  const cache = store.get("cache", null);
  if (cache && cache.data) Object.assign(D, cache.data);

  const S = {
    user: null,
    lang: store.get("lang", "id"),
    theme: store.get("theme", null),
    region: store.get("region", "kota-jambi"),
    adzan: store.get("adzan", true),
    favs: store.get("favs", []),
    plan: store.get("plan", null) || structuredClone(D.itinerary),
    gps: null,
    fired: {}
  };

  /* ---------- Bahasa ---------- */
  const T = {
    id: {
      "nav.home": "Beranda", "nav.explore": "Jelajah", "nav.guide": "Panduan Halal", "nav.plan": "Rencana Perjalanan", "nav.about": "Tentang", "nav.login": "Masuk",
      "cat.food": "Kuliner Halal", "cat.mosque": "Musholla & Masjid", "cat.prayer": "Jadwal Sholat & Kiblat", "cat.hotel": "Hotel Syariah", "cat.tour": "Tempat Wisata",
      "foot.about": "Pemandu perjalanan ramah Muslim terpercaya di Bumi Melayu Jambi. Menghubungkan pelancong dengan destinasi bernilai syariah, kuliner halal terkurasi, dan pemberdayaan UMKM lokal.",
      "foot.badge": "Terhubung dengan Standar Halal Kemenag & MUI Jambi", "foot.dest": "Destinasi Jambi", "foot.guide": "Panduan Muslim", "foot.partner": "Kemitraan UMKM", "foot.copy": "Hak Cipta Dilindungi Undang-Undang.",
      "foot.note": "Foto pada situs ini masih ilustrasi pengganti. Jadwal sholat dihitung otomatis.",
      "hero.eyebrow": "Portal Resmi Wisata Ramah Muslim", "hero.t1": "Tenang Ibadahnya, Yakin Halalnya,", "hero.t2": "Nyaman Wisatanya",
      "hero.lead": "Platform kurasi destinasi ramah Muslim, kuliner halal tersertifikasi, dan penggerak ekonomi UMKM lokal terbaik.",
      "search.ph": "Cari kuliner halal, masjid terdekat, atau tempat wisata...", "search.btn": "Cari", "search.allcat": "Semua Kategori", "search.allreg": "Semua Wilayah",
      "search.radius": "Radius masjid:", "search.fac": "Fasilitas:", "search.res": "hasil ditemukan", "search.none": "Tidak ada hasil. Coba kata kunci lain atau longgarkan filter.",
      "dest.eyebrow": "Eksplorasi Warisan & Kemegahan Jambi", "dest.title": "Destinasi Populer Favorit Musafir", "dest.lead": "Rekomendasi destinasi cagar budaya, sungai bersejarah, dan mahakarya arsitektur ibadah di Jambi.",
      "dest.cta": "Eksplorasi Fasilitas", "dest.all": "Lihat Semua Destinasi",
      "food.eyebrow": "Kurasi Rasa Otentik Melayu Jambi", "food.title": "Jelajah Kuliner & UMKM Halal Jambi", "food.lead": "Cita rasa otentik khas bumi Sepucuk Jambi Sembilan Lurah dengan jaminan kehalalan, higienitas, dan keberkahan lokal.",
      "food.all": "Lihat Semua Kuliner", "food.detail": "Lihat Detail & Rute",
      "promo.eyebrow": "Smart Halal Travel Itinerary", "promo.title": "Rencanakan Perjalanan dengan Tenang", "promo.lead": "Buat itinerary perjalanan harian di Jambi yang otomatis menyesuaikan waktu sholat, rute masjid terdekat, dan pilihan kuliner halal favorit Anda.",
      "promo.start": "Mulai Rencana Perjalanan", "promo.pack": "Lihat Contoh Itinerary",
      "feat.eyebrow": "Fitur Interaktif SobatMusafir", "feat.title": "Coba Fitur Utama", "feat.lead": "Pencari kuliner halal, detail destinasi ramah Muslim, dan jadwal sholat waktu nyata Kota Jambi.",
      "feat.t1": "Pencari Kuliner Halal", "feat.t2": "Detail Destinasi", "feat.t3": "Jadwal Sholat Live",
      "pw.title": "Jadwal Sholat & Pengingat Adzan", "pw.toward": "Menuju Sholat", "pw.alert": "Pengingat Suara Adzan", "pw.test": "Tes Notifikasi", "pw.listen": "Dengarkan Nada Pengingat",
      "pw.sound": "Suara", "pw.qibla": "Arah Kiblat", "pw.change": "Ubah Pengingat Adzan", "pw.compass": "Buka Kompas Kiblat",
      "p.subuh": "Subuh", "p.terbit": "Terbit", "p.dzuhur": "Dzuhur", "p.ashar": "Ashar", "p.maghrib": "Maghrib", "p.isya": "Isya",
      "st.done": "Selesai", "st.next": "Berikutnya", "st.up": "Mendatang", "open": "Buka Sekarang", "closed": "Tutup", "detail": "Lihat Detail", "back": "Kembali", "save": "Simpan", "saved": "Tersimpan", "share": "Bagikan", "directions": "Petunjuk Arah"
    },
    en: {
      "nav.home": "Home", "nav.explore": "Explore", "nav.guide": "Halal Guide", "nav.plan": "Plan Your Trip", "nav.about": "About", "nav.login": "Sign in",
      "cat.food": "Halal Food", "cat.mosque": "Prayer Rooms & Mosques", "cat.prayer": "Prayer Times & Qibla", "cat.hotel": "Sharia Hotels", "cat.tour": "Attractions",
      "foot.about": "A trusted Muslim-friendly travel guide to Jambi. Connecting travellers with sharia-friendly destinations, curated halal food, and local small businesses.",
      "foot.badge": "Aligned with Kemenag & MUI Jambi halal standards", "foot.dest": "Jambi Destinations", "foot.guide": "Muslim Guide", "foot.partner": "MSME Partnership", "foot.copy": "All rights reserved.",
      "foot.note": "Photos on this site are placeholder illustrations. Prayer times are calculated automatically.",
      "hero.eyebrow": "Official Muslim-Friendly Travel Portal", "hero.t1": "Pray in Peace, Eat with Certainty,", "hero.t2": "Travel in Comfort",
      "hero.lead": "Curated Muslim-friendly destinations, certified halal food, and the best of Jambi's local small businesses.",
      "search.ph": "Search halal food, nearby mosques, or attractions...", "search.btn": "Search", "search.allcat": "All Categories", "search.allreg": "All Regions",
      "search.radius": "Mosque radius:", "search.fac": "Facilities:", "search.res": "results found", "search.none": "No results. Try another keyword or loosen the filters.",
      "dest.eyebrow": "Explore Jambi's Heritage", "dest.title": "Travellers' Favourite Destinations", "dest.lead": "Heritage sites, historic rivers, and masterpieces of Islamic architecture in Jambi.",
      "dest.cta": "Explore Facilities", "dest.all": "See All Destinations",
      "food.eyebrow": "Authentic Jambi Malay Flavours", "food.title": "Halal Food & Local Makers", "food.lead": "Authentic Jambi flavours with assured halal status, hygiene, and local blessing.",
      "food.all": "See All Food", "food.detail": "Details & Route",
      "promo.eyebrow": "Smart Halal Travel Itinerary", "promo.title": "Plan Your Journey with Confidence", "promo.lead": "Build a daily Jambi itinerary that adapts to prayer times, nearby mosques, and your favourite halal food.",
      "promo.start": "Start Planning", "promo.pack": "See Sample Itinerary",
      "feat.eyebrow": "SobatMusafir Interactive Features", "feat.title": "Try the Key Features", "feat.lead": "Halal food finder, Muslim-friendly destination details, and live Jambi prayer times.",
      "feat.t1": "Halal Food Finder", "feat.t2": "Destination Detail", "feat.t3": "Live Prayer Times",
      "pw.title": "Prayer Times & Adhan Reminder", "pw.toward": "Next prayer:", "pw.alert": "Adhan Sound Reminder", "pw.test": "Test Notification", "pw.listen": "Play Reminder Tone",
      "pw.sound": "Sound", "pw.qibla": "Qibla Direction", "pw.change": "Change Reminder", "pw.compass": "Open Qibla Compass",
      "p.subuh": "Fajr", "p.terbit": "Sunrise", "p.dzuhur": "Dhuhr", "p.ashar": "Asr", "p.maghrib": "Maghrib", "p.isya": "Isha",
      "st.done": "Passed", "st.next": "Next", "st.up": "Upcoming", "open": "Open Now", "closed": "Closed", "detail": "View Details", "back": "Back", "save": "Save", "saved": "Saved", "share": "Share", "directions": "Directions"
    }
  };
  const t = (k) => (T[S.lang] && T[S.lang][k]) || T.id[k] || k;
  function applyI18n() {
    document.documentElement.lang = S.lang;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === S.lang)));
  }

  /* ---------- Utilitas ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.style.pointerEvents = "";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }
  const fmtParts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  function nowWIB() {
    const p = Object.fromEntries(fmtParts.formatToParts(new Date()).map((x) => [x.type, x.value]));
    const h = +p.hour % 24;
    return { y: +p.year, m: +p.month, d: +p.day, h, mi: +p.minute, s: +p.second, sec: h * 3600 + +p.minute * 60 + +p.second };
  }
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const hhmm = (min) => { min = ((Math.round(min) % 1440) + 1440) % 1440; return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0"); };
  const dur = (sec) => { sec = Math.max(0, Math.floor(sec)); return [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((x) => String(x).padStart(2, "0")).join(":"); };
  function isOpen(jam) {
    if (!jam) return null;
    const [a, b] = jam.split("-");
    const n = nowWIB(); const cur = n.h * 60 + n.mi;
    return cur >= toMin(a) && cur < toMin(b);
  }
  function openChip(p) {
    const o = isOpen(p.jam);
    if (o === null) return "";
    return o ? `<span class="chip">${ic("clock")}${t("open")}</span>` : `<span class="chip chip-grey">${ic("clock")}${t("closed")} (${S.lang === "en" ? "opens" : "Buka"} ${p.jam.split("-")[0]})</span>`;
  }
  const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
  function km(a, b) {
    const R = 6371, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  const fmtKm = (k) => (k < 1 ? Math.round(k * 1000) + " m" : k.toFixed(1).replace(".", ",") + " km");
  const regionOf = (id) => D.wilayah.find((w) => w.id === id) || D.wilayah[0];
  const refPoint = () => S.gps ? { lat: S.gps.lat, lng: S.gps.lng, label: S.lang === "en" ? "from you" : "dari Anda" } : { ...regionOf("kota-jambi"), label: S.lang === "en" ? "from city centre" : "dari pusat kota" };
  const mapsUrl = (o) => `https://www.google.com/maps/search/?api=1&query=${o.lat},${o.lng}`;
  const nearestMasjid = (o) => D.masjid.map((m) => ({ m, k: km(o, m) })).sort((a, b) => a.k - b.k)[0];

  /* ---------- Ilustrasi pengganti foto (SVG) ---------- */
  let uid = 0;
  function scene(type) {
    const id = "g" + (++uid);
    const sky = (a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="260" fill="url(#${id})"/>`;
    const S2 = {
      candi: sky("#f7c98b", "#e9875b") + `<circle cx="300" cy="80" r="34" fill="#fff3d6" opacity=".9"/><path d="M0 200 Q120 180 220 196 T400 188 V260 H0Z" fill="#4f7d3a"/><g fill="#9c4329"><rect x="140" y="150" width="120" height="50"/><rect x="155" y="120" width="90" height="32"/><rect x="170" y="96" width="60" height="26"/></g><g fill="#7b2f1c"><rect x="140" y="150" width="120" height="8"/><rect x="155" y="120" width="90" height="6"/><path d="M185 96 L200 58 L215 96Z"/></g><g fill="#2f5a28"><circle cx="60" cy="180" r="26"/><circle cx="85" cy="186" r="20"/><circle cx="345" cy="176" r="28"/></g><path d="M0 230 Q200 214 400 232 V260 H0Z" fill="#3a6a2c"/>`,
      sungai: sky("#2c6b70", "#f2b880") + `<circle cx="90" cy="150" r="30" fill="#ffe1a8" opacity=".9"/><path d="M0 190 H400 V260 H0Z" fill="#2a5f78"/><path d="M0 200 Q100 194 200 202 T400 198" stroke="#7fb5c8" stroke-width="3" fill="none"/><path d="M20 188 Q200 120 380 188" stroke="#f4efe6" stroke-width="6" fill="none"/><g fill="#f4efe6"><rect x="270" y="96" width="26" height="92"/><rect x="264" y="90" width="38" height="10"/><path d="M270 90 Q283 62 296 90Z"/><rect x="281" y="50" width="4" height="16"/></g><circle cx="283" cy="118" r="7" fill="#2c6b70"/><g fill="#1d3f4f"><path d="M60 222 h50 l-8 10 h-34z"/><path d="M300 236 h40 l-6 8 h-28z"/></g>`,
      danau: sky("#9fd8e6", "#eaf7ef") + `<g fill="#3f8a5a"><circle cx="40" cy="150" r="34"/><circle cx="90" cy="160" r="26"/><circle cx="330" cy="146" r="38"/><circle cx="380" cy="160" r="24"/></g><path d="M0 170 H400 V260 H0Z" fill="#4a9fb8"/><g stroke="#cdeef6" stroke-width="3" opacity=".8"><path d="M40 200 h60M150 222 h80M270 206 h70"/></g><path d="M170 186 h70 l-10 14 h-50z" fill="#b5532f"/><rect x="200" y="160" width="4" height="26" fill="#5a3a24"/><path d="M204 162 l22 18 h-22z" fill="#fff"/>`,
      masjid: sky("#0f3d22", "#3f9a62") + `<path d="M318 54 a20 20 0 1 0 14 36 a16 16 0 1 1 -14 -36z" fill="#fff6d6"/><g fill="#e8f5ec"><rect x="70" y="80" width="16" height="140"/><path d="M66 80 L78 52 L90 80Z"/><rect x="314" y="80" width="16" height="140"/><path d="M310 80 L322 52 L334 80Z"/><path d="M130 150 Q200 70 270 150Z"/><rect x="120" y="150" width="160" height="70"/></g><g fill="#166534"><path d="M185 220 v-34 a15 15 0 0 1 30 0 v34z"/><rect x="140" y="172" width="18" height="26" rx="9"/><rect x="242" y="172" width="18" height="26" rx="9"/></g><rect x="0" y="220" width="400" height="40" fill="#0c3019"/>`,
      musholla: `<rect width="400" height="260" fill="#e7f3ea"/><path d="M150 40 h100 v130 h-100z" fill="#cfe9d6"/><path d="M160 170 V90 Q200 40 240 90 V170Z" fill="#166534"/><path d="M175 170 V98 Q200 64 225 98 V170Z" fill="#1f7a43"/><g fill="#b91c1c" opacity=".85"><rect x="40" y="190" width="90" height="56" rx="4"/><rect x="155" y="190" width="90" height="56" rx="4"/><rect x="270" y="190" width="90" height="56" rx="4"/></g><g fill="#fcd34d" opacity=".8"><rect x="50" y="198" width="70" height="4"/><rect x="165" y="198" width="70" height="4"/><rect x="280" y="198" width="70" height="4"/></g>`,
      wudhu: `<rect width="400" height="260" fill="#e3f1f6"/><g stroke="#c4dde6" stroke-width="2">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 50} 0 V170"/>`).join("")}${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${i * 50} H400"/>`).join("")}</g><rect y="170" width="400" height="90" fill="#9fb8c2"/><rect y="160" width="400" height="16" fill="#e7eef0"/>${[70, 160, 250, 340].map((x) => `<g><rect x="${x - 4}" y="96" width="8" height="30" fill="#94a3b8"/><path d="M${x - 4} 100 h22 v8 h-14" fill="#94a3b8"/><path d="M${x + 14} 116 q4 10 0 16 q-4 -6 0 -16z" fill="#38bdf8"/></g>`).join("")}`,
      kuliner: `<rect width="400" height="260" fill="#f5e3c8"/><circle cx="200" cy="140" r="96" fill="#fff"/><circle cx="200" cy="140" r="76" fill="#f3f0ea"/><circle cx="200" cy="140" r="58" fill="#e0912f"/><circle cx="180" cy="126" r="16" fill="#fff4dc"/><circle cx="218" cy="150" r="12" fill="#8a3b12"/><circle cx="196" cy="160" r="9" fill="#3f7d34"/><path d="M60 60 q30 -10 40 20 q-30 6 -40 -20z" fill="#4f8a3a"/><path d="M320 220 q30 -10 40 20 q-30 6 -40 -20z" fill="#4f8a3a"/><rect x="320" y="60" width="8" height="110" rx="4" fill="#c7a77a"/>`,
      kopi: `<rect width="400" height="260" fill="#6b4226"/><circle cx="200" cy="130" r="90" fill="#8a5a3b"/><path d="M150 100 h100 v70 a30 30 0 0 1 -30 30 h-40 a30 30 0 0 1 -30 -30z" fill="#f8f1e7"/><path d="M250 118 h12 a18 18 0 0 1 0 36 h-12" stroke="#f8f1e7" stroke-width="8" fill="none"/><ellipse cx="200" cy="104" rx="46" ry="8" fill="#4a2a17"/><g stroke="#f8f1e7" stroke-width="4" opacity=".6" fill="none"><path d="M185 80 q-8 -14 0 -26"/><path d="M210 80 q-8 -14 0 -26"/></g>`,
      batik: `<defs><pattern id="${id}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#7a1f2b"/><path d="M10 40 q10 -24 20 -6 q10 18 20 -6" stroke="#f3c969" stroke-width="3" fill="none"/><circle cx="30" cy="14" r="5" fill="#f3c969"/><circle cx="8" cy="10" r="2" fill="#fff3d6"/><circle cx="52" cy="50" r="2" fill="#fff3d6"/></pattern></defs><rect width="400" height="260" fill="url(#${id})"/><rect x="120" y="60" width="160" height="140" rx="12" fill="#14532d" opacity=".55"/><path d="M160 150 q20 -50 40 -10 q20 40 40 -10" stroke="#f3c969" stroke-width="5" fill="none"/>`,
      hotel: sky("#bfe3d0", "#f2faf5") + `<rect x="110" y="60" width="180" height="170" fill="#166534"/><rect x="110" y="60" width="180" height="14" fill="#0f3d22"/>${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${126 + c * 40}" y="${88 + r * 30}" width="26" height="18" rx="2" fill="${(r + c) % 3 ? "#d3ffd5" : "#fcd34d"}"/>`).join("")).join("")}<rect x="182" y="200" width="36" height="30" fill="#0f3d22"/><g fill="#3f8a5a"><circle cx="70" cy="210" r="26"/><circle cx="335" cy="206" r="30"/></g><rect y="228" width="400" height="32" fill="#9fcdb0"/>`,
      peta: `<rect width="400" height="260" fill="light-dark(#e6f4ea,#1a2e23)"/><g stroke="#c9e5d2" stroke-width="2">${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 55} 0 V260"/>`).join("")}${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${i * 55} H400"/>`).join("")}</g><path d="M-10 170 C80 120 160 220 240 150 S360 90 420 120" stroke="#7fb5c8" stroke-width="18" fill="none"/><path d="M40 40 L360 230" stroke="#fff" stroke-width="6"/><g transform="translate(200 88)"><path d="M0 40 C-6 26 -22 14 -22 0 a22 22 0 0 1 44 0 c0 14 -16 26 -22 40z" fill="#166534"/><circle r="8" fill="#fff"/></g>`
    };
    return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustrasi">${S2[type] || S2.peta}</svg>`;
  }
  /* Gambar dari folder img/ dengan bingkai rasio tetap.
     opt.banner → <picture>: banner 12:5 di layar ≥601px, foto kartu 4:3 di HP.
     Jika file tidak ditemukan → otomatis diganti ilustrasi (lihat listener "error"). */
  function media(o, opt = {}) {
    const alt = esc(opt.alt || o.nama || o.label || "Foto");
    if (!o.img) return `<span class="media"><span class="ph">${scene(o.ph)}</span></span>`;
    const img = `<img class="media-img" src="${esc(o.img)}" alt="${alt}" data-ph="${esc(o.ph || "peta")}" loading="${opt.eager ? "eager" : "lazy"}" decoding="async">`;
    const inner = opt.banner && o.banner ? `<picture><source media="(min-width: 601px)" srcset="${esc(o.banner)}">${img}</picture>` : img;
    return `<span class="media skel">${inner}</span>`;
  }

  /* ---------- Jadwal sholat (kalkulasi astronomis, kriteria Kemenag) ---------- */
  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  function sunPos(jd) {
    const Dd = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * Dd, 360), q = fix(280.459 + 0.98564736 * Dd, 360);
    const L = fix(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)), 360);
    const e = 23.439 - 0.00000036 * Dd;
    const RA = fix(deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15, 24);
    return { decl: deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), eqt: q / 15 - RA };
  }
  function prayerTimes(y, m, d, lat, lng, tz = 7) {
    const jd = julian(y, m, d) - lng / (15 * 24);
    const midDay = (tt) => fix(12 - sunPos(jd + tt).eqt, 24);
    const angleTime = (angle, tt, ccw) => {
      const decl = sunPos(jd + tt).decl, noon = midDay(tt);
      const T = deg(Math.acos((-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat))))) / 15;
      return noon + (ccw ? -T : T);
    };
    const asrTime = (tt) => { const decl = sunPos(jd + tt).decl; return angleTime(-deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - decl)))))), tt); };
    let h = { subuh: 5, terbit: 6, dzuhur: 12, ashar: 13, maghrib: 18, isya: 18 };
    for (let i = 0; i < 2; i++) {
      const p = Object.fromEntries(Object.entries(h).map(([k, v]) => [k, v / 24]));
      h = { subuh: angleTime(20, p.subuh, true), terbit: angleTime(0.833, p.terbit, true), dzuhur: midDay(p.dzuhur), ashar: asrTime(p.ashar), maghrib: angleTime(0.833, p.maghrib), isya: angleTime(18, p.isya) };
    }
    const adj = tz - lng / 15;
    const ihtiyath = { subuh: 2, terbit: -2, dzuhur: 3, ashar: 2, maghrib: 2, isya: 2 };
    const out = {};
    for (const k in h) out[k] = Math.ceil((h[k] + adj) * 60 + ihtiyath[k]);
    return out; // menit sejak 00:00 WIB
  }
  const PRAYERS = ["subuh", "terbit", "dzuhur", "ashar", "maghrib", "isya"];
  const SUB = { subuh: "Fajar Shadiq", terbit: "Syuruq", dzuhur: "Tengah Hari", ashar: "Sore", maghrib: "Terbenam", isya: "Malam" };
  function today(regionId = S.region) {
    const n = nowWIB(), r = regionOf(regionId);
    const times = prayerTimes(n.y, n.m, n.d, r.lat, r.lng);
    const nowMin = n.sec / 60;
    let next = PRAYERS.filter((p) => p !== "terbit").find((p) => times[p] > nowMin);
    let nextAt = next ? times[next] * 60 : null;
    if (!next) {
      const tm = new Date(Date.UTC(n.y, n.m - 1, n.d + 1));
      const tt = prayerTimes(tm.getUTCFullYear(), tm.getUTCMonth() + 1, tm.getUTCDate(), r.lat, r.lng);
      next = "subuh"; nextAt = 86400 + tt.subuh * 60;
    }
    return { times, next, left: nextAt - n.sec, nowMin, region: r, n };
  }
  function qibla(o) {
    const k = { lat: 21.4225, lng: 39.8262 };
    const b = deg(Math.atan2(Math.sin(rad(k.lng - o.lng)), Math.cos(rad(o.lat)) * Math.tan(rad(k.lat)) - Math.sin(rad(o.lat)) * Math.cos(rad(k.lng - o.lng))));
    return { bearing: fix(b, 360), dist: km(o, k) };
  }
  const compassName = (b) => ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"][Math.round(b / 45) % 8];
  function hijri(n) {
    try {
      return new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date());
    } catch { return ""; }
  }
  const masehi = () => new Intl.DateTimeFormat(S.lang === "en" ? "en-GB" : "id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date());

  /* ---------- Suara pengingat (Web Audio) ---------- */
  let actx;
  function chime() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "sine"; o.frequency.value = f;
        const t0 = actx.currentTime + i * 0.55;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.22, t0 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 1.4);
        o.connect(g).connect(actx.destination);
        o.start(t0); o.stop(t0 + 1.5);
      });
      return true;
    } catch { return false; }
  }
  function notifyPrayer(name, time) {
    const msg = `${S.lang === "en" ? "Time for" : "Waktu sholat"} ${t("p." + name)} ${time} WIB — ${regionOf(S.region).nama}`;
    toast(msg);
    if (S.adzan) chime();
    try { if ("Notification" in window && Notification.permission === "granted") new Notification("SobatMusafir Jambi", { body: msg }); } catch { /* diabaikan */ }
  }

  /* ---------- Kartu komponen ---------- */
  function wisataCard(w) {
    const href = w.linkMasjid ? `#masjid-${w.linkMasjid}` : `#wisata-${w.id}`;
    return `<article class="card">
      <div class="card-media">${media(w)}<span class="chip chip-glass tl">${esc(w.kategori)}</span><span class="chip chip-glass bl">${ic("pin")}${esc(w.lokasi)}</span></div>
      <div class="card-body"><h3>${esc(w.nama)}</h3><p>${esc(w.ringkas)}</p>
      <div class="card-foot"><a class="btn btn-primary btn-block" href="${href}">${t("dest.cta")}${ic("arrow")}</a></div></div></article>`;
  }
  function tempatCard(p, mode = "home") {
    const dist = km(refPoint(), p);
    const fav = S.favs.includes(p.id);
    return `<article class="card">
      <div class="card-media">${media(p)}<span class="chip chip-solid tl">${ic("badge")}${esc(p.badge)}</span>
        <span class="chip chip-glass tr">${fmtKm(dist)}</span>
        <span class="chip chip-glass br rating">${ic("star")}${p.rating} <small>(${esc(p.ulasan)})</small></span></div>
      <div class="card-body">
        <span class="card-kicker">${esc(p.label)}</span>
        <h3>${esc(p.nama)}</h3>
        <span class="card-meta">${ic("pin")}${esc(mode === "home" ? p.area + ", " + regionOf(p.wilayah).nama.replace("Kab. ", "") : p.alamat)}</span>
        ${p.ringkas && mode !== "home" ? `<p>${esc(p.ringkas)}</p>` : ""}
        <div class="chips">${p.dekatMasjid && mode === "home" ? `<span class="chip">${ic("mosque")}${esc(p.dekatMasjid)}</span>` : ""}
          ${mode !== "home" ? (p.musholla ? `<span class="chip">${ic("mosque")}Musholla & Wudhu</span>` : p.halal ? `<span class="chip">${ic("shield")}${esc(p.fasilitasSingkat || "Sertifikat Halal")}</span>` : "") + openChip(p) : ""}
          ${fav ? `<span class="chip chip-amber">${ic("bookmark")}${t("saved")}</span>` : ""}</div>
        <div class="card-foot"><a class="btn ${mode === "home" ? "btn-primary" : "btn-soft"} btn-block" href="#tempat-${p.id}">${mode === "home" ? esc(p.cta || t("food.detail")) : t("detail")}${ic("arrow")}</a></div>
      </div></article>`;
  }

  /* ---------- Widget jadwal sholat (beranda) ---------- */
  function prayerWidget() {
    const td = today();
    const q = qibla(td.region);
    return `<div class="pw" data-live="pw">
      <div class="pw-head">
        <div style="display:flex;gap:14px;align-items:center">
          <span class="brand-mark" style="background:rgb(255 255 255 / .15)">${ic("mosque")}</span>
          <div><span class="chip chip-glass">${ic("shield")}Kemenag RI • Live</span>
          <h3 style="margin-top:6px">${t("pw.title")}</h3>
          <p>${esc(td.region.nama)} • WIB (UTC+7) • ${Math.abs(td.region.lat).toFixed(4)}° LS, ${td.region.lng.toFixed(4)}° BT</p></div>
        </div>
        <div class="pw-next"><small data-l="nextname">${t("pw.toward")} ${t("p." + td.next)}</small><b data-l="count">${dur(td.left)}</b></div>
      </div>
      <div class="pw-body">
        <div class="pw-alert"><span class="qi">${ic("bell")}</span>
          <div><strong>${t("pw.alert")} <span class="chip ${S.adzan ? "chip-solid" : "chip-grey"}" data-l="adzanchip">${S.adzan ? "AKTIF" : "NONAKTIF"}</span></strong>
          <p data-l="alerttext"></p></div>
          <button class="btn btn-primary btn-sm" type="button" data-act="test-notif">${ic("bell")}${t("pw.test")}</button>
        </div>
        <div class="pw-audio">
          <button class="btn btn-soft" type="button" data-act="chime">${ic("volume")}${t("pw.listen")}</button>
          <label class="switch"><input type="checkbox" data-act="adzan-toggle" ${S.adzan ? "checked" : ""}><span class="tr-k"></span>${t("pw.sound")} ${S.adzan ? "ON" : "OFF"}</label>
          <span class="muted small">Nada pengingat dibuat dengan Web Audio API (bukan rekaman adzan).</span>
        </div>
        <div class="times" data-l="times">${timesHTML(td)}</div>
        <div class="pw-foot">
          <span>${ic("compass")} ${t("pw.qibla")}: <b>${q.bearing.toFixed(1)}° ${compassName(q.bearing)}</b></span>
          <div class="chips"><a class="btn btn-ghost btn-sm" href="#sholat">${ic("bell")}${t("pw.change")}</a><a class="btn btn-primary btn-sm" href="#kiblat">${ic("compass")}${t("pw.compass")}</a></div>
        </div>
      </div></div>`;
  }
  function timesHTML(td) {
    return PRAYERS.map((p) => {
      const st = p === td.next ? "next" : td.times[p] <= td.nowMin ? "past" : "";
      const s = p === "terbit" ? SUB.terbit : st === "next" ? t("st.next") : st === "past" ? t("st.done") : t("st.up");
      return `<div class="time ${st}"><span class="n">${t("p." + p)}</span><span class="t">${hhmm(td.times[p])}</span><span class="s">${s}</span></div>`;
    }).join("");
  }

  /* =========================================================
     HALAMAN
     ========================================================= */
  const V = {};

  /* ---------- Beranda ---------- */
  V.beranda = () => {
    const reg = D.wilayah.map((w) => `<option value="${w.id}">${esc(w.nama)}</option>`).join("");
    return `
    <section class="hero">
      <div class="hero-art" aria-hidden="true" id="heroArt">${heroArt()}${D.hero ? `<span class="media hero-photo skel"><picture><source media="(min-width: 601px)" srcset="${esc(D.hero.desktop)}"><img class="media-img" src="${esc(D.hero.mobile)}" alt="" data-ph="none" decoding="async"></picture></span>` : ""}</div>
      <div class="wrap hero-in">
        <span class="eyebrow">${ic("shield")}${t("hero.eyebrow")}</span>
        <h1><span>${t("hero.t1")}</span><span>${t("hero.t2")}</span></h1>
        <p class="lead">${t("hero.lead")}</p>
      </div>
    </section>
    <div class="wrap">
      <form class="search-card" id="homeSearch" role="search">
        <div class="search-grid">
          <div class="field">${ic("search")}<input class="input" name="q" type="search" placeholder="${t("search.ph")}" aria-label="${t("search.ph")}"></div>
          <div class="field">${ic("landmark")}<select class="select" name="cat" aria-label="Kategori">
            <option value="">${t("search.allcat")}</option><option value="tempat">${t("cat.food")} & UMKM</option><option value="masjid">${t("cat.mosque")}</option><option value="hotel">${t("cat.hotel")}</option><option value="wisata">${t("cat.tour")}</option></select></div>
          <div class="field">${ic("pin")}<select class="select" name="reg" aria-label="Wilayah"><option value="">${t("search.allreg")}</option>${reg}</select></div>
          <button class="btn btn-primary" type="submit">${ic("search")}${t("search.btn")}</button>
        </div>
        <div class="search-opts">
          <span class="lbl">${ic("mosque")}${t("search.radius")}</span>
          ${[1, 3, 5, 10].map((r) => `<button type="button" class="toggle-chip" data-radius="${r}" aria-pressed="false">&lt; ${r} km</button>`).join("")}
        </div>
        <div class="search-opts">
          <span class="lbl">${ic("check")}${t("search.fac")}</span>
          ${[["mukena", "Tempat Wudhu & Mukena"], ["ac", "AC Ruang Dingin"], ["parkir", "Parkir Bus Pariwisata"], ["difabel", "Ramah Difabel"], ["halal", "Sertifikasi Halal BPJPH"]].map(([k, l]) => `<button type="button" class="toggle-chip" data-fac="${k}" aria-pressed="false">${esc(l)}</button>`).join("")}
        </div>
        <div class="search-results" id="searchResults" hidden></div>
      </form>
      <nav class="quick" aria-label="Kategori">
        <a href="#kuliner"><span class="qi">${ic("food")}</span><strong>${t("cat.food")}</strong><small>${D.tempat.length}+ Resto, Kafe & UMKM</small></a>
        <a href="#masjid"><span class="qi">${ic("mosque")}</span><strong>Musholla</strong><small>Info Kiblat & Air Bersih</small></a>
        <a href="#sholat"><span class="qi">${ic("clock")}</span><strong>${S.lang === "en" ? "Prayer Times" : "Jadwal Sholat"}</strong><small data-l="quicknext"></small></a>
        <a href="#hotel"><span class="qi">${ic("bed")}</span><strong>${t("cat.hotel")}</strong><small>Musholla & Sarapan Halal</small></a>
        <a href="#wisata-candi-muaro-jambi"><span class="qi">${ic("landmark")}</span><strong>${t("cat.tour")}</strong><small>Destinasi & Jejak Wisata</small></a>
      </nav>
    </div>

    <section class="band">
      <div class="wrap">
        <div class="sec-head"><div><span class="eyebrow">${ic("landmark")}${t("dest.eyebrow")}</span><h2>${t("dest.title")}</h2><p>${t("dest.lead")}</p></div>
          <a class="link" href="#wisata-candi-muaro-jambi">${t("dest.all")}${ic("arrow")}</a></div>
        <div class="grid g4">${D.wisata.map(wisataCard).join("")}</div>
      </div>
    </section>

    <section class="band band-soft">
      <div class="wrap">
        <div class="sec-head"><div><span class="eyebrow">${ic("food")}${t("food.eyebrow")}</span><h2>${t("food.title")}</h2><p>${t("food.lead")}</p></div>
          <a class="link" href="#kuliner">${t("food.all")} (${D.tempat.length})${ic("arrow")}</a></div>
        <div class="grid g4">${D.tempat.filter((p) => p.unggulan).map((p) => tempatCard(p, "home")).join("")}</div>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <div class="promo">
          <div><span class="eyebrow">${ic("route")}${t("promo.eyebrow")}</span><h2>${t("promo.title")}</h2><p>${t("promo.lead")}</p>
            <div class="actions"><a class="btn btn-light" href="#rencana">${ic("cal")}${t("promo.start")}</a><a class="btn btn-outline-light" href="#rencana">${ic("route")}${t("promo.pack")}</a></div></div>
          <div class="promo-list">
            <div class="promo-item"><span class="qi">${ic("clock")}</span><div><strong>100% Waktu Sholat Terintegrasi</strong><span>Rute otomatis mencantumkan jeda sholat Subuh hingga Isya di masjid terdekat.</span></div></div>
            <div class="promo-item"><span class="qi">${ic("bag")}</span><div><strong>Kurasi UMKM Terpercaya</strong><span>Mendukung pengrajin batik dan produsen kuliner lokal dengan sertifikasi halal yang jelas.</span></div></div>
            <div class="promo-item"><span class="qi">${ic("users")}</span><div><strong>Navigasi Ramah Keluarga</strong><span>Akses fasilitas wudhu bersih, ramah lansia, dan kenyamanan anak-anak.</span></div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="band band-soft">
      <div class="wrap">
        <div class="center" style="gap:10px;margin-bottom:24px"><span class="eyebrow">${ic("info")}${t("feat.eyebrow")}</span><h2 style="font-size:clamp(26px,3.2vw,36px);font-weight:800">${t("feat.title")}</h2><p class="muted" style="max-width:60ch">${t("feat.lead")}</p>
          <div class="tabs" role="tablist" id="featTabs">
            <button class="tab" role="tab" aria-selected="false" data-tab="food">${t("feat.t1")}</button>
            <button class="tab" role="tab" aria-selected="false" data-tab="dest">${t("feat.t2")}</button>
            <button class="tab" role="tab" aria-selected="true" data-tab="pray">${t("feat.t3")}</button>
          </div></div>
        <div id="featPanel" style="max-width:900px;margin-inline:auto">${prayerWidget()}</div>
      </div>
    </section>`;
  };

  function heroArt() {
    return `<svg viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123c38"/><stop offset=".55" stop-color="#2f7a5c"/><stop offset="1" stop-color="#f0b77a"/></linearGradient>
        <linearGradient id="hriv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b7f8c"/><stop offset="1" stop-color="#0f3d3a"/></linearGradient>
        <radialGradient id="hsun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3c9"/><stop offset="1" stop-color="#fff3c9" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1440" height="640" fill="url(#hsky)"/>
      <circle class="h-glow" cx="1040" cy="430" r="190" fill="url(#hsun)" opacity=".75"/><circle class="h-sun" cx="1040" cy="430" r="58" fill="#ffe7b0"/><g class="h-clouds" fill="#ffffff" opacity=".16"><ellipse cx="220" cy="140" rx="120" ry="22"/><ellipse cx="300" cy="126" rx="80" ry="18"/><ellipse cx="860" cy="190" rx="140" ry="20"/><ellipse cx="1260" cy="110" rx="110" ry="18"/></g>
      <g fill="#1d5a45" opacity=".75"><path d="M0 470 Q160 420 320 452 T640 446 T960 440 T1440 450 V520 H0Z"/></g>
      <g fill="#0f3d2c">
        <g transform="translate(120 330)"><rect x="0" y="100" width="170" height="70"/><rect x="20" y="62" width="130" height="40"/><rect x="45" y="30" width="80" height="34"/><path d="M68 30 L85 -12 L102 30Z"/></g>
        <g transform="translate(560 270)"><rect x="-6" y="40" width="22" height="200"/><path d="M-10 40 L5 0 L20 40Z"/><rect x="250" y="40" width="22" height="200"/><path d="M246 40 L261 0 L276 40Z"/><path d="M50 150 Q133 30 216 150Z"/><rect x="36" y="150" width="194" height="90"/></g>
        <g transform="translate(1210 250)"><rect x="0" y="70" width="44" height="170"/><rect x="-8" y="60" width="60" height="14"/><path d="M0 60 Q22 14 44 60Z"/><rect x="19" y="0" width="6" height="26"/></g>
      </g>
      <path d="M700 500 Q1000 360 1300 500" stroke="#e8f5ec" stroke-width="7" fill="none" opacity=".85"/>
      <path d="M0 500 H1440 V640 H0Z" fill="url(#hriv)"/>
      <g class="h-wave" stroke="#9fd0d6" stroke-width="3" opacity=".5"><path d="M120 540 h120M420 575 h160M820 548 h140M1100 590 h180M980 520 h90"/></g>
      <g class="h-boat"><path d="M380 560 h90 l-14 16 h-62z" fill="#0b2a26"/><rect x="420" y="530" width="4" height="30" fill="#0b2a26"/><path d="M424 532 l22 22 h-22z" fill="#e8f5ec" opacity=".8"/></g>
    </svg>`;
  }

  function runHomeSearch(form) {
    const fd = new FormData(form);
    const q = String(fd.get("q") || "").trim().toLowerCase();
    const cat = fd.get("cat"), reg = fd.get("reg");
    const radius = Number($("[data-radius][aria-pressed=true]", form)?.dataset.radius || 0);
    const facs = $$("[data-fac][aria-pressed=true]", form).map((b) => b.dataset.fac);
    const items = [
      ...D.tempat.map((x) => ({ k: "tempat", x, href: `#tempat-${x.id}`, sub: x.label, icon: "food", fac: [x.musholla && "mukena", x.halal && "halal"] })),
      ...D.masjid.map((x) => ({ k: "masjid", x, href: `#masjid-${x.id}`, sub: x.jenis, icon: "mosque", fac: x.fas, wilayah: "kota-jambi" })),
      ...D.hotel.map((x) => ({ k: "hotel", x, href: `#hotel`, hotel: x.id, sub: x.area, icon: "bed", fac: [x.fas.includes("syariah") && "halal", x.fas.includes("musholla") && "mukena"] })),
      ...D.wisata.map((x) => ({ k: "wisata", x, href: x.linkMasjid ? `#masjid-${x.linkMasjid}` : `#wisata-${x.id}`, sub: x.kategori, icon: "landmark", fac: x.musholla ? ["mukena"] : [] }))
    ];
    const res = items.filter((it) => {
      const x = it.x;
      if (cat && it.k !== cat) return false;
      if (reg && (x.wilayah || it.wilayah) !== reg) return false;
      if (q && !`${x.nama} ${x.label || ""} ${x.alamat || ""} ${x.area || ""} ${x.ringkas || ""} ${(x.menu || []).map((m) => m.nama).join(" ")} ${it.sub}`.toLowerCase().includes(q)) return false;
      if (facs.length && !facs.every((f) => (it.fac || []).includes(f))) return false;
      if (radius) { it.near = it.k === "masjid" ? { k: 0 } : nearestMasjid(x); if (it.near.k > radius) return false; }
      return true;
    });
    const box = $("#searchResults");
    box.hidden = false;
    replay(box, "expand");
    box.innerHTML = `<p class="small muted" style="margin-bottom:10px"><b>${res.length}</b> ${t("search.res")}</p>` + (res.length ? `<div class="grid g2" style="gap:10px">${res.slice(0, 12).map((it) => {
      const n = it.k === "masjid" ? null : nearestMasjid(it.x);
      return `<a class="card" style="flex-direction:row;align-items:center;gap:12px;padding:12px" href="${it.href}" ${it.hotel ? `data-hotel="${it.hotel}"` : ""}>
        <span class="qi" style="display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--chip);color:var(--brand);font-size:20px;flex:none">${ic(it.icon)}</span>
        <span style="display:grid;gap:2px"><b>${esc(it.x.nama)}</b><span class="small muted">${esc(it.sub)}${n ? ` • Masjid terdekat ${fmtKm(n.k)}` : ""}</span></span></a>`;
    }).join("")}</div>` : `<div class="empty">${ic("search")}<p>${t("search.none")}</p></div>`);
  }

  /* ---------- Direktori kuliner ---------- */
  const KF = { q: "", reg: "", cat: "semua", halal: false, mus: false, open: false, fav: false };
  V.kuliner = () => `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><span>${t("cat.food")}</span></nav>
      <div class="head-row"><div><span class="eyebrow" style="margin-top:14px">${ic("badge")}Direktori Kuliner Syariah Jambi</span>
        <h1>Kuliner & Kafe Halal Terverifikasi di Jambi</h1>
        <p>Temukan sajian khas Melayu Jambi, kopi lokal legendaris, dan kafe ramah musafir dengan jaminan kehalalan serta fasilitas ibadah yang nyaman.</p></div>
        <div class="fact"><span class="qi">${ic("food")}</span><div><b data-l="kcount"></b><small>Terverifikasi Halal & Ramah Muslim</small></div></div></div>
    </div>
    <div class="wrap">
      <div class="panel" style="padding:14px;margin-block:18px 14px">
        <div class="search-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
          <div class="field">${ic("search")}<input class="input" id="kq" type="search" placeholder="Cari nasi minyak, pempek, kopi, atau nama restoran..." value="${esc(KF.q)}" aria-label="Cari kuliner"></div>
          <div class="field">${ic("pin")}<select class="select" id="kreg" aria-label="Wilayah"><option value="">Semua Wilayah Jambi</option>${D.wilayah.map((w) => `<option value="${w.id}" ${KF.reg === w.id ? "selected" : ""}>${esc(w.nama)}</option>`).join("")}</select></div>
        </div>
      </div>
      <div class="filter-row" role="group" aria-label="Filter">
        ${[["semua", "Semua"], ["resto", "Restoran Melayu"], ["kafe", "Kafe & Kopi"], ["umkm", "UMKM & Oleh-oleh"]].map(([k, l]) => `<button class="filter" type="button" data-kcat="${k}" aria-pressed="${KF.cat === k}">${esc(l)}</button>`).join("")}
        <button class="filter" type="button" data-kf="halal" aria-pressed="${KF.halal}">${ic("shield")}Sertifikat Halal MUI/BPJPH</button>
        <button class="filter" type="button" data-kf="mus" aria-pressed="${KF.mus}">${ic("mosque")}Ada Musholla</button>
        <button class="filter" type="button" data-kf="open" aria-pressed="${KF.open}">${ic("clock")}Buka Sekarang</button>
        <button class="filter" type="button" data-kf="fav" aria-pressed="${KF.fav}">${ic("bookmark")}Tersimpan</button>
      </div>
      <div class="grid g3" id="kgrid" style="margin-top:14px"></div>
    </div>`;
  function drawKuliner() {
    const list = D.tempat.filter((p) => {
      if (KF.cat !== "semua" && p.tipe !== KF.cat) return false;
      if (KF.reg && p.wilayah !== KF.reg) return false;
      if (KF.halal && !p.halal) return false;
      if (KF.mus && !p.musholla) return false;
      if (KF.open && !isOpen(p.jam)) return false;
      if (KF.fav && !S.favs.includes(p.id)) return false;
      if (KF.q && !`${p.nama} ${p.label} ${p.alamat} ${p.ringkas || ""} ${(p.menu || []).map((m) => m.nama).join(" ")}`.toLowerCase().includes(KF.q.toLowerCase())) return false;
      return true;
    });
    const ref = refPoint();
    list.sort((a, b) => km(ref, a) - km(ref, b));
    $("#kgrid").innerHTML = list.length ? list.map((p) => tempatCard(p, "list")).join("") : `<div class="empty" style="grid-column:1/-1">${ic("search")}<p>Belum ada tempat yang cocok dengan filter ini.</p><button class="btn btn-soft btn-sm" type="button" data-act="kreset">Atur ulang filter</button></div>`;
    const c = $("[data-l=kcount]"); if (c) countTo(c, list.length, 0, " Tempat");
  }

  /* ---------- Detail tempat ---------- */
  let menuCat = "semua";
  V.tempat = (id) => {
    const p = D.tempat.find((x) => x.id === id);
    if (!p) return V.notfound();
    const near = nearestMasjid(p);
    const fav = S.favs.includes(p.id);
    const o = isOpen(p.jam);
    const isUmkm = p.tipe === "umkm";
    return `
    <div class="wrap">
      <div class="toolbar">
        <div class="left"><a class="btn btn-ghost btn-sm" href="#kuliner" data-act="back">${ic("back")}${t("back")}</a>
          <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><a href="#kuliner">${t("cat.food")}</a><span class="sep">/</span><span>Detail Tempat</span></nav></div>
        <div class="right"><button class="btn ${fav ? "btn-primary" : "btn-ghost"} btn-sm" type="button" data-act="fav" data-id="${p.id}" aria-pressed="${fav}">${ic("bookmark")}${fav ? t("saved") : t("save")}</button>
          <button class="btn btn-ghost btn-sm" type="button" data-act="share" data-title="${esc(p.nama)}">${ic("share")}${t("share")}</button></div>
      </div>
      <section class="detail-hero">${media(p, { banner: true, eager: true })}
        <div class="top"><span class="chip chip-solid">${ic("badge")}${p.halal ? "100% Halal Terverifikasi" : esc(p.badge)}</span><span class="chip chip-glass">${esc(p.label)}</span></div>
        <div class="inner">${p.unggulan ? `<span class="eyebrow" style="color:var(--g300)">Rekomendasi Utama SobatMusafir</span>` : ""}<h1>${esc(p.judul || p.nama)}</h1></div>
      </section>
      <div class="facts">
        <div class="fact"><span class="qi" style="color:var(--amber)">${ic("star")}</span><div><b><span data-count="${p.rating}" data-dec="1">0</span> <small>/ 5.0</small></b><small>${esc(p.ulasan)} ulasan</small></div></div>
        <div class="fact"><span class="qi">${ic("clock")}</span><div><b>${o === null ? "Jam belum diisi" : o ? t("open") : t("closed")}</b><small>${esc(p.jam.replace("-", " - "))} WIB</small></div></div>
        <div class="fact"><span class="qi">${ic(isUmkm ? "bag" : "food")}</span><div><b>${esc(p.harga)}</b><small>${isUmkm ? "Kisaran harga produk" : "Rata-rata per porsi"}</small></div></div>
        <div class="fact"><span class="qi">${ic("mosque")}</span><div><b>${fmtKm(near.k)} ke Masjid</b><small>${esc(near.m.nama)}</small></div></div>
      </div>
      <div class="cert" style="margin-top:20px">
        <div class="cert-card">
          <span class="chip chip-glass" style="justify-self:start">${ic("shield")}Status Terverifikasi</span>
          <div><h3>${p.halal ? "Muslim-Friendly Certified" : "Mitra UMKM SobatMusafir"}</h3><p style="color:rgb(255 255 255 / .8)">${p.halal ? "Sertifikat Halal BPJPH & MUI Jambi" : esc(p.badge)}</p></div>
          <div class="cert-no"><span class="seal">${ic("badge")}</span><div><small>${p.sertifikat ? "NO. SERTIFIKAT" : "STATUS"}</small><b>${esc(p.sertifikat || p.badge)}</b>
            ${p.sertifikat ? `<a class="link" href="https://bpjph.halal.go.id/" target="_blank" rel="noopener">${ic("search")}Cek di situs BPJPH</a>` : ""}</div></div>
        </div>
        <div class="map-card">
          <div class="mini-map">${scene("peta")}</div>
          <span class="chip" style="justify-self:start">${ic("pin")}${esc(p.area)}</span>
          <b>${esc(p.alamat)}</b>
          <span class="muted small">${fmtKm(near.k)} ke ${esc(near.m.nama)}</span>
          <a class="btn btn-primary btn-block" href="${mapsUrl(p)}" target="_blank" rel="noopener">${ic("nav")}${t("directions")}</a>
        </div>
      </div>
    </div>
    <section class="band">
      <div class="wrap">
        <div class="sec-head"><div><span class="eyebrow">${ic(isUmkm ? "bag" : "food")}${isUmkm ? "Katalog Produk" : "Katalog Kuliner Terkurasi"}</span><h2>${isUmkm ? "Produk Unggulan" : "Menu Khas Melayu Jambi"}</h2></div>
          ${p.menu ? `<div class="filter-row" role="group" aria-label="Kategori menu">${[["semua", "Semua Menu"], ["utama", "Hidangan Utama"], ["minum", "Kopi & Minuman"]].map(([k, l]) => `<button class="filter" type="button" data-mcat="${k}" aria-pressed="${menuCat === k}">${l}</button>`).join("")}</div>` : ""}</div>
        <div class="grid g4" id="menuGrid">${menuHTML(p)}</div>
      </div>
    </section>
    ${p.fasilitas ? `<section class="band band-soft"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">${ic("mosque")}Kenyamanan Musafir</span><h2>Fasilitas Ibadah di Lokasi</h2></div><p>Diverifikasi langsung oleh tim SobatMusafir Jambi untuk memastikan kenyamanan sholat Anda selama bersantap.</p></div>
      <div class="grid g2">${p.fasilitas.map((f) => `<article class="card fac-card"><div class="card-media">${media(f, { alt: f.judul })}<span class="chip chip-solid tl">${ic("check")}${esc(f.badge)}</span></div>
        <div class="card-body"><div class="card-row"><h3>${esc(f.judul)}</h3><span class="chip">${esc(f.info)}</span></div><p>${esc(f.teks)}</p><div class="chips">${f.tag.map((x) => `<span class="chip chip-grey">${ic("check")}${esc(x)}</span>`).join("")}</div></div></article>`).join("")}</div>
    </div></section>` : ""}`;
  };
  function menuHTML(p) {
    if (!p.menu) return `<div class="empty" style="grid-column:1/-1">${ic("image")}<p>${p.tipe === "umkm" ? "Katalog produk" : "Daftar menu"} untuk ${esc(p.nama)} belum diunggah.</p><span class="small">Tambahkan lewat data.js (field <code>menu</code>).</span></div>`;
    const list = p.menu.filter((m) => menuCat === "semua" || m.kat === menuCat);
    return list.map((m) => `<article class="card menu-card"><div class="card-media">${media(m)}<span class="chip chip-glass tl">${ic("badge")}Halal</span></div>
      <div class="card-body"><h3>${esc(m.nama)}</h3><p>${esc(m.teks)}</p><div class="card-row card-foot"><span class="price">${rp(m.harga)}</span><span class="rating">${ic("star")}${m.rating.toFixed(1)}</span></div></div></article>`).join("");
  }

  /* ---------- Jadwal sholat & kiblat ---------- */
  V.sholat = () => {
    const td = today(), q = qibla(td.region), alf = D.masjid[0];
    return `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><span>${t("cat.prayer")}</span></nav>
      <div class="head-row"><div><h1>Jadwal Sholat & Arah Kiblat Jambi</h1>
        <div class="chips" style="margin-top:12px"><span class="chip chip-solid">${ic("cal")}${esc(hijri())} • ${esc(masehi())}</span><span class="chip">${ic("pin")}${Math.abs(td.region.lat).toFixed(4)}° LS, ${td.region.lng.toFixed(4)}° BT</span></div></div>
        <label class="form" style="min-width:260px"><span class="small muted" style="font-weight:800">WILAYAH KABUPATEN / KOTA</span>
          <span class="field">${ic("pin")}<select class="select" id="regionSel" aria-label="Pilih wilayah">${D.wilayah.map((w) => `<option value="${w.id}" ${w.id === S.region ? "selected" : ""}>${esc(w.nama)}</option>`).join("")}</select></span></label></div>
    </div>
    <div class="wrap" style="display:grid;gap:24px;margin-top:20px">
      <section class="next-hero">
        <div><span class="eyebrow"><span class="dot"></span>Waktu Sholat Berikutnya</span><h2 data-l="nexttitle">Menuju Sholat ${t("p." + td.next)}</h2>
          <p>Wilayah <b>${esc(td.region.nama)}</b> • Pukul <b data-l="nexttime">${hhmm(td.times[td.next])}</b> WIB</p></div>
        <div class="count"><small>HITUNG MUNDUR</small><b data-l="count">${dur(td.left)}</b></div>
        <div class="audio-box"><strong>${ic("volume")}Pengingat Adzan</strong>
          <label class="switch"><input type="checkbox" data-act="adzan-toggle" ${S.adzan ? "checked" : ""}><span class="tr-k"></span><span data-l="adzanlbl">${S.adzan ? "Aktif otomatis" : "Nonaktif"}</span></label>
          <button class="btn btn-soft btn-sm" type="button" data-act="chime">${ic("volume")}Tes Suara</button>
          <button class="btn btn-ghost btn-sm" type="button" data-act="notif-perm">${ic("bell")}Izinkan Notifikasi</button></div>
      </section>
      <div class="split">
        <section>
          <div class="sec-head" style="margin-bottom:14px"><h2 style="font-size:24px">Jadwal Sholat Hari Ini</h2><span class="small muted" style="font-weight:700">Kriteria Kemenag RI (WIB)</span></div>
          <div class="sched" data-l="sched">${schedHTML(td)}</div>
          <p class="small muted" style="margin-top:12px">Dihitung otomatis dari koordinat wilayah (sudut Subuh 20°, Isya 18°, Ashar madzhab Syafi'i, ihtiyath 2 menit). Selisih 1–2 menit dengan jadwal resmi bisa terjadi; untuk kepastian, rujuk jadwal Kemenag/masjid setempat.</p>
          <article class="card" style="margin-top:20px"><div class="card-media">${media(alf)}<span class="chip chip-solid tl">${ic("mosque")}Masjid Ikonik Jambi</span></div>
            <div class="card-body"><h3>Masjid Agung Al-Falah (Masjid Seribu Tiang)</h3><p>Pusat ibadah utama di Kota Jambi dengan fasilitas wudhu luas, ruang sholat terbuka yang sejuk, dan akses ramah musafir.</p>
            <div class="card-foot"><a class="btn btn-soft" href="#masjid-al-falah">${t("detail")}${ic("arrow")}</a></div></div></article>
        </section>
        <aside class="panel" id="kiblat">
          <span class="eyebrow">${ic("compass")}Penunjuk Arah</span>
          <div class="card-row" style="margin-top:6px"><h3>Arah Kiblat</h3><span class="chip chip-solid">${ic("check")}Akurat</span></div>
          <div class="compass" id="compass"><div class="rose" id="rose"><span class="cd n">U</span><span class="cd e">T</span><span class="cd s">S</span><span class="cd w">B</span><div class="needle" id="needle" data-deg="${q.bearing}" style="transform:rotate(0deg)"><span class="kaaba"></span></div></div><span class="hub"></span></div>
          <div class="center" style="gap:4px"><span class="small muted" style="font-weight:800">SUDUT KIBLAT DARI ${esc(td.region.nama.toUpperCase())}</span><span class="stat-big"><span data-count="${q.bearing.toFixed(1)}" data-dec="1" data-suffix="°">0°</span> (${compassName(q.bearing)})</span>
            <span class="small muted">diukur searah jarum jam dari Utara sejati</span></div>
          <div class="kv"><div><span>Jarak ke Ka'bah</span><b data-count="${Math.round(q.dist)}" data-suffix=" km">0 km</b></div><div><span>Koordinat</span><b>${td.region.lat.toFixed(4)}, ${td.region.lng.toFixed(4)}</b></div></div>
          <button class="btn btn-primary btn-block" type="button" data-act="calibrate" style="margin-top:16px">${ic("locate")}Kalibrasi Kompas</button>
          <p class="small muted" style="margin-top:8px" id="compassNote">Di HP yang mendukung sensor arah, tekan tombol lalu putar perangkat: jarum akan menyesuaikan arah Utara.</p>
        </aside>
      </div>
    </div>`;
  };
  function schedHTML(td) {
    const icons = { subuh: "moon", terbit: "sun", dzuhur: "sun", ashar: "sun", maghrib: "sun", isya: "moon" };
    return PRAYERS.map((p) => {
      const st = p === td.next ? "next" : td.times[p] <= td.nowMin ? "past" : "";
      const chip = st === "next" ? `<span class="chip chip-solid">${t("st.next")}</span>` : st === "past" ? `<span class="chip chip-grey">${t("st.done")}</span>` : `<span class="chip">${t("st.up")}</span>`;
      return `<div class="sched-row ${st}"><span class="qi">${ic(icons[p])}</span><div><b>${t("p." + p)}</b><small>${SUB[p]}</small></div><span class="t">${hhmm(td.times[p])}</span>${chip}</div>`;
    }).join("");
  }

  /* ---------- Musholla & masjid ---------- */
  let mCat = "semua";
  V.masjid = (id) => {
    const sel = D.masjid.find((m) => m.id === id) || D.masjid[0];
    return `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><span>${t("cat.mosque")}</span></nav>
      <div class="head-row"><div><h1>Musholla & Masjid Terdekat di Jambi</h1>
        <p>Temukan tempat ibadah yang bersih, nyaman, dan ramah musafir di seluruh penjuru Kota Jambi—lengkap dengan informasi fasilitas wudhu, ketersediaan mukena, hingga akses difabel.</p></div>
        <a class="fact" href="#sholat"><span class="qi">${ic("clock")}</span><div><small style="font-weight:800">WAKTU SHOLAT JAMBI</small><b data-l="mnext"></b></div></a></div>
    </div>
    <div class="wrap">
      <div class="filter-row" role="group" aria-label="Filter" style="margin-block:14px">
        ${[["semua", "Semua"], ["Masjid Besar", "Masjid Besar"], ["Musholla Umum", "Musholla Umum"], ["wudhu", "Wudhu Bersih"], ["ac", "AC & Mukena"], ["difabel", "Ramah Difabel"]].map(([k, l]) => `<button class="filter" type="button" data-mcatf="${k}" aria-pressed="${mCat === k}">${esc(l)}</button>`).join("")}
      </div>
      <div class="list-detail">
        <div class="grid" id="mlist"></div>
        <aside class="sticky-side" id="mside">${masjidSide(sel)}</aside>
      </div>
    </div>`;
  };
  function drawMasjid(selId) {
    const ref = refPoint();
    const list = D.masjid.filter((m) => mCat === "semua" || m.jenis === mCat || (mCat === "ac" ? m.fas.includes("ac") || m.fas.includes("mukena") : m.fas.includes(mCat)))
      .map((m) => ({ m, k: km(ref, m) })).sort((a, b) => a.k - b.k);
    $("#mlist").innerHTML = list.length ? list.map(({ m, k }) => `<article class="card row-card ${m.id === selId ? "is-selected" : ""}">
      <div class="card-media">${media(m)}<span class="chip chip-glass tl">${fmtKm(k)}</span></div>
      <div class="card-body"><div class="card-row"><div><span class="card-kicker">${esc(m.jenis)}</span><h3>${esc(m.nama)}</h3></div><span class="rating">${ic("star")}${m.rating}</span></div>
        <span class="card-meta">${ic("pin")}${esc(m.alamat)}</span>${m.teks ? `<p>${esc(m.teks)}</p>` : ""}
        <div class="chips">${m.tag.map((x) => `<span class="chip">${ic("check")}${esc(x)}</span>`).join("")}</div>
        <div class="card-foot"><a class="btn btn-soft btn-block" href="#masjid-${m.id}">Lihat Detail & Foto${ic("arrow")}</a></div></div></article>`).join("")
      : `<div class="empty">${ic("mosque")}<p>Tidak ada tempat ibadah dengan filter ini.</p></div>`;
  }
  function masjidSide(m) {
    const fasL = { ac: ["wind", "AC & Kipas Sejuk"], mukena: ["users", "Mukena & Sarung"], wudhu: ["drop", "Wudhu Terpisah"], parkir: ["parking", "Parkir Luas"], difabel: ["access", "Ramah Difabel (Jalur Kursi Roda)"] };
    const k = km(refPoint(), m);
    return `<div class="side-card">
      <div class="side-head"><div><small>DETAIL LOKASI IBADAH</small><h3>${esc(m.nama)}</h3></div><span class="chip chip-glass">${fmtKm(k)} ${refPoint().label}</span></div>
      <div class="side-body">
        <div><div class="card-row"><h4>Galeri Kondisi</h4><span class="small muted">Ketuk foto untuk memperbesar</span></div>
          <div class="gallery">${m.galeri.map((g, i) => `<figure><button class="gm" type="button" data-lightbox="masjid:${m.id}:${i}" aria-label="Perbesar ${esc(g.label)}">${media(g, { alt: g.label })}</button><figcaption>${esc(g.label)}</figcaption></figure>`).join("")}</div></div>
        <div><h4>Lokasi Lengkap</h4><div class="mini-map">${scene("peta")}</div><p class="small" style="margin-top:8px">${esc(m.alamat)}</p></div>
        <div><h4>Status Kebersihan & Fasilitas</h4>
          ${m.skor ? `<div class="card-row small" style="margin-bottom:6px"><span>Skor Kebersihan</span><b>${m.skor}/10</b></div><div class="clean-bar"><i style="width:${m.skor * 10}%"></i></div>` : ""}
          <div class="chips" style="margin-top:12px">${m.fas.map((f) => fasL[f] ? `<span class="chip">${ic(fasL[f][0])}${fasL[f][1]}</span>` : "").join("")}</div></div>
        <a class="btn btn-primary btn-block" href="${mapsUrl(m)}" target="_blank" rel="noopener">${ic("nav")}${t("directions")}</a>
      </div></div>`;
  }

  /* ---------- Hotel syariah ---------- */
  const HF = { f: "semua", sort: "rek" };
  V.hotel = () => `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><span>${t("cat.hotel")}</span></nav>
      <div class="head-row"><div><h1>Hotel Syariah & Penginapan Ramah Muslim di Jambi</h1>
        <p>Akomodasi terkurasi dengan fasilitas ibadah lengkap, jaminan kuliner halal, dan kenyamanan keluarga Muslim di Bumi Melayu Jambi.</p></div>
        <div class="fact"><span class="qi">${ic("shield")}</span><div><b>100% Terverifikasi</b><small>Standar Halal Kemenag & MUI Jambi</small></div></div></div>
    </div>
    <div class="wrap">
      <div class="head-row" style="margin-block:14px">
        <div class="filter-row" role="group" aria-label="Filter">${[["semua", "Semua"], ["syariah", "Sertifikat Syariah"], ["musholla", "Musholla Hotel"], ["sarapan", "Sarapan Halal"], ["masjid", "Dekat Masjid"]].map(([k, l]) => `<button class="filter" type="button" data-hf="${k}" aria-pressed="${HF.f === k}">${l}</button>`).join("")}</div>
        <label class="field" style="min-width:220px">${ic("down")}<select class="select" id="hsort" aria-label="Urutkan"><option value="rek">Urutkan: Rekomendasi</option><option value="murah">Harga terendah</option><option value="mahal">Harga tertinggi</option><option value="rating">Rating tertinggi</option></select></label>
      </div>
      <div class="grid g4" id="hgrid"></div>
      <p class="small muted" style="margin-top:14px">Harga adalah kisaran mulai per malam dan dapat berubah; konfirmasi langsung ke penginapan sebelum memesan.</p>
    </div>`;
  function drawHotel() {
    let list = D.hotel.filter((h) => HF.f === "semua" || h.fas.includes(HF.f));
    if (HF.sort === "murah") list.sort((a, b) => a.harga - b.harga);
    if (HF.sort === "mahal") list.sort((a, b) => b.harga - a.harga);
    if (HF.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    $("#hsort").value = HF.sort;
    $("#hgrid").innerHTML = list.length ? list.map((h) => `<article class="card">
      <div class="card-media">${media(h)}<span class="chip chip-solid tl">${ic("badge")}${esc(h.badge)}</span><span class="chip chip-glass br rating">${ic("star")}${h.rating} <small>(${h.ulasan})</small></span></div>
      <div class="card-body"><span class="card-meta">${ic("pin")}${esc(h.area)}</span><h3>${esc(h.nama)}</h3>
        <div class="chips">${h.tag.map((x) => `<span class="chip chip-grey">${esc(x)}</span>`).join("")}</div>
        <div class="card-row card-foot" style="align-items:center"><div><span class="small muted">Mulai dari</span><div class="price">${rp(h.harga)} <small>/malam</small></div></div>
        <button class="btn btn-primary btn-sm" type="button" data-hotel="${h.id}">${t("detail")}</button></div></div></article>`).join("")
      : `<div class="empty" style="grid-column:1/-1">${ic("bed")}<p>Tidak ada penginapan dengan filter ini.</p></div>`;
  }
  function openHotel(id) {
    const h = D.hotel.find((x) => x.id === id); if (!h) return;
    const n = nearestMasjid(h);
    openModal(`<div class="modal-media">${media(h)}</div>
      <span class="chip chip-solid">${ic("badge")}${esc(h.badge)}</span>
      <h2 id="modalTitle" style="margin-top:10px">${esc(h.nama)}</h2>
      <p class="card-meta" style="margin-top:6px">${ic("pin")}${esc(h.area)} • <span class="rating">${ic("star")}${h.rating} <small>(${h.ulasan} ulasan)</small></span></p>
      <div class="chips" style="margin-block:14px">${h.tag.map((x) => `<span class="chip">${ic("check")}${esc(x)}</span>`).join("")}</div>
      <div class="kv"><div><span>Harga mulai</span><b>${rp(h.harga)} / malam</b></div><div><span>Masjid terdekat</span><b>${esc(n.m.nama)} (${fmtKm(n.k)})</b></div><div><span>Arah kiblat dari lokasi</span><b>${qibla(h).bearing.toFixed(1)}°</b></div></div>
      <div class="chips" style="margin-top:18px"><a class="btn btn-primary" href="${mapsUrl(h)}" target="_blank" rel="noopener">${ic("nav")}${t("directions")}</a><button class="btn btn-ghost" type="button" data-act="share" data-title="${esc(h.nama)}">${ic("share")}${t("share")}</button></div>`);
  }

  /* ---------- Detail destinasi ---------- */
  V.wisata = (id) => {
    const w = D.wisata.find((x) => x.id === id && !x.linkMasjid);
    if (!w) return V.notfound();
    const umkm = (w.umkm || []).map((u) => D.tempat.find((p) => p.id === u)).filter(Boolean);
    const inPlan = S.plan.some((s) => s.judul === w.nama);
    const near = nearestMasjid(w);
    return `
    <div class="wrap">
      <div class="toolbar">
        <div class="left"><a class="btn btn-ghost btn-sm" href="#beranda" data-act="back">${ic("back")}${t("back")}</a>
          <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><span>${t("cat.tour")}</span><span class="sep">/</span><span>Detail Destinasi</span></nav></div>
        <div class="tabs" role="tablist" aria-label="Pilih destinasi">${D.wisata.filter((x) => !x.linkMasjid).map((x) => `<a class="tab" role="tab" aria-selected="${x.id === w.id}" href="#wisata-${x.id}">${esc(x.nama.replace("Kompleks ", "").replace(" & Wisata Ketek", ""))}</a>`).join("")}</div>
      </div>
      <section class="detail-hero">${media(w, { banner: true, eager: true })}
        <div class="top"><span class="chip chip-glass">${ic("pin")}${esc(w.lokasi)}</span><span class="chip chip-amber">${ic("shield")}Ramah Muslim 100%</span></div>
        <div class="inner"><div class="chips"><span class="chip chip-solid">${esc(w.tipe)}</span><span class="chip chip-glass rating">${ic("star")}${w.rating} <small>(${esc(w.ulasan)} ulasan)</small></span></div><h1>${esc(w.nama)}</h1></div>
      </section>
      ${w.galeri ? `<div class="gallery g-strip" aria-label="Galeri foto">${w.galeri.map((g, k) => `<figure><button class="gm" type="button" data-lightbox="wisata:${w.id}:${k}" aria-label="Perbesar ${esc(g.label)}">${media(g, { alt: g.label })}</button><figcaption>${esc(g.label)}</figcaption></figure>`).join("")}</div>` : ""}
      <div class="split" style="margin-top:24px">
        <div style="display:grid;gap:16px">
          <p style="font-size:17px;color:var(--ink-2)">${esc(w.deskripsi)}</p>
          <div class="facts" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:0">
            <div class="fact"><span class="qi">${ic("clock")}</span><div><b>${w.jam ? esc(w.jam.replace("-", " – ")) + " WIB" : "Belum diisi"}</b><small>Jam Operasional${w.jam ? ` • ${isOpen(w.jam) ? t("open") : t("closed")}` : ""}</small></div></div>
            <div class="fact"><span class="qi">${ic("bag")}</span><div><b>${w.tiket ? esc(w.tiket) : "Belum diisi"}</b><small>Tiket Masuk</small></div></div>
          </div>
          <div class="chips"><button class="btn ${inPlan ? "btn-soft" : "btn-primary"}" type="button" data-act="add-to-plan" data-id="${w.id}">${ic(inPlan ? "check" : "plus")}${inPlan ? "Sudah di Rencana" : "Simpan ke Rencana"}</button>
            <a class="btn btn-ghost" href="#umkm-sekitar" data-scroll="umkm-sekitar">${ic("food")}Kuliner Halal Sekitar</a></div>
        </div>
        <aside class="map-card">
          <div class="card-row"><h3 style="font-size:18px">Lokasi & Pin Peta</h3><span class="chip">${ic("check")}Pin Aktif</span></div>
          <div class="mini-map" style="height:180px">${scene("peta")}</div>
          <span class="card-meta">${ic("pin")}${esc(w.alamat)}</span>
          <span class="small muted">Masjid terdaftar terdekat: ${esc(near.m.nama)} (${fmtKm(near.k)})</span>
          <a class="btn btn-primary btn-block" href="${mapsUrl(w)}" target="_blank" rel="noopener">${ic("nav")}Buka Google Maps</a>
        </aside>
      </div>
    </div>
    <section class="band">
      <div class="wrap">
        <div class="sec-head"><div><span class="eyebrow">${ic("mosque")}Standar Kenyamanan Ibadah</span><h2>Fasilitas Ramah Muslim di Destinasi</h2></div><span class="chip">${ic("shield")}Terverifikasi Tim SobatMusafir Jambi</span></div>
        <div class="grid g2">${[["musholla", "Ketersediaan Musholla", w.musholla], ["wudhu", "Ketersediaan Area Wudhu", w.wudhu]].map(([ph, title, f]) => `<article class="card fac-card"><div class="card-media">${media({ ph, img: f.img }, { alt: title })}<span class="chip chip-solid tl">${ic("check")}${esc(f.status)}</span></div>
          <div class="card-body"><h3>${title}</h3><p>${esc(f.teks)}</p><div class="chips">${f.tag.map((x) => `<span class="chip chip-grey">${ic("check")}${esc(x)}</span>`).join("")}</div></div></article>`).join("")}</div>
      </div>
    </section>
    <section class="band band-soft" id="umkm-sekitar">
      <div class="wrap">
        <div class="sec-head"><div><span class="eyebrow">${ic("bag")}Dukung Ekonomi Lokal Jambi</span><h2>Kuliner Halal & UMKM Sekitar Destinasi</h2></div><a class="link" href="#kuliner">Lihat Semua UMKM${ic("arrow")}</a></div>
        <div class="grid g3">${umkm.map((p) => `<article class="card"><div class="card-media">${media(p)}<span class="chip chip-solid tl">${ic("badge")}${esc(p.badge)}</span><span class="chip chip-glass bl">${ic("pin")}${fmtKm(km(w, p))} dari destinasi</span></div>
          <div class="card-body"><div class="card-row"><h3>${esc(p.nama)}</h3><span class="rating">${ic("star")}${p.rating}</span></div><p>${esc(p.ringkas || p.label)}</p>
          <div class="card-row card-foot" style="align-items:center"><b class="small">${esc(p.harga)}</b><a class="btn btn-soft btn-sm" href="#tempat-${p.id}">${esc(p.cta || t("detail"))}</a></div></div></article>`).join("")}</div>
      </div>
    </section>`;
  };

  /* ---------- Rencana perjalanan ---------- */
  let dayFilter = 0;
  const sortPlan = () => S.plan.sort((a, b) => a.hari - b.hari || toMin(a.mulai) - toMin(b.mulai));
  let planTimer;
  const savePlan = () => {
    sortPlan(); store.set("plan", S.plan);
    if (S.user && DB.ready) {
      clearTimeout(planTimer);
      planTimer = setTimeout(() => DB.savePlan(S.user.id, S.plan).then(() => setSync("tersimpan")).catch((e) => setSync("gagal", e)), 700);
      setSync("menyimpan");
    }
  };
  const nextStop = () => sortPlan().find((s) => !s.selesaiDikunjungi);
  const spots = () => [
    ...D.wisata.filter((w) => !w.linkMasjid).map((w) => ({ key: "w:" + w.id, nama: w.nama, jenis: "wisata", sub: w.ringkas, lat: w.lat, lng: w.lng, tag: ["Ramah Muslim"] })),
    ...D.tempat.map((p) => ({ key: "t:" + p.id, nama: p.nama, jenis: p.tipe === "umkm" ? "umkm" : "kuliner", sub: `${p.label} • ${p.alamat}`, lat: p.lat, lng: p.lng, tag: [p.badge] })),
    ...D.masjid.map((m) => ({ key: "m:" + m.id, nama: m.nama, jenis: "sholat", sub: m.alamat, lat: m.lat, lng: m.lng, tag: m.tag.slice(0, 2) }))
  ];
  const JENIS = { wisata: ["landmark", "Wisata Budaya & Alam"], kuliner: ["food", "Kuliner Halal"], umkm: ["bag", "Belanja UMKM"], sholat: ["mosque", "Jeda Sholat"] };
  V.rencana = () => {
    const days = [...new Set(S.plan.map((s) => s.hari))].sort();
    const td = today("kota-jambi");
    return `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><span>${t("nav.plan")}</span></nav>
      <div class="head-row"><div><span class="eyebrow" style="margin-top:14px">${ic("route")}Perencana Itinerary Pintar Musafir</span>
        <h1>Rencana Perjalanan & Itinerary Ramah Muslim Jambi</h1>
        <p>Susun rute wisata, jeda sholat fardhu tepat waktu, dan kuliner halal terkurasi di Bumi Melayu Jambi.</p></div>
        <div class="chips"><span class="chip chip-grey" style="padding:10px 14px">${ic("cal")}Rencana: <b>Jambi Heritage (${days.length}H)</b></span>
          <button class="btn btn-ghost btn-sm" type="button" data-act="share-plan">${ic("share")}${t("share")}</button>
          <button class="btn btn-primary btn-sm" type="button" data-act="save-plan">${ic("bookmark")}Simpan Itinerary</button></div></div>
    </div>
    <div class="wrap" style="display:grid;gap:20px;margin-top:20px">
      <section class="panel">
        <div class="gps">
          <div style="display:flex;gap:14px"><span class="brand-mark">${ic("locate")}</span><div><h3>Deteksi Otomatis & Navigasi (GPS Musafir)</h3>
            <p class="muted small" style="margin-top:4px">Aktifkan lokasi perangkat untuk mengukur jarak ke destinasi berikutnya dan menerima pemberitahuan saat Anda sudah dekat (radius 300 m).</p></div></div>
          <div class="gps-status"><span><span class="dot ${S.gps ? "" : "off"}" data-l="gpsdot"></span> Status GPS: <b data-l="gpsstat">${S.gps ? "Aktif" : "Belum aktif"}</b></span>
            <button class="btn btn-soft btn-sm" type="button" data-act="gps">${ic("locate")}${S.gps ? "Segarkan Koordinat" : "Aktifkan Lokasi"}</button></div>
        </div>
        <div class="notify" data-l="notify"></div>
      </section>
      <div class="plan-layout">
        <section>
          <div class="head-row" style="margin-bottom:16px;align-items:center">
            <div class="filter-row" role="group" aria-label="Filter hari"><button class="filter" type="button" data-day="0" aria-pressed="${dayFilter === 0}">Semua Hari</button>
              ${days.map((d) => `<button class="filter" type="button" data-day="${d}" aria-pressed="${dayFilter === d}">Hari ${d}</button>`).join("")}</div>
            <div class="summary" data-l="psum"></div>
          </div>
          <div class="timeline" id="timeline"></div>
          <div class="chips" style="margin-top:16px"><button class="btn btn-ghost btn-sm" type="button" data-act="reset-plan">${ic("trash")}Kembalikan ke contoh awal</button></div>
        </section>
        <aside style="display:grid;gap:16px;align-content:start">
          <form class="panel form" id="addStop">
            <div class="card-row"><h3>${ic("plus")} Tambah Titik Kunjungan</h3></div>
            <label>Pilih Destinasi / Spot Jambi<select class="select plain" name="spot" required>${spots().map((s) => `<option value="${s.key}">${esc(s.nama)}</option>`).join("")}</select></label>
            <div class="two"><label>Hari<select class="select plain" name="hari">${[1, 2, 3, 4].map((d) => `<option value="${d}">Hari ${d}</option>`).join("")}</select></label>
              <label>Jam Mulai<input class="input plain" name="mulai" type="time" value="14:00" required></label></div>
            <div class="two"><label>Durasi<select class="select plain" name="durasi"><option value="30">30 menit</option><option value="60" selected>1 jam</option><option value="90">1,5 jam</option><option value="120">2 jam</option><option value="180">3 jam</option></select></label>
              <label>Kategori Singgah<select class="select plain" name="jenis"><option value="">Otomatis</option>${Object.entries(JENIS).map(([k, v]) => `<option value="${k}">${v[1]}</option>`).join("")}</select></label></div>
            <label>Catatan Khusus Musafir<textarea class="textarea" name="catatan" placeholder="Contoh: Sewa sepeda di gerbang, bawa mukena cadangan..."></textarea></label>
            <button class="btn btn-primary btn-block" type="submit">${ic("plus")}Tambahkan ke Jadwal</button>
            <button class="btn btn-soft btn-block" type="button" data-act="insert-dzuhur">${ic("mosque")}Sisipkan Jeda Sholat Dzuhur Otomatis</button>
          </form>
          <div class="panel"><div class="card-row"><b>Jadwal Sholat Hari Ini (Kota Jambi)</b><span class="small muted">WIB</span></div>
            <div class="mini-times">${PRAYERS.filter((p) => p !== "terbit").map((p) => `<div class="${p === td.next ? "next" : ""}">${t("p." + p)}<b>${hhmm(td.times[p])}</b></div>`).join("")}</div>
            <p class="small muted" style="margin-top:8px">Dihitung otomatis dengan kriteria Kemenag.</p></div>
        </aside>
      </div>
    </div>`;
  };
  function drawPlan() {
    sortPlan();
    const nx = nextStop();
    const list = S.plan.filter((s) => !dayFilter || s.hari === dayFilter);
    const all = S.plan;
    $("#timeline").innerHTML = list.length ? list.map((s) => {
      const idx = all.indexOf(s) + 1;
      const isNext = nx && nx.id === s.id;
      const cls = [s.selesaiDikunjungi ? "done" : "", isNext ? "next" : "", s.jenis === "sholat" ? "sholat" : ""].join(" ");
      const status = s.selesaiDikunjungi ? `<span class="chip chip-solid">${ic("check")}Selesai Dikunjungi</span>` : isNext ? `<span class="chip chip-amber"><span class="dot"></span>Menuju Lokasi</span>` : `<span class="chip chip-grey">Mendatang</span>`;
      const prev = all[idx - 2];
      const leg = prev && prev.lat && s.lat && prev.hari === s.hari ? km(prev, s) : null;
      return `<div class="stop ${cls}" data-sid="${s.id}"><span class="stop-dot">${s.selesaiDikunjungi ? ic("check") : ic(JENIS[s.jenis]?.[0] || "pin")}</span>
        <article class="stop-card">
          <div class="card-row"><div class="when">${ic("clock")}${s.mulai} - ${s.selesai} WIB <span class="chip ${s.jenis === "sholat" ? "chip-solid" : "chip-grey"}">${s.jenis === "sholat" ? "Jeda Sholat Fardhu" : `Stop #${idx} • Hari ${s.hari}`}${isNext ? " • NEXT STOP" : ""}</span></div>${status}</div>
          <h3>${esc(s.judul)}</h3><p class="muted small">${esc(s.sub)}</p>
          ${s.tag?.length ? `<div class="chips">${s.tag.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>` : ""}
          ${leg != null ? `<span class="small muted">${ic("route")} Jarak dari titik sebelumnya: ${fmtKm(leg)} (garis lurus)</span>` : ""}
          ${s.catatan ? `<p class="note">Catatan: ${esc(s.catatan)}</p>` : ""}
          <div class="stop-actions">
            ${s.lat ? `<a class="btn btn-ghost btn-sm" href="${mapsUrl(s)}" target="_blank" rel="noopener">${ic("nav")}Buka Rute Maps</a>` : ""}
            <button class="btn ${s.selesaiDikunjungi ? "btn-ghost" : "btn-primary"} btn-sm" type="button" data-act="toggle-stop" data-id="${s.id}">${ic("check")}${s.selesaiDikunjungi ? "Batalkan Tanda" : "Tandai Sampai"}</button>
            <button class="icon-btn" type="button" data-act="del-stop" data-id="${s.id}" aria-label="Hapus ${esc(s.judul)}">${ic("trash")}</button>
          </div>
        </article></div>`;
    }).join("") : `<div class="empty">${ic("cal")}<p>Belum ada titik singgah untuk hari ini. Tambahkan lewat formulir di samping.</p></div>`;
    if (flashId || popId) {
      const el = $(`[data-sid="${flashId || popId}"]`);
      if (el) { el.classList.add(flashId ? "flash" : "popdone"); if (flashId) setTimeout(() => el.scrollIntoView({ block: "center", behavior: motionOK() ? "smooth" : "auto" }), 260); }
      flashId = popId = null;
    }
    const sh = S.plan.filter((s) => s.jenis === "sholat").length;
    $("[data-l=psum]").innerHTML = `<span>${ic("pin")} <b>${S.plan.length - sh}</b> Titik Singgah</span><span>${ic("mosque")} <b>${sh}</b> Jeda Ibadah</span>`;
    drawNotify();
  }
  function drawNotify() {
    const box = $("[data-l=notify]"); if (!box) return;
    const nx = nextStop();
    const td = today("kota-jambi");
    if (!nx) { box.innerHTML = `${ic("check")}<div><b>Semua titik sudah dikunjungi.</b> Alhamdulillah — perjalanan selesai!</div>`; return; }
    let distTxt = "";
    if (S.gps && nx.lat) {
      const d = km(S.gps, nx);
      distTxt = d < 0.3 ? `<b>Anda sudah dekat dengan ${esc(nx.judul)}!</b> ` : `Jarak Anda ke Next Stop: <b>${fmtKm(d)}</b>. `;
    }
    box.innerHTML = `<span class="brand-mark" style="width:40px;height:40px">${ic("bell")}</span>
      <div><b>Next Stop:</b> ${esc(nx.judul)} (Hari ${nx.hari}, ${nx.mulai} WIB). ${distTxt}${td.next !== "subuh" || td.times.subuh > td.nowMin ? `Sholat ${t("p." + td.next)} hari ini pukul <b>${hhmm(td.times[td.next])} WIB</b>.` : ""}</div>
      <a class="btn btn-primary btn-sm" href="#masjid">${ic("mosque")}Lihat Musholla</a>`;
  }

  /* ---------- Tentang ---------- */
  V.tentang = () => `
    <div class="wrap page-head">
      <nav class="crumb" aria-label="Breadcrumb"><a href="#beranda">${t("nav.home")}</a><span class="sep">/</span><span>${t("nav.about")}</span></nav>
      <h1>Tentang SobatMusafir Jambi</h1>
      <p>${t("foot.about")}</p>
    </div>
    <div class="wrap" style="display:grid;gap:28px;margin-top:24px">
      <section class="grid g3">
        <div class="panel"><span class="brand-mark">${ic("shield")}</span><h3 style="margin-top:12px">Kurasi Halal</h3><p class="muted" style="margin-top:6px">Tempat makan dan UMKM ditampilkan beserta status sertifikasi halal yang dapat dicek ulang di situs BPJPH.</p></div>
        <div class="panel"><span class="brand-mark">${ic("mosque")}</span><h3 style="margin-top:12px">Ibadah Tetap Tenang</h3><p class="muted" style="margin-top:6px">Jadwal sholat per kabupaten/kota, arah kiblat, serta info musholla dan tempat wudhu di setiap destinasi.</p></div>
        <div class="panel"><span class="brand-mark">${ic("bag")}</span><h3 style="margin-top:12px">Gerakkan UMKM Lokal</h3><p class="muted" style="margin-top:6px">Menghubungkan wisatawan dengan pengrajin batik, produsen kopi, dan kuliner khas Jambi.</p></div>
      </section>
      <section class="panel prose" id="tentang-fiqih">
        <h2>Panduan Singkat Fiqih Musafir</h2>
        <p>Islam memberi keringanan (rukhsah) bagi orang yang sedang dalam perjalanan. Ringkasan umum yang sering dirujuk:</p>
        <ul><li><b>Qashar</b>: meringkas sholat empat rakaat (Dzuhur, Ashar, Isya) menjadi dua rakaat.</li>
          <li><b>Jamak</b>: menggabungkan Dzuhur dengan Ashar, atau Maghrib dengan Isya, di salah satu waktunya (taqdim atau ta'khir).</li>
          <li>Ketentuan jarak dan lama perjalanan berbeda antar-madzhab. Tanyakan kepada ustadz atau rujuk panduan resmi Kemenag untuk kondisi Anda.</li></ul>
      </section>
      <section class="split" id="tentang-mitra">
        <div class="prose"><h2>Daftar Mitra UMKM & Verifikasi Halal</h2>
          <p>Pelaku UMKM di Provinsi Jambi dapat mendaftarkan usahanya agar tampil di direktori SobatMusafir. Siapkan nomor sertifikat halal (jika ada), alamat usaha, dan foto tempat.</p>
          <p class="small muted">Belum punya sertifikat? Pendaftaran sertifikasi halal dilakukan melalui BPJPH (ptsp.halal.go.id).</p></div>
        <form class="panel form" id="mitraForm">
          <label>Nama Usaha<input class="input plain" name="usaha" required></label>
          <div class="two"><label>Nama Pemilik<input class="input plain" name="nama" required></label><label>No. WhatsApp<input class="input plain" name="wa" inputmode="tel" required></label></div>
          <div class="two"><label>Jenis Usaha<select class="select plain" name="jenis"><option>Kuliner</option><option>Kafe & Kopi</option><option>Kerajinan / Batik</option><option>Oleh-oleh</option><option>Penginapan</option></select></label>
            <label>Wilayah<select class="select plain" name="wil">${D.wilayah.map((w) => `<option>${esc(w.nama)}</option>`).join("")}</select></label></div>
          <label>No. Sertifikat Halal (opsional)<input class="input plain" name="sert"></label>
          <button class="btn btn-primary" type="submit">${ic("check")}Kirim Pendaftaran</button>
        </form>
      </section>
      <section id="tentang-bantuan" style="display:grid;gap:12px">
        <div class="sec-head" style="margin-bottom:4px"><div><span class="eyebrow">${ic("info")}Pusat Bantuan Wisatawan</span><h2>Pertanyaan Umum</h2></div></div>
        <details class="faq"><summary>Dari mana jadwal sholat di situs ini?</summary><p>Jadwal dihitung otomatis dari koordinat tiap kabupaten/kota dengan kriteria Kemenag (Subuh 20°, Isya 18°, ihtiyath 2 menit). Bisa berbeda 1–2 menit dari jadwal resmi.</p></details>
        <details class="faq"><summary>Apakah status halal di sini bisa dipercaya?</summary><p>Nomor sertifikat ditampilkan agar Anda bisa mengeceknya sendiri di situs resmi BPJPH.</p></details>
        <details class="faq"><summary>Apakah itinerary saya tersimpan?</summary><p>Ya, itinerary dan tempat favorit tersimpan di browser perangkat ini. Data tidak berpindah ke perangkat lain.</p></details>
        <details class="faq"><summary>Bagaimana menghubungi tim SobatMusafir?</summary><p>Gunakan formulir kemitraan di atas untuk kolaborasi. Kanal kontak resmi (email/WhatsApp) akan dicantumkan di sini.</p></details>
      </section>
    </div>`;

  V.notfound = () => `<div class="wrap band"><div class="empty">${ic("info")}<p>Halaman tidak ditemukan.</p><a class="btn btn-primary" href="#beranda">${t("nav.home")}</a></div></div>`;

  /* =========================================================
     ROUTER
     ========================================================= */
  let lastHash = "";
  function route(opts = {}) {
    let h = (location.hash || "#beranda").slice(1) || "beranda";
    if (/access_token=|error_description=|type=recovery|type=signup/.test(h)) h = "beranda"; // kembali dari tautan email Supabase
    const quiet = opts === true || opts.quiet === true;
    let view, arg, navKey, scrollTo;
    if (h.startsWith("tempat-")) { view = "tempat"; arg = h.slice(7); navKey = "guide"; }
    else if (h.startsWith("wisata-")) { view = "wisata"; arg = h.slice(7); navKey = "wisata"; }
    else if (h.startsWith("masjid-")) { view = "masjid"; arg = h.slice(7); navKey = "guide"; }
    else if (h.startsWith("tentang-")) { view = "tentang"; navKey = "tentang"; scrollTo = h; }
    else if (h === "kiblat") { view = "sholat"; navKey = "guide"; scrollTo = "kiblat"; }
    else if (V[h] && !["tempat", "wisata", "notfound"].includes(h)) { view = h; navKey = ["kuliner", "masjid", "sholat", "hotel"].includes(h) ? "guide" : h; }
    else if (document.getElementById(h) && app.contains(document.getElementById(h))) { document.getElementById(h).scrollIntoView(); return; }
    else { view = "notfound"; }

    const sameMasjid = !quiet && view === "masjid" && lastHash.startsWith("masjid") && $("#mside");
    lastHash = h;
    if (sameMasjid) {
      const sel = D.masjid.find((m) => m.id === arg) || D.masjid[0];
      const side = $("#mside");
      side.classList.add("swap-out");
      setTimeout(() => {
        side.innerHTML = masjidSide(sel); side.classList.remove("swap-out");
        drawMasjid(sel.id); afterPaint(side);
        if (matchMedia("(max-width: 960px)").matches) side.scrollIntoView({ behavior: "smooth" });
      }, motionOK() ? 160 : 0);
      return;
    }
    const token = ++routeToken;
    const paint = () => {
      if (token !== routeToken) return;
      const keepY = scrollY;
      app.classList.remove("leaving");
      app.classList.toggle("no-anim", quiet);
      app.innerHTML = `<div class="${quiet ? "" : "view-enter"}">${V[view](arg)}</div>`;
      if (view === "kuliner") drawKuliner();
      if (view === "masjid") drawMasjid(arg || D.masjid[0].id);
      if (view === "hotel") drawHotel();
      if (view === "rencana") drawPlan();
      $$("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === navKey));
      closeMenu();
      document.title = (view === "beranda" ? "SobatMusafir Jambi" : ($("h1", app)?.textContent || "SobatMusafir") + " — SobatMusafir Jambi").slice(0, 80);
      if (quiet) window.scrollTo({ top: keepY, behavior: "instant" });
      else if (scrollTo && document.getElementById(scrollTo)) setTimeout(() => document.getElementById(scrollTo).scrollIntoView({ behavior: "smooth" }), 60);
      else window.scrollTo({ top: 0, behavior: "instant" });
      afterPaint(app);
      if (quiet) { $$(".reveal", app).forEach((el) => el.classList.add("in")); requestAnimationFrame(() => app.classList.remove("no-anim")); }
      tick();
    };
    if (booted && !quiet && motionOK() && app.firstElementChild) { app.classList.add("leaving"); setTimeout(paint, 180); }
    else paint();
    booted = true;
  }
  let routeToken = 0, booted = false;

  /* =========================================================
     DETAK DETIK: hitung mundur, status, pengingat adzan
     ========================================================= */
  function tick() {
    const td = today();
    const nm = `${t("pw.toward")} ${t("p." + td.next)}`;
    $$("[data-l=count]").forEach((e) => { e.textContent = dur(td.left); replay(e, "beat"); });
    $$("[data-l=nextname]").forEach((e) => (e.textContent = nm));
    const nt = $("[data-l=nexttitle]"); if (nt) nt.textContent = `${S.lang === "en" ? "Next:" : "Menuju Sholat"} ${t("p." + td.next)}`;
    const ntt = $("[data-l=nexttime]"); if (ntt) ntt.textContent = hhmm(td.times[td.next]);
    const qn = $("[data-l=quicknext]"); if (qn) qn.textContent = `${t("p." + td.next)} ${hhmm(td.times[td.next])} WIB`;
    const mn = $("[data-l=mnext]"); if (mn) { const tk = today("kota-jambi"); mn.textContent = `${t("p." + tk.next)} ${hhmm(tk.times[tk.next])} • ${Math.ceil(tk.left / 60)} mnt lagi`; }
    const at = $("[data-l=alerttext]"); if (at) at.textContent = S.adzan ? `Menjelang ${t("p." + td.next)} ${hhmm(td.times[td.next])} WIB, nada pengingat berbunyi dan notifikasi layar muncul (selama halaman ini terbuka).` : "Pengingat suara sedang dimatikan.";
    if (td.n.s === 0 || !tick.last || tick.last !== td.next) {
      $$("[data-l=times]").forEach((e) => (e.innerHTML = timesHTML(td)));
      $$("[data-l=sched]").forEach((e) => (e.innerHTML = schedHTML(td)));
      tick.last = td.next;
    }
    // Pengingat tepat waktu
    const key = `${td.n.y}-${td.n.m}-${td.n.d}`;
    PRAYERS.filter((p) => p !== "terbit").forEach((p) => {
      const id = key + p;
      if (!S.fired[id] && td.nowMin >= td.times[p] && td.nowMin < td.times[p] + 1) { S.fired[id] = 1; notifyPrayer(p, hhmm(td.times[p])); }
    });
  }

  /* =========================================================
     MODAL
     ========================================================= */
  let lastFocus;
  function openModal(html, wide = false) {
    lastFocus = document.activeElement;
    $("#modalBody").innerHTML = html;
    $(".modal-card").classList.toggle("wide", wide);
    $("#modal").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".modal-x").focus(), 30);
  }
  function closeModal() {
    const m = $("#modal");
    if (m.hidden) return;
    const done = () => { m.hidden = true; m.classList.remove("closing"); $("#modalBody").innerHTML = ""; };
    if (motionOK()) { m.classList.add("closing"); setTimeout(done, 230); } else done();
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }

  /* ---------- Bagikan / salin ---------- */
  async function shareText(title, text) {
    const url = location.href;
    const full = `${text}\n${url}`;
    try { if (navigator.share) { await navigator.share({ title, text, url }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(full); toast("Tautan & teks disalin ke clipboard."); return; } catch { /* lanjut ke modal */ }
    openModal(`<h2 id="modalTitle">${t("share")}</h2><p class="muted" style="margin:8px 0 12px">Salin teks di bawah ini:</p><textarea class="textarea" readonly rows="8" onclick="this.select()">${esc(full)}</textarea>`);
  }
  function planText() {
    sortPlan();
    return "Itinerary SobatMusafir Jambi\n" + S.plan.map((s) => `Hari ${s.hari} • ${s.mulai}-${s.selesai} WIB — ${s.judul}${s.selesaiDikunjungi ? " ✓" : ""}`).join("\n");
  }

  /* =========================================================
     EVENT
     ========================================================= */
  function closeMenu() { $("#mainnav").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false"); $$(".dd").forEach((d) => d.classList.remove("open")); }

  document.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-act],[data-close],[data-lang],[data-kcat],[data-kf],[data-mcat],[data-mcatf],[data-hf],[data-day],[data-radius],[data-fac],[data-tab],[data-hotel],[data-lightbox],[data-authtab],[data-scroll],.dd-btn,#menuBtn,#themeBtn,#loginBtn,#toTop");
    if (!e.target.closest(".dd")) $$(".dd").forEach((d) => d.classList.remove("open"));
    if (!a) return;
    const d = a.dataset;

    if (a.matches("[data-close]")) return closeModal();
    if (a.id === "toTop") { window.scrollTo({ top: 0, behavior: motionOK() ? "smooth" : "auto" }); return; }
    if (a.id === "menuBtn") { const o = $("#mainnav").classList.toggle("open"); a.setAttribute("aria-expanded", String(o)); return; }
    if (a.classList.contains("dd-btn")) { const dd = a.closest(".dd"); const o = dd.classList.toggle("open"); a.setAttribute("aria-expanded", String(o)); return; }
    if (a.id === "themeBtn") {
      const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      S.theme = cur === "dark" ? "light" : "dark";
      const r = a.getBoundingClientRect();
      setTheme(S.theme, r.left + r.width / 2, r.top + r.height / 2); store.set("theme", S.theme);
      a.setAttribute("aria-label", S.theme === "dark" ? "Mode terang" : "Mode gelap");
      return;
    }
    if (a.id === "loginBtn") return openAuth(S.user ? "akun" : "masuk");
    if (d.authtab) return openAuth(d.authtab);
    if (d.lang) { S.lang = d.lang; store.set("lang", S.lang); applyI18n(); renderAuthBtn(); route(); return; }
    if (d.kcat) { KF.cat = d.kcat; $$("[data-kcat]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); return drawKuliner(); }
    if (d.kf) { KF[d.kf] = !KF[d.kf]; a.setAttribute("aria-pressed", String(KF[d.kf])); return drawKuliner(); }
    if (d.mcat) { menuCat = d.mcat; $$("[data-mcat]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); const p = D.tempat.find((x) => location.hash === "#tempat-" + x.id); if (p) $("#menuGrid").innerHTML = menuHTML(p); return; }
    if (d.mcatf) { mCat = d.mcatf; $$("[data-mcatf]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); const id = location.hash.startsWith("#masjid-") ? location.hash.slice(8) : D.masjid[0].id; return drawMasjid(id); }
    if (d.hf) { HF.f = d.hf; $$("[data-hf]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); return drawHotel(); }
    if (d.hotel) { e.preventDefault(); return openHotel(d.hotel); }
    if (d.lightbox) { const [k, id, i] = d.lightbox.split(":"); return openLightbox(k, id, Number(i)); }
    if (d.day) { dayFilter = Number(d.day); $$("[data-day]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); return drawPlan(); }
    if (d.radius) { const on = a.getAttribute("aria-pressed") !== "true"; $$("[data-radius]").forEach((b) => b.setAttribute("aria-pressed", "false")); a.setAttribute("aria-pressed", String(on)); return runHomeSearch($("#homeSearch")); }
    if (d.fac) { a.setAttribute("aria-pressed", String(a.getAttribute("aria-pressed") !== "true")); return runHomeSearch($("#homeSearch")); }
    if (d.scroll) { e.preventDefault(); document.getElementById(d.scroll)?.scrollIntoView({ behavior: "smooth" }); return; }
    if (d.tab) {
      $$("#featTabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b === a)));
      placeTabs($("#featTabs"));
      const panel = $("#featPanel");
      replay(panel, "swap-in");
      if (d.tab === "pray") panel.innerHTML = prayerWidget();
      if (d.tab === "dest") { const w = D.wisata[0]; panel.innerHTML = `<div class="grid g2" style="align-items:stretch">${wisataCard(w)}<div class="panel" style="display:grid;gap:12px;align-content:start"><h3>${esc(w.nama)}</h3><div class="kv"><div><span>Jam operasional</span><b>${esc(w.jam.replace("-", " – "))} WIB</b></div><div><span>Tiket</span><b>${esc(w.tiket)}</b></div><div><span>Musholla</span><b>${esc(w.musholla.status)}</b></div><div><span>Area wudhu</span><b>${esc(w.wudhu.status)}</b></div><div><span>Arah kiblat</span><b>${qibla(w).bearing.toFixed(1)}°</b></div></div><a class="btn btn-primary" href="#wisata-${w.id}">Buka Detail Destinasi${ic("arrow")}</a></div></div>`; }
      if (d.tab === "food") {
        panel.innerHTML = `<div class="panel"><div class="field">${ic("search")}<input class="input" id="miniFood" type="search" placeholder="Coba: tempoyak, kopi, pempek..." aria-label="Cari kuliner halal"></div><div class="grid g2" id="miniFoodRes" style="margin-top:14px;gap:10px"></div></div>`;
        miniFood("");
      }
      return;
    }

    switch (d.act) {
      case "fav": {
        const i = S.favs.indexOf(d.id);
        if (i >= 0) S.favs.splice(i, 1); else S.favs.push(d.id);
        store.set("favs", S.favs);
        const on = S.favs.includes(d.id);
        a.classList.toggle("btn-primary", on); a.classList.toggle("btn-ghost", !on); a.setAttribute("aria-pressed", String(on));
        a.innerHTML = `${ic("bookmark")}${on ? t("saved") : t("save")}`;
        pop(a);
        if (S.user && DB.ready) (on ? DB.addFav(d.id) : DB.delFav(d.id)).then(() => setSync("tersimpan")).catch((err) => { setSync("gagal", err); toast("Favorit tersimpan di perangkat, tapi gagal disinkronkan: " + DB.pesan(err)); });
        return toast(on ? (S.user ? "Disimpan ke favorit akun Anda." : "Disimpan ke favorit. Masuk agar tersimpan di semua perangkat.") : "Dihapus dari favorit.");
      }
      case "share": return shareText(d.title, `${d.title} — SobatMusafir Jambi`);
      case "chime": return chime() ? toast("Memutar nada pengingat…") : toast("Browser ini tidak mendukung pemutaran suara.");
      case "test-notif": {
        const td = today();
        return notifyPrayer(td.next, hhmm(td.times[td.next]));
      }
      case "notif-perm": {
        if (!("Notification" in window)) return toast("Notifikasi tidak didukung di browser/tampilan ini. Pengingat tetap muncul di layar.");
        try { const r = await Notification.requestPermission(); toast(r === "granted" ? "Notifikasi diizinkan." : "Izin notifikasi tidak diberikan. Pengingat tetap muncul di layar."); } catch { toast("Izin notifikasi tidak dapat diminta di tampilan ini."); }
        return;
      }
      case "calibrate": {
        const needle = $("#needle"), q = qibla(regionOf(S.region));
        needle.style.transform = `rotate(${q.bearing + 360}deg)`;
        setTimeout(() => { needle.style.transition = "none"; needle.style.transform = `rotate(${q.bearing}deg)`; needle.offsetHeight; needle.style.transition = ""; }, 1100);
        const DOE = window.DeviceOrientationEvent;
        const start = () => {
          window.addEventListener("deviceorientationabsolute", onOrient, true);
          window.addEventListener("deviceorientation", onOrient, true);
          $("#compassNote").textContent = "Sensor aktif. Putar perangkat; mawar arah mengikuti Utara.";
        };
        try {
          if (DOE && typeof DOE.requestPermission === "function") { const r = await DOE.requestPermission(); if (r === "granted") start(); else $("#compassNote").textContent = "Izin sensor arah ditolak. Gunakan sudut kiblat di atas sebagai acuan."; }
          else if (DOE && matchMedia("(pointer: coarse)").matches) start();
          else $("#compassNote").textContent = "Sensor arah tidak tersedia di perangkat ini. Jarum menunjukkan sudut kiblat dari Utara sejati.";
        } catch { $("#compassNote").textContent = "Sensor arah tidak dapat diakses di tampilan ini."; }
        return;
      }
      case "add-to-plan": {
        const w = D.wisata.find((x) => x.id === d.id);
        if (S.plan.some((s) => s.judul === w.nama)) { location.hash = "#rencana"; return; }
        const last = [...S.plan].sort((x, y) => y.hari - x.hari || toMin(y.selesai) - toMin(x.selesai))[0];
        const day = last ? last.hari : 1, start = last ? Math.min(toMin(last.selesai) + 30, 20 * 60) : 9 * 60;
        S.plan.push({ id: "s" + Date.now(), hari: day, mulai: hhmm(start), selesai: hhmm(start + 120), jenis: "wisata", judul: w.nama, sub: w.ringkas, tag: ["Ramah Muslim"], catatan: "", lat: w.lat, lng: w.lng });
        savePlan();
        a.className = "btn btn-soft"; a.innerHTML = `${ic("check")}Sudah di Rencana`;
        return toast(`${w.nama} ditambahkan ke Hari ${day}, ${hhmm(start)} WIB.`);
      }
      case "toggle-stop": { const s = S.plan.find((x) => x.id === d.id); s.selesaiDikunjungi = !s.selesaiDikunjungi; popId = s.id; savePlan(); drawPlan(); return; }
      case "del-stop": {
        const stopEl = a.closest(".stop");
        if (motionOK() && stopEl) { stopEl.style.height = stopEl.offsetHeight + "px"; stopEl.classList.add("leaving"); await new Promise((r) => setTimeout(r, 320)); }
        const i = S.plan.findIndex((x) => x.id === d.id); if (i < 0) return; const [rm] = S.plan.splice(i, 1); savePlan(); drawPlan();
        const el = $("#toast"); toast(`“${rm.judul}” dihapus.`);
        undoStop = rm; el.insertAdjacentHTML("beforeend", ` <button class="btn btn-sm btn-light" type="button" data-act="undo" style="pointer-events:auto;margin-left:8px">Urungkan</button>`); el.style.pointerEvents = "auto";
        return;
      }
      case "undo": if (undoStop) { S.plan.push(undoStop); flashId = undoStop.id; undoStop = null; savePlan(); drawPlan(); $("#toast").classList.remove("show"); $("#toast").style.pointerEvents = ""; } return;
      case "reset-plan": S.plan = structuredClone(D.itinerary); savePlan(); dayFilter = 0; route(); return toast("Itinerary dikembalikan ke contoh awal.");
      case "save-plan": savePlan(); return toast("Itinerary tersimpan di browser ini.");
      case "share-plan": return shareText("Itinerary SobatMusafir Jambi", planText());
      case "insert-dzuhur": {
        const f = $("#addStop"); const day = Number(f.hari.value);
        if (S.plan.some((s) => s.hari === day && s.jenis === "sholat" && /dzuhur/i.test(s.judul))) return toast(`Hari ${day} sudah memiliki jeda sholat Dzuhur.`);
        const td = today("kota-jambi");
        const before = S.plan.filter((s) => s.hari === day && toMin(s.mulai) <= td.times.dzuhur).pop();
        const near = before && before.lat ? nearestMasjid(before) : { m: D.masjid[0] };
        flashId = "s" + Date.now();
        S.plan.push({ id: flashId, hari: day, mulai: hhmm(td.times.dzuhur - 10), selesai: hhmm(td.times.dzuhur + 45), jenis: "sholat", judul: `Sholat Dzuhur di ${near.m.nama}`, sub: `Waktu Dzuhur ${hhmm(td.times.dzuhur)} WIB • ${near.m.alamat}`, tag: near.m.tag.slice(0, 2), catatan: "", lat: near.m.lat, lng: near.m.lng });
        savePlan(); drawPlan(); return toast(`Jeda Dzuhur (${hhmm(td.times.dzuhur)} WIB) ditambahkan ke Hari ${day}.`);
      }
      case "gps": {
        const stat = $("[data-l=gpsstat]");
        if (!("geolocation" in navigator)) { stat.textContent = "Tidak didukung"; return toast("Perangkat ini tidak mendukung GPS di browser."); }
        stat.textContent = "Mencari lokasi…";
        navigator.geolocation.getCurrentPosition((pos) => {
          S.gps = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
          stat.textContent = `Aktif (akurasi ±${Math.round(S.gps.acc)} m)`; $("[data-l=gpsdot]")?.classList.remove("off");
          a.innerHTML = `${ic("locate")}Segarkan Koordinat`;
          drawNotify();
        }, (err) => {
          stat.textContent = err.code === 1 ? "Izin lokasi ditolak" : "Lokasi tidak tersedia";
          toast("Lokasi tidak bisa diakses. Pastikan izin lokasi aktif dan situs dibuka lewat HTTPS.");
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
        return;
      }
      case "lb-prev": return lbStep(-1);
      case "lb-next": return lbStep(1);
      case "kreset": Object.assign(KF, { q: "", reg: "", cat: "semua", halal: false, mus: false, open: false, fav: false }); return route();
    }
  });
  let undoStop = null, flashId = null, popId = null;

  function onOrient(ev) {
    let heading = null;
    if (typeof ev.webkitCompassHeading === "number") heading = ev.webkitCompassHeading;
    else if (ev.absolute && typeof ev.alpha === "number") heading = 360 - ev.alpha;
    if (heading == null) return;
    const rose = $("#rose"); if (rose) rose.style.transform = `rotate(${-heading}deg)`;
  }

  function miniFood(q) {
    const box = $("#miniFoodRes"); if (!box) return;
    const res = D.tempat.filter((p) => p.tipe !== "umkm" && `${p.nama} ${p.label} ${(p.menu || []).map((m) => m.nama).join(" ")} ${p.ringkas || ""}`.toLowerCase().includes(q.toLowerCase()));
    box.innerHTML = res.length ? res.slice(0, 6).map((p) => `<a class="card" style="flex-direction:row;align-items:center;gap:12px;padding:12px" href="#tempat-${p.id}">
      <span style="position:relative;width:64px;height:64px;border-radius:12px;overflow:hidden;flex:none">${media(p)}</span>
      <span style="display:grid;gap:2px"><b>${esc(p.nama)}</b><span class="small muted">${esc(p.label)} • ${isOpen(p.jam) ? t("open") : t("closed")}</span><span class="rating small">${ic("star")}${p.rating}</span></span></a>`).join("")
      : `<div class="empty" style="grid-column:1/-1">${ic("search")}<p>Tidak ditemukan.</p></div>`;
  }

  document.addEventListener("input", (e) => {
    if (e.target.id === "kq") { KF.q = e.target.value; drawKuliner(); }
    if (e.target.id === "miniFood") miniFood(e.target.value);
    if (e.target.closest("#homeSearch") && e.target.name === "q" && e.target.value === "") $("#searchResults").hidden = true;
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.id === "kreg") { KF.reg = el.value; drawKuliner(); }
    if (el.id === "hsort") { HF.sort = el.value; drawHotel(); }
    if (el.id === "regionSel") { S.region = el.value; store.set("region", S.region); route(); }
    if (el.matches("[data-act=adzan-toggle]")) {
      S.adzan = el.checked; store.set("adzan", S.adzan);
      if (S.adzan) chime();
      const lbl = el.closest(".switch"); const span = lbl.querySelector("[data-l=adzanlbl]");
      if (span) span.textContent = S.adzan ? "Aktif otomatis" : "Nonaktif";
      else lbl.lastChild.textContent = `${t("pw.sound")} ${S.adzan ? "ON" : "OFF"}`;
      const chip = $("[data-l=adzanchip]"); if (chip) { chip.textContent = S.adzan ? "AKTIF" : "NONAKTIF"; chip.className = "chip " + (S.adzan ? "chip-solid" : "chip-grey"); }
      toast(S.adzan ? "Pengingat adzan diaktifkan." : "Pengingat adzan dimatikan.");
      tick();
    }
    if (el.closest("#homeSearch") && el.tagName === "SELECT") runHomeSearch($("#homeSearch"));
    if (el.name === "spot" && el.closest("#addStop")) { const sp = spots().find((s) => s.key === el.value); if (sp) el.form.jenis.value = sp.jenis; }
  });
  document.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.id === "homeSearch") return runHomeSearch(f);
    if (f.id === "addStop") {
      const sp = spots().find((s) => s.key === f.spot.value);
      const start = toMin(f.mulai.value), day = Number(f.hari.value);
      const clash = S.plan.find((s) => s.hari === day && start < toMin(s.selesai) && start + Number(f.durasi.value) > toMin(s.mulai));
      const hadDay = S.plan.some((s) => s.hari === day);
      flashId = "s" + Date.now();
      S.plan.push({ id: flashId, hari: day, mulai: hhmm(start), selesai: hhmm(start + Number(f.durasi.value)), jenis: f.jenis.value || sp.jenis, judul: sp.nama, sub: sp.sub, tag: sp.tag, catatan: f.catatan.value.trim(), lat: sp.lat, lng: sp.lng });
      savePlan(); f.catatan.value = "";
      if (hadDay && (dayFilter === 0 || dayFilter === day)) drawPlan(); else { dayFilter = 0; route(); }
      const td = today("kota-jambi");
      const hitPrayer = PRAYERS.filter((p) => p !== "terbit").find((p) => td.times[p] >= start && td.times[p] < start + Number(f.durasi.value));
      return toast(`${sp.nama} ditambahkan ke Hari ${day}.` + (clash ? ` Bertabrakan dengan “${clash.judul}”.` : "") + (hitPrayer ? ` Waktu ${t("p." + hitPrayer)} (${hhmm(td.times[hitPrayer])}) jatuh di tengah kunjungan.` : ""));
    }
    if (f.id === "mitraForm") {
      const fd = Object.fromEntries(new FormData(f));
      const btn = $("button[type=submit]", f);
      const ringkas = `Pendaftaran Mitra UMKM SobatMusafir\nUsaha: ${fd.usaha}\nPemilik: ${fd.nama}\nWhatsApp: ${fd.wa}\nJenis: ${fd.jenis}\nWilayah: ${fd.wil}\nSertifikat halal: ${fd.sert || "-"}`;
      btn.disabled = true; btn.innerHTML = `${ic("clock")}Mengirim…`;
      (DB.ready ? DB.submitMitra(fd) : Promise.reject(new Error("Koneksi database belum dikonfigurasi"))).then(() => {
        f.reset();
        openModal(`<span class="brand-mark">${ic("check")}</span><h2 id="modalTitle" style="margin-top:12px">Pendaftaran terkirim</h2>
          <p class="muted" style="margin-top:8px">Terima kasih, <b>${esc(fd.nama)}</b>. Data <b>${esc(fd.usaha)}</b> sudah masuk ke database SobatMusafir dan akan ditinjau tim. Kami akan menghubungi lewat WhatsApp ${esc(fd.wa)}.</p>`);
      }).catch((err) => {
        openModal(`<span class="brand-mark">${ic("info")}</span><h2 id="modalTitle" style="margin-top:12px">Belum terkirim</h2>
          <p class="muted" style="margin:8px 0 14px">${esc(DB.pesan(err))} Coba lagi nanti, atau salin ringkasan berikut dan kirimkan lewat kanal resmi SobatMusafir.</p>
          <textarea class="textarea" readonly rows="7" onclick="this.select()">${esc(ringkas)}</textarea>`);
      }).finally(() => { btn.disabled = false; btn.innerHTML = `${ic("check")}Kirim Pendaftaran`; });
      return;
    }
    if (f.id === "authForm") {
      const mode = f.dataset.mode, email = f.email.value.trim(), pw = f.pw ? f.pw.value : "";
      const msg = $("#authMsg"), btn = $("button[type=submit]", f);
      const say = (txt, good) => { msg.hidden = false; msg.className = "chip " + (good ? "chip-solid" : "chip-amber"); msg.textContent = txt; replay(msg, "pop"); };
      btn.disabled = true;
      const job = mode === "daftar" ? DB.signUp(email, pw) : mode === "lupa" ? DB.resetPassword(email) : mode === "baru" ? DB.updatePassword(pw) : DB.signIn(email, pw);
      job.then((r) => {
        if (mode === "daftar" && r.needsConfirm) say("Akun dibuat. Cek email Anda dan klik tautan konfirmasi, lalu masuk.", true);
        else if (mode === "lupa") say("Tautan atur ulang kata sandi sudah dikirim ke email Anda.", true);
        else if (mode === "baru") { closeModal(); toast("Kata sandi baru tersimpan."); }
        else { closeModal(); toast("Berhasil masuk. Favorit & itinerary kini tersimpan di akun Anda."); }
      }).catch((err) => say(DB.pesan(err), false)).finally(() => { btn.disabled = false; });
      return;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!$("#modal").hidden) closeModal(); closeMenu(); }
    if (!$("#modal").hidden && $("#lb") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); lbStep(e.key === "ArrowRight" ? 1 : -1); }
  });

  /* =========================================================
     ANIMASI — semua pergerakan di situs
     (otomatis nonaktif jika pengguna memilih "kurangi gerakan")
     ========================================================= */
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const motionOK = () => !RM.matches;
  function replay(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  const pop = (el) => replay(el, "pop");

  /* Muncul saat di-scroll (fade + naik, berurutan per grup) */
  const REVEAL = ".sec-head,.card,.panel,.promo,.promo-item,.pw,.next-hero,.sched-row,.stop,.fact,.detail-hero,.cert-card,.map-card,.quick a,details.faq,.empty,.side-card,.page-head > *,.center > *,.prose > *,.toolbar,.gallery figure,.notify";
  const revealIO = "IntersectionObserver" in window ? new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }) : null;
  function reveal(root = app) {
    const groups = new Map();
    $$(REVEAL, root).forEach((el) => {
      if (el.classList.contains("reveal") || el.closest("[data-l=sched],[data-l=times],.modal,.lb")) return;
      const parent = el.parentElement, i = groups.get(parent) || 0;
      groups.set(parent, i + 1);
      el.style.setProperty("--d", Math.min(i, 8) * 70 + "ms");
      el.classList.add("reveal");
      if (revealIO && motionOK()) revealIO.observe(el); else el.classList.add("in");
    });
  }
  let moQueued = false;
  new MutationObserver(() => {
    if (moQueued) return; moQueued = true;
    requestAnimationFrame(() => { moQueued = false; reveal(app); countUps(app); checkImages(app); });
  }).observe(app, { childList: true, subtree: true });

  /* Angka menghitung naik */
  function countTo(el, to, dec = 0, suffix = "") {
    const fmt = (v) => Number(v).toLocaleString("id-ID", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    if (!motionOK()) { el.textContent = fmt(to); return; }
    const from = Number(el.dataset.cur || 0), t0 = performance.now(), T = 900;
    el.dataset.cur = to;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / T), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const countIO = "IntersectionObserver" in window ? new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (!en.isIntersecting) return; const el = en.target; countIO.unobserve(el); countTo(el, Number(el.dataset.count), Number(el.dataset.dec || 0), el.dataset.suffix || ""); });
  }, { threshold: 0.4 }) : null;
  function countUps(root) {
    $$("[data-count]:not([data-counted])", root).forEach((el) => { el.dataset.counted = "1"; if (countIO) countIO.observe(el); else countTo(el, Number(el.dataset.count), Number(el.dataset.dec || 0), el.dataset.suffix || ""); });
  }

  /* Indikator tab yang meluncur */
  const tabMemo = {};
  function placeTabs(tabs) {
    if (!tabs) return;
    let ind = $(".tab-ind", tabs);
    if (!ind) { ind = document.createElement("span"); ind.className = "tab-ind"; tabs.prepend(ind); }
    const sel = $("[aria-selected=true]", tabs); if (!sel) return;
    const key = tabs.getAttribute("aria-label") || tabs.id || "tabs";
    const to = { x: sel.offsetLeft, w: sel.offsetWidth, y: sel.offsetTop, h: sel.offsetHeight };
    const from = tabMemo[key];
    const set = (r) => { ind.style.transform = `translate(${r.x}px, ${r.y}px)`; ind.style.width = r.w + "px"; ind.style.height = r.h + "px"; };
    if (from && motionOK()) { ind.style.transition = "none"; set(from); void ind.offsetWidth; ind.style.transition = ""; }
    requestAnimationFrame(() => set(to));
    tabMemo[key] = to;
  }

  /* Gambar: fade-in saat termuat, ganti ilustrasi jika file tidak ada */
  function imgLoaded(im) { im.classList.add("loaded"); im.closest(".media")?.classList.remove("skel"); }
  function imgFailed(im) {
    const box = im.closest(".media"); if (!box || box.dataset.failed) return;
    box.dataset.failed = "1";
    if (im.dataset.ph === "none") { box.remove(); return; }
    box.classList.remove("skel");
    box.innerHTML = `<span class="ph ph-in">${scene(im.dataset.ph)}</span>`;
  }
  document.addEventListener("load", (e) => { if (e.target.classList?.contains("media-img")) imgLoaded(e.target); }, true);
  document.addEventListener("error", (e) => { if (e.target.tagName === "IMG" && e.target.dataset.ph) imgFailed(e.target); }, true);
  function checkImages(root) {
    $$("img.media-img:not(.loaded)", root).forEach((im) => { if (im.complete) (im.naturalWidth ? imgLoaded : imgFailed)(im); });
  }

  /* Kompas: jarum berayun dari Utara ke arah kiblat */
  function initCompass(root) {
    const n = $("#needle", root); if (!n || n.dataset.init) return;
    n.dataset.init = "1";
    setTimeout(() => { n.style.transform = `rotate(${n.dataset.deg}deg)`; }, motionOK() ? 450 : 0);
  }

  function afterPaint(root) {
    reveal(root); countUps(root); checkImages(root); initCompass(root);
    $$(".tabs", root).forEach(placeTabs);
  }

  /* Ganti tema: lingkaran membesar dari tombol */
  function setTheme(next, x, y) {
    const html = document.documentElement;
    const apply = () => { html.dataset.theme = next; };
    if (document.startViewTransition && motionOK()) {
      html.style.setProperty("--cx", x + "px"); html.style.setProperty("--cy", y + "px");
      html.classList.add("vt-theme");
      document.startViewTransition(apply).finished.finally(() => html.classList.remove("vt-theme"));
    } else {
      html.classList.add("theme-fade"); apply();
      setTimeout(() => html.classList.remove("theme-fade"), 500);
    }
  }

  /* Lightbox galeri (geser / tombol / panah keyboard) */
  function openLightbox(kind, id, idx) {
    const src = kind === "masjid" ? D.masjid.find((m) => m.id === id) : D.wisata.find((w) => w.id === id);
    if (!src || !src.galeri) return;
    openModal(`<h2 id="modalTitle">${esc(src.nama)}</h2>
      <div class="lb" id="lb" tabindex="0" aria-label="Galeri">${src.galeri.map((g) => `<figure class="lb-slide"><span class="lb-frame">${media(g, { alt: g.label, eager: true })}</span><figcaption>${esc(g.label)}</figcaption></figure>`).join("")}</div>
      <div class="lb-nav"><button class="icon-btn" type="button" data-act="lb-prev" aria-label="Foto sebelumnya">${ic("back")}</button><span class="small muted" id="lbCount"></span><button class="icon-btn" type="button" data-act="lb-next" aria-label="Foto berikutnya">${ic("arrow")}</button></div>`, true);
    const lb = $("#lb");
    lb.addEventListener("scroll", lbCount, { passive: true });
    requestAnimationFrame(() => { lb.scrollTo({ left: lb.clientWidth * idx, behavior: "instant" }); lbCount(); checkImages(lb); });
  }
  function lbCount() { const lb = $("#lb"); if (!lb) return; const i = Math.round(lb.scrollLeft / lb.clientWidth); $("#lbCount").textContent = `${i + 1} / ${lb.children.length}`; }
  function lbStep(dir) {
    const lb = $("#lb"); if (!lb) return;
    const n = lb.children.length, i = Math.round(lb.scrollLeft / lb.clientWidth);
    lb.scrollTo({ left: lb.clientWidth * ((i + dir + n) % n), behavior: motionOK() ? "smooth" : "auto" });
  }

  /* Efek riak (ripple) saat tombol ditekan */
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".btn,.filter,.tab,.icon-btn,.toggle-chip,.quick a,.gm");
    if (!b || !motionOK()) return;
    const r = b.getBoundingClientRect(), sz = Math.max(r.width, r.height) * 2;
    const sp = document.createElement("span");
    sp.className = "ripple";
    sp.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px`;
    b.appendChild(sp);
    sp.addEventListener("animationend", () => sp.remove());
  });

  /* Scroll: progress bar, header sembunyi/muncul, tombol ke atas, parallax hero */
  let lastY = scrollY, scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    $("#progress").style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    const tb = $("#topbar");
    tb.classList.toggle("scrolled", y > 8);
    const busy = $("#mainnav").classList.contains("open") || !$("#modal").hidden;
    if (y > lastY + 6 && y > 320 && !busy) tb.classList.add("hide");
    else if (y < lastY - 6 || y < 320) tb.classList.remove("hide");
    lastY = y;
    $("#toTop").classList.toggle("show", y > 700);
    const art = $("#heroArt");
    if (art && motionOK() && y < 1100) art.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(${1 + y * 0.00025})`;
  }
  addEventListener("scroll", () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", () => $$(".tabs", app).forEach(placeTabs));

  /* =========================================================
     DATABASE (Supabase) — konten live, akun, sinkronisasi
     ========================================================= */
  const dbState = { mode: "lokal", sync: "" };
  function setDbStatus(mode, err) {
    dbState.mode = mode;
    const el = $("#dbStatus"); if (!el) return;
    const txt = { memuat: "Menghubungkan ke database…", live: "Data langsung dari database Supabase", cache: "Menampilkan data tersimpan terakhir (offline)", lokal: "Mode offline: memakai data bawaan" }[mode];
    el.innerHTML = `<span class="dot ${mode === "live" ? "" : "off"}"></span> ${txt}${dbState.sync ? ` • ${esc(dbState.sync)}` : ""}`;
    el.title = err ? DB.pesan(err) : "";
  }
  function setSync(state, err) {
    dbState.sync = { menyimpan: "menyinkronkan…", tersimpan: "tersinkron ke akun", gagal: "sinkron gagal" }[state] || "";
    setDbStatus(dbState.mode, err);
  }
  const snapshot = () => JSON.stringify([D.wilayah, D.wisata, D.tempat, D.masjid, D.hotel, D.itinerary, D.hero]);
  async function syncContent() {
    if (!DB.ready) { setDbStatus(cache ? "cache" : "lokal"); return; }
    setDbStatus("memuat");
    try {
      const before = snapshot();
      const fresh = await DB.loadContent();
      Object.assign(D, fresh);
      store.set("cache", { at: Date.now(), data: fresh });
      if (!store.get("plan", null) && !S.user) S.plan = structuredClone(D.itinerary);
      setDbStatus("live");
      if (snapshot() !== before) route({ quiet: true });
    } catch (e) {
      setDbStatus(cache ? "cache" : "lokal", e);
    }
  }

  function renderAuthBtn() {
    const b = $("#loginBtn"); if (!b) return;
    const label = S.user ? (S.user.email || "Akun").split("@")[0] : t("nav.login");
    b.innerHTML = `${ic(S.user ? "users" : "login")}<span>${esc(label.length > 14 ? label.slice(0, 13) + "…" : label)}</span>`;
    b.setAttribute("aria-label", S.user ? "Akun saya" : t("nav.login"));
  }
  async function onLogin(user) {
    S.user = user; renderAuthBtn();
    try {
      const [remoteFavs, remotePlan] = await Promise.all([DB.getFavs(), DB.getPlan()]);
      const localOnly = S.favs.filter((id) => !remoteFavs.includes(id));
      await Promise.all(localOnly.map((id) => DB.addFav(id).catch(() => null)));
      S.favs = [...new Set([...remoteFavs, ...S.favs])]; store.set("favs", S.favs);
      if (remotePlan && remotePlan.length) { S.plan = remotePlan; store.set("plan", S.plan); }
      else await DB.savePlan(user.id, S.plan);
      setSync("tersimpan");
      route({ quiet: true });
    } catch (e) { setSync("gagal", e); }
  }
  function openAuth(tab) {
    if (tab === "akun" && S.user) {
      return openModal(`<span class="brand-mark">${ic("users")}</span><h2 id="modalTitle" style="margin-top:12px">Akun saya</h2>
        <div class="kv"><div><span>Email</span><b>${esc(S.user.email || "-")}</b></div><div><span>Favorit tersimpan</span><b>${S.favs.length} tempat</b></div><div><span>Titik itinerary</span><b>${S.plan.length} titik</b></div></div>
        <p class="small muted" style="margin-top:12px">Favorit dan itinerary otomatis tersinkron ke database dan bisa dibuka dari perangkat lain setelah masuk.</p>
        <div class="chips" style="margin-top:16px"><a class="btn btn-soft" href="#rencana" data-close>${ic("route")}Buka Itinerary</a><button class="btn btn-ghost" type="button" data-act="logout">${ic("login")}Keluar</button></div>`);
    }
    const mode = ["masuk", "daftar", "lupa"].includes(tab) ? tab : "masuk";
    const title = { masuk: `${t("nav.login")} ke SobatMusafir`, daftar: "Buat akun SobatMusafir", lupa: "Atur ulang kata sandi" }[mode];
    openModal(`<h2 id="modalTitle">${title}</h2><p class="muted" style="margin:6px 0 14px">Simpan itinerary & favorit di akun Anda agar bisa dibuka dari perangkat mana pun.</p>
      ${mode !== "lupa" ? `<div class="tabs" role="tablist" aria-label="Akun" style="margin-bottom:14px"><button class="tab" role="tab" type="button" data-authtab="masuk" aria-selected="${mode === "masuk"}">Masuk</button><button class="tab" role="tab" type="button" data-authtab="daftar" aria-selected="${mode === "daftar"}">Daftar</button></div>` : ""}
      <form class="form" id="authForm" data-mode="${mode}">
        <label>Email<input class="input plain" type="email" name="email" required autocomplete="email"></label>
        ${mode !== "lupa" ? `<label>Kata Sandi<input class="input plain" type="password" name="pw" required minlength="6" autocomplete="${mode === "daftar" ? "new-password" : "current-password"}"></label>` : ""}
        <button class="btn btn-primary" type="submit">${ic(mode === "lupa" ? "bell" : "login")}${{ masuk: t("nav.login"), daftar: "Daftar", lupa: "Kirim tautan" }[mode]}</button>
        <p id="authMsg" class="chip" hidden></p>
        ${mode === "masuk" ? `<button class="link" type="button" data-authtab="lupa">Lupa kata sandi?</button>` : mode === "lupa" ? `<button class="link" type="button" data-authtab="masuk">${ic("back")}Kembali ke Masuk</button>` : ""}
        ${DB.ready ? "" : `<p class="small muted">Koneksi database belum tersedia di tampilan ini.</p>`}
      </form>`);
    $$(".tabs", $("#modalBody")).forEach(placeTabs);
    setTimeout(() => $("#authForm input")?.focus(), 60);
  }
  async function initAuth() {
    if (!DB.ready) return;
    DB.onAuth((event, user) => {
      if (event === "SIGNED_IN" && user && (!S.user || S.user.id !== user.id)) onLogin(user);
      if (event === "SIGNED_OUT") { S.user = null; renderAuthBtn(); setSync(""); }
      if (event === "PASSWORD_RECOVERY") openModal(`<h2 id="modalTitle">Buat kata sandi baru</h2><p class="muted" style="margin:6px 0 14px">Masukkan kata sandi baru untuk akun Anda.</p>
        <form class="form" id="authForm" data-mode="baru"><label>Kata Sandi Baru<input class="input plain" type="password" name="pw" required minlength="6" autocomplete="new-password"></label>
        <input type="hidden" name="email" value=""><button class="btn btn-primary" type="submit">${ic("check")}Simpan Kata Sandi</button><p id="authMsg" class="chip" hidden></p></form>`);
    });
    try { const u = await DB.getUser(); if (u && !S.user) onLogin(u); } catch { /* abaikan */ }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act=logout]"); if (!b) return;
    DB.signOut().then(() => { closeModal(); toast("Anda sudah keluar. Data tetap tersimpan di perangkat ini."); });
  });

  /* ---------- Mulai ---------- */
  if (S.theme) document.documentElement.dataset.theme = S.theme;
  $("#year").textContent = nowWIB().y;
  applyI18n();
  window.addEventListener("hashchange", route);
  route();
  setInterval(tick, 1000);
  renderAuthBtn();
  syncContent();
  initAuth();
}

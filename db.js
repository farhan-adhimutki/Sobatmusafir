/* =========================================================
   SobatMusafir Jambi — db.js
   Lapisan data Supabase: baca konten, favorit & itinerary per pengguna,
   kirim pendaftaran mitra. (Autentikasi ada di folder auth/.)
   Jika Supabase tidak terjangkau, website tetap jalan memakai data.js.
   ========================================================= */
window.SM_DB = (() => {
  // Satu klien Supabase untuk seluruh situs, dibuat di auth/supabase-client.js
  const sb = window.SM_SB || null;

  const timeout = (p, ms = 8000) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("Koneksi ke database terlalu lama")), ms))]);
  const need = () => { if (!sb) throw new Error("Koneksi database belum dikonfigurasi"); return sb; };
  const ok = (r) => { if (r.error) throw r.error; return r.data; };
  const num = (v) => (v == null ? undefined : Number(v));
  const nn = (v) => (v == null ? undefined : v);

  /* ---------- Konten (bentuknya disamakan dengan data.js) ---------- */
  async function loadContent() {
    const db = need();
    const all = (t) => db.from(t).select("*").order("urutan", { ascending: true });
    const res = await timeout(Promise.all([
      all("wilayah"), all("wisata"), all("tempat"), all("menu"), all("wisata_tempat"),
      all("masjid"), all("hotel"), all("itinerary_contoh"), db.from("pengaturan").select("*")
    ]));
    const [wilayah, wisata, tempat, menu, relasi, masjid, hotel, itin, atur] = res.map(ok);
    const menuOf = (id) => menu.filter((m) => m.tempat_id === id).map((m) => ({ nama: m.nama, kat: m.kat, harga: Number(m.harga), rating: Number(m.rating || 0), teks: m.teks || "", img: nn(m.img), ph: m.ph }));
    return {
      wilayah: wilayah.map((w) => ({ id: w.id, nama: w.nama, lat: w.lat, lng: w.lng })),
      wisata: wisata.map((w) => ({
        id: w.id, nama: w.nama, kategori: w.kategori || "", tipe: w.tipe || "", wilayah: w.wilayah_id, lokasi: w.lokasi || "", alamat: w.alamat || "",
        rating: num(w.rating) ?? 0, ulasan: w.ulasan || "0", lat: w.lat, lng: w.lng, img: nn(w.img), banner: nn(w.banner), ph: w.ph,
        ringkas: w.ringkas || "", deskripsi: w.deskripsi || w.ringkas || "", jam: w.jam || "", tiket: w.tiket || "", linkMasjid: nn(w.link_masjid),
        musholla: w.musholla || { status: "Belum diisi", teks: "", tag: [] }, wudhu: w.wudhu || { status: "Belum diisi", teks: "", tag: [] },
        galeri: Array.isArray(w.galeri) && w.galeri.length ? w.galeri : undefined,
        umkm: relasi.filter((r) => r.wisata_id === w.id).map((r) => r.tempat_id)
      })),
      tempat: tempat.map((p) => {
        const m = menuOf(p.id);
        return {
          id: p.id, nama: p.nama, judul: nn(p.judul), tipe: p.tipe, label: p.label || "", wilayah: p.wilayah_id, area: p.area || "", alamat: p.alamat || "",
          lat: p.lat, lng: p.lng, rating: num(p.rating) ?? 0, ulasan: p.ulasan || "0", jam: p.jam || "", harga: p.harga || "-", badge: p.badge || "",
          halal: !!p.halal, musholla: !!p.musholla, dekatMasjid: nn(p.dekat_masjid), fasilitasSingkat: nn(p.fasilitas_singkat), sertifikat: nn(p.sertifikat),
          img: nn(p.img), banner: nn(p.banner), ph: p.ph, unggulan: !!p.unggulan, cta: nn(p.cta), ringkas: nn(p.ringkas),
          fasilitas: Array.isArray(p.fasilitas) && p.fasilitas.length ? p.fasilitas : undefined, menu: m.length ? m : undefined
        };
      }),
      masjid: masjid.map((m) => ({
        id: m.id, nama: m.nama, jenis: m.jenis || "", alamat: m.alamat || "", lat: m.lat, lng: m.lng, rating: num(m.rating) ?? 0,
        tag: m.tag || [], fas: m.fas || [], skor: num(m.skor), teks: nn(m.teks), img: nn(m.img), ph: m.ph, galeri: Array.isArray(m.galeri) ? m.galeri : []
      })),
      hotel: hotel.map((h) => ({
        id: h.id, nama: h.nama, area: h.area || "", wilayah: h.wilayah_id, badge: h.badge || "", rating: num(h.rating) ?? 0, ulasan: h.ulasan ?? 0,
        harga: Number(h.harga || 0), tag: h.tag || [], fas: h.fas || [], lat: h.lat, lng: h.lng, img: nn(h.img), ph: h.ph
      })),
      itinerary: itin.map((s) => ({
        id: s.id, hari: s.hari, mulai: s.mulai, selesai: s.selesai, jenis: s.jenis, judul: s.judul, sub: s.sub || "", tag: s.tag || [],
        catatan: s.catatan || "", lat: s.lat, lng: s.lng, selesaiDikunjungi: !!s.selesai_dikunjungi
      })),
      hero: (atur.find((a) => a.kunci === "hero") || {}).nilai
    };
  }

  /* ---------- Favorit ---------- */
  async function getFavs() { return ok(await timeout(need().from("favorit").select("tempat_id"))).map((r) => r.tempat_id); }
  async function addFav(tempatId) { const r = await timeout(need().from("favorit").upsert({ tempat_id: tempatId }, { onConflict: "user_id,tempat_id", ignoreDuplicates: true })); if (r.error) throw r.error; }
  async function delFav(tempatId) { const r = await timeout(need().from("favorit").delete().eq("tempat_id", tempatId)); if (r.error) throw r.error; }

  /* ---------- Itinerary ---------- */
  async function getPlan() { const d = ok(await timeout(need().from("rencana_pengguna").select("stops, updated_at").maybeSingle())); return d ? d.stops : null; }
  async function savePlan(userId, stops) {
    const r = await timeout(need().from("rencana_pengguna").upsert({ user_id: userId, stops, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
    if (r.error) throw r.error;
  }

  /* ---------- Pendaftaran mitra ---------- */
  async function submitMitra(f) {
    const row = { usaha: f.usaha, nama: f.nama, wa: f.wa, jenis: f.jenis || null, wilayah: f.wil || null, sertifikat: f.sert || null };
    const r = await timeout(need().from("pendaftaran_mitra").insert(row));
    if (r.error) throw r.error;
  }

  /* Pesan error yang mudah dipahami */
  function pesan(e) {
    const m = String((e && (e.message || e.error_description)) || e || "");
    if (/Invalid login credentials/i.test(m)) return "Email atau kata sandi salah.";
    if (/Email not confirmed/i.test(m)) return "Email belum dikonfirmasi. Cek kotak masuk (atau folder spam) Anda.";
    if (/User already registered/i.test(m)) return "Email ini sudah terdaftar. Silakan masuk.";
    if (/Password should be at least/i.test(m)) return "Kata sandi minimal 6 karakter.";
    if (/rate limit/i.test(m)) return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
    if (/Failed to fetch|NetworkError|Load failed|terlalu lama|fetch/i.test(m)) return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    if (/violates check constraint/i.test(m)) return "Ada isian yang formatnya tidak sesuai (mis. nomor WhatsApp).";
    return m || "Terjadi kesalahan.";
  }

  return { ready: !!sb, loadContent, getFavs, addFav, delFav, getPlan, savePlan, submitMitra, pesan };
})();

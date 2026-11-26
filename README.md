# SobatMusafir Jambi

Portal wisata ramah Muslim untuk Provinsi Jambi: destinasi, kuliner halal & UMKM, musholla & masjid, jadwal sholat & arah kiblat, hotel syariah, dan perencana itinerary.

Website statis (HTML + CSS + JavaScript) tanpa build tool, dengan database **Supabase** (project `sobatmusafir`, region Singapura).

## Struktur

```
index.html   kerangka halaman (header, footer, menu)
style.css    seluruh tampilan, mode gelap, responsif, animasi
script.js    navigasi halaman, jadwal sholat & kiblat, filter, itinerary, animasi
config.js    URL + publishable key Supabase (aman untuk browser)
db.js        koneksi database: konten, akun, favorit, itinerary, pendaftaran mitra
data.js      data cadangan offline (dipakai bila Supabase tidak terjangkau)
vendor/      supabase-js v2.119.0 (disimpan lokal)
supabase/    migrasi SQL: skema, isi konten, hak akses
img/         semua gambar, dipisah per jenis
```

## Database (Supabase)

| Tabel | Isi | Akses dari website |
|---|---|---|
| `wilayah` | 11 kabupaten/kota + koordinat (untuk jadwal sholat & kiblat) | baca publik |
| `wisata` | destinasi, fasilitas musholla/wudhu (jsonb), galeri (jsonb) | baca publik |
| `tempat` | kuliner, kafe, UMKM | baca publik |
| `menu` | menu per tempat | baca publik |
| `wisata_tempat` | relasi destinasi ↔ kuliner/UMKM sekitar | baca publik |
| `masjid` | masjid & musholla + galeri | baca publik |
| `hotel` | hotel syariah | baca publik |
| `itinerary_contoh` | itinerary bawaan "Jambi Heritage" | baca publik |
| `pengaturan` | pengaturan situs (mis. foto hero) | baca publik |
| `favorit` | tempat favorit per akun | hanya pemilik akun |
| `rencana_pengguna` | itinerary per akun | hanya pemilik akun |
| `pendaftaran_mitra` | formulir Daftar Mitra UMKM | hanya kirim (tidak bisa dibaca dari website) |

Semua tabel memakai **Row Level Security**. Mengubah konten hanya bisa lewat Supabase Dashboard → Table Editor.
Pendaftaran mitra yang masuk dilihat di tabel `pendaftaran_mitra` (ubah kolom `status`: baru → diproses → disetujui/ditolak).

Cara kerja: website menampilkan data cache/terakhir dulu, lalu mengambil data terbaru dari Supabase di latar.
Jika database tidak terjangkau (offline), website memakai `data.js`. Status koneksi tampil di footer.

## Autentikasi (Supabase Auth)

| Halaman | Fungsi |
|---|---|
| `#daftar` | Registrasi: nama lengkap, email, kata sandi (min. 12), konfirmasi → email verifikasi |
| `#masuk` | Login email + kata sandi; akun belum terverifikasi ditolak, bisa kirim ulang verifikasi |
| `#lupa-sandi` | Minta tautan reset kata sandi |
| `#reset-sandi` | Buat kata sandi baru (dibuka dari tautan email) |
| `#dashboard` | **Terproteksi** — profil, ganti nama & kata sandi, favorit, keluar |

Modul (folder `auth/`): `supabase-client.js` (konfigurasi), `validasi.js`, `session.js`, `ui.js`,
`register.js`, `login.js`, `recovery.js`, `logout.js`, `dashboard.js`, `nav.js` (tombol akun di header).

Database: `auth.users` (identitas & password ber-hash, dikelola Supabase) + `public.profiles`
(id, nama_lengkap, created_at, updated_at) yang dibuat otomatis oleh trigger `on_auth_user_created`.
RLS: pengguna hanya bisa membaca & mengubah profilnya sendiri; hanya kolom `nama_lengkap` yang boleh diubah.

### Pengaturan wajib di Supabase Dashboard (project `sobatmusafir`)
1. **Authentication → URL Configuration**: isi *Site URL* dengan alamat situs, lalu tambahkan alamat yang sama
   ke *Redirect URLs* (mis. `https://farhan-adhimutki.github.io/Sobatmusafir/**`).
2. **Authentication → Sign In / Providers → Email**: *Confirm email* = ON, *Minimum password length* = **12**.
3. **Authentication → Emails → SMTP Settings**: pasang SMTP sendiri (Brevo/Resend/dll). Tanpa ini Supabase
   hanya mengirim email ke anggota tim project dan dibatasi beberapa email per jam.
4. (Opsional) **Authentication → Rate Limits** untuk menyesuaikan batas percobaan.

## Halaman

Navigasi memakai hash URL: `#beranda`, `#kuliner`, `#tempat-<id>`, `#sholat`, `#kiblat`, `#masjid`, `#masjid-<id>`, `#hotel`, `#wisata-<id>`, `#rencana`, `#tentang`.

## Gambar

Ganti foto pengganti di `img/` dengan foto asli memakai **nama file yang sama**. Jika file tidak ada, situs otomatis menampilkan ilustrasi.

| Jenis bingkai | Rasio | Ukuran file |
|---|---|---|
| Hero beranda (desktop) — `img/hero/beranda.jpg` | 12:5 | 2400 × 1000 px |
| Hero beranda (HP) — `img/hero/beranda-mobile.jpg` | 4:5 | 1080 × 1350 px |
| Banner halaman detail — `*-banner.jpg` | 12:5 | 2400 × 1000 px |
| Kartu (wisata, kuliner, UMKM, masjid, hotel) | 4:3 | 1200 × 900 px |
| Fasilitas musholla & wudhu | 2:1 | 1200 × 600 px |
| Galeri | 4:3 | 1200 × 900 px |
| Menu makanan/minuman — `img/menu/` | 4:3 | 800 × 600 px |

Detail lengkap: `img/UKURAN-GAMBAR.txt`.

## Fitur

- Jadwal sholat dihitung otomatis per kabupaten/kota (kriteria Kemenag: Subuh 20°, Isya 18°, ihtiyath 2 menit), hitung mundur, nada pengingat (Web Audio).
- Arah kiblat & jarak ke Ka'bah, kompas memakai sensor arah di HP.
- Pencarian & filter (wilayah, radius masjid, fasilitas, buka sekarang), favorit.
- Itinerary yang bisa diedit + sisip jeda Dzuhur otomatis, GPS (butuh HTTPS).
- Mode gelap, bahasa ID/EN (menu & judul), animasi (otomatis nonaktif bila pengguna memilih "kurangi gerakan").

## Menjalankan

Buka `index.html` langsung di browser, atau unggah seluruh isi repo ke hosting statis (GitHub Pages, Netlify, Vercel, cPanel).

## Catatan

- Email bawaan Supabase dibatasi beberapa email per jam; untuk banyak pendaftar, pasang SMTP sendiri di Supabase → Authentication → SMTP.
- Jam buka & tiket Gentala Arasy dan Danau Sipin belum diisi di `data.js`.
- Tanpa login, itinerary & favorit tersimpan di browser (localStorage); setelah login tersinkron ke database.

# SobatMusafir Jambi

Portal wisata ramah Muslim untuk Provinsi Jambi: destinasi, kuliner halal & UMKM, musholla & masjid, jadwal sholat & arah kiblat, hotel syariah, dan perencana itinerary.

Website statis murni (HTML + CSS + JavaScript), tanpa build tool dan tanpa backend.

## Struktur

```
index.html   kerangka halaman (header, footer, menu)
style.css    seluruh tampilan, mode gelap, responsif, animasi
script.js    navigasi halaman, jadwal sholat & kiblat, filter, itinerary, animasi
data.js      SEMUA konten (wisata, kuliner, masjid, hotel, itinerary) — edit di sini
img/         semua gambar, dipisah per jenis
```

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

- Login dan formulir kemitraan belum terhubung ke server.
- Jam buka & tiket Gentala Arasy dan Danau Sipin belum diisi di `data.js`.
- Itinerary & favorit tersimpan di browser (localStorage) per perangkat.

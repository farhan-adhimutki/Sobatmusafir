/* =========================================================
   SobatMusafir Jambi — DATA KONTEN
   Ubah / tambah konten di file ini saja; tampilan otomatis ikut.

   GAMBAR — semua ada di folder img/ (lihat img/UKURAN-GAMBAR.txt):
     img/hero/     foto besar beranda        2400 x 1000 (12:5) + versi HP 1080 x 1350 (4:5)
     img/wisata/   kartu 1200 x 900 (4:3), banner 2400 x 1000 (12:5), fasilitas 1200 x 600 (2:1), galeri 1200 x 900
     img/kuliner/  kartu 1200 x 900, banner 2400 x 1000, fasilitas 1200 x 600
     img/umkm/     kartu 1200 x 900, banner 2400 x 1000
     img/menu/     800 x 600 (4:3)
     img/masjid/   1200 x 900 (4:3)
     img/hotel/    1200 x 900 (4:3)
   Ganti file dengan nama yang SAMA. Jika file tidak ada, situs otomatis
   menampilkan ilustrasi pengganti ("ph").

   - jam: "HH:MM-HH:MM" (WIB) → status "Buka/Tutup" dihitung otomatis.
   - lat/lng dipakai untuk jarak, kiblat & tombol Petunjuk Arah.
   ========================================================= */
window.SM_DATA = {
  "wilayah": [
    {
      "id": "kota-jambi",
      "nama": "Kota Jambi",
      "lat": -1.6101,
      "lng": 103.6131
    },
    {
      "id": "muaro-jambi",
      "nama": "Kab. Muaro Jambi",
      "lat": -1.57,
      "lng": 103.52
    },
    {
      "id": "batanghari",
      "nama": "Kab. Batanghari",
      "lat": -1.7,
      "lng": 103.27
    },
    {
      "id": "tanjabbar",
      "nama": "Kab. Tanjung Jabung Barat",
      "lat": -0.82,
      "lng": 103.46
    },
    {
      "id": "tanjabtim",
      "nama": "Kab. Tanjung Jabung Timur",
      "lat": -1.13,
      "lng": 103.82
    },
    {
      "id": "sarolangun",
      "nama": "Kab. Sarolangun",
      "lat": -2.3,
      "lng": 102.7
    },
    {
      "id": "merangin",
      "nama": "Kab. Merangin",
      "lat": -2.08,
      "lng": 102.27
    },
    {
      "id": "bungo",
      "nama": "Kab. Bungo",
      "lat": -1.48,
      "lng": 102.12
    },
    {
      "id": "tebo",
      "nama": "Kab. Tebo",
      "lat": -1.48,
      "lng": 102.43
    },
    {
      "id": "kerinci",
      "nama": "Kab. Kerinci",
      "lat": -1.99,
      "lng": 101.38
    },
    {
      "id": "sungai-penuh",
      "nama": "Kota Sungai Penuh",
      "lat": -2.06,
      "lng": 101.39
    }
  ],
  "wisata": [
    {
      "id": "candi-muaro-jambi",
      "nama": "Kompleks Candi Muaro Jambi",
      "kategori": "Heritage / Cagar Budaya Terbesar",
      "tipe": "Wisata Sejarah & Budaya",
      "wilayah": "muaro-jambi",
      "lokasi": "Muaro Jambi (30 km dari Kota)",
      "alamat": "Desa Muaro Jambi, Kec. Maro Sebo",
      "rating": 4.8,
      "ulasan": "1.240",
      "lat": -1.476,
      "lng": 103.668,
      "img": "img/wisata/candi-muaro-jambi.jpg",
      "ph": "candi",
      "ringkas": "Situs cagar budaya seluas 3.988 hektar dengan fasilitas musholla berwudhu air bersih, persewaan sepeda, dan pemandu lokal berlisensi.",
      "deskripsi": "Kompleks percandian terluas di Asia Tenggara yang membentang di tepian Sungai Batanghari. Menawarkan wisata sejarah yang tenang, jalur sepeda rindang, serta fasilitas ibadah yang bersih untuk keluarga Muslim.",
      "jam": "07:30-17:30",
      "tiket": "Rp 10.000 / orang",
      "musholla": {
        "status": "Tersedia (Bersih & Nyaman)",
        "teks": "Musholla berada di area pintu masuk utama dan dekat kawasan Candi Tinggi. Terawat rutin dengan pencahayaan alami dan sirkulasi udara yang sejuk.",
        "tag": [
          "Kapasitas ± 40 Jamaah",
          "Mukena & Sajadah Bersih"
        ],
        "img": "img/wisata/candi-muaro-jambi-musholla.jpg"
      },
      "wudhu": {
        "status": "Tersedia (Terpisah Pria & Wanita)",
        "teks": "Area wudhu terpisah antara pria dan wanita dengan sekat privasi yang terjaga. Menggunakan air bersih mengalir dan lantai anti-slip yang aman untuk lansia.",
        "tag": [
          "Air Bersih & Mengalir",
          "Ramah Lansia & Kursi"
        ],
        "img": "img/wisata/candi-muaro-jambi-wudhu.jpg"
      },
      "umkm": [
        "pondok-tempoyak",
        "nasi-gemuk-melayu",
        "galeri-batik-oleh"
      ],
      "banner": "img/wisata/candi-muaro-jambi-banner.jpg",
      "galeri": [
        {
          "img": "img/wisata/candi-muaro-jambi-galeri-1.jpg",
          "label": "Candi Tinggi",
          "ph": "candi"
        },
        {
          "img": "img/wisata/candi-muaro-jambi-galeri-2.jpg",
          "label": "Candi Gumpung",
          "ph": "candi"
        },
        {
          "img": "img/wisata/candi-muaro-jambi-galeri-3.jpg",
          "label": "Kanal Kuno Batanghari",
          "ph": "danau"
        },
        {
          "img": "img/wisata/candi-muaro-jambi-galeri-4.jpg",
          "label": "Jalur Sepeda Rindang",
          "ph": "candi"
        }
      ]
    },
    {
      "id": "gentala-arasy",
      "nama": "Jembatan Gentala Arasy",
      "kategori": "Landmark & Islamic Heritage",
      "tipe": "Landmark & Wisata Sungai",
      "wilayah": "kota-jambi",
      "lokasi": "Arab Melayu, Pelayangan",
      "alamat": "Kawasan Jembatan Gentala Arasy, Pelayangan, Kota Jambi",
      "rating": 4.7,
      "ulasan": "980",
      "lat": -1.5845,
      "lng": 103.6205,
      "img": "img/wisata/gentala-arasy.jpg",
      "ph": "sungai",
      "ringkas": "Ikon Kota Jambi melintasi Sungai Batanghari dengan Museum Kebudayaan Islam, menara jam penanda waktu sholat, dan sentra ketek perahu.",
      "deskripsi": "Jembatan pedestrian melintasi Sungai Batanghari menuju menara jam Gentala Arasy di Seberang Kota. Di dalam menara terdapat Museum Kebudayaan Islam, dan di sekitarnya tersedia perahu ketek wisata serta kuliner petang di pelataran sungai.",
      "jam": "",
      "tiket": "",
      "musholla": {
        "status": "Tersedia (Musholla Menara)",
        "teks": "Musholla tersedia di kawasan menara Gentala Arasy dengan akses dari pelataran sungai.",
        "tag": [
          "Mukena Tersedia",
          "Dekat Pelataran Sungai"
        ],
        "img": "img/wisata/gentala-arasy-musholla.jpg"
      },
      "wudhu": {
        "status": "Tersedia",
        "teks": "Area wudhu dengan air mengalir di sekitar musholla menara.",
        "tag": [
          "Air Mengalir"
        ],
        "img": "img/wisata/gentala-arasy-wudhu.jpg"
      },
      "umkm": [
        "galeri-batik-oleh"
      ],
      "banner": "img/wisata/gentala-arasy-banner.jpg"
    },
    {
      "id": "danau-sipin",
      "nama": "Danau Sipin & Wisata Ketek",
      "kategori": "Nature & Waterfront",
      "tipe": "Wisata Alam & Keluarga",
      "wilayah": "kota-jambi",
      "lokasi": "Telanaipura, Jambi Kota",
      "alamat": "Kawasan Danau Sipin, Telanaipura, Kota Jambi",
      "rating": 4.6,
      "ulasan": "760",
      "lat": -1.602,
      "lng": 103.58,
      "img": "img/wisata/danau-sipin.jpg",
      "ph": "danau",
      "ringkas": "Danau alami di jantung kota, terhubung ke sentra pengrajin batik Jambi seberang, track jogging ramah keluarga, serta perahu wisata halal.",
      "deskripsi": "Danau alami di jantung Kota Jambi dengan track jogging ramah keluarga dan perahu wisata. Terhubung ke sentra pengrajin batik Jambi di seberang dan menjadi spot favorit menjelang Maghrib.",
      "jam": "",
      "tiket": "",
      "musholla": {
        "status": "Tersedia di Sekitar Kawasan",
        "teks": "Musholla dapat dijangkau di sekitar kawasan danau dan sentra batik.",
        "tag": [
          "Ramah Keluarga"
        ],
        "img": "img/wisata/danau-sipin-musholla.jpg"
      },
      "wudhu": {
        "status": "Tersedia",
        "teks": "Fasilitas wudhu tersedia di musholla sekitar kawasan.",
        "tag": [
          "Air Mengalir"
        ],
        "img": "img/wisata/danau-sipin-wudhu.jpg"
      },
      "umkm": [
        "batik-sejinjang"
      ],
      "banner": "img/wisata/danau-sipin-banner.jpg"
    },
    {
      "id": "masjid-al-falah-wisata",
      "nama": "Masjid Agung Al-Falah",
      "kategori": "Islamic Architecture",
      "tipe": "Wisata Religi",
      "wilayah": "kota-jambi",
      "lokasi": "Legok, Danau Teluk Jambi",
      "alamat": "Jl. Sultan Thaha No.60, Legok, Telanaipura",
      "rating": 4.9,
      "ulasan": "2.100",
      "lat": -1.5893,
      "lng": 103.614,
      "img": "img/wisata/masjid-al-falah.jpg",
      "ph": "masjid",
      "linkMasjid": "al-falah",
      "ringkas": "Pusat ibadah ikonik tanpa dinding dengan 256 tiang penyangga yang kokoh, angin sejuk alami, dan fasilitas ramah musafir yang buka 24 jam."
    }
  ],
  "tempat": [
    {
      "id": "bu-salma",
      "nama": "RM. Bu Salma",
      "judul": "RM. Bu Salma - Kuliner Tradisional Melayu Jambi",
      "tipe": "resto",
      "label": "Kuliner Tradisional",
      "wilayah": "kota-jambi",
      "area": "Pasar Jambi",
      "alamat": "Jl. Raden Mattaher No. 45, Pasar Jambi",
      "lat": -1.596,
      "lng": 103.615,
      "rating": 4.9,
      "ulasan": "1.2k",
      "jam": "08:00-21:30",
      "harga": "Rp 25k - 65k",
      "badge": "Halal Verified",
      "halal": true,
      "musholla": true,
      "dekatMasjid": "150m ke Masjid Agung Al-Falah",
      "sertifikat": "ID151100048291023",
      "img": "img/kuliner/bu-salma.jpg",
      "ph": "kuliner",
      "unggulan": true,
      "fasilitas": [
        {
          "judul": "Foto Musholla",
          "badge": "Ber-AC & Nyaman",
          "info": "Kapasitas 12 Orang",
          "ph": "musholla",
          "teks": "Ruang sholat bersih, sejuk ber-AC, dilengkapi sajadah empuk, mukena terawat, sarung, serta penunjuk arah kiblat terkalibrasi.",
          "tag": [
            "Sajadah & Mukena",
            "Arah Kiblat Akurat"
          ],
          "img": "img/kuliner/bu-salma-musholla.jpg"
        },
        {
          "judul": "Foto Area Wudhu",
          "badge": "Air Mengalir Bersih",
          "info": "Terpisah Pria & Wanita",
          "ph": "wudhu",
          "teks": "Area wudhu berkeramik anti-slip yang terpisah antara pria dan wanita, dengan kran air mengalir lancar, bersih, dan terawat setiap waktu.",
          "tag": [
            "Terpisah Ikhwan/Akhwat",
            "Lantai Anti-Slip"
          ],
          "img": "img/kuliner/bu-salma-wudhu.jpg"
        }
      ],
      "menu": [
        {
          "nama": "Gulai Tepek Ikan",
          "kat": "utama",
          "harga": 38000,
          "rating": 4.9,
          "teks": "Olahan ikan gabus pipih dengan kuah santan rempah khas kesultanan Jambi.",
          "img": "img/menu/bu-salma-gulai-tepek-ikan.jpg",
          "ph": "kuliner"
        },
        {
          "nama": "Tempoyak Patin",
          "kat": "utama",
          "harga": 45000,
          "rating": 5,
          "teks": "Ikan patin segar Sungai Batanghari dimasak dengan fermentasi durian asli.",
          "img": "img/menu/bu-salma-tempoyak-patin.jpg",
          "ph": "kuliner"
        },
        {
          "nama": "Nasi Minyak Jambi",
          "kat": "utama",
          "harga": 42000,
          "rating": 4.8,
          "teks": "Nasi rempah minyak samin disajikan dengan daging malbi dan acar nanas.",
          "img": "img/menu/bu-salma-nasi-minyak-jambi.jpg",
          "ph": "kuliner"
        },
        {
          "nama": "Kopi Tungkal Liberika",
          "kat": "minum",
          "harga": 18000,
          "rating": 4.9,
          "teks": "Seduhan kopi khas pesisir Kuala Tungkal dengan aroma nangka yang khas.",
          "img": "img/menu/bu-salma-kopi-tungkal-liberika.jpg",
          "ph": "kopi"
        }
      ],
      "banner": "img/kuliner/bu-salma-banner.jpg"
    },
    {
      "id": "nasi-minyak-kebun-jahe",
      "nama": "Nasi Minyak Kebun Jahe",
      "tipe": "resto",
      "label": "Kuliner Melayu & Arab",
      "wilayah": "kota-jambi",
      "area": "Kebun Jahe",
      "alamat": "Jl. Orang Kayo Hitam, Kebun Jahe, Kota Jambi",
      "lat": -1.605,
      "lng": 103.619,
      "rating": 4.8,
      "ulasan": "890",
      "jam": "07:00-21:00",
      "harga": "Rp 20k - 50k",
      "badge": "Halal Verified",
      "halal": true,
      "musholla": true,
      "dekatMasjid": "300m ke Masjid Nurul Huda",
      "img": "img/kuliner/nasi-minyak-kebun-jahe.jpg",
      "ph": "kuliner",
      "unggulan": true,
      "banner": "img/kuliner/nasi-minyak-kebun-jahe-banner.jpg"
    },
    {
      "id": "batik-sejinjang",
      "nama": "Batik Jambi Sejinjang Berkah",
      "tipe": "umkm",
      "label": "UMKM Kerajinan Khas",
      "wilayah": "kota-jambi",
      "area": "Danau Sipin",
      "alamat": "Danau Sipin, Kota Jambi",
      "lat": -1.6,
      "lng": 103.583,
      "rating": 4.9,
      "ulasan": "540",
      "jam": "08:00-17:00",
      "harga": "Mulai Rp 150k",
      "badge": "UMKM Unggulan",
      "halal": false,
      "musholla": true,
      "dekatMasjid": "Musholla Toko & Wudhu Luas",
      "img": "img/umkm/batik-sejinjang.jpg",
      "ph": "batik",
      "unggulan": true,
      "cta": "Kunjungi Gerai",
      "banner": "img/umkm/batik-sejinjang-banner.jpg"
    },
    {
      "id": "kopi-aaa-tangkit",
      "nama": "Kopi AAA & Dodol Tangkit",
      "tipe": "kafe",
      "label": "Oleh-oleh & Kopi Lokal",
      "wilayah": "muaro-jambi",
      "area": "Tangkit Baru",
      "alamat": "Jl. Lintas Timur, Sungai Gelam, Muaro Jambi",
      "lat": -1.65,
      "lng": 103.7,
      "rating": 4.9,
      "ulasan": "415",
      "jam": "07:00-20:00",
      "harga": "Rp 15k - 60k",
      "badge": "P-IRT & Halal MUI",
      "halal": true,
      "musholla": true,
      "dekatMasjid": "Area Parkir Luas & Ramah Bus",
      "img": "img/kuliner/kopi-aaa-tangkit.jpg",
      "ph": "kopi",
      "unggulan": true,
      "cta": "Katalog Produk",
      "banner": "img/kuliner/kopi-aaa-tangkit-banner.jpg"
    },
    {
      "id": "pempek-selamat",
      "nama": "Pempek Selamat Jambi",
      "tipe": "resto",
      "label": "Restoran Melayu",
      "wilayah": "kota-jambi",
      "area": "Sipin",
      "alamat": "Jl. Prof. Dr. Sumantri Brojonegoro, Sipin, Kota Jambi",
      "lat": -1.615,
      "lng": 103.59,
      "rating": 4.7,
      "ulasan": "512",
      "jam": "09:00-21:00",
      "harga": "Rp 15k - 45k",
      "badge": "Halal Verified",
      "halal": true,
      "musholla": false,
      "fasilitasSingkat": "Sertifikat BPJPH",
      "img": "img/kuliner/pempek-selamat.jpg",
      "ph": "kuliner",
      "banner": "img/kuliner/pempek-selamat-banner.jpg"
    },
    {
      "id": "pak-datuk",
      "nama": "Rumah Makan Pak Datuk",
      "tipe": "resto",
      "label": "Restoran Melayu",
      "wilayah": "batanghari",
      "area": "Muara Bulian",
      "alamat": "Jl. Jend. Sudirman, Muara Bulian, Batanghari",
      "lat": -1.701,
      "lng": 103.271,
      "rating": 4.8,
      "ulasan": "198",
      "jam": "09:00-20:00",
      "harga": "Rp 20k - 55k",
      "badge": "Halal Verified",
      "halal": true,
      "musholla": true,
      "img": "img/kuliner/pak-datuk.jpg",
      "ph": "kuliner",
      "banner": "img/kuliner/pak-datuk-banner.jpg"
    },
    {
      "id": "kafe-puncak",
      "nama": "Kafe Puncak Jambi",
      "tipe": "kafe",
      "label": "Kafe & Kopi",
      "wilayah": "kerinci",
      "area": "Kayu Aro",
      "alamat": "Kawasan Kayu Aro, Kerinci, Jambi",
      "lat": -1.76,
      "lng": 101.25,
      "rating": 4.9,
      "ulasan": "274",
      "jam": "08:00-22:00",
      "harga": "Rp 18k - 70k",
      "badge": "Halal Verified",
      "halal": true,
      "musholla": true,
      "img": "img/kuliner/kafe-puncak.jpg",
      "ph": "kopi",
      "banner": "img/kuliner/kafe-puncak-banner.jpg"
    },
    {
      "id": "pondok-tempoyak",
      "nama": "Pondok Tempoyak Mak Cik",
      "tipe": "resto",
      "label": "Restoran Melayu",
      "wilayah": "muaro-jambi",
      "area": "250 m dari Candi Tinggi",
      "alamat": "Kawasan Candi Muaro Jambi",
      "lat": -1.4775,
      "lng": 103.669,
      "rating": 4.9,
      "ulasan": "120",
      "jam": "08:00-17:00",
      "harga": "Rp 25.000 – Rp 45.000",
      "badge": "Halal MUI",
      "halal": true,
      "musholla": false,
      "img": "img/kuliner/pondok-tempoyak.jpg",
      "ph": "kuliner",
      "ringkas": "Spesialis gulai patin tempoyak khas Jambi dan pindang tulang dengan bahan segar terjamin halal.",
      "cta": "Lihat Menu",
      "banner": "img/kuliner/pondok-tempoyak-banner.jpg"
    },
    {
      "id": "nasi-gemuk-melayu",
      "nama": "Warung Nasi Gemuk Melayu",
      "tipe": "resto",
      "label": "Restoran Melayu",
      "wilayah": "muaro-jambi",
      "area": "400 m dari Pintu Utama",
      "alamat": "Kawasan Candi Muaro Jambi",
      "lat": -1.479,
      "lng": 103.665,
      "rating": 4.7,
      "ulasan": "86",
      "jam": "06:30-14:00",
      "harga": "Rp 15.000 – Rp 30.000",
      "badge": "Halal Terverifikasi",
      "halal": true,
      "musholla": false,
      "img": "img/kuliner/nasi-gemuk-melayu.jpg",
      "ph": "kuliner",
      "ringkas": "Sarapan & makan siang keluarga dengan sajian nasi gemuk, teh talua, dan kue tradisional Jambi.",
      "cta": "Lihat Menu",
      "banner": "img/kuliner/nasi-gemuk-melayu-banner.jpg"
    },
    {
      "id": "galeri-batik-oleh",
      "nama": "Galeri Batik & Oleh-Oleh Jambi",
      "tipe": "umkm",
      "label": "UMKM Binaan",
      "wilayah": "muaro-jambi",
      "area": "150 m dari Area Parkir",
      "alamat": "Kawasan Candi Muaro Jambi",
      "lat": -1.477,
      "lng": 103.666,
      "rating": 4.8,
      "ulasan": "64",
      "jam": "08:00-17:00",
      "harga": "Mulai Rp 20.000",
      "badge": "UMKM Binaan",
      "halal": false,
      "musholla": false,
      "img": "img/umkm/galeri-batik-oleh.jpg",
      "ph": "batik",
      "ringkas": "Pusat oleh-oleh khas Jambi: kopi Tungkal, dodol nanas, dan kain batik motif angso duo.",
      "cta": "Kunjungi Toko",
      "banner": "img/umkm/galeri-batik-oleh-banner.jpg"
    }
  ],
  "masjid": [
    {
      "id": "al-falah",
      "nama": "Masjid Agung Al-Falah Jambi",
      "jenis": "Masjid Besar",
      "alamat": "Jl. Sultan Thaha No.60, Legok, Kec. Telanaipura, Kota Jambi, Jambi 36122",
      "lat": -1.5893,
      "lng": 103.614,
      "rating": 4.9,
      "tag": [
        "Sangat Bersih",
        "Air Melimpah",
        "Mukena Tersedia"
      ],
      "fas": [
        "ac",
        "mukena",
        "wudhu",
        "parkir",
        "difabel"
      ],
      "skor": 9.8,
      "img": "img/masjid/al-falah.jpg",
      "ph": "masjid",
      "teks": "Ikon \"Masjid Seribu Tiang\" Jambi yang megah tanpa dinding pembatas, angin alami sejuk dari Sungai Batanghari, serta tempat wudhu luas dan ramah musafir.",
      "galeri": [
        {
          "img": "img/masjid/al-falah.jpg",
          "label": "1. Eksterior",
          "ph": "masjid"
        },
        {
          "img": "img/masjid/al-falah-ruang-sholat.jpg",
          "label": "2. Ruang Sholat",
          "ph": "musholla"
        },
        {
          "img": "img/masjid/al-falah-wudhu.jpg",
          "label": "3. Area Wudhu",
          "ph": "wudhu"
        }
      ]
    },
    {
      "id": "tsamaratul-insan",
      "nama": "Masjid Raya Tsamaratul Insan",
      "jenis": "Masjid Besar",
      "alamat": "Jl. Prof. Dr. Sri Soedewi, Sungai Putri",
      "lat": -1.601,
      "lng": 103.6,
      "rating": 4.8,
      "tag": [
        "Sangat Bersih",
        "Parkir Luas",
        "Ramah Difabel"
      ],
      "fas": [
        "parkir",
        "difabel",
        "wudhu"
      ],
      "img": "img/masjid/tsamaratul-insan.jpg",
      "ph": "masjid",
      "galeri": [
        {
          "img": "img/masjid/tsamaratul-insan.jpg",
          "label": "1. Eksterior",
          "ph": "masjid"
        },
        {
          "img": "img/masjid/tsamaratul-insan-ruang-sholat.jpg",
          "label": "2. Ruang Sholat",
          "ph": "musholla"
        },
        {
          "img": "img/masjid/tsamaratul-insan-wudhu.jpg",
          "label": "3. Area Wudhu",
          "ph": "wudhu"
        }
      ]
    },
    {
      "id": "musholla-gentala",
      "nama": "Musholla Gentala Arasy",
      "jenis": "Musholla Umum",
      "alamat": "Kawasan Jembatan Gentala Arasy, Pelayangan",
      "lat": -1.5845,
      "lng": 103.6205,
      "rating": 4.7,
      "tag": [
        "Air Melimpah",
        "Mukena Tersedia",
        "Wisata Sungai"
      ],
      "fas": [
        "mukena",
        "wudhu"
      ],
      "img": "img/masjid/musholla-gentala.jpg",
      "ph": "musholla",
      "galeri": [
        {
          "img": "img/masjid/musholla-gentala.jpg",
          "label": "1. Eksterior",
          "ph": "masjid"
        },
        {
          "img": "img/masjid/musholla-gentala-ruang-sholat.jpg",
          "label": "2. Ruang Sholat",
          "ph": "musholla"
        },
        {
          "img": "img/masjid/musholla-gentala-wudhu.jpg",
          "label": "3. Area Wudhu",
          "ph": "wudhu"
        }
      ]
    },
    {
      "id": "nurul-huda",
      "nama": "Masjid Nurul Huda Jelutung",
      "jenis": "Masjid Besar",
      "alamat": "Jl. Hayam Wuruk, Kec. Jelutung, Kota Jambi",
      "lat": -1.614,
      "lng": 103.625,
      "rating": 4.8,
      "tag": [
        "Sangat Bersih",
        "Full AC",
        "Mukena Tersedia"
      ],
      "fas": [
        "ac",
        "mukena",
        "wudhu"
      ],
      "img": "img/masjid/nurul-huda.jpg",
      "ph": "masjid",
      "galeri": [
        {
          "img": "img/masjid/nurul-huda.jpg",
          "label": "1. Eksterior",
          "ph": "masjid"
        },
        {
          "img": "img/masjid/nurul-huda-ruang-sholat.jpg",
          "label": "2. Ruang Sholat",
          "ph": "musholla"
        },
        {
          "img": "img/masjid/nurul-huda-wudhu.jpg",
          "label": "3. Area Wudhu",
          "ph": "wudhu"
        }
      ]
    },
    {
      "id": "taman-rimba",
      "nama": "Musholla Taman Rimba",
      "jenis": "Musholla Umum",
      "alamat": "Jl. Kebun Bohok, Taman Rimba, Jambi Selatan",
      "lat": -1.645,
      "lng": 103.6,
      "rating": 4.6,
      "tag": [
        "Air Melimpah",
        "Ramah Difabel",
        "Parkir Luas"
      ],
      "fas": [
        "difabel",
        "parkir",
        "wudhu"
      ],
      "img": "img/masjid/taman-rimba.jpg",
      "ph": "musholla",
      "teks": "Musholla asri di kawasan wisata keluarga Taman Rimba dengan akses jalur landai ramah difabel dan area wudhu terbuka yang bersih.",
      "galeri": [
        {
          "img": "img/masjid/taman-rimba.jpg",
          "label": "1. Eksterior",
          "ph": "masjid"
        },
        {
          "img": "img/masjid/taman-rimba-ruang-sholat.jpg",
          "label": "2. Ruang Sholat",
          "ph": "musholla"
        },
        {
          "img": "img/masjid/taman-rimba-wudhu.jpg",
          "label": "3. Area Wudhu",
          "ph": "wudhu"
        }
      ]
    }
  ],
  "hotel": [
    {
      "id": "jambi-heritage",
      "nama": "Hotel Syariah Jambi Heritage",
      "area": "Telanaipura, Kota Jambi",
      "wilayah": "kota-jambi",
      "badge": "Sertifikat Syariah",
      "rating": 4.9,
      "ulasan": 184,
      "harga": 520000,
      "tag": [
        "Musholla Hotel",
        "Sarapan Halal",
        "Dekat Masjid Agung"
      ],
      "fas": [
        "syariah",
        "musholla",
        "sarapan",
        "masjid"
      ],
      "lat": -1.595,
      "lng": 103.61,
      "img": "img/hotel/jambi-heritage.jpg",
      "ph": "hotel"
    },
    {
      "id": "villa-amanah",
      "nama": "Villa Amanah Muaro Jambi",
      "area": "Kawasan Candi Muaro Jambi",
      "wilayah": "muaro-jambi",
      "badge": "Musholla Privat",
      "rating": 4.8,
      "ulasan": 96,
      "harga": 680000,
      "tag": [
        "Musholla Hotel",
        "Sarapan Halal",
        "Ramah Keluarga"
      ],
      "fas": [
        "musholla",
        "sarapan"
      ],
      "lat": -1.48,
      "lng": 103.66,
      "img": "img/hotel/villa-amanah.jpg",
      "ph": "hotel"
    },
    {
      "id": "baitussalam",
      "nama": "Penginapan Baitussalam Kota Jambi",
      "area": "Pasar Jambi, Kota Jambi",
      "wilayah": "kota-jambi",
      "badge": "Sertifikat Syariah",
      "rating": 4.7,
      "ulasan": 215,
      "harga": 340000,
      "tag": [
        "Dekat Masjid",
        "Musholla Hotel",
        "Dekat Gentala Arasy"
      ],
      "fas": [
        "syariah",
        "musholla",
        "masjid"
      ],
      "lat": -1.59,
      "lng": 103.618,
      "img": "img/hotel/baitussalam.jpg",
      "ph": "hotel"
    },
    {
      "id": "resort-kerinci",
      "nama": "Resort Syariah Kerinci",
      "area": "Kayu Aro, Kerinci, Jambi",
      "wilayah": "kerinci",
      "badge": "Eco-Syariah Resort",
      "rating": 4.9,
      "ulasan": 142,
      "harga": 790000,
      "tag": [
        "Sertifikat Syariah",
        "Sarapan Halal",
        "Musholla Hotel"
      ],
      "fas": [
        "syariah",
        "sarapan",
        "musholla"
      ],
      "lat": -1.76,
      "lng": 101.26,
      "img": "img/hotel/resort-kerinci.jpg",
      "ph": "hotel"
    }
  ],
  "itinerary": [
    {
      "id": "s1",
      "hari": 1,
      "mulai": "08:00",
      "selesai": "09:00",
      "jenis": "kuliner",
      "judul": "Sarapan Nasi Gemuk Kebun Jahe",
      "sub": "Restoran Melayu Halal • Citarasa gurih santan dengan sambal khas Jambi & telur rebus.",
      "tag": [
        "Halal MUI",
        "Ada Musholla"
      ],
      "catatan": "Datang pagi agar tidak kehabisan gulai dori & sambal cabai rawit merah.",
      "lat": -1.605,
      "lng": 103.619,
      "selesaiDikunjungi": true
    },
    {
      "id": "s2",
      "hari": 1,
      "mulai": "09:30",
      "selesai": "11:45",
      "jenis": "wisata",
      "judul": "Kompleks Candi Muaro Jambi",
      "sub": "Eksplorasi Candi Gumpung, Candi Tinggi, dan kanal kuno Batanghari. Tersedia shuttle ramah disabilitas dan lansia.",
      "tag": [
        "Ramah Muslim",
        "Musholla Nyaman",
        "Sewa Sepeda Listrik"
      ],
      "catatan": "",
      "lat": -1.476,
      "lng": 103.668
    },
    {
      "id": "s3",
      "hari": 1,
      "mulai": "12:00",
      "selesai": "13:15",
      "jenis": "sholat",
      "judul": "Sholat Dzuhur Berjamaah di Masjid Agung Al-Falah",
      "sub": "Ikon \"Masjid Seribu Tiang\" Jambi yang megah tanpa dinding pembatas, angin alami sejuk dari Sungai Batanghari, serta tempat wudhu luas.",
      "tag": [
        "Kapasitas 10.000 Jamaah",
        "Tempat Wudhu Luas",
        "Parkir Bus Tersedia"
      ],
      "catatan": "Dianjurkan tiba sebelum adzan untuk mendengarkan tilawah pra-dzuhur.",
      "lat": -1.5893,
      "lng": 103.614
    },
    {
      "id": "s4",
      "hari": 1,
      "mulai": "13:30",
      "selesai": "15:00",
      "jenis": "kuliner",
      "judul": "Makan Siang Gulai Tempoyak RM. Bu Salma",
      "sub": "Kuliner Tradisional Jambi • Ikan patin sungai segar dimasak fermentasi durian asli, dilengkapi sambal bacang dan lalapan pucuk ubi.",
      "tag": [
        "QR Halal Terverifikasi",
        "Ruang Makan Ber-AC"
      ],
      "catatan": "Menu favorit: Tempoyak Ikan Baung & Jus Pinang Muda.",
      "lat": -1.596,
      "lng": 103.615
    },
    {
      "id": "s5",
      "hari": 2,
      "mulai": "16:00",
      "selesai": "18:00",
      "jenis": "wisata",
      "judul": "Sunset & Kuliner Petang di Jembatan Gentala Arasy & Danau Sipin",
      "sub": "Jembatan pedestrian melintasi Sungai Batanghari menuju menara jam Gentala Arasy, lanjut perahu ketek wisata di Danau Sipin menjelang Maghrib.",
      "tag": [
        "Musholla Menara Tersedia",
        "Spot Foto Sunset Ramah Keluarga"
      ],
      "catatan": "Siapkan kacamata hitam dan nikmati jagung bakar madu halal di pelataran sungai.",
      "lat": -1.5845,
      "lng": 103.6205
    }
  ],
  "hero": {
    "desktop": "img/hero/beranda.jpg",
    "mobile": "img/hero/beranda-mobile.jpg"
  }
};

-- SobatMusafir Jambi — skema database
-- Konten (dibaca publik) · data pengguna (per akun) · pendaftaran mitra (hanya kirim)

-- ========== KONTEN ==========
create table public.wilayah (
  id      text primary key,
  nama    text not null,
  lat     double precision not null,
  lng     double precision not null,
  urutan  integer not null default 0
);

create table public.wisata (
  id          text primary key,
  nama        text not null,
  kategori    text,
  tipe        text,
  wilayah_id  text references public.wilayah(id),
  lokasi      text,
  alamat      text,
  rating      numeric(2,1),
  ulasan      text,
  lat         double precision,
  lng         double precision,
  img         text,
  banner      text,
  ph          text not null default 'peta',
  ringkas     text,
  deskripsi   text,
  jam         text check (jam is null or jam = '' or jam ~ '^\d{2}:\d{2}-\d{2}:\d{2}$'),
  tiket       text,
  link_masjid text,
  musholla    jsonb,
  wudhu       jsonb,
  galeri      jsonb not null default '[]'::jsonb,
  urutan      integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table public.tempat (
  id                text primary key,
  nama              text not null,
  judul             text,
  tipe              text not null check (tipe in ('resto', 'kafe', 'umkm')),
  label             text,
  wilayah_id        text references public.wilayah(id),
  area              text,
  alamat            text,
  lat               double precision,
  lng               double precision,
  rating            numeric(2,1),
  ulasan            text,
  jam               text check (jam is null or jam = '' or jam ~ '^\d{2}:\d{2}-\d{2}:\d{2}$'),
  harga             text,
  badge             text,
  halal             boolean not null default false,
  musholla          boolean not null default false,
  dekat_masjid      text,
  fasilitas_singkat text,
  sertifikat        text,
  img               text,
  banner            text,
  ph                text not null default 'kuliner',
  unggulan          boolean not null default false,
  cta               text,
  ringkas           text,
  fasilitas         jsonb,
  urutan            integer not null default 0,
  updated_at        timestamptz not null default now()
);

create table public.menu (
  id         bigint generated always as identity primary key,
  tempat_id  text not null references public.tempat(id) on delete cascade,
  nama       text not null,
  kat        text not null check (kat in ('utama', 'minum')),
  harga      integer not null check (harga >= 0),
  rating     numeric(2,1),
  teks       text,
  img        text,
  ph         text not null default 'kuliner',
  urutan     integer not null default 0
);
create index menu_tempat_idx on public.menu (tempat_id);

create table public.wisata_tempat (
  wisata_id  text not null references public.wisata(id) on delete cascade,
  tempat_id  text not null references public.tempat(id) on delete cascade,
  urutan     integer not null default 0,
  primary key (wisata_id, tempat_id)
);
create index wisata_tempat_tempat_idx on public.wisata_tempat (tempat_id);

create table public.masjid (
  id      text primary key,
  nama    text not null,
  jenis   text,
  alamat  text,
  lat     double precision,
  lng     double precision,
  rating  numeric(2,1),
  tag     text[] not null default '{}',
  fas     text[] not null default '{}',
  skor    numeric(3,1),
  teks    text,
  img     text,
  ph      text not null default 'masjid',
  galeri  jsonb not null default '[]'::jsonb,
  urutan  integer not null default 0
);

create table public.hotel (
  id          text primary key,
  nama        text not null,
  area        text,
  wilayah_id  text references public.wilayah(id),
  badge       text,
  rating      numeric(2,1),
  ulasan      integer,
  harga       integer check (harga >= 0),
  tag         text[] not null default '{}',
  fas         text[] not null default '{}',
  lat         double precision,
  lng         double precision,
  img         text,
  ph          text not null default 'hotel',
  urutan      integer not null default 0
);

create table public.itinerary_contoh (
  id                  text primary key,
  hari                integer not null check (hari between 1 and 14),
  mulai               text not null check (mulai ~ '^\d{2}:\d{2}$'),
  selesai             text not null check (selesai ~ '^\d{2}:\d{2}$'),
  jenis               text not null check (jenis in ('wisata', 'kuliner', 'umkm', 'sholat')),
  judul               text not null,
  sub                 text,
  tag                 text[] not null default '{}',
  catatan             text,
  lat                 double precision,
  lng                 double precision,
  selesai_dikunjungi  boolean not null default false,
  urutan              integer not null default 0
);

create table public.pengaturan (
  kunci  text primary key,
  nilai  jsonb not null
);

create index wisata_wilayah_idx on public.wisata (wilayah_id);
create index tempat_wilayah_idx on public.tempat (wilayah_id);
create index hotel_wilayah_idx on public.hotel (wilayah_id);

-- ========== DATA PENGGUNA (butuh login) ==========
create table public.favorit (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tempat_id  text not null references public.tempat(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tempat_id)
);
create index favorit_tempat_idx on public.favorit (tempat_id);

create table public.rencana_pengguna (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  stops      jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ========== PENDAFTARAN MITRA (formulir publik, hanya bisa kirim) ==========
create table public.pendaftaran_mitra (
  id          bigint generated always as identity primary key,
  usaha       text not null check (char_length(usaha) between 2 and 120),
  nama        text not null check (char_length(nama) between 2 and 120),
  wa          text not null check (wa ~ '^[0-9+ ()-]{6,20}$'),
  jenis       text check (char_length(jenis) <= 60),
  wilayah     text check (char_length(wilayah) <= 60),
  sertifikat  text check (char_length(sertifikat) <= 60),
  status      text not null default 'baru' check (status in ('baru', 'diproses', 'disetujui', 'ditolak')),
  created_at  timestamptz not null default now()
);

-- ========== ROW LEVEL SECURITY ==========
alter table public.wilayah           enable row level security;
alter table public.wisata            enable row level security;
alter table public.tempat            enable row level security;
alter table public.menu              enable row level security;
alter table public.wisata_tempat     enable row level security;
alter table public.masjid            enable row level security;
alter table public.hotel             enable row level security;
alter table public.itinerary_contoh  enable row level security;
alter table public.pengaturan        enable row level security;
alter table public.favorit           enable row level security;
alter table public.rencana_pengguna  enable row level security;
alter table public.pendaftaran_mitra enable row level security;

-- Konten: semua orang boleh membaca; perubahan hanya lewat dashboard Supabase.
create policy "Konten dapat dibaca publik" on public.wilayah          for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.wisata           for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.tempat           for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.menu             for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.wisata_tempat    for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.masjid           for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.hotel            for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.itinerary_contoh for select to anon, authenticated using (true);
create policy "Konten dapat dibaca publik" on public.pengaturan       for select to anon, authenticated using (true);

-- Favorit: hanya pemilik akun.
create policy "Pengguna membaca favoritnya"   on public.favorit for select to authenticated using ((select auth.uid()) = user_id);
create policy "Pengguna menambah favoritnya"  on public.favorit for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Pengguna menghapus favoritnya" on public.favorit for delete to authenticated using ((select auth.uid()) = user_id);

-- Itinerary: hanya pemilik akun.
create policy "Pengguna membaca rencananya"   on public.rencana_pengguna for select to authenticated using ((select auth.uid()) = user_id);
create policy "Pengguna membuat rencananya"   on public.rencana_pengguna for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Pengguna mengubah rencananya"  on public.rencana_pengguna for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Pendaftaran mitra: siapa pun boleh mengirim (data divalidasi constraint), tidak ada yang bisa membaca dari website.
create policy "Publik dapat mengirim pendaftaran" on public.pendaftaran_mitra for insert to anon, authenticated
  with check (status = 'baru');

-- ========== HAK AKSES API ==========
grant select on public.wilayah, public.wisata, public.tempat, public.menu, public.wisata_tempat,
  public.masjid, public.hotel, public.itinerary_contoh, public.pengaturan to anon, authenticated;
grant select, insert, delete on public.favorit to authenticated;
grant select, insert, update on public.rencana_pengguna to authenticated;
grant insert on public.pendaftaran_mitra to anon, authenticated;

-- Cabut hak bawaan, lalu beri hanya yang dibutuhkan website.
revoke all on public.wilayah, public.wisata, public.tempat, public.menu, public.wisata_tempat,
  public.masjid, public.hotel, public.itinerary_contoh, public.pengaturan,
  public.favorit, public.rencana_pengguna, public.pendaftaran_mitra from anon, authenticated;

grant select on public.wilayah, public.wisata, public.tempat, public.menu, public.wisata_tempat,
  public.masjid, public.hotel, public.itinerary_contoh, public.pengaturan to anon, authenticated;
grant select, insert, delete on public.favorit to authenticated;
grant select, insert, update on public.rencana_pengguna to authenticated;
grant insert (usaha, nama, wa, jenis, wilayah, sertifikat) on public.pendaftaran_mitra to anon, authenticated;

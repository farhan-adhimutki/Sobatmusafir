-- SobatMusafir Jambi — profil pengguna untuk Supabase Auth
-- Identitas & kata sandi tetap di auth.users (dikelola Supabase Auth, password di-hash bcrypt).
-- public.profiles hanya menyimpan data tambahan. TIDAK ADA kolom password di sini.

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nama_lengkap  text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_nama_valid check (
    char_length(nama_lengkap) between 2 and 100
    and nama_lengkap = btrim(nama_lengkap)
    and nama_lengkap !~ '[<>"/\\;{}=@#$%^&*_+|~`0-9[:cntrl:]]|\[|\]'
  )
);

comment on table public.profiles is 'Data tambahan pengguna (1 baris per auth.users). Dibuat otomatis oleh trigger on_auth_user_created.';

-- updated_at otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Profil dibuat otomatis setelah registrasi. Nama dibersihkan agar selalu lolos validasi
-- (jika kosong/tidak valid, dipakai bagian depan email, lalu "Pengguna").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pola constant text := '[<>"/\\;{}=@#$%^&*_+|~`0-9[:cntrl:]]|\[|\]';
  nama text;
begin
  nama := regexp_replace(coalesce(new.raw_user_meta_data ->> 'nama_lengkap', ''), pola, '', 'g');
  nama := btrim(regexp_replace(nama, '\s+', ' ', 'g'));
  if char_length(nama) < 2 then
    nama := btrim(regexp_replace(regexp_replace(split_part(coalesce(new.email, ''), '@', 1), pola, ' ', 'g'), '\s+', ' ', 'g'));
    nama := initcap(nama);
  end if;
  if char_length(nama) < 2 then
    nama := 'Pengguna';
  end if;
  nama := btrim(left(nama, 100));

  insert into public.profiles (id, nama_lengkap)
  values (new.id, nama)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fungsi trigger tidak boleh dipanggil langsung lewat API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Profil untuk akun yang sudah ada sebelum migrasi ini
insert into public.profiles (id, nama_lengkap)
select u.id, 'Pengguna' from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- ========== ROW LEVEL SECURITY ==========
alter table public.profiles enable row level security;

create policy "Pengguna membaca profilnya sendiri"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Pengguna mengubah profilnya sendiri"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Tidak ada policy INSERT/DELETE: profil hanya dibuat oleh trigger dan
-- terhapus otomatis (cascade) saat akun auth.users dihapus.

-- ========== HAK AKSES API (minimal) ==========
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (nama_lengkap) on public.profiles to authenticated;

-- ==============================================================================
-- Schema Database NGETEH SKUYY
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ==============================================================================

-- 1. Buat tabel profiles untuk mapping username dan role
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text,
  role text not null check (role in ('superadmin', 'admin', 'kasir', 'staf')) default 'staf',
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Aktifkan Row Level Security (RLS) WAJIB di tabel profiles
alter table public.profiles enable row level security;

-- 3. Kebijakan RLS (Policies)
-- Pengguna dapat melihat data profil mereka sendiri
create policy "Pengguna dapat membaca profil sendiri"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Superadmin dapat membaca seluruh profil
create policy "Superadmin dapat melihat seluruh profil"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Superadmin dapat menambah profil baru
create policy "Superadmin dapat menambahkan profil"
  on public.profiles
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Superadmin dapat memperbarui profil
create policy "Superadmin dapat mengubah profil"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- 4. Fungsi dan trigger otomatis saat akun auth.users dibuat
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'staf'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
  set
    username = excluded.username,
    email = excluded.email,
    role = excluded.role,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pada tabel auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Masukkan data profil Superadmin awal
insert into public.profiles (id, username, email, role, full_name)
values (
  '48faebac-223a-4757-abc2-d4a9d55d47c8',
  'estehadmin',
  'estehadmin@ngeteh-skuyy.internal',
  'superadmin',
  'Superadmin NGETEH SKUYY'
)
on conflict (id) do update
set role = 'superadmin';


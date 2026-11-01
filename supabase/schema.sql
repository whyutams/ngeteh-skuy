-- ==============================================================================
-- Schema Database NGETEH SKUYY (Point of Sale)
-- Penamaan tabel wajib Bahasa Indonesia atau campuran (dilarang full bahasa Inggris)
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABEL profil_pengguna
-- ------------------------------------------------------------------------------
create table if not exists public.profil_pengguna (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text,
  role text not null check (role in ('superadmin', 'karyawan')) default 'karyawan',
  full_name text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profil_pengguna enable row level security;

create policy "Pengguna dapat melihat profil sendiri"
  on public.profil_pengguna for select
  using (auth.uid() = id);

create policy "Superadmin dapat melihat semua profil"
  on public.profil_pengguna for select
  using (
    exists (
      select 1 from public.profil_pengguna
      where id = auth.uid() and role = 'superadmin'
    )
  );

create policy "Superadmin dapat mengelola profil"
  on public.profil_pengguna for all
  using (
    exists (
      select 1 from public.profil_pengguna
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Trigger otomatis saat user dibuat di auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profil_pengguna (id, username, email, role, full_name, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'karyawan'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    true
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. TABEL kategori_menu (Khusus Owner / Superadmin)
-- ------------------------------------------------------------------------------
create table if not exists public.kategori_menu (
  id uuid primary key default gen_random_uuid(),
  nama_kategori text not null,
  urutan integer default 0,
  created_at timestamptz default now()
);

alter table public.kategori_menu enable row level security;

-- Hanya Superadmin yang bisa melihat dan mengelola kategori
create policy "Superadmin dapat melihat kategori_menu"
  on public.kategori_menu for select
  using (
    exists (
      select 1 from public.profil_pengguna
      where id = auth.uid() and role = 'superadmin'
    )
  );

create policy "Superadmin dapat mengelola kategori_menu"
  on public.kategori_menu for all
  using (
    exists (
      select 1 from public.profil_pengguna
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- ------------------------------------------------------------------------------
-- 3. TABEL produk_menu (Menu Minuman & Makanan)
-- ------------------------------------------------------------------------------
create table if not exists public.produk_menu (
  id uuid primary key default gen_random_uuid(),
  kategori_id uuid references public.kategori_menu(id) on delete set null,
  nama_produk text not null,
  harga numeric not null default 0 check (harga >= 0),
  stok integer not null default 0 check (stok >= 0),
  satuan text default 'porsi',
  status_aktif boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.produk_menu enable row level security;

-- Seluruh pengguna login (Superadmin & Karyawan) dapat membaca menu aktif
create policy "Pengguna login dapat melihat produk_menu"
  on public.produk_menu for select
  using (auth.role() = 'authenticated');

-- Hanya Superadmin yang dapat menambah, mengubah, dan menghapus menu
create policy "Superadmin dapat mengelola produk_menu"
  on public.produk_menu for all
  using (
    exists (
      select 1 from public.profil_pengguna
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- ------------------------------------------------------------------------------
-- 4. TABEL riwayat_stok (Catatan Keluar/Masuk Stok)
-- ------------------------------------------------------------------------------
create table if not exists public.riwayat_stok (
  id uuid primary key default gen_random_uuid(),
  produk_id uuid not null references public.produk_menu(id) on delete cascade,
  tipe_mutasi text not null check (tipe_mutasi in ('masuk', 'keluar', 'penyesuaian', 'penjualan')),
  jumlah integer not null,
  stok_sebelum integer not null,
  stok_sesudah integer not null,
  catatan text,
  dibuat_oleh uuid references public.profil_pengguna(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.riwayat_stok enable row level security;

-- Seluruh pengguna login dapat melihat riwayat stok
create policy "Pengguna login dapat melihat riwayat_stok"
  on public.riwayat_stok for select
  using (auth.role() = 'authenticated');

-- Superadmin & kasir transaksi dapat mencatat riwayat stok
create policy "Pengguna login dapat mencatat riwayat_stok"
  on public.riwayat_stok for insert
  with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 5. TABEL transaksi_penjualan (Transaksi Kasir)
-- ------------------------------------------------------------------------------
create table if not exists public.transaksi_penjualan (
  id uuid primary key default gen_random_uuid(),
  nomor_invoice text unique not null,
  total_tagihan numeric not null default 0 check (total_tagihan >= 0),
  metode_pembayaran text not null check (metode_pembayaran in ('tunai', 'qris', 'transfer')),
  uang_diterima numeric default 0,
  uang_kembalian numeric default 0,
  status_transaksi text not null check (status_transaksi in ('selesai', 'dibatalkan')) default 'selesai',
  kasir_id uuid references public.profil_pengguna(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.transaksi_penjualan enable row level security;

create policy "Pengguna login dapat melihat transaksi_penjualan"
  on public.transaksi_penjualan for select
  using (auth.role() = 'authenticated');

create policy "Pengguna login dapat membuat transaksi_penjualan"
  on public.transaksi_penjualan for insert
  with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 6. TABEL item_pembelian (Rincian Produk Tiap Transaksi)
-- ------------------------------------------------------------------------------
create table if not exists public.item_pembelian (
  id uuid primary key default gen_random_uuid(),
  transaksi_id uuid not null references public.transaksi_penjualan(id) on delete cascade,
  produk_id uuid references public.produk_menu(id) on delete set null,
  nama_produk text not null,
  harga_satuan numeric not null default 0,
  jumlah integer not null default 1 check (jumlah > 0),
  subtotal numeric not null default 0
);

alter table public.item_pembelian enable row level security;

create policy "Pengguna login dapat melihat item_pembelian"
  on public.item_pembelian for select
  using (auth.role() = 'authenticated');

create policy "Pengguna login dapat menambahkan item_pembelian"
  on public.item_pembelian for insert
  with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 7. DATA AWAL (Profil Superadmin)
-- ------------------------------------------------------------------------------
insert into public.profil_pengguna (id, username, email, role, full_name, is_active)
values (
  '48faebac-223a-4757-abc2-d4a9d55d47c8',
  'estehadmin',
  'estehadmin@ngeteh-skuyy.internal',
  'superadmin',
  'Owner NGETEH SKUYY',
  true
)
on conflict (id) do update
set role = 'superadmin', is_active = true;

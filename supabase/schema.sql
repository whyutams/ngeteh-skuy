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
  gambar_url text,
  harga_modal numeric not null default 0 check (harga_modal >= 0),
  harga numeric not null default 0 check (harga >= 0),
  stok integer not null default 0 check (stok >= 0),
  satuan text default 'cup',
  status_aktif boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migrasi jika tabel produk_menu sudah dibuat sebelumnya
alter table public.produk_menu add column if not exists harga_modal numeric not null default 0 check (harga_modal >= 0);

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
-- 7. DATA AWAL (Profil Superadmin & Master Data Dummy)
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

-- Kategori Menu Awal
insert into public.kategori_menu (id, nama_kategori, urutan)
values
  ('a1111111-1111-4111-a111-111111111111', 'Teh Klasik', 1),
  ('b2222222-2222-4222-b222-222222222222', 'Teh Susu & Boba', 2),
  ('c3333333-3333-4333-c333-333333333333', 'Teh Buah Segar', 3)
on conflict (id) do update
set nama_kategori = excluded.nama_kategori, urutan = excluded.urutan;

-- Produk Menu Awal (Gambar tersimpan di Supabase Storage bucket 'menu-produk')
insert into public.produk_menu (id, kategori_id, nama_produk, gambar_url, harga, stok, satuan, status_aktif)
values
  ('c80bb1cb-be18-4afb-b8ec-37e0e5d38dfb', 'a1111111-1111-4111-a111-111111111111', 'Es Teh Manis Jumbo', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/esteh-original.jpg', 5000, 120, 'cup', true),
  ('0e305fdc-216f-4870-9205-de8de49a91c1', 'a1111111-1111-4111-a111-111111111111', 'Es Teh Kampoeng Gula Batu', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/esteh-kampoeng.jpg', 6000, 85, 'cup', true),
  ('927aaa34-a8cd-414e-a8e3-89212cb4a07e', 'a1111111-1111-4111-a111-111111111111', 'Teh Melati Spesial', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/esteh-melati.jpg', 7000, 60, 'cup', true),
  ('b06bdfcb-a785-4cf2-b5ad-55fb26b07fd5', 'b2222222-2222-4222-b222-222222222222', 'Teh Tarik Melaka', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/teh-tarik.jpg', 12000, 45, 'cup', true),
  ('b753560a-b06a-45d9-921b-bbe49f63edca', 'b2222222-2222-4222-b222-222222222222', 'Milk Tea Brown Sugar Boba', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/milk-tea-boba.jpg', 15000, 35, 'cup', true),
  ('e58ac4df-4455-413c-838e-2bf48494b1ec', 'b2222222-2222-4222-b222-222222222222', 'Matcha Green Tea Latte', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/matcha-latte.jpg', 16000, 28, 'cup', true),
  ('e2288217-078a-4bd4-82e4-65b046fb8912', 'c3333333-3333-4333-c333-333333333333', 'Lemon Tea Dingin Segar', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/lemon-tea.jpg', 9000, 50, 'cup', true),
  ('b539e224-fed2-4fce-b9ed-2350c0dc3623', 'c3333333-3333-4333-c333-333333333333', 'Lychee Tea Selasih', 'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/lychee-tea.jpg', 11000, 40, 'cup', true)
on conflict (id) do update
set
  kategori_id = excluded.kategori_id,
  nama_produk = excluded.nama_produk,
  gambar_url = excluded.gambar_url,
  harga = excluded.harga,
  stok = excluded.stok,
  satuan = excluded.satuan,
  status_aktif = excluded.status_aktif,
  updated_at = now();

-- ------------------------------------------------------------------------------
-- 8. TABEL bahan_baku (Kelola Bahan Baku Minuman / Outlet)
-- ------------------------------------------------------------------------------
create table if not exists public.bahan_baku (
  id uuid primary key default gen_random_uuid(),
  nama_bahan text not null,
  stok numeric not null default 0 check (stok >= 0),
  satuan text not null default 'gram',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bahan_baku enable row level security;

-- Pengguna login (Superadmin & Karyawan) dapat membaca data bahan baku
create policy "Pengguna login dapat melihat bahan_baku"
  on public.bahan_baku for select
  using (auth.role() = 'authenticated');

-- Hanya Superadmin yang dapat mengelola bahan baku
create policy "Superadmin dapat mengelola bahan_baku"
  on public.bahan_baku for all
  using (
    exists (
      select 1 from public.profil_pengguna
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- ------------------------------------------------------------------------------
-- 9. TABEL resep_menu (Komposisi Pemakaian Bahan Baku per Menu)
-- ------------------------------------------------------------------------------
create table if not exists public.resep_menu (
  id uuid primary key default gen_random_uuid(),
  produk_id uuid not null references public.produk_menu(id) on delete cascade,
  bahan_id uuid not null references public.bahan_baku(id) on delete cascade,
  jumlah_pemakaian numeric not null default 1 check (jumlah_pemakaian > 0),
  created_at timestamptz default now(),
  unique (produk_id, bahan_id)
);

alter table public.resep_menu enable row level security;

-- Pengguna login dapat melihat komposisi resep menu
create policy "Pengguna login dapat melihat resep_menu"
  on public.resep_menu for select
  using (auth.role() = 'authenticated');

-- Hanya Superadmin yang dapat mengelola resep menu
create policy "Superadmin dapat mengelola resep_menu"
  on public.resep_menu for all
  using (
    exists (
      select 1 from public.profil_pengguna
      where id = auth.uid() and role = 'superadmin'
    )
  );

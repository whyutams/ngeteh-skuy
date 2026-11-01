-- ==============================================================================
-- SEED DATA DUMMY NGETEH SKUYY (Point of Sale)
-- Jalankan skrip ini di SQL Editor Supabase setelah menjalankan schema.sql
-- Gambar produk tersimpan di Supabase Storage bucket 'menu-produk'
-- ==============================================================================

-- 1. Kategori Menu
insert into public.kategori_menu (id, nama_kategori, urutan)
values
  ('a1111111-1111-4111-a111-111111111111', 'Teh Klasik', 1),
  ('b2222222-2222-4222-b222-222222222222', 'Teh Susu & Boba', 2),
  ('c3333333-3333-4333-c333-333333333333', 'Teh Buah Segar', 3)
on conflict (id) do update
set nama_kategori = excluded.nama_kategori, urutan = excluded.urutan;

-- 2. Produk Menu (Dengan gambar resmi dari Supabase Storage)
insert into public.produk_menu (id, kategori_id, nama_produk, gambar_url, harga, stok, satuan, status_aktif)
values
  (
    'm0000001-0001-4001-8001-000000000001',
    'a1111111-1111-4111-a111-111111111111',
    'Es Teh Manis Jumbo',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/esteh-original.jpg',
    5000,
    120,
    'cup',
    true
  ),
  (
    'm0000002-0002-4002-8002-000000000002',
    'a1111111-1111-4111-a111-111111111111',
    'Es Teh Kampoeng Gula Batu',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/esteh-kampoeng.jpg',
    6000,
    85,
    'cup',
    true
  ),
  (
    'm0000003-0003-4003-8003-000000000003',
    'a1111111-1111-4111-a111-111111111111',
    'Teh Melati Spesial',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/esteh-melati.jpg',
    7000,
    60,
    'cup',
    true
  ),
  (
    'm0000004-0004-4004-8004-000000000004',
    'b2222222-2222-4222-b222-222222222222',
    'Teh Tarik Melaka',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/teh-tarik.jpg',
    12000,
    45,
    'cup',
    true
  ),
  (
    'm0000005-0005-4005-8005-000000000005',
    'b2222222-2222-4222-b222-222222222222',
    'Milk Tea Brown Sugar Boba',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/milk-tea-boba.jpg',
    15000,
    35,
    'cup',
    true
  ),
  (
    'm0000006-0006-4006-8006-000000000006',
    'b2222222-2222-4222-b222-222222222222',
    'Matcha Green Tea Latte',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/matcha-latte.jpg',
    16000,
    28,
    'cup',
    true
  ),
  (
    'm0000007-0007-4007-8007-000000000007',
    'c3333333-3333-4333-c333-333333333333',
    'Lemon Tea Dingin Segar',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/lemon-tea.jpg',
    9000,
    50,
    'cup',
    true
  ),
  (
    'm0000008-0008-4008-8008-000000000008',
    'c3333333-3333-4333-c333-333333333333',
    'Lychee Tea Selasih',
    'https://rdkysweihuejwnrdywnu.supabase.co/storage/v1/object/public/menu-produk/lychee-tea.jpg',
    11000,
    40,
    'cup',
    true
  )
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


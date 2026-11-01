// Skrip seed data dummy untuk NGETEH SKUYY
// Menambahkan kategori dan produk menu lengkap dengan URL gambar dari Supabase Storage

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

const BUCKET_URL = `${url}/storage/v1/object/public/menu-produk`;

const categories = [
  {
    id: "a1111111-1111-4111-a111-111111111111",
    nama_kategori: "Teh Klasik",
    urutan: 1,
  },
  {
    id: "b2222222-2222-4222-b222-222222222222",
    nama_kategori: "Teh Susu & Boba",
    urutan: 2,
  },
  {
    id: "c3333333-3333-4333-c333-333333333333",
    nama_kategori: "Teh Buah Segar",
    urutan: 3,
  },
];

const products = [
  {
    id: "c80bb1cb-be18-4afb-b8ec-37e0e5d38dfb",
    kategori_id: "a1111111-1111-4111-a111-111111111111",
    nama_produk: "Es Teh Manis Jumbo",
    gambar_url: `${BUCKET_URL}/esteh-original.jpg`,
    harga: 5000,
    stok: 120,
    satuan: "cup",
    status_aktif: true,
  },
  {
    id: "0e305fdc-216f-4870-9205-de8de49a91c1",
    kategori_id: "a1111111-1111-4111-a111-111111111111",
    nama_produk: "Es Teh Kampoeng Gula Batu",
    gambar_url: `${BUCKET_URL}/esteh-kampoeng.jpg`,
    harga: 6000,
    stok: 85,
    satuan: "cup",
    status_aktif: true,
  },
  {
    id: "927aaa34-a8cd-414e-a8e3-89212cb4a07e",
    kategori_id: "a1111111-1111-4111-a111-111111111111",
    nama_produk: "Teh Melati Spesial",
    gambar_url: `${BUCKET_URL}/esteh-melati.jpg`,
    harga: 7000,
    stok: 60,
    satuan: "cup",
    status_aktif: true,
  },
  {
    id: "b06bdfcb-a785-4cf2-b5ad-55fb26b07fd5",
    kategori_id: "b2222222-2222-4222-b222-222222222222",
    nama_produk: "Teh Tarik Melaka",
    gambar_url: `${BUCKET_URL}/teh-tarik.jpg`,
    harga: 12000,
    stok: 45,
    satuan: "cup",
    status_aktif: true,
  },
  {
    id: "b753560a-b06a-45d9-921b-bbe49f63edca",
    kategori_id: "b2222222-2222-4222-b222-222222222222",
    nama_produk: "Milk Tea Brown Sugar Boba",
    gambar_url: `${BUCKET_URL}/milk-tea-boba.jpg`,
    harga: 15000,
    stok: 35,
    satuan: "cup",
    status_aktif: true,
  },
  {
    id: "e58ac4df-4455-413c-838e-2bf48494b1ec",
    kategori_id: "b2222222-2222-4222-b222-222222222222",
    nama_produk: "Matcha Green Tea Latte",
    gambar_url: `${BUCKET_URL}/matcha-latte.jpg`,
    harga: 16000,
    stok: 28,
    satuan: "cup",
    status_aktif: true,
  },
  {
    id: "e2288217-078a-4bd4-82e4-65b046fb8912",
    kategori_id: "c3333333-3333-4333-c333-333333333333",
    nama_produk: "Lemon Tea Dingin Segar",
    gambar_url: `${BUCKET_URL}/lemon-tea.jpg`,
    harga: 9000,
    stok: 50,
    satuan: "cup",
    status_aktif: true,
  },
  {
    id: "b539e224-fed2-4fce-b9ed-2350c0dc3623",
    kategori_id: "c3333333-3333-4333-c333-333333333333",
    nama_produk: "Lychee Tea Selasih",
    gambar_url: `${BUCKET_URL}/lychee-tea.jpg`,
    harga: 11000,
    stok: 40,
    satuan: "cup",
    status_aktif: true,
  },
];

async function seed() {
  console.log("Memulai proses seeding data dummy...");

  // 1. Cek ketersediaan tabel kategori_menu
  const { error: catCheck } = await supabase.from("kategori_menu").select("id").limit(1);
  if (catCheck) {
    console.error("Gagal terhubung ke tabel kategori_menu:", catCheck.message);
    return;
  }

  // 2. Insert Kategori
  for (const cat of categories) {
    const { error } = await supabase.from("kategori_menu").upsert(cat, { onConflict: "id" });
    if (error) console.error("Gagal simpan kategori:", cat.nama_kategori, error.message);
    else console.log("Kategori tersimpan:", cat.nama_kategori);
  }

  // 3. Insert Produk Menu
  for (const prod of products) {
    const { error } = await supabase.from("produk_menu").upsert(prod, { onConflict: "id" });
    if (error) console.error("Gagal simpan produk:", prod.nama_produk, error.message);
    else console.log("Produk tersimpan:", prod.nama_produk);
  }

  console.log("Seeding data dummy selesai!");
}

seed();

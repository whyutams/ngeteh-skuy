import { Redis } from "@upstash/redis";
import { createAdminClient } from "@/libs/supabase/admin";

export interface BahanBakuRecord {
  id: string;
  nama_bahan: string;
  stok: number;
  satuan: string;
  created_at: string;
  updated_at: string;
}

export interface ResepMenuRecord {
  id: string;
  produk_id: string;
  bahan_id: string;
  jumlah_pemakaian: number;
  created_at: string;
  bahan_baku?: {
    nama_bahan: string;
    satuan: string;
    stok: number;
  } | null;
}

// inisialisasi redis jika tersedia
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

const REDIS_KEY_BAHAN = "menu:bahan_baku_list";
const REDIS_KEY_RESEP = "menu:resep_menu_list";
const STORAGE_FILE_BAHAN = "_meta_bahan_baku.json";
const STORAGE_FILE_RESEP = "_meta_resep_menu.json";

// data benih bawaan jika tabel belum dibuat
const initialBahanBaku: BahanBakuRecord[] = [
  {
    id: "b1111111-1111-4111-b111-111111111111",
    nama_bahan: "Daun Teh Hitam",
    stok: 5000,
    satuan: "gram",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b2222222-2222-4222-b222-222222222222",
    nama_bahan: "Daun Teh Melati",
    stok: 3000,
    satuan: "gram",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b3333333-3333-4333-b333-333333333333",
    nama_bahan: "Gula Pasir / Gula Batu",
    stok: 10000,
    satuan: "gram",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b4444444-4444-4444-b444-444444444444",
    nama_bahan: "Sirup Gula Cair",
    stok: 5000,
    satuan: "ml",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b5555555-5555-4555-b555-555555555555",
    nama_bahan: "Susu Evaporasi",
    stok: 10,
    satuan: "kaleng",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b6666666-6666-4666-b666-666666666666",
    nama_bahan: "Boba Tapioka",
    stok: 3000,
    satuan: "gram",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b7777777-7777-4777-b777-777777777777",
    nama_bahan: "Cup Plastik Jumbo + Tutup",
    stok: 500,
    satuan: "pcs",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ambil seluruh fallback bahan baku dari Redis atau Supabase Storage
export async function getFallbackBahanBakuList(): Promise<BahanBakuRecord[]> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get<BahanBakuRecord[]>(REDIS_KEY_BAHAN);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // lanjut ke storage
    }
  }

  try {
    const admin = createAdminClient();
    const { data: fileData, error } = await admin.storage
      .from("menu-produk")
      .download(STORAGE_FILE_BAHAN);

    if (!error && fileData) {
      const text = await fileData.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // abaikan
  }

  // inisialisasi awal ke redis dan storage
  await saveFallbackBahanBakuList(initialBahanBaku);
  return initialBahanBaku;
}

// simpan seluruh fallback bahan baku
export async function saveFallbackBahanBakuList(
  items: BahanBakuRecord[]
): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_KEY_BAHAN, items);
    } catch {
      // abaikan
    }
  }

  try {
    const admin = createAdminClient();
    await admin.storage
      .from("menu-produk")
      .upload(STORAGE_FILE_BAHAN, Buffer.from(JSON.stringify(items)), {
        upsert: true,
        contentType: "application/json",
      });
  } catch {
    // abaikan
  }
}

// ambil seluruh fallback resep menu
export async function getFallbackResepList(): Promise<ResepMenuRecord[]> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get<ResepMenuRecord[]>(REDIS_KEY_RESEP);
      if (Array.isArray(data)) {
        return data;
      }
    } catch {
      // lanjut ke storage
    }
  }

  try {
    const admin = createAdminClient();
    const { data: fileData, error } = await admin.storage
      .from("menu-produk")
      .download(STORAGE_FILE_RESEP);

    if (!error && fileData) {
      const text = await fileData.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // abaikan
  }

  return [];
}

// simpan seluruh fallback resep menu
export async function saveFallbackResepList(
  items: ResepMenuRecord[]
): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_KEY_RESEP, items);
    } catch {
      // abaikan
    }
  }

  try {
    const admin = createAdminClient();
    await admin.storage
      .from("menu-produk")
      .upload(STORAGE_FILE_RESEP, Buffer.from(JSON.stringify(items)), {
        upsert: true,
        contentType: "application/json",
      });
  } catch {
    // abaikan
  }
}


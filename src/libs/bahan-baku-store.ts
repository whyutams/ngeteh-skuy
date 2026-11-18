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

// data awal kosong untuk bahan baku
const initialBahanBaku: BahanBakuRecord[] = [];

// ambil seluruh fallback bahan baku dari Redis atau Supabase Storage
export async function getFallbackBahanBakuList(): Promise<BahanBakuRecord[]> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get<BahanBakuRecord[]>(REDIS_KEY_BAHAN);
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
      .download(STORAGE_FILE_BAHAN);

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


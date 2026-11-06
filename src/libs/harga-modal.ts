import { Redis } from "@upstash/redis";
import { createAdminClient } from "@/libs/supabase/admin";

// inisialisasi redis jika konfigurasi tersedia
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

const STORAGE_FILE_PATH = "_meta_harga_modal.json";
const REDIS_KEY = "menu:harga_modal";

// ambil seluruh peta fallback harga modal dari Redis atau Supabase Storage
export async function getFallbackHargaModalMap(): Promise<Record<string, number>> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.hgetall<Record<string, string | number>>(REDIS_KEY);
      if (data && Object.keys(data).length > 0) {
        const result: Record<string, number> = {};
        for (const [k, v] of Object.entries(data)) {
          result[k] = Number(v) || 0;
        }
        return result;
      }
    } catch {
      // lanjut ke Supabase Storage jika redis kendala
    }
  }

  // fallback ke Supabase Storage
  try {
    const admin = createAdminClient();
    const { data: fileData, error } = await admin.storage
      .from("menu-produk")
      .download(STORAGE_FILE_PATH);

    if (!error && fileData) {
      const text = await fileData.text();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, number>;
      }
    }
  } catch {
    // abaikan jika file belum ada
  }

  return {};
}

// simpan fallback harga modal ke Redis dan Supabase Storage
export async function saveFallbackHargaModal(
  produkId: string,
  hargaModal: number
): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.hset(REDIS_KEY, { [produkId]: hargaModal });
    } catch {
      // lanjut ke storage jika redis gagal
    }
  }

  try {
    const admin = createAdminClient();
    const currentMap = await getFallbackHargaModalMap();
    currentMap[produkId] = hargaModal;

    await admin.storage
      .from("menu-produk")
      .upload(STORAGE_FILE_PATH, Buffer.from(JSON.stringify(currentMap)), {
        upsert: true,
        contentType: "application/json",
      });
  } catch {
    // penanganan gagal simpan storage
  }
}

// hapus fallback harga modal dari penyimpanan
export async function deleteFallbackHargaModal(produkId: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.hdel(REDIS_KEY, produkId);
    } catch {
      // abaikan
    }
  }

  try {
    const admin = createAdminClient();
    const currentMap = await getFallbackHargaModalMap();
    if (produkId in currentMap) {
      delete currentMap[produkId];
      await admin.storage
        .from("menu-produk")
        .upload(STORAGE_FILE_PATH, Buffer.from(JSON.stringify(currentMap)), {
          upsert: true,
          contentType: "application/json",
        });
    }
  } catch {
    // abaikan
  }
}


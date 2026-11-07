"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import {
  bahanBakuSchema,
  resepItemSchema,
  type BahanBakuInput,
  type ResepItemInput,
} from "@/libs/validations/bahan-baku";
import {
  getFallbackBahanBakuList,
  saveFallbackBahanBakuList,
  getFallbackResepList,
  saveFallbackResepList,
  type BahanBakuRecord,
  type ResepMenuRecord,
} from "@/libs/bahan-baku-store";

export interface BahanBakuActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    nama_bahan?: string[];
    stok?: string[];
    satuan?: string[];
  };
}

// ambil seluruh daftar bahan baku
export async function getBahanBakuListAction(): Promise<{
  success: boolean;
  data: BahanBakuRecord[];
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("bahan_baku")
      .select("*")
      .order("created_at", { ascending: false });

    // fallback jika tabel belum dibuat di Supabase
    if (error && (error.code === "PGRST205" || error.code === "42P01" || error.message.includes("bahan_baku"))) {
      const fallbackData = await getFallbackBahanBakuList();
      return { success: true, data: fallbackData };
    }

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return {
      success: true,
      data: (data as BahanBakuRecord[]) || [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat bahan baku.";
    return { success: false, data: [], error: message };
  }
}

// ambil detail satu bahan baku berdasarkan ID
export async function getBahanBakuByIdAction(id: string): Promise<{
  success: boolean;
  data: BahanBakuRecord | null;
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("bahan_baku")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && (error.code === "PGRST205" || error.code === "42P01" || error.message.includes("bahan_baku"))) {
      const fallbackList = await getFallbackBahanBakuList();
      const found = fallbackList.find((b) => b.id === id) || null;
      return { success: true, data: found };
    }

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return {
      success: true,
      data: (data as BahanBakuRecord) || null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat detail bahan baku.";
    return { success: false, data: null, error: message };
  }
}

// buat bahan baku baru (khusus superadmin)
export async function createBahanBakuAction(
  input: BahanBakuInput
): Promise<BahanBakuActionResult> {
  const session = await getCurrentSession();
  if (!session.user) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = bahanBakuSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const payload = {
      nama_bahan: validation.data.nama_bahan,
      stok: validation.data.stok,
      satuan: validation.data.satuan,
    };

    const { error } = await admin.from("bahan_baku").insert(payload);

    // fallback jika tabel belum dibuat di database
    if (error && (error.code === "PGRST205" || error.code === "42P01" || error.message.includes("bahan_baku"))) {
      const currentList = await getFallbackBahanBakuList();
      const newRecord: BahanBakuRecord = {
        id: crypto.randomUUID(),
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      currentList.unshift(newRecord);
      await saveFallbackBahanBakuList(currentList);
    } else if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/bahan-baku");
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan bahan baku.";
    return { success: false, error: message };
  }
}

// perbarui bahan baku (khusus superadmin)
export async function updateBahanBakuAction(
  id: string,
  input: BahanBakuInput
): Promise<BahanBakuActionResult> {
  const session = await getCurrentSession();
  if (!session.user) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = bahanBakuSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const payload = {
      nama_bahan: validation.data.nama_bahan,
      stok: validation.data.stok,
      satuan: validation.data.satuan,
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin
      .from("bahan_baku")
      .update(payload)
      .eq("id", id);

    // fallback jika tabel belum ada
    if (error && (error.code === "PGRST205" || error.code === "42P01" || error.message.includes("bahan_baku"))) {
      const currentList = await getFallbackBahanBakuList();
      const idx = currentList.findIndex((b) => b.id === id);
      if (idx !== -1) {
        currentList[idx] = {
          ...currentList[idx],
          ...payload,
        };
        await saveFallbackBahanBakuList(currentList);
      }
    } else if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/bahan-baku");
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui bahan baku.";
    return { success: false, error: message };
  }
}

// hapus bahan baku (khusus superadmin)
export async function deleteBahanBakuAction(
  id: string
): Promise<BahanBakuActionResult> {
  const session = await getCurrentSession();
  if (!session.user) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("bahan_baku").delete().eq("id", id);

    // fallback jika tabel belum ada
    if (error && (error.code === "PGRST205" || error.code === "42P01" || error.message.includes("bahan_baku"))) {
      const currentList = await getFallbackBahanBakuList();
      const filtered = currentList.filter((b) => b.id !== id);
      await saveFallbackBahanBakuList(filtered);

      const resepList = await getFallbackResepList();
      const filteredResep = resepList.filter((r) => r.bahan_id !== id);
      await saveFallbackResepList(filteredResep);
    } else if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/bahan-baku");
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus bahan baku.";
    return { success: false, error: message };
  }
}

// ambil resep komposisi bahan baku berdasarkan produk id
export async function getResepByProdukIdAction(
  produkId: string
): Promise<{
  success: boolean;
  data: ResepMenuRecord[];
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("resep_menu")
      .select("id, produk_id, bahan_id, jumlah_pemakaian, created_at, bahan_baku(nama_bahan, satuan, stok)")
      .eq("produk_id", produkId);

    // fallback jika tabel belum ada
    if (error && (error.code === "PGRST205" || error.code === "42P01" || error.message.includes("resep_menu"))) {
      const [resepList, bahanList] = await Promise.all([
        getFallbackResepList(),
        getFallbackBahanBakuList(),
      ]);

      const bahanMap = new Map(bahanList.map((b) => [b.id, b]));
      const matched = resepList
        .filter((r) => r.produk_id === produkId)
        .map((r) => {
          const b = bahanMap.get(r.bahan_id);
          return {
            ...r,
            bahan_baku: b
              ? {
                  nama_bahan: b.nama_bahan,
                  satuan: b.satuan,
                  stok: b.stok,
                }
              : null,
          };
        });

      return { success: true, data: matched };
    }

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return {
      success: true,
      data: (data as unknown as ResepMenuRecord[]) || [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat resep menu.";
    return { success: false, data: [], error: message };
  }
}

// simpan komposisi bahan baku untuk satu produk menu (khusus superadmin)
export async function saveResepMenuAction(
  produkId: string,
  items: ResepItemInput[],
  skipAuthCheck = false
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!skipAuthCheck) {
    const session = await getCurrentSession();
    if (!session.user) {
      return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
    }
    if (!session.isSuperadmin) {
      return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
    }
  }

  // validasi setiap item resep
  for (const item of items) {
    const v = resepItemSchema.safeParse(item);
    if (!v.success) {
      return {
        success: false,
        error: v.error.issues[0]?.message || "Data resep bahan tidak valid.",
      };
    }
  }

  try {
    const admin = createAdminClient();

    // hapus resep lama terlebih dahulu
    const { error: delError } = await admin
      .from("resep_menu")
      .delete()
      .eq("produk_id", produkId);

    if (delError && (delError.code === "PGRST205" || delError.code === "42P01" || delError.message.includes("resep_menu"))) {
      // kelola di fallback
      const resepList = await getFallbackResepList();
      const filtered = resepList.filter((r) => r.produk_id !== produkId);

      for (const item of items) {
        filtered.push({
          id: crypto.randomUUID(),
          produk_id: produkId,
          bahan_id: item.bahan_id,
          jumlah_pemakaian: item.jumlah_pemakaian,
          created_at: new Date().toISOString(),
        });
      }

      await saveFallbackResepList(filtered);
      revalidatePath("/dashboard/menu");
      return { success: true };
    }

    if (items.length > 0) {
      const rows = items.map((item) => ({
        produk_id: produkId,
        bahan_id: item.bahan_id,
        jumlah_pemakaian: item.jumlah_pemakaian,
      }));

      const { error: insError } = await admin.from("resep_menu").insert(rows);
      if (insError) {
        return { success: false, error: insError.message };
      }
    }

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan resep menu.";
    return { success: false, error: message };
  }
}

// kurangi stok bahan baku saat transaksi penjualan berhasil
export async function deductBahanBakuForSoldItems(
  purchasedItems: Array<{ produk_id: string; jumlah: number }>
): Promise<void> {
  try {
    const admin = createAdminClient();
    const produkIds = purchasedItems.map((p) => p.produk_id);

    // coba ambil resep dari database
    const { data: dbResep, error: resepErr } = await admin
      .from("resep_menu")
      .select("produk_id, bahan_id, jumlah_pemakaian")
      .in("produk_id", produkIds);

    if (resepErr && (resepErr.code === "PGRST205" || resepErr.code === "42P01" || resepErr.message.includes("resep_menu"))) {
      // kurangi melalui fallback store
      const [allResep, allBahan] = await Promise.all([
        getFallbackResepList(),
        getFallbackBahanBakuList(),
      ]);

      const bahanMap = new Map(allBahan.map((b) => [b.id, b]));

      for (const item of purchasedItems) {
        const resepForProd = allResep.filter((r) => r.produk_id === item.produk_id);
        for (const r of resepForProd) {
          const bahan = bahanMap.get(r.bahan_id);
          if (bahan) {
            const deduction = Number(r.jumlah_pemakaian) * Number(item.jumlah);
            bahan.stok = Math.max(0, Number(bahan.stok) - deduction);
            bahan.updated_at = new Date().toISOString();
          }
        }
      }

      await saveFallbackBahanBakuList(allBahan);
      return;
    }

    if (dbResep && dbResep.length > 0) {
      // hitung total pengurangan per bahan_id
      const deductionMap = new Map<string, number>();

      for (const item of purchasedItems) {
        const matchingResep = dbResep.filter((r) => r.produk_id === item.produk_id);
        for (const r of matchingResep) {
          const prev = deductionMap.get(r.bahan_id) || 0;
          deductionMap.set(r.bahan_id, prev + Number(r.jumlah_pemakaian) * Number(item.jumlah));
        }
      }

      // lakukan pengurangan stok per bahan
      for (const [bahanId, amount] of deductionMap.entries()) {
        const { data: currentBahan } = await admin
          .from("bahan_baku")
          .select("stok")
          .eq("id", bahanId)
          .single();

        if (currentBahan) {
          const newStok = Math.max(0, Number(currentBahan.stok) - amount);
          await admin
            .from("bahan_baku")
            .update({ stok: newStok, updated_at: new Date().toISOString() })
            .eq("id", bahanId);
        }
      }
    }
  } catch {
    // abaikan jika terjadi kendala agar tidak menggagalkan checkout POS
  }
}


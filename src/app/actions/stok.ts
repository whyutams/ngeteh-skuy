"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import { stokAdjustmentSchema, type StokAdjustmentInput } from "@/libs/validations/stok";

export interface StokLogItem {
  id: string;
  produk_id: string;
  tipe_mutasi: "masuk" | "keluar" | "penyesuaian" | "penjualan";
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string | null;
  created_at: string;
  produk_menu?: {
    nama_produk: string;
    satuan: string;
  } | null;
  profil_pengguna?: {
    full_name: string | null;
    username: string;
  } | null;
}

export interface StokActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    produk_id?: string[];
    tipe_mutasi?: string[];
    jumlah?: string[];
    catatan?: string[];
  };
}

// Catat perubahan atau penyesuaian stok
export async function adjustStockAction(
  input: StokAdjustmentInput
): Promise<StokActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = stokAdjustmentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { produk_id, tipe_mutasi, jumlah, catatan } = validation.data;

  try {
    const admin = createAdminClient();

    // Ambil stok produk saat ini
    const { data: produk, error: fetchErr } = await admin
      .from("produk_menu")
      .select("id, nama_produk, stok")
      .eq("id", produk_id)
      .single();

    if (fetchErr || !produk) {
      return { success: false, error: "Produk tidak ditemukan." };
    }

    const stokSebelum = produk.stok || 0;
    let stokSesudah = stokSebelum;

    if (tipe_mutasi === "masuk") {
      stokSesudah = stokSebelum + jumlah;
    } else if (tipe_mutasi === "keluar") {
      stokSesudah = Math.max(0, stokSebelum - jumlah);
    } else if (tipe_mutasi === "penyesuaian") {
      stokSesudah = jumlah;
    }

    // Perbarui stok di tabel produk_menu
    const { error: updateErr } = await admin
      .from("produk_menu")
      .update({
        stok: stokSesudah,
        updated_at: new Date().toISOString(),
      })
      .eq("id", produk_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Catat ke tabel riwayat_stok
    const { error: logErr } = await admin.from("riwayat_stok").insert({
      produk_id,
      tipe_mutasi,
      jumlah,
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      catatan: catatan || "Penyesuaian stok oleh Owner",
      dibuat_oleh: session.user?.id || null,
    });

    if (logErr) {
      return { success: false, error: logErr.message };
    }

    revalidatePath("/dashboard/stok");
    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard/kasir");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyesuaikan stok.";
    return { success: false, error: message };
  }
}

// Ambil riwayat log mutasi stok
export async function getStokLogListAction(): Promise<{
  success: boolean;
  data: StokLogItem[];
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("riwayat_stok")
      .select(
        "id, produk_id, tipe_mutasi, jumlah, stok_sebelum, stok_sesudah, catatan, created_at, produk_menu(nama_produk, satuan), profil_pengguna(full_name, username)"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return {
      success: true,
      data: (data as unknown as StokLogItem[]) || [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat log stok.";
    return { success: false, data: [], error: message };
  }
}


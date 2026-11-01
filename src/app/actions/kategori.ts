"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import { kategoriSchema, type KategoriInput } from "@/libs/validations/kategori";

export interface KategoriItem {
  id: string;
  nama_kategori: string;
  urutan: number;
  created_at: string;
  total_produk?: number;
}

export interface KategoriActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    nama_kategori?: string[];
    urutan?: string[];
  };
}

// Ambil seluruh daftar kategori menu
export async function getKategoriListAction(): Promise<{
  success: boolean;
  data: KategoriItem[];
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session.user) {
    return {
      success: false,
      data: [],
      error: "Silakan login terlebih dahulu.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("kategori_menu")
      .select("id, nama_kategori, urutan, created_at")
      .order("urutan", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    // Ambil jumlah produk per kategori
    const { data: produkCounts } = await admin
      .from("produk_menu")
      .select("kategori_id");

    const countMap: Record<string, number> = {};
    if (produkCounts) {
      produkCounts.forEach((p) => {
        if (p.kategori_id) {
          countMap[p.kategori_id] = (countMap[p.kategori_id] || 0) + 1;
        }
      });
    }

    const result: KategoriItem[] = (data || []).map((k) => ({
      ...k,
      total_produk: countMap[k.id] || 0,
    }));

    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat kategori.";
    return { success: false, data: [], error: message };
  }
}

// Ambil detail satu kategori berdasarkan ID
export async function getKategoriByIdAction(id: string): Promise<{
  success: boolean;
  data: KategoriItem | null;
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return {
      success: false,
      data: null,
      error: "Hanya Owner yang dapat mengakses data kategori.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("kategori_menu")
      .select("id, nama_kategori, urutan, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat kategori.";
    return { success: false, data: null, error: message };
  }
}

// Tambah kategori baru
export async function createKategoriAction(
  input: KategoriInput
): Promise<KategoriActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = kategoriSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("kategori_menu").insert({
      nama_kategori: validation.data.nama_kategori,
      urutan: validation.data.urutan,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/kategori");
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan kategori.";
    return { success: false, error: message };
  }
}

// Ubah kategori yang ada
export async function updateKategoriAction(
  id: string,
  input: KategoriInput
): Promise<KategoriActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = kategoriSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("kategori_menu")
      .update({
        nama_kategori: validation.data.nama_kategori,
        urutan: validation.data.urutan,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/kategori");
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui kategori.";
    return { success: false, error: message };
  }
}

// Hapus kategori
export async function deleteKategoriAction(id: string): Promise<KategoriActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("kategori_menu").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/kategori");
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus kategori.";
    return { success: false, error: message };
  }
}


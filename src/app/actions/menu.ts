"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import { menuSchema, type MenuInput } from "@/libs/validations/menu";

export interface MenuItem {
  id: string;
  kategori_id: string | null;
  nama_produk: string;
  harga: number;
  stok: number;
  satuan: string;
  status_aktif: boolean;
  created_at: string;
  kategori_menu?: {
    nama_kategori: string;
  } | null;
}

export interface MenuActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    nama_produk?: string[];
    kategori_id?: string[];
    harga?: string[];
    satuan?: string[];
    stok?: string[];
  };
}

// Ambil seluruh daftar produk menu
export async function getMenuListAction(): Promise<{
  success: boolean;
  data: MenuItem[];
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("produk_menu")
      .select("id, kategori_id, nama_produk, harga, stok, satuan, status_aktif, created_at, kategori_menu(nama_kategori)")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return {
      success: true,
      data: (data as unknown as MenuItem[]) || [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat menu.";
    return { success: false, data: [], error: message };
  }
}

// Ambil detail satu produk menu berdasarkan ID
export async function getMenuByIdAction(id: string): Promise<{
  success: boolean;
  data: MenuItem | null;
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("produk_menu")
      .select("id, kategori_id, nama_produk, harga, stok, satuan, status_aktif, created_at, kategori_menu(nama_kategori)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return {
      success: true,
      data: (data as unknown as MenuItem) || null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat detail menu.";
    return { success: false, data: null, error: message };
  }
}

// Tambah produk menu baru
export async function createMenuAction(
  input: MenuInput
): Promise<MenuActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = menuSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const { data: newProd, error } = await admin
      .from("produk_menu")
      .insert({
        nama_produk: validation.data.nama_produk,
        kategori_id: validation.data.kategori_id || null,
        harga: validation.data.harga,
        satuan: validation.data.satuan,
        stok: validation.data.stok,
        status_aktif: validation.data.status_aktif,
      })
      .select("id")
      .single();

    if (error || !newProd) {
      return { success: false, error: error?.message || "Gagal menyimpan menu." };
    }

    // Catat mutasi awal jika ada stok
    if (validation.data.stok > 0) {
      await admin.from("riwayat_stok").insert({
        produk_id: newProd.id,
        tipe_mutasi: "masuk",
        jumlah: validation.data.stok,
        stok_sebelum: 0,
        stok_sesudah: validation.data.stok,
        catatan: "Stok awal produk",
        dibuat_oleh: session.user?.id || null,
      });
    }

    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard/stok");
    revalidatePath("/dashboard/kasir");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan menu.";
    return { success: false, error: message };
  }
}

// Perbarui data menu
export async function updateMenuAction(
  id: string,
  input: MenuInput
): Promise<MenuActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = menuSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("produk_menu")
      .update({
        nama_produk: validation.data.nama_produk,
        kategori_id: validation.data.kategori_id || null,
        harga: validation.data.harga,
        satuan: validation.data.satuan,
        status_aktif: validation.data.status_aktif,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard/kasir");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui menu.";
    return { success: false, error: message };
  }
}

// Hapus produk menu
export async function deleteMenuAction(id: string): Promise<MenuActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("produk_menu").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard/stok");
    revalidatePath("/dashboard/kasir");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus menu.";
    return { success: false, error: message };
  }
}


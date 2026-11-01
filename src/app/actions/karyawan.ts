"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import {
  createKaryawanSchema,
  resetPasswordSchema,
  type CreateKaryawanInput,
  type ResetPasswordInput,
} from "@/libs/validations/karyawan";

export interface KaryawanItem {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface KaryawanActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    username?: string[];
    full_name?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
}

// Ambil daftar seluruh akun karyawan
export async function getKaryawanListAction(): Promise<{
  success: boolean;
  data: KaryawanItem[];
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return {
      success: false,
      data: [],
      error: "Hanya Owner yang dapat mengakses data karyawan.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profil_pengguna")
      .select("id, username, email, full_name, role, is_active, created_at")
      .eq("role", "karyawan")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat data karyawan.";
    return { success: false, data: [], error: message };
  }
}

// Ambil data satu akun karyawan berdasarkan ID
export async function getKaryawanByIdAction(id: string): Promise<{
  success: boolean;
  data: KaryawanItem | null;
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return {
      success: false,
      data: null,
      error: "Hanya Owner yang dapat mengakses data karyawan.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profil_pengguna")
      .select("id, username, email, full_name, role, is_active, created_at")
      .eq("id", id)
      .eq("role", "karyawan")
      .maybeSingle();

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat detail karyawan.";
    return { success: false, data: null, error: message };
  }
}

// Buat akun karyawan baru
export async function createKaryawanAction(
  input: CreateKaryawanInput
): Promise<KaryawanActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = createKaryawanSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { username, full_name, password } = validation.data;
  const email = `${username.toLowerCase()}@ngeteh-skuyy.internal`;

  try {
    const admin = createAdminClient();

    // Buat akun di Supabase Auth
    const { data: authData, error: authErr } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username: username.toLowerCase(),
          full_name,
          role: "karyawan",
        },
      });

    if (authErr || !authData.user) {
      return {
        success: false,
        error: authErr?.message || "Gagal membuat akun karyawan.",
      };
    }

    // Pastikan data tersimpan di tabel profil_pengguna
    const { error: profileErr } = await admin.from("profil_pengguna").upsert({
      id: authData.user.id,
      username: username.toLowerCase(),
      email,
      role: "karyawan",
      full_name,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (profileErr) {
      return { success: false, error: profileErr.message };
    }

    revalidatePath("/dashboard/karyawan");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menyimpan akun karyawan.";
    return { success: false, error: message };
  }
}

// Reset password akun karyawan
export async function resetPasswordKaryawanAction(
  userId: string,
  input: ResetPasswordInput
): Promise<KaryawanActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  const validation = resetPasswordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: validation.data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/karyawan");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal mereset password.";
    return { success: false, error: message };
  }
}

// Nonaktifkan atau aktifkan kembali akun karyawan
export async function toggleStatusKaryawanAction(
  userId: string,
  currentStatus: boolean
): Promise<KaryawanActionResult> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  try {
    const admin = createAdminClient();
    const nextStatus = !currentStatus;

    const { error } = await admin
      .from("profil_pengguna")
      .update({
        is_active: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/karyawan");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal mengubah status karyawan.";
    return { success: false, error: message };
  }
}


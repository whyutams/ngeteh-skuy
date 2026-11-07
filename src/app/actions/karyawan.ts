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
    email?: string[];
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
    let karyawanList: KaryawanItem[] = [];
    let shouldFallback = false;

    // ambil dari tabel profil pengguna
    try {
      const { data, error } = await admin
        .from("profil_pengguna")
        .select("id, username, email, full_name, role, is_active, created_at")
        .eq("role", "karyawan")
        .order("created_at", { ascending: false });

      if (error) {
        shouldFallback = true;
      } else if (data && data.length > 0) {
        karyawanList = data;
      } else {
        shouldFallback = true;
      }
    } catch {
      shouldFallback = true;
    }

    // fallback langsung dari data auth jika tabel kosong
    if (shouldFallback) {
      const { data: authData, error: authErr } = await admin.auth.admin.listUsers({
        perPage: 1000,
      });

      if (!authErr && authData?.users) {
        const authList: KaryawanItem[] = authData.users
          .filter(
            (u) =>
              u.user_metadata?.role === "karyawan" ||
              (u.email?.endsWith("@ngeteh-skuyy.internal") &&
                !u.email?.startsWith("estehadmin"))
          )
          .map((u) => {
            const isActive =
              u.user_metadata?.is_active !== undefined
                ? Boolean(u.user_metadata.is_active)
                : true;

            return {
              id: u.id,
              username:
                u.user_metadata?.username ||
                u.email?.replace(/@.*$/, "") ||
                "karyawan",
              email:
                u.user_metadata?.email ||
                (u.email?.endsWith("@ngeteh-skuyy.internal") ? null : u.email) ||
                null,
              full_name: u.user_metadata?.full_name || null,
              role: "karyawan",
              is_active: isActive,
              created_at: u.created_at,
            };
          });

        karyawanList = authList;
      }
    }

    return { success: true, data: karyawanList };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memuat data karyawan.";
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

    // ambil dari tabel profil pengguna
    try {
      const { data, error } = await admin
        .from("profil_pengguna")
        .select("id, username, email, full_name, role, is_active, created_at")
        .eq("id", id)
        .eq("role", "karyawan")
        .maybeSingle();

      if (!error && data) {
        return { success: true, data };
      }
    } catch {
      // abaikan jika tabel profil belum tersedia
    }

    // fallback cari di auth
    const { data: userData, error: userErr } =
      await admin.auth.admin.getUserById(id);

    if (!userErr && userData?.user) {
      const u = userData.user;
      const isActive =
        u.user_metadata?.is_active !== undefined
          ? Boolean(u.user_metadata.is_active)
          : true;

      return {
        success: true,
        data: {
          id: u.id,
          username:
            u.user_metadata?.username ||
            u.email?.replace(/@.*$/, "") ||
            "karyawan",
          email:
            u.user_metadata?.email ||
            (u.email?.endsWith("@ngeteh-skuyy.internal") ? null : u.email) ||
            null,
          full_name: u.user_metadata?.full_name || null,
          role: "karyawan",
          is_active: isActive,
          created_at: u.created_at,
        },
      };
    }

    return {
      success: false,
      data: null,
      error: "Data karyawan tidak ditemukan.",
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memuat detail karyawan.";
    return { success: false, data: null, error: message };
  }
}

// Buat akun karyawan baru
export async function createKaryawanAction(
  input: CreateKaryawanInput
): Promise<KaryawanActionResult> {
  const session = await getCurrentSession();
  if (!session.user) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }
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

  const { username, full_name, email: inputEmail, password } = validation.data;
  const cleanEmail =
    inputEmail && inputEmail.trim().length > 0
      ? inputEmail.trim().toLowerCase()
      : null;
  const authEmail =
    cleanEmail || `${username.toLowerCase()}@ngeteh-skuyy.internal`;

  try {
    const admin = createAdminClient();

    // buat akun di auth
    const { data: authData, error: authErr } =
      await admin.auth.admin.createUser({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: {
          username: username.toLowerCase(),
          full_name,
          role: "karyawan",
          email: cleanEmail,
          is_active: true,
        },
      });

    if (authErr || !authData.user) {
      const authMsg = authErr?.message?.toLowerCase() || "";
      if (
        authMsg.includes("already registered") ||
        authMsg.includes("unique") ||
        authMsg.includes("exists")
      ) {
        return {
          success: false,
          error: cleanEmail
            ? "Email atau username ini sudah digunakan. Silakan gunakan yang lain."
            : `Username "${username}" sudah digunakan. Silakan gunakan username lain.`,
        };
      }
      return {
        success: false,
        error: authErr?.message || "Gagal membuat akun karyawan.",
      };
    }

    // sinkronkan ke tabel profil pengguna
    try {
      const { error: profileErr } = await admin.from("profil_pengguna").upsert(
        {
          id: authData.user.id,
          username: username.toLowerCase(),
          email: cleanEmail || authEmail,
          role: "karyawan",
          full_name,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileErr) {
        const isTableMissing =
          profileErr.code === "PGRST205" ||
          profileErr.code === "42P01" ||
          profileErr.code === "PGRST204";
        if (!isTableMissing) {
          console.warn(
            "Peringatan sinkronisasi profil_pengguna karyawan:",
            profileErr.message
          );
        }
      }
    } catch {
      // Abaikan jika tabel profil_pengguna belum tersedia
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
  if (!session.user) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }
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
  if (!session.user) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  try {
    const admin = createAdminClient();
    const nextStatus = !currentStatus;

    // Perbarui di metadata auth Supabase
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        is_active: nextStatus,
      },
    });

    // Coba sinkronkan ke tabel profil_pengguna jika tersedia
    try {
      await admin
        .from("profil_pengguna")
        .update({
          is_active: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } catch {
      // Abaikan jika tabel profil_pengguna belum tersedia
    }

    revalidatePath("/dashboard/karyawan");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal mengubah status karyawan.";
    return { success: false, error: message };
  }
}

// hapus akun karyawan permanen (khusus owner)
export async function deleteKaryawanAction(
  userId: string,
  confirmedUsername: string
): Promise<KaryawanActionResult> {
  const session = await getCurrentSession();
  if (!session.user) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }
  if (!session.isSuperadmin) {
    return { success: false, error: "Akses ditolak. Fitur ini khusus Owner." };
  }

  if (userId === session.user.id) {
    return { success: false, error: "Tidak dapat menghapus akun Anda sendiri." };
  }

  try {
    const admin = createAdminClient();

    let targetUsername = "";
    let isTargetSuperadmin = false;

    // periksa dari profil pengguna
    try {
      const { data: profile } = await admin
        .from("profil_pengguna")
        .select("id, username, role")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        targetUsername = profile.username;
        isTargetSuperadmin = profile.role === "superadmin";
      }
    } catch {
      // lanjut ke pemeriksaan auth
    }

    // fallback periksa data auth jika tidak di profil
    if (!targetUsername) {
      const { data: authUser, error: authErr } =
        await admin.auth.admin.getUserById(userId);
      if (authErr || !authUser?.user) {
        return { success: false, error: "Data karyawan tidak ditemukan." };
      }
      targetUsername =
        authUser.user.user_metadata?.username ||
        authUser.user.email?.replace(/@.*$/, "") ||
        "";
      isTargetSuperadmin =
        authUser.user.user_metadata?.role === "superadmin" ||
        (authUser.user.email || "").startsWith("estehadmin");
    }

    if (isTargetSuperadmin) {
      return { success: false, error: "Akun Owner tidak dapat dihapus." };
    }

    // verifikasi kesesuaian username konfirmasi
    if (
      confirmedUsername.trim().toLowerCase() !==
      targetUsername.trim().toLowerCase()
    ) {
      return {
        success: false,
        error: `Username konfirmasi tidak sesuai. Harap ketik "${targetUsername}".`,
      };
    }

    // hapus profil pengguna
    try {
      await admin.from("profil_pengguna").delete().eq("id", userId);
    } catch {
      // abaikan jika tabel profil_pengguna belum tersedia
    }

    // hapus user auth supabase
    const { error: deleteAuthErr } = await admin.auth.admin.deleteUser(userId);
    if (deleteAuthErr) {
      return { success: false, error: deleteAuthErr.message };
    }

    revalidatePath("/dashboard/karyawan");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menghapus akun karyawan.";
    return { success: false, error: message };
  }
}

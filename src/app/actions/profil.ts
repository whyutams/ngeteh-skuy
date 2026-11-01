"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import { updateProfileSchema } from "@/libs/validations/profil";

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

// Server action untuk memperbarui profil pengguna aktif
export async function updateProfileAction(
  payload: {
    full_name: string;
    email: string;
    password?: string;
    confirm_password?: string;
  }
): Promise<ProfileActionResult> {
  const session = await getCurrentSession();

  if (!session.user) {
    return {
      success: false,
      error: "Sesi telah berakhir. Silakan login kembali.",
    };
  }

  // Validasi data input
  const validation = updateProfileSchema.safeParse(payload);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { full_name, email, password } = validation.data;
  const admin = createAdminClient();

  try {
    // 1. Perbarui kredensial dan metadata di auth.users terlebih dahulu
    const updateAuthPayload: {
      email?: string;
      email_confirm?: boolean;
      user_metadata: Record<string, unknown>;
      password?: string;
    } = {
      email: email.toLowerCase(),
      email_confirm: true,
      user_metadata: {
        ...(session.profile ? { username: session.profile.username, role: session.profile.role } : {}),
        full_name,
        email: email.toLowerCase(),
      },
    };

    // Jika pengguna memasukkan password baru
    if (password && password.length >= 8) {
      updateAuthPayload.password = password;
    }

    const { error: authError } = await admin.auth.admin.updateUserById(
      session.user.id,
      updateAuthPayload
    );

    if (authError) {
      const authMsg = authError.message.toLowerCase();
      if (authMsg.includes("already registered") || authMsg.includes("unique")) {
        return {
          success: false,
          error: "Email ini sudah digunakan oleh akun lain.",
        };
      }
      return {
        success: false,
        error: authError.message || "Gagal memperbarui kredensial akun.",
      };
    }

    // 2. Sinkronkan ke tabel profil_pengguna jika tabel sudah siap di database
    try {
      const { error: dbError } = await admin
        .from("profil_pengguna")
        .upsert(
          {
            id: session.user.id,
            username: session.profile?.username || "estehadmin",
            email: email.toLowerCase(),
            role: session.profile?.role || "superadmin",
            full_name,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (dbError) {
        // Cek duplikasi constraint email
        if (dbError.code === "23505") {
          return {
            success: false,
            error: "Email ini sudah terdaftar pada akun lain.",
          };
        }
        // Jika tabel/kolom belum dibuat (PGRST205 / 42P01 / PGRST204), fallback ke user_metadata
        const isTableMissing =
          dbError.code === "PGRST205" ||
          dbError.code === "42P01" ||
          dbError.code === "PGRST204";

        if (!isTableMissing) {
          console.warn("Peringatan sinkronisasi profil_pengguna:", dbError.message);
        }
      }
    } catch {
      // Abaikan jika tabel profil_pengguna belum tersedia
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/profil");

    return {
      success: true,
      message: "Profil Anda berhasil diperbarui.",
    };
  } catch {
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat memperbarui profil.",
    };
  }
}

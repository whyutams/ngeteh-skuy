import { createClient } from "@/libs/supabase/server";
import { createAdminClient } from "@/libs/supabase/admin";
import { APP_NAME } from "@/libs/constants";

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: "superadmin" | "karyawan";
  full_name: string | null;
  is_active: boolean;
}

// Ambil data sesi autentikasi dan profil pengguna saat ini
export async function getCurrentSession(): Promise<{
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
  isSuperadmin: boolean;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, profile: null, isSuperadmin: false };
    }

    // Periksa apakah user adalah akun estehadmin atau memiliki role superadmin di metadata
    const userEmail = (user.email || "").toLowerCase();
    const userMetaRole = user.user_metadata?.role as "superadmin" | "karyawan" | undefined;
    const userMetaUsername = (user.user_metadata?.username || "").toLowerCase();
    const isEstehAdminUser =
      userEmail.startsWith("estehadmin") || userMetaUsername === "estehadmin";

    let profile: UserProfile | null = null;

    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("profil_pengguna")
        .select("id, username, email, role, full_name, is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        profile = data as UserProfile;
      }
    } catch {
      // Abaikan jika tabel belum siap
    }

    // Tentukan role: prioritaskan data tabel, lalu metadata, lalu akun bawaan estehadmin
    const role: "superadmin" | "karyawan" =
      profile?.role || userMetaRole || (isEstehAdminUser ? "superadmin" : "karyawan");

    const isSuperadmin = role === "superadmin";

    const resolvedProfile: UserProfile = profile ?? {
      id: user.id,
      username: user.user_metadata?.username || (isEstehAdminUser ? "estehadmin" : "user"),
      email: user.email || null,
      role,
      full_name: user.user_metadata?.full_name || (isEstehAdminUser ? `Owner ${APP_NAME}` : ""),
      is_active: true,
    };

    return {
      user: { id: user.id, email: user.email },
      profile: resolvedProfile,
      isSuperadmin,
    };
  } catch {
    return { user: null, profile: null, isSuperadmin: false };
  }
}

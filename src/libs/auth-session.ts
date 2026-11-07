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

// ambil data sesi autentikasi dan profil pengguna saat ini
export async function getCurrentSession(): Promise<{
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
  isSuperadmin: boolean;
}> {
  try {
    const supabase = await createClient();
    let user: { id: string; email?: string; user_metadata?: Record<string, any> } | null = null;

    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && authUser) {
      user = authUser;
    } else {
      // fallback membaca sesi dari cookie jika getUser gagal
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        user = sessionData.session.user;
      }
    }

    if (!user) {
      return { user: null, profile: null, isSuperadmin: false };
    }

    // periksa identitas owner bawaan atau metadata
    const userEmail = (user.email || "").toLowerCase();
    const userMetaRole = String(user.user_metadata?.role || "").toLowerCase();
    const userMetaUsername = String(user.user_metadata?.username || "").toLowerCase();
    const isEstehAdminUser =
      userEmail.startsWith("estehadmin") ||
      userMetaUsername === "estehadmin" ||
      user.id === "48faebac-223a-4757-abc2-d4a9d55d47c8";

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
      // abaikan jika tabel belum siap
    }

    // tentukan role: prioritaskan data tabel, lalu metadata, lalu akun bawaan
    const rawRole = String(profile?.role || userMetaRole || (isEstehAdminUser ? "superadmin" : "karyawan")).toLowerCase();
    const isSuperadmin = rawRole === "superadmin" || isEstehAdminUser;
    const role: "superadmin" | "karyawan" = isSuperadmin ? "superadmin" : "karyawan";

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

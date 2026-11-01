"use server";

import { headers } from "next/headers";
import { createClient } from "@/libs/supabase/server";
import { createAdminClient } from "@/libs/supabase/admin";
import { checkRateLimit } from "@/libs/rate-limit";
import { loginSchema } from "@/libs/validations/auth";

export interface LoginActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    username?: string[];
    password?: string[];
  };
}

// Server action penanganan proses login
export async function loginAction(
  prevState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const rawUsername = formData.get("username");
  const rawPassword = formData.get("password");

  // Validasi data input menggunakan Zod
  const validation = loginSchema.safeParse({
    username: typeof rawUsername === "string" ? rawUsername : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  });

  if (!validation.success) {
    const errorMap = validation.error.flatten().fieldErrors;
    return {
      success: false,
      fieldErrors: {
        username: errorMap.username,
        password: errorMap.password,
      },
    };
  }

  const { username, password } = validation.data;

  // Proteksi brute force dengan rate limiter
  const rateLimitKey = `${clientIp}:${username.toLowerCase()}`;
  const rateLimitResult = await checkRateLimit(rateLimitKey);

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: "Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa saat.",
    };
  }

  const supabase = await createClient();

  // Cari email akun berdasarkan username atau input email
  const cleanUsername = username.trim().toLowerCase();
  let targetEmail: string | null = cleanUsername.includes("@") ? cleanUsername : null;

  if (!targetEmail) {
    const admin = createAdminClient();

    // cari di tabel profil pengguna
    try {
      const { data: profile } = await admin
        .from("profil_pengguna")
        .select("email")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (profile?.email) {
        targetEmail = profile.email;
      }
    } catch {
      // abaikan jika tabel belum siap
    }

    // fallback jika belum sinkron di database
    if (!targetEmail) {
      try {
        const { data: authData } = await admin.auth.admin.listUsers();
        const matchedUser = authData?.users?.find(
          (u) =>
            u.user_metadata?.username?.toLowerCase() === cleanUsername ||
            u.email?.split("@")[0].toLowerCase() === cleanUsername
        );
        if (matchedUser?.email) {
          targetEmail = matchedUser.email;
        }
      } catch {
        // Abaikan
      }
    }

    // 3. Fallback email default format internal
    if (!targetEmail) {
      targetEmail = `${cleanUsername}@ngeteh-skuyy.internal`;
    }
  }

  // Autentikasi sesi melalui Supabase
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password,
  });

  if (authError) {
    return {
      success: false,
      error: "Username atau password salah.",
    };
  }

  return {
    success: true,
  };
}


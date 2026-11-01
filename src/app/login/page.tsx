import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";

export default async function LoginRedirectPage() {
  const session = await getCurrentSession();

  // Jika sudah login, alihkan langsung ke dashboard
  if (session.user) {
    redirect("/dashboard");
  }

  // Jika belum login, alihkan ke halaman utama login
  redirect("/");
}


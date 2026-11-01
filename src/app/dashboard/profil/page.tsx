import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { ProfilClient } from "@/components/dashboard/profil/profil-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Profil Akun",
};

export default async function ProfilPage() {
  const session = await getCurrentSession();

  if (!session.user || !session.profile) {
    redirect("/");
  }

  return (
    <ProfilClient
      initialProfile={{
        id: session.profile.id,
        username: session.profile.username,
        full_name: session.profile.full_name || "",
        email: session.profile.email,
        role: session.profile.role,
        is_active: session.profile.is_active,
      }}
    />
  );
}


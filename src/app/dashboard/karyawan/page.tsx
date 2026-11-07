import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getKaryawanListAction } from "@/app/actions/karyawan";
import { KaryawanClient } from "@/components/dashboard/karyawan/karyawan-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Kelola Karyawan",
};

interface KaryawanPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function KaryawanPage({ searchParams }: KaryawanPageProps) {
  const session = await getCurrentSession();

  // Proteksi: Hanya Owner (superadmin) yang boleh melihat fitur ini
  if (!session.isSuperadmin) {
    redirect("/dashboard");
  }

  const { status } = (await searchParams) || {};
  const { data } = await getKaryawanListAction();

  return <KaryawanClient initialData={data || []} statusParam={status} />;
}


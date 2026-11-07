import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getKategoriListAction } from "@/app/actions/kategori";
import { KategoriClient } from "@/components/dashboard/kategori/kategori-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Kategori Menu",
};

interface KategoriPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function KategoriPage({ searchParams }: KategoriPageProps) {
  const session = await getCurrentSession();

  // Proteksi: Hanya Owner (superadmin) yang boleh melihat fitur ini
  if (!session.isSuperadmin) {
    redirect("/dashboard");
  }

  const { status } = (await searchParams) || {};
  const { data } = await getKategoriListAction();

  return <KategoriClient initialData={data || []} statusParam={status} />;
}


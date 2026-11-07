import { getCurrentSession } from "@/libs/auth-session";
import { getBahanBakuListAction } from "@/app/actions/bahan-baku";
import { BahanBakuClient } from "@/components/dashboard/bahan-baku/bahan-baku-client";

export const metadata = {
  title: "Bahan Baku",
};

interface BahanBakuPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function BahanBakuPage({ searchParams }: BahanBakuPageProps) {
  const session = await getCurrentSession();
  const { status } = (await searchParams) || {};
  const { data: bahanBakuList } = await getBahanBakuListAction();

  return (
    <BahanBakuClient
      initialData={bahanBakuList || []}
      userRole={session.isSuperadmin ? "superadmin" : "karyawan"}
      statusParam={status}
    />
  );
}


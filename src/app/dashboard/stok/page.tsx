import { getCurrentSession } from "@/libs/auth-session";
import { getMenuListAction } from "@/app/actions/menu";
import { getStokLogListAction } from "@/app/actions/stok";
import { StokClient } from "@/components/dashboard/stok/stok-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Kelola Stok",
};

interface StokPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function StokPage({ searchParams }: StokPageProps) {
  const session = await getCurrentSession();
  const isOwner = session.isSuperadmin;
  const { status } = (await searchParams) || {};

  const [{ data: products }, { data: logs }] = await Promise.all([
    getMenuListAction(),
    getStokLogListAction(),
  ]);

  return (
    <StokClient
      products={products || []}
      initialLogs={logs || []}
      isOwner={isOwner}
      statusParam={status}
    />
  );
}


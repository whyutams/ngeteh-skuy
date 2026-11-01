import { getCurrentSession } from "@/libs/auth-session";
import { getMenuListAction } from "@/app/actions/menu";
import { getStokLogListAction } from "@/app/actions/stok";
import { StokClient } from "@/components/dashboard/stok/stok-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Kelola Stok",
};

export default async function StokPage() {
  const session = await getCurrentSession();
  const isOwner = session.isSuperadmin;

  const [{ data: products }, { data: logs }] = await Promise.all([
    getMenuListAction(),
    getStokLogListAction(),
  ]);

  return (
    <StokClient
      products={products || []}
      initialLogs={logs || []}
      isOwner={isOwner}
    />
  );
}


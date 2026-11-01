import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getMenuListAction } from "@/app/actions/menu";
import { PenyesuaianStokForm } from "./penyesuaian-stok-form";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: `Penyesuaian Stok - ${APP_NAME}`,
};

interface PenyesuaianStokPageProps {
  searchParams?: Promise<{ produk_id?: string }>;
}

export default async function PenyesuaianStokPage({
  searchParams,
}: PenyesuaianStokPageProps) {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/stok");
  }

  const { data: products } = await getMenuListAction();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialProductId = resolvedSearchParams?.produk_id;

  return (
    <PenyesuaianStokForm
      products={products || []}
      initialProductId={initialProductId}
    />
  );
}


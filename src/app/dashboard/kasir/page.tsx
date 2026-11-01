import { getMenuListAction } from "@/app/actions/menu";
import { getKategoriListAction } from "@/app/actions/kategori";
import { KasirClient } from "@/components/dashboard/kasir/kasir-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Kasir POS",
};

export default async function KasirPage() {
  const [{ data: products }, { data: categories }] = await Promise.all([
    getMenuListAction(),
    getKategoriListAction(),
  ]);

  return (
    <KasirClient
      products={products || []}
      categories={categories || []}
    />
  );
}

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getKategoriListAction } from "@/app/actions/kategori";
import { getBahanBakuListAction } from "@/app/actions/bahan-baku";
import { TambahMenuForm } from "./tambah-menu-form";

export const metadata = {
  title: "Tambah Menu",
};

export default async function TambahMenuPage() {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/menu");
  }

  const [{ data: categories }, { data: bahanBakuList }] = await Promise.all([
    getKategoriListAction(),
    getBahanBakuListAction(),
  ]);

  return (
    <TambahMenuForm
      categories={categories || []}
      bahanBakuList={bahanBakuList || []}
    />
  );
}


import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getMenuByIdAction } from "@/app/actions/menu";
import { getKategoriListAction } from "@/app/actions/kategori";
import {
  getBahanBakuListAction,
  getResepByProdukIdAction,
} from "@/app/actions/bahan-baku";
import { EditMenuForm } from "./edit-menu-form";

export const metadata = {
  title: "Ubah Menu",
};

interface EditMenuPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMenuPage({ params }: EditMenuPageProps) {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/menu");
  }

  const { id } = await params;
  const [{ data: menu }, { data: categories }, { data: bahanBakuList }, { data: existingResep }] =
    await Promise.all([
      getMenuByIdAction(id),
      getKategoriListAction(),
      getBahanBakuListAction(),
      getResepByProdukIdAction(id),
    ]);

  if (!menu) {
    notFound();
  }

  return (
    <EditMenuForm
      initialData={menu}
      categories={categories || []}
      bahanBakuList={bahanBakuList || []}
      initialResep={existingResep || []}
    />
  );
}


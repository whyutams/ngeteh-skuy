import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getKategoriListAction } from "@/app/actions/kategori";
import { TambahMenuForm } from "./tambah-menu-form";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Tambah Menu",
};

export default async function TambahMenuPage() {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/menu");
  }

  const { data: categories } = await getKategoriListAction();

  return <TambahMenuForm categories={categories || []} />;
}


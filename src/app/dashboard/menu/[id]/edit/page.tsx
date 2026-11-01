import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getMenuByIdAction } from "@/app/actions/menu";
import { getKategoriListAction } from "@/app/actions/kategori";
import { EditMenuForm } from "./edit-menu-form";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: `Ubah Menu - ${APP_NAME}`,
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
  const [{ data: menu }, { data: categories }] = await Promise.all([
    getMenuByIdAction(id),
    getKategoriListAction(),
  ]);

  if (!menu) {
    notFound();
  }

  return <EditMenuForm initialData={menu} categories={categories || []} />;
}


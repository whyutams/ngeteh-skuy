import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getKategoriByIdAction } from "@/app/actions/kategori";
import { EditKategoriForm } from "./edit-kategori-form";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Ubah Kategori",
};

interface EditKategoriPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditKategoriPage({ params }: EditKategoriPageProps) {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/kategori");
  }

  const { id } = await params;
  const { data: kategori } = await getKategoriByIdAction(id);

  if (!kategori) {
    notFound();
  }

  return <EditKategoriForm initialData={kategori} />;
}


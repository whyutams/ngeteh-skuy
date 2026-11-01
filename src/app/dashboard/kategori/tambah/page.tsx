import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { TambahKategoriForm } from "./tambah-kategori-form";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: `Tambah Kategori - ${APP_NAME}`,
};

export default async function TambahKategoriPage() {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/kategori");
  }

  return <TambahKategoriForm />;
}


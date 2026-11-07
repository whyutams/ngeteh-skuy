import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { TambahBahanForm } from "./tambah-bahan-form";

export const metadata = {
  title: "Tambah Bahan Baku",
};

export default async function TambahBahanBakuPage() {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/bahan-baku");
  }

  return <TambahBahanForm />;
}


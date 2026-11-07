import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getBahanBakuByIdAction } from "@/app/actions/bahan-baku";
import { EditBahanForm } from "./edit-bahan-form";

export const metadata = {
  title: "Ubah Bahan Baku",
};

interface EditBahanBakuPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBahanBakuPage({
  params,
}: EditBahanBakuPageProps) {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/bahan-baku");
  }

  const { id } = await params;
  const { data: bahanBaku } = await getBahanBakuByIdAction(id);

  if (!bahanBaku) {
    notFound();
  }

  return <EditBahanForm initialData={bahanBaku} />;
}


import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { TambahKaryawanForm } from "./tambah-karyawan-form";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Tambah Karyawan",
};

export default async function TambahKaryawanPage() {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/karyawan");
  }

  return <TambahKaryawanForm />;
}


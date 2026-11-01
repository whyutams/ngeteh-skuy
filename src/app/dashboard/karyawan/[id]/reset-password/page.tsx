import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getKaryawanByIdAction } from "@/app/actions/karyawan";
import { ResetPasswordForm } from "./reset-password-form";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Reset Password Karyawan",
};

interface ResetPasswordPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const session = await getCurrentSession();

  if (!session.isSuperadmin) {
    redirect("/dashboard/karyawan");
  }

  const { id } = await params;
  const { data: employee } = await getKaryawanByIdAction(id);

  if (!employee) {
    notFound();
  }

  return <ResetPasswordForm employee={employee} />;
}


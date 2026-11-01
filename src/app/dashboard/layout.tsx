import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // Pengalihan jika pengguna belum terautentikasi
  if (!session.user) {
    redirect("/");
  }

  const role = session.profile?.role || "karyawan";
  const name = session.profile?.full_name || session.profile?.username || "Pengguna";
  const email = session.profile?.email || session.user.email;

  return (
    <DashboardShell userRole={role} userName={name} userEmail={email}>
      {children}
    </DashboardShell>
  );
}


import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { getCurrentSession } from "@/libs/auth-session";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: `Laporan Penjualan - ${APP_NAME}`,
};

export default async function LaporanPage() {
  const session = await getCurrentSession();

  // Proteksi: Khusus Owner
  if (!session.isSuperadmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs items={[{ label: "Laporan Penjualan" }]} />

      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Laporan Penjualan
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Rekapitulasi omset, metode pembayaran, dan produk teh terlaris.
        </p>
      </div>

      <div className="p-12 bg-white rounded-xl border border-slate-200 shadow-xs text-center space-y-3">
        <BarChart3 className="h-12 w-12 text-tea-700 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-900">
          Laporan Omset & Penjualan
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Grafik dan rekapitulasi data penjualan periodik (harian, mingguan, bulanan) khusus untuk Owner.
        </p>
      </div>
    </div>
  );
}


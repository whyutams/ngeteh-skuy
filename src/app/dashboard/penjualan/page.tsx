import { Receipt } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: `Data Penjualan - ${APP_NAME}`,
};

export default function PenjualanPage() {
  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs items={[{ label: "Data Penjualan" }]} />

      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Data Penjualan
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Riwayat seluruh transaksi pesanan kasir dan cetak ulang nota.
        </p>
      </div>

      <div className="p-12 bg-white rounded-xl border border-slate-200 shadow-xs text-center space-y-3">
        <Receipt className="h-12 w-12 text-tea-700 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-900">
          Riwayat Penjualan
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Data transaksi dari modul kasir akan otomatis tercatat dan dapat difilter di sini.
        </p>
      </div>
    </div>
  );
}


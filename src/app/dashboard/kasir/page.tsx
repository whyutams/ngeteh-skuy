import { Calculator } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: `Kasir POS - ${APP_NAME}`,
};

export default function KasirPage() {
  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs items={[{ label: "Kasir" }]} />

      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Kasir
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Layar kasir pemesanan teh dan pencetakan nota pelanggan.
        </p>
      </div>

      <div className="p-12 bg-white rounded-xl border border-slate-200 shadow-xs text-center space-y-3">
        <Calculator className="h-12 w-12 text-tea-700 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-900">
          Kasir Siap Diintegrasikan
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Fitur menu dan kategori telah siap. Kasir akan membaca menu yang telah ditambahkan owner.
        </p>
      </div>
    </div>
  );
}


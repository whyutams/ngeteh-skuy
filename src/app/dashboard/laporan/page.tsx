import { redirect } from "next/navigation";
import { getCurrentSession } from "@/libs/auth-session";
import { getLaporanPenjualanAction } from "@/app/actions/transaksi";
import { LaporanClient } from "@/components/dashboard/laporan/laporan-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Laporan Penjualan",
};

export default async function LaporanPage() {
  const session = await getCurrentSession();

  // Proteksi: Khusus Owner
  if (!session.isSuperadmin) {
    redirect("/dashboard");
  }

  const { data: laporanData } = await getLaporanPenjualanAction();

  return (
    <LaporanClient
      initialData={
        laporanData || {
          totalPendapatan: 0,
          totalTransaksi: 0,
          rataRataTransaksi: 0,
          totalItemTerjual: 0,
          metodeBreakdown: {
            tunai: { total: 0, jumlah: 0 },
            qris: { total: 0, jumlah: 0 },
            transfer: { total: 0, jumlah: 0 },
          },
          produkTerlaris: [],
          transaksiList: [],
        }
      }
    />
  );
}

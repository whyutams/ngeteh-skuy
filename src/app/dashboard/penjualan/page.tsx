import {
  getTransaksiListAction,
  getTodaySalesSummaryAction,
} from "@/app/actions/transaksi";
import { PenjualanClient } from "@/components/dashboard/penjualan/penjualan-client";
import { getTodayDateString } from "@/libs/date";
import { getCurrentSession } from "@/libs/auth-session";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Data Penjualan",
};

export default async function PenjualanPage() {
  const session = await getCurrentSession();
  const todayStr = getTodayDateString();
  const [trxRes, statsRes] = await Promise.all([
    getTransaksiListAction(),
    getTodaySalesSummaryAction(),
  ]);

  return (
    <PenjualanClient
      initialTransactions={trxRes.data || []}
      todayStats={
        statsRes.data || {
          totalOmset: 0,
          totalModal: 0,
          totalKeuntungan: 0,
          marginPersen: 0,
          totalTransaksi: 0,
          totalItemTerjual: 0,
        }
      }
      todayStr={todayStr}
      isOwner={Boolean(session.isSuperadmin)}
    />
  );
}

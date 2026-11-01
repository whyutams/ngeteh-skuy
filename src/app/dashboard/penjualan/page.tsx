import { getTransaksiListAction } from "@/app/actions/transaksi";
import { PenjualanClient } from "@/components/dashboard/penjualan/penjualan-client";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: "Data Penjualan",
};

export default async function PenjualanPage() {
  const { data: transactions } = await getTransaksiListAction();

  return <PenjualanClient initialTransactions={transactions || []} />;
}

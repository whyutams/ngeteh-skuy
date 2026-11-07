"use client";

import { useState } from "react";
import {
  Receipt,
  Search,
  Banknote,
  QrCode,
  CreditCard,
  Eye,
  X,
  Calendar,
  User,
  ShoppingBag,
  Coins,
  CupSoda,
  TrendingUp,
  Calculator,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { MenuImage } from "@/components/ui/menu-image";
import { getTodayDateString, formatDateWita } from "@/libs/date";
import type {
  TransaksiRecord,
  TodaySalesSummary,
} from "@/app/actions/transaksi";

interface PenjualanClientProps {
  initialTransactions: TransaksiRecord[];
  todayStats?: TodaySalesSummary;
  todayStr?: string;
}

export function PenjualanClient({
  initialTransactions,
  todayStats = {
    totalOmset: 0,
    totalModal: 0,
    totalKeuntungan: 0,
    marginPersen: 0,
    totalTransaksi: 0,
    totalItemTerjual: 0,
  },
  todayStr = getTodayDateString(),
}: PenjualanClientProps) {
  const [transactions] = useState<TransaksiRecord[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // modal detail transaksi nota
  const [selectedTrx, setSelectedTrx] = useState<TransaksiRecord | null>(null);

  // filter data transaksi
  const filteredData = transactions.filter((trx) => {
    // filter waktu: default hari ini
    if (dateFilter === "today") {
      const trxDate = formatDateWita(trx.created_at);
      if (trxDate !== todayStr) return false;
    }

    // filter metode pembayaran
    const matchMethod =
      selectedMethod === "all" || trx.metode_pembayaran === selectedMethod;
    if (!matchMethod) return false;

    // filter pencarian teks
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchInvoice = trx.nomor_invoice.toLowerCase().includes(query);
    const matchItems = trx.item_pembelian?.some((item) =>
      item.nama_produk.toLowerCase().includes(query)
    );
    const matchKasir =
      trx.kasir?.full_name?.toLowerCase().includes(query) ||
      trx.kasir?.username.toLowerCase().includes(query);

    return matchInvoice || matchItems || matchKasir;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full">
      {/* breadcrumb navigasi */}
      <Breadcrumbs items={[{ label: "Data Penjualan" }]} />

      {/* header halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Penjualan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat seluruh transaksi pesanan kasir dan cetak rincian nota penjualan.
          </p>
        </div>
      </div>

      {/* ringkasan metrik statistik hari ini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* total omset hari ini */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Omset Hari Ini
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              Rp {todayStats.totalOmset.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Pendapatan kotor penjualan</p>
          </div>
        </div>

        {/* keuntungan bersih hari ini */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Keuntungan Bersih Hari Ini
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">
              Rp {(todayStats.totalKeuntungan ?? 0).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Margin profit:{" "}
              <span className="font-semibold text-emerald-800">
                {todayStats.marginPersen ?? 0}%
              </span>
            </p>
          </div>
        </div>

        {/* total modal HPP hari ini */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Modal (HPP) Hari Ini
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Calculator className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              Rp {(todayStats.totalModal ?? 0).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Biaya pokok menu terjual</p>
          </div>
        </div>

        {/* cup terjual hari ini */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cup Terjual Hari Ini
            </span>
            <div className="p-2 rounded-lg bg-tea-50 text-tea-700">
              <CupSoda className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {todayStats.totalItemTerjual}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dari {todayStats.totalTransaksi} nota selesai
            </p>
          </div>
        </div>
      </div>

      {/* filter & pencarian */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* input pencarian */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Masukkan nomor invoice atau nama menu"
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* filter periode: hari ini (default) & semua */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => {
                  setDateFilter("today");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === "today"
                    ? "bg-tea-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Hari Ini</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  dateFilter === "all"
                    ? "bg-tea-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
            </div>

            {/* filter metode pembayaran */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              {[
                { id: "all", label: "Semua" },
                { id: "tunai", label: "Tunai" },
                { id: "qris", label: "QRIS" },
                { id: "transfer", label: "Transfer" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(m.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMethod === m.id
                      ? "bg-tea-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Data Penjualan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4">Waktu</th>
                <th scope="col" className="py-3 px-4">No. Invoice</th>
                <th scope="col" className="py-3 px-4">Oleh</th>
                <th scope="col" className="py-3 px-4">Menu Dipesan</th>
                <th scope="col" className="py-3 px-4">Metode</th>
                <th scope="col" className="py-3 px-4 text-right">Total Tagihan</th>
                <th scope="col" className="py-3 px-4 text-center">Status</th>
                <th scope="col" className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    Belum ada data transaksi penjualan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Waktu */}
                    <td suppressHydrationWarning className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(trx.created_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* No Invoice */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {trx.nomor_invoice}
                    </td>

                    {/* Oleh */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {trx.kasir?.full_name || "Kasir"}
                    </td>

                    {/* Rangkuman Item */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {trx.item_pembelian && trx.item_pembelian.length > 0 ? (
                        <span>
                          {trx.item_pembelian.map((it) => `${it.nama_produk} (${it.jumlah})`).join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Metode Pembayaran */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {trx.metode_pembayaran === "tunai" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Banknote className="h-3 w-3" /> Tunai
                        </span>
                      )}
                      {trx.metode_pembayaran === "qris" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <QrCode className="h-3 w-3" /> QRIS
                        </span>
                      )}
                      {trx.metode_pembayaran === "transfer" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <CreditCard className="h-3 w-3" /> Transfer
                        </span>
                      )}
                    </td>

                    {/* Total Tagihan */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                      Rp {Number(trx.total_tagihan).toLocaleString("id-ID")}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Selesai
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Tooltip content="Lihat Rincian Nota">
                        <button
                          type="button"
                          onClick={() => setSelectedTrx(trx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-tea-700 bg-tea-50 hover:bg-tea-100 border border-tea-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Universal Wajib Selalu Tampil */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Dialog Rincian Nota Pesanan */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-tea-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Rincian Nota Transaksi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrx(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info Transaksi */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <div>
                <span className="block text-slate-400">Nomor Invoice</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedTrx.nomor_invoice}
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Waktu Pembelian</span>
                <span suppressHydrationWarning className="font-semibold text-slate-800">
                  {new Date(selectedTrx.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Petugas Kasir</span>
                <span className="font-medium text-slate-800">
                  {selectedTrx.kasir?.full_name || "Kasir"}
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Metode Pembayaran</span>
                <span className="font-bold uppercase text-slate-900">
                  {selectedTrx.metode_pembayaran}
                </span>
              </div>
            </div>

            {/* Daftar Produk Dipesan */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Item Pesanan
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                {selectedTrx.item_pembelian && selectedTrx.item_pembelian.length > 0 ? (
                  selectedTrx.item_pembelian.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 rounded-md bg-tea-50 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                          <MenuImage
                            src={it.produk_menu?.gambar_url}
                            alt={it.nama_produk}
                            sizes="36px"
                            iconClassName="h-4 w-4 text-tea-700"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{it.nama_produk}</div>
                          <div className="text-slate-500">
                            {it.jumlah} x Rp {Number(it.harga_satuan).toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        Rp {Number(it.subtotal).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Rincian produk tidak tersedia.
                  </div>
                )}
              </div>
            </div>

            {/* Rekap Finansial */}
            <div className="p-3.5 bg-tea-50/70 border border-tea-200 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-bold text-sm">
                <span>Total Tagihan:</span>
                <span className="text-tea-950">
                  Rp {Number(selectedTrx.total_tagihan).toLocaleString("id-ID")}
                </span>
              </div>
              {selectedTrx.metode_pembayaran === "tunai" && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Uang Diterima:</span>
                    <span>Rp {Number(selectedTrx.uang_diterima).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-tea-200/60">
                    <span>Uang Kembalian:</span>
                    <span>Rp {Number(selectedTrx.uang_kembalian).toLocaleString("id-ID")}</span>
                  </div>
                </>
              )}
            </div>

            {/* Tombol Tutup */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTrx(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


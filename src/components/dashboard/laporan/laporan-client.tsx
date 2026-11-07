"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Calendar,
  CupSoda,
  Calculator,
  TrendingUp,
  Banknote,
  QrCode,
  CreditCard,
  Filter,
  Loader2,
  Receipt,
  Eye,
  X,
  FileSpreadsheet,
  Printer,
  Search,
  Coins,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { MenuImage } from "@/components/ui/menu-image";
import { getTodayDateString, formatDateWita } from "@/libs/date";
import {
  getLaporanPenjualanAction,
  type LaporanSummary,
  type TransaksiRecord,
} from "@/app/actions/transaksi";

interface LaporanClientProps {
  initialData: LaporanSummary;
  initialDate?: string;
}

export function LaporanClient({ initialData, initialDate }: LaporanClientProps) {
  const [data, setData] = useState<LaporanSummary>(initialData);
  const [isPending, startTransition] = useTransition();
  const [printTime, setPrintTime] = useState("");

  useEffect(() => {
    setPrintTime(new Date().toLocaleString("id-ID"));
  }, []);

  // format tanggal yyyy-mm-dd
  const formatDateInput = (d: Date) => formatDateWita(d);
  const todayStr = initialDate || getTodayDateString();

  // state rentang tanggal: default hari ini
  const [activePreset, setActivePreset] = useState<string>("today");
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // tab aktif menu atau transaksi
  const [activeTab, setActiveTab] = useState<"menu" | "transaksi">("menu");

  // pencarian dan pagination menu
  const [menuSearch, setMenuSearch] = useState("");
  const [menuPage, setMenuPage] = useState(1);
  const menuItemsPerPage = 8;

  // pagination transaksi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // modal detail nota transaksi
  const [selectedTrx, setSelectedTrx] = useState<TransaksiRecord | null>(null);

  // filter rentang tanggal
  const applyDateRange = (start: string, end: string, presetName: string) => {
    setActivePreset(presetName);
    setStartDate(start);
    setEndDate(end);

    startTransition(async () => {
      const res = await getLaporanPenjualanAction(
        start || undefined,
        end || undefined
      );
      if (res.success && res.data) {
        setData(res.data);
        setCurrentPage(1);
        setMenuPage(1);
      }
    });
  };

  // preset cepat rentang tanggal
  const handleSelectPreset = (preset: string) => {
    const now = new Date();

    if (preset === "today") {
      const t = formatDateInput(now);
      applyDateRange(t, t, "today");
    } else if (preset === "last7days") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      applyDateRange(formatDateInput(past), formatDateInput(now), "last7days");
    } else if (preset === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      applyDateRange(formatDateInput(firstDay), formatDateInput(now), "thisMonth");
    } else if (preset === "all") {
      applyDateRange("", "", "all");
    }
  };

  // filter tanggal manual
  const handleCustomFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyDateRange(startDate, endDate, "custom");
  };

  // filter dan pagination menu
  const filteredMenuList = (data.produkTerlaris || []).filter((p) => {
    const query = menuSearch.toLowerCase();
    const matchName = p.nama_produk.toLowerCase().includes(query);
    const matchCategory = (p.kategori_nama || "").toLowerCase().includes(query);
    return matchName || matchCategory;
  });
  const totalMenuItems = filteredMenuList.length;
  const totalMenuPages = Math.ceil(totalMenuItems / menuItemsPerPage) || 1;
  const paginatedMenuList = filteredMenuList.slice(
    (menuPage - 1) * menuItemsPerPage,
    menuPage * menuItemsPerPage
  );

  // pagination data transaksi
  const trxList = data.transaksiList || [];
  const totalItems = trxList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTrx = trxList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ekspor laporan ke format Excel
  const handleExportExcel = () => {
    // lembar penjualan menu
    const menuData = [
      ["LAPORAN PENJUALAN & KEUNTUNGAN MENU - NGETEH SKUYY"],
      ["Periode:", startDate && endDate ? `${startDate} s/d ${endDate}` : "Semua Waktu"],
      ["Waktu Ekspor:", new Date().toLocaleString("id-ID")],
      ["Total Omset Penjualan:", `Rp ${data.totalPendapatan.toLocaleString("id-ID")}`],
      ["Total Modal (HPP):", `Rp ${(data.totalModal ?? 0).toLocaleString("id-ID")}`],
      ["Total Keuntungan Bersih (Profit):", `Rp ${(data.totalKeuntungan ?? 0).toLocaleString("id-ID")}`],
      ["Margin Keuntungan Rata-rata:", `${data.marginRataRata ?? 0}%`],
      ["Total Cup Terjual:", `${data.totalItemTerjual} cup`],
      [],
      [
        "No",
        "Nama Menu Seduhan",
        "Kategori",
        "Harga Modal (Rp)",
        "Harga Jual (Rp)",
        "Untung/Cup (Rp)",
        "Cup Terjual",
        "Total Omset (Rp)",
        "Total Modal (Rp)",
        "Keuntungan Bersih (Rp)",
        "Margin (%)",
        "Sisa Stok",
        "Status Stok",
      ],
      ...data.produkTerlaris.map((p, idx) => {
        const untungPerCup = (p.harga || 0) - (p.harga_modal || 0);
        const statusStok =
          (p.stok ?? 0) <= 0
            ? "Habis"
            : (p.stok ?? 0) <= 5
            ? "Menipis"
            : "Aman";

        return [
          idx + 1,
          p.nama_produk,
          p.kategori_nama || "Menu Teh",
          p.harga_modal || 0,
          p.harga || 0,
          untungPerCup,
          p.total_terjual,
          p.total_omset,
          p.total_modal || 0,
          p.total_keuntungan || 0,
          `${p.margin_persen || 0}%`,
          `${p.stok ?? 0} ${p.satuan || "cup"}`,
          statusStok,
        ];
      }),
      [],
      [
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        data.totalItemTerjual,
        data.totalPendapatan,
        data.totalModal || 0,
        data.totalKeuntungan || 0,
        `${data.marginRataRata || 0}%`,
        "",
        "",
      ],
    ];

    // lembar riwayat transaksi
    const transaksiData = [
      [
        "No",
        "Waktu",
        "No Invoice",
        "Kasir",
        "Item Dipesan",
        "Metode Pembayaran",
        "Total Tagihan (Rp)",
        "Status",
      ],
      ...trxList.map((trx, idx) => [
        idx + 1,
        new Date(trx.created_at).toLocaleString("id-ID"),
        trx.nomor_invoice,
        trx.kasir?.full_name || trx.kasir?.username || "Kasir",
        trx.item_pembelian?.map((it) => `${it.nama_produk} (${it.jumlah})`).join("; ") || "-",
        trx.metode_pembayaran.toUpperCase(),
        Number(trx.total_tagihan),
        "SELESAI",
      ]),
    ];

    // lembar metode pembayaran
    const metodeData = [
      ["METODE PEMBAYARAN", "TOTAL OMSET (RP)", "JUMLAH TRANSAKSI"],
      ["Tunai", data.metodeBreakdown.tunai.total, data.metodeBreakdown.tunai.jumlah],
      ["QRIS", data.metodeBreakdown.qris.total, data.metodeBreakdown.qris.jumlah],
      ["Transfer Bank", data.metodeBreakdown.transfer.total, data.metodeBreakdown.transfer.jumlah],
    ];

    const wb = XLSX.utils.book_new();
    const wsMenu = XLSX.utils.aoa_to_sheet(menuData);
    const wsTransaksi = XLSX.utils.aoa_to_sheet(transaksiData);
    const wsMetode = XLSX.utils.aoa_to_sheet(metodeData);

    XLSX.utils.book_append_sheet(wb, wsMenu, "Daftar Penjualan Menu");
    XLSX.utils.book_append_sheet(wb, wsTransaksi, "Riwayat Transaksi");
    XLSX.utils.book_append_sheet(wb, wsMetode, "Metode Pembayaran");

    const fileDate = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Laporan-Penjualan-Keuntungan-Menu-${fileDate}.xlsx`);
  };

  // cetak atau simpan ke PDF
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full">
      {/* tampilan cetak PDF */}
      <div className="print-only">
        {/* header cetak outlet */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-slate-300">
              <Image
                src="/img/logo-web.png"
                alt="Logo Ngeteh Skuyy"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase">
                NGETEH SKUYY
              </h1>
              <p className="text-xs text-slate-600">
                Laporan Performa Penjualan & Keuntungan Menu Seduhan
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">Periode: </span>
              {startDate && endDate ? `${startDate} s/d ${endDate}` : "Semua Waktu"}
            </div>
            <div suppressHydrationWarning>
              <span className="font-semibold text-slate-900">Dicetak: </span>
              {printTime}
            </div>
          </div>
        </div>

        {/* ringkasan metrik */}
        <div className="grid grid-cols-4 gap-3 text-xs mb-6">
          <div className="p-3 border border-slate-300 rounded-lg">
            <div className="text-slate-500 font-medium">Total Omset</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Rp {data.totalPendapatan.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="p-3 border border-slate-300 rounded-lg">
            <div className="text-slate-500 font-medium">Total Modal (HPP)</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Rp {(data.totalModal ?? 0).toLocaleString("id-ID")}
            </div>
          </div>
          <div className="p-3 border border-slate-300 rounded-lg">
            <div className="text-slate-500 font-medium">Keuntungan Bersih (Profit)</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5">
              Rp {(data.totalKeuntungan ?? 0).toLocaleString("id-ID")}
              <span className="text-[11px] font-normal text-slate-500 ml-1">
                ({data.marginRataRata ?? 0}%)
              </span>
            </div>
          </div>
          <div className="p-3 border border-slate-300 rounded-lg">
            <div className="text-slate-500 font-medium">Cup Terjual</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {data.totalItemTerjual} cup
            </div>
          </div>
        </div>

        {/* tabel penjualan menu */}
        <div className="mb-6">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Daftar Penjualan & Keuntungan Seluruh Menu Seduhan
            </h3>
            <p className="text-[11px] text-slate-500">
              Rincian harga modal, harga jual, kuantitas terjual, perolehan omset, keuntungan bersih, dan margin
            </p>
          </div>

          <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="py-2 px-1.5 border-r border-slate-300 text-center w-7">No</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Nama Menu Seduhan</th>
                <th className="py-2 px-2 border-r border-slate-300">Kategori</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right">Modal</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right">Harga Jual</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right">Cup</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right">Total Omset</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right">Total Modal</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right">Keuntungan</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right">Margin</th>
                <th className="py-2 px-2 text-right">Sisa Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.produkTerlaris.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-4 text-center text-slate-400">
                    Belum ada data penjualan menu.
                  </td>
                </tr>
              ) : (
                data.produkTerlaris.map((item, idx) => (
                  <tr key={item.nama_produk} className="hover:bg-slate-50">
                    <td className="py-1.5 px-1.5 border-r border-slate-200 text-center font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-200 font-semibold text-slate-900">
                      {item.nama_produk}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600">
                      {item.kategori_nama || "Menu Teh"}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-right">
                      Rp {(item.harga_modal ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-right">
                      Rp {(item.harga ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-right font-medium">
                      {item.total_terjual}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-right font-semibold text-slate-900">
                      Rp {item.total_omset.toLocaleString("id-ID")}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-right text-slate-600">
                      Rp {(item.total_modal ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-right font-bold text-emerald-800">
                      Rp {(item.total_keuntungan ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-right font-medium">
                      {item.margin_persen ?? 0}%
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      {item.stok ?? 0} {item.satuan || "cup"}
                    </td>
                  </tr>
                ))
              )}
              {/* total penjualan */}
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <td colSpan={5} className="py-2.5 px-2.5 border-r border-slate-300 text-center">
                  TOTAL PENJUALAN & KEUNTUNGAN
                </td>
                <td className="py-2.5 px-2 border-r border-slate-300 text-right">
                  {data.totalItemTerjual}
                </td>
                <td className="py-2.5 px-2 border-r border-slate-300 text-right">
                  Rp {data.totalPendapatan.toLocaleString("id-ID")}
                </td>
                <td className="py-2.5 px-2 border-r border-slate-300 text-right">
                  Rp {(data.totalModal ?? 0).toLocaleString("id-ID")}
                </td>
                <td className="py-2.5 px-2 border-r border-slate-300 text-right text-emerald-800">
                  Rp {(data.totalKeuntungan ?? 0).toLocaleString("id-ID")}
                </td>
                <td className="py-2.5 px-2 border-r border-slate-300 text-right">
                  {data.marginRataRata ?? 0}%
                </td>
                <td className="py-2.5 px-2 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ringkasan metode pembayaran */}
        <div className="print-break-inside-avoid">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Rekapitulasi Metode Pembayaran
            </h3>
          </div>
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="py-2 px-3 border-r border-slate-300">Metode Pembayaran</th>
                <th className="py-2 px-3 border-r border-slate-300 text-right">Jumlah Transaksi</th>
                <th className="py-2 px-3 border-r border-slate-300 text-right">Total Nominal</th>
                <th className="py-2 px-3 text-right">Porsi Omset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 px-3 border-r border-slate-200 font-medium">Tunai (Cash)</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{data.metodeBreakdown.tunai.jumlah} transaksi</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold">Rp {data.metodeBreakdown.tunai.total.toLocaleString("id-ID")}</td>
                <td className="py-2 px-3 text-right">
                  {data.totalPendapatan > 0 ? Math.round((data.metodeBreakdown.tunai.total / data.totalPendapatan) * 100) : 0}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-slate-200 font-medium">QRIS</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{data.metodeBreakdown.qris.jumlah} transaksi</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold">Rp {data.metodeBreakdown.qris.total.toLocaleString("id-ID")}</td>
                <td className="py-2 px-3 text-right">
                  {data.totalPendapatan > 0 ? Math.round((data.metodeBreakdown.qris.total / data.totalPendapatan) * 100) : 0}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-slate-200 font-medium">Transfer Bank</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{data.metodeBreakdown.transfer.jumlah} transaksi</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold">Rp {data.metodeBreakdown.transfer.total.toLocaleString("id-ID")}</td>
                <td className="py-2 px-3 text-right">
                  {data.totalPendapatan > 0 ? Math.round((data.metodeBreakdown.transfer.total / data.totalPendapatan) * 100) : 0}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* antarmuka dashboard */}
      <div className="print-hidden space-y-6">
        {/* navigasi breadcrumbs */}
        <Breadcrumbs items={[{ label: "Laporan Penjualan" }]} />

        {/* header dan tombol ekspor */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Laporan Penjualan & Keuntungan
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Rekapitulasi performa menu, modal HPP, margin, dan keuntungan bersih outlet.
            </p>
          </div>

          {/* tombol ekspor */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4 text-rose-600" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* filter rentang tanggal */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Calendar className="h-4 w-4 text-tea-700" />
            <span>Filter Periode Transaksi</span>
          </div>

          {/* tombol preset tanggal */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { id: "today", label: "Hari Ini" },
              { id: "last7days", label: "7 Hari Terakhir" },
              { id: "thisMonth", label: "Bulan Ini" },
              { id: "all", label: "Semua Waktu" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleSelectPreset(btn.id)}
                disabled={isPending}
                className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                  activePreset === btn.id
                    ? "bg-tea-700 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* input tanggal manual */}
          <form
            onSubmit={handleCustomFilterSubmit}
            className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset("custom");
                }}
                max={todayStr}
                className="bg-slate-50/60 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset("custom");
                }}
                max={todayStr}
                className="bg-slate-50/60 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || (!startDate && !endDate)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-tea-700 hover:bg-tea-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Filter className="h-3.5 w-3.5" />
              )}
              <span>Terapkan Rentang</span>
            </button>
          </form>
        </div>

        {/* ringkasan metrik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* total omset */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Omset
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                Rp {data.totalPendapatan.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Pendapatan kotor penjualan</p>
            </div>
          </div>

          {/* keuntungan bersih */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Keuntungan Bersih
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Coins className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700">
                Rp {(data.totalKeuntungan ?? 0).toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Margin profit: <span className="font-semibold text-emerald-800">{data.marginRataRata ?? 0}%</span>
              </p>
            </div>
          </div>

          {/* total modal HPP */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Modal (HPP)
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <Calculator className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                Rp {(data.totalModal ?? 0).toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Biaya pokok menu terjual</p>
            </div>
          </div>

          {/* cup terjual */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cup Terjual
              </span>
              <div className="p-2 rounded-lg bg-tea-50 text-tea-700">
                <CupSoda className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {data.totalItemTerjual}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Dari {data.totalTransaksi} nota selesai</p>
            </div>
          </div>
        </div>

        {/* rincian metode pembayaran dan menu terlaris */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* metode pembayaran */}
          <div className="lg:col-span-5 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Metode Pembayaran
            </h3>

            <div className="space-y-3">
              {/* tunai */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Tunai</div>
                    <div className="text-xs text-slate-500">
                      {data.metodeBreakdown.tunai.jumlah} transaksi
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">
                    Rp {data.metodeBreakdown.tunai.total.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {data.totalPendapatan > 0
                      ? Math.round((data.metodeBreakdown.tunai.total / data.totalPendapatan) * 100)
                      : 0}
                    % dari omset
                  </div>
                </div>
              </div>

              {/* QRIS */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">QRIS</div>
                    <div className="text-xs text-slate-500">
                      {data.metodeBreakdown.qris.jumlah} transaksi
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">
                    Rp {data.metodeBreakdown.qris.total.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {data.totalPendapatan > 0
                      ? Math.round((data.metodeBreakdown.qris.total / data.totalPendapatan) * 100)
                      : 0}
                    % dari omset
                  </div>
                </div>
              </div>

              {/* transfer */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Transfer Bank</div>
                    <div className="text-xs text-slate-500">
                      {data.metodeBreakdown.transfer.jumlah} transaksi
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">
                    Rp {data.metodeBreakdown.transfer.total.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {data.totalPendapatan > 0
                      ? Math.round((data.metodeBreakdown.transfer.total / data.totalPendapatan) * 100)
                      : 0}
                    % dari omset
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* menu terlaris */}
          <div className="lg:col-span-7 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Highlight Menu Terlaris
              </h3>
              <span className="text-xs text-slate-500">Peringkat 5 teratas</span>
            </div>

            {data.produkTerlaris.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                Belum ada penjualan menu pada rentang waktu ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-2">
                {data.produkTerlaris.slice(0, 5).map((item, idx) => (
                  <div key={item.nama_produk} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800"
                            : idx === 1
                            ? "bg-slate-200 text-slate-800"
                            : idx === 2
                            ? "bg-amber-50 text-amber-900"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-tea-50 border border-slate-200 shrink-0 flex items-center justify-center">
                        <MenuImage
                          src={item.gambar_url}
                          alt={item.nama_produk}
                          sizes="40px"
                          iconClassName="h-4 w-4 text-tea-700"
                        />
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold text-slate-900">
                          {item.nama_produk}
                        </h5>
                        <span className="text-xs text-slate-500">
                          {item.total_terjual} cup terjual
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-xs">
                        Rp {item.total_omset.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Untung: Rp {(item.total_keuntungan ?? 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* tab menu dan transaksi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* pilihan tab */}
          <div className="border-b border-slate-200 px-5 pt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("menu")}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "menu"
                    ? "border-tea-700 text-tea-800"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <CupSoda className="h-4 w-4" />
                <span>Daftar Penjualan & Keuntungan Menu</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-tea-50 text-tea-800 border border-tea-200">
                  {data.produkTerlaris.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transaksi")}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "transaksi"
                    ? "border-tea-700 text-tea-800"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Receipt className="h-4 w-4" />
                <span>Riwayat Transaksi Nota</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                  {totalItems}
                </span>
              </button>
            </div>

            {/* pencarian menu */}
            {activeTab === "menu" && (
              <div className="pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama menu / kategori..."
                    value={menuSearch}
                    onChange={(e) => {
                      setMenuSearch(e.target.value);
                      setMenuPage(1);
                    }}
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* tabel penjualan menu */}
          {activeTab === "menu" && (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="py-3 px-3 w-10 text-center">No</th>
                      <th scope="col" className="py-3 px-4">Menu Seduhan</th>
                      <th scope="col" className="py-3 px-3">Kategori</th>
                      <th scope="col" className="py-3 px-3 text-right">Modal</th>
                      <th scope="col" className="py-3 px-3 text-right">Harga Jual</th>
                      <th scope="col" className="py-3 px-3 text-right">Cup</th>
                      <th scope="col" className="py-3 px-3 text-right">Total Omset</th>
                      <th scope="col" className="py-3 px-3 text-right">Keuntungan</th>
                      <th scope="col" className="py-3 px-3 text-right">Margin</th>
                      <th scope="col" className="py-3 px-3 text-center">Status Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedMenuList.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-10 text-center text-slate-400">
                          Tidak ada menu seduhan yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      paginatedMenuList.map((item, idx) => {
                        const globalIndex = (menuPage - 1) * menuItemsPerPage + idx + 1;
                        const sisaStok = item.stok ?? 0;
                        const isHabis = sisaStok <= 0;
                        const isMenipis = sisaStok > 0 && sisaStok <= 5;

                        return (
                          <tr key={item.nama_produk} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 text-center text-xs text-slate-500 font-medium">
                              {globalIndex}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-tea-50 border border-slate-200 shrink-0 flex items-center justify-center">
                                  <MenuImage
                                    src={item.gambar_url}
                                    alt={item.nama_produk}
                                    sizes="40px"
                                    iconClassName="h-4 w-4 text-tea-700"
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">
                                    {item.nama_produk}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Stok: {sisaStok} {item.satuan || "cup"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {item.kategori_nama || "Menu Teh"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-xs text-slate-600 whitespace-nowrap">
                              Rp {(item.harga_modal ?? 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-3 text-right text-xs text-slate-900 font-medium whitespace-nowrap">
                              Rp {(item.harga ?? 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                              {item.total_terjual} <span className="text-xs font-normal text-slate-500">cup</span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                              Rp {item.total_omset.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                              Rp {(item.total_keuntungan ?? 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-3 text-right text-xs font-semibold text-tea-800 whitespace-nowrap">
                              {item.margin_persen ?? 0}%
                            </td>
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  isHabis
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : isMenipis
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {isHabis ? "Habis" : isMenipis ? "Menipis" : "Tersedia"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* pagination menu */}
              <Pagination
                currentPage={menuPage}
                totalPages={totalMenuPages}
                totalItems={totalMenuItems}
                itemsPerPage={menuItemsPerPage}
                onPageChange={setMenuPage}
              />
            </div>
          )}

          {/* tabel transaksi */}
          {activeTab === "transaksi" && (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="py-3 px-4">Waktu</th>
                      <th scope="col" className="py-3 px-4">No. Invoice</th>
                      <th scope="col" className="py-3 px-4">Oleh</th>
                      <th scope="col" className="py-3 px-4">Metode</th>
                      <th scope="col" className="py-3 px-4 text-right">Total Tagihan</th>
                      <th scope="col" className="py-3 px-4 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTrx.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          Tidak ada transaksi pada rentang waktu yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      paginatedTrx.map((trx) => (
                        <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td suppressHydrationWarning className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(trx.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                            {trx.nomor_invoice}
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                            {trx.kasir?.full_name || "Kasir"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-xs font-medium uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {trx.metode_pembayaran}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                            Rp {Number(trx.total_tagihan).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
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

              {/* pagination transaksi */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* modal rincian nota */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 print-hidden">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* header modal */}
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

            {/* info transaksi */}
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

            {/* item pesanan */}
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

            {/* total tagihan */}
            <div className="p-3.5 bg-tea-50/70 border border-tea-200 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-bold text-sm">
                <span>Total Tagihan:</span>
                <span className="text-tea-950">
                  Rp {Number(selectedTrx.total_tagihan).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* tombol tutup */}
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

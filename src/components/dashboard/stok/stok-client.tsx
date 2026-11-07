"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuImage } from "@/components/ui/menu-image";
import {
  Boxes,
  PlusCircle,
  History,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  CupSoda,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import type { StokLogItem } from "@/app/actions/stok";
import type { MenuItem } from "@/app/actions/menu";

interface StokClientProps {
  products: MenuItem[];
  initialLogs: StokLogItem[];
  isOwner: boolean;
  statusParam?: string;
}

export function StokClient({
  products,
  initialLogs,
  isOwner,
  statusParam,
}: StokClientProps) {
  // pesan notifikasi sukses
  const [notificationMessage, setNotificationMessage] = useState<string | null>(() => {
    if (statusParam === "adjusted") return "Penyesuaian stok berhasil disimpan.";
    return null;
  });

  useEffect(() => {
    if (statusParam) {
      window.history.replaceState({}, "", "/dashboard/stok");
    }
  }, [statusParam]);

  const [productList] = useState<MenuItem[]>(products);
  const [logList] = useState<StokLogItem[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<"stok" | "riwayat">("stok");

  // Pencarian
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination Tab Stok
  const [stokPage, setStokPage] = useState(1);
  const stokPerPage = 8;

  // Pagination Tab Riwayat
  const [logPage, setLogPage] = useState(1);
  const logPerPage = 8;

  // Filter Data Stok
  const filteredProducts = productList.filter((p) =>
    p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStokItems = filteredProducts.length;
  const totalStokPages = Math.ceil(totalStokItems / stokPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (stokPage - 1) * stokPerPage,
    stokPage * stokPerPage
  );

  // Pagination Riwayat
  const totalLogItems = logList.length;
  const totalLogPages = Math.ceil(totalLogItems / logPerPage) || 1;
  const paginatedLogs = logList.slice(
    (logPage - 1) * logPerPage,
    logPage * logPerPage
  );

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Navigasi */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Kelola Stok" },
        ]}
      />

      {/* notifikasi sukses aksi crud */}
      {notificationMessage && (
        <AlertBanner
          message={notificationMessage}
          onClose={() => setNotificationMessage(null)}
        />
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kelola Stok Seduhan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring ketersediaan bahan, sisa porsi menu, dan catatan mutasi.
          </p>
        </div>

        {isOwner && (
          <Link
            href="/dashboard/stok/penyesuaian"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Penyesuaian Stok</span>
          </Link>
        )}
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("stok")}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "stok"
              ? "border-tea-700 text-tea-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Status Sisa Stok</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("riwayat")}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "riwayat"
              ? "border-tea-700 text-tea-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Riwayat Mutasi Stok</span>
        </button>
      </div>

      {/* Konten Tab 1: Status Sisa Stok */}
      {activeTab === "stok" && (
        <div className="space-y-4">
          {/* Pencarian Menu */}
          <div className="relative p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setStokPage(1);
              }}
              placeholder="Masukkan nama menu"
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors"
            />
          </div>

          {/* Tabel Stok Produk */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="py-3 px-4">Nama Menu</th>
                    <th scope="col" className="py-3 px-4">Kategori</th>
                    <th scope="col" className="py-3 px-4">Jumlah Stok</th>
                    <th scope="col" className="py-3 px-4">Satuan</th>
                    <th scope="col" className="py-3 px-4">Kondisi</th>
                    {isOwner && (
                      <th scope="col" className="py-3 px-4 text-right w-28">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={isOwner ? 6 : 5} className="py-12 text-center text-slate-400">
                        <Boxes className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        Belum ada data stok produk.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-tea-50 border border-slate-200 shrink-0 flex items-center justify-center">
                              <MenuImage
                                src={p.gambar_url}
                                alt={p.nama_produk}
                                sizes="40px"
                                iconClassName="h-5 w-5 text-tea-700"
                              />
                            </div>
                            <span className="font-semibold text-slate-900">{p.nama_produk}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {p.kategori_menu?.nama_kategori || "-"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <span
                            className={
                              p.stok === 0
                                ? "text-rose-600"
                                : p.stok <= 5
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }
                          >
                            {p.stok}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{p.satuan}</td>
                        <td className="py-3.5 px-4">
                          {p.stok === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              Habis
                            </span>
                          ) : p.stok <= 5 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Menipis
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aman
                            </span>
                          )}
                        </td>
                        {isOwner && (
                          <td className="py-3.5 px-4 text-right">
                            <Tooltip content="Sesuaikan Stok">
                              <Link
                                href={`/dashboard/stok/penyesuaian?produk_id=${p.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-tea-700 bg-tea-50 hover:bg-tea-100 border border-tea-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <RefreshCw className="h-3 w-3" />
                                <span>Mutasi</span>
                              </Link>
                            </Tooltip>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Universal Wajib Selalu Tampil */}
            <Pagination
              currentPage={stokPage}
              totalPages={totalStokPages}
              totalItems={totalStokItems}
              itemsPerPage={stokPerPage}
              onPageChange={setStokPage}
            />
          </div>
        </div>
      )}

      {/* Konten Tab 2: Riwayat Mutasi Stok */}
      {activeTab === "riwayat" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="py-3 px-4">Waktu</th>
                  <th scope="col" className="py-3 px-4">Produk Menu</th>
                  <th scope="col" className="py-3 px-4">Tipe Mutasi</th>
                  <th scope="col" className="py-3 px-4">Jumlah</th>
                  <th scope="col" className="py-3 px-4">Sebelum / Sesudah</th>
                  <th scope="col" className="py-3 px-4">Catatan</th>
                  <th scope="col" className="py-3 px-4">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <History className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      Belum ada riwayat mutasi stok.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td suppressHydrationWarning className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-tea-50 border border-slate-200 shrink-0 flex items-center justify-center">
                            <MenuImage
                              src={log.produk_menu?.gambar_url}
                              alt={log.produk_menu?.nama_produk || "Menu"}
                              sizes="32px"
                              iconClassName="h-4 w-4 text-tea-700"
                            />
                          </div>
                          <span>{log.produk_menu?.nama_produk || "Produk"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {log.tipe_mutasi === "masuk" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowUpCircle className="h-3 w-3" /> Masuk
                          </span>
                        )}
                        {log.tipe_mutasi === "keluar" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <ArrowDownCircle className="h-3 w-3" /> Keluar
                          </span>
                        )}
                        {log.tipe_mutasi === "penjualan" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Penjualan
                          </span>
                        )}
                        {log.tipe_mutasi === "penyesuaian" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Penyesuaian
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.tipe_mutasi === "keluar" || log.tipe_mutasi === "penjualan"
                          ? `-${log.jumlah}`
                          : `+${log.jumlah}`}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {log.stok_sebelum} &rarr; <span className="font-semibold">{log.stok_sesudah}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {log.catatan || "-"}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {log.profil_pengguna?.full_name || log.profil_pengguna?.username || "Admin"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Universal Wajib Selalu Tampil */}
          <Pagination
            currentPage={logPage}
            totalPages={totalLogPages}
            totalItems={totalLogItems}
            itemsPerPage={logPerPage}
            onPageChange={setLogPage}
          />
        </div>
      )}
    </div>
  );
}

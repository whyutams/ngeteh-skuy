"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuImage } from "@/components/ui/menu-image";
import {
  Plus,
  Pencil,
  Trash,
  CupSoda,
  Search,
  Filter,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Pagination } from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { APP_NAME } from "@/libs/constants";
import {
  deleteMenuAction,
  type MenuItem,
} from "@/app/actions/menu";
import type { KategoriItem } from "@/app/actions/kategori";

interface MenuClientProps {
  initialMenus: MenuItem[];
  categories: KategoriItem[];
  isOwner: boolean;
}

export function MenuClient({ initialMenus, categories, isOwner }: MenuClientProps) {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Eksekusi Hapus Menu
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const res = await deleteMenuAction(deleteTarget.id);
    setIsDeleting(false);

    if (res.success) {
      setMenus((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  // Filter Data Menu
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.nama_produk
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || menu.kategori_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Kalkulasi Pagination
  const totalItems = filteredMenus.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedItems = filteredMenus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Navigasi */}
      <Breadcrumbs items={[{ label: "Data Menu Seduhan" }]} />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Menu Seduhan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh racikan minuman {APP_NAME}.
          </p>
        </div>

        {isOwner && (
          <Link
            href="/dashboard/menu/tambah"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Menu</span>
          </Link>
        )}
      </div>

      {/* Filter & Kontrol Pencarian */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Masukkan nama menu"
            className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-40 bg-slate-50/60 border border-slate-200 rounded-lg py-2 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent cursor-pointer"
          >
            <option value="all" className="text-xs py-1">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="text-xs py-1">
                {c.nama_kategori}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Data Menu */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4">Nama Menu</th>
                <th scope="col" className="py-3 px-4">Kategori</th>
                {isOwner && (
                  <th scope="col" className="py-3 px-4 text-right">Harga Modal</th>
                )}
                <th scope="col" className="py-3 px-4 text-right">Harga Jual</th>
                {isOwner && (
                  <th scope="col" className="py-3 px-4 text-right">Untung / Cup</th>
                )}
                <th scope="col" className="py-3 px-4">Sisa Stok</th>
                <th scope="col" className="py-3 px-4">Status</th>
                {isOwner && (
                  <th scope="col" className="py-3 px-4 text-right w-28">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={isOwner ? 8 : 5} className="py-12 text-center text-slate-400">
                    <CupSoda className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    Belum ada menu yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs flex items-center justify-center">
                          <MenuImage
                            src={item.gambar_url}
                            alt={item.nama_produk}
                            sizes="44px"
                            iconClassName="h-5 w-5 text-tea-700"
                          />
                        </div>
                        <span className="truncate">{item.nama_produk}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200">
                        {item.kategori_menu?.nama_kategori || "Tanpa Kategori"}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-3.5 px-4 text-right text-xs text-slate-500 whitespace-nowrap">
                        Rp {(item.harga_modal ?? 0).toLocaleString("id-ID")}
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900 whitespace-nowrap">
                      Rp {item.harga.toLocaleString("id-ID")}
                    </td>
                    {isOwner && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-semibold text-emerald-700 text-xs">
                          Rp {(item.harga - (item.harga_modal ?? 0)).toLocaleString("id-ID")}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          item.stok <= 5
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {item.stok} {item.satuan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          item.status_aktif
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {item.status_aktif ? "Tersedia" : "Nonaktif"}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip content="Ubah Menu">
                            <Link
                              href={`/dashboard/menu/${item.id}/edit`}
                              className="inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-tea-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Tooltip>
                          <Tooltip content="Hapus Menu">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Wajib Selalu Tampil */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Konfirmasi Hapus (Hanya untuk dialog konfirmasi) */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Menu Seduhan"
        description={`Apakah Anda yakin ingin menghapus menu "${deleteTarget?.nama_produk}"? Data transaksi yang telah selesai akan tetap tersimpan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        icon={<Trash className="h-6 w-6 text-rose-600" />}
      />
    </div>
  );
}

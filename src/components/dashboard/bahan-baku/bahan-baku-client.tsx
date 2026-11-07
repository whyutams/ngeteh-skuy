"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash, Package, AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Tooltip } from "@/components/ui/tooltip";
import { AlertBanner } from "@/components/ui/alert-banner";
import { DEFAULT_OWNER_NAME } from "@/libs/constants";
import {
  deleteBahanBakuAction,
} from "@/app/actions/bahan-baku";
import type { BahanBakuRecord } from "@/libs/bahan-baku-store";

interface BahanBakuClientProps {
  initialData: BahanBakuRecord[];
  userRole: "superadmin" | "karyawan";
  statusParam?: string;
}

export function BahanBakuClient({
  initialData,
  userRole,
  statusParam,
}: BahanBakuClientProps) {
  const router = useRouter();
  const isOwner = userRole === "superadmin";

  // pesan notifikasi sukses
  const [notificationMessage, setNotificationMessage] = useState<string | null>(() => {
    if (statusParam === "created") return "Bahan baku berhasil ditambahkan.";
    if (statusParam === "updated") return "Bahan baku berhasil diperbarui.";
    return null;
  });

  useEffect(() => {
    if (statusParam) {
      window.history.replaceState({}, "", "/dashboard/bahan-baku");
    }
  }, [statusParam]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // modal konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState<BahanBakuRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // filter data bahan baku
  const filteredItems = useMemo(() => {
    return initialData.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.nama_bahan.toLowerCase().includes(q) ||
        item.satuan.toLowerCase().includes(q)
      );
    });
  }, [initialData, searchQuery]);

  // kalkulasi pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMsg(null);

    const res = await deleteBahanBakuAction(deleteTarget.id);
    setIsDeleting(false);

    if (res.success) {
      setDeleteTarget(null);
      setNotificationMessage("Bahan baku berhasil dihapus.");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Gagal menghapus bahan baku.");
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* breadcrumbs */}
      <Breadcrumbs items={[{ label: "Bahan Baku" }]} />

      {/* notifikasi sukses aksi crud */}
      {notificationMessage && (
        <AlertBanner
          message={notificationMessage}
          onClose={() => setNotificationMessage(null)}
        />
      )}

      {/* header halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kelola Bahan Baku
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Persediaan bahan baku seduhan, perasa, sirup, topping, dan kemasan outlet.
          </p>
        </div>

        {isOwner && (
          <Link
            href="/dashboard/bahan-baku/tambah"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Bahan Baku</span>
          </Link>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* panel tabel data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* filter dan pencarian */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari bahan baku atau satuan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total {totalItems} bahan baku terdaftar
          </div>
        </div>

        {/* tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/75 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Bahan Baku</th>
                <th className="py-3 px-4">Sisa Stok</th>
                <th className="py-3 px-4">Satuan</th>
                <th className="py-3 px-4">Terakhir Diperbarui</th>
                <th className="py-3 px-4">Oleh</th>
                {isOwner && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={isOwner ? 7 : 6}
                    className="py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-slate-300" />
                      <p>Tidak ada data bahan baku ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isLow = Number(item.stok) <= 5;
                  const isWarning = Number(item.stok) > 5 && Number(item.stok) <= 20;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-medium text-slate-500">
                        {itemIndex}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.nama_bahan}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isLow
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isWarning
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {Number(item.stok).toLocaleString("id-ID")} {item.satuan}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.satuan}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                        {DEFAULT_OWNER_NAME}
                      </td>
                      {isOwner && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip content="Ubah Bahan Baku">
                              <Link
                                href={`/dashboard/bahan-baku/${item.id}/edit`}
                                className="inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-tea-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Tooltip>

                            <Tooltip content="Hapus Bahan Baku">
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* pagination wajib selalu tampil */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* modal konfirmasi hapus */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Bahan Baku"
        description={`Apakah Anda yakin ingin menghapus bahan baku "${deleteTarget?.nama_bahan}"? Data resep menu yang menggunakan bahan ini juga akan terhapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}


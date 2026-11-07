"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash, FolderTree } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Pagination } from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { APP_NAME, DEFAULT_OWNER_NAME } from "@/libs/constants";
import {
  deleteKategoriAction,
  type KategoriItem,
} from "@/app/actions/kategori";

interface KategoriClientProps {
  initialData: KategoriItem[];
  statusParam?: string;
}

export function KategoriClient({ initialData, statusParam }: KategoriClientProps) {
  const [items, setItems] = useState<KategoriItem[]>(initialData);

  // pesan notifikasi sukses
  const [notificationMessage, setNotificationMessage] = useState<string | null>(() => {
    if (statusParam === "created") return "Kategori menu berhasil ditambahkan.";
    if (statusParam === "updated") return "Kategori menu berhasil diperbarui.";
    return null;
  });

  useEffect(() => {
    if (statusParam) {
      window.history.replaceState({}, "", "/dashboard/kategori");
    }
  }, [statusParam]);

  // Modal konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState<KategoriItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Eksekusi hapus kategori
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const res = await deleteKategoriAction(deleteTarget.id);
    setIsDeleting(false);

    if (res.success) {
      setItems((prev) => prev.filter((k) => k.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotificationMessage("Kategori menu berhasil dihapus.");
    }
  };

  // Kalkulasi data halaman
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full">
      {/* breadcrumb navigasi */}
      <Breadcrumbs items={[{ label: "Kategori Menu" }]} />

      {/* notifikasi sukses aksi crud */}
      {notificationMessage && (
        <AlertBanner
          message={notificationMessage}
          onClose={() => setNotificationMessage(null)}
        />
      )}

      {/* panel header halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kategori Menu
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola pengelompokan menu seduhan {APP_NAME}.
          </p>
        </div>

        {/* Tombol Tambah Kategori Mengarah ke Halaman Tersendiri */}
        <Link
          href="/dashboard/kategori/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kategori</span>
        </Link>
      </div>

      {/* Tabel Data Kategori */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4 w-20">Urutan</th>
                <th scope="col" className="py-3 px-4">Nama Kategori</th>
                <th scope="col" className="py-3 px-4">Jumlah Menu</th>
                <th scope="col" className="py-3 px-4">Dibuat</th>
                <th scope="col" className="py-3 px-4">Oleh</th>
                <th scope="col" className="py-3 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FolderTree className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    Belum ada kategori menu. Klik tombol Tambah Kategori di atas.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.urutan}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {item.nama_kategori}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tea-50 text-tea-800 border border-tea-200">
                        {item.total_produk || 0} menu
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {DEFAULT_OWNER_NAME}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Tombol Ubah Mengarah ke Halaman Tersendiri */}
                        <Tooltip content="Ubah Kategori">
                          <Link
                            href={`/dashboard/kategori/${item.id}/edit`}
                            className="inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-tea-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Tooltip>
                        <Tooltip content="Hapus Kategori">
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

      {/* Modal Konfirmasi Hapus (Hanya untuk dialog konfirmasi destruktif) */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori Menu"
        description={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.nama_kategori}"? Menu yang terhubung akan kehilangan tautan kategori.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        icon={<Trash className="h-6 w-6 text-rose-600" />}
      />
    </div>
  );
}

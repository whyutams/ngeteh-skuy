"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserPlus,
  Users,
  KeyRound,
  ShieldAlert,
  Search,
  Trash2,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Pagination } from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { APP_NAME, DEFAULT_OWNER_NAME } from "@/libs/constants";
import {
  toggleStatusKaryawanAction,
  deleteKaryawanAction,
  type KaryawanItem,
} from "@/app/actions/karyawan";

interface KaryawanClientProps {
  initialData: KaryawanItem[];
  statusParam?: string;
}

export function KaryawanClient({ initialData, statusParam }: KaryawanClientProps) {
  const [employees, setEmployees] = useState<KaryawanItem[]>(initialData);

  // pesan notifikasi sukses
  const [notificationMessage, setNotificationMessage] = useState<string | null>(() => {
    if (statusParam === "created") return "Karyawan berhasil ditambahkan.";
    if (statusParam === "reset") return "Password karyawan berhasil direset.";
    return null;
  });

  useEffect(() => {
    if (statusParam) {
      window.history.replaceState({}, "", "/dashboard/karyawan");
    }
  }, [statusParam]);

  // Pencarian
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Konfirmasi Toggle Status
  const [statusTarget, setStatusTarget] = useState<KaryawanItem | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // modal konfirmasi hapus karyawan
  const [deleteTarget, setDeleteTarget] = useState<KaryawanItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // hapus akun karyawan
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const res = await deleteKaryawanAction(
      deleteTarget.id,
      deleteTarget.username
    );
    setIsDeleting(false);

    if (res.success) {
      setEmployees((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotificationMessage("Karyawan berhasil dihapus.");
    } else {
      alert(res.error || "Gagal menghapus karyawan.");
    }
  };

  // Toggle Status Aktif/Nonaktif
  const handleConfirmToggleStatus = async () => {
    if (!statusTarget) return;

    setIsTogglingStatus(true);
    const nextStatus = !statusTarget.is_active;
    const res = await toggleStatusKaryawanAction(statusTarget.id, statusTarget.is_active);
    setIsTogglingStatus(false);

    if (res.success) {
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === statusTarget.id
            ? { ...item, is_active: nextStatus }
            : item
        )
      );
      setStatusTarget(null);
      setNotificationMessage(
        nextStatus
          ? "Akun karyawan berhasil diaktifkan."
          : "Akun karyawan berhasil dinonaktifkan."
      );
    }
  };

  // Filter Data
  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    const matchName = (emp.full_name || "").toLowerCase().includes(query);
    const matchUser = emp.username.toLowerCase().includes(query);
    const matchEmail = (emp.email || "").toLowerCase().includes(query);
    return matchName || matchUser || matchEmail;
  });

  // Hitung Pagination
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Jejak Navigasi Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Kelola Karyawan" },
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
            Kelola Karyawan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Daftarkan akun karyawan baru {APP_NAME}
          </p>
        </div>

        <Link
          href="/dashboard/karyawan/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Karyawan</span>
        </Link>
      </div>

      {/* Kontrol Pencarian */}
      <div className="relative p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Masukkan nama atau username"
          className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors"
        />
      </div>

      {/* Tabel Data Karyawan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4">Nama Lengkap</th>
                <th scope="col" className="py-3 px-4">Username</th>
                <th scope="col" className="py-3 px-4">Status Akun</th>
                <th scope="col" className="py-3 px-4">Tanggal Dibuat</th>
                <th scope="col" className="py-3 px-4">Oleh</th>
                <th scope="col" className="py-3 px-4 text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    Belum ada akun karyawan. Klik Tambah Karyawan untuk menambahkan.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {emp.full_name || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{emp.username}</div>
                      {emp.email && !emp.email.endsWith("@ngeteh-skuyy.internal") && (
                        <div className="text-xs text-slate-400">{emp.email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {emp.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(emp.created_at).toLocaleDateString("id-ID", {
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
                        <Tooltip content="Reset Password">
                          <Link
                            href={`/dashboard/karyawan/${emp.id}/reset-password`}
                            className="inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Link>
                        </Tooltip>

                        <Tooltip content={emp.is_active ? "Nonaktifkan Akun" : "Aktifkan Akun"}>
                          <button
                            type="button"
                            onClick={() => setStatusTarget(emp)}
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                              emp.is_active
                                ? "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Hapus Karyawan">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(emp)}
                            className="inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modal Konfirmasi Toggle Status Aktif / Nonaktif */}
      <ConfirmModal
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmToggleStatus}
        title={statusTarget?.is_active ? "Nonaktifkan Karyawan" : "Aktifkan Karyawan"}
        description={
          statusTarget?.is_active
            ? `Apakah Anda yakin ingin menonaktifkan akun "${statusTarget?.username}"? Karyawan tidak akan bisa login ke sistem.`
            : `Apakah Anda yakin ingin mengaktifkan kembali akun "${statusTarget?.username}"?`
        }
        confirmText={statusTarget?.is_active ? "Nonaktifkan" : "Aktifkan"}
        cancelText="Batal"
        variant={statusTarget?.is_active ? "danger" : "primary"}
        isLoading={isTogglingStatus}
        icon={<ShieldAlert className={`h-6 w-6 ${statusTarget?.is_active ? "text-rose-600" : "text-tea-700"}`} />}
      />

      {/* Modal Konfirmasi Hapus Karyawan dengan Ketik Username */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Karyawan"
        description={`Tindakan ini tidak dapat dibatalkan. Seluruh akses login dan data akun karyawan "${deleteTarget?.username}" akan dihapus permanen dari sistem.`}
        confirmText="Hapus Karyawan"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        confirmMatchValue={deleteTarget?.username}
        confirmInputPlaceholder={`Ketik "${deleteTarget?.username}"`}
        icon={<Trash2 className="h-6 w-6 text-rose-600" />}
      />
    </div>
  );
}

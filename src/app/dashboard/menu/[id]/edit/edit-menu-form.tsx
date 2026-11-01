"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { updateMenuAction, type MenuActionResult, type MenuItem } from "@/app/actions/menu";
import type { KategoriItem } from "@/app/actions/kategori";

interface EditMenuFormProps {
  initialData: MenuItem;
  categories: KategoriItem[];
}

export function EditMenuForm({ initialData, categories }: EditMenuFormProps) {
  const router = useRouter();
  const [namaProduk, setNamaProduk] = useState(initialData.nama_produk);
  const [kategoriId, setKategoriId] = useState(initialData.kategori_id || "");
  const [harga, setHarga] = useState(String(initialData.harga));
  const [satuan, setSatuan] = useState(initialData.satuan);
  const [statusAktif, setStatusAktif] = useState(initialData.status_aktif);

  const [formState, setFormState] = useState<MenuActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSubmittable = namaProduk.trim().length >= 2 && Number(harga) > 0 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    setFormState(null);
    startTransition(async () => {
      const res = await updateMenuAction(initialData.id, {
        nama_produk: namaProduk.trim(),
        kategori_id: kategoriId || null,
        harga: Number(harga),
        satuan: satuan.trim() || "porsi",
        stok: initialData.stok,
        status_aktif: statusAktif,
      });

      if (res.success) {
        router.push("/dashboard/menu");
        router.refresh();
      } else {
        setFormState(res);
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Navigasi */}
      <Breadcrumbs
        items={[
          { label: "Data Menu", href: "/dashboard/menu" },
          { label: "Ubah Menu" },
        ]}
      />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ubah Data Menu
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Perbarui nama menu, harga jual, kelompok kategori, atau status keaktifan menu.
          </p>
        </div>

        <Link
          href="/dashboard/menu"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Kontainer Form Proporsional */}
      <div className="max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          {formState?.error && (
            <div className="flex items-center gap-2 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formState.error}</span>
            </div>
          )}

          {/* Nama Menu */}
          <div className="space-y-1.5">
            <label htmlFor="nama_produk" className="block text-sm font-medium text-slate-700">
              Nama Menu <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              id="nama_produk"
              name="nama_produk"
              type="text"
              value={namaProduk}
              onChange={(e) => setNamaProduk(e.target.value)}
              placeholder="Masukkan nama menu"
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
            {formState?.fieldErrors?.nama_produk && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.nama_produk[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Kategori */}
            <div className="space-y-1.5">
              <label htmlFor="kategori_id" className="block text-sm font-medium text-slate-700">
                Kategori
              </label>
              <select
                id="kategori_id"
                name="kategori_id"
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
              {formState?.fieldErrors?.kategori_id && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.kategori_id[0]}
                </p>
              )}
            </div>

            {/* Harga Jual */}
            <div className="space-y-1.5">
              <label htmlFor="harga" className="block text-sm font-medium text-slate-700">
                Harga Jual (Rp) <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="harga"
                name="harga"
                type="number"
                min={0}
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="Masukkan harga"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              {formState?.fieldErrors?.harga && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.harga[0]}
                </p>
              )}
            </div>

            {/* Satuan */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="satuan" className="block text-sm font-medium text-slate-700">
                Satuan <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="satuan"
                name="satuan"
                type="text"
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                placeholder="Masukkan satuan"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              {formState?.fieldErrors?.satuan && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.satuan[0]}
                </p>
              )}
            </div>
          </div>

          {/* Status Ketersediaan */}
          <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Status Menu Aktif</p>
              <p className="text-xs text-slate-500">
                Menu aktif akan langsung tersedia dan tampil di halaman kasir POS.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={statusAktif}
                onChange={(e) => setStatusAktif(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tea-700" />
            </label>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/menu"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={!isSubmittable}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

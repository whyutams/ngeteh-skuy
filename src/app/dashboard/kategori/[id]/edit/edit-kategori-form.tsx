"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { updateKategoriAction, type KategoriActionResult, type KategoriItem } from "@/app/actions/kategori";

interface EditKategoriFormProps {
  initialData: KategoriItem;
}

export function EditKategoriForm({ initialData }: EditKategoriFormProps) {
  const router = useRouter();
  const [namaKategori, setNamaKategori] = useState(initialData.nama_kategori);
  const [urutan, setUrutan] = useState(String(initialData.urutan));
  const [formState, setFormState] = useState<KategoriActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSubmittable = namaKategori.trim().length >= 2 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    setFormState(null);
    startTransition(async () => {
      const res = await updateKategoriAction(initialData.id, {
        nama_kategori: namaKategori.trim(),
        urutan: Number(urutan) || 0,
      });

      if (res.success) {
        router.push("/dashboard/kategori?status=updated");
        router.refresh();
      } else {
        setFormState(res);
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* breadcrumb navigasi */}
      <Breadcrumbs
        items={[
          { label: "Kategori Menu", href: "/dashboard/kategori" },
          { label: "Ubah Kategori" },
        ]}
      />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ubah Kategori Menu
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Perbarui nama atau urutan tampilan kategori menu.
          </p>
        </div>

        <Link
          href="/dashboard/kategori"
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

          {/* Nama Kategori */}
          <div className="space-y-1.5">
            <label htmlFor="nama_kategori" className="block text-sm font-medium text-slate-700">
              Nama Kategori <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              id="nama_kategori"
              name="nama_kategori"
              type="text"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              placeholder="Masukkan nama kategori"
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
            {formState?.fieldErrors?.nama_kategori && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.nama_kategori[0]}
              </p>
            )}
          </div>

          {/* Urutan Tampil */}
          <div className="space-y-1.5">
            <label htmlFor="urutan" className="block text-sm font-medium text-slate-700">
              Urutan Tampil
            </label>
            <input
              id="urutan"
              name="urutan"
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              placeholder="Masukkan urutan"
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {formState?.fieldErrors?.urutan && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.urutan[0]}
              </p>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/kategori"
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


"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import {
  updateBahanBakuAction,
  type BahanBakuActionResult,
} from "@/app/actions/bahan-baku";
import type { BahanBakuRecord } from "@/libs/bahan-baku-store";

interface EditBahanFormProps {
  initialData: BahanBakuRecord;
}

export function EditBahanForm({ initialData }: EditBahanFormProps) {
  const router = useRouter();
  const [namaBahan, setNamaBahan] = useState(initialData.nama_bahan);
  const [stok, setStok] = useState(String(initialData.stok));
  const [satuan, setSatuan] = useState(initialData.satuan);

  const [formState, setFormState] = useState<BahanBakuActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSubmittable =
    namaBahan.trim().length >= 2 &&
    stok.trim() !== "" &&
    !isNaN(Number(stok)) &&
    Number(stok) >= 0 &&
    satuan.trim().length >= 1 &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    setFormState(null);
    startTransition(async () => {
      const res = await updateBahanBakuAction(initialData.id, {
        nama_bahan: namaBahan.trim(),
        stok: Number(stok) || 0,
        satuan: satuan.trim(),
      });

      if (res.success) {
        router.push("/dashboard/bahan-baku?status=updated");
        router.refresh();
      } else {
        setFormState(res);
      }
    });
  };

  const satuanPilihan = ["gram", "kg", "ml", "liter", "pcs", "kaleng", "pack", "lembar"];

  return (
    <div className="space-y-6 w-full">
      {/* breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Bahan Baku", href: "/dashboard/bahan-baku" },
          { label: "Ubah Bahan Baku" },
        ]}
      />

      {/* header halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ubah Bahan Baku
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Perbarui nama bahan, penyesuaian jumlah stok, atau satuan ukuran.
          </p>
        </div>

        <Link
          href="/dashboard/bahan-baku"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* formulir proporsional */}
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

          {/* nama bahan */}
          <div className="space-y-1.5">
            <label
              htmlFor="nama_bahan"
              className="block text-sm font-medium text-slate-700"
            >
              Nama Bahan Baku <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              id="nama_bahan"
              name="nama_bahan"
              type="text"
              value={namaBahan}
              onChange={(e) => setNamaBahan(e.target.value)}
              placeholder="Masukkan nama bahan baku"
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
            {formState?.fieldErrors?.nama_bahan && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.nama_bahan[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* sisa stok */}
            <div className="space-y-1.5">
              <label
                htmlFor="stok"
                className="block text-sm font-medium text-slate-700"
              >
                Sisa Stok <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="stok"
                name="stok"
                type="number"
                step="any"
                min={0}
                value={stok}
                onChange={(e) => setStok(e.target.value)}
                placeholder="Masukkan stok"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              {formState?.fieldErrors?.stok && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.stok[0]}
                </p>
              )}
            </div>

            {/* satuan */}
            <div className="space-y-1.5">
              <label
                htmlFor="satuan"
                className="block text-sm font-medium text-slate-700"
              >
                Satuan Ukuran <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="space-y-2">
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
                <div className="flex flex-wrap gap-1.5">
                  {satuanPilihan.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSatuan(s)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                        satuan.toLowerCase() === s
                          ? "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {formState?.fieldErrors?.satuan && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.satuan[0]}
                </p>
              )}
            </div>
          </div>

          {/* tombol aksi simpan */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/dashboard/bahan-baku"
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={!isSubmittable}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer"
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


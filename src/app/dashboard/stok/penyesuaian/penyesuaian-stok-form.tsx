"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MenuImage } from "@/components/ui/menu-image";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  CupSoda,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { adjustStockAction, type StokActionResult } from "@/app/actions/stok";
import type { MenuItem } from "@/app/actions/menu";

interface PenyesuaianStokFormProps {
  products: MenuItem[];
  initialProductId?: string;
}

export function PenyesuaianStokForm({
  products,
  initialProductId,
}: PenyesuaianStokFormProps) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId && products.some((p) => p.id === initialProductId)
      ? initialProductId
      : products[0]?.id || ""
  );
  const [tipeMutasi, setTipeMutasi] = useState<"masuk" | "keluar" | "penyesuaian">("masuk");
  const [jumlah, setJumlah] = useState("");
  const [catatan, setCatatan] = useState("");

  const [formState, setFormState] = useState<StokActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const isSubmittable =
    Boolean(selectedProductId) &&
    Number(jumlah) > 0 &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    setFormState(null);
    startTransition(async () => {
      const res = await adjustStockAction({
        produk_id: selectedProductId,
        tipe_mutasi: tipeMutasi,
        jumlah: Number(jumlah),
        catatan: catatan.trim() || undefined,
      });

      if (res.success) {
        router.push("/dashboard/stok?status=adjusted");
        router.refresh();
      } else {
        setFormState(res);
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Kelola Stok", href: "/dashboard/stok" },
          { label: "Penyesuaian Stok" },
        ]}
      />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Penyesuaian Stok Produk
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Catat stok masuk, stok keluar, atau penyesuaian manual.
          </p>
        </div>

        <Link
          href="/dashboard/stok"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Panel Formulir Proporsional */}
      <div className="max-w-4xl bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formState?.error && (
            <div className="flex items-center gap-2.5 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{formState.error}</span>
            </div>
          )}

          {/* Pilih Produk Menu */}
          <div className="space-y-1.5">
            <label
              htmlFor="produk_id"
              className="block text-sm font-medium text-slate-700"
            >
              Pilih Menu <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <select
              id="produk_id"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={isPending}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors disabled:opacity-50 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_produk} (Sisa Stok: {p.stok} {p.satuan})
                </option>
              ))}
            </select>
            {formState?.fieldErrors?.produk_id && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.produk_id[0]}
              </p>
            )}
          </div>

          {/* Sisa Stok Saat Ini Info Card */}
          {selectedProduct && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-white border border-amber-200 shrink-0 flex items-center justify-center">
                  <MenuImage
                    src={selectedProduct.gambar_url}
                    alt={selectedProduct.nama_produk}
                    sizes="44px"
                    iconClassName="h-5 w-5 text-amber-700"
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{selectedProduct.nama_produk}</div>
                  <div className="text-xs text-slate-500">
                    {selectedProduct.kategori_menu?.nama_kategori || "Menu Teh"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Stok Saat Ini</span>
                <span className="font-bold text-amber-900 text-base">
                  {selectedProduct.stok} {selectedProduct.satuan}
                </span>
              </div>
            </div>
          )}

          {/* Tipe Mutasi */}
          <div className="space-y-1.5">
            <label
              htmlFor="tipe_mutasi"
              className="block text-sm font-medium text-slate-700"
            >
              Jenis Mutasi <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  tipeMutasi === "masuk"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                    : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="tipe_mutasi"
                  value="masuk"
                  checked={tipeMutasi === "masuk"}
                  onChange={() => setTipeMutasi("masuk")}
                  className="sr-only"
                />
                <ArrowUpCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-sm">Stok Masuk (+)</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  tipeMutasi === "keluar"
                    ? "bg-rose-50 border-rose-300 text-rose-900 font-semibold"
                    : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="tipe_mutasi"
                  value="keluar"
                  checked={tipeMutasi === "keluar"}
                  onChange={() => setTipeMutasi("keluar")}
                  className="sr-only"
                />
                <ArrowDownCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span className="text-sm">Stok Keluar (-)</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  tipeMutasi === "penyesuaian"
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold"
                    : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="tipe_mutasi"
                  value="penyesuaian"
                  checked={tipeMutasi === "penyesuaian"}
                  onChange={() => setTipeMutasi("penyesuaian")}
                  className="sr-only"
                />
                <RefreshCw className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-sm">Opname Fisik (=)</span>
              </label>
            </div>
            {formState?.fieldErrors?.tipe_mutasi && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.tipe_mutasi[0]}
              </p>
            )}
          </div>

          {/* Jumlah Porsi / Unit */}
          <div className="space-y-1.5">
            <label
              htmlFor="jumlah"
              className="block text-sm font-medium text-slate-700"
            >
              {tipeMutasi === "penyesuaian" ? "Total Stok Fisik Sebenarnya" : "Jumlah"}
              <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              id="jumlah"
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              disabled={isPending}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors disabled:opacity-50"
            />
            {formState?.fieldErrors?.jumlah && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.jumlah[0]}
              </p>
            )}
          </div>

          {/* Catatan / Alasan */}
          <div className="space-y-1.5">
            <label
              htmlFor="catatan"
              className="block text-sm font-medium text-slate-700"
            >
              Catatan
            </label>
            <textarea
              id="catatan"
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Masukkan catatan"
              disabled={isPending}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors disabled:opacity-50 resize-none"
            />
            {formState?.fieldErrors?.catatan && (
              <p className="text-rose-500 text-xs mt-1">
                {formState.fieldErrors.catatan[0]}
              </p>
            )}
          </div>

          {/* Tombol Simpan */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/stok"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={!isSubmittable}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Penyesuaian</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


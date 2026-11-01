"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Loader2, AlertCircle, Upload } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import {
  createMenuAction,
  uploadMenuImageAction,
  type MenuActionResult,
} from "@/app/actions/menu";
import type { KategoriItem } from "@/app/actions/kategori";

interface TambahMenuFormProps {
  categories: KategoriItem[];
}

export function TambahMenuForm({ categories }: TambahMenuFormProps) {
  const router = useRouter();
  const [namaProduk, setNamaProduk] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("0");
  const [satuan, setSatuan] = useState("cup");
  const [statusAktif, setStatusAktif] = useState(true);
  const [gambarUrl, setGambarUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formState, setFormState] = useState<MenuActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadMenuImageAction(formData);
    setIsUploadingImage(false);

    if (res.success && res.url) {
      setGambarUrl(res.url);
    } else {
      alert(res.error || "Gagal mengunggah gambar ke Supabase Storage.");
    }
  };

  const isSubmittable =
    namaProduk.trim().length >= 2 &&
    Number(harga) > 0 &&
    !isPending &&
    !isUploadingImage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    setFormState(null);
    startTransition(async () => {
      const res = await createMenuAction({
        nama_produk: namaProduk.trim(),
        kategori_id: kategoriId || null,
        gambar_url: gambarUrl || null,
        harga: Number(harga),
        satuan: satuan.trim() || "cup",
        stok: Number(stok) || 0,
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
          { label: "Tambah Menu" },
        ]}
      />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tambah Menu Baru
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Daftarkan menu minuman teh atau camilan baru ke dalam sistem kasir POS.
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

          {/* Foto Menu (Opsional - Supabase Storage) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Foto Menu
            </label>
            <div className="flex items-center gap-4 p-3 bg-slate-50/60 border border-slate-200 rounded-lg">
              {gambarUrl ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                  <Image
                    src={gambarUrl}
                    alt="Preview foto menu"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                  <Upload className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploadingImage}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-tea-100 file:text-tea-800 hover:file:bg-tea-200 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Format PNG, JPG, atau WEBP. Gambar disimpan di Supabase Storage.
                </p>
                {isUploadingImage && (
                  <p className="text-xs text-tea-700 flex items-center gap-1 font-medium">
                    <Loader2 className="h-3 w-3 animate-spin" /> Mengunggah ke Supabase Storage...
                  </p>
                )}
              </div>
            </div>
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

            {/* Stok Awal */}
            <div className="space-y-1.5">
              <label htmlFor="stok" className="block text-sm font-medium text-slate-700">
                Stok Awal <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="stok"
                name="stok"
                type="number"
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

            {/* Satuan */}
            <div className="space-y-1.5">
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
                  <Plus className="h-4 w-4" />
                  <span>Simpan Menu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


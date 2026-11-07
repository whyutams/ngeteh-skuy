"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Loader2, AlertCircle, Upload, Trash } from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { Tooltip } from "@/components/ui/tooltip";
import {
  createMenuAction,
  uploadMenuImageAction,
  type MenuActionResult,
} from "@/app/actions/menu";
import type { KategoriItem } from "@/app/actions/kategori";
import type { BahanBakuRecord } from "@/libs/bahan-baku-store";

interface ResepRow {
  bahan_id: string;
  jumlah_pemakaian: string;
}

interface TambahMenuFormProps {
  categories: KategoriItem[];
  bahanBakuList?: BahanBakuRecord[];
}

export function TambahMenuForm({
  categories,
  bahanBakuList = [],
}: TambahMenuFormProps) {
  const router = useRouter();
  const [namaProduk, setNamaProduk] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [hargaModal, setHargaModal] = useState("0");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("0");
  const [satuan, setSatuan] = useState("cup");
  const [statusAktif, setStatusAktif] = useState(true);
  const [gambarUrl, setGambarUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [resepRows, setResepRows] = useState<ResepRow[]>([]);

  const [formState, setFormState] = useState<MenuActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const addResepRow = () => {
    const available = bahanBakuList.find(
      (b) => !resepRows.some((r) => r.bahan_id === b.id)
    );
    setResepRows((prev) => [
      ...prev,
      {
        bahan_id: available?.id || bahanBakuList[0]?.id || "",
        jumlah_pemakaian: "1",
      },
    ]);
  };

  const updateResepRow = (
    index: number,
    field: "bahan_id" | "jumlah_pemakaian",
    value: string
  ) => {
    setResepRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeResepRow = (index: number) => {
    setResepRows((prev) => prev.filter((_, i) => i !== index));
  };

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
    hargaModal.trim() !== "" &&
    !isNaN(Number(hargaModal)) &&
    Number(hargaModal) >= 0 &&
    !isPending &&
    !isUploadingImage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    const validResep = resepRows
      .filter((r) => r.bahan_id && Number(r.jumlah_pemakaian) > 0)
      .map((r) => ({
        bahan_id: r.bahan_id,
        jumlah_pemakaian: Number(r.jumlah_pemakaian),
      }));

    setFormState(null);
    startTransition(async () => {
      const res = await createMenuAction({
        nama_produk: namaProduk.trim(),
        kategori_id: kategoriId || null,
        gambar_url: gambarUrl || null,
        harga_modal: Number(hargaModal) || 0,
        harga: Number(harga),
        satuan: satuan.trim() || "cup",
        stok: Number(stok) || 0,
        status_aktif: statusAktif,
        resep: validResep,
      });

      if (res.success) {
        router.push("/dashboard/menu?status=created");
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
          { label: "Kelola Menu", href: "/dashboard/menu" },
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

            {/* Harga Modal (HPP) */}
            <div className="space-y-1.5">
              <label htmlFor="harga_modal" className="block text-sm font-medium text-slate-700">
                Harga Modal (HPP) <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="harga_modal"
                name="harga_modal"
                type="number"
                min={0}
                value={hargaModal}
                onChange={(e) => setHargaModal(e.target.value)}
                placeholder="Masukkan harga modal"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              {formState?.fieldErrors?.harga_modal && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.harga_modal[0]}
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
                placeholder="Masukkan harga jual"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              {formState?.fieldErrors?.harga && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.harga[0]}
                </p>
              )}
            </div>

            {/* Estimasi Keuntungan & Margin per Cup */}
            {Number(harga) > 0 && (
              <div className="sm:col-span-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-emerald-900">
                    Estimasi Keuntungan per Porsi:
                  </span>
                  <span className="ml-1 text-emerald-800">
                    Rp {(Number(harga) - (Number(hargaModal) || 0)).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="font-bold text-emerald-800">
                  Margin:{" "}
                  {Math.round(
                    ((Number(harga) - (Number(hargaModal) || 0)) / Number(harga)) * 100
                  )}
                  %
                </div>
              </div>
            )}

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

          {/* Komposisi Bahan Baku (Resep Menu) */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Komposisi Bahan Baku (Resep Menu)
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan bahan baku yang otomatis terpotong saat menu ini dipesan di kasir POS.
                </p>
              </div>
              {bahanBakuList.length > 0 && (
                <button
                  type="button"
                  onClick={addResepRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer w-fit"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Bahan</span>
                </button>
              )}
            </div>

            {resepRows.length === 0 ? (
              <div className="p-4 bg-slate-50/60 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                Belum ada bahan baku yang dihubungkan ke menu ini. Klik tombol Tambah Bahan di atas untuk menentukan resep pemakaian.
              </div>
            ) : (
              <div className="space-y-2.5">
                {resepRows.map((row, idx) => {
                  const selectedBahan = bahanBakuList.find((b) => b.id === row.bahan_id);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Pilih Bahan Baku <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <select
                          value={row.bahan_id}
                          onChange={(e) => updateResepRow(idx, "bahan_id", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value="">Pilih Bahan Baku</option>
                          {bahanBakuList.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.nama_bahan} (stok: {Number(b.stok).toLocaleString("id-ID")} {b.satuan})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-52">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Pemakaian per Porsi <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            value={row.jumlah_pemakaian}
                            onChange={(e) => updateResepRow(idx, "jumlah_pemakaian", e.target.value)}
                            placeholder="0"
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-14 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                            {selectedBahan?.satuan || "satuan"}
                          </span>
                        </div>
                      </div>

                      <div className="sm:pt-5 flex justify-end">
                        <Tooltip content="Hapus baris bahan">
                          <button
                            type="button"
                            onClick={() => removeResepRow(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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


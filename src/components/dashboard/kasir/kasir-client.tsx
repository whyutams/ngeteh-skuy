"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { MenuImage } from "@/components/ui/menu-image";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CupSoda,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import type { MenuItem } from "@/app/actions/menu";
import type { KategoriItem } from "@/app/actions/kategori";
import { createTransaksiAction } from "@/app/actions/transaksi";

interface CartItem {
  produk: MenuItem;
  jumlah: number;
}

interface KasirClientProps {
  products: MenuItem[];
  categories: KategoriItem[];
}

export function KasirClient({ products, categories }: KasirClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "qris" | "transfer">("tunai");
  const [nominalBayar, setNominalBayar] = useState<string>("");
  const [trxSuccess, setTrxSuccess] = useState<{ invoice: string; kembalian: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter daftar produk
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "all" || p.kategori_id === selectedCategory;
    const matchSearch = p.nama_produk
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && p.status_aktif !== false;
  });

  // Tambah item ke keranjang
  const addToCart = (product: MenuItem) => {
    if (product.stok <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.produk.id === product.id);
      if (existing) {
        if (existing.jumlah >= product.stok) return prev;
        return prev.map((item) =>
          item.produk.id === product.id
            ? { ...item, jumlah: item.jumlah + 1 }
            : item
        );
      }
      return [...prev, { produk: product, jumlah: 1 }];
    });
  };

  // Kurangi jumlah item
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.produk.id === productId) {
            const newQty = item.jumlah + delta;
            if (newQty > item.produk.stok) return item;
            return { ...item, jumlah: newQty };
          }
          return item;
        })
        .filter((item) => item.jumlah > 0)
    );
  };

  // Hapus item dari keranjang
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.produk.id !== productId));
  };

  // Hitung total tagihan
  const totalTagihan = cart.reduce(
    (sum, item) => sum + item.produk.harga * item.jumlah,
    0
  );
  const totalItemCount = cart.reduce((sum, item) => sum + item.jumlah, 0);

  // Perhitungan kembalian
  const nominalNumber = Number(nominalBayar) || 0;
  const kembalian = Math.max(0, nominalNumber - totalTagihan);
  const isBayarCukup =
    paymentMethod !== "tunai" || nominalNumber >= totalTagihan;

  // Buka modal checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setNominalBayar(totalTagihan.toString());
    setErrorMessage(null);
    setIsCheckoutModalOpen(true);
  };

  // Eksekusi transaksi
  const handleProsesPembayaran = () => {
    if (!isBayarCukup || isPending) return;

    setErrorMessage(null);
    startTransition(async () => {
      const res = await createTransaksiAction({
        items: cart.map((item) => ({
          produk_id: item.produk.id,
          nama_produk: item.produk.nama_produk,
          harga_satuan: item.produk.harga,
          jumlah: item.jumlah,
          subtotal: item.produk.harga * item.jumlah,
        })),
        total_tagihan: totalTagihan,
        metode_pembayaran: paymentMethod,
        uang_diterima: paymentMethod === "tunai" ? nominalNumber : totalTagihan,
        uang_kembalian: paymentMethod === "tunai" ? kembalian : 0,
      });

      if (res.success && res.nomor_invoice) {
        setTrxSuccess({
          invoice: res.nomor_invoice,
          kembalian: paymentMethod === "tunai" ? kembalian : 0,
        });
        setCart([]);
      } else {
        setErrorMessage(res.error || "Gagal memproses transaksi.");
      }
    });
  };

  // Reset setelah selesai transaksi
  const handleResetAfterSuccess = () => {
    setTrxSuccess(null);
    setIsCheckoutModalOpen(false);
    setNominalBayar("");
  };

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Navigasi */}
      <Breadcrumbs items={[{ label: "Kasir POS" }]} />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kasir Point of Sale
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pilih menu pesanan teh, kelola keranjang belanja, dan proses transaksi.
          </p>
        </div>
      </div>

      {/* Area Kasir: Grid Menu (Kiri) & Keranjang Belanja (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Katalog Menu Teh (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Baris Pencarian & Kategori */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            {/* Input Pencarian */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan nama menu"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filter Pill Kategori */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-tea-700 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Semua Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-tea-700 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {cat.nama_kategori}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Kartu Menu Produk */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 space-y-2">
              <CupSoda className="h-10 w-10 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">Menu tidak ditemukan</p>
              <p className="text-xs text-slate-400">
                Silakan coba kata kunci lain atau pilih kategori yang berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const inCartItem = cart.find((item) => item.produk.id === p.id);
                const isOutOfStock = p.stok <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`group bg-white rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
                      isOutOfStock
                        ? "border-slate-200 opacity-60 cursor-not-allowed"
                        : "border-slate-200 hover:border-tea-600 hover:shadow-sm cursor-pointer"
                    }`}
                  >
                    {/* Gambar Menu dari Supabase Storage */}
                    <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                      <MenuImage
                        src={p.gambar_url}
                        alt={p.nama_produk}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        iconClassName="h-12 w-12 text-tea-700"
                      />

                      {/* Badge Kategori */}
                      {p.kategori_menu && (
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {Array.isArray(p.kategori_menu)
                            ? (p.kategori_menu as unknown as Array<{ nama_kategori: string }>)[0]?.nama_kategori
                            : p.kategori_menu.nama_kategori}
                        </span>
                      )}

                      {/* Badge Jumlah di Keranjang jika ada */}
                      {inCartItem && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                          {inCartItem.jumlah}
                        </span>
                      )}

                      {/* Badge Habis */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                          Stok Habis
                        </div>
                      )}
                    </div>

                    {/* Informasi Produk */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-tea-700 transition-colors">
                          {p.nama_produk}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                          <span>Sisa stok: {p.stok}</span>
                          <span
                            className={
                              p.stok <= 5 ? "text-amber-600 font-semibold" : "text-emerald-700"
                            }
                          >
                            {p.stok <= 5 ? "Menipis" : "Tersedia"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          Rp {p.harga.toLocaleString("id-ID")}
                        </span>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOutOfStock) addToCart(p);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-tea-50 text-tea-700 hover:bg-tea-700 hover:text-white flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Pesan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Keranjang Pesanan (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-fit sticky top-20">
          {/* Header Keranjang */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-tea-700" />
              <h3 className="font-bold text-slate-900 text-base">Pesanan Aktif</h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Daftar Item di Keranjang */}
          <div className="p-4 divide-y divide-slate-100 max-h-[420px] overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="h-10 w-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Keranjang masih kosong</p>
                <p className="text-xs text-slate-400">
                  Klik menu di samping untuk menambahkan pesanan.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.produk.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  {/* Thumbnail Gambar */}
                  <div className="relative h-12 w-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    <MenuImage
                      src={item.produk.gambar_url}
                      alt={item.produk.nama_produk}
                      sizes="48px"
                      iconClassName="h-5 w-5 text-tea-700"
                    />
                  </div>

                  {/* Detail Item & Kontrol Jumlah */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-slate-900 truncate">
                      {item.produk.nama_produk}
                    </h5>
                    <p className="text-xs text-slate-500">
                      Rp {item.produk.harga.toLocaleString("id-ID")}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => updateQty(item.produk.id, -1)}
                        className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 min-w-4 text-center">
                        {item.jumlah}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.produk.id, 1)}
                        disabled={item.jumlah >= item.produk.stok}
                        className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Tombol Hapus */}
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      Rp {(item.produk.harga * item.jumlah).toLocaleString("id-ID")}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.produk.id)}
                      className="mt-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 ml-auto" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ringkasan Total & Tombol Bayar */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 rounded-b-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total Item ({totalItemCount} gelas)</span>
              <span>Rp {totalTagihan.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Tagihan</span>
              <span className="text-tea-700">Rp {totalTagihan.toLocaleString("id-ID")}</span>
            </div>

            <button
              type="button"
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-tea-700 hover:bg-tea-800 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Receipt className="h-4 w-4" />
              <span>Bayar Pesanan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog Pembayaran Kasir */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Tampilan Sukses */}
            {trxSuccess ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Transaksi Berhasil
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No. Invoice: <span className="font-semibold text-slate-800">{trxSuccess.invoice}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-left space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Metode Bayar:</span>
                    <span className="font-medium uppercase text-slate-900">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Tagihan:</span>
                    <span className="font-bold text-slate-900">
                      Rp {totalTagihan.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {paymentMethod === "tunai" && (
                    <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                      <span>Kembalian:</span>
                      <span>Rp {trxSuccess.kembalian.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetAfterSuccess}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-tea-700 hover:bg-tea-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Transaksi Baru</span>
                </button>
              </div>
            ) : (
              <>
                {/* Header Modal Checkout */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Pembayaran Kasir</h3>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                {/* Total yang Harus Dibayar */}
                <div className="p-4 bg-tea-50/60 border border-tea-200/80 rounded-lg text-center">
                  <span className="text-xs text-slate-600 font-medium">Total Pembayaran</span>
                  <div className="text-2xl font-extrabold text-tea-950 mt-1">
                    Rp {totalTagihan.toLocaleString("id-ID")}
                  </div>
                </div>

                {/* Pilihan Metode Pembayaran */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("tunai")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                        paymentMethod === "tunai"
                          ? "bg-tea-700 text-white border-tea-700 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Banknote className="h-4 w-4" />
                      <span>Tunai</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("qris")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                        paymentMethod === "qris"
                          ? "bg-tea-700 text-white border-tea-700 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>QRIS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                        paymentMethod === "transfer"
                          ? "bg-tea-700 text-white border-tea-700 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Input Tunai & Hitung Kembalian */}
                {paymentMethod === "tunai" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="nominalBayar" className="block text-xs font-medium text-slate-700">
                        Nominal Uang Diterima
                      </label>
                      <input
                        id="nominalBayar"
                        type="number"
                        value={nominalBayar}
                        onChange={(e) => setNominalBayar(e.target.value)}
                        placeholder="Masukkan nominal bayar"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2 px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* Tombol Cepat Nominal */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "Pas", val: totalTagihan },
                        { label: "10rb", val: 10000 },
                        { label: "20rb", val: 20000 },
                        { label: "50rb", val: 50000 },
                      ].map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => setNominalBayar(q.val.toString())}
                          className="py-1 px-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>

                    {/* Tampilan Kembalian */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Uang Kembalian:</span>
                      <span
                        className={`font-bold text-sm ${
                          nominalNumber < totalTagihan
                            ? "text-rose-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {nominalNumber < totalTagihan
                          ? "Kurang Rp " + (totalTagihan - nominalNumber).toLocaleString("id-ID")
                          : "Rp " + kembalian.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Aksi Konfirmasi */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleProsesPembayaran}
                    disabled={!isBayarCukup || isPending}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Selesaikan Transaksi</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


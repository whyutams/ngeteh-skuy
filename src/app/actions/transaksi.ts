"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import { getFallbackHargaModalMap } from "@/libs/harga-modal";
import { deductBahanBakuForSoldItems } from "@/app/actions/bahan-baku";
import { getTodayDateString } from "@/libs/date";

export interface TransaksiItemInput {
  produk_id: string;
  nama_produk: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
}

export interface CheckoutInput {
  items: TransaksiItemInput[];
  total_tagihan: number;
  metode_pembayaran: "tunai" | "qris" | "transfer";
  uang_diterima: number;
  uang_kembalian: number;
}

export interface CheckoutResult {
  success: boolean;
  nomor_invoice?: string;
  error?: string;
}

export interface ItemPembelianDetail {
  id: string;
  transaksi_id: string;
  produk_id: string | null;
  nama_produk: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
  produk_menu?: {
    gambar_url?: string | null;
  } | null;
}

export interface TransaksiRecord {
  id: string;
  nomor_invoice: string;
  total_tagihan: number;
  metode_pembayaran: "tunai" | "qris" | "transfer";
  uang_diterima: number;
  uang_kembalian: number;
  status_transaksi: "selesai" | "dibatalkan";
  kasir_id: string | null;
  created_at: string;
  kasir?: {
    username: string;
    full_name: string | null;
  } | null;
  item_pembelian?: ItemPembelianDetail[];
}

export interface ProdukTerlarisItem {
  produk_id: string | null;
  nama_produk: string;
  kategori_nama?: string;
  harga: number;
  harga_modal: number;
  keuntungan_per_cup: number;
  stok?: number;
  satuan?: string;
  gambar_url: string | null;
  total_terjual: number;
  total_omset: number;
  total_modal: number;
  total_keuntungan: number;
  margin_persen: number;
}

export interface LaporanSummary {
  totalPendapatan: number;
  totalModal: number;
  totalKeuntungan: number;
  marginRataRata: number;
  totalTransaksi: number;
  rataRataTransaksi: number;
  totalItemTerjual: number;
  metodeBreakdown: {
    tunai: { total: number; jumlah: number };
    qris: { total: number; jumlah: number };
    transfer: { total: number; jumlah: number };
  };
  produkTerlaris: ProdukTerlarisItem[];
  transaksiList: TransaksiRecord[];
}

export interface TodaySalesSummary {
  totalOmset: number;
  totalModal: number;
  totalKeuntungan: number;
  marginPersen: number;
  totalTransaksi: number;
  totalItemTerjual: number;
}

// Buat transaksi baru dari modul Kasir POS
export async function createTransaksiAction(
  input: CheckoutInput
): Promise<CheckoutResult> {
  const session = await getCurrentSession();
  if (!session.user) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Keranjang belanja masih kosong." };
  }

  try {
    const admin = createAdminClient();

    // buat nomor invoice unik
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomor_invoice = `INV-${dateStr}-${randomSuffix}`;

    // periksa profil kasir
    let validKasirId: string | null = null;
    try {
      const { data: profileCheck } = await admin
        .from("profil_pengguna")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileCheck?.id) {
        validKasirId = profileCheck.id;
      } else {
        // sinkronkan profil jika belum ada
        const { error: upsertErr } = await admin.from("profil_pengguna").upsert(
          {
            id: session.user.id,
            username:
              session.profile?.username ||
              session.user.email?.replace(/@.*$/, "") ||
              "kasir",
            email: session.user.email || null,
            role: session.profile?.role || "karyawan",
            full_name: session.profile?.full_name || "",
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        if (!upsertErr) {
          validKasirId = session.user.id;
        }
      }
    } catch {
      validKasirId = null;
    }

    // simpan transaksi penjualan
    const { data: transaksi, error: trxErr } = await admin
      .from("transaksi_penjualan")
      .insert({
        nomor_invoice,
        total_tagihan: input.total_tagihan,
        metode_pembayaran: input.metode_pembayaran,
        uang_diterima: input.uang_diterima,
        uang_kembalian: input.uang_kembalian,
        status_transaksi: "selesai",
        kasir_id: validKasirId,
      })
      .select("id")
      .single();

    if (trxErr || !transaksi) {
      return { success: false, error: trxErr?.message || "Gagal mencatat transaksi." };
    }

    // simpan rincian item pesanan
    const itemsToInsert = input.items.map((item) => ({
      transaksi_id: transaksi.id,
      produk_id: item.produk_id,
      nama_produk: item.nama_produk,
      harga_satuan: item.harga_satuan,
      jumlah: item.jumlah,
      subtotal: item.subtotal,
    }));

    const { error: itemsErr } = await admin
      .from("item_pembelian")
      .insert(itemsToInsert);

    if (itemsErr) {
      console.warn("Peringatan item_pembelian:", itemsErr.message);
    }

    // potong stok dan catat riwayat mutasi
    for (const item of input.items) {
      const { data: currentProduct } = await admin
        .from("produk_menu")
        .select("id, stok")
        .eq("id", item.produk_id)
        .single();

      if (currentProduct) {
        const stokSebelum = currentProduct.stok || 0;
        const stokSesudah = Math.max(0, stokSebelum - item.jumlah);

        await admin
          .from("produk_menu")
          .update({
            stok: stokSesudah,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.produk_id);

        await admin.from("riwayat_stok").insert({
          produk_id: item.produk_id,
          tipe_mutasi: "penjualan",
          jumlah: item.jumlah,
          stok_sebelum: stokSebelum,
          stok_sesudah: stokSesudah,
          catatan: `Penjualan ${nomor_invoice}`,
          dibuat_oleh: validKasirId,
        });
      }
    }

    // potong stok bahan baku berdasarkan komposisi resep menu
    await deductBahanBakuForSoldItems(input.items);

    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard/stok");
    revalidatePath("/dashboard/bahan-baku");
    revalidatePath("/dashboard/penjualan");
    revalidatePath("/dashboard");

    return { success: true, nomor_invoice };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return { success: false, error: message };
  }
}

// Ambil seluruh daftar transaksi penjualan
export async function getTransaksiListAction(): Promise<{
  success: boolean;
  data: TransaksiRecord[];
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session.user) {
    return { success: false, data: [], error: "Silakan login terlebih dahulu." };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("transaksi_penjualan")
      .select(
        "id, nomor_invoice, total_tagihan, metode_pembayaran, uang_diterima, uang_kembalian, status_transaksi, kasir_id, created_at, kasir:profil_pengguna(username, full_name), item_pembelian(id, transaksi_id, produk_id, nama_produk, harga_satuan, jumlah, subtotal, produk_menu(gambar_url))"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return {
      success: true,
      data: (data as unknown as TransaksiRecord[]) || [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat data penjualan.";
    return { success: false, data: [], error: message };
  }
}

// Ambil laporan penjualan dengan filter rentang waktu (Khusus Owner)
export async function getLaporanPenjualanAction(
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  data: LaporanSummary;
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session.isSuperadmin) {
    return {
      success: false,
      data: {
        totalPendapatan: 0,
        totalModal: 0,
        totalKeuntungan: 0,
        marginRataRata: 0,
        totalTransaksi: 0,
        rataRataTransaksi: 0,
        totalItemTerjual: 0,
        metodeBreakdown: {
          tunai: { total: 0, jumlah: 0 },
          qris: { total: 0, jumlah: 0 },
          transfer: { total: 0, jumlah: 0 },
        },
        produkTerlaris: [],
        transaksiList: [],
      },
      error: "Akses ditolak. Laporan penjualan khusus untuk Owner.",
    };
  }

  try {
    const admin = createAdminClient();
    let query = admin
      .from("transaksi_penjualan")
      .select(
        "id, nomor_invoice, total_tagihan, metode_pembayaran, uang_diterima, uang_kembalian, status_transaksi, kasir_id, created_at, kasir:profil_pengguna(username, full_name), item_pembelian(id, transaksi_id, produk_id, nama_produk, harga_satuan, jumlah, subtotal, produk_menu(gambar_url))"
      )
      .eq("status_transaksi", "selesai");

    if (startDate) {
      const startISO = new Date(`${startDate}T00:00:00+08:00`).toISOString();
      query = query.gte("created_at", startISO);
    }

    if (endDate) {
      const endISO = new Date(`${endDate}T23:59:59.999+08:00`).toISOString();
      query = query.lte("created_at", endISO);
    }

    const { data: rows, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return {
        success: false,
        data: {
          totalPendapatan: 0,
          totalModal: 0,
          totalKeuntungan: 0,
          marginRataRata: 0,
          totalTransaksi: 0,
          rataRataTransaksi: 0,
          totalItemTerjual: 0,
          metodeBreakdown: {
            tunai: { total: 0, jumlah: 0 },
            qris: { total: 0, jumlah: 0 },
            transfer: { total: 0, jumlah: 0 },
          },
          produkTerlaris: [],
          transaksiList: [],
        },
        error: error.message,
      };
    }

    // ambil seluruh master produk menu agar laporan memuat seluruh menu outlet
    let { data: allProducts, error: prodErr } = await admin
      .from("produk_menu")
      .select(
        "id, nama_produk, harga, harga_modal, stok, satuan, status_aktif, gambar_url, kategori_menu(nama_kategori)"
      )
      .order("nama_produk", { ascending: true });

    // fallback jika kolom belum ada di database
    if (prodErr && (prodErr.code === "PGRST204" || prodErr.message.includes("harga_modal"))) {
      const fallback = await admin
        .from("produk_menu")
        .select(
          "id, nama_produk, harga, stok, satuan, status_aktif, gambar_url, kategori_menu(nama_kategori)"
        )
        .order("nama_produk", { ascending: true });
      const fallbackMap = await getFallbackHargaModalMap();
      allProducts = (fallback.data as any[])?.map((row) => ({
        ...row,
        harga_modal: Number(fallbackMap[row.id]) || 0,
      })) || [];
    }

    const list = (rows as unknown as TransaksiRecord[]) || [];

    let totalPendapatan = 0;
    let totalItemTerjual = 0;
    const metodeBreakdown = {
      tunai: { total: 0, jumlah: 0 },
      qris: { total: 0, jumlah: 0 },
      transfer: { total: 0, jumlah: 0 },
    };

    const productMap = new Map<string, ProdukTerlarisItem>();

    // inisialisasi daftar menu dari master produk
    if (allProducts) {
      for (const prod of allProducts) {
        const prodRecord = prod as Record<string, any>;
        const katObj = prodRecord.kategori_menu;
        const katName = Array.isArray(katObj)
          ? katObj[0]?.nama_kategori
          : katObj?.nama_kategori;

        const hargaJual = Number(prod.harga) || 0;
        const hargaModal = Number(prod.harga_modal) || 0;

        productMap.set(prod.id, {
          produk_id: prod.id,
          nama_produk: prod.nama_produk,
          kategori_nama: katName || "Tanpa Kategori",
          harga: hargaJual,
          harga_modal: hargaModal,
          keuntungan_per_cup: hargaJual - hargaModal,
          stok: Number(prod.stok) || 0,
          satuan: prod.satuan || "cup",
          gambar_url: prod.gambar_url || null,
          total_terjual: 0,
          total_omset: 0,
          total_modal: 0,
          total_keuntungan: 0,
          margin_persen:
            hargaJual > 0 ? Math.round(((hargaJual - hargaModal) / hargaJual) * 100) : 0,
        });
      }
    }

    for (const trx of list) {
      const nominal = Number(trx.total_tagihan) || 0;
      totalPendapatan += nominal;

      const m = trx.metode_pembayaran;
      if (m === "tunai" || m === "qris" || m === "transfer") {
        metodeBreakdown[m].total += nominal;
        metodeBreakdown[m].jumlah += 1;
      }

      if (trx.item_pembelian) {
        for (const itm of trx.item_pembelian) {
          const qty = Number(itm.jumlah) || 0;
          const sub = Number(itm.subtotal) || 0;
          totalItemTerjual += qty;

          const key = itm.produk_id || itm.nama_produk;
          const existing = productMap.get(key);
          if (existing) {
            existing.total_terjual += qty;
            existing.total_omset += sub;
            existing.total_modal = existing.total_terjual * existing.harga_modal;
            existing.total_keuntungan = existing.total_omset - existing.total_modal;
            existing.margin_persen =
              existing.total_omset > 0
                ? Math.round((existing.total_keuntungan / existing.total_omset) * 100)
                : 0;
          } else {
            const hrgJual = Number(itm.harga_satuan) || 0;
            productMap.set(key, {
              produk_id: itm.produk_id,
              nama_produk: itm.nama_produk,
              kategori_nama: "Lainnya",
              harga: hrgJual,
              harga_modal: 0,
              keuntungan_per_cup: hrgJual,
              stok: 0,
              satuan: "cup",
              gambar_url: itm.produk_menu?.gambar_url || null,
              total_terjual: qty,
              total_omset: sub,
              total_modal: 0,
              total_keuntungan: sub,
              margin_persen: 100,
            });
          }
        }
      }
    }

    const totalTransaksi = list.length;
    const rataRataTransaksi =
      totalTransaksi > 0 ? Math.round(totalPendapatan / totalTransaksi) : 0;

    let totalModal = 0;
    let totalKeuntungan = 0;

    const produkTerlaris = Array.from(productMap.values()).sort((a, b) => {
      if (b.total_terjual !== a.total_terjual) {
        return b.total_terjual - a.total_terjual;
      }
      return b.total_omset - a.total_omset;
    });

    for (const p of produkTerlaris) {
      totalModal += p.total_modal;
      totalKeuntungan += p.total_keuntungan;
    }

    const marginRataRata =
      totalPendapatan > 0 ? Math.round((totalKeuntungan / totalPendapatan) * 100) : 0;

    return {
      success: true,
      data: {
        totalPendapatan,
        totalModal,
        totalKeuntungan,
        marginRataRata,
        totalTransaksi,
        rataRataTransaksi,
        totalItemTerjual,
        metodeBreakdown,
        produkTerlaris,
        transaksiList: list,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memproses laporan.";
    return {
      success: false,
      data: {
        totalPendapatan: 0,
        totalModal: 0,
        totalKeuntungan: 0,
        marginRataRata: 0,
        totalTransaksi: 0,
        rataRataTransaksi: 0,
        totalItemTerjual: 0,
        metodeBreakdown: {
          tunai: { total: 0, jumlah: 0 },
          qris: { total: 0, jumlah: 0 },
          transfer: { total: 0, jumlah: 0 },
        },
        produkTerlaris: [],
        transaksiList: [],
      },
      error: message,
    };
  }
}

// ambil ringkasan statistik penjualan hari ini
export async function getTodaySalesSummaryAction(): Promise<{
  success: boolean;
  data: TodaySalesSummary;
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session.user) {
    return {
      success: false,
      data: {
        totalOmset: 0,
        totalModal: 0,
        totalKeuntungan: 0,
        marginPersen: 0,
        totalTransaksi: 0,
        totalItemTerjual: 0,
      },
      error: "Silakan login terlebih dahulu.",
    };
  }

  try {
    const admin = createAdminClient();
    const todayStr = getTodayDateString();
    const startISO = new Date(`${todayStr}T00:00:00+08:00`).toISOString();
    const endISO = new Date(`${todayStr}T23:59:59.999+08:00`).toISOString();

    const { data: rows, error } = await admin
      .from("transaksi_penjualan")
      .select(
        "id, total_tagihan, status_transaksi, created_at, item_pembelian(id, produk_id, nama_produk, harga_satuan, jumlah, subtotal)"
      )
      .eq("status_transaksi", "selesai")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (error) {
      return {
        success: false,
        data: {
          totalOmset: 0,
          totalModal: 0,
          totalKeuntungan: 0,
          marginPersen: 0,
          totalTransaksi: 0,
          totalItemTerjual: 0,
        },
        error: error.message,
      };
    }

    // ambil master produk menu untuk harga modal HPP
    let { data: allProducts, error: prodErr } = await admin
      .from("produk_menu")
      .select("id, nama_produk, harga, harga_modal");

    if (prodErr && (prodErr.code === "PGRST204" || prodErr.message.includes("harga_modal"))) {
      const fallback = await admin.from("produk_menu").select("id, nama_produk, harga");
      const fallbackMap = await getFallbackHargaModalMap();
      allProducts =
        (fallback.data as any[])?.map((row) => ({
          ...row,
          harga_modal: Number(fallbackMap[row.id]) || 0,
        })) || [];
    }

    const modalMap = new Map<string, number>();
    if (allProducts) {
      for (const p of allProducts) {
        modalMap.set(p.id, Number(p.harga_modal) || 0);
        modalMap.set((p.nama_produk || "").toLowerCase(), Number(p.harga_modal) || 0);
      }
    }

    const list = rows || [];
    let totalOmset = 0;
    let totalModal = 0;
    let totalItemTerjual = 0;

    for (const trx of list) {
      totalOmset += Number(trx.total_tagihan) || 0;
      if (trx.item_pembelian) {
        for (const itm of trx.item_pembelian) {
          const qty = Number(itm.jumlah) || 0;
          totalItemTerjual += qty;
          const keyId = itm.produk_id || "";
          const keyName = (itm.nama_produk || "").toLowerCase();
          const modalSatuan = modalMap.has(keyId)
            ? (modalMap.get(keyId) ?? 0)
            : (modalMap.get(keyName) ?? 0);
          totalModal += qty * modalSatuan;
        }
      }
    }

    const totalKeuntungan = totalOmset - totalModal;
    const marginPersen =
      totalOmset > 0 ? Math.round((totalKeuntungan / totalOmset) * 100) : 0;

    return {
      success: true,
      data: {
        totalOmset,
        totalModal,
        totalKeuntungan,
        marginPersen,
        totalTransaksi: list.length,
        totalItemTerjual,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memproses statistik hari ini.";
    return {
      success: false,
      data: {
        totalOmset: 0,
        totalModal: 0,
        totalKeuntungan: 0,
        marginPersen: 0,
        totalTransaksi: 0,
        totalItemTerjual: 0,
      },
      error: message,
    };
  }
}


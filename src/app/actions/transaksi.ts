"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";

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

    // 1. Buat nomor invoice unik berbasis tanggal & acak
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomor_invoice = `INV-${dateStr}-${randomSuffix}`;

    // 2. Cek apakah user ada di tabel profil_pengguna untuk integritas foreign key
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
        // Otomatis sinkronkan profil jika belum ada
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

    // 3. Simpan transaksi penjualan
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

    // 3. Simpan item pembelian
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

    // 4. Kurangi stok produk & catat ke riwayat stok
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

    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard/stok");
    revalidatePath("/dashboard/penjualan");
    revalidatePath("/dashboard");

    return { success: true, nomor_invoice };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return { success: false, error: message };
  }
}


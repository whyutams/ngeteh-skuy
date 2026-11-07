import { z } from "zod";

// skema validasi bahan baku
export const bahanBakuSchema = z.object({
  nama_bahan: z
    .string()
    .trim()
    .min(2, { message: "Nama bahan baku minimal 2 karakter." })
    .max(100, { message: "Nama bahan baku maksimal 100 karakter." }),
  stok: z
    .coerce
    .number()
    .min(0, { message: "Stok tidak boleh bernilai negatif." })
    .default(0),
  satuan: z
    .string()
    .trim()
    .min(1, { message: "Satuan bahan baku wajib diisi." })
    .max(30, { message: "Satuan maksimal 30 karakter." })
    .default("gram"),
});

export type BahanBakuInput = z.infer<typeof bahanBakuSchema>;

// skema validasi satu item resep
export const resepItemSchema = z.object({
  bahan_id: z.string().trim().min(1, { message: "Bahan baku wajib dipilih." }),
  jumlah_pemakaian: z
    .coerce
    .number()
    .positive({ message: "Jumlah pemakaian harus lebih besar dari 0." }),
});

export type ResepItemInput = z.infer<typeof resepItemSchema>;


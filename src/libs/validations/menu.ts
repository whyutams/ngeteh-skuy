import { z } from "zod";

// Skema validasi produk menu
export const menuSchema = z.object({
  nama_produk: z
    .string()
    .trim()
    .min(2, { message: "Nama produk minimal 2 karakter." })
    .max(80, { message: "Nama produk maksimal 80 karakter." }),
  kategori_id: z.string().uuid({ message: "Kategori tidak valid." }).nullable().optional(),
  harga: z
    .coerce
    .number()
    .min(0, { message: "Harga tidak boleh bernilai negatif." }),
  satuan: z.string().trim().default("cup"),
  stok: z
    .coerce
    .number()
    .int({ message: "Stok harus berupa bilangan bulat." })
    .min(0, { message: "Stok tidak boleh bernilai negatif." })
    .default(0),
  status_aktif: z.boolean().default(true),
});

export type MenuInput = z.infer<typeof menuSchema>;


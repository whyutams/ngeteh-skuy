import { z } from "zod";

// skema validasi produk menu
export const menuSchema = z.object({
  nama_produk: z
    .string()
    .trim()
    .min(2, { message: "Nama produk minimal 2 karakter." })
    .max(80, { message: "Nama produk maksimal 80 karakter." }),
  kategori_id: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (!val || val === "" ? null : val)),
  gambar_url: z.string().trim().url({ message: "Format URL gambar tidak valid." }).or(z.literal("")).nullable().optional(),
  harga: z
    .coerce
    .number()
    .min(0, { message: "Harga jual tidak boleh bernilai negatif." }),
  harga_modal: z
    .coerce
    .number()
    .min(0, { message: "Harga modal tidak boleh bernilai negatif." })
    .default(0),
  satuan: z.string().trim().default("cup"),
  stok: z
    .coerce
    .number()
    .int({ message: "Stok harus berupa bilangan bulat." })
    .min(0, { message: "Stok tidak boleh bernilai negatif." })
    .default(0),
  status_aktif: z.boolean().default(true),
  resep: z
    .array(
      z.object({
        bahan_id: z.string().trim().min(1, { message: "Bahan baku wajib dipilih." }),
        jumlah_pemakaian: z
          .coerce
          .number()
          .positive({ message: "Jumlah pemakaian harus lebih dari 0." }),
      })
    )
    .optional()
    .default([]),
});

export type MenuInput = z.infer<typeof menuSchema>;


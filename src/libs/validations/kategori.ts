import { z } from "zod";

// Skema validasi kategori menu
export const kategoriSchema = z.object({
  nama_kategori: z
    .string()
    .trim()
    .min(2, { message: "Nama kategori minimal 2 karakter." })
    .max(50, { message: "Nama kategori maksimal 50 karakter." }),
  urutan: z
    .coerce
    .number()
    .int({ message: "Urutan harus berupa angka bulat." })
    .min(0, { message: "Urutan minimal bernilai 0." })
    .default(0),
});

export type KategoriInput = z.infer<typeof kategoriSchema>;


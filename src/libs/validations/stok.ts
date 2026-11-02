import { z } from "zod";

// skema validasi penyesuaian stok
export const stokAdjustmentSchema = z.object({
  produk_id: z.string().trim().min(1, { message: "Produk wajib dipilih." }),
  tipe_mutasi: z.enum(["masuk", "keluar", "penyesuaian"], {
    error: () => ({ message: "Tipe mutasi tidak valid." }),
  }),
  jumlah: z
    .coerce
    .number()
    .int({ message: "Jumlah harus berupa bilangan bulat." })
    .min(1, { message: "Jumlah minimal 1 unit." }),
  catatan: z.string().trim().max(255).optional(),
});

export type StokAdjustmentInput = z.infer<typeof stokAdjustmentSchema>;


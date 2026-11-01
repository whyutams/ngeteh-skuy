import { z } from "zod";

// Skema validasi penyesuaian stok
export const stokAdjustmentSchema = z.object({
  produk_id: z.string().uuid({ message: "Produk tidak valid." }),
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


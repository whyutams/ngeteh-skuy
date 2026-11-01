import { z } from "zod";

// Skema validasi login
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username wajib diisi")
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username hanya boleh memuat huruf, angka, titik, strip, atau underscore"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;


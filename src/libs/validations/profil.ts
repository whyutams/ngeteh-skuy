import { z } from "zod";

// Schema validasi pembaruan profil pengguna
export const updateProfileSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(80, "Nama lengkap maksimal 80 karakter"),
    email: z
      .string()
      .trim()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid")
      .max(100, "Email maksimal 100 karakter"),
    password: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    confirm_password: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // Jika password diisi, lakukan validasi kekuatan password
    if (data.password && data.password.length > 0) {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password baru minimal 8 karakter",
          path: ["password"],
        });
      }
      if (!/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password harus memuat kombinasi huruf dan angka",
          path: ["password"],
        });
      }
      if (data.password !== data.confirm_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Konfirmasi password baru tidak cocok",
          path: ["confirm_password"],
        });
      }
    }
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;


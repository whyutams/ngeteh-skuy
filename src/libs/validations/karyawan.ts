import { z } from "zod";

// Skema validasi pembuatan akun karyawan baru
export const createKaryawanSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, { message: "Username minimal 3 karakter." })
      .max(30, { message: "Username maksimal 30 karakter." })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username hanya boleh huruf, angka, dan garis bawah.",
      }),
    full_name: z
      .string()
      .trim()
      .min(2, { message: "Nama lengkap minimal 2 karakter." })
      .max(80, { message: "Nama lengkap maksimal 80 karakter." }),
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter." })
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, {
        message: "Password harus memuat kombinasi huruf dan angka.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

// Skema validasi reset password karyawan
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter." })
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, {
        message: "Password harus memuat kombinasi huruf dan angka.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export type CreateKaryawanInput = z.infer<typeof createKaryawanSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;


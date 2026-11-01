"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { createKaryawanAction, type KaryawanActionResult } from "@/app/actions/karyawan";

export function TambahKaryawanForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formState, setFormState] = useState<KaryawanActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Validasi password real-time
  const hasMinLen = password.length >= 8;
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const isMatch = password === confirmPassword;
  const isPasswordValid = hasMinLen && hasLetters && hasNumbers && isMatch;

  const isSubmittable =
    username.trim().length >= 3 &&
    fullName.trim().length >= 2 &&
    isPasswordValid &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    setFormState(null);
    startTransition(async () => {
      const res = await createKaryawanAction({
        username: username.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      if (res.success) {
        router.push("/dashboard/karyawan");
        router.refresh();
      } else {
        setFormState(res);
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Navigasi */}
      <Breadcrumbs
        items={[
          { label: "Kelola Karyawan", href: "/dashboard/karyawan" },
          { label: "Tambah Karyawan" },
        ]}
      />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tambah Akun Karyawan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Daftarkan akun karyawan baru untuk melayani transaksi.
          </p>
        </div>

        <Link
          href="/dashboard/karyawan"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Kontainer Form Proporsional */}
      <div className="max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          {formState?.error && (
            <div className="flex items-center gap-2 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formState.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Username <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="Masukkan username"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              {formState?.fieldErrors?.username && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.username[0]}
                </p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
                Nama Lengkap <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              {formState?.fieldErrors?.full_name && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.full_name[0]}
                </p>
              )}
            </div>

            {/* Email (Tidak wajib diisi / Opsional) */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              {formState?.fieldErrors?.email && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Kolom kosong agar field email tetap berukuran 1 kolom dan Password berada di baris berikutnya */}
            <div className="hidden sm:block" aria-hidden="true" />

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-3.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formState?.fieldErrors?.password && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Konfirmasi Password <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Masukkan konfirmasi password"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-3.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formState?.fieldErrors?.confirmPassword && (
                <p className="text-rose-500 text-xs mt-1">
                  {formState.fieldErrors.confirmPassword[0]}
                </p>
              )}
            </div>
          </div>

          {/* Checklist Validasi Password Real-time */}
          {password.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
              <p className="font-medium text-slate-700">Persyaratan Password:</p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-700" : "text-slate-500"}`}>
                  <Check className={`h-3.5 w-3.5 ${hasMinLen ? "text-emerald-600 font-bold" : "text-slate-400"}`} />
                  Minimal 8 karakter
                </li>
                <li className={`flex items-center gap-1.5 ${hasLetters && hasNumbers ? "text-emerald-700" : "text-slate-500"}`}>
                  <Check className={`h-3.5 w-3.5 ${hasLetters && hasNumbers ? "text-emerald-600 font-bold" : "text-slate-400"}`} />
                  Kombinasi huruf dan angka
                </li>
                <li className={`flex items-center gap-1.5 ${confirmPassword.length > 0 && isMatch ? "text-emerald-700" : "text-slate-500"}`}>
                  <Check className={`h-3.5 w-3.5 ${confirmPassword.length > 0 && isMatch ? "text-emerald-600 font-bold" : "text-slate-400"}`} />
                  Konfirmasi password sesuai
                </li>
              </ul>
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/karyawan"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={!isSubmittable}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Daftarkan Karyawan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


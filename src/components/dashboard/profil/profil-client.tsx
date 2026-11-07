"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { AlertBanner } from "@/components/ui/alert-banner";
import { updateProfileAction, type ProfileActionResult } from "@/app/actions/profil";
import { APP_NAME } from "@/libs/constants";

interface ProfilClientProps {
  initialProfile: {
    id: string;
    username: string;
    full_name: string;
    email: string | null;
    role: "superadmin" | "karyawan";
    is_active: boolean;
  };
}

export function ProfilClient({ initialProfile }: ProfilClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const initialEmail =
    initialProfile.email && !initialProfile.email.endsWith("@ngeteh-skuyy.internal")
      ? initialProfile.email
      : "";
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formState, setFormState] = useState<ProfileActionResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = initialProfile.role === "superadmin";

  // Validasi real-time password & email (email opsional)
  const isEmailValid =
    email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasMinLen = newPassword.length >= 8;
  const hasLetters = /[A-Za-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const isMatch = newPassword === confirmPassword;
  const isPasswordValid =
    newPassword.length === 0 || (hasMinLen && hasLetters && hasNumbers && isMatch);

  const isSubmittable =
    fullName.trim().length >= 2 && isEmailValid && isPasswordValid && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmittable) return;

    setFormState(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateProfileAction({
        full_name: fullName.trim(),
        email: email.trim(),
        password: newPassword.trim() || undefined,
        confirm_password: confirmPassword.trim() || undefined,
      });

      setFormState(res);
      if (res.success) {
        setSuccessMessage(res.message || "Profil berhasil diperbarui.");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Navigasi */}
      <Breadcrumbs items={[{ label: "Profil Akun" }]} />

      {/* notifikasi sukses aksi crud */}
      {successMessage && (
        <AlertBanner
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Header Halaman */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Profil Akun Pengguna
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Kelola informasi identitas akun operasional {APP_NAME}.
        </p>
      </div>

      {/* Kontainer Formulir Proporsional */}
      <div className="max-w-4xl space-y-6">
        {/* Kartu Ringkasan Akun */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="h-20 w-20 rounded-full bg-tea-100 text-tea-800 flex items-center justify-center shrink-0">
            <User className="h-10 w-10 text-tea-800" />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 truncate">
                {fullName || initialProfile.username}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold self-center sm:self-auto ${
                  isOwner
                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {isOwner ? "Owner (Superadmin)" : "Karyawan (Kasir)"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                @{initialProfile.username}
              </span>
              {email ? (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {email}
                </span>
              ) : null}
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Akun Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Notifikasi Hasil Submit */}
        {formState?.error && (
          <div className="flex items-center gap-2.5 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{formState.error}</span>
          </div>
        )}

        {/* Panel Form Update Profil */}
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-base font-bold text-slate-900">
              Perbarui Data Profil
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah data nama tampilan atau perbarui password akun Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nama Lengkap */}
            <div className="space-y-1.5 sm:col-span-2">
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

            {/* Email (Opsional) */}
            <div className="space-y-1.5 sm:col-span-2">
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

            {/* Username (Read-only) */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={initialProfile.username}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm text-slate-500 cursor-not-allowed select-none"
              />
            </div>

            {/* Tingkat Akses (Read-only) */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                Hak Akses
              </label>
              <div className="flex items-center gap-2 py-2.5 px-3.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 select-none">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span className="capitalize">{initialProfile.role}</span>
              </div>
            </div>
          </div>

          {/* Section Ubah Password */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <KeyRound className="h-4 w-4 text-tea-700" />
              <span>Ganti Password (Opsional)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Password Baru */}
              <div className="space-y-1.5">
                <label htmlFor="new_password" className="block text-sm font-medium text-slate-700">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-3.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formState?.fieldErrors?.password && (
                  <p className="text-rose-500 text-xs mt-1">
                    {formState.fieldErrors.password[0]}
                  </p>
                )}
              </div>

              {/* Konfirmasi Password Baru */}
              <div className="space-y-1.5">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Masukkan konfirmasi password"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-3.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formState?.fieldErrors?.confirm_password && (
                  <p className="text-rose-500 text-xs mt-1">
                    {formState.fieldErrors.confirm_password[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Checklist Validasi Password Real-time (Hanya jika pengguna mengetik password) */}
            {newPassword.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <p className="font-medium text-slate-700">Persyaratan Password Baru:</p>
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
          </div>

          {/* Tombol Aksi Update Profil */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={!isSubmittable}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


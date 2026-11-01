"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { loginAction, type LoginActionResult } from "@/app/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState<LoginActionResult | null>(null);

  // Periksa kelengkapan input wajib
  const isFormValid = username.trim().length > 0 && password.length >= 8;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid || isPending) {
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAction(null, formData);
      setState(res);

      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Reset password demi keamanan saat login gagal
        setPassword("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Notifikasi galat umum */}
      {state?.error && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg text-sm text-rose-700 bg-rose-50 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Field Username */}
      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-700"
        >
          Username <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (state?.fieldErrors?.username) {
              setState((prev) => (prev ? { ...prev, fieldErrors: { ...prev.fieldErrors, username: undefined } } : null));
            }
          }}
          placeholder="Masukkan username"
          disabled={isPending}
          className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {state?.fieldErrors?.username && state.fieldErrors.username.length > 0 && (
          <p className="text-rose-500 text-xs mt-1">
            {state.fieldErrors.username[0]}
          </p>
        )}
      </div>

      {/* Field Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Password <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (state?.fieldErrors?.password) {
                setState((prev) => (prev ? { ...prev, fieldErrors: { ...prev.fieldErrors, password: undefined } } : null));
              }
            }}
            placeholder="Masukkan password"
            disabled={isPending}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 pl-3.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-tea-600 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={isPending}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {state?.fieldErrors?.password && state.fieldErrors.password.length > 0 && (
          <p className="text-rose-500 text-xs mt-1">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Tombol Aksi Utama */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={!isFormValid || isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-tea-700 hover:bg-tea-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-tea-600 focus:ring-offset-2 transition-colors shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

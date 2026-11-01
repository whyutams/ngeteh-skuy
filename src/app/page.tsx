import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-slate-900">
      {/* Sisi Kiri: Branding & Nuansa Teh (Warna Solid, Bersih Tanpa AI Slop) */}
      <section className="hidden lg:flex lg:col-span-7 xl:col-span-8 flex-col justify-between p-12 xl:p-16 bg-tea-900 text-white">
        {/* Brand & Logo Resmi */}
        <div className="flex items-center gap-3">
          <Image
            src="/img/logo-ngeteh-skuyy-hd.png"
            alt="Logo NGETEH SKUYY"
            width={44}
            height={44}
            className="rounded-xl shadow-sm object-cover"
          />
          <span className="text-xl font-bold tracking-tight text-white">
            NGETEH SKUYY
          </span>
        </div>

        {/* Pesan Utama */}
        <div className="space-y-4 max-w-lg">
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
            Seduhan hangat, suasana tenang, layanan tertata rapi.
          </h1>
          <p className="text-sm text-amber-100/80 leading-relaxed">
            Platform operasional NGETEH SKUYY. Kelola layanan, stok seduhan, dan data transaksi dengan sistem yang andal.
          </p>
        </div>

        {/* Ruang Bawah Bersih */}
        <div />
      </section>

      {/* Sisi Kanan: Panel Form Login (Lebih Ramping, Tema Terang Bersih) */}
      <section className="flex flex-col justify-center items-center lg:col-span-5 xl:col-span-4 p-6 sm:p-10 xl:p-12 bg-white border-l border-slate-200">
        <div className="w-full max-w-sm space-y-7">
          {/* Header Mobile Brand (Tampil di Layar Kecil) */}
          <div className="lg:hidden flex items-center gap-3 pb-3 border-b border-slate-200">
            <Image
              src="/img/logo-ngeteh-skuyy-hd.png"
              alt="Logo NGETEH SKUYY"
              width={36}
              height={36}
              className="rounded-lg shadow-sm object-cover"
            />
            <span className="font-bold text-lg text-slate-900">
              NGETEH SKUYY
            </span>
          </div>

          {/* Header Form */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Login
            </h2>
            <p className="text-sm text-slate-500">
              Masukkan username dan password akun Anda untuk melanjutkan.
            </p>
          </div>

          {/* Form Login Interaktif */}
          <LoginForm />

          {/* Footer Hak Cipta */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              &copy; 2026 NGETEH SKUYY. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

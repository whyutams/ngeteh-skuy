import Link from "next/link";
import {
  ShoppingBag,
  FolderTree,
  CupSoda,
  Boxes,
  Users,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumb";
import { getCurrentSession } from "@/libs/auth-session";
import { createAdminClient } from "@/libs/supabase/admin";
import { APP_NAME } from "@/libs/constants";

export const metadata = {
  title: `Dashboard - ${APP_NAME}`,
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const isOwner = session.isSuperadmin;

  let totalMenu = 0;
  let totalKategori = 0;
  let stokMenipis = 0;
  let totalKaryawan = 0;

  try {
    const admin = createAdminClient();

    const [
      { count: menuCount },
      { count: katCount },
      { count: stokCount },
      { count: empCount },
    ] = await Promise.all([
      admin.from("produk_menu").select("*", { count: "exact", head: true }),
      admin.from("kategori_menu").select("*", { count: "exact", head: true }),
      admin
        .from("produk_menu")
        .select("*", { count: "exact", head: true })
        .lte("stok", 5),
      admin
        .from("profil_pengguna")
        .select("*", { count: "exact", head: true })
        .eq("role", "karyawan"),
    ]);

    totalMenu = menuCount || 0;
    totalKategori = katCount || 0;
    stokMenipis = stokCount || 0;
    totalKaryawan = empCount || 0;
  } catch {
    // Sembunyikan jika query error
  }

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Penunjuk Navigasi */}
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      {/* Banner Selamat Datang */}
      <div className="p-6 bg-tea-900 text-white rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Selamat datang, {session.profile?.full_name || "Owner"}
          </h2>
          <p className="text-sm text-amber-100/80">
            {isOwner
              ? "Anda memiliki kendali penuh atas manajemen menu, stok, karyawan, dan transaksi operasional."
              : "Siap melayani pesanan seduhan teh pelanggan hari ini."}
          </p>
        </div>

        <Link
          href="/dashboard/kasir"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-tea-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Buka Kasir POS</span>
        </Link>
      </div>

      {/* Grid Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Menu Seduhan */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Menu
            </span>
            <div className="p-2 rounded-lg bg-tea-50 text-tea-700">
              <CupSoda className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalMenu}</div>
            <p className="text-xs text-slate-500 mt-0.5">Produk aktif terdaftar</p>
          </div>
        </div>

        {/* Kategori Menu */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kategori
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalKategori}</div>
            <p className="text-xs text-slate-500 mt-0.5">Pengelompokan menu</p>
          </div>
        </div>

        {/* Peringatan Stok Menipis */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stok Menipis
            </span>
            <div
              className={`p-2 rounded-lg ${
                stokMenipis > 0
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold ${
                stokMenipis > 0 ? "text-rose-600" : "text-slate-900"
              }`}
            >
              {stokMenipis}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Menu stok &le; 5 unit</p>
          </div>
        </div>

        {/* Akun Karyawan */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Staf Karyawan
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalKaryawan}</div>
            <p className="text-xs text-slate-500 mt-0.5">Petugas kasir terdaftar</p>
          </div>
        </div>
      </div>

      {/* Akses Cepat Fitur Owner */}
      {isOwner && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Menu Akses Cepat Owner
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/kategori"
              className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-tea-700 hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-tea-50 text-tea-700">
                  <FolderTree className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-tea-700 transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-tea-700 transition-colors">
                  Kategori Menu
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tambah dan kelola jenis racikan teh.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/menu"
              className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-tea-700 hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-tea-50 text-tea-700">
                  <CupSoda className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-tea-700 transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-tea-700 transition-colors">
                  Data Menu
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur harga jual dan ketersediaan menu.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/stok"
              className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-tea-700 hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-tea-50 text-tea-700">
                  <Boxes className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-tea-700 transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-tea-700 transition-colors">
                  Kelola Stok
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Restok bahan dan penyesuaian porsi riil.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/karyawan"
              className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-tea-700 hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-tea-50 text-tea-700">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-tea-700 transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-tea-700 transition-colors">
                  Kelola Karyawan
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftarkan akun karyawan baru
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


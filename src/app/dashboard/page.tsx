import Link from "next/link";
import Image from "next/image";
import { MenuImage } from "@/components/ui/menu-image";
import {
  Calculator,
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
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const isOwner = session.isSuperadmin;

  let totalMenu = 0;
  let totalKategori = 0;
  let stokMenipis = 0;
  let totalKaryawan = 0;
  let recentMenus: Array<{
    id: string;
    nama_produk: string;
    gambar_url: string | null;
    harga: number;
    stok: number;
    satuan: string;
    kategori_menu?: { nama_kategori: string } | null;
  }> = [];

  try {
    const admin = createAdminClient();

    const [
      { count: menuCount },
      { count: katCount },
      { count: stokCount },
      { count: empCount },
      { data: menuData },
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
      admin
        .from("produk_menu")
        .select("id, nama_produk, gambar_url, harga, stok, satuan, kategori_menu(nama_kategori)")
        .eq("status_aktif", true)
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

    totalMenu = menuCount || 0;
    totalKategori = katCount || 0;
    stokMenipis = stokCount || 0;
    totalKaryawan = empCount || 0;
    recentMenus = (menuData as unknown as typeof recentMenus) || [];
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
          <Calculator className="h-5 w-5" />
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
      {/* Pratinjau Menu Seduhan */}
      {recentMenus.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Menu Seduhan Siap Jual
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Katalog produk teh terpopuler di etalase kasir.
              </p>
            </div>
            <Link
              href="/dashboard/menu"
              className="text-xs font-semibold text-tea-700 hover:text-tea-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua Menu</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentMenus.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-tea-600 transition-colors flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <MenuImage
                    src={p.gambar_url}
                    alt={p.nama_produk}
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                    iconClassName="h-10 w-10 text-tea-700"
                  />
                  {p.kategori_menu && (
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {Array.isArray(p.kategori_menu)
                        ? (p.kategori_menu as unknown as Array<{ nama_kategori: string }>)[0]?.nama_kategori
                        : p.kategori_menu.nama_kategori}
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {p.nama_produk}
                  </h4>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-900">
                      Rp {p.harga.toLocaleString("id-ID")}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Stok: {p.stok}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


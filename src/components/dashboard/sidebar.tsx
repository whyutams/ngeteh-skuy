"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  FolderTree,
  CupSoda,
  Boxes,
  Receipt,
  BarChart3,
  Users,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { APP_NAME, APP_VERSION } from "@/libs/constants";

interface SidebarProps {
  userRole: "superadmin" | "karyawan";
  userName: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  onLogoutClick: () => void;
}

export function Sidebar({
  userRole,
  userName,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  onLogoutClick,
}: SidebarProps) {
  const pathname = usePathname();
  const isOwner = userRole === "superadmin";

  // Daftar navigasi sistem
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      ownerOnly: false,
    },
    {
      name: "Kasir",
      href: "/dashboard/kasir",
      icon: Calculator,
      ownerOnly: false,
    },
    {
      name: "Kategori",
      href: "/dashboard/kategori",
      icon: FolderTree,
      ownerOnly: true,
    },
    {
      name: "Data Menu",
      href: "/dashboard/menu",
      icon: CupSoda,
      ownerOnly: false,
    },
    {
      name: "Kelola Stok",
      href: "/dashboard/stok",
      icon: Boxes,
      ownerOnly: false,
    },
    {
      name: "Data Penjualan",
      href: "/dashboard/penjualan",
      icon: Receipt,
      ownerOnly: false,
    },
    {
      name: "Laporan Penjualan",
      href: "/dashboard/laporan",
      icon: BarChart3,
      ownerOnly: true,
    },
    {
      name: "Kelola Karyawan",
      href: "/dashboard/karyawan",
      icon: Users,
      ownerOnly: true,
    },
  ];

  const allowedItems = navigationItems.filter(
    (item) => !item.ownerOnly || isOwner
  );

  // Render konten navigasi (Dipakai untuk Desktop & Mobile)
  const renderNavContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full w-full bg-tea-900 text-white select-none overflow-hidden">
      {/* Header Sidebar: Brand / Tombol Minimize */}
      <div
        className={`flex items-center h-16 px-3.5 border-b border-tea-800 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {/* Jika ciut (collapsed), logo disembunyikan sementara dan tombol toggle tampil di tengah */}
        {collapsed ? (
          <Tooltip content="Lebarkan Sidebar" position="right">
            <button
              type="button"
              onClick={onToggleCollapseDesktop}
              className="p-2 rounded-lg text-amber-200 hover:text-white hover:bg-tea-800 transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </Tooltip>
        ) : (
          <>
            {/* Tampilan Terbuka: Logo Lingkaran + Nama Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-amber-400 bg-[#f9dc12] shrink-0 shadow-sm">
                <Image
                  src="/img/logo-web.png"
                  alt={`Logo ${APP_NAME}`}
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>

              <span className="font-bold text-base tracking-tight text-white leading-tight truncate uppercase">
                {APP_NAME}
              </span>
            </div>

            {/* Tombol Minimize Desktop di Dalam Sidebar */}
            <div className="hidden lg:block">
              <Tooltip content="Perkecil Sidebar" position="bottom">
                <button
                  type="button"
                  onClick={onToggleCollapseDesktop}
                  className="p-1.5 rounded-lg text-amber-200/80 hover:text-white hover:bg-tea-800 transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </Tooltip>
            </div>

            {/* Tombol Tutup Mobile */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-amber-200/80 hover:text-white hover:bg-tea-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Menu Navigasi (Icon berada tepat di tengah saat ciut) */}
      <nav
        className={`flex-1 p-2 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar ${
          collapsed ? "flex flex-col items-center" : "px-3"
        }`}
      >
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const linkElement = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                collapsed
                  ? "w-10 h-10 justify-center mx-auto"
                  : "gap-3 px-3.5 py-2.5"
              } ${
                isActive
                  ? "bg-tea-700 text-white shadow-sm ring-1 ring-amber-400/40"
                  : "text-amber-100/80 hover:bg-tea-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );

          // Jika sidebar diciutkan, bungkus item dalam tooltip
          return collapsed ? (
            <Tooltip key={item.href} content={item.name} position="right">
              {linkElement}
            </Tooltip>
          ) : (
            linkElement
          );
        })}
      </nav>

      {/* Copyright & Versi Aplikasi Resmi */}
      <div className="p-3 border-t border-tea-800 bg-tea-950/40 text-center select-none">
        {collapsed ? (
          <Tooltip
            content={`© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved. (v${APP_VERSION})`}
            position="right"
          >
            <div className="flex flex-col items-center justify-center text-center cursor-default">
              <span className="text-[10px] font-medium text-amber-200/60">
                v{APP_VERSION}
              </span>
            </div>
          </Tooltip>
        ) : (
          <div className="space-y-0.5">
            <p className="text-[11px] text-amber-200/70 leading-relaxed font-normal">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="text-[10px] text-amber-200/50">
              v{APP_VERSION}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Bisa Diciutkan / Expanded) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-tea-800 shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsedDesktop ? "w-18" : "w-64"
        }`}
      >
        {renderNavContent(isCollapsedDesktop)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer Panel (Selalu Mode Lebar Penuh) */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out overflow-hidden ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent(false)}
      </div>
    </>
  );
}

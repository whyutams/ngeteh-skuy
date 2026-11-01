"use client";

import { Menu } from "lucide-react";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { WitaClock } from "@/components/dashboard/wita-clock";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  userName: string;
  userRole: "superadmin" | "karyawan";
  userEmail?: string | null;
  onLogoutClick: () => void;
}

// Header bagian atas dashboard dengan jam WITA dan profil dropdown
export function DashboardHeader({
  onOpenMobileSidebar,
  userName,
  userRole,
  userEmail,
  onLogoutClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200 shadow-xs select-none">
      {/* Sisi Kiri: Tombol Hamburger Mobile & Jam Operasional WITA */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Jam Real-time WITA (Menggantikan Teks Brand) */}
        <WitaClock />
      </div>

      {/* Sisi Kanan: Dropdown Profil Akun */}
      <div className="flex items-center gap-3">
        <ProfileDropdown
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          onLogoutClick={onLogoutClick}
        />
      </div>
    </header>
  );
}

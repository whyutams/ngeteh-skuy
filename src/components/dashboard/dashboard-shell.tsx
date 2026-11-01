"use client";

import { useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { logoutAction } from "@/app/actions/logout";

interface DashboardShellProps {
  userRole: "superadmin" | "karyawan";
  userName: string;
  userEmail?: string | null;
  children: ReactNode;
}

// Shell pembungkus antarmuka dashboard dengan sidebar collapsible dan profil header
export function DashboardShell({
  userRole,
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigasi (Mendukung Ciut/Expanded) */}
      <Sidebar
        userRole={userRole}
        userName={userName}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsedDesktop={isCollapsedDesktop}
        onToggleCollapseDesktop={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* Area Konten Utama (Lebar Penuh) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onLogoutClick={() => setShowLogoutModal(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>

      {/* Modal Dialog Konfirmasi Logout Universal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar dari sesi akun ini?"
        confirmText="Logout"
        cancelText="Batal"
        variant="danger"
        isLoading={isLoggingOut}
        icon={<LogOut className="h-6 w-6 text-rose-600" />}
      />
    </div>
  );
}

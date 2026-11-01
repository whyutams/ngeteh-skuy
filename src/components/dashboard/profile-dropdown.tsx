"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown } from "lucide-react";

interface ProfileDropdownProps {
  userName: string;
  userRole: "superadmin" | "karyawan";
  userEmail?: string | null;
  onLogoutClick: () => void;
}

export function ProfileDropdown({
  userName,
  userRole,
  userEmail,
  onLogoutClick,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = userRole === "superadmin";

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Pemicu Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors select-none cursor-pointer"
      >
        {/* Avatar Profil Person/User */}
        <div className="h-8 w-8 rounded-full bg-tea-100 text-tea-800 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-tea-800" />
        </div>

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
            {userName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {isOwner ? "Owner" : "Kasir"}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Profil Dropdown */}
          <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-tea-100 text-tea-800 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-tea-800" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {userEmail || `${userName}@ngeteh-skuyy.internal`}
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isOwner
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {isOwner ? "Owner (Superadmin)" : "Karyawan (Kasir)"}
                </span>
              </div>
            </div>
          </div>

          {/* Item Aksi Dropdown */}
          <div className="p-1 space-y-0.5">
            <Link
              href="/dashboard/profil"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span>Profil Akun</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogoutClick();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

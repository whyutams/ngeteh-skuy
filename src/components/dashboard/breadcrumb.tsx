"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Komponen penunjuk jejak navigasi halaman (menggunakan teks "Dashboard", tanpa ikon rumah)
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Jika sedang di halaman utama Dashboard itu sendiri
  const isDashboardHome =
    items.length === 0 ||
    (items.length === 1 && items[0].label.toLowerCase() === "dashboard");

  if (isDashboardHome) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 mb-4 select-none">
        <span className="font-semibold text-slate-900">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 mb-4 select-none">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {/* Tautan Induk: Teks "Dashboard" */}
        <li>
          <Link
            href="/dashboard"
            className="font-medium text-slate-500 hover:text-tea-700 transition-colors"
          >
            Dashboard
          </Link>
        </li>

        {/* Jejak Rute Turunan */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-slate-900 truncate">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-medium text-slate-500 hover:text-tea-700 transition-colors truncate"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

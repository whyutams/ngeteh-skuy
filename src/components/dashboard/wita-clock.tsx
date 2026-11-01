"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

// Komponen penampil jam waktu Indonesia Tengah (WITA - UTC+8) secara real-time
export function WitaClock() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      // Format waktu dalam zona WITA (Asia/Makassar)
      const timeFormatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Makassar",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);

      // Format tanggal
      const dateFormatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Makassar",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now);

      setTime(`${timeFormatted} WITA`);
      setDate(dateFormatted);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-slate-700 select-none">
      <div className="p-1.5 rounded-lg bg-amber-50 text-tea-700">
        <Clock className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-1.5">
        {date && (
          <span className="hidden md:inline text-xs text-slate-500 font-medium">
            {date} &bull;
          </span>
        )}
        <span className="font-semibold text-slate-900 tracking-tight">
          {time || "--:--:-- WITA"}
        </span>
      </div>
    </div>
  );
}


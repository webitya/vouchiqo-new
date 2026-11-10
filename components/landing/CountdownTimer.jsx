"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function CountdownTimer() {
  const [countdownTime, setCountdownTime] = useState("24:00:00");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;

      if (diff <= 0) {
        setCountdownTime("00:00:00");
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setCountdownTime(
        `${hrs.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      );
    };

    updateTimer(); // Run once immediately to prevent hydration mismatch layout shifts
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl w-fit">
      <Clock className="w-4 h-4 text-[#2563eb] animate-pulse" />
      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
        Ends In:
      </span>
      <span className="font-mono text-sm md:text-base font-black text-[#FFB020] tracking-widest">
        {countdownTime}
      </span>
    </div>
  );
}

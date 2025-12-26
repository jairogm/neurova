"use client";

import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useState, useEffect } from "react";

export function SessionTimeoutDebug() {
  const { getRemainingTime } = useSessionTimeout();
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-mono z-50">
      Session: {formatTime(remainingTime)}
    </div>
  );
}
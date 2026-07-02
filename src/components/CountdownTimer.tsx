"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string | Date;
  label?: string;
  onComplete?: () => void;
}

function getRemainingTime(targetDate: Date) {
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    return { minutes: 0, seconds: 0, isComplete: true };
  }

  const minutes = Math.floor(difference / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  return { minutes, seconds, isComplete: false };
}

export function CountdownTimer({
  targetDate,
  label = "Time remaining",
  onComplete,
}: CountdownTimerProps) {
  const target = new Date(targetDate);
  const [remaining, setRemaining] = useState(() => getRemainingTime(target));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemainingTime(target);
      setRemaining(next);

      if (next.isComplete) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target, onComplete]);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <p className="text-sm text-amber-200/80">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-widest text-amber-300">
        {String(remaining.minutes).padStart(2, "0")}:
        {String(remaining.seconds).padStart(2, "0")}
      </p>
    </div>
  );
}

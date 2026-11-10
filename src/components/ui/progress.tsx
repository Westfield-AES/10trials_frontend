"use client";

import { useEffect, useState } from "react";

export function Progress({
  value,
  label,
  estimated = false,
}: {
  value: number;
  label?: string;
  estimated?: boolean;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && <div className="mb-2 text-xs font-bold">{label}</div>}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-[#dcebf4]"
        aria-label={label}
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={
          estimated && safe < 100 ? "Working, progress estimated" : undefined
        }
      >
        <div
          className="h-full rounded-full bg-[#ff6b00] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export function EstimatedProgress({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const [estimate, setEstimate] = useState(5);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEstimate((current) =>
        Math.min(90, current + Math.max(0.2, (90 - current) * 0.04)),
      );
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  const displayed =
    value >= 100 ? 100 : Math.max(estimate, Math.min(95, value));
  return <Progress value={displayed} label={label} estimated />;
}

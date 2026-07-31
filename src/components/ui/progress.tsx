export function Progress({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="mb-2 text-xs font-bold">{label}</div>
      )}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-[#dcebf4]"
        aria-label={label}
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#ff6b00] transition-[width]"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

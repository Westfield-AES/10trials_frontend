export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 text-sm font-bold text-[#607282]"
    >
      <span className="size-9 animate-spin rounded-full border-4 border-[#dcebf4] border-t-[#ff6b00]" />
      <span>{label}</span>
    </div>
  );
}

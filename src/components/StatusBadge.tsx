interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  ACTIVE: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30"
      }`}
    >
      {status}
    </span>
  );
}

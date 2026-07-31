// Status is never carried by color alone — each chip pairs a fixed status
// hue with its own icon glyph and label, per the house dataviz rule (status
// colors ship with an icon + label, never color-only).
export const STATUS_META: Record<
  string,
  { label: string; icon: string; bg: string; fg: string }
> = {
  PENDING: { label: "Beklemede", icon: "⏳", bg: "#fef3d6", fg: "#8a5a00" },
  PAID: { label: "Ödendi", icon: "✓", bg: "#e3f7e3", fg: "#0c6b0c" },
  FULFILLED: { label: "Kargolandı", icon: "▲", bg: "#e3f7e3", fg: "#0c6b0c" },
  CANCELLED: { label: "İptal", icon: "✕", bg: "#fbe4e4", fg: "#a12525" },
};

export function StatusChips({ counts }: { counts: Record<string, number> }) {
  const order = ["PENDING", "PAID", "FULFILLED", "CANCELLED"];
  return (
    <div className="flex flex-wrap gap-2">
      {order.map((status) => {
        const meta = STATUS_META[status];
        const count = counts[status] ?? 0;
        return (
          <div
            key={status}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: meta.bg, color: meta.fg }}
          >
            <span aria-hidden>{meta.icon}</span>
            <span>{count}</span>
            <span className="opacity-80">{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, icon: "•", bg: "#f2f2f0", fg: "#52514e" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}

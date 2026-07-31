import { formatMoney } from "@/lib/format";

// Horizontal bar list — ranked magnitude across a handful of named items, so
// (per the dataviz method) identity comes from the row label, not from hue:
// every bar shares one sequential blue, and — since there are only a few rows
// — each gets a direct value label at its tip rather than relying solely on
// a shared axis.
export function TopProductsChart({
  data,
  currency,
}: {
  data: { title: string; revenue: number }[];
  currency: string;
}) {
  if (data.length === 0) {
    return <p className="text-neutral-500 text-sm">Henüz satış verisi yok.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.revenue));

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = Math.max(4, (d.revenue / max) * 100);
        return (
          <div key={d.title}>
            <div className="flex justify-between text-sm mb-1">
              <span className="truncate pr-2 text-neutral-700">{d.title}</span>
              <span className="font-semibold text-neutral-900 shrink-0">
                {formatMoney(d.revenue, currency)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2a78d6] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

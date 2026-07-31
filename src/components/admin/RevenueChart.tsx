import { formatMoney } from "@/lib/format";

// Hand-rolled SVG bar chart — no charting library needed for a single-series
// "revenue over the last N days" view. Follows the house dataviz spec: thin
// bars (capped width, never filling the slot), 4px rounded data-end square at
// the baseline, hairline recessive gridlines, one hue (sequential blue), and
// a direct label only on the one bar the story is about (today) rather than
// flooding every bar with a number.
//
// Note: deliberately NOT using an SVG <title> child for a native tooltip —
// Next.js's App Router treats any <title> element in the tree as page-title
// metadata to hoist into <head>, which collides with per-bar SVG titles and
// causes a hydration mismatch. aria-label carries the same info for
// assistive tech without triggering that.
export function RevenueChart({
  data,
  currency,
}: {
  data: { label: string; value: number }[];
  currency: string;
}) {
  const width = 700;
  const height = 200;
  const padding = { top: 16, right: 8, bottom: 24, left: 8 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = plotW / data.length;
  const barW = Math.min(24, slot * 0.55);
  const gridLines = 3;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Son 14 günlük ciro grafiği">
        {/* Recessive hairline gridlines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padding.top + (plotH / gridLines) * i;
          return (
            <line
              key={i}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#e1e0d9"
              strokeWidth={1}
            />
          );
        })}

        {data.map((d, i) => {
          const barH = max > 0 ? (d.value / max) * plotH : 0;
          const x = padding.left + i * slot + (slot - barW) / 2;
          const y = padding.top + plotH - barH;
          const isLast = i === data.length - 1;
          return (
            <g key={i}>
              <rect
                x={x}
                y={barH > 0 ? y : padding.top + plotH - 1}
                width={barW}
                height={Math.max(barH, 1)}
                rx={4}
                fill={isLast ? "#1c5cab" : "#2a78d6"}
                aria-label={`${d.label}: ${formatMoney(d.value, currency)}`}
              />
              {isLast && d.value > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-neutral-900"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  {formatMoney(d.value, currency)}
                </text>
              )}
              {(i % Math.ceil(data.length / 7) === 0 || isLast) && (
                <text
                  x={x + barW / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-neutral-400"
                  style={{ fontSize: 9 }}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

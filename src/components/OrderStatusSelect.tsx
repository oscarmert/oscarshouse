"use client";

import { useTransition } from "react";

const STATUSES = [
  { value: "PENDING", label: "Beklemede" },
  { value: "PAID", label: "Ödendi" },
  { value: "FULFILLED", label: "Kargolandı" },
  { value: "CANCELLED", label: "İptal" },
];

export function OrderStatusSelect({
  currentStatus,
  onChange,
}: {
  currentStatus: string;
  onChange: (status: "PENDING" | "PAID" | "FULFILLED" | "CANCELLED") => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";
        startTransition(() => {
          onChange(value);
        });
      }}
      className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

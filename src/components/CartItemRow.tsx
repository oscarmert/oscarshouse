"use client";

import { useTransition } from "react";
import { formatMoney } from "@/lib/format";

export function CartItemRow({
  item,
  currency,
  onUpdateQuantity,
}: {
  item: { id: string; title: string; quantity: number; priceAtAdd: number; imageUrl: string | null };
  currency: string;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  const setQty = (qty: number) => {
    startTransition(() => {
      onUpdateQuantity(item.id, qty);
    });
  };

  return (
    <div
      className={`flex items-center gap-4 py-4 border-b border-neutral-100 last:border-0 -mx-2 px-2 rounded-lg transition-all duration-200 hover:bg-neutral-50 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-neutral-400 text-xs">Görsel yok</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-sm text-neutral-500">{formatMoney(item.priceAtAdd, currency)}</p>
      </div>
      <div className="flex items-center gap-2" aria-disabled={pending}>
        <button
          onClick={() => setQty(item.quantity - 1)}
          className="w-7 h-7 border border-neutral-300 rounded-full hover:bg-neutral-100 hover:border-neutral-400 active:scale-90 transition-all disabled:opacity-50"
          disabled={pending}
        >
          −
        </button>
        <span className="w-6 text-center tabular-nums">{item.quantity}</span>
        <button
          onClick={() => setQty(item.quantity + 1)}
          className="w-7 h-7 border border-neutral-300 rounded-full hover:bg-neutral-100 hover:border-neutral-400 active:scale-90 transition-all disabled:opacity-50"
          disabled={pending}
        >
          +
        </button>
      </div>
      <p className="w-24 text-right font-medium">{formatMoney(item.priceAtAdd * item.quantity, currency)}</p>
      <button
        onClick={() => setQty(0)}
        disabled={pending}
        className="text-red-500 text-sm hover:underline underline-offset-4 ml-2 transition-opacity hover:opacity-70"
      >
        Kaldır
      </button>
    </div>
  );
}

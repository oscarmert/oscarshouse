"use client";

import { useState } from "react";

// A pleasant +/- stepper over a plain number input. Kept as the only client
// bit on the product page — the surrounding <form> still posts to a Server
// Action, this component just makes adjusting the quantity nicer than
// typing into a bare <input type="number">.
export function QuantityStepper({
  max,
  name = "quantity",
  defaultValue = 1,
  disabled = false,
}: {
  max: number;
  name?: string;
  defaultValue?: number;
  disabled?: boolean;
}) {
  const [qty, setQty] = useState(defaultValue);
  const clamp = (n: number) => Math.min(Math.max(1, max), Math.max(1, n));

  return (
    <div className="inline-flex items-center border border-neutral-300 rounded-lg overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setQty((q) => clamp(q - 1))}
        className="w-9 h-10 flex items-center justify-center text-lg hover:bg-neutral-100 active:scale-90 transition-all disabled:opacity-40"
        aria-label="Azalt"
      >
        −
      </button>
      <input
        type="number"
        name={name}
        value={qty}
        min={1}
        max={Math.max(1, max)}
        disabled={disabled}
        onChange={(e) => setQty(clamp(Number(e.target.value) || 1))}
        className="w-12 h-10 text-center border-x border-neutral-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setQty((q) => clamp(q + 1))}
        className="w-9 h-10 flex items-center justify-center text-lg hover:bg-neutral-100 active:scale-90 transition-all disabled:opacity-40"
        aria-label="Artır"
      >
        +
      </button>
    </div>
  );
}

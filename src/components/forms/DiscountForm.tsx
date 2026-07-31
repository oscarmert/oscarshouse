"use client";

import { useActionState } from "react";
import type { DiscountFormState } from "@/actions/discounts";

const initialState: DiscountFormState = undefined;

export function DiscountForm({
  action,
}: {
  action: (state: DiscountFormState, formData: FormData) => Promise<DiscountFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid sm:grid-cols-4 gap-3 items-start">
      <div>
        <input
          name="code"
          placeholder="KOD (örn. HOSGELDIN10)"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.code && <p className="text-red-600 text-xs mt-1">{state.fieldErrors.code}</p>}
      </div>
      <div>
        <select name="type" className="w-full rounded-lg border border-neutral-300 px-3 py-2">
          <option value="PERCENTAGE">Yüzde (%)</option>
          <option value="FIXED">Sabit tutar</option>
        </select>
      </div>
      <div>
        <input
          name="value"
          type="number"
          min="0"
          step="0.01"
          placeholder="Değer"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.value && <p className="text-red-600 text-xs mt-1">{state.fieldErrors.value}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-neutral-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-60 whitespace-nowrap"
      >
        {pending ? "Ekleniyor..." : "+ Kod ekle"}
      </button>
    </form>
  );
}

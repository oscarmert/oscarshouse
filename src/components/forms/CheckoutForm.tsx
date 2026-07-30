"use client";

import { useActionState } from "react";
import type { CheckoutState } from "@/actions/checkout";

const initialState: CheckoutState = undefined;

export function CheckoutForm({
  action,
  buttonClass,
}: {
  action: (state: CheckoutState, formData: FormData) => Promise<CheckoutState>;
  buttonClass: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ad soyad</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
          />
          {state?.fieldErrors?.name && <p className="text-red-600 text-sm mt-1">{state.fieldErrors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
          />
          {state?.fieldErrors?.email && (
            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adres</label>
        <input name="line1" required className="w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400" />
        {state?.fieldErrors?.line1 && <p className="text-red-600 text-sm mt-1">{state.fieldErrors.line1}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Şehir</label>
          <input name="city" required className="w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400" />
          {state?.fieldErrors?.city && <p className="text-red-600 text-sm mt-1">{state.fieldErrors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Posta kodu</label>
          <input
            name="postalCode"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
          />
          {state?.fieldErrors?.postalCode && (
            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.postalCode}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ülke</label>
          <input
            name="country"
            required
            defaultValue="Türkiye"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
          />
          {state?.fieldErrors?.country && (
            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.country}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Bu bir demo ödeme akışıdır — gerçek bir ödeme sağlayıcısına bağlı değildir, sipariş anında
        &quot;ödendi&quot; olarak işaretlenir.
      </p>

      <button
        type="submit"
        disabled={pending}
        className={`w-full py-3 rounded-lg font-medium transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:hover:shadow-none disabled:active:scale-100 ${buttonClass}`}
      >
        {pending ? "İşleniyor..." : "Siparişi tamamla"}
      </button>
    </form>
  );
}

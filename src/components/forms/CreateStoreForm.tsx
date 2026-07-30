"use client";

import { useActionState } from "react";
import { createStoreAction, type FormState } from "@/actions/platform";

const initialState: FormState = undefined;

export function CreateStoreForm() {
  const [state, formAction, pending] = useActionState(createStoreAction, initialState);

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          name="storeName"
          placeholder="Yeni mağaza adı"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.storeName && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.storeName}</p>
        )}
      </div>
      <div className="flex-1">
        <input
          name="subdomain"
          placeholder="alt-alan-adi"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.subdomain && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.subdomain}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-neutral-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-60 whitespace-nowrap"
      >
        {pending ? "Oluşturuluyor..." : "+ Mağaza oluştur"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import type { FormState } from "@/actions/catalog";

const initialState: FormState = undefined;

export function CategoryForm({
  action,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex gap-3">
      <div className="flex-1">
        <input
          name="name"
          placeholder="Kategori adı"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.name && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.name}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-neutral-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-60 whitespace-nowrap"
      >
        {pending ? "Ekleniyor..." : "+ Ekle"}
      </button>
    </form>
  );
}

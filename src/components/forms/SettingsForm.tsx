"use client";

import { useActionState } from "react";
import type { FormState } from "@/actions/catalog";
import { THEMES, CURRENCIES, LANGUAGES } from "@/lib/themes";

const initialState: FormState = undefined;

export function SettingsForm({
  action,
  store,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  store: { name: string; theme: string; currency: string; language: string };
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state && !state.error && !state.fieldErrors && (
        <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Ayarlar kaydedildi.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Mağaza adı</label>
        <input
          name="name"
          defaultValue={store.name}
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.name && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tema</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(THEMES).map(([id, theme]) => (
            <label
              key={id}
              className="flex items-center gap-2 border border-neutral-300 rounded-lg px-3 py-2 cursor-pointer has-[:checked]:border-neutral-900 has-[:checked]:ring-1 has-[:checked]:ring-neutral-900"
            >
              <input type="radio" name="theme" value={id} defaultChecked={store.theme === id} />
              <span className={`w-4 h-4 rounded-full ${theme.swatchClass}`} />
              <span className="text-sm">{theme.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Para birimi</label>
          <select
            name="currency"
            defaultValue={store.currency}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dil</label>
          <select
            name="language"
            defaultValue={store.language}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            {Object.entries(LANGUAGES).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}

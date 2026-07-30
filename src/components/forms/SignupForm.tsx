"use client";

import { useActionState } from "react";
import { signupAction, type FormState } from "@/actions/platform";

const initialState: FormState = undefined;

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">
          Adınız
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.name && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.email && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.password && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.password}</p>
        )}
      </div>

      <hr className="my-4" />

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="storeName">
          Mağaza adı
        </label>
        <input
          id="storeName"
          name="storeName"
          required
          placeholder="Örn. Mert'in Butiği"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.storeName && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.storeName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="subdomain">
          Mağaza adresi
        </label>
        <div className="flex items-center rounded-lg border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900">
          <input
            id="subdomain"
            name="subdomain"
            required
            placeholder="magazam"
            pattern="[a-z0-9-]+"
            className="flex-1 px-3 py-2 focus:outline-none"
          />
          <span className="px-3 text-neutral-500 text-sm bg-neutral-50">.oscarshouse.com</span>
        </div>
        {state?.fieldErrors?.subdomain && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.subdomain}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-neutral-900 text-white py-2.5 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Oluşturuluyor..." : "Mağazamı oluştur"}
      </button>
    </form>
  );
}

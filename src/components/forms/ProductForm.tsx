"use client";

import { useActionState } from "react";
import type { FormState } from "@/actions/catalog";

const initialState: FormState = undefined;

type Category = { id: string; name: string };
type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  inventory: number;
  categoryId: string | null;
  status: "ACTIVE" | "DRAFT";
};

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: Category[];
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">Ürün adı</label>
        <input
          name="title"
          required
          defaultValue={product?.title}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {state?.fieldErrors?.title && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Açıklama</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fiyat</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          {state?.fieldErrors?.price && (
            <p className="text-red-600 text-sm mt-1">{state.fieldErrors.price}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İndirim öncesi fiyat (opsiyonel)</label>
          <input
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.compareAtPrice ?? undefined}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stok adedi</label>
          <input
            name="inventory"
            type="number"
            min="0"
            defaultValue={product?.inventory ?? 0}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Durum</label>
          <select
            name="status"
            defaultValue={product?.status ?? "ACTIVE"}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="ACTIVE">Yayında</option>
            <option value="DRAFT">Taslak</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kategori</label>
        <select
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="">Kategorisiz</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Görsel URL (opsiyonel)</label>
        <input
          name="imageUrl"
          defaultValue={product?.imageUrl ?? ""}
          placeholder="https://..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : product ? "Değişiklikleri kaydet" : "Ürünü oluştur"}
      </button>
    </form>
  );
}

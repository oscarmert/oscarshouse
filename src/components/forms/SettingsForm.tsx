"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/actions/catalog";
import { THEMES, HEADER_STYLES, CURRENCIES, LANGUAGES, type HeaderStyleId } from "@/lib/themes";

const initialState: FormState = undefined;

// Tiny wireframe mockup of a header layout — pure CSS blocks, no real
// screenshots needed. Used both as the small per-option preview inside the
// radio grid, and (scaled up) as the "live" preview panel below it.
function HeaderMockup({
  styleId,
  headerBg,
  accent,
  size = "sm",
}: {
  styleId: string;
  headerBg: string;
  accent: string;
  size?: "sm" | "lg";
}) {
  const bar = accent;
  const dims = size === "lg" ? "h-16" : "h-10";
  const logoW = size === "lg" ? "w-14 h-3" : "w-8 h-1.5";
  const pillW = size === "lg" ? "w-10 h-2.5" : "w-6 h-1";
  const iconS = size === "lg" ? "w-4 h-4" : "w-2.5 h-2.5";

  if (styleId === "centered") {
    return (
      <div className={`${headerBg} ${dims} rounded-md flex flex-col items-center justify-center gap-1.5 px-3`}>
        <div className={`${logoW} rounded-sm`} style={{ background: bar }} />
        <div className="flex gap-1.5">
          <div className={`${pillW} rounded-full`} style={{ background: bar, opacity: 0.7 }} />
          <div className={`${pillW} rounded-full`} style={{ background: bar, opacity: 0.7 }} />
        </div>
      </div>
    );
  }

  if (styleId === "announcement") {
    return (
      <div className={`${dims} rounded-md overflow-hidden flex flex-col`}>
        <div className="h-2 w-full" style={{ background: bar, opacity: 0.5 }} />
        <div className={`${headerBg} flex-1 flex items-center justify-between px-3`}>
          <div className={`${logoW} rounded-sm`} style={{ background: bar }} />
          <div className="flex gap-1.5">
            <div className={`${pillW} rounded-full`} style={{ background: bar, opacity: 0.7 }} />
            <div className={`${pillW} rounded-full`} style={{ background: bar, opacity: 0.7 }} />
          </div>
        </div>
      </div>
    );
  }

  if (styleId === "minimal") {
    return (
      <div className={`${headerBg} ${dims} rounded-md flex items-center justify-between px-3`}>
        <div className={`${logoW} rounded-sm`} style={{ background: bar }} />
        <div className="flex gap-1.5 items-center">
          <div className={`${iconS} rounded-full border`} style={{ borderColor: bar }} />
          <div className={`${iconS} rounded-full border`} style={{ borderColor: bar }} />
        </div>
      </div>
    );
  }

  if (styleId === "search") {
    return (
      <div className={`${headerBg} ${dims} rounded-md flex items-center gap-2 px-3`}>
        <div className={`${logoW} rounded-sm shrink-0`} style={{ background: bar }} />
        <div className="flex-1 h-2.5 rounded-full bg-white/90" />
        <div className={`${iconS} rounded-full border shrink-0`} style={{ borderColor: bar }} />
      </div>
    );
  }

  // classic
  return (
    <div className={`${headerBg} ${dims} rounded-md flex items-center justify-between px-3`}>
      <div className={`${logoW} rounded-sm`} style={{ background: bar }} />
      <div className="flex gap-1.5">
        <div className={`${pillW} rounded-full`} style={{ background: bar, opacity: 0.7 }} />
        <div className={`${pillW} rounded-full`} style={{ background: bar, opacity: 0.7 }} />
        <div className={`${iconS} rounded-full border`} style={{ borderColor: bar }} />
      </div>
    </div>
  );
}

export function SettingsForm({
  action,
  store,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  store: {
    name: string;
    theme: string;
    headerStyle: string;
    currency: string;
    language: string;
    logoUrl?: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [headerStyle, setHeaderStyle] = useState<string>(store.headerStyle || "classic");
  const [themeId, setThemeId] = useState<string>(store.theme || "classic");
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logoUrl ?? null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const previewTheme = THEMES[themeId as keyof typeof THEMES] ?? THEMES.classic;

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemoveLogo(false);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
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
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
        />
        {state?.fieldErrors?.name && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview && !removeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo önizleme" className="w-full h-full object-contain" />
            ) : (
              <span className="text-[10px] text-neutral-400 text-center px-1">Logo yok</span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={onLogoChange}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:text-white file:text-sm file:font-medium hover:file:bg-neutral-800 file:transition-colors file:cursor-pointer cursor-pointer"
            />
            {logoPreview && (
              <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  name="removeLogo"
                  checked={removeLogo}
                  onChange={(e) => {
                    setRemoveLogo(e.target.checked);
                    if (e.target.checked) setLogoPreview(null);
                    else setLogoPreview(store.logoUrl ?? null);
                  }}
                />
                Logoyu kaldır, mağaza adını göster
              </label>
            )}
            <p className="text-xs text-neutral-400">PNG, JPG veya SVG — en fazla 1.5MB.</p>
          </div>
        </div>
        {state?.fieldErrors?.logo && (
          <p className="text-red-600 text-sm mt-1">{state.fieldErrors.logo}</p>
        )}
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-2">Renk teması</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(THEMES).map(([id, theme]) => (
            <label
              key={id}
              className="flex items-center gap-2 border border-neutral-300 rounded-lg px-3 py-2 cursor-pointer transition-all hover:border-neutral-400 has-[:checked]:border-neutral-900 has-[:checked]:ring-1 has-[:checked]:ring-neutral-900"
            >
              <input
                type="radio"
                name="theme"
                value={id}
                checked={themeId === id}
                onChange={() => setThemeId(id)}
              />
              <span className={`w-4 h-4 rounded-full shrink-0 ${theme.swatchClass}`} />
              <span className="text-sm">{theme.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Header style */}
      <div>
        <label className="block text-sm font-medium mb-2">Üst menü düzeni</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(HEADER_STYLES).map(([id, style]) => (
            <label
              key={id}
              className="flex flex-col gap-2 border border-neutral-300 rounded-lg px-3 py-3 cursor-pointer transition-all hover:border-neutral-400 has-[:checked]:border-neutral-900 has-[:checked]:ring-1 has-[:checked]:ring-neutral-900"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="headerStyle"
                  value={id}
                  checked={headerStyle === id}
                  onChange={() => setHeaderStyle(id)}
                />
                <span className="text-sm font-medium">{style.label}</span>
              </div>
              <HeaderMockup
                styleId={id}
                headerBg={previewTheme.headerBg}
                accent={previewTheme.buttonText === "text-white" ? "#ffffff" : "#111111"}
              />
              <p className="text-xs text-neutral-500">{style.description}</p>
            </label>
          ))}
        </div>

        {/* Bigger live preview of the currently selected combination */}
        <div className="mt-4">
          <p className="text-xs font-medium text-neutral-500 mb-1.5">
            Canlı önizleme — {HEADER_STYLES[headerStyle as HeaderStyleId]?.label ?? headerStyle} ·{" "}
            {previewTheme.label}
          </p>
          <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
            <HeaderMockup
              styleId={headerStyle}
              headerBg={previewTheme.headerBg}
              accent={previewTheme.buttonText === "text-white" ? "#ffffff" : "#111111"}
              size="lg"
            />
          </div>
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
        className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:hover:shadow-none disabled:active:scale-100"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}

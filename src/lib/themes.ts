export type ThemeId = "classic" | "vivid";

export const THEMES: Record<ThemeId, {
  label: string;
  swatchClass: string; // fully-written tailwind class so JIT can detect it
  bg: string;
  headerBg: string;
  buttonBg: string;
  buttonText: string;
  accentText: string;
}> = {
  classic: {
    label: "Klasik (Siyah & Beyaz)",
    swatchClass: "bg-neutral-900",
    bg: "bg-white",
    headerBg: "bg-neutral-900",
    buttonBg: "bg-neutral-900 hover:bg-neutral-800",
    buttonText: "text-white",
    accentText: "text-neutral-900",
  },
  vivid: {
    label: "Canlı (Mor & Turuncu)",
    swatchClass: "bg-fuchsia-600",
    bg: "bg-orange-50",
    headerBg: "bg-fuchsia-700",
    buttonBg: "bg-fuchsia-600 hover:bg-fuchsia-500",
    buttonText: "text-white",
    accentText: "text-fuchsia-700",
  },
};

export function getTheme(themeId: string) {
  return THEMES[themeId as ThemeId] ?? THEMES.classic;
}

export const CURRENCIES = ["TRY", "USD", "EUR"];
export const LANGUAGES: Record<string, string> = { tr: "Türkçe", en: "English" };

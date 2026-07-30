export type ThemeId = "classic" | "ocean" | "sage" | "terracotta" | "lavender";

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
  ocean: {
    label: "Sakin Mavi",
    swatchClass: "bg-slate-700",
    bg: "bg-slate-50",
    headerBg: "bg-slate-800",
    buttonBg: "bg-slate-700 hover:bg-slate-600",
    buttonText: "text-white",
    accentText: "text-slate-700",
  },
  sage: {
    label: "Yeşil Doğal",
    swatchClass: "bg-emerald-700",
    bg: "bg-emerald-50",
    headerBg: "bg-emerald-800",
    buttonBg: "bg-emerald-700 hover:bg-emerald-600",
    buttonText: "text-white",
    accentText: "text-emerald-800",
  },
  terracotta: {
    label: "Toprak Tonları",
    swatchClass: "bg-orange-800",
    bg: "bg-orange-50",
    headerBg: "bg-orange-900",
    buttonBg: "bg-orange-800 hover:bg-orange-700",
    buttonText: "text-white",
    accentText: "text-orange-900",
  },
  lavender: {
    label: "Yumuşak Lavanta",
    swatchClass: "bg-violet-700",
    bg: "bg-violet-50",
    headerBg: "bg-violet-800",
    buttonBg: "bg-violet-700 hover:bg-violet-600",
    buttonText: "text-white",
    accentText: "text-violet-800",
  },
};

export function getTheme(themeId: string) {
  return THEMES[themeId as ThemeId] ?? THEMES.classic;
}

export type HeaderStyleId =
  | "classic"
  | "centered"
  | "announcement"
  | "minimal"
  | "search";

export const HEADER_STYLES: Record<
  HeaderStyleId,
  { label: string; description: string }
> = {
  classic: {
    label: "Klasik",
    description: "Logo solda, menü sağda — tek satır (çoğu mağazada kullanılan standart düzen).",
  },
  centered: {
    label: "Ortalanmış",
    description: "Logo üstte ortada, menü onun altında ortalanmış (butik / tasarım mağazası hissi).",
  },
  announcement: {
    label: "Duyuru barlı",
    description: "Üstte ince bir duyuru şeridi (kargo/kampanya), altında klasik menü (Zara, ASOS tarzı).",
  },
  minimal: {
    label: "Minimal",
    description: "Sadece logo ve ikonlar (arama, sepet, hesap) — menü metinleri gizli/az, sade görünüm.",
  },
  search: {
    label: "Arama odaklı",
    description: "Logo yanında geniş bir arama çubuğu öne çıkar (Trendyol, Hepsiburada, Amazon tarzı).",
  },
};

export const CURRENCIES = ["TRY", "USD", "EUR"];
export const LANGUAGES: Record<string, string> = { tr: "Türkçe", en: "English" };

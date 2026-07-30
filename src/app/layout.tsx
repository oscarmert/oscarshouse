import type { Metadata } from "next";
import "./globals.css";

// Note: intentionally not using next/font/google here — it requires
// fetching font files at build time, which fails in network-restricted
// build environments (e.g. offline CI, sandboxed containers). We rely on
// Tailwind's default system font stack instead. If you want a custom
// webfont, use `next/font/local` with a self-hosted font file.

export const metadata: Metadata = {
  title: "ShopKurucu — Kendi mağazanı dakikalar içinde aç",
  description: "Shopify/Ticimax mantığında çok kiracılı e-ticaret platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

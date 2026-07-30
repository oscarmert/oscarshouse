// Client-safe formatting helpers. Keep this file free of any server-only
// imports (db, fs, etc.) since it's used from Client Components too.
export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

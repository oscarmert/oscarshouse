"use client";

export function DeleteButton({
  action,
  confirmText = "Emin misiniz?",
  label = "Sil",
}: {
  action: () => Promise<void>;
  confirmText?: string;
  label?: string;
}) {
  return (
    <button
      onClick={() => {
        if (confirm(confirmText)) {
          action();
        }
      }}
      className="text-red-600 text-sm hover:underline"
      type="button"
    >
      {label}
    </button>
  );
}

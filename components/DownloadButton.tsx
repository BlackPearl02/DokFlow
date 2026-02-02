"use client";

interface DownloadButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function DownloadButton({
  onClick,
  loading,
  disabled,
  children = "Generuj i pobierz CSV",
}: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded bg-slate-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
    >
      {loading ? "Generowanie…" : children}
    </button>
  );
}

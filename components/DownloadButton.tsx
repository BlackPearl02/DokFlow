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
      aria-busy={loading}
      className="rounded bg-slate-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-400 dark:active:bg-slate-300 dark:focus:ring-offset-slate-800"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-4 w-4 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-white border-t-transparent"
            aria-hidden
          />
          Generowanie…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

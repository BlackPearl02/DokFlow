import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Eksport i pobierz</h1>
      <p className="text-slate-600 dark:text-slate-300">
        Plik CSV generowany jest na stronie mapowania kolumn po kliknięciu &quot;Generuj i pobierz CSV&quot;.
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Dane zostały usunięte z pamięci.</p>
      <Link
        href="/upload"
        className="inline-block rounded bg-slate-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-400 dark:active:bg-slate-300 dark:focus:ring-offset-slate-800"
      >
        Rozpocznij nowy plik
      </Link>
    </div>
  );
}

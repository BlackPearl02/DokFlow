"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Wybierz plik.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Błąd parsowania pliku.");
        return;
      }
      router.push(`/map?sessionId=${data.sessionId}`);
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Prześlij plik</h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          Obsługiwane formaty: XLSX, XLS, CSV, XML. W następnym kroku wybierzesz wiersz nagłówka.
        </p>
      </div>
      <div className="mb-6 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-blue-50/50 to-white p-6 shadow-lg shadow-blue-200/30 dark:border-blue-800/80 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-slate-900 dark:shadow-blue-950/50">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-base text-blue-900 dark:text-blue-200 mb-3">Wymagania dla importu do Optimy:</p>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
                <span>Plik musi zawierać kolumny z <strong>kodem towaru (index)</strong> lub <strong>kodem EAN</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
                <span>Kody muszą <strong>dokładnie odpowiadać</strong> kodom w bazie Optimy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
                <span>Wymagane kolumny: identyfikator towaru (index/EAN), ilość, cena</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-hidden />
                <span>Nie używaj separatorów tysięcy (spacji) w liczbach</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-950/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={setFile}
            selectedFileName={file?.name ?? null}
            disabled={loading}
            uploading={loading}
            errorMessage={error}
          />
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-100/50 bg-green-50/50 p-3 text-xs text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-300">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Pliki są przetwarzane w pamięci i usuwane zaraz po eksporcie.</span>
          </div>
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || !file}
              className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-100 dark:from-blue-500 dark:to-indigo-500 dark:shadow-blue-500/20 dark:hover:shadow-blue-500/30"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Przetwarzanie…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Dalej — mapowanie kolumn
                  </>
                )}
              </span>
              {!loading && !file && (
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100"></span>
              )}
            </button>
            <Link
              href="/"
              className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-md transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

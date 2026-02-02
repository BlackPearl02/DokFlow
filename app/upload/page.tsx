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
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Prześlij plik</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Obsługiwane formaty: XLSX, XLS, CSV, XML. W następnym kroku wybierzesz wiersz nagłówka.
      </p>
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
        <p className="font-medium mb-2">Wymagania dla importu do Optimy:</p>
        <ul className="space-y-1.5 text-xs text-blue-700 dark:text-blue-300 list-inside list-disc">
          <li>Plik musi zawierać kolumny z <strong>kodem towaru (index)</strong> lub <strong>kodem EAN</strong></li>
          <li>Kody muszą <strong>dokładnie odpowiadać</strong> kodom w bazie Optimy</li>
          <li>Wymagane kolumny: identyfikator towaru (index/EAN), ilość, cena</li>
          <li>Nie używaj separatorów tysięcy (spacji) w liczbach</li>
        </ul>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={setFile}
            selectedFileName={file?.name ?? null}
            disabled={loading}
            uploading={loading}
            errorMessage={error}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pliki są przetwarzane w pamięci i usuwane zaraz po eksporcie.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !file}
              className="rounded bg-slate-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-400 dark:active:bg-slate-300 dark:focus:ring-offset-slate-800"
            >
              {loading ? "Przetwarzanie…" : "Dalej — mapowanie kolumn"}
            </button>
            <Link
              href="/"
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 dark:focus:ring-offset-slate-800"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";
import { HeaderRowSelect } from "@/components/HeaderRowSelect";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [headerRowIndex, setHeaderRowIndex] = useState(1);
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
      formData.set("headerRowIndex", String(headerRowIndex));
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
      <h1 className="text-xl font-bold text-slate-900">Prześlij plik</h1>
      <p className="mt-1 text-sm text-slate-600">
        Obsługiwane formaty: XLSX, XLS, CSV, XML. Wybierz wiersz, w którym znajduje się nagłówek tabeli.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={setFile}
            selectedFileName={file?.name ?? null}
            disabled={loading}
            uploading={loading}
            errorMessage={error}
          />
          <HeaderRowSelect value={headerRowIndex} onChange={setHeaderRowIndex} disabled={loading} />
          <p className="text-xs text-slate-500">
            Pliki są przetwarzane w pamięci i usuwane zaraz po eksporcie.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !file}
              className="rounded bg-slate-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {loading ? "Przetwarzanie…" : "Dalej — mapowanie kolumn"}
            </button>
            <Link
              href="/"
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

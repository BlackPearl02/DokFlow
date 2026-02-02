"use client";

import { useRef, useState } from "react";

const ACCEPT_EXT = [".xlsx", ".xls", ".csv", ".xml"];

function hasValidExtension(file: File): boolean {
  const name = file.name.toLowerCase().trim();
  const baseName = name.includes("?") ? name.slice(0, name.indexOf("?")) : name;
  return ACCEPT_EXT.some((ext) => baseName.endsWith(ext));
}

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File | null) => void;
  selectedFileName?: string | null;
  disabled?: boolean;
  uploading?: boolean;
  errorMessage?: string | null;
}

export function FileUpload({
  accept = ".xlsx,.xls,.csv,.xml",
  onFileSelect,
  selectedFileName,
  disabled,
  uploading = false,
  errorMessage,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const justDroppedRef = useRef(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [invalidFormat, setInvalidFormat] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setInvalidFormat(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!hasValidExtension(file)) {
      setInvalidFormat(true);
      return;
    }
    justDroppedRef.current = true;
    onFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (justDroppedRef.current) {
      justDroppedRef.current = false;
      e.target.value = "";
      return;
    }
    setInvalidFormat(false);
    const file = e.target.files?.[0];
    if (file) {
      if (!hasValidExtension(file)) {
        setInvalidFormat(true);
      } else {
        onFileSelect(file);
      }
    }
    e.target.value = "";
  };

  const showSuccess = !!selectedFileName && !uploading;
  const showError = !!errorMessage || invalidFormat;
  const errorText =
    errorMessage ?? (invalidFormat ? "Nieobsługiwany format pliku. Użyj XLSX, XLS, CSV lub XML." : null);
  const isDisabled = disabled || uploading;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setInvalidFormat(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Jedno pole: kliknięcie = input (niewidoczny na wierzchu), bez natywnego przycisku */}
      <div
        className={`
          relative flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300 shadow-md
          ${isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
          ${isDragOver 
            ? "border-blue-400 bg-blue-50 scale-[1.01] shadow-lg shadow-blue-200/20 dark:border-blue-500 dark:bg-blue-950/20 dark:shadow-blue-950/20" 
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 hover:shadow-md hover:scale-[1.01] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
          }
        `}
      >
        {/* Input na wierzchu – niewidoczny, pełna strefa; klik = dialog, drop = obsługa */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isDisabled}
          className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-label="Wybierz plik lub przeciągnij tutaj. Format XLSX, XLS, CSV lub XML."
        />

        {/* Tekst pod inputem (pointer-events-none), żeby nie blokować kliknięć */}
        <div className="pointer-events-none relative z-0 flex flex-col items-center justify-center text-center">
          {uploading && (
            <>
              <span
                className="h-8 w-8 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300"
                aria-hidden
                aria-busy="true"
              />
              <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Przetwarzanie…</span>
            </>
          )}

          {!uploading && showSuccess && (
            <div
              className="flex flex-col items-center gap-3 text-green-700 dark:text-green-400 animate-fade-in"
              aria-live="polite"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md shadow-green-500/20 dark:bg-green-500 dark:shadow-green-500/15">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-base font-bold">Plik załadowany</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400 max-w-xs truncate">{selectedFileName}</span>
            </div>
          )}

          {!uploading && !showSuccess && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Wybierz plik lub przeciągnij tutaj</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Obsługiwane formaty: XLSX, XLS, CSV, XML</p>
            </div>
          )}
        </div>

        {/* Przycisk Wyczyść – musi mieć pointer-events, żeby klik działał */}
        {!uploading && showSuccess && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isDisabled}
            className="relative z-20 mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:scale-95 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            Wyczyść — wybierz inny plik
          </button>
        )}
      </div>

        {showError && errorText && (
        <div className="rounded-xl border border-red-200/80 bg-red-50 p-4 shadow-md shadow-red-200/20 dark:border-red-800/80 dark:bg-red-950/20 dark:shadow-red-950/20" role="alert" aria-live="polite">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

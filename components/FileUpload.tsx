"use client";

import { useRef, useState } from "react";

const ACCEPT_EXT = [".xlsx", ".xls", ".csv"];

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
  accept = ".xlsx,.xls,.csv",
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
    errorMessage ?? (invalidFormat ? "Nieobsługiwany format pliku. Użyj XLSX, XLS lub CSV." : null);
  const isDisabled = disabled || uploading;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setInvalidFormat(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {/* Jedno pole: kliknięcie = input (niewidoczny na wierzchu), bez natywnego przycisku */}
      <div
        className={`
          relative flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors duration-200
          ${isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
          ${isDragOver ? "border-slate-400 bg-slate-50" : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"}
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
          aria-label="Wybierz plik lub przeciągnij tutaj. Format XLSX, XLS lub CSV."
        />

        {/* Tekst pod inputem (pointer-events-none), żeby nie blokować kliknięć */}
        <div className="pointer-events-none relative z-0 flex flex-col items-center justify-center text-center">
          {uploading && (
            <>
              <span
                className="h-8 w-8 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-slate-300 border-t-slate-600"
                aria-hidden
              />
              <span className="mt-2 text-sm font-medium text-slate-600">Przetwarzanie…</span>
            </>
          )}

          {!uploading && showSuccess && (
            <div
              className="flex flex-col items-center gap-2 text-green-700 animate-fade-in"
              aria-live="polite"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg font-medium text-green-700">
                ✓
              </span>
              <span className="text-sm font-medium">Plik załadowany</span>
              <span className="text-xs text-green-600">{selectedFileName}</span>
            </div>
          )}

          {!uploading && !showSuccess && (
            <p className="text-sm font-medium text-slate-600">Wybierz plik lub przeciągnij tutaj</p>
          )}
        </div>

        {/* Przycisk Wyczyść – musi mieć pointer-events, żeby klik działał */}
        {!uploading && showSuccess && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isDisabled}
            className="relative z-20 mt-2 text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded disabled:opacity-70"
          >
            Wyczyść — wybierz inny plik
          </button>
        )}
      </div>

      {!uploading && !showSuccess && (
        <p className="text-center text-xs text-slate-500">XLSX, XLS lub CSV</p>
      )}

      {showError && errorText && (
        <p className="text-sm text-red-600" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}

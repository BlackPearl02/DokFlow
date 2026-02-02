"use client";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  fileName?: string | null;
}

const STEPS = [
  { num: 1, label: "Prześlij plik" },
  { num: 2, label: "Mapuj i sprawdź" },
  { num: 3, label: "Eksport i pobierz" },
] as const;

export function StepIndicator({ currentStep, fileName }: StepIndicatorProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2">
        <nav aria-label="Postęp" className="flex items-center gap-2">
          {STEPS.map(({ num, label }) => {
            const isActive = num === currentStep;
            const isCompleted = num < currentStep;
            return (
              <div
                key={num}
                className="flex items-center gap-2 text-sm"
                aria-current={isActive ? "step" : undefined}
              >
                {num > 1 && <span className="h-px w-4 bg-slate-200" aria-hidden />}
                <span
                  className={`
                    flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-medium transition-colors duration-200
                    ${isCompleted ? "bg-slate-600 text-white" : ""}
                    ${isActive ? "bg-slate-600 text-white ring-2 ring-slate-600 ring-offset-2" : ""}
                    ${!isActive && !isCompleted ? "bg-slate-100 text-slate-500" : ""}
                  `}
                >
                  {isCompleted ? (
                    <span aria-hidden className="text-xs">
                      ✓
                    </span>
                  ) : (
                    num
                  )}
                </span>
                <span
                  className={
                    isActive
                      ? "font-medium text-slate-800"
                      : isCompleted
                        ? "text-slate-600"
                        : "text-slate-400"
                  }
                >
                  {label}
                </span>
              </div>
            );
          })}
        </nav>
        {currentStep === 2 && fileName && (
          <span className="text-sm text-slate-500">Plik: {fileName}</span>
        )}
      </div>
    </div>
  );
}

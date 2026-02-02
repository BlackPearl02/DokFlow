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
    <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50/50 via-white/50 to-slate-50/50 px-4 py-4 backdrop-blur-sm dark:border-slate-800/80 dark:from-slate-950/50 dark:via-slate-900/50 dark:to-slate-950/50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 sm:px-6 lg:px-8">
        <nav aria-label="Postęp" className="flex items-center gap-3">
          {STEPS.map(({ num, label }) => {
            const isActive = num === currentStep;
            const isCompleted = num < currentStep;
            return (
              <div
                key={num}
                className="flex items-center gap-3 text-sm"
                aria-current={isActive ? "step" : undefined}
              >
                {num > 1 && (
                  <span 
                    className={`h-0.5 w-6 transition-all duration-300 ${
                      isCompleted 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500" 
                        : "bg-slate-200 dark:bg-slate-700"
                    }`} 
                    aria-hidden 
                  />
                )}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 shadow-sm
                      ${isCompleted 
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 dark:shadow-blue-500/20" 
                        : ""
                      }
                      ${isActive 
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-4 ring-blue-500/20 ring-offset-2 shadow-lg shadow-blue-500/30 scale-110 dark:ring-blue-400/20 dark:ring-offset-slate-950 dark:shadow-blue-500/20" 
                        : ""
                      }
                      ${!isActive && !isCompleted 
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" 
                        : ""
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      num
                    )}
                  </span>
                  <span
                    className={`font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-slate-900 dark:text-slate-100"
                        : isCompleted
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>
        {currentStep === 2 && fileName && (
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate max-w-[200px]">{fileName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

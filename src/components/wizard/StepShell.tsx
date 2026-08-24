import type { ReactNode } from "react";

interface StepShellProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function StepShell({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Continuer",
  nextDisabled = false,
}: StepShellProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-slate-500">
          <span>
            Étape {stepNumber} / {totalSteps}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-slate-500">{subtitle}</p> : null}

      <div className="mt-6 space-y-3">{children}</div>

      <div className="mt-8 flex justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100"
          >
            Retour
          </button>
        ) : (
          <span />
        )}
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {nextLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

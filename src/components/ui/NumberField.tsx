interface NumberFieldProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  step?: number;
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
  min = 0,
  step = 10,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="block font-medium text-slate-800">{label}</span>
      {hint ? <span className="mt-0.5 block text-sm text-slate-500">{hint}</span> : null}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="w-40 rounded-lg border-2 border-slate-200 px-3 py-2 text-lg focus:border-blue-600 focus:outline-none"
        />
        {suffix ? <span className="text-slate-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

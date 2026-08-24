interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${
        selected
          ? "border-blue-600 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className={`block font-medium ${selected ? "text-blue-800" : "text-slate-800"}`}>
        {label}
      </span>
      {description ? (
        <span className="mt-0.5 block text-sm text-slate-500">{description}</span>
      ) : null}
    </button>
  );
}

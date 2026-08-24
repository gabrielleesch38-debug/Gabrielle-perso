interface StarRatingProps {
  value: 1 | 2 | 3 | 4 | 5;
  colorClass?: string;
}

export function StarRating({ value, colorClass = "text-amber-500" }: StarRatingProps) {
  return (
    <span aria-label={`${value} sur 5`} className={`tracking-tight ${colorClass}`}>
      {"★".repeat(value)}
      <span className="text-slate-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

import type { CompatibiliteBudgetaire } from "@/lib/types";

const CONFIG: Record<
  CompatibiliteBudgetaire["niveau"],
  { emoji: string; titre: string; classes: string }
> = {
  forte: {
    emoji: "🟢",
    titre: "Forte compatibilité",
    classes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  moyenne: {
    emoji: "🟠",
    titre: "Compatibilité moyenne",
    classes: "border-amber-300 bg-amber-50 text-amber-900",
  },
  faible: {
    emoji: "🔴",
    titre: "Compatibilité faible",
    classes: "border-red-300 bg-red-50 text-red-900",
  },
};

interface CompatibiliteBudgetaireBannerProps {
  compatibilite: CompatibiliteBudgetaire;
}

export function CompatibiliteBudgetaireBanner({ compatibilite }: CompatibiliteBudgetaireBannerProps) {
  const config = CONFIG[compatibilite.niveau];
  return (
    <div className={`rounded-2xl border-2 p-5 ${config.classes}`}>
      <p className="text-lg font-semibold">
        {config.emoji} {config.titre}
      </p>
      <p className="mt-1 text-sm">{compatibilite.message}</p>
    </div>
  );
}

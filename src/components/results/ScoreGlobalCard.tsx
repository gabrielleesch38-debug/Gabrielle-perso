import type { ScoreCompatibiliteGlobale } from "@/lib/types";

const NIVEAU_CONFIG: Record<
  ScoreCompatibiliteGlobale["niveau"],
  { emoji: string; classes: string; barColor: string }
> = {
  forte: {
    emoji: "🟢",
    classes: "border-emerald-300 bg-emerald-50 text-emerald-900",
    barColor: "bg-emerald-500",
  },
  moyenne: {
    emoji: "🟠",
    classes: "border-amber-300 bg-amber-50 text-amber-900",
    barColor: "bg-amber-500",
  },
  faible: {
    emoji: "🔴",
    classes: "border-red-300 bg-red-50 text-red-900",
    barColor: "bg-red-500",
  },
};

const COMPOSANTES: { key: keyof ScoreCompatibiliteGlobale["composantes"]; label: string; poids: string }[] = [
  { key: "budget", label: "Compatibilité budgétaire", poids: "40%" },
  { key: "logement", label: "Difficulté logement", poids: "25%" },
  { key: "profil", label: "Adéquation avec ton profil", poids: "20%" },
  { key: "margeSecurite", label: "Marge de sécurité financière", poids: "15%" },
];

interface ScoreGlobalCardProps {
  scoreGlobal: ScoreCompatibiliteGlobale;
}

export function ScoreGlobalCard({ scoreGlobal }: ScoreGlobalCardProps) {
  const config = NIVEAU_CONFIG[scoreGlobal.niveau];

  return (
    <div className={`rounded-2xl border-2 p-6 ${config.classes}`}>
      <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Compatibilité globale</p>
      <div className="mt-1 flex items-baseline gap-3">
        <span className="text-5xl font-bold">{scoreGlobal.score}</span>
        <span className="text-xl opacity-70">/ 100</span>
      </div>
      <p className="mt-2 text-lg font-semibold">
        {config.emoji} {scoreGlobal.label}
      </p>

      <div className="mt-5 space-y-3">
        {COMPOSANTES.map((composante) => {
          const valeur = scoreGlobal.composantes[composante.key];
          return (
            <div key={composante.key}>
              <div className="mb-1 flex items-center justify-between text-xs font-medium opacity-80">
                <span>
                  {composante.label} <span className="opacity-60">({composante.poids})</span>
                </span>
                <span>{valeur}/100</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div className={`h-full rounded-full ${config.barColor}`} style={{ width: `${valeur}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

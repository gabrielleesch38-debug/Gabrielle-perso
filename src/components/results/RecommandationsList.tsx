import type { RecommandationEconomie } from "@/lib/types";
import { formatEuros } from "@/lib/format";

interface RecommandationsListProps {
  recommandations: RecommandationEconomie[];
}

export function RecommandationsList({ recommandations }: RecommandationsListProps) {
  if (recommandations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">
        Recommandations pour réduire le budget
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Des leviers concrets, calculés à partir de ton profil et de ce qui revient dans les
        témoignages d&apos;étudiants.
      </p>
      <ul className="space-y-3">
        {recommandations.map((reco) => (
          <li key={reco.texte} className="flex items-start justify-between gap-3 text-sm">
            <div className="flex gap-2">
              <span className="text-blue-600">💡</span>
              <span className="text-slate-700">{reco.texte}</span>
            </div>
            {reco.economiePotentielle ? (
              <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                −{formatEuros(reco.economiePotentielle)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

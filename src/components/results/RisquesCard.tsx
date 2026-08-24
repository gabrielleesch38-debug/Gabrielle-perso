import type { Destination } from "@/lib/types";
import { StarRating } from "@/components/ui/StarRating";

const CONFIANCE_RISQUE: Record<Destination["confiance"], { label: string; classes: string }> = {
  observe: { label: "Faible (données confirmées par des étudiants)", classes: "text-emerald-700" },
  partiel: { label: "Moyen (données partiellement confirmées)", classes: "text-amber-700" },
  estime: { label: "Élevé (données estimées, peu de témoignages)", classes: "text-red-700" },
};

interface RisquesCardProps {
  destination: Destination;
}

export function RisquesCard({ destination }: RisquesCardProps) {
  const variance = destination.logement.eleve - destination.logement.min;
  const confiance = CONFIANCE_RISQUE[destination.confiance];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Principaux risques</h2>
      <dl className="space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Risque logement (trouver un logement)</dt>
          <dd>
            <StarRating value={destination.difficulteLogement} colorClass="text-red-500" />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Niveau de coût global</dt>
          <dd>
            <StarRating value={destination.niveauCoutGlobal} colorClass="text-red-500" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-600">Fiabilité des données de cette fiche</dt>
          <dd className={`text-right text-sm font-medium ${confiance.classes}`}>{confiance.label}</dd>
        </div>
        {variance >= 300 ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600">Variance du prix du logement</dt>
            <dd className="text-right text-sm font-medium text-amber-700">
              Jusqu&apos;à {variance}€/mois d&apos;écart selon quartier et méthode de recherche
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

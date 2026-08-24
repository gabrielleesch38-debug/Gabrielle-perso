import type { BudgetTierResult } from "@/lib/types";
import { formatEuros } from "@/lib/format";

const POSTE_LABELS: Record<keyof BudgetTierResult["detailMensuel"], string> = {
  logement: "Logement",
  alimentation: "Alimentation",
  transport: "Transport",
  telephone: "Téléphone",
  voyages: "Voyages",
  loisirs: "Loisirs",
};

interface BudgetTierCardProps {
  tier: BudgetTierResult;
  highlighted?: boolean;
}

export function BudgetTierCard({ tier, highlighted = false }: BudgetTierCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border-2 p-5 ${
        highlighted ? "border-blue-600 bg-blue-50/60" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{tier.label}</h3>
        {highlighted ? (
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            Ton profil
          </span>
        ) : null}
      </div>
      <p className="text-sm text-slate-500">{tier.description}</p>

      <p className="mt-4 text-3xl font-bold text-slate-900">{formatEuros(tier.total)}</p>
      <p className="text-sm text-slate-500">pour tout le séjour, marge de sécurité incluse</p>

      <dl className="mt-4 space-y-1.5 text-sm">
        {(Object.keys(POSTE_LABELS) as (keyof typeof POSTE_LABELS)[]).map((key) => (
          <div key={key} className="flex justify-between">
            <dt className="text-slate-500">{POSTE_LABELS[key]}</dt>
            <dd className="font-medium text-slate-700">{formatEuros(tier.detailMensuel[key])}/mois</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-200 pt-1.5">
          <dt className="text-slate-500">Installation (unique)</dt>
          <dd className="font-medium text-slate-700">{formatEuros(tier.installation)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Marge de sécurité (10%)</dt>
          <dd className="font-medium text-slate-700">{formatEuros(tier.margeSecurite)}</dd>
        </div>
      </dl>
    </div>
  );
}

import type { ProfilFitResult } from "@/lib/types";
import { PROFIL_AXE } from "@/lib/budget";
import { StarRating } from "@/components/ui/StarRating";

const VERDICT_EMOJI: Record<ProfilFitResult["verdict"], string> = {
  tres_adapte: "✅",
  adapte_reserves: "🟠",
  peu_adapte: "⚠️",
};

const VERDICT_CLASSES: Record<ProfilFitResult["verdict"], string> = {
  tres_adapte: "border-emerald-300 bg-emerald-50",
  adapte_reserves: "border-amber-300 bg-amber-50",
  peu_adapte: "border-red-300 bg-red-50",
};

interface ProfilFitCardProps {
  fit: ProfilFitResult;
}

export function ProfilFitCard({ fit }: ProfilFitCardProps) {
  return (
    <div className={`rounded-2xl border-2 p-5 ${VERDICT_CLASSES[fit.verdict]}`}>
      <p className="text-sm font-medium text-slate-500">
        Pour un profil « {PROFIL_AXE[fit.profil].label} »
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        {VERDICT_EMOJI[fit.verdict]} {fit.label}
      </p>
      <div className="mt-2">
        <StarRating value={fit.score} colorClass="text-blue-600" />
      </div>
      <p className="mt-2 text-sm text-slate-600">{fit.explication}</p>
    </div>
  );
}

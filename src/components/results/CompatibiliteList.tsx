import type { DestinationCompatibilite, NiveauScoreGlobal, VerdictProfil } from "@/lib/types";
import { formatDestinationLabel } from "@/lib/destinations";
import { formatEuros, formatSigned } from "@/lib/format";

const VERDICT_EMOJI: Record<VerdictProfil, string> = {
  tres_adapte: "✅",
  adapte_reserves: "🟠",
  peu_adapte: "⚠️",
};

const NIVEAU_CONFIG: Record<NiveauScoreGlobal, { emoji: string; classes: string }> = {
  forte: { emoji: "🟢", classes: "bg-emerald-100 text-emerald-700" },
  moyenne: { emoji: "🟠", classes: "bg-amber-100 text-amber-700" },
  faible: { emoji: "🔴", classes: "bg-red-100 text-red-700" },
};

interface CompatibiliteListProps {
  items: DestinationCompatibilite[];
  destinationSelectionneeId: string;
}

export function CompatibiliteList({ items, destinationSelectionneeId }: CompatibiliteListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 sm:grid">
        <span>Destination</span>
        <span>Budget confort (séjour)</span>
        <span>Reste à charge</span>
        <span>Compatibilité globale</span>
        <span>Profil</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => {
          const config = NIVEAU_CONFIG[item.scoreGlobal.niveau];
          const isSelected = item.destination.id === destinationSelectionneeId;
          return (
            <li
              key={item.destination.id}
              className={`grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-3 ${
                isSelected ? "bg-blue-50/60" : ""
              }`}
            >
              <span className="font-medium text-slate-800">
                {formatDestinationLabel(item.destination)}
                {isSelected ? (
                  <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white align-middle">
                    Ta destination
                  </span>
                ) : null}
              </span>
              <span className="text-sm text-slate-600 sm:text-right">
                {formatEuros(item.totalConfort)}
              </span>
              <span
                className={`text-sm font-medium sm:text-right ${
                  item.resteAChargeConfort > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatSigned(item.resteAChargeConfort)}
              </span>
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium sm:justify-self-end ${config.classes}`}
              >
                {config.emoji} {item.scoreGlobal.score}/100
              </span>
              <span
                className="w-fit text-base sm:justify-self-end"
                title={item.fitProfil.label}
              >
                {VERDICT_EMOJI[item.fitProfil.verdict]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

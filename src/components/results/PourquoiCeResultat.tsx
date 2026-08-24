import type { ExplicationResultat } from "@/lib/types";

interface PourquoiCeResultatProps {
  explication: ExplicationResultat;
}

export function PourquoiCeResultat({ explication }: PourquoiCeResultatProps) {
  if (explication.pointsForts.length === 0 && explication.pointsVigilance.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Pourquoi ce résultat ?</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {explication.pointsForts.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-emerald-700">Points forts</p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {explication.pointsForts.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {explication.pointsVigilance.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-amber-700">Points de vigilance</p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {explication.pointsVigilance.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-amber-600">⚠</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { Destination } from "@/lib/types";
import { formatDestinationLabel } from "@/lib/destinations";
import { StarRating } from "@/components/ui/StarRating";

const NIVEAU_COUT_LABEL = ["", "Très bas", "Bas", "Modéré", "Élevé", "Très élevé"];

interface DestinationPickerProps {
  destinations: Destination[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DestinationPicker({ destinations, selectedId, onSelect }: DestinationPickerProps) {
  const [filtre, setFiltre] = useState("");

  const filtrees = useMemo(() => {
    const f = filtre.trim().toLowerCase();
    if (!f) return destinations;
    return destinations.filter(
      (d) =>
        d.ville.toLowerCase().includes(f) ||
        d.pays.toLowerCase().includes(f) ||
        (d.universite ?? "").toLowerCase().includes(f),
    );
  }, [destinations, filtre]);

  return (
    <div>
      <input
        type="text"
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
        placeholder="Rechercher une ville ou un pays..."
        className="mb-3 w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:border-blue-600 focus:outline-none"
      />
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {filtrees.map((d) => {
          const selected = d.id === selectedId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d.id)}
              aria-pressed={selected}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${
                selected
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className={`block font-medium ${selected ? "text-blue-800" : "text-slate-800"}`}>
                    {formatDestinationLabel(d)}
                  </span>
                  {d.universite ? (
                    <span className="text-sm text-slate-500">{d.universite}</span>
                  ) : null}
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Coût de vie : {NIVEAU_COUT_LABEL[d.niveauCoutGlobal]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    Logement <StarRating value={d.difficulteLogement} colorClass="text-red-500" />
                  </span>
                  {d.confiance !== "observe" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Données estimées
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Données observées
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {filtrees.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">Aucune destination ne correspond.</p>
        ) : null}
      </div>
    </div>
  );
}

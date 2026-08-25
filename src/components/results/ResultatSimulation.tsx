"use client";

import { useMemo } from "react";
import type { UserProfile } from "@/lib/types";
import { destinations } from "@/lib/destinations";
import { evaluerCompatibilite, simuler } from "@/lib/budget";
import { formatDestinationLabel } from "@/lib/destinations";
import { formatEuros, formatSigned } from "@/lib/format";
import { BudgetTierCard } from "./BudgetTierCard";
import { CompatibiliteList } from "./CompatibiliteList";
import { ScoreGlobalCard } from "./ScoreGlobalCard";
import { CompatibiliteBudgetaireBanner } from "./CompatibiliteBudgetaireBanner";
import { RisquesCard } from "./RisquesCard";
import { ProfilFitCard } from "./ProfilFitCard";
import { HiddenCostsChecklist } from "./HiddenCostsChecklist";
import { PourquoiCeResultat } from "./PourquoiCeResultat";
import { RecommandationsList } from "./RecommandationsList";

interface ResultatSimulationProps {
  profil: UserProfile;
  onRecommencer: () => void;
}

const CONFIANCE_LABEL = {
  observe: {
    label: "Données observées",
    detail: "Fondées sur des rapports de fin de mobilité rédigés par des étudiants.",
    classes: "bg-emerald-100 text-emerald-700",
  },
  partiel: {
    label: "Données partiellement observées",
    detail: "Certains postes sont confirmés par des retours étudiants, d'autres estimés.",
    classes: "bg-amber-100 text-amber-700",
  },
  estime: {
    label: "Données estimées",
    detail: "Peu ou pas de témoignages chiffrés disponibles pour cette destination.",
    classes: "bg-slate-200 text-slate-700",
  },
} as const;

function SectionTitle({ numero, titre }: { numero: number; titre: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {numero}
      </span>
      <h2 className="text-lg font-semibold text-slate-900">{titre}</h2>
    </div>
  );
}

export function ResultatSimulation({ profil, onRecommencer }: ResultatSimulationProps) {
  const destination = useMemo(
    () => destinations.find((d) => d.id === profil.destinationId),
    [profil.destinationId],
  );

  const simulation = useMemo(() => {
    if (!destination) return null;
    return simuler(destination, profil);
  }, [destination, profil]);

  const compatibilite = useMemo(() => evaluerCompatibilite(destinations, profil), [profil]);

  if (!destination || !simulation) {
    return <p className="text-center text-slate-500">Destination introuvable.</p>;
  }

  const confianceInfo = CONFIANCE_LABEL[destination.confiance];
  const resteConfort = simulation.resteACharge.confort;

  return (
    <div className="mx-auto w-full max-w-5xl print-page">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Résultat de ta simulation</p>
          <h1 className="text-3xl font-bold text-slate-900">
            {formatDestinationLabel(destination)}
          </h1>
          <p className="text-slate-500">
            {destination.region} · Séjour de {profil.dureeMois} mois
          </p>
        </div>
        <span className={`h-fit w-fit rounded-full px-3 py-1 text-sm font-medium ${confianceInfo.classes}`}>
          {confianceInfo.label}
        </span>
      </div>

      <p className="mb-6 text-sm text-slate-500">{confianceInfo.detail} {destination.sourceNote}</p>

      <div className="mb-10">
        <ScoreGlobalCard scoreGlobal={simulation.scoreGlobal} />
      </div>

      {/* 1. Combien cela va coûter */}
      <section className="mb-10">
        <SectionTitle numero={1} titre="Combien cela va coûter" />
        <div className="grid gap-4 sm:grid-cols-3">
          <BudgetTierCard tier={simulation.tiers.minimal} />
          <BudgetTierCard tier={simulation.tiers.confort} highlighted />
          <BudgetTierCard tier={simulation.tiers.experience} />
        </div>
      </section>

      {/* 2. Puis-je me le permettre */}
      <section className="mb-10">
        <SectionTitle numero={2} titre="Puis-je me le permettre" />
        <div className="space-y-4">
          <CompatibiliteBudgetaireBanner compatibilite={simulation.compatibiliteBudgetaire} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Ressources totales pour le séjour</p>
                <p className="text-2xl font-bold text-slate-900">{formatEuros(simulation.ressourcesTotales)}</p>
                <p className="mt-1 text-xs text-slate-400">Budget mensuel × durée + bourses + épargne</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Budget confort estimé</p>
                <p className="text-2xl font-bold text-slate-900">{formatEuros(simulation.tiers.confort.total)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Reste à charge</p>
                <p className={`text-2xl font-bold ${resteConfort > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatSigned(resteConfort)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Est-ce une destination adaptée à mon profil */}
      <section className="mb-10">
        <SectionTitle numero={3} titre="Est-ce adapté à mon profil" />
        <ProfilFitCard fit={simulation.fitProfil} />
      </section>

      {/* 4. Quels sont les principaux risques */}
      <section className="mb-10">
        <SectionTitle numero={4} titre="Quels sont les principaux risques" />
        <RisquesCard destination={destination} />
      </section>

      {/* 5. Quelles dépenses sont souvent oubliées */}
      <section className="mb-10">
        <SectionTitle numero={5} titre="Quelles dépenses sont souvent oubliées" />
        <HiddenCostsChecklist />
      </section>

      <div className="mb-10">
        <PourquoiCeResultat explication={simulation.explication} />
      </div>

      <div className="mb-10">
        <RecommandationsList recommandations={simulation.recommandations} />
      </div>

      <div className="mb-10">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Quelles destinations sont compatibles avec tes moyens et ton profil ?
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Classement des 20 destinations du simulateur selon ton profil (durée, type de logement,
          voyages, vie sociale), du reste à charge le plus favorable au moins favorable. La
          colonne « Profil » indique l&apos;adéquation avec le profil principal que tu as choisi.
        </p>
        <CompatibiliteList items={compatibilite} destinationSelectionneeId={destination.id} />
      </div>

      <div className="no-print flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
        >
          Exporter en PDF
        </button>
        <button
          type="button"
          onClick={onRecommencer}
          className="rounded-lg border-2 border-slate-200 px-5 py-2 font-medium text-slate-600 hover:bg-slate-100"
        >
          Recommencer la simulation
        </button>
      </div>
    </div>
  );
}

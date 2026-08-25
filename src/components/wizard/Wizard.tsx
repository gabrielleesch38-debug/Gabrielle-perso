"use client";

import { useState } from "react";
import type {
  FrequenceVoyage,
  LogementType,
  ProfilPrincipal,
  TypeBourse,
  UserProfile,
  VieSociale,
} from "@/lib/types";
import { destinations } from "@/lib/destinations";
import {
  LABEL_FREQUENCE_VOYAGE,
  LABEL_LOGEMENT,
  LABEL_VIE_SOCIALE,
  PROFIL_AXE,
} from "@/lib/budget";
import { DestinationPicker } from "./DestinationPicker";
import { StepShell } from "./StepShell";
import { OptionCard } from "@/components/ui/OptionCard";
import { NumberField } from "@/components/ui/NumberField";
import { ResultatSimulation } from "@/components/results/ResultatSimulation";

const DEFAULT_PROFIL: UserProfile = {
  destinationId: "",
  profilPrincipal: "budget",
  dureeMois: 5,
  logementType: "colocation",
  frequenceVoyage: "1x_mois",
  vieSociale: "moyenne",
  budgetDisponibleMensuel: 400,
  boursesPrevues: [],
  montantBoursesTotal: 0,
  epargnePersonnelle: 0,
};

const TOTAL_STEPS = 9;

const BOURSE_OPTIONS: { value: TypeBourse; label: string }[] = [
  { value: "erasmus", label: "Erasmus+" },
  { value: "region", label: "Bourse de région" },
  { value: "crous", label: "Bourse CROUS" },
  { value: "autres", label: "Autre bourse" },
];

const PROFIL_DESCRIPTIONS: Record<ProfilPrincipal, string> = {
  budget: "Minimiser la dépense passe avant tout le reste.",
  vie_etudiante: "Sorties, associations, rencontres : l'ambiance sur place compte le plus.",
  voyage: "Profiter de la destination pour explorer le pays et la région.",
  langue: "Progresser au maximum dans la langue du pays.",
  carriere_internationale: "Construire un CV et un réseau à dimension internationale.",
  decouverte_culturelle: "Vivre une culture vraiment différente de la tienne, dépaysement total.",
};

export function Wizard() {
  const [step, setStep] = useState(1);
  const [profil, setProfil] = useState<UserProfile>(DEFAULT_PROFIL);
  const [termine, setTermine] = useState(false);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfil((p) => ({ ...p, [key]: value }));
  }

  function toggleBourse(value: TypeBourse) {
    setProfil((p) => ({
      ...p,
      boursesPrevues: p.boursesPrevues.includes(value)
        ? p.boursesPrevues.filter((b) => b !== value)
        : [...p.boursesPrevues, value],
    }));
  }

  function next() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      setTermine(true);
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function recommencer() {
    setProfil(DEFAULT_PROFIL);
    setStep(1);
    setTermine(false);
  }

  if (termine) {
    return <ResultatSimulation profil={profil} onRecommencer={recommencer} />;
  }

  switch (step) {
    case 1:
      return (
        <StepShell
          stepNumber={1}
          totalSteps={TOTAL_STEPS}
          title="Où pars-tu ?"
          subtitle="Choisis ta destination parmi celles déjà documentées dans le simulateur."
          onNext={next}
          nextDisabled={!profil.destinationId}
        >
          <DestinationPicker
            destinations={destinations}
            selectedId={profil.destinationId}
            onSelect={(id) => update("destinationId", id)}
          />
        </StepShell>
      );

    case 2:
      return (
        <StepShell
          stepNumber={2}
          totalSteps={TOTAL_STEPS}
          title="Quel est ton profil principal ?"
          subtitle="Ce qui compte le plus pour toi dans cette mobilité. Le résultat s'adaptera à ce choix."
          onBack={back}
          onNext={next}
        >
          {(Object.keys(PROFIL_AXE) as ProfilPrincipal[]).map((p) => (
            <OptionCard
              key={p}
              label={PROFIL_AXE[p].label}
              description={PROFIL_DESCRIPTIONS[p]}
              selected={profil.profilPrincipal === p}
              onClick={() => update("profilPrincipal", p)}
            />
          ))}
        </StepShell>
      );

    case 3:
      return (
        <StepShell
          stepNumber={3}
          totalSteps={TOTAL_STEPS}
          title="Combien de temps dure ton séjour ?"
          onBack={back}
          onNext={next}
          nextDisabled={profil.dureeMois <= 0}
        >
          <NumberField
            label="Durée du séjour"
            hint="En mois (ex : 5 pour un semestre classique)"
            value={profil.dureeMois}
            onChange={(v) => update("dureeMois", v)}
            suffix="mois"
            min={1}
            step={1}
          />
        </StepShell>
      );

    case 4:
      return (
        <StepShell
          stepNumber={4}
          totalSteps={TOTAL_STEPS}
          title="Quel type de logement envisages-tu ?"
          onBack={back}
          onNext={next}
        >
          {(Object.keys(LABEL_LOGEMENT) as LogementType[]).map((type) => (
            <OptionCard
              key={type}
              label={LABEL_LOGEMENT[type]}
              selected={profil.logementType === type}
              onClick={() => update("logementType", type)}
            />
          ))}
        </StepShell>
      );

    case 5:
      return (
        <StepShell
          stepNumber={5}
          totalSteps={TOTAL_STEPS}
          title="À quelle fréquence penses-tu voyager ?"
          subtitle="Week-ends, excursions dans le pays ou les pays voisins."
          onBack={back}
          onNext={next}
        >
          {(Object.keys(LABEL_FREQUENCE_VOYAGE) as FrequenceVoyage[]).map((freq) => (
            <OptionCard
              key={freq}
              label={LABEL_FREQUENCE_VOYAGE[freq]}
              selected={profil.frequenceVoyage === freq}
              onClick={() => update("frequenceVoyage", freq)}
            />
          ))}
        </StepShell>
      );

    case 6:
      return (
        <StepShell
          stepNumber={6}
          totalSteps={TOTAL_STEPS}
          title="Comment décrirais-tu ta vie sociale sur place ?"
          subtitle="Sorties, bars, restaurants, activités, soirées..."
          onBack={back}
          onNext={next}
        >
          {(Object.keys(LABEL_VIE_SOCIALE) as VieSociale[]).map((niveau) => (
            <OptionCard
              key={niveau}
              label={LABEL_VIE_SOCIALE[niveau]}
              selected={profil.vieSociale === niveau}
              onClick={() => update("vieSociale", niveau)}
            />
          ))}
        </StepShell>
      );

    case 7:
      return (
        <StepShell
          stepNumber={7}
          totalSteps={TOTAL_STEPS}
          title="Quel budget as-tu chaque mois ?"
          subtitle="Argent dont tu disposes régulièrement (famille, job étudiant...), hors bourses et épargne."
          onBack={back}
          onNext={next}
        >
          <NumberField
            label="Budget disponible"
            value={profil.budgetDisponibleMensuel}
            onChange={(v) => update("budgetDisponibleMensuel", v)}
            suffix="€ / mois"
          />
        </StepShell>
      );

    case 8:
      return (
        <StepShell
          stepNumber={8}
          totalSteps={TOTAL_STEPS}
          title="As-tu des bourses prévues ?"
          subtitle="Sélectionne toutes celles qui s'appliquent, puis indique le montant total attendu."
          onBack={back}
          onNext={next}
        >
          <div className="grid grid-cols-2 gap-3">
            {BOURSE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={profil.boursesPrevues.includes(option.value)}
                onClick={() => toggleBourse(option.value)}
              />
            ))}
          </div>
          <div className="pt-2">
            <NumberField
              label="Montant total estimé des bourses"
              hint="Toutes bourses sélectionnées confondues, pour l'ensemble du séjour"
              value={profil.montantBoursesTotal}
              onChange={(v) => update("montantBoursesTotal", v)}
              suffix="€ au total"
            />
          </div>
        </StepShell>
      );

    case 9:
      return (
        <StepShell
          stepNumber={9}
          totalSteps={TOTAL_STEPS}
          title="As-tu de l'épargne personnelle mobilisable ?"
          subtitle="Montant que tu peux utiliser pour ce séjour, en plus de ton budget mensuel et de tes bourses."
          onBack={back}
          onNext={next}
          nextLabel="Voir mon budget"
        >
          <NumberField
            label="Épargne personnelle"
            value={profil.epargnePersonnelle}
            onChange={(v) => update("epargnePersonnelle", v)}
            suffix="€ au total"
          />
        </StepShell>
      );

    default:
      return null;
  }
}

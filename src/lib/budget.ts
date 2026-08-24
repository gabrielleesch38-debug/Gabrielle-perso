import type {
  BudgetTierResult,
  CostRange,
  Destination,
  DestinationCompatibilite,
  FrequenceVoyage,
  LogementType,
  NomTier,
  SimulationResult,
  StatutCompatibilite,
  UserProfile,
  VieSociale,
} from "./types";

const MARGE_SECURITE = 0.1;

/** Interpole une valeur dans une fourchette min/moyen/eleve selon un poids 0 (min) → 1 (eleve). */
function lerpRange(range: CostRange, poids: number): number {
  const p = Math.min(1, Math.max(0, poids));
  if (p <= 0.5) {
    return range.min + (range.moyen - range.min) * (p / 0.5);
  }
  return range.moyen + (range.eleve - range.moyen) * ((p - 0.5) / 0.5);
}

/** Position du type de logement choisi dans la fourchette de la destination. */
const POIDS_LOGEMENT: Record<LogementType, number> = {
  chambre_habitant: 0,
  residence: 0.25,
  colocation: 0.5,
  studio: 1,
};

export const LABEL_LOGEMENT: Record<LogementType, string> = {
  chambre_habitant: "Chambre chez l'habitant",
  residence: "Résidence universitaire",
  colocation: "Colocation",
  studio: "Studio",
};

/** Nombre de voyages/mois retenu pour une fréquence déclarée. */
const VOYAGES_PAR_MOIS: Record<FrequenceVoyage, number> = {
  jamais: 0,
  "1x_mois": 1,
  "2x_mois": 2,
  // Léger effet de volume : voyager très souvent revient rarement à 4x le prix d'un aller-retour ponctuel.
  tous_les_weekends: 3.4,
};

export const LABEL_FREQUENCE_VOYAGE: Record<FrequenceVoyage, string> = {
  jamais: "Jamais",
  "1x_mois": "1 fois par mois",
  "2x_mois": "2 fois par mois",
  tous_les_weekends: "Tous les week-ends",
};

/** Budget loisirs mensuel de référence (pays de coût moyen, niveau 3/5) selon l'intensité de vie sociale. */
const LOISIRS_BASE: Record<VieSociale, number> = {
  faible: 40,
  moyenne: 90,
  elevee: 160,
};

export const LABEL_VIE_SOCIALE: Record<VieSociale, string> = {
  faible: "Faible",
  moyenne: "Moyenne",
  elevee: "Élevée",
};

function loisirsMensuel(vieSociale: VieSociale, niveauCoutGlobal: number): number {
  return LOISIRS_BASE[vieSociale] * (niveauCoutGlobal / 3);
}

function arrondi(valeur: number): number {
  return Math.round(valeur);
}

interface HypothesesTier {
  poidsLogement: number;
  poidsAlimentation: number;
  poidsTransport: number;
  voyagesParMois: number;
  vieSociale: VieSociale;
}

function calculerTier(
  destination: Destination,
  dureeMois: number,
  tier: NomTier,
  hypotheses: HypothesesTier,
  label: string,
  description: string,
): BudgetTierResult {
  const logement = lerpRange(destination.logement, hypotheses.poidsLogement);
  const alimentation = lerpRange(destination.alimentation, hypotheses.poidsAlimentation);
  const transport = lerpRange(destination.transport, hypotheses.poidsTransport);
  const telephone = destination.telephone;
  const voyages = destination.voyages * hypotheses.voyagesParMois;
  const loisirs = loisirsMensuel(hypotheses.vieSociale, destination.niveauCoutGlobal);

  const coutMensuelHorsInstallation = logement + alimentation + transport + telephone + voyages + loisirs;
  const installation = destination.installation;
  const sousTotal = coutMensuelHorsInstallation * dureeMois + installation;
  const margeSecurite = sousTotal * MARGE_SECURITE;
  const total = sousTotal + margeSecurite;

  return {
    tier,
    label,
    description,
    detailMensuel: {
      logement: arrondi(logement),
      alimentation: arrondi(alimentation),
      transport: arrondi(transport),
      telephone: arrondi(telephone),
      voyages: arrondi(voyages),
      loisirs: arrondi(loisirs),
    },
    coutMensuelHorsInstallation: arrondi(coutMensuelHorsInstallation),
    installation: arrondi(installation),
    sousTotal: arrondi(sousTotal),
    margeSecurite: arrondi(margeSecurite),
    total: arrondi(total),
  };
}

/**
 * Calcule les 3 budgets de référence pour une destination :
 * - minimal : hypothèses basses sur tous les postes, quasi aucun voyage/loisir (survie)
 * - confort : basé sur les réponses réelles de l'utilisateur (profil personnalisé)
 * - experience : hypothèses hautes sur tous les postes, vie sociale et voyages intenses
 */
export function calculerBudgets(
  destination: Destination,
  profil: Pick<UserProfile, "dureeMois" | "logementType" | "frequenceVoyage" | "vieSociale">,
): Record<NomTier, BudgetTierResult> {
  const minimal = calculerTier(
    destination,
    profil.dureeMois,
    "minimal",
    {
      poidsLogement: 0,
      poidsAlimentation: 0,
      poidsTransport: 0,
      voyagesParMois: 0,
      vieSociale: "faible",
    },
    "Budget minimal",
    "Le strict nécessaire pour tenir le séjour : logement le moins cher, alimentation de base, quasi aucun voyage ni sortie.",
  );

  const confort = calculerTier(
    destination,
    profil.dureeMois,
    "confort",
    {
      poidsLogement: POIDS_LOGEMENT[profil.logementType],
      poidsAlimentation: 0.5,
      poidsTransport: 0.5,
      voyagesParMois: VOYAGES_PAR_MOIS[profil.frequenceVoyage],
      vieSociale: profil.vieSociale,
    },
    "Budget confort",
    "Basé sur le profil que tu as renseigné : ton type de logement, ta fréquence de voyage et ton niveau de vie sociale.",
  );

  const experience = calculerTier(
    destination,
    profil.dureeMois,
    "experience",
    {
      poidsLogement: 1,
      poidsAlimentation: 1,
      poidsTransport: 1,
      voyagesParMois: VOYAGES_PAR_MOIS.tous_les_weekends,
      vieSociale: "elevee",
    },
    "Budget expérience complète",
    "Pour profiter pleinement de la mobilité : logement confortable, voyages fréquents, vie sociale active.",
  );

  return { minimal, confort, experience };
}

export function calculerRessourcesTotales(profil: UserProfile): number {
  return (
    profil.budgetDisponibleMensuel * profil.dureeMois +
    profil.montantBoursesTotal +
    profil.epargnePersonnelle
  );
}

export function simuler(destination: Destination, profil: UserProfile): SimulationResult {
  const tiers = calculerBudgets(destination, profil);
  const ressourcesTotales = calculerRessourcesTotales(profil);

  const resteACharge: Record<NomTier, number> = {
    minimal: arrondi(tiers.minimal.total - ressourcesTotales),
    confort: arrondi(tiers.confort.total - ressourcesTotales),
    experience: arrondi(tiers.experience.total - ressourcesTotales),
  };

  return {
    destination,
    dureeMois: profil.dureeMois,
    tiers,
    ressourcesTotales: arrondi(ressourcesTotales),
    resteACharge,
    alertesDepensesSousEstimees: alertesPour(destination),
  };
}

/**
 * Alertes sur les dépenses fréquemment sous-estimées, dérivées des retours d'étudiants
 * (cf. sourceNote de chaque destination) plutôt que d'un coût de la vie théorique.
 */
function alertesPour(destination: Destination): string[] {
  const alertes: string[] = [];

  if (destination.installation >= 500) {
    alertes.push(
      `Coût d'installation élevé (~${destination.installation}€) : caution, frais d'agence et/ou frais d'inscription obligatoires. C'est souvent la plus grosse dépense imprévue en début de séjour.`,
    );
  }

  if (destination.difficulteLogement >= 4) {
    alertes.push(
      "Marché du logement décrit comme très tendu dans les retours disponibles : lance ta recherche au moins 3 mois avant le départ.",
    );
  }

  if (destination.logement.eleve - destination.logement.min >= 400) {
    alertes.push(
      "Le prix du logement varie énormément selon le quartier et la méthode de recherche : un mauvais timing peut multiplier la facture par 2.",
    );
  }

  if (destination.confiance !== "observe") {
    alertes.push(
      "Les chiffres de cette destination sont partiellement ou totalement estimés (peu ou pas de témoignages chiffrés disponibles) : traite-les comme un ordre de grandeur, pas une valeur garantie.",
    );
  }

  return alertes;
}

const SEUIL_TENDU = 0; // reste à charge du budget minimal

export function evaluerCompatibilite(
  destinations: Destination[],
  profil: UserProfile,
): DestinationCompatibilite[] {
  const ressourcesTotales = calculerRessourcesTotales(profil);

  return destinations
    .map((destination) => {
      const tiers = calculerBudgets(destination, profil);
      const resteAChargeConfort = arrondi(tiers.confort.total - ressourcesTotales);
      const resteAChargeMinimal = tiers.minimal.total - ressourcesTotales;
      const resteAChargeExperience = tiers.experience.total - ressourcesTotales;

      let statut: StatutCompatibilite;
      if (resteAChargeExperience <= 0) {
        statut = "confortable";
      } else if (resteAChargeConfort <= 0) {
        statut = "atteignable";
      } else if (resteAChargeMinimal <= SEUIL_TENDU) {
        statut = "tendu";
      } else {
        statut = "insuffisant";
      }

      return {
        destination,
        statut,
        totalConfort: arrondi(tiers.confort.total),
        resteAChargeConfort,
      };
    })
    .sort((a, b) => a.resteAChargeConfort - b.resteAChargeConfort);
}

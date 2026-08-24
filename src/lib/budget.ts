import type {
  BudgetTierResult,
  CompatibiliteBudgetaire,
  CostRange,
  Destination,
  DestinationCompatibilite,
  ExplicationResultat,
  FrequenceVoyage,
  LogementType,
  NomTier,
  ProfilFitResult,
  ProfilPrincipal,
  RecommandationEconomie,
  Score5,
  SimulationResult,
  StatutCompatibilite,
  UserProfile,
  VerdictProfil,
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

  const compatibiliteBudgetaire = calculerCompatibiliteBudgetaire(tiers.confort, ressourcesTotales);
  const fitProfil = scoreProfil(destination, profil.profilPrincipal);

  return {
    destination,
    dureeMois: profil.dureeMois,
    tiers,
    ressourcesTotales: arrondi(ressourcesTotales),
    resteACharge,
    alertesDepensesSousEstimees: alertesPour(destination),
    compatibiliteBudgetaire,
    fitProfil,
    explication: expliquerResultat(destination, compatibiliteBudgetaire, fitProfil),
    recommandations: genererRecommandations(destination, profil, tiers),
  };
}

/**
 * Compatibilité budgétaire : compare les ressources totales déclarées au budget confort
 * (celui qui correspond réellement au profil renseigné), pas au budget minimal.
 */
export function calculerCompatibiliteBudgetaire(
  tierConfort: BudgetTierResult,
  ressourcesTotales: number,
): CompatibiliteBudgetaire {
  const margePct =
    tierConfort.total > 0 ? ((ressourcesTotales - tierConfort.total) / tierConfort.total) * 100 : 0;
  const margeArrondie = Math.round(margePct);
  const deficit = arrondi(tierConfort.total - ressourcesTotales);

  if (margePct >= 15) {
    return {
      niveau: "forte",
      margePct: margeArrondie,
      message: `Ton budget couvre le coût estimé du séjour avec une marge de sécurité de ${margeArrondie}%.`,
    };
  }

  if (margePct >= 0) {
    return {
      niveau: "moyenne",
      margePct: margeArrondie,
      message: `Ton budget couvre tout juste le coût estimé du séjour (marge de ${margeArrondie}%). Un imprévu pourrait le mettre sous tension.`,
    };
  }

  return {
    niveau: "faible",
    margePct: margeArrondie,
    message: `Déficit probable : il te manquerait environ ${formatEurosSimple(deficit)} pour couvrir ton profil déclaré.`,
  };
}

function formatEurosSimple(valeur: number): string {
  return `${Math.round(valeur).toLocaleString("fr-FR")}€`;
}

export const PROFIL_AXE: Record<
  ProfilPrincipal,
  { label: string; getter: (d: Destination) => Score5 }
> = {
  budget: { label: "Budget serré", getter: (d) => (6 - d.niveauCoutGlobal) as Score5 },
  vie_etudiante: { label: "Vie étudiante", getter: (d) => d.vieEtudiante },
  voyage: { label: "Voyage", getter: (d) => d.voyageFacilite },
  carriere_internationale: { label: "Carrière internationale", getter: (d) => d.carriereInternationale },
  langue: { label: "Progression linguistique", getter: (d) => d.langueScore },
};

const VERDICT_LABEL: Record<ProfilPrincipal, Record<VerdictProfil, string>> = {
  budget: {
    tres_adapte: "Très adapté à un budget serré",
    adapte_reserves: "Budget correct, à surveiller",
    peu_adapte: "Budget élevé pour ce profil",
  },
  vie_etudiante: {
    tres_adapte: "Vie étudiante très animée",
    adapte_reserves: "Vie étudiante correcte",
    peu_adapte: "Vie étudiante peu documentée ou plus calme",
  },
  voyage: {
    tres_adapte: "Très bien positionné pour voyager",
    adapte_reserves: "Voyages possibles, à organiser",
    peu_adapte: "Moins pratique pour voyager souvent",
  },
  carriere_internationale: {
    tres_adapte: "Forte valeur pour un profil international",
    adapte_reserves: "Valeur internationale correcte",
    peu_adapte: "Valeur CV international plus limitée",
  },
  langue: {
    tres_adapte: "Immersion linguistique forte",
    adapte_reserves: "Immersion linguistique partielle",
    peu_adapte: "Peu d'immersion linguistique réelle",
  },
};

function verdictDepuisScore(score: Score5): VerdictProfil {
  if (score >= 4) return "tres_adapte";
  if (score === 3) return "adapte_reserves";
  return "peu_adapte";
}

export function scoreProfil(destination: Destination, profil: ProfilPrincipal): ProfilFitResult {
  const axe = PROFIL_AXE[profil];
  const score = axe.getter(destination);
  const verdict = verdictDepuisScore(score);

  const explicationParProfil: Record<ProfilPrincipal, string> = {
    budget: `Niveau de coût de vie global ${destination.niveauCoutGlobal}/5 dans notre jeu de données.`,
    vie_etudiante: `Vie étudiante notée ${destination.vieEtudiante}/5 pour cette destination.`,
    voyage: `Facilité à voyager depuis cette destination notée ${destination.voyageFacilite}/5, coût moyen d'un voyage type : ${destination.voyages}€.`,
    carriere_internationale: `Valeur perçue pour un CV international notée ${destination.carriereInternationale}/5.`,
    langue: `Immersion linguistique (${destination.langueCible}) notée ${destination.langueScore}/5.`,
  };

  return {
    profil,
    score,
    verdict,
    label: VERDICT_LABEL[profil][verdict],
    explication: explicationParProfil[profil],
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

/**
 * Points forts / points de vigilance générés dynamiquement à partir des données de la
 * destination et du résultat de la simulation — jamais de texte figé par destination.
 */
function expliquerResultat(
  destination: Destination,
  compatibiliteBudgetaire: CompatibiliteBudgetaire,
  fitProfil: ProfilFitResult,
): ExplicationResultat {
  const pointsForts: string[] = [];
  const pointsVigilance: string[] = [];

  if (compatibiliteBudgetaire.niveau === "forte") {
    pointsForts.push("Ton budget déclaré couvre largement le profil confort de cette destination.");
  }
  if (destination.niveauCoutGlobal <= 2) {
    pointsForts.push("Coût de vie global bas d'après les données disponibles.");
  }
  if (destination.difficulteLogement <= 2) {
    pointsForts.push("Logement plutôt facile à trouver d'après les retours disponibles.");
  }
  if (destination.transport.moyen <= 10) {
    pointsForts.push("Transports en commun très abordables, voire gratuits pour les étudiants.");
  }
  if (destination.vieEtudiante >= 4) {
    pointsForts.push("Vie étudiante et associative particulièrement active.");
  }
  if (fitProfil.verdict === "tres_adapte") {
    pointsForts.push(fitProfil.explication);
  }
  if (destination.confiance === "observe") {
    pointsForts.push("Chiffres directement confirmés par des rapports de fin de mobilité d'étudiants.");
  }

  if (compatibiliteBudgetaire.niveau === "faible") {
    pointsVigilance.push("Déficit budgétaire probable sur le profil confort : à retravailler avant de valider ce choix.");
  }
  if (destination.difficulteLogement >= 4) {
    pointsVigilance.push("Marché du logement décrit comme tendu : lance ta recherche plusieurs mois à l'avance.");
  }
  if (destination.installation >= 500) {
    pointsVigilance.push(`Coût d'installation élevé (~${destination.installation}€) à prévoir dès le départ.`);
  }
  if (destination.logement.eleve - destination.logement.min >= 400) {
    pointsVigilance.push("Le prix du logement varie fortement selon le quartier et le moment de la recherche.");
  }
  if (fitProfil.verdict === "peu_adapte") {
    pointsVigilance.push(fitProfil.explication);
  }
  if (destination.confiance !== "observe") {
    pointsVigilance.push("Données partiellement ou totalement estimées pour cette destination : à vérifier avec des retours récents.");
  }

  return {
    pointsForts: pointsForts.slice(0, 5),
    pointsVigilance: pointsVigilance.slice(0, 5),
  };
}

/**
 * Recommandations concrètes pour réduire le budget, dérivées des postes qui pèsent le plus
 * dans le profil déclaré et des conseils qui reviennent explicitement dans le corpus de
 * témoignages (deux cartes bancaires, hébergement temporaire à l'arrivée...).
 */
function genererRecommandations(
  destination: Destination,
  profil: UserProfile,
  tiers: Record<NomTier, BudgetTierResult>,
): RecommandationEconomie[] {
  const recommandations: RecommandationEconomie[] = [];

  if (profil.logementType === "studio") {
    const coutStudio = lerpRange(destination.logement, 1);
    const coutColoc = lerpRange(destination.logement, 0.5);
    const economie = Math.round((coutStudio - coutColoc) * profil.dureeMois);
    if (economie > 0) {
      recommandations.push({
        texte: "Passer d'un studio à une colocation réduirait ton poste logement sur tout le séjour.",
        economiePotentielle: economie,
      });
    }
  }

  if (profil.frequenceVoyage === "tous_les_weekends") {
    const economie = Math.round(destination.voyages * (VOYAGES_PAR_MOIS.tous_les_weekends - VOYAGES_PAR_MOIS["2x_mois"]) * profil.dureeMois);
    if (economie > 0) {
      recommandations.push({
        texte: "Voyager 2 fois par mois plutôt que tous les week-ends laisse largement de quoi explorer le pays, pour un coût nettement plus bas.",
        economiePotentielle: economie,
      });
    }
  }

  if (destination.installation >= 500) {
    recommandations.push({
      texte: "Vérifie si ta carte bancaire ou ta mutuelle française inclut déjà une assurance voyage avant d'en souscrire une supplémentaire sur place.",
    });
  }

  if (destination.difficulteLogement >= 4) {
    recommandations.push({
      texte: "Lance ta recherche de logement au moins 3 mois avant le départ : c'est le facteur qui revient le plus souvent dans les témoignages pour éviter de payer le prix fort.",
    });
  }

  recommandations.push({
    texte: "Pars avec deux cartes bancaires de réseaux différents (Visa + Mastercard) : plusieurs étudiants du corpus se sont retrouvés bloqués avec une seule carte en panne ou perdue.",
  });

  if (destination.confiance !== "observe" || destination.difficulteLogement >= 3) {
    recommandations.push({
      texte: "Réserve un hébergement temporaire pour tes premiers jours plutôt qu'un logement à l'année signé à distance sans visite : cela laisse le temps de comparer sur place et d'éviter les arnaques.",
    });
  }

  if (tiers.experience.total - tiers.minimal.total > tiers.minimal.total) {
    recommandations.push({
      texte: "L'écart entre le budget minimal et le budget expérience complète est très large pour cette destination : les voyages et la vie sociale sont ici le principal levier d'ajustement, pas le logement.",
    });
  }

  return recommandations.slice(0, 5);
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
        fitProfil: scoreProfil(destination, profil.profilPrincipal),
      };
    })
    .sort((a, b) => a.resteAChargeConfort - b.resteAChargeConfort);
}

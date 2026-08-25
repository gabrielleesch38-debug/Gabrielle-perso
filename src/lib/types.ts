export type NiveauConfiance = "observe" | "partiel" | "estime";

export interface CostRange {
  min: number;
  moyen: number;
  eleve: number;
}

/** Score 1-5 : 1 = très faible sur cet axe, 5 = très fort. */
export type Score5 = 1 | 2 | 3 | 4 | 5;

export interface Destination {
  id: string;
  pays: string;
  ville: string;
  universite: string | null;
  region: string;
  /** €/mois */
  logement: CostRange;
  /** €/mois */
  alimentation: CostRange;
  /** €/mois */
  transport: CostRange;
  /** €/mois, valeur unique (peu de variance observée sur ce poste) */
  telephone: number;
  /** €, coût unique (caution, draps, vaisselle, frais de dossier/agence...) */
  installation: number;
  /** €, coût moyen d'un voyage type (week-end), combiné à la fréquence déclarée par l'utilisateur */
  voyages: number;
  /** 1 = très facile, 5 = très difficile */
  difficulteLogement: Score5;
  /** 1 = très bas, 5 = très élevé */
  niveauCoutGlobal: Score5;
  /** 1 = vie étudiante peu documentée/discrète, 5 = très animée */
  vieEtudiante: Score5;
  /** 1 = mal positionné pour voyager depuis cette destination, 5 = très bien positionné */
  voyageFacilite: Score5;
  /** 1 = faible valeur perçue pour un CV international, 5 = forte */
  carriereInternationale: Score5;
  /** 1 = quasi aucune immersion linguistique réelle, 5 = immersion forte */
  langueScore: Score5;
  /** Langue principale pratiquée au quotidien */
  langueCible: string;
  /** 1 = culture assez proche de la France, 5 = dépaysement culturel fort */
  decouverteCulturelle: Score5;
  confiance: NiveauConfiance;
  sourceNote: string;
}

export type LogementType =
  | "residence"
  | "colocation"
  | "studio"
  | "chambre_habitant";

export type FrequenceVoyage =
  | "jamais"
  | "1x_mois"
  | "2x_mois"
  | "tous_les_weekends";

export type VieSociale = "faible" | "moyenne" | "elevee";

export type TypeBourse = "erasmus" | "region" | "crous" | "autres";

export type ProfilPrincipal =
  | "budget"
  | "vie_etudiante"
  | "voyage"
  | "langue"
  | "carriere_internationale"
  | "decouverte_culturelle";

export interface UserProfile {
  destinationId: string;
  profilPrincipal: ProfilPrincipal;
  dureeMois: number;
  logementType: LogementType;
  frequenceVoyage: FrequenceVoyage;
  vieSociale: VieSociale;
  /** € disponibles par mois (famille, job, etc.) */
  budgetDisponibleMensuel: number;
  boursesPrevues: TypeBourse[];
  /** € reçus au total pour tout le séjour, toutes bourses confondues */
  montantBoursesTotal: number;
  /** € d'épargne personnelle mobilisable pour le séjour */
  epargnePersonnelle: number;
}

export type NomTier = "minimal" | "confort" | "experience";

export interface PosteBudget {
  logement: number;
  alimentation: number;
  transport: number;
  telephone: number;
  voyages: number;
  loisirs: number;
  installation: number;
}

export interface BudgetTierResult {
  tier: NomTier;
  label: string;
  description: string;
  /** détail mensuel (hors installation, coût unique) */
  detailMensuel: Omit<PosteBudget, "installation">;
  coutMensuelHorsInstallation: number;
  installation: number;
  /** coût total du séjour avant marge de sécurité */
  sousTotal: number;
  margeSecurite: number;
  /** coût total du séjour, marge de sécurité incluse */
  total: number;
}

export type NiveauCompatibiliteBudgetaire = "forte" | "moyenne" | "faible";

export interface CompatibiliteBudgetaire {
  niveau: NiveauCompatibiliteBudgetaire;
  /** marge (positive) ou déficit (négatif) en % du budget confort du séjour */
  margePct: number;
  message: string;
}

export type VerdictProfil = "tres_adapte" | "adapte_reserves" | "peu_adapte";

export interface ProfilFitResult {
  profil: ProfilPrincipal;
  score: Score5;
  verdict: VerdictProfil;
  label: string;
  explication: string;
}

export interface RecommandationEconomie {
  texte: string;
  economiePotentielle?: number;
}

export interface ExplicationResultat {
  pointsForts: string[];
  pointsVigilance: string[];
}

export type NiveauScoreGlobal = "forte" | "moyenne" | "faible";

export interface ComposantesScoreGlobal {
  /** 40% — couverture des ressources déclarées sur le budget confort estimé */
  budget: number;
  /** 25% — dérivé de la difficulté à trouver un logement */
  logement: number;
  /** 20% — adéquation avec le profil principal choisi */
  profil: number;
  /** 15% — marge de sécurité financière au-delà de la simple couverture du budget */
  margeSecurite: number;
}

export interface ScoreCompatibiliteGlobale {
  /** 0-100 */
  score: number;
  niveau: NiveauScoreGlobal;
  label: string;
  composantes: ComposantesScoreGlobal;
}

export interface SimulationResult {
  destination: Destination;
  dureeMois: number;
  tiers: Record<NomTier, BudgetTierResult>;
  ressourcesTotales: number;
  resteACharge: Record<NomTier, number>;
  alertesDepensesSousEstimees: string[];
  compatibiliteBudgetaire: CompatibiliteBudgetaire;
  fitProfil: ProfilFitResult;
  explication: ExplicationResultat;
  recommandations: RecommandationEconomie[];
  scoreGlobal: ScoreCompatibiliteGlobale;
}

export interface DestinationCompatibilite {
  destination: Destination;
  totalConfort: number;
  resteAChargeConfort: number;
  fitProfil: ProfilFitResult;
  scoreGlobal: ScoreCompatibiliteGlobale;
}

const DEPENSES_OUBLIEES = [
  {
    label: "Caution",
    detail: "Souvent 1 à 2 mois de loyer, parfois hors du loyer affiché dans les annonces.",
  },
  {
    label: "Assurance",
    detail: "Santé, rapatriement, responsabilité civile — obligatoire dans certains pays et pas toujours couverte par la sécurité sociale française.",
  },
  {
    label: "Carte SIM locale",
    detail: "Souvent nécessaire dès l'arrivée, même avec un forfait français utilisable à l'étranger.",
  },
  {
    label: "Linge de maison",
    detail: "Draps, oreillers, serviettes — rarement fournis, y compris en résidence universitaire.",
  },
  {
    label: "Équipements cuisine",
    detail: "Vaisselle, ustensiles — à prévoir sauf logement explicitement meublé et équipé.",
  },
  {
    label: "Trajet aéroport / gare → logement",
    detail: "Premier trajet sur place, souvent oublié du budget transport calculé au mois.",
  },
  {
    label: "Frais bancaires",
    detail: "Carte utilisée à l'étranger, frais de change, délais et coûts des virements internationaux.",
  },
] as const;

export function HiddenCostsChecklist() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Dépenses souvent oubliées</h2>
      <p className="mb-4 text-sm text-slate-500">
        Un des constats les plus récurrents dans les retours d&apos;étudiants : ces postes ne sont
        presque jamais dans le premier budget prévisionnel, et pèsent presque toujours dans la
        réalité. Ils sont déjà en partie intégrés au poste « installation » de ta simulation, mais
        vérifie-les un par un avant de partir.
      </p>
      <ul className="space-y-3">
        {DEPENSES_OUBLIEES.map((item) => (
          <li key={item.label} className="flex gap-2 text-sm">
            <span className="text-emerald-600">✔</span>
            <div>
              <span className="font-medium text-slate-800">{item.label}</span>
              <span className="text-slate-500"> — {item.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

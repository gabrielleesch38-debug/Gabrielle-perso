import Link from "next/link";
import { destinations } from "@/lib/destinations";

export default function Home() {
  const nbObservees = destinations.filter((d) => d.confiance === "observe").length;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Simulateur budget mobilité
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Combien va vraiment te coûter ton Erasmus ?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Une estimation construite à partir de retours réels d&apos;étudiants partis en
          mobilité, pas d&apos;un coût de la vie théorique. Logement, alimentation, transport,
          voyages, coûts cachés — et le montant qu&apos;il te manquerait vraiment.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/simulation"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700"
          >
            Lancer ma simulation
          </Link>
          <p className="text-sm text-slate-400">
            {destinations.length} destinations, dont {nbObservees} basées sur des rapports de
            mobilité étudiants réels.
          </p>
        </div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">1. Ton profil</p>
            <p className="mt-1 text-sm text-slate-500">
              Destination, durée, logement, voyages, vie sociale, ressources.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">2. Trois budgets</p>
            <p className="mt-1 text-sm text-slate-500">
              Minimal, confort et expérience complète, poste par poste.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">3. Reste à charge</p>
            <p className="mt-1 text-sm text-slate-500">
              Comparé à tes bourses et ton épargne, exportable en PDF.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// FR : ⚠️ AJOUT (21/10/2026) - page de test de la FENÊTRE « CARRIÈRE » : la VRAIE `ModaleCarriere` (vrai `Modale`, vrai `BoutonVue`, vrais `IconeClasse`, vraie feuille de style), avec un réseau SIMULÉ : `GetHistoricalStats` (statistiques réussies, ou `?stats-en-echec=1` : erreur 404) et l'historique d'activités. Trois personnages (Titan, Chasseur, Arcaniste). `window.__clics` enregistre les clics sur « Accomplissements ». Construite aussi en mode développement (`vue-carriere-dev`) pour voir le diagnostic. ⚠️ CHANGÉ (22/10/2026, TODO §25) : la modale est remplacée par la PAGE « Carrière » (`VueCarriere`, vraie page du sélecteur de vues, vrai sélecteur, vrai bloc Connexion simplifié) : le test vérifie que la page s'affiche AVEC le bloc Connexion et le sélecteur (le bug §25 est résolu par construction), sans aucune fenêtre modale. Le réseau simulé, les personnages et le diagnostic sont repris tels quels. / EN: test page of the Career PAGE with a simulated network.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import SelecteurVues, { VueApp } from "../../src/components/SelecteurVues";
import TitreCategorie from "../../src/components/TitreCategorie";
import VueCarriere from "../../src/components/VueCarriere";
import VueAccomplissements from "../../src/components/VueAccomplissements";

const params = new URLSearchParams(location.search);
const statsEnEchec = params.has("stats-en-echec");
const w = window as unknown as { __clics: string[]; __pret: boolean };
w.__clics = [];
const json = (corps: unknown) => new Response(JSON.stringify({ ErrorCode: 1, ErrorStatus: "Success", Response: corps }), { status: 200 });
window.fetch = (async (url: RequestInfo | URL) => {
  const u = String(url);
  if (u.includes("/Account/") && u.includes("/Stats/")) {
    if (statsEnEchec) return new Response("Not Found", { status: 404 });
    const m = (id: string, v: number) => [id, { statId: id, allTime: { basic: { value: v } } }];
    return json({ mergedAllCharacters: Object.fromEntries([m("kills", 123456), m("deaths", 23456), m("precisionKills", 54321), m("assists", 9876), m("secondsPlayed", 9000000)]) });
  }
  if (u.includes("/Stats/Activities/")) return json({ activities: [{ activityHash: 1, instanceId: "1", mode: 46, period: "2026-10-20T10:00:00Z", values: { activityDurationSeconds: { basic: { value: 1500 } } } }] });
  return new Response("{}", { status: 404 });
}) as typeof window.fetch;

const profil = { characters: { data: { "1": { classType: 0, minutesPlayedTotal: "6000" }, "2": { classType: 1, minutesPlayedTotal: "4500" }, "3": { classType: 2, minutesPlayedTotal: "3000" } } } };
const membership = { membershipId: "4611686018000000001", membershipType: 3, displayName: "Orygamer#4497" } as never;
const personnages = [{ characterId: "1", classe: "Titan", lumiere: 1990 }, { characterId: "2", classe: "Chasseur", lumiere: 1985 }, { characterId: "3", classe: "Arcaniste", lumiere: 1980 }];

function App() {
  const [vue, setVue] = useState<VueApp>("carriere");
  return (
    <div className="app-shell">
      {/* FR : bloc Connexion simplifié (connecté), même structure que dans `DashboardPage` : le test vérifie qu'il RESTE affiché au-dessus de la page. */}
      <div className="pilier-carte pilier-carte--connexion">
        <h3><TitreCategorie categorie="connexion" /><span>✅ connecté</span></h3>
        <div className="connexion-compte" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "#b7b3a8" }}>Compte : <strong style={{ color: "#e8e6df" }}>Orygamer#4497</strong></span>
        </div>
      </div>
      <SelecteurVues vue={vue} onChanger={setVue} />
      {vue === "carriere" && <VueCarriere membership={membership} personnages={personnages} profil={profil} />}
      {vue === "accomplissements" && <VueAccomplissements profil={profil} db={null} />}
      {(vue === "analyseur" || vue === "loadouts" || vue === "forge" || vue === "bibliotheque") && <p style={{ color: "#7d7a70" }}>vue « {vue} » (hors périmètre de ce test)</p>}
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<App />);
w.__pret = true;

// FR : ⚠️ AJOUT (21/10/2026) - page de test de la PAGE « CARRIÈRE » du compte, avec un réseau SIMULÉ : `GetHistoricalStats` (statistiques réussies, ou `?stats-en-echec=1` : erreur 404). ⚠️ CHANGÉ (22/10/2026, TODO §25) : la modale est remplacée par la PAGE « Carrière », ouverte par le VRAI bouton « Carrière » du bloc Connexion (vrai `BoutonsVuesCompte`, même structure que dans `DashboardPage`). Le test vérifie : le bloc Connexion et le sélecteur de vues (QUATRE onglets, sans doublon « Carrière »/« Accomplissements ») restent affichés quand la page est ouverte ; la page n'est PAS un onglet du sélecteur. `window.__clics` enregistre les clics ; `window.__requetes` enregistre les URL demandées (le test vérifie qu'AUCUNE requête d'historique d'activités n'est faite). ⚠️ CHANGÉ (22/10/2026, « Enlève la partie affichant les niveaux de persos ainsi que les 10 dernières activités ») : plus de prop `personnages`, plus de handler `/Stats/Activities/` (une requête d'activité retomberait en 404). Construite aussi en mode développement (`vue-carriere-dev`) pour voir le diagnostic. / EN: test page of the Career PAGE, opened from the real Connection block button, with a simulated network.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import SelecteurVues, { VueApp } from "../../src/components/SelecteurVues";
import TitreCategorie from "../../src/components/TitreCategorie";
import BoutonsVuesCompte from "../../src/components/BoutonsVuesCompte";
import VueCarriere from "../../src/components/VueCarriere";
import VueAccomplissements from "../../src/components/VueAccomplissements";

const params = new URLSearchParams(location.search);
const statsEnEchec = params.has("stats-en-echec");
const w = window as unknown as { __clics: string[]; __requetes: string[]; __pret: boolean };
w.__clics = [];
w.__requetes = [];
const json = (corps: unknown) => new Response(JSON.stringify({ ErrorCode: 1, ErrorStatus: "Success", Response: corps }), { status: 200 });
window.fetch = (async (url: RequestInfo | URL) => {
  const u = String(url);
  w.__requetes.push(u);
  if (u.includes("/Account/") && u.includes("/Stats/")) {
    if (statsEnEchec) return new Response("Not Found", { status: 404 });
    // ⚠️ 22/10/2026 (« Toutes les stats » + retour réel « statIds retournés : AUCUN ») : STRUCTURE RÉELLE de
    // GetHistoricalStatsForAccount : `mergedAllCharacters: { results: { <mode>: { allTime: { <statId>: {...} } } }, merged: { allTime: { <statId>: {...} } } }`.
    // 16 stats dans `merged.allTime` (l'agrégat « Carrière »), dont une INCONNUE (statId brut affiché tel quel) et des DURÉES (affichées en « h min »).
    const m = (id: string, v: number) => [id, { statId: id, basic: { value: v } }];
    // ⚠️ CHANGÉ (22/10/2026, « avant test, tout traduire ») : 16 stats = les 8 d'origine + 8 statIds RÉELS du compte de l'utilisateur
    // (capture de la grille) : weaponKillsHandCannon, efficiency, score, totalKillDistance, totalActivityDurationSeconds, averageLifespan,
    // longestSingleLife, allParticipantsTimePlayed — pour vérifier les libellés FR (y compris « Capacités (armes) » vs « Capacités ») et le
    // formatage des durées en secondes (« h min »). `statInconnueDeTest` reste : une stat inconnue affiche son statId BRUT.
    const seizeStats = Object.fromEntries([m("kills", 123456), m("deaths", 23456), m("precisionKills", 54321), m("assists", 9876), m("secondsPlayed", 9000000), m("killsDeathsRatio", 5.26), m("statInconnueDeTest", 42), m("activityDurationSeconds", 5400), m("weaponKillsHandCannon", 155285), m("efficiency", 22.54), m("score", 61576643), m("totalKillDistance", 17606565), m("totalActivityDurationSeconds", 14512058), m("averageLifespan", 226.72), m("longestSingleLife", 5456), m("allParticipantsTimePlayed", 148536347)]);
    return json({ mergedDeletedCharacters: { results: {}, merged: { allTime: {} } }, mergedAllCharacters: { results: { allPvE: { allTime: {} }, allPvP: { allTime: {} } }, merged: { allTime: seizeStats } }, characters: [] });
  }
  // ⚠️ CHANGÉ (22/10/2026) : plus de handler `/Stats/Activities/` (section supprimée) : une telle
  // requête retombe en 404, et `window.__requetes` permet au test de vérifier qu'elle n'est JAMAIS faite.
  return new Response("{}", { status: 404 });
}) as typeof window.fetch;

// ⚠️ 22/10/2026 (retour utilisateur : « non disponible » pour le temps de jeu) : cette fixture reproduit la
// FORME RÉELLE du profil passé par `DashboardPage` : `data.Response` de `recupererProfilComplet`
// (composants 100, 102, 200, …) — `characters.data[*].minutesPlayedTotal` en HAUT NIVEAU (pas dans un
// sous-objet `Response`). C'est ce profil (composant 200) que la page Carrière reçoit via `profilComplet`.
// `?sans-profil=1` : aucun profil (composant 200 absent) → la page doit retomber sur la stat `secondsPlayed`.
const profil = { characters: { data: { "1": { classType: 0, minutesPlayedTotal: "6000" }, "2": { classType: 1, minutesPlayedTotal: "4500" }, "3": { classType: 2, minutesPlayedTotal: "3000" } } } };
const sansProfil = params.has("sans-profil");
const membership = { membershipId: "4611686018000000001", membershipType: 3, displayName: "Orygamer#4497" } as never;

function App() {
  const [vue, setVue] = useState<VueApp>("analyseur");
  return (
    <div className="app-shell">
      {/* FR : bloc Connexion avec le VRAI composant `BoutonsVuesCompte` (même rendu que dans `DashboardPage`) : le test vérifie que la page s'ouvre DEPUIS ces boutons et que le bloc reste affiché. */}
      <div className="pilier-carte pilier-carte--connexion">
        <h3><TitreCategorie categorie="connexion" /><span>✅ connecté</span></h3>
        <div className="connexion-compte" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "#b7b3a8" }}>Compte : <strong style={{ color: "#e8e6df" }}>Orygamer#4497</strong></span>
          <button>Se déconnecter</button>
          <button>Tester la connexion</button>
        </div>
        <BoutonsVuesCompte onCarriere={() => { w.__clics.push("carriere"); setVue("carriere"); }} onAccomplissements={() => { w.__clics.push("accomplissements"); setVue("accomplissements"); }} />
      </div>
      <SelecteurVues vue={vue === "carriere" || vue === "accomplissements" ? "analyseur" : vue} onChanger={setVue} />
      {vue === "carriere" && <VueCarriere membership={membership} profil={sansProfil ? null : profil} />}
      {vue === "accomplissements" && <VueAccomplissements />}
      {(vue === "analyseur" || vue === "loadouts" || vue === "forge" || vue === "bibliotheque") && <p style={{ color: "#7d7a70" }}>vue « {vue} » (hors périmètre de ce test)</p>}
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<App />);
w.__pret = true;

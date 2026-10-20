// FR : ⚠️ AJOUT (21/10/2026) - page de test de la FENÊTRE « CARRIÈRE » : la VRAIE `ModaleCarriere` (vrai `Modale`, vrai `BoutonVue`, vrais `IconeClasse`, vraie feuille de style), avec un réseau SIMULÉ : `GetHistoricalStats` (statistiques réussies, ou `?stats-en-echec=1` : erreur 404) et l'historique d'activités. Trois personnages (Titan, Chasseur, Arcaniste). `window.__clics` enregistre les clics sur « Accomplissements ». Construite aussi en mode développement (`modale-carriere-dev`) pour voir le diagnostic. / EN: test page of the Career window with a simulated network.
import { createRoot } from "react-dom/client";
import ModaleCarriere from "../../src/components/ModaleCarriere";

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
createRoot(document.getElementById("racine")!).render(
  <ModaleCarriere
    onFermer={() => w.__clics.push("fermer")}
    membership={{ membershipId: "4611686018000000001", membershipType: 3, displayName: "Orygamer#4497" } as never}
    personnages={[{ characterId: "1", classe: "Titan", lumiere: 1990 }, { characterId: "2", classe: "Chasseur", lumiere: 1985 }, { characterId: "3", classe: "Arcaniste", lumiere: 1980 }]}
    profil={profil}
    onOuvrirAccomplissements={() => w.__clics.push("accomplissements")}
  />
);
w.__pret = true;

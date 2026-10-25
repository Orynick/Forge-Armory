// FR : ⚠️ AJOUT (23/10/2026, TODO n°23, branche draft-update-triomphes) - page de test de la PAGE « ACCOMPLISSEMENTS » (Triomphes du compte PAR SCEAU), avec une FAUSSE BASE Manifest (`creerFausseDb`, même mécanisme que les tests de logique) et un profil simulé (composant 900). Le test vérifie : le bloc Connexion et le sélecteur restent affichés ; la page s'ouvre depuis le bouton « Accomplissements » du bloc Connexion ; le compteur global (« X / Y triomphes obtenus · score total ») ; les sceaux REPLIÉS PAR DÉFAUT (clic pour déplier) ; la recherche avancée (guillemets, +, -, case « Aa ») ; le tri progression/nom ; PAS de vitrine « Solo sans mourir ». `?sans-profil=1` : aucun profil (message « Connectez-vous »). `?sans-db=1` : Manifest absent (avertissement « non disponible »). `window.__clics` enregistre les clics. / EN: test page of the Accomplishments page (account Triumphs BY SEAL), with a fake Manifest DB and a simulated profile (component 900).
import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Database } from "sql.js";
import SelecteurVues, { VueApp } from "../../src/components/SelecteurVues";
import TitreCategorie from "../../src/components/TitreCategorie";
import BoutonsVuesCompte from "../../src/components/BoutonsVuesCompte";
import VueAccomplissements from "../../src/components/VueAccomplissements";
import { creerFausseDb } from "../logique/fixtures/fauxManifest";

const params = new URLSearchParams(location.search);
const w = window as unknown as { __clics: string[]; __pret: boolean };
w.__clics = [];

// ---------- fausse base Manifest : arbre « Triumphs » + records (mêmes hash que `tests/logique/sceaux.test.ts`) ----------
const T_NOEUD = "DestinyPresentationNodeDefinition", T_RECORD = "DestinyRecordDefinition";
const HASH_RACINE = 1163735237;
const noeud = (hash: number, nom: string, extra: Record<string, unknown> = {}) => ({
  displayProperties: { name: nom, description: "", icon: `/icons/noeud-${hash}.png` }, ...extra,
});
const record = (hash: number, nom: string, description: string, extra: Record<string, unknown> = {}) => ({
  hash, displayProperties: { name: nom, description, icon: `/icons/record-${hash}.png` }, scope: 0, ...extra,
});
const { db: fausseDb } = creerFausseDb({
  [T_NOEUD]: {
    [HASH_RACINE]: noeud(HASH_RACINE, "Triumphs", { scope: 1, children: { presentationNodes: [{ presentationNodeHash: 9001 }, { presentationNodeHash: 9003 }] } }),
    9001: noeud(9001, "Raids", { children: { presentationNodes: [{ presentationNodeHash: 8001 }, { presentationNodeHash: 9002 }] } }),
    9002: noeud(9002, "Donjons", { children: { presentationNodes: [{ presentationNodeHash: 8002 }] } }),
    9003: noeud(9003, "Général", { children: { presentationNodes: [{ presentationNodeHash: 8003 }] } }),
    8001: noeud(8001, "Trône brisé", { completionRecordHash: 7001, children: { records: [{ recordHash: 6001 }, { recordHash: 6002 }, { recordHash: 6003 }] } }),
    8002: noeud(8002, "Prophétie", { completionRecordHash: 7002, children: { records: [{ recordHash: 6004 }, { recordHash: 6005 }] } }),
    8003: noeud(8003, "Maître des armes", { completionRecordHash: 7003, children: { records: [{ recordHash: 6006 }] } }),
  },
  [T_RECORD]: {
    7001: record(7001, "Trône brisé", "Complétez le sceau.", { titleInfo: { hasTitle: true, titlesByGender: { Male: "Briseur de trône", Female: "Briseuse de trône" } }, completionInfo: { ScoreValue: 0 } }),
    7002: record(7002, "Prophétie", "Complétez le sceau.", { titleInfo: { hasTitle: true }, completionInfo: { ScoreValue: 0 } }),
    7003: record(7003, "Maître des armes", "Complétez le sceau.", { completionInfo: { ScoreValue: 0 } }),
    6001: record(6001, "On avait dit plus jamais !", "Terminez le donjon Trône brisé en solo, sans mourir. Chute de la Maison.", { completionInfo: { ScoreValue: 500 }, objectiveHashes: [111] }),
    6002: record(6002, "Chute de la Maison", "Terminez le donjon.", { completionInfo: { ScoreValue: 250 } }),
    6003: record(6003, "Record masqué", "Description masquée.", { redacted: true }),
    6004: record(6004, "Solo sans mourir", "Terminez Prophétie en solo, sans mourir.", { completionInfo: { ScoreValue: 500 } }),
    6005: record(6005, "Vétéran", "Terminez Prophétie en mode vétéran.", { completionInfo: { ScoreValue: 100 } }),
    6006: record(6006, "Triomphe perso", "Portée personnage.", { scope: 1, completionInfo: { ScoreValue: 999 } }),
  },
});
const db = (params.has("sans-db") ? null : fausseDb) as unknown as Database | null;

// ---------- profil simulé (composant 900) : 6001 et 6004 accomplis (state=0), 6002 en cours (state=4), 7001 accompli (titre débloqué) ----------
const profilTriomphes = params.has("sans-profil")
  ? null
  : {
      Response: {
        profileRecords: {
          data: {
            records: {
              "6001": { state: 0, objectives: [{ progress: 1, completionValue: 1, complete: true }] },
              "6002": { state: 4, objectives: [{ progress: 3, completionValue: 10, complete: false }] },
              "6004": { state: 0 },
              "7001": { state: 0 },
            },
          },
        },
      },
    };

function App() {
  const [vue, setVue] = useState<VueApp>("analyseur");
  return (
    <div className="app-shell">
      {/* FR : bloc Connexion avec le VRAI composant `BoutonsVuesCompte` (même rendu que dans `DashboardPage`). */}
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
      {vue === "accomplissements" && <VueAccomplissements profil={profilTriomphes} db={db} />}
      {(vue === "analyseur" || vue === "loadouts" || vue === "forge" || vue === "bibliotheque" || vue === "carriere") && <p style={{ color: "#7d7a70" }}>vue « {vue} » (hors périmètre de ce test)</p>}
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<App />);
w.__pret = true;

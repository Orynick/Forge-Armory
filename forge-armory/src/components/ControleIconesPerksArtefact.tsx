// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - bouton de DÉVELOPPEMENT : contrôle des ICÔNES DES PERKS D'ARTEFACT (voir
// lib/diagnostic/controleIconesPerksArtefact.ts, qui explique pourquoi). Affiché seulement en mode développement
// (`npm.cmd run dev`), Manifest chargé, et si le drapeau `controleIconesPerksArtefact` est actif
// (lib/diagnosticsArchives.ts). Lecture seule ; le rapport se télécharge pour être envoyé à Claude.
// EN: ⚠️ ADDED - DEV button: checks the artifact perks' icons. Read-only; downloadable report.

import { useMemo, useState } from "react";
import type { Database } from "sql.js";
import { ARTEFACTS } from "../data/artefacts";
import { controlerIconesPerksArtefact, rapportIconesEnMarkdown, RapportIcones } from "../lib/diagnostic/controleIconesPerksArtefact";
import { telechargerFichierTexte } from "../lib/telechargement";
import { casAmbigus } from "../lib/diagnostic/departagerIcones";
import { ICONES_PERKS_ARTEFACT } from "../data/iconesPerksArtefact";
import DepartagerIconesAmbigues from "./DepartagerIconesAmbigues";

export default function ControleIconesPerksArtefact({ db }: { db: Database }) {
  const [enCours, setEnCours] = useState(false);
  const [rapport, setRapport] = useState<RapportIcones | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function lancer() {
    setEnCours(true);
    setErreur(null);
    // FR : laisse l'interface afficher « en cours » avant le calcul (quelques secondes : un passage sur tout le Manifest).
    setTimeout(() => {
      try {
        setRapport(controlerIconesPerksArtefact(db, ARTEFACTS));
      } catch (e) {
        setErreur((e as Error).message);
      } finally {
        setEnCours(false);
      }
    }, 30);
  }

  function telecharger() {
    if (!rapport) return;
    telechargerFichierTexte(rapportIconesEnMarkdown(rapport, __VERSION_APP__, new Date().toLocaleString("fr-FR")), "controle-icones-perks-artefact.md", "text/markdown");
  }

  const compte = (v: string) => rapport?.lignes.filter((l) => l.verdict === v).length ?? 0;
  // FR : ⚠️ AJOUT (06/10/2026) - les perks ambigus à départager à l'œil (voir DepartagerIconesAmbigues). / EN: ambiguous perks to settle by eye.
  // FR : ⚠️ CHANGÉ (06/10/2026, v0.3.4) - les cas DÉJÀ TRANCHÉS (icône enregistrée toujours parmi les candidates) ne sont plus proposés ; leur nombre est indiqué.
  const casTous = useMemo(() => (rapport ? casAmbigus(rapport) : []), [rapport]);
  const cas = useMemo(() => (rapport ? casAmbigus(rapport, ICONES_PERKS_ARTEFACT) : []), [rapport]);
  const nbDejaTranches = casTous.length - cas.length;
  const total = ARTEFACTS.reduce((n, a) => n + a.perksParTier[1].length + a.perksParTier[2].length + a.perksParTier[3].length, 0);
  return (
    <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", border: "1px dashed #3a3f4b", borderRadius: 6, fontSize: "0.75rem" }}>
      <strong>🖼️ Diagnostic (dev) : icônes des perks d'artefact</strong>
      <div style={{ color: "#7d7a70", margin: "0.25rem 0 0.4rem" }}>
        Cherche dans le Manifest l'icône des {total} perks d'artefact. Les {Object.keys(ICONES_PERKS_ARTEFACT).length} ont déjà leur icône enregistrée (128 trouvées directement, 19 choisies en jeu le 06/10/2026) : ce contrôle sert à vérifier, après une mise à jour du jeu, qu'aucun perk n'est devenu ambigu ou introuvable ; seuls les perks NON encore tranchés sont proposés. Lecture seule, quelques secondes.
      </div>
      <button onClick={lancer} disabled={enCours} style={{ fontSize: "0.72rem" }}>
        {enCours ? "Recherche en cours…" : "Lancer la recherche des icônes"}
      </button>
      {erreur && <div style={{ color: "#f7768e", marginTop: "0.4rem" }}>⚠️ {erreur}</div>}
      {rapport && (
        <div style={{ marginTop: "0.5rem" }}>
          <div>
            ✅ trouvées : {compte("trouve")} · 🗓 proposées par la saison : {compte("saison")} · ⚠️ ambiguës : {compte("ambigu")} · ❌ introuvables :{" "}
            {compte("introuvable")} (sur {rapport.lignes.length}) ·
            objets d'artefact repérés : {rapport.objetsArtefact} sur {rapport.objetsLus}
          </div>
          <button onClick={telecharger} style={{ fontSize: "0.72rem", marginTop: "0.4rem" }}>
            ⬇ Télécharger le rapport complet
          </button>
          {nbDejaTranches > 0 && (
            <div style={{ color: "#7fd88f", marginTop: "0.4rem" }} data-deja-tranches="">
              ✅ {nbDejaTranches} perk{nbDejaTranches > 1 ? "s" : ""} déjà tranché{nbDejaTranches > 1 ? "s" : ""} (leur icône enregistrée figure toujours parmi les candidates) : non reproposé{nbDejaTranches > 1 ? "s" : ""}.
            </div>
          )}
          {cas.length > 0 && <DepartagerIconesAmbigues cas={cas} />}
        </div>
      )}
    </div>
  );
}

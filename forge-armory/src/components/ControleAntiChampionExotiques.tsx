// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - bouton de DÉVELOPPEMENT : contrôle de
// l'anti-champion déduit pour les armes exotiques, comparé à la liste de
// référence de l'utilisateur (voir lib/diagnostic/controleAntiChampionExotiques.ts).
// Affiché seulement en mode développement (`npm.cmd run dev`) et si le drapeau
// `controleAntiChampionExotiques` est actif (lib/diagnosticsArchives.ts).
// Lecture seule. Le rapport complet se télécharge pour être envoyé à Claude.
// EN: ⚠️ ADDED - DEVELOPMENT button: checks exotic weapons' deduced anti-champion
// against the user's reference list. Read-only; downloadable report.

import { useState } from "react";
import type { Database } from "sql.js";
import { deduireAntiChampion } from "../lib/manifest/doctrine";
import { REFERENCE_EXOTIQUES_ANTI_CHAMPION } from "../data/exotiquesAntiChampion";
import { comparerAntiChampion, lireDoublonsDeNom, lireExotiquesDuManifest, rapportEnMarkdown, RapportControle } from "../lib/diagnostic/controleAntiChampionExotiques";
import { telechargerFichierTexte } from "../lib/telechargement";

export default function ControleAntiChampionExotiques({ db }: { db: Database }) {
  const [enCours, setEnCours] = useState(false);
  const [rapport, setRapport] = useState<RapportControle | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function lancer() {
    setEnCours(true);
    setErreur(null);
    // FR : laisse l'interface afficher « en cours » avant le calcul (quelques secondes).
    setTimeout(() => {
      try {
        const exotiques = lireExotiquesDuManifest(db);
        const rapportBase = comparerAntiChampion(REFERENCE_EXOTIQUES_ANTI_CHAMPION, exotiques, (hash) => deduireAntiChampion(db, hash));
        // FR : ⚠️ AJOUT (05/10/2026) - autres définitions de même nom (anciennes versions, objets factices) : voir `DoublonNom`. / EN: other same-name definitions.
        const doublons = lireDoublonsDeNom(db, REFERENCE_EXOTIQUES_ANTI_CHAMPION.map((r) => r.nom), new Set(exotiques.map((e) => e.hash)));
        setRapport({ ...rapportBase, doublons });
      } catch (e) {
        setErreur((e as Error).message);
      } finally {
        setEnCours(false);
      }
    }, 30);
  }

  function telecharger() {
    if (!rapport) return;
    const texte = rapportEnMarkdown(rapport, __VERSION_APP__, new Date().toLocaleString("fr-FR"));
    telechargerFichierTexte(texte, "controle-anti-champion-exotiques.md", "text/markdown");
  }

  const compte = (v: string) => rapport?.lignes.filter((l) => l.verdict === v).length ?? 0;
  return (
    <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", border: "1px dashed #3a3f4b", borderRadius: 6, fontSize: "0.75rem" }}>
      <strong>🔍 Diagnostic (dev) : anti-champion des armes exotiques</strong>
      <div style={{ color: "#7d7a70", margin: "0.25rem 0 0.4rem" }}>
        Compare la DÉDUCTION de repli de l'appli à la liste de référence ({REFERENCE_EXOTIQUES_ANTI_CHAMPION.length} armes). Lecture seule.
      </div>
      <button onClick={lancer} disabled={enCours} style={{ fontSize: "0.72rem" }}>
        {enCours ? "Contrôle en cours…" : "Lancer le contrôle"}
      </button>
      {erreur && <div style={{ color: "#f7768e", marginTop: "0.4rem" }}>⚠️ {erreur}</div>}
      {rapport && (
        <div style={{ marginTop: "0.5rem" }}>
          <div>
            ✅ accords : {compte("accord") + compte("accord-sans-champion")} · ❌ désaccords : {compte("desaccord")} · ❔ non détectés :{" "}
            {compte("non-detecte")} · versions divergentes : {compte("versions-divergentes")} · détectés en trop : {compte("detecte-en-trop")} ·
            absents du Manifest : {compte("absent-du-manifest")} · exotiques hors liste : {rapport.horsListe.length} · autres définitions de même nom :{" "}
            {rapport.doublons?.length ?? 0}
          </div>
          <button onClick={telecharger} style={{ fontSize: "0.72rem", marginTop: "0.4rem" }}>
            ⬇ Télécharger le rapport complet
          </button>
        </div>
      )}
    </div>
  );
}

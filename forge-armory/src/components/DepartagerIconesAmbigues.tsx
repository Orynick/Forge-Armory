// FR : ⚠️ AJOUT (06/10/2026, v0.3.1) - panneau de DÉVELOPPEMENT : pour chaque perk d'artefact dont le nom existe avec plusieurs icônes dans le Manifest, affiche les icônes candidates (A, B...) ;
// l'utilisateur compare avec le jeu, clique la bonne, puis télécharge ses choix (JSON). Voir lib/diagnostic/departagerIcones.ts. Les images sont celles de Bungie (bungie.net), chargées par
// le navigateur : jamais enregistrées ici. Aucune modification de l'appli : les choix ne servent qu'à être envoyés pour figer les bonnes icônes dans les données.
// EN: ⚠️ ADDED - DEV panel: shows the candidate icons of each ambiguous artifact perk; the user clicks the right one and downloads the choices.

import { useState } from "react";
import { AUCUNE, CasAmbigu, choixEnJson } from "../lib/diagnostic/departagerIcones";
import { urlIcone } from "../lib/manifest/search";
import { telechargerFichierTexte } from "../lib/telechargement";

const PALIERS = ["", "◆", "◆◆", "◆◆◆"];

export default function DepartagerIconesAmbigues({ cas }: { cas: CasAmbigu[] }) {
  const [choix, setChoix] = useState<Record<string, string | undefined>>({});
  // FR : « tranché » = une icône choisie OU « Aucune ne correspond » (information utile, distincte de « Je ne sais pas »). / EN: "settled" = an icon picked or "None matches".
  const tranches = cas.filter((c) => choix[c.cle] === AUCUNE || c.options.some((o) => o.lettre === choix[c.cle])).length;
  const nbNomsDifferents = cas.filter((c) => c.type === "nom-different").length;

  function telecharger() {
    telechargerFichierTexte(choixEnJson(cas, choix, __VERSION_APP__, new Date().toLocaleString("fr-FR")), "choix-icones-ambigues.json", "application/json");
  }

  return (
    <div style={{ marginTop: "0.6rem", padding: "0.5rem 0.6rem", border: "1px solid #3a3f4b", borderRadius: 6 }} data-departager="">
      <strong>🔎 Départager les {cas.length} icônes à vérifier en jeu</strong>
      <div style={{ color: "#7d7a70", margin: "0.25rem 0 0.5rem" }}>
        Pour chaque perk : <strong>dans le jeu</strong>, ouvre l'artefact indiqué, repère le perk (au palier indiqué) et compare son icône à celles ci-dessous ; clique celle qui correspond. « Aucune ne correspond » : aucune de ces icônes n'est la
        bonne. « Je ne sais pas » laisse le perk sans icône (rien n'est deviné).
        {nbNomsDifferents > 0 && (
          <>
            {" "}
            <strong>{nbNomsDifferents} perks</strong> portent un nom un peu différent dans le jeu et dans nos données (le nom du Manifest est indiqué sous chaque icône) : le Manifest en connaît souvent plusieurs versions, dont une seule est la bonne.
          </>
        )}{" "}
        Quand tu as fini, télécharge tes choix et envoie-moi le fichier.
      </div>
      {cas.map((c) => (
        <div key={c.cle} style={{ padding: "0.4rem 0", borderTop: "1px solid #2a2e38" }} data-cas={c.cle}>
          <div style={{ marginBottom: "0.3rem" }}>
            <strong>{c.nom}</strong> <span style={{ color: "#b7b3a8" }}>— {c.artefactNom} · palier {PALIERS[c.tier] ?? c.tier}</span>
            {c.type === "nom-different" && <span style={{ color: "#d6a95a" }}> · nom différent dans le Manifest</span>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "stretch" }}>
            {c.options.map((o) => {
              const actif = choix[c.cle] === o.lettre;
              return (
                <button
                  key={o.lettre}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => setChoix((a) => ({ ...a, [c.cle]: o.lettre }))}
                  title={`Icône ${o.lettre} (objet${o.objets.length > 1 ? "s" : ""} ${o.objets.join(", ")})`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.2rem",
                    padding: "0.35rem 0.6rem",
                    minWidth: 88,
                    border: `2px solid ${actif ? "#7aa2f7" : "#2a2e38"}`,
                    background: actif ? "#1b2336" : "#161922",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#e8e6df",
                  }}
                >
                  <img src={urlIcone(o.icone)} alt={`Icône ${o.lettre}`} width={56} height={56} style={{ borderRadius: 4, background: "#0d0f14" }} />
                  <span style={{ fontWeight: 700 }}>
                    {actif ? "✓ " : ""}
                    {o.lettre}
                  </span>
                  {o.nomManifest && <span style={{ color: "#d6a95a", fontSize: "0.66rem", maxWidth: 120, textAlign: "center" }}>« {o.nomManifest} »</span>}
                  <span style={{ color: "#7d7a70", fontSize: "0.62rem" }}>objet{o.objets.length > 1 ? "s" : ""} {o.objets.join(", ")}</span>
                </button>
              );
            })}
            <div style={{ alignSelf: "center", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <button
                type="button"
                aria-pressed={choix[c.cle] === AUCUNE}
                onClick={() => setChoix((a) => ({ ...a, [c.cle]: AUCUNE }))}
                style={
                  choix[c.cle] === AUCUNE
                    ? { fontSize: "0.7rem", fontWeight: 700, color: "#f0d9a8", background: "#2a2418", border: "2px solid #d6a95a", borderRadius: 4, cursor: "pointer" }
                    : { fontSize: "0.7rem", color: "#4a4f5b" }
                }
              >
                {choix[c.cle] === AUCUNE ? "✓ " : ""}Aucune ne correspond
              </button>
              <button type="button" onClick={() => setChoix((a) => ({ ...a, [c.cle]: undefined }))} style={{ fontSize: "0.7rem", color: "#7d7a70" }}>
                Je ne sais pas
              </button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.6rem", alignItems: "center" }}>
        <button onClick={telecharger} disabled={tranches === 0} style={{ fontSize: "0.72rem" }}>
          ⬇ Télécharger mes choix
        </button>
        <span data-compteur="">
          {tranches} / {cas.length} tranchés
        </span>
      </div>
    </div>
  );
}

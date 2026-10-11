// FR : Bloc "0. Contexte du build" — sélection du contexte, avec le tableau
// de pondération correspondant affiché à côté (pas de chiffres dupliqués :
// on importe POIDS_PILIERS directement du moteur de scoring, pour qu'un
// changement de pondération ne puisse jamais désynchroniser l'affichage du
// calcul réel).
//
// Placé en tête, AVANT le Pilier 1 : c'est le réglage qui détermine comment
// tous les autres sont pondérés, il doit donc se lire en premier.
//
// EN: "0. Build context" block — selection with the matching weight table
// shown alongside (POIDS_PILIERS imported directly from the scoring engine,
// so a weight change can never desync the display from the real
// calculation). Placed first, BEFORE Pillar 1: it's the setting that
// determines how every other pillar is weighted.

import TitreCategorie from "./TitreCategorie";
import { useState } from "react";
import { ContexteBuild } from "../lib/scoring/stats";
import { POIDS_PILIERS } from "../lib/scoring/pillars";
import {
  EtatPonderations,
  PoidsEnPourcent,
  activerPonderation,
  enregistrerPonderation,
  ponderationActive,
  supprimerPonderation,
  verifierPoids,
} from "../lib/scoring/ponderations";
import { LIBELLES_CONTEXTE, ORDRE_CONTEXTES } from "./icones/BadgeContexte";
import PastilleContexte, { ECHELLE_CONTEXTE_BLOC } from "./PastilleContexte";
import { LIBELLES_PILIER, ORDRE_PILIERS } from "../data/piliers";

interface Props {
  contexte: ContexteBuild;
  onChanger: (contexte: ContexteBuild) => void;
  /** FR : ⚠️ AJOUT (v0.2.8) - réglages de pondération personnalisés et réglage actif. / EN: custom weighting settings. */
  ponderations: EtatPonderations;
  onPonderations: (etat: EtatPonderations) => void;
}

// FR : ⚠️ CHANGÉ (24/08/2026, passe de débogage) - construit depuis la
// source unique (BadgeContexte) au lieu d'une liste redéclarée ici, qui
// dupliquait les mêmes libellés à un 3e endroit.
// EN: ⚠️ CHANGED (debug pass) - built from the single source instead of a
// locally redeclared list.
const OPTIONS: { valeur: ContexteBuild; libelle: string }[] = ORDRE_CONTEXTES.map((valeur) => ({
  valeur,
  libelle: LIBELLES_CONTEXTE[valeur],
}));

// FR : ⚠️ CHANGÉ (06/09/2026) - libellés ET ordre étaient déclarés ici,
// en doublon de `PilierCarte.tsx` et de l'ordre du tableau `piliers` dans
// `pillars.ts`. Tout vient maintenant de la source unique `data/piliers`.
// EN: ⚠️ CHANGED - labels AND order were declared here, duplicating two
// other places. Everything now comes from the single source.

export default function BlocContexte({ contexte, onChanger, ponderations, onPonderations }: Props) {
  // FR : ⚠️ CHANGÉ (28/09/2026, v0.2.8) - les poids affichés sont ceux
  // RÉELLEMENT utilisés : le réglage personnalisé actif s'il y en a un,
  // sinon ceux du contexte (inchangé).
  // EN: ⚠️ CHANGED - displayed weights are the ones ACTUALLY used.
  const reglageActif = ponderationActive(ponderations);
  const poidsActuels: Record<(typeof ORDRE_PILIERS)[number], number> = reglageActif
    ? (Object.fromEntries(ORDRE_PILIERS.map((cle) => [cle, reglageActif.poids[cle] / 100])) as Record<(typeof ORDRE_PILIERS)[number], number>)
    : POIDS_PILIERS[contexte];

  // FR : éditeur de réglage (ouvert par « Personnaliser »), prérempli avec
  // les poids affichés, pour partir de l'existant.
  // EN: setting editor, pre-filled with the displayed weights.
  const [edition, setEdition] = useState<{ nom: string; poids: PoidsEnPourcent } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function ouvrirEdition() {
    setErreur(null);
    setEdition({
      nom: reglageActif?.nom ?? "",
      poids: Object.fromEntries(ORDRE_PILIERS.map((cle) => [cle, Math.round(poidsActuels[cle] * 100)])) as PoidsEnPourcent,
    });
  }

  function appliquer(r: { etat: EtatPonderations; erreur?: string }) {
    setErreur(r.erreur ?? null);
    if (!r.erreur) onPonderations(r.etat);
    return !r.erreur;
  }

  function enregistrer() {
    if (!edition) return;
    if (appliquer(enregistrerPonderation(ponderations, edition.nom, edition.poids))) setEdition(null);
  }

  const totalEdition = edition ? ORDRE_PILIERS.reduce((s, cle) => s + (edition.poids[cle] || 0), 0) : 0;
  const erreurEdition = edition ? verifierPoids(edition.poids) : null;

  return (
    <div className="pilier-carte">
      <h3>
        <TitreCategorie categorie="contexte-0" />
      </h3>

      <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.5rem" }}>
        Détermine le poids de chaque pilier dans le score global, et la pondération de chaque
        statistique au Pilier 5.
      </p>

      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
        {/* FR : ⚠️ CHANGÉ (07/10/2026, v0.3.6) - boutons fournis par l'utilisateur, partagés avec la rangée sous le nom du build (DashboardPage) : components/PastilleContexte.tsx. L'icône de contexte fait maintenant partie du dessin du bouton. / EN: ⚠️ CHANGED - the user's supplied button artwork, shared with the row under the build name; the icon is part of the artwork. */}
        {OPTIONS.map((opt) => (
          <PastilleContexte key={opt.valeur} valeur={opt.valeur} libelle={opt.libelle} actif={contexte === opt.valeur} onChoisir={() => onChanger(opt.valeur)} echelle={ECHELLE_CONTEXTE_BLOC} />
        ))}
      </div>

      {/* FR : tableau de pondération du contexte SÉLECTIONNÉ - les chiffres
      viennent directement de POIDS_PILIERS, jamais recopiés à la main. */}
      <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
        <tbody>
          {ORDRE_PILIERS.map((cle) => (
            <tr key={cle} style={{ borderTop: "1px solid #2a2e38" }}>
              <td style={{ padding: "0.25rem 0.4rem 0.25rem 0", color: "#b7b3a8" }}>{LIBELLES_PILIER[cle]}</td>
              <td style={{ padding: "0.25rem 0", textAlign: "right", width: "3.5rem" }}>
                {Math.round(poidsActuels[cle] * 100)}%
              </td>
              <td style={{ padding: "0.25rem 0 0.25rem 0.5rem", width: "60%" }}>
                <div style={{ height: 6, background: "#2a2e38", borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${poidsActuels[cle] * 100}%`,
                      height: "100%",
                      background: "#7aa2f7",
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - pondération personnalisée
      (demande de l'utilisateur) : choix du réglage, création/modification
      nommée, suppression. Logique et validation dans lib/scoring/ponderations.ts.
      EN: ⚠️ ADDED - custom weighting: pick, create/edit (named), delete. */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.7rem", fontSize: "0.78rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          Pondération
          <select
            value={ponderations.actif ?? ""}
            onChange={(e) => appliquer(activerPonderation(ponderations, e.target.value || null))}
            style={{ fontSize: "0.78rem" }}
          >
            <option value="">Automatique (selon le contexte)</option>
            {ponderations.reglages.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </select>
        </label>
        <button onClick={ouvrirEdition} style={{ fontSize: "0.75rem" }} disabled={edition !== null}>
          ✏️ Personnaliser…
        </button>
        {reglageActif && (
          <button
            onClick={() => {
              if (window.confirm(`Supprimer le réglage « ${reglageActif.nom} » ?`)) appliquer(supprimerPonderation(ponderations, reglageActif.id));
            }}
            style={{ fontSize: "0.75rem" }}
          >
            🗑 Supprimer ce réglage
          </button>
        )}
      </div>
      {reglageActif && (
        <p style={{ fontSize: "0.7rem", color: "#e0af68", margin: "0.4rem 0 0" }}>
          Réglage « {reglageActif.nom} » actif : ses poids remplacent ceux du contexte dans le score global. Le
          contexte règle toujours la pondération des statistiques du pilier Statistiques.
        </p>
      )}

      {edition && (
        <div style={{ marginTop: "0.6rem", padding: "0.6rem", border: "1px solid #3a3f4b", borderRadius: 6, fontSize: "0.78rem" }}>
          {ORDRE_PILIERS.map((cle) => (
            <label key={cle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", padding: "0.15rem 0" }}>
              <span style={{ color: "#b7b3a8" }}>{LIBELLES_PILIER[cle]}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={edition.poids[cle]}
                  onChange={(e) => {
                    const valeur = e.target.value === "" ? 0 : Number(e.target.value);
                    setEdition({ ...edition, poids: { ...edition.poids, [cle]: valeur } });
                  }}
                  style={{ width: "4.5rem", fontSize: "0.78rem", textAlign: "right" }}
                />
                %
              </span>
            </label>
          ))}
          <div style={{ textAlign: "right", margin: "0.3rem 0", color: totalEdition === 100 ? "#9ece6a" : "#e0af68" }}>
            Total : {totalEdition} % {totalEdition === 100 ? "✓" : "(doit faire 100 %)"}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            Nom du réglage
            <input
              type="text"
              value={edition.nom}
              maxLength={40}
              placeholder="ex. Mon réglage raid"
              onChange={(e) => setEdition({ ...edition, nom: e.target.value })}
              style={{ flex: "1 1 160px", fontSize: "0.78rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
            <button onClick={enregistrer} disabled={erreurEdition !== null || !edition.nom.trim()} style={{ fontSize: "0.75rem" }}>
              💾 Enregistrer et activer
            </button>
            <button onClick={() => { setEdition(null); setErreur(null); }} style={{ fontSize: "0.75rem" }}>
              Annuler
            </button>
          </div>
          <p style={{ fontSize: "0.68rem", color: "#7d7a70", margin: "0.4rem 0 0" }}>
            Un réglage portant le même nom qu'un réglage existant le remplace.
          </p>
        </div>
      )}
      {erreur && <p style={{ fontSize: "0.72rem", color: "#f7768e", margin: "0.4rem 0 0" }}>⚠️ {erreur}</p>}

      <p style={{ fontSize: "0.7rem", color: "#7d7a70", margin: "0.6rem 0 0" }}>
        Détail des choix de pondération : voir la section « Le scoring » du README.
      </p>
    </div>
  );
}

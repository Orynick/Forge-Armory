// FR : ⚠️ AJOUT (23/10/2026, branche draft-optimiseur) - PAGE DÉDIÉE de l'OPTIMISEUR DE BUILD v2.
// Le module pur (data/buildOptimizer.ts) fait le calcul ; cette page ne fait que le câbler :
//   - formulaire : minimum 0-100 par stat, classement des priorités, choix de l'exotique
//     (précis / aucun / tous ceux du personnage), option « supposer masterwork » (aucune /
//     légendaires / tout) avec le RAPPEL visible que les items choisis doivent RÉELLEMENT être
//     masterworked ;
//   - scope : compte ENTIER (coffre + tous les personnages, armes comprises pour le build
//     sauvegardé), via listerObjetsPossedes ; filtre STRICT sur la classe du build courant
//     (pas d'armure « toute classe ») ;
//   - résultats : triés par priorité, affichés en PALIERS (T), par groupe d'exotique ;
//   - indicateur de progression au-delà de 500 ms (le module expose `dureeMs`) ;
//   - « Enregistrer comme build simulé » : flux de sauvegarde EXISTANT (enregistrerLoadout),
//     marqué estSimulation = true (badge 🔨 simulé dans la liste des Load-outs et dans
//     l'infographie d'export).
// SÉPARATION STRICTE (contrat) : cette page est HORS SCORING — elle ne lit pas le score, ne le
// modifie pas, et n'écrit JAMAIS dans le build courant (`monBuild`) : la seule passerelle est le
// bouton d'enregistrement, qui produit un loadout marqué « simulé ».
// EN: DEDICATED page of the BUILD OPTIMIZER v2. The pure module does the computing; this page only
// wires it: form (per-stat minimums 0-100, priority ranking, exotic choice, masterwork assumption
// with a visible reminder), whole-account scope (vault + all characters) with a strict class
// filter, results sorted by priority and shown in TIERS (T), per exotic group, progress indicator
// past 500 ms, and an "Save as simulated build" button reusing the existing save flow.
// STRICT SEPARATION (contract): this page is OUTSIDE scoring — it never reads or modifies the
// score, and NEVER writes to the current build: the only gateway is the save button.

import { useMemo, useState } from "react";
import { Database } from "sql.js";
import { BuildDraft, GearPiece, SlotArmure, StatKey } from "../types/build";
import { DestinyMembership } from "../lib/bungie/api";
import { listerObjetsPossedes } from "../lib/bungie/inventaire";
import { SessionExpiree } from "../lib/bungie/oauth";
import {
  EntreePiece,
  ModeExotique,
  ModeMasterwork,
  ResultatOptimiseur,
  optimiserBuild,
  pieceVersEntree,
} from "../data/buildOptimizer";
import { ORDRE_STATS, LIBELLES_STAT, LIBELLES_SLOT } from "../data/libellesUI";
import { poserPieceDansBuild } from "../types/build";
import { enregistrerLoadout } from "../lib/loadouts/stockage";
import { doctrineManquante, messageDoctrineIncomplete } from "../lib/loadouts/doctrineIncomplete";
import BadgeSimule from "./BadgeSimule";

// FR : les 5 emplacements d'armure, dans l'ordre d'affichage. / EN: the 5 armor slots, display order.
const SLOTS: SlotArmure[] = ["casque", "gants", "torse", "jambes", "marque"];

interface Props {
  /** FR : build courant (réel) — JAMAIS modifié par cette page ; sert à reprendre classe, doctrine, artefact, armes. / EN: the current (real) build — NEVER modified by this page; provides class, doctrine, artifact, weapons. */
  build: BuildDraft;
  membership: DestinyMembership | null;
  db: Database | null;
  /** FR : pseudo Bungie (auteur de l'enregistrement), ou null si non connecté. / EN: Bungie handle (save author), or null when not connected. */
  auteur: string | null;
  /** FR : retour à la vue d'origine (bouton « Retour »). / EN: back to the origin view (the "Back" button). */
  onRetour: () => void;
}

/** Construit le BuildDraft d'un résultat : doctrine/artefact du build courant + armes du build courant + armures proposées. */
function buildDepuisResultat(build: BuildDraft, piecesParId: Map<string, GearPiece>, idsArmure: string[], idsArmes: string[]): BuildDraft {
  let resultat: BuildDraft = { ...build, armure: [], armes: [] };
  for (const id of idsArmure) {
    const p = piecesParId.get(id);
    if (p) resultat = poserPieceDansBuild(resultat, p);
  }
  for (const id of idsArmes) {
    const p = piecesParId.get(id);
    if (p) resultat = poserPieceDansBuild(resultat, p);
  }
  return resultat;
}

export default function PageOptimiseur({ build, membership, db, auteur, onRetour }: Props) {
  const classe = build.subclass.classe;
  // --- état du formulaire ---
  const [minimums, setMinimums] = useState<Partial<Record<StatKey, number>>>({});
  const [priorites, setPriorites] = useState<StatKey[]>([...ORDRE_STATS]);
  const [modeExotique, setModeExotique] = useState<ModeExotique>("tous");
  const [exotiqueFixe, setExotiqueFixe] = useState<string>("");
  const [masterwork, setMasterwork] = useState<ModeMasterwork>("aucun");
  // --- état de l'inventaire et du calcul ---
  const [pieces, setPieces] = useState<GearPiece[] | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  const [calculEnCours, setCalculEnCours] = useState(false);
  const [progression, setProgression] = useState(false); // vrai au-delà de 500 ms (indicateur)
  const [resultat, setResultat] = useState<ResultatOptimiseur | null>(null);
  // --- état de l'enregistrement ---
  const [nomSaisie, setNomSaisie] = useState("");
  const [nomTouche, setNomTouche] = useState(false);
  const [messageEnregistrement, setMessageEnregistrement] = useState<string | null>(null);
  const [erreurEnregistrement, setErreurEnregistrement] = useState<string | null>(null);

  const exotiquesPossedes = useMemo(
    () => (pieces ?? []).filter((p) => p.isExotic && p.classeRequise === classe && ["casque", "gants", "torse", "jambes", "marque"].includes(p.slot)),
    [pieces, classe]
  );

  // FR : la classe est requise (pas d'armure « toute classe ») : sans classe choisie, pas de calcul possible.
  // EN: a class is required (no universal armor): without a chosen class, no computation is possible.
  const classePrete = classe !== null;

  async function chargerInventaire() {
    if (!membership || !db || !classePrete) return;
    setChargement(true);
    setErreurChargement(null);
    setResultat(null);
    try {
      const r = await listerObjetsPossedes(membership, db);
      setPieces(r.pieces);
    } catch (e) {
      setErreurChargement(e instanceof SessionExpiree ? "Votre session Bungie a expiré : reconnectez-vous, puis réessayez." : (e as Error).message);
    } finally {
      setChargement(false);
    }
  }

  function lancerCalcul() {
    if (!pieces || !classe) return;
    setCalculEnCours(true);
    setProgression(false);
    setMessageEnregistrement(null);
    setErreurEnregistrement(null);
    // FR : l'indicateur de progression apparaît si le calcul dépasse 500 ms (contrat) : on arme
    // un minuteur, le calcul étant SYNCHRONE (module pur, ~0,9 s pour 200 pièces).
    // EN: the progress indicator shows past 500 ms (contract): arm a timer, the computation
    // being SYNCHRONOUS (pure module, ~0.9 s for 200 pieces).
    const minuteur = window.setTimeout(() => setProgression(true), 500);
    try {
      const entrees: EntreePiece[] = pieces.map(pieceVersEntree);
      const res = optimiserBuild({
        pieces: entrees,
        classe,
        minimums,
        priorites,
        modeExotique,
        exotiqueFixe: modeExotique === "fixe" ? exotiqueFixe || undefined : undefined,
        masterwork,
      });
      setResultat(res);
    } finally {
      window.clearTimeout(minuteur);
      setProgression(false);
      setCalculEnCours(false);
    }
  }

  // FR : « Enregistrer comme build simulé » — flux de sauvegarde EXISTANT (enregistrerLoadout),
  // marqué estSimulation = true : le badge 🔨 simulé apparaîtra dans la liste des Load-outs ET
  // dans l'infographie d'export. Le build courant n'est PAS modifié.
  // EN: "Save as simulated build" — the EXISTING save flow (enregistrerLoadout), flagged
  // estSimulation = true: the 🔨 simulated badge shows in the Load-outs list AND in the export
  // infographic. The current build is NOT modified.
  function enregistrerSet(idsArmure: string[], exotiqueId: string | null) {
    if (!pieces) return;
    const nom = nomSaisie.trim();
    if (!nom) {
      setNomTouche(true);
      return;
    }
    const manquants = doctrineManquante(build);
    if (manquants.length > 0 && !window.confirm(messageDoctrineIncomplete(manquants))) return;
    const piecesParId = new Map(pieces.map((p) => [p.itemInstanceId ?? `hash:${p.itemHash}`, p]));
    // FR : les armes du build courant sont reprises telles quelles (elles peuvent être sur les
    // personnages ou dans le coffre) ; seules les 5 armures viennent de l'optimiseur.
    // EN: the current build's weapons are reused as-is (they can be on characters or in the
    // vault); only the 5 armor pieces come from the optimizer.
    const idsArmesBuild = build.armes.filter((a) => a.itemHash !== 0 && a.itemInstanceId).map((a) => a.itemInstanceId as string);
    const buildPropose = buildDepuisResultat(build, piecesParId, idsArmure, idsArmesBuild);
    const description = `Ensemble proposé par l'optimiseur (classe ${classe})${exotiqueId ? ", exotique porté" : ", sans exotique"}. Fruit d'une simulation : les armures proposées doivent être réellement possédées et portées en jeu.`
      + (masterwork !== "aucun" ? " Hypothèse masterwork appliquée : les items choisis doivent RÉELLEMENT être masterworked." : "");
    const res = enregistrerLoadout(nom, buildPropose, description, "", auteur ?? "", true);
    if (!res.ok) {
      setErreurEnregistrement(res.erreur ?? "Enregistrement impossible.");
      setMessageEnregistrement(null);
      return;
    }
    setErreurEnregistrement(null);
    setMessageEnregistrement(`Load-out « ${nom} » enregistré comme build simulé.`);
    setNomSaisie("");
    setNomTouche(false);
  }

  const piecesParId = useMemo(() => new Map((pieces ?? []).map((p) => [p.itemInstanceId ?? `hash:${p.itemHash}`, p])), [pieces]);

  return (
    <div className="pilier-carte" data-page-optimiseur="">
      <h3>
        <span>⚙️ Optimiseur de build</span>
        <button type="button" onClick={onRetour} style={{ fontSize: "0.75rem", fontWeight: "normal" }}>← Retour</button>
      </h3>
      <p style={{ fontSize: "0.8rem", color: "#b7b3a8" }}>
        Propose les meilleurs ensembles d'armures de votre compte (coffre + tous les personnages) pour des
        minimums de stats. <strong>Hors scoring</strong> : cette page ne modifie ni le score ni votre build courant ;
        l'enregistrement se fait via « Enregistrer comme build simulé ».
      </p>

      {/* --- zone de chargement de l'inventaire (compte entier) --- */}
      <div style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" data-bouton-charger-inventaire="" onClick={chargerInventaire} disabled={!membership || !db || !classePrete || chargement}>
          {chargement ? "Chargement de l'inventaire…" : pieces ? "Recharger l'inventaire du compte" : "Charger l'inventaire du compte"}
        </button>
        {pieces && <span style={{ fontSize: "0.72rem", color: "#7d7a70" }} data-nb-pieces={pieces.length}>{pieces.length} objets possédés (coffre + personnages)</span>}
        {!classePrete && <span style={{ fontSize: "0.72rem", color: "#e0c080" }}>Choisissez d'abord une classe dans « Mon Build » (pas d'armure « toute classe »).</span>}
        {!membership && <span style={{ fontSize: "0.72rem", color: "#7d7a70" }}>Connectez-vous pour charger votre inventaire.</span>}
      </div>
      {erreurChargement && <p style={{ color: "#e08080" }}>⚠️ {erreurChargement}</p>}

      {pieces && classePrete && (
        <>
          {/* --- formulaire --- */}
          <fieldset style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.6rem", marginBottom: "0.75rem" }}>
            <legend style={{ fontSize: "0.75rem", color: "#b7b3a8" }}>Objectifs (minimum par stat, 0 à 100)</legend>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.4rem" }}>
              {ORDRE_STATS.map((cle) => (
                <label key={cle} style={{ fontSize: "0.72rem", color: "#b7b3a8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  {LIBELLES_STAT[cle]}
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={minimums[cle] ?? ""}
                    data-minimum-stat={cle}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      setMinimums((m) => {
                        const next = { ...m };
                        if (Number.isFinite(v)) next[cle] = Math.max(0, Math.min(100, v));
                        else delete next[cle];
                        return next;
                      });
                    }}
                    style={{ width: "4.5rem", fontSize: "0.72rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 4, padding: "0.15rem 0.3rem" }}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.6rem", marginBottom: "0.75rem" }}>
            <legend style={{ fontSize: "0.75rem", color: "#b7b3a8" }}>Priorité des statistiques (la plus prioritaire en premier)</legend>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }} data-liste-priorites="">
              {priorites.map((cle, i) => (
                <span key={cle} style={{ display: "inline-flex", alignItems: "center", gap: "0.15rem", fontSize: "0.72rem" }}>
                  <span style={{ color: "#e8c547" }}>{i + 1}.</span>
                  <button type="button" data-priorite={cle} onClick={() => setPriorites((p) => p.filter((x) => x !== cle))} title={`Retirer ${LIBELLES_STAT[cle]} de la liste`}>
                    {LIBELLES_STAT[cle]} ✕
                  </button>
                </span>
              ))}
              <select
                aria-label="Ajouter une stat à la liste des priorités"
                value=""
                onChange={(e) => {
                  const cle = e.target.value as StatKey;
                  if (cle && !priorites.includes(cle)) setPriorites((p) => [...p, cle]);
                }}
                style={{ fontSize: "0.72rem" }}
              >
                <option value="">+ ajouter…</option>
                {ORDRE_STATS.filter((c) => !priorites.includes(c)).map((c) => (
                  <option key={c} value={c}>{LIBELLES_STAT[c]}</option>
                ))}
              </select>
              <button type="button" onClick={() => setPriorites((p) => [...p].reverse())} style={{ fontSize: "0.7rem" }} title="Inverser l'ordre des priorités">
                Inverser
              </button>
            </div>
          </fieldset>

          <fieldset style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.6rem", marginBottom: "0.75rem" }}>
            <legend style={{ fontSize: "0.75rem", color: "#b7b3a8" }}>Exotique et masterwork</legend>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.72rem", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                Exotique :
                <select value={modeExotique} data-mode-exotique="" onChange={(e) => setModeExotique(e.target.value as ModeExotique)} style={{ fontSize: "0.72rem" }}>
                  <option value="tous">Essayer tous ceux du personnage ({exotiquesPossedes.length})</option>
                  <option value="aucun">Aucun</option>
                  <option value="fixe">Un précis…</option>
                </select>
                {modeExotique === "fixe" && (
                  <select value={exotiqueFixe} data-exotique-fixe="" onChange={(e) => setExotiqueFixe(e.target.value)} style={{ fontSize: "0.72rem" }}>
                    <option value="">— choisir —</option>
                    {exotiquesPossedes.map((p) => (
                      <option key={p.itemInstanceId ?? `hash:${p.itemHash}`} value={p.itemInstanceId ?? `hash:${p.itemHash}`}>{p.nom ?? `Exotique ${p.itemHash}`}</option>
                    ))}
                  </select>
                )}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                Supposer masterwork :
                <select value={masterwork} data-mode-masterwork="" onChange={(e) => setMasterwork(e.target.value as ModeMasterwork)} style={{ fontSize: "0.72rem" }}>
                  <option value="aucun">Aucune</option>
                  <option value="legendaire">Légendaires uniquement</option>
                  <option value="tout">Tout</option>
                </select>
              </label>
            </div>
            {/* FR : ⚠️ RAPPEL VISIBLE (contrat) : les items choisis doivent RÉELLEMENT être masterworked
            quand une hypothèse est active. / EN: VISIBLE REMINDER (contract): chosen items must REALLY
            be masterworked when an assumption is active. */}
            {masterwork !== "aucun" && (
              <p data-rappel-masterwork="" style={{ fontSize: "0.7rem", color: "#e0c080", margin: "0.4rem 0 0" }}>
                ⚠️ Hypothèse « masterwork {masterwork === "tout" ? "tout" : "légendaires"} » : +5 sur les trois stats intrinsèques les plus basses, +2 ailleurs (Armor 3.0). Les items proposés devront RÉELLEMENT être masterworked en jeu pour que ces stats soient atteintes.
              </p>
            )}
          </fieldset>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <button
              type="button"
              data-bouton-lancer=""
              onClick={lancerCalcul}
              disabled={calculEnCours || (modeExotique === "fixe" && !exotiqueFixe)}
            >
              {calculEnCours ? "Calcul en cours…" : "Lancer l'optimisation"}
            </button>
            {calculEnCours && progression && <span style={{ fontSize: "0.72rem", color: "#e8c547" }} data-progression="">Calcul long… (inventaire important)</span>}
          </div>

          {/* --- résultats --- */}
          {resultat && (
            <div data-zone-resultats="">
              <p style={{ fontSize: "0.72rem", color: "#7d7a70" }} data-resume-calcul="">
                {resultat.atteignable
                  ? `Ensemble(s) trouvé(s) : ${resultat.groupes.filter((g) => g.sets.length > 0).length} groupe(s) atteignable(s).`
                  : "Aucun ensemble n'atteint tous les minimums avec cet inventaire."}
                {" "}{resultat.nbCombinaisons.toLocaleString("fr-FR")} combinaisons énumérées, {resultat.nbElages.toLocaleString("fr-FR")} élagages, calcul en {resultat.dureeMs} ms.
              </p>
              {resultat.groupes.map((g) => (
                <div key={g.exotiqueId ?? "sans-exotique"} style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem", marginBottom: "0.5rem" }} data-groupe-exotique={g.exotiqueId ?? "aucun"}>
                  <strong style={{ fontSize: "0.8rem" }}>
                    {g.exotiqueId ? `Exotique : ${g.nomExotique ?? g.exotiqueId}` : "Sans exotique"}
                  </strong>
                  {g.sets.length === 0 && <p style={{ fontSize: "0.72rem", color: "#7d7a70" }}>Aucun ensemble atteignable pour ce groupe.</p>}
                  {g.sets.map((set) => {
                    const piecesSet = set.pieces.map((id) => piecesParId.get(id)).filter((p): p is GearPiece => !!p);
                    const exotique = piecesSet.find((p) => p.isExotic);
                    return (
                      <div key={set.rang} style={{ marginTop: "0.4rem", fontSize: "0.72rem" }} data-set-rang={set.rang}>
                        <div style={{ color: "#e8c547" }} data-paliers-set="">
                          #{set.rang + 1} — {ORDRE_STATS.map((cle, i) => `${LIBELLES_STAT[cle]} T${set.paliers[i]}`).join(" · ")}
                          {" "}(sans masterwork : {ORDRE_STATS.map((cle, i) => `${LIBELLES_STAT[cle]} T${set.paliersSansMasterwork[i]}`).join(" · ")})
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: "0.25rem 0" }}>
                          {SLOTS.map((slot) => {
                            const p = piecesSet.find((x) => x.slot === slot);
                            return (
                              <li key={slot}>
                                {LIBELLES_SLOT[slot]} : {p ? <span>{p.nom ?? `Objet ${p.itemHash}`}{p.isExotic ? " (exotique)" : ""}{p.estMasterwork ? " (masterworked)" : ""}</span> : <em style={{ color: "#e08080" }}>aucune pièce</em>}
                              </li>
                            );
                          })}
                        </ul>
                        {set.pieces.every((id) => piecesParId.has(id)) && (
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              placeholder="Nom du build simulé"
                              value={nomSaisie}
                              data-nom-build-simule=""
                              onChange={(e) => { setNomSaisie(e.target.value); setNomTouche(true); }}
                              style={{ flex: 1, minWidth: "10rem", fontSize: "0.72rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 4, padding: "0.2rem 0.4rem" }}
                            />
                            <button
                              type="button"
                              data-enregistrer-simule=""
                              disabled={nomSaisie.trim() === ""}
                              onClick={() => enregistrerSet(set.pieces, g.exotiqueId)}
                              title="Enregistre ce set comme load-out marqué « simulé » (badge 🔨). Le build courant n'est pas modifié."
                              style={{ fontSize: "0.72rem" }}
                            >
                              💾 Enregistrer comme build simulé <BadgeSimule title="Ce load-out sera marqué « simulé » : fruit de l'optimiseur, les armures proposées doivent être réellement possédées et portées." />
                            </button>
                          </div>
                        )}
                        {exotique && <span style={{ fontSize: "0.68rem", color: "#7d7a70" }}>Exotique porté : {exotique.nom ?? exotique.itemHash}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
              {nomTouche && nomSaisie.trim() === "" && (
                <div role="alert" data-nom-vide="" style={{ fontSize: "0.68rem", color: "#e08080" }}>Le nom ne peut pas être vide.</div>
              )}
              {erreurEnregistrement && <p style={{ color: "#e08080" }}>⚠️ {erreurEnregistrement}</p>}
              {messageEnregistrement && <p style={{ color: "#7fd47f" }} data-message-enregistrement="">✅ {messageEnregistrement}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

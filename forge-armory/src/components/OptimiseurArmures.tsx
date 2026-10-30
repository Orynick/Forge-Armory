// FR : ⚠️ AJOUT (29/10/2026, branche draft-mod-armures), OPTIMISEUR de statistiques d'armure, ÉCRAN B (maquette validée par l'utilisateur : « une solution à la fois », onglets) : l'utilisateur fixe ses OBJECTIFS (total visé pour chaque statistique), le moteur (`lib/forge/optimiseurPieces.ts`) cherche, parmi ses armures chargées, les trois meilleures combinaisons de pièces, de mod de statistique et d'ajustement ; l'écran montre une solution à la fois (onglets), ses statistiques face aux objectifs, ses cinq pièces avec ce qui change (en bleu, « avant : … ») ; « Simuler cette solution » l'écrit dans les simulations (le score et Mon Build la voient), « Ajouter ces pièces à Mon Build » les y pose. RIEN N'EST MODIFIÉ EN JEU. Pas encore : la liste « à chasser » et le plan « à faire en jeu » (maquettes non confirmées).
// EN: ⚠️ ADDED - optimizer screen B (validated mockup): targets band, solution tabs, stats vs targets, per-piece table, "Simulate" and "Add to My Build". Nothing is changed in-game.
import { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { GearPiece, StatKey } from "../types/build";
import { LIBELLES_STAT, ORDRE_STATS } from "../data/libellesUI";
import { statPlusDePiece } from "../lib/forge/armure";
import { analyserStatsBase } from "../lib/forge/diagnosticStatsBase";
import { optimiserArmures, manqueDeLEquipement, DELAI_CALCUL_MS, type ResultatOptimisation, type SolutionPieces } from "../lib/forge/optimiseurPieces";
import { SLOTS_ARMURE } from "../lib/forge/optimiseur";
import { simulerSolution, annulerSolution, solutionSimulee, solutionAUneSimulation, lirePrefsOptimiseur, ecrirePrefsOptimiseur, type PrefsOptimiseur } from "../lib/forge/optimiseurSimulation";
import { listeAChasser } from "../lib/forge/optimiseurChasse";   // ⚠️ AJOUT (29/10/2026)
import { construirePlan, planEnTexte } from "../lib/forge/optimiseurPlan";   // ⚠️ AJOUT (29/10/2026)
import { stockageNavigateur } from "../lib/forge/simulation";
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";

const COULEURS: Record<StatKey, string> = { sante: "#e08a6f", melee: "#e0b36f", grenade: "#8fc77a", super: "#b59be0", classe: "#6fb8e0", arme: "#e0d66f" };
const LIBELLE_SLOT: Record<string, string> = { casque: "Casque", gants: "Gants", torse: "Torse", jambes: "Jambes", marque: "Objet de classe" };
const LIBELLE_CLASSE: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste" };
const ECHELLE = 180;   // largeur de barre : 180 points = pleine largeur
const pct = (v: number) => Math.max(0, Math.min(100, (v / ECHELLE) * 100));
const signe = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

const carte = { background: "#161922", border: "1px solid #3a3f4b", borderRadius: 12, padding: "1rem" } as const;
const bouton = { fontSize: "0.8rem", padding: "0.4rem 0.8rem", borderRadius: 8, border: "1px solid #3a3f4b", background: "#12151c", color: "#b7b3a8", cursor: "pointer" } as const;
const boutonPrincipal = { ...bouton, fontWeight: 600, border: "1px solid #7aa2f7", background: "#22324d", color: "#f2f0ea" } as const;

interface Props {
  db: Database | null;
  /** FR : toutes les armures chargées (personnages et Coffre). */
  pieces: readonly GearPiece[];
  /** FR : la doctrine du build de l'utilisateur est-elle prismatique ? (valeur de départ ; l'utilisateur peut la changer) */
  prismatiqueDuBuild?: boolean;
  /** FR : la classe du build (valeur de départ). */
  classeDuBuild?: string | null;
  /** FR : pose une pièce dans Mon Build. Absent : le bouton « Ajouter à Mon Build » n'est pas proposé. */
  onAjouterAuBuild?: (piece: GearPiece) => void;
}

export default function OptimiseurArmures({ db, pieces, prismatiqueDuBuild = false, classeDuBuild = null, onAjouterAuBuild }: Props) {
  const stockage = useMemo(() => stockageNavigateur(), []);
  const [prefs, setPrefs] = useState<PrefsOptimiseur>(() => lirePrefsOptimiseur(stockage));
  useEffect(() => { ecrirePrefsOptimiseur(stockage, prefs); }, [prefs, stockage]);
  const simulations = useSimulations();

  const classesPresentes = useMemo(() => (["titan", "chasseur", "arcaniste"] as const).filter((c) => pieces.some((p) => p.classeRequise === c)), [pieces]);
  const [classe, setClasse] = useState<string>(() => (classeDuBuild && classesPresentes.includes(classeDuBuild as never) ? classeDuBuild : (pieces.find((p) => p.equipe && p.classeRequise)?.classeRequise ?? classesPresentes[0] ?? "")));
  const prismatique = prefs.prismatique ?? prismatiqueDuBuild;

  const [resultat, setResultat] = useState<ResultatOptimisation | null>(null);
  const [calcule, setCalcule] = useState<{ cibles: PrefsOptimiseur["cibles"]; classe: string; prismatique: boolean } | null>(null);
  const [onglet, setOnglet] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [voirEcartees, setVoirEcartees] = useState(false);
  const [ajoutees, setAjoutees] = useState<number | null>(null);
  const [voirPlan, setVoirPlan] = useState(false);   // ⚠️ AJOUT (29/10/2026) : plan « à faire en jeu » (maquette Optimiseur-plan)
  const [coches, setCoches] = useState<Record<string, boolean>>({});
  const [copie, setCopie] = useState<"ok" | "echec" | null>(null);

  const equipees = useMemo(() => pieces.filter((p) => p.equipe && p.classeRequise === classe && (SLOTS_ARMURE as readonly string[]).includes(p.slot)), [pieces, classe]);
  const actuel = useMemo(() => manqueDeLEquipement(equipees, { cibles: prefs.cibles }), [equipees, prefs.cibles]);
  const aDesCibles = Object.keys(prefs.cibles).length > 0;

  function regler(cle: StatKey, delta: number) {
    setPrefs((p) => {
      const courant = p.cibles[cle];
      const cibles = { ...p.cibles };
      if (courant === undefined) { if (delta < 0) return p; cibles[cle] = Math.max(5, Math.ceil((actuel.totaux[cle] ?? 0) / 5) * 5); }   // « − » sur « — » : rien ; « + » : part de l'actuel arrondi aux 5
      else if (courant + delta <= 0) delete cibles[cle];
      else cibles[cle] = Math.min(400, courant + delta);
      return { ...p, cibles };
    });
    setResultat(null);
  }
  // FR : saisie directe d'un objectif : vide ou 0 = statistique non ciblée ; borné à 400.
  function fixer(cle: StatKey, texte: string) {
    const n = Math.round(Number(texte));
    setPrefs((p) => { const cibles = { ...p.cibles }; if (texte.trim() === "" || !Number.isFinite(n) || n <= 0) delete cibles[cle]; else cibles[cle] = Math.min(400, n); return { ...p, cibles }; });
    setResultat(null);
  }
  function calculer() {
    if (!db || !aDesCibles) return;
    setEnCours(true); setAjoutees(null); setVoirPlan(false); setCoches({}); setCopie(null);
    const cibles = { ...prefs.cibles };
    window.setTimeout(() => {
      const exclues = prefs.exotique === "aucune" ? pieces.filter((p) => p.isExotic && p.itemInstanceId).map((p) => p.itemInstanceId as string) : undefined;
      const r = optimiserArmures(db, pieces, { classe, prismatique, cibles, energieLibre: prefs.energieLibre, exclues, delaiMs: DELAI_CALCUL_MS });   // 10 secondes (demande de l'utilisateur)
      setResultat(r); setCalcule({ cibles, classe, prismatique }); setOnglet(0); setEnCours(false);
    }, 30);
  }

  const solution: SolutionPieces | undefined = resultat?.solutions[onglet];
  const cibleCalc = calcule?.cibles ?? {};
  const solutionPieces = solution ? solution.pieces : [];
  const details = useMemo(() => solutionPieces.map(({ piece }) => (db ? { analyse: analyserStatsBase(db, piece), plus: statPlusDePiece(db, piece) } : null)), [solutionPieces, db]);
  // FR : ⚠️ AJOUT (29/10/2026) - la liste « à chasser » (sur la MEILLEURE solution, quand elle n'atteint pas tous les objectifs) et le plan « à faire en jeu » de la solution affichée. / EN: ⚠️ ADDED - "to hunt" list (best solution) and in-game plan (shown solution).
  const meilleure = resultat?.solutions[0];
  const aChasser = useMemo(() => (meilleure && meilleure.manque > 0 ? listeAChasser(meilleure, { cibles: cibleCalc }) : []), [meilleure, cibleCalc]);
  const plan = useMemo(() => (solution && calcule ? construirePlan(solution, calcule.classe) : []), [solution, calcule]);
  const simulee = !!solution && solutionSimulee(simulations, solution);
  const aSimulation = !!solution && solutionAUneSimulation(simulations, solution);

  return (
    <div data-optimiseur="" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <strong style={{ fontSize: "1.05rem" }}>Optimiseur de statistiques d'armure</strong>
        <span style={{ fontSize: "0.8rem", color: "#9a968a" }}>Cherche, parmi vos armures chargées, les pièces et les réglages de mods qui s'approchent le plus de vos objectifs. <strong>Rien n'est modifié en jeu.</strong></span>
      </div>

      {/* réglages */}
      <div data-reglages="" style={{ ...carte, padding: "0.7rem 1rem", display: "flex", flexWrap: "wrap", gap: "0.8rem 1.4rem", alignItems: "center", fontSize: "0.8rem" }}>
        <div role="group" aria-label="Classe" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: "#9a968a" }}>Classe</span>
          {classesPresentes.length === 0 && <span style={{ color: "#e0c080" }}>aucune armure chargée</span>}
          {classesPresentes.map((c) => (
            <button key={c} type="button" data-classe={c} aria-pressed={classe === c} onClick={() => { setClasse(c); setResultat(null); }} style={{ ...bouton, ...(classe === c ? { border: "1px solid #7aa2f7", background: "#1a2436", color: "#e8e6df" } : {}) }}>{LIBELLE_CLASSE[c]}</button>
          ))}
        </div>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }} title="Les objets de classe exotiques ne sont permis qu'avec une doctrine prismatique équipée.">
          <input type="checkbox" data-prismatique="" checked={prismatique} onChange={(e) => { setPrefs((p) => ({ ...p, prismatique: e.target.checked })); setResultat(null); }} /> Doctrine prismatique équipée
        </label>
        <div role="group" aria-label="Armure exotique" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: "#9a968a" }}>Armure exotique</span>
          {(["choix", "aucune"] as const).map((m) => (
            <button key={m} type="button" data-exotique={m} aria-pressed={prefs.exotique === m} onClick={() => { setPrefs((p) => ({ ...p, exotique: m })); setResultat(null); }} style={{ ...bouton, ...(prefs.exotique === m ? { border: "1px solid #7aa2f7", background: "#1a2436", color: "#e8e6df" } : {}) }}>{m === "choix" ? "Au choix de l'outil" : "Aucune"}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} title="Énergie à garder libre dans chaque pièce, pour d'autres mods.">
          <span style={{ color: "#9a968a" }}>Énergie libre par pièce</span>
          <button type="button" aria-label="Diminuer l'énergie à garder libre" data-energie-moins="" onClick={() => { setPrefs((p) => ({ ...p, energieLibre: Math.max(0, p.energieLibre - 1) })); setResultat(null); }} style={{ ...bouton, padding: "0.2rem 0.6rem" }}>−</button>
          <span data-energie-libre="" style={{ minWidth: 18, textAlign: "center" }}>{prefs.energieLibre}</span>
          <button type="button" aria-label="Augmenter l'énergie à garder libre" data-energie-plus="" onClick={() => { setPrefs((p) => ({ ...p, energieLibre: Math.min(11, p.energieLibre + 1) })); setResultat(null); }} style={{ ...bouton, padding: "0.2rem 0.6rem" }}>+</button>
        </div>
      </div>

      {/* objectifs */}
      <div data-objectifs="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {ORDRE_STATS.map((k) => {
          const c = prefs.cibles[k];
          return (
            <div key={k} data-objectif={k} style={{ ...carte, padding: "0.6rem 0.75rem", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: COULEURS[k], fontSize: "0.82rem" }}>{LIBELLES_STAT[k]}</span>
                <span data-actuel={k} style={{ fontSize: "0.72rem", color: "#9a968a" }}>actuel {equipees.length > 0 ? actuel.totaux[k] : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#9a968a" }}>objectif</span>
                <span style={{ display: "inline-flex", alignItems: "center", border: "1px solid #3a3f4b", borderRadius: 6, overflow: "hidden", background: "#12151c" }}>
                  <button type="button" aria-label={`Diminuer l'objectif ${LIBELLES_STAT[k]}`} data-moins={k} onClick={() => regler(k, -5)} style={{ width: 24, height: 24, border: 0, background: "transparent", color: "#e8e6df", cursor: "pointer" }}>−</button>
                  <input type="number" inputMode="numeric" min={0} max={400} step={5} aria-label={`Objectif ${LIBELLES_STAT[k]}`} data-cible={k} placeholder="—" value={c === undefined ? "" : c} onChange={(e) => fixer(k, e.target.value)} style={{ width: 46, textAlign: "center", fontSize: "0.8rem", border: 0, borderLeft: "1px solid #2a2e38", borderRight: "1px solid #2a2e38", background: "transparent", color: c === undefined ? "#7d7a70" : "#e8e6df", MozAppearance: "textfield" }} />
                  <button type="button" aria-label={`Augmenter l'objectif ${LIBELLES_STAT[k]}`} data-plus={k} onClick={() => regler(k, 5)} style={{ width: 24, height: 24, border: 0, background: "transparent", color: "#e8e6df", cursor: "pointer" }}>+</button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" data-calculer="" disabled={!db || !aDesCibles || enCours || classesPresentes.length === 0} onClick={calculer} style={{ ...boutonPrincipal, fontSize: "0.88rem", padding: "0.55rem 1.1rem", opacity: !db || !aDesCibles || enCours ? 0.55 : 1 }}>{enCours ? "Calcul en cours…" : "Calculer les meilleures combinaisons"}</button>
        {!aDesCibles && <span data-aide-cibles="" style={{ fontSize: "0.78rem", color: "#e0c080" }}>Fixez au moins un objectif (bouton « + » d'une statistique).</span>}
        {aDesCibles && equipees.length > 0 && <span data-manque-actuel={actuel.manque} style={{ fontSize: "0.78rem", color: "#b7b3a8" }}>Équipement actuel : <strong style={{ color: actuel.manque === 0 ? "#7fd88f" : "#e0a080" }}>manque {actuel.manque} point{actuel.manque > 1 ? "s" : ""}</strong></span>}
      </div>

      {/* résultat */}
      {resultat && (
        <div data-resultat="" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: "0.78rem", color: "#9a968a" }}>
            <span data-bilan="">{LIBELLE_CLASSE[calcule?.classe ?? classe] ?? classe} · doctrine prismatique {calcule?.prismatique ? "équipée" : "non équipée"} · {resultat.nbCandidats} pièce{resultat.nbCandidats > 1 ? "s" : ""} étudiée{resultat.nbCandidats > 1 ? "s" : ""}{resultat.ecartees.length > 0 ? `, ${resultat.ecartees.length} écartée${resultat.ecartees.length > 1 ? "s" : ""}` : ""}{!resultat.exact && (resultat.solutions[0]?.manque ?? 0) > 0 ? " · résultat approché (calcul limité dans le temps)" : ""}</span>
            {resultat.ecartees.length > 0 && <button type="button" data-voir-ecartees="" onClick={() => setVoirEcartees((v) => !v)} style={{ ...bouton, padding: "0.15rem 0.6rem", fontSize: "0.74rem" }}>{voirEcartees ? "Masquer" : "Voir pourquoi"}</button>}
          </div>
          {voirEcartees && (
            <ul data-ecartees="" style={{ ...carte, margin: 0, listStyle: "none", fontSize: "0.76rem", color: "#b7b3a8", display: "flex", flexDirection: "column", gap: 3, maxHeight: 220, overflow: "auto" }}>
              {resultat.ecartees.map((e, i) => <li key={`${e.piece.itemInstanceId ?? i}`}><strong>{e.piece.nom}</strong> ({LIBELLE_SLOT[e.piece.slot] ?? e.piece.slot}) : {e.raison}</li>)}
            </ul>
          )}
          {resultat.slotsManquants.length > 0 && <p data-slots-manquants="" style={{ margin: 0, fontSize: "0.8rem", color: "#e0c080" }}>⚠️ Aucune armure disponible pour : {resultat.slotsManquants.map((s) => LIBELLE_SLOT[s] ?? s).join(", ")}. Les solutions ne couvrent pas {resultat.slotsManquants.length > 1 ? "ces emplacements" : "cet emplacement"}.</p>}

          {resultat.solutions.length === 0 && <p data-aucune-solution="" style={{ ...carte, margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>Aucune combinaison possible avec ces réglages (essayez de réduire l'énergie à garder libre, d'autoriser une armure exotique ou de vérifier la doctrine prismatique).</p>}

          {solution && (
            <>
              {solution.manque > 0 && <p data-objectifs-non-atteints="" style={{ margin: 0, background: "#2a1f16", border: "1px solid #8f6a4f", borderRadius: 12, padding: "0.7rem 1rem", fontSize: "0.82rem", color: "#e8c9ac" }}><strong>Aucune combinaison de vos armures n'atteint tous vos objectifs.</strong> La plus proche manque {resultat.solutions[0].manque} point{resultat.solutions[0].manque > 1 ? "s" : ""}.</p>}
              <div role="tablist" aria-label="Solutions" style={{ display: "flex", gap: 8, borderBottom: "1px solid #2a2e38", flexWrap: "wrap" }}>
                {resultat.solutions.map((s, i) => (
                  <button key={i} type="button" role="tab" data-onglet={i} aria-selected={onglet === i} onClick={() => setOnglet(i)} style={{ padding: "0.55rem 0.9rem", border: `1px solid ${onglet === i ? "#3a3f4b" : "transparent"}`, borderBottom: 0, borderRadius: "10px 10px 0 0", background: onglet === i ? "#161922" : "#0d0f14", color: "#e8e6df", fontSize: "0.82rem", display: "flex", gap: 8, alignItems: "center", marginBottom: -1, cursor: "pointer" }}>
                    <strong style={{ fontWeight: 600 }}>Solution {i + 1}</strong>
                    <span style={{ fontSize: "0.72rem", padding: "1px 8px", borderRadius: 999, border: `1px solid ${s.manque === 0 ? "#4f8f5f" : "#8f6a4f"}`, background: s.manque === 0 ? "#14251a" : "#2a1f16", color: s.manque === 0 ? "#9fe0ae" : "#e8b894" }}>{s.manque === 0 ? "Objectifs atteints" : `Manque ${s.manque}`}</span>
                    <span style={{ fontSize: "0.72rem", color: "#9a968a" }}>{s.modifs} modification{s.modifs > 1 ? "s" : ""}</span>
                    {solutionSimulee(simulations, s) && <span data-onglet-simulee={i} style={{ fontSize: "0.7rem", color: "#e8c547", border: "1px solid #e8c547", borderRadius: 999, padding: "0 0.4rem" }}>simulée</span>}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
                {/* statistiques */}
                <div data-stats-solution="" style={{ ...carte, display: "flex", flexDirection: "column", gap: 10 }}>
                  <strong style={{ fontSize: "0.9rem" }}>Statistiques de l'ensemble</strong>
                  {ORDRE_STATS.map((k) => {
                    const c = cibleCalc[k]; const v = solution.totaux[k]; const atteinte = c !== undefined && v >= c; const d = v - (actuel.totaux[k] ?? 0);
                    return (
                      <div key={k} data-stat-solution={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontSize: "0.8rem" }}>
                          <span style={{ color: COULEURS[k], minWidth: 58 }}>{LIBELLES_STAT[k]}</span>
                          {equipees.length > 0 && <span style={{ color: "#9a968a", fontSize: "0.72rem" }}>{actuel.totaux[k]} → {v} ({signe(d)})</span>}
                          <span data-etat={k} style={{ color: c === undefined ? "#7d7a70" : atteinte ? "#7fd88f" : "#e0a080", minWidth: 86, textAlign: "right" }}><strong style={{ fontWeight: 600 }}>{v}</strong> {c === undefined ? "non ciblée" : atteinte ? "atteinte" : `manque ${c - v}`}</span>
                        </div>
                        <div aria-hidden="true" style={{ position: "relative", height: 7, borderRadius: 4, background: "#232733" }}>
                          <span style={{ position: "absolute", left: 0, top: 0, height: 7, borderRadius: 4, width: `${pct(v)}%`, background: COULEURS[k], opacity: c === undefined ? 0.35 : 0.9 }} />
                          {c !== undefined && <span style={{ position: "absolute", top: -3, width: 2, height: 13, background: "#e8e6df", left: `${pct(c)}%` }} />}
                        </div>
                      </div>
                    );
                  })}
                  <span style={{ fontSize: "0.72rem", color: "#9a968a", borderTop: "1px solid #2a2e38", paddingTop: 8 }}>Trait blanc : l'objectif. Paliers du jeu : {ORDRE_STATS.filter((k) => cibleCalc[k] !== undefined).map((k) => `${LIBELLES_STAT[k]} T${Math.min(10, Math.floor(Math.max(0, solution.totaux[k]) / 10))}`).join(", ") || "—"}.</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button type="button" data-simuler="" onClick={() => db && mettreAJourSimulations((s) => simulerSolution(s, db, solution))} disabled={!db || simulee} style={{ ...boutonPrincipal, padding: "0.55rem 0.8rem", opacity: simulee ? 0.6 : 1 }}>{simulee ? "Solution simulée" : "Simuler cette solution"}</button>
                    {solution.modifs === 0 && <span data-aucune-modification="" style={{ fontSize: "0.74rem", color: "#9fe0ae" }}>Cette solution ne demande aucun changement de mod : seules les pièces changent.</span>}
                    {aSimulation && <button type="button" data-annuler="" onClick={() => mettreAJourSimulations((s) => annulerSolution(s, solution))} style={bouton}>Annuler la simulation de ces pièces</button>}
                    {onAjouterAuBuild && <button type="button" data-ajouter-build="" onClick={() => { solution.pieces.forEach(({ piece }) => onAjouterAuBuild(piece)); setAjoutees(solution.pieces.length); }} style={bouton}>Ajouter ces pièces à Mon Build</button>}
                    {ajoutees !== null && <span data-ajoutees={ajoutees} style={{ fontSize: "0.74rem", color: "#9fe0ae" }}>{ajoutees} pièce{ajoutees > 1 ? "s" : ""} ajoutée{ajoutees > 1 ? "s" : ""} à Mon Build : le score en tient compte{simulee ? " (avec les mods simulés)" : ""}.</span>}
                  </div>
                </div>

                {/* tableau des pièces */}
                <div data-pieces-solution="" style={{ ...carte, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, paddingBottom: 6 }}>
                    <strong style={{ fontSize: "0.9rem" }}>Les {solution.pieces.length} pièces et leurs réglages</strong>
                    <span style={{ fontSize: "0.72rem", color: "#9a968a" }}>en bleu : ce qui change par rapport à ce que vous portez</span>
                  </div>
                  {solution.pieces.map(({ piece, option }, i) => {
                    const d = details[i]; const analyse = d?.analyse; const plus = d?.plus ?? null;
                    return (
                      <div key={piece.itemInstanceId ?? i} data-piece-ligne={piece.slot} style={{ display: "grid", gridTemplateColumns: "70px minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 12, padding: "0.7rem 0", borderTop: "1px solid #232733", alignItems: "start" }}>
                        <span style={{ fontSize: "0.76rem", color: "#9a968a", paddingTop: 2 }}>{LIBELLE_SLOT[piece.slot] ?? piece.slot}</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <strong data-nom-piece="" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{piece.nom}</strong>
                            <span data-lieu="" style={{ fontSize: "0.68rem", padding: "1px 8px", borderRadius: 999, border: "1px solid #3a3f4b", color: "#b7b3a8" }}>{piece.equipe ? "portée" : piece.origine === "coffre" ? "Coffre" : "sur un personnage"}</span>
                            {piece.isExotic && <span style={{ fontSize: "0.68rem", padding: "1px 8px", borderRadius: 999, border: "1px solid #c9a227", color: "#e8c547" }}>exotique</span>}
                          </div>
                          <span style={{ fontSize: "0.74rem", color: "#9a968a" }}>{analyse?.archetype ?? "archétype non lu"}{analyse?.tertiaire ? ` · tertiaire ${LIBELLES_STAT[analyse.tertiaire]}` : ""}</span>
                          <span data-stats-piece="" style={{ fontSize: "0.72rem", color: "#b7b3a8", lineHeight: 1.5 }}>{ORDRE_STATS.map((k) => `${LIBELLES_STAT[k]} ${option.stats[k]}`).join(" · ")}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span style={{ fontSize: "0.68rem", color: "#9a968a" }}>Mod de statistique</span>
                          <span data-mod="" style={{ fontSize: "0.8rem", color: option.statistiqueChange ? "#7aa2f7" : "#e8e6df" }}>{option.statistique}</span>
                          {option.statistiqueChange && <span data-mod-avant="" style={{ fontSize: "0.72rem", color: "#7d7a70" }}>avant : {option.statistiqueAvant}</span>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span style={{ fontSize: "0.68rem", color: "#9a968a" }}>Ajustement</span>
                          <span data-ajustement="" style={{ fontSize: "0.8rem", color: option.ajustementChange ? "#7aa2f7" : "#e8e6df" }}>{plus && <span style={{ color: "#7fd88f" }}>⇅ </span>}{option.ajustement}</span>
                          {option.ajustementChange && <span data-ajustement-avant="" style={{ fontSize: "0.72rem", color: "#7d7a70" }}>avant : {option.ajustementAvant}</span>}
                        </div>
                      </div>
                    );
                  })}
                  <span style={{ fontSize: "0.72rem", color: "#9a968a", borderTop: "1px solid #232733", paddingTop: 8 }}>Énergie : chaque pièce tient dans sa capacité{prefs.energieLibre > 0 ? ` et garde ${prefs.energieLibre} d'énergie libre` : ""}. Les autres mods (Source de Super, Siphon…) ne sont pas touchés.</span>
                </div>
              </div>
              {/* plan « à faire en jeu » */}
              <div data-plan="" style={{ ...carte, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "0.9rem" }}>À faire en jeu</strong>
                  <button type="button" data-voir-plan="" aria-expanded={voirPlan} onClick={() => setVoirPlan((v) => !v)} style={bouton}>{voirPlan ? "Masquer le plan" : "Voir le plan à suivre en jeu"}</button>
                </div>
                {voirPlan && (
                  <>
                    <span style={{ fontSize: "0.76rem", color: "#9a968a", paddingBottom: 4 }}>L'appli ne modifie rien en jeu : cochez au fur et à mesure. Dans cet ordre : d'abord les transferts, puis les équipements, puis les mods.</span>
                    {plan.length === 0 && <span data-plan-vide="" style={{ fontSize: "0.82rem", color: "#9fe0ae" }}>Rien à faire : ces pièces sont déjà portées par votre personnage, avec les bons mods.</span>}
                    {plan.map((e, i) => (
                      <label key={`${onglet}-${i}`} data-plan-etape={e.genre} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "0.6rem 0", borderTop: "1px solid #232733", cursor: "pointer" }}>
                        <input type="checkbox" checked={!!coches[`${onglet}-${i}`]} onChange={(ev) => setCoches((c) => ({ ...c, [`${onglet}-${i}`]: ev.target.checked }))} style={{ marginTop: 3 }} />
                        <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                          <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <strong style={{ fontSize: "0.82rem", fontWeight: 600, textDecoration: coches[`${onglet}-${i}`] ? "line-through" : "none", opacity: coches[`${onglet}-${i}`] ? 0.6 : 1 }}>{e.titre}</strong>
                            <span style={{ fontSize: "0.7rem", color: e.genre === "mod" ? "#7aa2f7" : e.genre === "equipement" ? "#7fd88f" : "#9a968a", whiteSpace: "nowrap" }}>{e.genre === "transfert" ? "transfert" : e.genre === "equipement" ? "équipement" : "mod"}</span>
                          </span>
                          <span style={{ fontSize: "0.76rem", color: "#9a968a" }}>{e.detail}</span>
                        </span>
                      </label>
                    ))}
                    {plan.length > 0 && (
                      <div style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: 8, borderTop: "1px solid #232733" }}>
                        <button type="button" data-copier-plan="" onClick={() => { const t = planEnTexte(plan); (navigator.clipboard?.writeText(t) ?? Promise.reject(new Error("indisponible"))).then(() => setCopie("ok"), () => setCopie("echec")); }} style={bouton}>Copier la liste</button>
                        {copie === "ok" && <span data-copie="ok" style={{ fontSize: "0.74rem", color: "#9fe0ae" }}>Liste copiée.</span>}
                        {copie === "echec" && <span data-copie="echec" style={{ fontSize: "0.74rem", color: "#e0c080" }}>Copie impossible ici : sélectionnez le texte du plan à la main.</span>}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* liste « à chasser » : quand la meilleure solution n'atteint pas tous les objectifs */}
              {meilleure && meilleure.manque > 0 && (
                <div data-a-chasser="" style={{ ...carte, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "0.9rem" }}>À chasser</strong>
                    <span style={{ fontSize: "0.72rem", color: "#9a968a" }}>classé par manque restant, une pièce de la meilleure solution remplacée à la fois</span>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "#9a968a", paddingBottom: 6 }}>On vous indique le type d'armure à viser, pas une pièce précise : n'importe quelle armure de ce profil convient. Estimation pour une pièce de palier 5 maîtrisée, avec un mod +10 et sans ajustement ; les exotiques ne sont pas proposées.</span>
                  {aChasser.length === 0 && <span data-chasser-vide="" style={{ fontSize: "0.82rem", color: "#e0c080" }}>Remplacer une seule pièce par une meilleure armure ne rapprocherait pas davantage de vos objectifs.</span>}
                  {aChasser.map((c, i) => (
                    <div key={`${c.slot}-${c.archetype}-${c.tertiaire}`} data-chasse={i} style={{ display: "grid", gridTemplateColumns: "28px 100px minmax(0, 1.1fr) minmax(0, 1fr) 110px", gap: 10, padding: "0.6rem 0", borderTop: "1px solid #232733", alignItems: "center" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#232733", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 600 }}>{i + 1}</span>
                      <span style={{ fontSize: "0.8rem" }}>{LIBELLE_SLOT[c.slot] ?? c.slot}</span>
                      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <strong data-chasse-archetype="" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{c.archetype}</strong>
                        <span style={{ fontSize: "0.72rem", color: "#9a968a" }}>primaire {LIBELLES_STAT[c.primaire]} 30 · secondaire {LIBELLES_STAT[c.secondaire]} 25</span>
                      </span>
                      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span data-chasse-tertiaire="" style={{ fontSize: "0.82rem", color: COULEURS[c.tertiaire] }}>tertiaire {LIBELLES_STAT[c.tertiaire]}</span>
                        <span style={{ fontSize: "0.72rem", color: "#9a968a" }}>remplace : {c.remplace}</span>
                      </span>
                      <span data-chasse-apres="" style={{ fontSize: "0.8rem", textAlign: "right", color: c.manqueApres === 0 ? "#7fd88f" : "#e8b894" }}>{c.manqueApres === 0 ? "objectifs atteints" : `manque ${c.manqueApres}`}<br /><span style={{ fontSize: "0.7rem", color: "#7fd88f" }}>−{c.gain}</span></span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

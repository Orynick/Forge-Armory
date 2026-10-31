// FR : ⚠️ AJOUT (15/10/2026, v0.4.12), demande de l'utilisateur : « Go les armures » - FORGE DES ARMURES, ÉTAPE 1 : tes armures possédées (personnages et Coffre) ; une fenêtre par armure avec ses EMPLACEMENTS (archétype, amélioration, mods, mods d'ajustement…), le plug équipé et les plugs DISPONIBLES sur l'exemplaire ; SIMULATION LOCALE des MODS, avec l'effet sur les six statistiques. Comme pour les armes (étape 0.4.6) : RIEN n'est modifié dans le jeu, et la simulation n'influence PAS encore le score ni Mon Build (étape suivante, quand les données réelles de l'utilisateur auront été vérifiées : voir le diagnostic en `npm run dev`).
// ⚠️ HYPOTHÈSE de conception (voir `lib/forge/armure.ts`) : on ne peut changer que les MODS ; l'archétype, l'amélioration, le bonus d'ensemble et le perk exotique sont fixes. Le magasin de simulations est celui des armes (clé = identifiant d'exemplaire + index de prise) ; `appliquerSimulations` ne parcourt que les armes du build, donc une simulation d'armure est inerte pour le score. EN: ⚠️ ADDED - armor Forge step 1: owned armor list, a window per piece with its sockets, local simulation of mods with the stat effect; not linked to the score yet.
import { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import type { GearPiece } from "../types/build";
import { listerObjetsPossedes } from "../lib/bungie/inventaire";
import { SessionExpiree } from "../lib/bungie/oauth";
import { obtenirBonusSet } from "../lib/manifest/doctrine";
import { normaliser } from "../lib/manifest/search";
import { statsSimulees } from "../lib/forge/armure";
import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";   // ⚠️ AJOUT (24/10/2026)
import { diagnosticEnergieMods, diagnosticModsEnDouble } from "../lib/forge/diagnosticEnergie";   // ⚠️ AJOUT (24/10/2026)
import { diagnosticStatsBaseArmures } from "../lib/forge/diagnosticStatsBase";   // ⚠️ AJOUT (27/10/2026)
import { reinitialiserArme, nbColonnesSimulees, armuresSimulees, Simulations } from "../lib/forge/simulation";
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";
import StatsArmure from "./StatsArmure";   // ⚠️ AJOUT (27/10/2026)
import FenetreDetailsPiece from "./FenetreDetailsPiece";   // ⚠️ AJOUT (30/10/2026) : la fenêtre de détails UNIQUE (Build Analyzer et Forge)
import OptimiseurArmures from "./OptimiseurArmures";   // ⚠️ AJOUT (29/10/2026) : l'optimiseur de statistiques d'armure (troisième partie de la barre)
import { LIBELLES_SLOT } from "../data/libellesUI";
// FR : ⚠️ AJOUT (23/10/2026, audit) - styles partagés des fenêtres liste (dedup). / EN: ⚠️ ADDED - shared list-window styles (dedup).
import { couleurRarete, styleChamp } from "../lib/forge/stylesListes";
import IconeClasse from "./icones/IconeClasse";
import IconeSlotArmure from "./icones/IconeSlotArmure";
import VignetteArme from "./VignetteArme";
import type { CibleForge } from "./InventaireArmes";

const TAILLE_PAGE = 60;
const SLOTS_ARMURE = ["casque", "gants", "torse", "jambes", "marque"];
const CLASSES: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste" };
// FR : ⚠️ AJOUT (24/10/2026, tests post-audit, point 5.8) - « Courrier » dans
// les libellés de lieu : un objet en attente au postmaster est listé (origine
// « courrier »), même s'il ne peut pas être simulé ici.
// EN: ADDED - "Courrier" in the location labels: a postmaster item is listed
// (origin "courrier"), even though it cannot be simulated here.
const LIEUX: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste", coffre: "Coffre", courrier: "Courrier" };

const estArmure = (p: GearPiece) => SLOTS_ARMURE.includes(p.slot as string);


interface Props {
  db: Database | null;
  membership: DestinyMembership | null;
  /** FR : ⚠️ AJOUT (16/10/2026, v0.4.12) - l'armure possédée envoyée par le bouton « Forge » d'une fenêtre Détails : sa fenêtre s'ouvre toute seule (sans attendre le chargement de l'inventaire). / EN: ⚠️ ADDED - the owned armor sent by a Details window's "Forge" button; its window opens by itself. */
  cible?: CibleForge | null;
  /** FR : retour à la vue d'origine (Build Analyzer, Load-outs…), proposé dans la fenêtre quand on vient d'un bouton « Forge ». / EN: back to the originating view. */
  onRetour?: () => void;
  libelleRetour?: string;
  /** FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - clic du bouton « Lire le Lore » (fiche Détails → Legendarium). / EN: ⚠️ ADDED - "Read the Lore" click (Details sheet → Legendarium). */
  onLireLore?: (itemHash: number, nomObjet: string) => void;
  /** FR : ⚠️ AJOUT (29/10/2026) - pose une pièce dans Mon Build (transite ici UNIQUEMENT pour l'écran de l'optimiseur : « Ajouter ces pièces à Mon Build »). / EN: adds a piece to My Build (only forwarded to the optimizer screen here). */
  onAjouterAuBuild?: (piece: GearPiece) => void;
  /** FR : ⚠️ AJOUT (29/10/2026) - identifiants d'exemplaire déjà dans Mon Build (badge « Déjà dans Mon Build » de la fenêtre). / EN: instance ids already in My Build. */
  idsDansBuild?: ReadonlySet<string>;
  /** FR : ⚠️ AJOUT (29/10/2026) - doctrine prismatique du build et classe du build : valeurs de départ de l'optimiseur. / EN: build's Prismatic doctrine and class: optimizer defaults. */
  prismatiqueDuBuild?: boolean;
  classeDuBuild?: string | null;
  /** FR : ⚠️ AJOUT (29/10/2026) - vrai quand la partie « optimiseur » est active : le composant affiche alors l'optimiseur à la place de la liste. / EN: true when the "optimizer" part is active: the optimizer is shown instead of the list. */
  vueOptimiseur?: boolean;
}
// FR : ⚠️ RETIRÉ (30/10/2026) - la fenêtre de détails est devenue la fenêtre UNIQUE `FenetreDetailsPiece` ; ce style de bouton d'action ne sert plus ici. / EN: removed - the details window is now the shared one.

export default function InventaireArmures({ db, membership, cible = null, onRetour, libelleRetour = "la vue d'origine", onLireLore, onAjouterAuBuild, idsDansBuild, prismatiqueDuBuild = false, classeDuBuild = null, vueOptimiseur = false }: Props) {
  const [pieces, setPieces] = useState<GearPiece[] | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [classe, setClasse] = useState("toutes");
  const [emplacement, setEmplacement] = useState("tous");
  const [lieu, setLieu] = useState("tous");
  const [rarete, setRarete] = useState("toutes");   // ⚠️ AJOUT (19/10/2026) : mêmes filtres que la Collection
  const [ensemble, setEnsemble] = useState("tous");   // ⚠️ AJOUT (19/10/2026)
  const [seulementExotiques, setSeulementExotiques] = useState(false);
  const [seulementSimulees, setSeulementSimulees] = useState(false);
  const [affichees, setAffichees] = useState(TAILLE_PAGE);
  const [ouverte, setOuverte] = useState<GearPiece | null>(null);
  const [diagnosticDoublons, setDiagnosticDoublons] = useState<string | null>(null);   // ⚠️ AJOUT (24/10/2026) : texte du diagnostic des mods en double
  const [diagnosticEnergie, setDiagnosticEnergie] = useState<string | null>(null);   // ⚠️ AJOUT (24/10/2026) : texte du diagnostic global des coûts d'énergie
  const [diagnosticStatsBase, setDiagnosticStatsBase] = useState<string | null>(null);   // ⚠️ AJOUT (27/10/2026) : texte du diagnostic global des statistiques de base
  useEffect(() => { if (cible) { setOuverte(cible.piece); } }, [cible?.demande]);   // eslint-disable-line react-hooks/exhaustive-deps
  const simulations = useSimulations();

  async function charger() {
    if (!membership || !db) return;
    setEnCours(true); setErreur(null);
    try {
      const r = await listerObjetsPossedes(membership, db);
      setPieces(r.pieces.filter(estArmure)); setAffichees(TAILLE_PAGE);
    } catch (e) {
      setErreur(e instanceof SessionExpiree ? "Votre session Bungie a expiré : reconnectez-vous, puis réessayez." : (e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  const nbSim = (p: GearPiece) => (p.itemInstanceId ? nbColonnesSimulees(simulations, p.itemInstanceId, "armures") : 0);
  /** FR : nom de l'ensemble d'armure (Armor 3.0), lu une fois par armure. / EN: armor set name, read once per piece. */
  const ensembles = useMemo(() => {
    const m = new Map<GearPiece, string | undefined>();
    if (db) for (const p of pieces ?? []) { try { m.set(p, obtenirBonusSet(db, p.itemHash)?.nomSet); } catch { m.set(p, undefined); } }
    return m;
  }, [pieces, db]);
  const liste = useMemo(() => {
    if (!pieces) return [];
    const q = normaliser(recherche);
    return pieces
      .filter((p) => (classe === "toutes" || p.classeRequise === classe) && (emplacement === "tous" || p.slot === emplacement) && (lieu === "tous" || p.origine === lieu) && (rarete === "toutes" || p.rarete === rarete) && (ensemble === "tous" || ensembles.get(p) === ensemble) && (!seulementExotiques || p.isExotic) && (!q || normaliser(`${p.nom ?? ""} ${ensembles.get(p) ?? ""}`).includes(q)) && (!seulementSimulees || nbSim(p) > 0))
      .sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? "", "fr"));
  }, [pieces, recherche, classe, emplacement, lieu, rarete, ensemble, seulementExotiques, seulementSimulees, ensembles, simulations]);   // eslint-disable-line react-hooks/exhaustive-deps
  // FR : ⚠️ AJOUT (19/10/2026) - les ensembles DISTINCTS des armures chargées, pour le filtre « Ensemble » (comme le menu de la Collection). / EN: distinct set names for the Ensemble filter.
  const ensemblesDistincts = useMemo(() => [...new Set((pieces ?? []).map((p) => ensembles.get(p)).filter((n): n is string => !!n))].sort((a, b) => a.localeCompare(b, "fr")), [pieces, ensembles]);

  const instance = ouverte?.itemInstanceId;
  const choixOuverte = instance ? simulations.armures?.[instance] : undefined;
  void choixOuverte;   // lu par la fenêtre de détails via le magasin partagé
  const appliquer = (transformation: (s: Simulations) => Simulations) => mettreAJourSimulations(transformation);
  /** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - efface les simulations des ARMURES chargées (bloc `armures`, pas celui des armes). / EN: clears the loaded armor pieces' simulations only (`armures` block). */
  const idsAvecSimulation = (pieces ?? []).filter((p) => p.itemInstanceId && nbSim(p) > 0).map((p) => p.itemInstanceId as string);
  const nbArmuresSim = armuresSimulees(simulations).length;

  if (!membership) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Vous n'êtes pas connecté à Bungie : connectez-vous (bloc « Connexion à Bungie ») pour voir vos armures.</p>;
  if (!db) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest ».</p>;

  // FR : ⚠️ AJOUT (29/10/2026) - la partie « optimiseur » de la barre : l'écran de l'optimiseur réutilise l'inventaire des armures. La LISTE reste montée (cachée) : rien n'est rechargé en basculant. La fenêtre de détails reste montée au-dessus si elle est ouverte. / EN: the "optimizer" part reuses the armor inventory; the list stays mounted (hidden).
  return (
    <div>
      {vueOptimiseur && (
        <div>
          {pieces === null ? (
            <div data-optimiseur-charger="" style={{ margin: "0 0 0.6rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#e0c080", margin: "0 0 0.4rem" }}>⚠️ Chargez d'abord votre inventaire pour lancer l'optimiseur.</p>
              <button onClick={charger} disabled={enCours}>{enCours ? "Chargement…" : "Charger mon inventaire"}</button>
            </div>
          ) : (
            <OptimiseurArmures db={db} pieces={pieces} prismatiqueDuBuild={prismatiqueDuBuild} classeDuBuild={classeDuBuild} onAjouterAuBuild={onAjouterAuBuild} />
          )}
        </div>
      )}
      <div data-vue-armures="" hidden={vueOptimiseur}>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", maxWidth: "70ch" }}>
        Vos armures (personnages et Coffre). Ouvrez une armure pour voir ses <strong>emplacements</strong> et <strong>simuler</strong> d'autres <strong>mods</strong>, avec l'effet sur les statistiques. <strong>Rien n'est modifié dans le jeu</strong> ; la simulation reste dans l'appli, mais <strong>le score et Mon Build en tiennent compte</strong> (statistiques recalculées, « réel → simulé » à côté du score). Une simulation qui dépasse l'énergie de la pièce est ignorée par le score.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.6rem" }}>
        <button onClick={charger} disabled={enCours}>{enCours ? "Chargement…" : pieces ? "↻ Recharger mon inventaire" : "Charger mon inventaire"}</button>
        {idsAvecSimulation.length > 0 && <button onClick={() => appliquer((s) => idsAvecSimulation.reduce((acc, id) => reinitialiserArme(acc, id, "armures"), s))} data-effacer-simulations-armures="" style={{ fontSize: "0.8rem" }}>✕ Effacer les simulations d'armures ({idsAvecSimulation.length})</button>}
        {nbArmuresSim > idsAvecSimulation.length && <button onClick={() => appliquer((s) => armuresSimulees(s).reduce((acc, id) => reinitialiserArme(acc, id, "armures"), s))} data-effacer-toutes-simulations-armures="" style={{ fontSize: "0.8rem" }}>✕ Effacer TOUTES les simulations d'armures ({nbArmuresSim})</button>}
      </div>
      {erreur && <p role="alert" style={{ fontSize: "0.8rem", color: "#e0a080", margin: "0 0 0.5rem" }}>⚠️ {erreur}</p>}
      {pieces && (
        <>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <input aria-label="Rechercher une armure possédée" placeholder="Rechercher par nom ou ensemble…" value={recherche} onChange={(e) => { setRecherche(e.target.value); setAffichees(TAILLE_PAGE); }} style={{ ...styleChamp, minWidth: "15rem" }} />
            <select aria-label="Classe de l'armure" value={classe} onChange={(e) => { setClasse(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="toutes">Toutes les classes</option>
              {Object.entries(CLASSES).map(([cle, nom]) => <option key={cle} value={cle}>{nom}</option>)}
            </select>
            <select aria-label="Emplacement de l'armure" value={emplacement} onChange={(e) => { setEmplacement(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="tous">Tous les emplacements</option>
              {SLOTS_ARMURE.map((s) => <option key={s} value={s}>{LIBELLES_SLOT[s as keyof typeof LIBELLES_SLOT]}</option>)}
            </select>
            <select aria-label="Où se trouve l'armure" value={lieu} onChange={(e) => { setLieu(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="tous">Partout</option>
              {Object.entries(LIEUX).map(([cle, nom]) => <option key={cle} value={cle}>{nom}</option>)}
            </select>
            {/* FR : ⚠️ AJOUT (19/10/2026, demande : « mets les mêmes filtres que la Collection ») - rareté et ensemble, comme les menus de la Collection des armures. / EN: rarity and set filters, like the Collection's menus. */}
            <select aria-label="Rareté de l'armure" value={rarete} onChange={(e) => { setRarete(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="toutes">Toutes raretés</option>
              {[...new Set((pieces ?? []).map((p) => p.rarete).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "fr")).map((r) => <option key={r} value={r as string}>{r}</option>)}
            </select>
            <select aria-label="Ensemble d'armure possédé" value={ensemble} onChange={(e) => { setEnsemble(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="tous">Tous les ensembles</option>
              {ensemblesDistincts.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
              <input type="checkbox" checked={seulementExotiques} onChange={(e) => { setSeulementExotiques(e.target.checked); setAffichees(TAILLE_PAGE); }} /> Seulement les exotiques
            </label>
            <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
              <input type="checkbox" checked={seulementSimulees} onChange={(e) => { setSeulementSimulees(e.target.checked); setAffichees(TAILLE_PAGE); }} /> Seulement les armures simulées
            </label>
          </div>
          {/* FR : ⚠️ AJOUT (24/10/2026, demande de l'utilisateur : « un diagnostic pour relever rapidement combien coûte chaque mod de chaque pièce d'armure ») - diagnostic GLOBAL (toutes les armures chargées, pas seulement celle qui est ouverte) : coût de chaque mod, énergie de chaque pièce, écarts. Réservé au mode développement, comme les autres diagnostics ; registre : `DIAGNOSTICS_ACTIFS.coutsEnergieMods`. EN: ⚠️ ADDED - GLOBAL energy-cost diagnostic (all loaded armors), dev mode only. */}
          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.coutsEnergieMods && (
            <div data-diagnostic-energie="" style={{ marginBottom: "0.6rem" }}>
              <button onClick={() => setDiagnosticEnergie(diagnosticEnergieMods(db, pieces))} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic : coûts d'énergie des mods de toutes les armures chargées (à copier à Claude)</button>
              {diagnosticEnergie && <textarea readOnly data-diagnostic-energie-texte="" value={diagnosticEnergie} onFocus={(e) => e.currentTarget.select()} rows={14} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#c8c5bb", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.4rem" }} />}
            </div>
          )}
          {/* FR : ⚠️ AJOUT (24/10/2026, « Diag d'abord ») - second diagnostic GLOBAL : les mods qui existent en deux versions de coûts différents (même nom, hashes différents), avec la comparaison brute de leurs définitions du Manifest. Mode développement seulement ; registre : `DIAGNOSTICS_ACTIFS.modsEnDouble`. EN: ⚠️ ADDED - GLOBAL duplicate-mod diagnostic, dev mode only. */}
          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.modsEnDouble && (
            <div data-diagnostic-doublons="" style={{ marginBottom: "0.6rem" }}>
              <button onClick={() => setDiagnosticDoublons(diagnosticModsEnDouble(db, pieces))} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic : mods en double, même nom et coûts différents (à copier à Claude)</button>
              {diagnosticDoublons && <textarea readOnly data-diagnostic-doublons-texte="" value={diagnosticDoublons} onFocus={(e) => e.currentTarget.select()} rows={14} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#c8c5bb", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.4rem" }} />}
            </div>
          )}
          {/* FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures) - troisième diagnostic GLOBAL : statistiques de base de toutes les armures chargées (réelles − mod de statistique − ajustement), forme, archétype, comparaison appli/jeu. Mode développement seulement ; registre : `DIAGNOSTICS_ACTIFS.statsBase`. / EN: GLOBAL base-stats diagnostic, dev mode only. */}
          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.statsBase && (
            <div data-diagnostic-stats-base="" style={{ marginBottom: "0.6rem" }}>
              <button onClick={() => setDiagnosticStatsBase(diagnosticStatsBaseArmures(db, pieces ?? []))} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic : statistiques de base des armures chargées (à copier à Claude)</button>
              {diagnosticStatsBase && <textarea readOnly data-diagnostic-stats-base-texte="" value={diagnosticStatsBase} onFocus={(e) => e.currentTarget.select()} rows={16} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#c8c5bb", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.4rem" }} />}
            </div>
          )}
          <p data-nb-armures-possedees={liste.length} style={{ fontSize: "0.8rem", color: "#9a968a", margin: "0 0 0.5rem" }}>{liste.length} armure{liste.length > 1 ? "s" : ""}{liste.length === 0 ? " : aucune ne correspond." : ""}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.5rem" }}>
            {liste.slice(0, affichees).map((p) => (
              <li key={p.itemInstanceId ?? `${p.itemHash}-${p.origine}`}>
                <button onClick={() => setOuverte(p)} data-armure-possedee={p.itemInstanceId ?? ""} data-lieu={p.origine ?? ""} data-simulee={nbSim(p) > 0 ? "1" : ""}
                  style={{ width: "100%", textAlign: "left", display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "0.4rem", background: "#12151c", color: "#e8e6df", border: `1px solid ${couleurRarete(p)}`, borderRadius: 8, cursor: "pointer" }}>
                  <VignetteArme icone={p.icone} taille={44} reserverPlace db={db} itemHash={p.itemHash} />
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: "0.85rem", display: "block" }}>{p.nom ?? `Armure ${p.itemHash}`}</strong>
                    <span data-meta-armure="" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#b7b3a8" }}>
                      <IconeSlotArmure slot={p.slot as never} taille={16} />
                      <span>{LIBELLES_SLOT[p.slot]}</span>
                      {p.classeRequise && <><IconeClasse classe={p.classeRequise} taille={14} /><span>{CLASSES[p.classeRequise]}</span></>}
                    </span>
                    {ensembles.get(p) && <span data-ensemble="" style={{ display: "block", fontSize: "0.72rem", color: "#9a968a" }}>Ensemble « {ensembles.get(p)} »</span>}
                    <span data-lieu-texte="" style={{ display: "block", fontSize: "0.72rem", color: "#9a968a" }}>{LIEUX[p.origine ?? ""] ?? "Lieu inconnu"}{p.equipe ? " · équipée" : ""}</span>
                    {/* FR : ⚠️ AJOUT (27/10/2026) - les deux lignes de six statistiques sur la carte (celles de l'armure ; les statistiques SIMULÉES quand la carte porte une simulation), avec le ⇅ vert devant la statistique « + » de l'ajustement. */}
                     {db && <StatsArmure db={db} piece={p} stats={nbSim(p) > 0 && p.itemInstanceId ? statsSimulees(db, p, simulations.armures?.[p.itemInstanceId]).simulees : undefined} />}
                     {nbSim(p) > 0 && <span data-badge-simulation="" style={{ fontSize: "0.7rem", color: "#e8c547" }}>Simulation ({nbSim(p)} emplacement{nbSim(p) > 1 ? "s" : ""})</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {liste.length > affichees && <button onClick={() => setAffichees((n) => n + TAILLE_PAGE)} style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>Afficher plus ({liste.length - affichees} restantes)</button>}
        </>
      )}
      </div>
      {/* FR : ⚠️ CHANGÉ (30/10/2026) - la fenêtre est maintenant LA FENÊTRE UNIQUE `FenetreDetailsPiece` (même contenu, mêmes emplacements que dans Build Analyzer). / EN: the single shared details window. */}
      {ouverte && (
        <FenetreDetailsPiece db={db} piece={ouverte} onFermer={() => setOuverte(null)} onLireLore={onLireLore} onRetour={cible && onRetour ? onRetour : undefined} libelleRetour={libelleRetour} onAjouterAuBuild={onAjouterAuBuild} dejaDansBuild={!!(ouverte.itemInstanceId && idsDansBuild?.has(ouverte.itemInstanceId))} />
      )}
    </div>
  );
}

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
import { statsSimulees, colonnesArmure } from "../lib/forge/armure";
import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";   // ⚠️ AJOUT (24/10/2026)
import { diagnosticEnergieMods, diagnosticModsEnDouble } from "../lib/forge/diagnosticEnergie";   // ⚠️ AJOUT (24/10/2026)
import { diagnosticStatsBaseArmures } from "../lib/forge/diagnosticStatsBase";   // ⚠️ AJOUT (27/10/2026)
import { reinitialiserArme, nbColonnesSimulees, armuresSimulees, Simulations, ecartsApplicables, EcartSocket, ColonneApplicable } from "../lib/forge/simulation";
import { insererPlug, lireProfilEquipement, localiserDansProfil } from "../lib/bungie/equiper";   // ⚠️ AJOUT (03/11/2026, mods-phase-2) : écriture réelle chez Bungie
import Modale from "./Modale";   // ⚠️ AJOUT (03/11/2026, mods-phase-2) : écran de confirmation de l'écriture en jeu
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";
import StatsArmure from "./StatsArmure";   // ⚠️ AJOUT (27/10/2026)
import FenetreDetailsPiece from "./FenetreDetailsPiece";   // ⚠️ AJOUT (30/10/2026) : la fenêtre de détails UNIQUE (Build Analyzer et Forge)
import BoutonAction from "./BoutonAction";   // ⚠️ AJOUT (31/10/2026) : visuel de la charte « Actualisation de l'inventaire » (remplace le texte « Recharger ») 
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

  // FR : ⚠️ AJOUT (03/11/2026, chantier mods-phase-2, variante A) - LES ÉCARTS APPLICABLES par armure simulée : ce qui diffère RÉELLEMENT entre l'état en jeu et la simulation (une prise modifiable dont le choix simulé ≠ plug équipé). Le bouton « Appliquer en jeu » n'apparaît que si cette liste est NON VIDE (critère d'acceptation 1 de la spécification). Calcul mémoïsé : seules les pièces SIMULÉES sont analysées, et seulement à l'ouverture (colonnes lues dans le Manifest une fois par rendu utile). / EN: applicable differences per simulated armor; the "Apply in game" button appears only when this list is non-empty.
  const ecartsParPiece = useMemo(() => {
    const m = new Map<string, EcartSocket[]>();
    if (!db) return m;
    for (const p of pieces ?? []) {
      if (!p.itemInstanceId || nbSim(p) === 0) continue;
      try {
        const colonnes: ColonneApplicable[] = colonnesArmure(db, p).map((c) => ({ socketIndex: c.socketIndex, hashEquipe: c.equipe.hash, modifiable: c.modifiable }));
        const ecarts = ecartsApplicables(colonnes, simulations.armures?.[p.itemInstanceId]);
        if (ecarts.length > 0) m.set(p.itemInstanceId, ecarts);
      } catch { /* Manifest illisible pour cette pièce : pas d'écarts proposés */ }
    }
    return m;
  }, [pieces, simulations, db]);

  // FR : ⚠️ AJOUT (03/11/2026, mods-phase-2) - l'état de l'écran « Appliquer en jeu » : la pièce visée, ses écarts, l'état de chaque prise (en attente / en cours / ✓ réussie / ✗ refusée), le message de fin et le libellé de chaque plug (pour la confirmation). / EN: the "Apply in game" screen state.
  const [appli, setAppli] = useState<{ piece: GearPiece; ecarts: EcartSocket[]; etats: Array<"enAttente" | "enCours" | "reussi" | "echoue">; libelles: Record<number, { actuel: string; vise: string }>; message: string | null; echec: boolean; termine: boolean } | null>(null);

  /** FR : ⚠️ AJOUT (03/11/2026, mods-phase-2) - ouvre l'écran de confirmation de la pièce : chaque écart avec le NOM du plug actuel et du plug visé (lus dans le Manifest via les colonnes). / EN: opens the confirmation screen with plug names. */
  function ouvrirAppli(p: GearPiece) {
    if (!db || !p.itemInstanceId) return;
    const ecarts = ecartsParPiece.get(p.itemInstanceId) ?? [];
    const libelles: Record<number, { actuel: string; vise: string }> = {};
    try {
      for (const c of colonnesArmure(db, p)) {
        for (const e of ecarts) {
          if (e.socketIndex !== c.socketIndex) continue;
          libelles[e.socketIndex] = { actuel: c.equipe.nom, vise: c.options.find((o) => o.hash === e.plugVise)?.nom ?? `plug ${e.plugVise}` };
        }
      }
    } catch { /* libellés best-effort : les écarts restent affichés par index */ }
    setAppli({ piece: p, ecarts, etats: ecarts.map(() => "enAttente"), libelles, message: null, echec: false, termine: false });
  }

  /** FR : ⚠️ AJOUT (03/11/2026, mods-phase-2) - écrit RÉELLEMENT les écarts chez Bungie, UN plug par appel, dans l'ordre affiché, ARRÊT au premier échec (le message exact de Bungie est affiché, rien n'est annulé). L'objet du Coffre est tenté tel quel (décision du 03/11/2026) : si Bungie refuse, son message exact est affiché. Après un succès complet : re-lecture de l'inventaire puis effacement de la simulation (réel et simulation convergent). / EN: writes the differences for real, one plug per call, stop on first failure; after full success, re-read and clear the simulation. */
  async function ecrireEnJeu(depuis: number) {
    if (!membership || !appli || !appli.piece.itemInstanceId) return;
    const instance = appli.piece.itemInstanceId;
    const ecarts = appli.ecarts;
    const etats = [...appli.etats];
    setAppli({ ...appli, etats, message: null, echec: false, termine: false });
    // FR : le personnage porteur est lu UNE fois (le profil donne aussi la liste des personnages pour un objet du Coffre, qui n'a pas de porteur). / EN: the bearer character is read once; vault items get the first character (direct attempt, decision 03/11/2026).
    let characterId: string | undefined;
    try {
      const lecture = await lireProfilEquipement(membership);
      if (!lecture.ok) {
        setAppli({ ...appli, etats, message: `position de l'objet illisible (${lecture.raison}) : rechargez votre inventaire, puis réessayez.`, echec: true, termine: true });
        return;
      }
      const pos = localiserDansProfil(lecture.profil, instance);
      if (pos.etat !== "localisee") {
        setAppli({ ...appli, etats, message: "objet introuvable dans votre profil (déplacé ou dématérialisé en jeu ?) : rechargez votre inventaire, puis réessayez.", echec: true, termine: true });
        return;
      }
      characterId = pos.characterId ?? Object.keys(lecture.profil.classes ?? {})[0];
    } catch (e) {
      setAppli({ ...appli, etats, message: `position de l'objet illisible (${(e as Error).message}) : rechargez votre inventaire, puis réessayez.`, echec: true, termine: true });
      return;
    }
    if (!characterId) {
      setAppli({ ...appli, etats, message: "aucun personnage trouvé sur votre compte : reconnectez-vous, puis réessayez.", echec: true, termine: true });
      return;
    }
    for (let i = depuis; i < ecarts.length; i++) {
      etats[i] = "enCours";
      setAppli({ ...appli, piece: appli.piece, ecarts, etats: [...etats], libelles: appli.libelles, message: null, echec: false, termine: false });
      const r = await insererPlug(membership, characterId, instance, ecarts[i].socketIndex, ecarts[i].plugVise);
      if (r.reussi) {
        etats[i] = "reussi";
        setAppli({ piece: appli.piece, ecarts, etats: [...etats], libelles: appli.libelles, message: null, echec: false, termine: false });
        continue;
      }
      // FR : ARRÊT au premier échec : les prises suivantes restent « en attente », le message EXACT de Bungie est affiché avec un conseil, rien n'est annulé. / EN: stop on first failure; remaining sockets stay pending, Bungie's exact message is shown.
      etats[i] = "echoue";
      const conseil = r.statutHttp === 401 || r.statutHttp === 403 ? " (problème d'autorisation : reconnectez-vous)" : r.errorCode ? " (refus logique du jeu : ce plug n'est peut-être pas autorisé sur cette prise, ou le jeu l'interdit)" : " (réseau ou serveur Bungie : réessayez)";
      setAppli({ piece: appli.piece, ecarts, etats: [...etats], libelles: appli.libelles, message: `Prise ${ecarts[i].socketIndex} refusée par Bungie — HTTP ${r.statutHttp}${r.errorCode !== undefined ? `, ErrorCode ${r.errorCode}` : ""}${r.errorStatus ? ` (${r.errorStatus})` : ""} : ${r.message}${conseil}. Les prises restantes n'ont PAS été écrites.`, echec: true, termine: true });
      return;
    }
    // FR : SUCCÈS COMPLET : re-lecture de l'inventaire (l'état réel remplace la simulation), puis effacement de la simulation de la pièce : Détails, Mon Build et le score repartent du réel. / EN: full success: re-read the inventory, then clear the piece's simulation.
    await charger();
    appliquer((s) => reinitialiserArme(s, instance, "armures"));
    setAppli({ piece: appli.piece, ecarts, etats, libelles: appli.libelles, message: `✅ Appliqué en jeu : ${ecarts.length} prise${ecarts.length > 1 ? "s" : ""} écrite${ecarts.length > 1 ? "s" : ""} sur « ${appli.piece.nom ?? "armure"} ». Inventaire rechargé : le réel a remplacé la simulation.`, echec: false, termine: true });
  }

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
        {pieces
          ? <BoutonAction id="boutons-action.actualisation" libelle="Actualisation de l'inventaire : recharger mon inventaire" onClick={charger} disabled={enCours} hauteur="2.5rem" donnees={{ "actualiser-inventaire": true }} />
          : <button onClick={charger} disabled={enCours}>{enCours ? "Chargement…" : "Charger mon inventaire"}</button>}
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
              <li key={p.itemInstanceId ?? `${p.itemHash}-${p.origine}`} style={{ display: "flex", gap: "0.35rem", alignItems: "stretch" }}>
                <button onClick={() => setOuverte(p)} data-armure-possedee={p.itemInstanceId ?? ""} data-lieu={p.origine ?? ""} data-simulee={nbSim(p) > 0 ? "1" : ""}
                  style={{ flex: 1, minWidth: 0, textAlign: "left", display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "0.4rem", background: "#12151c", color: "#e8e6df", border: `1px solid ${couleurRarete(p)}`, borderRadius: 8, cursor: "pointer" }}>
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
                {/* FR : ⚠️ AJOUT (03/11/2026, chantier mods-phase-2, variante A) - bouton « Appliquer en jeu » : UNIQUEMENT si la simulation de la pièce diffère de l'état réel (écarts applicables NON VIDES). Il ouvre l'écran de confirmation — rien n'est écrit avant confirmation. / EN: "Apply in game" button, only when the simulation differs from the real state. */}
                {p.itemInstanceId && (ecartsParPiece.get(p.itemInstanceId)?.length ?? 0) > 0 && (
                  <button onClick={() => ouvrirAppli(p)} data-appliquer-en-jeu={p.itemInstanceId} style={{ padding: "0.4rem 0.6rem", background: "#2a2412", color: "#f4e3a0", border: "1px solid #e8c547", borderRadius: 8, cursor: "pointer", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    ⚡ Appliquer en jeu ({ecartsParPiece.get(p.itemInstanceId)!.length})
                  </button>
                )}
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
      {/* FR : ⚠️ AJOUT (03/11/2026, chantier mods-phase-2, variante A) - ÉCRAN DE CONFIRMATION « Appliquer en jeu » : liste EXACTE de ce qui va être écrit (objet, lieu, chaque prise : plug actuel → plug visé), avertissement compte Destiny 2, puis progression prise par prise (✓ réussie, ✗ refusée, – restante). Arrêt au premier échec, message Bungie exact, relance possible sur les prises RESTANTES uniquement (jamais de ré-application aveugle). / EN: the "Apply in game" confirmation screen: exact list, warning, per-socket progress, stop on first failure. */}
      {appli && (
        <Modale titre="Appliquer en jeu" onFermer={() => setAppli(null)} largeur={560}>
          <p style={{ margin: "0 0 0.4rem", fontSize: "0.85rem" }}><strong>{appli.piece.nom ?? `Armure ${appli.piece.itemHash}`}</strong> — {LIEUX[appli.piece.origine ?? ""] ?? "lieu inconnu"}{appli.piece.equipe ? " · équipée" : ""}</p>
          <p style={{ margin: "0 0 0.6rem", fontSize: "0.78rem", color: "#e0a080" }}>⚠️ Ces changements s'appliquent à ton compte Destiny 2, pas seulement à l'appli. Chaque prise est écrite l'une après l'autre ; l'écriture s'arrête au premier refus du jeu.</p>
          <ul data-ecarts-en-jeu="" style={{ listStyle: "none", padding: 0, margin: "0 0 0.6rem", display: "grid", gap: "0.3rem" }}>
            {appli.ecarts.map((e, i) => (
              <li key={e.socketIndex} data-etat-prise={appli.etats[i]} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.25rem 0.4rem", background: "#0d0f14", border: "1px solid #3a3f4b", borderRadius: 6 }}>
                <span style={{ width: "1.2rem", textAlign: "center" }}>{appli.etats[i] === "reussi" ? "✅" : appli.etats[i] === "echoue" ? "❌" : appli.etats[i] === "enCours" ? "⏳" : "–"}</span>
                <span>Prise {e.socketIndex} : <strong>{appli.libelles[e.socketIndex]?.actuel ?? `plug ${e.plugActuel}`}</strong> → <strong style={{ color: "#f4e3a0" }}>{appli.libelles[e.socketIndex]?.vise ?? `plug ${e.plugVise}`}</strong></span>
              </li>
            ))}
          </ul>
          {appli.message && <p role="alert" data-message-en-jeu="" style={{ fontSize: "0.78rem", color: appli.echec ? "#e0a080" : "#a0d080", margin: "0 0 0.6rem", whiteSpace: "pre-wrap" }}>{appli.message}</p>}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {!appli.termine && <button onClick={() => ecrireEnJeu(0)} data-confirmer-en-jeu="" style={{ padding: "0.4rem 0.8rem", background: "#2a2412", color: "#f4e3a0", border: "1px solid #e8c547", borderRadius: 8, cursor: "pointer" }}>Écrire ces {appli.ecarts.length} prise{appli.ecarts.length > 1 ? "s" : ""} en jeu</button>}
            {appli.termine && appli.etats.some((e) => e === "enAttente") && <button onClick={() => ecrireEnJeu(appli.etats.findIndex((e) => e === "enAttente"))} data-relancer-en-jeu="" style={{ padding: "0.4rem 0.8rem", background: "#2a2412", color: "#f4e3a0", border: "1px solid #e8c547", borderRadius: 8, cursor: "pointer" }}>Relancer les prises restantes ({appli.etats.filter((e) => e === "enAttente").length})</button>}
            <button onClick={() => setAppli(null)} style={{ padding: "0.4rem 0.8rem", background: "#12151c", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 8, cursor: "pointer" }}>{appli.termine ? "Fermer" : "Annuler"}</button>
          </div>
        </Modale>
      )}
    </div>
  );
}

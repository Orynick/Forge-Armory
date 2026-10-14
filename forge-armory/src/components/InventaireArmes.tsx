// FR : ⚠️ AJOUT (13/10/2026, v0.4.6) - vue « INVENTAIRE » de la Forge (spécification du 12/10/2026, §4) : tes ARMES POSSÉDÉES (personnages et Coffre, lues par la même fonction que « Mon Inventaire »), avec pour chacune son ROLL RÉEL (marqué ✓) et la possibilité de SIMULER un autre roll : une perk par colonne et un mod, parmi les options possibles de CETTE colonne (jamais deux perks dans une colonne).
// PHASE 1 de la spécification : AUCUNE écriture vers Bungie, jamais. La simulation est enregistrée localement (`lib/forge/simulation.ts`, par exemplaire et par index de prise) et rechargée au démarrage ; elle n'est pas encore branchée au scoring (étape suivante). Le chargement de l'inventaire est déclenché par un bouton, comme dans « Mon Inventaire » (il interroge Bungie).
// Les colonnes sont celles de la popup « Détails » (même fonction, même ordre, mod en bas), dessinées par le composant partagé `ColonnesPerks`. Version d'un perk simulé : sa version AMÉLIORÉE si l'arme en a déjà une dans son roll réel (voir `armeEstAmelioree`). EN: ⚠️ ADDED - Forge "Inventory" view: owned weapons with their real roll and a local what-if simulation; nothing is ever written to Bungie.
import VignetteArme from "./VignetteArme";   // ⚠️ AJOUT (14/10/2026, v0.4.10)
import { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import type { GearPiece } from "../types/build";
import { listerObjetsPossedes } from "../lib/bungie/inventaire";
import { SessionExpiree } from "../lib/bungie/oauth";
import { obtenirOptionsToutesColonnes } from "../lib/manifest/doctrine";
import type { OptionSocket } from "../lib/manifest/doctrine";
import { ordonnerColonnesPourAffichage } from "../lib/manifest/colonnesArme";
import { apparierPerksAmeliores, typeEstAmeliore, OptionJumelee } from "../lib/manifest/perksAmeliores";
import { normaliser } from "../lib/manifest/search";
import { choisir, retirerColonne, reinitialiserArme, nbColonnesSimulees, armesSimulees, estLeRollReel, armeEstAmelioree, choixEffectif, SIMULATIONS_VIDES, Simulations } from "../lib/forge/simulation";
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";   // ⚠️ v0.4.9 : magasin PARTAGÉ avec la page principale (le score réagit)
import { estFaconnee } from "../lib/forge/faconnee";   // ⚠️ AJOUT (14/10/2026, v0.4.10) : armes façonnées (« forgées »)
import { obtenirDiagnosticPlugsExemplaire } from "../lib/forge/diagnosticPlugs";   // ⚠️ AJOUT (13/10/2026, v0.4.7) : diagnostic (npm run dev)
import ColonnesPerks, { ColonneAffichee } from "./ColonnesPerks";
import IconesArme from "./IconesArme";
import IconeFaconnee from "./IconeFaconnee";   // ⚠️ AJOUT (14/10/2026, v0.4.10) : l'icône du jeu pour les armes façonnées

const TAILLE_PAGE = 60;
const SLOTS_ARME = ["cinetique", "energie", "lourde"];
const LIBELLES_SLOT: Record<string, string> = { cinetique: "Cinétique", energie: "Énergétique", lourde: "Lourde" };
const LIEUX: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste", coffre: "Coffre" };
const styleChamp = { fontSize: "0.85rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.4rem" } as const;
const estArme = (p: GearPiece) => SLOTS_ARME.includes(p.slot as string);
const couleurRarete = (p: GearPiece) => (p.isExotic ? "#ceae33" : p.rarete === "Légendaire" ? "#7a4fa3" : "#4a4f5c");

/** FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - une arme à ouvrir DIRECTEMENT (bouton « Forge » des fenêtres Détails) ; `demande` change à chaque envoi, même pour la même arme. / EN: a weapon to open directly (the "Forge" button of the Details windows). */
export interface CibleForge { piece: GearPiece; origine: "analyseur" | "loadouts" | "forge" | "bibliotheque"; demande: number }

interface Props {
  db: Database | null;
  membership: DestinyMembership | null;
  cible?: CibleForge | null;
  /** FR : ⚠️ AJOUT (v0.4.9) - pose l'arme dans Mon Build (même fonction que « + Ajouter » de Mon Inventaire). / EN: puts the weapon in Mon Build. */
  onAjouterAuBuild?: (piece: GearPiece) => void;
  /** FR : identifiants d'exemplaire déjà dans Mon Build. / EN: instance ids already in Mon Build. */
  idsDansBuild?: ReadonlySet<string>;
  /** FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - retour à la vue d'origine, proposé DANS la fenêtre de l'arme (le bandeau de la page est masqué par le fond sombre de la fenêtre, qui s'ouvre seule à l'arrivée). `libelleRetour` : le nom de cette vue. / EN: back to the originating view, offered INSIDE the weapon window. */
  onRetour?: () => void;
  libelleRetour?: string;
}

export default function InventaireArmes({ db, membership, cible = null, onAjouterAuBuild, idsDansBuild, onRetour, libelleRetour = "la vue d'origine" }: Props) {
  const [pieces, setPieces] = useState<GearPiece[] | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [lieu, setLieu] = useState("tous");
  const [seulementSimulees, setSeulementSimulees] = useState(false);
  const [seulementFaconnees, setSeulementFaconnees] = useState(false);   // ⚠️ AJOUT (14/10/2026, v0.4.10)
  const [affichees, setAffichees] = useState(TAILLE_PAGE);
  const [ouverte, setOuverte] = useState<GearPiece | null>(null);
  const [voirInutiles, setVoirInutiles] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);   // ⚠️ v0.4.7 : texte du diagnostic des perks disponibles (npm run dev seulement)
  // FR : ⚠️ CHANGÉ (14/10/2026, v0.4.9) - les simulations viennent du MAGASIN PARTAGÉ (`storeSimulations.ts`) : la page principale les applique au score et à Mon Build, donc un changement ici les fait réagir aussitôt. `appliquer` reçoit une transformation (jamais une copie périmée). / EN: simulations come from the shared store.
  const simulations = useSimulations();
  const appliquer = (transformation: (s: Simulations) => Simulations) => mettreAJourSimulations(transformation);
  const [messageBuild, setMessageBuild] = useState<string | null>(null);
  // FR : ⚠️ AJOUT (v0.4.9) - une arme envoyée par un bouton « Forge » s'ouvre directement (même si l'inventaire de la Forge n'est pas chargé). / EN: an arriving target opens directly.
  useEffect(() => { if (cible) { setOuverte(cible.piece); setMessageBuild(null); } }, [cible?.demande]);   // eslint-disable-line react-hooks/exhaustive-deps

  async function charger() {
    if (!membership || !db) return;
    setEnCours(true); setErreur(null);
    try {
      const r = await listerObjetsPossedes(membership, db);
      setPieces(r.pieces.filter(estArme)); setAffichees(TAILLE_PAGE);
    } catch (e) {
      setErreur(e instanceof SessionExpiree ? "Votre session Bungie a expiré : reconnectez-vous, puis réessayez." : (e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  const nbSim = (p: GearPiece) => (p.itemInstanceId ? nbColonnesSimulees(simulations, p.itemInstanceId) : 0);
  // FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - les armes FAÇONNÉES (« forgées ») : calculées une fois par chargement de l'inventaire (le repli par le nom interroge le Manifest), pas à chaque affichage. / EN: crafted weapons, computed once per inventory load.
  const faconnees = useMemo(() => new Set((pieces ?? []).filter((p) => p.itemInstanceId && estFaconnee(db, p.perkHashes)).map((p) => p.itemInstanceId as string)), [pieces, db]);
  const ouverteFaconnee = !!ouverte && estFaconnee(db, ouverte.perkHashes);
  const liste = useMemo(() => {
    if (!pieces) return [];
    const q = normaliser(recherche);
    return pieces
      .filter((p) => (lieu === "tous" || p.origine === lieu) && (!q || normaliser(`${p.nom ?? ""} ${p.typeArme ?? ""}`).includes(q)) && (!seulementSimulees || (!!p.itemInstanceId && !!simulations.armes[p.itemInstanceId])) && (!seulementFaconnees || (!!p.itemInstanceId && faconnees.has(p.itemInstanceId))))
      .sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? "", "fr"));
  }, [pieces, recherche, lieu, seulementSimulees, seulementFaconnees, faconnees, simulations]);

  // FR : les colonnes de l'arme ouverte : mêmes fonctions que la popup « Détails » et que la Collection ; le roll réel (`perkHashes`) marque les options équipées. / EN: columns of the opened weapon, same functions as Details and Collection.
  const colonnesAffichees = useMemo((): ColonneAffichee[] => {
    if (!db || !ouverte) return [];
    const colonnes = ordonnerColonnesPourAffichage(obtenirOptionsToutesColonnes(db, ouverte.itemHash, ouverte.perkHashes, { inclureMasquees: voirInutiles }));
    return colonnes.map((col) => ({ col, items: col.masquee ? col.options.map((option): OptionJumelee<OptionSocket> => ({ option })) : apparierPerksAmeliores(col.options, (o) => typeEstAmeliore(db, o.hash)) }));
  }, [db, ouverte, voirInutiles]);
  const armeAmelioree = armeEstAmelioree(colonnesAffichees.filter((c) => !c.col.masquee).map((c) => c.items));
  const instance = ouverte?.itemInstanceId;
  const simulesOuverte = instance ? simulations.armes[instance] : undefined;

  function choisirPerk(socketIndex: number, item: OptionJumelee<OptionSocket>) {
    if (!instance) return;
    // FR : cliquer le roll réel, ou de nouveau le perk déjà simulé, REVIENT au roll réel de cette colonne.
    if (estLeRollReel(item) || simulesOuverte?.[socketIndex]?.choisi === item.option.hash) appliquer((s) => retirerColonne(s, instance, socketIndex));
    else appliquer((s) => choisir(s, instance, socketIndex, { choisi: item.option.hash, effectif: choixEffectif(item, armeAmelioree) }));
  }

  if (!membership) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Vous n'êtes pas connecté à Bungie : connectez-vous (bloc « Connexion à Bungie ») pour voir vos armes.</p>;
  if (!db) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest ».</p>;
  const nbArmesSimulees = armesSimulees(simulations).length;

  return (
    <div>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", maxWidth: "70ch" }}>
        Vos armes (personnages et Coffre). Ouvrez une arme pour <strong>simuler</strong> un autre roll : une perk par colonne et un mod. <strong>Rien n'est modifié dans le jeu</strong> : la simulation reste dans l'appli, sur cet ordinateur.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.6rem" }}>
        <button onClick={charger} disabled={enCours}>{enCours ? "Chargement…" : pieces ? "↻ Recharger mon inventaire" : "Charger mon inventaire"}</button>
        {nbArmesSimulees > 0 && <button onClick={() => appliquer(() => SIMULATIONS_VIDES())} data-effacer-simulations="" style={{ fontSize: "0.8rem" }}>✕ Effacer toutes les simulations ({nbArmesSimulees})</button>}
      </div>
      {erreur && <p role="alert" style={{ fontSize: "0.8rem", color: "#e0a080", margin: "0 0 0.5rem" }}>⚠️ {erreur}</p>}
      {pieces && (
        <>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <input aria-label="Rechercher une arme possédée" placeholder="Rechercher par nom ou type…" value={recherche} onChange={(e) => { setRecherche(e.target.value); setAffichees(TAILLE_PAGE); }} style={{ ...styleChamp, minWidth: "16rem", flex: "1 1 16rem" }} />
            <select aria-label="Où se trouve l'arme" value={lieu} onChange={(e) => { setLieu(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="tous">Partout</option>
              {Object.entries(LIEUX).map(([cle, nom]) => <option key={cle} value={cle}>{nom}</option>)}
            </select>
            <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
              <input type="checkbox" checked={seulementSimulees} onChange={(e) => { setSeulementSimulees(e.target.checked); setAffichees(TAILLE_PAGE); }} /> Seulement les armes simulées
            </label>
            <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
              <input type="checkbox" checked={seulementFaconnees} onChange={(e) => { setSeulementFaconnees(e.target.checked); setAffichees(TAILLE_PAGE); }} /> Seulement les armes façonnées
            </label>
          </div>
          <p data-nb-armes-possedees={liste.length} style={{ fontSize: "0.8rem", color: "#9a968a", margin: "0 0 0.5rem" }}>{liste.length} arme{liste.length > 1 ? "s" : ""}{liste.length === 0 ? " : aucune ne correspond." : ""}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.5rem" }}>
            {liste.slice(0, affichees).map((p) => (
              <li key={p.itemInstanceId ?? `${p.itemHash}-${p.origine}`}>
                <button onClick={() => setOuverte(p)} data-arme-possedee={p.itemInstanceId ?? ""} data-lieu={p.origine ?? ""} data-simulee={nbSim(p) > 0 ? "1" : ""} data-faconnee={p.itemInstanceId && faconnees.has(p.itemInstanceId) ? "1" : ""}
                  style={{ width: "100%", textAlign: "left", display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "0.4rem", background: "#12151c", color: "#e8e6df", border: `1px solid ${couleurRarete(p)}`, borderRadius: 8, cursor: "pointer" }}>
                  {/* FR : ⚠️ CHANGÉ (14/10/2026, v0.4.10) - ARME FAÇONNÉE : l'icône du jeu (teinte saumon corail) est posée EN BAS À GAUCHE de la vignette de l'arme, comme dans le jeu (demande de l'utilisateur, avec capture). Elle remplace le texte « 🔧 Façonnée » ; nom accessible et infobulle sur l'enveloppe. / EN: ⚠️ CHANGED - the game's icon at the bottom-left of the weapon tile. */}
                  <VignetteArme icone={p.icone} taille={44} reserverPlace faconnee={!!p.itemInstanceId && faconnees.has(p.itemInstanceId)} />
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: "0.85rem", display: "block" }}>{p.nom ?? `Arme ${p.itemHash}`}</strong>   {/* bloc : les icônes passent sous le nom, comme sur les cartes de la Collection */}
                    <IconesArme db={db} itemHash={p.itemHash} type={p.typeArme} slot={p.slot as string} texteAccessible={[p.typeArme, LIBELLES_SLOT[p.slot as string], p.elementArme].filter(Boolean).join(", ")} />
                    <span data-lieu-texte="" style={{ display: "block", fontSize: "0.72rem", color: "#9a968a" }}>{LIEUX[p.origine ?? ""] ?? "Lieu inconnu"}{p.equipe ? " · équipée" : ""}</span>
                    {nbSim(p) > 0 && <span data-badge-simulation="" style={{ fontSize: "0.7rem", color: "#e8c547" }}>Simulation ({nbSim(p)} colonne{nbSim(p) > 1 ? "s" : ""})</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {liste.length > affichees && <button onClick={() => setAffichees((n) => n + TAILLE_PAGE)} style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>Afficher plus ({liste.length - affichees} restantes)</button>}
        </>
      )}
      {ouverte && (
        <div onClick={() => setOuverte(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div role="dialog" aria-modal="true" aria-label={`Simulation des perks de ${ouverte.nom}`} onClick={(e) => e.stopPropagation()} style={{ background: "#12151c", border: `1px solid ${couleurRarete(ouverte)}`, borderRadius: 10, padding: "1rem", width: "min(44rem, 94vw)", maxHeight: "86vh", overflow: "auto", color: "#e8e6df" }}>
            {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.10), défaut signalé par l'utilisateur (« je ne vois pas le bouton retourner au Build Analyzer ») : le RETOUR est proposé ICI, en haut de la fenêtre qui s'ouvre seule à l'arrivée depuis un bouton « Forge » ; le bandeau de la page reste derrière son fond sombre. Il ferme la fenêtre et revient à la vue d'origine. / EN: ⚠️ ADDED - the back button INSIDE the window. */}
            {cible && onRetour && (
              <div style={{ margin: "0 0 0.6rem" }}>
                <button data-retour-fenetre="" onClick={() => { setOuverte(null); setDiagnostic(null); setMessageBuild(null); onRetour(); }} style={{ fontSize: "0.8rem" }}>← Retour à {libelleRetour}</button>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <strong style={{ fontSize: "1rem" }}>{ouverte.nom}</strong>
              <button onClick={() => { setOuverte(null); setDiagnostic(null); setMessageBuild(null); }} aria-label="Fermer">✕</button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0.2rem 0 0.4rem" }}>{[ouverte.typeArme, ouverte.rarete, LIEUX[ouverte.origine ?? ""], ouverte.equipe ? "équipée" : "", ouverteFaconnee ? "façonnée" : ""].filter(Boolean).join(" · ")} — simulation locale : rien n'est modifié dans le jeu</p>
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0 0 0.4rem" }}>Cliquez une perk pour la simuler (une seule par colonne) ; cliquez le roll réel, ou de nouveau la perk simulée, pour revenir au roll réel de la colonne.</p>
            {/* FR : ⚠️ AJOUT (13/10/2026, v0.4.7), demande de l'utilisateur : la LÉGENDE des quatre niveaux de perks. Si la disponibilité sur l'exemplaire n'a pas été lue (inventaire chargé avant la mise à jour, ou donnée absente), on le dit au lieu de griser à tort. / EN: legend of the four perk levels. */}
            {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - ARME FAÇONNÉE (« forgée ») : ses perks sont fixes en jeu, on ne les change qu'à la forge en jeu. La donnée réelle ne liste, par colonne de perks, que le perk équipé : les perks grisés sont ceux que l'on pourrait choisir à la forge, si déverrouillés (lecture des déverrouillages ÉCARTÉE : décision de l'utilisateur du 14/10/2026, « on garde les perks possibles sur l'arme et les perks actifs dans Détails » ; la note affichée n'en parle plus). / EN: ⚠️ ADDED - crafted-weapon note. */}
            {ouverteFaconnee && (
              <p data-note-faconnee="" style={{ fontSize: "0.75rem", color: "#9ad0d8", margin: "0 0 0.6rem", border: "1px solid #2a4a50", borderRadius: 6, padding: "0.35rem 0.5rem" }}>
                <span style={{ display: "inline-block", verticalAlign: "middle", marginRight: "0.35rem" }}><IconeFaconnee taille={14} /></span><strong>Arme façonnée.</strong> En jeu, ses perks sont fixes : on ne les change qu'à la <strong>forge en jeu</strong> (table de façonnage), pas librement. L'appli montre ici les perks possibles de ce modèle d'arme (les perks <strong>grisés</strong> sont ceux qui ne sont pas équipés) et marque d'une coche ✓ ceux qui le sont. La simulation fonctionne comme pour les autres armes.
              </p>
            )}
            <div data-legende-niveaux="" style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem 0.9rem", alignItems: "center", fontSize: "0.72rem", color: "#9a968a", margin: "0 0 0.6rem" }}>
              <span><span style={{ color: "#7aa2f7" }}>✓</span> roll réel (équipé en jeu)</span>
              {ouverte.plugsDisponiblesParColonne !== undefined ? (
                <>
                  <span><span style={{ display: "inline-block", width: "1.6rem", height: "0.8rem", verticalAlign: "middle", border: "1px solid #b9bcc6", borderRadius: 999 }} /> disponible sur votre exemplaire, non sélectionné</span>
                  <span style={{ color: "#6b6860" }}>nom grisé : possible sur ce modèle, pas sur votre exemplaire</span>
                </>
              ) : (
                <span style={{ color: "#e0c080" }}>disponibilité sur votre exemplaire : non lue (rechargez votre inventaire)</span>
              )}
              <span><span style={{ display: "inline-block", width: "1.6rem", height: "0.8rem", verticalAlign: "middle", border: "1px solid #e8c547", background: "#2a2412", borderRadius: 999 }} /> simulé</span>
            </div>            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.6rem" }}>
              <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
                <input type="checkbox" checked={voirInutiles} onChange={(e) => setVoirInutiles(e.target.checked)} /> Afficher les perks inutiles
              </label>
              <span data-nb-simulees={instance ? nbColonnesSimulees(simulations, instance) : 0} style={{ fontSize: "0.78rem", color: "#e8c547" }}>{instance && nbColonnesSimulees(simulations, instance) > 0 ? `${nbColonnesSimulees(simulations, instance)} colonne${nbColonnesSimulees(simulations, instance) > 1 ? "s" : ""} simulée${nbColonnesSimulees(simulations, instance) > 1 ? "s" : ""}` : "aucune simulation"}</span>
              <button disabled={!instance || nbColonnesSimulees(simulations, instance) === 0} onClick={() => instance && appliquer((s) => reinitialiserArme(s, instance))} style={{ fontSize: "0.78rem" }}>↺ Revenir au roll réel</button>
            </div>
            {/* FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - `npm run dev` seulement : décrit, prise par prise, le perk équipé et les perks DISPONIBLES lus chez Bungie pour cet exemplaire, pour contrôler cette donnée sur le compte de l'utilisateur (voir `diagnosticPlugs.ts`). / EN: dev-only diagnostic button. */}
            {import.meta.env.DEV && (
              <div style={{ marginBottom: "0.6rem" }}>
                <button onClick={() => setDiagnostic(obtenirDiagnosticPlugsExemplaire(db, ouverte))} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic des perks disponibles de cet exemplaire (à copier à Claude)</button>
                {diagnostic && <textarea readOnly value={diagnostic} onFocus={(e) => e.currentTarget.select()} rows={9} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#b7b3a8", border: "1px solid #3a3f4b" }} />}
              </div>
            )}
            {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - « ÉQUIPER VERS MON BUILD » (spécification du 12/10/2026, §4) : pose cette arme POSSÉDÉE dans Mon Build ; le score et l'affichage de Mon Build tiennent compte de sa simulation, en temps réel. Rien n'est équipé en jeu. / EN: ⚠️ ADDED - "Equip to Mon Build": puts this owned weapon in Mon Build; the score uses its simulation live. Nothing is equipped in the game. */}
            {onAjouterAuBuild && instance && (
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", margin: "0 0 0.6rem" }}>
                <button data-mettre-dans-build="" onClick={() => { onAjouterAuBuild(ouverte); setMessageBuild(`✅ « ${ouverte.nom} » est dans Mon Build : le score tient compte de votre simulation, en temps réel. Rien n'est équipé en jeu.`); }} disabled={!!idsDansBuild?.has(instance)} style={{ fontSize: "0.8rem" }}>
                  {idsDansBuild?.has(instance) ? "✓ Déjà dans Mon Build" : "➕ Mettre dans Mon Build"}
                </button>
                {messageBuild && <span data-message-build="" role="status" style={{ fontSize: "0.75rem", color: "#7fd88f" }}>{messageBuild}</span>}
              </div>
            )}
            {colonnesAffichees.length === 0 && <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucune option trouvée pour cette arme.</p>}
            <ColonnesPerks colonnes={colonnesAffichees} simules={simulesOuverte} disponibles={ouverte.plugsDisponiblesParColonne} onChoisir={choisirPerk} />
          </div>
        </div>
      )}
    </div>
  );
}

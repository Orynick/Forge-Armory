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
import { ELEMENTS_FILTRE, obtenirElementFiltre } from "../lib/manifest/doctrine";
import { LIBELLES_ELEMENT_FR } from "../data/libellesElements";   // ⚠️ AJOUT (19/10/2026) : filtre par élément, comme la Collection
import { normaliser } from "../lib/manifest/search";
import { nbColonnesSimulees, armesSimulees, SIMULATIONS_VIDES, Simulations } from "../lib/forge/simulation";
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";   // ⚠️ v0.4.9 : magasin PARTAGÉ avec la page principale (le score réagit)
import { estFaconnee } from "../lib/forge/faconnee";   // ⚠️ AJOUT (14/10/2026, v0.4.10) : armes façonnées (« forgées »)
import IconesArme from "./IconesArme";
import BoutonAction from "./BoutonAction";   // ⚠️ AJOUT (30/10/2026) : boutons d'action visuels de la charte
import FenetreDetailsPiece from "./FenetreDetailsPiece";   // ⚠️ AJOUT (30/10/2026) : la fenêtre de détails UNIQUE (Build Analyzer et Forge)
// FR : ⚠️ AJOUT (23/10/2026, audit) - styles partagés des fenêtres liste (dedup). / EN: ⚠️ ADDED - shared list-window styles (dedup).
import { couleurRarete, styleChamp } from "../lib/forge/stylesListes";

const TAILLE_PAGE = 60;
const SLOTS_ARME = ["cinetique", "energie", "lourde"];
const LIBELLES_SLOT: Record<string, string> = { cinetique: "Cinétique", energie: "Énergétique", lourde: "Lourde" };
// FR : ⚠️ AJOUT (24/10/2026, tests post-audit, point 5.8) - « Courrier » dans
// les libellés de lieu : un objet en attente au postmaster est listé (origine
// « courrier »), même s'il ne peut pas être simulé ici.
// EN: ADDED - "Courrier" in the location labels: a postmaster item is listed
// (origin "courrier"), even though it cannot be simulated here.
const LIEUX: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste", coffre: "Coffre", courrier: "Courrier" };

const estArme = (p: GearPiece) => SLOTS_ARME.includes(p.slot as string);


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
  /** FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - clic du bouton « Lire le Lore » (fiche Détails → Legendarium). / EN: ⚠️ ADDED - "Read the Lore" click (Details sheet → Legendarium). */
  onLireLore?: (itemHash: number, nomObjet: string) => void;
}

export default function InventaireArmes({ db, membership, cible = null, onAjouterAuBuild, idsDansBuild, onRetour, libelleRetour = "la vue d'origine", onLireLore }: Props) {
  const [pieces, setPieces] = useState<GearPiece[] | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [lieu, setLieu] = useState("tous");
  // FR : ⚠️ AJOUT (19/10/2026, demande : « dans la Collection il y a un certain nombre de filtres ; mets les mêmes filtres pour l'Inventaire ») - type, emplacement, rareté et élément des armes POSSÉDÉES (l'archétype et la source/obtention de la Collection n'ont pas de sens ici : l'utilisateur possède déjà l'objet). / EN: same filters as the Collection where they make sense for owned weapons.
  const [typeArme, setTypeArme] = useState("tous");
  const [slotArme, setSlotArme] = useState("tous");
  const [rareteArme, setRareteArme] = useState("toutes");
  const [elementArme, setElementArme] = useState("tous");
  const [seulementSimulees, setSeulementSimulees] = useState(false);
  const [seulementFaconnees, setSeulementFaconnees] = useState(false);   // ⚠️ AJOUT (14/10/2026, v0.4.10)
  const [affichees, setAffichees] = useState(TAILLE_PAGE);
  const [ouverte, setOuverte] = useState<GearPiece | null>(null);
  // FR : les simulations viennent du MAGASIN PARTAGÉ (`storeSimulations.ts`) : la page principale les applique au score.
  const simulations = useSimulations();
  const appliquer = (transformation: (s: Simulations) => Simulations) => mettreAJourSimulations(transformation);
  const [, setMessageBuild] = useState<string | null>(null);
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
  const liste = useMemo(() => {
    if (!pieces) return [];
    const q = normaliser(recherche);
      // FR : ⚠️ AJOUT (19/10/2026) - mêmes filtres que la Collection (type, emplacement, rareté, élément) sur les armes possédées ; l'élément est lu dans le Manifest (caché quand il est illisible, comme sur les cartes). / EN: the Collection's filters, applied to owned weapons; element read from the Manifest.
    const elementDe = (p: GearPiece) => { try { return db ? obtenirElementFiltre(db, p.itemHash) : undefined; } catch { return undefined; } };   // FR : Manifest absent ou table illisible : l'arme passe le filtre « Tous les éléments » sans erreur
    return pieces
      .filter((p) => (lieu === "tous" || p.origine === lieu) && (typeArme === "tous" || p.typeArme === typeArme) && (slotArme === "tous" || p.slot === slotArme) && (rareteArme === "toutes" || p.rarete === rareteArme) && (elementArme === "tous" || elementDe(p) === elementArme) && (!q || normaliser(`${p.nom ?? ""} ${p.typeArme ?? ""}`).includes(q)) && (!seulementSimulees || (!!p.itemInstanceId && !!simulations.armes[p.itemInstanceId])) && (!seulementFaconnees || (!!p.itemInstanceId && faconnees.has(p.itemInstanceId))))
      .sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? "", "fr"));
  }, [pieces, recherche, lieu, typeArme, slotArme, rareteArme, elementArme, seulementSimulees, seulementFaconnees, faconnees, simulations, db]);



  if (!membership) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Vous n'êtes pas connecté à Bungie : connectez-vous (bloc « Connexion à Bungie ») pour voir vos armes.</p>;
  if (!db) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest ».</p>;
  const nbArmesSimulees = armesSimulees(simulations).length;

  return (
    <div>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", maxWidth: "70ch" }}>
        Vos armes (personnages et Coffre). Ouvrez une arme pour <strong>simuler</strong> un autre roll : une perk par colonne et un mod. <strong>Rien n'est modifié dans le jeu</strong> : la simulation reste dans l'appli, sur cet ordinateur.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.6rem" }}>
        {pieces && !enCours
          ? <BoutonAction id="boutons-action.actualisation" libelle="Actualisation de l'inventaire : recharger mon inventaire" onClick={charger} donnees={{ "actualiser-inventaire": true }} />   /* ⚠️ 30/10/2026 : visuel de la charte */
          : <button onClick={charger} disabled={enCours}>{enCours ? "Chargement…" : "Charger mon inventaire"}</button>}
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
            {/* FR : ⚠️ AJOUT (19/10/2026, demande de l'utilisateur : « mets les mêmes filtres que la Collection ») - type, emplacement, rareté et élément des armes POSSÉDÉES (les valeurs viennent des pièces chargées, pas du catalogue du jeu : seules les valeurs réellement présentes sont proposées). / EN: the Collection's filters on owned weapons; only values present in the loaded inventory are offered. */}
            <select aria-label="Type d'arme possédée" value={typeArme} onChange={(e) => { setTypeArme(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="tous">Tous types d'arme</option>
              {[...new Set((pieces ?? []).map((p) => p.typeArme).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "fr")).map((t) => <option key={t} value={t as string}>{t}</option>)}
            </select>
            <select aria-label="Emplacement de l'arme possédée" value={slotArme} onChange={(e) => { setSlotArme(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="tous">Tous emplacements</option>
              {Object.entries(LIBELLES_SLOT).map(([cle, nom]) => <option key={cle} value={cle}>{nom}</option>)}
            </select>
            <select aria-label="Rareté de l'arme possédée" value={rareteArme} onChange={(e) => { setRareteArme(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="toutes">Toutes raretés</option>
              {[...new Set((pieces ?? []).map((p) => p.rarete).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "fr")).map((r) => <option key={r} value={r as string}>{r}</option>)}
            </select>
            <select aria-label="Élément de l'arme possédée" value={elementArme} onChange={(e) => { setElementArme(e.target.value); setAffichees(TAILLE_PAGE); }} style={styleChamp}>
              <option value="tous">Tous les éléments</option>
              {ELEMENTS_FILTRE.map((el) => <option key={el} value={el}>{el === "cinetique" ? "Cinétique" : LIBELLES_ELEMENT_FR[el as keyof typeof LIBELLES_ELEMENT_FR]}</option>)}
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
                  <VignetteArme icone={p.icone} taille={44} reserverPlace faconnee={!!p.itemInstanceId && faconnees.has(p.itemInstanceId)} db={db} itemHash={p.itemHash} />
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
      {/* FR : ⚠️ CHANGÉ (30/10/2026) - la fenêtre est maintenant LA FENÊTRE UNIQUE `FenetreDetailsPiece` (même contenu, mêmes emplacements que dans Build Analyzer). / EN: ⚠️ CHANGED - the single shared details window. */}
      {ouverte && (
        <FenetreDetailsPiece db={db} piece={ouverte} onFermer={() => setOuverte(null)} onLireLore={onLireLore} onRetour={cible && onRetour ? onRetour : undefined} libelleRetour={libelleRetour} onAjouterAuBuild={onAjouterAuBuild} dejaDansBuild={!!(ouverte.itemInstanceId && idsDansBuild?.has(ouverte.itemInstanceId))} />
      )}
    </div>
  );
}

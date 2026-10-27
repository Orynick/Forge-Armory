// FR : ⚠️ AJOUT (15/10/2026, v0.4.12), demande de l'utilisateur : « Go les armures » - FORGE DES ARMURES, ÉTAPE 1 : tes armures possédées (personnages et Coffre) ; une fenêtre par armure avec ses EMPLACEMENTS (archétype, amélioration, mods, mods d'ajustement…), le plug équipé et les plugs DISPONIBLES sur l'exemplaire ; SIMULATION LOCALE des MODS, avec l'effet sur les six statistiques. Comme pour les armes (étape 0.4.6) : RIEN n'est modifié dans le jeu, et la simulation n'influence PAS encore le score ni Mon Build (étape suivante, quand les données réelles de l'utilisateur auront été vérifiées : voir le diagnostic en `npm run dev`).
// ⚠️ HYPOTHÈSE de conception (voir `lib/forge/armure.ts`) : on ne peut changer que les MODS ; l'archétype, l'amélioration, le bonus d'ensemble et le perk exotique sont fixes. Le magasin de simulations est celui des armes (clé = identifiant d'exemplaire + index de prise) ; `appliquerSimulations` ne parcourt que les armes du build, donc une simulation d'armure est inerte pour le score. EN: ⚠️ ADDED - armor Forge step 1: owned armor list, a window per piece with its sockets, local simulation of mods with the stat effect; not linked to the score yet.
import { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";
import BoutonLireLore from "./BoutonLireLore";   // ⚠️ AJOUT (21/10/2026, Legendarium étape 5) : bouton « Lire le Lore » (fiche → page de Lore)
import type { DestinyMembership } from "../lib/bungie/api";
import type { GearPiece } from "../types/build";
import { listerObjetsPossedes } from "../lib/bungie/inventaire";
import { SessionExpiree } from "../lib/bungie/oauth";
import { obtenirBonusSet } from "../lib/manifest/doctrine";
import { normaliser } from "../lib/manifest/search";
import { colonnesArmure, diagnosticArmure, statsSimulees, regrouperColonnesArmure } from "../lib/forge/armure";
import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";   // ⚠️ AJOUT (24/10/2026)
import { diagnosticEnergieMods, diagnosticModsEnDouble } from "../lib/forge/diagnosticEnergie";   // ⚠️ AJOUT (24/10/2026)
import type { ColonneArmure, PlugArmure, GroupeColonneArmure } from "../lib/forge/armure";
import { choisir, retirerColonne, reinitialiserArme, nbColonnesSimulees, armuresSimulees, Simulations } from "../lib/forge/simulation";
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";
import { appliquerChangements, estGereeParSimulation } from "../lib/forge/energieMods";   // ⚠️ AJOUT (26/10/2026)
import SimulationModsArmure from "./SimulationModsArmure";   // ⚠️ AJOUT (26/10/2026)
import StatsArmure from "./StatsArmure";   // ⚠️ AJOUT (27/10/2026)
import { LIBELLES_SLOT } from "../data/libellesUI";
// FR : ⚠️ AJOUT (23/10/2026, audit) - styles partagés des fenêtres liste (dedup). / EN: ⚠️ ADDED - shared list-window styles (dedup).
import { couleurRarete, styleChamp } from "../lib/forge/stylesListes";
import IconeSaison from "./IconeSaison";
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
}
// FR : ⚠️ AJOUT (16/10/2026, v0.4.12) - même style que les boutons d'action de la fenêtre des armes (même hauteur). / EN: same style as the weapons window's action buttons.
const styleAction = { fontSize: "0.8rem", height: "2rem", padding: "0 0.7rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", lineHeight: 1.2, boxSizing: "border-box" } as const;

export default function InventaireArmures({ db, membership, cible = null, onRetour, libelleRetour = "la vue d'origine", onLireLore }: Props) {
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
  const [voirCosmetiques, setVoirCosmetiques] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [diagnosticDoublons, setDiagnosticDoublons] = useState<string | null>(null);   // ⚠️ AJOUT (24/10/2026) : texte du diagnostic des mods en double
  const [diagnosticEnergie, setDiagnosticEnergie] = useState<string | null>(null);   // ⚠️ AJOUT (24/10/2026) : texte du diagnostic global des coûts d'énergie
  useEffect(() => { if (cible) { setOuverte(cible.piece); setDiagnostic(null); } }, [cible?.demande]);   // eslint-disable-line react-hooks/exhaustive-deps
  const simulations = useSimulations();
  const appliquer = (transformation: (s: Simulations) => Simulations) => mettreAJourSimulations(transformation);

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
  const colonnes = useMemo(() => (db && ouverte ? colonnesArmure(db, ouverte, voirCosmetiques) : []), [db, ouverte, voirCosmetiques]);
  const stats = useMemo(() => (db && ouverte ? statsSimulees(db, ouverte, choixOuverte) : null), [db, ouverte, choixOuverte]);

  function choisirPlug(col: ColonneArmure, plug: PlugArmure) {
    if (!instance || !col.modifiable) return;
    if (plug.hash === col.equipe.hash || choixOuverte?.[col.socketIndex]?.choisi === plug.hash) appliquer((s) => retirerColonne(s, instance, col.socketIndex, "armures"));
    else appliquer((s) => choisir(s, instance, col.socketIndex, { choisi: plug.hash, effectif: plug.hash }, "armures"));
  }
  // FR : ⚠️ AJOUT (19/10/2026) - un clic sur le plug d'un GROUPE de prises identiques simule la PREMIÈRE prise non simulée du groupe : chaque prise reste simulée séparément (le magasin de simulations est par prise), mais l'utilisateur ne voit la liste qu'une seule fois. / EN: a click on a grouped socket's plug simulates the first unsimulated socket of the group.
  function choisirPlugGroupe(groupe: GroupeColonneArmure, plug: PlugArmure) {
    const cible = groupe.colonnes.find((c) => choixOuverte?.[c.socketIndex]?.choisi !== plug.hash) ?? groupe.colonnes[0];
    choisirPlug(cible, plug);
  }
  /** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - efface les simulations des ARMURES chargées (bloc `armures`, pas celui des armes). / EN: clears the loaded armor pieces' simulations only (`armures` block). */
  const idsAvecSimulation = (pieces ?? []).filter((p) => p.itemInstanceId && nbSim(p) > 0).map((p) => p.itemInstanceId as string);
  const nbArmuresSim = armuresSimulees(simulations).length;

  if (!membership) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Vous n'êtes pas connecté à Bungie : connectez-vous (bloc « Connexion à Bungie ») pour voir vos armures.</p>;
  if (!db) return <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0c080" }}>⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest ».</p>;

  return (
    <div>
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
          <p data-nb-armures-possedees={liste.length} style={{ fontSize: "0.8rem", color: "#9a968a", margin: "0 0 0.5rem" }}>{liste.length} armure{liste.length > 1 ? "s" : ""}{liste.length === 0 ? " : aucune ne correspond." : ""}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.5rem" }}>
            {liste.slice(0, affichees).map((p) => (
              <li key={p.itemInstanceId ?? `${p.itemHash}-${p.origine}`}>
                <button onClick={() => { setOuverte(p); setDiagnostic(null); }} data-armure-possedee={p.itemInstanceId ?? ""} data-lieu={p.origine ?? ""} data-simulee={nbSim(p) > 0 ? "1" : ""}
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
      {ouverte && stats && (
        <div onClick={() => setOuverte(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div role="dialog" aria-modal="true" aria-label={`Simulation des mods de ${ouverte.nom}`} onClick={(e) => e.stopPropagation()} style={{ background: "#12151c", border: `1px solid ${couleurRarete(ouverte)}`, borderRadius: 10, padding: "1rem", width: "min(52rem, 94vw)", maxHeight: "88vh", overflowY: "auto", color: "#e8e6df" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <strong style={{ fontSize: "1rem" }}>{ouverte.nom}</strong>
                <IconeSaison db={db} itemHash={ouverte.itemHash} />
                <IconeSlotArmure slot={ouverte.slot as never} taille={18} />
              </span>
              <button onClick={() => { setOuverte(null); setDiagnostic(null); }} aria-label="Fermer">✕</button>
            </div>
            {/* FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - « Lire le Lore » : EN HAUT DE FICHE, JUSTIFIÉ À DROITE, SOUS LA CROIX (spécification §6), affiché UNIQUEMENT si l'objet a un Lore. / EN: ⚠️ ADDED - "Read the Lore": top of sheet, right-justified, under the close cross (spec §6), shown ONLY if the item has a lore. */}
            {onLireLore && <BoutonLireLore db={db} itemHash={ouverte.itemHash} nomObjet={ouverte.nom ?? ""} onLireLore={onLireLore} />}
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0.2rem 0 0.4rem" }}>{[LIBELLES_SLOT[ouverte.slot], ouverte.classeRequise ? CLASSES[ouverte.classeRequise] : "", ouverte.isExotic ? "Exotique" : ouverte.rarete, LIEUX[ouverte.origine ?? ""], ouverte.equipe ? "équipée" : "", ensembles.get(ouverte) ? `ensemble « ${ensembles.get(ouverte)} »` : ""].filter(Boolean).join(" · ")} — simulation locale : rien n'est modifié dans le jeu.</p>
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0 0 0.6rem" }}>Les emplacements <em>fixes</em> (archétype, amélioration, ensemble, exotique) ne se changent pas : ils sont listés plus bas, en lecture seule.</p>
            {/* FR : ⚠️ AJOUT (16/10/2026, v0.4.12) - quand on vient d'un bouton « Forge » : « Retour » à la vue d'origine, DANS la fenêtre (visible sans la fermer), comme pour les armes ; et un avertissement si la disponibilité des mods n'a pas été lue (inventaire chargé avant la mise à jour). / EN: ⚠️ ADDED - "Back" button inside the window, and a warning when mod availability was not read. */}
            {cible && onRetour && (
              <div data-ligne-actions="" style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", margin: "0 0 0.6rem" }}>
                <button data-retour-fenetre="" onClick={() => { setOuverte(null); setDiagnostic(null); onRetour(); }} style={styleAction}>← Retour à {libelleRetour}</button>
              </div>
            )}
            {ouverte.plugsDisponiblesParColonne === undefined && <p data-dispo-non-lue="" style={{ fontSize: "0.75rem", color: "#e0c080", margin: "0 0 0.6rem" }}>⚠️ La disponibilité des mods sur votre exemplaire n'a pas été lue (inventaire chargé avant la mise à jour) : rechargez votre inventaire dans Build Analyzer pour pouvoir en simuler.</p>}
{/* FR : ⚠️ CHANGÉ (26/10/2026, retour de l'utilisateur : « Je ne vois pas les nouvelles fenêtres » ; « inutile d'afficher le total des stats » ; « 2 lignes, 3 stats par ligne ») - la fenêtre de la FORGE des armures utilise le composant `SimulationModsArmure` (statistiques sur 2 lignes de 3, SANS total, jauge d'énergie, résumé compact + « Modifier »). Restent ici : la case des cosmétiques et, plus bas, les emplacements NON pris en charge par le composant (archétype, amélioration, ensemble, exotique, cosmétiques) en lecture seule. EN: ⚠️ CHANGED - the Forge armor window uses the shared component (3 columns, no total). */}
            {instance && stats && (
              <SimulationModsArmure db={db} piece={ouverte} colonnes={colonnes} choix={choixOuverte} stats={stats} nbSimulees={nbColonnesSimulees(simulations, instance, "armures")} onChanger={(changements) => appliquer((s) => appliquerChangements(s, instance, colonnes, changements))} onReinitialiser={() => appliquer((s) => reinitialiserArme(s, instance, "armures"))} />
            )}
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.6rem" }}>
              <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
                <input type="checkbox" checked={voirCosmetiques} onChange={(e) => setVoirCosmetiques(e.target.checked)} /> Afficher les emplacements cosmétiques
              </label>
<<<<<<< Updated upstream
              <span data-nb-simulees={instance ? nbColonnesSimulees(simulations, instance, "armures") : 0} style={{ fontSize: "0.78rem", color: "#e8c547" }}>{instance && nbColonnesSimulees(simulations, instance, "armures") > 0 ? `${nbColonnesSimulees(simulations, instance, "armures")} emplacement${nbColonnesSimulees(simulations, instance, "armures") > 1 ? "s" : ""} simulé${nbColonnesSimulees(simulations, instance, "armures") > 1 ? "s" : ""}` : "aucune simulation"}</span>
              <button disabled={!instance || nbColonnesSimulees(simulations, instance, "armures") === 0} onClick={() => instance && appliquer((s) => reinitialiserArme(s, instance, "armures"))} style={{ fontSize: "0.78rem" }}>↺ Revenir à l'équipement réel</button>
=======
>>>>>>> Stashed changes
            </div>
            {import.meta.env.DEV && (
              <div style={{ marginBottom: "0.6rem" }}>
                <button onClick={() => setDiagnostic(db ? diagnosticArmure(db, ouverte) : null)} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic des emplacements de cette armure (à copier à Claude)</button>
                {diagnostic && <textarea readOnly value={diagnostic} onFocus={(e) => e.currentTarget.select()} rows={9} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#c8c5bb", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.4rem" }} />}
              </div>
            )}
            {colonnes.length === 0 && <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucun emplacement lu pour cette armure (rechargez votre inventaire).</p>}
            {/* FR : ⚠️ AJOUT (19/10/2026, retour de test de la 0.4.12 : « sur certains slots, il y aura forcément des doublons, il faudra une interface spécifique pour ne pas les afficher 3 fois ») - les prices IDENTIQUES (même plug équipé, même catégorie, mêmes options) sont regroupées en UN bloc « × N » ; chaque prise du groupe reste simulée séparément (le magasin est par prise) : le marqueur du bloc dit combien sont simulées. / EN: identical sockets are shown once as one block; each socket stays simulated separately. */}
            {regrouperColonnesArmure(colonnes.filter((c: ColonneArmure) => !estGereeParSimulation(c))).map((groupe) => {
              const premier = groupe.colonnes[0];
              const nbSimuleesGroupe = groupe.colonnes.filter((c) => choixOuverte?.[c.socketIndex]?.choisi !== undefined && choixOuverte?.[c.socketIndex]?.choisi !== c.equipe.hash).length;
              return (
              <div key={premier.socketIndex} data-colonne={premier.socketIndex} data-groupe-prises={groupe.colonnes.length > 1 ? groupe.colonnes.map((c) => c.socketIndex).join(",") : ""} data-modifiable={groupe.modifiable ? "1" : ""} data-theorique={groupe.theorique ? "1" : ""} style={{ margin: "0 0 0.7rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#9a968a", margin: "0 0 0.25rem" }}>{groupe.categorie || `Emplacement ${premier.socketIndex}`}{groupe.colonnes.length > 1 && <span data-multiplicite={groupe.colonnes.length}> × {groupe.colonnes.length}</span>}{nbSimuleesGroupe > 0 && <span style={{ color: "#e8c547" }}> · {nbSimuleesGroupe} simulé{nbSimuleesGroupe > 1 ? "s" : ""}</span>}{!groupe.modifiable && <span style={{ fontWeight: 400, color: "#6b6860" }}> · {groupe.fixe ? "fixe" : groupe.cosmetique ? "cosmétique" : "un seul plug disponible"}</span>}</div>
                {groupe.theorique && groupe.modifiable && <p data-plugs-theoriques="" style={{ fontSize: "0.7rem", color: "#9a8a6a", margin: "0 0 0.25rem" }}>Plugs possibles lus sur le modèle du jeu (votre exemplaire n'en liste aucun) : la simulation est locale, rien ne prouve que cette pièce les accepte.</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {premier.options.map((plug) => {
                    const reel = plug.hash === premier.equipe.hash;
                    const simule = groupe.colonnes.some((c) => choixOuverte?.[c.socketIndex]?.choisi === plug.hash);
                    const niveau = simule ? "simule" : reel ? "reel" : plug.theorique ? "theorique" : "disponible";
                    return (
                      <button key={plug.hash} type="button" disabled={!groupe.modifiable} onClick={() => (groupe.colonnes.length > 1 ? choisirPlugGroupe(groupe, plug) : choisirPlug(premier, plug))} title={plug.description || plug.nom} data-plug={plug.hash} data-niveau={niveau} data-reel={reel ? "1" : ""} data-theorique={plug.theorique ? "1" : ""}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.2rem 0.55rem", fontSize: "0.78rem", borderRadius: 999, cursor: groupe.modifiable ? "pointer" : "default", color: simule ? "#f4e3a0" : reel ? "#e8e6df" : groupe.modifiable ? "#b9bcc6" : "#8a8a96", background: simule ? "#2a2412" : "#0d0f14", border: `1px solid ${simule ? "#e8c547" : reel ? "#7aa2f7" : "#4a4f5c"}`, opacity: 1, fontStyle: plug.theorique && !reel ? "italic" : "normal" }}>
                        {reel && <span style={{ color: "#7aa2f7" }}>✓</span>}
                        {plug.icone && <img src={plug.icone} alt="" width={18} height={18} style={{ borderRadius: 3 }} />}
                        <span>{plug.nom}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

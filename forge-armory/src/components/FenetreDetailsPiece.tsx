// FR : ⚠️ AJOUT (30/10/2026, demande de l'utilisateur : « les pop-up de détails qui sont dans le Build Analyzer et Forge devraient être identiques et montrer les mêmes infos aux mêmes endroits ») - LA FENÊTRE DE DÉTAILS UNIQUE d'une arme ou d'une armure : utilisée par l'Inventaire / le Coffre et Mon Build (Build Analyzer) ET par les Forges des armes et des armures. Avant : QUATRE copies différentes (deux dans Build Analyzer, deux dans la Forge) qui ne montraient ni les mêmes informations ni aux mêmes endroits. ORDRE UNIQUE : (1) titre (icône des armes façonnées, nom, saison, icônes de l'objet) et croix ; (2) « Lire le Lore » sous la croix, justifié à droite ; (3) ligne descriptive (type, classe, rareté, lieu, équipée, ensemble) puis la SOURCE ; (4) ensemble et bonus de set (armure) OU particularité d'origine (arme) ; (5) ligne d'actions : « Retour à … », « Mettre dans Mon Build », « Forge : choisir… » ; (6) explication de la simulation ; (7) le corps : simulation des perks (arme) ou des mods (armure) puis, pour l'armure, les emplacements fixes. Les boutons d'ACTION utilisent les visuels de la charte (`BoutonAction`). Rien n'est modifié en jeu.
// EN: ⚠️ ADDED - THE single details window of a weapon or armor piece, used by Build Analyzer (Inventory, My Build) AND the Forge: same information, same places.
import { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { GearPiece } from "../types/build";
import BoutonLireLore from "./BoutonLireLore";
import BoutonAction from "./BoutonAction";
import IconeSaison from "./IconeSaison";
import IconeTitreFaconnee from "./IconeTitreFaconnee";
import IconesArme from "./IconesArme";
import IconeSlotArmure from "./icones/IconeSlotArmure";
import ColonnesPerks, { ColonneAffichee } from "./ColonnesPerks";
import SimulationModsArmure from "./SimulationModsArmure";
import { surlignerVerbesConnus } from "./RenduTextePerk";
import { obtenirBonusSet, obtenirOptionsToutesColonnes, obtenirSource, obtenirIconesPerksArme } from "../lib/manifest/doctrine";
import type { OptionSocket } from "../lib/manifest/doctrine";
import { ordonnerColonnesPourAffichage } from "../lib/manifest/colonnesArme";
import { apparierPerksAmeliores, typeEstAmeliore, OptionJumelee } from "../lib/manifest/perksAmeliores";
import { colonnesArmure, diagnosticArmure, statsSimulees, regrouperColonnesArmure } from "../lib/forge/armure";
import type { ColonneArmure, PlugArmure, GroupeColonneArmure } from "../lib/forge/armure";
import { choisir, retirerColonne, reinitialiserArme, nbColonnesSimulees, estLeRollReel, armeEstAmelioree, choixEffectif, Simulations } from "../lib/forge/simulation";
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";
import { appliquerChangements, estGereeParSimulation } from "../lib/forge/energieMods";
import { estFaconnee } from "../lib/forge/faconnee";
import { obtenirDiagnosticPlugsExemplaire } from "../lib/forge/diagnosticPlugs";
import { couleurRarete } from "../lib/forge/stylesListes";
import { LIBELLES_SLOT as LIBELLES_SLOT_ARMURE } from "../data/libellesUI";

const SLOTS_ARME = ["cinetique", "energie", "lourde"];
const LIBELLES_SLOT: Record<string, string> = { ...LIBELLES_SLOT_ARMURE, cinetique: "Cinétique", energie: "Énergétique", lourde: "Lourde" };
const CLASSES: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste" };
const LIEUX: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste", coffre: "Coffre", courrier: "Courrier" };
const styleAction = { fontSize: "0.8rem", height: "2rem", padding: "0 0.7rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", lineHeight: 1.2, boxSizing: "border-box" } as const;

export interface PropsFenetreDetails {
  db: Database | null;
  piece: GearPiece;
  onFermer: () => void;
  /** FR : « Lire le Lore » : affiché seulement si l'objet a un Lore. */
  onLireLore?: (itemHash: number, nomObjet: string) => void;
  /** FR : bouton « Forge : choisir… » (Build Analyzer seulement : dans la Forge on y est déjà). */
  onOuvrirForge?: (piece: GearPiece) => void;
  /** FR : « Retour à … » : seulement quand on est arrivé par un bouton « Forge ». */
  onRetour?: () => void;
  libelleRetour?: string;
  /** FR : « Mettre dans Mon Build » ; `dejaDansBuild` : la pièce y est déjà (Mon Build, ou ajoutée à l'instant). */
  onAjouterAuBuild?: (piece: GearPiece) => void;
  dejaDansBuild?: boolean;
}

export default function FenetreDetailsPiece({ db, piece: ouverte, onFermer, onLireLore, onOuvrirForge, onRetour, libelleRetour = "la vue d'origine", onAjouterAuBuild, dejaDansBuild = false }: PropsFenetreDetails) {
  const estArme = SLOTS_ARME.includes(ouverte.slot as string);
  const simulations = useSimulations();
  const appliquer = (transformation: (s: Simulations) => Simulations) => mettreAJourSimulations(transformation);
  const instance = ouverte.itemInstanceId;
  const [messageBuild, setMessageBuild] = useState<string | null>(null);
  const [ajoutee, setAjoutee] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [voirInutiles, setVoirInutiles] = useState(false);
  const [voirCosmetiques, setVoirCosmetiques] = useState(false);
  useEffect(() => {
    const surTouche = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onFermer(); };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onFermer]);

  // ---------- ARME ----------
  const faconnee = estArme && estFaconnee(db, ouverte.perkHashes);
  const colonnesAffichees = useMemo((): ColonneAffichee[] => {
    if (!db || !estArme) return [];
    const colonnes = ordonnerColonnesPourAffichage(obtenirOptionsToutesColonnes(db, ouverte.itemHash, ouverte.perkHashes, { inclureMasquees: voirInutiles, toutesSources: faconnee, equipesParColonne: ouverte.perksParColonne }));
    return colonnes.map((col) => ({ col, items: col.masquee ? col.options.map((option): OptionJumelee<OptionSocket> => ({ option })) : apparierPerksAmeliores(col.options, (o) => typeEstAmeliore(db, o.hash)) }));
  }, [db, ouverte, voirInutiles, faconnee, estArme]);
  const armeAmelioree = armeEstAmelioree(colonnesAffichees.filter((c) => !c.col.masquee).map((c) => c.items));
  const simulesArme = instance ? simulations.armes[instance] : undefined;
  function choisirPerk(socketIndex: number, item: OptionJumelee<OptionSocket>) {
    if (!instance) return;
    if (estLeRollReel(item) || simulesArme?.[socketIndex]?.choisi === item.option.hash) appliquer((s) => retirerColonne(s, instance, socketIndex));
    else appliquer((s) => choisir(s, instance, socketIndex, { choisi: item.option.hash, effectif: choixEffectif(item, armeAmelioree) }));
  }

  // ---------- ARMURE ----------
  const choixOuverte = instance ? simulations.armures?.[instance] : undefined;
  const colonnes = useMemo(() => (db && !estArme ? colonnesArmure(db, ouverte, voirCosmetiques) : []), [db, ouverte, voirCosmetiques, estArme]);
  const stats = useMemo(() => (db && !estArme ? statsSimulees(db, ouverte, choixOuverte) : null), [db, ouverte, choixOuverte, estArme]);
  function choisirPlug(col: ColonneArmure, plug: PlugArmure) {
    if (!instance || !col.modifiable) return;
    if (plug.hash === col.equipe.hash || choixOuverte?.[col.socketIndex]?.choisi === plug.hash) appliquer((s) => retirerColonne(s, instance, col.socketIndex, "armures"));
    else appliquer((s) => choisir(s, instance, col.socketIndex, { choisi: plug.hash, effectif: plug.hash }, "armures"));
  }
  function choisirPlugGroupe(groupe: GroupeColonneArmure, plug: PlugArmure) {
    const cible = groupe.colonnes.find((c) => choixOuverte?.[c.socketIndex]?.choisi !== plug.hash) ?? groupe.colonnes[0];
    choisirPlug(cible, plug);
  }

  // ---------- informations communes ----------
  const set = !estArme && db ? obtenirBonusSet(db, ouverte.itemHash) : null;
  const origine = estArme && db ? obtenirIconesPerksArme(db, ouverte.perkHashes, 5).origine : undefined;
  const source = db ? obtenirSource(db, ouverte.itemHash) : undefined;
  const meta = estArme
    ? [ouverte.typeArme, ouverte.rarete, LIEUX[ouverte.origine ?? ""], ouverte.equipe ? "équipée" : ""]
    : [LIBELLES_SLOT[ouverte.slot as string], ouverte.classeRequise ? CLASSES[ouverte.classeRequise] : "", ouverte.isExotic ? "Exotique" : ouverte.rarete, LIEUX[ouverte.origine ?? ""], ouverte.equipe ? "équipée" : "", set ? `ensemble « ${set.nomSet} »` : ""];
  const dansBuild = dejaDansBuild || ajoutee;
  const nbSimArme = instance ? nbColonnesSimulees(simulations, instance) : 0;
  const fermer = () => { setDiagnostic(null); setMessageBuild(null); onFermer(); };

  return (
    <div data-fenetre-details="" onClick={fermer} style={{ position: "fixed", inset: 0, background: "rgba(13,15,20,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div role="dialog" aria-modal="true" aria-label={estArme ? `Simulation des perks de ${ouverte.nom}` : `Simulation des mods de ${ouverte.nom}`} onClick={(e) => e.stopPropagation()} style={{ background: "#12151c", border: `1px solid ${couleurRarete(ouverte)}`, borderRadius: 10, padding: "1rem", width: "min(52rem, 94vw)", maxHeight: "88vh", overflowY: "auto", color: "#e8e6df", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        {/* (1) titre et croix */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            {faconnee && <IconeTitreFaconnee taille={18} />}
            <strong style={{ fontSize: "1rem" }}>{ouverte.nom}</strong>
            <IconeSaison db={db} itemHash={ouverte.itemHash} />
            {estArme
              ? <span data-icones-fenetre="" style={{ display: "inline-flex", alignItems: "center" }}><IconesArme db={db} itemHash={ouverte.itemHash} type={ouverte.typeArme} slot={ouverte.slot as string} tailleType={35} taille={16} texteAccessible={[ouverte.typeArme, LIBELLES_SLOT[ouverte.slot as string], ouverte.elementArme].filter(Boolean).join(", ")} /></span>
              : <IconeSlotArmure slot={ouverte.slot as never} taille={18} />}
          </span>
          <button onClick={fermer} aria-label="Fermer" title="Fermer (Échap)">✕</button>
        </div>
        {/* (2) « Lire le Lore » */}
        {onLireLore && <BoutonLireLore db={db} itemHash={ouverte.itemHash} nomObjet={ouverte.nom ?? ""} onLireLore={onLireLore} />}
        {/* (3) description puis source */}
        <p data-meta-fenetre="" style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0.2rem 0 0" }}>{meta.filter(Boolean).join(" · ")}</p>
        <p data-source-fenetre="" style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.5rem" }}>{source ?? "Source inconnue"}</p>
        {/* (4) set (armure) ou particularité d'origine (arme) */}
        {!estArme && (set ? (
          <div data-set-fenetre="" style={{ marginBottom: "0.8rem" }}>
            <strong style={{ fontSize: "0.8rem" }}>🛡️ Set « {set.nomSet} »</strong>
            {set.perks.map((p) => (
              <div key={p.requiredSetCount} style={{ marginTop: "0.4rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#7aa2f7", display: "flex", alignItems: "center", gap: "0.3rem" }}>{p.icone && <img src={p.icone} alt="" width={16} height={16} style={{ borderRadius: 3 }} />}{p.requiredSetCount} pièces — {p.nom}</div>
                {p.description && <div style={{ fontSize: "0.72rem", color: "#b7b3a8", marginLeft: "0.3rem" }}>{surlignerVerbesConnus(p.description)}</div>}
              </div>
            ))}
          </div>
        ) : <p data-set-fenetre="" style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.6rem" }}>Cette armure ne fait partie d'aucun set.</p>)}
        {estArme && origine && (
          <div data-origine-fenetre="" style={{ marginBottom: "0.8rem" }}>
            <strong style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <img src={origine.icone} alt="" width={16} height={16} style={{ borderRadius: 3 }} />{origine.nom}
              <span style={{ color: "#7d7a70", fontWeight: 400, fontSize: "0.72rem" }}>(particularité d'origine)</span>
            </strong>
            {origine.description && <div style={{ fontSize: "0.72rem", color: "#b7b3a8", marginTop: "0.2rem" }}>{origine.description}</div>}
          </div>
        )}
        {/* (5) actions */}
        {(onRetour || ((onAjouterAuBuild || dansBuild) && instance) || onOuvrirForge) && (
          <div data-ligne-actions="" style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", margin: "0 0 0.6rem" }}>
            {onRetour && (libelleRetour === "Build Analyzer"
              ? <BoutonAction id="boutons-action.retour" libelle="Retour à Build Analyzer" onClick={() => { fermer(); onRetour(); }} donnees={{ "retour-fenetre": true }} />
              : <button data-retour-fenetre="" onClick={() => { fermer(); onRetour(); }} style={styleAction}>← Retour à {libelleRetour}</button>)}
            {(onAjouterAuBuild || dansBuild) && instance && (dansBuild
              ? <span data-mettre-dans-build="" data-deja="1" style={{ fontSize: "0.8rem", color: "#7fd88f" }}>✓ Déjà dans Mon Build</span>
              : <BoutonAction id="boutons-action.plus" libelle="Mettre dans Mon Build" onClick={() => { onAjouterAuBuild?.(ouverte); setAjoutee(true); setMessageBuild(`✅ « ${ouverte.nom} » est dans Mon Build : le score tient compte de votre simulation, en temps réel. Rien n'est équipé en jeu.`); }} donnees={{ "mettre-dans-build": true }} />)}
            {onOuvrirForge && instance && (
              estArme
                ? <button data-ouvrir-forge="" onClick={() => onOuvrirForge(ouverte)} style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}>🔨 Forge : choisir les perks de cette arme</button>   /* pas de visuel « arme » dans l'archive : le bouton texte reste */
                : <BoutonAction id="boutons-action.forgemods" libelle="Forge : choisir les mods de cette armure" onClick={() => onOuvrirForge(ouverte)} donnees={{ "ouvrir-forge": true }} />   /* ⚠️ 30/10/2026 : visuel de la charte */
            )}
            {messageBuild && <span data-message-build="" role="status" style={{ fontSize: "0.75rem", color: "#7fd88f" }}>{messageBuild}</span>}
          </div>
        )}
        {/* (6) et (7) corps */}
        {estArme ? (
          <>
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0 0 0.4rem" }}>Simulation locale : rien n'est modifié dans le jeu. Cliquez une perk pour la simuler (une seule par colonne) ; cliquez le roll réel, ou de nouveau la perk simulée, pour revenir au roll réel de la colonne.</p>
            <div data-legende-niveaux="" style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem 0.9rem", alignItems: "center", fontSize: "0.72rem", color: "#9a968a", margin: "0 0 0.6rem" }}>
              <span><span style={{ color: "#7aa2f7" }}>✓</span> roll réel (équipé en jeu)</span>
              {ouverte.plugsDisponiblesParColonne !== undefined ? (
                <>
                  <span><span style={{ display: "inline-block", width: "1.6rem", height: "0.8rem", verticalAlign: "middle", border: "1px solid #b9bcc6", borderRadius: 999 }} /> disponible sur votre exemplaire, non sélectionné</span>
                  <span style={{ color: "#6b6860" }}>nom grisé : possible sur ce modèle, pas sur votre exemplaire</span>
                </>
              ) : <span style={{ color: "#e0c080" }}>disponibilité sur votre exemplaire : non lue (rechargez votre inventaire)</span>}
              <span><span style={{ display: "inline-block", width: "1.6rem", height: "0.8rem", verticalAlign: "middle", border: "1px solid #e8c547", background: "#2a2412", borderRadius: 999 }} /> simulé</span>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.6rem" }}>
              <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.4rem", alignItems: "center" }}><input type="checkbox" checked={voirInutiles} onChange={(e) => setVoirInutiles(e.target.checked)} /> Afficher les perks inutiles</label>
              <span data-nb-simulees={nbSimArme} style={{ fontSize: "0.78rem", color: "#e8c547" }}>{nbSimArme > 0 ? `${nbSimArme} colonne${nbSimArme > 1 ? "s" : ""} simulée${nbSimArme > 1 ? "s" : ""}` : "aucune simulation"}</span>
              <button disabled={!instance || nbSimArme === 0} onClick={() => instance && appliquer((s) => reinitialiserArme(s, instance))} style={{ fontSize: "0.78rem" }}>↺ Revenir au roll réel</button>
            </div>
            {import.meta.env.DEV && db && (
              <div style={{ marginBottom: "0.6rem" }}>
                <button onClick={() => setDiagnostic(obtenirDiagnosticPlugsExemplaire(db, ouverte))} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic des perks disponibles de cet exemplaire (à copier à Claude)</button>
                {diagnostic && <textarea readOnly value={diagnostic} onFocus={(e) => e.currentTarget.select()} rows={9} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#b7b3a8", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.4rem" }} />}
              </div>
            )}
            {colonnesAffichees.length === 0 && <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucune option trouvée pour cette arme.</p>}
            <ColonnesPerks colonnes={colonnesAffichees} simules={simulesArme} disponibles={ouverte.plugsDisponiblesParColonne} onChoisir={choisirPerk} />
          </>
        ) : (
          <>
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0 0 0.6rem" }}>Simulation locale : rien n'est modifié dans le jeu. Les emplacements <em>fixes</em> (archétype, amélioration, ensemble, exotique) ne se changent pas : ils sont listés plus bas, en lecture seule.</p>
            {ouverte.plugsDisponiblesParColonne === undefined && <p data-dispo-non-lue="" style={{ fontSize: "0.75rem", color: "#e0c080", margin: "0 0 0.6rem" }}>⚠️ La disponibilité des mods sur votre exemplaire n'a pas été lue (inventaire chargé avant la mise à jour) : rechargez votre inventaire dans Build Analyzer pour pouvoir en simuler.</p>}
            {instance && stats && db && (
              <SimulationModsArmure db={db} piece={ouverte} colonnes={colonnes} choix={choixOuverte} stats={stats} nbSimulees={nbColonnesSimulees(simulations, instance, "armures")} onChanger={(changements) => appliquer((s) => appliquerChangements(s, instance, colonnes, changements))} onReinitialiser={() => appliquer((s) => reinitialiserArme(s, instance, "armures"))} />
            )}
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.6rem" }}>
              <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.4rem", alignItems: "center" }}><input type="checkbox" checked={voirCosmetiques} onChange={(e) => setVoirCosmetiques(e.target.checked)} /> Afficher les emplacements cosmétiques</label>
            </div>
            {import.meta.env.DEV && db && (
              <div style={{ marginBottom: "0.6rem" }}>
                <button onClick={() => setDiagnostic(diagnosticArmure(db, ouverte))} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic des emplacements de cette armure (à copier à Claude)</button>
                {diagnostic && <textarea readOnly value={diagnostic} onFocus={(e) => e.currentTarget.select()} rows={9} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#c8c5bb", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.4rem" }} />}
              </div>
            )}
            {colonnes.length === 0 && <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucun emplacement lu pour cette armure (rechargez votre inventaire).</p>}
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
          </>
        )}
      </div>
    </div>
  );
}

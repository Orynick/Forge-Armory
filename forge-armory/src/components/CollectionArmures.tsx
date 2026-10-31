// FR : ⚠️ AJOUT (16/10/2026, v0.4.12), demande de l'utilisateur : « on enchaîne sur les armures de la Collection » - TOUTES LES ARMURES DU JEU (Manifest), avec leurs emplacements et leurs plugs possibles, grisées quand le compte ne les a jamais obtenues (collections du compte, comme pour les armes). LECTURE SEULE : rien n'est simulé, rien n'est écrit ; pas de lien avec le score.
// Une fenêtre par armure : son ENSEMBLE et ses bonus (Armor 3.0), puis ses EMPLACEMENTS lus dans la définition du modèle (archétype, amélioration… avec tous les plugs possibles et leurs bonus de statistiques). Les emplacements de MODS (listes très longues) et COSMÉTIQUES sont repliés par défaut (cases à cocher). ⚠️ Structure réelle des armures non vérifiée sur le Manifest de l'utilisateur : voir le diagnostic en `npm run dev`. EN: ⚠️ ADDED - the game's armors (Manifest) with their sockets and possible plugs, greyed when never obtained; read-only.
import { useEffect, useMemo, useState } from "react";
// FR : ⚠️ AJOUT (23/10/2026, audit) - styles partagés des fenêtres liste (dedup). / EN: ⚠️ ADDED - shared list-window styles (dedup).
import { couleurRarete, styleChamp } from "../lib/forge/stylesListes";
import type { Database } from "sql.js";
import BoutonLireLore from "./BoutonLireLore";   // ⚠️ AJOUT (21/10/2026, Legendarium étape 5) : bouton « Lire le Lore » (fiche → page de Lore)
import type { DestinyMembership } from "../lib/bungie/api";
import { construireCatalogueArmures, filtrerArmures, valeursDistinctesArmures, FILTRES_ARMURES_PAR_DEFAUT, ArmureCatalogue, FiltresArmures } from "../lib/manifest/catalogueArmures";
import { lireCollections, classerObtention, ObtenusParCollectible } from "../lib/bungie/collections";
import { obtenirBonusSet } from "../lib/manifest/doctrine";
import { colonnesModeleArmure, diagnosticArmureManifest, PlugArmure } from "../lib/forge/armure";
import { SessionExpiree } from "../lib/bungie/oauth";
import { LIBELLES_SLOT, LIBELLES_STAT, ORDRE_STATS } from "../data/libellesUI";
import FiligraneSaison from "./FiligraneSaison";
import IconeSaison from "./IconeSaison";
import IconeClasse from "./icones/IconeClasse";
import IconeSlotArmure from "./icones/IconeSlotArmure";

const TAILLE_PAGE = 60;
const CLASSES: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste" };


const signe = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);
/** FR : « Santé +17 · Classe +12 » : les bonus de statistiques d'un plug, dans l'ordre habituel des six statistiques. / EN: a plug's stat bonuses. */
const texteStats = (p: PlugArmure) => ORDRE_STATS.filter((k) => p.stats[k]).map((k) => `${LIBELLES_STAT[k]} ${signe(p.stats[k] as number)}`).join(" · ");

interface Props {
  db: Database | null;
  membership: DestinyMembership | null;
  /** FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - clic du bouton « Lire le Lore » (fiche Détails → Legendarium). / EN: ⚠️ ADDED - "Read the Lore" click (Details sheet → Legendarium). */
  onLireLore?: (itemHash: number, nomObjet: string) => void;
}

export default function CollectionArmures({ db, membership, onLireLore }: Props) {
  const [armures, setArmures] = useState<ArmureCatalogue[] | null>(null);
  const [lues, setLues] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [obtenus, setObtenus] = useState<ObtenusParCollectible | null>(null);
  const [raisonCollections, setRaisonCollections] = useState<string | null>(null);
  const [filtres, setFiltres] = useState<FiltresArmures>(FILTRES_ARMURES_PAR_DEFAUT);
  const [affichees, setAffichees] = useState(TAILLE_PAGE);
  const [ouverte, setOuverte] = useState<ArmureCatalogue | null>(null);
  const [voirMods, setVoirMods] = useState(false);
  const [voirCosmetiques, setVoirCosmetiques] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

  // FR : le catalogue se construit (une fois par Manifest) pendant que l'écran reste réactif.
  useEffect(() => {
    setArmures(null); setErreur(null); setLues(0);
    if (!db) return;
    let annule = false;
    construireCatalogueArmures(db, { onProgression: (n) => !annule && setLues(n) })
      .then((liste) => !annule && setArmures(liste))
      .catch((e) => !annule && setErreur((e as Error).message));
    return () => { annule = true; };
  }, [db]);

  // FR : les collections du compte (lecture seule) ; toute erreur est expliquée et rien n'est grisé.
  useEffect(() => {
    setObtenus(null); setRaisonCollections(null);
    if (!membership) { setRaisonCollections("vous n'êtes pas connecté à Bungie"); return; }
    let annule = false;
    lireCollections(membership)
      .then((r) => { if (annule) return; if (r.ok) setObtenus(r.obtenus); else setRaisonCollections(r.raison); })
      .catch((e) => !annule && setRaisonCollections(e instanceof SessionExpiree ? "votre session Bungie a expiré : reconnectez-vous" : (e as Error).message));
    return () => { annule = true; };
  }, [membership]);

  const obtentionDe = (a: ArmureCatalogue) => classerObtention(a.collectibleHash, obtenus);
  const resultats = useMemo(() => (armures ? filtrerArmures(armures, filtres, (a) => classerObtention(a.collectibleHash, obtenus)) : []), [armures, filtres, obtenus]);
  const modifier = (p: Partial<FiltresArmures>) => { setFiltres((f) => ({ ...f, ...p })); setAffichees(TAILLE_PAGE); };
  const colonnes = useMemo(() => (db && ouverte ? colonnesModeleArmure(db, ouverte.hash, { mods: voirMods, cosmetiques: voirCosmetiques }) : []), [db, ouverte, voirMods, voirCosmetiques]);
  const bonus = useMemo(() => { if (!db || !ouverte) return undefined; try { return obtenirBonusSet(db, ouverte.hash); } catch { return undefined; } }, [db, ouverte]);

  if (!db) return <p style={{ fontSize: "0.9rem", color: "#e0c080" }}>⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest ».</p>;
  if (erreur) return <p style={{ fontSize: "0.9rem", color: "#e08080" }}>⚠️ Impossible de lire les armures dans le Manifest : {erreur}</p>;
  if (!armures) return <p role="status" style={{ fontSize: "0.9rem", color: "#7d7a70" }}>Lecture des armures du Manifest… {lues > 0 ? `${lues} armures trouvées` : ""}</p>;

  const menu = (nom: string, valeur: string, onChange: (v: string) => void, options: [string, string][], desactive = false) => (
    <select aria-label={nom} value={valeur} onChange={(e) => onChange(e.target.value)} disabled={desactive} style={styleChamp}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  const enCollections = armures.filter((a) => a.collectibleHash).length;
  return (
    <div>
      <p role="status" data-collections-armures={obtenus ? "lues" : "non-lues"} style={{ fontSize: "0.8rem", margin: "0 0 0.6rem", color: obtenus ? "#7fd88f" : "#e0c080" }}>
        {obtenus ? "✅ Collections du compte lues : les armures jamais obtenues sont grisées." : `⚠️ Collections du compte non lues (${raisonCollections ?? "lecture en cours…"}) : aucune armure n'est grisée.`}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
        <input type="search" aria-label="Rechercher une armure du jeu" placeholder="Rechercher par nom ou ensemble…" value={filtres.texte} onChange={(e) => modifier({ texte: e.target.value })} style={{ ...styleChamp, minWidth: "15rem" }} />
        {menu("Classe de l'armure du jeu", filtres.classe, (v) => modifier({ classe: v as FiltresArmures["classe"] }), [["toutes", "Toutes les classes"], ...Object.entries(CLASSES)])}
        {menu("Emplacement de l'armure du jeu", filtres.slot, (v) => modifier({ slot: v as FiltresArmures["slot"] }), [["tous", "Tous emplacements"], ...(["casque", "gants", "torse", "jambes", "marque"] as const).map((s): [string, string] => [s, LIBELLES_SLOT[s]])])}
        {menu("Rareté de l'armure du jeu", filtres.rarete, (v) => modifier({ rarete: v }), [["toutes", "Toutes raretés"], ...valeursDistinctesArmures(armures, "rarete").map((t): [string, string] => [t, t])])}
        {menu("Ensemble d'armure", filtres.ensemble, (v) => modifier({ ensemble: v }), [["tous", "Tous les ensembles"], ...valeursDistinctesArmures(armures, "ensemble").map((t): [string, string] => [t, t])])}
        {menu("Source des armures", filtres.source, (v) => modifier({ source: v as FiltresArmures["source"] }), [["collections", `Collections du jeu (${enCollections})`], ["hors", `Hors Collections (${armures.length - enCollections})`], ["tout", `Tout (${armures.length})`]])}
        {menu("Obtention des armures", filtres.obtention, (v) => modifier({ obtention: v as FiltresArmures["obtention"] }), [["toutes", "Obtenues ou non"], ["obtenues", "Obtenues"], ["jamais", "Jamais obtenues"]], !obtenus)}
        <button onClick={() => { setFiltres(FILTRES_ARMURES_PAR_DEFAUT); setAffichees(TAILLE_PAGE); }} style={{ fontSize: "0.8rem" }}>✕ Réinitialiser les filtres</button>
      </div>
      <p data-compteur-armures="" style={{ fontSize: "0.8rem", color: "#7d7a70", margin: "0 0 0.5rem" }}>{resultats.length} armure{resultats.length > 1 ? "s" : ""}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.5rem" }}>
        {resultats.slice(0, affichees).map((a) => {
          const etat = obtentionDe(a);
          return (
            <li key={a.hash}>
              <button data-armure-collection={a.hash} data-obtention={etat} onClick={() => { setOuverte(a); setVoirMods(false); setVoirCosmetiques(false); setDiagnostic(null); }} title={`Voir les emplacements de ${a.nom}`}
                style={{ width: "100%", display: "flex", gap: "0.6rem", alignItems: "center", textAlign: "left", background: "#12151c", color: "#e8e6df", border: `1px solid ${couleurRarete(a)}`, borderRadius: 8, padding: "0.4rem", cursor: "pointer", opacity: etat === "jamais" ? 0.45 : 1 }}>
                <span style={{ position: "relative", display: "block", width: 44, height: 44, flexShrink: 0 }}>
                  {a.icone ? <img src={a.icone} alt="" width={44} height={44} style={{ borderRadius: 4, display: "block", border: `1px solid ${couleurRarete(a)}` }} /> : <span style={{ display: "block", width: 44, height: 44 }} />}
                  {a.icone && <FiligraneSaison db={db} itemHash={a.hash} taille={44} />}
                </span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: "0.85rem", display: "block" }}>{a.nom}</strong>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#b7b3a8" }}>
                    <IconeSlotArmure slot={a.slot as never} taille={16} />
                    <span>{LIBELLES_SLOT[a.slot]}</span>
                    {a.classe && <><IconeClasse classe={a.classe} taille={14} /><span>{CLASSES[a.classe]}</span></>}
                  </span>
                  {a.ensemble && <span data-ensemble-carte="" style={{ display: "block", fontSize: "0.72rem", color: "#9a968a" }}>Ensemble « {a.ensemble} »</span>}
                  {etat === "jamais" && <span style={{ display: "block", fontSize: "0.7rem", color: "#9a968a" }}>jamais obtenue</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {resultats.length > affichees && <button onClick={() => setAffichees((n) => n + TAILLE_PAGE)} style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>Afficher plus ({resultats.length - affichees} restantes)</button>}
      {ouverte && (
        <div onClick={() => setOuverte(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div role="dialog" aria-modal="true" aria-label={`Emplacements de ${ouverte.nom}`} onClick={(e) => e.stopPropagation()} style={{ background: "#12151c", border: `1px solid ${couleurRarete(ouverte)}`, borderRadius: 10, padding: "1rem", width: "min(52rem, 94vw)", maxHeight: "88vh", overflowY: "auto", color: "#e8e6df" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <strong style={{ fontSize: "1rem" }}>{ouverte.nom}</strong>
                <IconeSaison db={db} itemHash={ouverte.hash} />
                <IconeSlotArmure slot={ouverte.slot as never} taille={18} />
              </span>
              <button onClick={() => { setOuverte(null); setDiagnostic(null); }} aria-label="Fermer">✕</button>
            </div>
            {/* FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - « Lire le Lore » : EN HAUT DE FICHE, JUSTIFIÉ À DROITE, SOUS LA CROIX (spécification §6), affiché UNIQUEMENT si l'objet a un Lore. / EN: ⚠️ ADDED - "Read the Lore": top of sheet, right-justified, under the close cross (spec §6), shown ONLY if the item has a lore. */}
            {onLireLore && <BoutonLireLore db={db} itemHash={ouverte.hash} nomObjet={ouverte.nom ?? ""} onLireLore={onLireLore} />}
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0.2rem 0 0.4rem" }}>{[LIBELLES_SLOT[ouverte.slot], ouverte.classe ? CLASSES[ouverte.classe] : "", ouverte.estExotique ? "Exotique" : ouverte.rarete, obtentionDe(ouverte) === "jamais" ? "jamais obtenue" : obtentionDe(ouverte) === "obtenu" ? "obtenue" : ""].filter(Boolean).join(" · ")} — consultation : rien n'est simulé ni modifié.</p>
            {bonus && (
              <div data-bonus-ensemble="" style={{ margin: "0 0 0.7rem", padding: "0.4rem 0.6rem", border: "1px solid #2b3040", borderRadius: 8, background: "#0f1218" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>Ensemble « {bonus.nomSet} »</div>
                {bonus.perks.map((p) => (
                  <div key={`${p.requiredSetCount}-${p.nom}`} data-bonus-piece={p.requiredSetCount} title={p.description} style={{ fontSize: "0.75rem", color: "#b7b3a8", marginTop: "0.2rem", display: "flex", gap: "0.4rem", alignItems: "baseline" }}>
                    {p.icone && <img src={p.icone} alt="" width={16} height={16} style={{ alignSelf: "center" }} />}
                    <strong style={{ color: "#e8e6df" }}>{p.requiredSetCount} pièces : {p.nom}</strong>
                    <span style={{ color: "#8d8a80" }}>{p.description}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "0 0 0.6rem" }}>
              <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
                <input type="checkbox" checked={voirMods} onChange={(e) => setVoirMods(e.target.checked)} /> Afficher aussi les emplacements de mods (listes longues)
              </label>
              <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
                <input type="checkbox" checked={voirCosmetiques} onChange={(e) => setVoirCosmetiques(e.target.checked)} /> Afficher les emplacements cosmétiques
              </label>
            </div>
            {import.meta.env.DEV && (
              <div style={{ marginBottom: "0.6rem" }}>
                <button onClick={() => setDiagnostic(db ? diagnosticArmureManifest(db, ouverte.hash) : null)} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic des emplacements de ce modèle d'armure (à copier à Claude)</button>
                {diagnostic && <textarea readOnly value={diagnostic} onFocus={(e) => e.currentTarget.select()} rows={9} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#c8c5bb", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.4rem" }} />}
              </div>
            )}
            {colonnes.length === 0 && <p data-aucun-emplacement="" style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucun emplacement à afficher pour ce modèle (les mods et les cosmétiques sont repliés : cochez les cases ci-dessus pour les voir).</p>}
            {colonnes.map((col) => (
              <div key={col.socketIndex} data-colonne-modele={col.socketIndex} data-genre={col.mod ? "mods" : col.cosmetique ? "cosmetique" : col.fixe ? "fixe" : "autre"} style={{ margin: "0 0 0.7rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#9a968a", margin: "0 0 0.25rem" }}>{col.categorie || `Emplacement ${col.socketIndex}`}<span style={{ fontWeight: 400, color: "#6b6860" }}> · {col.options.length} possible{col.options.length > 1 ? "s" : ""}{col.fixe ? " · fixe" : ""}{col.mod ? " · mods" : ""}{col.cosmetique ? " · cosmétique" : ""}</span></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {col.options.map((plug) => (
                    <span key={plug.hash} data-plug-modele={plug.hash} title={[plug.description, texteStats(plug)].filter(Boolean).join(" — ") || plug.nom}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.2rem 0.55rem", fontSize: "0.78rem", borderRadius: 999, color: "#b9bcc6", background: "#0d0f14", border: "1px solid #4a4f5c" }}>
                      {plug.icone && <img src={plug.icone} alt="" width={18} height={18} style={{ borderRadius: 3 }} />}
                      <span>{plug.nom}</span>
                      {texteStats(plug) && <span data-stats-plug="" style={{ fontSize: "0.7rem", color: "#8d8a80" }}>({texteStats(plug)})</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

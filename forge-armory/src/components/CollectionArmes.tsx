// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - vue « COLLECTION » de la Forge, ARMES (spécification du 12/10/2026, §3 et §5) : tout ce qui existe dans le jeu, « comme dans le jeu » : COULEURS normales pour une arme obtenue au moins une fois, teinte GRISÉE pour une arme jamais obtenue (état lu dans les collections du compte, lecture seule).
// Liste filtrable (type, emplacement, rareté, élément, archétype, source, obtention) avec recherche par nom ; clic sur une arme : fenêtre avec ses colonnes de perks possibles, SANS sélection. Les colonnes utilisent la MÊME fonction et les MÊMES règles d'ordre et d'étiquette que la popup « Détails » (`obtenirOptionsToutesColonnes`, `colonnesArme.ts`).
// L'interrupteur « Afficher les perks inutiles » (désactivé par défaut) réaffiche les colonnes cosmétiques normalement masquées, marquées « inutile ». Si les collections ne peuvent pas être lues, AUCUNE arme n'est grisée (pas de faux « jamais obtenue ») et la raison est affichée. Une arme hors des Collections du jeu n'a pas d'état : elle reste en couleurs.
// Liste affichée par pages de 60 (le catalogue en compte des milliers). EN: ⚠️ ADDED - Forge "Collection" view for weapons: colours if ever obtained, greyed if never, filters, search, perk columns with the same logic as the Details popup, and a "show useless perks" switch.
import BadgeSaison from "./BadgeSaison";
import IconeSaison from "./IconeSaison";   // ⚠️ AJOUT (14/10/2026, v0.4.11)
import { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import { construireCatalogueArmes, filtrerArmes, valeursDistinctes, FILTRES_ARMES_PAR_DEFAUT, ArmeCatalogue, FiltresArmes } from "../lib/manifest/catalogueArmes";
import { lireCollections, classerObtention, ObtenusParCollectible } from "../lib/bungie/collections";
import { obtenirOptionsToutesColonnes, ELEMENTS_FILTRE } from "../lib/manifest/doctrine";
import { ordonnerColonnesPourAffichage } from "../lib/manifest/colonnesArme";
import { LIBELLES_ELEMENT_FR } from "../data/libellesElements";
import { SessionExpiree } from "../lib/bungie/oauth";
import { obtenirDiagnosticPerksArme } from "../lib/manifest/diagnosticPerksArme";   // ⚠️ AJOUT (13/10/2026, v0.4.3) : diagnostic (npm run dev)
import IconesArme from "./IconesArme";
import ColonnesPerks from "./ColonnesPerks";   // ⚠️ AJOUT (13/10/2026, v0.4.4) : les quatre icônes de la carte
import { apparierPerksAmeliores, typeEstAmeliore, OptionJumelee } from "../lib/manifest/perksAmeliores";   // ⚠️ AJOUT (13/10/2026, v0.4.4) : perks améliorés

const TAILLE_PAGE = 60;
const LIBELLES_SLOT = { cinetique: "Cinétique", energie: "Énergétique", lourde: "Lourde" } as const;
const libelleElement = (el: string | null) => (!el ? "" : el === "cinetique" ? "Cinétique" : LIBELLES_ELEMENT_FR[el as keyof typeof LIBELLES_ELEMENT_FR]);
const styleChamp = { fontSize: "0.85rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.4rem" } as const;
const couleurRarete = (a: ArmeCatalogue) => (a.estExotique ? "#ceae33" : a.rarete === "Légendaire" ? "#7a4fa3" : "#4a4f5c");

interface Props {
  db: Database | null;
  membership: DestinyMembership | null;
}

export default function CollectionArmes({ db, membership }: Props) {
  const [armes, setArmes] = useState<ArmeCatalogue[] | null>(null);
  const [lues, setLues] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [obtenus, setObtenus] = useState<ObtenusParCollectible | null>(null);
  const [raisonCollections, setRaisonCollections] = useState<string | null>(null);
  const [filtres, setFiltres] = useState<FiltresArmes>(FILTRES_ARMES_PAR_DEFAUT);
  const [affichees, setAffichees] = useState(TAILLE_PAGE);
  const [ouverte, setOuverte] = useState<ArmeCatalogue | null>(null);
  const [voirInutiles, setVoirInutiles] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);   // ⚠️ v0.4.3 : texte du diagnostic des perks (npm run dev seulement)

  // FR : le catalogue se construit (une fois par Manifest) pendant que l'écran reste réactif.
  useEffect(() => {
    setArmes(null); setErreur(null); setLues(0);
    if (!db) return;
    let annule = false;
    construireCatalogueArmes(db, { onProgression: (n) => !annule && setLues(n) })
      .then((liste) => !annule && setArmes(liste))
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

  const obtentionDe = (a: ArmeCatalogue) => classerObtention(a.collectibleHash, obtenus);
  const resultats = useMemo(() => (armes ? filtrerArmes(armes, filtres, (a) => classerObtention(a.collectibleHash, obtenus)) : []), [armes, filtres, obtenus]);
  const modifier = (p: Partial<FiltresArmes>) => { setFiltres((f) => ({ ...f, ...p })); setAffichees(TAILLE_PAGE); };
  const colonnes = useMemo(() => (db && ouverte ? ordonnerColonnesPourAffichage(obtenirOptionsToutesColonnes(db, ouverte.hash, [], { inclureMasquees: voirInutiles })) : []), [db, ouverte, voirInutiles]);
  // FR : ⚠️ AJOUT (13/10/2026, v0.4.4) - chaque perk avec sa VERSION AMÉLIORÉE incluse (spécification du 12/10/2026 : « les perks possibles s'affichent avec leur version améliorée incluse »). Appariement fait par `lib/manifest/perksAmeliores.ts` d'après les diagnostics de l'utilisateur ; les colonnes masquées (cosmétiques, ornements) ne sont jamais appariées. / EN: ⚠️ ADDED - each perk with its enhanced twin.
  const colonnesAffichees = useMemo(() => colonnes.map((col) => ({ col, items: (!db || col.masquee ? col.options.map((option): OptionJumelee<typeof option> => ({ option })) : apparierPerksAmeliores(col.options, (o) => typeEstAmeliore(db, o.hash))) })), [colonnes, db]);

  if (!db) return <p style={{ fontSize: "0.9rem", color: "#e0c080" }}>⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest ».</p>;
  if (erreur) return <p style={{ fontSize: "0.9rem", color: "#e08080" }}>⚠️ Impossible de lire les armes dans le Manifest : {erreur}</p>;
  if (!armes) return <p role="status" style={{ fontSize: "0.9rem", color: "#7d7a70" }}>Lecture des armes du Manifest… {lues > 0 ? `${lues} armes trouvées` : ""}</p>;

  const menu = (nom: string, valeur: string, onChange: (v: string) => void, options: [string, string][], desactive = false) => (
    <select aria-label={nom} value={valeur} onChange={(e) => onChange(e.target.value)} disabled={desactive} style={styleChamp}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  const enCollections = armes.filter((a) => a.collectibleHash).length;
  return (
    <div>
      <p role="status" data-collections={obtenus ? "lues" : "non-lues"} style={{ fontSize: "0.8rem", margin: "0 0 0.6rem", color: obtenus ? "#7fd88f" : "#e0c080" }}>
        {obtenus ? "✅ Collections du compte lues : les armes jamais obtenues sont grisées." : `⚠️ Collections du compte non lues (${raisonCollections ?? "lecture en cours…"}) : aucune arme n'est grisée.`}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
        <input type="search" aria-label="Rechercher une arme" placeholder="Rechercher par nom, type ou archétype…" value={filtres.texte} onChange={(e) => modifier({ texte: e.target.value })} style={{ ...styleChamp, minWidth: "16rem", flex: "1 1 16rem" }} />
        {menu("Type d'arme", filtres.type, (v) => modifier({ type: v }), [["tous", "Tous types d'arme"], ...valeursDistinctes(armes, "type").map((t): [string, string] => [t, t])])}
        {menu("Emplacement", filtres.slot, (v) => modifier({ slot: v as FiltresArmes["slot"] }), [["tous", "Tous emplacements"], ...(Object.entries(LIBELLES_SLOT) as [string, string][])])}
        {menu("Rareté", filtres.rarete, (v) => modifier({ rarete: v }), [["toutes", "Toutes raretés"], ...valeursDistinctes(armes, "rarete").map((t): [string, string] => [t, t])])}
        {menu("Élément", filtres.element, (v) => modifier({ element: v as FiltresArmes["element"] }), [["tous", "Tous les éléments"], ...ELEMENTS_FILTRE.map((el): [string, string] => [el, libelleElement(el)])])}
        {menu("Archétype", filtres.armature, (v) => modifier({ armature: v }), [["toutes", "Tous archétypes"], ...valeursDistinctes(armes, "armature").map((t): [string, string] => [t, t])])}
        {menu("Source", filtres.source, (v) => modifier({ source: v as FiltresArmes["source"] }), [["collections", `Collections du jeu (${enCollections})`], ["hors", `Hors Collections (${armes.length - enCollections})`], ["tout", `Tout (${armes.length})`]])}
        {menu("Obtention", filtres.obtention, (v) => modifier({ obtention: v as FiltresArmes["obtention"] }), [["toutes", "Obtenues ou non"], ["obtenues", "Obtenues"], ["jamais", "Jamais obtenues"]], !obtenus)}
        <button onClick={() => { setFiltres(FILTRES_ARMES_PAR_DEFAUT); setAffichees(TAILLE_PAGE); }} style={{ fontSize: "0.8rem" }}>✕ Réinitialiser les filtres</button>
      </div>
      <p data-compteur="" style={{ fontSize: "0.8rem", color: "#7d7a70", margin: "0 0 0.5rem" }}>{resultats.length} arme{resultats.length > 1 ? "s" : ""}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.5rem" }}>
        {resultats.slice(0, affichees).map((a) => {
          const etat = obtentionDe(a);
          const grise = etat === "jamais";
          return (
            <li key={a.hash}>
              <button data-arme={a.hash} data-obtention={etat} onClick={() => { setOuverte(a); setVoirInutiles(false); setDiagnostic(null); }} title={`Voir les perks possibles de ${a.nom}`}
                style={{ width: "100%", display: "flex", gap: "0.6rem", alignItems: "center", textAlign: "left", background: "#12151c", color: "#e8e6df", border: `1px solid ${couleurRarete(a)}`, borderRadius: 8, padding: "0.4rem 0.5rem", cursor: "pointer", opacity: grise ? 0.4 : 1, filter: grise ? "grayscale(1)" : "none" }}>
                {/* FR : ⚠️ CHANGÉ (14/10/2026, v0.4.11) - la vignette est enveloppée pour recevoir le FILIGRANE DE SAISON en haut à gauche (comme en jeu). / EN: thumbnail wrapped to receive the season watermark. */}
                  <span style={{ position: "relative", display: "block", width: 44, height: 44, flexShrink: 0 }}>
                    {a.icone ? <img src={a.icone} alt="" width={44} height={44} style={{ borderRadius: 4, display: "block", border: `1px solid ${couleurRarete(a)}` }} /> : <span style={{ display: "block", width: 44, height: 44 }} />}
                    {a.icone && <BadgeSaison db={db} itemHash={a.hash} taille={44} />}
                  </span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: "0.85rem" }}>{a.nom}</strong>
                  {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4), demande de l'utilisateur : quatre ICÔNES (type d'arme, élément, munitions, antichampion) à la place des mots « type · emplacement · élément » ; l'ARMATURE reste en texte ; la mention « Jamais obtenue » est retirée (redondante avec l'effet grisé, qui reste porté par `data-obtention`). EN: four icons replace the words; archetype stays; "never obtained" text removed. */}
                  <IconesArme db={db} itemHash={a.hash} type={a.type} slot={a.slot} texteAccessible={[a.type, LIBELLES_SLOT[a.slot], libelleElement(a.element)].filter(Boolean).join(", ")} />
                  {a.armature && <span data-armature="" style={{ display: "block", fontSize: "0.72rem", color: "#9a968a" }}>{a.armature}</span>}
                  {!a.collectibleHash && <span style={{ fontSize: "0.7rem", color: "#7d7a70" }}>Hors Collections du jeu</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {resultats.length > affichees && (
        <button onClick={() => setAffichees((n) => n + TAILLE_PAGE)} style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>Afficher plus ({resultats.length - affichees} restantes)</button>
      )}
      {ouverte && (
        <div onClick={() => setOuverte(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div role="dialog" aria-modal="true" aria-label={`Perks possibles de ${ouverte.nom}`} onClick={(e) => e.stopPropagation()} style={{ background: "#12151c", border: `1px solid ${couleurRarete(ouverte)}`, borderRadius: 10, padding: "1rem", width: "min(44rem, 94vw)", maxHeight: "86vh", overflow: "auto", color: "#e8e6df" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <strong style={{ fontSize: "1rem" }}>{ouverte.nom}</strong>
                {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - ICÔNE DE SAISON directement à droite du nom (demande de l'utilisateur). / EN: season icon right of the name. */}
                <IconeSaison db={db} itemHash={ouverte.hash} />
              </span>
              <button onClick={() => setOuverte(null)} aria-label="Fermer">✕</button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#9a968a", margin: "0.2rem 0 0.6rem" }}>{[ouverte.type, ouverte.rarete, LIBELLES_SLOT[ouverte.slot], libelleElement(ouverte.element), ouverte.armature].filter(Boolean).join(" · ")} — consultation seule</p>
            <label style={{ fontSize: "0.8rem", display: "inline-flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.6rem" }}>
              <input type="checkbox" checked={voirInutiles} onChange={(e) => setVoirInutiles(e.target.checked)} /> Afficher les perks inutiles
            </label>
            {/* FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - `npm run dev` seulement : décrit les colonnes et options de cette arme avec leurs champs bruts, pour apprendre comment le Manifest relie un perk à sa version améliorée (voir `diagnosticPerksArme.ts`). / EN: dev-only diagnostic button. */}
            {import.meta.env.DEV && (
              <div style={{ marginBottom: "0.6rem" }}>
                <button onClick={() => setDiagnostic(obtenirDiagnosticPerksArme(db!, ouverte.hash))} style={{ fontSize: "0.72rem" }}>🔍 Diagnostic des perks de cette arme (à copier à Claude)</button>
                {diagnostic && <textarea readOnly value={diagnostic} onFocus={(e) => e.currentTarget.select()} rows={10} style={{ display: "block", width: "100%", marginTop: "0.4rem", fontSize: "0.7rem", background: "#0d0f14", color: "#b7b3a8", border: "1px solid #3a3f4b" }} />}
              </div>
            )}
            {colonnes.length === 0 && <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucune option trouvée pour cette arme.</p>}
            {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.6) - la légende et les colonnes sont maintenant dessinées par le composant PARTAGÉ `ColonnesPerks` (même code que l'Inventaire de la Forge), sans changement d'affichage en consultation. / EN: ⚠️ CHANGED - columns now drawn by the shared component. */}
            <ColonnesPerks colonnes={colonnesAffichees} />
          </div>
        </div>
      )}
    </div>
  );
}

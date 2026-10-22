// FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4) : cette page s'appelle maintenant « LEGENDARIUM » (ancienne « Bibliothèque », demande de l'utilisateur) ; le fichier et l'identifiant interne gardent l'ancien nom.
// FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - Bibliothèque, outil annexe de consultation du lore (demande de l'utilisateur), affichée via le sélecteur placé sous le bloc Connexion.
// FR : ⚠️ CHANGÉ (21/10/2026, étape 2, chantier Legendarium) - le panneau « en construction » est REMPLACÉ par la bibliothèque de Lore (spécification §4, verrouillée) : trois zones (bandeau titre + recherche + indicateur de cache ; colonne latérale sections → livres ; zone de lecture avec précédent/suivant), palette « Parchemin / Hologramme » verrouillée, Grimoire D1 = REPLI STATIQUE EMBARQUÉ (6 livres / 834 cartes FR, hors-ligne — l'API D1 de Bungie ne sert plus de contenu, diagnostic du 21/10/2026), sections D2 depuis le Manifest via le cache existant. LECTURE PASSIVE : aucun état persistant, aucune écriture, aucun impact sur le scoring. Les props `pageCible` / `provenance` / `onRetourObjet` préparent l'étape 5 (lien profond depuis les fiches Détails + bouton de retour). Le module `grimoire` (et son JSON de 930 Ko) est importé DYNAMIQUEMENT : le bundle principal n'en porte pas le poids, le chunk n'est chargé qu'à l'ouverture de la page.
// EN: ⚠️ CHANGED - the "under construction" panel is REPLACED by the Lore library (spec §4, locked): three zones (header with title + search + cache indicator; sidebar sections → books; reading zone with previous/next), locked "Parchment / Hologram" palette, D1 Grimoire = EMBEDDED STATIC FALLBACK (6 books / 834 French cards, offline — Bungie's D1 API no longer serves content, diagnostic of 21/10/2026), D2 sections from the Manifest via the existing cache. PASSIVE READING: no persisted state, no writes, no scoring impact.

import { Database } from "sql.js";
import { useEffect, useMemo, useState } from "react";
import { SECTIONS, categoriesDeLegendes, livresDeSection, ordrePages, rechercherPages, trouverPage } from "../lib/legendarium/modele";
import type { DiagnosticLore } from "../lib/legendarium/modele";   // ⚠️ AJOUT (21/10/2026, suite 8) : type du diagnostic dev des Lores (bouton « Lire le Lore » absent)
import type { ResultatRechercheLore } from "../lib/legendarium/modele";
import { PALETTE, ereDeSection } from "../lib/legendarium/palette";
import type { DiagnosticGrimoire } from "../lib/legendarium/grimoire"; // ⚠️ type uniquement : le module (et son JSON de 930 Ko) est importé dynamiquement plus bas
import type { CategorieLore, LivreLore, PageLore, ProvenanceObjet, SectionLegendarium } from "../lib/legendarium/types";
import { urlIcone } from "../lib/manifest/search";   // ⚠️ AJOUT (21/10/2026, suite 10) : URL complète des couvertures de livres (chemin relatif Bungie → https://www.bungie.net…)

interface Props {
  db: Database | null;
  /** FR : lien profond vers une page (forme `lore:<hashLore>` ou `item:<hashObjet>`) — branché à l'étape 5 (fiches Détails). / EN: deep link to a page — wired at step 5 (Details sheets). */
  pageCible?: string;
  /** FR : provenance transitoire (page atteinte depuis une fiche Détails) → bouton de retour vers l'objet. Jamais persistée. / EN: transient origin (page reached from a Details sheet) → back button to the item. Never persisted. */
  provenance?: ProvenanceObjet;
  /** FR : action du bouton de retour vers l'objet (même mécanique que le bouton « Forge »). / EN: back-to-item action (same mechanics as the "Forge" button). */
  onRetourObjet?: () => void;
}

/** FR : bandeau supérieur (spécification §4 zone 1) : titre, recherche par mots-clés (toujours accessible), indicateur de cache. / EN: top banner (spec §4 zone 1): title, keyword search (always available), cache indicator. */
export function BandeauLegendarium({ motCle, onChangerMotCle, dbPresent, nbResultats }: { motCle: string; onChangerMotCle: (m: string) => void; dbPresent: boolean; nbResultats: number }) {
  return (
    <header data-bandeau-legendarium="">
      <h3><span>Legendarium</span></h3>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="search"
          aria-label="Rechercher dans le Lore"
          placeholder="Rechercher un mot-clé…"
          value={motCle}
          onChange={(e) => onChangerMotCle(e.target.value)}
          style={{ flex: "1 1 16rem", minWidth: "12rem", padding: "0.3rem 0.5rem", fontSize: "0.9rem", background: "#1a1a1a", color: "#e8e4d8", border: "1px solid #4a463c", borderRadius: "4px" }}
        />
        {motCle.trim() !== "" && <span style={{ fontSize: "0.8rem", color: "#7d7a70" }}>{nbResultats} résultat(s)</span>}
      </div>
      <p style={{ margin: "0.4rem 0 0.6rem", fontSize: "0.8rem", color: dbPresent ? "#7fd88f" : "#e0c080" }}>
        {dbPresent
          ? "✅ Manifest chargé : le Legendarium aura tout ce qu'il lui faut."
          : "⚠️ Manifest pas encore chargé. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest »."}
      </p>
    </header>
  );
}

/** FR : ⚠️ AJOUT (21/10/2026, suite 10) - hiérarchie EN JEU de la section « Légendes D2 » : catégorie → livre (avec sa COUVERTURE d'illustration et son nombre de pages) → pages. C'est la navigation de l'onglet Lore du jeu : la grille de couvertures de livres (à gauche) et les pages du livre ouvert. Les livres SANS couverture gardent un carré avec le titre (pas d'image cassée). / EN: ADDED - the IN-GAME hierarchy of the "Légendes D2" section: category → book (with its COVER illustration and page count) → pages. This is the game's Lore tab navigation: the book cover grid (left) and the open book's pages. Books WITHOUT a cover get a tile with the title (no broken image). */
export function ArbreCategories({ categories, pageId, onOuvrirLivre }: {
  categories: CategorieLore[];
  pageId: string | null;
  onOuvrirLivre: (l: LivreLore) => void;
}) {
  return (
    <div data-arbre-categories="">
      {categories.map((cat) => (
        <section key={cat.hash} data-categorie={cat.hash} style={{ marginBottom: "0.7rem" }}>
          <h4 data-categorie-titre="" style={{ margin: "0 0 0.3rem", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9a968a", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {cat.icone && <img src={urlIcone(cat.icone)} alt="" width={14} height={14} style={{ borderRadius: "2px" }} />}
            {cat.titre}
          </h4>
          <ul data-livres-categorie="" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem, 1fr))", gap: "0.45rem" }}>
            {cat.livres.map((l) => {
              const active = l.pages.some((p) => p.id === pageId);
              return (
                <li key={l.id}>
                  <button
                    data-livre={l.id}
                    aria-current={active ? "page" : undefined}
                    onClick={() => onOuvrirLivre(l)}
                    title={`${l.titre} — ${l.pages.length} page(s)`}
                    style={{ display: "block", width: "100%", background: "none", border: active ? "1px solid #e8e4d8" : "1px solid #4a463c", borderRadius: "4px", cursor: "pointer", padding: 0, overflow: "hidden", color: active ? "#e8e4d8" : "#9a968a", textAlign: "center" }}
                  >
                    {l.couvertureUrl ? (
                      <img data-couverture-livre="" src={l.couvertureUrl} alt={l.titre} width={104} height={58} style={{ display: "block", width: "100%", height: "auto", aspectRatio: "16 / 9", objectFit: "cover" }} loading="lazy" />
                    ) : (
                      <span data-couverture-absente="" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "16 / 9", fontSize: "0.68rem", padding: "0.25rem", background: "#1a1a1a" }}>{l.titre}</span>
                    )}
                    <span style={{ display: "block", fontSize: "0.72rem", padding: "0.2rem 0.25rem", lineHeight: 1.15 }}>{l.titre}</span>
                    <span style={{ display: "block", fontSize: "0.65rem", color: "#7d7a70", paddingBottom: "0.25rem" }}>{l.pages.length} page{l.pages.length > 1 ? "s" : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** FR : colonne latérale gauche (spécification §4 zone 2) : fil des quatre sections, puis les livres de la section active. / EN: left sidebar (spec §4 zone 2): the four sections, then the active section's books. */
export function ColonneSections({ section, livres, categories, pageId, grimoireEnChargement, onChangerSection, onOuvrirLivre }: {
  section: SectionLegendarium;
  livres: LivreLore[];
  /** FR : ⚠️ AJOUT (21/10/2026, suite 10) - hiérarchie catégorie → livre de la section « légendes » (liste vide = retombe sur la liste plate de livres, ex: repli Manifest vieilli). / EN: ADDED - the category → book hierarchy of the "légendes" section (empty = falls back to the flat book list, e.g. old Manifest fallback). */
  categories?: CategorieLore[];
  pageId: string | null;
  grimoireEnChargement: boolean;
  onChangerSection: (s: SectionLegendarium) => void;
  onOuvrirLivre: (l: LivreLore) => void;
}) {
  return (
    <nav data-colonne-sections="" aria-label="Sections et livres" style={{ flex: "0 1 16rem", minWidth: "12rem" }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <li key={s.id} style={{ marginBottom: "0.5rem" }}>
              <button
                data-section={s.id}
                aria-pressed={active}
                onClick={() => onChangerSection(s.id)}
                style={{ fontWeight: active ? 700 : 400, fontSize: "0.95rem", background: "none", border: "none", color: active ? "#e8e4d8" : "#9a968a", cursor: "pointer", padding: "0.15rem 0", textAlign: "left" }}
              >
                {s.libelle}
              </button>
              {active && (
                grimoireEnChargement && s.id === "grimoire" ? (
                  <p style={{ margin: "0.2rem 0 0", paddingLeft: "0.8rem", fontSize: "0.8rem", color: "#7d7a70" }}>Chargement du Grimoire…</p>
                ) : s.id === "legendes" && categories && categories.length > 0 ? (
                  // ⚠️ AJOUT (21/10/2026, suite 10) : hiérarchie EN JEU catégorie → livre (couvertures) → pages
                  <div style={{ margin: "0.2rem 0 0", paddingLeft: "0.8rem" }}>
                    <ArbreCategories categories={categories} pageId={pageId} onOuvrirLivre={onOuvrirLivre} />
                  </div>
                ) : livres.length > 0 ? (
                  <ul data-livres="" style={{ listStyle: "none", margin: "0.2rem 0 0", paddingLeft: "0.8rem" }}>
                    {livres.map((l) => (
                      <li key={l.id}>
                        <button
                          data-livre={l.id}
                          aria-current={l.pages.some((p) => p.id === pageId) ? "page" : undefined}
                          onClick={() => onOuvrirLivre(l)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.1rem 0", fontSize: "0.85rem", color: l.pages.some((p) => p.id === pageId) ? "#e8e4d8" : "#9a968a", textAlign: "left" }}
                        >
                          {l.titre} <span style={{ color: "#7d7a70" }}>({l.pages.length})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: "0.2rem 0 0", paddingLeft: "0.8rem", fontSize: "0.8rem", color: "#7d7a70" }}>Aucun contenu (Manifest pas encore chargé).</p>
                )
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** FR : zone de lecture centrale (spécification §4 zone 3) : œilleton du livre, titre de la page, sous-titre, libellé chronologique, texte, parcours inverse (objets porteurs), navigation précédent/suivant, bouton de retour vers l'objet (si provenance). Palette verrouillée appliquée ici. / EN: central reading zone (spec §4 zone 3): book eyebrow, page title, subtitle, chronological label, text, reverse path (carrier items), previous/next navigation, back-to-item button (if origin). The locked palette is applied here. */
export function ZoneLecture({ section, livre, page, idPrecedente, idSuivante, onOuvrirPage, provenance, onRetourObjet }: {
  section: SectionLegendarium;
  livre: LivreLore;
  page: PageLore;
  idPrecedente: string | null;
  idSuivante: string | null;
  onOuvrirPage: (id: string) => void;
  provenance?: ProvenanceObjet;
  onRetourObjet?: () => void;
}) {
  const ere = PALETTE[ereDeSection(section)];
  const styleBoutonNav: React.CSSProperties = { background: "none", border: `1px solid ${ere.bordure}`, borderRadius: "4px", color: ere.couleurTitre, cursor: "pointer", padding: "0.3rem 0.8rem", fontSize: "0.85rem" };
  return (
    <article
      data-zone-lecture=""
      data-ere={ereDeSection(section)}
      style={{ backgroundColor: ere.fondPage, border: `1px solid ${ere.bordure}`, boxShadow: ere.lueur ?? "none", borderRadius: "6px", padding: "1rem 1.2rem" }}
    >
      {provenance && onRetourObjet && (
        <button data-retour-objet="" onClick={onRetourObjet} style={{ ...styleBoutonNav, marginBottom: "0.6rem", fontSize: "0.8rem" }}>
          ← Retour vers {provenance.nomObjet}
        </button>
      )}
      {/* FR : ⚠️ AJOUT (21/10/2026, demande de l'utilisateur) - barre de navigation AU-DESSUS de la page (la même existe EN-DESSOUS) : Précédent · Suivant, centrée, hors du texte de Lore. / EN: ADDED - navigation bar ABOVE the page (the same exists BELOW): Previous · Next, centered, outside the lore text. */}
      <div data-nav-haut="" style={{ display: "flex", justifyContent: "center", gap: "0.6rem", marginBottom: "0.9rem" }}>
        <button data-nav-precedente="" disabled={!idPrecedente} onClick={() => idPrecedente && onOuvrirPage(idPrecedente)} style={styleBoutonNav}>← Précédent</button>
        <button data-nav-suivante="" disabled={!idSuivante} onClick={() => idSuivante && onOuvrirPage(idSuivante)} style={styleBoutonNav}>Suivant →</button>
      </div>
      {/* FR : ⚠️ AJOUT (21/10/2026, suite 10) - quand le livre a une catégorie (section Légendes D2, hiérarchie en jeu), l'œilleton l'affiche : « La Lumière · La Frontière sans foi ni loi ». / EN: ADDED - when the book has a category (D2 Légendes section, in-game hierarchy), the eyebrow shows it: "The Light · The Forsaken Shore". */}
      <p data-oeilleton="" style={{ color: ere.oeilleton, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.3rem" }}>{livre.categorie ? `${livre.categorie} · ${livre.titre}` : livre.titre}</p>
      {/* FR : ⚠️ AJOUT (21/10/2026, suite 10) - COUVERTURE du livre (illustration, comme l'écran d'ouverture d'un livre en jeu), affichée EN HAUT de la page quand le Manifest en porte une. / EN: ADDED - the book's COVER (illustration, like a book's opening screen in game), shown at the TOP of the page when the Manifest carries one. */}
      {livre.couvertureUrl && (
        <img data-couverture-page="" src={livre.couvertureUrl} alt={livre.titre} style={{ display: "block", width: "100%", maxHeight: "16rem", objectFit: "cover", borderRadius: "4px", margin: "0 0 0.7rem" }} loading="lazy" />
      )}
      <h4 style={{ fontFamily: ere.policeTitre, color: ere.couleurTitre, fontWeight: ere.graisseTitre, fontSize: "1.25rem", margin: "0 0 0.2rem" }}>{page.titre}</h4>
      {page.sousTitre && <p style={{ color: ere.oeilleton, fontStyle: "italic", fontSize: "0.9rem", margin: "0 0 0.4rem" }}>{page.sousTitre}</p>}
      {page.libelleChrono && <p style={{ color: ere.oeilleton, fontSize: "0.75rem", margin: "0 0 0.6rem" }}>{page.libelleChrono}</p>}
      <div data-texte-lore="" style={{ fontFamily: ere.policeCorps, color: ere.couleurCorps, lineHeight: 1.65, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{page.texte}</div>
      {page.porteurs && page.porteurs.length > 0 && (
        <div data-parcours-inverse="" style={{ marginTop: "0.8rem", borderTop: `1px solid ${ere.bordure}`, paddingTop: "0.5rem" }}>
          <p style={{ color: ere.oeilleton, fontSize: "0.75rem", margin: "0 0 0.3rem" }}>{page.porteurs.length > 1 ? "Objets portant ce Lore :" : "Objet portant ce Lore :"}</p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: ere.couleurCorps, fontSize: "0.85rem" }}>
            {page.porteurs.map((p) => <li key={p.hash}>{p.nom} — {p.emplacement}</li>)}
          </ul>
        </div>
      )}
      <div data-nav-bas="" style={{ display: "flex", justifyContent: "center", gap: "0.6rem", marginTop: "0.9rem" }}>
        <button data-nav-precedente="" disabled={!idPrecedente} onClick={() => idPrecedente && onOuvrirPage(idPrecedente)} style={styleBoutonNav}>← Précédent</button>
        <button data-nav-suivante="" disabled={!idSuivante} onClick={() => idSuivante && onOuvrirPage(idSuivante)} style={styleBoutonNav}>Suivant →</button>
      </div>
    </article>
  );
}

/** FR : résultats de la recherche par mots-clés (spécification §6) : liste cliquable, limitée à 50 affichés. / EN: keyword search results (spec §6): clickable list, capped at 50 shown. */
export function ResultatsRecherche({ motCle, resultats, onOuvrir }: { motCle: string; resultats: ResultatRechercheLore[]; onOuvrir: (r: ResultatRechercheLore) => void }) {
  if (resultats.length === 0) {
    return <p data-resultats-vides="" style={{ color: "#7d7a70", fontSize: "0.9rem" }}>Aucun résultat pour « {motCle.trim()} ».</p>;
  }
  const affiches = resultats.slice(0, 50);
  return (
    <div data-resultats-recherche="">
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {affiches.map((r) => (
          <li key={`${r.section}:${r.page.id}`} style={{ marginBottom: "0.3rem" }}>
            <button onClick={() => onOuvrir(r)} style={{ background: "none", border: "1px solid #4a463c", borderRadius: "4px", color: "#e8e4d8", cursor: "pointer", padding: "0.35rem 0.6rem", textAlign: "left", width: "100%" }}>
              <span style={{ display: "block", fontSize: "0.95rem" }}>{r.page.titre}</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#9a968a" }}>{SECTIONS.find((s) => s.id === r.section)?.libelle} · {(r.categorie ?? r.livre.categorie) ? `${r.categorie ?? r.livre.categorie} · ` : ""}{r.livre.titre}{r.page.sousTitre ? ` · ${r.page.sousTitre}` : ""}</span>
            </button>
          </li>
        ))}
      </ul>
      {resultats.length > affiches.length && (
        <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>… et {resultats.length - affiches.length} autre(s) résultat(s) — affinez le mot-clé.</p>
      )}
    </div>
  );
}

export default function Bibliotheque({ db, pageCible, provenance, onRetourObjet }: Props) {
  // FR : état EN MÉMOIRE UNIQUEMENT (lecture passive, aucune persistance) : section, page, mot-clé de recherche, livres du Grimoire D1 (chargés une fois à l'ouverture), diagnostic dev.
  const [section, setSection] = useState<SectionLegendarium>("grimoire");
  const [pageId, setPageId] = useState<string | null>(null);
  const [motCle, setMotCle] = useState("");
  const [livresGrimoire, setLivresGrimoire] = useState<LivreLore[] | null>(null);
  // FR : ⚠️ AJOUT (20/10/2026) - diagnostic dev du Grimoire D1. ⚠️ RÉSULTAT (21/10/2026) : HTTP 200, clé acceptée, 0 livre / 0 carte — Bungie ne sert plus de contenu Grimoire via l'API D1 ; le repli statique embarqué prend le relais. Le module est importé dynamiquement (le JSON de 930 Ko reste hors du bundle principal en production : ce bloc est du code mort en build).
  const [diag, setDiag] = useState<DiagnosticGrimoire | null>(null);
  const [diagOuvert, setDiagOuvert] = useState(false);
  // FR : ⚠️ AJOUT (21/10/2026, suite 8) - diagnostic dev des LORES D2 : l'utilisateur ne voit PAS le bouton « Lire le Lore » dans les fiches. Ce diagnostic vérifie avec le VRAI Manifest si la table `DestinyLoreDefinition` existe et si les objets portent un champ `lore`. Un seul balayage, dev uniquement. / EN: ADDED - dev diagnostic of D2 lores: the user does NOT see the "Read the Lore" button in sheets. Checks with the REAL Manifest whether the `DestinyLoreDefinition` table exists and whether items carry a `lore` field. One scan, dev only.
  const [diagLore, setDiagLore] = useState<DiagnosticLore | null>(null);

  // FR : le Grimoire D1 est lu UNE FOIS à l'ouverture (API legacy, repli statique embarqué si l'API ne convient pas — c'est le cas constaté). Import dynamique : le chunk (JSON de 930 Ko inclus) n'est chargé qu'ici, pas au démarrage de l'appli.
  useEffect(() => {
    let annule = false;
    import("../lib/legendarium/grimoire").then(({ lireGrimoire }) => lireGrimoire()).then((livres) => { if (!annule) setLivresGrimoire(livres); });
    return () => { annule = true; };
  }, []);

  // FR : diagnostic dev (import dynamique aussi : en production, `import.meta.env.DEV` est false, Rollup élimine ce bloc, le chunk diagnostic n'est jamais demandé).
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let annule = false;
    import("../lib/legendarium/grimoire").then(({ diagnostiquerGrimoire }) => diagnostiquerGrimoire()).then((d) => { if (!annule) setDiag(d); });
    return () => { annule = true; };
  }, []);

  // FR : ⚠️ AJOUT (21/10/2026, suite 8) - diagnostic dev des Lores D2 (bouton « Lire le Lore » absent des fiches) : un seul balayage de la table des objets, exécuté UNE FOIS quand le Manifest est prêt. En production, `import.meta.env.DEV` est false : Rollup élimine ce bloc.
  useEffect(() => {
    if (!import.meta.env.DEV || !db) return;
    let annule = false;
    import("../lib/legendarium/modele").then(({ diagnostiquerLore }) => diagnostiquerLore(db)).then((d) => { if (!annule) setDiagLore(d); });
    return () => { annule = true; };
  }, [db]);

  // FR : sections D2 depuis le Manifest (cache existant, via le modèle — index des porteurs en un seul balayage).
  const livresD2 = useMemo(() => {
    if (!db) return { legendes: [] as LivreLore[], objets: [] as LivreLore[], cosmetiques: [] as LivreLore[] };
    return {
      legendes: livresDeSection(db, "legendes"),
      objets: livresDeSection(db, "objets"),
      cosmetiques: livresDeSection(db, "cosmetiques"),
    };
  }, [db]);
  // FR : ⚠️ AJOUT (21/10/2026, suite 10) - hiérarchie catégorie → livre → pages de la section « légendes » (navigation en jeu, avec couvertures). Vide si l'arbre de présentation est absent : la colonne retombe alors sur la liste plate.
  const categoriesLegendes = useMemo(() => (db ? categoriesDeLegendes(db) : []), [db]);
  const livresParSection = useMemo(() => ({ grimoire: livresGrimoire ?? [], ...livresD2 }), [livresGrimoire, livresD2]);
  const livresSection = useMemo(() => (livresParSection[section] ?? []).filter((l) => l.pages.length > 0), [livresParSection, section]);

  // FR : lien profond (étape 5) : `pageCible` résolu dès que les livres sont prêts.
  useEffect(() => {
    if (!pageCible) return;
    const trouve = trouverPage(livresParSection, pageCible, db);
    if (trouve) {
      setSection(trouve.section);
      setPageId(trouve.page.id);
      setMotCle("");
    }
  }, [pageCible, livresParSection, db]);

  // FR : ⚠️ CHANGÉ (21/10/2026) - page affichée = ÉTAT DÉRIVÉ (pas d'effet) : la page sélectionnée si elle existe dans la section active, SINON la première page du premier livre. Le rendu serveur affiche donc déjà du contenu (testable), et le premier affichage n'est pas vide.
  const selection = useMemo(() => {
    if (motCle.trim() !== "") return null;
    if (pageId) {
      for (const livre of livresSection) {
        const p = livre.pages.find((x) => x.id === pageId);
        if (p) return { livre, page: p };
      }
    }
    const premier = livresSection[0];
    return premier ? { livre: premier, page: premier.pages[0] } : null;
  }, [pageId, livresSection, motCle]);
  const livreActif = selection?.livre ?? null;
  const pageActive = selection?.page ?? null;
  const ordre = useMemo(() => ordrePages(livresSection), [livresSection]);
  const indexPage = pageActive ? ordre.indexOf(pageActive.id) : -1;
  const idPrecedente = indexPage > 0 ? ordre[indexPage - 1] : null;
  const idSuivante = indexPage >= 0 && indexPage < ordre.length - 1 ? ordre[indexPage + 1] : null;
  const resultats = useMemo(() => (motCle.trim() !== "" ? rechercherPages(livresParSection, motCle) : []), [livresParSection, motCle]);

  const changerSection = (s: SectionLegendarium) => {
    setSection(s);
    setMotCle("");
    const livres = (livresParSection[s] ?? []).filter((l) => l.pages.length > 0);
    setPageId(livres.length > 0 ? livres[0].pages[0].id : null);
  };
  const ouvrirPage = (id: string) => { setMotCle(""); setPageId(id); };
  const ouvrirLivre = (livre: LivreLore) => { setMotCle(""); if (livre.pages.length > 0) setPageId(livre.pages[0].id); };
  const ouvrirResultat = (r: ResultatRechercheLore) => { setMotCle(""); setSection(r.section); setPageId(r.page.id); };

  const rechercheActive = motCle.trim() !== "";

  return (
    <div className="pilier-carte" data-vue-legendarium="">
      <BandeauLegendarium motCle={motCle} onChangerMotCle={setMotCle} dbPresent={Boolean(db)} nbResultats={resultats.length} />
      <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        <ColonneSections section={section} livres={livresSection} categories={categoriesLegendes} pageId={pageId} grimoireEnChargement={livresGrimoire === null} onChangerSection={changerSection} onOuvrirLivre={ouvrirLivre} />
        <div style={{ flex: "1 1 30rem", minWidth: "min(100%, 22rem)" }}>
          {rechercheActive ? (
            <ResultatsRecherche motCle={motCle} resultats={resultats} onOuvrir={ouvrirResultat} />
          ) : pageActive && livreActif ? (
            <ZoneLecture section={section} livre={livreActif} page={pageActive} idPrecedente={idPrecedente} idSuivante={idSuivante} onOuvrirPage={ouvrirPage} provenance={provenance} onRetourObjet={onRetourObjet} />
          ) : (
            <div data-accueil-legendarium="" style={{ padding: "1rem", color: "#7d7a70", fontSize: "0.9rem" }}>
              <p style={{ margin: "0 0 0.3rem" }}>Bienvenue dans le Legendarium.</p>
              <p style={{ margin: 0 }}>Choisissez une section puis un livre dans la colonne de gauche pour commencer la lecture.</p>
            </div>
          )}
        </div>
      </div>
      {import.meta.env.DEV && diag && (
        <details data-diagnostic-grimoire="" style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#7d7a70" }} open={diagOuvert} onToggle={(e) => setDiagOuvert((e.target as HTMLDetailsElement).open)}>
          <summary style={{ cursor: "pointer" }}>🔍 Diagnostic Grimoire D1 (dev, à copier à Claude) — {diag.contenuVide ? `⚠️ API vide (HTTP ${diag.statutHttp}, clé OK) → repli statique : ${diag.repliLivres} livre(s), ${diag.repliCartes} carte(s)` : diag.ok ? `✅ ${diag.livres} livre(s), ${diag.cartes} carte(s) de l'API` : diag.erreurBungie ? `❌ ${diag.erreurBungie}` : diag.erreur ? `❌ ${diag.erreur}` : diag.clePresente ? `⏳ HTTP ${diag.statutHttp}` : "❌ aucune clé"}</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem" }}>{JSON.stringify(diag, null, 2)}</pre>
        </details>
      )}
      {/* FR : ⚠️ AJOUT (21/10/2026, suite 8) - diagnostic dev des LORES D2 : le bouton « Lire le Lore » n'apparaît pas dans les fiches Détails de l'utilisateur. Ce panneau dit si la table `DestinyLoreDefinition` existe, combien de Lores elle contient, et combien d'objets portent un `lore` lisible. À copier à Claude. / EN: ADDED - dev diagnostic of D2 lores: the "Read the Lore" button doesn't show in the user's Details sheets. This panel tells whether the `DestinyLoreDefinition` table exists, how many lores it holds, and how many items carry a readable `lore`. Copy to Claude. */}
      {import.meta.env.DEV && diagLore && (
        <details data-diagnostic-lore="" style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#7d7a70" }}>
          <summary style={{ cursor: "pointer" }}>🔍 Diagnostic Lores D2 (dev, à copier à Claude) — {diagLore.erreur ? `❌ ${diagLore.erreur}` : !diagLore.tableLoreExiste ? `❌ table DestinyLoreDefinition ABSENTE` : diagLore.nbLores === 0 ? `⚠️ table DestinyLoreDefinition VIDE` : diagLore.nbObjetsAvecLoreLisible === 0 ? `⚠️ ${diagLore.nbLores} Lore(s) mais AUCUN objet avec un lore lisible (sur ${diagLore.nbObjets} objets)` : `✅ ${diagLore.nbLores} Lore(s) dont ${diagLore.nbLoresAvecCorps} avec corps ; ${diagLore.nbObjetsAvecLoreLisible} objet(s) avec un lore lisible`}</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem" }}>{JSON.stringify(diagLore, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

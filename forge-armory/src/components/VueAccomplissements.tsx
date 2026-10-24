// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - PAGE « ACCOMPLISSEMENTS » du compte, en REMPLACEMENT du tiroir latéral : le bouton « Accomplissements » du bloc Connexion ouvre désormais cette page (le bloc Connexion et le sélecteur de vues restent affichés). ⚠️ Cette page N'EST PAS un onglet du sélecteur de vues (retour utilisateur : « les boutons apparaissent en double »). Le tiroir « Solo sans mourir » du Build Analyzer est CONSERVÉ tel quel (état interne, plus de navigation croisée).
// ⚠️ CHANGÉ (22/10/2026, retour utilisateur) : « Accomplissement ne doit pas afficher la Vitrine Solo sans mourir : elle affichera plus tard tous les triomphes obtenus et à obtenir. » — la vitrine `VitrineSoloFlawless` est RETIRÉE de cette page (elle reste UNIQUEMENT dans le tiroir « Solo sans mourir » du Build Analyzer, `PanneauTriomphes`).
// ⚠️ CHANGÉ (23/10/2026, TODO n°23, branche draft-update-triomphes) : la page affiche désormais LES TRIOMPHES DU COMPTE, PAR SCEAU (décision de l'utilisateur : « Je préfère la proposition par Sceau. Moins bordélique. ») : compteur global en tête (« X / Y triomphes obtenus · score total »), recherche avancée (guillemets "phrase exacte", +obligatoire, -exclu, case « Aa »), sceaux REPLIÉS PAR DÉFAUT, tri par progression ou par nom. La vitrine « Solo sans mourir » reste UNIQUEMENT dans le tiroir.
// ⚠️ CHANGÉ (23/10/2026, retour utilisateur, après validation du correctif) : les sceaux s'affichent en CARTES dans une GRILLE (plusieurs par ligne) ; la barre de progression est SOUS la carte et le pourcentage EN-DESSOUS ; le clic déplie les triomphes DANS la carte.
// EN: CHANGED (user request, after the fix was validated): the seals show as CARDS in a GRID (several per row); the progress bar is BELOW the card and the percentage BELOW it; clicking unfolds the triumphs INSIDE the card.
// ⚠️ CHANGÉ (23/10/2026, retour utilisateur : « Les cartes de Sceaux doivent être des carrés identiques en taille. Attention aux alignements. ») : la zone cliquable de chaque carte est un CARRÉ (`aspect-ratio: 1 / 1`) de taille identique pour TOUTES les cartes ; le nom est tronqué à 2 lignes max (ellipsis, infobulle au survol) ; la barre + le pourcentage occupent une zone de hauteur Fixe sous le carré — toutes les cartes ont la MÊME largeur et la MÊME hauteur totale.
// EN: CHANGED (user request: "the Seal cards must be square, identical in size. Watch the alignments."): the clickable area of each card is a SQUARE (`aspect-ratio: 1 / 1`) of identical size for ALL cards; the name is clamped to 2 lines max (ellipsis, tooltip on hover); the bar + the percentage sit in a FIXED-height zone under the square — every card has the SAME width and the SAME total height.
// EN: ⚠️ ADDED - the account "Accomplishments" PAGE, replacing the lateral drawer. CHANGED - the "Solo Flawless" showcase is removed from this page (it stays only in the drawer). CHANGED - the page now shows the ACCOUNT TRIUMPHS, BY SEAL (user decision): global counter on top, advanced search (quotes, +required, -excluded, "Aa" case toggle), seals COLLAPSED BY DEFAULT, sort by progress or name.

import { useMemo, useState } from "react";
import type { Database } from "sql.js";
import IconeCrane from "./IconeCrane";
import { regrouperParSceau, compteursGlobaux, filtrerSceaux, trierSceaux, type Sceau, type TriompheSceau, type TriSceaux } from "../lib/bungie/sceaux";

interface Props {
  /** FR : profil complet renvoyé par l'API (composant 900 inclus, records du compte). null tant qu'il n'est pas chargé. / EN: full profile from the API (component 900 included, account records). null until loaded. */
  profil: unknown | null;
  /** FR : base du Manifest (noms/descriptions FR des triomphes et des sceaux). null = non chargé. / EN: Manifest database (FR names/descriptions of triumphs and seals). null = not loaded. */
  db: Database | null;
}

/** FR : formate un nombre avec les séparateurs français (espace insécable fine, comme `toLocaleString("fr-FR")`). / EN: formats a number with French separators (thin no-break space, like `toLocaleString("fr-FR")`). */
function formaterNombre(n: number): string {
  return n.toLocaleString("fr-FR");
}

/** FR : barre de progression d'un sceau (accomplis / total), PLEINE LARGEUR de la carte, avec le POURCENTAGE EN-DESSOUS de la barre. / EN: a seal's progress bar (earned / total), FULL card width, with the PERCENTAGE BELOW the bar. */
function BarreProgression({ accomplis, total }: { accomplis: number; total: number }) {
  const ratio = total === 0 ? 0 : accomplis / total;
  const pct = Math.round(ratio * 100);
  return (
    <span data-barre-progression="" data-pourcentage={pct} style={{ display: "block", width: "100%" }}>
      <span data-barre-piste="" style={{ display: "block", width: "100%", height: "5px", background: "#2a2e38", borderRadius: 3, overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: ratio >= 1 ? "#7fd88f" : "#c8a24a" }} />
      </span>
      <span data-pourcentage-texte="" style={{ display: "block", fontSize: "0.7rem", color: "#b7b3a8", textAlign: "center", marginTop: "0.15rem" }}>
        {pct} %
      </span>
    </span>
  );
}

/** FR : UNE LIGNE de triomphe : icône, nom, description, progression des objectifs, badge ✅/⬜, score. / EN: ONE triumph row: icon, name, description, objectives progress, ✅/⬜ badge, score. */
function LigneTriomphe({ t }: { t: TriompheSceau }) {
  const objectifsTexte = t.objectifs
    .map((o) => (o.completionValue !== undefined ? `${formaterNombre(o.progression)} / ${formaterNombre(o.completionValue)}` : formaterNombre(o.progression)))
    .join(" · ");
  return (
    <li data-triomphe={t.hash} data-accompli={t.accompli ? "oui" : "non"} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "0.3rem 0", opacity: t.accompli ? 1 : 0.75, listStyle: "none" }}>
      {t.icone && <img src={t.icone} alt="" width={24} height={24} style={{ borderRadius: 3, flexShrink: 0, filter: t.accompli ? "none" : "grayscale(1)" }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline", flexWrap: "wrap" }}>
          <strong style={{ fontSize: "0.85rem", color: t.accompli ? "#e8e6df" : "#b7b3a8" }}>
            {t.accompli ? "✅ " : "⬜ "}{t.nom}
          </strong>
          {t.score !== undefined && <span style={{ fontSize: "0.7rem", color: "#7d7a70" }}>{formaterNombre(t.score)} pts</span>}
        </div>
        {t.description && <div style={{ fontSize: "0.75rem", color: "#9a968a" }}>{t.description}</div>}
        {objectifsTexte && !t.accompli && <div style={{ fontSize: "0.7rem", color: "#7d7a70" }}>{objectifsTexte}</div>}
      </div>
    </li>
  );
}

/** FR : ⚠️ CHANGÉ (23/10/2026, retour utilisateur : « Affiche les cartes des Sceaux et met la barre de progression en-dessous, le pourcentage de complétion sous la barre «) - UNE CARTE de sceau, repliée par défaut : icône + nom + titre du sceau CENTRÉS (bouton cliquable), barre de progression EN-DESSOUS de la carte (pleine largeur), pourcentage EN-DESSOUS de la barre. Le clic déplie les triomphes DANS la carte (panneau sous la barre) : la carte grandit verticalement au lieu d'empiler des sections pleine largeur. / EN: CHANGED (user request: "show the Seals as cards and put the progress bar below, the completion percentage under the bar") - ONE seal CARD, collapsed by default: icon + name + seal title CENTERED (clickable button), progress bar BELOW the card (full width), percentage BELOW the bar. Clicking unfolds the triumphs INSIDE the card (panel under the bar): the card grows vertically instead of stacking full-width sections. ⚠️ CHANGÉ (23/10/2026, retour utilisateur : « carrés identiques en taille, attention aux alignements ») : le bouton est un CARRÉ (`aspect-ratio: 1 / 1`, `box-sizing: border-box`) — taille identique pour toutes les cartes ; la zone barre + pourcentage est de hauteur Fixe (`flex-shrink: 0`) sous le carré. / EN: CHANGED (user request: "square, identical in size, watch the alignments"): the button is a SQUARE (`aspect-ratio: 1 / 1`, `box-sizing: border-box`) — identical size for all cards; the bar + percentage zone has a FIXED height (`flex-shrink: 0`) under the square. */
function BlocSceau({ sceau }: { sceau: Sceau }) {
  const [ouvert, setOuvert] = useState(false);
  const accomplis = sceau.triomphes.filter((t) => t.accompli).length;
  const complet = sceau.triomphes.length > 0 && accomplis === sceau.triomphes.length;
  return (
    <section data-sceau={sceau.hash} style={{ border: "1px solid #2a2e38", borderRadius: 6, background: "#12141a", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <button
        data-sceau-titre=""
        data-sceau-replier=""
        aria-expanded={ouvert}
        title={ouvert ? "Replier les triomphes" : "Déplier les triomphes"}
        onClick={() => setOuvert((v) => !v)}
        style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: complet ? "#7fd88f" : "#e8e6df", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.35rem", background: "none", border: "none", cursor: "pointer", padding: "0.5rem", textAlign: "center", width: "100%", aspectRatio: "1 / 1", overflow: "hidden", boxSizing: "border-box" }}
      >
        {sceau.icone && <img src={sceau.icone} alt="" width={32} height={32} style={{ borderRadius: 4, flexShrink: 0 }} />}
        <span style={{ lineHeight: 1.25, maxWidth: "100%", overflow: "hidden" }}>
          <span data-sceau-nom="" title={sceau.nom} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", textAlign: "center", maxWidth: "100%" }}>{sceau.nom}</span>
          {sceau.titre && <span title={`titre « ${sceau.titre} »`} style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 400, fontSize: "0.7rem", color: sceau.titreDebloque === true ? "#7fd88f" : "#7d7a70" }}>titre « {sceau.titre} »{sceau.titreDebloque === true ? " débloqué" : ""}</span>}
        </span>
      </button>
      {/* FR : la barre de progression est SOUS la carte, le pourcentage EN-DESSOUS (demande utilisateur 23/10 : plus de sceaux par ligne, moins de hauteur). / EN: the progress bar is BELOW the card, the percentage BELOW the bar (user request 23/10: more seals per row, less height). */}
      <div data-zone-progression="" style={{ padding: "0 0.5rem 0.45rem", marginTop: "auto", flexShrink: 0 }}>
        <BarreProgression accomplis={accomplis} total={sceau.triomphes.length} />
      </div>
      {ouvert && (
        <ul data-triomphes-sceau="" style={{ margin: "0", padding: "0.4rem 0.6rem 0.6rem", borderTop: "1px solid #2a2e38", maxHeight: "16rem", overflowY: "auto" }}>
          {sceau.triomphes.map((t) => <LigneTriomphe key={t.hash} t={t} />)}
        </ul>
      )}
    </section>
  );
}

export default function VueAccomplissements({ profil, db }: Props) {
  // FR : état EN MÉMOIRE UNIQUEMENT (recherche, casse, tri, sceaux ouverts) — aucune persistance, lecture passive.
  // EN: state IN MEMORY ONLY (search, case, sort, open seals) — no persistence, passive reading.
  const [motCle, setMotCle] = useState("");
  const [respecterCasse, setRespecterCasse] = useState(false);
  const [tri, setTri] = useState<TriSceaux>("progression");

  const sceaux = useMemo(() => regrouperParSceau(db, profil), [db, profil]);
  const compteurs = useMemo(() => compteursGlobaux(sceaux), [sceaux]);
  const sceauxFiltres = useMemo(() => trierSceaux(filtrerSceaux(sceaux, motCle, { respecterCasse }), tri), [sceaux, motCle, respecterCasse, tri]);

  return (
    <div className="pilier-carte" role="region" aria-label="Accomplissements">
      <h3>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <IconeCrane taille={18} />
          Accomplissements
        </span>
      </h3>
      <p style={{ fontSize: "0.8rem", color: "#b7b3a8", margin: "0 0 0.75rem" }}>
        Vos Triomphes de compte, par sceau.
      </p>

      {/* FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - COMPTEUR GLOBAL en tête : « X / Y triomphes obtenus · score total ». Le score est la somme des points (`completionInfo.ScoreValue`) des triomphes OBTENUS ; « non disponible » s'il est inconnu (jamais estimé). / EN: global counter on top: "X / Y triumphs earned · total score". The score sums the EARNED triumphs' points; "non disponible" when unknown (never guessed). */}
      {sceaux.length > 0 && (
        <p data-compteur-global="" style={{ fontSize: "0.85rem", color: "#b7b3a8", margin: "0 0 0.75rem" }}>
          <strong style={{ color: "#e8e6df" }}>{formaterNombre(compteurs.obtenus)} / {formaterNombre(compteurs.total)}</strong> triomphes obtenus
          {" · "}
          score total : <strong style={{ color: "#e8e6df" }}>{compteurs.score !== undefined ? formaterNombre(compteurs.score) : "non disponible"}</strong>
        </p>
      )}

      {/* FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - RECHERCHE AVANCÉE (même syntaxe que le Legendarium : guillemets "phrase exacte" / « », +obligatoire, -exclu) + case « Aa » (respecter la casse, désactivée par défaut) + TRI (progression / nom). / EN: ADVANCED SEARCH (same syntax as the Legendarium: quotes "exact phrase" / « », +required, -excluded) + "Aa" case toggle + SORT (progress / name). */}
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <input
          type="search"
          aria-label="Rechercher un triomphe"
          placeholder='Rechercher… (+obligatoire, -exclu, "phrase exacte")'
          value={motCle}
          onChange={(e) => setMotCle(e.target.value)}
          style={{ flex: "1 1 16rem", minWidth: "12rem", padding: "0.3rem 0.5rem", fontSize: "0.9rem", background: "#1a1a1a", color: "#e8e4d8", border: "1px solid #4a463c", borderRadius: "4px" }}
        />
        <label title="Respecter la casse (Aa) — sinon la recherche ignore majuscules/minuscules" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "#9a968a", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
          <input type="checkbox" data-respecter-casse="" checked={respecterCasse} onChange={(e) => setRespecterCasse(e.target.checked)} />
          <span style={{ fontWeight: 600 }}>Aa</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#9a968a", whiteSpace: "nowrap" }}>
          Trier par
          <select data-tri-sceaux="" value={tri} onChange={(e) => setTri(e.target.value as TriSceaux)} style={{ fontSize: "0.8rem", background: "#1a1a1a", color: "#e8e4d8", border: "1px solid #4a463c", borderRadius: "4px", padding: "0.15rem 0.3rem" }}>
            <option value="progression">Progression</option>
            <option value="nom">Nom</option>
          </select>
        </label>
        {motCle.trim() !== "" && <span style={{ fontSize: "0.8rem", color: "#7d7a70" }}>{sceauxFiltres.length} sceau(x)</span>}
      </div>

      {/* FR : ⚠️ RÈGLE DU PROJET : une donnée manquante s'affiche « non disponible », jamais estimée. / EN: PROJECT RULE: missing data shows "non disponible", never guessed. */}
      {!profil && (
        <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>
          Connectez-vous pour afficher vos Triomphes de compte.
        </p>
      )}
      {profil != null && !db && (
        <p style={{ fontSize: "0.8rem", color: "#e0c080" }}>
          ⚠️ Manifest non chargé : les noms des triomphes sont non disponibles. Chargez-le depuis Build Analyzer, dans le bloc « Recherche dans le Manifest ».
        </p>
      )}
      {profil != null && db && sceaux.length === 0 && (
        <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>
          Aucun sceau trouvé — non disponible.
        </p>
      )}
      {profil != null && db && sceaux.length > 0 && sceauxFiltres.length === 0 && (
        <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>
          Aucun sceau ne correspond à « {motCle} ».
        </p>
      )}

      {/* FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - les sceaux, REPLIÉS PAR DÉFAUT (comme le Legendarium). ⚠️ CHANGÉ (23/10/2026, retour utilisateur) : ce sont des CARTES CARRÉES IDENTIQUES en GRILLE (plusieurs par ligne, moins de hauteur verticale, alignements respectés) ; clic sur une carte = déplier ses triomphes DANS la carte. La vitrine « Solo sans mourir » N'EST PAS ici (elle reste dans le tiroir du Build Analyzer). / EN: the seals, COLLAPSED BY DEFAULT (like the Legendarium). CHANGED: they are SQUARE IDENTICAL CARDS in a GRID (several per row, less vertical height, alignments respected); click a card = unfold its triumphs INSIDE the card. The "Solo Flawless" showcase is NOT here (it stays in the drawer). */}
      {sceauxFiltres.length > 0 && (
        <div data-liste-sceaux="" data-grille-sceaux="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))", gap: "0.6rem", alignItems: "start" }}>
          {sceauxFiltres.map((sceau) => <BlocSceau key={sceau.hash} sceau={sceau} />)}
        </div>
      )}
    </div>
  );
}

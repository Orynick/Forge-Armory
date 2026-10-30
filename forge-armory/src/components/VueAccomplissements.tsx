// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - PAGE « ACCOMPLISSEMENTS » du compte, en REMPLACEMENT du tiroir latéral : le bouton « Accomplissements » du bloc Connexion ouvre désormais cette page (le bloc Connexion et le sélecteur de vues restent affichés). ⚠️ Cette page N'EST PAS un onglet du sélecteur de vues (retour utilisateur : « les boutons apparaissent en double »). Le tiroir « Solo sans mourir » du Build Analyzer est CONSERVÉ tel quel (état interne, plus de navigation croisée).
// ⚠️ CHANGÉ (22/10/2026, retour utilisateur) : « Accomplissement ne doit pas afficher la Vitrine Solo sans mourir : elle affichera plus tard tous les triomphes obtenus et à obtenir. » — la vitrine `VitrineSoloFlawless` est RETIRÉE de cette page (elle reste UNIQUEMENT dans le tiroir « Solo sans mourir » du Build Analyzer, `PanneauTriomphes`).
// ⚠️ CHANGÉ (23/10/2026, TODO n°23, branche draft-update-triomphes) : la page affiche désormais LES TRIOMPHES DU COMPTE, PAR SCEAU (décision de l'utilisateur : « Je préfère la proposition par Sceau. Moins bordélique. ») : compteur global en tête (« X / Y triomphes obtenus · score total »), recherche avancée (guillemets "phrase exacte", +obligatoire, -exclu, case « Aa »), sceaux REPLIÉS PAR DÉFAUT, tri par progression ou par nom. La vitrine « Solo sans mourir » reste UNIQUEMENT dans le tiroir.
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

/** FR : barre de progression d'un sceau (accomplis / total), style sobre. / EN: a seal's progress bar (earned / total), sober style. */
function BarreProgression({ accomplis, total }: { accomplis: number; total: number }) {
  const ratio = total === 0 ? 0 : accomplis / total;
  return (
    <span data-barre-progression="" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flex: "0 0 auto" }}>
      <span style={{ width: "6rem", height: "6px", background: "#2a2e38", borderRadius: 3, overflow: "hidden", display: "inline-block" }}>
        <span style={{ display: "block", height: "100%", width: `${Math.round(ratio * 100)}%`, background: ratio >= 1 ? "#7fd88f" : "#c8a24a" }} />
      </span>
      <span style={{ fontSize: "0.75rem", color: "#b7b3a8" }}>
        {accomplis}/{total} ({Math.round(ratio * 100)} %)
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

/** FR : UN SCEAU repliable (replié par défaut, comme le Legendarium) : titre + icône + barre de progression + compteur, titre du sceau débloqué à 100 %. / EN: ONE COLLAPSIBLE seal (collapsed by default, like the Legendarium): title + icon + progress bar + counter, seal title unlocked at 100%. */
function BlocSceau({ sceau }: { sceau: Sceau }) {
  const [ouvert, setOuvert] = useState(false);
  const accomplis = sceau.triomphes.filter((t) => t.accompli).length;
  const complet = sceau.triomphes.length > 0 && accomplis === sceau.triomphes.length;
  return (
    <section data-sceau={sceau.hash} style={{ marginBottom: "0.5rem", border: "1px solid #2a2e38", borderRadius: 6, background: "#12141a" }}>
      <button
        data-sceau-titre=""
        data-sceau-replier=""
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
        style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: complet ? "#7fd88f" : "#e8e6df", display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer", padding: "0.45rem 0.6rem", textAlign: "left", width: "100%", flexWrap: "wrap" }}
      >
        <span aria-hidden="true" style={{ fontSize: "0.65rem", width: "0.8rem", display: "inline-block", flexShrink: 0 }}>{ouvert ? "▾" : "▸"}</span>
        {sceau.icone && <img src={sceau.icone} alt="" width={18} height={18} style={{ borderRadius: 3, flexShrink: 0 }} />}
        <span style={{ flex: "1 1 auto", minWidth: "8rem" }}>
          {sceau.nom}
          {sceau.titre && <span style={{ fontWeight: 400, fontSize: "0.75rem", color: sceau.titreDebloque === true ? "#7fd88f" : "#7d7a70" }}> — titre « {sceau.titre} »{sceau.titreDebloque === true ? " débloqué" : ""}</span>}
        </span>
        <BarreProgression accomplis={accomplis} total={sceau.triomphes.length} />
      </button>
      {ouvert && (
        <ul data-triomphes-sceau="" style={{ margin: "0", padding: "0.2rem 0.6rem 0.5rem 2.4rem" }}>
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

      {/* FR : ⚠️ AJOUT (23/10/2026, TODO n°23) - les sceaux, REPLIÉS PAR DÉFAUT (comme le Legendarium). La vitrine « Solo sans mourir » N'EST PAS ici (elle reste dans le tiroir du Build Analyzer). / EN: the seals, COLLAPSED BY DEFAULT (like the Legendarium). The "Solo Flawless" showcase is NOT here (it stays in the drawer). */}
      {sceauxFiltres.length > 0 && (
        <div data-liste-sceaux="">
          {sceauxFiltres.map((sceau) => <BlocSceau key={sceau.hash} sceau={sceau} />)}
        </div>
      )}
    </div>
  );
}

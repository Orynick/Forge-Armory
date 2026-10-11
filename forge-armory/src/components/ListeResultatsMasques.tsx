// FR : ⚠️ AJOUT (06/10/2026, v0.3.2) - liste des résultats de Recherche MASQUÉS par défaut (quêtes, ornements, packs, harmonisation, triomphes, objets factices). Constat du 06/10/2026 : la vraie arme
// « Tueur de souhaits » n'apparaissait pas en Recherche, sans qu'on sache si elle était écartée ni pourquoi. Désormais la Recherche dit combien de résultats elle masque et lesquels, avec leur catégorie :
// plus rien ne disparaît en silence. Présentation seulement : aucune logique de recherche ici.
// EN: ⚠️ ADDED - lists the search results HIDDEN by default, with their category, so nothing disappears silently.

import { CategorieResultat } from "../lib/manifest/search";

export interface ResultatMasque {
  hash: number;
  nom: string;
  icone?: string;
  categorie: CategorieResultat;
  description?: string;
}

const MAX = 30;

export default function ListeResultatsMasques({
  resultats,
  libelleCategorie,
  afficherHash,
}: {
  resultats: ResultatMasque[];
  /** FR : libellé court d'une catégorie (sans la mention « masqué par défaut »). / EN: short category label. */
  libelleCategorie: (c: CategorieResultat) => string;
  /** FR : affiche le numéro (hash) de l'objet : utile pour le diagnostic. / EN: shows the item hash. */
  afficherHash: boolean;
}) {
  if (resultats.length === 0) return null;
  return (
    <details style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "#b7b3a8" }} data-masques="">
      <summary style={{ cursor: "pointer" }}>
        🙈 {resultats.length} résultat{resultats.length > 1 ? "s" : ""} masqué{resultats.length > 1 ? "s" : ""} par défaut (quêtes, ornements, packs, objets factices…)
      </summary>
      <div style={{ color: "#7d7a70", margin: "0.3rem 0" }}>
        Ces objets correspondent à votre recherche mais ne sont pas de vrais objets de build. Pour les voir comme les autres résultats, choisissez leur catégorie dans le menu ci-dessus.
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {resultats.slice(0, MAX).map((r) => (
          <li key={`${r.hash}`} style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.2rem 0", borderTop: "1px solid #1c2029" }} data-masque={r.hash}>
            {r.icone ? <img src={r.icone} alt="" width={24} height={24} style={{ borderRadius: 3, flex: "0 0 auto" }} /> : <span style={{ width: 24, flex: "0 0 auto" }} />}
            <span style={{ color: "#e8e6df" }}>{r.nom}</span>
            <span style={{ color: "#7aa2f7" }}>{libelleCategorie(r.categorie)}</span>
            {afficherHash && <span style={{ color: "#5a5f6b", fontFamily: "monospace", fontSize: "0.68rem" }}>objet {r.hash}</span>}
          </li>
        ))}
      </ul>
      {resultats.length > MAX && <div style={{ color: "#7d7a70" }}>… et {resultats.length - MAX} autre{resultats.length - MAX > 1 ? "s" : ""}.</div>}
    </details>
  );
}

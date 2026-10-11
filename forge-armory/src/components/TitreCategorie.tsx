// FR : ⚠️ CHANGÉ (07/10/2026, v0.3.17) - la liste passe à HUIT titres : « Connexion à Bungie » et « Recherche dans le Manifest » (blocs NON repliables : versions sans losange) y entrent ; la ligne « Contexte du Build » au-dessus de Mon Build disparaît (ses boutons sont
// maintenant dans « Mon Build » ; son visuel reste livré dans `public/assets/titres/` mais l'appli ne l'utilise plus).
// FR : ⚠️ RÉÉCRIT (07/10/2026, v0.3.16) - TITRES FIXES illustrés (logo + plaque + titre + ligne, un seul dessin) : les HUIT titres de la famille `titres` de l'archive « forge-armory-app-assets » : « 0. Contexte du Build », la ligne « Contexte du Build » au-dessus
// de Mon Build, les cinq cartes de résultat (1 à 5) et le Score global. Ce ne sont PAS des blocs repliables et pas des boutons : un seul état, aucun clic. Les SEPT titres de blocs repliables (Connexion, Manifest, Mon Inventaire, Doctrine, Mon Build,
// Artefact, Sauvegarde) sont dans `TitreRepliable.tsx` : ils ont deux états (replié « + », déplié « − »). Règles de l'archive respectées : même cadre (7505 × 1024) donc même hauteur pour toute la famille, la largeur suit ; logo + plaque + titre = un seul
// élément ; titres en tracés (aucune police). Le texte du titre étant DANS l'image, il est repris en `alt` : les libellés ci-dessous sont ceux de l'utilisateur, avec un « B » majuscule à « Build » dans tous les titres qui le contiennent (choix du 07/10/2026,
// déduit de sa remarque sur « Sauvegarde et partage du Build » ; le catalogue écrit « Contexte du build » en minuscule : question posée). Fichiers : par le catalogue (`urlVisuel`, `titres.<clé>.repos`), jamais par un chemin écrit ici.
// EN: ⚠️ REWRITTEN - the EIGHT static illustrated titles (context ×2, result cards 1-5, global score); the seven collapsible-block titles live in TitreRepliable.tsx.

import { urlVisuel } from "../lib/visuelsForge";

export type CategorieTitre = "connexion" | "manifest" | "contexte-0" | "pilier-1" | "pilier-2" | "pilier-3" | "pilier-4" | "pilier-5" | "score-global";

/** FR : clé de catalogue de chaque titre (celle des cartes de résultat garde le nom de l'archive : « 1-element-doctrine »…). Exportée pour le test des visuels. / EN: catalogue key of each title; exported for the visuals test. */
export const CLES_CATALOGUE_TITRES: Record<CategorieTitre, string> = {
  connexion: "connexion",   // ⚠️ AJOUT (07/10/2026) : versions SANS losange, dans le complément du catalogue (data/forge/forgeAssetsComplement.ts)
  manifest: "manifest",
  "contexte-0": "contexte-0",
  // ⚠️ RENUMÉROTÉ (08/10/2026) : « pilier-N » = le pilier N du Scoring. Les fichiers portent le bon numéro (`titre-3-artefact.svg` affiche « 3. ») ; ils sont dans le COMPLÉMENT du catalogue (data/forge/forgeAssetsComplement.ts).
  "pilier-1": "1-doctrine-elementaire",
  "pilier-2": "2-armes-armures",
  "pilier-3": "3-artefact",
  "pilier-4": "4-effets-build",
  "pilier-5": "5-statistiques",
  "score-global": "score-global",
};

/** FR : le texte écrit DANS chaque image, repris en `alt`. / EN: the text drawn in each image, used as `alt`. */
export const LIBELLES_TITRES_CATEGORIES: Record<CategorieTitre, string> = {
  connexion: "Connexion à Bungie",
  manifest: "Recherche dans le Manifest",
  "contexte-0": "0. Contexte du Build",
  "pilier-1": "1. Doctrine élémentaire",
  "pilier-2": "2. Armes et Armures",
  "pilier-3": "3. Artefact",
  "pilier-4": "4. Effets du Build",
  "pilier-5": "5. Statistiques",
  "score-global": "Score global",
};

export default function TitreCategorie({ categorie }: { categorie: CategorieTitre }) {
  return <img className="titre-categorie" src={urlVisuel(`titres.${CLES_CATALOGUE_TITRES[categorie]}.repos`)} alt={LIBELLES_TITRES_CATEGORIES[categorie]} draggable={false} />;
}

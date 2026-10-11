// FR : ⚠️ AJOUT (07/10/2026, v0.3.16) - TITRE ILLUSTRÉ D'UN BLOC REPLIABLE, à DEUX ÉTATS (famille `blocs-repliables` de l'archive « forge-armory-app-assets ») : le dessin (logo + plaque + titre + ligne) porte à droite un LOSANGE dont le signe est « + » (argent)
// quand le bloc est REPLIÉ et « − » (cyan) quand il est DÉPLIÉ. CINQ blocs depuis la 0.3.17 : Mon Inventaire, Classe et Doctrine (dessiné « Doctrine et Élément »), Mon Build, Artefact, Sauvegarde et partage du Build (Connexion et Manifest ne sont PAS repliables : titres fixes, voir TitreCategorie). Règles de l'archive respectées : les deux états ont
// exactement le même cadre (7805 × 1024, un peu plus large que les titres fixes à cause du losange) donc RIEN ne bouge au changement d'état ; même hauteur pour toute la famille ; logo + plaque + titre + losange = un seul élément ; titres en tracés (aucune police).
// COMMENT L'ÉTAT SUIT LE BLOC : les deux images sont dans le DOM et c'est le CSS qui montre la bonne selon l'attribut `open` du <details> parent (`details[open] … .titre-repliable__deplie`, voir index.css) : aucun état React à synchroniser, donc le repli au clic, au clavier ou par le
// navigateur est toujours juste. L'image cachée est en `display: none` : elle n'est pas lue par les lecteurs d'écran (un seul nom, pas de doublon). Le triangle ▶ / ▼ que l'appli dessine déjà devant les titres (`summary::before`) est masqué pour ces blocs : le losange le remplace, deux indicateurs seraient redondants.
// Le texte du titre étant DANS l'image, il est repris en `alt` (libellés de l'utilisateur, « Build » avec un B majuscule ; le catalogue écrit « Sauvegarde et Partage du Build » avec un P majuscule : je garde la graphie écrite par l'utilisateur dans la conversation).
// Fichiers : par le catalogue (`urlVisuel`, `blocs-repliables.<clé>.replie|deplie`).
// EN: ⚠️ ADDED - two-state illustrated title for the 7 collapsible blocks; the CSS picks the image from the parent <details>' `open` attribute (no React state); the hidden image is display:none.

import { urlVisuel } from "../lib/visuelsForge";

export type CategorieRepliable = "inventaire" | "doctrine" | "mon-build" | "artefact" | "sauvegarde";

/** FR : le texte écrit DANS chaque image, repris en `alt`. / EN: the text drawn in each image, used as `alt`. */
export const LIBELLES_TITRES_REPLIABLES: Record<CategorieRepliable, string> = {
  inventaire: "Mon Inventaire",
  // FR : ⚠️ RENOMMÉ (07/10/2026, v0.3.17), demande de l'utilisateur : le bloc se nomme maintenant « Classe et Doctrine ». L'IMAGE dessine « DOCTRINE ET ÉLÉMENT » et ON LA GARDE (décision de l'utilisateur, 08/10/2026 : « On garde le logo ») : le nom lu par les
  // lecteurs d'écran est « Classe et Doctrine », le dessin garde l'ancien titre ; aucun nouveau logo n'est attendu. / EN: ⚠️ RENAMED - the block is now "Classe et Doctrine"; the artwork still draws the old title until a new one is supplied.
  doctrine: "Classe et Doctrine",
  "mon-build": "Mon Build",
  artefact: "Artefact",
  sauvegarde: "Sauvegarde et partage du Build",
};

export default function TitreRepliable({ categorie }: { categorie: CategorieRepliable }) {
  const libelle = LIBELLES_TITRES_REPLIABLES[categorie];
  return (
    <span className="titre-repliable" data-titre-repliable={categorie}>
      <img className="titre-categorie titre-repliable__replie" src={urlVisuel(`blocs-repliables.${categorie}.replie`)} alt={libelle} draggable={false} />
      <img className="titre-categorie titre-repliable__deplie" src={urlVisuel(`blocs-repliables.${categorie}.deplie`)} alt={libelle} draggable={false} />
    </span>
  );
}

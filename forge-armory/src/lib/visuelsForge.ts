// FR : ⚠️ AJOUT (07/10/2026, v0.3.16) - accès aux VISUELS de l'archive « forge-armory-app-assets » par leur identifiant de catalogue (`src/data/forge/forgeAssets.ts`, généré par l'auteur des visuels, repris TEL QUEL : ne pas le modifier à la main).
// Le catalogue donne, pour chaque visuel, son fichier (sous `public/assets/`), ses dimensions et son ratio ; le chemin est préfixé par `import.meta.env.BASE_URL` (« / » dans le navigateur, « ./ » dans le logiciel installé : un chemin
// absolu a déjà cassé des images dans le logiciel). Les identifiants ont la forme `<famille>.<clé>[.<état>]`, par exemple `selecteur.loadouts.selectionne`, `profils.pvp.repos`, `blocs-repliables.mon-build.deplie`, `titres.score-global.repos`.
// Un identifiant inconnu (faute de frappe) ne fait PAS planter l'appli : il est signalé dans la console et l'image reste vide ; le test des visuels vérifie que tous les identifiants utilisés existent.
// EN: ⚠️ ADDED - access to the supplied visuals by catalogue id; the path is prefixed by BASE_URL; an unknown id is logged, never throws.

import { forgeAsset } from "../data/forge/forgeAssets";
import { FORGE_ASSETS_COMPLEMENT } from "../data/forge/forgeAssetsComplement";

const BASE = import.meta.env.BASE_URL;

export function urlVisuel(id: string): string {
  const a = forgeAsset(id) ?? FORGE_ASSETS_COMPLEMENT.find((x) => x.id === id);   // le complément ne couvre que deux titres fixes (voir data/forge/forgeAssetsComplement.ts)
  if (!a) {
    console.error(`Visuel Forge Armory inconnu : « ${id} »`);
    return "";
  }
  return `${BASE}${a.fichier}`;
}

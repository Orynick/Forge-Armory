// FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - le FILIGRANE DE SAISON posé sur une vignette d'arme ou d'armure, comme dans le jeu : l'image de Bungie (transparente, de la taille de la vignette, symbole en haut à gauche) superposée telle quelle, sans retouche. À placer dans un conteneur `position: relative` de la taille de la vignette. Rien n'est dessiné sans filigrane. Décoratif : le nom de la saison est donné par l'icône des fenêtres Détails.
// ⚠️ RÉTABLI le 15/10/2026, demande de l'utilisateur (« remets l'icône à la taille qu'on avait au début ») : une pastille agrandie, puis une pastille alignée et réduite (`BadgeSaison`, supprimée) avaient été essayées sur les vignettes ; elles ne lui convenaient pas. EN: ⚠️ RESTORED - the season watermark overlaid on a thumbnail exactly as in the game (the badge experiments were dropped).
import type { Database } from "sql.js";
import { obtenirSaisonObjet } from "../lib/manifest/saison";

export default function FiligraneSaison({ db, itemHash, taille }: { db?: Database | null; itemHash?: number; taille: number }) {
  const saison = obtenirSaisonObjet(db, itemHash);
  if (!saison) return null;
  return <img data-filigrane-saison="" src={saison.filigrane} alt="" aria-hidden="true" width={taille} height={taille} draggable={false} style={{ position: "absolute", left: 0, top: 0, borderRadius: 4, pointerEvents: "none", maxWidth: "none" }} />;
}

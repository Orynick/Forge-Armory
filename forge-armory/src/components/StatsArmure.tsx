// FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures) - « Je veux aussi le ⇅ sur les armures portées. Partout sauf la Collection. D'ailleurs, affiche ⇅ devant le nom de la stat » : les SIX statistiques d'une armure sur DEUX LIGNES de TROIS (Santé, Mêlée, Grenade / Super, Classe, Arme), avec le symbole ⇅ EN VERT DEVANT le nom de la statistique « + » de l'ajustement (armure LÉGENDAIRE seulement : une exotique n'a pas de « + » propre). Composant PARTAGÉ par la liste d'inventaire (toutes les armures : Coffre, portées, équipées), Mon Build et les cartes de la Forge ; la Collection n'en a pas (elle montre des modèles, pas des exemplaires).
// EN: ⚠️ ADDED - the six armor stats on two lines of three, with a green ⇅ BEFORE the name of the tuning "+" stat (legendary only); shared by the inventory list, Mon Build and the Forge cards (not the Collection).
import type { Database } from "sql.js";
import type { GearPiece, StatKey } from "../types/build";
import { LIBELLES_STAT, ORDRE_STATS } from "../data/libellesUI";
import { statPlusDePiece } from "../lib/forge/armure";

interface Props {
  db: Database | null;
  /** FR : la pièce (son ajustement sert à retrouver le « + »). */
  piece: GearPiece;
  /** FR : les statistiques à afficher (par défaut celles de la pièce ; la Forge peut passer les statistiques simulées). */
  stats?: Partial<Record<StatKey, number>>;
  taille?: string;
  couleur?: string;
}

export default function StatsArmure({ db, piece, stats, taille = "0.7rem", couleur = "#7d7a70" }: Props) {
  const plus = db ? statPlusDePiece(db, piece) : null;
  const valeurs = stats ?? piece.stats ?? {};
  const ligne = (cles: StatKey[]) => (
    <span data-stats-ligne="" style={{ fontSize: taille, color: couleur, display: "block" }}>
      {cles.map((cle, i) => (
        <span key={cle} data-stat-ligne={cle}>
          {i > 0 ? " · " : ""}
          {plus === cle && <span data-stat-plus-ligne={cle} title="« + » de l'ajustement de cette pièce (tiré au hasard, non modifiable)" style={{ color: "#7fd88f" }}>⇅ </span>}
          {LIBELLES_STAT[cle]} {valeurs[cle] ?? 0}
        </span>
      ))}
    </span>
  );
  return <>{ligne(ORDRE_STATS.slice(0, 3))}{ligne(ORDRE_STATS.slice(3, 6))}</>;
}

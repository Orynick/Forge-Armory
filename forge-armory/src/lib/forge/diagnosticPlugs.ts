// FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - DIAGNOSTIC (mode développement : `npm run dev`) des PERKS DISPONIBLES sur un exemplaire possédé : pour chaque prise, le perk équipé et la liste de ceux que l'exemplaire peut porter (composant 310 de Bungie, lu par `plugsDisponibles.ts`). La forme de cette donnée n'a pas été vérifiée sur le compte de l'utilisateur : ce texte, copié à Claude,
// permet de la contrôler arme par arme (une arme dont on connaît les alternatives en jeu, par exemple les canons et chargeurs entre lesquels on bascule). EN: ⚠️ ADDED - dev-only diagnostic of the perks available on an owned weapon instance.
import type { Database } from "sql.js";
import type { GearPiece } from "../../types/build";
import { obtenirDefinition } from "../manifest/download";

const nomDe = (db: Database, hash: number): string => obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyInventoryItemDefinition", hash)?.displayProperties?.name || `(sans nom)`;

export function obtenirDiagnosticPlugsExemplaire(db: Database, piece: GearPiece): string {
  const dispo = piece.plugsDisponiblesParColonne;
  const lignes = [`Arme : ${piece.nom ?? "?"} (hash ${piece.itemHash}) — exemplaire ${piece.itemInstanceId ?? "?"} — ${piece.origine ?? "lieu inconnu"}${piece.equipe ? " (équipée)" : ""}`];
  lignes.push(dispo === undefined ? "Perks disponibles sur l'exemplaire : NON LUS (le composant 310 de Bungie n'a pas renvoyé de données pour cet exemplaire, ou l'inventaire a été chargé avant la mise à jour : rechargez-le)." : `Perks disponibles sur l'exemplaire : lus pour ${Object.keys(dispo).length} prise(s).`);
  const equipes = new Map((piece.perksParColonne ?? []).map((p) => [p.socketIndex, p.hash]));
  const prises = [...new Set([...equipes.keys(), ...Object.keys(dispo ?? {}).map(Number)])].sort((a, b) => a - b);
  for (const i of prises) {
    const eq = equipes.get(i);
    const liste = dispo?.[i] ?? [];
    lignes.push(`Prise ${i} : équipé = ${eq ? `${nomDe(db, eq)} (${eq})` : "—"} | disponibles (${liste.length}) = ${liste.length ? liste.map((h) => `${nomDe(db, h)} (${h})${h === eq ? " [équipé]" : ""}`).join(", ") : "—"}`);
  }
  return lignes.join("\n");
}

// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - DIAGNOSTIC DES PERKS D'UNE ARME (Forge ; `npm run dev` seulement, comme les autres diagnostics). But : la spécification de la Forge veut afficher la « version améliorée » d'un perk, mais le lien perk ↔ jumeau amélioré N'EST PAS VÉRIFIÉ sur le vrai Manifest (aucun accès réseau au moment de l'écriture). Ce texte décrit, pour UNE arme,
// chaque colonne (y compris celles normalement masquées) et chaque option avec ses champs bruts (type affiché, catégorie de plug, origine du pool) et repère les noms présents plusieurs fois dans une même colonne (jumeaux possibles). À lancer sur 3 ou 4 armes dont une avec des perks améliorés, puis à envoyer à Claude : il en déduira comment relier un perk à sa version améliorée (0.4.4).
// Ne modifie rien. EN: ⚠️ ADDED - dumps one weapon's columns and options with raw fields to learn how enhanced perk twins are stored (unverified on a real Manifest).
import type { Database } from "sql.js";
import { obtenirDefinition } from "./download";
import { normaliser } from "./search";
import { obtenirOptionsToutesColonnes } from "./doctrine";
import { ordonnerColonnesPourAffichage, libelleColonne } from "./colonnesArme";

const MOT_AMELIORE = /am[eé]lior|enhanc/i;

interface DefBrute {
  displayProperties?: { name?: string };
  itemTypeDisplayName?: string;
  inventory?: { tierTypeHash?: number };
  plug?: { plugCategoryIdentifier?: string };
  sockets?: { socketEntries?: { reusablePlugItems?: unknown[]; reusablePlugSetHash?: number; randomizedPlugSetHash?: number; singleInitialItemHash?: number; socketTypeHash?: number }[] };
}

/** FR : texte de diagnostic (fonction pure, sans effet de bord). / EN: diagnostic text (pure). */
export function obtenirDiagnosticPerksArme(db: Database, itemHash: number): string {
  const def = obtenirDefinition<DefBrute>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def) return `DIAGNOSTIC DES PERKS : arme ${itemHash} introuvable dans le Manifest.`;
  const colonnes = ordonnerColonnesPourAffichage(obtenirOptionsToutesColonnes(db, itemHash, [], { inclureMasquees: true }));
  const lignes: string[] = [
    "DIAGNOSTIC DES PERKS D'UNE ARME (Forge, à copier à Claude)",
    `Arme : ${def.displayProperties?.name ?? "?"} (hash ${itemHash}) | type : ${def.itemTypeDisplayName ?? "?"}`,
    `Colonnes : ${colonnes.length} (dont ${colonnes.filter((c) => c.masquee).length} normalement masquées)`,
  ];
  let totalOptions = 0, ameliorees = 0;
  const jumeaux = new Set<string>();
  for (const col of colonnes) {
    const entree = def.sockets?.socketEntries?.[col.socketIndex];
    const origines = [
      entree?.reusablePlugItems?.length ? `reusablePlugItems (${entree.reusablePlugItems.length})` : "",
      entree?.reusablePlugSetHash ? `reusablePlugSet ${entree.reusablePlugSetHash}` : "",
      entree?.randomizedPlugSetHash ? `randomizedPlugSet ${entree.randomizedPlugSetHash}` : "",
      entree?.singleInitialItemHash ? `singleInitial ${entree.singleInitialItemHash}` : "",
    ].filter(Boolean).join(" + ") || "aucune";
    lignes.push("", `=== ${libelleColonne(col)} (prise ${col.socketIndex})${col.estModConnu ? " [mods connus]" : ""}${col.masquee ? ` [masquée : ${col.masquee}]` : ""}`, `    prise : socketTypeHash ${entree?.socketTypeHash ?? "?"} | origine des options : ${origines}`);
    const noms = new Map<string, number>();
    for (const opt of col.options) {
      const brut = obtenirDefinition<DefBrute>(db, "DestinyInventoryItemDefinition", opt.hash);
      const type = brut?.itemTypeDisplayName ?? "", plug = brut?.plug?.plugCategoryIdentifier ?? "";
      const amelioree = MOT_AMELIORE.test(`${opt.nom} ${type} ${plug}`);
      totalOptions++; if (amelioree) ameliorees++;
      noms.set(normaliser(opt.nom), (noms.get(normaliser(opt.nom)) ?? 0) + 1);
      lignes.push(`  - ${opt.nom} | hash ${opt.hash} | type « ${type} » | plug « ${plug} » | amélioré ? ${amelioree ? "OUI" : "non"} | ${(opt.description ?? "").replace(/\s+/g, " ").slice(0, 80)}`);
    }
    for (const [nom, n] of noms) if (n > 1) jumeaux.add(`${nom} ×${n} (${libelleColonne(col)})`);
  }
  lignes.push("", "=== RÉSUMÉ", `Options : ${totalOptions} | marquées « amélioré / enhanced » : ${ameliorees} | noms présents plusieurs fois dans une même colonne (jumeaux possibles) : ${jumeaux.size ? [...jumeaux].join(" ; ") : "aucun"}`);
  return lignes.join("\n");
}

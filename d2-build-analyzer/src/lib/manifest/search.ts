// FR : Recherche dans le Manifest - par nom precis, ou "plein texte" dans
// tout le contenu (nom, description, textes de perks...), tables armes/
// armures ET perks/aspects/fragments/perks d'artefact (qui sont pour la
// plupart des entrees DestinyInventoryItemDefinition comme le reste).
// EN: Manifest search - by exact name, or "full text" across all content
// (name, description, perk text...), weapons/armor tables AND perks/
// aspects/fragments/artifact perks (mostly DestinyInventoryItemDefinition
// entries like everything else).

import { Database } from "sql.js";
import { idSqliteVersHash } from "./download";

// FR : Tables couvrant à la fois l'équipement et les textes de perks/
// aspects/fragments (qui sont, pour l'essentiel, des items "plug" dans
// DestinyInventoryItemDefinition). DestinySandboxPerkDefinition ajoute les
// descriptions "brutes" des effets intrinsèques.
// EN: Tables covering both gear and perk/aspect/fragment text (which are,
// for the most part, "plug" items in DestinyInventoryItemDefinition).
// DestinySandboxPerkDefinition adds the "raw" intrinsic-effect descriptions.
export const TABLES_RECHERCHE_PAR_DEFAUT = [
  "DestinyInventoryItemDefinition",
  "DestinySandboxPerkDefinition",
];

export interface ResultatRecherche {
  table: string;
  hash: number;
  nom: string;
  description: string;
  champCorrespondant: "nom" | "description" | "autre texte";
}

/** FR : Enlève les accents + met en minuscules, pour un match "dévoration" == "devoration" == "DÉVORATION". / EN: Strips accents + lowercases, so "dévoration" == "devoration" == "DÉVORATION" all match. */
function normaliser(texte: string): string {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export type ModeRecherche = "nom" | "plein_texte";

/**
 * FR : ⚠️ Une recherche "plein texte" doit par nature parcourir tout le
 * texte de la table au moins une fois (impossible de savoir à l'avance où
 * se trouve un mot). Pour rester rapide malgré tout, on ne parse le JSON
 * (JSON.parse) QUE pour les lignes déjà identifiées comme correspondantes
 * par un simple test de sous-chaîne sur le texte brut — le filtrage
 * grossier est donc bien moins coûteux qu'un parsing systématique.
 * EN: ⚠️ A "full text" search inherently has to scan all the table's text
 * at least once (no way to know in advance where a word sits). To stay
 * fast anyway, we only JSON.parse the rows already identified as matches by
 * a plain substring test on the raw text — so the coarse filtering is far
 * cheaper than parsing every row systematically.
 */
export function rechercherDansManifest(
  db: Database,
  motCle: string,
  mode: ModeRecherche = "plein_texte",
  tables: string[] = TABLES_RECHERCHE_PAR_DEFAUT
): ResultatRecherche[] {
  const motNormalise = normaliser(motCle.trim());
  if (motNormalise.length < 2) return []; // évite de scanner tout le Manifest pour 1 caractère

  const resultats: ResultatRecherche[] = [];

  for (const table of tables) {
    const stmt = db.prepare(`SELECT id, json FROM ${table}`);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const jsonBrut = row.json as string;

      // Filtre grossier et rapide, sans parser le JSON.
      if (!normaliser(jsonBrut).includes(motNormalise)) continue;

      const def = JSON.parse(jsonBrut);
      const nom: string = def.displayProperties?.name ?? "(sans nom)";
      const description: string = def.displayProperties?.description ?? "";

      const nomCorrespond = normaliser(nom).includes(motNormalise);
      if (mode === "nom" && !nomCorrespond) continue; // mode "nom" : on ignore les correspondances ailleurs

      const champCorrespondant: ResultatRecherche["champCorrespondant"] = nomCorrespond
        ? "nom"
        : normaliser(description).includes(motNormalise)
          ? "description"
          : "autre texte"; // ex: texte de perk imbriqué, requirementDisplayString...

      resultats.push({ table, hash: idSqliteVersHash(Number(row.id)), nom, description, champCorrespondant });
    }
    stmt.free();
  }

  // FR : résultats les plus pertinents d'abord (nom > description > reste).
  // EN: most relevant results first (name > description > rest).
  const rang = { nom: 0, description: 1, "autre texte": 2 };
  resultats.sort((a, b) => rang[a.champCorrespondant] - rang[b.champCorrespondant]);

  return resultats;
}

// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - test du MODÈLE du Legendarium contre les FIXTURES du projet (`test-fixtures/manifest-mock.json`, via `scripts/fausse-db.mjs`) : prouve que le modèle fonctionne avec la FAUSSE BASE du projet (mêmes appels que la vraie), y compris la table `DestinyLoreDefinition` ajoutée aux fixtures. ⚠️ Les fixtures restent FACTICES : ce test ne dit RIEN de la présence réelle de `lore`/`DestinyLoreDefinition` dans le Manifest de l'utilisateur (non vérifiée : voir le diagnostic en `npm run dev`). EN: tests the Legendarium model against the project fixtures (fake DB); proves the model works with the project's fake database, including the `DestinyLoreDefinition` table added to the fixtures.
import { readFileSync } from "node:fs";
import {
  livresDeSection,
  rechercherPages,
  trouverPage,
  pageLoreObjet,
  porteursDeLore,
  rangChronoObjet,
  trierPagesChrono,
} from "../../src/lib/legendarium/modele";
import { hashVersIdSqlite } from "../../src/lib/manifest/download";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

// FR : fausse base LÉGÈREMENT différente de `scripts/fausse-db.mjs` : le lanceur de tests empaquette le test dans `tests/logique/_sortie/`, donc le chemin relatif vers `test-fixtures/` dépend du répertoire d'exécution — on lit le fichier en ABSOLU depuis la racine du projet (`process.cwd()`). / EN: lightweight fake DB (same shape as scripts/fausse-db.mjs) reading the fixtures by absolute path from the project root.
const donnees = JSON.parse(readFileSync("test-fixtures/manifest-mock.json", "utf8"));
const db = {
  prepare(sql: string) {
    const table = sql.match(/FROM (\w+)/)![1];
    const parId = sql.includes("WHERE id");
    const lignesTable = donnees[table]?.fr ?? {};
    const lignes = Object.entries(lignesTable).map(([id, def]) => ({ id: Number(id), def }));
    let idCherche: number | null = null;
    let i = -1;
    return {
      bind(params: number[]) { idCherche = params[0]; },
      step() {
        if (parId) {
          if (i === -1 && lignes.some((l) => l.id === idCherche)) { i = 0; return true; }
          return false;
        }
        i++;
        return i < lignes.length;
      },
      getAsObject() {
        const ligne = parId ? lignes.find((l) => l.id === idCherche)! : lignes[i];
        return { id: ligne.id, json: JSON.stringify(ligne.def) };
      },
      free() {},
    };
  },
} as never;
// FR : `obtenirDefinition` convertit le hash en id SQLite signé ; la fausse base stocke les ids tels quels — on s'assure que les hash des fixtures passent (ils sont < 2^31, donc identiques). / EN: sanity check that fixture hashes round-trip through hashVersIdSqlite.
ok("les hash des fixtures passent la conversion id SQLite (positifs, inchangés)", hashVersIdSqlite(6001) === 6001 && hashVersIdSqlite(7001) === 7001);

// --- Page de Lore d'un objet (lien profond) ---
const pageIzanagi = pageLoreObjet(db, 6001);
ok("fixture : un objet AVEC Lore a une page « item:6001 » avec le texte du Lore",
  pageIzanagi?.id === "lore:7101" && pageIzanagi.titre === "Izanagi — Burden" && pageIzanagi.texte === "Un seul coup, mais un coup parfait.", pageIzanagi);
ok("fixture : un objet SANS Lore n'a pas de page", pageLoreObjet(db, 6002) === undefined);
ok("fixture : un objet masqué (redacted) ou factice n'a pas de page", pageLoreObjet(db, 6003) === undefined && pageLoreObjet(db, 6004) === undefined);

// --- Livres par section ---
const livresLegendes = livresDeSection(db, "legendes");
ok("fixture : les Légendes forment un livre avec 2 pages (la page sans corps et les Lores d'objets sont exclus)",
  livresLegendes.length === 1 && livresLegendes[0].pages.length === 2 && livresLegendes[0].pages.every((p) => /^lore:70\d\d$/.test(p.id)), livresLegendes[0]?.pages.map((p) => p.id));

const livresObjets = livresDeSection(db, "objets");
// ⚠️ CHANGÉ (22/10/2026, suite 12) : livre Cinétiques (REPLIABLE DE NOMS « listePages », sans groupe) + livre « Autres armures » (groupe « Ensembles d'armures » ; pas de collectibles dans les fixtures projet)
const livreArmures = livresObjets.find((l) => l.id === "objets-armures-autres");
const livreArmes = livresObjets.find((l) => l.id === "objets-armes-cinetique");
ok("fixture : un livre « Cinétiques » en REPLIABLE DE NOMS (`listePages`, sans groupe) avec l'arme exotique (seule porteuse d'armes)",
  livreArmes?.listePages === true && livreArmes.groupe === undefined && livreArmes?.pages.length === 1 && livreArmes.pages[0].id === "lore:7101", livresObjets.map((l) => `${l.groupe ?? "listePages"}/${l.titre}`));
ok("fixture : RÈGLE VERROUILLÉE respectée — Titan (casque→gants→torse→jambes→marque) puis Chasseur (casque→marque), dans le livre « Autres armures »",
  livreArmures?.groupe === "Ensembles d'armures" && JSON.stringify(livreArmures?.pages.map((p) => p.id)) === JSON.stringify(["lore:7110", "lore:7111", "lore:7112", "lore:7113", "lore:7114", "lore:7120", "lore:7121"]), livreArmures?.pages.map((p) => p.id));

const livresCosm = livresDeSection(db, "cosmetiques");
ok("fixture : le Spectre est listé dans le livre « Spectres » en REPLIABLE DE NOMS (`listePages`, sans groupe ; itemType 24 ; le Vaisseau sans Lore est exclu)",
  livresCosm.length === 1 && livresCosm[0].titre === "Spectres" && livresCosm[0].listePages === true && livresCosm[0].groupe === undefined && livresCosm[0].pages.length === 1 && livresCosm[0].pages[0].id === "lore:7130", livresCosm.map((l) => `${l.titre}(${l.pages.length})`));

// --- Recherche + lien profond + parcours inverse ---
const tous = { legendes: livresLegendes, objets: livresObjets, cosmetiques: livresCosm };
ok("fixture : la recherche « siège » retrouve les 5 pages du set Titan",
  rechercherPages(tous, "siège").length === 5, rechercherPages(tous, "siège").map((r) => r.page.id));
const cible = trouverPage(tous, "item:6013", db); // forme lien profond fiche Détails
ok("fixture : le lien profond « item:6013 » (forme fiche Détails) est résolu vers « lore:7113 » (Jambes du Siège brisé)",
  cible?.page.titre === "Jambes du Siège brisé" && cible.page.id === "lore:7113" && cible.section === "objets", cible?.page.id);
ok("fixture : ⚠️ DÉDOUBLONNAGE — la réédition d'Izanagi (même Lore 7101) ne crée PAS de page en double ; TITRE = NOM DE L'OBJET",
  livreArmes?.pages.length === 1 && livreArmes.pages[0].titre === "Izanagi — Burden", livreArmes?.pages.map((p) => p.titre));
const porteurs = porteursDeLore(db, 7101);
ok("fixture : le parcours inverse du Lore 7101 retrouve Izanagi ET sa réédition (masquée et factice exclues)",
  porteurs.length === 2 && porteurs.some((x) => x.hash === 6001) && porteurs.some((x) => x.hash === 6040), porteurs.map((x) => x.hash));

// --- ⚠️ Tri chronologique contre les fixtures (décision utilisateur) ---
ok("fixture : rang chrono — Izanagi (seasonHash 9011) = saison 11 via le Manifest",
  rangChronoObjet(db, 6001) === 11, rangChronoObjet(db, 6001));
ok("fixture : rang chrono — set Titan (seasonHash 9012) = saison 12 via le Manifest",
  rangChronoObjet(db, 6010) === 12, rangChronoObjet(db, 6010));
ok("fixture : rang chrono — SECOURS table DIM — Casque du Chasseur (hash 236588, sans seasonHash) = saison 11",
  rangChronoObjet(db, 236588) === 11, rangChronoObjet(db, 236588));
ok("fixture : rang chrono — SECOURS table DIM — Marque du Chasseur (hash 1399216, sans seasonHash) = saison 12",
  rangChronoObjet(db, 1399216) === 12, rangChronoObjet(db, 1399216));
ok("fixture : la page du livre « Cinétiques » porte rangChrono = 11 (Izanagi)",
  livreArmes?.pages[0].rangChrono === 11, livreArmes?.pages[0].rangChrono);
ok("fixture : trierPagesChrono classe le livre cosmétiques (Spectre, saison 11) avant une page non datée",
  JSON.stringify(trierPagesChrono([{ id: "lore:zzz", titre: "Zzz sans date", texte: "x" }, ...(livresCosm[0]?.pages ?? [])] as never[]).map((p) => p.id)) === JSON.stringify(["lore:7130", "lore:zzz"]));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);

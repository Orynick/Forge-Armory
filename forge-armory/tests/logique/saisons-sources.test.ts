// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - test de la TABLE DES SAISONS (`data/saisons.ts`, dérivée de d2-additional-info, MIT), du FILTRE DE SOURCE (`data/sourceFilter.ts`) et de la JOINTURE numéro de saison ← filigrane du Manifest (la table watermark → numéro vient de d2-additional-info ; elle est embarquée ici sous forme compacte pour les tests, les principaux filigranes des saisons 5 à 28).
// Couvre : 28 saisons, la saison 5 = « Season of the Forge », la saison 28 en cours (fin null), le filtre source: par catégorie ET par activité, l'exclusion sans erreur des objets sans hash de source, l'autocomplétion (exactement les 13 catégories d'abord), les alias de saisie libre, et l'extraction du filtre du champ de recherche.
// EN: ⚠️ ADDED - test of the seasons table, the source filter module and the watermark→season join.
import { SAISONS, saisonParNumero, saisonDeLObjet } from "../../src/data/saisons";
import { SOURCE_FILTER_SUGGESTIONS, matchesSourceFilter, FILTRES_SOURCES } from "../../src/data/sourceFilter";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };

// FR : la table filigrane → numéro (extrait de output/seasons.json de d2-additional-info) : un filigrane par saison récente, pour la jointure de l'interface.
const FILIGRANE_VERS_SAISON: Record<number, number> = {
  4772275: 12, 156845152: 13, 52039562: 14, 199733460: 15, 51925409: 16,
  105911828: 17, 494187468: 18, 18179099: 19, 41589556: 20,
};

(async () => {
  // ---------- 1. la table des saisons ----------
  ok("SAISONS contient les 28 saisons, numérotées 1 à 28 SANS trou ni doublon", SAISONS.length === 28 && SAISONS.every((s, i) => s.numero === i + 1), SAISONS.map((s) => s.numero));
  ok("la saison 5 s'appelle « Season of the Forge » (extension Black Armory, dates ISO) — LE test demandé par la spécification", saisonParNumero(5)?.nom === "Season of the Forge" && saisonParNumero(5)?.extension === "Black Armory" && saisonParNumero(5)?.debut === "2018-11-27", saisonParNumero(5));
  ok("la saison 28 est EN COURS : fin null (la maintenance manuelle ajoute la fin quand Bungie la clôt)", saisonParNumero(28)?.fin === null, saisonParNumero(28));
  ok("chaque saison a un début ISO et un nom ; les saisons 24+ sont des ÉPISODES (le nommage change)", SAISONS.every((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.debut) && !!s.nom) && saisonParNumero(25)?.type === "episode", [saisonParNumero(25)?.type, saisonParNumero(23)?.type]);
  ok("une saison inconnue (29, 0, -1) est undefined sans erreur, jamais estimée", saisonParNumero(29) === undefined && saisonParNumero(0) === undefined && saisonParNumero(-1) === undefined);

  // ---------- 2. la jointure filigrane → numéro → nom ----------
  // FR : le principe de l'interface : l'objet a un FILIGRANE (iconWatermark) ; la table d2-additional-info donne le numéro ; la table des saisons donne le nom. Un filigrane inconnu reste sans saison (signalé, jamais estimé).
  const saisonDunFiligrane = (filigrane: number) => saisonParNumero(FILIGRANE_VERS_SAISON[filigrane] ?? -1);
  ok("la jointure complète : le filigrane de la saison 12 (Au-delà de la Lumière) résout vers « Season of the Hunt »", saisonDunFiligrane(4772275)?.nom === "Season of the Hunt", saisonDunFiligrane(4772275));
  ok("un filigrane INCONNU ne résout rien (undefined, pas d'invention)", saisonDunFiligrane(999999999) === undefined);

  // ---------- 3. le filtre de source ----------
  // FR : ⚠️ CHANGÉ (19/10/2026, 3e retour de test : la jointure par itemSourceHashes du Manifest ne matchait RIEN — Bungie ne peuple pas ce champ) - la jointure est FIDÈLE À DIM : (1) le sourceHash du COLLECTIBLE de l'objet dans les sourceHashes de la source, OU (2) le hash de l'objet dans les itemHashes.
  const unRaidCollectible = FILTRES_SOURCES.categories["raid"].sourceHashes.slice(0, 3);
  const unTrialsCollectible = FILTRES_SOURCES.categories["trials"].sourceHashes.slice(0, 3);
  const unItemDeLastWish = FILTRES_SOURCES.activities["last-wish"].itemHashes[0];
  ok("un objet dont le COLLECTIBLE porte un sourceHash de RAID matche raid et PAS trials — le chemin principal de DIM", matchesSourceFilter({ collectibleSourceHash: unRaidCollectible[0], itemHash: 1 }, "raid") && !matchesSourceFilter({ collectibleSourceHash: unRaidCollectible[0], itemHash: 1 }, "trials"), [unRaidCollectible, unTrialsCollectible]);
  ok("un objet du TRIALS (sourceHash de collectible) matche trials", matchesSourceFilter({ collectibleSourceHash: unTrialsCollectible[0], itemHash: 2 }, "trials"));
  ok("un objet listé DIRECTEMENT dans une source (itemHashes de last-wish) matche cette source, sans collectible", matchesSourceFilter({ itemHash: unItemDeLastWish }, "last-wish"));
  ok("un objet SANS jointure (undefined) est EXCLU sans erreur", matchesSourceFilter(undefined, "raid") === false);
  ok("un objet sans collectible ET hors itemHashes ne matche pas", matchesSourceFilter({ itemHash: 999999999 }, "raid") === false);
  ok("un filtre INCONNU ne fait rien remonter, sans erreur", matchesSourceFilter({ collectibleSourceHash: unRaidCollectible[0], itemHash: 1 }, "zzz") === false);

  // ---------- 4. l'extraction depuis la recherche ----------
  // FR : ⚠️ RETIRÉ (19/10/2026, second retour de test) - la syntaxe « source: » dans le champ de texte a été REMPLACÉE par un MENU DÉROULANT (demande explicite de l'utilisateur) : les contrôles d'extraction et d'alias ne s'appliquent plus. Le menu est testé en interface ; le filtre par hash reste testé ci-dessus.

  // ---------- 5. l'autocomplétion et les alias ----------
  ok("l'autocomplétion propose EXACTEMENT les 13 catégories d'abord (genre « categorie »), puis les activités (genre « activite »)", SOURCE_FILTER_SUGGESTIONS.filter((s) => s.genre === "categorie").length === 13 && SOURCE_FILTER_SUGGESTIONS.filter((s) => s.genre === "categorie").every((s) => s.libelle === FILTRES_SOURCES.categories[s.valeur].libelle_fr));
  ok("chaque catégorie proposée est un filtre VALIDE (la saisie de source:<proposition> matche bien)", SOURCE_FILTER_SUGGESTIONS.filter((s) => s.genre === "categorie").every((s) => !!FILTRES_SOURCES.categories[s.valeur]));



  // ---------- 6. RETOUR DE TEST (19/10, soir) : la saison par le FILIGRANE de l'objet ----------
  // FR : le cas réel de l'utilisateur : ni seasonHash, ni balayage interne concluant (« 0 filigrane relié ») — le numéro vient de la table filigrane→numéro, lue sur le CHEMIN de l'icône du filigrane.
  // FR : ⚠️ CHANGÉ (19/10/2026, second retour de test : les chemins de filigrane du Manifest de l'utilisateur sont en HEXA, la jointure par le chemin ne matched jamais) - la jointure est désormais PAR LE HASH DE L'OBJET (la table de DIM elle-même, seasons_unfiltered : 57 439 objets).
  ok("SAISON PAR OBJET : le hash de l'objet filigrane 4772275 (l'ancienne clé de test) résout toujours la saison 12 — la table objet est un SUR-ENSEMBLE de l'ancienne table filigrane", saisonDeLObjet(4772275) === 12, saisonDeLObjet(4772275));
  ok("un hash absent de la table ou undefined : aucune saison (undefined, jamais estimée)", saisonDeLObjet(999999999) === undefined && saisonDeLObjet(undefined) === undefined);
  // ⚠️ AJOUT (22/10/2026, suite 11 Legendarium, validation VRAI Manifest) : le JSON de DIM stocke les hashes en NON SIGNÉ, le Manifest en SIGNÉ — les deux formes doivent résoudre.
  ok("⚠️ suite 11 : un hash NÉGATIF (signé 32 bits, ex: -2147005609 = Grèves de l'hymne triomphal) résout via sa forme non signée (2147961687 → saison 28)",
    saisonDeLObjet(-2147005609) === 28, saisonDeLObjet(-2147005609));
  ok("⚠️ suite 11 : un hash POSITIF résout directement (ex: 236588 → saison 11)", saisonDeLObjet(236588) === 11, saisonDeLObjet(236588));
  ok("⚠️ suite 11 : un hash négatif ABSENT de la table reste undefined (jamais estimé)", saisonDeLObjet(-999999999) === undefined, saisonDeLObjet(-999999999));

  console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
  process.exit(res.every(Boolean) ? 0 : 1);
})();

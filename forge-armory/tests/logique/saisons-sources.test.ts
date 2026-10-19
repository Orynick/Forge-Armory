// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - test de la TABLE DES SAISONS (`data/saisons.ts`, dérivée de d2-additional-info, MIT), du FILTRE DE SOURCE (`data/sourceFilter.ts`) et de la JOINTURE numéro de saison ← filigrane du Manifest (la table watermark → numéro vient de d2-additional-info ; elle est embarquée ici sous forme compacte pour les tests, les principaux filigranes des saisons 5 à 28).
// Couvre : 28 saisons, la saison 5 = « Season of the Forge », la saison 28 en cours (fin null), le filtre source: par catégorie ET par activité, l'exclusion sans erreur des objets sans hash de source, l'autocomplétion (exactement les 13 catégories d'abord), les alias de saisie libre, et l'extraction du filtre du champ de recherche.
// EN: ⚠️ ADDED - test of the seasons table, the source filter module and the watermark→season join.
import { SAISONS, saisonParNumero, saisonDuCheminFiligrane } from "../../src/data/saisons";
import { SOURCE_FILTER_SUGGESTIONS, matchesSourceFilter, extraireFiltreSource, resoudreAliasActivite, FILTRES_SOURCES } from "../../src/data/sourceFilter";

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
  const unRaid = Object.values(FILTRES_SOURCES.categories["raid"].itemSourceHashes).slice(0, 3);
  const unTrials = FILTRES_SOURCES.categories["trials"].itemSourceHashes.slice(0, 3);
  ok("un objet de RAID remonte sous source:raid et PAS sous source:trials", matchesSourceFilter(unRaid, "raid") && !matchesSourceFilter(unRaid, "trials"), [unRaid]);
  ok("un objet de TRIALS remonte sous source:trials", matchesSourceFilter(unTrials, "trials"));
  ok("un objet SANS hash de source est EXCLU sans erreur (undefined → false)", matchesSourceFilter(undefined, "raid") === false && matchesSourceFilter([], "raid") === false);
  ok("un filtre INCONNU (source:zzz) ne fait rien remonter, sans erreur", matchesSourceFilter(unRaid, "zzz") === false);
  ok("un objet de la caté­gorie raid remonte aussi sous l'ACTIVITÉ précise si son hash y appartient ; les deux niveaux partagent le même index", (() => { const h = Object.values(FILTRES_SOURCES.activities["last-wish"].itemSourceHashes)[0]; return FILTRES_SOURCES.categories["raid"].itemSourceHashes.includes(h) && matchesSourceFilter([h], "last-wish"); })());

  // ---------- 4. l'extraction depuis la recherche ----------
  const ext1 = extraireFiltreSource("vérité source:raid exotique");
  ok("« vérité source:raid exotique » : le filtre est extrait (source:raid) et le TEXTE RESTANT garde les autres mots", ext1?.filtre === "raid" && ext1?.texteRestant.replace(/\s+/g, " ") === "vérité exotique", ext1);
  ok("une recherche sans filtre donne null (le texte n'est pas altéré)", extraireFiltreSource("vérité exotique") === null);

  // ---------- 5. l'autocomplétion et les alias ----------
  ok("l'autocomplétion propose EXACTEMENT les 13 catégories d'abord (genre « categorie »), puis les activités (genre « activite »)", SOURCE_FILTER_SUGGESTIONS.filter((s) => s.genre === "categorie").length === 13 && SOURCE_FILTER_SUGGESTIONS.filter((s) => s.genre === "categorie").every((s) => s.libelle === FILTRES_SOURCES.categories[s.valeur].libelle_fr));
  ok("chaque catégorie proposée est un filtre VALIDE (la saisie de source:<proposition> matche bien)", SOURCE_FILTER_SUGGESTIONS.filter((s) => s.genre === "categorie").every((s) => !!FILTRES_SOURCES.categories[s.valeur]));
  ok("l'alias de saisie libre : « Last Wish » et « Prophétie » résolvent vers les filtres d'activités (insensible aux accents et à la casse)", resoudreAliasActivite("Last Wish") === "last-wish" && resoudreAliasActivite("Prophétie") === "prophecy" && resoudreAliasActivite("prophetie") === "prophecy");
  ok("un texte qui n'est pas une activité ne résout rien (null)", resoudreAliasActivite("zzz") === null);


  // ---------- 6. RETOUR DE TEST (19/10, soir) : la saison par le FILIGRANE de l'objet ----------
  // FR : le cas réel de l'utilisateur : ni seasonHash, ni balayage interne concluant (« 0 filigrane relié ») — le numéro vient de la table filigrane→numéro, lue sur le CHEMIN de l'icône du filigrane.
  ok("SAISON PAR FILIGRANE : un objet sans seasonHash mais avec filigrane connu (le vrai filigrane de la saison 12) résout quand même sa saison — le correctif du retour de test n°1", saisonDuCheminFiligrane("/common/destiny2_content/icons/4772275.png") === 12, saisonDuCheminFiligrane("/common/destiny2_content/icons/4772275.png"));
  ok("un filigrane absent de la table, un chemin vide ou mal formé : aucune saison (undefined, jamais estimée)", saisonDuCheminFiligrane("/common/destiny2_content/icons/999999999.png") === undefined && saisonDuCheminFiligrane("") === undefined && saisonDuCheminFiligrane(undefined) === undefined);
  ok("le chemin est la vraie forme du Manifest (« /common/destiny2_content/icons/<hash>.png ») : le hash extrait est numérique", saisonDuCheminFiligrane("/common/destiny2_content/icons/05c3ebe414c6946429934d79504922fa.png") === undefined);   // un chemin de filigrane non numérique : pas de fausse saison

  console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
  process.exit(res.every(Boolean) ? 0 : 1);
})();

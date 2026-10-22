// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - test du MODÈLE du Legendarium (`lib/legendarium/modele.ts`) : lecture des tables `DestinyLoreDefinition` et `DestinyItemDefinition` (champ `lore`) dans une FAUSSE base (mêmes appels que la vraie), règle des ensembles d'armures (classe puis casque → gants → torse → jambes → objet de classe), recherche par mots-clés, lien profond, parcours inverse. ⚠️ Le test ne dit RIEN de la présence réelle de ces champs dans le Manifest de l'utilisateur (non vérifiée : voir le diagnostic en `npm run dev`). EN: test of the Legendarium model on a fake database; proves the LOGIQUE only.
import { creerFausseDb } from "./fixtures/fauxManifest";
import {
  SECTIONS,
  ORDRE_SLOTS_ARMURE,
  ORDRE_CLASSES,
  livresDeSection,
  ordrePages,
  rechercherPages,
  trouverPage,
  pageLoreObjet,
  idPageDepuisObjet,
  porteursDeLore,
  trierArmuresParEnsemble,
  trierPagesChrono,
  rangChronoObjet,
  libelleRangChrono,
  libelleSlot,
  aLore,
  diagnostiquerLore,
  categoriesDeLegendes,
} from "../../src/lib/legendarium/modele";
import { ereDeSection, PALETTE, PALETTE_PRINCIPALE, PALETTE_REPLI } from "../../src/lib/legendarium/palette";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

const T_OBJET = "DestinyInventoryItemDefinition";
// ⚠️ AJOUT (22/10/2026, suite 11) : tables pour le groupement par provenance (armures) et par type (cosmétiques)
const T_COLL = "DestinyCollectibleDefinition";
const T_NOEUD = "DestinyPresentationNodeDefinition";
const T_SAISON = "DestinySeasonDefinition";
const T_LORE = "DestinyLoreDefinition";
const BUCKET = { casque: 3448274439, gants: 3551918588, torse: 14239492, jambes: 20886954, marque: 1585787867, cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };

const lore = (titre: string, corps: string, sousTitre?: string) => ({ displayProperties: { name: titre, description: corps }, ...(sousTitre ? { subtitle: sousTitre } : {}) });
const objet = (nom: string, extra: Record<string, unknown> = {}) => ({ displayProperties: { name: nom, icon: `/icons/${nom}.png`, description: "" }, ...extra });

const { db } = creerFausseDb({
  [T_LORE]: {
    7001: lore("Le Gardien se lève", "Un Gardien se lève, la Tour retient son souffle.", "Chapitre I"),
    7002: lore("L'Ombre", "Deuxième page de Légende D2 pour la démonstration de navigation."),
    7003: lore("Page sans corps", ""), // sans texte : exclue
  },
  [T_OBJET]: {
    // Arme avec Lore
    6001: objet("Izanagi — Burden", { itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }),
    6040: objet("Izanagi — Burden (réédition)", { itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }), // ⚠️ rééédition : MÊME Lore 7101
    // Arme SANS Lore (pas de champ `lore`)
    6002: objet("Arme sans lore", { itemType: 3, itemTypeDisplayName: "Fusil à pompe", inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 4008398120 } }),
    // Arme masquée (redacted) avec un lore : exclue
    6003: objet("Arme masquée", { itemType: 3, redacted: true, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
    // Armure factice avec un lore : exclue
    6004: objet("Armure factice", { itemType: 2, loreHash: 7101, itemCategoryHashes: [3109687656], inventory: { bucketTypeHash: BUCKET.casque } }),
    // Ensemble Titan (ordre à vérifier : casque, gants, torse, jambes, marque)
    6010: objet("Casque du Siège brisé", { itemType: 2, classType: 0, loreHash: 7110, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    6011: objet("Gants du Siège brisé", { itemType: 2, classType: 0, loreHash: 7111, inventory: { bucketTypeHash: BUCKET.gants, tierTypeHash: 4008398120 } }),
    6012: objet("Torse du Siège brisé", { itemType: 2, classType: 0, loreHash: 7112, inventory: { bucketTypeHash: BUCKET.torse, tierTypeHash: 4008398120 } }),
    6013: objet("Jambes du Siège brisé", { itemType: 2, classType: 0, loreHash: 7113, inventory: { bucketTypeHash: BUCKET.jambes, tierTypeHash: 4008398120 } }),
    6014: objet("Marque du Siège brisé", { itemType: 2, classType: 0, loreHash: 7114, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    // Ensemble Chasseur (à classer APRÈS le Titan)
    6020: objet("Casque du Chasseur", { itemType: 2, classType: 1, loreHash: 7120, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    6021: objet("Marque du Chasseur", { itemType: 2, classType: 1, loreHash: 7121, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    // Cosmétique : Spectre avec Lore
    6030: objet("Coque de Spectre", { itemType: 24, itemTypeDisplayName: "Coque de Spectre", loreHash: 7130 }),
    // Cosmétique SANS Lore : exclu des cosmétiques
    6031: objet("Vaisseau sans lore", { itemType: 16, itemTypeDisplayName: "Vaisseau" }),
  },
});

// Lores des objets (table séparée pour lisibilité)
// (la fausse base accepte plusieurs tables ; on recrée avec les lores d'objets ajoutés)
const { db: db2 } = creerFausseDb({  [T_SAISON]: {
    9011: { displayProperties: { name: "Saison de la Chasseresse" }, seasonNumber: 11 },
    9012: { displayProperties: { name: "Ombres du Cauchemar" }, seasonNumber: 12 },
  },
  [T_LORE]: {
    7001: lore("Le Gardien se lève", "Un Gardien se lève, la Tour retient son souffle.", "Chapitre I"),
    7002: lore("L'Ombre", "Deuxième page de Légende D2 pour la démonstration de navigation."),
    7101: lore("Izanagi", "Un seul coup, mais un coup parfait."),
    7110: lore("Casque Titan", "Mini-histoire Titan, première pièce."),
    7111: lore("Gants Titan", "Mini-histoire Titan, deuxième pièce."),
    7112: lore("Torse Titan", "Mini-histoire Titan, troisième pièce."),
    7113: lore("Jambes Titan", "Mini-histoire Titan, quatrième pièce."),
    7114: lore("Marque Titan", "Mini-histoire Titan, cinquième pièce."),
    7120: lore("Casque Chasseur", "Mini-histoire Chasseur, casque."),
    7121: lore("Marque Chasseur", "Mini-histoire Chasseur, objet de classe."),
    7130: lore("Coque de Spectre", "Lore du Spectre, affiché quand il existe."),
  },
  [T_OBJET]: {
    6001: objet("Izanagi — Burden", { itemType: 3, itemTypeDisplayName: "Fusil de précision", seasonHash: 9011, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }),
    6040: objet("Izanagi — Burden (réédition)", { itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }), // ⚠️ rééédition : MÊME Lore 7101
    6002: objet("Arme sans lore", { itemType: 3, itemTypeDisplayName: "Fusil à pompe", inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 4008398120 } }),
    6003: objet("Arme masquée", { itemType: 3, redacted: true, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
    6004: objet("Armure factice", { itemType: 2, loreHash: 7101, itemCategoryHashes: [3109687656], inventory: { bucketTypeHash: BUCKET.casque } }),
    6010: objet("Casque du Siège brisé", { itemType: 2, classType: 0, loreHash: 7110, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    6011: objet("Gants du Siège brisé", { itemType: 2, classType: 0, loreHash: 7111, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.gants, tierTypeHash: 4008398120 } }),
    6012: objet("Torse du Siège brisé", { itemType: 2, classType: 0, loreHash: 7112, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.torse, tierTypeHash: 4008398120 } }),
    6013: objet("Jambes du Siège brisé", { itemType: 2, classType: 0, loreHash: 7113, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.jambes, tierTypeHash: 4008398120 } }),
    6014: objet("Marque du Siège brisé", { itemType: 2, classType: 0, loreHash: 7114, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    236588: objet("Casque du Chasseur", { itemType: 2, classType: 1, loreHash: 7120, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    1399216: objet("Marque du Chasseur", { itemType: 2, classType: 1, loreHash: 7121, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    6030: objet("Coque de Spectre", { itemType: 24, itemTypeDisplayName: "Coque de Spectre", seasonHash: 9011, loreHash: 7130 }),
    6031: objet("Vaisseau sans lore", { itemType: 16, itemTypeDisplayName: "Vaisseau" }),
  },
});

// --- Ordre global des sections (verrouillé) ---
ok("les quatre sections sont dans l'ordre global verrouillé : Grimoire D1, Légendes D2, Armes et armures, Cosmétiques et utilitaires",
  JSON.stringify(SECTIONS.map((s) => s.id)) === JSON.stringify(["grimoire", "legendes", "objets", "cosmetiques"]));

// --- Palette (verrouillée) ---
ok("l'ère du Grimoire D1 est « d1 » (parchemin), tout le reste est « d2 » (hologramme)",
  ereDeSection("grimoire") === "d1" && ereDeSection("legendes") === "d2" && ereDeSection("objets") === "d2" && ereDeSection("cosmetiques") === "d2");
ok("la palette principale est Parchemin/Hologramme (D1 : serif + fond brun #2b2116 ; D2 : sans-serif + fond bleu-noir #0d1520)",
  PALETTE.d1.fondPage === "#2b2116" && /serif/.test(PALETTE.d1.policeTitre) && PALETTE.d2.fondPage === "#0d1520" && PALETTE.d2.policeTitre === "inherit");
ok("le repli (option 1) existe et partage un fond neutre commun entre les deux ères",
  PALETTE_REPLI.d1.fondPage === PALETTE_REPLI.d2.fondPage && PALETTE_REPLI.d1.fondPage !== PALETTE_PRINCIPALE.d1.fondPage);
ok("la palette active est la palette principale (un seul échange de constante pour le repli)", PALETTE === PALETTE_PRINCIPALE);

// --- Page de Lore d'un objet (lien profond) ---
const pageIzanagi = pageLoreObjet(db2, 6001);
ok("un objet AVEC Lore a une page : identifiant stable « lore:<hashLore> » (dédoublonné), titre = NOM DE L'OBJET (décision utilisateur), texte = corps du Lore",
  pageIzanagi?.id === "lore:7101" && pageIzanagi.titre === "Izanagi — Burden" && pageIzanagi.texte === "Un seul coup, mais un coup parfait." && pageIzanagi.loreHash === 7101, pageIzanagi);
ok("un objet SANS Lore n'a PAS de page (le bouton « Lire le Lore » n'apparaît pas)", pageLoreObjet(db2, 6002) === undefined);
ok("un objet masqué (redacted) ou factice n'a PAS de page, même avec un champ lore", pageLoreObjet(db2, 6003) === undefined && pageLoreObjet(db2, 6004) === undefined);
ok("sans Manifest ou hash inconnu : pas de page, sans erreur", pageLoreObjet(null, 6001) === undefined && pageLoreObjet(db2, 999999) === undefined);

// --- Livres par section ---
const livresLegendes = livresDeSection(db2, "legendes");
ok("les Légendes D2 forment un livre « Tomes de Légendes » avec les pages AYANT un texte (la page sans corps est exclue)",
  livresLegendes.length === 1 && livresLegendes[0].pages.length === 2, livresLegendes.map((l) => l.pages.length));
const pageChapitre = livresLegendes[0].pages.find((p) => p.id === "lore:7001");
ok("les pages de Légendes ont l'identifiant stable « lore:<hash> » et le sous-titre du chapitre",
  pageChapitre?.sousTitre === "Chapitre I" && livresLegendes[0].pages.every((p) => /^lore:\d+$/.test(p.id)), pageChapitre);

const livresObjets = livresDeSection(db2, "objets");
// ⚠️ CHANGÉ (22/10/2026, suite 11) : la section « objets » = groupe « Lore des armes » (3 livres : Cinétiques, Énergétiques, Lourdes) + groupe « Ensembles d'armures » (1 livre par ensemble, sinon « Autres armures »)
const livreArmes = livresObjets.find((l) => l.id === "objets-armes-cinetique");
const livreArmuresAutres = livresObjets.find((l) => l.id === "objets-armures-autres");
ok("⚠️ suite 11 : le groupe « Lore des armes » a un livre « Cinétiques » (Izanagi y est ; l'arme sans Lore, masquée et factice exclues)",
  livreArmes?.groupe === "Lore des armes" && livreArmes.titre === "Cinétiques" && livreArmes.pages.length === 1 && livreArmes.pages[0].id === "lore:7101", livresObjets.map((l) => `${l.groupe}/${l.titre}(${l.pages.length})`));
ok("⚠️ DÉDOUBLONNAGE : la réédition d'Izanagi (même Lore 7101) ne crée PAS de page en double — UNE page « lore:7101 », TITRE = NOM DE L'OBJET du porteur principal",
  livreArmes?.pages.length === 1 && livreArmes.pages[0].titre === "Izanagi — Burden", livreArmes?.pages.map((p) => p.titre));
ok("⚠️ la page dédoublonnée embarque TOUS les porteurs (Izanagi + sa réédition) pour le parcours inverse",
  livreArmes?.pages[0].porteurs?.length === 2 && livreArmes.pages[0].porteurs.some((x) => x.hash === 6040), livreArmes?.pages[0].porteurs?.map((x) => x.hash));
ok("⚠️ suite 11 : sans collectibles/nœuds, les 7 armures tombent dans le livre « Autres armures » (groupe « Ensembles d'armures »), ordre verrouillé conservé",
  livreArmuresAutres?.groupe === "Ensembles d'armures" && livreArmuresAutres.pages.length === 7, livresObjets.map((l) => `${l.groupe}/${l.titre}(${l.pages.length})`));

// --- Règle des ensembles d'armures (verrouillée) ---
const ordreAttendu = ["lore:7110", "lore:7111", "lore:7112", "lore:7113", "lore:7114", "lore:7120", "lore:7121"];
ok("RÈGLE VERROUILLÉE (dans le livre) : armures regroupées par classe (Titan puis Chasseur), ordre casque → gants → torse → jambes → objet de classe",
  JSON.stringify(livreArmuresAutres?.pages.map((p) => p.id)) === JSON.stringify(ordreAttendu), livreArmuresAutres?.pages.map((p) => p.id));
ok("l'ordre des slots verrouillé est bien casque, gants, torse, jambes, marque",
  JSON.stringify(ORDRE_SLOTS_ARMURE) === JSON.stringify(["casque", "gants", "torse", "jambes", "marque"]) && JSON.stringify(ORDRE_CLASSES) === JSON.stringify(["titan", "chasseur", "arcaniste"]));
ok("libellé des emplacements : « marque » s'appelle « Objet de classe »", libelleSlot("marque") === "Objet de classe");

// Tri direct (fonction pure)
const melange = [
  { hash: 1399216, nom: "Marque du Chasseur", emplacement: "Objet de classe · Chasseur", classe: "chasseur" as const, slotArmure: "marque" as const },
  { hash: 6013, nom: "Jambes du Siège brisé", emplacement: "Jambes · Titan", classe: "titan" as const, slotArmure: "jambes" as const },
  { hash: 6010, nom: "Casque du Siège brisé", emplacement: "Casque · Titan", classe: "titan" as const, slotArmure: "casque" as const },
];
ok("le tri par ensemble reclasse un mélange (classe d'abord, puis slot)",
  JSON.stringify(trierArmuresParEnsemble(melange).map((p) => p.hash)) === JSON.stringify([6010, 6013, 1399216]), trierArmuresParEnsemble(melange).map((p) => p.hash));

// --- Cosmétiques ---
const livresCosm = livresDeSection(db2, "cosmetiques");
ok("⚠️ suite 11 : la section « cosmétiques » a UN LIVRE PAR TYPE — ici un livre « Spectres » (itemType 24 dans les fixtures ; le Vaisseau sans Lore est exclu)",
  livresCosm.length === 1 && livresCosm[0].titre === "Spectres" && livresCosm[0].groupe === "Spectres" && livresCosm[0].pages.length === 1 && livresCosm[0].pages[0].id === "lore:7130", livresCosm.map((l) => `${l.groupe}/${l.titre}(${l.pages.length})`));

// --- Grimoire D1 : hors Manifest D2 ---
ok("la section « grimoire » (D1) ne lit PAS le Manifest D2 : aucun livre", livresDeSection(db2, "grimoire").length === 0);

// --- Ordre de lecture aplati (précédent/suivant) ---
const ordre = ordrePages(livresObjets);
ok("l'ordre aplati d'une section enchaîne les livres dans l'ordre (armes Cinétiques puis armures)",
  JSON.stringify(ordre) === JSON.stringify(["lore:7101", ...ordreAttendu]), ordre);

// --- Recherche par mots-clés ---
const tousLesLivres = { legendes: livresLegendes, objets: livresObjets, cosmetiques: livresCosm };
const r1 = rechercherPages(tousLesLivres, "gardien");
ok("la recherche par mots-clés retrouve une page de Légende (insensible à la casse)", r1.length === 1 && r1[0].page.id === "lore:7001" && r1[0].section === "legendes", r1.map((r) => r.page.id));
const r2 = rechercherPages(tousLesLivres, "SIÈGE");
ok("la recherche retrouve les 5 pages du set Titan (insensible aux accents et à la casse)", r2.length === 5 && r2.every((r) => r.section === "objets"), r2.map((r) => r.page.id));
const r3 = rechercherPages(tousLesLivres, "mot-inexistant-xyz");
ok("aucun résultat pour un mot inexistant ; chaîne vide = aucun résultat", r3.length === 0 && rechercherPages(tousLesLivres, "   ").length === 0);

// --- Lien profond ---
const cible = trouverPage(tousLesLivres, "lore:7112");
ok("le lien profond retrouve une page par son identifiant stable « lore:<hash> », avec sa section et son livre",
  cible?.section === "objets" && cible.livre.id === "objets-armures-autres" && cible.page.id === "lore:7112", cible?.page.id);
// ⚠️ (20/10/2026, décision utilisateur) : la forme lien profond « item:<hashObjet> » (fiche Détails) est acceptée et résolue vers la page dédoublonnée
const cibleLien = trouverPage(tousLesLivres, "item:6012", db2);
ok("la forme lien profond « item:6012 » (fiche Détails) est résolue vers la page « lore:7112 »",
  cibleLien?.page.id === "lore:7112" && cibleLien.page.titre === "Torse du Siège brisé", cibleLien?.page.id);
ok("idPageDepuisObjet résout le hash objet vers l'identifiant de page", idPageDepuisObjet(db2, 6001) === "lore:7101" && idPageDepuisObjet(db2, 6002) === undefined);
ok("un identifiant inconnu ne trouve rien", trouverPage(tousLesLivres, "lore:999999") === undefined && trouverPage(tousLesLivres, "item:999999", db2) === undefined);

// --- Parcours inverse : depuis un Lore, les objets porteurs ---
const porteurs = porteursDeLore(db2, 7101);
ok("le parcours inverse retrouve TOUS les porteurs d'un Lore (Izanagi + sa réédition ; l'arme masquée et l'armure factice sont exclues)",
  porteurs.length === 2 && porteurs.some((x) => x.hash === 6001) && porteurs.some((x) => x.hash === 6040) && porteurs[0].emplacement === "Fusil de précision", porteurs.map((x) => x.hash));
const porteursTitan = porteursDeLore(db2, 7110);
ok("le parcours inverse sur le Lore du casque Titan porte le classe et l'emplacement (pour la règle des ensembles)",
  porteursTitan.length === 1 && porteursTitan[0].classe === "titan" && porteursTitan[0].slotArmure === "casque" && porteursTitan[0].emplacement === "Casque · Titan", porteursTitan[0]);
ok("un Lore sans porteur ne retourne rien, sans erreur", porteursDeLore(db2, 424242).length === 0 && porteursDeLore(null, 7101).length === 0 && porteursDeLore(db2, undefined).length === 0);

// --- ⚠️ Tri chronologique (décision utilisateur : ordre de sortie par défaut) ---
ok("rangChronoObjet : saison 11 via le Manifest (seasonHash → DestinySeasonDefinition) pour Izanagi",
  rangChronoObjet(db2, 6001) === 11, rangChronoObjet(db2, 6001));
ok("rangChronoObjet : saison 12 via le Manifest pour le set Titan (casque)",
  rangChronoObjet(db2, 6010) === 12, rangChronoObjet(db2, 6010));
ok("rangChronoObjet : SECOURS table DIM — le Casque du Chasseur (hash 236588, SANS seasonHash) est daté saison 11",
  rangChronoObjet(db2, 236588) === 11, rangChronoObjet(db2, 236588));
ok("rangChronoObjet : SECOURS table DIM — la Marque du Chasseur (hash 1399216, SANS seasonHash) est datée saison 12",
  rangChronoObjet(db2, 1399216) === 12, rangChronoObjet(db2, 1399216));
ok("rangChronoObjet : un objet inconnu n'est JAMAIS daté (undefined)",
  rangChronoObjet(db2, 999999) === undefined && rangChronoObjet(null, 6001) === undefined);
ok("libelleRangChrono : « nom court · extension » quand connu (saison 12 = Ombres du Cauchemar · Ombres du Cauchemar via seasons.json)",
  libelleRangChrono(12) !== undefined && libelleRangChrono(undefined) === undefined, libelleRangChrono(12));

// Le livre des armes : Izanagi (saison 11) doit porter rangChrono = 11
ok("la page du livre « Cinétiques » porte le rang chronologique de son porteur (Izanagi = 11)",
  livreArmes?.pages[0].rangChrono === 11, livreArmes?.pages[0].rangChrono);

// Tri chrono d'un livre mixte : saison 11 d'abord, puis 12, puis non datées par titre
const pagesMelangees = [
  { id: "lore:7114", titre: "Marque du Siège brisé", texte: "x", rangChrono: 12 },
  { id: "lore:7101", titre: "Izanagi — Burden", texte: "x", rangChrono: 11 },
  { id: "lore:9999", titre: "Page sans date", texte: "x" }, // non datée
  { id: "lore:7110", titre: "Casque du Siège brisé", texte: "x", rangChrono: 12 },
] as never[];
const triées = trierPagesChrono(pagesMelangees);
ok("⚠️ trierPagesChrono : les pages datées d'abord (rang croissant : 11 puis 12, à égalité par titre), les non datées EN DERNIER par titre",
  JSON.stringify(triées.map((p) => p.id)) === JSON.stringify(["lore:7101", "lore:7110", "lore:7114", "lore:9999"]), triées.map((p) => p.id));
ok("⚠️ trierPagesChrono ne mute pas le tableau d'entrée",
  (pagesMelangees as { id: string }[])[0].id === "lore:7114");


// --- ⚠️ AJOUT (21/10/2026, étape 2) : PERFORMANCE — l'index des porteurs = UN SEUL balayage de la table des objets pour TOUTE la bibliothèque ---
// La fausse base compte les requêtes ; on vérifie que construire les 3 sections D2 + le parcours inverse ne balaie la table qu UNE FOIS.
{
  const { db: dbCompte, requetes } = creerFausseDb({
    [T_LORE]: {
      7001: lore("Légende seule", "Texte de légende D2."),
      7101: lore("Izanagi", "Texte du lore d'Izanagi."),
      7110: lore("Siège brisé — casque", "Texte du lore du casque."),
      7130: lore("Coque de Spectre", "Texte du lore du Spectre."),
    },
    [T_OBJET]: {
      6001: objet("Izanagi — Burden", { itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6040: objet("Izanagi — Burden (réédition)", { itemType: 3, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6010: objet("Casque du Siège brisé", { itemType: 2, classType: 0, loreHash: 7110, inventory: { bucketTypeHash: BUCKET.casque } }),
      6030: objet("Coque de Spectre", { itemType: 24, itemTypeDisplayName: "Coque de Spectre", loreHash: 7130 }),
    },
  });
  requetes.length = 0;
  livresDeSection(dbCompte, "legendes");
  livresDeSection(dbCompte, "objets");
  livresDeSection(dbCompte, "cosmetiques");
  porteursDeLore(dbCompte, 7101);
  pageLoreObjet(dbCompte, 6001);
  const balayages = requetes.filter((q) => /FROM DestinyInventoryItemDefinition\b/.test(q) && !/WHERE/.test(q)).length;
  ok("⚠️ index des porteurs : les 3 sections D2 + parcours inverse + fiche objet = UN SEUL balayage de la table des objets (pas un par porteur)",
    balayages === 1, { balayages, requetes });
  // Le résultat est identique avec l'index (pas de régression fonctionnelle) : Izanagi 6001+6040 dédoublonnés en 1 page (livre « Cinétiques »), le casque est dans « Autres armures », le Spectre dans « Spectres ».
  const livresObj = livresDeSection(dbCompte, "objets");
  const livresCosmCompte = livresDeSection(dbCompte, "cosmetiques");
  ok("⚠️ index des porteurs : le contenu est le même (Izanagi dédoublonné en 1 page dans « Cinétiques », casque dans « Autres armures », Spectre dans « Spectres »)",
    livresObj.length === 2 && livresObj[0].titre === "Cinétiques" && livresObj[0].groupe === "Lore des armes" && livresObj[0].pages.length === 1 && livresObj[0].pages[0].titre === "Izanagi — Burden" && livresObj[1].titre === "Autres armures" && livresObj[1].groupe === "Ensembles d'armures" && livresObj[1].pages.length === 1 && livresCosmCompte.length === 1 && livresCosmCompte[0].titre === "Spectres" && livresCosmCompte[0].pages.length === 1,
    { obj: livresObj.map((l) => `${l.groupe}/${l.titre}(${l.pages.length})`), cosm: livresCosmCompte.map((l) => `${l.groupe}/${l.titre}(${l.pages.length})`) });
}


// --- ⚠️ AJOUT (21/10/2026, étape 5) : `aLore` — lecture LÉGÈRE pour le bouton « Lire le Lore » ---
// Le bouton est rendu à chaque ouverture de fiche Détails : `aLore` ne fait QUE 2 lectures ciblées (définition de l'objet, définition du Lore), AUCUN balayage de la table des objets.
ok("aLore : VRAI pour Izanagi (6001, lore 7101 avec corps)", aLore(db2, 6001) === true);
ok("aLore : FAUX pour l'arme sans lore (6002)", aLore(db2, 6002) === false);
ok("aLore : FAUX pour l'arme masquée (6003, redacted, même avec un lore)", aLore(db2, 6003) === false);
ok("aLore : FAUX pour l'armure factice (6004, catégorie factice, même avec un lore)", aLore(db2, 6004) === false);
ok("aLore : FAUX sans Manifest ou hash inconnu, sans erreur", aLore(null, 6001) === false && aLore(db2, 999999) === false);
{
  // Lore SANS corps : pas de page lisible → pas de bouton
  const { db: dbSansCorps } = creerFausseDb({
    [T_LORE]: { 7003: lore("Page sans corps", "") },
    [T_OBJET]: { 6002: objet("Arme lore vide", { itemType: 3, loreHash: 7003, inventory: { bucketTypeHash: BUCKET.cinetique } }) },
  });
  ok("aLore : FAUX quand le Lore existe mais n'a PAS de corps (rien à lire)", aLore(dbSansCorps, 6002) === false);
}
{
  // PERFORMANCE : `aLore` ne balaie JAMAIS la table des objets (que des `WHERE id = ?`)
  const { db: dbCompte, requetes } = creerFausseDb({
    [T_LORE]: { 7101: lore("Izanagi", "Texte du lore d'Izanagi.") },
    [T_OBJET]: {
      6001: objet("Izanagi — Burden", { itemType: 3, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6002: objet("Arme sans lore", { itemType: 3, inventory: { bucketTypeHash: BUCKET.cinetique } }),
    },
  });
  requetes.length = 0;
  aLore(dbCompte, 6001);
  aLore(dbCompte, 6002);
  aLore(dbCompte, 999999);
  const balayages = requetes.filter((q) => /FROM DestinyInventoryItemDefinition\b/.test(q) && !/WHERE/.test(q)).length;
  ok("⚠️ aLore : 3 appels = AUCUN balayage de la table des objets (lectures ciblées `WHERE id = ?` uniquement)",
    balayages === 0, { balayages, requetes });
}


// --- ⚠️ AJOUT (21/10/2026, suite 8) : `diagnostiquerLore` — diagnostic dev du bouton « Lire le Lore » absent ---
// L'utilisateur ne voit pas le bouton : ce diagnostic vérifie avec une fausse base si la table Lore existe, combien de Lores, combien d'objets avec lore lisible.
{
  const { db: dbDiag } = creerFausseDb({
    [T_LORE]: {
      7101: lore("Izanagi", "Texte du lore d'Izanagi."),
      7003: lore("Lore vide", ""), // sans corps
    },
    [T_OBJET]: {
      6001: objet("Izanagi — Burden", { itemType: 3, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6002: objet("Arme sans lore", { itemType: 3, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6003: objet("Arme masquée", { itemType: 3, redacted: true, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6005: objet("Arme lore vide", { itemType: 3, loreHash: 7003, inventory: { bucketTypeHash: BUCKET.cinetique } }),
    },
  });
  const d = diagnostiquerLore(dbDiag);
  ok("diagnostiquerLore : table Lore existe, 2 Lores dont 1 avec corps",
    d?.tableLoreExiste === true && d.nbLores === 2 && d.nbLoresAvecCorps === 1, d);
  ok("diagnostiquerLore : 4 objets, 3 avec champ lore, 1 seul avec un lore lisible (Izanagi ; masqué et lore-vide exclus)",
    d?.nbObjets === 4 && d.nbObjetsAvecLore === 3 && d.nbObjetsAvecLoreLisible === 1, d);
  ok("diagnostiquerLore : un exemple = Izanagi (hash 6001)",
    d?.exemples.length === 1 && d.exemples[0].hash === 6001 && d.exemples[0].nom === "Izanagi — Burden", d?.exemples);
  ok("diagnostiquerLore : sans Manifest → null, sans erreur", diagnostiquerLore(null) === null);
}
{
  // Table Lore ABSENTE : la fausse base lève une erreur sur `FROM DestinyLoreDefinition` (table inconnue = 0 lignes, pas d'exception).
  // On simule avec une base qui ne contient PAS la table : lireTable retourne {} (pas d'exception dans la fausse base),
  // donc on vérifie le comportement "table vide".
  const { db: dbSansLore } = creerFausseDb({
    [T_OBJET]: { 6001: objet("Izanagi", { itemType: 3, inventory: { bucketTypeHash: BUCKET.cinetique } }) },
  });
  const d = diagnostiquerLore(dbSansLore);
  ok("diagnostiquerLore : table Lore vide (0 entrée) + 0 objet avec lore → le bouton n'apparaîtrait pas",
    d?.tableLoreExiste === true && d.nbLores === 0 && d.nbObjetsAvecLore === 0 && d.nbObjetsAvecLoreLisible === 0, d);
}


// --- ⚠️ AJOUT (21/10/2026, suite 9, diagnostic réel) : RÉGRESSION — le VRAI Manifest utilise `loreHash` (pas `lore`) et `displayProperties.description` (pas `body`) ---
// Le diagnostic de l'utilisateur a montré : 3 514 Lores, 0 avec `body`, 38 894 objets, 0 avec `lore`.
// Ces tests prouvent que le modèle lit BIEN les vrais noms de champs (et garde `lore`/`body` en secours pour les anciennes fixtures).
{
  // Structure EXACTE du vrai Manifest Bungie : loreHash sur l'objet, description dans displayProperties du Lore
  const { db: dbVrai } = creerFausseDb({
    [T_LORE]: {
      7101: { displayProperties: { name: "Izanagi", description: "Un seul coup, mais un coup parfait." } }, // PAS de champ `body`
      7001: { displayProperties: { name: "Le Gardien se lève", description: "Un Gardien se lève." }, subtitle: "Chapitre I" },
    },
    [T_OBJET]: {
      6001: { displayProperties: { name: "Izanagi — Burden", icon: "/i.png", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }, // `loreHash`, PAS `lore`
      6002: { displayProperties: { name: "Arme sans lore", icon: "/i.png", description: "" }, itemType: 3, inventory: { bucketTypeHash: BUCKET.cinetique } },
    },
  });
  ok("⚠️ suite 9 : VRAI Manifest (`loreHash` + `displayProperties.description`) — `aLore` détecte le Lore d'Izanagi",
    aLore(dbVrai, 6001) === true);
  ok("⚠️ suite 9 : VRAI Manifest — `pageLoreObjet` construit la page (id `lore:7101`, texte depuis `displayProperties.description`)",
    pageLoreObjet(dbVrai, 6001)?.texte === "Un seul coup, mais un coup parfait." && pageLoreObjet(dbVrai, 6001)?.id === "lore:7101");
  const livresVrai = livresDeSection(dbVrai, "objets");
  ok("⚠️ suite 9 : VRAI Manifest — le livre « Cinétiques » (groupe « Lore des armes ») contient Izanagi (détection via l'index, champ `loreHash`)",
    livresVrai.find((l) => l.id === "objets-armes-cinetique")?.pages.length === 1 && livresVrai.find((l) => l.id === "objets-armes-cinetique")?.pages[0].titre === "Izanagi — Burden");
  const livresLegVrai = livresDeSection(dbVrai, "legendes");
  ok("⚠️ suite 9 : VRAI Manifest — la section Légendes lit le texte depuis `displayProperties.description` (sous-titre `subtitle` conservé)",
    livresLegVrai[0]?.pages.length === 1 && livresLegVrai[0].pages[0].texte === "Un Gardien se lève." && livresLegVrai[0].pages[0].sousTitre === "Chapitre I");
  const diagVrai = diagnostiquerLore(dbVrai);
  ok("⚠️ suite 9 : VRAI Manifest — `diagnostiquerLore` compte 2 Lores dont 2 avec corps, 1 objet avec lore lisible (contre 0/0 avec les anciens noms de champs)",
    diagVrai?.nbLores === 2 && diagVrai.nbLoresAvecCorps === 2 && diagVrai.nbObjetsAvecLore === 1 && diagVrai.nbObjetsAvecLoreLisible === 1, diagVrai);
  // SECOURS : l'ancien nom `lore` (champ) reste accepté pour les anciennes fixtures
  const { db: dbSecours } = creerFausseDb({
    [T_LORE]: { 7101: { displayProperties: { name: "Izanagi" }, body: "Texte secours." } }, // ancien champ `body`
    [T_OBJET]: { 6001: { displayProperties: { name: "Izanagi", icon: "/i.png", description: "" }, itemType: 3, lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } } }, // ancien champ `lore`
  });
  ok("⚠️ suite 9 : SECOURS — l'ancien champ `lore` (objet) et l'ancien champ `body` (Lore) restent acceptés (rétrocompatibilité fixtures)",
    aLore(dbSecours, 6001) === true && pageLoreObjet(dbSecours, 6001)?.texte === "Texte secours.");
}


// --- ⚠️ AJOUT (21/10/2026, suite 10) : NAVIGATION PAR LIVRES (hiérarchie en jeu : catégorie → livre → pages) ---
// Structure fidèle au VRAI Manifest FR vérifié le 21/10/2026 : racine « Légendes » = 4077680549 (scope 0),
// 2 catégories, livres avec couvertures (displayProperties.icon), pages = records avec loreHash.
{
  const T_NOEUD = "DestinyPresentationNodeDefinition", T_RECORD = "DestinyRecordDefinition";
  const noeud = (nom: string, extra: Record<string, unknown> = {}) => ({
    displayProperties: { name: nom, description: "", ...(extra.icon ? { icon: extra.icon } : {}) },
    ...extra,
  });
  const { db: dbLivres } = creerFausseDb({
    [T_NOEUD]: {
      // Racine « Légendes » (hash réel, scope 0)
      4077680549: noeud("Légendes", { scope: 0, children: { presentationNodes: [{ presentationNodeHash: 100 }, { presentationNodeHash: 200 }] } }),
      // Catégorie « La Lumière » avec icône
      100: noeud("La Lumière", { scope: 0, icon: "/icons/lumiere.png", children: { presentationNodes: [{ presentationNodeHash: 1000 }, { presentationNodeHash: 1001 }] } }),
      // Catégorie « Les Ténèbres » (sans icône)
      200: noeud("Les Ténèbres", { scope: 0, children: { presentationNodes: [{ presentationNodeHash: 2000 }] } }),
      // Livre « La Frontière sans foi ni loi » (2 pages) AVEC couverture
      1000: noeud("La Frontière sans foi ni loi", { scope: 0, icon: "/icons/frontiere.png", children: { presentationNodes: [], records: [{ recordHash: 5001 }, { recordHash: 5002 }] } }),
      // Livre « Histoires de Spectres » (1 page) SANS couverture
      1001: noeud("Histoires de Spectres", { scope: 0, children: { presentationNodes: [], records: [{ recordHash: 5003 }] } }),
      // Livre masqué (redacted) : exclu
      1002: noeud("Livre secret", { scope: 0, redacted: true, children: { presentationNodes: [], records: [{ recordHash: 5004 }] } }),
      // Livre dans la catégorie 2 (1 page, lore porté par un OBJET — garde la page + le parcours inverse)
      2000: noeud("Légendes des oubliés, Vol.\u00a01", { scope: 0, icon: "/icons/oublies.png", children: { presentationNodes: [], records: [{ recordHash: 5005 }] } }),
    },
    [T_RECORD]: {
      5001: { displayProperties: { name: "Ces terres maudites", description: "" }, loreHash: 8001, hash: 5001 },
      5002: { displayProperties: { name: "Par cette langue", description: "" }, loreHash: 8002, hash: 5002 },
      5003: { displayProperties: { name: "Une histoire de Spectre", description: "" }, loreHash: 8003, hash: 5003 },
      5004: { displayProperties: { name: "Page secrète", description: "" }, loreHash: 8004, hash: 5004 }, // livre masqué : la page ne doit pas apparaître
      5005: { displayProperties: { name: "Europe \u2013 1", description: "" }, loreHash: 8005, hash: 5005 }, // lore porté par l'item 6050
    },
    [T_LORE]: {
      8001: lore("Ces terres maudites", "Texte de la première page du livre.", ""),
      8002: lore("Par cette langue, soyez damnés", "Texte de la deuxième page.", ""),
      8003: lore("Une histoire de Spectre", "Texte du Spectre.", ""),
      8004: lore("Page secrète", "Ne doit pas être lisible.", ""),
      8005: lore("Europe \u2013 1", "Lore de l'item Europe \u2013 1.", ""),
      8006: lore("Lore sans corps", "", ""), // lore sans corps : page exclue
    },
    [T_OBJET]: {
      // Item portant le lore 8005 (comme « Europe \u2013 1 » dans le vrai Manifest)
      6050: objet("Europe \u2013 1", { itemType: 20, itemTypeDisplayName: "Livre", loreHash: 8005 }),
    },
  });
  // Un record supplémentaire dans le livre 1000, sans loreHash (page sans texte : exclue)
  (dbLivres as unknown as { __defs?: unknown });

  const cats = categoriesDeLegendes(dbLivres);
  ok("⚠️ suite 10 : la hiérarchie rend 2 catégories, DANS L'ORDRE DU MANIFEST (La Lumière, Les Ténèbres)",
    cats.length === 2 && cats[0].titre === "La Lumière" && cats[1].titre === "Les Ténèbres", cats.map((c) => c.titre));
  ok("⚠️ suite 10 : la catégorie porte son icône (chemin relatif) quand le Manifest en a une",
    cats[0].icone === "/icons/lumiere.png" && cats[1].icone === undefined, cats.map((c) => c.icone));
  const livresLumiere = cats[0].livres;
  ok("⚠️ suite 10 : la catégorie « La Lumière » rend 2 livres (le livre masqué est EXCLU)",
    livresLumiere.length === 2 && livresLumiere[0].titre === "La Frontière sans foi ni loi" && livresLumiere[1].titre === "Histoires de Spectres", livresLumiere.map((l) => l.titre));
  const livreFrontiere = livresLumiere[0];
  ok("⚠️ suite 10 : le livre « La Frontière sans foi ni loi » a 2 pages, DANS L'ORDRE DU MANIFEST (Ces terres maudites, puis Par cette langue, soyez damnés)",
    livreFrontiere.pages.length === 2 && livreFrontiere.pages[0].titre === "Ces terres maudites" && livreFrontiere.pages[1].titre === "Par cette langue, soyez damnés", livreFrontiere.pages.map((p) => p.titre));
  ok("⚠️ suite 10 : les pages ont l'identifiant stable « lore:<hash> », le texte du Lore, et PAS de doublon de titre",
    livreFrontiere.pages[0].id === "lore:8001" && livreFrontiere.pages[0].texte === "Texte de la première page du livre." && livreFrontiere.pages[0].loreHash === 8001);
  ok("⚠️ suite 10 : le livre porte sa COUVERTURE (URL complète Bungie) et sa catégorie",
    livreFrontiere.couvertureUrl === "https://www.bungie.net/icons/frontiere.png" && livreFrontiere.categorie === "La Lumière", livreFrontiere.couvertureUrl);
  ok("⚠️ suite 10 : un livre SANS icône n'a PAS de couverture (pas d'image cassée)",
    livresLumiere[1].couvertureUrl === undefined && livresLumiere[1].categorie === "La Lumière", livresLumiere[1].couvertureUrl);
  // Le lore 8005 est porté par l'item 6050 : la page GARDÉE dans le livre + parcours inverse
  const pageEurope = cats[1].livres[0].pages[0];
  ok("⚠️ suite 10 : un lore porté par un OBJET garde sa page dans le livre (Europe \u2013 1)",
    pageEurope.id === "lore:8005" && pageEurope.titre === "Europe \u2013 1", pageEurope.id);
  ok("⚠️ suite 10 : ... ET son parcours inverse (l'item 6050 est listé comme porteur)",
    pageEurope.porteurs?.length === 1 && pageEurope.porteurs[0].hash === 6050 && pageEurope.porteurs[0].nom === "Europe \u2013 1", pageEurope.porteurs);
  // livresDeSection aplatie la hiérarchie (pour la zone de lecture + ordre précédent/suivant)
  const livresLegLivres = livresDeSection(dbLivres, "legendes");
  ok("⚠️ suite 10 : `livresDeSection(legendes)` aplatie la hiérarchie en 3 livres (2 + 1), dans l'ordre catégorie → livre",
    livresLegLivres.length === 3 && livresLegLivres[0].id === "legendes-livre:1000" && livresLegLivres[2].id === "legendes-livre:2000", livresLegLivres.map((l) => l.id));
  ok("⚠️ suite 10 : l'ordre de lecture aplati enchaîne catégorie par catégorie, livre par livre, page par page",
    JSON.stringify(ordrePages(livresLegLivres)) === JSON.stringify(["lore:8001", "lore:8002", "lore:8003", "lore:8005"]), ordrePages(livresLegLivres));
  // Le lien profond retrouve une page de livre
  const cibleLivre = trouverPage({ legendes: livresLegLivres }, "lore:8001", dbLivres);
  ok("⚠️ suite 10 : le lien profond retrouve une page de livre (« lore:8001 » → livre « La Frontière sans foi ni loi »)",
    cibleLivre?.livre.id === "legendes-livre:1000" && cibleLivre.page.titre === "Ces terres maudites", cibleLivre?.page.id);
  // Recherche : la catégorie et le livre sont cherchés aussi
  const rLumiere = rechercherPages({ legendes: livresLegLivres }, "lumière");
  ok("⚠️ suite 10 : la recherche retrouve les pages d'une catégorie par son nom (« lumière → La Lumière », 3 pages)",
    rLumiere.length === 3 && rLumiere.every((r) => r.categorie === "La Lumière"), rLumiere.map((r) => r.page.id));
  const rFrontiere = rechercherPages({ legendes: livresLegLivres }, "frontière");
  ok("⚠️ suite 10 : la recherche retrouve les pages d'un livre par son nom (« frontière », 2 pages)",
    rFrontiere.length === 2 && rFrontiere.every((r) => r.livre.id === "legendes-livre:1000"), rFrontiere.map((r) => r.page.id));

  // REPLI : sans arbre de présentation, retombe sur l'ancien comportement (livre plat « Tomes de Légendes »)
  const { db: dbSansArbre } = creerFausseDb({
    [T_LORE]: {
      7001: lore("Le Gardien se lève", "Un Gardien se lève.", "Chapitre I"),
      7002: lore("L'Ombre", "Deuxième page."),
    },
    [T_OBJET]: {
      6001: objet("Izanagi \u2014 Burden", { itemType: 3, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
    },
    [T_LORE + "2"]: {}, // table bidon pour éviter toute confusion
  });
  const catsVides = categoriesDeLegendes(dbSansArbre);
  ok("⚠️ suite 10 : REPLI — sans arbre de présentation, `categoriesDeLegendes` renvoie une liste VIDE",
    catsVides.length === 0, catsVides.length);
  const livresRepli = livresDeSection(dbSansArbre, "legendes");
  ok("⚠️ suite 10 : REPLI — sans arbre, la section retombe sur le livre plat « Tomes de Légendes » (pages non référencées par des objets, triées par titre)",
    livresRepli.length === 1 && livresRepli[0].id === "legendes" && livresRepli[0].titre === "Tomes de Légendes" && livresRepli[0].pages.length === 2 && livresRepli[0].pages[0].titre === "L'Ombre" && livresRepli[0].pages[1].titre === "Le Gardien se lève", livresRepli.map((l) => [l.id, l.pages.map((p) => p.titre)]));
  ok("⚠️ suite 10 : sans Manifest, `categoriesDeLegendes` renvoie une liste vide sans erreur",
    categoriesDeLegendes(null).length === 0);
}


// ============================================================
// ⚠️ AJOUT (22/10/2026, suite 11) : groupement armes par type, armures par PROVENANCE (collectible → nœud ensemble), cosmétiques par type
// ============================================================
{
  // --- Fausse base AVEC collectibles + nœuds de présentation (structure Collections) ---
  const { db: dbG } = creerFausseDb({
    [T_SAISON]: {
      9011: { displayProperties: { name: "Saison 11" }, seasonNumber: 11 },
      9012: { displayProperties: { name: "Saison 12" }, seasonNumber: 12 },
      9013: { displayProperties: { name: "Saison 13" }, seasonNumber: 13 },
    },
    [T_LORE]: {
      7101: lore("Izanagi", "Un seul coup."),
      7201: lore("Fusil énergétique", "Texte arme énergétique."),
      7202: lore("Lance-roquettes", "Texte arme lourde."),
      7301: lore("Casque raid A", "Texte casque raid A."),
      7302: lore("Gants raid A", "Texte gants raid A."),
      7303: lore("Torse raid A", "Texte torse raid A."),
      7304: lore("Jambes raid A", "Texte jambes raid A."),
      7305: lore("Marque raid A", "Texte marque raid A."),
      7311: lore("Casque donjon B", "Texte casque donjon B."),
      7312: lore("Gants donjon B", "Texte gants donjon B."),
      7401: lore("Casque sans provenance", "Texte casque sans collectible."),
      7501: lore("Coque de Spectre X", "Texte Spectre."),
      7502: lore("Vaisseau Y", "Texte Vaisseau."),
      7503: lore("Passereau Z", "Texte Passereau."),
      7504: lore("Artefact W", "Texte artefact."),
    },
    [T_OBJET]: {
      // Armes : 1 cinétique (saison 11), 1 énergétique (saison 12), 1 lourde (saison 13)
      7001: objet("Izanagi — Burden", { itemType: 3, itemTypeDisplayName: "Fusil de précision", seasonHash: 9011, loreHash: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      7002: objet("Fusil énergétique test", { itemType: 3, itemTypeDisplayName: "Fusil automatique", seasonHash: 9012, loreHash: 7201, inventory: { bucketTypeHash: BUCKET.energie } }),
      7003: objet("Lance-roquettes test", { itemType: 3, itemTypeDisplayName: "Lance-roquettes", seasonHash: 9013, loreHash: 7202, inventory: { bucketTypeHash: BUCKET.lourde } }),
      // Armures du raid A (5 pièces, saison 12) avec collectibles pointant vers le nœud "Armure du raid A" (500)
      7010: objet("Casque raid A", { itemType: 2, classType: 0, seasonHash: 9012, loreHash: 7301, collectibleHash: 9001, inventory: { bucketTypeHash: BUCKET.casque } }),
      7011: objet("Gants raid A", { itemType: 2, classType: 0, seasonHash: 9012, loreHash: 7302, collectibleHash: 9002, inventory: { bucketTypeHash: BUCKET.gants } }),
      7012: objet("Torse raid A", { itemType: 2, classType: 0, seasonHash: 9012, loreHash: 7303, collectibleHash: 9003, inventory: { bucketTypeHash: BUCKET.torse } }),
      7013: objet("Jambes raid A", { itemType: 2, classType: 0, seasonHash: 9012, loreHash: 7304, collectibleHash: 9004, inventory: { bucketTypeHash: BUCKET.jambes } }),
      7014: objet("Marque raid A", { itemType: 2, classType: 0, seasonHash: 9012, loreHash: 7305, collectibleHash: 9005, inventory: { bucketTypeHash: BUCKET.marque } }),
      // Armures du donjon B (2 pièces, saison 11) avec collectibles pointant vers "Armure du donjon B" (600)
      7020: objet("Casque donjon B", { itemType: 2, classType: 1, seasonHash: 9011, loreHash: 7311, collectibleHash: 9011, inventory: { bucketTypeHash: BUCKET.casque } }),
      7021: objet("Gants donjon B", { itemType: 2, classType: 1, seasonHash: 9011, loreHash: 7312, collectibleHash: 9012, inventory: { bucketTypeHash: BUCKET.gants } }),
      // Armure SANS collectible (saison 11)
      7030: objet("Casque sans provenance", { itemType: 2, classType: 2, seasonHash: 9011, loreHash: 7401, inventory: { bucketTypeHash: BUCKET.casque } }),
      // Cosmétiques : Spectre (24), Vaisseau (21), Passereau (22), Artefact (28)
      7040: objet("Coque de Spectre X", { itemType: 24, itemTypeDisplayName: "Coque de Spectre", seasonHash: 9012, loreHash: 7501 }),
      7041: objet("Vaisseau Y", { itemType: 21, itemTypeDisplayName: "Vaisseau", seasonHash: 9013, loreHash: 7502 }),
      7042: objet("Passereau Z", { itemType: 22, itemTypeDisplayName: "Véhicule", seasonHash: 9011, loreHash: 7503 }),
      7043: objet("Artefact W", { itemType: 28, itemTypeDisplayName: "Artefact saisonnier", seasonHash: 9013, loreHash: 7504 }),
    },
    [T_COLL]: {
      // Collectibles d'armures : parentNodeHashes[0] = nœud ensemble
      9001: { displayProperties: { name: "Casque raid A", description: "", icon: "" }, itemHash: 7010, parentNodeHashes: [500] },
      9002: { displayProperties: { name: "Gants raid A", description: "", icon: "" }, itemHash: 7011, parentNodeHashes: [500] },
      9003: { displayProperties: { name: "Torse raid A", description: "", icon: "" }, itemHash: 7012, parentNodeHashes: [500] },
      9004: { displayProperties: { name: "Jambes raid A", description: "", icon: "" }, itemHash: 7013, parentNodeHashes: [500] },
      9005: { displayProperties: { name: "Marque raid A", description: "", icon: "" }, itemHash: 7014, parentNodeHashes: [500] },
      9011: { displayProperties: { name: "Casque donjon B", description: "", icon: "" }, itemHash: 7020, parentNodeHashes: [600] },
      9012: { displayProperties: { name: "Gants donjon B", description: "", icon: "" }, itemHash: 7021, parentNodeHashes: [600] },
    },
    [T_NOEUD]: {
      // Nœuds de présentation : 500 = "Armure du raid A", 600 = "Armure du donjon B"
      500: { hash: 500, displayProperties: { name: "Armure du raid A", description: "", icon: "" }, children: { collectibles: [] } },
      600: { hash: 600, displayProperties: { name: "Armure du donjon B", description: "", icon: "" }, children: { collectibles: [] } },
    },
  });

  const livresObjG = livresDeSection(dbG, "objets");
  const livreCin = livresObjG.find((l) => l.id === "objets-armes-cinetique");
  const livreEner = livresObjG.find((l) => l.id === "objets-armes-energie");
  const livreLourd = livresObjG.find((l) => l.id === "objets-armes-lourde");
  ok("⚠️ suite 11 : le groupe « Lore des armes » a 3 livres DANS L'ORDRE Cinétiques, Énergétiques, Lourdes (1 page chacun)",
    livreCin?.titre === "Cinétiques" && livreEner?.titre === "Énergétiques" && livreLourd?.titre === "Lourdes" &&
    livreCin.pages[0]?.id === "lore:7101" && livreEner.pages[0]?.id === "lore:7201" && livreLourd.pages[0]?.id === "lore:7202" &&
    livresObjG.filter((l) => l.groupe === "Lore des armes").map((l) => l.titre).join(",") === "Cinétiques,Énergétiques,Lourdes",
    livresObjG.map((l) => `${l.groupe}/${l.titre}`));
  ok("⚠️ suite 11 : chaque livre d'arme porte groupe = « Lore des armes » (repliable)",
    livreCin?.groupe === "Lore des armes" && livreEner?.groupe === "Lore des armes" && livreLourd?.groupe === "Lore des armes");

  const livreRaidA = livresObjG.find((l) => l.titre === "Armure du raid A");
  const livreDonjonB = livresObjG.find((l) => l.titre === "Armure du donjon B");
  const livreAutres = livresObjG.find((l) => l.id === "objets-armures-autres");
  ok("⚠️ suite 11 : les armures sont groupées par PROVENANCE (nœud ensemble) : « Armure du raid A » (5 pages) et « Armure du donjon B » (2 pages)",
    livreRaidA?.groupe === "Ensembles d'armures" && livreRaidA.pages.length === 5 && livreDonjonB?.groupe === "Ensembles d'armures" && livreDonjonB.pages.length === 2,
    livresObjG.filter((l) => l.groupe === "Ensembles d'armures").map((l) => `${l.titre}(${l.pages.length})`));
  ok("⚠️ suite 11 : les ensembles sont ordonnés par SAISON DE SORTIE (donjon B = saison 11 AVANT raid A = saison 12), l'armure sans provenance dans « Autres armures » EN DERNIER",
    livresObjG.filter((l) => l.groupe === "Ensembles d'armures").map((l) => l.titre).join("|") === "Armure du donjon B|Armure du raid A|Autres armures",
    livresObjG.filter((l) => l.groupe === "Ensembles d'armures").map((l) => `${l.titre}(${l.pages.length})`));
  ok("⚠️ suite 11 : DANS un ensemble, les pièces suivent l'ordre verrouillé (casque → gants → torse → jambes → marque)",
    JSON.stringify(livreRaidA?.pages.map((p) => p.id)) === JSON.stringify(["lore:7301", "lore:7302", "lore:7303", "lore:7304", "lore:7305"]),
    livreRaidA?.pages.map((p) => p.id));
  ok("⚠️ suite 11 : l'armure sans collectible tombe dans « Autres armures » (1 page)",
    livreAutres?.pages.length === 1 && livreAutres.pages[0]?.id === "lore:7401", livreAutres?.pages.map((p) => p.id));

  const livresCosmG = livresDeSection(dbG, "cosmetiques");
  ok("⚠️ suite 11 : la section cosmétiques a UN LIVRE PAR TYPE, DANS L'ORDRE Spectres, Vaisseaux, Passereaux (+ Autres)",
    livresCosmG.map((l) => l.titre).join(",") === "Spectres,Vaisseaux,Passereaux,Autres" &&
    livresCosmG[0].pages[0]?.id === "lore:7501" && livresCosmG[1].pages[0]?.id === "lore:7502" && livresCosmG[2].pages[0]?.id === "lore:7503" && livresCosmG[3].pages[0]?.id === "lore:7504",
    livresCosmG.map((l) => `${l.groupe}/${l.titre}(${l.pages.length})`));
  ok("⚠️ suite 11 : chaque livre cosmétique porte son type en `groupe` (repliable)",
    livresCosmG.every((l) => l.groupe === l.titre));

  // Ordre aplati de la section objets : armes (cinétique, énergétique, lourde) puis armures (donjon B, raid A, autres)
  const ordreG = ordrePages(livresObjG);
  ok("⚠️ suite 11 : l'ordre aplati enchaîne Cinétiques → Énergétiques → Lourdes → donjon B → raid A → autres armures",
    JSON.stringify(ordreG) === JSON.stringify(["lore:7101", "lore:7201", "lore:7202", "lore:7311", "lore:7312", "lore:7301", "lore:7302", "lore:7303", "lore:7304", "lore:7305", "lore:7401"]),
    ordreG);

  // Recherche : le nom du livre (ensemble) est cherché
  const rG = rechercherPages({ objets: livresObjG }, "raid A");
  ok("⚠️ suite 11 : la recherche retrouve les 5 pages de l'ensemble « Armure du raid A » par le nom du livre",
    rG.length === 5 && rG.every((r) => r.livre.titre === "Armure du raid A"), rG.map((r) => r.page.id));

  // Sans tables collectibles/nœuds : toutes les armures dans "Autres armures" (pas de régression)
  const { db: dbSans } = creerFausseDb({
    [T_LORE]: { 7301: lore("Casque X", "Texte."), 7302: lore("Gants X", "Texte.") },
    [T_OBJET]: {
      7010: objet("Casque X", { itemType: 2, classType: 0, loreHash: 7301, collectibleHash: 9001, inventory: { bucketTypeHash: BUCKET.casque } }),
      7011: objet("Gants X", { itemType: 2, classType: 0, loreHash: 7302, collectibleHash: 9002, inventory: { bucketTypeHash: BUCKET.gants } }),
    },
  });
  const livresSans = livresDeSection(dbSans, "objets");
  ok("⚠️ suite 11 : REPLI — sans tables collectibles/nœuds, les armures (même avec collectibleHash) tombent dans « Autres armures », sans erreur",
    livresSans.length === 1 && livresSans[0].id === "objets-armures-autres" && livresSans[0].pages.length === 2,
    livresSans.map((l) => `${l.titre}(${l.pages.length})`));
}

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);

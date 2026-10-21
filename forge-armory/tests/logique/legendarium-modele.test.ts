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
} from "../../src/lib/legendarium/modele";
import { ereDeSection, PALETTE, PALETTE_PRINCIPALE, PALETTE_REPLI } from "../../src/lib/legendarium/palette";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };

const T_OBJET = "DestinyInventoryItemDefinition";
const T_SAISON = "DestinySeasonDefinition";
const T_LORE = "DestinyLoreDefinition";
const BUCKET = { casque: 3448274439, gants: 3551918588, torse: 14239492, jambes: 20886954, marque: 1585787867, cinetique: 1498876634 };

const lore = (titre: string, corps: string, sousTitre?: string) => ({ displayProperties: { name: titre }, body: corps, ...(sousTitre ? { subtitle: sousTitre } : {}) });
const objet = (nom: string, extra: Record<string, unknown> = {}) => ({ displayProperties: { name: nom, icon: `/icons/${nom}.png`, description: "" }, ...extra });

const { db } = creerFausseDb({
  [T_LORE]: {
    7001: lore("Le Gardien se lève", "Un Gardien se lève, la Tour retient son souffle.", "Chapitre I"),
    7002: lore("L'Ombre", "Deuxième page de Légende D2 pour la démonstration de navigation."),
    7003: lore("Page sans corps", ""), // sans texte : exclue
  },
  [T_OBJET]: {
    // Arme avec Lore
    6001: objet("Izanagi — Burden", { itemType: 3, itemTypeDisplayName: "Fusil de précision", lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }),
    6040: objet("Izanagi — Burden (réédition)", { itemType: 3, itemTypeDisplayName: "Fusil de précision", lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }), // ⚠️ rééédition : MÊME Lore 7101
    // Arme SANS Lore (pas de champ `lore`)
    6002: objet("Arme sans lore", { itemType: 3, itemTypeDisplayName: "Fusil à pompe", inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 4008398120 } }),
    // Arme masquée (redacted) avec un lore : exclue
    6003: objet("Arme masquée", { itemType: 3, redacted: true, lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
    // Armure factice avec un lore : exclue
    6004: objet("Armure factice", { itemType: 2, lore: 7101, itemCategoryHashes: [3109687656], inventory: { bucketTypeHash: BUCKET.casque } }),
    // Ensemble Titan (ordre à vérifier : casque, gants, torse, jambes, marque)
    6010: objet("Casque du Siège brisé", { itemType: 2, classType: 0, lore: 7110, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    6011: objet("Gants du Siège brisé", { itemType: 2, classType: 0, lore: 7111, inventory: { bucketTypeHash: BUCKET.gants, tierTypeHash: 4008398120 } }),
    6012: objet("Torse du Siège brisé", { itemType: 2, classType: 0, lore: 7112, inventory: { bucketTypeHash: BUCKET.torse, tierTypeHash: 4008398120 } }),
    6013: objet("Jambes du Siège brisé", { itemType: 2, classType: 0, lore: 7113, inventory: { bucketTypeHash: BUCKET.jambes, tierTypeHash: 4008398120 } }),
    6014: objet("Marque du Siège brisé", { itemType: 2, classType: 0, lore: 7114, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    // Ensemble Chasseur (à classer APRÈS le Titan)
    6020: objet("Casque du Chasseur", { itemType: 2, classType: 1, lore: 7120, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    6021: objet("Marque du Chasseur", { itemType: 2, classType: 1, lore: 7121, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    // Cosmétique : Spectre avec Lore
    6030: objet("Coque de Spectre", { itemType: 14, itemTypeDisplayName: "Spectre", lore: 7130 }),
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
    6001: objet("Izanagi — Burden", { itemType: 3, itemTypeDisplayName: "Fusil de précision", seasonHash: 9011, lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }),
    6040: objet("Izanagi — Burden (réédition)", { itemType: 3, itemTypeDisplayName: "Fusil de précision", lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 2759499571 } }), // ⚠️ rééédition : MÊME Lore 7101
    6002: objet("Arme sans lore", { itemType: 3, itemTypeDisplayName: "Fusil à pompe", inventory: { bucketTypeHash: BUCKET.cinetique, tierTypeHash: 4008398120 } }),
    6003: objet("Arme masquée", { itemType: 3, redacted: true, lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
    6004: objet("Armure factice", { itemType: 2, lore: 7101, itemCategoryHashes: [3109687656], inventory: { bucketTypeHash: BUCKET.casque } }),
    6010: objet("Casque du Siège brisé", { itemType: 2, classType: 0, lore: 7110, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    6011: objet("Gants du Siège brisé", { itemType: 2, classType: 0, lore: 7111, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.gants, tierTypeHash: 4008398120 } }),
    6012: objet("Torse du Siège brisé", { itemType: 2, classType: 0, lore: 7112, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.torse, tierTypeHash: 4008398120 } }),
    6013: objet("Jambes du Siège brisé", { itemType: 2, classType: 0, lore: 7113, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.jambes, tierTypeHash: 4008398120 } }),
    6014: objet("Marque du Siège brisé", { itemType: 2, classType: 0, lore: 7114, seasonHash: 9012, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    236588: objet("Casque du Chasseur", { itemType: 2, classType: 1, lore: 7120, inventory: { bucketTypeHash: BUCKET.casque, tierTypeHash: 4008398120 } }),
    1399216: objet("Marque du Chasseur", { itemType: 2, classType: 1, lore: 7121, inventory: { bucketTypeHash: BUCKET.marque, tierTypeHash: 4008398120 } }),
    6030: objet("Coque de Spectre", { itemType: 14, itemTypeDisplayName: "Spectre", seasonHash: 9011, lore: 7130 }),
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
const livreArmes = livresObjets.find((l) => l.id === "objets-armes");
const livreArmures = livresObjets.find((l) => l.id === "objets-armures");
ok("la section « objets » a un livre « Lore des armes » (arme avec Lore seule ; l'arme sans Lore, masquée et factice exclues)",
  livreArmes?.pages.length === 1 && livreArmes.pages[0].id === "lore:7101", livreArmes?.pages.map((p) => p.id));
ok("⚠️ DÉDOUBLONNAGE : la rééédition d'Izanagi (même Lore 7101) ne crée PAS de page en double — UNE page « lore:7101 », TITRE = NOM DE L'OBJET du porteur principal",
  livreArmes?.pages.length === 1 && livreArmes.pages[0].titre === "Izanagi — Burden", livreArmes?.pages.map((p) => p.titre));
ok("⚠️ la page dédoublonnée embarque TOUS les porteurs (Izanagi + sa réédition) pour le parcours inverse",
  livreArmes?.pages[0].porteurs?.length === 2 && livreArmes.pages[0].porteurs.some((x) => x.hash === 6040), livreArmes?.pages[0].porteurs?.map((x) => x.hash));
ok("la section « objets » a un livre « Ensembles d'armures » avec 7 armures (Titan ×5 + Chasseur ×2)",
  livreArmures?.pages.length === 7, livreArmures?.pages.map((p) => p.titre));

// --- Règle des ensembles d'armures (verrouillée) ---
const ordreAttendu = ["lore:7110", "lore:7111", "lore:7112", "lore:7113", "lore:7114", "lore:7120", "lore:7121"];
ok("RÈGLE VERROUILLÉE : armures regroupées par classe (Titan puis Chasseur), ordre casque → gants → torse → jambes → objet de classe",
  JSON.stringify(livreArmures?.pages.map((p) => p.id)) === JSON.stringify(ordreAttendu), livreArmures?.pages.map((p) => p.id));
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
ok("la section « cosmétiques » liste le Spectre AVEC son Lore (le Vaisseau sans Lore est exclu)",
  livresCosm.length === 1 && livresCosm[0].titre === "Spectres, Vaisseaux, Passereaux" && livresCosm[0].pages.length === 1 && livresCosm[0].pages[0].id === "lore:7130", livresCosm[0]?.pages.map((p) => p.id));

// --- Grimoire D1 : hors Manifest D2 ---
ok("la section « grimoire » (D1) ne lit PAS le Manifest D2 : aucun livre", livresDeSection(db2, "grimoire").length === 0);

// --- Ordre de lecture aplati (précédent/suivant) ---
const ordre = ordrePages(livresObjets);
ok("l'ordre aplati d'une section enchaîne les livres dans l'ordre (armes puis armures)",
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
  cible?.section === "objets" && cible.livre.id === "objets-armures" && cible.page.id === "lore:7112", cible?.page.id);
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
ok("la page du livre « Lore des armes » porte le rang chronologique de son porteur (Izanagi = 11)",
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
      6001: objet("Izanagi — Burden", { itemType: 3, itemTypeDisplayName: "Fusil de précision", lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6040: objet("Izanagi — Burden (réédition)", { itemType: 3, lore: 7101, inventory: { bucketTypeHash: BUCKET.cinetique } }),
      6010: objet("Casque du Siège brisé", { itemType: 2, classType: 0, lore: 7110, inventory: { bucketTypeHash: BUCKET.casque } }),
      6030: objet("Coque de Spectre", { itemType: 14, itemTypeDisplayName: "Spectre", lore: 7130 }),
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
  // Le résultat est identique avec l'index (pas de régression fonctionnelle) : Izanagi 6001+6040 dédoublonnés en 1 page (livre « Lore des armes »), le casque est dans « Ensembles d'armures », le Spectre dans les cosmétiques.
  const livresObj = livresDeSection(dbCompte, "objets");
  ok("⚠️ index des porteurs : le contenu est le même (Izanagi dédoublonné en 1 page, casque dans « Ensembles d'armures », cosmétique présent)",
    livresObj.length === 2 && livresObj[0].titre === "Lore des armes" && livresObj[0].pages.length === 1 && livresObj[0].pages[0].titre === "Izanagi — Burden" && livresObj[1].titre === "Ensembles d'armures" && livresObj[1].pages.length === 1 && livresDeSection(dbCompte, "cosmetiques")[0]?.pages.length === 1,
    livresObj.map((l) => `${l.titre}(${l.pages.length})`));
}

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);

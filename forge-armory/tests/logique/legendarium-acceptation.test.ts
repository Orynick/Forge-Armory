// FR : ⚠️ AJOUT (22/10/2026, étape 6, chantier Legendarium) - test d'ACCEPTATION : vérifie les 9 CRITÈRES D'ACCEPTATION de la spécification verrouillée (documentation/specs/SPEC-LEGENDARIUM-2026-10-19.md §7). Chaque critère = un groupe de `ok(...)` lisant le CODE (comme cablage-forge.test.ts) ou exécutant le MODÈLE (comme legendarium-modele.test.ts). Ce test ne teste PAS l'interface (Playwright) : il teste la STRUCTURE et le CÂBLAGE. / EN: ADDED - ACCEPTANCE test: checks the 9 ACCEPTANCE CRITERIA of the locked spec (§7). Each criterion = a group of `ok(...)` reading the CODE (like cablage-forge.test.ts) or running the MODEL (like legendarium-modele.test.ts). This test does NOT test the UI (Playwright): it tests the STRUCTURE and the WIRING.
import fs from "node:fs";
import { creerFausseDb } from "./fixtures/fauxManifest";
import { SECTIONS, ORDRE_SLOTS_ARMURE, ORDRE_CLASSES, livresDeSection, rechercherPages, trouverPage, porteursDeLore } from "../../src/lib/legendarium/modele";
import { REPLI_GRIMOIRE_STATIQUE } from "../../src/lib/legendarium/grimoire";
import type { LivreLore } from "../../src/lib/legendarium/types";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const code = (t: string) => t.split("\n").filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join("\n");   // sans les lignes de commentaire
const lire = (p: string) => code(fs.readFileSync(p, "utf-8"));

// ============================================================
// CRITÈRE 1 : Les Légendes D2 et le Grimoire D1 sont regroupés PAR LIVRES, comme en jeu.
// ============================================================
{
  // D2 : hiérarchie en jeu catégorie → livre → pages (suite 10), vérifiée par le modèle
  const T_NOEUD = "DestinyPresentationNodeDefinition", T_RECORD = "DestinyRecordDefinition", T_LORE = "DestinyLoreDefinition";
  const noeud = (nom: string, extra: Record<string, unknown> = {}) => ({ displayProperties: { name: nom, description: "", ...(extra.icon ? { icon: extra.icon } : {}) }, ...extra });
  const { db } = creerFausseDb({
    [T_NOEUD]: {
      4077680549: noeud("Légendes", { scope: 0, children: { presentationNodes: [{ presentationNodeHash: 100 }] } }),
      100: noeud("La Lumière", { scope: 0, children: { presentationNodes: [{ presentationNodeHash: 1000 }] } }),
      1000: noeud("La Frontière sans foi ni loi", { scope: 0, children: { presentationNodes: [], records: [{ recordHash: 5001 }, { recordHash: 5002 }] } }),
    },
    [T_RECORD]: {
      5001: { displayProperties: { name: "Ces terres maudites", description: "" }, loreHash: 8001, hash: 5001 },
      5002: { displayProperties: { name: "Par cette langue", description: "" }, loreHash: 8002, hash: 5002 },
    },
    [T_LORE]: {
      8001: { displayProperties: { name: "Ces terres maudites", description: "Texte page 1." } },
      8002: { displayProperties: { name: "Par cette langue", description: "Texte page 2." } },
    },
  });
  const livres = livresDeSection(db, "legendes");
  ok("critère 1 (D2) : les Légendes sont regroupées PAR LIVRE — « La Frontière sans foi ni loi » contient ses 2 pages dans l'ordre du jeu",
    livres.length === 1 && livres[0].titre === "La Frontière sans foi ni loi" && livres[0].pages.length === 2
    && livres[0].pages[0].titre === "Ces terres maudites" && livres[0].pages[1].titre === "Par cette langue", livres.map((l) => `${l.titre} (${l.pages.length}p)`));
  ok("critère 1 (D2) : le livre porte sa catégorie (hiérarchie en jeu catégorie → livre → pages)",
    livres[0].categorie === "La Lumière", livres[0].categorie);

  // D1 : le repli statique = livres → cartes (comme en jeu)
  ok("critère 1 (D1) : le Grimoire D1 est regroupé PAR LIVRES — le repli statique embarque 6 livres (ordre officiel)",
    REPLI_GRIMOIRE_STATIQUE.length === 6 && REPLI_GRIMOIRE_STATIQUE.every((l) => Array.isArray(l.pages) && l.pages.length > 0),
    REPLI_GRIMOIRE_STATIQUE.map((l) => `${l.titre} (${l.pages.length}c)`));
  ok("critère 1 (D1) : les cartes ont un identifiant stable « grimoire:<idCarte> » et un sous-titre (chapitre) — structure thème → page → carte du jeu",
    REPLI_GRIMOIRE_STATIQUE.every((l) => l.pages.every((p) => p.id.startsWith("grimoire:") && Boolean(p.sousTitre))));
}

// ============================================================
// CRITÈRE 2 : Ordre global respecté : D1, puis D2, puis armes et armures, puis cosmétiques.
// ============================================================
ok("critère 2 : les QUATRE sections sont DANS L'ORDRE GLOBAL VERROUILLÉ — Grimoire D1 → Légendes D2 → Armes et Armures → Cosmétiques et utilitaires",
  JSON.stringify(SECTIONS.map((s) => s.id)) === JSON.stringify(["grimoire", "legendes", "objets", "cosmetiques"])
  && SECTIONS[2].libelle === "Armes et Armures", SECTIONS.map((s) => s.libelle));

// ============================================================
// CRITÈRE 3 : Les ensembles d'armures respectent l'ordre casque, gants, torse, jambes, objet de classe, regroupés par classe.
// ============================================================
ok("critère 3 : l'ordre des slots verrouillé est bien casque → gants → torse → jambes → marque (objet de classe)",
  JSON.stringify(ORDRE_SLOTS_ARMURE) === JSON.stringify(["casque", "gants", "torse", "jambes", "marque"]), ORDRE_SLOTS_ARMURE);
ok("critère 3 : l'ordre des classes verrouillé est bien Titan → Chasseur → Arcaniste",
  JSON.stringify(ORDRE_CLASSES) === JSON.stringify(["titan", "chasseur", "arcaniste"]), ORDRE_CLASSES);
{
  // Vérifié aussi par le modèle : un livre « Ensembles d'armures » respecte la règle
  const { db } = creerFausseDb({
    DestinyLoreDefinition: {
      7110: { displayProperties: { name: "Casque du Siège brisé", description: "Lore casque." } },
      7111: { displayProperties: { name: "Gants du Siège brisé", description: "Lore gants." } },
      7112: { displayProperties: { name: "Jambes du Siège brisé", description: "Lore jambes." } },
      7113: { displayProperties: { name: "Torse du Siège brisé", description: "Lore torse." } },
      7114: { displayProperties: { name: "Marque du Siège brisé", description: "Lore marque." } },
    },
    DestinyInventoryItemDefinition: {
      6010: { displayProperties: { name: "Casque du Siège brisé", icon: "", description: "" }, itemType: 2, itemTypeDisplayName: "Casque", loreHash: 7110, classType: 0, inventory: { bucketTypeHash: 3448274439, tierTypeHash: 4008398120 } },
      6011: { displayProperties: { name: "Gants du Siège brisé", icon: "", description: "" }, itemType: 2, itemTypeDisplayName: "Gants", loreHash: 7111, classType: 0, inventory: { bucketTypeHash: 3551918588, tierTypeHash: 4008398120 } },
      6012: { displayProperties: { name: "Torse du Siège brisé", icon: "", description: "" }, itemType: 2, itemTypeDisplayName: "Torse", loreHash: 7112, classType: 0, inventory: { bucketTypeHash: 14239492, tierTypeHash: 4008398120 } },
      6013: { displayProperties: { name: "Jambes du Siège brisé", icon: "", description: "" }, itemType: 2, itemTypeDisplayName: "Jambes", loreHash: 7113, classType: 0, inventory: { bucketTypeHash: 20886954, tierTypeHash: 4008398120 } },
      6014: { displayProperties: { name: "Marque du Siège brisé", icon: "", description: "" }, itemType: 2, itemTypeDisplayName: "Objet de classe", loreHash: 7114, classType: 0, inventory: { bucketTypeHash: 1585787867, tierTypeHash: 4008398120 } },
    },
  });
  const livresObjets = livresDeSection(db, "objets");
  const livreArmures = livresObjets.find((l) => l.id === "objets-armures");
  const titres = livreArmures?.pages.map((p) => p.titre) ?? [];
  ok("critère 3 (modèle) : dans le livre « Ensembles d'armures », les 5 pièces Titan sont DANS L'ORDRE VERROUILLÉ (casque → gants → torse → jambes → marque)",
    livreArmures !== undefined && titres.length === 5
    && titres[0].includes("Casque") && titres[1].includes("Gants") && titres[2].includes("Torse") && titres[3].includes("Jambes") && titres[4].includes("Marque"),
    titres);
}

// ============================================================
// CRITÈRE 4 : La recherche par mots-clés permet de retrouver les pages de Lore.
// ============================================================
{
  const { db } = creerFausseDb({
    DestinyLoreDefinition: {
      7001: { displayProperties: { name: "Le Gardien se lève", description: "Un Gardien se lève dans la lumière." } },
    },
    DestinyInventoryItemDefinition: {
      6001: { displayProperties: { name: "Izanagi — Burden", icon: "", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: 1498876634 } },
    },
  });
  // il manque le lore 7101 referenced by item; add it
  const { db: db2 } = creerFausseDb({
    DestinyLoreDefinition: {
      7001: { displayProperties: { name: "Le Gardien se lève", description: "Un Gardien se lève dans la lumière." } },
      7101: { displayProperties: { name: "Izanagi", description: "Le fardeau d'Izanagi." } },
    },
    DestinyInventoryItemDefinition: {
      6001: { displayProperties: { name: "Izanagi — Burden", icon: "", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: 1498876634 } },
    },
  });
  const tous = { legendes: livresDeSection(db2, "legendes"), objets: livresDeSection(db2, "objets"), cosmetiques: [] as LivreLore[], grimoire: [] as LivreLore[] };
  const r1 = rechercherPages(tous, "gardien");
  const r2 = rechercherPages(tous, "izanagi");
  const r3 = rechercherPages(tous, "mot-inexistant-xyz");
  ok("critère 4 : la recherche par mots-clés retrouve une page de Légende (insensible à la casse)",
    r1.length === 1 && r1[0].page.id === "lore:7001", r1.map((r) => r.page.id));
  ok("critère 4 : la recherche retrouve la page d'un OBJET par le nom du Lore",
    r2.length >= 1 && r2.some((r) => r.page.id === "lore:7101"), r2.map((r) => r.page.id));
  ok("critère 4 : aucun résultat pour un mot inexistant (pas d'erreur)",
    r3.length === 0);
  // Suite 15 : recherche avancée (guillemets, +, -, Aa)
  const rExact = rechercherPages(tous, "\"gardien se lève\"");
  const rExclu = rechercherPages(tous, "gardien -lumière");
  ok("critère 4 (suite 15) : la recherche avancée fonctionne — guillemets = phrase exacte, - = exclu",
    rExact.length === 1 && rExclu.length === 0, { exact: rExact.length, exclu: rExclu.length });
}

// ============================================================
// CRITÈRE 5 : Le bouton « Lire le Lore » n'apparaît que pour les objets qui en possèdent un,
//             en haut de fiche, justifié à droite, sous la croix.
// ============================================================
{
  const bouton = lire("src/components/BoutonLireLore.tsx");
  ok("critère 5 : le composant « Lire le Lore » n'affiche RIEN si l'objet n'a pas de Lore (`aLore` = false → return null)",
    /if \(!aLore\(db, itemHash\)\) return null/.test(bouton));
  ok("critère 5 : le bouton est JUSTIFIÉ À DROITE (`justify-content:flex-end`) — placement verrouillé §6",
    /justifyContent:\s*"flex-end"/.test(bouton));

  // Dans les 4 fiches + la pop-up Build Analyzer : le bouton est SOUS la croix de fermeture
  const fiches: Array<[string, string]> = [
    // ⚠️ CHANGÉ (30/10/2026) : la fenêtre des armes et des armures de la Forge, celle de l'Inventaire et celle de Mon Build sont maintenant UNE SEULE fenêtre (`FenetreDetailsPiece`) : c'est elle qui porte la croix et le bouton.
    ["FenetreDetailsPiece.tsx (fenêtre UNIQUE : Inventaire, Mon Build, Forge armes et armures)", "src/components/FenetreDetailsPiece.tsx"],
    ["CollectionArmes.tsx", "src/components/CollectionArmes.tsx"],
    ["CollectionArmures.tsx", "src/components/CollectionArmures.tsx"],
  ];
  const GUILLEMET = String.fromCharCode(34);
  const CROIX = "aria-label=" + GUILLEMET + "Fermer" + GUILLEMET;   // « aria-label="Fermer" » construit sans guillemets droits dans la source
  const CROIX_POPUP = "setDetailsOuverts(false)";   // SelecteurInventaire : la croix de la pop-up Détails n'a pas d'aria-label, elle porte le gestionnaire de fermeture
  for (const [nom, chemin] of fiches) {
    const src = lire(chemin);
    const iCroix = chemin.includes("SelecteurInventaire") ? src.indexOf(CROIX_POPUP) : src.indexOf(CROIX);   // (CROIX_POPUP ne sert plus que si une fiche reprend l'ancienne pop-up)
    const iBouton = src.indexOf("<BoutonLireLore");
    ok("critère 5 : " + nom + " — le bouton « Lire le Lore » est SOUS la croix de fermeture (dans le DOM, après la croix) et UNIQUEMENT si onLireLore est fourni",
      iCroix !== -1 && iBouton !== -1 && iBouton > iCroix && /\{onLireLore && <BoutonLireLore/.test(src),
      { iCroix, iBouton });
  }
}

// ============================================================
// CRITÈRE 6 : Le parcours inverse depuis une page de Lore vers les objets concernés fonctionne.
// ============================================================
{
  const { db } = creerFausseDb({
    DestinyLoreDefinition: {
      7101: { displayProperties: { name: "Izanagi", description: "Le fardeau d'Izanagi." } },
    },
    DestinyInventoryItemDefinition: {
      6001: { displayProperties: { name: "Izanagi — Burden", icon: "", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: 1498876634 } },
      6040: { displayProperties: { name: "Izanagi — Burden (réédition)", icon: "", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: 1498876634 } },
      6002: { displayProperties: { name: "Arme sans lore", icon: "", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil à pompe", inventory: { bucketTypeHash: 1498876634 } },
      6003: { displayProperties: { name: "Arme masquée", icon: "", description: "" }, itemType: 3, loreHash: 7101, redacted: true, inventory: { bucketTypeHash: 1498876634 } },
    },
  });
  const porteurs = porteursDeLore(db, 7101);
  ok("critère 6 : le parcours inverse retrouve TOUS les porteurs d'un Lore (Izanagi + sa réédition ; l'objet masqué exclu)",
    porteurs.length === 2 && porteurs.some((p) => p.hash === 6001) && porteurs.some((p) => p.hash === 6040) && !porteurs.some((p) => p.hash === 6003),
    porteurs.map((p) => p.hash));
  ok("critère 6 : le parcours inverse ne retourne rien pour un Lore sans porteur, sans erreur",
    porteursDeLore(db, 424242).length === 0 && porteursDeLore(null, 7101).length === 0);

  // Le lien profond (fiche → page) fonctionne aussi
  const tous = { objets: livresDeSection(db, "objets"), legendes: [] as LivreLore[], cosmetiques: [] as LivreLore[], grimoire: [] as LivreLore[] };
  const cible = trouverPage(tous, "item:6001", db);
  ok("critère 6 : le lien profond fiche → page résout « item:6001 » vers « lore:7101 » (aller) et le parcours inverse liste les porteurs (retour)",
    cible?.page.id === "lore:7101", cible?.page.id);
}

// ============================================================
// CRITÈRE 7 : Les Spectres, Vaisseaux et Passereaux sont listés avec leur Lore quand il existe.
// ============================================================
{
  const { db } = creerFausseDb({
    DestinyLoreDefinition: {
      7130: { displayProperties: { name: "Spectre de l'Aube", description: "Lore du Spectre." } },
      7131: { displayProperties: { name: "Vaisseau de l'Aube", description: "Lore du Vaisseau." } },
      7132: { displayProperties: { name: "Passereau de l'Aube", description: "Lore du Passereau." } },
    },
    DestinyInventoryItemDefinition: {
      // itemType 24 = Spectre (Coque de Spectre), 21 = Vaisseau, 22 = Passereau (Véhicul)
      6030: { displayProperties: { name: "Spectre de l'Aube", icon: "", description: "" }, itemType: 24, itemTypeDisplayName: "Coque de Spectre", loreHash: 7130, inventory: { bucketTypeHash: 4274335291 } },
      6031: { displayProperties: { name: "Vaisseau de l'Aube", icon: "", description: "" }, itemType: 21, itemTypeDisplayName: "Vaisseau", loreHash: 7131, inventory: { bucketTypeHash: 284967655 } },
      6032: { displayProperties: { name: "Passereau de l'Aube", icon: "", description: "" }, itemType: 22, itemTypeDisplayName: "Véhicule", loreHash: 7132, inventory: { bucketTypeHash: 1043138475 } },
      6033: { displayProperties: { name: "Spectre sans lore", icon: "", description: "" }, itemType: 24, itemTypeDisplayName: "Coque de Spectre", inventory: { bucketTypeHash: 4274335291 } },
    },
  });
  const livresCosm = livresDeSection(db, "cosmetiques");
  const titresLivres = livresCosm.map((l) => l.titre);
  const livreSpectres = livresCosm.find((l) => l.titre === "Spectres");
  const livreVaisseaux = livresCosm.find((l) => l.titre === "Vaisseaux");
  const livrePassereaux = livresCosm.find((l) => l.titre === "Passereaux");
  ok("critère 7 : les livres « Spectres », « Vaisseaux » et « Passereaux » existent DANS CET ORDRE (avant « Autres »)",
    titresLivres.indexOf("Spectres") !== -1 && titresLivres.indexOf("Vaisseaux") !== -1 && titresLivres.indexOf("Passereaux") !== -1
    && titresLivres.indexOf("Spectres") < titresLivres.indexOf("Vaisseaux") && titresLivres.indexOf("Vaisseaux") < titresLivres.indexOf("Passereaux")
    && titresLivres.indexOf("Passereaux") < (titresLivres.indexOf("Autres") === -1 ? Infinity : titresLivres.indexOf("Autres")),
    titresLivres);
  ok("critère 7 : le Spectre AVEC Lore est listé dans « Spectres » ; le Spectre SANS Lore est exclu",
    livreSpectres !== undefined && livreSpectres.pages.length === 1 && livreSpectres.pages[0].titre === "Spectre de l'Aube"
    && !livreSpectres.pages.some((p) => p.titre === "Spectre sans lore"),
    livreSpectres?.pages.map((p) => p.titre));
  ok("critère 7 : le Vaisseau et le Passereaux avec Lore sont listés dans leurs livres respectifs",
    livreVaisseaux?.pages.length === 1 && livreVaisseaux.pages[0].titre === "Vaisseau de l'Aube"
    && livrePassereaux?.pages.length === 1 && livrePassereaux.pages[0].titre === "Passereau de l'Aube",
    { vaisseaux: livreVaisseaux?.pages.map((p) => p.titre), passereaux: livrePassereaux?.pages.map((p) => p.titre) });
}

// ============================================================
// CRITÈRE 8 : Aucun impact sur le scoring ni sur le build (lecture passive vérifiée).
//   - Aucun import scoring/build/simulation dans les modules Legendarium.
//   - Aucun fetch POST/PUT/DELETE (que des GET en lecture).
//   - Aucun stockage persistant (localStorage/sessionStorage/indexedDB/cookies).
//   - Le bouton « Lire le Lore » est un composant PUR (pas d'état, pas d'effet).
//   - DashboardPage : la cible Legendarium est en useState (mémoire), jamais persistée.
// ============================================================
{
  const modules = [
    "src/lib/legendarium/modele.ts",
    "src/lib/legendarium/types.ts",
    "src/lib/legendarium/palette.ts",
    "src/lib/legendarium/grimoire.ts",
    "src/components/Bibliotheque.tsx",
    "src/components/BoutonLireLore.tsx",
  ];
  const tout = modules.map((m) => lire(m)).join("\n");

  ok("critère 8 : les modules Legendarium N'IMPORTENT RIEN du scoring/build/simulation (aucun lien vers le score)",
    !/scoring|appliquerSimulations|mettreAJourSimulations|useSimulations|lib\/build|lib\/forge|enregistrerBuild|partagerBuild/.test(tout));

  // fetch : uniquement des GET en lecture (grimoire D1). Aucun POST/PUT/DELETE, aucune méthode d'écriture.
  const fetchs = tout.match(/fetch\([^)]*\)/g) ?? [];
  ok("critère 8 : les seuls appels réseau sont des GET en LECTURE (Grimoire D1) — AUCUN POST/PUT/DELETE, aucune écriture réseau",
    fetchs.length > 0 && fetchs.every((f) => !/method\s*:\s*["'](POST|PUT|DELETE|PATCH)["']/i.test(f)),
    fetchs);

  ok("critère 8 : AUCUN stockage persistant dans les modules Legendarium (pas de localStorage/sessionStorage/indexedDB/cookies)",
    !/localStorage|sessionStorage|indexedDB|document\.cookie|\bidb\b/.test(tout));

  const bouton = lire("src/components/BoutonLireLore.tsx");
  ok("critère 8 : le bouton « Lire le Lore » est un composant PUR (pas de useState, pas de useEffect — aucun effet de bord)",
    !/useState|useEffect/.test(bouton));

  const dashboard = lire("src/pages/DashboardPage.tsx");
  ok("critère 8 : la cible Legendarium dans DashboardPage est en useState (MÉMOIRE UNIQUEMENT) — jamais persistée, jamais écrite chez Bungie",
    /useState<\{ pageId: string; provenance: ProvenanceObjet \} \| null>\(null\)/.test(dashboard)
    && !/localStorage|sessionStorage/.test(dashboard.split("cibleLegendarium")[1]?.split("}")[0] ?? ""));

  // Le modèle ne fait que LIRE le cache manifeste existant (pas d'écriture, pas de second téléchargement)
  const modele = lire("src/lib/legendarium/modele.ts");
  ok("critère 8 : le modèle Legendarium ne fait que LIRE le cache manifeste (`obtenirDefinition`/`lireTable` depuis `lib/manifest/download`) — aucune écriture, aucun téléchargement",
    /obtenirDefinition, lireTable, idSqliteVersHash/.test(modele) && /from "\.\.\/manifest\/download"/.test(modele)
    && !/\bfetch\(|telecharger|download\(|POST|method:/.test(modele));
}

// ============================================================
// CRITÈRE 9 : Le cache de données se télécharge et se met à jour sans casser le catalogue du jeu.
//   - Le Legendarium RÉUTILISE le cache existant (pas de second mécanisme de téléchargement).
//   - Le Grimoire D1 (gros JSON 930 Ko) est importé DYNAMIQUEMENT (pas dans le bundle principal).
//   - La batterie logique complète passe (le catalogue du jeu n'est pas cassé).
// ============================================================
{
  const modele = lire("src/lib/legendarium/modele.ts");
  ok("critère 9 : le Legendarium RÉUTILISE le cache manifeste existant (`lib/manifest/download.ts`) — AUCUN second mécanisme de téléchargement",
    /from "\.\.\/manifest\/download"/.test(modele) && !/createElement\(["']script|new XMLHttpRequest|import\(["']https?:/.test(modele));

  const biblio = lire("src/components/Bibliotheque.tsx");
  const importsDynamiques = (biblio.match(/import\("\.\.\/lib\/legendarium\/grimoire"\)/g) ?? []).length;
  ok("critère 9 : le Grimoire D1 (JSON 930 Ko) est importé DYNAMIQUEMENT (`import()`) — le bundle principal n'en porte pas le poids",
    importsDynamiques >= 1 && !/import \{[^}]*grimoire[^}]*\} from "\.\.\/lib\/legendarium\/grimoire"/.test(biblio),
    importsDynamiques);

  // Le cache du jeu lui-même n'est pas modifié par le Legendarium : le module download.ts n'importe rien du Legendarium
  const download = lire("src/lib/manifest/download.ts");
  ok("critère 9 : le cache manifeste (`lib/manifest/download.ts`) n'importe RIEN du Legendarium — le catalogue du jeu n'est pas touché (dépendance à sens unique)",
    !/legendarium/.test(download));
}

// ============================================================
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);

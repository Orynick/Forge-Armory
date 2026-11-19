import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

// scripts/fausse-db.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var donnees = JSON.parse(
  readFileSync(path.join(__dirname, "..", "test-fixtures", "manifest-mock.json"), "utf8")
);
function fausseDB(langue = "fr") {
  return {
    prepare(sql) {
      const table = sql.match(/FROM (\w+)/)[1];
      const parId = sql.includes("WHERE id");
      const lignesTable = donnees[table]?.[langue] ?? {};
      const lignes = Object.entries(lignesTable).map(([id, def]) => ({ id: Number(id), def }));
      let idCherche = null;
      let i = -1;
      return {
        bind(params) {
          idCherche = params[0];
        },
        step() {
          if (parId) {
            if (i === -1 && lignes.some((l) => l.id === idCherche)) {
              i = 0;
              return true;
            }
            return false;
          }
          i++;
          return i < lignes.length;
        },
        getAsObject() {
          const ligne = parId ? lignes.find((l) => l.id === idCherche) : lignes[i];
          return { id: ligne.id, json: JSON.stringify(ligne.def) };
        },
        free() {
        }
      };
    }
  };
}

// src/lib/bungie/config.ts
var BUNGIE_ROOT = "https://www.bungie.net";
var BUNGIE_API_ROOT = `${BUNGIE_ROOT}/Platform`;
var bungieConfig = {
  apiKey: define_import_meta_env_default.VITE_BUNGIE_API_KEY,
  clientId: define_import_meta_env_default.VITE_BUNGIE_CLIENT_ID,
  redirectUri: define_import_meta_env_default.VITE_BUNGIE_REDIRECT_URI
};

// src/lib/manifest/download.ts
function hashVersIdSqlite(hash) {
  return hash > 2147483647 ? hash - 4294967296 : hash;
}
function idSqliteVersHash(id) {
  return id < 0 ? id + 4294967296 : id;
}
var cacheDefinitionsParDb = /* @__PURE__ */ new WeakMap();
function obtenirDefinition(db, nomTable, hash) {
  let cache = cacheDefinitionsParDb.get(db);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    cacheDefinitionsParDb.set(db, cache);
  }
  const cle = `${nomTable}:${hash}`;
  if (cache.has(cle)) return cache.get(cle);
  const stmt = db.prepare(`SELECT json FROM ${nomTable} WHERE id = ? LIMIT 1`);
  stmt.bind([hashVersIdSqlite(hash)]);
  const trouve = stmt.step();
  const resultat = trouve ? JSON.parse(stmt.getAsObject().json) : void 0;
  stmt.free();
  cache.set(cle, resultat);
  return resultat;
}

// src/data/constantesManifest.ts
var BUCKET_HASH_VERS_SLOT = {
  1498876634: "cinetique",
  // Kinetic Weapons
  2465295065: "energie",
  // Energy Weapons
  953998645: "lourde",
  // Power Weapons
  3448274439: "casque",
  // Helmet
  3551918588: "gants",
  // Gauntlets
  14239492: "torse",
  // Chest Armor
  20886954: "jambes",
  // Leg Armor
  1585787867: "marque"
  // Class Armor (Marque/Cape/Manteau selon la classe)
};
var TIER_TYPE_HASH_EXOTIQUE = 2759499571;
var CLASS_TYPE_VERS_CLASSE = {
  0: "titan",
  1: "chasseur",
  2: "arcaniste"
};

// src/lib/manifest/search.ts
function urlIcone(cheminIcone) {
  return cheminIcone ? `https://www.bungie.net${cheminIcone}` : void 0;
}
var TABLES_RECHERCHE_PAR_DEFAUT = [
  "DestinyInventoryItemDefinition",
  "DestinySandboxPerkDefinition",
  // FR : ⚠️ AJOUT (24/08/2026) - triomphes, masqués par défaut (comme
  // quêtes/ornements/packs), visibles via le filtre de catégorie dédié.
  // EN: ⚠️ ADDED - triumphs, hidden by default (like quests/ornaments/
  // packs), visible via the dedicated category filter.
  "DestinyRecordDefinition"
];
function devinerCategorie(slot, itemTypeDisplayName, nom, description, itemType, categories) {
  if (itemType === TYPE_OBJET_FACTICE || (categories ?? []).includes(CATEGORIE_FACTICE)) return "factice";
  const texte = normaliser(itemTypeDisplayName ?? "");
  const nomNormalise = normaliser(nom ?? "");
  const descriptionNormalisee = normaliser(description ?? "");
  if (texte.includes("ornement") || texte.includes("ornament")) return "ornement";
  if (descriptionNormalisee.includes("ornement d'arme") || descriptionNormalisee.includes("weapon ornament")) return "ornement";
  if (texte.includes("quete") || texte.includes("quest") || texte.includes("mission")) return "quete";
  if (texte.includes("offre") || texte.includes("bundle") || texte.includes("ensemble") || texte.includes("pack")) return "pack";
  if (nomNormalise.startsWith("pack de") || nomNormalise.startsWith("pack ")) return "pack";
  if (descriptionNormalisee.includes("harmonisation") || descriptionNormalisee.includes("attunement") || descriptionNormalisee.includes("chances d'apparition") || descriptionNormalisee.includes("drop chance")) {
    return "harmonisation";
  }
  if (slot) {
    return ["cinetique", "energie", "lourde"].includes(slot) ? "arme" : "armure";
  }
  if (texte.includes("aspect")) return "aspect";
  if (texte.includes("fragment")) return "fragment";
  return "autre";
}
var CATEGORIE_FACTICE = 3109687656;
var TYPE_OBJET_FACTICE = 20;
function prioriteDoublon(r) {
  return (r.slot ? 4 : 0) + (r.isExotic ? 2 : 0) + (r.factice ? 0 : 1);
}
function normaliserRecherche(texte) {
  return normaliser(
    texte.replace(/[\u00a0\u2007\u2009\u202f]/g, " ").replace(/[\u2018\u2019\u02bc\u00b4]/g, "'").replace(/œ/g, "oe").replace(/Œ/g, "OE").replace(/æ/g, "ae").replace(/Æ/g, "AE")
  );
}
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function positionsMotCleStrict(texteNormalise, motCleNormalise) {
  if (!motCleNormalise) return [];
  const motEchappe = motCleNormalise.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const motif = new RegExp(`(?<![a-z0-9])${motEchappe}(?![a-z0-9])`, "g");
  const positions = [];
  let m;
  while ((m = motif.exec(texteNormalise)) !== null) {
    positions.push(m.index);
    if (m.index === motif.lastIndex) motif.lastIndex++;
  }
  return positions;
}
var CACHE_INDEX = /* @__PURE__ */ new WeakMap();
function obtenirIndexTable(db, table) {
  let parTable = CACHE_INDEX.get(db);
  if (!parTable) {
    parTable = /* @__PURE__ */ new Map();
    CACHE_INDEX.set(db, parTable);
  }
  let index = parTable.get(table);
  if (!index) {
    index = [];
    const stmt = db.prepare(`SELECT id, json FROM ${table}`);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const json = row.json;
      index.push({ id: Number(row.id), json, jsonNormalise: normaliserRecherche(json) });
    }
    stmt.free();
    parTable.set(table, index);
  }
  return index;
}
var CATEGORIES_MASQUEES_PAR_DEFAUT = ["quete", "ornement", "pack", "harmonisation", "triomphe", "factice"];
function evaluerCorrespondance(def, table, motNormalise) {
  const nom = def.displayProperties?.name ?? "(sans nom)";
  const description = def.displayProperties?.description ?? "";
  const nomCorrespond = normaliserRecherche(nom).includes(motNormalise);
  const descriptionCorrespond = normaliserRecherche(description).includes(motNormalise);
  const { flavorText, ...defSansFlavorText } = def;
  const matchAilleursQueFlavorText = !nomCorrespond && !descriptionCorrespond && normaliserRecherche(JSON.stringify(defSansFlavorText)).includes(motNormalise);
  const correspondDansFlavorText = typeof flavorText === "string" && normaliserRecherche(flavorText).includes(motNormalise);
  const champCorrespondant = nomCorrespond ? "nom" : descriptionCorrespond ? "description" : matchAilleursQueFlavorText ? "autre texte" : null;
  const slot = def.inventory?.bucketTypeHash !== void 0 ? BUCKET_HASH_VERS_SLOT[def.inventory.bucketTypeHash] : void 0;
  const categorie = table === "DestinyRecordDefinition" ? "triomphe" : devinerCategorie(slot, def.itemTypeDisplayName, nom, description, def.itemType, Array.isArray(def.itemCategoryHashes) ? def.itemCategoryHashes : void 0);
  return { nom, description, champCorrespondant, correspondDansFlavorText, slot, categorie };
}
function rechercherDansManifest(db, motCle, mode = "plein_texte", tables = TABLES_RECHERCHE_PAR_DEFAUT, categorie = "toutes", avecMasques = false) {
  const motNormalise = normaliserRecherche(motCle.trim());
  const tout = motNormalise.length === 0;
  if (motNormalise.length < 2) return [];
  const resultats = [];
  for (const table of tables) {
    const index = obtenirIndexTable(db, table);
    for (const ligne of index) {
      if (!tout && !ligne.jsonNormalise.includes(motNormalise)) continue;
      const def = ligne.json ? JSON.parse(ligne.json) : obtenirDefinition(db, table, idSqliteVersHash(ligne.id)) ?? {};
      const { nom, description, champCorrespondant, slot, categorie: categorieResultat } = evaluerCorrespondance(
        def,
        table,
        motNormalise
      );
      if (!champCorrespondant && !tout) continue;
      if (tout && !nom) continue;
      if (mode === "nom" && champCorrespondant !== "nom") continue;
      let masque = false;
      if (categorie === "toutes") {
        if (CATEGORIES_MASQUEES_PAR_DEFAUT.includes(categorieResultat)) {
          if (!avecMasques) continue;
          masque = true;
        }
      } else if (categorieResultat !== categorie) {
        continue;
      }
      resultats.push({
        table,
        hash: idSqliteVersHash(ligne.id),
        nom,
        description,
        // FR : ⚠️ (19/10/2026, mode « tout ») - la correspondance peut être null (on liste tout, pas une recherche) : le type de ResultatRecherche attend une valeur non nulle, on retombe sur « nom » par convention d'affichage. / EN: in "list everything" mode the match is null; the display falls back to "nom".
        champCorrespondant: champCorrespondant ?? "nom",
        slot,
        isExotic: def.inventory?.tierTypeHash === TIER_TYPE_HASH_EXOTIQUE,
        factice: Array.isArray(def.itemCategoryHashes) && def.itemCategoryHashes.includes(CATEGORIE_FACTICE),
        icone: urlIcone(def.displayProperties?.icon),
        classe: def.classType !== void 0 ? CLASS_TYPE_VERS_CLASSE[def.classType] : void 0,
        typeArme: slot && ["cinetique", "energie", "lourde"].includes(slot) ? def.itemTypeDisplayName : void 0,
        categorie: categorieResultat,
        masque
      });
    }
  }
  const rang = { nom: 0, description: 1, "autre texte": 2 };
  resultats.sort((a, b) => rang[a.champCorrespondant] - rang[b.champCorrespondant]);
  return resultats;
}
function rechercherBilingue(dbFr2, dbEn2, motCle, mode = "plein_texte", tables = TABLES_RECHERCHE_PAR_DEFAUT, categorie = "toutes", avecMasques = false) {
  const parCle = /* @__PURE__ */ new Map();
  for (const r of rechercherDansManifest(dbFr2, motCle, mode, tables, categorie, avecMasques)) {
    parCle.set(`${r.table}-${r.hash}`, { ...r, trouveViaAnglais: false });
  }
  if (dbEn2) {
    for (const r of rechercherDansManifest(dbEn2, motCle, mode, tables, categorie, avecMasques)) {
      const cle = `${r.table}-${r.hash}`;
      const existant = parCle.get(cle);
      if (existant) {
        existant.nomEn = r.nom;
        continue;
      }
      const defFr = obtenirDefinition(
        dbFr2,
        r.table,
        r.hash
      );
      parCle.set(cle, {
        ...r,
        nom: defFr?.displayProperties?.name ?? r.nom,
        description: defFr?.displayProperties?.description ?? r.description,
        icone: urlIcone(defFr?.displayProperties?.icon) ?? r.icone,
        nomEn: r.nom,
        trouveViaAnglais: true
      });
    }
  }
  const tous = Array.from(parCle.values());
  return [...dedoublonnerParTexte(tous.filter((r) => !r.masque)), ...dedoublonnerParTexte(tous.filter((r) => r.masque))];
}
function dedoublonnerParTexte(resultats) {
  const parTexte = /* @__PURE__ */ new Map();
  for (const r of resultats) {
    const cleTexte = `${normaliser(r.nom)}|${normaliser(r.description)}`;
    const existant = parTexte.get(cleTexte);
    if (!existant || prioriteDoublon(r) > prioriteDoublon(existant)) parTexte.set(cleTexte, r);
  }
  return Array.from(parTexte.values());
}

// src/data/elementVerbs.ts
var CATALOGUE_VERBES = [
  // --- VOID ---
  {
    id: "weaken",
    nomFr: "Affaiblissement",
    nomEn: "Weaken",
    element: "abyssal",
    categorie: "debuff_ennemi",
    motsClesFr: ["affaibli"],
    motsClesEn: ["weaken"],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "volatile",
    nomFr: "Volatil",
    nomEn: "Volatile",
    championEtourdi: "bloqueur",
    element: "abyssal",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "volatil" seul est plus court que le
    // mot-clé anglais "volatile" (8 lettres), qui matche "volatile"/
    // "volatiles" et laisse le "s" du pluriel non surligné sur ce dernier.
    // Même catégorie de bug que "suspens"/"suspendues".
    // EN: ⚠️ FIXED - "volatil" alone is shorter than the English keyword
    // "volatile", which matches but leaves the plural "s" unhighlighted.
    motsClesFr: ["volatil", "volatile", "volatiles"],
    motsClesEn: ["volatile"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho de cessation) : "Éliminer des cibles volatiles crée
    // une Brèche abyssale."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "breche_abyssale", conditionnel: "eliminer des cibles volatiles cree une breche abyssale" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "suppression",
    nomFr: "Neutralisation",
    nomEn: "Suppression",
    championEtourdi: "surcharge",
    element: "abyssal",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "supprim" seul est plus court que le
    // mot-clé anglais "suppress" (8 lettres), qui matche "suppress-ion" et
    // laisse le "-ion" final non surligné. Même catégorie de bug que
    // "suspens"/"suspendues" signalée par l'utilisateur. Ajout du mot
    // français complet "suppression", identique à l'anglais dans ce cas.
    // EN: ⚠️ FIXED - "supprim" alone is shorter than the English keyword
    // "suppress" (8 letters), which matches "suppress-ion" and leaves the
    // final "-ion" unhighlighted. Same bug category as suspend/suspendues.
    motsClesFr: ["supprim", "suppression", "neutralis"],
    motsClesEn: ["suppress"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho d'autorité, confirmé par Facette de contrôle) :
    // "Éliminer des cibles neutralisées crée une Brèche abyssale."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "breche_abyssale", conditionnel: "eliminer des cibles neutralisees cree une breche abyssale" }],
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "Enfant des dieux anciens" (aspect Arcaniste Abyssal) applique bien
    // Neutralisation, mais était classé "payoff orphelin" à tort : "Les
    // combattants affectés PAR L'ÂME sont aussi brièvement neutralisés" -
    // notre heuristique de proximité voit "affecte par" juste avant
    // "neutralises" et conclut à un payoff, sans comprendre que "affectés
    // par" se rapporte à l'Âme (un autre nom), pas à la neutralisation
    // elle-même. Exception ciblée plutôt que d'assouplir "affecte par"
    // globalement (casserait le garde-fou "contre les cibles gelées").
    // EN: ⚠️ ADDED - "Enfant des dieux anciens" genuinely applies
    // Suppression, but was misclassified as an orphaned payoff: "affected
    // by" refers to a different noun (the Soul), not to suppression itself
    // - our proximity heuristic can't tell. Targeted exception rather than
    // loosening the marker globally.
    sourcesForcees: ["les combattants affectes par l'ame sont aussi brievement neutralises"],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "devour",
    ressourceGeneree: [{ type: "grenade" }],
    nomFr: "D\xE9voration",
    nomEn: "Devour",
    element: "abyssal",
    categorie: "buff_soi",
    motsClesFr: ["devoration"],
    motsClesEn: ["devour"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "invisibilite",
    nomFr: "Invisibilit\xE9",
    nomEn: "Invisibility",
    element: "abyssal",
    categorie: "buff_soi",
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "invisible" (adjectif) manquait, seul le nom "invisibilite" était
    // couvert. Conséquence sérieuse : "Esquiver vous rend invisible."
    // (Esquive furtive, Chasseur Abyssal - une capacité DE BASE) n'était
    // même pas détectée du tout (0 mention), pas juste mal classée.
    // EN: ⚠️ ADDED - "invisible" (adjective) was missing, only the noun
    // form was covered. Serious consequence: "Dodging makes you invisible"
    // (a BASE-KIT Hunter ability) wasn't detected AT ALL.
    motsClesFr: ["invisibilite", "invisible"],
    motsClesEn: ["invisibility"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "surbouclier",
    nomFr: "Surbouclier",
    nomEn: "Overshield",
    element: "abyssal",
    categorie: "buff_soi",
    motsClesFr: ["surbouclier"],
    motsClesEn: ["overshield"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  // --- ARC ---
  {
    id: "jolt",
    nomFr: "Secousse",
    nomEn: "Jolt",
    championEtourdi: "surcharge",
    element: "arc",
    categorie: "debuff_ennemi",
    motsClesFr: ["electrocut", "jolt", "secousse"],
    motsClesEn: ["jolt"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle ionique) : "Éliminer une cible qui subit des
    // Secousses ... crée une Piste ionique."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "piste_ionique", conditionnel: "eliminer une cible qui subit des secousses ou eliminer une cible en utilisant une charge eclair cree une piste ionique" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "aveuglement",
    nomFr: "C\xE9cit\xE9",
    nomEn: "Blind",
    championEtourdi: "implacable",
    element: "arc",
    categorie: "debuff_ennemi",
    motsClesFr: ["aveugl", "cecit"],
    motsClesEn: ["blind"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle de brillance) : "Vaincre une cible touchée par
    // Cécité avec des dégâts de précision crée une explosion provoquant
    // Cécité." Auto-référence (le verbe se produit lui-même) : le graphe
    // la gère nativement, sans boucle infinie (le verbe est déjà marqué
    // atteint au moment où le lien est suivi).
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    // Self-reference: the graph handles it natively, no infinite loop.
    produit: [{ verbeId: "aveuglement", conditionnel: "vaincre une cible touchee par cecite avec des degats de precision cree une explosion provoquant cecite" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "amplifie",
    nomFr: "Amplifi\xE9",
    nomEn: "Amplified",
    element: "arc",
    categorie: "buff_soi",
    motsClesFr: ["amplifi"],
    motsClesEn: ["amplified"],
    // FR : ⚠️ AJOUT (26/08/2026) - production de ressource CONDITIONNELLE,
    // trouvée via l'audit des fragments Cryo-électrique (Étincelle
    // d'amplitude) : "Éliminer des cibles rapidement sous l'effet
    // d'Amplificateur créé un orbe de puissance." Même famille que les 3
    // cas trouvés hier sur Embrasement/Blessure solaire.
    // EN: ⚠️ ADDED - CONDITIONAL resource production, found via the
    // Cryo-electric fragment audit.
    ressourceGeneree: [
      { type: "super", conditionnel: "eliminer des cibles rapidement sous l'effet d'amplificateur cree un orbe de puissance" }
    ],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  // --- SOLAR ---
  {
    id: "scorch",
    nomFr: "Blessure solaire",
    nomEn: "Scorch",
    element: "solaire",
    categorie: "debuff_ennemi",
    motsClesFr: ["consume", "scorch", "blessure solaire", "blessures solaires"],
    motsClesEn: ["scorch"],
    // FR : ⚠️ AJOUT (25/08/2026) - inconditionnel : seuil de cumul (100
    // stacks), pas un fragment/aspect à vérifier.
    produit: [{ verbeId: "ignition" }],
    // FR : ⚠️ AJOUT (25/08/2026) - production de ressource CONDITIONNELLE,
    // trouvée via l'audit des fragments Solaire (Tison à calciner).
    // Blessure solaire ne génère normalement AUCUNE ressource.
    // EN: ⚠️ ADDED - CONDITIONAL resource production, found via the Solar
    // fragment audit. Scorch normally generates NO resource.
    ressourceGeneree: [
      { type: "melee", conditionnel: "vaincre des cibles souffrant de blessures solaires octroie de l'energie de melee" }
    ],
    regleStacking: "Stacks jusqu'\xE0 un seuil, d\xE9clenche une Ignition \u2014 voir 01_DAMAGE_STACKING.md pour le d\xE9tail"
  },
  {
    id: "ignition",
    nomFr: "Embrasement",
    nomEn: "Ignition",
    championEtourdi: "implacable",
    element: "solaire",
    categorie: "debuff_ennemi",
    motsClesFr: ["ignition", "embrasement"],
    motsClesEn: ["ignition"],
    // FR : ⚠️ AJOUT (25/08/2026) - lien conditionnel enfin comblé. La
    // description officielle du fragment Tison de charbon a été transmise
    // par l'utilisateur (capture d'écran DIM) : "Vos Embrasements solaires
    // infligent des Blessures solaires aux cibles touchées." Portion
    // distinctive retenue comme condition plutôt que la phrase intégrale -
    // assez précise pour ne matcher que ce fragment, assez robuste pour
    // tolérer une reformulation mineure du Manifest.
    // EN: ⚠️ ADDED - conditional link finally filled in. The official
    // description of the Ember of Ashes fragment was provided by the user.
    produit: [{ verbeId: "scorch", conditionnel: "embrasements solaires infligent des blessures solaires" }],
    // FR : ⚠️ AJOUT (25/08/2026) - 2 productions de ressource
    // CONDITIONNELLES, trouvées via l'audit des fragments Solaire.
    // Embrasement ne génère normalement AUCUNE ressource - ces deux
    // fragments lui en donnent une, chacun sous sa propre condition.
    // EN: ⚠️ ADDED - 2 CONDITIONAL resource productions, found via the
    // Solar fragment audit. Ignition normally generates NO resource.
    ressourceGeneree: [
      { type: "grenade", conditionnel: "eliminer des cibles avec des embrasements solaires confere de l'energie de grenade" },
      { type: "super", conditionnel: "eliminer rapidement plusieurs cibles avec des embrasements solaires genere un orbe de puissance" }
    ],
    regleStacking: "Explosion ponctuelle (payoff du Scorch), pas d'effet de stacking dans la dur\xE9e"
  },
  {
    id: "radieux",
    nomFr: "Radiance",
    nomEn: "Radiant",
    championEtourdi: "bloqueur",
    element: "solaire",
    categorie: "buff_soi",
    motsClesFr: ["radieux", "radiance"],
    motsClesEn: ["radiant"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "restauration",
    nomFr: "Restauration",
    nomEn: "Restoration",
    element: "solaire",
    categorie: "buff_soi",
    motsClesFr: ["restauration"],
    motsClesEn: ["restoration"],
    regleStacking: "Ne stack pas avec Healing Rift \u2014 la dur\xE9e la plus longue obtenue est conserv\xE9e au renouvellement"
  },
  {
    id: "soin",
    nomFr: "Soin",
    nomEn: "Cure",
    element: "solaire",
    categorie: "buff_soi",
    // FR : ⚠️ CORRIGÉ (25/08/2026) - "cure" retiré de motsClesFr : ce n'est
    // pas un vrai mot français ici (doublon inutile avec "soin", qui couvre
    // déjà les formes françaises réelles). Côté anglais, déplacé en
    // correspondance STRICTE : matchait à tort 11 perks sur les 7
    // artefacts (filobscure, occurence, procure), 0 vrai match.
    // ⚠️ SECOND problème trouvé EN TESTANT ce correctif (pas celui
    // demandé, mais sur la même entrée) : "soin" (nom) et "soign-" (racine
    // du verbe soigner) sont deux séquences DIFFÉRENTES en français -
    // elles divergent dès la 4e lettre ('n' contre 'g'). "soin" seul ne
    // couvrait donc AUCUNE forme conjuguée ("soigne", "soignez",
    // "soignent"). Ajouté "soign" comme racine distincte.
    // EN: ⚠️ FIXED - "cure" removed from motsClesFr. ⚠️ SECOND issue found
    // WHILE TESTING this fix: "soin" (noun) and "soign-" (verb stem) are
    // genuinely different letter sequences in French - "soin" alone never
    // matched any conjugated form of "soigner". Added "soign" as a
    // separate root.
    motsClesFr: ["soin", "soign"],
    motsClesEn: [],
    motsClesStrictsEn: ["cure"],
    regleStacking: "Effet instantan\xE9 (\xE0 la pose), les stacks (x1/x2/x3) augmentent le montant soign\xE9 d'un coup"
  },
  // --- STASIS ---
  {
    id: "ralentissement",
    nomFr: "Ralentissement",
    nomEn: "Slow",
    championEtourdi: "implacable",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["ralenti"],
    motsClesEn: ["slow"],
    produit: [{ verbeId: "gel" }],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Murmure de réfraction) : "Vaincre des cibles ralenties ou
    // gelées vous confère de l'énergie de capacité de doctrine." Même
    // condition portée sur Gel ci-dessous.
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    ressourceGeneree: [{ type: "classe", conditionnel: "vaincre des cibles ralenties ou gelees vous confere de l'energie de capacite de doctrine" }],
    regleStacking: "Stacks jusqu'\xE0 un seuil qui d\xE9clenche le Gel"
  },
  {
    id: "gel",
    nomFr: "Gel",
    nomEn: "Freeze",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["gel", "gele"],
    motsClesEn: ["freeze", "frozen"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 nouveaux liens trouvés par audit de
    // fragments : Éclat stasique (Facette de contrôle : "Éliminer des
    // cibles gelées ... crée un éclat stasique") en plus de Brisure déjà
    // en place.
    // EN: ⚠️ ADDED - 2 new links found via fragment audit.
    produit: [
      { verbeId: "brisure" },
      { verbeId: "eclat_stasique", conditionnel: "eliminer des cibles gelees ou neutralisees cree un eclat stasique ou une breche abyssale" }
    ],
    // FR : ⚠️ AJOUT (26/08/2026) - Murmure de liens : "Éliminer des
    // cibles gelées génère un orbe de puissance" (énergie de Super), et
    // même condition de classe que Ralentissement ci-dessus (Murmure de
    // réfraction couvre les deux verbes dans une seule description).
    // EN: ⚠️ ADDED - conditional resources found via fragment audit.
    ressourceGeneree: [
      { type: "classe", conditionnel: "vaincre des cibles ralenties ou gelees vous confere de l'energie de capacite de doctrine" },
      { type: "super", conditionnel: "eliminer des cibles gelees genere un orbe de puissance" }
    ],
    regleStacking: "\xC9tat binaire (gel\xE9ou non) \u2014 payoff : Fracasser (Shatter)"
  },
  {
    id: "armure_givre",
    nomFr: "Armure de givre",
    nomEn: "Frost Armor",
    element: "stase",
    categorie: "buff_soi",
    motsClesFr: ["armure de givre", "armures de givre"],
    motsClesEn: ["frost armor"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Murmure de chaînes ("Éliminer des cibles pendant que
    // vous avez Armure de givre a une chance de créer un éclat stasique")
    // et Murmure d'inversion ("Quand vous avez l'Armure de givre, les
    // dégâts de mêlée ralentissent votre cible").
    // EN: ⚠️ ADDED - 2 conditional links found via fragment audit.
    produit: [
      { verbeId: "eclat_stasique", conditionnel: "eliminer des cibles pendant que vous avez armure de givre a une chance de creer un eclat stasique" },
      { verbeId: "ralentissement", conditionnel: "quand vous avez l'armure de givre les degats de melee ralentissent votre cible" }
    ],
    regleStacking: "Stacks (jusqu'\xE0 x5 ou x7 avec Whisper of Rime), d\xE9cro\xEEt d'un stack toutes les 5s"
  },
  // --- STRAND ---
  {
    id: "rupture",
    nomFr: "Sectionnement",
    nomEn: "Sever",
    element: "filobscur",
    categorie: "debuff_ennemi",
    motsClesFr: ["rupture", "sectionn"],
    motsClesEn: ["sever"],
    produit: [{ verbeId: "enchevetrement" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "suspension",
    nomFr: "Suspension",
    nomEn: "Suspend",
    championEtourdi: "implacable",
    element: "filobscur",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "suspens" seul ne couvre que le NOM
    // (« suspension », « en suspens »), pas le VERBE conjugué
    // (« suspendu », « suspendues », « suspendre ») : le français a deux
    // racines différentes ici. Signalé par l'utilisateur : "suspendues"
    // n'était surligné que sur "suspend" (7 lettres), qui matchait par
    // COÏNCIDENCE via le mot-clé ANGLAIS "suspend" - ma fonction de
    // surlignage ne distingue pas la langue du texte, elle prend ce qui
    // matche. Ajout de la racine verbale française, pour un vrai match FR
    // plutôt qu'un accident via l'anglais.
    // EN: ⚠️ FIXED - "suspens" alone only covers the NOUN, not the
    // conjugated VERB - French has two different stems here. Reported by
    // the user: "suspendues" only highlighted "suspend" (7 letters), which
    // matched by COINCIDENCE via the ENGLISH keyword.
    motsClesFr: ["suspens", "suspend"],
    motsClesEn: ["suspend"],
    produit: [{ verbeId: "enchevetrement" }],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Fil d'esprit ("Éliminer des cibles en Suspension
    // confère de l'énergie de compétence de classe") et Fil de sagesse
    // ("Éliminer des cibles suspendues crée un orbe de puissance", énergie
    // de Super).
    // EN: ⚠️ ADDED - 2 conditional resources found via fragment audit.
    ressourceGeneree: [
      { type: "classe", conditionnel: "eliminer des cibles suspendues confere de l'energie de competence de classe" },
      { type: "super", conditionnel: "eliminer des cibles suspendues cree un orbe de puissance" }
    ],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "cotte_tissee",
    nomFr: "Maille tiss\xE9e",
    nomEn: "Woven Mail",
    element: "filobscur",
    categorie: "buff_soi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - le renommage d'affichage
    // (Cotte tissée -> Maille tissée) n'avait pas mis à jour le MOT-CLÉ de
    // détection, qui ne matchait donc encore que "cotte tissee". Ajouté
    // "maille tissee", gardé l'ancien en repli au cas où un texte plus
    // ancien du Manifest utiliserait encore la formulation précédente.
    // EN: ⚠️ FIXED - the display rename didn't update the detection
    // KEYWORD, which still only matched "cotte tissee". Added
    // "maille tissee", kept the old one as a fallback.
    motsClesFr: ["maille tissee", "mailles tissees", "cotte tissee", "cottes tissees"],
    motsClesEn: ["woven mail"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Fil de transmutation) : "Sous l'effet de Maille tissée,
    // vos frags à l'arme spéciale créent un Enchevêtrement."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "enchevetrement", conditionnel: "sous l'effet de maille tissee vos frags a l'arme speciale creent un enchevetrement" }],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  // FR : ⚠️ AJOUT (24/08/2026) - mécaniques de RESSOURCE (mods d'armure),
  // demande de l'utilisateur suite au diagnostic des stats d'armure.
  // Basées UNIQUEMENT sur ce que confirme knowledge-base/08_GAME_MECHANICS.md
  // (mécanisme Gain/Consommation) et les mods réellement vus dans les
  // diagnostics de l'utilisateur (Capuche d'eutechnologie, Rôdeur
  // nocturne) - pas de mod inventé ou supposé.
  // EN: ⚠️ ADDED - RESOURCE mechanics (armor mods), per user request
  // following the armor stat diagnostic. Based ONLY on what
  // 08_GAME_MECHANICS.md confirms and mods actually seen in the user's real
  // diagnostics - no invented or assumed mod.
  {
    id: "charge_armure",
    nomFr: "Charge d'armure",
    nomEn: "Armor Charge",
    element: null,
    categorie: "ressource",
    // FR : SOURCE — le gain est indirect (ramasser un Orbe avec un mod de
    // charge équipé), donc peu de texte de perk le formule explicitement.
    // On couvre les termes que la description d'un mod générateur emploie
    // réellement (Siphon, Reaper : "kill" + type d'arme/aptitude = Orbe).
    // FR : ⚠️ CORRIGÉ (26/08/2026, passe d'audit du scoring) - "orbe de
    // puissance" (le terme RÉEL employé par le jeu, "Orb of Power")
    // manquait de ce tableau, qui n'avait que "orbe de pouvoir" (coquille
    // de terminologie). Conséquence sérieuse : les 17 descriptions de
    // fragments transcrites lors de l'audit du 26/08 (dont Fil de tutelle,
    // Facette de détermination) disent TOUTES "orbe de puissance" - aucune
    // ne pouvait donc jamais donner `aSource=true` à charge_armure, ce qui
    // bloquait TOUTE la chaîne (Maille tissée, Charge éclair, Restauration,
    // Armure de givre, Surbouclier) dès le premier maillon. Signalé par
    // l'utilisateur : le test de Facette de détermination n'affichait rien.
    // EN: ⚠️ FIXED - "orbe de puissance" (the REAL term the game uses) was
    // missing from this list, which only had "orbe de pouvoir" (a
    // terminology typo). Serious consequence: all 17 fragment descriptions
    // transcribed during the 26/08 audit say "orbe de puissance" - none
    // could ever grant charge_armure `aSource=true`, blocking the entire
    // downstream chain from the very first link.
    motsClesFr: [
      "charge d'armure",
      "charges d'armure",
      "ramassage d'orbe",
      "orbe de lumiere",
      "orbe de pouvoir",
      "orbe de puissance",
      "orbes de puissance"
    ],
    motsClesEn: ["armor charge", "orb of power", "orb pickup"],
    // FR : ⚠️ AJOUT (26/08/2026) - liens conditionnels trouvés par audit
    // de fragments : Fil de tutelle ("Ramasser un orbe de puissance
    // confère Maille tissée") et Facette de détermination, exclusive au
    // Prismatique ("Ramasser un orbe de puissance confère Charge éclair,
    // Restauration, Armure de givre, Maille tissée ou Surbouclier, selon
    // le type de dégâts du Super équipé") - 4 verbes supplémentaires
    // confirmant et étendant le même mécanisme de ramassage d'orbe.
    // EN: ⚠️ ADDED - conditional links found via fragment audit, one
    // Prismatic-exclusive fragment confirming/extending the same orb
    // pickup mechanism across 5 subclass-specific verbs.
    produit: [
      { verbeId: "cotte_tissee", conditionnel: "ramasser un orbe de puissance confere maille tissee" },
      // FR : ⚠️ AJOUT (26/08/2026) - même lien, mais aussi vérifié via le
      // texte de Facette de détermination (Prismatique) : un build qui n'a
      // QUE ce fragment équipé (pas Fil de tutelle) doit quand même activer
      // le lien. Deux entrées vers la MÊME cible plutôt qu'une logique OU
      // dans un seul champ `conditionnel` (qui ne porte qu'une chaîne) -
      // `dejaAtteints` dans le moteur de détection évite un double
      // traitement si les deux conditions sont vraies à la fois.
      // EN: ⚠️ ADDED - same link, also verified via the Prismatic
      // fragment's text: a build with ONLY that fragment equipped should
      // still activate the link. Two entries to the SAME target rather
      // than an OR inside a single `conditionnel` string field.
      { verbeId: "cotte_tissee", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "charge_eclair", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "restauration", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "armure_givre", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "surbouclier", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" }
    ],
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "Tir de l'ombre : Carquois de Moebius" (Super Chasseur Abyssal)
    // source bien Charge d'armure, mais était classé "payoff orphelin" à
    // tort : "Vaincre des cibles tenues en laisse crée des orbes de
    // puissance" - "vaincre" est ici utilisé au sens générique ("tuer un
    // ennemi"), pas comme condition de consommation d'un debuff déjà
    // appliqué par CE verbe (le sens habituel de "vaincre" dans notre
    // liste de marqueurs payoff, ex : "vaincre une cible gelée"). Exception
    // ciblée plutôt que d'assouplir "vaincre" globalement (casserait sa
    // signification légitime ailleurs dans le catalogue).
    // EN: ⚠️ ADDED - this Super genuinely sources Charge d'armure, but was
    // misclassified as an orphaned payoff: "vaincre" is used here in a
    // generic sense ("kill an enemy"), not as a precise consumption
    // condition of an existing debuff. Targeted exception rather than
    // loosening the marker globally.
    sourcesForcees: ["vaincre des cibles tenues en laisse cree des orbes de puissance"],
    regleStacking: "Ressource \xE0 stacks (3 par d\xE9faut, jusqu'\xE0 6 avec Charged Up) \u2014 se d\xE9grade avec le temps, pas un buff/debuff classique"
  },
  {
    id: "surcharge_arme",
    nomFr: "Surcharge d'arme",
    nomEn: "Weapon Surge",
    element: null,
    categorie: "ressource",
    // FR : PAYOFF — consomme des Charges d'armure pour un bonus de dégâts
    // par type d'arme, tant que le stack est actif (mod passif, jambes).
    motsClesFr: ["surcharge"],
    motsClesEn: ["surge"],
    regleStacking: "Passif \u2014 bonus croissant par stack de Charge d'armure active, d\xE9cro\xEEt avec le temps"
  },
  {
    id: "source_aptitude",
    nomFr: "Source d'aptitude",
    nomEn: "Ability Source",
    element: null,
    categorie: "ressource",
    // FR : mods "Source de Super"/"Source de Grenade" vus dans les
    // diagnostics réels de l'utilisateur (Capuche d'eutechnologie, Rôdeur
    // nocturne) : ils donnent de l'énergie d'aptitude à l'activation d'une
    // autre aptitude - source pure, pas de payoff à chercher.
    motsClesFr: ["source de super", "source de grenade", "source de melee", "siphon"],
    motsClesEn: ["ability source", "siphon"],
    // FR : ⚠️ AJOUT (25/08/2026) - les 3 types réunis dans une seule
    // entrée, moins précis que les autres verbes-ressources : cette entrée
    // conflate déjà plusieurs mods réels distincts ("Source de Super",
    // "Source de Grenade", "Source de Mêlée") en une seule ligne du
    // catalogue. Signal de ressource générique par nécessité, pas par
    // choix - une vraie séparation demanderait de scinder l'entrée en 3.
    // EN: ⚠️ ADDED - the 3 types combined in one entry, less precise than
    // other resource verbs since this entry already conflates several
    // distinct real mods into a single catalogue line.
    ressourceGeneree: [{ type: "super" }, { type: "grenade" }, { type: "melee" }],
    regleStacking: "Instantan\xE9 \xE0 l'activation d'une aptitude \u2014 pas de stack"
  },
  // FR : ⚠️ AJOUT (24/08/2026) - 12 verbes identifiés dans
  // knowledge-base/22_CHAINES_DE_VERBES.md mais jamais portés dans ce
  // catalogue jusqu'ici. Noms anglais repris du fichier de documentation
  // (certains marqués "à confirmer" là-bas, gardés tels quels ici -
  // n'affecte que le libellé nomEn, pas la détection elle-même qui repose
  // sur motsClesFr/motsClesEn).
  // EN: ⚠️ ADDED - 12 verbs identified in the documentation file but never
  // ported into this catalogue until now.
  {
    id: "feu_follet",
    ressourceGeneree: [{ type: "grenade" }],
    nomFr: "Feu follet",
    nomEn: "Firesprite",
    element: "solaire",
    categorie: "ressource",
    motsClesFr: ["feu follet", "feux follets"],
    motsClesEn: ["firesprite"],
    // FR : ⚠️ AJOUT (25/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Tison de clémence) : "Ramasser un Feu follet octroie
    // Restauration." Racine distinctive retenue comme condition.
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "restauration", conditionnel: "ramasser un feu follet octroie restauration" }],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "charge_eclair",
    ressourceGeneree: [{ type: "melee" }],
    nomFr: "Charge \xE9clair",
    nomEn: "Ionic Charge",
    // à confirmer
    element: "arc",
    categorie: "ressource",
    motsClesFr: ["charge eclair", "charges eclair"],
    motsClesEn: ["ionic charge"],
    // FR : ⚠️ AJOUT (26/08/2026) - même condition que Secousse ci-dessus
    // (Étincelle ionique) : "... ou éliminer une cible en utilisant une
    // Charge éclair crée une Piste ionique."
    // EN: ⚠️ ADDED - same fragment as Jolt above, second trigger.
    produit: [{ verbeId: "piste_ionique", conditionnel: "eliminer une cible qui subit des secousses ou eliminer une cible en utilisant une charge eclair cree une piste ionique" }],
    regleStacking: "Cumuls \u2014 s'accumule tant qu'actif, effet \xE0 cumul maximum"
  },
  {
    id: "piste_ionique",
    ressourceGeneree: [{ type: "generique" }],
    nomFr: "Piste ionique",
    nomEn: "Ionic Traces",
    element: "arc",
    categorie: "ressource",
    motsClesFr: ["piste ionique", "pistes ioniques"],
    motsClesEn: ["ionic trace"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle de décharge) : "Ramasser une Piste ionique vous
    // confère un cumul de Charge éclair."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "charge_eclair", conditionnel: "ramasser une piste ionique vous confere un cumul de charge eclair" }],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "breche_abyssale",
    ressourceGeneree: [{ type: "classe" }],
    nomFr: "Br\xE8che abyssale",
    nomEn: "Void Breach",
    // à confirmer
    element: "abyssal",
    categorie: "ressource",
    motsClesFr: ["breche abyssale", "breches abyssales"],
    motsClesEn: ["void breach"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho de famine) : "Ramasser une Brèche abyssale ou un
    // orbe de puissance confère Dévoration."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "devour", conditionnel: "ramasser une breche abyssale ou un orbe de puissance confere devoration" }],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "cristal_stase",
    nomFr: "Cristal de Stase",
    nomEn: "Stasis Crystal",
    // à confirmer
    element: "stase",
    categorie: "buff_soi",
    motsClesFr: ["cristal de stase", "cristaux de stase"],
    motsClesEn: ["stasis crystal"],
    produit: [{ verbeId: "gel" }, { verbeId: "ralentissement" }, { verbeId: "eclat_stasique" }],
    regleStacking: "Objet pos\xE9 sur le terrain, d\xE9truisible \u2014 pas un buff/debuff classique"
  },
  {
    id: "brisure",
    nomFr: "Brisure",
    nomEn: "Shatter",
    championEtourdi: "implacable",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["brisure", "se brise", "se briser"],
    motsClesEn: ["shatter"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Murmure des fractures) : "Briser une cible gelée avec une
    // attaque de mêlée confère un cumul d'Armure de givre."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "armure_givre", conditionnel: "briser une cible gelee avec une attaque de melee confere un cumul d'armure de givre" }],
    regleStacking: "Instantan\xE9, \xE0 la rupture d'une cible gel\xE9e \u2014 pas de stack"
  },
  {
    id: "eclat_stasique",
    ressourceGeneree: [{ type: "melee" }],
    nomFr: "\xC9clat stasique",
    nomEn: "Shard of Stasis",
    // à confirmer
    element: "stase",
    categorie: "ressource",
    motsClesFr: ["eclat stasique", "eclats stasiques"],
    motsClesEn: ["stasis shard", "shard of stasis"],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "enchevetrement",
    nomFr: "Enchev\xEAtrement",
    nomEn: "Tangle",
    // à confirmer
    element: "filobscur",
    categorie: "ressource",
    // FR : "enchevetr" (sans accent, après normalisation) couvre
    // "Enchevêtrement", "Enchevêtré", "Enchevêtrés" via la racine commune.
    motsClesFr: ["enchevetr"],
    motsClesEn: ["tangle"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Fil de fureur ("Infliger des dégâts aux cibles avec
    // un Enchevêtrement vous confère de l'énergie de mêlée") et Facette
    // d'honneur, exclusive au Prismatique ("Détruire un Enchevêtrement
    // vous confère de l'énergie de Transcendance du même type").
    // EN: ⚠️ ADDED - 2 conditional links found via fragment audit.
    ressourceGeneree: [{ type: "melee", conditionnel: "infliger des degats aux cibles avec un enchevetrement vous confere de l'energie de melee" }],
    produit: [{ verbeId: "transcendance", conditionnel: "obtenir un objet elementaire ou detruire un enchevetrement vous confere de l'energie de transcendance du meme type" }],
    regleStacking: "Objet pos\xE9 sur le terrain, d\xE9truisible ou ramassable \u2014 pas un buff/debuff classique"
  },
  {
    id: "brindille",
    nomFr: "Brindille",
    nomEn: "Threadling",
    // à confirmer
    element: "filobscur",
    categorie: "buff_soi",
    motsClesFr: ["brindille"],
    motsClesEn: ["threadling"],
    regleStacking: "Cr\xE9ature invoqu\xE9e \u2014 pas un buff/debuff classique"
  },
  {
    // FR : ⚠️ AJOUT (24/08/2026) - trouvé par l'utilisateur dans le perk
    // « Éclat photonique » (Tablette de la Ruine), qui mentionne une cible
    // « épuisée » sans jamais définir le terme. Confirmé par l'utilisateur :
    // s'applique en perturbant les Champions Surchargés, ou via des armes
    // ayant les particularités d'origine « Psychopiratage » ou « Soumission ».
    // ⚠️ SANS ÉLÉMENT : contrairement aux autres états de combat du
    // catalogue, Épuisement n'appartient à aucune doctrine - il vient d'une
    // interaction avec un Champion ou d'une particularité d'arme. Lui
    // assigner un élément aurait été une donnée fausse (même raisonnement
    // que pour Charge d'armure).
    // Vérifié : c'est le SEUL état de combat mentionné dans les 7 artefacts
    // qui n'était pas déjà couvert par le catalogue (audit du 05/08).
    // EN: ⚠️ ADDED - found by the user in the "Éclat photonique" perk, which
    // mentions an "épuisée" target without ever defining it. Confirmed:
    // applied by disrupting Overload Champions, or via weapons with the
    // "Psychopiratage"/"Soumission" origin traits. NO ELEMENT: unlike other
    // combat states, this belongs to no subclass.
    id: "epuisement",
    nomFr: "\xC9puisement",
    nomEn: "Weaken?",
    // nom anglais non confirmé
    element: null,
    categorie: "debuff_ennemi",
    motsClesFr: ["epuis"],
    motsClesEn: [],
    regleStacking: "\xC9tat de combat appliqu\xE9 par perturbation d'un Champion Surcharg\xE9 ou par particularit\xE9 d'origine (Psychopiratage, Soumission)"
  },
  {
    id: "effilochage",
    nomFr: "Effilochage",
    nomEn: "Unravel",
    championEtourdi: "bloqueur",
    element: "filobscur",
    categorie: "debuff_ennemi",
    // FR : "effiloch" couvre "Effilochage", "effilochant", "effiloché" via
    // la racine commune.
    motsClesFr: ["effiloch"],
    motsClesEn: ["unravel"],
    produit: [{ verbeId: "enchevetrement" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "transcendance",
    nomFr: "Transcendance",
    nomEn: "Transcendence",
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["transcendance", "transcendant"],
    motsClesEn: ["transcendence"],
    // FR : ⚠️ AJOUT (26/08/2026) - voir la doc complète du champ sur
    // l'interface VerbeCatalogue. Sans ça, Transcendance ne peut jamais
    // être reconnue "source" (son propre texte ne décrit qu'un payoff
    // auto-entretenu), ce qui bloque toute chaîne prismatique en aval.
    // EN: ⚠️ ADDED - see the field's full doc on VerbeCatalogue. Without
    // it, Transcendance can never be "source", blocking the entire
    // downstream Prismatic chain.
    sourceImplicite: true,
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Facette de générosité) : "Éliminer des cibles quand vous
    // êtes sous l'effet de Transcendance crée des orbes de puissance pour
    // vos alliés" (énergie de Super).
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    ressourceGeneree: [{ type: "super", conditionnel: "eliminer des cibles quand vous etes sous l'effet de transcendance cree des orbes de puissance pour vos allies" }],
    regleStacking: "Dur\xE9e prolong\xE9e par \xE9limination \u2014 pas de stack classique"
  },
  {
    id: "grenade_prismatique_chasseur",
    nomFr: "Grenade prismatique (Chasseur)",
    nomEn: "Hail the Storm?",
    // nom anglais non confirmé, voir knowledge-base
    element: "prismatique",
    categorie: "buff_soi",
    // FR : nom en jeu confirmé par l'utilisateur : "Pic Grêle de Feu".
    motsClesFr: ["pic grele de feu"],
    motsClesEn: [],
    // FR : ⚠️ AJOUT (26/08/2026) - voir la doc complète sur
    // VerbeCatalogue. Ces 3 grenades sont identifiées par leur NOM propre
    // (pas un terme de debuff en prose) : sans ce champ, aucune ne peut
    // jamais être classée "source", bloquant les 4-2 verbes qu'elles
    // déclenchent en aval.
    // EN: ⚠️ ADDED - see full doc on VerbeCatalogue. These 3 grenades are
    // identified by their own NAME - without this, none can ever be
    // classified "source", blocking their downstream verbs.
    sourceImplicite: true,
    // FR : ⚠️ AJOUT (25/08/2026) - déclenche 4 verbes simultanément à
    // l'impact (2 par élément combiné), tous inconditionnels — confirmé
    // dans knowledge-base/22.
    produit: [{ verbeId: "scorch" }, { verbeId: "ignition" }, { verbeId: "ralentissement" }, { verbeId: "gel" }],
    regleStacking: "Disponible uniquement sous Transcendance \u2014 pas de stack"
  },
  {
    // FR : ⚠️ AJOUT (25/08/2026) - MANQUANTE jusqu'ici : seule la version
    // Chasseur avait été portée dans le code, bien que les 3 grenades
    // soient documentées et validées dans knowledge-base/22 depuis le
    // 24/08. Trouvé en construisant le graphe de chaînes.
    // EN: ⚠️ ADDED - MISSING until now: only the Hunter version had been
    // ported to code, even though all 3 grenades were already documented.
    id: "grenade_prismatique_titan",
    nomFr: "Grenade prismatique (Titan)",
    nomEn: "Titan Prismatic Grenade",
    // nom anglais non confirmé
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["piege electrifiant"],
    motsClesEn: [],
    sourceImplicite: true,
    produit: [{ verbeId: "suspension" }, { verbeId: "jolt" }],
    regleStacking: "Disponible uniquement sous Transcendance \u2014 pas de stack"
  },
  {
    id: "grenade_prismatique_arcaniste",
    nomFr: "Grenade prismatique (Arcaniste)",
    nomEn: "Warlock Prismatic Grenade",
    // nom anglais non confirmé
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["singularite glacee"],
    motsClesEn: [],
    sourceImplicite: true,
    // FR : ⚠️ Gel N'EST PAS listé ici, volontairement - confirmé par
    // l'utilisateur : c'est une conséquence EN CASCADE de Ralentissement
    // (via le lien ralentissement -> gel déjà posé plus bas dans ce
    // fichier), pas un 3e effet direct de cette grenade. L'ajouter ici en
    // double aurait été une redondance, pas une précision.
    // EN: ⚠️ Gel is NOT listed here on purpose - it's a CASCADING
    // consequence of Ralentissement, not a 3rd direct effect of this
    // grenade. Listing it here too would be redundant.
    produit: [{ verbeId: "suppression" }, { verbeId: "ralentissement" }],
    regleStacking: "Disponible uniquement sous Transcendance \u2014 pas de stack"
  }
];

// src/lib/scoring/marqueSimule.ts
var MARQUE_SIMULE = " \u{1F528} simul\xE9";

// src/data/artefacts.ts
var ARTEFACTS = [
  {
    id: "encrypted-data-disk",
    nom: "Disque de donn\xE9es crypt\xE9es",
    nomEn: "Encrypted Data Disk",
    itemHash: 3980449645,
    saison: "Renegades",
    elements: ["arc", "abyssal"],
    soutientCinetique: true,
    armes: ["Sword", "Sniper Rifle", "Machine Gun"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Profiter de l'avantage", description: `Briser le bouclier d'un combattant augmente la stabilit\xE9, le maniement et la vitesse de rechargement d'"arme". Les \xE9p\xE9es obtiennent une r\xE9sistance de garde am\xE9lior\xE9e.` },
        { tier: 1, nom: "Synth\xE8se cin\xE9tique", description: `Les "d\xE9g\xE2ts d'arme cin\xE9tique" continus et les frags rapides ont une chance de r\xE9g\xE9n\xE9rer une seule brique de munitions. Ramasser cette brique vous donne des munitions pour les armes \xE0 d\xE9g\xE2ts cin\xE9tiques \xE9quip\xE9es et octroie de la progression de munitions lourdes et sp\xE9ciales.` },
        { tier: 1, nom: "Rechargement \xE0 distance", description: 'Les tirs de pr\xE9cision avec des [icone arc] "arcs" et des [icone fusil de pr\xE9cision] "fusils de pr\xE9cision" conf\xE8rent un bonus cumul\xE9 \xE0 leur vitesse de rechargement.' },
        { tier: 1, nom: "Riposte", description: 'Peu apr\xE8s avoir par\xE9 avec une [icone \xE9p\xE9e] "\xE9p\xE9e", vos attaques lourdes et l\xE9g\xE8res "\xE9tourdissent" les combattants sans bouclier. Efficace contre les [icone implacable] Champions implacables.' },
        { tier: 1, nom: "Douleur contre puissance", description: 'Les frags rapides contre des combattants "affaiblis" vous conf\xE8rent "D\xE9voration" et cr\xE9ent une "Br\xE8che abyssale".' },
        { tier: 1, nom: "Prox\xE9mie f\xE9roce", description: `Les frags par "coup de gr\xE2ce" conf\xE8rent de l'\xE9nergie de Grenade et de M\xEAl\xE9e.` },
        { tier: 1, nom: "Rem\xE8de rapide", description: 'Les frags rapides \xE0 la [icone mitrailleuse] "mitrailleuse" vous soignent.' }
      ],
      2: [
        { tier: 2, nom: "Di\xE9lectrique", description: 'Eliminer des cibles souffrant de malus [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" conf\xE8re "Charge \xE9clair". Eliminer rapidement des cibles souffrants de malus "cryo-\xE9lectrique" fait appara\xEEtre un "orbe de puissance" et restaure une petite portion de sant\xE9.' },
        { tier: 2, nom: "Sp\xE9cialiste des armures", description: "Briser le bouclier d'un combattant vous conf\xE8re temporairement de la r\xE9sistance aux d\xE9g\xE2ts et des d\xE9g\xE2ts de m\xEAl\xE9e augment\xE9s." },
        { tier: 2, nom: "Energie de contre", description: `Quand vous ou un membre de votre escouade "\xE9tourdissez" un Champion, vous gagnez de l'\xE9nergie pour votre comp\xE9tence la moins charg\xE9e.` },
        { tier: 2, nom: "Combo lame d'argent", description: 'Faites une courte pause apr\xE8s une attaque l\xE9g\xE8re et attaque lourde pour \xE9nergiser votre [icone \xE9p\xE9e] "\xE9p\xE9e" pendant un court moment, ce qui lui conf\xE8re un bonus de d\xE9g\xE2ts et de vitesse de charge.' },
        { tier: 2, nom: "Lame de singularit\xE9", description: `Quand vous b\xE9n\xE9ficiez d'un "bonus \xE9l\xE9mentaire abyssal", les coups de m\xEAl\xE9e et d'\xE9p\xE9e "affaiblissent" les cibles, et les frags \xE0 l'\xE9p\xE9e et en m\xEAl\xE9e cr\xE9ent une "rafale affaiblissante".` },
        { tier: 2, nom: "Secousses aveuglantes", description: 'Les frags de combattants affect\xE9s par une "Secousse" infligent "C\xE9cit\xE9" aux combattants avoisinants.' },
        { tier: 2, nom: "Equit\xE9 de pr\xE9cision", description: "Les frags de pr\xE9cision font progresser un gros orbe de puissances, qui augmente les d\xE9g\xE2ts d'arme lorsqu'il est ramass\xE9. Les cibles de rang \xE9lev\xE9 font progresser plus vite." }
      ],
      3: [
        { tier: 3, nom: "Orbes \xE9l\xE9mentaires : cryo-\xE9lectriques", description: `Les frags \xE0 l'arme [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" ont une chance de faire appara\xEEtre un orbe \xE9l\xE9mentaire cryo-\xE9lectrique. Les orbes cryo-\xE9lectriques peuvent \xEAtre lanc\xE9s ou tir\xE9s pour cr\xE9er une explosion cryo-\xE9lectrique qui inflige "Secousse" aux ennemis touch\xE9s.` },
        { tier: 3, nom: "Rupture cin\xE9tique", description: `Les d\xE9g\xE2ts d'arme "cin\xE9tique" sur un combattant puissant ont une chance de cr\xE9er une rupture cin\xE9tique. Cibler cette rupture cr\xE9e une explosion qui inflige des d\xE9g\xE2ts et "fait chanceler" les combattants. Efficace contre les [icone implacable] Champions implacables.` },
        { tier: 3, nom: "M\xE9ditation du tireur", description: `Les tirs au [icone fusil de pr\xE9cision] "fusil de pr\xE9cision" octroient un cumul de d\xE9g\xE2ts de fusil de pr\xE9cision, de stabilit\xE9 et de bonus de rechargement. Les tirs au fusil de pr\xE9cision avec munitions lourdes compte pour plus d'un tir.` },
        { tier: 3, nom: "Combo temp\xEAtes de lames", description: `R\xE9aliser 3 attaques l\xE9g\xE8res \xE0 l'[icone \xE9p\xE9e] "\xE9p\xE9e" suivies d'une attaque lourde invoque des lames t\xE9n\xE9breuses qui vous entourent afin d'infliger des d\xE9g\xE2ts et de d\xE9sorienter les combattants. Les frags \xE0 l'\xE9p\xE9e allongent la dur\xE9e de ces lames t\xE9n\xE9breuses.` },
        { tier: 3, nom: "Infestation abyssale", description: `Eliminer une cible "affaiblie" fait apparaitre un projectile traqueur qui affaiblit d'autres cibles.` },
        { tier: 3, nom: "Tazer tag", description: 'Les coups de m\xEAl\xE9e [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" infligent une "Secousse" aux combattants et augmentent les d\xE9g\xE2ts pendant un court moment.' },
        { tier: 3, nom: "Electroadh\xE9sion", description: `Les grenades fluctuantes [icone cryo-\xE9lectrique] "cryo-\xE9lectrique", magn\xE9tiques [icone abyssal] "abyssales" et \xE0 fusion [icone solaire] "solaires" infligent plus de d\xE9g\xE2ts lorsqu'elles sont attach\xE9es aux combattants. En cas de frag, elles lib\xE8rent des micro-missiles qui traquent les combattants avoisinants.` }
      ]
    }
  },
  {
    id: "implement-of-curiosity",
    nom: "Outillage de Curiosit\xE9",
    nomEn: "Implement of Curiosity",
    itemHash: 2694905144,
    saison: "Reclamation",
    elements: ["solaire", "stase", "filobscur"],
    soutientCinetique: true,
    armes: ["Bow", "Sword", "Micro-Missiles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Fi\xE8vre et Frisson", description: 'Les tirs de pr\xE9cision rapides avec des armes [icone solaire] "Solaires" conf\xE8rent "Radiance". Les tirs de pr\xE9cision rapides avec des armes [icone stase] "Stasiques" conf\xE8rent "Armure de Givre".' },
        { tier: 1, nom: "Bienveillance \xE9l\xE9mentaire", description: `Donner un "bonus \xE9l\xE9mentaire" aux alli\xE9s conf\xE8re de l'\xE9nergie de "comp\xE9tence de classe".` },
        { tier: 1, nom: "Renouveau Glac\xE9", description: `Quand vous avez "Armure de Givre", subir des d\xE9gats critiques lib\xE8re une rafale qui "G\xE8le" les combattant proches et vous conf\xE8re "Armure de Givre", ainsi qu'\xE0 vos alli\xE9s.` },
        { tier: 1, nom: "Transport de Horde", description: `Les d\xE9gats d'arme inflig\xE9s aux cibles "Effiloch\xE9es" font parfois appara\xEEtre une "Brindille". Les Brindilles "Sectionnent" les cibles \xE0 qui elles infligent des d\xE9gats.` },
        { tier: 1, nom: "Fils rafra\xEEchis", description: `Rammasser un "objet \xE9l\xE9mentaire" qui correspond \xE0 votre doctrine ou un "Enchev\xEAtrement" quand vous avec un Super [icone filobscur] "Filobscur" \xE9quip\xE9 conf\xE8re de l'\xE9nergie \xE0 votre comp\xE9tence la moins charg\xE9e.` },
        { tier: 1, nom: "Tactique de meute", description: 'Infliger des d\xE9g\xE2ts avec des "Brindilles" augmente les d\xE9gats des Brindilles. Lorsque les cumuls sont au maximum, les Brindilles "\xE9tourdissent" les [icone Implacable] Champions Implacables.' },
        { tier: 1, nom: "Assaillant semi-automatique", description: "Si vous avez au moins 2 unit\xE9s de charge d'armure, les tirs de pr\xE9cision rapides avec les arcs, les fusils de pr\xE9cision et les fusils d'\xE9claireurs g\xE9n\xE8re une charge d'armure." }
      ],
      2: [
        { tier: 2, nom: "Explosion entrelac\xE9e", description: `D\xE9truire un "Enchev\xEAtrement" avec des d\xE9gats [icone filobscur] "Filobscurs" augmente le rayon de l'explosion et ses d\xE9g\xE2ts.` },
        { tier: 2, nom: "T\xE9n\xE8bres caut\xE9ris\xE9es", description: 'Les combattants non boss avec des malus [icone stase] "Stasiques" ou [icone filobscur] "Filobscurs subissent plus de d\xE9gats [icone solaire] "Solaires" de toute source.' },
        { tier: 2, nom: "Confusion \xE9l\xE9mentaire", description: "Etourdir un Champion avec une arme \xE9l\xE9mentaire cr\xE9e une explosion \xE9l\xE9mentaire align\xE9e, qui applique un malus \xE9l\xE9mentaire correspondant au Champion et aux cibles proches." },
        { tier: 2, nom: "Soutien mutuel", description: "Infliger des d\xE9g\xE2ts de pr\xE9cision continus contre des combattants quand vous \xEAtes pr\xE8s d'au moins deux alli\xE9s vous conf\xE8re de la r\xE9sistance aux d\xE9gats." },
        { tier: 2, nom: "Coalescence \xE9l\xE9mentaire", description: 'Eliminer d\xE9s cibles conf\xE8reune chance de cr\xE9er un "objet \xE9l\xE9mentaire" qui correspond \xE0 votre \xE9l\xE9ment de "Super" \xE9quip\xE9.' },
        { tier: 2, nom: "L'ar\xF4me des balles neuves", description: "Ramasser une brique de munitions augmente les d\xE9g\xE2ts de vos armes cin\xE9tiques pendant une courte dur\xE9e." },
        { tier: 2, nom: "Acc\xE9l\xE9ration \xE9nerg\xE9tique", description: 'Des d\xE9g\xE2ts continus avec des "micro-missiles" font \xE9mettre au combattant une onde de choc "cin\xE9tique" qui inflige des d\xE9g\xE2ts aux combattants proches. Efficace contre les [icone Implacable] Champions Implacable.' }
      ],
      3: [
        { tier: 3, nom: "Mitraille rayonnante", description: `Infliger des d\xE9g\xE2ts continus sous l'effet de "Radiance" ou \xE9liminer un combattant souffrant de "Blessures solaires" avec une arme pousse la cible \xE0 lib\xE9rer des projectiles solaires qui infligent des d\xE9g\xE2ts et des Blessures solaires \xE0 l'impact.` },
        { tier: 3, nom: "Broyeur de bouclier", description: `Lorsque vous avez "Maille tiss\xE9e", "Armure de givre"ou un "Surbouclier abyssal", votre "M\xEAl\xE9e" se recharge plus vite et inflige plus de d\xE9g\xE2ts. Lorsque vous \xEAtes sous l'effet d'"Amplificateur" ou de "Radiance", votre "Grenade" se recharge plus vite et inflige plus de d\xE9g\xE2ts.` },
        { tier: 3, nom: "Surealimentation \xE9l\xE9mentaire", description: 'Ramasser un "objet \xE9l\xE9mentaire" ou un "Enchev\xEAtrement" conf\xE8re des d\xE9g\xE2ts accrus aux armes du m\xEAme \xE9l\xE9ment.' },
        { tier: 3, nom: "Toile enchev\xEAtr\xE9e", description: 'Cr\xE9er un "Enchev\xEAtrement" en \xE9liminant une cible ayant un malus [icone filobscur] "Filobscur" "suspend" les combattants proches.' },
        { tier: 3, nom: "Regard glacial", description: 'Quand "Armure de givre" est active, les frags de pr\xE9cision [icone stase] "Stasiques" poussent poussent les combattants \xE0 lib\xE9rer une rafale de "gel".' },
        { tier: 3, nom: "Vigueur du Seigneur de Fer", description: "Quand vous portez une \xE9p\xE9e, vous subissez moins de d\xE9g\xE2ts ; les frags rapides octroient des munitions au porteur." },
        { tier: 3, nom: "Carquois argent\xE9", description: `Recharger un "arc" consomme un cumul de "charge d'armure", augmentant les d\xE9g\xE2ts et la vitesse de rechargement de vos 3 prochains tirs ou jusqu'\xE0 ce que vous rangiez votre arc.` }
      ]
    }
  },
  {
    id: "tablet-of-ruin",
    nom: "Tablette de la Ruine",
    nomEn: "Tablet of Ruin",
    itemHash: 2392273483,
    saison: "Heresy",
    elements: ["arc", "abyssal", "filobscur", "prismatique"],
    soutientCinetique: false,
    armes: ["Fusion Rifles", "Glaives", "Trace Rifles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Tenir bon", description: 'Quand vous \xEAtes encercl\xE9, les [icone mitrailleuses] "mitrailleuses" et les [icone glaive] "glaives" ont une meilleure vitesse de rechargement et stabilit\xE9 ; les frags vous soignent.' },
        { tier: 1, nom: "Di\xE9lectrique", description: 'Eliminer des cibles souffrant de malus [icone cryo-\xE9lectrique] "cryo-\xE9lectriques" conf\xE8re "Charge \xE9clair". Eliminer rapidement des cibles souffrant de malus "cryo-\xE9lectriques" fait appara\xEEtre un "orbe de puissance" et restaure une petite porton de sant\xE9.' },
        { tier: 1, nom: "Tir d'\xE9lite volatil", description: `Les tirs de pr\xE9cision rapides par arme [icone abyssale] "abyssale" et les frags rapides par arme abyssale conf\xE8rent des "munitions volatiles". Les explosions "volatiles" conf\xE8rent de l'\xE9nergie de comp\xE9tence de classe.` },
        { tier: 1, nom: "Orbes effilochants", description: 'Ramasser un "orbe de puissance" ou un "Enchev\xEAtrement" conf\xE8re des "munitions effilochantes" aux armes [icone filobscur] "filobscur".' },
        { tier: 1, nom: "Eclat photonique", description: 'Eliminer une cible "\xE9puis\xE9e" ou "sectionn\xE9e" avec d\xE9g\xE2ts [icone cryo-\xE9lectrique] "cryo-\xE9lectriques" lib\xE8re une rafale qui inflige "C\xE9cit\xE9"' },
        { tier: 1, nom: "Siphon \xE9l\xE9mentaire", description: `Les frags rapides \xE0 l'aide d'une arme [icone cin\xE9tique] "cin\xE9tique" ou d'une arme correspondant \xE0 votre "Super" \xE9quip\xE9 cr\xE9ent un "objet \xE9l\xE9mentaire" \xE0 ramasser qui correspond \xE0 votre Super \xE9quip\xE9. Les "objets \xE9l\xE9mentaires" conf\xE8rent de l'\xE9nergie de "Super" correspondante quand ils sont r\xE9cup\xE9r\xE9s.` },
        { tier: 1, nom: "Destruction perp\xE9tuelle", description: 'Les frags rapides avec des [icone lance-roquettes] "lance-roquettes" non exotiques rechargent les munitions et augmentent la vitesse de rechargement pendant une courte dur\xE9e.' }
      ],
      2: [
        { tier: 2, nom: "Tissage ignoble", description: 'Les cibles touch\xE9es par vos "Enchev\xEAtrements" sont victimes de "Sectionnement". Ramasser un Enchev\xEAtrement r\xE9duit leur temps de r\xE9cup\xE9ration.' },
        { tier: 2, nom: "R\xE9colte ignoble", description: `En appliquant rapidement "Volatil", votre prochaine occurence de d\xE9g\xE2ts d'arme [icone abyssale] "abyssale" cr\xE9e une rafale "affaiblissante". Appliquer cet affaiblissement conf\xE8re un petit "surbouclier abyssal".` },
        { tier: 2, nom: "Electrification", description: 'Quand vous obtenez le maximum de "Charge \xE9clair", vous recevez aussi "Amplificateur". Les \xE9clairs infligent plus de d\xE9g\xE2ts.' },
        { tier: 2, nom: "Transport de horde", description: `Les d\xE9g\xE2ts d'arme inflig\xE9s aux cibles "effiloch\xE9es" font parfois appara\xEEtre une "Brindille". Les Brindilles "sectionnent" les cibles \xE0 qui elles infligent des d\xE9g\xE2ts.` },
        { tier: 2, nom: "Pas de cloche", description: `Les frags de m\xEAl\xE9e rapides \xE0 l'aide de [icone glaive] "glaives" font appara\xEEtre des munitions sp\xE9ciales de glaive suppl\xE9mentaires. Bloquer des d\xE9g\xE2ts avec des glaives augmente les d\xE9g\xE2ts de m\xEAl\xE9e qu'ils infligent aux cibles.` },
        { tier: 2, nom: "R\xE9fraction cruelle", description: `Les [icone fusil \xE0 rayon] "fusil \xE0 rayon" infligent plus de d\xE9g\xE2ts aux cibles qui subissent des malus \xE9l\xE9mentaires correspondant \xE0 leur type d'\xE9l\xE9ment.` },
        { tier: 2, nom: "Plomb en or", description: "Ramasser des munitions sp\xE9ciales a une chance d'octroyer des munitions lourdes." }
      ],
      3: [
        { tier: 3, nom: "Reconstruction de particules", description: 'Infliger des d\xE9g\xE2ts continus avec des [icone fusil \xE0 fusion] "fusils \xE0 fusion" ou des [icone fusil \xE0 fusion lin\xE9aire] "fusil \xE0 fusion lin\xE9aire" recharge partiellement le chargeur \xE0 partir des r\xE9serves et leur conf\xE8re un bonus de d\xE9g\xE2ts pendant une courte dur\xE9e contre cette cible.' },
        { tier: 3, nom: "Superchargeur \xE9l\xE9mentaire", description: `Eliminer des cibles "\xE9puis\xE9es" ou "sectionn\xE9es" avec des armes correspondant \xE0 votre \xE9l\xE9ment de "Super" conf\xE8re de l'\xE9nergie de Super.` },
        { tier: 3, nom: "R\xE9g\xE9n\xE9ration d'artillerie lourde", description: `Infliger des d\xE9g\xE2ts continus avec des [icone mitrailleuses] "mitrailleuses" ou des [icone lance-roquettes] "lance-roquettes" conf\xE8re de la r\xE9sistance aux d\xE9g\xE2ts et am\xE9liore la r\xE9g\xE9n\xE9ration d'\xE9nergie de "Grenade" et de "M\xEAl\xE9e" pendantune courte dur\xE9e. Avec ce mod activ\xE9, \xE9liminerdes combattants puissants d\xE9soriente les combattants de base proches.` },
        { tier: 3, nom: "Explosion d\xE9fibrillatrice", description: 'Etourdir un Champion conf\xE8re le cumul maximum de "Charges \xE9clair". Toucher des cibles avec ces charges leur inflige "Secousse" et vous soigne.' },
        { tier: 3, nom: "Flux abyssal", description: `Eliminer des cibles "affaiblies" avec une arme [icone abyssale] "abyssale" applique "Volatil" aux cibles proches. Les cibles puissantes augmentent le rayon d'explosion.` },
        { tier: 3, nom: "Plus de limite", description: `Lancer un "Super" lorsque vous \xEAtes en \xE9tat critique ou que vous b\xE9n\xE9ficiez d'un bonus \xE9l\xE9mentaire correspondant \xE0 votre \xE9l\xE9ment de Super augmente temporairement vos d\xE9g\xE2ts de Super.` },
        { tier: 3, nom: "En lambeaux", description: `Infliger des d\xE9g\xE2ts continus \xE0 des cibles victimes de "Sectionnement" les "effiloche". Eliminer une cible "sectionn\xE9e" cr\xE9e un point d'\xE9nergie [icone filobscur] filobscure et conf\xE8re "Maille tiss\xE9e" aux alli\xE9s proches pendant une courte dur\xE9e.` }
      ]
    }
  },
  {
    id: "slayer-baron-apothecary-satchel",
    nom: "Sacoche d'apothicaire de Baron-Bourreau",
    nomEn: "Slayer Baron Apothecary Satchel",
    itemHash: 3044482290,
    saison: "Revenant",
    elements: ["arc", "abyssal", "stase"],
    soutientCinetique: false,
    armes: ["Grenade Launchers", "Shotguns"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Vent glac\xE9", description: `Les tirs de pr\xE9cision rapides avec une arme [icone stase] "stasique" vous conf\xE8rent un cumul d'"Armure de Givre" ; les touches sur des cibles ralenties ou gel\xE9es cr\xE9ent \xE9galement un "\xE9clat stasique".` },
        { tier: 1, nom: "Convertisseur cristallin", description: 'Apr\xE8s avoir activ\xE9 votre comp\xE9tence de classe, votre prochain frag avec une arme [icone stase] "stasique" cr\xE9e un "\xE9clat stasique". R\xE9cup\xE9rez des "\xE9clats stasiques" pour obtenir des cumuls de Convertisseur cristallin, qui permettent \xE0 votre prochaine "attaque de m\xEAl\xE9e [icone stase] stasique charg\xE9e" de cr\xE9er des "cristaux de stase" \xE9gaux au nombre de cumuls que vous avez.' },
        { tier: 1, nom: "Carnage total", description: 'Apr\xE8s un "coup de gr\xE2ce" sur un combattant coriace, vous gagnez de la r\xE9sistance aux d\xE9g\xE2ts temporaire et restaurez votre sant\xE9.' },
        { tier: 1, nom: "Douleur contre puissance", description: 'Les frags rapides contre des combattants "affaiblis" vous conf\xE8rent "D\xE9voration" et cr\xE9ent une "Br\xE8che abyssale".' },
        { tier: 1, nom: "Jeu de piste", description: `Les tirs de pr\xE9cision rapides ou les frags rapides sur des cibles affect\xE9es par "Secousse" ou "C\xE9cit\xE9" g\xE9n\xE8rent des "Pistes ioniques". Ramasser une Piste ionique conf\xE8re une "charge d'armure".` },
        { tier: 1, nom: "Au coeur de l'action", description: `Lorsque l'ennemi vous encercle, les frags rapides vous conf\xE8rent une "charge d'armure". Quand vous \xEAtes encercl\xE9s, le "maniement" de vos armes est am\xE9lior\xE9 ; les [icone \xE9p\xE9e] \xE9p\xE9es ont une meilleure "vitesse de charge".` },
        { tier: 1, nom: "Brise mortelle", description: 'Les frags rapides avec une "arme" vous conf\xE8rent un bonus de mobilit\xE9.' }
      ],
      2: [
        { tier: 2, nom: "Renouveau glac\xE9", description: `Quand vous avez "Armure de Givre", subir des d\xE9g\xE2ts critiques lib\xE8re une rafale qui "g\xE8le" les combattants proches et vous conf\xE8re Armure de Givre, ainsi qu'\xE0 vos alli\xE9s.` },
        { tier: 2, nom: "Appel temp\xEAte", description: 'Briser des cibles "gel\xE9es" et des cristaux de "stase" augmente les d\xE9g\xE2ts. Briser des cristaux de "stase" lib\xE8re des \xE9clats de glace qui infligent des d\xE9g\xE2ts aux cibles et les "ralentissent".' },
        { tier: 2, nom: "Vague affaiblissante", description: `Les "coups de gr\xE2ce" \xE9mettent une onde \xE0 d\xE9g\xE2ts correspondant \xE0 l'\xE9l\xE9ment de votre "Super" \xE9quip\xE9. Les ondes "cryo-\xE9lectriques", "abyssales" ou "stasiques" appliquent "C\xE9cit\xE9", "Affaiblissement" et "Ralentissement".` },
        { tier: 2, nom: "Affaiblissement clair", description: `Utiliser un lance-grenades, blesser un boss, blesser un Champion ou briser le bouclier d'un combattant recharge vos armes rang\xE9es et "affaiblit" votre cible.` },
        { tier: 2, nom: "Br\xFBlure r\xE9tinienne", description: `Les frags rapides par tir de pr\xE9cision avec une arme [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" utilisent une "charge d'armure" pour envoyer une rafale de "C\xE9cit\xE9" \xE0 l'emplacement de la cible.` },
        { tier: 2, nom: "Orbes curatifs", description: `La premi\xE8re fois que vous brisez le bouclier d'une cible ou celui d'un Gardien utilisant son Super, vous cr\xE9ez un "orbe de puissance". Ramasser un "objet \xE9l\xE9mentaire", ramasser un "orbe de puissance" ou d\xE9truire un "Enchev\xEAtrement" vous conf\xE8re une petite quantit\xE9 de sant\xE9.` },
        { tier: 2, nom: "Renouveau abyssal", description: `Lorsque "D\xE9voration" est activ\xE9e, les frags \xE0 l'arme [icone abyssale] "abyssale" ont une chance de cr\xE9er une "Br\xE8che abyssale". Ramasser une Br\xE8che abyssale augmente le "rechargement" et le "maniement" des armes ; les [icone fusil \xE0 pompe] "fusils \xE0 pompe" et les [icone lance-grenades] "lance-grenades" sont aussi recharg\xE9s depuis les r\xE9serves.` }
      ],
      3: [
        { tier: 3, nom: "Gel c\xE9r\xE9bral", description: `Les combattants "gel\xE9s" sont entour\xE9s d'un brouillard glacial, qui "ralentit" ceux qui ne le sont pas encore.` },
        { tier: 3, nom: "Supernova", description: 'Ramasser une "Br\xE8che abyssale" permet \xE0 votre prochaine source de d\xE9g\xE2ts abyssaux de cr\xE9er un grand rayon "affaiblissant".' },
        { tier: 3, nom: "Cristal cosmique conducteur", description: 'Vos comp\xE9tences [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" et [icone abyssale] "abyssale" infligent des d\xE9g\xE2ts bonus aux cibles affect\xE9s par un malus |icone stase] "stasique".' },
        { tier: 3, nom: "Se mange froid", description: `Ramasser un [icone stase] "\xE9clat stasique" vous conf\xE8re de l'\xE9nergie de comp\xE9tence de "classe". Ramasser une [icone abyssale] "Br\xE8che abyssale" vous conf\xE8re de l'\xE9nergie de "m\xEAl\xE9e".` },
        { tier: 3, nom: "Impacts cin\xE9tiques", description: 'Infliger des d\xE9g\xE2ts continus avec un [icone lance-grenades] "lance-grenades" augmente temporairement la vitesse de rechargement des lance-grenades et d\xE9clenche un "onde de choc cin\xE9tique". Cette onde de choc peut "\xE9tourdir" les [icone Implacable] Champions Implacables.' },
        { tier: 3, nom: "Combinaison cryo-\xE9lectrique", description: 'Les sources [icone cryo-\xE9lectriques] "cryo-\xE9lectriques" infligent plus de d\xE9g\xE2ts aux cibles souffrant de "C\xE9cit\xE9".' },
        { tier: 3, nom: "Rite des dieux anciens", description: `Apr\xE8s avoir ramass\xE9 une [icone abyssale] "Br\xE8che abyssale", infliger des d\xE9g\xE2ts \xE0 l'aide d'une arme "abyssale" cr\xE9e une pluie de projectiles traqueurs.` }
      ]
    }
  },
  {
    id: "hunters-journal",
    nom: "Journal du Chasseur",
    nomEn: "Hunter's Journal",
    itemHash: 2180638678,
    saison: "Echoes",
    elements: ["solaire", "arc", "abyssal", "prismatique"],
    soutientCinetique: false,
    armes: ["Auto Rifles", "Sniper Rifles", "Swords"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Siphon \xE9l\xE9mentaire", description: `Les frags rapides \xE0 l'aide d'une arme [icone cin\xE9tique] "cin\xE9tique" ou d'une arme correspondant \xE0 votre "Super" \xE9quip\xE9 cr\xE9ent un "objet \xE9l\xE9mentaire" \xE0 ramasser qui correspond \xE0 votre Super \xE9quip\xE9.` },
        { tier: 1, nom: "Substrat de diffusion \xE9nerg\xE9tique", description: "Augmente l\xE9g\xE8rement votre r\xE9sistance \xE0 tous les d\xE9g\xE2ts inflig\xE9s par des combattants." },
        { tier: 1, nom: "Frisson insidieux", description: `Les frags [icone stase] "Stasiques" face aux cibles "ralenties" ou "gel\xE9es" rel\xE2chent une explosion qui "ralentit" les combattants et conf\xE8re "Armure de Givre" aux alli\xE9s pris dans l'explosion.` },
        { tier: 1, nom: "Profiter de l'avantage", description: `Briser le bouclier d'un combattant augmente la stabilit\xE9, le maniement et la vitesse de rechargement d'"arme". Les [icone \xE9p\xE9e] \xE9p\xE9es obtiennent une r\xE9sistance de garde am\xE9lior\xE9e.` },
        { tier: 1, nom: "Explosion entrelac\xE9e", description: `D\xE9truire un "Enchev\xEAtrement" avec des d\xE9g\xE2ts [icone filobscur] "Filobscurs" augmente le rayon de l'explosion et ses d\xE9g\xE2ts.` },
        { tier: 1, nom: "Munitions incendiaires pour fusil", description: 'Les tirs de pr\xE9cision r\xE9alis\xE9s avec un [icone fusil de pr\xE9cision][icone solaire] "fusil de pr\xE9cision solaire" infligent des "Blessures solaires" aux cibles.' },
        { tier: 1, nom: "Tirs soutenu", description: "Infliger des d\xE9g\xE2ts \xE0 des combattants ou soigner des alli\xE9s en continu avec un [icone fusil automatique] vous conf\xE8re une r\xE9sistance aux d\xE9g\xE2ts." }
      ],
      2: [
        { tier: 2, nom: "Energie de contre", description: `Quand vous ou un membre de votre escouade "\xE9tourdissez" un Champion, vous gagnez de l'\xE9nergie pour votre comp\xE9tence la moins charg\xE9e.` },
        { tier: 2, nom: "Endurance de Lame", description: 'Eliminer rapidement des combattants avec une [icone \xE9p\xE9e] "\xE9p\xE9e" recharge quelques munitions.' },
        { tier: 2, nom: "H\xE9g\xE9monie abyssale", description: 'Lorsque vous avez une doctrine "Abyssale" ou "Prismatique" \xE9quip\xE9e, \xE9liminer les cibles "affaibles" fournit un petit "surbouclier abyssal".' },
        { tier: 2, nom: "Orbes radieux", description: 'Lorsque vous avez une doctrine "Solaire" ou "Prismatique" \xE9quip\xE9e, ramasser un orbe de puissance vous octroie "Radiance".' },
        { tier: 2, nom: "Mauvaise amplitude", description: 'Blesser un Champion avec une comp\xE9tence [icone cryo-\xE9lectrique] "Cryo-\xE9lectrique" lui inflige une "Secousse".' },
        { tier: 2, nom: "Fulmination solaire", description: 'Vos "Embrasements" infligent plus de d\xE9g\xE2ts dans un rayon plus large.' },
        { tier: 2, nom: "Recharge automatique du ciblage", description: `Lorsqu'un [icone fusil automatique] "fusil automatique" est \xE9quip\xE9, \xE9liminer des combattants recharge votre arme \xE9quip\xE9e et augmente temporairement les d\xE9g\xE2ts d'arme. Les frags quand vous \xEAtes encercl\xE9 octroient un bonus de progression.` }
      ],
      3: [
        { tier: 3, nom: "Transfert prismatique", description: "Quand vous utilisez votre Super, chaque membre de votre escouade avec un type de Super diff\xE9rent du v\xF4tre gagne de d\xE9g\xE2ts." },
        { tier: 3, nom: "Lame d'argent", description: `Lorsque vous avez de la "charge d'armure", infliger des d\xE9g\xE2ts avec un \xE9p\xE9e consomme un cumul de charge d'armure et renforce votre [icone \xE9p\xE9e] "\xE9p\xE9e" pendant un court moment, lui octroyant des d\xE9g\xE2ts bonus et de l'\xE9nergie de vitesse de charge.` },
        { tier: 3, nom: "Ab\xEEme d\xE9ploy\xE9", description: 'Les sources "abyssales" infligent des d\xE9g\xE2ts aux cibles "affaiblies".' },
        { tier: 3, nom: "Broyeur de bouclier", description: `Lorsque vous avez "Maille tiss\xE9e", "Armure de givre"ou un "Surbouclier abyssal", votre "M\xEAl\xE9e" se recharge plus vite et inflige plus de d\xE9g\xE2ts. Lorsque vous \xEAtes sous l'effet d'"Amplificateur" ou de "Radiance", votre "Grenade" se recharge plus vite et inflige plus de d\xE9g\xE2ts.` },
        { tier: 3, nom: "Transfert", description: `Les d\xE9g\xE2ts de "Grenade" et de "M\xEAl\xE9e" augmentent lorsque vous \xEAtes sous l'effet de "Transcendance". Les frags avec une arme en \xE9tant sous l'effet de "Transcendance" rechargent votre \xE9nergie de "Lumi\xE8re" et de "T\xE9n\xE8bres" une fois la Transcendance termin\xE9e.` },
        { tier: 3, nom: "M\xE9ditation du tireur", description: `Les tirs au [icone fusil de pr\xE9cision] "fusil de pr\xE9cision" octroient un cumul de d\xE9g\xE2ts de fusil de pr\xE9cision, de stabilit\xE9 et de bonus de rechargement. Les tirs au fusil de pr\xE9cision avec munitions lourdes compte pour plus d'un tir.` },
        { tier: 3, nom: "Choc et effroi", description: `Lorsqu'une doctrine [icone cryo-\xE9lectrique] "Cryo-\xE9lectrique" ou "Prismatique" est \xE9quip\xE9e, les frags "cryo-\xE9lectriques" sous l'effet d'"Amplificateur" attirent un \xE9clair qui inflige des d\xE9g\xE2ts ainsi que des "Secousses" aux cibles.` }
      ]
    }
  },
  {
    id: "queensfoil-censer",
    nom: "Encensoir \xE0 feuilles de Reine",
    nomEn: "Queensfoil Censer",
    itemHash: 3518286241,
    saison: "Wish",
    elements: ["solaire", "stase", "filobscur"],
    soutientCinetique: false,
    armes: ["Rocket Launcher", "Grenade Launchers"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Fi\xE8vre et Frisson", description: 'Les tirs de pr\xE9cision rapides avec des armes [icone solaire] "Solaires" conf\xE8rent "Radiance". Les tirs de pr\xE9cision rapides avec des armes [icone stase] "Stasiques" conf\xE8rent "Armure de Givre".' },
        { tier: 1, nom: "Torche", description: `Lorsque "Radiance" est actif, les d\xE9g\xE2ts d'arme inflig\xE9s aux combattants victimes de malus [icone filobscure] "filobscur" et [icone stasique] "stasique" augmentent.` },
        { tier: 1, nom: "Coeur de flamme", description: 'Lancer votre Super solaire propage "Radiance" aux alli\xE9s et les d\xE9g\xE2ts du Super augmentent en fonction des alli\xE9s proches.' },
        { tier: 1, nom: "Sp\xE9cialiste des armures", description: "Briser le bouclier d'un combattant vous conf\xE8re temporairement de la r\xE9sistance aux d\xE9g\xE2ts et des d\xE9g\xE2ts de m\xEAl\xE9e augment\xE9s." },
        { tier: 1, nom: "Voeu d'existence", description: "Quand votre Super est presque enti\xE8rement charg\xE9, les frags de comp\xE9tence font appara\xEEtre des orbes de puissance." },
        { tier: 1, nom: "Allume-feu", description: `Lorsque "Radiance" est actif, les armes [icone solaire] "solaire" infligent des "Blessures solaires" aux cibles qui n'en sont pas encore victimes.` },
        { tier: 1, nom: "Rayon de souffle", description: `Les frags rapides par [icone lance-roquettes] lance-roquettes et [icone lance-grenade] lance-grenades conf\xE8rent de la "charge d'armure".` }
      ],
      2: [
        { tier: 2, nom: "Orbes effilochants", description: 'Ramasser un "orbe de puissance" ou un "Enchev\xEAtrement" conf\xE8re des "munitions effilochantes" aux armes [icone filobscur] "filobscures".' },
        { tier: 2, nom: "Pilier de glace", description: 'Eliminer une cible "gel\xE9e" fait appara\xEEtre des cristaux de "stase".' },
        { tier: 2, nom: "Explosion revitalisante", description: `Etourdir un Champion provoque un "Embrasement" et annule l'\xE9tourdissement de votre bouclier.` },
        { tier: 2, nom: "Coiffe anti-Champions", description: "Les [icone lance-roquettes] lance-roquettes infligent plus de d\xE9gats aux Champions." },
        { tier: 2, nom: "Morsure du Dragon", description: `Briser le bouclier d'un combattant avec une arme [icone filobscure] filobscure ou [icone stasique] stasique offre une chance de "suspendre" ou "geler" ce combattant.` },
        { tier: 2, nom: "Frisson insidieux", description: `Les frags [icone stasique] "stasiques" face aux cibles "ralenties" ou "gel\xE9es" rel\xE2chent une explosion qui "ralentit" les combattants et conf\xE8re "Armure de Givre" aux alli\xE9s pris dans l'explosion.` },
        { tier: 2, nom: "Destruction perp\xE9tuelle", description: 'Les frags rapidesavec des [icone lance-roquettes] "lance-roquettes" non exotiques rechargent les munitions et augmentent la vitesse de rechargement pendant une courte dur\xE9e.' }
      ],
      3: [
        { tier: 3, nom: "Transport de horde", description: `Les d\xE9g\xE2ts d'arme inflig\xE9s aux cibles "effiloch\xE9es" font parfois appara\xEEtre une "Brindille". Les Brindilles "sectionnent" les cibles \xE0 qui elles infligent des d\xE9gats.` },
        { tier: 3, nom: "Appel de temp\xEAte", description: 'Briser des cibles "gel\xE9es" et des cristaux de "stase" augmente les d\xE9g\xE2ts. Briser des cristaux de "stase" lib\xE8re des \xE9clats de glace qui infligent des d\xE9g\xE2ts aux cibles et les "ralentissent".' },
        { tier: 3, nom: "Rayons de pr\xE9cision", description: 'Lorsque "Radiance" est activ\xE9e, les frags de pr\xE9cision [icone solaire] "solaire" embrasent les combattants.' },
        { tier: 3, nom: "Op\xE9rateur solitaire", description: "Lorsque vous \xEAtes l'unique membre de votre escouade, les frags \xE0 l'arme de pr\xE9cision augmentent les d\xE9g\xE2ts d'arme jusqu'\xE0 ce que vous soyez \xE9limin\xE9." },
        { tier: 3, nom: "Artillerie d'argent", description: `Les tirs au [icone lance-roquettes] lance-roquettes consomment un cumul de "charge d'armure", augmentant les d\xE9g\xE2ts et la vitesse de rechargement jusqu'\xE0 ce que vous rechargiez ou rangiez votre lance-roquettes.` },
        { tier: 3, nom: "Regard glacial", description: 'Quand "Armure de Givre" est active, les frags de pr\xE9cision [icone stasique] "stasique" poussent les combattants \xE0 lib\xE9rer une rafale de "gel".' },
        { tier: 3, nom: "En Lambeaux", description: `INfliger des d\xE9g\xE2ts continus \xE0 des cibles victimes de "Sectionnement" les "effiloche". Eliminer une cible "sectionn\xE9e" cr\xE9e un point d'\xE9nergie [icone filobscure] filobscure et conf\xE8re "Maille tiss\xE9e" aux alli\xE9s proches pendant une courte dur\xE9e.` }
      ]
    }
  },
  {
    id: "npa-repulsion-regulator",
    nom: "R\xE9gulateur r\xE9pulsif ANP",
    nomEn: "NPA Repulsion Regulator",
    itemHash: 2785855278,
    saison: "Deep",
    elements: ["arc", "abyssal", "filobscur"],
    soutientCinetique: false,
    armes: ["Glaive", "Auto Rifles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Effilochage am\xE9lior\xE9", description: 'Augmente la quantit\xE9 de d\xE9g\xE2ts inflig\xE9s en "Effilochant une cible.' },
        { tier: 1, nom: "Flux volatil", description: 'Ramasser un orbe de puissance conf\xE8re des "munitions volatiles" \xE0 vos armes [icone abyssale] "abyssales".' },
        { tier: 1, nom: "Jusqu'\xE0 la br\xE8che", description: 'Eliminer une cible qui subit un "malus [icone abyssale] abyssal" cr\xE9e une "Br\xE8che abyssale" quand vous avez votre doctrine abyssale ou prismatique \xE9quip\xE9e.' },
        { tier: 1, nom: "Energis\xE9", description: `Vous restez plus longtemps sous l'effet d'"Amplificateur" quand vous avez votre doctrine cryo-\xE9lectrique ou prismatique \xE9quip\xE9e.` },
        { tier: 1, nom: "Riposte foudroyante", description: `Conf\xE8re un bonus de d\xE9g\xE2ts au "Super cryo-\xE9lectrique" si ce dernier est activ\xE9durant une blessure critique ou sous l'effet d'"Amplificateur". Dure jusqu'\xE0 la fin de l'activation du Super.` },
        { tier: 1, nom: "Tir soutenu", description: 'Infliger des d\xE9g\xE2ts \xE0 des combattants ou soigner des alli\xE9s en continu avec un [icone fusil automatique] "fusil automatique" vous conf\xE8re une r\xE9sistance aux d\xE9g\xE2ts.' },
        { tier: 1, nom: "Orbes de brisure", description: "La premi\xE8re fois que vous brisez le bouclier d'un combattant, vous cr\xE9ez un orbe de puissance si vous le faitesavec le type de d\xE9g\xE2ts correspondant." }
      ],
      2: [
        { tier: 2, nom: "Soldat de filobscur", description: 'Vos armes [icone filobscur] filobscures ont des "munitions effilochantes" d\xE8s que vous obtenez "Maille tiss\xE9e" quand vousavez votre doctrine filobscure ou prismatique \xE9quip\xE9e.' },
        { tier: 2, nom: "Glaive neutralisant", description: `Blesser des combattants avec votre [icone glaive] glaive les "neutralise" et les emp\xEAche temporairement d'utiliser des "comp\xE9tences".` },
        { tier: 2, nom: "Br\xE8che protectrice", description: 'Ramasser une "Br\xE8che abyssale" vous procure un "surbouclier" suppl\xE9mentaire ou restaure votre "surbouclier abyssale".' },
        { tier: 2, nom: "Charge de contre", description: `Gagnez une "charge d'armure" quand vous \xE9tourdissez un Champion.` },
        { tier: 2, nom: "Briques de l'au-del\xE0", description: "Vaincre un combattant puissant avec une arme [icone abyssale] abyssale donne une chance de g\xE9n\xE9rer de la progression de munitions lourdes pour vous et vos co\xE9quipiers." },
        { tier: 2, nom: "Grenades \xE0 surcharge", description: `Les grenades abyssales perturbent les combattants et les "\xE9tourdissent", ralentissant la r\xE9g\xE9n\xE9ration d'\xE9nergie de comp\xE9tence et r\xE9duisant les d\xE9g\xE2ts inflig\xE9s par un combattant. Efficace contre les [icone surcharg\xE9] Champions surcharg\xE9s.` },
        { tier: 2, nom: "Recharge automatique du ciblage", description: `Lorsqu'un [icone fusil automatique] "fusil automatique" est \xE9quip\xE9, \xE9liminer des combattants recharge votre arme \xE9quip\xE9e et augmente temporairement les d\xE9g\xE2ts d'arme. Les frags quand vous \xEAtes encercl\xE9 octroient un bonus de progression.` }
      ],
      3: [
        { tier: 3, nom: "Aiguille cosmique conductrice", description: "Les cibles affect\xE9es par des malus de [icone filobscur] filobscur subissent plus de d\xE9g\xE2ts des comp\xE9tences [icone abyssal] abyssales et [icone cryo-\xE9lectrique] cryo-\xE9lectriques." },
        { tier: 3, nom: "Choc et effroi", description: `Lorsqu'une doctrine [icone cryo-\xE9lectrique] "Cryo-\xE9lectrique" ou "Prismatique" est \xE9quip\xE9e, les frags "cryo-\xE9lectriques" sous l'effet d'"Amplificateur" attirent un \xE9clair qui inflige des d\xE9g\xE2ts ainsi que des "Secousses" aux cibles.` },
        { tier: 3, nom: "Supernova", description: 'Ramasser une "Br\xE8che abyssale" permet \xE0 votre prochaine source de d\xE9g\xE2ts abyssaux de cr\xE9er un grand rayon "affaiblissant".' },
        { tier: 3, nom: "Chef d'\xE9quipe", description: `R\xE9aliser un coup de gr\xE2ce sous l'effet d'"Amplificateur" conf\xE8re "Amplificateur" aux alli\xE9s proches. R\xE9aliser un coup de gr\xE2ce sous l'effet d'"Maille tiss\xE9e" conf\xE8re "Maille tiss\xE9e" aux alli\xE9s proches. R\xE9aliser un coup de gr\xE2ce sous l'effet d'"D\xE9voration" conf\xE8re "D\xE9voration" aux alli\xE9s proches.` },
        { tier: 3, nom: "Deuxi\xE8me coup de foudre", description: "Apr\xE8s avoir jet\xE9 une grenade cryo-\xE9lectrique, vous obtenez une recharge de grenade am\xE9lior\xE9e pendant un bref moment. Les frags cryo-\xE9lectriques augmentent la dur\xE9e de ce bonus." },
        { tier: 3, nom: "Garde passive agressive", description: "Vous subissez moins de d\xE9g\xE2ts des combattants proches quand vous maniez un [icone de glaive] glaive." },
        { tier: 3, nom: "Canalisation d'arme abyssale", description: "Vous gagnez un bonue temporaire aux d\xE9gats d'arme [icone abyssale] abyssale apr\xE8s avoir vaincu une cible avec une arme [icone abyssale] abyssale alors qu'au moins une de vos comp\xE9tences abyssales est totalement charg\xE9e. Ces bonus augmentent en fonction de votre nombre de comp\xE9tences abyssales totalement charg\xE9es." }
      ]
    }
  }
];

// src/lib/scoring/sourcePayoff.ts
var MARQUEURS_SOURCE = [
  "applique",
  "appliquent",
  "inflige",
  "infligent",
  "octroie",
  "octroient",
  "confere",
  "conferent",
  "accorde",
  "accordent",
  "rend",
  "rendent",
  "genere",
  "generent",
  "provoque",
  "provoquent",
  "declenche",
  "declenchent",
  "cause",
  "causent",
  "devenez",
  "gagnez",
  "obtenez",
  // FR : ⚠️ AJOUT (26/08/2026) - verbes de dégâts génériques, manquants
  // jusqu'ici. Beaucoup de descriptions d'aptitude (mêlées surtout) suivent
  // le patron « [Endommage/Blesse/Touche/Frappe] et [debuff] la cible » -
  // sans ces verbes, la seule chose reconnue dans la phrase était le mot-clé
  // du debuff lui-même, jamais un marqueur SOURCE, ce qui la faisait tomber
  // en indéterminé (ou pire, en payoff avant le retrait des marqueurs bruts
  // ci-dessus). Trouvé via le signalement utilisateur sur la mêlée stasique.
  // EN: ⚠️ ADDED - generic damage verbs. Many ability descriptions (melees
  // especially) follow the pattern "[Damages/Hits/Strikes] and [debuffs] the
  // target" - without these verbs, nothing in the sentence was recognised as
  // a SOURCE marker, pushing it to indeterminate (or worse, payoff before
  // the bare-marker removal above). Found via the user's report on the
  // Stasis melee.
  "endommage",
  "endommagent",
  "blesse",
  "blessent",
  "touche",
  "touchent",
  "frappe",
  "frappent",
  // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine
  // transmises par l'utilisateur) - formes en "-ant" (gérondif),
  // totalement absentes jusqu'ici alors qu'elles sont fréquentes dans ce
  // corpus ("conferant un cumul de Charge éclair à chaque coup" - Sentinelle
  // ionique). Trouvé en faisant tourner les 387 textes réels à travers le
  // moteur de détection et en examinant chaque "payoff orphelin"/
  // "indéterminé" un par un.
  // EN: ⚠️ ADDED - gerund ("-ing") forms, entirely absent until now despite
  // being common in this corpus. Found by running the 387 real doctrine
  // texts through the detection engine.
  "appliquant",
  "infligeant",
  "octroyant",
  "conferant",
  "accordant",
  "rendant",
  "generant",
  "provoquant",
  "declenchant",
  "causant",
  "endommageant",
  "blessant",
  "touchant",
  "frappant",
  "vous etes",
  "grants",
  "applies",
  "inflicts",
  "causes",
  "makes",
  "become",
  "gain",
  "creates",
  // FR : ⚠️ ENRICHI (04/08/2026) - tournures manquantes révélées par un build
  // solaire réel de l'utilisateur, où "Ignition" et "Soin" restaient
  // "indéterminés" alors qu'ils sont clairement appliqués. Le vocabulaire des
  // effets de soin/restauration était particulièrement mal couvert.
  // EN: ⚠️ ENRICHED (2026-08-04) - missing turns of phrase revealed by a real
  // solar build where "Ignition" and "Cure" stayed "undetermined" though
  // clearly applied. Healing/restoration vocabulary was poorly covered.
  "vous soigne",
  "vous soignent",
  "soigne",
  "soignent",
  "restaure",
  "restaurent",
  "regenere",
  "regenerent",
  "amorce",
  "amorcent",
  "produit",
  "produisent",
  "emet",
  "emettent",
  "libere",
  "liberent",
  "active",
  "activent",
  "octroyant",
  "infligeant",
  "appliquant",
  "creant",
  "generant",
  "declenchant",
  "vous beneficiez",
  "beneficiez",
  "commence",
  "commencent",
  "heals",
  "restores",
  "triggers",
  "start",
  // FR : ⚠️ ENRICHI (04/08/2026) - marqueurs ANGLAIS, ajoutés parce que les
  // perks d'artefact viennent de la base de connaissance rédigée en anglais.
  // Le test avant/après a montré que la couverture anglaise était bien plus
  // faible que la française (13 marqueurs contre 57), ce qui faisait tomber
  // ces textes en « indéterminé » — soit 18 points au lieu de 35 pour une
  // vraie boucle. Le déséquilibre pénalisait donc le build de l'utilisateur
  // pour une raison qui n'a rien à voir avec sa qualité.
  //
  // Le manque principal : j'avais mis les formes CONJUGUÉES ("grants",
  // "applies") mais pas les INFINITIFS, or l'anglais des perks les emploie
  // massivement après un auxiliaire ("have a chance to jolt", "can apply").
  //
  // EN: ⚠️ ENRICHED (2026-08-04) - ENGLISH markers. Artifact perks come from
  // the English knowledge base, and English coverage was far thinner than
  // French (13 vs 57), pushing those texts into "undetermined" - 18 points
  // instead of 35 for a real loop. Main gap: I had CONJUGATED forms
  // ("grants", "applies") but not INFINITIVES, which English perk text uses
  // heavily after an auxiliary.
  "have a chance to",
  "chance to",
  "apply",
  "applying",
  "grant",
  "granting",
  "inflict",
  "inflicting",
  "cause",
  "causing",
  "create",
  "creating",
  "generate",
  "generating",
  "emit",
  "emits",
  "emitting",
  "spawn",
  "spawns",
  "spawning",
  "trigger",
  "triggering",
  "heal",
  "healing",
  "restore",
  "restoring",
  "become",
  "becoming",
  "activating",
  "activate",
  "on kill",
  "final blows",
  "final blow",
  "rapidly defeating",
  "you are",
  "you have"
];
var MARQUEURS_PAYOFF = [
  "affecte par",
  "affectee par",
  "affectees par",
  "affectes par",
  "sous l'effet",
  // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
  // variante au pluriel manquante. Trouvé sur "Charge inflexible" (Titan
  // Cryo-électrique) : « Sous LES EFFETS d'Amplificateur, le bouclier
  // bloque... » - ne matchait pas "sous l'effet" (singulier), la seule
  // forme couverte jusqu'ici.
  // EN: ⚠️ ADDED - missing plural variant, found on a real Titan aspect.
  "sous les effets",
  "contre des",
  "contre les",
  "contre une",
  "vaincre",
  "vainquez",
  "en vainquant",
  "detruire",
  "eliminer",
  "elimine une cible",
  "sur des cibles",
  "sur les cibles",
  // FR : ⚠️ RETIRÉ (26/08/2026) - "cibles", "ennemis", "combattants" étaient
  // listés ICI comme des marqueurs PAYOFF bruts (sans qualification), ce qui
  // causait un FAUX POSITIF massif et systématique : une phrase SOURCE tout
  // à fait normale comme « Ralentit les combattants proches » ou « Endommage
  // et ralentit les cibles à proximité » place presque toujours le mot
  // "cibles"/"combattants"/"ennemis" juste APRÈS le verbe de debuff, à
  // quelques caractères - plus proche que n'importe quel marqueur source
  // situé plus tôt dans la phrase. Résultat : `classerOccurrence` classait
  // ces phrases (qui APPLIQUENT clairement le verbe) en PAYOFF, menant à un
  // "payoff_orphelin" (0 pt + avertissement "ce perk ne se déclenchera
  // jamais") sur des perks parfaitement fonctionnels.
  //
  // Signalé par l'utilisateur (26/08) : la mêlée stasique en jeu applique
  // bien Ralentissement (confirmé par le surlignage cyan sur "Ralentir"
  // dans sa description), mais le Pilier 2 la classait en "quelque chose
  // les exploite alors que RIEN ne les applique" - ce qui cassait aussi
  // toute la chaîne Ralentissement → Gel → Brisure → Armure de givre en
  // aval, puisque le parcours en largeur ne démarre que depuis un verbe
  // ayant une vraie source.
  //
  // Reproduit et vérifié sur un script isolé (sans dépendances lourdes) :
  // "Ralentit les combattants proches." passait de {payoff: true} à
  // {indetermine: true} après ce retrait - un résultat sûr (crédit partiel,
  // pas de fausse alerte) plutôt qu'un résultat faux. Les formes QUALIFIÉES
  // ("contre des/les cibles", "sur des/les cibles") restent en place : elles
  // signalent un vrai payoff ("contre les cibles gelées" = la cible est
  // DÉJÀ affectée), contrairement à "cibles" seul qui ne présume rien sur
  // l'ordre sujet/effet.
  //
  // EN: ⚠️ REMOVED - "cibles"/"ennemis"/"combattants" were listed here as
  // BARE payoff markers, causing a massive systematic FALSE POSITIVE: a
  // perfectly normal SOURCE sentence like "Slows nearby combatants" almost
  // always places the target noun right AFTER the debuff verb - closer than
  // any source marker earlier in the sentence. Result: such sentences (which
  // clearly APPLY the verb) were classified as PAYOFF, producing a
  // "payoff_orphelin" (0 pts + "this perk will never trigger" warning) on
  // perfectly functional perks. Reported by the user: the Stasis melee
  // applies Slow (confirmed cyan-highlighted in its description) but Pillar
  // 2 classified it as an orphaned payoff - which also broke the entire
  // downstream chain (Slow → Freeze → Shatter → Frost Armor), since the
  // breadth-first traversal only starts from a verb with a real source.
  // Reproduced and verified in an isolated script: removing this marker
  // flips "Slows nearby combatants." from {payoff: true} to {indetermine:
  // true} - a SAFE outcome (partial credit, no false alarm) rather than a
  // wrong one. The QUALIFIED forms stay in place since they signal a real
  // payoff without assuming word order.
  "affected by",
  "against",
  "defeating",
  "defeat",
  "destroying",
  "damaging",
  // FR : ⚠️ ENRICHI (04/08/2026) - marqueurs ANGLAIS de payoff, même raison
  // que ci-dessus. "while" est le plus utile : l'anglais des perks exprime
  // très souvent la CONDITION d'un bonus par "While Amplified, ..." — ce qui
  // est bien un payoff (on profite d'un état déjà actif), et non une source.
  // EN: ⚠️ ENRICHED - English payoff markers. "while" matters most: perk text
  // often states a bonus's CONDITION as "While Amplified, ...", which is a
  // payoff (benefiting from an already-active state), not a source.
  "while",
  "when you have",
  "whenever",
  "targets affected",
  "affected targets",
  "on defeating",
  "after defeating",
  "versus",
  "against targets",
  "against enemies",
  "empowered by",
  "benefit from",
  "increased damage",
  "bonus damage",
  "deal more",
  "more damage to"
];
var FENETRE = 55;
function classerOccurrence(texteNormalise, positionMotCle) {
  const debut = Math.max(0, positionMotCle - FENETRE);
  let avant = texteNormalise.slice(debut, positionMotCle);
  let apres = texteNormalise.slice(positionMotCle, positionMotCle + FENETRE);
  const finPhrasePrecedente = Math.max(avant.lastIndexOf("."), avant.lastIndexOf("!"), avant.lastIndexOf("?"));
  if (finPhrasePrecedente !== -1) avant = avant.slice(finPhrasePrecedente + 1);
  const finsPhraseSuivante = [".", "!", "?"].map((c) => {
    const i = apres.indexOf(c);
    return i === -1 ? Infinity : i;
  });
  const finPhraseSuivante = Math.min(...finsPhraseSuivante);
  if (finPhraseSuivante !== Infinity) apres = apres.slice(0, finPhraseSuivante + 1);
  let distanceSource = Infinity;
  for (const m of MARQUEURS_SOURCE) {
    const i = avant.lastIndexOf(m);
    if (i !== -1) distanceSource = Math.min(distanceSource, avant.length - i);
    const j = apres.indexOf(m);
    if (j !== -1) distanceSource = Math.min(distanceSource, j);
  }
  let distancePayoff = Infinity;
  for (const m of MARQUEURS_PAYOFF) {
    const i = avant.lastIndexOf(m);
    if (i !== -1) distancePayoff = Math.min(distancePayoff, avant.length - i);
    const j = apres.indexOf(m);
    if (j !== -1) distancePayoff = Math.min(distancePayoff, j);
  }
  if (distanceSource === Infinity && distancePayoff === Infinity) return "indetermine";
  return distanceSource <= distancePayoff ? "source" : "payoff";
}
function analyserTexte(texte, motsCles, motsClesStricts = []) {
  const t = normaliser(texte);
  const roles = { source: false, payoff: false, indetermine: false };
  for (const motCle of motsCles) {
    const cle = normaliser(motCle);
    let position = t.indexOf(cle);
    while (position !== -1) {
      const role = classerOccurrence(t, position);
      roles[role] = true;
      position = t.indexOf(cle, position + cle.length);
    }
  }
  for (const motCle of motsClesStricts) {
    const cle = normaliser(motCle);
    for (const position of positionsMotCleStrict(t, cle)) {
      const role = classerOccurrence(t, position);
      roles[role] = true;
    }
  }
  return roles;
}

// src/data/exotiquesAntiChampion.ts
var REFERENCE_EXOTIQUES_ANTI_CHAMPION = [
  { nom: "Belle Affaire", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Sturm", emplacement: "cinetique", champion: "implacable" },
  { nom: "Aile de Vigilance", emplacement: "cinetique", champion: "implacable" },
  { nom: "Empereur des Rats", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Outil multifonction MIDA", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Garance", emplacement: "cinetique", champion: "implacable" },
  { nom: "Le Lapin de Jade", emplacement: "cinetique", champion: "implacable" },
  { nom: "L'opportun", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "R\xE8gne de Suros", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Cerberus+1", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Tueur de Souhaits", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Malveillance", emplacement: "cinetique", champion: "implacable" },
  { nom: "As de Pique", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "La Gouvernante", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Fardeau d'Izanagi", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Derni\xE8res paroles", emplacement: "cinetique", champion: "implacable" },
  { nom: "Arbal\xE8te", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Chardon", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Infection parfaite", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Lumina", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Poup\xE9e vaudou", emplacement: "cinetique", champion: "implacable" },
  { nom: "Monte-Carlo", emplacement: "cinetique", champion: "implacable" },
  { nom: "Bastion", emplacement: "cinetique", champion: "implacable" },
  { nom: "Tr\xE9sor ass\xE9ch\xE9", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Elu du Voyageur", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Rapace noir", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Trop long \xE0 expliquer", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "R\xE9cit d'un homme mort", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Cryosth\xE9sie 77k", emplacement: "cinetique", champion: "implacable" },
  { nom: "Sceptre d'Ager", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Pr\xE9d\xE9cesseur", emplacement: "cinetique", champion: "implacable" },
  { nom: "Osteo Striga", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Once de m\xE9chancet\xE9", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Temp\xEAte de vif-argent", emplacement: "cinetique", champion: "implacable" },
  { nom: "R\xE9vision z\xE9ro", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Dernier avertissement", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Finalit\xE9 conditionnelle", emplacement: "cinetique", champion: "implacable" },
  { nom: "Courbe verglac\xE9e", emplacement: "cinetique", champion: "implacable" },
  { nom: "Outil de folie", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Le Navigateur", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Gouffre n\xE9crotique", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Garde-souhaits", emplacement: "cinetique", champion: "implacable" },
  { nom: "Khvostov 7G-0X", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Euphonie", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Al\xE9thonyme", emplacement: "cinetique", champion: "implacable" },
  { nom: "Neo Finis Terr\xE6", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Tumulus dyadique", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Nouveau Malpais", emplacement: "cinetique", champion: "implacable" },
  { nom: "Lame praxique", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Ombre de Cull", emplacement: "cinetique", champion: "implacable" },
  { nom: "C\u0153ur de glace", emplacement: "energie", champion: "bloqueur" },
  { nom: "Impitoyable", emplacement: "energie", champion: "implacable" },
  { nom: "Lion de guerre", emplacement: "energie", champion: "implacable" },
  { nom: "Rayon de soleil", emplacement: "energie", champion: "implacable" },
  { nom: "Lance du graviton", emplacement: "energie", champion: "bloqueur" },
  { nom: "Serment des Embraseurs", emplacement: "energie", champion: "bloqueur" },
  { nom: "Borealis", emplacement: "energie", champion: "bloqueur" },
  { nom: "Casse-cou", emplacement: "energie", champion: "surcharge" },
  { nom: "Ombres et lumi\xE8re", emplacement: "energie", champion: "surcharge" },
  { nom: "Cristal de Prom\xE9th\xE9e", emplacement: "energie", champion: "surcharge" },
  { nom: "T\xE9lesto", emplacement: "energie", champion: "surcharge" },
  { nom: "Lance de Polaris", emplacement: "energie", champion: "bloqueur" },
  { nom: "Goule trinitaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Diviseur d'ondes", emplacement: "energie", champion: "surcharge" },
  { nom: "Seigneur des Loups", emplacement: "energie", champion: "implacable" },
  { nom: "Le Monarque", emplacement: "energie", champion: "surcharge" },
  { nom: "J\xF6tunn", emplacement: "energie", champion: "implacable" },
  { nom: "Tarrabah", emplacement: "energie", champion: "bloqueur" },
  { nom: "Serment d'\xC9riana", emplacement: "energie", champion: "bloqueur" },
  { nom: "Divinit\xE9", emplacement: "energie", champion: "surcharge" },
  { nom: "Sym\xE9trie", emplacement: "energie", champion: "surcharge" },
  { nom: "Ruines du Diable", emplacement: "energie", champion: "implacable" },
  { nom: "Pochette d'allumettes de Tommy", emplacement: "energie", champion: "surcharge" },
  { nom: "Le Quatri\xE8me Cavalier", emplacement: "energie", champion: "implacable" },
  { nom: "Effigie d\xE9sastreuse", emplacement: "energie", champion: "implacable" },
  { nom: "Dualit\xE9", emplacement: "energie", champion: "implacable" },
  { nom: "Frappe nuageuse", emplacement: "energie", champion: "bloqueur" },
  { nom: "Divination de Ticuu", emplacement: "energie", champion: "implacable" },
  { nom: "Ex\xE9g\xE8se du Vex", emplacement: "energie", champion: "bloqueur" },
  { nom: "Impulsion Lorentz", emplacement: "energie", champion: "bloqueur" },
  { nom: "Lame de comp\xE9tition", emplacement: "energie", champion: "surcharge" },
  { nom: "Lame d'action", emplacement: "energie", champion: "bloqueur" },
  { nom: "Lame d'intention", emplacement: "energie", champion: "implacable" },
  { nom: "Messager mort", emplacement: "energie", champion: "implacable" },
  { nom: "Obligation collective", emplacement: "energie", champion: "bloqueur" },
  { nom: "Tombe d\xE9licate", emplacement: "energie", champion: "surcharge" },
  { nom: "L'Intrus", emplacement: "energie", champion: "bloqueur" },
  { nom: "La Manticore", emplacement: "energie", champion: "surcharge" },
  { nom: "Hi\xE9rarchie des besoins", emplacement: "energie", champion: "implacable" },
  { nom: "Vexcalibur", emplacement: "energie", champion: "surcharge" },
  { nom: "Dallage", emplacement: "energie", champion: "implacable" },
  { nom: "Centrifuse", emplacement: "energie", champion: "surcharge" },
  { nom: "Ex Diris", emplacement: "energie", champion: "implacable" },
  { nom: "Chorale solitaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Lign\xE9e enterr\xE9e", emplacement: "energie", champion: "bloqueur" },
  { nom: "Mort rouge reform\xE9e", emplacement: "energie", champion: "implacable" },
  { nom: "Chasse \xE0 l'aff\xFBt", emplacement: "energie", champion: "bloqueur" },
  { nom: "Ergo Sum solaire", emplacement: "energie", champion: null },
  { nom: "Ergo Sum abyssale", emplacement: "energie", champion: null },
  { nom: "Ergo Sum cryo-\xE9lectrique", emplacement: "energie", champion: null },
  { nom: "Brise-glace", emplacement: "energie", champion: "bloqueur" },
  { nom: "Croc du Bourreau", emplacement: "energie", champion: "surcharge" },
  { nom: "Guide stellaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Troisi\xE8me it\xE9ration", emplacement: "energie", champion: "bloqueur" },
  { nom: "Pique du graviton", emplacement: "energie", champion: "surcharge" },
  { nom: "Hoirie", emplacement: "energie", champion: "implacable" },
  { nom: "Girouette", emplacement: "energie", champion: "bloqueur" },
  { nom: "Le Prospecteur", emplacement: "lourde", champion: "implacable" },
  { nom: "Bobine de Wardcliff", emplacement: "lourde", champion: "implacable" },
  { nom: "Canon tracteur", emplacement: "lourde", champion: "surcharge" },
  { nom: "L\xE9gende d'Acrius", emplacement: "lourde", champion: "surcharge" },
  { nom: "D.A.R.C.I.", emplacement: "lourde", champion: "surcharge" },
  { nom: "La Colonie", emplacement: "lourde", champion: "surcharge" },
  { nom: "Ligne d'univers z\xE9ro", emplacement: "lourde", champion: "implacable" },
  { nom: "Image de l'Esprit dormant", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Murmure du Ver", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Mille voix", emplacement: "lourde", champion: "implacable" },
  { nom: "Renard \xE0 deux queues", emplacement: "lourde", champion: "surcharge" },
  { nom: "Griffe noire", emplacement: "lourde", champion: "surcharge" },
  { nom: "Le Parjure", emplacement: "lourde", champion: "implacable" },
  { nom: "Maitre du tonnerre", emplacement: "lourde", champion: "surcharge" },
  { nom: "Anarchie", emplacement: "lourde", champion: "surcharge" },
  { nom: "V\xE9rit\xE9", emplacement: "lourde", champion: "implacable" },
  { nom: "Souffle du L\xE9viathan", emplacement: "lourde", champion: "implacable" },
  { nom: "X\xE9nophage", emplacement: "lourde", champion: "implacable" },
  { nom: "La Faucheuse", emplacement: "lourde", champion: "surcharge" },
  { nom: "H\xE9ritage \xE9vident", emplacement: "lourde", champion: "surcharge" },
  { nom: "Poigne du Salut", emplacement: "lourde", champion: "implacable" },
  { nom: "Regard du lendemain", emplacement: "lourde", champion: "implacable" },
  { nom: "Lamentation", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Gjallarhorn", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Parasite", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Grande ouverture", emplacement: "lourde", champion: "implacable" },
  { nom: "Cardiombre", emplacement: "lourde", champion: "surcharge" },
  { nom: "Chaos d\xE9terministe", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Morsure hivernale", emplacement: "lourde", champion: "implacable" },
  { nom: "Souffle du dragon", emplacement: "lourde", champion: "implacable" },
  { nom: "Microcosme", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Foreuse finale", emplacement: "lourde", champion: "implacable" },
  { nom: "Ovation tourbillonnante", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Aconit", emplacement: "lourde", champion: "implacable" },
  { nom: "Service de Luzaku", emplacement: "lourde", champion: "surcharge" },
  { nom: "Fafnir", emplacement: "lourde", champion: "implacable" }
];

// src/lib/manifest/antiChampionExotiques.ts
function normaliserNomArme(nom) {
  return nom.replace(/œ/gi, "oe").replace(/æ/gi, "ae").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’'`´]/g, "'").replace(/[^a-z0-9'+.]+/g, " ").trim();
}
var ELEMENTS_VARIANTES = ["cryo electrique", "electrique", "solaire", "abyssale", "abyssal", "stase", "cryo", "vide", "arc", "filaments"];
function construireTable() {
  const table = /* @__PURE__ */ new Map();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) table.set(normaliserNomArme(e.nom), e.champion);
  const variantes = /* @__PURE__ */ new Map();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) {
    const nom = normaliserNomArme(e.nom);
    const suffixe = ELEMENTS_VARIANTES.find((el) => nom.endsWith(" " + el));
    if (!suffixe) continue;
    const base = nom.slice(0, nom.length - suffixe.length - 1).trim();
    if (base) variantes.set(base, [...variantes.get(base) ?? [], e.champion]);
  }
  for (const [base, valeurs] of variantes) {
    if (valeurs.length >= 2 && valeurs.every((v) => v === valeurs[0]) && !table.has(base)) table.set(base, valeurs[0]);
  }
  return table;
}
var TABLE = construireTable();

// src/lib/manifest/doctrine.ts
var MOTS_CONDITION_DEBLOCAGE = [
  "debloquer cette amelioration",
  "unlock this upgrade",
  // FR : ⚠️ AJOUT (04/08/2026) - texte GÉNÉRIQUE de la Pièce maîtresse
  // ("Améliore cette arme en Pièce maîtresse..."), commun à toutes les
  // armes, confirmé par capture d'écran (souligné en bleu par
  // l'utilisateur sur "Le Chardon").
  // EN: ⚠️ ADDED (2026-08-04) - GENERIC masterwork text ("Upgrades this
  // weapon into a Masterwork..."), common to all weapons, confirmed by
  // screenshot (underlined in blue by the user on "The Thorn").
  "ameliore cette arme en piece maitresse",
  "upgrades this weapon into a masterwork",
  "beneficiera alors de capacites ameliorees",
  "will benefit from enhanced capabilities"
];
function retirerConditionsDeblocage(texte) {
  if (!texte) return texte;
  return texte.split(/(?<=[.!?])\s+/).filter((phrase) => !MOTS_CONDITION_DEBLOCAGE.some((m) => normaliser(phrase).includes(m))).join(" ").trim();
}
function obtenirDescriptionComplete(db, hash) {
  const defOption = obtenirDefinition(db, "DestinyInventoryItemDefinition", hash);
  if (!defOption?.displayProperties) return { description: "", estOrnement: false };
  const morceaux = [];
  if (defOption.displayProperties.description) morceaux.push(defOption.displayProperties.description);
  if (defOption.perks) {
    for (const perk of defOption.perks) {
      const defPerk = obtenirDefinition(db, "DestinySandboxPerkDefinition", perk.perkHash);
      const texte = defPerk?.displayProperties?.description;
      if (texte && !morceaux.includes(texte)) morceaux.push(texte);
    }
  }
  const texteBrut = morceaux.join(" ");
  const nomNormalise = normaliser(defOption.displayProperties.name ?? "");
  const estOrnement = normaliser(texteBrut).includes("ornement d'arme") || normaliser(texteBrut).includes("weapon ornament") || nomNormalise.includes("ornement d'origine") || nomNormalise.includes("origin ornament");
  const description = retirerConditionsDeblocage(texteBrut);
  return { description, estOrnement };
}
var INDEX_SETS = /* @__PURE__ */ new WeakMap();
function construireIndexSets(db) {
  const index = /* @__PURE__ */ new Map();
  try {
    const stmt = db.prepare("SELECT json FROM DestinyEquipableItemSetDefinition");
    while (stmt.step()) {
      const set = JSON.parse(String(stmt.getAsObject().json));
      if (!set.setItems?.length) continue;
      const perks = (set.setPerks ?? []).map((p) => {
        const defPerk = obtenirDefinition(
          db,
          "DestinySandboxPerkDefinition",
          p.sandboxPerkHash
        );
        return {
          requiredSetCount: p.requiredSetCount,
          nom: defPerk?.displayProperties?.name ?? "?",
          description: defPerk?.displayProperties?.description ?? "",
          icone: urlIcone(defPerk?.displayProperties?.icon)
        };
      }).sort((a, b) => a.requiredSetCount - b.requiredSetCount);
      const bonus = { nomSet: set.displayProperties?.name ?? "?", perks };
      for (const hash of set.setItems) index.set(hash, bonus);
    }
    stmt.free();
  } catch {
  }
  return index;
}
function obtenirBonusSet(db, itemHash) {
  let index = INDEX_SETS.get(db);
  if (!index) {
    index = construireIndexSets(db);
    INDEX_SETS.set(db, index);
  }
  return index.get(itemHash);
}

// src/lib/scoring/armorSets.ts
function obtenirBonusSetsActifs(armure, db) {
  const parSet = /* @__PURE__ */ new Map();
  for (const piece of armure) {
    const set = obtenirBonusSet(db, piece.itemHash);
    if (!set) continue;
    const entree = parSet.get(set.nomSet) ?? { count: 0, perks: set.perks };
    entree.count += 1;
    parSet.set(set.nomSet, entree);
  }
  const actifs = [];
  for (const [nomSet, { count, perks }] of parSet) {
    for (const p of perks) {
      if (p.requiredSetCount <= count) {
        actifs.push({ nomSet, nbPieces: count, nom: p.nom, description: p.description, requiredSetCount: p.requiredSetCount });
      }
    }
  }
  return actifs;
}

// src/lib/scoring/verbes.ts
function calculerConfiance(aSourceEffectif, aPayoff, aIndetermine) {
  if (!aSourceEffectif && !aPayoff && !aIndetermine) return "absent";
  if (aSourceEffectif && aPayoff) return "boucle";
  if (aSourceEffectif) return "source_seule";
  if (aPayoff) return "payoff_orphelin";
  return "indetermine";
}
function detecterVerbes(textes2, catalogue = CATALOGUE_VERBES, textesSimules) {
  const textesNormalises = textes2.map(normaliser);
  return catalogue.map((verbe) => {
    const motsCles = [...verbe.motsClesFr, ...verbe.motsClesEn];
    const motsClesNormalises = motsCles.map(normaliser);
    const motsClesStricts = [...verbe.motsClesStrictsFr ?? [], ...verbe.motsClesStrictsEn ?? []];
    const motsClesStrictsNormalises = motsClesStricts.map(normaliser);
    const indexTextesCorrespondants = textesNormalises.map(
      (t, i) => motsClesNormalises.some((m) => t.includes(m)) || motsClesStrictsNormalises.some((m) => positionsMotCleStrict(t, m).length > 0) ? i : -1
    ).filter((i) => i >= 0);
    const nbMentions = indexTextesCorrespondants.length;
    const sources = [
      ...new Set(
        indexTextesCorrespondants.map((i) => textes2[i].split(" \u2014 ")[0]?.trim()).filter((nom) => !!nom)
      )
    ];
    const sourcesSimulees = [
      ...new Set(
        indexTextesCorrespondants.filter((i) => textesSimules?.[i] === true).map((i) => textes2[i].split(" \u2014 ")[0]?.trim()).filter((nom) => !!nom)
      )
    ];
    let aSource = false;
    let aPayoff = false;
    let aIndetermine = false;
    for (const i of indexTextesCorrespondants) {
      const roles = analyserTexte(textes2[i], motsCles, motsClesStricts);
      aSource = aSource || roles.source;
      aPayoff = aPayoff || roles.payoff;
      aIndetermine = aIndetermine || roles.indetermine;
    }
    if (verbe.sourceImplicite && nbMentions > 0) {
      aSource = true;
    }
    if (verbe.sourcesForcees?.some((cond) => conditionVerifiee(normaliser(cond), textesNormalises))) {
      aSource = true;
    }
    const confiance = calculerConfiance(aSource, aPayoff, aIndetermine);
    return { verbe, nbMentions, aSource, aPayoff, aIndetermine, sources, sourcesSimulees, confiance };
  });
}
function extraireTextesDoctrineBuild(build, db) {
  const textes2 = [];
  function ajouterDepuisHash(hash, table) {
    if (!hash) return;
    const def = obtenirDefinition(db, table, hash);
    const nom = def?.displayProperties?.name;
    if (!nom) return;
    const { description } = obtenirDescriptionComplete(db, hash);
    const texte = [nom, description].filter(Boolean).join(" \u2014 ");
    if (texte) textes2.push(texte);
  }
  ajouterDepuisHash(build.subclass.superHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build.subclass.meleeHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build.subclass.grenadeHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build.subclass.classeHash, "DestinyInventoryItemDefinition");
  for (const h of build.subclass.aspectHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition");
  for (const h of build.subclass.fragmentHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition");
  return textes2;
}
function extraireTextesEffetsBuild(build, db) {
  return extraireTextesEffetsBuildMarques(build, db).map((t) => t.texte);
}
function extraireTextesEffetsBuildMarques(build, db) {
  const textesMarques = extraireTextesDoctrineBuild(build, db).map((texte) => ({ texte, simule: false }));
  const textes2 = textesMarques;
  function ajouterDepuisHash(hash, table, simule = false) {
    if (!hash) return;
    const def = obtenirDefinition(db, table, hash);
    const nom = def?.displayProperties?.name;
    if (!nom) return;
    const { description } = obtenirDescriptionComplete(db, hash);
    const texte = [nom, description].filter(Boolean).join(" \u2014 ");
    if (texte) textes2.push({ texte, simule });
  }
  for (const piece of [...build.armes, ...build.armure]) {
    const simule = piece.perksSimules === true;
    for (const h of piece.perkHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition", simule);
  }
  for (const cle of build.artifact.perkCles ?? []) {
    const [idArtefact, tier, ...resteNom] = cle.split(":");
    const nomPerk = resteNom.join(":");
    const artefact = ARTEFACTS.find((a) => a.id === idArtefact);
    const perk = artefact?.perksParTier[Number(tier)]?.find((p) => p.nom === nomPerk);
    if (perk) textes2.push({ texte: `${perk.nom} \u2014 ${perk.description}`, simule: false });
  }
  for (const bonus of obtenirBonusSetsActifs(build.armure, db)) {
    textes2.push({ texte: `${bonus.nom} \u2014 ${bonus.description}`, simule: false });
  }
  return textes2;
}
function scoreVerbesDetectes(verbesDetectes2, nomsSimules) {
  const details = [];
  const detailsMarques = [];
  const pousse = (texte, simule = false) => {
    details.push(texte);
    detailsMarques.push({ texte, simule });
  };
  const boucles = verbesDetectes2.filter((v) => v.confiance === "boucle");
  const sourcesSeules = verbesDetectes2.filter((v) => v.confiance === "source_seule");
  const orphelins = verbesDetectes2.filter((v) => v.confiance === "payoff_orphelin");
  const indetermines = verbesDetectes2.filter((v) => v.confiance === "indetermine");
  if (boucles.length + sourcesSeules.length + orphelins.length + indetermines.length === 0) {
    return {
      score: 20,
      details: ["Aucun verbe d'\xE9l\xE9ment d\xE9tect\xE9 dans les aspects/fragments/perks du build"],
      detailsMarques: [{ texte: "Aucun verbe d'\xE9l\xE9ment d\xE9tect\xE9 dans les aspects/fragments/perks du build", simule: false }]
    };
  }
  function ajouterGroupe(icone, commentaire, verbes) {
    if (verbes.length === 0) return;
    pousse(`${icone} ${commentaire}`);
    for (const v of verbes) {
      const sourcesUtiles = v.sources.filter(
        (s) => normaliser(s) !== normaliser(v.verbe.nomFr) && normaliser(s) !== normaliser(v.verbe.nomEn)
      );
      const simule = v.sourcesSimulees.length > 0 && v.sources.length === v.sourcesSimulees.length;
      const marque = (s) => nomsSimules?.has(s) ? `${s}${MARQUE_SIMULE}` : s;
      const origineCacheeSimulee = v.sources.some((s) => !sourcesUtiles.includes(s) && nomsSimules?.has(s));
      const suffixe = sourcesUtiles.length > 0 ? ` (${sourcesUtiles.map(marque).join(", ")})` : "";
      const texteLigne = `  ${v.verbe.nomFr}${origineCacheeSimulee ? MARQUE_SIMULE : ""}${suffixe}${simule ? " \xB7 \u{1F528} simul\xE9" : ""}`;
      pousse(texteLigne, simule);
    }
  }
  ajouterGroupe("\u2705", "Boucle compl\xE8te \u2014 le build applique ces effets ET en profite :", boucles);
  ajouterGroupe("\u2139\uFE0F", "Appliqu\xE9s, mais rien dans le build n'en profite :", sourcesSeules);
  ajouterGroupe(
    "\u26A0\uFE0F",
    "Quelque chose les exploite alors que RIEN ne les applique \u2014 ces perks ne se d\xE9clencheront jamais :",
    orphelins
  );
  ajouterGroupe(
    "\u2753",
    "Pr\xE9sents dans le build, mais l'analyse de texte n'a pas su dire s'ils sont appliqu\xE9s ou exploit\xE9s (limite de la d\xE9tection, pas du build) :",
    indetermines
  );
  const score = Math.max(
    0,
    Math.min(100, boucles.length * 35 + sourcesSeules.length * 12 + indetermines.length * 18 + orphelins.length * 6)
  );
  return { score, details, detailsMarques };
}
function detecterChainesVerbes(verbesDetectes2, textes2) {
  const parId = /* @__PURE__ */ new Map();
  for (const v of verbesDetectes2) parId.set(v.verbe.id, v);
  const textesNormalises = textes2.map(normaliser);
  const maillons2 = [];
  const dejaAtteints = /* @__PURE__ */ new Set();
  const file = [];
  for (const v of verbesDetectes2) {
    if (v.aSource) {
      dejaAtteints.add(v.verbe.id);
      file.push(v.verbe.id);
    }
  }
  while (file.length > 0) {
    const idActuel = file.shift();
    const verbeActuel = parId.get(idActuel);
    if (!verbeActuel?.verbe.produit) continue;
    for (const lien of verbeActuel.verbe.produit) {
      const cibleDetectee = parId.get(lien.verbeId);
      if (!cibleDetectee) continue;
      let actif = true;
      if (lien.conditionnel) {
        actif = conditionVerifiee(normaliser(lien.conditionnel), textesNormalises);
      }
      if (!actif) continue;
      maillons2.push({ source: verbeActuel.verbe, cible: cibleDetectee.verbe, etaitConditionnel: !!lien.conditionnel });
      if (!dejaAtteints.has(lien.verbeId)) {
        dejaAtteints.add(lien.verbeId);
        file.push(lien.verbeId);
      }
    }
  }
  return maillons2;
}
var MOTS_OUTILS = /* @__PURE__ */ new Set([
  "a",
  "au",
  "aux",
  "avec",
  "ce",
  "ces",
  "cette",
  "d",
  "dans",
  "de",
  "des",
  "du",
  "en",
  "et",
  "est",
  "il",
  "l",
  "la",
  "le",
  "les",
  "leur",
  "lors",
  "lorsque",
  "ou",
  "par",
  "pour",
  "que",
  "qui",
  "quand",
  "sa",
  "se",
  "ses",
  "son",
  "sur",
  "un",
  "une",
  "vos",
  "votre",
  "vous",
  "y",
  "the",
  "of",
  "to",
  "and",
  "or",
  "a",
  "an",
  "in",
  "on",
  "for",
  "with",
  "your",
  "you",
  "that",
  "this",
  "these",
  "is",
  "are",
  "when",
  "while"
]);
function conditionVerifiee(conditionNormalisee, textesNormalises) {
  const motsSignificatifs = conditionNormalisee.split(/[^a-z0-9]+/).filter((m) => m.length > 2 && !MOTS_OUTILS.has(m));
  if (motsSignificatifs.length === 0) {
    return textesNormalises.some((t) => t.includes(conditionNormalisee));
  }
  return textesNormalises.some((t) => motsSignificatifs.every((m) => t.includes(m)));
}
function enrichirAvecChaines(verbesDetectes2, maillons2) {
  const idsAtteintsParChaine = new Set(maillons2.map((m) => m.cible.id));
  return verbesDetectes2.map((v) => {
    if (v.aSource || !idsAtteintsParChaine.has(v.verbe.id)) return v;
    const aSourceEffectif = true;
    const confiance = calculerConfiance(aSourceEffectif, v.aPayoff, v.aIndetermine);
    return { ...v, confiance };
  });
}
function detecterRessourcesGenerees(verbesDetectes2, maillons2, textes2) {
  const idsAtteints = /* @__PURE__ */ new Set();
  for (const v of verbesDetectes2) {
    if (v.aSource) idsAtteints.add(v.verbe.id);
  }
  for (const m of maillons2) {
    idsAtteints.add(m.cible.id);
  }
  const parId = /* @__PURE__ */ new Map();
  for (const v of verbesDetectes2) parId.set(v.verbe.id, v.verbe);
  const textesNormalises = textes2.map(normaliser);
  const resultat = [];
  for (const id of idsAtteints) {
    const verbe = parId.get(id);
    if (!verbe?.ressourceGeneree) continue;
    for (const entree of verbe.ressourceGeneree) {
      if (entree.conditionnel) {
        if (!conditionVerifiee(normaliser(entree.conditionnel), textesNormalises)) continue;
      }
      resultat.push({ type: entree.type, verbe });
    }
  }
  return resultat;
}

// scripts/fixtures-corps.mjs
var dbFr = fausseDB("fr");
var dbEn = fausseDB("en");
console.log("=== obtenirDefinition (hash 1, FR) ===");
console.log(obtenirDefinition(dbFr, "DestinyInventoryItemDefinition", 1));
console.log("\n=== rechercherDansManifest FR : 'd\xE9voration' ===");
console.log(rechercherDansManifest(dbFr, "devoration", "plein_texte"));
console.log("\n=== rechercherBilingue : 'devour' (EN uniquement) ===");
console.log(rechercherBilingue(dbFr, dbEn, "devour", "plein_texte"));
console.log("\n=== extraireTextesEffetsBuild + detecterVerbes (build fictif) ===");
var buildFictif = {
  id: "test",
  nom: "Test",
  subclass: { classe: "arcaniste", element: "abyssal", superHash: 0, aspectHashes: [2], fragmentHashes: [3] },
  artifact: { artifactHash: 0, perkHashes: [100] },
  armes: [],
  armure: []
};
var textes = extraireTextesEffetsBuild(buildFictif, dbFr);
console.log("Textes extraits :", textes);
var verbesDetectes = detecterVerbes(textes);
console.log("Verbes d\xE9tect\xE9s :", verbesDetectes.filter((v) => v.confiance !== "absent"));
console.log("\n=== detecterChainesVerbes (build avec Ralentissement) ===");
var buildAvecRalentissement = {
  ...buildFictif,
  subclass: { ...buildFictif.subclass, fragmentHashes: [3, 4] }
};
var textesChaine = extraireTextesEffetsBuild(buildAvecRalentissement, dbFr);
var verbesChaine = detecterVerbes(textesChaine);
var maillons = detecterChainesVerbes(verbesChaine, textesChaine);
console.log("Maillons d\xE9tect\xE9s :", maillons.map((m) => `${m.source.nomFr} -> ${m.cible.nomFr}`));
console.log("Attendu : Ralentissement -> Gel, ET Gel -> Brisure (ricochet \xE0 2 sauts)");
console.log("\n=== detecterRessourcesGenerees (m\xEAme build : D\xE9voration -> grenade) ===");
var ressources = detecterRessourcesGenerees(verbesChaine, maillons, textesChaine);
console.log("Ressources d\xE9tect\xE9es :", ressources.map((r) => `${r.type} (${r.verbe.nomFr})`));
console.log("\n=== AVANT enrichirAvecChaines (correction 26/08) ===");
var confianceAvant = verbesChaine.filter((v) => v.verbe.id === "gel" || v.verbe.id === "brisure").map((v) => `${v.verbe.nomFr} : ${v.confiance}`);
console.log("Confiance Gel/Brisure :", confianceAvant);
console.log('Attendu : les deux "absent" (aucune trace textuelle, ricochet non pris en compte)');
var { score: scoreAvant } = scoreVerbesDetectes(verbesChaine);
console.log("Score AVANT enrichissement :", scoreAvant);
console.log("\n=== APR\xC8S enrichirAvecChaines (correction 26/08) ===");
var verbesEnrichis = enrichirAvecChaines(verbesChaine, maillons);
var confianceApres = verbesEnrichis.filter((v) => v.verbe.id === "gel" || v.verbe.id === "brisure").map((v) => `${v.verbe.nomFr} : ${v.confiance}`);
console.log("Confiance Gel/Brisure :", confianceApres);
console.log('Attendu : les deux "source_seule" (reconnus comme produits par ricochet, rien ne les exploite ici)');
var { score: scoreApres } = scoreVerbesDetectes(verbesEnrichis);
console.log("Score APR\xC8S enrichissement :", scoreApres);
console.log(`Diff\xE9rence : +${scoreApres - scoreAvant} pts (2 verbes absent->source_seule, +12 pts chacun)`);

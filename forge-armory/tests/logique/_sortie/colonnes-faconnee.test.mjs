import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

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
var cacheDefinitionsParDb = /* @__PURE__ */ new WeakMap();
function obtenirDefinition(db2, nomTable, hash) {
  let cache = cacheDefinitionsParDb.get(db2);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    cacheDefinitionsParDb.set(db2, cache);
  }
  const cle = `${nomTable}:${hash}`;
  if (cache.has(cle)) return cache.get(cle);
  const stmt = db2.prepare(`SELECT json FROM ${nomTable} WHERE id = ? LIMIT 1`);
  stmt.bind([hashVersIdSqlite(hash)]);
  const trouve = stmt.step();
  const resultat = trouve ? JSON.parse(stmt.getAsObject().json) : void 0;
  stmt.free();
  cache.set(cle, resultat);
  return resultat;
}

// src/lib/manifest/search.ts
function urlIcone(cheminIcone) {
  return cheminIcone ? `https://www.bungie.net${cheminIcone}` : void 0;
}
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
function obtenirDescriptionComplete(db2, hash) {
  const defOption = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash);
  if (!defOption?.displayProperties) return { description: "", estOrnement: false };
  const morceaux = [];
  if (defOption.displayProperties.description) morceaux.push(defOption.displayProperties.description);
  if (defOption.perks) {
    for (const perk of defOption.perks) {
      const defPerk = obtenirDefinition(db2, "DestinySandboxPerkDefinition", perk.perkHash);
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
var MOTS_MOD_CONNU = ["crosse de contrepoids", "reglage de radar", "poignee de sprint"];
var MOTS_OPTION_COSMETIQUE = ["palier", "compte-frags", "compte frags", "souvenir", "suivi", "memento:"];
function obtenirOptionsToutesColonnes(db2, itemHash, hashesEquipes2 = [], reglages = {}) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.sockets?.socketEntries) return [];
  const nomCategorieParSocket = /* @__PURE__ */ new Map();
  for (const cat of def.sockets.socketCategories ?? []) {
    const catDef = obtenirDefinition(db2, "DestinySocketCategoryDefinition", cat.socketCategoryHash);
    const nom = normaliser(catDef?.displayProperties?.name ?? "");
    for (const idx of cat.socketIndexes) nomCategorieParSocket.set(idx, nom);
  }
  const colonnes = [];
  def.sockets.socketEntries.forEach((entree, socketIndex) => {
    let hashesOptions = (entree.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    if (hashesOptions.length === 0 && entree.reusablePlugSetHash) {
      const plugSet = obtenirDefinition(db2, "DestinyPlugSetDefinition", entree.reusablePlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    if (hashesOptions.length === 0 && entree.randomizedPlugSetHash) {
      const plugSet = obtenirDefinition(db2, "DestinyPlugSetDefinition", entree.randomizedPlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    if (hashesOptions.length === 0 && entree.singleInitialItemHash) {
      hashesOptions = [entree.singleInitialItemHash];
    }
    if (reglages.toutesSources) {
      const fusion = [];
      const ajouter = (hs) => {
        for (const h of hs) if (!fusion.includes(h)) fusion.push(h);
      };
      const pool = (hashJeu) => (obtenirDefinition(db2, "DestinyPlugSetDefinition", hashJeu)?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      ajouter((entree.reusablePlugItems ?? []).map((p) => p.plugItemHash));
      if (entree.reusablePlugSetHash) ajouter(pool(entree.reusablePlugSetHash));
      if (entree.randomizedPlugSetHash) ajouter(pool(entree.randomizedPlugSetHash));
      if (entree.singleInitialItemHash) ajouter([entree.singleInitialItemHash]);
      if (fusion.length > 0) hashesOptions = fusion;
    }
    if (hashesOptions.length === 0) return;
    const options = [];
    for (const hashOption of hashesOptions) {
      const defOption = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hashOption);
      if (!defOption?.displayProperties?.name) continue;
      const resolu = obtenirDescriptionComplete(db2, hashOption);
      if (resolu.estOrnement) continue;
      const description = resolu.description;
      options.push({
        hash: hashOption,
        nom: defOption.displayProperties.name,
        description,
        icone: urlIcone(defOption.displayProperties.icon),
        equipeEnJeu: hashesEquipes2.includes(hashOption)
      });
    }
    for (const eq2 of reglages.equipesParColonne ?? []) {
      if (eq2.socketIndex !== socketIndex || options.some((o) => o.hash === eq2.hash)) continue;
      const defEq = obtenirDefinition(db2, "DestinyInventoryItemDefinition", eq2.hash);
      if (!defEq?.displayProperties?.name) continue;
      const resoluEq = obtenirDescriptionComplete(db2, eq2.hash);
      if (resoluEq.estOrnement) continue;
      options.push({ hash: eq2.hash, nom: defEq.displayProperties.name, description: resoluEq.description, icone: urlIcone(defEq.displayProperties.icon), equipeEnJeu: true });
    }
    const toutesCosmetiques = options.length > 0 && options.some((opt) => {
      const texte = `${normaliser(opt.nom)} ${normaliser(opt.description)}`;
      return MOTS_OPTION_COSMETIQUE.some((m) => texte.includes(m)) || texte.includes("effet visuel festif");
    });
    const estOrnement = options.some((opt) => {
      const d = normaliser(opt.description);
      return d.includes("ornement d'arme") || d.includes("weapon ornament");
    });
    if (options.length === 0) return;
    if (toutesCosmetiques || estOrnement) {
      if (reglages.inclureMasquees) colonnes.push({ socketIndex, options, estModConnu: false, masquee: estOrnement ? "ornement" : "cosmetique" });
      return;
    }
    const estModConnu = options.some((opt) => MOTS_MOD_CONNU.some((m) => normaliser(opt.nom).includes(m)));
    colonnes.push({ socketIndex, options, estModConnu });
  });
  return colonnes;
}

// tests/logique/fixtures/fauxManifest.ts
var T_OBJET = "DestinyInventoryItemDefinition";
var T_PLUGSET = "DestinyPlugSetDefinition";
var T_CATEGORIE = "DestinySocketCategoryDefinition";
var T_RARETE = "DestinyItemTierTypeDefinition";
var HASH_EXOTIQUE = 2759499571;
var HASH_LEGENDAIRE = 4008398120;
var BUCKET = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };
function creerFausseDb(defs2, options = {}) {
  const requetes = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes.push(sql);
      const m = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m?.[1] ?? "", where = m?.[2] ?? "";
      const lignes = Object.entries(defs2[table] ?? {}).map(([h, d]) => ({ id: hashVersIdSqlite(+h), json: JSON.stringify(d) }));
      let choisies = lignes, courant = -1;
      return {
        bind: (a) => {
          if (/id\s*=\s*\?/.test(where)) choisies = lignes.filter((l) => l.id === a[0]);
        },
        step: () => {
          if (courant === -1) {
            const like = /LIKE\s+'(.*)'/.exec(where);
            if (like) {
              const coeur = like[1].replace(/^%|%$/g, "");
              choisies = lignes.filter((l) => l.json.includes(coeur));
            }
          }
          if (options.ralentirBalayage && /LIKE/.test(where)) {
            const t = Date.now();
            while (Date.now() - t < options.ralentirBalayage) {
            }
          }
          courant++;
          return courant < choisies.length;
        },
        getAsObject: () => ({ id: choisies[courant].id, json: choisies[courant].json }),
        free: () => {
        }
      };
    }
  };
  return { db: db2, requetes };
}
var plug = (nom, description = "", extra = {}) => ({ displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description }, ...extra });
var arme = (nom, o) => ({
  displayProperties: { name: nom, icon: `/icons/${nom.replace(/\W+/g, "-")}.png`, description: "" },
  itemType: 3,
  itemTypeDisplayName: o.type,
  defaultDamageType: o.degats,
  inventory: { bucketTypeHash: o.bucket, tierTypeHash: o.tier },
  equippingBlock: { ammoType: o.bucket === BUCKET.lourde ? 3 : 1 },
  ...o.collectible ? { collectibleHash: o.collectible } : {},
  sockets: { socketEntries: o.sockets, socketCategories: o.categories ?? [] },
  ...o.extra ?? {}
});
function ajouterArmeRevisionAPaliers(defs2) {
  const objets = defs2[T_OBJET], jeux = defs2[T_PLUGSET];
  const p = (nom, type, plugCat, description = "") => plug(nom, description, { itemTypeDisplayName: type, plug: { plugCategoryIdentifier: plugCat } });
  objets[6901] = p("Canon X", "Canon", "barrels", "Un canon X.");
  objets[6902] = p("Canon X", "Canon am\xE9lior\xE9", "barrels", "Un canon X, version am\xE9lior\xE9e.");
  objets[6903] = p("Canon Y", "Canon", "barrels", "Un canon Y.");
  objets[6904] = p("Canon Y", "Canon am\xE9lior\xE9", "barrels", "Un canon Y, version am\xE9lior\xE9e.");
  objets[6911] = p("Chargeur X", "Chargeur", "magazines", "Un chargeur X.");
  objets[6912] = p("Chargeur X", "Chargeur am\xE9lior\xE9", "magazines", "Un chargeur X, version am\xE9lior\xE9e.");
  objets[6913] = p("Chargeur abandonn\xE9", "Chargeur", "magazines", "Recharge vite, petit chargeur.");
  objets[6914] = p("Chargeur abandonn\xE9", "Chargeur", "magazines", "Recharge vite, petit chargeur (version suivante du Manifest).");
  objets[6921] = p("Trait P", "Attribut", "frames", "Effet P.");
  objets[6922] = p("Trait P", "Attribut am\xE9lior\xE9", "frames", "Effet P, renforc\xE9.");
  objets[6923] = p("Trait Q", "Attribut", "frames", "Effet Q.");
  objets[6931] = p("Crosse de contrepoids", "Mod d'arme", "v400.weapon.mod_guns", "Mod de crosse.");
  objets[6932] = p("Crosse de contrepoids", "Mod d'arme am\xE9lior\xE9", "v400.weapon.mod_guns", "Mod de crosse, am\xE9lior\xE9.");
  objets[6933] = p("Stabilit\xE9 am\xE9lior\xE9e", "Mod d'arme am\xE9lior\xE9", "v400.weapon.mod_damage", "Stabilit\xE9 +10");
  objets[6941] = p("Souvenir du champion", "Rev\xEAtement", "shader", "Appliquez ce rev\xEAtement.");
  objets[6942] = p("Souvenir du champion", "Rev\xEAtement", "shader", "Appliquez ce rev\xEAtement (autre).");
  objets[6951] = p("Particularit\xE9 X", "Particularit\xE9 d'origine", "origins", "Origine X.");
  objets[6952] = p("Particularit\xE9 X", "Particularit\xE9 d'origine", "origins", "Origine X (r\xE9\xE9dition).");
  jeux[8101] = { reusablePlugItems: [6901, 6903, 6902, 6904].map((h) => ({ plugItemHash: h })) };
  jeux[8102] = { reusablePlugItems: [6911, 6913, 6912, 6914].map((h) => ({ plugItemHash: h })) };
  jeux[8103] = { reusablePlugItems: [6921, 6923, 6922].map((h) => ({ plugItemHash: h })) };
  objets[5010] = arme("Fusil \xE0 paliers", {
    type: "Fusil \xE0 impulsion",
    degats: 3,
    bucket: BUCKET.energie,
    tier: HASH_LEGENDAIRE,
    collectible: 9010,
    sockets: [{ singleInitialItemHash: 6001 }, { randomizedPlugSetHash: 8101 }, { randomizedPlugSetHash: 8102 }, { randomizedPlugSetHash: 8103 }, { reusablePlugItems: [6931, 6932, 6933].map((h) => ({ plugItemHash: h })) }, { reusablePlugItems: [6941, 6942].map((h) => ({ plugItemHash: h })) }, { reusablePlugItems: [6951, 6952].map((h) => ({ plugItemHash: h })) }],
    categories: [{ socketCategoryHash: 7001, socketIndexes: [0] }, { socketCategoryHash: 7002, socketIndexes: [1, 2, 3, 6] }, { socketCategoryHash: 7004, socketIndexes: [4] }, { socketCategoryHash: 7003, socketIndexes: [5] }]
  });
  return defs2;
}
function ajouterArmeFaconnee(defs2) {
  const objets = defs2[T_OBJET], jeux = defs2[T_PLUGSET];
  const p = (nom, type, plugCat, description = "") => plug(nom, description, { itemTypeDisplayName: type, plug: { plugCategoryIdentifier: plugCat } });
  objets[7201] = p("Armature d'attaque", "Armature intrins\xE8que", "intrinsics", "Armature de la mitrailleuse.");
  objets[7211] = p("Rainurage polygonal", "Canon", "barrels", "Un canon par d\xE9faut.");
  objets[7212] = p("Frein t\xEAte-de-fl\xE8che", "Canon", "barrels", "Un frein de bouche.");
  objets[7213] = p("Canon lisse", "Canon", "barrels", "Un canon lisse.");
  objets[7221] = p("Chargeur tactique", "Chargeur", "magazines", "Un chargeur par d\xE9faut.");
  objets[7222] = p("Chargeur en alliage", "Chargeur", "magazines", "Un chargeur l\xE9ger.");
  objets[7223] = p("Gros chargeur", "Chargeur", "magazines", "Un chargeur large.");
  objets[7231] = p("Munitions d\xE9stabilisantes", "Attribut", "frames", "Effet d\xE9stabilisant.");
  objets[7234] = p("Rafale d'\xE9lan", "Attribut", "frames", "Effet d'\xE9lan.");
  objets[7235] = p("Tir en rafale", "Attribut", "frames", "Effet de rafale.");
  objets[7241] = p("D\xE9compte meurtrier", "Attribut", "frames", "Effet de d\xE9compte.");
  objets[7242] = p("D\xE9moralisation", "Attribut", "frames", "Effet de d\xE9moralisation.");
  objets[7243] = p("Tireur d'\xE9lite", "Attribut", "frames", "Effet de pr\xE9cision.");
  objets[7249] = p("Perk \xE9quip\xE9 hors pool", "Attribut", "frames", "Un perk que le Manifest ne liste pas.");
  jeux[8211] = { reusablePlugItems: [7211, 7212, 7213].map((h) => ({ plugItemHash: h })) };
  jeux[8212] = { reusablePlugItems: [7221, 7222, 7223].map((h) => ({ plugItemHash: h })) };
  jeux[8213] = { reusablePlugItems: [7231, 7234, 7235].map((h) => ({ plugItemHash: h })) };
  jeux[8214] = { reusablePlugItems: [7241, 7242, 7243].map((h) => ({ plugItemHash: h })) };
  objets[5020] = arme("Mesure corrective d'essai", {
    type: "Mitrailleuse",
    degats: 3,
    bucket: BUCKET.energie,
    tier: HASH_LEGENDAIRE,
    collectible: 9020,
    sockets: [{ singleInitialItemHash: 7201 }, { reusablePlugItems: [{ plugItemHash: 7211 }], reusablePlugSetHash: 8211 }, { reusablePlugItems: [{ plugItemHash: 7221 }], randomizedPlugSetHash: 8212 }, { reusablePlugItems: [{ plugItemHash: 7231 }], randomizedPlugSetHash: 8213 }, { reusablePlugItems: [{ plugItemHash: 7241 }], randomizedPlugSetHash: 8214 }, { singleInitialItemHash: 4029346515 }],
    categories: [{ socketCategoryHash: 7001, socketIndexes: [0] }, { socketCategoryHash: 7002, socketIndexes: [1, 2, 3, 4] }]
  });
  return defs2;
}
function manifestArmesDeTest() {
  return {
    [T_RARETE]: { [HASH_LEGENDAIRE]: { displayProperties: { name: "L\xE9gendaire" } }, [HASH_EXOTIQUE]: { displayProperties: { name: "Exotique" } } },
    [T_CATEGORIE]: { 7001: { displayProperties: { name: "Armature" } }, 7002: { displayProperties: { name: "Perks d'arme" } }, 7003: { displayProperties: { name: "Souvenir" } }, 7004: { displayProperties: { name: "Mods d'arme" } } },
    [T_PLUGSET]: {
      8001: { reusablePlugItems: [{ plugItemHash: 6201 }, { plugItemHash: 6202 }] },
      8002: { reusablePlugItems: [{ plugItemHash: 6301 }, { plugItemHash: 6302 }, { plugItemHash: 6303 }] }
    },
    [T_OBJET]: {
      5001: arme("Fusil d'essai", {
        type: "Fusil \xE0 impulsion",
        degats: 3,
        bucket: BUCKET.energie,
        tier: HASH_LEGENDAIRE,
        collectible: 9001,
        sockets: [
          { singleInitialItemHash: 6001 },
          { reusablePlugItems: [{ plugItemHash: 6101 }, { plugItemHash: 6102 }] },
          { randomizedPlugSetHash: 8001 },
          { randomizedPlugSetHash: 8002 },
          { reusablePlugItems: [{ plugItemHash: 6401 }] },
          { reusablePlugItems: [{ plugItemHash: 6601 }, { plugItemHash: 6602 }] },
          { reusablePlugItems: [{ plugItemHash: 6701 }] }
        ],
        categories: [{ socketCategoryHash: 7001, socketIndexes: [0] }, { socketCategoryHash: 7002, socketIndexes: [1, 2, 3] }, { socketCategoryHash: 7003, socketIndexes: [4] }, { socketCategoryHash: 7004, socketIndexes: [5, 6] }]
      }),
      5002: arme("Lance-roquettes d'essai", { type: "Lance-roquettes", degats: 4, bucket: BUCKET.lourde, tier: HASH_EXOTIQUE, collectible: 9002, sockets: [{ singleInitialItemHash: 6003 }, { reusablePlugItems: [{ plugItemHash: 6801 }] }] }),
      5003: arme("Arc d'essai", { type: "Arc", degats: 1, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [{ singleInitialItemHash: 6001 }, { reusablePlugItems: [{ plugItemHash: 6101 }] }] }),
      5004: arme("Arme masqu\xE9e", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, collectible: 9004, sockets: [], extra: { redacted: true } }),
      5005: { displayProperties: { name: "Casque d'essai", icon: "/icons/casque.png" }, itemType: 2, itemTypeDisplayName: "Casque", inventory: { bucketTypeHash: 3448274439, tierTypeHash: HASH_LEGENDAIRE } },
      5006: arme("", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [] }),
      5007: arme("Arme factice", { type: "Fusil automatique", degats: 2, bucket: BUCKET.cinetique, tier: HASH_LEGENDAIRE, sockets: [], extra: { itemCategoryHashes: [3109687656] } }),
      6001: plug("Armature adaptative"),
      6003: plug("\u0152il d'essai"),
      6101: plug("Canon A", "Un canon."),
      6102: plug("Canon B", "Un autre canon."),
      6201: plug("Chargeur A"),
      6202: plug("Chargeur B"),
      6301: plug("Trait 1a", "Effet A."),
      6302: plug("Trait 1b", "Effet B."),
      6303: plug("Trait 1c", "Effet C."),
      6401: plug("Souvenir: Test"),
      6601: plug("Crosse de contrepoids", "Mod de crosse."),
      6602: plug("Poign\xE9e de sprint", "Mod de poign\xE9e."),
      6701: plug("Compte-frags"),
      6801: plug("Perk exotique", "Effet exotique.")
    }
  };
}

// tests/logique/colonnes-faconnee.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 600));
};
var defs = ajouterArmeRevisionAPaliers(ajouterArmeFaconnee(manifestArmesDeTest()));
var { db } = creerFausseDb(defs);
var equipes = [{ socketIndex: 1, hash: 7212 }, { socketIndex: 2, hash: 7222 }, { socketIndex: 3, hash: 7231 }, { socketIndex: 4, hash: 7249 }];
var hashesEquipes = equipes.map((e) => e.hash);
var col = (cs, prise) => cs.find((c) => c.socketIndex === prise);
var hashes = (c) => c.options.map((o) => o.hash);
var coches = (c) => c.options.filter((o) => o.equipeEnJeu).map((o) => o.hash);
var avant = obtenirOptionsToutesColonnes(db, 5020, hashesEquipes);
ok("AVANT (comportement d'origine, conserv\xE9 par d\xE9faut) : chaque colonne de perks n'a QU'UN perk, celui de la liste directe (Rainurage polygonal, Chargeur tactique, Munitions d\xE9stabilisantes, D\xE9compte meurtrier) ; le canon et le chargeur r\xE9ellement \xE9quip\xE9s (Frein t\xEAte-de-fl\xE8che, Chargeur en alliage) n'apparaissent PAS, et le trait 2 \xE9quip\xE9 non plus", [1, 2, 3, 4].every((i) => col(avant, i).options.length === 1) && hashes(col(avant, 1)).join() === "7211" && hashes(col(avant, 2)).join() === "7221" && coches(col(avant, 1)).length === 0 && coches(col(avant, 2)).length === 0 && !hashes(col(avant, 4)).includes(7249), avant.map((c) => [c.socketIndex, hashes(c)]));
var eq = obtenirOptionsToutesColonnes(db, 5020, hashesEquipes, { equipesParColonne: equipes });
ok("GARANTIE 1 (perk \xE9quip\xE9) : le Frein t\xEAte-de-fl\xE8che et le Chargeur en alliage, \xE9quip\xE9s mais absents de la liste, apparaissent dans leur colonne, COCH\xC9S, \xE0 la suite du perk de la liste ; le perk hors Manifest (7249) appara\xEEt aussi, coch\xE9 ; le perk par d\xE9faut 7231, lui, est \xE9quip\xE9 et coch\xE9 l\xE0 o\xF9 il est", hashes(col(eq, 1)).join() === "7211,7212" && coches(col(eq, 1)).join() === "7212" && hashes(col(eq, 2)).join() === "7221,7222" && coches(col(eq, 2)).join() === "7222" && hashes(col(eq, 4)).join() === "7241,7249" && coches(col(eq, 4)).join() === "7249" && coches(col(eq, 3)).join() === "7231", eq.map((c) => [c.socketIndex, hashes(c), coches(c)]));
ok("la garantie 1 n'ajoute rien quand le perk \xE9quip\xE9 est D\xC9J\xC0 dans la colonne (pas de doublon), ne cr\xE9e aucune colonne pour une prise sans colonne (la prise 5, perk \xAB Arme fa\xE7onn\xE9e \xBB, n'en a pas) et ignore un perk \xE9quip\xE9 sans nom connu", (() => {
  const r = obtenirOptionsToutesColonnes(db, 5020, [7231, 4029346515, 9999999], { equipesParColonne: [{ socketIndex: 3, hash: 7231 }, { socketIndex: 5, hash: 4029346515 }, { socketIndex: 3, hash: 9999999 }] });
  return hashes(col(r, 3)).join() === "7231" && !r.some((c) => c.socketIndex === 5);
})());
var tous = obtenirOptionsToutesColonnes(db, 5020, hashesEquipes, { toutesSources: true });
ok("GARANTIE 2 (perks possibles) : chaque colonne re\xE7oit TOUS ses perks possibles, sans doublon, la liste directe d'abord : canons 7211-7213 (jeu de plugs partag\xE9), chargeurs 7221-7223, traits 1 : 7231, 7234, 7235 et traits 2 : 7241-7243 (jeux al\xE9atoires)", hashes(col(tous, 1)).join() === "7211,7212,7213" && hashes(col(tous, 2)).join() === "7221,7222,7223" && hashes(col(tous, 3)).join() === "7231,7234,7235" && hashes(col(tous, 4)).join() === "7241,7242,7243", tous.map((c) => [c.socketIndex, hashes(c)]));
ok("avec les deux garanties : le pool entier ET le perk \xE9quip\xE9 : canons 7211-7213 dont le 7212 coch\xE9 ; chargeurs dont le 7222 coch\xE9 ; trait 2 : 7241-7243 puis le 7249 \xE9quip\xE9 hors pool, coch\xE9 ; un seul perk coch\xE9 par colonne", (() => {
  const r = obtenirOptionsToutesColonnes(db, 5020, hashesEquipes, { toutesSources: true, equipesParColonne: equipes });
  return hashes(col(r, 1)).join() === "7211,7212,7213" && coches(col(r, 1)).join() === "7212" && coches(col(r, 2)).join() === "7222" && hashes(col(r, 4)).join() === "7241,7242,7243,7249" && coches(col(r, 4)).join() === "7249" && [1, 2, 3, 4].every((i) => coches(col(r, i)).length === 1);
})());
var normale = obtenirOptionsToutesColonnes(db, 5010, [6901, 6912, 6921, 6931]);
var normaleAvecEquipes = obtenirOptionsToutesColonnes(db, 5010, [6901, 6912, 6921, 6931], { equipesParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }, { socketIndex: 3, hash: 6921 }, { socketIndex: 4, hash: 6931 }] });
ok("UNE ARME NORMALE (le Fusil \xE0 paliers, perks \xE9quip\xE9s d\xE9j\xE0 dans les pools) : la garantie 1 ne change RIEN (m\xEAmes colonnes, m\xEAmes perks, m\xEAmes cases coch\xE9es) ; sans r\xE9glage, le comportement est identique \xE0 celui d'avant", JSON.stringify(normale.map((c) => [c.socketIndex, hashes(c), coches(c)])) === JSON.stringify(normaleAvecEquipes.map((c) => [c.socketIndex, hashes(c), coches(c)])), [normale.length, normaleAvecEquipes.length]);
ok("`toutesSources` sur une arme \xE0 pool al\xE9atoire qui n'a PAS de liste directe donne le m\xEAme pool que sans le r\xE9glage (aucun perk ajout\xE9 ni perdu : seul le cas \xAB liste directe + pool \xBB change)", JSON.stringify(obtenirOptionsToutesColonnes(db, 5010, [], { toutesSources: true }).map((c) => [c.socketIndex, hashes(c)])) === JSON.stringify(obtenirOptionsToutesColonnes(db, 5010, []).map((c) => [c.socketIndex, hashes(c)])));
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);

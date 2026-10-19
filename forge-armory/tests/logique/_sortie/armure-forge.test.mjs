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
    const base2 = nom.slice(0, nom.length - suffixe.length - 1).trim();
    if (base2) variantes.set(base2, [...variantes.get(base2) ?? [], e.champion]);
  }
  for (const [base2, valeurs] of variantes) {
    if (valeurs.length >= 2 && valeurs.every((v) => v === valeurs[0]) && !table.has(base2)) table.set(base2, valeurs[0]);
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

// src/lib/manifest/statsArmure.ts
var LIBELLES_STAT = {
  sante: ["sante", "health"],
  melee: ["corps a corps", "melee"],
  grenade: ["grenade"],
  super: ["super"],
  classe: ["classe", "class", "competence de classe", "class ability"],
  arme: ["arme", "armes", "weapon", "weapons"]
};
function resoudreStatKey(nomStat) {
  const nomNormalise = normaliser(nomStat);
  for (const [cle, libelles] of Object.entries(LIBELLES_STAT)) {
    if (libelles.some((l) => nomNormalise.includes(l))) return cle;
  }
  return void 0;
}

// src/lib/manifest/saison.ts
var indexes = /* @__PURE__ */ new WeakMap();
function obtenirIndex(db2) {
  let idx2 = indexes.get(db2);
  if (!idx2) {
    idx2 = { etat: "attente", carte: /* @__PURE__ */ new Map(), objetsAvecSaison: 0, version: 0, ecouteurs: /* @__PURE__ */ new Set(), fin: Promise.resolve() };
    indexes.set(db2, idx2);
  }
  return idx2;
}
var compter = (carte, filigrane, saison) => {
  let m = carte.get(filigrane);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    carte.set(filigrane, m);
  }
  m.set(saison, (m.get(saison) ?? 0) + 1);
};
function saisonDuFiligrane(idx2, filigranes) {
  for (const f of filigranes) {
    const m = f ? idx2.carte.get(f) : void 0;
    if (!m) continue;
    let meilleure, max = 0;
    for (const [saison, n] of m) if (n > max) {
      max = n;
      meilleure = saison;
    }
    if (meilleure !== void 0) return meilleure;
  }
  return void 0;
}
function demarrerIndexSaisons(db2) {
  const idx2 = obtenirIndex(db2);
  if (idx2.etat !== "attente") return idx2;
  idx2.etat = "encours";
  idx2.fin = new Promise((resolve) => {
    let stmt = null;
    const terminer = () => {
      try {
        stmt?.free();
      } catch {
      }
      idx2.etat = "fini";
      idx2.version++;
      idx2.ecouteurs.forEach((cb) => {
        try {
          cb();
        } catch {
        }
      });
      resolve();
    };
    const pas = () => {
      try {
        if (!stmt) stmt = db2.prepare(`SELECT json FROM DestinyInventoryItemDefinition WHERE json LIKE '%"seasonHash":%'`);
        const debut = Date.now();
        while (Date.now() - debut < 12) {
          if (!stmt.step()) {
            terminer();
            return;
          }
          const json = String(stmt.getAsObject().json ?? "");
          const s = /"seasonHash":(\d+)/.exec(json);
          if (!s) continue;
          const saison = Number(s[1]);
          idx2.objetsAvecSaison++;
          for (const motif of [/"iconWatermark":"([^"]+)"/, /"iconWatermarkShelved":"([^"]+)"/]) {
            const f = motif.exec(json);
            if (f) compter(idx2.carte, f[1], saison);
          }
        }
        setTimeout(pas, 0);
      } catch {
        terminer();
      }
    };
    setTimeout(pas, 0);
  });
  return idx2;
}
var etatIndexSaisons = (db2) => {
  const i = obtenirIndex(db2);
  return { etat: i.etat, objetsAvecSaison: i.objetsAvecSaison, filigranes: i.carte.size };
};
var memoire = /* @__PURE__ */ new WeakMap();
function obtenirSaisonObjet(db2, itemHash) {
  if (!db2 || !itemHash) return void 0;
  let m = memoire.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoire.set(db2, m);
  }
  const version = obtenirIndex(db2).version;
  const connu = m.get(itemHash);
  if (connu && connu.v === version) return connu.info ?? void 0;
  let info = null;
  try {
    const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
    const filigrane = urlIcone(def?.iconWatermark || def?.iconWatermarkShelved);
    if (filigrane) {
      info = { filigrane };
      let hashSaison = def?.seasonHash;
      if (!hashSaison) {
        const idx2 = obtenirIndex(db2);
        if (idx2.etat === "attente") demarrerIndexSaisons(db2);
        else if (idx2.etat === "fini") {
          hashSaison = saisonDuFiligrane(idx2, [def?.iconWatermark, def?.iconWatermarkShelved]);
          if (hashSaison) info.nomDeduit = true;
        }
      }
      if (hashSaison) {
        info.hashSaison = hashSaison;
        try {
          const s = obtenirDefinition(db2, "DestinySeasonDefinition", hashSaison);
          if (s?.displayProperties?.name) info.nom = s.displayProperties.name;
          if (typeof s?.seasonNumber === "number") info.numero = s.seasonNumber;
        } catch {
        }
      }
    }
  } catch {
    info = null;
  }
  m.set(itemHash, { v: version, info });
  return info ?? void 0;
}
function diagnosticSaisonObjet(db2, itemHash) {
  try {
    const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
    let saison = "\u2014";
    if (def?.seasonHash) {
      try {
        const s = obtenirDefinition(db2, "DestinySeasonDefinition", def.seasonHash);
        saison = s ? `${s.displayProperties?.name ?? "(sans nom)"}, n\xB0 ${s.seasonNumber ?? "?"}` : "(introuvable dans la table des saisons)";
      } catch {
        saison = "(table des saisons illisible)";
      }
    }
    const idx2 = etatIndexSaisons(db2);
    const info = obtenirSaisonObjet(db2, itemHash);
    const deduit = def?.seasonHash ? "" : ` | d\xE9duite des autres objets de m\xEAme filigrane : ${info?.nomDeduit ? `${info.nom ?? "(saison sans nom)"}${info.numero ? `, n\xB0 ${info.numero}` : ""}` : idx2.etat === "fini" ? "AUCUNE (aucun autre objet de ce filigrane n'a de seasonHash)" : "balayage " + (idx2.etat === "encours" ? "en cours" : "pas encore lanc\xE9")}`;
    return `Saison : seasonHash = ${def?.seasonHash ?? "ABSENT"} \u2192 ${saison} | filigrane : ${def?.iconWatermark ?? "ABSENT"}${def?.iconWatermarkShelved ? ` | filigrane \xAB shelved \xBB : ${def.iconWatermarkShelved}` : ""}${deduit} | balayage des saisons : ${idx2.etat}, ${idx2.objetsAvecSaison} objet(s) du Manifest ont un seasonHash, ${idx2.filigranes} filigrane(s) reli\xE9s \xE0 une saison`;
  } catch (e) {
    return `Saison : lecture impossible (${e.message})`;
  }
}

// src/lib/forge/armure.ts
var MOTS_COSMETIQUES = /shader|skin|ornament|ornement|cosmetic|cosmetique|transmat|emote|projection|memento|souvenir|tracker|apparence|teinture|spawn/;
var CATEGORIES_FIXES = /masterwork|armor_stats|intrinsic|exotic|set_perk|armor_tier|archetype/i;
var memoStats = /* @__PURE__ */ new WeakMap();
function cleStat(db2, statHash) {
  let m = memoStats.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoStats.set(db2, m);
  }
  if (!m.has(statHash)) {
    const nom = obtenirDefinition(db2, "DestinyStatDefinition", statHash)?.displayProperties?.name;
    m.set(statHash, nom ? resoudreStatKey(nom) : void 0);
  }
  return m.get(statHash);
}
var memoPlugs = /* @__PURE__ */ new WeakMap();
function lirePlugArmure(db2, hash) {
  let m = memoPlugs.get(db2);
  if (!m) {
    m = /* @__PURE__ */ new Map();
    memoPlugs.set(db2, m);
  }
  const connu = m.get(hash);
  if (connu !== void 0) return connu;
  let plug2 = null;
  try {
    const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash);
    const nom = def?.displayProperties?.name;
    if (nom) {
      const { description, estOrnement } = obtenirDescriptionComplete(db2, hash);
      const stats = {};
      for (const inv of def?.investmentStats ?? []) {
        const k = cleStat(db2, inv.statTypeHash);
        if (k) stats[k] = (stats[k] ?? 0) + inv.value;
      }
      plug2 = { hash, nom, description, icone: urlIcone(def?.displayProperties?.icon), categoriePlug: def?.plug?.plugCategoryIdentifier ?? "", ornement: estOrnement, stats };
    }
  } catch {
    plug2 = null;
  }
  m.set(hash, plug2);
  return plug2;
}
function completerParModele(db2, piece, socketIndex, vus) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", piece.itemHash);
  const entree = def?.sockets?.socketEntries?.[socketIndex];
  if (!entree) return [];
  const ajoutes = [];
  for (const h of hashesPossibles(db2, entree)) {
    if (vus.has(h)) continue;
    vus.add(h);
    const p = lirePlugArmure(db2, h);
    if (p && !p.ornement) ajoutes.push({ ...p, theorique: true });
  }
  return ajoutes;
}
function colonnesArmure(db2, piece, inclureCosmetiques = false) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", piece.itemHash);
  const noms = /* @__PURE__ */ new Map();
  for (const cat of def?.sockets?.socketCategories ?? []) {
    let nom = "";
    try {
      nom = obtenirDefinition(db2, "DestinySocketCategoryDefinition", cat.socketCategoryHash)?.displayProperties?.name ?? "";
    } catch {
    }
    for (const i of cat.socketIndexes) noms.set(i, nom);
  }
  const colonnes = [];
  for (const { socketIndex, hash } of piece.perksParColonne ?? []) {
    const equipe = lirePlugArmure(db2, hash);
    if (!equipe) continue;
    const categorie = noms.get(socketIndex) ?? "";
    const cosmetique = equipe.ornement || MOTS_COSMETIQUES.test(equipe.categoriePlug.toLowerCase()) || MOTS_COSMETIQUES.test(normaliser(categorie));
    const options = [equipe];
    const vus = /* @__PURE__ */ new Set([hash]);
    for (const h of piece.plugsDisponiblesParColonne?.[socketIndex] ?? []) {
      if (vus.has(h)) continue;
      vus.add(h);
      const p = lirePlugArmure(db2, h);
      if (p && !p.ornement) options.push(p);
    }
    let theorique = false;
    const fixe = CATEGORIES_FIXES.test(equipe.categoriePlug);
    if (!fixe && !cosmetique && options.length < 2) {
      const modele = completerParModele(db2, piece, socketIndex, vus);
      theorique = modele.length > 0;
      options.push(...modele);
    }
    colonnes.push({ socketIndex, categorie, equipe, options, cosmetique, fixe, modifiable: !fixe && !cosmetique && options.length >= 2, theorique: theorique || void 0 });
  }
  colonnes.sort((a, b) => a.socketIndex - b.socketIndex);
  return inclureCosmetiques ? colonnes : colonnes.filter((c) => !c.cosmetique);
}
function statsSimulees(db2, piece, choix) {
  const delta = {};
  let nbChangements = 0;
  if (choix) {
    for (const col2 of colonnesArmure(db2, piece, true)) {
      const c = choix[col2.socketIndex];
      if (!c || !col2.modifiable || c.effectif === col2.equipe.hash) continue;
      const nouveau = col2.options.find((o) => o.hash === c.effectif);
      if (!nouveau) continue;
      nbChangements++;
      for (const k of /* @__PURE__ */ new Set([...Object.keys(nouveau.stats), ...Object.keys(col2.equipe.stats)])) delta[k] = (delta[k] ?? 0) + (nouveau.stats[k] ?? 0) - (col2.equipe.stats[k] ?? 0);
    }
  }
  const reelles = piece.stats ?? {};
  const simulees = { ...reelles };
  for (const k of Object.keys(delta)) simulees[k] = (reelles[k] ?? 0) + (delta[k] ?? 0);
  return { reelles, simulees, delta, nbChangements };
}
function diagnosticArmure(db2, piece) {
  const lignes = [];
  lignes.push(`Armure : ${piece.nom ?? "?"} (hash ${piece.itemHash}) | emplacement : ${piece.slot} | classe : ${piece.classeRequise ?? "?"} | exotique : ${piece.isExotic ? "oui" : "non"} | ensemble (setHash) : ${piece.setHash ?? "aucun"}`);
  lignes.push(diagnosticSaisonObjet(db2, piece.itemHash));
  lignes.push(`Statistiques r\xE9elles : ${Object.entries(piece.stats ?? {}).map(([k, v]) => `${k} ${v}`).join(", ") || "aucune"}`);
  lignes.push(`Disponibilit\xE9 des plugs lue sur l'exemplaire : ${piece.plugsDisponiblesParColonne === void 0 ? "NON (rechargez l'inventaire)" : "oui"}`);
  const colonnes = colonnesArmure(db2, piece, true);
  const lues = new Set(colonnes.map((c) => c.socketIndex));
  for (const c of colonnes) {
    const dispo = piece.plugsDisponiblesParColonne?.[c.socketIndex] ?? [];
    const noms = c.options.slice(1, 7).map((o) => o.nom).join(" | ");
    lignes.push(`prise ${c.socketIndex} | cat\xE9gorie \xAB ${c.categorie || "?"} \xBB | \xE9quip\xE9 : ${c.equipe.nom} (hash ${c.equipe.hash}, cat\xE9gorie de plug \xAB ${c.equipe.categoriePlug || "?"} \xBB, stats : ${Object.entries(c.equipe.stats).map(([k, v]) => `${k} ${v >= 0 ? "+" : ""}${v}`).join(", ") || "aucune"}) | disponibles : ${dispo.length}${noms ? ` (autres : ${noms}${c.options.length > 7 ? " \u2026" : ""})` : ""} | cosm\xE9tique : ${c.cosmetique ? "oui" : "non"} | fixe : ${c.fixe ? "oui" : "non"} | modifiable : ${c.modifiable ? "OUI" : "non"}`);
  }
  for (const p of piece.perksParColonne ?? []) if (!lues.has(p.socketIndex)) lignes.push(`prise ${p.socketIndex} | plug illisible dans le Manifest (hash ${p.hash})`);
  return lignes.join("\n");
}
function hashesPossibles(db2, e) {
  const hashes2 = [];
  const ajouter = (hs) => {
    for (const h of hs) if (!hashes2.includes(h)) hashes2.push(h);
  };
  const pool = (hashJeu) => (obtenirDefinition(db2, "DestinyPlugSetDefinition", hashJeu)?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
  ajouter((e.reusablePlugItems ?? []).map((p) => p.plugItemHash));
  if (e.reusablePlugSetHash) ajouter(pool(e.reusablePlugSetHash));
  if (e.randomizedPlugSetHash) ajouter(pool(e.randomizedPlugSetHash));
  if (e.singleInitialItemHash) ajouter([e.singleInitialItemHash]);
  return hashes2;
}

// tests/logique/fixtures/fauxManifest.ts
var T_OBJET = "DestinyInventoryItemDefinition";
var T_PLUGSET = "DestinyPlugSetDefinition";
var T_CATEGORIE = "DestinySocketCategoryDefinition";
var T_RARETE = "DestinyItemTierTypeDefinition";
var HASH_EXOTIQUE = 2759499571;
var HASH_LEGENDAIRE = 4008398120;
var BUCKET = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };
function creerFausseDb(defs, options = {}) {
  const requetes = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes.push(sql);
      const m = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m?.[1] ?? "", where = m?.[2] ?? "";
      const lignes = Object.entries(defs[table] ?? {}).map(([h, d2]) => ({ id: hashVersIdSqlite(+h), json: JSON.stringify(d2) }));
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
function ajouterArmureForge(defs) {
  const objets = defs[T_OBJET];
  defs["DestinyStatDefinition"] = { 8801: { displayProperties: { name: "Sant\xE9" } }, 8802: { displayProperties: { name: "Corps \xE0 corps" } }, 8803: { displayProperties: { name: "Grenade" } }, 8804: { displayProperties: { name: "Super" } }, 8805: { displayProperties: { name: "Classe" } }, 8806: { displayProperties: { name: "Armes" } } };
  const cat = defs[T_CATEGORIE] ?? (defs[T_CATEGORIE] = {});
  cat[7601] = { displayProperties: { name: "Arch\xE9type" } };
  cat[7602] = { displayProperties: { name: "Mods d'armure" } };
  cat[7603] = { displayProperties: { name: "Apparence" } };
  const pl = (nom, categorie, inv, description = "") => ({ ...plug(nom, description, { plug: { plugCategoryIdentifier: categorie } }), investmentStats: inv.map(([statTypeHash, value]) => ({ statTypeHash, value })) });
  objets[7401] = pl("Arch\xE9type Bastion", "armor_stats", [[8801, 17], [8805, 12]]);
  objets[7402] = pl("Am\xE9lioration d'armure", "armor.masterworks.v2", [[8801, 5], [8802, 5], [8803, 5]]);
  objets[7411] = pl("Mod de sant\xE9", "enhancements.v2_general", [[8801, 10]], "Augmente la sant\xE9.");
  objets[7412] = pl("Mod de classe", "enhancements.v2_general", [[8805, 10]], "Augmente la classe.");
  objets[7413] = pl("Mod d'armes", "enhancements.v2_general", [[8806, 10]], "Augmente les armes.");
  objets[7421] = pl("Ajustement : m\xEAl\xE9e vers grenade", "enhancements.v2_tuning", [[8802, 5], [8803, -5]]);
  objets[7422] = pl("Ajustement : super vers classe", "enhancements.v2_tuning", [[8804, 5], [8805, -5]]);
  objets[7431] = pl("Teinture rouge", "shader", []);
  objets[7432] = pl("Teinture bleue", "shader", []);
  objets[7433] = pl("Teinture verte", "shader", []);
  objets[7441] = pl("Perk exotique d'essai", "intrinsics", [], "Un effet exotique narratif.");
  objets[198e3] = pl("Emplacement de mod vide", "enhancements.v2_general", [], "Un emplacement vide.");
  const entrees = (...hashes2) => hashes2.map((h) => ({ singleInitialItemHash: h }));
  defs[T_PLUGSET][8301] = { reusablePlugItems: [7411, 7412, 7413].map((h) => ({ plugItemHash: h })) };
  defs[T_PLUGSET][8302] = { reusablePlugItems: [7421, 7422].map((h) => ({ plugItemHash: h })) };
  objets[5301] = { displayProperties: { name: "Casque de bastion d'essai", icon: "/icons/casque.png" }, sockets: { socketEntries: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 7402 }, { singleInitialItemHash: 7411, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 7421, reusablePlugSetHash: 8302 }, { singleInitialItemHash: 7431 }], socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2, 3] }, { socketCategoryHash: 7603, socketIndexes: [4] }] } };
  objets[5302] = { displayProperties: { name: "Plastron exotique d'essai", icon: "/icons/plastron.png" }, sockets: { socketEntries: entrees(7401, 7441, 7412), socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0, 1] }, { socketCategoryHash: 7602, socketIndexes: [2] }] } };
  objets[5304] = { displayProperties: { name: "Casque \xE0 prises r\xE9p\xE9t\xE9es d'essai", icon: "/icons/casque.png" }, sockets: { socketEntries: [{ singleInitialItemHash: 7401 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }, { singleInitialItemHash: 198e3, reusablePlugSetHash: 8301 }], socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0] }, { socketCategoryHash: 7602, socketIndexes: [1, 2, 3] }] } };
  objets[5303] = { displayProperties: { name: "Marque de classe d'essai", icon: "/icons/marque.png" }, sockets: { socketEntries: entrees(7441), socketCategories: [{ socketCategoryHash: 7601, socketIndexes: [0] }] } };
  return defs;
}
var T_SAISON = "DestinySeasonDefinition";
function ajouterSaisons(defs, hashes2, options = {}) {
  const objets = defs[T_OBJET];
  for (const h of hashes2) if (objets[h]) objets[h] = { ...objets[h], iconWatermark: "/img/saison-sorciere.png", ...options.sansHash ? {} : { seasonHash: 9001 } };
  for (let i = 0; i < (options.remplissage ?? 0); i++) objets[999e4 + i] = { displayProperties: { name: `Remplissage ${i}` }, iconWatermark: `/img/remplissage-${i}.png`, seasonHash: 9001 };
  if (options.sansHash) objets[9999999] = { displayProperties: { name: "Objet de r\xE9f\xE9rence" }, iconWatermark: "/img/saison-sorciere.png", seasonHash: 9001 };
  defs[T_SAISON] = { 9001: { displayProperties: { name: "Saison de la Sorci\xE8re" }, seasonNumber: 22 } };
  return defs;
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

// tests/logique/armure-forge.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 700));
};
var { db } = creerFausseDb(ajouterSaisons(ajouterArmureForge(manifestArmesDeTest()), [5301]));
var base = { isExotic: false, rarete: "L\xE9gendaire", icone: "https://www.bungie.net/icons/x.png", stats: {} };
var casque = { ...base, itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", stats: { sante: 20, melee: 10, grenade: 15, super: 8, classe: 12, arme: 25 }, perkHashes: [7401, 7402, 7411, 7421, 7431], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }, { socketIndex: 4, hash: 7431 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7402], 2: [7411, 7412, 7413], 3: [7421, 7422], 4: [7431, 7432, 7433] } };
var plastron = { ...base, itemHash: 5302, itemInstanceId: "a2", nom: "Plastron exotique d'essai", slot: "torse", classeRequise: "arcaniste", origine: "coffre", isExotic: true, stats: { sante: 30, melee: 5, grenade: 5, super: 20, classe: 10, arme: 20 }, perkHashes: [7401, 7441, 7412], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7441 }, { socketIndex: 2, hash: 7412 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7441], 2: [7411, 7412, 7413] } };
var marque = { ...base, itemHash: 5303, itemInstanceId: "a3", nom: "Marque de classe d'essai", slot: "marque", classeRequise: "chasseur", origine: "chasseur", perkHashes: [7441], perksParColonne: [{ socketIndex: 0, hash: 7441 }], plugsDisponiblesParColonne: { 0: [7441] } };
var sansColonnes = { ...base, itemHash: 5005, itemInstanceId: "c1", nom: "Casque d'essai", slot: "casque", classeRequise: "arcaniste", origine: "arcaniste", perkHashes: [] };
var idx = (cs2) => cs2.map((c) => c.socketIndex);
var hashes = (c) => c.options.map((o) => o.hash);
var col = (cs2, i) => cs2.find((c) => c.socketIndex === i);
ok("R\xC9SOLUTION DES STATISTIQUES par le nom (fran\xE7ais et anglais, accents ignor\xE9s) : Sant\xE9/Health \u2192 sante ; Corps \xE0 corps/Melee \u2192 melee ; Grenade ; Super ; Classe/Class/Comp\xE9tence de classe \u2192 classe ; Armes/Weapons \u2192 arme ; un nom inconnu \u2192 rien", resoudreStatKey("Sant\xE9") === "sante" && resoudreStatKey("Health") === "sante" && resoudreStatKey("Corps \xE0 corps") === "melee" && resoudreStatKey("Melee") === "melee" && resoudreStatKey("Grenade") === "grenade" && resoudreStatKey("Super") === "super" && resoudreStatKey("Classe") === "classe" && resoudreStatKey("Class Ability") === "classe" && resoudreStatKey("Armes") === "arme" && resoudreStatKey("Weapons") === "arme" && resoudreStatKey("Inconnue") === void 0);
var cs = colonnesArmure(db, casque);
ok("COLONNES d'un casque : quatre emplacements (arch\xE9type, am\xE9lioration, mod, ajustement) dans l'ordre des prises ; l'emplacement cosm\xE9tique de teinture est MASQU\xC9 par d\xE9faut", JSON.stringify(idx(cs)) === "[0,1,2,3]", idx(cs));
ok("chaque colonne porte le NOM de sa cat\xE9gorie de socket lu dans le Manifest (\xAB Arch\xE9type \xBB, \xAB Mods d'armure \xBB)", col(cs, 0).categorie === "Arch\xE9type" && col(cs, 1).categorie === "Arch\xE9type" && col(cs, 2).categorie === "Mods d'armure" && col(cs, 3).categorie === "Mods d'armure", cs.map((c) => c.categorie));
ok("le plug \xC9QUIP\xC9 vient en premier, puis les autres plugs DISPONIBLES sur l'exemplaire, sans doublon : mods 7411 (\xE9quip\xE9), 7412, 7413 ; ajustements 7421 (\xE9quip\xE9), 7422 ; arch\xE9type : 7401 seul", JSON.stringify(hashes(col(cs, 2))) === "[7411,7412,7413]" && JSON.stringify(hashes(col(cs, 3))) === "[7421,7422]" && JSON.stringify(hashes(col(cs, 0))) === "[7401]" && col(cs, 2).equipe.nom === "Mod de sant\xE9", cs.map(hashes));
ok("FIXES : l'arch\xE9type (cat\xE9gorie armor_stats) et l'am\xE9lioration (armor.masterworks) ne sont jamais modifiables ; MODIFIABLES : le mod et l'ajustement (deux plugs ou plus, ni fixes ni cosm\xE9tiques)", col(cs, 0).fixe && !col(cs, 0).modifiable && col(cs, 1).fixe && !col(cs, 1).modifiable && !col(cs, 2).fixe && col(cs, 2).modifiable && col(cs, 3).modifiable, cs.map((c) => [c.socketIndex, c.fixe, c.modifiable]));
var avecCosmetiques = colonnesArmure(db, casque, true);
ok("avec \xAB afficher les cosm\xE9tiques \xBB : la teinture (3 plugs disponibles) appara\xEEt, marqu\xE9e COSM\xC9TIQUE et JAMAIS modifiable malgr\xE9 ses trois plugs", JSON.stringify(idx(avecCosmetiques)) === "[0,1,2,3,4]" && col(avecCosmetiques, 4).cosmetique && !col(avecCosmetiques, 4).modifiable && col(avecCosmetiques, 4).options.length === 3, col(avecCosmetiques, 4));
var csExo = colonnesArmure(db, plastron);
ok("ARMURE EXOTIQUE : le perk exotique (cat\xE9gorie \xAB intrinsics \xBB) est fixe ; l'emplacement de mod reste modifiable, avec le mod r\xE9ellement \xE9quip\xE9 (7412) en t\xEAte", col(csExo, 1).fixe && !col(csExo, 1).modifiable && col(csExo, 2).modifiable && col(csExo, 2).equipe.hash === 7412 && JSON.stringify(hashes(col(csExo, 2))) === "[7412,7411,7413]", csExo.map((c) => [c.socketIndex, c.fixe, c.modifiable, hashes(c)]));
var csMarque = colonnesArmure(db, marque);
ok("UNE MARQUE DE CLASSE \xE0 perk exotique seul : une colonne, fixe, rien de modifiable", csMarque.length === 1 && csMarque[0].fixe && csMarque.every((c) => !c.modifiable), csMarque);
ok("une armure SANS emplacements lus (pas de `perksParColonne`) : aucune colonne, sans erreur", colonnesArmure(db, sansColonnes).length === 0);
var sansDispo = { ...casque, plugsDisponiblesParColonne: void 0 };
ok("SANS disponibilit\xE9 lue sur l'exemplaire (inventaire charg\xE9 avant la mise \xE0 jour) : les colonnes existent ; seules les prises FIXES et COSM\xC9TIQUES gardent leur unique plug \xE9quip\xE9, les prises de mods sont compl\xE9t\xE9es par le mod\xE8le (th\xE9oriques) et deviennent modifiables", (() => {
  const cs2 = colonnesArmure(db, sansDispo);
  return cs2.length === 4 && cs2.filter((c) => c.fixe || c.cosmetique).every((c) => c.options.length === 1 && !c.modifiable) && cs2.filter((c) => !c.fixe && !c.cosmetique).every((c) => c.theorique === true && c.modifiable);
})());
var inconnu = { ...casque, perksParColonne: [...casque.perksParColonne, { socketIndex: 9, hash: 999999 }] };
ok("un plug ILLISIBLE dans le Manifest (hash inconnu) est ignor\xE9 sans erreur ; le plug d'un ornement est ignor\xE9 parmi les options", colonnesArmure(db, inconnu).length === 4 && lirePlugArmure(db, 999999) === null);
ok("la lecture d'un plug garde ses statistiques r\xE9solues par le nom : le mod de sant\xE9 donne +10 de sant\xE9, l'ajustement \u22125 de grenade et +5 de m\xEAl\xE9e", lirePlugArmure(db, 7411)?.stats.sante === 10 && lirePlugArmure(db, 7421)?.stats.grenade === -5 && lirePlugArmure(db, 7421)?.stats.melee === 5, [lirePlugArmure(db, 7411)?.stats, lirePlugArmure(db, 7421)?.stats]);
var sans = statsSimulees(db, casque);
ok("SANS simulation : aucune diff\xE9rence, les statistiques simul\xE9es sont les r\xE9elles, z\xE9ro changement", JSON.stringify(sans.delta) === "{}" && sans.nbChangements === 0 && JSON.stringify(sans.simulees) === JSON.stringify(casque.stats));
var unMod = statsSimulees(db, casque, { 2: { choisi: 7412, effectif: 7412 } });
ok("UN MOD simul\xE9 (le mod de classe \xE0 la place du mod de sant\xE9) : sant\xE9 \u221210, classe +10, un changement ; la somme des six statistiques est inchang\xE9e", unMod.delta.sante === -10 && unMod.delta.classe === 10 && unMod.nbChangements === 1 && unMod.simulees.sante === 10 && unMod.simulees.classe === 22 && unMod.simulees.melee === 10, unMod);
var mod2 = statsSimulees(db, casque, { 2: { choisi: 7413, effectif: 7413 } });
ok("le mod d'armes \xE0 la place du mod de sant\xE9 : sant\xE9 \u221210, armes +10", mod2.delta.sante === -10 && mod2.delta.arme === 10 && mod2.simulees.arme === 35, mod2);
var ajust = statsSimulees(db, casque, { 3: { choisi: 7422, effectif: 7422 } });
ok("UN AJUSTEMENT simul\xE9 (super vers classe \xE0 la place de m\xEAl\xE9e vers grenade) : m\xEAl\xE9e \u22125, grenade +5, super +5, classe \u22125", ajust.delta.melee === -5 && ajust.delta.grenade === 5 && ajust.delta.super === 5 && ajust.delta.classe === -5, ajust);
var deux = statsSimulees(db, casque, { 2: { choisi: 7412, effectif: 7412 }, 3: { choisi: 7422, effectif: 7422 } });
ok("DEUX emplacements simul\xE9s : les diff\xE9rences s'additionnent (classe +10 \u22125 = +5, sant\xE9 \u221210, m\xEAl\xE9e \u22125, grenade +5, super +5), deux changements", deux.delta.classe === 5 && deux.delta.sante === -10 && deux.delta.melee === -5 && deux.delta.grenade === 5 && deux.delta.super === 5 && deux.nbChangements === 2, deux);
var ignores = statsSimulees(db, casque, { 2: { choisi: 7411, effectif: 7411 }, 0: { choisi: 9999, effectif: 9999 }, 4: { choisi: 7432, effectif: 7432 }, 3: { choisi: 424242, effectif: 424242 } });
ok("SONT IGNOR\xC9S : un choix \xE9gal au plug \xE9quip\xE9, un choix sur une colonne FIXE, sur une colonne COSM\xC9TIQUE, ou sur un plug que l'exemplaire ne propose pas : aucune diff\xE9rence", JSON.stringify(ignores.delta) === "{}" && ignores.nbChangements === 0, ignores);
var fixeMulti = { ...casque, plugsDisponiblesParColonne: { ...casque.plugsDisponiblesParColonne, 1: [7402, 7412, 7413] } };
var csFixeMulti = colonnesArmure(db, fixeMulti);
ok("UN EMPLACEMENT FIXE auquel l'exemplaire proposerait PLUSIEURS plugs (l'am\xE9lioration d'armure, trois plugs list\xE9s) reste FIXE et non modifiable : la r\xE8gle l'emporte sur la donn\xE9e ; ses plugs sont list\xE9s mais le choix d'un autre plug est IGNOR\xC9 dans le calcul des statistiques", col(csFixeMulti, 1).options.length === 3 && col(csFixeMulti, 1).fixe && !col(csFixeMulti, 1).modifiable && JSON.stringify(statsSimulees(db, fixeMulti, { 1: { choisi: 7412, effectif: 7412 } }).delta) === "{}", csFixeMulti.map((c) => [c.socketIndex, c.options.length, c.fixe, c.modifiable]));
var copieStats = JSON.stringify(casque.stats);
statsSimulees(db, casque, { 2: { choisi: 7413, effectif: 7413 } });
ok("le calcul ne MODIFIE jamais la pi\xE8ce r\xE9elle (ses statistiques et ses plugs restent ceux de l'inventaire)", JSON.stringify(casque.stats) === copieStats && JSON.stringify(casque.perkHashes) === "[7401,7402,7411,7421,7431]");
var exo = statsSimulees(db, plastron, { 2: { choisi: 7411, effectif: 7411 } });
ok("armure exotique : le mod de sant\xE9 \xE0 la place du mod de classe donne sant\xE9 +10 et classe \u221210", exo.delta.sante === 10 && exo.delta.classe === -10 && exo.simulees.sante === 40, exo);
var d = diagnosticArmure(db, inconnu);
ok("DIAGNOSTIC (npm run dev) : il d\xE9crit la pi\xE8ce, sa saison (filigrane et seasonHash), ses statistiques, et PRISE PAR PRISE la cat\xE9gorie, le plug \xE9quip\xE9, les plugs disponibles et le jugement \xAB cosm\xE9tique / fixe / modifiable \xBB (cosm\xE9tiques compris) ; un plug illisible est signal\xE9", /Armure : Casque de bastion d'essai \(hash 5301\)/.test(d) && /Saison : seasonHash = 9001 → Saison de la Sorcière, n° 22 \| filigrane : \/img\/saison-sorciere\.png/.test(d) && /Statistiques réelles : sante 20/.test(d) && /prise 2 \| catégorie « Mods d'armure » \| équipé : Mod de santé \(hash 7411.*disponibles : 3.*cosmétique : non \| fixe : non \| modifiable : OUI/.test(d) && /prise 0 .*fixe : oui \| modifiable : non/.test(d) && /prise 4 .*cosmétique : oui/.test(d) && /prise 9 \| plug illisible dans le Manifest \(hash 999999\)/.test(d), d);
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);

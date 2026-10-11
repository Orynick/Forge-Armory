// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - TYPE D'UNE ARME QUAND LE MANIFEST NE LE DIT PAS DIRECTEMENT.
//
// Cas signalé par l'utilisateur (05/10/2026) : il possède DEUX « Lance de Polaris ». L'une affiche son icône de type d'arme ; l'autre
// affiche le badge « type d'arme absent du Manifeste pour cet objet » avec pour seule catégorie le numéro 3109687656. Les deux ont donc
// des définitions (des hashes) différentes dans le Manifest : la seconde n'a ni texte de type ni catégorie d'arme.
// ⚠️ ÉLUCIDÉ (06/10/2026) grâce au rapport de l'utilisateur : la seconde copie est une définition FACTICE (« Dummy », `itemType` 20, catégorie
// 3109687656) : le Manifest en compte 7 pour « Lance de Polaris » (rareté 5, seau d'énergie, aucune autre catégorie), 11 pour « Le Lapin de Jade »,
// 35 au total pour 39 armes de la liste. Elles imitent une arme sans en être une. Le mécanisme de repli ci-dessous reste le bon traitement d'une copie
// factice POSSÉDÉE : son type vient d'une autre définition du même nom, ou de son sous-type.
//
// Quand le texte de type et les catégories n'ont rien donné, on essaie, dans l'ordre :
//   1. le SOUS-TYPE d'arme de la définition (`itemSubType`, énumération de l'API de Bungie) ;
//   2. une AUTRE définition du MÊME NOM, qui est une arme dont le type se reconnaît (texte, catégories ou sous-type). On ne retient
//      le type que si TOUTES ces définitions s'accordent : deux types différents pour un même nom = aucune icône, jamais une fausse.
// L'étape 2 s'appuie sur l'index de recherche du Manifest, construit au chargement ; elle ne le CONSTRUIT jamais (coûteux : des
// dizaines de milliers de lignes) : tant qu'il n'est pas prêt, elle ne répond rien, sans le mémoriser, et réessaiera.
// Le résultat est mémorisé par objet : appelé à chaque affichage, il ne coûte rien après le premier appel.
// EN: ⚠️ ADDED - A WEAPON'S TYPE WHEN THE MANIFEST DOES NOT STATE IT. Tries the weapon sub-type, then another same-name weapon
// definition whose type is recognised, keeping it only if ALL such definitions agree. Never builds the search index.

import type { Database } from "sql.js";
import { libelleDepuisCategories, trouverFormeTypeArme, typeArmeReconnu } from "../../components/icones/IconeTypeArme";
import { idSqliteVersHash, obtenirDefinition } from "./download";
import { indexTableDisponible, normaliserRecherche, obtenirIndexTable } from "./search";

const TABLE_OBJETS = "DestinyInventoryItemDefinition";
/** FR : valeur de `itemType` d'une arme dans l'API de Bungie. / EN: `itemType` value of a weapon in Bungie's API. */
const ITEM_TYPE_ARME = 3;
/** FR : nombre maximal de définitions du même nom examinées (garde-fou). / EN: safety cap on same-name definitions examined. */
const MAX_CANDIDATS = 40;

/**
 * FR : `itemSubType` (énumération `DestinyItemSubType` de l'API de Bungie, valeurs relevées dans sa documentation, NON revérifiées
 * sur le Manifest ici) -> libellé français que la reconnaissance du type d'arme comprend. N'est consulté qu'en dernier recours : une
 * valeur inexacte ne peut donc rien casser d'une arme déjà reconnue.
 * EN: `itemSubType` (Bungie API enum, values from its documentation, NOT rechecked on the Manifest here) -> French label.
 */
export const LIBELLES_SOUS_TYPE_ARME: Readonly<Record<number, string>> = {
  6: "Fusil automatique",
  7: "Fusil à pompe",
  8: "Mitrailleuse",
  9: "Arme de poing",
  10: "Lance-roquettes",
  11: "Fusil à fusion",
  12: "Fusil de précision",
  13: "Fusil à impulsion",
  14: "Fusil d'éclaireur",
  17: "Pistolet",
  18: "Épée",
  22: "Fusil à fusion linéaire",
  23: "Lance-grenades",
  24: "Pistolet-mitrailleur",
  25: "Fusil à rayon",
  31: "Arc",
  33: "Glaive",
};

interface DefArme {
  hash?: number;
  displayProperties?: { name?: string };
  itemTypeDisplayName?: string;
  itemCategoryHashes?: number[];
  itemType?: number;
  itemSubType?: number;
  inventory?: { bucketTypeHash?: number; tierType?: number };
}

/** FR : libellé de type d'une définition, par texte, puis catégories, puis sous-type ; undefined si aucun ne donne rien. / EN: type label of a definition. */
export function libelleTypeDeDefinition(def: DefArme): string | undefined {
  if (def.itemTypeDisplayName && typeArmeReconnu(def.itemTypeDisplayName)) return def.itemTypeDisplayName;
  const parCategorie = libelleDepuisCategories(def.itemCategoryHashes);
  if (parCategorie) return parCategorie;
  return def.itemSubType !== undefined ? LIBELLES_SOUS_TYPE_ARME[def.itemSubType] : undefined;
}

const cleNom = (nom: string): string => normaliserRecherche(nom).replace(/\s+/g, " ").trim();
/** FR : deux libellés désignent-ils la même icône de type ? (compare les formes, pas les mots). / EN: do two labels designate the same type icon? */
const cleForme = (libelle: string): string => JSON.stringify(trouverFormeTypeArme(libelle) ?? libelle);

/**
 * FR : étape 2 : le type commun des AUTRES définitions du même nom (armes dont le type se reconnaît), ou undefined. `pret` indique si
 * l'index était disponible (sinon on n'a rien pu conclure et le résultat ne doit pas être mémorisé).
 * EN: step 2: the common type of OTHER same-name weapon definitions, or undefined.
 */
export function typeParNom(db: Database, hash: number, nom: string): { libelle?: string; pret: boolean } {
  if (!indexTableDisponible(db, TABLE_OBJETS)) return { pret: false };
  const cle = cleNom(nom);
  if (!cle) return { pret: true };
  // FR : le pré-filtre cherche le nom tel qu'il est écrit dans le JSON (normalisé : accents et casse ignorés, MAIS espaces conservés) ;
  // deux versions d'un même objet portent le même texte. La comparaison exacte (espaces réduits) se fait après lecture de la définition.
  // Limite connue : deux noms qui ne diffèrent QUE par leur espacement ne sont pas rapprochés (aucune icône, jamais une fausse).
  // EN: the pre-filter looks for the name as written in the JSON (accents/case ignored, spaces kept); known limit: names differing only by spacing are not matched.
  const brut = normaliserRecherche(nom);
  const formes = new Map<string, string>();
  let examines = 0;
  for (const ligne of obtenirIndexTable(db, TABLE_OBJETS)) {
    if (!ligne.jsonNormalise.includes(brut) && (cle === brut || !ligne.jsonNormalise.includes(cle))) continue;
    const autreHash = idSqliteVersHash(ligne.id);
    if (autreHash === hash) continue;
    if (++examines > MAX_CANDIDATS) break;
    const def = obtenirDefinition<DefArme>(db, TABLE_OBJETS, autreHash);
    if (!def || def.itemType !== ITEM_TYPE_ARME || cleNom(def.displayProperties?.name ?? "") !== cle) continue;
    const libelle = libelleTypeDeDefinition(def);
    if (libelle) formes.set(cleForme(libelle), libelle);
  }
  return formes.size === 1 ? { libelle: [...formes.values()][0], pret: true } : { pret: true };
}

export interface SecoursTypeArme {
  /** FR : libellé de type à utiliser en dernier recours ; absent si le texte ou les catégories suffisaient, ou si rien n'a été trouvé. / EN: last-resort type label. */
  typeSecours?: string;
  /** FR : description technique de l'objet, pour le badge de diagnostic. / EN: technical description of the item. */
  infoObjet: string;
}

const MEMO = new WeakMap<Database, Map<number, SecoursTypeArme>>();

/** FR : description technique d'une définition, pour le badge de diagnostic. / EN: technical description for the diagnostic badge. */
export function decrireObjet(hash: number, def: DefArme | undefined): string {
  if (!def) return `objet ${hash} : définition introuvable dans le Manifest`;
  const f = (v: unknown) => (v === undefined || v === null || v === "" ? "—" : String(v));
  const categories = def.itemCategoryHashes && def.itemCategoryHashes.length > 0 ? def.itemCategoryHashes.join(", ") : "—";
  return `objet ${hash} (« ${f(def.displayProperties?.name)} ») ; type ${f(def.itemType)} ; sous-type ${f(def.itemSubType)} ; seau ${f(def.inventory?.bucketTypeHash)} ; texte de type « ${f(def.itemTypeDisplayName)} » ; rareté ${f(def.inventory?.tierType)} ; catégories ${categories}`;
}

/**
 * FR : point d'entrée, appelé à chaque affichage d'une icône de type d'arme (résultat mémorisé par objet). Ne fait rien de coûteux si
 * le texte ou les catégories de l'objet suffisent déjà.
 * EN: entry point, called on each weapon-type icon render (memoised per item).
 */
export function obtenirSecoursTypeArme(db: Database, hash: number): SecoursTypeArme {
  let memo = MEMO.get(db);
  if (!memo) {
    memo = new Map();
    MEMO.set(db, memo);
  }
  const dejaVu = memo.get(hash);
  if (dejaVu) return dejaVu;

  const def = obtenirDefinition<DefArme>(db, TABLE_OBJETS, hash);
  const infoObjet = decrireObjet(hash, def);
  // FR : texte ou catégories suffisent : aucun secours nécessaire (et rien d'autre à calculer).
  if (def && (typeArmeReconnu(def.itemTypeDisplayName) || libelleDepuisCategories(def.itemCategoryHashes))) {
    const resultat = { infoObjet };
    memo.set(hash, resultat);
    return resultat;
  }
  let typeSecours: string | undefined = def?.itemSubType !== undefined ? LIBELLES_SOUS_TYPE_ARME[def.itemSubType] : undefined;
  let aMemoriser = true;
  if (!typeSecours && def?.displayProperties?.name) {
    const parNom = typeParNom(db, hash, def.displayProperties.name);
    typeSecours = parNom.libelle;
    aMemoriser = parNom.pret; // FR : index pas encore prêt : on réessaiera au prochain affichage / EN: index not ready: retry next render
  }
  const resultat = { typeSecours, infoObjet };
  if (aMemoriser) memo.set(hash, resultat);
  return resultat;
}

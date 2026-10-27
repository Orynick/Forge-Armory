// FR : ⚠️ AJOUT (13/10/2026, v0.4.6) - SIMULATION LOCALE des perks et du mod d'une arme possédée (Forge, vue Inventaire ; spécification du 12/10/2026, Phase 1 : « aucune écriture vers l'API Bungie », sélection « stockée localement et rechargée au démarrage »).
// MODÈLE : pour chaque exemplaire possédé (`itemInstanceId`), et pour chaque COLONNE (clé = `socketIndex`, jamais « colonne 1, 2, 3 » : leur numéro n'est pas stable d'une arme à l'autre), UN SEUL choix : `choisi` = le perk de BASE choisi (celui qu'on voit et qu'on clique), `effectif` = le perk réellement à compter dans le build (sa VERSION AMÉLIORÉE si l'arme est une arme « améliorée », sinon le même).
// RÈGLE DE VERSION : une arme est « améliorée » si au moins un perk de son roll RÉEL est une version améliorée (lu dans les colonnes) : aucune lecture du palier ou du masterwork n'est nécessaire. Garantie réaliste : UNE perk par colonne, prise dans le pool de CETTE colonne (le Manifest ne donne aucune règle d'exclusion entre colonnes).
// Rien n'est jamais envoyé à Bungie. Les fonctions de ce fichier sont PURES (le stockage est fourni par l'appelant) ; l'écriture est tolérante aux erreurs (navigateur sans stockage, quota plein). EN: ⚠️ ADDED - local simulation of an owned weapon's perks/mod: one choice per column (socketIndex), `effectif` = enhanced twin when the weapon is an enhanced one; nothing is ever sent to Bungie.

export interface ChoixColonne { choisi: number; effectif: number }
export type SimulationArme = Record<number, ChoixColonne>;
/** FR : ⚠️ AJOUT (branche draft-mod-armures) - simulation d'une ARMURE : même choix par prise (`socketIndex`), mais SANS version améliorée (les mods d'armure n'en ont pas : `choisi` et `effectif` sont identiques). / EN: armor simulation: same per-socket choice, but no enhanced version (armor mods have none). */
export type SimulationArmure = Record<number, ChoixColonne>;
export interface Simulations {
  version: 2;
  armes: Record<string, SimulationArme>;
  /** FR : ⚠️ AJOUT (branche draft-mod-armures) - simulations des ARMURES possédées, clé = identifiant d'exemplaire, même magasin que les armes. Absent en version 1 (migration en lecture). / EN: owned armor simulations; absent in v1 (migrated on read). */
  armures?: Record<string, SimulationArmure>;
}
export interface Stockage { getItem(cle: string): string | null; setItem(cle: string, valeur: string): void }

export const CLE_STOCKAGE_SIMULATIONS = "forge-armory.forge.simulations.v1";
export const SIMULATIONS_VIDES = (): Simulations => ({ version: 2, armes: {}, armures: {} });

/** FR : le stockage du navigateur, ou une mémoire de secours qui ne persiste pas (stockage interdit ou indisponible). / EN: browser storage, or a non-persistent in-memory fallback. */
export function stockageNavigateur(): Stockage {
  try {
    const s = window.localStorage; s.getItem(CLE_STOCKAGE_SIMULATIONS);
    return s;
  } catch {
    const m = new Map<string, string>();
    return { getItem: (c) => m.get(c) ?? null, setItem: (c, v) => void m.set(c, v) };
  }
}

const entierPositif = (x: unknown): x is number => typeof x === "number" && Number.isInteger(x) && x >= 0;

/** FR : ⚠️ AJOUT (branche draft-mod-armures) - lit un bloc de simulations (armes OU armures) : les entrées invalides sont ignorées une à une. / EN: reads a simulations block (weapons OR armor). */
function lireBloc(brut: unknown): Record<string, SimulationArme> {
  const sortie: Record<string, SimulationArme> = {};
  if (typeof brut !== "object" || brut === null) return sortie;
  for (const [instance, colonnes] of Object.entries(brut as Record<string, Record<string, { c?: unknown; e?: unknown }>>)) {
    if (typeof colonnes !== "object" || colonnes === null) continue;
    const sim: SimulationArme = {};
    for (const [socket, v] of Object.entries(colonnes)) {
      const idx = Number(socket);
      if (entierPositif(idx) && entierPositif(v?.c) && entierPositif(v?.e)) sim[idx] = { choisi: v.c, effectif: v.e };
    }
    if (Object.keys(sim).length > 0) sortie[instance] = sim;
  }
  return sortie;
}

/** FR : lit les simulations ; tout contenu illisible ou mal formé donne une simulation VIDE (jamais d'erreur), et les entrées invalides sont ignorées une à une. ⚠️ AJOUT (branche draft-mod-armures) - MIGRATION : un contenu en version 1 (sans `armures`) est accepté tel quel : les simulations d'armures écrites par la 0.4.12 vivaient dans `armes` (le magasin était partagé, sans distinction) ; elles sont RECLASSÉES dans `armures` à la lecture, par la présence de la clé dans le nouveau bloc. Un contenu sans `armures` garde ses entrées `armes` telles quelles (les anciennes simulations d'armures y étaient mélangées : elles y restent, inertes pour le score — voir `appliquerSimulations`). / EN: tolerant read; v1 content (no `armures`) is accepted and migrated. */
export function lireSimulations(stockage: Stockage): Simulations {
  try {
    const brut = stockage.getItem(CLE_STOCKAGE_SIMULATIONS);
    if (!brut) return SIMULATIONS_VIDES();
    const o = JSON.parse(brut) as { version?: unknown; armes?: unknown; armures?: unknown };
    if ((o?.version !== 1 && o?.version !== 2) || typeof o.armes !== "object" || o.armes === null) return SIMULATIONS_VIDES();
    const sortie = SIMULATIONS_VIDES();
    sortie.armes = lireBloc(o.armes);
    if (typeof o.armures === "object" && o.armures !== null) sortie.armures = lireBloc(o.armures);
    return sortie;
  } catch {
    return SIMULATIONS_VIDES();
  }
}

/** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - écrit les simulations (format compact `c` = choisi, `e` = effectif), armes ET armures ; renvoie faux si le stockage refuse (rien ne casse). / EN: writes; false if storage refuses. */
export function ecrireSimulations(stockage: Stockage, s: Simulations): boolean {
  try {
    const compact = (bloc: Record<string, SimulationArme>) => Object.fromEntries(Object.entries(bloc).map(([instance, sim]) => [instance, Object.fromEntries(Object.entries(sim).map(([k, v]) => [k, { c: v.choisi, e: v.effectif }]))]));
    stockage.setItem(CLE_STOCKAGE_SIMULATIONS, JSON.stringify({ version: 2, armes: compact(s.armes), armures: compact(s.armures ?? {}) }));
    return true;
  } catch {
    return false;
  }
}

/** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - `partie` distingue les ARMES (`"armes"`) des ARMURES (`"armures"`) : le choix est enregistré dans le bon bloc. Par défaut `"armes"` (les appels existants ne changent pas). / EN: `partie` distinguishes weapons from armor; defaults to `"armes"`. */
export function choisir(s: Simulations, instance: string, socketIndex: number, choix: ChoixColonne, partie: "armes" | "armures" = "armes"): Simulations {
  if (partie === "armures") return { version: 2, armes: s.armes, armures: { ...(s.armures ?? {}), [instance]: { ...(s.armures?.[instance] ?? {}), [socketIndex]: choix } } };
  return { version: 2, armes: { ...s.armes, [instance]: { ...(s.armes[instance] ?? {}), [socketIndex]: choix } }, armures: s.armures };
}
/** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - idem `choisir`, avec la partie. / EN: same as `choisir`, with the part. */
export function retirerColonne(s: Simulations, instance: string, socketIndex: number, partie: "armes" | "armures" = "armes"): Simulations {
  if (partie === "armures") {
    const sim = { ...(s.armures?.[instance] ?? {}) }; delete sim[socketIndex];
    const armures = { ...(s.armures ?? {}) };
    if (Object.keys(sim).length > 0) armures[instance] = sim; else delete armures[instance];
    return { version: 2, armes: s.armes, armures };
  }
  const arme = { ...(s.armes[instance] ?? {}) }; delete arme[socketIndex];
  const armes = { ...s.armes };
  if (Object.keys(arme).length > 0) armes[instance] = arme; else delete armes[instance];
  return { version: 2, armes, armures: s.armures };
}
/** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - idem, avec la partie. / EN: same, with the part. */
export function reinitialiserArme(s: Simulations, instance: string, partie: "armes" | "armures" = "armes"): Simulations {
  if (partie === "armures") { const armures = { ...(s.armures ?? {}) }; delete armures[instance]; return { version: 2, armes: s.armes, armures }; }
  const armes = { ...s.armes }; delete armes[instance]; return { version: 2, armes, armures: s.armures };
}
/** FR : ⚠️ CHANGÉ (branche draft-mod-armures) - `partie` : les colonnes simulées d'une arme OU d'une armure. / EN: `partie`: simulated columns of a weapon OR an armor. */
export const nbColonnesSimulees = (s: Simulations, instance: string, partie: "armes" | "armures" = "armes"): number => Object.keys((partie === "armures" ? s.armures : s.armes)?.[instance] ?? {}).length;
export const armesSimulees = (s: Simulations): string[] => Object.keys(s.armes);
/** FR : ⚠️ AJOUT (branche draft-mod-armures) - identifiants d'exemplaires d'ARMURES simulées. / EN: instance ids of simulated armors. */
export const armuresSimulees = (s: Simulations): string[] => Object.keys(s.armures ?? {});

interface OptionLue { equipeEnJeu?: boolean }
interface ItemLu { option: OptionLue & { hash: number }; ameliore?: OptionLue & { hash: number } }

/** FR : vrai si ce perk (ou sa version améliorée) fait partie du roll RÉEL de l'arme. / EN: true if this perk (or its enhanced twin) is part of the weapon's REAL roll. */
export const estLeRollReel = (item: ItemLu): boolean => !!(item.option.equipeEnJeu || item.ameliore?.equipeEnJeu);

/** FR : une arme est « améliorée » si au moins un perk de son roll réel est une version AMÉLIORÉE (l'amélioré fait partie du roll). / EN: an enhanced weapon has at least one real perk that is an enhanced twin. */
export const armeEstAmelioree = (colonnes: ItemLu[][]): boolean => colonnes.some((items) => items.some((i) => !!i.ameliore?.equipeEnJeu));

/** FR : le perk à COMPTER dans le build pour ce choix : la version améliorée si l'arme est améliorée ET que ce perk en a une, sinon le perk lui-même. / EN: the hash to count in the build for this choice. */
export const choixEffectif = (item: ItemLu, armeAmelioree: boolean): number => (armeAmelioree && item.ameliore ? item.ameliore.hash : item.option.hash);

/**
 * FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - LES QUATRE NIVEAUX d'un perk dans la vue Inventaire de la Forge (demande de l'utilisateur du 13/10/2026) :
 *   `reel`       : fait partie du roll réel équipé en jeu (petite coche ✓) ;
 *   `simule`     : choisi pour la simulation (doré) ;
 *   `disponible` : DISPONIBLE sur cet exemplaire (il peut le porter dans cette prise : on pourrait l'équiper en jeu) mais non sélectionné en jeu : contour gris clair ;
 *   `possible`   : possible sur le MODÈLE de l'arme (pool du Manifest) mais pas disponible sur cet exemplaire : nom grisé ;
 *   `inconnu`    : la disponibilité sur l'exemplaire n'a pas été lue (`disponibles` absent) : on n'affirme rien, aucun grisé.
 * Priorité : simulé, puis réel, puis disponible, puis possible. Pour une paire (base + version améliorée), « disponible » vaut si l'UNE des deux versions l'est. EN: ⚠️ ADDED - the four perk levels in the Forge Inventory view.
 */
export type NiveauPerk = "reel" | "simule" | "disponible" | "possible" | "inconnu";
export function niveauDePerk(item: ItemLu, socketIndex: number, disponibles: Record<number, number[]> | undefined, choixSimule?: ChoixColonne): NiveauPerk {
  if (choixSimule && choixSimule.choisi === item.option.hash) return "simule";
  if (estLeRollReel(item)) return "reel";
  if (!disponibles) return "inconnu";
  const liste = disponibles[socketIndex] ?? [];
  return liste.includes(item.option.hash) || (item.ameliore ? liste.includes(item.ameliore.hash) : false) ? "disponible" : "possible";
}

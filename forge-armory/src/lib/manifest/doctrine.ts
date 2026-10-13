// FR : Decouverte des sous-classes possedees, et de leurs options
// d'aspects/fragments/super/melee/grenade/competence de classe, via le
// Manifest + l'inventaire reel. Construit sur des bases verifiees
// (bucket "Subclass" = 3284755031, confirme par un ticket GitHub officiel
// Bungie) mais avec une part d'heuristique (identification des categories
// de socket par texte, comme deja fait ailleurs dans le projet pour les
// stats) - a confirmer en conditions reelles.
//
// EN: Discovery of owned subclasses, and their aspect/fragment/super/
// melee/grenade/class-ability options, via the Manifest + real inventory.
// Built on verified ground (the "Subclass" bucket = 3284755031, confirmed
// via an official Bungie GitHub issue) but with some heuristics (socket
// category identification by text, as already done elsewhere in this
// project for stats) - to be confirmed in real conditions.

import { Database } from "sql.js";
import { obtenirDefinition } from "./download";
import { normaliser, urlIcone } from "./search";
import { championDeReference } from "./antiChampionExotiques";
import type { TypeMunition } from "../../components/icones/IconeMunition";
import { DestinyItemDefinition, DestinySocketCategoryDefinition, DestinyPlugSetDefinition } from "../../types/manifest";
import { SubclassConfig, StatKey, DamageElement } from "../../types/build";
import { BUCKET_HASH_SOUS_CLASSE, BUCKET_HASH_VERS_SLOT } from "../../data/constantesManifest";
import { DestinyMembership } from "../bungie/api";
import { obtenirAccessTokenValide } from "../bungie/oauth";
import { BUNGIE_API_ROOT, bungieConfig } from "../bungie/config";

export type CategorieSocket = "super" | "aspect" | "fragment" | "melee" | "grenade" | "classe" | "saut" | "autre";

// FR : identification par texte plutôt que par hash de catégorie deviné -
// même logique de robustesse que LIBELLES_STAT dans inventaire.ts.
// ⚠️ ÉLARGI (03/08/2026) : l'utilisateur a signalé que mêlée/grenade/
// classe/saut n'apparaissaient pas du tout - mots-clés élargis + ajout de
// "saut" (catégorie manquante), et surtout on n'ignore plus les
// catégories non reconnues (voir plus bas : affichées avec leur vrai nom
// au lieu d'être masquées).
const LIBELLES_CATEGORIE_SOCKET: Record<CategorieSocket, string[]> = {
  super: ["super"],
  aspect: ["aspect"],
  fragment: ["fragment"],
  melee: ["corps a corps", "melee"],
  grenade: ["grenade"],
  classe: ["competence de classe", "class ability", "classe"],
  saut: ["saut", "jump"],
  autre: [],
};

function devinerCategorieSocket(nomCategorie: string): CategorieSocket {
  const nomNormalise = normaliser(nomCategorie);
  for (const [cle, libelles] of Object.entries(LIBELLES_CATEGORIE_SOCKET) as [CategorieSocket, string[]][]) {
    if (cle === "autre") continue;
    if (libelles.some((l) => nomNormalise.includes(l))) return cle;
  }
  return "autre";
}

/** FR : libellé français utilisé quand on identifie une catégorie via le texte d'une OPTION (pas du nom de la catégorie parente). / EN: French label used when a category is identified via an OPTION's text (not the parent category's name). */
const LIBELLES_CATEGORIE_SOCKET_AFFICHAGE: Record<CategorieSocket, string> = {
  super: "Super",
  aspect: "Aspects",
  fragment: "Fragments",
  melee: "Mêlée",
  grenade: "Grenade",
  classe: "Compétence de classe",
  saut: "Saut",
  autre: "Autre",
};

export interface OptionSocket {
  hash: number;
  nom: string;
  description: string;
  icone?: string;
  /** FR : true si c'est réellement ce qui est équipé en jeu en ce moment (pas juste sélectionné dans l'outil). / EN: true if this is what's actually equipped in-game right now (not just selected in the tool). */
  equipeEnJeu?: boolean;
}

export interface GroupeSocket {
  categorie: CategorieSocket;
  /** FR : nom réel de la catégorie tel que trouvé dans le Manifest - utilisé pour l'affichage quand categorie === "autre". / EN: real category name as found in the Manifest - used for display when categorie === "autre". */
  nomReel: string;
  /** FR : nombre de sockets réels sous cette catégorie = nombre d'options sélectionnables. / EN: number of real sockets under this category = number of selectable options. */
  nbSlots: number;
  options: OptionSocket[];
}

/**
 * FR : Ordre d'affichage demandé par l'utilisateur, partagé entre le bloc
 * "Doctrine (Pilier 1)" et la section Doctrine de "Mon Build" pour la
 * cohérence : Super+Aspects, Saut+Compétence de classe, Mêlée+Grenade,
 * puis Fragments seuls.
 * EN: Display order requested by the user, shared between the "Doctrine
 * (Pillar 1)" block and "Mon Build"'s Doctrine section for consistency:
 * Super+Aspects, Jump+Class Ability, Melee+Grenade, then Fragments alone.
 */
export const ORDRE_AFFICHAGE_CATEGORIES: CategorieSocket[][] = [
  ["super", "aspect"],
  ["saut", "classe"],
  ["melee", "grenade"],
  ["fragment"],
];

/**
 * FR : Pour une sous-classe donnée (hash), regroupe ses sockets par
 * catégorie (Super/Aspects/Fragments/Mêlée/Grenade/Compétence de classe/
 * Saut) et résout les options disponibles pour chacune.
 *
 * ⚠️ CORRIGÉ (03/08/2026) : le code fusionnait TOUS les sockets d'une même
 * catégorie brute Bungie en une seule liste - or Bungie regroupe souvent
 * Saut+Mêlée+Grenade+Compétence de classe sous UNE SEULE catégorie
 * générique ("Compétences"), ce qui mélangeait tout. On identifie
 * maintenant chaque socket INDIVIDUELLEMENT : si le nom de la catégorie
 * parente est générique, on regarde le premier objet résolu DANS CE
 * SOCKET PRÉCIS (son propre itemTypeDisplayName) pour savoir de quoi il
 * s'agit réellement, avant de regrouper.
 *
 * EN: For a given subclass (hash), groups its sockets by category (Super/
 * Aspects/Fragments/Melee/Grenade/Class Ability/Jump) and resolves the
 * available options for each.
 *
 * ⚠️ FIXED (2026-08-03): the code merged ALL sockets of the same raw
 * Bungie category into a single list - but Bungie often groups Jump+
 * Melee+Grenade+Class Ability under ONE generic category ("Abilities"),
 * which mixed everything together. Each socket is now identified
 * INDIVIDUALLY: if the parent category's name is generic, we look at the
 * first resolved item IN THAT SPECIFIC SOCKET (its own itemTypeDisplayName)
 * to figure out what it actually is, before grouping.
 */
export function obtenirOptionsSousClasse(
  db: Database,
  subclassHash: number,
  hashesEquipesEnJeu: number[] = []
): GroupeSocket[] {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", subclassHash);
  if (!def?.sockets) return [];

  // FR : accumulateur global (pas par catégorie brute) - la clé est la
  // catégorie RÉSOLUE (au niveau du socket, pas de la catégorie parente).
  // EN: global accumulator (not per raw category) - the key is the
  // RESOLVED category (at the socket level, not the parent category).
  const groupesParCategorie = new Map<string, { categorie: CategorieSocket; nomReel: string; nbSlots: number; optionsParHash: Map<number, OptionSocket> }>();

  for (const cat of def.sockets.socketCategories ?? []) {
    const catDef = obtenirDefinition<DestinySocketCategoryDefinition>(
      db,
      "DestinySocketCategoryDefinition",
      cat.socketCategoryHash
    );
    const nomCategorieParente = catDef?.displayProperties?.name ?? "Catégorie inconnue";
    const categorieParente = devinerCategorieSocket(nomCategorieParente);

    for (const indexSocket of cat.socketIndexes) {
      const entree = def.sockets.socketEntries[indexSocket];
      if (!entree) continue;

      // FR : deux mécanismes possibles - liste directe, ou pool partagé (PlugSet).
      // EN: two possible mechanisms - direct list, or shared pool (PlugSet).
      let hashesOptions: number[] = (entree.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      if (hashesOptions.length === 0 && entree.reusablePlugSetHash) {
        const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.reusablePlugSetHash);
        hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      }
      if (hashesOptions.length === 0 && entree.randomizedPlugSetHash) {
        const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.randomizedPlugSetHash);
        hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      }
      // FR : ⚠️ AJOUT (03/08/2026) - repli sur l'option unique fixe
      // (ex: Super de Stase, sans choix possible) quand ni liste directe
      // ni pool partagé n'existent - corrige "Super absent pour la Stase".
      // EN: ⚠️ ADDED (2026-08-03) - fallback to the single fixed option
      // (e.g. Stasis Super, no choice possible) when neither a direct
      // list nor a shared pool exists - fixes "Super missing for Stasis".
      if (hashesOptions.length === 0 && entree.singleInitialItemHash) {
        hashesOptions = [entree.singleInitialItemHash];
      }
      if (hashesOptions.length === 0) continue;

      // FR : résout les options de CE socket précis d'abord (pour pouvoir
      // deviner sa vraie nature via le premier objet trouvé).
      // EN: resolves THIS specific socket's options first (to be able to
      // guess its real nature via the first item found).
      const optionsDuSocket: OptionSocket[] = [];
      for (const hashOption of hashesOptions) {
        const defOption = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", hashOption);
        if (!defOption?.displayProperties?.name) continue;

        // FR : ⚠️ CORRIGÉ (03/08/2026) - pas d'infobulle sur Aspects/
        // Fragments : leur `displayProperties.description` est souvent
        // vide, le vrai texte d'effet étant décrit sur un PERK LIÉ
        // (`perks[0].perkHash`) plutôt que sur l'objet lui-même. Repli sur
        // ce perk lié si la description directe est vide.
        // EN: ⚠️ FIXED (2026-08-03) - no tooltip on Aspects/Fragments:
        // their `displayProperties.description` is often empty, the real
        // effect text being described on a LINKED PERK (`perks[0].perkHash`)
        // rather than the item itself. Falls back to that linked perk if
        // the direct description is empty.
        // FR : ⚠️ CORRIGÉ (03/08/2026, v2) - le repli ne se déclenchait que
        // si la description DIRECTE était vide. Pour un Catalyseur, elle
        // ne l'est pas (elle contient le texte de déblocage "Éliminez des
        // cibles..."), donc le repli ne servait jamais - masquant l'effet
        // réel. Le perk lié est maintenant tenté EN PREMIER, la
        // description directe ne sert plus que de repli.
        // EN: ⚠️ FIXED (2026-08-03, v2) - the fallback only triggered if
        // the DIRECT description was empty. For a Catalyst, it isn't (it
        // contains the unlock text "Defeat targets..."), so the fallback
        // never kicked in - hiding the real effect. The linked perk is now
        // tried FIRST, the direct description only serves as a fallback.
        // FR : ⚠️ CORRIGÉ (03/08/2026, v3) - ne regarder QUE perks[0] ne
        // suffisait toujours pas pour le Catalyseur : plusieurs perks liés
        // existent parfois (un pour le suivi de progression, un autre pour
        // l'effet réel une fois débloqué). On essaie maintenant TOUS les
        // perks liés et on garde la description la plus longue - le texte
        // d'effet réel est généralement plus détaillé qu'un simple texte
        // de suivi ("Éliminez X cibles...").
        // EN: ⚠️ FIXED (2026-08-03, v3) - looking ONLY at perks[0] still
        // wasn't enough for the Catalyst: several linked perks sometimes
        // exist (one for progress tracking, another for the real effect
        // once unlocked). We now try ALL linked perks and keep the
        // longest description - the real effect text is usually more
        // detailed than a simple tracking blurb ("Defeat X targets...").
        // FR : ⚠️ CORRIGÉ (04/08/2026, v4) - "garder le plus long" ne
        // suffisait toujours pas pour le Catalyseur (capture d'écran à
        // l'appui) - probablement parce que le texte de DÉBLOCAGE est en
        // fait plus long que l'effet réel, inversant mon critère. Plutôt
        // que re-deviner un sens, on concatène maintenant TOUT ce qui est
        // disponible (description directe + tous les perks liés) : rien
        // n'est caché, même si le texte de déblocage reste visible en plus
        // de l'effet (mieux que l'inverse : effet manquant).
        // EN: ⚠️ FIXED (2026-08-04, v4) - "keep the longest" still wasn't
        // enough for the Catalyst (screenshot evidence) - likely because
        // the UNLOCK text is actually longer than the real effect,
        // inverting my criterion. Rather than re-guessing a direction, we
        // now concatenate EVERYTHING available (direct description + all
        // linked perks): nothing is hidden, even if the unlock text stays
        // visible alongside the effect (better than the reverse: missing
        // effect).
        const resolu = obtenirDescriptionComplete(db, hashOption);
        let description = resolu.description;
        if (resolu.estOrnement) continue; // ⚠️ ornement (ex: "Vœux de malheur") - jamais affiché comme option de build

        // FR : ⚠️ AJOUT (03/08/2026) - certains fragments donnent aussi un
        // bonus de stat (ex: "Écho d'Expulsion" -> +10 Super), en plus de
        // leur effet textuel - ajouté à la description pour qu'il
        // apparaisse dans l'infobulle.
        // EN: ⚠️ ADDED (2026-08-03) - some fragments also grant a stat
        // bonus (e.g. "Echo of Expulsion" -> +10 Super), on top of their
        // text effect - added to the description so it shows in the tooltip.
        const bonusStats = obtenirBonusStatsPlug(db, hashOption);
        const texteBonus = texteBonusStats(bonusStats);
        if (texteBonus) description = description ? `${description}\n\n${texteBonus}` : texteBonus;

        optionsDuSocket.push({
          hash: hashOption,
          nom: defOption.displayProperties.name,
          description,
          icone: urlIcone(defOption.displayProperties.icon),
          equipeEnJeu: hashesEquipesEnJeu.includes(hashOption),
          _itemTypeDisplayName: defOption.itemTypeDisplayName,
        } as OptionSocket & { _itemTypeDisplayName?: string });
      }
      if (optionsDuSocket.length === 0) continue;

      // FR : catégorie de CE socket - si le parent est déjà précis
      // (super/aspect/fragment...), on le garde ; sinon on devine via le
      // premier objet trouvé dans ce socket précis.
      // EN: THIS socket's category - if the parent is already specific
      // (super/aspect/fragment...), keep it; otherwise guess via the
      // first item found in this specific socket.
      let categorieSocket = categorieParente;
      let nomAffichage = nomCategorieParente;
      if (categorieParente === "autre") {
        // FR : ⚠️ CORRIGÉ (03/08/2026, v2) - la détection par texte
        // (nom + type d'objet) s'est révélée peu fiable : le Saut se
        // retrouvait classé comme Mêlée (mot-clé trop large "attaque",
        // retiré). L'ordre positionnel conventionnel de Bungie (Saut,
        // Mêlée, Grenade, Compétence de classe) s'est montré exact lors
        // des tests précédents - on lui donne maintenant la PRIORITÉ
        // quand la catégorie a exactement 4 sockets (signature fiable de
        // ce groupe), le texte ne servant plus que de repli pour les cas
        // à un nombre de sockets différent (sous-classes Prismatique
        // notamment, structure potentiellement différente).
        // EN: ⚠️ FIXED (2026-08-03, v2) - text-based detection (name +
        // item type) proved unreliable: Jump ended up classified as
        // Melee (overly broad keyword "attaque", removed). Bungie's
        // conventional positional order (Jump, Melee, Grenade, Class
        // Ability) proved accurate in earlier tests - it now takes
        // PRIORITY when the category has exactly 4 sockets (a reliable
        // signature of this group), text only serving as a fallback for
        // cases with a different socket count (notably Prismatic
        // subclasses, potentially different structure).
        // FR : ⚠️ CORRIGÉ (03/08/2026, v3) - l'ordre était décalé d'un cran
        // (rotation) par rapport à l'ordre réel des sockets Bungie,
        // confirmé en croisant précisément les observations de
        // l'utilisateur (Saut affichait Classe, Mêlée affichait Saut,
        // Grenade affichait Mêlée, Classe affichait Grenade).
        // EN: ⚠️ FIXED (2026-08-03, v3) - the order was shifted by one
        // position (rotation) compared to Bungie's real socket order,
        // confirmed by precisely cross-referencing the user's observations
        // (Jump showed Class content, Melee showed Jump, Grenade showed
        // Melee, Class showed Grenade).
        const ORDRE_POSITION_ABILITES: CategorieSocket[] = ["classe", "saut", "melee", "grenade"];
        if (cat.socketIndexes.length === 4) {
          const position = cat.socketIndexes.indexOf(indexSocket);
          const categoriePosition = ORDRE_POSITION_ABILITES[position];
          if (categoriePosition) {
            categorieSocket = categoriePosition;
            nomAffichage = LIBELLES_CATEGORIE_SOCKET_AFFICHAGE[categoriePosition];
          }
        } else {
          const texteIndice = `${optionsDuSocket[0].nom} ${(optionsDuSocket[0] as any)._itemTypeDisplayName ?? ""}`;
          const categorieDevinee = devinerCategorieSocket(texteIndice);
          if (categorieDevinee !== "autre") {
            categorieSocket = categorieDevinee;
            nomAffichage = LIBELLES_CATEGORIE_SOCKET_AFFICHAGE[categorieDevinee] ?? texteIndice;
          }
        }
      }

      const cleGroupe = categorieSocket === "autre" ? `autre:${nomAffichage}` : categorieSocket;
      let groupe = groupesParCategorie.get(cleGroupe);
      if (!groupe) {
        groupe = { categorie: categorieSocket, nomReel: nomAffichage, nbSlots: 0, optionsParHash: new Map() };
        groupesParCategorie.set(cleGroupe, groupe);
      }
      groupe.nbSlots += 1;
      for (const opt of optionsDuSocket) {
        if (!groupe.optionsParHash.has(opt.hash)) groupe.optionsParHash.set(opt.hash, opt);
      }
    }
  }

  return Array.from(groupesParCategorie.values()).map((g) => ({
    categorie: g.categorie,
    nomReel: g.nomReel,
    nbSlots: g.nbSlots,
    options: Array.from(g.optionsParHash.values()),
  }));
}

/**
 * FR : ⚠️ AJOUT (26/08/2026) - dump texte de TOUTES les options de Super,
 * Mêlée, Grenade, Saut, Compétence de classe et Aspects d'une sous-classe
 * (une catégorie, une ligne par option, format "Nom — Description" déjà
 * utilisé partout ailleurs dans le catalogue de verbes), pour que
 * l'utilisateur puisse le copier-coller directement à Claude plutôt que de
 * capturer des écrans un par un comme pour l'audit des fragments.
 *
 * Demande explicite de l'utilisateur (26/08) : les mêlées/grenades/
 * compétences de classe sont le texte le MOINS bien classé par
 * `sourcePayoff.ts` aujourd'hui (voir le principe des "identités de
 * capacité" dans `CHANGELOG.md`), et ce sont elles qui définissent
 * concrètement ce qu'une capacité APPLIQUE - contrairement aux
 * aspects/fragments qui expriment de vrais synergies conditionnelles.
 *
 * ⚠️ Fragments volontairement EXCLUS : déjà couverts par l'audit à base de
 * captures d'écran (24-26/08, voir `knowledge-base/25_AUDIT_FRAGMENTS.md`).
 * Ce bouton-ci cible spécifiquement le trou restant.
 *
 * EN: ⚠️ ADDED - text dump of ALL Super/Melee/Grenade/Jump/Class Ability/
 * Aspect options for a subclass, so the user can copy-paste it directly to
 * Claude instead of screenshotting one by one like the fragment audit.
 * Fragments deliberately EXCLUDED - already covered by the screenshot
 * audit; this button targets the remaining gap specifically.
 */
export function obtenirDiagnosticTextesDoctrine(groupes: GroupeSocket[]): string {
  const CATEGORIES_CIBLEES: CategorieSocket[] = ["super", "melee", "grenade", "saut", "classe", "aspect"];
  const LIBELLES: Record<CategorieSocket, string> = {
    super: "SUPER",
    melee: "MÊLÉE",
    grenade: "GRENADE",
    saut: "SAUT",
    classe: "COMPÉTENCE DE CLASSE",
    aspect: "ASPECTS",
    fragment: "FRAGMENTS",
    autre: "AUTRE",
  };

  const blocs: string[] = [];
  for (const cat of CATEGORIES_CIBLEES) {
    const groupe = groupes.find((g) => g.categorie === cat);
    if (!groupe || groupe.options.length === 0) continue;

    const lignes = groupe.options.map((o) => `${o.nom} — ${o.description || "(pas de description)"}`);
    blocs.push(`## ${LIBELLES[cat]}\n${lignes.join("\n")}`);
  }

  return blocs.join("\n\n");
}

/**
 * FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - DIAGNOSTIC DES ICÔNES de doctrine (bug « fond bleu de la Stase sur les icônes de saut et de compétence de classe du Filobscur »). Pour la sous-classe choisie : (1) ses prises (sockets) avec leurs listes d'options (plug set réutilisable ou aléatoire, objet fixe, nombre
 * d'options directes) : deux sous-classes qui partagent le même plug set pour le saut ou la compétence de classe partageront les mêmes objets et donc les mêmes icônes ; (2) pour chaque option de saut, compétence de classe, mêlée, grenade et super : nom, hash, catégorie de plug, type d'objet, chemin brut
 * de l'icône, filigrane et nombre de séquences d'icône. À lancer pour la Stase ET le Filobscur puis comparer. Texte à copier à Claude. EN: ⚠️ ADDED - icon diagnostic for a subclass (sockets, plug sets and per-option icon data), to compare Stasis and Strand.
 */
export function obtenirDiagnosticIconesDoctrine(db: Database, subclassItemHash: number | undefined, element: string | null | undefined, groupes: GroupeSocket[]): string {
  type Prise = { socketTypeHash?: number; singleInitialItemHash?: number; reusablePlugSetHash?: number; randomizedPlugSetHash?: number; reusablePlugItems?: unknown[] };
  const defSub = subclassItemHash
    ? obtenirDefinition<{ displayProperties?: { name?: string }; sockets?: { socketEntries?: Prise[] } }>(db, "DestinyInventoryItemDefinition", subclassItemHash)
    : undefined;
  const sortie: string[] = [
    "DIAGNOSTIC DES ICÔNES DE DOCTRINE (à copier à Claude)",
    `Sous-classe : ${defSub?.displayProperties?.name ?? "(inconnue)"} — hash ${subclassItemHash ?? "?"} — élément choisi dans l'outil : ${element ?? "?"}`,
    "",
    "--- Prises (sockets) de la sous-classe : index | type | plug set réutilisable | plug set aléatoire | objet fixe | options directes",
  ];
  (defSub?.sockets?.socketEntries ?? []).forEach((e, i) =>
    sortie.push(`[${i}] type=${e.socketTypeHash ?? 0} | reusablePlugSet=${e.reusablePlugSetHash ?? 0} | randomizedPlugSet=${e.randomizedPlugSetHash ?? 0} | fixe=${e.singleInitialItemHash ?? 0} | directes=${e.reusablePlugItems?.length ?? 0}`)
  );
  const LIBELLES: [CategorieSocket, string][] = [["saut", "SAUT"], ["classe", "COMPÉTENCE DE CLASSE"], ["melee", "MÊLÉE"], ["grenade", "GRENADE"], ["super", "SUPER"]];
  for (const [cat, libelle] of LIBELLES) {
    const groupe = groupes.find((g) => g.categorie === cat);
    if (!groupe || groupe.options.length === 0) continue;
    sortie.push("", `## ${libelle} (${groupe.options.length} option${groupe.options.length > 1 ? "s" : ""})`);
    for (const o of groupe.options) {
      const d = obtenirDefinition<{ plug?: { plugCategoryIdentifier?: string }; itemTypeDisplayName?: string; iconWatermark?: string; displayProperties?: { icon?: string; iconSequences?: unknown[] } }>(db, "DestinyInventoryItemDefinition", o.hash);
      sortie.push(`- ${o.nom} | hash ${o.hash} | plug=${d?.plug?.plugCategoryIdentifier ?? "?"} | type="${d?.itemTypeDisplayName ?? ""}" | icône=${d?.displayProperties?.icon ?? "?"} | filigrane=${d?.iconWatermark ?? "-"} | séquences=${d?.displayProperties?.iconSequences?.length ?? 0}`);
    }
  }
  return sortie.join("\n");
}

export interface SousClassePossedee {
  itemHash: number;
  itemInstanceId?: string;
  nom: string;
  icone?: string;
  element: SubclassConfig["element"];
  equipeEnJeu: boolean;
  /** FR : hash des plugs (super/aspects/fragments/mêlée/grenade/saut) réellement socketés en jeu en ce moment, seulement si `equipeEnJeu` est vrai. / EN: hashes of the plugs (super/aspects/fragments/melee/grenade/jump) actually socketed in-game right now, only if `equipeEnJeu` is true. */
  hashesEquipes: number[];
  /** FR : personnage sur lequel cette sous-classe se trouve - requis par les actions d'équipement/d'insertion de plug, qui ciblent toujours un personnage précis. / EN: character this subclass sits on - required by equip/plug-insertion actions, which always target a specific character. */
  characterId?: string;
}

// FR : ⚠️ CORRIGÉ (02/08/2026) - détection par TEXTE trouvée buguée aux
// tests : "Arcaniste" contient la sous-chaîne "arc" (faux positif "Arc"),
// et les noms hérités ("Sunbreaker" pour Solaire...) ne contiennent pas le
// mot de l'élément. On utilise maintenant le champ NUMÉRIQUE
// `defaultDamageType` (stable et documenté depuis des années), bien plus
// fiable. Le Prismatique n'a pas de type de dégâts propre (il combine les
// autres) : on garde un repli sur le texte, sans risque de faux positif
// puisqu'aucun autre élément ne contient "prismatique".
// EN: ⚠️ FIXED (2026-08-02) - TEXT-based detection found buggy in tests:
// "Arcaniste" (French for Warlock) contains the substring "arc" (false
// positive "Arc"), and legacy names ("Sunbreaker" for Solar...) don't
// contain the element's word. We now use the NUMERIC `defaultDamageType`
// field (stable and documented for years), far more reliable. Prismatic
// has no damage type of its own (it combines the others): we keep a text
// fallback, with no false-positive risk since no other element contains
// "prismatic".
// FR : ⚠️ CORRIGÉ (02/08/2026, v2) - bug trouvé en test réel : seule la
// Prismatique apparaissait, toutes les autres sous-classes disparaissaient.
// Cause probable : les valeurs numériques `defaultDamageType` que j'avais
// supposées (2=Arc, 3=Solaire...) ne sont peut-être pas exactes (je n'ai
// pas pu les vérifier en direct) - le Prismatique ne passait QUE par le
// repli texte, qui fonctionnait, révélant que le numérique échouait pour
// le reste. Ajout d'un DEUXIÈME repli texte, avec limites de mots
// (`\b...\b`) pour éviter la collision "Arcaniste" contient "Arc" trouvée
// au tour précédent. Le numérique reste essayé en premier (au cas où il
// soit finalement correct), le texte comble les cas où il ne l'est pas.
// EN: ⚠️ FIXED (2026-08-02, v2) - bug found in real testing: only
// Prismatic showed up, every other subclass vanished. Likely cause: the
// numeric `defaultDamageType` values I had assumed (2=Arc, 3=Solar...)
// may not be exact (I couldn't verify them live) - Prismatic only ever
// went through the text fallback, which worked, revealing that the
// numeric path failed for everything else. Added a SECOND text fallback,
// with word boundaries (`\b...\b`) to avoid the "Arcaniste contains Arc"
// collision found in the previous round. The numeric field is still tried
// first (in case it's actually correct), text fills in where it isn't.
// FR : ⚠️ CORRIGÉ (03/08/2026, v3) - le diagnostic a confirmé que 5 des 6
// sous-classes restaient non identifiées malgré le repli numérique ET le
// repli texte (v2). Plutôt que deviner une 3e fois des valeurs numériques
// ou des mots-clés, on interroge directement le Manifest : la table
// DestinySocketCategoryDefinition... pardon, DestinyDamageTypeDefinition
// donne le VRAI nom officiel de chaque type de dégâts (ex: "Solaire",
// "Arc"...) pour la valeur numérique `defaultDamageType` rencontrée - plus
// besoin de deviner la correspondance, on la lit directement.
// EN: ⚠️ FIXED (2026-08-03, v3) - the diagnostic confirmed 5 of 6
// subclasses stayed unidentified despite both the numeric fallback AND
// the text fallback (v2). Rather than guessing numeric values or keywords
// a 3rd time, we query the Manifest directly: the DestinyDamageTypeDefinition
// table gives the REAL official name of each damage type (e.g. "Solar",
// "Arc"...) for the numeric `defaultDamageType` value encountered - no
// more guessing the mapping, we read it straight from the source.
const cacheDamageTypeParDb = new WeakMap<Database, Map<number, string>>();

export function obtenirNomsDamageType(db: Database): Map<number, string> {
  let carte = cacheDamageTypeParDb.get(db);
  if (!carte) {
    carte = new Map();
    try {
      const stmt = db.prepare("SELECT json FROM DestinyDamageTypeDefinition");
      while (stmt.step()) {
        const def = JSON.parse(stmt.getAsObject().json as string);
        if (def.enumValue !== undefined && def.displayProperties?.name) {
          carte.set(def.enumValue, def.displayProperties.name);
        }
      }
      stmt.free();
    } catch {
      // FR : table absente ou nom différent - le repli texte prendra le relais.
    }
    cacheDamageTypeParDb.set(db, carte);
  }
  return carte;
}

// FR : ⚠️ AJOUT (04/08/2026) - demande utilisateur : utiliser le vrai
// logo d'élément (celui déjà affiché dans la roue de la Doctrine) plutôt
// qu'une pastille de couleur générique, pour identifier l'élément d'une
// arme dans l'inventaire/coffre. Même table, même principe fiable que
// pour le nom - on lit l'icône officielle depuis le Manifest.
// EN: ⚠️ ADDED (2026-08-04) - user request: use the real element logo
// (the one already shown in the Doctrine wheel) rather than a generic
// color badge, to identify a weapon's element in the inventory/vault.
// Same table, same reliable principle as for the name - we read the
// official icon from the Manifest.
const cacheIconeDamageTypeParDb = new WeakMap<Database, Map<number, string>>();

export function obtenirIconesDamageType(db: Database): Map<number, string> {
  let carte = cacheIconeDamageTypeParDb.get(db);
  if (!carte) {
    carte = new Map();
    try {
      const stmt = db.prepare("SELECT json FROM DestinyDamageTypeDefinition");
      while (stmt.step()) {
        const def = JSON.parse(stmt.getAsObject().json as string);
        if (def.enumValue !== undefined && def.displayProperties?.icon) {
          carte.set(def.enumValue, urlIcone(def.displayProperties.icon)!);
        }
      }
      stmt.free();
    } catch {
      // FR : table absente - pas d'icône, le badge par lettre prendra le relais.
    }
    cacheIconeDamageTypeParDb.set(db, carte);
  }
  return carte;
}

const MOTS_PAR_ELEMENT: Array<{ element: SubclassConfig["element"]; mots: string[] }> = [
  { element: "solaire", mots: ["solaire", "solar"] },
  { element: "arc", mots: ["arc"] },
  { element: "abyssal", mots: ["vide", "void", "abyssal"] },
  { element: "stase", mots: ["stase", "stasis"] },
  { element: "filobscur", mots: ["filobscur", "strand"] },
  { element: "prismatique", mots: ["prismatique", "prismatic"] },
];

function devinerElementParTexte(texte: string): SubclassConfig["element"] | undefined {
  const texteNormalise = normaliser(texte);
  for (const { element, mots } of MOTS_PAR_ELEMENT) {
    if (mots.some((m) => new RegExp(`\\b${m}\\b`).test(texteNormalise))) return element;
  }
  return undefined;
}

// FR : ⚠️ CORRIGÉ (03/08/2026, v4) - le diagnostic réel a montré que
// `defaultDamageType` vaut TOUJOURS 0 sur l'objet sous-classe lui-même
// (confirmé sur les 6 sous-classes, y compris Prismatique) - ce champ ne
// sert donc à rien ici, contrairement aux armes. Les noms de sous-classes
// modernes ("Lame de l'aube", "Sombreur"...) ne contiennent pas non plus
// le mot de l'élément. Nouvelle piste fiable : le SUPER de la sous-classe
// est une vraie attaque, il a donc un `defaultDamageType` correct - on va
// le chercher via la catégorie de socket "super" (déjà fiable, confirmée
// par l'utilisateur) plutôt que sur l'objet sous-classe lui-même.
// EN: ⚠️ FIXED (2026-08-03, v4) - real diagnostic data showed
// `defaultDamageType` is ALWAYS 0 on the subclass item itself (confirmed
// on all 6 subclasses, including Prismatic) - this field is useless here,
// unlike for weapons. Modern subclass names ("Dawnblade", "Shadebinder"...)
// don't contain the element word either. New reliable lead: the
// subclass's SUPER is a real attack, so it has a correct
// `defaultDamageType` - we fetch it via the "super" socket category
// (already reliable, user-confirmed) rather than the subclass item itself.
/** FR : version "diagnostic" - retrouve la définition brute du Super, peu importe si son defaultDamageType est exploitable ou non (juste pour l'afficher). / EN: "diagnostic" version - finds the Super's raw definition, regardless of whether its defaultDamageType is usable or not (just to display it). */
function obtenirDefSuper(db: Database, def: DestinyItemDefinition): DestinyItemDefinition | undefined {
  if (!def.sockets) return undefined;
  for (const cat of def.sockets.socketCategories ?? []) {
    const catDef = obtenirDefinition<DestinySocketCategoryDefinition>(db, "DestinySocketCategoryDefinition", cat.socketCategoryHash);
    if (devinerCategorieSocket(catDef?.displayProperties?.name ?? "") !== "super") continue;
    for (const idx of cat.socketIndexes) {
      const entree = def.sockets.socketEntries[idx];
      if (!entree) continue;
      let hashesOptions: number[] = (entree.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      if (hashesOptions.length === 0 && entree.reusablePlugSetHash) {
        const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.reusablePlugSetHash);
        hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      }
      if (hashesOptions.length === 0 && entree.randomizedPlugSetHash) {
        const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.randomizedPlugSetHash);
        hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
      }
      if (hashesOptions.length === 0 && entree.singleInitialItemHash) {
        hashesOptions = [entree.singleInitialItemHash];
      }
      if (hashesOptions.length > 0) {
        return obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", hashesOptions[0]);
      }
    }
  }
  return undefined;
}

// FR : ⚠️ CHANGEMENT D'APPROCHE (03/08/2026, v6) - le diagnostic complet a
// confirmé qu'AUCUN champ Manifest exploité jusqu'ici (defaultDamageType,
// damageTypeHashes, plugCategoryIdentifier - sous-classe ET Super) n'est
// JAMAIS renseigné. `itemCategoryHashes` est identique pour les 6
// sous-classes testées (juste "ceci est une sous-classe", pas l'élément).
// Il n'y a donc rien d'exploitable côté Manifest pour deviner l'élément
// par la donnée. Solution retenue : une table CODÉE EN DUR à partir des
// vrais hash confirmés par l'utilisateur (hash stables, ne changent pas).
// Couvre l'Arcaniste pour l'instant (les 6 hash ont été confirmés en
// conditions réelles) - à compléter avec Titan/Chasseur si le même bug
// apparaît pour ces classes (il faudra alors les hash correspondants).
// EN: ⚠️ APPROACH CHANGE (2026-08-03, v6) - the full diagnostic confirmed
// NO Manifest field tried so far (defaultDamageType, damageTypeHashes,
// plugCategoryIdentifier - subclass AND Super) is EVER populated.
// `itemCategoryHashes` is identical across all 6 tested subclasses (just
// "this is a subclass", not the element). So there's nothing usable on
// FR : ⚠️ AJOUT (04/08/2026) - hash du Titan, ajoutés à partir du
// diagnostic fourni par l'utilisateur. Mapping basé sur les noms
// OFFICIELS bien connus : Sentinelle = Sentinel = Abyssal, Assaillant =
// Striker = Arc, Brise-soleil = Sunbreaker = Solaire, Béhémoth = Behemoth
// = Stase, Berserker = Berserker (même nom FR/EN) = Filobscur.
// EN: ⚠️ ADDED (2026-08-04) - Titan hashes, added from the diagnostic
// provided by the user. Mapping based on well-known OFFICIAL names:
// Sentinel = Void, Striker = Arc, Sunbreaker = Solar, Behemoth = Stasis,
// Berserker = Strand.
const ELEMENT_PAR_HASH_CONNU: Record<number, SubclassConfig["element"]> = {
  3941205951: "solaire", // Lame de l'aube (Arcaniste)
  2849050827: "abyssal", // Voie abyssale (Arcaniste)
  3168997075: "arc", // Rite de l'orage (Arcaniste)
  3291545503: "stase", // Sombreur (Arcaniste)
  3893112950: "prismatique", // Arcaniste prismatique
  4204413574: "filobscur", // Tresse-couvée (Arcaniste)
  2240888816: "solaire", // Pistolero (Chasseur / Gunslinger)
  2328211300: "arc", // Grâce survoltée (Chasseur / Arcstrider)
  2453351420: "abyssal", // Ronde de nuit (Chasseur / Nightstalker)
  873720784: "stase", // Revenant (Chasseur)
  4282591831: "prismatique", // Chasseur prismatique
  3785442599: "filobscur", // Tisseur (Chasseur / Threadrunner)
  2842471112: "abyssal", // Sentinelle (Titan / Sentinel)
  2932390016: "arc", // Assaillant (Titan / Striker)
  2550323932: "solaire", // Brise-soleil (Titan / Sunbreaker)
  613647804: "stase", // Béhémoth (Titan / Behemoth)
  1616346845: "prismatique", // Titan prismatique
  242419885: "filobscur", // Berserker (Titan)
};

function devinerElement(def: DestinyItemDefinition, db: Database): SubclassConfig["element"] | undefined {
  if (ELEMENT_PAR_HASH_CONNU[def.hash]) return ELEMENT_PAR_HASH_CONNU[def.hash];

  const defSuper = obtenirDefSuper(db, def);

  // Piste 1 : plugCategoryIdentifier (étiquette texte Bungie, souvent "type.element") - sous-classe puis Super.
  for (const candidat of [def.plugCategoryIdentifier, defSuper?.plugCategoryIdentifier]) {
    if (!candidat) continue;
    const element = devinerElementParTexte(candidat);
    if (element) return element;
  }

  // Piste 2 : damageTypeHashes (hash direct vers DestinyDamageTypeDefinition, sans passer par l'enum) - sous-classe puis Super.
  for (const hashes of [def.damageTypeHashes, defSuper?.damageTypeHashes]) {
    for (const h of hashes ?? []) {
      const defDamageType = obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyDamageTypeDefinition", h);
      const nom = defDamageType?.displayProperties?.name;
      if (nom) {
        const element = devinerElementParTexte(nom);
        if (element) return element;
      }
    }
  }

  // Piste 3 : defaultDamageType (enum) - sous-classe puis Super.
  for (const dt of [def.defaultDamageType, defSuper?.defaultDamageType]) {
    if (dt === undefined || dt === 0) continue;
    const nomOfficiel = obtenirNomsDamageType(db).get(dt);
    if (nomOfficiel) {
      const element = devinerElementParTexte(nomOfficiel);
      if (element) return element;
    }
  }

  // Piste 4 (dernier repli) : texte du nom/type de la sous-classe elle-même.
  return devinerElementParTexte(`${def.displayProperties?.name ?? ""} ${def.itemTypeDisplayName ?? ""}`);
}

/**
 * FR : Liste les sous-classes possédées par le joueur pour une classe
 * donnée (une par élément débloqué), via le bucket Subclass sur chaque
 * personnage de cette classe.
 * EN: Lists the subclasses owned by the player for a given class (one per
 * unlocked element), via the Subclass bucket on each character of that class.
 */
export interface DiagnosticSousClasse {
  nom: string;
  hash: number;
  defaultDamageType?: number;
  damageTypeHashesSousClasse?: number[];
  defaultDamageTypeSuper?: number;
  damageTypeHashesSuper?: number[];
  itemCategoryHashes?: number[];
  /** FR : nouvelle piste (03/08/2026) - étiquette interne Bungie, souvent formatée "type.element". / EN: new lead (2026-08-03) - Bungie internal tag, often formatted "type.element". */
  plugCategoryIdentifierSousClasse?: string;
  plugCategoryIdentifierSuper?: string;
  elementDetecte?: SubclassConfig["element"];
}

export interface ResultatSousClasses {
  sousClasses: SousClassePossedee[];
  /** FR : TOUS les objets bruts trouvés dans le bucket Subclass, même ceux non identifiés - pour diagnostiquer le bug "seule la Prismatique apparaît". / EN: ALL raw items found in the Subclass bucket, even unidentified ones - to diagnose the "only Prismatic shows up" bug. */
  diagnostic: DiagnosticSousClasse[];
}

export async function listerSousClassesPossedees(
  membership: DestinyMembership,
  db: Database,
  classe: Exclude<SubclassConfig["classe"], null>
): Promise<ResultatSousClasses> {
  const accessToken = await obtenirAccessTokenValide();
  const composants = [200, 201, 205, 305].join(",");
  const reponse = await fetch(
    `${BUNGIE_API_ROOT}/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${composants}`,
    { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${accessToken}` } }
  );
  if (!reponse.ok) throw new Error(`Récupération des sous-classes échouée (${reponse.status})`);
  const enveloppe = await reponse.json();
  if (enveloppe.ErrorCode !== 1 || enveloppe.Response === undefined) {
    throw new Error(`Bungie a refusé la récupération des sous-classes (${enveloppe.ErrorCode ?? "?"}/${enveloppe.ErrorStatus ?? "Unknown"}) : ${enveloppe.Message || "réponse sans données"}`);
  }
  const profil = enveloppe.Response;

  const NOMS_CLASSE_INDEX: Record<Exclude<SubclassConfig["classe"], null>, number> = { titan: 0, chasseur: 1, arcaniste: 2 };
  const personnagesDeLaClasse = Object.entries(profil.characters?.data ?? {})
    .filter(([, c]: [string, any]) => c.classType === NOMS_CLASSE_INDEX[classe])
    .map(([charId]) => charId);

  const hashesVus = new Set<number>();
  const sousClasses: SousClassePossedee[] = [];
  const diagnostic: DiagnosticSousClasse[] = [];
  const socketsParInstance: Record<string, { sockets: Array<{ plugHash?: number; isEnabled: boolean }> }> =
    profil.itemComponents?.sockets?.data ?? {};

  for (const charId of personnagesDeLaClasse) {
    const itemsInventaire = (profil.characterInventories?.data?.[charId]?.items ?? []).map((it: any) => ({ ...it, equipe: false }));
    const itemsEquipes = (profil.characterEquipment?.data?.[charId]?.items ?? []).map((it: any) => ({ ...it, equipe: true }));
    const items = [...itemsInventaire, ...itemsEquipes];

    for (const item of items) {
      const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", item.itemHash);
      if (!def || def.inventory?.bucketTypeHash !== BUCKET_HASH_SOUS_CLASSE) continue;
      if (hashesVus.has(item.itemHash)) continue;
      hashesVus.add(item.itemHash);

      const element = devinerElement(def, db);
      // FR : ⚠️ AJOUT (03/08/2026) - on garde une trace de TOUT ce qui est
      // trouvé dans le bucket Subclass, même quand l'élément n'est pas
      // identifié, pour voir précisément ce que l'API renvoie (nombre
      // d'objets réellement présents, leur defaultDamageType réel).
      // EN: ⚠️ ADDED (2026-08-03) - we keep track of EVERYTHING found in
      // the Subclass bucket, even when the element isn't identified, to
      // see exactly what the API returns (actual number of items present,
      // their real defaultDamageType).
      const defSuperDiag = obtenirDefSuper(db, def);
      diagnostic.push({
        nom: def.displayProperties?.name ?? "(sans nom)",
        hash: item.itemHash,
        defaultDamageType: def.defaultDamageType,
        damageTypeHashesSousClasse: def.damageTypeHashes,
        defaultDamageTypeSuper: defSuperDiag?.defaultDamageType,
        damageTypeHashesSuper: defSuperDiag?.damageTypeHashes,
        itemCategoryHashes: def.itemCategoryHashes,
        elementDetecte: element,
      });

      if (!element) continue; // sécurité : ignore si l'élément n'a pas pu être identifié

      const hashesEquipes = item.equipe && item.itemInstanceId
        ? (socketsParInstance[item.itemInstanceId]?.sockets ?? [])
            .filter((s) => s.isEnabled && s.plugHash)
            .map((s) => s.plugHash!)
        : [];

      sousClasses.push({
        itemHash: item.itemHash,
        itemInstanceId: item.itemInstanceId,
        nom: def.displayProperties?.name ?? "(sous-classe sans nom)",
        icone: urlIcone(def.displayProperties?.icon),
        element,
        equipeEnJeu: !!item.equipe,
        hashesEquipes,
        characterId: charId,
      });
    }
  }

  return { sousClasses, diagnostic };
}

// FR : ⚠️ CORRIGÉ (03/08/2026, v2) - la classification par NOM de
// catégorie s'est révélée insuffisante en test réel : sur "Le Chardon",
// seul le perk intrinsèque ("Marque des Flammes") ressortait, ni le perk
// d'arme exotique ("Dévoreur d'âme") ni la pièce maîtresse ; sur une
// armure exotique, aucun des deux. Nouveau critère, structurel plutôt que
// textuel : un socket FIGÉ (une seule option possible - on ne peut pas
// changer le perk exotique d'une arme) ET dont l'option a une description
// non vide est considéré pertinent. Le nom de catégorie ne sert plus qu'à
// tenter de distinguer "PM" (pièce maîtresse) du reste, en best-effort.
// EN: ⚠️ FIXED (2026-08-03, v2) - classifying by category NAME proved
// insufficient in real testing: on "The Thorn", only the intrinsic perk
// ("Mark of the Devourer") showed up, neither the weapon's exotic perk
// nor the masterwork; on an exotic armor piece, neither showed at all.
// New criterion, structural rather than textual: a FIXED socket (only one
// possible option - you can't change a weapon's exotic perk) AND whose
// option has a non-empty description is considered relevant. The category
// name now only serves to try to distinguish "PM" (masterwork) from the
// rest, best-effort.
export type CategorieSocketObjet = "piece_maitresse" | "perk_exotique";

const MOTS_PIECE_MAITRESSE = ["piece maitresse", "masterwork", "maitresse", "catalyseur", "catalyst"];

/**
 * FR : Pour un objet donné (arme/armure), renvoie les sockets jugés
 * pertinents pour un exotique (perk(s) intrinsèque/exotique + pièce
 * maîtresse/catalyseur).
 *
 * ⚠️ CORRIGÉ (03/08/2026, v3) - le critère "socket à option unique" ne
 * fonctionne PAS sur les armes aux perks fixes (non aléatoires) : TOUS
 * leurs sockets (canon, munitions, poignée...) n'ont qu'une seule option,
 * pas seulement l'exotique - confirmé par une capture d'écran réelle sur
 * "Le Chardon", où le filtre laissait tout passer. Nouveau critère basé
 * sur le CONTENU réel observé : les perks génériques (canon, munitions,
 * poignée...) ont une description courte suivie de puces "•" listant des
 * bonus de stats ; les vrais effets exotiques sont du texte narratif SANS
 * puces. On masque donc les descriptions contenant des puces.
 *
 * EN: For a given item (weapon/armor), returns the sockets deemed
 * relevant for an exotic (intrinsic/exotic perk(s) + masterwork/catalyst).
 *
 * ⚠️ FIXED (2026-08-03, v3) - the "single-option socket" criterion does
 * NOT work on weapons with fixed (non-random) perks: ALL their sockets
 * (barrel, magazine, grip...) have only one option, not just the exotic
 * one - confirmed by a real screenshot on "The Thorn", where the filter
 * let everything through. New criterion based on the actually observed
 * CONTENT: generic perks (barrel, magazine, grip...) have a short
 * description followed by "•" bullets listing stat bonuses; real exotic
 * effects are narrative text WITHOUT bullets. We now hide descriptions
 * containing bullets.
 */
export function obtenirCategorieSocketsParIndex(db: Database, itemHash: number): Map<number, CategorieSocketObjet> {
  const resultat = new Map<number, CategorieSocketObjet>();
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.sockets) return resultat;

  const nomCategorieParSocket = new Map<number, string>();
  for (const cat of def.sockets.socketCategories ?? []) {
    const catDef = obtenirDefinition<DestinySocketCategoryDefinition>(db, "DestinySocketCategoryDefinition", cat.socketCategoryHash);
    const nom = normaliser(catDef?.displayProperties?.name ?? "");
    for (const idx of cat.socketIndexes) nomCategorieParSocket.set(idx, nom);
  }

  def.sockets.socketEntries.forEach((entree, index) => {
    let hashesOptions: number[] = (entree.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    if (hashesOptions.length === 0 && entree.reusablePlugSetHash) {
      const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.reusablePlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    // FR : ⚠️ AJOUT (04/08/2026) - repli sur randomizedPlugSetHash (pool
    // de perks à ROLLS ALÉATOIRES - barillet/munitions/perks d'arme
    // typiquement), jamais vérifié jusqu'ici - explique probablement
    // pourquoi des colonnes de perks structurantes n'affichaient aucune
    // option (confirmé par l'utilisateur : colonnes 2,3,4,5,11 vides sur
    // "Vigile Liminaire").
    // EN: ⚠️ ADDED (2026-08-04) - fallback on randomizedPlugSetHash (pool
    // of RANDOM-roll perks - barrel/magazine/weapon perks typically),
    // never checked until now - likely explains why structuring perk
    // columns showed no options at all (confirmed by user: columns
    // 2,3,4,5,11 empty on "Vigile Liminaire").
    if (hashesOptions.length === 0 && entree.randomizedPlugSetHash) {
      const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.randomizedPlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    if (hashesOptions.length === 0 && entree.singleInitialItemHash) {
      hashesOptions = [entree.singleInitialItemHash];
    }
    if (hashesOptions.length === 0) return;

    // FR : on ne regarde que la première option - sur une arme/armure
    // exotique à rolls fixes, il n'y en a de toute façon qu'une seule.
    const defOption = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", hashesOptions[0]);
    const description = defOption?.displayProperties?.description ?? "";
    if (!description || description.includes("•")) return; // vide ou liste de puces (mod générique) -> masqué

    const nomCategorie = nomCategorieParSocket.get(index) ?? "";
    const nomOption = normaliser(defOption?.displayProperties?.name ?? "");
    // FR : ⚠️ AJOUT (03/08/2026) - exclut aussi les sockets cosmétiques/de
    // suivi (souvenir, compte-frags, ornement, palier de progression) -
    // même filtre que la popup Détails, ils passaient le filtre "sans
    // puces" par erreur (leur description est du texte narratif court,
    // sans puces, comme un vrai effet exotique).
    // EN: ⚠️ ADDED (2026-08-03) - also excludes cosmetic/tracker sockets
    // (memento, kill tracker, ornament, progression tier) - same filter as
    // the Details popup, they were wrongly passing the "no bullets" filter
    // (their description is short narrative text, no bullets, just like a
    // real exotic effect).
    if (MOTS_CATEGORIE_COSMETIQUE.some((m) => nomCategorie.includes(m))) return;
    if (MOTS_OPTION_COSMETIQUE.some((m) => nomOption.includes(m) || normaliser(description).includes(m))) return;
    // FR : ⚠️ AJOUT (04/08/2026) - "effet visuel festif" (ex: "Pulsation
    // triomphale"), même signal que pour la popup Détails et les
    // infobulles légendaires - un mod cosmétique révélé par sa
    // description, pas son nom.
    // EN: ⚠️ ADDED (2026-08-04) - "festive visual effect" (e.g.
    // "Triumphant Pulse"), same signal as the Details popup and legendary
    // tooltips - a cosmetic mod revealed by its description, not its name.
    if (normaliser(description).includes("effet visuel festif")) return;
    // FR : ⚠️ AJOUT (04/08/2026) - "Vœux de malheur" (ornement) passait
    // toujours le filtre car son nom est une simple appellation cosmétique
    // sans mot-clé - mais sa DESCRIPTION contient littéralement "ornement
    // d'arme" (confirmé par capture d'écran) - même signal que pour le
    // doublon de recherche "Faim qui Ronge".
    // EN: ⚠️ ADDED (2026-08-04) - "Curse of Misfortune" (ornament) still
    // passed the filter since its name is just a cosmetic label with no
    // keyword - but its DESCRIPTION literally contains "weapon ornament"
    // (confirmed by screenshot) - same signal as for the "Firefly" search
    // duplicate.
    if (normaliser(description).includes("ornement d'arme") || normaliser(description).includes("weapon ornament")) return;

    const estPieceMaitresse = MOTS_PIECE_MAITRESSE.some((m) => nomCategorie.includes(m) || nomOption.includes(m));
    resultat.set(index, estPieceMaitresse ? "piece_maitresse" : "perk_exotique");
  });

  return resultat;
}

// FR : ⚠️ AJOUT (03/08/2026) - certains fragments (et parfois d'autres
// plugs de sous-classe) donnent aussi un bonus de statistique en plus de
// leur effet (ex: "Écho d'Expulsion" -> +10 Super). Même mécanisme que
// les archétypes/mods d'armure : des `investmentStats` sur le plug,
// qu'on résout ici via le même principe de correspondance par nom que
// pour l'armure (LIBELLES_STAT, dupliqué ici pour éviter une dépendance
// circulaire avec inventaire.ts qui importe déjà ce fichier).
// EN: ⚠️ ADDED (2026-08-03) - some fragments (and occasionally other
// subclass plugs) also grant a stat bonus in addition to their effect
// (e.g. "Echo of Expulsion" -> +10 Super). Same mechanism as armor
// archetypes/mods: `investmentStats` on the plug, resolved here via the
// same name-matching principle as for armor (LIBELLES_STAT, duplicated
// here to avoid a circular dependency with inventaire.ts, which already
// imports this file).
const LIBELLES_STAT_DOCTRINE: Record<StatKey, string[]> = {
  sante: ["sante", "health"],
  melee: ["corps a corps", "melee"],
  grenade: ["grenade"],
  super: ["super"],
  classe: ["classe", "class", "competence de classe", "class ability"],
  arme: ["arme", "armes", "weapon", "weapons"],
};

function resoudreStatKeyDoctrine(nomStat: string): StatKey | undefined {
  const nomNormalise = normaliser(nomStat);
  for (const [cle, libelles] of Object.entries(LIBELLES_STAT_DOCTRINE) as [StatKey, string[]][]) {
    if (libelles.some((l) => nomNormalise.includes(l))) return cle;
  }
  return undefined;
}

/** FR : résout les bonus de statistiques (investmentStats) d'un seul plug de sous-classe (aspect/fragment/etc). / EN: resolves the stat bonuses (investmentStats) of a single subclass plug (aspect/fragment/etc). */
function obtenirBonusStatsPlug(db: Database, hash: number): Partial<Record<StatKey, number>> {
  const bonus: Partial<Record<StatKey, number>> = {};
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", hash);
  for (const investissement of def?.investmentStats ?? []) {
    const defStat = obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyStatDefinition", investissement.statTypeHash);
    const cle = defStat?.displayProperties?.name ? resoudreStatKeyDoctrine(defStat.displayProperties.name) : undefined;
    if (cle) bonus[cle] = (bonus[cle] ?? 0) + investissement.value;
  }
  return bonus;
}

/**
 * FR : Additionne les bonus de statistiques de TOUS les fragments (et
 * aspects, par sécurité) sélectionnés dans une sous-classe - à ajouter
 * aux stats totales du build (Pilier 5), en plus des stats d'armure.
 * EN: Sums the stat bonuses of ALL selected fragments (and aspects, for
 * safety) in a subclass - to add to the build's total stats (Pillar 5),
 * on top of armor stats.
 */
export function obtenirBonusStatsDoctrine(db: Database, subclass: SubclassConfig): Partial<Record<StatKey, number>> {
  const total: Partial<Record<StatKey, number>> = {};
  for (const hash of [...subclass.fragmentHashes, ...subclass.aspectHashes]) {
    if (!hash) continue;
    const bonus = obtenirBonusStatsPlug(db, hash);
    for (const [cle, valeur] of Object.entries(bonus) as [StatKey, number][]) {
      total[cle] = (total[cle] ?? 0) + valeur;
    }
  }
  return total;
}

/** FR : texte court à ajouter à une infobulle si le plug donne un bonus de stat (ex: "+10 Super"). / EN: short text to add to a tooltip if the plug grants a stat bonus (e.g. "+10 Super"). */
const LIBELLES_STAT_AFFICHAGE: Record<StatKey, string> = {
  sante: "Santé",
  melee: "Mêlée",
  grenade: "Grenade",
  super: "Super",
  classe: "Classe",
  arme: "Arme",
};

function texteBonusStats(bonus: Partial<Record<StatKey, number>>): string {
  return (Object.entries(bonus) as [StatKey, number][])
    .map(([cle, valeur]) => `+${valeur} ${LIBELLES_STAT_AFFICHAGE[cle]}`)
    .join(" · ");
}

/**
 * FR : ⚠️ AJOUT (03/08/2026) - diagnostic ciblé pour le bug "une catégorie
 * (ex: Super) n'apparaît pas pour une sous-classe précise (ex: Stase)" -
 * liste les vrais noms de catégories de socket trouvées sur l'objet, pour
 * voir si "Super" est simplement absent structurellement ou juste mal
 * identifié par le texte.
 * EN: ⚠️ ADDED (2026-08-03) - targeted diagnostic for the "a category
 * (e.g. Super) doesn't show up for a specific subclass (e.g. Stasis)" bug
 * - lists the real socket category names found on the item, to see if
 * "Super" is simply structurally absent or just misidentified by text.
 */
export function obtenirNomsCategoriesSocket(db: Database, itemHash: number): string[] {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.sockets?.socketCategories) return [];
  return def.sockets.socketCategories.map((cat) => {
    const catDef = obtenirDefinition<DestinySocketCategoryDefinition>(db, "DestinySocketCategoryDefinition", cat.socketCategoryHash);
    return `${catDef?.displayProperties?.name ?? "(sans nom)"} (${cat.socketIndexes.length} socket(s))`;
  });
}

// FR : ⚠️ AJOUT (03/08/2026) - vue "Détails" d'une arme : pour CHAQUE
// colonne de socket, liste TOUTES les options possibles (pas juste celle
// actuellement roulée), et indique laquelle est équipée sur CET
// exemplaire précis. Généralise le principe déjà utilisé pour la
// Doctrine (options par socket) à n'importe quelle arme/armure. Pas de
// tentative de deviner un nom de catégorie sémantique (barillet/canon/
// perk...) - on numérote juste les colonnes dans l'ordre du Manifest,
// pour éviter de reproduire les difficultés rencontrées avec les noms de
// catégorie sur la Doctrine.
// EN: ⚠️ ADDED (2026-08-03) - a weapon's "Details" view: for EACH socket
// column, lists ALL possible options (not just the currently rolled
// one), and shows which one is equipped on THIS specific instance.
// Generalizes the principle already used for Doctrine (options per
// socket) to any weapon/armor. No attempt to guess a semantic category
// name (barrel/frame/perk...) - columns are just numbered in Manifest
// order, to avoid repeating the difficulties faced with category names
// on Doctrine.
export interface ColonneOptionsArme {
  socketIndex: number;
  options: OptionSocket[];
  /** FR : true si identifié comme un mod d'arme générique connu (via son nom précis, pas une catégorie large) - à afficher à part, en bas, plutôt que masqué. / EN: true if identified as a known generic weapon mod (via its precise name, not a broad category) - to display separately, at the bottom, rather than hidden. */
  estModConnu?: boolean;
  /**
   * FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - présent UNIQUEMENT quand l'appelant a demandé les colonnes habituellement masquées (`inclureMasquees`, interrupteur « Afficher les perks inutiles » de la Forge) : « cosmetique » (souvenir, suivi, compte-frags, palier, effet visuel festif) ou « ornement ».
   * Par défaut ces colonnes ne sont jamais renvoyées et ce champ n'existe pas : la popup Détails est inchangée. / EN: ⚠️ ADDED - set only when hidden columns were requested.
   */
  masquee?: "cosmetique" | "ornement";
}

// FR : ⚠️ AJOUT (03/08/2026, v4) - suite à la régression du filtrage par
// catégorie ("mod" trop large), nouvelle approche SANS RISQUE : au lieu
// de masquer, on IDENTIFIE seulement les mods génériques CONNUS par leur
// nom précis (liste à enrichir au fil des retours), pour les reléguer en
// bas de la popup sous un libellé "Mods utilisables" plutôt que de les
// masquer. Aucune perte de données possible, contrairement au filtrage
// par catégorie qui avait fait disparaître de vrais perks + le
// Catalyseur.
// EN: ⚠️ ADDED (2026-08-03, v4) - following the category-filtering
// regression ("mod" too broad), new RISK-FREE approach: instead of
// hiding, we only IDENTIFY known generic mods by their precise name
// (list to grow as feedback comes in), to relegate them to the bottom of
// the popup under a "Usable Mods" label rather than hiding them. No data
// loss possible, unlike category filtering which made real perks + the
// Catalyst disappear.
// FR : ⚠️ AJOUT (04/08/2026) - Bungie semble utiliser une formulation
// STANDARD pour toutes les conditions de déblocage de Catalyseur
// ("...pour débloquer cette amélioration"). Plutôt que d'exclure tout un
// bloc de texte (risqué), on retire chirurgicalement la ou les PHRASES
// contenant ce motif précis, en gardant tout le reste (l'effet réel)
// intact.
// EN: ⚠️ ADDED (2026-08-04) - Bungie seems to use a STANDARD phrasing for
// all Catalyst unlock conditions ("...to unlock this upgrade."). Rather
// than excluding a whole block of text (risky), we surgically remove the
// sentence(s) containing this precise pattern, keeping everything else
// (the real effect) intact.
const MOTS_CONDITION_DEBLOCAGE = [
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
  "will benefit from enhanced capabilities",
];

function retirerConditionsDeblocage(texte: string): string {
  if (!texte) return texte;
  return texte
    .split(/(?<=[.!?])\s+/) // découpe par phrase (garde la ponctuation)
    .filter((phrase) => !MOTS_CONDITION_DEBLOCAGE.some((m) => normaliser(phrase).includes(m)))
    .join(" ")
    .trim();
}

/**
 * FR : ⚠️ AJOUT (04/08/2026) - CENTRALISE la résolution de description
 * d'un plug (perk/aspect/fragment/perk d'arme) - jusqu'ici cette logique
 * (concaténation des perks liés + retrait des conditions de déblocage +
 * détection d'ornement) n'était appliquée qu'à DEUX endroits sur trois,
 * ce qui expliquait que "Le Chardon" affiche encore le texte de
 * déblocage dans son infobulle (qui lisait la description BRUTE
 * directement). Utilisée maintenant PARTOUT où une description de plug
 * est affichée (infobulle, popup Détails, options de sous-classe).
 * EN: ⚠️ ADDED (2026-08-04) - CENTRALIZES a plug's description resolution
 * (perk/aspect/fragment/weapon perk) - until now this logic (concatenating
 * linked perks + removing unlock conditions + ornament detection) was
 * only applied at TWO of three places, which explained why "The Thorn"
 * still showed the unlock text in its tooltip (which read the RAW
 * description directly). Now used EVERYWHERE a plug's description is
 * displayed (tooltip, Details popup, subclass options).
 */
export function obtenirDescriptionComplete(db: Database, hash: number): { description: string; estOrnement: boolean } {
  const defOption = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", hash);
  if (!defOption?.displayProperties) return { description: "", estOrnement: false };

  const morceaux: string[] = [];
  if (defOption.displayProperties.description) morceaux.push(defOption.displayProperties.description);
  if (defOption.perks) {
    for (const perk of defOption.perks) {
      const defPerk = obtenirDefinition<{ displayProperties?: { description?: string } }>(db, "DestinySandboxPerkDefinition", perk.perkHash);
      const texte = defPerk?.displayProperties?.description;
      if (texte && !morceaux.includes(texte)) morceaux.push(texte);
    }
  }
  const texteBrut = morceaux.join(" ");
  // FR : ⚠️ CORRIGÉ (04/08/2026) - "Ornement d'origine" (l'option "par
  // défaut" d'une colonne d'ornements) a probablement une description
  // vide ou différente, ne contenant pas "ornement d'arme" - ne
  // regarder QUE la description laissait cette option passer, alors que
  // les autres de la même colonne (ex: "Vœux de malheur") étaient bien
  // filtrées. On vérifie maintenant AUSSI le nom de l'option lui-même.
  // EN: ⚠️ FIXED (2026-08-04) - "Origin Ornament" (a column's "default"
  // option) likely has an empty or different description, not containing
  // "weapon ornament" - checking ONLY the description let this option
  // through, while others in the same column (e.g. "Curse of Misfortune")
  // were correctly filtered. Now ALSO checks the option's own name.
  const nomNormalise = normaliser(defOption.displayProperties.name ?? "");
  const estOrnement =
    normaliser(texteBrut).includes("ornement d'arme") ||
    normaliser(texteBrut).includes("weapon ornament") ||
    nomNormalise.includes("ornement d'origine") ||
    nomNormalise.includes("origin ornament");
  const description = retirerConditionsDeblocage(texteBrut);

  return { description, estOrnement };
}

const MOTS_MOD_CONNU = ["crosse de contrepoids", "reglage de radar", "poignee de sprint"];

// FR : ⚠️ AJOUT (03/08/2026, v2) - l'utilisateur a donné des exemples
// réels de colonnes à masquer (Souvenir de verre, Compte-frags, Palier
// pièce maîtresse maniement, Amélioration de palier 2, Ornement
// d'origine...). Motif commun : ce sont des sockets COSMÉTIQUES/DE
// PROGRESSION (souvenir, suivi, ornement, palier de catalyseur/pièce
// maîtresse), pas des choix de build. Masqués via le nom de la catégorie
// parente (souvenir/ornement/suivi - des regroupements standards et
// stables dans le jeu, contrairement aux catégories de compétences de
// sous-classe qui avaient posé problème) ET/OU un mot-clé "palier" dans
// le nom même des options (les textes de progression du Catalyseur/pièce
// maîtresse contiennent systématiquement ce mot).
// ⚠️ "Crosse de contrepoids" (colonne 7) N'EST PAS masqué : son nom
// correspond au schéma typique d'un vrai perk de poignée (grip), pas
// clairement un mod générique - à confirmer avec vous si besoin.
// EN: ⚠️ ADDED (2026-08-03, v2) - the user gave real examples of columns
// to hide (Glass Memento, Kill Tracker, Masterwork Handling Tier,
// Tier 2 Upgrade, Origin Ornament...). Common pattern: these are
// COSMETIC/PROGRESSION sockets (memento, tracker, ornament, catalyst/
// masterwork tier), not build choices. Hidden via the parent category's
// name (memento/ornament/tracker - standard, stable groupings in the
// game, unlike the subclass ability categories that caused trouble) AND/
// OR a "tier" keyword in the options' own names (catalyst/masterwork
// progression texts systematically contain this word).
// ⚠️ "Counterweight Stock" (column 7) is NOT hidden: its name matches the
// typical pattern of a real grip perk, not clearly a generic mod - to
// confirm with the user if needed.
// FR : ⚠️ RETIRÉ (03/08/2026, v3) - le mot-clé "mod" s'est révélé bien
// trop large : capture d'écran à l'appui (Vigile Liminaire), il masquait
// non seulement les mods d'arme visés, mais aussi PLUSIEURS vrais perks
// de build ET le Catalyseur - qui partagent visiblement une catégorie
// commune plus large que prévu (même famille de problème que le
// regroupement "Compétences" de la Doctrine). Retour à une détection
// UNIQUEMENT par nom d'option (jamais par catégorie pour ce cas précis) -
// plus sûr, incapable de masquer massivement par erreur, même si ça
// signifie que "Crosse de contrepoids" etc. ne sont plus filtrables pour
// l'instant sans un vrai risque de collatéral.
// EN: ⚠️ REMOVED (2026-08-03, v3) - the "mod" keyword proved far too
// broad: screenshot evidence (Vigile Liminaire) showed it hid not only
// the intended weapon mods, but SEVERAL real build perks AND the
// Catalyst - which apparently share a broader common category than
// expected (same problem family as the Doctrine's "Abilities" grouping).
// Back to OPTION-NAME-ONLY detection (never by category for this specific
// case) - safer, incapable of mass-hiding by mistake, even if it means
// "Counterweight Stock" etc. aren't filterable for now without real
// collateral risk.
const MOTS_CATEGORIE_COSMETIQUE = ["souvenir", "memento", "ornement", "ornament", "suivi", "tracker"];
// FR : ⚠️ AJOUT (04/08/2026) - "memento" ajouté suite à une remarque de
// l'utilisateur ("les souvenirs sont aussi appelés Memento"), MAIS avec
// une vraie prudence : l'utilisateur a lui-même signalé le risque,
// "Memento Mori" est une perk RÉELLE de combat (As de Pique). On cible
// donc "memento:" AVEC DEUX-POINTS (convention de nommage anglaise des
// souvenirs cosmétiques, ex: "Memento: Deep Stone Crypt"), qui ne
// correspond PAS à "Memento Mori" (aucun deux-points après "memento").
// EN: ⚠️ ADDED (2026-08-04) - "memento" added following a user remark
// ("mementos are also called Memento"), BUT with real caution: the user
// themselves flagged the risk, "Memento Mori" is a REAL combat perk (Ace
// of Spades). So we target "memento:" WITH A COLON (English naming
// convention for cosmetic mementos, e.g. "Memento: Deep Stone Crypt"),
// which does NOT match "Memento Mori" (no colon after "memento" there).
const MOTS_OPTION_COSMETIQUE = ["palier", "compte-frags", "compte frags", "souvenir", "suivi", "memento:"];

export function obtenirOptionsToutesColonnes(
  db: Database,
  itemHash: number,
  hashesEquipes: number[] = [],
  // FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - `inclureMasquees` : renvoie AUSSI les colonnes cosmétiques / d'ornement normalement masquées, marquées `masquee` (interrupteur « Afficher les perks inutiles » de la Forge). Par défaut (absent) le comportement est strictement celui d'avant : vérifié par un instantané (`tests/logique/instantanes/colonnes-arme.json`).
  // EN: ⚠️ ADDED - `inclureMasquees` also returns the normally hidden cosmetic/ornament columns, flagged `masquee`. Default behaviour unchanged (snapshot-tested).
  reglages: { inclureMasquees?: boolean } = {}
): ColonneOptionsArme[] {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.sockets?.socketEntries) return [];

  // FR : nom de catégorie par index de socket, pour le filtrage cosmétique/progression.
  const nomCategorieParSocket = new Map<number, string>();
  for (const cat of def.sockets.socketCategories ?? []) {
    const catDef = obtenirDefinition<DestinySocketCategoryDefinition>(db, "DestinySocketCategoryDefinition", cat.socketCategoryHash);
    const nom = normaliser(catDef?.displayProperties?.name ?? "");
    for (const idx of cat.socketIndexes) nomCategorieParSocket.set(idx, nom);
  }

  const colonnes: ColonneOptionsArme[] = [];

  def.sockets.socketEntries.forEach((entree, socketIndex) => {
    // FR : ⚠️ RETIRÉ (04/08/2026) - le filtre précoce par nom de
    // catégorie PARENTE (avant même de construire les options) posait le
    // même problème que le mot-clé "mod" précédemment : plusieurs sockets
    // conceptuellement différents (perks réels ET cosmétiques) semblent
    // parfois partager UNE SEULE catégorie parente plus large que prévu -
    // filtrer à ce niveau risque de supprimer de vrais perks en même
    // temps que le bruit visé. On ne filtre plus QUE sur les options
    // elles-mêmes (plus bas), une fois résolues - plus précis, sans
    // risque de collatéral sur une catégorie entière.
    // EN: ⚠️ REMOVED (2026-08-04) - the early filter by PARENT category
    // name (before even building the options) had the same problem as
    // the "mod" keyword before: several conceptually different sockets
    // (real perks AND cosmetics) sometimes seem to share ONE parent
    // category broader than expected - filtering at that level risks
    // removing real perks along with the intended noise. We now only
    // filter on the options THEMSELVES (further below), once resolved -
    // more precise, no risk of collateral damage on an entire category.
    let hashesOptions: number[] = (entree.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    if (hashesOptions.length === 0 && entree.reusablePlugSetHash) {
      const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.reusablePlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    // FR : ⚠️ AJOUT (04/08/2026) - repli sur randomizedPlugSetHash (pool
    // de perks à ROLLS ALÉATOIRES - barillet/munitions/perks d'arme
    // typiquement), jamais vérifié jusqu'ici - explique probablement
    // pourquoi des colonnes de perks structurantes n'affichaient aucune
    // option (confirmé par l'utilisateur : colonnes 2,3,4,5,11 vides sur
    // "Vigile Liminaire").
    // EN: ⚠️ ADDED (2026-08-04) - fallback on randomizedPlugSetHash (pool
    // of RANDOM-roll perks - barrel/magazine/weapon perks typically),
    // never checked until now - likely explains why structuring perk
    // columns showed no options at all (confirmed by user: columns
    // 2,3,4,5,11 empty on "Vigile Liminaire").
    if (hashesOptions.length === 0 && entree.randomizedPlugSetHash) {
      const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", entree.randomizedPlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    if (hashesOptions.length === 0 && entree.singleInitialItemHash) {
      hashesOptions = [entree.singleInitialItemHash];
    }
    if (hashesOptions.length === 0) return;

    const options: OptionSocket[] = [];
    for (const hashOption of hashesOptions) {
      const defOption = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", hashOption);
      if (!defOption?.displayProperties?.name) continue;

      const resolu = obtenirDescriptionComplete(db, hashOption);
      if (resolu.estOrnement) continue; // ⚠️ ornement - jamais affiché comme option de roll
      const description = resolu.description;

      options.push({
        hash: hashOption,
        nom: defOption.displayProperties.name,
        description,
        icone: urlIcone(defOption.displayProperties.icon),
        equipeEnJeu: hashesEquipes.includes(hashOption),
      });
    }
    // FR : masque la colonne si TOUTES ses options correspondent à un mot-clé
    // de progression/cosmétique (palier de catalyseur, compte-frags...).
    // ⚠️ RETIRÉ (03/08/2026) : le seuil ">6 options = mod générique" était
    // trop agressif - l'utilisateur a signalé que de vraies colonnes de
    // perks structurantes ont légitimement plus de 6 choix (ex: "The
    // Forward Path" sur light.gg). Retour au filtre par mots-clés seul.
    // EN: ⚠️ REMOVED (2026-08-03): the ">6 options = generic mod"
    // threshold was too aggressive - the user reported that real,
    // structuring perk columns can legitimately have more than 6 choices
    // (e.g. "The Forward Path" on light.gg). Back to keyword-only filtering.
    // FR : ⚠️ CHANGÉ (04/08/2026) - "TOUTES les options" (every) ne
    // suffisait pas pour masquer les colonnes Souvenir/Palier malgré le
    // mot-clé présent : un pool de souvenirs ou de paliers de maîtrise
    // contient probablement des options aux noms variés (pas toutes
    // littéralement "Souvenir de X" ou "Palier X"), donc au moins une ne
    // matchait jamais, empêchant `every()` de passer. Les mots-clés
    // utilisés ici ("palier", "compte-frags", "souvenir", "suivi") sont
    // assez spécifiques pour qu'UNE SEULE option correspondante suffise à
    // identifier fiablement toute la colonne.
    // EN: ⚠️ CHANGED (2026-08-04) - "ALL options" (every) wasn't enough to
    // hide the Memento/Tier columns despite the matching keyword: a
    // memento or masterwork-tier pool likely contains options with varied
    // names (not all literally "Memento of X" or "Tier X"), so at least
    // one never matched, preventing `every()` from passing. The keywords
    // used here ("tier", "kill-tracker", "memento", "tracker") are
    // specific enough that a SINGLE matching option is enough to reliably
    // identify the whole column.
    // FR : ⚠️ CORRIGÉ (04/08/2026, v2) - "Pulsation triomphale" échappait
    // au filtre car son NOM ne contient aucun mot-clé - c'est sa
    // DESCRIPTION qui révèle sa vraie nature ("Appliquez ce mod d'arme
    // pour ajouter un effet visuel festif... Ce mod ne peut être
    // appliqué qu'aux armes de palier 5."), confirmé par l'utilisateur.
    // On vérifie maintenant le nom ET la description, et on ajoute
    // "effet visuel festif" (déjà utilisé pour les infobulles
    // légendaires, jamais repris ici).
    // EN: ⚠️ FIXED (2026-08-04, v2) - "Triumphant Pulse" escaped the
    // filter because its NAME contains no keyword - its DESCRIPTION
    // reveals its real nature ("Apply this weapon mod to add a festive
    // visual effect... This mod can only be applied to Tier 5
    // weapons."), confirmed by the user. Now checks both name AND
    // description, and adds "festive visual effect" (already used for
    // legendary tooltips, never carried over here).
    const toutesCosmetiques =
      options.length > 0 &&
      options.some((opt) => {
        const texte = `${normaliser(opt.nom)} ${normaliser(opt.description)}`;
        return MOTS_OPTION_COSMETIQUE.some((m) => texte.includes(m)) || texte.includes("effet visuel festif");
      });
    // FR : ⚠️ AJOUT (04/08/2026) - exclut aussi une colonne d'ornement dont
    // la DESCRIPTION contient littéralement "ornement d'arme" (le nom
    // cosmétique lui-même, ex: "Vœux de malheur", ne contient aucun
    // mot-clé) - même signal que pour l'infobulle exotique.
    // EN: ⚠️ ADDED (2026-08-04) - also excludes an ornament column whose
    // DESCRIPTION literally contains "weapon ornament" (the cosmetic name
    // itself, e.g. "Curse of Misfortune", has no keyword) - same signal as
    // the exotic tooltip.
    const estOrnement = options.some((opt) => {
      const d = normaliser(opt.description);
      return d.includes("ornement d'arme") || d.includes("weapon ornament");
    });
    if (options.length === 0) return;
    if (toutesCosmetiques || estOrnement) {
      if (reglages.inclureMasquees) colonnes.push({ socketIndex, options, estModConnu: false, masquee: estOrnement ? "ornement" : "cosmetique" });   // ⚠️ v0.4.3 : seulement à la demande
      return;
    }

    // FR : identifie (sans masquer) les mods génériques connus.
    const estModConnu = options.some((opt) => MOTS_MOD_CONNU.some((m) => normaliser(opt.nom).includes(m)));
    colonnes.push({ socketIndex, options, estModConnu });
  });

  return colonnes;
}

// FR : ⚠️ AJOUT (04/08/2026) - source d'obtention d'une arme/armure, via
// le mécanisme officiel Bungie (collectibleHash -> DestinyCollectibleDefinition
// .sourceString), même principe que DIM/light.gg. Le texte brut de Bungie
// contient souvent des formulations génériques ("Récompense de la quête
// d'exotique...") - on les retire pour ne garder que l'essentiel (le nom
// de la source elle-même), demande explicite de l'utilisateur.
// EN: ⚠️ ADDED (2026-08-04) - a weapon/armor's obtain source, via
// Bungie's official mechanism (collectibleHash -> DestinyCollectibleDefinition
// .sourceString), same principle as DIM/light.gg. Bungie's raw text often
// contains generic boilerplate ("Reward from the exotic quest...") - we
// strip it to keep only the essential (the source's name itself),
// explicit user request.
const PREFIXES_SOURCE_A_RETIRER = [
  // FR : ⚠️ ORDRE IMPORTANT - du plus spécifique/long au plus général,
  // pour ne jamais laisser de résidu ("de la" doit être tenté avant "de").
  // EN: ⚠️ ORDER MATTERS - from most specific/longest to most general, so
  // we never leave a residue ("de la" must be tried before "de").
  "recompense de la quete d'exotique ",
  "recompense de la quete exotique ",
  "recompense de la quete ",
  "recompense de l'activite ",
  "recompense de la ",
  "recompense du ",
  "recompense d'",
  "recompense de ",
  "peut etre obtenue en ",
  "peut etre obtenu en ",
  "obtenu en ",
];

function nettoyerTexteSource(texte: string): string {
  let resultat = texte.trim();
  // FR : on compare en version normalisée mais on découpe le texte ORIGINAL
  // (pas normalisé) pour garder les accents/majuscules dans l'affichage final.
  const normalise = normaliser(resultat);
  for (const prefixe of PREFIXES_SOURCE_A_RETIRER) {
    if (normalise.startsWith(prefixe)) {
      resultat = resultat.slice(prefixe.length);
      break;
    }
  }
  // FR : met une majuscule en début de phrase après le retrait du préfixe.
  return resultat.charAt(0).toUpperCase() + resultat.slice(1);
}

/**
 * FR : Renvoie la source d'obtention "nettoyée" d'un objet (arme/armure),
 * ou undefined si l'objet n'a pas d'entrée collectible (fréquent pour
 * certains objets). ⚠️ Le nettoyage des formulations génériques est une
 * heuristique sur le texte français/anglais courant de Bungie - pas
 * garanti à 100%, à ajuster si des cas particuliers apparaissent.
 * EN: Returns an item's (weapon/armor) "cleaned up" obtain source, or
 * undefined if the item has no collectible entry (common for some
 * items). ⚠️ Stripping generic boilerplate is a heuristic on Bungie's
 * common French/English text - not 100% guaranteed, to adjust if edge
 * cases appear.
 */
export function obtenirSource(db: Database, itemHash: number): string | undefined {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.collectibleHash) return undefined;
  const collectible = obtenirDefinition<{ sourceString?: string }>(db, "DestinyCollectibleDefinition", def.collectibleHash);
  if (!collectible?.sourceString) return undefined;
  return nettoyerTexteSource(collectible.sourceString);
}

// FR : ⚠️ AJOUT (04/08/2026) - diagnostic similaire pour vérifier si les
// catégories d'objets (DestinyItemCategoryDefinition - "Fusil à pompe",
// "Revolver", etc.) ont une icône renseignée, AVANT de construire un menu
// déroulant personnalisé pour les afficher (un <select> natif ne peut de
// toute façon afficher que du texte, pas une image - contrainte HTML,
// indépendante de cette question).
// EN: ⚠️ ADDED (2026-08-04) - similar diagnostic to check whether item
// categories (DestinyItemCategoryDefinition - "Shotgun", "Hand Cannon",
// etc.) have an icon set, BEFORE building a custom dropdown to show them
// (a native <select> can only show text anyway - an HTML constraint,
// independent of this question).
export function obtenirDiagnosticIconeCategorieObjet(db: Database): string | null {
  try {
    const stmt = db.prepare(
      "SELECT json FROM DestinyItemCategoryDefinition WHERE json LIKE '%\"visible\":true%' LIMIT 3"
    );
    const lignes: string[] = [];
    while (stmt.step()) {
      lignes.push(stmt.getAsObject().json as string);
    }
    stmt.free();
    if (lignes.length === 0) return "Table DestinyItemCategoryDefinition introuvable ou vide.";
    return lignes.join("\n\n---\n\n");
  } catch (e) {
    return `Erreur en lisant DestinyItemCategoryDefinition : ${(e as Error).message}`;
  }
}

// FR : ⚠️ AJOUT (04/08/2026) - détection du type de champion contré par
// une arme (Implacable/Surchargé/Bloqueur), demande de l'utilisateur.
// Confirmé par capture d'écran : le type apparaît ajouté au NOM du perk
// intrinsèque lui-même ("Œil d'Ahamkara // Implacable"), pas dans une
// description séparée - on vérifie donc le NOM de chaque perk équipé.
// EN: ⚠️ ADDED (2026-08-04) - detection of the champion type countered
// by a weapon (Unstoppable/Overload/Barrier), user request. Confirmed by
// screenshot: the type is appended to the intrinsic perk's own NAME
// ("Eye of Ahamkara // Unstoppable"), not a separate description - so we
// check the NAME of each equipped perk.
// FR : ⚠️ AJOUT (04/08/2026) - cache des résultats anti-champion, par
// base de données. Sans lui, chaque rendu relançait le parcours complet
// des sockets ET des plugsets pour CHAQUE objet affiché (~800 dans le
// coffre), y compris à chaque frappe dans le champ de recherche et à
// chaque changement de filtre - c'était de loin le calcul le plus lourd
// de l'affichage. Le résultat ne dépendant que du hash de l'objet (donnée
// statique du Manifest), il est mis en cache une fois pour toutes.
// WeakMap : le cache disparaît automatiquement si la base est rechargée.
// EN: ⚠️ ADDED (2026-08-04) - anti-champion result cache, per database.
// Without it, every render re-ran the full sockets AND plugsets walk for
// EACH displayed item (~800 in the vault), including on every keystroke
// in the search field and every filter change - by far the heaviest
// computation in the display. Since the result only depends on the item
// hash (static Manifest data), it's cached once and for all. WeakMap: the
// cache is discarded automatically if the database is reloaded.
const CACHE_ANTI_CHAMPION = new WeakMap<Database, Map<number, "surcharge" | "bloqueur" | "implacable" | null>>();

export function obtenirAntiChampion(db: Database, itemHash: number): "surcharge" | "bloqueur" | "implacable" | undefined {
  let cacheBase = CACHE_ANTI_CHAMPION.get(db);
  if (!cacheBase) {
    cacheBase = new Map();
    CACHE_ANTI_CHAMPION.set(db, cacheBase);
  }
  const enCache = cacheBase.get(itemHash);
  if (enCache !== undefined) return enCache ?? undefined;

  const resultat = calculerAntiChampion(db, itemHash);
  cacheBase.set(itemHash, resultat ?? null);
  return resultat;
}

/**
 * FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - anti-champion d'une arme : pour une arme EXOTIQUE,
 * la LISTE DE RÉFÉRENCE de l'utilisateur (relevée dans le jeu) fait foi, comme demandé
 * (« utilise mon fichier, c'est fiable ») ; sinon (arme non exotique, ou nom absent de la
 * liste), la déduction d'origine (`deduireAntiChampion`). Voir
 * lib/manifest/antiChampionExotiques.ts.
 * EN: ⚠️ ADDED - an exotic weapon's anti-champion comes from the user's reference list;
 * otherwise (non-exotic, or name not in the list) the original deduction.
 */
function calculerAntiChampion(db: Database, itemHash: number): "surcharge" | "bloqueur" | "implacable" | undefined {
  const def = obtenirDefinition<{
    itemType?: number;
    itemCategoryHashes?: number[];
    inventory?: { tierType?: number; bucketTypeHash?: number };
    displayProperties?: { name?: string };
  }>(db, "DestinyInventoryItemDefinition", itemHash);
  // FR : ⚠️ CHANGÉ (05/10/2026) - la liste de l'utilisateur s'applique à une arme EXOTIQUE (rareté 6, règle historique) ET, désormais, à une arme dont
  // la définition porte la catégorie 3109687656 : une ANCIENNE version d'un exotique réédité garde son nom mais peut perdre sa rareté. Signalé : la
  // seconde « Lance de Polaris » de l'utilisateur (catégorie 3109687656 seule) n'avait pas d'icône de type ; son anti-champion aurait de même été perdu.
  // Volontairement limité à cette signature OBSERVÉE : en français, un nom d'exotique peut aussi être celui d'une arme légendaire, donc on ne s'appuie
  // pas sur le seul nom. La signification exacte de 3109687656 n'a pas été établie.
  // EN: ⚠️ CHANGED - the list applies to EXOTIC weapons (rarity 6) and now also to weapons carrying category 3109687656 (older versions of reissued exotics).
  // FR : ⚠️ MIS À JOUR (06/10/2026) - la catégorie 3109687656 est celle des objets FACTICES (« Dummies », `itemType` 20) : le rapport de l'utilisateur le montre (35
  // définitions de type 20, toutes dans cette catégorie ; 7 « Lance de Polaris » factices correspondent à sa seconde copie). Un tel objet n'est donc PAS de `itemType` 3 :
  // la condition d'hier (`itemType === 3`) ne couvrait jamais le cas observé. Une copie factice possédée est reconnue comme arme par son SEAU (emplacement d'arme).
  // Cas couverts : (1) exotique de rareté 6 et `itemType` 3 (règle historique) ; (2) objet factice (catégorie 3109687656) dont le seau est un emplacement d'ARME.
  // Toujours exclus : un objet factice hors emplacement d'arme (par exemple un « Colis » rangé ailleurs) et une arme légendaire de même nom (en français, un nom d'exotique
  // peut être celui d'une légendaire).
  // EN: ⚠️ UPDATED - category 3109687656 = DUMMY items (`itemType` 20): such an item is never `itemType` 3, so yesterday's condition never matched the observed case.
  const estAncienneVersion = !!def?.itemCategoryHashes?.includes(3109687656);
  const emplacementArme = ["cinetique", "energie", "lourde"].includes(BUCKET_HASH_VERS_SLOT[def?.inventory?.bucketTypeHash ?? -1] ?? "");
  const copieFactice = estAncienneVersion && emplacementArme;
  if (def && ((def.itemType === 3 && (def.inventory?.tierType === 6 || estAncienneVersion)) || copieFactice)) {
    const reference = championDeReference(def.displayProperties?.name);
    if (reference !== undefined) return reference ?? undefined; // FR : null = « aucun anti-champion » selon la liste / EN: null = none per the list
  }
  return deduireAntiChampion(db, itemHash);
}

/**
 * FR : DÉDUCTION d'origine de l'anti-champion d'une arme (champ `breakerType`, puis texte du
 * perk intrinsèque, puis nom de l'armature). Exportée pour l'outil de contrôle
 * (lib/diagnostic/controleAntiChampionExotiques.ts), qui la compare à la liste de référence.
 * EN: the original DEDUCTION, exported for the check tool.
 */
export function deduireAntiChampion(db: Database, itemHash: number): "surcharge" | "bloqueur" | "implacable" | undefined {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def) return undefined;

  // FR : 1) champ officiel du Manifest, s'il est renseigné (il vaut 0 sur
  // toutes les armes testées, mais ça ne coûte rien et c'est la source la
  // plus fiable quand elle existe).
  const PAR_ENUM: Record<number, "bloqueur" | "surcharge" | "implacable"> = {
    1: "bloqueur", // ShieldPiercing
    2: "surcharge", // Disruption
    3: "implacable", // Stagger
  };
  if (def.breakerType && PAR_ENUM[def.breakerType]) return PAR_ENUM[def.breakerType];

  // FR : 2) ANTI-CHAMPION 2.0 (mise à jour 9.7.0 du 09/06/2026).
  //
  // Les mods anti-Champion ont été RETIRÉS des artefacts : toutes les armes
  // ont désormais une capacité anti-Champion INTRINSÈQUE, déterminée par
  // leur ARMATURE (archétype). Règle générale annoncée par Bungie :
  //   - Agressive, Fort impact          -> Implacable
  //   - Précision, Adaptative           -> Bloqueur
  //   - Légère, Tir rapide              -> Surcharge
  // Plus quelques cas particuliers documentés (déni de zone -> Surcharge,
  // rafale lourde -> Implacable, etc.).
  //
  // On lit donc le nom de l'ARMATURE, c'est-à-dire le plug INTRINSÈQUE de
  // l'arme (premier socket). ⚠️ On ne parcourt SURTOUT PAS toutes les
  // options des plugsets comme le faisait la version précédente : c'est ce
  // qui produisait des faux positifs (un simple mod disponible dans la
  // liste suffisait à déclencher une détection).
  //
  // EN: 2) ANTI-CHAMPION 2.0 (update 9.7.0, 2026-06-09). Anti-Champion mods
  // were REMOVED from artifacts: every weapon now has an INTRINSIC
  // anti-Champion capability determined by its FRAME (archetype). We
  // therefore read the INTRINSIC plug's name (first socket). We must NOT
  // walk every plugset option like the previous version did: that's what
  // produced false positives.
  // FR : ⚠️ AJOUT (04/08/2026) - JETONS DU JEU sur le perk intrinsèque.
  // L'utilisateur a confirmé que les ARMES exotiques emploient exactement la
  // même formulation que les armures (« Efficace contre les [Chancellement]
  // Champions implacables »). C'est ce qui manquait pour les exotiques : ils
  // n'ont pas d'armature standard, donc la table ARMATURE_VERS_CHAMPION ne
  // pouvait rien en dire. Testé prioritairement, avant l'armature.
  // EN: ⚠️ ADDED (2026-08-04) - IN-GAME TOKENS on the intrinsic perk. The user
  // confirmed exotic WEAPONS use the exact same wording as armor. This is what
  // was missing for exotics: they have no standard frame, so the frame table
  // could say nothing about them. Checked before the frame lookup.
  const entrees = def.sockets?.socketEntries ?? [];
  const hashIntrinseque = entrees[0]?.singleInitialItemHash;
  if (hashIntrinseque) {
    const defIntrinseque = obtenirDefinition<{ displayProperties?: { name?: string; description?: string } }>(
      db,
      "DestinyInventoryItemDefinition",
      hashIntrinseque
    );
    const texte = normaliser(
      `${defIntrinseque?.displayProperties?.name ?? ""} ${defIntrinseque?.displayProperties?.description ?? ""}`
    );
    for (const { jeton, type } of JETONS_CHAMPION) {
      if (texte.includes(jeton)) return type;
    }
  }

  const nomArmature = obtenirNomArmature(db, def);
  if (nomArmature) {
    // FR : ⚠️ AJOUT (24/08/2026) - retire aussi les apostrophes (droites ' et
    // typographiques ’), en plus des accents déjà gérés par `normaliser()`.
    // Nécessaire pour le mot-clé "tir d'ensemble" : si le Manifest écrit
    // "Tir d'ensemble" avec une apostrophe différente de celle tapée dans le
    // code, la comparaison échouerait silencieusement - pire que la
    // collision qu'elle corrige. Les mots-clés eux-mêmes doivent donc aussi
    // être dépouillés de leurs apostrophes de la même façon (fait plus bas,
    // dans ARMATURE_VERS_CHAMPION).
    // EN: ⚠️ ADDED - also strips apostrophes (straight and typographic), in
    // addition to accents. Needed for "tir d'ensemble": if the Manifest
    // uses a different apostrophe than the one typed in code, the
    // comparison would silently fail.
    const a = normaliser(nomArmature).replace(/['']/g, "");
    for (const { motCle, champion } of ARMATURE_VERS_CHAMPION) {
      if (a.includes(motCle)) return champion;
    }
  }

  return undefined;
}

/**
 * FR : correspondance armature (archétype) -> type de champion contré,
 * d'après la règle Anti-Champion 2.0 de la mise à jour 9.7.0.
 * Les mots-clés sont volontairement COURTS : on a appris (cf. CHANGELOG,
 * épisode "Fusil à rayon" vs "rayons") que les textes Bungie varient en
 * genre/nombre et en formulation. Les cas les plus spécifiques doivent
 * être placés AVANT les plus génériques, .find() s'arrêtant au premier.
 * EN: frame (archetype) -> countered champion type mapping, per the
 * Anti-Champion 2.0 rule from update 9.7.0. Keywords are deliberately
 * SHORT: Bungie texts vary in gender/number and wording. More specific
 * cases must come BEFORE more generic ones.
 */
const ARMATURE_VERS_CHAMPION: { motCle: string; champion: "surcharge" | "bloqueur" | "implacable" }[] = [
  // Cas particuliers documentés, à tester avant la règle générale.
  // FR : ⚠️ AJOUT (04/08/2026) - lot d'armatures relevées EN JEU par
  // l'utilisateur. Le Manifest ne portant pas cette information, chacune
  // vient d'une observation directe. Les mots-clés sont réduits à leur
  // partie distinctive (leçon "rayon"/"rayons" et "precis"/"precision") :
  // ils restent ainsi tolérants aux variantes de formulation Bungie.
  // EN: ⚠️ ADDED (2026-08-04) - batch of frames observed IN GAME by the
  // user. The Manifest doesn't carry this, so each comes from direct
  // observation. Keywords are reduced to their distinctive part so they
  // tolerate Bungie's wording variants.
  { motCle: "interruption", champion: "bloqueur" },
  // FR : ⚠️ AJOUT (24/08/2026) - confirmé par l'utilisateur en jeu.
  { motCle: "lanceur", champion: "bloqueur" },
  { motCle: "impact eleve", champion: "implacable" },
  // FR : ⚠️ CORRIGÉ (24/08/2026) - "ensemble" seul matchait AUSSI "Ensemble
  // à jamais" (Together Forever, Drang/Zenith), qui d'après les
  // observations de l'utilisateur ne donne JAMAIS Implacable (mais Bloqueur
  // ou Surchargé selon l'arme combinée - voir plus bas, cas volontairement
  // non codé). Toute arme utilisant Together Forever recevait donc une
  // réponse FAUSSE. Rétréci à "tir d'ensemble", qui ne matche plus que
  // Felwinter's Lie.
  // EN: ⚠️ FIXED - "ensemble" alone also matched "Together Forever"
  // (Drang/Zenith), which per the user's observations NEVER gives
  // Implacable. Any Together Forever weapon got a WRONG answer. Narrowed to
  // "tir d'ensemble", matching only Felwinter's Lie now.
  { motCle: "tir densemble", champion: "implacable" },
  { motCle: "pr-55", champion: "bloqueur" },           // "Cadre Héritage PR-55" (Estoc de Redrix)
  { motCle: "attaque", champion: "implacable" },
  { motCle: "soutien", champion: "surcharge" },
  // FR : les deux variantes "calorifique" connues donnent Surchargé. Elles
  // sont listées séparément plutôt que via un "calorifique" générique :
  // si une 3e variante apparaît avec un autre champion, elle affichera le
  // repère "?" au lieu d'hériter silencieusement d'une valeur fausse.
  { motCle: "calorifique equilibree", champion: "surcharge" },
  { motCle: "calorifique dynamique", champion: "surcharge" },
  { motCle: "tir double", champion: "implacable" },
  { motCle: "rafale lourde", champion: "implacable" },
  // FR : ⚠️ AJOUT (04/08/2026) - "Micro-missile", relevé en jeu par
  // l'utilisateur. Même situation que "Tir dispersé" : le Manifest ne
  // porte pas l'information, la correspondance vient d'une observation
  // directe. Placé AVANT la règle générale : le mot-clé est spécifique et
  // ne risque pas d'être capté par une entrée plus large.
  // EN: ⚠️ ADDED (2026-08-04) - "Micro-missile", observed in game by the
  // user. Same situation as "Tir dispersé": the Manifest doesn't carry
  // it, the mapping comes from direct observation.
  { motCle: "micro-missile", champion: "implacable" },
  { motCle: "deni de zone", champion: "surcharge" }, // confirmé en jeu par l'utilisateur (04/08/2026)
  { motCle: "zone de deni", champion: "surcharge" },
  // Règle générale.
  { motCle: "agressive", champion: "implacable" },
  { motCle: "agressif", champion: "implacable" },
  { motCle: "fort impact", champion: "implacable" },
  { motCle: "haut impact", champion: "implacable" },
    // FR : ⚠️ CORRIGÉ (04/08/2026) - "precision" ratait "Cadre de munition
  // PRÉCIS" (Héritage) : le mot-clé était plus long que le texte réel.
  // "precis" couvre les deux formes, même leçon que "rayon"/"rayons".
  { motCle: "precis", champion: "bloqueur" },
  { motCle: "adaptative", champion: "bloqueur" },
  { motCle: "adaptatif", champion: "bloqueur" },
  { motCle: "legere", champion: "surcharge" },
  { motCle: "leger", champion: "surcharge" },
  { motCle: "tir rapide", champion: "surcharge" },
  // FR : ⚠️ AJOUT (04/08/2026) - "Tir dispersé" (relevé sur Sarpédon-D,
  // un Revolver). Le Manifest ne portait RIEN pour cette arme
  // (breakerType = 0 partout, aucun perk porteur) : la correspondance
  // vient d'une observation directe en jeu par l'utilisateur, seule
  // source disponible. Placé près de "tir rapide" par parenté de
  // formulation, mais les deux mots-clés sont distincts (pas de
  // chevauchement possible).
  // EN: ⚠️ ADDED (2026-08-04) - "Tir dispersé" (Scatter Fire, observed on
  // Sarpedon-D, a Hand Cannon). The Manifest carried NOTHING for this
  // weapon (breakerType = 0 everywhere, no perk holding it): the mapping
  // comes from the user's direct in-game observation, the only available
  // source.
  { motCle: "tir disperse", champion: "surcharge" },
  // Épées (armatures spécifiques).
  { motCle: "projection", champion: "bloqueur" },
  { motCle: "vortex", champion: "surcharge" },
  { motCle: "onde", champion: "implacable" },
];

/**
 * FR : renvoie le nom du plug INTRINSÈQUE de l'arme (son armature). On
 * privilégie la catégorisation réelle des sockets quand elle est
 * disponible, avec repli sur le premier socket - c'est celui qui porte
 * l'armature dans tous les exemples observés.
 * EN: returns the weapon's INTRINSIC plug name (its frame). Prefers the
 * real socket categorisation when available, falling back to the first
 * socket - which carries the frame in every observed example.
 */
function obtenirNomArmature(db: Database, def: DestinyItemDefinition): string | undefined {
  const entrees = def.sockets?.socketEntries ?? [];
  if (entrees.length === 0) return undefined;

  // FR : le socket 0 porte l'armature. Confirmé par les deux diagnostics
  // réels fournis par l'utilisateur : Apocalypse -> [0] "Armature
  // adaptative", Mille Voix -> [0] "Œil d'Ahamkara" (perk intrinsèque
  // exotique, qui tient lieu d'armature sur les exotiques).
  // EN: socket 0 carries the frame. Confirmed by the two real diagnostics
  // provided by the user: Apocalypse -> [0] "Adaptive Frame", Thousand
  // Voices -> [0] "Eye of Ahamkara" (exotic intrinsic perk, which plays
  // the frame's role on exotics).
  const hash = entrees[0]?.singleInitialItemHash;
  if (!hash) return undefined;
  const defPlug = obtenirDefinition<{ displayProperties?: { name?: string } }>(
    db,
    "DestinyInventoryItemDefinition",
    hash
  );
  return defPlug?.displayProperties?.name;
}

// FR : ⚠️ AJOUT (04/08/2026) - diagnostic ciblé anti-champion. Après 3
// tentatives infructueuses sur les armes qui ne détectent rien (Mille
// Voix...), alors que d'autres fonctionnent (Apocalypse, Léviathan,
// Parjure, Maître du Tonnerre, Diviseur d'ondes), il faut arrêter de
// deviner et regarder les VRAIES données. Cette fonction vide tous les
// champs plausibles pour une arme donnée : on compare ensuite le dump
// d'une arme qui marche et d'une qui ne marche pas, et la différence
// saute aux yeux.
// EN: ⚠️ ADDED (2026-08-04) - targeted anti-champion diagnostic. After 3
// failed attempts on weapons that detect nothing (Thousand Voices...)
// while others work, it's time to stop guessing and look at the REAL
// data. This dumps every plausible field for a given weapon: comparing a
// working weapon's dump with a failing one makes the difference obvious.
export function obtenirDiagnosticAntiChampion(db: Database, itemHash: number): string {
  const lignes: string[] = [];
  try {
    const def = obtenirDefinition<DestinyItemDefinition & Record<string, unknown>>(
      db,
      "DestinyInventoryItemDefinition",
      itemHash
    );
    if (!def) return "Définition introuvable pour cet objet.";

    lignes.push(`NOM : ${def.displayProperties?.name ?? "(sans nom)"}`);
    lignes.push(`itemHash : ${itemHash}`);
    lignes.push(`itemTypeDisplayName : ${JSON.stringify(def.itemTypeDisplayName)}`);
    // FR : ⚠️ AJOUT (04/08/2026) - depuis Anti-Champion 2.0 (MàJ 9.7.0),
    // c'est l'ARMATURE qui détermine tout : c'est donc la ligne la plus
    // importante du diagnostic. Si une arme n'affiche pas d'icône, c'est
    // presque sûrement que son armature n'est pas encore dans la table
    // ARMATURE_VERS_CHAMPION - le nom brut ci-dessous permet de l'y ajouter.
    lignes.push(`ARMATURE (plug intrinsèque) : ${JSON.stringify(obtenirNomArmature(db, def))}`);
    lignes.push(`breakerType (arme) : ${JSON.stringify(def.breakerType)}`);
    lignes.push(`breakerTypeHash (arme) : ${JSON.stringify(def.breakerTypeHash)}`);

    // FR : tous les champs de la définition contenant "breaker", au cas où
    // Bungie utiliserait un nom auquel je n'ai pas pensé.
    const champsBreaker = Object.keys(def).filter((k) => k.toLowerCase().includes("breaker"));
    lignes.push(`champs contenant "breaker" : ${JSON.stringify(champsBreaker)}`);

    lignes.push("");
    lignes.push("--- def.perks (DestinySandboxPerkDefinition) ---");
    for (const perk of def.perks ?? []) {
      const dp = obtenirDefinition<Record<string, unknown> & { displayProperties?: { name?: string } }>(
        db,
        "DestinySandboxPerkDefinition",
        perk.perkHash
      );
      lignes.push(
        `  ${perk.perkHash} : "${dp?.displayProperties?.name ?? "?"}"` +
          ` | breakerType=${JSON.stringify(dp?.breakerType)}` +
          ` | breakerTypeHash=${JSON.stringify(dp?.breakerTypeHash)}`
      );
    }

    lignes.push("");
    lignes.push("--- sockets : plugs initiaux ---");
    for (const [i, entree] of (def.sockets?.socketEntries ?? []).entries()) {
      const hash = entree.singleInitialItemHash;
      if (!hash) continue;
      const dp = obtenirDefinition<DestinyItemDefinition & Record<string, unknown>>(
        db,
        "DestinyInventoryItemDefinition",
        hash
      );
      lignes.push(
        `  [${i}] ${hash} : "${dp?.displayProperties?.name ?? "?"}"` +
          ` | breakerType=${JSON.stringify(dp?.breakerType)}` +
          ` | breakerTypeHash=${JSON.stringify(dp?.breakerTypeHash)}`
      );
    }

    lignes.push("");
    lignes.push(`RÉSULTAT ACTUEL DE LA DÉTECTION : ${obtenirAntiChampion(db, itemHash) ?? "(aucun)"}`);
  } catch (e) {
    lignes.push(`Erreur pendant le diagnostic : ${(e as Error).message}`);
  }
  return lignes.join("\n");
}

// FR : ⚠️ AJOUT (04/08/2026) - icônes de perks filtrées des éléments
// purement cosmétiques (revêtements, ornements, compte-frags, paliers de
// pièce maîtresse, souvenirs...). Extrait ici pour être partagé entre
// l'inventaire/coffre et "Mon Build", l'utilisateur voulant exactement la
// même présentation aux deux endroits. Jusqu'ici ce filtrage n'existait
// que dans le texte de l'infobulle, pas sur les icônes affichées : les
// cosmétiques prenaient donc des places dans les 4 icônes montrées.
// EN: ⚠️ ADDED (2026-08-04) - perk icons filtered of purely cosmetic
// entries (coatings, ornaments, kill trackers, masterwork tiers,
// mementos...). Extracted here to be shared between inventory/vault and
// "Mon Build", since the user wants the exact same presentation in both.
// Until now this filtering only existed in the tooltip text, not on the
// displayed icons: cosmetics were therefore taking up slots among the 4
// shown icons.
const MOTS_PERK_COSMETIQUE = [
  "revetement",
  "palier",
  "compte-frags",
  "compte frags",
  "ornement",
  "effet visuel festif",
  "souvenir",
  "memento:",
  "suivi",
];

/**
 * FR : ⚠️ CORRIGÉ (04/08/2026) - le plafond était fixé à **4** perks, ce qui
 * masquait systématiquement la dernière colonne (signalé par l'utilisateur,
 * captures à l'appui : « Recombinaison » manquait sur Héritage, « Crosse
 * artisanale » sur la Pochette d'allumettes de Tommy). Porté à **5**, qui
 * correspond au nombre réel de colonnes d'attributs d'une arme.
 *
 * ⚠️ AJOUT : la **particularité d'origine** (« Héritage de Bray »,
 * « Dissipateur »…) est désormais renvoyée SÉPARÉMENT, pour pouvoir être
 * affichée tout à droite des autres icônes comme demandé. Elle n'est pas un
 * perk de colonne : c'est un attribut lié à la SOURCE de l'arme, d'où son
 * traitement à part plutôt qu'un simple relèvement du plafond.
 *
 * EN: ⚠️ FIXED - the cap was 4, systematically hiding the last column
 * (reported by the user with screenshots). Raised to 5, matching a weapon's
 * real number of trait columns. ⚠️ ADDED: the origin trait is now returned
 * SEPARATELY so it can be displayed right of the others as requested - it's
 * not a column perk but an attribute tied to the weapon's SOURCE.
 */
const MOTS_PARTICULARITE_ORIGINE = [
  "particularite d'origine",
  "particularite d origine",
  "origin trait",
];

export interface IconesPerksArme {
  /** FR : perks de colonnes (canon, chargeur, attributs...). / EN: column perks. */
  colonnes: string[];
  /**
   * FR : ⚠️ ENRICHI (24/08/2026) - la particularité d'origine porte désormais
   * son NOM et son EFFET, pas seulement l'URL de son icône. L'infobulle
   * affichait « Particularité d'origine » en dur, ce qui n'apprenait rien :
   * l'intérêt est de savoir que « Héritage de Bray » régénère de l'énergie de
   * compétence, pas qu'il s'agit d'une particularité d'origine.
   * EN: ⚠️ ENRICHED - the origin trait now carries its NAME and EFFECT, not
   * just its icon URL. The tooltip showed a hardcoded generic label, which
   * taught nothing.
   */
  origine?: { icone: string; nom: string; description: string };
}

// FR : ⚠️ AJOUT (24/08/2026, passe de debug) - cache manquant sur la fonction
// la plus COÛTEUSE du rendu d'un objet : elle résout une définition Manifest
// PAR PLUG (jusqu'à ~12 par arme), et elle est appelée à chaque affichage de
// chaque ligne, donc à chaque frappe dans la recherche.
// Clé de cache : la liste des hashes elle-même (jointe), pas l'itemHash - deux
// exemplaires d'une même arme peuvent avoir des perks DIFFÉRENTS, les mettre
// en cache sur l'itemHash afficherait les perks du mauvais exemplaire.
// EN: ⚠️ ADDED (debug pass) - missing cache on the COSTLIEST function of an
// item's render: it resolves one Manifest definition PER PLUG (~12 per
// weapon), called on every row render. Cache key is the hash LIST, not the
// itemHash - two copies of the same weapon can roll different perks, keying on
// itemHash would show the wrong copy's perks.
const CACHE_PERKS_ARME = new WeakMap<Database, Map<string, IconesPerksArme>>();

export function obtenirIconesPerksArme(db: Database, perkHashes: number[], maximum = 5): IconesPerksArme {
  let cache = CACHE_PERKS_ARME.get(db);
  if (!cache) {
    cache = new Map();
    CACHE_PERKS_ARME.set(db, cache);
  }
  const cle = `${maximum}:${perkHashes.join(",")}`;
  const enCache = cache.get(cle);
  if (enCache) return enCache;

  const resultat = calculerIconesPerksArme(db, perkHashes, maximum);
  cache.set(cle, resultat);
  return resultat;
}

function calculerIconesPerksArme(db: Database, perkHashes: number[], maximum: number): IconesPerksArme {
  // FR : ⚠️ CHANGÉ (27/09/2026, v0.2.3) - le tri (cosmétiques écartés,
  // particularité d'origine à part) est désormais fait par
  // `obtenirPerksArmeNommes`, partagée avec la fiche d'un build. Résultat
  // identique : mêmes filtres, même ordre, même limite.
  // EN: ⚠️ CHANGED - sorting now done by the shared function; same result.
  const { colonnes, origine } = obtenirPerksArmeNommes(db, perkHashes, maximum);
  return { colonnes: colonnes.map((c) => c.icone), origine };
}

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.3) - perks d'une arme (ou mods d'une
 * armure) AVEC leur nom, pour la fiche d'un build et sa version texte.
 * Source unique du tri : `calculerIconesPerksArme` s'appuie dessus, donc la
 * fiche montre exactement ce que montrent Mon Build et l'Inventaire.
 * EN: ⚠️ ADDED - a weapon's perks (or armor's mods) WITH names, for the
 * build sheet. Single source of the sorting: the icon function uses it too.
 */
export function obtenirPerksArmeNommes(
  db: Database,
  perkHashes: number[],
  maximum: number
): { colonnes: { nom: string; icone: string }[]; origine?: { icone: string; nom: string; description: string } } {
  const colonnes: { nom: string; icone: string }[] = [];
  let origine: IconesPerksArme["origine"];

  for (const hash of perkHashes) {
    const def = obtenirDefinition<{
      displayProperties?: { name?: string; description?: string; icon?: string };
      itemTypeDisplayName?: string;
    }>(db, "DestinyInventoryItemDefinition", hash);
    if (!def?.displayProperties?.icon) continue;

    const nom = normaliser(def.displayProperties.name ?? "");
    const desc = normaliser(def.displayProperties.description ?? "");
    const type = normaliser(def.itemTypeDisplayName ?? "");
    if (MOTS_PERK_COSMETIQUE.some((m) => nom.includes(m) || desc.includes(m))) continue;

    const url = urlIcone(def.displayProperties.icon);
    if (!url) continue;

    // FR : la particularité d'origine s'identifie par son TYPE affiché
    // ("Particularité d'origine"), pas par son nom - lequel change à chaque
    // arme ("Héritage de Bray", "Dissipateur"...) et serait donc impossible à
    // lister exhaustivement.
    if (MOTS_PARTICULARITE_ORIGINE.some((m) => type.includes(m) || desc.includes(m))) {
      if (!origine) {
        origine = {
          icone: url,
          nom: def.displayProperties.name ?? "Particularité d'origine",
          description: def.displayProperties.description ?? "",
        };
      }
      continue;
    }

    if (colonnes.length < maximum) colonnes.push({ nom: def.displayProperties.name ?? "", icone: url });
  }
  return { colonnes, origine };
}

/**
 * FR : ⚠️ AJOUT (29/09/2026, v0.2.8) - nature d'un plug d'arme ou d'armure,
 * pour la FICHE D'UN BUILD : export infographique, fiche « 👁 Voir » et
 * copie en texte (décisions de l'utilisateur du 28 et du 30/09/2026 ; même
 * liste pour les trois, construite dans fiche.ts). Mon Build et
 * l'Inventaire gardent leur tri actuel (`obtenirPerksArmeNommes`).
 *
 * Écartés de l'export :
 *   - « cosmetique » : ornements, revêtements, mémentos (dont l'emplacement
 *     de mémento ou de souvenance vide). En plus des mots-clés existants, on lit le TYPE
 *     affiché et la CATÉGORIE du plug donnés par le Manifest : certains
 *     ornements d'armure ont un nom sans aucun mot-clé (« Veste de détective
 *     perspicace » sur l'export réel de l'utilisateur) ;
 *   - « arme_faconnee » : le plug « Arme façonnée » ;
 *   - « archetype » : les 12 archétypes d'armure (Spécialiste...), liste
 *     complète confirmée en jeu (voir knowledge-base/08_GAME_MECHANICS.md) ;
 *   - « amelioration_armure » : le plug « Amélioration d'armure ».
 * Conservés : « perk » (dont « Mod de classe », « Mods d'arme » et les
 * réglages de stats « +Super / -Santé ») et « origine ».
 * EN: ⚠️ ADDED - nature of a weapon/armor plug, for the BUILD SHEET (export,
 * "View" sheet, text copy); Mon Build and the Inventory are unchanged. Excluded from the export: cosmetics (also detected from the plug's
 * type and category), "Shaped Weapon", armor archetypes, "Armor upgrade".
 */
export type NaturePlug = "perk" | "origine" | "cosmetique" | "arme_faconnee" | "archetype" | "amelioration_armure";

const ARCHETYPES_ARMURE = [
  "specialiste", "parangon", "mitrailleur", "grenadier", "pugnace", "rempart",
  "colosse", "demolisseur", "brise-siege", "pilleur", "maitre", "escarmoucheur",
  "specialist", "paragon", "gunner", "brawler", "bulwark", "colossus",
  "demolitionist", "siegebreaker", "reaver", "powerhouse", "skirmisher",
];
// FR : ⚠️ ces mots sont cherchés dans le TYPE affiché et la CATÉGORIE du
// plug, JAMAIS dans son nom : « Memento Mori » est un vrai perk de combat
// (As de Pique), déjà supprimé à tort par un filtre sur le nom par le
// passé (voir MOTS_PERK_COSMETIQUE, 04/08/2026). L'emplacement de mémento
// vide est reconnu par son nom exact.
// EN: these words are looked for in the plug's TYPE and CATEGORY, NEVER in
// its name: "Memento Mori" is a real combat perk. The empty memento socket
// is matched by its exact name.
const MOTS_TYPE_PLUG_COSMETIQUE = ["ornement", "ornament", "revetement", "shader", "memento", "souvenance"];
const MOTS_CATEGORIE_PLUG_COSMETIQUE = ["skins", "shader", "ornament", "memento"];
// FR : ⚠️ « souvenance » ajouté le 30/09/2026 (demande de l'utilisateur) :
// le jeu affiche aussi « Emplacement de souvenance vide ».
// EN: "souvenance" added: the game also shows "Emplacement de souvenance vide".
const NOMS_MEMENTO_VIDE = ["emplacement de memento vide", "emplacement de souvenance vide", "empty memento socket"];

function naturePlug(nom: string, description: string, type: string, categorie: string): NaturePlug {
  const n = nom.trim();
  if (MOTS_PARTICULARITE_ORIGINE.some((m) => type.includes(m) || description.includes(m))) return "origine";
  if (
    MOTS_PERK_COSMETIQUE.some((m) => n.includes(m) || description.includes(m)) ||
    MOTS_TYPE_PLUG_COSMETIQUE.some((m) => type.includes(m)) ||
    MOTS_CATEGORIE_PLUG_COSMETIQUE.some((m) => categorie.includes(m)) ||
    NOMS_MEMENTO_VIDE.includes(n)
  ) {
    return "cosmetique";
  }
  if (n === "arme faconnee" || n === "shaped weapon") return "arme_faconnee";
  if (ARCHETYPES_ARMURE.includes(n)) return "archetype";
  if (n.replace(/['’]/g, " ").replace(/\s+/g, " ") === "amelioration d armure") return "amelioration_armure";
  return "perk";
}

/**
 * FR : ⚠️ AJOUT (29/09/2026, v0.2.8) - TOUS les plugs d'une pièce, dans
 * l'ordre, avec nom, icône et nature (voir `NaturePlug`), sans limite de
 * nombre : l'export fait son propre tri, et une limite appliquée avant ce
 * tri pourrait faire perdre un vrai perk au profit d'un plug écarté ensuite.
 * Les plugs sans icône sont ignorés, comme dans `obtenirPerksArmeNommes`.
 * EN: ⚠️ ADDED - ALL plugs of a piece, in order, with name, icon and nature,
 * no count limit (the export sorts them itself).
 */
export function obtenirPlugsDetailles(
  db: Database,
  perkHashes: number[]
): { hash: number; nom: string; icone: string; nature: NaturePlug }[] {
  const resultat: { hash: number; nom: string; icone: string; nature: NaturePlug }[] = [];
  for (const hash of perkHashes) {
    const def = obtenirDefinition<{
      displayProperties?: { name?: string; description?: string; icon?: string };
      itemTypeDisplayName?: string;
      plug?: { plugCategoryIdentifier?: string };
    }>(db, "DestinyInventoryItemDefinition", hash);
    const url = urlIcone(def?.displayProperties?.icon);
    if (!def || !url) continue;
    resultat.push({
      hash,
      nom: def.displayProperties?.name ?? "",
      icone: url,
      nature: naturePlug(
        normaliser(def.displayProperties?.name ?? ""),
        normaliser(def.displayProperties?.description ?? ""),
        normaliser(def.itemTypeDisplayName ?? ""),
        normaliser(def.plug?.plugCategoryIdentifier ?? "")
      ),
    });
  }
  return resultat;
}

/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - type de munitions d'une arme, lu dans
 * le Manifest (`equippingBlock.ammoType` de sa définition) : 1 = principales,
 * 2 = spéciales, 3 = lourdes ; toute autre valeur (0 aucun, 4 inconnu) ou
 * absence → undefined, et rien n'est affiché. Lu à partir de l'`itemHash` au
 * moment de l'affichage : fonctionne aussi pour les builds enregistrés avant
 * cet ajout et pour les builds importés d'un ami. Source UNIQUE, utilisée
 * partout où le type de munitions est affiché.
 * EN: ⚠️ ADDED - a weapon's ammo type from the Manifest
 * (`equippingBlock.ammoType`: 1 primary, 2 special, 3 heavy). Read from the
 * item hash at display time, so it also works for older and imported builds.
 */
/**
 * FR : ⚠️ AJOUT (02/10/2026) - catégories d'objet du Manifest (`itemCategoryHashes`), qui permettent à
 * l'icône de type d'arme de se rabattre sur la catégorie (fusil d'éclaireur, arc...) quand le texte
 * `itemTypeDisplayName` est vide ou inattendu (cas de la « Lance de Polaris »). Voir
 * `trouverFormeTypeArme` (components/icones/IconeTypeArme.tsx).
 * EN: ⚠️ ADDED - Manifest item categories, letting the weapon-type icon fall back on the category when
 * the type text is empty or unexpected.
 */
export function obtenirCategoriesObjet(db: Database, itemHash: number): number[] | undefined {
  const def = obtenirDefinition<{ itemCategoryHashes?: number[] }>(db, "DestinyInventoryItemDefinition", itemHash);
  return def?.itemCategoryHashes;
}

export function obtenirTypeMunition(db: Database, itemHash: number): TypeMunition | undefined {
  const def = obtenirDefinition<{ equippingBlock?: { ammoType?: number } }>(db, "DestinyInventoryItemDefinition", itemHash);
  switch (def?.equippingBlock?.ammoType) {
    case 1:
      return "principale";
    case 2:
      return "speciale";
    case 3:
      return "lourde";
    default:
      return undefined;
  }
}

/**
 * FR : ⚠️ AJOUT (29/09/2026, v0.2.8) - armature d'une arme (hash, nom,
 * icône) : le plug du premier socket, lu EXACTEMENT comme pour
 * l'anti-champion (`obtenirNomArmature`). L'armature affichée dans l'export
 * est donc celle qui détermine l'icône de champion. Sur une arme exotique,
 * c'est son perk intrinsèque, qui tient lieu d'armature.
 * EN: ⚠️ ADDED - a weapon's frame (hash, name, icon), read EXACTLY like the
 * anti-champion lookup, so the displayed frame is the one behind the icon.
 */
export function obtenirArmatureArme(db: Database, itemHash: number): { hash: number; nom: string; icone?: string } | undefined {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  const hash = def?.sockets?.socketEntries?.[0]?.singleInitialItemHash;
  const nom = def ? obtenirNomArmature(db, def) : undefined;
  if (!hash || !nom) return undefined;
  const defPlug = obtenirDefinition<{ displayProperties?: { icon?: string } }>(db, "DestinyInventoryItemDefinition", hash);
  return { hash, nom, icone: urlIcone(defPlug?.displayProperties?.icon) };
}

// FR : ⚠️ AJOUT (04/08/2026) - abréviation des noms d'objets trop longs,
// demande de l'utilisateur : certains noms débordent des colonnes et font
// passer les icônes à la ligne. Fonction PARTAGÉE pour que le même objet
// s'affiche pareil partout (Inventaire, Coffre, Mon Build, Recherche).
//
// Choix de conception : on n'applique QUE des abréviations explicitement
// listées, on ne tronque jamais automatiquement. Une troncature du type
// "Revolver d'officier de sep..." rendrait deux objets proches
// indiscernables, ce qui est pire qu'un nom long. La liste s'enrichit au
// cas par cas, sur signalement.
//
// EN: ⚠️ ADDED (2026-08-04) - shortening of overly long item names, user
// request: some names overflow their column and push icons onto the next
// line. SHARED function so the same item displays identically everywhere.
// Design choice: we only apply explicitly listed abbreviations, never
// automatic truncation - a "Revolver d'officier de sep..." cut would make
// two similar items indistinguishable, which is worse than a long name.
// The list grows case by case, on report.
const ABREVIATIONS_NOM: { motif: RegExp; remplacement: string }[] = [
  // FR : "(temps perdu)" concerne toute une famille d'armes, pas seulement
  // la Grande Faucheuse - d'où la règle générale plutôt qu'une entrée par
  // arme (précision explicite de l'utilisateur).
  { motif: /\(temps perdu\)/gi, remplacement: "(TP)" },
  { motif: /Revolver d['’]officier de septième Séraphin/gi, remplacement: "Revo. Off. Septième Séraph" },
];

export function raccourcirNom(nom: string | undefined): string {
  if (!nom) return "";
  let resultat = nom;
  for (const { motif, remplacement } of ABREVIATIONS_NOM) {
    resultat = resultat.replace(motif, remplacement);
  }
  return resultat;
}

// FR : ⚠️ AJOUT (04/08/2026) - bonus de Set d'armure (Pilier 4), sur des
// données réelles confirmées par l'utilisateur (voir diagnostic "Masque
// du grand zélé" -> "Souvenir d'Athéon"). Structure réelle :
// DestinyEquipableItemSetDefinition.setItems (les objets du set) +
// .setPerks[] (chaque entrée : requiredSetCount + sandboxPerkHash).
// EN: ⚠️ ADDED (2026-08-04) - Armor Set bonuses (Pillar 4), on real data
// confirmed by the user (see "Helm of Saint-14" diagnostic ->
// "Vault of Glass Memento"). Real structure:
// DestinyEquipableItemSetDefinition.setItems (the set's items) +
// .setPerks[] (each entry: requiredSetCount + sandboxPerkHash).
export interface BonusSetArmure {
  nomSet: string;
  perks: { requiredSetCount: number; nom: string; description: string; icone?: string }[];
}

// FR : ⚠️ OPTIMISÉ (04/08/2026) - INDEX construit UNE SEULE FOIS par base,
// au lieu d'une requête SQL par objet.
//
// Le problème corrigé : la version précédente mettait en cache le résultat
// PAR itemHash, mais devait pour cela lancer une requête `LIKE '%hash%'` sur
// toute la table `DestinyEquipableItemSetDefinition` à chaque objet inconnu.
// Sur un coffre de ~800 objets, cela faisait jusqu'à 800 parcours complets de
// table, et un `LIKE` non ancré ne peut utiliser aucun index SQLite.
//
// La table des sets est petite (quelques dizaines d'entrées) : on la lit
// intégralement une fois, et on construit une Map itemHash -> set. Le coût
// passe de « 800 parcours » à « 1 parcours + 800 lectures de Map ».
//
// EN: ⚠️ OPTIMISED (2026-08-04) - index built ONCE per database instead of one
// SQL query per item. The previous version cached per itemHash but had to run
// a `LIKE '%hash%'` scan over the whole table for each unknown item - up to
// 800 full table scans for a full vault, and an unanchored LIKE can use no
// SQLite index. The sets table is small, so we read it once into a Map.
const INDEX_SETS = new WeakMap<Database, Map<number, BonusSetArmure>>();

function construireIndexSets(db: Database): Map<number, BonusSetArmure> {
  const index = new Map<number, BonusSetArmure>();
  try {
    const stmt = db.prepare("SELECT json FROM DestinyEquipableItemSetDefinition");
    while (stmt.step()) {
      const set = JSON.parse(String(stmt.getAsObject().json)) as {
        displayProperties?: { name?: string };
        setItems?: number[];
        setPerks?: { requiredSetCount: number; sandboxPerkHash: number }[];
      };
      if (!set.setItems?.length) continue;

      const perks = (set.setPerks ?? [])
        .map((p) => {
          const defPerk = obtenirDefinition<{ displayProperties?: { name?: string; description?: string; icon?: string } }>(
            db,
            "DestinySandboxPerkDefinition",
            p.sandboxPerkHash
          );
          return {
            requiredSetCount: p.requiredSetCount,
            nom: defPerk?.displayProperties?.name ?? "?",
            description: defPerk?.displayProperties?.description ?? "",
            icone: urlIcone(defPerk?.displayProperties?.icon),
          };
        })
        .sort((a, b) => a.requiredSetCount - b.requiredSetCount);

      const bonus: BonusSetArmure = { nomSet: set.displayProperties?.name ?? "?", perks };
      // FR : on indexe par itemHash exact (pas de LIKE), ce qui supprime au
      // passage le risque de faux positif que l'ancienne version devait
      // filtrer après coup.
      for (const hash of set.setItems) index.set(hash, bonus);
    }
    stmt.free();
  } catch {
    // FR : table absente ou format inattendu - index vide, pas de blocage.
  }
  return index;
}

export function obtenirBonusSet(db: Database, itemHash: number): BonusSetArmure | undefined {
  let index = INDEX_SETS.get(db);
  if (!index) {
    index = construireIndexSets(db);
    INDEX_SETS.set(db, index);
  }
  return index.get(itemHash);
}

// FR : ⚠️ AJOUT (04/08/2026) - diagnostic de la CAPACITÉ EN FRAGMENTS
// d'un aspect. L'utilisateur a signalé que le nombre de fragments
// équipables dépend des aspects choisis (2 ou 3 chacun), alors que
// l'appli suppose systématiquement 6 emplacements - ce qui fausserait le
// scoring des builds plus limités.
//
// Je ne sais PAS où le Manifest range cette information : plusieurs
// champs sont plausibles (investmentStats avec un hash de stat dédié,
// energyCapacity, un plug spécifique...). Vu le nombre de suppositions
// erronées de cette session, ce diagnostic affiche TOUS les candidats
// d'un coup pour trancher sur données réelles.
//
// Méthode : on compare deux aspects connus pour différer (un à 2
// fragments, un à 3) et on cherche le champ dont la valeur change de la
// même façon. C'est cette comparaison qui donne la réponse, pas un champ
// isolé.
//
// EN: ⚠️ ADDED (2026-08-04) - diagnostic for an aspect's FRAGMENT
// CAPACITY. The user reported that the number of equippable fragments
// depends on chosen aspects (2 or 3 each), while the app assumes 6 slots
// throughout - which would skew scoring for more limited builds. I do NOT
// know where the Manifest stores this, so this dumps ALL plausible
// candidates at once to settle it on real data. Compare two aspects known
// to differ (one with 2, one with 3) and look for the field that varies
// accordingly.
export function obtenirDiagnosticCapaciteFragments(db: Database, aspectHash: number): string {
  const def = obtenirDefinition<
    DestinyItemDefinition & {
      plug?: { energyCapacity?: unknown; plugCategoryIdentifier?: string };
      investmentStats?: Array<{ statTypeHash: number; value: number }>;
      stats?: { stats?: Record<string, { statHash: number; value: number }> };
    }
  >(db, "DestinyInventoryItemDefinition", aspectHash);
  if (!def) return "Définition introuvable pour cet aspect.";

  const lignes: string[] = [];
  lignes.push(`ASPECT : ${def.displayProperties?.name ?? "?"}`);
  lignes.push(`hash : ${aspectHash}`);
  lignes.push(`description : ${(def.displayProperties?.description ?? "").replace(/\s+/g, " ").slice(0, 200)}`);
  lignes.push("");

  // Candidat 1 : investmentStats (le plus probable a priori).
  lignes.push(`--- investmentStats (${def.investmentStats?.length ?? 0}) ---`);
  for (const s of def.investmentStats ?? []) {
    const defStat = obtenirDefinition<{ displayProperties?: { name?: string } }>(
      db,
      "DestinyStatDefinition",
      s.statTypeHash
    );
    lignes.push(`  statTypeHash ${s.statTypeHash} = ${s.value}   ("${defStat?.displayProperties?.name ?? "?"}")`);
  }

  // Candidat 2 : bloc "stats" résolu.
  const stats = def.stats?.stats ?? {};
  lignes.push(`--- stats.stats (${Object.keys(stats).length}) ---`);
  for (const [hash, s] of Object.entries(stats)) {
    const defStat = obtenirDefinition<{ displayProperties?: { name?: string } }>(
      db,
      "DestinyStatDefinition",
      Number(hash)
    );
    lignes.push(`  ${hash} = ${s.value}   ("${defStat?.displayProperties?.name ?? "?"}")`);
  }

  // Candidat 3 : bloc plug (energyCapacity et identifiant de catégorie).
  lignes.push(`--- plug ---`);
  lignes.push(`  plugCategoryIdentifier : ${JSON.stringify(def.plug?.plugCategoryIdentifier)}`);
  lignes.push(`  energyCapacity : ${JSON.stringify(def.plug?.energyCapacity)}`);

  // Candidat 4 : tout champ dont le NOM évoque une capacité/un nombre de
  // slots - filet de sécurité si la donnée est ailleurs que prévu.
  const motsCles = ["capacity", "energy", "slot", "fragment", "count"];
  const champsSuspects = Object.keys(def).filter((k) =>
    motsCles.some((m) => k.toLowerCase().includes(m))
  );
  lignes.push(`--- autres champs au nom évocateur ---`);
  lignes.push(`  ${champsSuspects.length > 0 ? champsSuspects.join(", ") : "(aucun)"}`);
  for (const champ of champsSuspects) {
    lignes.push(`  ${champ} = ${JSON.stringify((def as unknown as Record<string, unknown>)[champ]).slice(0, 200)}`);
  }

  return lignes.join("\n");
}

// FR : ⚠️ AJOUT (04/08/2026) - capacité en FRAGMENTS d'un aspect,
// identifiée sur données réelles grâce au diagnostic comparatif :
//   "À l'affût"        -> 3   (statTypeHash 2223994109, "Capacité d'énergie d'aspect")
//   "Bourreau élégant" -> 2   (même stat, valeur différente)
// Les deux sources concordent (investmentStats ET plug.energyCapacity),
// ce qui confirme l'interprétation.
//
// On lit `plug.energyCapacity.capacityValue` en priorité (accès direct,
// pas de recherche dans un tableau), avec repli sur investmentStats en
// identifiant la stat par son NOM plutôt que par son hash codé en dur :
// même leçon que pour les types d'armes, un hash peut changer alors que
// le libellé reste stable et lisible.
//
// EN: ⚠️ ADDED (2026-08-04) - an aspect's FRAGMENT capacity, identified on
// real data via the comparative diagnostic. Both sources agree
// (investmentStats AND plug.energyCapacity), confirming the reading. We
// read `plug.energyCapacity.capacityValue` first (direct access), falling
// back to investmentStats, identifying the stat by NAME rather than a
// hardcoded hash.
export function obtenirCapaciteFragmentsAspect(db: Database, aspectHash: number): number {
  const def = obtenirDefinition<
    DestinyItemDefinition & {
      plug?: { energyCapacity?: { capacityValue?: number } };
      investmentStats?: Array<{ statTypeHash: number; value: number }>;
    }
  >(db, "DestinyInventoryItemDefinition", aspectHash);
  if (!def) return 0;

  const direct = def.plug?.energyCapacity?.capacityValue;
  if (typeof direct === "number") return direct;

  for (const s of def.investmentStats ?? []) {
    const defStat = obtenirDefinition<{ displayProperties?: { name?: string } }>(
      db,
      "DestinyStatDefinition",
      s.statTypeHash
    );
    if (normaliser(defStat?.displayProperties?.name ?? "").includes("aspect")) return s.value;
  }
  return 0;
}

/**
 * FR : nombre total d'emplacements de fragments réellement disponibles,
 * = somme des capacités des aspects ÉQUIPÉS. Remplace l'hypothèse « 6
 * emplacements toujours » qui faussait l'affichage et fausserait le
 * scoring (un build ne doit pas être pénalisé pour des fragments qu'il ne
 * PEUT pas équiper).
 * EN: total number of fragment slots actually available = sum of the
 * EQUIPPED aspects' capacities. Replaces the "always 6 slots" assumption
 * which skewed display and would skew scoring.
 */
export function obtenirNbSlotsFragments(db: Database, aspectHashes: number[]): number {
  return aspectHashes
    .filter((h) => h && h !== 0)
    .reduce((total, h) => total + obtenirCapaciteFragmentsAspect(db, h), 0);
}

/**
 * FR : ⚠️ AJOUT (04/08/2026) - retrouve l'INDEX DE SOCKET occupé par un
 * plug donné sur une sous-classe. L'index n'était conservé nulle part
 * dans `GroupeSocket`/`OptionSocket` (on n'en avait pas eu besoin
 * jusqu'ici), et l'API d'insertion de plug l'exige : on le relit donc
 * depuis le Manifest au moment voulu, plutôt que de le deviner.
 * Renvoie -1 si le plug n'est trouvé dans aucun socket.
 * EN: ⚠️ ADDED (2026-08-04) - finds the SOCKET INDEX a given plug sits in
 * on a subclass. The index wasn't kept anywhere in
 * `GroupeSocket`/`OptionSocket` (we hadn't needed it), and the plug
 * insertion API requires it: we re-read it from the Manifest rather than
 * guessing. Returns -1 if the plug isn't found in any socket.
 */
export function trouverIndexSocketPourPlug(db: Database, itemHashSousClasse: number, plugHash: number): number {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHashSousClasse);
  const entrees = def?.sockets?.socketEntries ?? [];
  for (const [index, entree] of entrees.entries()) {
    if (entree.singleInitialItemHash === plugHash) return index;
    if ((entree.reusablePlugItems ?? []).some((p) => p.plugItemHash === plugHash)) return index;
    for (const champ of ["reusablePlugSetHash", "randomizedPlugSetHash"] as const) {
      const hashPlugSet = entree[champ];
      if (!hashPlugSet) continue;
      const plugSet = obtenirDefinition<DestinyPlugSetDefinition>(db, "DestinyPlugSetDefinition", hashPlugSet);
      if ((plugSet?.reusablePlugItems ?? []).some((p) => p.plugItemHash === plugHash)) return index;
    }
  }
  return -1;
}

/**
 * FR : ⚠️ AJOUT (04/08/2026) - nom de l'armature d'une ARME, exposé
 * publiquement pour l'affichage. `obtenirNomArmature` existe déjà mais
 * prend une définition déjà résolue et sert au calcul interne ; celle-ci
 * part d'un itemHash, pour les composants qui veulent juste afficher le
 * nom brut d'une armature non reconnue.
 * EN: ⚠️ ADDED (2026-08-04) - a WEAPON's frame name, exposed publicly for
 * display. `obtenirNomArmature` already exists but takes a resolved
 * definition and serves internal computation; this one starts from an
 * itemHash, for components that just want to show an unrecognised frame's
 * raw name.
 */
export function obtenirNomArmatureArme(db: Database, itemHash: number): string | undefined {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def) return undefined;
  return obtenirNomArmature(db, def);
}

// FR : ⚠️ AJOUT (04/08/2026) - anti-champion des ARMURES EXOTIQUES.
//
// Contexte : depuis la MàJ 9.7.0, l'anti-champion des ARMES vient de leur
// armature. Mais certaines ARMURES EXOTIQUES en fournissent aussi via leur
// perk exotique (13 recensées) - point signalé par l'utilisateur, et que
// j'aurais manqué en ne regardant que les armes.
//
// ⚠️ PRUDENCE VOLONTAIRE sur la méthode. Sur les armes, une détection par
// mots-clés trop large avait produit de FAUX POSITIFS : elle parcourait
// toutes les options des plugsets et matchait un simple mod disponible.
// Ici on applique trois garde-fous :
//   1. on ne lit QUE le perk exotique (socket catégorisé "perk_exotique"),
//      jamais les mods ni les options possibles ;
//   2. on exige la présence d'un mot de CHAMPION *et* d'un marqueur de
//      neutralisation ("étourdi", "stun", "champion"...) - le seul mot
//      "surcharge" peut apparaître dans un texte sans rapport ;
//   3. `breakerType` officiel reste prioritaire s'il est renseigné.
// Mieux vaut manquer une armure que d'en inventer une.
//
// EN: ⚠️ ADDED (2026-08-04) - EXOTIC ARMOR anti-champion. Since 9.7.0 weapons
// get it from their frame, but some exotic armors provide it via their exotic
// perk (13 known). Deliberately cautious method after the false positives on
// weapons: we read ONLY the exotic perk (never mods or possible options), we
// require BOTH a champion word AND a stun marker, and the official
// `breakerType` takes precedence. Better to miss one than to invent one.
// FR : ⚠️ AMÉLIORÉ (04/08/2026) - JETONS DU JEU, confirmés par l'utilisateur
// sur captures d'écran (Companion App et jeu). Le jeu écrit par exemple
// « Efficace contre les [Chancellement] Champions implacables ».
//
// Ces jetons sont un signal BIEN PLUS FIABLE que l'adjectif français, qui
// varie en genre et en nombre ("implacable" / "implacables") - le même piège
// que "rayon"/"rayons" ou "precis"/"precision" plus tôt. Confirmé identique
// sur les ARMES exotiques dont l'intrinsèque mentionne l'anti-champion, donc
// la table sert aux deux cas.
//
// EN: ⚠️ IMPROVED (2026-08-04) - IN-GAME TOKENS, confirmed by the user from
// screenshots. These are FAR more reliable than the French adjective, which
// varies in gender and number - the same trap as "rayon"/"rayons" earlier.
// Confirmed identical on exotic WEAPONS, so this table serves both cases.
export const JETONS_CHAMPION: { jeton: string; type: "surcharge" | "bloqueur" | "implacable" }[] = [
  { jeton: "chancellement", type: "implacable" },
  { jeton: "perforation de bouclier", type: "bloqueur" },
  { jeton: "perturbation", type: "surcharge" },
];

// FR : marqueurs de repli, utilisés si aucun jeton n'est trouvé. Moins sûrs
// (l'adjectif varie), d'où leur rôle secondaire.
// EN: fallback markers, used when no token is found. Less reliable.
const MARQUEURS_NEUTRALISATION = [
  "champion",
  "etourdi",
  "etourdit",
  "etourdir",
  "etourdissement",
  "stun",
  "stagger",
  "neutralise",
];

// FR : ⚠️ AJOUT (24/08/2026, passe de debug) - cache manquant. Cette fonction
// est appelée 2 fois par objet affiché et parcourt les sockets + résout une
// définition par plug, sans jamais mettre son résultat en cache - contrairement
// à `obtenirAntiChampion` (armes) qui en a un depuis longtemps. Sur un coffre
// de plusieurs centaines d'armures exotiques, le travail était intégralement
// refait à chaque rendu, y compris à chaque frappe dans la recherche.
// EN: ⚠️ ADDED (debug pass) - missing cache. Called twice per displayed item
// and walks sockets resolving one definition per plug, with no caching -
// unlike `obtenirAntiChampion` (weapons) which has had one for a while.
type ResultatAntiChampionArmure = { type: "surcharge" | "bloqueur" | "implacable"; source: string };
const CACHE_ANTI_CHAMPION_ARMURE = new WeakMap<Database, Map<number, ResultatAntiChampionArmure | null>>();

export function obtenirAntiChampionArmure(
  db: Database,
  itemHash: number
): ResultatAntiChampionArmure | undefined {
  let cache = CACHE_ANTI_CHAMPION_ARMURE.get(db);
  if (!cache) {
    cache = new Map();
    CACHE_ANTI_CHAMPION_ARMURE.set(db, cache);
  }
  const enCache = cache.get(itemHash);
  if (enCache !== undefined) return enCache ?? undefined;

  const resultat = calculerAntiChampionArmure(db, itemHash);
  cache.set(itemHash, resultat ?? null);
  return resultat;
}

function calculerAntiChampionArmure(
  db: Database,
  itemHash: number
): ResultatAntiChampionArmure | undefined {
  const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.sockets?.socketEntries) return undefined;

  // 1) champ officiel, s'il est renseigné
  const PAR_ENUM: Record<number, "bloqueur" | "surcharge" | "implacable"> = {
    1: "bloqueur",
    2: "surcharge",
    3: "implacable",
  };
  if (def.breakerType && PAR_ENUM[def.breakerType]) {
    return { type: PAR_ENUM[def.breakerType], source: "champ breakerType de l'armure" };
  }

  // 2) uniquement le perk EXOTIQUE, pas les mods ni les options de plugset
  const categories = obtenirCategorieSocketsParIndex(db, itemHash);
  if (!categories) return undefined;

  for (const [index, categorie] of categories.entries()) {
    if (categorie !== "perk_exotique") continue;
    const hash = def.sockets.socketEntries[index]?.singleInitialItemHash;
    if (!hash) continue;
    const defPerk = obtenirDefinition<{ displayProperties?: { name?: string; description?: string } }>(
      db,
      "DestinyInventoryItemDefinition",
      hash
    );
    const nom = defPerk?.displayProperties?.name ?? "";
    const texte = normaliser(`${nom} ${defPerk?.displayProperties?.description ?? ""}`);

    // FR : 1) jetons du jeu — méthode principale, insensible aux variations
    // de genre/nombre de l'adjectif. Un jeton suffit à lui seul : sa présence
    // est déjà un marqueur de neutralisation, pas besoin d'un second garde-fou.
    for (const { jeton, type } of JETONS_CHAMPION) {
      if (texte.includes(jeton)) return { type, source: nom };
    }

    // FR : 2) repli sur l'adjectif, avec garde-fou : il faut AUSSI un
    // marqueur de neutralisation, le seul mot "surcharge" pouvant apparaître
    // dans un texte sans aucun rapport avec les Champions.
    if (!MARQUEURS_NEUTRALISATION.some((m) => texte.includes(m))) continue;

    if (texte.includes("surcharg")) return { type: "surcharge", source: nom };
    if (texte.includes("bloqueur")) return { type: "bloqueur", source: nom };
    if (texte.includes("implacable")) return { type: "implacable", source: nom };
  }

  return undefined;
}

// FR : ⚠️ AJOUT (04/08/2026) - diagnostic de DestinyArtifactDefinition, la
// table que l'appli ne lit pas encore.
//
// Objectif : remplacer `src/data/artefacts.ts` (généré depuis la base de
// connaissance, en ANGLAIS) par les données officielles du Manifest, qui sont
// traduites par Bungie. Ça supprimerait du même coup ma traduction par
// remplacement de termes, qui produit du texte grammaticalement bancal.
//
// Ce diagnostic vérifie AVANT de coder : la table existe-t-elle, combien
// d'artefacts, et surtout la structure (tiers, items) permet-elle de
// retrouver les 7 slots × 3 tiers qu'on affiche aujourd'hui ?
//
// EN: ⚠️ ADDED (2026-08-04) - diagnostic for DestinyArtifactDefinition, a table
// the app doesn't read yet. Goal: replace `artefacts.ts` (generated from the
// English knowledge base) with the Manifest's official, Bungie-translated
// data - which would also remove my term-substitution translation. Checks
// BEFORE coding whether the table exists and whether its structure maps to the
// 7 slots x 3 tiers we display.
export function obtenirDiagnosticArtefactManifest(db: Database): string {
  const lignes: string[] = [];
  try {
    const compte = db.prepare("SELECT COUNT(*) AS n FROM DestinyArtifactDefinition");
    compte.step();
    lignes.push(`Table DestinyArtifactDefinition : ${compte.getAsObject().n} entrée(s)`);
    compte.free();

    const stmt = db.prepare("SELECT json FROM DestinyArtifactDefinition LIMIT 2");
    let index = 0;
    while (stmt.step()) {
      const def = JSON.parse(String(stmt.getAsObject().json)) as {
        displayProperties?: { name?: string; description?: string };
        tiers?: Array<{
          tierHash?: number;
          displayTitle?: string;
          progressRequirement?: string;
          items?: Array<{ itemHash: number }>;
        }>;
        hash?: number;
      };
      lignes.push("");
      lignes.push(`--- Artefact ${index + 1} ---`);
      lignes.push(`nom : ${def.displayProperties?.name ?? "?"}`);
      lignes.push(`hash : ${def.hash}`);
      lignes.push(`nombre de tiers : ${def.tiers?.length ?? 0}`);

      for (const [i, tier] of (def.tiers ?? []).entries()) {
        lignes.push(
          `  tier[${i}] "${tier.displayTitle ?? "?"}" — ${tier.items?.length ?? 0} item(s)`
        );
        // FR : on résout les 3 premiers items pour vérifier que les NOMS et
        // DESCRIPTIONS arrivent bien en français depuis le Manifest FR.
        for (const item of (tier.items ?? []).slice(0, 3)) {
          const defItem = obtenirDefinition<{ displayProperties?: { name?: string; description?: string } }>(
            db,
            "DestinyInventoryItemDefinition",
            item.itemHash
          );
          const nom = defItem?.displayProperties?.name ?? "(non résolu)";
          const desc = (defItem?.displayProperties?.description ?? "").replace(/\s+/g, " ").slice(0, 90);
          lignes.push(`      ${item.itemHash} : "${nom}"`);
          if (desc) lignes.push(`         → ${desc}`);
        }
      }
      index += 1;
    }
    stmt.free();
  } catch (e) {
    lignes.push(`Erreur : ${(e as Error).message}`);
    lignes.push("(la table n'existe peut-être pas sous ce nom — dans ce cas, l'option 2 tombe)");
  }
  return lignes.join("\n");
}

// FR : ⚠️ AJOUT (04/08/2026) - diagnostic des STATS D'ARMURE, plug par plug.
//
// Problème à résoudre : l'appli annonce 575 points là où le jeu en donne 500.
// `inventaire.ts` additionne les `investmentStats` de TOUS les plugs actifs,
// or certains mods (« Surcharge d'arme solaire » par exemple) en déclarent
// sans accorder de statistique au joueur - ce sont des effets de gameplay.
//
// Ce diagnostic liste chaque plug d'une pièce avec ce qu'il apporte ET son
// `plugCategoryIdentifier`. C'est cet identifiant qui devrait permettre de
// distinguer les mods de STATS des mods de COMBAT - à confirmer sur des
// données réelles plutôt qu'en supposant, comme convenu.
//
// EN: ⚠️ ADDED (2026-08-04) - ARMOR STATS diagnostic, plug by plug. The app
// reports 575 points where the game gives 500: `inventaire.ts` sums the
// `investmentStats` of EVERY active plug, but some mods declare them without
// granting the player any stat. This lists each plug with its contribution and
// its `plugCategoryIdentifier`, which should let us tell stat mods from combat
// mods - to be confirmed on real data rather than assumed.
export function obtenirDiagnosticStatsArmure(db: Database, itemHash: number, perkHashes: number[]): string {
  const lignes: string[] = [];
  const def = obtenirDefinition<{ displayProperties?: { name?: string } }>(
    db,
    "DestinyInventoryItemDefinition",
    itemHash
  );
  lignes.push(`ARMURE : ${def?.displayProperties?.name ?? "?"}`);
  lignes.push(`nombre de plugs actifs : ${perkHashes.length}`);
  lignes.push("");

  const totaux = new Map<string, number>();

  for (const plugHash of perkHashes) {
    const defPlug = obtenirDefinition<
      DestinyItemDefinition & { plug?: { plugCategoryIdentifier?: string } }
    >(db, "DestinyInventoryItemDefinition", plugHash);
    const nom = defPlug?.displayProperties?.name ?? "(sans nom)";
    const categorie = defPlug?.plug?.plugCategoryIdentifier ?? "(aucune)";
    const stats = defPlug?.investmentStats ?? [];

    const apports: string[] = [];
    for (const s of stats) {
      const defStat = obtenirDefinition<{ displayProperties?: { name?: string } }>(
        db,
        "DestinyStatDefinition",
        s.statTypeHash
      );
      const nomStat = defStat?.displayProperties?.name ?? `hash ${s.statTypeHash}`;
      apports.push(`${nomStat} ${s.value >= 0 ? "+" : ""}${s.value}`);
      totaux.set(nomStat, (totaux.get(nomStat) ?? 0) + s.value);
    }

    lignes.push(`• ${nom}`);
    lignes.push(`    plugCategoryIdentifier : ${categorie}`);
    lignes.push(`    apporte : ${apports.length > 0 ? apports.join(", ") : "(rien)"}`);
  }

  lignes.push("");
  lignes.push("--- TOTAL calculé par l'appli pour cette pièce ---");
  for (const [nomStat, valeur] of totaux) {
    lignes.push(`  ${nomStat} : ${valeur}`);
  }
  lignes.push("");
  lignes.push("⚠️ Comparez avec les stats affichées EN JEU pour cette pièce :");
  lignes.push("   les plugs dont l'apport ne s'y retrouve pas sont ceux à exclure.");

  return lignes.join("\n");
}

// FR : ⚠️ AJOUT (04/08/2026) - EXTRACTION des perks de l'artefact ACTIF, au
// format prêt à intégrer.
//
// Idée de l'utilisateur, et c'est la bonne : le Manifest ne contient que
// l'artefact équipé, mais il suffit d'en changer en jeu et de relancer
// l'extraction pour les couvrir tous les sept, un par un. On obtient ainsi
// les VRAIES traductions de Bungie pour les 147 perks — ni traduction
// manuelle, ni remplacement de termes approximatif.
//
// La sortie est du JSON directement exploitable : nom français, description
// française, et le hash Manifest (utile si on veut plus tard résoudre les
// icônes ou vérifier une correspondance).
//
// EN: ⚠️ ADDED (2026-08-04) - EXTRACTION of the ACTIVE artifact's perks, ready
// to integrate. The user's idea, and it's the right one: the Manifest only
// holds the equipped artifact, but switching artifact in game and re-running
// the extraction covers all seven one at a time. This yields Bungie's REAL
// translations for all 147 perks - no manual translation, no approximate term
// substitution.
export function extraireArtefactActif(db: Database): string {
  try {
    const stmt = db.prepare("SELECT json FROM DestinyArtifactDefinition LIMIT 1");
    if (!stmt.step()) {
      stmt.free();
      return '{"erreur":"Aucun artefact trouvé dans le Manifest."}';
    }
    const def = JSON.parse(String(stmt.getAsObject().json)) as {
      displayProperties?: { name?: string; description?: string };
      hash?: number;
      tiers?: Array<{ displayTitle?: string; items?: Array<{ itemHash: number }> }>;
    };
    stmt.free();

    const tiers = (def.tiers ?? []).map((tier, indexTier) => ({
      palier: indexTier + 1,
      titre: tier.displayTitle ?? "",
      perks: (tier.items ?? []).map((item) => {
        const defItem = obtenirDefinition<{
          displayProperties?: { name?: string; description?: string; icon?: string };
        }>(db, "DestinyInventoryItemDefinition", item.itemHash);
        return {
          hash: item.itemHash,
          nom: defItem?.displayProperties?.name ?? "",
          description: (defItem?.displayProperties?.description ?? "").replace(/\s+/g, " ").trim(),
          // FR : ⚠️ AJOUT (25/08/2026) - l'icône était déjà lue (voir le
          // type de `defItem` ci-dessus) mais jamais renvoyée. Demande de
          // l'utilisateur : récupérer les icônes des 21 perks, comme pour
          // le nom et la description.
          // EN: ⚠️ ADDED - the icon was already read but never returned.
          icone: defItem?.displayProperties?.icon ?? "",
        };
      }),
    }));

    return JSON.stringify(
      {
        artefact: def.displayProperties?.name ?? "?",
        hash: def.hash,
        description: def.displayProperties?.description ?? "",
        tiers,
      },
      null,
      2
    );
  } catch (e) {
    return JSON.stringify({ erreur: (e as Error).message });
  }
}

// FR : ⚠️ AJOUT (04/08/2026) - icône OFFICIELLE d'un élément de doctrine,
// via le Manifest. Corrige le bug précédent : le code comparait le NOM
// affiché par Bungie ("Solaire", "Vide"...) à nos clés internes
// ("solaire", "abyssal"...), une correspondance texte fragile qui échouait
// silencieusement (casse différente, "Vide" au lieu d'"abyssal", etc.).
//
// Ici on utilise l'ENUM de DestinyDamageTypeDefinition, documenté et stable
// par l'API Bungie (0=Aucun, 1=Cinétique, 2=Arc, 3=Solaire, 4=Abyssal,
// 5=Stase, 6=Filobscur) plutôt qu'une comparaison de texte.
//
// ⚠️ Prismatique n'a PAS d'entrée ici : ce n'est pas un type de dégâts (une
// arme n'inflige jamais de dégâts "prismatiques"), c'est une doctrine qui
// mélange plusieurs éléments. Aucune icône officielle n'existe pour ce cas,
// et il ne faut pas en inventer une en devinant un hash au hasard.
//
// EN: ⚠️ ADDED - OFFICIAL element icon via the Manifest. Fixes the previous
// bug: the code compared Bungie's DISPLAYED name to our internal keys, a
// fragile text match that failed silently. Uses DestinyDamageTypeDefinition's
// stable ENUM instead. ⚠️ Prismatic has NO entry: it's not a damage type (a
// weapon never deals "Prismatic" damage), it's a subclass blending several
// elements - no official icon exists for it.
// FR : ⚠️ CORRIGÉ (24/08/2026) - DÉCALAGE D'UN CRAN sur Stase et Filobscur,
// trouvé grâce au diagnostic (elementFige="filobscur" et URL résolue tous
// deux corrects du point de vue du code, mais l'icône affichée à l'écran
// était bien celle de la Stase). Confirmé par DEUX sources externes
// indépendantes (schéma officiel de l'API Bungie ET une bibliothèque tierce
// reproduisant l'exacte même énumération) : l'enum RÉEL est
// None=0, Kinetic=1, Arc=2, Thermal(Solaire)=3, Void(Abyssal)=4, **Raid=5**,
// Stasis=6, Strand=7.
// Cette table ignorait l'existence de la valeur 5 ("Raid", un type de
// dégâts spécial réservé à certains affrontements de raid, sans rapport
// avec les 6 éléments de doctrine) - ce qui décalait Stase sur 5 au lieu de
// 6, et Filobscur sur 6 au lieu de 7. Chercher l'icône de Filobscur allait
// donc chercher l'enum 6, qui est en réalité celui de la Stase : URL
// parfaitement valide, mais pointant vers le mauvais élément.
// ⚠️ Cette table est PARTAGÉE par la doctrine ET par `obtenirElementArme`
// (icône d'élément sur les armes) : une arme Stase ou Filobscur souffrait
// probablement du même décalage, simplement pas encore remarqué.
// EN: ⚠️ FIXED - a ONE-STEP SHIFT on Stasis and Strand, found via the
// diagnostic. Confirmed by TWO independent external sources: the real enum
// is None=0, Kinetic=1, Arc=2, Thermal=3, Void=4, **Raid=5**, Stasis=6,
// Strand=7. This table never accounted for value 5 ("Raid", a special
// damage type for raid encounters, unrelated to the 6 doctrine elements),
// shifting Stasis to 5 instead of 6, and Strand to 6 instead of 7. This
// table is SHARED with `obtenirElementArme` - a Stasis or Strand weapon
// likely had the same bug, just not yet noticed.
const ENUM_VERS_ELEMENT: Record<number, Exclude<DamageElement, "prismatique" | null>> = {
  2: "arc",
  3: "solaire",
  4: "abyssal",
  // 5: Raid - type de dégâts spécial, aucun des 6 éléments de doctrine, volontairement absent de cette table.
  6: "stase",
  7: "filobscur",
};

// FR : ⚠️ AJOUT (24/08/2026) - élément d'une ARME (pour la cohérence
// élémentaire du Pilier 4), via `defaultDamageType` et la MÊME table
// `ENUM_VERS_ELEMENT` déjà éprouvée pour l'élément de doctrine - pas une
// nouvelle correspondance devinée. `defaultDamageType` vaut 1 (Kinetic)
// pour une arme cinétique : cas rendu explicitement en `null`, qui n'est
// PAS une erreur mais l'absence légitime d'élément.
// EN: ⚠️ ADDED - a WEAPON's element (for Pillar 4's elemental coherence),
// via `defaultDamageType` and the SAME `ENUM_VERS_ELEMENT` table already
// proven for the doctrine element - not a newly guessed mapping. Kinetic
// weapons (defaultDamageType 1) render explicitly as `null`, which is NOT
// an error but the legitimate absence of an element.
const CACHE_ELEMENT_ARME = new WeakMap<Database, Map<number, DamageElement | null>>();

export function obtenirElementArme(db: Database, itemHash: number): DamageElement | null {
  let cache = CACHE_ELEMENT_ARME.get(db);
  if (!cache) {
    cache = new Map();
    CACHE_ELEMENT_ARME.set(db, cache);
  }
  if (cache.has(itemHash)) return cache.get(itemHash) ?? null;

  const def = obtenirDefinition<{ defaultDamageType?: number }>(db, "DestinyInventoryItemDefinition", itemHash);
  const resultat: DamageElement | null = ENUM_VERS_ELEMENT[def?.defaultDamageType ?? 0] ?? null;
  cache.set(itemHash, resultat);
  return resultat;
}

/**
 * FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - ÉLÉMENT DE DÉGÂTS d'un objet pour le FILTRE des recherches (Manifest et Inventaire ; demande de l'utilisateur) : les six types de dégâts d'une arme, y compris le CINÉTIQUE.
 * S'appuie sur `obtenirElementArme` (même table éprouvée, aucun décalage possible) ; le cinétique, qui n'est pas dans `DamageElement` (voir plus bas), n'est reconnu que pour une ARME (`itemType` 3, `defaultDamageType` 1) : un objet sans élément
 * (armure, quête, ornement...) renvoie `null` et n'apparaît donc sous aucun élément. Le type de dégâts spécial « Raid » (enum 5) n'est pas l'un des six : `null` aussi.
 * EN: ⚠️ ADDED - damage element of an item for the search FILTER, Kinetic included (weapons only); items without an element return null.
 */
export type ElementFiltre = "cinetique" | "solaire" | "arc" | "abyssal" | "stase" | "filobscur";
/** FR : ordre d'affichage du filtre. / EN: filter display order. */
export const ELEMENTS_FILTRE: readonly ElementFiltre[] = ["cinetique", "solaire", "arc", "abyssal", "stase", "filobscur"];
export function obtenirElementFiltre(db: Database, itemHash: number): ElementFiltre | null {
  const element = obtenirElementArme(db, itemHash);
  if (element && element !== "prismatique") return element;
  const def = obtenirDefinition<{ defaultDamageType?: number; itemType?: number }>(db, "DestinyInventoryItemDefinition", itemHash);
  return def?.itemType === 3 && def.defaultDamageType === 1 ? "cinetique" : null;
}

// FR : ⚠️ AJOUT (24/08/2026) - icône officielle du CINÉTIQUE (enum 1).
// Fonction séparée volontairement : le cinétique n'est PAS dans
// `DamageElement` (ce n'est pas une doctrine, une arme n'inflige jamais de
// dégâts « cinétiques » au sens élémentaire), il est isolé dans le drapeau
// `soutientCinetique` des artefacts. Le réintroduire dans ENUM_VERS_ELEMENT
// pour récupérer son icône aurait cassé cette séparation, qui avait été
// posée délibérément (voir CHANGELOG du 04/08).
// EN: ⚠️ ADDED - official KINETIC icon (enum 1). Deliberately a separate
// function: Kinetic is NOT in `DamageElement` (it's not a subclass), it
// lives in the artifacts' `soutientCinetique` flag. Adding it to
// ENUM_VERS_ELEMENT just to get its icon would have broken that deliberate
// separation.
export function obtenirIconeCinetique(db: Database): string | undefined {
  return obtenirIconesDamageType(db).get(1);
}

export function obtenirIconeElementDoctrine(db: Database, element: DamageElement): string | undefined {
  if (!element || element === "prismatique") return undefined;
  const icones = obtenirIconesDamageType(db);
  for (const [enumValue, url] of icones) {
    if (ENUM_VERS_ELEMENT[enumValue] === element) return url;
  }
  return undefined;
}

/**
 * FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - règle PURE : faut-il recolorer cette icône ? Oui si la doctrine est le Filobscur, que l'option est un saut ou une compétence de classe, ET que son fichier d'icône est l'un de ceux de la Stase (`urlsStase`).
 * Voir `data/teinteIconesDoctrine.ts` pour le pourquoi. EN: ⚠️ ADDED - pure rule: should this icon be recoloured?
 */
export function iconeDoctrineEstTeintee(element: string | null | undefined, categorie: string | undefined, urlIcone: string | undefined, urlsStase: ReadonlySet<string>): boolean {
  return element === "filobscur" && (categorie === "saut" || categorie === "classe") && !!urlIcone && urlsStase.has(urlIcone);
}

const CACHE_URLS_ICONES_STASE = new WeakMap<Database, Set<string>>();
/**
 * FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - adresses des icônes de TOUTES les options des sous-classes STASE (les trois classes : hash connus de `ELEMENT_PAR_HASH_CONNU`), lues dans le Manifest et mises en cache. Sert à repérer les icônes du Filobscur qui ne sont en fait que celles de la Stase.
 * EN: ⚠️ ADDED - icon addresses of every option of the three Stasis subclasses, cached per Manifest.
 */
export function obtenirUrlsIconesStase(db: Database): Set<string> {
  let ensemble = CACHE_URLS_ICONES_STASE.get(db);
  if (ensemble) return ensemble;
  ensemble = new Set<string>();
  for (const [hash, element] of Object.entries(ELEMENT_PAR_HASH_CONNU)) {
    if (element !== "stase") continue;
    for (const groupe of obtenirOptionsSousClasse(db, Number(hash))) for (const o of groupe.options) if (o.icone) ensemble.add(o.icone);
  }
  CACHE_URLS_ICONES_STASE.set(db, ensemble);
  return ensemble;
}

/** FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - comme `iconeDoctrineEstTeintee`, en lisant le Manifest : l'ensemble des icônes de la Stase n'est calculé QUE pour un saut ou une compétence de classe en Filobscur (jamais pour rien d'autre). / EN: reads the Manifest lazily. */
export function iconeDoctrineATeinter(db: Database, element: string | null | undefined, categorie: string | undefined, urlIcone: string | undefined): boolean {
  if (element !== "filobscur" || (categorie !== "saut" && categorie !== "classe") || !urlIcone) return false;
  return iconeDoctrineEstTeintee(element, categorie, urlIcone, obtenirUrlsIconesStase(db));
}

// FR : ⚠️ AJOUT (04/08/2026) - icône d'un perk de doctrine (Super, Aspect,
// Fragment...) résolue DIRECTEMENT depuis son hash, sans passer par
// `obtenirOptionsSousClasse` (qui recharge toute la liste des options - trop
// coûteux pour n'afficher qu'une seule icône dans un loadout).
// EN: ⚠️ ADDED - a doctrine perk's icon (Super, Aspect, Fragment...) resolved
// DIRECTLY from its hash, without going through `obtenirOptionsSousClasse`
// (which reloads the whole options list - too costly to show a single icon).
export function obtenirIconePerkDoctrine(db: Database, hash: number): string | undefined {
  if (!hash) return undefined;
  const def = obtenirDefinition<{
    displayProperties?: {
      icon?: string;
      iconSequences?: Array<{ frames?: string[] }>;
    };
  }>(db, "DestinyInventoryItemDefinition", hash);

  // FR : ⚠️ AMÉLIORÉ (24/08/2026) - certaines définitions de super n'ont pas
  // de champ `icon` mais un `iconSequences` (série d'images pour les états
  // du perk). C'est le cas signalé sur les supers abyssaux, qui restaient
  // invisibles. On prend la première image de la première séquence en repli.
  // EN: ⚠️ IMPROVED - some super definitions have no `icon` but an
  // `iconSequences` array; Void supers were invisible for this reason.
  const direct = urlIcone(def?.displayProperties?.icon);
  if (direct) return direct;
  const premiereFrame = def?.displayProperties?.iconSequences?.[0]?.frames?.[0];
  return urlIcone(premiereFrame);
}

/**
 * FR : ⚠️ AJOUT (24/08/2026) - nom d'un perk de doctrine, pour les infobulles
 * et les diagnostics. Complète `obtenirIconePerkDoctrine` : quand l'icône
 * manque, savoir DE QUEL super il s'agit permet de comprendre pourquoi.
 * EN: ⚠️ ADDED - a doctrine perk's name, for tooltips and diagnostics.
 */
export function obtenirNomPerkDoctrine(db: Database, hash: number): string | undefined {
  if (!hash) return undefined;
  const def = obtenirDefinition<{ displayProperties?: { name?: string } }>(
    db,
    "DestinyInventoryItemDefinition",
    hash
  );
  return def?.displayProperties?.name;
}

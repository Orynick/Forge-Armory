// FR : Construit la liste des armes/armures POSSEDEES (personnages,
// coffre ET courrier) sous forme de GearPiece exploitables par l'editeur
// de build, en croisant les objets bruts de l'API Bungie avec leurs
// definitions du Manifest (nom, emplacement, rarete) et leurs stats
// reelles d'instance.
//
// ⚠️ AJOUT (02/08/2026) : origine (personnage/coffre), statut equipe, et
// perks groupes par colonne de socket - necessaires pour l'affichage en
// 4 colonnes (Chasseur/Titan/Arcaniste/Coffre) demande par l'utilisateur.
//
// ⚠️ AJOUT (24/10/2026, tests post-audit, point 5.8) : le COURRIER
// (postmaster, `location: 4` dans l'inventaire d'un personnage) est lu et
// affiche, etiquete "courrier" - jamais melange a l'inventaire du
// personnage. Un objet qui y attend ne peut ni etre equipe ni transfere :
// il faut d'abord le recuperer en jeu (`PullFromPostmaster` n'est PAS
// appele par l'appli). L'affichage le rend visible et le bouton
// « Transférer vers » l'explique (grise).
//
// EN: Builds the list of OWNED weapons/armor (characters, vault AND
// postmaster) as GearPiece usable by the build editor, by
// cross-referencing raw Bungie API items with their Manifest definitions
// (name, slot, rarity) and their real per-instance stats.
//
// ⚠️ ADDED (2026-08-02): origin (character/vault), equipped status, and
// perks grouped by socket column - needed for the 4-column display
// (Hunter/Titan/Warlock/Vault) requested by the user.
//
// ⚠️ ADDED (2026-10-24, post-audit tests, point 5.8): the POSTMASTER
// (`location: 4` in a character's inventory) is read and displayed,
// tagged "courrier" - never mixed into the character's own inventory. An
// item waiting there can neither be equipped nor transferred: it must
// first be picked up in game (`PullFromPostmaster` is NOT called by the
// app). Displaying it makes it visible, and the "Transfer to" button
// explains it (disabled).

import { extrairePlugsDisponibles, extraireGearTier, extraireEnergie, extrairePlugsInsertables, extraireStatsJeu } from "./plugsDisponibles";   // ⚠️ AJOUT (13/10/2026, v0.4.7) ; ⚠️ AJOUT (19/10/2026) : `extraireGearTier` ; ⚠️ AJOUT (28/10/2026) : `extraireStatsJeu` (composant 304)
import { Database } from "sql.js";
import { obtenirDefinition } from "../manifest/download";
import { urlIcone } from "../manifest/search";
import { resoudreStatKey } from "../manifest/statsArmure";   // ⚠️ DÉPLACÉ (15/10/2026, v0.4.12)
import { DestinyItemDefinition, DestinyStatDefinition } from "../../types/manifest";
import { GearPiece, StatKey } from "../../types/build";
import { BUCKET_HASH_VERS_SLOT, TIER_TYPE_HASH_EXOTIQUE, CLASS_TYPE_VERS_CLASSE } from "../../data/constantesManifest";
import { DestinyMembership } from "./api";
import { obtenirAccessTokenValide } from "./oauth";
import { BUNGIE_API_ROOT, bungieConfig } from "./config";
import { obtenirNomsDamageType, obtenirIconesDamageType } from "../manifest/doctrine";

// FR : la résolution d'une statistique par son NOM vit maintenant dans `lib/manifest/statsArmure.ts` (partagée avec la Forge des armures ; comportement inchangé).

interface ItemBrut {
  itemHash: number;
  itemInstanceId?: string;
  /** FR : d'où vient cet objet brut, avant qu'on ne connaisse son nom/slot. / EN: where this raw item comes from, before we know its name/slot. */
  origine: "coffre" | "titan" | "chasseur" | "arcaniste" | "courrier";
  equipe: boolean;
}

async function recupererProfilPourInventaire(membership: DestinyMembership) {
  const accessToken = await obtenirAccessTokenValide();
  // FR : ⚠️ CHANGÉ (13/10/2026, v0.4.7) - + 310 (plugs réutilisables : les perks que chaque exemplaire peut porter dans chaque prise), pour distinguer dans la Forge les perks DISPONIBLES sur l'exemplaire de ceux qui sont seulement possibles sur le modèle. Lecture seule. / EN: + component 310 (reusable plugs).
  // FR : ⚠️ AJOUT (28/10/2026, branche draft-mod-armures) - + 304 (`ItemStats` : les VRAIES statistiques du jeu par exemplaire) : demandé EN PRODUCTION aussi (la version installable doit afficher les vraies stats). Le composant 302 reste demandé (inoffensif) mais n'est plus utilisé pour les stats d'armure. / EN: + component 304 (real per-instance stats), requested in production too.
  const composants = [102, 200, 201, 205, 300, 302, 304, 305, 310].join(",");
  const reponse = await fetch(
    `${BUNGIE_API_ROOT}/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${composants}`,
    { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${accessToken}` } }
  );
  if (!reponse.ok) throw new Error(`Récupération de l'inventaire échouée (${reponse.status})`);

  // FR : ⚠️ AJOUT (24/08/2026) - vérification (mode dev) d'une éventuelle
  // corruption de précision sur les GRANDS itemInstanceId (nombres 64 bits,
  // au-delà de Number.MAX_SAFE_INTEGER). Bungie confirme encoder ces
  // identifiants comme du TEXTE entre guillemets, précisément pour éviter ce
  // problème côté JavaScript - donc `reponse.json()` ne DEVRAIT rien
  // corrompre. Mais plutôt que de le supposer, on compare le TEXTE BRUT de
  // la réponse (jamais passé par un parseur numérique) à la valeur obtenue
  // après désérialisation, pour un itemInstanceId précis.
  // EN: dev-mode precision check for LARGE itemInstanceId values.
  let texteBrut: string | null = null;
  if (import.meta.env.DEV) {
    texteBrut = await reponse.clone().text();
  }

  const data = await reponse.json();
  if (data.ErrorCode !== 1 || data.Response === undefined) {
    throw new Error(`Bungie a refusé la récupération de l'inventaire (${data.ErrorCode ?? "?"}/${data.ErrorStatus ?? "Unknown"}) : ${data.Message || "réponse sans données"}`);
  }

  if (import.meta.env.DEV && texteBrut) {
    verifierPrecisionItemInstanceId(texteBrut, data);
  }

  return data.Response;
}

/**
 * FR : compare, pour CHAQUE itemInstanceId présent dans le texte brut de la
 * réponse, sa forme textuelle exacte avec ce que `JSON.parse` (via
 * `.json()`) en a fait. Toute différence est un signe direct de corruption
 * de précision.
 * EN: compares, for EVERY itemInstanceId in the raw response text, its
 * exact textual form against what `JSON.parse` produced. Any difference is
 * a direct sign of precision corruption.
 */
function verifierPrecisionItemInstanceId(texteBrut: string, dataParsee: unknown): void {
  const motif = /"itemInstanceId":"?(\d+)"?/g;
  const valeursTexteBrut = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = motif.exec(texteBrut)) !== null) {
    valeursTexteBrut.add(m[1]);
  }

  const valeursParsees = new Set<string>();
  JSON.stringify(dataParsee, (_cle, valeur) => {
    if (typeof valeur === "string" && /^\d{15,}$/.test(valeur)) valeursParsees.add(valeur);
    return valeur;
  });

  const manquantes = [...valeursTexteBrut].filter((v) => !valeursParsees.has(v));
  if (manquantes.length > 0) {
    console.warn(
      `⚠️ [diagnostic précision] ${manquantes.length} itemInstanceId présents dans le texte brut mais ABSENTS après désérialisation (corruption possible) :`,
      manquantes.slice(0, 5)
    );
  } else {
    console.info(`✅ [diagnostic précision] ${valeursTexteBrut.size} itemInstanceId vérifiés, tous préservés à l'identique après désérialisation.`);
  }
}

const CLASSE_PAR_INDEX: Record<number, "titan" | "chasseur" | "arcaniste"> = {
  0: "titan",
  1: "chasseur",
  2: "arcaniste",
};

/**
 * FR : Liste tous les objets équipables (armes + armure) possédés par le
 * joueur, avec leur origine (coffre ou quel personnage), s'ils sont
 * équipés, leurs stats réelles (armure), et leurs perks (à plat +
 * regroupés par colonne de socket pour l'affichage façon jeu).
 * EN: Lists every equippable item (weapons + armor) owned by the player,
 * with its origin (vault or which character), whether it's equipped, its
 * real stats (armor), and its perks (flat + grouped by socket column for
 * an in-game-style display).
 */
export interface ResultatInventaire {
  pieces: GearPiece[];
  /** FR : noms réels de stats rencontrés mais non reconnus - vide si tout s'est bien résolu. / EN: real stat names encountered but not recognized - empty if everything resolved fine. */
  statsNonResolues: string[];
  /** FR : diagnostic élargi (03/08/2026) - où exactement ça bloque pour les stats d'armure. / EN: wider diagnostic (2026-08-03) - exactly where things break for armor stats. */
  diagnosticStats: {
    armureSansInstanceId: number;
    armureSansDonneesStatsBrutes: number;
    armureAvecStatsBrutesTotal: number;
  };
}

export async function listerObjetsPossedes(
  membership: DestinyMembership,
  db: Database
): Promise<ResultatInventaire> {
  const profil = await recupererProfilPourInventaire(membership);

  // FR : classe de chaque personnage, pour étiqueter l'origine des objets.
  const classeParPersonnage: Record<string, "titan" | "chasseur" | "arcaniste"> = {};
  for (const [charId, c] of Object.entries(profil.characters?.data ?? {}) as [string, any][]) {
    classeParPersonnage[charId] = CLASSE_PAR_INDEX[c.classType] ?? "titan";
  }

  const itemsBruts: ItemBrut[] = [];
  for (const item of profil.profileInventory?.data?.items ?? []) {
    itemsBruts.push({ itemHash: item.itemHash, itemInstanceId: item.itemInstanceId, origine: "coffre", equipe: false });
  }
  const inventairesPersonnages = profil.characterInventories?.data ?? {};
  const equipementPersonnages = profil.characterEquipment?.data ?? {};
  // FR : ⚠️ AJOUT (24/10/2026, tests post-audit, point 5.8) - le courrier se
  // lit DANS l'inventaire de chaque personnage (`location: 4`) : c'est la
  // seule source Bungie pour ces objets (ils n'apparaissent ni au coffre ni
  // dans l'equipement). Ils sont etiquetes "courrier", jamais melanges a
  // l'inventaire du personnage : un objet qui y attend ne peut pas etre
  // deplace ni equipe tant qu'il n'a pas ete recupere en jeu.
  // EN: ADDED - the postmaster is read INSIDE each character's inventory
  // (`location: 4`): that is Bungie's only source for those items (they
  // appear neither in the vault nor in equipment). They are tagged
  // "courrier", never mixed into the character's own inventory.
  const LIEU_COURRIER = 4;
  for (const charId of Object.keys({ ...inventairesPersonnages, ...equipementPersonnages })) {
    const origine = classeParPersonnage[charId] ?? "titan";
    for (const item of inventairesPersonnages[charId]?.items ?? []) {
      itemsBruts.push({ itemHash: item.itemHash, itemInstanceId: item.itemInstanceId, origine: item.location === LIEU_COURRIER ? "courrier" : origine, equipe: false });
    }
    for (const item of equipementPersonnages[charId]?.items ?? []) {
      itemsBruts.push({ itemHash: item.itemHash, itemInstanceId: item.itemInstanceId, origine, equipe: true });
    }
  }

  // FR : composant 302 gardé dans la requête (inoffensif) mais plus utilisé
  // pour les stats d'armure - voir plus bas (sockets + investmentStats).
  const socketsParInstance: Record<string, { sockets: Array<{ plugHash?: number; isEnabled: boolean }> }> =
    profil.itemComponents?.sockets?.data ?? {};
  // FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - composant 310 : perks disponibles par exemplaire et par prise (lu avec tolérance : voir `plugsDisponibles.ts`). / EN: component 310 data.
  // FR : ⚠️ AJOUT (19/10/2026, branche test, analyse de la spec Bungie v2.21.9) - composant 300 (instances), pour le PALIER ("gear tier") de chaque exemplaire possédé : c'est lui qui décide quelle version d'un perk amélioré s'applique à CET exemplaire (TODO Forge, point ouvert n°2). Le composant 300 était déjà demandé (composants = [102, 200, 201, 205, 300, 302, 305, 310]) : aucune requête réseau de plus. / EN: component 300 (instances), for each owned instance's gear tier (decides which enhanced-perk version applies to THAT instance). Already requested: no extra network call.
  const gearTierParInstance: Record<string, unknown> =
    profil.itemComponents?.instances?.data ?? {};
  const plugsReutilisablesParInstance: Record<string, unknown> = profil.itemComponents?.reusablePlugs?.data ?? {};
  // FR : ⚠️ AJOUT (28/10/2026) - composant 304 (`ItemStats`) : les vraies statistiques du jeu, par exemplaire (`{ stats: { "<statHash>": { statHash, value } } }`). Lu avec tolérance : absent = aucune donnée. / EN: component 304 (ItemStats): the real in-game stats per instance.
  const statsJeuParInstance: Record<string, { stats?: Record<string, { statHash: number; value: number }> }> = profil.itemComponents?.stats?.data ?? {};

  const cacheNomsStat = new Map<number, StatKey | undefined>();
  // FR : ⚠️ AJOUT (02/08/2026) - diagnostic pour le bug "stats pas mises à
  // jour" signalé par l'utilisateur (objets ajoutés depuis l'inventaire
  // réel). Hypothèse : les vrais noms de stats dans le Manifest ne
  // correspondent pas aux mots-clés que j'avais devinés dans LIBELLES_STAT
  // (même famille de bug que la Doctrine). On collecte les noms RÉELS
  // rencontrés mais non reconnus, pour les afficher dans l'appli et les
  // corriger avec les vraies données au lieu de deviner à nouveau.
  // EN: ⚠️ ADDED (2026-08-02) - diagnostic for the "stats not updating" bug
  // reported by the user (items added from the real inventory).
  // Hypothesis: the real stat names in the Manifest don't match the
  // keywords I had guessed in LIBELLES_STAT (same bug family as Doctrine).
  // We collect the REAL names encountered but not recognized, to display
  // them in the app and fix them with real data instead of guessing again.
  const nomsStatNonResolus = new Set<string>();
  function resoudreStatKeyAvecCache(statHash: number): StatKey | undefined {
    if (!cacheNomsStat.has(statHash)) {
      const def = obtenirDefinition<DestinyStatDefinition>(db, "DestinyStatDefinition", statHash);
      const nom = def?.displayProperties?.name;
      const cle = nom ? resoudreStatKey(nom) : undefined;
      if (nom && !cle) nomsStatNonResolus.add(nom);
      cacheNomsStat.set(statHash, cle);
    }
    return cacheNomsStat.get(statHash);
  }

  // FR : ⚠️ AJOUT (03/08/2026) - diagnostic élargi : le premier diagnostic
  // (noms non reconnus) est resté vide ET les stats restaient absentes.
  // Ça veut dire que le problème est EN AMONT de la résolution de noms -
  // soit l'objet n'a pas d'itemInstanceId, soit l'API ne renvoie aucune
  // donnée brute de stats pour cette instance (composant 302 vide). On
  // compte les deux cas séparément pour savoir lequel se produit vraiment.
  // EN: ⚠️ ADDED (2026-08-03) - wider diagnostic: the first diagnostic
  // (unresolved names) stayed empty AND stats were still absent. That
  // means the problem is UPSTREAM of name resolution - either the item has
  // no itemInstanceId, or the API returns no raw stats data for that
  // instance (component 302 empty). We count both cases separately to
  // know which one is actually happening.
  let armureSansInstanceId = 0;
  let armureSansDonneesStatsBrutes = 0;
  let armureAvecStatsBrutesTotal = 0;

  const pieces: GearPiece[] = [];
  const dejaVu = new Set<string>();

  for (const item of itemsBruts) {
    const cleUnique = item.itemInstanceId ?? `${item.itemHash}`;
    if (dejaVu.has(cleUnique)) continue;
    dejaVu.add(cleUnique);

    const def = obtenirDefinition<DestinyItemDefinition>(db, "DestinyInventoryItemDefinition", item.itemHash);
    if (!def) continue;

    const bucketHash = def.inventory?.bucketTypeHash;
    const slot = bucketHash !== undefined ? BUCKET_HASH_VERS_SLOT[bucketHash] : undefined;
    if (!slot) continue;

    const estArmure = ["casque", "gants", "torse", "jambes", "marque"].includes(slot);

    // FR : sockets équipés - calculés ICI (avant les stats) car les stats
    // d'armure en dépendent maintenant (voir plus bas).
    const socketsBruts = item.itemInstanceId ? socketsParInstance[item.itemInstanceId]?.sockets ?? [] : [];
    const perksParColonne = socketsBruts
      .map((s, index) => ({ socketIndex: index, hash: s.plugHash, actif: s.isEnabled }))
      .filter((s) => s.actif && s.hash) as Array<{ socketIndex: number; hash: number }>;
    const perkHashes = perksParColonne.map((p) => p.hash);

    // FR : ⚠️ CORRIGÉ (03/08/2026) - le diagnostic a confirmé que le
    // composant 302 (ItemStats) est VIDE pour toute l'armure depuis
    // Armor 3.0. D'après un ticket GitHub de DIM (issue #11160) : les
    // stats d'armure viennent maintenant d'un PLUG D'ARCHÉTYPE socketé
    // (ex: "Bulwark") + les mods/masterwork, tous lisibles via les sockets
    // (déjà récupérés pour les perks). On additionne les `investmentStats`
    // de CHAQUE plug actif de l'armure pour reconstruire le total réel.
    // EN: ⚠️ FIXED (2026-08-03) - the diagnostic confirmed component 302
    // (ItemStats) is EMPTY for all armor since Armor 3.0. Per a DIM GitHub
    // ticket (issue #11160): armor stats now come from a socketed
    // ARCHETYPE PLUG (e.g. "Bulwark") + mods/masterwork, all readable via
    // sockets (already fetched for perks). We sum the `investmentStats` of
    // EVERY active armor plug to reconstruct the real total.
    const stats: Partial<Record<StatKey, number>> = {};
    if (estArmure) {
      if (!item.itemInstanceId) {
        armureSansInstanceId++;
      } else if (perkHashes.length === 0) {
        armureSansDonneesStatsBrutes++;
      } else {
        // FR : ⚠️ CORRIGÉ (24/08/2026) - le MASTERWORK ne donne PAS +5 à
        // toutes les stats, contrairement à ce que déclare le Manifest.
        //
        // Diagnostic de l'utilisateur sur deux pièces réelles : le plug
        // « Amélioration d'armure » déclare +5 sur les SIX stats, et l'appli
        // les additionnait toutes — d'où ~+15 par pièce, soit les ~75 points
        // d'écart constatés sur un build complet (575 dans l'appli contre 500
        // en jeu).
        //
        // En réalité, le jeu n'applique ces +5 qu'aux **trois stats les plus
        // basses**. Le Manifest ne peut pas savoir lesquelles à l'avance
        // (ça dépend de l'exemplaire), il déclare donc le bonus sur les six
        // et c'est au jeu de trancher à l'exécution.
        //
        // ⚠️ Point précisé par l'utilisateur : le classement des « plus
        // basses » se fait sur les stats INTRINSÈQUES de la pièce
        // (plugs `armor_stats`), SANS tenir compte des mods ni des mods
        // d'ajustement. C'est ce qui explique le cas du « Rôdeur nocturne » :
        // son Super est à 0 en intrinsèque (donc reçoit le +5) alors qu'il
        // affiche 20 une fois les mods appliqués.
        //
        // EN: ⚠️ FIXED (2026-08-05) - the MASTERWORK does NOT grant +5 to all
        // stats, despite what the Manifest declares. The plug declares +5 on
        // all SIX stats and the app summed them all, causing ~+15 per piece
        // (~75 per build). The game only applies those +5 to the THREE LOWEST
        // stats. Crucially, "lowest" is judged on the piece's INTRINSIC stats
        // (`armor_stats` plugs), ignoring mods and tuning mods.
        const CATEGORIE_MASTERWORK = "armor.masterworks";
        const CATEGORIE_INTRINSEQUE = "armor_stats";

        const intrinseques: Partial<Record<StatKey, number>> = {};
        const autres: Partial<Record<StatKey, number>> = {};
        let bonusMasterwork = 0;
        let trouveAuMoinsUneStat = false;

        for (const plugHash of perkHashes) {
          const defPlug = obtenirDefinition<
            DestinyItemDefinition & { plug?: { plugCategoryIdentifier?: string } }
          >(db, "DestinyInventoryItemDefinition", plugHash);
          const categorie = defPlug?.plug?.plugCategoryIdentifier ?? "";
          const estMasterwork = categorie.includes(CATEGORIE_MASTERWORK);
          const estIntrinseque = categorie === CATEGORIE_INTRINSEQUE;

          for (const investissement of defPlug?.investmentStats ?? []) {
            const cle = resoudreStatKeyAvecCache(investissement.statTypeHash);
            if (!cle) continue;
            trouveAuMoinsUneStat = true;

            if (estMasterwork) {
              // FR : on retient la VALEUR du bonus (identique sur les 6), on
              // décidera plus bas à quelles stats l'appliquer.
              bonusMasterwork = Math.max(bonusMasterwork, investissement.value);
            } else if (estIntrinseque) {
              intrinseques[cle] = (intrinseques[cle] ?? 0) + investissement.value;
            } else {
              autres[cle] = (autres[cle] ?? 0) + investissement.value;
            }
          }
        }

        // FR : les 3 stats les plus basses en INTRINSÈQUE reçoivent le bonus.
        // En cas d'égalité, l'ordre canonique des stats départage — c'est le
        // comportement observé sur les deux pièces diagnostiquées (Santé,
        // Mêlée, Grenade puis Super, Classe, Armes).
        const ordreCanonique: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
        const troisPlusBasses = [...ordreCanonique]
          .sort((a, b) => (intrinseques[a] ?? 0) - (intrinseques[b] ?? 0))
          .slice(0, 3);

        for (const cle of ordreCanonique) {
          const total =
            (intrinseques[cle] ?? 0) +
            (autres[cle] ?? 0) +
            (bonusMasterwork > 0 && troisPlusBasses.includes(cle) ? bonusMasterwork : 0);
          if (total !== 0 || intrinseques[cle] !== undefined || autres[cle] !== undefined) {
            stats[cle] = total;
          }
        }

        if (trouveAuMoinsUneStat) armureAvecStatsBrutesTotal++;
        else armureSansDonneesStatsBrutes++;
      }
    }
    // FR : ⚠️ AJOUT (28/10/2026, branche draft-mod-armures) - les VRAIES statistiques du jeu (composant 304), pour les ARMURES seulement (jamais sur une arme : ses « stats » n'ont rien à voir). Lecture via `extraireStatsJeu` (tolérante, valeur 0 comprise, stat hors des six ignorée via la résolution de nom). Aucune clé si le composant est absent pour cet exemplaire (jamais d'objet vide ni de zéros inventés).
    // EN: ADDED - the REAL in-game stats (component 304), ARMOR only (never weapons). Read via `extraireStatsJeu` (tolerant, zero kept). No key when the component is absent.
    let statsJeu: Partial<Record<StatKey, number>> | undefined;
    if (estArmure && item.itemInstanceId) {
      const lu = extraireStatsJeu(statsJeuParInstance[item.itemInstanceId], (h) => resoudreStatKeyAvecCache(h));
      if (lu) statsJeu = lu as Partial<Record<StatKey, number>>;
    }
    // FR : ⚠️ AJOUT (28/10/2026) - quand les SIX statistiques du jeu sont là, ELLES font foi : elles deviennent les `stats` de la pièce, et la reconstruction d'après le Manifest est gardée à part dans `statsReconstruites` (côté « appli » du diagnostic). Sinon (`statsJeu` incomplet ou absent) : `stats` reste la reconstruction, aucun mélange des deux, et `statsJeu` garde ce que le jeu a donné pour le diagnostic. Interrupteur unique (demande de l'utilisateur : la version installable affiche aussi les vraies stats).
    // EN: ADDED - when all SIX game stats are present, they are authoritative: they become the piece's `stats`, and the Manifest reconstruction is kept aside in `statsReconstruites`. Otherwise `stats` stays the reconstruction (no mixing), and `statsJeu` still holds what the game gave. Single switch (user request: the installed build shows real stats too).
    const STATS_ARMURE: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
    const STATS_DU_JEU_FONT_FOI = true;
    const statsJeuFontFoi = STATS_DU_JEU_FONT_FOI && !!statsJeu && STATS_ARMURE.every((k) => typeof statsJeu![k] === "number");
    const statsReconstruites = statsJeuFontFoi ? stats : undefined;
    const classeRequise = estArmure && def.classType !== undefined ? CLASS_TYPE_VERS_CLASSE[def.classType] : undefined;
    const elementArme =
      !estArmure && def.defaultDamageType !== undefined ? obtenirNomsDamageType(db).get(def.defaultDamageType) : undefined;
    const elementArmeIcone =
      !estArmure && def.defaultDamageType !== undefined ? obtenirIconesDamageType(db).get(def.defaultDamageType) : undefined;

    // FR : ⚠️ AJOUT (03/08/2026) - rareté résolue directement via le hash
    // (même table que TIER_TYPE_HASH_EXOTIQUE), pas de numéro deviné.
    // Type d'arme lisible via itemTypeDisplayName (déjà utilisé ailleurs
    // pour la même raison de fiabilité).
    // EN: ⚠️ ADDED (2026-08-03) - rarity resolved directly via the hash
    // (same table as TIER_TYPE_HASH_EXOTIQUE), no guessed number.
    // Readable weapon type via itemTypeDisplayName (already used
    // elsewhere for the same reliability reason).
    const rarete = def.inventory?.tierTypeHash !== undefined
      ? obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyItemTierTypeDefinition", def.inventory.tierTypeHash)
          ?.displayProperties?.name
      : undefined;
    const typeArme = !estArmure ? def.itemTypeDisplayName : undefined;
    const typeArmure = estArmure ? def.itemTypeDisplayName : undefined;

    pieces.push({
      itemHash: item.itemHash,
      itemInstanceId: item.itemInstanceId,
      nom: def.displayProperties?.name ?? "(objet sans nom)",
      icone: urlIcone(def.displayProperties?.icon),
      slot,
      stats: statsJeuFontFoi ? (statsJeu as Partial<Record<StatKey, number>>) : stats,
      ...(statsJeu ? { statsJeu } : {}),
      ...(statsReconstruites ? { statsReconstruites } : {}),
      perkHashes,
      perksParColonne,
      // FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - perks DISPONIBLES sur cet exemplaire, par prise (armes seulement : les builds enregistrés ne grossissent pas pour l'armure). `undefined` = donnée non lue. / EN: perks available on this instance (weapons only).
      ...(item.itemInstanceId ? { plugsDisponiblesParColonne: extrairePlugsDisponibles(plugsReutilisablesParInstance[item.itemInstanceId]) } : {}),   // ⚠️ CHANGÉ (15/10/2026, v0.4.12) : lus aussi pour les ARMURES (Forge des armures : mods disponibles sur l'exemplaire)
      // FR : ⚠️ AJOUT (19/10/2026, branche test) - PALIER de l'exemplaire (composant 300) ; absent de la réponse = pas de champ (on n'affirme rien). / EN: instance gear tier (component 300); absent from the response = no field.
      ...(item.itemInstanceId ? { gearTier: extraireGearTier(gearTierParInstance[item.itemInstanceId]) } : {}),
      ...(item.itemInstanceId && extraireEnergie(gearTierParInstance[item.itemInstanceId]) ? { energie: extraireEnergie(gearTierParInstance[item.itemInstanceId]) } : {}),
      ...(item.itemInstanceId && extrairePlugsInsertables(plugsReutilisablesParInstance[item.itemInstanceId]) ? { plugsInsertablesParColonne: extrairePlugsInsertables(plugsReutilisablesParInstance[item.itemInstanceId]) } : {}),   // ⚠️ AJOUT (26/10/2026) : plugs réellement insérables (« + » de l'ajustement d'une armure)   // ⚠️ AJOUT (24/10/2026) : énergie de l'exemplaire (diagnostic des coûts d'énergie des mods)
      isExotic: def.inventory?.tierTypeHash === TIER_TYPE_HASH_EXOTIQUE,
      classeRequise,
      elementArme,
      elementArmeIcone,
      rarete,
      typeArme,
      typeArmure,
      origine: item.origine,
      equipe: item.equipe,
    });
  }

  return {
    pieces,
    statsNonResolues: Array.from(nomsStatNonResolus),
    diagnosticStats: { armureSansInstanceId, armureSansDonneesStatsBrutes, armureAvecStatsBrutesTotal },
  };
}

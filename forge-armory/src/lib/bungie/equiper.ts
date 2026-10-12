// FR : Action REELLE d'equipement sur le compte Destiny du joueur - a
// distinguer clairement de "+ Ajouter au build", qui ne modifie que la
// copie locale dans le navigateur. Cette fonction, elle, change vraiment
// ce que le personnage porte en jeu.
// EN: REAL equip action on the player's Destiny account - to be clearly
// distinguished from "+ Add to build", which only changes the local
// browser copy. This function actually changes what the character wears
// in-game.

import type { Database } from "sql.js";
import { obtenirDefinition } from "../manifest/download";
import { BUNGIE_API_ROOT, bungieConfig } from "./config";
import { obtenirAccessTokenValide } from "./oauth";
import { DestinyMembership } from "./api";

// FR : ⚠️ AJOUT (24/08/2026) - transfert d'un objet vers un personnage,
// manquant depuis le début. C'est la cause CONFIRMÉE du bug
// `DestinyItemNotFound` (ErrorCode 1623) signalé par l'utilisateur :
// `equiperObjet` appelle `EquipItem` directement, qui échoue avec
// exactement cette erreur si l'objet n'est PAS déjà présent sur le
// personnage ciblé (coffre ou autre personnage). Confirmé par plusieurs
// sources indépendantes (tickets du dépôt officiel Bungie-net/api,
// tutoriels techniques) : la séquence correcte est TOUJOURS
// Transfert PUIS Équipement, jamais Équipement seul.
// Le commentaire "confirmé fonctionnel par l'utilisateur" sur `equiperObjet`
// (04/08) portait donc sur des objets déjà présents sur le bon personnage -
// le cas qui échoue aujourd'hui (objet ailleurs) n'avait simplement jamais
// été testé jusqu'ici.
// EN: ⚠️ ADDED - transfers an item to a character, missing from the start.
// CONFIRMED cause of the `DestinyItemNotFound` bug: `equiperObjet` calls
// `EquipItem` directly, which fails with exactly this error if the item
// isn't already on the target character. Confirmed by several independent
// sources: the correct sequence is ALWAYS Transfer THEN Equip.
export async function transfererObjet(
  membership: DestinyMembership,
  characterId: string,
  itemInstanceId: string,
  itemHash: number,
  // FR : ⚠️ AJOUT (30/09/2026, v0.3.0) - `true` = ENVOYER l'objet au coffre
  // depuis le personnage `characterId` (qui le porte), au lieu de le tirer
  // du coffre vers lui. Nécessaire pour déplacer un objet d'un personnage à
  // un autre : l'API ne transfère qu'entre un personnage et le coffre.
  // EN: ⚠️ ADDED - `true` = SEND the item to the vault from the character
  // `characterId` holding it, instead of pulling it from the vault.
  versCoffre = false
): Promise<void> {
  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Actions/Items/TransferItem/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": bungieConfig.apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      itemReferenceHash: itemHash,
      stackSize: 1,
      // FR : false = "tirer" l'objet VERS ce personnage depuis le COFFRE,
      // true = l'envoyer AU coffre depuis ce personnage. ⚠️ Corrigé le
      // 30/09/2026 : l'ancien commentaire disait « depuis le coffre ou un
      // autre personnage » ; en réalité l'API ne tire que depuis le coffre
      // (un objet porté par un autre personnage doit d'abord passer au coffre).
      // EN: false = pull TO this character from the VAULT, true = send it to
      // the vault from this character. The API only pulls from the vault.
      transferToVault: versCoffre,
      itemId: itemInstanceId,
      characterId,
      membershipType: membership.membershipType,
    }),
  });

  if (!reponse.ok) {
    const corps = await reponse.text().catch(() => "");
    throw new Error(`Transfert échoué (${reponse.status})${corps ? ` : ${corps}` : ""}`);
  }
  const data = await reponse.json();
  if (data.ErrorCode !== 1) {
    throw new Error(
      `[${data.ErrorCode ?? "?"}/${data.ErrorStatus ?? "Unknown"}] ${data.Message || "Échec du transfert"}`
    );
  }
}

/**
 * FR : ⚠️ AJOUT (30/09/2026) puis ⚠️ CHANGÉ (01/10/2026, v0.3.0) - position
 * ACTUELLE d'un objet, lue en direct chez Bungie AVANT d'agir.
 *
 * Première version (30/09) : lecture de l'objet seul (`GetItem`, composants
 * 300 + 307). Elle a ÉCHOUÉ chez l'utilisateur pour un objet porté par un autre
 * personnage (équipé ou non) : la lecture n'aboutissait pas, l'appli retombait
 * sur un « repli prudent » qui tentait le transfert, avalait l'erreur 1623, puis
 * l'équipement échouait à son tour (« Équipement échoué (500) :
 * DestinyItemNotFound »). La cause exacte de l'échec de `GetItem` n'a pas pu
 * être établie sans accès à l'API réelle.
 *
 * Désormais : lecture du PROFIL (composants 102 = coffre, 201 = inventaires des
 * personnages, 205 = équipement des personnages), la MÊME source que l'Inventaire
 * de l'appli (qui fonctionne chez l'utilisateur) et la méthode des outils comme
 * DIM. L'objet y est cherché par son `itemInstanceId` :
 *   - dans l'équipement d'un personnage -> `localisee`, équipé, sur ce personnage ;
 *   - dans l'inventaire d'un personnage -> `localisee`, non équipé (le champ
 *     `location` signale aussi le courrier, code 4) ;
 *   - dans le coffre -> `localisee`, lieu coffre ;
 *   - nulle part, alors que les inventaires sont bien arrivés -> `introuvable` ;
 *   - lecture impossible -> `inconnue`, AVEC sa raison : l'appelant s'arrête et
 *     le dit, sans plus rien tenter à l'aveugle.
 * Une session expirée (SessionExpiree) remonte volontairement.
 * EN: ⚠️ CHANGED - the item's CURRENT position, read from the PROFILE
 * (components 102, 201, 205: same source as the app's Inventory, DIM's method)
 * instead of GetItem, which failed for items held by another character.
 * Unreadable -> `inconnue` with a reason; the caller stops instead of guessing.
 */
export type PositionObjet =
  | { etat: "introuvable" }
  | { etat: "inconnue"; raison: string }
  | { etat: "localisee"; characterId?: string; location?: number; equipe: boolean; bucketHash?: number };

const LIEU_COFFRE = 2;
const LIEU_COURRIER = 4;

export interface ElementInventaire {
  itemInstanceId?: string | number;
  itemHash?: number;
  /** FR : emplacement actuel (pour un objet sur un personnage : cinétique, énergie, lourde...). / EN: current bucket. */
  bucketHash?: number;
  location?: number;
}

/** FR : ⚠️ AJOUT (01/10/2026) - profil lu une seule fois : coffre, inventaires et équipement par personnage. / EN: profile read once. */
export interface ProfilEquipement {
  coffre: ElementInventaire[];
  inventaires: Record<string, ElementInventaire[]>;
  equipement: Record<string, ElementInventaire[]>;
  /**
   * FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - classe de chaque personnage (clé = identifiant du personnage), lue avec le composant 200 du profil : nécessaire au transfert d'objets (« Transférer vers » : on désigne un personnage par sa classe, l'API par son identifiant). Facultatif : absent si Bungie ne renvoie pas les personnages.
   * EN: ⚠️ ADDED - class of each character (key = character id), read with profile component 200, needed to transfer items between characters.
   */
  classes?: Record<string, "titan" | "chasseur" | "arcaniste">;
}

/**
 * FR : ⚠️ AJOUT (01/10/2026) - lecture du profil (composants 102, 201, 205),
 * extraite de `localiserObjet` pour servir AUSSI au choix d'un remplaçant
 * (une seule lecture par équipement).
 * EN: ⚠️ ADDED - profile read, extracted to also serve replacement choice.
 */
export async function lireProfilEquipement(
  membership: DestinyMembership
): Promise<{ ok: true; profil: ProfilEquipement } | { ok: false; raison: string }> {
  const accessToken = await obtenirAccessTokenValide();
  let reponseBungie: {
    ErrorCode?: number;
    ErrorStatus?: string;
    Response?: {
      profileInventory?: { data?: { items?: ElementInventaire[] } };
      characterInventories?: { data?: Record<string, { items?: ElementInventaire[] }> };
      characterEquipment?: { data?: Record<string, { items?: ElementInventaire[] }> };
      characters?: { data?: Record<string, { classType?: number }> };   // ⚠️ AJOUT (12/10/2026, v0.4.2) : composant 200
    };
  };
  try {
    const reponse = await fetch(
      `${BUNGIE_API_ROOT}/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=102,200,201,205`,   // ⚠️ CHANGÉ (12/10/2026, v0.4.2) : + 200 (personnages et leur classe), en lecture seule
      { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${accessToken}` } }
    );
    reponseBungie = await reponse.json();
    if (reponseBungie?.ErrorCode !== 1) {
      return { ok: false, raison: `lecture du profil refusée par Bungie (HTTP ${reponse.status}, ${reponseBungie?.ErrorStatus ?? "réponse inattendue"})` };
    }
  } catch (e) {
    return { ok: false, raison: `lecture du profil impossible (${(e as Error).message})` };
  }
  const r = reponseBungie.Response;
  // FR : si les inventaires ne sont PAS tous arrivés (droits de lecture, réponse
  // tronquée), on ne peut rien conclure.
  // EN: if inventories did NOT all arrive, nothing can be concluded.
  if (!r?.profileInventory?.data || !r?.characterInventories?.data || !r?.characterEquipment?.data) {
    return { ok: false, raison: "inventaires non renvoyés par Bungie (coffre, personnages ou équipement manquant)" };
  }
  const parPerso = (d: Record<string, { items?: ElementInventaire[] }>) =>
    Object.fromEntries(Object.entries(d).map(([id, inv]) => [id, inv.items ?? []]));
  return {
    ok: true,
    profil: {
      coffre: r.profileInventory.data.items ?? [],
      inventaires: parPerso(r.characterInventories.data),
      equipement: parPerso(r.characterEquipment.data),
      classes: Object.fromEntries(
        Object.entries(r.characters?.data ?? {}).flatMap(([id, c]) => {
          const cle = (["titan", "chasseur", "arcaniste"] as const)[c.classType ?? -1];
          return cle ? [[id, cle]] : [];
        })
      ),
    },
  };
}

/** FR : recherche d'un objet dans un profil déjà lu. / EN: finds an item in an already-read profile. */
export function localiserDansProfil(profil: ProfilEquipement, itemInstanceId: string): PositionObjet {
  const cible = String(itemInstanceId);
  const chercher = (items: ElementInventaire[]) => items.find((it) => String(it.itemInstanceId) === cible);
  for (const [charId, items] of Object.entries(profil.equipement)) {
    const it = chercher(items);
    if (it) return { etat: "localisee", characterId: charId, location: it.location, equipe: true, bucketHash: it.bucketHash };
  }
  for (const [charId, items] of Object.entries(profil.inventaires)) {
    const it = chercher(items);
    if (it) return { etat: "localisee", characterId: charId, location: it.location, equipe: false, bucketHash: it.bucketHash };
  }
  const coffre = chercher(profil.coffre);
  if (coffre) return { etat: "localisee", location: coffre.location ?? LIEU_COFFRE, equipe: false };
  return { etat: "introuvable" };
}

export async function localiserObjet(membership: DestinyMembership, itemInstanceId: string): Promise<PositionObjet> {
  const lecture = await lireProfilEquipement(membership);
  if (!lecture.ok) return { etat: "inconnue", raison: lecture.raison };
  return localiserDansProfil(lecture.profil, itemInstanceId);
}

/**
 * FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - choix d'une arme de REMPLAÇANT, pour
 * libérer une arme ÉQUIPÉE sur un autre personnage (l'API Bungie refuse de
 * déplacer un objet équipé). Règles validées par l'utilisateur le 01/10/2026 :
 *   1. une arme du MÊME emplacement (cinétique, énergie ou lourde), d'abord
 *      dans l'inventaire de cet autre personnage, sinon dans le coffre ;
 *   2. une arme NON exotique de préférence (légendaire d'abord), pour ne pas
 *      équiper d'exotique sans nécessité ; un exotique seulement s'il n'y a
 *      rien d'autre ET que ce personnage n'a pas déjà un AUTRE exotique
 *      équipé (un seul exotique d'arme à la fois en jeu) ;
 *   3. aucune candidate -> pas de remplacement (l'appelant garde le message).
 * Armes seulement : l'armure garde le message d'origine. Fonction PURE :
 * `infos` donne, pour un itemHash, sa rareté et son emplacement d'origine
 * (lus dans le Manifest par l'appelant), indispensables pour le coffre (où
 * tout objet est rangé dans l'emplacement « coffre »).
 * EN: ⚠️ ADDED - picks a REPLACEMENT weapon to free a weapon EQUIPPED on another
 * character. Rules validated by the user: same slot, that character's inventory
 * first then the vault, non-exotic preferred (legendary first), an exotic only
 * if nothing else and no other exotic weapon is equipped there. Weapons only.
 */
export const EMPLACEMENTS_ARMES = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 } as const;
const LISTE_EMPLACEMENTS_ARMES: number[] = Object.values(EMPLACEMENTS_ARMES);
const RARETE_LEGENDAIRE = 5;
const RARETE_EXOTIQUE = 6;

export interface InfosObjet {
  /** FR : rareté (`inventory.tierType` : 5 légendaire, 6 exotique). / EN: tier type. */
  rarete?: number;
  /** FR : emplacement d'origine (`inventory.bucketTypeHash`). / EN: original bucket. */
  emplacement?: number;
  nom?: string;
}

export function choisirRemplacant(
  profil: ProfilEquipement,
  autrePersonnage: string,
  emplacement: number,
  idExclu: string,
  infos: (itemHash: number) => InfosObjet | undefined
): { objet: ElementInventaire; source: "inventaire" | "coffre" } | { raison: string } {
  if (!LISTE_EMPLACEMENTS_ARMES.includes(emplacement)) {
    return { raison: "ce n'est pas une arme (le remplacement automatique ne concerne que les armes)" };
  }
  const exclu = String(idExclu);
  const valide = (it: ElementInventaire) => it.itemInstanceId !== undefined && String(it.itemInstanceId) !== exclu && it.itemHash !== undefined;
  const rarete = (it: ElementInventaire) => infos(it.itemHash as number)?.rarete;
  const estExotique = (it: ElementInventaire) => rarete(it) === RARETE_EXOTIQUE;

  const candidatsInventaire = (profil.inventaires[autrePersonnage] ?? []).filter(
    (it) => valide(it) && it.bucketHash === emplacement && it.location !== LIEU_COURRIER
  );
  const candidatsCoffre = profil.coffre.filter((it) => valide(it) && infos(it.itemHash as number)?.emplacement === emplacement);

  // FR : légendaire d'abord, puis les autres non-exotiques (rareté inconnue comprise).
  const nonExotiques = (liste: ElementInventaire[]) => [
    ...liste.filter((it) => rarete(it) === RARETE_LEGENDAIRE),
    ...liste.filter((it) => rarete(it) !== RARETE_LEGENDAIRE && !estExotique(it)),
  ];
  const sources = [
    [candidatsInventaire, "inventaire"],
    [candidatsCoffre, "coffre"],
  ] as const;
  for (const [liste, source] of sources) {
    const choix = nonExotiques(liste)[0];
    if (choix) return { objet: choix, source };
  }

  // FR : en dernier recours, un exotique - seulement si aucun AUTRE exotique
  // d'arme n'est équipé sur ce personnage (sur les deux autres emplacements).
  const autreExotiqueEquipe = (profil.equipement[autrePersonnage] ?? []).some(
    (it) => it.bucketHash !== emplacement && LISTE_EMPLACEMENTS_ARMES.includes(it.bucketHash ?? -1) && estExotique(it)
  );
  if (!autreExotiqueEquipe) {
    for (const [liste, source] of sources) {
      const choix = liste.find(estExotique);
      if (choix) return { objet: choix, source };
    }
  }
  return {
    raison: autreExotiqueEquipe
      ? "aucune arme non exotique de ce type disponible pour la remplacer, et ce personnage a déjà un autre exotique équipé"
      : "aucune autre arme de ce type disponible sur ce personnage ni dans le coffre pour la remplacer",
  };
}

/** FR : position lue, en clair, pour les messages de diagnostic. / EN: readable position, for diagnostics. */
function decrirePosition(position: PositionObjet): string {
  if (position.etat === "introuvable") return "introuvable";
  if (position.etat === "inconnue") return `inconnue (${position.raison})`;
  const ou = position.characterId ? `personnage ${position.characterId}` : "coffre";
  return `${ou}, lieu ${position.location ?? "?"}, ${position.equipe ? "équipé" : "non équipé"}`;
}

/** FR : ⚠️ AJOUT (01/10/2026) - appel `EquipItem` simple (sert au remplaçant). / EN: plain EquipItem call (used for the replacement). */
async function appelerEquiper(membership: DestinyMembership, characterId: string, itemInstanceId: string): Promise<void> {
  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Actions/Items/EquipItem/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ itemId: itemInstanceId, characterId, membershipType: membership.membershipType }),
  });
  const corps = await reponse.text().catch(() => "");
  let data: { ErrorCode?: number; ErrorStatus?: string; Message?: string } = {};
  try {
    data = JSON.parse(corps);
  } catch {
    /* FR : corps non JSON : traité ci-dessous / EN: non-JSON body: handled below */
  }
  if (!reponse.ok || data.ErrorCode !== 1) {
    throw new Error(`[${data.ErrorCode ?? reponse.status}/${data.ErrorStatus ?? "Unknown"}] ${data.Message || corps || "Échec de l'équipement"}`);
  }
}

/**
 * FR : Équipe réellement un objet sur un personnage. Nécessite que
 * l'objet soit possédé (itemInstanceId réel, pas un objet trouvé par
 * recherche). Le scope OAuth "écriture Inventaire" doit avoir été coché
 * lors de la création de l'app Bungie.
 * EN: Actually equips an item on a character. Requires the item to be
 * owned (a real itemInstanceId, not a search-found item). The "write
 * Inventory" OAuth scope must have been checked when creating the Bungie
 * app.
 */
export async function equiperObjet(
  membership: DestinyMembership,
  characterId: string,
  itemInstanceId: string,
  itemHash: number,
  // FR : ⚠️ AJOUT (01/10/2026) - Manifest, pour choisir un remplaçant quand
  // l'arme est équipée sur un autre personnage (rareté, emplacement). Sans lui,
  // pas de remplacement : message d'origine.
  // EN: ⚠️ ADDED - Manifest, to pick a replacement. Without it, no replacement.
  db?: Database | null
): Promise<string | undefined> {
  // FR : ⚠️ CHANGÉ (24/08/2026) - ABANDON de la décision préalable
  // (`dejaSurPersonnage`, basée sur `piece.origine`). Confirmé par le
  // test réel de l'utilisateur : le MÊME échec ("transfert SAUTÉ, jugé déjà
  // présent") est apparu sur 3 objets différents, dont un build qui avait
  // fonctionné avant. Cause probable : `piece.origine` est une donnée FIGÉE
  // (au moment où l'objet a été lu ou où le loadout a été sauvegardé), qui
  // peut devenir FAUSSE si l'objet change de personnage entre-temps - par le
  // jeu normal, ou même par un équipement précédent fait depuis l'appli.
  // Se fier à cette donnée pour décider À L'AVANCE de sauter le transfert
  // était le problème : une décision basée sur une info qui peut se périmer
  // reproduira ce bug indéfiniment, sous des formes différentes.
  //
  // Nouvelle approche : on ne DÉCIDE plus, on TENTE systématiquement le
  // transfert, et on laisse l'API elle-même trancher. Si elle répond
  // `DestinyItemNotFound`, c'est - d'après ce qu'on a confirmé ensemble -
  // le signe que l'objet est déjà là où on veut l'envoyer (rien à
  // transférer depuis). Cette erreur précise est donc avalée comme un cas
  // normal, pas une panne ; toute AUTRE erreur de transfert reste fatale.
  // Plus robuste : la vérité vient du serveur au moment T, jamais d'un
  // instantané client qui peut dater.
  //
  // EN: ⚠️ CHANGED - DROPPED the pre-decision (`dejaSurPersonnage`, based on
  // `piece.origine`). Confirmed by the user's real test: the SAME failure
  // appeared on 3 different items, including a build that had worked
  // before. Likely cause: `piece.origine` is FROZEN data that can become
  // WRONG if the item changes character in the meantime - through normal
  // play, or even a previous equip from the app itself. New approach:
  // ALWAYS attempt transfer, let the API decide. A `DestinyItemNotFound`
  // response is swallowed as "already there" (confirmed together earlier);
  // any OTHER transfer error stays fatal. More robust: the truth comes from
  // the server at the moment of the call, never a client-side snapshot that
  // can go stale.
  // FR : ⚠️ CHANGÉ (30/09/2026, v0.3.0) - DÉCISION APRÈS LECTURE EN DIRECT.
  // Symptôme signalé par l'utilisateur : « Transfert échoué (500) :
  // DestinyItemNotFound (1623) » sur CERTAINES armes seulement, et 8 échecs
  // sur 8 en équipant un build. Le journal montre que cette erreur a eu DEUX
  // causes opposées : (1) l'objet est DÉJÀ sur le personnage ciblé, donc rien à
  // tirer du coffre (05/08 : « 8 sur 8 ») ; (2) l'objet n'existe plus (Signal
  // perdu, 24/08). Le code du 24/08 traitait 1623 comme une vraie erreur et
  // n'avalait que 1632 : il réglait (2) et RÉGRESSAIT sur (1). Et
  // `TransferItem` ne déplace qu'entre un personnage et le coffre (un objet
  // porté par un AUTRE personnage doit d'abord passer au coffre).
  // On LIT donc où est l'objet (`localiserObjet`), puis :
  //   - introuvable          -> message clair, rien n'est tenté ;
  //   - déjà sur la cible    -> aucun transfert (et rien à faire s'il y est
  //                             déjà équipé) ;
  //   - dans le coffre       -> tirer vers la cible ;
  //   - sur un autre perso   -> envoyer au coffre, puis tirer ; refusé s'il y
  //                             est ÉQUIPÉ (l'API l'interdit) ;
  //   - au courrier          -> message clair (à récupérer en jeu) ;
  //   - lecture impossible   -> ⚠️ CHANGÉ le 01/10/2026 : arrêt avec un
  //                             message clair (l'ancien repli « tenter et
  //                             avaler 1623 » masquait la vraie cause).
  // EN: ⚠️ CHANGED - DECISION AFTER A LIVE READ. The journal shows 1623 had
  // two opposite causes (item already on the target vs item gone); the
  // 24/08 code fixed one and regressed the other. We now READ the item's
  // position and act accordingly; unreadable -> stop and say so (01/10/2026).
  // FR : ⚠️ CHANGÉ (01/10/2026) - renvoie une NOTE à afficher quand l'appli a
  // fait plus que demandé (ex. « X équipée à sa place sur l'autre personnage »),
  // et lit le profil UNE fois (position + choix d'un éventuel remplaçant).
  // EN: ⚠️ CHANGED - returns a NOTE when the app did more than asked; reads the
  // profile once (position + replacement choice).
  let note: string | undefined;
  const lecture = await lireProfilEquipement(membership);
  const position: PositionObjet = lecture.ok ? localiserDansProfil(lecture.profil, itemInstanceId) : { etat: "inconnue", raison: lecture.raison };

  if (position.etat === "introuvable") {
    throw new Error(
      "objet introuvable sur le compte Destiny (probablement démantelé ou remplacé par un autre exemplaire) — " +
        "utilisez « 🔧 Réparer automatiquement » dans les Loadouts, ou retirez cette pièce du build puis rajoutez-la depuis l'inventaire actuel."
    );
  }

  if (position.etat === "localisee") {
    // FR : le courrier se traite EN PREMIER, même sur le personnage ciblé : un
    // objet qui y attend ne peut pas être équipé (vérifié par test, le premier
    // jet de cette logique l'oubliait).
    // EN: the postmaster comes FIRST, even on the target character.
    if (position.location === LIEU_COURRIER) {
      throw new Error("objet au courrier en jeu — récupérez-le d'abord dans votre inventaire, puis réessayez.");
    }
    const surCible = position.characterId === characterId;
    if (surCible && position.equipe) return undefined; // FR : déjà équipé sur ce personnage, rien à faire / EN: already equipped here
    if (!surCible) {
      if (position.characterId) {
        if (position.equipe) {
          // FR : ⚠️ CHANGÉ (01/10/2026) - REMPLACEMENT AUTOMATIQUE (règles :
          // voir `choisirRemplacant`) : on équipe une autre arme du même
          // emplacement sur cet autre personnage, ce qui libère la nôtre ; puis
          // le chemin habituel (coffre, personnage choisi, équipement).
          // EN: ⚠️ CHANGED - AUTOMATIC REPLACEMENT, then the usual path.
          const messageBase =
            "objet actuellement ÉQUIPÉ sur un autre personnage — l'API Bungie ne peut pas le déplacer tant qu'il y est équipé. " +
            "Équipez-y un autre objet en jeu, puis réessayez.";
          if (!db || !lecture.ok || position.bucketHash === undefined) {
            throw new Error(messageBase + (db ? "" : " (Remplacement automatique impossible : Manifest non chargé.)"));
          }
          const infos = (hash: number): InfosObjet | undefined => {
            const def = obtenirDefinition<{ displayProperties?: { name?: string }; inventory?: { tierType?: number; bucketTypeHash?: number } }>(
              db,
              "DestinyInventoryItemDefinition",
              hash
            );
            return def ? { rarete: def.inventory?.tierType, emplacement: def.inventory?.bucketTypeHash, nom: def.displayProperties?.name } : undefined;
          };
          const choix = choisirRemplacant(lecture.profil, position.characterId, position.bucketHash, itemInstanceId, infos);
          if ("raison" in choix) throw new Error(`${messageBase} (Remplacement automatique impossible : ${choix.raison}.)`);
          const idRemplacant = String(choix.objet.itemInstanceId);
          const hashRemplacant = choix.objet.itemHash as number;
          const nomRemplacant = infos(hashRemplacant)?.nom ?? "une autre arme";
          try {
            if (choix.source === "coffre") {
              await transfererObjet(membership, position.characterId, idRemplacant, hashRemplacant, false);
              await new Promise((resolve) => setTimeout(resolve, 250));
            }
            await appelerEquiper(membership, position.characterId, idRemplacant);
            await new Promise((resolve) => setTimeout(resolve, 250));
          } catch (e) {
            throw new Error(`${messageBase} (Remplacement automatique par « ${nomRemplacant} » échoué : ${(e as Error).message}.)`);
          }
          note = `« ${nomRemplacant} » équipée à sa place sur l'autre personnage${choix.source === "coffre" ? " (sortie du coffre)" : ""}`;
        }

        // FR : porté par un autre personnage : passer par le coffre.
        await transfererObjet(membership, position.characterId, itemInstanceId, itemHash, true);
        await new Promise((resolve) => setTimeout(resolve, 250));
      } else if (position.location !== undefined && position.location !== LIEU_COFFRE) {
        throw new Error(`objet dans un emplacement non géré (code ${position.location}) — déplacez-le dans votre inventaire en jeu.`);
      }
      // FR : dans le coffre : tirer vers le personnage ciblé.
      await transfererObjet(membership, characterId, itemInstanceId, itemHash, false);
      // FR : court délai après un VRAI transfert réussi, avant l'équipement -
      // hypothèse de propagation différée côté serveur, gardée par prudence.
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  } else {
    // FR : ⚠️ CHANGÉ (01/10/2026) - position illisible : on S'ARRÊTE et on le
    // dit, sans rien déplacer. L'ancien « repli prudent » (tenter le transfert en
    // avalant l'erreur 1623, puis équiper) a produit l'échec signalé le 01/10 :
    // il masquait la vraie cause sous une erreur d'équipement trompeuse.
    // EN: ⚠️ CHANGED - unreadable position: STOP and say so, move nothing.
    throw new Error(`impossible de savoir où se trouve l'objet : ${position.raison}. Rien n'a été déplacé ; réessayez dans un instant.`);
  }

  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Actions/Items/EquipItem/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": bungieConfig.apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      itemId: itemInstanceId,
      characterId,
      membershipType: membership.membershipType,
    }),
  });

  if (!reponse.ok) {
    // FR : ⚠️ AJOUT (24/08/2026) - deux hypothèses déjà testées sans succès
    // pour "Signal perdu" (skip du transfert quand déjà présent, délai
    // après transfert) : l'erreur persiste À L'IDENTIQUE. Plutôt qu'une 3e
    // supposition à l'aveugle, le message inclut désormais les PARAMÈTRES
    // EXACTS envoyés à l'API (itemInstanceId, itemHash, personnage visé,
    // si un transfert a eu lieu) - à comparer avec ce que l'utilisateur
    // voit en jeu ou dans un autre outil (DIM), pour savoir si
    // l'itemInstanceId utilisé par l'appli est bien le bon.
    // EN: ⚠️ ADDED - two hypotheses already tested without success for
    // "Signal perdu": the error persists IDENTICALLY. Rather than a 3rd
    // blind guess, the message now includes the EXACT parameters sent to
    // the API, to compare against what the user sees in-game or in another
    // tool (DIM) - to know if the itemInstanceId the app is using is
    // actually correct.
    const corps = await reponse.text().catch(() => "");
    throw new Error(
      `Équipement échoué (${reponse.status})${corps ? ` : ${corps}` : ""} ` +
        `[diagnostic : itemInstanceId=${itemInstanceId}, itemHash=${itemHash}, characterId=${characterId}, position lue avant : ${decrirePosition(position)}]`
    );
  }
  const data = await reponse.json();
  if (data.ErrorCode !== 1) {
    // FR : Bungie renvoie souvent un 200 HTTP même en cas d'échec logique
    // (ex: objet pas au bon endroit, personnage en activité...) - le vrai
    // statut est dans ErrorCode (1 = succès).
    // EN: Bungie often returns HTTP 200 even on logical failure (e.g. item
    // not in the right place, character in an activity...) - the real
    // status is in ErrorCode (1 = success).
    throw new Error(`${data.Message || `Échec (code ${data.ErrorCode})`} [position lue avant : ${decrirePosition(position)}]`);
  }
  return note;
}

// FR : ⚠️ AJOUT (04/08/2026) - DIAGNOSTIC de l'insertion de plug
// (InsertSocketPlugFree), pour savoir si l'appli peut équiper une
// DOCTRINE complète en jeu (super, aspects, fragments, mêlée, grenade)
// ou seulement la sous-classe elle-même.
//
// Contexte : `equiperObjet` équipe des OBJETS. La configuration d'une
// sous-classe, elle, se fait en insérant des PLUGS dans des SOCKETS -
// un mécanisme différent, exposé par un endpoint réputé restreint.
// Plutôt que de supposer qu'il fonctionne (ou pas), on tente UNE
// insertion réelle et on rapporte la réponse exacte de Bungie.
//
// ⚠️ Cette fonction MODIFIE réellement le personnage si l'appel réussit.
// Elle est appelée depuis un bouton de diagnostic qui demande
// confirmation, et volontairement sur UN SEUL plug pour limiter la portée
// d'un éventuel effet.
//
// Note sur l'endpoint : Bungie expose InsertSocketPlugFree (insertion
// sans coût en matériaux). Historiquement, l'accès à ces actions de
// socket a été limité à certaines applications, d'où l'intérêt de
// connaître le code d'erreur précis : un 401/403 signale un problème
// d'autorisation, un ErrorCode métier signale un refus logique, un 500
// une erreur côté serveur.
//
// EN: ⚠️ ADDED (2026-08-04) - DIAGNOSTIC for plug insertion
// (InsertSocketPlugFree), to find out whether the app can equip a full
// SUBCLASS CONFIG in game or only the subclass item itself. Rather than
// assuming, we attempt ONE real insertion and report Bungie's exact
// response. ⚠️ This DOES modify the character if it succeeds - it's called
// from a confirmation-gated diagnostic button, on a SINGLE plug.
export async function diagnostiquerInsertionPlug(
  membership: DestinyMembership,
  characterId: string,
  itemInstanceId: string,
  socketIndex: number,
  plugItemHash: number
): Promise<string> {
  const lignes: string[] = [];
  lignes.push(`Endpoint : /Destiny2/Actions/Items/InsertSocketPlugFree/`);
  lignes.push(`characterId : ${characterId}`);
  lignes.push(`itemInstanceId (sous-classe) : ${itemInstanceId}`);
  lignes.push(`socketIndex : ${socketIndex}`);
  lignes.push(`plugItemHash : ${plugItemHash}`);
  lignes.push("");

  try {
    const accessToken = await obtenirAccessTokenValide();
    const reponse = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Actions/Items/InsertSocketPlugFree/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": bungieConfig.apiKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        actionToken: null,
        itemInstanceId,
        plug: { socketIndex, socketArrayType: 0, plugItemHash },
        characterId,
        membershipType: membership.membershipType,
      }),
    });

    lignes.push(`Statut HTTP : ${reponse.status} ${reponse.statusText}`);
    const corps = await reponse.text().catch(() => "");
    // FR : on affiche le corps BRUT : c'est là que Bungie met ErrorCode,
    // ErrorStatus et Message, les trois informations qui diront si c'est
    // un refus d'autorisation, un refus logique, ou un bug serveur.
    lignes.push(`Réponse brute :`);
    lignes.push(corps.slice(0, 1500) || "(vide)");

    try {
      const data = JSON.parse(corps);
      lignes.push("");
      lignes.push(`ErrorCode : ${data.ErrorCode}  (1 = succès)`);
      lignes.push(`ErrorStatus : ${data.ErrorStatus}`);
      lignes.push(`Message : ${data.Message}`);
      if (data.ErrorCode === 1) {
        lignes.push("");
        lignes.push("✅ L'insertion a RÉUSSI : équiper une doctrine complète est donc possible.");
      }
    } catch {
      lignes.push("(réponse non-JSON, voir le brut ci-dessus)");
    }
  } catch (e) {
    lignes.push(`Exception : ${(e as Error).message}`);
  }

  return lignes.join("\n");
}

// FR : ⚠️ AJOUT (04/08/2026) - équipement en LOT avec seconde passe.
//
// Problème constaté par l'utilisateur : équiper un build contenant la
// "Lame praxique" échouait sur cette seule pièce, avec
// ErrorCode 1641 (DestinyItemUniqueEquipRestricted, "You can only have
// one item of this type equipped"). C'est la règle du jeu : un seul
// exotique d'arme (et un seul d'armure) à la fois.
//
// Pourquoi ça échouait alors que l'exotique du build était légitime :
// on équipait les pièces UNE PAR UNE, dans l'ordre de la liste. Si
// l'exotique du build arrive AVANT que l'exotique actuellement porté ne
// soit remplacé par une autre pièce du build, le jeu refuse - il y aurait
// deux exotiques équipés à cet instant. L'ordre importe donc, et il
// dépend de ce que porte le personnage au départ.
//
// Solution : une SECONDE PASSE. Les pièces refusées pour cause de
// conflit d'unicité sont réessayées une fois que tout le reste est
// équipé - à ce moment-là l'exotique gênant a généralement été remplacé,
// et l'insertion passe. On ne réessaie QUE les conflits d'unicité : une
// autre erreur (droits, objet absent) ne se résoudrait pas en
// recommençant.
//
// EN: ⚠️ ADDED (2026-08-04) - BATCH equip with a second pass. Equipping a
// build containing an exotic could fail with ErrorCode 1641
// (DestinyItemUniqueEquipRestricted) because pieces were equipped ONE BY
// ONE in list order: if the build's exotic came before the currently-worn
// exotic got replaced, the game refused. The second pass retries only
// uniqueness conflicts, once everything else is equipped.
export interface ResultatEquipementLot {
  reussies: number;
  echecs: { nom: string; message: string }[];
  /** FR : pièces qui ont nécessité la seconde passe - utile pour comprendre ce qui s'est joué. / EN: pieces that needed the second pass. */
  reussiesEnSecondePasse: string[];
  /** FR : ⚠️ AJOUT (01/10/2026) - ce que l'appli a fait EN PLUS (remplaçants équipés sur d'autres personnages). / EN: what the app did IN ADDITION. */
  notes: string[];
}

const CODE_CONFLIT_UNICITE = 1641;

export async function equiperPlusieursObjets(
  membership: DestinyMembership,
  characterId: string,
  pieces: { nom: string; itemInstanceId: string; itemHash: number }[],
  db?: Database | null
): Promise<ResultatEquipementLot> {
  let reussies = 0;
  const notes: string[] = [];
  const aReessayer: typeof pieces = [];
  const echecs: { nom: string; message: string }[] = [];

  for (const piece of pieces) {
    try {
      const note = await equiperObjet(membership, characterId, piece.itemInstanceId, piece.itemHash, db);
      if (note) notes.push(`${piece.nom} : ${note}`);
      reussies += 1;
    } catch (e) {
      const message = (e as Error).message;
      if (message.includes(String(CODE_CONFLIT_UNICITE)) || message.includes("UniqueEquipRestricted")) {
        aReessayer.push(piece);
      } else {
        echecs.push({ nom: piece.nom, message });
      }
    }
  }

  const reussiesEnSecondePasse: string[] = [];
  for (const piece of aReessayer) {
    try {
      const note = await equiperObjet(membership, characterId, piece.itemInstanceId, piece.itemHash, db);
      if (note) notes.push(`${piece.nom} : ${note}`);
      reussies += 1;
      reussiesEnSecondePasse.push(piece.nom);
    } catch (e) {
      echecs.push({
        nom: piece.nom,
        message:
          // FR : ⚠️ PRÉCISÉ (24/08/2026) - l'ancien message ("vérifiez que ce
          // build ne contient pas deux exotiques du même type") ne
          // correspondait pas au cas signalé par l'utilisateur : son build
          // n'avait qu'un seul exotique déclaré, le conflit venait d'un
          // AUTRE exotique déjà équipé EN JEU, sur un emplacement absent du
          // lot envoyé. Le nouvel essai (2e passage) ne peut résoudre un
          // conflit que si l'objet en conflit est REMPLACÉ par un autre
          // objet du MÊME lot lors du premier passage - s'il n'est pas dans
          // le lot du tout, rien ne le déloge jamais, quel que soit le
          // nombre de nouveaux essais.
          // EN: ⚠️ REFINED - the previous message didn't match the user's
          // reported case: their build had only one exotic, the conflict
          // came from ANOTHER exotic already equipped IN-GAME, on a slot
          // absent from the batch sent. The retry can only resolve a
          // conflict if the conflicting item is REPLACED by another item
          // from the SAME batch during the first pass - if it isn't in the
          // batch at all, nothing ever displaces it, no matter how many
          // retries.
          "conflit d'unicité persistant après un second essai — un seul exotique d'arme et un seul d'armure " +
          "peuvent être équipés à la fois. Si ce build ne contient qu'un seul exotique de ce type, la cause la " +
          "plus probable est qu'un AUTRE exotique est déjà équipé en jeu, sur un emplacement absent de ce build " +
          "(donc jamais remplacé). Équipez manuellement un objet non-exotique sur cet emplacement en jeu, puis réessayez.",
      });
    }
  }

  return { reussies, echecs, reussiesEnSecondePasse, notes };
}

// FR : ⚠️ AJOUT (24/08/2026) - diagnostic dédié pour "Signal perdu", après
// avoir écarté deux hypothèses avec certitude (transfert sauté sur donnée
// périmée, corruption de précision numérique - toutes deux infirmées par
// des tests réels). Plutôt qu'une 3e supposition à l'aveugle, interroge
// Bungie DIRECTEMENT sur cet identifiant précis, sans rien tenter de plus
// (ni transfert, ni équipement) - `Destiny2.GetItem`, jamais utilisé
// ailleurs dans l'appli. Si Bungie confirme l'objet, le problème vient de
// la requête d'équipement elle-même. S'il dit aussi "introuvable", ça
// confirmerait que l'identifiant sauvegardé dans le loadout ne correspond
// plus à rien de réel - et il faudrait alors regarder pourquoi l'indicateur
// "objets introuvables" de l'appli ne l'a pas détecté.
// EN: ⚠️ ADDED - dedicated diagnostic for "Signal perdu", after ruling out
// two hypotheses with certainty via real tests. Queries Bungie DIRECTLY
// about this exact ID, attempting nothing else - `Destiny2.GetItem`, never
// used elsewhere in the app.
export async function diagnostiquerExistenceObjet(
  membership: DestinyMembership,
  itemInstanceId: string
): Promise<string> {
  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(
    `${BUNGIE_API_ROOT}/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/Item/${itemInstanceId}/?components=300`,
    { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${accessToken}` } }
  );
  const data = await reponse.json();
  return JSON.stringify(
    {
      httpStatus: reponse.status,
      ErrorCode: data.ErrorCode,
      ErrorStatus: data.ErrorStatus,
      Message: data.Message,
      objetTrouve: data.Response?.item?.data !== undefined,
    },
    null,
    1
  );
}

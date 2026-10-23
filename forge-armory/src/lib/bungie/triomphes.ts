// FR : Lecture de l'état des triomphes « Solo sans mourir » depuis l'API
// Bungie (composant 900, Records).
//
// ⚠️ NIVEAU PROFIL, pas personnage : les triomphes de donjon sont partagés
// entre les 3 personnages d'un compte, donc c'est `profileRecords` qu'il
// faut lire. `characterRecords` existe aussi mais concerne les triomphes
// propres à un personnage — s'y tromper renverrait des données vides ou
// incohérentes selon le personnage sélectionné.
//
// ⚠️ L'état d'un triomphe est un CHAMP DE BITS (`state`), pas un booléen.
// Bit 0 (valeur 1) = RecordRedeemed, bit 2 (valeur 4) = ObjectiveNotCompleted.
// Un triomphe est donc accompli quand le bit « objectif non complété » est
// À ZÉRO — logique inversée par rapport à l'intuition, source classique
// d'erreur si on teste naïvement `state === 0`.
//
// EN: Reads "Solo Flawless" triumph state from the Bungie API (component
// 900, Records). PROFILE level, not character: dungeon triumphs are shared
// across a account's characters. The state is a BIT FIELD, not a boolean:
// a triumph is earned when the "objective not completed" bit (4) is ZERO -
// inverted logic compared to intuition.

// FR : ⚠️ CORRIGÉ (24/08/2026) - l'hypothèse "profil uniquement" ci-dessus
// était FAUSSE pour certains triomphes. Diagnostic réel de l'utilisateur :
// « Flèche de la vigie » (Spire of the Watcher), qu'il possède, était
// ABSENT de `profileRecords` mais bien PRÉSENT dans `characterRecords`,
// sous un personnage précis, avec `state=67` et `complete: true`. Certains
// triomphes de donjon ont donc une portée PERSONNAGE, pas profil - contraire
// à ce qui avait été supposé. On lit désormais LES DEUX : `profileRecords`
// en premier (rapide, couvre la majorité des triomphes déjà confirmés :
// Trône brisé, Fosse de l'hérésie, Prophétie, Étreinte de l'avarice,
// Dualité), puis `characterRecords` sur CHAQUE personnage en repli si
// absent du profil.
// EN: ⚠️ FIXED - the "profile only" assumption above was WRONG for some
// triumphs. Real user diagnostic: "Spire of the Watcher", which they own,
// was ABSENT from `profileRecords` but PRESENT in `characterRecords` under
// a specific character. Some dungeon triumphs have CHARACTER scope, not
// profile. Now reads BOTH: profile first, then character records on EACH
// character as a fallback if absent from profile.

import { TRIOMPHES_SOLO_FLAWLESS } from "../../data/triomphesSoloFlawless";

/** FR : bit « objectif non complété » de DestinyRecordState. ⚠️ CHANGÉ (23/10/2026, TODO n°23) : EXPORTÉ pour être réutilisé par la page Accomplissements (même logique d'état, records de sceaux). / EN: DestinyRecordState's "objective not completed" bit. CHANGED - EXPORTED for reuse by the Accomplishments page (same state logic, seal records). */
export const BIT_OBJECTIF_NON_COMPLETE = 4;

export interface EtatTriomphe {
  hash: number;
  donjon: string;
  accompli: boolean;
  /** FR : ⚠️ AJOUT (24/08/2026) - transmis depuis TRIOMPHES_SOLO_FLAWLESS pour l'affichage de l'emblème dans la vitrine. / EN: ⚠️ ADDED - passed through from TRIOMPHES_SOLO_FLAWLESS for the emblem display. */
  emblemeHash: number;
  emblemeSubstitution?: boolean;
}

interface ProfilAvecRecords {
  Response?: {
    profileRecords?: {
      data?: {
        records?: Record<string, { state?: number }>;
      };
    };
    // FR : ⚠️ AJOUT (24/08/2026) - records PAR PERSONNAGE, clé = characterId.
    // EN: ⚠️ ADDED - records PER CHARACTER, key = characterId.
    characterRecords?: {
      data?: Record<string, { records?: Record<string, { state?: number }> }>;
    };
  };
}

/**
 * FR : croise les 11 triomphes connus avec l'état renvoyé par l'API.
 * Un triomphe absent de la réponse (profil ET tous les personnages) est
 * considéré comme NON accompli plutôt que d'être masqué : mieux vaut
 * afficher un badge éteint qu'un trou dans la liste, qui ferait croire à un
 * donjon oublié.
 * EN: cross-references the 11 known triumphs with the API's state. A triumph
 * missing from the response (profile AND all characters) counts as NOT
 * earned rather than being hidden.
 */
export function lireTriomphesSoloFlawless(profil: unknown): EtatTriomphe[] {
  const reponse = (profil as ProfilAvecRecords)?.Response;
  const recordsProfil = reponse?.profileRecords?.data?.records ?? {};
  const recordsParPersonnage = reponse?.characterRecords?.data ?? {};

  return TRIOMPHES_SOLO_FLAWLESS.map(({ hash, donjon, emblemeHash, emblemeSubstitution }) => {
    let state = recordsProfil[String(hash)]?.state;

    // FR : absent du profil -> on cherche sur chaque personnage. Le premier
    // personnage qui le possède suffit : le triomphe est un accomplissement
    // du JOUEUR, peu importe sous quel personnage Bungie le range.
    // EN: absent from profile -> check each character. The first character
    // that has it is enough: the triumph is the PLAYER's achievement,
    // whichever character Bungie happens to file it under.
    if (state === undefined) {
      for (const donnees of Object.values(recordsParPersonnage)) {
        const entree = donnees.records?.[String(hash)];
        if (entree?.state !== undefined) {
          state = entree.state;
          break;
        }
      }
    }

    // FR : si le triomphe n'est nulle part, on ne peut rien
    // affirmer - on l'affiche comme non accompli, sans inventer.
    const accompli = state !== undefined && (state & BIT_OBJECTIF_NON_COMPLETE) === 0;
    return { hash, donjon, accompli, emblemeHash, emblemeSubstitution };
  });
}

// FR : ⚠️ AJOUT (24/08/2026) - récupération DÉDIÉE des triomphes.
//
// Choix délibéré d'un appel séparé plutôt que d'élargir celui de
// l'inventaire : le composant 900 (Records) renvoie TOUS les triomphes du
// compte (des milliers), alors que l'inventaire est déjà un appel lourd,
// rechargé à chaque changement d'équipement. Les mélanger ralentirait
// chaque rafraîchissement d'inventaire pour une donnée qui, elle, ne change
// qu'après avoir terminé un donjon.
//
// EN: ⚠️ ADDED - DEDICATED triumph fetch. Deliberately a separate call
// rather than widening the inventory one: component 900 returns ALL of the
// account's triumphs (thousands), while the inventory call is already heavy
// and refreshed on every gear change. Merging them would slow every
// inventory refresh for data that only changes after completing a dungeon.
import { BUNGIE_API_ROOT, bungieConfig } from "./config";
import { DestinyMembership } from "./api";
import { obtenirAccessTokenValide } from "./oauth";

export async function recupererProfilTriomphes(membership: DestinyMembership): Promise<unknown> {
  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(
    `${BUNGIE_API_ROOT}/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=900`,
    { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${accessToken}` } }
  );
  if (!reponse.ok) throw new Error(`Récupération des triomphes échouée (${reponse.status})`);
  const enveloppe = await reponse.json();
  if (enveloppe.ErrorCode !== 1 || enveloppe.Response === undefined) {
    throw new Error(`Bungie a refusé la récupération des triomphes (${enveloppe.ErrorCode ?? "?"}/${enveloppe.ErrorStatus ?? "Unknown"}) : ${enveloppe.Message || "réponse sans données"}`);
  }
  return enveloppe;
}

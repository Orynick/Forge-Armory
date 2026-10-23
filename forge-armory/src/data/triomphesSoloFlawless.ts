// FR : Les 11 triomphes « Solo sans mourir » (Solo Flawless) des donjons.
//
// ⚠️ Hashes CONFIRMÉS UN PAR UN par l'utilisateur via le diagnostic de
// l'appli, pas glanés sur un site tiers. Cette précaution était nécessaire :
// les noms de ces triomphes ne suivent AUCUNE convention (« On avait dit plus
// jamais ! » pour Le Trône brisé, « Devenez l'avatar de Naeem, Ô ma
// vengeance » pour Ruine de la Guerrière), impossible de les deviner ou de
// les retrouver par correspondance de nom.
//
// ⚠️ Trois formulations de description différentes ont été rencontrées en
// cherchant ces triomphes, ce qui a nécessité deux corrections successives du
// filtre de recherche (voir DEVLOG du 05/08) :
//   - « en solo sans mourir et sans quitter l'activité » (8 donjons)
//   - « en solo, sans mourir et sans quitter l'activité » (Hôte Vesper)
//   - « en solo sans mourir ni quitter l'activité » (Fantômes des
//     Profondeurs, Ruine de la Guerrière)
// À garder en tête si un 12e donjon sort un jour : ne pas supposer que sa
// description suivra le même modèle que les autres.
//
// EN: The 11 dungeon "Solo Flawless" triumphs. Hashes CONFIRMED ONE BY ONE by
// the user via the app's diagnostic, not scraped from a third-party site -
// necessary because these triumph names follow NO convention and cannot be
// guessed or matched by name.

interface TriompheSoloFlawless {
  /** FR : hash du triomphe dans DestinyRecordDefinition. / EN: triumph hash in DestinyRecordDefinition. */
  hash: number;
  /** FR : nom du donjon (pas du triomphe, dont le nom est souvent cryptique). / EN: dungeon name (not the triumph's, often cryptic). */
  donjon: string;
  /**
   * FR : hash de l'emblème associé (DestinyInventoryItemDefinition), fourni
   * par l'utilisateur le 24/08/2026. Le lien triomphe -> emblème n'existe
   * PAS dans le Manifest (`rewardItems` du triomphe est vide, confirmé) :
   * ces hashes ont été trouvés par recherche manuelle du nom exact de
   * chaque emblème, pas déduits automatiquement.
   * EN: associated emblem hash, provided by the user. The triumph -> emblem
   * link does NOT exist in the Manifest - found via manual search of each
   * emblem's exact name.
   */
  emblemeHash: number;
  /**
   * FR : true UNIQUEMENT pour Le Trône brisé - ce donjon n'a PAS de vrai
   * emblème de Solo Sans Mourir dédié. "Éternel Renouveau" est un
   * emblème de SUBSTITUTION choisi par l'utilisateur, pas la récompense
   * réelle du triomphe. À traiter différemment dans l'affichage (ex : une
   * mention "emblème de substitution" plutôt que de laisser croire que
   * c'est la vraie récompense).
   * EN: true ONLY for Shattered Throne - this dungeon has NO real dedicated
   * Solo Flawless emblem. This is a SUBSTITUTE the user chose, not the
   * actual reward.
   */
  emblemeSubstitution?: boolean;
}

export const TRIOMPHES_SOLO_FLAWLESS: TriompheSoloFlawless[] = [
  { hash: 3205009787, donjon: "Le Trône brisé", emblemeHash: 185321778, emblemeSubstitution: true },
  { hash: 3950599483, donjon: "Fosse de l'hérésie", emblemeHash: 298334060 },
  { hash: 3191784400, donjon: "Prophétie", emblemeHash: 1138508276 },
  { hash: 3718971745, donjon: "Étreinte de l'avarice", emblemeHash: 3800278198 },
  { hash: 4126703847, donjon: "Dualité", emblemeHash: 383734232 },
  { hash: 4032136335, donjon: "Flèche de la vigie", emblemeHash: 2026109717 },
  { hash: 2105117002, donjon: "Fantômes des Profondeurs", emblemeHash: 2069797998 },
  { hash: 238037026, donjon: "Ruine de la Guerrière", emblemeHash: 1465090516 },
  { hash: 1553599507, donjon: "Hôte Vesper", emblemeHash: 3508476924 },
  { hash: 28261116, donjon: "Dogme fragmenté", emblemeHash: 3992231368 },
  { hash: 1204858125, donjon: "Équilibre", emblemeHash: 748692000 },
];

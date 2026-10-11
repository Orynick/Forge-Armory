// FR : Traduction du vocabulaire Destiny anglais → français, pour les perks
// d'artefact.
//
// Pourquoi c'est nécessaire : `src/data/artefacts.ts` est généré depuis la base
// de connaissance, rédigée en anglais. L'appli étant en français, afficher
// « On Jolted Enemy Kill : Inflicts Blind » est incohérent avec le reste.
//
// ⚠️ CE QUE CETTE TRADUCTION EST, ET N'EST PAS. C'est un remplacement de
// TERMES, pas une traduction de phrases : la grammaire anglaise reste
// apparente (« Sur Ennemi Survolté Éliminé : Inflige Aveuglement »). C'est
// volontaire — le vocabulaire de jeu (verbes, types d'armes, champions) est ce
// qui compte pour comprendre un perk, et une vraie traduction demanderait de
// réécrire 147 descriptions à la main, avec le risque d'en déformer le sens.
// Les termes non reconnus restent en anglais plutôt que d'être devinés.
//
// EN: English → French vocabulary replacement for artifact perks. This is TERM
// substitution, not sentence translation: English grammar remains visible.
// Deliberate - game vocabulary is what matters to understand a perk, and
// rewriting 147 descriptions by hand would risk distorting their meaning.
// Unrecognised terms stay in English rather than being guessed.

const TERMES: [RegExp, string][] = [
  // Verbes d'élément — les plus importants pour la compréhension d'un perk
  [/\bJolted?\b/gi, "Survolté"],
  [/\bJolt\b/gi, "Survolt"],
  [/\bBlind(ed|ing)?\b/gi, "Aveuglement"],
  [/\bAmplified\b/gi, "Amplifié"],
  [/\bIonic Traces?\b/gi, "Traces ioniques"],
  [/\bScorch(ed|ing)?\b/gi, "Brûlure"],
  [/\bIgnition(s)?\b/gi, "Ignition"],
  [/\bRadiant\b/gi, "Radieux"],
  [/\bRestoration\b/gi, "Restauration"],
  [/\bCure\b/gi, "Soin"],
  [/\bFiresprites?\b/gi, "Flammèches"],
  [/\bVolatile( Rounds)?\b/gi, "Volatil"],
  [/\bWeaken(ed|ing)?\b/gi, "Affaiblissement"],
  [/\bSuppress(ed|ion)?\b/gi, "Suppression"],
  [/\bDevour\b/gi, "Dévoration"],
  [/\bInvisib(le|ility)\b/gi, "Invisibilité"],
  [/\bVoid Breaches?\b/gi, "Brèches abyssales"],
  [/\bSlow(ed)?\b/gi, "Ralentissement"],
  [/\bFrozen?\b/gi, "Gel"],
  [/\bShatter(ed|ing)?\b/gi, "Éclatement"],
  [/\bStasis Crystals?\b/gi, "Cristaux de Stase"],
  [/\bFrost Armor\b/gi, "Armure de givre"],
  [/\bUnravel(ed|ing|led|ling)?( Rounds)?\b/gi, "Effilochage"],
  [/\bSever(ed|ing)?\b/gi, "Sectionnement"],
  [/\bSuspend(ed|ing)?\b/gi, "Suspension"],
  [/\bThreadlings?\b/gi, "Filandres"],
  [/\bTangles?\b/gi, "Enchevêtrements"],
  [/\bWoven Mail\b/gi, "Cotte tissée"],
  [/\bTranscendence\b/gi, "Transcendance"],

  // Champions
  [/\bBarrier\b/gi, "Bloqueur"],
  [/\bOverload\b/gi, "Surchargé"],
  [/\bUnstoppable\b/gi, "Implacable"],
  [/\bChampions?\b/gi, "Champions"],

  // Types d'armes
  [/\bAuto Rifles?\b/gi, "Fusils automatiques"],
  [/\bPulse Rifles?\b/gi, "Fusils à impulsion"],
  [/\bScout Rifles?\b/gi, "Fusils d'éclaireur"],
  [/\bHand Cannons?\b/gi, "Revolvers"],
  [/\bSubmachine Guns?\b/gi, "Pistolets-mitrailleurs"],
  [/\bSidearms?\b/gi, "Pistolets"],
  [/\bShotguns?\b/gi, "Fusils à pompe"],
  [/\bSniper Rifles?\b/gi, "Fusils de précision"],
  [/\bFusion Rifles?\b/gi, "Fusils à fusion"],
  [/\bLinear Fusion Rifles?\b/gi, "Fusils à fusion linéaire"],
  [/\bTrace Rifles?\b/gi, "Fusils à rayons"],
  [/\bRocket Launchers?\b/gi, "Lance-roquettes"],
  [/\bGrenade Launchers?\b/gi, "Lance-grenades"],
  [/\bMachine Guns?\b/gi, "Mitrailleuses"],
  [/\bSwords?\b/gi, "Épées"],
  [/\bGlaives?\b/gi, "Glaives"],
  [/\bBows?\b/gi, "Arcs"],

  // Éléments
  [/\bSolar\b/gi, "Solaire"],
  // FR : ⚠️ CORRIGÉ (24/08/2026) - "Arc" est le terme ANGLAIS de l'élément ;
  // le terme français correct est "Cryo-électrique" ("Arc" en français est
  // un anglicisme). ⚠️ Ne pas confondre avec la règle `Bows? -> Arcs` juste
  // au-dessus, qui concerne le TYPE D'ARME (l'arc, l'arme), pas l'élément.
  [/\bArc\b/gi, "Cryo-électrique"],
  [/\bVoid\b/gi, "Abyssal"],
  [/\bStasis\b/gi, "Stase"],
  [/\bStrand\b/gi, "Filobscur"],
  [/\bPrismatic\b/gi, "Prismatique"],
  [/\bKinetic\b/gi, "Cinétique"],

  // Vocabulaire courant
  [/\bFinal Blows?\b/gi, "Coups de grâce"],
  [/\bPrecision Kills?\b/gi, "Éliminations de précision"],
  [/\bRapidly defeating\b/gi, "Vaincre rapidement"],
  [/\bDefeating\b/gi, "Vaincre"],
  [/\bOn Finisher\b/gi, "Sur Exécution"],
  [/\bFinisher\b/gi, "Exécution"],
  [/\bGrants?\b/gi, "Octroie"],
  [/\bInflicts?\b/gi, "Inflige"],
  [/\bIncreases?\b/gi, "Augmente"],
  [/\bReduces?\b/gi, "Réduit"],
  [/\bGenerates?\b/gi, "Génère"],
  [/\bCreates?\b/gi, "Crée"],
  [/\bOrbs? of Power\b/gi, "Orbes de Pouvoir"],
  [/\bAbility Energy\b/gi, "énergie d'aptitude"],
  [/\bGrenade\b/gi, "Grenade"],
  [/\bMelee\b/gi, "Mêlée"],
  [/\bSuper\b/gi, "Super"],
  [/\bClass Ability\b/gi, "Compétence de classe"],
  [/\bDamage\b/gi, "dégâts"],
  [/\bHealth\b/gi, "santé"],
  [/\bShields?\b/gi, "boucliers"],
  [/\benemies\b/gi, "ennemis"],
  [/\benemy\b/gi, "ennemi"],
  [/\btargets?\b/gi, "cibles"],
  [/\bseconds?\b/gi, "secondes"],
  [/\bmeters?\b/gi, "mètres"],
  [/\bstacks?\b/gi, "cumuls"],
  [/\bwhile\b/gi, "tant que"],
  [/\bagainst\b/gi, "contre"],
  [/\bnearby\b/gi, "à proximité"],

  // FR : mots de liaison, ajoutés après un premier test qui laissait des
  // phrases mi-anglaises ("Inflige Aveuglement to ennemis within 8 mètres").
  // Traités en DERNIER pour ne pas casser les expressions ci-dessus.
  // EN: connecting words, added after a first test left half-English
  // sentences. Handled LAST so they don't break the expressions above.
  [/\bOn ([A-ZÉÀ])/g, "Sur $1"],
  [/\bKills?\b/gi, "éliminations"],
  [/\bweapons?\b/gi, "armes"],
  [/\bwithin\b/gi, "dans un rayon de"],
  [/\bfor\b/gi, "pendant"],
  [/\bup to\b/gi, "jusqu'à"],
  [/\bwith\b/gi, "avec"],
  [/\band\b/gi, "et"],
  [/\bof\b/gi, "de"],
  [/\bto\b/gi, "aux"],
  [/\byour\b/gi, "vos"],
  [/\bafter\b/gi, "après"],
  [/\bwhen\b/gi, "quand"],
  [/\ballies\b/gi, "alliés"],
  [/\bnearby allies\b/gi, "alliés proches"],
];

/**
 * FR : traduit le vocabulaire Destiny d'un texte anglais. Les termes inconnus
 * restent tels quels — mieux vaut un mot anglais qu'une traduction inventée.
 * EN: translates Destiny vocabulary. Unknown terms are left as-is.
 */
export function traduireTexteArtefact(texte: string): string {
  let resultat = texte;
  for (const [motif, remplacement] of TERMES) {
    resultat = resultat.replace(motif, remplacement);
  }
  return resultat;
}

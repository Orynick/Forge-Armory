// FR : Distinction SOURCE / PAYOFF pour les verbes d'élément.
//
// Le problème résolu ici : jusqu'à présent le Pilier 2 comptait les
// MENTIONS d'un verbe et considérait qu'à partir de 2 mentions il y avait
// « boucle probable ». C'est faux. Deux fragments qui APPLIQUENT tous deux
// Brûlure, sans rien pour l'exploiter, donnent aussi 2 mentions — mais ce
// n'est pas une boucle, c'est une redondance. Inversement, une arme qui
// exploite Brûlure alors que rien ne l'applique est un perk mort.
//
// Une vraie boucle demande les DEUX faces :
//   SOURCE  = quelque chose qui APPLIQUE le verbe    ("inflige Brûlure")
//   PAYOFF  = quelque chose qui en PROFITE           ("contre les cibles brûlées")
//
// ⚠️ MÉTHODE ET SES LIMITES : c'est de l'analyse de texte par marqueurs sur
// des descriptions rédigées par Bungie, pas une donnée structurée. Il y aura
// des erreurs de classement — formulations inhabituelles, tournures
// négatives, phrases où source et payoff se suivent. C'est pourquoi la
// classification est EXPOSÉE dans le détail du pilier : l'utilisateur peut
// voir ce qui a été compris et signaler les cas aberrants, plutôt que de
// subir un score inexplicable.
//
// EN: SOURCE / PAYOFF distinction for element verbs. Previously Pillar 2
// counted MENTIONS and treated 2+ as a "probable loop" - which is wrong: two
// fragments both APPLYING Scorch with nothing consuming it is redundancy, not
// a loop; and a weapon consuming Scorch that nothing applies is a dead perk.
// A real loop needs BOTH sides. ⚠️ This is marker-based text analysis on
// Bungie's prose, not structured data: misclassifications will happen, which
// is why the result is EXPOSED in the pillar details rather than silently
// folded into a score.

import { normaliser, positionsMotCleStrict } from "../manifest/search";

export type RoleVerbe = "source" | "payoff" | "indetermine";

/**
 * FR : marqueurs indiquant que le texte APPLIQUE le verbe. Cherchés AVANT
 * l'occurrence du mot-clé, dans une fenêtre courte.
 * EN: markers indicating the text APPLIES the verb, searched BEFORE the
 * keyword occurrence within a short window.
 */
const MARQUEURS_SOURCE = [
  "applique",
  "appliquent",
  "inflige",
  "infligent",
  "octroie",
  "octroient",
  "confere",
  "conferent",
  "accorde",
  "accordent",
  "rend",
  "rendent",
  "genere",
  "generent",
  "provoque",
  "provoquent",
  "declenche",
  "declenchent",
  "cause",
  "causent",
  "devenez",
  "gagnez",
  "obtenez",
  // FR : ⚠️ AJOUT (26/08/2026) - verbes de dégâts génériques, manquants
  // jusqu'ici. Beaucoup de descriptions d'aptitude (mêlées surtout) suivent
  // le patron « [Endommage/Blesse/Touche/Frappe] et [debuff] la cible » -
  // sans ces verbes, la seule chose reconnue dans la phrase était le mot-clé
  // du debuff lui-même, jamais un marqueur SOURCE, ce qui la faisait tomber
  // en indéterminé (ou pire, en payoff avant le retrait des marqueurs bruts
  // ci-dessus). Trouvé via le signalement utilisateur sur la mêlée stasique.
  // EN: ⚠️ ADDED - generic damage verbs. Many ability descriptions (melees
  // especially) follow the pattern "[Damages/Hits/Strikes] and [debuffs] the
  // target" - without these verbs, nothing in the sentence was recognised as
  // a SOURCE marker, pushing it to indeterminate (or worse, payoff before
  // the bare-marker removal above). Found via the user's report on the
  // Stasis melee.
  "endommage",
  "endommagent",
  "blesse",
  "blessent",
  "touche",
  "touchent",
  "frappe",
  "frappent",
  // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine
  // transmises par l'utilisateur) - formes en "-ant" (gérondif),
  // totalement absentes jusqu'ici alors qu'elles sont fréquentes dans ce
  // corpus ("conferant un cumul de Charge éclair à chaque coup" - Sentinelle
  // ionique). Trouvé en faisant tourner les 387 textes réels à travers le
  // moteur de détection et en examinant chaque "payoff orphelin"/
  // "indéterminé" un par un.
  // EN: ⚠️ ADDED - gerund ("-ing") forms, entirely absent until now despite
  // being common in this corpus. Found by running the 387 real doctrine
  // texts through the detection engine.
  "appliquant",
  "infligeant",
  "octroyant",
  "conferant",
  "accordant",
  "rendant",
  "generant",
  "provoquant",
  "declenchant",
  "causant",
  "endommageant",
  "blessant",
  "touchant",
  "frappant",
  "vous etes",
  "grants",
  "applies",
  "inflicts",
  "causes",
  "makes",
  "become",
  "gain",
  "creates",
  // FR : ⚠️ ENRICHI (04/08/2026) - tournures manquantes révélées par un build
  // solaire réel de l'utilisateur, où "Ignition" et "Soin" restaient
  // "indéterminés" alors qu'ils sont clairement appliqués. Le vocabulaire des
  // effets de soin/restauration était particulièrement mal couvert.
  // EN: ⚠️ ENRICHED (2026-08-04) - missing turns of phrase revealed by a real
  // solar build where "Ignition" and "Cure" stayed "undetermined" though
  // clearly applied. Healing/restoration vocabulary was poorly covered.
  "vous soigne",
  "vous soignent",
  "soigne",
  "soignent",
  "restaure",
  "restaurent",
  "regenere",
  "regenerent",
  "amorce",
  "amorcent",
  "produit",
  "produisent",
  "emet",
  "emettent",
  "libere",
  "liberent",
  "active",
  "activent",
  "octroyant",
  "infligeant",
  "appliquant",
  "creant",
  "generant",
  "declenchant",
  "vous beneficiez",
  "beneficiez",
  "commence",
  "commencent",
  "heals",
  "restores",
  "triggers",
  "start",

  // FR : ⚠️ ENRICHI (04/08/2026) - marqueurs ANGLAIS, ajoutés parce que les
  // perks d'artefact viennent de la base de connaissance rédigée en anglais.
  // Le test avant/après a montré que la couverture anglaise était bien plus
  // faible que la française (13 marqueurs contre 57), ce qui faisait tomber
  // ces textes en « indéterminé » — soit 18 points au lieu de 35 pour une
  // vraie boucle. Le déséquilibre pénalisait donc le build de l'utilisateur
  // pour une raison qui n'a rien à voir avec sa qualité.
  //
  // Le manque principal : j'avais mis les formes CONJUGUÉES ("grants",
  // "applies") mais pas les INFINITIFS, or l'anglais des perks les emploie
  // massivement après un auxiliaire ("have a chance to jolt", "can apply").
  //
  // EN: ⚠️ ENRICHED (2026-08-04) - ENGLISH markers. Artifact perks come from
  // the English knowledge base, and English coverage was far thinner than
  // French (13 vs 57), pushing those texts into "undetermined" - 18 points
  // instead of 35 for a real loop. Main gap: I had CONJUGATED forms
  // ("grants", "applies") but not INFINITIVES, which English perk text uses
  // heavily after an auxiliary.
  "have a chance to",
  "chance to",
  "apply",
  "applying",
  "grant",
  "granting",
  "inflict",
  "inflicting",
  "cause",
  "causing",
  "create",
  "creating",
  "generate",
  "generating",
  "emit",
  "emits",
  "emitting",
  "spawn",
  "spawns",
  "spawning",
  "trigger",
  "triggering",
  "heal",
  "healing",
  "restore",
  "restoring",
  "become",
  "becoming",
  "activating",
  "activate",
  "on kill",
  "final blows",
  "final blow",
  "rapidly defeating",
  "you are",
  "you have",
];

/**
 * FR : marqueurs indiquant que le texte PROFITE d'un verbe déjà appliqué.
 * Certains se placent avant le mot-clé ("contre des cibles brûlées"), d'autres
 * après ("les cibles brûlées subissent") : on cherche donc des deux côtés.
 * EN: markers indicating the text CONSUMES an already-applied verb. Some sit
 * before the keyword, some after, so both sides are searched.
 */
const MARQUEURS_PAYOFF = [
  "affecte par",
  "affectee par",
  "affectees par",
  "affectes par",
  "sous l'effet",
  // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
  // variante au pluriel manquante. Trouvé sur "Charge inflexible" (Titan
  // Cryo-électrique) : « Sous LES EFFETS d'Amplificateur, le bouclier
  // bloque... » - ne matchait pas "sous l'effet" (singulier), la seule
  // forme couverte jusqu'ici.
  // EN: ⚠️ ADDED - missing plural variant, found on a real Titan aspect.
  "sous les effets",
  "contre des",
  "contre les",
  "contre une",
  "vaincre",
  "vainquez",
  "en vainquant",
  "detruire",
  "eliminer",
  "elimine une cible",
  "sur des cibles",
  "sur les cibles",
  // FR : ⚠️ RETIRÉ (26/08/2026) - "cibles", "ennemis", "combattants" étaient
  // listés ICI comme des marqueurs PAYOFF bruts (sans qualification), ce qui
  // causait un FAUX POSITIF massif et systématique : une phrase SOURCE tout
  // à fait normale comme « Ralentit les combattants proches » ou « Endommage
  // et ralentit les cibles à proximité » place presque toujours le mot
  // "cibles"/"combattants"/"ennemis" juste APRÈS le verbe de debuff, à
  // quelques caractères - plus proche que n'importe quel marqueur source
  // situé plus tôt dans la phrase. Résultat : `classerOccurrence` classait
  // ces phrases (qui APPLIQUENT clairement le verbe) en PAYOFF, menant à un
  // "payoff_orphelin" (0 pt + avertissement "ce perk ne se déclenchera
  // jamais") sur des perks parfaitement fonctionnels.
  //
  // Signalé par l'utilisateur (26/08) : la mêlée stasique en jeu applique
  // bien Ralentissement (confirmé par le surlignage cyan sur "Ralentir"
  // dans sa description), mais le Pilier 2 la classait en "quelque chose
  // les exploite alors que RIEN ne les applique" - ce qui cassait aussi
  // toute la chaîne Ralentissement → Gel → Brisure → Armure de givre en
  // aval, puisque le parcours en largeur ne démarre que depuis un verbe
  // ayant une vraie source.
  //
  // Reproduit et vérifié sur un script isolé (sans dépendances lourdes) :
  // "Ralentit les combattants proches." passait de {payoff: true} à
  // {indetermine: true} après ce retrait - un résultat sûr (crédit partiel,
  // pas de fausse alerte) plutôt qu'un résultat faux. Les formes QUALIFIÉES
  // ("contre des/les cibles", "sur des/les cibles") restent en place : elles
  // signalent un vrai payoff ("contre les cibles gelées" = la cible est
  // DÉJÀ affectée), contrairement à "cibles" seul qui ne présume rien sur
  // l'ordre sujet/effet.
  //
  // EN: ⚠️ REMOVED - "cibles"/"ennemis"/"combattants" were listed here as
  // BARE payoff markers, causing a massive systematic FALSE POSITIVE: a
  // perfectly normal SOURCE sentence like "Slows nearby combatants" almost
  // always places the target noun right AFTER the debuff verb - closer than
  // any source marker earlier in the sentence. Result: such sentences (which
  // clearly APPLY the verb) were classified as PAYOFF, producing a
  // "payoff_orphelin" (0 pts + "this perk will never trigger" warning) on
  // perfectly functional perks. Reported by the user: the Stasis melee
  // applies Slow (confirmed cyan-highlighted in its description) but Pillar
  // 2 classified it as an orphaned payoff - which also broke the entire
  // downstream chain (Slow → Freeze → Shatter → Frost Armor), since the
  // breadth-first traversal only starts from a verb with a real source.
  // Reproduced and verified in an isolated script: removing this marker
  // flips "Slows nearby combatants." from {payoff: true} to {indetermine:
  // true} - a SAFE outcome (partial credit, no false alarm) rather than a
  // wrong one. The QUALIFIED forms stay in place since they signal a real
  // payoff without assuming word order.

  "affected by",
  "against",
  "defeating",
  "defeat",
  "destroying",
  "damaging",

  // FR : ⚠️ ENRICHI (04/08/2026) - marqueurs ANGLAIS de payoff, même raison
  // que ci-dessus. "while" est le plus utile : l'anglais des perks exprime
  // très souvent la CONDITION d'un bonus par "While Amplified, ..." — ce qui
  // est bien un payoff (on profite d'un état déjà actif), et non une source.
  // EN: ⚠️ ENRICHED - English payoff markers. "while" matters most: perk text
  // often states a bonus's CONDITION as "While Amplified, ...", which is a
  // payoff (benefiting from an already-active state), not a source.
  "while",
  "when you have",
  "whenever",
  "targets affected",
  "affected targets",
  "on defeating",
  "after defeating",
  "versus",
  "against targets",
  "against enemies",
  "empowered by",
  "benefit from",
  "increased damage",
  "bonus damage",
  "deal more",
  "more damage to",
];

const FENETRE = 55;

/**
 * FR : classe UNE occurrence d'un mot-clé selon son contexte immédiat.
 * On compare la DISTANCE du marqueur source le plus proche à celle du
 * marqueur payoff le plus proche : dans « inflige Brûlure aux cibles », les
 * deux types de marqueurs sont présents, c'est la proximité qui tranche.
 * EN: classifies ONE keyword occurrence from its immediate context. We compare
 * the distance of the nearest source marker to that of the nearest payoff
 * marker: in "inflicts Scorch to targets" both are present, proximity decides.
 */
export function classerOccurrence(texteNormalise: string, positionMotCle: number): RoleVerbe {
  const debut = Math.max(0, positionMotCle - FENETRE);
  let avant = texteNormalise.slice(debut, positionMotCle);
  let apres = texteNormalise.slice(positionMotCle, positionMotCle + FENETRE);

  // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
  // BORNAGE AUX FRONTIÈRES DE PHRASE. Sans ça, la fenêtre de 55 caractères
  // pouvait traverser une frontière de phrase et capter un marqueur SANS
  // AUCUN RAPPORT GRAMMATICAL avec le mot-clé courant.
  //
  // Cas réel trouvé (fragment "L'itinérant") : « ... provoquent une
  // détonation de Suspension. Détruire un Enchevêtrement crée une salve de
  // Suspension... ». Pour le premier "Suspension", le marqueur source
  // "provoquent" est bien présent AVANT dans la même phrase - mais le
  // marqueur payoff "detruire" de la phrase SUIVANTE tombait dans la
  // fenêtre de 55 caractères après, et se trouvait plus PROCHE en distance
  // brute que "provoquent" (qui a besoin de remonter plus loin dans sa
  // propre phrase). Résultat : classé "payoff" à tort, alors que
  // "détruire" ne parle même pas de Suspension - il parle d'Enchevêtrement,
  // dans une phrase différente.
  //
  // Correction : on tronque `avant` à la dernière fin de phrase (., !, ?)
  // et `apres` à la première fin de phrase suivante - un marqueur qui
  // appartient à une AUTRE phrase ne peut plus contaminer la classification
  // de ce mot-clé. Risque résiduel jugé faible : cette base de 387 textes
  // ne contient pas de nombres décimaux ("5.5") qui auraient pu faire
  // basculer un "." interne à tort.
  //
  // EN: ⚠️ ADDED (387-ability audit) - SENTENCE-BOUNDARY BOUNDING. Without
  // it, the 55-char window could cross a sentence boundary and pick up a
  // marker with NO GRAMMATICAL RELATION to the current keyword. Real case
  // found: a source marker legitimately earlier in the SAME sentence lost
  // out to a payoff marker from the NEXT, unrelated sentence, simply
  // because it was closer in raw character distance.
  const finPhrasePrecedente = Math.max(avant.lastIndexOf("."), avant.lastIndexOf("!"), avant.lastIndexOf("?"));
  if (finPhrasePrecedente !== -1) avant = avant.slice(finPhrasePrecedente + 1);
  const finsPhraseSuivante = [".", "!", "?"].map((c) => {
    const i = apres.indexOf(c);
    return i === -1 ? Infinity : i;
  });
  const finPhraseSuivante = Math.min(...finsPhraseSuivante);
  if (finPhraseSuivante !== Infinity) apres = apres.slice(0, finPhraseSuivante + 1);

  // FR : ⚠️ CORRIGÉ (26/08/2026, passe d'audit du scoring) - ASYMÉTRIE
  // TROUVÉE : les marqueurs PAYOFF sont cherchés des DEUX côtés du mot-clé
  // (`avant` ET `apres`), mais les marqueurs SOURCE n'étaient cherchés
  // QU'AVANT. Ça marche pour la plupart des phrases ("inflige Brûlure aux
  // cibles" - "inflige" est naturellement avant), mais casse pour un cas
  // précis et réel : les verbes du catalogue dont le mot-clé est le NOM
  // même d'une capacité (ex: la grenade prismatique "Singularité Glacée"),
  // dans un texte au format "Nom — Description". Le nom vient TOUJOURS
  // avant sa description, donc le verbe qui décrit son effet ("applique",
  // "neutralise et ralentit"...) vient FORCÉMENT après - jamais avant.
  // Ces verbes ne pouvaient donc structurellement jamais être classés
  // "source", peu importe la formulation.
  //
  // Signalé par l'utilisateur (26/08) : sur un build Arcaniste Prismatique
  // avec la grenade Singularité Glacée (Transcendance active), Neutralisa-
  // tion et Ralentissement restaient "indéterminés" - or ces deux verbes ne
  // sont atteignables QUE via la chaîne depuis cette grenade
  // (`grenade_prismatique_arcaniste` → suppression, ralentissement), qui ne
  // démarre que si la grenade elle-même a une vraie source. Reproduit et
  // vérifié sur un script isolé : même avec « Singularité Glacée — Une
  // grenade qui applique Neutralisation et Ralentissement », le mot-clé
  // \"singularite glacee\" restait indéterminé AVANT ce correctif, malgré la
  // présence d'\"applique\".
  //
  // EN: ⚠️ FIXED (scoring audit pass) - ASYMMETRY FOUND: payoff markers were
  // searched on BOTH sides of the keyword, but source markers only BEFORE.
  // Works for most sentences, but breaks for catalog verbs whose keyword IS
  // an ability's own NAME in a "Name — Description" text: the name always
  // precedes its description, so the verb describing its effect necessarily
  // comes AFTER, never before. Such verbs could never be classified
  // "source", regardless of wording. Reported by the user on a Prismatic
  // Warlock build: Neutralisation/Ralentissement (only reachable via the
  // chain from this grenade) stayed "undetermined" because the grenade
  // itself never registered as a source.
  let distanceSource = Infinity;
  for (const m of MARQUEURS_SOURCE) {
    const i = avant.lastIndexOf(m);
    if (i !== -1) distanceSource = Math.min(distanceSource, avant.length - i);
    const j = apres.indexOf(m);
    if (j !== -1) distanceSource = Math.min(distanceSource, j);
  }

  let distancePayoff = Infinity;
  for (const m of MARQUEURS_PAYOFF) {
    const i = avant.lastIndexOf(m);
    if (i !== -1) distancePayoff = Math.min(distancePayoff, avant.length - i);
    // FR : un marqueur juste APRÈS le mot-clé compte aussi ("brûlées subissent"),
    // avec une distance mesurée depuis le mot-clé.
    const j = apres.indexOf(m);
    if (j !== -1) distancePayoff = Math.min(distancePayoff, j);
  }

  if (distanceSource === Infinity && distancePayoff === Infinity) return "indetermine";
  return distanceSource <= distancePayoff ? "source" : "payoff";
}

export interface RolesTrouves {
  source: boolean;
  payoff: boolean;
  indetermine: boolean;
}

/**
 * FR : parcourt un texte et classe TOUTES les occurrences des mots-clés d'un
 * verbe. Un même texte peut contenir les deux faces (« inflige Brûlure ; les
 * cibles brûlées explosent »), d'où des drapeaux plutôt qu'un rôle unique.
 * EN: scans a text and classifies ALL occurrences of a verb's keywords. One
 * text can contain both sides, hence flags rather than a single role.
 */
/**
 * FR : ⚠️ CHANGÉ (25/08/2026) - accepte désormais un second paramètre
 * optionnel pour les mots-clés STRICTS (frontière de mot), en plus des
 * mots-clés classiques (sous-chaîne). Même raison que dans `detecterVerbes` :
 * un mot-clé court comme "cure" matchait à tort à l'intérieur de mots plus
 * longs sans rapport.
 * EN: ⚠️ CHANGED - now accepts an optional second parameter for STRICT
 * (word-boundary) keywords, in addition to the classic substring ones.
 */
export function analyserTexte(texte: string, motsCles: string[], motsClesStricts: string[] = []): RolesTrouves {
  const t = normaliser(texte);
  const roles: RolesTrouves = { source: false, payoff: false, indetermine: false };
  for (const motCle of motsCles) {
    const cle = normaliser(motCle);
    let position = t.indexOf(cle);
    while (position !== -1) {
      const role = classerOccurrence(t, position);
      roles[role] = true;
      position = t.indexOf(cle, position + cle.length);
    }
  }
  for (const motCle of motsClesStricts) {
    const cle = normaliser(motCle);
    for (const position of positionsMotCleStrict(t, cle)) {
      const role = classerOccurrence(t, position);
      roles[role] = true;
    }
  }
  return roles;
}

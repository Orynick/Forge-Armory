// FR : Moteur de scoring principal — agrège les 5 piliers (20% chacun) en
// un score global sur 100. Chaque fonction score* ci-dessous correspond à
// un pilier et renvoie un score 0-100 + des justifications lisibles.
// EN: Main scoring engine — aggregates the 5 pillars (20% each) into an
// overall score out of 100. Each score* function below corresponds to one
// pillar and returns a 0-100 score plus readable justifications.

import { Database } from "sql.js";
import { ARTEFACTS, CONTRAINTES_ARTEFACT } from "../../data/artefacts";
import { VerbeCatalogue } from "../../data/elementVerbs";
import { obtenirNbSlotsFragments } from "../manifest/doctrine";
// FR : ⚠️ AJOUT (26/08/2026) - nécessaires au correctif de la synergie
// d'artefact (accents + frontière de mot), voir `scorePerksArtefact`.
// EN: ⚠️ ADDED - needed by the artifact synergy fix (accents + word
// boundary), see `scorePerksArtefact`.
import { normaliser, positionsMotCleStrict } from "../manifest/search";
// FR : ⚠️ AJOUT (06/09/2026) - source unique de l'ordre des piliers.
// EN: ⚠️ ADDED - single source for pillar order.
import { ORDRE_PILIERS } from "../../data/piliers";
import { BuildDraft, BuildScoreResult, PillarScore } from "../../types/build";
import { ExigenceStat, scoreStats, sommerStatsArmure, ContexteBuild } from "./stats";
import { scoreBonusSetsReels } from "./armorSets";
import { detecterVerbes, extraireTextesEffetsBuild, scoreVerbesDetectes, obtenirChampionsCouverts, detecterChainesVerbes, detecterRessourcesGenerees, enrichirAvecChaines } from "./verbes";
import { obtenirBonusStatsDoctrine, obtenirElementArme } from "../manifest/doctrine";
import { LIBELLES_CHAMPION } from "../../components/icones/IconeAntiChampion";

// FR : ⚠️ CHANGÉ (24/08/2026) - le poids fixe (20% partout) est remplacé par
// une table de poids PAR PILIER ET PAR CONTEXTE, miroir exact du tableau
// documenté dans NOTES-CONCEPTION.md ("Poids des piliers selon le contexte"). C'était
// la dernière pièce manquante du scoring tel qu'il a été conçu avec
// l'utilisateur : les poids étaient écrits et justifiés dans NOTES-CONCEPTION.md
// depuis plusieurs sessions, mais jamais appliqués au calcul réel.
//
// ⚠️ Toute modification de cette table doit être répercutée dans NOTES-CONCEPTION.md,
// et inversement - les deux doivent rester le miroir l'un de l'autre.
//
// EN: ⚠️ CHANGED - the fixed weight (20% everywhere) is replaced by a table
// of weights PER PILLAR AND PER CONTEXT, an exact mirror of the table
// documented in NOTES-CONCEPTION.md. This was the last missing piece of the scoring
// as designed with the user.
export const POIDS_PILIERS: Record<ContexteBuild, Record<CleP, number>> = {
  neutre:  { element_doctrine: 0.10, verbes_element: 0.30, perks_artefact: 0.15, loot_coherence: 0.20, stats_2_0: 0.25 },
  roaming: { element_doctrine: 0.10, verbes_element: 0.35, perks_artefact: 0.15, loot_coherence: 0.20, stats_2_0: 0.20 },
  dps:     { element_doctrine: 0.10, verbes_element: 0.25, perks_artefact: 0.15, loot_coherence: 0.20, stats_2_0: 0.30 },
  pvp:     { element_doctrine: 0.10, verbes_element: 0.20, perks_artefact: 0.10, loot_coherence: 0.20, stats_2_0: 0.40 },
};

export type CleP = "element_doctrine" | "verbes_element" | "perks_artefact" | "loot_coherence" | "stats_2_0";

function poidsPilier(cle: CleP, contexte: ContexteBuild): number {
  return POIDS_PILIERS[contexte][cle];
}

/**
 * Pilier 1 - Élément et Doctrine : cohérence entre l'élément choisi et les
 * aspects/fragments/super de la sous-classe (ex: fragments qui exigent un
 * verbe d'un autre élément que celui de la sous-classe = incohérence, sauf
 * en Prismatique où le mélange est la règle).
 *
 * TODO: une fois le Manifest importé, comparer subclass.element aux
 * définitions réelles des aspects/fragments (leur `damageTypeHashes`) plutôt
 * que de se fier au seul choix déclaré par l'utilisateur.
 */
/**
 * FR : ⚠️ AJOUT (04/08/2026) - données de doctrine résolues, EXPOSÉES pour
 * que le Pilier 4 les consomme au lieu de relire le Manifest de son côté.
 * Deux lectures indépendantes finiraient tôt ou tard par diverger sur
 * l'interprétation d'une même donnée.
 * EN: resolved subclass data, EXPOSED so Pillar 4 can consume it instead of
 * re-reading the Manifest itself - two independent reads would eventually
 * diverge on the same data.
 */
export interface DonneesDoctrine {
  element: BuildDraft["subclass"]["element"];
  nbAspects: number;
  nbFragments: number;
  /** FR : emplacements de fragments réellement offerts par les aspects équipés (0 si le Manifest n'est pas disponible). / EN: fragment slots actually offered by the equipped aspects. */
  capaciteFragments: number;
  aspectHashes: number[];
  fragmentHashes: number[];
}

export function resoudreDonneesDoctrine(build: BuildDraft, db?: Database): DonneesDoctrine {
  const { subclass } = build;
  const aspects = (subclass.aspectHashes ?? []).filter((h) => h && h !== 0);
  const fragments = (subclass.fragmentHashes ?? []).filter((h) => h && h !== 0);
  return {
    element: subclass.element,
    nbAspects: aspects.length,
    nbFragments: fragments.length,
    capaciteFragments: db ? obtenirNbSlotsFragments(db, aspects) : 0,
    aspectHashes: aspects,
    fragmentHashes: fragments,
  };
}

/**
 * FR : Pilier 1 — Élément et Doctrine.
 *
 * ⚠️ RÉÉCRIT (04/08/2026), et son POIDS ABAISSÉ à 10 %. Ce pilier mesure la
 * VALIDITÉ et la COMPLÉTUDE d'une doctrine, pas sa qualité : un build valide
 * et complet n'est pas un bon build, c'est un build correctement rempli. La
 * substance réelle d'une doctrine (les verbes qu'elle génère) est déjà notée
 * par le Pilier 2 — lui donner un poids fort reviendrait à compter deux fois
 * la même chose.
 *
 * Ce qu'il regarde, et que personne d'autre ne regarde :
 *   - les 2 aspects (TOUJOURS 2, Prismatique comprise) ;
 *   - les fragments réellement utilisés par rapport à la capacité OFFERTE
 *     par les aspects équipés. C'est le point le plus utile, et il n'est
 *     calculable que depuis la résolution de la stat "Capacité d'énergie
 *     d'aspect" (2223994109).
 *
 * EN: Pillar 1 - Element & Subclass. REWRITTEN and its WEIGHT LOWERED to 10%:
 * it measures VALIDITY and COMPLETENESS, not quality. A valid, complete build
 * isn't a good build - it's a correctly filled one. A subclass's real
 * substance (the verbs it generates) is already scored by Pillar 2.
 */
function scoreElementDoctrine(build: BuildDraft, db?: Database, contexte: ContexteBuild = "neutre"): PillarScore {
  const donnees = resoudreDonneesDoctrine(build, db);
  const details: string[] = [];

  // FR : ⚠️ CHANGÉ (06/09/2026) - le score partait de 100, donc une doctrine
  // simplement REMPLIE (2 aspects + tous les emplacements de fragment
  // occupés) décrochait le maximum. Remarque de l'utilisateur : c'est
  // disproportionné, « la validité ne devrait pas valoir autant qu'un build
  // réellement travaillé ».
  //
  // Ce pilier plafonne donc à 75 : une doctrine complète est correcte, pas
  // exemplaire. Les 25 points restants ne sont PAS attribuables — c'est
  // délibéré, et il faut être clair sur ce que ça vaut :
  //
  // ⚠️ VALEUR CHOISIE PAR L'UTILISATEUR (06/09/2026) : d'abord fixée à 85
  // par moi, puis abaissée à 75 sur sa décision explicite — « pour le score
  // de la doctrine, mets 75 pts maxi, laisse les autres blocs à 100 ». Les
  // 4 AUTRES piliers gardent donc bien un plafond de 100 : ce traitement
  // est propre au Pilier 1, parce qu'il est le seul à mesurer une simple
  // complétude plutôt qu'une qualité.
  //
  //   ⚠️ C'est un RE-CALIBRAGE, pas une nouvelle mesure. Comme le plafond
  //   baisse pour TOUS les builds de la même façon, l'effet sur le
  //   classement relatif entre deux builds est NUL — seul le score affiché
  //   du pilier (et donc 2,5 points du score global, ce pilier pesant 10 %)
  //   descend. Ça corrige l'impression trompeuse d'un « sans-faute » sur un
  //   critère facile, sans prétendre mesurer quoi que ce soit de nouveau.
  //
  //   Pour vraiment relever le niveau d'exigence il faudrait un critère
  //   SUPPLÉMENTAIRE, et je n'en ai pas trouvé qui ne fasse pas doublon :
  //   la substance d'une doctrine (les verbes produits) est déjà notée par
  //   « Effets du Build », et les malus de statistiques des fragments sont
  //   déjà comptés par « Statistiques ». Les compter ici les compterait
  //   deux fois — précisément ce que la réécriture du 04/08 cherchait à
  //   éviter en abaissant ce pilier à 10 %.
  //
  // EN: ⚠️ CHANGED - the score started at 100, so a merely FILLED subclass
  // scored full marks. Now caps at 75 (value set by the user): complete is
  // correct, not exemplary. The remaining 25 are deliberately unattainable.
  // The 4 OTHER pillars keep a cap of 100 - this treatment is specific to
  // Pillar 1, the only one measuring completeness rather than quality. Being clear about what
  // this is worth: it's a RECALIBRATION, not a new measurement - the cap
  // drops equally for every build, so relative ranking is UNAFFECTED; only
  // the displayed pillar score (and ~1.5 pts of the global score) goes
  // down. Genuinely raising the bar would need an ADDITIONAL criterion, and
  // I found none that isn't already covered by another pillar.
  // FR : ⚠️ ANNULÉ (24/09/2026) - retour à 100 sur décision de
  // l'utilisateur. Historique : plafond introduit le 06/09 (85, puis 75)
  // parce qu'un 100/100 pour une doctrine simplement complète semblait
  // disproportionné. À l'usage, le recalibrage n'apportait rien de
  // concret : il baissait le score de TOUS les builds de la même façon,
  // donc sans jamais les départager (c'était déjà la réserve formulée
  // quand il a été posé). La note maximale revient donc à 100, comme les
  // 4 autres blocs.
  // EN: ⚠️ REVERTED (24/09/2026) - back to 100 per the user's decision.
  // The cap (85, then 75) lowered every build equally and so never
  // separated them - exactly the caveat raised when it was introduced.
  let score = 100;

  if (!donnees.element) {
    return {
      pilier: "element_doctrine",
      score: 0,
      poids: poidsPilier("element_doctrine", contexte),
      details: ["Aucune sous-classe choisie — la doctrine ne peut pas être évaluée"],
    };
  }

  // FR : ⚠️ CORRIGÉ (04/08/2026) - le code supposait 3 aspects en Prismatique.
  // C'est FAUX : toutes les sous-classes en équipent 2 (correction de
  // l'utilisateur, qui joue le jeu). L'erreur, jamais vérifiée, faisait
  // perdre 30 points à tout build Prismatique valide.
  // EN: ⚠️ FIXED (2026-08-04) - the code assumed 3 aspects on Prismatic.
  // Every subclass equips 2. The unverified assumption cost every valid
  // Prismatic build 30 points.
  const NB_ASPECTS = 2;

  if (donnees.nbAspects < NB_ASPECTS) {
    const manquants = NB_ASPECTS - donnees.nbAspects;
    score -= manquants * 25;
    details.push(`⚠️ ${manquants} aspect(s) non équipé(s) sur ${NB_ASPECTS}`);
  } else {
    details.push(`✅ Aspects : ${donnees.nbAspects}/${NB_ASPECTS}`);
  }

  // FR : fragments — on compare à la capacité RÉELLEMENT offerte par les
  // aspects choisis (2 ou 3 chacun), pas à un "6" supposé. Sans Manifest on
  // ne peut pas la connaître : on s'abstient plutôt que de pénaliser au
  // hasard.
  if (donnees.capaciteFragments > 0) {
    if (donnees.nbFragments < donnees.capaciteFragments) {
      const inutilises = donnees.capaciteFragments - donnees.nbFragments;
      score -= Math.min(40, inutilises * 15);
      details.push(
        `⚠️ ${inutilises} emplacement(s) de fragment inutilisé(s) (${donnees.nbFragments}/${donnees.capaciteFragments} offerts par vos aspects)`
      );
    } else {
      details.push(
        `✅ Fragments : ${donnees.nbFragments}/${donnees.capaciteFragments} — capacité pleinement utilisée`
      );
    }
  } else if (donnees.nbFragments === 0) {
    score -= 20;
    details.push("⚠️ Aucun fragment sélectionné");
  } else {
    details.push(`Fragments : ${donnees.nbFragments} (capacité non calculable sans le Manifest)`);
  }

  return { pilier: "element_doctrine", score: Math.max(0, score), poids: poidsPilier("element_doctrine", contexte), details };
}

/**
 * FR : Pilier 4 (affichage) — « Effets du Build », ex-« Verbes d'Élément »
 * jusqu'au 06/09/2026. La clé interne reste `verbes_element`.
 * Le build doit à la fois APPLIQUER un
 * verbe (source) et en TIRER PROFIT (payoff) pour ne pas juste "proc" dans
 * le vide.
 *
 * ✅ IMPLÉMENTÉ (02/08/2026) : si un Manifest (`db`) est fourni, détecte
 * réellement les verbes présents dans les textes du build (super, aspects,
 * fragments, perks d'artefact, perks d'armes/armure), via le catalogue
 * `CATALOGUE_VERBES` (construit depuis `knowledge-base/`). Sans Manifest
 * (ex: build de démo avec hash placeholders), retombe sur l'ancien
 * comportement "stub" (score fixe 50), pour ne rien casser.
 *
 * EN: Pillar 2 - Element Verbs: the build must both APPLY a verb (source)
 * and BENEFIT from it (payoff) to avoid just "proc-ing into the void".
 *
 * ✅ IMPLEMENTED (2026-08-02): if a Manifest (`db`) is provided, actually
 * detects verbs present in the build's texts (super, aspects, fragments,
 * artifact perks, weapon/armor perks), via the `CATALOGUE_VERBES` catalog
 * (built from `knowledge-base/`). Without a Manifest (e.g. demo build with
 * placeholder hashes), falls back to the old "stub" behavior (fixed score
 * of 50), so nothing breaks.
 */
function scoreVerbesElement(build: BuildDraft, db?: Database, contexte: ContexteBuild = "neutre"): PillarScore {
  if (!db) {
    return {
      pilier: "verbes_element",
      score: 50,
      poids: poidsPilier("verbes_element", contexte),
      details: ["Manifest non fourni — score provisoire (branchez le Manifest pour une vraie détection)"],
    };
  }

  const textes = extraireTextesEffetsBuild(build, db);
  const verbesDetectes = detecterVerbes(textes);

  // FR : ⚠️ CHANGÉ (26/08/2026) - les chaînes sont désormais calculées AVANT
  // le score (pas seulement en affichage informatif après-coup), pour
  // pouvoir enrichir `verbesDetectes` avec `enrichirAvecChaines` avant de
  // noter. Décision du 25/08 ("notation reportée") maintenant tranchée :
  // voir le raisonnement complet sur `enrichirAvecChaines` (verbes.ts).
  // EN: ⚠️ CHANGED - chains are now computed BEFORE scoring, to enrich
  // `verbesDetectes` beforehand. The 25/08 "notation deferred" decision is
  // now settled - see the full reasoning on `enrichirAvecChaines`.
  const maillons = detecterChainesVerbes(verbesDetectes, textes);
  const verbesEnrichis = enrichirAvecChaines(verbesDetectes, maillons);
  const { score: scoreBoucles, details } = scoreVerbesDetectes(verbesEnrichis);

  // FR : ⚠️ CHANGÉ (06/09/2026) - regroupées par SOURCE, plus par cible.
  // Motif : demande de l'utilisateur après test réel, où "Charge d'armure"
  // se répétait sur 5 lignes consécutives (une par verbe qu'elle produit,
  // via Facette de détermination) — beaucoup de bruit pour une seule
  // mécanique. Une ligne par source, listant toutes ses cibles, dit la
  // même chose en une fois : `Charge d'armure → Maille tissée, Charge
  // éclair, Restauration, ...`
  //
  // Ce que ce choix coûte : les CONVERGENCES (plusieurs sources vers un
  // même verbe, ex : Enchevêtrement) ne sont plus visibles d'un coup d'œil
  // sur une seule ligne — elles apparaissent maintenant réparties sur
  // plusieurs lignes. Arbitrage assumé : dans les builds réels observés,
  // une source qui produit PLUSIEURS verbes est nettement plus fréquente
  // que plusieurs sources convergeant vers un seul, donc c'est ce
  // regroupement-ci qui réduit le plus le bruit.
  //
  // EN: ⚠️ CHANGED - grouped by SOURCE rather than by target. User request
  // after real testing: "Charge d'armure" repeated across 5 consecutive
  // lines (one per verb it produces) was noisy for a single mechanic. One
  // line per source listing all its targets says the same thing once.
  // Trade-off: convergences (several sources → one verb) are no longer
  // visible on a single line, but in observed real builds a source
  // producing several verbs is far more common than the reverse.
  if (maillons.length > 0) {
    const parSource = new Map<string, { source: VerbeCatalogue; cibles: string[]; conditionnel: boolean }>();
    for (const m of maillons) {
      const entree = parSource.get(m.source.id) ?? { source: m.source, cibles: [], conditionnel: false };
      if (!entree.cibles.includes(m.cible.nomFr)) entree.cibles.push(m.cible.nomFr);
      if (m.etaitConditionnel) entree.conditionnel = true;
      parSource.set(m.source.id, entree);
    }
    for (const { source, cibles, conditionnel } of parSource.values()) {
      details.push(
        `⛓️ ${source.nomFr} → ${cibles.join(", ")}${conditionnel ? " (condition vérifiée)" : ""}`
      );
    }
  }

  // FR : RESSOURCES d'aptitude générées, signal SÉPARÉ du score des
  // chaînes (décision du 25/08), groupé par TYPE plutôt qu'un compteur
  // générique.
  // EN: ability-energy resources generated, SEPARATE signal grouped by
  // TYPE.
  const ressources = detecterRessourcesGenerees(verbesDetectes, maillons, textes);
  if (ressources.length > 0) {
    const parType = new Map<string, string[]>();
    for (const { type, verbe } of ressources) {
      const liste = parType.get(type) ?? [];
      if (!liste.includes(verbe.nomFr)) liste.push(verbe.nomFr);
      parType.set(type, liste);
    }
    const LIBELLES_RESSOURCE: Record<string, string> = {
      melee: "Mêlée",
      grenade: "Grenade",
      classe: "Compétence de classe",
      super: "Super",
      generique: "Générique",
    };
    for (const [type, verbesSources] of parType) {
      // FR : ⚠️ CHANGÉ (06/09/2026) - libellé complet "Énergie d'aptitude
      // générée" porté DANS la ligne, au lieu de laisser le lecteur
      // deviner depuis la seule icône 🔋 (demande de l'utilisateur : "au
      // lieu de le mettre en légende, affiche-le dans le bloc"). Format :
      // type d'énergie, puis ce qui la génère.
      // EN: ⚠️ CHANGED - full label carried IN the line instead of relying
      // on the 🔋 icon alone as an implicit legend. Format: energy type,
      // then what generates it.
      details.push(
        `🔋 Énergie d'aptitude générée : ${LIBELLES_RESSOURCE[type] ?? type} — ${verbesSources.join(", ")}`
      );
    }

    // FR : ⚠️ AJOUT (26/08/2026) - bonus de score pour la génération de
    // ressources ACTIVE, jusqu'ici purement informative (décision du 25/08
    // "signal séparé du score des chaînes" - tranchée aujourd'hui : séparé
    // ne voulait pas dire absent du score, juste pas mélangé dans le même
    // compteur que les boucles).
    //
    // +6 pts par TYPE distinct de ressource générée (mêlée/grenade/classe/
    // Super/générique), plafonné à 20 - modeste par rapport à une boucle
    // (35 pts) : ce signal récompense une CARACTÉRISTIQUE additionnelle
    // d'un verbe déjà noté par ailleurs (boucle/source seule/etc.), pas un
    // second mécanisme indépendant à noter à parts égales. Compté par TYPE
    // et non par verbe : un build qui génère de la mêlée ET de la grenade
    // via 2 verbes différents est plus polyvalent qu'un build qui génère 2
    // FOIS de la mêlée via 2 verbes - le premier cas mérite le bonus
    // complet, pas le second.
    //
    // EN: ⚠️ ADDED - score bonus for ACTIVE resource generation, until now
    // purely informative. +6 pts per distinct resource TYPE, capped at 20 -
    // modest compared to a loop (35 pts): this rewards an ADDITIONAL
    // characteristic of a verb already scored elsewhere, not a second
    // independent mechanism to score at equal weight. Counted per TYPE, not
    // per verb: a build generating melee AND grenade energy via 2 different
    // verbs is more versatile than one generating melee energy TWICE via 2
    // verbs - the former deserves the full bonus, not the latter.
    const nbTypesDistincts = parType.size;
    const bonus = Math.min(20, nbTypesDistincts * 6);
    if (bonus > 0) {
      details.push(`✨ +${bonus} pts pour la génération active de ressources (${nbTypesDistincts} type(s) distinct(s))`);
    }
    const scoreFinal = Math.max(0, Math.min(100, scoreBoucles + bonus));
    return { pilier: "verbes_element", score: scoreFinal, poids: poidsPilier("verbes_element", contexte), details };
  }

  return { pilier: "verbes_element", score: scoreBoucles, poids: poidsPilier("verbes_element", contexte), details };
}

/**
 * FR : Pilier 2 (affichage) — « Artefact », ex-« Perks d'Artefact »
 * jusqu'au 06/09/2026. La clé interne reste `perks_artefact`.
 *
 * ⚠️ RÉÉCRIT (04/08/2026). L'ancienne formule était `40 + nbPerks × 15`,
 * arbitraire à double titre : quatre perks quelconques donnaient 100, et elle
 * lisait `artifact.perkHashes`, un champ vide depuis la création du sélecteur.
 * Le pilier affichait donc systématiquement 0.
 *
 * Trois composantes, sur des données réelles :
 *   - REMPLISSAGE (40 %) — les 7 emplacements sont-ils utilisés ? C'est
 *     mesurable sans ambiguïté ;
 *   - COHÉRENCE avec la doctrine (30 %) — l'artefact déclare les éléments
 *     qu'il soutient ; correspondent-ils à la sous-classe du build ?
 *   - SYNERGIE avec le build (30 %) — les descriptions des perks choisis
 *     mentionnent-elles des verbes déjà présents ailleurs dans le build ?
 *     C'est ce que réclamait le TODO du code : noter la synergie réelle
 *     plutôt que la simple présence.
 *
 * EN: Pillar 3 — Artifact Perks. REWRITTEN: the old `40 + nbPerks × 15` was
 * arbitrary (any four perks scored 100) and read an empty field, so the pillar
 * always showed 0. Now three components on real data: slot usage, coherence
 * with the subclass element, and synergy with verbs found elsewhere.
 */
function scorePerksArtefact(build: BuildDraft, db?: Database, contexte: ContexteBuild = "neutre"): PillarScore {
  const details: string[] = [];
  const cles = build.artifact.perkCles ?? [];
  const artefact = ARTEFACTS.find((a) => a.id === build.artifact.artifactId);

  if (!artefact) {
    return {
      pilier: "perks_artefact",
      score: 0,
      poids: poidsPilier("perks_artefact", contexte),
      details: ["Aucun artefact sélectionné — choisissez-en un sous « Mon Build »"],
    };
  }

  // --- 1. Remplissage des emplacements
  const remplissage = (cles.length / CONTRAINTES_ARTEFACT.perksMax) * 100;
  details.push(
    cles.length === CONTRAINTES_ARTEFACT.perksMax
      ? `✅ ${cles.length}/${CONTRAINTES_ARTEFACT.perksMax} emplacements utilisés`
      : `ℹ️ ${cles.length}/${CONTRAINTES_ARTEFACT.perksMax} emplacements utilisés — ${
          CONTRAINTES_ARTEFACT.perksMax - cles.length
        } perk(s) disponible(s) non pris`
  );

  // --- 2. Cohérence artefact ↔ doctrine
  let coherence = 100;
  const element = build.subclass.element;
  if (element) {
    if (artefact.elements.includes(element)) {
      details.push(`✅ L'artefact soutient votre doctrine ${element}`);
    } else {
      coherence = 30;
      details.push(
        `⚠️ L'artefact ne soutient pas votre doctrine ${element} (il couvre : ${artefact.elements.join(", ")})`
      );
    }
  } else {
    coherence = 50;
    details.push("Aucune sous-classe choisie — cohérence non évaluable");
  }

  // --- 3. Synergie avec les verbes du reste du build
  let synergie = 0;
  if (db && cles.length > 0) {
    // FR : verbes présents AILLEURS que dans l'artefact (doctrine, armes,
    // armures), pour ne pas compter l'artefact avec lui-même.
    const buildSansArtefact: BuildDraft = { ...build, artifact: { ...build.artifact, perkCles: [] } };
    const verbesAilleurs = detecterVerbes(extraireTextesEffetsBuild(buildSansArtefact, db))
      .filter((v) => v.nbMentions > 0)
      .map((v) => v.verbe);

    const textesArtefact = cles
      .map((cle) => {
        const [, tier, ...reste] = cle.split(":");
        const perk = artefact.perksParTier[Number(tier) as 1 | 2 | 3]?.find(
          (p) => p.nom === reste.join(":")
        );
        return perk ? `${perk.nom} ${perk.description}` : "";
      })
      .join(" ");

    // FR : ⚠️ CORRIGÉ (26/08/2026, passe d'audit du scoring) - DEUX bugs
    // sur la même ligne, tous deux dus au fait que cette comparaison
    // contournait `normaliser()`/`positionsMotCleStrict()` utilisées PARTOUT
    // ailleurs dans la détection de verbes :
    //
    //   1. ACCENTS : le texte de l'artefact n'était que `.toLowerCase()`,
    //      donc encore accentué ("brûlure", "gelées"), alors que les
    //      mots-clés du catalogue sont écrits SANS accents ("brulure",
    //      "gele") puisqu'ils sont conçus pour être comparés à du texte
    //      normalisé. Résultat : AUCUN mot-clé accentué ne matchait, et la
    //      composante synergie (30 % du Pilier 3) était systématiquement
    //      sous-évaluée. Vérifié : "brulure" contre "Vos armes infligent
    //      Brûlure" renvoyait `false`.
    //
    //   2. FRONTIÈRE DE MOT : `includes` brut réintroduisait ici exactement
    //      le bug corrigé le 25/08 ailleurs (mot-clé court trouvé au milieu
    //      d'un mot plus long : "cure" dans "filobscure"). Les mots-clés
    //      STRICTS du catalogue étaient d'ailleurs totalement ignorés par
    //      cette ligne, qui ne lisait que `motsClesFr`/`motsClesEn`.
    //
    // EN: ⚠️ FIXED (scoring audit pass) - TWO bugs on the same line, both
    // from bypassing the `normaliser()`/`positionsMotCleStrict()` helpers
    // used EVERYWHERE else: (1) ACCENTS - artifact text was only
    // `.toLowerCase()`, still accented, while catalog keywords are written
    // WITHOUT accents, so no accented keyword ever matched and the synergy
    // component (30% of Pillar 3) was systematically under-scored; (2) WORD
    // BOUNDARY - raw `includes` reintroduced the "cure" in "filobscure" bug
    // fixed elsewhere on 25/08, and STRICT keywords were ignored entirely.
    const textesArtefactNormalise = normaliser(textesArtefact);

    const verbesRenforces = verbesAilleurs.filter((v) => {
      const motsClesLarges = [...v.motsClesFr, ...v.motsClesEn];
      if (motsClesLarges.some((m) => textesArtefactNormalise.includes(normaliser(m)))) return true;
      const motsClesStricts = [...(v.motsClesStrictsFr ?? []), ...(v.motsClesStrictsEn ?? [])];
      return motsClesStricts.some((m) => positionsMotCleStrict(textesArtefactNormalise, normaliser(m)).length > 0);
    });

    if (verbesRenforces.length > 0) {
      synergie = Math.min(100, verbesRenforces.length * 40);
      details.push(
        `✅ Vos perks d'artefact renforcent ${verbesRenforces.length} effet(s) déjà présent(s) : ${verbesRenforces
          .map((v) => v.nomFr)
          .join(", ")}`
      );
    } else {
      details.push(
        "ℹ️ Aucun perk d'artefact ne renforce un effet déjà présent dans le build — ils fonctionnent indépendamment"
      );
    }
  }

  const score = Math.round(remplissage * 0.4 + coherence * 0.3 + synergie * 0.3);
  return { pilier: "perks_artefact", score: Math.max(0, Math.min(100, score)), poids: poidsPilier("perks_artefact", contexte), details };
}

/**
 * FR : Pilier 3 (affichage) — « Armes et Armures », ex-« Loot & Cohérence »
 * jusqu'au 06/09/2026. La clé interne reste `loot_coherence`.
 * Présence des pièces requises (exotique,
 * armes clés), absence de doublons/incohérences de build (ex: deux
 * exotiques d'armure), ET cohérence des bonus de Set d'armure (Armor 3.0)
 * avec le reste du build.
 * EN: Pillar 4 - Loot & Coherence: required pieces present (exotic, key
 * weapons), no duplicates/inconsistencies (e.g. two exotic armor pieces),
 * AND coherence of the equipped Armor Set bonuses (Armor 3.0) with the rest
 * of the build.
 */
function scoreLootCoherence(build: BuildDraft, db?: Database, contexte: ContexteBuild = "neutre"): PillarScore {
  const details: string[] = [];
  let score = 100;

  const exotiquesArmure = build.armure.filter((p) => p.isExotic).length;
  if (exotiquesArmure > 1) {
    score -= 100; // configuration illégale in-game
    details.push("Plus d'une pièce d'armure exotique équipée : configuration invalide");
  } else if (exotiquesArmure === 0) {
    score -= 20;
    details.push("Aucune armure exotique : bonus de build non exploité");
  } else {
    details.push("1 armure exotique équipée");
  }

  // FR : ⚠️ AJOUT (03/08/2026) - la règle "une seule arme exotique à la
  // fois" n'était jamais vérifiée (seule l'armure l'était). Même logique
  // que l'armure ci-dessus.
  // EN: ⚠️ ADDED (2026-08-03) - the "only one exotic weapon at a time"
  // rule was never checked (only armor was). Same logic as armor above.
  const exotiquesArmes = build.armes.filter((p) => p.isExotic).length;
  if (exotiquesArmes > 1) {
    score -= 100; // configuration illégale in-game
    details.push("Plus d'une arme exotique équipée : configuration invalide");
  } else if (exotiquesArmes === 1) {
    details.push("1 arme exotique équipée");
  }

  if (build.armes.length < 3) {
    score -= (3 - build.armes.length) * 15;
    details.push(`${build.armes.length}/3 emplacements d'armes remplis`);
  }

  // FR : ⚠️ CORRIGÉ (04/08/2026) - le pilier notait les sets d'après
  // `DEMO_SETS`, un jeu d'EXEMPLES, alors que l'affichage de "Mon Build"
  // utilisait déjà les vraies données du Manifest (`obtenirBonusSet`).
  // L'utilisateur l'a constaté de l'extérieur : le pilier annonçait "aucun
  // set détecté" pendant que Mon Build affichait correctement ses 2 pièces.
  // Une divergence visible entre deux parties de l'appli décrédibilise le
  // score entier, d'où le passage aux vraies données ici aussi.
  // EN: ⚠️ FIXED (2026-08-04) - the pillar scored sets from `DEMO_SETS`
  // (EXAMPLE data) while "Mon Build" already displayed real Manifest data.
  // The user saw the contradiction from the outside: the pillar said "no set
  // detected" while Mon Build correctly showed 2 pieces.
  const { score: scoreSets, details: detailsSets } = scoreBonusSetsReels(build.armure, db);
  details.push(...detailsSets);

  // FR : ⚠️ AJOUT (24/08/2026) - COUVERTURE ANTI-CHAMPION, conception déjà
  // arrêtée avec l'utilisateur et documentée dans NOTES-CONCEPTION.md ("Couverture
  // anti-champion : barème progressif").
  //
  // Barème 0/40/80/100 selon le nombre de types couverts : progression
  // volontairement forte sur les 2 premiers, une activité présentant
  // rarement les 3 Champions à la fois.
  //
  // ⚠️ TROIS sources, désormais. La 3e (capacités de DOCTRINE) avait
  // d'abord été EXCLUE (voir historique CHANGELOG du 05/08, plus tôt dans
  // la journée) : la seule source alors disponible
  // (13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md) datait d'avant la 9.7.0 et se
  // contredisait sur un point. Ce blocage est levé : la 3e source vient
  // maintenant de 10 verbes CONFIRMÉS un par un par citation en jeu de
  // l'utilisateur (voir `knowledge-base/22_CHAINES_DE_VERBES.md` et le
  // champ `championEtourdi` sur `CATALOGUE_VERBES`), pas d'une source
  // externe non vérifiée. Les armes et armures exotiques restent fiables
  // via les mêmes fonctions qu'avant.
  //
  // En PvP, la composante est totalement absente du calcul plutôt que
  // notée à 0 : les Champions n'existent pas dans ce mode, la noter
  // pénaliserait injustement un build qui n'en a simplement pas besoin.
  //
  // EN: ⚠️ ADDED - ANTI-CHAMPION COVERAGE, already designed with the user
  // and documented in NOTES-CONCEPTION.md. 0/40/80/100 scale by number of types
  // covered. THREE sources now: doctrine abilities were initially
  // deliberately EXCLUDED because the only source available then
  // (13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md) predated 9.7.0 and
  // self-contradicted on one point. That blocker is lifted: the 3rd
  // source now comes from 10 verbs CONFIRMED one by one via the user's
  // in-game citations (see `knowledge-base/22_CHAINES_DE_VERBES.md` and the
  // `championEtourdi` field on `CATALOGUE_VERBES`), not an unverified
  // external source. Weapon and exotic-armor detection remains reliable
  // via the same functions as before. In PvP the component is
  // absent from the calculation entirely rather than scored 0.
  let scoreChampion: number | null = null;
  if (contexte !== "pvp" && db) {
    // FR : ⚠️ CHANGÉ (24/08/2026) - appelle désormais `obtenirChampionsCouverts`
    // (verbes.ts), fonction PARTAGÉE avec le résumé visuel "Anti-champions"
    // de Mon Build. Élimine la divergence trouvée par l'utilisateur : ce
    // bloc-ci calculait déjà les 3 sources correctement, mais un AUTRE
    // endroit de l'appli (le résumé visuel) avait sa propre copie de la
    // logique, jamais synchronisée, ne vérifiant que les armes.
    // EN: ⚠️ CHANGED - now calls the SHARED `obtenirChampionsCouverts`,
    // eliminating the divergence the user found: a SEPARATE part of the
    // app had its own unsynced copy of this logic.
    const typesCouverts = obtenirChampionsCouverts(build, db);

    const BAREME = [0, 40, 80, 100];
    scoreChampion = BAREME[Math.min(typesCouverts.size, 3)];
    if (typesCouverts.size === 0) {
      details.push("⚠️ Aucune couverture anti-champion détectée sur ce build");
    } else {
      details.push(
        `✅ Couverture anti-champion : ${typesCouverts.size}/3 types (${[...typesCouverts].map((t) => LIBELLES_CHAMPION[t as "surcharge" | "bloqueur" | "implacable"]).join(", ")})`
      );
    }
  }

  // FR : ⚠️ AJOUT (24/08/2026) - COHÉRENCE ÉLÉMENTAIRE, conception déjà
  // arrêtée : LÉGÈRE (15% hors PvP, 25% en PvP) et jamais pénalisante. Une
  // arme cinétique n'a pas d'élément et reste excellente - elle n'est
  // JAMAIS comptée comme un défaut, seule la correspondance élémentaire
  // est récompensée quand elle existe. Depuis la 9.7.0 l'anti-champion ne
  // dépend plus de l'élément, l'argument principal en faveur du monochrome
  // a disparu : pousser vers des builds tout-un-élément appauvrirait le
  // jeu plutôt que d'aider.
  // EN: ⚠️ ADDED - ELEMENTAL COHERENCE, LIGHT (15%/25%) and never
  // penalising. A Kinetic weapon has no element and stays excellent - it's
  // NEVER counted as a flaw, only matching elements are rewarded when
  // present.
  let scoreElement: number | null = null;
  if (build.subclass.element && build.subclass.element !== "prismatique") {
    const armesAvecElement = build.armes.filter((a) => a.itemHash !== 0);
    if (armesAvecElement.length > 0) {
      // FR : on ne peut pas lire le type de dégâts d'une arme sans le
      // Manifest ; sans lui, la composante reste neutre (100) plutôt que
      // de pénaliser sur une donnée qu'on ne sait pas vérifier.
      if (db) {
        const correspondantes = armesAvecElement.filter((a) => {
          const type = obtenirElementArme(db, a.itemHash);
          // FR : cinétique (aucun élément) n'est jamais compté contre la
          // cohérence - seule une correspondance positive est comptée.
          return type === null || type === build.subclass.element;
        }).length;
        scoreElement = Math.round((correspondantes / armesAvecElement.length) * 100);
        if (correspondantes === armesAvecElement.length) {
          details.push(`✅ Armes accordées à votre doctrine ${build.subclass.element}`);
        } else if (correspondantes > 0) {
          details.push(
            `ℹ️ ${correspondantes}/${armesAvecElement.length} arme(s) dans l'élément de la doctrine (${build.subclass.element}) — jouable, rarement optimal`
          );
        }
      }
    }
  }

  // FR : recombine les 3 composantes selon leurs poids par contexte. Une
  // composante absente (PvP pour le champion, ou Manifest non chargé pour
  // l'élément) redistribue son poids sur les autres plutôt que de compter
  // comme un 0 - conforme au principe déjà acté pour le PvP, étendu ici
  // pour rester cohérent en cas de Manifest absent.
  const POIDS = {
    neutre:  { validite: 0.0, sets: 0.35, champion: 0.50, element: 0.15 },
    roaming: { validite: 0.0, sets: 0.30, champion: 0.55, element: 0.15 },
    dps:     { validite: 0.0, sets: 0.35, champion: 0.50, element: 0.15 },
    pvp:     { validite: 0.0, sets: 0.75, champion: 0.0, element: 0.25 },
  }[contexte];

  const composantes: { poids: number; valeur: number }[] = [{ poids: POIDS.sets, valeur: scoreSets }];
  if (scoreChampion !== null) composantes.push({ poids: POIDS.champion, valeur: scoreChampion });
  if (scoreElement !== null) composantes.push({ poids: POIDS.element, valeur: scoreElement });
  const poidsTotal = composantes.reduce((s, c) => s + c.poids, 0);
  const scoreCombine =
    poidsTotal > 0 ? composantes.reduce((s, c) => s + c.valeur * c.poids, 0) / poidsTotal : scoreSets;

  score = score * 0.6 + scoreCombine * 0.4;

  return { pilier: "loot_coherence", score: Math.max(0, Math.round(score)), poids: poidsPilier("loot_coherence", contexte), details };
}

/**
 * Pilier 5 - Statistiques 2.0 : voir lib/scoring/stats.ts pour le détail des
 * paliers T1-T20 et des exigences d'exotiques (ex: Caresse du Ver -> T10 Grenade).
 */
function scoreStats2(stats: ReturnType<typeof sommerStatsArmure>, exigences: ExigenceStat[], contexte: ContexteBuild = "neutre"): PillarScore {
  // FR : ⚠️ CORRIGÉ (24/08/2026) - le contexte n'était pas transmis à
  // `scoreStats`, qui l'accepte pourtant en paramètre : la pondération PAR
  // STAT (POIDS_STATS - Arme à 1.7 en DPS, Santé à 1.8 en PvP, etc.)
  // retombait donc toujours sur "neutre", même une fois le POIDS GLOBAL du
  // pilier correctement contextualisé. Les deux niveaux de pondération
  // documentés dans NOTES-CONCEPTION.md doivent varier ensemble.
  // EN: ⚠️ FIXED - context wasn't passed to `scoreStats`, though it accepts
  // it: PER-STAT weighting always fell back to "neutre" even once the
  // pillar's GLOBAL weight was correctly contextualised.
  const { score, details } = scoreStats(stats, exigences, contexte);
  return { pilier: "stats_2_0", score, poids: poidsPilier("stats_2_0", contexte), details };
}

/**
 * FR : ⚠️ AJOUT (24/08/2026) - taux de complétion d'un build.
 *
 * Compte les emplacements RÉELLEMENT remplis, pour afficher « ce build est
 * noté sur X % de ses emplacements » à côté du score, plutôt que de laisser
 * un score bas être ambigu entre « mauvais build » et « build à moitié
 * rempli ».
 *
 * ⚠️ Nombre d'aspects : TOUJOURS 2, Prismatique comprise (correction de
 * l'utilisateur, qui joue le jeu - le code supposait 3 en Prismatique et
 * faisait perdre 30 points à tout build Prismatique valide).
 *
 * ⚠️ Fragments : la capacité dépend des ASPECTS équipés (2 ou 3 emplacements
 * chacun), elle n'est pas fixe. Sans Manifest on ne peut pas la connaître :
 * on exclut alors les fragments du décompte plutôt que de supposer un
 * nombre - un taux calculé sur une base inventée serait pire qu'un taux
 * portant sur moins d'emplacements.
 *
 * EN: ⚠️ ADDED - build completion rate. Counts ACTUALLY filled slots so a low
 * score isn't ambiguous between "bad build" and "half-filled build".
 * Aspects are ALWAYS 2 (Prismatic included). Fragment capacity depends on
 * equipped aspects, so without the Manifest fragments are excluded from the
 * count rather than assuming a number.
 */
function calculerCompletion(build: BuildDraft, db?: Database): BuildScoreResult["completion"] {
  const manquants: string[] = [];
  let remplis = 0;
  let total = 0;

  function compter(estRempli: boolean, libelle: string) {
    total += 1;
    if (estRempli) remplis += 1;
    else manquants.push(libelle);
  }

  // --- Équipement
  const armesEquipees = build.armes.filter((a) => a.itemHash !== 0).length;
  for (let i = 0; i < 3; i++) {
    compter(i < armesEquipees, ["Arme cinétique", "Arme énergétique", "Arme lourde"][i]);
  }
  const armuresEquipees = build.armure.filter((a) => a.itemHash !== 0).length;
  for (let i = 0; i < 5; i++) {
    compter(i < armuresEquipees, ["Casque", "Gants", "Torse", "Jambes", "Marque de classe"][i]);
  }

  // --- Doctrine
  const s = build.subclass;
  compter(!!s.element, "Sous-classe");
  compter(!!s.superHash, "Super");
  compter(!!s.meleeHash, "Mêlée");
  compter(!!s.grenadeHash, "Grenade");
  compter(!!s.classeHash, "Compétence de classe");
  compter(!!s.sautHash, "Saut");

  const NB_ASPECTS = 2;
  const aspects = (s.aspectHashes ?? []).filter((h) => h && h !== 0);
  for (let i = 0; i < NB_ASPECTS; i++) {
    compter(i < aspects.length, `Aspect ${i + 1}`);
  }

  // FR : fragments comptés seulement si on connaît la capacité réelle.
  if (db && aspects.length > 0) {
    const capacite = obtenirNbSlotsFragments(db, aspects);
    const fragments = (s.fragmentHashes ?? []).filter((h) => h && h !== 0).length;
    for (let i = 0; i < capacite; i++) {
      compter(i < fragments, `Fragment ${i + 1}`);
    }
  }

  // --- Artefact
  compter(!!build.artifact.artifactId, "Artefact");
  if (build.artifact.artifactId) {
    const perks = (build.artifact.perkCles ?? []).length;
    for (let i = 0; i < CONTRAINTES_ARTEFACT.perksMax; i++) {
      compter(i < perks, `Perk d'artefact ${i + 1}`);
    }
  }

  return {
    taux: total > 0 ? Math.round((remplis / total) * 100) : 0,
    remplis,
    total,
    manquants,
  };
}

export function evaluerBuild(
  build: BuildDraft,
  exigencesExotiques: ExigenceStat[] = [],
  db?: Database,
  // FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - pondération personnalisée active
  // (lib/scoring/ponderations.ts), en fractions. Absente ou null : poids du
  // contexte, calcul strictement identique à avant.
  // EN: ⚠️ ADDED - active custom weighting, as fractions. Absent or null:
  // context weights, calculation strictly unchanged.
  poidsPersonnalises?: Record<CleP, number> | null
): BuildScoreResult {
  // FR : ⚠️ AJOUT (24/08/2026) - le contexte vit DANS le build
  // (`build.contexte`), pas en paramètre séparé de `evaluerBuild`. Choix
  // délibéré : le contexte décrit CE build précis ("mon build de raid" vs
  // "mon build PvP"), il doit donc être sauvegardé et rechargé AVEC lui - un
  // paramètre séparé aurait pu être oublié au moment de charger un loadout,
  // recalculant silencieusement sur "neutre" par défaut.
  // EN: ⚠️ ADDED - context lives INSIDE the build, not as a separate
  // parameter: it describes THIS specific build, so it must be saved and
  // reloaded WITH it - a separate parameter could be forgotten when loading
  // a loadout, silently recomputing on "neutre".
  const contexte: ContexteBuild = build.contexte ?? "neutre";

  // FR : sommées une seule fois ici, réutilisées par le pilier 5 ET
  // renvoyées à l'appelant (l'UI n'a plus besoin de re-sommer les stats
  // pour son graphique - cf. DashboardPage.tsx).
  // EN: summed once here, reused by pillar 5 AND returned to the caller
  // (the UI no longer needs to re-sum stats for its chart - see
  // DashboardPage.tsx).
  const statsTotales = sommerStatsArmure(build.armure);

  // FR : ⚠️ AJOUT (03/08/2026) - certains fragments (ex: "Écho
  // d'Expulsion" -> +10 Super) donnent un bonus de stat en plus de leur
  // effet - jusqu'ici jamais compté dans les stats totales du build,
  // uniquement les stats d'armure. Ajouté ici, avant le calcul du
  // Pilier 5, pour que le score ET le graphique reflètent le vrai total.
  // EN: ⚠️ ADDED (2026-08-03) - some fragments (e.g. "Echo of Expulsion"
  // -> +10 Super) grant a stat bonus on top of their effect - until now
  // never counted in the build's total stats, only armor stats. Added
  // here, before Pillar 5's calculation, so the score AND the chart
  // reflect the real total.
  if (db) {
    const bonusDoctrine = obtenirBonusStatsDoctrine(db, build.subclass);
    for (const [cle, valeur] of Object.entries(bonusDoctrine) as [keyof typeof statsTotales, number][]) {
      statsTotales[cle] = (statsTotales[cle] ?? 0) + valeur;
    }
  }

  // FR : ⚠️ RÉORGANISÉ (06/09/2026) - l'ordre de ce tableau détermine
  // l'ordre d'affichage des cartes de piliers. Il suit désormais
  // `ORDRE_PILIERS` (`data/piliers.ts`), la source unique partagée avec le
  // tableau des poids du bloc Contexte et les libellés des cartes.
  //
  // ⚠️ Ce tableau reste écrit à la main plutôt que généré depuis
  // `ORDRE_PILIERS` : chaque pilier a une signature d'appel différente
  // (arguments distincts), une boucle générique n'apporterait donc rien
  // ici. Si l'ordre change à nouveau, les DEUX doivent être mis à jour —
  // d'où le test de cohérence ajouté juste après.
  //
  // EN: ⚠️ REORGANISED - this array's order drives the pillar cards'
  // display order; it now follows `ORDRE_PILIERS` (the single source).
  // Kept hand-written rather than generated from it because each pillar
  // has a different call signature. If the order changes again, BOTH must
  // be updated - hence the consistency check right after.
  // FR : ⚠️ RÉORDONNÉ (08/10/2026) : Armes et Armures (loot) AVANT l'Artefact, comme `ORDRE_PILIERS` (demande de l'utilisateur : suivre l'ordre des blocs au-dessus du Scoring). Seul l'ordre change, pas les scores.
  const piliers = [
    scoreElementDoctrine(build, db, contexte),
    scoreLootCoherence(build, db, contexte),
    scorePerksArtefact(build, db, contexte),
    scoreVerbesElement(build, db, contexte),
    scoreStats2(statsTotales, exigencesExotiques, contexte),
  ];

  // FR : ⚠️ AJOUT (06/09/2026) - garde-fou contre la désynchronisation qui
  // a motivé la création de `data/piliers.ts`. En développement seulement :
  // si l'ordre ci-dessus s'écarte de `ORDRE_PILIERS`, on le signale tout de
  // suite en console plutôt que de laisser un tableau des poids afficher
  // des valeurs décalées par rapport aux cartes réelles - un bug silencieux
  // et difficile à repérer à l'œil nu.
  // EN: ⚠️ ADDED - dev-only guard against the desynchronisation that
  // motivated `data/piliers.ts`. Flags an order mismatch immediately rather
  // than letting the weights table silently disagree with the actual cards.
  if (import.meta.env.DEV) {
    const ordreReel = piliers.map((p) => p.pilier);
    if (ordreReel.join(",") !== ORDRE_PILIERS.join(",")) {
      console.warn(
        "[scoring] L'ordre du tableau `piliers` ne correspond plus à ORDRE_PILIERS (data/piliers.ts).",
        { ordreReel, ordreAttendu: ORDRE_PILIERS }
      );
    }
  }

  // FR : ⚠️ AJOUT (v0.2.8) - un réglage personnalisé remplace ici, et
  // seulement ici, le poids de chaque pilier. Chaque carte affiche donc le
  // poids réellement utilisé. Les scores des piliers ne changent pas.
  // EN: ⚠️ ADDED - a custom setting replaces each pillar's weight here, and
  // only here; pillar scores are unchanged.
  const piliersPonderes = poidsPersonnalises
    ? piliers.map((p) => ({ ...p, poids: poidsPersonnalises[p.pilier as CleP] ?? p.poids }))
    : piliers;

  const scoreGlobal = Math.round(piliersPonderes.reduce((acc, p) => acc + p.score * p.poids, 0));

  return {
    buildId: build.id,
    scoreGlobal,
    piliers: piliersPonderes,
    statsTotales,
    completion: calculerCompletion(build, db),
  };
}

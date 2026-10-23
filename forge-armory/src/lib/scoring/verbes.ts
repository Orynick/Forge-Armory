// FR : Detection et scoring du Pilier 2 (Verbes d'Element) a partir de
// textes reels (aspects, fragments, perks d'artefact, perks d'armes/
// armure), croises avec le catalogue CATALOGUE_VERBES.
// EN: Detection and scoring of Pillar 2 (Element Verbs) from real texts
// (aspects, fragments, artifact perks, weapon/armor perks), cross-
// referenced against CATALOGUE_VERBES.

import { Database } from "sql.js";
import { obtenirDefinition } from "../manifest/download";
import { normaliser, positionsMotCleStrict } from "../manifest/search";
import { CATALOGUE_VERBES, VerbeCatalogue } from "../../data/elementVerbs";
import type { DetailLigne } from "../../types/build";
import { BuildDraft } from "../../types/build";
import { ARTEFACTS } from "../../data/artefacts";
import { analyserTexte } from "./sourcePayoff";
import { obtenirAntiChampion, obtenirAntiChampionArmure, obtenirDescriptionComplete } from "../manifest/doctrine";
import { obtenirBonusSetsActifs } from "./armorSets";

export interface VerbeDetecte {
  verbe: VerbeCatalogue;
  /** FR : nombre de textes DISTINCTS (aspect/fragment/perk...) qui mentionnent ce verbe. / EN: number of DISTINCT texts mentioning this verb. */
  nbMentions: number;
  /** FR : au moins un texte APPLIQUE ce verbe. / EN: at least one text APPLIES this verb. */
  aSource: boolean;
  /** FR : au moins un texte PROFITE de ce verbe. / EN: at least one text CONSUMES this verb. */
  aPayoff: boolean;
  /**
   * FR : ⚠️ AJOUT (24/08/2026) - noms RÉELS des perks/mods qui ont déclenché
   * ce verbe (ex: "Surcharge d'arme solaire", "Siphon cinétique"), demande
   * de l'utilisateur : un verbe générique comme "Surcharge d'arme" regroupe
   * en réalité plusieurs mods distincts (de Super, de Mêlée, d'un type
   * d'arme précis...), et l'ancien affichage ne montrait que le nom du
   * VERBE, jamais celui du mod qui l'a produit. On extrait le nom depuis le
   * texte "Nom — description" déjà construit par extraireTextesEffetsBuild,
   * sans nouvelle lecture du Manifest.
   * EN: ⚠️ ADDED - REAL names of the perks/mods that triggered this verb. A
   * generic verb like "Surcharge d'arme" actually groups several distinct
   * mods; the previous display only showed the VERB's name, never the mod
   * that produced it. Extracted from the "Name — description" text already
   * built by extraireTextesEffetsBuild, no extra Manifest read.
   */
  sources: string[];
  /**   * FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - sous-ensemble de `sources`
   * provenant d'un PERK SIMULÉ dans la Forge (l'arme porte `perksSimules`). Sert au badge
   * « simulé » dans le pilier « Effets du Build » : un verbe déclenché UNIQUEMENT par
   * des perks simulés est marqué. Si le verbe a AUSSI une source réelle, le badge n'est PAS
   * posé (l'effet existe réellement en jeu).
   * EN: subset of `sources` coming from a SIMULATED perk (the weapon carries `perksSimules`).
   * Used for the "simulated" badge in the "Effects of the Build" pillar: a verb triggered
   * ONLY by simulated perks is marked. If the verb ALSO has a real source, no badge (the
   * effect really exists in game).
   */
  sourcesSimulees: string[];
  /**
   * FR : ⚠️ AJOUT (26/08/2026) - expose le rôle "indéterminé" séparément,
   * jusqu'ici une variable locale de `detecterVerbes`. Nécessaire pour
   * recalculer `confiance` après enrichissement par la chaîne
   * (`enrichirAvecChaines`, voir plus bas) sans dupliquer la logique de
   * décision dans deux fonctions différentes.
   * EN: ⚠️ ADDED - exposes the "undetermined" role separately, until now a
   * local variable. Needed to recompute `confiance` after chain enrichment
   * without duplicating the decision logic in two places.
   */
  aIndetermine: boolean;
  /**
   * FR : ⚠️ REMPLACE (04/08/2026) l'ancienne heuristique basée sur le simple
   * COMPTAGE de mentions, qui traitait 2 mentions comme une "boucle probable"
   * même quand les deux étaient des sources sans aucun payoff.
   *   "boucle"        = source ET payoff présents → vraie synergie
   *   "source_seule"  = appliqué mais rien ne l'exploite
   *   "payoff_orphelin" = quelque chose l'exploite mais RIEN ne l'applique
   *                       (perk mort : c'est le défaut le plus coûteux, et
   *                       le plus invisible sans cette distinction)
   *   "indetermine"   = mentionné, mais le texte n'a pas permis de trancher
   * EN: REPLACES the old mention-COUNT heuristic which treated 2 mentions as a
   * "probable loop" even when both were sources with no payoff.
   */
  confiance: "absent" | "boucle" | "source_seule" | "payoff_orphelin" | "indetermine";
}

/**
 * FR : ⚠️ AJOUT (26/08/2026) - logique de décision PARTAGÉE entre
 * `detecterVerbes` (calcul initial, texte seul) et `enrichirAvecChaines`
 * (recalcul après ricochet de chaîne, voir plus bas). Extraite pour ne pas
 * dupliquer les 5 branches dans deux fonctions qui doivent rester
 * synchronisées.
 * EN: ⚠️ ADDED - SHARED decision logic between `detecterVerbes` (initial,
 * text-only) and `enrichirAvecChaines` (recompute after chain ricochet).
 * Extracted so the 5 branches aren't duplicated across two functions that
 * must stay in sync.
 */
function calculerConfiance(aSourceEffectif: boolean, aPayoff: boolean, aIndetermine: boolean): VerbeDetecte["confiance"] {
  if (!aSourceEffectif && !aPayoff && !aIndetermine) return "absent";
  if (aSourceEffectif && aPayoff) return "boucle";
  if (aSourceEffectif) return "source_seule";
  if (aPayoff) return "payoff_orphelin";
  return "indetermine";
}

/**
 * FR : Détecte, à partir d'une liste de textes bruts (descriptions de
 * perks/aspects/fragments), quels verbes du catalogue sont mentionnés et
 * avec quelle confiance.
 * EN: Detects, from a list of raw texts (perk/aspect/fragment
 * descriptions), which catalog verbs are mentioned and with what
 * confidence.
 */
export function detecterVerbes(
  textes: string[],
  catalogue: VerbeCatalogue[] = CATALOGUE_VERBES,
  /** FR : drapeaux parallèles à `textes` (même longueur) : true = le texte provient d'un perk SIMULÉ (Forge). Absent = aucun texte simulé (comportement historique). / EN: flags parallel to `textes` (same length): true = the text comes from a SIMULATED perk (Forge). Absent = no simulated text (historical behaviour). */
  textesSimules?: boolean[]
): VerbeDetecte[] {
  const textesNormalises = textes.map(normaliser);

  return catalogue.map((verbe) => {
    const motsCles = [...verbe.motsClesFr, ...verbe.motsClesEn];
    const motsClesNormalises = motsCles.map(normaliser);
    // FR : ⚠️ AJOUT (25/08/2026) - mots-clés STRICTS (frontière de mot),
    // en plus de la recherche en sous-chaîne existante ci-dessus.
    // EN: ⚠️ ADDED - STRICT keywords, in addition to the existing
    // substring search above.
    const motsClesStricts = [...(verbe.motsClesStrictsFr ?? []), ...(verbe.motsClesStrictsEn ?? [])];
    const motsClesStrictsNormalises = motsClesStricts.map(normaliser);
    const indexTextesCorrespondants = textesNormalises
      .map((t, i) =>
        motsClesNormalises.some((m) => t.includes(m)) ||
        motsClesStrictsNormalises.some((m) => positionsMotCleStrict(t, m).length > 0)
          ? i
          : -1
      )
      .filter((i) => i >= 0);
    const nbMentions = indexTextesCorrespondants.length;

    // FR : ⚠️ AJOUT (24/08/2026) - noms réels extraits des textes
    // correspondants (partie avant le " — ", format posé par
    // extraireTextesEffetsBuild). Dédupliqués : plusieurs pièces peuvent
    // porter le même mod.
    const sources = [
      ...new Set(
        indexTextesCorrespondants
          .map((i) => textes[i].split(" — ")[0]?.trim())
          .filter((nom): nom is string => !!nom)
      ),
    ];
    // FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - sources SIMULÉES : les textes
    // correspondants marqués `simule` (perk choisi dans la Forge). Le badge « simulé » ne se
    // pose que si le verbe n'a AUCUNE source réelle (sinon l'effet existe réellement en jeu).
    // EN: SIMULATED sources: matching texts flagged `simule` (perk chosen in the Forge). The
    // "simulated" badge is only shown when the verb has NO real source (otherwise the effect
    // really exists in game).
    const sourcesSimulees = [
      ...new Set(
        indexTextesCorrespondants
          .filter((i) => textesSimules?.[i] === true)
          .map((i) => textes[i].split(" — ")[0]?.trim())
          .filter((nom): nom is string => !!nom)
      ),
    ];

    // FR : on analyse chaque texte séparément pour savoir s'il APPLIQUE le
    // verbe ou s'il en PROFITE (voir sourcePayoff.ts). Un même texte peut
    // faire les deux, d'où l'agrégation par OU.
    //
    // ⚠️ OPTIMISÉ (26/08/2026) - ne parcourt plus QUE les textes qui
    // contiennent réellement un mot-clé de ce verbe
    // (`indexTextesCorrespondants`), au lieu de TOUS les textes du build.
    // Le résultat est identique : `analyserTexte` ne peut renvoyer un rôle
    // que s'il trouve une occurrence du mot-clé, donc les textes écartés ici
    // ne remontaient de toute façon que `{false, false, false}`. Le gain
    // est réel : ce double parcours (38 verbes × N textes, avec une
    // recherche de sous-chaîne par mot-clé et par marqueur à chaque fois)
    // est le point chaud du Pilier 2, et un build complet fournit facilement
    // 40+ textes dont seule une poignée concerne un verbe donné.
    // EN: ⚠️ OPTIMISED - only iterates over texts that actually contain one
    // of this verb's keywords, instead of ALL the build's texts. Identical
    // result: `analyserTexte` can only return a role if it finds a keyword
    // occurrence, so skipped texts contributed nothing. Real gain: this
    // nested scan (38 verbs × N texts) is Pillar 2's hot path.
    let aSource = false;
    let aPayoff = false;
    let aIndetermine = false;
    for (const i of indexTextesCorrespondants) {
      const roles = analyserTexte(textes[i], motsCles, motsClesStricts);
      aSource = aSource || roles.source;
      aPayoff = aPayoff || roles.payoff;
      aIndetermine = aIndetermine || roles.indetermine;
    }

    // FR : ⚠️ AJOUT (26/08/2026, passe d'audit du scoring) - voir la doc
    // complète du champ sur `VerbeCatalogue`. Pour un verbe d'IDENTITÉ de
    // capacité (Transcendance, grenades prismatiques), la simple présence
    // du mot-clé PROUVE la source, l'analyse par marqueurs textuels étant
    // structurellement incapable de le détecter (le nom vient toujours
    // avant sa propre description).
    //
    // ⚠️ Compromis assumé : ne distingue pas l'ORIGINE du texte (une
    // mention dans un perk d'arme/artefact forcerait `aSource` de la même
    // façon qu'une mention dans la doctrine). Risque jugé faible - ces
    // verbes désignent des noms de capacités qu'un perk d'arme/artefact a
    // peu de raisons de citer - et le pire cas (une classification trop
    // généreuse plutôt que trop sévère) reste cohérent avec le principe déjà
    // acté : ne pas facturer à l'utilisateur une limite de notre détection.
    //
    // EN: ⚠️ ADDED - see the field's full doc on `VerbeCatalogue`. For an
    // ability-IDENTITY verb, mere keyword presence PROVES the source, since
    // marker-based text analysis structurally cannot detect it. Accepted
    // trade-off: doesn't distinguish text ORIGIN - judged low-risk, and the
    // worst case (overly generous rather than overly harsh) matches the
    // already-established principle.
    if (verbe.sourceImplicite && nbMentions > 0) {
      aSource = true;
    }

    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // voir la doc complète du champ sur `VerbeCatalogue`. Exceptions
    // PONCTUELLES et VÉRIFIÉES (phrase-signature exacte requise via
    // `conditionVerifiee`, pas un assouplissement général des marqueurs).
    // EN: ⚠️ ADDED - see the field's full doc on `VerbeCatalogue`. SPECIFIC,
    // VERIFIED exceptions (exact signature phrase required).
    if (verbe.sourcesForcees?.some((cond) => conditionVerifiee(normaliser(cond), textesNormalises))) {
      aSource = true;
    }

    // FR : ⚠️ CHANGÉ (26/08/2026) - utilise désormais `calculerConfiance`,
    // partagée avec `enrichirAvecChaines`. Le garde `nbMentions === 0` de
    // l'ancienne version est équivalent à `!aSource && !aPayoff &&
    // !aIndetermine` : si aucun mot-clé ne matche, aucun des 3 rôles ne
    // peut être vrai (ils dépendent tous d'un texte correspondant).
    // EN: ⚠️ CHANGED - now uses `calculerConfiance`, shared with
    // `enrichirAvecChaines`. The old `nbMentions === 0` guard is equivalent
    // to `!aSource && !aPayoff && !aIndetermine`.
    const confiance = calculerConfiance(aSource, aPayoff, aIndetermine);

    return { verbe, nbMentions, aSource, aPayoff, aIndetermine, sources, sourcesSimulees, confiance };
  });
}

/**
 * FR : Extrait tous les textes pertinents d'un build (super, aspects,
 * fragments, perks d'artefact, perks d'armes/armure équipés) via le
 * Manifest, pour alimenter detecterVerbes(). Renvoie une liste de textes
 * (une entrée par objet Manifest distinct trouvé).
 * EN: Extracts all relevant texts from a build (super, aspects, fragments,
 * artifact perks, equipped weapon/armor perks) via the Manifest, to feed
 * detecterVerbes(). Returns a list of texts (one entry per distinct
 * Manifest object found).
 */
/**
 * FR : ⚠️ AJOUT (24/08/2026) - extrait UNIQUEMENT le texte de la doctrine
 * équipée (super/mêlée/grenade/compétence de classe/aspects/fragments),
 * sans les perks d'armes/armures/artefact. Séparée de
 * `extraireTextesEffetsBuild` pour la 3e source anti-champion : celle-ci ne
 * doit lire QUE la doctrine, pas les perks d'armes/armures déjà couverts par
 * les deux autres sources (`obtenirAntiChampion`/`obtenirAntiChampionArmure`)
 * - les mélanger risquerait de compter un même champion deux fois pour des
 * raisons différentes, ou d'attribuer à tort un effet d'arme à la doctrine.
 * EN: ⚠️ ADDED - extracts ONLY the equipped doctrine's text, without
 * weapon/armor/artifact perks. Split out for the 3rd anti-champion source,
 * which must read ONLY the doctrine to avoid double-counting or
 * misattributing a weapon effect to the doctrine.
 */
export function extraireTextesDoctrineBuild(build: BuildDraft, db: Database): string[] {
  const textes: string[] = [];

  // FR : ⚠️ CORRIGÉ (27/08/2026) - BUG MAJEUR trouvé par l'utilisateur en
  // testant les aspects "Esquive furtive" et "Sentinelle ionique" seuls :
  // le Pilier 2 affichait "Aucun verbe d'élément détecté" alors que le
  // surlignage cyan de l'appli reconnaissait bien "invisible" dans le
  // texte de l'aspect. Cause : cette fonction ne lisait que
  // `displayProperties.description` DIRECTEMENT sur l'objet - or les
  // ASPECTS ont très souvent cette description DIRECTE VIDE, le vrai texte
  // d'effet vivant sur un PERK LIÉ (`perks[].perkHash`), comme documenté
  // de façon détaillée sur `obtenirDescriptionComplete` (doctrine.ts,
  // 4 itérations de correctifs les 03-04/08 pour EXACTEMENT ce problème,
  // à l'origine trouvé sur un Catalyseur). Cette fonction-ci n'avait
  // jamais été mise à jour pour bénéficier de ce même correctif : le
  // sélecteur de doctrine (`obtenirOptionsSousClasse`, utilisé pour
  // l'AFFICHAGE) résout correctement la description via
  // `obtenirDescriptionComplete` depuis le 03/08, mais le Pilier 2
  // (SCORING) lisait le champ brut en parallèle, sans jamais converger -
  // les deux textes divergeaient silencieusement depuis 3 semaines.
  //
  // Corrigé en réutilisant `obtenirDescriptionComplete`, qui concatène la
  // description directe ET tous les perks liés (sans rien perdre : la
  // description directe, quand elle existe, reste incluse).
  //
  // EN: ⚠️ FIXED - MAJOR BUG found by the user testing "Esquive furtive"
  // and "Sentinelle ionique" aspects alone: Pillar 2 showed "No verb
  // detected" even though the app's own cyan highlighting correctly found
  // "invisible" in the aspect's text. Cause: this function only read
  // `displayProperties.description` DIRECTLY, but ASPECTS very often have
  // an EMPTY direct description, with the real effect text living on a
  // LINKED PERK - exactly the problem `obtenirDescriptionComplete` was
  // built to solve on 03-04/08 (for a Catalyst, originally), but this
  // scoring-side function was never updated to use it. The doctrine
  // picker (display) and Pillar 2 (scoring) had been silently diverging
  // for 3 weeks. Fixed by reusing `obtenirDescriptionComplete`.
  function ajouterDepuisHash(hash: number, table: string) {
    if (!hash) return; // 0 = placeholder, rien à chercher
    const def = obtenirDefinition<{ displayProperties?: { name?: string } }>(db, table, hash);
    const nom = def?.displayProperties?.name;
    if (!nom) return;
    const { description } = obtenirDescriptionComplete(db, hash);
    const texte = [nom, description].filter(Boolean).join(" — ");
    if (texte) textes.push(texte);
  }

  ajouterDepuisHash(build.subclass.superHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build.subclass.meleeHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build.subclass.grenadeHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build.subclass.classeHash, "DestinyInventoryItemDefinition");
  for (const h of build.subclass.aspectHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition");
  for (const h of build.subclass.fragmentHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition");

  return textes;
}

/** FR : un texte extrait d'un build, avec son drapeau « simulé » (perk choisi dans la Forge). / EN: a text extracted from a build, with its "simulated" flag (perk chosen in the Forge). */
export interface TexteExtrait {
  texte: string;
  simule: boolean;
}

export function extraireTextesEffetsBuild(build: BuildDraft, db: Database): string[] {
  return extraireTextesEffetsBuildMarques(build, db).map((t) => t.texte);
}

/** FR : comme `extraireTextesEffetsBuild`, mais chaque texte porte son drapeau « simulé » (perk Forge). / EN: like `extraireTextesEffetsBuild`, but each text carries its "simulated" flag (Forge perk). */
export function extraireTextesEffetsBuildMarques(build: BuildDraft, db: Database): TexteExtrait[] {
  const textesMarques: TexteExtrait[] = extraireTextesDoctrineBuild(build, db).map((texte) => ({ texte, simule: false }));
  const textes = textesMarques;

  // FR : ⚠️ AJOUT (24/08/2026) - fonction locale réintroduite après la
  // refactorisation ci-dessus : `ajouterDepuisHash` vit désormais dans le
  // scope de `extraireTextesDoctrineBuild`, inaccessible ici. Même logique,
  // dupliquée une seule fois plutôt que de complexifier l'export.
  // EN: ⚠️ ADDED - local function reintroduced after the refactor above:
  // `ajouterDepuisHash` now lives in `extraireTextesDoctrineBuild`'s scope.
  //
  // FR : ⚠️ CORRIGÉ (27/08/2026) - même correctif que la copie ci-dessus
  // dans `extraireTextesDoctrineBuild` (voir son commentaire pour le
  // diagnostic complet) : utilise `obtenirDescriptionComplete` au lieu du
  // champ brut, par cohérence et sécurité - même si le problème a été
  // trouvé sur un ASPECT, rien n'exclut qu'un perk d'arme/armure/artefact
  // utilise un jour le même schéma (description sur un perk lié).
  // EN: ⚠️ FIXED - same fix as the copy above in
  // `extraireTextesDoctrineBuild` - uses `obtenirDescriptionComplete`
  // instead of the raw field, for consistency and safety.
  function ajouterDepuisHash(hash: number, table: string, simule = false) {
    if (!hash) return;
    const def = obtenirDefinition<{ displayProperties?: { name?: string } }>(db, table, hash);
    const nom = def?.displayProperties?.name;
    if (!nom) return;
    const { description } = obtenirDescriptionComplete(db, hash);
    const texte = [nom, description].filter(Boolean).join(" — ");
    if (texte) textes.push({ texte, simule });
  }

  // FR : ⚠️ CORRIGÉ (04/08/2026) - BUG MAJEUR. Les perks d'objets étaient
  // résolus dans "DestinySandboxPerkDefinition" alors que `perkHashes`
  // contient des PLUGS, qui vivent dans "DestinyInventoryItemDefinition".
  // La lecture échouait SILENCIEUSEMENT (undefined, aucune erreur levée) :
  // aucun texte n'était extrait des armes ni des armures, et le Pilier 2
  // affichait toujours "Aucun verbe détecté" - ce que l'utilisateur a pris
  // pour un message figé lors de ses tests. Autrement dit, le Pilier 2
  // n'analysait QUE la doctrine depuis le début.
  // EN: ⚠️ FIXED (2026-08-04) - MAJOR BUG. Item perks were resolved against
  // "DestinySandboxPerkDefinition" while `perkHashes` holds PLUGS, which live
  // in "DestinyInventoryItemDefinition". The lookup failed SILENTLY, so no
  // text was ever extracted from weapons or armor: Pillar 2 only ever
  // analysed the subclass.
  for (const piece of [...build.armes, ...build.armure]) {
    // FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - sur une pièce SIMULÉE (Forge), on
    // marque chaque texte extrait : le verbe déclenché portera le badge « simulé » dans le
    // pilier « Effets du Build ». L'armure n'est jamais simulée (seules les armes le sont).
    // EN: on a SIMULATED piece (Forge), each extracted text is marked: the verb it triggers
    // will carry the "simulated" badge in the "Effects of the Build" pillar. Armor is never
    // simulated (weapons only).
    const simule = piece.perksSimules === true;
    for (const h of piece.perkHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition", simule);
  }

  // FR : ⚠️ CORRIGÉ (04/08/2026) - `artifact.perkHashes` est l'ANCIEN champ,
  // vide depuis que le sélecteur d'artefact utilise `perkCles`. On lit
  // désormais les descriptions depuis ARTEFACTS, seule source réelle.
  // EN: ⚠️ FIXED (2026-08-04) - `artifact.perkHashes` is the OLD field, empty
  // since the artifact selector uses `perkCles`.
  // FR : ⚠️ ADAPTÉ (04/08/2026) - la clé identifie le PERK
  // (idArtefact:tier:nom), plus un slot, suite à la correction du modèle
  // d'après les captures du jeu.
  for (const cle of build.artifact.perkCles ?? []) {
    const [idArtefact, tier, ...resteNom] = cle.split(":");
    const nomPerk = resteNom.join(":");
    const artefact = ARTEFACTS.find((a) => a.id === idArtefact);
    const perk = artefact?.perksParTier[Number(tier) as 1 | 2 | 3]?.find((p) => p.nom === nomPerk);
    if (perk) textes.push({ texte: `${perk.nom} — ${perk.description}`, simule: false });
  }

  // FR : ⚠️ AJOUT (25/08/2026) - BONUS DE SET, jusqu'ici JAMAIS lus par la
  // détection de verbes. Angle mort confirmé avec l'utilisateur : leurs
  // descriptions étaient bien récupérées du Manifest et affichées à l'écran
  // (Inventaire, Mon Build), mais aucun texte n'était transmis au Pilier 2 -
  // un bonus de set qui applique « Blessure solaire » n'apparaissait donc ni
  // en cyan, ni dans le score. Le Pilier 4 (anti-champion) souffrait du même
  // manque, puisqu'il s'appuie sur la même extraction.
  //
  // ⚠️ SEULS LES BONUS ACTIFS sont injectés (`obtenirBonusSetsActifs`) : un
  // bonus n'existe que si le seuil de pièces est atteint. Injecter les
  // descriptions de TOUS les paliers d'un set, y compris ceux non atteints,
  // aurait fait détecter des verbes que le build ne produit pas réellement -
  // un score faussement élevé, plus trompeur qu'une absence de détection.
  //
  // EN: ⚠️ ADDED - SET BONUSES, never read by verb detection until now.
  // Their descriptions were fetched and displayed on screen, but never fed
  // to Pillar 2 - a set bonus applying "Scorch" showed neither in cyan nor
  // in the score. Pillar 4 had the same gap, sharing this extraction.
  // ONLY ACTIVE bonuses are injected: injecting every tier regardless of the
  // threshold would detect verbs the build doesn't actually produce.
  for (const bonus of obtenirBonusSetsActifs(build.armure, db)) {
    textes.push({ texte: `${bonus.nom} — ${bonus.description}`, simule: false });
  }

  return textes;
}

/**
 * FR : Score du Pilier 2 à partir des verbes détectés.
 *
 * ⚠️ RÉÉCRIT (04/08/2026) pour exploiter la distinction source/payoff. La
 * version précédente valorisait le simple NOMBRE de mentions, ce qui
 * récompensait la redondance (deux fragments appliquant le même verbe) autant
 * qu'une vraie synergie.
 *
 * Barème et son raisonnement :
 *   - BOUCLE (source + payoff) = 35 pts. C'est le seul cas qui constitue
 *     réellement une synergie, il domine donc le score.
 *   - SOURCE SEULE = 8 pts. Le verbe est appliqué, ce n'est pas inutile
 *     (dégâts, contrôle), mais rien ne capitalise dessus.
 *   - PAYOFF ORPHELIN = 0 pt, et signalé comme un DÉFAUT. Un perk qui
 *     exploite un verbe que rien n'applique ne se déclenchera jamais : c'est
 *     pire qu'un emplacement vide, puisqu'il occupe une place utile.
 *   - INDÉTERMINÉ = 4 pts. Le verbe est présent mais l'analyse de texte n'a
 *     pas tranché ; on accorde un demi-crédit plutôt que de sanctionner
 *     l'utilisateur pour une limite de NOTRE détection.
 *
 * EN: Pillar 2 score. REWRITTEN to use the source/payoff distinction: the old
 * version rewarded mention COUNT, treating redundancy as synergy. Only a
 * source+payoff pair is a real loop. An orphan payoff scores 0 and is flagged
 * as a defect: a perk consuming a verb nothing applies will never fire.
 * "Indeterminate" gets half credit rather than penalising the user for a
 * limitation of OUR detection.
 */
export function scoreVerbesDetectes(verbesDetectes: VerbeDetecte[]): { score: number; details: string[]; detailsMarques: DetailLigne[] } {
  const details: string[] = [];
  // FR : version annotée des lignes (badge « simulé » dans PilierCarte). On la construit EN
  // MÊME TEMPS que `details` : même contenu, chaque ligne sait si elle vient d'un perk simulé.
  // EN: annotated version of the lines (the "simulated" badge in PilierCarte). Built AT THE
  // SAME TIME as `details`: same content, each line knows if it comes from a simulated perk.
  const detailsMarques: DetailLigne[] = [];
  const pousse = (texte: string, simule = false) => {
    details.push(texte);
    detailsMarques.push({ texte, simule });
  };
  const boucles = verbesDetectes.filter((v) => v.confiance === "boucle");
  const sourcesSeules = verbesDetectes.filter((v) => v.confiance === "source_seule");
  const orphelins = verbesDetectes.filter((v) => v.confiance === "payoff_orphelin");
  const indetermines = verbesDetectes.filter((v) => v.confiance === "indetermine");

  if (boucles.length + sourcesSeules.length + orphelins.length + indetermines.length === 0) {
    return {
      score: 20,
      details: ["Aucun verbe d'élément détecté dans les aspects/fragments/perks du build"],
      detailsMarques: [{ texte: "Aucun verbe d'élément détecté dans les aspects/fragments/perks du build", simule: false }],
    };
  }

  // FR : ⚠️ PRÉSENTATION CHANGÉE (04/08/2026) - demande de l'utilisateur.
  // Avant : une ligne par verbe, au format « [icône] Effet — commentaire »,
  // ce qui répétait le même commentaire autant de fois qu'il y avait de
  // verbes concernés. Maintenant : le commentaire s'affiche UNE fois en
  // titre, suivi de la liste des verbes concernés, un par ligne. Plus court
  // à lire, et les verbes se comparent d'un coup d'œil.
  // EN: ⚠️ LAYOUT CHANGED - user request. Before: one line per verb as
  // "[icon] Effect — comment", repeating the same comment for every affected
  // verb. Now the comment appears ONCE as a heading, followed by the affected
  // verbs one per line.
  function ajouterGroupe(icone: string, commentaire: string, verbes: VerbeDetecte[]) {
    if (verbes.length === 0) return;
    pousse(`${icone} ${commentaire}`);
    // FR : ⚠️ CORRIGÉ (04/08/2026) - le "• " devant chaque verbe créait une
    // DOUBLE PUCE : chaque `details[i]` est déjà rendu dans un <li> par
    // PilierCarte, qui affiche sa propre puce via le CSS de la liste. Un
    // simple retrait suffit ; l'indentation reste visible grâce aux espaces
    // devant le nom.
    // EN: ⚠️ FIXED (2026-08-04) - the "• " before each verb caused a DOUBLE
    // BULLET: each `details[i]` is already rendered inside a <li> by
    // PilierCarte, which shows its own bullet via the list's CSS.
    for (const v of verbes) {
      // FR : ⚠️ AJOUT (24/08/2026) - affiche les sources réelles entre
      // parenthèses quand elles apportent une info que le nom du verbe seul
      // n'a pas. Demande de l'utilisateur : "Surcharge d'arme" regroupait
      // "Surcharge de Super", "Surcharge de Mêlée"... sans jamais dire
      // lequel. On ne montre les sources QUE si elles diffèrent du nom du
      // verbe lui-même (évite un "Radieux (Radieux)" redondant pour les
      // verbes classiques où le nom du perk EST déjà le nom du verbe).
      // EN: ⚠️ ADDED - shows real sources in parentheses when they add info
      // the verb name alone doesn't have. Only shown when they differ from
      // the verb's own name, to avoid redundant "Radieux (Radieux)" for
      // classic verbs where the perk name already IS the verb name.
      const sourcesUtiles = v.sources.filter(
        (s) => normaliser(s) !== normaliser(v.verbe.nomFr) && normaliser(s) !== normaliser(v.verbe.nomEn)
      );
      const suffixe = sourcesUtiles.length > 0 ? ` (${sourcesUtiles.join(", ")})` : "";
      // FR : ⚠️ AJOUT (20/10/2026, branche draft-optimiseur) - BADGE « simulé » : le verbe
      // n'est déclenché QUE par des perks simulés (aucune source réelle) → la ligne est
      // marquée (PilierCarte affiche le badge) et le texte porte le suffixe « 🔨 simulé »
      // (fiche/export texte). Si le verbe a AUSSI une source réelle, pas de badge : l'effet
      // existe réellement en jeu.
      // EN: "simulated" badge: the verb is triggered ONLY by simulated perks (no real
      // source) → the line is flagged (PilierCarte shows the badge) and the text carries
      // the « 🔨 simulated » suffix (sheet/text export). If the verb ALSO has a real
      // source, no badge: the effect really exists in game.
      const simule = v.sourcesSimulees.length > 0 && v.sources.length === v.sourcesSimulees.length;
      pousse(`  ${v.verbe.nomFr}${suffixe}${simule ? " · 🔨 simulé" : ""}`, simule);
    }
  }

  ajouterGroupe("✅", "Boucle complète — le build applique ces effets ET en profite :", boucles);
  ajouterGroupe("ℹ️", "Appliqués, mais rien dans le build n'en profite :", sourcesSeules);
  ajouterGroupe(
    "⚠️",
    "Quelque chose les exploite alors que RIEN ne les applique — ces perks ne se déclencheront jamais :",
    orphelins
  );
  ajouterGroupe(
    "❓",
    "Présents dans le build, mais l'analyse de texte n'a pas su dire s'ils sont appliqués ou exploités (limite de la détection, pas du build) :",
    indetermines
  );

  // FR : ⚠️ RÉÉQUILIBRÉ (04/08/2026) après un cas réel : un build solaire
  // efficace (boucle Radieux → Restauration → Ignition) était noté 16/100
  // parce que 2 de ses 3 verbes tombaient en "indéterminé". Autrement dit,
  // l'échec de MA détection était facturé au build de l'utilisateur.
  //
  // Deux corrections :
  //   1. l'indéterminé passe de 4 à 18 points — à mi-chemin entre la source
  //      seule (12) et la boucle (35). Un verbe présent mais non classé est
  //      plus probablement utile qu'inutile : les builds réels ont rarement
  //      des verbes décoratifs.
  //   2. la source seule passe de 8 à 12 : appliquer un verbe a une valeur
  //      propre (dégâts, contrôle), même sans payoff explicite.
  //
  // EN: ⚠️ REBALANCED after a real case: an effective solar build scored
  // 16/100 because 2 of its 3 verbs fell into "undetermined" - i.e. MY
  // detection's failure was billed to the user's build. Undetermined now
  // scores 18 (between source-only at 12 and a full loop at 35): a verb that
  // is present but unclassified is more likely useful than not.
  //
  // FR : ⚠️ CORRIGÉ (26/08/2026, passe d'audit du scoring) - INCOHÉRENCE
  // TROUVÉE : `payoff_orphelin` valait 0 point et n'apparaissait nulle part
  // dans cette somme, ce qui produisait un résultat absurde : un build ne
  // contenant QU'un verbe orphelin était noté 0, alors qu'un build sans
  // AUCUN verbe est noté 20 (le plancher plus haut dans cette fonction).
  // Autrement dit, avoir un perk mal classé notait moins bien que n'avoir
  // rien du tout - et pire, l'écart se creusait précisément dans le cas que
  // l'utilisateur venait de signaler (la mêlée stasique classée à tort en
  // orphelin coûtait 12 pts de plus que le simple avertissement affiché).
  //
  // L'orphelin passe donc à 6 points : le plus bas des quatre états, parce
  // qu'il reste le défaut le plus coûteux à signaler quand il est RÉEL (un
  // perk qui ne se déclenchera jamais), mais non nul - une classification
  // orpheline est aussi le symptôme le plus fréquent d'une limite de notre
  // analyse de texte, exactement comme l'indéterminé. Le même raisonnement
  // qu'en 2. ci-dessus s'applique : ne pas facturer à l'utilisateur une
  // erreur de NOTRE détection. L'avertissement explicite reste affiché dans
  // les détails, lui : c'est là qu'est la vraie valeur pédagogique, pas
  // dans une punition de score.
  //
  // EN: ⚠️ FIXED (scoring audit pass) - INCONSISTENCY FOUND:
  // `payoff_orphelin` scored 0 and was absent from this sum, producing an
  // absurd result: a build containing ONLY an orphaned verb scored 0, while
  // a build with NO verbs at all scores 20 (the floor above). Having a
  // misclassified perk scored WORSE than having nothing. Orphans now score
  // 6: still the lowest of the four states (a perk that will never fire is
  // the costliest real defect), but non-zero - an orphan classification is
  // also the most common symptom of a limit in our own text analysis, just
  // like "undetermined". The explicit warning stays in the details, which is
  // where the pedagogical value actually is.
  const score = Math.max(
    0,
    Math.min(100, boucles.length * 35 + sourcesSeules.length * 12 + indetermines.length * 18 + orphelins.length * 6)
  );
  return { score, details, detailsMarques };
}

/**
 * FR : ⚠️ AJOUT (24/08/2026) - fonction PARTAGÉE pour la couverture
 * anti-champion, extraite après avoir trouvé un bug : le résumé visuel
 * "Anti-champions" de Mon Build (cases ☑/☐) avait sa PROPRE logique,
 * jamais synchronisée avec le calcul du Pilier 4 - elle ne vérifiait même
 * QUE les armes (jamais les armures exotiques, jamais la doctrine).
 * Signalé par l'utilisateur : un build sous Radiance seule (couverture
 * Bloqueur via doctrine) montrait le Pilier 4 correct mais la case
 * Bloqueur du résumé restait décochée - exactement la divergence que cette
 * extraction élimine.
 *
 * Les TROIS sources (armes, armures exotiques, doctrine) vivent maintenant
 * ICI uniquement ; `pillars.ts` et le résumé visuel appellent tous les
 * deux cette même fonction.
 *
 * EN: ⚠️ ADDED - SHARED anti-champion coverage function, extracted after
 * finding a bug: Mon Build's "Anti-champions" visual summary had its OWN
 * logic, never synced with Pillar 4's calculation - it only ever checked
 * WEAPONS (never exotic armor, never doctrine). Reported by the user: a
 * build under Radiance alone showed Pillar 4 correctly but the summary's
 * Bloqueur checkbox stayed unchecked. The THREE sources now live HERE
 * only; both `pillars.ts` and the visual summary call this same function.
 */
export function obtenirChampionsCouverts(build: BuildDraft, db: Database): Set<"surcharge" | "bloqueur" | "implacable"> {
  const typesCouverts = new Set<"surcharge" | "bloqueur" | "implacable">();

  for (const arme of build.armes) {
    const c = obtenirAntiChampion(db, arme.itemHash);
    if (c) typesCouverts.add(c);
  }
  for (const piece of build.armure) {
    if (!piece.isExotic) continue;
    const c = obtenirAntiChampionArmure(db, piece.itemHash);
    if (c) typesCouverts.add(c.type);
  }

  const textesDoctrine = extraireTextesDoctrineBuild(build, db);
  const verbesDetectes = detecterVerbes(textesDoctrine);
  for (const v of verbesDetectes) {
    if (v.nbMentions > 0 && v.verbe.championEtourdi) {
      typesCouverts.add(v.verbe.championEtourdi);
    }
  }

  return typesCouverts;
}

/**
 * FR : ⚠️ AJOUT (25/08/2026) - un maillon de chaîne CONFIRMÉ : le verbe
 * source a une vraie source dans le build (`aSource`, pas une simple
 * mention), et le lien produit/consomme est actif (inconditionnel, ou sa
 * condition a été vérifiée dans les textes du build).
 * EN: ⚠️ ADDED - a CONFIRMED chain link: the source verb has a real source
 * in the build, and the produces/consumes link is active.
 */
export interface MaillonChaine {
  source: VerbeCatalogue;
  cible: VerbeCatalogue;
  /** FR : true si ce maillon dépendait d'une condition (fragment/aspect) et qu'elle a été vérifiée présente. / EN: true if this link depended on a condition that was verified present. */
  etaitConditionnel: boolean;
}

/**
 * FR : ⚠️ AJOUT (25/08/2026) - détecte les CHAÎNES de verbes (Pilier 2),
 * chantier posé le 24/08 et conçu en détail avec l'utilisateur le 25/08.
 *
 * Principe : un verbe A ne "produit" B pour de vrai dans CE build que si
 * A a une vraie SOURCE (quelque chose l'applique, `aSource`) - une simple
 * mention ou un payoff seul ne suffit pas à affirmer que le build
 * déclenche réellement A. Les liens CONDITIONNELS (`conditionnel` porte la
 * description du fragment/aspect requis, jamais son nom - décision du
 * 25/08) ne sont retenus que si cette description est trouvée parmi les
 * textes déjà extraits du build, avec le même principe de racine que le
 * reste du catalogue (pas une correspondance exacte).
 *
 * ⚠️ Ne calcule AUCUN score : la notation a été explicitement REPORTÉE
 * (décision du 25/08) le temps de savoir précisément ce qui doit être
 * noté. Cette fonction ne fait que DÉTECTER et EXPLIQUER, à charge pour
 * l'appelant de décider quoi en faire.
 *
 * EN: ⚠️ ADDED - detects verb CHAINS (Pillar 2). A verb A only really
 * "produces" B in THIS build if A has a real SOURCE - a mere mention or a
 * payoff alone isn't enough. CONDITIONAL links are only kept if their
 * required fragment/aspect's description is found among the build's
 * already-extracted texts. Computes NO score: notation was explicitly
 * DEFERRED until it's clear what should be scored.
 */
export function detecterChainesVerbes(verbesDetectes: VerbeDetecte[], textes: string[]): MaillonChaine[] {
  const parId = new Map<string, VerbeDetecte>();
  for (const v of verbesDetectes) parId.set(v.verbe.id, v);

  const textesNormalises = textes.map(normaliser);
  const maillons: MaillonChaine[] = [];

  // FR : ⚠️ CORRIGÉ (25/08/2026) - un simple parcours à UN SEUL SAUT ne
  // suffit pas. Exemple validé avec l'utilisateur : la grenade prismatique
  // de l'Arcaniste produit Ralentissement, qui déclenche Gel "par ricochet,
  // sans que rien ne le mentionne" - Gel n'a lui-même AUCUNE source propre
  // dans le texte du build, seule la CHAÎNE l'atteint. Un verbe ATTEINT par
  // la chaîne doit donc pouvoir continuer à en produire d'autres, pas
  // seulement les verbes ayant leur propre `aSource`.
  //
  // Parcours en largeur (BFS) : on part des verbes réellement sourcés dans
  // le build (`aSource`), puis on suit `produit` de proche en proche - un
  // verbe ATTEINT devient à son tour un point de départ pour la suite de
  // la chaîne. `dejaAtteints` évite les boucles infinies (ex : un cycle
  // accidentel dans les données).
  //
  // EN: ⚠️ FIXED - a single-hop pass isn't enough. Validated example: the
  // Arcaniste's prismatic grenade produces Ralentissement, which triggers
  // Gel "by ricochet" - Gel has NO source of its own in the build's text,
  // only the CHAIN reaches it. A verb REACHED by the chain must be able to
  // keep producing others, not just verbs with their own `aSource`.
  const dejaAtteints = new Set<string>();
  const file: string[] = [];

  for (const v of verbesDetectes) {
    if (v.aSource) {
      dejaAtteints.add(v.verbe.id);
      file.push(v.verbe.id);
    }
  }

  while (file.length > 0) {
    const idActuel = file.shift()!;
    const verbeActuel = parId.get(idActuel);
    if (!verbeActuel?.verbe.produit) continue;

    for (const lien of verbeActuel.verbe.produit) {
      const cibleDetectee = parId.get(lien.verbeId);
      if (!cibleDetectee) continue; // verbe cible absent du catalogue fourni (ne devrait pas arriver)

      let actif = true;
      if (lien.conditionnel) {
        // FR : ⚠️ CHANGÉ (26/08/2026) - passe par `conditionVerifiee`
        // (robuste aux variations de formulation) au lieu d'un `includes`
        // sur la phrase entière, qui échouait silencieusement au moindre
        // écart avec la transcription manuelle. Voir `conditionVerifiee`.
        // EN: ⚠️ CHANGED - uses `conditionVerifiee` instead of a
        // whole-sentence `includes` that failed silently on any wording gap.
        actif = conditionVerifiee(normaliser(lien.conditionnel), textesNormalises);
      }
      if (!actif) continue;

      maillons.push({ source: verbeActuel.verbe, cible: cibleDetectee.verbe, etaitConditionnel: !!lien.conditionnel });

      if (!dejaAtteints.has(lien.verbeId)) {
        dejaAtteints.add(lien.verbeId);
        file.push(lien.verbeId);
      }
    }
  }

  return maillons;
}

/**
 * FR : ⚠️ AJOUT (26/08/2026, passe d'audit du scoring) - vérification d'une
 * condition de lien, ROBUSTE aux petites variations de formulation.
 *
 * PROBLÈME CORRIGÉ : les deux endroits qui vérifiaient une condition
 * (`detecterChainesVerbes` et `detecterRessourcesGenerees`) faisaient un
 * `texte.includes(condition)` sur la PHRASE ENTIÈRE. Or les champs
 * `conditionnel` du catalogue sont des transcriptions MANUELLES faites en
 * lisant des captures d'écran (audit des fragments des 25-26/08) : la
 * moindre différence avec le texte réel du Manifest — un mot d'écart, une
 * virgule interne, une reformulation de Bungie à la prochaine saison — fait
 * échouer la correspondance SILENCIEUSEMENT. Le lien disparaît alors sans
 * aucun signal, ce qui est très difficile à diagnostiquer depuis l'interface
 * (symptôme observé : « rien ne s'affiche »).
 *
 * MÉTHODE : au lieu d'exiger la phrase exacte, on exige que TOUS les mots
 * SIGNIFICATIFS de la condition soient présents dans un même texte. Les mots
 * outils (articles, prépositions, auxiliaires) sont ignorés car ce sont eux
 * qui varient le plus d'une formulation à l'autre, sans porter de sens. On
 * reste donc sur une VRAIE vérification (tous les mots porteurs doivent être
 * là, dans le même texte — pas éparpillés dans le build), simplement moins
 * cassante. Le principe posé le 25/08 est préservé : les liens conditionnels
 * sont vérifiés, jamais supposés.
 *
 * EN: ⚠️ ADDED (scoring audit pass) - link condition check, ROBUST to small
 * wording variations. FIXED PROBLEM: both call sites did a whole-sentence
 * `includes`, but `conditionnel` fields are MANUAL transcriptions from
 * screenshots - one word off, one comma, or a Bungie rewording next season
 * and the match fails SILENTLY, dropping the link with no signal (observed
 * symptom: "nothing shows up"). METHOD: require all SIGNIFICANT words of the
 * condition to appear within one same text, ignoring function words (which
 * vary most and carry no meaning). Still a REAL check - all meaningful words
 * must be present in the same text - just less brittle.
 * LIMITE CONNUE ET ASSUMÉE : la comparaison reste sensible à la CONJUGAISON
 * (« éliminer » ne matche pas « éliminant »). Vérifié en test : une
 * reformulation complète du type « Un orbe est généré en éliminant des
 * cibles gelées » échoue encore. C'est un compromis délibéré — assouplir
 * jusqu'aux radicaux tronqués rouvrirait la porte aux faux positifs que le
 * travail sur les frontières de mot (25/08) avait justement fermée. Le
 * risque résiduel est faible puisque les champs `conditionnel` sont
 * transcrits DEPUIS les descriptions réelles : ils devraient déjà être dans
 * la bonne conjugaison. Si un lien reste invisible malgré un fragment bien
 * équipé, c'est le premier endroit où regarder.
 *
 * EN: KNOWN, ACCEPTED LIMIT: still sensitive to CONJUGATION ("éliminer"
 * won't match "éliminant"). Deliberate trade-off - loosening to truncated
 * stems would reopen the false-positive door that the 25/08 word-boundary
 * work closed. Low residual risk since `conditionnel` fields are transcribed
 * FROM the real descriptions. First place to look if a link stays invisible
 * despite the fragment being equipped.
 */
const MOTS_OUTILS = new Set([
  "a", "au", "aux", "avec", "ce", "ces", "cette", "d", "dans", "de", "des", "du", "en", "et",
  "est", "il", "l", "la", "le", "les", "leur", "lors", "lorsque", "ou", "par", "pour", "que",
  "qui", "quand", "sa", "se", "ses", "son", "sur", "un", "une", "vos", "votre", "vous", "y",
  "the", "of", "to", "and", "or", "a", "an", "in", "on", "for", "with", "your", "you", "that",
  "this", "these", "is", "are", "when", "while",
]);

function conditionVerifiee(conditionNormalisee: string, textesNormalises: string[]): boolean {
  const motsSignificatifs = conditionNormalisee
    .split(/[^a-z0-9]+/)
    .filter((m) => m.length > 2 && !MOTS_OUTILS.has(m));

  // FR : garde-fou - si la condition ne contient aucun mot significatif
  // (ne devrait pas arriver), on retombe sur la comparaison stricte plutôt
  // que de valider n'importe quoi.
  // EN: guard - if no significant word remains, fall back to the strict
  // comparison rather than validating anything.
  if (motsSignificatifs.length === 0) {
    return textesNormalises.some((t) => t.includes(conditionNormalisee));
  }

  return textesNormalises.some((t) => motsSignificatifs.every((m) => t.includes(m)));
}

/**
 * FR : ⚠️ AJOUT (26/08/2026) - corrige le TROU DE NOTATION identifié le
 * 25/08 et laissé volontairement en attente : un verbe atteint UNIQUEMENT
 * par la chaîne (aucune source textuelle propre - ex : Gel, quand seul
 * Ralentissement est mentionné dans le build) n'était jusqu'ici PAS
 * reconnu comme "sourcé" par `scoreVerbesDetectes`, qui ne regarde que le
 * texte. Concrètement, ça pouvait classer à tort un verbe chaîné en
 * \"payoff_orphelin\" (0 pt, signalé comme un défaut) alors que la chaîne
 * prouve qu'il est bien produit dans ce build précis.
 *
 * Principe : un verbe qui apparaît comme CIBLE d'au moins un maillon
 * confirmé (`maillons`, déjà filtré sur les conditions vérifiées par
 * `detecterChainesVerbes`) est traité comme ayant une source EFFECTIVE,
 * même sans texte qui le mentionne lui-même. `aPayoff`/`aIndetermine`
 * restent des données PUREMENT textuelles (une chaîne ne peut pas prouver
 * qu'un texte en profite) - seule `aSourceEffectif` change, et `confiance`
 * est recalculée avec la même fonction partagée que le calcul initial.
 *
 * ⚠️ Ne modifie PAS `aSource` lui-même (qui reste un fait purement
 * textuel, utilisé ailleurs - ex: `obtenirChampionsCouverts` doit rester
 * fondé sur une vraie source dans la doctrine, pas sur un ricochet de
 * chaîne d'un autre élément). Seule `confiance`, qui alimente le score, est
 * recalculée ici.
 *
 * EN: ⚠️ ADDED - fixes the SCORING GAP identified on 25/08 and deliberately
 * left open: a verb reached ONLY via the chain (no textual source of its
 * own) wasn't recognised as "sourced" by `scoreVerbesDetectes`, which only
 * looks at text - it could be wrongly classified as "payoff_orphelin" (0
 * pts, flagged as a defect) even though the chain proves it's genuinely
 * produced in this build. Does NOT touch `aSource` itself (kept purely
 * textual, used elsewhere) - only `confiance`, which feeds the score, is
 * recomputed here.
 */
export function enrichirAvecChaines(verbesDetectes: VerbeDetecte[], maillons: MaillonChaine[]): VerbeDetecte[] {
  const idsAtteintsParChaine = new Set(maillons.map((m) => m.cible.id));

  return verbesDetectes.map((v) => {
    if (v.aSource || !idsAtteintsParChaine.has(v.verbe.id)) return v; // rien à corriger

    const aSourceEffectif = true;
    const confiance = calculerConfiance(aSourceEffectif, v.aPayoff, v.aIndetermine);
    return { ...v, confiance };
  });
}

/**
 * FR : ⚠️ AJOUT (25/08/2026) - signal SÉPARÉ pour les verbes-ressources
 * (décision du 25/08 : nommé par type, pas un compteur générique noyé
 * dans le score des chaînes). Ne regarde QUE les verbes ayant une vraie
 * source dans le build - mêmes règles que `detecterChainesVerbes`.
 * EN: ⚠️ ADDED - SEPARATE signal for resource verbs, named by type rather
 * than a generic counter folded into the chain score.
 */
/**
 * FR : ⚠️ AJOUT (25/08/2026) - signal SÉPARÉ pour les verbes-ressources
 * (décision du 25/08 : nommé par type, pas un compteur générique noyé
 * dans le score des chaînes).
 *
 * Prend en paramètre les `maillons` déjà calculés par
 * `detecterChainesVerbes` (même appel, pas la peine de refaire le parcours
 * en largeur une seconde fois) : un verbe-ressource ATTEINT par la chaîne
 * (ex : Éclat stasique, produit par la destruction d'un Cristal de Stase)
 * compte aussi, pas seulement les verbes ayant leur propre source dans le
 * texte - même principe du "ricochet" que pour les chaînes elles-mêmes.
 *
 * EN: ⚠️ ADDED - SEPARATE signal for resource verbs. Takes the `maillons`
 * already computed by `detecterChainesVerbes`: a resource verb REACHED by
 * the chain counts too, not just verbs with their own source in the text -
 * same "ricochet" principle as the chains themselves.
 */
/**
 * FR : ⚠️ CHANGÉ (25/08/2026) - accepte désormais `textes` en plus, pour
 * vérifier les conditions (même principe que `detecterChainesVerbes`) : un
 * verbe peut gagner une production de ressource CONDITIONNELLE à un
 * fragment précis (trouvé via l'audit des fragments Solaire — Embrasement
 * et Blessure solaire n'ont normalement aucune ressource propre).
 * EN: ⚠️ CHANGED - now also accepts `textes`, to verify conditions (same
 * principle as `detecterChainesVerbes`): a verb can gain a CONDITIONAL
 * resource production tied to a specific fragment.
 */
export function detecterRessourcesGenerees(
  verbesDetectes: VerbeDetecte[],
  maillons: MaillonChaine[],
  textes: string[]
): { type: string; verbe: VerbeCatalogue }[] {
  const idsAtteints = new Set<string>();
  for (const v of verbesDetectes) {
    if (v.aSource) idsAtteints.add(v.verbe.id);
  }
  for (const m of maillons) {
    idsAtteints.add(m.cible.id);
  }

  const parId = new Map<string, VerbeCatalogue>();
  for (const v of verbesDetectes) parId.set(v.verbe.id, v.verbe);

  const textesNormalises = textes.map(normaliser);
  const resultat: { type: string; verbe: VerbeCatalogue }[] = [];
  for (const id of idsAtteints) {
    const verbe = parId.get(id);
    if (!verbe?.ressourceGeneree) continue;
    for (const entree of verbe.ressourceGeneree) {
      if (entree.conditionnel) {
        // FR : ⚠️ CHANGÉ (26/08/2026) - même correctif que dans
        // `detecterChainesVerbes` ci-dessus, les deux vérifications doivent
        // rester identiques. Voir `conditionVerifiee`.
        // EN: ⚠️ CHANGED - same fix as in `detecterChainesVerbes` above;
        // both checks must stay identical.
        if (!conditionVerifiee(normaliser(entree.conditionnel), textesNormalises)) continue;
      }
      resultat.push({ type: entree.type, verbe });
    }
  }
  return resultat;
}

/**
 * FR : ⚠️ AJOUT (31/08/2026) - DIAGNOSTIC du Pilier 2, ajouté après que le
 * problème des aspects soit remonté une 2e fois malgré un premier correctif
 * (lecture de description via `obtenirDescriptionComplete`, 27/08). Ce
 * correctif reposait sur une HYPOTHÈSE jamais vérifiée sur un vrai Manifest :
 * que les aspects ont une description directe vide. Plutôt que de continuer à
 * deviner à distance, cette fonction expose EXACTEMENT ce que le Pilier 2
 * reçoit et en déduit, pour comparer avec ce que l'écran affiche.
 *
 * Montre, dans l'ordre du pipeline :
 *   1. les hashes réellement présents dans le build (par emplacement) ;
 *   2. pour chacun, ce que donne la lecture DIRECTE vs `obtenirDescriptionComplete`
 *      (c'est LA comparaison qui tranche l'hypothèse ci-dessus) ;
 *   3. les textes finalement transmis à `detecterVerbes` ;
 *   4. le verdict par verbe détecté (confiance), et les chaînes trouvées.
 *
 * EN: ⚠️ ADDED - Pillar 2 DIAGNOSTIC, added after the aspect problem was
 * reported a 2nd time despite a first fix that rested on an UNVERIFIED
 * assumption (that aspects have an empty direct description). Rather than keep
 * guessing remotely, this dumps EXACTLY what Pillar 2 receives and concludes.
 */
export function obtenirDiagnosticPilier2(build: BuildDraft, db: Database): string {
  const lignes: string[] = [];
  const emplacements: { libelle: string; hashes: number[] }[] = [
    { libelle: "Super", hashes: [build.subclass.superHash] },
    { libelle: "Mêlée", hashes: [build.subclass.meleeHash] },
    { libelle: "Grenade", hashes: [build.subclass.grenadeHash] },
    { libelle: "Classe", hashes: [build.subclass.classeHash] },
    { libelle: "Saut", hashes: [build.subclass.sautHash ?? 0] },
    { libelle: "Aspects", hashes: build.subclass.aspectHashes ?? [] },
    { libelle: "Fragments", hashes: build.subclass.fragmentHashes ?? [] },
  ];

  lignes.push("=== 1. CONTENU DU BUILD (hashes stockés) ===");
  for (const { libelle, hashes } of emplacements) {
    const utiles = hashes.filter((h) => h);
    lignes.push(`${libelle} : ${utiles.length === 0 ? "(vide)" : utiles.join(", ")}`);
  }

  lignes.push("");
  lignes.push("=== 2. LECTURE DIRECTE vs obtenirDescriptionComplete ===");
  lignes.push("(si 'directe' est vide et 'complete' non, l'hypothèse du 27/08 est confirmée)");
  for (const { libelle, hashes } of emplacements) {
    for (const hash of hashes.filter((h) => h)) {
      const def = obtenirDefinition<{ displayProperties?: { name?: string; description?: string }; perks?: { perkHash: number }[] }>(
        db,
        "DestinyInventoryItemDefinition",
        hash
      );
      const nom = def?.displayProperties?.name ?? "(nom introuvable)";
      const directe = def?.displayProperties?.description ?? "";
      const complete = obtenirDescriptionComplete(db, hash).description;
      lignes.push(`--- ${libelle} : ${nom} (${hash})`);
      lignes.push(`    perks liés : ${def?.perks?.length ?? 0}`);
      lignes.push(`    directe  (${directe.length} car.) : ${directe.slice(0, 160) || "(VIDE)"}`);
      lignes.push(`    complete (${complete.length} car.) : ${complete.slice(0, 160) || "(VIDE)"}`);
    }
  }

  const textes = extraireTextesEffetsBuild(build, db);
  lignes.push("");
  lignes.push(`=== 3. TEXTES TRANSMIS À detecterVerbes (${textes.length}) ===`);
  textes.forEach((t, i) => lignes.push(`[${i}] ${t.slice(0, 200)}`));

  const verbesDetectes = detecterVerbes(textes);
  const nonAbsents = verbesDetectes.filter((v) => v.confiance !== "absent");
  lignes.push("");
  lignes.push(`=== 4. VERBES DÉTECTÉS (${nonAbsents.length}) ===`);
  if (nonAbsents.length === 0) lignes.push("(aucun — c'est le symptôme à expliquer)");
  for (const v of nonAbsents) {
    lignes.push(`${v.verbe.nomFr} [${v.verbe.id}] : ${v.confiance} (mentions: ${v.nbMentions}, sources: ${v.sources.join(" / ")})`);
  }

  const maillons = detecterChainesVerbes(verbesDetectes, textes);
  lignes.push("");
  lignes.push(`=== 5. CHAÎNES (${maillons.length}) ===`);
  for (const m of maillons) {
    lignes.push(`${m.source.nomFr} -> ${m.cible.nomFr}${m.etaitConditionnel ? " (conditionnel vérifié)" : ""}`);
  }

  return lignes.join("\n");
}

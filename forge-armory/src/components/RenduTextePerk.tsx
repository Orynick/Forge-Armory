// FR : Rendu enrichi des textes de perks d'artefact (nom + description).
//
// Les traductions manuelles fournies par l'utilisateur utilisent deux
// conventions à l'écriture, qu'on restitue visuellement ici :
//   - `[icone X]` → l'icône correspondante (élément, type d'arme, champion) ;
//   - `"mot"` entre guillemets → un VERBE ou terme de jeu assimilé, mis en
//     évidence en CYAN pour préparer le travail à venir sur le Pilier 2 (ces
//     mots seront la matière du graphe de chaînes de verbes).
//
// EN: Enriched rendering of artifact perk texts. Manual translations use two
// conventions rendered visually here: `[icone X]` tokens become the matching
// icon, and "quoted" words are game verbs/terms highlighted in CYAN to
// prepare the upcoming verb-chain graph work on Pillar 2.

import { Fragment, ReactNode } from "react";
import IconeElement from "./icones/IconeElement";
import IconeMunition, { MUNITIONS } from "./icones/IconeMunition";
import IconeAntiChampion, { TypeChampion } from "./icones/IconeAntiChampion";
import IconeTypeArme from "./icones/IconeTypeArme";
import { DamageElement } from "../types/build";
import { CATALOGUE_VERBES } from "../data/elementVerbs";
import { normaliser, positionsMotCleStrict } from "../lib/manifest/search";
import { Database } from "sql.js";
import { obtenirElementArme, obtenirIconeElementDoctrine, obtenirTypeMunition } from "../lib/manifest/doctrine";

/**
 * FR : ⚠️ AJOUT (24/08/2026) - icône d'ÉLÉMENT D'ARME (y compris cinétique),
 * demande de l'utilisateur : « rajoute l'icône de dégâts cinétiques sur
 * toutes les armes cinétiques ». Fonction PARTAGÉE plutôt que dupliquée aux
 * 4 endroits où le nom d'une arme est affiché (SelecteurInventaire,
 * ResumeBuild - carte compacte ET popup Détails chacun) : c'est exactement
 * la duplication qui avait fait diverger les libellés d'élément la veille,
 * à éviter de reproduire.
 * Taille par défaut alignée sur la convention déjà en place pour
 * l'anti-champion sur une ligne de nom (16px).
 * EN: ⚠️ ADDED - WEAPON ELEMENT icon (Kinetic included), user request.
 * SHARED function rather than duplicated across the 4 places a weapon name
 * is shown - exactly the duplication that made element labels diverge the
 * day before. Default size matches the existing anti-champion-on-name-line
 * convention (16px).
 */
export function IconeElementArme({ db, itemHash, taille = 16 }: { db?: Database | null; itemHash: number; taille?: number }) {
  if (!db) return null;
  const element = obtenirElementArme(db, itemHash);
  if (element) {
    return <IconeElement element={element} taille={taille} urlOfficielle={obtenirIconeElementDoctrine(db, element)} />;
  }
  // FR : `null` = arme cinétique (aucun DamageElement) - voir obtenirElementArme.
  return <IconeMunition cle="degats_cinetique" taille={taille} />;
}

/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - icône du TYPE DE MUNITIONS d'une arme
 * (principales, spéciales, lourdes), demande de l'utilisateur : affichée
 * PARTOUT juste à droite de l'icône d'élément. Composant PARTAGÉ, sur le
 * modèle d'`IconeElementArme` juste au-dessus : même source
 * (`obtenirTypeMunition`), mêmes couleurs (`MUNITIONS`), même taille par
 * défaut (16 px) que l'élément, pour des lignes alignées. Rien si le type
 * est inconnu ou sans Manifest.
 * EN: ⚠️ ADDED - weapon AMMO TYPE icon, shown everywhere right of the
 * element icon. SHARED component, same source and colours everywhere.
 */
export function IconeMunitionArme({ db, itemHash, taille = 16 }: { db?: Database | null; itemHash: number; taille?: number }) {
  if (!db) return null;
  const type = obtenirTypeMunition(db, itemHash);
  if (!type) return null;
  return <IconeMunition cle={MUNITIONS[type].cle} taille={taille} couleur={MUNITIONS[type].couleur} />;
}

// FR : couleur des verbes, choisie et vérifiée pour un contraste solide
// (12,1:1) sur le fond de l'appli (#161922), tout en restant nettement
// distincte du blanc du texte normal (#e8e6df) et du bleu déjà utilisé pour
// les accents (#7aa2f7).
// EN: verb colour, checked for strong contrast (12.1:1) against the app's
// background, while staying clearly distinct from normal text and the
// existing accent blue.
export const COULEUR_VERBE = "#67e8f9";

// FR : table de correspondance entre le mot utilisé dans `[icone X]` (tel
// qu'écrit par l'utilisateur, en minuscules) et le composant/props à rendre.
// Volontairement TOLÉRANTE aux variantes ("épée" / "de glaive" / "glaive") :
// mieux vaut reconnaître plusieurs formulations que de rater une icône.
// EN: mapping between the word used in `[icone X]` and the component/props
// to render. Deliberately TOLERANT of wording variants.
const ELEMENTS: Record<string, DamageElement> = {
  solaire: "solaire", solaires: "solaire",
  arc: "arc",
  abyssal: "abyssal", abyssale: "abyssal", abyssales: "abyssal",
  // FR : ⚠️ CORRIGÉ (24/08/2026) - "cryo-électrique" pointait à tort vers
  // "stase". Signalé par l'utilisateur : icônes Filobscur/Stase confondues
  // dans l'artefact, isolé à ce composant (jamais vu ailleurs, confirmé
  // par l'utilisateur). Cause : cette table datait d'AVANT la correction
  // du 04/08 qui a établi que "Cryo-électrique" est le vrai nom FRANÇAIS de
  // l'élément ARC ("Arc" étant l'anglicisme toléré jusqu'ici) - voir
  // `libellesElements.ts`, seule source de vérité sur ce point depuis. Cette
  // table-ci, propre au rendu des jetons `[icone X]` des traductions
  // d'artefact, n'avait jamais été mise à jour en conséquence.
  // Impact réel mesuré : 15 occurrences du jeton dans les 4 artefacts déjà
  // traduits (7 dans Encrypted Data Disk, 2 dans Hunter's Journal, 6 dans
  // NPA Repulsion Regulator) affichaient donc l'icône Stase au lieu de
  // Cryo-électrique (Arc).
  // EN: ⚠️ FIXED - "cryo-électrique" wrongly pointed to "stase". This table,
  // specific to artifact perk `[icone X]` token rendering, predates the
  // 04/08 correction establishing "Cryo-électrique" as the real FRENCH name
  // for the ARC element, and was never updated. Real impact: 15 occurrences
  // across the 4 already-translated artifacts showed the Stasis icon
  // instead of Arc.
  stase: "stase", stasique: "stase", stasiques: "stase",
  filobscur: "filobscur", filobscurs: "filobscur", filobscure: "filobscur", filobscures: "filobscur",
  prismatique: "prismatique",
  "cryo-électrique": "arc", "cryo-électriques": "arc", cryoelectrique: "arc",
};

const CHAMPIONS: Record<string, TypeChampion> = {
  implacable: "implacable", implacables: "implacable",
  bloqueur: "bloqueur", bloqueurs: "bloqueur",
  surchargé: "surcharge", surcharge: "surcharge", surchargés: "surcharge",
};

// FR : mots-clés de type d'arme reconnus dans les crochets, mappés vers le
// texte que `IconeTypeArme` attend (identique aux libellés Manifest).
// EN: weapon-type keywords recognised in brackets, mapped to the text
// `IconeTypeArme` expects.
const ARMES: Record<string, string> = {
  épée: "epee", épées: "epee", "de glaive": "glaive", glaive: "glaive", glaives: "glaive",
  arc: "arc", arcs: "arc",
  "fusil de précision": "fusil de precision", "fusils de précision": "fusil de precision",
  mitrailleuse: "mitrailleuse", mitrailleuses: "mitrailleuse",
  "fusil automatique": "fusil automatique", "fusils automatiques": "fusil automatique",
  // FR : ⚠️ AJOUT (24/08/2026) - 7 types d'armes apparus avec les 3 derniers
  // artefacts traduits (Tablette de la Ruine, Sacoche d'apothicaire,
  // Encensoir). Tous étaient DÉJÀ supportés par IconeTypeArme (les chemins
  // SVG existent), mais absents de CETTE table de correspondance : le jeton
  // `[icone lance-roquettes]` restait donc affiché en texte brut au lieu de
  // devenir une icône. Les identifiants ci-dessous correspondent aux
  // `motCle` de IconeTypeArme, vérifiés un par un.
  // EN: ⚠️ ADDED - 7 weapon types introduced by the 3 newly translated
  // artifacts. All were ALREADY supported by IconeTypeArme, but missing
  // from THIS lookup table, so their tokens rendered as raw text.
  "lance-roquettes": "lance-roquettes",
  "lance-grenade": "lance-grenades", "lance-grenades": "lance-grenades",
  "fusil à pompe": "pompe", "fusils à pompe": "pompe",
  "fusil à fusion": "fusion", "fusils à fusion": "fusion",
  "fusil à fusion linéaire": "fusion lineaire", "fusils à fusion linéaire": "fusion lineaire",
  "fusil à rayon": "rayon", "fusils à rayon": "rayon",
  cinétique: "arme de poing", // FR : "arme [icone cinétique]" désigne le TYPE de dégâts, pas une arme - voir résolution spéciale plus bas.
};

/**
 * FR : convertit UN jeton `[icone quelque chose]` en élément React, ou en
 * texte brut entre crochets si rien ne correspond (mieux vaut afficher le
 * texte source que de le faire disparaître silencieusement).
 * EN: converts ONE `[icone something]` token into a React element, or raw
 * bracketed text if nothing matches (better to show the source text than
 * silently drop it).
 */
function rendreJeton(motCle: string, cle: string): ReactNode {
  const normalise = motCle.trim().toLowerCase();

  // FR : ⚠️ CORRIGÉ (24/08/2026) - taille UNIFORME à 16px (au lieu de
  // 15/15/17 selon le type de jeton) et `verticalAlign: "-3px"` sur les
  // trois cas, demande explicite de l'utilisateur : « vérifie l'alignement
  // des icônes avec les textes ». Un SVG inline a par défaut
  // `vertical-align: baseline`, qui le fait paraître légèrement BAS par
  // rapport au texte qui l'entoure - invisible dans une rangée d'icônes en
  // flex (l'alignement du conteneur prend le dessus), mais visible ici où
  // l'icône est mêlée à du texte qui coule normalement.
  // EN: ⚠️ FIXED - UNIFORM size (was 15/15/17 depending on token type) and
  // vertical alignment on all three cases. An inline SVG defaults to
  // `vertical-align: baseline`, making it look slightly LOW next to
  // surrounding text - invisible in a flex icon row, visible here where the
  // icon sits inside normally-flowing text.
  const styleAlignement = { verticalAlign: "-3px" as const };

  // FR : ⚠️ CHANGÉ (24/08/2026) - remplace le badge textuel "Cin." par la
  // VRAIE icône cinétique (IconeMunition), disponible depuis son intégration
  // le 05/08 - plus de raison de garder un repli textuel maintenant que
  // l'icône officielle existe.
  // EN: ⚠️ CHANGED - replaces the "Cin." text badge with the REAL kinetic
  // icon, available since its integration - no reason to keep a text
  // fallback now the official icon exists.
  if (normalise === "cinétique" || normalise === "cinétiques") {
    return <IconeMunition key={cle} cle="degats_cinetique" taille={16} />;
  }

  if (ELEMENTS[normalise]) {
    return (
      <span key={cle} style={styleAlignement}>
        <IconeElement element={ELEMENTS[normalise]} taille={16} />
      </span>
    );
  }
  if (CHAMPIONS[normalise]) {
    return (
      <span key={cle} style={styleAlignement}>
        <IconeAntiChampion type={CHAMPIONS[normalise]} taille={16} />
      </span>
    );
  }
  if (ARMES[normalise]) {
    return (
      <span key={cle} style={styleAlignement}>
        <IconeTypeArme typeArme={ARMES[normalise]} taille={16} />
      </span>
    );
  }

  // FR : rien reconnu - on affiche le texte source plutôt que de le perdre.
  return (
    <span key={cle} style={{ fontSize: "0.7rem", color: "#7d7a70" }}>
      [{motCle}]
    </span>
  );
}

/**
 * FR : ⚠️ AJOUT (24/08/2026) - surligne en CYAN tout mot-clé du catalogue de
 * verbes (`CATALOGUE_VERBES`, le même que celui utilisé par le Pilier 2)
 * trouvé dans un texte QUELCONQUE - aspects, fragments, perks d'armes,
 * descriptions d'armure exotique, etc. Demande de l'utilisateur : « si tu
 * vois d'autres Verbes ailleurs, affiche les en cyan aussi ».
 *
 * ⚠️ DIFFÉRENT de `rendreTextePerk` : celui-ci repère les mots entre
 * GUILLEMETS, une convention propre aux traductions manuelles d'artefact
 * écrites par l'utilisateur. Le Manifest (aspects/fragments/perks d'armes)
 * ne contient PAS cette convention - il faut donc reconnaître les verbes par
 * leur PRÉSENCE (les mêmes mots-clés que la détection du Pilier 2), pas par
 * une ponctuation. Réutiliser le catalogue existant garantit que ce qui est
 * surligné à l'écran correspond exactement à ce que le score détecte -
 * deux mécanismes indépendants auraient fini par diverger, comme c'est
 * arrivé plusieurs fois cette session sur d'autres calculs.
 *
 * Recherche insensible à la casse et aux accents (les mots-clés du
 * catalogue sont stockés sans accent), mais le texte affiché reste
 * l'ORIGINAL - seule la correspondance est normalisée.
 *
 * EN: ⚠️ ADDED - highlights in CYAN any keyword from the verb catalogue (the
 * SAME one Pillar 2 uses) found in ANY text - aspects, fragments, weapon
 * perks, exotic armor descriptions. DIFFERENT from `rendreTextePerk`, which
 * looks for QUOTED words, a convention specific to the user's manual
 * artifact translations. Manifest text doesn't use that convention, so verbs
 * must be recognised by PRESENCE (the same keywords Pillar 2 uses), not
 * punctuation. Reusing the existing catalogue guarantees on-screen
 * highlighting matches exactly what the score detects.
 */
export function surlignerVerbesConnus(texte: string): ReactNode {
  if (!texte) return texte;

  // FR : construit UNE FOIS la liste des mots-clés (accent conservé dans le
  // texte source, mais on compare une version normalisée pour trouver la
  // position) - la normalisation NFD ne change pas la longueur en
  // caractères de base assez souvent pour rester praticable ici, et un léger
  // décalage resterait sans conséquence visuelle (on met en cyan quelques
  // caractères de trop/moins, jamais un mot totalement différent).
  const tousLesMotsCles = CATALOGUE_VERBES.flatMap((v) => [...v.motsClesFr, ...v.motsClesEn])
    .filter((m) => m.length >= 4) // FR : évite de surligner des racines trop courtes/fréquentes
    .sort((a, b) => b.length - a.length); // FR : les plus longs d'abord, pour ne pas couper un mot-clé plus spécifique

  const normalise = normaliser(texte);
  const zones: { debut: number; fin: number }[] = [];
  for (const mot of tousLesMotsCles) {
    let position = normalise.indexOf(mot);
    while (position !== -1) {
      // FR : ⚠️ CORRIGÉ (24/08/2026) - LE VRAI défaut trouvé par
      // l'utilisateur : "suspendues" ne montrait en cyan que "suspend" (le
      // mot-clé, 7 lettres), pas le mot ENTIER (10 lettres). Ajouter des
      // mots-clés plus longs ne suffisait pas - la zone colorée était
      // bornée à `mot.length`, point final, quelle que soit la longueur
      // réelle du mot dans le texte source. On étend maintenant la fin de
      // la zone jusqu'à la fin du mot complet (le premier caractère qui
      // n'est plus une lettre), pour que "suspendues" se colore en entier
      // même si le mot-clé qui l'a détecté ("suspend") est plus court.
      // EN: ⚠️ FIXED - the REAL flaw the user found: "suspendues" only
      // showed "suspend" (the keyword, 7 letters) in cyan, not the WHOLE
      // word (10 letters). Adding longer keywords wasn't enough - the
      // highlighted zone was capped at `mot.length`, period. Now extends
      // the zone's end to the end of the actual word (first non-letter
      // character), regardless of how short the matching keyword was.
      let fin = position + mot.length;
      while (fin < normalise.length && /[a-zà-ÿ']/i.test(normalise[fin])) fin++;

      const chevauche = zones.some((z) => position < z.fin && fin > z.debut);
      if (!chevauche) zones.push({ debut: position, fin });
      position = normalise.indexOf(mot, position + 1);
    }
  }

  // FR : ⚠️ AJOUT (25/08/2026) - mots-clés STRICTS (frontière de mot), pour
  // les mêmes raisons que dans la détection de verbes : "cure" ne doit pas
  // surligner l'intérieur de "filobscure". Même extension jusqu'à la fin du
  // mot réel que ci-dessus, une fois la position de départ trouvée.
  // EN: ⚠️ ADDED - STRICT (word-boundary) keywords, same reasoning as verb
  // detection.
  const tousLesMotsClesStricts = CATALOGUE_VERBES.flatMap((v) => [
    ...(v.motsClesStrictsFr ?? []),
    ...(v.motsClesStrictsEn ?? []),
  ]);
  for (const mot of tousLesMotsClesStricts) {
    const motNormalise = normaliser(mot);
    for (const position of positionsMotCleStrict(normalise, motNormalise)) {
      let fin = position + motNormalise.length;
      while (fin < normalise.length && /[a-zà-ÿ']/i.test(normalise[fin])) fin++;
      const chevauche = zones.some((z) => position < z.fin && fin > z.debut);
      if (!chevauche) zones.push({ debut: position, fin });
    }
  }
  if (zones.length === 0) return texte;

  zones.sort((a, b) => a.debut - b.debut);
  const morceaux: ReactNode[] = [];
  let curseur = 0;
  zones.forEach((z, i) => {
    if (z.debut > curseur) morceaux.push(texte.slice(curseur, z.debut));
    morceaux.push(
      <span key={i} style={{ color: COULEUR_VERBE }}>
        {texte.slice(z.debut, z.fin)}
      </span>
    );
    curseur = z.fin;
  });
  if (curseur < texte.length) morceaux.push(texte.slice(curseur));
  return <>{morceaux}</>;
}

/**
 * FR : rend un texte de perk d'ARTEFACT (nom OU description) en React, en
 * résolvant les jetons `[icone X]` en icônes et en colorant les mots entre
 * guillemets. Spécifique à la convention utilisée par l'utilisateur dans ses
 * traductions manuelles d'artefact - voir `surlignerVerbesConnus` juste
 * au-dessus pour le surlignage par mots-clés connus, utilisé partout ailleurs
 * (texte issu du Manifest : aspects, fragments, perks d'armes, armures).
 * EN: renders an ARTIFACT perk text, resolving `[icone X]` tokens and
 * colouring quoted words - specific to the user's manual translation
 * convention. See `surlignerVerbesConnus` above for keyword-based
 * highlighting used everywhere else (Manifest-sourced text).
 */
export function rendreTextePerk(texte: string): ReactNode {
  const motif = /(\[icone [^\]]+\]|"[^"]+"|«[^»]+»)/g;
  const morceaux = texte.split(motif).filter((m) => m !== "");

  return (
    <>
      {morceaux.map((morceau, i) => {
        const jeton = morceau.match(/^\[icone ([^\]]+)\]$/i);
        if (jeton) return <Fragment key={i}>{rendreJeton(jeton[1], `j${i}`)}</Fragment>;

        const guillemets = morceau.match(/^["«]([^"»]+)["»]$/);
        if (guillemets) {
          return (
            <span key={i} style={{ color: COULEUR_VERBE }}>
              {guillemets[1]}
            </span>
          );
        }

        return <Fragment key={i}>{morceau}</Fragment>;
      })}
    </>
  );
}

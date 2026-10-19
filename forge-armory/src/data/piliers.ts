// FR : SOURCE UNIQUE de l'ordre d'affichage et des libellés des 5 piliers
// de scoring.
//
// ⚠️ CRÉÉ (06/09/2026) pendant la réorganisation demandée le 26/08. Avant
// ça, les libellés étaient déclarés à TROIS endroits séparés
// (`PilierCarte.tsx`, `BlocContexte.tsx`, plus l'ordre implicite du tableau
// `piliers` dans `pillars.ts`), chacun avec sa propre copie — exactement le
// motif de désynchronisation qui a déjà causé plusieurs bugs sur ce projet
// (résumé anti-champion vs Pilier 4, sets réels vs DEMO_SETS, et surtout
// l'affichage vs le scoring du Pilier 2, qui ont divergé silencieusement
// pendant 3 semaines en août).
//
// Le TODO du 26/08 ne mentionnait que deux de ces trois endroits ; le
// troisième (`PilierCarte.tsx`) n'a été trouvé qu'en faisant la recherche
// de vérification recommandée dans ce même TODO. D'où ce fichier : au lieu
// de corriger trois copies, il n'y en a plus qu'une.
//
// EN: SINGLE SOURCE for the display order and labels of the 5 scoring
// pillars. Created during the reorganisation requested on 26/08. Before
// this, labels were declared in THREE separate places, each with its own
// copy - exactly the divergence pattern that has already caused several
// bugs in this project. A third location was only found by running the
// verification search the TODO itself recommended. Hence this file: rather
// than fixing three copies, there is now only one.

import { PillarScore } from "../types/build";

type ClePilier = PillarScore["pilier"];

/**
 * FR : ordre d'affichage des piliers, RÉORGANISÉ le 06/09/2026 à la demande
 * de l'utilisateur. Les identifiants internes (`ClePilier`) n'ont PAS
 * changé — seuls l'ordre et les libellés visibles. Les pondérations non
 * plus ne changent pas (voir `POIDS_PILIERS` dans `pillars.ts`).
 *
 * Changement par rapport à l'ordre précédent : Artefact et Armes/Armures
 * remontent chacun d'un cran, Effets du Build (ex-« Verbes d'Élément »)
 * redescend en avant-dernier. Élément et Doctrine reste en tête.
 *
 * EN: pillar display order, REORGANISED on 06/09/2026 at the user's
 * request. Internal identifiers are UNCHANGED - only order and visible
 * labels. Weights are unchanged too.
 */
export const ORDRE_PILIERS: ClePilier[] = [
  "element_doctrine",
  "loot_coherence",
  "perks_artefact",
  "verbes_element",
  "stats_2_0",
];

/**
 * FR : ⚠️ RÉORDONNÉ ET RENOMMÉ le 08/10/2026, demande de l'utilisateur : pour SUIVRE L'ORDRE DES BLOCS au-dessus du Scoring (Classe et Doctrine, puis Mon Build avec les armes et armures, puis l'Artefact), l'ordre devient
 * Doctrine élémentaire (1), Armes et Armures (2), Artefact (3), Effets du Build (4), Statistiques (5) ; le pilier 1 s'appelle « Doctrine élémentaire » (avant : « Élément et Doctrine »). Les identifiants internes (`ClePilier`) et les
 * pondérations ne changent pas ; les LOGOS de chaque carte restent ceux de chaque pilier, seuls le chiffre et la position changent (titres illustrés recomposés : `scripts/retoucher-visuels.mjs`, étape 4).
 *
 * ⚠️ NE PAS CONFONDRE avec l'ANCIENNE numérotation « Pilier N » encore employée dans les COMMENTAIRES du code, NOTES-CONCEPTION.md (ex-README), la base de connaissances et la TODO (écrite avant le 06/09/2026 et jamais renumérotée) :
 *     ancien Pilier 1 = Élément et Doctrine (`element_doctrine`) · ancien Pilier 2 = Verbes d'Élément (`verbes_element`, aujourd'hui « 4. Effets du Build ») · ancien Pilier 3 = Perks d'Artefact (`perks_artefact`)
 *     ancien Pilier 4 = Loot et cohérence (`loot_coherence`) · ancien Pilier 5 = Statistiques (`stats_2_0`).
 * Ces documents n'ont PAS été renumérotés (ils parlent de l'ancien numéro, qui reste exact pour eux) ; en cas de doute, se fier à la clé interne, pas au numéro.
 *
 * FR : libellés affichés. Renommages du 06/09/2026 :
 *   - « Perks d'Artefact »   → « Artefact »
 *   - « Loot & Cohérence »   → « Armes et Armures »
 *   - « Verbes d'Élément »   → « Effets du Build »
 *   - « Statistiques 2.0 »   → « Statistiques »
 * Les numéros font partie du libellé et suivent `ORDRE_PILIERS` ci-dessus —
 * ils sont donc à renuméroter si l'ordre change à nouveau.
 * EN: displayed labels. The numbers are part of the label and follow
 * `ORDRE_PILIERS` above, so they must be renumbered if the order changes.
 */
export const LIBELLES_PILIER: Record<ClePilier, string> = {
  element_doctrine: "1. Doctrine élémentaire",
  loot_coherence: "2. Armes et Armures",
  perks_artefact: "3. Artefact",
  verbes_element: "4. Effets du Build",
  stats_2_0: "5. Statistiques",
};

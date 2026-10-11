// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - VERSION DE DESTINY 2 PRISE EN COMPTE par les données et les règles de
// l'appli, et NIVEAU DES CORRECTIFS, affichés tout en haut à droite du titre (demandes de l'utilisateur : « préciser la
// version de Destiny 2 prise en compte et la date du patch », puis « niveau des correctifs, s'il te plaît »).
// SOURCE UNIQUE : c'est ici, et seulement ici, qu'on les met à jour.
//
// Ce n'est PAS « la dernière version du jeu » mais celle sur laquelle l'appli est alignée : la knowledge-base
// (`knowledge-base/27_PATCHNOTES/`) ne contient que la fiche de la 9.7.0, et c'est elle qui fonde les règles
// (Armor 3.0, Monument of Triumph, anti-champion, etc.).
//
// `correctifs` : les correctifs que Bungie a publiés APRÈS la version de base, dans l'ordre, chacun marqué intégré ou non.
// « Intégré » veut dire : sa fiche est dans `27_PATCHNOTES` ET ses effets sont reportés dans l'appli. Les correctifs sont
// cumulatifs : le NIVEAU intégré est le dernier d'une série ininterrompue de correctifs intégrés depuis le début (un
// correctif marqué intégré après un correctif non intégré ne relève pas le niveau).
// RÈGLE DE MAINTENANCE : à chaque correctif intégré, passer son `integre` à `true` ; à chaque nouveau correctif publié par
// Bungie, l'ajouter à la fin avec `integre: false` ; pour une nouvelle version majeure, changer `numero`, `nom`, `datePatch`
// et repartir d'une liste de correctifs vide. Dates relevées le 05/10/2026 : 9.7.0.4 sur la page d'état officielle de Bungie
// (28 juillet 2026) ; 9.7.0.2 et 9.7.0.3 d'après un site de suivi.
// ⚠️ MIS À JOUR le 07/10/2026 : (1) la 9.7.0.5 a été publiée le 7 octobre 2026 (texte français collé par l'utilisateur, recoupé avec un site de
// suivi, MP1st ; lien officiel EN reçu de l'utilisateur, mais sa page est illisible par mes outils) : c'est un correctif anti-triche côté serveur, SANS effet sur les données ni les règles de
// l'appli ; sa fiche est la première de `27_PATCHNOTES` : elle est donc marquée INTÉGRÉE, ce qui ne relève PAS le niveau affiché, puisque les
// correctifs sont cumulatifs et que la 9.7.0.1 à la 9.7.0.4 n'ont pas encore de fiche. (2) La date de la 9.7.0.1 (16 juin 2026) a été retrouvée,
// d'après le même site de suivi (source non officielle). Liste non garantie complète : aucun correctif plus récent que la 9.7.0.5 n'a été trouvé.
// EN: ⚠️ ADDED - the Destiny 2 VERSION the app is aligned with and the HOTFIX LEVEL, shown at the top right of the title.
// SINGLE SOURCE. Hotfixes are cumulative: the integrated LEVEL is the last of an unbroken run of integrated hotfixes.

export interface Correctif {
  numero: string;
  /** FR : date de publication AAAA-MM-JJ, si elle est connue. / EN: release date YYYY-MM-DD, if known. */
  date?: string;
  /** FR : sa fiche est dans 27_PATCHNOTES et ses effets sont reportés dans l'appli. / EN: its sheet is in 27_PATCHNOTES and its effects are applied in the app. */
  integre: boolean;
}

export const VERSION_JEU: { numero: string; nom: string; datePatch: string; correctifs: readonly Correctif[] } = {
  numero: "9.7.0",
  nom: "Monument of Triumph",
  datePatch: "2026-06-09",
  correctifs: [
    { numero: "9.7.0.1", date: "2026-06-16", integre: false },
    { numero: "9.7.0.2", date: "2026-06-23", integre: false },
    { numero: "9.7.0.3", date: "2026-07-07", integre: false },
    { numero: "9.7.0.4", date: "2026-07-28", integre: false },
    { numero: "9.7.0.5", date: "2026-10-07", integre: true },
  ],
};

/** FR : « 2026-06-09 » -> « 9 juin 2026 » (fuseau UTC : la date ne bouge pas selon le fuseau de l'ordinateur). / EN: ISO date to French long date, in UTC. */
export function formaterDatePatch(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export interface NiveauCorrectifs {
  /** FR : dernier correctif d'une série ininterrompue d'intégrés depuis le début ; absent si aucun. / EN: last of the unbroken integrated run; absent if none. */
  dernierIntegre?: Correctif;
  /** FR : dernier correctif publié connu, intégré ou non ; absent s'il n'y en a aucun. / EN: last known published hotfix. */
  dernierPublie?: Correctif;
  /** FR : correctifs publiés pas encore pris en compte (tout ce qui suit le niveau intégré). / EN: published hotfixes not yet taken into account. */
  nonIntegres: Correctif[];
  /** FR : vrai s'il n'y a aucun correctif en attente (y compris quand il n'y en a aucun du tout). / EN: true when nothing is pending. */
  aJour: boolean;
}

/** FR : calcule le niveau des correctifs à partir de la liste. / EN: computes the hotfix level from the list. */
export function niveauCorrectifs(correctifs: readonly Correctif[] = VERSION_JEU.correctifs): NiveauCorrectifs {
  let rang = 0;
  while (rang < correctifs.length && correctifs[rang].integre) rang += 1;
  const nonIntegres = correctifs.slice(rang);
  return {
    dernierIntegre: rang > 0 ? correctifs[rang - 1] : undefined,
    dernierPublie: correctifs.length > 0 ? correctifs[correctifs.length - 1] : undefined,
    nonIntegres,
    aJour: nonIntegres.length === 0,
  };
}

/** FR : numéro de version réellement pris en compte : celui du dernier correctif intégré, sinon celui de la version de base. / EN: version actually taken into account. */
export function versionEffective(correctifs: readonly Correctif[] = VERSION_JEU.correctifs, base: string = VERSION_JEU.numero): string {
  return niveauCorrectifs(correctifs).dernierIntegre?.numero ?? base;
}

const avecDate = (c: Correctif) => (c.date ? `${c.numero} (${formaterDatePatch(c.date)})` : c.numero);

/**
 * FR : troisième ligne de l'affichage : le niveau des correctifs. `null` s'il n'y a aucun correctif connu (rien à dire).
 * Trois cas : aucun intégré ; intégrés en partie ; tout intégré.
 * EN: third display line: the hotfix level; null when no hotfix is known.
 */
export function libelleCorrectifs(correctifs: readonly Correctif[] = VERSION_JEU.correctifs): string | null {
  if (correctifs.length === 0) return null;
  const n = niveauCorrectifs(correctifs);
  if (n.aJour) return `Correctifs intégrés jusqu'à ${n.dernierIntegre!.numero}`;
  const dernier = `dernier publié : ${avecDate(n.dernierPublie!)}`;
  return n.dernierIntegre ? `Correctifs intégrés jusqu'à ${n.dernierIntegre.numero} · ${dernier}` : `Correctifs : aucun intégré · ${dernier}`;
}

/** FR : texte de l'infobulle de l'affichage. / EN: tooltip text. */
export function infobulleVersionJeu(correctifs: readonly Correctif[] = VERSION_JEU.correctifs): string {
  const n = niveauCorrectifs(correctifs);
  const base = `Version de Destiny 2 prise en compte par les données et les règles de l'appli : ${VERSION_JEU.numero} (${VERSION_JEU.nom}), patch du ${formaterDatePatch(VERSION_JEU.datePatch)}.`;
  if (correctifs.length === 0) return base;
  const publies = correctifs.map((c) => `${c.numero}${c.integre ? " (intégré)" : ""}`).join(", ");
  // FR : ⚠️ CORRIGÉ (07/10/2026) - `nonIntegres` contient TOUT ce qui suit le niveau intégré, y compris un correctif déjà marqué intégré mais placé APRÈS un correctif manquant (les correctifs sont cumulatifs : le niveau ne bouge pas). Les deux cas sont maintenant distingués :
  // sans cela, l'infobulle aurait écrit à la fois « 9.7.0.5 (intégré) » et « Pas encore intégrés : … 9.7.0.5 ».
  // EN: ⚠️ FIXED - an integrated hotfix placed after a missing one is no longer listed as "not yet integrated".
  const manquants = n.nonIntegres.filter((c) => !c.integre);
  const horsSerie = n.nonIntegres.filter((c) => c.integre);
  const attente = n.aJour
    ? "Tous les correctifs connus sont intégrés."
    : `Pas encore intégrés : ${manquants.map((c) => c.numero).join(", ")}. Leurs effets ne sont pas encore reportés dans les règles de l'appli.` +
      (horsSerie.length > 0 ? `\nDéjà intégré${horsSerie.length > 1 ? "s" : ""}, mais après un correctif manquant (le niveau affiché ne change pas, les correctifs étant cumulatifs) : ${horsSerie.map((c) => c.numero).join(", ")}.` : "");
  return `${base}\n\nCorrectifs publiés depuis : ${publies}.\n${attente}`;
}

// FR : ⚠️ CHANGÉ (24/08/2026) - remplace le badge textuel (lettre + couleur)
// par les 4 vraies icônes fournies par l'utilisateur, découpées d'une image
// unique (public/icones-contexte/*.png). La raison d'être du badge textuel
// ("pas d'icône dédiée pour ces 4 concepts") ne tient plus : ces icônes
// existent maintenant.
// Fichiers PNG plutôt que SVG : contrairement à toutes les autres icônes de
// l'appli (dessinées en SVG ou converties depuis des SVG), celles-ci
// viennent d'une image raster fournie par l'utilisateur — pas de chemin
// vectoriel à extraire, on les sert telles quelles.
//
// EN: ⚠️ CHANGED - replaces the text badge with the 4 real icons the user
// provided, cropped from a single source image. Served as PNG files rather
// than SVG since they come from a raster image, not vector paths.

import { ContexteBuild } from "../../lib/scoring/stats";

/**
 * FR : ⚠️ EXPORTÉ (24/08/2026, passe de débogage) - les libellés de contexte
 * étaient dupliqués à TROIS endroits (BlocContexte.tsx, DashboardPage.tsx et
 * ici), exactement le même piège que les libellés d'élément qui avaient fini
 * par diverger. Source unique désormais : les deux sélecteurs importent
 * d'ici plutôt que de redéclarer leur propre liste.
 * EN: ⚠️ EXPORTED (debug pass) - context labels were duplicated in THREE
 * places, the same trap as the element labels that had diverged. Single
 * source now.
 */
export const LIBELLES_CONTEXTE: Record<ContexteBuild, string> = {
  neutre: "Neutre",
  roaming: "PvE Roaming",
  dps: "PvE DPS",
  pvp: "PvP",
};

/** FR : ordre d'affichage des contextes, partagé par les deux sélecteurs. / EN: display order, shared by both selectors. */
export const ORDRE_CONTEXTES: ContexteBuild[] = ["neutre", "roaming", "dps", "pvp"];

// FR : ⚠️ CORRIGÉ (26/09/2026) - les chemins étaient ABSOLUS
// ("/icones-contexte/neutre.png"). Ça fonctionnait tant que l'appli était
// servie à la racine d'une adresse web, mais plus dans le LOGICIEL
// INSTALLÉ : l'appli y est chargée depuis une adresse interne, où un
// chemin commençant par « / » pointe à côté — les badges de contexte
// s'affichaient donc cassés. Régression introduite par le passage à
// `base: "./"` (nécessaire au logiciel), signalée par l'utilisateur.
//
// Corrigé avec `import.meta.env.BASE_URL`, la variable prévue par Vite pour
// exactement ce cas : elle vaut "/" pour la version navigateur et "./" pour
// le logiciel, donc le même code produit le bon chemin dans les DEUX cas.
// Les images restent dans `public/` et ne sont pas dupliquées dans le
// résultat de compilation (ce qu'aurait fait un `new URL(...)`, qui aurait
// marché aussi mais en recopiant chaque image une seconde fois).
//
// EN: ⚠️ FIXED - paths were ABSOLUTE, which broke in the INSTALLED app
// (loaded from an internal address where a leading "/" points elsewhere).
// Regression from the `base: "./"` switch needed for the desktop build.
// Fixed with `import.meta.env.BASE_URL`, Vite's variable for this exact
// case: "/" in the browser build, "./" in the desktop one, so one code path
// works for both - and the images stay in `public/` without being
// duplicated into the build output.
const adresseIcone = (nom: string) => `${import.meta.env.BASE_URL}icones-contexte/${nom}.png`;

const ICONES: Record<ContexteBuild, { fichier: string; libelle: string }> = {
  neutre: { fichier: adresseIcone("neutre"), libelle: LIBELLES_CONTEXTE.neutre },
  roaming: { fichier: adresseIcone("roaming"), libelle: LIBELLES_CONTEXTE.roaming },
  dps: { fichier: adresseIcone("dps"), libelle: LIBELLES_CONTEXTE.dps },
  pvp: { fichier: adresseIcone("pvp"), libelle: LIBELLES_CONTEXTE.pvp },
};

interface Props {
  contexte: ContexteBuild;
  taille?: number;
}

export default function BadgeContexte({ contexte, taille = 19 }: Props) {
  const icone = ICONES[contexte];
  return (
    <img
      src={icone.fichier}
      alt={icone.libelle}
      title={`Contexte : ${icone.libelle}`}
      width={taille}
      height={taille}
      style={{ flexShrink: 0, cursor: "help", verticalAlign: "-3px" }}
    />
  );
}

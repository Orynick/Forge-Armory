// FR : ⚠️ AJOUT (06/11/2026, spec draft-netlify) - identification du PROPRIÉTAIRE
// de l'application (Orynick) : le bouton des outils de diagnostic ne doit être
// visible QUE lorsque c'est SON compte Bungie qui est connecté - que ce soit sur
// le site web (Netlify) ou dans l'appli installée. Comparaison avec le
// `membership_id` Bungie.net des jetons OAuth (identifiant numérique unique et
// stable du compte). La constante est vide pour l'instant : à renseigner avec
// l'ID lu en mode développement (affiché dans le pied de page).
// EN: owner identification - the diagnostic-tools switch is only visible when
// the owner's Bungie account is signed in (website and installed app alike).

import { lireTokens } from "./bungie/oauth";

// FR : ID du compte Bungie.net du propriétaire (chiffres). Vide = personne
// n'est reconnu propriétaire (l'interrupteur est alors masqué hors dev).
// EN: owner's Bungie.net account ID. Empty = nobody is the owner.
export const ID_COMPTE_BUNGIE_PROPRIETAIRE = "6082040";

/** FR : le compte connecté est-il celui du propriétaire ? Faux si personne n'est connecté ou si la constante est vide. / EN: is the signed-in account the owner's? */
export function estProprietaire(): boolean {
  if (!ID_COMPTE_BUNGIE_PROPRIETAIRE) return false;
  const tokens = lireTokens();
  return tokens?.membership_id === ID_COMPTE_BUNGIE_PROPRIETAIRE;
}

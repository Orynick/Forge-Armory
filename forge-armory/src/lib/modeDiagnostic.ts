// FR : ⚠️ AJOUT (06/10/2026, v0.3.2) - MODE DIAGNOSTIC activable aussi dans l'appli INSTALLÉE. Constat du 06/10/2026 : l'utilisateur teste en `npm run dev` ET dans l'appli installée ; en `run dev`
// il exécutait une ancienne version (pas de catégorie « Objets factices », ni de ligne `[dev]`, ni de panneau de départage), si bien que les outils de diagnostic, réservés à `import.meta.env.DEV`,
// ne montraient rien. Le mode se règle désormais depuis le PIED DE PAGE de l'appli (lien discret) et se mémorise dans le navigateur ; en `run dev` il est toujours actif.
// Ne concerne QUE les outils de diagnostic actifs (contrôle des icônes d'artefact, contrôle des exotiques, ligne `[dev]` de la Recherche, mesure de la ligne d'éléments de la Doctrine) ;
// les autres outils archivés restent réservés à `run dev`. Les fonctions pures sont testées à part.
// EN: ⚠️ ADDED - DIAGNOSTIC MODE that can also be switched on in the INSTALLED app, via a discreet footer link; always on in `run dev`. Only the currently active diagnostic tools use it.

import { useEffect, useState } from "react";

export const CLE_MODE_DIAGNOSTIC = "d2ba.modeDiagnostic";
const EVENEMENT = "d2ba:mode-diagnostic";

/** FR : le mode diagnostic est-il actif ? Toujours en développement ; sinon selon le réglage mémorisé. Jamais d'erreur si le stockage est indisponible. / EN: is diagnostic mode on? */
export function modeDiagnosticActif(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return window.localStorage.getItem(CLE_MODE_DIAGNOSTIC) === "1";
  } catch {
    return false;
  }
}

/** FR : active ou désactive le mode (mémorisé) et prévient les composants affichés. Sans effet en développement (toujours actif). / EN: switches the mode (remembered) and notifies mounted components. */
export function definirModeDiagnostic(actif: boolean): void {
  try {
    if (actif) window.localStorage.setItem(CLE_MODE_DIAGNOSTIC, "1");
    else window.localStorage.removeItem(CLE_MODE_DIAGNOSTIC);
  } catch {
    /* stockage indisponible : le réglage ne sera pas mémorisé */
  }
  window.dispatchEvent(new Event(EVENEMENT));
}

/** FR : valeur du mode, tenue à jour quand il change (ici ou dans un autre onglet). / EN: the mode's value, kept up to date. */
export function useModeDiagnostic(): boolean {
  const [actif, setActif] = useState<boolean>(modeDiagnosticActif);
  useEffect(() => {
    const maj = () => setActif(modeDiagnosticActif());
    window.addEventListener(EVENEMENT, maj);
    window.addEventListener("storage", maj);
    maj();
    return () => {
      window.removeEventListener(EVENEMENT, maj);
      window.removeEventListener("storage", maj);
    };
  }, []);
  return actif;
}

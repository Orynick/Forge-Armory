// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - MAGASIN PARTAGÉ des simulations de la Forge : une seule source, lue par la vue Inventaire de la Forge (qui les modifie) ET par la page principale (qui les applique au score et à Mon Build). Sans lui, chaque composant aurait sa propre copie et le score ne changerait pas quand on simule une perk : c'est ce qui rend la mise à jour « en temps réel » (critère 7 de la spécification).
// Initialisé paresseusement depuis le stockage du navigateur (`simulation.ts`), enregistré à chaque modification ; React s'y abonne par `useSyncExternalStore`. Les fonctions de ce fichier sont testables : `creerMagasin(stockage)` fabrique un magasin indépendant (les tests n'utilisent jamais le magasin global). EN: ⚠️ ADDED - shared store of the Forge simulations: the inventory view edits it, the main page applies it to the score; subscribers are notified on every change.
import { useSyncExternalStore } from "react";
import { ecrireSimulations, lireSimulations, stockageNavigateur, Simulations, Stockage } from "./simulation";

export interface Magasin {
  lire: () => Simulations;
  /** FR : applique une transformation, l'enregistre et prévient les abonnés ; ne fait rien (et ne prévient personne) si elle rend le MÊME objet. / EN: applies a transformation, persists it, notifies subscribers; no-op if it returns the same object. */
  mettreAJour: (transformation: (s: Simulations) => Simulations) => void;
  abonner: (rappel: () => void) => () => void;
}

export function creerMagasin(fournirStockage: () => Stockage = stockageNavigateur): Magasin {
  let stockage: Stockage | null = null;
  let etat: Simulations | null = null;
  const abonnes = new Set<() => void>();
  const initialiser = () => { if (etat === null) { stockage = fournirStockage(); etat = lireSimulations(stockage); } };
  return {
    lire: () => { initialiser(); return etat!; },
    mettreAJour: (transformation) => {
      initialiser();
      const nouveau = transformation(etat!);
      if (nouveau === etat) return;
      etat = nouveau; ecrireSimulations(stockage!, nouveau);
      abonnes.forEach((a) => a());
    },
    abonner: (rappel) => { abonnes.add(rappel); return () => void abonnes.delete(rappel); },
  };
}

const magasinGlobal = creerMagasin();
export const mettreAJourSimulations = magasinGlobal.mettreAJour;
export const lireSimulationsCourantes = magasinGlobal.lire;
/** FR : les simulations courantes, qui font rafraîchir le composant à chaque changement. / EN: current simulations; re-renders the component on every change. */
export function useSimulations(): Simulations {
  return useSyncExternalStore(magasinGlobal.abonner, magasinGlobal.lire, magasinGlobal.lire);
}

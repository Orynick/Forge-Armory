// FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - amène un élément de la page À L'ÉCRAN (haut de la fenêtre). Servi d'abord au retour sur le Build Analyzer après « Charger » dans l'onglet « Load-outs » : l'utilisateur voit
// aussitôt le bloc « Mon Build » avec le build chargé, au lieu de se retrouver en haut d'une longue page en croyant à un bug (demande du 07/10/2026). Défilement DOUX, sauf si le système demande de réduire les animations
// (`prefers-reduced-motion`) : alors le saut est immédiat. Ne fait rien, et le dit (`false`), si l'élément n'existe pas.
// EN: ⚠️ ADDED - scrolls an element into view (smooth unless the user prefers reduced motion). Returns false if there is no element.
export function defilerVers(element: HTMLElement | null): boolean {
  if (!element) return false;
  const reduit = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" });
  return true;
}

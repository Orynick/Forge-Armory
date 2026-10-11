// FR : ⚠️ AJOUT (24/08/2026) - libellés français des éléments de doctrine,
// centralisés en UN SEUL endroit. Avant cet ajout, le même dictionnaire
// était DUPLIQUÉ dans 3 fichiers (SelecteurArtefact.tsx, ResumeBuild.tsx,
// GrilleDoctrine.tsx) - exactement le genre de duplication qui a causé des
// divergences ailleurs dans cette session (stats, anti-champion).
//
// Correction de l'utilisateur : "Arc" est le terme ANGLAIS. Le terme
// français correct est "Cryo-électrique" - "Arc" en français est un
// anglicisme toléré jusqu'ici par simplicité. ⚠️ Ne pas confondre avec
// "Arc" le TYPE D'ARME (l'arc, l'arme) : LIBELLES_ARME_FR garde "Arc" pour
// ce cas, seul l'ÉLÉMENT change de libellé.
//
// L'identifiant interne reste "arc" (clé technique, alignée sur l'enum
// Bungie `2 = Arc` et utilisée dans des dizaines d'endroits) - seul le
// TEXTE AFFICHÉ change.
//
// EN: ⚠️ ADDED - French labels for doctrine elements, centralised in ONE
// place instead of duplicated across 3 files. User correction: "Arc" is the
// ENGLISH term; the correct French term is "Cryo-électrique" - "Arc" in
// French was a tolerated anglicism. NOT to be confused with "Arc" the WEAPON
// TYPE (the bow): only the ELEMENT label changes. The internal identifier
// stays "arc" - only the DISPLAYED text changes.
import { DamageElement } from "../types/build";

export const LIBELLES_ELEMENT_FR: Record<Exclude<DamageElement, null>, string> = {
  solaire: "Solaire",
  arc: "Cryo-électrique",
  // FR : ⚠️ CORRIGÉ (24/08/2026) - les suffixes « (Vide) » et « (Strand) »
  // ont été RETIRÉS : ce sont les noms ANGLAIS de ces éléments (Void,
  // Strand), sans raison d'apparaître dans une appli en français. Ils
  // venaient d'une des 3 copies dupliquées de ce dictionnaire, conservés
  // par prudence lors de la centralisation — l'utilisateur a confirmé
  // qu'ils étaient à supprimer.
  // EN: ⚠️ FIXED - the "(Vide)"/"(Strand)" suffixes were REMOVED: those are
  // the ENGLISH names, with no reason to appear in a French app.
  abyssal: "Abyssal",
  stase: "Stase",
  filobscur: "Filobscur",
  prismatique: "Prismatique",
};

export function libelleElement(e: DamageElement): string {
  return e ? LIBELLES_ELEMENT_FR[e] : "";
}

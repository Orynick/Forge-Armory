// FR : ⚠️ AJOUT (23/10/2026, audit) - constantes et helper PARTAGÉS par les deux
// modules d'export HTML autonome (`loadouts/exportFiche.ts` et
// `loadouts/iconesExport.ts`) : l'origine d'icônes autorisée
// (`ORIGINE_ICONES`, la seule origine d'image admise par la politique de
// sécurité de la page d'export) et l'échappement HTML (`echapper`). Deux
// copies existaient (`iconesExport.ts` : 4 caractères ; `exportFiche.ts` : 5,
// avec `'` → `&#39;`) — la version la plus complète (5 caractères) est
// retenue, strictement plus sûre.
// EN: ⚠️ ADDED - constants and helper SHARED by the two standalone HTML export
// modules: the allowed icon origin and the HTML escape. Two copies existed
// (`iconesExport.ts`: 4 chars; `exportFiche.ts`: 5, with `'` → `&#39;`) — the
// most complete version (5 chars) is kept, strictly safer.

/** FR : seule origine d'image admise dans une page d'export (CSP `img-src`). / EN: the only image origin allowed in an export page (CSP `img-src`). */
export const ORIGINE_ICONES = "https://www.bungie.net/";

/** FR : échappe un texte pour l'insérer dans du HTML (attribut ou contenu). / EN: escapes a text for insertion into HTML (attribute or content). */
export function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

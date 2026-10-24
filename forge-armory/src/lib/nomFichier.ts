// FR : ⚠️ AJOUT (23/10/2026, audit) - nom de fichier « propre » (sans caractères
// interdits par Windows), UNIFIÉ : deux copies existaient (`lib/loadouts/stockage.ts`
// et `lib/legendarium/exportImage.ts`), identiques sauf la longueur max (50 vs 60)
// et le repli si vide ("build" vs "page-de-lore"). Une seule fonction ici, paramétrée.
// EN: ⚠️ ADDED - UNIFIED "clean" file name: two copies existed (loadouts/stockage.ts
// and legendarium/exportImage.ts), identical except max length (50 vs 60) and the
// empty fallback ("build" vs "page-de-lore"). One function here, parameterised.

/**
 * FR : nom de fichier lisible et sûr pour Windows : accents retirés, caractères
 * interdits (\ / : * ? " < > |) et espaces remplacés par « - ».
 * @param nom brut (titre du build / de la page)
 * @param longueurMax tronque à cette longueur (défaut 60)
 * @param repliSiVide valeur si le nettoyage ne produit rien (défaut "build")
 * EN: readable, Windows-safe file name: accents stripped, forbidden characters
 * and spaces replaced by "-".
 */
export function nomFichierPropre(nom: string, longueurMax = 60, repliSiVide = "build"): string {
  const propre = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, longueurMax);
  return propre === "" ? repliSiVide : propre;
}

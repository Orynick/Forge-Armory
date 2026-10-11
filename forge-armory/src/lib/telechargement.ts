// FR : ⚠️ EXTRAIT (28/09/2026, v0.2.8) de PanneauLoadouts - téléchargement
// d'un fichier texte produit par l'appli (export JSON d'un ou plusieurs
// builds). Partagé avec le bloc « Partage du build ». Dans le navigateur, le
// fichier part dans Téléchargements ; dans le logiciel installé, Windows
// propose où l'enregistrer.
// EN: ⚠️ EXTRACTED from PanneauLoadouts - downloads a text file produced by
// the app; shared with the "share build" block.

export function telechargerFichierTexte(contenu: string, nomFichier: string, type = "application/json"): void {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

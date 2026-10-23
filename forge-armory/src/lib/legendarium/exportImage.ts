// FR : ⚠️ AJOUT (22/10/2026, bonus Legendarium, demande de l'utilisateur) - EXPORT INFOGRAPHIQUE d'une page de Lore (JPEG/PNG). L'utilisateur a demandé : « pouvoir générer un export infographique (JPEG/PNG) de la page de lore sélectionnée : le bouton sera affiché en haut à droite de la page. L'export affichera tout ce qui se trouve sur la page de Lore (l'encart bleu ou ambre). Sur l'export, tu pourras mettre en filigrane le logo de Forge Armory en précisant en bas de l'image que c'est une mise en image, et en créditant Bungie et Destiny ou Destiny 2 (que tout le monde puisse savoir que c'est eux qui ont créé cet univers). »
// Implémentation : rendu NATIF sur <canvas> (aucune bibliothèque ajoutée — le projet n'en a pas et l'ajout d'une dépendance pour un seul export serait disproportionné). Le canvas reprend la PALETTE verrouillée (Parchemin D1 / Hologramme D2) : fond, bordure, œilleton (catégorie · livre · section · compteur page X/Y), titre de la page, sous-titre, libellé chronologique, texte du Lore (avec retour à la ligne), parcours inverse (objets porteurs). FILIGRANE : l'emblème Forge Armory (logo) centré sur TOUTE la fiche à très faible opacité (identique aux exports de builds — dessiné derrière le contenu). En BAS : la mention « mise en image » créditant Bungie et Destiny / Destiny 2. Le texte est dessiné avec retour à la ligne (mesure par ctx.measureText). La couverture du livre est dessinée en haut à gauche (comme dans l'appli), le texte commence à sa droite puis continue dessous (même logique que le flottant CSS).
// LECTURE PASSIVE : cette fonction ne lit que des données en mémoire, n'écrit rien (le téléchargement du fichier est déclenché par le clic de l'utilisateur sur le bouton, via un lien <a download> créé à la volée — aucun état persistant).
// EN: ADDED - INFOGRAPHIC EXPORT of a lore page (JPEG/PNG). User request: "generate an infographic export (JPEG/PNG) of the selected lore page: the button is shown at the top right of the page. The export shows everything on the lore page (the blue or amber panel). On the export, put the Forge Armory logo as a watermark and note at the bottom that it is an image rendering, crediting Bungie and Destiny or Destiny 2 (so everyone knows they created this universe)."
// Implementation: NATIVE <canvas> rendering (no library added — the project has none and adding a dependency for a single export would be disproportionate). The canvas reuses the LOCKED palette (Parchment D1 / Hologram D2): background, border, eyebrow (category · book · section · page X/Y counter), page title, subtitle, chronological label, lore text (wrapped), reverse path (carrier items). WATERMARK: the Forge Armory emblem (logo) centred over the WHOLE sheet at very low opacity (same as the build exports — drawn behind the content). At the BOTTOM: the "image rendering" note crediting Bungie and Destiny / Destiny 2. Text is drawn with line wrapping (measured with ctx.measureText). The book cover is drawn top-left (as in the app), the text starts to its right then continues below (same logic as the CSS float).
// PASSIVE READING: this function only reads in-memory data, writes nothing (the file download is triggered by the user's click on the button, via a throwaway <a download> link — no persisted state).
import type { LivreLore, PageLore, SectionLegendarium } from "./types";
import { PALETTE, ereDeSection } from "./palette";
import { SECTIONS } from "./modele";

/** FR : données d'entrée de l'export : la page, son livre, sa section, la position dans le livre (pour le compteur). / EN: export input data: the page, its book, its section, the position in the book (for the counter). */
export interface DonneesExportLore {
  section: SectionLegendarium;
  livre: LivreLore;
  page: PageLore;
  /** FR : position 0-based de la page dans le livre (pour « page X/Y »), ou undefined. / EN: 0-based position of the page in the book (for "page X/Y"), or undefined. */
  indexPage?: number;
}

/** FR : résultat de l'export : le canvas prêt à être téléchargé. / EN: export result: the canvas ready to be downloaded. */
export interface ResultatExportLore {
  canvas: HTMLCanvasElement;
  /** FR : nom de fichier proposé (sans extension). / EN: suggested file name (without extension). */
  nomFichier: string;
}

// FR : constantes de mise en page de l'export (indépendantes de l'écran). / EN: export layout constants (independent of the screen).
const LARGEUR = 1200;                 // FR : largeur fixe de l'image (lisible en partage). / EN: fixed image width (readable when shared).
const MARGE = 48;                     // FR : marge intérieure de l'encart. / EN: inner margin of the panel.
const POLICE_TITRE = '600 34px Georgia, "Times New Roman", serif';
const POLICE_SOUS_TITRE = 'italic 22px Georgia, "Times New Roman", serif';
const POLICE_CORPS = '20px Georgia, "Times New Roman", serif';
const POLICE_D2_TITRE = '600 34px "Inter", system-ui, sans-serif';
const POLICE_D2_CORPS = '20px "Inter", system-ui, sans-serif';
const POLICE_D2_SOUS_TITRE = 'italic 22px "Inter", system-ui, sans-serif';
const POLICE_OEILLET = '18px "Inter", system-ui, sans-serif';
const POLICE_PIED = '16px "Inter", system-ui, sans-serif';
const INTERLIGNE_CORPS = 30;         // FR : interligne du texte (px). / EN: body text line height (px).
const INTERLIGNE_PETIT = 22;
const COUVERTURE_MAX_LARGEUR = 320;   // FR : largeur max de la couverture (px). / EN: max cover width (px).
const COUVERTURE_ESPacement = 24;     // FR : espace entre la couverture et le texte. / EN: gap between cover and text.
const PIED_HAUTEUR = 96;              // FR : hauteur réservée en bas pour le crédit (le filigrane est centré sur toute la fiche, pas dans le pied). / EN: height reserved at the bottom for the credit (the watermark is centred over the whole sheet, not in the footer).
const FILIGRANE_OPACITE = 0.07;       // FR : opacité du filigrane centré (identique aux exports de builds — le texte reste net). / EN: opacity of the centred watermark (same as build exports — text stays sharp).
const LARGEUR_FILIGRANE = 1000;       // FR : largeur du filigrane centré (~5/6 de la largeur de l'image, comme les 760 px sur 900 px des exports de builds). / EN: width of the centred watermark (~5/6 of the image width, like the 760 px on 900 px of build exports).

/** FR : découpe un texte en lignes tenant dans `largeurMax` (mesure réelle via le contexte canvas). EXPORTÉE pour les tests (fonction pure sur le principe, seul le contexte sert à mesurer). / EN: wraps a text into lines fitting `maxWidth` (real measurement via the canvas context). EXPORTED for tests (pure in principle, only the context is used to measure). */
export function decouperTexte(ctx: CanvasRenderingContext2D, texte: string, largeurMax: number): string[] {
  const lignes: string[] = [];
  for (const paragraphe of texte.split("\n")) {
    if (paragraphe.trim() === "") { lignes.push(""); continue; }
    let ligne = "";
    for (const mot of paragraphe.split(/\s+/)) {
      const essai = ligne === "" ? mot : `${ligne} ${mot}`;
      if (ctx.measureText(essai).width <= largeurMax || ligne === "") {
        ligne = essai;
      } else {
        lignes.push(ligne);
        ligne = mot;
      }
    }
    if (ligne !== "") lignes.push(ligne);
  }
  return lignes;
}

/** FR : dessine un texte avec retour à la ligne, retourne la hauteur utilisée. / EN: draws wrapped text, returns the height used. */
function dessinerTexte(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, largeurMax: number, interligne: number): number {
  const lignes = decouperTexte(ctx, texte, largeurMax);
  for (const l of lignes) {
    ctx.fillText(l, x, y);
    y += interligne;
  }
  return lignes.length * interligne;
}

/** FR : éclaircit une couleur hexa d'un facteur (pour le texte du pied sur fond sombre). EXPORTÉE pour les tests (fonction pure). / EN: lightens a hex colour by a factor (for footer text on dark background). EXPORTED for tests (pure function). */
export function eclaircir(hex: string, facteur: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * facteur));
  const g = Math.min(255, Math.round(((n >> 8) & 0xff) + (255 - ((n >> 8) & 0xff)) * facteur));
  const b = Math.min(255, Math.round((n & 0xff) + (255 - (n & 0xff)) * facteur));
  return `rgb(${r}, ${g}, ${b})`;
}

/** FR : nom de fichier « propre » (sans caractères interdits). EXPORTÉ pour les tests (fonction pure). / EN: "clean" file name (no forbidden characters). EXPORTED for tests (pure function). */
export function nomFichierPropre(titre: string): string {
  const propre = titre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return propre === "" ? "page-de-lore" : propre.toLowerCase();
}

/**
 * FR : rend la page de Lore sur un canvas (palette verrouillée, filigrane Forge Armory, crédit Bungie/Destiny en bas).
 * Lève une erreur si le canvas n'est pas disponible (hors navigateur/Electron) — l'appelant affiche alors un message.
 * / EN: renders the lore page onto a canvas (locked palette, Forge Armory watermark, Bungie/Destiny credit at the bottom).
 * Throws if the canvas is unavailable (outside browser/Electron) — the caller then shows a message.
 */
export async function rendreExportLore(donnees: DonneesExportLore): Promise<ResultatExportLore> {
  const { section, livre, page, indexPage } = donnees;
  const ere = PALETTE[ereDeSection(section)];
  const estD1 = ereDeSection(section) === "d1";
  const policeTitre = estD1 ? POLICE_TITRE : POLICE_D2_TITRE;
  const policeCorps = estD1 ? POLICE_CORPS : POLICE_D2_CORPS;
  const policeSousTitre = estD1 ? POLICE_SOUS_TITRE : POLICE_D2_SOUS_TITRE;

  // --- Mesure préalable : hauteur du texte avec la largeur disponible (avec ou sans couverture) ---
  const mesure = document.createElement("canvas").getContext("2d");
  if (!mesure) throw new Error("Canvas indisponible");
  mesure.font = policeCorps;
  const largeurTexteSansCouv = LARGEUR - 2 * MARGE;

  // --- Charge la couverture (si présente) ---
  const urlCouverture = livre.couvertureUrl ?? "";
  let imageCouverture: HTMLImageElement | null = null;
  if (urlCouverture !== "") {
    imageCouverture = await new Promise((res) => {
      const img = new Image();
      img.crossOrigin = "anonymous";   // FR : Bungie autorise CORS (Access-Control-Allow-Origin: *) — sinon le canvas serait « souillé » et toBlob échouerait. / EN: Bungie allows CORS (Access-Control-Allow-Origin: *) — otherwise the canvas would be "tainted" and toBlob would fail.
      img.onload = () => res(img);
      img.onerror = () => res(null);   // FR : couverture indisponible = export sans image (jamais de blocage). / EN: cover unavailable = export without image (never blocks).
      img.src = urlCouverture;
    });
  }
  // FR : hauteur de la couverture affichée (jamais agrandie au-delà de sa taille naturelle, comme dans l'appli — pas de pixellisation). / EN: displayed cover height (never upscaled beyond its natural size, as in the app — no pixelation).
  let couvLarg = 0, couvHaut = 0;
  if (imageCouverture && imageCouverture.naturalWidth > 0) {
    const ratio = Math.min(1, COUVERTURE_MAX_LARGEUR / imageCouverture.naturalWidth);
    couvLarg = Math.round(imageCouverture.naturalWidth * ratio);
    couvHaut = Math.round(imageCouverture.naturalHeight * ratio);
  }

  // --- Hauteur du texte : lignes à côté de la couverture (largeur réduite) + lignes dessous (pleine largeur) ---
  const lignesTexte = decouperTexte(mesure, page.texte, largeurTexteSansCouv);
  let hauteurTexte = 0;
  if (couvHaut > 0) {
    // FR : on estime combien de lignes tiennent à côté de la couverture (hauteur de couverture / interligne), le reste passe dessous en pleine largeur. Approximation suffisante pour la mise en page. / EN: estimate how many lines fit beside the cover (cover height / line height), the rest goes below at full width. Good enough for layout.
    const lignesCote = Math.max(0, Math.floor(couvHaut / INTERLIGNE_CORPS));
    const lignesApresCote = lignesTexte.slice(lignesCote);
    const lignesTexteApresCote = decouperTexte(mesure, lignesApresCote.join("\n"), largeurTexteSansCouv);
    hauteurTexte = lignesCote * INTERLIGNE_CORPS + lignesTexteApresCote.length * INTERLIGNE_CORPS;
  } else {
    hauteurTexte = lignesTexte.length * INTERLIGNE_CORPS;
  }

  // --- Hauteur des autres blocs ---
  mesure.font = POLICE_OEILLET;
  const hauteurOeilleton = 26;
  const hauteurTitre = 44;
  const hauteurSousTitre = page.sousTitre ? 30 : 0;
  const hauteurChrono = page.libelleChrono ? 24 : 0;
  const hauteurSeparateur = 16;
  const nbPorteurs = page.porteurs?.length ?? 0;
  const hauteurPorteurs = nbPorteurs > 0 ? 24 + nbPorteurs * INTERLIGNE_PETIT + 12 : 0;

  const hauteurContenu = MARGE
    + hauteurOeilleton + 8
    + Math.max(couvHaut, hauteurTitre + hauteurSousTitre + hauteurChrono + hauteurTexte)   // FR : le bloc titre+texte peut dépasser la couverture (le texte continue dessous). / EN: the title+text block may exceed the cover (text continues below).
    + hauteurSeparateur
    + hauteurPorteurs
    + MARGE
    + PIED_HAUTEUR;

  // --- Création du canvas final ---
  const canvas = document.createElement("canvas");
  canvas.width = LARGEUR;
  canvas.height = Math.max(400, Math.ceil(hauteurContenu));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");

  // FR : fond de l'encart (palette verrouillée) + bordure + lueur hologramme. / EN: panel background (locked palette) + border + hologram glow.
  ctx.fillStyle = ere.fondPage;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (ere.lueur) {
    ctx.shadowColor = "rgba(61, 126, 181, 0.35)";
    ctx.shadowBlur = 32;
  }
  ctx.strokeStyle = ere.bordure;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.shadowBlur = 0;

  // FR : FILIGRANE CENTRÉ sur toute la fiche (demande de l'utilisateur, 22/10/2026) : emblème Forge Armory
  // en filigrane, centré horizontalement ET verticalement, à très faible opacité (comme les exports de builds).
  // Dessiné AVANT le contenu (derrière), il ne gêne pas la lecture. / EN: CENTRED WATERMARK over the whole sheet
  // (user request): the Forge Armory emblem as a watermark, centred horizontally AND vertically, at very low
  // opacity (like the build exports). Drawn BEFORE the content (behind), it doesn't hinder reading.
  const logoFiligrane = await new Promise<HTMLImageElement | null>((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = `${import.meta.env.BASE_URL}logo-forge-armory-embleme.png`;
  });
  if (logoFiligrane) {
    const ratio = logoFiligrane.naturalHeight / logoFiligrane.naturalWidth;
    const hauteurFiligrane = Math.round(LARGEUR_FILIGRANE * ratio);
    ctx.save();
    ctx.globalAlpha = FILIGRANE_OPACITE;
    ctx.drawImage(
      logoFiligrane,
      (canvas.width - LARGEUR_FILIGRANE) / 2,      // FR : centré horizontalement / EN: centred horizontally
      (canvas.height - hauteurFiligrane) / 2,     // FR : centré verticalement / EN: centred vertically
      LARGEUR_FILIGRANE,
      hauteurFiligrane
    );
    ctx.restore();
  }

  let y = MARGE;

  // --- Œilleton : « CATÉGORIE · LIVRE · SECTION » + « page X/Y » à droite ---
  ctx.font = POLICE_OEILLET;
  ctx.fillStyle = ere.oeilleton;
  ctx.textBaseline = "alphabetic";
  const libelleSection = SECTIONS.find((s) => s.id === section)?.libelle ?? section;
  const oeilleton = livre.categorie ? `${livre.categorie} · ${livre.titre} · ${libelleSection}` : `${livre.titre} · ${libelleSection}`;
  ctx.fillText(oeilleton, MARGE, y + 18);
  if (indexPage !== undefined && livre.pages.length > 0) {
    const compteur = `page ${indexPage + 1}/${livre.pages.length}`;
    ctx.textAlign = "right";
    ctx.fillText(compteur, LARGEUR - MARGE, y + 18);
    ctx.textAlign = "left";
  }
  y += hauteurOeilleton + 8;

  // --- Couverture (haut gauche, taille naturelle plafonnée) + titre à droite ---
  const xTexte = MARGE + (couvLarg > 0 ? couvLarg + COUVERTURE_ESPacement : 0);
  const largeurTexte = LARGEUR - MARGE - xTexte;
  if (imageCouverture && couvLarg > 0) {
    ctx.drawImage(imageCouverture, MARGE, y, couvLarg, couvHaut);
  }
  ctx.font = policeTitre;
  ctx.fillStyle = ere.couleurTitre;
  dessinerTexte(ctx, page.titre, xTexte, y + 34, largeurTexte, 44);
  y += hauteurTitre;
  if (page.sousTitre) {
    ctx.font = policeSousTitre;
    ctx.fillStyle = ere.oeilleton;
    ctx.fillText(page.sousTitre, xTexte, y + 22);
    y += hauteurSousTitre;
  }
  if (page.libelleChrono) {
    ctx.font = POLICE_OEILLET;
    ctx.fillStyle = ere.oeilleton;
    ctx.fillText(page.libelleChrono, xTexte, y + 18);
    y += hauteurChrono;
  }

  // --- Texte du Lore : à côté de la couverture (largeur réduite) puis dessous (pleine largeur) ---
  ctx.font = policeCorps;
  ctx.fillStyle = ere.couleurCorps;
  if (couvHaut > 0) {
    const lignesCote = Math.max(0, Math.floor(couvHaut / INTERLIGNE_CORPS));
    // FR : recalcule les lignes avec la largeur réduite (à côté de la couverture). / EN: recompute lines with the reduced width (beside the cover).
    const lignesLarges = decouperTexte(ctx, page.texte, largeurTexteSansCouv);
    const lignesEtroites = decouperTexte(ctx, lignesLarges.slice(0, lignesCote).join("\n"), largeurTexte);
    let yTexte = y;
    for (const l of lignesEtroites) { ctx.fillText(l, xTexte, yTexte + 20); yTexte += INTERLIGNE_CORPS; }
    const reste = lignesLarges.slice(lignesCote).join("\n");
    const lignesReste = decouperTexte(ctx, reste, largeurTexteSansCouv);
    // FR : la première ligne « dessous » démarre sous la couverture si le texte à côté est plus court. / EN: the first "below" line starts under the cover if the beside-text is shorter.
    const yDessous = Math.max(y + lignesEtroites.length * INTERLIGNE_CORPS, y + couvHaut + 16);
    let yReste = yDessous;
    for (const l of lignesReste) { ctx.fillText(l, MARGE, yReste + 20); yReste += INTERLIGNE_CORPS; }
    y = Math.max(y + hauteurTexte, yDessous + lignesReste.length * INTERLIGNE_CORPS);
  } else {
    y += dessinerTexte(ctx, page.texte, MARGE, y + 20, largeurTexteSansCouv, INTERLIGNE_CORPS);
  }

  // --- Parcours inverse (objets porteurs) ---
  if (nbPorteurs > 0) {
    y += hauteurSeparateur;
    ctx.strokeStyle = ere.bordure;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGE, y);
    ctx.lineTo(LARGEUR - MARGE, y);
    ctx.stroke();
    y += 12;
    ctx.font = POLICE_OEILLET;
    ctx.fillStyle = ere.oeilleton;
    ctx.fillText(nbPorteurs > 1 ? "Objets portant ce Lore :" : "Objet portant ce Lore :", MARGE, y + 16);
    y += 24;
    ctx.font = POLICE_PIED;
    ctx.fillStyle = ere.couleurCorps;
    for (const p of page.porteurs ?? []) {
      ctx.fillText(`• ${p.nom} — ${p.emplacement}`, MARGE + 16, y + 16);
      y += INTERLIGNE_PETIT;
    }
  }

  // --- Pied : mention « mise en image » créditant Bungie / Destiny (le filigrane centré est déjà dessiné derrière le contenu) ---
  const yPied = canvas.height - PIED_HAUTEUR;
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, yPied, canvas.width, PIED_HAUTEUR);

  // FR : mention en bas : « mise en image » + crédit Bungie / Destiny. Le libellé D1/D2 dépend de la section. / EN: footer note: "image rendering" + Bungie / Destiny credit. The D1/D2 wording depends on the section.
  ctx.font = POLICE_PIED;
  ctx.fillStyle = eclaircir(ere.couleurCorps, 0.35);
  ctx.textAlign = "center";
  const ereNom = estD1 ? "Destiny" : "Destiny 2";
  const ligne1 = "Mise en image par Forge Armory";
  const ligne2 = `Texte du Lore © Bungie, Inc. — ${ereNom} est une marque de Bungie, Inc. Forge Armory est un projet de fan, non affilié à Bungie.`;
  ctx.fillText(ligne1, canvas.width / 2, yPied + 40);
  ctx.fillText(ligne2, canvas.width / 2, yPied + 64);
  ctx.textAlign = "left";

  return { canvas, nomFichier: `legendarium-${nomFichierPropre(page.titre)}` };
}

/**
 * FR : déclenche le téléchargement de l'export (PNG par défaut, JPEG si demandé). Crée un lien <a download> à la volée (aucun état persistant).
 * / EN: triggers the export download (PNG by default, JPEG if requested). Creates a throwaway <a download> link (no persisted state).
 */
export function telechargerExport(resultat: ResultatExportLore, format: "png" | "jpeg" = "png"): void {
  const { canvas, nomFichier } = resultat;
  const type = format === "jpeg" ? "image/jpeg" : "image/png";
  const extension = format === "jpeg" ? "jpg" : "png";
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nomFichier}.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, type, format === "jpeg" ? 0.92 : undefined);
}

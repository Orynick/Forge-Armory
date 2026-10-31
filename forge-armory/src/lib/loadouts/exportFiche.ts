// FR : ⚠️ AJOUT (27/09/2026, v0.2.5) - export infographique d'une fiche de
// build, en PNG ou en PDF (demande de l'utilisateur, cahier des charges
// « export v7 » et maquette `D2-Build-Analyzer-prototype-infographie-v7.png`).
//
// Architecture : UNE seule source de rendu. Cette fonction transforme les
// données déjà assemblées par `construireFiche` en une page HTML autonome ;
// le logiciel (electron/main.cjs) en tire ensuite le PNG (capture) ET le PDF
// (impression) - deux sorties d'une même page, qui ne peuvent donc pas
// diverger. Aucune logique métier ici : pas de Manifest, pas de comptage de
// pièces, pas de détection anti-champion. Tout vient de la fiche.
//
// ⚠️ CHANGÉ (29/09/2026, v0.2.8) - textes agrandis (demande de
// l'utilisateur, après un export réel jugé trop petit) : environ +20 %,
// davantage pour les plus petits (mods de l'armure, étiquettes). Même
// largeur et même agencement ; vérifié par mesure qu'aucun texte ne gagne
// de ligne sur un build réel.
// Mesures reprises de la maquette v7 (1800 px de large) : la page fait
// 900 px de CSS, capturée à l'échelle 2. Deux défauts du prototype sont
// corrigés plutôt que reproduits : la ligne « Saut » chevauchait « Aspects »,
// et les perks d'artefact étaient rognés à gauche.
//
// Sécurité : les noms peuvent venir d'un build importé (fichier d'un ami).
// Tout texte est échappé, et seules les images de www.bungie.net sont
// admises (filtrées ici, puis bloquées aussi par la politique de sécurité
// de la page et par le logiciel).
//
// EN: ⚠️ ADDED - infographic export of a build sheet (PNG or PDF). ONE
// rendering source: this function turns the data built by construireFiche
// into a standalone HTML page; the desktop shell captures it as PNG AND
// prints it as PDF, so both outputs cannot diverge. No business logic here.
// Measures taken from the v7 mockup (900 CSS px, captured at scale 2). Two
// prototype glitches are fixed rather than reproduced. All text is escaped
// and only www.bungie.net images are allowed.

import { FicheBuild, ElementFiche, PieceFiche } from "./fiche";
import { ORDRE_EMPLACEMENTS, LIBELLES_SLOT } from "../../data/libellesUI";
import { CHEMINS_ICONES_CHAMPION, LIBELLES_CHAMPION, TypeChampion } from "../../components/icones/IconeAntiChampion";
import { calculerTailleRendu, trouverFormeTypeArme } from "../../components/icones/IconeTypeArme";
import { ICONES as ICONES_MUNITION, MUNITIONS } from "../../components/icones/IconeMunition";
import { emblemeSvg, OPACITE_FILIGRANE } from "../../data/emblemeForgeArmory";
import { SlotArme, SlotArmure } from "../../types/build";

/** FR : largeur de la page en pixels CSS ; le PNG fait le double. / EN: page width in CSS px; the PNG is twice that. */
export const LARGEUR_EXPORT = 900;

import { htmlIconeClasse, htmlIconeElement, htmlLogoContexte, htmlLogoSection } from "./iconesExport";
import { FILTRE_STASE_VERS_FILOBSCUR } from "../../data/teinteIconesDoctrine";   // ⚠️ AJOUT (12/10/2026, v0.4.1)

// FR : ⚠️ CHANGÉ (23/10/2026, audit) - `ORIGINE_ICONES` et `echapper` centralisés
// dans `lib/htmlExport.ts` (dedup avec `iconesExport.ts`, qui avait sa propre
// copie de `echapper` et de l'origine). / EN: ⚠️ CHANGED - `ORIGINE_ICONES` and
// `echapper` centralised in `lib/htmlExport.ts` (dedup with `iconesExport.ts`).
import { ORIGINE_ICONES, echapper } from "../htmlExport";

/**
 * FR : case d'icône. Toujours dessinée (fond neutre), même sans image :
 * une icône manquante laisse un emplacement propre au lieu de décaler la
 * mise en page. Seules les adresses de www.bungie.net sont retenues.
 * EN: icon box, always drawn (neutral background) even without an image.
 */
function icone(src: string | undefined, taille: number, classe = "icone", filtre?: string): string {
  // FR : ⚠️ CHANGÉ (12/10/2026, v0.4.1) - `filtre` (facultatif) : filtre de couleur de l'image (recoloration des icônes de saut et de compétence de classe du Filobscur). Sans lui, le HTML est identique à avant. / EN: ⚠️ CHANGED - optional colour filter.
  const image = src && src.startsWith(ORIGINE_ICONES) ? `<img src="${echapper(src)}" alt=""${filtre ? ` style="filter:${filtre}"` : ""}>` : "";
  return `<span class="${classe}" style="width:${taille}px;height:${taille}px">${image}</span>`;
}

/**
 * FR : icône anti-champion, tracés partagés avec l'appli.
 * ⚠️ CHANGÉ (28/09/2026, v0.2.8) - cadre retiré (demande de l'utilisateur :
 * « ne conserver que l'icône elle-même, comme dans Mon Build »). L'icône
 * passe de 12 à 16 px, la taille de Mon Build, dans un emplacement de même
 * hauteur que le type d'arme et l'élément : l'alignement est conservé.
 * EN: anti-champion icon. ⚠️ CHANGED - frame removed, 16 px like Mon Build,
 * same-height slot so alignment is kept.
 */
function iconeChampion(type: TypeChampion): string {
  const { viewBox, d } = CHEMINS_ICONES_CHAMPION[type];
  return (
    `<span class="champion" title="Anti-${echapper(LIBELLES_CHAMPION[type])}">` +
    `<svg viewBox="${viewBox}" width="16" height="16" fill="#c9ccd3"><path d="${d}"/></svg></span>`
  );
}

/**
 * FR : ⚠️ AJOUT (27/09/2026, v0.2.6) - icône du type d'arme (demande de
 * l'utilisateur), reconnue par la MÊME fonction que l'appli
 * (`trouverFormeTypeArme`). Posée dans un emplacement de taille fixe, pour
 * que l'élément et l'anti-champion qui suivent restent alignés d'une arme à
 * l'autre, quelle que soit la forme (les icônes allongées, comme le
 * lance-roquettes, gardent leurs proportions grâce à `calculerTailleRendu`).
 * Type absent ou non reconnu : emplacement vide plutôt qu'un badge.
 * EN: ⚠️ ADDED - weapon type icon, recognised by the SAME function as the
 * app, in a fixed-size slot so the next icons stay aligned across weapons.
 */
function iconeTypeArme(piece: PieceFiche): string {
  const forme = trouverFormeTypeArme(piece.typeArme, piece.slot, piece.munition, piece.categories, piece.typeSecours);
  const contenu = forme
    ? (() => {
        const { largeur, hauteur } = calculerTailleRendu(forme.viewBox, 26);
        return `<svg viewBox="${echapper(forme.viewBox)}" width="${largeur}" height="${hauteur}" fill="#c9ccd3"><path d="${echapper(forme.d)}"/></svg>`;
      })()
    : "";
  return `<span class="type-arme"${piece.typeArme ? ` title="${echapper(piece.typeArme)}"` : ""}>${contenu}</span>`;
}

/**
 * FR : ⚠️ AJOUT (v0.2.6) - l'icône officielle de l'élément REMPLACE son nom
 * (demande de l'utilisateur), comme dans Mon Build. Si l'icône est absente,
 * le nom reste affiché ; si elle ne se charge pas, le logiciel la remplace
 * par ce même nom (attribut `data-repli`) : l'information n'est jamais perdue.
 * EN: ⚠️ ADDED - the official element icon REPLACES its name; the name is
 * the fallback if the icon is missing or fails to load.
 */
function iconeElement(piece: PieceFiche): string {
  if (piece.elementIcone && piece.elementIcone.startsWith(ORIGINE_ICONES)) {
    return `<span class="element"><img src="${echapper(piece.elementIcone)}" alt="" data-repli="${echapper(piece.element ?? "")}"></span>`;
  }
  return piece.element ? `<span class="element-texte">${echapper(piece.element)}</span>` : "";
}

/**
 * FR : ⚠️ CHANGÉ (27/09/2026, v0.2.7) - Aspects et Fragments affichés avec
 * leur miniature (demande de l'utilisateur), chacun sur sa ligne
 * « miniature + nom » : même principe que la Super et les compétences
 * juste au-dessus, icônes déjà présentes dans la fiche (Manifest). Une
 * miniature manquante laisse sa case neutre, sans décaler les noms.
 * EN: ⚠️ CHANGED - Aspects and Fragments shown with their thumbnail, one
 * "thumbnail + name" row each, like the abilities above.
 */
/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - type de munitions, entre l'élément et
 * l'anti-champion (demande de l'utilisateur : « à droite de l'icône
 * d'élément »). Mêmes tracés et mêmes couleurs que dans l'appli
 * (`ICONES`, `MUNITIONS`), emplacement de même taille que l'élément pour
 * garder la ligne alignée. Rien si le type est inconnu.
 * EN: ⚠️ ADDED - ammo type, between the element and the anti-champion, same
 * paths and colours as the app, same slot size as the element.
 */
function iconeMunition(piece: PieceFiche): string {
  if (!piece.munition) return "";
  const { cle, couleur } = MUNITIONS[piece.munition];
  const { viewBox, d, libelle } = ICONES_MUNITION[cle];
  return (
    `<span class="munition" title="${echapper(libelle)}">` +
    `<svg viewBox="${echapper(viewBox)}" width="16" height="16" fill="${couleur}"><path d="${echapper(d)}"/></svg></span>`
  );
}

function liste(elements: ElementFiche[], colonnes: 1 | 2): string {
  if (elements.length === 0) return `<div class="aucun">—</div>`;
  // FR : ⚠️ CHANGÉ (30/09/2026, v0.2.9) - consigne de l'utilisateur :
  // l'ensemble Aspects + Fragments tient en TROIS colonnes de même largeur,
  // une pour les Aspects, deux pour les Fragments. Lecture de haut en bas
  // puis colonne suivante : autant de lignes que le nombre d'éléments
  // divisé par le nombre de colonnes, arrondi au-dessus (5 fragments sur
  // 2 colonnes → 3 lignes). Largeurs égales garanties par la CSS
  // (`.doctrine-listes` et `.liste`, même écart partout).
  // EN: ⚠️ CHANGED - Aspects + Fragments fit in THREE equal-width columns
  // (1 for Aspects, 2 for Fragments), read top to bottom then next column.
  const lignes = Math.ceil(elements.length / colonnes);
  return `<div class="liste" style="grid-template-columns:repeat(${colonnes},minmax(0,1fr));grid-template-rows:repeat(${lignes},auto)">${elements
    .map((e) => `<div class="liste-element">${icone(e.icone, 18)}<span>${echapper(e.nom)}</span></div>`)
    .join("")}</div>`;
}

// ---------------------------------------------------------------------------
// FR : blocs de la fiche, dans l'ordre imposé : en-tête, doctrine, armes,
// armure, artefact.
// EN: sheet blocks, in the required order.
// ---------------------------------------------------------------------------

function blocEntete(f: FicheBuild): string {
  // FR : ⚠️ CHANGÉ (06/10/2026, v0.3.3) - « par pseudo#1234 » en dernier segment du sous-titre, SEULEMENT si l'auteur est connu : une fiche sans auteur produit exactement le même HTML qu'avant (images et PDF inchangés). Le texte est échappé comme le reste.
  // EN: ⚠️ CHANGED - "par handle" as the last subtitle segment, only when known; a sheet without author yields the same HTML as before.
  // FR : le pseudo a sa PROPRE étiquette `.auteur` : le sous-titre est en MAJUSCULES, ce qui déformerait un pseudo (« Orynick#1234 » deviendrait « ORYNICK#1234 ») ; `.auteur` rétablit la casse et autorise le retour à la ligne d'un pseudo très long.
  // FR : ⚠️ CHANGÉ (12/10/2026, v0.4.0) - chaque segment du sous-titre reçoit son ICÔNE (demande de l'utilisateur : « icône de classe de personnage, icône d'élément de doctrine, icône de contexte ») : classe, élément (icône officielle de Bungie, sinon dessin), contexte.
  // Une fiche ancienne sans clé de classe ou d'élément garde le texte seul. Le contexte « Neutre », jusqu'ici absent du sous-titre, y figure maintenant avec son icône : sans elle l'icône de contexte n'apparaîtrait jamais sur un build neutre.
  // EN: ⚠️ CHANGED - each subtitle segment now carries its icon; the Neutral context is now shown (with its icon).
  const segments = [
    f.classe ? `${f.classeCle ? htmlIconeClasse(f.classeCle) : ""}${echapper(f.classe)}` : undefined,
    f.element ? `${f.elementCle ? htmlIconeElement(f.elementCle, f.elementIcone) : ""}${echapper(f.element)}` : undefined,
    `${htmlLogoContexte(f.contexteCle)}${echapper(f.contexte)}`,
  ].filter((x): x is string => Boolean(x));
  if (f.auteur) segments.push(`<span class="auteur">par ${echapper(f.auteur)}</span>`);
  const sousTitre = segments.join(`<span class="sep">·</span>`);
  return `
<header class="carte entete">
  <div>
    <h1>${echapper(f.nom)}</h1>
    ${sousTitre ? `<div class="sous-titre">${sousTitre}</div>` : ""}
  </div>
  <div class="marque"><b>FICHE DE BUILD</b><span>FORGE ARMORY</span></div>
</header>`;
}

function titreSection(titre: string, droite = "", logo = ""): string {
  // FR : ⚠️ CHANGÉ (12/10/2026, v0.4.0) - `logo` : le logo de la section (HTML en ligne), vide par défaut : sans logo le HTML est strictement celui d'avant. / EN: ⚠️ CHANGED - optional section logo; without it the HTML is unchanged.
  return `<div class="titre-section"><h2>${logo}${titre}</h2>${droite ? `<div class="droite">${droite}</div>` : ""}</div>`;
}

function blocDoctrine(f: FicheBuild): string {
  const lignes = f.doctrine
    .map(
      (d) => `
    <div class="doctrine-ligne">
      ${icone(d.valeur?.icone, 24, "icone", d.valeur?.teinteFilobscur ? FILTRE_STASE_VERS_FILOBSCUR : undefined)}
      <div><div class="etiquette">${echapper(d.libelle)}</div><div class="valeur">${d.valeur ? echapper(d.valeur.nom) : "—"}</div></div>
    </div>`
    )
    .join("");
  return `
<section class="section">
  ${titreSection("DOCTRINE", "", htmlLogoSection("doctrine"))}
  <div class="carte doctrine">
    <div class="doctrine-grille">${lignes}</div>
    <div class="doctrine-listes">
      <div class="liste-bloc"><div class="etiquette">Aspects</div>${liste(f.aspects, 1)}</div>
      <div class="liste-bloc fragments"><div class="etiquette">Fragments</div>${liste(f.fragments, 2)}</div>
    </div>
  </div>
</section>`;
}

function fois(e: ElementFiche): string {
  return (e.nombre ?? 1) > 1 ? `<span class="fois"> ×${e.nombre}</span>` : "";
}

function puce(e: ElementFiche): string {
  return `<div class="puce">${icone(e.icone, 20, "icone petite")}<span>${echapper(e.nom)}${fois(e)}</span></div>`;
}

function carteArme(slot: SlotArme, piece: PieceFiche | undefined): string {
  const etiquette = echapper(LIBELLES_SLOT[slot]);
  if (!piece) {
    return `
  <div class="carte arme">
    <div class="arme-info">${icone(undefined, 40)}<div><div class="etiquette">${etiquette}</div><div class="arme-nom vide">Aucune arme</div></div></div>
    <div></div>
  </div>`;
  }
  // FR : ⚠️ CHANGÉ (29/09/2026, v0.2.8) - décisions de l'utilisateur (28/09) :
  // l'armature puis la particularité d'origine s'affichent SOUS la ligne
  // d'icônes, et « Perks actifs » ne garde que les vrais perks (liste
  // nettoyée, commune à la fiche « 👁 Voir » et à la copie en texte, voir
  // fiche.ts).
  // EN: ⚠️ CHANGED - frame then origin trait shown BELOW the icon row;
  // "Active perks" keeps only real perks. Without Manifest, old layout.
  const perks = piece.perks;
  const lignesSous = [piece.armature, piece.origine].filter((e): e is ElementFiche => Boolean(e));
  return `
  <div class="carte arme">
    <div class="arme-info">
      ${icone(piece.icone, 40)}
      <div>
        <div class="etiquette">${etiquette}</div>
        <div class="arme-nom${piece.exotique ? " exotique" : ""}">${echapper(piece.nom)}</div>
        <div class="arme-element">${iconeTypeArme(piece)}${iconeElement(piece)}${iconeMunition(piece)}${piece.antiChampion ? iconeChampion(piece.antiChampion) : ""}</div>
        ${lignesSous.map((e) => `<div class="arme-ligne">${icone(e.icone, 18, "icone petite")}<span>${echapper(e.nom)}</span></div>`).join("")}
      </div>
    </div>
    <div>
      <div class="etiquette">Perks actifs</div>
      ${perks.length > 0 ? `<div class="perks">${perks.map(puce).join("")}</div>` : `<div class="aucun">—</div>`}
    </div>
  </div>`;
}

function blocArmes(f: FicheBuild): string {
  const slots = ORDRE_EMPLACEMENTS.filter((s): s is SlotArme => s === "cinetique" || s === "energie" || s === "lourde");
  const cartes = slots.map((s) => carteArme(s, f.armes.find((p) => p.slot === s))).join("");
  const nombre = f.armes.length;
  return `
<section class="section">
  ${titreSection("ARMES", `${nombre} arme${nombre > 1 ? "s" : ""}`, htmlLogoSection("armes"))}
  <div class="armes">${cartes}</div>
</section>`;
}

function cartePieceArmure(slot: SlotArmure, piece: PieceFiche | undefined, tailleIcone: number): string {
  const etiquette = echapper(LIBELLES_SLOT[slot]);
  // FR : ⚠️ CHANGÉ (29/09/2026, v0.2.8) - liste nettoyée pour l'export
  // (sans archétype, « Amélioration d'armure », revêtements ni ornements),
  // l'ancienne liste restant le repli sans Manifest.
  // EN: ⚠️ CHANGED - cleaned list for the export, old list as fallback.
  // FR : liste déjà nettoyée et regroupée dans fiche.ts (`nombre` = « ×2 »...).
  // EN: list already cleaned and grouped in fiche.ts.
  const listeMods = piece ? piece.perks : [];
  const mods = piece && listeMods.length > 0
    ? listeMods
        .map((m) => `<span class="mod">${icone(m.icone, 13, "icone mini")}${echapper(m.nom)}${fois(m)}</span>`)
        .join(`<span class="point">·</span>`)
    : "—";
  return `
    <div class="carte piece">
      ${icone(piece?.icone, tailleIcone)}
      <div class="piece-texte">
        <div class="etiquette">${etiquette}</div>
        <div class="piece-nom${piece?.exotique ? " exotique" : ""}${piece ? "" : " vide"}">${piece ? echapper(piece.nom) : "Aucune pièce"}</div>
        ${piece ? `<div class="etiquette mods-titre">Mods</div><div class="mods">${mods}</div>` : ""}
      </div>
    </div>`;
}

function blocBonusSets(f: FicheBuild): string {
  const contenu =
    f.bonusSets.length === 0
      ? `<div class="aucun">Aucun bonus de set actif</div>`
      : f.bonusSets
          .map(
            (s) => `
      <div class="set">
        <div class="set-nom">${echapper(s.nomSet)}<span class="sep">·</span>${s.nbPieces} pièce${s.nbPieces > 1 ? "s" : ""}</div>
        ${s.paliers
          .map((p) => `<div class="palier"><span class="etiquette">${p.seuil} pièces</span><span>${echapper(p.nom)}</span></div>`)
          .join("")}
      </div>`
          )
          .join("");
  return `<div class="carte bonus"><div class="etiquette bleue">Bonus de set actifs</div>${contenu}</div>`;
}

function blocArmure(f: FicheBuild): string {
  const piece = (s: SlotArmure) => f.armure.find((p) => p.slot === s);
  // FR : ⚠️ CHANGÉ (28/09/2026, v0.2.8) - stats plus claires et plus
  // lisibles (demande de l'utilisateur) : nom en gris clair, valeur en
  // blanc et en gras, taille légèrement augmentée. Ordre et valeurs
  // inchangés (ORDRE_STATS, calcul de la fiche).
  // EN: ⚠️ CHANGED - brighter, more legible stats; order and values unchanged.
  const stats = f.stats
    .map((s) => `<span class="stat">${echapper(s.libelle)} <b>${s.valeur}</b></span>`)
    .join(`<span class="sep">·</span>`);
  return `
<section class="section">
  ${titreSection("ARMURE", `<span class="stats">${stats}</span>`, htmlLogoSection("armure"))}
  <div class="armure-grille">
    ${cartePieceArmure("casque", piece("casque"), 30)}
    ${cartePieceArmure("gants", piece("gants"), 30)}
    ${cartePieceArmure("torse", piece("torse"), 30)}
    ${cartePieceArmure("jambes", piece("jambes"), 30)}
  </div>
  <div class="armure-bas">
    ${cartePieceArmure("marque", piece("marque"), 34)}
    ${blocBonusSets(f)}
  </div>
</section>`;
}

/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.2.8) - répartition des perks d'artefact en
 * rangées ÉQUILIBRÉES (demande de l'utilisateur : « une ligne avec 3 perks et
 * une ligne avec 4 », comme un texte justifié). On part du plus petit nombre
 * de rangées (4 perks au plus par rangée), réparties à parts égales, les
 * rangées les plus courtes EN PREMIER (7 perks → 3 puis 4 ; 8 → 4 puis 4 ;
 * 5 → 2 puis 3). Si une rangée risque de déborder (noms longs, largeur
 * estimée à partir du nombre de caractères), on ajoute une rangée. Chaque
 * rangée occupe ensuite toute la largeur (puces étirées, voir CSS).
 * EN: ⚠️ ADDED - artifact perks split into BALANCED rows, shortest rows
 * first (7 → 3 then 4), each row stretched to full width like justified
 * text; one more row is added if a row might overflow.
 */
const LARGEUR_PERKS_ARTEFACT = 760; // FR : place disponible dans la carte (mesurée) / EN: available width (measured)
function largeurEstimeePuceArtefact(e: ElementFiche): number {
  // FR : ~6,1 px par caractère à 10,5 px, + marges internes, bordure et icône.
  return e.nom.length * 6.1 + 22 + (e.icone ? 15 : 0);
}
function repartirEnRangees(perks: ElementFiche[]): ElementFiche[][] {
  if (perks.length === 0) return [];
  for (let nbRangees = Math.ceil(perks.length / 4); nbRangees <= perks.length; nbRangees++) {
    const base = Math.floor(perks.length / nbRangees);
    const enPlus = perks.length % nbRangees; // FR : les DERNIÈRES rangées reçoivent un perk de plus
    const rangees: ElementFiche[][] = [];
    let debut = 0;
    for (let r = 0; r < nbRangees; r++) {
      const taille = base + (r >= nbRangees - enPlus ? 1 : 0);
      rangees.push(perks.slice(debut, debut + taille));
      debut += taille;
    }
    const tient = rangees.every(
      (rg) => rg.reduce((somme, e) => somme + largeurEstimeePuceArtefact(e), 0) + 6 * (rg.length - 1) <= LARGEUR_PERKS_ARTEFACT
    );
    if (tient) return rangees;
  }
  return perks.map((p) => [p]);
}

function blocArtefact(f: FicheBuild): string {
  const a = f.artefact;
  const contenu = a
    ? `
    ${icone(a.icone, 40)}
    <div class="artefact-texte">
      <div class="artefact-nom">${echapper(a.nom)}</div>
      <div class="etiquette">Perks sélectionnés</div>
      ${a.perks.length > 0
        ? `<div class="perks-artefact">${repartirEnRangees(a.perks)
            .map((rg) => `<div class="rangee-artefact">${rg.map((p) => `<span class="puce-artefact">${p.icone ? icone(p.icone, 12, "icone mini") : ""}${echapper(p.nom)}</span>`).join("")}</div>`)
            .join("")}</div>`
        : `<div class="aucun">—</div>`}
    </div>`
    : `${icone(undefined, 40)}<div class="artefact-texte"><div class="artefact-nom vide">Aucun artefact sélectionné</div></div>`;
  return `
<section class="section">
  ${titreSection("ARTEFACT", "", htmlLogoSection("artefact"))}
  <div class="carte artefact">${contenu}</div>
</section>`;
}

/** FR : largeur du filigrane dans la page d'export (900 px de large) : un peu plus des 4/5, 760 px. / EN: watermark width in the 900 px export page. */
const LARGEUR_FILIGRANE = 760;

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{background:#0b0e13}
/* FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - FILIGRANE (demande de l'utilisateur) : l'emblème
   vectoriel Forge Armory, centré sur la page, posé PAR-DESSUS le contenu à très faible
   opacité (le texte reste net). Le cadre .filigrane est rogné aux bords de la page
   (overflow hidden) : sur une fiche courte, l'emblème ne peut donc pas allonger la page
   ni fausser la mesure de hauteur de la capture. Vectoriel : net en JPEG/PNG (capture
   x2) et dans le PDF. Source : data/emblemeForgeArmory.ts.
   EN: WATERMARK: vector emblem centred over the content at very low opacity, clipped to
   the page so it can never lengthen a short sheet. */
.filigrane{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.filigrane svg{position:absolute;left:50%;top:50%;width:${LARGEUR_FILIGRANE}px;height:auto;transform:translate(-50%,-50%);opacity:${OPACITE_FILIGRANE}}
body{position:relative;width:${LARGEUR_EXPORT}px;padding:28px 28px 20px;background:linear-gradient(#0b0e13,#090c11);color:#e8e8e5;
  font-family:"Segoe UI","DejaVu Sans",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.carte{background:#171b23;border:1px solid #303746;border-radius:9px}
.etiquette{font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#9298a5}
.etiquette.bleue{color:#78a9ff}
.sep{margin:0 7px;color:#6c7280}
.point{margin:0 5px;color:#6c7280}
.vide,.aucun{color:#6c7280}
.aucun{font-size:10.5px;margin-top:6px}
.exotique{color:#d8b23d}
.icone{display:block;flex-shrink:0;overflow:hidden;background:#090c11;border:1px solid #303746;border-radius:6px}
.icone img{display:block;width:100%;height:100%;object-fit:cover}
.icone.petite{border-radius:9px}
.icone.mini{display:inline-block;vertical-align:-2px;margin-right:3px;border-radius:3px}
.entete{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:19px 22px 18px}
.entete h1{font-size:30px;font-weight:700;line-height:1.15;letter-spacing:.2px}
.sous-titre{margin-top:8px;font-size:14.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#78a9ff}
.sous-titre .sep{color:#78a9ff;margin:0 9px}
.sous-titre .auteur{text-transform:none;letter-spacing:.2px;font-weight:600;overflow-wrap:anywhere}
.entete>div:first-child{min-width:0}
.marque{text-align:right;white-space:nowrap;flex:0 0 auto}
.marque b{display:block;font-size:12px;letter-spacing:.6px;color:#9298a5}
.marque span{display:block;margin-top:6px;font-size:9.5px;letter-spacing:.4px;color:#838995}
.section{margin-top:20px}
.titre-section{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding-bottom:8px;margin-bottom:10px;border-bottom:1px solid #303746}
.titre-section h2{font-size:19px;font-weight:700;letter-spacing:.4px}
/* FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - logos de section et icônes du sous-titre (classe, élément, contexte). EN: section logos and subtitle icons. */
/* FR : ⚠️ CHANGÉ (12/10/2026, v0.4.1) - 34 px au lieu de 30 : la notice de l'archive v3 recommande au moins 32 px (à 24 px les détails fins se brouillent). EN: 34 px (the archive notice recommends at least 32 px). */
.logo-section{display:inline-flex;width:34px;height:34px;margin-right:10px;vertical-align:-10px}
.logo-section svg,.logo-contexte svg{width:100%;height:100%;display:block}
.logo-contexte{display:inline-flex;width:24px;height:24px;margin-right:7px;vertical-align:-6px}
.ic-classe{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;vertical-align:-5px;margin-right:7px;flex-shrink:0}
.ic-element{vertical-align:-5px;margin-right:7px;border-radius:3px}
.titre-section .droite{font-size:13px;color:#9298a5;text-align:right}
.stats{font-size:14px;color:#d3d6dc}
.stats b{color:#f4f4f2;font-weight:700}
.stats .sep{color:#7d8390}
.doctrine{padding:13px 16px 14px}
.doctrine-grille{display:grid;grid-template-columns:1fr 1fr;column-gap:24px;row-gap:7px}
.doctrine-ligne{display:flex;align-items:center;gap:8px}
.valeur{font-size:13px;margin-top:1px}
.doctrine-listes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:16px;margin-top:13px;padding-top:11px;border-top:1px solid #232834}
.liste{display:grid;grid-auto-flow:column;column-gap:16px;row-gap:5px;margin-top:6px}
.liste-bloc.fragments{grid-column:span 2}
.liste-element{display:flex;align-items:center;gap:8px;min-height:20px;min-width:0;font-size:12px}
.liste-element .icone{border-radius:4px}
.armes{display:flex;flex-direction:column;gap:10px}
.arme{display:grid;grid-template-columns:366px 1fr;gap:12px;min-height:143px;padding:12px 16px 12px 12px}
.arme-info{display:flex;align-items:flex-start;gap:12px}
.arme-nom{font-size:16.5px;font-weight:700;margin-top:4px}
.arme-ligne{display:flex;align-items:center;gap:8px;min-height:20px;margin-top:6px;font-size:12px;color:#d3d6dc}
.arme-element{display:flex;align-items:center;gap:8px;height:22px;margin-top:5px;font-size:11.5px;color:#9298a5}
.type-arme{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:30px;height:22px}
.type-arme svg{display:block;overflow:visible}
.element{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:22px}
.element img{display:block;width:18px;height:18px}
.munition{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:22px}
.munition svg{display:block}
.element-texte{line-height:22px}
.champion{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:22px}
.champion svg{display:block}
.perks{display:grid;grid-template-columns:1fr 1fr;column-gap:20px;row-gap:7px;margin-top:9px}
.puce{display:flex;align-items:center;gap:7px;min-height:31px;padding:4px 8px;background:#12161d;border:1px solid #303746;border-radius:6px;font-size:12px}
.armure-grille{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.armure-bas{display:grid;grid-template-columns:325px 1fr;gap:10px;margin-top:10px}
.piece{display:flex;align-items:flex-start;gap:9px;min-height:73px;padding:10px 12px 10px 10px}
.armure-bas .piece{min-height:102px}
.piece-nom{font-size:13.5px;font-weight:700;margin-top:4px}
.mods-titre{margin-top:6px;font-size:8px}
.mods{margin-top:3px;font-size:10px;line-height:1.6}
.mod{white-space:nowrap}
.fois{font-weight:700;color:#f4f4f2}
.bonus{padding:11px 12px}
.set{margin-top:6px}
.set-nom{font-size:12.5px;font-weight:700}
.palier{display:grid;grid-template-columns:66px 1fr;align-items:baseline;margin-top:7px;font-size:10px}
.palier .etiquette{font-size:8.5px}
.artefact{display:flex;align-items:flex-start;gap:12px;padding:14px 16px 16px 12px;min-height:104px}
.artefact-texte{flex:1;min-width:0}
.artefact-nom{font-size:16px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;margin:3px 0 6px}
.perks-artefact{display:flex;flex-direction:column;gap:6px;margin-top:9px}
.rangee-artefact{display:flex;flex-wrap:wrap;gap:6px}
.rangee-artefact .puce-artefact{flex:1 1 auto;justify-content:center;white-space:nowrap}
.puce-artefact{display:inline-flex;align-items:center;padding:5px 9px;background:#12161d;border:1px solid #303746;border-radius:5px;font-size:10.5px}
footer{display:flex;justify-content:space-between;margin-top:34px;padding-top:9px;border-top:1px solid #1d222c;font-size:9px;letter-spacing:.4px;color:#838995}
`;

/**
 * FR : page HTML complète et autonome de la fiche, prête à être capturée
 * (PNG) ou imprimée (PDF). Déterministe : mêmes données, même page.
 * EN: complete standalone HTML page of the sheet, ready to be captured (PNG)
 * or printed (PDF). Deterministic: same data, same page.
 */
export function ficheVersHtml(f: FicheBuild, versionApp: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${ORIGINE_ICONES}; style-src 'unsafe-inline'">
<title>${echapper(f.nom)}</title>
<style>${CSS}</style></head>
<body>
<div class="filigrane" aria-hidden="true">${emblemeSvg("fa-export")}</div>
${blocEntete(f)}
${blocDoctrine(f)}
${blocArmes(f)}
${blocArmure(f)}
${blocArtefact(f)}
<footer><span>FORGE ARMORY · DESTINY 2 BUILD ANALYZER · EXPORT INFOGRAPHIQUE</span><span>v${echapper(versionApp)}</span></footer>
</body></html>`;
}

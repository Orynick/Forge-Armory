// FR : ⚠️ AJOUT (08/10/2026, v0.3.18) - OUTIL pour modifier le TEXTE des titres illustrés (qui est dessiné en tracés, pas en police) en réutilisant les lettres des titres existants de l'utilisateur : extrait chaque lettre d'un titre, la déplace,
// recompose un texte et recalcule le soulignage. Utilisé par `retoucher-visuels.mjs` (renumérotation des cartes du Scoring) et par le test des visuels. Aucune police n'est nécessaire : seules les lettres DÉJÀ dessinées sont réutilisées.
// Hypothèses vérifiées par `diagnostiquer` : chemins en coordonnées ABSOLUES (M L H V C Z), une lettre = un groupe de sous-chemins qui se recouvrent en abscisse (le trou d'un « O », l'accent d'un « É »), et deux occurrences d'une
// même lettre ont exactement la même forme dans tous les fichiers.
// EN: ⚠️ ADDED - tool to change the TEXT of the illustrated titles (drawn as outlines): extracts each letter, moves it, recomposes a text and recomputes the underline, reusing only letters already drawn.

const NB = { M: 2, L: 2, H: 1, V: 1, C: 6 };

export function trouverTexte(svg) {
  let meilleur = null;
  for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
    const balise = m[0];
    if (!/silverText/.test(balise) || /\bopacity=/.test(balise)) continue;
    const d = /\bd="([^"]+)"/.exec(balise)?.[1];
    if (d && (!meilleur || d.length > meilleur.d.length)) meilleur = { balise, d, index: m.index };
  }
  if (!meilleur) throw new Error("tracé du texte introuvable");
  return meilleur;
}

export function analyserChemin(d) {
  const jetons = d.match(/[A-Za-z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g);
  const sous = []; let cur = null; let cmd = null; let i = 0;
  while (i < jetons.length) {
    const t = jetons[i];
    if (/[A-Za-z]/.test(t)) {
      i++;
      if (t === "Z") { cur.segs.push({ c: "Z", n: [] }); cmd = null; continue; }
      if (!(t in NB)) throw new Error(`commande de tracé non gérée : ${t}`);
      cmd = t;
      if (cmd === "M") { cur = { segs: [] }; sous.push(cur); }
      const nb = NB[cmd]; cur.segs.push({ c: cmd, n: jetons.slice(i, i + nb).map(Number) }); i += nb;
    } else {
      if (cmd === null) throw new Error("nombres sans commande");
      const nb = NB[cmd]; cur.segs.push({ c: cmd === "M" ? "L" : cmd, n: jetons.slice(i, i + nb).map(Number) }); i += nb;
    }
  }
  for (const s of sous) {
    const xs = [], ys = [];
    for (const g of s.segs) {
      if (g.c === "H") xs.push(g.n[0]);
      else if (g.c === "V") ys.push(g.n[0]);
      else g.n.forEach((v, k) => (k % 2 === 0 ? xs : ys).push(v));
    }
    s.xmin = Math.min(...xs); s.xmax = Math.max(...xs); s.ymin = Math.min(...ys); s.ymax = Math.max(...ys);
  }
  return sous;
}

const fmt = (v) => String(Number(v.toFixed(4)));
export function serialiser(sous) {
  return sous.map((s) => s.segs.map((g) => (g.c === "Z" ? "Z" : g.c + g.n.map(fmt).join(" "))).join("")).join("");
}

export function deplacer(sous, dx) {
  return sous.map((s) => ({
    ...s, xmin: s.xmin + dx, xmax: s.xmax + dx,
    segs: s.segs.map((g) => (g.c === "V" || g.c === "Z" ? g : g.c === "H" ? { c: "H", n: [g.n[0] + dx] } : { c: g.c, n: g.n.map((v, k) => (k % 2 === 0 ? v + dx : v)) })),
  }));
}

/** Regroupe les sous-chemins en lettres (recouvrement en abscisse). */
export function lettres(sous) {
  const tries = [...sous].sort((a, b) => a.xmin - b.xmin); const groupes = [];
  for (const s of tries) {
    const g = groupes[groupes.length - 1];
    if (g && s.xmin < g.xmax - 0.5) { g.sous.push(s); g.xmax = Math.max(g.xmax, s.xmax); g.ymin = Math.min(g.ymin, s.ymin); g.ymax = Math.max(g.ymax, s.ymax); }
    else groupes.push({ sous: [s], xmin: s.xmin, xmax: s.xmax, ymin: s.ymin, ymax: s.ymax });
  }
  return groupes;
}

/** Les lettres d'un titre, étiquetées par les caractères (sans les espaces) du texte attendu. */
export function lettresEtiquetees(svg, texte) {
  const { d } = trouverTexte(svg); const g = lettres(analyserChemin(d)); const car = [...texte.replace(/ /g, "")];
  if (g.length !== car.length) throw new Error(`« ${texte} » : ${g.length} lettres trouvées pour ${car.length} caractères`);
  return g.map((x, i) => ({ ...x, car: car[i], indice: i }));
}

/** Forme d'une lettre indépendante de sa position (pour comparer deux occurrences). */
export const formeNormalisee = (g) => serialiser(deplacer(g.sous, -g.xmin));

/** Espace entre la lettre précédente et la lettre courante (bord droit → bord gauche). */
export const ecart = (lettresFichier, iPrec, iCur) => lettresFichier[iCur].xmin - lettresFichier[iPrec].xmax;

/** Compose un texte : plan = [{ lettre, ecart }] (l'écart du premier est ignoré). Retourne les sous-chemins, positionnés à partir de x = 0. */
export function composer(plan) {
  const sous = []; let xDroit = 0; let xmin = 0;
  plan.forEach((p, i) => {
    const debut = i === 0 ? 0 : xDroit + p.ecart;
    sous.push(...deplacer(p.lettre.sous, debut - p.lettre.xmin));
    xDroit = debut + (p.lettre.xmax - p.lettre.xmin);
  });
  return { sous, xmin, xmax: xDroit };
}

/** Centre un texte composé sur `centre`. */
export function centrer(texte, centre) {
  const dx = centre - (texte.xmin + texte.xmax) / 2;
  return { sous: deplacer(texte.sous, dx), xmin: texte.xmin + dx, xmax: texte.xmax + dx };
}

/** Le tracé du soulignage (deux segments de part et d'autre du cristal, `opacity="0.9"`). */
export function trouverSoulignage(svg) {
  const m = /<path\b[^>]*\bopacity="0\.9"[^>]*>/.exec(svg);
  if (!m) throw new Error("soulignage introuvable");
  return { balise: m[0], d: /\bd="([^"]+)"/.exec(m[0])[1], index: m.index };
}

/**
 * Bords d'un titre : le soulignage couvre la « boîte d'avancement » du texte, légèrement plus large que les lettres, différemment selon la première et la dernière lettre. Retourne ce qui dépasse à gauche
 * (`lsb`, pour la première lettre) et à droite (`rsb`, pour la dernière). Le soulignage est centré sur 4264,4 dans tous les titres.
 */
export function mesurerBords(svg, texte) {
  const L = lettresEtiquetees(svg, texte); const n = trouverSoulignage(svg).d.match(/-?\d*\.?\d+/g).map(Number);
  return { premiere: L[0].car, derniere: L[L.length - 1].car, lsb: L[0].xmin - n[0], rsb: n[10] - L[L.length - 1].xmax };
}

/** Nouveau soulignage de xg à xd, sur le modèle de l'ancien (mêmes ordonnées, même pointe, même ouverture autour du cristal). */
export function souligner(modele, xg, xd) {
  const n = modele.match(/-?\d*\.?\d+/g).map(Number);
  if (n.length !== 20) throw new Error(`soulignage : 20 nombres attendus, ${n.length} trouvés`);
  const pointe = n[2] - n[0]; const f = (v) => v.toFixed(1);
  const seg = (a) => `M ${f(a[0])} ${f(a[1])} L ${f(a[2])} ${f(a[3])} L ${f(a[4])} ${f(a[5])} L ${f(a[6])} ${f(a[7])} L ${f(a[8])} ${f(a[9])} Z`;
  return seg([xg, n[1], xg + pointe, n[3], n[4], n[5], n[6], n[7], xg + pointe, n[9]]) + " " + seg([xd, n[11], xd - pointe, n[13], n[14], n[15], n[16], n[17], xd - pointe, n[19]]);
}

/** Remplace l'attribut `d` d'une balise `<path>` repérée par son index dans le SVG. */
export function remplacerD(svg, index, balise, nouveauD) {
  const nouvelle = balise.replace(/\bd="[^"]+"/, () => `d="${nouveauD}"`);
  return svg.slice(0, index) + nouvelle + svg.slice(index + balise.length);
}

/** Centre horizontal commun des soulignages. */
export const CENTRE_TITRE = 4264.4;

export const TEXTES = {
  "blocs-repliables/titre-connexion-deplie.svg": "CONNEXION À BUNGIE",
  "blocs-repliables/titre-manifest-deplie.svg": "RECHERCHE DANS LE MANIFEST",
  "blocs-repliables/titre-inventaire-deplie.svg": "MON INVENTAIRE",
  "blocs-repliables/titre-doctrine-deplie.svg": "DOCTRINE ET ÉLÉMENT",
  "blocs-repliables/titre-mon-build-deplie.svg": "MON BUILD",
  "blocs-repliables/titre-artefact-deplie.svg": "ARTEFACT",
  "blocs-repliables/titre-sauvegarde-deplie.svg": "SAUVEGARDE ET PARTAGE DU BUILD",
  "titres/titre-contexte-0.svg": "0. CONTEXTE DU BUILD",
  "titres/titre-contexte-ligne.svg": "CONTEXTE DU BUILD",
  "titres/titre-1-element-doctrine.svg": "1. ÉLÉMENT ET DOCTRINE",
  "titres/titre-2-artefact.svg": "2. ARTEFACT",
  "titres/titre-3-armes-armures.svg": "3. ARMES ET ARMURES",
  "titres/titre-4-effets-build.svg": "4. EFFETS DU BUILD",
  "titres/titre-5-statistiques.svg": "5. STATISTIQUES",
  "titres/titre-score-global.svg": "SCORE GLOBAL",
};

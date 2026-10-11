// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - rangée de boutons TOUS À LA MÊME TAILLE (demande de l'utilisateur,
// pour la sélection de l'élément de la Doctrine : Solaire, Arc, Vide, Stase, Brins, Prismatique avaient six
// largeurs différentes, de 92 à 166 px selon le libellé).
//
// Principe : la largeur d'un bouton dépend du libellé ET de la police ; une largeur écrite en dur serait
// fausse avec une autre police. On MESURE donc, hors écran, la largeur naturelle de chaque bouton, et on
// donne à tous celle du plus large. Si la rangée est trop étroite pour tout contenir, elle se répartit en
// rangées ÉQUILIBRÉES (6 boutons : 3 + 3, pas 5 + 1). La hauteur est commune par construction (une grille
// étire les cellules d'une même rangée). Remesure quand les polices finissent de charger et quand le
// conteneur change de taille.
//
// `rendre(item, style)` dessine UN bouton : le composant lui passe le style de mise en page (largeur
// naturelle pour la mesure, 100 % de la cellule à l'affichage). Le bouton garde sa propre apparence.
// Avant la première mesure (instantanée), l'ancien affichage (rangée libre) sert de repli.
// EN: ⚠️ ADDED - a row of buttons ALL THE SAME SIZE. Natural widths are measured off-screen and the widest
// is applied to all; too narrow a row wraps into BALANCED rows (3 + 3, not 5 + 1).

import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react";

interface Props<T> {
  items: T[];
  cle: (item: T) => string;
  /**
   * FR : dessine UN bouton. `niveau` (0 = le plus lisible) : ⚠️ AJOUT (06/10/2026) - niveau de COMPACITÉ choisi pour la rangée, voir `niveaux`.
   * EN: draws ONE button. `niveau` (0 = most legible): the compactness level chosen for the row.
   */
  rendre: (item: T, style: CSSProperties, niveau: number) => ReactNode;
  /** FR : espace entre les boutons, en px. / EN: gap between buttons, px. */
  ecart?: number;
  style?: CSSProperties;
  /**
   * FR : ⚠️ AJOUT (06/10/2026) - nombre de NIVEAUX DE COMPACITÉ que `rendre` sait dessiner (défaut : 1, comportement d'avant). Demande de l'utilisateur : les six
   * boutons d'élément de la Doctrine devaient tenir sur UNE ligne ; sur son écran ils restaient sur deux. Le composant mesure la largeur naturelle des boutons à chaque
   * niveau et retient le MOINS compact qui tient sur une seule ligne ; si aucun ne tient, le niveau 0 (le plus lisible) en rangées équilibrées.
   * EN: ⚠️ ADDED - number of compactness LEVELS `rendre` can draw (default 1, as before): the least compact one that fits on a single row is chosen.
   */
  niveaux?: number;
  /** FR : ⚠️ AJOUT (06/10/2026) - affiche une ligne de diagnostic (mode développement) : place disponible, largeur d'un bouton, colonnes, niveau retenu. / EN: shows a diagnostic line (dev mode). */
  diagnostic?: boolean;
}

/**
 * FR : disposition à partir de la largeur du plus large (`largeur`), de celle du conteneur, du nombre de
 * boutons et de l'écart. Fonction PURE, testée à part. Colonnes : tout sur une ligne si ça tient ; sinon
 * rangées équilibrées. Jamais moins d'une colonne, même si un bouton déborde seul.
 * EN: layout from the widest width, the container width, the count and the gap. Pure function.
 */
export function calculerDisposition(largeur: number, conteneur: number, nombre: number, ecart: number): { largeur: number; colonnes: number } {
  const l = Math.max(1, Math.ceil(largeur));
  if (nombre <= 0) return { largeur: l, colonnes: 1 };
  const tient = Math.max(1, Math.floor((conteneur + ecart) / (l + ecart)));
  if (tient >= nombre) return { largeur: l, colonnes: nombre };
  const rangees = Math.ceil(nombre / tient);
  return { largeur: l, colonnes: Math.ceil(nombre / rangees) };
}

/**
 * FR : ⚠️ AJOUT (06/10/2026) - choisit le niveau de compacité à partir de la largeur du plus large bouton À CHAQUE NIVEAU (`largeurs[k]`, du plus lisible au plus compact).
 * Retient le premier niveau (le moins compact) dont les boutons tiennent tous sur UNE ligne ; sinon le niveau 0 en rangées équilibrées. Fonction PURE, testée à part.
 * EN: ⚠️ ADDED - picks the compactness level from the widest button's width AT EACH LEVEL: the first one that fits on one row, else level 0 in balanced rows.
 */
export function choisirDisposition(
  largeurs: readonly number[],
  conteneur: number,
  nombre: number,
  ecart: number
): { niveau: number; largeur: number; colonnes: number } {
  if (largeurs.length === 0) return { niveau: 0, ...calculerDisposition(1, conteneur, nombre, ecart) };
  const dispositions = largeurs.map((l) => calculerDisposition(l, conteneur, nombre, ecart));
  const uneLigne = dispositions.findIndex((d) => d.colonnes >= nombre);
  const niveau = uneLigne >= 0 ? uneLigne : 0;
  return { niveau, ...dispositions[niveau] };
}

export default function RangeeBoutonsEgaux<T>({ items, cle, rendre, ecart = 8, style, niveaux = 1, diagnostic = false }: Props<T>) {
  const refRangee = useRef<HTMLDivElement>(null);
  // FR : ⚠️ CORRIGÉ (05/10/2026) - `useRef<HTMLDivElement | null>(null)` (et non `useRef<HTMLDivElement>(null)`) : avec les types React 18 du projet,
  // seule cette forme donne une référence MODIFIABLE ; l'autre est en lecture seule, et l'affectation `refMesure.current = el` faisait échouer
  // `npm run build` (TS2540), alors que `npm run dev` ne vérifie pas les types. `refRangee`, lui, n'est jamais affecté à la main (attribut `ref`).
  // EN: ⚠️ FIXED - `useRef<HTMLDivElement | null>(null)` gives a MUTABLE ref with React 18 types; the other form is read-only.
  const refMesure = useRef<HTMLDivElement | null>(null);
  const [mise, setMise] = useState<{ largeur: number; colonnes: number; niveau: number; disponible: number } | null>(null);

  useLayoutEffect(() => {
    const calculer = () => {
      const rangee = refRangee.current;
      const mesure = refMesure.current;
      if (!rangee || !mesure || items.length === 0) return;
      // FR : une sous-rangée de mesure par niveau de compacité ; la largeur d'un niveau = celle de son bouton le plus large.
      const parNiveau = Array.from(mesure.children).map((sousRangee) =>
        Array.from(sousRangee.children).map((c) => (c as HTMLElement).getBoundingClientRect().width)
      );
      if (parNiveau.length === 0 || parNiveau.some((l) => l.length === 0 || l.some((w) => !(w > 0)))) return; // FR : pas encore dessiné (onglet masqué...) : on garde le repli / EN: not drawn yet
      const choix = choisirDisposition(parNiveau.map((l) => Math.max(...l)), rangee.clientWidth, items.length, ecart);
      const suivante = { ...choix, disponible: rangee.clientWidth };
      setMise((avant) =>
        avant && avant.largeur === suivante.largeur && avant.colonnes === suivante.colonnes && avant.niveau === suivante.niveau && avant.disponible === suivante.disponible
          ? avant
          : suivante
      );
    };
    calculer();
    document.fonts?.ready.then(calculer).catch(() => undefined);
    const observateur = typeof ResizeObserver !== "undefined" ? new ResizeObserver(calculer) : null;
    if (refRangee.current) observateur?.observe(refRangee.current);
    return () => observateur?.disconnect();
  }, [items.length, ecart, niveaux]);

  const disposition: CSSProperties = mise
    ? { display: "grid", gridTemplateColumns: `repeat(${mise.colonnes}, ${mise.largeur}px)`, gap: ecart, justifyContent: "start" }
    : { display: "flex", flexWrap: "wrap", gap: ecart };

  return (
    <div style={{ position: "relative", ...style }}>
      {/* FR : rangée visible. Largeur commune dès la première mesure. */}
      <div ref={refRangee} style={disposition}>
        {items.map((item) => (
          <div key={cle(item)} style={{ display: "flex", minWidth: 0 }}>
            {rendre(item, mise ? { width: "100%", minWidth: 0 } : { flex: "0 0 auto", minWidth: 90 }, mise?.niveau ?? 0)}
          </div>
        ))}
      </div>
      {/* FR : ⚠️ AJOUT (06/10/2026, mode développement) - ce que la rangée a mesuré : à copier dans le chat si elle reste sur deux lignes. / EN: ⚠️ ADDED (dev mode) - what the row measured. */}
      {diagnostic && mise && (
        <div style={{ fontSize: "0.66rem", color: "#5a5f6b", fontFamily: "monospace", marginTop: 2 }} data-diagnostic-rangee="">
          [dev] rangée de {items.length} boutons : place disponible {mise.disponible} px · bouton {mise.largeur} px · {mise.colonnes} par rangée · niveau de compacité{" "}
          {mise.niveau + 1}/{Math.max(1, niveaux)}
        </div>
      )}
      {/* FR : rangée de MESURE : mêmes boutons, largeur naturelle. Cachée par l'OPACITÉ du groupe (0), pas par
      `visibility: hidden` : un enfant peut annuler `visibility` (la règle `.carte-classe.selectionnee .coche`
      rend sa coche visible même dans un parent masqué : une coche fantôme est apparue lors du premier essai,
      05/10/2026), alors qu'aucun enfant ne peut contourner l'opacité d'un parent. Rendue aussi inactive
      (`inert` : ni clic, ni focus, ni lecteur d'écran) et hors de la mise en page (position absolue).
      EN: MEASURING row: same buttons, natural width. Hidden by GROUP OPACITY (0), not `visibility: hidden`, which a
      child can override (a ghost check mark appeared in the first trial). Also `inert`. */}
      <div
        ref={(el) => {
          refMesure.current = el;
          el?.setAttribute("inert", "");
        }}
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: 0, opacity: 0, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: ecart }}
        data-mesure=""
      >
        {/* FR : ⚠️ CHANGÉ (06/10/2026) - une sous-rangée par NIVEAU de compacité (même boutons, dessinés à ce niveau), pour en mesurer la largeur naturelle. / EN: one sub-row per compactness level. */}
        {Array.from({ length: Math.max(1, niveaux) }, (_, k) => (
          <div key={k} data-niveau={k} style={{ display: "flex", width: "max-content", gap: ecart }}>
            {items.map((item) => (
              <div key={cle(item)} style={{ display: "flex" }}>
                {rendre(item, { flex: "0 0 auto", minWidth: 0 }, k)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

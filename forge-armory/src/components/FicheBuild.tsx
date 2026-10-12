// FR : ⚠️ AJOUT (27/09/2026, v0.2.3) - fenêtre « fiche du build », ouverte par
// le bouton « 👁 Voir » d'un loadout. Lecture seule : doctrine, armes,
// armure (avec stats totales), artefact, puis trois actions : exporter le
// fichier, copier en texte, fermer. Données assemblées par
// `lib/loadouts/fiche.ts`, partagé avec la version texte.
// Présentation calquée sur RappelDoctrine (même fond, mêmes couleurs).
// EN: ⚠️ ADDED - read-only "build sheet" window, opened from a loadout's
// "View" button. Data built by lib/loadouts/fiche.ts, shared with the text copy.

import { ReactNode, useEffect } from "react";
import { ElementFiche, FicheBuild as DonneesFiche, PieceFiche } from "../lib/loadouts/fiche";
import { FILTRE_STASE_VERS_FILOBSCUR } from "../data/teinteIconesDoctrine";   // ⚠️ AJOUT (12/10/2026, v0.4.1)
import BarrePartage from "./BarrePartage";
import Filigrane from "./Filigrane";
import IconeMunition, { MUNITIONS } from "./icones/IconeMunition";
import IconeAntiChampion from "./icones/IconeAntiChampion";
import { calculerTailleRendu, trouverFormeTypeArme } from "./icones/IconeTypeArme";

interface Props {
  fiche: DonneesFiche;
  onExporter: () => void;
  onFermer: () => void;
}

const GRIS = "#7d7a70";
const TEXTE_SECONDAIRE = "#b7b3a8";
const BORDURE = "#2a2e38";
const OR_EXOTIQUE = "#d4af37";

function Miniature({ src, taille = 24, filtre }: { src?: string; taille?: number; filtre?: string }) {
  return src ? (
    <img src={src} alt="" width={taille} height={taille} style={{ borderRadius: 3, flexShrink: 0, filter: filtre }} />
  ) : (
    <span style={{ width: taille, height: taille, borderRadius: 3, background: "#0d0f14", border: `1px solid ${BORDURE}`, flexShrink: 0 }} />
  );
}

function Titre({ children }: { children: string }) {
  return (
    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: TEXTE_SECONDAIRE, margin: "0.9rem 0 0.35rem", borderBottom: `1px solid ${BORDURE}`, paddingBottom: "0.2rem" }}>
      {children}
    </div>
  );
}

function Pastilles({ elements }: { elements: ElementFiche[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.2rem" }}>
      {elements.map((e, i) => (
        <span
          key={`${e.nom}-${i}`}
          // FR : ⚠️ AJOUT (05/10/2026) - effet du perk d'artefact au survol (voir lib/artefacts/infobulle.ts).
          // EN: ⚠️ ADDED - artifact perk effect on hover.
          title={e.infobulle}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.72rem", padding: "0.1rem 0.4rem", border: `1px solid ${BORDURE}`, borderRadius: 4 }}
        >
          {e.icone && <img src={e.icone} alt="" width={14} height={14} style={{ borderRadius: 2 }} />}
          {e.nom}
          {/* FR : ⚠️ AJOUT (30/09/2026, v0.2.8) - doublons regroupés, comme dans l'export. / EN: grouped duplicates, as in the export. */}
          {(e.nombre ?? 1) > 1 && <strong> ×{e.nombre}</strong>}
        </span>
      ))}
    </div>
  );
}

function estArmeFiche(piece: PieceFiche): boolean {
  return piece.slot === "cinetique" || piece.slot === "energie" || piece.slot === "lourde";
}

/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - rangée d'icônes sous le nom d'une arme,
 * dans le MÊME ORDRE que l'export infographique (demande de l'utilisateur) :
 * type d'arme → élément → munitions → anti-champion. Mêmes sources que
 * l'export : `trouverFormeTypeArme`/`calculerTailleRendu` pour le type,
 * l'icône officielle de l'élément (nom écrit en repli si elle manque),
 * `MUNITIONS` pour les munitions, les tracés anti-champion de l'appli.
 * Chaque icône a un emplacement de taille fixe : les colonnes restent
 * alignées d'une arme à l'autre, même si une icône manque.
 * EN: ⚠️ ADDED - icon row under a weapon's name, SAME ORDER and sources as
 * the export; fixed-size slots keep columns aligned across weapons.
 */
function RangeeIconesArme({ piece }: { piece: PieceFiche }) {
  const forme = trouverFormeTypeArme(piece.typeArme, piece.slot, piece.munition, piece.categories, piece.typeSecours);
  const tailleType = forme ? calculerTailleRendu(forme.viewBox, 22) : undefined;
  const emplacement = (largeur: number, contenu: ReactNode, titre?: string) => (
    <span title={titre} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: largeur, height: 18, flexShrink: 0 }}>
      {contenu}
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
      {emplacement(
        26,
        forme && tailleType ? (
          <svg viewBox={forme.viewBox} width={tailleType.largeur} height={tailleType.hauteur} fill="#c9ccd3" style={{ overflow: "visible" }}>
            <path d={forme.d} />
          </svg>
        ) : null,
        piece.typeArme
      )}
      {piece.elementIcone
        ? emplacement(16, <img src={piece.elementIcone} alt="" width={16} height={16} />, piece.element)
        : piece.element
          ? <span style={{ color: GRIS, fontSize: "0.7rem" }}>{piece.element}</span>
          : emplacement(16, null)}
      {emplacement(
        16,
        piece.munition ? <IconeMunition cle={MUNITIONS[piece.munition].cle} taille={16} couleur={MUNITIONS[piece.munition].couleur} /> : null
      )}
      {piece.antiChampion ? emplacement(16, <IconeAntiChampion type={piece.antiChampion} taille={16} couleur="#c9ccd3" />) : null}
    </div>
  );
}

/**
 * FR : ⚠️ AJOUT (30/09/2026, v0.2.8) - ligne « Armature » ou « Origine »
 * sous le nom d'une arme, comme dans l'export (demande de l'utilisateur :
 * mêmes règles pour la fiche « 👁 Voir » que pour les images et le PDF).
 * Icône et texte centrés sur la même ligne, bord gauche aligné sur le nom.
 * EN: ⚠️ ADDED - "Frame" or "Origin" row under a weapon's name, as in the export.
 */
function LigneSous({ libelle, element }: { libelle: string; element: ElementFiche }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.2rem", fontSize: "0.74rem" }}>
      {element.icone ? <img src={element.icone} alt="" width={14} height={14} style={{ borderRadius: 2, flexShrink: 0 }} /> : null}
      <span style={{ color: GRIS, fontSize: "0.68rem" }}>{libelle} :</span>
      <span>{element.nom}</span>
    </div>
  );
}

function LignePiece({ piece, motPerks }: { piece: PieceFiche; motPerks: string }) {
  // FR : ⚠️ CHANGÉ (30/09/2026, v0.2.8) - liste nettoyée commune (fiche.ts) ;
  // armature et origine affichées à part, sous le nom.
  // EN: ⚠️ CHANGED - shared cleaned list; frame and origin shown apart.
  const perks = piece.perks;
  return (
    <div style={{ display: "flex", gap: "0.5rem", padding: "0.35rem 0", borderTop: `1px solid ${BORDURE}` }}>
      <Miniature src={piece.icone} taille={32} />
      <div style={{ minWidth: 0 }}>
        {/* FR : ⚠️ CHANGÉ (30/09/2026, v0.2.9) - ligne en flex pour aligner
        l'icône de munitions (après l'élément) sur le centre du texte.
        EN: ⚠️ CHANGED - flex row to align the ammo icon with the text. */}
        <div style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: "0.3rem" }}>
          <span style={{ color: GRIS, fontSize: "0.7rem" }}>{piece.emplacement} ·</span>
          <span style={{ color: piece.exotique ? OR_EXOTIQUE : undefined }}>
            {piece.exotique ? "★ " : ""}
            {piece.nom}
          </span>
        </div>
        {/* FR : ⚠️ CHANGÉ (30/09/2026, v0.2.9) - l'élément n'est plus écrit :
        rangée d'icônes identique à l'export (voir RangeeIconesArme). Armure :
        aucune rangée.
        EN: ⚠️ CHANGED - element no longer written: icon row identical to the export. */}
        {estArmeFiche(piece) && <RangeeIconesArme piece={piece} />}
        {piece.armature && <LigneSous libelle="Armature" element={piece.armature} />}
        {piece.origine && <LigneSous libelle="Origine" element={piece.origine} />}
        {perks.length > 0 ? (
          <Pastilles elements={perks} />
        ) : (
          <div style={{ fontSize: "0.7rem", color: GRIS }}>{motPerks} : non disponibles</div>
        )}
      </div>
    </div>
  );
}

export default function FicheBuild({ fiche, onExporter, onFermer }: Props) {
  // FR : fermeture avec la touche Échap, comme une fenêtre classique.
  // EN: close with Escape.
  useEffect(() => {
    const surTouche = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onFermer]);

  const entete = [fiche.classe, fiche.element].filter(Boolean).join(" · ");

  return (
    <div
      onClick={onFermer}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,15,20,0.75)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        // FR : un clic DANS la fiche ne doit pas la fermer (seul le fond le fait).
        // EN: a click INSIDE the sheet must not close it (only the backdrop does).
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(94vw, 620px)",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#161922",
          border: "1px solid #3a3f4b",
          borderRadius: 10,
          padding: "1rem 1.25rem",
        }}
      >
        {/* FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - enveloppe `relative` autour de TOUT le contenu,
        pour que le filigrane (emblème Forge Armory) soit centré sur la fiche entière.
        EN: ⚠️ ADDED - `relative` wrapper around ALL content, so the watermark is centred on the whole sheet. */}
        <div style={{ position: "relative" }}>
        <Filigrane />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
          <div>
            <strong style={{ fontSize: "1rem" }}>{fiche.nom}</strong>
            <div style={{ fontSize: "0.75rem", color: GRIS }}>
              {/* FR : ⚠️ CHANGÉ (06/10/2026) - « par pseudo#1234 » dans la même ligne, seulement si l'auteur est connu : aucune ligne de plus, donc aucune hauteur de plus. / EN: ⚠️ CHANGED - "par handle" inline, only when known. */}
              {[entete, `Contexte : ${fiche.contexte}`, fiche.auteur ? `par ${fiche.auteur}` : "", fiche.enregistreLe ? `enregistré le ${fiche.enregistreLe}` : ""].filter(Boolean).join(" — ")}
            </div>
          </div>
          <button onClick={onFermer} title="Fermer (Échap)" style={{ background: "none", border: "none", color: GRIS, cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        </div>
        {fiche.description && <p style={{ fontSize: "0.78rem", color: TEXTE_SECONDAIRE, margin: "0.5rem 0 0" }}>{fiche.description}</p>}

        <Titre>Doctrine</Titre>
        {!fiche.manifestDisponible ? (
          <p style={{ fontSize: "0.75rem", color: GRIS, margin: 0 }}>
            Chargez le Manifest pour afficher les noms de la doctrine.
          </p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.4rem" }}>
              {fiche.doctrine.map((d) => (
                <div key={d.libelle} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <Miniature src={d.valeur?.icone} filtre={d.valeur?.teinteFilobscur ? FILTRE_STASE_VERS_FILOBSCUR : undefined} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.68rem", color: GRIS }}>{d.libelle}</div>
                    <div style={{ fontSize: "0.78rem", color: d.valeur ? undefined : GRIS }}>{d.valeur?.nom ?? "—"}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.72rem", color: GRIS, marginTop: "0.5rem" }}>Aspects ({fiche.aspects.length})</div>
            {fiche.aspects.length > 0 ? <Pastilles elements={fiche.aspects} /> : <div style={{ fontSize: "0.72rem", color: GRIS }}>—</div>}
            <div style={{ fontSize: "0.72rem", color: GRIS, marginTop: "0.4rem" }}>Fragments ({fiche.fragments.length})</div>
            {fiche.fragments.length > 0 ? <Pastilles elements={fiche.fragments} /> : <div style={{ fontSize: "0.72rem", color: GRIS }}>—</div>}
          </>
        )}

        <Titre>Armes</Titre>
        {fiche.armes.length === 0 ? (
          <p style={{ fontSize: "0.75rem", color: GRIS, margin: 0 }}>Aucune arme dans ce build.</p>
        ) : (
          fiche.armes.map((p, i) => <LignePiece key={`a${i}`} piece={p} motPerks="Perks" />)
        )}

        <Titre>Armure</Titre>
        {fiche.armure.length === 0 ? (
          <p style={{ fontSize: "0.75rem", color: GRIS, margin: 0 }}>Aucune pièce d'armure dans ce build.</p>
        ) : (
          <>
            {fiche.armure.map((p, i) => <LignePiece key={`r${i}`} piece={p} motPerks="Mods" />)}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "0.3rem", marginTop: "0.4rem" }}>
              {fiche.stats.map((s) => (
                <div key={s.libelle} style={{ fontSize: "0.72rem", textAlign: "center", border: `1px solid ${BORDURE}`, borderRadius: 4, padding: "0.15rem" }}>
                  <span style={{ color: GRIS }}>{s.libelle}</span> {s.valeur}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.65rem", color: GRIS, marginTop: "0.2rem" }}>Stats totales : armure + bonus de doctrine, comme dans Mon Build.</div>
          </>
        )}

        <Titre>Artefact</Titre>
        {fiche.artefact ? (
          <>
            <div style={{ fontSize: "0.8rem" }}>{fiche.artefact.nom}</div>
            {fiche.artefact.perks.length > 0 ? (
              <Pastilles elements={fiche.artefact.perks} />
            ) : (
              <div style={{ fontSize: "0.72rem", color: GRIS }}>Aucun perk choisi.</div>
            )}
          </>
        ) : (
          <p style={{ fontSize: "0.75rem", color: GRIS, margin: 0 }}>Aucun artefact choisi.</p>
        )}

        {/* FR : ⚠️ CHANGÉ (28/09/2026, v0.2.8) - boutons de partage extraits dans
        BarrePartage, partagée avec le bloc « Partage du build » du tableau de
        bord. Comportement identique ; « Fermer » reste en fin de rangée.
        EN: ⚠️ CHANGED - sharing buttons extracted into BarrePartage. */}
        <div style={{ marginTop: "1rem" }}>
          <BarrePartage
            fiche={fiche}
            onExporterJson={onExporter}
            fin={
              <button onClick={onFermer} style={{ fontSize: "0.78rem", marginLeft: "auto" }}>
                Fermer
              </button>
            }
          />
        </div>
        </div>
      </div>
    </div>
  );
}

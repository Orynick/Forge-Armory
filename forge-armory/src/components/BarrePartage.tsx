// FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - barre de partage d'un build : fichier
// JSON (réimportable), texte pur, images JPEG/PNG et PDF. EXTRAITE de la
// fiche « 👁 Voir » (FicheBuild.tsx), où elle vivait depuis la v0.2.3/0.2.5,
// pour servir aussi au nouveau bloc « Partage du build » du tableau de bord
// (demande de l'utilisateur : exporter sans devoir sauvegarder le build).
// Un seul composant, donc les deux endroits se comportent à l'identique.
// EN: ⚠️ ADDED - build sharing bar (JSON, plain text, JPEG/PNG/PDF),
// EXTRACTED from the "View" sheet to also serve the new "share build" block.

import { ReactNode, useState } from "react";
import { FicheBuild, ficheEnTexte } from "../lib/loadouts/fiche";
import { ficheVersHtml } from "../lib/loadouts/exportFiche";
import { nomFichierPropre } from "../lib/loadouts/stockage";

interface Props {
  fiche: FicheBuild;
  /** FR : export du fichier JSON réimportable (le contenu dépend de l'appelant). / EN: JSON export. */
  onExporterJson: () => void;
  /** FR : éléments ajoutés en fin de rangée (ex. le bouton « Fermer » de la fiche). / EN: items appended to the row. */
  fin?: ReactNode;
  /**
   * FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - présentation. « rangee » (par défaut) : la rangée de
   * boutons de la fiche « Voir » et du bloc « Partage du build », INCHANGÉE. « liste » : une
   * liste verticale de choix (Copie texte, Export JPEG, PNG, PDF, JSON), pour la fenêtre
   * « Exporter... » des Loadouts. La logique (copie et son repli, génération des images et
   * du PDF, messages) est la MÊME dans les deux cas.
   * EN: ⚠️ ADDED - layout. "rangee" (default) is the unchanged button row; "liste" is a
   * vertical list of choices for the Loadouts "Export..." window. Same logic in both.
   */
  disposition?: "rangee" | "liste";
}

const TEXTE_SECONDAIRE = "#b7b3a8";

export default function BarrePartage({ fiche, onExporterJson, fin, disposition = "rangee" }: Props) {
  const [messageCopie, setMessageCopie] = useState<string | null>(null);
  // FR : repli si le presse-papiers refuse l'écriture : le texte s'affiche
  // dans une zone déjà sélectionnée, il reste à faire Ctrl+C.
  // EN: fallback if the clipboard refuses: text shown pre-selected.
  const [texteManuel, setTexteManuel] = useState<string | null>(null);
  const [exportEnCours, setExportEnCours] = useState<"jpeg" | "png" | "pdf" | null>(null);
  const [messageExport, setMessageExport] = useState<string | null>(null);
  const exportDisponible = Boolean(window.appBureau?.exporterFiche);
  // FR : confirmation de l'export JSON, affichée seulement en présentation « liste » (la
  // rangée de « Voir » n'en affichait pas : elle reste inchangée). / EN: JSON confirmation, "liste" layout only.
  const [messageJson, setMessageJson] = useState<string | null>(null);

  async function copierTexte() {
    const texte = ficheEnTexte(fiche);
    try {
      await navigator.clipboard.writeText(texte);
      setMessageCopie("✅ Copié : il ne reste qu'à coller (Ctrl+V).");
      setTexteManuel(null);
    } catch {
      setMessageCopie("⚠️ Copie automatique refusée : sélectionnez le texte ci-dessous puis Ctrl+C.");
      setTexteManuel(texte);
    }
  }

  /**
   * FR : export de la fiche en image ou PDF (maquette v7). La page est
   * construite par `ficheVersHtml` à partir des mêmes données, puis le
   * logiciel en tire l'image ou le PDF (electron/main.cjs). Réservé au
   * logiciel installé.
   * EN: image or PDF export of the sheet, desktop only.
   */
  async function exporterInfographie(format: "jpeg" | "png" | "pdf") {
    const pont = window.appBureau;
    if (!pont?.exporterFiche || exportEnCours) return;
    setExportEnCours(format);
    setMessageExport(format === "pdf" ? "Génération du PDF…" : "Génération de l'image…");
    try {
      const resultat = await pont.exporterFiche(ficheVersHtml(fiche, __VERSION_APP__), format, `fiche-d2-${nomFichierPropre(fiche.nom)}`);
      setMessageExport(resultat.annule ? null : `✅ Enregistré : ${resultat.chemin}`);
    } catch (erreur) {
      setMessageExport(`⚠️ Export impossible : ${erreur instanceof Error ? erreur.message : String(erreur)}`);
    } finally {
      setExportEnCours(null);
    }
  }

  const bouton = (format: "jpeg" | "png" | "pdf", libelle: string, aide: string) => (
    <button
      onClick={() => exporterInfographie(format)}
      disabled={!exportDisponible || exportEnCours !== null}
      style={{ fontSize: "0.78rem" }}
      title={exportDisponible ? aide : "Disponible dans le logiciel installé"}
    >
      {libelle}
    </button>
  );

  if (disposition === "liste") {
    const choix = (libelle: string, aide: string, onClick: () => void, desactive = false) => (
      <button
        key={libelle}
        onClick={onClick}
        disabled={desactive}
        title={aide}
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.1rem", width: "100%", textAlign: "left", padding: "0.45rem 0.7rem", fontSize: "0.82rem" }}
      >
        <span>{libelle}</span>
        {/* FR : texte d'aide en opacité réduite, SANS couleur imposée : un gris fixe était presque invisible sur le fond gris des boutons (constaté à l'aperçu, 01/10/2026). / EN: reduced opacity instead of a fixed grey, which was nearly invisible on the grey button background. */}
        <span style={{ fontSize: "0.68rem", opacity: 0.72 }}>{aide}</span>
      </button>
    );
    const aideImage = (aide: string) => (exportDisponible ? aide : "Disponible dans le logiciel installé");
    const enCours = exportEnCours !== null;
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {choix("📋 Copie texte", "Copie la fiche en texte simple, à coller sur Discord ou ailleurs", copierTexte)}
          {choix("🖼 Export JPEG", aideImage("Fiche illustrée en image JPEG (1800 px de large)"), () => exporterInfographie("jpeg"), !exportDisponible || enCours)}
          {choix("🖼 Export PNG", aideImage("Fiche illustrée en image PNG (1800 px de large)"), () => exporterInfographie("png"), !exportDisponible || enCours)}
          {choix("📄 Export PDF", aideImage("Fiche illustrée en PDF, même présentation que l'image"), () => exporterInfographie("pdf"), !exportDisponible || enCours)}
          {choix(
            "⬇ Export JSON",
            "Fichier à réimporter avec « Importer » dans les Loadouts",
            () => {
              onExporterJson();
              setMessageJson("✅ Fichier JSON envoyé vers vos téléchargements.");
            }
          )}
        </div>
        {messageCopie && <p style={{ fontSize: "0.72rem", color: TEXTE_SECONDAIRE, margin: "0.6rem 0 0" }}>{messageCopie}</p>}
        {messageExport && <p style={{ fontSize: "0.72rem", color: TEXTE_SECONDAIRE, margin: "0.6rem 0 0", wordBreak: "break-all" }}>{messageExport}</p>}
        {messageJson && <p style={{ fontSize: "0.72rem", color: TEXTE_SECONDAIRE, margin: "0.6rem 0 0" }}>{messageJson}</p>}
        {texteManuel && (
          <textarea
            readOnly
            value={texteManuel}
            ref={(zone) => zone?.select()}
            style={{ width: "100%", minHeight: "160px", marginTop: "0.4rem", fontSize: "0.72rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #2a2e38", borderRadius: 6, boxSizing: "border-box" }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={onExporterJson} style={{ fontSize: "0.78rem" }} title="Enregistre ce build dans un fichier, à importer avec « Importer »">
          ⬇ Exporter le fichier
        </button>
        <button onClick={copierTexte} style={{ fontSize: "0.78rem" }} title="Copie la fiche en texte simple, à coller sur Discord ou ailleurs">
          📋 Copier en texte
        </button>
        {bouton("jpeg", "🖼 Image JPEG", "Fiche illustrée en image JPEG, le format d'image le plus répandu (1800 px de large)")}
        {bouton("png", "🖼 Image PNG", "Fiche illustrée en image PNG (1800 px de large)")}
        {bouton("pdf", "📄 PDF", "Fiche illustrée en PDF, même présentation que l'image")}
        {fin}
      </div>
      {messageCopie && <p style={{ fontSize: "0.72rem", color: TEXTE_SECONDAIRE, margin: "0.5rem 0 0" }}>{messageCopie}</p>}
      {messageExport && <p style={{ fontSize: "0.72rem", color: TEXTE_SECONDAIRE, margin: "0.5rem 0 0", wordBreak: "break-all" }}>{messageExport}</p>}
      {texteManuel && (
        <textarea
          readOnly
          value={texteManuel}
          ref={(zone) => zone?.select()}
          style={{ width: "100%", minHeight: "160px", marginTop: "0.4rem", fontSize: "0.72rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #2a2e38", borderRadius: 6 }}
        />
      )}
    </>
  );
}

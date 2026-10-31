// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - VITRINE « Solo sans mourir » du TIROIR latéral gauche, extraite de `PanneauTriomphes.tsx` (qui redevient le tiroir d'origine, sans aucune navigation croisée vers la Carrière). Le contenu ouvert du tiroir est repris TEL QUEL (diagnostics dev, liste des 11 donjons, bandes de 32 px) : seule la navigation croisée disparaît. Utilisée DEUX FOIS : dans le tiroir (PanneauTriomphes) et, en pleine page, dans la page « Accomplissements » (VueAccomplissements), où elle est le SEUL contenu : la page dédiée aux Triomphes du compte affiche cette vitrine, plus le tiroir reste disponible depuis le Build Analyzer.
// EN: ⚠️ ADDED - the "Solo Flawless" showcase, extracted from PanneauTriomphes (which goes back to the plain drawer). Used twice: in the drawer and, full-page, in the "Accomplishments" page.
import { useEffect, useState } from "react";
import { EtatTriomphe, lireTriomphesSoloFlawless } from "../lib/bungie/triomphes";
import { Database } from "sql.js";
import { urlIcone } from "../lib/manifest/search";
import { obtenirDefinition } from "../lib/manifest/download";

interface Props {
  /** FR : profil complet renvoyé par l'API (composant 900 inclus). null tant qu'il n'est pas chargé. / EN: full profile from the API (component 900 included). */
  profil: unknown | null;
  /** FR : Manifest, pour résoudre les emblèmes des donjons. / EN: Manifest, to resolve the dungeon emblems. */
  db?: Database | null;
}

export default function VitrineSoloFlawless({ profil, db }: Props) {
  const [triomphes, setTriomphes] = useState<EtatTriomphe[]>([]);
  // FR : ⚠️ RETIRÉ (23/10/2026, audit) - les 3 diagnostics archivés (etat brut, définition de triomphe, vérification des emblèmes) et leur state ont été supprimés : résolus, archivés dans `diagnosticsArchives.ts`. / EN: ⚠️ REMOVED - the 3 archived diagnostics and their state are gone (resolved).

  useEffect(() => {
    if (!profil) {
      setTriomphes([]);
      return;
    }
    setTriomphes(lireTriomphesSoloFlawless(profil));
  }, [profil]);

  const accomplis = triomphes.filter((t) => t.accompli);

  return (
    <>
      {/* FR : ⚠️ RETIRÉ (23/10/2026, audit) - les 3 blocs de diagnostic archivés (état brut, définition de triomphe, vérification des emblèmes) ont été supprimés : résolus, archivés dans `lib/diagnosticsArchives.ts`. / EN: ⚠️ REMOVED - the 3 archived diagnostic blocks are gone (resolved). */}
      {!profil && (
        <p style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
          Connectez-vous pour afficher vos donjons accomplis.
        </p>
      )}

      {profil != null && (
        <>
          <p style={{ fontSize: "0.78rem", color: "#b7b3a8", margin: "0 0 0.6rem" }}>
            <strong style={{ color: "#e8e6df" }}>
              {accomplis.length}/{triomphes.length}
            </strong>{" "}
            donjon{accomplis.length > 1 ? "s" : ""} terminé{accomplis.length > 1 ? "s" : ""} en solo, sans
            mourir.
          </p>

          {/* FR : ⚠️ CHANGÉ (25/08/2026) - retour à UNE SEULE COLONNE
          (demande explicite de l'utilisateur), mais en bandes FINES à
          hauteur FIXE plutôt que les vignettes carrées de la grille à 2
          colonnes essayée juste avant. Contrainte posée par l'utilisateur :
          voir les 11 sans défiler. Une hauteur fixe par ligne (32px)
          garantit une hauteur TOTALE prévisible (11 × ~34px ≈ 375px avec
          l'espacement) quelle que soit la largeur du panneau - contrairement
          à `aspectRatio`, qui aurait fait varier la hauteur avec la largeur
          disponible. Le nom du donjon reste superposé sur l'image (déjà
          demandé), mais aligné à gauche plutôt qu'en bas, la bande étant
          trop fine pour un texte en bas d'image.
          EN: back to a SINGLE COLUMN, but as thin FIXED-HEIGHT strips. */}
          {/* FR : ⚠️ CORRIGÉ (25/08/2026) - le nom du donjon doit rester
          À L'INTÉRIEUR de l'emblème (signalé comme bug par l'utilisateur
          après la version précédente, qui l'avait sorti à droite en
          élément séparé). L'image redevient pleine largeur. L'alignement
          à droite EST conservé, mais réalisé différemment : un ESPACEUR
          de largeur FIXE (130px, identique sur les 11 lignes) précède le
          texte plutôt qu'un padding - c'est cet espaceur qui garantit
          à la fois que le texte se tient vers la droite de l'image ET que
          les 11 premières lettres s'alignent verticalement, quel que soit
          le contenu de chaque emblème. Toujours interdit de passer sur 2
          lignes (`whiteSpace: nowrap` + `textOverflow: ellipsis`).
          EN: the dungeon name must stay INSIDE the emblem. */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {triomphes.map((t) => {
              const def = db
                ? obtenirDefinition<{
                    displayProperties?: { icon?: string };
                    secondaryIcon?: string;
                  }>(db, "DestinyInventoryItemDefinition", t.emblemeHash)
                : undefined;
              const urlLarge = urlIcone(def?.secondaryIcon);
              const urlPetite = urlIcone(def?.displayProperties?.icon);
              const url = urlLarge ?? urlPetite;
              return (
                <div
                  key={t.hash}
                  title={t.emblemeSubstitution ? "Emblème de substitution (pas de récompense dédiée pour ce donjon)" : "Emblème débloqué par ce triomphe"}
                  style={{
                    position: "relative",
                    borderRadius: 3,
                    overflow: "hidden",
                    height: 32,
                    flexShrink: 0,
                    background: "#0d0f14",
                    opacity: t.accompli ? 1 : 0.35,
                    filter: t.accompli ? "none" : "grayscale(1)",
                  }}
                >
                  {url && (
                    <img
                      src={url}
                      alt=""
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* FR : espaceur transparent de largeur FIXE - ni bordure
                    ni fond visible, sert uniquement à pousser le texte vers
                    la droite au même endroit sur les 11 lignes. */}
                    <div style={{ width: 130, flexShrink: 0 }} />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.3) 100%)",
                        padding: "0 0.4rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: t.accompli ? "#e8e6df" : "#b7b3a8",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.donjon}
                        {t.emblemeSubstitution && <span style={{ color: "#7d7a70" }}> *</span>}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

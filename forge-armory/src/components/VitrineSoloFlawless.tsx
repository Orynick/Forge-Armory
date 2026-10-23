// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - VITRINE « Solo sans mourir » du TIROIR latéral gauche, extraite de `PanneauTriomphes.tsx` (qui redevient le tiroir d'origine, sans aucune navigation croisée vers la Carrière). Le contenu ouvert du tiroir est repris TEL QUEL (diagnostics dev, liste des 11 donjons, bandes de 32 px) : seule la navigation croisée disparaît. Utilisée DEUX FOIS : dans le tiroir (PanneauTriomphes) et, en pleine page, dans la page « Accomplissements » (VueAccomplissements), où elle est le SEUL contenu : la page dédiée aux Triomphes du compte affiche cette vitrine, plus le tiroir reste disponible depuis le Build Analyzer.
// EN: ⚠️ ADDED - the "Solo Flawless" showcase, extracted from PanneauTriomphes (which goes back to the plain drawer). Used twice: in the drawer and, full-page, in the "Accomplishments" page.
import { useEffect, useState } from "react";
import { EtatTriomphe, lireTriomphesSoloFlawless } from "../lib/bungie/triomphes";
import { TRIOMPHES_SOLO_FLAWLESS } from "../data/triomphesSoloFlawless";
import { Database } from "sql.js";
import { obtenirDefinitionTriompheBrute, urlIcone } from "../lib/manifest/search";
import { obtenirDefinition } from "../lib/manifest/download";
import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";

interface Props {
  /** FR : profil complet renvoyé par l'API (composant 900 inclus). null tant qu'il n'est pas chargé. / EN: full profile from the API (component 900 included). */
  profil: unknown | null;
  /** FR : ⚠️ AJOUT (24/08/2026) - nécessaire pour le diagnostic ponctuel de définition de triomphe (idée d'emblèmes en tableau de chasse). / EN: needed for the one-off triumph definition diagnostic. */
  db?: Database | null;
}

interface ProfilAvecRecordsBruts {
  Response?: {
    profileRecords?: { data?: { records?: Record<string, { state?: number; objectives?: unknown }> } };
    // FR : ⚠️ AJOUT (24/08/2026) - `characterRecords`, jamais lu jusqu'ici.
    // Hypothèse à vérifier : les 6 triomphes ABSENTS de `profileRecords`
    // (dont « Flèche de la vigie », que l'utilisateur possède pourtant)
    // pourraient avoir une PORTÉE PERSONNAGE plutôt que profil - certains
    // triomphes Bungie sont déposés par personnage plutôt qu'au niveau
    // compte. Le composant 900 (Records) renvoie normalement les deux
    // structures dans la même réponse, jamais exploitée côté character.
    // EN: `characterRecords`, never read until now.
    characterRecords?: { data?: Record<string, { records?: Record<string, { state?: number }> }> };
  };
}

export default function VitrineSoloFlawless({ profil, db }: Props) {
  const [triomphes, setTriomphes] = useState<EtatTriomphe[]>([]);
  // FR : ⚠️ AJOUT (24/08/2026) - diagnostic (mode dev) pour le bug signalé :
  // "Flèche de la vigie" affiché en gris alors que l'utilisateur a le
  // triomphe. Le hash (4032136335) et la logique de lecture ont été
  // revérifiés et semblent corrects - plutôt que de deviner une correction
  // à l'aveugle sur un seul cas isolé, ce diagnostic montre la donnée BRUTE
  // renvoyée par l'API pour ce triomphe précis.
  // EN: diagnostic (dev mode) for the reported bug: "Spire of the
  // Watcher" shown grey despite the user having the triumph.
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

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
      {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.etatBrutTriomphes && profil != null && (
        <button
          onClick={() => {
            const reponse = (profil as ProfilAvecRecordsBruts)?.Response;
            const records = reponse?.profileRecords?.data?.records ?? {};
            const parPersonnage = reponse?.characterRecords?.data ?? {};
            const lignes = TRIOMPHES_SOLO_FLAWLESS.map(({ hash, donjon }) => {
              const entree = records[String(hash)];
              if (entree) return `${donjon} (hash ${hash}) : PROFIL, state=${entree.state} | brut=${JSON.stringify(entree)}`;

              // FR : ⚠️ AJOUT (24/08/2026) - si absent du profil, on cherche
              // maintenant aussi dans chaque personnage, pour vérifier
              // l'hypothèse de la portée personnage.
              for (const [idPerso, donnees] of Object.entries(parPersonnage)) {
                const entreePerso = donnees.records?.[String(hash)];
                if (entreePerso) {
                  return `${donjon} (hash ${hash}) : PERSONNAGE ${idPerso}, state=${entreePerso.state} | brut=${JSON.stringify(entreePerso)}`;
                }
              }
              return `${donjon} (hash ${hash}) : ABSENT de profileRecords ET de tous les characterRecords`;
            });
            setDiagnostic(lignes.join("\n"));
          }}
          style={{ fontSize: "0.7rem", marginBottom: "0.6rem" }}
        >
          🔍 Diagnostic état brut (dev)
        </button>
      )}
      {/* FR : ⚠️ AJOUT (24/08/2026) - diagnostic ponctuel pour la future
      vitrine des emblèmes (idée de l'utilisateur : "tableau de chasse").
      Affiche la DÉFINITION COMPLÈTE d'un triomphe (pas son état joueur),
      pour voir exactement où la récompense est déclarée, plutôt que de
      deviner un nom de champ.
      EN: one-off diagnostic for the future emblem showcase. */}
      {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.definitionCompleteTriomphe && db != null && (
        <button
          onClick={() => {
            // FR : un seul triomphe (Le Trône brisé) suffit pour voir la
            // structure - si la récompense y figure, le même champ existera
            // sur les 10 autres.
            const brut = obtenirDefinitionTriompheBrute(db, 3205009787);
            setDiagnostic(brut ?? "Définition introuvable pour ce hash.");
          }}
          style={{ fontSize: "0.7rem", marginBottom: "0.6rem", marginLeft: "0.4rem" }}
        >
          🏆 Définition complète d'un triomphe (dev)
        </button>
      )}
      {/* FR : ⚠️ AJOUT (24/08/2026) - diagnostic des 11 emblèmes, suite au
      signalement de l'utilisateur : Prophétie et Dogme fragmenté n'affichent
      aucune icône alors que les 9 autres fonctionnent avec le MÊME code.
      Vérifie, pour chaque hash, si la définition existe dans le Manifest et
      si elle déclare bien une icône - permet de distinguer un hash erroné
      d'une définition sans icône.
      EN: diagnostic for the 11 emblems. */}
      {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.verificationEmblemes && db != null && (
        <button
          onClick={() => {
            const lignes = TRIOMPHES_SOLO_FLAWLESS.map(({ donjon, emblemeHash }) => {
              const def = obtenirDefinition<{
                displayProperties?: { name?: string; icon?: string };
                secondaryIcon?: string;
              }>(db, "DestinyInventoryItemDefinition", emblemeHash);
              if (!def) return `${donjon} (${emblemeHash}) : ❌ INTROUVABLE dans le Manifest`;
              const nom = def.displayProperties?.name ?? "(sans nom)";
              const petite = def.displayProperties?.icon ? "oui" : "NON";
              const large = def.secondaryIcon ? "oui" : "NON";
              return `${donjon} (${emblemeHash}) : "${nom}" — image large: ${large}, icône simple: ${petite}`;
            });
            setDiagnostic(lignes.join("\n"));
          }}
          style={{ fontSize: "0.7rem", marginBottom: "0.6rem", marginLeft: "0.4rem" }}
        >
          🖼️ Vérifier les 11 emblèmes (dev)
        </button>
      )}
      {diagnostic && (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.65rem", background: "#0d0f14", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem", marginBottom: "0.6rem", maxHeight: "200px", overflow: "auto" }}>
          {diagnostic}
        </pre>
      )}

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

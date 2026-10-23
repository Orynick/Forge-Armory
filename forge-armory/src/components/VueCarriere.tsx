// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - PAGE « CARRIÈRE » du compte, en REMPLACEMENT de la modale `ModaleCarriere` (supprimée) : le bouton « Carrière » du bloc Connexion ouvre désormais cette page, le bloc Connexion et le sélecteur de vues (4 onglets) restent affichés (le bug §25 — pop-up qui ne s'ouvrait pas hors Build Analyzer — est résolu par construction : plus de pop-up du tout). ⚠️ Cette page N'EST PAS un onglet du sélecteur de vues (retour utilisateur : « les boutons apparaissent en double ») : elle n'y figure pas, seul le bloc Connexion porte le bouton.
// Contenu repris TEL QUEL de l'ancienne modale (spécification du 14/10/2026) : statistiques d'usage du compte en LECTURE SEULE, chargées à l'OUVERTURE de l'onglet (la page n'est montée que quand l'onglet est actif — aucun appel réseau au chargement de l'appli). Aucune persistance : la vue est à la demande, rafraîchie à chaque ouverture (les données d'usage évoluent en continu, un cache local présenterait des chiffres périmés).
// Sections : temps de jeu (total et par classe), personnages (puissance), 10 dernières activités, stats « Carrière » du compte (bloc allTime de GetHistoricalStats, characterId = 0 : l'équivalent du filtre « Carrière » des Emblèmes du jeu — les filtres Tout/Semaine/Saison ne sont PAS repris). Chaque section s'affiche INDÉPENDAMMENT : une donnée manquante affiche « non disponible », jamais une estimation (règle du projet). ⚠️ La partie « Compte » (pseudo, plateformes liées) a été SUPPRIMÉE le 21/10/2026 (demande de l'utilisateur : « la partie Compte peut disparaître » — le pseudo reste affiché dans le bloc Connexion).
// EN: ⚠️ ADDED - the account "Career" PAGE (view-selector tab), replacing the ModaleCarriere pop-up; same content, loaded on tab open, read-only.

import { useCallback, useEffect, useState } from "react";
import { chargerCarriere, DonneesCarriere, formaterDiagnosticCarriere } from "../lib/bungie/carriere";
import type { DestinyMembership, Personnage } from "../lib/bungie/api";
import IconeClasse from "./icones/IconeClasse";   // ⚠️ AJOUT (21/10/2026, demande de l'utilisateur : « utilise les assets d'icônes de classes de personnages »)
import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";

// FR : libellés des statIds affichés. La liste est FIGÉE depuis la réponse
// réelle de l'API pour ce compte (même démarche que le composant 310 et les
// filigranes de saison) : le diagnostic dev ci-dessous liste les statIds
// bruts réellement retournés pour figer/étendre la sélection.
// EN: labels of the displayed statIds, frozen from the real API response.
const STATS_AFFICHEES: { statId: string; libelle: string }[] = [
  { statId: "kills", libelle: "Éliminations" },
  { statId: "precisionKills", libelle: "Éliminations de précision" },
  { statId: "meleeKills", libelle: "Mêlée" },
  { statId: "superKills", libelle: "Super" },
  { statId: "weaponKills", libelle: "Armes" },
  { statId: "abilityKills", libelle: "Capacités" },
  { statId: "deaths", libelle: "Morts" },
  { statId: "suicides", libelle: "Suicides" },
  { statId: "assists", libelle: "Assistances" },
  { statId: "killsDeathsRatio", libelle: "K/D" },
  { statId: "killsDeathsAssists", libelle: "Efficacité" },
  { statId: "combatRating", libelle: "Score de combat" },
  { statId: "secondsPlayed", libelle: "Temps de jeu (s)" },
  { statId: "activitiesEntered", libelle: "Activités commencées" },
  { statId: "activitiesCleared", libelle: "Activités terminées" },
  { statId: "objectivesCompleted", libelle: "Objectifs accomplis" },
  { statId: "winLossRatio", libelle: "Ratio victoires/défaites" },
  { statId: "resurrectionsPerformed", libelle: "Résurrections" },
  { statId: "resurrectionsReceived", libelle: "Résurrections reçues" },
];

const NON_DISPONIBLE = "non disponible";

function formaterDuree(secondes: number | null): string | null {
  if (secondes == null || !Number.isFinite(secondes) || secondes <= 0) return null;
  const h = Math.floor(secondes / 3600);
  const m = Math.round((secondes % 3600) / 60);
  if (h <= 0) return `${m} min`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
}

function formaterDate(iso: string | null): string {
  if (!iso) return NON_DISPONIBLE;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NON_DISPONIBLE;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// FR : ⚠️ AJOUT (21/10/2026, demande de l'utilisateur) - icônes de CLASSES de personnages : les mêmes que partout dans l'appli (`IconeClasse`, couleurs de classe). Les noms de classe viennent de l'API déjà localisés (« Titan », « Chasseur », « Arcaniste ») ; une classe inconnue (« ? ») n'a pas d'icône. / EN: class icons, same component as the rest of the app.
const CLES_CLASSE: Record<string, "titan" | "chasseur" | "arcaniste"> = { titan: "titan", chasseur: "chasseur", arcaniste: "arcaniste" };
function iconeDeClasse(nom: string) {
  const cle = CLES_CLASSE[nom.toLowerCase()];
  return cle ? <IconeClasse classe={cle} taille={22} /> : null;
}

interface Props {
  membership: DestinyMembership | null;
  personnages: Personnage[];
  profil: unknown | null;
}

export default function VueCarriere({ membership, personnages, profil }: Props) {
  const [donnees, setDonnees] = useState<DonneesCarriere | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [diagOuvert, setDiagOuvert] = useState(false);   // ⚠️ CHANGÉ (21/10/2026) : un vrai bouton à bascule (avant : texte vide = rien à afficher)

  const charger = useCallback(async () => {
    if (!membership) return;
    setEnCours(true);
    setErreur(null);
    try {
      const d = await chargerCarriere(membership, personnages, profil);
      setDonnees(d);
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership?.membershipId, personnages, profil]);

  useEffect(() => {
    charger();
  }, [charger]);

  const stat = (statId: string) => donnees?.stats.find((s) => s.statId === statId) ?? null;

  const totalMinutes =
    donnees?.minutesParClasse?.reduce((acc, l) => acc + (Number.isFinite(l.minutes) ? l.minutes : 0), 0) ?? null;

  return (
    /* FR : ⚠️ CHANGÉ (22/10/2026, TODO §25) - une PAGE (carte pleine largeur, comme la page Forge), plus de modale : le bloc Connexion et le sélecteur de vues restent affichés au-dessus. ⚠️ 21/10/2026 : le bouton « Accomplissements » qui était à droite du titre de la modale est RETIRÉ — la navigation vers les Accomplissements se fait par le BOUTON du même nom dans le bloc Connexion (plus de navigation croisée modale/tiroir). / EN: a full-width page card, no modal; the cross-navigation button is gone (the Connection block's button replaces it). */
    <div className="pilier-carte" role="region" aria-label="Carrière">
      <h3>
        <span>Carrière</span>
        {membership && <span style={{ fontWeight: "normal", color: "#b7b3a8" }}>{membership.displayName}</span>}
      </h3>

      {!membership && (
        <p style={{ fontSize: "0.85rem", color: "#7d7a70", margin: "0 0 0.6rem" }}>
          Connectez-vous pour afficher les statistiques de votre compte.
        </p>
      )}
      {enCours && <p style={{ margin: "0 0 0.6rem" }}>⏳ Chargement de votre carrière…</p>}
      {erreur && (
        <p style={{ margin: "0 0 0.6rem", color: "#e08070" }}>
          Une partie des données n'a pas pu être chargée : {erreur}. Les sections disponibles s'affichent ci-dessous.
        </p>
      )}

      <Section titre="Temps de jeu">
        <Ligne libelle="Total" valeur={totalMinutes != null ? formaterDuree(totalMinutes * 60) ?? NON_DISPONIBLE : NON_DISPONIBLE} />
        {(donnees?.minutesParClasse ?? []).length > 0 ? (
          donnees!.minutesParClasse!.map((l, i) => (
            <Ligne key={`${l.classe}-${i}`} libelle={l.classe} icone={iconeDeClasse(l.classe)} valeur={formaterDuree(l.minutes * 60) ?? NON_DISPONIBLE} />
          ))
        ) : (
          <Ligne libelle="Par classe" valeur={NON_DISPONIBLE} />
        )}
      </Section>

      <Section titre="Personnages">
        {personnages.length > 0 ? (
          personnages.map((p) => <Ligne key={p.characterId} libelle={p.classe} icone={iconeDeClasse(p.classe)} valeur={`puissance ${p.lumiere}`} />)
        ) : (
          <Ligne libelle="Niveaux" valeur={NON_DISPONIBLE} />
        )}
        <Ligne libelle="Saison en cours" valeur={NON_DISPONIBLE} />
      </Section>

      <Section titre="10 dernières activités">
        {donnees && donnees.activites.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.15rem" }}>
            {donnees.activites.map((a) => (
              <li key={a.instanceId || `${a.referenceId}-${a.periode}`}>
                {formaterDate(a.periode)} — {a.mode != null ? `type ${a.mode}` : "type " + NON_DISPONIBLE}
                {a.dureeSecondes != null ? ` (${formaterDuree(a.dureeSecondes)})` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <Ligne libelle="Activités" valeur={enCours ? "…" : NON_DISPONIBLE} />
        )}
      </Section>

      <Section titre="Statistiques de carrière">
        {donnees && donnees.stats.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.15rem 1rem" }}>
            {STATS_AFFICHEES.map(({ statId, libelle }) => {
              const s = stat(statId);
              const valeur =
                s?.valeur != null
                  ? s.valeur.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
                  : s?.precision != null
                    ? s.precision.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
                    : NON_DISPONIBLE;
              return <Ligne key={statId} libelle={libelle} valeur={valeur} />;
            })}
          </div>
        ) : (
          <Ligne libelle="Éliminations, précision, K/D…" valeur={enCours ? "…" : NON_DISPONIBLE} />
        )}
        {/* FR : ⚠️ CHANGÉ (21/10/2026, retour de l'utilisateur : « le diagnostic statIds retournés ne s'ouvre pas ») - bouton À BASCULE (il s'ouvre et se ferme) dont le contenu s'affiche TOUJOURS : avant, une liste vide donnait un texte vide, donc RIEN à l'écran, et l'erreur de la requête était avalée. Le diagnostic dit maintenant : statIds retournés (ou AUCUN), requête, erreur, structure de la réponse. Réservé au développement. / EN: a real toggle whose content always shows. Dev only. */}
        {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.statIdsCarriere && donnees && (
          <div style={{ marginTop: "0.5rem" }}>
            <button type="button" aria-expanded={diagOuvert} aria-controls="diagnostic-statids-carriere" data-diagnostic-statids-bouton="" onClick={() => setDiagOuvert((o) => !o)} style={{ fontSize: "0.7rem" }}>
              🔍 Diagnostic : statIds retournés (dev) {diagOuvert ? "▲" : "▼"}
            </button>
            {diagOuvert && (
              <pre id="diagnostic-statids-carriere" data-diagnostic-statids="" style={{ fontSize: "0.7rem", whiteSpace: "pre-wrap", margin: "0.4rem 0 0", color: "#9a968c" }}>{formaterDiagnosticCarriere(donnees)}</pre>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section style={{ borderTop: "1px solid #2a2e38", padding: "0.55rem 0" }}>
      <strong style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>{titre}</strong>
      <div style={{ fontSize: "0.85rem" }}>{children}</div>
    </section>
  );
}

function Ligne({ libelle, valeur, icone }: { libelle: string; valeur: string; icone?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ color: "#b7b3a8", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>{icone}{libelle}</span>
      <span style={{ color: "#e8e6df", textAlign: "right" }}>{valeur}</span>
    </div>
  );
}

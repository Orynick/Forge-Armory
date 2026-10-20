// FR : ⚠️ AJOUT (20/10/2026, v0.4.14) - vue « CARRIÈRE » du compte (spécification
// du 14/10/2026) : statistiques d'usage du compte en LECTURE SEULE, dans la
// modale commune (Modale.tsx), chargées UNIQUEMENT au clic sur le bouton
// « Carrière » du bloc Connexion — aucun appel réseau au chargement de
// l'appli. Aucune persistance : la vue est à la demande, rafraîchie à chaque
// ouverture (les données d'usage évoluent en continu, un cache local
// présenterait des chiffres périmés).
// Sections : compte (pseudo, plateformes liées), temps de jeu (total et par
// classe), personnages (puissance), 10 dernières activités, stats « Carrière »
// du compte (bloc allTime de GetHistoricalStats, characterId = 0 : l'équivalent
// du filtre « Carrière » des Emblèmes du jeu — les filtres Tout/Semaine/Saison
// ne sont PAS repris). Chaque section s'affiche INDÉPENDAMMENT : une donnée
// manquante affiche « non disponible », jamais une estimation (règle du
// projet). Navigation croisée : un bouton « Accomplissements » ouvre le tiroir
// « Solo sans mourir » ; ce tiroir a le bouton retour.
// EN: ⚠️ ADDED - read-only account "Career" view in a modal; loads on click
// only; missing data shows "non disponible", never an estimate.

import { useCallback, useEffect, useState } from "react";
import Modale from "./Modale";
import { chargerCarriere, DonneesCarriere } from "../lib/bungie/carriere";
import type { DestinyMembership, Personnage } from "../lib/bungie/api";
import { urlVisuel } from "../lib/visuelsForge";
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

const NOMS_PLATEFORME: Record<number, string> = { 1: "Xbox", 2: "PlayStation", 3: "Steam", 4: "Battle.net", 5: "Stadia", 6: "Epic", 10: "Demon", 254: "Bungie.net" };

interface Props {
  onFermer: () => void;
  membership: DestinyMembership | null;
  memberships: DestinyMembership[];
  nomBungie: string | null;
  personnages: Personnage[];
  profil: unknown | null;
  /** FR : ouvrir le tiroir « Solo sans mourir » (navigation croisée Accomplissements). / EN: open the Accomplishments drawer. */
  onOuvrirAccomplissements: () => void;
}

export default function ModaleCarriere({ onFermer, membership, memberships, nomBungie, personnages, profil, onOuvrirAccomplissements }: Props) {
  const [donnees, setDonnees] = useState<DonneesCarriere | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [statIdsDiag, setStatIdsDiag] = useState<string | null>(null);

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
    <Modale titre="Carrière" onFermer={onFermer} largeur={640} fermerSurFond>
      {enCours && <p style={{ margin: "0 0 0.6rem" }}>⏳ Chargement de votre carrière…</p>}
      {erreur && (
        <p style={{ margin: "0 0 0.6rem", color: "#e08070" }}>
          Une partie des données n'a pas pu être chargée : {erreur}. Les sections disponibles s'affichent ci-dessous.
        </p>
      )}

      <Section titre="Compte">
        <Ligne libelle="Pseudo Bungie" valeur={nomBungie ?? membership?.displayName ?? NON_DISPONIBLE} />
        <Ligne
          libelle="Plateformes liées"
          valeur={
            memberships.length > 0
              ? memberships.map((m) => NOMS_PLATEFORME[m.membershipType] ?? m.membershipType.toString()).join(", ") || NON_DISPONIBLE
              : NON_DISPONIBLE
          }
        />
        <Ligne libelle="Date de la première connexion" valeur={NON_DISPONIBLE} />
      </Section>

      <Section titre="Temps de jeu">
        <Ligne libelle="Total" valeur={totalMinutes != null ? formaterDuree(totalMinutes * 60) ?? NON_DISPONIBLE : NON_DISPONIBLE} />
        {(donnees?.minutesParClasse ?? []).length > 0 ? (
          donnees!.minutesParClasse!.map((l) => (
            <Ligne key={l.classe} libelle={l.classe} valeur={formaterDuree(l.minutes * 60) ?? NON_DISPONIBLE} />
          ))
        ) : (
          <Ligne libelle="Par classe" valeur={NON_DISPONIBLE} />
        )}
      </Section>

      <Section titre="Personnages">
        {personnages.length > 0 ? (
          personnages.map((p) => <Ligne key={p.characterId} libelle={p.classe} valeur={`puissance ${p.lumiere}`} />)
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
        {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.statIdsCarriere && donnees && (
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={() => setStatIdsDiag(donnees.statIdsBruts.join("\n"))} style={{ fontSize: "0.7rem" }}>
              🔍 Diagnostic : statIds retournés (dev)
            </button>
            {statIdsDiag && (
              <pre style={{ fontSize: "0.7rem", whiteSpace: "pre-wrap", margin: "0.4rem 0 0", color: "#9a968c" }}>{statIdsDiag}</pre>
            )}
          </div>
        )}
      </Section>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.8rem" }}>
        <button
          type="button"
          className="bouton-vue"
          aria-label="Accomplissements"
          title="Ouvrir les Accomplissements (Donjons / Triomphes)"
          onClick={onOuvrirAccomplissements}
          style={{ "--hauteur-bouton": "2rem" } as React.CSSProperties}
        >
          <img className="bouton-vue__repos" src={urlVisuel("selecteur.accomplissements.repos")} alt="" draggable={false} />
          <img className="bouton-vue__actif" src={urlVisuel("selecteur.accomplissements.selectionne")} alt="" draggable={false} />
        </button>
      </div>
    </Modale>
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

function Ligne({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
      <span style={{ color: "#b7b3a8" }}>{libelle}</span>
      <span style={{ color: "#e8e6df", textAlign: "right" }}>{valeur}</span>
    </div>
  );
}

// FR : ⚠️ AJOUT (22/10/2026, TODO §25) - PAGE « CARRIÈRE » du compte, en REMPLACEMENT de la modale `ModaleCarriere` (supprimée) : le bouton « Carrière » du bloc Connexion ouvre désormais cette page, le bloc Connexion et le sélecteur de vues (4 onglets) restent affichés (le bug §25 — pop-up qui ne s'ouvrait pas hors Build Analyzer — est résolu par construction : plus de pop-up du tout). ⚠️ Cette page N'EST PAS un onglet du sélecteur de vues (retour utilisateur : « les boutons apparaissent en double ») : elle n'y figure pas, seul le bloc Connexion porte le bouton.
// Contenu repris TEL QUEL de l'ancienne modale (spécification du 14/10/2026) : statistiques d'usage du compte en LECTURE SEULE, chargées à l'OUVERTURE de l'onglet (la page n'est montée que quand l'onglet est actif — aucun appel réseau au chargement de l'appli). Aucune persistance : la vue est à la demande, rafraîchie à chaque ouverture (les données d'usage évoluent en continu, un cache local présenterait des chiffres périmés).
// Sections : temps de jeu (total et par classe), saison en cours, stats « Carrière » du compte (bloc allTime de GetHistoricalStats, characterId = 0 : l'équivalent du filtre « Carrière » des Emblèmes du jeu — les filtres Tout/Semaine/Saison ne sont PAS repris). ⚠️ CHANGÉ (22/10/2026, demande de l'utilisateur : « Enlève la partie affichant les niveaux de persos ainsi que les 10 dernières activités ») : les sections « Personnages » (puissances) et « 10 dernières activités » sont SUPPRIMÉES ; « Saison en cours » (demandée la veille) est conservée, dans sa propre section. Chaque section s'affiche INDÉPENDAMMENT : une donnée manquante affiche « non disponible », jamais une estimation (règle du projet). ⚠️ La partie « Compte » (pseudo, plateformes liées) a été SUPPRIMÉE le 21/10/2026 (demande de l'utilisateur : « la partie Compte peut disparaître » — le pseudo reste affiché dans le bloc Connexion).
// EN: ⚠️ ADDED - the account "Career" PAGE (view-selector tab), replacing the ModaleCarriere pop-up; same content, loaded on tab open, read-only.

import { useCallback, useEffect, useState } from "react";
import { chargerCarriere, DonneesCarriere, formaterDiagnosticCarriere } from "../lib/bungie/carriere";
import type { DestinyMembership } from "../lib/bungie/api";
import IconeClasse from "./icones/IconeClasse";   // ⚠️ AJOUT (21/10/2026, demande de l'utilisateur : « utilise les assets d'icônes de classes de personnages »)
import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";
import { SAISONS, SaisonFA } from "../data/saisons";

// FR : ⚠️ AJOUT (22/10/2026, retour utilisateur en test : « Saison en cours » affichait « non disponible »
// alors que l'en-tête de l'appli indique la saison) - la saison en cours vient de la table `SAISONS`
// (`src/data/saisons.ts`, socle dérivé de d2-additional-info/DIM) : c'est l'entrée dont la date de fin
// est `null` (la dernière ligne, mise à jour manuellement à chaque saison). AUCUN appel réseau, aucune
// base de données : c'est une donnée statique du dépôt. ⚠️ Le Manifest (`lib/manifest/saison.ts`) reste
// la source PRINCIPALE pour le NOM d'une saison donnée ; ici on n'a que la saison EN COURS, que la
// table locale suffit à désigner. ⚠️ Le nom de `VERSION_JEU` (« Monument of Triumph », badge de l'en-tête)
// est le nom de la VERSION 9.7.0 (patch du 9 juin 2026), PAS celui de la saison en cours (« Season of
// Lawless », n°28, depuis le 2 décembre 2025) : ce ne sont pas les mêmes libellés, on affiche donc la
// SAISON (numéro + nom + extension), cohérente avec la table des saisons.
// EN: ADDED - the current season comes from the SAISONS table (the entry with `fin === null`).
function saisonEnCours(): SaisonFA | undefined {
  return SAISONS.find((s) => s.fin === null);
}

function libelleSaisonEnCours(): string {
  const s = saisonEnCours();
  if (!s) return NON_DISPONIBLE;
  const type = s.type === "episode" ? "épisode" : "saison";
  return `${s.nom} (${type} ${s.numero}${s.extension ? `, ${s.extension}` : ""})`;
}

// FR : ⚠️ CHANGÉ (22/10/2026, demande de l'utilisateur : « il reste à afficher les stats du compte. Toutes les stats. ») - la page affiche DÉSORMAIS **TOUTES** les stats retournées par l'API (`donnees.stats`, ordre de la réponse), plus une sélection figée. Les statIds connus gardent leur libellé FR (table ci-dessous, figée depuis la réponse réelle de l'API pour ce compte) ; une stat inconnue affiche son **statId brut** (jamais omise, jamais renommée à l'aveugle). Les statIds de DURÉES (secondes) sont affichés en « X h Y min » (et non en secondes brutes) ; les ratios gardent 2 décimales.
// EN: CHANGED - the page now shows ALL the stats returned by the API; known statIds keep their French label, unknown ones show their raw statId; duration statIds are shown as hours/minutes.
const LIBELLES_STATS_CONNUS: Record<string, string> = {
  kills: "Éliminations",
  precisionKills: "Éliminations de précision",
  meleeKills: "Mêlée",
  superKills: "Super",
  weaponKills: "Armes",
  abilityKills: "Capacités",
  deaths: "Morts",
  suicides: "Suicides",
  assists: "Assistances",
  killsDeathsRatio: "K/D",
  killsDeathsAssists: "Efficacité",
  combatRating: "Score de combat",
  secondsPlayed: "Temps de jeu",
  activitiesEntered: "Activités commencées",
  activitiesCleared: "Activités terminées",
  objectivesCompleted: "Objectifs accomplis",
  winLossRatio: "Ratio victoires/défaites",
  resurrectionsPerformed: "Résurrections",
  resurrectionsReceived: "Résurrections reçues",
  activityDurationSeconds: "Durée d'activité",
};

// FR : statIds dont la valeur brute est un nombre de SECONDES : affichés en durée « X h Y min » plutôt qu'en secondes. / EN: statIds whose raw value is a number of SECONDS.
const STATS_EN_SECONDES = new Set(["secondsPlayed", "activityDurationSeconds"]);

function libelleStat(statId: string): string {
  return LIBELLES_STATS_CONNUS[statId] ?? statId;
}

function formaterValeurStat(statId: string, valeur: number | null, precision: number | null): string {
  const brut = valeur ?? precision;
  if (brut == null || !Number.isFinite(brut)) return NON_DISPONIBLE;
  if (STATS_EN_SECONDES.has(statId)) return formaterDuree(brut) ?? NON_DISPONIBLE;
  return brut.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

const NON_DISPONIBLE = "non disponible";

function formaterDuree(secondes: number | null): string | null {
  if (secondes == null || !Number.isFinite(secondes) || secondes <= 0) return null;
  const h = Math.floor(secondes / 3600);
  const m = Math.round((secondes % 3600) / 60);
  if (h <= 0) return `${m} min`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
}

// FR : ⚠️ AJOUT (21/10/2026, demande de l'utilisateur) - icônes de CLASSES de personnages : les mêmes que partout dans l'appli (`IconeClasse`, couleurs de classe). Les noms de classe viennent de l'API déjà localisés (« Titan », « Chasseur », « Arcaniste ») ; une classe inconnue (« ? ») n'a pas d'icône. / EN: class icons, same component as the rest of the app.
const CLES_CLASSE: Record<string, "titan" | "chasseur" | "arcaniste"> = { titan: "titan", chasseur: "chasseur", arcaniste: "arcaniste" };
function iconeDeClasse(nom: string) {
  const cle = CLES_CLASSE[nom.toLowerCase()];
  return cle ? <IconeClasse classe={cle} taille={22} /> : null;
}

interface Props {
  membership: DestinyMembership | null;
  profil: unknown | null;
}

export default function VueCarriere({ membership, profil }: Props) {
  const [donnees, setDonnees] = useState<DonneesCarriere | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [diagOuvert, setDiagOuvert] = useState(false);   // ⚠️ CHANGÉ (21/10/2026) : un vrai bouton à bascule (avant : texte vide = rien à afficher)

  const charger = useCallback(async () => {
    if (!membership) return;
    setEnCours(true);
    setErreur(null);
    try {
      const d = await chargerCarriere(membership, profil);
      setDonnees(d);
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership?.membershipId, profil]);

  useEffect(() => {
    charger();
  }, [charger]);

  // FR : ⚠️ CHANGÉ (22/10/2026, retour utilisateur : « le temps de jeu est récupéré dans les stats plus bas ») -
  // le Total vient du PROFIL (composant 200, `minutesPlayedTotal` par personnage, somme des classes) ;
  // si le profil ne le porte pas (composant 200 absent), on retombe sur la stat `secondsPlayed` de
  // GetHistoricalStatsForAccount (agrégat « Carrière » du jeu, compte entier) — JAMAIS une estimation.
  // EN: CHANGED - Total from the profile (component 200); fallback: the `secondsPlayed` stat.
  const totalMinutes =
    donnees?.minutesParClasse?.reduce((acc, l) => acc + (Number.isFinite(l.minutes) ? l.minutes : 0), 0) ??
    (() => {
      const s = donnees?.stats.find((x) => x.statId === "secondsPlayed");
      const brut = s?.valeur ?? s?.precision;
      return brut != null && Number.isFinite(brut) && brut > 0 ? brut / 60 : null;
    })() ??
    null;

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

      <Section titre="Saison">
        <Ligne libelle="Saison en cours" valeur={libelleSaisonEnCours()} />
      </Section>

      <Section titre="Statistiques de carrière">
        {/* FR : ⚠️ CHANGÉ (22/10/2026, « Toutes les stats ») - TOUTES les stats retournées par l'API, dans l'ordre de la réponse (known = libellé FR, sinon statId brut) ; le nombre affiché est celui de la réponse. / EN: ALL the stats returned by the API, in response order. */}
        {donnees && donnees.stats.length > 0 ? (
          <>
            <p style={{ margin: "0 0 0.4rem", fontSize: "0.75rem", color: "#7d7a70" }}>
              {donnees.stats.length} statistique{donnees.stats.length > 1 ? "s" : ""} — filtre « Carrière » (toutes périodes confondues)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.15rem 1rem" }}>
              {donnees.stats.map((s) => (
                <Ligne key={s.statId} libelle={libelleStat(s.statId)} valeur={formaterValeurStat(s.statId, s.valeur, s.precision)} />
              ))}
            </div>
          </>
        ) : (
          <Ligne libelle="Statistiques" valeur={enCours ? "…" : NON_DISPONIBLE} />
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

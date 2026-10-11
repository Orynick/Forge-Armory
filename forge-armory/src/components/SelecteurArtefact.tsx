import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";
// FR : Sélecteur d'artefact (Pilier 3). Permet de choisir un des 7 artefacts
// puis d'y cocher jusqu'à 7 perks, dans le respect des contraintes du jeu.
//
// Pourquoi les contraintes sont appliquées ICI plutôt que seulement dans le
// scoring : laisser composer une configuration impossible puis la sanctionner
// serait déroutant. On empêche donc la sélection invalide, et on explique
// pourquoi un perk est indisponible plutôt que de le griser en silence.
//
// EN: Artifact selector (Pillar 3). Pick one of the 7 artifacts, then check up
// to 7 perks within the game's constraints. Constraints are enforced HERE
// rather than only in scoring: letting the user build an impossible setup then
// penalising it would be confusing. Invalid selections are prevented, and the
// reason a perk is unavailable is explained rather than silently greyed out.

import TitreRepliable from "./TitreRepliable";
import { useState } from "react";
import { ARTEFACTS, CONTRAINTES_ARTEFACT, PLAFOND_TIER_PAR_SLOT, Artefact, PerkArtefact } from "../data/artefacts";
import { infobulleDePerk, texteAffichable } from "../lib/artefacts/infobulle";
import { rendreTextePerk } from "./RenduTextePerk";
import { Database } from "sql.js";
import { obtenirDiagnosticArtefactManifest, extraireArtefactActif } from "../lib/manifest/doctrine";
import { comparerCandidatsIcone, urlIcone } from "../lib/manifest/search";
import { iconeDuPerk } from "../data/iconesPerksArtefact";
import { obtenirDefinition } from "../lib/manifest/download";
import IconeElement from "./icones/IconeElement";
import IconeTypeArme from "./icones/IconeTypeArme";
import { obtenirIconeElementDoctrine, obtenirIconeCinetique } from "../lib/manifest/doctrine";
import { ArtifactSelection, DamageElement } from "../types/build";
import { LIBELLES_ELEMENT_FR } from "../data/libellesElements";

interface Props {
  artifact: ArtifactSelection;
  /** FR : élément de la sous-classe choisie, pour signaler une incohérence artefact/doctrine. null si aucune sous-classe n'est encore choisie. / EN: chosen subclass element, to flag an artifact/subclass mismatch. */
  elementBuild: DamageElement | null;
  onChanger: (selection: ArtifactSelection) => void;
  /** FR : nécessaire au diagnostic de DestinyArtifactDefinition (mode dev). / EN: needed for the DestinyArtifactDefinition diagnostic (dev mode). */
  db?: Database | null;
}

/**
 * FR : identifiant stable d'un perk. Les perks d'artefact n'ont pas de hash
 * Manifest exposé dans notre source (base de connaissance en Markdown) : on
 * fabrique donc une clé à partir de l'artefact, du slot et du tier. Elle est
 * déterministe, donc un loadout sauvegardé reste lisible après rechargement.
 * EN: stable perk identifier. Artifact perks have no Manifest hash in our
 * source, so we build a deterministic key from artifact/slot/tier - a saved
 * loadout stays readable after reload.
 */
export function clePerk(idArtefact: string, tier: number, nomPerk: string): string {
  return `${idArtefact}:${tier}:${nomPerk}`;
}

/**
 * FR : ⚠️ CHANGÉ (04/08/2026) - la clé identifie désormais le PERK lui-même
 * (tier + nom) et non plus « le perk du slot N ». Raison : dans le jeu, un
 * perk n'appartient pas à un slot, il est choisi dans une réserve commune de
 * 21 et placé dans l'emplacement de son choix. L'ancienne clé rendait
 * impossible la détection des doublons entre slots.
 * EN: ⚠️ CHANGED - the key now identifies the PERK itself (tier + name) rather
 * than "slot N's perk": in game a perk isn't tied to a slot, it's picked from
 * a shared pool of 21. The old key made cross-slot duplicate detection
 * impossible.
 */
export function lireCle(cle: string): { tier: number; nom: string } {
  const [, tier, ...reste] = cle.split(":");
  return { tier: Number(tier), nom: reste.join(":") };
}

interface EtatSelection {
  total: number;
  tier1: number;
  tier2: number;
  tier3: number;
}

function compter(cles: string[]): EtatSelection {
  const etat = { total: cles.length, tier1: 0, tier2: 0, tier3: 0 };
  for (const cle of cles) {
    const tier = lireCle(cle).tier;
    if (tier === 1) etat.tier1 += 1;
    else if (tier === 2) etat.tier2 += 1;
    else if (tier === 3) etat.tier3 += 1;
  }
  return etat;
}

/**
 * FR : renvoie la raison pour laquelle un perk ne peut PAS être ajouté, ou
 * null s'il peut l'être. Renvoyer la raison plutôt qu'un simple booléen permet
 * de l'afficher à l'utilisateur : un bouton désactivé sans explication est
 * frustrant.
 * EN: returns why a perk CANNOT be added, or null if it can. Returning the
 * reason rather than a boolean lets us show it: a disabled button with no
 * explanation is frustrating.
 */
export function raisonBlocage(cles: string[], tierVoulu: number): string | null {
  const e = compter(cles);
  const { perksMax, tier1Minimum, tier2Et3Maximum, tier3Maximum } = CONTRAINTES_ARTEFACT;

  if (e.total >= perksMax) return `Budget atteint (${perksMax} perks maximum).`;
  if (tierVoulu === 3 && e.tier3 >= tier3Maximum) return `Maximum ${tier3Maximum} perks de Tier 3.`;
  if (tierVoulu >= 2 && e.tier2 + e.tier3 >= tier2Et3Maximum)
    return `Maximum ${tier2Et3Maximum} perks combinés en Tier 2 et Tier 3.`;
  // FR : il faut garder assez de place pour atteindre le minimum de T1. Si
  // ajouter ce perk non-T1 rendait ce minimum inatteignable, on refuse.
  if (tierVoulu >= 2) {
    const placesRestantesApres = perksMax - (e.total + 1);
    if (e.tier1 + placesRestantesApres < tier1Minimum)
      return `Il faut garder ${tier1Minimum} emplacements pour des perks de Tier 1.`;
  }
  return null;
}

/**
 * FR : ⚠️ AJOUT (04/08/2026) - tier maximum affichable selon le slot, signalé
 * par l'utilisateur : les 3 tiers s'affichaient partout alors que le jeu les
 * débloque par groupes.
 *   slots 1-2 → T1 seulement
 *   slots 3-5 → T1 et T2
 *   slots 6-7 → les 3 tiers
 * Un perk d'un tier INFÉRIEUR reste utilisable dans un slot supérieur
 * (l'inverse est interdit), d'où un plafond plutôt qu'une égalité stricte.
 * EN: ⚠️ ADDED (2026-08-04) - max tier per slot, reported by the user: all 3
 * tiers were shown everywhere while the game unlocks them by groups. A LOWER
 * tier perk stays usable in a higher slot, hence a cap rather than equality.
 */
/**
 * FR : ⚠️ AJOUT (04/08/2026) - traduction des libellés. Les données viennent
 * de la base de connaissance, rédigée en anglais ; l'appli est en français.
 * EN: ⚠️ ADDED (2026-08-04) - label translation: the knowledge base is in
 * English, the app is in French.
 */
// FR : ⚠️ RETIRÉ (24/08/2026) - dictionnaire local supprimé, dupliqué dans 3
// fichiers, remplacé par l'import centralisé (corrige "Arc" ->
// "Cryo-électrique", le vrai terme français). ⚠️ NE PAS confondre avec
// LIBELLES_ARME_FR juste en dessous, qui garde "Arc" pour le TYPE D'ARME
// (l'arc, l'arme) - deux notions différentes qui partagent le même mot.

const LIBELLES_ARME_FR: Record<string, string> = {
  Sword: "Épée",
  Swords: "Épées",
  "Sniper Rifle": "Fusil de précision",
  "Sniper Rifles": "Fusils de précision",
  "Machine Gun": "Mitrailleuse",
  "Machine Guns": "Mitrailleuses",
  Bow: "Arc",
  Bows: "Arcs",
  "Rocket Sidearm": "Micro-missiles",
  "Rocket Sidearms": "Micro-missiles",
  "Fusion Rifle": "Fusil à fusion",
  "Fusion Rifles": "Fusils à fusion",
  Glaive: "Glaive",
  Glaives: "Glaives",
  "Trace Rifle": "Fusil à rayons",
  "Trace Rifles": "Fusils à rayons",
  "Grenade Launcher": "Lance-grenades",
  "Grenade Launchers": "Lance-grenades",
  Shotgun: "Fusil à pompe",
  Shotguns: "Fusils à pompe",
  "Auto Rifle": "Fusil automatique",
  "Auto Rifles": "Fusils automatiques",
  "Precision Weapon": "Arme de précision",
  "Precision Weapons": "Armes de précision",
  "Rocket Launcher": "Lance-roquettes",
  "Rocket Launchers": "Lance-roquettes",
  "Hand Cannon": "Revolver",
  "Hand Cannons": "Revolvers",
  "Pulse Rifle": "Fusil à impulsion",
  "Pulse Rifles": "Fusils à impulsion",
  "Scout Rifle": "Fusil d'éclaireur",
  "Scout Rifles": "Fusils d'éclaireur",
  Sidearm: "Pistolet",
  Sidearms: "Pistolets",
  "Submachine Gun": "Pistolet-mitrailleur",
  "Submachine Guns": "Pistolets-mitrailleurs",
  "Linear Fusion Rifle": "Fusil à fusion linéaire",
  "Linear Fusion Rifles": "Fusils à fusion linéaire",
};

/** FR : traduit un élément, avec repli sur la valeur brute si inconnue (mieux vaut afficher l'anglais qu'un vide). */
function libelleElement(e: string): string {
  return LIBELLES_ELEMENT_FR[e as DamageElement] ?? e;
}

/** FR : traduit un type d'arme, avec repli sur la valeur brute si inconnue. */
function libelleArme(a: string): string {
  return LIBELLES_ARME_FR[a] ?? a;
}

/**
 * FR : ⚠️ SIMPLIFIÉ (24/08/2026) - `artefacts.ts` contient désormais du
 * FRANÇAIS ÉCRIT À LA MAIN par l'utilisateur pour 4 artefacts sur 7 (les
 * trois autres restent en anglais, traduits par substitution de termes en
 * repli). Les anciennes couches `traductionOfficielle` (pont vers
 * l'extraction Manifest, abandonnée : voir CHANGELOG "cul-de-sac") et la
 * distinction nom/description séparées ne sont plus nécessaires - le rendu
 * se fait directement via `rendreTextePerk`, qui gère aussi les jetons
 * `[icone X]` et les verbes en cyan que l'utilisateur a intégrés à ses
 * traductions.
 * EN: ⚠️ SIMPLIFIED - `artefacts.ts` now holds HAND-WRITTEN FRENCH for 4 of
 * 7 artifacts (the rest stay in English, term-substituted as fallback). The
 * old `traductionOfficielle` bridge (dead end, see CHANGELOG) is no longer
 * needed - rendering goes through `rendreTextePerk`.
 */

export default function SelecteurArtefact({ artifact, elementBuild, onChanger, db = null }: Props) {
  // FR : ⚠️ AJOUT (04/08/2026) - diagnostic pour vérifier si le Manifest peut
  // fournir les artefacts EN FRANÇAIS, ce qui remplacerait le fichier généré
  // depuis la base de connaissance (anglaise) et ma traduction par
  // remplacement de termes.
  const [diagArtefact, setDiagArtefact] = useState<string | null>(null);
  const artefactChoisi = ARTEFACTS.find((a) => a.id === artifact.artifactId) ?? null;
  const cles = artifact.perkCles ?? [];
  const etat = compter(cles);

  function choisirArtefact(a: Artefact | null) {
    // FR : changer d'artefact vide la sélection de perks : les clés sont
    // propres à un artefact, les garder produirait des perks fantômes.
    onChanger({ artifactId: a?.id, perkCles: [] });
  }

  function basculerPerk(idArtefact: string, perk: PerkArtefact) {
    const cle = clePerk(idArtefact, perk.tier, perk.nom);
    // FR : la clé identifiant le PERK, un même perk pris deux fois produit la
    // même clé : l'unicité est donc garantie par construction, sans avoir à
    // comparer les noms entre slots comme le faisait la version précédente.
    if (cles.includes(cle)) {
      onChanger({ ...artifact, perkCles: cles.filter((c) => c !== cle) });
      return;
    }
    if (raisonBlocage(cles, perk.tier)) return;
    onChanger({ ...artifact, perkCles: [...cles, cle] });
  }

  // FR : cohérence artefact ↔ doctrine. On signale, on n'interdit pas : un
  // artefact hors-élément reste jouable, c'est juste rarement optimal.
  const incoherenceElement =
    artefactChoisi && elementBuild && !artefactChoisi.elements.includes(elementBuild);

  // FR : ⚠️ REFONTE DE L'INTERFACE (04/08/2026) - l'utilisateur trouvait la
  // version en listes dépliables « bordélique » et demandait quelque chose de
  // proche du menu en jeu. On reproduit donc la GRILLE du jeu :
  //   - une rangée d'emplacements en haut (ce qui est équipé) ;
  //   - en dessous, une ligne par tier (T3 en haut, T1 en bas, comme le jeu) ;
  //   - un perk déjà pris apparaît grisé, comme en jeu.
  // Chaque perk porte une infobulle avec sa description traduite.
  // EN: ⚠️ UI REWORK - the user found the collapsible-list version messy and
  // asked for something close to the in-game menu. We reproduce the game's
  // GRID: a row of equipped slots on top, then one row per tier (T3 top, T1
  // bottom, as in game), with taken perks greyed out.

  /**
   * FR : ⚠️ CORRIGÉ (25/08/2026) - BUG signalé par l'utilisateur :
   * l'ancienne version lisait `cles[index]` directement, c'est-à-dire
   * l'ORDRE DE SÉLECTION, sans jamais vérifier si le palier du perk convenait
   * au plafond de CET emplacement précis. Un perk T3 sélectionné en premier
   * atterrissait dans le premier emplacement du tableau (souvent un
   * emplacement plafonné à T1), sans que rien ne l'en empêche visuellement -
   * même si `raisonBlocage` empêchait bien d'en sélectionner trop, RIEN ne
   * garantissait qu'un perk sélectionné apparaisse dans un emplacement dont
   * le plafond convient.
   *
   * Nouvelle logique : calcule une VRAIE assignation, une seule fois pour
   * les 7 emplacements, en respectant la règle déjà énoncée le 04/08 (« un
   * perk d'un tier inférieur reste utilisable dans un slot supérieur,
   * l'inverse est interdit ») :
   * 1. Les perks T3 réservent en PRIORITÉ les 2 seuls emplacements
   *    plafonnés à 3 - ce sont les seuls capables de les accueillir.
   * 2. Les perks T2 remplissent ensuite les emplacements plafonnés à 2,
   *    puis débordent sur les emplacements T3 restés vides s'il en reste.
   * 3. Les perks T1 remplissent enfin les emplacements plafonnés à 1, puis
   *    débordent sur tout emplacement encore vide (T2 ou T3).
   *
   * EN: ⚠️ FIXED - the old version read `cles[index]` directly (selection
   * ORDER), never checking whether the perk's tier fit THIS slot's cap. A T3
   * perk selected first landed in the first array slot regardless of that
   * slot's actual cap. New logic computes a REAL assignment once, respecting
   * the existing rule that a lower-tier perk can occupy a higher slot, never
   * the reverse: T3 perks reserve the 2 T3-capable slots first, T2 perks
   * fill T2 slots then overflow into leftover T3 slots, T1 perks fill T1
   * slots then overflow into whatever remains.
   */
  const emplacements: (PerkArtefact | undefined)[] = new Array(PLAFOND_TIER_PAR_SLOT.length).fill(undefined);
  if (artefactChoisi) {
    const parTier: Record<1 | 2 | 3, PerkArtefact[]> = { 1: [], 2: [], 3: [] };
    for (const cle of cles) {
      const { tier, nom } = lireCle(cle);
      const perk = artefactChoisi.perksParTier[tier as 1 | 2 | 3]?.find((p) => p.nom === nom);
      if (perk) parTier[tier as 1 | 2 | 3].push(perk);
    }
    // FR : du plus contraint au moins contraint - T3 d'abord (seuls 2
    // emplacements peuvent les accueillir), puis T2, puis T1 en dernier
    // (le plus flexible, accepté par les 7 emplacements).
    for (const tierActuel of [3, 2, 1] as const) {
      for (const perk of parTier[tierActuel]) {
        const indexLibre = PLAFOND_TIER_PAR_SLOT.findIndex(
          (plafond, i) => plafond >= tierActuel && emplacements[i] === undefined
        );
        if (indexLibre !== -1) emplacements[indexLibre] = perk;
      }
    }
  }

  function perkDeLEmplacement(index: number): PerkArtefact | undefined {
    return emplacements[index];
  }

  return (
    <details open className="pilier-carte bloc-repliable">
      {/* FR : ⚠️ CHANGÉ (27/09/2026, v0.2.3) - bloc repliable, comme le Coffre
      (demande de l'utilisateur). Ouvert par défaut : rien ne change au
      lancement, on replie ce qu'on veut. Style dans index.css (.bloc-repliable).
      EN: ⚠️ CHANGED - collapsible block like the Vault, open by default. */}

      <summary>
        <span className="bloc-repliable-ligne">
        <TitreRepliable categorie="artefact" />
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          {/* FR : ⚠️ AJOUT (04/08/2026) - extraction de l'artefact ACTIF pour
          récupérer les VRAIES traductions de Bungie. Idée de l'utilisateur :
          le Manifest ne contient que l'artefact équipé, mais en changer en jeu
          et relancer l'extraction permet de couvrir les 7 un par un. Le
          fichier se télécharge directement, pour éviter un copier-coller de
          plusieurs centaines de lignes.
          EN: ⚠️ ADDED - extraction of the ACTIVE artifact to get Bungie's REAL
          translations. The user's idea: the Manifest only holds the equipped
          artifact, so switching in game and re-extracting covers all 7. */}
          {/* FR : ⚠️ CORRIGÉ (26/08/2026) - même piège que "🖼️ hashes" hier :
          ce bouton (le plus utile des deux, celui qui a servi aux
          traductions ET aux icônes de perks) était resté imbriqué dans le
          bloc `diagnosticManifestArtefact`, archivé - invisible depuis le
          début, alors que je n'avais sorti QUE "🖼️ hashes" de ce même
          bloc hier. Signalé par l'utilisateur, qui cherchait ce bouton
          précisément pour l'audit des icônes de perks.
          EN: ⚠️ FIXED - same trap as "🖼️ hashes" yesterday: this button
          (the most useful of the two, used for translations AND perk
          icons) had stayed nested inside the archived block - only
          "🖼️ hashes" was extracted yesterday, not this one. */}
          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.extraireArtefactActif && db && (
            <button
              onClick={() => {
                const json = extraireArtefactActif(db);
                const nom = (JSON.parse(json).artefact ?? "artefact")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const lien = document.createElement("a");
                lien.href = url;
                lien.download = `artefact-${nom}.json`;
                document.body.appendChild(lien);
                lien.click();
                document.body.removeChild(lien);
                setTimeout(() => URL.revokeObjectURL(url), 30_000);
                setDiagArtefact(json);
              }}
              style={{ fontSize: "0.7rem", fontWeight: 400 }}
              title="Extraire l'artefact ACTIF avec ses traductions officielles (mode développement)"
            >
              ⬇ Extraire l'artefact actif
            </button>
          )}
          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.diagnosticManifestArtefact && db && (
            <button
              onClick={() => setDiagArtefact(obtenirDiagnosticArtefactManifest(db))}
              style={{ fontSize: "0.7rem", fontWeight: 400 }}
              title="Diagnostic brut du Manifest (mode développement)"
            >
              🔍 dev
            </button>
          )}
          {/* FR : ⚠️ CORRIGÉ (25/08/2026) - ce bouton avait été inséré à
          tort DANS le bloc conditionné par `diagnosticManifestArtefact`,
          archivé (false) depuis le nettoyage du registre - il n'apparaissait
          donc jamais, quel que soit le mode développement. Sorti du bloc,
          avec sa propre entrée `diagnosticHashesArtefact`.
          EN: ⚠️ FIXED - this button had been wrongly nested inside the
          block gated by an ARCHIVED diagnostic - it never showed. Moved
          out, with its own registry entry. */}
          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.diagnosticHashesArtefact && db && (
            <button
              onClick={() => {
                const hashesParDefaut = [
                  3980449645, 1014202826, 1085005333, // Disque de données cryptées
                  2392273483, 3821685388, 1907110519, // Tablette de la Ruine
                  3044482290, 972833348, 1770364095, // Sacoche d'apothicaire de Baron-Bourreau
                  2785855278, 258025496, 1504442987, // Régulateur répulsif ANP
                  2694905144, 23349941, 1708748798, // Outillage de Curiosité
                  2180638678, 3048807337, 1213492937, // Journal du Chasseur
                  3518286241, 4156549634, 1410465636, // Encensoir à feuilles de Reine
                ].join(",");
                const saisie = window.prompt("Hashes à comparer (séparés par des virgules) :", hashesParDefaut);
                if (!saisie) return;
                const hashes = saisie.split(",").map((h) => Number(h.trim())).filter((h) => !Number.isNaN(h));
                setDiagArtefact(comparerCandidatsIcone(db, hashes));
              }}
              style={{ fontSize: "0.7rem", fontWeight: 400 }}
              title="Compare les candidats de hash d'artefact, pour identifier lequel a une vraie icône (mode développement)"
            >
              🖼️ hashes
            </button>
          )}
          <span>{artefactChoisi ? `${etat.total}/${CONTRAINTES_ARTEFACT.perksMax}` : "◯ aucun"}</span>
        </span>
        </span>
      </summary>

      {diagArtefact && (
        <details open style={{ fontSize: "0.75rem", color: "#b7b3a8", marginBottom: "0.6rem" }}>
          <summary style={{ cursor: "pointer" }}>
            <span>🔍 Artefacts dans le Manifest (à copier à Claude)</span>
            <button onClick={() => setDiagArtefact(null)} style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}>
              fermer
            </button>
          </summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem", background: "#0d0f14", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>
            {diagArtefact}
          </pre>
        </details>
      )}

      {/* FR : ⚠️ CHANGÉ (25/08/2026) - MenuDerouantIcone remplacé par une
      liste de VRAIS BOUTONS, un par artefact (demande de l'utilisateur,
      « comme pour les armes »). Le nom affiché est désormais celui de
      `a.nom`, traduit en français ce même jour (les 4 derniers noms
      manquaient encore : Disque de données cryptées, Outillage de
      Curiosité, Journal du Chasseur, Régulateur répulsif ANP) - le menu
      déroulant affichait donc l'anglais brut jusqu'ici, pas un défaut du
      menu lui-même.
      ⚠️ PAS de vraie miniature (contrairement aux armes) : `Artefact` n'a
      aucun `itemHash` permettant de résoudre une icône réelle depuis le
      Manifest - contrairement à une arme réelle, dont l'icône vient de
      l'inventaire du joueur. Inventer une image aurait été le genre
      d'erreur qu'on a appris à éviter cette session (icônes de contexte
      correctement détourées à partir d'une vraie image fournie, jamais
      dessinées au hasard). Les icônes d'éléments/armes compatibles
      (déjà officielles, via le Manifest) remplissent ce rôle en attendant.
      EN: ⚠️ CHANGED - dropdown replaced by REAL BUTTONS, one per artifact.
      NO real thumbnail: `Artefact` has no `itemHash` to resolve a real icon
      from the Manifest, unlike a real weapon (icon comes from the player's
      owned inventory instance). */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {ARTEFACTS.map((a) => {
          const selectionne = artifact.artifactId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => choisirArtefact(selectionne ? null : a)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: "0.4rem 0.6rem",
                borderRadius: 6,
                border: selectionne ? "1px solid #7aa2f7" : "1px solid #3a3f4b",
                background: selectionne ? "#1a2436" : "transparent",
                color: selectionne ? "#e8e6df" : "#b7b3a8",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                {/* FR : ⚠️ AJOUT (25/08/2026) - vraie miniature de
                l'artefact, demande de l'utilisateur ("comme pour les
                armes"). Résolue dynamiquement via le Manifest à partir de
                `itemHash` (jamais codée en dur), vérifié par l'utilisateur
                que les 3 hashes candidats renvoient la même icône - voir
                `knowledge-base/24_HASH_ARTEFACTS.md`.
                EN: ⚠️ ADDED - real artifact thumbnail, resolved dynamically
                via the Manifest from `itemHash`. */}
                {db &&
                  (() => {
                    const urlMiniature = urlIcone(
                      obtenirDefinition<{ displayProperties?: { icon?: string } }>(
                        db,
                        "DestinyInventoryItemDefinition",
                        a.itemHash
                      )?.displayProperties?.icon
                    );
                    return urlMiniature ? (
                      <img src={urlMiniature} alt="" width={24} height={24} style={{ borderRadius: 3, flexShrink: 0 }} />
                    ) : null;
                  })()}
                <span style={{ fontSize: "0.78rem" }}>{a.nom}</span>
              </span>
              <span style={{ display: "inline-flex", gap: "3px", flexShrink: 0, alignItems: "center" }}>
                {a.elements.map((e) => (
                  <IconeElement
                    key={e}
                    element={e}
                    taille={16}
                    urlOfficielle={db ? obtenirIconeElementDoctrine(db, e) : undefined}
                  />
                ))}
                {a.soutientCinetique && db && obtenirIconeCinetique(db) && (
                  <img
                    src={obtenirIconeCinetique(db)}
                    alt="Cinétique"
                    title="Cinétique"
                    width={16}
                    height={16}
                    style={{ borderRadius: 3, flexShrink: 0 }}
                  />
                )}
                {a.armes.length > 0 && (
                  <span style={{ color: "#3a3f4b", margin: "0 1px", fontSize: "0.7rem" }}>|</span>
                )}
                {a.armes.map((arme) => (
                  <IconeTypeArme key={arme} typeArme={libelleArme(arme)} taille={16} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {artefactChoisi && (
        <>
          <p style={{ fontSize: "0.75rem", color: "#b7b3a8", margin: "0 0 0.5rem" }}>
            <strong>Compatible avec</strong> — Éléments :{" "}
            {artefactChoisi.elements.map(libelleElement).join(", ")}
            {artefactChoisi.soutientCinetique ? ", Cinétique" : ""} · Armes :{" "}
            {artefactChoisi.armes.map(libelleArme).join(", ")}
          </p>

          {incoherenceElement && (
            <p style={{ fontSize: "0.75rem", color: "#e0c080", margin: "0 0 0.5rem" }}>
              ⚠️ Cet artefact ne soutient pas l'élément de votre doctrine (
              {libelleElement(elementBuild ?? "")}). Jouable, mais rarement optimal.
            </p>
          )}

          {/* FR : rangée des 7 emplacements, comme la ligne du haut en jeu. */}
          <div style={{ marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#7d7a70", marginBottom: "0.25rem" }}>
              {/* FR : ⚠️ CHANGÉ (26/08/2026) - "Emplacements équipés" mis en
              évidence (blanc, gras), demande de l'utilisateur — le reste de
              la phrase (instruction) reste discret. */}
              <strong style={{ color: "#e8e6df" }}>Emplacements équipés</strong> — cliquez un perk plus bas pour le placer
            </div>
            {/* FR : ⚠️ CHANGÉ (25/08/2026) - grille CSS à 7 colonnes plutôt
            que flex-wrap, demande de l'utilisateur (aligner les 7
            emplacements avec les 3x7 colonnes de perks ci-dessous). Avec
            flex-wrap, deux lignes de largeurs d'élément différentes (78px
            ici, 110px pour les perks) ne peuvent PAS partager les mêmes
            colonnes, quelle que soit la largeur du panneau - seule une
            grille avec le MÊME nombre de colonnes des deux côtés garantit
            un alignement réel.
            EN: ⚠️ CHANGED - CSS grid with 7 columns instead of flex-wrap,
            so this row shares the exact same column boundaries as the
            perk rows below - flex-wrap items of different widths can
            never align across separate rows. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.3rem" }}>
              {PLAFOND_TIER_PAR_SLOT.map((plafond, index) => {
                const perk = perkDeLEmplacement(index);
                return (
                  <div
                    key={index}
                    title={perk ? infobulleDePerk(perk.nom, perk.description) : `Emplacement vide — accepte les perks jusqu'au Tier ${plafond}`}
                    style={{
                      minHeight: 52,
                      border: perk ? "1px solid #7aa2f7" : "1px dashed #3a3f4b",
                      background: perk ? "#1a2436" : "transparent",
                      borderRadius: 6,
                      padding: "0.25rem",
                      fontSize: "0.62rem",
                      textAlign: "center",
                      cursor: perk ? "pointer" : "default",
                      color: perk ? "#e8e6df" : "#5a5f6b",
                    }}
                    onClick={() => {
                      if (!perk) return;
                      onChanger({ ...artifact, perkCles: cles.filter((_, i) => i !== index) });
                    }}
                  >
                    <div style={{ color: "#7d7a70", fontSize: "0.58rem" }}>{"◆".repeat(plafond)}</div>
                    {/* FR : ⚠️ AJOUT (05/10/2026) - icône du perk placé dans l'emplacement (14 px, DANS la ligne du nom : la hauteur de l'emplacement ne change pas). / EN: ⚠️ ADDED - icon of the perk in the slot, inline so the slot height does not change. */}
                    {perk && iconeDuPerk(artefactChoisi.id, perk) && (
                      <img
                        src={urlIcone(iconeDuPerk(artefactChoisi.id, perk))}
                        alt=""
                        width={14}
                        height={14}
                        style={{ borderRadius: 2, verticalAlign: "-2px", marginRight: "3px" }}
                      />
                    )}
                    {perk ? texteAffichable(perk.nom) : "vide"}
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{ fontSize: "0.72rem", color: "#7d7a70", margin: "0 0 0.4rem" }}>
            {CONTRAINTES_ARTEFACT.perksMax} perks au total · ◆ = tier maximum accepté par
            l'emplacement · Tier 1 : {etat.tier1} · Tier 2 : {etat.tier2} · Tier 3 : {etat.tier3}
          </p>

          {/* FR : grille des perks, une ligne par tier (T3 en haut comme en
          jeu). Un perk pris est grisé, un perk bloqué explique pourquoi. */}
          {[3, 2, 1].map((tier) => (
            <div key={tier} style={{ marginBottom: "0.4rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#7d7a70", marginBottom: "0.2rem" }}>
                {"◆".repeat(tier)} Tier {tier}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.3rem" }}>
                {artefactChoisi.perksParTier[tier as 1 | 2 | 3].map((perk) => {
                  const cle = clePerk(artefactChoisi.id, perk.tier, perk.nom);
                  const selectionne = cles.includes(cle);
                  const blocage = selectionne ? null : raisonBlocage(cles, perk.tier);
                  return (
                    <button
                      key={cle}
                      onClick={() => basculerPerk(artefactChoisi.id, perk)}
                      disabled={!!blocage}
                      // FR : ⚠️ CHANGÉ (05/10/2026) - l'infobulle montre l'EFFET du perk (demande de l'utilisateur),
                      // pas seulement son nom ; l'avertissement de blocage vient après.
                      // EN: ⚠️ CHANGED - the tooltip shows the perk's EFFECT, not just its name.
                      title={infobulleDePerk(perk.nom, perk.description, blocage)}
                      style={{
                        minHeight: 46,
                        textAlign: "left",
                        fontSize: "0.65rem",
                        padding: "0.25rem 0.35rem",
                        borderRadius: 6,
                        border: selectionne ? "1px solid #7aa2f7" : "1px solid #2a2e38",
                        background: selectionne ? "#1a2436" : "transparent",
                        color: blocage ? "#4a4f5b" : "#e8e6df",
                        cursor: blocage ? "not-allowed" : "pointer",
                      }}
                    >
                      {/* FR : ⚠️ AJOUT (25/08/2026) - icône du perk, si disponible. Repli silencieux : aucune icône affichée plutôt
                      qu'une image cassée. ⚠️ CHANGÉ (05/10/2026) : l'icône vient maintenant de `iconeDuPerk` (data/iconesPerksArtefact.ts : 125 des
                      147 perks, figées depuis le Manifest de l'utilisateur) ; le champ `perk.icone` des données, qui n'a jamais été rempli, reste
                      prioritaire s'il existe un jour.
                      EN: perk icon, if available; now resolved by `iconeDuPerk` (125 of 147 perks baked in). Silent fallback. */}
                      {iconeDuPerk(artefactChoisi.id, perk) && (
                        <img
                          src={urlIcone(iconeDuPerk(artefactChoisi.id, perk))}
                          alt=""
                          width={14}
                          height={14}
                          style={{ borderRadius: 2, verticalAlign: "-2px", marginRight: "3px" }}
                        />
                      )}
                      {selectionne ? "✓ " : ""}
                      {texteAffichable(perk.nom)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* FR : ⚠️ CHANGÉ (24/08/2026) - panneau récapitulatif de TOUS les
          perks sélectionnés (pas seulement le dernier cliqué dans chaque
          tier), demande explicite de l'utilisateur : « il faudra pouvoir
          lire dans ce bloc pour analyser les synergies ». Un aide-mémoire
          par tier ne permettait pas de voir l'ensemble du build d'artefact
          d'un coup d'œil - or repérer une synergie demande justement de
          comparer plusieurs perks entre eux.
          Placé APRÈS la grille (pas mêlé aux boutons), groupé par tier pour
          rester lisible, avec le VRAI rendu (icônes, verbes en cyan) sur
          chaque description.
          EN: ⚠️ CHANGED - recap panel of ALL selected perks (not just the
          last one clicked in each tier), explicit user request: "I need to
          read this block to analyse synergies." A per-tier reminder didn't
          show the whole artifact build at once - spotting a synergy requires
          comparing several perks against each other. */}
          {etat.total > 0 && (
            <div style={{ marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: "1px solid #2a2e38" }}>
              <div style={{ fontSize: "0.72rem", color: "#7d7a70", marginBottom: "0.4rem" }}>
                Perks sélectionnés ({etat.total}/{CONTRAINTES_ARTEFACT.perksMax}) — pour repérer les synergies
              </div>
              {[3, 2, 1].map((tier) => {
                const perksDeCetTier = artefactChoisi.perksParTier[tier as 1 | 2 | 3].filter((p) =>
                  cles.includes(clePerk(artefactChoisi.id, p.tier, p.nom))
                );
                if (perksDeCetTier.length === 0) return null;
                return (
                  <div key={tier} style={{ marginBottom: "0.5rem" }}>
                    {perksDeCetTier.map((perk) => (
                      <p key={perk.nom} style={{ fontSize: "0.7rem", color: "#b7b3a8", margin: "0 0 0.3rem", lineHeight: 1.5 }}>
                        <span style={{ color: "#5a5f6b" }}>{"◆".repeat(tier)}</span>{" "}
                        {/* FR : ⚠️ AJOUT (05/10/2026) - icône du perk devant son nom dans le récapitulatif. / EN: ⚠️ ADDED - perk icon before its name in the recap. */}
                        {iconeDuPerk(artefactChoisi.id, perk) && (
                          <img
                            src={urlIcone(iconeDuPerk(artefactChoisi.id, perk))}
                            alt=""
                            width={14}
                            height={14}
                            style={{ borderRadius: 2, verticalAlign: "-2px", marginRight: "3px" }}
                          />
                        )}
                        <strong style={{ color: "#e8e6df" }}>{texteAffichable(perk.nom)}</strong>
                        {perk.description && (
                          <>
                            {" — "}
                            {rendreTextePerk(perk.description)}
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </details>
  );
}

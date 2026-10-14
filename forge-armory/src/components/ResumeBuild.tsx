// FR : Recapitulatif visuel du build en cours - armes (ordonnees Cinetique/
// Energie/Lourde) a gauche, armure a droite (perks groupes par colonne de
// socket, comme en jeu), section Doctrine detaillee (tout ce qui est
// selectionnable + ce qui est selectionne + les effets) en dessous, et
// point d'entree du seul bouton qui touche VRAIMENT votre compte :
// "Equiper".
//
// EN: Visual recap of the current build - weapons (ordered Kinetic/
// Energy/Power) on the left, armor on the right (perks grouped by socket
// column, like in-game), a detailed Doctrine section (everything
// selectable + what's selected + the effects) below, and the entry point
// of the ONLY button that REALLY touches your account: "Equip".

import { ordonnerColonnesPourAffichage, libelleColonne } from "../lib/manifest/colonnesArme";   // ⚠️ AJOUT (13/10/2026, v0.4.3) : règles de tri et d'étiquette partagées avec la Forge
import TitreRepliable from "./TitreRepliable";
import PastilleContexte, { ECHELLE_CONTEXTE_RANGEE } from "./PastilleContexte";
import { LIBELLES_CONTEXTE, ORDRE_CONTEXTES } from "./icones/BadgeContexte";
import type { ContexteBuild } from "../lib/scoring/stats";
import { useEffect, useMemo, useState } from "react";
import { Database } from "sql.js";
import { BuildDraft, GearPiece, SlotArme, SlotArmure, StatKey } from "../types/build";
import { LIBELLES_ELEMENT_FR as LIBELLES_ELEMENT } from "../data/libellesElements";
import { LIBELLES_SLOT, LIBELLES_CATEGORIE } from "../data/libellesUI";
import { STAT_MAX, sommerStatsArmure } from "../lib/scoring/stats";
import { obtenirChampionsCouverts } from "../lib/scoring/verbes";
import { obtenirBonusSetsActifs } from "../lib/scoring/armorSets";
import RappelDoctrine from "./RappelDoctrine";
import { surlignerVerbesConnus, IconeElementArme, IconeMunitionArme } from "./RenduTextePerk";

// FR : ⚠️ AJOUT (24/08/2026) - isole les mentions d'impact sur les stats
// (ex: "Grenade +10", "Santé -10 ▼") sur leur PROPRE LIGNE dans la
// description d'un fragment, demande de l'utilisateur. Ces notations
// arrivent aujourd'hui collées à la phrase principale ("...qui s'appliquent
// à vous. Santé -10 ▼"), ce qui les rend difficiles à repérer d'un coup
// d'œil.
// ⚠️ Motif VOLONTAIREMENT TOLÉRANT : détecte un nom de stat suivi d'un signe
// et d'un nombre (avec flèche optionnelle avant/après), sans dépendre d'un
// format exact - je n'ai pas pu vérifier le texte brut exact sur un
// exemple réel avant d'écrire ceci. À corriger si un cas concret ne se
// scinde pas correctement.
// EN: ⚠️ ADDED - isolates stat-impact mentions on their OWN LINE within a
// fragment's description. Deliberately TOLERANT pattern: matches a stat
// name followed by a sign and a number, without depending on an exact
// format I couldn't verify against a real example beforehand.
const MOTIF_IMPACT_STAT = /(?=\s(?:▲|▼)?\s*(?:Santé|Mêlée|Grenade|Super|Classe|Arme)\s*[+-]\s*\d+)/g;

function formaterDescriptionAvecRetours(texte: string): string {
  return texte.replace(MOTIF_IMPACT_STAT, "\n").trim();
}
import IconeSlotArmure from "./icones/IconeSlotArmure";
import IconeTypeArme from "./icones/IconeTypeArme";
import { obtenirSecoursTypeArme } from "../lib/manifest/typeArmeSecours";
import IconeAntiChampion, { TypeChampion, LIBELLES_CHAMPION } from "./icones/IconeAntiChampion";
import { DestinyMembership, Personnage } from "../lib/bungie/api";
import { equiperObjet, equiperPlusieursObjets, diagnostiquerExistenceObjet } from "../lib/bungie/equiper";
import { obtenirOptionsSousClasse, CategorieSocket, GroupeSocket, obtenirAntiChampion, obtenirAntiChampionArmure, obtenirIconesPerksArme, obtenirOptionsToutesColonnes, raccourcirNom, obtenirBonusSet, obtenirBonusStatsDoctrine, obtenirTypeMunition, obtenirCategoriesObjet } from "../lib/manifest/doctrine";
import { texteSurvol } from "./SelecteurInventaire";


const ORDRE_ARMES: SlotArme[] = ["cinetique", "energie", "lourde"];
const ORDRE_ARMURE: SlotArmure[] = ["casque", "gants", "torse", "jambes", "marque"];

// FR : ⚠️ RETIRÉ (24/08/2026) - dictionnaire local supprimé, dupliqué dans 3
// fichiers, remplacé par l'import centralisé (corrige "Arc" ->
// "Cryo-électrique"). Les suffixes "(Vide)"/"(Strand)" de ce dictionnaire-ci
// étaient absents des deux autres versions - autre preuve que la
// duplication avait déjà divergé.


interface Props {
  build: BuildDraft;
  membership: DestinyMembership | null;
  personnages: Personnage[];
  db?: Database | null;
  /** FR : callback de réinitialisation du build (bouton affiché à côté d'"Équiper") - optionnel, le bouton n'apparaît pas si absent. / EN: build reset callback (button shown next to "Equip") - optional, the button doesn't appear if absent. */
  onReinitialiser?: () => void;
  /**
   * FR : ⚠️ AJOUT (07/10/2026, v0.3.17), demande de l'utilisateur - le CONTEXTE du build et son changement : les quatre boutons de contexte sont affichés EN HAUT de ce bloc, sous le titre (ils étaient dans une ligne « Contexte du Build » au-dessus
   * du bloc, supprimée). Facultatifs : sans eux, la rangée n'est pas affichée. / EN: ⚠️ ADDED - the build context and its setter: the four context buttons are shown at the top of this block, under its title.
   */
  contexte?: ContexteBuild;
  onChangerContexte?: (valeur: ContexteBuild) => void;
  /**
   * FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - bouton « Forge » de la fenêtre Détails d'une ARME possédée (spécification du 12/10/2026, §1) : envoie l'arme à la vue Inventaire de la Forge (absent : pas de bouton). `build` est ici le build AVEC la simulation appliquée (armes marquées `perksSimules`) : le badge « simulé » et l'avertissement à l'équipement en dépendent. / EN: ⚠️ ADDED - Forge button of a weapon's Details window; `build` here has the simulation applied.
   */
  onOuvrirForge?: (piece: GearPiece) => void;
}

// FR : ⚠️ AJOUT (24/08/2026) - détermine si un objet est déjà sur le
// personnage ciblé, en comparant `piece.origine` (déjà connu : "coffre",
// "titan", "chasseur", "arcaniste") à la CLASSE du personnage visé.
// Nécessaire pour savoir si le transfert doit être sauté avant l'équipement
// (confirmé par le test réel de l'utilisateur : le tenter alors que l'objet
// est déjà là échoue avec la même erreur que ne pas le tenter quand il faut).
// EN: ⚠️ ADDED - determines if an item is already on the target character,
// comparing `piece.origine` to the target character's CLASS. Needed to know
// whether the transfer should be skipped before equipping.
function calculerSetsActifsResume(build: BuildDraft, db: Database) {
  const parSet = new Map<string, { nom: string; count: number; actifs: { requiredSetCount: number; nom: string; description: string }[] }>();
  for (const bonus of obtenirBonusSetsActifs(build.armure, db)) {
    const entree = parSet.get(bonus.nomSet) ?? { nom: bonus.nomSet, count: bonus.nbPieces, actifs: [] };
    entree.actifs.push({ requiredSetCount: bonus.requiredSetCount, nom: bonus.nom, description: bonus.description });
    parSet.set(bonus.nomSet, entree);
  }
  return [...parSet.values()];
}

export default function ResumeBuild({ build, membership, personnages, db = null, onReinitialiser, contexte, onChangerContexte, onOuvrirForge }: Props) {
  const setsAvecBonusActif = useMemo(() => db ? calculerSetsActifsResume(build, db) : [], [build, db]);
  const [personnageCible, setPersonnageCible] = useState<string>(personnages[0]?.characterId ?? "");
  const [enCours, setEnCours] = useState<string | null>(null);
  // FR : ⚠️ AJOUT (26/08/2026) - contrôle l'affichage de la pop-up
  // partagée RappelDoctrine, ouverte après un équipement global (demande
  // de cohérence avec PanneauLoadouts).
  const [rappelDoctrineOuvert, setRappelDoctrineOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  useEffect(() => {
    if (personnages.length > 0 && !personnages.some((p) => p.characterId === personnageCible)) {
      setPersonnageCible(personnages[0].characterId);
    }
  }, [personnages, personnageCible]);

  // FR : ⚠️ AJOUT (26/08/2026) - sélectionne automatiquement le personnage
  // correspondant à la classe du build, demande de l'utilisateur : charger
  // un loadout remplaçait bien tout l'équipement, mais laissait le champ
  // "Équiper sur :" sur l'ancien personnage, obligeant à le changer à la
  // main à chaque fois. Se déclenche dès que `build.subclass.classe`
  // change - au chargement d'un loadout (qui remplace tout le build,
  // classe comprise) comme lors d'un changement manuel de classe dans le
  // bloc Personnage & Doctrine.
  // ⚠️ Comparaison insensible à la casse : `Personnage.classe` vient de
  // l'API Bungie en MAJUSCULE ("Titan"), alors que `subclass.classe` est
  // en minuscule ("titan") - même désaccord de casse que le bug
  // `estDejaSurPersonnage` trouvé plus tôt cette session, évité ici
  // directement plutôt que de le redécouvrir une seconde fois.
  // EN: ⚠️ ADDED - auto-selects the character matching the build's class:
  // loading a loadout replaced all equipment, but left "Équiper sur :" on
  // the previous character. Case-insensitive comparison: `Personnage.classe`
  // comes from the Bungie API in UPPERCASE, `subclass.classe` is lowercase.
  useEffect(() => {
    if (!build.subclass.classe) return;
    const correspondant = personnages.find(
      (p) => p.classe.toLowerCase() === build.subclass.classe
    );
    if (correspondant && correspondant.characterId !== personnageCible) {
      setPersonnageCible(correspondant.characterId);
    }
    // FR : ⚠️ volontairement PAS `personnageCible` dans les dépendances -
    // sinon cet effet se redéclencherait après son propre changement,
    // sans jamais boucler ici (la condition characterId !== le protège de
    // toute façon), mais par principe : ne réagir qu'à un changement de
    // CLASSE, pas à un changement du personnage cible lui-même.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build.subclass.classe, personnages]);

  const armesTriees = [...build.armes].sort(
    (a, b) => ORDRE_ARMES.indexOf(a.slot as SlotArme) - ORDRE_ARMES.indexOf(b.slot as SlotArme)
  );
  const armureTriee = [...build.armure].sort(
    (a, b) => ORDRE_ARMURE.indexOf(a.slot as SlotArmure) - ORDRE_ARMURE.indexOf(b.slot as SlotArmure)
  );
  const toutesLesPieces = [...armesTriees, ...armureTriee];

  async function gererEquiper(piece: GearPiece) {
    if (!membership || !personnageCible || !piece.itemInstanceId) return;
    const estExotique = piece.isExotic
      ? "\n\n⚠️ Rappel : équiper cet exotique remplacera automatiquement tout autre exotique du même type (arme ou armure) déjà équipé."
      : "";
    // FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - AVERTISSEMENT (spécification du 12/10/2026, §8 : les perks simulés ne sont pas appliqués en jeu) : l'arme possédée est équipée avec ses perks RÉELS. / EN: ⚠️ ADDED - warning: simulated perks are not applied in the game.
    const noteSimulation = piece.perksSimules
      ? `\n\n🔨 Cette arme a ${piece.nbColonnesSimulees} colonne(s) de perks SIMULÉS dans la Forge : ils ne sont PAS appliqués en jeu. L'arme sera équipée telle qu'elle est réellement (avec ses perks réels).`
      : "";
    const confirme = window.confirm(
      `Équiper "${piece.nom}" sur votre personnage en jeu maintenant ? Cette action est réelle et immédiate.${estExotique}${noteSimulation}`
    );
    if (!confirme) return;

    setEnCours(piece.itemInstanceId);
    setErreur(null);
    setSucces(null);
    try {
      // FR : ⚠️ CHANGÉ (01/10/2026) - Manifest transmis (remplacement
      // automatique d'une arme équipée sur un autre personnage) et note affichée.
      // EN: ⚠️ CHANGED - Manifest passed (automatic replacement), note shown.
      const note = await equiperObjet(membership, personnageCible, piece.itemInstanceId, piece.itemHash, db);
      setSucces(`"${piece.nom}" équipé avec succès.${note ? ` ${note}.` : ""}`);
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(null);
    }
  }

  const piecesEquipables = toutesLesPieces.filter((p) => p.itemInstanceId);

  // FR : ⚠️ AJOUT (03/08/2026) - avertissement anticipé : en jeu, on ne
  // peut équiper qu'UNE SEULE arme exotique et UNE SEULE armure exotique
  // à la fois. Ce n'était vérifié nulle part avant pour les armes.
  // EN: ⚠️ ADDED (2026-08-03) - anticipated warning: in-game, you can only
  // equip ONE exotic weapon and ONE exotic armor piece at a time. This was
  // never checked for weapons before.
  const nbArmesExotiques = build.armes.filter((p) => p.isExotic).length;
  const nbArmureExotiques = build.armure.filter((p) => p.isExotic).length;
  const avertissementExotiques =
    nbArmesExotiques > 1 || nbArmureExotiques > 1
      ? [
          nbArmesExotiques > 1 ? `${nbArmesExotiques} armes exotiques` : null,
          nbArmureExotiques > 1 ? `${nbArmureExotiques} pièces d'armure exotiques` : null,
        ]
          .filter(Boolean)
          .join(" et ")
      : null;

  /**
   * FR : ⚠️ CHANGÉ (26/08/2026) - mention "bêta" retirée (demande de
   * l'utilisateur, fonctionnalité déjà testée et confirmée fonctionnelle
   * à plusieurs reprises) ; déclenche désormais la pop-up de rappel de
   * doctrine (RappelDoctrine, partagée avec PanneauLoadouts) au lieu
   * d'une note textuelle inline en fin de message - cohérence entre les
   * deux boutons d'équipement de l'appli, demande explicite de
   * l'utilisateur.
   * EN: ⚠️ CHANGED - "beta" wording removed (already tested and confirmed
   * working repeatedly); now triggers the shared doctrine reminder popup
   * instead of an inline text note, for consistency between both equip
   * buttons.
   */
  async function gererEquiperTout() {
    if (!membership || !personnageCible || piecesEquipables.length === 0) return;
    const messageAvertissement = avertissementExotiques
      ? `\n\n⚠️ Attention : ce build contient ${avertissementExotiques} — en jeu, une seule arme exotique et une seule armure exotique peuvent être équipées à la fois. Les dernières équipées remplaceront les précédentes.`
      : "";
    // FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - avertissement : des perks SIMULÉS ne sont pas appliqués en jeu. / EN: ⚠️ ADDED - simulated perks are not applied in the game.
    const nbSimulees = piecesEquipables.filter((p) => p.perksSimules).length;
    const noteSimulation = nbSimulees > 0
      ? `\n\n🔨 ${nbSimulees} arme${nbSimulees > 1 ? "s" : ""} de ce build ${nbSimulees > 1 ? "ont" : "a"} des perks SIMULÉS dans la Forge : ils ne sont PAS appliqués en jeu. Ces armes seront équipées telles qu'elles sont réellement (avec leurs perks réels).`
      : "";
    const confirme = window.confirm(
      `Équiper les ${piecesEquipables.length} pièces possédées de ce build sur votre personnage en jeu maintenant ? Cette action est réelle et immédiate.${messageAvertissement}${noteSimulation}`
    );
    if (!confirme) return;

    setEnCours("__tout__");
    setErreur(null);
    setSucces(null);
    try {
      const resultat = await equiperPlusieursObjets(
        membership,
        personnageCible,
        piecesEquipables.map((p) => ({ nom: p.nom ?? "(sans nom)", itemInstanceId: p.itemInstanceId!, itemHash: p.itemHash })),
        db
      );
      // FR : ⚠️ AJOUT (01/10/2026) - remplaçants équipés sur d'autres personnages.
      const noteRemplacements = resultat.notes.length > 0 ? ` À noter : ${resultat.notes.join(" ; ")}.` : "";

      const noteSecondePasse = resultat.reussiesEnSecondePasse.length > 0
        ? ` (${resultat.reussiesEnSecondePasse.join(", ")} : équipée(s) au 2e essai, conflit d'exotique résolu)`
        : "";

      if (resultat.echecs.length === 0) {
        setSucces(`${resultat.reussies} pièce(s) d'équipement équipée(s)${noteSecondePasse}.${noteRemplacements}`);
      } else {
        setSucces(resultat.reussies > 0 ? `${resultat.reussies} pièce(s) équipée(s)${noteSecondePasse}.${noteRemplacements}` : null);
        setErreur(
          `Échec sur ${resultat.echecs.length} pièce(s) : ` +
            resultat.echecs.map((e) => `${e.nom} — ${e.message}`).join(" ; ")
        );
      }
      // FR : le rappel s'ouvre même en cas d'échec partiel : la doctrine
      // reste à configurer dans tous les cas.
      setRappelDoctrineOuvert(true);
    } catch (e) {
      setErreur(`Équipement impossible : ${(e as Error).message}`);
    } finally {
      setEnCours(null);
    }
  }

  function LignePiece({ piece }: { piece: GearPiece }) {
    const estArme = (["cinetique", "energie", "lourde"] as (SlotArme | SlotArmure)[]).includes(piece.slot);
    // FR : ⚠️ AJOUT (04/08/2026) - popup "Détails" + infobulle, demande de
    // l'utilisateur : même fonctionnement que dans l'Inventaire/Coffre,
    // via les mêmes fonctions centrales (obtenirOptionsToutesColonnes,
    // texteSurvol) pour garantir un résultat identique. Limité aux armes
    // possédées (itemInstanceId défini), comme dans l'Inventaire.
    const [detailsOuverts, setDetailsOuverts] = useState(false);
    const colonnesDetails =
      detailsOuverts && db && piece.itemInstanceId && estArme
        ? obtenirOptionsToutesColonnes(db, piece.itemHash, piece.perkHashesReels ?? piece.perkHashes)   // ⚠️ v0.4.9 : le ✓ marque le roll RÉEL, jamais un perk simulé
        : [];
    return (
      <li style={{ marginBottom: "0.3rem" }}>
        {/* FR : ⚠️ CORRIGÉ (04/08/2026) - le libellé d'emplacement était
        empilé DANS la colonne de droite, au-dessus du nom - la colonne de
        gauche (miniature) n'ayant rien d'équivalent, ça décalait
        mécaniquement l'icône de catégorie et le nom (signalé par
        l'utilisateur via capture d'écran). Il passe maintenant sur sa
        propre ligne, au-dessus de tout le bloc icône+nom, pour que les
        deux colonnes démarrent exactement à la même hauteur.
        EN: ⚠️ FIXED (2026-08-04) - the slot label was stacked INSIDE the
        right column, above the name - the left column (thumbnail) having
        nothing equivalent, which mechanically offset the category icon
        and the name (reported by the user via screenshot). It now sits on
        its own line, above the whole icon+name block, so both columns
        start at exactly the same height. */}
        <span style={{ fontSize: "0.75rem", color: "#7d7a70" }}>{LIBELLES_SLOT[piece.slot]}</span>
        <div title={db ? texteSurvol(piece, db) : undefined} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", width: 35, flexShrink: 0 }}>
            {piece.icone && (
              <img src={piece.icone} alt="" width={31} height={31} style={{ borderRadius: 4 }} />
            )}
            {!estArme && <IconeSlotArmure slot={piece.slot as SlotArmure} taille={20} />}
            {estArme && <IconeTypeArme typeArme={piece.typeArme} slot={piece.slot} munition={db ? obtenirTypeMunition(db, piece.itemHash) : undefined} categories={db ? obtenirCategoriesObjet(db, piece.itemHash) : undefined} {...(db ? obtenirSecoursTypeArme(db, piece.itemHash) : {})} taille={35} />}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
              {piece.elementArmeIcone && (
                <img src={piece.elementArmeIcone} alt="" title={piece.elementArme} width={16} height={16} style={{ borderRadius: 3 }} />
              )}
              {/* FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - type de munitions, à droite de l'élément. / EN: ammo type, right of the element. */}
              {estArme && <IconeMunitionArme db={db} itemHash={piece.itemHash} taille={16} />}
              <span>
                {piece.nom ? raccourcirNom(piece.nom) : "(objet placeholder)"} {piece.isExotic && <span style={{ color: "#d4af37" }}>★</span>}
              </span>
              {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - BADGE « simulé » : cette arme porte des perks choisis dans la Forge (ils comptent dans le score, pas en jeu). / EN: ⚠️ ADDED - "simulated" badge. */}
              {piece.perksSimules && (
                <span data-badge-simule="" title={`${piece.nbColonnesSimulees} colonne(s) de perks simulées dans la Forge : prises en compte dans le score, pas appliquées en jeu.`} style={{ fontSize: "0.7rem", color: "#e8c547", border: "1px solid #e8c547", borderRadius: 999, padding: "0 0.4rem", cursor: "help" }}>
                  🔨 simulé
                </span>
              )}
              {/* FR : ⚠️ AJOUT (04/08/2026) - repère 🛡️ aussi dans "Mon
              Build" (il n'existait que dans l'Inventaire/Coffre), demande
              de l'utilisateur. Même infobulle détaillée. */}
              {!estArme && db && (() => {
                const set = obtenirBonusSet(db, piece.itemHash);
                if (!set) return null;
                const detail = set.perks
                  .map((p) => `${p.requiredSetCount} pièces — ${p.nom}${p.description ? `\n   ${p.description}` : ""}`)
                  .join("\n\n");
                return (
                  <span title={`Set "${set.nomSet}"\n\n${detail}`} style={{ fontSize: "0.75rem", cursor: "help" }}>
                    🛡️
                  </span>
                );
              })()}
              {/* FR : ⚠️ RETIRÉ (04/08/2026) - les icônes anti-champion
              étaient ici, sur la ligne du NOM. Elles sont désormais affichées
              avec les perks, séparées par un tiret quadratin, exactement
              comme dans l'Inventaire et le Coffre (demande de l'utilisateur).
              Les garder aux deux endroits aurait produit un doublon. */}
            </span>
            {db && (() => {
              // FR : ⚠️ ALIGNÉ SUR L'INVENTAIRE (04/08/2026) - même présentation
              // exacte : 5 colonnes de perks, puis la particularité d'origine,
              // puis l'anti-champion séparé par un tiret quadratin. L'utilisateur
              // a signalé que "Mon Build" divergeait de l'Inventaire sur ce point.
              // EN: ⚠️ ALIGNED WITH INVENTORY - same exact layout: 5 perk columns,
              // then the origin trait, then the anti-champion icon separated by an
              // em dash.
              const perksArme = obtenirIconesPerksArme(db, piece.perkHashes, 5);
              const champion = estArme ? obtenirAntiChampion(db, piece.itemHash) : undefined;
              const championArmure = !estArme && piece.isExotic ? obtenirAntiChampionArmure(db, piece.itemHash) : undefined;
              if (perksArme.colonnes.length === 0 && !perksArme.origine && !champion && !championArmure) return null;
              return (
                <span style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                  {perksArme.colonnes.map((src, i) => (
                    <img key={i} src={src} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
                  ))}
                  {perksArme.origine && (
                    <img
                      src={perksArme.origine.icone}
                      alt={perksArme.origine.nom}
                      title={`${perksArme.origine.nom} (particularité d'origine)${
                        perksArme.origine.description ? `\n\n${perksArme.origine.description}` : ""
                      }`}
                      width={16}
                      height={16}
                      style={{ borderRadius: 3, marginLeft: "3px" }}
                    />
                  )}
                  {(champion || championArmure) && (perksArme.colonnes.length > 0 || perksArme.origine) && (
                    <span style={{ color: "#3a3f4b", margin: "0 2px", fontSize: "0.8rem" }}>—</span>
                  )}
                  {champion && <IconeAntiChampion type={champion} taille={16} />}
                  {championArmure && (
                    <span title={`Anti-${championArmure.type} — via le perk exotique « ${championArmure.source} »`}>
                      <IconeAntiChampion type={championArmure.type} taille={16} />
                    </span>
                  )}
                </span>
              );
            })()}
          </div>

          {/* FR : ⚠️ CHANGÉ (04/08/2026) - "Détails" passe SOUS "Équiper"
          (demande explicite), colonne dédiée à droite pour un alignement
          propre entre les deux boutons (même largeur minimale). */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "stretch", flexShrink: 0, minWidth: "140px" }}>
            {piece.itemInstanceId ? (
              <button
                style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}
                disabled={!membership || !personnageCible || !!enCours}
                onClick={() => gererEquiper(piece)}
              >
                {enCours === piece.itemInstanceId ? "Équipement..." : "Équiper"}
              </button>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "#7d7a70" }}>(non possédé)</span>
            )}
            {piece.itemInstanceId && (
              <button style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }} onClick={() => setDetailsOuverts((v) => !v)}>
                Détails
              </button>
            )}
          </div>
        </div>

        {/* FR : ⚠️ AJOUT (04/08/2026) - popup "Détails", même structure
        que dans l'Inventaire/Coffre (fond assombri, centrée, fermeture
        par ✕ ou clic en dehors), pour un comportement identique. */}
        {detailsOuverts && db && (
          <div
            onClick={() => setDetailsOuverts(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(13,15,20,0.6)",
              zIndex: 1000,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "10vh",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(90vw, 480px)",
                maxHeight: "75vh",
                overflowY: "auto",
                background: "#161922",
                border: "1px solid #3a3f4b",
                borderRadius: 10,
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <strong style={{ fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span>{piece.nom}</span>
                    <IconeTypeArme typeArme={piece.typeArme} slot={piece.slot} munition={db ? obtenirTypeMunition(db, piece.itemHash) : undefined} categories={db ? obtenirCategoriesObjet(db, piece.itemHash) : undefined} {...(db ? obtenirSecoursTypeArme(db, piece.itemHash) : {})} taille={35} />
                    <IconeElementArme db={db} itemHash={piece.itemHash} taille={16} />
                    {/* FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - type de munitions, à droite de l'élément. / EN: ammo type, right of the element. */}
                    <IconeMunitionArme db={db} itemHash={piece.itemHash} taille={16} />
                    {(() => {
                      const champion = obtenirAntiChampion(db, piece.itemHash);
                      return champion ? <IconeAntiChampion type={champion} taille={16} /> : null;
                    })()}
                  </strong>
                  {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - BOUTON « FORGE » de la fenêtre Détails de Mon Build (armes possédées seulement) : la Forge s'ouvre sur cette arme à partir de son roll RÉEL ; « Retour » ramène ici. / EN: ⚠️ ADDED - Forge button of Mon Build's Details window. */}
                  {onOuvrirForge && estArme && piece.itemInstanceId && (
                    <div>
                      <button data-ouvrir-forge="" onClick={() => onOuvrirForge(piece)} style={{ fontSize: "0.75rem", marginTop: "0.4rem", padding: "0.15rem 0.5rem" }}>
                        🔨 Forge : choisir les perks de cette arme
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDetailsOuverts(false)}
                  style={{ background: "none", border: "none", color: "#7d7a70", fontSize: "1rem", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </div>
              {/* FR : ⚠️ AJOUT (04/08/2026) - bonus de Set dans la popup
              "Détails" des armures de Mon Build, comme dans
              l'Inventaire/Coffre. */}
              {!estArme && (() => {
                const set = obtenirBonusSet(db, piece.itemHash);
                if (!set) return (
                  <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>
                    Cette armure ne fait partie d'aucun set.
                  </p>
                );
                return (
                  <div>
                    <strong style={{ fontSize: "0.8rem" }}>🛡️ Set « {set.nomSet} »</strong>
                    {set.perks.map((p) => (
                      <div key={p.requiredSetCount} style={{ marginTop: "0.4rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "#7aa2f7", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          {p.icone && <img src={p.icone} alt="" width={16} height={16} style={{ borderRadius: 3 }} />}
                          {p.requiredSetCount} pièces — {p.nom}
                        </div>
                        {p.description && (
                          <div style={{ fontSize: "0.72rem", color: "#b7b3a8", marginLeft: "0.3rem" }}>{surlignerVerbesConnus(p.description)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              {/* FR : ⚠️ AJOUT (24/08/2026) - particularité d'origine dans la
              popup « Détails » de Mon Build, comme dans l'Inventaire (demande
              de l'utilisateur : « applicable partout »). Recalculée ici car
              `perksArme` est local à la fonction de rendu de la ligne, hors
              de portée de la popup. */}
              {estArme && db && (() => {
                const origine = obtenirIconesPerksArme(db, piece.perkHashes, 5).origine;
                if (!origine) return null;
                return (
                  <div style={{ marginBottom: "0.8rem" }}>
                    <strong style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                      <img src={origine.icone} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
                      {origine.nom}
                      <span style={{ color: "#7d7a70", fontWeight: 400, fontSize: "0.72rem" }}>
                        (particularité d'origine)
                      </span>
                    </strong>
                    {origine.description && (
                      <div style={{ fontSize: "0.72rem", color: "#b7b3a8", marginTop: "0.2rem" }}>
                        {surlignerVerbesConnus(origine.description)}
                      </div>
                    )}
                  </div>
                );
              })()}
              {estArme && colonnesDetails.length === 0 && (
                <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucune option trouvée pour cette arme.</p>
              )}
              {ordonnerColonnesPourAffichage(colonnesDetails).map((col) => (
                <div key={col.socketIndex} style={{ marginBottom: "0.6rem" }}>
                  <strong style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
                    {libelleColonne(col)}
                  </strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
                    {col.options.map((opt) => (
                      <span
                        key={opt.hash}
                        title={opt.description}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.15rem 0.5rem",
                          borderRadius: 999,
                          border: opt.equipeEnJeu ? "1px solid #7aa2f7" : "1px solid #2a2e38",
                          color: opt.equipeEnJeu ? "#e8e6df" : "#7d7a70",
                          background: opt.equipeEnJeu ? "#1a2436" : "transparent",
                        }}
                      >
                        {opt.equipeEnJeu ? "✓ " : ""}
                        {opt.nom}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </li>
    );
  }

  // FR : section Doctrine détaillée - toutes les options par catégorie,
  // avec la sélection actuelle mise en évidence et les effets (description)
  // des options sélectionnées affichés en clair.
  const groupesDoctrine =
    db && build.subclass.subclassItemHash ? obtenirOptionsSousClasse(db, build.subclass.subclassItemHash) : [];

  function estSelectionne(categorie: CategorieSocket, hash: number): boolean {
    if (categorie === "super") return build.subclass.superHash === hash;
    if (categorie === "melee") return build.subclass.meleeHash === hash;
    if (categorie === "grenade") return build.subclass.grenadeHash === hash;
    if (categorie === "classe") return build.subclass.classeHash === hash;
    if (categorie === "saut") return build.subclass.sautHash === hash;
    if (categorie === "aspect") return build.subclass.aspectHashes.includes(hash);
    if (categorie === "fragment") return build.subclass.fragmentHashes.includes(hash);
    return false;
  }

  return (
    <details open className="pilier-carte bloc-repliable">
      {/* FR : ⚠️ CHANGÉ (27/09/2026, v0.2.3) - bloc repliable, comme le Coffre
      (demande de l'utilisateur). Ouvert par défaut : rien ne change au
      lancement, on replie ce qu'on veut. Style dans index.css (.bloc-repliable).
      EN: ⚠️ CHANGED - collapsible block like the Vault, open by default. */}

      <summary>
        <span className="bloc-repliable-ligne">
        <TitreRepliable categorie="mon-build" />
        </span>
      </summary>
      {/* FR : ⚠️ AJOUT (07/10/2026, v0.3.17) - les quatre boutons de CONTEXTE, en partie haute du bloc, sous le titre (demande de l'utilisateur) ; même composant et même échelle que dans l'ancienne ligne. Repliés avec le bloc. / EN: ⚠️ ADDED - the four context buttons, at the top of the block. */}
      {contexte !== undefined && onChangerContexte && (
        <div data-contexte-dans-build="" style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          {ORDRE_CONTEXTES.map((valeur) => (
            <PastilleContexte key={valeur} valeur={valeur} libelle={LIBELLES_CONTEXTE[valeur]} actif={contexte === valeur} onChoisir={() => onChangerContexte(valeur)} echelle={ECHELLE_CONTEXTE_RANGEE} />
          ))}
        </div>
      )}
      {/* FR : ⚠️ DÉPLACÉ (26/08/2026) - venait de DashboardPage.tsx, juste
      au-dessus de ce bloc ; demande de l'utilisateur de le rapprocher du
      titre auquel elle se rapporte. Le nom du build ("Build : X") qui
      précédait cette phrase était devenu obsolète et a été supprimé, pas
      déplacé.
      EN: ⚠️ MOVED - was in DashboardPage.tsx, just above this block. The
      build name text that preceded this sentence had gone stale and was
      removed, not moved. */}
      <p style={{ fontSize: "0.8rem", color: "#b7b3a8", marginTop: "-0.25rem" }}>
        Utilisez la recherche ou votre inventaire ci-dessus pour ajouter vos propres
        armes/armures ; la sélection de classe a un vrai effet sur le score.
      </p>
      {/* FR : ⚠️ CHANGÉ (26/08/2026) - mention "bêta" retirée (demande de
      l'utilisateur), le message de vérification est conservé tel quel.
      Nouvelle mise en garde ajoutée : le transfert d'objets ne fonctionne
      QUE hors mission (orbite ou hors-ligne) - une contrainte du jeu lui-
      même (Bungie bloque les transferts pendant une activité en cours),
      pas une limite de l'appli, mais jamais mentionnée jusqu'ici.
      EN: ⚠️ CHANGED - "beta" wording removed. New warning added: item
      transfer only works outside an activity (orbit or offline) - a game
      constraint, not an app limitation, but never mentioned until now. */}
      <p style={{ fontSize: "0.75rem", color: "#7d7a70", marginTop: "-0.25rem" }}>
        Le bouton "Équiper" ci-dessous agit réellement sur votre compte — vérifiez le résultat
        en jeu après usage. Le transfert d'objets ne peut se faire qu'en orbite ou hors-ligne,
        jamais en pleine mission, assaut, raid, donjon ou match d'Épreuves.
      </p>

      {personnages.length > 0 && (
        <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>
          Équiper sur :{" "}
          <select value={personnageCible} onChange={(e) => setPersonnageCible(e.target.value)}>
            {personnages.map((p) => (
              <option key={p.characterId} value={p.characterId}>
                {p.classe} (lumière {p.lumiere})
              </option>
            ))}
          </select>
        </label>
      )}

      {avertissementExotiques && (
        <p style={{ fontSize: "0.8rem", color: "#e0c080", border: "1px solid #4a3a1a", borderRadius: 6, padding: "0.5rem 0.75rem", marginBottom: "0.5rem" }}>
          ⚠️ Ce build contient <strong>{avertissementExotiques}</strong> — en jeu, une seule arme
          exotique et une seule armure exotique peuvent être équipées à la fois. Équiper ce build
          remplacera automatiquement les exotiques précédemment équipés par les derniers de la liste.
        </p>
      )}

      {/* FR : ⚠️ DÉPLACÉ (04/08/2026) - le bouton "Réinitialiser" était
      plus haut dans la page (près du nom du build), il est maintenant
      juste à droite du bouton "Équiper", demande de l'utilisateur. Les
      deux sont sur la même ligne ; "Réinitialiser" reste visible même
      quand "Équiper" ne l'est pas (aucune pièce équipable). */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {piecesEquipables.length > 0 && (
          <button onClick={gererEquiperTout} disabled={!membership || !personnageCible || !!enCours}>
            {enCours === "__tout__"
              ? "Équipement en cours..."
              : `Équiper le build en jeu — ${piecesEquipables.length} pièce(s)`}
          </button>
        )}
        {/* FR : ⚠️ AJOUT (24/08/2026) - diagnostic ponctuel pour "Signal
        perdu" : interroge Bungie DIRECTEMENT sur un itemInstanceId précis
        (Destiny2.GetItem), sans transfert ni équipement. Deux hypothèses
        déjà écartées avec certitude par des tests réels (donnée périmée,
        corruption de précision) - celle-ci vérifie si Bungie reconnaît
        encore l'objet, indépendamment de mes propres requêtes. */}
        {import.meta.env.DEV && membership && (
          <button
            onClick={async () => {
              const id = window.prompt("itemInstanceId à vérifier :", "6917530198022312588");
              if (!id) return;
              try {
                const resultat = await diagnostiquerExistenceObjet(membership, id);
                window.alert(resultat);
              } catch (e) {
                window.alert(`Diagnostic échoué : ${(e as Error).message}`);
              }
            }}
            style={{ fontSize: "0.7rem" }}
          >
            🔍 Vérifier un objet chez Bungie (dev)
          </button>
        )}
        {onReinitialiser && (
          <button onClick={onReinitialiser} style={{ fontSize: "0.8rem" }}>
            ✕ Réinitialiser Mon Build
          </button>
        )}
      </div>

      {erreur && <p style={{ color: "#e08080" }}>⚠️ {erreur}</p>}
      {succes && <p style={{ color: "#7fd88f" }}>✅ {succes}</p>}

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <strong style={{ fontSize: "0.85rem" }}>Armes</strong>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0" }}>
            {armesTriees.map((piece) => (
              <LignePiece key={piece.itemInstanceId ?? `${piece.itemHash}-${piece.slot}`} piece={piece} />
            ))}
          </ul>
          {/* FR : ⚠️ CHANGÉ (04/08/2026) - encart anti-champions RÉDUIT
          (compact) et accompagné, à sa droite, du total des statistiques
          du build. Les deux blocs sont côte à côte avec `alignItems:
          stretch` pour occuper exactement la même hauteur, quelle que
          soit celle du contenu. Ordre des stats identique à celui du
          scoring (voir lib/scoring/stats.ts) pour éviter toute
          divergence entre affichage et calcul.
          EN: ⚠️ CHANGED (2026-08-04) - anti-champion box made COMPACT and
          paired, on its right, with the build's total statistics. Both
          boxes sit side by side with `alignItems: stretch` so they take
          exactly the same height. Stats order matches the scoring's
          (see lib/scoring/stats.ts) to avoid any divergence between
          display and computation. */}
          {db && (
            <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", alignItems: "stretch", flexWrap: "wrap" }}>
              <div style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.4rem 0.6rem", flexShrink: 0 }}>
                <div style={{ fontSize: "0.7rem", color: "#7d7a70", marginBottom: "0.25rem" }}>Anti-champions</div>
                {/* FR : ⚠️ CORRIGÉ (24/08/2026) - BUG trouvé par
                l'utilisateur : ce résumé avait sa PROPRE logique, jamais
                synchronisée avec le calcul du Pilier 4, et ne vérifiait
                MÊME QUE LES ARMES (jamais les armures exotiques, jamais la
                doctrine). Un build sous Radiance seule (couverture Bloqueur
                via doctrine) montrait le Pilier 4 correct mais la case
                Bloqueur restait décochée ici. Utilise désormais
                `obtenirChampionsCouverts`, fonction PARTAGÉE avec
                `pillars.ts` - les deux ne peuvent plus diverger.
                EN: ⚠️ FIXED - this summary had its OWN logic, never synced
                with Pillar 4, and only ever checked WEAPONS. Now uses the
                SHARED `obtenirChampionsCouverts` function. */}
                {(() => {
                  const championsDetectes = obtenirChampionsCouverts(build, db);
                  return (["bloqueur", "implacable", "surcharge"] as TypeChampion[]).map((type) => (
                    <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", marginBottom: "1px" }}>
                      <span>{championsDetectes.has(type) ? "☑" : "☐"}</span>
                      <IconeAntiChampion type={type} taille={16} />
                      <span>{LIBELLES_CHAMPION[type]}</span>
                    </div>
                  ));
                })()}
              </div>

              <div style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.4rem 0.6rem", flex: 1, minWidth: "150px" }}>
                <div style={{ fontSize: "0.7rem", color: "#7d7a70", marginBottom: "0.25rem" }}>Statistiques du build</div>
                {(() => {
                  const ORDRE: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
                  const LIBELLES: Record<StatKey, string> = {
                    sante: "Santé",
                    melee: "Mêlée",
                    grenade: "Grenade",
                    super: "Super",
                    classe: "Classe",
                    arme: "Arme",
                  };
                  // FR : ⚠️ CORRIGÉ (24/08/2026) - « Mon Build » n'additionnait
                  // QUE les stats d'armure, en ignorant les bonus de stats des
                  // FRAGMENTS. Le Pilier 5, lui, les comptait déjà — d'où
                  // l'incohérence signalée par l'utilisateur, qui l'a
                  // diagnostiquée lui-même : « Tison de charbon » (+10 Grenade)
                  // et « Tison empyréen » (−10 Santé) expliquaient exactement
                  // les deux écarts constatés.
                  //
                  // On réutilise désormais les MÊMES fonctions que le Pilier 5
                  // (`sommerStatsArmure` + `obtenirBonusStatsDoctrine`) au lieu
                  // d'un calcul local. Deux calculs indépendants finissent
                  // toujours par diverger : c'est arrivé deux fois sur ce même
                  // affichage.
                  //
                  // EN: ⚠️ FIXED - "Mon Build" only summed ARMOR stats, ignoring
                  // FRAGMENT stat bonuses, which Pillar 5 already counted. The
                  // user diagnosed it himself. We now reuse the SAME functions
                  // as Pillar 5 rather than a local computation: two
                  // independent calculations always end up diverging.
                  const totaux = sommerStatsArmure(build.armure) as Record<StatKey, number>;
                  if (db) {
                    const bonusDoctrine = obtenirBonusStatsDoctrine(db, build.subclass);
                    for (const [cle, valeur] of Object.entries(bonusDoctrine) as [StatKey, number][]) {
                      totaux[cle] = (totaux[cle] ?? 0) + valeur;
                    }
                  }
                  return ORDRE.map((cle) => {
                    // FR : ⚠️ AJOUT (04/08/2026) - barres de progression,
                    // demande de l'utilisateur. On réutilise STAT_MAX du
                    // module de scoring plutôt qu'un 200 codé en dur ici :
                    // si le plafond change (Bungie l'a déjà fait), les
                    // barres et le score resteront d'accord entre eux.
                    // EN: ⚠️ ADDED (2026-08-04) - progress bars, user
                    // request. We reuse the scoring module's STAT_MAX
                    // rather than hardcoding 200 here: if the cap changes
                    // (Bungie has done it before), bars and score stay in
                    // agreement.
                    const valeur = totaux[cle];
                    // FR : ⚠️ CORRIGÉ (24/08/2026) - signalé par l'utilisateur :
                    // une stat négative affichait une barre bien visible au
                    // lieu d'une barre vide. Cause : `Math.min(100, ...)`
                    // bornait le haut mais pas le bas, produisant un
                    // `width: -5%` - une valeur CSS INVALIDE. Le navigateur ne
                    // la ramène pas silencieusement à 0 : il rejette toute la
                    // déclaration, et la barre retombe sur un comportement par
                    // défaut qui peut occuper une largeur arbitraire selon le
                    // contexte. D'où la barre visible pour une valeur négative.
                    // Borné à 0 des deux côtés désormais, et teinte rouge
                    // discrète pour distinguer visuellement un vrai négatif
                    // d'un zéro normal.
                    // EN: ⚠️ FIXED - a negative stat showed a clearly visible
                    // bar instead of an empty one. Cause: only the upper
                    // bound was clamped, producing an INVALID CSS
                    // `width: -5%`. Browsers don't silently clamp this to 0:
                    // they reject the whole declaration, falling back to a
                    // default that can occupy an arbitrary width. Now clamped
                    // on both sides, with a subtle red tint for negatives.
                    const pourcent = Math.max(0, Math.min(100, Math.round((valeur / STAT_MAX) * 100)));
                    const estNegatif = valeur < 0;
                    return (
                      <div key={cle} style={{ marginBottom: "3px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", fontSize: "0.72rem" }}>
                          <span style={{ color: "#b7b3a8" }}>{LIBELLES[cle]}</span>
                          <span style={{ color: estNegatif ? "#e08080" : undefined }}>{valeur}</span>
                        </div>
                        <div
                          style={{ height: 4, background: "#2a2e38", borderRadius: 2, overflow: "hidden" }}
                          title={`${valeur} / ${STAT_MAX}`}
                        >
                          <div style={{ width: `${pourcent}%`, height: "100%", background: estNegatif ? "#8b4a4a" : "#7aa2f7" }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <strong style={{ fontSize: "0.85rem" }}>Armure</strong>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0" }}>
            {armureTriee.map((piece) => (
              <LignePiece key={piece.itemInstanceId ?? `${piece.itemHash}-${piece.slot}`} piece={piece} />
            ))}
          </ul>
          {/* FR : ⚠️ AJOUT (04/08/2026) - bonus de Set ACTIFS parmi
          l'armure équipée (contrairement à l'infobulle d'une pièce
          isolée, qui liste tous les paliers possibles sans savoir
          combien de pièces du même set sont équipées ailleurs). On
          compte les pièces PAR SET, puis on ne garde que les paliers dont
          le seuil est atteint. Structure confirmée par diagnostic réel
          (obtenirBonusSet).
          EN: ⚠️ ADDED (2026-08-04) - ACTIVE Set bonuses among equipped
          armor (unlike a single piece's tooltip, which lists every
          possible tier without knowing how many pieces of the same set
          are equipped elsewhere). Pieces are counted PER SET, then only
          tiers whose threshold is met are kept. */}
          {setsAvecBonusActif.length > 0 && (
            <div style={{ marginTop: "0.6rem", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.4rem 0.6rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#7d7a70", marginBottom: "0.25rem" }}>Bonus de Set actifs</div>
              {setsAvecBonusActif.map((s) => (
                <div key={s.nom} style={{ marginBottom: "0.3rem" }}>
                  <div style={{ fontSize: "0.72rem" }}>
                    🛡️ {s.nom} ({s.count} pièce{s.count > 1 ? "s" : ""})
                  </div>
                  {s.actifs.map((p) => (
                    <div key={p.requiredSetCount} style={{ marginLeft: "1.1rem", marginBottom: "0.2rem" }}>
                      <div style={{ fontSize: "0.7rem", color: "#7fd88f" }}>
                        ✓ {p.requiredSetCount}p — {p.nom}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#b7b3a8", marginLeft: "0.3rem" }}>
                        {surlignerVerbesConnus(p.description)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FR : ⚠️ CHANGÉ (27/09/2026, v0.2.3) - section Doctrine repliable,
      RÉDUITE par défaut (demande de l'utilisateur : « pareil que le
      Coffre »). Même présentation que le Coffre : cadre, titre en gras,
      triangle ▶/▼. Le nom de la sous-classe reste visible dans le titre
      même replié.
      EN: ⚠️ CHANGED - collapsible Doctrine section, COLLAPSED by default,
      styled like the Vault. The subclass name stays visible when folded. */}
      <details style={{ marginTop: "1rem", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
          <span>Doctrine — {build.subclass.element ? LIBELLES_ELEMENT[build.subclass.element] : "aucune sous-classe choisie"}</span>
        </summary>

        {!db && (
          <p style={{ fontSize: "0.75rem", color: "#7d7a70" }}>Chargez le Manifest pour voir le détail.</p>
        )}
        {db && !build.subclass.subclassItemHash && (
          <p style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
            Choisissez une sous-classe dans le bloc "Doctrine (Pilier 1)" ci-dessus.
          </p>
        )}

        {(() => {
          function BlocGroupe({ groupe }: { groupe: GroupeSocket }) {
            // FR : ⚠️ CORRIGÉ (03/08/2026) - léger décalage signalé : la
            // grille des Fragments avait son propre retrait/espacement,
            // différents des blocs voisins (qui sont des cellules de
            // grille séparées, chacune avec son propre retrait). On garde
            // maintenant le MÊME paddingLeft (1.1rem) pour un alignement
            // cohérent du début du texte.
            // EN: ⚠️ FIXED (2026-08-03) - slight misalignment reported: the
            // Fragments grid had its own indent/spacing, different from
            // neighboring blocks (which are separate grid cells, each with
            // their own indent). Now keeps the SAME paddingLeft (1.1rem)
            // for a consistent text-start alignment.
            const styleListe =
              groupe.categorie === "fragment"
                ? { margin: "0.25rem 0 0", paddingLeft: 0, fontSize: "0.8rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: "1.5rem" }
                : { margin: "0.25rem 0 0", paddingLeft: 0, fontSize: "0.8rem" };
            return (
              <div style={{ flex: 1, minWidth: "160px" }}>
                <span style={{ fontSize: "0.8rem", color: "#b7b3a8" }}>
                  {groupe.categorie === "autre" ? groupe.nomReel : LIBELLES_CATEGORIE[groupe.categorie]} :
                </span>
                <ul style={styleListe}>
                  {groupe.options.map((opt) => {
                    const selectionne = estSelectionne(groupe.categorie, opt.hash);
                    return (
                      <li key={opt.hash} style={{ color: selectionne ? "#e8e6df" : "#7d7a70" }}>
                        {selectionne ? "✅ " : "◯ "}
                        <strong>{opt.nom}</strong>
                        {selectionne && opt.description && (
                          <div style={{ fontSize: "0.75rem", color: "#b7b3a8", marginLeft: "1.2rem", whiteSpace: "pre-wrap" }}>
                            {surlignerVerbesConnus(formaterDescriptionAvecRetours(opt.description))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }

          // FR : ⚠️ CHANGÉ (03/08/2026) - "Mon Build" utilise maintenant un
          // ordre spécifique (3 par ligne), différent de celui du bloc
          // "Doctrine (Pilier 1)" (2 par ligne) - demande explicite de
          // l'utilisateur pour cette section précise.
          // EN: ⚠️ CHANGED (2026-08-03) - "Mon Build" now uses a specific
          // order (3 per row), different from the "Doctrine (Pillar 1)"
          // block (2 per row) - explicit user request for this specific
          // section.
          const ORDRE_MON_BUILD: CategorieSocket[][] = [
            ["super", "aspect", "saut"],
            ["classe", "melee", "grenade"],
            ["fragment"],
          ];
          const categoriesPlacees = new Set(ORDRE_MON_BUILD.flat());
          const groupesRestants = groupesDoctrine.filter((g) => !categoriesPlacees.has(g.categorie));

          return (
            <>
              {ORDRE_MON_BUILD.map((ligne, i) => {
                const groupesLigne = ligne.map((cat) => groupesDoctrine.find((g) => g.categorie === cat)).filter(Boolean) as GroupeSocket[];
                if (groupesLigne.length === 0) return null;
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${groupesLigne.length}, 1fr)`,
                      gap: "1.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {groupesLigne.map((groupe) => (
                      <BlocGroupe key={groupe.categorie} groupe={groupe} />
                    ))}
                  </div>
                );
              })}
              {groupesRestants.map((groupe) => (
                <div key={groupe.categorie} style={{ marginTop: "0.5rem" }}>
                  <BlocGroupe groupe={groupe} />
                </div>
              ))}
            </>
          );
        })()}
      </details>
      {/* FR : ⚠️ AJOUT (26/08/2026) - pop-up de rappel de doctrine, partagée
      avec PanneauLoadouts (RappelDoctrine.tsx). Demande de cohérence de
      l'utilisateur : le bouton "Équiper le build en jeu" doit se comporter
      comme celui des Loadouts après un équipement.
      EN: ⚠️ ADDED - doctrine reminder popup, shared with PanneauLoadouts. */}
      {rappelDoctrineOuvert && (
        <RappelDoctrine
          nomContexte={build.nom}
          subclass={build.subclass}
          db={db}
          onFermer={() => setRappelDoctrineOuvert(false)}
        />
      )}
    </details>
  );
}

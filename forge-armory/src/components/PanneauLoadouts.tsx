// FR : Panneau latéral des loadouts, fixé à droite et suivant le
// défilement de la page (demande de l'utilisateur). Repliable, pour ne
// pas manger de la largeur en permanence sur les écrans étroits.
//
// EN: Loadouts side panel, fixed on the right and following page scroll
// (user request). Collapsible, so it doesn't permanently eat width on
// narrow screens.

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { BuildDraft, GearPiece } from "../types/build";
import { Database } from "sql.js";
import { DestinyMembership } from "../lib/bungie/api";
import IconeClasse from "./icones/IconeClasse";
import IconeAntiChampion, { TypeChampion } from "./icones/IconeAntiChampion";
import IconeLoadout, { CleIconeLoadout } from "./icones/IconeLoadout";
import ModifierLoadout from "./ModifierLoadout";
import ExporterLoadout from "./ExporterLoadout";
import ChoixPersonnageEquipement from "./ChoixPersonnageEquipement";
import { CibleEquipement, PersonnageCompte, determinerCible } from "../lib/loadouts/classePersonnage";
import IconeElement from "./icones/IconeElement";
import BadgeContexte from "./icones/BadgeContexte";
import RappelDoctrine, { doctrineAConfigurer } from "./RappelDoctrine";
import FicheBuild from "./FicheBuild";
import { telechargerFichierTexte } from "../lib/telechargement";
import { construireFiche } from "../lib/loadouts/fiche";
import { obtenirIconeElementDoctrine, obtenirIconePerkDoctrine, obtenirNomPerkDoctrine } from "../lib/manifest/doctrine";
import BarreRechercheLoadouts from "./BarreRechercheLoadouts";
import ZoneEnregistrement from "./ZoneEnregistrement";
import { CRITERES_VIDES, CriteresLoadouts, construireIndexRecherche, criteresActifs, filtrerLoadouts, valeursDisponibles } from "../lib/loadouts/recherche";
import { DamageElement } from "../types/build";
import { equiperPlusieursObjets } from "../lib/bungie/equiper";
import {
  Loadout,
  listerLoadouts,
  supprimerLoadout,
  modifierInfosLoadout,
  trouverPiecesManquantes,
  repererEtSauvegarder,
  exporterLoadouts,
  exporterUnLoadout,
  importerLoadouts,
  EVENEMENT_LOADOUTS_MODIFIES,
  definirStockeEnJeu,
  deplacerLoadout,
  placerLoadout,
} from "../lib/loadouts/stockage";

interface Props {
  /**
   * FR : ⚠️ CORRIGÉ (07/10/2026, v0.3.11) - le build en cours et le pseudo de l'auteur, UNIQUEMENT pour la zone d'enregistrement du TIROIR latéral repliable (mode « tiroir »). L'utilisateur avait confondu « tiroir » et « onglet » : la zone devait rester
   * dans le tiroir (comme depuis longtemps) et être absente du nouvel onglet « Load-outs » (mode « page »), qui n'en a pas besoin. FACULTATIVES : sans `build`, aucune zone n'est affichée.
   * EN: ⚠️ CORRECTED - the current build and the author's handle, ONLY for the SIDE DRAWER's save area (the user had mixed up "drawer" and "tab"); the new Load-outs tab (page mode) has none. Optional.
   */
  build?: BuildDraft;
  auteur?: string | null;
  /** FR : objets réellement possédés, pour repérer les pièces manquantes d'un loadout. null tant que l'inventaire n'est pas chargé. / EN: actually owned items, to spot a loadout's missing pieces. null until inventory is loaded. */
  objetsPossedes: GearPiece[] | null;
  onChargerLoadout: (build: BuildDraft) => void;
  /** FR : nécessaires pour équiper un loadout en jeu. Absents = bouton d'équipement masqué (pas de bouton qui échouerait à coup sûr). / EN: needed to equip a loadout in game. Absent = equip button hidden (no button that would certainly fail). */
  membership?: DestinyMembership | null;
  personnages?: { characterId: string; classe: string; lumiere: number }[];
  /** FR : nécessaire pour résoudre les NOMS des éléments de doctrine dans le rappel affiché après équipement. / EN: needed to resolve the NAMES of subclass elements in the reminder shown after equipping. */
  db?: Database | null;
  /**
   * FR : ⚠️ AJOUT (06/10/2026, v0.3.5) - présentation. « tiroir » (défaut, comme avant) : volet latéral repliable, fixé à droite. « page » : le MÊME panneau (mêmes actions, mêmes fenêtres Modifier, Exporter et choix du
   * personnage) affiché dans le flux de la page sur toute la largeur, cartes en grille : c'est l'onglet « Load-out » (demande du 05/10/2026). Un seul code pour les deux : aucune action dupliquée.
   * EN: ⚠️ ADDED - presentation. "tiroir" (default, as before): collapsible side drawer. "page": the SAME panel shown in the page flow, full width, cards in a grid: the "Load-out" tab.
   */
  mode?: "tiroir" | "page";
  /** FR : ⚠️ AJOUT (06/10/2026) - appelé juste après « Charger » : dans l'onglet « Load-out », la page revient au Build Analyzer pour montrer le build chargé. / EN: ⚠️ ADDED - called right after "Charger". */
  onApresCharger?: () => void;
}

/** FR : première lettre en majuscule. Les éléments sont stockés en minuscules ("abyssal") mais s'affichent capitalisés. / EN: capitalises the first letter. */
export default function PanneauLoadouts({ objetsPossedes, onChargerLoadout, membership, personnages = [], db = null, auteur = null, build, mode = "tiroir", onApresCharger }: Props) {
  const [ouvert, setOuvert] = useState(false);

  /**
   * FR : ⚠️ AJOUT (24/08/2026) - remplace les stats FIGÉES d'un loadout par
   * celles des objets réellement possédés aujourd'hui.
   *
   * Cause du bug corrigé : `enregistrerLoadout` fait un `structuredClone` du
   * build, ce qui fige les `GearPiece` AVEC leurs stats telles que calculées
   * au moment de la sauvegarde. Après la correction du masterwork, recharger
   * un ancien loadout réinjectait donc les ANCIENNES valeurs erronées dans
   * « Mon Build », pendant que le Pilier 5 recalculait correctement — d'où
   * l'incohérence entre les deux affichages signalée par l'utilisateur.
   *
   * Une pièce absente de l'inventaire garde ses stats d'origine (mieux que
   * rien), et l'avertissement ⚠️ signale déjà qu'elle est introuvable.
   *
   * EN: ⚠️ ADDED - replaces a loadout's FROZEN stats with those of the items
   * actually owned today. `enregistrerLoadout` deep-clones the build, freezing
   * stats as computed at save time; after the masterwork fix, loading an old
   * loadout re-injected the OLD wrong values while Pillar 5 recomputed
   * correctly - hence the reported mismatch.
   */
  function rafraichirStats(b: BuildDraft): BuildDraft {
    if (!objetsPossedes) return b;
    const parInstance = new Map(
      objetsPossedes.filter((o) => o.itemInstanceId).map((o) => [o.itemInstanceId!, o])
    );
    const remettreAJour = (pieces: GearPiece[]) =>
      pieces.map((p) => {
        const actuel = p.itemInstanceId ? parInstance.get(p.itemInstanceId) : undefined;
        return actuel ? { ...p, stats: actuel.stats, perkHashes: actuel.perkHashes } : p;
      });
    return { ...b, armes: remettreAJour(b.armes ?? []), armure: remettreAJour(b.armure ?? []) };
  }

  /**
   * FR : ⚠️ AJOUT (24/08/2026) - même logique que dans ResumeBuild.tsx :
   * détermine si un objet est déjà sur le personnage ciblé, pour savoir si
   * le transfert doit être sauté avant l'équipement.
   * EN: ⚠️ ADDED - same logic as in ResumeBuild.tsx: determines if an item
   * is already on the target character.
   */
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [equipementEnCours, setEquipementEnCours] = useState<string | null>(null);
  // FR : ⚠️ AJOUT (04/08/2026) - rappel de la Doctrine à configurer à la
  // main après équipement. L'API n'équipe pas la sous-classe ni ses
  // compétences : plutôt que de le signaler par une simple phrase vite
  // oubliée, on affiche la liste précise de ce qu'il reste à faire, avec
  // les vrais noms. Demande de l'utilisateur.
  const [rappelDoctrine, setRappelDoctrine] = useState<Loadout | null>(null);
  // FR : ⚠️ AJOUT (27/09/2026, v0.2.3) - loadout dont la fiche complète est
  // ouverte (bouton « 👁 Voir »), ou null.
  // EN: ⚠️ ADDED - loadout whose full sheet is open, or null.
  const [ficheOuverte, setFicheOuverte] = useState<Loadout | null>(null);
  // FR : ⚠️ CHANGÉ (01/10/2026, v0.3.0) - trois FENÊTRES remplacent la zone de saisie dans la
  // carte et les boutons « Icône », « Décrire », « Renommer » (demandes de l'utilisateur) :
  //   - `modif` : le loadout dont on modifie nom, description et icône (bouton « Modifier... ») ;
  //   - `exportEn` : le loadout à exporter (bouton « Exporter... ») ;
  //   - `choixPersonnage` : « Équiper en jeu » n'a pas pu déterminer seul le personnage.
  // EN: ⚠️ CHANGED - three WINDOWS replace the in-card edit area and the Icon/Describe/Rename buttons.
  const [modif, setModif] = useState<Loadout | null>(null);
  const [exportEn, setExportEn] = useState<Loadout | null>(null);
  const [choixPersonnage, setChoixPersonnage] = useState<{ loadout: Loadout; cible: Exclude<CibleEquipement, { cas: "direct" }> } | null>(null);

  function validerModification(infos: { nom: string; description: string; icone: string }) {
    if (!modif) return;
    const resultat = modifierInfosLoadout(modif.id, infos);
    rafraichir(resultat, `« ${infos.nom.trim()} » modifié.`);
    if (resultat.ok) setModif(null);
  }

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoadouts(listerLoadouts());
    // FR : ⚠️ AJOUT (06/10/2026, v0.3.5) - la liste se RECHARGE quand une autre instance du panneau la modifie (tiroir et onglet « Load-out » coexistent). / EN: ⚠️ ADDED - reloads when another instance changes the list.
    const recharger = () => setLoadouts(listerLoadouts());
    window.addEventListener(EVENEMENT_LOADOUTS_MODIFIES, recharger);
    return () => window.removeEventListener(EVENEMENT_LOADOUTS_MODIFIES, recharger);
  }, []);

  // FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - RECHERCHE ET FILTRES (phase 2), seulement dans l'onglet « Load-outs » (mode « page ») : le tiroir affiche toujours toute la liste. L'index de recherche est recalculé quand la liste
  // ou le Manifest change, PAS à chaque frappe ; les noms de la Doctrine ne sont inclus que si le Manifest est chargé (`db`). / EN: ⚠️ ADDED - search and filters (phase 2), Load-outs tab only; the index is rebuilt when the
  // list or the Manifest changes, not on every keystroke.
  const [criteres, setCriteres] = useState<CriteresLoadouts>(CRITERES_VIDES);
  const indexRecherche = useMemo(() => construireIndexRecherche(loadouts, db ? (hash) => obtenirNomPerkDoctrine(db, hash) : undefined), [loadouts, db]);
  const affiches = useMemo(() => (mode === "page" ? filtrerLoadouts(loadouts, criteres, indexRecherche) : loadouts), [mode, loadouts, criteres, indexRecherche]);
  const disponibles = useMemo(() => valeursDisponibles(loadouts, criteres), [loadouts, criteres]);

  // FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - ORDRE MODIFIABLE (phase 3 de l'onglet « Load-outs », mode « page » seulement) : boutons ◀ ▶ ET glisser-déposer (choix de l'utilisateur : « les deux »). L'ordre porte sur la liste COMPLÈTE : il n'est donc
  // modifiable que sans recherche ni filtre actif (réordonner un résultat de recherche serait ambigu) ; les contrôles sont alors grisés et l'infobulle explique pourquoi. `glisse` : le loadout en cours de glissement ; `cibleSurvol` : la carte
  // survolée (pour l'entourer) ; `refFocus` : après un déplacement par bouton, le focus clavier est REMIS sur le bouton utilisé (la carte change de place dans le DOM, le focus serait sinon perdu).
  // EN: ⚠️ ADDED - reorderable list (Load-outs tab only): ◀ ▶ buttons AND drag-and-drop; only without a search or filter; keyboard focus restored after a move.
  const [glisse, setGlisse] = useState<string | null>(null);
  const [cibleSurvol, setCibleSurvol] = useState<string | null>(null);
  const refFocus = useRef<{ id: string; bouton: "reculer" | "avancer" } | null>(null);
  useEffect(() => {
    const demande = refFocus.current;
    if (!demande) return;
    refFocus.current = null;
    const carte = [...document.querySelectorAll<HTMLElement>("[data-carte-loadout]")].find((c) => c.dataset.carteLoadout === demande.id);
    if (!carte) return;
    const voulu = carte.querySelector<HTMLButtonElement>(`[data-${demande.bouton}]`);
    const autre = carte.querySelector<HTMLButtonElement>(`[data-${demande.bouton === "reculer" ? "avancer" : "reculer"}]`);
    // FR : si le bouton utilisé est devenu grisé (la carte est arrivée en bout de liste), le focus passe à l'autre bouton plutôt que de se perdre.
    (voulu && !voulu.disabled ? voulu : autre && !autre.disabled ? autre : null)?.focus();
  }, [loadouts]);

  function deplacerParBouton(l: Loadout, sens: -1 | 1) {
    refFocus.current = { id: l.id, bouton: sens < 0 ? "reculer" : "avancer" };
    rafraichir(deplacerLoadout(l.id, sens), `« ${l.nom} » déplacé.`);
  }
  function deposerSur(idCible: string) {
    const id = glisse;
    setGlisse(null);
    setCibleSurvol(null);
    if (!id || id === idCible) return;
    const index = loadouts.findIndex((x) => x.id === idCible);
    if (index >= 0) rafraichir(placerLoadout(id, index), `« ${loadouts.find((x) => x.id === id)?.nom ?? "Loadout"} » déplacé.`);
  }

  function rafraichir(resultat: { ok: boolean; erreur?: string }, messageSucces: string) {
    if (resultat.ok) {
      setLoadouts(listerLoadouts());
      setMessage(messageSucces);
    } else {
      setMessage(`⚠️ ${resultat.erreur}`);
    }
  }

  // FR : ensemble des instances possédées, pour la détection des pièces
  // manquantes. `null` = inventaire pas encore chargé : dans ce cas on
  // n'affiche AUCUN avertissement, plutôt que de signaler à tort toutes
  // les pièces comme absentes.
  const instancesPossedees =
    objetsPossedes === null
      ? null
      : new Set(objetsPossedes.map((o) => o.itemInstanceId).filter(Boolean) as string[]);

  // FR : ⚠️ AJOUT (04/08/2026) - équipe un loadout EN JEU. Réutilise
  // `equiperObjet`, le mécanisme déjà en place et confirmé fonctionnel
  // par l'utilisateur, plutôt que d'en réécrire un.
  // ⚠️ Action RÉELLE et immédiate sur le compte : confirmation demandée,
  // comme partout ailleurs où l'appli touche au personnage en jeu.
  // Les pièces absentes du compte sont ignorées silencieusement plutôt
  // que de faire échouer tout le loadout ; le bilan final indique
  // combien de pièces ont réellement été équipées.
  // EN: ⚠️ ADDED (2026-08-04) - equips a loadout IN GAME. Reuses
  // `equiperObjet`, the already-working mechanism, rather than rewriting
  // one. REAL, immediate action on the account: confirmation required.
  // FR : ⚠️ CHANGÉ (01/10/2026, v0.3.0) - le PERSONNAGE n'est plus choisi dans un menu global :
  // il est déterminé par la CLASSE enregistrée dans le build (demande de l'utilisateur : un build
  // sauvegardé pour le Chasseur est forcément équipé sur le Chasseur ; la carte affiche déjà
  // l'icône de sa classe). Règles dans lib/loadouts/classePersonnage.ts : un seul personnage de
  // cette classe -> équipé directement ; sinon (build sans classe, plusieurs personnages de la
  // classe, ou aucun) une fenêtre explique la situation et invite à choisir.
  // EN: ⚠️ CHANGED - the CHARACTER is now determined by the build's saved CLASS, not a global menu.
  function gererEquiper(l: Loadout) {
    if (!membership) return;
    if (personnages.length === 0) {
      setMessage("⚠️ Personnages non chargés : connectez-vous et chargez l'inventaire d'abord.");
      return;
    }
    const cible = determinerCible(l.classeFigee ?? l.build.subclass.classe, personnages);
    if (cible.cas === "direct") void equiperSur(l, cible.personnage);
    else setChoixPersonnage({ loadout: l, cible });
  }

  async function equiperSur(l: Loadout, personnage: PersonnageCompte) {
    if (!membership) return;
    const pieces = [...(l.build.armes ?? []), ...(l.build.armure ?? [])].filter((p) => p.itemInstanceId);
    if (pieces.length === 0) {
      setMessage("⚠️ Ce loadout ne contient aucun objet équipable.");
      return;
    }
    if (
      !window.confirm(
        `Équiper "${l.nom}" en jeu sur votre ${personnage.classe} (lumière ${personnage.lumiere}) — ${pieces.length} pièce(s) ?\n\nCette action est RÉELLE et immédiate sur votre personnage.`
      )
    ) return;

    setEquipementEnCours(l.id);
    setMessage(null);
    try {
      // FR : même mécanisme que "Mon Build" : seconde passe sur les conflits
      // d'unicité d'exotique, et mention explicite que la doctrine ne suit pas.
      const resultat = await equiperPlusieursObjets(
        membership,
        personnage.characterId,
        pieces.map((p) => ({ nom: p.nom ?? "(sans nom)", itemInstanceId: p.itemInstanceId!, itemHash: p.itemHash })),
        db
      );
      // FR : ⚠️ CHANGÉ (01/10/2026) - remplaçants équipés sur d'autres personnages
      // signalés (l'appli doit toujours dire ce qu'elle a fait en plus).
      // EN: ⚠️ CHANGED - replacements on other characters are reported.
      const noteRemplacements = resultat.notes.length > 0 ? ` À noter : ${resultat.notes.join(" ; ")}.` : "";
      setMessage(
        (resultat.echecs.length === 0
          ? `✅ ${resultat.reussies} pièce(s) équipée(s) sur votre ${personnage.classe}.`
          : `⚠️ ${resultat.reussies} équipée(s), ${resultat.echecs.length} en échec : ` +
            resultat.echecs.map((e) => `${e.nom} — ${e.message}`).slice(0, 2).join(" ; ")) + noteRemplacements
      );
      // FR : ⚠️ CHANGÉ (01/10/2026) - la check-list ne s'ouvre QUE si le build contient autre
      // chose que des armes et des armures (de la Doctrine à configurer à la main), même
      // après un échec partiel : la Doctrine reste à régler dans tous les cas.
      // EN: ⚠️ CHANGED - the checklist opens ONLY if the build holds more than weapons and armor.
      if (doctrineAConfigurer(l.build.subclass)) setRappelDoctrine(l);
    } catch (e) {
      // Erreur globale (token, réseau, etc.) : ne pas laisser le bouton
      // bloqué indéfiniment si l'appel échoue avant le résultat par pièce.
      setMessage(`⚠️ Équipement impossible : ${(e as Error).message}`);
    } finally {
      setEquipementEnCours(null);
    }
  }

  // FR : ⚠️ CHANGÉ (26/09/2026, v0.2.2) - le mécanisme de téléchargement est
  // extrait pour servir aux DEUX exports (tous les loadouts, ou un seul).
  // Même mécanisme que pour les Manifests : le navigateur choisit le dossier
  // (Téléchargements) ; dans le logiciel installé, Windows propose où
  // enregistrer.
  // EN: ⚠️ CHANGED - download mechanism extracted, shared by both exports.
  // FR : ⚠️ CHANGÉ (28/09/2026, v0.2.8) - le téléchargement est désormais
  // partagé (lib/telechargement.ts), aussi utilisé par « Partage du build ».
  // EN: ⚠️ CHANGED - download now shared (lib/telechargement.ts).
  function telechargerJson(contenu: string, nomFichier: string) {
    telechargerFichierTexte(contenu, nomFichier);
  }

  function gererExporter() {
    telechargerJson(exporterLoadouts(), `loadouts-d2-${new Date().toISOString().slice(0, 10)}.json`);
    setMessage("Export envoyé vers vos téléchargements.");
  }

  // FR : ⚠️ AJOUT (26/09/2026, v0.2.2) - export d'un seul loadout, pour
  // l'échanger. Le fichier s'importe avec le bouton « Importer » habituel.
  // EN: ⚠️ ADDED - export a single loadout, to share it.
  function gererExporterUn(l: Loadout) {
    const resultat = exporterUnLoadout(l.id);
    if (!resultat) {
      setMessage("⚠️ Loadout introuvable : il a peut-être été supprimé entre-temps.");
      return;
    }
    telechargerJson(resultat.contenu, resultat.nomFichier);
    setMessage(`« ${l.nom} » exporté (${resultat.nomFichier}). Il s'importe avec le bouton « Importer ».`);
  }

  async function gererImporter(evenement: ChangeEvent<HTMLInputElement>) {
    const fichier = evenement.target.files?.[0];
    if (!fichier) return;
    const texte = await fichier.text();
    const resultat = importerLoadouts(texte);
    rafraichir(resultat, `${resultat.nombre} loadout(s) importé(s).`);
    evenement.target.value = "";
  }

  if (mode === "tiroir" && !ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        style={{
          position: "fixed",
          right: 0,
          top: "40%",
          zIndex: 900,
          writingMode: "vertical-rl",
          // FR : ⚠️ AGRANDI de 50% (04/08/2026, demande utilisateur) :
          // 0.8rem -> 1.2rem, et rembourrage proportionnel.
          padding: "1.15rem 0.55rem",
          borderRadius: "6px 0 0 6px",
          fontSize: "1.2rem",
        }}
        title="Ouvrir le panneau des loadouts"
      >
        🗂️ Loadouts ({loadouts.length})
      </button>
    );
  }

  const enPage = mode === "page";
  return (
    <div
      data-loadouts-page={enPage ? "" : undefined}
      style={
        enPage
          ? // FR : onglet « Load-out » : dans le flux de la page, sur toute la largeur, sans fond opaque ni volet fixe.
            { padding: "0.75rem", border: "1px solid #2a2e38", borderRadius: 8, background: "rgba(22, 25, 34, 0.86)", marginBottom: "0.75rem" }
          : {
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: "min(90vw, 320px)",
              zIndex: 900,
              background: "#161922",
              borderLeft: "1px solid #2a2e38",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.4)",
              padding: "0.75rem",
              overflowY: "auto",
            }
      }
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <strong style={{ fontSize: enPage ? "1rem" : "0.9rem" }}>
          🗂️ Loadouts{enPage ? ` (${loadouts.length})` : ""}
        </strong>
        {!enPage && (
          <button onClick={() => setOuvert(false)} style={{ background: "none", border: "none", color: "#7d7a70", cursor: "pointer", fontSize: "1rem" }}>
            ✕
          </button>
        )}
      </div>

      <p style={{ fontSize: "0.7rem", color: "#7d7a70", margin: "0 0 0.6rem" }}>
        Enregistrés dans ce navigateur uniquement (pas sur votre compte Bungie) : ils ne suivent pas
        d'un PC à l'autre. Utilisez l'export pour en garder une copie.
      </p>

      {/* FR : ⚠️ CORRIGÉ (07/10/2026, v0.3.11) - la ZONE D'ENREGISTREMENT (nom, palette d'icônes, description, « + Enregistrer ») est dans le TIROIR latéral repliable (comme depuis longtemps) et PAS dans le nouvel onglet « Load-outs » (mode « page ») :
      l'utilisateur avait mélangé « tiroir » et « onglet » (retirée du tiroir en v0.3.8, mise dans l'onglet en v0.3.9 : les deux à l'envers). L'autre chemin d'enregistrement reste le bouton « 💾 Enregistrer le build… » du bloc « Sauvegarde et partage du Build ».
      EN: ⚠️ CORRECTED - the save area is in the SIDE DRAWER (as it long was) and NOT in the new Load-outs tab. */}
      {!enPage && build && <ZoneEnregistrement build={build} auteur={auteur} onResultat={rafraichir} />}

      {/* FR : ⚠️ SUPPRIMÉ (01/10/2026, v0.3.0) - le menu global « Équiper sur : » : le personnage
      est déterminé par la classe du build, ou choisi dans une fenêtre si besoin.
      EN: ⚠️ REMOVED - the global "Equip on:" menu. */}

      {message && (
        <p style={{ fontSize: "0.72rem", color: message.startsWith("⚠️") ? "#e08080" : "#7fd88f", margin: "0 0 0.6rem" }}>
          {message}
        </p>
      )}

      {loadouts.length === 0 && (
        <p style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
          {!enPage && build
            ? "Aucun loadout enregistré pour l'instant. Donnez un nom au build en cours dans la zone ci-dessus, puis cliquez sur « + Enregistrer »."
            : "Aucun loadout enregistré pour l'instant. Dans le Build Analyzer, composez un build puis utilisez « 💾 Enregistrer le build… » (bloc « Sauvegarde et partage du Build »)."}
        </p>
      )}

      {/* FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - barre de recherche et filtres, onglet « Load-outs » seulement, et seulement s'il y a des loadouts. / EN: ⚠️ ADDED - search bar, Load-outs tab only. */}
      {enPage && loadouts.length > 0 && (
        // FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - LÉGENDE en tête du bloc (décision du 05/10/2026) : la case « stocké en jeu » est un simple mémo, rien n'est vérifié ni enregistré dans le jeu ; et comment réordonner. / EN: ⚠️ ADDED - legend: the "stored in game" box is only a manual memo.
        <div style={{ fontSize: "0.7rem", color: "#9a9788", margin: "0 0 0.55rem" }}>
          <p data-legende-stockage="" style={{ margin: "0 0 0.15rem" }}>
            🎮 La case « stocké en jeu » est un <strong>mémo à cocher à la main</strong> : l'appli ne vérifie ni n'enregistre rien dans le jeu.
          </p>
          <p data-aide-ordre="" style={{ margin: 0 }}>
            ↔ Pour changer l'ordre : boutons ◀ ▶ ou glisser-déposer par la poignée ⠿. L'ordre ne se modifie que sans recherche ni filtre actif.
          </p>
        </div>
      )}
      {enPage && loadouts.length > 0 && (
        <BarreRechercheLoadouts criteres={criteres} onChanger={setCriteres} disponibles={disponibles} total={loadouts.length} affiches={affiches.length} manifestCharge={db !== null} />
      )}
      {enPage && loadouts.length > 0 && affiches.length === 0 && (
        <p data-aucun-resultat="" style={{ fontSize: "0.78rem", color: "#c9b27a", margin: "0.4rem 0" }}>
          Aucun loadout ne correspond à ces critères ({loadouts.length} au total).{" "}
          {criteresActifs(criteres) && (
            <button type="button" onClick={() => setCriteres(CRITERES_VIDES)} style={{ fontSize: "0.72rem" }}>
              ✕ Réinitialiser
            </button>
          )}
        </p>
      )}

      {/* FR : ⚠️ AJOUT (06/10/2026, v0.3.5) - en mode « page », les cartes sont en GRILLE (plusieurs colonnes selon la largeur) ; en mode « tiroir », liste verticale comme avant. / EN: ⚠️ ADDED - grid of cards in "page" mode, vertical list in "tiroir" mode. */}
      <div style={enPage ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.6rem", alignItems: "start" } : undefined} data-liste-loadouts="">
      {affiches.map((l) => {
        const manquantes = instancesPossedees ? trouverPiecesManquantes(l, instancesPossedees) : [];
        return (
          <div
            key={l.id}
            data-carte-loadout={enPage ? l.id : undefined}
            onDragOver={
              enPage && glisse && glisse !== l.id
                ? (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (cibleSurvol !== l.id) setCibleSurvol(l.id);
                  }
                : undefined
            }
            onDragLeave={enPage ? () => setCibleSurvol((c) => (c === l.id ? null : c)) : undefined}
            onDrop={
              enPage && glisse
                ? (e) => {
                    e.preventDefault();
                    deposerSur(l.id);
                  }
                : undefined
            }
            style={{
              border: cibleSurvol === l.id ? "1px solid #7aa2f7" : "1px solid #2a2e38",
              boxShadow: cibleSurvol === l.id ? "0 0 0 2px rgba(122,162,247,0.35)" : undefined,
              opacity: glisse === l.id ? 0.45 : 1,
              borderRadius: 6,
              padding: "0.5rem",
              marginBottom: enPage ? 0 : "0.5rem",
            }}
          >
            {/* FR : ⚠️ AJOUT (07/10/2026, v0.3.12) - ligne de contrôles de la carte, ONGLET « Load-outs » seulement : poignée de glisser-déposer, ◀ ▶, case « stocké en jeu ». Le tiroir n'a rien de tout cela. / EN: ⚠️ ADDED - card controls row, Load-outs tab only. */}
            {enPage && (() => {
              const rang = loadouts.findIndex((x) => x.id === l.id);
              const modifiable = !criteresActifs(criteres);
              const raison = "Réinitialise la recherche et les filtres pour changer l'ordre.";
              return (
                <div data-controles-ordre="" style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.35rem" }}>
                  <span
                    data-poignee=""
                    draggable={modifiable}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", l.id);
                      const carte = (e.currentTarget as HTMLElement).closest("[data-carte-loadout]");
                      if (carte) e.dataTransfer.setDragImage(carte as HTMLElement, 16, 16);
                      setGlisse(l.id);
                    }}
                    onDragEnd={() => {
                      setGlisse(null);
                      setCibleSurvol(null);
                    }}
                    title={modifiable ? "Glisser pour déplacer ce build" : raison}
                    style={{ cursor: modifiable ? "grab" : "not-allowed", opacity: modifiable ? 1 : 0.4, fontSize: "0.95rem", lineHeight: 1, padding: "0 0.15rem", userSelect: "none", color: "#9a9788" }}
                  >
                    ⠿
                  </span>
                  <button
                    type="button"
                    data-reculer=""
                    onClick={() => deplacerParBouton(l, -1)}
                    disabled={!modifiable || rang <= 0}
                    aria-label={`Déplacer « ${l.nom} » vers le début`}
                    title={!modifiable ? raison : rang <= 0 ? "Déjà en première position" : "Déplacer vers le début"}
                    style={{ fontSize: "0.7rem", padding: "0 0.4rem" }}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    data-avancer=""
                    onClick={() => deplacerParBouton(l, 1)}
                    disabled={!modifiable || rang < 0 || rang >= loadouts.length - 1}
                    aria-label={`Déplacer « ${l.nom} » vers la fin`}
                    title={!modifiable ? raison : rang >= loadouts.length - 1 ? "Déjà en dernière position" : "Déplacer vers la fin"}
                    style={{ fontSize: "0.7rem", padding: "0 0.4rem" }}
                  >
                    ▶
                  </button>
                  <span style={{ flex: 1 }} />
                  <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "#b7b3a8", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      data-stocke=""
                      checked={l.stockeEnJeu === true}
                      aria-label={`Stocké en jeu : ${l.nom}`}
                      onChange={(e) =>
                        rafraichir(definirStockeEnJeu(l.id, e.target.checked), e.target.checked ? `« ${l.nom} » : marqué « stocké en jeu ».` : `« ${l.nom} » : n'est plus marqué « stocké en jeu ».`)
                      }
                    />
                    🎮 Stocké en jeu
                  </label>
                </div>
              );
            })()}
            {/* FR : ⚠️ DISPOSITION B (04/08/2026) - icônes et date sur une
            première ligne, NOM en dessous sur toute la largeur (choix de
            l'utilisateur après aperçu comparatif). Motif : les noms
            descriptifs, donc longs, sont les plus utiles pour retrouver un
            loadout — les tronquer serait perdre l'information principale. La
            date est remontée à droite des icônes, sur une place autrement
            perdue : la disposition ne coûte donc AUCUNE hauteur
            supplémentaire.
            EN: ⚠️ LAYOUT B - icons and date on a first row, NAME below across
            the full width (user's choice after a side-by-side preview). Long
            descriptive names are the most useful for finding a loadout, so
            truncating them would lose the main information. The date moves to
            the right of the icons, using otherwise wasted space: the layout
            costs NO extra height. */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.15rem" }}>
              {l.classeFigee && <IconeClasse classe={l.classeFigee} taille={18} />}
              {/* FR : ⚠️ AJOUT (24/08/2026) - badge de contexte, demande de
              l'utilisateur : "identifier d'un coup d'œil qui fait quoi".
              Lu directement depuis `l.build.contexte` - le loadout clone le
              build entier, pas besoin d'un champ figé séparé (même logique
              que le bug corrigé sur l'icône du Super : ce qui n'est pas
              explicitement lu depuis `l.build` reste invisible). Toujours
              affiché, y compris "Neutre" (contexte par défaut) : son
              ABSENCE serait ambiguë (contexte neutre, ou loadout enregistré
              avant l'existence du champ ?), sa présence systématique lève
              le doute.
              EN: ⚠️ ADDED - context badge, user request: "identify at a
              glance what does what". Read directly from `l.build.contexte`
              - the loadout clones the whole build. Always shown, including
              "Neutre": its ABSENCE would be ambiguous. */}
              <BadgeContexte contexte={l.build.contexte ?? "neutre"} taille={19} />
              {/* FR : ⚠️ CORRIGÉ (04/08/2026) - deux temps. D'abord la vraie
              cause (comparaison de texte fragile "Solaire" vs "solaire")
              corrigée via `obtenirIconeElementDoctrine`, qui utilise l'ENUM
              stable de Bungie. Puis l'utilisateur a fourni des captures des
              icônes officielles : IconeElement les affiche maintenant en
              PRIORITÉ (urlOfficielle), avec la forme dessinée à la main en
              repli pour le Prismatique (pas de type de dégâts, donc pas
              d'icône officielle) et le mode hors ligne. */}
              {l.elementFige && (
                <IconeElement
                  element={l.elementFige as DamageElement}
                  taille={16}
                  urlOfficielle={db ? obtenirIconeElementDoctrine(db, l.elementFige as DamageElement) : undefined}
                />
              )}
                            {/* FR : ⚠️ RETIRÉ (23/10/2026, audit) - diagnostic « elementFige » archivé supprimé (bug résolu depuis le début de la session). / EN: ⚠️ REMOVED - archived elementFige diagnostic deleted (bug fixed). */}
              {/* FR : ⚠️ AJOUT (04/08/2026) - icône du Super figé, entre
              l'élément et l'icône personnalisée (emplacement demandé par
              l'utilisateur). Résolue depuis `superHash`, déjà stocké dans le
              build au moment de la sauvegarde - donc déjà figée par
              construction, pas besoin d'un champ dédié supplémentaire.
              EN: ⚠️ ADDED - Super icon, between element and custom icon
              (position requested by the user). Resolved from `superHash`,
              already stored in the build at save time - already frozen by
              construction. */}
              {/* FR : ⚠️ CORRIGÉ (24/08/2026) - les supers ABYSSAUX ne
              s'affichaient pas (signalé par l'utilisateur). La résolution
              elle-même ne dépend d'aucun élément, le problème vient donc du
              Manifest : certaines définitions de super n'exposent pas
              d'`icon`, seulement un `iconSequences`. On lit désormais les deux
              sources, et en dernier recours un repère « ★ » survolable est
              affiché plutôt qu'un VIDE silencieux — impossible à diagnostiquer
              autrement, comme l'avait montré l'épisode des icônes d'armes.
              EN: ⚠️ FIXED - Void supers didn't show. Resolution doesn't depend
              on the element, so the issue is in the Manifest: some super
              definitions expose no `icon`, only `iconSequences`. Both are now
              read, with a hoverable "★" as a last resort rather than a silent
              blank. */}
                            {/* FR : ⚠️ RETIRÉ (23/10/2026, audit) - diagnostic « hashes doctrine » archivé supprimé (hypothèse confirmée). / EN: ⚠️ REMOVED - archived doctrine-hashes diagnostic deleted. */}
              {db && l.build.subclass.superHash > 0 && (() => {
                const url = obtenirIconePerkDoctrine(db, l.build.subclass.superHash);
                const nom = obtenirNomPerkDoctrine(db, l.build.subclass.superHash);
                return url ? (
                  <img
                    src={url}
                    alt={nom ?? "Super"}
                    title={nom ? `Super : ${nom}` : "Super"}
                    width={21}
                    height={21}
                    style={{ borderRadius: 3, flexShrink: 0 }}
                  />
                ) : (
                  <span
                    title={`Super : ${nom ?? "inconnu"} — pas d'icône dans le Manifest pour cette définition`}
                    style={{ fontSize: "0.8rem", color: "#7d7a70", cursor: "help", flexShrink: 0 }}
                  >
                    ★
                  </span>
                );
              })()}
              {l.iconeChoisie && (
                <span style={{ fontSize: "1.15rem", flexShrink: 0, display: "inline-flex", alignItems: "center" }}>
                  {l.iconeChoisie.startsWith("champion:") ? (
                    <IconeAntiChampion type={l.iconeChoisie.slice(9) as TypeChampion} taille={21} />
                  ) : l.iconeChoisie.startsWith("icone:") ? (
                    <IconeLoadout cle={l.iconeChoisie.slice(6) as CleIconeLoadout} taille={21} />
                  ) : (
                    l.iconeChoisie
                  )}
                </span>
              )}
              <span style={{ fontSize: "0.68rem", color: "#7d7a70", marginLeft: "auto", flexShrink: 0 }}>
                {new Date(l.enregistreLe).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", marginBottom: l.auteur ? "0.1rem" : "0.3rem" }}>{l.nom}</div>
            {/* FR : ⚠️ AJOUT (06/10/2026) - auteur du build, s'il est connu (les builds enregistrés avant l'ajout n'en ont pas : rien ne s'affiche). / EN: ⚠️ ADDED - the build's author, when known. */}
            {l.auteur && (
              <div style={{ fontSize: "0.68rem", color: "#7d7a70", marginBottom: "0.3rem" }} title="Auteur du build (pseudo Bungie au moment de l'enregistrement)" data-auteur="">
                par {l.auteur}
              </div>
            )}
            {l.description && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#b7b3a8",
                  marginBottom: "0.35rem",
                  fontStyle: "italic",
                  // FR : ⚠️ AJOUT - préserve les retours à la ligne saisis dans
                  // la description (le <textarea> les acceptait déjà, mais
                  // l'affichage les écrasait).
                  whiteSpace: "pre-wrap",
                }}
              >
                {l.description}
              </div>
            )}

            {/* FR : ⚠️ AJOUT (04/08/2026) - avertissement sur les pièces
            introuvables sur le compte (démantelées depuis la sauvegarde),
            demande de l'utilisateur. Le loadout reste CHARGEABLE : on
            signale, on n'empêche pas. */}
            {manquantes.length > 0 && (
              <div
                style={{ fontSize: "0.7rem", color: "#e08080", marginBottom: "0.35rem" }}
                title={manquantes.map((m) => `${m.nom} (${m.slot})`).join("\n")}
              >
                ⚠️ {manquantes.length} objet(s) introuvable(s) sur le compte
                <div style={{ color: "#b7b3a8", fontSize: "0.68rem" }}>
                  {manquantes.map((m) => m.nom).join(", ")}
                </div>
                {/* FR : ⚠️ CHANGÉ (24/08/2026) - remplace l'instruction
                manuelle par une VRAIE réparation automatique, suite à la
                remarque justifiée de l'utilisateur : "resauvegardez à la
                main" n'est pas une solution pérenne, le même problème peut
                toucher n'importe quel objet à l'avenir. Cherche un
                exemplaire ACTUEL du même objet dans l'inventaire réel, et
                met à jour le loadout automatiquement si trouvé.
                EN: ⚠️ CHANGED - replaces the manual instruction with REAL
                automatic repair, following the user's valid point that
                "just re-save manually" isn't a lasting fix. */}
                <button
                  onClick={() => {
                    if (!objetsPossedes) return;
                    const resultat = repererEtSauvegarder(l.id, objetsPossedes);
                    const message = [
                      resultat.reparees.length > 0 ? `✅ Réparé(s) : ${resultat.reparees.join(", ")}` : null,
                      resultat.irreparables.length > 0
                        ? `⚠️ Aucun exemplaire actuel trouvé pour : ${resultat.irreparables.join(", ")} — remplacez-le(s) manuellement.`
                        : null,
                    ]
                      .filter(Boolean)
                      .join("\n");
                    rafraichir(resultat, message || "Rien à réparer.");
                    if (message) window.alert(message);
                  }}
                  style={{ fontSize: "0.65rem", marginTop: "0.15rem" }}
                >
                  🔧 Réparer automatiquement
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {/* FR : ⚠️ CORRIGÉ (24/08/2026) - un loadout FIGE les `GearPiece`
              avec leurs stats telles que calculées au moment de la sauvegarde.
              Après la correction du masterwork, recharger un ancien loadout
              réinjectait donc les ANCIENNES valeurs erronées dans « Mon
              Build », pendant que le Pilier 5 recalculait correctement — d'où
              l'incohérence signalée entre les deux affichages.
              On rafraîchit désormais les stats depuis les objets réellement
              possédés au moment du chargement. Le reste du loadout (doctrine,
              artefact, choix d'équipement) est bien conservé.
              EN: ⚠️ FIXED - a loadout FREEZES GearPieces with the stats
              computed at save time. After the masterwork fix, loading an old
              loadout re-injected the OLD wrong values into "Mon Build" while
              Pillar 5 recomputed correctly - hence the reported mismatch. */}
              <button
                onClick={() => {
                  onChargerLoadout(rafraichirStats(structuredClone(l.build)));
                  onApresCharger?.();
                }}
                style={{ fontSize: "0.7rem" }}
              >
                Charger
              </button>
              {/* FR : ⚠️ AJOUT (27/09/2026, v0.2.3) - fiche complète du build en
              lecture seule, demande de l'utilisateur. Placé juste après
              « Charger » pour être repéré tout de suite.
              EN: ⚠️ ADDED - read-only full build sheet, right after "Load". */}
              <button onClick={() => setFicheOuverte(l)} style={{ fontSize: "0.7rem" }} title="Voir tout le contenu de ce build en une fois">
                👁 Voir
              </button>
              {membership && (
                <button
                  onClick={() => gererEquiper(l)}
                  disabled={equipementEnCours !== null}
                  style={{ fontSize: "0.7rem" }}
                  title={
                    l.classeFigee
                      ? `Équiper ce loadout en jeu sur votre ${l.classeFigee.charAt(0).toUpperCase()}${l.classeFigee.slice(1)} (action réelle)`
                      : "Équiper ce loadout en jeu : vous choisirez le personnage (action réelle)"
                  }
                >
                  {equipementEnCours === l.id ? "Équipement..." : "🎮 Équiper en jeu"}
                </button>
              )}
              {/* FR : ⚠️ CHANGÉ (01/10/2026, v0.3.0) - « Icône », « Décrire » et « Renommer » sont
              REGROUPÉS sous un seul bouton qui ouvre une fenêtre (nom, description et icône), demande
              de l'utilisateur. Libellé COURT (« Modifier... » et non « Modifier description... »), par
              prudence sur la contrainte « 2 lignes au maximum » : mesuré dans la vraie page (rangée de
              302 px), « Modifier... » tient sur 2 lignes avec toutes les polices essayées (marge d'au
              moins 12 px) ; « Modifier description... » tient aussi avec Arial (marge de 9 px dans une
              fenêtre étroite) mais passe à 3 lignes avec la police la plus large essayée, et la police
              réelle de Windows (Segoe UI) n'est pas testable ici. L'infobulle et le titre de la fenêtre
              précisent ce qu'on peut modifier. Changer de libellé = un mot, si l'écran de l'utilisateur
              le permet.
              EN: ⚠️ CHANGED - the three buttons are GROUPED under one that opens a window. SHORT label,
              to be safe on the "2 lines max" rule: measured in the real page (302 px row), "Edit..." fits
              2 lines with every font tried; the long label fits with Arial but takes 3 lines with the
              widest font tried, and Windows' real font can't be tested here. */}
              <button
                onClick={() => setModif(l)}
                style={{ fontSize: "0.7rem" }}
                title="Modifier le nom, la description et l'icône de ce build"
              >
                Modifier...
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Supprimer le loadout "${l.nom}" ? Cette action est définitive.`)) {
                    rafraichir(supprimerLoadout(l.id), "Supprimé.");
                  }
                }}
                style={{ fontSize: "0.7rem" }}
              >
                Supprimer
              </button>
              {/* FR : ⚠️ AJOUT (26/09/2026, v0.2.2) puis ⚠️ CHANGÉ (01/10/2026, v0.3.0) - exporter UN
              build pour l'échanger entre amis. Le bouton devient « Exporter... » et ouvre une fenêtre
              pour choisir la façon : copie texte, image JPEG ou PNG, PDF ou fichier JSON, SANS avoir à
              ouvrir « Voir » (demande de l'utilisateur).
              EN: ⚠️ CHANGED - the button becomes "Export..." and opens a window to pick the format,
              without opening "View". */}
              <button
                onClick={() => setExportEn(l)}
                style={{ fontSize: "0.7rem" }}
                title="Exporter ce build pour le partager : copie texte, image JPEG ou PNG, PDF ou fichier JSON"
              >
                ⬇ Exporter...
              </button>
            </div>
          </div>
        );
      })}
      </div>

      {/* FR : ⚠️ CHANGÉ (26/08/2026) - pop-up extraite en composant partagé
      (RappelDoctrine), désormais réutilisée aussi dans ResumeBuild.tsx
      pour le bouton "Équiper le build en jeu" - demande de cohérence de
      l'utilisateur.
      EN: ⚠️ CHANGED - popup extracted into a shared component, reused in
      ResumeBuild.tsx too. */}
      {rappelDoctrine && (
        <RappelDoctrine
          nomContexte={rappelDoctrine.nom}
          subclass={rappelDoctrine.build.subclass}
          db={db}
          onFermer={() => setRappelDoctrine(null)}
        />
      )}

      {/* FR : ⚠️ AJOUT (27/09/2026, v0.2.3) - fiche du build. Les stats passent
      par `rafraichirStats`, comme pour « Charger » : la fiche affiche donc les
      mêmes chiffres que Mon Build une fois le build chargé.
      EN: ⚠️ ADDED - build sheet; stats refreshed like on "Load". */}
      {ficheOuverte && (
        <FicheBuild
          fiche={construireFiche({ ...ficheOuverte, build: rafraichirStats(ficheOuverte.build) }, db)}
          onExporter={() => gererExporterUn(ficheOuverte)}
          onFermer={() => setFicheOuverte(null)}
        />
      )}

      {/* FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - fenêtres « Modifier... », « Exporter... » et choix du
      personnage pour « Équiper en jeu ». Les stats passent par `rafraichirStats`, comme pour « Voir »
      et « Charger » : l'export contient donc les mêmes chiffres que Mon Build.
      EN: ⚠️ ADDED - the "Edit...", "Export..." and character-choice windows. */}
      {modif && <ModifierLoadout loadout={modif} onValider={validerModification} onAnnuler={() => setModif(null)} />}
      {exportEn && (
        <ExporterLoadout
          fiche={construireFiche({ ...exportEn, build: rafraichirStats(exportEn.build) }, db)}
          onExporterJson={() => gererExporterUn(exportEn)}
          onFermer={() => setExportEn(null)}
        />
      )}
      {choixPersonnage && (
        <ChoixPersonnageEquipement
          nomBuild={choixPersonnage.loadout.nom}
          cible={choixPersonnage.cible}
          onChoisir={(personnage) => {
            const l = choixPersonnage.loadout;
            setChoixPersonnage(null);
            void equiperSur(l, personnage);
          }}
          onFermer={() => setChoixPersonnage(null)}
        />
      )}

      <div style={{ borderTop: "1px solid #2a2e38", marginTop: "0.6rem", paddingTop: "0.6rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
        <button onClick={gererExporter} style={{ fontSize: "0.7rem" }} disabled={loadouts.length === 0}>
          ⬇ Exporter tout
        </button>
        <label style={{ fontSize: "0.7rem", cursor: "pointer", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.15rem 0.5rem" }}>
          ⬆ Importer
          <input type="file" accept="application/json,.json" onChange={gererImporter} style={{ display: "none" }} />
        </label>
      </div>
    </div>
  );
}

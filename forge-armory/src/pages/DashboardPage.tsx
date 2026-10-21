// FR : Tableau de bord principal. Contient : le score du build de demo, et
// un bloc "Tester la connexion" qui fait le VRAI aller-retour avec l'API
// Bungie (comptes lies, personnages, coffre) une fois l'OAuth passe - c'est
// la seule facon de confirmer visuellement que la connexion fonctionne.
// EN: Main dashboard. Contains: the demo build's score, and a "Test
// connection" block that does the REAL round-trip with the Bungie API
// (linked accounts, characters, vault) once OAuth is done - it's the only
// way to visually confirm the connection actually works.

import { useEffect, useMemo, useRef, useState } from "react";
import { Database } from "sql.js";
import { evaluerBuild } from "../lib/scoring/pillars";
// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - lien Forge → score : les simulations de la Forge (magasin partagé) sont appliquées au build pour le SCORE et l'affichage de Mon Build ; le build réel (enregistrement, partage, équipement en jeu) n'est jamais modifié. / EN: Forge → score link: simulations applied to the build for scoring and display only.
import { useSimulations } from "../lib/forge/storeSimulations";
import { appliquerSimulations, pieceReelle, nbArmesSimulees } from "../lib/forge/appliquerSimulation";
import type { CibleForge } from "../components/InventaireArmes";
import { demoBuild, demoExigences } from "../data/demoBuild";
import { BuildDraft, GearPiece, SubclassConfig, poserPieceDansBuild } from "../types/build";
import PilierCarte from "../components/PilierCarte";
import BlocContexte from "../components/BlocContexte";
import PanneauTriomphes from "../components/PanneauTriomphes";
import ModaleCarriere from "../components/ModaleCarriere";   // ⚠️ AJOUT (20/10/2026, v0.4.14) : vue « Carrière » du compte
import { recupererProfilTriomphes } from "../lib/bungie/triomphes";
import { EVENEMENT_SESSION_EXPIREE, redirigerVersAutorisation, deconnecter, etatSession, SessionExpiree, expirerSessionPourTest, estBureau, connecterViaBureau } from "../lib/bungie/oauth";
import {
  recupererComptesBungie,
  recupererResumeEtPersonnages,
  DestinyMembership,
  ResumeProfil,
  Personnage,
} from "../lib/bungie/api";
import { exporterVersDim } from "../lib/dim/export";
import RechercheManifest from "../components/RechercheManifest";
import SelecteurInventaire, { CibleInventaire } from "../components/SelecteurInventaire";
import ResumeBuild from "../components/ResumeBuild";
import GrilleDoctrine from "../components/GrilleDoctrine";
// FR : ⚠️ AJOUT (31/08/2026) - diagnostic du Pilier 2 (voir verbes.ts).
// EN: ⚠️ ADDED - Pillar 2 diagnostic (see verbes.ts).
import { obtenirDiagnosticPilier2 } from "../lib/scoring/verbes";
import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";
import PanneauLoadouts from "../components/PanneauLoadouts";
import SelecteurArtefact from "../components/SelecteurArtefact";
import BlocPartage from "../components/BlocPartage";
import EnTeteApp from "../components/EnTeteApp";
import BadgeVersionJeu from "../components/BadgeVersionJeu";
import ControleAntiChampionExotiques from "../components/ControleAntiChampionExotiques";
import ControleIconesPerksArtefact from "../components/ControleIconesPerksArtefact";
import { useModeDiagnostic } from "../lib/modeDiagnostic";
import SelecteurVues, { VueApp } from "../components/SelecteurVues";
import PageForge from "../components/PageForge";   // ⚠️ AJOUT (12/10/2026, v0.4.0) : onglet Forge
import { defilerVers } from "../lib/defilerVers";
import TitreCategorie from "../components/TitreCategorie";
import BoutonsVuesCompte from "../components/BoutonsVuesCompte";   // ⚠️ CHANGÉ (21/10/2026) : les deux boutons du bloc Connexion (remplace l'import direct de la fonction des visuels)
import InterrupteurModeDiagnostic from "../components/InterrupteurModeDiagnostic";
import Bibliotheque from "../components/Bibliotheque";
import type { ProvenanceObjet } from "../lib/legendarium/types";   // ⚠️ AJOUT (21/10/2026, Legendarium étape 5) : provenance transitoire (fiche Détails → page de Lore)
import { EtatPonderations, lirePonderations, poidsActifsEnFractions } from "../lib/scoring/ponderations";

export default function DashboardPage() {
  // FR : le build n'est plus une constante figée - on garde une copie
  // modifiable en state, pour que le sélecteur de classe (pilier 1) ait un
  // effet réel sur le scoring affiché. C'est un premier pas ; la vraie
  // sélection d'objets depuis l'inventaire/la recherche reste à construire.
  // EN: the build is no longer a frozen constant - we keep an editable
  // copy in state, so the class selector (pillar 1) has a real effect on
  // the displayed score. This is a first step; real item selection from
  // inventory/search still needs to be built.
  const [monBuild, setMonBuild] = useState<BuildDraft>(demoBuild);
  // FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - ouverture du pop-up « Crédits » du pied de page. / EN: credits pop-up state.
  const [creditsOuverts, setCreditsOuverts] = useState(false);
  // FR : ⚠️ AJOUT (24/08/2026) - profil des triomphes pour la vitrine « Solo
  // sans mourir ». Appel SÉPARÉ de l'inventaire (composant 900 seul) : ces
  // données ne changent qu'après avoir terminé un donjon, inutile de les
  // recharger à chaque changement d'équipement.
  const [profilTriomphes, setProfilTriomphes] = useState<unknown | null>(null);
  // FR : ⚠️ AJOUT (20/10/2026, v0.4.14) - vue « CARRIÈRE » du compte (spécification du 14/10/2026) : modale ouverte par le bouton « Carrière » du bloc Connexion (connecté uniquement, sous la coche verte). Aucun appel réseau avant le clic ; aucun état persisté — la modale se ferme et se rouvre sans toucher au reste de l'appli. / EN: ⚠️ ADDED - account "Career" modal state.
  const [carriereOuverte, setCarriereOuverte] = useState(false);
  // FR : ⚠️ AJOUT (20/10/2026, v0.4.14) - état d'ouverture du tiroir « Solo sans mourir », délégué ici pour la navigation croisée Carrière ↔ Accomplissements : le bouton « Accomplissements » de la Carrière l'ouvre, et ce tiroir garde un bouton « Carrière » (retour) ; les deux vues conservent leur état. / EN: ⚠️ ADDED - external state of the Accomplishments drawer for the cross-navigation.
  const [tiroirTriomphesOuvert, setTiroirTriomphesOuvert] = useState<boolean | undefined>(undefined);
  const [db, setDb] = useState<Database | null>(null);
  // FR : ⚠️ AJOUT (06/10/2026) - mode diagnostic (réglable depuis le pied de page, actif aussi dans l'appli installée) : voir lib/modeDiagnostic.ts.
  const modeDiagnostic = useModeDiagnostic();
  const [diagPilier2, setDiagPilier2] = useState<string | null>(null);

  // FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - pondération personnalisée active
  // (préférence globale, stockage local), transmise au calcul du score.
  // EN: ⚠️ ADDED - active custom weighting, passed to the score calculation.
  const [ponderations, setPonderations] = useState<EtatPonderations>(lirePonderations);

  // FR : ⚠️ CHANGÉ (14/10/2026, v0.4.9) - le score est calculé sur le build AVEC la simulation de la Forge (`buildEffectif`) : il se met à jour en temps réel à chaque changement de simulation (critère 7 de la spécification). Même objet que `monBuild` quand rien n'est simulé : aucun calcul de plus.
  const simulations = useSimulations();
  const buildEffectif = useMemo(() => appliquerSimulations(monBuild, simulations), [monBuild, simulations]);
  const nbSimulees = nbArmesSimulees(buildEffectif);
  const idsDansBuild = useMemo(() => new Set(monBuild.armes.map((a) => a.itemInstanceId).filter((i): i is string => !!i)), [monBuild]);
  const resultat = useMemo(
    () => evaluerBuild(buildEffectif, demoExigences, db ?? undefined, poidsActifsEnFractions(ponderations)),
    [buildEffectif, db, ponderations]
  );

  // FR : ⚠️ AJOUT (04/08/2026) - corrige un "saut" visuel signalé par
  // l'utilisateur : changer de classe réinitialise la grille Doctrine
  // (qui redemande "Charger mes sous-classes"), ce qui réduit fortement
  // la hauteur de la page. Le navigateur garde la même position de
  // défilement en pixels, donc le contenu du dessous (l'inventaire)
  // remonte visuellement, donnant l'impression d'un saut vers lui. On
  // capture la position AVANT le changement et on la restaure APRÈS que
  // le nouveau contenu soit rendu (requestAnimationFrame, une fois le
  // DOM à jour).
  // EN: ⚠️ ADDED (2026-08-04) - fixes a visual "jump" reported by the
  // user: changing class resets the Doctrine grid (which asks again to
  // "Load my subclasses"), significantly reducing page height. The
  // browser keeps the same scroll position in pixels, so the content
  // below (the inventory) visually moves up, giving the impression of a
  // jump toward it. We capture the position BEFORE the change and
  // restore it AFTER the new content has rendered (requestAnimationFrame,
  // once the DOM is up to date).
  function changerClasse(classe: SubclassConfig["classe"]) {
    const positionAvant = window.scrollY;
    setMonBuild((b) => ({ ...b, subclass: { ...b.subclass, classe } }));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: positionAvant });
      });
    });
  }

  function changerSubclass(maj: Partial<SubclassConfig>) {
    setMonBuild((b) => ({ ...b, subclass: { ...b.subclass, ...maj } }));
  }

  // FR : ajoute un objet (issu de la recherche OU de l'inventaire réel) à
  // son emplacement dans le build - remplace ce qui s'y trouvait déjà.
  // EN: adds an item (from search OR real inventory) to its slot in the
  // build - replaces whatever was already there.
  function ajouterObjetAuBuild(piece: GearPiece) {
    setMonBuild((b) => poserPieceDansBuild(b, piece));
  }

  // FR : ⚠️ AJOUT (04/08/2026) - réinitialise "Mon Build" (équipements ET
  // doctrine choisis) à un état vide, demande explicite de l'utilisateur.
  // On repart d'une copie fraîche de `demoBuild` (mêmes objets
  // "placeholder" - itemHash: 0 - déjà utilisés partout ailleurs dans
  // l'appli pour représenter un emplacement vide) plutôt que de mettre
  // à jour les champs un par un : ça garantit qu'aucun champ n'est
  // oublié si la structure de BuildDraft évolue plus tard. La classe
  // repart à `null` (aucune sélection par défaut, comme au premier
  // chargement de l'appli), redemandant donc une classe avant de
  // pouvoir reconstruire un build. Une confirmation est demandée car
  // l'action n'est pas récupérable (pas d'historique "annuler").
  // EN: ⚠️ ADDED (2026-08-04) - resets "Mon Build" (both equipment AND
  // chosen doctrine) to an empty state, explicit user request. Starts
  // from a fresh copy of `demoBuild` (same "placeholder" items -
  // itemHash: 0 - already used everywhere else in the app to represent
  // an empty slot) rather than updating fields one by one: this
  // guarantees no field is forgotten if BuildDraft's shape changes later.
  // Class goes back to `null` (no default selection, same as on first
  // app load), so a class must be picked again before rebuilding.
  // Confirmation is required since the action isn't reversible (no
  // "undo" history).
  // FR : ⚠️ AJOUT (04/08/2026) - diagnostic de l'artefact saisonnier (dev).
  // FR : ⚠️ AJOUT (04/08/2026) - liste des objets possédés, remontée par
  // SelecteurInventaire, pour que le panneau Loadouts puisse signaler les
  // pièces démantelées depuis la sauvegarde.
  const [objetsPossedes, setObjetsPossedes] = useState<GearPiece[] | null>(null);

  function reinitialiserBuild() {
    const confirme = window.confirm(
      "Réinitialiser \"Mon Build\" ? Tous les équipements et la doctrine choisis seront effacés. Cette action ne touche pas votre personnage en jeu (seulement cette page)."
    );
    if (!confirme) return;
    setMonBuild(structuredClone(demoBuild));
  }

  const [connecte, setConnecte] = useState(false);
  const [memberships, setMemberships] = useState<DestinyMembership[]>([]);
  const [personnages, setPersonnages] = useState<Personnage[]>([]);
  const [resume, setResume] = useState<ResumeProfil | null>(null);
  // FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - nom Bungie (`pseudo#1234`) affiché
  // à gauche des boutons du bloc Connexion.
  // EN: ⚠️ ADDED - Bungie name shown left of the Connection block's buttons.
  const [nomBungie, setNomBungie] = useState<string | null>(null);
  // FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - vue affichée sous le bloc
  // Connexion : Build Analyzer (par défaut, à chaque lancement - pas de
  // mémorisation, choix de l'utilisateur) ou Bibliothèque.
  // EN: ⚠️ ADDED - view shown under the Connection block; Build Analyzer by
  // default on every launch (not remembered, user's choice).
  // FR : ⚠️ CHANGÉ (06/10/2026, v0.3.5) - troisième vue « Load-outs » (entre Build Analyzer et Bibliothèque, demande du 05/10/2026). / EN: ⚠️ CHANGED - third view "Load-outs".
  const [vue, setVue] = useState<VueApp>("analyseur");
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - objet visé par « Aller à » (recherche dans le Manifest → Mon Inventaire). / EN: ⚠️ ADDED - target of the "Go to" button.
  const [cibleInventaire, setCibleInventaire] = useState<CibleInventaire | null>(null);
  // FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - arme envoyée à la Forge par un bouton « Forge » des fenêtres Détails (Mon Inventaire, Coffre, Mon Build) ; la Forge part du roll RÉEL (`pieceReelle`), pas du roll simulé. Le Build Analyzer reste monté (caché) : le retour retrouve tout tel quel. / EN: a weapon sent to the Forge by a "Forge" button; the Forge starts from the REAL roll.
  const [cibleForge, setCibleForge] = useState<CibleForge | null>(null);
  function ouvrirForge(piece: GearPiece) {
    setCibleForge({ piece: pieceReelle(piece), origine: "analyseur", demande: Date.now() });
    setVue("forge");
    window.scrollTo({ top: 0 });
  }
  function retourDepuisForge() {
    setVue(cibleForge?.origine ?? "analyseur");
    setCibleForge(null);
  }
  // FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - LIEN PROFOND fiche Détails → Legendarium (spécification §6, piste (a) retenue : bascule de vue interne avec état en mémoire, PAS de route React Router, aucune persistance). `cibleLegendarium` mémorise la page cible (forme `item:<hashObjet>`, résolue par `trouverPage` côté Bibliotheque) et la provenance (bouton de retour vers l'objet). Les vues d'origine restent MONTÉES (cachées) : le retour retrouve tout tel quel.
  const [cibleLegendarium, setCibleLegendarium] = useState<{ pageId: string; provenance: ProvenanceObjet } | null>(null);
  function ouvrirLoreDepuisObjet(itemHash: number, nomObjet: string) {
    setCibleLegendarium({ pageId: `item:${itemHash}`, provenance: { itemHash, nomObjet, origine: vue === "forge" ? "forge" : vue === "loadouts" ? "loadouts" : "analyseur" } });
    setVue("bibliotheque");
    window.scrollTo({ top: 0 });
  }
  function retourDepuisLegendarium() {
    setVue(cibleLegendarium?.provenance.origine ?? "analyseur");
    setCibleLegendarium(null);
  }
  // FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - après « Charger » dans l'onglet « Load-outs », la page revient au Build Analyzer ET amène le bloc « Mon Build » à l'écran : sans cela, l'utilisateur se retrouvait en haut d'une longue
  // page, loin du build chargé, et croyait à un bug. Le compteur déclenche l'effet ci-dessous à chaque chargement (même si c'est le même build deux fois de suite).
  // EN: ⚠️ ADDED - after "Charger" in the Load-outs tab, the page returns to the Build Analyzer AND brings the "Mon Build" block into view.
  const refMonBuild = useRef<HTMLDivElement>(null);
  const [defilementMonBuild, setDefilementMonBuild] = useState(0);
  useEffect(() => {
    if (defilementMonBuild > 0 && vue === "analyseur") defilerVers(refMonBuild.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defilementMonBuild]);
  const [erreurTest, setErreurTest] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const connexionAutoLancee = useRef(false);
  // FR : ⚠️ AJOUT (24/09/2026) - session expirée (client public : pas de
  // rafraîchissement possible, la reconnexion est la seule issue).
  // EN: ⚠️ ADDED - expired session (public client: reconnecting is the
  // only way back).
  const [sessionExpiree, setSessionExpiree] = useState(false);

  useEffect(() => {
    // FR : ⚠️ CORRIGÉ (03/08/2026) - le bouton "Charger mon inventaire"
    // restait parfois caché car `memberships` ne se remplissait qu'après
    // un clic manuel sur "Tester la connexion", même quand on était déjà
    // connecté (tokens valides). On charge maintenant automatiquement au
    // démarrage si des tokens existent déjà, sans attendre ce clic.
    // EN: ⚠️ FIXED (2026-08-03) - the "Charger mon inventaire" button
    // sometimes stayed hidden because `memberships` only filled in after a
    // manual click on "Tester la connexion", even when already connected
    // (valid tokens). Now auto-loads on startup if tokens already exist,
    // without waiting for that click.
    // React.StrictMode monte/démonte/remonte les composants en développement.
    // Sans ce garde-fou, le test automatique partait deux fois en parallèle.
    // FR : ⚠️ CHANGÉ (24/09/2026) - on consulte l'ÉTAT de la session, plus
    // la seule présence de jetons : des jetons périmés affichaient
    // « ✅ connecté » puis faisaient échouer chaque action, sans proposer
    // de reconnexion. Une session expirée est effacée tout de suite, pour
    // que l'appli n'affiche jamais un état qu'elle ne peut pas honorer.
    // EN: ⚠️ CHANGED - check the session STATE, not just token presence:
    // expired tokens showed "connected" then failed on every action. An
    // expired session is cleared at once so the app never displays a state
    // it cannot honour.
    if (connexionAutoLancee.current) return;
    const etat = etatSession();
    if (etat === "expiree") {
      connexionAutoLancee.current = true;
      deconnecter();
      setConnecte(false);
      setSessionExpiree(true);
    } else if (etat === "valide") {
      connexionAutoLancee.current = true;
      setConnecte(true);
      testerConnexion();
    }
  }, []);

  /**
   * FR : ⚠️ AJOUT (30/09/2026, v0.3.0) - détection de l'expiration PENDANT
   * l'usage. Jusqu'ici, l'expiration n'était constatée qu'au démarrage et au
   * clic sur « Tester la connexion » : appli ouverte plus d'une heure, le bloc
   * de connexion restait sur « ✅ connecté » jusqu'à la première action en
   * échec (signalé par l'utilisateur : « le bloc de connexion n'affiche plus
   * l'expiration de la session »). Trois déclencheurs : une vérification toutes
   * les 15 s, le retour sur la fenêtre (après une pause, le minuteur du
   * navigateur peut avoir dormi), et le signal émis par toute action qui bute
   * sur l'expiration (équiper, etc.). Même bascule que le bouton de test.
   * EN: ⚠️ ADDED - detect expiry DURING use: 15 s check, window refocus, and
   * the signal emitted by any action that hits the expiry.
   */
  const basculerSessionExpiree = useRef<() => void>(() => {});
  basculerSessionExpiree.current = () => {
    deconnecter();
    setConnecte(false);
    setMemberships([]);
    setPersonnages([]);
    setResume(null);
    setNomBungie(null);
    setProfilTriomphes(null);
    setErreurTest(null);
    setSessionExpiree(true);
  };

  useEffect(() => {
    if (!connecte) return;
    const verifier = () => {
      if (etatSession() === "expiree") basculerSessionExpiree.current();
    };
    const surSignal = () => basculerSessionExpiree.current();
    const minuteur = window.setInterval(verifier, 15_000);
    window.addEventListener("focus", verifier);
    document.addEventListener("visibilitychange", verifier);
    window.addEventListener(EVENEMENT_SESSION_EXPIREE, surSignal);
    return () => {
      window.clearInterval(minuteur);
      window.removeEventListener("focus", verifier);
      document.removeEventListener("visibilitychange", verifier);
      window.removeEventListener(EVENEMENT_SESSION_EXPIREE, surSignal);
    };
  }, [connecte]);

  async function testerConnexion() {
    setEnCours(true);
    setErreurTest(null);
    setResume(null);
    try {
      const { memberships: comptes, nomBungie: nom } = await recupererComptesBungie();
      setMemberships(comptes);
      setNomBungie(nom);
      if (comptes.length === 0) {
        setErreurTest("Connecté, mais aucun compte Destiny lié trouvé sur ce compte Bungie.net.");
        return;
      }
      // FR : on prend le premier compte lié par simplicité ; à affiner si
      // vous jouez sur plusieurs plateformes non reliées par Cross Save.
      // EN: we take the first linked account for simplicity; refine if you
      // play on several platforms not linked via Cross Save.
      const { resume: resumeProfil, personnages: listePersonnages } = await recupererResumeEtPersonnages(comptes[0]);
      setResume(resumeProfil);
      setPersonnages(listePersonnages);

      // FR : ⚠️ AJOUT (24/08/2026) - triomphes pour la vitrine « Solo sans
      // mourir ». Erreur volontairement ISOLÉE dans son propre try : c'est
      // une vitrine facultative, un échec ici ne doit pas empêcher le
      // chargement du profil et de l'inventaire, qui sont l'essentiel.
      // EN: ⚠️ ADDED - triumphs for the "Solo Flawless" showcase. Error
      // deliberately ISOLATED in its own try: this is an optional showcase,
      // a failure here must not block the profile/inventory loading.
      try {
        setProfilTriomphes(await recupererProfilTriomphes(comptes[0]));
      } catch {
        setProfilTriomphes(null);
      }
    } catch (e) {
      // FR : ⚠️ AJOUT (24/09/2026) - expiration survenue PENDANT l'usage :
      // on bascule l'appli en « non connecté » et on affiche la bannière,
      // au lieu de laisser un message d'erreur sous un en-tête « connecté ».
      // EN: ⚠️ ADDED - expiry DURING use: switch to "not connected" and
      // show the banner instead of an error under a "connected" header.
      if (e instanceof SessionExpiree) {
        deconnecter();
        setConnecte(false);
        setSessionExpiree(true);
      } else {
        setErreurTest((e as Error).message);
      }
    } finally {
      setEnCours(false);
    }
  }

  function gererDeconnexion() {
    deconnecter();
    setConnecte(false);
    setMemberships([]);
    setPersonnages([]);
    setResume(null);
    setNomBungie(null);
    setProfilTriomphes(null);
  }

  async function gererExportDim() {
    try {
      const url = await exporterVersDim(monBuild);
      window.open(url, "_blank");
    } catch (e) {
      alert(`Export DIM impossible pour le moment : ${(e as Error).message}`);
    }
  }

  return (
    <div>
      {/* FR : ⚠️ CHANGÉ (01/10/2026, v0.3.0) - en-tête Forge Armory à l'essai
      (titre + sous-titre, logo aligné par mesure) : voir EnTeteApp.tsx. Ancien
      en-tête archivé dans ressources-installateur/forge-armory/archives-precedentes/ancien-logo/ancien-en-tete.txt.
      EN: ⚠️ CHANGED - Forge Armory trial header, see EnTeteApp.tsx. */}
      {/* FR : ⚠️ CHANGÉ (05/10/2026) - le titre et, tout à droite, la version de Destiny 2 prise en compte avec la date du
      patch (data/versionJeu.ts). Sur une fenêtre étroite, l'affichage passe sous le titre en restant calé à droite.
      EN: ⚠️ CHANGED - the title and, far right, the Destiny 2 version taken into account with the patch date. */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: "1rem" }}>
        <EnTeteApp />
        <BadgeVersionJeu />
      </div>

      {/* FR : Bloc de connexion + test - c'est ici qu'on verifie que tout
          fonctionne apres avoir autorise l'appli sur Bungie.net.
          EN: Connection + test block - this is where you verify everything
          works after authorizing the app on Bungie.net. */}
      {/* FR : ⚠️ CHANGÉ (28/09/2026, v0.2.8) - bloc resserré, demande de
      l'utilisateur : « Compte : » passe à GAUCHE des boutons, sur la même
      ligne, suivi du nom Bungie (`pseudo#1234`) au lieu du nom de
      plateforme ; la ligne de résumé (personnages, niveaux de lumière,
      nombre d'objets du coffre) est supprimée. Les personnages restent
      CHARGÉS (Mon Build et les Loadouts s'en servent), ils ne sont
      simplement plus affichés ici. Le bouton de test perd sa mention
      « (profil + coffre) », qui décrivait le résumé disparu. La bannière
      d'expiration sort de la ligne des boutons (elle s'y glissait en
      flex au milieu des boutons).
      EN: ⚠️ CHANGED - tighter block: "Compte :" moves LEFT of the buttons on
      the same row, followed by the Bungie name; the summary line
      (characters, light levels, vault count) is removed. Characters are
      still LOADED (used by Mon Build and Loadouts), just not shown here. */}
      {/* FR : ⚠️ CHANGÉ (07/10/2026, v0.3.17) - le bloc « Connexion à Bungie » n'est PAS repliable (retour de l'utilisateur sur la 0.3.16) : retour à un bloc fixe (<div> + <h3>) avec la version SANS losange + / − du titre. L'essai de la 0.3.16 (bloc repliable) est abandonné. / EN: ⚠️ CHANGED - this block is NOT collapsible (user feedback): back to a fixed block with the no-diamond title. */}
      {/* FR : ⚠️ CHANGÉ (21/10/2026, demande de l'utilisateur, capture annotée) - une fois CONNECTÉ, la carte passe en grille (classe `pilier-carte--connexion`, voir index.css) pour que les boutons « Carrière » et « Accomplissements » se placent entre le titre et le statut ; hors connexion, mise en page inchangée. / EN: ⚠️ CHANGED - once connected the card becomes a grid so the two buttons sit between the title and the status. */}
      <div className={`pilier-carte${connecte ? " pilier-carte--connexion" : ""}`}>
        <h3><TitreCategorie categorie="connexion" /><span>{connecte ? "✅ connecté" : "◯ non connecté"}</span></h3>
        {!connecte && (
          <p style={{ margin: "0 0 0.5rem" }}>Cliquez pour vous connecter — vous serez redirigé vers bungie.net.</p>
        )}
        {sessionExpiree && (
          <p
            style={{
              background: "#2a2418",
              border: "1px solid #6b5a2a",
              borderRadius: 6,
              padding: "0.5rem 0.7rem",
              fontSize: "0.85rem",
              margin: "0 0 0.5rem",
            }}
          >
            ⏳ <strong>Votre session Bungie a expiré.</strong> C'est normal : elle dure environ une heure, et
            cette application ne peut pas la prolonger toute seule. Cliquez sur « Connexion Bungie.net » pour
            reprendre — vos builds enregistrés ne sont pas affectés.
          </p>
        )}
        <div className="connexion-compte" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* FR : nom Bungie si Bungie l'a fourni, sinon nom de plateforme
          du premier compte Destiny (même valeur qu'avant ce changement).
          EN: Bungie name when provided, else the platform name (as before). */}
          {connecte && (nomBungie || resume) && (
            <span style={{ fontSize: "0.9rem", color: "#b7b3a8" }}>
              Compte : <strong style={{ color: "#e8e6df" }}>{nomBungie ?? resume?.compte}</strong>
            </span>
          )}
          {/* FR : ⚠️ CHANGÉ (06/09/2026) - le clic appelait directement la
          fonction : si elle levait une exception (cas de la régression
          d'audit du 06/09), le bouton ne faisait RIEN de visible, sans
          message ni redirection - impossible à diagnostiquer sans ouvrir la
          console. On affiche désormais l'erreur.
          EN: ⚠️ CHANGED - the click called the function directly: if it
          threw, the button did nothing visible, with no message - hence the
          errors surfaced now. */}
          {!connecte && (
            <button
              onClick={async () => {
                setErreurTest(null);
                setSessionExpiree(false);
                try {
                  // FR : ⚠️ CHANGÉ (24/09/2026) - deux modes. Dans un
                  // navigateur, la page est redirigée vers Bungie comme
                  // avant. Dans le logiciel installé, la connexion se fait
                  // dans une fenêtre dédiée et rend la main ici : il faut
                  // donc enchaîner nous-mêmes sur le chargement du profil.
                  // EN: ⚠️ CHANGED - two modes: browser redirect as before,
                  // or dedicated window in the installed app, which returns
                  // control here and needs the profile load chained on.
                  if (estBureau()) {
                    await connecterViaBureau();
                    setConnecte(true);
                    await testerConnexion();
                  } else {
                    redirigerVersAutorisation();
                  }
                } catch (e) {
                  setErreurTest(`Impossible de lancer la connexion Bungie : ${(e as Error).message}`);
                }
              }}
            >
              Connexion Bungie.net
            </button>
          )}
          {connecte && (
            <>
              <button onClick={gererDeconnexion}>Se déconnecter</button>
              {/* FR : ⚠️ AJOUT (24/09/2026) - outil de test : vérifier la
              bannière d'expiration sans attendre ~1 h. Mode dev seulement.
              EN: ⚠️ ADDED - test tool: check the expiry banner without
              waiting ~1 h. Dev mode only. */}
              {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.simulerExpirationSession && (
                <button
                  // FR : ⚠️ CHANGÉ (30/09/2026, v0.3.0) - le bouton ne fait plus
                  // basculer l'interface lui-même : il EXPIRE seulement le
                  // jeton, et la bannière doit apparaître TOUTE SEULE (sous 15 s
                  // au plus) par la détection en cours d'usage. Sinon il
                  // masquait justement l'absence de cette détection.
                  // EN: ⚠️ CHANGED - the button only EXPIRES the token; the
                  // banner must appear BY ITSELF via the in-use detection.
                  onClick={() => {
                    expirerSessionPourTest();
                  }}
                  title="Expire le jeton ; la bannière doit apparaître toute seule sous 15 secondes"
                  style={{ fontSize: "0.75rem" }}
                >
                  ⏳ Simuler l'expiration (dev)
                </button>
              )}
              <button onClick={testerConnexion} disabled={enCours}>
                {enCours && <span className="indicateur-chargement" />}
                {enCours ? "Test en cours..." : "Tester la connexion"}
              </button>
            </>
          )}
        </div>

        {erreurTest && <p style={{ color: "#e08080", margin: "0.5rem 0 0" }}>⚠️ {erreurTest}</p>}
        {/* FR : ⚠️ CHANGÉ (21/10/2026, demande de l'utilisateur, capture annotée) - « Carrière » (au-dessus) et « Accomplissements » : même taille, alignés, DÉPLACÉS au-dessus du sélecteur de vue (voir ligne 533) pour être visibles dans toutes les vues ; MASQUÉS hors connexion. Le composant `BoutonsVuesCompte` porte la taille et le cadre communs. / EN: ⚠️ CHANGED - the two buttons: same size, aligned, between the title and the status; hidden when not connected. */}
        {/* FR : ⚠️ CHANGÉ (21/10/2026, retour utilisateur) - les boutons « Carrière » et « Accomplissements » ne sont PLUS rendus ici (bloc Connexion) : ils sont montés UNE SEULE FOIS, au-dessus du sélecteur de vue, pour apparaître dans TOUTES les vues. / EN: CHANGED - the two buttons are NOT rendered here anymore: mounted ONCE, above the view selector, to appear in ALL views. */}

        {memberships.length > 1 && (
          <p style={{ fontSize: "0.8rem", color: "#b7b3a8", margin: "0.5rem 0 0" }}>
            Note : {memberships.length} comptes Destiny liés détectés, l'appli utilise le premier (
            {memberships[0].displayName}).
          </p>
        )}
      </div>

      {/* FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - sélecteur de vue, demande de
      l'utilisateur : bascule entre Build Analyzer (par défaut) et la
      Bibliothèque. Même style de pastilles que « Contexte du build ».
      EN: ⚠️ ADDED - view selector: Build Analyzer (default) or Library.
      Same pill style as "Contexte du build". */}
      {/* FR : ⚠️ CHANGÉ (06/10/2026, v0.3.5) - NOUVEAUX BOUTONS (fournis par l'utilisateur) et troisième vue « Load-outs » : voir components/SelecteurVues.tsx. / EN: ⚠️ CHANGED - NEW BUTTONS and a third view. */}
      {/* FR : ⚠️ AJOUT (21/10/2026, retour utilisateur) - les boutons « Carrière » et « Accomplissements » apparaissent PARTOUT (au-dessus du sélecteur de vue), dans TOUTES les vues (Build Analyzer, Load-outs, Forge, Legendarium) : la modale Carrière et le tiroir Accomplissements sont montés HORS des vues (lignes 672-681), donc accessibles de partout. Auparavant, ils n'étaient que dans le bloc Connexion (Build Analyzer seul). / EN: ADDED - the "Career" and "Achievements" buttons appear EVERYWHERE (above the view selector), in ALL views: the modal and the drawer are mounted OUTSIDE the views (lines 672-681), so reachable from anywhere. */}
      {connecte && <BoutonsVuesCompte onCarriere={() => setCarriereOuverte(true)} onAccomplissements={() => setTiroirTriomphesOuvert(true)} />}

      <SelecteurVues vue={vue} onChanger={setVue} />

      {vue === "forge" && <PageForge db={db} membership={memberships[0] ?? null} cible={cibleForge} onRetour={retourDepuisForge} onAjouterAuBuild={ajouterObjetAuBuild} idsDansBuild={idsDansBuild} onLireLore={ouvrirLoreDepuisObjet} />}   {/* ⚠️ v0.4.3 : la Collection lit les collections du compte */}
      {vue === "bibliotheque" && <Bibliotheque db={db} pageCible={cibleLegendarium?.pageId} provenance={cibleLegendarium?.provenance} onRetourObjet={cibleLegendarium ? retourDepuisLegendarium : undefined} />}   {/* ⚠️ AJOUT (21/10/2026, Legendarium étape 5) : lien profond fiche Détails → page de Lore + retour vers l'objet */}

      {/* FR : ⚠️ AJOUT (06/10/2026, v0.3.5) - vue « Load-outs » : le MÊME panneau que le tiroir, en pleine page (mode « page »). Le tiroir, lui, est masqué avec la vue Build Analyzer (qui reste montée) : les deux se tiennent
      à jour par l'événement du stockage. « Charger » ramène au Build Analyzer pour montrer le build chargé.
      EN: ⚠️ ADDED - "Load-outs" view: the SAME panel as the drawer, full page; "Charger" returns to the Build Analyzer. */}
      {vue === "loadouts" && (
        <PanneauLoadouts
          mode="page"
          objetsPossedes={objetsPossedes}
          onChargerLoadout={(build) => setMonBuild(build)}
          onApresCharger={() => {
            setVue("analyseur");
            setDefilementMonBuild((n) => n + 1);
          }}
          membership={memberships[0] ?? null}
          personnages={personnages}
          db={db}
        />
      )}

      {/* FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - la vue Build Analyzer est
      MASQUÉE (display: none) et non retirée quand la Bibliothèque est
      affichée. Sinon, chaque aller-retour effacerait l'inventaire chargé,
      la grille Doctrine, la recherche en cours... et le Manifest lui-même,
      chargé par le bloc de recherche ci-dessous, dont la Bibliothèque a
      besoin. Les deux panneaux latéraux (Solo sans mourir, Loadouts) sont
      masqués avec elle.
      EN: ⚠️ ADDED - the Build Analyzer view is HIDDEN, not unmounted, while
      the Library shows: otherwise every switch would wipe the loaded
      inventory, the Doctrine grid, the current search... and the Manifest,
      loaded by the search block below and needed by the Library. */}
      <div style={{ display: vue === "analyseur" ? "block" : "none" }}>
      <RechercheManifest onManifestCharge={setDb} onAjouterObjet={ajouterObjetAuBuild} onAllerA={(hash, nom) => setCibleInventaire({ hash, nom, demande: Date.now() })} />

      <SelecteurInventaire
        membership={memberships[0] ?? null}
        db={db}
        onAjouterObjet={ajouterObjetAuBuild}
        onObjetsCharges={setObjetsPossedes}
        cible={cibleInventaire}
        onEffacerCible={() => setCibleInventaire(null)}
        onOuvrirForge={ouvrirForge}   // ⚠️ AJOUT (14/10/2026, v0.4.9) : bouton « Forge » de la fenêtre Détails (Mon Inventaire et Coffre)
        onLireLore={ouvrirLoreDepuisObjet}   // ⚠️ AJOUT (21/10/2026, Legendarium étape 5) : bouton « Lire le Lore » de la popup Détails du Build Analyzer
      />

      {/* FR : ⚠️ AJOUT (01/10/2026) - contrôle de l'anti-champion des armes exotiques (dev). / EN: exotic anti-champion check (dev). */}
      {modeDiagnostic && DIAGNOSTICS_ACTIFS.controleAntiChampionExotiques && db && <ControleAntiChampionExotiques db={db} />}
      {/* FR : ⚠️ AJOUT (05/10/2026) - contrôle des icônes des perks d'artefact (dev). / EN: artifact perk icons check (dev). */}
      {modeDiagnostic && DIAGNOSTICS_ACTIFS.controleIconesPerksArtefact && db && <ControleIconesPerksArtefact db={db} />}
      {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.diagnosticPilier2 && db && (
        <div style={{ marginBottom: "0.75rem" }}>
          <button onClick={() => setDiagPilier2(obtenirDiagnosticPilier2(buildEffectif, db))} style={{ fontSize: "0.75rem" }}>
            🔍 Diagnostic Pilier 2 (ce que le score lit vraiment)
          </button>
        </div>
      )}

      {diagPilier2 && (
        <details open style={{ fontSize: "0.75rem", color: "#b7b3a8", marginBottom: "0.75rem" }}>
          <summary style={{ cursor: "pointer" }}>
            <span>🔍 Diagnostic Pilier 2 (à copier à Claude)</span>
            <button onClick={() => setDiagPilier2(null)} style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}>
              fermer
            </button>
          </summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "0.68rem",
              background: "#0d0f14",
              border: "1px solid #2a2e38",
              borderRadius: 6,
              padding: "0.5rem",
              maxHeight: "420px",
              overflowY: "auto",
            }}
          >
            {diagPilier2}
          </pre>
        </details>
      )}

      <GrilleDoctrine
        membership={memberships[0] ?? null}
        db={db}
        classeActuelle={monBuild.subclass.classe}
        subclass={monBuild.subclass}
        onChangerSubclass={changerSubclass}
        onChangerClasse={changerClasse}
      />

      {/* FR : ⚠️ RETIRÉ (07/10/2026, v0.3.17), demande de l'utilisateur : la ligne « Contexte du Build » (titre + quatre boutons) qui était ici, juste au-dessus de « Mon Build », n'existe plus : ses quatre boutons sont maintenant DANS « Mon Build », en partie haute,
      sous son titre (components/ResumeBuild.tsx, propriétés `contexte` et `onChangerContexte`). Le bloc « 0. Contexte du Build » plus bas est inchangé. / EN: ⚠️ REMOVED - the "Context" row above "Mon Build" is gone: its buttons now live inside "Mon Build", under its title. */}

      {/* FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - ancre du défilement après « Charger » (enveloppe sans style : aucun changement d'affichage). / EN: ⚠️ ADDED - scroll anchor (unstyled wrapper). */}
      <div ref={refMonBuild} id="bloc-mon-build" style={{ scrollMarginTop: "0.5rem" }}>
        <ResumeBuild
          build={buildEffectif}
          onOuvrirForge={ouvrirForge}
          membership={memberships[0] ?? null}
          personnages={personnages}
          db={db}
          onReinitialiser={reinitialiserBuild}
          contexte={monBuild.contexte ?? "neutre"}
          onChangerContexte={(valeur) => setMonBuild((b) => ({ ...b, contexte: valeur }))}
        />
      </div>

      {/* FR : ⚠️ AJOUT (04/08/2026) - sélecteur d'artefact, placé SOUS
      "Mon Build" (demande de l'utilisateur). Sans lui, le Pilier 3 notait
      un tableau qui restait toujours vide. */}
      <SelecteurArtefact
        artifact={monBuild.artifact}
        elementBuild={monBuild.subclass.element}
        onChanger={(artifact) => setMonBuild((b) => ({ ...b, artifact }))}
        db={db}
      />
      {/* FR : ⚠️ AJOUT (28/09/2026, v0.2.8) - partage du build en cours sans
      l'enregistrer (JSON, texte, JPEG, PNG, PDF), demande de l'utilisateur.
      EN: ⚠️ ADDED - share the current build without saving it. */}
      {/* FR : ⚠️ CHANGÉ (06/10/2026, v0.3.3) - `auteur` : le pseudo affiché dans le bloc Connexion (même expression), seulement si l'on est connecté. / EN: ⚠️ CHANGED - `auteur`: the handle shown in the Connection block, only when connected. */}
      <BlocPartage build={monBuild} db={db} auteur={connecte ? (nomBungie ?? resume?.compte ?? null) : null} onVoirLoadouts={() => setVue("loadouts")} />

      {/* FR : ⚠️ AJOUT (04/08/2026) - panneau latéral des loadouts. En
      position `fixed`, il suit le défilement de la page (demande de
      l'utilisateur) : son emplacement dans le JSX n'influe donc pas sur
      sa position à l'écran.
      EN: ⚠️ ADDED (2026-08-04) - loadouts side panel. Being `fixed`, it
      follows page scroll (user request): its position in the JSX has no
      bearing on where it appears. */}
      {/* FR : ⚠️ AJOUT (24/08/2026) - vitrine « Solo sans mourir », panneau
      glissant à GAUCHE, miroir des loadouts à droite. Comme eux, en
      position `fixed` : son emplacement dans le JSX n'influe pas sur sa
      position à l'écran.
      EN: ⚠️ ADDED - "Solo Flawless" showcase, LEFT sliding panel mirroring
      the loadouts on the right. Also `fixed`, so its JSX position doesn't
      affect where it appears. */}
      {/* FR : ⚠️ AJOUT (20/10/2026, v0.4.14) - vue « Carrière » du compte : modale (même habillage que les fenêtres Détails existantes, choix de la spécification) ouverte par le bouton du bloc Connexion. Aucune persistance : rafraîchie à chaque ouverture. / EN: ⚠️ ADDED - Career modal. */}
      {carriereOuverte && connecte && memberships[0] && (
        <ModaleCarriere
          onFermer={() => setCarriereOuverte(false)}
          membership={memberships[0]}
          personnages={personnages}
          profil={profilTriomphes}
          onOuvrirAccomplissements={() => setTiroirTriomphesOuvert(true)}
        />
      )}
      <PanneauTriomphes profil={profilTriomphes} db={db} ouvertExterieur={tiroirTriomphesOuvert} onOuvertChange={setTiroirTriomphesOuvert} onOuvrirCarriere={connecte ? () => setCarriereOuverte(true) : undefined} />

      <PanneauLoadouts
        objetsPossedes={objetsPossedes}
        onChargerLoadout={(build) => setMonBuild(build)}
        membership={memberships[0] ?? null}
        personnages={personnages}
        db={db}
        build={monBuild}
        auteur={connecte ? (nomBungie ?? resume?.compte ?? null) : null}
      />

      {/* FR : ⚠️ AJOUT (24/08/2026) - taux de complétion À CÔTÉ du score,
      pas fondu dedans (décision prise avec l'utilisateur). Sans lui, un
      score de 60 était ambigu : « build médiocre » ou « build à moitié
      rempli » ? Deux situations très différentes qui appellent des actions
      opposées. Le détail de ce qui manque est dans l'infobulle plutôt
      qu'affiché en entier : la liste peut faire 15 lignes sur un build
      vide, ce qui noierait le score qu'elle est censée nuancer.
      EN: ⚠️ ADDED - completion rate NEXT TO the score, not folded into it.
      Without it, a score of 60 was ambiguous: "mediocre build" or
      "half-filled build"? The list of missing slots goes in the tooltip
      rather than displayed in full: it can run to 15 lines on an empty
      build, drowning the very score it's meant to qualify. */}
      {/* FR : ⚠️ AJOUT (07/10/2026, v0.3.15) - titre illustré « Score global » au-dessus du score. / EN: ⚠️ ADDED - illustrated "Score global" title above the score. */}
      <div style={{ marginBottom: "0.4rem" }}>
        <TitreCategorie categorie="score-global" />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
        <div className="score-global">{resultat.scoreGlobal}/100</div>
        {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - dit clairement que le score tient compte de perks SIMULÉS dans la Forge, et que l'enregistrement et le partage restent sur les perks RÉELS. / EN: says that the score uses simulated perks. */}
        {nbSimulees > 0 && (
          <div data-score-simule="" title="Les perks choisis dans la Forge (vue Inventaire) remplacent ceux de vos armes pour le calcul du score. L'enregistrement, le partage et l'équipement en jeu gardent vos perks réels." style={{ fontSize: "0.85rem", color: "#e8c547", cursor: "help" }}>
            🔨 Score calculé avec des perks simulés ({nbSimulees} arme{nbSimulees > 1 ? "s" : ""})
          </div>
        )}
        <div
          title={
            resultat.completion.manquants.length > 0
              ? `Emplacements vides :\n• ${resultat.completion.manquants.join("\n• ")}`
              : "Tous les emplacements sont remplis"
          }
          style={{
            fontSize: "0.85rem",
            color: resultat.completion.taux === 100 ? "#7fd88f" : "#e0c080",
            cursor: "help",
          }}
        >
          {resultat.completion.taux === 100
            ? "✅ Build complet"
            : `⚠️ Build rempli à ${resultat.completion.taux}% (${resultat.completion.remplis}/${resultat.completion.total} emplacements)`}
        </div>
      </div>

      {/* FR : ⚠️ AJOUT (04/08/2026) - avertissement sur la PORTÉE du score,
      demande de l'utilisateur. Placé juste sous le chiffre plutôt que
      dans le seul README : c'est ici qu'on regarde le score, et un
      nombre sur 100 donne facilement une impression d'objectivité qu'il
      ne mérite pas. L'appli évalue une cohérence théorique à partir du
      Manifest, elle ne mesure ni le ressenti, ni le style de jeu, ni le
      contexte d'une activité.
      EN: ⚠️ ADDED (2026-08-04) - warning about the score's SCOPE, user
      request. Placed right under the number rather than in the README
      alone: this is where the score is read, and a number out of 100
      easily conveys an objectivity it doesn't deserve. */}
      <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0.25rem 0 1rem", maxWidth: "60ch" }}>
        ℹ️ Ce score évalue la <strong>cohérence théorique</strong> du build d'après les données du
        Manifest. Il ne remplace pas l'expérimentation en jeu : un build noté 95 peut être
        désagréable à jouer, un build noté 60 peut être excellent entre vos mains. À prendre comme
        un second regard, pas comme un verdict.
      </p>

      {/* FR : ⚠️ AJOUT (24/08/2026) - bloc "0. Contexte du build", demande de
      l'utilisateur : la sélection était mêlée aux boutons juste au-dessus du
      score, sans expliquer la pondération qu'elle applique. Regroupée
      maintenant dans un bloc dédié, sur le même modèle que les piliers 1-5,
      AVANT eux puisque c'est le réglage qui les détermine tous.
      EN: ⚠️ ADDED - "0. Build context" block, user request: the selector was
      mixed in with the buttons above the score, without explaining the
      weighting it applies. Now grouped in a dedicated block, BEFORE the
      pillars since it's the setting that determines all of them. */}
      <BlocContexte
        contexte={monBuild.contexte ?? "neutre"}
        onChanger={(contexte) => setMonBuild((b) => ({ ...b, contexte }))}
        ponderations={ponderations}
        onPonderations={setPonderations}
      />

      {resultat.piliers.map((p) => (
        <PilierCarte key={p.pilier} pilier={p} stats={resultat.statsTotales} />
      ))}

      <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
        <button onClick={gererExportDim}>Exporter vers DIM (bêta / en chantier)</button>
      </div>
      </div>

      {/* FR : ⚠️ AJOUT (08/09/2026) - crédit d'auteur, demande explicite de
      l'utilisateur pour la première génération destinée à être partagée
      ("génération pour inviter"). Discret (petite taille, couleur atténuée),
      en bas de page — ne perturbe aucun des panneaux fonctionnels au-dessus.
      EN: ⚠️ ADDED - author credit, explicit request for the first
      shareable/invite build. Kept discreet, at the very bottom. */}
      <p style={{ marginTop: "3rem", fontSize: "0.75rem", color: "#7d7a70", textAlign: "center" }}>
        Forge Armory v{__VERSION_APP__} — Destiny 2 Build Analyzer — créé par Orynick/Orygamer{" "}
        {/* FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - section CRÉDITS en pied de page, ouverte en pop-up : obligation de la licence MIT de d2-additional-info, dont les tables de saisons et de sources sont embarquées (data/seasons.json, data/source-filters.json). Décision de l'utilisateur : « pied de page avec ouverture de pop-up ». / EN: ⚠️ ADDED - footer "Crédits" link opening a pop-up (MIT obligation). */}
        <button type="button" data-ouvrir-credits="" onClick={() => setCreditsOuverts(true)} style={{ fontSize: "0.75rem", background: "none", border: "none", color: "#9a8f6a", cursor: "pointer", padding: 0, textDecoration: "underline" }}>Crédits</button>
      </p>
      {creditsOuverts && (
        <div onClick={() => setCreditsOuverts(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
          <div role="dialog" aria-modal="true" aria-label="Crédits" data-credits="" onClick={(e) => e.stopPropagation()} style={{ background: "#12151c", border: "1px solid #3a3f4b", borderRadius: 10, padding: "1rem 1.2rem", width: "min(34rem, 92vw)", maxHeight: "80vh", overflowY: "auto", color: "#e8e6df" }}>
            <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Crédits</h2>
            <p style={{ fontSize: "0.8rem", color: "#b7b3a8" }}>
              Forge Armory est un projet de fan, non affilié à Bungie. Destiny 2 est une marque de Bungie, Inc. Les noms de saisons, descriptions de sources et autres données du jeu appartiennent à Bungie.
            </p>
            <p style={{ fontSize: "0.8rem", color: "#b7b3a8" }}>
              <strong>Données de saisons et de sources</strong> :{" "}
              <a href="https://github.com/DestinyItemManager/d2-additional-info" target="_blank" rel="noreferrer" style={{ color: "#7aa2f7" }}>d2-additional-info</a>{" "}
              — Destiny Item Manager, <a href="https://github.com/DestinyItemManager/d2-additional-info/blob/master/LICENSE" target="_blank" rel="noreferrer" style={{ color: "#7aa2f7" }}>licence MIT</a>.
              Les tables de correspondance (saisons, sources de loot) en sont dérivées et régénérées par <code>data/rebuild-source-filters.ts</code>.
            </p>
            <p style={{ textAlign: "right", margin: 0 }}>
              <button type="button" onClick={() => setCreditsOuverts(false)} style={{ fontSize: "0.8rem" }}>Fermer</button>
            </p>
          </div>
        </div>
      )}
      {/* FR : ⚠️ AJOUT (06/10/2026) - réglage du MODE DIAGNOSTIC (aussi dans l'appli installée), discret, en pied de page : voir components/InterrupteurModeDiagnostic.tsx. EN: ⚠️ ADDED - diagnostic mode switch. */}
      <InterrupteurModeDiagnostic />
    </div>
  );
}

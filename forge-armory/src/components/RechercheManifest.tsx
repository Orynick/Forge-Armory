import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";
// FR : Champ de recherche dans le Manifest - trouve un objet precis par nom,
// ou tout ce qui contient un mot (nom, description, perks, aspects,
// fragments, perks d'artefact...). Charge les Manifests a la demande
// (bouton dedie) plutot qu'au demarrage de l'appli.
//
// ⚠️ AJOUT (02/08/2026) : recherche BILINGUE (français + anglais) - permet
// de croiser une source externe en anglais (ex: knowledge-base/) avec le
// Manifest. Le français reste TOUJOURS la langue d'affichage de l'appli ;
// l'anglais n'élargit que ce qu'on peut taper dans le champ de recherche.
// Charger les deux Manifests ~double le volume téléchargé la première fois
// (~200 Mo au lieu de ~100), mais chacun est mis en cache séparément.
//
// EN: Manifest search field - finds a specific item by name, or anything
// containing a word (name, description, perks, aspects, fragments,
// artifact perks...). Loads the Manifests on demand (dedicated button)
// rather than on app startup.
//
// ⚠️ ADDED (2026-08-02): BILINGUAL search (French + English) - lets you
// cross-reference an external English source (e.g. knowledge-base/) with
// the Manifest. French always REMAINS the app's display language; English
// only widens what can be typed in the search box. Loading both Manifests
// roughly doubles the first download (~200MB instead of ~100), but each is
// cached separately.

import TitreCategorie from "./TitreCategorie";
import { useEffect, useMemo, useRef, useState } from "react";
import { obtenirElementFiltre, ELEMENTS_FILTRE, ElementFiltre } from "../lib/manifest/doctrine";   // ⚠️ AJOUT (12/10/2026, v0.4.0) : filtre d'élément
import { LIBELLES_ELEMENT_FR } from "../data/libellesElements";
import { Database } from "sql.js";
import { assurerManifestAJour, etatCachesManifests, simulerManifestPerime, telechargerManifestsEnFichiers, obtenirDefinition } from "../lib/manifest/download";   // ⚠️ AJOUT (19/10/2026) : lecture des itemSourceHashes pour le filtre source:
import { demarrerManifests, LangueManifest } from "../lib/manifest/demarrage";   // ⚠️ AJOUT (13/10/2026, v0.4.3) : mise à jour automatique d'un Manifest PÉRIMÉ
import { rechercherBilingue, indexerManifest, ModeRecherche, ResultatRechercheBilingue, CategorieResultat, diagnostiquerCorrespondances, DiagnosticCorrespondance, chercherTriomphesFlawless, TriompheTrouve } from "../lib/manifest/search";
// FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - la catégorie de SOURCE d'un objet (d2-additional-info, MIT) affichée à côté de la chaîne brute, et le filtre `source:`.
import { sourceObjetParHash } from "../data/sourceObjet";
import { saisonParNumero } from "../data/saisons";   // ⚠️ AJOUT (19/10/2026) : saison de sortie en clair (secours du nom + dates)
import { obtenirSaisonObjet } from "../lib/manifest/saison";   // ⚠️ AJOUT (19/10/2026) : seasonHash/filigrane → numéro
import { extraireFiltreSource, SOURCE_FILTER_SUGGESTIONS, matchesSourceFilter } from "../data/sourceFilter";
import { construireIndexInversePerks, obtenirIndexInversePerksEnCache, ObjetParent } from "../lib/manifest/perkSource";
import { obtenirSource, obtenirAntiChampion, obtenirTypeMunition, obtenirCategoriesObjet, raccourcirNom } from "../lib/manifest/doctrine";
import IconeAntiChampion, { TypeChampion } from "./icones/IconeAntiChampion";
import IconeClasse from "./icones/IconeClasse";
import IconeSlotArmure from "./icones/IconeSlotArmure";
import IconeTypeArme from "./icones/IconeTypeArme";
import { obtenirSecoursTypeArme } from "../lib/manifest/typeArmeSecours";
import ListeResultatsMasques from "./ListeResultatsMasques";
import { useModeDiagnostic } from "../lib/modeDiagnostic";
import { GearPiece, SlotArmure } from "../types/build";

const LIBELLES_CATEGORIE: Record<CategorieResultat | "toutes", string> = {
  toutes: "Toutes catégories (hors quêtes/ornements/packs/harmonisation/triomphes/objets factices)",
  arme: "Armes uniquement",
  armure: "Armure uniquement",
  aspect: "Aspects uniquement",
  fragment: "Fragments uniquement",
  quete: "Quêtes/missions (masqué par défaut)",
  ornement: "Ornements (masqué par défaut)",
  pack: "Packs commerciaux (masqué par défaut)",
  harmonisation: "Harmonisation (masqué par défaut)",
  // FR : ⚠️ AJOUT (24/08/2026) - triomphes, recherche bilingue FR/EN.
  triomphe: "Triomphes (masqué par défaut)",
  // FR : ⚠️ AJOUT (06/10/2026) - objets factices (type « Dummy » : colis, copies d'armes, anciennes versions) ; voir `devinerCategorie` dans search.ts.
  factice: "Objets factices : colis, copies d'armes (masqué par défaut)",
  autre: "Autre (perks, mods...)",
};

// FR : ⚠️ RETIRÉ (04/08/2026) - remplacé par les vraies icônes SVG de
// classe (IconeClasse), le Manifest ne fournissant aucune icône pour les
// classes (confirmé par diagnostic).

const DELAI_DEBOUNCE_MS = 350;

interface Props {
  onManifestCharge?: (dbFr: Database) => void;
  onAjouterObjet?: (piece: GearPiece) => void;
  /** FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - bouton « Aller à » : fait glisser la page sur « Mon Inventaire » et le filtre sur cet objet (demande de l'utilisateur). Facultatif : sans lui, le bouton n'est pas affiché. / EN: ⚠️ ADDED - "Go to" button. */
  onAllerA?: (hash: number, nom: string) => void;
}

export default function RechercheManifest({ onManifestCharge, onAjouterObjet, onAllerA }: Props) {
  const [dbFr, setDbFr] = useState<Database | null>(null);
  const [dbEn, setDbEn] = useState<Database | null>(null);
  const [etapeChargement, setEtapeChargement] = useState<string | null>(null);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  // FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - message de la mise à jour AUTOMATIQUE d'un Manifest périmé (annonce, réussite ou échec). / EN: ⚠️ ADDED - message of the automatic refresh of an outdated Manifest.
  const [messageMiseAJourAuto, setMessageMiseAJourAuto] = useState<string | null>(null);

  const [motCle, setMotCle] = useState("");
  const [mode, setMode] = useState<ModeRecherche>("plein_texte");
  const [categorie, setCategorie] = useState<CategorieResultat | "toutes">("toutes");
  const [resultats, setResultats] = useState<ResultatRechercheBilingue[]>([]);
  // FR : ⚠️ AJOUT (06/10/2026) - résultats MASQUÉS par défaut, listés à part (voir ListeResultatsMasques). / EN: ⚠️ ADDED - results hidden by default, listed separately.
  const [resultatsMasques, setResultatsMasques] = useState<ResultatRechercheBilingue[]>([]);
  const modeDiagnostic = useModeDiagnostic();
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);
  const [messageTelechargement, setMessageTelechargement] = useState<string | null>(null);

  async function gererTelechargementManifests() {
    setTelechargementEnCours(true);
    setMessageTelechargement("Préparation...");
    try {
      const { version, fichiers } = await telechargerManifestsEnFichiers((m) => setMessageTelechargement(m));
      setMessageTelechargement(
        `✅ ${fichiers.join(" et ")} téléchargé(s) — version ${version}. ` +
          `📁 Emplacement : le dossier de téléchargements de votre navigateur ` +
          `(sous Windows, en général C:\\Users\\<votre nom>\\Downloads). ` +
          `Une page web n'a pas le droit de choisir le dossier de destination, ` +
          `c'est pour ça qu'ils ne sont pas dans les dossiers du jeu ni du projet. ` +
          `Pour les déposer directement dans le projet (dossier "manifest-local"), ` +
          `utilisez plutôt : node scripts/telecharger-manifest.mjs`
      );
    } catch (e) {
      setMessageTelechargement(`⚠️ ${(e as Error).message}`);
    } finally {
      setTelechargementEnCours(false);
    }
  }
  const [filtreChampion, setFiltreChampion] = useState<"tous" | TypeChampion>("tous");
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - filtre sur l'ÉLÉMENT DE DÉGÂTS (Cinétique, Solaire, Cryo-électrique, Abyssal, Stase, Filobscur), demande de l'utilisateur. Comme l'anti-champion : côté client, après la recherche. Il porte sur les armes (et les sous-classes) : un objet sans élément n'apparaît sous aucun élément. / EN: ⚠️ ADDED - damage element filter, client-side like the champion filter.
  const [filtreElement, setFiltreElement] = useState<"tous" | ElementFiltre>("tous");

  // FR : ⚠️ AJOUT (04/08/2026) - filtrage côté client par anti-champion,
  // recalculé seulement quand les résultats ou le filtre changent (pas à
  // chaque rendu), le type de champion n'étant pas indexé.
  // FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - filtre de SOURCE par syntaxe dans le champ de recherche : « source:raid », « source:last-wish »… (13 catégories + activités, d2-additional-info, MIT). Le filtre est EXTRAIT du texte avant la recherche (les autres mots cherchent normalement), puis appliqué côté client sur les itemSourceHashes de chaque objet : un objet sans hash de source est simplement exclu, sans erreur. Combinable avec l'anti-champion et l'élément par ET logique. La négation (-source:raid) est exclue de la v1 pour rester simple. / EN: ⚠️ ADDED - `source:` search filter, combined with the existing filters by logical AND.
  const [filtreSource, setFiltreSource] = useState<string | null>(null);
  const resultatsAffiches = useMemo(() => {
    if (!dbFr || (filtreChampion === "tous" && filtreElement === "tous" && !filtreSource)) return resultats;
    return resultats.filter((r) => {
      if (filtreChampion !== "tous") {
        if (!r.slot || !["cinetique", "energie", "lourde"].includes(r.slot)) return false;
        if (obtenirAntiChampion(dbFr, r.hash) !== filtreChampion) return false;
      }
      if (filtreElement !== "tous" && obtenirElementFiltre(dbFr, r.hash) !== filtreElement) return false;
      // FR : ⚠️ (19/10/2026) - le filtre source: porte sur N'IMPORTE QUEL objet du Manifest (les perks et fragments ont aussi des sources).
      if (filtreSource) {
        let hashes: number[] | undefined;
        try { hashes = obtenirDefinition<{ itemSourceHashes?: number[] }>(dbFr, "DestinyInventoryItemDefinition", r.hash)?.itemSourceHashes; } catch { /* lecture impossible : l'objet est exclu, pas une erreur */ }
        if (!matchesSourceFilter(hashes, filtreSource)) return false;
      }
      return true;
    });
  }, [resultats, filtreChampion, filtreElement, filtreSource, dbFr]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [erreurRecherche, setErreurRecherche] = useState<string | null>(null);
  // FR : ⚠️ AJOUT (24/08/2026) - diagnostic (mode dev) pour localiser
  // PRÉCISÉMENT où un mot-clé matche dans le JSON, avant d'écrire un filtre
  // anti-dialogue. Signalé par l'utilisateur : chercher "one-two" remonte
  // "vise le sac, petit", une réplique de PNJ.
  const [diagnosticRecherche, setDiagnosticRecherche] = useState<DiagnosticCorrespondance[] | null>(null);
  // FR : ⚠️ AJOUT (24/08/2026) - diagnostic ponctuel pour la future vitrine
  // Solo Flawless (PAS intégrée à l'appli, juste une aide au recensement).
  const [diagnosticFlawless, setDiagnosticFlawless] = useState<TriompheTrouve[] | null>(null);

  const minuteurDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FR : ⚠️ CHANGÉ (13/10/2026, v0.4.3) - le chargement prend maintenant la liste des langues à charger (le FRANÇAIS est toujours chargé : c'est la langue de l'appli) et dit s'il a RÉUSSI ; `chargerManifests` (sans paramètre, utilisé par le bouton) garde son rôle : français puis anglais. Raison : la mise à jour automatique d'un Manifest périmé ne doit retélécharger que les langues réellement présentes en cache, jamais une langue que l'utilisateur n'a pas encore téléchargée.
  // EN: ⚠️ CHANGED - loading takes the list of languages (French is always loaded) and reports success; the parameterless `chargerManifests` keeps its role for the button.
  async function chargerLangues(langues: LangueManifest[]): Promise<boolean> {
    setErreurChargement(null);
    try {
      const resultatFr = await assurerManifestAJour((etape) => setEtapeChargement(etape), "fr");
      const baseFr = resultatFr.db;
      setEtapeChargement("Indexation (français)...");
      await new Promise((r) => setTimeout(r, 0)); // laisse React afficher le message avant le travail bloquant
      await indexerManifest(baseFr, "fr", resultatFr.version);
      // FR : ⚠️ AJOUT (03/08/2026) - construit l'index inversé perk ->
      // équipements ici, une seule fois, pour savoir sur quel objet se
      // trouve une perk trouvée en recherche (demande utilisateur :
      // "je trouve Visage redouté mais pas de lien vers l'objet").
      // EN: ⚠️ ADDED (2026-08-03) - builds the perk -> gear reverse index
      // here, once, to know which item a perk found in search belongs to
      // (user request: "I find Visage of Dread but no link to the item").
      setEtapeChargement("Indexation des sources de perks...");
      await new Promise((r) => setTimeout(r, 0));
      await construireIndexInversePerks(baseFr, "fr", resultatFr.version);
      setDbFr(baseFr);
      onManifestCharge?.(baseFr);

      if (langues.includes("en")) {
        const resultatEn = await assurerManifestAJour((etape) => setEtapeChargement(etape), "en");
        const baseEn = resultatEn.db;
        setEtapeChargement("Indexation (anglais)...");
        await new Promise((r) => setTimeout(r, 0));
        await indexerManifest(baseEn, "en", resultatEn.version);
        setDbEn(baseEn);
      }

      setEtapeChargement(null);
      return true;
    } catch (e) {
      setErreurChargement((e as Error).message);
      setEtapeChargement(null);
      return false;
    }
  }

  async function chargerManifests() {
    await chargerLangues(["fr", "en"]);
    // FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - la passe de vérification de péremption couvre AUSSI les tables de sources : `node data/rebuild-source-filters.ts --check` compare le source-filters.json EMBARQUÉ à l'état actuel de d2-additional-info ; s'il est périmé, un AVERTISSEMENT s'affiche (comme l'alerte de péremption du Manifest), jamais un blocage — la régénération se fait côté développement. / EN: the staleness pass also checks the shipped source tables; a warning, never a blocker.
    try {
      const r = await fetch("https://api.github.com/repos/DestinyItemManager/d2-additional-info/commits?per_page=1").then((re) => re.ok ? re.json() : null);
      if (Array.isArray(r) && r[0]?.sha) {
        const dernierShaConnu = localStorage.getItem("d2ba.d2ai.dernierSha");
        if (dernierShaConnu && dernierShaConnu !== r[0].sha) setMessageMiseAJourAuto((m) => `${m ? m + " " : ""}⚠️ Les données de SAISONS et SOURCES (d2-additional-info) ont peut-être changé en amont : relancez \`node data/rebuild-source-filters.ts\` côté développement pour mettre à jour \`source-filters.json\`.`);
        localStorage.setItem("d2ba.d2ai.dernierSha", r[0].sha);
      }
    } catch { /* hors ligne : aucune vérification, aucune erreur */ }
  }

  function executerRecherche(valeur: string, modeActuel: ModeRecherche, categorieActuelle: CategorieResultat | "toutes") {
    // FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - le filtre source: est EXTRAIT du texte : les autres mots cherchent normalement, le filtre s'applique ensuite côté client (voir resultatsAffiches). « source: » seul ne compte pas dans les 2 caractères minimum. / EN: the source: filter is extracted from the text; the remaining words search normally.
    const extrait = extraireFiltreSource(valeur);
    setFiltreSource(extrait?.filtre ?? null);
    const texteRecherche = extrait ? (extrait.texteRestant || "  ") : valeur;
    if (!dbFr || texteRecherche.trim().length < 2) {
      setResultats([]);
      setResultatsMasques([]);
      setRechercheEnCours(false);
      return;
    }
    setErreurRecherche(null);
    setRechercheEnCours(true);
    // FR : setTimeout(0) laisse React afficher "recherche en cours..." AVANT
    // de lancer le scan (bloquant, JS étant mono-thread).
    // EN: setTimeout(0) lets React paint "searching..." BEFORE the
    // (blocking) scan starts.
    setTimeout(() => {
      try {
        // FR : ⚠️ CHANGÉ (06/10/2026) - `true` : les résultats des catégories masquées par défaut sont renvoyés AUSSI (marqués `masque`) pour être listés à part au lieu de disparaître en silence.
        const tousResultats = rechercherBilingue(dbFr, dbEn, texteRecherche, modeActuel, undefined, categorieActuelle, true);
        const brut = tousResultats.filter((r) => !r.masque);
        const masques = tousResultats.filter((r) => r.masque);
        // FR : ⚠️ AJOUT (03/08/2026) - dédoublonnage supplémentaire : le
        // Manifest a parfois DEUX hash pour un même perk avec un texte
        // légèrement différent (ex: "Luciole", "Boucherie" trouvés en
        // double) - l'un est le vrai plug socketable (trouvé dans l'index
        // inversé), l'autre une variante d'inspection/collection qui ne
        // l'est pas. On garde celui qui a une correspondance dans l'index
        // inversé plutôt que le premier rencontré.
        // EN: ⚠️ ADDED (2026-08-03) - extra deduping: the Manifest
        // sometimes has TWO hashes for the same perk with slightly
        // different text (e.g. "Firefly", "Rampage" found duplicated) -
        // one is the real socketable plug (found in the reverse index),
        // the other an inspect/collections-only variant that isn't. We
        // keep whichever has a reverse-index match rather than the first
        // one encountered.
        const indexInverse = dbFr ? obtenirIndexInversePerksEnCache(dbFr) : new Map();
        // FR : détermine quels hash exclure (doublons sans slot, moins bons
        // que leur équivalent avec correspondance dans l'index inversé),
        // puis filtre le tableau ORIGINAL pour garder l'ordre de pertinence.
        // EN: determines which hashes to exclude (slot-less duplicates,
        // worse than their reverse-index-matching equivalent), then
        // filters the ORIGINAL array to preserve relevance order.
        const meilleurParNom = new Map<string, (typeof brut)[number]>();
        for (const r of brut) {
          if (r.slot) continue; // jamais dédoublonné par nom
          const cle = r.nom.trim().toLowerCase();
          const existant = meilleurParNom.get(cle);
          if (!existant || (!indexInverse.has(existant.hash) && indexInverse.has(r.hash))) {
            meilleurParNom.set(cle, r);
          }
        }
        const resultatsFinaux = brut.filter((r) => {
          if (r.slot) return true;
          const cle = r.nom.trim().toLowerCase();
          return meilleurParNom.get(cle)?.hash === r.hash;
        });
        setResultats(resultatsFinaux);
        setResultatsMasques(masques);
      } catch (e) {
        setErreurRecherche((e as Error).message);
        setResultats([]);
        setResultatsMasques([]);
      } finally {
        setRechercheEnCours(false);
      }
    }, 0);
  }

  function surChangementTexte(valeur: string) {
    setMotCle(valeur);
    if (minuteurDebounce.current) clearTimeout(minuteurDebounce.current);

    // FR : ⚠️ CORRIGÉ (02/08/2026) : en dessous de 2 caractères (ex: en
    // train d'effacer le champ), on vide immédiatement sans attendre le
    // délai ni lancer de scan - avant ce correctif, chaque pause pendant
    // l'effacement (>350ms) relançait quand même un scan complet coûteux,
    // ce qui donnait une impression de lag.
    // EN: ⚠️ FIXED (2026-08-02): under 2 characters (e.g. while clearing
    // the field), clear immediately without waiting for the delay or
    // running a scan - before this fix, every pause while erasing
    // (>350ms) still re-triggered a costly full scan, which felt laggy.
    if (valeur.trim().length < 2) {
      setResultats([]);
      setRechercheEnCours(false);
      return;
    }

    minuteurDebounce.current = setTimeout(() => executerRecherche(valeur, mode, categorie), DELAI_DEBOUNCE_MS);
  }

  function surChangementMode(nouveauMode: ModeRecherche) {
    setMode(nouveauMode);
    executerRecherche(motCle, nouveauMode, categorie); // changement immédiat, pas de debounce
  }

  function surChangementCategorie(nouvelleCategorie: CategorieResultat | "toutes") {
    setCategorie(nouvelleCategorie);
    executerRecherche(motCle, mode, nouvelleCategorie);
  }

  useEffect(() => {
    return () => {
      if (minuteurDebounce.current) clearTimeout(minuteurDebounce.current);
    };
  }, []);

  // FR : ⚠️ CHANGÉ (13/10/2026, v0.4.3), demande de l'utilisateur : « si le Manifest est périmé, et UNIQUEMENT dans ce cas, téléchargement du nouveau ». La décision est dans `lib/manifest/demarrage.ts` (testée) : une langue EN CACHE mais d'une autre version est retéléchargée automatiquement ; une langue ABSENTE n'est jamais
  // téléchargée seule (le tout premier téléchargement, ~200 Mo, reste un clic) ; hors ligne ou état inconnu : rien. Cette règle remplace celle de la 0.2.2 (« jamais sans un clic »), dont le reste est conservé :
  // FR ET EN à jour : chargement automatique depuis le cache.
  // FR : ⚠️ AJOUT (26/09/2026, v0.2.2) - chargement AUTOMATIQUE au démarrage,
  // à une condition stricte : les Manifests FR ET EN sont déjà en cache et à
  // jour (règle d'origine, complétée ci-dessus pour le cas périmé).
  // Pourquoi exiger les DEUX langues : `chargerManifests` enchaîne FR puis
  // EN ; si seul le FR était en cache, le lancer automatiquement
  // déclencherait le téléchargement de l'anglais sans demander.
  // Le verrou (useRef) évite un double lancement : en développement, le
  // mode strict de React exécute volontairement ce bloc deux fois.
  // EN: ⚠️ ADDED - AUTOMATIC load at startup, only if BOTH FR and EN caches
  // exist and are current; otherwise nothing happens and the manual button
  // stays. The big download is NEVER started without a click. Both languages
  // are required because chargerManifests chains FR then EN. The ref guard
  // prevents a double run (React strict mode runs effects twice in dev).
  const verificationDemarrageFaite = useRef(false);
  useEffect(() => {
    if (verificationDemarrageFaite.current) return;
    verificationDemarrageFaite.current = true;
    (async () => {
      setEtapeChargement("Vérification de la version du Manifest...");
      const decision = await demarrerManifests({
        lireEtat: () => etatCachesManifests(["fr", "en"]),
        charger: (langues) => chargerLangues(langues),
        annoncer: setMessageMiseAJourAuto,
      });
      if (decision.action === "rien") setEtapeChargement(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // FR : ⚠️ CHANGÉ (07/10/2026, v0.3.17) - le bloc « Recherche dans le Manifest » n'est PAS repliable (retour de l'utilisateur sur la 0.3.16) : retour à un bloc fixe (<div> + <h3>) avec la version SANS losange + / − du titre. L'essai de la 0.3.16 (bloc repliable) est abandonné.
    // EN: ⚠️ CHANGED - this block is NOT collapsible (user feedback): back to a fixed block with the no-diamond title.
    <div className="pilier-carte">
      <h3>
        <TitreCategorie categorie="manifest" />
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          {/* FR : ⚠️ AJOUT (04/08/2026) - bouton de débogage réservé au
          mode DÉVELOPPEMENT : import.meta.env.DEV vaut true avec
          `npm run dev` et false dans un build de production, donc les
          invités ne le verront jamais. Demande explicite de
          l'utilisateur. */}
          {import.meta.env.DEV && (
            <button
              onClick={gererTelechargementManifests}
              disabled={telechargementEnCours}
              title="Télécharge les Manifests FR et EN comme fichiers .sqlite (mode développement uniquement)"
              style={{ fontSize: "0.7rem", fontWeight: 400 }}
            >
              {telechargementEnCours && <span className="indicateur-chargement" />}
              {telechargementEnCours ? "Téléchargement..." : "⬇ Manifests FR+EN (dev)"}
            </button>
          )}
          {/* FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - OUTIL DE TEST, mode DÉVELOPPEMENT seulement (jamais dans le logiciel installé) : marque le cache comme périmé ; au prochain démarrage (Ctrl+F5) la mise à jour automatique se déclenche pour de bon, sans attendre une vraie nouvelle version de Bungie. / EN: ⚠️ ADDED - dev-only test tool. */}
          {import.meta.env.DEV && (
            <button
              onClick={async () => {
                const marquees = await simulerManifestPerime(["fr", "en"]);
                setMessageMiseAJourAuto(
                  marquees.length > 0
                    ? `🧪 Cache marqué périmé (${marquees.map((l) => l.toUpperCase()).join(" et ")}) : recharge la page (Ctrl+F5) pour voir la mise à jour automatique.`
                    : "🧪 Aucun Manifest en cache à marquer : charge d'abord le Manifest."
                );
              }}
              title="Mode développement : fait croire à l'appli que son Manifest est périmé, pour essayer la mise à jour automatique au prochain démarrage"
              style={{ fontSize: "0.7rem", fontWeight: 400 }}
            >
              🧪 Manifest périmé (test)
            </button>
          )}
          {dbFr ? (dbEn ? "✅ FR + EN chargés" : "✅ FR chargé") : "◯ non chargé"}
        </span>
      </h3>

      {/* FR : message de suivi du téléchargement, avec l'emplacement réel
      des fichiers - le navigateur n'a pas le droit de choisir le dossier,
      d'où la précision (l'utilisateur les cherchait dans les dossiers du
      jeu). */}
      {messageTelechargement && (
        <p style={{ fontSize: "0.8rem", color: "#b7b3a8", background: "#1c2029", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem 0.75rem" }}>
          {messageTelechargement}
        </p>
      )}

      {/* FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - annonce, réussite ou échec de la mise à jour AUTOMATIQUE d'un Manifest périmé. / EN: ⚠️ ADDED */}
      {messageMiseAJourAuto && (
        <p role="status" data-maj-auto-manifest="" style={{ fontSize: "0.8rem", color: "#b7b3a8", background: "#1c2029", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem 0.75rem" }}>
          {messageMiseAJourAuto}
        </p>
      )}

      {!dbFr && (
        <>
          <p>
            Charge la base d'objets Bungie en français ET en anglais (armes, armures, aspects,
            fragments, perks d'artefact...) — environ 200 Mo au total la première fois. Ensuite, il est
            rechargé automatiquement depuis le cache à chaque démarrage ; si Bungie publie une nouvelle
            version, elle est téléchargée automatiquement (environ 100 Mo par langue). Permet de rechercher
            dans les deux langues ; l'appli reste toujours affichée en français.
          </p>
          <button onClick={chargerManifests} disabled={!!etapeChargement}>
            {etapeChargement && <span className="indicateur-chargement" />}
            {etapeChargement ?? "Charger le Manifest (FR + EN)"}
          </button>
          {erreurChargement && <p style={{ color: "#e08080" }}>⚠️ {erreurChargement}</p>}
        </>
      )}

      {dbFr && (
        <>
          <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.5rem" }}>
            {dbEn
              ? "Recherche bilingue active — tapez en français ou en anglais, l'affichage reste en français."
              : "Manifest anglais non chargé — recherche en français uniquement pour l'instant."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", margin: "0.5rem 0", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="En français OU en anglais : dévoration / devour… ou source:raid, source:last-wish…"
              value={motCle}
              onChange={(e) => surChangementTexte(e.target.value)}
              style={{ flex: 1, minWidth: "220px", padding: "0.4rem 0.6rem" }}
            />
            {/* FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - AUTOCOMPLÉTION de « source: » : quand le dernier mot tapé commence le préfixe, les 13 catégories puis les activités (libellées en français) sont proposées ; un clic complète le filtre dans le champ. Aucun menu permanent : la liste disparaît dès que le préfixe n'est plus en frappe. / EN: autocompletion for "source:". */}
            {(/\bsource:([a-z0-9-]*)$/i.test(motCle.split(/\s+/).pop() ?? "")) && (() => {
              const saisi = (motCle.split(/\s+/).pop() ?? "").replace(/^source:/i, "");
              const propositions = SOURCE_FILTER_SUGGESTIONS.filter((p) => p.valeur.startsWith(saisi.toLowerCase())).slice(0, 18);
              return propositions.length > 0 ? (
                <div data-autocompletion-source="" style={{ position: "absolute", zIndex: 30, background: "#12151c", border: "1px solid #3a3f4b", borderRadius: 8, padding: "0.3rem", maxHeight: "240px", overflowY: "auto", minWidth: "220px" }}>
                  {propositions.map((p) => (
                    <button key={p.valeur} type="button" onClick={() => surChangementTexte(motCle.replace(/\bsource:[a-z0-9-]*$/i, "source:" + p.valeur) + " ")} data-suggestion-source={p.valeur} style={{ display: "block", width: "100%", textAlign: "left", padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "none", border: "none", color: "#e8e6df", cursor: "pointer" }}>
                      <span style={{ color: p.genre === "categorie" ? "#9a8f6a" : "#7aa2f7" }}>{p.genre === "categorie" ? "catégorie" : "activité"}</span> · {p.libelle} <span style={{ color: "#7d7a70" }}>source:{p.valeur}</span>
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
            {/* FR : ⚠️ AJOUT (24/08/2026) - bouton de diagnostic (mode dev),
            pour localiser précisément où un mot-clé matche dans le JSON
            avant d'écrire un filtre anti-dialogue à l'aveugle. */}
            {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.diagnosticCheminsJson && dbFr && (
              <button
                onClick={() => {
                  if (!motCle.trim()) return;
                  setDiagnosticRecherche(diagnostiquerCorrespondances(dbFr, motCle, dbEn));
                }}
                style={{ fontSize: "0.75rem" }}
              >
                🔍 Diagnostic (dev)
              </button>
            )}
            {/* FR : ⚠️ AJOUT (24/08/2026) - diagnostic PONCTUEL pour la future
            vitrine Solo Flawless (pas intégrée). À retirer une fois la
            liste des 11 hashes récupérée et codée en dur. */}
            {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.rechercheTriomphesFlawless && dbFr && (
              <button
                onClick={() => setDiagnosticFlawless(chercherTriomphesFlawless(dbFr))}
                style={{ fontSize: "0.75rem" }}
              >
                🏆 Triomphes Flawless (dev)
              </button>
            )}
            <label style={{ fontSize: "0.85rem" }}>
              <input type="radio" checked={mode === "nom"} onChange={() => surChangementMode("nom")} />{" "}
              Nom uniquement
            </label>
            <label style={{ fontSize: "0.85rem" }}>
              <input
                type="radio"
                checked={mode === "plein_texte"}
                onChange={() => surChangementMode("plein_texte")}
              />{" "}
              Partout (nom, description, perks...)
            </label>
            <select
              value={categorie}
              onChange={(e) => surChangementCategorie(e.target.value as CategorieResultat | "toutes")}
              style={{ fontSize: "0.85rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.4rem" }}
            >
              {(Object.keys(LIBELLES_CATEGORIE) as (CategorieResultat | "toutes")[]).map((c) => (
                <option key={c} value={c}>{LIBELLES_CATEGORIE[c]}</option>
              ))}
            </select>
            {/* FR : ⚠️ AJOUT (04/08/2026) - filtre anti-champion, demande
            explicite de l'utilisateur. Filtrage côté client après
            recherche (le type de champion n'est pas indexé). */}
            <select
              value={filtreChampion}
              onChange={(e) => setFiltreChampion(e.target.value as "tous" | TypeChampion)}
              style={{ fontSize: "0.85rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.4rem" }}
            >
              <option value="tous">Tous anti-champions</option>
              <option value="implacable">Anti-Implacable</option>
              <option value="surcharge">Anti-Surchargé</option>
              <option value="bloqueur">Anti-Bloqueur</option>
            </select>
            {/* FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - filtre sur l'élément de dégâts, demande de l'utilisateur. / EN: damage element filter. */}
            <select
              value={filtreElement}
              onChange={(e) => setFiltreElement(e.target.value as "tous" | ElementFiltre)}
              aria-label="Élément de dégâts"
              style={{ fontSize: "0.85rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.4rem" }}
            >
              <option value="tous">Tous les éléments</option>
              {ELEMENTS_FILTRE.map((el) => (
                <option key={el} value={el}>{el === "cinetique" ? "Cinétique" : LIBELLES_ELEMENT_FR[el]}</option>
              ))}
            </select>
          </div>

          {motCle.length > 0 && motCle.trim().length < 2 && (
            <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>Au moins 2 caractères pour lancer la recherche.</p>
          )}

          {rechercheEnCours && <p style={{ fontSize: "0.85rem" }}>🔎 Recherche en cours...</p>}
          {erreurRecherche && <p style={{ color: "#e08080" }}>⚠️ Erreur de recherche : {erreurRecherche}</p>}

          {/* FR : ⚠️ AJOUT (24/08/2026) - affichage du diagnostic, en texte
          brut sélectionnable (pas une grille stylée) pour être copié tel
          quel dans le chat, comme les autres diagnostics de l'appli. */}
          {/* FR : ⚠️ AJOUT (24/08/2026) - résultat du diagnostic PONCTUEL
          pour la future vitrine Solo Flawless. Composant temporaire. */}
          {diagnosticFlawless && (
            <div style={{ margin: "0.5rem 0", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <strong style={{ fontSize: "0.8rem" }}>
                  🏆 {diagnosticFlawless.length} triomphe(s) trouvé(s) — à copier pour Claude
                </strong>
                <button onClick={() => setDiagnosticFlawless(null)} style={{ fontSize: "0.7rem" }}>
                  fermer
                </button>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem", background: "#0d0f14", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem", maxHeight: "400px", overflow: "auto" }}>
                {diagnosticFlawless.length === 0
                  ? "Aucun triomphe trouvé — table DestinyRecordDefinition absente de ce Manifest ?"
                  : diagnosticFlawless.map((t) => `hash ${t.hash} | "${t.nom}"\n  ${t.description}\n`).join("\n")}
              </pre>
            </div>
          )}

          {diagnosticRecherche && (
            <div style={{ margin: "0.5rem 0", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <strong style={{ fontSize: "0.8rem" }}>
                  🔍 {diagnosticRecherche.length} correspondance(s) — chemin JSON exact
                  {/* FR : ⚠️ AJOUT (21/09/2026) - résumé : combien d'objets
                  distincts la recherche normale affiche réellement.
                  EN: ⚠️ ADDED - summary: how many distinct items the normal
                  search actually shows. */}
                  {(() => {
                    const objets = new Map<string, boolean>();
                    for (const d of diagnosticRecherche) objets.set(`${d.langue}-${d.table}-${d.hash}`, d.affiche);
                    const affiches = [...objets.values()].filter(Boolean).length;
                    return ` · ${affiches} objet(s) affiché(s) dans la recherche sur ${objets.size} trouvé(s)`;
                  })()}
                </strong>
                <button onClick={() => setDiagnosticRecherche(null)} style={{ fontSize: "0.7rem" }}>
                  fermer
                </button>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem", background: "#0d0f14", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem", maxHeight: "400px", overflow: "auto" }}>
                {diagnosticRecherche.length === 0
                  ? "Aucune correspondance."
                  : diagnosticRecherche
                      .map(
                        (d) =>
                          `[${d.langue}] ${d.table} | hash ${d.hash} | "${d.nomAffiche}"\n  ${d.verdict}\n  chemin : ${d.cheminJson}\n  extrait : ${d.extrait}\n`
                      )
                      .join("\n")}
              </pre>
            </div>
          )}

          {!rechercheEnCours && !erreurRecherche && (
            <ul>
              {resultatsAffiches.slice(0, 50).map((r) => (
                <li key={`${r.table}-${r.hash}`} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  {/* FR : ⚠️ CHANGÉ (04/08/2026) - la Recherche garde
                  l'icône de catégorie à DROITE DU NOM (et non sous la
                  miniature comme dans l'Inventaire/Coffre) : demande
                  explicite de l'utilisateur, la liste de résultats étant
                  plus dense et sans perks en dessous. */}
                  {r.icone && (
                    <img src={r.icone} alt="" width={32} height={32} style={{ borderRadius: 4, flexShrink: 0 }} />
                  )}
                  <div>
                    <strong style={{ display: "inline-flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                      <span>{raccourcirNom(r.nom)}</span>
                      {r.slot && ["casque", "gants", "torse", "jambes", "marque"].includes(r.slot) && (
                        <IconeSlotArmure slot={r.slot as SlotArmure} taille={20} />
                      )}
                      {r.slot && ["cinetique", "energie", "lourde"].includes(r.slot) && (
                        <IconeTypeArme typeArme={r.typeArme} slot={r.slot} munition={dbFr ? obtenirTypeMunition(dbFr, r.hash) : undefined} categories={dbFr ? obtenirCategoriesObjet(dbFr, r.hash) : undefined} {...(dbFr ? obtenirSecoursTypeArme(dbFr, r.hash) : {})} taille={35} />
                      )}
                      {r.slot && ["cinetique", "energie", "lourde"].includes(r.slot) && dbFr && (() => {
                        const champion = obtenirAntiChampion(dbFr, r.hash);
                        return champion ? <IconeAntiChampion type={champion} taille={16} /> : null;
                      })()}
                      {r.classe && <IconeClasse classe={r.classe} taille={16} />}
                    </strong>{" "}
                    {r.slot && dbFr && (() => {
                      const source = obtenirSource(dbFr, r.hash);
                      // FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - la catégorie de source (Raid, Donjon, activité précise) rejoint la chaîne brute : « — Raid — Source: "Last Wish" Raid ». Elle vient de d2-additional-info (MIT) ; absente si l'objet n'y figure pas (jamais estimée). / EN: the d2-additional-info source category joins the raw string; never estimated.
                      const categorieSource = (() => { try { return sourceObjetParHash(dbFr, r.hash); } catch { return undefined; } })();
                      return (
                        <span style={{ fontSize: "0.8rem", color: "#7d7a70" }}>
                          {categorieSource && <>— <span data-source-categorie={categorieSource.cle} style={{ color: "#9a8f6a" }}>{categorieSource.libelle}</span>{" "}</>}
                          {source ? <>— {source}</> : <>— Source inconnue</>}
                        </span>
                      );
                    })()}{" "}
                    <span style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
                      (correspondance : {r.champCorrespondant}
                      {r.trouveViaAnglais && " — trouvé via l'anglais"})
                    </span>
                    {/* FR : ⚠️ AJOUT (19/10/2026, chantier « saisons et sources ») - SAISON DE SORTIE de l'objet, en clair : le numéro vient du seasonHash/filigrane (mécanisme existant de lib/manifest/saison.ts), le NOM de la table data/seasons.json (d2-additional-info, MIT) qui sert aussi de SECOURS quand la table des saisons du Manifest est absente. Absente si l'objet n'a ni seasonHash ni filigrane connu — jamais estimée. / EN: release season in clear text; never estimated. */}
                    {dbFr && (() => {
                      const info = obtenirSaisonObjet(dbFr, r.hash);
                      if (!info) return null;
                      const table = info.numero != null ? saisonParNumero(info.numero) : undefined;
                      const nom = info.nom ?? table?.nom;
                      if (!nom && info.numero == null) return null;
                      return <span data-saison-sortie={info.numero ?? ""} style={{ fontSize: "0.75rem", color: "#7d7a70" }}> · Saison de sortie : {nom ?? "?"}{info.numero != null ? ` (saison ${info.numero})` : ""}{table?.debut ? ` — ${table.debut}${table.fin ? ` → ${table.fin}` : " → en cours"}` : ""}</span>;
                    })()}
                    {r.nomEn && r.nomEn !== r.nom && (
                      <span style={{ fontSize: "0.75rem", color: "#7d7a70" }}> · EN: {r.nomEn}</span>
                    )}
                    {r.slot && onAjouterObjet && (
                      <button
                        style={{ marginLeft: "0.5rem", fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}
                        onClick={() =>
                          onAjouterObjet({
                            itemHash: r.hash,
                            nom: r.nom,
                            icone: r.icone,
                            slot: r.slot!,
                            stats: {}, // FR : objet non possédé -> pas de stats d'instance réelles, à 0 par défaut. / EN: not owned -> no real instance stats, defaults to 0.
                            perkHashes: [],
                            isExotic: !!r.isExotic,
                          })
                        }
                      >
                        + Ajouter au build
                      </button>
                    )}
                    {/* FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - « Aller à » : sur les armes et armures (celles qui ont aussi « + Ajouter au build »). / EN: ⚠️ ADDED - "Go to", on weapons and armor. */}
                    {r.slot && onAllerA && (
                      <button
                        style={{ marginLeft: "0.4rem", fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}
                        title="Afficher cet objet dans Mon Inventaire (vos exemplaires)"
                        onClick={() => onAllerA(r.hash, r.nom)}
                      >
                        Aller à
                      </button>
                    )}
                    {r.description && (
                      <div style={{ fontSize: "0.8rem", color: "#b7b3a8" }}>{r.description}</div>
                    )}
                    {/* FR : ⚠️ AJOUT (05/10/2026, mode développement seulement) - ce que l'appli VOIT pour cet objet : hash, type, sous-type, seau, rareté,
                    catégories. Sert à comprendre pourquoi un résultat n'affiche pas l'icône attendue (voir « prioriteDoublon » dans search.ts) : copier cette
                    ligne dans le chat. / EN: ⚠️ ADDED (dev mode only) - what the app SEES for this item. */}
                    {modeDiagnostic && dbFr && r.table === "DestinyInventoryItemDefinition" && (
                      <div style={{ fontSize: "0.66rem", color: "#5a5f6b", fontFamily: "monospace", wordBreak: "break-word" }}>
                        [dev] {obtenirSecoursTypeArme(dbFr, r.hash).infoObjet}
                        {r.factice ? " ; catégorie 3109687656" : ""} ; emplacement {r.slot ?? "—"}
                      </div>
                    )}
                    {/* FR : pour un résultat qui n'est PAS lui-même une arme/armure (perk, aspect, fragment...),
                        affiche où le trouver via l'index inversé. */}
                    {!r.slot && dbFr && (() => {
                      const parents: ObjetParent[] = obtenirIndexInversePerksEnCache(dbFr).get(r.hash) ?? [];
                      if (parents.length === 0) return null;
                      return (
                        <div style={{ fontSize: "0.75rem", color: "#7aa2f7", marginTop: "0.15rem" }}>
                          Trouvé sur : {parents.slice(0, 5).map((p) => p.nom).join(", ")}
                          {parents.length > 5 && ` (+${parents.length - 5} autre(s))`}
                        </div>
                      );
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!rechercheEnCours && resultatsAffiches.length > 50 && (
            <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>
              {resultatsAffiches.length} résultats — seuls les 50 premiers sont affichés, affinez votre recherche.
            </p>
          )}
          {!rechercheEnCours && !erreurRecherche && motCle.trim().length >= 2 && resultatsAffiches.length === 0 && (
            <p>
              Aucun résultat pour « {motCle} »{resultatsMasques.length > 0 ? " parmi les objets affichés par défaut (voir ci-dessous les résultats masqués)" : ""}.
            </p>
          )}
          {/* FR : ⚠️ AJOUT (06/10/2026) - ce que la recherche a MASQUÉ, avec la catégorie : rien ne disparaît en silence. En mode diagnostic, le numéro (hash) de chaque objet s'affiche aussi. */}
          {!rechercheEnCours && !erreurRecherche && (
            <ListeResultatsMasques
              resultats={resultatsMasques}
              libelleCategorie={(c) => (LIBELLES_CATEGORIE[c] ?? c).replace(/\s*\(masqué par défaut\)/, "")}
              afficherHash={modeDiagnostic}
            />
          )}
        </>
      )}
    </div>
  );
}

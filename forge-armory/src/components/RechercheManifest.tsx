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
import { Database } from "sql.js";
import { assurerManifestAJour, manifestsEnCacheAJour, telechargerManifestsEnFichiers } from "../lib/manifest/download";
import { rechercherBilingue, indexerManifest, ModeRecherche, ResultatRechercheBilingue, CategorieResultat, diagnostiquerCorrespondances, DiagnosticCorrespondance, chercherTriomphesFlawless, TriompheTrouve } from "../lib/manifest/search";
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
}

export default function RechercheManifest({ onManifestCharge, onAjouterObjet }: Props) {
  const [dbFr, setDbFr] = useState<Database | null>(null);
  const [dbEn, setDbEn] = useState<Database | null>(null);
  const [etapeChargement, setEtapeChargement] = useState<string | null>(null);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);

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

  // FR : ⚠️ AJOUT (04/08/2026) - filtrage côté client par anti-champion,
  // recalculé seulement quand les résultats ou le filtre changent (pas à
  // chaque rendu), le type de champion n'étant pas indexé.
  const resultatsAffiches = useMemo(() => {
    if (filtreChampion === "tous" || !dbFr) return resultats;
    return resultats.filter((r) => {
      if (!r.slot || !["cinetique", "energie", "lourde"].includes(r.slot)) return false;
      return obtenirAntiChampion(dbFr, r.hash) === filtreChampion;
    });
  }, [resultats, filtreChampion, dbFr]);
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

  async function chargerManifests() {
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

      const resultatEn = await assurerManifestAJour((etape) => setEtapeChargement(etape), "en");
      const baseEn = resultatEn.db;
      setEtapeChargement("Indexation (anglais)...");
      await new Promise((r) => setTimeout(r, 0));
      await indexerManifest(baseEn, "en", resultatEn.version);
      setDbEn(baseEn);

      setEtapeChargement(null);
    } catch (e) {
      setErreurChargement((e as Error).message);
      setEtapeChargement(null);
    }
  }

  function executerRecherche(valeur: string, modeActuel: ModeRecherche, categorieActuelle: CategorieResultat | "toutes") {
    if (!dbFr || valeur.trim().length < 2) {
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
        const tousResultats = rechercherBilingue(dbFr, dbEn, valeur, modeActuel, undefined, categorieActuelle, true);
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

  // FR : ⚠️ AJOUT (26/09/2026, v0.2.2) - chargement AUTOMATIQUE au démarrage,
  // à une condition stricte : les Manifests FR ET EN sont déjà en cache et à
  // jour. Sinon (premier lancement, nouvelle version publiée par Bungie,
  // hors ligne), rien ne se passe et le bouton manuel reste affiché : le
  // gros téléchargement (~200 Mo) n'est JAMAIS lancé sans un clic.
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
      const aJour = await manifestsEnCacheAJour(["fr", "en"]);
      if (aJour) {
        await chargerManifests();
      } else {
        setEtapeChargement(null);
      }
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

      {!dbFr && (
        <>
          <p>
            Charge la base d'objets Bungie en français ET en anglais (armes, armures, aspects,
            fragments, perks d'artefact...) — environ 200 Mo au total la première fois. Ensuite, tant
            que Bungie ne publie pas de nouvelle version, il est rechargé automatiquement depuis
            le cache à chaque démarrage. Permet de rechercher dans les deux langues ; l'appli
            reste toujours affichée en français.
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
              placeholder="En français OU en anglais : dévoration / devour..."
              value={motCle}
              onChange={(e) => surChangementTexte(e.target.value)}
              style={{ flex: 1, minWidth: "220px", padding: "0.4rem 0.6rem" }}
            />
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
                      return source ? (
                        <span style={{ fontSize: "0.8rem", color: "#7d7a70" }}>— {source}</span>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "#7d7a70" }}>— Source inconnue</span>
                      );
                    })()}{" "}
                    <span style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
                      (correspondance : {r.champCorrespondant}
                      {r.trouveViaAnglais && " — trouvé via l'anglais"})
                    </span>
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

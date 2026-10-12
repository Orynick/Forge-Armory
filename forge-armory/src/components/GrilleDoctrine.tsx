import { DIAGNOSTICS_ACTIFS } from "../lib/diagnosticsArchives";
import TitreRepliable from "./TitreRepliable";
import RangeeBoutonsEgaux from "./RangeeBoutonsEgaux";
// FR : Grille visuelle facon jeu pour choisir la sous-classe (element) et
// ses aspects/fragments/super/melee/grenade/competence de classe.
// Rattachee au Pilier 1 (Element & Doctrine) comme convenu - le Pilier 2
// (Verbes d'Element) se contente d'observer ce qui est choisi ici.
//
// EN: Game-style visual grid to pick the subclass (element) and its
// aspects/fragments/super/melee/grenade/class ability. Tied to Pillar 1
// (Element & Doctrine) as agreed - Pillar 2 (Element Verbs) just observes
// what's chosen here.

import { useEffect, useState } from "react";
import { useModeDiagnostic } from "../lib/modeDiagnostic";
import { Database } from "sql.js";
import {
  listerSousClassesPossedees,
  obtenirOptionsSousClasse,
  obtenirNomsCategoriesSocket,
  SousClassePossedee,
  DiagnosticSousClasse,
  GroupeSocket,
  CategorieSocket,
  ORDRE_AFFICHAGE_CATEGORIES,
  obtenirDiagnosticCapaciteFragments,
  obtenirNbSlotsFragments,
  obtenirCapaciteFragmentsAspect,
  trouverIndexSocketPourPlug,
  obtenirDiagnosticTextesDoctrine,
  obtenirDiagnosticIconesDoctrine,   // ⚠️ AJOUT (12/10/2026, v0.4.0) : bug des icônes du Filobscur
} from "../lib/manifest/doctrine";
import { DestinyMembership } from "../lib/bungie/api";
import IconeEmplacementFragment from "./icones/IconeEmplacementFragment";
import { surlignerVerbesConnus } from "./RenduTextePerk";
import { diagnostiquerInsertionPlug } from "../lib/bungie/equiper";
import { SubclassConfig } from "../types/build";
import { LIBELLES_ELEMENT_FR as LIBELLES_ELEMENT } from "../data/libellesElements";
import { LIBELLES_CATEGORIE } from "../data/libellesUI";
import IconeClasse from "./icones/IconeClasse";

// FR : ⚠️ RETIRÉ (24/08/2026) - dictionnaire local supprimé, dupliqué dans 3
// fichiers. Remplacé par l'import centralisé de libellesElements.ts, qui
// corrige au passage "Arc" -> "Cryo-électrique" (le vrai terme français,
// "Arc" étant un anglicisme).

/** FR : ordre d'affichage demandé par l'utilisateur, de gauche à droite. / EN: display order requested by the user, left to right. */
const ORDRE_ELEMENTS: SubclassConfig["element"][] = ["solaire", "arc", "abyssal", "stase", "filobscur", "prismatique"];


// FR : ⚠️ AJOUT (25/08/2026) - constantes reprises telles quelles de
// SelecteurPersonnage.tsx (fichier retiré), suite à la fusion des blocs
// "Personnage" et "Doctrine" demandée par l'utilisateur — les deux
// dépendaient déjà de la même donnée (classeActuelle), sans conflit d'état
// à résoudre : SelecteurPersonnage n'avait aucun état interne, entièrement
// piloté par ses props.
// EN: ⚠️ ADDED - constants moved as-is from the removed SelecteurPersonnage,
// following the user's request to merge the two blocks.
const LIBELLES_CLASSE: Record<Exclude<SubclassConfig["classe"], null>, string> = {
  chasseur: "Chasseur",
  titan: "Titan",
  arcaniste: "Arcaniste",
};
const ORDRE_CLASSES: Exclude<SubclassConfig["classe"], null>[] = ["chasseur", "titan", "arcaniste"];

interface Props {
  membership: DestinyMembership | null;
  db: Database | null;
  classeActuelle: SubclassConfig["classe"];
  subclass: SubclassConfig;
  onChangerSubclass: (maj: Partial<SubclassConfig>) => void;
  /** FR : ⚠️ AJOUT (25/08/2026) - callback de changement de classe, repris de SelecteurPersonnage. / EN: ⚠️ ADDED - class-change callback, moved from SelecteurPersonnage. */
  onChangerClasse: (classe: SubclassConfig["classe"]) => void;
}

/**
 * FR : ⚠️ AJOUT (06/10/2026) - NIVEAUX DE COMPACITÉ des boutons de choix de l'élément (du plus lisible au plus compact). Demande de l'utilisateur : six boutons sur UNE
 * ligne ; le niveau 0 (écart icône-nom 0,3 rem, marges 0,4 rem, texte 0,9 rem, icône 20 px) donnait ~124 px par bouton, soit ~784 px pour six : insuffisant sur son écran.
 * Largeur naturelle estimée (police de type Arial) : niveau 0 ~124 px, niveau 1 ~111 px, niveau 2 ~98 px par bouton ; six boutons tiennent donc sur une ligne dans ~784,
 * ~706 et ~628 px. La rangée retient le MOINS compact qui tient. Si même le niveau 2 ne tient pas : niveau 0 en rangées équilibrées (3 + 3).
 * EN: ⚠️ ADDED - COMPACTNESS LEVELS of the element buttons, from most legible to most compact.
 */
const DENSITES_ELEMENT = [
  { gap: "0.3rem", padding: "0.75rem 0.4rem", fontSize: undefined, icone: 20 },
  { gap: "0.25rem", padding: "0.7rem 0.3rem", fontSize: "0.82rem", icone: 18 },
  { gap: "0.2rem", padding: "0.65rem 0.2rem", fontSize: "0.74rem", icone: 16 },
] as const;

export default function GrilleDoctrine({ membership, db, classeActuelle, subclass, onChangerSubclass, onChangerClasse }: Props) {
  // FR : ⚠️ AJOUT (06/10/2026) - mode diagnostic (pied de page de l'appli) : affiche la ligne « [dev] » de mesure de la ligne d'éléments, aussi dans l'appli installée.
  const modeDiagnostic = useModeDiagnostic();
  const [sousClasses, setSousClasses] = useState<SousClassePossedee[] | null>(null);
  // FR : ⚠️ AJOUT (04/08/2026) - résultat du diagnostic de capacité en
  // fragments (mode développement uniquement).
  const [diagFragments, setDiagFragments] = useState<string | null>(null);
  // FR : ⚠️ AJOUT (26/08/2026) - dump texte de toutes les compétences de
  // doctrine (Super/Mêlée/Grenade/Saut/Classe/Aspects), demande explicite
  // de l'utilisateur pour auditer le texte réel des capacités de base sans
  // capture d'écran. Même pattern que `diagFragments` juste au-dessus.
  // EN: ⚠️ ADDED - text dump of all doctrine abilities, explicit user
  // request to audit base-kit ability text without screenshots. Same
  // pattern as `diagFragments` right above.
  const [diagTextesDoctrine, setDiagTextesDoctrine] = useState<string | null>(null);
  const [diagIconesDoctrine, setDiagIconesDoctrine] = useState<string | null>(null);   // ⚠️ AJOUT (12/10/2026, v0.4.0)
  // FR : ⚠️ AJOUT (04/08/2026) - diagnostic d'insertion de plug, pour
  // savoir si l'appli peut équiper une DOCTRINE complète en jeu.
  const [diagPlug, setDiagPlug] = useState<string | null>(null);
  const [diagPlugEnCours, setDiagPlugEnCours] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticSousClasse[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // FR : ⚠️ CHANGÉ (26/08/2026) - charge désormais AUTOMATIQUEMENT les
  // sous-classes dès qu'une classe est choisie (et que membership/db sont
  // prêts), au lieu d'exiger un clic supplémentaire sur "Charger mes
  // sous-classes". Demande de confort de l'utilisateur : "je sélectionne
  // le personnage que je veux et ça charge automatiquement les 6
  // Doctrines". Le bouton manuel devient un bouton de RÉESSAI, affiché
  // seulement en cas d'erreur (ex: coupure réseau) - voir plus bas.
  //
  // `annule` évite une mise à jour d'état après démontage ou changement de
  // classe pendant que la requête précédente était encore en vol (ex :
  // l'utilisateur clique vite sur 2 classes différentes) - sans ça, la
  // réponse la plus lente pourrait écraser le résultat de la plus récente.
  //
  // EN: ⚠️ CHANGED - now AUTOMATICALLY loads subclasses as soon as a class
  // is picked (and membership/db are ready), instead of requiring an extra
  // click. The manual button becomes a RETRY button, shown only on error.
  // `annule` avoids a state update after unmount or a class change while
  // the previous request was still in flight.
  useEffect(() => {
    setSousClasses(null);
    setErreur(null);
    if (!membership || !db || !classeActuelle) return;

    let annule = false;
    setEnCours(true);
    listerSousClassesPossedees(membership, db, classeActuelle)
      .then((resultat) => {
        if (annule) return;
        setSousClasses(resultat.sousClasses);
        setDiagnostic(resultat.diagnostic);
      })
      .catch((e) => {
        if (annule) return;
        setErreur((e as Error).message);
      })
      .finally(() => {
        if (!annule) setEnCours(false);
      });

    return () => {
      annule = true;
    };
  }, [classeActuelle, membership, db]);

  async function charger() {
    if (!membership || !db || !classeActuelle) return;
    setEnCours(true);
    setErreur(null);
    try {
      const resultat = await listerSousClassesPossedees(membership, db, classeActuelle);
      setSousClasses(resultat.sousClasses);
      setDiagnostic(resultat.diagnostic);
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  const sousClasseActuelle = sousClasses?.find((s) => s.element === subclass.element);
  const groupes: GroupeSocket[] =
    db && sousClasseActuelle
      ? obtenirOptionsSousClasse(db, sousClasseActuelle.itemHash, sousClasseActuelle.hashesEquipes)
      : [];

  function choisirElement(sc: SousClassePossedee) {
    // FR : changer de sous-classe réinitialise les sélections (aspects/fragments d'une autre sous-classe ne sont pas compatibles).
    onChangerSubclass({
      element: sc.element,
      subclassItemHash: sc.itemHash,
      superHash: 0,
      aspectHashes: [],
      fragmentHashes: [],
      meleeHash: 0,
      grenadeHash: 0,
      classeHash: 0,
      sautHash: 0,
    });
  }

  // FR : ⚠️ AJOUT (04/08/2026) - nombre RÉEL d'emplacements de fragments,
  // = somme des capacités des aspects équipés (2 ou 3 chacun), au lieu du
  // "toujours 6" supposé jusqu'ici. Identifié sur données réelles via le
  // diagnostic comparatif (voir doctrine.ts).
  // EN: ⚠️ ADDED (2026-08-04) - REAL number of fragment slots = sum of the
  // equipped aspects' capacities (2 or 3 each), instead of the "always 6"
  // previously assumed.
  function nbSlotsReels(groupe: GroupeSocket): number {
    if (groupe.categorie !== "fragment" || !db) return groupe.nbSlots;
    return obtenirNbSlotsFragments(db, subclass.aspectHashes ?? []);
  }

  // FR : ⚠️ AJOUT (04/08/2026) - tente UNE insertion réelle de plug pour
  // déterminer si l'API l'autorise. On choisit un FRAGMENT déjà équipé en
  // jeu : le réinsérer à sa propre place est l'essai le moins intrusif
  // possible (si ça réussit, rien ne change concrètement pour le joueur).
  // EN: ⚠️ ADDED (2026-08-04) - attempts ONE real plug insertion to find
  // out whether the API allows it. We pick a fragment ALREADY equipped in
  // game: re-inserting it into its own slot is the least intrusive test
  // possible (if it succeeds, nothing actually changes for the player).
  async function lancerDiagnosticPlug() {
    if (!membership || !sousClasseActuelle?.itemInstanceId || !db) return;
    const groupeFragment = groupes.find((g) => g.categorie === "fragment");
    const optionEquipee = groupeFragment?.options.find((o) => o.equipeEnJeu);
    if (!groupeFragment || !optionEquipee) {
      setDiagPlug(
        "Impossible de lancer le test : aucun fragment actuellement équipé en jeu sur cette sous-classe.\n" +
          "Équipez au moins un fragment en jeu, rechargez les sous-classes, puis réessayez."
      );
      return;
    }
    if (
      !window.confirm(
        `Test d'insertion de plug sur votre personnage RÉEL.\n\n` +
          `On va tenter de réinsérer le fragment "${optionEquipee.nom}" à l'emplacement qu'il occupe DÉJÀ : ` +
          `si l'appel réussit, rien ne change concrètement pour vous.\n\nContinuer ?`
      )
    ) return;

    // FR : l'index de socket n'est pas conservé dans GroupeSocket : on le
    // relit depuis le Manifest plutôt que de le supposer (l'API d'insertion
    // l'exige, et un mauvais index ferait échouer le test pour une raison
    // sans rapport avec la question posée).
    const indexSocket = trouverIndexSocketPourPlug(db, sousClasseActuelle.itemHash, optionEquipee.hash);
    if (indexSocket < 0) {
      setDiagPlug(
        `Impossible de localiser l'emplacement du fragment "${optionEquipee.nom}" dans la définition de la sous-classe.\n` +
          "Test annulé : un index erroné donnerait un échec trompeur, sans rapport avec la question posée."
      );
      return;
    }

    setDiagPlugEnCours(true);
    setDiagPlug(null);
    try {
      setDiagPlug(
        await diagnostiquerInsertionPlug(
          membership,
          sousClasseActuelle.characterId ?? "",
          sousClasseActuelle.itemInstanceId,
          indexSocket,
          optionEquipee.hash
        )
      );
    } catch (e) {
      setDiagPlug(`Erreur : ${(e as Error).message}`);
    } finally {
      setDiagPlugEnCours(false);
    }
  }

  function basculerOption(categorie: CategorieSocket, hash: number, nbSlots: number) {
    const cleParCategorie: Record<string, keyof SubclassConfig> = {
      aspect: "aspectHashes",
      fragment: "fragmentHashes",
    };

    if (categorie === "super") return onChangerSubclass({ superHash: hash });
    if (categorie === "melee") return onChangerSubclass({ meleeHash: hash });
    if (categorie === "grenade") return onChangerSubclass({ grenadeHash: hash });
    if (categorie === "classe") return onChangerSubclass({ classeHash: hash });
    if (categorie === "saut") return onChangerSubclass({ sautHash: hash });

    const cle = cleParCategorie[categorie];
    if (!cle) return; // "classe"/"autre" pas encore stockés dans BuildDraft

    const actuel = (subclass[cle] as number[]) ?? [];
    const dejaSelectionne = actuel.includes(hash);
    let nouveau: number[];
    if (dejaSelectionne) {
      nouveau = actuel.filter((h) => h !== hash);
    } else if (actuel.length < nbSlots) {
      nouveau = [...actuel, hash];
    } else {
      return; // déjà au maximum de slots, on ignore le clic
    }
    onChangerSubclass({ [cle]: nouveau } as Partial<SubclassConfig>);
  }

  function estSelectionne(categorie: CategorieSocket, hash: number): boolean {
    if (categorie === "super") return subclass.superHash === hash;
    if (categorie === "melee") return subclass.meleeHash === hash;
    if (categorie === "grenade") return subclass.grenadeHash === hash;
    if (categorie === "classe") return subclass.classeHash === hash;
    if (categorie === "saut") return subclass.sautHash === hash;
    if (categorie === "aspect") return subclass.aspectHashes.includes(hash);
    if (categorie === "fragment") return subclass.fragmentHashes.includes(hash);
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
        <TitreRepliable categorie="doctrine" />
        <span>{sousClasses ? `✅ ${sousClasses.length} sous-classe(s)` : "◯ non chargée"}</span>
        </span>
      </summary>

      {/* FR : ⚠️ AJOUT (25/08/2026) - sélecteur de classe, repris tel quel
      de SelecteurPersonnage.tsx (fichier retiré après fusion, demande de
      l'utilisateur : "ça me semble plus logique" de n'avoir qu'un seul
      bloc). Fonctionnalités préservées à l'identique : les 3 boutons de
      classe avec icônes, la note explicative (la classe ne modifie aucun
      score), et l'avertissement si aucune classe n'est encore choisie.
      EN: ⚠️ ADDED - class picker, moved as-is from the removed
      SelecteurPersonnage.tsx, following the user's request to merge the
      two blocks into one. */}
      <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.5rem" }}>
        La classe ne modifie aucun score (voir NOTICE.md) — elle sert uniquement à filtrer les
        aspects/fragments/super proposés ci-dessous.
      </p>
      {!classeActuelle && (
        <p style={{ fontSize: "0.85rem", color: "#e0c080", margin: "0 0 0.5rem" }}>
          ⚠️ Choisissez une classe ci-dessous pour commencer la conception et l'évaluation d'un build.
        </p>
      )}
      <div className="selecteur-classe" role="radiogroup" aria-label="Classe du personnage" style={{ marginBottom: "0.75rem" }}>
        {ORDRE_CLASSES.map((classe) => {
          const selectionnee = classeActuelle === classe;
          return (
            <button
              key={classe}
              type="button"
              role="radio"
              aria-checked={selectionnee}
              className={`carte-classe${selectionnee ? " selectionnee" : ""}`}
              onClick={() => onChangerClasse(classe)}
            >
              <IconeClasse classe={classe} />
              <span className="coche">✓</span>
              <span>{LIBELLES_CLASSE[classe]}</span>
            </button>
          );
        })}
      </div>

      {/* FR : ⚠️ RETIRÉ (25/08/2026) - l'ancien avertissement référençait
      "le bloc Personnage ci-dessus", devenu incohérent depuis la fusion :
      le sélecteur de classe est maintenant juste au-dessus, dans CE MÊME
      bloc. L'avertissement équivalent est déjà affiché plus haut.
      EN: ⚠️ REMOVED - the old warning referenced "the Personnage block
      above", inconsistent since the merge - an equivalent warning is
      already shown above. */}
      {/* FR : ⚠️ CHANGÉ (04/08/2026) - la légende montre maintenant le
      marqueur EXACTEMENT tel qu'il apparaît sur les options (pastille
      verte + halo), et non un émoji nu : sans l'aura, on ne reconnaissait
      pas le repère qu'on cherche dans la grille. Demande de
      l'utilisateur.
      EN: ⚠️ CHANGED (2026-08-04) - the legend now shows the marker EXACTLY
      as it appears on options (green badge + glow), not a bare emoji:
      without the aura it didn't match the marker one is looking for in
      the grid. User request. */}
      <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <span
          style={{
            fontSize: "0.65rem",
            background: "#7fd88f",
            color: "#0d0f14",
            borderRadius: "50%",
            width: 16,
            height: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 4px rgba(127,216,143,0.8)",
            flexShrink: 0,
          }}
        >
          🎮
        </span>
        = équipé en jeu en ce moment
      </p>

      {/* FR : ⚠️ AJOUT (04/08/2026) - résultat du diagnostic de capacité
      en fragments. Placé en haut du bloc pour être visible sans avoir à
      faire défiler la grille après avoir cliqué sur un 🔍.
      EN: ⚠️ ADDED (2026-08-04) - fragment capacity diagnostic result.
      Placed at the top of the block so it's visible without scrolling
      back up after clicking a 🔍. */}
      {/* FR : ⚠️ AJOUT (04/08/2026) - test d'insertion de plug, mode
      développement. Répond à UNE question précise : l'appli peut-elle
      équiper une doctrine complète en jeu, ou seulement la sous-classe ?
      EN: ⚠️ ADDED (2026-08-04) - plug insertion test, dev mode. Answers ONE
      question: can the app equip a full subclass config in game, or only
      the subclass item? */}
      {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.testInsertionPlug && membership && sousClasseActuelle?.itemInstanceId && (
        <p style={{ margin: "0 0 0.6rem" }}>
          <button onClick={lancerDiagnosticPlug} disabled={diagPlugEnCours} style={{ fontSize: "0.75rem" }}>
            {diagPlugEnCours && <span className="indicateur-chargement" />}
            {diagPlugEnCours ? "Test en cours..." : "🔍 Tester l'insertion de plug (dev)"}
          </button>
        </p>
      )}

      {diagPlug && (
        <details open style={{ fontSize: "0.75rem", color: "#b7b3a8", marginBottom: "0.6rem" }}>
          <summary style={{ cursor: "pointer" }}>
            <span>🔍 Résultat du test d'insertion (à copier à Claude)</span>
            <button onClick={() => setDiagPlug(null)} style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}>
              fermer
            </button>
          </summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem", background: "#0d0f14", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>
            {diagPlug}
          </pre>
        </details>
      )}

      {/* FR : ⚠️ AJOUT (04/08/2026) - légende des icônes utilisées dans ce
      bloc, demande de l'utilisateur. Les tickets étaient employés sans
      explication. */}
      <p style={{ fontSize: "0.72rem", color: "#7d7a70", margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
        <IconeEmplacementFragment etat="occupe" taille={13} /> emplacement occupé ·
        <IconeEmplacementFragment etat="libre" taille={13} /> emplacement libre ·
        <IconeEmplacementFragment etat="surplus" taille={13} /> fragment en trop ·
        sur un aspect : les emplacements qu'il débloque
      </p>

      {/* FR : ⚠️ AJOUT (04/08/2026) - avertissement de SURCAPACITÉ, signalé par
      l'utilisateur : en changeant d'aspect après avoir choisi ses fragments,
      on peut afficher « 5/4 » sans que rien ne le signale. On ne désigne PAS
      quel fragment est en trop : on sait qu'il y en a un, pas lequel. */}
      {db && (() => {
        const groupeFragment = groupes.find((g) => g.categorie === "fragment");
        if (!groupeFragment) return null;
        const capacite = nbSlotsReels(groupeFragment);
        const equipes = (subclass.fragmentHashes ?? []).filter((h) => h && h !== 0).length;
        if (equipes <= capacite) return null;
        return (
          <p style={{ fontSize: "0.8rem", color: "#e08080", margin: "0 0 0.6rem" }}>
            ⚠️ {equipes - capacite} fragment(s) de trop : vos aspects n'offrent que {capacite}{" "}
            emplacement(s). Retirez un fragment, ou choisissez un aspect qui en débloque davantage.
          </p>
        );
      })()}

      {diagFragments && (
        <details open style={{ fontSize: "0.75rem", color: "#b7b3a8", marginBottom: "0.6rem" }}>
          <summary style={{ cursor: "pointer" }}>
            <span>🔍 Diagnostic capacité en fragments (à copier à Claude)</span>
            <button
              onClick={() => setDiagFragments(null)}
              style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}
            >
              fermer
            </button>
          </summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem", background: "#0d0f14", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>
            {diagFragments}
          </pre>
        </details>
      )}

      {(!membership || !db) && (
        <p style={{ fontSize: "0.85rem", color: "#7d7a70" }}>
          Nécessite d'être connecté (bloc Bungie.net) ET d'avoir chargé le Manifest (bloc
          Recherche) avant de pouvoir lister vos sous-classes.
        </p>
      )}

      {/* FR : ⚠️ CHANGÉ (25/08/2026) - formulation corrigée après la fusion
      des blocs : ne référence plus "le bloc Personnage ci-dessus" (qui
      n'existe plus séparément), mais reste un avertissement DISTINCT du
      message générique plus haut - celui-ci est spécifique au chargement
      des sous-classes (conditions membership && db).
      EN: ⚠️ CHANGED - wording fixed after the block merge; stays a
      DISTINCT warning from the generic one above - this one is specific
      to subclass loading. */}
      {membership && db && !classeActuelle && (
        <p style={{ fontSize: "0.85rem", color: "#e0c080" }}>
          ⚠️ Choisissez une classe ci-dessus pour charger vos sous-classes
          automatiquement.
        </p>
      )}

      {membership && db && classeActuelle && enCours && (
        <p style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span className="indicateur-chargement" /> Chargement de vos sous-classes...
        </p>
      )}

      {erreur && (
        <p style={{ color: "#e08080" }}>
          ⚠️ {erreur}{" "}
          <button onClick={charger} disabled={enCours} style={{ marginLeft: "0.5rem" }}>
            Réessayer
          </button>
        </p>
      )}

      {/* FR : ⚠️ CORRIGÉ (03/08/2026) - ce diagnostic s'affichait TOUJOURS
      dès qu'il y avait des objets bruts, même une fois le problème résolu
      (tout identifié) - donnant l'impression d'une erreur persistante
      "en cache". Ne s'affiche plus que s'il reste un vrai problème. */}
      {diagnostic.length > (sousClasses?.length ?? 0) && (
        <details style={{ fontSize: "0.75rem", color: "#e0c080", marginBottom: "0.5rem" }}>
          <summary>
            <span>⚠️ Diagnostic : {diagnostic.length} objet(s) brut(s) trouvé(s) dans le bucket Subclass</span>
            ({sousClasses?.length ?? 0} identifié(s)) — cliquez pour voir le détail, à copier à
            Claude si le nombre de sous-classes semble incomplet
          </summary>
          <ul>
            {diagnostic.map((d) => (
              <li key={d.hash} style={{ marginBottom: "0.5rem" }}>
                <strong>{d.nom}</strong> — hash {d.hash} — élément détecté :{" "}
                {d.elementDetecte ?? "❌ non identifié"}
                <br />
                Sous-classe — defaultDamageType: {d.defaultDamageType ?? "absent"} —
                damageTypeHashes: {d.damageTypeHashesSousClasse?.join(",") || "absent"} —
                plugCategoryIdentifier: {d.plugCategoryIdentifierSousClasse || "absent"} —
                itemCategoryHashes: {d.itemCategoryHashes?.join(",") || "absent"}
                <br />
                Super — defaultDamageType: {d.defaultDamageTypeSuper ?? "absent"} —
                damageTypeHashes: {d.damageTypeHashesSuper?.join(",") || "absent"} —
                plugCategoryIdentifier: {d.plugCategoryIdentifierSuper || "absent"}
              </li>
            ))}
          </ul>
        </details>
      )}

      {sousClasses && sousClasses.length === 0 && (
        <p style={{ fontSize: "0.85rem", color: "#7d7a70" }}>
          Aucune sous-classe trouvée pour cette classe (avez-vous bien un personnage {classeActuelle} ?).
        </p>
      )}

      {sousClasses && sousClasses.length > 0 && (
        <>
          {/* FR : rangée de sélection de l'élément, façon roue de sous-classe en jeu. */}
          {/* FR : ⚠️ CHANGÉ (05/10/2026, v0.3.0) - TOUS LES BOUTONS À LA MÊME TAILLE (demande de l'utilisateur) :
          ils avaient six largeurs différentes selon le libellé. `RangeeBoutonsEgaux` mesure le plus large et le
          donne à tous, avec des rangées équilibrées si la place manque. Le bouton lui-même est inchangé.
          EN: ⚠️ CHANGED - ALL BUTTONS THE SAME SIZE: the row measures the widest and applies it to all. */}
          <RangeeBoutonsEgaux
            style={{ marginBottom: "1rem" }}
            items={[...sousClasses].sort((a, b) => ORDRE_ELEMENTS.indexOf(a.element) - ORDRE_ELEMENTS.indexOf(b.element))}
            cle={(sc) => String(sc.itemHash)}
            // FR : ⚠️ CHANGÉ (06/10/2026) - TROIS niveaux de compacité (voir `DENSITES_ELEMENT`) : l'utilisateur voyait encore les six boutons sur deux lignes ; la
            // rangée mesure chaque niveau et retient le moins compact qui tient sur UNE ligne. `diagnostic` : en développement, affiche la place disponible mesurée.
            // EN: ⚠️ CHANGED - THREE compactness levels; the row picks the least compact one that fits on ONE line; dev-mode diagnostic shows the measured width.
            niveaux={DENSITES_ELEMENT.length}
            diagnostic={modeDiagnostic}
            rendre={(sc, miseEnPage, niveau) => (
              <button
                className={`carte-classe${subclass.element === sc.element ? " selectionnee" : ""}`}
                // FR : ⚠️ CHANGÉ (05/10/2026) - la ligne doit tenir sur UNE ligne (demande de l'utilisateur : « réduis l'espace entre
                // l'icône de l'élément et le nom si besoin »). Écart icône-nom ramené de 0,5 rem à 0,3 rem, marges latérales de 0,5 à
                // 0,4 rem, et la coche ✓ SORTIE de la ligne (en coin, `position: absolute`) : elle réservait ~19 px par bouton même
                // invisible. Mesuré : bouton de 151 px -> 124 px, soit 6 boutons dans ~790 px au lieu de 946 px (place disponible :
                // ~870 px). Une marge latérale ou un écart réduits SEULS ne suffisaient pas (141 px par bouton, soit 886 px).
                // EN: ⚠️ CHANGED - the row must fit on ONE line: smaller icon-name gap and side padding, and the ✓ moved to a corner (out of
                // the flow); button 151 px -> 124 px.
                style={{
                  ...miseEnPage,
                  gap: (DENSITES_ELEMENT[niveau] ?? DENSITES_ELEMENT[0]).gap,
                  padding: (DENSITES_ELEMENT[niveau] ?? DENSITES_ELEMENT[0]).padding,
                  position: "relative",
                  ...((DENSITES_ELEMENT[niveau] ?? DENSITES_ELEMENT[0]).fontSize ? { fontSize: (DENSITES_ELEMENT[niveau] ?? DENSITES_ELEMENT[0]).fontSize } : {}),
                }}
                onClick={() => choisirElement(sc)}
              >
                {sc.icone && (
                  <img src={sc.icone} alt="" width={(DENSITES_ELEMENT[niveau] ?? DENSITES_ELEMENT[0]).icone} height={(DENSITES_ELEMENT[niveau] ?? DENSITES_ELEMENT[0]).icone} style={{ borderRadius: 3 }} />
                )}
                <span className="coche" style={{ position: "absolute", top: 3, right: 5, fontSize: "0.62rem", lineHeight: 1 }}>
                  ✓
                </span>
                <span>{sc.element ? LIBELLES_ELEMENT[sc.element] : "Élément inconnu"}</span>
              </button>
            )}
          />

          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.diagnosticTextesDoctrine && sousClasseActuelle && db && groupes.length > 0 && (
            <div style={{ marginBottom: "0.75rem" }}>
              <button
                onClick={() => setDiagTextesDoctrine(obtenirDiagnosticTextesDoctrine(groupes))}
                style={{ fontSize: "0.75rem" }}
              >
                🔍 Copier les compétences de cette doctrine ({LIBELLES_ELEMENT[subclass.element!]})
              </button>
            </div>
          )}

          {diagTextesDoctrine && (
            <details open style={{ fontSize: "0.75rem", color: "#b7b3a8", marginBottom: "0.75rem" }}>
              <summary style={{ cursor: "pointer" }}>
                <span>
                  🔍 Compétences de doctrine — {LIBELLES_ELEMENT[subclass.element!]} (à copier à Claude)
                </span>
                <button
                  onClick={() => setDiagTextesDoctrine(null)}
                  style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}
                >
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
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {diagTextesDoctrine}
              </pre>
            </details>
          )}

          {/* FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - diagnostic des icônes de doctrine (bug « fond bleu de la Stase sur le Filobscur »), `npm run dev` seulement. À lancer en Stase PUIS en Filobscur et à copier à Claude. / EN: ⚠️ ADDED - doctrine icon diagnostic (dev mode only). */}
          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.diagnosticIconesDoctrine && sousClasseActuelle && db && groupes.length > 0 && (
            <div style={{ marginBottom: "0.75rem" }}>
              <button onClick={() => setDiagIconesDoctrine(obtenirDiagnosticIconesDoctrine(db, subclass.subclassItemHash, subclass.element, groupes))} style={{ fontSize: "0.75rem" }}>
                🔍 Copier le diagnostic des icônes de cette doctrine ({LIBELLES_ELEMENT[subclass.element!]})
              </button>
            </div>
          )}

          {diagIconesDoctrine && (
            <details open style={{ fontSize: "0.75rem", color: "#b7b3a8", marginBottom: "0.75rem" }}>
              <summary style={{ cursor: "pointer" }}>
                <span>🔍 Icônes de doctrine — {LIBELLES_ELEMENT[subclass.element!]} (à copier à Claude)</span>
                <button onClick={() => setDiagIconesDoctrine(null)} style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}>fermer</button>
              </summary>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.68rem", background: "#0d0f14", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>{diagIconesDoctrine}</pre>
            </details>
          )}

          {!sousClasseActuelle && (
            <p style={{ fontSize: "0.85rem", color: "#7d7a70" }}>Choisissez une sous-classe ci-dessus.</p>
          )}

          {sousClasseActuelle && !sousClasseActuelle.equipeEnJeu && (
            <p style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
              Cette sous-classe n'est pas celle actuellement équipée en jeu — le marqueur 🎮
              n'apparaîtra que sur la sous-classe équipée.
            </p>
          )}

          {sousClasseActuelle && db && !groupes.some((g) => g.categorie === "super") && (
            <p style={{ fontSize: "0.75rem", color: "#e0c080" }}>
              ⚠️ Diagnostic : "Super" n'a pas été trouvé pour cette sous-classe. Vraies catégories
              de socket trouvées : {obtenirNomsCategoriesSocket(db, sousClasseActuelle.itemHash).join(" | ") || "aucune"}.
              Copiez cette ligne à Claude si ça arrive.
            </p>
          )}

          {(() => {
            // FR : rendu d'un seul groupe (extrait pour être réutilisé ligne par ligne).
            // EN: renders a single group (extracted to be reused row by row).
            function BlocGroupe({ groupe }: { groupe: GroupeSocket }) {
              return (
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <strong style={{ fontSize: "0.85rem" }}>
                    {groupe.categorie === "autre" ? groupe.nomReel : LIBELLES_CATEGORIE[groupe.categorie]}{" "}
                    <span style={{ color: "#7d7a70", fontWeight: 400 }}>
                      ({groupe.categorie === "aspect" || groupe.categorie === "fragment"
                        ? `${(subclass[groupe.categorie === "aspect" ? "aspectHashes" : "fragmentHashes"] ?? []).length}/${nbSlotsReels(groupe)}`
                        : "1"} sélectionné{nbSlotsReels(groupe) > 1 ? "s" : ""})
                      {/* FR : ⚠️ AJOUT (04/08/2026) - tickets d'emplacement,
                      comme dans le jeu. Blanc = occupé, gris = libre, rouge =
                      un fragment de trop. */}
                      {groupe.categorie === "fragment" && db && (() => {
                        const capacite = nbSlotsReels(groupe);
                        const equipes = (subclass.fragmentHashes ?? []).filter((h) => h && h !== 0).length;
                        const surplus = Math.max(0, equipes - capacite);
                        const occupes = Math.min(equipes, capacite);
                        return (
                          <span style={{ display: "inline-flex", gap: 3, marginLeft: "0.4rem", verticalAlign: "middle" }}>
                            {Array.from({ length: occupes }).map((_, i) => (
                              <IconeEmplacementFragment key={`o${i}`} etat="occupe" />
                            ))}
                            {Array.from({ length: Math.max(0, capacite - equipes) }).map((_, i) => (
                              <IconeEmplacementFragment key={`l${i}`} etat="libre" />
                            ))}
                            {surplus > 0 && <IconeEmplacementFragment etat="surplus" />}
                          </span>
                        );
                      })()}
                    </span>
                  </strong>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                      gap: "0.5rem",
                      marginTop: "0.4rem",
                    }}
                  >
                    {groupe.options.map((opt) => {
                      const selectionne = estSelectionne(groupe.categorie, opt.hash);
                      return (
                        <button
                          key={opt.hash}
                          title={opt.equipeEnJeu ? `${opt.description}\n\n🎮 Équipé en jeu en ce moment` : opt.description}
                          className={`carte-classe${selectionne ? " selectionnee" : ""}`}
                          style={{ flexDirection: "column", padding: "0.5rem 0.3rem", fontSize: "0.75rem", textAlign: "center", position: "relative" }}
                          onClick={() => basculerOption(groupe.categorie, opt.hash, nbSlotsReels(groupe))}
                        >
                          {opt.equipeEnJeu && (
                            <span
                              style={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                fontSize: "0.65rem",
                                background: "#7fd88f",
                                color: "#0d0f14",
                                borderRadius: "50%",
                                width: 16,
                                height: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 0 4px rgba(127,216,143,0.8)",
                              }}
                              title="Équipé en jeu"
                            >
                              🎮
                            </span>
                          )}
                          {opt.icone && <img src={opt.icone} alt="" width={28} height={28} style={{ borderRadius: 4 }} />}
                          <span className="coche">✓</span>
                          <span>{opt.nom}</span>
                          {/* FR : ⚠️ AJOUT (04/08/2026) - nombre d'emplacements
                          de fragment débloqués par CET aspect (demande de
                          l'utilisateur). Permet de choisir ses aspects en
                          connaissance de cause, sans avoir à les équiper pour
                          découvrir la capacité obtenue. */}
                          {groupe.categorie === "aspect" && db && (() => {
                            const capacite = obtenirCapaciteFragmentsAspect(db, opt.hash);
                            if (capacite <= 0) return null;
                            return (
                              <span
                                style={{ display: "inline-flex", gap: 2, marginLeft: 4 }}
                                title={`Débloque ${capacite} emplacement(s) de fragment`}
                              >
                                {Array.from({ length: capacite }).map((_, i) => (
                                  <IconeEmplacementFragment key={i} etat={estSelectionne("aspect", opt.hash) ? "occupe" : "libre"} taille={12} />
                                ))}
                              </span>
                            );
                          })()}
                          {/* FR : ⚠️ AJOUT (04/08/2026) - diagnostic de la
                          capacité en fragments, ASPECTS uniquement, mode
                          développement. stopPropagation() est
                          indispensable : sans lui le clic sélectionnerait
                          aussi l'aspect, ce bouton étant à l'intérieur du
                          bouton de sélection.
                          EN: ⚠️ ADDED (2026-08-04) - fragment capacity
                          diagnostic, ASPECTS only, dev mode.
                          stopPropagation() is essential: without it the
                          click would also select the aspect, this button
                          being inside the selection button. */}
                          {import.meta.env.DEV && DIAGNOSTICS_ACTIFS.capaciteFragmentsAspect && groupe.categorie === "aspect" && db && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDiagFragments(obtenirDiagnosticCapaciteFragments(db, opt.hash));
                              }}
                              style={{
                                position: "absolute",
                                bottom: 2,
                                right: 2,
                                fontSize: "0.6rem",
                                color: "#5a5f6b",
                                cursor: "help",
                                border: "1px solid #3a3f4b",
                                borderRadius: 3,
                                padding: "0 3px",
                              }}
                              title="Diagnostic : capacité en fragments (mode développement)"
                            >
                              🔍
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* FR : ⚠️ AJOUT (24/08/2026) - descriptions des options
                  SÉLECTIONNÉES, avec les verbes surlignés en cyan (demande de
                  l'utilisateur : "si tu vois d'autres Verbes ailleurs,
                  affiche les en cyan aussi").
                  Pourquoi ici et pas dans les cartes : elles font 90px de
                  large, il n'y a pas la place pour du texte. Et l'infobulle
                  native (`title`) ne peut afficher QUE du texte brut - les
                  couleurs y étaient donc invisibles, même limite déjà
                  rencontrée sur l'artefact. Ce panneau reprend l'approche
                  validée là-bas : un récapitulatif sous la grille, avec le
                  vrai rendu.
                  EN: ⚠️ ADDED - descriptions of SELECTED options with verbs
                  highlighted in cyan. Not inside the cards: they're 90px
                  wide, no room for text. And a native tooltip can only show
                  plain text, so colours were invisible there - same limit
                  already hit on the artifact. Mirrors the approach validated
                  there. */}
                  {(() => {
                    const selectionnees = groupe.options.filter(
                      (o) => estSelectionne(groupe.categorie, o.hash) && o.description
                    );
                    if (selectionnees.length === 0) return null;
                    return (
                      <div style={{ marginTop: "0.5rem", paddingTop: "0.4rem", borderTop: "1px solid #2a2e38" }}>
                        {selectionnees.map((opt) => (
                          <p
                            key={opt.hash}
                            style={{ fontSize: "0.7rem", color: "#b7b3a8", margin: "0 0 0.3rem", lineHeight: 1.5 }}
                          >
                            <strong style={{ color: "#e8e6df" }}>{opt.nom}</strong>
                            {" — "}
                            {surlignerVerbesConnus(opt.description)}
                          </p>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              );
            }

            // FR : catégories déjà placées dans une rangée explicite, pour
            // afficher aussi celles qui ne le sont pas (repli, ne cache rien).
            // EN: categories already placed in an explicit row, so we can
            // also show any not covered (fallback, hides nothing).
            const categoriesPlacees = new Set(ORDRE_AFFICHAGE_CATEGORIES.flat());
            const groupesRestants = groupes.filter((g) => !categoriesPlacees.has(g.categorie));

            return (
              <>
                {ORDRE_AFFICHAGE_CATEGORIES.map((ligne, i) => {
                  const groupesLigne = ligne.map((cat) => groupes.find((g) => g.categorie === cat)).filter(Boolean) as GroupeSocket[];
                  if (groupesLigne.length === 0) return null;
                  return (
                    <div key={i} style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                      {groupesLigne.map((groupe) => (
                        <BlocGroupe key={groupe.categorie} groupe={groupe} />
                      ))}
                    </div>
                  );
                })}
                {groupesRestants.map((groupe) => (
                  <div key={groupe.categorie} style={{ marginBottom: "1rem" }}>
                    <BlocGroupe groupe={groupe} />
                  </div>
                ))}
              </>
            );
          })()}
        </>
      )}
    </details>
  );
}

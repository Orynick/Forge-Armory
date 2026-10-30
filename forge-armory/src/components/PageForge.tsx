// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) puis ⚠️ CHANGÉ (13/10/2026, v0.4.3) - page de l'onglet « FORGE » (entre Load-outs et Bibliothèque). Deux vues, calquées sur l'organisation du jeu (spécification du 12/10/2026, §3) : « Collection » (tout ce qui existe dans le jeu : ARMES disponibles depuis la 0.4.3, armures à venir) et « Inventaire » (les objets possédés : sélection des perks, 0.4.4).
// Les deux panneaux restent MONTÉS (le panneau inactif est seulement caché) : changer de vue ne fait perdre ni les filtres ni la recherche. Le Manifest (`db`) est chargé par le bloc « Recherche dans le Manifest » de Build Analyzer.
// EN: ⚠️ ADDED then CHANGED - Forge tab page with two views like the game: Collection (weapons since 0.4.3) and Inventory (weapons, simulation, since 0.4.6). Panels stay mounted so no state is lost.
import { useEffect, useState } from "react";
import { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import CollectionArmes from "./CollectionArmes";
import CollectionArmures from "./CollectionArmures";   // ⚠️ AJOUT (16/10/2026, v0.4.12) : Collection des armures
import InventaireArmes, { CibleForge } from "./InventaireArmes";
import InventaireArmures from "./InventaireArmures";   // ⚠️ AJOUT (15/10/2026, v0.4.12) : Forge des armures   // ⚠️ AJOUT (13/10/2026, v0.4.6)
import type { GearPiece } from "../types/build";
import { BoutonSousMenu } from "./SelecteurVues";   // ⚠️ AJOUT (13/10/2026, v0.4.4) : boutons stylisés des sous-menus
import BoutonAction from "./BoutonAction";   // ⚠️ AJOUT (30/10/2026) : boutons d'action visuels de la charte

const SLOTS_ARMURE = ["casque", "gants", "torse", "jambes", "marque"];
const LIBELLES_ORIGINE: Record<CibleForge["origine"], string> = { analyseur: "Build Analyzer", loadouts: "Load-outs", forge: "la Forge", bibliotheque: "Legendarium" };

interface Props {
  db: Database | null;
  membership?: DestinyMembership | null;
  /** FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - arme envoyée par un bouton « Forge » (fenêtres Détails) : la page passe sur « Inventaire » et l'ouvre. / EN: a weapon sent by a "Forge" button: the page switches to Inventory and opens it. */
  cible?: CibleForge | null;
  /** FR : retour à la vue d'origine (le Build Analyzer reste monté : rien n'est perdu). / EN: back to the originating view. */
  onRetour?: () => void;
  onAjouterAuBuild?: (piece: GearPiece) => void;
  idsDansBuild?: ReadonlySet<string>;
  /** FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - clic du bouton « Lire le Lore » d'une fiche Détails : aiguille vers le Legendarium (remonté à DashboardPage). / EN: ⚠️ ADDED - "Read the Lore" click from a Details sheet: routes to the Legendarium (lifted to DashboardPage). */
  onLireLore?: (itemHash: number, nomObjet: string) => void;
  /** FR : ⚠️ AJOUT (29/10/2026) - doctrine prismatique du build et classe du build : valeurs de départ de l'optimiseur d'armures. / EN: ⚠️ ADDED - build's Prismatic doctrine and class: optimizer defaults. */
  prismatiqueDuBuild?: boolean;
  classeDuBuild?: string | null;
  /** FR : ⚠️ AJOUT (29/10/2026, demande de l'utilisateur : bouton « Optimiseur » aussi dans Mon Build) - vrai quand la page principale demande d'ouvrir directement l'OPTIMISEUR (bouton de Mon Build) ; `onDemandeOptimiseurTraitee` la remet à faux. / EN: ⚠️ ADDED - true when the dashboard asks to open the optimizer directly (My Build button). */
  demandeOptimiseur?: boolean;
  onDemandeOptimiseurTraitee?: () => void;
}

/** FR : ⚠️ AJOUT (30/10/2026, retour de l'utilisateur : barre « pas cohérente ») - hauteur COMMUNE des CINQ boutons stylisés de la barre (Collection, Inventaire, Armes, Armures, Optimisation) : 2,5 rem = 40 px, le minimum de la charte ; à 2,75 rem (44 px) les cinq boutons (185 px de large chacun) ne tenaient pas sur une ligne dans le cadre de la page et « Optimisation » passait à la ligne. / EN: ⚠️ ADDED - common height of the five stylised buttons of the bar: 2.5rem = 40px (charter minimum), so they fit on one row. */
const HAUTEUR_BOUTONS_BARRE = "2.5rem";

export default function PageForge({ db, membership = null, cible = null, onRetour, onAjouterAuBuild, idsDansBuild, onLireLore, prismatiqueDuBuild = false, classeDuBuild = null, demandeOptimiseur = false, onDemandeOptimiseurTraitee }: Props) {
  const [vue, setVue] = useState<"collection" | "inventaire">("collection");
  useEffect(() => { if (cible) setVue("inventaire"); }, [cible?.demande]);   // eslint-disable-line react-hooks/exhaustive-deps
  // FR : ⚠️ AJOUT (15/10/2026, v0.4.12) - la vue Inventaire a deux parties : Armes (par défaut) et Armures. La partie Armures n'est montée qu'à sa première ouverture, puis reste montée (cachée) : son inventaire chargé est gardé quand on revient aux armes. Une arrivée depuis un bouton « Forge » (arme possédée) ramène aux armes. / EN: ⚠️ ADDED - the Inventory view has two parts, Weapons (default) and Armor; Armor mounts on first open and then stays mounted.
  const [objet, setObjet] = useState<"armes" | "armures" | "optimiseur">("armes");   // ⚠️ CHANGÉ (29/10/2026) : « optimiseur » est la TROISIÈME vue de la barre (à droite de Armes et Armures)
  const [armuresMontees, setArmuresMontees] = useState(false);
  // FR : ⚠️ AJOUT (16/10/2026, v0.4.12) puis ⚠️ CORRIGÉ (21/10/2026) - la vue Collection a aussi deux parties, Armes (par défaut) et Armures ; la partie Armures n'est montée qu'à sa première ouverture (sa lecture du Manifest est longue) puis reste montée (cachée). La partie se choisit UNIQUEMENT par les boutons logo de la barre (les anciens attributs `data-objet-collection` des pills ont été retirés avec les pills). / EN: ADDED then FIXED - the Collection view has two parts too; Armor mounts on first open, then stays mounted; the part is chosen only by the logo buttons of the bar.
  const [objetCollection, setObjetCollection] = useState<"armes" | "armures">("armes");
  const [collectionArmuresMontee, setCollectionArmuresMontee] = useState(false);
  // FR : ⚠️ CHANGÉ (16/10/2026, v0.4.12) - une arrivée depuis un bouton « Forge » ouvre la partie qui correspond à la PIÈCE : Armes pour une arme, Armures pour une armure (qui est alors montée tout de suite). Chaque partie ne reçoit que SA cible : une armure ne doit jamais s'ouvrir dans la fenêtre des armes. / EN: ⚠️ CHANGED - arriving from a "Forge" button opens the part matching the piece.
  const cibleArmure = !!cible && SLOTS_ARMURE.includes(cible.piece.slot as string);
  useEffect(() => { if (cible) { setObjet(cibleArmure ? "armures" : "armes"); if (cibleArmure) setArmuresMontees(true); } }, [cible?.demande]);   // eslint-disable-line react-hooks/exhaustive-deps
  // FR : ⚠️ AJOUT (19/10/2026) - la barre unique : la partie de la vue ACTIVE (pour marquer le bouton logo Armes/Armures) et le clic qui bascule la vue si besoin puis la partie. / EN: the active view's part, and a click that sets the view then the part.
  const vueActivePartie = vue === "inventaire" ? objet : objetCollection;
  function choisirPartie(o: "armes" | "armures" | "optimiseur") {
    // FR : ⚠️ AJOUT (29/10/2026) - l'OPTIMISEUR n'existe que sur l'inventaire : on y bascule d'office (même depuis la Collection) ; il réutilise l'inventaire des armures, donc monte la même partie. / EN: ⚠️ ADDED - the optimizer only exists on the inventory: switch to it even from the Collection.
    if (o === "optimiseur") { setVue("inventaire"); setObjet("optimiseur"); setArmuresMontees(true); return; }
    if (vue === "inventaire") { setObjet(o); if (o === "armures") setArmuresMontees(true); }
    else { setObjetCollection(o); if (o === "armures") setCollectionArmuresMontee(true); }
  }
  // FR : ⚠️ AJOUT (29/10/2026) - demande venue de la page principale (bouton « Optimiseur » de Mon Build) : ouvre l'optimiseur puis signale que c'est fait (la demande ne se rejoue pas à la prochaine visite de la Forge). / EN: ⚠️ ADDED - request from My Build.
  useEffect(() => { if (demandeOptimiseur) { choisirPartie("optimiseur"); onDemandeOptimiseurTraitee?.(); } }, [demandeOptimiseur]);   // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="pilier-carte" role="region" aria-label="Forge">
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4), demande de l'utilisateur en cours de test : le TITRE « Forge » (icône et mot) est retiré de la page : inutile ici, l'onglet « Forge » du sélecteur juste au-dessus porte déjà ce nom. La page garde son NOM pour les lecteurs d'écran (région `aria-label="Forge"`) ; la note grise (périmètre de la Forge) reste, alignée à droite. / EN: ⚠️ CHANGED - the "Forge" title (icon and word) is removed from the page (the selector tab above already says it); the region keeps its accessible name; the grey note stays. */}
      <p data-forge-note="" style={{ margin: "0 0 0.6rem", fontSize: "0.8rem", color: "#7d7a70", textAlign: "right" }}>armes et armures : consultation et simulation locale (les armures n'influencent pas encore le score)</p>
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.4) - les deux onglets en texte sont remplacés par les BOUTONS STYLISÉS (demande de l'utilisateur, après la validation de la 0.4.3) : « Collection » (archive de visuels v4) et « Inventaire » (bouton au format du sélecteur, option 2). Même rôle d'onglet et mêmes noms accessibles qu'avant. / EN: ⚠️ CHANGED - the two text tabs become the stylised buttons. */}
      {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - quand on arrive d'un bouton « Forge » : un retour à la vue d'origine ; elle est restée MONTÉE (cachée), donc la fenêtre Détails et tout le reste sont tels qu'on les a laissés. / EN: ⚠️ ADDED - back button when arriving from a "Forge" button; the origin view stayed mounted, so nothing is lost. */}
      {cible && onRetour && (
        <div data-retour-forge="" style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", margin: "0 0 0.6rem", fontSize: "0.8rem", color: "#9a968a" }}>
          {/* FR : ⚠️ CHANGÉ (30/10/2026, archive « boutons-action-final ») - « Retour à Build Analyzer » utilise le VISUEL de la charte (texte fixe « Retour à Build Analyzer ») ; pour les autres origines (Load-outs…), le bouton texte reste. / EN: ⚠️ CHANGED - charter artwork when returning to Build Analyzer. */}
          {LIBELLES_ORIGINE[cible.origine] === "Build Analyzer"
            ? <BoutonAction id="boutons-action.retour" libelle="Retour à Build Analyzer" onClick={onRetour} donnees={{ "retour-bandeau": true }} />
            : <button onClick={onRetour} style={{ fontSize: "0.8rem" }}>← Retour à {LIBELLES_ORIGINE[cible.origine]}</button>}
          <span>Vous venez de la fenêtre « Détails » de « {cible.piece.nom} ».</span>
        </div>
      )}
      {/* FR : ⚠️ CHANGÉ (19/10/2026, retour de test de la 0.4.12 : « mettre les boutons Armes et Armures à droite du bouton Inventaire ; prévoir un séparateur entre les deux paires de boutons ; utiliser les logos présents dans Forge Armory app assets v5 ») - UNE SEULE BARRE : la paire Collection / Inventaire (boutons stylisés, inchangés), un SÉPARATEUR vertical, puis la paire ARMES / ARMURES (logos v5 `icones.armes` : l'épée, `icones.armures` : le bouclier, entourés comme les boutons du sélécteur) qui AIGUILLE la vue ET la partie : Armes → vue active avec objets armes ; Armures → idem armures. L'état reste PAR vue (comportement conservé : rien ne se recharge quand on change). ⚠️ CORRIGÉ (21/10/2026, régression signalée par l'utilisateur : les anciens boutons « pills » des panneaux n'avaient PAS été retirés — chaque partie apparaissait DEUX FOIS) : la barre est le SEUL sélecteur de la partie ; les attributs `data-objet` / `data-objet-collection` des pills ont été RETIRÉS des panneaux, le bouton logo porte `data-objet-logo` (les tests UI cliquent ces boutons). / EN: FIXED - the bar is the ONLY part selector; the pills' attributes are removed from the panels; the logo button carries `data-objet-logo`. */}
      <div role="tablist" aria-label="Vues de la Forge" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem 0.75rem", marginBottom: "0.8rem" }}>
        <BoutonSousMenu identifiant="collection" libelle="Collection" actif={vue === "collection"} hauteur={HAUTEUR_BOUTONS_BARRE} onClick={() => setVue("collection")} />
        <BoutonSousMenu identifiant="inventaire" libelle="Inventaire" actif={vue === "inventaire"} hauteur={HAUTEUR_BOUTONS_BARRE} onClick={() => setVue("inventaire")} />
        <span aria-hidden="true" data-separateur-forge="" style={{ alignSelf: "stretch", width: "1px", background: "#3a3f4b", margin: "0.15rem 0.1rem" }} />
        {/* FR : ⚠️ CHANGÉ (30/10/2026, retour de l'utilisateur : « vérifie les boutons Armes et Armures, c'est pas cohérent ») - les trois boutons de la barre utilisent les BOUTONS STYLISÉS de la charte (`selecteur.armes|armures|optimisation`, repos et sélectionné), comme « Collection » et « Inventaire » : même composant, même hauteur. Avant : petits boutons dessinés à la main (icône ronde + texte) dont seul « Optimiseur » avait une version « sélectionnée ». / EN: ⚠️ CHANGED - the three buttons now use the charter's stylised buttons, like Collection / Inventory. */}
        {(["armes", "armures", "optimiseur"] as const).map((o) => (
          <BoutonSousMenu key={o} objetLogo={o} identifiant={o === "optimiseur" ? "optimisation" : o} actif={vueActivePartie === o} hauteur={HAUTEUR_BOUTONS_BARRE}
            libelle={o === "armes" ? "Armes" : o === "armures" ? "Armures" : "Optimisation : optimiseur de statistiques d'armure"} onClick={() => choisirPartie(o)} />
        ))}
      </div>
      {/* FR : ⚠️ CORRIGÉ (21/10/2026, régression signalée par l'utilisateur sur le zip de main) - la barre unique du 19/10 AVAIT AJOUTÉ les boutons logo Armes/Armures SANS RETIRER les anciens boutons « pills » des panneaux : chaque partie apparaissait DEUX FOIS (les pills, entourés en rouge sur la capture de l'utilisateur). Les pills sont RETIRÉS des deux panneaux ; le choix de la partie se fait UNIQUEMENT par les boutons logo de la barre (`data-objet-logo`, à droite du séparateur). Les tests qui cliquaient les pills (`data-objet` / `data-objet-collection`) cliquent maintenant les boutons logo. / EN: FIXED - the pills are removed from both panels; the part is chosen only by the logo buttons in the bar. */}
      <div role="tabpanel" aria-label="Collection" hidden={vue !== "collection"}>
        <div hidden={objetCollection !== "armes"}>
          <CollectionArmes db={db} membership={membership} onLireLore={onLireLore} />
        </div>
        {collectionArmuresMontee && (
          <div hidden={objetCollection !== "armures"}>
            <CollectionArmures db={db} membership={membership} onLireLore={onLireLore} />
          </div>
        )}
      </div>
      {/* FR : ⚠️ CHANGÉ (13/10/2026, v0.4.6) - la vue Inventaire existe : tes armes possédées, leur roll réel et la simulation locale des perks et du mod (voir `InventaireArmes.tsx`). Le panneau reste MONTÉ (caché quand on est sur « Collection ») : l'inventaire chargé, la recherche et la fenêtre ouverte ne sont pas perdus en changeant de vue. / EN: ⚠️ CHANGED - the Inventory view now exists. */}
      <div role="tabpanel" aria-label="Inventaire" hidden={vue !== "inventaire"}>
        <div hidden={objet !== "armes"}>
          <InventaireArmes db={db} membership={membership} cible={cibleArmure ? null : cible} onAjouterAuBuild={onAjouterAuBuild} idsDansBuild={idsDansBuild} onRetour={onRetour} libelleRetour={cible ? LIBELLES_ORIGINE[cible.origine] : undefined} onLireLore={onLireLore} />
        </div>
        {armuresMontees && (
          <div hidden={objet === "armes"}>
            <InventaireArmures db={db} membership={membership} cible={cibleArmure ? cible : null} onRetour={onRetour} libelleRetour={cible ? LIBELLES_ORIGINE[cible.origine] : undefined} onLireLore={onLireLore} prismatiqueDuBuild={prismatiqueDuBuild} classeDuBuild={classeDuBuild} onAjouterAuBuild={onAjouterAuBuild} idsDansBuild={idsDansBuild} vueOptimiseur={objet === "optimiseur"} />
          </div>
        )}
      </div>
    </div>
  );
}

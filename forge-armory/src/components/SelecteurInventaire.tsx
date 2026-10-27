import IconeSaison from "./IconeSaison";   // ⚠️ AJOUT (14/10/2026, v0.4.11)
import IconeTitreFaconnee from "./IconeTitreFaconnee";   // ⚠️ AJOUT (14/10/2026, v0.4.11)
import VignetteArme from "./VignetteArme";   // ⚠️ AJOUT (14/10/2026, v0.4.10)
import { estFaconnee } from "../lib/forge/faconnee";
// FR : Parcourt l'inventaire + coffre reels du joueur, affiche en 4
// sections repliables (Chasseur / Titan / Arcaniste / Coffre) - chaque
// section personnage separe Equipe / Inventaire, le coffre est classe par
// emplacement (armes cinetique/energie/lourde puis chaque piece
// d'armure). Miniatures des perks affichees, details au survol (nom des
// perks, stats d'armure).
//
// ⚠️ REDESIGN (02/08/2026) - a la demande de l'utilisateur, remplace
// l'ancien affichage plat (une seule liste filtree par classe) par une
// vue en 4 colonnes/sections repliables, pour "savoir ce qu'on
// selectionne avant que ce soit dans Mon build".
//
// EN: Browses the player's real inventory + vault, displays as 4
// collapsible sections (Hunter / Titan / Warlock / Vault) - each
// character section splits Equipped / Inventory, the vault is sorted by
// slot (kinetic/energy/power weapons then each armor slot). Perk
// thumbnails shown, details on hover (perk names, armor stats).
//
// ⚠️ REDESIGN (2026-08-02) - at the user's request, replaces the old flat
// display (a single class-filtered list) with a 4-column/collapsible-
// section view, to "know what you're selecting before it's in Mon build".

import { ordonnerColonnesPourAffichage, libelleColonne } from "../lib/manifest/colonnesArme";   // ⚠️ AJOUT (13/10/2026, v0.4.3) : règles de tri et d'étiquette partagées avec la Forge
import TitreRepliable from "./TitreRepliable";
import BoutonLireLore from "./BoutonLireLore";   // ⚠️ AJOUT (21/10/2026, Legendarium étape 5) : bouton « Lire le Lore » de la popup Détails (Build Analyzer)
import { useState, useMemo, useEffect, useRef } from "react";
import { defilerVers } from "../lib/defilerVers";   // ⚠️ AJOUT (12/10/2026, v0.4.0) : « Aller à »
import { surlignerVerbesConnus, IconeElementArme, IconeMunitionArme } from "./RenduTextePerk";
import { Database } from "sql.js";
import { DestinyMembership } from "../lib/bungie/api";
import { listerObjetsPossedes } from "../lib/bungie/inventaire";
import { obtenirDefinition } from "../lib/manifest/download";
import { normaliser } from "../lib/manifest/search";
import { GearPiece, SlotArme, SlotArmure, StatKey } from "../types/build";
import { LIBELLES_SLOT, LIBELLES_STAT, ORDRE_STATS, ORDRE_EMPLACEMENTS } from "../data/libellesUI";

// FR : ⚠️ AJOUT (04/08/2026) - ordre d'affichage FIXE des statistiques
// d'armure, demandé par l'utilisateur (ligne 1 : Santé/Mêlée/Grenade,
// ligne 2 : Super/Classe/Arme) - Object.entries() ne garantit pas cet
// ordre précis, on l'impose explicitement partout où les stats sont
// affichées.
// EN: ⚠️ ADDED (2026-08-04) - FIXED display order for armor stats,
// requested by the user (line 1: Health/Melee/Grenade, line 2: Super/
// Class/Weapon) - Object.entries() doesn't guarantee this exact order,
// enforced explicitly everywhere stats are shown.
// FR : ⚠️ CHANGÉ (23/10/2026, audit) - `ORDRE_STATS` et `LIBELLES_STAT` locaux remplacés par les constantes centralisées de `libellesUI` (valeurs identiques).
// EN: ⚠️ CHANGED - local `ORDRE_STATS` and `LIBELLES_STAT` replaced by the centralised constants from `libellesUI` (identical values).


import { obtenirCategorieSocketsParIndex, obtenirOptionsToutesColonnes, obtenirDescriptionComplete, obtenirSource, obtenirDiagnosticIconeCategorieObjet, obtenirAntiChampion, obtenirIconesPerksArme, raccourcirNom, obtenirBonusSet, obtenirNomArmatureArme, obtenirAntiChampionArmure, obtenirTypeMunition, obtenirCategoriesObjet } from "../lib/manifest/doctrine";
import IconeAntiChampion, { LIBELLES_CHAMPION, TypeChampion } from "./icones/IconeAntiChampion";
import IconeClasse from "./icones/IconeClasse";
import IconeCoffre from "./icones/IconeCoffre";
import IconeSlotArmure from "./icones/IconeSlotArmure";
import MenuDerouantIcone from "./MenuDerouantIcone";
import BoutonTransfert from "./BoutonTransfert";   // ⚠️ AJOUT (12/10/2026, v0.4.2) : « Transférer vers »
import { deplacerObjet, Lieu } from "../lib/bungie/deplacer";
import { SessionExpiree } from "../lib/bungie/oauth";
import IconeElement from "./icones/IconeElement";   // ⚠️ AJOUT (12/10/2026, v0.4.0) : filtre d'élément
import { obtenirElementFiltre, obtenirIconeElementDoctrine, obtenirIconeCinetique, ELEMENTS_FILTRE, ElementFiltre } from "../lib/manifest/doctrine";
import { LIBELLES_ELEMENT_FR } from "../data/libellesElements";
import IconeTypeArme from "./icones/IconeTypeArme";
import { obtenirSecoursTypeArme } from "../lib/manifest/typeArmeSecours";
// ⚠️ AJOUT (branche draft-mod-armures) : édition des MODS d'armure dans la pop-up Détails (même magasin partagé que la Forge).
<<<<<<< Updated upstream
import { colonnesArmure, regrouperColonnesArmure, statsSimulees } from "../lib/forge/armure";
import type { ColonneArmure, PlugArmure, GroupeColonneArmure } from "../lib/forge/armure";
import { choisir, retirerColonne, reinitialiserArme, nbColonnesSimulees } from "../lib/forge/simulation";
=======
import { colonnesArmure, statsSimulees, statPlusDePiece } from "../lib/forge/armure";
import { reinitialiserArme, nbColonnesSimulees } from "../lib/forge/simulation";
import { appliquerChangements } from "../lib/forge/energieMods";   // ⚠️ AJOUT (25/10/2026)
import SimulationModsArmure from "./SimulationModsArmure";   // ⚠️ AJOUT (25/10/2026)
import StatsArmure from "./StatsArmure";   // ⚠️ AJOUT (27/10/2026)
>>>>>>> Stashed changes
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";

const LIBELLES_PERSONNAGE: Record<"chasseur" | "titan" | "arcaniste", string> = {
  chasseur: "Chasseur",
  titan: "Titan",
  arcaniste: "Arcaniste",
};

// FR : badge générique par élément d'arme (pas les vraies icônes Bungie, protégées).
// FR : ⚠️ RETIRÉ (04/08/2026) - remplacé par la vraie icône d'élément
// officielle du Manifest (elementArmeIcone), demande utilisateur.
// EN: ⚠️ REMOVED (2026-08-04) - replaced by the real official element
// icon from the Manifest (elementArmeIcone), user request.

/**
 * FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - objet visé par le bouton « Aller à » de la recherche dans le Manifest : l'inventaire se filtre sur ses exemplaires (même `itemHash`, personnages et coffre), s'ouvre et s'affiche à l'écran. `demande` change à CHAQUE clic
 * (même objet) pour relancer l'ouverture et le défilement. / EN: ⚠️ ADDED - target of the "Go to" button; `demande` changes on every click.
 */
export interface CibleInventaire {
  hash: number;
  nom: string;
  demande: number;
}

interface Props {
  membership: DestinyMembership | null;
  db: Database | null;
  onAjouterObjet: (piece: GearPiece) => void;
  /** FR : remonte la liste des objets possédés au parent (utilisée par le panneau Loadouts pour repérer les pièces démantelées). Optionnel : le composant reste utilisable sans. / EN: lifts the owned items list to the parent (used by the Loadouts panel to spot dismantled pieces). Optional: the component stays usable without it. */
  onObjetsCharges?: (objets: GearPiece[] | null) => void;
  /** FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - bouton « Forge » de la fenêtre Détails d'une ARME possédée : envoie l'arme à la vue Inventaire de la Forge (absent : pas de bouton). / EN: ⚠️ ADDED - "Forge" button of a weapon's Details window. */
  onOuvrirForge?: (piece: GearPiece) => void;
  /** FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - clic du bouton « Lire le Lore » de la popup Détails : aiguille vers le Legendarium (remonté à DashboardPage). / EN: ADDED - "Read the Lore" click from the Details popup: routes to the Legendarium (lifted to DashboardPage). */
  onLireLore?: (itemHash: number, nomObjet: string) => void;
  /** FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - voir `CibleInventaire`. `onEffacerCible` retire le filtre (bouton du bandeau, ou « Réinitialiser les filtres »). / EN: see CibleInventaire. */
  cible?: CibleInventaire | null;
  onEffacerCible?: () => void;
}

/** FR : construit le texte affiché au survol (perks + stats) - tooltip natif, simple et fiable. / EN: builds the hover text (perks + stats) - native tooltip, simple and reliable. */
export function texteSurvol(piece: GearPiece, db: Database): string {
  const source = obtenirSource(db, piece.itemHash);
  const estArmure = ["casque", "gants", "torse", "jambes", "marque"].includes(piece.slot);
  // FR : ⚠️ CORRIGÉ (04/08/2026, v2) - "Anti-[Type]" déplacé à droite du
  // NOM (demande explicite de l'utilisateur), la source reste seule sur
  // sa propre ligne juste en dessous.
  const champion = !estArmure ? obtenirAntiChampion(db, piece.itemHash) : undefined;
  const suffixeChampion = champion ? ` — Anti-${LIBELLES_CHAMPION[champion]}` : "";
  const ligneNom = `${piece.nom ?? ""}${suffixeChampion}`;
  const ligneSource = source ?? "Source inconnue";
  const lignes: string[] = [ligneNom, ligneSource];
  if (estArmure) {
    const statsOrdonnees = ORDRE_STATS.map((cle) => [cle, piece.stats[cle]] as [StatKey, number]);
    const plusInfobulle = statPlusDePiece(db, piece);   // ⚠️ AJOUT (26/10/2026) : le symbole ⇅ de la statistique « + » de l'ajustement (armure légendaire)
    const ligne1 = statsOrdonnees.slice(0, 3).map(([cle, val]) => `${plusInfobulle === cle ? "⇅ " : ""}${LIBELLES_STAT[cle]}: ${val}`).join(" · ");
    const ligne2 = statsOrdonnees.slice(3, 6).map(([cle, val]) => `${plusInfobulle === cle ? "⇅ " : ""}${LIBELLES_STAT[cle]}: ${val}`).join(" · ");
    if (ligne1 || ligne2) lignes.push(`${ligne1}\n${ligne2}`);

    // FR : ⚠️ AJOUT (04/08/2026) - bonus de Set, sur structure confirmée
    // par diagnostic réel (obtenirBonusSet). On liste TOUS les paliers
    // possibles (pas seulement ceux actifs) : l'infobulle porte sur UNE
    // pièce isolée, elle ne sait pas combien de pièces du set sont
    // équipées ailleurs dans le build - c'est "Mon Build" qui affiche les
    // paliers réellement actifs.
    // EN: ⚠️ ADDED (2026-08-04) - Set bonus, on structure confirmed by
    // real diagnostic. ALL possible tiers are listed (not just active
    // ones): the tooltip is about ONE isolated piece, it doesn't know how
    // many set pieces are equipped elsewhere in the build - "Mon Build"
    // is what shows the tiers actually active.
    const set = obtenirBonusSet(db, piece.itemHash);
    if (set) {
      const detailPaliers = set.perks.map((p) => `${p.requiredSetCount}p: ${p.nom}`).join(" · ");
      lignes.push(`\nSet "${set.nomSet}" — ${detailPaliers}`);
    }
  }

  // FR : ⚠️ AJOUT (03/08/2026) - pour les objets EXOTIQUES, on ajoute la
  // description complète des perks (pas juste leur nom) pour visualiser
  // rapidement l'effet exotique sans quitter l'infobulle. Pour le reste
  // (armes/armure non exotiques), on garde juste les noms des perks pour
  // rester concis.
  // EN: ⚠️ ADDED (2026-08-03) - for EXOTIC items, we add the perks' full
  // description (not just their name) to quickly see the exotic effect
  // without leaving the tooltip. For everything else (non-exotic weapons/
  // armor), we keep just the perk names to stay concise.
  const defsPerks = piece.perkHashes
    .map((h) => obtenirDefinition<{ displayProperties?: { name?: string; description?: string } }>(db, "DestinyInventoryItemDefinition", h))
    .filter(Boolean) as Array<{ displayProperties?: { name?: string; description?: string } }>;

  // FR : ⚠️ CHANGÉ (03/08/2026) - pour les EXOTIQUES, on ne montre plus
  // TOUS les perks (mods, cosmétiques compris) mais seulement le(s) perk(s)
  // intrinsèque(s)/exotique(s) + la pièce maîtresse ("PM"), identifiés via
  // la catégorie de leur socket sur l'objet. Réduit le bruit, comme
  // demandé ("seule cette perk devrait s'afficher").
  // EN: ⚠️ CHANGED (2026-08-03) - for EXOTICS, we no longer show ALL perks
  // (mods, cosmetics included) but only the intrinsic/exotic perk(s) +
  // the masterwork ("PM"), identified via their socket's category on the
  // item. Reduces noise, as requested ("only that perk should show").
  if (piece.isExotic) {
    const categorieParSocket = obtenirCategorieSocketsParIndex(db, piece.itemHash);
    const colonnes = piece.perksParColonne?.length
      ? piece.perksParColonne
      : piece.perkHashes.map((hash, i) => ({ socketIndex: i, hash }));

    for (const { socketIndex, hash } of colonnes) {
      const categorieSocket = categorieParSocket.get(socketIndex) ?? "autre";
      if (categorieSocket === "autre") continue; // perk normal/mod/cosmétique - masqué

      // FR : ⚠️ CORRIGÉ (04/08/2026) - utilise maintenant la fonction
      // centrale (concaténation + retrait des conditions de déblocage +
      // détection ornement), au lieu de lire `displayProperties.description`
      // brut directement - c'était le VRAI bug empêchant l'effet du
      // Catalyseur de s'afficher correctement ici.
      // EN: ⚠️ FIXED (2026-08-04) - now uses the central function
      // (concatenation + unlock-condition removal + ornament detection),
      // instead of reading raw `displayProperties.description` directly -
      // this was the REAL bug preventing the Catalyst's effect from
      // showing correctly here.
      const { description, estOrnement } = obtenirDescriptionComplete(db, hash);
      if (estOrnement) continue;

      const def = obtenirDefinition<{ displayProperties?: { name?: string } }>(db, "DestinyInventoryItemDefinition", hash);
      if (def?.displayProperties?.name && description) {
        lignes.push(`\n${def.displayProperties.name} : ${description}`);
      }
    }
  } else if (!estArmure) {
    // FR : ⚠️ CHANGÉ (04/08/2026) - reformaté dans le même style que les
    // exotiques (nom : description, une ligne par perk) au lieu d'une
    // liste plate de noms séparés par virgules - demande de cohérence/
    // lisibilité. Pas de filtrage par catégorie ici (contrairement aux
    // exotiques) pour ne pas risquer la même régression déjà vécue.
    // EN: ⚠️ CHANGED (2026-08-04) - reformatted in the same style as
    // exotics (name: description, one line per perk) instead of a flat
    // comma-separated name list - consistency/readability request. No
    // category filtering here (unlike exotics) to avoid risking the same
    // regression already experienced.
    // FR : ⚠️ AJOUT (04/08/2026) - filtrage avec des mots-clés PRÉCIS
    // confirmés par l'utilisateur (pas une catégorie large devinée, donc
    // sans le risque de régression déjà vécu) : revêtement d'origine,
    // palier/pièce maîtresse, compte-frags, ornement d'origine, effet
    // visuel festif.
    // EN: ⚠️ ADDED (2026-08-04) - filtering with PRECISE keywords
    // confirmed by the user (not a broad guessed category, so without the
    // regression risk already experienced): origin coating, tier/
    // masterwork, kill tracker, origin ornament, festive visual effect.
    // FR : ⚠️ CORRIGÉ (04/08/2026) - élargi de "revetement d'origine" à
    // simplement "revetement", car les revêtements ont probablement des
    // noms variés (pas tous "d'origine" - même piège déjà rencontré avec
    // "palier"/"souvenir"), signalé par l'utilisateur comme toujours
    // visible malgré le filtre précédent.
    const MOTS_A_MASQUER_LEGENDAIRE = ["revetement", "palier", "compte-frags", "ornement d'origine", "effet visuel festif"];
    for (const def of defsPerks) {
      if (!def.displayProperties?.name || !def.displayProperties?.description) continue;
      const nomNorm = normaliser(def.displayProperties.name);
      const descNorm = normaliser(def.displayProperties.description);
      if (MOTS_A_MASQUER_LEGENDAIRE.some((m) => nomNorm.includes(m) || descNorm.includes(m))) continue;
      if (descNorm.includes("ornement d'arme")) continue; // même signal que pour les exotiques
      lignes.push(`\n${def.displayProperties.name} : ${def.displayProperties.description}`);
    }
  }

  return lignes.join("\n");
}

function LigneObjet({
  piece,
  db,
  afficherStats = false,
  onAjouterObjet,
  onTransferer,
  transfertBloque = false,
  onOuvrirForge,
  onLireLore,
}: {
  piece: GearPiece;
  db: Database;
  /** FR : true pour l'armure du coffre - montre les stats plutôt que les perks (les perks sont faciles à changer, moins pertinentes à afficher ici). / EN: true for vault armor - shows stats rather than perks (perks are easy to change, less relevant to show here). */
  afficherStats?: boolean;
  onAjouterObjet: (p: GearPiece) => void;
  /** FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - « Transférer vers » (absent : pas de bouton) ; `transfertBloque` : un transfert est en cours (un seul à la fois). / EN: ⚠️ ADDED - "Transfer to" (absent: no button); `transfertBloque`: a transfer is running. */
  onTransferer?: (p: GearPiece, cible: Lieu) => Promise<void>;
  transfertBloque?: boolean;
  /** FR : ⚠️ AJOUT (v0.4.9) - bouton « Forge » de la fenêtre Détails (armes possédées seulement). / EN: Forge button of the Details window. */
  onOuvrirForge?: (p: GearPiece) => void;
  /** FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - bouton « Lire le Lore » de la popup Détails (haut de popup, justifié à droite, sous la croix) : aiguille vers le Legendarium. Absent : pas de bouton. / EN: ADDED - "Read the Lore" button of the Details popup (top, right-justified, under the cross): routes to the Legendarium. */
  onLireLore?: (itemHash: number, nomObjet: string) => void;
}) {
  // FR : ⚠️ AJOUT (03/08/2026) - panneau "Détails" dépliable, pour l'instant
  // limité aux armes (demande explicite de l'utilisateur) : montre le roll
  // actuel de CET exemplaire précis + TOUTES les options possibles par
  // colonne (utile pour comparer avec d'autres exemplaires du coffre).
  // EN: ⚠️ ADDED (2026-08-03) - collapsible "Details" panel, for now
  // limited to weapons (explicit user request): shows THIS specific
  // instance's current roll + ALL possible options per column (useful to
  // compare with other copies in the vault).
  const [detailsOuverts, setDetailsOuverts] = useState(false);
  const estArme = (["cinetique", "energie", "lourde"] as (SlotArme | SlotArmure)[]).includes(piece.slot);
  // ⚠️ AJOUT (branche draft-mod-armures) - SIMULATION DES MODS d'une armure possédée, DANS la pop-up Détails (Mon Inventaire + Coffre) : mêmes colonnes, mêmes niveaux et même magasin partagé que la Forge des armures (`InventaireArmures`) — un clic ici met le score à jour en temps réel. RIEN n'est modifié en jeu.
  const simulations = useSimulations();
  const instance = piece.itemInstanceId;
  const choixArmure = instance ? simulations.armures?.[instance] : undefined;
  const colonnesMods = useMemo(
    () => (!estArme && detailsOuverts && instance ? colonnesArmure(db, piece) : []),
    [estArme, detailsOuverts, db, piece, instance]
  );
  const statsMods = useMemo(
    () => (!estArme && detailsOuverts && instance ? statsSimulees(db, piece, choixArmure) : null),
    [estArme, detailsOuverts, db, piece, instance, choixArmure]
  );
<<<<<<< Updated upstream
  function choisirMod(col: ColonneArmure, plug: PlugArmure) {
    if (!instance || !col.modifiable) return;
    if (plug.hash === col.equipe.hash || choixArmure?.[col.socketIndex]?.choisi === plug.hash) mettreAJourSimulations((s) => retirerColonne(s, instance, col.socketIndex, "armures"));
    else mettreAJourSimulations((s) => choisir(s, instance, col.socketIndex, { choisi: plug.hash, effectif: plug.hash }, "armures"));
  }
  function choisirModGroupe(groupe: GroupeColonneArmure, plug: PlugArmure) {
    const cible = groupe.colonnes.find((c) => choixArmure?.[c.socketIndex]?.choisi !== plug.hash) ?? groupe.colonnes[0];
    choisirMod(cible, plug);
  }
  // FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - ARME FAÇONNÉE : l'icône du jeu en bas à gauche de la vignette (Mon Inventaire et Coffre), comme dans la Forge. Calculé une fois par ligne (`useMemo`). / EN: crafted weapon icon on the thumbnail.
=======
// FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - ARME FAÇONNÉE : l'icône du jeu en bas à gauche de la vignette (Mon Inventaire et Coffre), comme dans la Forge. Calculé une fois par ligne (`useMemo`). / EN: crafted weapon icon on the thumbnail.
>>>>>>> Stashed changes
  const faconnee = useMemo(() => estArme && estFaconnee(db, piece.perkHashes), [estArme, db, piece.perkHashes]);

  // FR : ⚠️ CHANGÉ (04/08/2026) - 5 colonnes au lieu de 4 (une colonne
  // manquait, signalé par l'utilisateur) et la particularité d'origine
  // séparée, pour l'afficher tout à droite.
  const perksArme = afficherStats ? { colonnes: [], origine: undefined } : obtenirIconesPerksArme(db, piece.perkHashes, 5);
  const iconesPerks = perksArme.colonnes;

  // FR : ⚠️ CHANGÉ (27/10/2026, « Je veux aussi le ⇅ sur les armures portées. Partout sauf la Collection. D'ailleurs, affiche ⇅ devant le nom de la stat ») - les deux lignes de trois statistiques sont affichées pour TOUTES les armures de la liste (Coffre, portées par un personnage, équipées) et non plus seulement celles du Coffre ; le composant partagé `StatsArmure` marque, EN VERT et DEVANT son nom, la statistique « + » de l'ajustement d'une armure légendaire. / EN: ⚠️ CHANGED - stat lines for ALL armor rows (vault, carried, equipped), with the green ⇅ before the "+" stat name.
  const montrerStatsArmure = afficherStats || ["casque", "gants", "torse", "jambes", "marque"].includes(piece.slot);

  const colonnesDetails = detailsOuverts ? obtenirOptionsToutesColonnes(db, piece.itemHash, piece.perkHashes, { toutesSources: faconnee, equipesParColonne: piece.perksParColonne }) : [];

  return (
    <li style={{ marginBottom: "0.4rem" }}>
      <div title={texteSurvol(piece, db)} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", minWidth: 0 }}>
        {/* FR : ⚠️ CHANGÉ (04/08/2026) - colonne de gauche regroupant la
        miniature ET l'icône de catégorie (arme ou armure), proposition B
        validée par l'utilisateur via aperçu. Avantage : les noms
        s'alignent tous à la même hauteur d'une ligne à l'autre, quelle
        que soit la forme de l'icône de catégorie (certaines sont très
        allongées, elles écartaient le nom des perks quand elles étaient
        sur la même ligne que le texte). L'anti-champion, lui, RESTE à
        droite du nom : il se lit avec le texte, pas avec l'image.
        EN: ⚠️ CHANGED (2026-08-04) - left column grouping the thumbnail
        AND the category icon (weapon or armor), option B validated by the
        user via preview. Benefit: names all line up at the same height
        from row to row, whatever the category icon's shape (some are very
        elongated and pushed the name away from the perks when placed on
        the text line). The anti-champion icon STAYS to the right of the
        name: it reads with the text, not with the image. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", width: 35, flexShrink: 0 }}>
          <VignetteArme icone={piece.icone} taille={31} faconnee={faconnee} db={db} itemHash={piece.itemHash} />
          {!estArme && <IconeSlotArmure slot={piece.slot as SlotArmure} taille={20} />}
          {estArme && <IconeTypeArme typeArme={piece.typeArme} slot={piece.slot} munition={db ? obtenirTypeMunition(db, piece.itemHash) : undefined} categories={db ? obtenirCategoriesObjet(db, piece.itemHash) : undefined} {...(db ? obtenirSecoursTypeArme(db, piece.itemHash) : {})} taille={35} />}
        </div>
        {/* FR : nom + perks (ou stats) + boutons, tous empilés verticalement,
        alignés à droite de la miniature - boutons désormais SOUS les
        perks/stats plutôt qu'à côté du nom (retour esthétique). */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {piece.elementArmeIcone && (
              <img
                src={piece.elementArmeIcone}
                alt=""
                title={piece.elementArme}
                width={16}
                height={16}
                style={{ borderRadius: 3 }}
              />
            )}
            {/* FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - type de munitions, à droite de l'élément. / EN: ammo type, right of the element. */}
            {estArme && <IconeMunitionArme db={db} itemHash={piece.itemHash} taille={16} />}
            <span>
              {raccourcirNom(piece.nom)} {piece.isExotic && <span style={{ color: "#d4af37" }}>★</span>}
              {!estArme && db && (() => {
                const set = obtenirBonusSet(db, piece.itemHash);
                if (!set) return null;
                // FR : ⚠️ CHANGÉ (04/08/2026) - l'infobulle donne maintenant
                // la DESCRIPTION complète de chaque bonus, pas seulement son
                // nom : savoir qu'un palier s'appelle "Écho de vengeance" ne
                // dit pas ce qu'il fait. Demande de l'utilisateur.
                const detail = set.perks
                  .map((p) => `${p.requiredSetCount} pièces — ${p.nom}${p.description ? `\n   ${p.description}` : ""}`)
                  .join("\n\n");
                return (
                  <span title={`Set "${set.nomSet}"\n\n${detail}`} style={{ fontSize: "0.75rem", cursor: "help" }}>
                    🛡️
                  </span>
                );
              })()}
            </span>
          </span>
          {/* FR : ⚠️ CHANGÉ (04/08/2026) - l'icône anti-champion passe SUR
          la ligne des perks, à leur droite, séparée par un tiret quadratin,
          et à la MÊME TAILLE qu'eux (16px). Demande de l'utilisateur.
          Effet de bord bienvenu : elle n'allonge plus la ligne du nom, ce
          qui réglait aussi le retour à la ligne sur les noms longs
          ("Lancer de couteau de Randy").
          EN: ⚠️ CHANGED (2026-08-04) - the anti-champion icon moves ONTO
          the perks row, to their right, separated by an em dash, and at
          the SAME SIZE as them (16px). User request. Welcome side effect:
          it no longer lengthens the name row, which also fixed the
          wrapping on long names. */}
          {(iconesPerks.length > 0 || (estArme && db && obtenirAntiChampion(db, piece.itemHash)) || (!estArme && db && piece.isExotic && obtenirAntiChampionArmure(db, piece.itemHash))) && (
            <span style={{ display: "flex", gap: "2px", alignItems: "center" }}>
              {iconesPerks.map((src, i) => (
                <img key={i} src={src} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
              ))}
              {/* FR : ⚠️ AJOUT (04/08/2026) - particularité d'origine, affichée
              TOUT À DROITE des perks de colonnes (demande de l'utilisateur).
              Légèrement détachée par une marge pour marquer qu'elle est d'une
              autre nature : c'est un attribut lié à la SOURCE de l'arme, pas
              un perk de colonne. */}
              {perksArme.origine && (
                <img
                  src={perksArme.origine.icone}
                  alt={perksArme.origine.nom}
                  title={`${perksArme.origine.nom} (particularité d'origine)${
                    perksArme.origine.description ? `\n\n${surlignerVerbesConnus(perksArme.origine.description)}` : ""
                  }`}
                  width={16}
                  height={16}
                  style={{ borderRadius: 3, marginLeft: "3px" }}
                />
              )}
              {/* FR : ⚠️ AJOUT (04/08/2026) - anti-champion des ARMURES
              exotiques, à côté des perks comme pour les armes (demande de
              l'utilisateur). L'infobulle nomme le perk responsable : la
              détection reposant sur du texte, autant montrer sur quoi elle
              s'appuie. */}
              {!estArme && db && piece.isExotic && (() => {
                const resultat = obtenirAntiChampionArmure(db, piece.itemHash);
                if (!resultat) return null;
                return (
                  <>
                    {iconesPerks.length > 0 && (
                      <span style={{ color: "#3a3f4b", margin: "0 2px", fontSize: "0.8rem" }}>—</span>
                    )}
                    <span title={`Anti-${LIBELLES_CHAMPION[resultat.type]} — via le perk exotique « ${resultat.source} »`}>
                      <IconeAntiChampion type={resultat.type} taille={16} />
                    </span>
                  </>
                );
              })()}
              {estArme && db && (() => {
                const champion = obtenirAntiChampion(db, piece.itemHash);
                // FR : ⚠️ AJOUT (04/08/2026) - depuis Anti-Champion 2.0,
                // TOUTE arme a une capacité liée à son armature. Une arme
                // sans anti-champion détecté signale donc une armature
                // absente de la table (ex: "Tir dispersé"), pas une arme
                // sans capacité. On affiche un repère discret avec le nom
                // brut de l'armature, pour pouvoir compléter la table -
                // au lieu d'un vide silencieux impossible à diagnostiquer.
                // EN: ⚠️ ADDED (2026-08-04) - since Anti-Champion 2.0 EVERY
                // weapon has a frame-based capability. A weapon with none
                // detected therefore signals a frame missing from the
                // table, not a weapon without a capability. We show a
                // discreet marker with the raw frame name instead of a
                // silent gap that can't be diagnosed.
                if (!champion) {
                  const armature = obtenirNomArmatureArme(db, piece.itemHash);
                  if (!armature) return null;
                  return (
                    <span
                      title={`Armature "${armature}" pas encore reconnue — anti-champion inconnu.\nSignalez ce nom pour compléter la table.`}
                      style={{ fontSize: "0.6rem", color: "#5a5f6b", border: "1px solid #3a3f4b", borderRadius: 3, padding: "0 3px", cursor: "help" }}
                    >
                      ?
                    </span>
                  );
                }
                return (
                  <>
                    {iconesPerks.length > 0 && (
                      <span style={{ color: "#3a3f4b", margin: "0 2px", fontSize: "0.8rem" }}>—</span>
                    )}
                    <IconeAntiChampion type={champion} taille={16} />
                  </>
                );
              })()}
            </span>
          )}
          {montrerStatsArmure && <StatsArmure db={db} piece={piece} />}
          {/* FR : ⚠️ CHANGÉ (04/08/2026) - "Détails" n'existe que pour les
          armes ; sur les armures son absence décalait "+ Ajouter" vers la
          gauche, cassant l'alignement des colonnes d'une ligne à l'autre.
          On réserve désormais sa place par un espace de même largeur.
          EN: ⚠️ CHANGED (2026-08-04) - "Détails" only exists for weapons;
          on armor its absence shifted "+ Ajouter" leftwards, breaking the
          column alignment from row to row. Its slot is now reserved by a
          spacer of the same width. */}
          <span style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {/* FR : ⚠️ CHANGÉ (04/08/2026) - les ARMURES ont maintenant
            elles aussi un vrai bouton "Détails" (il remplace l'ancien
            bouton de diagnostic "🔍 Set", réservé au mode développement).
            La popup y affiche les bonus de set complets. Du coup plus
            besoin de réserver un espace vide pour l'alignement : les deux
            types d'objets ont le même bouton.
            EN: ⚠️ CHANGED (2026-08-04) - ARMOR now also has a real
            "Détails" button (replacing the old dev-only "🔍 Set"
            diagnostic button). Its popup shows the full set bonuses. No
            more need to reserve empty space for alignment: both item
            types now have the same button. */}
            <button
              style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", flexShrink: 0 }}
              onClick={() => setDetailsOuverts((v) => !v)}
            >
              Détails
            </button>
            <button style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", flexShrink: 0 }} onClick={() => onAjouterObjet(piece)}>
              + Ajouter
            </button>
            {onTransferer && <BoutonTransfert piece={piece} bloque={transfertBloque} onTransferer={onTransferer} />}   {/* ⚠️ AJOUT (12/10/2026, v0.4.2) */}
          </span>
        </div>
      </div>


      {/* FR : ⚠️ CHANGÉ (03/08/2026) - popup/modal plutôt que panneau
      dépliable dans le flux (choix de l'utilisateur après aperçu comparatif) :
      fond assombri, centré, fermeture par ✕ ou clic en dehors. */}
      {detailsOuverts && (
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
                  {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - icône des armes façonnées À GAUCHE DU NOM (demande de l'utilisateur). / EN: crafted icon at the left of the name. */}
                  {faconnee && <IconeTitreFaconnee />}
                  <span>{piece.nom}</span>
                  {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - ICÔNE DE SAISON directement à droite du nom (demande de l'utilisateur). / EN: season icon right of the name. */}
                  <IconeSaison db={db} itemHash={piece.itemHash} />
                  <IconeTypeArme typeArme={piece.typeArme} slot={piece.slot} munition={db ? obtenirTypeMunition(db, piece.itemHash) : undefined} categories={db ? obtenirCategoriesObjet(db, piece.itemHash) : undefined} {...(db ? obtenirSecoursTypeArme(db, piece.itemHash) : {})} taille={35} />
                  <IconeElementArme db={db} itemHash={piece.itemHash} taille={16} />
                  {/* FR : ⚠️ AJOUT (30/09/2026, v0.2.9) - type de munitions, à droite de l'élément. / EN: ammo type, right of the element. */}
                  <IconeMunitionArme db={db} itemHash={piece.itemHash} taille={16} />
                  {(() => {
                    const champion = obtenirAntiChampion(db, piece.itemHash);
                    return champion ? <IconeAntiChampion type={champion} taille={16} /> : null;
                  })()}
                </strong>
                <div style={{ fontSize: "0.8rem", color: "#7d7a70" }}>
                  {obtenirSource(db, piece.itemHash) ?? "Source inconnue"}
                </div>
                {/* FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - BOUTON « FORGE » (spécification du 12/10/2026, §1 : « dans la vue de détails, un bouton supplémentaire permet de rejoindre la Forge ») : envoie cette arme possédée à la vue Inventaire de la Forge, qui s'ouvre dessus ; un bouton « Retour » ramène ici, avec cette fenêtre telle qu'on l'a laissée. Armes possédées seulement. / EN: ⚠️ ADDED - Forge button in the Details window (owned weapons only). */}
                {/* FR : ⚠️ CHANGÉ (16/10/2026, v0.4.12) - le bouton « Forge » existe aussi pour les ARMURES possédées (spécification du 12/10/2026, §1 : « le bouton Détails des armes et armures… un bouton supplémentaire permet de rejoindre la Forge ») : il ouvre la partie Armures de la Forge sur cette armure ; « Retour » ramène ici. / EN: ⚠️ CHANGED - the Forge button now also exists for owned armor pieces. */}
                {onOuvrirForge && piece.itemInstanceId && (
                  <button data-ouvrir-forge="" onClick={() => onOuvrirForge(piece)} style={{ fontSize: "0.75rem", marginTop: "0.4rem", padding: "0.15rem 0.5rem" }}>
                    {estArme ? "🔨 Forge : choisir les perks de cette arme" : "🔨 Forge : choisir les mods de cette armure"}
                  </button>
                )}
                                {/* FR : ⚠️ RETIRÉ (23/10/2026, audit) - diagnostic anti-champion archivé supprimé. / EN: ⚠️ REMOVED - archived anti-champion diagnostic deleted. */}
              </div>
              <button
                onClick={() => setDetailsOuverts(false)}
                style={{ background: "none", border: "none", color: "#7d7a70", fontSize: "1rem", cursor: "pointer", padding: 0 }}
              >
                ✕
              </button>
            </div>
            {/* FR : ⚠️ AJOUT (21/10/2026, Legendarium étape 5) - « Lire le Lore » : EN HAUT DE POPUP, JUSTIFIÉ À DROITE, SOUS LA CROIX (spécification §6), affiché UNIQUEMENT si l'objet a un Lore. / EN: ADDED - "Read the Lore": top of popup, right-justified, under the close cross (spec §6), shown ONLY if the item has a lore. */}
            {onLireLore && <BoutonLireLore db={db} itemHash={piece.itemHash} nomObjet={piece.nom ?? ""} onLireLore={onLireLore} />}
            {/* FR : ⚠️ AJOUT (04/08/2026) - bonus de Set complets dans la
            popup "Détails" des armures (avec leurs descriptions), demande
            de l'utilisateur. Placé EN HAUT : c'est l'information la plus
            distinctive d'une pièce d'armure, avant la liste des mods.
            EN: ⚠️ ADDED (2026-08-04) - full Set bonuses in armor's
            "Détails" popup (with their descriptions), user request.
            Placed AT THE TOP: it's the most distinctive information about
            an armor piece, ahead of the mods list. */}
                        {/* FR : ⚠️ RETIRÉ (23/10/2026, audit) - diagnostic des stats d'armure archivé supprimé. / EN: ⚠️ REMOVED - archived armor-stats diagnostic deleted. */}
            {!estArme && (() => {
              const set = obtenirBonusSet(db, piece.itemHash);
              if (!set) return (
                <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.6rem" }}>
                  Cette armure ne fait partie d'aucun set.
                </p>
              );
              return (
                <div style={{ marginBottom: "0.8rem" }}>
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
            popup « Détails », demande de l'utilisateur. Elle apparaissait
            comme une simple icône dans la liste, sans qu'on puisse lire son
            effet. Mise en évidence en HAUT : c'est un attribut lié à la
            SOURCE de l'arme, distinct des perks de colonnes.
            EN: ⚠️ ADDED - origin trait in the "Détails" popup. It only showed
            as an icon with no way to read its effect. Highlighted at the TOP:
            it's tied to the weapon's SOURCE, distinct from column perks. */}
            {estArme && perksArme.origine && (
              <div style={{ marginBottom: "0.8rem" }}>
                <strong style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <img src={perksArme.origine.icone} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
                  {perksArme.origine.nom}
                  <span style={{ color: "#7d7a70", fontWeight: 400, fontSize: "0.72rem" }}>
                    (particularité d'origine)
                  </span>
                </strong>
                {perksArme.origine.description && (
                  <div style={{ fontSize: "0.72rem", color: "#b7b3a8", marginTop: "0.2rem" }}>
                    {perksArme.origine.description}
                  </div>
                )}
              </div>
            )}
<<<<<<< Updated upstream
            {/* ⚠️ AJOUT (branche draft-mod-armures) - SIMULATION DES MODS dans la pop-up Détails d'une ARMURE possédée (Mon Inventaire + Coffre) : mêmes colonnes, niveaux et magasin partagé que la Forge des armures ; le score et Mon Build réagissent en temps réel. RIEN n'est modifié en jeu. Les emplacements fixes (archétype, amélioration, ensemble, exotique) ne se changent pas. */}
            {!estArme && instance && colonnesMods.length > 0 && statsMods && (
              <div data-mods-armure-simulation="" style={{ marginBottom: "0.8rem" }}>
                <strong style={{ fontSize: "0.8rem" }}>🔨 Simuler les mods</strong>
                <p style={{ fontSize: "0.72rem", color: "#9a968a", margin: "0.2rem 0 0.4rem" }}>
                  Cliquez un mod pour le simuler (un seul par emplacement) ; cliquez le mod équipé, ou de nouveau le mod simulé, pour revenir à l'équipement réel. <strong>Rien n'est modifié en jeu</strong> : la simulation alimentera le score et Mon Build en temps réel.
                </p>
                <div data-stats-armure="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(7.5rem, 1fr))", gap: "0.3rem 0.7rem", margin: "0 0 0.5rem", fontSize: "0.78rem" }}>
                  {ORDRE_STATS.map((cle) => {
                    const reel = statsMods.reelles[cle] ?? 0, sim = statsMods.simulees[cle] ?? 0, d = statsMods.delta[cle] ?? 0;
                    return (
                      <span key={cle} data-stat={cle} data-reelle={reel} data-simulee={sim} data-delta={d} style={{ display: "flex", justifyContent: "space-between", gap: "0.4rem", borderBottom: "1px solid #232733", paddingBottom: "0.15rem" }}>
                        <span style={{ color: "#b7b3a8" }}>{LIBELLES_STAT[cle]}</span>
                        <span>{d !== 0 ? <><span style={{ color: "#7d7a70" }}>{reel} → </span><strong style={{ color: d > 0 ? "#7fd88f" : "#e0a080" }}>{sim}</strong> <span style={{ color: d > 0 ? "#7fd88f" : "#e0a080", fontSize: "0.7rem" }}>({d > 0 ? `+${d}` : d < 0 ? `−${Math.abs(d)}` : "±0"})</span></> : <strong>{reel}</strong>}</span>
                      </span>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                  <span data-nb-simulees={nbColonnesSimulees(simulations, instance, "armures")} style={{ fontSize: "0.78rem", color: "#e8c547" }}>{nbColonnesSimulees(simulations, instance, "armures") > 0 ? `${nbColonnesSimulees(simulations, instance, "armures")} mod${nbColonnesSimulees(simulations, instance, "armures") > 1 ? "s" : ""} simulé${nbColonnesSimulees(simulations, instance, "armures") > 1 ? "s" : ""}` : "aucune simulation"}</span>
                  <button disabled={nbColonnesSimulees(simulations, instance, "armures") === 0} onClick={() => mettreAJourSimulations((s) => reinitialiserArme(s, instance, "armures"))} style={{ fontSize: "0.78rem" }}>↺ Revenir à l'équipement réel</button>
                </div>
                {regrouperColonnesArmure(colonnesMods).map((groupe) => {
                  const premier = groupe.colonnes[0];
                  const nbSimGroupe = groupe.colonnes.filter((c) => choixArmure?.[c.socketIndex]?.choisi !== undefined && choixArmure?.[c.socketIndex]?.choisi !== c.equipe.hash).length;
                  return (
                    <div key={premier.socketIndex} data-colonne={premier.socketIndex} data-groupe-prises={groupe.colonnes.length > 1 ? groupe.colonnes.map((c) => c.socketIndex).join(",") : ""} data-modifiable={groupe.modifiable ? "1" : ""} style={{ marginBottom: "0.6rem" }}>
                      <strong style={{ fontSize: "0.75rem", color: "#7d7a70" }}>{groupe.categorie || `Emplacement ${premier.socketIndex}`}{groupe.colonnes.length > 1 && <span data-multiplicite={groupe.colonnes.length}> × {groupe.colonnes.length}</span>}{nbSimGroupe > 0 && <span style={{ color: "#e8c547" }}> · {nbSimGroupe} simulé{nbSimGroupe > 1 ? "s" : ""}</span>}{!groupe.modifiable && <span style={{ fontWeight: 400, color: "#6b6860" }}> · {groupe.fixe ? "fixe" : groupe.cosmetique ? "cosmétique" : "un seul plug disponible"}</span>}</strong>
                      {groupe.theorique && groupe.modifiable && <p data-plugs-theoriques="" style={{ fontSize: "0.7rem", color: "#9a8a6a", margin: "0.2rem 0" }}>Plugs possibles lus sur le modèle du jeu (votre exemplaire n'en liste aucun) : la simulation est locale, rien ne prouve que cette pièce les accepte.</p>}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
                        {premier.options.map((plug) => {
                          const reel = plug.hash === premier.equipe.hash;
                          const simule = groupe.colonnes.some((c) => choixArmure?.[c.socketIndex]?.choisi === plug.hash);
                          const niveau = simule ? "simule" : reel ? "reel" : plug.theorique ? "theorique" : "disponible";
                          return (
                            <button key={plug.hash} type="button" disabled={!groupe.modifiable} onClick={() => (groupe.colonnes.length > 1 ? choisirModGroupe(groupe, plug) : choisirMod(premier, plug))} title={plug.description || plug.nom} data-plug={plug.hash} data-niveau={niveau} data-reel={reel ? "1" : ""} data-theorique={plug.theorique ? "1" : ""}
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: 999, cursor: groupe.modifiable ? "pointer" : "default", color: simule ? "#f4e3a0" : reel ? "#e8e6df" : groupe.modifiable ? "#b9bcc6" : "#8a8a96", background: simule ? "#2a2412" : "#0d0f14", border: `1px solid ${simule ? "#e8c547" : reel ? "#7aa2f7" : "#4a4f5c"}`, fontStyle: plug.theorique && !reel ? "italic" : "normal" }}>
                              {reel && <span style={{ color: "#7aa2f7" }}>✓</span>}
                              {plug.icone && <img src={plug.icone} alt="" width={16} height={16} style={{ borderRadius: 3 }} />}
                              <span>{plug.nom}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
=======
{/* FR : ⚠️ CHANGÉ (25/10/2026, maquette validée par l'utilisateur) - la SIMULATION DES MODS d'une armure possédée est le composant `SimulationModsArmure` (statistiques réelles → simulées, JAUGE D'ÉNERGIE, résumé compact + « Modifier », blocs statistique / ajustement / cumulables) ; toute la logique est dans `lib/forge/energieMods.ts`. L'ancienne liste de pastilles par groupe d'emplacements est remplacée. EN: ⚠️ CHANGED - the armor-mod simulation is now the `SimulationModsArmure` component (validated mockup). */}
            {!estArme && instance && colonnesMods.length > 0 && statsMods && (
              <SimulationModsArmure
                db={db}
                piece={piece}
                colonnes={colonnesMods}
                choix={choixArmure}
                stats={statsMods}
                nbSimulees={nbColonnesSimulees(simulations, instance, "armures")}
                onChanger={(changements) => mettreAJourSimulations((s) => appliquerChangements(s, instance, colonnesMods, changements))}
                onReinitialiser={() => mettreAJourSimulations((s) => reinitialiserArme(s, instance, "armures"))}
              />
>>>>>>> Stashed changes
            )}
            {estArme && colonnesDetails.length === 0 && (
              <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: 0 }}>Aucune option trouvée pour cette arme.</p>
            )}
            {/* FR : mods génériques connus (ex: Crosse de contrepoids) relégués en bas, renommés - jamais masqués. */}
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

function trierEtGrouper(pieces: GearPiece[]): Array<{ slot: SlotArme | SlotArmure; items: GearPiece[] }> {
  return ORDRE_EMPLACEMENTS.map((slot) => ({ slot, items: pieces.filter((p) => p.slot === slot) })).filter((g) => g.items.length > 0);
}

/**
 * FR : ⚠️ AJOUT (03/08/2026) - même chose que trierEtGrouper, mais GARDE
 * les emplacements vides (au lieu de les masquer), pour que les lignes de
 * slot (Casque, Gants...) tombent à la même hauteur entre les 3 colonnes
 * Chasseur/Titan/Arcaniste, même si l'un a moins d'objets qu'un autre.
 * EN: ⚠️ ADDED (2026-08-03) - same as trierEtGrouper, but KEEPS empty
 * slots (instead of hiding them), so slot rows (Helmet, Gauntlets...) line
 * up at the same height across the 3 Hunter/Titan/Warlock columns, even if
 * one has fewer items than another.
 */
function trierEtGrouperAvecVides(pieces: GearPiece[]): Array<{ slot: SlotArme | SlotArmure; items: GearPiece[] }> {
  return ORDRE_EMPLACEMENTS.map((slot) => ({ slot, items: pieces.filter((p) => p.slot === slot) }));
}

export default function SelecteurInventaire({ membership, db, onAjouterObjet, onObjetsCharges, cible, onEffacerCible, onOuvrirForge, onLireLore }: Props) {
  const [objets, setObjets] = useState<GearPiece[] | null>(null);
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - « Aller à » : à chaque demande, on ouvre le bloc s'il est replié puis on l'amène à l'écran. Petit délai pour que la page ait fini de se réorganiser (sections ouvertes) avant le défilement. / EN: open the block and scroll to it.
  const refBloc = useRef<HTMLDetailsElement>(null);
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - « TRANSFÉRER VERS » : un seul transfert à la fois (`transfertEnCours` = identifiant d'instance de l'objet), et un bandeau qui dit ce qui s'est passé (la ligne change de liste quand l'objet bouge : elle ne peut pas porter le message). Après l'opération, la liste affichée est mise à jour
  // d'après le lieu RÉEL rendu par `deplacerObjet` (succès, ou échec à la seconde étape : l'objet est alors au Coffre) ; sans lieu rendu (échec à la première étape), rien ne change à l'écran. Un objet équipé n'est jamais déplacé (règle de l'utilisateur). / EN: ⚠️ ADDED - "Transfer to": one at a time, a result banner, list updated from the REAL final location.
  const [transfertEnCours, setTransfertEnCours] = useState<string | null>(null);
  const [messageTransfert, setMessageTransfert] = useState<{ ok: boolean; texte: string } | null>(null);
  async function transferer(piece: GearPiece, cible: Lieu): Promise<void> {
    if (!membership || !piece.itemInstanceId || transfertEnCours) return;
    const id = piece.itemInstanceId;
    setTransfertEnCours(id);
    setMessageTransfert(null);
    try {
      const r = await deplacerObjet(membership, piece, cible);
      if (r.lieuFinal) setObjets((prec) => (prec ? prec.map((o) => (o.itemInstanceId === id ? { ...o, origine: r.lieuFinal, equipe: false } : o)) : prec));
      setMessageTransfert({ ok: r.ok, texte: r.ok ? `✅ « ${piece.nom} » — ${r.message}` : `⚠️ « ${piece.nom} » — ${r.message}` });
    } catch (e) {
      setMessageTransfert({ ok: false, texte: e instanceof SessionExpiree ? "⚠️ Votre session Bungie a expiré : reconnectez-vous, puis réessayez. Rien n'a été déplacé." : `⚠️ « ${piece.nom} » — erreur inattendue : ${(e as Error).message}` });
    } finally {
      setTransfertEnCours(null);
    }
  }
  useEffect(() => {
    if (!cible) return;
    if (refBloc.current) refBloc.current.open = true;
    const minuteur = setTimeout(() => defilerVers(refBloc.current), 60);
    return () => clearTimeout(minuteur);
  }, [cible?.demande]);   // eslint-disable-line react-hooks/exhaustive-deps

  // FR : remonte la liste au parent à chaque changement. Effet séparé
  // plutôt qu'un appel dans le handler de chargement : on couvre ainsi
  // tous les chemins qui modifient `objets` (chargement initial,
  // rechargement, réinitialisation) sans risquer d'en oublier un.
  // EN: lifts the list to the parent on every change. A dedicated effect
  // rather than a call inside the load handler: this covers every path
  // that changes `objets` without risking missing one.
  useEffect(() => {
    onObjetsCharges?.(objets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objets]);
  const [statsNonResolues, setStatsNonResolues] = useState<string[]>([]);
  const [diagnosticStats, setDiagnosticStats] = useState<{
    armureSansInstanceId: number;
    armureSansDonneesStatsBrutes: number;
    armureAvecStatsBrutesTotal: number;
  } | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // FR : ⚠️ AJOUT (03/08/2026) - filtres + recherche limités au Coffre
  // (demande utilisateur : "800 objets dedans, c'est beaucoup"). La
  // recherche couvre le nom ET les perks (noms + descriptions), pour
  // trouver une arme qui déclenche un effet ("Secousse") sans connaître
  // le nom exact de la perk responsable.
  // EN: ⚠️ ADDED (2026-08-03) - filters + search limited to the Vault
  // (user request: "800 items in there, that's a lot"). Search covers
  // the name AND perks (names + descriptions), to find a weapon that
  // triggers an effect ("Jolt") without knowing the exact responsible
  // perk's name.
  const [rechercheCoffre, setRechercheCoffre] = useState("");
  const [filtreRarete, setFiltreRarete] = useState("toutes");
  const [filtreTypeArme, setFiltreTypeArme] = useState("tous");
  const [filtreSlotArmure, setFiltreSlotArmure] = useState<"tous" | SlotArmure>("tous");
  const [filtreChampionCoffre, setFiltreChampionCoffre] = useState<"tous" | TypeChampion>("tous");
  // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - filtres sur l'ÉLÉMENT DE DÉGÂTS (Coffre et Mon Inventaire), demande de l'utilisateur : Cinétique, Solaire, Cryo-électrique, Abyssal, Stase, Filobscur. Ils portent sur les armes : une armure n'a pas d'élément et n'apparaît sous aucun. / EN: ⚠️ ADDED - damage element filters (Vault and Inventory), weapons only.
  const [filtreElementCoffre, setFiltreElementCoffre] = useState<"tous" | ElementFiltre>("tous");
  // FR : ⚠️ AJOUT (04/08/2026) - filtre "doublons", demande de
  // l'utilisateur. Un doublon = plusieurs exemplaires du MÊME objet
  // (même itemHash) dans l'ensemble considéré. Utile pour faire le ménage
  // dans un coffre plein. Calculé séparément pour le Coffre et pour
  // l'Inventaire, chacun sur son propre ensemble.
  const [doublonsSeulementCoffre, setDoublonsSeulementCoffre] = useState(false);
  const [doublonsSeulementInv, setDoublonsSeulementInv] = useState(false);
  const [rechercheInventaire, setRechercheInventaire] = useState("");
  const [filtreRareteInv, setFiltreRareteInv] = useState("toutes");
  const [filtreTypeArmeInv, setFiltreTypeArmeInv] = useState("tous");
  const [filtreSlotArmureInv, setFiltreSlotArmureInv] = useState<"tous" | SlotArmure>("tous");
  const [filtreChampionInv, setFiltreChampionInv] = useState<"tous" | TypeChampion>("tous");
  const [filtreElementInv, setFiltreElementInv] = useState<"tous" | ElementFiltre>("tous");

  async function charger() {
    if (!membership || !db) return;
    setEnCours(true);
    setErreur(null);
    try {
      const resultat = await listerObjetsPossedes(membership, db);
      setObjets(resultat.pieces);
      setStatsNonResolues(resultat.statsNonResolues);
      setDiagnosticStats(resultat.diagnosticStats);
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  const indisponible = !membership || !db;

  const parPersonnage = (classe: "chasseur" | "titan" | "arcaniste") => {
    const items = (objets ?? []).filter((o) => o.origine === classe).filter(correspondAuxFiltresInventaire);
    return {
      equipe: trierEtGrouperAvecVides(items.filter((o) => o.equipe)),
      inventaire: trierEtGrouperAvecVides(items.filter((o) => !o.equipe)),
    };
  };

  const coffreBrut = (objets ?? []).filter((o) => o.origine === "coffre");

  // FR : listes disponibles pour les menus de filtre, construites à partir
  // de ce qui est RÉELLEMENT présent (pas une liste figée devinée).
  // EN: available lists for the filter menus, built from what's ACTUALLY
  // present (not a guessed fixed list).
  const raretesDisponibles = Array.from(new Set(coffreBrut.map((o) => o.rarete).filter(Boolean))).sort() as string[];
  const typesArmeDisponibles = Array.from(new Set(coffreBrut.map((o) => o.typeArme).filter(Boolean))).sort() as string[];
  // FR : ordre fixe demandé, basé sur l'emplacement réel (pas le texte
  // brut du Manifest, qui inclut parfois le nom de classe comme
  // "Brassard d'Arcaniste" - inutile ici, les menus repliables par
  // personnage jouent déjà ce rôle).
  const ORDRE_EMPLACEMENTS_ARMURE: SlotArmure[] = ["casque", "gants", "torse", "jambes", "marque"];
  const LIBELLES_SLOT_FILTRE: Record<SlotArmure, string> = {
    casque: "Casques",
    gants: "Gants",
    torse: "Torses",
    jambes: "Jambes",
    marque: "Objets de classe",
  };

  // FR : texte de recherche par pièce (nom + perks + descriptions),
  // calculé une seule fois via useMemo quand l'inventaire du coffre
  // change (pas à chaque frappe dans le champ de recherche) - coût
  // modéré mais ponctuel, comme pour l'index de recherche.
  // EN: search text per piece (name + perks + descriptions), computed
  // once via useMemo when the vault inventory changes (not on every
  // keystroke in the search field) - moderate but one-time cost, like the
  // search index.
  const texteRechercheParPiece = useMemo(() => {
    const carte = new Map<string, string>();
    if (!db) return carte;
    for (const piece of coffreBrut) {
      const cle = piece.itemInstanceId ?? `${piece.itemHash}`;
      if (carte.has(cle)) continue;
      const morceaux = [piece.nom ?? ""];
      for (const hash of piece.perkHashes) {
        const def = obtenirDefinition<{ displayProperties?: { name?: string; description?: string } }>(
          db,
          "DestinyInventoryItemDefinition",
          hash
        );
        if (def?.displayProperties?.name) morceaux.push(def.displayProperties.name);
        if (def?.displayProperties?.description) morceaux.push(def.displayProperties.description);
      }
      carte.set(cle, morceaux.join(" ").toLowerCase());
    }
    return carte;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objets, db]);

  // FR : ⚠️ AJOUT (04/08/2026) - même principe que ci-dessus, mais pour
  // "Mon Inventaire" (les 3 personnages, équipé + inventaire), demande
  // explicite de l'utilisateur ("champ de recherche similaire à celui du
  // Coffre mais limité à l'inventaire").
  // EN: ⚠️ ADDED (2026-08-04) - same principle as above, but for "My
  // Inventory" (the 3 characters, equipped + inventory), explicit user
  // request ("search field similar to the Vault's but limited to the
  // inventory").
  // FR : ⚠️ CHANGÉ (24/10/2026, tests post-audit, point 5.8) - le courrier est
  // EXCLU de « Mon Inventaire » (il a sa propre section) : un objet qui y
  // attend n'est ni sur un personnage, ni transférable.
  // EN: CHANGED - the postmaster is EXCLUDED from "My Inventory" (it has its
  // own section): an item waiting there is neither on a character nor
  // transferable.
  const inventaireBrut = (objets ?? []).filter((o) => o.origine !== "coffre" && o.origine !== "courrier");
  // FR : ⚠️ AJOUT (24/10/2026, tests post-audit, point 5.8) - les objets en
  // attente au courrier (postmaster), affichés dans leur propre section.
  // EN: ADDED - items waiting in the postmaster, shown in their own section.
  const courrierBrut = (objets ?? []).filter((o) => o.origine === "courrier").filter(correspondAuxFiltresInventaire);
  const texteRechercheParPieceInventaire = useMemo(() => {
    const carte = new Map<string, string>();
    if (!db) return carte;
    for (const piece of inventaireBrut) {
      const cle = piece.itemInstanceId ?? `${piece.itemHash}`;
      if (carte.has(cle)) continue;
      const morceaux = [piece.nom ?? ""];
      for (const hash of piece.perkHashes) {
        const def = obtenirDefinition<{ displayProperties?: { name?: string; description?: string } }>(
          db,
          "DestinyInventoryItemDefinition",
          hash
        );
        if (def?.displayProperties?.name) morceaux.push(def.displayProperties.name);
        if (def?.displayProperties?.description) morceaux.push(def.displayProperties.description);
      }
      carte.set(cle, morceaux.join(" ").toLowerCase());
    }
    return carte;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objets, db]);

  // FR : ⚠️ AJOUT (04/08/2026) - ensembles des itemHash présents en
  // plusieurs exemplaires. Recalculés seulement quand la liste d'objets
  // change (pas à chaque frappe de recherche), le comptage étant fait sur
  // l'ensemble NON filtré : un doublon reste un doublon même si un
  // exemplaire est masqué par un autre filtre actif.
  const hashesEnDoublonCoffre = useMemo(() => {
    const compte = new Map<number, number>();
    for (const o of coffreBrut) compte.set(o.itemHash, (compte.get(o.itemHash) ?? 0) + 1);
    return new Set([...compte.entries()].filter(([, n]) => n > 1).map(([h]) => h));
  }, [coffreBrut]);

  const hashesEnDoublonInv = useMemo(() => {
    const compte = new Map<number, number>();
    for (const o of inventaireBrut) compte.set(o.itemHash, (compte.get(o.itemHash) ?? 0) + 1);
    return new Set([...compte.entries()].filter(([, n]) => n > 1).map(([h]) => h));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objets]);

  // FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - options du menu « élément de dégâts » (partagées par le Coffre et Mon Inventaire) : icône officielle de Bungie quand le Manifest est chargé, sinon le dessin de l'appli ; le Cinétique n'a pas de dessin de secours.
  // EN: ⚠️ ADDED - options of the damage element menu, official icon when the Manifest is loaded.
  function optionsElement() {
    return [
      { valeur: "tous", libelle: "Tous les éléments" },
      ...ELEMENTS_FILTRE.map((el) => {
        let icone;
        if (el === "cinetique") {
          const url = db ? obtenirIconeCinetique(db) : undefined;
          icone = url ? <img src={url} alt="" width={16} height={16} style={{ borderRadius: 3, flexShrink: 0 }} /> : undefined;
        } else {
          icone = <IconeElement element={el} taille={16} urlOfficielle={db ? obtenirIconeElementDoctrine(db, el) : undefined} />;
        }
        return { valeur: el, libelle: el === "cinetique" ? "Cinétique" : LIBELLES_ELEMENT_FR[el], icone };
      }),
    ];
  }

  function correspondAuxFiltres(piece: GearPiece): boolean {
    if (cible && piece.itemHash !== cible.hash) return false;   // ⚠️ AJOUT (12/10/2026, v0.4.0) : « Aller à »
    if (doublonsSeulementCoffre && !hashesEnDoublonCoffre.has(piece.itemHash)) return false;
    if (filtreRarete !== "toutes" && piece.rarete !== filtreRarete) return false;
    if (filtreTypeArme !== "tous" && piece.typeArme !== filtreTypeArme) return false;
    if (filtreSlotArmure !== "tous" && piece.slot !== filtreSlotArmure) return false;
    // FR : ⚠️ AJOUT (04/08/2026) - filtre anti-champion, demande explicite.
    if (filtreChampionCoffre !== "tous") {
      if (!db || !["cinetique", "energie", "lourde"].includes(piece.slot)) return false;
      if (obtenirAntiChampion(db, piece.itemHash) !== filtreChampionCoffre) return false;
    }
    if (filtreElementCoffre !== "tous" && (!db || obtenirElementFiltre(db, piece.itemHash) !== filtreElementCoffre)) return false;   // ⚠️ AJOUT (12/10/2026, v0.4.0)
    if (rechercheCoffre.trim().length >= 2) {
      const cle = piece.itemInstanceId ?? `${piece.itemHash}`;
      // FR : ⚠️ CORRIGÉ (04/08/2026) - `toLowerCase()` gère la casse mais PAS
      // les accents : chercher "epee" ne trouvait pas "Épée". On utilise
      // `normaliser()`, déjà employée partout ailleurs pour cette raison.
      const texte = normaliser(texteRechercheParPiece.get(cle) ?? piece.nom ?? "");
      if (!texte.includes(normaliser(rechercheCoffre.trim()))) return false;
    }
    return true;
  }

  const coffre = trierEtGrouper(coffreBrut.filter(correspondAuxFiltres));

  // FR : ⚠️ AJOUT (04/08/2026) - même principe que correspondAuxFiltres
  // ci-dessus, mais pour "Mon Inventaire" (demande explicite de
  // l'utilisateur : mêmes filtres que le Coffre, limités à l'inventaire).
  // EN: ⚠️ ADDED (2026-08-04) - same principle as correspondAuxFiltres
  // above, but for "My Inventory" (explicit user request: same filters
  // as the Vault, limited to the inventory).
  function correspondAuxFiltresInventaire(piece: GearPiece): boolean {
    if (cible && piece.itemHash !== cible.hash) return false;   // ⚠️ AJOUT (12/10/2026, v0.4.0) : « Aller à »
    if (doublonsSeulementInv && !hashesEnDoublonInv.has(piece.itemHash)) return false;
    if (filtreRareteInv !== "toutes" && piece.rarete !== filtreRareteInv) return false;
    if (filtreTypeArmeInv !== "tous" && piece.typeArme !== filtreTypeArmeInv) return false;
    if (filtreSlotArmureInv !== "tous" && piece.slot !== filtreSlotArmureInv) return false;
    if (filtreChampionInv !== "tous") {
      if (!["cinetique", "energie", "lourde"].includes(piece.slot)) return false;
      if (!db || obtenirAntiChampion(db, piece.itemHash) !== filtreChampionInv) return false;
    }
    if (filtreElementInv !== "tous" && (!db || obtenirElementFiltre(db, piece.itemHash) !== filtreElementInv)) return false;   // ⚠️ AJOUT (12/10/2026, v0.4.0)
    if (rechercheInventaire.trim().length >= 2) {
      const cle = piece.itemInstanceId ?? `${piece.itemHash}`;
      const texte = normaliser(texteRechercheParPieceInventaire.get(cle) ?? piece.nom ?? "");
      if (!texte.includes(normaliser(rechercheInventaire.trim()))) return false;
    }
    return true;
  }

  const raretesDisponiblesInv = Array.from(new Set(inventaireBrut.map((o) => o.rarete).filter(Boolean))).sort() as string[];
  const typesArmeDisponiblesInv = Array.from(new Set(inventaireBrut.map((o) => o.typeArme).filter(Boolean))).sort() as string[];

  return (
    <details ref={refBloc} open className="pilier-carte bloc-repliable">
      {/* FR : ⚠️ CHANGÉ (27/09/2026, v0.2.3) - bloc repliable, comme le Coffre
      (demande de l'utilisateur). Ouvert par défaut : rien ne change au
      lancement, on replie ce qu'on veut. Style dans index.css (.bloc-repliable).
      EN: ⚠️ CHANGED - collapsible block like the Vault, open by default. */}

      <summary>
        <span className="bloc-repliable-ligne">
        {/* FR : ⚠️ CHANGÉ (07/10/2026, v0.3.15) - titre illustré ; la précision « personnages + coffre » n'est pas dans l'image (la notice de l'archive le dit) : elle est gardée en sous-texte discret à côté. / EN: ⚠️ CHANGED - illustrated title; the "characters + vault" detail is kept as a muted sub-text. */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <TitreRepliable categorie="inventaire" />
          <span data-sous-titre-inventaire="" style={{ fontSize: "0.72rem", fontWeight: 400, color: "#7d7a70" }}>personnages + coffre + courrier</span>
        </span>
        <span>{objets ? `✅ ${objets.length} objets` : "◯ non chargé"}</span>
        </span>
      </summary>

      {/* FR : ⚠️ AJOUT (04/08/2026) - légende des repères visuels, demande
      de l'utilisateur (qui s'interrogeait aussi sur la signification de
      l'étoile). Ces deux symboles étaient utilisés sans explication nulle
      part dans l'interface.
      EN: ⚠️ ADDED (2026-08-04) - legend for the visual markers, user
      request (they also asked what the star meant). Both symbols were
      used without any explanation anywhere in the UI. */}
      <p style={{ fontSize: "0.75rem", color: "#7d7a70", margin: "0 0 0.5rem" }}>
        <span style={{ color: "#d4af37" }}>★</span> = objet exotique · 🛡️ = fait partie d'un set
        d'armure (survolez le symbole pour voir les bonus et leurs effets)
      </p>

      {indisponible && (
        <p style={{ fontSize: "0.85rem", color: "#7d7a70" }}>
          Nécessite d'avoir cliqué sur "Tester la connexion" ET d'avoir chargé le Manifest avant
          de pouvoir lister vos objets.
        </p>
      )}

      {!indisponible && (
        <button onClick={charger} disabled={enCours} style={{ marginBottom: "0.75rem" }}>
          {enCours && <span className="indicateur-chargement" />}
          {enCours ? "Chargement..." : objets ? "Recharger mon inventaire" : "Charger mon inventaire"}
        </button>
      )}

      {erreur && <p style={{ color: "#e08080" }}>⚠️ {erreur}</p>}

      {/* FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - résultat du dernier transfert (réussite ou échec), avec un bouton pour le fermer. / EN: ⚠️ ADDED - last transfer result banner. */}
      {messageTransfert && (
        <p role="status" data-bandeau-transfert="" style={{ fontSize: "0.8rem", margin: "0 0 0.6rem", padding: "0.4rem 0.6rem", border: `1px solid ${messageTransfert.ok ? "#4a9e5c" : "#c08040"}`, borderRadius: 6, color: "#e8e6df" }}>
          {messageTransfert.texte}{" "}
          <button onClick={() => setMessageTransfert(null)} style={{ fontSize: "0.72rem", marginLeft: "0.3rem" }}>✕ Fermer</button>
        </p>
      )}

      {/* FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - bandeau « Aller à » : dit sur quoi l'inventaire est filtré, combien d'exemplaires (personnages + coffre) existent, et permet de retirer le filtre. Sans inventaire chargé, on explique quoi faire. / EN: "Go to" banner. */}
      {cible && (
        <p role="status" data-bandeau-aller-a="" style={{ fontSize: "0.8rem", margin: "0 0 0.6rem", padding: "0.4rem 0.6rem", border: "1px solid #d4af37", borderRadius: 6, color: "#e8e6df" }}>
          🎯 Filtré sur <strong>{cible.nom}</strong> —{" "}
          {!objets
            ? "chargez d'abord votre inventaire pour voir vos exemplaires."
            : (() => {
                const n = objets.filter((o) => o.itemHash === cible.hash).length;
                return n === 0 ? "vous n'en possédez aucun exemplaire (personnages et coffre)." : `${n} exemplaire${n > 1 ? "s" : ""} (personnages et coffre).`;
              })()}{" "}
          <button onClick={() => onEffacerCible?.()} style={{ fontSize: "0.72rem", marginLeft: "0.3rem" }}>
            ✕ Retirer ce filtre
          </button>
        </p>
      )}

      {statsNonResolues.length > 0 && (
        <p style={{ fontSize: "0.7rem", color: "#5a5f6b" }}>
          ℹ️ {statsNonResolues.length} autre(s) stat(s) rencontrée(s) sur ces objets mais ignorée(s)
          (ex: Puissance, Défense, capacités d'énergie de mods...) — normal, ce ne sont pas les 6
          stats Armor 3.0 suivies par l'outil.
        </p>
      )}

      {diagnosticStats && diagnosticStats.armureAvecStatsBrutesTotal === 0 && (
        <p style={{ color: "#e0c080", fontSize: "0.8rem" }}>
          ⚠️ Diagnostic stats (élargi) — {diagnosticStats.armureSansInstanceId} pièce(s)
          d'armure sans itemInstanceId, {diagnosticStats.armureSansDonneesStatsBrutes} pièce(s)
          avec un itemInstanceId mais AUCUNE donnée brute de stats renvoyée par l'API (composant
          302 vide), 0 pièce avec des données exploitables. <strong>Copiez ce message à Claude</strong> :
          ça veut dire que le problème est en amont de la reconnaissance des noms — probablement
          un changement dans la façon dont Armor 3.0 expose les stats via l'API.
        </p>
      )}

      {objets && (
        <>
          {/* FR : ⚠️ AJOUT (04/08/2026) - recherche + filtres pour "Mon
          Inventaire", même principe que le Coffre (demande explicite de
          l'utilisateur), mais limité aux 3 personnages (pas le Coffre). */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" }}>
            <input
              type="text"
              value={rechercheInventaire}
              onChange={(e) => setRechercheInventaire(e.target.value)}
              placeholder="Rechercher dans Mon Inventaire (nom, perk, effet...)"
              style={{ flex: "1 1 170px", fontSize: "0.8rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.5rem" }}
            />
            <select
              value={filtreRareteInv}
              onChange={(e) => setFiltreRareteInv(e.target.value)}
              style={{ fontSize: "0.8rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.4rem" }}
            >
              <option value="toutes">Toutes raretés</option>
              {raretesDisponiblesInv.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <MenuDerouantIcone
              valeur={filtreTypeArmeInv}
              onChanger={(v) => setFiltreTypeArmeInv(v)}
              largeur="170px"
              options={[
                { valeur: "tous", libelle: "Tous types d'arme" },
                ...typesArmeDisponiblesInv.map((t) => ({
                  valeur: t,
                  libelle: t,
                  icone: <IconeTypeArme typeArme={t} taille={16} />,
                })),
              ]}
            />
            <MenuDerouantIcone
              valeur={filtreSlotArmureInv}
              onChanger={(v) => setFiltreSlotArmureInv(v as "tous" | SlotArmure)}
              largeur="170px"
              options={[
                { valeur: "tous", libelle: "Tous types d'armure" },
                ...ORDRE_EMPLACEMENTS_ARMURE.map((s) => ({
                  valeur: s,
                  libelle: LIBELLES_SLOT_FILTRE[s],
                  icone: <IconeSlotArmure slot={s} taille={16} />,
                })),
              ]}
            />
            {/* FR : ⚠️ CHANGÉ (24/08/2026) - dernier <select> natif de ce
            bloc converti en MenuDerouantIcone (voir TODO.md). */}
            <MenuDerouantIcone
              valeur={filtreChampionInv}
              onChanger={(v) => setFiltreChampionInv(v as "tous" | TypeChampion)}
              largeur="160px"
              options={[
                { valeur: "tous", libelle: "Tous anti-champions" },
                { valeur: "implacable", libelle: "Anti-Implacable", icone: <IconeAntiChampion type="implacable" taille={16} /> },
                { valeur: "surcharge", libelle: "Anti-Surchargé", icone: <IconeAntiChampion type="surcharge" taille={16} /> },
                { valeur: "bloqueur", libelle: "Anti-Bloqueur", icone: <IconeAntiChampion type="bloqueur" taille={16} /> },
              ]}
            />
            {/* FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - filtre sur l'élément de dégâts, demande de l'utilisateur. */}
            <MenuDerouantIcone valeur={filtreElementInv} onChanger={(v) => setFiltreElementInv(v as "tous" | ElementFiltre)} largeur="170px" options={optionsElement()} />
          </div>
          <span style={{ display: "inline-flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setRechercheInventaire("");
                setFiltreRareteInv("toutes");
                setFiltreTypeArmeInv("tous");
                setFiltreSlotArmureInv("tous");
                setFiltreChampionInv("tous");
                setFiltreElementInv("tous");
                onEffacerCible?.();   // ⚠️ v0.4.0 : retire aussi le filtre « Aller à »
                setDoublonsSeulementInv(false);
              }}
              style={{ fontSize: "0.75rem" }}
            >
              ✕ Réinitialiser les filtres
            </button>
            {/* FR : ⚠️ AJOUT (04/08/2026) - bouton "doublons", demande de
            l'utilisateur : n'affiche que les objets présents en plusieurs
            exemplaires (même itemHash). Bouton à bascule, état visuel
            explicite pour qu'on sache qu'un filtre est actif. */}
            <button
              onClick={() => setDoublonsSeulementInv((v) => !v)}
              style={{
                fontSize: "0.75rem",
                background: doublonsSeulementInv ? "#1a2436" : undefined,
                borderColor: doublonsSeulementInv ? "#7aa2f7" : undefined,
              }}
              title="N'afficher que les objets possédés en plusieurs exemplaires"
            >
              {doublonsSeulementInv ? "✓ Doublons" : "Doublons"}
            </button>
          </span>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            {(["chasseur", "titan", "arcaniste"] as const).map((classe) => {
              const { equipe, inventaire } = parPersonnage(classe);
              return (
                <details key={classe} open={cible && (equipe.some((g) => g.items.length > 0) || inventaire.some((g) => g.items.length > 0)) ? true : undefined} style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>   {/* ⚠️ v0.4.0 : « Aller à » ouvre les personnages qui possèdent l'objet */}
                  <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <IconeClasse classe={classe} taille={18} />
                      {LIBELLES_PERSONNAGE[classe]}
                    </span>
                  </summary>
                  {equipe.every((g) => g.items.length === 0) && inventaire.every((g) => g.items.length === 0) && (
                    <p style={{ fontSize: "0.75rem", color: "#7d7a70" }}>Aucun objet.</p>
                  )}
                  {equipe.some((g) => g.items.length > 0) && (
                    <>
                      <strong style={{ fontSize: "0.75rem", color: "#7fd88f" }}>Équipé</strong>
                      {equipe.map((g) => (
                        <div key={g.slot} style={{ marginBottom: "0.3rem" }}>
                          <div style={{ fontSize: "0.7rem", color: "#7d7a70" }}>{LIBELLES_SLOT[g.slot]}</div>
                          {g.items.length === 0 ? (
                            <div style={{ fontSize: "0.8rem", color: "#3a3f4b" }}>—</div>
                          ) : (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                              {g.items.map((p) => (
                                <LigneObjet key={p.itemInstanceId ?? p.itemHash} piece={p} db={db!} onAjouterObjet={onAjouterObjet} onTransferer={transferer} transfertBloque={transfertEnCours !== null} onOuvrirForge={onOuvrirForge} onLireLore={onLireLore} />
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                  {inventaire.some((g) => g.items.length > 0) && (
                    <>
                      <strong style={{ fontSize: "0.75rem", color: "#b7b3a8" }}>Inventaire</strong>
                      {inventaire.map((g) => (
                        <div key={g.slot} style={{ marginBottom: "0.3rem" }}>
                          <div style={{ fontSize: "0.7rem", color: "#7d7a70" }}>{LIBELLES_SLOT[g.slot]}</div>
                          {g.items.length === 0 ? (
                            <div style={{ fontSize: "0.8rem", color: "#3a3f4b" }}>—</div>
                          ) : (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                              {g.items.map((p) => (
                                <LigneObjet key={p.itemInstanceId ?? p.itemHash} piece={p} db={db!} onAjouterObjet={onAjouterObjet} onTransferer={transferer} transfertBloque={transfertEnCours !== null} onOuvrirForge={onOuvrirForge} onLireLore={onLireLore} />
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </details>
              );
            })}
          </div>

          {/* FR : ⚠️ AJOUT (24/10/2026, tests post-audit, point 5.8) - section
          « Courrier » (postmaster) : les objets en attente de récupération en
          jeu. Ils sont listés pour être VISIBLES (l'inventaire du personnage ne
          les montrait pas avant), mais ni le bouton « Transférer vers » ni le
          bouton « + Ajouter » ne les accepte : un objet au courrier ne se
          déplace pas d'ici (il faut d'abord le récupérer en jeu). Le bouton de
          transfert est grisé avec l'explication (voir BoutonTransfert). */}
          {courrierBrut.length > 0 && (
            <details open style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem", marginBottom: "0.75rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  📨 Courrier ({courrierBrut.length} objet{courrierBrut.length > 1 ? "s" : ""})
                </span>
              </summary>
              <p style={{ fontSize: "0.72rem", color: "#7d7a70", margin: "0.3rem 0 0.5rem" }}>
                En attente de récupération en jeu : un objet au courrier ne peut pas être équipé ni transféré d'ici.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.4rem" }}>
                {trierEtGrouper(courrierBrut).map((g) => (
                  <li key={g.slot}>
                    <div style={{ fontSize: "0.7rem", color: "#7d7a70" }}>{LIBELLES_SLOT[g.slot]}</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0.2rem 0 0" }}>
                      {g.items.map((p) => (
                        <LigneObjet key={p.itemInstanceId ?? p.itemHash} piece={p} db={db!} onAjouterObjet={onAjouterObjet} onTransferer={transferer} transfertBloque={transfertEnCours !== null} onOuvrirForge={onOuvrirForge} onLireLore={onLireLore} />
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <details open={cible && coffre.some((g) => g.items.length > 0) ? true : undefined} style={{ border: "1px solid #2a2e38", borderRadius: 6, padding: "0.5rem" }}>   {/* ⚠️ v0.4.0 : « Aller à » ouvre le coffre s'il contient l'objet */}
            <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <IconeCoffre taille={16} />
                Coffre ({coffre.reduce((n, g) => n + g.items.length, 0)} objets{coffreBrut.length !== coffre.reduce((n, g) => n + g.items.length, 0) ? ` / ${coffreBrut.length} au total` : ""})
              </span>
            </summary>

            {/* FR : filtres + recherche limités au Coffre (800 objets, difficile à parcourir sans ça). */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <input
                type="text"
                placeholder="Rechercher dans le Coffre (nom, perk, effet...)"
                value={rechercheCoffre}
                onChange={(e) => setRechercheCoffre(e.target.value)}
                style={{ flex: "1 1 170px", fontSize: "0.8rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.5rem" }}
              />
              <select
                value={filtreRarete}
                onChange={(e) => setFiltreRarete(e.target.value)}
                style={{ fontSize: "0.8rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.4rem" }}
              >
                <option value="toutes">Toutes raretés</option>
                {raretesDisponibles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {/* FR : ⚠️ CHANGÉ (24/08/2026) - <select> natif remplacé par
              MenuDerouantIcone, un <option> HTML ne pouvant afficher que du
              texte (voir TODO.md). */}
              <MenuDerouantIcone
                valeur={filtreTypeArme}
                onChanger={(v) => setFiltreTypeArme(v)}
                largeur="170px"
                options={[
                  { valeur: "tous", libelle: "Tous types d'arme" },
                  ...typesArmeDisponibles.map((t) => ({
                    valeur: t,
                    libelle: t,
                    icone: <IconeTypeArme typeArme={t} taille={16} />,
                  })),
                ]}
              />
              <MenuDerouantIcone
                valeur={filtreSlotArmure}
                onChanger={(v) => setFiltreSlotArmure(v as "tous" | SlotArmure)}
                largeur="170px"
                options={[
                  { valeur: "tous", libelle: "Tous types d'armure" },
                  ...ORDRE_EMPLACEMENTS_ARMURE.map((s) => ({
                    valeur: s,
                    libelle: LIBELLES_SLOT_FILTRE[s],
                    icone: <IconeSlotArmure slot={s} taille={16} />,
                  })),
                ]}
              />
              {/* FR : ⚠️ CHANGÉ (24/08/2026) - dernier <select> natif de ce
              bloc converti en MenuDerouantIcone (voir TODO.md). */}
              <MenuDerouantIcone
                valeur={filtreChampionCoffre}
                onChanger={(v) => setFiltreChampionCoffre(v as "tous" | TypeChampion)}
                largeur="160px"
                options={[
                  { valeur: "tous", libelle: "Tous anti-champions" },
                  { valeur: "implacable", libelle: "Anti-Implacable", icone: <IconeAntiChampion type="implacable" taille={16} /> },
                  { valeur: "surcharge", libelle: "Anti-Surchargé", icone: <IconeAntiChampion type="surcharge" taille={16} /> },
                  { valeur: "bloqueur", libelle: "Anti-Bloqueur", icone: <IconeAntiChampion type="bloqueur" taille={16} /> },
                ]}
              />
              {/* FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - filtre sur l'élément de dégâts, demande de l'utilisateur. */}
              <MenuDerouantIcone valeur={filtreElementCoffre} onChanger={(v) => setFiltreElementCoffre(v as "tous" | ElementFiltre)} largeur="170px" options={optionsElement()} />
            </div>

            {/* FR : ⚠️ AJOUT (04/08/2026) - bouton de réinitialisation de
            tous les filtres/recherche du Coffre en un clic, demande
            explicite de l'utilisateur. Visible seulement si au moins un
            filtre est actif, pour ne pas encombrer l'UI inutilement. */}
            {/* FR : ⚠️ CHANGÉ (04/08/2026) - toujours visible maintenant
            (demande de l'utilisateur), plus seulement quand un filtre
            est actif. */}
            <span style={{ display: "inline-flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setRechercheCoffre("");
                  setFiltreRarete("toutes");
                  setFiltreTypeArme("tous");
                  setFiltreSlotArmure("tous");
                  setFiltreChampionCoffre("tous");
                  setFiltreElementCoffre("tous");
                  onEffacerCible?.();   // ⚠️ v0.4.0 : retire aussi le filtre « Aller à »
                  setDoublonsSeulementCoffre(false);
                }}
                style={{ fontSize: "0.75rem" }}
              >
                ✕ Réinitialiser les filtres
              </button>
              <button
                onClick={() => setDoublonsSeulementCoffre((v) => !v)}
                style={{
                  fontSize: "0.75rem",
                  background: doublonsSeulementCoffre ? "#1a2436" : undefined,
                  borderColor: doublonsSeulementCoffre ? "#7aa2f7" : undefined,
                }}
                title="N'afficher que les objets présents en plusieurs exemplaires dans le Coffre"
              >
                {doublonsSeulementCoffre ? "✓ Doublons" : "Doublons"}
              </button>
            </span>

            {/* FR : ⚠️ AJOUT (04/08/2026) - diagnostic pour vérifier si
            les icônes de type d'équipement existent dans le Manifest,
            avant de construire un menu déroulant personnalisé. */}
            {db && (
              <details style={{ fontSize: "0.75rem", color: "#7d7a70", marginBottom: "0.5rem" }}>
                <summary style={{ cursor: "pointer" }}>
                  <span>🔍 Vérifier la disponibilité des icônes de type d'équipement (diagnostic, à copier à Claude)</span>
                </summary>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.7rem" }}>
                  {obtenirDiagnosticIconeCategorieObjet(db)}
                </pre>
              </details>
            )}

            {/* FR : sous-partie Armes - repliée par défaut, sous-groupes Cinétique/Énergie/Lourde chacun repliable individuellement, affichés en 4 colonnes. */}
            <details style={{ marginTop: "0.5rem", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.4rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}><span>Armes</span></summary>
              {coffre
                .filter((g) => (["cinetique", "energie", "lourde"] as (SlotArme | SlotArmure)[]).includes(g.slot))
                .map((g) => (
                  <details key={g.slot} style={{ marginTop: "0.4rem" }}>
                    <summary style={{ cursor: "pointer", fontSize: "0.75rem" }}><span>{LIBELLES_SLOT[g.slot]} ({g.items.length})</span></summary>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "0.25rem 0 0",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: "0.4rem",
                      }}
                    >
                      {g.items.map((p) => (
                        <LigneObjet key={p.itemInstanceId ?? p.itemHash} piece={p} db={db!} onAjouterObjet={onAjouterObjet} onTransferer={transferer} transfertBloque={transfertEnCours !== null} onOuvrirForge={onOuvrirForge} onLireLore={onLireLore} />
                      ))}
                    </ul>
                  </details>
                ))}
            </details>

            {/* FR : ⚠️ RETIRÉ (03/08/2026) - la sous-partie "Armures" (à plat,
            toutes classes mélangées) ne faisait plus vraiment sens une fois
            "Armures par classe" ajoutée juste en dessous - retirée à la
            demande de l'utilisateur. "Armures par classe" continue de
            fonctionner de façon autonome (elle relit `objets` directement,
            pas le résultat de cette sous-partie retirée). */}

            {/* FR : Armure rangée par classe (Chasseur/Titan/Arcaniste), repliée par défaut, 4 colonnes comme "Armes" pour la cohérence visuelle. */}
            <details style={{ marginTop: "0.5rem", border: "1px solid #2a2e38", borderRadius: 6, padding: "0.4rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}><span>Armures</span></summary>
              {(["chasseur", "titan", "arcaniste"] as const).map((classe) => {
                const groupesClasse = trierEtGrouper(
                  coffreBrut.filter((o) => o.classeRequise === classe && correspondAuxFiltres(o))
                );
                if (groupesClasse.length === 0) return null;
                return (
                  <details key={classe} style={{ marginTop: "0.4rem" }}>
                    <summary style={{ cursor: "pointer", fontSize: "0.78rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <IconeClasse classe={classe} taille={16} />
                        {LIBELLES_PERSONNAGE[classe]}
                      </span>
                    </summary>
                    {groupesClasse.map((g) => (
                      <div key={g.slot} style={{ marginTop: "0.3rem" }}>
                        <strong style={{ fontSize: "0.72rem" }}>{LIBELLES_SLOT[g.slot]}</strong>
                        <ul
                          style={{
                            listStyle: "none",
                            padding: 0,
                            margin: "0.2rem 0 0",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "0.4rem",
                          }}
                        >
                          {g.items.map((p) => (
                            <LigneObjet key={p.itemInstanceId ?? p.itemHash} piece={p} db={db!} afficherStats onAjouterObjet={onAjouterObjet} onTransferer={transferer} transfertBloque={transfertEnCours !== null} onOuvrirForge={onOuvrirForge} onLireLore={onLireLore} />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </details>
                );
              })}
            </details>
          </details>
        </>
      )}
    </details>
  );
}

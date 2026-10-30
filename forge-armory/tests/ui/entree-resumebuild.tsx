// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - page de test du VRAI composant `ResumeBuild` (Mon Build) avec un build où UNE arme possédée porte des perks SIMULÉS (copie produite par `appliquerSimulationPiece`, comme le fait la page principale), une autre arme possédée sans simulation, une arme NON possédée et une armure. Les clics sur « Forge » sont notés dans `window.__forge`. / EN: ⚠️ ADDED - test page of the real Mon Build component with one simulated owned weapon.
import { createRoot } from "react-dom/client";
import ResumeBuild from "../../src/components/ResumeBuild";
import { appliquerSimulationPiece } from "../../src/lib/forge/appliquerSimulation";
import { demoBuild } from "../../src/data/demoBuild";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeRevisionAPaliers, ajouterArmeFaconnee, ajouterSaisons } from "../logique/fixtures/fauxManifest";
import type { GearPiece } from "../../src/types/build";

// FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - `?faconnees` : « Fusil d'essai » (w2) devient une arme FAÇONNÉE (perk équipé « Arme façonnée », 4029346515) ; `?faconnees=2` : le « Fusil à paliers » (w1), celui aux perks SIMULÉS, l'est aussi (l'icône est lue sur ses perks RÉELS). / EN: ⚠️ ADDED - crafted weapons in Mon Build.
const faconnees = new URLSearchParams(location.search).get("faconnees");
const defs = manifestArmesDeTest();
ajouterArmeRevisionAPaliers(defs);
ajouterArmeFaconnee(defs);   // ⚠️ v0.4.11 : l'arme façonnée d'essai 5020 (utilisée avec `?pool`)
if (/saisons/.test(location.search)) ajouterSaisons(defs, [5010, 5005]);   // ⚠️ v0.4.11 : filigrane et saison pour le Fusil à paliers (5010) et l'armure (5005)
<<<<<<< Updated upstream
const { db } = creerFausseDb(defs);
=======
// FR : ⚠️ AJOUT (26/10/2026, « Je ne vois pas les nouvelles fenêtres ») - `?casquechatoyant` : Mon Build avec UNE armure, le casque calqué sur le casque chatoyant réel (capacité 11, énergie utilisée 10), pour tester de bout en bout la fenêtre Détails de Mon Build. / EN: ⚠️ ADDED - `?casquechatoyant`: Mon Build with the shared helmet fixture.
const casqueChat = /casquechatoyant/.test(location.search) ? creerCasqueChatoyant({ avecLore: /lore/.test(location.search) }) : null;   // ⚠️ 30/10/2026 : `&lore` : le casque possède un Lore
const leLore = (h: number, n: string) => { const w = window as unknown as { __lore?: Array<[number, string]> }; w.__lore = [...(w.__lore ?? []), [h, n]]; };   // ⚠️ 30/10/2026 : « Lire le Lore » rangé dans window.__lore
const { db } = casqueChat ?? creerFausseDb(defs);
>>>>>>> Stashed changes
const base = { stats: {}, isExotic: false, rarete: "Légendaire", icone: "https://www.bungie.net/icons/x.png" };
const reelle = { ...base, itemHash: 5010, itemInstanceId: "w1", nom: "Fusil à paliers", slot: "energie", typeArme: "Fusil à impulsion", origine: "titan", equipe: true, perkHashes: [6901, 6912, 6921, 6931, ...(faconnees === "2" ? [4029346515] : [])], perksParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }, { socketIndex: 3, hash: 6921 }, { socketIndex: 4, hash: 6931 }] } as unknown as GearPiece;   // ⚠️ v0.4.10 : avec `?faconnees=2`, le perk « Arme façonnée » n'est QUE dans `perkHashes` (pas dans `perksParColonne`) : la copie « avec simulation » le perd, l'icône doit donc être lue sur `perkHashesReels`
const simulee = appliquerSimulationPiece(reelle, { 1: { choisi: 6903, effectif: 6904 }, 3: { choisi: 6923, effectif: 6923 } });
// FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - `?pool` : l'arme d'à côté devient « Mesure corrective d'essai » (5020), façonnée, à liste directe d'un perk ET pool derrière, avec son roll réel (dont un perk 7249 absent du Manifest). / EN: ⚠️ ADDED - `?pool` makes the neighbouring weapon a crafted weapon hiding a pool.
const pool = new URLSearchParams(location.search).has("pool");
const autre = pool ? ({ ...base, itemHash: 5020, itemInstanceId: "w2", nom: "Mesure corrective d'essai", slot: "cinetique", typeArme: "Mitrailleuse", origine: "titan", perkHashes: [7201, 7212, 7222, 7231, 7249, 4029346515], perksParColonne: [{ socketIndex: 0, hash: 7201 }, { socketIndex: 1, hash: 7212 }, { socketIndex: 2, hash: 7222 }, { socketIndex: 3, hash: 7231 }, { socketIndex: 4, hash: 7249 }, { socketIndex: 5, hash: 4029346515 }] } as unknown as GearPiece) : { ...base, itemHash: 5001, itemInstanceId: "w2", nom: "Fusil d'essai", slot: "cinetique", typeArme: "Fusil à impulsion", origine: "coffre", perkHashes: faconnees ? [4029346515] : [] } as unknown as GearPiece;
const nonPossedee = { ...base, itemHash: 5002, nom: "Lance-roquettes d'essai", slot: "lourde", typeArme: "Lance-roquettes", isExotic: true, perkHashes: [] } as unknown as GearPiece;
const casque = { ...base, itemHash: 5005, itemInstanceId: new URLSearchParams(location.search).has("sansid") ? undefined : "c1", nom: "Casque d'essai", slot: "casque", classeRequise: "titan", origine: "titan", perkHashes: faconnees ? [4029346515] : [] } as unknown as GearPiece;   // ⚠️ v0.4.10 : avec `?faconnees`, l'ARMURE porte le même perk « Arme façonnée » : elle ne doit PAS recevoir l'icône
(window as unknown as { __forge: GearPiece[] }).__forge = [];
<<<<<<< Updated upstream
const build = { ...structuredClone(demoBuild), armes: [simulee, autre, nonPossedee], armure: [casque] };
createRoot(document.getElementById("racine")!).render(
  <div className="app-shell">
    <ResumeBuild build={build} membership={{ membershipId: "1", membershipType: 3, displayName: "Test#1234" }} personnages={[{ characterId: "p1", classe: "Titan", lumiere: 2000 }]} db={db}
      onOuvrirForge={(p) => (window as unknown as { __forge: GearPiece[] }).__forge.push(p)} />
=======
const build = casqueChat ? { ...structuredClone(demoBuild), armes: [], armure: [{ ...casqueChat.c1, origine: "titan", classeRequise: "chasseur", icone: "https://www.bungie.net/icons/x.png" } as unknown as GearPiece] } : { ...structuredClone(demoBuild), armes: [simulee, autre, nonPossedee], armure: [casque] };
// FR : ⚠️ AJOUT (27/10/2026, « travaille sur le lien entre stats simulées et score ») - dans la variante `?casquechatoyant`, un HÔTE joue le rôle de la page principale : il lit le MÊME magasin de simulations et applique la simulation au build AVEC la base du Manifest (`appliquerSimulations(build, simulations, db)`), exactement comme `DashboardPage` ; Mon Build reçoit donc le build « effectif » (statistiques recalculées). / EN: ⚠️ ADDED - in the `?casquechatoyant` variant a host plays the dashboard's role: it applies the simulation to the build with the Manifest.
function Hote() {
  const simulations = useSimulations();
  const effectif = useMemo(() => (casqueChat ? appliquerSimulations(build as never, simulations, db) : build), [simulations]);
  return (
    <ResumeBuild onLireLore={leLore} build={effectif as never} membership={{ membershipId: "1", membershipType: 3, displayName: "Test#1234" }} personnages={[{ characterId: "p1", classe: "Titan", lumiere: 2000 }]} db={db}
      onOuvrirOptimiseur={() => { (window as unknown as { __optimiseur: number }).__optimiseur = ((window as unknown as { __optimiseur?: number }).__optimiseur ?? 0) + 1; }} onOuvrirForge={(p) => (window as unknown as { __forge: GearPiece[] }).__forge.push(p)} />
  );
}
createRoot(document.getElementById("racine")!).render(
  <div className="app-shell">
    {casqueChat ? <Hote /> : null}
    {casqueChat ? null : <ResumeBuild onLireLore={leLore} build={build} membership={{ membershipId: "1", membershipType: 3, displayName: "Test#1234" }} personnages={[{ characterId: "p1", classe: "Titan", lumiere: 2000 }]} db={db}
      onOuvrirOptimiseur={() => { (window as unknown as { __optimiseur: number }).__optimiseur = ((window as unknown as { __optimiseur?: number }).__optimiseur ?? 0) + 1; }} onOuvrirForge={(p) => (window as unknown as { __forge: GearPiece[] }).__forge.push(p)} />}
>>>>>>> Stashed changes
  </div>
);
(window as unknown as { __pret: boolean }).__pret = true;

// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - page de test du VRAI composant `PageForge` (vue Collection des armes) avec un faux Manifest d'armes (`tests/logique/fixtures/fauxManifest.ts`) et une fausse API Bungie pour les collections. Variantes par l'adresse : `?modPrecoce` (une arme dont les mods précèdent des colonnes de perks), `?collections=erreur` (Bungie refuse), `?sansCompte` (non connecté), `?sansManifest` (Manifest non chargé), `?beaucoup` (130 armes en plus, pour la pagination).
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { useSimulations } from "../../src/lib/forge/storeSimulations";
import { appliquerSimulations, nbArmesSimulees } from "../../src/lib/forge/appliquerSimulation";
import { demoBuild } from "../../src/data/demoBuild";
import PageForge from "../../src/components/PageForge";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeModPrecoce, ajouterArmeRevisionAPaliers, ajouterArmeFaconnee, ajouterCatalogueArmures, ajouterSaisons, T_OBJET, T_PLUGSET } from "../logique/fixtures/fauxManifest";

const params = new URLSearchParams(location.search);
const defs = manifestArmesDeTest();
if (params.has("pool")) ajouterArmeFaconnee(defs);   // ⚠️ v0.4.11 : arme façonnée d'essai à liste directe d'un perk ET pool derrière (comme la Mesure corrective)
if (params.has("paliers") || params.has("inventaire")) ajouterArmeRevisionAPaliers(defs);
(defs as Record<string, Record<number, unknown>>)[T_OBJET][7777] = { displayProperties: { name: "Arme façonnée" }, itemTypeDisplayName: "Intrinsèque" };   // ⚠️ v0.4.10 : perk « Arme façonnée » d'un AUTRE hash (repli par le nom)   // ⚠️ v0.4.6 : `?inventaire` a besoin de l'arme 5010 (ses armes possédées y renvoient)   // ⚠️ AJOUT (13/10/2026, v0.4.4) : arme à perks améliorés (structure réelle)
if (params.has("modPrecoce")) ajouterArmeModPrecoce(defs);   // arme dont les mods sont AVANT des colonnes de perks
if (params.has("beaucoup")) {
  const modele = (defs[T_OBJET] as Record<number, Record<string, unknown>>)[5003];
  for (let i = 0; i < 130; i++) (defs[T_OBJET] as Record<number, unknown>)[7000 + i] = { ...modele, displayProperties: { name: `Arme numéro ${String(i).padStart(3, "0")}`, icon: "/icons/x.png", description: "" }, collectibleHash: 8000 + i };
}
if (params.has("armures") && params.has("energie")) {   // ⚠️ AJOUT (24/10/2026) : coûts d'énergie des mods d'essai pour le DIAGNOSTIC : santé 3, classe 1, armes 3, ajustements 0 ; « Emplacement de mod vide » (198000) n'en a pas (illisible)
  ajouterCatalogueArmures(defs);
  const o = (defs as Record<string, Record<number, { plug?: Record<string, unknown> }>>)[T_OBJET];
  for (const [h, c] of [[7411, 3], [7412, 1], [7413, 3], [7421, 0], [7422, 0]] as Array<[number, number]>) o[h].plug = { ...(o[h].plug ?? {}), energyCost: { energyCost: c, energyTypeHash: 1 } };
  if (params.has("doublons")) {   // ⚠️ AJOUT (24/10/2026, « Diag d'abord ») : « Mod de santé » en DEUX versions dans le même jeu de plugs : 7411 (coût 3, +10) et 7451 (coût 4, autre description, bonus +5), comme les 107 noms à deux coûts du vrai compte
    o[7451] = { ...structuredClone(o[7411]), displayProperties: { name: "Mod de santé", description: "Ancienne version." }, investmentStats: [{ statTypeHash: 8801, value: 5 }], plug: { ...(o[7411].plug ?? {}), energyCost: { energyCost: 4, energyTypeHash: 1 } } } as never;
    (defs as Record<string, Record<number, { reusablePlugItems: Array<{ plugItemHash: number }> }>>)[T_PLUGSET][8301].reusablePlugItems.push({ plugItemHash: 7451 });
  }
} else
if (params.has("armures")) ajouterCatalogueArmures(defs);   // ⚠️ v0.4.12 : armures d'essai (casque, plastron exotique, marque de classe) pour la Forge des armures
if (params.has("saisons")) ajouterSaisons(defs, [5001, 5010, 5020, 5301]);   // ⚠️ v0.4.11 : filigrane et saison pour ces armes (Collection et Forge)
// FR : ⚠️ AJOUT (26/10/2026, règle de l'ajustement donnée par l'utilisateur : le « + » est PROPRE à la pièce) - deux ajustements de plus pour le casque a1 (dont le « + » est Mêlée, lu sur son ajustement équipé 7421) : 7423 « mêlée vers classe » et 7424 « Ajustement équilibré » (SANS aucune valeur dans le Manifest : son effet vient de la règle du jeu). Ajoutés ICI et non dans les données partagées, pour ne pas changer les autres tests. / EN: ⚠️ ADDED - two more tuning plugs for helmet a1, local to this page.
if (params.has("armures")) {
  const o = (defs as Record<string, Record<number, unknown>>)[T_OBJET];
  const plugAjust = (nom: string, inv: Array<[number, number]>) => ({ displayProperties: { name: nom, icon: "/icons/x.png", description: "" }, plug: { plugCategoryIdentifier: "enhancements.v2_tuning" }, investmentStats: inv.map(([statTypeHash, value]) => ({ statTypeHash, value })) });
  o[7423] = plugAjust("Ajustement : mêlée vers classe", [[8802, 5], [8805, -5]]);
  o[7424] = plugAjust("Ajustement équilibré", []);
}
const { db } = creerFausseDb(defs);
(window as unknown as { __reseau: { url: string; methode: string }[] }).__reseau = [];   // ⚠️ v0.4.6 : journal des appels réseau (la Forge ne doit jamais écrire chez Bungie)
(window as unknown as { fetch: unknown }).fetch = async (url: string, init?: { method?: string }) => {
  (window as unknown as { __reseau: { url: string; methode: string }[] }).__reseau.push({ url: String(url), methode: init?.method ?? "GET" });
  const reponse = (corps: unknown, status = 200) => ({ ok: status === 200, status, json: async () => corps, text: async () => JSON.stringify(corps) });
  if (!String(url).includes("components=800")) return reponse({ ErrorCode: 1, Response: {} });
  if (params.get("collections") === "erreur") return reponse({ ErrorCode: 5, ErrorStatus: "SystemDisabled" }, 503);
  return reponse({ ErrorCode: 1, Response: { profileCollectibles: { data: { collectibles: { "9001": { state: 0 }, "9002": { state: 1 }, "9101": { state: 0 }, "9102": { state: 1 }, "9103": { state: 0 }, "9104": { state: 0 } } } }, characterCollectibles: { data: {} } } });
};
// FR : ⚠️ AJOUT (13/10/2026, v0.4.6) - `?inventaire` : de fausses ARMES POSSÉDÉES qui correspondent au faux Manifest : « Fusil à paliers » (5010, roll réel : Canon X, Chargeur X AMÉLIORÉ, Trait P, Crosse de contrepoids : une arme « améliorée »), « Fusil d'essai » (5001, sans roll réel connu), un lance-roquettes au Coffre et une ARMURE (écartée de la liste). / EN: ⚠️ ADDED - fake owned weapons matching the fake Manifest.
if (params.has("inventaire")) {
  const base = { stats: {}, isExotic: false, rarete: "Légendaire", icone: "https://www.bungie.net/icons/x.png" };
  (window as unknown as { __piecesForge: unknown[] }).__piecesForge = [
    { ...base, itemHash: 5010, itemInstanceId: "w1", nom: "Fusil à paliers", slot: "energie", typeArme: "Fusil à impulsion", origine: "titan", equipe: true, perkHashes: [6901, 6912, 6921, 6931], perksParColonne: [{ socketIndex: 1, hash: 6901 }, { socketIndex: 2, hash: 6912 }, { socketIndex: 3, hash: 6921 }, { socketIndex: 4, hash: 6931 }],
      // FR : ⚠️ v0.4.7 - perks DISPONIBLES sur cet exemplaire (composant 310) : canons : seulement le réel ; chargeurs : le réel (amélioré) et « Chargeur abandonné » ; traits : seulement le réel ; mods : la crosse et « Stabilité améliorée ». / EN: perks available on this instance.
      plugsDisponiblesParColonne: { 1: [6901], 2: [6912, 6913], 3: [6921], 4: [6931, 6933] } },
    { ...base, itemHash: 5001, itemInstanceId: "w2", nom: "Fusil d'essai", slot: "energie", typeArme: "Fusil à impulsion", origine: "coffre", perkHashes: [] },
    { ...base, itemHash: 5002, itemInstanceId: "w3", nom: "Lance-roquettes d'essai", slot: "lourde", typeArme: "Lance-roquettes", origine: "chasseur", isExotic: true, equipe: false, perkHashes: [], plugsDisponiblesParColonne: {} },   // ⚠️ v0.4.7 : `{}` = lu, aucune alternative sur cet exemplaire (w2 n'a PAS le champ : non lu)
    // FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - avec `?faconnees` : deux armes FAÇONNÉES (« forgées ») : w4 reconnue par le HASH connu du perk « Arme façonnée » (4029346515), w5 par son NOM (autre hash, défini dans le faux Manifest). / EN: ⚠️ ADDED - two crafted weapons: by known hash and by name.
    ...(params.has("faconnees") ? [
      { ...base, itemHash: 5001, itemInstanceId: "w4", nom: "Mitrailleuse façonnée d'essai", slot: "energie", typeArme: "Mitrailleuse", origine: "titan", perkHashes: [4029346515], plugsDisponiblesParColonne: {} },
      { ...base, itemHash: 5001, itemInstanceId: "w5", nom: "Fusil façonné d'essai (par le nom)", slot: "cinetique", typeArme: "Fusil à impulsion", origine: "coffre", perkHashes: [7777], plugsDisponiblesParColonne: {} },
    ] : []),
    // FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - avec `?exotique` (en plus de `?faconnees`) : une EXOTIQUE façonnée (w6), pour prouver que l'icône ne dépend pas de la rareté (quelques exotiques sont façonnables). / EN: ⚠️ ADDED - a crafted EXOTIC, to prove the icon does not depend on rarity.
    // FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - avec `?sansimage` (en plus de `?faconnees`) : une arme façonnée SANS image (w7) : la liste de la Forge réserve la place de la vignette et l'icône s'y pose quand même. / EN: ⚠️ ADDED - a crafted weapon without image.
    ...(params.has("faconnees") && params.has("sansimage") ? [
      { ...base, icone: undefined, itemHash: 5001, itemInstanceId: "w7", nom: "Façonnée sans image", slot: "energie", typeArme: "Fusil à impulsion", origine: "titan", perkHashes: [4029346515], plugsDisponiblesParColonne: {} },
    ] : []),
    // FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - avec `?faconnees&pool` : « Mesure corrective d'essai » (w8, hash 5020) : arme façonnée dont la liste directe n'a qu'un perk par colonne alors qu'un pool existe derrière ; son roll réel : un canon, un chargeur et un trait 1 du pool, un trait 2 (7249) ABSENT de toute source. / EN: ⚠️ ADDED - a crafted weapon hiding a pool behind a one-perk list.
    ...(params.has("faconnees") && params.has("pool") ? [
      { ...base, itemHash: 5020, itemInstanceId: "w8", nom: "Mesure corrective d'essai", slot: "energie", typeArme: "Mitrailleuse", origine: "titan", equipe: true, perkHashes: [7201, 7212, 7222, 7231, 7249, 4029346515], perksParColonne: [{ socketIndex: 0, hash: 7201 }, { socketIndex: 1, hash: 7212 }, { socketIndex: 2, hash: 7222 }, { socketIndex: 3, hash: 7231 }, { socketIndex: 4, hash: 7249 }, { socketIndex: 5, hash: 4029346515 }], plugsDisponiblesParColonne: { 1: [7212], 2: [7222], 3: [7231], 4: [7249] } },
    ] : []),
    ...(params.has("faconnees") && params.has("exotique") ? [
      { ...base, itemHash: 5002, itemInstanceId: "w6", nom: "Exotique façonnée d'essai", slot: "lourde", typeArme: "Lance-roquettes", origine: "chasseur", isExotic: true, perkHashes: [4029346515], plugsDisponiblesParColonne: {} },
    ] : []),
    { ...base, itemHash: 5005, itemInstanceId: "c1", nom: "Casque d'essai", slot: "casque", origine: "arcaniste", classeRequise: "arcaniste", perkHashes: [] },
    // FR : ⚠️ AJOUT (15/10/2026, v0.4.12) - avec `?armures` : trois ARMURES à emplacements (le casque « c1 » ci-dessus n'a AUCUN emplacement lu : cas limite) : a1 un casque de bastion de Titan (statistiques 20/10/15/8/12/25 ; un emplacement de mod à trois plugs, un d'ajustement à deux, un cosmétique), a2 un plastron EXOTIQUE d'Arcaniste au Coffre, a3 une marque de classe de Chasseur (rien de modifiable). / EN: ⚠️ ADDED - three armor pieces with sockets.
    ...(params.has("armures") ? [
      { ...base, itemHash: 5301, itemInstanceId: "a1", nom: "Casque de bastion d'essai", slot: "casque", classeRequise: "titan", origine: "titan", equipe: true, typeArmure: "Casque", stats: { sante: 20, melee: 10, grenade: 15, super: 8, classe: 12, arme: 25 }, perkHashes: [7401, 7402, 7411, 7421, 7431], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7402 }, { socketIndex: 2, hash: 7411 }, { socketIndex: 3, hash: 7421 }, { socketIndex: 4, hash: 7431 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7402], 2: [7411, 7412, 7413], 3: [7421, 7422, 7423, 7424], 4: [7431, 7432, 7433] } },
      { ...base, itemHash: 5302, itemInstanceId: "a2", nom: "Plastron exotique d'essai", slot: "torse", classeRequise: "arcaniste", origine: "coffre", isExotic: true, rarete: "Exotique", typeArmure: "Torse", stats: { sante: 30, melee: 5, grenade: 5, super: 20, classe: 10, arme: 20 }, perkHashes: [7401, 7441, 7412], perksParColonne: [{ socketIndex: 0, hash: 7401 }, { socketIndex: 1, hash: 7441 }, { socketIndex: 2, hash: 7412 }], plugsDisponiblesParColonne: { 0: [7401], 1: [7441], 2: [7411, 7412, 7413] } },
      { ...base, itemHash: 5303, itemInstanceId: "a3", nom: "Marque de classe d'essai", slot: "marque", classeRequise: "chasseur", origine: "chasseur", typeArmure: "Marque de classe", perkHashes: [7441], perksParColonne: [{ socketIndex: 0, hash: 7441 }], plugsDisponiblesParColonne: { 0: [7441] } },
    ] : []),
  ];
}
// FR : ⚠️ AJOUT (24/10/2026) - `?inventaire&armures&energie` : de l'ÉNERGIE sur les armures d'essai (capacité et énergie utilisée de l'exemplaire) pour le DIAGNOSTIC des coûts d'énergie des mods. Le casque « a1 » : capacité 10, 3 utilisés (= son mod de santé à 3 + son ajustement à 0 : AUCUN écart) ; le plastron « a2 » : capacité 11 (Artifice), 4 utilisés alors que son mod de classe coûte 1 (ÉCART voulu) ; la marque « a3 » et le casque « c1 » : aucune énergie (non lue). EN: ⚠️ ADDED - energy on the test armors for the energy-cost diagnostic.
if (params.has("energie") && params.has("inventaire")) {
  const energieParId: Record<string, { capacite: number; utilisee: number }> = { a1: { capacite: 10, utilisee: 3 }, a2: { capacite: 11, utilisee: 4 } };
  const w = window as unknown as { __piecesForge: Array<{ itemInstanceId?: string }> };
  w.__piecesForge = w.__piecesForge.map((p) => (p.itemInstanceId && energieParId[p.itemInstanceId] ? { ...p, energie: energieParId[p.itemInstanceId] } : p));
}
const membership = params.has("sansCompte") ? null : { membershipId: "1", membershipType: 3, displayName: "Test#1234" };
// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - avec `?inventaire` : (1) un ESPION joue le rôle de la page principale : il lit le MÊME magasin de simulations (`useSimulations`) et applique la simulation à un build qui contient « Fusil à paliers » ; il montre combien d'armes sont simulées et les perks qui seraient comptés dans le score : si l'espion réagit au clic dans la Forge, le score réagit aussi ; (2) `onAjouterAuBuild` / `idsDansBuild` / `onRetour` sont fournis et notés (`window.__ajoutsBuild`, `window.__retours`) ; (3) `?cible=1` : la page arrive comme depuis un bouton « Forge » (arme w1 à ouvrir). / EN: ⚠️ ADDED - spy component reading the same simulation store, and callbacks for the Build/return buttons.
const w1 = ((window as unknown as { __piecesForge?: Record<string, unknown>[] }).__piecesForge ?? [])[0];
function Espion() {
  const simulations = useSimulations();
  const a1 = ((window as unknown as { __piecesForge?: Record<string, unknown>[] }).__piecesForge ?? []).find((p) => p.itemInstanceId === "a1");   // ⚠️ v0.4.12 : une ARMURE dans le build surveillé
  const b = appliquerSimulations({ ...structuredClone(demoBuild), armes: [w1 as never], ...(a1 ? { armure: [structuredClone(a1) as never] } : {}) }, simulations, db);   // ⚠️ 27/10/2026 : AVEC le Manifest, exactement comme `DashboardPage` (les statistiques de l'armure simulée sont recalculées)
  const armure0 = (b as unknown as { armure?: { perkHashes: number[]; stats: Record<string, number> }[] }).armure?.[0];
  return <p data-espion="" data-simulees={nbArmesSimulees(b)} data-hashes={b.armes[0].perkHashes.join(",")} data-armure-hashes={armure0 ? armure0.perkHashes.join(",") : ""} data-armure-stats={armure0 ? JSON.stringify(armure0.stats) : ""} style={{ fontSize: "0.7rem" }}>espion : {nbArmesSimulees(b)} arme(s) simulée(s)</p>;
}
function Hote() {
  const inventaire = params.has("inventaire");
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [cible, setCible] = useState<{ piece: never; origine: "analyseur"; demande: number } | null>(params.has("cible") ? { piece: (((window as unknown as { __piecesForge?: { itemInstanceId?: string }[] }).__piecesForge ?? []).find((x) => x.itemInstanceId === params.get("cible")) ?? w1) as never, origine: "analyseur", demande: 1 } : null);
  const [demande, setDemande] = useState(params.has("demandeOptimiseur"));   // ⚠️ AJOUT (29/10/2026) : simule la demande de la page principale (bouton « Optimiseur » de Mon Build)
  const w = window as unknown as { __ajoutsBuild: string[]; __retours: number; __demandeTraitee?: number };
  w.__ajoutsBuild = w.__ajoutsBuild ?? []; w.__retours = w.__retours ?? 0;
  return (
    <div className="app-shell">
      <PageForge db={params.has("sansManifest") ? null : db} membership={membership}
        {...(inventaire ? { cible, onRetour: () => { w.__retours++; setCible(null); }, onAjouterAuBuild: (p: { itemInstanceId?: string }) => { w.__ajoutsBuild.push(p.itemInstanceId ?? "?"); setIds((x) => new Set([...x, p.itemInstanceId ?? "?"])); }, idsDansBuild: ids, demandeOptimiseur: demande, onDemandeOptimiseurTraitee: () => { w.__demandeTraitee = (w.__demandeTraitee ?? 0) + 1; setDemande(false); } } : {})} />
      {inventaire && <Espion />}
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<Hote />);
(window as unknown as { __pret: boolean }).__pret = true;

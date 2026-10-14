// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - page de test du VRAI composant `PageForge` (vue Collection des armes) avec un faux Manifest d'armes (`tests/logique/fixtures/fauxManifest.ts`) et une fausse API Bungie pour les collections. Variantes par l'adresse : `?modPrecoce` (une arme dont les mods précèdent des colonnes de perks), `?collections=erreur` (Bungie refuse), `?sansCompte` (non connecté), `?sansManifest` (Manifest non chargé), `?beaucoup` (130 armes en plus, pour la pagination).
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { useSimulations } from "../../src/lib/forge/storeSimulations";
import { appliquerSimulations, nbArmesSimulees } from "../../src/lib/forge/appliquerSimulation";
import { demoBuild } from "../../src/data/demoBuild";
import PageForge from "../../src/components/PageForge";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeModPrecoce, ajouterArmeRevisionAPaliers, T_OBJET } from "../logique/fixtures/fauxManifest";

const params = new URLSearchParams(location.search);
const defs = manifestArmesDeTest();
if (params.has("paliers") || params.has("inventaire")) ajouterArmeRevisionAPaliers(defs);
(defs as Record<string, Record<number, unknown>>)[T_OBJET][7777] = { displayProperties: { name: "Arme façonnée" }, itemTypeDisplayName: "Intrinsèque" };   // ⚠️ v0.4.10 : perk « Arme façonnée » d'un AUTRE hash (repli par le nom)   // ⚠️ v0.4.6 : `?inventaire` a besoin de l'arme 5010 (ses armes possédées y renvoient)   // ⚠️ AJOUT (13/10/2026, v0.4.4) : arme à perks améliorés (structure réelle)
if (params.has("modPrecoce")) ajouterArmeModPrecoce(defs);   // arme dont les mods sont AVANT des colonnes de perks
if (params.has("beaucoup")) {
  const modele = (defs[T_OBJET] as Record<number, Record<string, unknown>>)[5003];
  for (let i = 0; i < 130; i++) (defs[T_OBJET] as Record<number, unknown>)[7000 + i] = { ...modele, displayProperties: { name: `Arme numéro ${String(i).padStart(3, "0")}`, icon: "/icons/x.png", description: "" }, collectibleHash: 8000 + i };
}
const { db } = creerFausseDb(defs);
(window as unknown as { __reseau: { url: string; methode: string }[] }).__reseau = [];   // ⚠️ v0.4.6 : journal des appels réseau (la Forge ne doit jamais écrire chez Bungie)
(window as unknown as { fetch: unknown }).fetch = async (url: string, init?: { method?: string }) => {
  (window as unknown as { __reseau: { url: string; methode: string }[] }).__reseau.push({ url: String(url), methode: init?.method ?? "GET" });
  const reponse = (corps: unknown, status = 200) => ({ ok: status === 200, status, json: async () => corps, text: async () => JSON.stringify(corps) });
  if (!String(url).includes("components=800")) return reponse({ ErrorCode: 1, Response: {} });
  if (params.get("collections") === "erreur") return reponse({ ErrorCode: 5, ErrorStatus: "SystemDisabled" }, 503);
  return reponse({ ErrorCode: 1, Response: { profileCollectibles: { data: { collectibles: { "9001": { state: 0 }, "9002": { state: 1 } } } }, characterCollectibles: { data: {} } } });
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
    ...(params.has("faconnees") && params.has("exotique") ? [
      { ...base, itemHash: 5002, itemInstanceId: "w6", nom: "Exotique façonnée d'essai", slot: "lourde", typeArme: "Lance-roquettes", origine: "chasseur", isExotic: true, perkHashes: [4029346515], plugsDisponiblesParColonne: {} },
    ] : []),
    { ...base, itemHash: 5005, itemInstanceId: "c1", nom: "Casque d'essai", slot: "casque", origine: "arcaniste", classeRequise: "arcaniste", perkHashes: [] },
  ];
}
const membership = params.has("sansCompte") ? null : { membershipId: "1", membershipType: 3, displayName: "Test#1234" };
// FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - avec `?inventaire` : (1) un ESPION joue le rôle de la page principale : il lit le MÊME magasin de simulations (`useSimulations`) et applique la simulation à un build qui contient « Fusil à paliers » ; il montre combien d'armes sont simulées et les perks qui seraient comptés dans le score : si l'espion réagit au clic dans la Forge, le score réagit aussi ; (2) `onAjouterAuBuild` / `idsDansBuild` / `onRetour` sont fournis et notés (`window.__ajoutsBuild`, `window.__retours`) ; (3) `?cible=1` : la page arrive comme depuis un bouton « Forge » (arme w1 à ouvrir). / EN: ⚠️ ADDED - spy component reading the same simulation store, and callbacks for the Build/return buttons.
const w1 = ((window as unknown as { __piecesForge?: Record<string, unknown>[] }).__piecesForge ?? [])[0];
function Espion() {
  const simulations = useSimulations();
  const b = appliquerSimulations({ ...structuredClone(demoBuild), armes: [w1 as never] }, simulations);
  return <p data-espion="" data-simulees={nbArmesSimulees(b)} data-hashes={b.armes[0].perkHashes.join(",")} style={{ fontSize: "0.7rem" }}>espion : {nbArmesSimulees(b)} arme(s) simulée(s)</p>;
}
function Hote() {
  const inventaire = params.has("inventaire");
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [cible, setCible] = useState<{ piece: never; origine: "analyseur"; demande: number } | null>(params.has("cible") ? { piece: w1 as never, origine: "analyseur", demande: 1 } : null);
  const w = window as unknown as { __ajoutsBuild: string[]; __retours: number };
  w.__ajoutsBuild = w.__ajoutsBuild ?? []; w.__retours = w.__retours ?? 0;
  return (
    <div className="app-shell">
      <PageForge db={params.has("sansManifest") ? null : db} membership={membership}
        {...(inventaire ? { cible, onRetour: () => { w.__retours++; setCible(null); }, onAjouterAuBuild: (p: { itemInstanceId?: string }) => { w.__ajoutsBuild.push(p.itemInstanceId ?? "?"); setIds((x) => new Set([...x, p.itemInstanceId ?? "?"])); }, idsDansBuild: ids } : {})} />
      {inventaire && <Espion />}
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<Hote />);
(window as unknown as { __pret: boolean }).__pret = true;

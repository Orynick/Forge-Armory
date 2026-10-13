// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - page de test du VRAI composant `PageForge` (vue Collection des armes) avec un faux Manifest d'armes (`tests/logique/fixtures/fauxManifest.ts`) et une fausse API Bungie pour les collections. Variantes par l'adresse : `?modPrecoce` (une arme dont les mods précèdent des colonnes de perks), `?collections=erreur` (Bungie refuse), `?sansCompte` (non connecté), `?sansManifest` (Manifest non chargé), `?beaucoup` (130 armes en plus, pour la pagination).
import { createRoot } from "react-dom/client";
import PageForge from "../../src/components/PageForge";
import { creerFausseDb, manifestArmesDeTest, ajouterArmeModPrecoce, ajouterArmeRevisionAPaliers, T_OBJET } from "../logique/fixtures/fauxManifest";

const params = new URLSearchParams(location.search);
const defs = manifestArmesDeTest();
if (params.has("paliers")) ajouterArmeRevisionAPaliers(defs);   // ⚠️ AJOUT (13/10/2026, v0.4.4) : arme à perks améliorés (structure réelle)
if (params.has("modPrecoce")) ajouterArmeModPrecoce(defs);   // arme dont les mods sont AVANT des colonnes de perks
if (params.has("beaucoup")) {
  const modele = (defs[T_OBJET] as Record<number, Record<string, unknown>>)[5003];
  for (let i = 0; i < 130; i++) (defs[T_OBJET] as Record<number, unknown>)[7000 + i] = { ...modele, displayProperties: { name: `Arme numéro ${String(i).padStart(3, "0")}`, icon: "/icons/x.png", description: "" }, collectibleHash: 8000 + i };
}
const { db } = creerFausseDb(defs);
(window as unknown as { fetch: unknown }).fetch = async (url: string) => {
  const reponse = (corps: unknown, status = 200) => ({ ok: status === 200, status, json: async () => corps, text: async () => JSON.stringify(corps) });
  if (!String(url).includes("components=800")) return reponse({ ErrorCode: 1, Response: {} });
  if (params.get("collections") === "erreur") return reponse({ ErrorCode: 5, ErrorStatus: "SystemDisabled" }, 503);
  return reponse({ ErrorCode: 1, Response: { profileCollectibles: { data: { collectibles: { "9001": { state: 0 }, "9002": { state: 1 } } } }, characterCollectibles: { data: {} } } });
};
const membership = params.has("sansCompte") ? null : { membershipId: "1", membershipType: 3, displayName: "Test#1234" };
createRoot(document.getElementById("racine")!).render(
  <div className="app-shell"><PageForge db={params.has("sansManifest") ? null : db} membership={membership} /></div>
);
(window as unknown as { __pret: boolean }).__pret = true;

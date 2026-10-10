// FR : Champ de recherche dans le Manifest - trouve un objet precis par nom,
// ou tout ce qui contient un mot (nom, description, perks, aspects,
// fragments, perks d'artefact...). Charge le Manifest a la demande (bouton
// dedie) plutot qu'au demarrage de l'appli, pour ne pas telecharger/parser
// ~100 Mo si l'utilisateur ne s'en sert pas dans cette session.
// EN: Manifest search field - finds a specific item by name, or anything
// containing a word (name, description, perks, aspects, fragments,
// artifact perks...). Loads the Manifest on demand (dedicated button)
// rather than on app startup, to avoid downloading/parsing ~100MB if the
// user doesn't need it this session.

import { useState } from "react";
import { Database } from "sql.js";
import { assurerManifestAJour } from "../lib/manifest/download";
import { rechercherDansManifest, ModeRecherche, ResultatRecherche } from "../lib/manifest/search";

const LIBELLES_TABLE: Record<string, string> = {
  DestinyInventoryItemDefinition: "Objet (arme/armure/aspect/fragment/mod)",
  DestinySandboxPerkDefinition: "Effet de perk",
};

export default function RechercheManifest() {
  const [db, setDb] = useState<Database | null>(null);
  const [etapeChargement, setEtapeChargement] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const [motCle, setMotCle] = useState("");
  const [mode, setMode] = useState<ModeRecherche>("plein_texte");
  const [resultats, setResultats] = useState<ResultatRecherche[]>([]);

  async function chargerManifest() {
    setErreur(null);
    try {
      const base = await assurerManifestAJour((etape) => setEtapeChargement(etape));
      setDb(base);
      setEtapeChargement(null);
    } catch (e) {
      setErreur((e as Error).message);
      setEtapeChargement(null);
    }
  }

  function lancerRecherche(valeur: string) {
    setMotCle(valeur);
    if (!db) return;
    setResultats(rechercherDansManifest(db, valeur, mode));
  }

  return (
    <div className="pilier-carte">
      <h3>
        <span>Recherche dans le Manifest</span>
        <span>{db ? "✅ chargé" : "◯ non chargé"}</span>
      </h3>

      {!db && (
        <>
          <p>
            Charge la base d'objets Bungie (armes, armures, aspects, fragments, perks
            d'artefact...) — environ 100 Mo la première fois, quasi instantané ensuite (mis en cache).
          </p>
          <button onClick={chargerManifest} disabled={!!etapeChargement}>
            {etapeChargement ?? "Charger le Manifest"}
          </button>
          {erreur && <p style={{ color: "#e08080" }}>⚠️ {erreur}</p>}
        </>
      )}

      {db && (
        <>
          <div style={{ display: "flex", gap: "0.75rem", margin: "0.5rem 0", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Ex: dévoration, caresse du ver, scorché..."
              value={motCle}
              onChange={(e) => lancerRecherche(e.target.value)}
              style={{ flex: 1, minWidth: "220px", padding: "0.4rem 0.6rem" }}
            />
            <label style={{ fontSize: "0.85rem" }}>
              <input
                type="radio"
                checked={mode === "nom"}
                onChange={() => {
                  setMode("nom");
                  if (motCle) setResultats(rechercherDansManifest(db, motCle, "nom"));
                }}
              />{" "}
              Nom uniquement
            </label>
            <label style={{ fontSize: "0.85rem" }}>
              <input
                type="radio"
                checked={mode === "plein_texte"}
                onChange={() => {
                  setMode("plein_texte");
                  if (motCle) setResultats(rechercherDansManifest(db, motCle, "plein_texte"));
                }}
              />{" "}
              Partout (nom, description, perks...)
            </label>
          </div>

          {motCle.length > 0 && motCle.length < 2 && (
            <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>Au moins 2 caractères pour lancer la recherche.</p>
          )}

          <ul>
            {resultats.slice(0, 50).map((r) => (
              <li key={`${r.table}-${r.hash}`}>
                <strong>{r.nom}</strong>{" "}
                <span style={{ fontSize: "0.75rem", color: "#7d7a70" }}>
                  ({LIBELLES_TABLE[r.table] ?? r.table} — correspondance : {r.champCorrespondant})
                </span>
                {r.description && (
                  <div style={{ fontSize: "0.8rem", color: "#b7b3a8" }}>{r.description}</div>
                )}
              </li>
            ))}
          </ul>
          {resultats.length > 50 && (
            <p style={{ fontSize: "0.8rem", color: "#7d7a70" }}>
              {resultats.length} résultats — seuls les 50 premiers sont affichés, affinez votre recherche.
            </p>
          )}
          {motCle.length >= 2 && resultats.length === 0 && <p>Aucun résultat pour « {motCle} ».</p>}
        </>
      )}
    </div>
  );
}

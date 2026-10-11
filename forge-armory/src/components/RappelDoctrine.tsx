// FR : ⚠️ AJOUT (26/08/2026) - extrait de PanneauLoadouts.tsx pour être
// réutilisé aussi dans ResumeBuild.tsx (bouton "Équiper le build en jeu",
// demande de l'utilisateur : même pop-up qu'après l'équipement d'un
// loadout, pour la cohérence). Auparavant, ResumeBuild se contentait
// d'une note textuelle discrète en fin de message ("⚠️ La Doctrine...
// n'est PAS équipée"), facilement noyée dans le reste du texte.
// EN: ⚠️ ADDED - extracted from PanneauLoadouts.tsx to be reused in
// ResumeBuild.tsx too, for consistency between the two equip buttons.

import { Database } from "sql.js";
import { SubclassConfig } from "../types/build";
import { obtenirDefinition } from "../lib/manifest/download";

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/**
 * FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - le build contient-il de la Doctrine à configurer à la
 * main (sous-classe, super, mêlée, grenade, compétence de classe, saut, aspects ou
 * fragments) ? C'est « autre chose que des armes et des armures » : la check-list ne
 * s'ouvre après « Équiper en jeu » QUE dans ce cas (demande de l'utilisateur) ; un build qui
 * n'a que des armes et des armures n'a rien à vérifier en jeu.
 * EN: ⚠️ ADDED - does the build hold Doctrine to configure by hand? The checklist opens
 * after "Equip in game" ONLY then.
 */
export function doctrineAConfigurer(subclass: SubclassConfig): boolean {
  return Boolean(
    subclass.element ||
      subclass.superHash ||
      subclass.meleeHash ||
      subclass.grenadeHash ||
      subclass.classeHash ||
      subclass.sautHash ||
      (subclass.aspectHashes ?? []).length > 0 ||
      (subclass.fragmentHashes ?? []).length > 0
  );
}

interface Props {
  /** FR : nom du build ou du loadout, pour personnaliser le message ("pour retrouver « X »"). / EN: build or loadout name, to personalize the message. */
  nomContexte: string;
  subclass: SubclassConfig;
  db: Database | null;
  onFermer: () => void;
}

/**
 * FR : rappel de la Doctrine à configurer MANUELLEMENT en jeu, affiché
 * après un équipement (depuis un loadout OU depuis "Mon Build"). L'API
 * n'équipe ni la sous-classe ni ses compétences (mécanisme de plugs,
 * distinct de l'équipement d'objets) : plutôt que de le mentionner en une
 * ligne vite oubliée, on liste précisément ce qui reste à faire, avec les
 * vrais noms résolus depuis le Manifest. Fermeture par un bouton "C'est
 * équipé" volontairement placé EN BAS : il faut avoir parcouru la liste
 * pour l'atteindre.
 * EN: reminder of the subclass config to set MANUALLY in game, shown
 * after equipping. The API equips neither the subclass nor its abilities.
 */
export default function RappelDoctrine({ nomContexte, subclass, db, onFermer }: Props) {
  const nom = (hash?: number) => {
    if (!hash || !db) return null;
    const d = obtenirDefinition<{ displayProperties?: { name?: string } }>(
      db,
      "DestinyInventoryItemDefinition",
      hash
    );
    return d?.displayProperties?.name ?? `(hash ${hash})`;
  };
  const lignes: { libelle: string; valeur: string | null }[] = [
    { libelle: "Sous-classe", valeur: subclass.element ? majuscule(subclass.element) : null },
    { libelle: "Super", valeur: nom(subclass.superHash) },
    { libelle: "Mêlée", valeur: nom(subclass.meleeHash) },
    { libelle: "Grenade", valeur: nom(subclass.grenadeHash) },
    { libelle: "Compétence de classe", valeur: nom(subclass.classeHash) },
    { libelle: "Saut", valeur: nom(subclass.sautHash) },
  ];
  const aspects = (subclass.aspectHashes ?? []).map(nom).filter(Boolean) as string[];
  const fragments = (subclass.fragmentHashes ?? []).map(nom).filter(Boolean) as string[];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,15,20,0.75)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "min(92vw, 460px)",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "#161922",
          border: "1px solid #3a3f4b",
          borderRadius: 10,
          padding: "1rem 1.25rem",
        }}
      >
        <strong style={{ fontSize: "0.95rem" }}>À configurer à la main en jeu</strong>
        <p style={{ fontSize: "0.75rem", color: "#b7b3a8", marginTop: "0.4rem" }}>
          L'équipement a été appliqué, mais l'API Bungie ne permet pas de changer la Doctrine
          depuis une application tierce. Voici ce qu'il reste à régler pour retrouver
          « {nomContexte} » :
        </p>

        <div style={{ fontSize: "0.8rem" }}>
          {lignes.filter((l) => l.valeur).map((l) => (
            <div key={l.libelle} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.2rem" }}>
              <span style={{ color: "#7d7a70", minWidth: "130px" }}>{l.libelle}</span>
              <span>{l.valeur}</span>
            </div>
          ))}
          {aspects.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.2rem" }}>
              <span style={{ color: "#7d7a70", minWidth: "130px" }}>Aspects</span>
              <span>
                {aspects.map((a) => (
                  <div key={a}>{a}</div>
                ))}
              </span>
            </div>
          )}
          {fragments.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "#7d7a70", minWidth: "130px" }}>Fragments</span>
              <span>
                {fragments.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </span>
            </div>
          )}
          {lignes.every((l) => !l.valeur) && aspects.length === 0 && fragments.length === 0 && (
            <p style={{ color: "#7d7a70", margin: 0 }}>
              {/* FR : ⚠️ CHANGÉ (01/10/2026) - sans Manifest, les noms ne se résolvent pas : le dire plutôt qu'affirmer que le build n'a pas de Doctrine. / EN: without the Manifest, names can't be resolved: say so. */}
              {!db && doctrineAConfigurer(subclass)
                ? "Chargez le Manifest pour afficher les noms de la Doctrine de ce build."
                : "Ce build ne contient aucune configuration de Doctrine enregistrée."}
            </p>
          )}
        </div>

        <button
          onClick={onFermer}
          style={{ marginTop: "1rem", width: "100%", fontSize: "0.85rem", padding: "0.4rem" }}
        >
          ✅ C'est équipé
        </button>
      </div>
    </div>
  );
}

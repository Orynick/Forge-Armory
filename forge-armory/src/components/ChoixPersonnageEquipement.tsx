// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - fenêtre affichée par « Équiper en jeu » quand le
// personnage ne peut pas être déterminé tout seul (demande de l'utilisateur) : elle EXPLIQUE
// la situation et invite à choisir le personnage. Trois situations (voir
// lib/loadouts/classePersonnage.ts) : build sans classe, plusieurs personnages de la classe
// du build, ou aucun personnage de cette classe sur le compte.
// EN: ⚠️ ADDED - window shown when "Equip in game" cannot pick the character by itself.

import IconeClasse from "./icones/IconeClasse";
import Modale from "./Modale";
import { CibleEquipement, NOMS_CLASSE, PersonnageCompte, classeDepuisNom } from "../lib/loadouts/classePersonnage";

interface Props {
  nomBuild: string;
  /** FR : toujours une des trois situations qui demandent une fenêtre (jamais « direct »). / EN: never "direct". */
  cible: Exclude<CibleEquipement, { cas: "direct" }>;
  onChoisir: (personnage: PersonnageCompte) => void;
  onFermer: () => void;
}

export default function ChoixPersonnageEquipement({ nomBuild, cible, onChoisir, onFermer }: Props) {
  const explication =
    cible.cas === "sans-classe"
      ? `« ${nomBuild} » ne mentionne aucune classe de personnage : il a été enregistré sans classe choisie. Choisissez le personnage sur lequel l'équiper.`
      : cible.cas === "plusieurs"
        ? `« ${nomBuild} » est un build ${NOMS_CLASSE[cible.classe]}, et vous avez plusieurs personnages ${NOMS_CLASSE[cible.classe]}. Choisissez celui sur lequel l'équiper.`
        : `« ${nomBuild} » est un build ${NOMS_CLASSE[cible.classe]}, mais ce compte n'a aucun personnage ${NOMS_CLASSE[cible.classe]}. L'armure est propre à chaque classe : rien n'a été équipé.`;
  const candidats = cible.cas === "aucun" ? [] : cible.candidats;

  return (
    <Modale titre={cible.cas === "aucun" ? "Aucun personnage pour ce build" : "Choisir le personnage"} onFermer={onFermer} largeur={420} fermerSurFond>
      <p style={{ fontSize: "0.78rem", color: "#b7b3a8", margin: "0 0 0.8rem" }}>{explication}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {candidats.map((p) => {
          const classe = classeDepuisNom(p.classe);
          return (
            <button
              key={p.characterId}
              onClick={() => onChoisir(p)}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", textAlign: "left", padding: "0.45rem 0.7rem", fontSize: "0.85rem" }}
            >
              {classe && <IconeClasse classe={classe} taille={22} />}
              <span>{p.classe}</span>
              <span style={{ marginLeft: "auto", fontSize: "0.72rem", opacity: 0.72 }}>lumière {p.lumiere}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.9rem" }}>
        <button onClick={onFermer} style={{ fontSize: "0.78rem" }}>
          {cible.cas === "aucun" ? "Fermer" : "Annuler"}
        </button>
      </div>
    </Modale>
  );
}

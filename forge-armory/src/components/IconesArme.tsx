// FR : ⚠️ AJOUT (13/10/2026, v0.4.4) - LES QUATRE ICÔNES d'une arme sur sa carte de la Collection (demande de l'utilisateur du 13/10/2026), dans cet ordre : TYPE d'arme, ÉLÉMENT de dégâts, type de MUNITIONS, ANTICHAMPION (absent si l'arme n'en a pas). Les MÊMES composants et les MÊMES fonctions que l'en-tête de la popup « Détails » : on ne recalcule rien de plus.
// Un texte caché (lecteurs d'écran) reprend ce que disaient avant les mots de la carte : type, emplacement, élément ; le champion est nommé aussi. Chaque icône est dans un `<span data-icone="...">` pour les tests. EN: ⚠️ ADDED - the four icons of a weapon card: type, element, ammo, anti-champion; same components and functions as the Details popup header.
import type { CSSProperties } from "react";
import type { Database } from "sql.js";
import IconeTypeArme from "./icones/IconeTypeArme";
import IconeAntiChampion, { LIBELLES_CHAMPION } from "./icones/IconeAntiChampion";
import { IconeElementArme, IconeMunitionArme } from "./RenduTextePerk";
import { obtenirAntiChampion, obtenirCategoriesObjet, obtenirTypeMunition } from "../lib/manifest/doctrine";
import { obtenirSecoursTypeArme } from "../lib/manifest/typeArmeSecours";

const MASQUE_VISUEL: CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

interface Props {
  db: Database | null;
  itemHash: number;
  /** FR : type lisible de l'arme (« Fusil à impulsion »). / EN: readable weapon type. */
  type?: string;
  slot?: string;
  /** FR : lu par les lecteurs d'écran à la place des mots retirés de la carte. / EN: read by screen readers instead of the words removed from the card. */
  texteAccessible: string;
  tailleType?: number;
  taille?: number;
}

export default function IconesArme({ db, itemHash, type, slot, texteAccessible, tailleType = 26, taille = 17 }: Props) {
  const champion = db ? obtenirAntiChampion(db, itemHash) : undefined;
  const enveloppe: CSSProperties = { display: "inline-flex", alignItems: "center" };
  return (
    <span data-icones-arme="" style={{ display: "inline-flex", alignItems: "center", gap: "6px", margin: "2px 0" }}>
      <span data-icone="type" style={enveloppe}>
        <IconeTypeArme typeArme={type} slot={slot} munition={db ? obtenirTypeMunition(db, itemHash) : undefined} categories={db ? obtenirCategoriesObjet(db, itemHash) : undefined} {...(db ? obtenirSecoursTypeArme(db, itemHash) : {})} taille={tailleType} />
      </span>
      <span data-icone="element" style={enveloppe}><IconeElementArme db={db} itemHash={itemHash} taille={taille} /></span>
      <span data-icone="munition" style={enveloppe}><IconeMunitionArme db={db} itemHash={itemHash} taille={taille} /></span>
      {champion && <span data-icone="champion" style={enveloppe}><IconeAntiChampion type={champion} taille={taille} /></span>}
      <span style={MASQUE_VISUEL}>{texteAccessible}{champion ? `, anti-${LIBELLES_CHAMPION[champion]}` : ""}</span>
    </span>
  );
}

// FR : ⚠️ AJOUT (15/10/2026, v0.4.12) - la résolution d'une statistique d'armure PAR SON NOM, déplacée ici depuis `lib/bungie/inventaire.ts` (où elle était privée) pour être partagée avec la Forge des armures (`lib/forge/armure.ts`). Comportement STRICTEMENT identique : plutôt que de deviner les hash des 6 stats Armor 3.0 (risque de se tromper sans pouvoir tester en direct), on résout le NOM de chaque stat via le Manifest et on le compare à ces libellés connus ; ça s'auto-corrige tant que Bungie ne renomme pas complètement les stats. EN: ⚠️ MOVED here from the inventory module so the armor Forge can share it; behaviour unchanged.
import type { StatKey } from "../../types/build";
import { normaliser } from "./search";

const LIBELLES_STAT: Record<StatKey, string[]> = {
  sante: ["sante", "health"],
  melee: ["corps a corps", "melee"],
  grenade: ["grenade"],
  super: ["super"],
  classe: ["classe", "class", "competence de classe", "class ability"],
  arme: ["arme", "armes", "weapon", "weapons"],
};

export function resoudreStatKey(nomStat: string): StatKey | undefined {
  const nomNormalise = normaliser(nomStat);
  for (const [cle, libelles] of Object.entries(LIBELLES_STAT) as [StatKey, string[]][]) {
    if (libelles.some((l) => nomNormalise.includes(l))) return cle;
  }
  return undefined;
}

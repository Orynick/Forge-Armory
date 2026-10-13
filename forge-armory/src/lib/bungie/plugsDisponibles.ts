// FR : ⚠️ AJOUT (13/10/2026, v0.4.7) - PERKS DISPONIBLES SUR UN EXEMPLAIRE (demande de l'utilisateur du 13/10/2026 : « rien ne m'indique les perks disponibles sur l'arme mais que je n'ai pas sélectionnés »). Bungie les donne dans le composant 310 (« plugs réutilisables ») du profil : pour chaque exemplaire et chaque prise, la liste des perks que CET exemplaire peut porter dans cette prise (par exemple les canons ou
// chargeurs entre lesquels on peut basculer en jeu) ; le perk équipé en fait normalement partie. Forme attendue (documentation de l'API, NON VÉRIFIÉE sur le compte de l'utilisateur) : `profil.itemComponents.reusablePlugs.data[itemInstanceId].plugs[indexDePrise] = [{ plugItemHash, canInsert, enabled }, …]`.
// Cette fonction PURE lit cette forme avec tolérance : donnée absente ou mal formée → `undefined` (« on ne sait pas », jamais « aucun ») ; sinon une table index de prise → hashes distincts. Un exemplaire sans plug réutilisable donne une table VIDE (on SAIT qu'il n'y en a pas). EN: ⚠️ ADDED - reads an instance's available plugs per socket from profile component 310, tolerantly; undefined when the data is absent.
export type PlugsDisponibles = Record<number, number[]>;

export function extrairePlugsDisponibles(brut: unknown): PlugsDisponibles | undefined {
  if (typeof brut !== "object" || brut === null) return undefined;
  const plugs = (brut as { plugs?: unknown }).plugs;
  if (typeof plugs !== "object" || plugs === null) return undefined;
  const sortie: PlugsDisponibles = {};
  for (const [cle, liste] of Object.entries(plugs as Record<string, unknown>)) {
    const index = Number(cle);
    if (!Number.isInteger(index) || index < 0 || !Array.isArray(liste)) continue;
    const hashes = [...new Set(liste.map((p) => (p as { plugItemHash?: unknown } | null)?.plugItemHash).filter((h): h is number => typeof h === "number" && Number.isInteger(h) && h > 0))];
    if (hashes.length > 0) sortie[index] = hashes;
  }
  return sortie;
}

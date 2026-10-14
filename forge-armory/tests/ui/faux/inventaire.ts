// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - FAUX inventaire pour les tests d'interface : remplace `src/lib/bungie/inventaire.ts` (qui interroge Bungie) dans les pages de test. Cinq pièces : deux EXEMPLAIRES de « Arme A » (hash 111, Solaire : un sur le Titan, un au Coffre), « Arme B » (222, cinétique, Chasseur) et « Casque C » (333, armure, Arcaniste).
// EN: ⚠️ ADDED - fake inventory replacing the Bungie-calling module in UI test pages.
const base = { stats: {}, perkHashes: [], isExotic: false, rarete: "Légendaire" };
export const PIECES = [
  { ...base, itemHash: 111, itemInstanceId: "a1", nom: "Arme A", slot: "cinetique", typeArme: "Fusil automatique", origine: "titan", equipe: true },
  { ...base, itemHash: 111, itemInstanceId: "a2", nom: "Arme A", slot: "cinetique", typeArme: "Fusil automatique", origine: "coffre" },
  { ...base, itemHash: 222, itemInstanceId: "b1", nom: "Arme B", slot: "energie", typeArme: "Fusil à impulsion", origine: "chasseur", equipe: false },
  { ...base, itemHash: 333, itemInstanceId: "c1", nom: "Casque C", slot: "casque", origine: "arcaniste", classeRequise: "arcaniste", equipe: false },
  { ...base, itemHash: 444, itemInstanceId: "d1", nom: "Arme D", slot: "lourde", typeArme: "Lance-roquettes", origine: "coffre" },   // ⚠️ une AUTRE arme dans le Coffre (cinétique), pour que filtrer le Coffre change quelque chose de visible
];
// FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - avec `?faconnees` dans l'adresse : quatre pièces de plus avec une IMAGE (les cinq d'origine n'en ont pas) : deux armes FAÇONNÉES (f1 chez le Titan, f2 au Coffre : perk équipé « Arme façonnée », 4029346515), une arme NORMALE à image (n1, témoin) et une ARMURE qui porte le même perk (f3 : l'icône ne concerne que les armes, elle ne doit pas la recevoir). Sans le paramètre, rien ne change. / EN: ⚠️ ADDED - with `?faconnees`: two crafted weapons, a normal weapon with an image, and an armor carrying the same plug.
const img = { icone: "https://www.bungie.net/icons/x.png" };
export const FACONNEES = [
  { ...base, ...img, perkHashes: [4029346515], itemHash: 111, itemInstanceId: "f1", nom: "Arme façonnée du Titan", slot: "cinetique", typeArme: "Fusil automatique", origine: "titan" },
  { ...base, ...img, perkHashes: [4029346515], itemHash: 444, itemInstanceId: "f2", nom: "Arme façonnée du Coffre", slot: "lourde", typeArme: "Lance-roquettes", origine: "coffre" },
  { ...base, ...img, itemHash: 111, itemInstanceId: "n1", nom: "Arme normale à image", slot: "cinetique", typeArme: "Fusil automatique", origine: "titan" },
  { ...base, ...img, perkHashes: [4029346515], itemHash: 333, itemInstanceId: "f3", nom: "Casque piégé", slot: "casque", origine: "arcaniste", classeRequise: "arcaniste", equipe: false },
];
// FR : ⚠️ CHANGÉ (13/10/2026, v0.4.6) - une page de test peut définir `window.__piecesForge` pour fournir SES armes possédées (vue Inventaire de la Forge) ; sinon ce sont les cinq pièces ci-dessus. / EN: ⚠️ CHANGED - a test page can supply its own pieces.
export async function listerObjetsPossedes() { const autres = (window as unknown as { __piecesForge?: unknown[] }).__piecesForge; const avec = typeof location !== "undefined" && /faconnees/.test(location.search); return { pieces: autres ?? (avec ? [...PIECES, ...FACONNEES] : PIECES), statsNonResolues: [], diagnosticStats: null }; }

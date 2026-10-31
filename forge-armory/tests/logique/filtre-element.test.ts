// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - test du FILTRE D'ÉLÉMENT DE DÉGÂTS (recherche Manifest et Inventaire) : `obtenirElementFiltre` sur une fausse base qui se lit comme la vraie (prepare, bind, step, getAsObject, free), et les libellés du filtre.
// EN: ⚠️ ADDED - test of the damage element filter on a fake database read like the real one.
import { obtenirElementFiltre, ELEMENTS_FILTRE } from "../../src/lib/manifest/doctrine";
import { hashVersIdSqlite } from "../../src/lib/manifest/download";
import { LIBELLES_ELEMENT_FR } from "../../src/data/libellesElements";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 300)); };
// Bungie : defaultDamageType None=0, Kinetic=1, Arc=2, Thermal(Solaire)=3, Void(Abyssal)=4, Raid=5, Stasis=6, Strand=7 ; itemType Armor=2, Weapon=3, Subclass=16
const DEFS: Record<number, { itemType: number; defaultDamageType: number }> = {
  1001: { itemType: 3, defaultDamageType: 3 }, 1002: { itemType: 3, defaultDamageType: 2 }, 1003: { itemType: 3, defaultDamageType: 4 }, 1004: { itemType: 3, defaultDamageType: 6 }, 1005: { itemType: 3, defaultDamageType: 7 },
  1006: { itemType: 3, defaultDamageType: 1 }, 1007: { itemType: 2, defaultDamageType: 0 }, 1008: { itemType: 3, defaultDamageType: 5 }, 1009: { itemType: 16, defaultDamageType: 7 }, 1010: { itemType: 2, defaultDamageType: 1 }, 1011: { itemType: 3, defaultDamageType: 0 },
};
const table = new Map(Object.entries(DEFS).map(([h, d]) => [hashVersIdSqlite(+h), JSON.stringify(d)]));
let lectures = 0;
const fausseDb = { prepare: (sql: string) => { let id = 0; return { bind: (a: number[]) => { id = a[0]; lectures++; }, step: () => table.has(id), getAsObject: () => ({ json: table.get(id) }), free: () => {} }; } } as never;
const el = (h: number) => obtenirElementFiltre(fausseDb, h);
ok("les six éléments d'arme sont reconnus sans décalage : Solaire(3) · Cryo-électrique/Arc(2) · Abyssal(4) · Stase(6) · Filobscur(7), et le Cinétique(1) d'une ARME", [el(1001), el(1002), el(1003), el(1004), el(1005), el(1006)].join() === "solaire,arc,abyssal,stase,filobscur,cinetique", [el(1001), el(1002), el(1003), el(1004), el(1005), el(1006)]);
ok("une ARMURE n'a pas d'élément : elle n'apparaît sous aucun filtre, même si une donnée d'armure valait 1 (Cinétique) : le Cinétique n'est reconnu que pour une arme", el(1007) === null && el(1010) === null);
ok("le type de dégâts spécial « Raid » (5) n'est pas l'un des six éléments : aucun filtre ; une arme sans type de dégâts (0) non plus", el(1008) === null && el(1011) === null);
ok("une sous-classe (itemType 16) Filobscur est trouvée par le filtre Filobscur", el(1009) === "filobscur");
ok("un objet inconnu du Manifest renvoie null (aucune erreur)", el(9999) === null);
const avant = lectures; el(1001); el(1006); el(1007);
ok("les lectures sont mises en cache : relire les mêmes objets n'interroge plus la base", lectures === avant, [avant, lectures]);
ok("le filtre propose exactement six éléments, dans l'ordre : Cinétique, Solaire, Cryo-électrique, Abyssal, Stase, Filobscur", ELEMENTS_FILTRE.join() === "cinetique,solaire,arc,abyssal,stase,filobscur");
const libelle = (e: string) => (e === "cinetique" ? "Cinétique" : (LIBELLES_ELEMENT_FR as Record<string, string>)[e]);
ok("libellés affichés : « Cryo-électrique » pour l'élément Arc (et jamais « Arc », qui est l'arme), « Stase », « Filobscur » ; chaque libellé existe", ELEMENTS_FILTRE.map(libelle).join() === "Cinétique,Solaire,Cryo-électrique,Abyssal,Stase,Filobscur" && ELEMENTS_FILTRE.every((e) => Boolean(libelle(e))), ELEMENTS_FILTRE.map(libelle));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);

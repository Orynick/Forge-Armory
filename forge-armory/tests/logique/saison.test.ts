// FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - test de la LECTURE DE LA SAISON d'un objet (`lib/manifest/saison.ts`) : filigrane (image) + nom et numéro de saison, sans jamais planter ni deviner. Faux Manifest : objets avec ou sans filigrane, saison connue ou non, table des saisons absente ou qui lève une erreur. ⚠️ Le test ne dit RIEN de la présence réelle de ces champs dans le Manifest de l'utilisateur (non vérifiée : voir le diagnostic en `npm run dev`). EN: ⚠️ ADDED - test of the season lookup: watermark + name/number, never throws, never guesses.
import { obtenirSaisonObjet, libelleSaison, diagnosticSaisonObjet, attendreIndexSaisons, etatIndexSaisons } from "../../src/lib/manifest/saison";
import { creerFausseDb, T_OBJET } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const T_SAISON = "DestinySeasonDefinition";
const { db, requetes } = creerFausseDb({
  [T_OBJET]: {
    9101: { iconWatermark: "/img/saison-sorciere.png", seasonHash: 9001 },
    9102: { iconWatermark: "/img/saison-sans-nom.png" },
    9103: { displayProperties: { name: "Sans filigrane" }, seasonHash: 9001 },
    9104: { iconWatermarkShelved: "/img/saison-rangee.png", seasonHash: 9002 },
    9105: { iconWatermark: "/img/saison-orpheline.png", seasonHash: 9999 },
    9106: { iconWatermark: "/img/saison-sans-numero.png", seasonHash: 9003 },
  },
  [T_SAISON]: { 9001: { displayProperties: { name: "Saison de la Sorcière" }, seasonNumber: 22 }, 9002: { displayProperties: { name: "Épisode : Échos" }, seasonNumber: 24 }, 9003: { displayProperties: { name: "Saison sans numéro" } } },
});
const a = obtenirSaisonObjet(db, 9101);
ok("un objet avec filigrane et saison : l'URL de l'image (chemin Bungie complété), le nom de la saison, son numéro et son identifiant", a?.filigrane === "https://www.bungie.net/img/saison-sorciere.png" && a.nom === "Saison de la Sorcière" && a.numero === 22 && a.hashSaison === 9001, a);
ok("le texte de survol dit le nom ET le numéro : « Saison de la Sorcière (saison 22) » ; sans numéro, le nom seul ; sans nom, un libellé neutre", libelleSaison(a!) === "Saison de la Sorcière (saison 22)" && libelleSaison(obtenirSaisonObjet(db, 9106)!) === "Saison sans numéro" && libelleSaison(obtenirSaisonObjet(db, 9102)!) === "Saison de l'objet", [libelleSaison(a!), libelleSaison(obtenirSaisonObjet(db, 9106)!), libelleSaison(obtenirSaisonObjet(db, 9102)!)]);
const b = obtenirSaisonObjet(db, 9102);
ok("un filigrane SANS saison connue : l'icône existe, sans nom ni numéro (on n'invente pas de saison)", b?.filigrane === "https://www.bungie.net/img/saison-sans-nom.png" && b.nom === undefined && b.numero === undefined && b.hashSaison === undefined, b);
ok("un objet SANS filigrane n'a pas d'icône, même s'il a une saison : on ne devine rien", obtenirSaisonObjet(db, 9103) === undefined);
const c = obtenirSaisonObjet(db, 9104);
ok("repli : sans filigrane principal, le filigrane « shelved » est utilisé (hypothèse non vérifiée sur les données réelles), avec sa saison", c?.filigrane === "https://www.bungie.net/img/saison-rangee.png" && c.nom === "Épisode : Échos" && c.numero === 24, c);
const d = obtenirSaisonObjet(db, 9105);
ok("une saison INTROUVABLE dans la table (identifiant orphelin) : l'icône s'affiche, sans nom", d?.filigrane === "https://www.bungie.net/img/saison-orpheline.png" && d.nom === undefined && d.hashSaison === 9999, d);
ok("sans Manifest, sans identifiant ou pour un objet inconnu : rien, sans erreur", obtenirSaisonObjet(null, 9101) === undefined && obtenirSaisonObjet(undefined, 9101) === undefined && obtenirSaisonObjet(db, undefined) === undefined && obtenirSaisonObjet(db, 123456789) === undefined);
const avant = requetes.length; obtenirSaisonObjet(db, 9101); obtenirSaisonObjet(db, 9103); obtenirSaisonObjet(db, 9105);
ok("MÉMOIRE : relire les mêmes objets n'interroge plus le Manifest (y compris un objet sans icône) : l'affichage d'une longue liste reste rapide", requetes.length === avant, [avant, requetes.length]);
// table des saisons qui PLANTE (absente d'un vrai Manifest : la requête lève une erreur)
const { db: dbBase } = creerFausseDb({ [T_OBJET]: { 9201: { iconWatermark: "/img/x.png", seasonHash: 9001 } } });
const dbSansTable = { ...(dbBase as object), prepare: (sql: string) => { if (/DestinySeasonDefinition/.test(sql)) throw new Error("no such table: DestinySeasonDefinition"); return (dbBase as unknown as { prepare: (s: string) => unknown }).prepare(sql); } } as never;
let e: ReturnType<typeof obtenirSaisonObjet>, plante = false;
try { e = obtenirSaisonObjet(dbSansTable, 9201); } catch { plante = true; }
ok("TABLE DES SAISONS ABSENTE (la requête lève une erreur) : aucune erreur n'en sort ; l'icône s'affiche sans nom", !plante && e?.filigrane === "https://www.bungie.net/img/x.png" && e.nom === undefined && e.hashSaison === 9001, e);
const dbQuiPlante = { prepare: () => { throw new Error("base illisible"); } } as never;
let f: ReturnType<typeof obtenirSaisonObjet> = undefined, plante2 = false;
try { f = obtenirSaisonObjet(dbQuiPlante, 9101); } catch { plante2 = true; }
ok("même une base entièrement illisible ne fait pas planter l'affichage : pas d'icône, pas d'erreur", !plante2 && f === undefined);
ok("DIAGNOSTIC (npm run dev) : il dit le seasonHash, le nom et le numéro de la saison et le filigrane ; pour un objet SANS filigrane, il écrit « ABSENT » (c'est ce qui permet de contrôler les données de l'utilisateur) ; pour une saison orpheline, « introuvable »", /seasonHash = 9001 → Saison de la Sorcière, n° 22 \| filigrane : \/img\/saison-sorciere\.png/.test(diagnosticSaisonObjet(db, 9101)) && /seasonHash = 9001 .* filigrane : ABSENT/.test(diagnosticSaisonObjet(db, 9103)) && /introuvable dans la table des saisons/.test(diagnosticSaisonObjet(db, 9105)) && /seasonHash = ABSENT → — \| filigrane : \/img\/saison-sans-nom\.png/.test(diagnosticSaisonObjet(db, 9102)), [diagnosticSaisonObjet(db, 9101), diagnosticSaisonObjet(db, 9103), diagnosticSaisonObjet(db, 9105)]);
// ---------- ⚠️ AJOUT (14/10/2026, soir) : NOMMER une saison par les AUTRES objets de même filigrane (l'objet n'a pas de `seasonHash`) ----------
(async () => {
  const defs = {
    [T_OBJET]: {
      9301: { iconWatermark: "/img/w1.png", seasonHash: 9001 },                                        // référence de la saison 9001 (nommée par son propre seasonHash)
      9302: { iconWatermark: "/img/w1.png" },                                                          // SANS seasonHash : doit être nommé d'après 9301
      9303: { iconWatermarkShelved: "/img/w2r.png", seasonHash: 9002 },                                // référence via le filigrane « shelved »
      9304: { iconWatermark: "/img/w2.png", iconWatermarkShelved: "/img/w2r.png", seasonHash: 9002 },
      9305: { iconWatermark: "/img/w2.png" },                                                          // sans seasonHash, filigrane principal
      9306: { iconWatermarkShelved: "/img/w2r.png" },                                                  // sans seasonHash, seulement « shelved »
      9307: { iconWatermark: "/img/w3.png" },                                                          // orphelin : aucun autre objet de ce filigrane n'a de saison
      9308: { iconWatermark: "/img/w4.png", seasonHash: 9001 },                                        // vote : 1 voix pour 9001…
      9309: { iconWatermark: "/img/w4.png", seasonHash: 9002 },
      9310: { iconWatermark: "/img/w4.png", seasonHash: 9002 },                                        // …2 voix pour 9002
      9311: { iconWatermark: "/img/w4.png" },                                                          // sans seasonHash : la saison la plus fréquente (9002) l'emporte
    },
    [T_SAISON]: { 9001: { displayProperties: { name: "Saison de la Sorcière" }, seasonNumber: 22 }, 9002: { displayProperties: { name: "Épisode : Échos" }, seasonNumber: 24 } },
  };
  const { db: d1, requetes: r1 } = creerFausseDb(defs);
  const avantBalayage = obtenirSaisonObjet(d1, 9302);
  ok("AVANT la fin du balayage : l'objet sans seasonHash a déjà son icône (le filigrane), sans nom ; l'affichage n'attend pas le balayage", avantBalayage?.filigrane === "https://www.bungie.net/img/w1.png" && avantBalayage.nom === undefined && etatIndexSaisons(d1).etat === "encours", [avantBalayage, etatIndexSaisons(d1)]);
  await attendreIndexSaisons(d1);
  const e = etatIndexSaisons(d1);
  ok("le balayage se termine et compte ce qu'il a lu : 6 objets du Manifest ont un seasonHash, 4 filigranes sont reliés à une saison (w1, w2r, w2, w4)", e.etat === "fini" && e.objetsAvecSaison === 6 && e.filigranes === 4, e);
  const b = obtenirSaisonObjet(d1, 9302);
  ok("APRÈS le balayage : l'objet sans seasonHash est NOMMÉ d'après les autres objets de même filigrane (nom, numéro, saison, marqué « déduit »)", b?.nom === "Saison de la Sorcière" && b.numero === 22 && b.hashSaison === 9001 && b.nomDeduit === true, b);
  const c5 = obtenirSaisonObjet(d1, 9305), c6 = obtenirSaisonObjet(d1, 9306);
  ok("le filigrane principal ET le filigrane « shelved » servent à relier un objet à sa saison (9305 par w2, 9306 par w2r)", c5?.nom === "Épisode : Échos" && c6?.nom === "Épisode : Échos" && c5.nomDeduit === true && c6.nomDeduit === true, [c5, c6]);
  const o = obtenirSaisonObjet(d1, 9307);
  ok("un objet ORPHELIN (aucun autre objet de son filigrane n'a de saison) garde son icône SANS nom : on ne devine rien", o?.filigrane === "https://www.bungie.net/img/w3.png" && o.nom === undefined && o.nomDeduit === undefined, o);
  const v = obtenirSaisonObjet(d1, 9311);
  ok("quand deux saisons se disputent une image, la plus FRÉQUENTE l'emporte (2 objets contre 1 : « Épisode : Échos »)", v?.nom === "Épisode : Échos" && v.hashSaison === 9002, v);
  const propre = obtenirSaisonObjet(d1, 9308);
  ok("un objet qui a SON PROPRE seasonHash n'est jamais renommé par le vote (9308 reste « Saison de la Sorcière » même si son filigrane est majoritairement 9002), et n'est pas marqué « déduit »", propre?.nom === "Saison de la Sorcière" && propre.nomDeduit === undefined, propre);
  const requetesAvant = r1.length; obtenirSaisonObjet(d1, 9302); obtenirSaisonObjet(d1, 9305); obtenirSaisonObjet(d1, 9311);
  ok("MÉMOIRE : après le balayage, relire des objets déjà nommés n'interroge plus le Manifest ; le balayage ne s'est lancé qu'UNE fois", r1.length === requetesAvant && r1.filter((q) => /LIKE/.test(q)).length === 1, [requetesAvant, r1.length, r1.filter((q) => /LIKE/.test(q)).length]);
  const diag = diagnosticSaisonObjet(d1, 9302), diagOrphelin = diagnosticSaisonObjet(d1, 9307);
  ok("DIAGNOSTIC : il dit la saison déduite du filigrane et l'état du balayage (6 objets avec seasonHash, 4 filigranes reliés) ; pour un orphelin il écrit « AUCUNE »", /déduite des autres objets de même filigrane : Saison de la Sorcière, n° 22/.test(diag) && /balayage des saisons : fini, 6 objet\(s\) du Manifest ont un seasonHash, 4 filigrane\(s\)/.test(diag) && /déduite des autres objets de même filigrane : AUCUNE/.test(diagOrphelin), [diag, diagOrphelin]);
  // balayage qui PLANTE (requête refusée) : l'affichage continue, sans nom
  const { db: base } = creerFausseDb({ [T_OBJET]: { 9401: { iconWatermark: "/img/z.png" } } });
  const dbBalayageHS = { ...(base as object), prepare: (sql: string) => { if (/LIKE/.test(sql)) throw new Error("requête refusée"); return (base as unknown as { prepare: (q: string) => unknown }).prepare(sql); } } as never;
  let plante = false, z: ReturnType<typeof obtenirSaisonObjet>;
  try { z = obtenirSaisonObjet(dbBalayageHS, 9401); await attendreIndexSaisons(dbBalayageHS); z = obtenirSaisonObjet(dbBalayageHS, 9401); } catch { plante = true; }
  ok("BALAYAGE QUI PLANTE (requête refusée par la base) : aucune erreur n'en sort, le balayage se termine à vide, l'icône reste affichée sans nom", !plante && etatIndexSaisons(dbBalayageHS).etat === "fini" && z!?.filigrane === "https://www.bungie.net/img/z.png" && z!?.nom === undefined, [plante, etatIndexSaisons(dbBalayageHS)]);
  // aucun seasonHash nulle part (cas possible du Manifest de l'utilisateur) : fini à vide
  const { db: sans } = creerFausseDb({ [T_OBJET]: { 9501: { iconWatermark: "/img/y.png" }, 9502: { iconWatermark: "/img/y.png" } } });
  obtenirSaisonObjet(sans, 9501); await attendreIndexSaisons(sans);
  ok("AUCUN objet du Manifest n'a de seasonHash : le balayage finit à vide (0 objet, 0 filigrane), les icônes restent sans nom, et le diagnostic le dit", etatIndexSaisons(sans).objetsAvecSaison === 0 && etatIndexSaisons(sans).filigranes === 0 && obtenirSaisonObjet(sans, 9502)?.nom === undefined && /0 objet\(s\) du Manifest ont un seasonHash/.test(diagnosticSaisonObjet(sans, 9501)), etatIndexSaisons(sans));
  console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);
})();

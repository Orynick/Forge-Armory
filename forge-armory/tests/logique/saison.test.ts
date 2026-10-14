// FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - test de la LECTURE DE LA SAISON d'un objet (`lib/manifest/saison.ts`) : filigrane (image) + nom et numéro de saison, sans jamais planter ni deviner. Faux Manifest : objets avec ou sans filigrane, saison connue ou non, table des saisons absente ou qui lève une erreur. ⚠️ Le test ne dit RIEN de la présence réelle de ces champs dans le Manifest de l'utilisateur (non vérifiée : voir le diagnostic en `npm run dev`). EN: ⚠️ ADDED - test of the season lookup: watermark + name/number, never throws, never guesses.
import { obtenirSaisonObjet, libelleSaison, diagnosticSaisonObjet } from "../../src/lib/manifest/saison";
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
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);

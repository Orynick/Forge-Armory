// FR : ⚠️ AJOUT (23/10/2026, TODO n°23, branche draft-update-triomphes) - TESTS du MODÈLE de la page « Accomplissements » (`src/lib/bungie/sceaux.ts`) : regroupement des triomphes du compte PAR SCEAU (arbre « Triumphs » du Manifest × état des records du profil, composant 900), compteurs globaux, recherche avancée (guillemets, +, -, casse) et tri (progression/nom). Fausse base = `creerFausseDb` (même mécanisme que les autres tests), profil simulé. AUCUNE donnée réelle de Bungie : ces tests prouvent la LOGIQUE.
// ⚠️ CORRIGÉ (23/10/2026, TODO n°23, « Aucun sceau trouvé ») : sections 8–11 testent le CORRECTIF — racine des sceaux lue dans le profil (`recordSealsRootNodeHash`, comme DIM), secours par constantes (Seals 2018 / Titles / Triumphs), records lus aussi dans les sous-nœuds, et scan global hors Collections/Lore/Metrics en dernier recours.
// EN: tests of the Accomplishments page model (grouping account triumphs by seal, global counters, advanced search, sorting). Fake DB = `creerFausseDb`, simulated profile. No real Bungie data: these tests prove the LOGIC. FIX (2026-10-23): sections 8–11 test the fix — seals root read from the profile (`recordSealsRootNodeHash`, like DIM), constant fallbacks, records also read from sub-nodes, and a global scan excluding Collections/Lore/Metrics as a last resort.
import { regrouperParSceau, compteursGlobaux, filtrerSceaux, trierSceaux, HASH_RACINE_TRIOMPHES, type Sceau } from "../../src/lib/bungie/sceaux";
import { creerFausseDb, type Defs } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 800)); };

// ---------- fixture : arbre Triumphs + records + profil ----------
// Arbre : racine Triumphs (1163735237, scope 1) → catégorie « Raids » (9001) →
//   sceau « Trône brisé » (8001, completionRecordHash 7001) → records 6001, 6002, 6003
//   nœud intermédiaire « Donjons » (9002, SANS completionRecordHash) → sceau « Prophétie » (8002, completionRecordHash 7002) → records 6004, 6005
// Catégorie « Général » (9003) → sceau « Maître » (8003, completionRecordHash 7003) → record 6006 (portée PERSONNAGE : exclu)
const T_NOEUD = "DestinyPresentationNodeDefinition", T_RECORD = "DestinyRecordDefinition";
const noeud = (hash: number, nom: string, extra: Record<string, unknown> = {}) => ({
  displayProperties: { name: nom, description: "", icon: `/icons/noeud-${hash}.png` }, ...extra,
});
const record = (hash: number, nom: string, description: string, extra: Record<string, unknown> = {}) => ({
  hash, displayProperties: { name: nom, description, icon: `/icons/record-${hash}.png` }, scope: 0, ...extra,
});

const defs: Defs = {
  [T_NOEUD]: {
    [HASH_RACINE_TRIOMPHES]: noeud(HASH_RACINE_TRIOMPHES, "Triumphs", { scope: 1, children: { presentationNodes: [{ presentationNodeHash: 9001 }, { presentationNodeHash: 9003 }] } }),
    9001: noeud(9001, "Raids", { children: { presentationNodes: [{ presentationNodeHash: 8001 }, { presentationNodeHash: 9002 }] } }),
    9002: noeud(9002, "Donjons", { children: { presentationNodes: [{ presentationNodeHash: 8002 }] } }),
    9003: noeud(9003, "Général", { children: { presentationNodes: [{ presentationNodeHash: 8003 }] } }),
    8001: noeud(8001, "Trône brisé", { completionRecordHash: 7001, children: { records: [{ recordHash: 6001 }, { recordHash: 6002 }, { recordHash: 6003 }] } }),
    8002: noeud(8002, "Prophétie", { completionRecordHash: 7002, children: { records: [{ recordHash: 6004 }, { recordHash: 6005 }] } }),
    8003: noeud(8003, "Maître des armes", { completionRecordHash: 7003, children: { records: [{ recordHash: 6006 }] } }),
  },
  [T_RECORD]: {
    // records de complétion des sceaux (titres)
    7001: record(7001, "Trône brisé", "Complétez le sceau.", { titleInfo: { hasTitle: true, titlesByGender: { Male: "Briseur de trône", Female: "Briseuse de trône" } }, completionInfo: { ScoreValue: 0 } }),
    7002: record(7002, "Prophétie", "Complétez le sceau.", { titleInfo: { hasTitle: true }, completionInfo: { ScoreValue: 0 } }),
    7003: record(7003, "Maître des armes", "Complétez le sceau.", { completionInfo: { ScoreValue: 0 } }), // PAS de titre
    // triomphes du sceau « Trône brisé »
    6001: record(6001, "On avait dit plus jamais !", "Terminez le donjon Trône brise en solo, sans mourir. Chute de la Maison.", { completionInfo: { ScoreValue: 500 }, objectiveHashes: [111] }),
    6002: record(6002, "Chute de la Maison", "Terminez le donjon.", { completionInfo: { ScoreValue: 250 } }),
    6003: record(6003, "Record masqué", "Description masquée.", { redacted: true }),
    // triomphes du sceau « Prophétie »
    6004: record(6004, "Solo sans mourir", "Terminez Prophétie en solo, sans mourir.", { completionInfo: { ScoreValue: 500 } }),
    6005: record(6005, "Vétéran", "Terminez Prophétie en mode vétéran.", { completionInfo: { ScoreValue: 100 } }),
    // triomphe de portée PERSONNAGE (doit être EXCLU de la page)
    6006: record(6006, "Triomphe perso", "Portée personnage.", { scope: 1, completionInfo: { ScoreValue: 999 } }),
  },
};
const { db } = creerFausseDb(defs);

// Profil (composant 900) : 6001 accompli (state=0, bit 4 à zéro), 6002 en cours (state=4, objectif partiel), 6004 accompli, 6005 absent (à obtenir), 7001 accompli (titre débloqué), 7002 absent (titre non débloqué).
// ⚠️ state est un CHAMP DE BITS : accompli = bit 4 (objectif non complété) À ZÉRO.
const profil = {
  Response: {
    profileRecords: {
      data: {
        records: {
          "6001": { state: 0, objectives: [{ progress: 1, completionValue: 1, complete: true }] },
          "6002": { state: 4, objectives: [{ progress: 3, completionValue: 10, complete: false }] },
          "6004": { state: 0 },
          "7001": { state: 0 },
        },
      },
    },
  },
};

const sceaux = regrouperParSceau(db, profil);

// ---------- 1. regroupement par sceau ----------
ok("REGROUPEMENT : 2 sceaux UTILES trouvés (un par nœud avec completionRecordHash ET au moins un triomphe de portée profil), triés par nom FR (Prophétie, Trône brisé) — le sceau « Maître des armes » (triomphe perso exclu) est OMIS",
  sceaux.length === 2 && sceaux.map((s) => s.nom).join("|") === "Prophétie|Trône brisé", sceaux.map((s) => s.nom));

const trone = sceaux.find((s) => s.nom === "Trône brisé")!;
ok("SCEAU « Trône brisé » : 2 triomphes (le record MASQUÉ 6003 est EXCLU), triés par nom FR, catégorie « Raids » remontée",
  trone.triomphes.length === 2 && trone.triomphes.map((t) => t.nom).join("|") === "Chute de la Maison|On avait dit plus jamais !" && trone.categorie === "Raids",
  { triomphes: trone.triomphes.map((t) => t.nom), categorie: trone.categorie });

const prophetie = sceaux.find((s) => s.nom === "Prophétie")!;
ok("SCEAU « Prophétie » : le nom du NŒUD INTERMÉDIAIRE « Donjons » (sans completionRecordHash) l'emporte comme libellé de regroupement (plus précis que la catégorie ancêtre « Raids »)",
  prophetie.categorie === "Donjons", prophetie.categorie);

const maitre = sceaux.find((s) => s.nom === "Maître des armes")!;
ok("PORTÉE PROFIL UNIQUEMENT : le triomphe de portée PERSONNAGE (6006, scope 1) est EXCLU → le sceau « Maître des armes » n'a AUCUN triomphe → le sceau est OMIS de la liste",
  !sceaux.some((s) => s.nom === "Maître des armes") || maitre === undefined, sceaux.map((s) => s.nom));

// ---------- 2. état des triomphes (champ de bits) ----------
const t6001 = trone.triomphes.find((t) => t.hash === 6001)!;
const t6002 = trone.triomphes.find((t) => t.hash === 6002)!;
ok("ÉTAT (champ de bits) : 6001 state=0 → accompli ; 6002 state=4 (objectif non complété) → NON accompli, avec son objectif partiel (3/10)",
  t6001.accompli === true && t6002.accompli === false && t6002.objectifs.length === 1 && t6002.objectifs[0].progression === 3 && t6002.objectifs[0].completionValue === 10 && t6002.objectifs[0].complete === false,
  { t6001, t6002 });
const t6005 = prophetie.triomphes.find((t) => t.hash === 6005)!;
ok("TRIOMPHE ABSENT DU PROFIL : « à obtenir » (affiché, accompli=false, JAMAIS masqué)", t6005.accompli === false && t6005.nom === "Vétéran", t6005);
ok("NOM/ICÔNE/DESCRIPTION depuis le Manifest FR ; score = completionInfo.ScoreValue",
  t6001.nom === "On avait dit plus jamais !" && t6001.description.includes("solo, sans mourir") && t6001.icone === "https://www.bungie.net/icons/record-6001.png" && t6001.score === 500,
  t6001);

// ---------- 3. titre du sceau ----------
ok("TITRE : « Trône brisé » a un titre (première valeur de titlesByGender = « Briseur de trône ») et il est DÉBLOQUÉ (record 7001 accompli, state=0) ; « Prophétie » a un titre (hasTitle sans titlesByGender → nom du record) NON débloqué (7002 absent du profil → titreDebloque === undefined, jamais estimé à false)",
  trone.titre === "Briseur de trône" && trone.titreDebloque === true && prophetie.titre === "Prophétie" && prophetie.titreDebloque === undefined,
  { trone: { titre: trone.titre, titreDebloque: trone.titreDebloque }, prophetie: { titre: prophetie.titre, titreDebloque: prophetie.titreDebloque } });

// ---------- 4. compteurs globaux ----------
const c = compteursGlobaux(sceaux);
ok("COMPTEURS GLOBAUX : 2 triomphes obtenus / 4 au total (6001, 6004 accomplis ; 6002 en cours, 6005 absent) ; score total = 500 + 500 = 1000 (somme des ScoreValue des triomphes OBTENUS uniquement)",
  c.obtenus === 2 && c.total === 4 && c.score === 1000, c);
const cSansScore = compteursGlobaux([{ hash: 1, nom: "S", triomphes: [{ hash: 1, nom: "T", description: "", accompli: true, objectifs: [] }] }]);
ok("SCORE INDISPONIBLE : si AUCUN triomphe accompli n'a de ScoreValue connu, le score est undefined (JAMAIS estimé à 0)", cSansScore.score === undefined && cSansScore.obtenus === 1, cSansScore);

// ---------- 5. recherche avancée (guillemets, +, -, casse) ----------
ok("RECHERCHE VIDE : tous les sceaux", filtrerSceaux(sceaux, "   ").length === sceaux.length);
const r1 = filtrerSceaux(sceaux, '"solo sans mourir"');
ok("RECHERCHE PHRASE EXACTE (insensible à la casse) : `\"solo sans mourir\"` ne matche QUE 6004 (nom exact ; la description de 6001 dit « en solo, sans mourir » — virgule absente → pas la phrase exacte) → 1 sceau",
  r1.length === 1 && r1[0].nom === "Prophétie" && r1[0].triomphes.length === 1 && r1[0].triomphes[0].hash === 6004, r1.map((s) => [s.nom, s.triomphes.map((t) => t.nom)]));
const r1b = filtrerSceaux(sceaux, "solo");
ok("RECHERCHE LIBRE (terme libre = contient, insensible à la casse) : « solo » retrouve 6001 (description) et 6004 (nom) → 2 sceaux",
  r1b.length === 2, r1b.map((s) => s.nom));
const r2 = filtrerSceaux(sceaux, '+"solo sans mourir" -gambit');
ok("RECHERCHE AVANCÉE (exemple de l'utilisateur) : `+\"solo sans mourir\" -gambit` → phrase exacte requise (1 triomphe), « gambit » exclu (présent dans AUCUN) → 1 sceau",
  r2.length === 1 && r2[0].nom === "Prophétie", r2.map((s) => s.nom));
const r3 = filtrerSceaux(sceaux, '+"sans mourir" -gambit "Chute de la Maison"');
ok("RECHERCHE AVANCÉE COMPLÈTE : `+\"sans mourir\" -gambit \"Chute de la Maison\"` → deux phrases exactes requises (toutes deux dans 6001 : description + nom), « gambit » exclu → 1 seul sceau (Trône brisé) avec UNIQUEMENT ce triomphe",
  r3.length === 1 && r3[0].nom === "Trône brisé" && r3[0].triomphes.length === 1 && r3[0].triomphes[0].hash === 6001, r3.map((s) => [s.nom, s.triomphes.map((t) => t.nom)]));
const r4 = filtrerSceaux(sceaux, "TRÔNE", { respecterCasse: true });
ok("CASSE : « TRÔNE » en respectant la casse ne trouve RIEN (les noms sont « Trône brisé » avec un T majuscule et « ô » minuscule) ; sans la casse il trouve le sceau",
  r4.length === 0 && filtrerSceaux(sceaux, "TRÔNE").length === 1, { avecCasse: r4.length, sansCasse: filtrerSceaux(sceaux, "TRÔNE").length });
const r5 = filtrerSceaux(sceaux, "vétéran");
ok("RECHERCHE DANS LA DESCRIPTION : « vétéran » (présent dans la description de 6005, pas dans son nom) retrouve le sceau Prophétie avec UNIQUEMENT ce triomphe",
  r5.length === 1 && r5[0].nom === "Prophétie" && r5[0].triomphes.length === 1 && r5[0].triomphes[0].hash === 6005, r5.map((s) => [s.nom, s.triomphes.map((t) => t.nom)]));
const r6 = filtrerSceaux(sceaux, "donjons");
ok("RECHERCHE DANS LE REGROUPEMENT : « donjons » (nom du nœud intermédiaire, présent dans le libellé de regroupement du sceau, pas dans un triomphe) remonte TOUS les triomphes du sceau concerné",
  r6.length === 1 && r6[0].nom === "Prophétie" && r6[0].triomphes.length === 2, r6.map((s) => [s.nom, s.triomphes.length]));

// ---------- 6. tri ----------
const tProg = trierSceaux(sceaux, "progression");
ok("TRI PAR PROGRESSION : le sceau 100 % complété (Trône brisé a 1/2… non ; Prophétie 1/2) — les ratios égaux (1/2 = 1/2) tombent sur le nom ; un sceau 0 % passerait APRÈS",
  tProg.map((s) => s.nom).join("|") === "Prophétie|Trône brisé", tProg.map((s) => s.nom));
const sceauxMelange = trierSceaux(
  [{ hash: 1, nom: "Zéro", triomphes: [{ hash: 1, nom: "a", description: "", accompli: false, objectifs: [] }, { hash: 2, nom: "b", description: "", accompli: false, objectifs: [] }] },
   { hash: 2, nom: "Complet", triomphes: [{ hash: 3, nom: "c", description: "", accompli: true, objectifs: [] }] },
   { hash: 3, nom: "Moitié", triomphes: [{ hash: 4, nom: "d", description: "", accompli: true, objectifs: [] }, { hash: 5, nom: "e", description: "", accompli: false, objectifs: [] }] }],
  "progression"
);
ok("TRI PAR PROGRESSION (détail) : « Complet » (100 %) d'abord, puis « Moitié » (50 %), puis « Zéro » (0 %) — complétés d'abord à égalité, nom en dernier recours",
  sceauxMelange.map((s) => s.nom).join("|") === "Complet|Moitié|Zéro", sceauxMelange.map((s) => s.nom));
ok("TRI PAR NOM : alphabétique FR (localeCompare « fr » : la casse et les espaces initiaux n’empêchent pas l’ordre)", trierSceaux([{ hash: 1, nom: "Zulu", triomphes: [] }, { hash: 2, nom: "alpha", triomphes: [] }, { hash: 3, nom: "Beta", triomphes: [] }], "nom").map((s) => s.nom).join("|") === "alpha|Beta|Zulu");

// ---------- 7. replis ----------
ok("REPLI SANS MANIFEST (db null) : liste VIDE (la page affichera « non disponible »)", regrouperParSceau(null, profil).length === 0);
ok("REPLI SANS PROFIL (records absents) : tous les triomphes « à obtenir », les compteurs à 0, les titres non débloqués",
  (() => { const s = regrouperParSceau(db, null); const cc = compteursGlobaux(s); return s.length === 2 && cc.obtenus === 0 && cc.total === 4 && s.every((x) => x.triomphes.every((t) => !t.accompli)) && s.every((x) => x.titreDebloque !== true); })(),
  regrouperParSceau(db, null).map((s) => [s.nom, s.titreDebloque]));
ok("REPLI : record sans nom dans le Manifest → hash brut affiché (jamais renommé à l'aveugle)",
  (() => { const d2: Defs = { [T_NOEUD]: { [HASH_RACINE_TRIOMPHES]: noeud(HASH_RACINE_TRIOMPHES, "Triumphs", { scope: 1, children: { presentationNodes: [{ presentationNodeHash: 8009 }] } }), 8009: noeud(8009, "Sceau X", { completionRecordHash: 7009, children: { records: [{ recordHash: 6100 }] } }) }, [T_RECORD]: { 7009: record(7009, "Sceau X", ""), 6100: { displayProperties: { name: "", description: "" } } } };
    const { db: db2 } = creerFausseDb(d2);
    const s = regrouperParSceau(db2, null);
    return s.length === 1 && s[0].triomphes[0].nom === "6100"; })());

// ---------- 8. CORRECTIF (23/10/2026) : racine des sceaux fournie par le PROFIL (`recordSealsRootNodeHash`) ----------
// Dans le vrai Manifest, les sceaux ne sont PAS sous la racine « Triumphs » : le profil fournit la racine via `recordSealsRootNodeHash` (champ officiel du composant 900, lu tel quel par DIM).
const HASH_RACINE_TITRES = 616318467, HASH_RACINE_SCEAUX_2018 = 1652422747, HASH_RACINE_LORE = 4077680549;
const defsProfilRacine: Defs = {
  [T_NOEUD]: {
    // racine « Titles » fournie par le profil : catégorie « Compétitif » → sceau « Iron Banner » ; sceau DIRECT « Risen » (sans catégorie)
    [HASH_RACINE_TITRES]: noeud(HASH_RACINE_TITRES, "Titles", { scope: 0, children: { presentationNodes: [{ presentationNodeHash: 9101 }, { presentationNodeHash: 8102 }] } }),
    9101: noeud(9101, "Compétitif", { children: { presentationNodes: [{ presentationNodeHash: 8101 }] } }),
    8101: noeud(8101, "Iron Banner", { completionRecordHash: 7101, children: { records: [{ recordHash: 6101 }, { recordHash: 6102 }, { recordHash: 6104 }] } }),
    8102: noeud(8102, "Risen", { completionRecordHash: 7102, children: { records: [{ recordHash: 6103 }] } }),
    // racine « Triumphs » PRÉSENTE mais SANS sceau (comme dans le vrai Manifest : catégories + triomphes nus)
    [HASH_RACINE_TRIOMPHES]: noeud(HASH_RACINE_TRIOMPHES, "Triumphs", { scope: 1, children: { presentationNodes: [{ presentationNodeHash: 9001 }] } }),
    9001: noeud(9001, "Raids", { children: { records: [{ recordHash: 6001 }] } }),  // triomphe « nu » : PAS un sceau
  },
  [T_RECORD]: {
    7101: record(7101, "Iron Banner", "Complétez le sceau.", { titleInfo: { hasTitle: true, titlesByGender: { Male: "Seigneur de Fer" } } }),
    7102: record(7102, "Risen", "Complétez le sceau.", { titleInfo: { hasTitle: true } }),
    6101: record(6101, "Dominez en bannière", "Gagnez en Bannière.", { completionInfo: { ScoreValue: 100 } }),
    6102: record(6102, "Triomphe IB", "Terminez des matchs.", { completionInfo: { ScoreValue: 50 } }),
    6103: record(6103, "Triomphe Risen", "Devenez Risen.", {}),
    6104: record(6104, "Triomphe perso IB", "Portée personnage.", { scope: 1 }),  // EXCLU
    6001: record(6001, "On avait dit plus jamais !", "Solo sans mourir.", { completionInfo: { ScoreValue: 500 } }),
  },
};
const { db: dbProfil } = creerFausseDb(defsProfilRacine);
const profilAvecRacine = { Response: { profileRecords: { data: { recordSealsRootNodeHash: HASH_RACINE_TITRES, records: { "6101": { state: 0 } } } } } };
const sceauxProfil = regrouperParSceau(dbProfil, profilAvecRacine);
ok("CORRECTIF RACINE PROFIL : `recordSealsRootNodeHash` (616318467 « Titles ») fourni par le profil → les sceaux sont trouvés (la racine « Triumphs » 1163735237, présente mais SANS sceau, ne gêne pas) : 2 sceaux (Iron Banner, Risen)",
  sceauxProfil.length === 2 && sceauxProfil.map((s) => s.nom).join("|") === "Iron Banner|Risen", sceauxProfil.map((s) => s.nom));
const ironBanner = sceauxProfil.find((s) => s.nom === "Iron Banner")!;
ok("CORRECTIF RACINE PROFIL : catégorie = « Compétitif » (nœud catégorie), le triomphe de PORTÉE PERSONNAGE (6104) est EXCLU → 2 triomphes ; 6101 accompli ; titre « Seigneur de Fer » lu",
  ironBanner.categorie === "Compétitif" && ironBanner.triomphes.length === 2 && ironBanner.triomphes.every((t) => t.hash !== 6104) && ironBanner.titre === "Seigneur de Fer" && ironBanner.triomphes.find((t) => t.hash === 6101)!.accompli === true,
  { categorie: ironBanner.categorie, triomphes: ironBanner.triomphes.map((t) => t.hash), titre: ironBanner.titre });
const risen = sceauxProfil.find((s) => s.nom === "Risen")!;
ok("CORRECTIF NOM DE RACINE : un sceau DIRECTEMENT sous la racine a categorie === undefined — le nom de la racine (« Titles ») n'est PAS utilisé comme regroupement",
  risen.categorie === undefined, risen.categorie);

// ---------- 9. CORRECTIF : secours par CONSTANTES quand le profil ne fournit pas la racine ----------
const defsSecours: Defs = {
  [T_NOEUD]: {
    [HASH_RACINE_SCEAUX_2018]: noeud(HASH_RACINE_SCEAUX_2018, "Seals", { children: { presentationNodes: [{ presentationNodeHash: 8201 }] } }),
    8201: noeud(8201, "Duality", { completionRecordHash: 7201, children: { records: [{ recordHash: 6201 }] } }),
  },
  [T_RECORD]: { 7201: record(7201, "Duality", ""), 6201: record(6201, "Solo Duality", "Terminez Duality en solo.", {}) },
};
const { db: dbSecours } = creerFausseDb(defsSecours);
const profilRacineInconnue = { Response: { profileRecords: { data: { recordSealsRootNodeHash: 424242, records: {} } } } };  // hash ABSENT du Manifest
const sceauxSecours = regrouperParSceau(dbSecours, profilRacineInconnue);
ok("CORRECTIF SECOURS : `recordSealsRootNodeHash` du profil ABSENT du Manifest (424242) → repli sur la constante « Seals » 2018 (1652422747) → 1 sceau (Duality)",
  sceauxSecours.length === 1 && sceauxSecours[0].nom === "Duality" && sceauxSecours[0].triomphes.length === 1, sceauxSecours.map((s) => s.nom));
ok("CORRECTIF SECOURS : profil SANS aucune racine → les constantes suffisent (la racine « Titles » 616318467, absente ici, et la racine « Triumphs » restent des candidats)",
  regrouperParSceau(dbSecours, null).length === 1);

// ---------- 10. CORRECTIF : records d'un sceau lus aussi dans ses SOUS-NŒUDS ----------
const defsSousNoeud: Defs = {
  [T_NOEUD]: {
    [HASH_RACINE_TRIOMPHES]: noeud(HASH_RACINE_TRIOMPHES, "Triumphs", { children: { presentationNodes: [{ presentationNodeHash: 9002 }] } }),
    9002: noeud(9002, "Donjons", { children: { presentationNodes: [{ presentationNodeHash: 8301 }] } }),
    8301: noeud(8301, "Prophétie", { completionRecordHash: 7301, children: { presentationNodes: [{ presentationNodeHash: 9301 }] } }),  // PAS de records directs
    9301: noeud(9301, "Sous-nœud", { children: { records: [{ recordHash: 6301 }, { recordHash: 6302 }] } }),
  },
  [T_RECORD]: {
    7301: record(7301, "Prophétie", ""), 6301: record(6301, "Solo sans mourir", "Solo.", {}), 6302: record(6302, "Vétéran", "Vétéran.", {}),
  },
};
const { db: dbSousNoeud } = creerFausseDb(defsSousNoeud);
const sceauxSousNoeud = regrouperParSceau(dbSousNoeud, null);
ok("CORRECTIF SOUS-NŒUD : un sceau dont les triomphes sont sous un SOUS-NŒUD (pas de `children.records` direct) les récupère quand même → 2 triomphes, catégorie « Donjons »",
  sceauxSousNoeud.length === 1 && sceauxSousNoeud[0].triomphes.map((t) => t.nom).join("|") === "Solo sans mourir|Vétéran" && sceauxSousNoeud[0].categorie === "Donjons",
  sceauxSousNoeud.map((s) => [s.nom, s.categorie, s.triomphes.map((t) => t.nom)]));

// ---------- 11. CORRECTIF : scan GLOBAL (dernier recours), hors Collections/Lore/Metrics ----------
const defsScan: Defs = {
  [T_NOEUD]: {
    555000: noeud(555000, "Racine inconnue", { children: { presentationNodes: [{ presentationNodeHash: 8401 }] } }),
    8401: noeud(8401, "Mystère", { completionRecordHash: 7401, children: { records: [{ recordHash: 6401 }] } }),
    8402: noeud(8402, "Sceau vide", { completionRecordHash: 7402 }),  // AUCUN record : omis
    [HASH_RACINE_LORE]: noeud(HASH_RACINE_LORE, "Légendes", { children: { presentationNodes: [{ presentationNodeHash: 9401 }] } }),
    9401: noeud(9401, "Livre", { completionRecordHash: 7403, children: { records: [{ recordHash: 6402 }] } }),  // sous Lore : EXCLU
  },
  [T_RECORD]: {
    7401: record(7401, "Mystère", ""), 6401: record(6401, "Triomphe mystère", "Obtenez-le.", {}),
    7402: record(7402, "Sceau vide", ""), 7403: record(7403, "Livre", ""), 6402: record(6402, "Page de lore", "Texte.", {}),
  },
};
const { db: dbScan } = creerFausseDb(defsScan);
const sceauxScan = regrouperParSceau(dbScan, null);  // profil SANS racine + AUCUNE constante présente → scan global
ok("CORRECTIF SCAN GLOBAL : aucune racine connue → scan de tous les nœuds : trouve le sceau sous une racine INCONNUE (Mystère), OMISSIONNE le nœud `completionRecordHash` SANS records (Sceau vide) et EXCLUT le sous-arbre Lore (4077680549)",
  sceauxScan.length === 1 && sceauxScan[0].nom === "Mystère" && sceauxScan[0].triomphes.length === 1 && sceauxScan[0].triomphes[0].hash === 6401,
  sceauxScan.map((s) => [s.nom, s.triomphes.map((t) => t.hash)]));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);

// FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « ok » à ma proposition d'OPTIMISEUR de statistiques d'armure, étape 1 : « vérifier les statistiques de base » - DIAGNOSTIC GLOBAL (mode développement) de toutes les armures chargées : pour chacune, les statistiques de BASE = statistiques réelles − effet du mod de statistique équipé − effet de l'ajustement équipé (l'équilibré compte +1 sur les trois plus petites, règle du jeu : `ajustement.ts`), puis la FORME de ces statistiques de base triées (attendue : 30 · 25 · 20 · 5 · 5 · 5, ou 30 · 25 · 20 · 0 · 0 · 0 sans maîtrise), l'archétype (plug d'archétype), la primaire, la secondaire, la tertiaire, et le rapport entre le « + » de l'ajustement et ces trois statistiques. L'optimiseur repose sur ce modèle (primaire 30, secondaire 25, tertiaire 20, trois statistiques non intrinsèques) : on le vérifie sur les données RÉELLES avant de bâtir dessus. Lecture seule : ne modifie rien.
// EN: ⚠️ ADDED - GLOBAL dev-mode diagnostic of every loaded armor piece: base stats (real stats minus the equipped stat mod and tuning), their sorted SHAPE (expected 30·25·20·5·5·5 or 30·25·20·0·0·0), archetype, primary/secondary/tertiary stats. Read-only.
import type { Database } from "sql.js";
import type { GearPiece, StatKey } from "../../types/build";
import { lirePlugArmure } from "./armure";
import { infoAjustement, troisNonIntrinseques } from "./ajustement";

const SLOTS = ["casque", "gants", "torse", "jambes", "marque"];
const STATS: StatKey[] = ["sante", "melee", "grenade", "super", "classe", "arme"];
const NOM: Record<StatKey, string> = { sante: "Santé", melee: "Mêlée", grenade: "Grenade", super: "Super", classe: "Classe", arme: "Arme" };
type Bloc = Record<StatKey, number>;

export interface LigneStatsBase {
  nom: string; slot: string; classe: string; lieu: string; exotique: boolean; palier: number | null;
  archetype: string | null;
  /** FR : statistiques RÉELLES retenues pour l'analyse : celles du JEU (`statsJeu`, API) quand elles sont complètes, sinon celles reconstruites par l'appli ; `null` si aucune n'est complète. */
  stats: Bloc | null;
  /** FR : ⚠️ AJOUT (28/10/2026) - d'où viennent `stats` : « jeu » (API), « appli » (reconstruites d'après le Manifest) ou `null`. */
  source: "jeu" | "appli" | null;
  /** FR : les statistiques reconstruites par l'appli et celles du jeu, telles quelles (complètes ou non), pour les COMPARER. */
  statsAppli: Partial<Bloc> | null; statsJeu: Partial<Bloc> | null;
  modStat: string | null; ajustement: string | null; genreAjustement: string | null;
  base: Bloc | null;
  /** FR : valeurs de base triées de la plus grande à la plus petite, jointes par « · » (ex. « 30·25·20·5·5·5 »). */
  forme: string | null;
  primaire: StatKey | null; secondaire: StatKey | null; tertiaire: StatKey | null;
  /** FR : le « + » de l'ajustement équipé (directionnel) ; `null` sinon. */
  plus: StatKey | null;
  conforme: boolean;
  raison: string;
}
export interface DiagnosticStatsBase {
  nbArmures: number;
  lignes: LigneStatsBase[];
  formes: Array<{ forme: string; n: number; conforme: boolean }>;
  archetypes: Array<{ archetype: string; n: number; paires: Array<{ primaire: StatKey; secondaire: StatKey; n: number }>; tertiaires: Array<{ tertiaire: StatKey; n: number }> }>;
  parPalier: Array<{ palier: string; n: number; conformes: number }>;
  rapportPlus: Record<"primaire" | "secondaire" | "tertiaire" | "non intrinsèque", number>;
  marques: { n: number; sansStats: number; avecStats: number };
  /** FR : ⚠️ AJOUT (28/10/2026) - les statistiques reconstruites par l'appli comparées à celles du jeu. */
  comparaison: { avecJeu: number; identiques: number; differentes: number; appliIncompletes: number; sansJeu: number };
  formesParPalier: Array<{ palier: string; formes: Array<{ forme: string; n: number }> }>;
}
const FORMES_OK = new Set(["30·25·20·5·5·5", "30·25·20·0·0·0"]);

/** FR : analyse UNE armure. / EN: analyses ONE armor piece. */
export function analyserStatsBase(db: Database, p: GearPiece): LigneStatsBase {
  let archetype: string | null = null, modStat: string | null = null, ajustement: string | null = null, genre: string | null = null;
  let effetMod: Partial<Bloc> = {}, effetAj: Partial<Bloc> | null = null;
  const complet = (s: Partial<Bloc> | undefined | null) => !!s && STATS.every((k) => typeof s[k] === "number");
  // FR : ⚠️ CHANGÉ (28/10/2026) - les statistiques du JEU (API, `statsJeu`) priment quand elles sont complètes : l'appli reconstruit les siennes d'après le Manifest, et le diagnostic réel de l'utilisateur a montré qu'elles sont incomplètes sur la plupart des armures du nouveau système.
  const source: LigneStatsBase["source"] = complet(p.statsJeu) ? "jeu" : complet(p.stats) ? "appli" : null;
  const lues = source !== null;
  const brut = ((source === "jeu" ? p.statsJeu : p.stats) ?? {}) as Partial<Bloc>;
  let plug: ReturnType<typeof lirePlugArmure> = null;
  for (const { hash } of p.perksParColonne ?? []) {
    plug = lirePlugArmure(db, hash);
    if (!plug) continue;
    if (plug.categoriePlug === "armor_archetypes") archetype = plug.nom;
    else if (plug.categoriePlug === "enhancements.v2_general") { modStat = plug.nom; effetMod = plug.stats; }
    else if (/tuning/i.test(plug.categoriePlug)) { ajustement = plug.nom; genre = infoAjustement(plug).genre; effetAj = plug.stats; }
  }
  const ligne: LigneStatsBase = { nom: p.nom ?? "?", slot: p.slot, classe: p.classeRequise ?? "?", lieu: p.origine ?? "?", exotique: !!p.isExotic, palier: p.gearTier ?? null, archetype, stats: lues ? (brut as Bloc) : null, source, statsAppli: ((p.statsReconstruites ?? p.stats) as Partial<Bloc> | undefined) ?? null,   // ⚠️ 28/10/2026 : côté « appli » = la RECONSTRUCTION d'après le Manifest (quand `stats` vient du jeu, elle est gardée dans `statsReconstruites`)
    statsJeu: (p.statsJeu as Partial<Bloc> | undefined) ?? null, modStat, ajustement, genreAjustement: genre, base: null, forme: null, primaire: null, secondaire: null, tertiaire: null, plus: genre === "directionnel" ? (STATS.find((k) => (effetAj?.[k] ?? 0) > 0) ?? null) : null, conforme: false, raison: "" };
  if (!lues) { ligne.raison = "statistiques incomplètes (non lues)"; return ligne; }
  // l'effet de l'ajustement : directionnel = ses valeurs ; équilibré = +1 sur les 3 plus petites (une fois le mod de statistique retiré) ; vide ou absent = rien
  let effet: Partial<Bloc> = {};
  if (genre === "directionnel") effet = effetAj ?? {};
  else if (genre === "equilibre") { for (const k of troisNonIntrinseques(brut, [effetMod]) ?? []) effet[k] = 1; }
  const base = {} as Bloc;
  for (const k of STATS) base[k] = (brut[k] as number) - (effetMod[k] ?? 0) - (effet[k] ?? 0);
  ligne.base = base;
  const tri = [...STATS].sort((a, b) => base[b] - base[a] || STATS.indexOf(a) - STATS.indexOf(b));
  ligne.forme = tri.map((k) => base[k]).join("·");
  const unique = (v: number) => (STATS.filter((k) => base[k] === v).length === 1 ? STATS.find((k) => base[k] === v) ?? null : null);
  ligne.primaire = unique(30); ligne.secondaire = unique(25); ligne.tertiaire = unique(20);
  ligne.conforme = FORMES_OK.has(ligne.forme);
  ligne.raison = ligne.conforme ? "" : `forme ${ligne.forme} hors modèle (attendu 30·25·20 puis trois stats à 5 ou à 0)`;
  return ligne;
}

export function construireDiagnosticStatsBase(db: Database, pieces: readonly GearPiece[]): DiagnosticStatsBase {
  const armures = pieces.filter((p) => SLOTS.includes(p.slot));
  const lignes = armures.map((p) => analyserStatsBase(db, p)).sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot) || a.nom.localeCompare(b.nom, "fr"));
  const parForme = new Map<string, number>();
  const parArch = new Map<string, { n: number; paires: Map<string, number>; tert: Map<StatKey, number> }>();
  const parPalier = new Map<string, { n: number; ok: number }>();
  const rapportPlus: DiagnosticStatsBase["rapportPlus"] = { primaire: 0, secondaire: 0, tertiaire: 0, "non intrinsèque": 0 };
  const marques = { n: 0, sansStats: 0, avecStats: 0 };
  const comparaison = { avecJeu: 0, identiques: 0, differentes: 0, appliIncompletes: 0, sansJeu: 0 };
  const formesPalier = new Map<string, Map<string, number>>();
  const complet = (s: Partial<Bloc> | null) => !!s && STATS.every((k) => typeof s[k] === "number");
  for (const l of lignes) {
    if (l.slot !== "marque") {
      if (l.statsJeu && Object.keys(l.statsJeu).length > 0) {
        comparaison.avecJeu++;
        if (!complet(l.statsAppli)) comparaison.appliIncompletes++;
        else if (complet(l.statsJeu) && STATS.every((k) => l.statsJeu![k] === l.statsAppli![k])) comparaison.identiques++;
        else comparaison.differentes++;
      } else comparaison.sansJeu++;
    }
    if (l.slot === "marque") { marques.n++; if (l.stats && STATS.every((k) => l.stats![k] === 0)) marques.sansStats++; else marques.avecStats++; continue; }
    if (l.forme) parForme.set(l.forme, (parForme.get(l.forme) ?? 0) + 1);
    const pal = l.palier === null ? "?" : String(l.palier);
    if (l.forme) { const m = formesPalier.get(pal) ?? new Map<string, number>(); m.set(l.forme, (m.get(l.forme) ?? 0) + 1); formesPalier.set(pal, m); }
    const e = parPalier.get(pal) ?? { n: 0, ok: 0 }; e.n++; if (l.conforme) e.ok++; parPalier.set(pal, e);
    if (l.conforme && l.primaire && l.secondaire && l.tertiaire) {
      const a = parArch.get(l.archetype ?? "(archétype non lu)") ?? { n: 0, paires: new Map(), tert: new Map() };
      a.n++; const cle = `${l.primaire}/${l.secondaire}`; a.paires.set(cle, (a.paires.get(cle) ?? 0) + 1); a.tert.set(l.tertiaire, (a.tert.get(l.tertiaire) ?? 0) + 1); parArch.set(l.archetype ?? "(archétype non lu)", a);
      if (l.plus) rapportPlus[l.plus === l.primaire ? "primaire" : l.plus === l.secondaire ? "secondaire" : l.plus === l.tertiaire ? "tertiaire" : "non intrinsèque"]++;
    }
  }
  return {
    nbArmures: armures.length, lignes,
    formes: [...parForme].map(([forme, n]) => ({ forme, n, conforme: FORMES_OK.has(forme) })).sort((a, b) => b.n - a.n || Number(b.conforme) - Number(a.conforme) || a.forme.localeCompare(b.forme)),   // ⚠️ déterministe : à égalité, les formes conformes d'abord, puis l'ordre alphabétique (jamais l'ordre des pièces)
    archetypes: [...parArch].map(([archetype, a]) => ({ archetype, n: a.n, paires: [...a.paires].map(([c, n]) => ({ primaire: c.split("/")[0] as StatKey, secondaire: c.split("/")[1] as StatKey, n })).sort((x, y) => y.n - x.n), tertiaires: [...a.tert].map(([tertiaire, n]) => ({ tertiaire, n })).sort((x, y) => y.n - x.n) })).sort((x, y) => y.n - x.n),
    parPalier: [...parPalier].map(([palier, e]) => ({ palier, n: e.n, conformes: e.ok })).sort((a, b) => a.palier.localeCompare(b.palier)),
    rapportPlus, marques, comparaison,
    formesParPalier: [...formesPalier].map(([palier, m]) => ({ palier, formes: [...m].map(([forme, n]) => ({ forme, n })).sort((a, b) => b.n - a.n || a.forme.localeCompare(b.forme)) })).sort((a, b) => a.palier.localeCompare(b.palier))
  };
}

const bloc = (b: Bloc | null) => (b ? STATS.map((k) => `${NOM[k]} ${b[k]}`).join(", ") : "illisibles");
export function formaterDiagnosticStatsBase(d: DiagnosticStatsBase): string {
  const t: string[] = [];
  t.push("Diagnostic : statistiques de base des armures");
  if (d.nbArmures === 0) { t.push("Aucune armure chargée : chargez votre inventaire d'armures, puis relancez ce diagnostic."); return t.join("\n"); }
  const hors = d.lignes.filter((l) => l.slot !== "marque" && !l.conforme);
  const nbHorsMarque = d.lignes.filter((l) => l.slot !== "marque").length;
  t.push("Méthode : statistiques de base = statistiques réelles − effet du mod de statistique équipé − effet de l'ajustement équipé (directionnel : ses valeurs ; équilibré : +1 sur les 3 plus petites) ; forme = valeurs de base triées de la plus grande à la plus petite ; attendu : 30·25·20·5·5·5 (maîtrisée) ou 30·25·20·0·0·0.");
  t.push(`Armures lues : ${d.nbArmures} dont ${d.marques.n} marque(s) de classe | hors marques : ${nbHorsMarque} | conformes au modèle : ${nbHorsMarque - hors.length} | HORS modèle : ${hors.length}`);
  const horsMarques = d.lignes.filter((l) => l.slot !== "marque");   // ⚠️ les marques de classe ont leur propre section (avec leur source)
  const c = d.comparaison, nSansStats = horsMarques.filter((l) => l.source === null).length;
  t.push(`Source des statistiques analysées : JEU (API) pour ${horsMarques.filter((l) => l.source === "jeu").length} pièce(s) | appli (reconstruites d'après le Manifest) pour ${horsMarques.filter((l) => l.source === "appli").length} | AUCUNE (incomplètes) pour ${nSansStats}${c.avecJeu === 0 ? " | ⚠️ aucune statistique du jeu n'a été lue (rechargez l'inventaire ; si le message persiste, l'API ne renvoie pas le composant des statistiques)" : ""}`);
  t.push(`Formes observées (hors marques) : ${d.formes.map((f) => `${f.forme} → ${f.n}${f.conforme ? "" : " (hors modèle)"}`).join(" | ") || "aucune"}`);
  t.push(`Par palier : ${d.parPalier.map((p) => `palier ${p.palier} : ${p.n} pièce(s), ${p.conformes} conforme(s)`).join(" | ") || "aucun"}`);
  t.push("");
  t.push("--- Archétypes (pièces conformes) : primaire/secondaire observés et tertiaire (tirée au hasard) ---");
  for (const a of d.archetypes) t.push(`${a.archetype} : ${a.n} pièce(s) | primaire/secondaire : ${a.paires.map((p) => `${NOM[p.primaire]}/${NOM[p.secondaire]} × ${p.n}`).join(", ")} | tertiaire : ${a.tertiaires.map((x) => `${NOM[x.tertiaire]} × ${x.n}`).join(", ")}`);
  if (d.archetypes.length === 0) t.push("aucune pièce conforme : rien à regrouper");
  t.push("");
  const r = d.rapportPlus, nPlus = r.primaire + r.secondaire + r.tertiaire + r["non intrinsèque"];
  t.push(`--- Le « + » de l'ajustement directionnel équipé (pièces conformes) : ${nPlus} pièce(s) : sur la PRIMAIRE × ${r.primaire} | la SECONDAIRE × ${r.secondaire} | la TERTIAIRE × ${r.tertiaire} | une stat NON intrinsèque × ${r["non intrinsèque"]} ---`);
  t.push(`--- Marques de classe : ${d.marques.n} | toutes les statistiques à 0 : ${d.marques.sansStats} | avec des statistiques : ${d.marques.avecStats} ---`);
  t.push("");
  t.push(`--- Statistiques reconstruites par l'appli COMPARÉES à celles du jeu (hors marques) : avec statistiques du jeu : ${c.avecJeu} | identiques : ${c.identiques} | DIFFÉRENTES : ${c.differentes} | incomplètes côté appli : ${c.appliIncompletes} | sans statistiques du jeu : ${c.sansJeu} ---`);
  const ecarts = d.lignes.filter((l) => l.slot !== "marque" && l.statsJeu && Object.keys(l.statsJeu).length > 0 && !(STATS.every((k) => l.statsAppli?.[k] === l.statsJeu?.[k])));
  const brutTxt = (b: Partial<Bloc> | null) => (b && Object.keys(b).length > 0 ? STATS.map((k) => `${NOM[k]} ${b[k] ?? "—"}`).join(", ") : "aucune");
  for (const l of ecarts.slice(0, 25)) t.push(`[${l.slot}] ${l.nom} | palier ${l.palier ?? "?"} | appli : ${brutTxt(l.statsAppli)} | jeu : ${brutTxt(l.statsJeu)}`);
  if (ecarts.length > 25) t.push(`… et ${ecarts.length - 25} autre(s)`);
  t.push("");
  t.push("--- Formes des statistiques de base PAR PALIER (hors marques ; les 8 plus fréquentes) ---");
  for (const p of d.formesParPalier) t.push(`palier ${p.palier} : ${p.formes.slice(0, 8).map((f) => `${f.forme} × ${f.n}`).join(" | ")}${p.formes.length > 8 ? ` | … ${p.formes.length - 8} autre(s) forme(s)` : ""}`);
  t.push("");
  t.push(`--- Marques de classe (${d.marques.n}) : [marque] nom | classe | lieu | palier | statistiques ---`);
  for (const l of d.lignes.filter((x) => x.slot === "marque")) t.push(`[marque] ${l.nom} | ${l.classe} | ${l.lieu} | palier ${l.palier ?? "?"} | ${bloc(l.stats)} | source ${l.source ?? "aucune"}`);
  t.push("");
  t.push(`--- Pièces HORS modèle (${hors.length}${hors.length > 40 ? ", les 40 premières" : ""}) ---`);
  for (const l of hors.slice(0, 40)) t.push(`[${l.slot}] ${l.nom} | ${l.classe} | ${l.lieu}${l.exotique ? " | exotique" : ""} | palier ${l.palier ?? "?"} | archétype ${l.archetype ?? "?"} | réelles : ${bloc(l.stats)} | mod de statistique : ${l.modStat ?? "aucun"} | ajustement : ${l.ajustement ?? "aucun"}${l.genreAjustement ? ` (${l.genreAjustement})` : ""} | base : ${bloc(l.base)} | ${l.raison}`);
  if (hors.length === 0) t.push("aucune : toutes les armures (hors marques) suivent le modèle");
  t.push("");
  t.push("--- Détail de toutes les pièces (hors marques) : [emplacement] nom | exotique | palier | archétype | forme | primaire/secondaire/tertiaire | « + » ---");
  for (const l of d.lignes.filter((x) => x.slot !== "marque")) t.push(`[${l.slot}] ${l.nom}${l.exotique ? " | exotique" : ""} | palier ${l.palier ?? "?"} | ${l.archetype ?? "?"} | ${l.forme ?? "?"} | ${l.primaire ? NOM[l.primaire] : "?"}/${l.secondaire ? NOM[l.secondaire] : "?"}/${l.tertiaire ? NOM[l.tertiaire] : "?"} | ${l.plus ? NOM[l.plus] : "—"}`);
  return t.join("\n");
}
export function diagnosticStatsBaseArmures(db: Database, pieces: readonly GearPiece[]): string {
  return formaterDiagnosticStatsBase(construireDiagnosticStatsBase(db, pieces));
}

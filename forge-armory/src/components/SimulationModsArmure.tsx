// FR : ⚠️ AJOUT (25/10/2026, branche draft-mod-armures), « La maquette me plait beaucoup ! » : la SIMULATION DES MODS d'une armure possédée, dans la pop-up Détails, telle que la MAQUETTE VALIDÉE la montre : les statistiques réelles → simulées, la JAUGE D'ÉNERGIE (capacité de la pièce, énergie utilisée), un RÉSUMÉ COMPACT (un seul mod de statistique, un seul ajustement, trois emplacements cumulables) avec un bouton « Modifier » qui ouvre les trois blocs : (1) la statistique (six statistiques × +5 / +10, avec leur coût), (2) l'ajustement (le « + » de la pièce, imposé sur une pièce légendaire, libre sur une exotique ; seul le « − » se choisit ; l'ajustement équilibré), (3) les mods CUMULABLES (une seule liste pour les trois emplacements, compteur « × N », coût de chaque mod). Les mods trop chers pour l'énergie restante, ou sans emplacement libre, sont grisés avec la raison.
// Toute la logique (rôles des emplacements, version standard des mods en double, énergie, répartition des cumulables) est dans `lib/forge/energieMods.ts` (pure, testée) ; ce composant ne fait qu'AFFICHER et appeler `onChanger` / `onReinitialiser`. Les autres emplacements modifiables de mods (raids, saison, artifice…) sont listés à part, jamais perdus.
// EN: ⚠️ ADDED - the armor-mod simulation of the Details pop-up as in the validated mockup: stats, ENERGY GAUGE, compact summary + "Edit" button opening three blocks (stat mod, tuning, stackable mods). All logic lives in `lib/forge/energieMods.ts`.
import { useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { GearPiece, StatKey } from "../types/build";
import { LIBELLES_STAT, ORDRE_STATS } from "../data/libellesUI";
import type { ColonneArmure, PlugArmure, StatsSimulees } from "../lib/forge/armure";
import type { ChoixColonne } from "../lib/forge/simulation";
import { infoAjustement } from "../lib/forge/ajustement";   // ⚠️ AJOUT (26/10/2026)
import { ajouterCumulable, coutMod, deltaEnergie, hashEffectif, modeleSimulation, retirerCumulable, tientDansLEnergie, versionsStandard, type Changement } from "../lib/forge/energieMods";
import BoutonAction from "./BoutonAction";   // ⚠️ AJOUT (30/10/2026) : bouton « Modifier » de la charte

interface Props {
  db: Database;
  piece: GearPiece;
  colonnes: ColonneArmure[];
  choix: Record<number, ChoixColonne> | undefined;
  stats: StatsSimulees;
  nbSimulees: number;
  /** FR : ⚠️ AJOUT (26/10/2026) - note de Mon Build (« N mods simulés — le score et Mon Build en tiennent compte »), affichée à droite du titre ; absente ailleurs. / EN: Mon Build's note shown next to the title. */
  noteScore?: string | null;
  onChanger: (changements: Changement[]) => void;
  onReinitialiser: () => void;
}

const OR = "#e8c547", BLEU = "#7aa2f7", VERT = "#7fd88f", ROUGE = "#e0a080", GRIS = "#9a968a", TEXTE = "#e8e6df";
const style = {
  puce: (actif: boolean, couleur: string, fond: string, bloque: boolean) => ({ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.15rem 0.55rem", borderRadius: 999, border: `1px solid ${actif ? couleur : "#2a2e38"}`, background: actif ? fond : "transparent", color: actif ? TEXTE : bloque ? "#8a8678" : "#b7b3a8", cursor: bloque ? "not-allowed" : "pointer" } as const),
  rond: { minWidth: 17, height: 17, boxSizing: "border-box", borderRadius: 999, border: "1px solid #3a3f4b", background: "#232733", color: TEXTE, fontSize: "0.68rem", display: "inline-flex", alignItems: "center", justifyContent: "center" } as const,
  titreBloc: { fontSize: "0.78rem", color: "#b7b3a8" } as const,
  note: { fontSize: "0.7rem", color: GRIS, margin: 0 } as const
};

export default function SimulationModsArmure({ db, piece, colonnes, choix, stats, nbSimulees, noteScore, onChanger, onReinitialiser }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [intensiteLocale, setIntensiteLocale] = useState<number | null>(null);
  const [plusLocal, setPlusLocal] = useState<StatKey | null>(null);   // ⚠️ 26/10/2026 : le « + » choisi sur une EXOTIQUE (libre)
  const m = useMemo(() => modeleSimulation(db, piece, colonnes, choix), [db, piece, colonnes, choix]);
  const e = m.energie;
  const raison = (delta: number): string => (!tientDansLEnergie(e, delta) ? `Pas assez d'énergie : il reste ${e?.restante ?? 0}` : "");
  const changer = (socketIndex: number, plugHash: number) => onChanger([{ socketIndex, plugHash }]);

  // ---------- bloc statistique ----------
  const st = m.statistique;
  const effStat = st ? hashEffectif(st.colonne, choix) : 0;
  const optStatCourante = st?.options.find((o) => o.plug.hash === effStat);
  const intensite = optStatCourante?.valeur ?? intensiteLocale ?? (st && st.intensites.length > 0 ? Math.max(...st.intensites) : 0);
  const optionStat = (stat: StatKey, v: number) => st?.options.find((o) => o.stat === stat && o.valeur === v);
  function clicStat(stat: StatKey) {
    if (!st) return;
    if (optStatCourante?.stat === stat) {   // même mod : simulé -> retour à l'équipé ; réel -> on le retire (plug vide)
      if (effStat !== st.colonne.equipe.hash) changer(st.colonne.socketIndex, st.colonne.equipe.hash);
      else if (st.vide) changer(st.colonne.socketIndex, st.vide.hash);
      return;
    }
    const cible = optionStat(stat, intensite);
    if (cible) changer(st.colonne.socketIndex, cible.plug.hash);
  }
  function clicIntensite(v: number) {
    setIntensiteLocale(v);
    if (!st || !optStatCourante) return;
    const cible = optionStat(optStatCourante.stat, v);
    if (cible && cible.plug.hash !== effStat) changer(st.colonne.socketIndex, cible.plug.hash);
  }

  // ---------- bloc ajustement ----------
  // FR : ⚠️ CHANGÉ (26/10/2026, règle du jeu donnée par l'utilisateur) - le « + » est PROPRE à la pièce (jamais modifiable) ; trois issues : Aucun, Équilibré (+1 sur les 3 statistiques non intrinsèques), « − » sur l'une des 5 autres statistiques. / EN: ⚠️ CHANGED - the "+" is the piece's own; three outcomes.
  const aj = m.ajustement;
  const effAj = aj ? hashEffectif(aj.colonne, choix) : 0;
  const genreAj = aj ? infoAjustement(aj.courant).genre : "vide";
  function choisirAjustement(plugHash: number) {
    if (!aj) return;
    if (plugHash === effAj) { if (effAj !== aj.colonne.equipe.hash) changer(aj.colonne.socketIndex, aj.colonne.equipe.hash); return; }
    changer(aj.colonne.socketIndex, plugHash);
  }
  const ajGratuit = aj ? [aj.vide, aj.equilibre, ...aj.directionnels.map((o) => o.plug)].every((p) => !p || coutMod(db, p.hash) === 0) : true;
  const texteEquilibre = m.nonIntrinseques ? m.nonIntrinseques.map((k) => `+1 ${LIBELLES_STAT[k]}`).join(", ") : "";
  const plusPiece = aj?.plusPiece ?? null;
  // FR : sur une EXOTIQUE le « + » est libre : celui du plug équipé tant qu'on n'en choisit pas un autre ; sur une légendaire c'est celui de la pièce.
  const plusChoisi: StatKey | null = aj ? (aj.plusLibre ? (plusLocal ?? infoAjustement(aj.courant).plus ?? null) : aj.plusPiece) : null;
  const moinsPour = aj ? aj.directionnels.filter((o) => o.plus === plusChoisi) : [];

  // ---------- bloc cumulables ----------
  const cu = m.cumulables;
  const nomsCumulables = cu ? [...cu.compte.entries()].map(([h, n]) => `${cu.options.find((o) => o.hash === h)?.nom ?? cu.colonnes[0].options.find((o) => o.hash === h)?.nom ?? "?"}${n > 1 ? ` × ${n}` : ""}`) : [];

  // ---------- les autres emplacements ----------
  function clicAutre(col: ColonneArmure, plug: PlugArmure) {
    const eff = hashEffectif(col, choix);
    if (plug.hash === eff) { if (eff !== col.equipe.hash) changer(col.socketIndex, col.equipe.hash); return; }
    changer(col.socketIndex, plug.hash);
  }

  const nbCumul = cu ? cu.colonnes.length : 0;
  const nbPlein = cu ? cu.colonnes.length - cu.nbLibres : 0;
  const energieTexte = e ? `${e.simulee} / ${e.capacite}${e.simulee !== e.reelle ? ` (réel : ${e.reelle})` : ""} · il reste ${e.restante}` : "";

  return (
    <div data-mods-armure-simulation="" data-vue={ouvert ? "ouverte" : "compacte"} style={{ marginBottom: "0.8rem" }}>
      <strong style={{ fontSize: "0.8rem" }}>🔨 Simuler les mods</strong>
      {noteScore && <span data-note-score="" style={{ fontSize: "0.72rem", color: OR, marginLeft: "0.4rem" }}>{noteScore}</span>}
      <p style={{ fontSize: "0.72rem", color: GRIS, margin: "0.2rem 0 0.4rem" }}>
        Un seul mod de statistique, un seul ajustement, et trois emplacements pour les mods cumulables. Cliquez le mod équipé, ou de nouveau le mod simulé, pour revenir à l'équipement réel. <strong>Rien n'est modifié en jeu</strong> : le score et Mon Build en tiennent compte en temps réel.
      </p>

      {/* FR : ⚠️ CHANGÉ (26/10/2026, demande de l'utilisateur : « affiche les stats sur 2 lignes, 3 stats par ligne » et « inutile d'afficher le total des stats ») - TROIS colonnes fixes, donc deux lignes (Santé, Mêlée, Grenade / Super, Classe, Arme), quelle que soit la largeur de la fenêtre, et AUCUN total. EN: ⚠️ CHANGED - always 3 columns (2 rows), no total. */}
      <div data-stats-armure="" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.3rem 0.8rem", margin: "0 0 0.5rem", fontSize: "0.78rem" }}>
        {ORDRE_STATS.map((cle) => {
          const reel = stats.reelles[cle] ?? 0, sim = stats.simulees[cle] ?? 0, d = stats.delta[cle] ?? 0;
          return (
            <span key={cle} data-stat={cle} data-reelle={reel} data-simulee={sim} data-delta={d} style={{ display: "flex", justifyContent: "space-between", gap: "0.4rem", borderBottom: "1px solid #232733", paddingBottom: "0.15rem" }}>
              <span style={{ color: "#b7b3a8" }}>{m.ajustement?.plusPiece === cle && <span data-stat-plus={cle} title="« + » de l'ajustement de cette pièce (tiré au hasard, non modifiable)" style={{ marginRight: 4, color: VERT }}>⇅</span>}{LIBELLES_STAT[cle]}</span>
              <span>{d !== 0 ? <><span style={{ color: "#7d7a70" }}>{reel} → </span><strong style={{ color: d > 0 ? VERT : ROUGE }}>{sim}</strong> <span style={{ color: d > 0 ? VERT : ROUGE, fontSize: "0.7rem" }}>({d > 0 ? `+${d}` : `−${Math.abs(d)}`})</span></> : <span>{sim}</span>}</span>
            </span>
          );
        })}
      </div>

      {e ? (
        <div data-energie="" data-energie-utilisee={e.simulee} data-energie-capacite={e.capacite} data-energie-reelle={e.reelle} data-energie-restante={e.restante} style={{ margin: "0 0 0.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <strong style={style.titreBloc}>Énergie des mods</strong>
            <span data-energie-texte="" style={{ fontSize: "0.78rem", color: e.restante === 0 ? OR : TEXTE }}>{energieTexte}</span>
          </div>
          <div aria-hidden="true" style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: e.capacite }, (_, i) => <span key={i} data-energie-case={i < e.simulee ? "pleine" : "vide"} style={{ flex: 1, height: 9, borderRadius: 2, background: i < e.simulee ? BLEU : "#232733" }} />)}
          </div>
        </div>
      ) : (
        <p data-energie-non-lue="" style={{ ...style.note, color: "#e0c080", margin: "0 0 0.6rem" }}>⚠️ L'énergie de cette armure n'a pas été lue (rechargez votre inventaire) : aucune limite n'est appliquée à la simulation.</p>
      )}

      <div style={{ border: "1px solid #2a2e38", borderRadius: 10, padding: "0.6rem", background: "#12151c", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <strong style={style.titreBloc}>Mods simulés</strong>
          {/* FR : ⚠️ CHANGÉ (30/10/2026, 2e archive « boutons-action-final ») - « Modifier » est le VISUEL de la charte (`boutons-action.modifier`) tant que le bloc est replié ; une fois ouvert, le bouton devient « Fermer » en TEXTE (le visuel ne dit que « Modifier »). Même repère `data-basculer-modifier` et même `aria-expanded` dans les deux états. / EN: ⚠️ CHANGED - "Modify" uses the charter artwork while collapsed; "Close" stays a text button. */}
          {ouvert
            ? <button type="button" data-basculer-modifier="" aria-expanded={ouvert} onClick={() => setOuvert((o) => !o)} style={{ fontSize: "0.75rem", height: "2.5rem", padding: "0 0.8rem", borderRadius: 6, border: `1px solid ${BLEU}`, background: "#1a2436", color: TEXTE, cursor: "pointer" }}>Fermer</button>
            : <BoutonAction id="boutons-action.modifier" libelle="Modifier" ariaExpanded={ouvert} onClick={() => setOuvert((o) => !o)} donnees={{ "basculer-modifier": true }} />}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
          <div data-resume-statistique="" style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0.5rem 0.6rem", borderRadius: 8, border: "1px solid #2a2e38", background: "#161922" }}>
            <span style={{ fontSize: "0.68rem", color: GRIS }}>Statistique (1 seul)</span>
            <span style={{ fontSize: "0.78rem" }}>{st ? (optStatCourante ? `${optStatCourante.plug.nom} · ${optStatCourante.cout}` : "aucun") : "—"}</span>
          </div>
          <div data-resume-ajustement="" style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0.5rem 0.6rem", borderRadius: 8, border: "1px solid #2a2e38", background: "#161922" }}>
            <span style={{ fontSize: "0.68rem", color: GRIS }}>Ajustement (1 seul)</span>
            <span style={{ fontSize: "0.78rem" }}>{aj ? (genreAj === "vide" ? "aucun" : `${aj.courant.nom} · ${coutMod(db, aj.courant.hash)}`) : "—"}</span>
          </div>
          <div data-resume-cumulables="" style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0.5rem 0.6rem", borderRadius: 8, border: "1px solid #2a2e38", background: "#161922" }}>
            <span style={{ fontSize: "0.68rem", color: GRIS }}>Cumulables ({nbCumul})</span>
            <div style={{ display: "flex", gap: 5 }}>
              {cu ? cu.effectifs.map((h, i) => {
                const vide = cu.vide?.hash === h;
                return <span key={i} data-slot-cumulable={vide ? "vide" : "plein"} title={vide ? `Emplacement ${i + 1} : vide` : `Emplacement ${i + 1} : ${cu.colonnes[i].options.find((o) => o.hash === h)?.nom ?? "?"} (${coutMod(db, h)} énergie)`} style={{ width: 24, height: 24, boxSizing: "border-box", borderRadius: 6, border: `1px ${vide ? "dashed" : "solid"} ${vide ? "#3a3f4b" : OR}`, background: vide ? "#232733" : OR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 600, color: "#0d0f14" }}>{vide ? "" : coutMod(db, h)}</span>;
              }) : <span style={{ fontSize: "0.78rem" }}>—</span>}
            </div>
          </div>
        </div>
        <span data-resume-texte="" style={{ fontSize: "0.75rem", color: GRIS }}>{cu ? (nomsCumulables.length > 0 ? `Cumulables : ${nomsCumulables.join(" · ")}` : "Aucun mod cumulable simulé.") : ""}</span>

        {/* FR : ⚠️ CHANGÉ (26/10/2026) - le compteur de simulations reste visible dans les DEUX vues (compacte et ouverte), comme dans l'ancienne Forge. / EN: the simulation counter is shown in both views. */}
        <span data-nb-simulees={nbSimulees} style={{ fontSize: "0.75rem", color: OR }}>{nbSimulees > 0 ? `${nbSimulees} emplacement${nbSimulees > 1 ? "s" : ""} simulé${nbSimulees > 1 ? "s" : ""}` : "Aucun mod simulé : équipement réel."}</span>
        {ouvert && (
          <div data-simulation-ouverte="" style={{ display: "flex", flexDirection: "column", gap: "0.8rem", borderTop: "1px solid #2a2e38", paddingTop: "0.7rem" }}>
            {st && (
              <div data-bloc="statistique" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <strong style={style.titreBloc}>Statistique : un seul mod</strong>
                  <span style={{ display: "inline-flex", border: "1px solid #3a3f4b", borderRadius: 6, overflow: "hidden" }}>
                    {st.intensites.map((v, i) => {
                      const cible = optStatCourante ? optionStat(optStatCourante.stat, v) : st.options.find((o) => o.valeur === v);
                      const coutV = cible?.cout ?? 0;
                      const bloque = v !== intensite && !!optStatCourante && (!cible || !tientDansLEnergie(e, deltaEnergie(db, effStat, cible.plug.hash)));
                      return <button key={v} type="button" data-intensite-chip={v} aria-pressed={v === intensite} disabled={bloque} title={bloque ? (cible ? raison(deltaEnergie(db, effStat, cible.plug.hash)) : "Ce niveau n'existe pas pour cette statistique") : ""} onClick={() => clicIntensite(v)} style={{ fontSize: "0.75rem", padding: "0.2rem 0.7rem", border: 0, borderLeft: i > 0 ? "1px solid #3a3f4b" : 0, background: v === intensite ? "#1a2436" : "#12151c", color: bloque ? "#8a8678" : TEXTE, cursor: bloque ? "not-allowed" : "pointer" }}>{`+${v} · ${coutV} énergie`}</button>;
                    })}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {st.stats.map((stat) => {
                    const actif = optStatCourante?.stat === stat;
                    const cible = optionStat(stat, intensite);
                    const bloque = !actif && (!cible || !tientDansLEnergie(e, deltaEnergie(db, effStat, cible.plug.hash)));
                    return (
                      <button key={stat} type="button" data-stat-chip={stat} aria-pressed={actif} disabled={bloque} title={bloque ? (cible ? raison(deltaEnergie(db, effStat, cible.plug.hash)) : "Ce niveau n'existe pas pour cette statistique") : (cible?.plug.nom ?? "")} onClick={() => clicStat(stat)} style={style.puce(actif, OR, "#2a2616", bloque)}>{LIBELLES_STAT[stat]}</button>
                    );
                  })}
                </div>
                <span data-nom-stat-mod="" style={style.note}>{optStatCourante ? `Mod choisi : ${optStatCourante.plug.nom} (+${optStatCourante.valeur} ${LIBELLES_STAT[optStatCourante.stat]}, ${optStatCourante.cout} énergie)` : "Aucun mod de statistique"}</span>
              </div>
            )}

            {aj && (
              <div data-bloc="ajustement" data-plus-piece={plusPiece ?? ""} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <strong style={style.titreBloc}>{`Ajustement : un seul${ajGratuit ? ", gratuit en énergie" : ""}`}</strong>
                {aj.plusLibre ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: VERT }}>+ sur</span>
                    {aj.plusPossibles.map((p) => <button key={p} type="button" data-plus-chip={p} aria-pressed={plusChoisi === p} onClick={() => setPlusLocal(p)} style={style.puce(plusChoisi === p, VERT, "#16261b", false)}>{LIBELLES_STAT[p]}</button>)}
                  </div>
                ) : plusPiece ? (
                  <span data-plus-etiquette={plusPiece} style={{ alignSelf: "flex-start", fontSize: "0.75rem", color: VERT, padding: "0.15rem 0.55rem", borderRadius: 999, border: "1px dashed #3a6a48" }}>{`⇅ « + » de cette pièce : +${aj.directionnels[0]?.plug.stats[plusPiece] ?? 5} ${LIBELLES_STAT[plusPiece]}`}</span>
                ) : (
                  <span data-plus-inconnu="" style={{ ...style.note, color: "#e0c080" }}>⚠️ Le « + » de cette pièce n'a pas pu être lu : seuls « Aucun » et « Équilibré » sont proposés.</span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  {aj.vide && <button type="button" data-aucun-chip="" aria-pressed={aj.vide.hash === effAj} title="Laisser l'ajustement vide : aucun effet" onClick={() => choisirAjustement(aj.vide!.hash)} style={style.puce(aj.vide.hash === effAj, BLEU, "#1a2436", false)}>Aucun</button>}
                  {aj.equilibre && <button type="button" data-equilibre-chip="" aria-pressed={aj.equilibre.hash === effAj} title={aj.equilibre.nom} onClick={() => choisirAjustement(aj.equilibre!.hash)} style={style.puce(aj.equilibre.hash === effAj, VERT, "#16261b", false)}>Équilibré</button>}
                  {aj.equilibre && texteEquilibre && <span style={style.note}>{texteEquilibre}</span>}
                </div>
                {plusChoisi && moinsPour.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: ROUGE }}>− sur</span>
                    {moinsPour.map((o) => {
                      const actif = o.plug.hash === effAj;
                      return <button key={o.plug.hash} type="button" data-moins-chip={o.moins} aria-pressed={actif} title={o.plug.nom} onClick={() => choisirAjustement(o.plug.hash)} style={style.puce(actif, ROUGE, "#2a1d16", false)}>{LIBELLES_STAT[o.moins]}</button>;
                    })}
                  </div>
                )}
                <span data-note-ajustement={aj.plusLibre ? "exotique" : "legendaire"} style={style.note}>{aj.plusLibre ? "Pièce exotique : pas de « + » propre à la pièce (pas de symbole ⇅) : tous les ajustements sont possibles. Le slot donne rien, +1 sur les trois statistiques non principales (équilibré), ou +5 sur la statistique de ton choix et −5 sur une autre." : "Pièce légendaire : son « + » est tiré au hasard par le jeu et ne se change pas (symbole ⇅ à côté de la statistique). Le slot donne rien, +1 sur les trois statistiques non principales (équilibré), ou +5 sur ce « + » et −5 sur une autre statistique."}</span>
              </div>
            )}

            {cu && (
              <div data-bloc="cumulables" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
                  <strong style={style.titreBloc}>{`Mods cumulables : ${nbCumul} emplacements`}</strong>
                  <span style={style.note}>le même mod peut être posé plusieurs fois</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {cu.options.map((o) => {
                    const n = cu.compte.get(o.hash) ?? 0;
                    const cout = coutMod(db, o.hash);
                    const plein = cu.nbLibres < 1;
                    const trop = !tientDansLEnergie(e, cout);
                    const bloque = plein || trop;
                    return (
                      <span key={o.hash} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <button type="button" data-cumulable={o.hash} data-n={n} data-cout={cout} disabled={bloque} title={plein ? `${nbCumul} emplacements pleins : retirez-en un` : trop ? raison(cout) : (o.description || o.nom)} aria-label={`Ajouter ${o.nom}, coût ${cout}${n > 0 ? `, déjà posé ${n} fois` : ""}`} onClick={() => { const c = ajouterCumulable(cu, o.hash); if (c) onChanger(c); }} style={{ ...style.puce(n > 0, OR, "#2a2616", bloque), padding: "0.12rem 0.55rem 0.12rem 0.25rem" }}>
                          <span aria-hidden="true" style={style.rond}>{cout}</span>
                          {o.icone && <img src={o.icone} alt="" width={16} height={16} style={{ borderRadius: 3 }} />}
                          <span>{o.nom}</span>
                          {n > 0 && <strong style={{ color: OR }}>× {n}</strong>}
                        </button>
                        {n > 0 && <button type="button" data-cumulable-retirer={o.hash} aria-label={`Retirer un ${o.nom}`} onClick={() => { const c = retirerCumulable(cu, o.hash); if (c) onChanger(c); }} style={{ width: 22, height: 22, padding: 0, borderRadius: 999, border: "1px solid #3a3f4b", background: "#161922", color: TEXTE, fontSize: "0.9rem", lineHeight: 1, cursor: "pointer" }}>−</button>}
                      </span>
                    );
                  })}
                </div>
                <span style={style.note}>Le chiffre dans le rond est le coût en énergie. Les bonus conditionnels des Sources et des surcharges ne sont pas chiffrés : aucune valeur dans le Manifest.</span>
              </div>
            )}

            {m.autres.length > 0 && (
              <div data-bloc="autres" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {m.autres.map((col) => {
                  const eff = hashEffectif(col, choix);
                  return (
                    <div key={col.socketIndex} data-colonne={col.socketIndex} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                      <strong style={style.titreBloc}>{col.categorie || `Emplacement ${col.socketIndex}`}</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {versionsStandard(db, col.options, [col.equipe.hash, eff]).map((p) => {
                          const actif = p.hash === eff;
                          const delta = deltaEnergie(db, eff, p.hash);
                          const bloque = !actif && !tientDansLEnergie(e, delta);
                          return (
                            <button key={p.hash} type="button" data-plug={p.hash} aria-pressed={actif} disabled={bloque} title={bloque ? raison(delta) : (p.description || p.nom)} onClick={() => clicAutre(col, p)} style={{ ...style.puce(actif, OR, "#2a2616", bloque), padding: "0.12rem 0.55rem 0.12rem 0.25rem" }}>
                              <span aria-hidden="true" style={style.rond}>{coutMod(db, p.hash)}</span>
                              <span>{p.nom}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span data-compteur="" style={{ fontSize: "0.75rem", color: GRIS }}>{`${cu ? `${nbPlein} / ${nbCumul} emplacements cumulables` : "—"}${e ? ` · énergie ${e.simulee} / ${e.capacite}` : ""}`}</span>
              <button type="button" data-reinitialiser="" disabled={nbSimulees === 0} onClick={onReinitialiser} style={{ fontSize: "0.75rem" }}>↺ Revenir à l'équipement réel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// FR : ⚠️ AJOUT (03/11/2026, chantier mods-phase-2, retour utilisateur : « le bouton devrait apparaître dans la carte ainsi que dans la pop-up Détails, peu importe d'où elle est ouverte ») - COMPOSANT PARTAGÉ « Appliquer en jeu » : le bouton (visible uniquement si la simulation d'armure diffère de l'état réel) et l'écran de confirmation avec progression, UN plug par appel, ARRÊT au premier refus (message exact de Bungie), relance des prises restantes uniquement, puis effacement de la simulation. Utilisé par la carte d'armure de la Forge (InventaireArmures) ET par la fenêtre Détails unique (FenetreDetailsPiece). ⚠️ CHANGÉ (03/11/2026, décision utilisateur : ordre 3 → 1 → 2) : VARIANTE B — le composant couvre AUSSI les perks d'ARMES (colonnes non masquées du Manifest, simulation du bloc « armes », plug visé = « effectif »). ⚠️ CORRECTIF du 03/11 (retour utilisateur en jeu) : le corps de requête utilise `itemId` (l'endpoint GRATUIT attend `itemId`, pas `itemInstanceId` — cf. DIM ; l'ancien champ provoquait ErrorCode 1663 « This action can only be done in-game »).
// EN: shared "Apply in game" component: button + confirmation screen with per-socket progress; used by both the Forge armor card and the shared details window. Variant A: armor only. Request body uses `itemId` (not `itemInstanceId`).
import { useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { DestinyMembership } from "../lib/bungie/api";
import type { GearPiece } from "../types/build";
import { colonnesArmure } from "../lib/forge/armure";
import { ecartsApplicables, reinitialiserArme, EcartSocket, ColonneApplicable } from "../lib/forge/simulation";
import { useSimulations, mettreAJourSimulations } from "../lib/forge/storeSimulations";
import { insererPlug, lireProfilEquipement, localiserDansProfil } from "../lib/bungie/equiper";
import { obtenirOptionsToutesColonnes } from "../lib/manifest/doctrine";   // ⚠️ AJOUT (03/11/2026, variante B) : colonnes de perks d’ARME (prises non masquées seulement)
import Modale from "./Modale";
import BoutonAction from "./BoutonAction";   // ⚠️ AJOUT (04/11/2026) : bouton charte « Appliquer en jeu » (archive forge-armory-app-assets)
import { urlVisuel } from "../lib/visuelsForge";   // ⚠️ AJOUT (04/11/2026) : icône seule des cartes

const SLOTS_ARME = ["cinetique", "energie", "lourde"];
const LIEUX: Record<string, string> = { titan: "Titan", chasseur: "Chasseur", arcaniste: "Arcaniste", coffre: "Coffre", courrier: "Courrier" };

interface Props {
  db: Database | null;
  membership: DestinyMembership | null;
  piece: GearPiece;
  /** FR : affichage compact (carte de la Forge) / complet (fenêtre Détails). / EN: compact (Forge card) vs full (details window). */
  compact?: boolean;
  /** FR : appelé après un succès complet (la Forge y recharge l'inventaire ; la re-lecture reste à la charge de l'appelant). / EN: called after full success (the Forge reloads its inventory there). */
  onSucces?: () => void;
}

export default function AppliquerEnJeu({ db, membership, piece, compact = false, onSucces }: Props) {
  const simulations = useSimulations();
  const [appli, setAppli] = useState<{ ecarts: EcartSocket[]; etats: Array<"enAttente" | "enCours" | "reussi" | "echoue">; libelles: Record<number, { actuel: string; vise: string }>; message: string | null; echec: boolean; termine: boolean } | null>(null);

  // FR : les écarts applicables de CETTE pièce : une prise MODIFIABLE dont le choix simulé diffère du plug équipé. Vide (bouton absent) sans écart, sans exemplaire possédé, sans Manifest, sans connexion, ou pour une ARME (variante A). / EN: this piece's applicable differences; empty (no button) without any.
  const estArme = SLOTS_ARME.includes(piece.slot as string);
  const ecarts = useMemo(() => {
    if (!db || !membership || !piece.itemInstanceId) return [];
    try {
      if (estArme) {
        // FR : ⚠️ AJOUT (03/11/2026, variante B décidée par l'utilisateur : le chantier s'étend aux perks d'armes) - les colonnes de l'ARME : seules les prises NON masquées sont renvoyées (cosmétiques et ornements exclus d'office) ; le perk ÉQUIPÉ vient de `perksParColonne` (une prise sans perk équipé connu ne peut pas produire d'écart). La simulation vit dans le bloc « armes » ; le plug VISÉ est l'« effectif » (version améliorée pour une arme améliorée — spéc §7). / EN: weapon columns (non-masked only); the simulation lives in the "armes" block; the target hash is the "effectif".
        const equipes = new Map((piece.perksParColonne ?? []).map((p) => [p.socketIndex, p.hash]));
        const colonnes: ColonneApplicable[] = obtenirOptionsToutesColonnes(db, piece.itemHash, piece.perkHashes, { equipesParColonne: piece.perksParColonne })
          .map((c) => ({ socketIndex: c.socketIndex, hashEquipe: equipes.get(c.socketIndex) ?? -1, modifiable: true }));
        return ecartsApplicables(colonnes, simulations.armes[piece.itemInstanceId]);
      }
      const colonnes: ColonneApplicable[] = colonnesArmure(db, piece).map((c) => ({ socketIndex: c.socketIndex, hashEquipe: c.equipe.hash, modifiable: c.modifiable }));
      return ecartsApplicables(colonnes, simulations.armures?.[piece.itemInstanceId]);
    } catch { return []; }
  }, [db, membership, piece, simulations, estArme]);

  if (ecarts.length === 0) return null;

  /** FR : ouvre l'écran de confirmation : chaque écart avec le NOM du plug actuel et du plug visé (lus dans le Manifest via les colonnes). / EN: opens the confirmation screen with plug names. */
  function ouvrir() {
    if (!db || !piece.itemInstanceId) return;
    const libelles: Record<number, { actuel: string; vise: string }> = {};
    try {
      if (estArme) {
        // FR : ⚠️ AJOUT (03/11/2026, variante B) - noms des perks d'arme depuis les colonnes du Manifest (l'équipé et le visé peuvent être absents des options : repli sur le hash). / EN: weapon perk names from the Manifest columns.
        for (const c of obtenirOptionsToutesColonnes(db, piece.itemHash, piece.perkHashes, { equipesParColonne: piece.perksParColonne })) {
          for (const e of ecarts) {
            if (e.socketIndex !== c.socketIndex) continue;
            libelles[e.socketIndex] = { actuel: c.options.find((o) => o.hash === e.plugActuel)?.nom ?? `perk ${e.plugActuel}`, vise: c.options.find((o) => o.hash === e.plugVise)?.nom ?? `perk ${e.plugVise}` };
          }
        }
      } else {
        for (const c of colonnesArmure(db, piece)) {
          for (const e of ecarts) {
            if (e.socketIndex !== c.socketIndex) continue;
            libelles[e.socketIndex] = { actuel: c.equipe.nom, vise: c.options.find((o) => o.hash === e.plugVise)?.nom ?? `plug ${e.plugVise}` };
          }
        }
      }
    } catch { /* libellés best-effort : les écarts restent affichés par index */ }
    setAppli({ ecarts, etats: ecarts.map(() => "enAttente"), libelles, message: null, echec: false, termine: false });
  }

  /** FR : écrit RÉELLEMENT les écarts chez Bungie, UN plug par appel, dans l'ordre affiché, ARRÊT au premier échec (message exact de Bungie, rien n'est annulé). L'objet du Coffre est tenté tel quel (décision du 03/11/2026) : sans porteur, le premier personnage du profil est utilisé. Après un succès complet : effacement de la simulation (le réel l'a remplacée), puis `onSucces` (la Forge y recharge son inventaire). / EN: writes the differences for real, one plug per call, stop on first failure; after full success, clear the simulation and call `onSucces`. */
  async function ecrire(depuis: number) {
    if (!membership || !piece.itemInstanceId || !appli) return;
    const instance = piece.itemInstanceId;
    const etats = [...appli.etats];
    setAppli({ ...appli, etats, message: null, echec: false, termine: false });
    let characterId: string | undefined;
    try {
      const lecture = await lireProfilEquipement(membership);
      if (!lecture.ok) {
        setAppli({ ...appli, etats, message: `position de l'objet illisible (${lecture.raison}) : rechargez votre inventaire, puis réessayez.`, echec: true, termine: true });
        return;
      }
      const pos = localiserDansProfil(lecture.profil, instance);
      if (pos.etat !== "localisee") {
        setAppli({ ...appli, etats, message: "objet introuvable dans votre profil (déplacé ou dématérialisé en jeu ?) : rechargez votre inventaire, puis réessayez.", echec: true, termine: true });
        return;
      }
      characterId = pos.characterId ?? Object.keys(lecture.profil.classes ?? {})[0];
    } catch (e) {
      setAppli({ ...appli, etats, message: `position de l'objet illisible (${(e as Error).message}) : rechargez votre inventaire, puis réessayez.`, echec: true, termine: true });
      return;
    }
    if (!characterId) {
      setAppli({ ...appli, etats, message: "aucun personnage trouvé sur votre compte : reconnectez-vous, puis réessayez.", echec: true, termine: true });
      return;
    }
    for (let i = depuis; i < appli.ecarts.length; i++) {
      etats[i] = "enCours";
      setAppli({ ...appli, etats: [...etats], message: null, echec: false, termine: false });
      const r = await insererPlug(membership, characterId, instance, appli.ecarts[i].socketIndex, appli.ecarts[i].plugVise);
      if (r.reussi) {
        etats[i] = "reussi";
        setAppli({ ...appli, etats: [...etats], message: null, echec: false, termine: false });
        continue;
      }
      // FR : ARRÊT au premier échec : les prises suivantes restent « en attente », le message EXACT de Bungie est affiché avec un conseil, rien n'est annulé. / EN: stop on first failure; remaining sockets stay pending.
      etats[i] = "echoue";
      const conseil = r.statutHttp === 401 || r.statutHttp === 403 ? " (problème d'autorisation : reconnectez-vous)" : r.errorCode ? " (refus du jeu : ce plug n'est peut-être pas autorisé sur cette prise, ou l'action exige d'être en espace social / en orbite / hors ligne)" : " (réseau ou serveur Bungie : réessayez)";
      setAppli({ ...appli, etats: [...etats], message: `Prise ${appli.ecarts[i].socketIndex} refusée par Bungie — HTTP ${r.statutHttp}${r.errorCode !== undefined ? `, ErrorCode ${r.errorCode}` : ""}${r.errorStatus ? ` (${r.errorStatus})` : ""} : ${r.message}${conseil}. Les prises restantes n'ont PAS été écrites.`, echec: true, termine: true });
      return;
    }
    // FR : SUCCÈS COMPLET : la simulation est effacée (l'état réel vient d'être écrit), puis l'appelant recharge ce qu'il faut. / EN: full success: clear the simulation, then let the caller reload.
    mettreAJourSimulations((s) => reinitialiserArme(s, instance, estArme ? "armes" : "armures"));
    setAppli({ ...appli, etats, message: `✅ Appliqué en jeu : ${appli.ecarts.length} prise${appli.ecarts.length > 1 ? "s" : ""} écrite${appli.ecarts.length > 1 ? "s" : ""} sur « ${piece.nom ?? (estArme ? "arme" : "armure")} ». La simulation locale est effacée : rechargez l’inventaire pour voir l’état réel.`, echec: false, termine: true });
    onSucces?.();
  }

  // FR : ⚠️ CHANGÉ (04/11/2026, visuels fournis par l'utilisateur, archive `forge-armory-app-assets`) - le bouton TEXTE provisoire est remplacé par les visuels de la charte : le BOUTON plaque « Appliquer en jeu » (`actions.appliquer-en-jeu.repos`, via `BoutonAction`, hauteur 2.5rem = barre Forge) dans la fenêtre Détails, et l'ICÔNE SEULE (`icones.appliquer-en-jeu`) dans les cartes d'Armes et d'Armures ; l'aria-label porte le nombre de prises. / EN: charter visuals replace the provisional text button: full plate button in the details window, icon-only on the cards.
  const libelle = `Appliquer en jeu (${ecarts.length} prise${ecarts.length > 1 ? "s" : ""})`;
  return (
    <>
      {compact
        ? <button type="button" onClick={ouvrir} data-appliquer-en-jeu={piece.itemInstanceId} aria-label={libelle} title={libelle} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, border: 0, background: "transparent", cursor: "pointer", lineHeight: 0, borderRadius: 6 }}>
            <img src={urlVisuel("icones.appliquer-en-jeu")} alt="" width={24} height={24} draggable={false} style={{ display: "block", pointerEvents: "none" }} />
          </button>
        : <BoutonAction id="actions.appliquer-en-jeu.repos" libelle={libelle} onClick={ouvrir} hauteur="2.5rem" title={libelle} donnees={{ "appliquer-en-jeu": piece.itemInstanceId ?? "" }} />}
      {appli && (
        <Modale titre="Appliquer en jeu" onFermer={() => setAppli(null)} largeur={560}>
          <p style={{ margin: "0 0 0.4rem", fontSize: "0.85rem" }}><strong>{piece.nom ?? `Armure ${piece.itemHash}`}</strong> — {LIEUX[piece.origine ?? ""] ?? "lieu inconnu"}{piece.equipe ? " · équipée" : ""}</p>
          <p style={{ margin: "0 0 0.6rem", fontSize: "0.78rem", color: "#e0a080" }}>⚠️ Ces changements s'appliquent à ton compte Destiny 2, pas seulement à l'appli. Chaque prise est écrite l'une après l'autre ; l'écriture s'arrête au premier refus du jeu.</p>
          <ul data-ecarts-en-jeu="" style={{ listStyle: "none", padding: 0, margin: "0 0 0.6rem", display: "grid", gap: "0.3rem" }}>
            {appli.ecarts.map((e, i) => (
              <li key={e.socketIndex} data-etat-prise={appli.etats[i]} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.25rem 0.4rem", background: "#0d0f14", border: "1px solid #3a3f4b", borderRadius: 6 }}>
                <span style={{ width: "1.2rem", textAlign: "center" }}>{appli.etats[i] === "reussi" ? "✅" : appli.etats[i] === "echoue" ? "❌" : appli.etats[i] === "enCours" ? "⏳" : "–"}</span>
                <span>Prise {e.socketIndex} : <strong>{appli.libelles[e.socketIndex]?.actuel ?? `plug ${e.plugActuel}`}</strong> → <strong style={{ color: "#f4e3a0" }}>{appli.libelles[e.socketIndex]?.vise ?? `plug ${e.plugVise}`}</strong></span>
              </li>
            ))}
          </ul>
          {appli.message && <p role="alert" data-message-en-jeu="" style={{ fontSize: "0.78rem", color: appli.echec ? "#e0a080" : "#a0d080", margin: "0 0 0.6rem", whiteSpace: "pre-wrap" }}>{appli.message}</p>}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {!appli.termine && <button onClick={() => ecrire(0)} data-confirmer-en-jeu="" style={{ padding: "0.4rem 0.8rem", background: "#2a2412", color: "#f4e3a0", border: "1px solid #e8c547", borderRadius: 8, cursor: "pointer" }}>Écrire ces {appli.ecarts.length} prise{appli.ecarts.length > 1 ? "s" : ""} en jeu</button>}
            {appli.termine && appli.etats.some((e) => e === "enAttente") && <button onClick={() => ecrire(appli.etats.findIndex((e) => e === "enAttente"))} data-relancer-en-jeu="" style={{ padding: "0.4rem 0.8rem", background: "#2a2412", color: "#f4e3a0", border: "1px solid #e8c547", borderRadius: 8, cursor: "pointer" }}>Relancer les prises restantes ({appli.etats.filter((e) => e === "enAttente").length})</button>}
            <button onClick={() => setAppli(null)} style={{ padding: "0.4rem 0.8rem", background: "#12151c", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 8, cursor: "pointer" }}>{appli.termine ? "Fermer" : "Annuler"}</button>
          </div>
        </Modale>
      )}
    </>
  );
}

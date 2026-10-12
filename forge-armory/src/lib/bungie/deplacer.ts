// FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - DÉPLACEMENT D'UN OBJET entre le Coffre et les personnages (bouton « Transférer vers » de Mon Inventaire et du Coffre ; demande de l'utilisateur). S'appuie sur `transfererObjet` (qui a déjà servi, en conditions réelles, à l'équipement des loadouts).
// RÈGLES (validées par l'utilisateur le 12/10/2026) : (1) un objet ÉQUIPÉ n'est jamais déplacé : on l'explique ; (2) UN seul objet à la fois ; (3) une confirmation est demandée par l'interface AVANT d'appeler ce module.
// MÉTHODE : (a) LIRE la position RÉELLE de l'objet chez Bungie (profil en direct), jamais l'état affiché : leçon du bug « objet introuvable » (1623) de l'équipement des loadouts ; (b) PLANIFIER (fonction pure, testée) : refuser ou décider les étapes ; (c) EXÉCUTER les étapes dans l'ordre.
// L'API ne transfère qu'entre UN personnage et le Coffre : d'un personnage à un autre, l'objet passe par le Coffre (deux étapes). Si la seconde étape échoue, l'objet reste dans le Coffre et le message le dit. Une session expirée (`SessionExpiree`) remonte à l'appelant.
// EN: ⚠️ ADDED - moves one item between the vault and characters ("Transfer to" button). Reads the item's REAL position live, plans (pure, tested), then executes; character-to-character goes through the vault (two steps).

import type { GearPiece } from "../../types/build";
import type { DestinyMembership } from "./api";
import { SessionExpiree } from "./oauth";
import { lireProfilEquipement, localiserDansProfil, transfererObjet, PositionObjet, ProfilEquipement } from "./equiper";

export type Lieu = "coffre" | "titan" | "chasseur" | "arcaniste";
export const LIBELLES_LIEU: Record<Lieu, string> = { coffre: "le Coffre", titan: "le Titan", chasseur: "le Chasseur", arcaniste: "l'Arcaniste" };
/** FR : emplacement « courrier » (récupération) : un objet qui y est ne se déplace pas d'ici. / EN: postmaster location code. */
const LIEU_COURRIER = 4;

export type CodeRefus = "equipe" | "courrier" | "introuvable" | "inconnue" | "deja" | "classe" | "sans-personnage";
export type Etape = { op: "envoyer" | "tirer"; characterId: string };
export type Plan =
  | { ok: true; source: Lieu; cible: Lieu; etapes: Etape[]; viaCoffre: boolean }
  | { ok: false; code: CodeRefus; message: string; lieuActuel?: Lieu };
export interface ResultatDeplacement {
  ok: boolean;
  message: string;
  /** FR : où est l'objet APRÈS l'opération, quand on le sait (succès, ou échec à la seconde étape : le Coffre) : l'interface s'en sert pour se mettre à jour. / EN: where the item is after the operation, when known. */
  lieuFinal?: Lieu;
}

/** FR : fonction PURE : refuse, ou décide les étapes, d'après la position RÉELLE de l'objet. / EN: PURE function: refuses, or decides the steps, from the item's real position. */
export function planifierDeplacement(entree: { position: PositionObjet; classes?: Record<string, Lieu>; cible: Lieu; classeRequise?: Lieu }): Plan {
  const { position, classes, cible, classeRequise } = entree;
  if (position.etat === "introuvable") return { ok: false, code: "introuvable", message: "Bungie ne trouve plus cet objet : votre inventaire a changé en jeu. Rechargez votre inventaire, puis réessayez." };
  if (position.etat === "inconnue") return { ok: false, code: "inconnue", message: `Impossible de vérifier où se trouve l'objet chez Bungie (${position.raison}). Rien n'a été déplacé.` };
  if (position.equipe) return { ok: false, code: "equipe", message: "Cet objet est équipé : il ne peut pas être transféré. Équipez un autre objet à sa place en jeu, puis réessayez." };
  if (position.location === LIEU_COURRIER) return { ok: false, code: "courrier", message: "Cet objet est dans le courrier (récupération) : il ne peut pas être transféré d'ici." };
  let source: Lieu;
  if (position.characterId) {
    const classe = classes?.[position.characterId];
    if (!classe) return { ok: false, code: "inconnue", message: "Impossible de savoir à quelle classe appartient le personnage qui porte l'objet. Rien n'a été déplacé." };
    source = classe;
  } else source = "coffre";
  if (source === cible) return { ok: false, code: "deja", message: `L'objet est déjà dans ${LIBELLES_LIEU[cible]}.`, lieuActuel: source };
  if (cible !== "coffre" && classeRequise && classeRequise !== cible) return { ok: false, code: "classe", message: `Une armure ${classeRequise === "arcaniste" ? "d'Arcaniste" : classeRequise === "titan" ? "de Titan" : "de Chasseur"} ne peut aller que chez un personnage de cette classe, ou au Coffre.` };
  const idDe = (lieu: Lieu): string | undefined => Object.entries(classes ?? {}).find(([, c]) => c === lieu)?.[0];
  const etapes: Etape[] = [];
  if (source !== "coffre") { const id = position.characterId!; etapes.push({ op: "envoyer", characterId: id }); }
  if (cible !== "coffre") {
    const id = idDe(cible);
    if (!id) return { ok: false, code: "sans-personnage", message: `Aucun personnage ${cible === "arcaniste" ? "Arcaniste" : cible === "titan" ? "Titan" : "Chasseur"} sur ce compte.` };
    etapes.push({ op: "tirer", characterId: id });
  }
  return { ok: true, source, cible, etapes, viaCoffre: source !== "coffre" && cible !== "coffre" };
}

/** FR : traduit une erreur Bungie (texte `[code/Statut] message` fabriqué par `transfererObjet`) en message clair ; les statuts inconnus gardent le texte d'origine. / EN: translates a Bungie error into a clear message; unknown statuses keep the original text. */
export function expliquerErreurTransfert(erreur: unknown): string {
  const texte = erreur instanceof Error ? erreur.message : String(erreur);
  if (/NoRoomInDestination/i.test(texte)) return "Plus de place à destination : libérez un emplacement (ou videz un peu le Coffre), puis réessayez.";
  if (/DestinyItemNotFound/i.test(texte)) return "Bungie ne trouve plus cet objet (votre inventaire a changé en jeu) : rechargez votre inventaire.";
  if (/Equipped/i.test(texte)) return "L'objet est équipé : il ne peut pas être transféré.";
  if (/NotTransferr?able/i.test(texte)) return "Cet objet ne peut pas être transféré.";
  if (/Throttle/i.test(texte)) return "Trop de requêtes envoyées à Bungie : attendez quelques secondes, puis réessayez.";
  if (/SystemDisabled|UnderMaintenance|ServiceUnavailable|DestinyServiceFailure|DestinyUnexpectedError|DestinyThrottledByGameServer/i.test(texte)) return "Les serveurs de Destiny ne répondent pas (maintenance ou surcharge) : réessayez plus tard.";
  return texte;
}

export type Transferer = (characterId: string, versCoffre: boolean) => Promise<void>;

/** FR : exécute les étapes dans l'ordre. Échec à la 1re étape : rien n'a bougé. Échec à la 2e : l'objet est dans le Coffre. / EN: executes the steps in order. */
export async function executerPlan(plan: Extract<Plan, { ok: true }>, transferer: Transferer): Promise<ResultatDeplacement> {
  for (let i = 0; i < plan.etapes.length; i++) {
    const etape = plan.etapes[i];
    try {
      await transferer(etape.characterId, etape.op === "envoyer");
    } catch (e) {
      if (e instanceof SessionExpiree) throw e;
      if (i === 0) return { ok: false, message: `Échec du transfert : ${expliquerErreurTransfert(e)} Rien n'a été déplacé.` };
      return { ok: false, lieuFinal: "coffre", message: `L'objet est maintenant dans le Coffre, mais la seconde étape (vers ${plan.cible === "arcaniste" ? "l'Arcaniste" : plan.cible === "titan" ? "le Titan" : "le Chasseur"}) a échoué : ${expliquerErreurTransfert(e)}` };
    }
  }
  const via = plan.viaCoffre ? " (en passant par le Coffre)" : "";
  return { ok: true, lieuFinal: plan.cible, message: `Transféré : ${LIBELLES_LIEU[plan.source]} → ${LIBELLES_LIEU[plan.cible]}${via}.` };
}

export interface DependancesDeplacement {
  lireProfil: (membership: DestinyMembership) => Promise<{ ok: true; profil: ProfilEquipement } | { ok: false; raison: string }>;
  transferer: (membership: DestinyMembership, characterId: string, itemInstanceId: string, itemHash: number, versCoffre: boolean) => Promise<void>;
}
const DEPENDANCES_REELLES: DependancesDeplacement = { lireProfil: lireProfilEquipement, transferer: transfererObjet };

/** FR : point d'entrée : lit la position réelle, planifie, exécute. `dependances` n'est remplacé que par les tests. / EN: entry point; `dependances` is only replaced by tests. */
export async function deplacerObjet(membership: DestinyMembership, piece: GearPiece, cible: Lieu, dependances: DependancesDeplacement = DEPENDANCES_REELLES): Promise<ResultatDeplacement> {
  if (!piece.itemInstanceId) return { ok: false, message: "Cet objet n'a pas d'identifiant d'instance : il ne peut pas être transféré." };
  const lecture = await dependances.lireProfil(membership);
  if (!lecture.ok) return { ok: false, message: `Impossible de vérifier où se trouve l'objet chez Bungie (${lecture.raison}). Rien n'a été déplacé.` };
  const position = localiserDansProfil(lecture.profil, piece.itemInstanceId);
  const plan = planifierDeplacement({ position, classes: lecture.profil.classes, cible, classeRequise: piece.classeRequise });
  if (!plan.ok) return { ok: false, message: plan.message, lieuFinal: plan.code === "deja" ? plan.lieuActuel : undefined };
  return executerPlan(plan, (characterId, versCoffre) => dependances.transferer(membership, characterId, piece.itemInstanceId!, piece.itemHash, versCoffre));
}

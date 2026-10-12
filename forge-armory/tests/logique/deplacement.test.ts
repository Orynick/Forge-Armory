// FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - test du DÉPLACEMENT d'objets (« Transférer vers ») : le PLAN (cas refusés et étapes décidées, d'après la position RÉELLE de l'objet), l'EXÉCUTION avec une fausse API qui enregistre chaque appel dans l'ordre, les messages d'erreur, et le point d'entrée `deplacerObjet` avec un faux profil Bungie.
// Jamais d'appel réel à Bungie. EN: ⚠️ ADDED - test of item moving: plan, execution against a recording fake API, error messages, and the entry point with a fake profile.
import { planifierDeplacement, executerPlan, expliquerErreurTransfert, deplacerObjet, DependancesDeplacement, Lieu } from "../../src/lib/bungie/deplacer";
import { SessionExpiree } from "../../src/lib/bungie/oauth";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const CLASSES: Record<string, Lieu> = { "id-titan": "titan", "id-chasseur": "chasseur", "id-arcaniste": "arcaniste" };
const loc = (characterId: string | undefined, equipe = false, location?: number) => ({ etat: "localisee" as const, characterId, equipe, location });
const plan = (position: never, cible: Lieu, classeRequise?: Lieu, classes = CLASSES) => planifierDeplacement({ position, classes, cible, classeRequise });

// ---------- le plan ----------
const p1 = plan(loc(undefined) as never, "titan") as { ok: true; etapes: unknown[]; viaCoffre: boolean };
ok("Coffre → Titan : UNE étape, tirer vers le Titan", p1.ok && JSON.stringify(p1.etapes) === JSON.stringify([{ op: "tirer", characterId: "id-titan" }]) && !p1.viaCoffre, p1);
const p2 = plan(loc("id-chasseur") as never, "coffre") as { ok: true; etapes: unknown[] };
ok("Chasseur → Coffre : UNE étape, envoyer depuis le Chasseur", p2.ok && JSON.stringify(p2.etapes) === JSON.stringify([{ op: "envoyer", characterId: "id-chasseur" }]), p2);
const p3 = plan(loc("id-titan") as never, "arcaniste") as { ok: true; etapes: unknown[]; viaCoffre: boolean };
ok("Titan → Arcaniste : DEUX étapes dans cet ordre, envoyer au Coffre depuis le Titan PUIS tirer vers l'Arcaniste (l'API ne transfère qu'entre un personnage et le Coffre)", p3.ok && p3.viaCoffre && JSON.stringify(p3.etapes) === JSON.stringify([{ op: "envoyer", characterId: "id-titan" }, { op: "tirer", characterId: "id-arcaniste" }]), p3);
const refus = (p: ReturnType<typeof plan>) => (p.ok ? "ok" : p.code);
ok("un objet ÉQUIPÉ est refusé, avec une explication (règle de l'utilisateur)", refus(plan(loc("id-titan", true) as never, "coffre")) === "equipe" && /équipé/.test((plan(loc("id-titan", true) as never, "coffre") as { message: string }).message));
ok("un objet dans le COURRIER (emplacement 4) est refusé", refus(plan(loc("id-titan", false, 4) as never, "coffre")) === "courrier");
ok("un objet INTROUVABLE chez Bungie est refusé (inventaire modifié en jeu) et un profil illisible aussi : rien n'est tenté à l'aveugle", refus(plan({ etat: "introuvable" } as never, "titan")) === "introuvable" && refus(plan({ etat: "inconnue", raison: "x" } as never, "titan")) === "inconnue");
const dj = plan(loc("id-titan") as never, "titan") as { ok: false; code: string; lieuActuel: Lieu };
ok("déjà à destination : refusé sans rien appeler, et le lieu réel est rendu pour resynchroniser l'écran", !dj.ok && dj.code === "deja" && dj.lieuActuel === "titan");
ok("ARMURE : une armure d'Arcaniste ne va pas chez le Titan (refusé), mais va au Coffre et chez l'Arcaniste ; une ARME (sans classe requise) va partout", refus(plan(loc(undefined) as never, "titan", "arcaniste")) === "classe" && refus(plan(loc("id-arcaniste") as never, "coffre", "arcaniste")) === "ok" && refus(plan(loc(undefined) as never, "arcaniste", "arcaniste")) === "ok" && refus(plan(loc(undefined) as never, "chasseur")) === "ok");
ok("aucun personnage de la classe visée sur le compte : refusé clairement", refus(plan(loc(undefined) as never, "arcaniste", undefined, { "id-titan": "titan" })) === "sans-personnage");
ok("un personnage dont la classe est inconnue (profil sans composant 200) : refusé, on ne devine pas", refus(plan(loc("id-x") as never, "coffre", undefined, {})) === "inconnue");
// ---------- l'exécution ----------
const journal: string[] = [];
const faux = (echecA: number | null, erreur: Error = new Error("[1642/DestinyNoRoomInDestination] pas de place")): (c: string, v: boolean) => Promise<void> => { let n = 0; return async (c, v) => { if (echecA === n++) throw erreur; journal.push(`${v ? "ENVOYER" : "TIRER"}:${c}`); }; };
journal.length = 0; const r1 = await executerPlan(p3 as never, faux(null));
ok("exécution réussie : les deux appels sont faits dans le bon ordre et le résultat dit « en passant par le Coffre »", journal.join() === "ENVOYER:id-titan,TIRER:id-arcaniste" && r1.ok && r1.lieuFinal === "arcaniste" && /en passant par le Coffre/.test(r1.message), [journal, r1]);
journal.length = 0; const r2 = await executerPlan(p3 as never, faux(0));
ok("échec à la PREMIÈRE étape : un seul appel tenté, « rien n'a été déplacé », aucun lieu final (l'objet n'a pas bougé)", journal.length === 0 && !r2.ok && r2.lieuFinal === undefined && /Rien n'a été déplacé/.test(r2.message) && /Plus de place/.test(r2.message), r2);
journal.length = 0; const r3 = await executerPlan(p3 as never, faux(1));
ok("échec à la SECONDE étape : l'objet est dans le Coffre, le résultat le dit clairement et rend « coffre » comme lieu final (l'écran se met à jour)", journal.join() === "ENVOYER:id-titan" && !r3.ok && r3.lieuFinal === "coffre" && /maintenant dans le Coffre/.test(r3.message), r3);
let remonte = false; try { await executerPlan(p3 as never, faux(0, new SessionExpiree())); } catch (e) { remonte = e instanceof SessionExpiree; }
ok("une SESSION EXPIRÉE n'est pas avalée : elle remonte à l'interface", remonte);
// ---------- les messages ----------
const m = (s: string) => expliquerErreurTransfert(new Error(s));
ok("erreurs Bungie traduites : plus de place, objet introuvable, équipé, non transférable, trop de requêtes, serveurs en maintenance", /Plus de place/.test(m("[1642/DestinyNoRoomInDestination] x")) && /ne trouve plus/.test(m("[1623/DestinyItemNotFound] x")) && /équipé/.test(m("[1665/DestinyCannotPerformActionOnEquippedItem] x")) && /ne peut pas être transféré/.test(m("[1/DestinyItemNotTransferrable] x")) && /Trop de requêtes/.test(m("[36/ThrottleLimitExceeded] x")) && /serveurs de Destiny/.test(m("[5/SystemDisabled] x")));
ok("un statut inconnu garde le texte d'origine de Bungie (rien d'inventé)", m("[999/UnPetitStatutInconnu] Message original") === "[999/UnPetitStatutInconnu] Message original");
// ---------- le point d'entrée, avec un faux profil Bungie ----------
const profil = (equipement: Record<string, { itemInstanceId: string }[]>, inventaires: Record<string, { itemInstanceId: string; location?: number }[]>, coffre: { itemInstanceId: string }[], classes: Record<string, Lieu> | undefined = CLASSES) => ({ ok: true as const, profil: { coffre, inventaires, equipement, classes } });
const appels: string[] = [];
const dep = (lecture: ReturnType<typeof profil> | { ok: false; raison: string }, echec = false): DependancesDeplacement => ({ lireProfil: async () => lecture as never, transferer: async (_m, c, id, h, v) => { appels.push(`${v ? "ENVOYER" : "TIRER"}:${c}:${id}:${h}`); if (echec) throw new Error("[1623/DestinyItemNotFound] x"); } });
const membership = { membershipType: 3, membershipId: "1", displayName: "Test" } as never;
const piece = (o: Record<string, unknown> = {}) => ({ itemInstanceId: "i1", itemHash: 111, nom: "Arme A", ...o }) as never;
appels.length = 0; const e1 = await deplacerObjet(membership, piece(), "coffre", dep(profil({}, { "id-titan": [{ itemInstanceId: "i1" }] }, [])));
ok("point d'entrée : position lue en direct (Titan), envoi au Coffre avec le BON identifiant de personnage, d'instance et d'objet", e1.ok && e1.lieuFinal === "coffre" && appels.join() === "ENVOYER:id-titan:i1:111", [e1, appels]);
appels.length = 0; const e2 = await deplacerObjet(membership, piece(), "coffre", dep(profil({ "id-titan": [{ itemInstanceId: "i1" }] }, {}, [])));
ok("point d'entrée : l'objet est ÉQUIPÉ en vrai (même si l'écran le croyait rangé) : refus, AUCUN appel de transfert", !e2.ok && /équipé/.test(e2.message) && appels.length === 0, [e2, appels]);
appels.length = 0; const e3 = await deplacerObjet(membership, piece(), "titan", dep(profil({}, {}, [{ itemInstanceId: "i1" }]), true));
ok("point d'entrée : échec de Bungie à la première étape : message clair, aucun lieu final", !e3.ok && e3.lieuFinal === undefined && /ne trouve plus/.test(e3.message), e3);
const e4 = await deplacerObjet(membership, piece(), "titan", dep({ ok: false, raison: "droits manquants" }));
ok("point d'entrée : profil illisible : rien n'est tenté et la raison est donnée", !e4.ok && /droits manquants/.test(e4.message) && appels.length === 1, [e4, appels]);
const e5 = await deplacerObjet(membership, piece({ itemInstanceId: undefined }), "titan", dep(profil({}, {}, [])));
ok("un objet sans identifiant d'instance ne peut pas être transféré (message clair)", !e5.ok && /identifiant d'instance/.test(e5.message));
const e6 = await deplacerObjet(membership, piece(), "coffre", dep(profil({}, {}, [{ itemInstanceId: "i1" }])));
ok("déjà au Coffre : pas d'appel, et le lieu réel est rendu pour resynchroniser l'écran", !e6.ok && e6.lieuFinal === "coffre" && /déjà/.test(e6.message) && appels.length === 1, [e6, appels]);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);

// FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - test de l'IDENTIFICATION DES ARMES FAÇONNÉES (« forgées ») sur les DONNÉES RÉELLES de l'utilisateur : la Mesure corrective (façonnée) contre la Confiance et l'Outil polyvalent MIDA (qui ne le sont pas), plus le repli par le nom et les cas limites. EN: ⚠️ ADDED - test of crafted-weapon identification on the user's real data.
import fs from "node:fs";
import { estFaconnee, PLUG_ARME_FACONNEE } from "../../src/lib/forge/faconnee";
import { niveauDePerk } from "../../src/lib/forge/simulation";
import { creerFausseDb, T_OBJET } from "./fixtures/fauxManifest";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
interface Prise { prise: number; equipe: number; disponibles: number[] }
const crafted = JSON.parse(fs.readFileSync("tests/logique/fixtures/arme-faconnee-reelle.json", "utf-8")).arme as { nom: string; prises: Prise[] };
const autres = JSON.parse(fs.readFileSync("tests/logique/fixtures/plugs-diagnostics-reels.json", "utf-8")).armes as { nom: string; prises: Prise[] }[];
const equipes = (prises: Prise[]) => prises.map((p) => p.equipe);

ok("DONNÉES RÉELLES : la Mesure corrective est reconnue FAÇONNÉE (son perk équipé « Arme façonnée », 4029346515, à la prise 10)", estFaconnee(null, equipes(crafted.prises)) && crafted.prises.find((p) => p.prise === 10)!.equipe === PLUG_ARME_FACONNEE, equipes(crafted.prises));
ok("DONNÉES RÉELLES : la Confiance et l'Outil polyvalent MIDA ne sont PAS façonnées (aucun faux positif sur les deux autres armes réelles de l'utilisateur)", autres.length === 2 && autres.every((a) => !estFaconnee(null, equipes(a.prises))), autres.map((a) => a.nom));
// ce que dit la donnée réelle d'une arme façonnée : les colonnes de perks ne listent que l'équipé
const colonnesPerks = crafted.prises.filter((p) => [1, 2, 3, 4, 8].includes(p.prise));
ok("DONNÉES RÉELLES : sur l'arme façonnée, chaque colonne de perks (prises 1 à 4 et 8) ne liste que le perk ÉQUIPÉ comme « disponible » : les autres perks ne se choisissent qu'à la forge en jeu (c'est ce que dit la note de l'appli)", colonnesPerks.length === 5 && colonnesPerks.every((p) => p.disponibles.length === 1 && p.disponibles[0] === p.equipe), colonnesPerks);
const dispo = Object.fromEntries(crafted.prises.filter((p) => p.disponibles.length > 0).map((p) => [p.prise, p.disponibles]));
const item = (hash: number, reel = false) => ({ option: { hash, equipeEnJeu: reel } });
ok("CONSÉQUENCE sur les quatre niveaux : dans une colonne de perks de l'arme façonnée, l'équipé est « reel » et tout autre perk du modèle est « possible » (nom grisé), jamais « disponible » ; les mods (prise 6, 16 perks disponibles) restent « disponible »", niveauDePerk(item(crafted.prises.find((p) => p.prise === 3)!.equipe, true), 3, dispo) === "reel" && niveauDePerk(item(999999999), 3, dispo) === "possible" && niveauDePerk(item(3336648220), 6, dispo) === "disponible", dispo[6]);
// repli par le nom et cas limites
const { db } = creerFausseDb({ [T_OBJET]: { 7001: { displayProperties: { name: "Arme façonnée" } }, 7002: { displayProperties: { name: "ARME FAÇONNÉE" } }, 7003: { displayProperties: { name: "Crafted Weapon" } }, 7004: { displayProperties: { name: "Arme façonnée améliorée" } }, 7005: { displayProperties: { name: "Canon X" } } } });
ok("REPLI PAR LE NOM (autre hash que le connu) : « Arme façonnée », « ARME FAÇONNÉE » (casse et accents sans importance) et « Crafted Weapon » sont reconnus avec le Manifest", estFaconnee(db, [7005, 7001]) && estFaconnee(db, [7002]) && estFaconnee(db, [7003]));
ok("un autre perk n'est pas pris pour le plug (« Arme façonnée améliorée », « Canon X ») ; sans Manifest, un hash inconnu ne déclenche rien", !estFaconnee(db, [7004]) && !estFaconnee(db, [7005]) && !estFaconnee(null, [7001]));
ok("cas limites : liste absente ou vide = non façonnée ; le hash connu suffit même sans Manifest", !estFaconnee(db, undefined) && !estFaconnee(db, []) && estFaconnee(null, [1, PLUG_ARME_FACONNEE, 2]));
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);

// FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - REPRODUCTIBILITÉ des visuels : en repartant de l'archive de référence de l'utilisateur (`ressources-installateur/forge-armory/app-assets/assets`, archive v3 ; les fichiers de l'archive ne sont jamais modifiés) et en rejouant `scripts/retoucher-visuels.mjs` dans un dossier TEMPORAIRE,
// on doit retrouver, OCTET POUR OCTET, tout ce que contient `public/assets/` : les seuls fichiers de `public/assets/` qui ne viennent pas de l'archive sont ceux de l'onglet Forge (fichiers produits par `scripts/generer-propositions-solo-forge.mjs`). Le script doit aussi être idempotent (une seconde exécution ne change rien).
// Ce test remplace la vérification que j'avais faite à la main le 12/10/2026 lors de l'arrivée de l'archive v3. EN: ⚠️ ADDED - rebuilding public/assets from the pristine archive must reproduce the shipped files byte for byte.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { FORGE_ASSETS_COMPLEMENT } from "../../src/data/forge/forgeAssetsComplement";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 500)); };
const racine = process.cwd();
const hash = (f: string) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const lister = (base: string): string[] => { const out: string[] = []; const rec = (d: string) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? rec(p) : out.push(path.relative(base, p).split(path.sep).join("/")); } }; rec(base); return out.sort(); };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "forge-visuels-"));
fs.mkdirSync(path.join(tmp, "public"), { recursive: true }); fs.mkdirSync(path.join(tmp, "ressources-installateur/forge-armory"), { recursive: true });
fs.cpSync(path.join(racine, "ressources-installateur/forge-armory/app-assets/assets"), path.join(tmp, "public/assets"), { recursive: true });
fs.cpSync(path.join(racine, "ressources-installateur/forge-armory/titres-complets"), path.join(tmp, "ressources-installateur/forge-armory/titres-complets"), { recursive: true });
fs.cpSync(path.join(racine, "scripts"), path.join(tmp, "scripts"), { recursive: true });
const r1 = spawnSync("node", ["scripts/retoucher-visuels.mjs"], { cwd: tmp, encoding: "utf-8" });
const r2 = spawnSync("node", ["scripts/retoucher-visuels.mjs"], { cwd: tmp, encoding: "utf-8" });
const reconstruit = lister(path.join(tmp, "public/assets")), livre = lister(path.join(racine, "public/assets"));
// FR : ⚠️ CHANGÉ (13/10/2026, v0.4.3) - les fichiers qui ne viennent pas de l'archive sont ceux de l'onglet Forge (bouton repos, bouton sélectionné, icône) ET les deux boutons « Inventaire » (option 2 choisie par l'utilisateur) : tous fabriqués par `scripts/generer-propositions-solo-forge.mjs`. EN: files not from the archive: the Forge ones and the two Inventory buttons.
const forge = FORGE_ASSETS_COMPLEMENT.filter((a) => /(^selecteur\.forge\.|^icones\.forge$|^selecteur\.inventaire\.)/.test(a.id)).map((a) => a.fichier.replace(/^assets\//, ""));
ok("le script de retouche s'exécute sans erreur depuis l'archive de référence", r1.status === 0 && /retouche\(s\) appliquée\(s\)/.test(r1.stdout), r1.stderr || r1.stdout.slice(-200));
ok("IDEMPOTENT : une seconde exécution ne change plus rien", r2.status === 0 && /\b0 retouche\(s\) appliquée\(s\)/.test(r2.stdout), r2.stdout.slice(-200));
ok(`les fichiers de public/assets qui ne viennent PAS de l'archive sont exactement ceux de l'onglet Forge et du bouton Inventaire (${forge.length} : ${forge.join(", ")})`, forge.length === 5 && JSON.stringify(livre.filter((f) => !reconstruit.includes(f))) === JSON.stringify([...forge].sort()), livre.filter((f) => !reconstruit.includes(f)));
ok("la reconstruction ne produit AUCUN fichier absent de public/assets (rien n'a été oublié lors de l'intégration)", reconstruit.every((f) => livre.includes(f)), reconstruit.filter((f) => !livre.includes(f)));
const differents = reconstruit.filter((f) => livre.includes(f) && hash(path.join(tmp, "public/assets", f)) !== hash(path.join(racine, "public/assets", f)));
ok(`REPRODUCTIBLE : les ${reconstruit.length} fichiers reconstruits depuis l'archive de référence sont identiques OCTET POUR OCTET à ceux de public/assets`, differents.length === 0, differents);
const v = spawnSync("node", ["scripts/retoucher-visuels.mjs", "--verifier"], { cwd: racine, encoding: "utf-8" });
ok("`node scripts/retoucher-visuels.mjs --verifier` sur le projet lui-même : aucune retouche ne manque", v.status === 0 && /\b0 retouche\(s\) manquante\(s\)/.test(v.stdout), v.stdout.slice(-200));
// FR : le GÉNÉRATEUR doit redonner, octet pour octet, les cinq fichiers fabriqués (il lit les boutons et icônes déjà livrés, comme modèles). EN: the generator must reproduce the five fabricated files byte for byte.
const sortieGen = path.join(tmp, "generes");
const g = spawnSync("node", ["scripts/generer-propositions-solo-forge.mjs", "--sortie", sortieGen], { cwd: racine, encoding: "utf-8" });
const fabriques = [...forge];
const ecartsGen = fabriques.filter((f) => !fs.existsSync(path.join(sortieGen, f)) || hash(path.join(sortieGen, f)) !== hash(path.join(racine, "public/assets", f)));
ok(`le générateur (scripts/generer-propositions-solo-forge.mjs) redonne OCTET POUR OCTET les ${fabriques.length} fichiers qu'il fabrique (boutons Forge et Inventaire, icône Forge)`, g.status === 0 && ecartsGen.length === 0, ecartsGen.length ? ecartsGen : g.stderr.slice(-300));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);

// FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - test du MODULE de l'icône « arme façonnée » (`data/forge/iconeFaconnee.ts`, généré à partir de l'image de l'utilisateur) : forme du chemin (quatre sous-tracés fermés), tenue dans le cadre, SYMÉTRIE à quatre axes (miroir horizontal et vertical), couleur. La FIDÉLITÉ à l'image du jeu est vérifiée par `tests/ui/icone-faconnee.py` (rendu dans le navigateur). EN: ⚠️ ADDED - test of the crafted-weapon icon module: path shape, bounds, 4-fold symmetry, colour.
import { ICONE_FACONNEE } from "../../src/data/forge/iconeFaconnee";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", JSON.stringify(detail).slice(0, 400)); };
const sousTraces = ICONE_FACONNEE.chemin.split("M").filter(Boolean).map((t) => t.trim());
const points = sousTraces.map((t) => t.replace(/ Z$/, "").split(/ ?L/).map((p) => p.split(",").map(Number) as [number, number]));
ok("le chemin compte QUATRE sous-tracés, chacun fermé (Z)", sousTraces.length === 4 && sousTraces.every((t) => t.endsWith("Z")), sousTraces.length);
const TOL = 0.5;   // 0,5 % du cadre : le bord du tracé n'est pas exactement au pixel entier de l'image source
const xs = points.flat().map((p) => p[0]), ys = points.flat().map((p) => p[1]);
ok("tous les points sont des nombres et tiennent dans le cadre (0 à largeur, 0 à hauteur) ; l'icône occupe tout le cadre, à 0,5 % près (rien de perdu en marge)", points.flat().every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)) && Math.min(...xs) >= -0.01 && Math.max(...xs) <= ICONE_FACONNEE.largeur + 0.01 && Math.min(...ys) >= -0.01 && Math.max(...ys) <= ICONE_FACONNEE.hauteur + 0.01 && Math.min(...xs) < TOL && Math.max(...xs) > ICONE_FACONNEE.largeur - TOL && Math.min(...ys) < TOL && Math.max(...ys) > ICONE_FACONNEE.hauteur - TOL, [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]);
const proche = (x: number, y: number) => points.flat().some(([a, b]) => Math.abs(a - x) <= 0.02 && Math.abs(b - y) <= 0.02);   // 0,02 : arrondi à deux décimales
ok("SYMÉTRIE à quatre axes : le miroir horizontal et le miroir vertical de chaque point sont aussi des points de l'icône (à l'arrondi près)", points.flat().every(([x, y]) => proche(ICONE_FACONNEE.largeur - x, y) && proche(x, ICONE_FACONNEE.hauteur - y)));
ok("les quatre blocs ont autant de points (même forme reflétée)", new Set(points.map((q) => q.length)).size === 1 && points[0].length > 20, points.map((q) => q.length));
ok("la teinte est le saumon corail #e49f87 mesuré sur la capture du jeu ; le cadre est presque carré", ICONE_FACONNEE.couleur === "#e49f87" && Math.abs(ICONE_FACONNEE.largeur / ICONE_FACONNEE.hauteur - 1) < 0.01);
console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);

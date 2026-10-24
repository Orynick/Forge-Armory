# FR : ⚠️ AJOUT (19/10/2026, v0.4.13), demande de l'utilisateur (« reprends simplement les visuels que j'ai envoyés ») - TEST des visuels d'identité produits par `ressources-installateur/forge-armory/generer-icones.py` depuis le logo du 19/10/2026 (1092 x 1092, cristaux cyan dans les DEUX « O ») et la planche de déclinaisons : (1) sources (nouvelle image, anciennes archivées) ; (2) images de l'en-tête (dimensions inchangées) ; (3) les DEUX cristaux cyan dans le titre, à la place de ceux de l'image d'origine ; (4) GÉOMÉTRIE de l'en-tête INCHANGÉE (cercle et texte aux mêmes proportions que `MESURES_IDENTITE`) ; (5) icône d'application, favicons, icône Windows ; (6) monochromes ; (7) déclinaisons ; (8) REPRODUCTIBILITÉ de bout en bout dans une copie jetable ; (9) plus aucun cristal dessiné à la main. Depuis la racine : python3 tests/ui/identite-visuels.py   (Pillow, numpy, scipy)
# EN: ⚠️ ADDED - test of the identity visuals generated from the 2026-10-19 logo (cyan crystals in both O's) and the declination sheet.
import io, os, re, shutil, struct, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage
racine = os.getcwd()
RES = f"{racine}/ressources-installateur/forge-armory"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
def charger(chemin): return Image.open(chemin).convert("RGBA")
def existe(*chemins): return all(os.path.exists(c) for c in chemins)

# ---------- 1. sources ----------
import hashlib
sha = lambda chemin: hashlib.sha1(open(chemin, "rb").read()).hexdigest()
KIT = f"{RES}/app-assets/assets/marque/logo-forge-armory.png"
src = Image.open(KIT)
ancienne = f"{RES}/archives-precedentes/identite-forge-armory-source-2026-10-01.png"
ok("SOURCE : le générateur part du logo du KIT de visuels (1092 × 1092), identique octet pour octet à la copie livrée dans `public/assets/marque/` : AUCUN doublon ; l'ancienne image d'identité (1254 × 1254, 01/10/2026) est ARCHIVÉE et n'existe plus à son ancien emplacement ; la planche de déclinaisons est dans le kit", src.size == (1092, 1092) and sha(KIT) == sha(f"{racine}/public/assets/marque/logo-forge-armory.png") and existe(ancienne, f"{RES}/app-assets/assets/marque/forge-armory-declinaisons.png") and Image.open(ancienne).size == (1254, 1254) and not os.path.exists(f"{RES}/identite-forge-armory-source.png"), [src.size, os.path.exists(f"{RES}/identite-forge-armory-source.png")])
# ---------- 2. images de l'en-tête ----------
emb = charger(f"{racine}/public/logo-forge-armory-embleme.png"); txt = charger(f"{racine}/public/logo-forge-armory-texte.png")
ok("EN-TÊTE : les images gardent EXACTEMENT leurs dimensions (emblème 304 × 342, titre 803 × 158), à fond transparent : `EnTeteApp` et `geometrieIdentite.ts` n'ont rien à changer", emb.size == (304, 342) and txt.size == (803, 158) and emb.getpixel((0, 0))[3] == 0 and txt.getpixel((0, 0))[3] == 0, [emb.size, txt.size])
# ---------- 3. les deux cristaux cyan du titre ----------
t = np.array(txt).astype(int); alpha = t[..., 3]; cyan_t = ((t[..., 2] - t[..., 0]) > 100) & (alpha > 150)
lab, n = ndimage.label(ndimage.binary_closing(cyan_t[:80], iterations=2))
comps = [(ndimage.center_of_mass(lab == i), int((lab == i).sum())) for i in range(1, n + 1) if (lab == i).sum() >= 80]
comps.sort(key=lambda c: c[0][1])
ok("TITRE : LES DEUX « O » PORTENT UN CRISTAL CYAN (deux formes bleues isolées dans la bande des lettres), de MÊME taille (à 15 % près), l'une dans FORGE (à gauche), l'autre dans ARMORY (à droite)", len(comps) == 2 and comps[0][0][1] < 200 and comps[1][0][1] > 560 and abs(comps[0][1] - comps[1][1]) / max(comps[1][1], 1) < 0.15, comps)
s = np.array(src.convert("RGB")).astype(int)[788:964, 105:1001]
cs = ((s[..., 2] - s[..., 0]) > 100); labs, ns = ndimage.label(ndimage.binary_closing(cs[:80], iterations=3))
srcs = sorted([ndimage.center_of_mass(labs == i) for i in range(1, ns + 1) if (labs == i).sum() >= 100], key=lambda c: c[1])
ecart = max(max(abs(a[0][1] - b[1] * 803 / 896), abs(a[0][0] - b[0] * 158 / 176)) for a, b in zip(comps, srcs)) if len(srcs) == 2 and len(comps) == 2 else 99   # (y, x) du centre de chaque cristal : image de l'en-tête (803 × 158) contre zone de la source (896 × 176)
ok("FIDÉLITÉ : chaque cristal est exactement à l'endroit où il est dans TON image d'origine (écart ≤ 1,5 px dans l'image de l'en-tête)", ecart <= 1.5, ecart)
# ---------- 4. géométrie de l'en-tête inchangée ----------
ts = open(f"{racine}/src/lib/enTete/geometrieIdentite.ts", encoding="utf-8").read()
mes = {k: float(re.search(rf"{k}:\s*([0-9.]+)", ts).group(1)) for k in ("emblemeHauteur", "cercleHaut", "cercleDiametre", "texteLargeur", "texteHauteur", "texteHautEncre", "texteBasEncre", "texteBordGauche")}
e = np.array(emb).astype(int); neutre = (e[..., 3] > 100) & (e[..., :3].min(axis=2) > 110) & ~((e[..., 2] - e[..., 0]) > 40)
labe, ne = ndimage.label(neutre); bo = ndimage.find_objects(labe)
arcs = sorted(range(1, ne + 1), key=lambda i: -(bo[i - 1][1].stop - bo[i - 1][1].start))[:2]
cy0 = min(bo[i - 1][0].start for i in arcs); cy1 = max(bo[i - 1][0].stop for i in arcs)
haut_rel, diam_rel = cy0 / 342, (cy1 - cy0) / 342
att_haut, att_diam = mes["cercleHaut"] / mes["emblemeHauteur"], mes["cercleDiametre"] / mes["emblemeHauteur"]
ok("GÉOMÉTRIE : dans l'image de l'emblème, le CERCLE est aux mêmes proportions que `MESURES_IDENTITE` (haut et diamètre à ±0,8 % de la hauteur) : l'en-tête reste exactement placé", abs(haut_rel - att_haut) < 0.008 and abs(diam_rel - att_diam) < 0.008, [round(haut_rel, 4), round(att_haut, 4), round(diam_rel, 4), round(att_diam, 4)])
rows = np.where((alpha > 40).any(axis=1))[0]; cols = np.where((alpha > 40).any(axis=0))[0]
att = (mes["texteHautEncre"] / mes["texteHauteur"], (mes["texteBasEncre"] + 1) / mes["texteHauteur"], mes["texteBordGauche"] / mes["texteLargeur"])
mesure = (rows.min() / 158, (rows.max() + 1) / 158, cols.min() / 803)
ok("GÉOMÉTRIE : dans l'image du titre, l'ENCRE (haut, bas, bord gauche du « F ») est aux mêmes proportions que `MESURES_IDENTITE` (à ±1,2 %)", all(abs(a - b) < 0.012 for a, b in zip(att, mesure)), [att, mesure])
# ---------- 5. icône d'application, favicons, icône Windows ----------
def lire_ico(chemin):
    d = open(chemin, "rb").read(); r, typ, n = struct.unpack("<HHH", d[:6]); entrees = []
    for i in range(n):
        w, h, _, _, _, _, taille, off = struct.unpack("<BBBBHHII", d[6 + 16 * i: 22 + 16 * i]); entrees.append(((w or 256), Image.open(io.BytesIO(d[off:off + taille])).convert("RGBA")))
    return typ, entrees
typ, ent = lire_ico(f"{racine}/ressources-installateur/icon.ico")
ok("ICÔNE WINDOWS : un fichier .ico valide de 7 tailles (16, 24, 32, 48, 64, 128, 256), chaque image à sa taille exacte", typ == 1 and [t for t, _ in ent] == [16, 24, 32, 48, 64, 128, 256] and all(im.size == (t, t) for t, im in ent), [(t, im.size) for t, im in ent])
im256 = dict(ent)[256]; im32 = dict(ent)[32]
ok("ICÔNE WINDOWS = ICÔNE D'APPLICATION de la planche : tuile à coins ARRONDIS transparents (coins transparents, centre opaque) et fond SOMBRE (près du milieu du bord gauche, entre le bord et la flèche, presque noir)", im256.getpixel((0, 0))[3] == 0 and im256.getpixel((128, 128))[3] == 255 and im32.getpixel((0, 0))[3] < 60 and max(im256.getpixel((22, 128))[:3]) < 60, [im256.getpixel((0, 0)), im256.getpixel((22, 128))])
favs = {t: charger(f"{racine}/public/favicon-{t}.png") for t in (16, 32, 48)}
ok("FAVICONS : public/favicon-16, -32 et -48 existent à leur taille ET sont l'icône d'application réduite (identiques à l'entrée correspondante de l'icône Windows pour 32 et 48)", all(im.size == (t, t) for t, im in favs.items()) and np.array_equal(np.array(favs[32]), np.array(im32)) and np.array_equal(np.array(favs[48]), np.array(dict(ent)[48])), {t: im.size for t, im in favs.items()})
app = charger(f"{RES}/declinaisons/icone-app-512.png"); a512 = np.array(app).astype(int)
bleu = ((a512[..., 2] - a512[..., 0]) > 100) & (a512[..., 3] > 200); colonne = bleu[:, 236:277].any(axis=1); haut_cristal = int(np.argmax(colonne)) / 512
ok("ICÔNE D'APPLICATION 512 : coins transparents, fond sombre ; l'emblème est GRAND (la pointe du cristal du haut est entre 4 % et 10 % de la hauteur du bord, comme sur la planche)", app.size == (512, 512) and app.getpixel((3, 3))[3] == 0 and max(app.getpixel((60, 256))[:3]) < 60 and 0.04 <= haut_cristal <= 0.10, [app.size, round(haut_cristal, 3)])
# ---------- 6. monochromes ----------
bn = np.array(charger(f"{RES}/declinaisons/monochrome-blanc-sur-noir.png").convert("RGB")).astype(int); nb = np.array(charger(f"{RES}/declinaisons/monochrome-noir-sur-blanc.png")).astype(int)
blanc_bn = bn.min(axis=2) > 200; noir_nb = (nb[..., :3].max(axis=2) < 55) & (nb[..., 3] > 200)
purete = float(((bn.max(axis=2) < 40) | (bn.min(axis=2) > 215)).mean())
iou = float((blanc_bn & noir_nb).sum() / max(1, (blanc_bn | noir_nb).sum()))
ok("MONOCHROMES : blanc sur noir = presque que du noir et du blanc (≥ 95 %), formes entre 8 et 35 % de la surface ; noir sur blanc = MÊMES formes (recouvrement ≥ 97 %), tuile arrondie à coins transparents", purete >= 0.95 and 0.08 <= blanc_bn.mean() <= 0.35 and iou >= 0.97 and nb[0, 0, 3] == 0, [round(purete, 3), round(float(blanc_bn.mean()), 3), round(iou, 3)])
# ---------- 7. déclinaisons ----------
att_fichiers = {"logo-complet.png": (1092, 1092), "logo-complet.webp": (1092, 1092), "icone-app-512.webp": (512, 512), "papillon-seul-256.png": (256, 256), "favicon-16.png": (16, 16), "favicon-32.png": (32, 32)} | {f"emblem-{n}.png": (n, n) for n in (1024, 512, 256, 128, 64, 32)}
manque = [f for f, sz in att_fichiers.items() if not os.path.exists(f"{RES}/declinaisons/{f}") or Image.open(f"{RES}/declinaisons/{f}").size != sz]
typ2, ent2 = lire_ico(f"{RES}/declinaisons/favicon.ico")
ok("DÉCLINAISONS : logo complet (PNG et WEBP), emblème en 6 tailles (1024 à 32), papillon seul, favicons 16 et 32 (PNG et .ico à 2 entrées) : tous présents à la bonne taille", not manque and [t for t, _ in ent2] == [16, 32], manque)
# ---------- 8. reproductibilité de bout en bout ----------
with tempfile.TemporaryDirectory() as tmp:
    os.makedirs(f"{tmp}/ressources-installateur/forge-armory/app-assets/assets/marque")
    shutil.copy(f"{RES}/generer-icones.py", f"{tmp}/ressources-installateur/forge-armory/generer-icones.py")
    shutil.copy(KIT, f"{tmp}/ressources-installateur/forge-armory/app-assets/assets/marque/logo-forge-armory.png")
    r = subprocess.run([sys.executable, f"{tmp}/ressources-installateur/forge-armory/generer-icones.py"], capture_output=True, text=True, cwd=tmp)
    paires = [("public/logo-forge-armory-embleme.png",) * 2, ("public/logo-forge-armory-texte.png",) * 2, ("public/favicon-16.png",) * 2, ("public/favicon-32.png",) * 2, ("public/favicon-48.png",) * 2, ("ressources-installateur/icon.ico",) * 2]
    paires += [(f"ressources-installateur/forge-armory/declinaisons/{f}",) * 2 for f in sorted(os.listdir(f"{RES}/declinaisons"))]
    diff = [p[0] for p in paires if not os.path.exists(f"{tmp}/{p[0]}") or open(f"{tmp}/{p[0]}", "rb").read() != open(f"{racine}/{p[1]}", "rb").read()]
    ok(f"REPRODUCTIBLE DE BOUT EN BOUT (copie jetable) : relancer le générateur depuis la seule image d'origine redonne EXACTEMENT les mêmes octets pour les {len(paires)} fichiers produits (en-tête, favicons, icône Windows, déclinaisons)", r.returncode == 0 and not diff, (r.stderr or r.stdout)[-200:] + str(diff[:4]))
# ---------- 9. plus de cristal dessiné à la main ----------
gen = open(f"{RES}/generer-icones.py", encoding="utf-8").read()
ok("PLUS AUCUN CRISTAL DESSINÉ À LA MAIN : le générateur ne trace plus de losange (ni `putpixel`) ; les cristaux sont ceux de ton image", "LOSANGE" not in gen and "putpixel" not in gen and "1092" in gen and "app-assets" in gen and "identite-forge-armory-source.png\"" not in gen)
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

# FR : ⚠️ AJOUT (19/10/2026, v0.4.13), demande de l'utilisateur (« Génère un SVG du titre actualisé », puis « reprends simplement les visuels que j'ai envoyés ») - TEST du SVG du titre (`ressources-installateur/forge-armory/logo-titre/forge-armory-titre.svg`, produit par `scripts/generer-titre-svg.py` depuis le logo du 19/10/2026) : (1) CONFORMITÉ à la charte (aucune police, aucun script, aucune ressource externe, identifiants préfixés, cadre 896 x 176, nom accessible) ; (2) FIDÉLITÉ à l'image de l'en-tête (silhouette dessinée par le navigateur, par bande) ; (3) les DEUX CRISTAUX CYAN sont des LOSANGES nets, de même taille, au MÊME endroit que dans ton image d'origine ; (4) l'étoile est cyan, symétrique, au centre de la ligne ; (5) le fichier est REPRODUCTIBLE (relancer l'outil redonne les mêmes octets). Dessiné par le VRAI navigateur (Chromium). Depuis la racine : python3 tests/ui/titre-svg.py   (Pillow, numpy, scipy, OpenCV, scikit-image)
# EN: ⚠️ ADDED - test of the title SVG built from the 2026-10-19 logo: charter conformity, fidelity, two cyan lozenge crystals at the source positions, symmetric star, reproducible output.
import glob, io, os, re, subprocess, sys, tempfile
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from playwright.sync_api import sync_playwright
racine = os.getcwd()
SVG = f"{racine}/ressources-installateur/forge-armory/logo-titre/forge-armory-titre.svg"
PNG = f"{racine}/public/logo-forge-armory-texte.png"
SOURCE = f"{racine}/ressources-installateur/forge-armory/app-assets/assets/marque/logo-forge-armory.png"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
texte = open(SVG, encoding="utf-8").read()
racine_xml = ET.fromstring(texte.encode("utf-8"))
elements = {e.get("id"): e for e in racine_xml.iter() if e.get("id")}
balises = {e.tag.split("}")[1] for e in racine_xml.iter()}
ok("CHARTE : SVG bien formé, cadre 896 × 176 (le bloc titre de l'identité), nom accessible (`title`, `desc`, `role=\"img\"`)", racine_xml.get("viewBox") == "0 0 896 176" and racine_xml.get("role") == "img" and "title" in balises and "desc" in balises, [racine_xml.get("viewBox"), racine_xml.get("role")])
ok("CHARTE : AUCUNE police (pas de `text`, pas de `font`), AUCUN script, AUCUNE ressource externe (aucune adresse http, aucune image incorporée), texte en tracés", not ({"text", "tspan", "script", "image", "foreignObject", "style"} & balises) and not re.search(r"font-family|font-size|https?://(?!www\.w3\.org)|data:|<script", texte), sorted(balises))
ok("CHARTE : identifiants internes PRÉFIXÉS `fa-titre-` (aucune collision possible avec les autres visuels, en `<img>` comme en SVG intégré)", elements and all(i.startswith("fa-titre-") for i in elements), list(elements))
forge, armory = elements.get("fa-titre-cristal-forge"), elements.get("fa-titre-cristal-armory")
cyan_ok = all(e is not None and e.tag.endswith("}path") and "fa-titre-cristal-cyan" in (e.get("fill") or "") for e in (forge, armory))
ok("LES DEUX « O » ONT LEUR CRISTAL : deux éléments distincts, `fa-titre-cristal-forge` et `fa-titre-cristal-armory`, remplis d'un dégradé CYAN (l'image d'origine porte les deux cristaux ; rien n'est copié)", cyan_ok and "fa-titre-cristal-cyan" in elements, [None if e is None else e.get("fill") for e in (forge, armory)])
# ---------- dessin par le vrai navigateur ----------
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
def dessiner(largeur, hauteur, fond="transparent"):
    html = tempfile.NamedTemporaryFile("w", suffix=".html", delete=False); html.write(f'<html><body style="margin:0;background:{fond}"><img src="file://{SVG}" width="{largeur}" height="{hauteur}" style="display:block"></body></html>'); html.close()
    pg = nav.new_page(viewport={"width": largeur, "height": hauteur}); pg.goto("file://" + html.name); pg.wait_for_timeout(350)
    im = Image.open(io.BytesIO(pg.screenshot(omit_background=(fond == "transparent")))).convert("RGBA"); pg.close(); os.unlink(html.name); return im
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    petit = np.array(dessiner(803, 158)); natif = np.array(dessiner(896, 176))
    nav.close()
a = petit[..., 3] > 100; c = np.array(Image.open(PNG).convert("RGBA"))[..., 3] > 100
iou = lambda x, y: float((x & y).sum() / max(1, (x | y).sum()))
bandes = {"titre": (0, 75), "ligne et étoile": (76, 128), "sous-titre": (129, 157)}
mesures = {k: iou(a[y0:y1 + 1], c[y0:y1 + 1]) for k, (y0, y1) in bandes.items()}
ok("FIDÉLITÉ à l'image de l'en-tête (le navigateur dessine le SVG à 803 × 158 : silhouette comparée à `logo-forge-armory-texte.png`) : recouvrement global ≥ 94 %, titre ≥ 96 %, ligne et étoile ≥ 92 % (l'image porte la LUEUR de l'étoile, pas le SVG), sous-titre ≥ 82 %", iou(a, c) >= 0.94 and mesures["titre"] >= 0.96 and mesures["ligne et étoile"] >= 0.92 and mesures["sous-titre"] >= 0.82, {k: round(v, 3) for k, v in mesures.items()} | {"global": round(iou(a, c), 3)})
# ---------- les cristaux et l'étoile (dessin à l'échelle 1 : unités du cadre) ----------
r, g, b = (natif[..., i].astype(int) for i in range(3)); alpha = natif[..., 3]
cyan = ((b - r) > 100) & (alpha > 200)
def blobs(masque, y0, y1, mini):
    lab, n = ndi.label(masque[y0:y1]); out = []
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() < mini: continue
        ys, xs = np.where(m); out.append({"cx": float(xs.mean()), "cy": float(ys.mean()) + y0, "aire": int(m.sum()), "w": int(xs.max() - xs.min() + 1), "h": int(ys.max() - ys.min() + 1), "bx": (xs.min() + xs.max()) / 2, "by": (ys.min() + ys.max()) / 2 + y0})
    return sorted(out, key=lambda o: o["cx"])
cr = blobs(cyan, 0, 80, 100)
ok("LES DEUX CRISTAUX CYAN sont dessinés : deux formes bleues isolées dans la bande des lettres, de même taille (aire à 10 % près), l'une dans FORGE (à gauche), l'autre dans ARMORY (à droite)", len(cr) == 2 and cr[0]["cx"] < 250 and cr[1]["cx"] > 600 and abs(cr[0]["aire"] - cr[1]["aire"]) / cr[1]["aire"] < 0.10, cr)
ok("CE SONT DES LOSANGES NETS : l'aire d'un losange vaut la moitié de sa boîte (entre 44 % et 56 %), plus haut que large (hauteur ≥ 1,8 × largeur), et symétrique (centre de la boîte = centre de gravité à 0,5 unité)", len(cr) == 2 and all(0.44 <= o["aire"] / (o["w"] * o["h"]) <= 0.56 and o["h"] >= 1.8 * o["w"] and abs(o["cx"] - o["bx"]) <= 0.5 and abs(o["cy"] - o["by"]) <= 0.7 for o in cr), cr)
s = np.array(Image.open(SOURCE).convert("RGB")).astype(int)[788:964, 105:1001]
cs = ndi.binary_closing(((s[..., 2] - s[..., 0]) > 100)[:80], iterations=3); lab_s, ns = ndi.label(cs)
src = sorted([ndi.center_of_mass(lab_s == i) for i in range(1, ns + 1) if (lab_s == i).sum() >= 100], key=lambda c: c[1])
ecart = max(max(abs(o["cx"] - sx), abs(o["cy"] - sy)) for o, (sy, sx) in zip(cr, src)) if len(cr) == 2 and len(src) == 2 else 99
ok("FIDÉLITÉ DES CRISTAUX : chacun est exactement à l'endroit où il est dans TON image d'origine (écart ≤ 1 unité)", ecart <= 1.0, [round(ecart, 2), src])
et = blobs(cyan, 85, 150, 300)
ok("L'ÉTOILE du séparateur est CYAN, SYMÉTRIQUE (centre de la boîte = centre de gravité à 0,8 unité) et au centre de la ligne (x entre 436 et 460, y entre 105 et 125)", len(et) == 1 and 436 <= et[0]["cx"] <= 460 and 105 <= et[0]["cy"] <= 125 and abs(et[0]["cx"] - et[0]["bx"]) <= 0.8 and abs(et[0]["cy"] - et[0]["by"]) <= 0.8, et)
# ---------- reproductibilité ----------
with tempfile.TemporaryDirectory() as tmp:
    sortie = f"{tmp}/titre.svg"
    rr = subprocess.run([sys.executable, "scripts/generer-titre-svg.py", "--sortie", sortie], capture_output=True, text=True)
    ok("REPRODUCTIBLE : relancer `scripts/generer-titre-svg.py` depuis l'image d'origine redonne EXACTEMENT les mêmes octets que le fichier du projet", rr.returncode == 0 and os.path.exists(sortie) and open(sortie, "rb").read() == open(SVG, "rb").read(), (rr.stderr or rr.stdout)[-300:])
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

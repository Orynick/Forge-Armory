# FR : ⚠️ AJOUT (12/10/2026, v0.4.1) - test dans un VRAI NAVIGATEUR de la COULEUR obtenue par la recoloration des icônes de saut et de compétence de classe du Filobscur : une icône SYNTHÉTIQUE à fond bleu de Stase et glyphe blanc, affichée avec le filtre RÉEL de l'appli (lu dans
# `src/data/teinteIconesDoctrine.ts`) : le fond doit devenir vert (teinte du Filobscur de l'appli, ≈ 157°) et le glyphe rester blanc. Ne nécessite pas de page construite. Depuis la racine du projet : python3 tests/ui/teinte.py
# ⚠️ Limite : l'icône est synthétique (les vraies images de Bungie ne sont pas accessibles ici) ; le bleu réel de Bungie peut différer légèrement : le réglage est un seul nombre (voir le fichier cité).
import colorsys, glob, io, os, re, sys, base64
from playwright.sync_api import sync_playwright
from PIL import Image
racine = os.getcwd()
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
filtre = re.search(r'FILTRE_STASE_VERS_FILOBSCUR = "([^"]+)"', open(racine + "/src/data/teinteIconesDoctrine.ts", encoding="utf-8").read()).group(1)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:300]) if (detail and not cond) else "")
def teinte(rgb): h, s, v = colorsys.rgb_to_hsv(*(c / 255 for c in rgb)); return round(h * 360), round(s, 2), round(v, 2)
svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#3d6fb4"/><circle cx="32" cy="32" r="14" fill="#ffffff"/></svg>'
src = "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch(); pg = b.new_page(viewport={"width": 300, "height": 120})
    pg.set_content(f'<body style="margin:0;background:#000"><img id="a" src="{src}" width="64" height="64" style="display:block;float:left"><img id="b" src="{src}" width="64" height="64" style="display:block;float:left;margin-left:10px;filter:{filtre}"></body>')
    pg.wait_for_function("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"); pg.wait_for_timeout(200)
    def pixel(id, x, y):
        box = pg.locator("#" + id).bounding_box(); png = pg.screenshot(clip={"x": box["x"] + x, "y": box["y"] + y, "width": 1, "height": 1}); return Image.open(io.BytesIO(png)).convert("RGB").getpixel((0, 0))
    fond0, fond1, glyphe0, glyphe1 = pixel("a", 4, 4), pixel("b", 4, 4), pixel("a", 32, 32), pixel("b", 32, 32)
    b.close()
h0, s0, _ = teinte(fond0); h1, s1, v1 = teinte(fond1)
ok(f"témoin sans filtre : le fond synthétique est bien bleu de Stase (teinte {h0}°)", 200 <= h0 <= 230, fond0)
luma = lambda c: 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]   # luminosité perçue : le filtre la conserve (à quelques % près), pas le maximum des canaux
ok(f"avec le filtre « {filtre} » : le fond devient VERT (teinte {h1}° ; le vert du Filobscur de l'appli est à ≈ 157°, tolérance ±12°), reste saturé, et garde sa luminosité perçue à 15 % près ({luma(fond0):.0f} → {luma(fond1):.0f})", 145 <= h1 <= 169 and s1 >= 0.35 and abs(luma(fond1) - luma(fond0)) / luma(fond0) < 0.15, (fond0, fond1))
ok(f"le glyphe blanc reste blanc après le filtre (il n'est pas teinté : {glyphe1})", min(glyphe1) >= 235 and min(glyphe0) >= 235, (glyphe0, glyphe1))
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

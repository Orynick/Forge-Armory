# FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - test de FIDÉLITÉ de l'icône « arme façonnée » : (1) la forme : le chemin du module, rendu dans le navigateur à la taille de l'image de l'utilisateur, recouvre ses quatre blocs à plus de 96 % ; (2) la COULEUR : celle du module est celle mesurée sur la capture du jeu (blocs éclairés de l'icône, trait vert du cercle de l'utilisateur écarté). Les images sources sont dans ressources-installateur/forge-armory/icone-faconnee/.
# Dépendances de ce test (dans l'environnement de Claude, pas dans le projet) : numpy, opencv-python, Pillow. Depuis la racine du projet : python3 tests/ui/icone-faconnee.py
import glob, io, os, re, sys
import cv2, numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
racine = os.getcwd(); dossier = "ressources-installateur/forge-armory/icone-faconnee/"
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:300]) if (detail and not cond) else "")
mod = open("src/data/forge/iconeFaconnee.ts", encoding="utf-8").read()
couleur = re.search(r'couleur: "(#[0-9a-f]{6})"', mod).group(1); largeur = float(re.search(r"largeur: ([\d.]+)", mod).group(1)); hauteur = float(re.search(r"hauteur: ([\d.]+)", mod).group(1)); chemin = re.search(r'chemin: "([^"]+)"', mod).group(1)
# ---------- la forme ----------
img = cv2.imread(dossier + "source-icone-du-jeu.jpg"); gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
n, etiq, stats, _ = cv2.connectedComponentsWithStats((gris > 65).astype(np.uint8), connectivity=8)
blocs = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 2000]
x0 = min(stats[i, cv2.CC_STAT_LEFT] for i in blocs); y0 = min(stats[i, cv2.CC_STAT_TOP] for i in blocs); x1 = max(stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] for i in blocs); y1 = max(stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] for i in blocs)
x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)   # entiers Python (Playwright ne sérialise pas les entiers numpy)
ref = np.isin(etiq, blocs)[y0:y1, x0:x1]; W, H = x1 - x0, y1 - y0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch(); pg = b.new_page(viewport={"width": W + 20, "height": H + 20})
    pg.set_content(f'<body style="margin:0;background:#fff"><svg width="{W}" height="{H}" viewBox="0 0 {largeur} {hauteur}" style="display:block;margin:10px"><path d="{chemin}" fill="#000"/></svg></body>'); pg.wait_for_timeout(150)
    rendu = np.array(Image.open(io.BytesIO(pg.screenshot())).convert("L"))[10:10 + H, 10:10 + W] < 128
    b.close()
iou = (rendu & ref).sum() / max(1, (rendu | ref).sum())
ok(f"FORME : l'icône vectorisée, rendue à la taille de l'image de l'utilisateur, recouvre ses quatre blocs à {iou*100:.1f} % (seuil : 96 %)", iou > 0.96, iou)
ok("les quatre blocs de l'image source sont bien reconnus (4 composantes) : la mesure porte sur toute l'icône", len(blocs) == 4)
# ---------- la couleur ----------
cap = np.array(Image.open(dossier + "capture-icone-en-jeu.png").convert("RGB")).astype(int)
zone = cap[135:200, 5:95]; R, G, B = zone[..., 0], zone[..., 1], zone[..., 2]
vert = (G > R + 30) & (G > B + 20)
eclaire = (R > 200) & (R - G > 40) & (G > 110) & (G < 200) & ~vert
mesure = np.median(zone[eclaire], axis=0).astype(int); attendu = [int(couleur[i:i + 2], 16) for i in (1, 3, 5)]
ok(f"COULEUR : celle du module ({couleur}) est celle mesurée sur la capture du jeu (blocs éclairés : {mesure.tolist()}, {int(eclaire.sum())} pixels, trait vert exclu)", int(eclaire.sum()) > 100 and all(abs(int(a) - b2) <= 2 for a, b2 in zip(mesure, attendu)), (mesure.tolist(), attendu))
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

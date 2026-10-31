# FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - OUTIL PONCTUEL (hors fabrication du logiciel) : vectorise l'icône « arme façonnée » du jeu à partir de l'image fournie par l'utilisateur (ressources-installateur/forge-armory/icone-faconnee/source-icone-du-jeu.jpg) et écrit `src/data/forge/iconeFaconnee.ts` ainsi que `icone-faconnee.svg`. Le résultat est ENREGISTRÉ dans le projet : relancer cet outil n'est utile que si l'image source change.
# MÉTHODE : on trace avec précision UN quadrant (le bloc en haut à gauche) à son niveau de contour médian (entre le gris du bloc et son liseré sombre), puis on le REFLÈTE autour du centre de l'icône : symétrie parfaite par construction, sans le bruit de la compression JPEG. La fidélité est mesurée contre l'image (recouvrement des surfaces) et doit dépasser 97 %.
# COULEUR : #e49f87 (saumon corail), mesurée sur les blocs éclairés de la capture du jeu (capture-icone-en-jeu.png) ; l'image source, elle, est grise (icône du jeu sans teinte).
# Dépendances (pas dans le projet) : numpy, opencv-python, scikit-image. Usage, depuis la racine du projet : python3 scripts/tracer-icone-faconnee.py
# EN: ⚠️ ADDED - one-shot tool: traces the game's "crafted weapon" icon from the user's image (one quadrant, then mirrored) and writes the TS module and an SVG.
import cv2, numpy as np, os, sys
from skimage import measure
SRC = "ressources-installateur/forge-armory/icone-faconnee/source-icone-du-jeu.jpg"
COULEUR = "#e49f87"
img = cv2.imread(SRC); gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(float)
fond, bloc = 13.0, 117.0   # liseré sombre et gris des blocs (mesurés sur l'image)
champ = np.clip((gris - fond) / (bloc - fond), 0, 1)
masque = (gris > (fond + bloc) / 2).astype(np.uint8)
n, etiq, stats, cent = cv2.connectedComponentsWithStats(masque, connectivity=8)
blocs = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 2000]
assert len(blocs) == 4, f"4 blocs attendus, {len(blocs)} trouvés"
x0 = min(stats[i, cv2.CC_STAT_LEFT] for i in blocs); y0 = min(stats[i, cv2.CC_STAT_TOP] for i in blocs)
x1 = max(stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] for i in blocs); y1 = max(stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] for i in blocs)
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
hg = next(i for i in blocs if cent[i][0] < cx and cent[i][1] < cy)
zone = cv2.dilate((etiq == hg).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
contours = measure.find_contours(np.where(zone, champ, 0), 0.5)
c = max(contours, key=len)
poly = measure.approximate_polygon(c, tolerance=0.18)[:-1]            # (ligne, colonne)
pts = [(float(p[1]), float(p[0])) for p in poly]                        # (x, y)
echelle = 100.0 / max(x1 - x0, y1 - y0)
def norm(p): return ((p[0] - x0) * echelle, (p[1] - y0) * echelle)
L, H = (x1 - x0) * echelle, (y1 - y0) * echelle
hg_pts = [norm(p) for p in pts]
def refl(pp, fx, fy): return [((L - x) if fx else x, (H - y) if fy else y) for x, y in pp]
quadrants = [hg_pts, refl(hg_pts, True, False)[::-1], refl(hg_pts, True, True), refl(hg_pts, False, True)[::-1]]
# fidélité : mesurée AVANT le recadrage final (mêmes coordonnées que l'image)
toile = np.zeros(gris.shape, np.uint8)
for q in quadrants:
    cv2.fillPoly(toile, [np.array([[x / echelle + x0, y / echelle + y0] for x, y in q]).round().astype(np.int32)], 1)
ref = np.isin(etiq, blocs).astype(np.uint8)
iou = (toile & ref).sum() / max(1, (toile | ref).sum())
# RECADRAGE sur l'étendue RÉELLE du dessin (le contour sous-pixel déborde d'environ 0,1 % du rectangle entier mesuré sur l'image) : translation puis mise à l'échelle UNIFORME, donc la symétrie est conservée et le tracé remplit exactement le cadre
tous = [pt for q in quadrants for pt in q]
mx, Mx = min(p[0] for p in tous), max(p[0] for p in tous); my, My = min(p[1] for p in tous), max(p[1] for p in tous)
e2 = 100.0 / max(Mx - mx, My - my)
quadrants = [[((x - mx) * e2, (y - my) * e2) for x, y in q] for q in quadrants]
L, H = (Mx - mx) * e2, (My - my) * e2
def chemin(pp): return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in pp) + " Z"
d = " ".join(chemin(q) for q in quadrants)
print(f"quadrant : {len(hg_pts)} points ; icône {L:.2f} x {H:.2f} ; recouvrement avec l'image : {iou*100:.2f} %")
assert iou > 0.97, "fidélité insuffisante"
ts = f'''// FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - ICÔNE « ARME FAÇONNÉE » du jeu (demande de l'utilisateur : « pour les armes façonnées, le jeu utilise l'icône visible ici, avec une nuance de rouge en jeu »). FICHIER GÉNÉRÉ par `scripts/tracer-icone-faconnee.py` à partir de l'image de l'utilisateur (ressources-installateur/forge-armory/icone-faconnee/) : ne pas modifier à la main.
// Quatre blocs aux angles extérieurs arrondis, séparés par une croix évasée : un quadrant tracé puis reflété (symétrie parfaite). Couleur : saumon corail mesuré sur la capture du jeu. EN: ⚠️ GENERATED - the game's "crafted weapon" icon, traced from the user's image.
export const ICONE_FACONNEE = {{
  couleur: "{COULEUR}",
  largeur: {L:.2f},
  hauteur: {H:.2f},
  chemin: "{d}",
}} as const;
'''
open("src/data/forge/iconeFaconnee.ts", "w", encoding="utf-8").write(ts)
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {L:.2f} {H:.2f}" role="img" aria-label="Arme façonnée"><title>Arme façonnée</title><path d="{d}" fill="{COULEUR}"/></svg>\n'
open("ressources-installateur/forge-armory/icone-faconnee/icone-faconnee.svg", "w", encoding="utf-8").write(svg)
print("écrit : src/data/forge/iconeFaconnee.ts (", len(ts), "octets ) et icone-faconnee.svg")

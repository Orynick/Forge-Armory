#!/usr/bin/env python3
# FR : ⚠️ AJOUT (19/10/2026, v0.4.13), demande de l'utilisateur : « Génère un SVG du titre actualisé » puis « reprends simplement les visuels que j'ai envoyés ». OUTIL reproductible : VECTORISE le bloc titre de l'identité visuelle (« FORGE ARMORY », ligne à étoile cyan, sous-titre « DESTINY 2 BUILD ANALYZER | par Orynick/Orygamer ») à partir de l'image d'origine fournie le 19/10/2026 (le logo du kit `app-assets/assets/marque/logo-forge-armory.png`, 1092 x 1092 : les DEUX « O » y portent déjà leur cristal cyan), et écrit `ressources-installateur/forge-armory/logo-titre/forge-armory-titre.svg` (cadre 896 x 176 : le bloc texte de `generer-icones.py`).
# POURQUOI une vectorisation et non une recomposition : le mot-symbole est un dessin à part (son « O » est plus large que celui des titres de l'archive v5, son « E » diffère) ; recomposer avec les lettres des titres donnerait une imitation. Ici, ce sont les VRAIS contours du dessin de l'utilisateur ; RIEN n'est ajouté, copié ni dessiné à la main (les deux cristaux sont ceux de l'image).
# MÉTHODE : (1) argent neutre = canal minimal (R, G, B) ; cyan = bleu moins rouge (cristaux et étoile) ; (2) chaque bande (titre, ligne et étoile, sous-titre) est agrandie x8 (bicubique) puis ses contours sont extraits au niveau de demi-luminosité (marching squares, précision d'un huitième de pixel) ; (3) contours simplifiés (tolérance 0,12 px) et convertis en courbes de Bézier, les ANGLES VIFS (empattements, pointes) étant conservés ; (4) les cristaux (des LOSANGES) et l'étoile à quatre branches sont reconstruits à partir de leurs extrémités mesurées (le halo rend leur contour bruité ; la courbure des côtés de l'étoile est mesurée sur l'image) ; (5) remplissages d'après la charte : texte en dégradé vertical #ffffff -> #d4d9df -> #f2f4f6, cristaux et étoile en cyan, trou des lettres par `fill-rule: evenodd` (jamais peint en noir) ; aucune police, aucun script, aucune ressource externe ; identifiants préfixés `fa-titre-`.
# Usage : python3 scripts/generer-titre-svg.py   (numpy, Pillow, OpenCV, scikit-image) ; `--sortie <fichier>` pour écrire ailleurs.
# EN: ⚠️ ADDED - reproducible tool: vectorises the title block of the visual identity (wordmark, line with cyan star, subtitle) from the 2026-10-19 source (crystals in both O's), into a standalone SVG (no font, no script, no external reference). Nothing is added or drawn by hand.
import sys, pathlib
import numpy as np
from PIL import Image
import cv2
from skimage import measure
from scipy import ndimage

RACINE = pathlib.Path(__file__).resolve().parents[1]
SOURCE = RACINE / "ressources-installateur/forge-armory/app-assets/assets/marque/logo-forge-armory.png"   # le logo du KIT : aucune copie supplémentaire
SORTIE = RACINE / "ressources-installateur/forge-armory/logo-titre/forge-armory-titre.svg"
if "--sortie" in sys.argv: SORTIE = pathlib.Path(sys.argv[sys.argv.index("--sortie") + 1])
ZONE = (105, 788, 1001, 964)           # le même bloc texte que `generer-icones.py` : 896 × 176
ECHELLE = 8                            # agrandissement avant extraction des contours
NIVEAU_ARGENT, NIVEAU_CYAN = 100, 100  # demi-luminosité de l'argent (≈ 227 / 2) ; demi-teinte des cristaux et de l'étoile (bleu − rouge ≈ 200)
TOLERANCE, ANGLE_VIF = 0.12, 38
AIRE_MIN = 2.0                         # contours plus petits (px², bruit de reflet) ignorés ; le plus petit vrai détail (point d'un « i ») fait ≈ 7 px²

img = np.array(Image.open(SOURCE).convert("RGB").crop(ZONE)).astype(np.float32)
r, g, b = img[..., 0], img[..., 1], img[..., 2]
argent = np.minimum(np.minimum(r, g), b)        # clair ET neutre : ni l'étoile ni sa lueur
cyan = np.clip(b - r, 0, 255)                   # bleuté : l'étoile
# Le cœur d'un cristal (et celui de l'étoile) porte un REFLET presque blanc : il fait partie de l'objet, mais le masque cyan le coupe en deux.
# On le rattache, UNIQUEMENT à moins de 4 px d'une zone cyan : une lettre blanche n'est jamais prise pour un cristal.
voisin = ndimage.binary_dilation(cyan > 100, iterations=4)
reflet = np.clip(np.minimum(g, b) - 60, 0, 255) * (b > 200)
cyan = np.where(voisin, np.maximum(cyan, reflet), cyan)
H, W = argent.shape

def bandes():
    occ = ((argent > 60) | (cyan > 60)).sum(1) > 0
    out, d = [], None
    for y, v in enumerate(occ):
        if v and d is None: d = y
        if not v and d is not None: out.append((d, y - 1)); d = None
    if d is not None: out.append((d, H - 1))
    return out
BANDES = bandes()
assert len(BANDES) == 3, f"3 bandes attendues (titre, ligne, sous-titre), {len(BANDES)} trouvées : {BANDES}"
(T0, T1), (L0, L1), (S0, S1) = BANDES

def contours(canal, niveau, y0, y1):
    """Contours fermés (unités de la source), au niveau donné, pour la bande y0..y1 (marges nulles : aucun contour ouvert)."""
    sub = canal[y0:y1 + 1]; h, w = sub.shape
    grand = np.pad(cv2.resize(sub, (w * ECHELLE, h * ECHELLE), interpolation=cv2.INTER_CUBIC), 1)
    sortie = []
    for c in measure.find_contours(grand, niveau):
        if not np.allclose(c[0], c[-1]): continue
        p = np.column_stack(((c[:, 1] - 1 + 0.5) / ECHELLE, (c[:, 0] - 1 + 0.5) / ECHELLE + y0))
        if abs(aire(p)) >= AIRE_MIN: sortie.append(p)
    return sortie

def aire(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * float(np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y))

def simplifier(p, tolerance=None):
    q = measure.approximate_polygon(p, TOLERANCE if tolerance is None else tolerance)
    return q[:-1] if np.allclose(q[0], q[-1]) else q

def fmt(v): return (f"{v:.2f}").rstrip("0").rstrip(".")
def pt(p): return f"{fmt(p[0])} {fmt(p[1])}"

def chemin(p, tolerance=None):
    """Polygone → chemin SVG : courbes de Bézier lissées (tangentes de Catmull-Rom) sauf aux angles vifs, où le sommet reste anguleux."""
    p = simplifier(p, tolerance); n = len(p)
    if n < 3: return ""
    avant = p - np.roll(p, 1, axis=0); apres = np.roll(p, -1, axis=0) - p
    virage = np.abs((np.arctan2(apres[:, 1], apres[:, 0]) - np.arctan2(avant[:, 1], avant[:, 0]) + np.pi) % (2 * np.pi) - np.pi)
    vif = virage > np.radians(ANGLE_VIF)
    tang = np.roll(p, -1, axis=0) - np.roll(p, 1, axis=0)
    tang = tang / np.maximum(np.linalg.norm(tang, axis=1, keepdims=True), 1e-9)
    morceaux = [f"M{pt(p[0])}"]
    for i in range(n):
        j = (i + 1) % n; d = float(np.linalg.norm(p[j] - p[i]))
        if vif[i] and vif[j]: morceaux.append(f"L{pt(p[j])}")
        else:
            c1 = p[i] if vif[i] else p[i] + tang[i] * d / 3
            c2 = p[j] if vif[j] else p[j] - tang[j] * d / 3
            morceaux.append(f"C{pt(c1)} {pt(c2)} {pt(p[j])}")
    return "".join(morceaux) + "Z"

def losange(p):
    """Un cristal est un LOSANGE (quatre pointes). Le halo qui l'entoure rend son contour mesuré irrégulier (16 x 35 px dans la source) :
    on le reconstruit à partir de ses quatre EXTRÉMITÉS mesurées (haut, bas, gauche, droite), symétrique et net."""
    x0, x1, y0, y1 = boite(p)
    gauche = p[p[:, 0] <= x0 + 0.4]; droite = p[p[:, 0] >= x1 - 0.4]
    yc = (gauche[:, 1].mean() + droite[:, 1].mean()) / 2
    xc = (x0 + x1) / 2
    return f"M{pt((xc, y0))}L{pt((x1, yc))}L{pt((xc, y1))}L{pt((x0, yc))}Z"

COURBURE_ETOILE = 0.147   # point de contrôle des côtés concaves, en fraction du demi-axe : MESURÉ sur l'étoile de l'image (rayon de « taille » ≈ 0,46 de la pointe)
def etoile_symetrique(p):
    """L'étoile à quatre branches reconstruite à partir de ses quatre POINTES mesurées (le halo rend le contour mesuré de travers) ;
    côtés concaves = courbes quadratiques dont le point de contrôle est proche du centre."""
    x0, x1, y0, y1 = boite(p)
    xc, yc, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    cx_, cy_ = COURBURE_ETOILE * rx, COURBURE_ETOILE * ry
    return (f"M{pt((xc, y0))}Q{pt((xc + cx_, yc - cy_))} {pt((x1, yc))}Q{pt((xc + cx_, yc + cy_))} {pt((xc, y1))}"
            f"Q{pt((xc - cx_, yc + cy_))} {pt((x0, yc))}Q{pt((xc - cx_, yc - cy_))} {pt((xc, y0))}Z")

def boite(p): return p[:, 0].min(), p[:, 0].max(), p[:, 1].min(), p[:, 1].max()
def centre(p): x0, x1, y0, y1 = boite(p); return (x0 + x1) / 2, (y0 + y1) / 2
def dans(p, q):
    """p est entièrement dans la boîte de q."""
    a, b = boite(p), boite(q); return a[0] > b[0] and a[1] < b[1] and a[2] > b[2] and a[3] < b[3]

# ---------- 1. les lettres (argent) et les deux cristaux (cyan) ----------
cristaux = contours(cyan, NIVEAU_CYAN, T0, T1)
assert len(cristaux) == 2, f"2 cristaux cyan attendus (un dans chaque « O »), {len(cristaux)} trouvés"
def contenu_dans(p, q, marge=0.5):
    """p est ENTIÈREMENT dans la boîte de q (le contour d'un « O », qui entoure le cristal, n'y est jamais)."""
    a_, b_ = boite(p), boite(q); return a_[0] >= b_[0] - marge and a_[1] <= b_[1] + marge and a_[2] >= b_[2] - marge and a_[3] <= b_[3] + marge
# Le cœur d'un cristal est presque BLANC (reflet) : le masque d'argent y trouve des contours qui ne sont pas des lettres. On les écarte.
lettres = [q for q in contours(argent, NIVEAU_ARGENT, T0, T1) if not any(contenu_dans(q, c) for c in cristaux)]
assert len(lettres) == 13, f"13 contours attendus dans le titre (11 lettres, 2 contre-formes de « O » ; le creux des « R » est ouvert), {len(lettres)} trouvés"
cristaux.sort(key=lambda p: boite(p)[0])                                 # dans l'ordre de lecture : FORGE puis ARMORY
cristal_forge, cristal_armory = cristaux
contre_formes = sorted([q for q in lettres if aire(q) < 0 and (boite(q)[1] - boite(q)[0]) > 40], key=lambda q: boite(q)[0])
assert len(contre_formes) == 2 and dans(cristal_forge, contre_formes[0]) and dans(cristal_armory, contre_formes[1]), "chaque cristal doit se trouver dans la contre-forme d'un « O »"

# ---------- 2. la ligne, l'étoile, le sous-titre ----------
etoile = contours(cyan, NIVEAU_CYAN, L0, L1)
assert len(etoile) == 1, f"1 étoile attendue, {len(etoile)} trouvée(s)"
ligne = [q for q in contours(argent, NIVEAU_ARGENT, L0, L1) if not contenu_dans(q, etoile[0])]   # le reflet blanc au cœur de l'étoile n'est pas un segment de ligne
assert len(ligne) == 2, f"2 segments de ligne attendus, {len(ligne)} trouvés"
sous_titre = contours(argent, NIVEAU_ARGENT, S0, S1)

def d_de(liste): return "".join(chemin(p) for p in liste)
ex0, ex1, ey0, ey1 = boite(etoile[0]); ecx, ecy = (ex0 + ex1) / 2, (ey0 + ey1) / 2
svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<!-- Forge Armory : titre de l'en-tête (« FORGE ARMORY », ligne à étoile, sous-titre), avec les cristaux cyan des deux « O ». Généré par scripts/generer-titre-svg.py d'après l'image d'origine du 19/10/2026 (vectorisation) ; ne pas modifier à la main. Aucune police, aucun script, aucune ressource externe. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="fa-titre-intitule fa-titre-description">
  <title id="fa-titre-intitule">Forge Armory — Destiny 2 Build Analyzer, par Orynick/Orygamer</title>
  <desc id="fa-titre-description">Titre « FORGE ARMORY » en capitales argentées dont les deux « O » portent un cristal cyan, ligne argentée interrompue par une étoile cyan, et sous-titre « DESTINY 2 BUILD ANALYZER | par Orynick/Orygamer ».</desc>
  <defs>
    <linearGradient id="fa-titre-argent" gradientUnits="userSpaceOnUse" x1="0" y1="{T0}" x2="0" y2="{T1}">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.5" stop-color="#d4d9df"/>
      <stop offset="1" stop-color="#f2f4f6"/>
    </linearGradient>
    <radialGradient id="fa-titre-cyan" gradientUnits="userSpaceOnUse" cx="{fmt(ecx)}" cy="{fmt(ecy)}" r="{fmt(max(ex1 - ex0, ey1 - ey0) / 2)}">
      <stop offset="0" stop-color="#22b6ff"/>
      <stop offset="0.6" stop-color="#0cb3f2"/>
      <stop offset="1" stop-color="#05d8f4"/>
    </radialGradient>
    <linearGradient id="fa-titre-cristal-cyan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4fe0ff"/>
      <stop offset="0.5" stop-color="#1ca7e9"/>
      <stop offset="1" stop-color="#2fc3fb"/>
    </linearGradient>
  </defs>
  <g fill-rule="evenodd">
    <path id="fa-titre-lettres" fill="url(#fa-titre-argent)" d="{d_de(lettres)}"/>
    <path id="fa-titre-cristal-forge" fill="url(#fa-titre-cristal-cyan)" d="{losange(cristal_forge)}"/>
    <path id="fa-titre-cristal-armory" fill="url(#fa-titre-cristal-cyan)" d="{losange(cristal_armory)}"/>
    <path id="fa-titre-ligne" fill="#d9dde2" opacity="0.9" d="{d_de(ligne)}"/>
    <path id="fa-titre-etoile" fill="url(#fa-titre-cyan)" d="{etoile_symetrique(etoile[0])}"/>
    <path id="fa-titre-sous-titre" fill="#e3e3e3" d="{d_de(sous_titre)}"/>
  </g>
</svg>
'''
SORTIE.parent.mkdir(parents=True, exist_ok=True)
SORTIE.write_text(svg, encoding="utf-8")
print(f"✅ {SORTIE.relative_to(RACINE) if SORTIE.is_relative_to(RACINE) else SORTIE} : {len(svg) / 1024:.0f} Ko ; {len(lettres)} contours de lettres, 2 cristaux, 1 étoile, {len(sous_titre)} contours de sous-titre")

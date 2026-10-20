"""
FR : régénère TOUS les fichiers dérivés de l'IDENTITÉ VISUELLE Forge Armory à
partir de l'image d'origine `identite-forge-armory-source.png` (fournie par
l'utilisateur le 01/10/2026). Outil de Claude : demande Python avec Pillow, numpy
et scipy, absents du PC de travail. À lancer depuis la racine du projet :
    python ressources-installateur/forge-armory/generer-icones.py

Produit (tous à fond transparent, sauf l'icône et les favicons, sur fond noir) :
  - public/logo-forge-armory-embleme.png   emblème (losanges et flèches compris)
  - public/logo-forge-armory-texte.png     bloc texte : « Forge Armory », ligne
                                           de séparation, « Destiny 2 Build Analyzer
                                           | par Orynick/Orygamer »
  - public/favicon-16.png, -32.png, -48.png   favicons (papillon seul)
  - ressources-installateur/icon.ico       icône Windows : PAPILLON SEUL en 16, 24 et
                                           32 px (lisible), EMBLÈME COMPLET en 48, 64,
                                           128 et 256 px
Le filigrane des fiches exportées n'en dépend pas : il vient du SVG vectoriel
(`forge-armory-emblem.svg`, voir `src/data/emblemeForgeArmory.ts`).

Géométrie (image d'origine 1254 x 1254, mesurée le 01/10/2026) :
  - cercle : centre (626,2 ; 443,6), rayon extérieur 290,8 (haut y = 152,8, bas y = 734,4) ;
  - emblème : x 251 à 999, y 33 à 878 ; bloc texte : x 124 à 1144, y 911 à 1101
    (titre y 911-993, ligne 1010-1064, sous-titre 1074-1101).
EN: regenerates every file derived from the Forge Armory visual identity image.
"""
import io, struct, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

RACINE = pathlib.Path(__file__).resolve().parents[2]
DOSSIER = pathlib.Path(__file__).resolve().parent
source = Image.open(DOSSIER / "identite-forge-armory-source.png").convert("RGB")
a = np.array(source).astype(float)

def transparent(zone):
    """Fond noir -> transparent : l'opacité suit la luminosité (couleurs dé-prémultipliées)."""
    x0, y0, x1, y1 = zone
    morceau = a[y0:y1, x0:x1]
    alpha = morceau.max(axis=2)
    rgb = np.where(alpha[..., None] > 0, np.clip(morceau * 255 / np.maximum(alpha[..., None], 1), 0, 255), 0)
    return Image.fromarray(np.dstack([rgb, alpha]).astype("uint8"), "RGBA")

(RACINE / "public").mkdir(exist_ok=True)

# --- 1. emblème et bloc texte pour l'en-tête de l'appli ----------------------
ZONE_EMBLEME = (245, 28, 1005, 884)    # 760 x 856
ZONE_TEXTE = (120, 905, 1149, 1107)    # 1029 x 202
embleme = transparent(ZONE_EMBLEME)
# FR : tailles d'affichage dans l'en-tête (échelle 0,37 : voir src/lib/enTete/geometrieIdentite.ts) :
# emblème ~92 px de large, bloc texte ~381 px. On garde environ 3,3 FOIS cette taille
# (net sur un écran Windows dense, DPR 2 à 3) : les images d'origine pèsent
# 339 Ko, trop pour un en-tête ; ainsi ~150 Ko au total.
# EN: kept at ~3.3x the display size: crisp on dense screens, much lighter.
embleme = embleme.resize((round(embleme.width * 0.4), round(embleme.height * 0.4)), Image.LANCZOS)   # 304 x 342
embleme.save(RACINE / "public" / "logo-forge-armory-embleme.png", optimize=True)
texte = transparent(ZONE_TEXTE)
texte = texte.resize((round(texte.width * 0.78), round(texte.height * 0.78)), Image.LANCZOS)         # 803 x 158
texte.save(RACINE / "public" / "logo-forge-armory-texte.png", optimize=True)

# --- 2. papillon seul (petites tailles), isolé PAR FORME -----------------------
# (composantes connexes du blanc, pas un masque circulaire : voir archives-precedentes/ancien-logo/forge-armory-v1)
CERCLE_X, CERCLE_Y, RAYON_MAX_PAPILLON = 626.2, 443.6, 268
yy, xx = np.mgrid[0 : a.shape[0], 0 : a.shape[1]]
rayon = np.hypot(xx - CERCLE_X, yy - CERCLE_Y)
bleu = a[:, :, 2] > a[:, :, 0] + 40
etiquettes, n = ndimage.label((a.min(axis=2) > 60) & ~bleu)
indices = range(1, n + 1)
rayon_max = ndimage.maximum(rayon, etiquettes, index=indices)
taille = ndimage.sum(np.ones_like(rayon), etiquettes, index=indices)
gardees = [i + 1 for i in range(n) if rayon_max[i] < RAYON_MAX_PAPILLON and taille[i] > 200]
masque = ndimage.binary_dilation(np.isin(etiquettes, gardees), iterations=3)
ys, xs = np.where(masque)
cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
demi = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2 * 1.12
papillon = Image.fromarray((a * masque[..., None]).astype("uint8")).crop((int(cx - demi), int(cy - demi), int(cx + demi), int(cy + demi)))

# --- 3. emblème complet sur fond noir (grandes tailles de l'icône) ---------------
complet = source.crop((625 - 445, 455 - 445, 625 + 445, 455 + 445))

# --- 4. favicons (papillon seul, fond noir : lisible sur onglet clair ou sombre) -----
for t in (16, 32, 48):
    papillon.resize((t, t), Image.LANCZOS).save(RACINE / "public" / f"favicon-{t}.png", optimize=True)

# --- 5. icône Windows : une image PAR taille, entrées PNG (comme l'ancienne) ----------
tailles = {16: papillon, 24: papillon, 32: papillon, 48: complet, 64: complet, 128: complet, 256: complet}
blocs = []
for t, img in tailles.items():
    tampon = io.BytesIO()
    img.resize((t, t), Image.LANCZOS).convert("RGBA").save(tampon, "PNG", optimize=True)
    blocs.append((t, tampon.getvalue()))
entete = struct.pack("<HHH", 0, 1, len(blocs))
offset = 6 + 16 * len(blocs)
repertoire, donnees = b"", b""
for t, png in blocs:
    repertoire += struct.pack("<BBBBHHII", t % 256, t % 256, 0, 0, 1, 32, len(png), offset + len(donnees))
    donnees += png
(RACINE / "ressources-installateur" / "icon.ico").write_bytes(entete + repertoire + donnees)
print("fichiers régénérés (papillon : %d pièces, rayon max %.0f px)." % (len(gardees), max(rayon_max[g - 1] for g in gardees)))

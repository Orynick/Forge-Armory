"""
FR : régénère TOUS les fichiers dérivés du logo Forge Armory à partir de
l'image d'origine `logo-forge-armory-source.png` (outil de Claude : demande
Python avec Pillow, numpy et scipy, absents du PC de travail). À lancer depuis la
racine du projet :  python ressources-installateur/forge-armory/generer-icones.py

Produit :
  - logo-forge-armory-transparent.png   (ici)  logo complet à fond transparent
  - public/logo-forge-armory.png        logo de l'en-tête de l'appli (540 px de haut)
  - public/favicon-16.png, favicon-32.png, favicon-48.png   favicons (papillon seul)
  - ressources-installateur/icon.ico    icône Windows (installateur, raccourci,
                                        barre des tâches) : PAPILLON SEUL en 16,
                                        24 et 32 px (lisible), LOGO COMPLET en
                                        48, 64, 128 et 256 px

Géométrie (mesurée sur l'image d'origine, 1254 x 1254) : cercle de centre
(623,9 ; 598,3) et de rayon extérieur 388,4 ; étendue utile x = 149 à 1099,
y = 81 à 1140 (losanges compris).
EN: regenerates every derived logo file from the source image.
"""
import io, struct, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

RACINE = pathlib.Path(__file__).resolve().parents[2]
DOSSIER = pathlib.Path(__file__).resolve().parent
source = Image.open(DOSSIER / "logo-forge-armory-source.png").convert("RGB")
a = np.array(source).astype(float)

# --- 1. fond transparent : l'opacité suit la luminosité ---------------------
alpha = a.max(axis=2)
rgb = np.where(alpha[..., None] > 0, np.clip(a * 255 / np.maximum(alpha[..., None], 1), 0, 255), 0)
transparent = Image.fromarray(np.dstack([rgb, alpha]).astype("uint8"), "RGBA")
transparent.save(DOSSIER / "logo-forge-armory-transparent.png", optimize=True)

# --- 2. logo de l'en-tête : recadré sur l'étendue utile, réduit --------------
BBOX = (149, 81, 1100, 1141)  # x0, y0, x1, y1 (losanges et flèches compris)
en_tete = transparent.crop(BBOX)
# FR : 540 px de haut (01/10/2026, demande de l'utilisateur : « un logo de bonne
# qualité ») : le logo s'affiche à ~80 px de haut dans l'en-tête sur deux lignes ;
# 540 px couvrent les écrans jusqu'à ~6,5 fois plus denses qu'un écran standard,
# sans perte de netteté. / EN: 540 px tall for a crisp header logo on dense screens.
hauteur = 540
en_tete = en_tete.resize((round(en_tete.width * hauteur / en_tete.height), hauteur), Image.LANCZOS)
(RACINE / "public").mkdir(exist_ok=True)
en_tete.save(RACINE / "public" / "logo-forge-armory.png", optimize=True)

# --- 3. papillon seul (petites tailles) : sans losanges, cercle ni flèches ---
# Isolé PAR FORME (composantes connexes du blanc), pas par un masque circulaire :
# les pointes des ailes arrivent à ~340 px du centre du cercle, alors que le
# halo intérieur de l'anneau commence vers 336 px - un rayon de coupe ne peut pas
# séparer les deux (essai du 01/10/2026 : restes d'anneau dans les coins).
# On garde les pièces blanches (ailes, tête) qui ne touchent NI l'anneau, NI les
# losanges, NI les flèches (rayon maximal < 366 px), élargies de 3 px pour garder
# l'anti-crénelage.
CERCLE_X, CERCLE_Y, RAYON_INTERNE_ANNEAU = 623.9, 598.3, 366
yy, xx = np.mgrid[0 : a.shape[0], 0 : a.shape[1]]
rayon = np.hypot(xx - CERCLE_X, yy - CERCLE_Y)
etiquettes, n = ndimage.label(a.min(axis=2) > 60)
indices = range(1, n + 1)
rayon_max = ndimage.maximum(rayon, etiquettes, index=indices)
taille = ndimage.sum(np.ones_like(rayon), etiquettes, index=indices)
gardees = [i + 1 for i in range(n) if rayon_max[i] < RAYON_INTERNE_ANNEAU and taille[i] > 50]
masque = ndimage.binary_dilation(np.isin(etiquettes, gardees), iterations=3)
m = a * masque[..., None]
CX, CY = 626, 618  # centre du CADRAGE (centre du papillon), différent de celui du cercle
papillon = Image.fromarray(m.astype("uint8")).crop((CX - 300, CY - 300, CX + 300, CY + 300))

# --- 4. logo complet sur fond noir (grandes tailles de l'icône) -------------
complet = source.crop((624 - 559, 611 - 559, 624 + 559, 611 + 559))

# --- 5. favicons (papillon seul, fond noir : lisible sur onglet clair ou sombre) ---
for t in (16, 32, 48):
    papillon.resize((t, t), Image.LANCZOS).save(RACINE / "public" / f"favicon-{t}.png", optimize=True)

# --- 6. icône Windows : une image PAR taille, entrées PNG (comme l'ancienne) ---
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
print("fichiers régénérés.")

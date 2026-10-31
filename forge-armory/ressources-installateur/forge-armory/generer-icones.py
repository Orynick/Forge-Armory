"""
FR : régénère TOUS les fichiers dérivés de l'IDENTITÉ VISUELLE Forge Armory à
partir du logo du kit de visuels `app-assets/assets/marque/logo-forge-armory.png` (aussi présent dans `public/assets/marque/`), fourni par
l'utilisateur le 19/10/2026 (1092 x 1092 : le logo AVEC les cristaux cyan dans
les DEUX « O » de « FORGE ARMORY »), et de la planche de déclinaisons du même
jour (icône d'application, monochromes, favicons, tailles).
Outil de Claude : demande Python avec Pillow, numpy et scipy, absents du PC de
travail. À lancer depuis la racine du projet :
    python ressources-installateur/forge-armory/generer-icones.py

Produit pour l'APPLI :
  - public/logo-forge-armory-embleme.png   304 x 342, fond transparent (losanges et flèches compris)
  - public/logo-forge-armory-texte.png     803 x 158, fond transparent : « Forge Armory » (les deux « O » portent
                                           leur cristal cyan, tel que dessiné dans l'image d'origine), ligne
                                           à étoile, « Destiny 2 Build Analyzer | par Orynick/Orygamer »
  - public/favicon-16.png, -32.png, -48.png   favicons : l'ICÔNE D'APPLICATION (tuile sombre arrondie) réduite
  - ressources-installateur/icon.ico       icône Windows : l'icône d'application en 16, 24, 32, 48, 64, 128, 256 px
Produit pour la DIFFUSION (`ressources-installateur/forge-armory/declinaisons/`, non livré avec l'appli) :
  logo-complet.png/.webp, icone-app-512.png/.webp, monochrome-blanc-sur-noir.png, monochrome-noir-sur-blanc.png,
  emblem-1024/512/256/128/64/32.png, favicon-16/32.png, favicon.ico, papillon-seul-256.png
Le filigrane des fiches exportées n'en dépend pas : il vient du SVG vectoriel
(`forge-armory-emblem.svg`, voir `src/data/emblemeForgeArmory.ts`).

HISTORIQUE : jusqu'au 19/10/2026 la source était l'image du 01/10/2026 (1254 x 1254, conservée dans
`archives-precedentes/identite-forge-armory-source-2026-10-01.png`) et le générateur DESSINAIT un cristal gris dans le « O » de FORGE (aux bords crénelés).
La nouvelle image contient les deux cristaux : plus rien n'est dessiné ni copié à la main.

Géométrie : la nouvelle image est l'ancienne à l'ÉCHELLE 0,8712 (mesurée par le diamètre du cercle ; l'encre du
texte de l'ancienne image, transportée, tombe à moins d'un pixel de la mesure). Les zones de découpe sont les
anciennes zones transportées par cette similitude, et les images de l'en-tête gardent EXACTEMENT les mêmes
dimensions (304 x 342 et 803 x 158) : `src/lib/enTete/geometrieIdentite.ts` (mesures dans le repère de l'ancienne
image) reste donc valable sans changement.
  - cercle : centre (545,5 ; 385,5), diamètre 504 (hauteur 503, largeur 505) ;
  - emblème : x 218 à 871, y 30 à 764 ; bloc texte : x 108 à 996, y 793 à 959
    (titre y 793-865, ligne 880-927, sous-titre 935-959).
EN: regenerates every file derived from the Forge Armory visual identity image (2026-10-19 source, crystals in both O's).
"""
import io, struct, pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

RACINE = pathlib.Path(__file__).resolve().parents[2]
DOSSIER = pathlib.Path(__file__).resolve().parent
DECLINAISONS = DOSSIER / "declinaisons"
SOURCE_LOGO = DOSSIER / "app-assets" / "assets" / "marque" / "logo-forge-armory.png"   # le logo du KIT (copie intacte de l'archive de visuels) : aucune copie supplémentaire
source = Image.open(SOURCE_LOGO).convert("RGB")
assert source.size == (1092, 1092), f"image source de 1092 x 1092 attendue, {source.size} trouvée"
a = np.array(source).astype(float)

def transparent(zone):
    """Fond noir -> transparent : l'opacité suit la luminosité (couleurs dé-prémultipliées)."""
    x0, y0, x1, y1 = zone
    morceau = a[y0:y1, x0:x1]
    alpha = morceau.max(axis=2)
    rgb = np.where(alpha[..., None] > 0, np.clip(morceau * 255 / np.maximum(alpha[..., None], 1), 0, 255), 0)
    return Image.fromarray(np.dstack([rgb, alpha]).astype("uint8"), "RGBA")

(RACINE / "public").mkdir(exist_ok=True)
DECLINAISONS.mkdir(exist_ok=True)

# --- 1. emblème et bloc texte pour l'en-tête de l'appli ----------------------
# FR : anciennes zones (245,28,1005,884) et (120,905,1149,1107) transportées par la similitude du cercle (échelle 0,8712).
ZONE_EMBLEME = (214, 24, 876, 770)     # 662 x 746
ZONE_TEXTE = (105, 788, 1001, 964)     # 896 x 176
embleme_plein = transparent(ZONE_EMBLEME)
texte_plein = transparent(ZONE_TEXTE)
# FR : tailles d'affichage dans l'en-tête (échelle 0,37 : voir src/lib/enTete/geometrieIdentite.ts) : emblème ~92 px
# de large, bloc texte ~381 px. On garde environ 3,3 FOIS cette taille (net sur un écran Windows dense).
# EN: kept at ~3.3x the display size: crisp on dense screens, much lighter.
embleme = embleme_plein.resize((304, 342), Image.LANCZOS)
embleme.save(RACINE / "public" / "logo-forge-armory-embleme.png", optimize=True)
texte = texte_plein.resize((803, 158), Image.LANCZOS)
texte.save(RACINE / "public" / "logo-forge-armory-texte.png", optimize=True)

# --- 2. papillon seul, isolé PAR FORME (composantes connexes du blanc, pas un masque circulaire) -----
CERCLE_X, CERCLE_Y, RAYON_MAX_PAPILLON = 545.7, 386.5, 233.5      # anciennes valeurs (626,2 ; 443,6 ; 268) x 0,8712
yy, xx = np.mgrid[0 : a.shape[0], 0 : a.shape[1]]
rayon = np.hypot(xx - CERCLE_X, yy - CERCLE_Y)
bleu = a[:, :, 2] > a[:, :, 0] + 40
etiquettes, n = ndimage.label((a.min(axis=2) > 60) & ~bleu)
indices = range(1, n + 1)
rayon_max = ndimage.maximum(rayon, etiquettes, index=indices)
taille = ndimage.sum(np.ones_like(rayon), etiquettes, index=indices)
gardees = [i + 1 for i in range(n) if rayon_max[i] < RAYON_MAX_PAPILLON and taille[i] > 150]
masque = ndimage.binary_dilation(np.isin(etiquettes, gardees), iterations=2)
ys, xs = np.where(masque)
cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
demi = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2 * 1.12
papillon = Image.fromarray((a * masque[..., None]).astype("uint8")).crop((int(cx - demi), int(cy - demi), int(cx + demi), int(cy + demi)))

# --- 3. emblème complet, carré (tailles courantes) ----------------------------------------------------
CENTRE_COMPLET, DEMI_COMPLET = (544.6, 396.4), 388      # ancien (625 ; 455) et 445 x 0,8712
CROP_COMPLET = (round(CENTRE_COMPLET[0] - DEMI_COMPLET), round(CENTRE_COMPLET[1] - DEMI_COMPLET), round(CENTRE_COMPLET[0] + DEMI_COMPLET), round(CENTRE_COMPLET[1] + DEMI_COMPLET))
emblem_carre = transparent(CROP_COMPLET)                # fond transparent, 776 x 776

# --- 4. icône d'APPLICATION (planche du 19/10/2026) : tuile sombre arrondie portant l'emblème ---------------
def tuile(t, hauteur_relative=0.88):
    """Carré arrondi sombre (dégradé bleu nuit, liseré bleu lumineux), emblème centré : ses cristaux atteignent ~88 % de la hauteur (comme sur la planche)."""
    T = t * 4                                             # dessin sur-échantillonné x4 puis réduit : bords nets
    echelle_t = T / 2048
    masque_t = Image.new("L", (T, T), 0)
    ImageDraw.Draw(masque_t).rounded_rectangle((0, 0, T - 1, T - 1), radius=int(0.215 * T), fill=255)
    haut, bas = np.array([9, 15, 28], float), np.array([4, 7, 14], float)
    ligne = np.linspace(0, 1, T)
    fond_rgb = np.repeat((haut[None, :] * (1 - ligne)[:, None] + bas[None, :] * ligne[:, None])[:, None, :], T, axis=1)
    gy, gx = np.mgrid[0:T, 0:T]
    lueur_centre = np.exp(-((gx - T / 2) ** 2 + (gy - T / 2) ** 2) / (2 * (0.34 * T) ** 2))
    fond_rgb = fond_rgb + lueur_centre[..., None] * np.array([3, 7, 15])
    image = Image.fromarray(np.clip(fond_rgb, 0, 255).astype("uint8"), "RGB").convert("RGBA")
    # liseré : anneau bleu (≈ 2,2 px à 512 px), avec halo diffus
    epaisseur = max(1, round(1.6 * (t / 512) * 4))
    erode = masque_t.filter(ImageFilter.MinFilter(2 * epaisseur + 1))
    anneau = np.array(masque_t).astype(float) - np.array(erode).astype(float)
    halo = ndimage.gaussian_filter(anneau, 9 * (t / 512) * 4)
    calque = np.zeros((T, T, 4)); calque[..., 0], calque[..., 1], calque[..., 2] = 30, 110, 220
    calque[..., 3] = np.clip(halo * 1.0, 0, 80)
    image = Image.alpha_composite(image, Image.fromarray(calque.astype("uint8"), "RGBA"))
    calque2 = np.zeros((T, T, 4)); calque2[..., 0], calque2[..., 1], calque2[..., 2] = 58, 110, 178
    calque2[..., 3] = np.clip(anneau, 0, 255) * 0.75
    image = Image.alpha_composite(image, Image.fromarray(calque2.astype("uint8"), "RGBA"))
    # emblème : l'encre fait 734 px de haut dans la zone de 746 ; on le met à l'échelle pour qu'il occupe `hauteur_relative`
    echelle = hauteur_relative * T / 734
    e = embleme_plein.resize((round(embleme_plein.width * echelle), round(embleme_plein.height * echelle)), Image.LANCZOS)
    cx_ink, cy_ink = ((218 + 871) / 2 - ZONE_EMBLEME[0]) * echelle, ((30 + 764) / 2 - ZONE_EMBLEME[1]) * echelle     # centre de l'encre dans la zone
    image.alpha_composite(e, (round(T / 2 - cx_ink), round(T / 2 - cy_ink)))
    sortie = image.resize((t, t), Image.LANCZOS)
    m = masque_t.resize((t, t), Image.LANCZOS)
    r, g, b, al = sortie.split()
    return Image.merge("RGBA", (r, g, b, Image.fromarray((np.array(al).astype(float) * np.array(m) / 255).astype("uint8"))))

app_1024 = tuile(1024)
def tuile_taille(t): return app_1024.resize((t, t), Image.LANCZOS)
tuile_taille(512).save(DECLINAISONS / "icone-app-512.png", optimize=True)
tuile_taille(512).save(DECLINAISONS / "icone-app-512.webp", quality=92, method=6)

# --- 5. favicons et icône Windows : l'icône d'application, une image PAR taille, entrées PNG -------------------
def ico(chemin, tailles):
    blocs = []
    for t in tailles:
        tampon = io.BytesIO(); tuile_taille(t).save(tampon, "PNG", optimize=True); blocs.append((t, tampon.getvalue()))
    entete = struct.pack("<HHH", 0, 1, len(blocs)); offset = 6 + 16 * len(blocs); repertoire, donnees = b"", b""
    for t, png in blocs:
        repertoire += struct.pack("<BBBBHHII", t % 256, t % 256, 0, 0, 1, 32, len(png), offset + len(donnees)); donnees += png
    chemin.write_bytes(entete + repertoire + donnees)
for t in (16, 32, 48):
    tuile_taille(t).save(RACINE / "public" / f"favicon-{t}.png", optimize=True)
ico(RACINE / "ressources-installateur" / "icon.ico", (16, 24, 32, 48, 64, 128, 256))

# --- 6. déclinaisons de diffusion ------------------------------------------------------------------------
logo_complet = transparent((0, 0, 1092, 1092))
logo_complet.save(DECLINAISONS / "logo-complet.png", optimize=True)
logo_complet.save(DECLINAISONS / "logo-complet.webp", quality=92, method=6)
for t in (1024, 512, 256, 128, 64, 32):
    emblem_carre.resize((t, t), Image.LANCZOS).save(DECLINAISONS / f"emblem-{t}.png", optimize=True)
papillon.resize((256, 256), Image.LANCZOS).save(DECLINAISONS / "papillon-seul-256.png", optimize=True)
for t in (16, 32): tuile_taille(t).save(DECLINAISONS / f"favicon-{t}.png", optimize=True)
ico(DECLINAISONS / "favicon.ico", (16, 32))

# Monochromes : formes pleines (argent ET cristaux), sans lueur ni matière. Argent = canal minimal (clair ET neutre) ;
# cristaux = bleu nettement au-dessus du rouge. Masque doux (bords nets mais non crénelés).
z = a[CROP_COMPLET[1]:CROP_COMPLET[3], CROP_COMPLET[0]:CROP_COMPLET[2]]
argent = np.clip((z.min(axis=2) - 70) / 80, 0, 1)
cristal = np.clip(((z[..., 2] - z[..., 0]) - 90) / 80, 0, 1) * (z[..., 2] > 140)
forme = ndimage.gaussian_filter(np.maximum(argent, cristal), 0.6)
def monochrome(taille, couleur, fond, tuile_arrondie):
    emb = Image.fromarray((np.clip(forme, 0, 1) * 255).astype("uint8"), "L").resize((round(taille * 0.84), round(taille * 0.84)), Image.LANCZOS)
    toile = Image.new("RGBA", (taille, taille), fond + (255,))
    calque = Image.new("RGBA", emb.size, couleur + (255,)); calque.putalpha(emb)
    toile.alpha_composite(calque, ((taille - emb.width) // 2, (taille - emb.height) // 2))
    if tuile_arrondie:
        m = Image.new("L", (taille * 4, taille * 4), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, taille * 4 - 1, taille * 4 - 1), radius=int(0.215 * taille * 4), fill=255)
        toile.putalpha(m.resize((taille, taille), Image.LANCZOS))
    return toile
monochrome(1024, (255, 255, 255), (0, 0, 0), False).save(DECLINAISONS / "monochrome-blanc-sur-noir.png", optimize=True)
monochrome(1024, (0, 0, 0), (255, 255, 255), True).save(DECLINAISONS / "monochrome-noir-sur-blanc.png", optimize=True)
print("fichiers régénérés (papillon : %d pièces, rayon max %.0f px)." % (len(gardees), max(rayon_max[g - 1] for g in gardees)))

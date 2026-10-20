# FR : ⚠️ AJOUT (21/10/2026), demande de l'utilisateur (capture d'écran annotée) : « mets les deux boutons Carrière et Accomplissements à l'endroit indiqué par ma capture d'écran. Les deux doivent être alignés et à la même taille. Masqués lorsque le joueur n'est pas connecté. » - TEST D'INTERFACE du bloc Connexion, dans un vrai navigateur, avec le vrai composant `BoutonsVuesCompte`, le vrai titre et la vraie feuille de style : (1) MÊME TAILLE (largeur, hauteur, anneau, bord droit de la plaque mesurés sur les PIXELS) ; (2) ALIGNÉS (même bord gauche, Carrière au-dessus) ; (3) EMPLACEMENT : entre le titre et le statut « connecté », centrés dans la place libre, à la hauteur du titre et du compte ; (4) MASQUÉS hors connexion et mise en page inchangée ; (5) fenêtre étroite : retour à l'empilement, sans défilement horizontal ; (6) clics ; (7) câblage dans `DashboardPage`. Depuis la racine : node tests/ui/build.mjs connexion-boutons && python3 tests/ui/connexion-boutons.py   (Pillow, numpy)
# EN: ⚠️ ADDED - UI test of the Connection block: the two buttons have the same size (measured on pixels), are aligned, sit between the title and the status, are hidden when logged out, fall back on a narrow window, and are wired in DashboardPage.
import glob, io, os, re, sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
racine = os.getcwd()
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
PAGE = "file://" + racine + "/tests/ui/_sortie/connexion-boutons.html"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
lire = lambda f: open(f"{racine}/{f}", encoding="utf-8").read()

# ---------- 0. câblage dans le code source ----------
dash, comp, css = lire("src/pages/DashboardPage.tsx"), lire("src/components/BoutonsVuesCompte.tsx"), lire("src/index.css")
ok("CÂBLAGE : `DashboardPage` monte `BoutonsVuesCompte` UNE seule fois, DANS `connecte &&` (masqué hors connexion), avec l'ouverture de la fenêtre Carrière et du tiroir Accomplissements ; plus aucun appel direct de `urlVisuel`", len(re.findall(r"<BoutonsVuesCompte", dash)) == 1 and re.search(r"\{connecte && <BoutonsVuesCompte onCarriere=\{\(\) => setCarriereOuverte\(true\)\} onAccomplissements=\{\(\) => setTiroirTriomphesOuvert\(true\)\} />\}", dash) and "urlVisuel(" not in dash)
ok("CÂBLAGE : la carte Connexion ne passe en grille (`pilier-carte--connexion`) QUE connectée, et la ligne du compte porte `connexion-compte`", 'className={`pilier-carte${connecte ? " pilier-carte--connexion" : ""}`}' in dash and len(re.findall(r'className="connexion-compte"', dash)) == 1)
ok("CÂBLAGE : les deux boutons ont le MÊME cadre (modificateur `bouton-vue--large` 4897 / 1024), la même hauteur (3,0625 rem), Carrière en variante élargie et Accomplissements d'origine", 'className="bouton-vue bouton-vue--large"' in comp and 'HAUTEUR_BOUTONS_VUES_COMPTE = "3.0625rem"' in comp and 'cle="selecteur.carriere-large"' in comp and 'cle="selecteur.accomplissements"' in comp and re.search(r"\.bouton-vue--large,\s*\.bouton-vue--large:hover,\s*\.bouton-vue--large:active\s*\{\s*aspect-ratio: 4897 / 1024;", css) is not None)

MESURE = """() => { const R = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const btns = [...document.querySelectorAll('.connexion-vues-compte button')].map((e) => { const b = e.getBoundingClientRect(); return { nom: e.getAttribute('aria-label'), l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height, imgs: [...e.querySelectorAll('img')].map((i) => ({ src: i.src.split('/').pop(), ok: i.complete && i.naturalWidth > 0, ratio: i.naturalWidth / i.naturalHeight })) }; });
  const h3 = document.querySelector('.pilier-carte > h3');
  return { titre: R('.titre-categorie'), statut: R('.pilier-carte > h3 > span'), groupe: R('.connexion-vues-compte'), compte: R('.connexion-compte'), carte: R('.pilier-carte'), btns,
           classeCarte: document.querySelector('.pilier-carte').className, affichageH3: getComputedStyle(h3).display, hscroll: document.documentElement.scrollWidth > window.innerWidth + 1, clics: window.__clics.slice() }; }"""
def etendue(png, zone_gauche):
    """Pixels clairs d'un bouton : hauteur de l'anneau (zone gauche) et abscisse du bord droit de la plaque."""
    a = np.array(Image.open(io.BytesIO(png)).convert("L")).astype(int); h, w = a.shape
    anneau = a[:, : int(w * zone_gauche)] > 150; lignes = np.where(anneau.any(axis=1))[0]
    colonnes = np.where((a > 110).any(axis=0))[0]
    return int(lignes.max() - lignes.min() + 1), int(colonnes.max()), w
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1400, "height": 300}); erreurs = []; pg.on("pageerror", lambda e: erreurs.append(str(e)))
    pg.goto(PAGE); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(500)
    m = pg.evaluate(MESURE); c, a = m["btns"][0], m["btns"][1]
    # ---------- 1. même taille ----------
    ok("MÊME TAILLE : « Carrière » et « Accomplissements » ont exactement la même largeur et la même hauteur (à 0,5 px près), hauteur de 49 px (3,0625 rem, la valeur conservée de la demande « +75 % »)", len(m["btns"]) == 2 and abs(c["w"] - a["w"]) < 0.5 and abs(c["h"] - a["h"]) < 0.5 and abs(c["h"] - 49) < 0.6, [(b["nom"], round(b["w"], 1), round(b["h"], 1)) for b in m["btns"]])
    ok("LE CADRE DE CHAQUE BOUTON A LE RATIO DE SON IMAGE (4897 / 1024, à 0,02 près) : l'image remplit son cadre au lieu d'être réduite pour y tenir (c'était le défaut d'origine : Accomplissements, plus large, était réduit de 12 % dans un cadre 4316 / 1024)", all(abs(b["w"] / b["h"] - 4897 / 1024) < 0.02 for b in m["btns"]), [round(b["w"] / b["h"], 3) for b in m["btns"]])
    ratios = [i["ratio"] for b in m["btns"] for i in b["imgs"]]
    fichiers = [i["src"] for b in m["btns"] for i in b["imgs"]]
    # le ratio naturel d'un SVG sans dimensions est arrondi par le navigateur (4,76 pour 4,78) : seuil de 0,06 ; l'ancien cadre de Carrière (4316) donnerait 4,21
    ok("MÊME CADRE : les quatre images (repos et sélectionné des deux boutons) sont chargées et ont le MÊME cadre (4897 × 1024 : Carrière est une variante élargie, plus aucune image réduite pour tenir dans le cadre de l'autre)", all(i["ok"] for b in m["btns"] for i in b["imgs"]) and all(abs(r - 4897 / 1024) < 0.06 for r in ratios) and fichiers == ["bouton-carriere-large.svg", "bouton-carriere-large-selectionne.svg", "bouton-accomplissements.svg", "bouton-accomplissements-selectionne.svg"], [fichiers, [round(r, 3) for r in ratios]])
    sc = pg.locator(".connexion-vues-compte button").nth(0).screenshot(); sa = pg.locator(".connexion-vues-compte button").nth(1).screenshot()
    ec, ea = etendue(sc, 0.2), etendue(sa, 0.2)
    ok("MÊME TAILLE SUR LES PIXELS : l'anneau (hauteur) et le bord droit de la plaque tombent aux mêmes endroits dans les deux boutons (à 1,5 px près) ; avant, l'anneau d'Accomplissements était 12 % plus petit", abs(ec[0] - ea[0]) <= 1.5 and abs(ec[1] - ea[1]) <= 1.5 and ec[0] > 40, [ec, ea])
    # ---------- 2. alignés ----------
    ok("ALIGNÉS : même bord gauche (à 0,5 px près), « Carrière » AU-DESSUS d'« Accomplissements », séparés de moins de 12 px", abs(c["l"] - a["l"]) < 0.5 and c["t"] < a["t"] and 0 <= a["t"] - c["b"] <= 12, [round(c["l"], 1), round(a["l"], 1), round(c["b"], 1), round(a["t"], 1)])
    # ---------- 3. emplacement ----------
    t, s, g, co = m["titre"], m["statut"], m["groupe"], m["compte"]
    libre_g, libre_d = max(t["r"], co["r"]), s["l"]
    ok("EMPLACEMENT : la colonne de boutons est ENTRE le titre et le statut « connecté » (au moins 20 px de chaque côté) et CENTRÉE dans la place libre (à 3 px près)", g["l"] >= libre_g + 20 and g["r"] <= libre_d - 20 and abs((g["l"] + g["r"]) / 2 - (libre_g + libre_d) / 2) <= 3, [round(g["l"]), round(g["r"]), round(libre_g), round(libre_d)])
    ok("EMPLACEMENT : la colonne commence à la hauteur du titre (à 2 px près) et descend jusqu'à la ligne du compte (elle couvre les deux lignes, comme le rectangle de la capture) ; le statut reste sur la ligne du titre", abs(g["t"] - t["t"]) <= 2 and g["b"] >= co["t"] + co["h"] / 2 and g["b"] <= m["carte"]["b"] and abs((s["t"] + s["b"]) / 2 - (t["t"] + t["b"]) / 2) <= 6, [round(g["t"]), round(t["t"]), round(g["b"]), round(co["t"])])
    ok("LE COMPTE reste sous le titre, à gauche (même bord gauche que le titre) ; aucun défilement horizontal", abs(co["l"] - t["l"]) <= 1 and co["t"] >= t["b"] and not m["hscroll"] and "pilier-carte--connexion" in m["classeCarte"], [round(co["l"]), round(t["l"]), m["hscroll"]])
    # ---------- fenêtre large ----------
    pg.set_viewport_size({"width": 1920, "height": 300}); pg.wait_for_timeout(250); L = pg.evaluate(MESURE)
    ok("FENÊTRE LARGE (1920 px) : toujours entre le titre et le statut, mêmes dimensions", L["groupe"]["l"] > max(L["titre"]["r"], L["compte"]["r"]) + 20 and L["groupe"]["r"] < L["statut"]["l"] - 20 and abs(L["btns"][0]["w"] - L["btns"][1]["w"]) < 0.5, [round(L["groupe"]["l"]), round(L["statut"]["l"])])
    # ---------- 5. fenêtre étroite ----------
    pg.set_viewport_size({"width": 900, "height": 400}); pg.wait_for_timeout(250); E = pg.evaluate(MESURE)
    ok("FENÊTRE ÉTROITE (900 px) : retour à l'empilement : la colonne passe SOUS la ligne du compte, alignée à gauche, sans défilement horizontal ; les boutons gardent leur taille commune", E["groupe"]["t"] >= E["compte"]["b"] - 1 and abs(E["groupe"]["l"] - E["titre"]["l"]) <= 1 and not E["hscroll"] and abs(E["btns"][0]["w"] - E["btns"][1]["w"]) < 0.5 and E["affichageH3"] == "flex", [round(E["groupe"]["t"]), round(E["compte"]["b"]), E["hscroll"], E["affichageH3"]])
    # ---------- 6. clics ----------
    pg.set_viewport_size({"width": 1400, "height": 300}); pg.wait_for_timeout(250)
    pg.get_by_role("button", name="Carrière").click(); pg.get_by_role("button", name="Accomplissements").click()
    ok("CLICS : « Carrière » ouvre la vue Carrière, « Accomplissements » le tiroir (un clic chacun, dans cet ordre)", pg.evaluate("window.__clics") == ["carriere", "accomplissements"], pg.evaluate("window.__clics"))
    # ---------- 4. hors connexion ----------
    pg.goto(PAGE + "?deconnecte=1"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(400)
    d = pg.evaluate("""() => ({ nb: document.querySelectorAll('.connexion-vues-compte').length, carriere: document.querySelectorAll('button[aria-label="Carrière"]').length, accompl: document.querySelectorAll('button[aria-label="Accomplissements"]').length,
        classe: document.querySelector('.pilier-carte').className, h3: getComputedStyle(document.querySelector('.pilier-carte > h3')).display,
        t: document.querySelector('.titre-categorie').getBoundingClientRect().toJSON(), s: document.querySelector('.pilier-carte > h3 > span').getBoundingClientRect().toJSON(), bouton: !!document.evaluate("//button[text()='Connexion Bungie.net']", document, null, 9, null).singleNodeValue })""")
    ok("HORS CONNEXION : les deux boutons n'existent PAS (ni dans la page, ni masqués par le style), la carte n'est pas en grille, le titre et le statut restent sur une seule ligne comme avant, et le bouton « Connexion Bungie.net » est là", d["nb"] == 0 and d["carriere"] == 0 and d["accompl"] == 0 and "pilier-carte--connexion" not in d["classe"] and d["h3"] == "flex" and abs((d["t"]["top"] + d["t"]["bottom"]) / 2 - (d["s"]["top"] + d["s"]["bottom"]) / 2) <= 6 and d["bouton"], d)
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    nav.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

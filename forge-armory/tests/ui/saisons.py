# FR : ⚠️ AJOUT (14/10/2026, v0.4.11), RÉÉCRIT le même jour (demandes de l'utilisateur : « agrandis l'icône de saison sur les vignettes, à la même taille que l'icône façonnée, puis uniformise » et « il y a une espèce de CADRE NOIR autour de l'icône de saison : possible de l'enlever ? ») - TEST D'INTERFACE de l'ICÔNE DE SAISON : (1) sur les VIGNETTES d'armes ET d'armures (Mon Inventaire, Coffre, Mon Build, liste de la Forge, Collection) : en haut à gauche, À LA MÊME TAILLE VISIBLE que l'icône façonnée, la même sur toutes ; (2) dans les fenêtres Détails (Mon Inventaire, Coffre, Mon Build, Forge, Collection) : « directement à droite du nom », cadrée sur le symbole ; (3) PAS DE CADRE NOIR : mesuré sur les PIXELS dans le navigateur avec un filigrane d'essai qui reproduit la bande sombre translucide du vrai filigrane (mesurée sur la capture du jeu de l'utilisateur).
# VRAIS composants, faux Manifest (`?saisons`). Depuis la racine : python3 tests/ui/saisons.py   (construit les pages lui-même ; demande Pillow pour lire les pixels)
# ⚠️ Ne dit RIEN de la présence réelle du filigrane dans le Manifest de l'utilisateur, ni de la forme des symboles des autres saisons. EN: ⚠️ ADDED, REWRITTEN - season icon: same visible size as the crafted icon on thumbnails, no dark frame in the Details windows (pixel-measured).
import glob, io, os, struct, subprocess, sys, zlib
from PIL import Image
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for page in ("inventaire", "resumebuild", "forge"):
    if subprocess.run(["node", "tests/ui/build.mjs", page], capture_output=True).returncode != 0: print("❌ construction impossible :", page); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:520]) if (detail and not cond) else "")
def png_rgba(w, h, pixel):
    brut = b"".join(b"\x00" + b"".join(bytes(pixel(x, y)) for x in range(w)) for y in range(h))
    morceau = lambda t, d: struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    return b"\x89PNG\r\n\x1a\n" + morceau(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) + morceau(b"IDAT", zlib.compress(brut)) + morceau(b"IEND", b"")
PNG = png_rgba(1, 1, lambda x, y: (52, 60, 78, 255))
# filigrane d'ESSAI à l'image du vrai (mesures de la capture du jeu) : une BANDE SOMBRE TRANSLUCIDE de 0 à 25,9 % de la largeur sur toute la hauteur, et un symbole blanc (disque) de 5,7 % à 20,3 % x 3,8 % à 19,3 %
def filigrane(x, y):
    px, py = (x + 0.5) / 96, (y + 0.5) / 96
    cx, cy, r = 0.130, 0.1155, 0.073
    if (px - cx) ** 2 + (py - cy) ** 2 <= r * r: return (255, 255, 255, 255)
    return (0, 0, 0, 128) if px < 0.259 else (0, 0, 0, 0)
FILIGRANE = png_rgba(96, 96, filigrane)
URL = "https://www.bungie.net/img/saison-sorciere.png"
# marques d'une ligne ou d'une carte
MARQUES = """(el) => { const img = el.querySelector('img:not([data-icone-saison] img)'); const b = el.querySelector('[data-badge-saison]'); const c = el.querySelector('[data-badge-faconnee]'); if (!img) return { absent: !b }; const a = img.getBoundingClientRect(); const out = { tw: a.width, absent: !b, faconnee: !!c }; if (b) { const r = b.getBoundingClientRect(), i = b.querySelector('[data-icone-saison]').getBoundingClientRect(); out.dx = r.left - a.left; out.dy = r.top - a.top; out.boite = Math.round(i.width * 100) / 100; out.src = b.querySelector('img').getAttribute('src'); } if (c) { const s = c.querySelector('svg').getBoundingClientRect(); out.glypheFaconnee = Math.round(s.width * 100) / 100; out.fy = c.getBoundingClientRect().top - a.top; out.fx = c.getBoundingClientRect().left - a.left; } return out; }"""
# icône de saison d'une FENÊTRE (pas celle d'une vignette)
ICONE = """() => { const toutes = [...document.querySelectorAll('[data-icone-saison]')].filter(e => !e.closest('[data-badge-saison]')); const i = toutes[0]; if (!i) return null; const conteneur = i.parentElement; const nom = [...conteneur.children].find(c => c !== i && !c.hasAttribute('data-icone-titre-faconnee') && c.textContent.trim().length > 0 && !c.hasAttribute('data-icones-fenetre')); const suivant = i.nextElementSibling; const a = i.getBoundingClientRect(), n = nom.getBoundingClientRect(); const img = i.querySelector('img'); const im = img.getBoundingClientRect(); const s = suivant ? suivant.getBoundingClientRect() : null; return { droiteDuNom: a.left >= n.right - 1, ecart: Math.round(a.left - n.right), memeLigne: Math.abs((a.top + a.height / 2) - (n.top + n.height / 2)) <= 8, avantSuivant: !s || a.right <= s.left + 1, cote: Math.round(a.width * 10) / 10, imgCote: Math.round(im.width * 100) / 100, decalX: Math.round((im.left - a.left) * 100) / 100, decalY: Math.round((im.top - a.top) * 100) / 100, melange: getComputedStyle(img).mixBlendMode, titre: i.getAttribute('title'), aria: i.getAttribute('aria-label'), role: i.getAttribute('role'), src: img.getAttribute('src'), nb: toutes.length, x: a.left, y: a.top }; }"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 1100}); erreurs = []
    ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    def ouvrir(page, params, contexte=None):
        q = (contexte or ctx).new_page(); q.on("pageerror", lambda e: erreurs.append(str(e))); q.on("dialog", lambda d: d.dismiss())
        q.goto("file://" + racine + f"/tests/ui/_sortie/{page}.html{params}"); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(350); return q
    # ---------- 1. Mon Inventaire, Coffre : vignettes ----------
    pg = ouvrir("inventaire", "?saisons=1&faconnees=1")
    pg.get_by_role("button", name="Charger mon inventaire").click(); pg.wait_for_timeout(500); pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); pg.wait_for_timeout(250)
    ligne = lambda q, i: q.locator(f'[data-transfert-bouton="{i}"]').locator("xpath=ancestor::li[1]")
    g = {i: ligne(pg, i).evaluate(MARQUES) for i in ("n1", "f1", "f3", "f2", "a1")}
    ok("VIGNETTES (Mon Inventaire, Coffre) : l'icône de saison est sur l'ARME (n1) et sur l'ARMURE (f3) dont le Manifest a un filigrane ; absente d'une arme sans filigrane (f2) et d'une arme sans vignette (a1)", not g["n1"]["absent"] and not g["f3"]["absent"] and g["f2"]["absent"] and g["a1"]["absent"], g)
    ok("elle est EN HAUT À GAUCHE de la vignette de 31 px (à moins de 4 px du coin), avec la bonne image", all(0 <= g[i]["dx"] <= 4 and 0 <= g[i]["dy"] <= 4 and g[i]["tw"] == 31 and g[i]["src"] == URL for i in ("n1", "f1", "f3")), g)
    ok("MÊME TAILLE QUE L'ICÔNE FAÇONNÉE (demande de l'utilisateur) : sur l'arme façonnée (f1), le symbole de saison (la boîte × la part qu'il occupe, 77 %) fait la même taille visible que le dessin de l'icône façonnée (10 px), à un pixel près", g["f1"]["faconnee"] and abs(g["f1"]["boite"] * 0.77 - g["f1"]["glypheFaconnee"]) <= 1 and g["f1"]["glypheFaconnee"] == 10, g["f1"])
    ok("UNIFORMISÉE : la boîte de saison fait la MÊME taille (13 px) sur l'arme façonnée (f1), l'arme normale (n1) et l'armure (f3)", {g[i]["boite"] for i in ("n1", "f1", "f3")} == {13}, [g[i]["boite"] for i in ("n1", "f1", "f3")])
    ok("l'arme FAÇONNÉE (f1) porte les deux marques sans qu'elles se gênent : saison en haut à gauche, façonnée en bas à gauche", g["f1"]["dy"] < 8 and g["f1"]["fy"] > 15 and g["f1"]["fx"] < 8, g["f1"])
    ok("en tout, EXACTEMENT trois icônes de saison sur les vignettes de la page (n1, f1, f3)", pg.locator("[data-badge-saison]").count() == 3, pg.locator("[data-badge-saison]").count())
    ligne(pg, "n1").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    d = pg.evaluate(ICONE)
    ok("DÉTAILS d'une arme (Mon Inventaire / Coffre) : l'icône de saison est DIRECTEMENT à DROITE DU NOM (à moins de 12 px), sur la même ligne, AVANT les icônes de type d'arme, d'élément et de munitions ; une seule fois", d and d["droiteDuNom"] and 0 <= d["ecart"] <= 12 and d["memeLigne"] and d["avantSuivant"] and d["nb"] == 1, d)
    ok("l'icône est CADRÉE SERRÉ sur le symbole (l'image est 5,26 fois plus grande que l'icône, décalée de 4 % et 2,5 % : on ne voit que le coin du symbole, AVANT le bord de la bande sombre), de 18 px, mélangée en mode « écran », avec le nom ET le numéro de la saison en infobulle", d and d["cote"] == 18 and abs(d["imgCote"] - 94.74) <= 0.1 and abs(d["decalX"] + 3.79) <= 0.1 and abs(d["decalY"] + 2.37) <= 0.1 and d["melange"] == "screen" and d["titre"] == "Saison de la Sorcière (saison 22)" and d["aria"] == d["titre"] and d["role"] == "img" and d["src"] == URL, d)
    pg.keyboard.press("Escape"); pg.mouse.click(5, 5); pg.wait_for_timeout(150)
    ligne(pg, "f3").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    da = pg.evaluate(ICONE)
    ok("DÉTAILS d'une ARMURE (casque) : l'icône de saison est aussi à droite du nom", da and da["droiteDuNom"] and da["memeLigne"] and da["nb"] == 1, da)
    pg.keyboard.press("Escape"); pg.mouse.click(5, 5); pg.wait_for_timeout(150)
    ligne(pg, "f2").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    ok("DÉTAILS d'un objet sans filigrane (f2) : pas d'icône de saison", pg.evaluate(ICONE) is None)
    pg.close()
    # ---------- 2. PAS DE CADRE NOIR : mesure sur les pixels avec un filigrane qui reproduit la bande sombre ----------
    ctx2 = b.new_context(viewport={"width": 1280, "height": 1100}, device_scale_factor=2)
    ctx2.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    ctx2.route("**/www.bungie.net/img/saison-sorciere.png", lambda r: r.fulfill(status=200, content_type="image/png", body=FILIGRANE))
    def pixels(q, i):
        e = q.locator("[data-icone-saison]").filter(has_not=q.locator("xpath=ancestor::*[@data-badge-saison]")).first
        box = i["x"], i["y"]
        q.wait_for_timeout(200)
        im = Image.open(io.BytesIO(q.screenshot(clip={"x": box[0] - 8, "y": box[1] - 2, "width": 8 + i["cote"] + 2, "height": i["cote"] + 4}))).convert("RGB")
        k = 2; s = int(i["cote"] * k); ox = 8 * k; oy = 2 * k
        ref = im.getpixel((ox - 3 * k, oy + s // 2))                                    # le fond de la fenêtre, juste à gauche de l'icône
        coins = [im.getpixel((ox + 2, oy + 2)), im.getpixel((ox + s - 3, oy + 2)), im.getpixel((ox + 2, oy + s - 3)), im.getpixel((ox + s - 3, oy + s - 3))]
        centre = im.getpixel((ox + s // 2, oy + s // 2))
        return ref, coins, centre
    pf = ouvrir("inventaire", "?saisons=1&faconnees=1", ctx2)
    pf.get_by_role("button", name="Charger mon inventaire").click(); pf.wait_for_timeout(500); pf.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); pf.wait_for_timeout(250)
    ligne(pf, "n1").get_by_role("button", name="Détails").click(); pf.wait_for_timeout(350)
    di = pf.evaluate(ICONE); ref, coins, centre = pixels(pf, di)
    ecart = max(max(abs(c[j] - ref[j]) for j in range(3)) for c in coins)
    ok("PAS DE CADRE NOIR (mesuré sur les PIXELS, avec un filigrane d'essai qui reproduit la bande sombre translucide du vrai) : autour du symbole, l'icône a EXACTEMENT la couleur du fond de la fenêtre (écart maximal sur les quatre coins : %d sur 255) ; le symbole, lui, reste blanc au centre %s" % (ecart, centre), ecart <= 3 and min(centre) >= 200, [ref, coins, centre])
    pf.add_style_tag(content="[data-icone-saison] img { mix-blend-mode: normal !important; }"); pf.wait_for_timeout(250)
    _, coins2, _ = pixels(pf, di)
    ecart2 = max(max(abs(c[j] - ref[j]) for j in range(3)) for c in coins2)
    ok("LE TEST SAIT VOIR LE CADRE : sans le mode « écran » (mélange normal), la bande sombre redevient visible (écart %d sur 255 par rapport au fond) : c'est bien le cadre noir signalé, et la correction le supprime" % ecart2, ecart2 >= 6 and ecart2 > ecart, [ref, coins2])
    pf.close(); ctx2.close()
    # ---------- 3. Mon Build ----------
    mb = ouvrir("resumebuild", "?saisons=1")
    rang = lambda q, nom: q.locator("li").filter(has_text=nom).first
    gm = {n: rang(mb, n).evaluate(MARQUES) for n in ("Fusil à paliers", "Casque d'essai", "Fusil d'essai", "Lance-roquettes d'essai")}
    ok("MON BUILD, vignettes : l'icône de saison est sur l'arme (Fusil à paliers) et sur l'armure (casque), pas sur l'arme sans filigrane (Fusil d'essai) ni sur l'arme non possédée sans image de saison", not gm["Fusil à paliers"]["absent"] and not gm["Casque d'essai"]["absent"] and gm["Fusil d'essai"]["absent"] and gm["Lance-roquettes d'essai"]["absent"], gm)
    ok("dans Mon Build aussi : en haut à gauche de la vignette de 31 px, même boîte de 13 px", all(0 <= gm[n]["dx"] <= 4 and 0 <= gm[n]["dy"] <= 4 and gm[n]["boite"] == 13 and gm[n]["tw"] == 31 for n in ("Fusil à paliers", "Casque d'essai")), gm)
    rang(mb, "Fusil à paliers").get_by_role("button", name="Détails").click(); mb.wait_for_timeout(300)
    dm = mb.evaluate(ICONE)
    ok("DÉTAILS (Mon Build) : l'icône de saison est directement à droite du nom de l'arme, même celle aux perks simulés (Fusil à paliers), sur la même ligne, avant les autres icônes", dm and dm["droiteDuNom"] and 0 <= dm["ecart"] <= 12 and dm["memeLigne"] and dm["avantSuivant"] and dm["titre"] == "Saison de la Sorcière (saison 22)", dm)
    mb.get_by_role("button", name="✕").first.click(); mb.wait_for_timeout(150)
    rang(mb, "Fusil d'essai").get_by_role("button", name="Détails").click(); mb.wait_for_timeout(300)
    ok("DÉTAILS (Mon Build) d'une arme sans filigrane : pas d'icône de saison", mb.evaluate(ICONE) is None)
    mb.close()
    # ---------- 4. Forge (liste et fenêtre) et Collection (liste et fenêtre) ----------
    fg = ouvrir("forge", "?inventaire=1&faconnees=1&pool=1&saisons=1")
    fg.get_by_role("tab", name="Inventaire").click(); fg.get_by_role("button", name="Charger mon inventaire").click(); fg.wait_for_selector("[data-arme-possedee]"); fg.wait_for_timeout(250)
    carte = lambda i: fg.locator(f'[data-arme-possedee="{i}"]')
    gf = {i: carte(i).evaluate(MARQUES) for i in ("w1", "w8", "w4", "w3")}
    ok("FORGE, liste : l'icône de saison est sur les cartes dont l'arme a un filigrane (w1, w8 Mesure corrective façonnée, w4) et pas sur w3 ; boîte de 18 px sur la vignette de 44 px, en haut à gauche ; sur l'arme FAÇONNÉE (w8), le symbole de saison a la même taille visible que l'icône façonnée (14 px)", not gf["w1"]["absent"] and not gf["w8"]["absent"] and not gf["w4"]["absent"] and gf["w3"]["absent"] and all(0 <= gf[i]["dx"] <= 4 and 0 <= gf[i]["dy"] <= 4 and gf[i]["boite"] == 18 and gf[i]["tw"] == 44 for i in ("w1", "w8", "w4")) and gf["w8"]["glypheFaconnee"] == 14 and abs(gf["w8"]["boite"] * 0.77 - 14) <= 1, gf)
    carte("w8").click(); fg.wait_for_selector("[role=dialog]"); fg.wait_for_timeout(300)
    ordre = fg.evaluate("""() => { const d = document.querySelector('[role=dialog]'); const r = (s) => { const e = d.querySelector(s); return e ? e.getBoundingClientRect() : null; }; const f = r('[data-icone-titre-faconnee]'), n = d.querySelector('[data-icone-titre-faconnee]').parentElement.querySelector('strong').getBoundingClientRect(), s = r('[data-icone-saison]'), q = r('[data-icones-fenetre]'); if (!f || !s || !q) return null; return { ordre: f.right <= n.left + 1 && n.right <= s.left + 1 && s.right <= q.left + 1, ecartNomSaison: Math.round(s.left - n.right), memeLigne: Math.abs((s.top + s.height / 2) - (n.top + n.height / 2)) <= 8 }; }""")
    ok("FORGE, fenêtre : de gauche à droite sur la même ligne : icône façonnée, NOM, ICÔNE DE SAISON (directement à droite du nom), puis les quatre icônes", ordre and ordre["ordre"] and ordre["memeLigne"] and 0 <= ordre["ecartNomSaison"] <= 12, ordre)
    fg.close()
    co = ouvrir("forge", "?saisons=1")
    co.wait_for_selector("[data-arme]"); co.wait_for_timeout(300)
    gc = {h: co.locator(f'[data-arme="{h}"]').evaluate(MARQUES) for h in (5001, 5002)}
    ok("COLLECTION, liste : l'icône de saison est sur la carte de l'arme qui a un filigrane (5001) et pas sur celle qui n'en a pas (5002) ; en haut à gauche de la vignette de 44 px, boîte de 18 px", not gc[5001]["absent"] and gc[5002]["absent"] and 0 <= gc[5001]["dx"] <= 4 and 0 <= gc[5001]["dy"] <= 4 and gc[5001]["boite"] == 18, gc)
    co.locator('[data-arme="5001"]').click(); co.wait_for_selector("[role=dialog]"); co.wait_for_timeout(300)
    dc = co.evaluate(ICONE)
    ok("COLLECTION, fenêtre : l'icône de saison est directement à droite du nom de l'arme, sur la même ligne, avec le nom de la saison en infobulle", dc and dc["droiteDuNom"] and 0 <= dc["ecart"] <= 12 and dc["memeLigne"] and dc["titre"] == "Saison de la Sorcière (saison 22)" and dc["nb"] == 1, dc)
    co.close()
    # ---------- 5. sans filigrane nulle part : rien ne change ----------
    sans = ouvrir("forge", "?inventaire=1&faconnees=1")
    sans.get_by_role("tab", name="Inventaire").click(); sans.get_by_role("button", name="Charger mon inventaire").click(); sans.wait_for_selector("[data-arme-possedee]"); sans.wait_for_timeout(250)
    sans.locator('[data-arme-possedee="w1"]').click(); sans.wait_for_selector("[role=dialog]"); sans.wait_for_timeout(250)
    ok("SANS FILIGRANE dans le Manifest : aucune icône de saison, ni sur les vignettes ni dans la fenêtre (rien n'est deviné)", sans.locator("[data-badge-saison]").count() == 0 and sans.locator("[data-icone-saison]").count() == 0)
    sans.close()
    ok("aucune erreur JavaScript pendant tout le scénario", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

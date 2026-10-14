# FR : ⚠️ AJOUT (14/10/2026, v0.4.11) - TEST D'INTERFACE de l'ICÔNE DE SAISON (demande de l'utilisateur) : (1) le FILIGRANE posé en haut à gauche des vignettes d'armes ET d'armures (Mon Inventaire, Coffre, Mon Build, liste de la Forge, Collection), (2) l'ICÔNE « directement à droite du nom » dans les fenêtres Détails (Mon Inventaire, Coffre, Mon Build, Forge, Collection). VRAIS composants, faux Manifest dont certains objets ont un filigrane et une saison (`?saisons`). Depuis la racine : python3 tests/ui/saisons.py   (construit les pages lui-même)
# ⚠️ Ce test ne dit RIEN de la présence réelle du filigrane dans le Manifest de l'utilisateur ni de la justesse du cadrage de l'icône sur les vraies images (hypothèse documentée dans `IconeSaison.tsx`).
import glob, os, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for page in ("inventaire", "resumebuild", "forge"):
    if subprocess.run(["node", "tests/ui/build.mjs", page], capture_output=True).returncode != 0: print("❌ construction impossible :", page); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:520]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
URL = "https://www.bungie.net/img/saison-sorciere.png"
# filigrane d'une ligne ou d'une carte : position et taille relatives à la vignette
FILI = """(el) => { const img = el.querySelector('img:not([data-filigrane-saison])'); const f = el.querySelector('[data-filigrane-saison]'); if (!img) return { absent: !f }; const a = img.getBoundingClientRect(); if (!f) return { absent: true }; const b = f.getBoundingClientRect(); return { absent: false, dx: b.left - a.left, dy: b.top - a.top, w: b.width, h: b.height, tw: a.width, src: f.getAttribute('src'), aria: f.getAttribute('aria-hidden') }; }"""
# icône de saison d'une fenêtre : place par rapport au nom et à l'élément suivant
ICONE = """() => { const i = document.querySelector('[data-icone-saison]'); if (!i) return null; const conteneur = i.parentElement; const nom = [...conteneur.children].find(c => c !== i && !c.hasAttribute('data-icone-titre-faconnee') && c.textContent.trim().length > 0 && !c.hasAttribute('data-icones-fenetre')); const suivant = i.nextElementSibling; const a = i.getBoundingClientRect(), n = nom.getBoundingClientRect(); const img = i.querySelector('img'); const im = img.getBoundingClientRect(); const s = suivant ? suivant.getBoundingClientRect() : null; return { droiteDuNom: a.left >= n.right - 1, ecart: Math.round(a.left - n.right), memeLigne: Math.abs((a.top + a.height / 2) - (n.top + n.height / 2)) <= 8, avantSuivant: !s || a.right <= s.left + 1, cote: Math.round(a.width * 10) / 10, imgCote: Math.round(im.width * 100) / 100, decal: Math.round((im.left - a.left) * 100) / 100, titre: i.getAttribute('title'), aria: i.getAttribute('aria-label'), role: i.getAttribute('role'), src: img.getAttribute('src'), nb: document.querySelectorAll('[data-icone-saison]').length }; }"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 1100}); erreurs = []
    ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    def ouvrir(page, params):
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e))); q.on("dialog", lambda d: d.dismiss())
        q.goto("file://" + racine + f"/tests/ui/_sortie/{page}.html{params}"); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(350); return q
    # ---------- 1. Mon Inventaire, Coffre : vignettes et fenêtre Détails ----------
    pg = ouvrir("inventaire", "?saisons=1&faconnees=1")
    pg.get_by_role("button", name="Charger mon inventaire").click(); pg.wait_for_timeout(500); pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); pg.wait_for_timeout(250)
    ligne = lambda q, i: q.locator(f'[data-transfert-bouton="{i}"]').locator("xpath=ancestor::li[1]")
    g = {i: ligne(pg, i).evaluate(FILI) for i in ("n1", "f1", "f3", "f2", "a1")}
    ok("VIGNETTES (Mon Inventaire, Coffre) : le filigrane de saison est posé sur l'ARME (n1) et sur l'ARMURE (f3, un casque) dont le Manifest en a un ; il est absent d'une arme sans filigrane (f2, au Coffre) et d'une arme sans vignette (a1)", not g["n1"]["absent"] and not g["f3"]["absent"] and g["f2"]["absent"] and g["a1"]["absent"], g)
    ok("le filigrane recouvre EXACTEMENT la vignette de 31 px (même position, même taille : c'est l'image de Bungie telle quelle, symbole en haut à gauche), avec la bonne image, et il est décoratif (aria-hidden)", all(abs(g[i]["dx"]) <= 0.6 and abs(g[i]["dy"]) <= 0.6 and abs(g[i]["w"] - 31) <= 0.6 and g[i]["tw"] == 31 and g[i]["src"] == URL and g[i]["aria"] == "true" for i in ("n1", "f1", "f3")), g)
    ok("une arme FAÇONNÉE (f1) porte les DEUX marques sans qu'elles se gênent : le filigrane en haut à gauche, l'icône façonnée en bas à gauche", ligne(pg, "f1").locator("[data-filigrane-saison]").count() == 1 and ligne(pg, "f1").locator("[data-badge-faconnee]").count() == 1 and ligne(pg, "f1").evaluate("(li) => { const f = li.querySelector('[data-badge-faconnee]').getBoundingClientRect(), i = li.querySelector('img:not([data-filigrane-saison])').getBoundingClientRect(); return f.top > i.top + i.height / 2 && f.left < i.left + i.width / 2; }"))
    ok("en tout, EXACTEMENT trois filigranes dans la page (n1, f1, f3)", pg.locator("[data-filigrane-saison]").count() == 3, pg.locator("[data-filigrane-saison]").count())
    ligne(pg, "n1").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    d = pg.evaluate(ICONE)
    ok("DÉTAILS d'une arme (Mon Inventaire / Coffre) : l'icône de saison est DIRECTEMENT à DROITE DU NOM (à moins de 12 px), sur la même ligne, AVANT les icônes de type d'arme, d'élément et de munitions ; une seule fois", d and d["droiteDuNom"] and 0 <= d["ecart"] <= 12 and d["memeLigne"] and d["avantSuivant"] and d["nb"] == 1, d)
    ok("l'icône de saison est cadrée sur le COIN du filigrane (l'image entière est 3 fois plus grande que l'icône : on n'en voit que le coin en haut à gauche), de 18 px de côté, avec le nom ET le numéro de la saison en infobulle et en nom accessible", d and d["cote"] == 18 and abs(d["imgCote"] - 56.25) <= 0.1 and d["decal"] < 0 and d["titre"] == "Saison de la Sorcière (saison 22)" and d["aria"] == d["titre"] and d["role"] == "img" and d["src"] == URL, d)
    pg.keyboard.press("Escape"); pg.mouse.click(5, 5); pg.wait_for_timeout(150)
    ligne(pg, "f3").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    da = pg.evaluate(ICONE)
    ok("DÉTAILS d'une ARMURE (casque) : l'icône de saison est aussi à droite du nom", da and da["droiteDuNom"] and da["memeLigne"] and da["nb"] == 1, da)
    pg.keyboard.press("Escape"); pg.mouse.click(5, 5); pg.wait_for_timeout(150)
    ligne(pg, "f2").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    ok("DÉTAILS d'un objet sans filigrane (f2) : pas d'icône de saison", pg.evaluate(ICONE) is None)
    pg.close()
    # ---------- 2. Mon Build ----------
    mb = ouvrir("resumebuild", "?saisons=1")
    rang = lambda q, nom: q.locator("li").filter(has_text=nom).first
    gm = {n: rang(mb, n).evaluate(FILI) for n in ("Fusil à paliers", "Casque d'essai", "Fusil d'essai", "Lance-roquettes d'essai")}
    ok("MON BUILD, vignettes : le filigrane est sur l'arme (Fusil à paliers) et sur l'armure (casque), pas sur l'arme sans filigrane (Fusil d'essai) ni sur l'arme non possédée sans image de saison", not gm["Fusil à paliers"]["absent"] and not gm["Casque d'essai"]["absent"] and gm["Fusil d'essai"]["absent"] and gm["Lance-roquettes d'essai"]["absent"], gm)
    ok("dans Mon Build aussi, le filigrane recouvre exactement la vignette de 31 px", all(abs(gm[n]["dx"]) <= 0.6 and abs(gm[n]["dy"]) <= 0.6 and gm[n]["w"] == 31 for n in ("Fusil à paliers", "Casque d'essai")), gm)
    rang(mb, "Fusil à paliers").get_by_role("button", name="Détails").click(); mb.wait_for_timeout(300)
    dm = mb.evaluate(ICONE)
    ok("DÉTAILS (Mon Build) : l'icône de saison est directement à droite du nom de l'arme, même celle aux perks simulés (Fusil à paliers), sur la même ligne, avant les autres icônes", dm and dm["droiteDuNom"] and 0 <= dm["ecart"] <= 12 and dm["memeLigne"] and dm["avantSuivant"] and dm["titre"] == "Saison de la Sorcière (saison 22)", dm)
    mb.get_by_role("button", name="✕").first.click(); mb.wait_for_timeout(150)
    rang(mb, "Fusil d'essai").get_by_role("button", name="Détails").click(); mb.wait_for_timeout(300)
    ok("DÉTAILS (Mon Build) d'une arme sans filigrane : pas d'icône de saison", mb.evaluate(ICONE) is None)
    mb.close()
    # ---------- 3. Forge (liste et fenêtre) et Collection (liste et fenêtre) ----------
    fg = ouvrir("forge", "?inventaire=1&faconnees=1&pool=1&saisons=1")
    fg.get_by_role("tab", name="Inventaire").click(); fg.get_by_role("button", name="Charger mon inventaire").click(); fg.wait_for_selector("[data-arme-possedee]"); fg.wait_for_timeout(250)
    carte = lambda i: fg.locator(f'[data-arme-possedee="{i}"]')
    gf = {i: carte(i).evaluate(FILI) for i in ("w1", "w8", "w4", "w3")}
    ok("FORGE, liste : le filigrane est sur les cartes dont l'arme en a un (w1 Fusil à paliers, w8 Mesure corrective, w4 Fusil d'essai) et pas sur celle qui n'en a pas (w3 lance-roquettes) ; il recouvre la vignette de 44 px", not gf["w1"]["absent"] and not gf["w8"]["absent"] and not gf["w4"]["absent"] and gf["w3"]["absent"] and all(abs(gf[i]["dx"]) <= 0.6 and abs(gf[i]["dy"]) <= 0.6 and gf[i]["w"] == 44 for i in ("w1", "w8", "w4")), gf)
    carte("w8").click(); fg.wait_for_selector("[role=dialog]"); fg.wait_for_timeout(300)
    ordre = fg.evaluate("""() => { const d = document.querySelector('[role=dialog]'); const r = (s) => { const e = d.querySelector(s); return e ? e.getBoundingClientRect() : null; }; const f = r('[data-icone-titre-faconnee]'), n = d.querySelector('[data-icone-titre-faconnee]').parentElement.querySelector('strong').getBoundingClientRect(), s = r('[data-icone-saison]'), q = r('[data-icones-fenetre]'); if (!f || !s || !q) return null; return { ordre: f.right <= n.left + 1 && n.right <= s.left + 1 && s.right <= q.left + 1, ecartNomSaison: Math.round(s.left - n.right), memeLigne: Math.abs((s.top + s.height / 2) - (n.top + n.height / 2)) <= 8 }; }""")
    ok("FORGE, fenêtre : de gauche à droite sur la même ligne : icône façonnée, NOM, ICÔNE DE SAISON (directement à droite du nom), puis les quatre icônes", ordre and ordre["ordre"] and ordre["memeLigne"] and 0 <= ordre["ecartNomSaison"] <= 12, ordre)
    fg.close()
    co = ouvrir("forge", "?saisons=1")
    co.wait_for_selector("[data-arme]"); co.wait_for_timeout(300)
    gc = {h: co.locator(f'[data-arme="{h}"]').evaluate(FILI) for h in (5001, 5002)}
    ok("COLLECTION, liste : le filigrane est sur la carte de l'arme qui en a un (5001) et pas sur celle qui n'en a pas (5002) ; il recouvre la vignette de 44 px", not gc[5001]["absent"] and gc[5002]["absent"] and abs(gc[5001]["dx"]) <= 1.1 and abs(gc[5001]["dy"]) <= 1.1 and gc[5001]["w"] == 44, gc)
    co.locator('[data-arme="5001"]').click(); co.wait_for_selector("[role=dialog]"); co.wait_for_timeout(300)
    dc = co.evaluate(ICONE)
    ok("COLLECTION, fenêtre : l'icône de saison est directement à droite du nom de l'arme, sur la même ligne, avec le nom de la saison en infobulle", dc and dc["droiteDuNom"] and 0 <= dc["ecart"] <= 12 and dc["memeLigne"] and dc["titre"] == "Saison de la Sorcière (saison 22)" and dc["nb"] == 1, dc)
    co.close()
    # ---------- 4. sans filigrane nulle part : rien ne change ----------
    sans = ouvrir("forge", "?inventaire=1&faconnees=1")
    sans.get_by_role("tab", name="Inventaire").click(); sans.get_by_role("button", name="Charger mon inventaire").click(); sans.wait_for_selector("[data-arme-possedee]"); sans.wait_for_timeout(250)
    sans.locator('[data-arme-possedee="w1"]').click(); sans.wait_for_selector("[role=dialog]"); sans.wait_for_timeout(250)
    ok("SANS FILIGRANE dans le Manifest : aucune icône de saison, ni sur les vignettes ni dans la fenêtre (rien n'est deviné)", sans.locator("[data-filigrane-saison]").count() == 0 and sans.locator("[data-icone-saison]").count() == 0)
    sans.close()
    ok("aucune erreur JavaScript pendant tout le scénario", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

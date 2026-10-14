# FR : ⚠️ AJOUT (14/10/2026, v0.4.10) - TEST D'INTERFACE de l'ICÔNE DES ARMES FAÇONNÉES dans Mon INVENTAIRE (chez le Titan), le COFFRE et MON BUILD (demande de l'utilisateur : « il faut la mettre partout »). VRAIS composants `SelecteurInventaire` et `ResumeBuild`, fausses données : deux armes façonnées (Titan, Coffre), une arme normale à image (témoin), une ARMURE qui porte le même perk (ne doit PAS recevoir l'icône), et pour Mon Build une arme façonnée, une arme à perks SIMULÉS (façonnée ou non), une arme non possédée et une armure.
# La Forge a déjà son test (`forge-inventaire.py`). Depuis la racine : python3 tests/ui/faconnee-listes.py   (construit les deux pages lui-même)
import glob, os, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for page in ("inventaire", "resumebuild"):
    if subprocess.run(["node", "tests/ui/build.mjs", page], capture_output=True).returncode != 0: print("❌ construction impossible :", page); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
GEO = """(li) => { const img = li.querySelector('img').getBoundingClientRect(); const b = li.querySelector('[data-badge-faconnee]'); if (!b) return null; const r = b.getBoundingClientRect(); const p = b.querySelector('svg path'); return { dx: r.left - img.left, dy: img.bottom - r.bottom, dedans: r.left >= img.left - 0.5 && r.bottom <= img.bottom + 0.5 && r.right <= img.right + 0.5, bw: r.width, iw: img.width, nom: b.getAttribute('aria-label'), titre: b.getAttribute('title'), fill: getComputedStyle(p).fill }; }"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 1000}); erreurs = []
    ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    # ---------- Mon Inventaire (Titan) et Coffre ----------
    pg = ctx.new_page(); pg.on("pageerror", lambda e: erreurs.append(str(e)))
    pg.goto("file://" + racine + "/tests/ui/_sortie/inventaire.html?faconnees=1"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(300)
    pg.get_by_role("button", name="Charger mon inventaire").click(); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); pg.wait_for_timeout(250)
    ligne = lambda i: pg.locator(f'[data-transfert-bouton="{i}"]').locator("xpath=ancestor::li[1]")
    badges = lambda i: ligne(i).locator("[data-badge-faconnee]").count()
    ok("MON INVENTAIRE (Titan) : l'arme façonnée (f1) porte l'icône ; l'arme NORMALE à image (n1, même modèle) n'en porte PAS", badges("f1") == 1 and badges("n1") == 0, [badges("f1"), badges("n1")])
    ok("COFFRE : l'arme façonnée du Coffre (f2) porte l'icône", badges("f2") == 1, badges("f2"))
    ok("une ARMURE qui porte le même perk « Arme façonnée » (f3, casque, avec image) ne reçoit PAS l'icône : elle ne concerne que les armes", ligne("f3").locator("img").count() >= 1 and badges("f3") == 0, badges("f3"))
    ok("une arme sans image (Arme A, a1) n'a pas d'icône non plus ; en tout, EXACTEMENT deux icônes dans toute la page (f1 et f2)", badges("a1") == 0 and pg.locator("[data-badge-faconnee]").count() == 2, pg.locator("[data-badge-faconnee]").count())
    g1, g2 = ligne("f1").evaluate(GEO), ligne("f2").evaluate(GEO)
    ok("l'icône est posée EN BAS À GAUCHE de la vignette de 31 px (à l'intérieur, comme en jeu), à une taille proportionnée (moins de la moitié de la vignette), chez le Titan comme au Coffre", all(g and g["dedans"] and g["dx"] <= 4 and g["dy"] <= 4 and g["bw"] < g["iw"] / 2 for g in (g1, g2)) and g1["iw"] == 31, [g1, g2])
    ok("sa teinte est le saumon corail du jeu (#e49f87), son nom accessible est « Arme façonnée » et son infobulle dit que les perks se changent à la forge en jeu", g1["fill"] == "rgb(228, 159, 135)" and g1["nom"] == "Arme façonnée" and "forge en jeu" in g1["titre"], g1)
    ligne("f1").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(250)
    ok("la fenêtre « Détails » de cette arme façonnée s'ouvre normalement (le bouton « 🔨 Forge » y est toujours)", pg.get_by_role("button", name="🔨 Forge : choisir les perks de cette arme").count() == 1)
    pg.close()
    # ---------- Mon Build ----------
    def build_page(param):
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto("file://" + racine + "/tests/ui/_sortie/resumebuild.html" + param); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(400)
        return q
    mb = build_page("?faconnees=2")
    rang = lambda q, nom: q.locator("li").filter(has_text=nom).first
    nb = lambda q, nom: rang(q, nom).locator("[data-badge-faconnee]").count()
    ok("MON BUILD : le « Fusil d'essai » façonné et le « Fusil à paliers » façonné portent l'icône ; l'arme NON POSSÉDÉE et l'ARMURE n'en portent pas ; deux icônes en tout", nb(mb, "Fusil d'essai") == 1 and nb(mb, "Fusil à paliers") == 1 and nb(mb, "Lance-roquettes d'essai") == 0 and nb(mb, "Casque d'essai") == 0 and mb.locator("[data-badge-faconnee]").count() == 2, mb.locator("[data-badge-faconnee]").count())
    ok("une arme façonnée dont des perks sont SIMULÉS garde son icône (lue sur ses perks réels) ET porte aussi le badge « simulé »", rang(mb, "Fusil à paliers").locator("[data-badge-faconnee]").count() == 1 and rang(mb, "Fusil à paliers").locator("[data-badge-simule]").count() == 1)
    gm = rang(mb, "Fusil d'essai").evaluate(GEO)
    ok("dans Mon Build aussi : en bas à gauche de la vignette de 31 px, à l'intérieur, même teinte, même nom accessible", gm and gm["dedans"] and gm["dx"] <= 4 and gm["dy"] <= 4 and gm["iw"] == 31 and gm["fill"] == "rgb(228, 159, 135)" and gm["nom"] == "Arme façonnée", gm)
    mb.close()
    mb1 = build_page("?faconnees=1")
    ok("SANS être façonnée, une arme aux perks simulés n'a PAS l'icône (la simulation ne rend pas une arme façonnée) : seul le « Fusil d'essai » l'a", nb(mb1, "Fusil à paliers") == 0 and rang(mb1, "Fusil à paliers").locator("[data-badge-simule]").count() == 1 and nb(mb1, "Fusil d'essai") == 1 and mb1.locator("[data-badge-faconnee]").count() == 1)
    mb1.close()
    mb0 = build_page("")
    ok("sans aucune arme façonnée, aucune icône dans Mon Build", mb0.locator("[data-badge-faconnee]").count() == 0)
    mb0.close()
    ok("aucune erreur JavaScript pendant tout le scénario", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

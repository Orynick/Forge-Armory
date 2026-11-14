# FR : ⚠️ AJOUT (08/11/2026, demande de l'utilisateur) - TEST D'INTERFACE de la ligne « Vous préférez l'application PC ? Télécharger pour Windows » en bas de la carte « Connexion à Bungie » (`components/RappelAppliPC.tsx`), sur la VRAIE structure de la carte et la VRAIE feuille de style (page de test `connexion-boutons`, paramètre `?rappel`) : présente et AU MÊME ENDROIT connecté ou non (décision de l'utilisateur), sur toute la largeur de la carte, lien sûr (nouvel onglet, `noopener noreferrer`) ; MASQUÉE dans l'appli installée, hors site, sans lien ou avec un lien non https, sur petit écran et sur appareil tactile ; câblage dans `DashboardPage` (dernier élément de la carte, hors des conditions « connecté / non connecté »). Depuis la racine : python3 tests/ui/rappel-appli-pc.py
# EN: ⚠️ ADDED - UI test of the PC-app download reminder in the connection card.
import glob, os, re, subprocess, sys
from urllib.parse import quote
from playwright.sync_api import sync_playwright
racine = os.getcwd()
if subprocess.run(["node", "tests/ui/build.mjs", "connexion-boutons"], capture_output=True).returncode != 0: print("❌ construction impossible"); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
PAGE = "file://" + racine + "/tests/ui/_sortie/connexion-boutons.html"
LIEN = "https://exemple.org/forge-armory-setup.exe"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:600]) if (detail and not cond) else "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    erreurs = []
    def ouvrir(params, largeur=1280, mobile=False):
        ctx = b.new_context(viewport={"width": largeur, "height": 900}, is_mobile=mobile, has_touch=mobile)
        ctx.route("https://exemple.org/**", lambda r: r.fulfill(status=200, content_type="text/html", body="<p>setup</p>"))
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(PAGE + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(250)
        return q
    def geo(q):
        return q.evaluate("""() => { const c = document.querySelector('.pilier-carte'), r = document.querySelector('[data-rappel-appli-pc]');
          if (!r) return null; const cs = getComputedStyle(c), bc = c.getBoundingClientRect(), br = r.getBoundingClientRect();
          return { dernier: c.lastElementChild === r, gauche: Math.round(br.left - bc.left), droite: Math.round(bc.right - br.right), basCarte: Math.round(bc.bottom - br.bottom),
                   largeurUtile: Math.round(bc.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth)), largeur: Math.round(br.width), haut: br.top,
                   basAutres: Math.max(...[...c.children].filter(e => e !== r).flatMap(e => e.tagName === 'H3' ? [...e.children] : [e]).map(e => e.getBoundingClientRect().bottom)) }; }""")

    # ---------- 1. sans `?rappel` : la page de test d'avant est inchangée ----------
    q = ouvrir("")
    ok("PAGE DE TEST D'AVANT INCHANGÉE : sans `?rappel`, aucune ligne de téléchargement (le test existant de la carte n'est pas affecté)", q.locator("[data-rappel-appli-pc]").count() == 0)
    q.context.close()

    # ---------- 2. connecté et non connecté : présente, en bas, au même endroit ----------
    qc = ouvrir("?rappel"); qd = ouvrir("?rappel&deconnecte")
    gc, gd = geo(qc), geo(qd)
    ok("CONNECTÉ : la ligne est là, c'est le DERNIER élément de la carte, sous TOUT le reste (titre, compte, boutons Carrière et Accomplissements, état)", gc and gc["dernier"] and gc["haut"] >= gc["basAutres"] - 0.5, gc)
    ok("NON CONNECTÉ : la ligne est là aussi, DERNIER élément de la carte, sous le bouton « Connexion Bungie.net »", gd and gd["dernier"] and gd["haut"] >= gd["basAutres"] - 0.5, gd)
    ok("AU MÊME ENDROIT dans les deux états (demande de l'utilisateur) : même marge à gauche, même distance au bas de la carte, même largeur (à 1 px près)", gc and gd and abs(gc["gauche"] - gd["gauche"]) <= 1 and abs(gc["basCarte"] - gd["basCarte"]) <= 1 and abs(gc["largeur"] - gd["largeur"]) <= 1, [gc, gd])
    ok("SUR TOUTE LA LARGEUR de la carte dans les deux états (dans la carte connectée, la grille la place automatiquement sous les trois colonnes)", gc and gd and abs(gc["largeur"] - gc["largeurUtile"]) <= 1 and abs(gd["largeur"] - gd["largeurUtile"]) <= 1, [gc, gd])
    lien = qc.locator("[data-lien-appli-pc]")
    ok("TEXTE ET LIEN : « Vous préférez l'application PC ? » puis le lien vers l'adresse réglée, ouvert dans un NOUVEL ONGLET, avec `noopener noreferrer` (le site de téléchargement ne peut pas agir sur Forge Armory) ; ⚠️ 12/11/2026 : le lien est le BOUTON DE LA CHARTE « Télécharger l'application », son nom accessible « Télécharger l'application Forge Armory pour Windows (.exe) » contient le texte visible", "Vous préférez l'application PC ?" in qc.inner_text("[data-rappel-appli-pc]") and lien.get_attribute("aria-label") == "Télécharger l'application Forge Armory pour Windows (.exe)" and lien.get_attribute("href") == LIEN and lien.get_attribute("target") == "_blank" and set((lien.get_attribute("rel") or "").split()) >= {"noopener", "noreferrer"})
    repos, survol = lien.locator(".lien-telecharger-appli__repos"), lien.locator(".lien-telecharger-appli__survol")
    br = repos.bounding_box()
    ok("VISUEL DE LA CHARTE : deux images (`bouton-telecharger-application.svg` au repos, `…-survol.svg` lumineuse), 56 px de haut (3,5 rem, le bas de la fourchette conseillée 56-80 px), proportions du visuel respectées (largeur = 6496/1024 × hauteur à 2 px près), toutes deux chargées", "bouton-telecharger-application.svg" in (repos.get_attribute("src") or "") and "bouton-telecharger-application-survol.svg" in (survol.get_attribute("src") or "") and round(br["height"]) == 56 and abs(br["width"] - 56 * 6496 / 1024) <= 2 and qc.evaluate("[...document.querySelectorAll('.lien-telecharger-appli img')].every(i => i.complete && i.naturalWidth > 0)"), br)
    opa = lambda: float(survol.evaluate("e => getComputedStyle(e).opacity"))
    o_repos = opa(); lien.hover(); qc.wait_for_timeout(300); o_survol = opa(); qc.mouse.move(2, 2); qc.wait_for_timeout(300); o_apres = opa()
    lien.focus(); qc.keyboard.press("Shift+Tab"); qc.keyboard.press("Tab"); qc.wait_for_timeout(300); o_focus = opa()
    ok("SURVOL ET CLAVIER : l'image lumineuse est invisible au repos, apparaît au SURVOL de la souris, disparaît quand la souris s'en va, et apparaît aussi au FOCUS CLAVIER (avec un contour visible)", o_repos == 0 and o_survol == 1 and o_apres == 0 and o_focus == 1 and lien.evaluate("e => getComputedStyle(e).outlineStyle") != "none", [o_repos, o_survol, o_apres, o_focus])
    with qc.expect_popup() as pop: lien.click()
    page_dl = pop.value; page_dl.wait_for_load_state()
    ok("UN CLIC ouvre le lien de téléchargement dans un nouvel onglet ; la page de Forge Armory reste en place", page_dl.url == LIEN and qc.locator("[data-rappel-appli-pc]").count() == 1, page_dl.url)
    qc.context.close(); qd.context.close()

    # ---------- 3. les cas où la ligne est CACHÉE ----------
    caches = {"l'appli installée (pont Electron)": "?rappel&bureau", "hors version web (build local)": "?rappel&pasweb", "aucun lien réglé (lien vide)": "?rappel&lien=",
              "un lien `javascript:`": "?rappel&lien=" + quote("javascript:alert(1)"), "un lien `http:` (non chiffré)": "?rappel&lien=" + quote("http://exemple.org/setup.exe")}
    vus = {}
    for nom, prm in caches.items():
        for etat in ("", "&deconnecte"):
            q = ouvrir(prm + etat); vus[nom + etat] = q.locator("[data-rappel-appli-pc]").count(); q.context.close()
    ok("CACHÉE, connecté comme non connecté, dans : l'appli installée, une version hors site, sans lien réglé, avec un lien `javascript:` ou `http:`", all(v == 0 for v in vus.values()), vus)

    # ---------- 4. petit écran et appareil tactile ----------
    q = ouvrir("?rappel", largeur=800)
    petit = q.locator("[data-rappel-appli-pc]").count()
    q.set_viewport_size({"width": 1280, "height": 900}); q.wait_for_timeout(250)
    grand = q.locator("[data-rappel-appli-pc]").count()
    q.set_viewport_size({"width": 820, "height": 900}); q.wait_for_timeout(250)
    ok("PETIT ÉCRAN : cachée sous 900 px de large ; elle APPARAÎT si la fenêtre s'élargit et DISPARAÎT si elle se rétrécit (sans recharger)", petit == 0 and grand == 1 and q.locator("[data-rappel-appli-pc]").count() == 0, [petit, grand])
    q.context.close()
    q = ouvrir("?rappel", largeur=1280, mobile=True)
    ok("APPAREIL TACTILE (téléphone, tablette) : cachée même sur un écran large", q.locator("[data-rappel-appli-pc]").count() == 0)
    q.context.close()

    # ---------- 5. câblage dans la page principale ----------
    src = open("src/pages/DashboardPage.tsx", encoding="utf-8").read()
    i_note, i_rappel, i_sel = src.find("comptes Destiny liés détectés"), src.find("<RappelAppliPC />"), src.find("<SelecteurVues vue={vue}")
    avant = src[max(0, i_rappel - 200):i_rappel]
    ok("CÂBLAGE : la page principale affiche `<RappelAppliPC />` UNE fois, en DERNIER dans la carte Connexion (après la note des comptes liés, avant la fermeture de la carte et le sélecteur de vues), HORS des conditions « connecté » / « non connecté » (donc dans les deux états)", src.count("<RappelAppliPC />") == 1 and 0 < i_note < i_rappel < i_sel and re.search(r"\{\s*!?connecte\s*&&\s*\(?\s*$", avant.strip()) is None and src[i_rappel:i_sel].lstrip().startswith("<RappelAppliPC />\n      </div>"), [i_note, i_rappel, i_sel])
    vite = open("vite.config.ts", encoding="utf-8").read()
    ok("« SITE SEULEMENT » repose sur `__WEB__`, posé par vite.config.ts à partir de la variable NETLIFY du système de build (vrai sur le site, faux pour l'appli installée)", "__WEB__: JSON.stringify(Boolean(process.env.NETLIFY))" in vite and "__WEB__ === true" in open("src/components/RappelAppliPC.tsx", encoding="utf-8").read())

    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

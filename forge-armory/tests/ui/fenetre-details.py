# FR : ⚠️ AJOUT (30/10/2026, branche draft-mod-armures) - TEST D'INTERFACE de la FENÊTRE DE DÉTAILS UNIQUE (`FenetreDetailsPiece`) : demande de l'utilisateur : « les pop-up de détails qui sont dans le Build Analyzer et Forge devraient être identiques et montrer les mêmes infos aux mêmes endroits » + « le bouton Lire le Lore doit aussi être visible dans Build Analyzer » + intégration des visuels de l'archive « boutons-action-final ». Il vérifie : (1) « Lire le Lore » visible dans l'Inventaire ET dans MON BUILD (et absent sans Lore) ; (2) MÊME ORDRE des sections dans les trois fenêtres d'ARMURE et dans les trois fenêtres d'ARME ; (3) même largeur ; (4) fermeture (croix « Fermer », Échap, clic à côté) ; (5) les boutons VISUELS de la charte (Lore, Mettre dans Mon Build, Retour, Actualisation) ; (6) rechargement de l'inventaire. Depuis la racine : python3 tests/ui/fenetre-details.py (le test construit lui-même les pages).
# EN: ⚠️ ADDED - UI test of the single details window: Lore button in My Build, same section order everywhere, same width, closing, charter-artwork buttons.
import glob, os, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for page in (["inventaire"], ["resumebuild"], ["forge"]):
    if subprocess.run(["node", "tests/ui/build.mjs", *page], capture_output=True).returncode != 0: print("❌ construction impossible :", page); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:700]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
PAGES = "file://" + racine + "/tests/ui/_sortie/"
REPERES = "(() => { const r = { titre: '[data-fenetre-details] [role=dialog] > div:first-child', lore: '[data-ligne-lire-lore]', meta: '[data-meta-fenetre]', source: '[data-source-fenetre]', set: '[data-set-fenetre]', origine: '[data-origine-fenetre]', actions: '[data-ligne-actions]', simulation: '[data-mods-armure-simulation]', legende: '[data-legende-niveaux]' }; return Object.entries(r).map(([k, s]) => [k, document.querySelector(s)]).filter(([, e]) => e).map(([k, e]) => [k, Math.round(e.getBoundingClientRect().top)]).sort((a, b) => a[1] - b[1]).map(([k]) => k); })()"
LARGEUR = "(() => { const d = document.querySelector('[data-fenetre-details] [role=dialog]'); return d ? Math.round(d.getBoundingClientRect().width) : null; })()"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    erreurs = []
    def ctx():
        c = b.new_context(viewport={"width": 1280, "height": 1500}); c.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG)); return c
    def inventaire(params):
        q = ctx().new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(PAGES + "inventaire.html" + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(300)
        q.get_by_role("button", name="Charger mon inventaire").click(); q.wait_for_timeout(500); q.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); q.wait_for_timeout(200)
        return q
    def monbuild(params):
        q = ctx().new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(PAGES + "resumebuild.html" + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(400); return q
    def forge(params, partie):
        q = ctx().new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(PAGES + "forge.html" + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(300)
        q.get_by_role("tab", name="Inventaire").click(); q.wait_for_timeout(150)
        if partie == "armures": q.get_by_role("tab", name="Armures").click(); q.wait_for_timeout(200)
        q.get_by_role("button", name="Charger mon inventaire").first.click(); q.wait_for_selector("[data-armure-possedee]" if partie == "armures" else "[data-arme-possedee]"); q.wait_for_timeout(250)
        return q
    ouvrir_ligne = lambda q, nom: (q.locator("li").filter(has_text=nom).first.get_by_role("button", name="Détails").click(), q.wait_for_selector("[data-fenetre-details]"), q.wait_for_timeout(300))

    # ---------- 1. « Lire le Lore » ----------
    qi = inventaire("?casquechatoyant&lore"); ouvrir_ligne(qi, "Casque chatoyant")
    ok("LORE, INVENTAIRE / COFFRE : le bouton « Lire le Lore » est visible dans la fenêtre Détails, c'est le VISUEL de la charte (`bouton-lore.svg`), son nom accessible est « Lire le Lore » ; il est justifié À DROITE et SOUS la croix de fermeture", qi.locator("[data-bouton-lire-lore]").count() == 1 and "bouton-lore" in (qi.locator("[data-bouton-lire-lore] img").get_attribute("src") or "") and qi.locator("[data-bouton-lire-lore]").get_attribute("aria-label") == "Lire le Lore" and qi.locator("[data-bouton-lire-lore]").bounding_box()["y"] > qi.get_by_role("button", name="Fermer").bounding_box()["y"] + qi.get_by_role("button", name="Fermer").bounding_box()["height"] - 2 and abs((qi.locator("[data-bouton-lire-lore]").bounding_box()["x"] + qi.locator("[data-bouton-lire-lore]").bounding_box()["width"]) - (qi.get_by_role("button", name="Fermer").bounding_box()["x"] + qi.get_by_role("button", name="Fermer").bounding_box()["width"])) <= 24)
    qi.locator("[data-bouton-lire-lore]").click(); qi.wait_for_timeout(150)
    ok("LORE, INVENTAIRE : un clic appelle la lecture du Lore avec le hash et le nom de l'objet (5400, « Casque chatoyant d'essai »)", qi.evaluate("window.__lore") == [[5400, "Casque chatoyant d'essai"]], qi.evaluate("window.__lore"))
    qm = monbuild("?casquechatoyant&lore"); ouvrir_ligne(qm, "Casque chatoyant")
    ok("⚠️ LORE, MON BUILD (la demande de l'utilisateur : il MANQUAIT ici) : le bouton « Lire le Lore » est visible dans la fenêtre Détails de Mon Build, même visuel, même place (sous la croix, à droite) ; un clic appelle la lecture du Lore une fois", qm.locator("[data-bouton-lire-lore]").count() == 1 and "bouton-lore" in (qm.locator("[data-bouton-lire-lore] img").get_attribute("src") or "") and qm.locator("[data-bouton-lire-lore]").bounding_box()["y"] > qm.get_by_role("button", name="Fermer").bounding_box()["y"] and (qm.locator("[data-bouton-lire-lore]").click(), qm.wait_for_timeout(150), qm.evaluate("window.__lore"))[2] == [[5400, "Casque chatoyant d'essai"]])
    qs = inventaire("?casquechatoyant"); ouvrir_ligne(qs, "Casque chatoyant")
    qn = monbuild("?casquechatoyant"); ouvrir_ligne(qn, "Casque chatoyant")
    ok("SANS LORE : aucun bouton « Lire le Lore » ni ligne vide, dans l'Inventaire comme dans Mon Build (le bouton n'apparaît que si l'objet possède un Lore)", qs.locator("[data-bouton-lire-lore]").count() == 0 and qs.locator("[data-ligne-lire-lore]").count() == 0 and qn.locator("[data-bouton-lire-lore]").count() == 0 and qn.locator("[data-ligne-lire-lore]").count() == 0)

    # ---------- 2. même ordre des sections : ARMURE ----------
    qf = forge("?inventaire=1&armures=1", "armures"); qf.click('[data-armure-possedee="a1"]'); qf.wait_for_selector("[data-fenetre-details]"); qf.wait_for_timeout(300)
    oi, om, of = qs.evaluate(REPERES), qn.evaluate(REPERES), qf.evaluate(REPERES)
    ok("MÊME ORDRE DES SECTIONS, ARMURE : titre, description, source, set, actions (si présentes), simulation : dans l'Inventaire, dans Mon Build et dans la Forge, la liste ordonnée des repères est la MÊME (on compare sur les repères présents dans les trois fenêtres)", [x for x in oi if x in om and x in of] == [x for x in om if x in oi and x in of] == [x for x in of if x in oi and x in om] and [x for x in oi if x in om and x in of] == ["titre", "meta", "source", "set", "actions", "simulation"], [oi, om, of])
    ok("…et l'ORDRE est celui de la spécification : titre < description < source < set < (actions) < simulation, dans chacune des trois fenêtres", all(o.index("titre") < o.index("meta") < o.index("source") < o.index("set") < o.index("simulation") for o in (oi, om, of)) and all(("actions" not in o) or o.index("set") < o.index("actions") < o.index("simulation") for o in (oi, om, of)), [oi, om, of])
    wi, wm, wf = qs.evaluate(LARGEUR), qn.evaluate(LARGEUR), qf.evaluate(LARGEUR)
    ok("MÊME LARGEUR : les trois fenêtres d'armure ont la même largeur (à 1 px près)", wi and abs(wi - wm) <= 1 and abs(wi - wf) <= 1, [wi, wm, wf])
    ok("MÊME CONTENU D'EN-TÊTE : la description (type · classe · rareté · lieu) et la ligne de source existent dans les trois fenêtres ; la source vaut « Source inconnue » quand le Manifest n'en donne pas", all(q.locator("[data-meta-fenetre]").count() == 1 and q.locator("[data-source-fenetre]").count() == 1 for q in (qs, qn, qf)) and "Casque" in qs.inner_text("[data-meta-fenetre]") and "Casque" in qn.inner_text("[data-meta-fenetre]") and "Casque" in qf.inner_text("[data-meta-fenetre]") and qs.inner_text("[data-source-fenetre]") == "Source inconnue")
    ok("SET : « Cette armure ne fait partie d'aucun set » dans l'Inventaire et dans Mon Build (même texte) ; la Forge (armure d'un ensemble) affiche le set et ses bonus à la MÊME place", "aucun set" in qs.inner_text("[data-set-fenetre]") and "aucun set" in qn.inner_text("[data-set-fenetre]") and "Ensemble de bastion" in qf.inner_text("[data-set-fenetre]"))

    # ---------- 3. même ordre des sections : ARME ----------
    qai = inventaire(""); ouvrir_ligne(qai, "Arme A")
    qam = monbuild(""); ouvrir_ligne(qam, "Arme cinétique")
    qaf = forge("?inventaire=1", "armes"); qaf.locator("[data-arme-possedee]").first.click(); qaf.wait_for_selector("[data-fenetre-details]"); qaf.wait_for_timeout(300)
    ai, am, af = qai.evaluate(REPERES), qam.evaluate(REPERES), qaf.evaluate(REPERES)
    commun = [x for x in ai if x in am and x in af]
    ok("MÊME ORDRE DES SECTIONS, ARME : dans l'Inventaire, dans Mon Build et dans la Forge, les repères présents dans les trois fenêtres (titre, description, source, légende des perks) sont dans le MÊME ordre ; une particularité d'origine, si l'arme en a une, vient après la source et avant les actions", commun == [x for x in am if x in commun] == [x for x in af if x in commun] and commun[:3] == ["titre", "meta", "source"] and "legende" in commun and all(o.index("source") < o.index("legende") for o in (ai, am, af)) and all(("origine" not in o) or o.index("source") < o.index("origine") < o.index("legende") for o in (ai, am, af)), [ai, am, af])
    ok("MÊME CORPS D'ARME : la simulation des perks (légende des niveaux, « Afficher les perks inutiles », « Revenir au roll réel », colonnes) est dans les trois fenêtres d'arme (avant : l'Inventaire et Mon Build n'avaient que des listes en lecture seule)", all(q.locator("[data-fenetre-details] [data-legende-niveaux]").count() == 1 and "Afficher les perks inutiles" in q.locator("[data-fenetre-details]").inner_text() and "Revenir au roll réel" in q.locator("[data-fenetre-details]").inner_text() for q in (qai, qam, qaf)))
    la = [q.evaluate(LARGEUR) for q in (qai, qam, qaf)]
    ok("MÊME LARGEUR pour les trois fenêtres d'arme", abs(la[0] - la[1]) <= 1 and abs(la[0] - la[2]) <= 1 and la[0] == wi, la)

    # ---------- 4. fermeture ----------
    for nom, q in (("Inventaire", qs), ("Mon Build", qn), ("Forge", qf)):
        q.get_by_role("button", name="Fermer").click(); q.wait_for_timeout(150); a = q.locator("[data-fenetre-details]").count()
    ok("FERMETURE PAR LA CROIX : le bouton « Fermer » ferme la fenêtre dans l'Inventaire, Mon Build et la Forge (même nom accessible partout)", all(q.locator("[data-fenetre-details]").count() == 0 for q in (qs, qn, qf)))
    for q in (qai, qam, qaf): q.keyboard.press("Escape"); q.wait_for_timeout(150)
    ok("FERMETURE PAR ÉCHAP : la touche Échap ferme la fenêtre d'arme dans les trois endroits", all(q.locator("[data-fenetre-details]").count() == 0 for q in (qai, qam, qaf)))
    ouvrir_ligne(qs, "Casque chatoyant"); qs.mouse.click(8, 8); qs.wait_for_timeout(150)
    ok("FERMETURE PAR UN CLIC À CÔTÉ (sur le fond sombre) ; un clic DANS la fenêtre ne la ferme pas", qs.locator("[data-fenetre-details]").count() == 0 and (ouvrir_ligne(qs, "Casque chatoyant"), qs.locator("[role=dialog]").click(position={"x": 30, "y": 60}), qs.wait_for_timeout(150), qs.locator("[data-fenetre-details]").count())[3] == 1)

    # ---------- 5. boutons visuels de la charte ----------
    qs.keyboard.press("Escape"); qs.wait_for_timeout(100); ouvrir_ligne(qs, "Casque chatoyant")
    mdb = qs.locator("[data-fenetre-details] [data-mettre-dans-build]")
    ok("« METTRE DANS MON BUILD » (Inventaire) : bouton VISUEL de la charte (`bouton-plus.svg`) de nom accessible « Mettre dans Mon Build » ; un clic ajoute CETTE pièce (c1) au build et le bouton cède la place à « ✓ Déjà dans Mon Build »", mdb.count() == 1 and "bouton-plus" in (mdb.locator("img").get_attribute("src") or "") and mdb.get_attribute("aria-label") == "Mettre dans Mon Build" and (mdb.click(), qs.wait_for_timeout(150), qs.evaluate("window.__ajouts"))[2] == ["c1"] and "Déjà dans Mon Build" in qs.locator("[data-fenetre-details] [data-mettre-dans-build]").inner_text(), qs.evaluate("window.__ajouts"))
    ouvrir_ligne(qn, "Casque chatoyant")
    ok("MON BUILD : la pièce y est déjà : la fenêtre affiche « ✓ Déjà dans Mon Build » (jamais le bouton d'ajout, aucun visuel « Mettre dans Mon Build ») ; le bouton « Forge : choisir les mods de cette armure » est présent", qn.locator("[data-fenetre-details] [data-mettre-dans-build]").count() == 1 and "Déjà dans Mon Build" in qn.locator("[data-fenetre-details] [data-mettre-dans-build]").inner_text() and qn.locator("[data-fenetre-details] [data-mettre-dans-build] img").count() == 0 and qn.locator("[data-fenetre-details] [data-ouvrir-forge]").get_attribute("aria-label") == "Forge : choisir les mods de cette armure" and "bouton-forgemods" in (qn.locator("[data-fenetre-details] [data-ouvrir-forge] img").get_attribute("src") or ""))
    hauteurs = qi.evaluate("[...document.querySelectorAll('[data-fenetre-details] .bouton-action img')].map(i => Math.round(i.getBoundingClientRect().height))")   # la fenêtre avec Lore : boutons « Lire le Lore » et « Mettre dans Mon Build »
    ok("HAUTEUR DES BOUTONS VISUELS : 40 px (la charte conseille 36 à 44 px) ; la largeur suit le texte (aucune déformation : ratio du visuel respecté)", hauteurs and all(36 <= h <= 44 for h in hauteurs), hauteurs)
    # rechargement de l'inventaire (Build Analyzer) : on ferme d'abord la fenêtre
    qs.keyboard.press("Escape"); qs.wait_for_timeout(150)
    ok("ACTUALISATION DE L'INVENTAIRE (Build Analyzer) : avant le chargement, bouton TEXTE « Charger mon inventaire » ; après, le VISUEL `bouton-actualisation.svg`, de nom accessible contenant « Recharger mon inventaire » ; le premier chargement n'utilise PAS le visuel (l'image dit « Actualisation »)", qs.locator("[data-actualiser-inventaire]").count() == 1 and "bouton-actualisation" in (qs.locator("[data-actualiser-inventaire] img").get_attribute("src") or "") and "recharger mon inventaire" in qs.locator("[data-actualiser-inventaire]").get_attribute("aria-label").lower() and qs.get_by_role("button", name="Charger mon inventaire", exact=True).count() == 0)
    qa = ctx().new_page(); qa.goto(PAGES + "inventaire.html?casquechatoyant"); qa.wait_for_function("window.__pret===true"); qa.wait_for_timeout(300)
    ok("…et AVANT le chargement : le bouton texte « Charger mon inventaire » est là, le visuel d'actualisation n'y est pas", qa.get_by_role("button", name="Charger mon inventaire", exact=True).count() == 1 and qa.locator("[data-actualiser-inventaire]").count() == 0)
    ok("un clic sur le visuel d'actualisation relance le chargement sans erreur (l'inventaire reste affiché ensuite)", (qs.locator("[data-actualiser-inventaire]").click(), qs.wait_for_timeout(600), qs.locator("li").filter(has_text="Casque chatoyant").count())[2] >= 1)
    # Forge : actualisation + retour (bandeau)
    ok("FORGE (armures) : après chargement, le rechargement est le VISUEL d'actualisation (nom accessible « Recharger mon inventaire ») ; la page n'a plus de bouton texte « ↻ Recharger »", qf.locator("[data-actualiser-inventaire]").count() == 1 and "bouton-actualisation" in (qf.locator("[data-actualiser-inventaire] img").get_attribute("src") or ""))
    ok("FORGE (armes) : même chose pour le rechargement de l'inventaire des armes", qaf.locator("[data-actualiser-inventaire]").count() == 1)

    # ---------- 6. les deux boutons de la 2e archive : « Forge : choisir les mods… » et « Modifier » ----------
    qs.keyboard.press("Escape"); qs.wait_for_timeout(100); ouvrir_ligne(qs, "Casque chatoyant")
    fm = qs.locator("[data-fenetre-details] [data-ouvrir-forge]")
    bm = qs.locator("[data-fenetre-details] [data-basculer-modifier]")
    ok("« FORGE : CHOISIR LES MODS DE CETTE ARMURE » : VISUEL de la charte (`bouton-forgemods.svg`), nom accessible « Forge : choisir les mods de cette armure », 40 px de haut, ratio du visuel respecté (largeur = 8,703 × hauteur à 1 px près)", fm.count() == 1 and "bouton-forgemods" in (fm.locator("img").get_attribute("src") or "") and fm.get_attribute("aria-label") == "Forge : choisir les mods de cette armure" and round(fm.locator("img").bounding_box()["height"]) == 40 and abs(fm.locator("img").bounding_box()["width"] - 40 * 8.703) <= 1.5, fm.locator("img").bounding_box())
    ok("« MODIFIER » (vue compacte) : VISUEL de la charte (`bouton-modifier.svg`), nom accessible « Modifier », `aria-expanded` faux, 40 px de haut", bm.count() == 1 and "bouton-modifier" in (bm.locator("img").get_attribute("src") or "") and bm.get_attribute("aria-label") == "Modifier" and bm.get_attribute("aria-expanded") == "false" and round(bm.locator("img").bounding_box()["height"]) == 40)
    bm.click(); qs.wait_for_timeout(200)
    bm2 = qs.locator("[data-fenetre-details] [data-basculer-modifier]")
    ok("« MODIFIER » est une BASCULE : une fois ouvert, le bouton devient « Fermer » en TEXTE (le visuel ne dit que « Modifier »), `aria-expanded` vrai, sans image ; un second clic referme et le VISUEL « Modifier » revient", bm2.count() == 1 and bm2.inner_text().strip() == "Fermer" and bm2.get_attribute("aria-expanded") == "true" and bm2.locator("img").count() == 0 and (bm2.click(), qs.wait_for_timeout(200), qs.locator("[data-fenetre-details] [data-basculer-modifier] img").count() == 1 and qs.locator("[data-fenetre-details] [data-basculer-modifier]").get_attribute("aria-expanded") == "false")[2])
    ok("ARME : le bouton « Forge : choisir les perks de cette arme » reste en TEXTE (l'archive n'a pas de visuel « arme »)", qai.evaluate("1") == 1 and (ouvrir_ligne(qai, "Arme A"), qai.locator("[data-fenetre-details] [data-ouvrir-forge]").count())[1] == 1 and "choisir les perks de cette arme" in qai.locator("[data-fenetre-details] [data-ouvrir-forge]").inner_text() and qai.locator("[data-fenetre-details] [data-ouvrir-forge] img").count() == 0)

    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

# FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - TEST D'INTERFACE du sélecteur à QUATRE boutons (Build Analyzer, Load-outs, Forge, Legendarium ; « Bibliothèque » renommé le 13/10/2026). Depuis la racine du projet :
#   node tests/ui/build.mjs selecteur && python3 tests/ui/selecteur.py
# Mesure dans un vrai navigateur, avec la vraie feuille de style : une seule ligne, même hauteur pour les quatre boutons et pour les titres de blocs, pas de défilement horizontal, ordre des vues, état sélectionné, page Forge.
import glob, os, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:300]) if (detail and not cond) else "")
LARGEURS = [1920, 1280, 1032, 1000, 960, 900, 820]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch(); pg = b.new_page()
    hauteurs = []
    for w in LARGEURS:
        pg.set_viewport_size({"width": w, "height": 700}); pg.goto("file://" + racine + "/tests/ui/_sortie/selecteur.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(250)
        m = pg.evaluate("""(() => { const bs=[...document.querySelectorAll('.selecteur-vues .bouton-vue')]; const r=bs.map(e=>e.getBoundingClientRect()); const t=document.querySelector('.titre-categorie').getBoundingClientRect();
            return { vues: bs.map(e=>e.dataset.vue), tops:[...new Set(r.map(x=>Math.round(x.top)))], h:r.map(x=>Math.round(x.height*10)/10), droite:Math.max(...r.map(x=>x.right)), titreH:Math.round(t.height*10)/10, hscroll: document.documentElement.scrollWidth>document.documentElement.clientWidth, rangee: document.querySelector('.selecteur-vues').getBoundingClientRect().width }; })()""")
        hauteurs.append(m["h"][0])
        ok(f"fenêtre {w} px : les QUATRE boutons sont sur UNE seule ligne, dans l'ordre Build Analyzer · Load-outs · Forge · Legendarium (le 4e porte toujours l'identifiant interne « bibliotheque »)", len(m["tops"]) == 1 and m["vues"] == ["analyseur", "loadouts", "forge", "bibliotheque"], m)
        ok(f"fenêtre {w} px : les quatre boutons ont la même hauteur ({m['h'][0]} px), égale à celle d'un titre de bloc ({m['titreH']} px) ; aucun défilement horizontal", len(set(m["h"])) == 1 and abs(m["h"][0] - m["titreH"]) < 0.6 and not m["hscroll"], m)
    # --- v0.4.4 : le quatrième bouton s'appelle « Legendarium » ---
    pg.set_viewport_size({"width": 1280, "height": 700}); pg.goto("file://" + racine + "/tests/ui/_sortie/selecteur.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(250)
    noms_b = pg.evaluate("[...document.querySelectorAll('.selecteur-vues .bouton-vue')].map(e => ({ nom: e.getAttribute('aria-label'), titre: e.getAttribute('title'), role: e.getAttribute('role'), images: [...e.querySelectorAll('img')].map(i => i.getAttribute('src').split('/').pop()) }))")
    ok("LEGENDARIUM : le quatrième bouton s'appelle « Legendarium » pour les lecteurs d'écran et l'infobulle (les quatre noms : Build Analyzer, Load-outs, Forge, Legendarium) ; il garde son rôle d'onglet", [x["nom"] for x in noms_b] == ["Build Analyzer", "Load-outs", "Forge", "Legendarium"] and noms_b[3]["titre"] == "Legendarium" and all(x["role"] == "tab" for x in noms_b), noms_b)
    ok("LEGENDARIUM : ses deux images sont celles de l'archive v5 (bouton-legendarium.svg et bouton-legendarium-selectionne.svg) ; plus aucun fichier « bibliothèque » n'est utilisé", noms_b[3]["images"] == ["bouton-legendarium.svg", "bouton-legendarium-selectionne.svg"] and not any("biblioth" in i for x in noms_b for i in x["images"]), noms_b[3]["images"])
    ok("hauteur de 56 px aux grandes largeurs (1920 et 1280 px), puis qui diminue avec la fenêtre sans jamais descendre sous 41,6 px (minimum de lisibilité de la charte : 40 px)", abs(hauteurs[0] - 56) < 0.6 and abs(hauteurs[1] - 56) < 0.6 and hauteurs == sorted(hauteurs, reverse=True) and min(hauteurs) >= 41.5, hauteurs)
    # --- fenêtre très étroite : retour à la ligne plutôt qu'un défilement horizontal ---
    pg.set_viewport_size({"width": 700, "height": 700}); pg.goto("file://" + racine + "/tests/ui/_sortie/selecteur.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(250)
    ok("fenêtre très étroite (700 px, impossible dans le logiciel installé : largeur minimale 820 px) : les boutons passent à la ligne au lieu de faire défiler la page horizontalement", pg.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth"))
    # --- interaction : Forge ---
    pg.set_viewport_size({"width": 1280, "height": 700}); pg.goto("file://" + racine + "/tests/ui/_sortie/selecteur.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(250)
    ok("les 8 images des 4 boutons (2 états chacun) sont chargées, dont les deux de Forge", pg.evaluate("[...document.querySelectorAll('.selecteur-vues img')].length===8 && [...document.querySelectorAll('.selecteur-vues img')].every(i=>i.complete&&i.naturalWidth>0)") and pg.evaluate("[...document.querySelectorAll('[data-vue=forge] img')].map(i=>i.src.split('/').pop()).join()") == "bouton-forge.svg,bouton-forge-selectionne.svg")
    ok("avant le clic : « Forge » n'est pas sélectionné et la page Forge n'est pas affichée", pg.locator("[data-vue=forge]").get_attribute("aria-selected") == "false" and pg.get_by_role("tablist", name="Vues de la Forge").count() == 0)
    pg.locator("[data-vue=forge]").click(); pg.wait_for_timeout(200)
    ok("après le clic : « Forge » est l'onglet sélectionné (et lui seul) et la page Forge s'affiche avec ses deux vues (le contenu « en construction » de la 0.4.0 a été remplacé en 0.4.3)", pg.locator("[data-vue=forge]").get_attribute("aria-selected") == "true" and pg.locator(".selecteur-vues [aria-selected=true]").count() == 1 and pg.get_by_role("tablist", name="Vues de la Forge").count() == 1)
    ok("TITRE RETIRÉ (demande de l'utilisateur du 13/10/2026, en cours de test) : la page Forge n'a plus de titre « Forge » ni d'icône de titre (aucun h3, aucune image icone-forge) ; elle garde son nom pour les lecteurs d'écran (région « Forge ») et sa note grise ; ses deux boutons de sous-menu sont toujours là", pg.locator(".pilier-carte h3").count() == 0 and pg.evaluate("[...document.querySelectorAll('img')].filter(i => /icone-forge/.test(i.getAttribute('src') ?? '')).length") == 0 and pg.get_by_role("region", name="Forge").count() == 1 and "armes : consultation" in pg.get_by_role("region", name="Forge").inner_text() and pg.get_by_role("tab", name="Collection").count() == 1 and pg.get_by_role("tab", name="Inventaire").count() == 1)
    ok("⚠️ v0.4.3 (remplace l'ancien contrôle du texte « en construction ») : la page Forge propose ses deux vues, « Collection » (sélectionnée) et « Inventaire », et, sans Manifest chargé, dit où le charger", pg.get_by_role("tab", name="Collection").get_attribute("aria-selected") == "true" and pg.get_by_role("tab", name="Inventaire").count() == 1 and "Manifest pas encore chargé" in pg.inner_text("body"), pg.inner_text("body")[:200])
    pg.locator("[data-vue=loadouts]").click(); pg.wait_for_timeout(150)
    ok("on revient : un clic sur un autre onglet masque la page Forge", pg.get_by_role("tablist", name="Vues de la Forge").count() == 0 and pg.locator(".selecteur-vues [aria-selected=true]").get_attribute("data-vue") == "loadouts")
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

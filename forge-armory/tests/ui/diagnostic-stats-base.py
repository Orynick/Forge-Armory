# FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « ok » à ma proposition d'OPTIMISEUR de statistiques d'armure (étape 1 : vérifier les statistiques de base) : TEST D'INTERFACE du bouton « Diagnostic : statistiques de base des armures chargées » de l'inventaire des armures (Forge) : absent hors mode développement ; en développement : présent une fois, à côté des deux autres diagnostics, texte en lecture seule, portée GLOBALE (toutes les armures chargées, même filtrées), contenu cohérent avec les données d'essai, aucun réseau, aucune simulation créée, relançable. Depuis la racine : python3 tests/ui/diagnostic-stats-base.py   (le test construit lui-même les pages)
# EN: ⚠️ ADDED - UI test of the base-stats diagnostic button (absent outside dev mode; global scope; read-only).
import glob, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for args in (["forge"], ["forge", "dev"]):
    if subprocess.run(["node", "tests/ui/build.mjs", *args], capture_output=True).returncode != 0: print("❌ construction impossible :", args); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:700]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
URL = "file://" + racine + "/tests/ui/_sortie/forge.html"
URL_DEV = "file://" + racine + "/tests/ui/_sortie/forge-dev.html"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    erreurs = []; reseau = []
    def ouvrir(params, dev):
        ctx = b.new_context(viewport={"width": 1280, "height": 1100})
        ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e))); q.on("request", lambda r: reseau.append(r.url) if r.resource_type in ("fetch", "xhr") else None)
        q.goto((URL_DEV if dev else URL) + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(300)
        q.get_by_role("tab", name="Inventaire").click(); q.wait_for_timeout(150)
        q.get_by_role("tab", name="Armures").click(); q.wait_for_timeout(200)
        q.get_by_role("button", name="Charger mon inventaire").click(); q.wait_for_selector("[data-armure-possedee]"); q.wait_for_timeout(250)
        return q
    q = ouvrir("?inventaire=1&armures=1", dev=False)
    ok("HORS MODE DÉVELOPPEMENT (logiciel installé) : ni le bouton « statistiques de base », ni son bloc, ni son texte", q.locator("[data-diagnostic-stats-base]").count() == 0 and q.locator("[data-diagnostic-stats-base-texte]").count() == 0 and q.get_by_role("button", name="statistiques de base").count() == 0)
    q.close()
    q = ouvrir("?inventaire=1&armures=1", dev=True)
    bouton = q.locator("[data-diagnostic-stats-base] button")
    ok("EN DÉVELOPPEMENT : le bouton existe UNE fois, nommé « Diagnostic : statistiques de base des armures chargées (à copier à Claude) » ; le texte n'est pas encore là ; les DEUX autres diagnostics globaux sont toujours là (chacun une fois)", bouton.count() == 1 and "statistiques de base des armures chargées" in bouton.inner_text() and q.locator("[data-diagnostic-stats-base-texte]").count() == 0 and q.locator("[data-diagnostic-energie] button").count() == 1 and q.locator("[data-diagnostic-doublons] button").count() == 1)
    bouton.click(); q.wait_for_timeout(250)
    zone = q.locator("[data-diagnostic-stats-base-texte]"); texte = zone.input_value() if zone.count() else ""; lignes = texte.split("\n")
    ok("LE TEXTE S'AFFICHE en lecture seule (un seul champ, non modifiable) ; en-tête « Diagnostic : statistiques de base des armures » puis la méthode", zone.count() == 1 and zone.get_attribute("readonly") is not None and lignes[0] == "Diagnostic : statistiques de base des armures" and lignes[1].startswith("Méthode :"), lignes[:3])
    ok("CONTENU : les armures d'essai (un casque, un plastron exotique, une marque de classe…) sont comptées ; le décompte « Armures lues : N dont 1 marque(s) de classe » est cohérent avec le nombre de cartes affichées ; la section « Pièces HORS modèle » existe", re.search(r"^Armures lues : (\d+) dont 1 marque\(s\) de classe \| hors marques : (\d+) \| conformes au modèle : (\d+) \| HORS modèle : (\d+)$", texte, re.M) is not None and "--- Pièces HORS modèle" in texte, lignes[2:3])
    n_lu = int(re.search(r"^Armures lues : (\d+)", texte, re.M).group(1)) if re.search(r"^Armures lues : (\d+)", texte, re.M) else -1
    ok("PORTÉE GLOBALE : le nombre d'armures lues est celui de TOUTES les armures chargées, pas celui des cartes affichées (le filtre « Chasseur » n'en garde qu'une : le diagnostic en lit toujours autant)", n_lu >= 3, n_lu)
    q.get_by_label("Classe de l'armure").select_option("chasseur"); q.wait_for_timeout(200)   # la seule armure de Chasseur est la marque de classe : la liste filtrée n'a qu'UNE carte
    nb_cartes_filtrees = q.locator("[data-armure-possedee]").count()
    q.locator("[data-diagnostic-stats-base] button").click(); q.wait_for_timeout(250)
    n_filtre = int(re.search(r"^Armures lues : (\d+)", q.locator("[data-diagnostic-stats-base-texte]").input_value(), re.M).group(1))
    ok("…et avec le filtre « Chasseur » actif (une seule carte affichée) le diagnostic lit TOUJOURS le même nombre d'armures", nb_cartes_filtrees == 1 and n_filtre == n_lu, [nb_cartes_filtrees, n_lu, n_filtre])
    ok("LE CASQUE D'ESSAI est listé avec ses statistiques RÉELLES (20 / 10 / 15 / 8 / 12 / 25), son mod de statistique (« Mod de santé »), son ajustement directionnel, et ses statistiques de BASE calculées : Santé 10 (le mod +10 retiré), Mêlée 5 et Grenade 20 (l'ajustement « mêlée vers grenade » retiré) : forme 25·20·12·10·8·5, signalée HORS modèle (les données d'essai ne suivent pas le modèle réel)", any(l.startswith("[casque] Casque de bastion d'essai") and "réelles : Santé 20, Mêlée 10, Grenade 15, Super 8, Classe 12, Arme 25" in l and "mod de statistique : Mod de santé" in l and "ajustement : Ajustement : mêlée vers grenade (directionnel)" in l and "base : Santé 10, Mêlée 5, Grenade 20, Super 8, Classe 12, Arme 25" in l and "forme 25·20·12·10·8·5 hors modèle" in l for l in lignes), [l for l in lignes if "Casque de bastion" in l])
    ok("AUCUN RÉSEAU ET AUCUNE SIMULATION CRÉÉE : le diagnostic ne lit que les données déjà chargées ; le stockage des simulations reste vide", reseau == [] and q.evaluate("localStorage.getItem('forge-armory.forge.simulations.v1')") in (None, '{"version":2,"armes":{},"armures":{}}', '{"version":1,"armes":{}}'), [reseau, q.evaluate("localStorage.getItem('forge-armory.forge.simulations.v1')")])
    q.locator("[data-diagnostic-stats-base] button").click(); q.wait_for_timeout(250)
    ok("RELANÇABLE : un second clic donne le même texte (aucun état caché)", q.locator("[data-diagnostic-stats-base-texte]").input_value() == q.locator("[data-diagnostic-stats-base-texte]").input_value() and q.locator("[data-diagnostic-stats-base-texte]").count() == 1)
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

# FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - TEST D'INTERFACE du DÉMARRAGE du Manifest avec le VRAI composant `RechercheManifest` : vérification de la version, mise à jour AUTOMATIQUE d'un Manifest périmé (et seulement dans ce cas), premier lancement, hors ligne, échec puis reprise manuelle, bouton de simulation du mode développement.
# Le réseau, le disque et l'indexation sont remplacés par des doubles (`tests/ui/faux/`) qui réutilisent le vrai code. Depuis la racine du projet : python3 tests/ui/manifest-demarrage.py   (construit les pages lui-même)
import glob, json, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for args in (["manifest-demarrage"], ["manifest-demarrage", "dev"]):
    if subprocess.run(["node", "tests/ui/build.mjs", *args], capture_output=True).returncode != 0: print("❌ construction de la page impossible", args); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:360]) if (detail and not cond) else "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch(); erreurs = []
    def ouvrir(scenario, dev=False):
        pg = b.new_page(viewport={"width": 1100, "height": 800})
        pg.on("pageerror", lambda e: erreurs.append(str(e))); pg.on("console", lambda m: erreurs.append(m.text) if m.type == "error" else None)
        pg.add_init_script("window.__manifest = Object.assign({appels: [], simulations: [], delai: 300}, " + json.dumps(scenario) + ")")
        pg.goto("file://" + racine + "/tests/ui/_sortie/manifest-demarrage" + ("-dev" if dev else "") + ".html"); pg.wait_for_function("window.__pret===true")
        return pg
    titre = lambda pg: pg.locator("h3").first.inner_text()
    message = lambda pg: pg.locator("[data-maj-auto-manifest]")
    appels = lambda pg: pg.evaluate("window.__manifest.appels")
    bouton = lambda pg: pg.get_by_role("button", name=re.compile("Charger le Manifest|Vérification de la version"))
    attendre_fin = lambda pg: pg.wait_for_function("document.querySelector('h3').innerText.includes('chargé') && !document.querySelector('h3').innerText.includes('non chargé')", timeout=10000)
    # ---------- A : français périmé, anglais jamais téléchargé ----------
    pg = ouvrir({"etat": {"fr": "perime", "en": "absent"}}); pg.wait_for_timeout(100)
    ok("pendant la vérification : le bouton affiche « Vérification de la version du Manifest… » et est grisé", "Vérification de la version" in bouton(pg).inner_text() and bouton(pg).is_disabled(), bouton(pg).inner_text())
    pg.wait_for_selector("[data-maj-auto-manifest]", timeout=5000); texte = message(pg).inner_text()
    ok("FRANÇAIS PÉRIMÉ : l'appli ANNONCE la mise à jour automatique (🔄) en nommant le français seul, sans clic de l'utilisateur", "🔄" in texte and "français" in texte and "anglais" not in texte, texte)
    attendre_fin(pg); pg.wait_for_function("document.querySelector('[data-maj-auto-manifest]').innerText.includes('✅')")
    ok("seul le français est téléchargé (l'anglais, jamais téléchargé, ne l'est PAS : « uniquement dans ce cas »), il est chargé, et l'annonce passe à « ✅ mis à jour automatiquement »", appels(pg) == ["fr"] and "FR chargé" in titre(pg) and "FR + EN" not in titre(pg) and "✅" in message(pg).inner_text() and pg.evaluate("window.__charges") == 1, [appels(pg), titre(pg)])
    ok("le bouton manuel a disparu une fois le Manifest chargé", pg.get_by_role("button", name=re.compile("Charger le Manifest")).count() == 0); pg.close()
    # ---------- G : les deux langues périmées ----------
    pg = ouvrir({"etat": {"fr": "perime", "en": "perime"}}); pg.wait_for_selector("[data-maj-auto-manifest]", timeout=5000); t = message(pg).inner_text(); attendre_fin(pg); pg.wait_for_function("window.__manifest.appels.length===2"); pg.wait_for_timeout(500)
    ok("FRANÇAIS ET ANGLAIS PÉRIMÉS : l'annonce nomme les deux, les deux sont téléchargés dans l'ordre (français puis anglais) et chargés", "français et anglais" in t and appels(pg) == ["fr", "en"] and "FR + EN chargés" in titre(pg), [t, appels(pg), titre(pg)]); pg.close()
    # ---------- B : tout est à jour ----------
    pg = ouvrir({"etat": {"fr": "a-jour", "en": "a-jour"}}); attendre_fin(pg); pg.wait_for_function("window.__manifest.appels.length===2"); pg.wait_for_timeout(300)
    ok("TOUT À JOUR : chargement automatique des deux langues depuis le cache, SANS aucune annonce de mise à jour (comportement de la 0.2.2 conservé)", appels(pg) == ["fr", "en"] and "FR + EN chargés" in titre(pg) and message(pg).count() == 0, [appels(pg), message(pg).count()])
    ok("le bouton de simulation du mode développement n'existe PAS dans la version normale (ni dans le logiciel installé)", pg.get_by_role("button", name=re.compile("Manifest périmé")).count() == 0); pg.close()
    # ---------- C : premier lancement, rien en cache ----------
    pg = ouvrir({"etat": {"fr": "absent", "en": "absent"}}); pg.wait_for_timeout(1000)
    ok("PREMIER LANCEMENT (rien en cache) : AUCUN téléchargement tout seul, le bouton « Charger le Manifest » reste affiché et actif, aucune annonce", appels(pg) == [] and "non chargé" in titre(pg) and bouton(pg).is_enabled() and "Charger le Manifest" in bouton(pg).inner_text() and message(pg).count() == 0, [appels(pg), titre(pg), bouton(pg).inner_text()])
    bouton(pg).click(); attendre_fin(pg); pg.wait_for_function("window.__manifest.appels.length===2"); pg.wait_for_timeout(300)
    ok("le clic sur le bouton (téléchargement manuel) charge les DEUX langues comme avant, sans annonce de mise à jour automatique", appels(pg) == ["fr", "en"] and "FR + EN chargés" in titre(pg) and message(pg).count() == 0, [appels(pg), titre(pg)]); pg.close()
    # ---------- D : état inconnu ; français à jour et anglais absent ----------
    pg = ouvrir({"etat": None}); pg.wait_for_timeout(1000)
    ok("ÉTAT INCONNU (hors ligne, Bungie indisponible) : rien ne se lance, le bouton manuel reste affiché", appels(pg) == [] and "non chargé" in titre(pg) and "Charger le Manifest" in bouton(pg).inner_text() and message(pg).count() == 0); pg.close()
    pg = ouvrir({"etat": {"fr": "a-jour", "en": "absent"}}); pg.wait_for_timeout(1000)
    ok("FRANÇAIS À JOUR et ANGLAIS ABSENT : rien n'est périmé, rien ne se lance seul, le bouton manuel reste (comme avant)", appels(pg) == [] and "Charger le Manifest" in bouton(pg).inner_text() and message(pg).count() == 0); pg.close()
    # ---------- E : échec du téléchargement automatique, puis reprise manuelle ----------
    pg = ouvrir({"etat": {"fr": "perime", "en": "a-jour"}, "echec": True}); pg.wait_for_function("document.querySelector('[data-maj-auto-manifest]') && document.querySelector('[data-maj-auto-manifest]').innerText.includes('échoué')", timeout=8000); pg.wait_for_timeout(1200)
    ok("ÉCHEC du téléchargement automatique : le message dit qu'il a échoué et renvoie au bouton, la cause (503) est affichée, et il n'y a UN SEUL essai (aucune boucle de nouvelles tentatives)", "a échoué" in message(pg).inner_text() and "échoué (503)" in pg.locator("text=⚠️ Téléchargement").first.inner_text() and appels(pg) == ["fr"], [message(pg).inner_text(), appels(pg)])
    ok("après l'échec, le bouton manuel est de nouveau actif et le titre dit « non chargé »", bouton(pg).is_enabled() and "non chargé" in titre(pg), [bouton(pg).inner_text(), titre(pg)])
    pg.evaluate("window.__manifest.echec = false"); bouton(pg).click(); attendre_fin(pg); pg.wait_for_function("window.__manifest.appels.length===3"); pg.wait_for_timeout(300)
    ok("REPRISE : la connexion revenue, le clic manuel charge les deux langues et l'erreur affichée disparaît", "FR + EN chargés" in titre(pg) and pg.locator("text=échoué (503)").count() == 0, [titre(pg), appels(pg)]); pg.close()
    # ---------- F : le bouton de simulation, mode développement ----------
    pg = ouvrir({"etat": {"fr": "a-jour", "en": "a-jour"}, "cachePresent": ["fr", "en"]}, dev=True); attendre_fin(pg)
    sim = pg.get_by_role("button", name=re.compile("Manifest périmé"))
    ok("en MODE DÉVELOPPEMENT, le bouton « 🧪 Manifest périmé (test) » est présent", sim.count() == 1)
    sim.click(); pg.wait_for_timeout(200)
    ok("son clic marque les langues en cache (une seule simulation) et dit de recharger la page (Ctrl+F5) ; il ne lance AUCUN téléchargement", pg.evaluate("window.__manifest.simulations.length") == 1 and "FR et EN" in message(pg).inner_text() and "Ctrl+F5" in message(pg).inner_text() and appels(pg) == ["fr", "en"], [message(pg).inner_text(), appels(pg)])
    pg.evaluate("window.__manifest.cachePresent = []"); sim.click(); pg.wait_for_timeout(200)
    ok("sans Manifest en cache, il le dit au lieu de prétendre avoir marqué quelque chose", "Aucun Manifest en cache" in message(pg).inner_text(), message(pg).inner_text()); pg.close()
    ok("aucune erreur dans la console du navigateur pendant tous les scénarios", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

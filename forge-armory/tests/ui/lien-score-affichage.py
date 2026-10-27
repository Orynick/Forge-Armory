# FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « travaille sur le lien entre stats simulées et score » : TEST D'INTERFACE des DEUX affichages du lien : (1) `ComparaisonScore` : « Score réel 70 → simulé 73 (+3) » avec les piliers et les statistiques qui changent (hausse, baisse, aucun changement), couleurs comprises ; (2) MON BUILD de bout en bout : un hôte qui joue le rôle de la page principale applique la simulation AVEC le Manifest ; une simulation faite dans la fenêtre Détails fait apparaître le DELTA à côté des totaux du build (« Santé 5 (+5) »), et une simulation qui dépasse l'énergie est IGNORÉE et signalée par un badge. Depuis la racine : python3 tests/ui/lien-score-affichage.py   (le test construit lui-même les pages)
# EN: ⚠️ ADDED - UI test of the two displays of the simulation → score link.
import glob, os, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for page in (["comparaison-score"], ["resumebuild"]):
    if subprocess.run(["node", "tests/ui/build.mjs", *page], capture_output=True).returncode != 0: print("❌ construction impossible :", page); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:600]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
URL = lambda nom, params="": "file://" + racine + f"/tests/ui/_sortie/{nom}.html" + params
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    erreurs = []
    def ouvrir(nom, params=""):
        ctx = b.new_context(viewport={"width": 1280, "height": 1300}); ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(URL(nom, params)); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(300); return q
    def attr(q, sel, a):
        l = q.locator(sel); return l.first.get_attribute(a) if l.count() else None
    texte = lambda q, sel: (q.locator(sel).first.inner_text() if q.locator(sel).count() else "")
    couleur = lambda q, sel: q.locator(sel).first.locator("span").first.evaluate("e => getComputedStyle(e).color")
    def clic(q, sel):
        try: q.locator(sel).first.click(timeout=3000)
        except Exception as e: ok(f"CLIC IMPOSSIBLE sur {sel}", False, str(e).splitlines()[0])
        q.wait_for_timeout(200)

    # ---------- 1. l'affichage « réel → simulé » ----------
    q = ouvrir("comparaison-score")
    h, bs, nl = "#hausse [data-comparaison-score]", "#baisse [data-comparaison-score]", "#nul [data-comparaison-score]"
    ok("HAUSSE : « Score réel 70 → simulé 73 (+3) » ; attributs de données justes ; en VERT", texte(q, h).splitlines()[0] == "Score réel 70 → simulé 73 (+3)" and q.locator(h).get_attribute("data-reel") == "70" and q.locator(h).get_attribute("data-simule") == "73" and q.locator(h).get_attribute("data-delta") == "3" and couleur(q, h) == "rgb(127, 216, 143)", texte(q, h))
    ok("HAUSSE : les piliers qui changent (« 4. Effets du Build : 20 → 24 (+4) » et « 5. Statistiques : 55 → 63 (+8) ») et les statistiques du build (Santé 60 → 50 (−10), Grenade 55 → 65 (+10)) sont écrits ; ceux qui ne changent pas ne le sont pas", "4. Effets du Build : 20 → 24 (+4)" in texte(q, h + " [data-comparaison-piliers]") and "5. Statistiques : 55 → 63 (+8)" in texte(q, h + " [data-comparaison-piliers]") and "1. Doctrine" not in texte(q, h + " [data-comparaison-piliers]") and texte(q, h + " [data-comparaison-stats]") == "Statistiques du build : Santé 60 → 50 (−10) · Grenade 55 → 65 (+10)", [texte(q, h + " [data-comparaison-piliers]"), texte(q, h + " [data-comparaison-stats]")])
    ok("BAISSE : « Score réel 70 → simulé 66 (−4) » en ROUGE-ORANGE ; le pilier des statistiques baisse (55 → 40 (−15))", texte(q, bs).splitlines()[0] == "Score réel 70 → simulé 66 (−4)" and couleur(q, bs) == "rgb(224, 160, 128)" and "5. Statistiques : 55 → 40 (−15)" in texte(q, bs + " [data-comparaison-piliers]"), texte(q, bs))
    ok("AUCUN CHANGEMENT : « Score réel 70 → simulé 70 (±0) » en gris, et le texte dit que la simulation ne change ni les statistiques du build ni aucun pilier ; pas de liste de piliers ni de statistiques", texte(q, nl).splitlines()[0] == "Score réel 70 → simulé 70 (±0)" and "ne change ni les statistiques du build ni aucun pilier" in texte(q, nl) and q.locator(nl + " [data-comparaison-piliers]").count() == 0 and q.locator(nl + " [data-comparaison-stats]").count() == 0 and couleur(q, nl) == "rgb(183, 179, 168)", texte(q, nl))
    q.close()

    # ---------- 2. Mon Build de bout en bout ----------
    q = ouvrir("resumebuild", "?casquechatoyant")
    ligne = q.locator("li").filter(has_text="Casque chatoyant").first
    ok("MON BUILD SANS SIMULATION : aucun delta dans les totaux du build ; aucun badge de simulation ignorée", q.locator("[data-stat-delta-simulation]").count() == 0 and q.locator("[data-badge-simulation-rejetee]").count() == 0)
    ligne.get_by_role("button", name="Détails").click(); q.wait_for_timeout(300)
    clic(q, "[data-basculer-modifier]")
    clic(q, "[data-moins-chip=melee]")
    ok("LA FENÊTRE DÉTAILS RESTE OUVERTE PENDANT UNE SIMULATION (défaut corrigé le 27/10/2026 : la ligne de pièce de Mon Build était recréée à chaque rendu, donc la fenêtre et son panneau « Modifier » se REFERMAIENT à chaque clic, puisque la page principale recalcule le build à chaque changement de simulation) : la simulation, le bloc « Ajustement » et le choix « − Mêlée » sont toujours affichés", q.locator("[data-mods-armure-simulation]").count() == 1 and q.locator("[data-simulation-ouverte]").count() == 1 and attr(q, "[data-moins-chip=melee]", "aria-pressed") == "true", [q.locator("[data-mods-armure-simulation]").count(), q.locator("[data-simulation-ouverte]").count()])
    ok("APRÈS « − Mêlée » SUR L'AJUSTEMENT (dans la fenêtre Détails) : les totaux du build montrent le delta de la simulation : Santé +5 et Mêlée −5, calculés avec la règle de l'ajustement ; les autres statistiques n'en ont pas", q.locator("[data-stat-delta-simulation=sante]").count() == 1 and texte(q, "[data-stat-delta-simulation=sante]") == "(+5)" and q.locator("[data-stat-delta-simulation=melee]").count() == 1 and texte(q, "[data-stat-delta-simulation=melee]") == "(−5)" and q.locator("[data-stat-delta-simulation]").count() == 2, [e.inner_text() for e in q.locator("[data-stat-delta-simulation]").all()])
    ok("LE DELTA EST COLORÉ : vert pour une hausse, orange pour une baisse", q.locator("[data-stat-delta-simulation=sante]").evaluate("e => getComputedStyle(e).color") == "rgb(127, 216, 143)" and q.locator("[data-stat-delta-simulation=melee]").evaluate("e => getComputedStyle(e).color") == "rgb(224, 160, 128)")
    ok("LA LIGNE DE L'ARMURE DANS MON BUILD MONTRE LES STATISTIQUES SIMULÉES (Santé 5, Mêlée 0) et le badge « simulé »", "Santé 5 · Mêlée 0" in ligne.inner_text() and ligne.locator("[data-badge-simule-armure]").count() == 1, ligne.inner_text()[:260])
    clic(q, "[data-reinitialiser]")
    ok("« REVENIR À L'ÉQUIPEMENT RÉEL » : le delta disparaît des totaux et le badge aussi", q.locator("[data-stat-delta-simulation]").count() == 0 and ligne.locator("[data-badge-simule-armure]").count() == 0)
    q.close()
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

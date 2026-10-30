# FR : ⚠️ AJOUT (26/10/2026), retour de l'utilisateur : « Je ne vois pas les nouvelles fenêtres... Tu peux vérifier ? » - TEST D'INTERFACE DE BOUT EN BOUT des TROIS VRAIES FENÊTRES qui affichent la simulation des mods d'une armure : (1) la fenêtre Détails de l'INVENTAIRE / Coffre (`SelecteurInventaire`), (2) la fenêtre Détails de MON BUILD (`ResumeBuild`, qui avait sa PROPRE COPIE de l'ancien code : oubliée dans ma première livraison), (3) la fenêtre de la FORGE des armures (`InventaireArmures`, qui affichait un « Total » des statistiques). Le test ouvre chacune comme l'utilisateur (bouton « Détails », carte d'armure) et vérifie qu'elle affiche le NOUVEAU composant (résumé compact, jauge d'énergie, bouton « Modifier »), que l'ancienne liste de pastilles n'y est plus, que les statistiques sont sur DEUX LIGNES de TROIS, qu'il n'y a AUCUN total, et qu'un clic simule vraiment. ⚠️ Mon premier test (`simulation-mods-armure.py`) ne montait que le composant SEUL : il ne pouvait pas voir qu'il manquait deux fenêtres. Depuis la racine : python3 tests/ui/simulation-mods-fenetres.py   (le test construit lui-même les pages)
# EN: ⚠️ ADDED - end-to-end UI test of the THREE real windows showing the armor-mod simulation (inventory Details, Mon Build Details, armor Forge window): new component, 2 rows of 3 stats, no total, a click simulates.
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
sortie = lambda nom: "file://" + racine + f"/tests/ui/_sortie/{nom}.html"
lire = lambda f: open(f"{racine}/{f}", encoding="utf-8").read()
ORDRE = ["sante", "melee", "grenade", "super", "classe", "arme"]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    erreurs = []
    def ouvrir(nom, params):   # un CONTEXTE NEUF par page : les simulations sont mémorisées dans le navigateur (même armure « c1 » dans l'inventaire et dans Mon Build) et ne doivent pas passer d'une page à l'autre
        ctx = b.new_context(viewport={"width": 1280, "height": 1100})
        ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(sortie(nom) + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(300); return q
    def attr(q, sel, a):
        l = q.locator(sel); return l.first.get_attribute(a) if l.count() else None
    def clic(q, sel):
        try: q.locator(sel).first.click(timeout=3000)
        except Exception as e: ok(f"CLIC IMPOSSIBLE sur {sel}", False, str(e).splitlines()[0])
        q.wait_for_timeout(150)
    stat = lambda q, k, a: (lambda v: int(v) if v is not None else None)(attr(q, f"[data-stat={k}]", a))

    def controler(q, nom, capacite, utilisee, stats_reelles=None):
        """Les contrôles COMMUNS aux trois fenêtres, une fois la fenêtre de l'armure ouverte."""
        ok(f"{nom} : le NOUVEAU composant est affiché (un seul), en vue compacte, avec son bouton « Modifier »", q.locator("[data-mods-armure-simulation]").count() == 1 and attr(q, "[data-mods-armure-simulation]", "data-vue") == "compacte" and q.locator("[data-basculer-modifier]").count() == 1 and (q.locator("[data-basculer-modifier]").first.inner_text() == "Modifier"))
        grille = q.locator("[data-stats-armure]").first
        nb_col = grille.evaluate("e => getComputedStyle(e).gridTemplateColumns.split(' ').length") if q.locator("[data-stats-armure]").count() else 0
        tops = grille.evaluate("e => [...e.querySelectorAll('[data-stat]')].map(s => Math.round(s.getBoundingClientRect().top))") if q.locator("[data-stats-armure]").count() else []
        cles = grille.evaluate("e => [...e.querySelectorAll('[data-stat]')].map(s => s.dataset.stat)") if q.locator("[data-stats-armure]").count() else []
        ok(f"{nom} : STATISTIQUES SUR DEUX LIGNES DE TROIS : trois colonnes fixes ; Santé, Mêlée, Grenade sur la 1ʳᵉ ligne ; Super, Classe, Arme sur la 2ᵉ", nb_col == 3 and cles == ORDRE and len(tops) == 6 and len(set(tops[:3])) == 1 and len(set(tops[3:])) == 1 and tops[3] > tops[0], [nb_col, cles, tops])
        ok(f"{nom} : AUCUN TOTAL des statistiques (ni ligne « Total », ni élément `data-stat-total`)", q.locator("[data-stat-total]").count() == 0 and "Total" not in (grille.inner_text() if q.locator("[data-stats-armure]").count() else "Total"), grille.inner_text() if q.locator("[data-stats-armure]").count() else "pas de grille")
        if stats_reelles is not None:
            ok(f"{nom} : les statistiques affichées sont celles de la pièce {stats_reelles}", [stat(q, k, "data-reelle") for k in ORDRE] == stats_reelles and all(stat(q, k, "data-delta") == 0 for k in ORDRE), [stat(q, k, "data-reelle") for k in ORDRE])
        ok(f"{nom} : JAUGE D'ÉNERGIE : {utilisee} / {capacite}", attr(q, "[data-energie]", "data-energie-capacite") == str(capacite) and attr(q, "[data-energie]", "data-energie-utilisee") == str(utilisee), [attr(q, "[data-energie]", "data-energie-capacite"), attr(q, "[data-energie]", "data-energie-utilisee")])
        clic(q, "[data-basculer-modifier]")
        ok(f"{nom} : « Modifier » ouvre les blocs (statistique, ajustement)", attr(q, "[data-mods-armure-simulation]", "data-vue") == "ouverte" and q.locator("[data-bloc=statistique]").count() == 1 and q.locator("[data-bloc=ajustement]").count() == 1)

    # ---------- 1. la fenêtre Détails de l'INVENTAIRE ----------
    q = ouvrir("inventaire", "?casquechatoyant")
    clic(q, 'button:has-text("Charger mon inventaire")'); q.wait_for_timeout(400)
    q.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); q.wait_for_timeout(200)   # les sections (Chasseur, Titan…) sont repliées au départ
    ligne = q.locator("li").filter(has_text="Casque chatoyant").first
    ok("INVENTAIRE : la ligne « Casque chatoyant d'essai » est listée avec un bouton « Détails »", ligne.count() == 1 and ligne.get_by_role("button", name="Détails").count() == 1)
    ligne_stats = q.locator("li").filter(has=q.locator("[data-stat-ligne]")).filter(has_text="Casque chatoyant").first   # la ligne de la section « armures » : seule celle-là affiche les statistiques
    marque = ligne_stats.locator("[data-stat-plus-ligne]")
    ok("INVENTAIRE, LIGNE DE LA LISTE (« ajoute le ⇅ aussi dans les deux lignes montrant les 6 stats de l'armure. Garde le en vert ») : six statistiques en deux lignes de trois ; UN seul ⇅, sur le « + » de la pièce (Super, 2ᵉ ligne), en VERT ; le texte est « Santé 0 · Mêlée 5 · Grenade 5 » puis « ⇅ Super 25 · Classe 40 · Arme 25 » (⇅ DEVANT le nom)", ligne_stats.locator("[data-stat-ligne]").count() == 6 and marque.count() == 1 and marque.get_attribute("data-stat-plus-ligne") == "super" and marque.evaluate("e => getComputedStyle(e).color") == "rgb(127, 216, 143)" and "Santé 0 · Mêlée 5 · Grenade 5" in ligne_stats.inner_text() and "⇅ Super 25 · Classe 40 · Arme 25" in ligne_stats.inner_text(), ligne_stats.inner_text()[:300])
    ligne.get_by_role("button", name="Détails").click(); q.wait_for_timeout(300)
    ok("INVENTAIRE : le bouton « 🔨 Forge : choisir les mods de cette armure » est toujours là", q.get_by_role("button", name="🔨 Forge : choisir les mods de cette armure").count() == 1)
    controler(q, "INVENTAIRE", 11, 10, [0, 5, 5, 25, 40, 25])
    ok("INVENTAIRE, FENÊTRE DÉTAILS : le ⇅ de la liste des statistiques est VERT et un seul", q.locator("[data-stat-plus]").count() == 1 and q.locator("[data-stat-plus]").first.evaluate("e => getComputedStyle(e).color") == "rgb(127, 216, 143)")
    ok("INVENTAIRE : l'ANCIENNE liste de pastilles par groupe n'est plus là (aucun groupe d'emplacements répétés `data-groupe-prises`)", q.locator("[data-groupe-prises]").count() == 0)
    clic(q, "[data-stat-chip=sante]")
    ok("INVENTAIRE : un clic SIMULE vraiment : « Santé » à la place de « Classe » : Classe 40 → 30, Santé 0 → 10 ; énergie inchangée (10)", stat(q, "classe", "data-delta") == -10 and stat(q, "sante", "data-delta") == 10 and attr(q, "[data-energie]", "data-energie-utilisee") == "10")
    q.screenshot(path="/tmp/fenetre_inventaire.png")
    q.close()

    # ---------- 1 bis. l'armure PORTÉE (équipée par le Chasseur) dans l'inventaire ----------
    q = ouvrir("inventaire", "?casquechatoyant&porte")
    clic(q, 'button:has-text("Charger mon inventaire")'); q.wait_for_timeout(400)
    q.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); q.wait_for_timeout(200)
    portee = q.locator("li").filter(has_text="Casque chatoyant").first
    ok("ARMURE PORTÉE (« Je veux aussi le ⇅ sur les armures portées ») : la ligne de l'armure ÉQUIPÉE par le Chasseur affiche ses deux lignes de trois statistiques avec le ⇅ vert devant Super ; avant, seules les armures du Coffre les affichaient", portee.locator("[data-stat-ligne]").count() == 6 and portee.locator("[data-stat-plus-ligne]").count() == 1 and portee.locator("[data-stat-plus-ligne]").get_attribute("data-stat-plus-ligne") == "super" and portee.locator("[data-stat-plus-ligne]").evaluate("e => getComputedStyle(e).color") == "rgb(127, 216, 143)" and "⇅ Super 25 · Classe 40 · Arme 25" in portee.inner_text(), portee.inner_text()[:260])
    q.close()

    # ---------- 2. la fenêtre Détails de MON BUILD ----------
    q = ouvrir("resumebuild", "?casquechatoyant")
    ligne = q.locator("li").filter(has_text="Casque chatoyant").first
    ok("MON BUILD : la ligne de l'armure est listée avec un bouton « Détails »", ligne.count() == 1 and ligne.get_by_role("button", name="Détails").count() == 1)
    ok("MON BUILD, LIGNE DE L'ARMURE (« partout sauf la Collection ») : les deux lignes de trois statistiques avec le ⇅ vert devant Super (la ligne n'affichait aucune statistique avant)", ligne.locator("[data-stat-ligne]").count() == 6 and ligne.locator("[data-stat-plus-ligne]").count() == 1 and ligne.locator("[data-stat-plus-ligne]").get_attribute("data-stat-plus-ligne") == "super" and ligne.locator("[data-stat-plus-ligne]").evaluate("e => getComputedStyle(e).color") == "rgb(127, 216, 143)" and "⇅ Super 25 · Classe 40 · Arme 25" in ligne.inner_text(), ligne.inner_text()[:260])
    ligne.get_by_role("button", name="Détails").click(); q.wait_for_timeout(300)
    controler(q, "MON BUILD", 11, 10, [0, 5, 5, 25, 40, 25])
    ok("MON BUILD : l'ANCIENNE liste de pastilles par groupe n'est plus là", q.locator("[data-groupe-prises]").count() == 0)
    ok("MON BUILD : pas de note « le score et Mon Build en tiennent compte » tant que rien n'est simulé sur le build", q.locator("[data-note-score]").count() == 0)
    clic(q, "[data-moins-chip=melee]")
    ok("MON BUILD : un clic SIMULE vraiment : « − Mêlée » : Santé +5, Mêlée −5", stat(q, "sante", "data-delta") == 5 and stat(q, "melee", "data-delta") == -5)
    q.screenshot(path="/tmp/fenetre_mon_build.png")
    q.close()

    # ---------- 3. la fenêtre de la FORGE des armures ----------
    q = ouvrir("forge", "?inventaire&armures&energie")
    q.get_by_role("tab", name="Inventaire").click(); q.wait_for_timeout(150)
    q.get_by_role("tab", name="Armures").click(); q.wait_for_timeout(200)
    q.get_by_role("button", name="Charger mon inventaire").click(); q.wait_for_selector("[data-armure-possedee]"); q.wait_for_timeout(250)
    carte1, carte2 = q.locator('[data-armure-possedee="a1"]'), q.locator('[data-armure-possedee="a2"]')
    ok("FORGE, CARTES (« partout sauf la Collection ») : la carte du casque (légendaire, « + » Mêlée lu sur son ajustement équipé) affiche six statistiques avec UN ⇅ vert devant Mêlée ; la carte du plastron EXOTIQUE affiche ses six statistiques SANS aucun ⇅ (pas de « + » propre)", carte1.locator("[data-stat-ligne]").count() == 6 and carte1.locator("[data-stat-plus-ligne]").count() == 1 and carte1.locator("[data-stat-plus-ligne]").get_attribute("data-stat-plus-ligne") == "melee" and "Santé 20 · ⇅ Mêlée 10 · Grenade 15" in carte1.inner_text() and carte2.locator("[data-stat-ligne]").count() == 6 and carte2.locator("[data-stat-plus-ligne]").count() == 0, [carte1.inner_text()[:200], carte2.locator("[data-stat-plus-ligne]").count()])
    clic(q, '[data-armure-possedee="a1"]'); q.wait_for_selector("[role=dialog]"); q.wait_for_timeout(250)
    controler(q, "FORGE", 10, 3)
    ok("FORGE : le TOTAL des statistiques a DISPARU de la fenêtre (c'est là qu'il était affiché)", q.locator("[role=dialog] [data-stat-total]").count() == 0 and q.locator("[role=dialog]").first.get_attribute("data-x") is None)
    ok("FORGE : les emplacements NON pris en charge par le composant (archétype, amélioration…) restent listés EN LECTURE SEULE sous la simulation", q.locator("[role=dialog] [data-colonne]").count() >= 1 and all(g.get_attribute("data-modifiable") in (None, "") for g in q.locator("[role=dialog] [data-colonne]").all()), [g.get_attribute("data-modifiable") for g in q.locator("[role=dialog] [data-colonne]").all()])
    ok("FORGE : la case « Afficher les emplacements cosmétiques » est toujours là", q.get_by_label("Afficher les emplacements cosmétiques").count() == 1)
    clic(q, "[data-stat-chip=classe]")
    ok("FORGE : un clic SIMULE vraiment : « Classe » à la place de « Santé » : Classe +10, Santé −10 ; énergie 3 → 1 (le mod de classe coûte 1 dans ces données d'essai)", stat(q, "classe", "data-delta") == 10 and stat(q, "sante", "data-delta") == -10 and attr(q, "[data-energie]", "data-energie-utilisee") == "1", [stat(q, "classe", "data-delta"), stat(q, "sante", "data-delta"), attr(q, "[data-energie]", "data-energie-utilisee")])
    q.screenshot(path="/tmp/fenetre_forge.png")
    clic(q, "[role=dialog] button:has-text('✕')") if q.locator("[role=dialog] button:has-text('✕')").count() else q.keyboard.press("Escape")
    q.wait_for_timeout(300)
    ok("FORGE, CARTE SIMULÉE : une fois le mod de classe simulé, la carte du casque affiche les statistiques SIMULÉES (Santé 10, Classe 22) et plus les réelles (20 et 12) ; le ⇅ reste devant Mêlée", "Santé 10" in q.locator('[data-armure-possedee="a1"]').inner_text() and "Classe 22" in q.locator('[data-armure-possedee="a1"]').inner_text() and q.locator('[data-armure-possedee="a1"] [data-stat-plus-ligne]').count() == 1, q.locator('[data-armure-possedee="a1"]').inner_text()[:260])
    q.close()

    # ---------- 4. le branchement dans le code ----------
    ok("BRANCHEMENT : les TROIS fenêtres affichent `SimulationModsArmure` et AUCUNE ne contient encore l'ancien bloc (`regrouperColonnesArmure` n'est utilisé que par la Forge pour la lecture seule)", all("<SimulationModsArmure" in lire(f"src/components/{c}.tsx") for c in ("SelecteurInventaire", "ResumeBuild", "InventaireArmures")) and "regrouperColonnesArmure" not in lire("src/components/SelecteurInventaire.tsx") and "regrouperColonnesArmure" not in lire("src/components/ResumeBuild.tsx") and "data-stat-total" not in lire("src/components/InventaireArmures.tsx") and "data-mods-armure-simulation" not in lire("src/components/SelecteurInventaire.tsx") and "data-mods-armure-simulation" not in lire("src/components/ResumeBuild.tsx") and "data-mods-armure-simulation" not in lire("src/components/InventaireArmures.tsx"))
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

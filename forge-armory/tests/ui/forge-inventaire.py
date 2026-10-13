# FR : ⚠️ AJOUT (13/10/2026, v0.4.6) - TEST D'INTERFACE de la vue INVENTAIRE de la Forge (armes possédées, roll réel, simulation locale des perks et du mod, persistance) avec le VRAI composant `PageForge`, un faux Manifest et de fausses armes possédées (`?inventaire`). Depuis la racine du projet : python3 tests/ui/forge-inventaire.py   (construit la page lui-même)
import glob, json, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
if subprocess.run(["node", "tests/ui/build.mjs", "forge"], capture_output=True).returncode != 0: print("❌ construction de la page impossible"); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
URL = "file://" + racine + "/tests/ui/_sortie/forge.html"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); erreurs = []
    PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
    ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    def ouvrir(params="?inventaire=1"):
        pg = ctx.new_page(); pg.on("pageerror", lambda e: erreurs.append(str(e))); pg.on("console", lambda m: erreurs.append(m.text) if m.type == "error" else None)
        pg.goto(URL + params); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(300)
        pg.get_by_role("tab", name="Inventaire").click(); pg.wait_for_timeout(150)
        return pg
    def charger(pg):
        pg.get_by_role("button", name="Charger mon inventaire").click(); pg.wait_for_selector("[data-arme-possedee]", timeout=8000); pg.wait_for_timeout(200)
    carte = lambda pg, i: pg.locator(f'[data-arme-possedee="{i}"]')
    puce = lambda pg, h: pg.locator(f'[role=dialog] [data-perk="{h}"]')
    def etat(pg, h): return pg.evaluate("h => { const e = document.querySelector('[role=dialog] [data-perk=\"'+h+'\"]'); return e ? { tag: e.tagName, pressed: e.getAttribute('aria-pressed'), reel: e.dataset.reel, simule: e.dataset.simule, eff: e.dataset.effectif } : null; }", h)
    stock = lambda pg: pg.evaluate("localStorage.getItem('forge-armory.forge.simulations.v1')")
    # ---------- 1. avant de charger ----------
    pg = ouvrir()
    txt = pg.get_by_role("tabpanel", name="Inventaire").inner_text()
    ok("AVANT le chargement : la vue propose « Charger mon inventaire », annonce que RIEN n'est modifié dans le jeu et ne liste encore aucune arme (le chargement interroge Bungie : il est déclenché par un bouton)", "Charger mon inventaire" in txt and "Rien n'est modifié dans le jeu" in txt and pg.locator("[data-arme-possedee]").count() == 0, txt[:200])
    pg2 = ctx.new_page(); pg2.goto(URL + "?inventaire=1&sansCompte=1"); pg2.wait_for_function("window.__pret===true"); pg2.get_by_role("tab", name="Inventaire").click()
    ok("sans compte Bungie connecté : la vue le dit et ne propose pas de charger", "pas connecté à Bungie" in pg2.get_by_role("tabpanel", name="Inventaire").inner_text() and pg2.get_by_role("button", name="Charger mon inventaire").count() == 0); pg2.close()
    # ---------- 2. la liste ----------
    charger(pg)
    ok("la liste montre les 3 ARMES possédées (le Fusil à paliers sur le Titan, le Fusil d'essai au Coffre, le Lance-roquettes chez le Chasseur) et ÉCARTE l'armure", pg.locator("[data-arme-possedee]").count() == 3 and carte(pg, "c1").count() == 0, pg.locator("[data-arme-possedee]").evaluate_all("e=>e.map(x=>x.dataset.armePossedee)"))
    ok("chaque carte dit où est l'arme (Titan · équipée, Coffre, Chasseur) et montre les quatre icônes de la Collection (type, élément, munitions)", "Titan · équipée" in carte(pg, "w1").inner_text() and "Coffre" in carte(pg, "w2").inner_text() and "Chasseur" in carte(pg, "w3").inner_text() and pg.evaluate("[...document.querySelectorAll('[data-arme-possedee=\"w1\"] [data-icones-arme] > [data-icone]')].map(x=>x.dataset.icone).slice(0,3).join()") == "type,element,munition")
    pg.get_by_label("Où se trouve l'arme").select_option("coffre"); pg.wait_for_timeout(100)
    ok("le filtre « où se trouve l'arme » (Coffre) ne garde que l'arme du Coffre ; la recherche par nom fonctionne aussi", pg.locator("[data-arme-possedee]").count() == 1 and carte(pg, "w2").count() == 1)
    pg.get_by_label("Où se trouve l'arme").select_option("tous"); pg.get_by_label("Rechercher une arme possédée").fill("paliers"); pg.wait_for_timeout(100)
    ok("recherche « paliers » : une seule arme", pg.locator("[data-arme-possedee]").count() == 1 and carte(pg, "w1").count() == 1)
    pg.get_by_label("Rechercher une arme possédée").fill("")
    # ---------- 3. le roll réel ----------
    carte(pg, "w1").click(); pg.wait_for_selector("[role=dialog]"); pg.wait_for_timeout(200)
    ok("fenêtre de l'arme : le ROLL RÉEL est marqué ✓ (Canon X, Chargeur X dont la version AMÉLIORÉE est celle de l'arme, Trait P, Crosse de contrepoids) et lui seul ; aucune simulation au départ", [etat(pg, h)["reel"] for h in (6901, 6911, 6921, 6931)] == ["1", "1", "1", "1"] and etat(pg, 6903)["reel"] == "" and etat(pg, 6923)["reel"] == "" and pg.locator("[role=dialog] [data-nb-simulees]").get_attribute("data-nb-simulees") == "0", [etat(pg, h) for h in (6901, 6911, 6921, 6931, 6903)])
    ok("colonnes SÉLECTIONNABLES : les colonnes qui proposent plusieurs perks (canons, chargeurs, traits, mods) ont des puces-boutons ; la colonne de l'armature, qui n'en propose qu'un, n'en a PAS (simples étiquettes)", etat(pg, 6901)["tag"] == "BUTTON" and etat(pg, 6911)["tag"] == "BUTTON" and etat(pg, 6931)["tag"] == "BUTTON" and pg.evaluate("[...document.querySelectorAll('[role=dialog] [data-colonne=\"0\"] [data-perk]')].every(e => e.tagName === 'SPAN')"))
    # ---------- 3 bis. les QUATRE NIVEAUX (v0.4.7, demande de l'utilisateur) ----------
    niveau = lambda h: pg.locator(f'[role=dialog] [data-perk="{h}"]').get_attribute("data-niveau")
    style = lambda h: pg.evaluate("h => { const e = document.querySelector('[role=dialog] [data-perk=\"'+h+'\"]'); const s = getComputedStyle(e); return { bord: s.borderTopColor, style: s.borderTopStyle, texte: s.color }; }", h)
    ok("QUATRE NIVEAUX : le roll réel est « reel » ; un perk disponible sur l'exemplaire mais non sélectionné en jeu est « disponible » (Chargeur abandonné, Stabilité améliorée) ; un perk seulement possible sur le modèle est « possible » (Canon Y, Trait Q)", [niveau(h) for h in (6901, 6911, 6921, 6931)] == ["reel"] * 4 and niveau(6913) == "disponible" and niveau(6933) == "disponible" and niveau(6903) == "possible" and niveau(6923) == "possible", [niveau(h) for h in (6901, 6911, 6921, 6931, 6913, 6933, 6903, 6923)])
    ok("COULEURS : le roll réel a le contour BLEU, le perk disponible le contour GRIS CLAIR (plein), le perk seulement possible un contour discret et son NOM GRISÉ", style(6901)["bord"] == "rgb(122, 162, 247)" and style(6913)["bord"] == "rgb(185, 188, 198)" and style(6913)["style"] == "solid" and style(6903)["texte"] == "rgb(107, 104, 96)" and style(6913)["texte"] != style(6903)["texte"], [style(6901), style(6913), style(6903)])
    leg = pg.locator("[role=dialog] [data-legende-niveaux]").inner_text()
    ok("LÉGENDE : la fenêtre explique les quatre niveaux (roll réel ✓, disponible sur votre exemplaire, nom grisé = possible sur ce modèle, simulé)", "roll réel" in leg and "disponible sur votre exemplaire" in leg and "nom grisé" in leg and "simulé" in leg and "non lue" not in leg, leg)
    ok("ACCESSIBILITÉ : les niveaux sont aussi dits aux lecteurs d'écran (texte caché « disponible sur votre exemplaire… », « possible sur ce modèle… »)", "disponible sur votre exemplaire, non sélectionné en jeu" in puce(pg, 6913).inner_text() and "possible sur ce modèle d'arme mais pas disponible sur votre exemplaire" in puce(pg, 6903).inner_text())
    # ---------- 4. simuler ----------
    puce(pg, 6903).click(); pg.wait_for_timeout(100)
    s = etat(pg, 6903)
    ok("SIMULER « Canon Y » : la puce devient la perk simulée (aria-pressed), le roll réel (Canon X) reste marqué mais mis de côté, et le perk à COMPTER est la version AMÉLIORÉE de Canon Y (6904) puisque l'arme est améliorée", s["pressed"] == "true" and s["simule"] == "1" and s["eff"] == "6904" and etat(pg, 6901)["reel"] == "1" and etat(pg, 6901)["simule"] == "" and etat(pg, 6901)["pressed"] == "false", [s, etat(pg, 6901)])
    ok("un perk seulement POSSIBLE (Canon Y) devient « simule » une fois choisi (doré) ; le roll réel (Canon X) reste « reel » (marqué, en pointillé car mis de côté)", niveau(6903) == "simule" and niveau(6901) == "reel" and style(6903)["bord"] == "rgb(232, 197, 71)" and style(6901)["style"] == "dashed", [niveau(6903), niveau(6901), style(6903), style(6901)])
    ok("l'écran DIT que la version améliorée est comptée : la puce simulée « Canon Y » porte « simulé (▲ comptée) »", "simulé (▲ comptée)" in puce(pg, 6903).inner_text(), puce(pg, 6903).inner_text())
    puce(pg, 6913).click(); pg.wait_for_timeout(100)
    ok("« Chargeur abandonné » (paire reconnue par la position) : choisi 6913, à compter 6914 (sa version améliorée) ; UNE seule perk simulée par colonne (Chargeur X n'est plus simulé)", etat(pg, 6913)["simule"] == "1" and etat(pg, 6913)["eff"] == "6914" and etat(pg, 6911)["simule"] == "")
    puce(pg, 6923).click(); pg.wait_for_timeout(100)
    ok("un perk SANS jumeau (Trait Q) : à compter = lui-même (6923), même sur une arme améliorée", etat(pg, 6923)["eff"] == "6923")
    puce(pg, 6933).click(); pg.wait_for_timeout(100)
    ok("le MOD : « Stabilité améliorée » (un mod amélioré sans base) devient le mod simulé de la colonne « Mods utilisables », un seul mod à la fois", etat(pg, 6933)["simule"] == "1" and etat(pg, 6931)["simule"] == "" and pg.locator("[role=dialog] [data-nb-simulees]").get_attribute("data-nb-simulees") == "4")
    ok("l'en-tête compte « 4 colonnes simulées » ; la carte de la liste porte le badge « Simulation (4 colonnes) » ; ET rien n'a été envoyé à Bungie en écriture (aucun appel autre que la lecture des collections)", "4 colonnes simulées" in pg.locator("[role=dialog]").inner_text() and "Simulation (4 colonnes)" in carte(pg, "w1").inner_text() and all(r["methode"] == "GET" or "components=800" in r["url"] for r in pg.evaluate("window.__reseau")) and not any("TransferItem" in r["url"] or "EquipItem" in r["url"] or "InsertSocketPlug" in r["url"] for r in pg.evaluate("window.__reseau")), pg.evaluate("window.__reseau"))
    # ---------- 5. persistance ----------
    sauve = json.loads(stock(pg))
    ok("la simulation est ENREGISTRÉE localement, par exemplaire (w1) et par index de prise (1, 2, 3, 4), en format compact et versionné", sauve["version"] == 1 and sorted(sauve["armes"]["w1"].keys()) == ["1", "2", "3", "4"] and sauve["armes"]["w1"]["1"] == {"c": 6903, "e": 6904} and sauve["armes"]["w1"]["2"] == {"c": 6913, "e": 6914}, sauve)
    pg.get_by_role("button", name="Fermer").click(); pg.close()
    pg = ouvrir(); charger(pg)
    ok("RECHARGÉE au démarrage : après avoir fermé et rouvert la page, le badge « Simulation (4 colonnes) » est toujours là", "Simulation (4 colonnes)" in carte(pg, "w1").inner_text() and carte(pg, "w1").get_attribute("data-simulee") == "1" and carte(pg, "w2").get_attribute("data-simulee") == "")
    carte(pg, "w1").click(); pg.wait_for_selector("[role=dialog]"); pg.wait_for_timeout(200)
    ok("et la fenêtre rouverte montre les mêmes choix simulés (Canon Y, Chargeur abandonné, Trait Q, Stabilité améliorée) avec les mêmes perks à compter", [etat(pg, h)["simule"] for h in (6903, 6913, 6923, 6933)] == ["1"] * 4 and [etat(pg, h)["eff"] for h in (6903, 6913)] == ["6904", "6914"])
    # ---------- 6. revenir au roll réel ----------
    puce(pg, 6901).click(); pg.wait_for_timeout(100)
    ok("cliquer le ROLL RÉEL d'une colonne (Canon X) revient au roll réel de CETTE colonne seulement (3 colonnes restent simulées)", etat(pg, 6903)["simule"] == "" and etat(pg, 6901)["reel"] == "1" and pg.locator("[role=dialog] [data-nb-simulees]").get_attribute("data-nb-simulees") == "3")
    puce(pg, 6913).click(); pg.wait_for_timeout(100)
    ok("cliquer DE NOUVEAU la perk simulée la retire aussi (bascule)", etat(pg, 6913)["simule"] == "" and pg.locator("[role=dialog] [data-nb-simulees]").get_attribute("data-nb-simulees") == "2")
    pg.get_by_role("button", name="↺ Revenir au roll réel").click(); pg.wait_for_timeout(100)
    ok("« ↺ Revenir au roll réel » efface toute la simulation de l'arme ; le bouton est alors grisé ; le stockage ne garde plus l'arme", pg.locator("[role=dialog] [data-nb-simulees]").get_attribute("data-nb-simulees") == "0" and pg.get_by_role("button", name="↺ Revenir au roll réel").is_disabled() and "w1" not in json.loads(stock(pg))["armes"])
    ok("après le retour au roll réel, Canon Y redevient « possible » (nom grisé) et le roll réel « reel » en contour plein", niveau(6903) == "possible" and niveau(6901) == "reel" and style(6901)["style"] == "solid", [niveau(6903), style(6901)])
    # ---------- 7. arme sans roll réel connu ----------
    pg.get_by_role("button", name="Fermer").click(); carte(pg, "w2").click(); pg.wait_for_selector("[role=dialog]"); pg.wait_for_timeout(200)
    premiere = pg.evaluate("(() => { const e = [...document.querySelectorAll('[role=dialog] [data-colonne] button[data-perk]')][0]; return e ? e.dataset.perk : null; })()")
    ok("une arme dont le roll réel n'est pas connu (Fusil d'essai) : aucune puce n'est marquée « réel », mais on peut quand même simuler ; le perk à compter est celui de base (arme non améliorée)", pg.locator("[role=dialog] [data-reel='1']").count() == 0 and premiere is not None)
    pg.locator(f'[role=dialog] [data-perk="{premiere}"]').click(); pg.wait_for_timeout(100)
    e = etat(pg, premiere)
    ok("…et le choix est enregistré avec effectif = choisi (aucune version améliorée dans cette arme)", e["simule"] == "1" and e["eff"] == str(premiere), e)
    # ---------- 7 bis. disponibilités non lues, ou aucune alternative (v0.4.7) ----------
    niveaux_w2 = pg.evaluate("[...document.querySelectorAll('[role=dialog] [data-colonne] [data-perk]')].map(e => e.dataset.niveau)")
    leg2 = pg.locator("[role=dialog] [data-legende-niveaux]").inner_text()
    ok("DISPONIBILITÉ NON LUE (Fusil d'essai : pas de donnée du composant 310) : la légende le dit (« non lue »), aucun perk n'est grisé ni dit « possible » (niveau « inconnu » partout, sauf le simulé)", "non lue" in leg2 and "nom grisé" not in leg2 and all(n in ("inconnu", "simule", "") for n in niveaux_w2) and "possible" not in niveaux_w2, [leg2, set(niveaux_w2)])
    pg.get_by_role("button", name="Fermer").click(); carte(pg, "w3").click(); pg.wait_for_selector("[role=dialog]"); pg.wait_for_timeout(200)
    niveaux_w3 = pg.evaluate("[...document.querySelectorAll('[role=dialog] [data-colonne] [data-perk]')].map(e => e.dataset.niveau)")
    ok("AUCUNE ALTERNATIVE LUE (Lance-roquettes : table vide) : les perks non équipés sont tous « possible » (grisés), aucun n'est « disponible », et la légende ne dit pas « non lue »", len(niveaux_w3) > 0 and set(niveaux_w3) == {"possible"} and "non lue" not in pg.locator("[role=dialog] [data-legende-niveaux]").inner_text(), niveaux_w3)   # (la fenêtre reste ouverte : la section suivante la ferme)
    # ---------- 8. colonnes masquées ----------
    pg.get_by_role("button", name="Fermer").click(); carte(pg, "w1").click(); pg.wait_for_selector("[role=dialog]")
    pg.get_by_label("Afficher les perks inutiles").check(); pg.wait_for_timeout(150)
    ok("« Afficher les perks inutiles » : la colonne cosmétique réapparaît mais n'est JAMAIS sélectionnable (puces non cliquables, pas de simulation possible)", pg.evaluate("(() => { const c = document.querySelector('[role=dialog] [data-masquee=\"cosmetique\"]'); return !!c && [...c.querySelectorAll('[data-perk]')].length > 0 && [...c.querySelectorAll('[data-perk]')].every(e => e.tagName === 'SPAN'); })()"))
    pg.get_by_role("button", name="Fermer").click()
    # ---------- 9. effacer tout, filtre « simulées », console ----------
    ok("le bouton « ✕ Effacer toutes les simulations (1) » apparaît quand une arme est simulée (ici le Fusil d'essai), et le filtre « Seulement les armes simulées » ne garde qu'elle", pg.locator("[data-effacer-simulations]").inner_text().endswith("(1)") and (pg.get_by_label("Seulement les armes simulées").check() or True) and pg.locator("[data-arme-possedee]").count() == 1 and carte(pg, "w2").count() == 1)
    pg.get_by_label("Seulement les armes simulées").uncheck()
    pg.locator("[data-effacer-simulations]").click(); pg.wait_for_timeout(100)
    ok("« Effacer toutes les simulations » les efface toutes (badge disparu, stockage vide) ; aucune erreur dans la console du navigateur pendant tout le scénario", carte(pg, "w2").get_attribute("data-simulee") == "" and json.loads(stock(pg))["armes"] == {} and len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

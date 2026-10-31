# FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - TEST D'INTERFACE de l'inventaire avec le VRAI composant : « Aller à » (filtre par objet, bandeau, ouverture des sections, défilement) et FILTRE D'ÉLÉMENT (Mon Inventaire et Coffre). Depuis la racine du projet :
#   node tests/ui/build.mjs inventaire && python3 tests/ui/inventaire.py
import glob, os, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:320]) if (detail and not cond) else "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 800}); erreurs = []
    pg.on("pageerror", lambda e: erreurs.append(str(e))); pg.on("console", lambda m: erreurs.append(m.text) if m.type == "error" else None)
    def ouvrir():
        pg.goto("file://" + racine + "/tests/ui/_sortie/inventaire.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(300)
    def ouvert(texte_resume):   # la section (details) dont le résumé contient ce texte est-elle ouverte ?
        return pg.evaluate("t => { const d=[...document.querySelectorAll('details')].find(x=>x.querySelector(':scope > summary')?.textContent.includes(t)); return d ? d.open : null }", texte_resume)
    def compte(texte):          # nombre de lignes affichées dans la page pour ce nom exact (le bandeau « Aller à » n'est pas une ligne d'inventaire)
        return pg.evaluate("t => [...document.querySelectorAll('span,strong,div,li,a')].filter(e=>e.children.length===0 && e.textContent.trim()===t && !e.closest('[data-bandeau-aller-a]')).length", texte)
    bandeau = lambda: pg.locator("[data-bandeau-aller-a]")
    def haut_du_bloc(): return pg.evaluate("document.querySelector('details.bloc-repliable').getBoundingClientRect().top")
    # ---------- 1. « Aller à » AVANT d'avoir chargé l'inventaire ----------
    ouvrir()
    pg.locator("[data-test=aller-A]").click(); pg.wait_for_timeout(900)
    ok("« Aller à » avant le chargement : le bandeau explique qu'il faut d'abord charger l'inventaire (et nomme l'objet)", bandeau().count() == 1 and "Arme A" in bandeau().inner_text() and "chargez d'abord votre inventaire" in bandeau().inner_text(), bandeau().all_inner_texts())
    ok("la page a GLISSÉ jusqu'à « Mon Inventaire » : le haut du bloc est à l'écran (et la page a défilé de plus de 1000 px)", -5 <= haut_du_bloc() <= 80 and pg.evaluate("window.scrollY") > 1000, [haut_du_bloc(), pg.evaluate("window.scrollY")])
    # ---------- 2. après chargement ----------
    pg.get_by_role("button", name="Charger mon inventaire").click(); pg.wait_for_timeout(500)
    ok("après le chargement : le bandeau compte les exemplaires (personnages + coffre) : 2 pour « Arme A »", "2 exemplaires" in bandeau().inner_text(), bandeau().all_inner_texts())
    ok("les sections qui contiennent l'objet sont OUVERTES (Titan et Coffre), les autres restent fermées (Chasseur, Arcaniste)", ouvert("Titan") is True and ouvert("Coffre (") is True and ouvert("Chasseur") is False and ouvert("Arcaniste") is False, [ouvert("Titan"), ouvert("Coffre ("), ouvert("Chasseur"), ouvert("Arcaniste")])
    ok("l'inventaire est filtré sur cet objet : les 2 exemplaires de « Arme A » sont là (personnage ET Coffre), ni « Arme B », ni « Casque C », ni « Arme D » (une autre arme du Coffre)", compte("Arme A") == 2 and compte("Arme B") == 0 and compte("Casque C") == 0 and compte("Arme D") == 0, [compte("Arme A"), compte("Arme B"), compte("Casque C"), compte("Arme D")])
    # ---------- 3. retirer le filtre ----------
    pg.get_by_role("button", name="✕ Retirer ce filtre").click(); pg.wait_for_timeout(300)
    ok("« ✕ Retirer ce filtre » : le bandeau disparaît et tout l'inventaire revient (Arme B et Casque C réapparaissent)", bandeau().count() == 0 and compte("Arme B") >= 1 and compte("Casque C") >= 1 and compte("Arme D") >= 1, [bandeau().count(), compte("Arme B"), compte("Casque C"), compte("Arme D")])
    # ---------- 4. autre objet, objet non possédé, réinitialisation ----------
    pg.locator("[data-test=aller-B]").click(); pg.wait_for_timeout(500)
    ok("« Aller à » un objet à un seul exemplaire (Arme B, chez le Chasseur) : « 1 exemplaire », la section du Chasseur s'ouvre et celle du Titan, qui ne l'a pas, reste fermée", "1 exemplaire " in bandeau().inner_text() and ouvert("Chasseur") is True and ouvert("Titan") is False, [bandeau().all_inner_texts(), ouvert("Chasseur"), ouvert("Titan")])
    pg.locator("[data-test=aller-inconnu]").click(); pg.wait_for_timeout(400)
    ok("« Aller à » un objet non possédé : le bandeau le dit clairement (aucun exemplaire) au lieu de laisser une liste vide inexpliquée", "aucun exemplaire" in bandeau().inner_text(), bandeau().all_inner_texts())
    pg.get_by_role("button", name="✕ Réinitialiser les filtres").first.click(); pg.wait_for_timeout(300)
    ok("« ✕ Réinitialiser les filtres » retire aussi le filtre « Aller à »", bandeau().count() == 0 and compte("Arme A") >= 1)
    # ---------- 5. filtre d'élément : Mon Inventaire ----------
    menu = pg.get_by_role("button", name="Tous les éléments").first
    menu.click(); pg.wait_for_timeout(200)
    libelles = ["Cinétique", "Solaire", "Cryo-électrique", "Abyssal", "Stase", "Filobscur"]
    ys = [pg.get_by_text(l, exact=True).first.bounding_box()["y"] if pg.get_by_text(l, exact=True).count() else -1 for l in libelles]
    ok("le menu « élément de dégâts » propose, dans l'ordre : Cinétique, Solaire, Cryo-électrique, Abyssal, Stase, Filobscur (et « Cryo-électrique », jamais « Arc »)", all(y >= 0 for y in ys) and ys == sorted(ys) and pg.get_by_text("Arc", exact=True).count() == 0, ys)
    pg.get_by_text("Solaire", exact=True).first.click(); pg.wait_for_timeout(300)
    ok("filtre « Solaire » sur Mon Inventaire : seule l'arme Solaire reste chez les personnages (Arme A) ; l'arme cinétique et l'armure disparaissent ; le Coffre, qui a son propre filtre, n'est pas touché (sa copie reste)", compte("Arme B") == 0 and compte("Casque C") == 0 and compte("Arme A") == 2, [compte("Arme A"), compte("Arme B"), compte("Casque C")])
    pg.get_by_role("button", name="Solaire").first.click(); pg.wait_for_timeout(200); pg.get_by_text("Cinétique", exact=True).first.click(); pg.wait_for_timeout(300)
    ok("filtre « Cinétique » : seule l'arme cinétique (Arme B) reste chez les personnages ; l'armure n'a pas d'élément et n'apparaît sous aucun", compte("Arme B") == 1 and compte("Casque C") == 0 and compte("Arme A") == 1, [compte("Arme A"), compte("Arme B"), compte("Casque C")])
    pg.get_by_role("button", name="✕ Réinitialiser les filtres").first.click(); pg.wait_for_timeout(300)
    ok("« Réinitialiser les filtres » remet « Tous les éléments » et tout revient", pg.get_by_role("button", name="Tous les éléments").count() >= 1 and compte("Arme B") >= 1 and compte("Casque C") >= 1)
    # ---------- 6. filtre d'élément : Coffre (filtre jumeau, son propre état) ----------
    pg.evaluate("() => { const d=[...document.querySelectorAll('details')].find(x=>x.querySelector(':scope > summary')?.textContent.includes('Coffre (')); d.open = true; }"); pg.wait_for_timeout(200)
    avant_coffre = compte("Arme A")
    pg.get_by_role("button", name="Tous les éléments").last.click(); pg.wait_for_timeout(200)
    pg.get_by_text("Cinétique", exact=True).last.click(); pg.wait_for_timeout(300)
    ok("filtre « Cinétique » sur le COFFRE : la copie de l'arme Solaire disparaît du Coffre (une de moins) et « Arme D », cinétique, y reste ; les personnages ne sont pas touchés", compte("Arme A") == avant_coffre - 1 and compte("Arme D") == 1 and compte("Arme B") >= 1, [avant_coffre, compte("Arme A"), compte("Arme D"), compte("Arme B")])
    ok("aucune erreur dans la console du navigateur pendant tout le scénario", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

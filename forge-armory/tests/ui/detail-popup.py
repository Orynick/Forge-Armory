# FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - NON-RÉGRESSION de la popup « DÉTAILS » de l'Inventaire (critère 10 de la spécification de la Forge : « le tri des colonnes est conforme à la logique documentée, sans régression dans la pop-up Détails »). VRAI composant `SelecteurInventaire`, qui utilise désormais les règles d'ordre et d'étiquette PARTAGÉES
# avec la Forge (`colonnesArme.ts`) : colonnes dans l'ordre des prises, mods connus EN BAS sous le nom « Mods utilisables », colonnes cosmétiques masquées, « Colonne N » = numéro de prise + 1. Depuis la racine : python3 tests/ui/detail-popup.py
import glob, os, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
if subprocess.run(["node", "tests/ui/build.mjs", "inventaire"], capture_output=True).returncode != 0: print("❌ construction de la page impossible"); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:400]) if (detail and not cond) else "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 900}); erreurs = []
    pg.on("pageerror", lambda e: erreurs.append(str(e)))
    pg.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360f8cfc0f01f0005000201a5f645400000000049454e44ae426082")))
    pg.goto("file://" + racine + "/tests/ui/_sortie/inventaire.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(300)
    pg.get_by_role("button", name="Charger mon inventaire").click(); pg.wait_for_timeout(400)
    pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); pg.wait_for_timeout(200)
    # l'arme 111 (« Arme A ») porte les colonnes de l'arme d'essai : on ouvre SES « Détails » (la ligne qui contient le bouton de transfert a2, une copie de 111 rangée au Coffre)
    ligne = pg.locator('[data-transfert-bouton="a2"]').locator("xpath=ancestor::li[1]")
    ligne.get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    etiquettes = pg.evaluate("[...document.querySelectorAll('strong')].map(e => e.textContent.trim()).filter(t => /^(Colonne \\d+|Mods utilisables)$/.test(t))")
    ok("popup Détails de l'Inventaire : colonnes « Colonne 1 » à « Colonne 4 » dans l'ordre des prises, puis « Mods utilisables » EN BAS (mods jamais masqués, seulement reléguées)", etiquettes == ["Colonne 1", "Colonne 2", "Colonne 3", "Colonne 4", "Mods utilisables"], etiquettes)
    texte = pg.inner_text("body")
    ok("les options de chaque colonne sont toutes là (armature, canons, chargeurs, traits, mods)", all(n in texte for n in ["Armature adaptative", "Canon A", "Canon B", "Chargeur A", "Chargeur B", "Trait 1a", "Trait 1b", "Trait 1c", "Crosse de contrepoids", "Poignée de sprint"]))
    ok("les colonnes cosmétiques (souvenir, compte-frags) restent MASQUÉES dans la popup : l'interrupteur de la Forge ne change rien ici", "Souvenir: Test" not in texte and "Compte-frags" not in texte)
    # « Arme B » (hash 222, chez le Chasseur) a ses MODS en prise 1, AVANT des colonnes de perks : seule une telle arme prouve le tri
    pg.keyboard.press("Escape"); pg.mouse.click(5, 5); pg.wait_for_timeout(150)
    ligneB = pg.locator('[data-transfert-bouton="b1"]').locator("xpath=ancestor::li[1]")
    ligneB.get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    etiqB = pg.evaluate("[...document.querySelectorAll('strong')].map(e => e.textContent.trim()).filter(t => /^(Colonne \\d+|Mods utilisables)$/.test(t))")
    ok("popup Détails d'une arme dont les mods précèdent des colonnes de perks : « Colonne 1, Colonne 3, Colonne 4 » puis « Mods utilisables » EN BAS (le tri est bien appliqué, pas seulement présent)", "Mods utilisables" in etiqB and etiqB[-1] == "Mods utilisables" and "Colonne 3" in etiqB and etiqB.index("Colonne 3") < etiqB.index("Mods utilisables"), etiqB)
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

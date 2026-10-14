# FR : ⚠️ AJOUT (14/10/2026, v0.4.9) - TEST D'INTERFACE de MON BUILD avec des perks SIMULÉS (lien Forge → score) : badge « simulé », fenêtre Détails qui marque le roll RÉEL (jamais un perk simulé), bouton « Forge » (armes possédées seulement), avertissements des deux confirmations d'équipement en jeu. VRAI composant `ResumeBuild`, faux Manifest, aucune connexion à Bungie (les confirmations sont refusées). Depuis la racine : python3 tests/ui/resumebuild.py
import glob, os, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
if subprocess.run(["node", "tests/ui/build.mjs", "resumebuild"], capture_output=True).returncode != 0: print("❌ construction de la page impossible"); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 1000}); erreurs = []; messages = []
    pg.on("pageerror", lambda e: erreurs.append(str(e)))
    pg.on("dialog", lambda d: (messages.append(d.message), d.dismiss()))   # toute confirmation est REFUSÉE : aucune action réelle
    PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
    pg.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    pg.goto("file://" + racine + "/tests/ui/_sortie/resumebuild.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(400)
    ligne = lambda nom: pg.locator("li").filter(has_text=nom).first
    # ---------- badge ----------
    ok("BADGE : l'arme aux perks simulés (Fusil à paliers) porte le badge « 🔨 simulé » ; les autres armes, l'arme non possédée et l'armure n'en portent PAS (un seul badge dans tout Mon Build)", pg.locator("[data-badge-simule]").count() == 1 and ligne("Fusil à paliers").locator("[data-badge-simule]").count() == 1 and "simulé" in ligne("Fusil à paliers").inner_text(), pg.locator("[data-badge-simule]").count())
    ok("l'infobulle du badge explique : prises en compte dans le score, pas appliquées en jeu (2 colonnes)", "2 colonne" in (ligne("Fusil à paliers").locator("[data-badge-simule]").get_attribute("title") or "") and "pas appliquées en jeu" in (ligne("Fusil à paliers").locator("[data-badge-simule]").get_attribute("title") or ""))
    # ---------- fenêtre Détails : le ✓ marque le roll RÉEL ----------
    ligne("Fusil à paliers").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    dlg = pg.locator("div").filter(has=pg.get_by_role("button", name="🔨 Forge : choisir les perks de cette arme")).last
    texte = pg.inner_text("body")
    ok("DÉTAILS de l'arme simulée : le ✓ de « équipé en jeu » est sur le roll RÉEL (Canon X, Chargeur X, Trait P) et PAS sur les perks simulés (Canon Y, Trait Q) : la fenêtre ne ment jamais sur ce qui est réellement équipé", "✓ Canon X" in texte and "✓ Trait P" in texte and "✓ Canon Y" not in texte and "✓ Trait Q" not in texte, [t for t in ("✓ Canon X", "✓ Trait P", "✓ Canon Y", "✓ Trait Q") if t in texte])
    # ---------- bouton Forge ----------
    bouton = pg.get_by_role("button", name="🔨 Forge : choisir les perks de cette arme")
    ok("BOUTON FORGE : la fenêtre Détails d'une arme possédée propose « 🔨 Forge : choisir les perks de cette arme »", bouton.count() == 1)
    bouton.click(); pg.wait_for_timeout(150)
    envois = pg.evaluate("window.__forge.map(p => ({ id: p.itemInstanceId, simules: !!p.perksSimules }))")
    ok("un clic envoie CETTE arme (exemplaire w1) à la Forge, une seule fois", len(envois) == 1 and envois[0]["id"] == "w1", envois)
    pg.get_by_role("button", name="✕").first.click(); pg.wait_for_timeout(150)
    ligne("Casque d'essai").get_by_role("button", name="Détails").click(); pg.wait_for_timeout(300)
    ok("une ARMURE n'a PAS de bouton Forge (la Forge ne concerne que les armes pour l'instant)", pg.get_by_role("button", name="🔨 Forge : choisir les perks de cette arme").count() == 0)
    pg.get_by_role("button", name="✕").first.click(); pg.wait_for_timeout(150)
    ok("une arme NON POSSÉDÉE n'a ni « Détails » ni bouton Forge (elle n'a pas de roll à choisir)", ligne("Lance-roquettes d'essai").get_by_role("button", name="Détails").count() == 0)
    # ---------- avertissements d'équipement ----------
    ligne("Fusil à paliers").get_by_role("button", name="Équiper", exact=True).click(); pg.wait_for_timeout(200)
    m1 = messages[-1] if messages else ""
    ok("ÉQUIPER l'arme simulée : la confirmation AVERTIT que 2 colonnes de perks sont simulées, ne sont PAS appliquées en jeu, et que l'arme sera équipée avec ses perks réels", "SIMULÉS" in m1 and "2 colonne(s)" in m1 and "PAS appliqués en jeu" in m1 and "perks réels" in m1, m1)
    ligne("Fusil d'essai").get_by_role("button", name="Équiper", exact=True).click(); pg.wait_for_timeout(200)
    m2 = messages[-1]
    ok("ÉQUIPER une arme SANS simulation : la confirmation d'avant, sans avertissement de simulation", "Équiper \"Fusil d'essai\"" in m2 and "SIMULÉS" not in m2 and "simul" not in m2.lower(), m2)
    pg.get_by_role("button", name="Équiper le build en jeu").click(); pg.wait_for_timeout(200)
    m3 = messages[-1]
    ok("ÉQUIPER TOUT LE BUILD : la confirmation compte les armes simulées (1 arme a des perks SIMULÉS, non appliqués en jeu)", "1 arme de ce build a des perks SIMULÉS" in m3 and "PAS appliqués en jeu" in m3, m3)
    ok("les trois confirmations ont été REFUSÉES par le test : aucune action réelle chez Bungie (aucun appel réseau vers l'API)", len(messages) == 3)
    ok("aucune erreur JavaScript pendant tout le scénario", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

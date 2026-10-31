# FR : ⚠️ AJOUT (27/10/2026, branche draft-mod-armures), « Dans le scoring, bloc Effets du Build, quand un des verbes vient d'une perk simulée, c'est possible de mettre le badge « simulé » à côté de l'origine du verbe ? » : TEST D'INTERFACE de la carte du pilier : le badge « 🔨 simulé » s'affiche À CÔTÉ du nom de l'origine simulée (au même style que dans Mon Build), seulement pour elle ; une origine cachée (même nom que le verbe) met le badge à côté du verbe ; sans simulation aucun badge et le texte est inchangé ; un autre pilier n'est pas touché. Depuis la racine : python3 tests/ui/badge-verbe-simule.py   (le test construit lui-même la page)
# EN: ⚠️ ADDED - UI test of the "simulated" badge in the pillar card.
import glob, os, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
if subprocess.run(["node", "tests/ui/build.mjs", "pilier-carte"], capture_output=True).returncode != 0: print("❌ construction impossible"); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:500]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    ctx = b.new_context(viewport={"width": 900, "height": 1100}); erreurs = []
    ctx.route("**/*.png", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
    q.goto("file://" + racine + "/tests/ui/_sortie/pilier-carte.html"); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(300)
    ligne = lambda carte, motif: q.locator(f"#{carte} li li").filter(has_text=motif)   # les sous-lignes (les verbes), pas la ligne parente qui les contient
    badge = "[data-badge-simule-verbe]"
    li = ligne("avec", "Blessure solaire (")
    ok("BADGE À CÔTÉ DE L'ORIGINE : la ligne du verbe lit « Blessure solaire (Mod de grenade solaire 🔨 simulé, Siphon quelconque) » ; UN seul badge ; il est dans cette ligne", li.count() == 1 and li.locator(badge).count() == 1 and li.first.inner_text().replace("\n", " ") == "Blessure solaire (Mod de grenade solaire 🔨 simulé, Siphon quelconque)", li.first.inner_text())
    ok("LE BADGE SUIT IMMÉDIATEMENT LE NOM SIMULÉ et PRÉCÈDE l'autre origine (non simulée), qui n'en a pas : l'ordre dans le texte est « Mod de grenade solaire », badge, « , Siphon quelconque) »", li.first.evaluate("e => { const t = e.textContent; const i = t.indexOf('Mod de grenade solaire'), j = t.indexOf('🔨 simulé'), k = t.indexOf('Siphon quelconque'); return i >= 0 && j === i + 'Mod de grenade solaire'.length + 1 && t[j - 1] === ' ' && k > j; }"))
    ok("MÊME STYLE QUE LE BADGE « simulé » DE MON BUILD : or (#e8c547), bordure or, arrondi, petit texte « 🔨 simulé » ; infobulle qui explique", li.locator(badge).evaluate("e => { const s = getComputedStyle(e); return s.color === 'rgb(232, 197, 71)' && s.borderTopColor === 'rgb(232, 197, 71)' && parseFloat(s.borderRadius) > 100 && s.fontSize === '11.2px'; }") and li.locator(badge).inner_text() == "🔨 simulé" and "SIMULÉ" in (li.locator(badge).get_attribute("title") or ""), li.locator(badge).get_attribute("title"))
    ok("LES AUTRES LIGNES DE LA CARTE N'ONT PAS DE BADGE (en-tête du groupe, autres verbes) : un seul badge dans toute la carte", q.locator(f"#avec {badge}").count() == 1)
    ok("SANS SIMULATION : aucun badge, et la ligne lit « Blessure solaire (Mod de grenade solaire, Siphon quelconque) » : texte INCHANGÉ", q.locator(f"#sans {badge}").count() == 0 and ligne("sans", "Blessure solaire (").first.inner_text().replace("\n", " ") == "Blessure solaire (Mod de grenade solaire, Siphon quelconque)")
    ok("ORIGINE CACHÉE (le perk porte le nom du verbe : l'appli n'affiche pas cette origine) : le badge est à côté du VERBE : « Blessure solaire 🔨 simulé »", q.locator(f"#cachee {badge}").count() == 1 and ligne("cachee", "Blessure solaire").filter(has=q.locator(badge)).first.inner_text().replace("\n", " ") == "Blessure solaire 🔨 simulé", q.locator("#cachee li li").all_inner_texts())
    ok("UN AUTRE PILIER (statistiques) N'EST PAS TOUCHÉ : aucun badge, textes tels quels", q.locator(f"#stats {badge}").count() == 0 and "Santé : T6" in q.locator("#stats").inner_text() and "Grenade : T3" in q.locator("#stats").inner_text())
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    q.screenshot(path="/tmp/badge_verbe.png"); b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

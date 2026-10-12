# FR : ⚠️ AJOUT (12/10/2026, v0.4.2) - TEST D'INTERFACE de « TRANSFÉRER VERS » avec le VRAI enchaînement (bouton, module de déplacement, lecture du profil, appel de transfert) et une FAUSSE API BUNGIE À ÉTAT (`tests/ui/faux/bungie.ts`) qui applique vraiment les déplacements et refuse comme Bungie. Depuis la racine du projet :
#   python3 tests/ui/transfert.py        (construit la page elle-même)
import glob, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
if subprocess.run(["node", "tests/ui/build.mjs", "inventaire"], capture_output=True).returncode != 0: print("❌ construction de la page impossible"); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:360]) if (detail and not cond) else "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 900}); erreurs = []
    pg.on("pageerror", lambda e: erreurs.append(str(e))); pg.on("console", lambda m: erreurs.append(m.text) if m.type == "error" else None)
    pg.goto("file://" + racine + "/tests/ui/_sortie/inventaire.html"); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(300)
    pg.get_by_role("button", name="Charger mon inventaire").click(); pg.wait_for_timeout(400)
    pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); pg.wait_for_timeout(200)
    bouton = lambda i: pg.locator(f'[data-transfert-bouton="{i}"]')
    bandeau = lambda: pg.locator("[data-bandeau-transfert]")
    modele = lambda: pg.evaluate("Object.fromEntries(Object.entries(window.__bungie.modele).map(([k,v]) => [k, v.endroit + (v.equipe ? '*' : '')]))")
    appels = lambda: pg.evaluate("window.__bungie.appels.map(a => a.op + ':' + a.characterId + ':' + a.itemId)")
    def ancetres(i):   # les sections (details) qui contiennent la ligne de cet objet
        return pg.evaluate("""id => { const bt = document.querySelector('[data-transfert-bouton="'+id+'"]'); if (!bt) return null; const out = []; let d = bt.closest('details'); while (d) { out.push(d.querySelector(':scope > summary')?.textContent ?? ''); d = d.parentElement.closest('details'); } return out.join(' > '); }""", i)
    def ouvrir_tout():   # comme un utilisateur : une section créée par un déplacement est repliée, on l'ouvre avant d'y cliquer
        pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); pg.wait_for_timeout(100)
    def options(i):
        ouvrir_tout(); bouton(i).click(); pg.wait_for_timeout(150)
        return pg.evaluate("[...document.querySelectorAll('[data-transfert] button')].map(x => x.textContent.trim())")
    def choisir_et_confirmer(i, libelle):
        ouvrir_tout(); bouton(i).click(); pg.wait_for_timeout(100)
        pg.locator("[data-transfert] button", has_text=re.compile(f"^{libelle}$")).click(); pg.wait_for_timeout(100)
        pg.get_by_role("button", name="Confirmer").click(); pg.wait_for_timeout(500)
    # ---------- 1. objet équipé ----------
    ok("OBJET ÉQUIPÉ (« Arme A » du Titan, équipée) : le bouton « Transférer vers » est GRISÉ et son infobulle explique pourquoi", bouton("a1").is_disabled() and "équipé" in (bouton("a1").get_attribute("title") or ""), bouton("a1").get_attribute("title"))
    # ---------- 2. destinations d'une arme du Coffre ; annulation ----------
    opts = options("a2")   # ⚠️ une seule lecture : `options` clique sur le bouton, qui bascule ouvert / fermé
    ok("une ARME du Coffre : les destinations sont Chasseur, Titan, Arcaniste (pas le Coffre où elle est déjà)", opts == ["Chasseur", "Titan", "Arcaniste"], opts)
    pg.locator("[data-transfert] button", has_text=re.compile("^Titan$")).click(); pg.wait_for_timeout(100)
    txt = pg.locator("[data-transfert]").inner_text()
    ok("après le choix, une CONFIRMATION est demandée, qui nomme l'objet, le départ et l'arrivée (« le Coffre → le Titan ») ; rien n'est encore envoyé", "Arme A" in txt and "le Coffre → le Titan" in txt and "deux opérations" not in txt and appels() == [], [txt, appels()])
    pg.get_by_role("button", name="Annuler").click(); pg.wait_for_timeout(100)
    ok("« Annuler » referme tout : aucun appel à Bungie, rien n'a bougé", pg.locator("[data-transfert]").count() == 0 and appels() == [] and modele()["a2"] == "coffre", [appels(), modele()])
    # ---------- 3. réussite directe : Coffre → Titan ----------
    choisir_et_confirmer("a2", "Titan")
    ok("Coffre → Titan : UN seul appel (tirer vers le Titan), l'objet est bien chez le Titan dans l'API, et le bandeau annonce la réussite", appels() == ["tirer:id-titan:a2"] and modele()["a2"] == "titan" and "✅" in bandeau().inner_text() and "le Coffre → le Titan" in bandeau().inner_text(), [appels(), modele(), bandeau().all_inner_texts()])
    ok("l'ÉCRAN est mis à jour : la ligne a quitté le Coffre et apparaît sous le Titan (sans recharger l'inventaire)", "Titan" in (ancetres("a2") or "") and "Coffre (" not in (ancetres("a2") or ""), ancetres("a2"))
    # ---------- 4. d'un personnage à un autre : par le Coffre ----------
    opts = options("b1")
    ok("une arme du Chasseur : destinations Titan, Arcaniste et Coffre", opts == ["Titan", "Arcaniste", "Coffre"], opts)
    pg.locator("[data-transfert] button", has_text=re.compile("^Arcaniste$")).click(); pg.wait_for_timeout(100)
    ok("Chasseur → Arcaniste : la confirmation PRÉVIENT du passage par le Coffre (deux opérations)", "en passant par le Coffre" in pg.locator("[data-transfert]").inner_text(), pg.locator("[data-transfert]").inner_text())
    pg.get_by_role("button", name="Confirmer").click(); pg.wait_for_timeout(600)
    ok("Chasseur → Arcaniste : DEUX appels dans le bon ordre (envoyer au Coffre depuis le Chasseur, PUIS tirer vers l'Arcaniste), l'objet est chez l'Arcaniste, le bandeau le dit", appels()[1:] == ["envoyer:id-chasseur:b1", "tirer:id-arcaniste:b1"] and modele()["b1"] == "arcaniste" and "en passant par le Coffre" in bandeau().inner_text() and "Arcaniste" in (ancetres("b1") or ""), [appels(), modele(), ancetres("b1")])
    # ---------- 5. armure : propre à une classe ----------
    opts = options("c1")
    ok("ARMURE d'Arcaniste portée par l'Arcaniste : la seule destination est le Coffre (une armure ne va pas chez un autre personnage)", opts == ["Coffre"], opts)
    pg.locator("[data-transfert] button", has_text=re.compile("^Coffre$")).click(); pg.wait_for_timeout(100); pg.get_by_role("button", name="Confirmer").click(); pg.wait_for_timeout(500)
    opts = options("c1")
    ok("l'armure est au Coffre ; depuis le Coffre, la SEULE destination est sa propre classe (Arcaniste), jamais le Titan ni le Chasseur", modele()["c1"] == "coffre" and opts == ["Arcaniste"], [modele()["c1"], opts])
    bouton("c1").click(); pg.wait_for_timeout(100)   # referme le panneau
    # ---------- 6. échec à la première étape ----------
    pg.evaluate("window.__bungie.echecs = ['DestinyNoRoomInDestination']"); avant = len(appels())
    choisir_et_confirmer("d1", "Titan")
    ok("ÉCHEC à la première étape (plus de place) : message clair, « Rien n'a été déplacé », l'objet est toujours au Coffre dans l'API ET à l'écran", "⚠️" in bandeau().inner_text() and "Plus de place" in bandeau().inner_text() and "Rien n'a été déplacé" in bandeau().inner_text() and modele()["d1"] == "coffre" and "Coffre (" in (ancetres("d1") or "") and len(appels()) == avant + 1, [bandeau().all_inner_texts(), modele()["d1"], ancetres("d1")])
    # ---------- 7. échec à la seconde étape ----------
    pg.evaluate("window.__bungie.echecs = [null, 'DestinyNoRoomInDestination']")
    choisir_et_confirmer("a2", "Chasseur")
    ok("ÉCHEC à la SECONDE étape (Titan → Chasseur) : le bandeau dit que l'objet est maintenant dans le Coffre, l'API le confirme, et l'ÉCRAN le range dans le Coffre", "maintenant dans le Coffre" in bandeau().inner_text() and modele()["a2"] == "coffre" and "Coffre (" in (ancetres("a2") or ""), [bandeau().all_inner_texts(), modele()["a2"], ancetres("a2")])
    # ---------- 8. un seul transfert à la fois ----------
    pg.evaluate("window.__bungie.delai = 900")
    ouvrir_tout(); bouton("d1").click(); pg.wait_for_timeout(80); pg.locator("[data-transfert] button", has_text=re.compile("^Chasseur$")).click(); pg.wait_for_timeout(80); pg.get_by_role("button", name="Confirmer").click(); pg.wait_for_timeout(250)
    ok("PENDANT un transfert : « ⏳ en cours » est affiché et le bouton de TOUTES les autres lignes est grisé (un seul transfert à la fois), avec une infobulle", pg.get_by_text("Transfert en cours").count() == 1 and bouton("b1").is_disabled() and bouton("a2").is_disabled() and "déjà en cours" in (bouton("b1").get_attribute("title") or ""), [bouton("b1").is_disabled(), bouton("b1").get_attribute("title")])
    pg.wait_for_function("document.querySelectorAll('[data-bandeau-transfert]').length === 1 && document.querySelector('[data-bandeau-transfert]').textContent.includes('Transféré')", timeout=8000); pg.evaluate("window.__bungie.delai = 0"); pg.wait_for_timeout(300)
    ok("après le transfert, les boutons sont de nouveau actifs", not bouton("b1").is_disabled() and not bouton("a2").is_disabled() and modele()["d1"] == "chasseur")
    # ---------- 9. l'objet a changé en jeu : la position RÉELLE prime ----------
    pg.evaluate("window.__bungie.modele.d1 = { hash: 444, endroit: 'titan', equipe: true }"); avant = len(appels())
    choisir_et_confirmer("d1", "Coffre")
    ok("l'objet est devenu ÉQUIPÉ en jeu alors que l'écran le croyait rangé : la position réelle est lue AVANT d'agir, le transfert est REFUSÉ avec l'explication, AUCUN appel de transfert n'est envoyé", "équipé" in bandeau().inner_text() and len(appels()) == avant and modele()["d1"] == "titan*", [bandeau().all_inner_texts(), len(appels()) - avant, modele()["d1"]])
    # ---------- 10. session expirée ----------
    pg.evaluate("window.__bungie.sessionExpiree = true"); avant = len(appels())
    choisir_et_confirmer("a2", "Titan")
    ok("SESSION EXPIRÉE : le bandeau demande de se reconnecter, rien n'est déplacé, aucun appel de transfert", "session Bungie a expiré" in bandeau().inner_text() and len(appels()) == avant and modele()["a2"] == "coffre", bandeau().all_inner_texts())
    pg.evaluate("window.__bungie.sessionExpiree = false")
    # ---------- 11. fermer le bandeau, console ----------
    bandeau().get_by_role("button", name="✕ Fermer").click(); pg.wait_for_timeout(100)
    ok("« ✕ Fermer » retire le bandeau", bandeau().count() == 0)
    ok("aucune erreur dans la console du navigateur pendant tout le scénario", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

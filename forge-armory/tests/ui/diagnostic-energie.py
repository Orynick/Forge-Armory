# FR : ⚠️ AJOUT (24/10/2026, branche draft-mod-armures), demande de l'utilisateur : « un diagnostic pour relever rapidement combien coûte chaque mod de chaque pièce d'armure ». TEST D'INTERFACE du bouton « Diagnostic : coûts d'énergie des mods » de l'inventaire des armures, dans un vrai navigateur : (1) il N'EXISTE PAS hors mode développement (logiciel installé) ; (2) en développement, il existe une seule fois, le texte n'apparaît qu'après un clic, et il est en lecture seule ; (3) son contenu (pièces, énergie, écart, mods, points à vérifier) correspond aux armures d'essai ; (4) sa portée est GLOBALE : un filtre de la liste ne le restreint pas ; (5) il ne fait AUCUN appel réseau ; (6) quand les données n'ont NI coût NI énergie (cas possible des vrais comptes), il le DIT au lieu de se taire ou d'inventer ; (7) le diagnostic de l'armure ouverte existe toujours. Depuis la racine : python3 tests/ui/diagnostic-energie.py   (le test construit lui-même les deux pages)
# EN: ⚠️ ADDED - UI test of the energy-cost diagnostic button (absent outside dev mode; global scope; no network; says so when data lacks costs/energy).
import glob, os, subprocess, sys
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
    ctx = b.new_context(viewport={"width": 1280, "height": 1100}); erreurs = []
    ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    def ouvrir(params, dev):
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto((URL_DEV if dev else URL) + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(300)
        q.get_by_role("tab", name="Inventaire").click(); q.wait_for_timeout(150)
        q.get_by_role("tab", name="Armures").click(); q.wait_for_timeout(200)
        q.get_by_role("button", name="Charger mon inventaire").click(); q.wait_for_selector("[data-armure-possedee]"); q.wait_for_timeout(250)
        return q
    # ---------- 1. hors mode développement ----------
    q = ouvrir("?inventaire=1&armures=1&energie=1", dev=False)
    ok("HORS MODE DÉVELOPPEMENT (logiciel installé) : le bouton « coûts d'énergie » n'existe pas, ni son bloc ; le texte non plus", q.locator("[data-diagnostic-energie]").count() == 0 and q.locator("[data-diagnostic-energie-texte]").count() == 0 and q.get_by_role("button", name="coûts d'énergie").count() == 0)
    q.close()
    # ---------- 2. en développement ----------
    q = ouvrir("?inventaire=1&armures=1&energie=1", dev=True)
    bouton = q.locator("[data-diagnostic-energie] button")
    ok("EN DÉVELOPPEMENT : le bouton existe UNE fois, nommé « Diagnostic : coûts d'énergie des mods de toutes les armures chargées », et le texte n'est pas encore là", bouton.count() == 1 and "coûts d'énergie des mods de toutes les armures chargées" in bouton.inner_text() and q.locator("[data-diagnostic-energie-texte]").count() == 0, bouton.all_inner_texts())
    if bouton.count() != 1:   # bouton absent : on s'arrête ICI avec un échec clair (sinon le clic attendrait 30 s puis planterait)
        print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(1)
    reseau0 = q.evaluate("window.__reseau.length")
    bouton.click(); q.wait_for_timeout(250)
    zone = q.locator("[data-diagnostic-energie-texte]")
    texte = zone.input_value() if zone.count() else ""
    ok("UN CLIC affiche le texte, dans une zone en LECTURE SEULE qui se sélectionne au focus (à copier)", zone.count() == 1 and zone.get_attribute("readonly") is not None, texte[:200])
    lignes = texte.split("\n")
    ok("CONTENU : en-tête ; quatre armures lues dont DEUX avec une énergie (le casque 10, le plastron 11) ; capacités « 10 → 1 pièce ; 11 → 1 pièce »", lignes[0] == "Diagnostic : coûts d'énergie des mods d'armure" and any(x.startswith("Armures lues : 4 | énergie lue sur l'exemplaire : 2 | non lue : 2") for x in lignes) and "Capacités d'énergie lues : 10 → 1 pièce ; 11 → 1 pièce" in lignes, lignes[:4])
    ok("CONTENU : le casque de bastion « capacité 10 | utilisée 3 | somme lue 3 | OK » avec « Mod de santé (3) · Ajustement : mêlée vers grenade (0) » ; le plastron exotique « ÉCART » (utilisé 4, somme lue 1)", any(x.startswith("[casque] Casque de bastion d'essai | titan | titan | palier ? | capacité 10 | utilisée 3 | somme lue 3 | OK") for x in lignes) and "    mods équipés : Mod de santé (3) · Ajustement : mêlée vers grenade (0)" in lignes and any(x.startswith("[torse] Plastron exotique d'essai | arcaniste | coffre | exotique | palier ? | capacité 11 | utilisée 4 | somme lue 1 | ÉCART") for x in lignes), [x for x in lignes if x.startswith("[")])
    ok("CONTENU : les pièces sans emplacement de mod (marque de classe, casque sans emplacements) disent « somme lue aucun emplacement de mod » et non un faux zéro", sum(1 for x in lignes if "somme lue aucun emplacement de mod | comparaison impossible" in x) == 2, [x for x in lignes if x.startswith("[")])
    ok("CONTENU : les mods possibles avec leur coût (« Mod de classe | coût 1 | casque, torse », ajustements à 0) et les points à vérifier (2 pièces comparées sur 4, une en écart nommée, aucun mod sans coût)", "Mod de classe | coût 1 | casque, torse | catégorie « enhancements.v2_general » | 1 hash" in lignes and "Ajustement : mêlée vers grenade | coût 0 | casque | catégorie « enhancements.v2_tuning » | 1 hash" in lignes and "- Pièces comparées (énergie lue et emplacement de mod lu) : 2 sur 4 ; pièces en écart : 1 → Plastron exotique d'essai (utilisée 4, somme lue 1)" in lignes and "- Mods sans coût dans le Manifest (comptés 0) : 0" in lignes and "Règle appliquée : un plug sans coût dans le Manifest compte 0 (validée sur les données réelles)." in lignes, lignes[-8:])
    ok("AUCUN APPEL RÉSEAU : le diagnostic ne fait que lire ce qui est déjà chargé (le journal des appels réseau n'a pas bougé)", q.evaluate("window.__reseau.length") == reseau0, [reseau0, q.evaluate("window.__reseau.length")])
    # ---------- 4. portée globale ----------
    q.get_by_label("Classe de l'armure").select_option("titan"); q.wait_for_timeout(200)
    nb_cartes = q.locator("[data-armure-possedee]").count()
    q.locator("[data-diagnostic-energie] button").click(); q.wait_for_timeout(250)
    t2 = q.locator("[data-diagnostic-energie-texte]").input_value()
    ok("PORTÉE GLOBALE : avec le filtre « Titan » la liste n'affiche plus qu'UNE carte, mais le diagnostic parle toujours des QUATRE armures chargées", nb_cartes == 1 and "Armures lues : 4 |" in t2.split("\n")[1], [nb_cartes, t2.split("\n")[1][:80]])
    # ---------- 7. le diagnostic de l'armure ouverte existe toujours ----------
    q.get_by_label("Classe de l'armure").select_option("toutes"); q.wait_for_timeout(150)
    q.locator('[data-armure-possedee="a1"]').click(); q.wait_for_selector("[role=dialog]"); q.wait_for_timeout(200)
    ok("RÉGRESSION : le diagnostic des emplacements de l'armure OUVERTE existe toujours dans sa fenêtre (et le nouveau n'y est pas dupliqué)", q.locator("[role=dialog]").get_by_role("button", name="Diagnostic des emplacements de cette armure").count() == 1 and q.locator("[role=dialog] [data-diagnostic-energie]").count() == 0)
    q.close()
    # ---------- 8. le diagnostic des mods en double ----------
    q = ouvrir("?inventaire=1&armures=1&energie=1", dev=False)
    ok("MODS EN DOUBLE, HORS MODE DÉVELOPPEMENT : le bouton n'existe pas, ni son bloc", q.locator("[data-diagnostic-doublons]").count() == 0 and q.locator("[data-diagnostic-doublons-texte]").count() == 0 and q.get_by_role("button", name="mods en double").count() == 0)
    q.close()
    q = ouvrir("?inventaire=1&armures=1&energie=1&doublons=1", dev=True)
    bd = q.locator("[data-diagnostic-doublons] button")
    ok("MODS EN DOUBLE, EN DÉVELOPPEMENT : le bouton existe UNE fois (à côté de celui des coûts d'énergie, qui existe toujours) et le texte n'est pas encore là", bd.count() == 1 and "mods en double" in bd.inner_text() and q.locator("[data-diagnostic-energie] button").count() == 1 and q.locator("[data-diagnostic-doublons-texte]").count() == 0, bd.all_inner_texts())
    if bd.count() != 1:
        print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(1)
    reseau1 = q.evaluate("window.__reseau.length")
    bd.click(); q.wait_for_timeout(250)
    zd = q.locator("[data-diagnostic-doublons-texte]"); td = zd.input_value() if zd.count() else ""; ld = td.split("\n")
    ok("LE TEXTE S'AFFICHE en lecture seule : en-tête, « noms de mods distincts lus : 5 | … DIFFÉRENTS : 1 », une version équipée pour ce nom", zd.count() == 1 and zd.get_attribute("readonly") is not None and ld[0] == "Diagnostic : mods en double (même nom, plusieurs versions de coûts différents)" and ld[1].startswith("Noms de mods distincts lus : 5 | noms à plusieurs versions de coûts DIFFÉRENTS : 1 |") and "Versions équipées sur vos pièces, par nom : une seule version : 1 | toutes les versions : 0 | aucune : 0" in ld, ld[:4])
    ok("LE BLOC « Mod de santé » donne les DEUX versions : 7411 (coût 3, équipée sur 1 pièce, proposée par 2 exemplaires) et 7451 (coût 4, équipée sur 0 pièce), toutes deux dans le jeu 8301", "Mod de santé" in ld and any(x.startswith("  hash 7411 | coût 3 | casque, torse | catégorie « enhancements.v2_general » | listes : initial ; jeu 8301 | équipée sur 1 pièce | disponible sur 2 exemplaires") for x in ld) and any(x.startswith("  hash 7451 | coût 4 | casque, torse | catégorie « enhancements.v2_general » | listes : jeu 8301 | équipée sur 0 pièce | disponible sur 0 exemplaire") for x in ld), [x for x in ld if "hash" in x])
    ok("LES CHAMPS QUI DIFFÈRENT sont rapportés (description, bonus de statistique, coût) : « différences : displayProperties.description (« Augmente la santé. » / « Ancienne version. ») … investmentStats[0].value (10 / 5) »", any(x.startswith("  différences : displayProperties.description (\"Augmente la santé.\" / \"Ancienne version.\")") and "investmentStats[0].value (10 / 5)" in x for x in ld) and "  plug.energyCost.energyCost : 1" in ld, [x for x in ld if "différences" in x])
    ok("AUCUN APPEL RÉSEAU pour ce diagnostic non plus", q.evaluate("window.__reseau.length") == reseau1)
    q.get_by_label("Classe de l'armure").select_option("chasseur"); q.wait_for_timeout(200)   # la seule armure de Chasseur est la marque de classe, dont le modèle n'a AUCUN emplacement de mod : la liste filtrée ne contient donc aucun doublon, alors que les autres armures en ont
    q.locator("[data-diagnostic-doublons] button").click(); q.wait_for_timeout(250)
    ok("PORTÉE GLOBALE aussi : avec le filtre « Chasseur » (une seule carte : la marque de classe, sans aucun mod dans son modèle), le diagnostic parle TOUJOURS du doublon des autres armures, qui ne sont pourtant plus dans la liste", q.locator("[data-armure-possedee]").count() == 1 and "noms à plusieurs versions de coûts DIFFÉRENTS : 1" in q.locator("[data-diagnostic-doublons-texte]").input_value(), [q.locator("[data-armure-possedee]").count(), q.locator("[data-diagnostic-doublons-texte]").input_value()[:200]])
    q.close()
    q = ouvrir("?inventaire=1&armures=1&energie=1", dev=True)
    q.locator("[data-diagnostic-doublons] button").click(); q.wait_for_timeout(250)
    ok("SANS DOUBLON dans les données : « Aucun nom de mod n'a plusieurs versions de coûts différents : rien à départager » (un texte clair, pas un vide)", "Aucun nom de mod n'a plusieurs versions de coûts différents : rien à départager." in q.locator("[data-diagnostic-doublons-texte]").input_value().split("\n"))
    # ---------- 6. données sans coût ni énergie ----------
    q = ouvrir("?inventaire=1&armures=1", dev=True)
    q.locator("[data-diagnostic-energie] button").click(); q.wait_for_timeout(250)
    t3 = q.locator("[data-diagnostic-energie-texte]").input_value(); l3 = t3.split("\n")
    ok("DONNÉES SANS COÛT NI ÉNERGIE (cas possible des vrais comptes) : le diagnostic le DIT : « énergie lue : 0 | non lue : 4 » avec l'explication « le champ n'existe peut-être pas dans vos données », « Capacités d'énergie lues : aucune », CINQ mods sans coût (comptés 0), aucune pièce comparée (énergie non lue) donc aucune en écart ; rien n'est inventé", any(x.startswith("Armures lues : 4 | énergie lue sur l'exemplaire : 0 | non lue : 4 (rechargez l'inventaire ; une énergie jamais lue peut signifier que le champ n'existe pas dans vos données)") for x in l3) and "Capacités d'énergie lues : aucune" in l3 and any(x.startswith("- Mods sans coût dans le Manifest (comptés 0) : 5") for x in l3) and "- Pièces comparées (énergie lue et emplacement de mod lu) : 0 sur 4 ; pièces en écart : 0" in l3 and not any("| OK" in x or "| ÉCART" in x for x in l3 if x.startswith("[")), t3[:900])
    q.close()
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

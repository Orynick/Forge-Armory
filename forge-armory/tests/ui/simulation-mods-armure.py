# FR : ⚠️ AJOUT (25/10/2026, branche draft-mod-armures), « La maquette me plait beaucoup ! » : TEST D'INTERFACE de la SIMULATION DES MODS d'une armure avec BUDGET D'ÉNERGIE (`src/components/SimulationModsArmure.tsx`), dans un vrai navigateur, sur la page `entree-simulation-mods.tsx` (vrai composant, vraies fonctions, données communes du casque calqué sur le casque chatoyant réel : capacité 11, énergie utilisée 10). Il vérifie chaque comportement de la MAQUETTE VALIDÉE : la vue compacte (résumé, jauge) et son ouverture, la version standard des mods (pas de doublon), le mod de statistique (+5 / +10, coûts, retrait, retour au réel), le BUDGET (mods grisés avec la raison), les emplacements CUMULABLES (× N, retrait, répartition minimale, trois emplacements), l'ajustement (le « + » imposé sur une pièce légendaire, libre sur une exotique, l'équilibré), l'énergie non lue, un emplacement de raid, la réinitialisation, et le BRANCHEMENT dans la fenêtre Détails. Depuis la racine : python3 tests/ui/simulation-mods-armure.py   (le test construit lui-même la page)
# EN: ⚠️ ADDED - UI test of the armor-mod simulation with an energy budget: compact view, standard versions, stat mod, budget, stackable mods, tuning, exotic, unknown energy, raid slot, reset, wiring.
import glob, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
if subprocess.run(["node", "tests/ui/build.mjs", "simulation-mods"], capture_output=True).returncode != 0: print("❌ construction impossible"); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:600]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
URL = "file://" + racine + "/tests/ui/_sortie/simulation-mods.html"
lire = lambda f: open(f"{racine}/{f}", encoding="utf-8").read()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    ctx = b.new_context(viewport={"width": 640, "height": 1500}); erreurs = []
    ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    def ouvrir(params=""):
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(URL + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(250); return q
    sims = lambda q: q.evaluate("JSON.parse(JSON.stringify(window.__sims.armures))")
    def attr(q, sel, a):   # lecture tolérante : `None` si l'élément n'existe pas (jamais d'attente de 30 s)
        l = q.locator(sel); return l.first.get_attribute(a) if l.count() else None
    def texte(q, sel):
        l = q.locator(sel); return l.first.inner_text() if l.count() else ""
    def desactive(q, sel):
        l = q.locator(sel); return l.first.is_disabled() if l.count() else None
    def clic(q, sel):   # un clic impossible est un ÉCHEC net du test, pas une attente de 30 s suivie d'un plantage
        try: q.locator(sel).first.click(timeout=3000)
        except Exception as e: ok(f"CLIC IMPOSSIBLE sur {sel}", False, str(e).splitlines()[0])
        q.wait_for_timeout(120)
    def ouvrir_modifier(q):
        if q.locator("[data-simulation-ouverte]").count() == 0: clic(q, "[data-basculer-modifier]")
    stat = lambda q, k, a: (lambda v: int(v) if v is not None else None)(attr(q, f"[data-stat={k}]", a))
    eff = lambda q, inst, sock: ((sims(q).get(inst) or {}).get(str(sock)) or {}).get("effectif")   # plug effectif simulé d'un emplacement (None si aucune simulation) : jamais d'exception
    socks = lambda q, inst: list((sims(q).get(inst) or {}).keys())

    # ---------- 1. la vue compacte ----------
    q = ouvrir()
    ok("VUE COMPACTE AU DÉPART : le bouton dit « Modifier », les trois blocs ne sont pas affichés", attr(q, "[data-mods-armure-simulation]", "data-vue") == "compacte" and texte(q, "[data-basculer-modifier]") == "Modifier" and q.locator("[data-simulation-ouverte]").count() == 0)
    ok("STATISTIQUES RÉELLES : Santé 0, Mêlée 5, Grenade 5, Super 25, Classe 40, Arme 25, sans aucune différence", all((stat(q, k, "data-reelle"), stat(q, k, "data-simulee"), stat(q, k, "data-delta")) == (r, r, 0) for k, r in (("sante", 0), ("melee", 5), ("grenade", 5), ("super", 25), ("classe", 40), ("arme", 25))))
    ok("JAUGE D'ÉNERGIE : utilisée 10 sur une capacité de 11 (lue sur la pièce), il en reste 1 ; onze cases dont dix pleines", attr(q, "[data-energie]", "data-energie-utilisee") == "10" and attr(q, "[data-energie]", "data-energie-capacite") == "11" and attr(q, "[data-energie]", "data-energie-restante") == "1" and texte(q, "[data-energie-texte]") == "10 / 11 · il reste 1" and q.locator("[data-energie-case=pleine]").count() == 10 and q.locator("[data-energie-case=vide]").count() == 1)
    ok("RÉSUMÉ COMPACT : « Mod de classe · 3 », « +Super / -Santé · 0 », trois emplacements cumulables pleins (coûts 3, 3, 1) et « Cumulables : Source de Super × 2 · Siphon harmonieux »", texte(q, "[data-resume-statistique]").endswith("Mod de classe · 3") and texte(q, "[data-resume-ajustement]").endswith("+Super / -Santé · 0") and [s.inner_text() for s in q.locator("[data-slot-cumulable=plein]").all()] == ["3", "3", "1"] and texte(q, "[data-resume-texte]") == "Cumulables : Source de Super × 2 · Siphon harmonieux" and texte(q, "[data-nb-simulees]") == "Aucun mod simulé : équipement réel.", texte(q, "[data-resume-cumulables]"))
    clic(q, "[data-basculer-modifier]")
    ok("« MODIFIER » OUVRE les trois blocs (statistique, ajustement, cumulables) et le bouton devient « Fermer » ; un second clic referme", attr(q, "[data-mods-armure-simulation]", "data-vue") == "ouverte" and q.locator("[data-bloc=statistique]").count() == 1 and q.locator("[data-bloc=ajustement]").count() == 1 and q.locator("[data-bloc=cumulables]").count() == 1 and q.locator("[data-bloc=autres]").count() == 0 and texte(q, "[data-basculer-modifier]") == "Fermer" and (clic(q, "[data-basculer-modifier]") or True) and q.locator("[data-simulation-ouverte]").count() == 0)
    ouvrir_modifier(q)
    ok("VERSION STANDARD SEULE : trois statistiques proposées (classe, santé, arme), deux niveaux (+5 · 1 énergie, +10 · 3 énergie) et QUATRE mods cumulables, sans aucune version en double à prix réduit", [c.get_attribute("data-stat-chip") for c in q.locator("[data-stat-chip]").all()] == ["classe", "sante", "arme"] and [c.inner_text() for c in q.locator("[data-intensite-chip]").all()] == ["+5 · 1 énergie", "+10 · 3 énergie"] and q.locator("[data-cumulable]").count() == 4 and sorted(c.get_attribute("data-cout") for c in q.locator("[data-cumulable]").all()) == ["1", "2", "3", "3"])

    # ---------- 2. le mod de statistique ----------
    clic(q, "[data-stat-chip=sante]")
    ok("STATISTIQUE : choisir « Santé » (même coût 3) : Classe 40 → 30 (−10), Santé 0 → 10 (+10), énergie inchangée (10 / 11) ; une seule colonne simulée, celle du mod de statistique", stat(q, "classe", "data-delta") == -10 and stat(q, "classe", "data-simulee") == 30 and stat(q, "sante", "data-delta") == 10 and stat(q, "sante", "data-simulee") == 10 and attr(q, "[data-energie]", "data-energie-utilisee") == "10" and socks(q, "c1") == ["2"] and eff(q, "c1", 2) == 9111, sims(q))
    clic(q, "[data-intensite-chip='5']")
    ok("NIVEAU +5 : le mod passe au « Mod de santé mineur » (coût 1) : Santé +5 seulement, énergie 10 → 8 (il en reste 3) ; la ligne « Mod choisi » le dit", stat(q, "sante", "data-simulee") == 5 and attr(q, "[data-energie]", "data-energie-utilisee") == "8" and texte(q, "[data-nom-stat-mod]") == "Mod choisi : Mod de santé mineur (+5 Santé, 1 énergie)", texte(q, "[data-nom-stat-mod]"))
    clic(q, "[data-intensite-chip='10']")
    ok("NIVEAU +10 : retour au majeur (coût 3), énergie 10", stat(q, "sante", "data-simulee") == 10 and attr(q, "[data-energie]", "data-energie-utilisee") == "10")
    clic(q, "[data-stat-chip=sante]")
    ok("CLIQUER DE NOUVEAU LE MOD SIMULÉ revient à l'équipement réel : aucune simulation, Classe 40, Santé 0", sims(q) == {} and stat(q, "classe", "data-simulee") == 40 and stat(q, "sante", "data-simulee") == 0, sims(q))
    clic(q, "[data-stat-chip=classe]")
    ok("CLIQUER LE MOD ÉQUIPÉ le RETIRE (plug vide) : Classe 40 → 30, énergie 10 → 7 ; plus aucune statistique n'est active ; le résumé dit « aucun »", eff(q, "c1", 2) == 9199 and stat(q, "classe", "data-simulee") == 30 and attr(q, "[data-energie]", "data-energie-utilisee") == "7" and q.locator("[data-stat-chip][aria-pressed=true]").count() == 0 and texte(q, "[data-nom-stat-mod]") == "Aucun mod de statistique", sims(q))
    clic(q, "[data-stat-chip=classe]")
    ok("REPOSER LE MOD ÉQUIPÉ : retour au réel, aucune simulation (jamais de simulation « égale à l'équipé »)", sims(q) == {} and attr(q, "[data-energie]", "data-energie-utilisee") == "10")

    # ---------- 3. les emplacements cumulables ----------
    pastilles = lambda: {c.get_attribute("data-cumulable"): (c.is_disabled(), c.get_attribute("title"), c.get_attribute("data-n")) for c in q.locator("[data-cumulable]").all()}
    ok("TROIS EMPLACEMENTS PLEINS : tous les mods cumulables sont grisés avec la raison « 3 emplacements pleins : retirez-en un » ; seuls les deux mods posés ont un bouton « − » ; compteurs × 2 (Source de Super) et × 1 (Siphon)", all(d and t == "3 emplacements pleins : retirez-en un" for d, t, _ in pastilles().values()) and q.locator("[data-cumulable-retirer]").count() == 2 and attr(q, "[data-cumulable='9201']", "data-n") == "2" and attr(q, "[data-cumulable='9203']", "data-n") == "1", pastilles())
    clic(q, "[data-cumulable-retirer='9203']")
    ok("RETIRER LE SIPHON : un seul emplacement change (le 6ᵉ devient vide), énergie 10 → 9, il en reste 2 ; le résumé montre 2 emplacements pleins et 1 vide", socks(q, "c1") == ["5"] and eff(q, "c1", 5) == 9299 and attr(q, "[data-energie]", "data-energie-utilisee") == "9" and q.locator("[data-slot-cumulable=plein]").count() == 2 and q.locator("[data-slot-cumulable=vide]").count() == 1, sims(q))
    pi = pastilles()
    ok("LE BUDGET GRISE CE QUI EST TROP CHER : avec 2 d'énergie restante, la Source de Super et le Détecteur (3) sont grisés « Pas assez d'énergie : il reste 2 » ; le Ciblage harmonieux (2) et le Siphon (1) restent posables", pi["9201"][:2] == (True, "Pas assez d'énergie : il reste 2") and pi["9206"][:2] == (True, "Pas assez d'énergie : il reste 2") and pi["9204"][0] is False and pi["9203"][0] is False, pi)
    clic(q, "[data-cumulable='9204']")
    ok("POSER LE CIBLAGE (coût 2) : énergie 11 sur 11, il n'en reste plus ; la jauge est pleine ; de nouveau tous les mods sont grisés (emplacements pleins)", eff(q, "c1", 5) == 9204 and attr(q, "[data-energie]", "data-energie-utilisee") == "11" and texte(q, "[data-energie-texte]") == "11 / 11 (réel : 10) · il reste 0" and q.locator("[data-energie-case=vide]").count() == 0 and all(d for d, _, _ in pastilles().values()))
    clic(q, "[data-cumulable-retirer='9204']"); clic(q, "[data-cumulable='9203']")
    ok("RETIRER LE CIBLAGE PUIS REPOSER LE SIPHON ramène à l'équipement réel : aucune simulation ; énergie 10", sims(q) == {} and attr(q, "[data-energie]", "data-energie-utilisee") == "10", sims(q))
    clic(q, "[data-cumulable-retirer='9201']")
    ok("RETIRER UNE DES DEUX SOURCES : la répartition est minimale (une seule colonne simulée, la 5ᵉ) ; « Source de Super × 1 » ; énergie 7", socks(q, "c1") == ["4"] and eff(q, "c1", 4) == 9299 and attr(q, "[data-cumulable='9201']", "data-n") == "1" and attr(q, "[data-energie]", "data-energie-utilisee") == "7", sims(q))
    clic(q, "[data-reinitialiser]")
    ok("« REVENIR À L'ÉQUIPEMENT RÉEL » efface la simulation (et se grise ensuite)", sims(q) == {} and desactive(q, "[data-reinitialiser]"))

    # ---------- 4. le budget sur le niveau du mod de statistique ----------
    clic(q, "[data-intensite-chip='5']"); clic(q, "[data-cumulable-retirer='9203']"); clic(q, "[data-cumulable='9206']")
    ok("AVEC 1 D'ÉNERGIE RESTANTE (mod +5 : 1, Source × 2 : 6, Détecteur : 3 = 10 sur 11), le niveau +10 (+2) est GRISÉ « Pas assez d'énergie : il reste 1 », et le niveau +5 (le mod posé) reste actif", attr(q, "[data-energie]", "data-energie-utilisee") == "10" and desactive(q, "[data-intensite-chip='10']") and attr(q, "[data-intensite-chip='10']", "title") == "Pas assez d'énergie : il reste 1" and attr(q, "[data-intensite-chip='5']", "aria-pressed") == "true", [attr(q, "[data-energie]", "data-energie-utilisee"), attr(q, "[data-intensite-chip='10']", "title")])
    clic(q, "[data-reinitialiser]")

    # ---------- 5. l'ajustement (pièce légendaire) ----------
    ok("AJUSTEMENT (règle du jeu) : le « + » est celui de la PIÈCE (Super), marqué « ⇅ » ; trois issues : « Aucun », « Équilibré » (avec son effet « +1 Santé, +1 Mêlée, +1 Grenade », calculé par la règle) et cinq choix « − » (santé, mêlée, grenade, classe, arme), Santé actif", attr(q, "[data-bloc=ajustement]", "data-plus-piece") == "super" and texte(q, "[data-plus-etiquette]") == "⇅ « + » de cette pièce : +5 Super" and [c.get_attribute("data-moins-chip") for c in q.locator("[data-moins-chip]").all()] == ["sante", "melee", "grenade", "classe", "arme"] and attr(q, "[data-moins-chip=sante]", "aria-pressed") == "true" and texte(q, "[data-equilibre-chip]") == "Équilibré" and texte(q, "[data-aucun-chip]") == "Aucun" and "+1 Santé, +1 Mêlée, +1 Grenade" in texte(q, "[data-bloc=ajustement]") and q.locator("[data-plus-chip]").count() == 0)
    ok("⇅ DEVANT LE NOM DE LA STATISTIQUE (« affiche ⇅ devant le nom de la stat ») : dans la liste des statistiques, le ⇅ est le PREMIER élément et le nom « Super » le suit immédiatement", q.locator("[data-stat=super] > span").first.evaluate("e => e.firstElementChild && e.firstElementChild.hasAttribute('data-stat-plus') && e.firstElementChild.nextSibling && e.firstElementChild.nextSibling.textContent") == "Super")
    ok("SYMBOLE ⇅ COMME DANS LE JEU : un seul, à côté de la statistique « + » de la pièce (Super) dans la liste des statistiques", q.locator("[data-stat-plus]").count() == 1 and attr(q, "[data-stat-plus]", "data-stat-plus") == "super" and "⇅" in texte(q, "[data-stat=super]") and attr(q, "[data-stat-plus]", "style") is not None and q.locator("[data-stat-plus]").first.evaluate("e => getComputedStyle(e).color") == "rgb(127, 216, 143)")   # ⚠️ 26/10/2026 : « Garde le en vert »
    if q.locator("[data-bloc=ajustement]").count() != 1 or q.locator("[data-moins-chip=melee]").count() != 1:   # bloc absent : échec net au lieu d'un clic qui attendrait 30 s puis planterait
        print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(1)
    clic(q, "[data-moins-chip=melee]")
    ok("CHOISIR « − MÊLÉE » : Santé 0 → 5 (+5), Mêlée 5 → 0 (−5), Super inchangé, énergie inchangée (10) ; le résumé dit « +Super / -Mêlée · 0 » (c'est CE QUE L'ANCIEN CODE NE PERMETTAIT PAS : l'ajustement était « fixe »)", stat(q, "sante", "data-delta") == 5 and stat(q, "melee", "data-delta") == -5 and stat(q, "super", "data-delta") == 0 and attr(q, "[data-energie]", "data-energie-utilisee") == "10" and eff(q, "c1", 6) == 9302 and texte(q, "[data-resume-ajustement]").endswith("+Super / -Mêlée · 0"), sims(q))
    clic(q, "[data-moins-chip=melee]")
    ok("CLIQUER DE NOUVEAU LE CHOIX SIMULÉ revient au réel (aucune simulation)", sims(q) == {})
    clic(q, "[data-equilibre-chip]")
    ok("AJUSTEMENT ÉQUILIBRÉ : Santé +6 (le −5 disparaît, +1 s'ajoute), Mêlée +1, Grenade +1, Super −5 (le +5 disparaît) ; énergie inchangée", (stat(q, "sante", "data-delta"), stat(q, "melee", "data-delta"), stat(q, "grenade", "data-delta"), stat(q, "super", "data-delta")) == (6, 1, 1, -5) and attr(q, "[data-energie]", "data-energie-utilisee") == "10" and eff(q, "c1", 6) == 9306, [stat(q, k, "data-delta") for k in ("sante", "melee", "grenade", "super")])
    clic(q, "[data-aucun-chip]")
    ok("« AUCUN » : l'ajustement est laissé vide (plug « vide » lu dans le modèle du jeu) : Super −5 (le +5 disparaît), Santé +5 (le −5 disparaît), le reste inchangé ; énergie inchangée ; le résumé dit « aucun »", stat(q, "super", "data-delta") == -5 and stat(q, "sante", "data-delta") == 5 and stat(q, "melee", "data-delta") == 0 and stat(q, "grenade", "data-delta") == 0 and eff(q, "c1", 6) == 9399 and attr(q, "[data-energie]", "data-energie-utilisee") == "10" and texte(q, "[data-resume-ajustement]").endswith("aucun"), [stat(q, k, "data-delta") for k in ("super", "sante", "melee", "grenade")])
    ok("« REVENIR À L'ÉQUIPEMENT RÉEL » : disponible avec une simulation, l'efface", desactive(q, "[data-reinitialiser]") is False and (clic(q, "[data-reinitialiser]") or True) and sims(q) == {})
    q.close()

    # ---------- 6. pièce exotique : le « + » est libre ----------
    q = ouvrir("?exotique=1"); ouvrir_modifier(q)
    ok("PIÈCE EXOTIQUE (diagnostics de l'utilisateur : l'API marque les 31 ajustements insérables ; « le ⇅ n'existe pas sur les exotiques ») : le « + » est LIBRE : deux « + » proposés (Super, Arme), Super actif (celui de l'ajustement équipé) ; pas d'étiquette « de cette pièce » ; AUCUN symbole ⇅ ; la note le dit", attr(q, "[data-bloc=ajustement]", "data-plus-piece") == "" and q.locator("[data-plus-etiquette]").count() == 0 and [c.get_attribute("data-plus-chip") for c in q.locator("[data-plus-chip]").all()] == ["super", "arme"] and attr(q, "[data-plus-chip=super]", "aria-pressed") == "true" and q.locator("[data-stat-plus]").count() == 0 and attr(q, "[data-note-ajustement]", "data-note-ajustement") == "exotique" and "pas de « + » propre" in texte(q, "[data-note-ajustement]"))
    ok("EXOTIQUE : les « − » proposés pour le « + » Super sont Santé et Mêlée", [c.get_attribute("data-moins-chip") for c in q.locator("[data-moins-chip]").all()] == ["sante", "melee"])
    clic(q, "[data-plus-chip=arme]")
    ok("EXOTIQUE : choisir un autre « + » (Arme) change les « − » proposés (Santé, Super) ; choisir « − Santé » simule « +Armes / -Santé » (plug 9311, nom d'essai)", [c.get_attribute("data-moins-chip") for c in q.locator("[data-moins-chip]").all()] == ["sante", "super"] and (clic(q, "[data-moins-chip=sante]") or True) and eff(q, "e1", 3) == 9311 and texte(q, "[data-resume-ajustement]").endswith("+Armes / -Santé · 0"), sims(q))
    q.close()

    # ---------- 6 bis. le « + » de la pièce est illisible ----------
    q = ouvrir("?inconnu=1"); ouvrir_modifier(q)
    ok("« + » ILLISIBLE (LÉGENDAIRE à ajustement équipé « équilibré », l'API listant des « + » différents : cas hypothétique) : un avertissement le dit ; AUCUN choix « − » n'est proposé (jamais un « + » deviné) ; « Aucun » et « Équilibré » restent possibles ; aucun symbole ⇅", q.locator("[data-plus-inconnu]").count() == 1 and q.locator("[data-moins-chip]").count() == 0 and q.locator("[data-aucun-chip]").count() == 1 and q.locator("[data-equilibre-chip]").count() == 1 and q.locator("[data-stat-plus]").count() == 0 and attr(q, "[data-equilibre-chip]", "aria-pressed") == "true")
    clic(q, "[data-aucun-chip]")
    ok("« AUCUN » reste simulable quand le « + » est illisible : l'équilibré (+1 sur 3 statistiques) disparaît", eff(q, "e2", 3) == 9399, sims(q))
    q.close()

    # ---------- 7. énergie non lue ----------
    q = ouvrir("?sansenergie=1"); ouvrir_modifier(q)
    ok("ÉNERGIE NON LUE : aucune jauge, un avertissement (« rechargez votre inventaire : aucune limite ») ; la simulation reste utilisable", q.locator("[data-energie]").count() == 0 and q.locator("[data-energie-non-lue]").count() == 1 and "aucune limite" in texte(q, "[data-energie-non-lue]"))
    clic(q, "[data-cumulable-retirer='9203']")
    ok("SANS ÉNERGIE LUE, AUCUNE LIMITE D'ÉNERGIE : après avoir libéré un emplacement, TOUS les mods cumulables sont posables (même ceux à 3), seul le nombre d'emplacements limite", all(not c.is_disabled() for c in q.locator("[data-cumulable]").all()))
    q.close()

    # ---------- 8. un emplacement de raid ----------
    q = ouvrir("?raid=1"); ouvrir_modifier(q)
    ok("EMPLACEMENT DE RAID : listé dans un bloc « autres » (jamais perdu), deux mods avec leur coût ; l'énergie est 11 sur 11 : le mod B (coût 2, +1 par rapport au A posé) est GRISÉ « Pas assez d'énergie : il reste 0 »", q.locator("[data-bloc=autres]").count() == 1 and q.locator("[data-bloc=autres] [data-plug]").count() == 2 and desactive(q, "[data-plug='9802']") and attr(q, "[data-plug='9802']", "title") == "Pas assez d'énergie : il reste 0" and attr(q, "[data-plug='9801']", "aria-pressed") == "true" and attr(q, "[data-energie]", "data-energie-restante") == "0")
    clic(q, "[data-stat-chip=sante]")
    ok("À ÉNERGIE PLEINE, un changement SANS surcoût reste possible : « Santé » (3) à la place de « Classe » (3)", eff(q, "c2", 2) == 9111 and attr(q, "[data-energie]", "data-energie-restante") == "0", sims(q))
    q.close()

    # ---------- 9. le branchement dans la fenêtre Détails ----------
    si = lire("src/components/SelecteurInventaire.tsx")
    ok("BRANCHEMENT : la fenêtre Détails affiche `SimulationModsArmure` avec `appliquerChangements` ; l'ancienne liste de pastilles par groupe (`regrouperColonnesArmure`, `choisirModGroupe`) n'y est plus ; le bloc `data-mods-armure-simulation` n'existe plus que dans le nouveau composant", "<SimulationModsArmure" in si and "appliquerChangements(s, instance, colonnesMods, changements)" in si and "regrouperColonnesArmure" not in si and "choisirModGroupe" not in si and "data-mods-armure-simulation" not in si and "data-mods-armure-simulation" in lire("src/components/SimulationModsArmure.tsx"))
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

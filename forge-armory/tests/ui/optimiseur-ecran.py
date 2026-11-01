# FR : ⚠️ AJOUT (29/10/2026, branche draft-mod-armures), OPTIMISEUR, ÉCRAN B (maquette validée par l'utilisateur) : TEST D'INTERFACE de `OptimiseurArmures` : état initial, objectifs (boutons et saisie), calcul, onglets des trois solutions, COHÉRENCE des totaux avec les pièces affichées, ce qui change en bleu, « Simuler » / « Annuler » (le magasin des simulations), « Ajouter à Mon Build », règles de l'EXOTIQUE (une seule, marque comprise) et de la DOCTRINE PRISMATIQUE, pièces écartées avec leur raison, classes, énergie libre, mémorisation des réglages, intégration à la Forge des armures. Depuis la racine : python3 tests/ui/optimiseur-ecran.py   (le test construit lui-même les pages)
# EN: ⚠️ ADDED - UI test of the optimizer screen.
import glob, json, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
for page in (["optimiseur"], ["forge"], ["resumebuild"]):   # ⚠️ 29/10/2026 : « resumebuild » aussi (le bouton de Mon Build) : sinon le test lisait une page construite plus tôt
    if subprocess.run(["node", "tests/ui/build.mjs", *page], capture_output=True).returncode != 0: print("❌ construction impossible :", page); sys.exit(1)
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:700]) if (detail and not cond) else "")
PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082")
URL = "file://" + racine + "/tests/ui/_sortie/optimiseur.html"
CLE_SIM = "forge-armory.forge.simulations.v1"
STATS = ["sante", "melee", "grenade", "super", "classe", "arme"]
NOMS = {"sante": "Santé", "melee": "Mêlée", "grenade": "Grenade", "super": "Super", "classe": "Classe", "arme": "Arme"}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    erreurs = []
    def ouvrir(params="", ctx=None, conserver=False):
        ctx = ctx or b.new_context(viewport={"width": 1160, "height": 1700})
        ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
        q = ctx.new_page(); q.on("pageerror", lambda e: erreurs.append(str(e)))
        q.goto(URL + params); q.wait_for_function("window.__pret===true"); q.wait_for_timeout(250)
        return q
    texte = lambda q, sel: (q.locator(sel).first.inner_text().replace("\n", " ") if q.locator(sel).count() else "")
    def fixer(q, cibles):
        for k, v in cibles.items(): q.fill(f"[data-cible={k}]", str(v))
    def calculer(q):
        q.click("[data-calculer]"); q.wait_for_selector("[data-resultat]", timeout=30000); q.wait_for_timeout(250)
    CIBLES = {"arme": 200, "super": 140, "classe": 170}

    # ---------- 1. état initial ----------
    q = ouvrir()
    ok("ÉTAT INITIAL : le bouton de la classe Titan est choisi (une seule classe présente) ; « Doctrine prismatique » décochée ; exotique « Au choix de l'outil » ; énergie libre 0 ; les six objectifs sont « — »", q.locator("[data-classe=titan]").get_attribute("aria-pressed") == "true" and q.locator("[data-classe]").count() == 1 and not q.locator("[data-prismatique]").is_checked() and q.locator("[data-exotique=choix]").get_attribute("aria-pressed") == "true" and texte(q, "[data-energie-libre]") == "0" and all(q.input_value(f"[data-cible={k}]") == "" for k in STATS))
    ok("LES TOTAUX ACTUELS (les cinq pièces « A » portées) sont lus sur l'équipement : Santé 0, Mêlée 25, Grenade 25, Super 125, Classe 200, Arme 125", all(texte(q, f"[data-actuel={k}]") == f"actuel {v}" for k, v in zip(STATS, [0, 25, 25, 125, 200, 125])), [texte(q, f"[data-actuel={k}]") for k in STATS])
    ok("SANS OBJECTIF : « Calculer » est désactivé et une aide le dit ; aucun résultat n'est affiché", q.locator("[data-calculer]").is_disabled() and q.locator("[data-aide-cibles]").count() == 1 and q.locator("[data-resultat]").count() == 0)

    # ---------- 2. les objectifs ----------
    q.click("[data-plus=arme]")
    v1 = q.input_value("[data-cible=arme]")
    q.click("[data-plus=arme]"); v2 = q.input_value("[data-cible=arme]")
    q.click("[data-moins=arme]"); q.click("[data-moins=arme]"); q.click("[data-moins=arme]"); v3 = q.input_value("[data-cible=arme]")
    q.click("[data-moins=grenade]"); vg = q.input_value("[data-cible=grenade]")
    ok("BOUTONS DES OBJECTIFS : « + » sur « — » part de l'actuel arrondi aux 5 (Armes : 125), puis +5 par clic (130), « − » retire 5 (130 → 125 → 120 → 115) ; « − » sur une statistique non ciblée ne fait rien", v1 == "125" and v2 == "130" and v3 == "115" and vg == "", [v1, v2, v3, vg])
    fixer(q, {"arme": 200}); q.fill("[data-cible=super]", "140"); q.fill("[data-cible=classe]", "170")
    q.fill("[data-cible=melee]", "40"); q.fill("[data-cible=melee]", "")
    ok("SAISIE DIRECTE : on tape le total voulu ; un champ vidé (ou 0) retire l'objectif ; l'équipement actuel manque alors 90 points (Armes 75, Super 15, Classe 0) et l'écran l'écrit", q.input_value("[data-cible=arme]") == "200" and q.input_value("[data-cible=melee]") == "" and q.locator("[data-manque-actuel='90']").count() == 1 and q.locator("[data-calculer]").is_enabled(), texte(q, "[data-manque-actuel]"))

    # ---------- 3. le calcul ----------
    calculer(q)
    ok("CALCUL : le bilan dit la classe, la doctrine et le nombre de pièces étudiées (10) ; trois onglets « Solution 1 / 2 / 3 » ; la première est celle qui manque le moins", "Titan" in texte(q, "[data-bilan]") and "10 pièces étudiées" in texte(q, "[data-bilan]") and q.locator("[data-onglet]").count() == 3 and "Manque 60" in texte(q, "[data-onglet='0']") and q.locator("[data-onglet='0']").get_attribute("aria-selected") == "true", [texte(q, "[data-bilan]"), [texte(q, f"[data-onglet='{i}']") for i in range(3)]])
    ok("OBJECTIFS NON ATTEINTS : un message clair (« Aucune combinaison de vos armures n'atteint tous vos objectifs… manque 60 points ») ; Armes « 155 manque 45 », Super « 125 manque 15 », Classe « 170 atteinte », les statistiques non ciblées « non ciblée »", "n'atteint tous vos objectifs" in texte(q, "[data-objectifs-non-atteints]") and "manque 60 point" in texte(q, "[data-objectifs-non-atteints]") and "155 manque 45" in texte(q, "[data-etat=arme]") and "125 manque 15" in texte(q, "[data-etat=super]") and "170 atteinte" in texte(q, "[data-etat=classe]") and "non ciblée" in texte(q, "[data-etat=sante]"), [texte(q, f"[data-etat={k}]") for k in STATS])
    lignes = q.locator("[data-piece-ligne]")
    ok("LE TABLEAU : cinq lignes dans l'ordre Casque, Gants, Torse, Jambes, Objet de classe ; chaque ligne dit le nom, d'où vient la pièce (« portée »), l'archétype et la tertiaire, les six statistiques, le mod de statistique et l'ajustement avec le ⇅ vert sur une légendaire", [lignes.nth(i).get_attribute("data-piece-ligne") for i in range(lignes.count())] == ["casque", "gants", "torse", "jambes", "marque"] and all("portée" in lignes.nth(i).inner_text() for i in range(5)) and "Spécialiste · tertiaire Super" in lignes.nth(0).inner_text() and re.search(r"Santé \d+ · Mêlée \d+ · Grenade \d+ · Super \d+ · Classe \d+ · Arme \d+", lignes.nth(0).inner_text()) is not None and "⇅" in lignes.nth(0).inner_text(), lignes.nth(0).inner_text())
    modifies = [i for i in range(5) if lignes.nth(i).locator("[data-mod-avant]").count() > 0]
    ok("CE QUI CHANGE : trois pièces changent de mod (Torse, Jambes, Objet de classe : « Mod de classe » → « Mods d'arme ») : le nouveau mod est en BLEU et « avant : Mod de classe » est écrit ; les deux autres lignes n'ont rien en bleu ; l'onglet dit « 3 modifications »", modifies == [2, 3, 4] and all(lignes.nth(i).locator("[data-mod]").evaluate("e => getComputedStyle(e).color") == "rgb(122, 162, 247)" and "Mods d'arme" in texte(lignes.nth(i), "[data-mod]") and "avant : Mod de classe" in texte(lignes.nth(i), "[data-mod-avant]") for i in modifies) and lignes.nth(0).locator("[data-mod]").evaluate("e => getComputedStyle(e).color") != "rgb(122, 162, 247)" and "3 modifications" in texte(q, "[data-onglet='0']"), [texte(lignes.nth(i), "[data-mod]") for i in range(5)])
    # cohérence : les totaux affichés sont la somme des statistiques des cinq pièces affichées
    somme = {k: 0 for k in STATS}
    for i in range(lignes.count()):
        for k, v in re.findall(r"(Santé|Mêlée|Grenade|Super|Classe|Arme) (-?\d+)", texte(lignes.nth(i), "[data-stats-piece]")):
            somme[[c for c, n in NOMS.items() if n == k][0]] += int(v)
    affiches = {k: int(re.match(r"(-?\d+)", texte(q, f"[data-etat={k}]")).group(1)) for k in STATS}
    ok("COHÉRENCE : les totaux du panneau « Statistiques de l'ensemble » sont EXACTEMENT la somme des statistiques des cinq pièces du tableau (Santé, Mêlée, Grenade, Super, Classe, Arme)", somme == affiches, [somme, affiches])
    ok("AUCUNE SOLUTION N'EST DITE « SIMULÉE » AVANT D'AVOIR ÉTÉ SIMULÉE (défaut trouvé pendant la construction : les solutions sans changement de mod l'étaient « par construction »)", q.locator("[data-onglet-simulee]").count() == 0)

    # ---------- 4. les onglets ----------
    noms1 = [texte(lignes.nth(i), "[data-nom-piece]") for i in range(5)]
    q.click("[data-onglet='1']"); q.wait_for_timeout(200)
    noms2 = [texte(q.locator("[data-piece-ligne]").nth(i), "[data-nom-piece]") for i in range(5)]
    ok("ONGLETS : un clic sur « Solution 2 » la sélectionne et change le tableau (autres pièces) ; une solution SANS changement de mod le dit (« ne demande aucun changement de mod »)", q.locator("[data-onglet='1']").get_attribute("aria-selected") == "true" and noms1 != noms2 and q.locator("[data-aucune-modification]").count() == 1, [noms1, noms2])
    q.click("[data-onglet='0']"); q.wait_for_timeout(200)

    # ---------- 5. simuler / annuler ----------
    q.click("[data-simuler]"); q.wait_for_timeout(300)
    sim = json.loads(q.evaluate(f"localStorage.getItem('{CLE_SIM}')") or "{}")
    armures = sim.get("armures", {})
    ok("SIMULER CETTE SOLUTION : les simulations des TROIS pièces modifiées (torseA, jambesA, marqueA) sont écrites dans le magasin partagé avec les fenêtres Détails et la Forge, une par pièce ; les deux autres pièces n'en ont aucune ; le bouton devient « Solution simulée » (désactivé), l'onglet porte « simulée », le bouton « Annuler » apparaît", sorted(armures.keys()) == ["jambesA", "marqueA", "torseA"] and all(len(v) == 1 for v in armures.values()) and "Solution simulée" in texte(q, "[data-simuler]") and q.locator("[data-simuler]").is_disabled() and q.locator("[data-onglet-simulee='0']").count() == 1 and q.locator("[data-annuler]").count() == 1, armures)
    ok("L'ONGLET 2 (aucune modification) N'EST PAS « simulé » même après avoir simulé la solution 1", q.locator("[data-onglet-simulee='1']").count() == 0)
    q.click("[data-annuler]"); q.wait_for_timeout(300)
    sim2 = json.loads(q.evaluate(f"localStorage.getItem('{CLE_SIM}')") or "{}")
    ok("ANNULER : les simulations des pièces de la solution sont retirées (retour à l'équipement réel) ; le bouton redevient « Simuler cette solution » ; plus de badge « simulée » ; le bouton « Annuler » disparaît", len(sim2.get("armures", {})) == 0 and "Simuler cette solution" in texte(q, "[data-simuler]") and q.locator("[data-onglet-simulee]").count() == 0 and q.locator("[data-annuler]").count() == 0, sim2)

    # ---------- 6. Mon Build ----------
    q.click("[data-ajouter-build]"); q.wait_for_timeout(200)
    ajoutees = q.evaluate("window.__ajoutes.map(p => p.nom)")
    ok("AJOUTER À MON BUILD : les CINQ pièces de la solution sont remises à la page principale (les mêmes que dans le tableau) et l'écran le confirme (« 5 pièces ajoutées à Mon Build : le score en tient compte »)", ajoutees == noms1 and q.locator("[data-ajoutees='5']").count() == 1 and "le score en tient compte" in texte(q, "[data-ajoutees]"), [ajoutees, noms1])

    # ---------- 7. un changement d'objectif efface le résultat ; la mémorisation ----------
    q.click("[data-plus=arme]"); q.wait_for_timeout(150)
    ok("UN CHANGEMENT D'OBJECTIF EFFACE LE RÉSULTAT affiché (il ne correspondrait plus aux objectifs) ; il faut recalculer", q.locator("[data-resultat]").count() == 0)
    q.fill("[data-cible=arme]", "200"); q.wait_for_timeout(150)
    calculer(q); q.fill("[data-cible=super]", "141"); q.wait_for_timeout(150)
    ok("…ET LA SAISIE D'UN OBJECTIF AUSSI : taper un autre total efface le résultat affiché", q.locator("[data-resultat]").count() == 0)
    q.fill("[data-cible=super]", "140"); q.wait_for_timeout(150)
    ctx = q.context; q.close()
    q2 = ouvrir("", ctx)
    ok("MÉMORISATION : après un rechargement de la page, les objectifs (Armes 200, Super 140, Classe 170) sont revenus ; le résultat, lui, n'est pas conservé", q2.input_value("[data-cible=arme]") == "200" and q2.input_value("[data-cible=super]") == "140" and q2.input_value("[data-cible=classe]") == "170" and q2.locator("[data-resultat]").count() == 0)
    q2.close()

    # ---------- 8. exotique et doctrine prismatique ----------
    EXO = {"arme": 330}
    q = ouvrir("?exotiques"); fixer(q, EXO); calculer(q)
    exo_noms = lambda: [texte(q.locator("[data-piece-ligne]").nth(i), "[data-nom-piece]") for i in range(q.locator("[data-piece-ligne]").count())]
    q.click("[data-voir-ecartees]"); q.wait_for_timeout(150)
    ok("SANS DOCTRINE PRISMATIQUE : l'objet de classe exotique n'est dans AUCUNE solution (les trois onglets) et « Voir pourquoi » l'explique (« exige une doctrine prismatique équipée ») ; le torse exotique, lui, est permis", all((q.click(f"[data-onglet='{i}']"), q.wait_for_timeout(120), "Objet de classe exotique d'essai" not in exo_noms())[2] for i in range(q.locator("[data-onglet]").count())) and "Objet de classe exotique d'essai" in texte(q, "[data-ecartees]") and "doctrine prismatique" in texte(q, "[data-ecartees]"), texte(q, "[data-ecartees]"))
    q.click("[data-onglet='0']"); torse_ok = "Torse exotique d'essai" in exo_noms()
    ok("…et le torse exotique, très avantageux, est bien dans la meilleure solution", torse_ok, exo_noms())
    q.check("[data-prismatique]"); q.wait_for_timeout(150); ok("COCHER LA DOCTRINE PRISMATIQUE EFFACE LE RÉSULTAT (il faut recalculer avec la nouvelle règle)", q.locator("[data-resultat]").count() == 0)
    calculer(q)
    nb_exo = []
    for i in range(q.locator("[data-onglet]").count()):
        q.click(f"[data-onglet='{i}']"); q.wait_for_timeout(120)
        nb_exo.append(q.locator("[data-piece-ligne]").filter(has_text="exotique").count() - sum(1 for n in exo_noms() if "exotique d'essai" not in n and False))
    q.click("[data-onglet='0']")
    exos = [n for n in exo_noms() if "exotique d'essai" in n]
    ok("AVEC UNE DOCTRINE PRISMATIQUE : l'objet de classe exotique (le plus avantageux) est PRIS dans la meilleure solution ; mais JAMAIS avec le torse exotique : chaque solution a au plus UNE exotique (règle de l'utilisateur : « un objet de classe exotique compte comme une armure exotique ») ; le bilan dit « doctrine prismatique équipée »", exos == ["Objet de classe exotique d'essai"] and all(n <= 1 for n in nb_exo) and q.locator("[data-bilan]").inner_text().count("prismatique équipée") == 1, [exos, nb_exo])
    q.click("[data-exotique=aucune]"); calculer(q)
    ok("EXOTIQUE « AUCUNE » : aucune pièce exotique dans la meilleure solution (ni torse, ni objet de classe)", all("exotique d'essai" not in n for n in exo_noms()), exo_noms())
    q.context.close()
    qb = ouvrir("?exotiques&prismatiqueBuild")
    ok("LA DOCTRINE DU BUILD DE L'UTILISATEUR EST LA VALEUR DE DÉPART : build en prismatique : la case est cochée d'emblée (tant que l'utilisateur n'a rien choisi)", qb.is_checked("[data-prismatique]"))
    qb.context.close()

    # ---------- 9. pièces écartées ----------
    q = ouvrir("?ecartee"); fixer(q, CIBLES); calculer(q)
    ok("PIÈCES ÉCARTÉES : le bilan compte 1 pièce écartée ; « Voir pourquoi » liste « Casque aux statistiques incomplètes » avec la raison « statistiques incomplètes » (jamais écartée en silence)", "1 écartée" in texte(q, "[data-bilan]") and (q.click("[data-voir-ecartees]"), q.wait_for_timeout(150), "Casque aux statistiques incomplètes" in texte(q, "[data-ecartees]") and "statistiques incomplètes" in texte(q, "[data-ecartees]"))[2], texte(q, "[data-bilan]"))
    q.context.close()

    # ---------- 10. les classes ----------
    q = ouvrir("?chasseur"); fixer(q, CIBLES)
    ok("DEUX CLASSES : deux boutons (Titan, Chasseur) ; Titan est choisi (classe du build)", q.locator("[data-classe]").count() == 2 and q.locator("[data-classe=titan]").get_attribute("aria-pressed") == "true")
    calculer(q); q.click("[data-classe=chasseur]"); q.wait_for_timeout(150)
    ok("CHANGER DE CLASSE EFFACE LE RÉSULTAT ; l'équipement actuel Chasseur n'existe pas : « actuel — »", q.locator("[data-resultat]").count() == 0 and texte(q, "[data-actuel=arme]") == "actuel —")
    calculer(q)
    ok("UNE CLASSE QUI N'A QU'UN CASQUE : l'écran DIT que les emplacements Gants, Torse, Jambes, Objet de classe n'ont aucune armure et la solution ne contient que le casque", all(m in texte(q, "[data-slots-manquants]") for m in ["Gants", "Torse", "Jambes", "Objet de classe"]) and q.locator("[data-piece-ligne]").count() == 1, texte(q, "[data-slots-manquants]"))
    q.context.close()

    # ---------- 11. l'énergie libre ----------
    q = ouvrir(); fixer(q, CIBLES)
    for _ in range(4): q.click("[data-energie-plus]")
    calculer(q)
    ok("ÉNERGIE LIBRE 4 : seules les combinaisons qui laissent 4 d'énergie libre restent (mod de statistique vide) ; chaque ligne affiche « Emplacement de mod vide » et le pied du tableau dit « garde 4 d'énergie libre »", texte(q, "[data-energie-libre]") == "4" and all("Emplacement de mod vide" in texte(q.locator("[data-piece-ligne]").nth(i), "[data-mod]") for i in range(5)) and "garde 4 d'énergie libre" in texte(q, "[data-pieces-solution]"), [texte(q.locator("[data-piece-ligne]").nth(i), "[data-mod]") for i in range(5)])
    q.click("[data-energie-plus]"); calculer(q)
    ok("ÉNERGIE LIBRE 5 (impossible : aucune combinaison ne laisse autant) : le message « Aucune combinaison possible avec ces réglages » conseille de réduire l'énergie ; aucun onglet", q.locator("[data-aucune-solution]").count() == 1 and q.locator("[data-onglet]").count() == 0)
    q.context.close()

    # ---------- 13. la liste « à chasser » et le plan « à faire en jeu » ----------
    ctxp = b.new_context(viewport={"width": 1160, "height": 2400}); ctxp.grant_permissions(["clipboard-read", "clipboard-write"])
    q = ouvrir("", ctxp); fixer(q, CIBLES); calculer(q)
    ok("À CHASSER, SANS PROPOSITION : la meilleure solution manque 60 points mais aucune pièce hypothétique (une seule remplacée) ne ferait mieux : la carte « À chasser » le dit (« ne rapprocherait pas davantage de vos objectifs ») au lieu de rester vide", q.locator("[data-a-chasser]").count() == 1 and q.locator("[data-chasse]").count() == 0 and "ne rapprocherait pas davantage" in texte(q, "[data-chasser-vide]"))
    ok("PLAN : masqué par défaut (bouton « Voir le plan à suivre en jeu ») ; aucun texte de plan tant qu'on ne l'a pas demandé", q.locator("[data-plan-etape]").count() == 0 and "Voir le plan" in texte(q, "[data-voir-plan]") and q.locator("[data-voir-plan]").get_attribute("aria-expanded") == "false")
    q.click("[data-voir-plan]"); q.wait_for_timeout(150)
    etapes = q.locator("[data-plan-etape]")
    ok("PLAN DE LA SOLUTION 1 (cinq pièces déjà portées, trois changements de mod) : TROIS étapes « mod » seulement, dans l'ordre Torse, Jambes, Objet de classe, chacune « Mod de classe → Mods d'arme. » ; aucun transfert ni équipement", etapes.count() == 3 and all(etapes.nth(i).get_attribute("data-plan-etape") == "mod" for i in range(3)) and "Torse · Pièce torseA" in etapes.nth(0).inner_text() and "Mod de classe → Mods d'arme." in etapes.nth(0).inner_text() and "Objet de classe · Pièce marqueA" in etapes.nth(2).inner_text(), [etapes.nth(i).inner_text() for i in range(etapes.count())])
    etapes.nth(0).locator("input").check(); q.wait_for_timeout(100)
    barre = etapes.nth(0).locator("strong").evaluate("e => getComputedStyle(e).textDecorationLine")
    etapes.nth(0).locator("input").uncheck(); q.wait_for_timeout(100)
    ok("CASES À COCHER : cocher une étape la barre (texte barré), la décocher la rétablit ; les autres étapes ne sont pas touchées", barre == "line-through" and etapes.nth(0).locator("strong").evaluate("e => getComputedStyle(e).textDecorationLine") == "none" and not etapes.nth(1).locator("input").is_checked())
    q.click("[data-onglet='1']"); q.wait_for_timeout(200)
    ok("PLAN DE LA SOLUTION 2 (une pièce du Coffre à la place d'une pièce portée) : un TRANSFERT « Du Coffre vers votre Titan. » puis « Équiper la pièce » (l'objet de classe) avec « Les 4 autres pièces sont déjà portées. » : les transferts d'abord", q.locator("[data-plan-etape]").nth(0).get_attribute("data-plan-etape") == "transfert" and "Du Coffre vers votre Titan." in q.locator("[data-plan-etape]").nth(0).inner_text() and q.locator("[data-plan-etape]").nth(1).get_attribute("data-plan-etape") == "equipement" and "Les 4 autres pièces sont déjà portées." in q.locator("[data-plan-etape]").nth(1).inner_text(), [q.locator("[data-plan-etape]").nth(i).inner_text() for i in range(q.locator("[data-plan-etape]").count())])
    q.click("[data-copier-plan]"); q.wait_for_timeout(300)
    presse = q.evaluate("navigator.clipboard.readText()")
    ok("COPIER LA LISTE : le presse-papiers contient le plan numéroté (« 1. [Transfert] Pièce marqueB : Du Coffre vers votre Titan. » puis « 2. [Équipement] … ») et l'écran écrit « Liste copiée. »", presse.split("\n")[0] == "1. [Transfert] Pièce marqueB : Du Coffre vers votre Titan." and presse.split("\n")[1].startswith("2. [Équipement] Équiper la pièce : Objet de classe.") and q.locator("[data-copie=ok]").count() == 1, presse)
    q.click("[data-calculer]"); q.wait_for_selector("[data-resultat]"); q.wait_for_timeout(250)
    ok("UN NOUVEAU CALCUL REFERME LE PLAN (il ne correspondrait plus à la solution affichée) et efface les cases cochées", q.locator("[data-plan-etape]").count() == 0 and q.locator("[data-copie]").count() == 0)
    q.close()
    q = ouvrir("", ctxp); fixer(q, {"arme": 200, "super": 140, "classe": 120}); calculer(q)
    lig = q.locator("[data-chasse]")
    par_slot = {}
    for i in range(lig.count()):
        sl = lig.nth(i).inner_text().split("\n")[1] if False else re.search(r"(Casque|Gants|Torse|Jambes|Objet de classe)", lig.nth(i).inner_text()).group(1); par_slot[sl] = par_slot.get(sl, 0) + 1
    ok("À CHASSER, AVEC PROPOSITIONS (objectifs Armes 200, Super 140, Classe 120 : la meilleure solution manque 40) : six lignes, au plus deux par emplacement ; la première : Casque, archétype Maître (« primaire Arme 30 · secondaire Super 25 »), tertiaire Classe, « remplace : Pièce casqueA », « manque 35 », gain −5", lig.count() == 6 and all(n <= 2 for n in par_slot.values()) and all(m in lig.nth(0).inner_text() for m in ["Casque", "Maître", "primaire Arme 30 · secondaire Super 25", "tertiaire Classe", "remplace : Pièce casqueA", "manque 35", "−5"]), [lig.nth(i).inner_text().replace("\n", " | ") for i in range(lig.count())])
    ok("LES HYPOTHÈSES SONT ÉCRITES SUR L'ÉCRAN (pièce de palier 5 maîtrisée, mod +10, sans ajustement ; exotiques non proposées) : l'utilisateur sait ce que la liste suppose", all(m in texte(q, "[data-a-chasser]") for m in ["palier 5 maîtrisée", "mod +10", "sans ajustement", "exotiques ne sont pas proposées"]), texte(q, "[data-a-chasser]")[:400])
    q.close()
    q = ouvrir("?exotiques", ctxp); fixer(q, {"arme": 150, "super": 110, "classe": 120}); calculer(q)
    ok("OBJECTIFS ATTEINTS : la carte « À chasser » n'est PAS affichée (rien à chasser) ; le plan de la solution 1 : un transfert du torse exotique puis « Équiper la pièce » (Torse)", q.locator("[data-a-chasser]").count() == 0 and (q.click("[data-voir-plan]"), q.wait_for_timeout(150), "Torse exotique d'essai" in q.locator("[data-plan-etape]").nth(0).inner_text() and "Du Coffre vers votre Titan." in q.locator("[data-plan-etape]").nth(0).inner_text() and "Équiper la pièce" in q.locator("[data-plan-etape]").nth(1).inner_text())[2])
    q.close()
    q = ouvrir("", ctxp); fixer(q, {"arme": 100}); calculer(q); q.click("[data-voir-plan]"); q.wait_for_timeout(150)
    ok("RIEN À FAIRE : une solution faite de pièces déjà portées, sans changement de mod : le plan dit « Rien à faire » (au lieu de rester vide) et n'a pas de bouton « Copier la liste »", q.locator("[data-plan-vide]").count() == 1 and "Rien à faire" in texte(q, "[data-plan-vide]") and q.locator("[data-copier-plan]").count() == 0)
    ctxp.close()

    # ---------- 12. l'intégration à la Forge : le bouton « Optimiseur » de la barre ----------
    ctx = b.new_context(viewport={"width": 1280, "height": 1500}); ctx.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    f = ctx.new_page(); f.on("pageerror", lambda e: erreurs.append(str(e)))
    f.goto("file://" + racine + "/tests/ui/_sortie/forge.html?inventaire=1&armures=1"); f.wait_for_function("window.__pret===true"); f.wait_for_timeout(300)
    boutons = f.locator("[data-objet-logo]")
    ordre = [boutons.nth(i).get_attribute("data-objet-logo") for i in range(boutons.count())]
    xs = [boutons.nth(i).bounding_box()["x"] for i in range(boutons.count())]
    ok("FORGE, LA BARRE : trois boutons dans l'ordre Armes, Armures, OPTIMISEUR (le nouveau à DROITE des deux autres, sur la même ligne) ; ⚠️ 30/10/2026 : ce sont les BOUTONS STYLISÉS de la charte (images de repos et de sélection), le nom accessible du dernier contient « optimiseur »", ordre == ["armes", "armures", "optimiseur"] and xs[0] < xs[1] < xs[2] and abs(boutons.nth(0).bounding_box()["y"] - boutons.nth(2).bounding_box()["y"]) < 2 and "ptimiseur" in (boutons.nth(2).get_attribute("aria-label") or "") and "bouton-optimisation.svg" in (boutons.nth(2).locator("img").nth(0).get_attribute("src") or "") and "bouton-optimisation-selectionne.svg" in (boutons.nth(2).locator("img").nth(1).get_attribute("src") or ""), [ordre, xs, boutons.nth(2).locator("img").nth(0).get_attribute("src")])
    ids = ["collection", "inventaire", "armes", "armures", "optimisation"]
    cinq = [f.locator("[data-sous-menu=collection]"), f.locator("[data-sous-menu=inventaire]")] + [boutons.nth(i) for i in range(3)]
    boites = [c.bounding_box() for c in cinq]
    ok("COHÉRENCE DE LA BARRE (retour de l'utilisateur : « Armes et Armures, c'est pas cohérent ») : les CINQ boutons (Collection, Inventaire, Armes, Armures, Optimisation) sont le MÊME composant stylisé (`bouton-vue`), ont la MÊME hauteur (40 px, le minimum de la charte), le même cadre (largeur identique à 1 px), tiennent sur UNE ligne, et chacun porte ses DEUX images (repos et sélectionné) de la charte", all("bouton-vue" in (c.get_attribute("class") or "") for c in cinq) and len({round(x["height"]) for x in boites}) == 1 and round(boites[0]["height"]) == 40 and len({round(x["y"]) for x in boites}) == 1 and max(x["width"] for x in boites) - min(x["width"] for x in boites) <= 1 and all(cinq[i].locator("img").count() == 2 and f"selecteur/bouton-{ids[i]}.svg" in (cinq[i].locator("img").nth(0).get_attribute("src") or "") and f"selecteur/bouton-{ids[i]}-selectionne.svg" in (cinq[i].locator("img").nth(1).get_attribute("src") or "") for i in range(5)), boites)
    ok("FORGE : aucun petit onglet interne « Mes armures / Optimiseur » (retirés : la barre est le SEUL sélecteur) ; l'optimiseur n'est pas monté tant qu'on ne le demande pas", f.locator("[data-sous-vue-armures]").count() == 0 and f.locator("[data-optimiseur]").count() == 0)
    f.click("[data-objet-logo=optimiseur]"); f.wait_for_timeout(300)
    ok("FORGE : un clic sur « Optimiseur » le sélectionne (aria-selected) et, l'inventaire n'étant pas encore chargé, propose de le CHARGER (« Chargez d'abord votre inventaire ») ; les boutons Armes et Armures ne sont plus sélectionnés", f.locator("[data-objet-logo=optimiseur]").get_attribute("aria-selected") == "true" and f.locator("[data-objet-logo=armes]").get_attribute("aria-selected") == "false" and f.locator("[data-objet-logo=armures]").get_attribute("aria-selected") == "false" and f.locator("[data-optimiseur-charger]").is_visible() and "Chargez d'abord votre inventaire" in f.locator("[data-optimiseur-charger]").inner_text())
    f.locator("[data-optimiseur-charger] button").click(); f.wait_for_selector("[data-optimiseur]", timeout=20000); f.wait_for_timeout(250)
    ok("FORGE : après « Charger mon inventaire » dans l'optimiseur, l'écran s'affiche (réglages, six objectifs) ; la liste des armures est masquée", f.locator("[data-optimiseur]").is_visible() and f.locator("[data-objectif]").count() == 6 and not f.locator("[data-vue-armures]").is_visible() and f.locator("[data-optimiseur-charger]").count() == 0)
    f.click("[data-objet-logo=armures]"); f.wait_for_timeout(300)
    ok("FORGE : « Armures » ramène la LISTE des armures (chargée : plus besoin de recharger) et masque l'optimiseur SANS le démonter ; « Optimiseur » le réaffiche tel qu'il était", f.locator("[data-vue-armures]").is_visible() and f.locator("[data-armure-possedee]").count() > 0 and f.locator("[data-optimiseur]").count() == 1 and not f.locator("[data-optimiseur]").is_visible() and (f.click("[data-objet-logo=optimiseur]"), f.wait_for_timeout(250), f.locator("[data-optimiseur]").is_visible())[2])
    f.click("[data-objet-logo=armes]"); f.wait_for_timeout(250)
    ok("FORGE : « Armes » masque aussi l'optimiseur et la liste des armures (rien ne reste affiché par-dessus la liste des armes)", not f.locator("[data-optimiseur]").is_visible() and not f.locator("[data-vue-armures]").is_visible())
    f.get_by_role("tab", name="Collection").click(); f.wait_for_timeout(250)
    f.click("[data-objet-logo=optimiseur]"); f.wait_for_timeout(300)
    ok("FORGE : depuis la COLLECTION, un clic sur « Optimiseur » bascule sur l'inventaire et affiche l'optimiseur (il n'existe que sur l'inventaire)", f.locator("[data-optimiseur]").is_visible() and f.locator("[data-objet-logo=optimiseur]").get_attribute("aria-selected") == "true")
    ctx.close()

    # ---------- 13 bis. la demande venue de Mon Build : la Forge s'ouvre DIRECTEMENT sur l'optimiseur ----------
    ctxd = b.new_context(viewport={"width": 1280, "height": 1500}); ctxd.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    d = ctxd.new_page(); d.on("pageerror", lambda e: erreurs.append(str(e)))
    d.goto("file://" + racine + "/tests/ui/_sortie/forge.html?inventaire=1&armures=1&demandeOptimiseur"); d.wait_for_function("window.__pret===true"); d.wait_for_timeout(400)
    ok("DEMANDE VENUE DE MON BUILD : la Forge s'ouvre DIRECTEMENT sur l'optimiseur (bouton « Optimiseur » sélectionné, invitation à charger l'inventaire visible) sans qu'on clique rien ; la page principale est prévenue que la demande est traitée (UNE fois)", d.locator("[data-objet-logo=optimiseur]").get_attribute("aria-selected") == "true" and d.locator("[data-optimiseur-charger]").is_visible() and d.evaluate("window.__demandeTraitee") == 1)
    d.click("[data-objet-logo=armes]"); d.wait_for_timeout(250); d.click("[data-objet-logo=armures]"); d.wait_for_timeout(250)
    ok("…ET ELLE NE SE REJOUE PAS : après être allé sur Armes puis Armures, la Forge reste sur Armures (l'optimiseur ne se rouvre pas tout seul) ; la demande n'a été traitée qu'une fois", d.locator("[data-objet-logo=armures]").get_attribute("aria-selected") == "true" and d.locator("[data-objet-logo=optimiseur]").get_attribute("aria-selected") == "false" and d.evaluate("window.__demandeTraitee") == 1)
    ctxd.close()
    ctxn = b.new_context(viewport={"width": 1280, "height": 1500}); n = ctxn.new_page()
    n.goto("file://" + racine + "/tests/ui/_sortie/forge.html?inventaire=1&armures=1"); n.wait_for_function("window.__pret===true"); n.wait_for_timeout(300)
    ok("SANS DEMANDE : la Forge s'ouvre comme avant (aucun bouton sélectionné d'office sur l'optimiseur, demande jamais traitée)", n.locator("[data-objet-logo=optimiseur]").get_attribute("aria-selected") == "false" and n.evaluate("window.__demandeTraitee") is None)
    ctxn.close()

    # ---------- 14. le bouton « Optimiseur » de Mon Build ----------
    ctxm = b.new_context(viewport={"width": 1100, "height": 2000}); ctxm.route("**/www.bungie.net/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
    m = ctxm.new_page(); m.on("pageerror", lambda e: erreurs.append(str(e)))
    m.goto("file://" + racine + "/tests/ui/_sortie/resumebuild.html?casquechatoyant"); m.wait_for_function("window.__pret===true"); m.wait_for_timeout(400)
    cadre, bouton_opt = m.locator("[data-bloc-stats-build]"), m.locator("[data-ouvrir-optimiseur]")
    bc, bb = cadre.bounding_box(), bouton_opt.bounding_box()
    ok("MON BUILD : le bouton « Optimiseur » existe UNE fois, JUSTE SOUS le cadre « Statistiques du build » (sous le bord bas du cadre, à moins de 20 px) et ALIGNÉ avec lui : même bord gauche, même largeur (à 1 px près)", bouton_opt.count() == 1 and cadre.count() == 1 and 0 <= bb["y"] - (bc["y"] + bc["height"]) < 20 and abs(bb["x"] - bc["x"]) <= 1 and abs(bb["width"] - bc["width"]) <= 1, [bc, bb])
    ok("MON BUILD : le bouton porte l'icône « optimisation » et le mot « Optimiseur » ; un clic appelle la demande d'ouverture de l'optimiseur (une fois par clic)", "Optimiseur" in bouton_opt.inner_text() and "optimisation" in (bouton_opt.locator("img").get_attribute("src") or "") and (bouton_opt.click(), m.wait_for_timeout(150), m.evaluate("window.__optimiseur"))[2] == 1 and (bouton_opt.click(), m.wait_for_timeout(100), m.evaluate("window.__optimiseur"))[2] == 2)
    ctxm.close()

    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    b.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

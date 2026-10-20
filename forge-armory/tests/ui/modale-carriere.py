# FR : ⚠️ AJOUT (21/10/2026), demandes de l'utilisateur sur la pop-up « Carrière » : (1) « le bouton Accomplissements doit être affiché à droite du titre Carrière et non en bas de pop-up » ; (2) « le diagnostic statIds retournés ne s'ouvre pas » ; (3) « la partie Compte peut disparaître » ; (4) « utilise les assets d'icônes de classes de personnages ». TEST D'INTERFACE de la VRAIE fenêtre, dans un vrai navigateur, avec un réseau simulé : bouton dans l'en-tête, à droite du titre et avant la croix ; plus de bouton en bas ; plus de partie « Compte » ; les icônes de classes (celles du reste de l'appli) devant chaque classe ; le diagnostic (mode développement) s'ouvre ET se ferme, et AFFICHE toujours quelque chose, y compris quand la requête de statistiques échoue (avant : rien, et l'erreur était avalée) ; absent hors mode développement. Depuis la racine : node tests/ui/build.mjs modale-carriere && python3 tests/ui/modale-carriere.py   (le test construit lui-même la version « dev »)
# EN: ⚠️ ADDED - UI test of the Career pop-up: button right of the title, no Account section, class icons, a diagnostic that opens, closes and always shows something.
import glob, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
SORTIE = "file://" + racine + "/tests/ui/_sortie/"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
lire = lambda f: open(f"{racine}/{f}", encoding="utf-8").read()
subprocess.run(["node", "tests/ui/build.mjs", "modale-carriere", "dev"], capture_output=True, text=True, cwd=racine)

# ---------- 0. code source ----------
modale, carriere, dash, gen = lire("src/components/ModaleCarriere.tsx"), lire("src/lib/bungie/carriere.ts"), lire("src/pages/DashboardPage.tsx"), lire("src/components/Modale.tsx")
sans_com = lambda t: re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", t, flags=re.S))   # on ne lit que le CODE, pas les commentaires (qui racontent l'historique)
code_modale = sans_com(modale)
bloc_appel = dash[dash.index("<ModaleCarriere"): dash.index("/>", dash.index("<ModaleCarriere"))]
ok("CODE : la fenêtre n'a plus de section « Compte » (ni pseudo, ni plateformes liées, ni première connexion) et ses propriétés `memberships` et `nomBungie` disparaissent, de la fenêtre comme de l'appel dans la page principale", 'titre="Compte"' not in code_modale and "Pseudo Bungie" not in code_modale and "Plateformes liées" not in code_modale and "première connexion" not in code_modale and "memberships" not in code_modale and "nomBungie" not in code_modale and "memberships={" not in bloc_appel and "nomBungie=" not in bloc_appel and "membership={memberships[0]}" in bloc_appel, bloc_appel)
ok("CODE : les autres fenêtres ne changent pas : sans `apresTitre`, l'en-tête de `Modale` garde exactement son ancien contenu (un simple titre)", "{apresTitre ? (" in gen and re.search(r"\) : \(\s*<strong style=\{\{ fontSize: \"0\.95rem\" \}\}>\{titre\}</strong>\s*\)\}", gen) is not None and 'alignItems: apresTitre ? "center" : "flex-start"' in gen)

def ouvrir(pg, page, params=""):
    pg.goto(SORTIE + page + ".html" + params); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(900)
GEO = """() => { const R = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const dlg = document.querySelector('[role=dialog]'); const entete = dlg.querySelector('[data-entete-titre]');
  const titre = entete ? entete.querySelector('strong') : null; const btns = [...dlg.querySelectorAll('button[aria-label="Accomplissements"]')];
  const fermer = dlg.querySelector('button[title^="Fermer"]'); const sections = [...dlg.querySelectorAll('section')];
  return { entete: entete ? R(entete) : null, titre: titre ? { ...R(titre), texte: titre.textContent } : null, nbBoutons: btns.length, bouton: btns[0] ? R(btns[0]) : null, imgs: btns[0] ? [...btns[0].querySelectorAll('img')].map((i) => ({ ok: i.complete && i.naturalWidth > 0, src: i.src.split('/').pop() })) : [],
           fermer: fermer ? R(fermer) : null, premiereSection: sections[0] ? R(sections[0]) : null, derniereSection: sections.length ? R(sections[sections.length - 1]) : null, dlg: R(dlg),
           titresSections: sections.map((s) => s.querySelector('strong').textContent), texte: dlg.innerText }; }"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1000, "height": 900}); erreurs = []; pg.on("pageerror", lambda e: erreurs.append(str(e)))
    ouvrir(pg, "modale-carriere"); g = pg.evaluate(GEO)
    # ---------- 1. bouton à droite du titre ----------
    t, bt, f = g["titre"], g["bouton"], g["fermer"]
    ok("BOUTON À DROITE DU TITRE : « Accomplissements » est dans l'en-tête, JUSTE À DROITE du titre « Carrière » (à plus de 8 px et moins de 40 px de lui), sur la même ligne (centres verticaux à 4 px), et avant la croix de fermeture", t is not None and t["texte"] == "Carrière" and g["nbBoutons"] == 1 and bt["l"] >= t["r"] + 8 and bt["l"] <= t["r"] + 40 and abs((bt["t"] + bt["b"]) / 2 - (t["t"] + t["b"]) / 2) <= 4 and bt["r"] <= f["l"], [t, bt, f])
    ok("PLUS EN BAS : il n'y a qu'UN bouton « Accomplissements », situé AU-DESSUS du contenu (de toutes les sections) : plus rien après la dernière section", g["nbBoutons"] == 1 and bt["b"] <= g["premiereSection"]["t"] and g["derniereSection"]["b"] <= g["dlg"]["b"] and not re.search(r"Accomplissements\s*$", g["texte"].strip()), [bt, g["premiereSection"]])
    ok("TAILLE DU BOUTON : 32 px de haut (2 rem, comme avant), cadre 4897 × 1024 (l'image remplit son cadre, plus réduite de 12 %), les deux images chargées", bt is not None and abs(bt["h"] - 32) <= 1 and abs(bt["w"] / bt["h"] - 4897 / 1024) < 0.02 and all(i["ok"] for i in g["imgs"]) and [i["src"] for i in g["imgs"]] == ["bouton-accomplissements.svg", "bouton-accomplissements-selectionne.svg"], [bt, g["imgs"]])
    # ---------- 2. partie Compte ----------
    ok("PARTIE « COMPTE » SUPPRIMÉE : ni titre « Compte », ni « Pseudo Bungie », ni « Plateformes liées », ni « Date de la première connexion » ; les quatre autres sections restent, dans l'ordre", "Compte" not in g["titresSections"] and not re.search(r"Pseudo Bungie|Plateformes liées|première connexion", g["texte"]) and g["titresSections"] == ["Temps de jeu", "Personnages", "10 dernières activités", "Statistiques de carrière"], g["titresSections"])
    # ---------- 3. icônes de classes ----------
    ic = pg.evaluate("""() => [...document.querySelectorAll('[role=dialog] section')].map((s) => ({ section: s.querySelector('strong').textContent,
        lignes: [...s.querySelectorAll('div > div')].filter((d) => d.querySelector('[role=img]')).map((d) => { const i = d.querySelector('[role=img]'); const b = i.getBoundingClientRect(); const lib = d.children[0].textContent.trim(); return { icone: i.getAttribute('aria-label'), libelle: lib, w: b.width, h: b.height, trace: (i.querySelector('path') || {}).getAttribute ? i.querySelector('path').getAttribute('d').slice(0, 24) : null, fond: getComputedStyle(i).backgroundColor }; }) }))""")
    tj, pj = ic[0]["lignes"], ic[1]["lignes"]
    ok("ICÔNES DE CLASSES : chaque ligne de classe de « Temps de jeu » (Titan, Chasseur, Arcaniste) et de « Personnages » porte l'icône de SA classe (celle du reste de l'appli : mêmes noms, tracés et couleurs), de 20 px au moins", [l["icone"] for l in tj] == ["Titan", "Chasseur", "Arcaniste"] and [l["icone"] for l in pj] == ["Titan", "Chasseur", "Arcaniste"] and all(l["icone"] == l["libelle"] and l["w"] >= 20 for l in tj + pj) and len({l["trace"] for l in tj}) == 3 and len({l["fond"] for l in tj}) == 3 and [l["trace"] for l in tj] == [l["trace"] for l in pj], ic)
    cs = lire("src/components/icones/IconeClasse.tsx")
    chemins = {k: re.search(rf'{k}:\s*"([^"]{{24}})', cs).group(1) for k in ("titan", "chasseur", "arcaniste")}
    ok("LES ICÔNES SONT LES VRAIS ASSETS de `IconeClasse` (même tracé : les 24 premiers caractères du tracé de chaque classe)", [l["trace"] for l in tj] == [chemins["titan"], chemins["chasseur"], chemins["arcaniste"]], [[l["trace"] for l in tj], chemins])
    # ---------- 4. clic ----------
    bouton_acc = pg.get_by_role("button", name="Accomplissements")
    if bouton_acc.count() == 1: bouton_acc.click(); pg.wait_for_timeout(150)   # bouton absent : le contrôle ÉCHOUE au lieu d'attendre 30 s puis de planter
    ok("CLIC : le bouton ouvre les Accomplissements (un clic, un appel) ; la fenêtre ne se ferme pas d'elle-même", bouton_acc.count() == 1 and pg.evaluate("window.__clics") == ["accomplissements"], pg.evaluate("window.__clics"))
    ok("HORS MODE DÉVELOPPEMENT : le diagnostic n'existe pas (le bouton « Diagnostic » est absent de l'appli installée)", pg.get_by_role("button", name=re.compile("Diagnostic")).count() == 0)
    # ---------- 5. diagnostic : statistiques réussies ----------
    ouvrir(pg, "modale-carriere-dev"); bouton = pg.get_by_role("button", name=re.compile("Diagnostic"))
    ok("DIAGNOSTIC (mode développement) : le bouton existe, fermé au départ (aria-expanded = false) et le panneau est absent", bouton.count() == 1 and bouton.get_attribute("aria-expanded") == "false" and pg.locator("[data-diagnostic-statids]").count() == 0)
    bouton.click(); pg.wait_for_timeout(150); panneau = pg.locator("[data-diagnostic-statids]"); txt = panneau.inner_text() if panneau.count() else ""
    ok("LE DIAGNOSTIC S'OUVRE : un clic ouvre le panneau (aria-expanded = true) avec le nombre de statIds, la liste (kills, deaths, precisionKills, assists, secondsPlayed), la requête, « erreur de la requête : aucune » et les clés de la réponse", panneau.count() == 1 and bouton.get_attribute("aria-expanded") == "true" and "statIds retournés : 5" in txt and all(k in txt for k in ("kills", "deaths", "precisionKills", "assists", "secondsPlayed")) and "requête : GET /Destiny2/Stats/GetHistoricalStats/" in txt and "erreur de la requête : aucune" in txt and "clés de la réponse : metrics" in txt, txt)
    bouton.click(); pg.wait_for_timeout(150)
    ok("LE DIAGNOSTIC SE REFERME : un second clic le ferme (panneau absent, aria-expanded = false)", pg.locator("[data-diagnostic-statids]").count() == 0 and bouton.get_attribute("aria-expanded") == "false")
    # ---------- 6. diagnostic : requête de statistiques en échec (le cas où « il ne s'ouvrait pas ») ----------
    ouvrir(pg, "modale-carriere-dev", "?stats-en-echec=1"); bouton = pg.get_by_role("button", name=re.compile("Diagnostic")); bouton.click(); pg.wait_for_timeout(150)
    panneau = pg.locator("[data-diagnostic-statids]"); txt = panneau.inner_text() if panneau.count() else ""
    ok("QUAND LA REQUÊTE ÉCHOUE, LE DIAGNOSTIC S'OUVRE QUAND MÊME et dit POURQUOI : « statIds retournés : AUCUN », la requête, l'erreur (404), « pas de réponse : la requête a échoué » (avant : un texte vide, donc RIEN à l'écran, et l'erreur était avalée)", panneau.count() == 1 and bouton.get_attribute("aria-expanded") == "true" and "statIds retournés : AUCUN" in txt and "requête : GET /Destiny2/Stats/GetHistoricalStats/" in txt and re.search(r"erreur de la requête : Appel Bungie API échoué .*404", txt) is not None and "pas de réponse" in txt, txt)
    ok("MÊME EN ÉCHEC, le reste de la fenêtre s'affiche : « non disponible » pour les statistiques, mais le temps de jeu par classe, les personnages et l'historique restent là", "Titan" in pg.inner_text("[role=dialog]") and "puissance 1990" in pg.inner_text("[role=dialog]") and "25 min" in pg.inner_text("[role=dialog]"))
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    nav.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

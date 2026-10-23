# FR : ⚠️ AJOUT (21/10/2026), demandes de l'utilisateur sur la pop-up « Carrière » : (1) « le bouton Accomplissements doit être affiché à droite du titre Carrière et non en bas de pop-up » ; (2) « le diagnostic statIds retournés ne s'ouvre pas » ; (3) « la partie Compte peut disparaître » ; (4) « utilise les assets d'icônes de classes de personnages ». ⚠️ CHANGÉ (22/10/2026, TODO §25) : la pop-up est remplacée par la PAGE « Carrière » (onglet du sélecteur de vues). Le test vérifie : PLUS DE MODALE (aucun `[role=dialog]`) ; la page Carrière s'affiche AVEC le bloc Connexion et le sélecteur de vues au-dessus (le bug §25 est résolu par construction) ; le bouton « Accomplissements » de la page n'existe plus (la navigation se fait par l'ONGLET du même nom) ; plus de partie « Compte » ; les icônes de classes (celles du reste de l'appli) devant chaque classe ; le diagnostic (mode développement) s'ouvre ET se ferme, et AFFICHE toujours quelque chose, y compris quand la requête de statistiques échoue (avant : rien, et l'erreur était avalée) ; absent hors mode développement. Depuis la racine : node tests/ui/build.mjs vue-carriere && python3 tests/ui/vue-carriere.py   (le test construit lui-même la version « dev »)
# EN: ⚠️ ADDED - UI test of the Career PAGE (was: pop-up): no modal, the Connection block and the view selector stay visible, no Account section, class icons, a diagnostic that opens, closes and always shows something.
import glob, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
SORTIE = "file://" + racine + "/tests/ui/_sortie/"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
lire = lambda f: open(f"{racine}/{f}", encoding="utf-8").read()
subprocess.run(["node", "tests/ui/build.mjs", "vue-carriere", "dev"], capture_output=True, text=True, cwd=racine)

# ---------- 0. code source ----------
page, vue, dash, gen, sel = lire("src/components/VueCarriere.tsx"), lire("src/components/VueAccomplissements.tsx"), lire("src/pages/DashboardPage.tsx"), lire("src/components/Modale.tsx"), lire("src/components/SelecteurVues.tsx")
sans_com = lambda t: re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", t, flags=re.S))   # on ne lit que le CODE, pas les commentaires (qui racontent l'historique)
code_vue = sans_com(vue)
ok("CODE : la page n'a plus de section « Compte » (ni pseudo, ni plateformes liées, ni première connexion), n'a PLUS de prop `onOuvrirAccomplissements` (la navigation se fait par l'onglet), et ne rend PLUS de modale",
   'titre="Compte"' not in code_vue and "Pseudo Bungie" not in code_vue and "Plateformes liées" not in code_vue and "première connexion" not in code_vue and "onOuvrirAccomplissements" not in code_vue and "<Modale" not in code_vue and "role=\"dialog\"" not in code_vue, code_vue[:200])
ok("CODE : la modale Carrière est supprimée ; `DashboardPage` monte les deux pages du compte comme des VUES du sélecteur, et le tiroir « Solo sans mourir » est redevenu autonome (état interne)",
   not os.path.exists(os.path.join(racine, "src/components/ModaleCarriere.tsx")) and "ModaleCarriere" not in sans_com(dash) and 'vue === "carriere" && <VueCarriere' in dash and 'vue === "accomplissements" && <VueAccomplissements' in dash and "<PanneauTriomphes profil={profilTriomphes} db={db} />" in dash and "ouvertExterieur" not in dash and "onOuvrirCarriere" not in dash)
ok("CODE : le sélecteur de vues compte SIX onglets, « Carrière » et « Accomplissements » en dernier, tous deux en cadre 4897 x 1024 (`large: true`)",
   '"carriere", libelle: "Carrière", fichier: "carriere-large", large: true' in sel and '"accomplissements", libelle: "Accomplissements", fichier: "accomplissements", large: true' in sel)
ok("CODE : les autres fenêtres ne changent pas : l'en-tête de `Modale` est redevenu un simple titre + croix (la prop `apresTitre` du 21/10 est retirée)",
   "apresTitre" not in sans_com(gen) and 'alignItems: "flex-start"' in gen)

def ouvrir(pg, page, params=""):
    pg.goto(SORTIE + page + ".html" + params); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(900)
GEO = """() => { const R = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const region = document.querySelector('[role=region][aria-label="Carrière"]');
  const sections = [...document.querySelectorAll('[role=region] section')];
  return { region: region ? R(region) : null, nbDialogues: document.querySelectorAll('[role=dialog]').length,
           blocConnexion: R(document.querySelector('.pilier-carte--connexion')), selecteur: R(document.querySelector('.selecteur-vues')),
           ongletActif: document.querySelector('.selecteur-vues [aria-selected=true]')?.dataset.vue,
           sections: sections.length, titresSections: sections.map((s) => s.querySelector('strong').textContent), texte: region ? region.innerText : "" }; }"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1000, "height": 900}); erreurs = []; pg.on("pageerror", lambda e: erreurs.append(str(e)))
    ouvrir(pg, "vue-carriere"); g = pg.evaluate(GEO)
    # ---------- 1. page, pas modale ----------
    ok("PAGE, PAS MODALE : aucun dialogue modal ; la page « Carrière » (région) est affichée AVEC le bloc Connexion et le sélecteur de vues au-dessus (dans le flux de la page, pas en surimpression)", g["nbDialogues"] == 0 and g["region"] is not None and g["blocConnexion"]["b"] <= g["selecteur"]["t"] + 1 and g["selecteur"]["b"] <= g["region"]["t"] + 1 and g["ongletActif"] == "carriere", g)
    ok("LE BOUTON « ACCOMPLISSEMENTS » DE LA PAGE N'EXISTE PLUS : la page n'a aucun bouton « Accomplissements » (la navigation se fait par l'ONGLET du même nom dans le sélecteur)", pg.get_by_role("region", name="Carrière").get_by_role("button", name="Accomplissements").count() == 0 and pg.locator("[data-vue=accomplissements]").count() == 1, pg.get_by_role("region", name="Carrière").inner_text()[:200])
    # ---------- 2. partie Compte ----------
    ok("PARTIE « COMPTE » SUPPRIMÉE : ni titre « Compte », ni « Pseudo Bungie », ni « Plateformes liées », ni « Date de la première connexion » ; les quatre autres sections restent, dans l'ordre", "Compte" not in g["titresSections"] and not re.search(r"Pseudo Bungie|Plateformes liées|première connexion", g["texte"]) and g["titresSections"] == ["Temps de jeu", "Personnages", "10 dernières activités", "Statistiques de carrière"], g["titresSections"])
    # ---------- 3. icônes de classes ----------
    ic = pg.evaluate("""() => [...document.querySelectorAll('[role=region][aria-label="Carrière"] section')].map((s) => ({ section: s.querySelector('strong').textContent,
        lignes: [...s.querySelectorAll('div > div')].filter((d) => d.querySelector('[role=img]')).map((d) => { const i = d.querySelector('[role=img]'); const b = i.getBoundingClientRect(); const lib = d.children[0].textContent.trim(); return { icone: i.getAttribute('aria-label'), libelle: lib, w: b.width, h: b.height, trace: (i.querySelector('path') || {}).getAttribute ? i.querySelector('path').getAttribute('d').slice(0, 24) : null, fond: getComputedStyle(i).backgroundColor }; }) }))""")
    tj, pj = ic[0]["lignes"], ic[1]["lignes"]
    ok("ICÔNES DE CLASSES : chaque ligne de classe de « Temps de jeu » (Titan, Chasseur, Arcaniste) et de « Personnages » porte l'icône de SA classe (celle du reste de l'appli : mêmes noms, tracés et couleurs), de 20 px au moins", [l["icone"] for l in tj] == ["Titan", "Chasseur", "Arcaniste"] and [l["icone"] for l in pj] == ["Titan", "Chasseur", "Arcaniste"] and all(l["icone"] == l["libelle"] and l["w"] >= 20 for l in tj + pj) and len({l["trace"] for l in tj}) == 3 and len({l["fond"] for l in tj}) == 3 and [l["trace"] for l in tj] == [l["trace"] for l in pj], ic)
    cs = lire("src/components/icones/IconeClasse.tsx")
    chemins = {k: re.search(rf'{k}:\s*"([^"]{{24}})', cs).group(1) for k in ("titan", "chasseur", "arcaniste")}
    ok("LES ICÔNES SONT LES VRAIS ASSETS de `IconeClasse` (même tracé : les 24 premiers caractères du tracé de chaque classe)", [l["trace"] for l in tj] == [chemins["titan"], chemins["chasseur"], chemins["arcaniste"]], [[l["trace"] for l in tj], chemins])
    # ---------- 4. navigation par onglet ----------
    pg.locator("[data-vue=accomplissements]").click(); pg.wait_for_timeout(300)
    ok("ONGLET « ACCOMPLISSEMENTS » : la page Carrière est remplacée par la page Accomplissements (vitrine « Solo sans mourir » en pleine page), le bloc Connexion et le sélecteur restent affichés, aucun tiroir latéral", pg.get_by_role("region", name="Carrière").count() == 0 and pg.get_by_role("region", name="Accomplissements").count() == 1 and "Solo sans mourir" in pg.get_by_role("region", name="Accomplissements").inner_text() and pg.locator(".pilier-carte--connexion").count() == 1 and pg.locator("[style*='position: fixed'][style*='left: 0']").count() == 0, pg.get_by_role("region", name="Accomplissements").inner_text()[:200])
    pg.locator("[data-vue=carriere]").click(); pg.wait_for_timeout(300)
    ok("RETOUR À L'ONGLET CARRIÈRE : la page Carrière est de nouveau affichée (les données sont rechargées à chaque ouverture)", pg.get_by_role("region", name="Carrière").count() == 1 and pg.get_by_role("region", name="Accomplissements").count() == 0)
    ok("HORS MODE DÉVELOPPEMENT : le diagnostic n'existe pas (le bouton « Diagnostic » est absent de l'appli installée)", pg.get_by_role("button", name=re.compile("Diagnostic")).count() == 0)
    # ---------- 5. diagnostic : statistiques réussies ----------
    ouvrir(pg, "vue-carriere-dev"); bouton = pg.get_by_role("button", name=re.compile("Diagnostic"))
    ok("DIAGNOSTIC (mode développement) : le bouton existe, fermé au départ (aria-expanded = false) et le panneau est absent", bouton.count() == 1 and bouton.get_attribute("aria-expanded") == "false" and pg.locator("[data-diagnostic-statids]").count() == 0)
    bouton.click(); pg.wait_for_timeout(150); panneau = pg.locator("[data-diagnostic-statids]"); txt = panneau.inner_text() if panneau.count() else ""
    ok("LE DIAGNOSTIC S'OUVRE : un clic ouvre le panneau (aria-expanded = true) avec le nombre de statIds, la liste (kills, deaths, precisionKills, assists, secondsPlayed), la requête, « erreur de la requête : aucune » et les clés de la réponse", panneau.count() == 1 and bouton.get_attribute("aria-expanded") == "true" and "statIds retournés : 5" in txt and all(k in txt for k in ("kills", "deaths", "precisionKills", "assists", "secondsPlayed")) and "requête : GET /Destiny2/" in txt and "erreur de la requête : aucune" in txt and "clés de la réponse : mergedAllCharacters" in txt, txt)
    bouton.click(); pg.wait_for_timeout(150)
    ok("LE DIAGNOSTIC SE REFERME : un second clic le ferme (panneau absent, aria-expanded = false)", pg.locator("[data-diagnostic-statids]").count() == 0 and bouton.get_attribute("aria-expanded") == "false")
    # ---------- 6. diagnostic : requête de statistiques en échec (le cas où « il ne s'ouvrait pas ») ----------
    ouvrir(pg, "vue-carriere-dev", "?stats-en-echec=1"); bouton = pg.get_by_role("button", name=re.compile("Diagnostic")); bouton.click(); pg.wait_for_timeout(150)
    panneau = pg.locator("[data-diagnostic-statids]"); txt = panneau.inner_text() if panneau.count() else ""
    ok("QUAND LA REQUÊTE ÉCHOUE, LE DIAGNOSTIC S'OUVRE QUAND MÊME et dit POURQUOI : « statIds retournés : AUCUN », la requête, l'erreur (404), « pas de réponse : la requête a échoué » (avant : un texte vide, donc RIEN à l'écran, et l'erreur était avalée)", panneau.count() == 1 and bouton.get_attribute("aria-expanded") == "true" and "statIds retournés : AUCUN" in txt and "requête : GET /Destiny2/" in txt and re.search(r"erreur de la requête : Appel Bungie API échoué .*404", txt) is not None and "pas de réponse" in txt, txt)
    ok("MÊME EN ÉCHEC, le reste de la page s'affiche : « non disponible » pour les statistiques, mais le temps de jeu par classe, les personnages et l'historique restent là", "Titan" in pg.get_by_role("region", name="Carrière").inner_text() and "puissance 1990" in pg.get_by_role("region", name="Carrière").inner_text() and "25 min" in pg.get_by_role("region", name="Carrière").inner_text())
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    nav.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

# FR : ⚠️ AJOUT (21/10/2026), demandes de l'utilisateur sur la pop-up « Carrière » : (1) « le bouton Accomplissements doit être affiché à droite du titre Carrière et non en bas de pop-up » ; (2) « le diagnostic statIds retournés ne s'ouvre pas » ; (3) « la partie Compte peut disparaître » ; (4) « utilise les assets d'icônes de classes de personnages ». ⚠️ CHANGÉ (22/10/2026, TODO §25 + retour utilisateur « les boutons apparaissent en double ») : la pop-up est remplacée par la PAGE « Carrière », ouverte par le bouton « Carrière » DU BLOC CONNEXION (qui reste affiché) ; la page n'est PAS un onglet du sélecteur de vues (qui garde ses 4 onglets, sans doublon). Le test vérifie : PLUS DE MODALE (aucun `[role=dialog]`) ; la page s'ouvre DEPUIS le bouton du bloc Connexion, qui reste affiché avec le sélecteur au-dessus ; plus de partie « Compte » ; les icônes de classes (celles du reste de l'appli) devant chaque classe ; le diagnostic (mode développement) s'ouvre ET se ferme, et AFFICHE toujours quelque chose, y compris quand la requête de statistiques échoue (avant : rien, et l'erreur était avalée) ; absent hors mode développement. Depuis la racine : node tests/ui/build.mjs vue-carriere && python3 tests/ui/vue-carriere.py   (le test construit lui-même la version « dev »). ⚠️ CHANGÉ (22/10/2026, « Enlève la partie affichant les niveaux de persos ainsi que les 10 dernières activités ») : les sections « Personnages » et « 10 dernières activités » sont SUPPRIMÉES ; ⚠️ CHANGÉ (22/10/2026, « Finalement enlève l'affichage de la saison dans ce menu ») : la section « Saison » (« Saison en cours ») est SUPPRIMÉE à son tour — il ne reste que DEUX sections (« Temps de jeu », « Statistiques de carrière ») ; le test vérifie aussi qu'AUCUNE requête d'historique d'activités n'est faite (`window.__requetes`).
# EN: ⚠️ ADDED - UI test of the Career PAGE, opened from the Connection block's button (no modal, no selector tab); class icons; diagnostic that opens, closes and always shows something.
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
ok("CODE : la page n'a plus de section « Compte » (ni pseudo, ni plateformes liées, ni première connexion), n'a PLUS de prop `onOuvrirAccomplissements` (la navigation se fait par le bouton du bloc Connexion), et ne rend PLUS de modale",
   'titre="Compte"' not in code_vue and "Pseudo Bungie" not in code_vue and "Plateformes liées" not in code_vue and "première connexion" not in code_vue and "onOuvrirAccomplissements" not in code_vue and "<Modale" not in code_vue and 'role="dialog"' not in code_vue, code_vue[:200])
ok("CODE : « Toutes les stats » (22/10/2026) — la page n'a PLUS de sélection figée (`STATS_AFFICHEES` supprimé) : elle affiche TOUTES les stats de la réponse (`donnees.stats.map`), avec un libellé FR pour les statIds connus (table complétée le 22/10 depuis la réponse réelle du compte : 74 statIds) et le statId BRUT pour les autres ; les durées (secondes) sont formatées en « h min »",
   "STATS_AFFICHEES" not in code_vue and "donnees.stats.map" in code_vue and "LIBELLES_STATS_CONNUS" in code_vue and "STATS_EN_SECONDES" in code_vue and "formaterDuree" in code_vue)
ok("CODE : la modale Carrière est supprimée ; `DashboardPage` monte les deux pages du compte comme des VUES, et le tiroir « Solo sans mourir » est redevenu autonome (état interne)",
   not os.path.exists(os.path.join(racine, "src/components/ModaleCarriere.tsx")) and "ModaleCarriere" not in sans_com(dash) and 'vue === "carriere" && <VueCarriere' in dash and 'vue === "accomplissements" && <VueAccomplissements profil={profilTriomphes} db={db} />' in dash and "<PanneauTriomphes profil={profilTriomphes} db={db} />" in dash and "ouvertExterieur" not in dash and "onOuvrirCarriere" not in dash)
code_accomp = sans_com(vue)
ok("CODE : la page Accomplissements n'affiche PLUS la vitrine « Solo sans mourir » (retirée, retour utilisateur) et affiche désormais les TRIOMPHES DU COMPTE PAR SCEAU (23/10, TODO n°23 : `regrouperParSceau`, compteur global, recherche avancée) — la vitrine reste UNIQUEMENT dans le tiroir `PanneauTriomphes` du Build Analyzer",
   "VitrineSoloFlawless" not in code_accomp and "Bientôt" not in code_accomp and "regrouperParSceau" in code_accomp and "VitrineSoloFlawless" in lire("src/components/PanneauTriomphes.tsx"), code_accomp[:200])
ok("CODE : PAS DE DOUBLON — le sélecteur de vues garde QUATRE onglets (Build Analyzer, Load-outs, Forge, Legendarium) : « Carrière » et « Accomplissements » n'y figurent PAS (ce sont des pages du compte, ouvertes par les boutons du bloc Connexion)",
   'valeur: "carriere"' not in sel and 'valeur: "accomplissements"' not in sel and len(re.findall(r'\{ valeur: "', sel)) == 4)
ok("CODE : les autres fenêtres ne changent pas : l'en-tête de `Modale` est redevenu un simple titre + croix (la prop `apresTitre` du 21/10 est retirée)",
   "apresTitre" not in sans_com(gen) and 'alignItems: "flex-start"' in gen)
ok("CODE : ⚠️ 22/10 (retour utilisateur : « des stats non-disponibles » alors que le temps de jeu est dans les stats) — le Total du temps de jeu retombe sur la stat `secondsPlayed` (GetHistoricalStatsForAccount) si le profil n'a pas le composant 200",
   'x.statId === "secondsPlayed"' in code_vue, code_vue[:200])
ok("CODE : ⚠️ 22/10 (« Finalement enlève l'affichage de la saison dans ce menu ») — la section « Saison » est SUPPRIMÉE : plus de titre « Saison », plus de « Saison en cours », plus d'import `SAISONS`, plus de `libelleSaisonEnCours` dans le code",
   'titre="Saison"' not in code_vue and "Saison en cours" not in code_vue and "SAISONS" not in code_vue and "libelleSaisonEnCours" not in code_vue and "saisonEnCours" not in code_vue, code_vue[:200])
ok("CODE : ⚠️ 22/10 (« Enlève la partie affichant les niveaux de persos ainsi que les 10 dernières activités », puis « Finalement enlève l'affichage de la saison dans ce menu ») — les sections « Personnages », « 10 dernières activités » et « Saison » sont SUPPRIMÉES (plus de titre, plus de rendu `puissance`, plus de liste d'activités), la prop `personnages` est retirée, et `chargerCarriere` n'est plus appelée avec `personnages` ; il ne reste que DEUX sections : « Temps de jeu » et « Statistiques de carrière »",
   'titre="Personnages"' not in code_vue and 'titre="10 dernières activités"' not in code_vue and 'titre="Saison"' not in code_vue and "puissance " not in code_vue and "donnees.activites" not in code_vue and "personnages" not in code_vue and 'chargerCarriere(membership, profil)' in code_vue and 'titre="Temps de jeu"' in code_vue and 'titre="Statistiques de carrière"' in code_vue and "recupererActivitesPersonnage" not in lire("src/lib/bungie/carriere.ts"), code_vue[:200])

def ouvrir(pg, page, params=""):
    pg.goto(SORTIE + page + ".html" + params); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(900)
GEO = """() => { const R = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const region = document.querySelector('[role=region][aria-label="Carrière"]') ?? document.querySelector('[role=region][aria-label="Accomplissements"]');
  const sections = [...document.querySelectorAll('[role=region] section')];
  return { region: region ? { ...R(region), label: region.getAttribute('aria-label') } : null, nbDialogues: document.querySelectorAll('[role=dialog]').length,
           blocConnexion: R(document.querySelector('.pilier-carte--connexion')), selecteur: R(document.querySelector('.selecteur-vues')),
           onglets: [...document.querySelectorAll('.selecteur-vues .bouton-vue')].map((e) => e.dataset.vue),
           boutonsBloc: [...document.querySelectorAll('.connexion-vues-compte button')].map((e) => e.getAttribute('aria-label')),
           sections: sections.length, titresSections: sections.map((s) => s.querySelector('strong').textContent), texte: region ? region.innerText : "" }; }"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1000, "height": 900}); erreurs = []; pg.on("pageerror", lambda e: erreurs.append(str(e)))
    ouvrir(pg, "vue-carriere"); g = pg.evaluate(GEO)
    # ---------- 1. page ouverte depuis le bloc Connexion, pas de modale, pas d'onglet en double ----------
    ok("LE BLOC CONNEXION RESTE AFFICHÉ avec ses DEUX boutons « Carrière » et « Accomplissements » (un seul exemplaire de chacun dans toute la page) ; le sélecteur de vues reste affiché au-dessus de la page",
      g["blocConnexion"] is not None and g["boutonsBloc"] == ["Carrière", "Accomplissements"] and pg.get_by_role("button", name="Carrière").count() == 1 and pg.get_by_role("button", name="Accomplissements").count() == 1 and g["selecteur"] is not None, g["boutonsBloc"])
    ok("PAS DE DOUBLON : le sélecteur de vues garde ses QUATRE onglets (analyseur, loadouts, forge, bibliotheque) : « Carrière » et « Accomplissements » n'y figurent PAS",
      g["onglets"] == ["analyseur", "loadouts", "forge", "bibliotheque"], g["onglets"])
    pg.get_by_role("button", name="Carrière").click(); pg.wait_for_timeout(300); g = pg.evaluate(GEO)
    ok("CLIC SUR « CARRIÈRE » (bloc Connexion) : la PAGE Carrière s'affiche (région « Carrière », dans le flux de la page) — AUCUNE modale, le bloc Connexion et le sélecteur restent affichés ; la page n'est PAS un onglet du sélecteur",
      g["nbDialogues"] == 0 and g["region"] is not None and g["region"]["label"] == "Carrière" and g["blocConnexion"]["b"] <= g["selecteur"]["t"] + 1 and g["selecteur"]["b"] <= g["region"]["t"] + 1 and g["onglets"] == ["analyseur", "loadouts", "forge", "bibliotheque"] and pg.evaluate("window.__clics") == ["carriere"], g)
    # ---------- 2. partie Compte ----------
    ok("PARTIE « COMPTE » SUPPRIMÉE (21/10) ET SECTIONS « PERSONNAGES » / « 10 DERNIÈRES ACTIVITÉS » / « SAISON » SUPPRIMÉES (22/10 : « Enlève la partie affichant les niveaux de persos ainsi que les 10 dernières activités », puis « Finalement enlève l'affichage de la saison dans ce menu ») : ni titre « Compte », ni « Pseudo Bungie », ni « Plateformes liées », ni « puissance », ni date d'activité, ni « Saison » ; il reste DEUX sections, dans l'ordre : Temps de jeu, Statistiques de carrière", "Compte" not in g["titresSections"] and "Personnages" not in g["titresSections"] and "Saison" not in g["titresSections"] and "saison" not in g["texte"].lower() and "activit" not in g["texte"].lower() and "puissance" not in g["texte"].lower() and not re.search(r"Pseudo Bungie|Plateformes liées|première connexion", g["texte"]) and g["titresSections"] == ["Temps de jeu", "Statistiques de carrière"], (g["titresSections"], g["texte"][:200]))
    # ---------- 3. icônes de classes ----------
    ic = pg.evaluate("""() => [...document.querySelectorAll('[role=region][aria-label="Carrière"] section')].map((s) => ({ section: s.querySelector('strong').textContent,
        lignes: [...s.querySelectorAll('div > div')].filter((d) => d.querySelector('[role=img]')).map((d) => { const i = d.querySelector('[role=img]'); const b = i.getBoundingClientRect(); const lib = d.children[0].textContent.trim(); return { icone: i.getAttribute('aria-label'), libelle: lib, w: b.width, h: b.height, trace: (i.querySelector('path') || {}).getAttribute ? i.querySelector('path').getAttribute('d').slice(0, 24) : null, fond: getComputedStyle(i).backgroundColor }; }) }))""")
    tj = ic[0]["lignes"]
    ok("ICÔNES DE CLASSES : chaque ligne de classe de « Temps de jeu » (Titan, Chasseur, Arcaniste) porte l'icône de SA classe (celle du reste de l'appli : mêmes noms, tracés et couleurs), de 20 px au moins (⚠️ 22/10 : la section « Personnages », qui en portait aussi, est supprimée)", [l["icone"] for l in tj] == ["Titan", "Chasseur", "Arcaniste"] and all(l["icone"] == l["libelle"] and l["w"] >= 20 for l in tj) and len({l["trace"] for l in tj}) == 3 and len({l["fond"] for l in tj}) == 3, ic)
    cs = lire("src/components/icones/IconeClasse.tsx")
    chemins = {k: re.search(rf'{k}:\s*"([^"]{{24}})', cs).group(1) for k in ("titan", "chasseur", "arcaniste")}
    ok("LES ICÔNES SONT LES VRAIS ASSETS de `IconeClasse` (même tracé : les 24 premiers caractères du tracé de chaque classe)", [l["trace"] for l in tj] == [chemins["titan"], chemins["chasseur"], chemins["arcaniste"]], [[l["trace"] for l in tj], chemins])
    # ---------- 3b. « Toutes les stats » : les 8 stats de la réponse, libellés FR connus, statId brut pour l'inconnue, durée formatée ----------
    # FR : ⚠️ CHANGÉ (22/10/2026, « Toutes les stats ») - le navigateur rend toLocaleString("fr-FR") avec une espace fine insécable (U+202F) comme séparateur de milliers ; on la normalise en espace ordinaire avant comparaison.
    lignes_stats = pg.evaluate("""() => [...document.querySelectorAll('[role=region][aria-label="Carrière"] section')].map((s) => s.querySelector('strong').textContent === 'Statistiques de carrière' ? [...s.querySelectorAll('div > div')].map((d) => ({ libelle: d.children[0].textContent.trim(), valeur: d.children[1].textContent.trim().replace(/\\u202f/g, " ") })) : null).filter(Boolean)[0]""")
    attendu = [("Éliminations", "123 456"), ("Morts", "23 456"), ("Éliminations de précision", "54 321"), ("Assistances", "9 876"), ("Temps de jeu", "2 500 h 00"), ("K/D", "5,26"), ("statInconnueDeTest", "42"), ("Durée d'activité", "1 h 30"), ("Revolver", "155 285"), ("Efficacité totale", "22,54"), ("Score", "61 576 643"), ("Distance totale d'éliminations (m)", "17 606 565"), ("Durée totale des activités", "4 031 h 08"), ("Durée de vie moyenne", "4 min"), ("Vie la plus longue", "1 h 31"), ("Temps cumulé des participants", "41 260 h 06")]
    ok("TOUTES LES STATS : la section affiche les 16 stats de la réponse (ni plus ni moins), dans l'ordre ; les statIds connus ont leur libellé FR (y compris les 8 statIds RÉELS du compte : « Revolver », « Efficacité totale », « Score », « Distance totale d'éliminations (m) », « Durée totale des activités », « Durée de vie moyenne », « Vie la plus longue », « Temps cumulé des participants » — AUCUN statId anglais brut sauf l'inconnue) ; l'inconnue affiche son statId brut ; « secondsPlayed » est en « 2 500 h 00 », « averageLifespan » en « 4 min » et non en secondes", len(lignes_stats) == 16 and [l["libelle"] for l in lignes_stats] == [a[0] for a in attendu] and [l["valeur"] for l in lignes_stats] == [a[1] for a in attendu], lignes_stats)
    ok("TOUTES LES STATS : le compte « 16 statistiques » est affiché au-dessus de la grille", "16 statistiques" in pg.get_by_role("region", name="Carrière").inner_text())
    # ---------- 3c. ⚠️ 22/10 (retour utilisateur : « non disponible » pour le temps de jeu) ----------
    # FR : la fixture passe le VRAI profil (composant 200 : minutesPlayedTotal 6000/4500/3000 min, forme
    # `data.Response` comme dans `DashboardPage` via `profilComplet`) : Total = 13 500 min = « 225 h 00 ».
    lire_lignes = """(titre) => [...document.querySelectorAll('[role=region][aria-label="Carrière"] section')].map((s) => s.querySelector('strong').textContent === titre ? [...s.querySelectorAll('div > div')].map((d) => ({ libelle: d.children[0].textContent.trim(), valeur: d.children[1].textContent.trim() })) : null).filter(Boolean)[0]"""
    lignes_tj = pg.evaluate(lire_lignes, "Temps de jeu")
    ok("TEMPS DE JEU : le Total est la SOMME des classes du profil (13 500 min = « 225 h 00 ») et une ligne PAR CLASSE s'affiche (Titan « 100 h 00 », Chasseur « 75 h 00 », Arcaniste « 50 h 00 ») — PLUS de « non disponible »",
       lignes_tj == [{"libelle": "Total", "valeur": "225 h 00"}, {"libelle": "Titan", "valeur": "100 h 00"}, {"libelle": "Chasseur", "valeur": "75 h 00"}, {"libelle": "Arcaniste", "valeur": "50 h 00"}], lignes_tj)
    reqs = pg.evaluate("window.__requetes")
    ok("UNE SEULE REQUÊTE RÉSEAU À L'OUVERTURE : les statistiques agrégées (`/Account/.../Stats/`) ; AUCUNE requête d'historique d'activités (`/Stats/Activities/`) — les 10 requêtes par personnage de l'ancienne section sont supprimées",
       len(reqs) == 1 and "/Account/" in reqs[0] and reqs[0].endswith("/Stats/") and not any("/Stats/Activities/" in u for u in reqs), reqs)
    # ---------- 3d. repli : sans profil (composant 200 absent), le Total retombe sur la stat `secondsPlayed` ----------
    ouvrir(pg, "vue-carriere", "?sans-profil=1"); pg.get_by_role("button", name="Carrière").click(); pg.wait_for_timeout(300)
    lignes_tj2 = pg.evaluate(lire_lignes, "Temps de jeu")
    ok("REPLI SANS PROFIL (`?sans-profil=1`) : « Par classe » repasse à « non disponible » (le composant 200 manque), mais le Total RESTE affiché grâce à la stat `secondsPlayed` de GetHistoricalStatsForAccount (9 000 000 s = « 2500 h 00 ») — jamais une estimation",
       lignes_tj2 == [{"libelle": "Total", "valeur": "2500 h 00"}, {"libelle": "Par classe", "valeur": "non disponible"}], lignes_tj2)
    ouvrir(pg, "vue-carriere"); pg.get_by_role("button", name="Carrière").click(); pg.wait_for_timeout(300)
    # ---------- 4. navigation par le bloc Connexion ----------
    pg.get_by_role("button", name="Accomplissements").click(); pg.wait_for_timeout(300); g = pg.evaluate(GEO)
    ok("CLIC SUR « ACCOMPLISSEMENTS » (bloc Connexion) : la page Carrière est remplacée par la page Accomplissements (page dédiée aux Triomphes : PAS de vitrine « Solo sans mourir » ; sans Manifest dans cette page de test, un avertissement « non disponible » s'affiche), le bloc Connexion et le sélecteur restent affichés, aucun tiroir latéral",
      g["region"] is not None and g["region"]["label"] == "Accomplissements" and "Solo sans mourir" not in g["texte"] and "non disponible" in g["texte"] and g["blocConnexion"] is not None and g["selecteur"] is not None and pg.locator("[style*='position: fixed'][style*='left: 0']").count() == 0, g["texte"][:200])
    pg.get_by_role("button", name="Carrière").click(); pg.wait_for_timeout(300); g = pg.evaluate(GEO)
    ok("RETOUR PAR LE BOUTON « CARRIÈRE » : la page Carrière est de nouveau affichée (les données sont rechargées à chaque ouverture)", g["region"] is not None and g["region"]["label"] == "Carrière" and pg.evaluate("window.__clics") == ["carriere", "accomplissements", "carriere"], pg.evaluate("window.__clics"))
    ok("HORS MODE DÉVELOPPEMENT : le diagnostic n'existe pas (le bouton « Diagnostic » est absent de l'appli installée)", pg.get_by_role("button", name=re.compile("Diagnostic")).count() == 0)
    # ---------- 5. diagnostic : statistiques réussies ----------
    ouvrir(pg, "vue-carriere-dev"); pg.get_by_role("button", name="Carrière").click(); pg.wait_for_timeout(200); bouton = pg.get_by_role("button", name=re.compile("Diagnostic"))
    ok("DIAGNOSTIC (mode développement) : le bouton existe, fermé au départ (aria-expanded = false) et le panneau est absent", bouton.count() == 1 and bouton.get_attribute("aria-expanded") == "false" and pg.locator("[data-diagnostic-statids]").count() == 0)
    bouton.click(); pg.wait_for_timeout(150); panneau = pg.locator("[data-diagnostic-statids]"); txt = panneau.inner_text() if panneau.count() else ""
    ok("LE DIAGNOSTIC S'OUVRE : un clic ouvre le panneau (aria-expanded = true) avec le nombre de statIds, la liste complète des 16 statIds, la requête, « erreur de la requête : aucune », les clés de la réponse, la structure RÉELLE de « mergedAllCharacters » (merged.allTime : 16 stats) et la source lue", panneau.count() == 1 and bouton.get_attribute("aria-expanded") == "true" and "statIds retournés : 16" in txt and all(k in txt for k in ("kills", "deaths", "precisionKills", "assists", "secondsPlayed", "killsDeathsRatio", "statInconnueDeTest", "activityDurationSeconds", "weaponKillsHandCannon", "efficiency", "score", "totalKillDistance", "totalActivityDurationSeconds", "averageLifespan", "longestSingleLife", "allParticipantsTimePlayed")) and "requête : GET /Destiny2/" in txt and "erreur de la requête : aucune" in txt and "clés de la réponse : mergedDeletedCharacters, mergedAllCharacters, characters" in txt and "structure de « mergedAllCharacters » : merged (allTime : 16 stats)" in txt and "source des stats affichées : merged.allTime (agrégat « Carrière » du jeu)" in txt, txt)
    bouton.click(); pg.wait_for_timeout(150)
    ok("LE DIAGNOSTIC SE REFERME : un second clic le ferme (panneau absent, aria-expanded = false)", pg.locator("[data-diagnostic-statids]").count() == 0 and bouton.get_attribute("aria-expanded") == "false")
    # ---------- 6. diagnostic : requête de statistiques en échec (le cas où « il ne s'ouvrait pas ») ----------
    ouvrir(pg, "vue-carriere-dev", "?stats-en-echec=1"); pg.get_by_role("button", name="Carrière").click(); pg.wait_for_timeout(200)
    bouton = pg.get_by_role("button", name=re.compile("Diagnostic")); bouton.click(); pg.wait_for_timeout(150)
    panneau = pg.locator("[data-diagnostic-statids]"); txt = panneau.inner_text() if panneau.count() else ""
    ok("QUAND LA REQUÊTE ÉCHOUE, LE DIAGNOSTIC S'OUVRE QUAND MÊME et dit POURQUOI : « statIds retournés : AUCUN », la requête, l'erreur (404), « pas de réponse : la requête a échoué » (avant : un texte vide, donc RIEN à l'écran, et l'erreur était avalée)", panneau.count() == 1 and bouton.get_attribute("aria-expanded") == "true" and "statIds retournés : AUCUN" in txt and "requête : GET /Destiny2/" in txt and re.search(r"erreur de la requête : Appel Bungie API échoué .*404", txt) is not None and "pas de réponse" in txt, txt)
    texte_echec = pg.get_by_role("region", name="Carrière").inner_text()
    ok("MÊME EN ÉCHEC, le reste de la page s'affiche : « non disponible » pour les statistiques, mais le temps de jeu (Total et par classe) reste là", "non disponible" in texte_echec and "Titan" in texte_echec and "225 h 00" in texte_echec, texte_echec[:300])
    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    nav.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

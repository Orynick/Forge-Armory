# FR : ⚠️ AJOUT (23/10/2026, TODO n°23, branche draft-update-triomphes) - TEST D'INTERFACE de la page « Accomplissements » (Triomphes du compte PAR SCEAU), dans un vrai navigateur, avec le VRAI composant `VueAccomplissements`, une FAUSSE BASE Manifest (mêmes hash que `tests/logique/sceaux.test.ts`) et un profil simulé (composant 900). Le test vérifie : (1) le bloc Connexion et le sélecteur de vues (4 onglets) restent affichés, la page s'ouvre DEPUIS le bouton « Accomplissements » ; (2) le COMPTEUR GLOBAL (« 2 / 4 triomphes obtenus · score total : 1 000 ») ; (3) les sceaux en CARTES DANS UNE GRILLE, REPLIÉS PAR DÉFAUT : barre de progression SOUS la carte, pourcentage EN-DESSOUS, clic pour déplier les triomphes DANS la carte (triomphes ✅/⬜, progression 3/10, titre du sceau) ; (4) la RECHERCHE AVANCÉE (guillemets, +, -, case « Aa ») ; (5) le TRI (progression/nom) ; (6) PAS de vitrine « Solo sans mourir » ; (7) les replis (`?sans-profil=1`, `?sans-db=1`). ⚠️ CHANGÉ (24/10/2026 soir, retour utilisateur : « carrés identiques en taille, attention aux alignements ») : nouveaux contrôles — CARRÉS IDENTIQUES (zone cliquable `aspect-ratio: 1 / 1`, largeurs égales, hauteurs égales, zone carrée). Depuis la racine : node tests/ui/build.mjs vue-accomplissements && python3 tests/ui/vue-accomplissements.py
# EN: UI test of the Accomplishments page (account Triumphs BY SEAL): global counter, seals as CARDS in a grid (progress bar below the card, percentage under the bar, collapsed by default), advanced search (quotes, +, -, "Aa" case), sorting, no "Solo Flawless" showcase, fallbacks.
import glob, os, re, subprocess, sys
from playwright.sync_api import sync_playwright
racine = os.getcwd()
chrome = os.environ.get("CHROME_PATH") or next(iter(sorted(glob.glob(os.path.expanduser("~/.cache/puppeteer/chrome/*/chrome-linux64/chrome")))), None)
SORTIE = "file://" + racine + "/tests/ui/_sortie/"
res = []
def ok(nom, cond, detail=""):
    res.append(bool(cond)); print(("✅" if cond else "❌"), nom, ("— " + str(detail)[:420]) if (detail and not cond) else "")
lire = lambda f: open(f"{racine}/{f}", encoding="utf-8").read()
subprocess.run(["node", "tests/ui/build.mjs", "vue-accomplissements"], capture_output=True, text=True, cwd=racine)

# ---------- 0. code source ----------
page, dash, sel, modele = lire("src/components/VueAccomplissements.tsx"), lire("src/pages/DashboardPage.tsx"), lire("src/components/SelecteurVues.tsx"), lire("src/lib/bungie/sceaux.ts")
sans_com = lambda t: re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", t, flags=re.S))
code_page = sans_com(page)
ok("CODE : la page monte `VueAccomplissements` AVEC le profil des triomphes et le Manifest (`profil={profilTriomphes} db={db}`), et PAS un placeholder « Bientôt »",
   'vue === "accomplissements" && <VueAccomplissements profil={profilTriomphes} db={db} />' in dash and "Bientôt" not in code_page and "regrouperParSceau" in code_page, code_page[:200])
ok("CODE : la page groupe PAR SCEAU (modèle `sceaux.ts`) avec compteur global, recherche avancée (même syntaxe que le Legendarium : guillemets, +, -) et case « Respecter la casse », tri progression/nom, sceaux repliés par défaut ; ⚠️ CHANGÉ (23/10) : CARTES en GRILLE (`data-grille-sceaux`, grid auto-fill), barre SOUS la carte, pourcentage EN-DESSOUS (`data-pourcentage-texte`)",
   "compteursGlobaux" in code_page and "filtrerSceaux" in code_page and "trierSceaux" in code_page and 'data-respecter-casse' in code_page and 'data-tri-sceaux' in code_page and "useState(false)" in code_page and "regrouperParSceau" in modele and "data-grille-sceaux" in code_page and "data-pourcentage-texte" in code_page and "data-sceau-nom" in code_page and "gridTemplateColumns" in code_page)
ok("CODE : CARTES CARRÉES IDENTIQUES (retour utilisateur 24/10 soir : « carrés identiques en taille, attention aux alignements ») : zone cliquable en CARRÉ (`aspectRatio: \"1 / 1\"` + `boxSizing: \"border-box\"` + `justifyContent: \"center\"` + `overflow: \"hidden\"`), nom tronqué à 2 lignes (`WebkitLineClamp: 2` + ellipsis + `title={sceau.nom}`), titre à 1 ligne, zone barre/pourcentage à HAUTEUR FIXE (`data-zone-progression` + `flexShrink: 0`) sous le carré",
   'aspectRatio: "1 / 1"' in code_page and 'boxSizing: "border-box"' in code_page and 'justifyContent: "center"' in code_page and code_page.count("WebkitLineClamp") >= 2 and "data-zone-progression" in code_page and "flexShrink: 0" in code_page and "title={sceau.nom}" in code_page)
ok("CODE : PAS DE DOUBLON — le sélecteur garde ses QUATRE onglets ; « Carrière » et « Accomplissements » n'y figurent PAS",
   'valeur: "carriere"' not in sel and 'valeur: "accomplissements"' not in sel and len(re.findall(r'\{ valeur: "', sel)) == 4)
ok("CODE : la page n'affiche PAS la vitrine « Solo sans mourir » (elle reste UNIQUEMENT dans le tiroir `PanneauTriomphes`)",
   "VitrineSoloFlawless" not in code_page and "VitrineSoloFlawless" in lire("src/components/PanneauTriomphes.tsx"), code_page[:200])

def ouvrir(pg, params=""):
    pg.goto(SORTIE + "vue-accomplissements.html" + params); pg.wait_for_function("window.__pret===true"); pg.wait_for_timeout(600)

GEO = """() => { const R = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const region = document.querySelector('[role=region][aria-label="Accomplissements"]');
  return { region: region ? { ...R(region), label: region.getAttribute('aria-label') } : null,
           blocConnexion: document.querySelector('.pilier-carte--connexion') ? R(document.querySelector('.pilier-carte--connexion')) : null,
           selecteur: document.querySelector('.selecteur-vues') ? R(document.querySelector('.selecteur-vues')) : null,
           onglets: [...document.querySelectorAll('.selecteur-vues .bouton-vue')].map((e) => e.dataset.vue),
           boutonsBloc: [...document.querySelectorAll('.connexion-vues-compte button')].map((e) => e.getAttribute('aria-label')),
           texte: region ? region.innerText : "",
           compteur: (document.querySelector('[data-compteur-global]') || {}).textContent ?? null,
           grille: (() => { const el = document.querySelector('[data-grille-sceaux]'); if (!el) return null; const cs = getComputedStyle(el); return { display: cs.display, cols: cs.gridTemplateColumns }; })(),
           sceaux: [...document.querySelectorAll('[data-sceau]')].map((s) => ({ hash: s.getAttribute('data-sceau'), carteBox: R(s), nom: (s.querySelector('[data-sceau-nom]') || { textContent: '' }).textContent.trim(), titre: s.querySelector('[data-sceau-titre]').textContent.trim(), ouvert: s.querySelector('[data-sceau-titre]').getAttribute('aria-expanded') === 'true', nbTriomphes: s.querySelectorAll('[data-triomphe]').length, top: R(s).t, titreBox: R(s.querySelector('[data-sceau-titre]')), barre: s.querySelector('[data-barre-progression]') ? R(s.querySelector('[data-barre-progression]')) : null, zone: s.querySelector('[data-zone-progression]') ? R(s.querySelector('[data-zone-progression]')) : null, pct: (s.querySelector('[data-pourcentage-texte]') || { textContent: '' }).textContent.trim() })),
           recherche: (document.querySelector('input[aria-label="Rechercher un triomphe"]') || {}).value ?? null }; }"""

with sync_playwright() as p:
    nav = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1000, "height": 900}); erreurs = []; pg.on("pageerror", lambda e: erreurs.append(str(e)))
    ouvrir(pg); g = pg.evaluate(GEO)

    # ---------- 1. navigation ----------
    ok("LE BLOC CONNEXION RESTE AFFICHÉ avec ses DEUX boutons ; le sélecteur garde ses QUATRE onglets (pas de doublon)",
      g["blocConnexion"] is not None and g["boutonsBloc"] == ["Carrière", "Accomplissements"] and g["onglets"] == ["analyseur", "loadouts", "forge", "bibliotheque"], (g["boutonsBloc"], g["onglets"]))
    pg.get_by_role("button", name="Accomplissements").click(); pg.wait_for_timeout(300); g = pg.evaluate(GEO)
    ok("CLIC SUR « ACCOMPLISSEMENTS » (bloc Connexion) : la PAGE s'affiche (région « Accomplissements »), le bloc Connexion et le sélecteur restent affichés, PAS de vitrine « Solo sans mourir »",
      g["region"] is not None and g["region"]["label"] == "Accomplissements" and g["blocConnexion"] is not None and g["selecteur"] is not None and "Solo sans mourir" not in g["texte"] and pg.evaluate("window.__clics") == ["accomplissements"], g["texte"][:200])

    # ---------- 2. compteur global ----------
    ok("COMPTEUR GLOBAL : « 2 / 4 triomphes obtenus · score total : 1 000 » (6001 et 6004 accomplis, 500+500 pts ; le triomphe de portée personnage 6006 est EXCLU, le record masqué 6003 aussi)",
      g["compteur"] is not None and "2 / 4" in g["compteur"] and "triomphes obtenus" in g["compteur"] and "1 000" in g["compteur"] and "non disponible" not in g["compteur"], g["compteur"])

    # ---------- 3. sceaux repliés par défaut ----------
    ok("SCEAUX EN CARTES : 2 cartes (« Prophétie », « Trône brisé » — « Maître des armes » omis : triomphe de portée personnage exclu), TOUTES REPLIÉES PAR DÉFAUT (aria-expanded=false, aucun triomphe rendu)",
      [s["nom"] for s in g["sceaux"]] == ["Prophétie", "Trône brisé"] and all(s["ouvert"] is False and s["nbTriomphes"] == 0 for s in g["sceaux"]), [(s["nom"], s["ouvert"], s["nbTriomphes"]) for s in g["sceaux"]])
    ok("GRILLE : la liste est une grille CSS (display:grid, colonnes auto-fill) et les 2 cartes sont SUR LA MÊME LIGNE (même top) — objectif : plus de sceaux par ligne",
      g["grille"] is not None and g["grille"]["display"] == "grid" and "auto-fill" in g["grille"]["cols"] and len({s["top"] for s in g["sceaux"]}) == 1, g["grille"])
    largeurs = [s["carteBox"]["w"] for s in g["sceaux"]]; hauteurs = [s["carteBox"]["h"] for s in g["sceaux"]]
    ok("CARRÉS IDENTIQUES (toutes les cartes repliées) : MÊME largeur (±1 px), MÊME hauteur totale (±1 px), zone cliquable CARRÉE (largeur ≈ hauteur, ±2 px) et zone barre/pourcentage présente sous le carré — alignements respectés",
      max(largeurs) - min(largeurs) <= 1 and max(hauteurs) - min(hauteurs) <= 1 and all(abs(s["titreBox"]["w"] - s["titreBox"]["h"]) <= 2 for s in g["sceaux"]) and all(s["zone"] is not None and s["zone"]["t"] >= s["titreBox"]["b"] - 1 for s in g["sceaux"]), [(s["nom"], round(s["carteBox"]["w"], 1), round(s["carteBox"]["h"], 1), round(s["titreBox"]["w"], 1), round(s["titreBox"]["h"], 1)) for s in g["sceaux"]])
    ok("BARRE SOUS LA CARTE + POURCENTAGE EN-DESSOUS : dans chaque carte, la barre est sous le bouton (barre.t >= titre.b) et le pourcentage est affiché sous la barre ; « Prophétie » et « Trône brisé » à 1/2 → « 50 % »",
      all(s["barre"] is not None and s["barre"]["t"] >= s["titreBox"]["b"] - 1 and s["pct"] == "50 %" for s in g["sceaux"]), [(s["nom"], s["pct"], round(s["titreBox"]["b"], 1), round(s["barre"]["t"], 1) if s["barre"] else None) for s in g["sceaux"]])
    ok("TRI PAR DÉFAUT = PROGRESSION : « Prophétie » et « Trône brisé » à égalité (1/2 chacun) → ordre alphabétique FR",
      [s["nom"] for s in g["sceaux"]] == ["Prophétie", "Trône brisé"], [s["nom"] for s in g["sceaux"]])

    # ---------- 4. déplier un sceau ----------
    pg.locator("[data-sceau]", has_text="Trône brisé").locator("[data-sceau-titre]").click(); pg.wait_for_timeout(200)
    lignes = pg.evaluate("""() => [...document.querySelectorAll('[data-sceau]')].map((s) => ({ nom: (s.querySelector('[data-sceau-nom]') || { textContent: '' }).textContent.trim(), titreTexte: s.querySelector('[data-sceau-titre]').textContent.trim(), panneauDansCarte: (() => { const p = s.querySelector('[data-triomphes-sceau]'); return p !== null && s.contains(p) && p.getBoundingClientRect().top >= (s.querySelector('[data-barre-progression]') || { getBoundingClientRect: () => ({ top: 0 }) }).getBoundingClientRect().bottom - 1; })(),
      triomphes: [...s.querySelectorAll('[data-triomphe]')].map((t) => ({ nom: t.querySelector('strong').textContent.trim(), accompli: t.getAttribute('data-accompli') === 'oui', progression: t.innerText })) }))""")
    trone = next(s for s in lignes if "Trône brisé" in s["nom"])
    ok("DÉPLIER « Trône brisé » (clic sur la CARTE) : 2 triomphes DANS la carte, sous la barre (record masqué 6003 EXCLU), triés par nom FR — « Chute de la Maison » ⬜ (en cours, progression « 3 / 10 ») PUIS « On avait dit plus jamais ! » ✅ (accompli) ; le titre du sceau « Briseur de trône » est affiché DÉBLOQUÉ",
      len(trone["triomphes"]) == 2 and trone["panneauDansCarte"] and trone["triomphes"][0]["nom"].startswith("⬜") and "Chute de la Maison" in trone["triomphes"][0]["nom"] and "3 / 10" in trone["triomphes"][0]["progression"] and trone["triomphes"][1]["nom"].startswith("✅") and "On avait dit plus jamais" in trone["triomphes"][1]["nom"] and "Briseur de trône" in trone["titreTexte"] and "débloqué" in trone["titreTexte"], trone)
    pg.locator("[data-sceau]", has_text="Trône brisé").locator("[data-sceau-titre]").click(); pg.wait_for_timeout(200)
    ok("REPLIER : un second clic referme le sceau (aucun triomphe rendu)", pg.evaluate("() => [...document.querySelectorAll('[data-sceau]')].every((s) => s.querySelectorAll('[data-triomphe]').length === 0)"))

    # ---------- 5. recherche avancée ----------
    champ = pg.get_by_role("textbox", name="Rechercher un triomphe")
    champ.fill('"solo sans mourir"'); pg.wait_for_timeout(200); g = pg.evaluate(GEO)
    ok("RECHERCHE (phrase exacte, insensible à la casse) : `\"solo sans mourir\"` → 1 seul sceau (« Prophétie »), 1 triomphe (6004 ; la description de 6001 dit « en solo, sans mourir » — virgule absente)",
      len(g["sceaux"]) == 1 and "Prophétie" in g["sceaux"][0]["titre"] and "1 sceau(x)" in g["texte"], (g["sceaux"], g["texte"][:150]))
    champ.fill('+"sans mourir" -gambit "Chute de la Maison"'); pg.wait_for_timeout(200); g = pg.evaluate(GEO)
    ok("RECHERCHE AVANCÉE COMPLÈTE : `+\"sans mourir\" -gambit \"Chute de la Maison\"` → 1 seul sceau (« Trône brisé », les deux phrases requises dans 6001) avec 1 triomphe ; le compteur « 1 sceau(x) » s'affiche",
      len(g["sceaux"]) == 1 and "Trône brisé" in g["sceaux"][0]["titre"] and "1 sceau(x)" in g["texte"], (g["sceaux"], g["texte"][:150]))
    champ.fill("TRÔNE"); pg.wait_for_timeout(200)
    pg.get_by_role("checkbox").check(); pg.wait_for_timeout(200); g = pg.evaluate(GEO)
    ok("CASSE : « TRÔNE » + case « Aa » cochée → AUCUN sceau (les noms ont « Trône » avec T majuscule et « ô » minuscule) ; décochée → le sceau revient",
      len(g["sceaux"]) == 0 and "Aucun sceau ne correspond" in g["texte"], g["texte"][:150])
    pg.get_by_role("checkbox").uncheck(); pg.wait_for_timeout(200); g = pg.evaluate(GEO)
    ok("CASSE DÉCOCHÉE : « TRÔNE » retrouve le sceau « Trône brisé » (insensible à la casse par défaut)",
      len(g["sceaux"]) == 1 and "Trône brisé" in g["sceaux"][0]["titre"], g["sceaux"])
    champ.fill(""); pg.wait_for_timeout(200)

    # ---------- 6. tri ----------
    pg.get_by_role("combobox").select_option("nom"); pg.wait_for_timeout(200); g = pg.evaluate(GEO)
    ok("TRI PAR NOM : « Prophétie » avant « Trône brisé » (alphabétique FR)",
      [s["nom"] for s in g["sceaux"]] == ["Prophétie", "Trône brisé"], [s["nom"] for s in g["sceaux"]])
    pg.get_by_role("combobox").select_option("progression"); pg.wait_for_timeout(200)

    # ---------- 7. replis ----------
    ouvrir(pg, "?sans-profil=1"); pg.get_by_role("button", name="Accomplissements").click(); pg.wait_for_timeout(300); g = pg.evaluate(GEO)
    ok("REPLI SANS PROFIL (`?sans-profil=1`) : « Connectez-vous pour afficher vos Triomphes de compte. », aucun sceau, aucun compteur",
      "Connectez-vous pour afficher vos Triomphes" in g["texte"] and len(g["sceaux"]) == 0 and g["compteur"] is None, g["texte"][:200])
    ouvrir(pg, "?sans-db=1"); pg.get_by_role("button", name="Accomplissements").click(); pg.wait_for_timeout(300); g = pg.evaluate(GEO)
    ok("REPLI SANS MANIFEST (`?sans-db=1`) : avertissement « ⚠️ Manifest non chargé … non disponibles » (jamais d'estimation)",
      "Manifest non chargé" in g["texte"] and "non disponibles" in g["texte"], g["texte"][:200])

    ok("aucune erreur JavaScript", len(erreurs) == 0, erreurs[:3])
    nav.close()
print(f"\n{sum(res)}/{len(res)} contrôles réussis"); sys.exit(0 if all(res) else 1)

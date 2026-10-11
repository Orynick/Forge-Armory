"""
FR : outil de Claude pour le fichier A-TESTER.pdf (racine du projet), à
partir de sa source documentation/sources/A-TESTER.md. Pas un outil de
l'appli : il demande pandoc, Python (pypdf, pdfplumber, Playwright) et un
Chromium, absents du PC de travail.

Deux modes :

  generer <racine> <chromium>
      Produit A-TESTER-<version>.pdf (ex. A-TESTER-0.3.1.pdf) : A4, pied de page numéroté, version lue dans
      package.json, date du jour. ⚠️ Depuis le 27/09/2026 (demande de
      l'utilisateur), chaque case est un VRAI champ de formulaire, cliquable
      et enregistrable dans le lecteur PDF (Edge, Chrome, Acrobat...).
      État initial des cases = état de la source ([x] coché, [ ] vide).

  relire <racine> <pdf-rempli>
      Lit l'état des cases d'un A-TESTER.pdf renvoyé par l'utilisateur et
      le reporte dans la source (les cases changées sont listées). Sécurité :
      refuse si le PDF ne correspond pas à la source actuelle (nombre de
      cases ou textes différents), pour ne jamais cocher le mauvais test.

EN: Claude's tooling for A-TESTER.pdf. "generer" builds the PDF with real,
clickable form checkboxes; "relire" reads a filled-in PDF back into the
Markdown source, refusing if the PDF doesn't match the current source.
"""
import json, re, subprocess, sys, datetime, pathlib, html as html_mod
from zoneinfo import ZoneInfo

SOURCE_REL = "documentation/sources/A-TESTER.md"
MOTIF_CASE = re.compile(r'<input type="checkbox"( checked="")? />')
MOTIF_LIGNE_MD = re.compile(r"^([ \t]*[-*] \[)([ xX])(\])", re.M)

STYLE = """<style>
@page { size: A4; margin: 16mm 15mm 18mm 15mm; }
body { font-family: "DejaVu Sans", "Noto Color Emoji", sans-serif; font-size: 9.6pt; line-height: 1.45; color: #1d1f24; }
.entete { border-bottom: 2px solid #2b4a7a; padding-bottom: 6pt; margin-bottom: 10pt; }
.entete h1 { margin: 0; font-size: 19pt; color: #2b4a7a; }
.entete .sous { color: #5a5d66; font-size: 9pt; margin-top: 2pt; }
h2 { font-size: 12.5pt; color: #2b4a7a; margin: 16pt 0 6pt; padding: 4pt 6pt; background: #eef2f8; border-left: 3px solid #2b4a7a; break-after: avoid; }
h3 { font-size: 10.5pt; color: #2b4a7a; margin: 11pt 0 4pt; break-after: avoid; }
p { margin: 4pt 0; }
hr { border: none; border-top: 1px solid #d5d9e0; margin: 12pt 0; }
ul, ol { margin: 3pt 0 6pt; padding-left: 16pt; }
li { margin: 2.5pt 0; break-inside: avoid; }
li:has(> label > .case), li:has(> .case) { list-style: none; margin-left: -14pt; }
label { display: block; padding-left: 18pt; text-indent: -18pt; }
.case { display: inline-block; width: 9pt; height: 9pt; border: 1.2px solid #2b4a7a; border-radius: 2px; margin-right: 7pt; vertical-align: -1pt; text-indent: 0; text-align: center; font-size: 8pt; line-height: 9pt; }
.case.cochee { background: #2e7d4f; border-color: #2e7d4f; color: #fff; font-weight: bold; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.6pt; background: #f1f3f6; padding: 0 2.5pt; border-radius: 2px; }
pre { background: #f1f3f6; padding: 5pt 7pt; border-radius: 3px; white-space: pre-wrap; font-size: 8.4pt; break-inside: avoid; }
pre code { background: none; padding: 0; }
blockquote { margin: 5pt 0; padding: 3pt 8pt; border-left: 3px solid #c9a227; background: #fbf7ea; color: #3d3a2e; }
table { border-collapse: collapse; margin: 5pt 0; font-size: 8.8pt; }
th, td { border: 1px solid #d5d9e0; padding: 2.5pt 5pt; text-align: left; vertical-align: top; }
th { background: #eef2f8; }
strong { color: #111; }
</style>"""


def html_depuis_source(racine: pathlib.Path) -> str:
    # FR : --wrap=none indispensable : sinon pandoc coupe les lignes longues,
    # parfois AU MILIEU d'une balise de case, qui n'est alors plus reconnue
    # (3 cases perdues lors du premier essai, 27/09/2026).
    # EN: --wrap=none is required, otherwise pandoc may split a checkbox tag.
    corps = subprocess.run(["pandoc", "-f", "gfm", "-t", "html", "--wrap=none", str(racine / SOURCE_REL)],
                           capture_output=True, text=True, check=True).stdout
    return re.sub(r"<!--.*?-->", "", corps, flags=re.S)


def textes_des_cases(corps: str) -> list[str]:
    """FR : texte de chaque test, dans l'ordre des cases (sert d'infobulle au
    champ, et de contrôle de correspondance en relecture).
    EN: each test's text, in checkbox order."""
    textes = []
    for m in MOTIF_CASE.finditer(corps):
        suite = corps[m.end():m.end() + 1500]
        fin = re.search(r"</label>|</li>", suite)
        brut = suite[: fin.start() if fin else 300]
        texte = html_mod.unescape(re.sub(r"<[^>]+>", "", brut))
        textes.append(" ".join(texte.split())[:200].strip())
    return textes


def generer(racine: pathlib.Path, chromium: str) -> None:
    from playwright.sync_api import sync_playwright
    import pdfplumber
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import (ArrayObject, BooleanObject, DictionaryObject, FloatObject,
                               NameObject, NumberObject, StreamObject, TextStringObject)

    version = json.loads((racine / "package.json").read_text(encoding="utf-8"))["version"]
    # FR : heure de PARIS, pas celle du serveur (01/10/2026 : le serveur avait 2 h de
    # retard, la liste était datée de la veille). / EN: Paris time, not server time.
    date = datetime.datetime.now(ZoneInfo("Europe/Paris")).strftime("%d/%m/%Y")

    corps = html_depuis_source(racine)
    etats = [bool(m.group(1)) for m in MOTIF_CASE.finditer(corps)]
    textes = textes_des_cases(corps)
    # FR : toutes les cases sont dessinées VIDES ; la coche est portée par le
    # champ de formulaire posé par-dessus (sinon, décocher laisserait la
    # coche imprimée dessous).
    # EN: all boxes drawn EMPTY; the tick belongs to the form field on top.
    corps = MOTIF_CASE.sub('<span class="case"></span>', corps)
    corps = re.sub(r"<h1[^>]*>.*?</h1>", "", corps, count=1, flags=re.S)
    # FR : ⚠️ AJOUT (01/10/2026) - un sous-titre en gras SEUL sur sa ligne (« **Boutons d'une carte** »)
    # ne doit pas rester isolé en bas d'une page, loin des tests qu'il introduit : on lui interdit une
    # coupure de page juste après. (Constaté sur la page 1 de la liste du 01/10.)
    # EN: a lone bold subheading must not be stranded at a page bottom, away from the tests it introduces.
    corps = re.sub(r"<p>(<strong>[^<]*</strong>(?:\s*\([^<]*\))?)</p>", r'<p style="break-after: avoid;">\1</p>', corps)

    page_html = f"""<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>À tester — Forge Armory</title>
{STYLE}</head><body>
<div class="entete"><h1>À tester</h1>
<div class="sous">Forge Armory — version {version} — liste mise à jour le {date}</div></div>
{corps}
</body></html>"""
    tmp_html = racine / "documentation/sources/.a-tester-temp.html"
    tmp_pdf = racine / "documentation/sources/.a-tester-temp.pdf"
    tmp_html.write_text(page_html, encoding="utf-8")
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=chromium)
        page = b.new_page()
        page.goto(tmp_html.resolve().as_uri())
        page.pdf(path=str(tmp_pdf), format="A4", print_background=True,
                 display_header_footer=True, header_template="<span></span>",
                 footer_template=f'<div style="font-family:DejaVu Sans,sans-serif;font-size:7.5pt;color:#8a8d95;width:100%;text-align:center;">À tester — Forge Armory v{version} — page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
                 margin={"top": "16mm", "bottom": "18mm", "left": "15mm", "right": "15mm"})
        b.close()
    tmp_html.unlink()

    # FR : position des cases dessinées (carrés arrondis de ~9,7 pt).
    # EN: positions of the drawn boxes (rounded ~9.7pt squares).
    positions = []
    with pdfplumber.open(str(tmp_pdf)) as pdf:
        for num, pg in enumerate(pdf.pages):
            # FR : une case = carré de ~9,7 pt, contour seul, couleur #2b4a7a.
            # Le filtre sur le contour écarte des pictogrammes de même taille
            # (remplis, sans contour) présents dans certains paragraphes.
            # EN: a box = ~9.7pt square, stroke only, colour #2b4a7a.
            cases = [c for c in pg.curves
                     if 8.5 < c["width"] < 11 and 8.5 < c["height"] < 11
                     and c.get("stroke") and not c.get("fill")
                     and all(abs(a - b) < 0.02 for a, b in zip(c.get("stroking_color") or (), (0.1686, 0.2902, 0.4784)))]
            cases.sort(key=lambda c: (round(c["top"]), c["x0"]))
            for c in cases:
                positions.append((num, c["x0"], float(pg.height) - c["bottom"], c["x1"], float(pg.height) - c["top"]))
    if len(positions) != len(etats):
        tmp_pdf.unlink()
        raise SystemExit(f"ERREUR : {len(positions)} cases dessinées pour {len(etats)} tests dans la source.")

    lecteur = PdfReader(str(tmp_pdf))
    ecrivain = PdfWriter()
    ecrivain.append(lecteur)

    def apparence(l: float, h: float, cochee: bool) -> StreamObject:
        # FR : coche = carré vert plein + coche blanche (même style qu'avant) ;
        # vide = rien (le contour imprimé dessous suffit).
        # EN: ticked = green square + white tick; empty = nothing.
        if cochee:
            ops = (f"0.18 0.49 0.31 rg 0 0 {l:.2f} {h:.2f} re f "
                   f"1 1 1 RG 1.4 w 1 J 1 j {l*0.22:.2f} {h*0.52:.2f} m {l*0.42:.2f} {h*0.28:.2f} l {l*0.80:.2f} {h*0.74:.2f} l S")
        else:
            ops = ""
        flux = StreamObject()
        flux.set_data(ops.encode("ascii"))
        flux.update({NameObject("/Type"): NameObject("/XObject"), NameObject("/Subtype"): NameObject("/Form"),
                     NameObject("/BBox"): ArrayObject([FloatObject(0), FloatObject(0), FloatObject(l), FloatObject(h)])})
        return ecrivain._add_object(flux)

    champs = ArrayObject()
    for i, ((num, x0, y0, x1, y1), coche, texte) in enumerate(zip(positions, etats, textes), start=1):
        l, h = x1 - x0, y1 - y0
        etat = NameObject("/Oui") if coche else NameObject("/Off")
        champ = DictionaryObject({
            NameObject("/Type"): NameObject("/Annot"),
            NameObject("/Subtype"): NameObject("/Widget"),
            NameObject("/FT"): NameObject("/Btn"),
            NameObject("/T"): TextStringObject(f"test_{i:03d}"),
            NameObject("/TU"): TextStringObject(texte),
            NameObject("/Rect"): ArrayObject([FloatObject(x0), FloatObject(y0), FloatObject(x1), FloatObject(y1)]),
            NameObject("/F"): NumberObject(4),
            NameObject("/V"): etat,
            NameObject("/AS"): etat,
            NameObject("/MK"): DictionaryObject({NameObject("/CA"): TextStringObject("4")}),
            NameObject("/DA"): TextStringObject("/ZaDb 0 Tf 0 g"),
            NameObject("/AP"): DictionaryObject({NameObject("/N"): DictionaryObject({
                NameObject("/Oui"): apparence(l, h, True), NameObject("/Off"): apparence(l, h, False)})}),
        })
        ref = ecrivain._add_object(champ)
        pg = ecrivain.pages[num]
        if "/Annots" not in pg:
            pg[NameObject("/Annots")] = ArrayObject()
        pg["/Annots"].append(ref)
        champ[NameObject("/P")] = pg.indirect_reference
        champs.append(ref)

    ecrivain._root_object[NameObject("/AcroForm")] = ecrivain._add_object(DictionaryObject({
        NameObject("/Fields"): champs,
        NameObject("/NeedAppearances"): BooleanObject(False),
        # FR : police de coche standard, déclarée pour les lecteurs qui la
        # demandent (Acrobat) ; l'apparence dessinée reste prioritaire.
        # EN: standard tick font, declared for readers that ask for it.
        NameObject("/DA"): TextStringObject("/ZaDb 0 Tf 0 g"),
        NameObject("/DR"): DictionaryObject({NameObject("/Font"): DictionaryObject({
            NameObject("/ZaDb"): ecrivain._add_object(DictionaryObject({
                NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/Type1"),
                NameObject("/BaseFont"): NameObject("/ZapfDingbats")}))})}),
    }))
    ecrivain.add_metadata({"/Title": f"À tester — Forge Armory v{version}"})
    # FR : ⚠️ CHANGÉ (06/10/2026, demande de l'utilisateur : « le fichier A TESTER portera le numéro de version de l'appli ») : le PDF s'appelle
    # `A-TESTER-<version>.pdf` (par exemple `A-TESTER-0.3.1.pdf`). Un ancien `A-TESTER*.pdf` de la racine est retiré : un seul PDF de liste à la fois.
    # EN: ⚠️ CHANGED - the PDF is named `A-TESTER-<version>.pdf`; any older `A-TESTER*.pdf` in the root is removed.
    nom_pdf = f"A-TESTER-{version}.pdf"
    for ancien in racine.glob("A-TESTER*.pdf"):
        if ancien.name != nom_pdf:
            ancien.unlink()
    with open(racine / nom_pdf, "wb") as f:
        ecrivain.write(f)
    tmp_pdf.unlink()
    print(f"{nom_pdf} régénéré (v{version}, {date}) : {len(champs)} cases cliquables, dont {sum(etats)} déjà cochées.")


def relire(racine: pathlib.Path, pdf_rempli: str) -> None:
    from pypdf import PdfReader

    champs = PdfReader(pdf_rempli).get_fields() or {}
    noms = sorted(n for n in champs if re.fullmatch(r"test_\d{3}", n))
    textes_source = textes_des_cases(html_depuis_source(racine))
    if len(noms) != len(textes_source):
        raise SystemExit(f"REFUS : le PDF a {len(noms)} cases, la source {len(textes_source)}. PDF d'une autre version ?")
    for n, attendu in zip(noms, textes_source):
        if " ".join(str(champs[n].get("/TU", "")).split()) != attendu:
            raise SystemExit(f"REFUS : la case {n} ne correspond plus au même test dans la source.")
    cochees = [str(champs[n].get("/V", "/Off")) not in ("/Off", "", "None") for n in noms]

    chemin = racine / SOURCE_REL
    source = chemin.read_text(encoding="utf-8")
    lignes_md = list(MOTIF_LIGNE_MD.finditer(source))
    if len(lignes_md) != len(cochees):
        raise SystemExit(f"REFUS : {len(lignes_md)} cases trouvées dans le Markdown, {len(cochees)} dans le PDF.")
    changements = []
    morceaux, dernier = [], 0
    for m, coche, texte in zip(lignes_md, cochees, textes_source):
        avant = m.group(2).lower() == "x"
        morceaux.append(source[dernier:m.start(2)])
        morceaux.append("x" if coche else " ")
        dernier = m.end(2)
        if avant != coche:
            changements.append(("☑ coché  " if coche else "☐ décoché") + " : " + texte[:90])
    morceaux.append(source[dernier:])
    chemin.write_text("".join(morceaux), encoding="utf-8")
    print(f"{len(changements)} case(s) modifiée(s) :")
    for c in changements:
        print("  " + c)


if __name__ == "__main__":
    mode, racine = sys.argv[1], pathlib.Path(sys.argv[2])
    if mode == "generer":
        generer(racine, sys.argv[3])
    elif mode == "relire":
        relire(racine, sys.argv[3])
    else:
        raise SystemExit("Mode inconnu : generer | relire")

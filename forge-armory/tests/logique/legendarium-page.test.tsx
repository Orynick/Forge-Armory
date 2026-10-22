// FR : ⚠️ AJOUT (21/10/2026, chantier Legendarium, étape 2) - test de la PAGE Legendarium (`src/components/Bibliotheque.tsx`) : les trois zones de la spécification verrouillée §4 (bandeau titre + recherche + indicateur de cache ; colonne sections → livres ; zone de lecture avec précédent/suivant), la palette « Parchemin / Hologramme » verrouillée §5 (D1 parchemin, D2 hologramme), le parcours inverse (objets porteurs), le bouton de retour vers l'objet (provenance), la recherche par mots-clés (résultats cliquables). Rendu STATIQUE (renderToStaticMarkup, comme les autres tests UI du projet) : pas de jsdom, pas de clics — on teste la STRUCTURE rendue et les sous-composants exportés. L'état interactif (clics, navigation) est testé en Playwright côté utilisateur. EN: test of the Legendarium PAGE: the three locked zones (spec §4), the locked palette (§5), the reverse path, the back-to-item button, the keyword search results. Static render only.
import { renderToStaticMarkup } from "react-dom/server";
import Bibliotheque, { ArbreCategories, BandeauLegendarium, ColonneSections, ResultatsRecherche, ZoneLecture } from "../../src/components/Bibliotheque";   // ⚠️ AJOUT (21/10/2026, suite 10) : ArbreCategories (hiérarchie catégorie → livre → pages)
import BoutonLireLore from "../../src/components/BoutonLireLore";   // ⚠️ AJOUT (21/10/2026, étape 5) : bouton « Lire le Lore » des fiches Détails
import { creerFausseDb } from "./fixtures/fauxManifest";
import type { CategorieLore, LivreLore, PageLore } from "../../src/lib/legendarium/types";
import type { ResultatRechercheLore } from "../../src/lib/legendarium/modele";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(detail).slice(0, 600)); };
const texte = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();

// --- Fixtures ---
const page = (id: string, titre: string, texteCorps: string, extra: Partial<PageLore> = {}): PageLore => ({ id, titre, texte: texteCorps, ...extra });
const livre = (id: string, titre: string, pages: PageLore[]): LivreLore => ({ id, titre, pages });
const livreGrimoire = livre("grimoire-livre:Guardian", "Gardiens", [
  page("grimoire:101005", "Gardiens", "Texte de la carte Gardiens.", { sousTitre: "Classes" }),
  page("grimoire:101010", "Les Titans", "Texte de la carte Titans.", { sousTitre: "Classes" }),
]);
const livreHologramme = livre("legendes", "Tomes de Légendes", [
  page("lore:7001", "Le Gardien se lève", "Un Gardien se lève.", { sousTitre: "Chapitre I" }),
]);
const resultat = (section: ResultatRechercheLore["section"], livreCible: LivreLore, pageCible: PageLore): ResultatRechercheLore => ({ section, livre: livreCible, page: pageCible });

// --- Bandeau (zone 1, spécification §4) ---
const bandeau = renderToStaticMarkup(<BandeauLegendarium motCle="" onChangerMotCle={() => {}} dbPresent={true} nbResultats={0} />);
ok("bandeau : titre « Legendarium » + champ de recherche accessible (aria-label) + indicateur de cache chargé",
  bandeau.includes("Legendarium") && bandeau.includes('aria-label="Rechercher dans le Lore"') && bandeau.includes("Manifest chargé"), bandeau.slice(0, 300));
const bandeauSansDb = renderToStaticMarkup(<BandeauLegendarium motCle="" onChangerMotCle={() => {}} dbPresent={false} nbResultats={0} />);
ok("bandeau : sans Manifest, l'indicateur le dit (et le champ de recherche reste accessible)",
  bandeauSansDb.includes("Manifest pas encore chargé") && bandeauSansDb.includes('aria-label="Rechercher dans le Lore"'));
const bandeauAvecRecherche = renderToStaticMarkup(<BandeauLegendarium motCle="voyageur" onChangerMotCle={() => {}} dbPresent={true} nbResultats={12} />);
ok("bandeau : pendant une recherche, le compteur de résultats s'affiche",
  bandeauAvecRecherche.includes("12") && bandeauAvecRecherche.includes("résultat(s)") && bandeauAvecRecherche.includes('value="voyageur"'));

// --- Colonne latérale (zone 2, spécification §4) ---
const colonne = renderToStaticMarkup(
  <ColonneSections section="grimoire" livres={[livreGrimoire]} pageId="grimoire:101005" grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
);
const boutonsSections = [...colonne.matchAll(/data-section="([^"]+)"/g)].map((m) => m[1]);
ok("colonne : les QUATRE sections, DANS L'ORDRE GLOBAL VERROUILLÉ (Grimoire D1 → Légendes D2 → Armes et armures → Cosmétiques et utilitaires)",
  JSON.stringify(boutonsSections) === JSON.stringify(["grimoire", "legendes", "objets", "cosmetiques"]), boutonsSections);
ok("colonne : la section active est marquée (aria-pressed) et ses livres sont dépliés avec leur nombre de pages",
  colonne.includes('data-section="grimoire" aria-pressed="true"') && colonne.includes("Gardiens") && colonne.includes("2 pages") && colonne.includes('data-livre="grimoire-livre:Guardian"'));
ok("colonne : la page active est repérée dans le livre (aria-current)",
  colonne.includes('aria-current="page"'));
const colonneChargement = renderToStaticMarkup(
  <ColonneSections section="grimoire" livres={[]} pageId={null} grimoireEnChargement={true} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
);
ok("colonne : pendant le chargement du Grimoire D1, un message est affiché (pas de liste vide silencieuse)",
  colonneChargement.includes("Chargement du Grimoire"));
const colonneVide = renderToStaticMarkup(
  <ColonneSections section="legendes" livres={[]} pageId={null} grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
);
ok("colonne : une section D2 sans Manifest affiche « Aucun contenu » (le Grimoire D1 est embarqué, pas les sections D2)",
  colonneVide.includes("Aucun contenu"));

// --- Zone de lecture (zone 3, spécification §4) + palette verrouillée §5 ---
const zoneD1 = renderToStaticMarkup(
  <ZoneLecture section="grimoire" livre={livreGrimoire} page={livreGrimoire.pages[0]} idPrecedente={null} idSuivante="grimoire:101010" onOuvrirPage={() => {}} />
);
ok("zone de lecture : œilleton = titre du livre, titre de la page, sous-titre (chapitre), texte rendu",
  texte(zoneD1).includes("Gardiens") && texte(zoneD1).includes("Texte de la carte Gardiens.") && texte(zoneD1).includes("Classes"), texte(zoneD1).slice(0, 300));
ok("palette verrouillée : la section Grimoire D1 est en ère « d1 » (parchemin : fond #2b2116, bordure #8a6d3b)",
  zoneD1.includes('data-ere="d1"') && zoneD1.includes("background-color:#2b2116") && zoneD1.includes("#8a6d3b"));
ok("palette verrouillée : une section D2 est en ère « d2 » (hologramme : fond #0d1520, bordure #1e3a5f, lueur)",
  renderToStaticMarkup(<ZoneLecture section="legendes" livre={livreHologramme} page={livreHologramme.pages[0]} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />).includes('data-ere="d2"'));
ok("zone de lecture : navigation précédent/suivant — « Précédent » désactivé en première page, « Suivant » actif",
  /data-nav-precedente=""[^>]*disabled/.test(zoneD1) && !/data-nav-suivante=""[^>]*disabled/.test(zoneD1));
ok("zone de lecture : la navigation est présente même en DERNIÈRE page (Suivant désactivé)",
  /data-nav-suivante=""[^>]*disabled/.test(renderToStaticMarkup(<ZoneLecture section="grimoire" livre={livreGrimoire} page={livreGrimoire.pages[1]} idPrecedente="grimoire:101005" idSuivante={null} onOuvrirPage={() => {}} />)));

// --- ⚠️ AJOUT (21/10/2026, demande de l'utilisateur) : la nav est AU-DESSUS et EN-DESSOUS de la page, PAS DANS ---
// La barre du haut (`data-nav-haut`) précède l'œilleton/titre/texte ; celle du bas (`data-nav-bas`) les suit (après le parcours inverse).
{
  const html = renderToStaticMarkup(<ZoneLecture section="grimoire" livre={livreGrimoire} page={livreGrimoire.pages[0]} idPrecedente="grimoire:9999" idSuivante="grimoire:101010" onOuvrirPage={() => {}} />);
  const iHaut = html.indexOf('data-nav-haut=""');
  const iOeilleton = html.indexOf('data-oeilleton=""');
  const iTexte = html.indexOf('data-texte-lore=""');
  const iBas = html.indexOf('data-nav-bas=""');
  const iFin = html.indexOf("</article>");
  ok("⚠️ nav : une barre de navigation AU-DESSUS de la page (`data-nav-haut`) et une EN-DESSOUS (`data-nav-bas`), PAS DANS le texte",
    iHaut !== -1 && iBas !== -1 && iHaut < iOeilleton && iBas > iTexte && iBas < iFin, { iHaut, iOeilleton, iTexte, iBas, iFin });
  ok("⚠️ nav : les DEUX barres portent les mêmes boutons Précédent/Suivant (attributs `data-nav-precedente`/`data-nav-suivante` en double)",
    (html.match(/data-nav-precedente=""/g) ?? []).length === 2 && (html.match(/data-nav-suivante=""/g) ?? []).length === 2);
  ok("⚠️ nav : les deux barres sont centrées (justify-content:center), pas étirées aux extrémités de la page",
    (html.match(/justify-content:center/g) ?? []).length >= 2);
  // Le texte de Lore n'est PAS entre les deux boutons d'une même barre : la nav du haut est avant l'œilleton, celle du bas après le parcours inverse
  const htmlAvecPorteurs = renderToStaticMarkup(<ZoneLecture section="objets" livre={livreHologramme} page={page("lore:7101", "Izanagi", "Texte.", { porteurs: [{ hash: 6001, nom: "Izanagi", emplacement: "Fusil" }] })} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />);
  const iHaut2 = htmlAvecPorteurs.indexOf('data-nav-haut=""');
  const iInverse = htmlAvecPorteurs.indexOf('data-parcours-inverse=""');
  const iBas2 = htmlAvecPorteurs.indexOf('data-nav-bas=""');
  ok("⚠️ nav : la barre du BAS est APRÈS le parcours inverse (hors de la page de Lore)",
    iHaut2 !== -1 && iInverse !== -1 && iBas2 > iInverse, { iHaut2, iInverse, iBas2 });
}

// Parcours inverse (objets porteurs)
const pageAvecPorteurs = page("lore:7101", "Izanagi — Burden", "Texte du lore.", {
  porteurs: [
    { hash: 6001, nom: "Izanagi — Burden", emplacement: "Fusil de précision" },
    { hash: 6040, nom: "Izanagi — Burden (réédition)", emplacement: "Fusil de précision" },
  ],
});
const zoneInverse = renderToStaticMarkup(
  <ZoneLecture section="objets" livre={livre("objets-armes", "Lore des armes", [pageAvecPorteurs])} page={pageAvecPorteurs} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />
);
ok("parcours inverse : la page liste les objets porteurs du Lore (rééditions comprises)",
  zoneInverse.includes('data-parcours-inverse=""') && zoneInverse.includes("Objets portant ce Lore :") && zoneInverse.includes("Izanagi — Burden (réédition)") && zoneInverse.includes("Fusil de précision"));
const zoneSansPorteurs = renderToStaticMarkup(
  <ZoneLecture section="legendes" livre={livreHologramme} page={livreHologramme.pages[0]} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />
);
ok("parcours inverse : une page sans porteur (Légende D2, Grimoire D1) n'affiche pas le bloc",
  !zoneSansPorteurs.includes('data-parcours-inverse=""'));

// Bouton de retour vers l'objet (provenance, étape 5 préparée)
const zoneRetour = renderToStaticMarkup(
  <ZoneLecture section="objets" livre={livre("objets-armes", "Lore des armes", [pageAvecPorteurs])} page={pageAvecPorteurs} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} provenance={{ itemHash: 6001, nomObjet: "Izanagi — Burden", origine: "analyseur" }} onRetourObjet={() => {}} />
);
ok("bouton de retour : affiché quand la page a été atteinte depuis une fiche Détails (provenance), libellé « Retour vers <objet> »",
  zoneRetour.includes('data-retour-objet=""') && zoneRetour.includes("Retour vers Izanagi — Burden"));
ok("bouton de retour : absent sans provenance",
  !zoneSansPorteurs.includes('data-retour-objet=""'));

// Libellé chronologique (classement par défaut, décision utilisateur 20/10)
const zoneChrono = renderToStaticMarkup(
  <ZoneLecture section="objets" livre={livre("objets-armes", "Lore des armes", [page("lore:7101", "Izanagi — Burden", "Texte.", { rangChrono: 11, libelleChrono: "Saison 11 · L'Œil du printemps" })])} page={page("lore:7101", "Izanagi — Burden", "Texte.", { rangChrono: 11, libelleChrono: "Saison 11 · L'Œil du printemps" })} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />
);
ok("zone de lecture : le libellé chronologique de la page est affiché quand connu",
  texte(zoneChrono).includes("Saison 11 · L'Œil du printemps"), texte(zoneChrono));

// --- Résultats de recherche (spécification §6) ---
const resultats = [
  resultat("grimoire", livreGrimoire, livreGrimoire.pages[0]),
  resultat("legendes", livreHologramme, livreHologramme.pages[0]),
];
const listeRes = renderToStaticMarkup(<ResultatsRecherche motCle="gardien" resultats={resultats} onOuvrir={() => {}} />);
ok("recherche : les résultats sont cliquables et portent section · livre · chapitre",
  listeRes.includes('data-resultats-recherche=""') && listeRes.includes("Gardiens") && texte(listeRes).includes("Grimoire D1 · Gardiens · Classes") && texte(listeRes).includes("Légendes D2 · Tomes de Légendes · Chapitre I"));
ok("recherche : sans résultat, un message explicite (pas une liste vide)",
  renderToStaticMarkup(<ResultatsRecherche motCle="zzzz" resultats={[]} onOuvrir={() => {}} />).includes("Aucun résultat pour « zzzz »"));
const plein = Array.from({ length: 60 }, (_, i) => resultat("legendes", livreHologramme, page(`lore:${i}`, `Page ${i}`, "x")));
const listePleine = renderToStaticMarkup(<ResultatsRecherche motCle="page" resultats={plein} onOuvrir={() => {}} />);
ok("recherche : plafond à 50 affichés + message « … et N autre(s) » au-delà",
  (listePleine.match(/<li /g) ?? []).length === 50 && listePleine.includes("10 autre(s) résultat(s)"));

// --- Page complète (rendu statique) ---
const T_OBJET = "DestinyInventoryItemDefinition", T_LORE = "DestinyLoreDefinition";
const { db } = creerFausseDb({
  [T_LORE]: {
    7001: { displayProperties: { name: "Le Gardien se lève", description: "Un Gardien se lève, la Tour retient son souffle." } },
    7101: { displayProperties: { name: "Izanagi", description: "Texte du lore d'Izanagi." } },
  },
  [T_OBJET]: {
    6001: { displayProperties: { name: "Izanagi — Burden", icon: "/i.png", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: 1498876634 } },
    6002: { displayProperties: { name: "Arme sans lore", icon: "/i.png", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil à pompe", inventory: { bucketTypeHash: 1498876634 } },
  },
});
const htmlSansDb = renderToStaticMarkup(<Bibliotheque db={null} />);
const pageSansDb = texte(htmlSansDb);
ok("page sans Manifest : bandeau + les 4 sections + accueil (pas de zone de lecture), le champ de recherche est là",
  pageSansDb.includes("Legendarium") && pageSansDb.includes("Manifest pas encore chargé") && pageSansDb.includes("Bienvenue dans le Legendarium") && htmlSansDb.includes('aria-label="Rechercher dans le Lore"') && pageSansDb.includes("Grimoire D1") && pageSansDb.includes("Cosmétiques et utilitaires"), pageSansDb.slice(0, 400));
const pageAvecDb = renderToStaticMarkup(<Bibliotheque db={db as never} />);
ok("page avec Manifest : les 4 sections restent dans l'ordre verrouillé (le Grimoire D1 se charge en arrière-plan, hors rendu statique)",
  JSON.stringify([...pageAvecDb.matchAll(/data-section="([^"]+)"/g)].map((m) => m[1])) === JSON.stringify(["grimoire", "legendes", "objets", "cosmetiques"]));
ok("page complète : aucun résidu de l'ancien panneau « en construction »",
  !pageSansDb.includes("en construction") && !pageAvecDb.includes("en construction"));


// --- ⚠️ AJOUT (21/10/2026, étape 5) : Bouton « Lire le Lore » des fiches Détails (spécification §6) ---
// Rendu STATIQUE : le composant est PUR (pas d'état, pas d'effet) — on vérifie qu'il rend le bouton UNIQUEMENT si l'objet a un Lore (via `aLore`, lecture légère),
// avec la ligne justifiée à droite (`data-ligne-lire-lore`), l'attribut `data-item-hash` pour le lien profond, et le libellé « Lire le Lore ».
{
  const T_OBJET2 = "DestinyInventoryItemDefinition", T_LORE2 = "DestinyLoreDefinition";
  const { db: dbBouton } = creerFausseDb({
    [T_LORE2]: {
      7101: { displayProperties: { name: "Izanagi", description: "Texte du lore d'Izanagi." } },
      7003: { displayProperties: { name: "Lore vide", description: "" } },
    },
    [T_OBJET2]: {
      6001: { displayProperties: { name: "Izanagi — Burden", icon: "/i.png", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil de précision", loreHash: 7101, inventory: { bucketTypeHash: 1498876634 } },
      6002: { displayProperties: { name: "Arme sans lore", icon: "/i.png", description: "" }, itemType: 3, itemTypeDisplayName: "Fusil à pompe", inventory: { bucketTypeHash: 1498876634 } },
      6005: { displayProperties: { name: "Arme lore vide", icon: "/i.png", description: "" }, itemType: 3, loreHash: 7003, inventory: { bucketTypeHash: 1498876634 } },
    },
  });
  const avecLore = renderToStaticMarkup(<BoutonLireLore db={dbBouton as never} itemHash={6001} nomObjet="Izanagi — Burden" onLireLore={(h) => { void h; }} />);
  ok("bouton : objet AVEC Lore → la ligne justifiée à droite + le bouton « 📖 Lire le Lore » avec `data-item-hash` et l'infobulle du nom",
    avecLore.includes('data-ligne-lire-lore=""') && avecLore.includes("justify-content:flex-end") && avecLore.includes('data-bouton-lire-lore=""') && avecLore.includes('data-item-hash="6001"') && avecLore.includes("Lire le Lore") && avecLore.includes("Izanagi — Burden"), avecLore.slice(0, 400));
  const sansLore = renderToStaticMarkup(<BoutonLireLore db={dbBouton as never} itemHash={6002} nomObjet="Arme sans lore" onLireLore={() => {}} />);
  ok("bouton : objet SANS Lore → RIEN n'est rendu (pas de bouton, pas de ligne vide)", sansLore === "", sansLore.slice(0, 200));
  const loreVide = renderToStaticMarkup(<BoutonLireLore db={dbBouton as never} itemHash={6005} nomObjet="Arme lore vide" onLireLore={() => {}} />);
  ok("bouton : Lore SANS corps → RIEN n'est rendu (rien à lire)", loreVide === "", loreVide.slice(0, 200));
  const sansDb = renderToStaticMarkup(<BoutonLireLore db={null} itemHash={6001} nomObjet="Izanagi — Burden" onLireLore={() => {}} />);
  ok("bouton : sans Manifest → RIEN n'est rendu, sans erreur", sansDb === "", sansDb.slice(0, 200));
  ok("bouton : la prop `onLireLore` est acceptée (signature `(itemHash, nomObjet)`)", typeof BoutonLireLore === "function");
}


// --- ⚠️ AJOUT (21/10/2026, suite 10) : NAVIGATION PAR LIVRES (hiérarchie en jeu : catégorie → livre → pages, couvertures) ---
// Rendu STATIQUE du sous-composant ArbreCategories + de ColonneSections avec la prop `categories`.
{
  const catLumiere: CategorieLore = {
    hash: 100,
    titre: "La Lumière",
    icone: "/icons/lumiere.png",
    livres: [
      livre("legendes-livre:1000", "La Frontière sans foi ni loi", [
        page("lore:8001", "Ces terres maudites", "Texte de la première page."),
        page("lore:8002", "Par cette langue, soyez damnés", "Texte de la deuxième page."),
      ]),
      livre("legendes-livre:1001", "Histoires de Spectres", [
        page("lore:8003", "Une histoire de Spectre", "Texte du Spectre."),
      ]),
    ],
  };
  // couverture sur le premier livre, pas sur le second
  catLumiere.livres[0].couvertureUrl = "https://www.bungie.net/icons/frontiere.png";
  catLumiere.livres[0].categorie = "La Lumière";
  catLumiere.livres[1].categorie = "La Lumière";
  const cattenebres: CategorieLore = {
    hash: 200,
    titre: "Les Ténèbres",
    livres: [livre("legendes-livre:2000", "Légendes des oubliés, Vol.\u00a01", [page("lore:8005", "Europe \u2013 1", "Lore de l'item.")])],
  };
  cattenebres.livres[0].categorie = "Les Ténèbres";

  const arbre = renderToStaticMarkup(<ArbreCategories categories={[catLumiere, cattenebres]} pageId="lore:8001" onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />);
  ok("⚠️ suite 10 : l'arbre rend les catégories dans l'ordre (data-categorie), avec leurs titres en tête de section",
    arbre.includes('data-categorie="100"') && arbre.includes('data-categorie="200"') && arbre.indexOf("La Lumière") < arbre.indexOf("Les Ténèbres") && arbre.includes('data-categorie-titre=""'), arbre.slice(0, 300));
  ok("⚠️ suite 10 : l'icône de catégorie est rendue (URL complète Bungie) quand présente",
    arbre.includes('src="https://www.bungie.net/icons/lumiere.png"'), arbre.slice(0, 500));
  ok("⚠️ suite 11 : les catégories sont REPLIÉES PAR DÉFAUT (aria-expanded=false, pas de liste de livres visible)",
    (arbre.match(/aria-expanded="false"/g) ?? []).length === 2 && !arbre.includes('data-livres-categorie=""'), arbre.slice(0, 500));
  ok("⚠️ suite 11 : les titres de catégories sont cliquables (boutons data-categorie-titre, replier/déplier)",
    (arbre.match(/data-categorie-titre=""/g) ?? []).length === 2 && arbre.includes('data-categorie-replier=""'), arbre.slice(0, 300));
  ok("⚠️ suite 11 : AUCUNE image de couverture dans le menu de sélection (pas de data-couverture-livre, pas de <img> de livre) — les titres de livres ne s'affichent pas repliés",
    !arbre.includes('data-couverture-livre=""') && !arbre.includes('data-couverture-absente=""') && !arbre.includes('src="https://www.bungie.net/icons/frontiere.png"') && !arbre.includes("La Frontière sans foi ni loi"), arbre.slice(0, 600));
  ok("⚠️ suite 10 : l'icône de CATÉGORIE (petite, 14px) est toujours rendue quand présente",
    arbre.includes('src="https://www.bungie.net/icons/lumiere.png"'), arbre.slice(0, 500));

  // ColonneSections avec categories : la section legendes active affiche l'arbre (pas la liste plate)
  const colonneHierarchie = renderToStaticMarkup(
    <ColonneSections section="legendes" livres={[catLumiere.livres[0]]} categories={[catLumiere, cattenebres]} pageId="lore:8001" grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
  );
  ok("⚠️ suite 10+11 : ColonneSections — la section « legendes » active affiche L'ARBRE (data-arbre-categories), pas la liste plate (data-livres absent), et les catégories y sont REPLIÉES",
    colonneHierarchie.includes('data-arbre-categories=""') && !colonneHierarchie.includes('data-livres=""') && colonneHierarchie.includes('aria-expanded="false"'), colonneHierarchie.slice(0, 400));
  ok("⚠️ suite 10 : ColonneSections — les 4 sections restent dans l'ordre verrouillé même avec l'arbre",
    JSON.stringify([...colonneHierarchie.matchAll(/data-section="([^"]+)"/g)].map((m) => m[1])) === JSON.stringify(["grimoire", "legendes", "objets", "cosmetiques"]));

  // ColonneSections SANS categories (repli Manifest vieilli) : retombe sur la liste plate
  const colonnePlate = renderToStaticMarkup(
    <ColonneSections section="legendes" livres={[catLumiere.livres[0]]} pageId="lore:8001" grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
  );
  ok("⚠️ suite 10 : ColonneSections — SANS categories (repli), la section « legendes » retombe sur la LISTE PLATE (data-livres, pas d'arbre)",
    colonnePlate.includes('data-livres=""') && !colonnePlate.includes('data-arbre-categories=""'), colonnePlate.slice(0, 400));

  // ZoneLecture : œilleton avec catégorie + couverture en haut de page
  const livreAvecCat = livre("legendes-livre:1000", "La Frontière sans foi ni loi", [page("lore:8001", "Ces terres maudites", "Texte.")]);
  livreAvecCat.couvertureUrl = "https://www.bungie.net/icons/frontiere.png";
  livreAvecCat.categorie = "La Lumière";
  const zoneLivre = renderToStaticMarkup(<ZoneLecture section="legendes" livre={livreAvecCat} page={livreAvecCat.pages[0]} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />);
  ok("⚠️ suite 10 : zone de lecture — l'œilleton affiche « catégorie · livre » (La Lumière · La Frontière sans foi ni loi)",
    texte(zoneLivre).includes("La Lumière · La Frontière sans foi ni loi"), texte(zoneLivre).slice(0, 300));
  ok("⚠️ suite 10 : zone de lecture — la COUVERTURE du livre est affichée EN HAUT de la page (data-couverture-page, avant le titre)",
    zoneLivre.includes('data-couverture-page=""') && zoneLivre.indexOf('data-couverture-page=""') < zoneLivre.indexOf("Ces terres maudites") && zoneLivre.indexOf('data-couverture-page=""') > zoneLivre.indexOf('data-nav-haut=""'), zoneLivre.slice(0, 600));
  // Sans couverture ni catégorie : rien ne change (livres des autres sections)
  const zoneSans = renderToStaticMarkup(<ZoneLecture section="objets" livre={livre("objets-armes", "Lore des armes", [page("lore:7101", "Izanagi", "Texte.")])} page={page("lore:7101", "Izanagi", "Texte.")} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />);
  ok("⚠️ suite 10 : zone de lecture — un livre sans catégorie/couverture (section objets) n'affiche NI œilleton double NI couverture (inchangé)",
    !zoneSans.includes('data-couverture-page=""') && texte(zoneSans).includes("Lore des armes") && !texte(zoneSans).includes("Lore des armes · Lore des armes"));

  // Résultats de recherche : la catégorie s'affiche
  const resCat = renderToStaticMarkup(<ResultatsRecherche motCle="frontière" resultats={[resultat("legendes", livreAvecCat, livreAvecCat.pages[0])]} onOuvrir={() => {}} />);
  ok("⚠️ suite 10 : recherche — le résultat affiche la catégorie (Légendes D2 · La Lumière · La Frontière sans foi ni loi)",
    texte(resCat).includes("Légendes D2 · La Lumière · La Frontière sans foi ni loi"), texte(resCat));
}


// --- ⚠️ AJOUT (22/10/2026, suite 11) : GROUPES REPLIABLES (repliés par défaut) + PAS D'IMAGES dans le menu de sélection ---
// ⚠️ CHANGÉ (22/10/2026, suite 12) : les ARMES ne sont plus dans un groupe « Lore des armes » mais en REPLIABLES DE NOMS (`listePages`) ; les ARMURES restent groupées (« Ensembles d'armures »).
{
  // Livres comme le modèle suite 12 : armes = listePages (Cinétiques/Énergétiques), armures = groupe « Ensembles d'armures »
  const livreCin = livre("objets-armes-cinetique", "Cinétiques", [page("lore:7101", "Izanagi", "Texte."), page("lore:7102", "Ace of Spades", "Texte.")]);
  livreCin.listePages = true;
  const livreEner = livre("objets-armes-energie", "Énergétiques", [page("lore:7201", "Fusil énergie", "Texte.")]);
  livreEner.listePages = true;
  const livreRaid = livre("objets-armures-Armure du raid A", "Armure du raid A", [page("lore:7301", "Casque raid A", "Texte.")]);
  livreRaid.groupe = "Ensembles d'armures";
  const livreAutres = livre("objets-armures-autres", "Autres armures", [page("lore:7401", "Casque sans provenance", "Texte.")]);
  livreAutres.groupe = "Ensembles d'armures";
  const livresGroupe = [livreCin, livreEner, livreRaid, livreAutres];

  const colonneObjets = renderToStaticMarkup(
    <ColonneSections section="objets" livres={livresGroupe} pageId="lore:7101" grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
  );
  ok("⚠️ suite 12 : la section « objets » affiche les REPLIABLES DE NOMS des armes (data-liste-pages, data-groupe = type) + le groupe « Ensembles d'armures » (data-groupe), PAS de groupe « Lore des armes »",
    colonneObjets.includes('data-liste-pages=""') && colonneObjets.includes('data-groupe="Cin\u00e9tiques"') && colonneObjets.includes('data-groupe="\u00c9nerg\u00e9tiques"') && colonneObjets.includes('data-groupe="Ensembles d&#x27;armures"') && !colonneObjets.includes('Lore des armes') && colonneObjets.includes('data-liste-livres=""'),
    colonneObjets.slice(colonneObjets.indexOf('data-section="objets"')));
  ok("⚠️ suite 12 : les repliables (armes ET armures) sont REPLIÉS PAR DÉFAUT (aria-expanded=false, ni les noms d'objets ni les titres de livres ne sont visibles)",
    (colonneObjets.match(/aria-expanded="false"/g) ?? []).length === 3 && !colonneObjets.includes('data-page="lore:7101"') && !colonneObjets.includes('data-livre="objets-armes-cinetique"') && !colonneObjets.includes(">Izanagi<") && !colonneObjets.includes(">Armure du raid A<"),
    colonneObjets.slice(colonneObjets.indexOf('data-section="objets"')));
  ok("⚠️ suite 12 : les titres de repliables/groupes sont cliquables (boutons data-groupe-titre) avec le compteur total de pages JUSTIFIÉ À DROITE (margin-left:auto)",
    (colonneObjets.match(/data-groupe-titre=""/g) ?? []).length === 3 && (colonneObjets.match(/margin-left:auto/g) ?? []).length >= 3 && colonneObjets.includes("2 pages") && colonneObjets.includes("1 page"),
    colonneObjets.slice(0, 800));

  // ⚠️ suite 12 : LIGNE DE LIVRE = titre + compteur SUR UNE LIGNE (nowrap + ellipsis sur le titre, compteur à droite) — testé via la liste plate (Grimoire D1)
  const colonneGrimoire = renderToStaticMarkup(
    <ColonneSections section="grimoire" livres={[livre("grimoire-livre:Guardian", "Gardiens", [page("grimoire:1", "Carte 1", "Texte."), page("grimoire:2", "Carte 2", "Texte.")])]} pageId="grimoire:1" grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
  );
  ok("⚠️ suite 12 : sans groupe ni listePages (Grimoire D1), la liste reste PLATE (data-livres, pas de data-groupe) et chaque livre est sur UNE LIGNE (nowrap + ellipsis, compteur justifié à droite)",
    colonneGrimoire.includes('data-livres=""') && !colonneGrimoire.includes('data-groupe="') && colonneGrimoire.includes('data-livre="grimoire-livre:Guardian"') && colonneGrimoire.includes("white-space:nowrap") && colonneGrimoire.includes("text-overflow:ellipsis") && colonneGrimoire.includes("margin-left:auto") && colonneGrimoire.includes("2 pages"),
    colonneGrimoire.slice(0, 600));

  // Section label : majuscule à "Armures"
  const colonneLabels = renderToStaticMarkup(
    <ColonneSections section="objets" livres={[]} pageId={null} grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} onOuvrirPage={() => {}} />
  );
  ok("⚠️ suite 11 : le libellé de section est « Armes et Armures » (majuscule à Armures, remarque utilisateur)",
    colonneLabels.includes("Armes et Armures") && !colonneLabels.includes("Armes et armures"), colonneLabels.slice(0, 600));
}


// --- ⚠️ AJOUT (22/10/2026, suite 12) : COUVERTURE FLOTTANTE (haut gauche, taille naturelle, pas de pixellisation) ---
{
  const livreAvecCouv = livre("legendes-livre:1000", "La Frontière sans foi ni loi", [page("lore:8001", "Ces terres maudites", "Texte de la page.")]);
  livreAvecCouv.couvertureUrl = "https://www.bungie.net/icons/frontiere.png";
  livreAvecCouv.categorie = "La Lumière";
  const pageCouv = page("lore:8001", "Ces terres maudites", "Texte de la page.", { porteurs: [{ hash: 6001, nom: "Izanagi", emplacement: "Fusil" }] });
  const zoneCouv = renderToStaticMarkup(<ZoneLecture section="legendes" livre={livreAvecCouv} page={pageCouv} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />);
  const iBaliseCouv = zoneCouv.indexOf('data-couverture-page=""');
  const baliseCouv = zoneCouv.slice(iBaliseCouv, zoneCouv.indexOf("/>", iBaliseCouv));
  ok("⚠️ suite 12 : la couverture est FLOTTANTE EN HAUT À GAUCHE (float:left, max-width:45%) — le texte s'écoule à droite puis continue dessous (PAS de width:100%, PAS d'object-fit:cover → plus de pixellisation)",
    zoneCouv.includes('data-couverture-page=""') && baliseCouv.includes("float:left") && baliseCouv.includes("max-width:45%") && baliseCouv.includes("height:auto") && !baliseCouv.includes("width:100%") && !baliseCouv.includes("object-fit"),
    baliseCouv);
  ok("⚠️ suite 12 : la couverture n'est JAMAIS agrandie au-delà de sa taille naturelle (pas de width forcée hors max-width, pas de min-width) — une image petite s'affiche telle quelle",
    !baliseCouv.replace("max-width:45%", "").includes("width:") && !baliseCouv.includes("min-width"),
    baliseCouv);
  ok("⚠️ suite 12 : le parcours inverse et la nav du BAS portent clear:both — RIEN ne remonte à côté de l'image (pas de superposition, pas de « colonne » réservée)",
    (zoneCouv.match(/clear:both/g) ?? []).length >= 2 && zoneCouv.indexOf('data-parcours-inverse=""') > iBaliseCouv && zoneCouv.indexOf('data-nav-bas=""') > zoneCouv.indexOf('data-parcours-inverse=""'),
    { clear: (zoneCouv.match(/clear:both/g) ?? []).length });
  ok("⚠️ suite 12 : la couverture reste EN HAUT de la page (après data-nav-haut, avant le titre de la page)",
    iBaliseCouv > zoneCouv.indexOf('data-nav-haut=""') && iBaliseCouv < zoneCouv.indexOf("Ces terres maudites"),
    { iCouv: iBaliseCouv, iNav: zoneCouv.indexOf('data-nav-haut=""') });
  // Sans parcours inverse : la nav du bas porte quand même clear:both (ne remonte pas à côté de l'image)
  const zoneCouvSansInv = renderToStaticMarkup(<ZoneLecture section="legendes" livre={livreAvecCouv} page={livreAvecCouv.pages[0]} idPrecedente={null} idSuivante={null} onOuvrirPage={() => {}} />);
  const iNavBas = zoneCouvSansInv.indexOf('data-nav-bas=""');
  ok("⚠️ suite 12 : sans parcours inverse, la nav du BAS porte clear:both (la couverture flottante ne crée pas de colonne à sa droite jusqu'en bas)",
    !zoneCouvSansInv.includes('data-parcours-inverse=""') && zoneCouvSansInv.slice(iNavBas, zoneCouvSansInv.indexOf(">", iNavBas)).includes("clear:both"),
    zoneCouvSansInv.slice(iNavBas, iNavBas + 200));
}

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);

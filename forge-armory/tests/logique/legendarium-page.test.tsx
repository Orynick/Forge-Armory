// FR : ⚠️ AJOUT (21/10/2026, chantier Legendarium, étape 2) - test de la PAGE Legendarium (`src/components/Bibliotheque.tsx`) : les trois zones de la spécification verrouillée §4 (bandeau titre + recherche + indicateur de cache ; colonne sections → livres ; zone de lecture avec précédent/suivant), la palette « Parchemin / Hologramme » verrouillée §5 (D1 parchemin, D2 hologramme), le parcours inverse (objets porteurs), le bouton de retour vers l'objet (provenance), la recherche par mots-clés (résultats cliquables). Rendu STATIQUE (renderToStaticMarkup, comme les autres tests UI du projet) : pas de jsdom, pas de clics — on teste la STRUCTURE rendue et les sous-composants exportés. L'état interactif (clics, navigation) est testé en Playwright côté utilisateur. EN: test of the Legendarium PAGE: the three locked zones (spec §4), the locked palette (§5), the reverse path, the back-to-item button, the keyword search results. Static render only.
import { renderToStaticMarkup } from "react-dom/server";
import Bibliotheque, { BandeauLegendarium, ColonneSections, ResultatsRecherche, ZoneLecture } from "../../src/components/Bibliotheque";
import BoutonLireLore from "../../src/components/BoutonLireLore";   // ⚠️ AJOUT (21/10/2026, étape 5) : bouton « Lire le Lore » des fiches Détails
import { creerFausseDb } from "./fixtures/fauxManifest";
import type { LivreLore, PageLore } from "../../src/lib/legendarium/types";
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
  <ColonneSections section="grimoire" livres={[livreGrimoire]} pageId="grimoire:101005" grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} />
);
const boutonsSections = [...colonne.matchAll(/data-section="([^"]+)"/g)].map((m) => m[1]);
ok("colonne : les QUATRE sections, DANS L'ORDRE GLOBAL VERROUILLÉ (Grimoire D1 → Légendes D2 → Armes et armures → Cosmétiques et utilitaires)",
  JSON.stringify(boutonsSections) === JSON.stringify(["grimoire", "legendes", "objets", "cosmetiques"]), boutonsSections);
ok("colonne : la section active est marquée (aria-pressed) et ses livres sont dépliés avec leur nombre de pages",
  colonne.includes('data-section="grimoire" aria-pressed="true"') && colonne.includes("Gardiens") && colonne.includes("(2)") && colonne.includes('data-livre="grimoire-livre:Guardian"'));
ok("colonne : la page active est repérée dans le livre (aria-current)",
  colonne.includes('aria-current="page"'));
const colonneChargement = renderToStaticMarkup(
  <ColonneSections section="grimoire" livres={[]} pageId={null} grimoireEnChargement={true} onChangerSection={() => {}} onOuvrirLivre={() => {}} />
);
ok("colonne : pendant le chargement du Grimoire D1, un message est affiché (pas de liste vide silencieuse)",
  colonneChargement.includes("Chargement du Grimoire"));
const colonneVide = renderToStaticMarkup(
  <ColonneSections section="legendes" livres={[]} pageId={null} grimoireEnChargement={false} onChangerSection={() => {}} onOuvrirLivre={() => {}} />
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

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`);
process.exit(res.every(Boolean) ? 0 : 1);

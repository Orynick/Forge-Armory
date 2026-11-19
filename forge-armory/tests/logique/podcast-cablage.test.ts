// FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64) - test de CÂBLAGE du
// lecteur podcast (lit le TEXTE du code + teste les fonctions pures du bus).
// Le lecteur flottant lit des MP3 EMBARQUÉS (public/podcast/) via un élément
// <audio> : la lecture relève de la directive CSP `media-src`. La CSP de
// production ne déclare PAS media-src : `default-src 'self'` couvre par repli
// (CSP3). Ce test vérifie que la CSP reste intacte et que rien ne restreint
// media-src sous 'self'. On teste aussi la convention de nommage, le bus en
// mémoire, et que les MP3 personnels sont ignorés par git.
// EN: ADDED (draft-podcast branch) - wiring test of the podcast player (reads
// the code TEXT + tests the bus' pure functions). The floating player reads
// EMBEDDED MP3s (public/podcast/) through an <audio> element: playback falls
// under the CSP `media-src` directive. The production CSP does NOT declare
// media-src: `default-src 'self'` covers it by fallback (CSP3). This test
// checks the CSP stays intact and nothing restricts media-src below 'self'.
import fs from "node:fs";
import { nomFichierPourPage, urlPourPage, publierPagePodcast, usePagePodcast, demanderPageSuivante, prendreDemandePageSuivante, demanderRetourPageCourante, prendreDemandeRetour } from "../../src/lib/legendarium/podcast";

const res: boolean[] = [];
const ok = (nom: string, cond: unknown, detail?: unknown) => { res.push(!!cond); console.log(cond ? "✅" : "❌", nom); if (!cond && detail !== undefined) console.log("   détail :", String(detail).slice(0, 500)); };

// ---------- 1. Convention de nommage (spec §2, verrouillée) ----------
ok("CÂBLAGE : `lore:<hash>` → `lore-<hash>.mp3` (le `:` est remplacé par `-`, interdit sous Windows)",
  nomFichierPourPage("lore:1716568313") === "lore-1716568313.mp3", nomFichierPourPage("lore:1716568313"));
ok("CÂBLAGE : `grimoire:<idCarte>` → `grimoire-<idCarte>.mp3`",
  nomFichierPourPage("grimoire:603020342") === "grimoire-603020342.mp3", nomFichierPourPage("grimoire:603020342"));
ok("CÂBLAGE : un identifiant hors convention (ex: `item:123`) ne produit AUCUN fichier (pas de devinette)",
  nomFichierPourPage("item:123") === null && nomFichierPourPage("") === null && nomFichierPourPage("lore:") === "lore-.mp3" ? false : nomFichierPourPage("item:123") === null);
ok("CÂBLAGE : l'URL audio est un chemin RELATIF sous `podcast/` (base `./` du build, fonctionne en dev + Electron app://)",
  urlPourPage("lore:42") === "podcast/lore-42.mp3" && urlPourPage("grimoire:7") === "podcast/grimoire-7.mp3", urlPourPage("lore:42"));
ok("CÂBLAGE : l'URL d'une page hors convention est null (jamais de chemin cassé)",
  urlPourPage("item:123") === null);

// ---------- 2. Bus en mémoire (publication / demandes de navigation) ----------
{
  publierPagePodcast(null);
  let recu: unknown = "témoin";
  // on teste via un effet de bord manuel : publierPagePodcast notifie les abonnés (usePagePodcast est un hook React, non testable hors rendu — on vérifie le bus indirectement par les demandes de navigation, pures).
  demanderPageSuivante("lore:99");
  ok("BUS : `demanderPageSuivante` mémorise la page suivante, `prendreDemandePageSuivante` la consomme UNE FOIS",
    prendreDemandePageSuivante() === "lore:99" && prendreDemandePageSuivante() === null);
  publierPagePodcast({ id: "lore:5", titre: "Titre", livre: "Livre", idSuivante: "lore:6" });
  demanderRetourPageCourante();
  ok("BUS : `demanderRetourPageCourante` mémorise la DERNIÈRE page publiée (pas une page quelconque)",
    prendreDemandeRetour() === "lore:5" && prendreDemandeRetour() === null);
  publierPagePodcast(null);
  demanderRetourPageCourante();
  ok("BUS : sans page publiée, `demanderRetourPageCourante` ne mémorise RIEN (pas de retour vers une page fantôme)",
    prendreDemandeRetour() === null);
}

// ---------- 3. CSP : media-src couvert par default-src 'self' ----------
const vite = fs.readFileSync("vite.config.ts", "utf-8");
const blocCsp = vite.slice(vite.indexOf("const CSP_PRODUCTION"), vite.indexOf("].join"));
ok("CÂBLAGE : la CSP de production conserve `default-src 'self'` (couvre media-src par repli CSP3 : les MP3 embarqués sont lisibles)",
  /"default-src 'self'"/.test(blocCsp));
ok("CÂBLAGE : la CSP ne déclare PAS de directive media-src restrictive (rien ne bloque <audio> sur 'self')",
  !/media-src/.test(blocCsp), blocCsp.match(/"[^"]*media-src[^"]*"/));
ok("CÂBLAGE : la CSP ne déclare PAS de directive media-src du tout (repli propre sur default-src)",
  !/"[^"]*media-src/.test(blocCsp));
ok("CÂBLAGE : connect-src reste limité à 'self' + la liste blanche (l'index podcast est lu en local, aucun réseau externe)",
  blocCsp.includes("connect-src 'self' https://www.bungie.net https://api.destinyitemmanager.com https://api.github.com"));

// ---------- 4. Le lecteur est monté au-dessus du routeur (App.tsx) ----------
const app = fs.readFileSync("src/App.tsx", "utf-8");
ok("CÂBLAGE : App.tsx monte <LecteurPodcast /> (au-dessus des Routes : visible sur toutes les vues)",
  /<LecteurPodcast\s*\/>/.test(app) && app.indexOf("<LecteurPodcast") > app.indexOf("</Routes>"));

// ---------- 5. Le Legendarium publie sa page courante ----------
const biblio = fs.readFileSync("src/components/Bibliotheque.tsx", "utf-8");
ok("CÂBLAGE : Bibliotheque publie la page courante au lecteur (`publierPagePodcast`) avec id + titre + livre + idSuivante",
  /publierPagePodcast\(\{ id: pageActive\.id, titre: pageActive\.titre, livre: livreActif\.titre, idSuivante \}\)/.test(biblio));
ok("CÂBLAGE : Bibliotheque publie `null` au démontage (le lecteur redevient invisible hors Legendarium)",
  /return \(\) => \{ publierPagePodcast\(null\); \};/.test(biblio));
ok("CÂBLAGE : Bibliotheque consomme la page podcast en attente du parent (`onPagePodcastConsommee`) après résolution du lien profond",
  /onPagePodcastConsommee\?\.\(\)/.test(biblio));

// ---------- 6. DashboardPage : bascule de vue sur demande du lecteur ----------
const dash = fs.readFileSync("src/pages/DashboardPage.tsx", "utf-8");
ok("CÂBLAGE : DashboardPage s'abonne aux demandes de navigation du lecteur (`useDemandeNavigationLegende`) et bascule la vue vers `bibliotheque`",
  /useDemandeNavigationLegende\(/.test(dash) && /setVue\("bibliotheque"\)/.test(dash));
ok("CÂBLAGE : DashboardPage transmet la page podcast en attente à Bibliotheque (`pagePodcastEnAttente`) et la remet à zéro (`onPagePodcastConsommee`)",
  /pagePodcastEnAttente/.test(dash) && /onPagePodcastConsommee=\{\(\) => setPagePodcastEnAttente\(null\)\}/.test(dash));

// ---------- 7. Le lecteur : élément <audio>, contrôles, réductible, enchaînement ----------
const lecteur = fs.readFileSync("src/components/LecteurPodcast.tsx", "utf-8");
ok("CÂBLAGE : le lecteur utilise UN élément <audio> (source = MP3 embarqué, chemin relatif `podcast/…`)",
  /<audio /.test(lecteur) && /audio\.src = `podcast\/\$\{f\}`/.test(lecteur));
ok("CÂBLAGE : le lecteur est FLOTTANT (position fixed, zIndex au-dessus du contenu) et RÉDUCTIBLE (pastille)",
  /position: "fixed"/.test(lecteur) && /zIndex: 900/.test(lecteur) && /data-reduit/.test(lecteur) && /data-lecteur-reduire/.test(lecteur));
ok("CÂBLAGE : le lecteur a les contrôles ▶/⏸, ⏹, ⏭ et une barre de progression",
  /data-lecteur-lecture/.test(lecteur) && /data-lecteur-arreter/.test(lecteur) && /data-lecteur-suivant/.test(lecteur) && /data-lecteur-progression/.test(lecteur));
ok("CÂBLAGE : le clic sur le titre demande le retour à la page courante (`demanderRetourPageCourante`)",
  /demanderRetourPageCourante\(\)/.test(lecteur));
ok("CÂBLAGE : la fin d'un fichier enchaîne sur la page suivante via le bus (`demanderPageSuivante`) SI elle a un audio",
  /onEnded=\{gererFin\}/.test(lecteur) && /demanderPageSuivante\(page\.idSuivante\)/.test(lecteur) && /index\?\.has\(page\.idSuivante\)/.test(lecteur));
ok("CÂBLAGE : le lecteur indique « pas d'enregistrement » quand la page n'a pas de MP3 (lecture texte seule)",
  /data-lecteur-sans-audio/.test(lecteur));

// ---------- 8. Confidentialité : les enregistrements personnels ne sont pas versionnés ----------
const gitignore = fs.readFileSync(".gitignore", "utf-8");
ok("CÂBLAGE : .gitignore exclut les MP3 personnels (`public/podcast/*.mp3`) et l'index généré (`public/podcast/index.json`)",
  /^public\/podcast\/\*\.mp3$/m.test(gitignore) && /^public\/podcast\/index\.json$/m.test(gitignore));
ok("CÂBLAGE : le script de génération de l'index existe et lit UNIQUEMENT le dossier local (aucune publication)",
  fs.existsSync("scripts/generer-index-podcast.mjs") && !/fetch\(|https?:\/\//.test(fs.readFileSync("scripts/generer-index-podcast.mjs", "utf-8")));
ok("CÂBLAGE : la structure vide de l'index est versionnée (`index.modele.json`) et le README de convention existe",
  fs.existsSync("public/podcast/index.modele.json") && fs.existsSync("public/podcast/README.md"));

// ---------- 9. Le bus ne fait AUCUNE persistance ni écriture réseau ----------
const bus = fs.readFileSync("src/lib/legendarium/podcast.ts", "utf-8");
ok("CÂBLAGE : le bus ne touche NI localStorage NI sessionStorage NI IndexedDB (mémoire module uniquement)",
  !/localStorage|sessionStorage|indexedDB|openDB/.test(bus));
ok("CÂBLAGE : le bus ne fait qu'UN SEUL fetch (l'index `podcast/index.json`, sur 'self') — jamais d'écriture réseau",
  (bus.match(/fetch\(/g) ?? []).length === 1 && /fetch\("podcast\/index\.json"\)/.test(bus));

console.log(`\n${res.filter(Boolean).length}/${res.length} contrôles réussis`); process.exit(res.every(Boolean) ? 0 : 1);

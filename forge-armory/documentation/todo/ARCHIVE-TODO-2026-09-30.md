# Archive de la TODO — état complet au 30/09/2026 (avant tri)

FR : copie INTÉGRALE, mot pour mot, de `TODO.md` avant le tri du 30/09/2026
demandé par l'utilisateur (« enlever de la TODO ce qui a été fait ; le
CHANGELOG contient tous les changements »). Conservée pour ne perdre aucune
remarque : les sections terminées retirées de la TODO sont ici telles
qu'elles étaient. Ne pas modifier : c'est une trace historique.
EN: FULL verbatim copy of TODO.md before the 30/09/2026 cleanup.

---

# TODO — D2 Build Analyzer

Priorités :
- 🔴 **Bloquant** — fausse le résultat ou empêche d'avancer
- 🟡 **Important** — limite la valeur de l'appli
- 🔵 **Confort / plus tard**

Pour l'historique de ce qui a été fait, voir `CHANGELOG.md`.
Pour la conception du scoring (pondérations, calibration), voir la section
« Le scoring » du `README.md`.
Pour ce qui reste à tester, voir `A-TESTER.pdf`.

---

## 🧭 Prochaines étapes — ordre validé le 21/09/2026

> Plan validé par l'utilisateur le **21/09/2026**, dans cet ordre (révisé
> le même jour : ajout du logiciel installable ; la vérification de ce qui
> est livré et la calibration des barèmes sont passées dans `A-TESTER.pdf`,
> car elles se font en jouant). Le détail de chaque chantier reste dans les
> sections plus bas.

**Bloquant : aucun.** L'appli fonctionne de bout en bout (connexion,
inventaire, doctrine, scoring des 5 piliers).

✅ **Filtre anti-dialogue dans la recherche Manifest — TERMINÉ le
24/09/2026.** Le filtre (exclusion du texte d'ambiance `flavorText`,
codé le 24/08) est confirmé en jeu par l'utilisateur ; le diagnostic
`diagnosticCheminsJson` est archivé, conservé pour rouvrir le sujet si
une réplique réapparaît. Détail dans `CHANGELOG.md`.

✅ **Expiration de la connexion — CODÉE le 24/09/2026**, reste à vérifier
en jeu (`A-TESTER.pdf`). Une session expirée est détectée (`etatSession`),
les jetons sont effacés, l'appli repasse en « non connecté » et affiche
une bannière expliquant qu'il suffit de se reconnecter. Un bouton de test
(mode dev) permet de simuler l'expiration sans attendre une heure. Détail
dans `CHANGELOG.md`.

✅ **Logiciel installable (Windows) — FAIT et CONFIRMÉ le 26/09/2026
(v0.2.1).** Installateur NSIS, icône, connexion Bungie et stockage
(Manifest, builds) validés dans l'application INSTALLÉE. Piste restante si
besoin un jour : écran de réglages dans l'appli pour saisir clé et
identifiant, utile surtout pour les invités.

✅ **Partage des builds — FAIT du 26 au 28/09/2026 (v0.2.2 à v0.2.8).**
Export d'un build seul, fiche « 👁 Voir », copie en texte, export
infographique JPEG/PNG/PDF fidèle à la maquette v7, et bloc « Partage du
build » pour exporter sans enregistrer. Détail dans `CHANGELOG.md`.

✅ **Pondération personnalisée des piliers — FAITE le 28/09/2026
(v0.2.8).** Réglages nommés, total de 100 %, mode Automatique conservé.
Conception dans le `README.md` (section « Pondération personnalisée »).

**1. Suites de l'audit externe du 26/09/2026** — à faire APRÈS validation
des tests de la 0.2.0
- **Mettre Electron à niveau** (actuellement `^32.0.0`, branche hors
  support). Opération contrôlée et isolée : ne pas la mêler à d'autres
  changements, et retester connexion + fabrication ensuite. Important car
  la fenêtre de connexion affiche une page distante (bungie.net).
- **Ajouter une politique de sécurité de contenu (CSP)**, à écrire puis
  tester pas à pas : une CSP trop stricte casse silencieusement les appels
  Bungie, le WebAssembly de sql.js ou les images distantes.
- **Vérifier `npm ci`** comme test de reproductibilité une fois le
  `package-lock.json` régénéré par un `npm install` complet.

**Ordre de marche fixé par l'utilisateur le 30/09/2026 :**
1. tester toute la v0.2.9 (`A-TESTER.pdf`) ;
2. mettre Electron à niveau (point 1 ci-dessous) ;
3. modifier les perks et les mods (point 2), en reprenant au passage les
   fenêtres de détails des armes et armures.

**2. Modifier les perks et les mods des armes et armures** — 🟡
*indispensable à terme, pas bloquant aujourd'hui* (demande de
l'utilisateur, 28/09/2026). Détail en section 1 bis plus bas, avec les
défauts des fenêtres de détails à corriger à cette occasion.

✅ **2 bis. Export infographique : nettoyage des listes, disposition,
police — FAIT le 29/09, VALIDÉ le 30/09/2026 (v0.2.8).** Extension des
mêmes règles à la fiche « 👁 Voir » et à la copie en texte, et perks
d'artefact justifiés : faits le 30/09, en test. Détail en section 1
quater plus bas.

**3. Agent IA** — ⏸️ *en attente d'une décision, volontairement*
- ✅ **Document d'architecture retrouvé et intégré** (26/09/2026) :
  `documentation/agent-ia/ARCHITECTURE-AGENT-IA.md`. Il vivait dans une autre conversation du
  projet, d'où son absence des archives jusqu'ici.
- 🔴 **À trancher AVANT toute ligne de code** : l'IA est-elle pour
  l'utilisateur seul, ou aussi pour ses amis ? Une clé d'API IA se
  retrouve dans le `.exe` fabriqué (comme la clé Bungie), sauf qu'ici
  **chaque appel est facturé**. Les 3 options et leurs conséquences sont
  détaillées dans `documentation/agent-ia/ARCHITECTURE-AGENT-IA-NOTES.md`.
- ⏸️ **Mise en attente assumée** : Bungie a annoncé (semaine du 26/09) que
  Destiny sort de son statut de fin de service. L'ampleur des évolutions à
  venir est inconnue et peut changer les besoins de l'agent (recherche Web,
  base documentaire). Attendre d'y voir clair est un choix, pas un oubli.
- 💡 **Bonne nouvelle pour la reprise** : les étapes 1 à 3 du document sont
  presque déjà faites — `BuildDraft` et `evaluerBuild` constituent déjà
  l'interface interne stable qu'il réclame.
- 📌 Deux ajouts à faire au document lors de la reprise (l'IA ne doit pas
  pouvoir contredire le score ; les appels doivent partir du processus
  principal, pas de la page) — détaillés dans le fichier de notes.

**En parallèle, en jouant → voir `A-TESTER.pdf`** : vérifier ce qui est
livré mais jamais vu tourner, et calibrer les barèmes du Pilier 2.

⏸️ **En attente d'une décision** : l'agent IA (voir section plus bas et
`documentation/agent-ia/ARCHITECTURE-AGENT-IA-NOTES.md`) — une question de fond doit être
tranchée, et le contexte Destiny vient de changer.

**Autres points ouverts, hors de ces étapes** : vitrine « Solo sans
mourir » — ajouter les exotiques de raid obtenues (section 3, noté le
24/09) ; anti-champion — bonus
de set comme 4e source (section 2) ; le Saut n'est pas lu par
l'extraction de texte du Pilier 2 (section 1, impact probablement
faible) ; confort / plus tard (sections 3 à 8).

---

## 🔴 Bloquant

*Aucun.*

---

## 🟡 Important — chantiers de fond

### -1. ✅ RÉSOLU ET VÉRIFIÉ (06/09) — lecture de description sur perk lié

✅ **Corrigé** : `extraireTextesDoctrineBuild`/`extraireTextesEffetsBuild`
(`verbes.ts`) ne lisaient que `displayProperties.description` DIRECTEMENT
sur l'objet Manifest, alors que les ASPECTS ont très souvent cette
description vide — le vrai texte vit sur un PERK LIÉ (`perks[].perkHash`).
Le sélecteur de doctrine (affichage) gérait déjà ce cas depuis début août
via `obtenirDescriptionComplete` ; le scoring, jamais mis à jour en
conséquence, en divergeait silencieusement depuis 3 semaines. Trouvé par
l'utilisateur en testant "Esquive furtive" (Pilier 2 : "Aucun verbe
détecté" malgré "Invisible" surligné en cyan à l'écran). Détail complet
du diagnostic dans `CHANGELOG.md`.

✅ **VÉRIFIÉ SUR DONNÉES RÉELLES (06/09/2026)** via le bouton de
diagnostic ajouté le 31/08 : sur "Esquive furtive", la lecture directe
renvoie 0 caractère (VIDE) et `obtenirDescriptionComplete` renvoie bien
les 29 caractères du texte réel (1 perk lié). L'hypothèse était donc
bonne et le correctif fonctionne — "Invisibilité" apparaît maintenant
dans les Verbes d'élément. Diagnostic archivé (`diagnosticPilier2:
false`), code conservé.

📌 **Reste à faire** :
- ✅ ~~Retester les 4 autres cas~~ — **confirmés par l'utilisateur le
  06/09** (Sentinelle ionique, Facette de détermination, Murmure de liens,
  Fil de transmutation).
- Vérifier qu'aucun AUTRE endroit du code ne fait la même lecture directe
  sans passer par `obtenirDescriptionComplete` (recherche rapide :
  `grep -rn "displayProperties?.description" src/`) — seul
  `verbes.ts` a été corrigé cette fois, la même erreur pourrait exister
  ailleurs si un autre chemin de lecture a été écrit indépendamment.
  ✅ **Vérifié (27/08)** — la plupart des autres occurrences lisent soit
  un PERK directement (correct, pas d'aspect concerné), soit des données
  d'arme/armure/exotique (a priori peu concernées par le motif "description
  vide, texte réel sur un perk lié" qui est spécifique aux Aspects/
  Fragments/Catalyseurs). 2 points restent à surveiller, non corrigés
  faute d'impact confirmé :
  - `rechercherManifest` (`search.ts`) : la recherche plein texte indexe
    le JSON brut de CHAQUE objet, qui ne contient que des `perkHash`
    (références), pas le texte du perk lui-même — un aspect/fragment dont
    le texte réel ne vit QUE sur un perk lié pourrait donc rester
    introuvable par recherche plein texte, même s'il matche bien pour le
    Pilier 2 (qui, lui, résout maintenant le perk). Pas de correctif
    tenté : nécessiterait de joindre `DestinySandboxPerkDefinition`
    pendant l'indexation, un changement plus large sur un chemin
    fréquemment utilisé.
  - `extraireArtefactActif` (`doctrine.ts`) : l'outil d'export des 147
    perks d'artefact lit la description directement, sans le même repli.
    Si un perk d'artefact partage un jour ce motif (peu probable, les
    perks d'artefact semblent généralement auto-suffisants,
    contrairement aux Aspects), l'export produirait un texte vide à
    transcrire dans `data/artefacts.ts`. Aucun signe que ce soit déjà
    arrivé sur les 7 artefacts déjà traduits.

---

### 0. ✅ FAIT (06/09) — Réorganisation du scoring

Ordre, renommages et source unique livrés. Détail complet dans
`CHANGELOG.md`. En résumé : nouvel ordre (Élément et Doctrine → Artefact →
Armes et Armures → Effets du Build → Statistiques), pondérations
inchangées, et création de `src/data/piliers.ts` comme source unique après
avoir découvert une TROISIÈME copie des libellés non repérée le 26/08
(`PilierCarte.tsx`).

✅ **Tranché par l'utilisateur (06/09) : plafond à 75, les autres piliers à 100.** Pour mémoire, la réflexion qui a précédé :

**Durcir vraiment le Pilier 1 ?** Son plafond est passé
de 100 à **75** (valeur choisie par l'utilisateur le 06/09 ; les 4 autres
piliers restent à 100), ce qui corrige l'impression de « sans-faute »
trop facile.
Mais c'est un recalibrage uniforme : le classement relatif entre deux
builds est inchangé. Pour réellement relever l'exigence il faudrait un
critère SUPPLÉMENTAIRE et distinct, et aucun candidat trouvé ne fait pas
doublon avec « Effets du Build » (verbes produits) ou « Statistiques »
(malus des fragments). **Décision à prendre par l'utilisateur** : se
contenter du recalibrage, ou trouver un critère propre à ce pilier.

### 1. Pilier 2 — chaînes de verbes et notation FAITES, tests en cours

✅ **Le mécanisme est codé** (25/08) : `detecterChainesVerbes` et
`detecterRessourcesGenerees` (`verbes.ts`), branchées sur le Pilier 2.
Catalogue complété à 38 verbes (grenades Titan/Arcaniste ajoutées), 17
liens `produit` vérifiés. Parcours en largeur (BFS) : un verbe atteint par
la chaîne peut en produire d'autres, même sans source propre dans le texte
— l'exemple de la grenade Arcaniste (Ralentissement → Gel « par ricochet »)
fonctionne.

📌 **Reste à faire** :
- **Tester en conditions réelles** — pas exécutable dans l'environnement
  de développement (pas de `node_modules`, réseau désactivé). Script
  `scripts/tester-avec-fixtures.mjs` étendu et prêt, fixture dédiée ajoutée
  (hash 4, `test-fixtures/manifest-mock.json`). Les tests se font donc en
  jeu, via `A-TESTER.pdf`.

⚠️ **Le paragraphe qui disait ici "la notation est volontairement
reportée" a été retiré le 06/09 : il était PÉRIMÉ depuis le 26/08**, date
à laquelle la notation a effectivement été branchée (voir plus bas dans
cette même section). Laissé tel quel, il contredisait le reste du fichier.

✅ Le lien conditionnel Embrasement → Blessure solaire (Tison de Charbon)
est comblé depuis le 25/08 — description officielle transmise par
l'utilisateur, codé et vérifié.

✅ **Chantier TERMINÉ le 26/08** (tous les éléments, voir plus bas). Énoncé d'origine : audit des fragments des 5
éléments classiques, pour repérer d'éventuels AUTRES liens conditionnels
non encore documentés — Tison de Charbon en était le premier exemple.
Portée estimée : 40 à 60 fragments (communs aux 3 classes, une seule fiche
par fragment), pas des centaines.

✅ **Solaire fait** (25/08, 15 fragments) : 1 nouveau lien codé (Feu
follet → Restauration), 3 productions de ressource conditionnelles
codées.

✅ **Cryo-électrique fait** (26/08, 16 fragments) : 5 nouvelles entrées
codées (dont une auto-référence, Cécité → Cécité).

✅ **Audit des fragments TERMINÉ** (26/08) : Stase (16), Filobscur (14
propres + 2 doublons Abyssal), Abyssal (14 propres + les 2 doublons) et
Prismatique (21, exclusifs à cette sous-classe — correction d'une
hypothèse fausse du 25/08) tous passés en revue. 20 nouveaux liens/
ressources codés dans `elementVerbs.ts`, vérifiés par typecheck isolé
(`tsc --noEmit`, 0 erreur). Détail complet dans
`knowledge-base/25_AUDIT_FRAGMENTS.md`, résumé dans
`knowledge-base/22_CHAINES_DE_VERBES.md`.

✅ **Notation branchée sur les chaînes et ressources (26/08)** : le trou
identifié (verbe atteint uniquement par ricochet, mal classé en "payoff
orphelin") est corrigé — `enrichirAvecChaines` (`verbes.ts`) reconnaît
désormais ces verbes comme sourcés pour le score. Bonus de +6 pts par type
de ressource distinct confirmé actif (plafonné à 20), volontairement
modeste face à une boucle complète (35 pts). Détail complet dans
`knowledge-base/22_CHAINES_DE_VERBES.md`, section "Notation du Pilier 2".
Vérifié par typecheck isolé complet (stubs sql.js/idb/fflate), 0 erreur.

📌 **Reste à faire** :
- **Retester en conditions réelles, checklist en cours** — le tout premier
  test utilisateur (26/08, point 1 de la checklist) a immédiatement
  révélé un bug bloquant : la mêlée stasique était classée en "payoff
  orphelin" malgré une source réelle et visible (cyan), ce qui cassait
  TOUTE la chaîne Ralentissement→Gel→Brisure→Armure de givre. ✅ Corrigé
  le même jour dans `sourcePayoff.ts` (retrait de marqueurs payoff bruts
  trop larges — voir `CHANGELOG.md` pour le détail complet du diagnostic
  et du correctif). **Les 2 autres points de la checklist n'ont pas encore
  été retestés** suite à cette correction — priorité pour la prochaine
  session : reprendre `A-TESTER.pdf` depuis le début du point 1.
- **Tester en conditions réelles** — toujours pas exécuté dans
  l'environnement de développement (pas de `node_modules`, réseau
  désactivé ; `node --experimental-strip-types` échoue sur les imports
  réels de `sql.js`/`idb`/Vite, confirmant que ce script attend bien un
  vrai `npm install`, comme documenté depuis le début). `scripts/tester-
  avec-fixtures.mjs` étendu avec un test dédié (Gel/Brisure : absent →
  source_seule, +24 pts) qui s'exécutera dès qu'un `npm install` sera
  possible.
- ✅ **Logique validée isolément** (26/08) : la logique pure de
  `calculerConfiance`/`enrichirAvecChaines` a été rejouée dans un script
  Node autonome (sans dépendances sql.js/idb), avec les VRAIS textes de
  `test-fixtures/manifest-mock.json` — confirme le comportement attendu à
  l'unité près (Ralentissement source_seule=12, Dévoration boucle=35,
  Gel/Brisure absent→source_seule +12 chacun, delta total +24). Ne
  remplace pas un test en conditions réelles (le vrai pipeline
  extraction→détection→chaîne n'est pas exercé de bout en bout), mais
  couvre la partie qui a changé.
- Confirmer avec l'utilisateur que le barème choisi (+6/type, plafond 20)
  semble juste une fois vu sur des builds réels — c'est un choix motivé
  mais pas testé en jeu, contrairement aux 35/12/18 déjà éprouvés depuis
  le 04/08.
- ⚠️ **Le correctif du 26/08 sur `sourcePayoff.ts` mérite lui-même un test
  ciblé** : vérifié isolément sur des formulations plausibles (pas le texte
  exact en jeu). Si un verbe se retrouve encore classé en "payoff
  orphelin" à tort après ce correctif, transmettre le texte EXACT affiché
  en jeu pour cette aptitude, pour ajuster précisément plutôt que deviner.

✅ **Passe d'audit du scoring effectuée (26/08)** — relecture des 5
fichiers de `src/lib/scoring/` (2229 lignes), 4 bugs corrigés + 1
optimisation. Détail complet dans `CHANGELOG.md`. En résumé : barème
orphelin incohérent (un build défectueux notait moins qu'un build vide),
synergie d'artefact aveugle aux accents (30 % du Pilier 3 sous-évalué),
vérification des liens conditionnels trop fragile (échec silencieux au
moindre écart de transcription), et point chaud du Pilier 2 optimisé.
Vérifiés sans bug au passage : pondérations (1.00 dans les 4 contextes),
bornes hautes des Piliers 1/4, traitement des armes cinétiques.

📌 **Point de vigilance issu de l'audit** : la vérification des conditions
(`conditionVerifiee`, `verbes.ts`) est passée d'une correspondance
mot-pour-mot à une correspondance par mots significatifs. C'est plus
robuste, mais le seul risque du correctif est un lien qui s'activerait à
tort. Trois garde-fous ont été testés (fragment absent, autre verbe, mots
éparpillés entre deux textes — tous correctement refusés), mais si un
`⛓️` apparaît pour un fragment NON équipé, c'est le premier endroit à
regarder.

✅ **Premiers tests utilisateur (26/08, après les correctifs) — 3 nouveaux
bugs trouvés et corrigés**, tous liés à la chaîne Prismatique qui ne
démarrait jamais :
- Mêlée stasique : ✅ confirmé réglé par l'utilisateur.
- "Facette de détermination" n'affichait rien → coquille de terminologie
  sur `charge_armure` ("orbe de pouvoir" au lieu de "orbe de puissance",
  le vrai terme du jeu utilisé dans les 17 descriptions transcrites lors
  de l'audit). Corrigé.
- Build Arcaniste Prismatique (grenade Singularité Glacée) : Neutralisation
  et Ralentissement restaient "indéterminés" → DEUX bugs cumulés : (1)
  asymétrie source/payoff dans `sourcePayoff.ts` (marqueurs source
  cherchés seulement AVANT le mot-clé, jamais après — cassait tout texte
  "Nom — Description" où le mot-clé EST le nom) ; (2) Transcendance
  elle-même ne pouvait jamais être "source" car son texte réel ne décrit
  qu'un payoff auto-entretenu, jamais un marqueur qui l'applique — nouveau
  champ `sourceImplicite` sur `VerbeCatalogue` pour les verbes d'IDENTITÉ
  de capacité (Transcendance, grenades prismatiques), marqué sur ces 4
  entrées. Les 3 corrections ont été vérifiées ENSEMBLE sur un test
  d'intégration utilisant les vraies fonctions du projet (pas des
  extraits isolés) : la chaîne complète se propage maintenant jusqu'à Gel
  et Brisure. Détail complet dans `CHANGELOG.md`.

✅ **Confirmé par l'utilisateur le 06/09** (Singularité glacée : « appliqué mais rien n'en profite », conforme). Énoncé d'origine : les 3 correctifs ci-dessus
n'ont été vérifiés que par script isolé (texte de Transcendance réel
utilisé, mais texte de la grenade "Singularité Glacée" inconnu — testé
avec juste son nom, le cas le plus défavorable, qui fonctionne déjà). Un
retest en conditions réelles sur ce build précis confirmerait que le vrai
texte de la grenade ne pose pas un problème supplémentaire non anticipé.

✅ **Nouveau bouton de diagnostic ajouté (26/08)** : "🔍 Copier les
compétences de cette doctrine" dans `GrilleDoctrine.tsx`, dump texte de
TOUTES les options de Super/Mêlée/Grenade/Saut/Compétence de classe/
Aspects d'une sous-classe (fragments exclus, déjà couverts par l'audit à
captures d'écran). Demande de l'utilisateur, suite au constat que les
mêlées/grenades/compétences de classe sont le texte le MOINS bien classé
aujourd'hui — ce sont des descriptions DÉFINITIVES de ce qu'applique une
capacité équipée, contrairement aux aspects/fragments qui expriment de
vraies synergies conditionnelles. Détail dans `CHANGELOG.md`.

✅ **Audit des 387 compétences EFFECTUÉ (26/08)** : l'utilisateur a
transmis les 18 fichiers via le bouton de diagnostic (3 classes × 6
éléments). Rejouées à travers le vrai moteur de détection (harnais
isolé, aucun mock) : 233→237 source_seule, 15→13 payoff orphelin, 7→8
boucle après 4 correctifs (gérondifs manquants, contamination
inter-phrase dans la fenêtre de 55 caractères, variante "sous les
effets", mot-clé "invisible" manquant — celui-ci avait fait complètement
rater "Esquiver vous rend invisible.", une capacité de BASE du Chasseur).
Détail complet du diagnostic et de chaque correctif dans `CHANGELOG.md`.
Les 13 orphelins restants sont soit corrects en isolation (sourcés par
une AUTRE capacité de la même doctrine, absente du texte testé seul),
soit des ambiguïtés de sens non résolubles sans grammaire complète.

✅ **2 des ambiguïtés de sens corrigées (26/08, plus tard le même jour)** :
proposition de l'utilisateur — coder ces exceptions ponctuellement
plutôt que d'assouplir les marqueurs globalement. Nouveau champ
`sourcesForcees` sur `VerbeCatalogue`, même principe de vérification que
les liens `produit` conditionnels (phrase-signature vérifiée, jamais
supposée). Codé pour `suppression` ("Enfant des dieux anciens") et
`charge_armure` ("Tir de l'ombre : Carquois de Moebius") — les 2 seuls
cas où l'ambiguïté touchait un marqueur (vaincre/affecté par) utilisé
dans un sens générique. Les 11 autres orphelins restants (Amplifié,
Enchevêtrement, Secousse/Cécité) n'ont PAS besoin de ce traitement : ils
sont déjà corrects, juste sourcés par un texte que le test isolé ne
voyait pas.

📌 **Changement d'architecture DÉPRIORISÉ** : la session précédente
prévoyait de faire porter l'origine du texte (mêlée/grenade/classe vs
aspect/fragment) jusqu'à `detecterVerbes`. Au vu du résultat de l'audit
(63% du corpus déjà correctement classé source/boucle après les
correctifs ciblés, seulement 3,4% de vrais cas ambigus restants),
l'approche par marqueurs textuels précis s'avère suffisante — le
changement d'architecture plus lourd n'est plus jugé nécessaire dans
l'immédiat. À revisiter seulement si de nouveaux cas d'ambiguïté
s'accumulent.

📌 **Découverte annexe (26/08)** : le Saut (`sautHash`) est bien suivi dans
`SubclassConfig` depuis le début, mais `extraireTextesDoctrineBuild` ne le
lit jamais — contrairement à Super/Mêlée/Grenade/Classe/Aspects/Fragments.
Les textes de Saut ONT été reçus dans l'audit (catégorie SAUT présente
dans les 18 fichiers) mais volontairement PAS analysés dans cette passe
(hors scope initial de "verbes qui produisent des effets" — les sauts
n'en ont typiquement aucun). À revisiter si un saut exotique/spécifique
s'avère avoir un effet de debuff/buff qui mériterait d'être capté.

### 1 ter. Afficher le type de munitions des armes

✅ **FAIT le 30/09/2026 (v0.2.9), en test** — avancé à la demande de
l'utilisateur (« le moment est venu »), sans attendre le moteur de dégâts.
Fait comme prévu ci-dessous : une seule fonction de lecture
(`obtenirTypeMunition`, `doctrine.ts`, champ `equippingBlock.ammoType`),
une seule table de couleurs (`MUNITIONS`, `IconeMunition.tsx`), un
composant partagé (`IconeMunitionArme`, `RenduTextePerk.tsx`) ; affiché
partout à droite de l'icône d'élément (Inventaire, Mon Build, fenêtres de
détails, fiche « 👁 Voir », exports) et écrit dans la copie en texte.
Reste à faire plus tard : le « bonus possible » (départager les deux
lance-grenades par ce champ plutôt que par l'emplacement). Historique de
la décision ci-dessous. Demande d'origine de l'utilisateur (28/09/2026) :
à faire quand le moteur de dégâts serait prêt à être testé. Munitions principales,
spéciales ou lourdes, affichées pour chaque arme.

**Icônes : déjà prêtes.** Intégrées le 24/08/2026 dans
`src/components/icones/IconeMunition.tsx` (clés `munition_principale`,
`munition_speciale`, `munition_lourde`), en attente d'utilisation.
Vérifié le 28/09/2026 : identiques aux trois SVG fournis à nouveau par
l'utilisateur (mêmes cadres, mêmes tracés). Rien à ajouter.

**Source de l'information : le Manifest.** D'après la documentation de
l'API Bungie, la définition d'un objet (`DestinyInventoryItemDefinition`)
porte le type de munitions dans `equippingBlock.ammoType` : 1 = principales,
2 = spéciales, 3 = lourdes ; 0 (aucun) ou 4 (inconnu) → ne rien afficher.
**À confirmer sur de vraies armes** lors de l'implémentation. Le projet ne
lit ce champ nulle part aujourd'hui.

**Où le lire** : là où l'icône d'élément d'une arme est déjà remplie
(`elementArmeIcone`, `src/lib/bungie/inventaire.ts`). Point d'attention :
les builds déjà enregistrés n'auront pas ce nouveau champ. Plus robuste :
le retrouver via le Manifest à partir de `itemHash` au moment de
l'affichage, ce qui marche aussi pour les anciens builds et les builds
importés d'un ami.

**Affichage demandé** : icône **à droite de l'icône d'élément**, avec des
alignements soignés. Dans l'export infographique, la ligne sous le nom de
chaque arme deviendrait : type d'arme → élément → **munitions** →
anti-champion, dans un emplacement de taille fixe comme les autres, et
alignement vérifié par mesure (même méthode qu'en v0.2.6).

**Portée confirmée par l'utilisateur (28/09/2026) : PARTOUT** où l'icône
d'élément d'une arme apparaît — Mon Build, Inventaire, fiche « 👁 Voir »,
export infographique (JPEG/PNG/PDF), et tout nouvel endroit qui
afficherait l'élément d'une arme (moteur de dégâts compris). Pour que
tous ces endroits restent cohérents, prévoir une seule fonction de
résolution du type de munitions et un seul composant d'affichage,
partagés (même principe que `trouverFormeTypeArme`).

**Couleurs choisies par l'utilisateur (28/09/2026), après aperçu comparé
de quatre variantes : variante B, « couleurs du jeu, violet moyen ».**

| Munitions | Couleur | Contraste sur `#161922` (appli, fiche) | sur `#171b23` (carte export) | sur `#0b0e13` (fond export) |
|---|---|---|---|---|
| Principales | `#e8e8e5` (blanc cassé) | 14,3:1 | 14,0:1 | 15,7:1 |
| Spéciales | `#7fd97f` (vert) | 10,1:1 | 10,0:1 | 11,2:1 |
| Lourdes | `#9d6bff` (violet moyen) | 5,0:1 | 4,9:1 | 5,5:1 |

Écartées : le violet foncé du jeu (`#7b4fd6`, 3,2 à 3,6:1, à la limite de
lisibilité à 16 px), le violet éclairci (`#b794ff`) et le tout-gris. Point
connu et accepté : sur une arme lourde abyssale, l'icône d'élément est
violette elle aussi ; les deux restent distinctes par la forme (les icônes
de munitions ont 1, 2 ou 3 cartouches dans un cadre). Ces couleurs sont à
passer via la propriété `couleur` du composant `IconeMunition` (couleur par
défaut actuelle : `#b7b3a8`), idéalement dans une table unique partagée par
tous les endroits d'affichage.

**Bonus possible** : `ammoType` distingue sans ambiguïté les deux
lance-grenades (spéciaux / lourds). La reconnaissance actuelle
(`trouverFormeTypeArme`) les départage par l'emplacement de l'arme ; elle
pourrait s'appuyer sur ce champ, plus fiable.

### 1 quater. Export infographique : nettoyage des listes, disposition, police

✅ **FAIT le 29/09 et VALIDÉ le 30/09/2026 (v0.2.8)** pour les exports (ornements
compris). Portée étendue ensuite par l'utilisateur (30/09/2026) : les
mêmes règles s'appliquent à la **fiche « 👁 Voir » et à la copie en
texte** (liste nettoyée commune dans `fiche.ts`, armature et origine à
part, doublons « ×2 ») ; **Mon Build et l'Inventaire restent inchangés**.
Ajouts du même jour : « Emplacement de souvenance vide » écarté ; perks
d'artefact en rangées équilibrées et justifiées (7 → 3 puis 4). En test. Ce qui a été fait (détail dans `CHANGELOG.md`) :
- A : classification des plugs (`obtenirPlugsDetailles`, `NaturePlug`,
  `doctrine.ts`) ; « Memento Mori » protégé (le mot « memento » n'est
  jamais cherché dans le nom) ; ornements reconnus aussi par le type et la
  catégorie du plug — ⚠️ **non vérifié sur de vrais objets**, à confirmer
  au premier export ;
- B : armature (lue comme pour l'anti-champion, `obtenirArmatureArme`)
  puis particularité d'origine sous la ligne d'icônes ;
- C : textes agrandis d'environ 20 % (davantage pour les plus petits),
  colonne du nom d'arme élargie, mods en double regroupés (« ×2 ») ;
  mesuré sur un build réel : aucun texte ne gagne de ligne.
Perks d'artefact : sur deux rangées, désormais équilibrées et justifiées
à la demande de l'utilisateur (voir plus haut).

Décisions et constats d'origine, conservés ci-dessous pour mémoire. Image de référence :
export réel du build « DPS/heal Tommy Crackshot » (fait en 0.2.7), fourni
par l'utilisateur. Ordre conseillé : A, puis B, puis C (le nettoyage libère
la place nécessaire pour agrandir le texte).

**A. Nettoyage des perks et mods affichés**

Armes — à **supprimer** :
- « Emplacement de mémento vide » ;
- « Arme façonnée ».
(Un mémento réellement inséré n'a pas été évoqué : à décider le moment
venu.)

Armures — à **garder** :
- « Mod de classe », « Mods d'arme » (emplacements de mods, même vides) ;
- les réglages de statistiques « +Super / -Santé » et assimilés : ils
  changent les statistiques.

Armures — à **supprimer** :
- « Spécialiste » et les autres archétypes du même genre ;
- « Amélioration d'armure » ;
- les revêtements et les ornements.

⚠️ Point technique : le filtre actuel des cosmétiques, par mots-clés
(`MOTS_PERK_COSMETIQUE`, `doctrine.ts`), laisse passer des ornements
(« Veste de détective perspicace », « Poings de détective perspicace »
sur l'image de référence). S'appuyer plutôt sur la **catégorie du plug
indiquée par le Manifest** (type d'objet, catégorie de plug), à vérifier
sur de vrais objets avant de coder.

**Portée à confirmer avec l'utilisateur** : le tri se fait dans
`obtenirPerksArmeNommes`, commune à la fiche « 👁 Voir », à sa copie en
texte, à l'export, et aussi aux icônes de perks de Mon Build et de
l'Inventaire (`calculerIconesPerksArme` s'appuie dessus). Le nettoyage
s'appliquerait donc partout, sauf décision de le limiter à l'export.

**B. Nouvelle disposition des armes dans l'infographie exportée**

Au minimum dans l'infographie exportée (JPEG/PNG/PDF) ; pour la fiche
« 👁 Voir », l'utilisateur vérifiera d'abord ce qu'il souhaite. Sous le nom
de chaque arme :
1. la ligne d'icônes : type d'arme → élément → (munitions, section 1 ter)
   → anti-champion ;
2. dessous, le **type d'armature** (ex. « Armature de déni de zone »,
   « Armature de lanceur ») ;
3. dessous, la **particularité d'origine** (ex. « Transposeur
   radiolaire », « Promptitude »).
Les « Perks actifs » ne gardent alors que les vrais perks. La particularité
d'origine est déjà reconnue à part (`obtenirPerksArmeNommes`) ;
l'armature reste à reconnaître de façon fiable (catégorie Manifest, ou
liste de `knowledge-base/21_ARMATURES_ANTI_CHAMPION_EN_FR.md`), à vérifier.

**C. Agrandir le texte de l'infographie**

Sans casser l'agencement (page de 900 px capturée à l'échelle 2) ni créer
de retours à la ligne non désirés. Priorité aux plus petits textes : mods
de l'armure (8 px), étiquettes « ARME CINÉTIQUE », « MODS »… (7 à 7,5 px),
perks (10 px). Vérification par mesure, bloc par bloc, sur un vrai build
comme l'image de référence : hauteur des lignes, aucun retour à la ligne
supplémentaire, alignements conservés.

**Question laissée ouverte** : afficher aussi les icônes d'élément (au
lieu du nom écrit) dans la fiche « 👁 Voir », comme dans l'export ?
Proposé le 27/09, pas encore tranché.

### 1 bis. Modifier les perks et les mods des armes et armures

🟡 **Indispensable à terme, pas bloquant aujourd'hui.** Demande de
l'utilisateur du 28/09/2026. Prévu APRÈS la mise à niveau d'Electron
(ordre de marche du 30/09/2026).

**À reprendre à cette occasion : fenêtres de « Détails » des armes et
armures** (Inventaire et Mon Build), qui ont leur propre logique d'affichage
(`texteSurvol`, `obtenirDescriptionComplete`, catégories de sockets) et ne
profitent pas encore du nettoyage fait pour les fiches. Défauts relevés
par l'utilisateur le 30/09/2026 :
- des **mémentos** s'affichent, alors qu'il faut les retirer — ⚠️ en
  gardant « **Memento Mori** » (As de Pique), qui est un vrai perk utile
  (réutiliser `obtenirPlugsDetailles` et sa protection, `doctrine.ts`) ;
- la **« résonance de Souvenance »** s'affiche (nom à vérifier sur l'objet
  réel ; probablement un plug lié aux souvenances, à écarter comme les
  cosmétiques) ;
- **doublons dans les « mods utilisables »**, peut-être liés à la pièce
  maîtresse : à diagnostiquer sur un objet réel avant de corriger (la
  cause n'est pas encore établie).


**Ce qui est demandé** : pouvoir changer les perks d'une arme et les mods
d'une arme ou d'une armure, **sauf** les ornements, les revêtements
(shaders) et les compteurs (trackers de victimes, etc.), qui n'ont aucun
effet sur le build.

**Deux niveaux à distinguer, à trancher avec l'utilisateur avant de coder :**
1. **Dans l'appli seulement** (simulation) : modifier les perks/mods d'une
   pièce dans le build, pour voir l'effet sur la fiche et le score, sans
   rien toucher en jeu. Faisable entièrement côté appli ; le score relit
   déjà les `perkHashes` de chaque pièce.
2. **En jeu** : appliquer réellement le changement sur l'objet. À étudier :
   l'API Bungie propose une action d'insertion de plug gratuite
   (`InsertSocketPlugFree`), utilisée par d'autres outils ; ses conditions
   exactes (quels plugs sont autorisés, droits OAuth nécessaires, coûts en
   matériaux exclus) sont **à vérifier dans la documentation de Bungie**
   avant toute promesse.

**Points de conception déjà identifiés :**
- ne proposer que les options réellement possibles : les colonnes de
  perks **obtenues** sur cet exemplaire pour une arme, les mods débloqués
  compatibles avec l'emplacement pour une armure ;
- réutiliser le filtre existant des cosmétiques (`MOTS_PERK_COSMETIQUE`,
  `doctrine.ts`) pour écarter ornements, revêtements et compteurs, plutôt
  qu'une deuxième liste ;
- les builds enregistrés gardent leurs `perkHashes` ; `rafraichirStats`
  (PanneauLoadouts) les remplace aujourd'hui par ceux de l'exemplaire réel
  au chargement : à revoir, sinon une modification faite dans l'appli
  serait écrasée.

### 2. Capacités de doctrine anti-champion — 10 verbes couverts, d'autres à confirmer ?

La 3e source anti-champion est implémentée avec 10 verbes confirmés par
citation en jeu. Les autres verbes du catalogue n'ont pas de champion
associé — soit parce qu'ils n'en étourdissent aucun, soit parce que
l'information n'a pas encore été vérifiée.

**Action possible** : au fil des parties, si un verbe non listé étourdit
visiblement un Champion, le signaler pour l'ajouter (`championEtourdi` dans
`elementVerbs.ts`).

📌 **Bonus de set comme 4e source** : envisagé le 25/08, non codé — à la
connaissance de l'utilisateur, aucun bonus de set n'étourdit de Champion
actuellement. Pas de double comptage à craindre si le cas se présente (un
bonus de set n'est couvert par aucune des 3 sources actuelles). À ajouter
si un exemple réel est rencontré en jeu.

---

## 🔵 Confort / plus tard

### 3. Vitrine « Solo sans mourir » — ajouter les exotiques de raid obtenues

Demande de l'utilisateur (24/09/2026) : afficher dans l'onglet vitrine les
**icônes des armes exotiques de raid déjà obtenues**.

⚠️ À cadrer avant de coder — ce n'est pas la même mécanique que l'existant :
- La vitrine actuelle repose sur `src/data/triomphesSoloFlawless.ts`, une
  table de **donjons** (hash de triomphe + hash d'emblème), alimentée par
  les triomphes du profil. Les exotiques de **raid** sont une autre
  famille : il faudra une seconde table, et vérifier par quelle donnée on
  sait qu'une arme est obtenue (triomphe d'obtention ? présence dans le
  coffre/collection ? — la **Collection** semble la piste la plus fiable,
  car une arme peut être supprimée de l'inventaire sans être « perdue »).
- Décider du périmètre : toutes les exotiques de raid, ou seulement celles
  des raids encore disponibles ?
- Décider de l'affichage : à côté des emblèmes de donjon, ou dans une
  section distincte ? (Les deux listes n'ont pas le même sens : l'une
  atteste d'un exploit solo, l'autre d'une obtention.)
- Les hashes devront être relevés via les outils de diagnostic existants,
  comme pour les emblèmes — pas recopiés de mémoire.

### 4. Armatures d'armes encore inconnues

`ARMATURE_VERS_CHAMPION` couvre 21 armatures. Le tableau EN/FR complet
(`knowledge-base/21_ARMATURES_ANTI_CHAMPION_EN_FR.md`) identifie
**Pinpoint Slug Frame** (fusils à pompe à munition unique) comme
explicitement manquante, plus 2 mots-clés du code sans correspondance
Destinypedia connue (`interruption`, `attaque`).

**Pour chaque armature rencontrée avec un repère « ? »** : transmettre le
nom d'armature (au survol) et le champion affiché en jeu.

### 5. Vérifications ponctuelles notées mais non traitées

- **Ergo Sum** (épée exotique à perk variable) : les 3 perks observés
  (Héraut de l'Orage → Bloqueur, Sursis imprévu → Surchargé, Munitions Meute
  de loups → Bloqueur) devraient déjà être gérés par la détection exotique
  existante, qui lit le perk actif. **Non vérifié sur données réelles.**
- **« Raidance »** : coquille de « Radiance » dans 2 fichiers sources
  (Outillage de sécurité, Encensoir). Sans impact sur la détection, à
  corriger si ces fichiers sont réutilisés.

### 6. Archétypes d'armure — 12 confirmés en jeu, prêts pour la recommandation

Pas utilisé pour NOTER (le Pilier 5 note déjà les stats réelles). **Conservé
pour une future RECOMMANDATION** (décision de l'utilisateur) : « pour ce build
grenade, cherchez plutôt du bon archétype ».

✅ **Les 12 archétypes et leurs paires de stats sont confirmés par
l'utilisateur depuis le jeu** (voir le tableau complet, noms anglais et
français, dans `08_GAME_MECHANICS.md`, section « Armor 3.0 » ; déplacé
depuis `23_RESSOURCES_EXTERNES.md` le 28/09/2026) : Spécialiste, Parangon, Mitrailleur,
Grenadier, Pugnace, Rempart, Colosse, Démolisseur, Brise-siège, Pilleur,
Maître, Escarmoucheur — chacun avec un principal (30 pts en T5) et un
secondaire (25 pts), plus une troisième stat aléatoire (20 pts).

📌 Correction du 25/08 : ma conclusion précédente (« le système a été
remplacé entre deux extensions ») était fausse — il s'est simplement
étendu, les 6 premiers archétypes existent toujours. Voir le détail complet
dans le fichier de ressources.

✅ Confirmé en jeu (25/08) : Santé+Arme, Mêlée+Grenade et Super+Classe
n'ont délibérément AUCUN archétype — les 12 recensés sont la liste
complète, pas une liste incomplète.

### 7. Icônes de munitions — intégrées, en attente d'utilisation

4 icônes ajoutées le 05/08 (munitions lourdes/spéciales/principales, dégâts
cinétiques — cette dernière déjà utilisée). Les 3 icônes de munitions
sont disponibles dans `IconeMunition.tsx`. ✅ **Utilisées depuis la
v0.2.9 (30/09/2026)** : type de munitions de chaque arme, partout, avec
les couleurs choisies par l'utilisateur — voir la section 1 ter.

### 8. Icônes des 21 perks par artefact — abandonné, incompatibilité confirmée

Envisagé le 25/08 (le champ `icone` existait déjà dans l'extraction de
l'artefact actif, juste jamais renvoyé). Testé le 26/08 sur Outillage de
Curiosité : `DestinyArtifactDefinition` (la table lue par cette
extraction) n'expose que l'ANCIEN système d'artefact — 5 paliers, 35
perks, un seul artefact actif par saison. Les 35 perks extraits ne
correspondaient à AUCUN des 21 déjà en code. Confirmé par l'utilisateur
comme un souci déjà rencontré, pas une confusion d'artefact.

**Abandonné pour l'instant** — pas de piste alternative connue tant que
Bungie n'aura pas remis cette table à jour pour le système actuel (7
artefacts, 3 paliers chacun).

### 9. Export DIM — optionnel, mis de côté

📌 **Précisé le 25/08** : ce chantier est désormais **optionnel**, pas
bloquant. L'équipement direct depuis l'appli (transfert + équipement,
avec réparation automatique des loadouts périmés) couvre le même besoin —
l'utilisateur peut équiper un build sans jamais passer par DIM.

Échec en 401 puis 400 sans détail exploitable. Alternative envisagée : gestion
d'inventaire « maison » (transferts coffre ↔ personnages), à étudier
seulement si un besoin précis que l'équipement direct ne couvre pas
apparaît.

---

### 10. Patch notes de Bungie dans la knowledge-base

🔵 **Plus tard.** Demande de l'utilisateur du 28/09/2026 : ajouter à
`knowledge-base/` un répertoire contenant les transcriptions des patch
notes publiées par Bungie.

**Pistes de conception, à valider au moment de s'y mettre :**
- premier sous-répertoire de la knowledge-base : ✅ **créé le 28/09/2026**
  sous le nom `knowledge-base/27_PATCHNOTES/` (le numéro 26 a été pris le
  même jour par `26_ARMES_ARMURES.md`), avec son `LISEZ-MOI.md` et une
  entrée dans `00_INDEX.md`. Il contient déjà le récapitulatif de la
  9.7.0 fourni avec la base d'origine (anciennement
  `monument_of_triumph_recap.md`) ;
- un fichier par mise à jour, nommé `AAAA-MM-JJ_<version>.md` pour qu'ils
  se rangent d'eux-mêmes dans l'ordre chronologique ;
- en tête de chaque fichier : titre officiel, date de publication, lien
  vers la page source sur bungie.net, langue de la transcription ;
- ne pas l'inclure dans l'archive « invité », comme le reste de la
  documentation interne.

**Utilité attendue :** repérer quand une mise à jour rend obsolète une
donnée du projet (multiplicateurs de `01_DAMAGE_STACKING.md` pour le
moteur de dégâts, armatures anti-champion, artefacts, fragments) ; servir
de source à l'agent IA, dont l'ordre de recherche prévu passe par la
knowledge-base avant Bungie et le Web.

**Décisions de l'utilisateur (28/09/2026) :**
- **Claude produit les fiches**, à partir des pages officielles de
  bungie.net ;
- **en français ET en anglais**, pour faire facilement le lien avec les
  Manifest FR et EN ;
- **à partir de la sortie de l'extension La Forme Finale** (*The Final
  Shape*, juin 2024), puis chaque nouvelle mise à jour ;
- **ordre ANTI-CHRONOLOGIQUE** (précisé le 28/09/2026) : les fiches les
  plus récentes, donc les plus pertinentes pour le jeu actuel, sont
  produites en premier ; on remonte ensuite jusqu'à La Forme Finale.

⚠️ **Forme retenue : des fiches, pas des copies intégrales.** Les patch
notes sont des textes de Bungie protégés par le droit d'auteur : Claude ne
les recopie pas mot pour mot. Chaque mise à jour fait l'objet d'une fiche
rédigée avec ses propres mots, qui reprend tous les faits utiles (ce qui
change, chiffres avant/après, objets concernés), avec le lien vers la page
officielle pour le texte complet. Format plus exploitable qu'un texte
brut pour le rapprochement avec les Manifest : chaque objet cité y figure
avec son nom français ET son nom anglais.

**Format envisagé d'une fiche** (à valider sur la première produite) :
en-tête (titre officiel FR/EN, date, version, liens des deux pages
sources), puis une section par catégorie (armes, armures, sous-classes,
artefacts, modificateurs, activités...), chaque changement sur une ligne :
nom FR / nom EN, nature du changement, valeurs avant → après.

**Mise en route proposée** : produire d'abord UNE fiche, celle de la mise
à jour la plus récente à ce moment-là, pour valider le format avec
l'utilisateur ; puis remonter le temps par lots, jusqu'à la sortie de La
Forme Finale. Les nouvelles mises à jour publiées entre-temps passent en
tête de file.

---

### 11. Bibliothèque — consultation du lore

🟢 **Lancée le 28/09/2026 (v0.2.8), étape 1 faite.** Outil annexe demandé
par l'utilisateur, accessible par le sélecteur placé sous le bloc
Connexion (« Build Analyzer », position par défaut à chaque lancement, ou
« Bibliothèque »). Pour l'instant, la page annonce son contenu et indique
si le Manifest est chargé (`src/components/Bibliotheque.tsx`).

**Périmètre :** toutes les légendes de Destiny 2 (livres de lore, armes,
armures, coques de Spectre, vaisseaux), puis à moyen/long terme le
Grimoire de Destiny 1.

**Consignes de l'utilisateur (27/09/2026) :**
- armures rangées **par classe, sans jamais mélanger** : le set du
  Chasseur, celui du Titan et celui de l'Arcaniste sont trois histoires
  indépendantes ;
- ordre de lecture d'un set : **casque → gants → torse → jambes → objet de
  classe** ;
- objets sans légende **masqués par défaut** ;
- rééditions **dédoublonnées** (même légende réutilisée) ;
- armures exotiques rangées par classe, **dans une section à part** ;
- Grimoire D1 : l'utilisateur revérifiera la source le moment venu (l'API
  D1 ne répond peut-être plus ; des copies d'archive existent).

**Découpage proposé :** 1) lore D2 depuis le Manifest (livres, armes,
armures, coques, vaisseaux) avec navigation et recherche par mots-clés ;
2) recherche par thème (thèmes à définir, aucune étiquette fournie par
Bungie) ; 3) Grimoire D1.

**Point à régler avant l'étape 2 :** le Manifest est chargé par le bloc
« Recherche dans le Manifest » de la vue Build Analyzer. Au démarrage, il
se charge tout seul s'il est en cache et à jour ; sinon, il faut
aujourd'hui repasser par Build Analyzer pour lancer le téléchargement.
À envisager : sortir ce chargement des deux vues.

### 12. Renommer l'application : « Forge Armory »

🔵 **Plus tard.** Décision de l'utilisateur du 29/09/2026 : l'appli sera
renommée **Forge Armory**, peut-être sous la forme **« Forge Armory -
Build Analyzer »** (à trancher ; cette forme s'accorderait avec le
sélecteur actuel « Build Analyzer / Bibliothèque », qui deviendraient deux
volets de Forge Armory).

**À renommer (ce que l'utilisateur voit) :**
- `package.json` : `productName` (« D2 Build Analyzer »), `shortcutName`
  (raccourci du bureau), `artifactName` (nom de l'installateur
  `D2-Build-Analyzer-Setup-…`) ;
- `electron/main.cjs` : titre de la fenêtre ; `index.html` : titre de la
  page ;
- `src/pages/DashboardPage.tsx` : pied de page (« D2 Build Analyzer v… ») ;
- export des fiches (`exportFiche.ts`) : « D2 BUILD ANALYZER » dans
  l'en-tête et le pied de page ; copie en texte (`fiche.ts`) : « Fiche
  générée par D2 Build Analyzer » ;
- documentation : `README.md`, les deux `GUIDE-DEMARRAGE`, en-têtes de
  `A-TESTER.pdf` (outil `documentation/sources/outil-a-tester-pdf.py`) ;
- hors du code, à faire par l'utilisateur : nom de l'application sur le
  portail développeur de Bungie (affiché sur la page d'autorisation),
  futur dépôt GitHub, noms des zips.

⚠️ **À NE PAS renommer (identifiants internes)** — sinon l'utilisateur
croirait avoir perdu ses données :
- clés de stockage : `d2-build-analyzer.loadouts.v1` (builds
  enregistrés, `stockage.ts`), `d2-build-analyzer.ponderations.v1`
  (`ponderations.ts`), base `d2-build-analyzer` du cache du Manifest
  (`manifest/db.ts`) ;
- `appId` (`com.orynick.d2buildanalyzer`, `package.json`) : Windows y
  verrait une AUTRE application, installée à côté de l'ancienne au lieu
  de la remplacer ;
- `name` de `package.json` (`d2-build-analyzer`) : invisible pour
  l'utilisateur, aucun intérêt à le changer.

⚠️ **Piège du logiciel installé** : Electron range toutes les données
(builds, pondérations, cache du Manifest) dans un dossier Windows qui
porte le nom de l'application (`productName`). Changer ce nom change le
dossier : l'appli repartirait vide. Avant de renommer, prévoir de garder
l'ancien dossier (réglage explicite du dossier de données dans
`main.cjs`) ou de migrer son contenu ; à tester sur une installation
réelle avec des builds enregistrés, et en gardant un export
« ⬇ Exporter tout » de sécurité.

✅ **Vérifié le 29/09/2026 : aucun changement de clé nécessaire.** La clé
API et l'identifiant OAuth sont liés à l'application déclarée sur le
portail développeur de Bungie, pas au nom du logiciel. L'adresse de retour
(`https://127.0.0.1:5173/…`), l'origine déclarée chez Bungie
(`ORIGINE_DECLAREE` dans `main.cjs`) et l'adresse interne du logiciel
(`app://local`, schéma `app`) ne contiennent pas le nom de l'appli.
Facultatif : renommer l'application sur le portail de Bungie (nom affiché
sur la page d'autorisation), dans ses réglages, SANS en créer une nouvelle
(une nouvelle application aurait de nouvelles clés, à reporter dans
`.env.local`).

## Comment tenir cette liste à jour

- Un item **résolu** est retiré d'ici et décrit dans `CHANGELOG.md` — pas
  laissé barré : la liste doit rester lisible.
- Un item qui **attend une information** précise l'action attendue, pas
  seulement le problème.
- Les décisions de conception vont dans le `README.md` : ce fichier ne liste
  que ce qui reste à faire.

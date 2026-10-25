# Podcast du Legendarium — Essai « livre audio » (branche `vibe/draft-podcast-840f64`)

**Date :** 23 octobre 2026
**Statut :** décisions verrouillées pour l'essai — document de transmission. Toute divergence doit être signalée **avant** codage.
**Branche :** `vibe/draft-podcast-840f64`
**Version de l'appli au moment de la rédaction :** 0.5.5 (affichée `0.5.5.draft-podcast` sur cette branche, suffixe chantier géré par `vite.config.ts`)

> Contexte : la spec Legendarium (`SPEC-LEGENDARIUM-2026-10-19.md`, §8) avait noté le « lecteur audio podcast des pages et livres » comme **exclue de cette version** — idée pour un développement ultérieur. C'est CETTE idée que l'on essaie ici, en version personnelle : l'utilisateur s'enregistre lui-même et écoute ses propres enregistrements.

---

## 1. Objectif de l'essai

Lire les pages du Legendarium à voix haute, **comme un audiobook/podcast**, avec la voix de l'utilisateur.
Le lecteur est **flottant** : visible où que l'on soit dans l'application, avec possibilité de le **réduire**.

L'essai est **personnel et local** : les enregistrements audio ne sortent pas de la machine de l'utilisateur.

## 2. Source audio

- **Fichiers audio personnels** déposés par l'utilisateur dans `public/podcast/` (embarqués dans l'application, servis depuis l'origine de l'appli).
- **Convention de nommage** (verrouillée) : le nom du fichier = l'identifiant de la page du Legendarium, avec l'extension `.mp3`.
  - Page de Lore D2 ou Lore d'objet : `lore:<hashLore>.mp3` → fichier **`lore-<hashLore>.mp3`**
    (le `:` est interdit dans les noms de fichiers Windows ; il est remplacé par `-`).
  - Carte du Grimoire D1 : `grimoire:<idCarte>.mp3` → fichier **`grimoire-<idCarte>.mp3`**.
  - Exemples : `lore-1716568313.mp3`, `grimoire-603020342.mp3`.
- **Aucune conversion, aucun TTS, aucune clé API, aucun réseau** : l'appli lit un fichier local embarqué. Si aucun fichier ne correspond à la page, le lecteur affiche « pas d'enregistrement » (lecture texte seule, comme aujourd'hui).
- Un script `scripts/generer-index-podcast.mjs` génère `public/podcast/index.json` (liste des enregistrements présents + date de génération). Le lecteur interroge cet index **une fois au démarrage** (un seul `fetch` sur `'self'`, autorisé par la CSP) pour savoir quelles pages ont un audio, sans lister le dossier (impossible côté client).

## 3. Architecture (verrouillée)

Le Legendarium est une **vue interne** (`VueApp = "bibliotheque"`), montée/démontée par `DashboardPage`. Le lecteur, lui, doit être **visible sur TOUTES les vues** : il est donc monté au niveau de `App.tsx`, au-dessus du routeur.

Communication **en mémoire uniquement** (aucune persistance, conforme à la lecture passive du Legendarium) via un petit bus module `src/lib/legendarium/podcast.ts` :

1. `Bibliotheque` **publie** à chaque changement la page courante (`{ id, titre, idSuivante }`) → `publierPagePodcast(page)`.
2. Le `LecteurPodcast` (monté dans `App.tsx`) **s'abonne** → `usePagePodcast()` et reçoit la page courante.
3. Le lecteur joue l'audio de la page courante **si l'index dit qu'un fichier existe** ; sinon état « pas d'enregistrement ».
4. **Suivant automatique** : quand un fichier se termine, le lecteur demande la page suivante via un callback `onAllerPageSuivante` — fourni par `DashboardPage`, qui connaît le Legendarium. Mécanique : `DashboardPage` expose `allerPageLoreSuivante()` (bascule la vue vers `bibliotheque` si besoin, puis publie la page suivante du livre actif côté `Bibliotheque`).
5. **Clic sur le titre du lecteur** : retour à la page en cours dans le Legendarium (même mécanique que le lien profond fiche Détails → Legendarium : bascule de vue + état en mémoire, aucune route, aucune persistance).

États du lecteur (mémoire React uniquement) : `inactif` (pas de page publiée / pas d'audio) · `lecture` · `pause` · `termine`.

## 4. Interface du lecteur (verrouillée)

- **Position** : panneau flottant **en bas à droite** de la fenêtre (`position: fixed; right: 1rem; bottom: 1rem; z-index` au-dessus du contenu).
- **Réductible** : un bouton réduit le panneau à une **pastille** (icône 🎧 + titre court + état lecture/pause). Un clic sur la pastille ré-ouvre le panneau. L'état réduit/ouvert vit en mémoire (non persisté).
- **Contenu (ouvert)** : titre de la page, livre, barre de progression (`<input type="range">` ou barre native), temps écoulé / total, boutons **▶/⏸ lecture-pause**, **⏹ arrêt**, **⏭ suivant** (si une page suivante existe), et le **titre cliquable** → retour à la page dans le Legendarium.
- **Contenu (réduit)** : 🎧 + titre tronqué + ▶/⏸ + ⏹.
- **Apparition** : le panneau n'apparaît que quand une page du Legendarium est publiée (c'est-à-dire quand on est dans la vue Legendarium, ou quand un enregistrement est en cours). Ailleurs dans l'appli, seule la **pastille** reste visible si une lecture est en cours (sinon rien n'est affiché).
- **Palette** : reprend les teintes du Legendarium (fond sombre `#1a1a1a`, bordure `#4a463c`, texte `#e8e4d8`, accent cyan pâle `#3d7eb5` pour la barre de progression).

## 5. Lecture (verrouillée)

- Élément `<audio>` unique, `preload="metadata"`, source = `podcast/<fichier>` (chemin relatif, base `./` du build).
- **Lecture** : `audio.play()`. **Pause** : `audio.pause()`. **Arrêt** : `pause()` + `currentTime = 0`.
- **Progression** : `timeupdate` → barre + temps. **Reprise à la position mémorisée** : NON (pas de persistance — chaque ouverture d'une page repart à 0).
- **Fin de fichier** (`ended`) : si `idSuivante` existe ET que l'index contient un audio pour cette page → **enchainement automatique** (page suivante publiée, lecture du fichier suivant). Sinon → état `termine`, arrêt.
- **Changement de page manuel** (clic Précédent/Suivant dans le Legendarium, recherche, changement de livre) : la publication met à jour le lecteur ; si un audio existait pour la nouvelle page, il **ne démarre pas tout seul** (attendre le clic ▶) — sauf si la lecture était en cours (enchainement naturel) — règle : le lecteur ne lance la lecture automatiquement QUE sur enchainement de fin de fichier.
- **Changement de vue** (quitter le Legendarium) : la lecture **continue** (c'est le principe du flottant), la pastille reste visible. **Arrêt manuel** possible à tout moment.
- **Démontage de l'appli** : `beforeunload` → `audio.pause()` (le navigateur coupe de toute façon).

## 5b. Guide d'enregistrement (hors code, pour l'utilisateur)

Logiciel recommandé pour s'enregistrer (gratuit, simple) :
- **Téléphone** : application « Magnétophone » native (Android/iOS) ou **Voice Recorder** — exporter en MP3.
- **PC + casque gaming USB** : **Audacity 4** (gratuit, GPL v3 — audacityteam.org ou MuseHub). Points forts pour la voix : export MP3 **intégré** (l'encodeur LAME n'est plus à installer à la main), marqueurs sur la timeline, support **ASIO** sous Windows (WASAPI sinon). Piste **mono**, 44,1 kHz. (Audacity 4.0 a retiré quelques fonctions avancées d'Audacity 3 — sans impact pour de la voix parlée ; Audacity 3.x reste utilisable.)
- Astuce : lire le **titre de la page en premier** dans l'enregistrement (comme un chapitre de podcast), puis le texte.

### 5c. Nommer les MP3 sans se tromper (ajouté en cours d'essai)

L'identifiant d'une page n'est pas évident à trouver à la main. Deux aides :

1. **Le lecteur affiche l'identifiant en dev** : sous le titre de la page, une
   ligne `id : lore:1716568313` avec un bouton **« copier l'id »**
   (`import.meta.env.DEV` uniquement — invisible dans la version installée).
2. **`scripts/associer-podcast.mjs` (`npm run podcast:associer`)** apparie les
   MP3 aux pages via un fichier `public/podcast/association.txt` (une ligne =
   un MP3 dans l'ordre alphabétique des noms, la ligne = l'identifiant de la
   page). **Simulation par défaut** (`--appliquer` pour renommer de vrai, puis
   l'index est régénéré et `association.txt` consommé). Le script ne supprime
   ni n'écrase jamais un fichier ; un nom cible existant ou un nombre
   d'associations incohérent bloque tout.
- Déposer chaque fichier dans `forge-armory/public/podcast/` avec le nom de la convention (§2), puis lancer `node scripts/generer-index-podcast.mjs` (ou `npm run podcast:index`).

## 6. Sécurité / CSP (verrouillée)

- Les MP3 sont servis depuis **l'origine de l'appli** (`'self'`). La lecture par `<audio src>` relève de la directive **`media-src`** — la CSP de production de `vite.config.ts` n'en déclare pas : `default-src 'self'` couvre `media-src` par repli (**CSP3 : une directive absente retombe sur `default-src`**). Aucune modification de la CSP n'est donc nécessaire ; un test de câblage vérifie que `default-src 'self'` est intact et qu'aucune directive ne restreint `media-src` sous `'self'`.
- Aucun accès réseau externe pour l'audio (fichiers embarqués uniquement). La liste blanche réseau existante est inchangée.
- Electron : le schéma `app://local` sert les fichiers de `dist/` (où Vite copie `public/`) — la lecture fonctionne en dev (Vite) comme dans le logiciel installé.

## 7. Hors périmètre de l'essai (verrouillé)

- Enregistrement DANS l'appli (micro) : exclu (l'utilisateur s'enregistre hors appli, voir §5b).
- TTS (voix synthétique), voix externes, API payantes : exclues.
- File de lecture d'un livre entier avec marque-pages : exclu (l'enchainement page suivante existe, mais pas de « chapitre » ni de reprise de position).
- Persistance de la position de lecture, du panneau réduit, de la vitesse : exclue.
- Publication des enregistrements (dépôt public) : exclue — **décision** : `public/podcast/*.mp3` et l'`index.json` généré sont ignorés par git (les enregistrements personnels ne sont jamais versionnés) ; le fichier **`index.modele.json`** (structure vide) est versionné pour documenter le format (l'index généré `index.json` étant ignoré par git).
- Toute écriture liée au Lore (hors génération manuelle de l'index par script) : exclue.

## 8. Fichiers concernés

| Fichier | Rôle |
|---|---|
| `public/podcast/README.md` | Convention de nommage + guide de dépôt (versionné). |
| `public/podcast/index.modele.json` | Structure vide de l'index, versionnée (documente le format). |
| `public/podcast/index.json` | Index généré localement, **ignoré** par git. |
| `scripts/generer-index-podcast.mjs` | Génère `index.json` depuis les MP3 présents (local). Logique exportée, réutilisée par le script d'association. |
| `scripts/associer-podcast.mjs` | Apparier les MP3 bruts aux pages (fichier `association.txt`), renommage selon la convention (simulation par défaut, `--appliquer` pour de vrai), régénère l'index. |
| `package.json` | Scripts `podcast:index` et `podcast:associer`. |
| `src/lib/legendarium/podcast.ts` | Bus en mémoire (publication/abonnement) + résolution `pageId → nom de fichier` + chargement de l'index. |
| `src/components/LecteurPodcast.tsx` | Panneau flottant (ouvert/réduit), lecteur audio, barre de progression, enchainement. **Affiche l'identifiant de la page + « copier l'id » en dev** (aide au nommage des MP3). |
| `src/App.tsx` | Montage du `LecteurPodcast` au-dessus du routeur. |
| `src/pages/DashboardPage.tsx` | Fournit `onAllerPageSuivante` + `onAllerPageCourante` (bascule de vue + état mémoire). |
| `src/components/Bibliotheque.tsx` | Publie la page courante + la page suivante à chaque changement. |
| `tests/logique/podcast-cablage.test.ts` | Tests de câblage (CSP, convention, index, bus). |
| `tests/logique/podcast-associer.test.ts` | Tests du script d'association (appariement par ordre alphabétique, sécurités, câblage). |
| `.gitignore` | Ignore `public/podcast/*.mp3` et l'`index.json` généré. |

## 9. Critères d'acceptation de l'essai

1. Un MP3 nommé selon la convention, déposé dans `public/podcast/` + `npm run podcast:index`, rend le lecteur visible (pastille) dans le Legendarium sur cette page.
2. ▶ lance la lecture de la voix de l'utilisateur ; ⏸/▶ pause/reprise ; ⏹ arrêt.
3. La barre de progression et le temps écoulé/total suivent la lecture.
4. Le panneau flotte en bas à droite, **visible sur toutes les vues** de l'appli quand une lecture est en cours ; réductible en pastille, ré-ouvrable.
5. Le clic sur le titre ramène à la page dans le Legendarium (bascule de vue si besoin).
6. Fin d'un fichier → enchainement automatique sur la page suivante **si elle a un audio**, arrêt sinon.
7. Quitter le Legendarium ne coupe pas la lecture.
8. Page sans MP3 : le lecteur indique « pas d'enregistrement » (lecture texte seule).
9. `npm run build` passe ; `npm run test:logique` passe (nouveau test de câblage inclus) ; la CSP de production reste intacte (test existant + nouveau contrôle `media-src`).
10. Aucun MP3 n'est versionné (`.gitignore` effectif).

## 10. Plan de découpage

1. **Fondations** : `public/podcast/` (README + index vide), script de génération, `.gitignore`, `package.json`.
2. **Bus** : `src/lib/legendarium/podcast.ts` (publication/abonnement, résolution de nom de fichier, chargement index).
3. **Lecteur** : `src/components/LecteurPodcast.tsx` (flottant, réductible, contrôles, progression, enchainement).
4. **Branchements** : `App.tsx` (montage), `DashboardPage.tsx` (callbacks page suivante/courante), `Bibliotheque.tsx` (publication).
5. **Vérification** : test de câblage, `npm run build`, `npm run test:logique`.

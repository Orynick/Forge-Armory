# Forge Armory — Notice d'utilisation

**Destiny 2 Build Analyzer**, par Orynick/Orygamer. Ce document explique comment installer, configurer et utiliser l'application. Pour un aperçu rapide, voir le `README.md`.

**Sommaire** : Démarrage · Créer votre application Bungie · Fabriquer le logiciel installable · Fonctionnalités · Comprendre le score · Télécharger les Manifests · Loadouts.

---

## Démarrage

1. Dans une fenêtre de commande (`cmd`) ouverte dans le dossier du projet :
   ```
   npm install
   ```
2. Si le fichier `.env.local` n'existe pas encore, créez-le en suivant
   **« Créer votre propre application Bungie »** juste en dessous.
3. Lancez l'appli :
   ```
   npm run dev
   ```
4. Ouvrez **https://127.0.0.1:5173** dans votre navigateur.

**Windows (cmd)** : supprimez complètement l'ancien dossier avant
d'extraire un nouveau ZIP (ne pas écraser par-dessus), puis refaites
`npm install`. ⚠️ **Mettez d'abord votre `.env.local` de côté** et
recopiez-le dans le nouveau dossier : sinon il faudra refaire l'étape D
ci-dessous.

---

## Créer votre propre application Bungie (pas à pas, débutants bienvenus)

Pour fonctionner, l'appli doit se présenter à Bungie avec une **clé
d'application**. Cette section explique comment créer la vôtre,
gratuitement, en une dizaine de minutes. **À faire une seule fois.**

> 💡 **Vous avez reçu une archive où le fichier `.env.local` est déjà
> présent ?** La clé vous est fournie : sautez cette section.

### Ce que vous allez obtenir

Deux valeurs, à recopier dans un petit fichier de réglages :
- une **API Key** — un long code de lettres et de chiffres (32 caractères) ;
- un **OAuth client_id** — un nombre de quelques chiffres.

Ni l'une ni l'autre ne donne accès à votre compte : elles identifient
seulement *l'application*. Votre mot de passe Bungie n'est jamais demandé
par l'appli — vous vous connectez directement sur le site de Bungie.

### Étape A — Ouvrir le portail développeur de Bungie

1. Allez sur **https://www.bungie.net/en/Application**
2. Connectez-vous avec votre compte Bungie habituel si on vous le demande.
3. Cliquez sur **Create New App** (« Créer une nouvelle application »).

### Étape B — Remplir le formulaire

Le formulaire est en anglais. Remplissez **exactement** comme ceci :

| Champ (en anglais) | Ce qu'il faut mettre |
|---|---|
| **Application Name** | Le nom de votre choix, ex : `Forge Armory (perso)` |
| **Website** | `https://127.0.0.1:5173` |
| **Application Status** | `Private` |
| **OAuth Client Type** | **`Public`** ⚠️ surtout pas `Confidential` |
| **Redirect URL** | `https://127.0.0.1:5173/auth/callback` |
| **Scope** (cases à cocher) | la case de **lecture** de l'inventaire et du coffre (*Read your Destiny vault and character inventory*) **et** celle qui permet de **déplacer / équiper** des objets (*Move or equip Destiny gear and other items*) |
| **Origin Header** | `https://127.0.0.1:5173` |

Puis cochez l'acceptation des conditions d'utilisation et validez.

⚠️ **Les trois pièges les plus fréquents** — recopiez les adresses au
caractère près, le plus simple est de les copier-coller depuis ce
document :
- `https` avec un **s** (pas `http`) ;
- `127.0.0.1` et **jamais** `localhost` (Bungie refuse `localhost`) ;
- aucune barre oblique `/` en trop à la fin, aucun espace.

### Étape C — Récupérer vos deux valeurs

Sur la page de votre application qui s'affiche ensuite, repérez :
- **API Key** → copiez-la dans un coin (par ex. un Bloc-notes ouvert) ;
- **OAuth client_id** → copiez-le aussi.

(S'il existe un champ *OAuth client_secret*, ignorez-le : l'appli n'en a
pas besoin.)

### Étape D — Créer le fichier de réglages `.env.local`

Dans le dossier du projet se trouve un fichier modèle nommé
**`.env.example`**. On va en faire une copie remplie, nommée
**`.env.local`**.

1. **Faites d'abord apparaître les extensions de fichiers** (sinon Windows
   cache la fin des noms et le piège de l'étape 5 devient invisible) :
   dans l'Explorateur de fichiers, menu **Affichage** → **Afficher** →
   cochez **Extensions de noms de fichiers**.
2. Faites un **clic droit** sur `.env.example` → **Ouvrir avec** →
   **Bloc-notes**.
3. Collez vos valeurs **juste après le signe `=`**, sans espace ni
   guillemets. Ne touchez pas à la troisième ligne. Le résultat doit
   ressembler à ceci (valeurs d'exemple, les vôtres seront différentes) :
   ```
   VITE_BUNGIE_API_KEY=0123456789abcdef0123456789abcdef
   VITE_BUNGIE_CLIENT_ID=12345
   VITE_BUNGIE_REDIRECT_URI=https://127.0.0.1:5173/auth/callback
   ```
   (Les lignes commençant par `#` sont des commentaires, vous pouvez les
   laisser.)
4. Menu **Fichier** → **Enregistrer sous…**, puis :
   - dossier : le **même dossier** que `.env.example` ;
   - **Type** : choisissez **Tous les fichiers (\*.\*)** — c'est
     indispensable ;
   - **Nom du fichier** : `.env.local`
   - **Encodage** : `UTF-8`
   - cliquez sur **Enregistrer**.
5. **Vérifiez** dans l'Explorateur que le fichier s'appelle bien
   `.env.local` et **pas** `.env.local.txt`. S'il porte `.txt` à la fin,
   renommez-le (clic droit → Renommer) en retirant `.txt`.

### Étape E — (Re)lancer l'appli

L'appli ne lit ce fichier **qu'au démarrage**. Si elle tournait déjà,
fermez la fenêtre de commande (ou appuyez sur `Ctrl` + `C` dedans), puis
relancez `npm run dev`. Ouvrez ensuite **https://127.0.0.1:5173** (et non
`localhost:5173`) et cliquez sur **Connexion Bungie.net**.

### Si ça ne marche pas

| Ce que vous voyez | Cause probable |
|---|---|
| Une page d'erreur sur le site de Bungie au lieu de l'écran de connexion | La *Redirect URL* ne correspond pas **exactement** à `https://127.0.0.1:5173/auth/callback` sur votre application Bungie |
| Vous revenez sur l'appli mais restez « non connecté » | *OAuth Client Type* réglé sur `Confidential` au lieu de `Public` |
| Message d'erreur mentionnant l'**API Key** | Clé mal recopiée : espace en trop, caractère manquant ou guillemets |
| Le bouton de connexion ne fait rien ou les réglages semblent vides | Fichier nommé `.env.local.txt`, ou appli pas relancée après la création du fichier |
| Le navigateur refuse la page ou Bungie refuse la redirection | Appli ouverte via `localhost` au lieu de `127.0.0.1` |

🔒 **Ce fichier `.env.local` est à vous** : ne le partagez pas. Il est
automatiquement exclu des sauvegardes de code (`.gitignore`).

### Note — partager l'appli avec quelqu'un

Deux formats d'archive « invité » existent :
- **avec clé** : `.env.local` inclus, prêt à l'emploi. Votre clé ne donne
  accès à aucune de vos données, mais elle est enregistrée à votre nom
  chez Bungie : un abus pourrait la faire limiter ou bloquer. À réserver à
  des personnes de confiance.
- **sans clé** : l'invité suit cette section pour créer sa propre
  application. Zéro exposition pour vous.

⚠️ Bungie **exige du HTTPS** même en local : c'est pour ça que l'appli
lance son serveur via `vite-plugin-mkcert` (déjà configuré). Au premier
`npm run dev`, acceptez l'installation du certificat local si Windows le
demande, puis l'avertissement du navigateur (« Avancé » → « Continuer »).

---

## Fabriquer le logiciel installable (Windows)

L'appli peut être transformée en **vrai logiciel Windows** : une icône sur
le bureau, une fenêtre à elle, plus besoin d'ouvrir une fenêtre de
commande ni de taper `npm run dev`.

⚠️ **Étape à faire une fois, sur votre PC** : la fabrication télécharge
Electron (~150 Mo), ce que l'environnement de Claude ne peut pas faire
(pas d'accès Internet). Tout le reste est déjà prêt dans le projet.

### Fabriquer l'installateur

Dans une fenêtre de commande ouverte dans le dossier du projet :

```
npm.cmd install
npm.cmd run electron:build
```

(Sous PowerShell, écrire `npm.cmd` et non `npm` : la commande `npm` seule
y est bloquée par la politique d'exécution des scripts de Windows.)

La première commande installe les outils. Depuis Electron 42 (le projet
utilise Electron 44 depuis la v0.3.0), le moteur Electron n'est plus
téléchargé à ce moment-là, mais la première fois qu'il sert (premier
`electron:dev` ou première fabrication) : prévoir quelques minutes et une
connexion Internet ce jour-là. La seconde commande produit l'installateur
dans un nouveau dossier **`installateur/`**, nommé
`Forge-Armory-Setup-<version>.exe`. Double-cliquez dessus pour
installer. Electron 44 ne fonctionne que sur Windows **64 bits**.

### Tester sans fabriquer l'installateur

Plus rapide pendant la mise au point : lancez le serveur habituel dans une
première fenêtre de commande, puis la coquille dans une seconde.

```
npm run dev            (fenêtre 1, à laisser ouverte)
npm run electron:dev   (fenêtre 2)
```

### À savoir

- **Renommage en Forge Armory (05/10/2026).** Installer la nouvelle version **par-dessus** l'ancienne : Windows
  la reconnaît (même identifiant d'installation) et la remplace ; vos builds enregistrés, vos réglages de
  pondération et le cache du Manifest sont conservés (le logiciel retrouve son ancien dossier de données au
  démarrage, voir `electron/dossierDonnees.cjs`). Un « ⬇ Exporter tout » préalable reste une bonne précaution.
  Le raccourci de la barre des tâches, s'il était épinglé, est à épingler de nouveau. **Ne renommez pas** le `name` de `package.json`, l'`appId` ni les clés de stockage `d2-build-analyzer…` : ce sont
  des identifiants internes, invisibles, qui protègent vos données. Le NOM DU DOSSIER du projet, lui, est libre
  (`forge-armory` depuis le 05/10/2026) : il n'a aucun effet sur vos données.
- **L'avertissement Windows au premier lancement** (« Windows a protégé
  votre ordinateur ») est normal pour un installateur non signé :
  cliquez sur **Informations complémentaires** puis **Exécuter quand
  même**. Le faire disparaître demanderait un certificat payant
  (~100 à 300 €/an).
- **La connexion Bungie fonctionne sans rien changer sur le portail.**
  Bungie renvoie vers `https://127.0.0.1:5173/auth/callback` ; le logiciel
  **intercepte** cette redirection dans la fenêtre de connexion et en
  extrait le code, sans jamais charger cette adresse. Aucun serveur ni
  certificat n'est embarqué dans le logiciel.
- **Votre clé est incluse dans le logiciel fabriqué** : elle est lue dans
  `.env.local` au moment de la fabrication. Ne distribuez donc pas votre
  `.exe` — pour partager l'appli, utilisez les archives « invité »
  décrites plus haut.
- **Taille** : environ 150 Mo installés (le logiciel embarque son propre
  moteur d'affichage).
- **Export d'un build en image (JPEG, PNG) ou en PDF** : uniquement dans le
  logiciel installé (dans le navigateur, ces boutons sont grisés). Le
  logiciel dessine la fiche dans une fenêtre invisible et isolée, puis la
  capture ou l'imprime : l'image fait 1800 px de large, le PDF tient sur
  une page. Le fichier JSON et la copie en texte, eux, fonctionnent
  partout.

---

## Fonctionnalités

| Bloc | État |
|---|---|
| Blocs repliables (Inventaire, Doctrine, Mon Build, Artefact, Partage) | ✅ Fonctionnel |
| Connexion Bungie (OAuth, profil, inventaire, coffre) | ✅ Fonctionnel |
| Manifest (téléchargement, recherche bilingue, cache d'instance) | ✅ Fonctionnel — rechargé automatiquement au démarrage s'il est déjà en cache et à jour |
| Doctrine — sous-classes, aspects, fragments, capacité réelle en fragments | ✅ Fonctionnel |
| Mon Inventaire / Coffre — filtres, recherche, doublons, popup Détails | ✅ Fonctionnel |
| Icônes (classes, armures, 18 types d'armes, activités, éléments) | ✅ Fonctionnel |
| Anti-champion — armatures d'armes + jetons du jeu + armures exotiques | 🟡 20 armatures sur 27 recensées |
| Bonus de set d'armure (affichage) | ✅ Fonctionnel — données réelles du Manifest |
| Loadouts (sauvegarde locale, icônes, équipement en jeu, export/import) | ✅ Fonctionnel — équipement sur le personnage de la classe du build ; fenêtres « Modifier... » (nom, description, icône) et « Exporter... » (texte, JPEG, PNG, PDF, JSON) |
| Fiche d'un build (« 👁 Voir » dans les Loadouts) | ✅ Fonctionnel — tout le contenu du build en une vue |
| Partage d'un build : fichier JSON, texte, image JPEG/PNG, PDF | ✅ Fonctionnel — depuis la fiche, ou depuis le bloc « Partage du build » sans enregistrer ; images et PDF dans le logiciel installé uniquement |
| Pondération personnalisée des piliers (réglages nommés) | ✅ Fonctionnel — bloc « 0. Contexte du build » |
| Type de munitions des armes (principales, spéciales, lourdes) | ✅ Fonctionnel (v0.2.9) — icône à droite de l'élément, partout |
| Logiciel installable Windows (Electron) | ✅ Fonctionnel — voir « Fabriquer le logiciel installable » |
| Sélecteur d'artefact (7 artefacts, 147 perks, contraintes de tiers) | ✅ Fonctionnel |
| Bouton « Équiper le build en jeu » | ✅ Fonctionnel (armes et armures ; la Doctrine reste manuelle) |
| Sélecteur de contexte (Neutre / Roaming / DPS / PvP) | ✅ Fonctionnel — bloc « 0. Contexte du build » + pondération des stats |
| Filtre d'**élément de dégâts** (Cinétique, Solaire, Cryo-électrique, Abyssal, Stase, Filobscur) dans la recherche du Manifest, Mon Inventaire et le Coffre | ✅ Fonctionnel — porte sur les armes |
| Bouton **« Aller à »** (recherche du Manifest → Mon Inventaire, filtré sur l'objet) | ✅ Fonctionnel |
| Export infographique : logos de section, icônes de classe, d'élément et de contexte | ✅ Fonctionnel — logos Arme et Armure à venir |
| Onglet **Forge** (toutes les armes et armures, rolls de perks, mods) | 🔵 Onglet présent, contenu en préparation |

---

## Comprendre le score

> ⚠️ **Ce que le score est, et ce qu'il n'est pas**
>
> Le score évalue la **cohérence théorique** d'un build à partir des données du
> Manifest : les stats s'additionnent-elles vers quelque chose d'utile, les
> verbes d'élément forment-ils une boucle, les bonus de set servent-ils le
> reste ?
>
> Il **ne remplace en aucun cas l'expérimentation en jeu**. Un build noté 95
> peut être désagréable à jouer ; un build noté 60 peut être excellent entre
> vos mains. L'appli ne mesure ni le ressenti, ni votre style de jeu, ni le
> contexte d'une activité précise, ni les interactions que Bungie n'a pas
> documentées. Considérez-le comme un avis de second regard, pas comme un
> verdict.

### Les cinq piliers et leurs poids

Le score global est une moyenne pondérée de cinq piliers. Un sélecteur (**Neutre · PvE Roaming · PvE DPS · PvP**) ajuste le poids de chaque pilier, et le poids de chaque statistique au sein du pilier Statistiques.

**Poids des piliers selon le contexte (%)** — noms et ordre tels qu'affichés dans l'appli :

| Pilier | Ce qu'il mesure | Neutre | Roaming | DPS | PvP |
|---|---|---|---|---|---|
| 1. Doctrine élémentaire | Validité et complétude de la doctrine (conformité, pas qualité) | 10 | 10 | 10 | 10 |
| 2. Armes et Armures | Validité (un seul exotique d'arme et d'armure), bonus de set, couverture anti-champion, cohérence élémentaire | 20 | 20 | 20 | 20 |
| 3. Artefact | Remplissage, cohérence et synergie des perks d'artefact | 15 | 15 | 15 | 10 |
| 4. Effets du Build | Verbes d'élément : sources et payoffs, chaînes, ressources — la vraie cohérence du build | 30 | 35 | 25 | 20 |
| 5. Statistiques | Stats de l'armure, masterwork et fragments ; décisives en DPS et en PvP | 25 | 20 | 30 | 40 |

En roaming, la boucle de gameplay prime (Effets du Build à 35) ; en DPS la fenêtre est courte et la puissance brute décide (Statistiques à 30) ; en PvP les stats et la survie dominent, et l'artefact ne sert presque à rien. Le pilier Doctrine élémentaire ne pèse que 10 % : il vérifie qu'une doctrine est valide et complète, ce qui est de la conformité et non de la qualité — la substance d'une doctrine réside dans les effets qu'elle génère, déjà mesurés par un autre pilier.

### Pondération personnalisée (depuis la v0.2.8)

Les poids ci-dessus restent le réglage par défaut, appelé **« Automatique
(selon le contexte) »**. Dans le bloc « 0. Contexte du build », le bouton
**✏️ Personnaliser…** permet de créer ses propres réglages :

- un poids en pourcentage entier par pilier, **total obligatoirement égal
  à 100 %** (l'enregistrement est refusé sinon) ;
- un **nom** pour le réglage ; un réglage portant le nom d'un réglage
  existant le remplace, pour pouvoir le corriger sans doublon ;
- le réglage enregistré devient **actif** ; le menu « Pondération » permet
  ensuite de passer de l'un à l'autre, ou de revenir en Automatique.

Ce qu'un réglage personnalisé change, et ce qu'il ne change pas :

- il remplace les poids du contexte **dans le score global uniquement** ;
  le tableau des poids et chaque carte de pilier affichent alors les poids
  réellement utilisés ;
- il ne modifie **aucun score de pilier** ;
- le contexte continue de régler **la pondération des statistiques** au
  sein du pilier Statistiques (c'est un autre réglage) ;
- c'est une **préférence globale** (enregistrée dans le stockage local),
  pas une propriété de chaque build : elle s'applique à tout build affiché.

Sans réglage actif, le calcul est strictement identique à avant (vérifié
sur les 4 contextes).

### La classe (Titan/Chasseur/Arcaniste) ne doit PAS influencer le score

Principe de conception : la
classe détermine le **pool d'options disponibles** (quels supers, aspects,
fragments existent pour ce personnage), pas la qualité du build en tant
que telle. Un Chasseur et un Arcaniste avec des choix équivalents en
cohérence doivent obtenir le même score.

Le rôle utile de la classe est la **validation**, pas le scoring : vérifier
qu'un aspect/fragment/super sélectionné existe bien pour la classe choisie,
et signaler une incohérence sinon. Aucune classe n'est sélectionnée par
défaut — un message invite à en choisir une avant de construire un build.

---

## Télécharger les Manifests FR et EN sur votre PC

L'appli télécharge déjà le Manifest toute seule, mais elle le garde dans le
navigateur (IndexedDB), invisible et difficile à inspecter. Ce script en pose
une copie sur le disque, en vrais fichiers SQLite :

```bash
node scripts/telecharger-manifest.mjs
```

**Prérequis** : `npm install` déjà fait (le script utilise `fflate`, déjà dans
les dépendances — rien de plus à installer) et un `.env.local` contenant votre
`VITE_BUNGIE_API_KEY`.

**Résultat** : un dossier `manifest-local/` avec `manifest-fr.sqlite`,
`manifest-en.sqlite` et `version.txt`.

**À quoi ça sert** : garder la sauvegarde d'une version précise du Manifest,
explorer les tables à la main (avec DB Browser for SQLite, gratuit), et
surtout comparer les textes FR et EN côte à côte quand une correspondance de
mot-clé pose problème — exactement le type de bug rencontré sur les types
d'armes ("Pistolet" vs "Revolver", "Lance-grenades" identique pour deux armes
différentes). Une requête SQL directe sur ces fichiers donne la réponse en
quelques secondes, là où il fallait jusqu'ici passer par un aller-retour de
diagnostic dans l'appli.

Comptez 100 à 200 Mo par langue, et quelques minutes de téléchargement.

---

## Loadouts : où sont-ils enregistrés ?

Les loadouts (builds sauvegardés, panneau latéral droit) sont stockés dans le
**`localStorage` du navigateur**, sur votre machine. Rien n'est envoyé ni à
Bungie ni ailleurs.

**Ce que ça implique concrètement :**

| | |
|---|---|
| ✅ | Fonctionne hors ligne, instantané, aucune dépendance à l'API Bungie |
| ✅ | Aucun risque de retomber sur les erreurs 500/401 des loadouts Bungie |
| ⚠️ | **Liés au navigateur, pas au compte** : ils ne suivent pas d'un PC à l'autre |
| ⚠️ | Chaque navigateur a ses propres loadouts (Chrome ≠ Firefox) |
| ⚠️ | **Vider les données du site les efface définitivement** |
| ⚠️ | Le mode navigation privée les perd à la fermeture |

D'où le bouton **Exporter** du panneau : il produit un fichier `.json` à
conserver, réimportable ensuite (le bouton **Importer** ajoute aux loadouts
existants plutôt que de les remplacer, pour qu'un import malheureux n'efface
rien).

📁 Un dossier **`builds/`** est prévu à cet effet dans le projet (voir
`builds/LISEZ-MOI.md`). Il n'est pas rempli automatiquement : une page web ne
peut pas choisir où elle écrit, l'export part donc dans vos téléchargements et
c'est à vous de déplacer le fichier ici.

### Pour que les loadouts ne soient plus seulement locaux

Trois approches possibles, de la plus simple à la plus lourde :

1. **Fichier partagé (aucun serveur)** — export/import manuel vers un dossier
   synchronisé (OneDrive, Dropbox, Google Drive). Ça marche déjà aujourd'hui,
   c'est juste manuel. Limite : pas de synchronisation automatique, risque de
   conflit si on modifie depuis deux PC.

2. **Un vrai backend** — il faudrait : un serveur (Node/Python) hébergé
   quelque part, une base de données, un système de comptes pour savoir à qui
   appartient quel loadout, et une gestion de l'authentification. C'est le
   changement de nature le plus important : l'appli cesse d'être purement
   locale, ce qui implique un hébergement à payer/maintenir, et la
   responsabilité de données stockées pour d'autres personnes.

3. **Stockage côté Bungie** — l'API expose des loadouts natifs. Ce serait
   l'idéal (synchronisé avec le compte, visible en jeu), mais c'est
   précisément ce qui échouait en 500/401 lors des tests, et le format Bungie
   ne couvre pas forcément tout ce qu'on sauvegarde ici (notre loadout inclut
   la doctrine complète, l'artefact, etc.).

**Recommandation** : rester sur le local + export tant que l'appli est un
outil personnel. L'option 2 ne se justifie que si plusieurs personnes doivent
partager des loadouts en ligne.

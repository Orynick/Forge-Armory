# Forge Armory

**Destiny 2 Build Analyzer** — *(anciennement « D2 Build Analyzer » : ce nom est devenu le
sous-titre de l'application depuis le 05/10/2026)*

Appli locale (React + Vite + TypeScript) pour étudier et scorer des builds
Destiny 2 selon 5 piliers pondérés (poids variables selon le contexte de
build : Neutre, Roaming, DPS, PvP), alignée sur le système
**Armor 3.0 / Monument of Triumph** (juin 2026).

Par Orynick/Orygamer.

📄 Documents liés : `TODO.md` (ce qui reste à faire) · `CHANGELOG.md`
(historique daté de toutes les corrections/ajouts) · `documentation/`
(rapports d'audit, conception de l'agent IA — voir son `LISEZ-MOI.md`).

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

## État général

| Bloc | État |
|---|---|
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
| Blocs repliables (Inventaire, Doctrine, Mon Build, Artefact, Partage) | ✅ Fonctionnel |
| Logiciel installable Windows (Electron) | ✅ Fonctionnel — voir « Fabriquer le logiciel installable » |
| Sélecteur d'artefact (7 artefacts, 147 perks, contraintes de tiers) | ✅ Fonctionnel |
| Bouton « Équiper le build en jeu » | ✅ Fonctionnel (armes et armures ; la Doctrine reste manuelle) |
| **Pilier 1** — Élément & Doctrine | ✅ Réel (validité + capacité en fragments) |
| **Pilier 2** — Verbes d'Élément (source/payoff + chaînes + ressources) | ✅ Réel |
| **Pilier 3** — Perks d'Artefact | ✅ Réel (remplissage, cohérence, synergie) |
| **Pilier 4** — Loot & Cohérence | 🟡 Partiel — validité et bonus de set réels ; anti-champion et cohérence élémentaire à écrire |
| **Pilier 5** — Statistiques | ✅ Réel — masterwork et fragments corrigés, vérifié sur relevés réels |
| Sélecteur de contexte (Neutre / Roaming / DPS / PvP) | ✅ Fonctionnel — bloc « 0. Contexte du build » + pondération des stats |
| Export DIM | 🔵 Mis de côté (erreurs API sans détail exploitable) |

## Points de vigilance et outils de diagnostic

### Équipement — un point à surveiller (résolu, cause identifiée)

Un échec d'équipement systématique (« Signal perdu », `DestinyItemNotFound`,
ErrorCode 1623) a occupé une bonne partie de la session du 05/08. **Cause
confirmée** : l'`itemInstanceId` sauvegardé dans un loadout référençait un
exemplaire de l'arme depuis démantelé et remplacé — pas un bug d'équipement
ou de transfert. Confirmé de deux façons indépendantes : `Destiny2.GetItem`
répond directement que l'exemplaire n'existe plus (voir plus bas), et
l'indicateur « objet(s) introuvable(s) sur le compte » de l'appli
détectait déjà correctement ce cas.

**Aucun correctif de code n'a été nécessaire** pour ce cas précis — la
« réparation automatique » des loadouts (bouton **🔧 Réparer
automatiquement**, sous l'avertissement « objet(s) introuvable(s) »)
retrouve l'exemplaire actuel du même objet et corrige le loadout en un
clic.

⚠️ **À surveiller** : si un échec `DestinyItemNotFound` réapparaît sur un
objet qui n'affiche PAS l'avertissement « introuvable » (donc que l'appli
croit valide), ce serait un signe que le bug est différent de celui déjà
résolu — utiliser le diagnostic ci-dessous avant de conclure à autre chose.

### Diagnostic « Vérifier un objet chez Bungie » (mode dev)

Bouton disponible dans **Mon Build**, à côté du bouton d'équipement
(visible uniquement en mode développement). Interroge Bungie
**directement** sur un `itemInstanceId` précis, sans tenter aucun transfert
ni équipement — sert à savoir si un objet existe encore réellement sur le
compte, indépendamment de toute autre requête.

**Utilisation** :
1. Cliquer sur **🔍 Vérifier un objet chez Bungie (dev)**.
2. Une fenêtre demande l'`itemInstanceId` à vérifier — le copier depuis le
   message d'erreur d'un échec d'équipement (visible dans le diagnostic
   entre crochets, ex : `itemInstanceId=6917530198022312588`).
3. Le résultat s'affiche dans une fenêtre : `objetTrouve: true` confirme
   que l'objet existe toujours (le problème vient alors de la requête
   d'équipement elle-même) ; `objetTrouve: false` avec `DestinyItemNotFound`
   confirme un identifiant périmé (utiliser la réparation automatique).

Un second diagnostic (`verifierPrecisionItemInstanceId`) s'exécute
**automatiquement** au chargement de l'inventaire (mode dev, aucune action
requise) : vérifie qu'aucun grand identifiant (au-delà de la précision
entière sûre de JavaScript) n'est corrompu par la désérialisation JSON.
Résultat visible dans la console du navigateur.

## Travailler sur plusieurs conversations Claude

⚠️ **Découvert le 26/08/2026** : Claude.ai limite chaque conversation à
**20 pièces jointes au total** (pas par message — un budget cumulé sur
toute la durée de l'échange). Un audit de fragments à base de captures
d'écran, comme celui du fichier `knowledge-base/25_AUDIT_FRAGMENTS.md`,
atteint vite cette limite.

**Convention adoptée** :
- Les fichiers **stables** du projet (le ZIP de l'appli, `TODO.md`,
  `CHANGELOG.md`, `README.md`, le dossier `knowledge-base/`) vont dans la
  section **Fichiers** du Projet Claude — pas de limite de nombre là-bas,
  disponibles automatiquement dans toute nouvelle conversation du même
  Projet, sans avoir à les renvoyer.
- Les captures d'écran **ponctuelles** (fragments à auditer, une image
  d'artefact...) restent dans le fil de conversation — usage unique, plus
  besoin une fois intégrées aux fichiers de référence.

**Quand la limite est atteinte en cours de route** : ouvrir une nouvelle
conversation dans le même Projet. ⚠️ Chaque conversation a son PROPRE bac à
sable, entièrement isolé des autres : une conversation ignore tout
changement fait dans une autre, même dans le même Projet. Pour transférer
du travail d'une conversation à l'autre, transmettre un **ZIP unique**
(l'archive elle-même ne compte que comme UNE pièce jointe, quel que soit
son contenu) — la conversation destinataire compare avec son propre état
et fusionne, plutôt que d'écraser.

## Notes de conception

### Pondération des 5 piliers — note de conception historique (août 2026)

> ⚠️ **Dépassé — conservé pour l'historique de la réflexion.** Le « 20 %
> partout » et la « piste non implémentée » décrits ci-dessous ont été
> remplacés par une **pondération par contexte de build**, implémentée
> (voir la section « Le scoring : conception et calibration »). Les
> piliers ont aussi été renommés et réordonnés le 06/09/2026 : Élément et
> Doctrine, Artefact, Armes et Armures, Effets du Build (ex-« Verbes
> d'Élément »), Statistiques.

Le 20% partout est un choix simple et défendable, mais probablement pas ce
qui reflète le mieux ce qui fait un bon build selon le consensus des
créateurs de contenu Destiny 2 (guides, theorycraft, etc.) :

- **Doctrine + Verbes d'Élément** sont généralement le vrai "moteur" du
  build (la boucle proc → verbe → payoff) et mériteraient plus de poids
  (~25-30% chacun) que les autres piliers.
- **Statistiques** reste indispensable, mais plus ajustable a posteriori
  une fois la boucle de gameplay choisie — plus une couche d'optimisation
  qu'une couche fondatrice.
- **Perks d'Artefact** est un multiplicateur sur une boucle déjà existante,
  rarement ce qui définit un build à lui seul.
- **Loot & Cohérence** (bonus de Set inclus) est le plus optionnel des
  cinq — Bungie les conçoit eux-mêmes comme un plus, pas un passage obligé.

Piste (non implémentée) si on voulait s'écarter du 20% partout :
25/25/15/15/20 (Doctrine/Verbes/Artefact/Loot/Stats) plutôt qu'égal.

**Réserve importante** : la "bonne" pondération dépend du contexte d'usage
(voir ci-dessous) — un poids fixe unique ne peut jamais être universellement
correct, juste un compromis raisonnable.

### Piste future : pondération selon le contexte du build

Idée à explorer : un sélecteur de contexte qui ajuste les poids des 5
piliers en conséquence, plutôt qu'un 20% figé pour tous les usages :

- **PvE roaming / démobage** : Verbes d'Élément et Doctrine comptent
  probablement plus (l'AoE et la boucle de survie priment sur le DPS pur).
- **PvE DPS (boss)** : Statistiques (dégâts, cooldowns) et Perks d'Artefact
  probablement plus déterminants ; les Verbes d'Élément moins critiques
  si la cible ne meurt pas assez vite pour en profiter.
- **PvP** : Statistiques d'armes/mêlée et Doctrine (survie, mobilité)
  probablement dominantes ; Perks d'Artefact et bonus de Set généralement
  moins pertinents qu'en PvE.

Pas encore implémenté — nécessite de définir un jeu de poids par contexte
(actuellement figés à 20% dans `POIDS_PAR_PILIER`, `lib/scoring/pillars.ts`)
et un sélecteur dans l'UI pour choisir le contexte actif.

**Note de l'utilisateur à prendre en compte lors de l'implémentation** :
la stat "Arme" (une des 6 stats du Pilier 5) est, à ce jour, moins utile en
pratique que la Santé et les autres stats — il faudra en tenir compte dans
la façon dont le Pilier 5 est noté selon le contexte choisi (probablement
un poids plus faible pour "Arme" par rapport aux autres stats, plutôt qu'un
poids égal entre les 6).

### La classe (Titan/Chasseur/Arcaniste) ne doit PAS influencer le score

Principe de conception à respecter dans tout le moteur de scoring : la
classe détermine le **pool d'options disponibles** (quels supers, aspects,
fragments existent pour ce personnage), pas la qualité du build en tant
que telle. Un Chasseur et un Arcaniste avec des choix équivalents en
cohérence doivent obtenir le même score.

Le rôle utile de la classe est la **validation**, pas le scoring : vérifier
qu'un aspect/fragment/super sélectionné existe bien pour la classe choisie,
et signaler une incohérence sinon. Aucune classe n'est sélectionnée par
défaut — un message invite à en choisir une avant de construire un build.

## Le scoring : conception et calibration

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

### Contexte de build

Un sélecteur (**Neutre · PvE Roaming · PvE DPS · PvP**) ajuste deux choses : le
poids de chaque pilier, et le poids de chaque statistique.

**Poids des piliers selon le contexte (%)**

| Pilier | Neutre | Roaming | DPS | PvP | Pourquoi ce poids |
|---|---|---|---|---|---|
| 1. Élément & Doctrine | 10 | 10 | 10 | 10 | Mesure la **validité et la complétude**, pas la qualité |
| 2. Verbes d'Élément | 30 | 35 | 25 | 20 | C'est là qu'est la **vraie cohérence** du build |
| 3. Perks d'Artefact | 15 | 15 | 15 | 10 | Formule encore imprécise, poids volontairement modéré |
| 4. Loot & Cohérence | 20 | 20 | 20 | 20 | Porte la **cohérence transversale** (voir plus bas) |
| 5. Statistiques | 25 | 20 | 30 | 40 | Données réelles et fiables, décisives en DPS et PvP |

**Pourquoi le Pilier 1 ne pèse que 10 %.** Il vérifie qu'une doctrine est
valide et complète — les bons nombres d'aspects et de fragments, des éléments
cohérents entre eux. C'est de la **conformité, pas de la qualité** : un build
valide et complet n'est pas un bon build, c'est un build correctement rempli.
La substance réelle d'une doctrine réside dans les verbes qu'elle génère, et
ceux-ci sont déjà mesurés par le Pilier 2. Lui donner 20-25 % reviendrait à
noter deux fois la même chose.

**Variation par contexte** : en roaming la boucle de gameplay prime (Verbes à
35) ; en DPS la fenêtre est courte et la puissance brute décide (Stats à 30) ;
en PvP les stats et la survie dominent, et l'artefact ne sert presque à rien.

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
sur les 4 contextes). Code : `src/lib/scoring/ponderations.ts`, et le
paramètre facultatif `poidsPersonnalises` de `evaluerBuild`. La table
`POIDS_PILIERS` n'a pas changé : elle reste le miroir du tableau ci-dessus.

### Le Pilier 1 alimente le Pilier 4 (pas de double lecture)

Le Pilier 1 **expose** ses données résolues — élément de la doctrine, aspects,
fragments, capacité en fragments — plutôt que de les garder pour lui. Le
Pilier 4 les consomme pour évaluer la cohérence transversale. Deux raisons :
éviter de relire le Manifest deux fois, et surtout éviter que les deux piliers
divergent sur l'interprétation d'une même donnée.

### Composition du Pilier 4 — Loot & Cohérence

Le Pilier 4 est le seul à voir **plusieurs blocs du build à la fois** : c'est de
là que vient sa valeur, pas de ce qu'il évaluerait isolément.

**Poids des composantes selon le contexte (%)**

| Composante | Neutre | Roaming | DPS | PvP | Rôle |
|---|---|---|---|---|---|
| Bonus de set | 35 | 30 | 35 | **75** | Paliers 2/4 réellement atteints |
| Couverture anti-champion | 50 | 55 | 50 | **0** | Types de Champion neutralisables |
| Cohérence élémentaire | 15 | 15 | 15 | **25** | Armes accordées à la doctrine |

**En PvP, les Champions n'existent pas** : la composante disparaît au lieu
d'être notée à zéro (ce qui pénaliserait injustement), et son poids est
redistribué sur les deux autres.

**Validité** — traitée à part, hors pondération : plus d'un exotique d'arme ou
d'armure rend la configuration **impossible en jeu**. Ce n'est pas un défaut à
nuancer, c'est un build qui ne peut pas exister : pénalité bloquante.

### Couverture anti-champion : barème progressif

| Types couverts | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Points** | 0 | **40** | **80** | **100** |

Progression volontairement forte sur les deux premiers types. Une activité
présente rarement les trois Champions : passer de un à deux types couverts
change beaucoup plus le confort de jeu que passer de deux à trois. Le barème
récompense donc l'ouverture d'un second contre plus que la complétion du
troisième.

### Cohérence élémentaire : pourquoi elle reste légère (15 %)

L'intuition serait d'exiger que toutes les armes correspondent à l'élément de
la doctrine. **Ce serait un mauvais conseil**, pour trois raisons :

- une arme **cinétique** n'a pas d'élément et reste excellente — la pénaliser
  n'aurait aucun sens ;
- beaucoup de bons builds mélangent volontairement les éléments ;
- depuis la **9.7.0**, l'anti-champion ne dépend plus de l'élément : le
  principal argument en faveur du monochrome a disparu.

La correspondance est donc **légèrement récompensée**, jamais l'écart
pénalisé, et le cinétique n'est jamais sanctionné. Une appli qui pousserait
vers des builds monochromes appauvrirait le jeu au lieu d'aider.

### Ce que le Pilier 4 ne fait PAS

**Il ne juge pas la synergie des perks.** Celle-ci se lit dans les verbes
d'élément, et le Pilier 2 l'analyse déjà — y compris sur les perks d'armes, via
sa détection source/payoff. La re-noter ici compterait deux fois la même
qualité et gonflerait artificiellement les bons builds.

**Il n'utilise pas les archétypes d'armure** (Powerhouse, Grenadier…), bien que
la base de connaissance les documente. Raison : le Pilier 5 note déjà les stats
obtenues, et il le fait sur des **valeurs réelles** là où l'archétype n'exprime
qu'une **intention**. À reconsidérer seulement si le Pilier 5 se révèle
insuffisant.

> ⚠️ **Risque identifié : le fourre-tout.** Le Pilier 4 est celui où tout ce
> qui ne rentre nulle part risque d'atterrir. Six composantes agrégées en un
> chiffre n'apprendraient plus rien à personne. Il est donc volontairement
> limité à **trois composantes**, dont les sous-scores sont affichés
> séparément pour qu'on voie d'où vient le résultat.

### Couverture anti-champion — les trois sources

Un build capable de neutraliser les **trois** types de Champion (Bloqueur,
Implacable, Surchargé) vaut mieux qu'un build qui n'en couvre qu'un — sauf en
**PvP**, où les Champions n'existent pas : la couverture y est ignorée plutôt
que récompensée.

⚠️ **L'anti-champion ne vient pas que des armes.** Certaines capacités de
doctrine et certaines armures exotiques en fournissent également (la base de
connaissance recense 13 armures exotiques concernées). Ne compter que les
armures et armes serait donc faux, et sous-noterait des builds valides. Cette
partie du calcul devra examiner :

- les armes équipées (déjà en place, via l'armature — voir plus bas) ;
- les **armures exotiques** dont le perk fournit un contre ;
- les **capacités de doctrine** correspondantes.

**Piste : les jetons du jeu.** Une capture d'écran de la Companion App montre
que le jeu écrit « Efficace contre les **[Chancellement]** Champions
implacables » — avec un **jeton entre crochets** avant l'adjectif. Ces jetons
sont probablement un signal plus fiable que l'adjectif français, qui varie en
genre et en nombre (« implacable » / « implacables »). À vérifier sur les trois
types avant d'en faire la méthode principale ; l'adjectif reste le repli.

⚠️ **Prudence sur les capacités de doctrine** : la source consultée
(shatteredvault.com) présente ces contres dans une section datée « Lightfall »,
contredite par sa propre section 9.7.0 sur Radiant/Volatile. Ces
correspondances doivent être **vérifiées en jeu** avant d'entrer dans le score
— voir `knowledge-base/13_ARTIFACTS_2_0_ET_ANTI_CHAMPION.md`.

**Poids des statistiques selon le contexte**

| Stat | Neutre | Roaming | DPS | PvP |
|---|---|---|---|---|
| Santé | 1,2 | 0,3 | 0,3 | 1,8 |
| Mêlée | 1,0 | 1,2 | 0,7 | 1,3 |
| Grenade | 1,2 | 1,5 | 1,2 | 1,4 |
| Super | 1,0 | 1,0 | 1,8 | 0,7 |
| Classe | 1,0 | 1,3 | 0,8 | 1,3 |
| Arme | 0,6 | 1,7 | 1,7 | 0,5 |

⚠️ **Corrigé (24/08/2026)** — trois vagues d'ajustements après revue des
coefficients : la Santé s'est révélée bien moins déterminante que prévu en
Roaming et DPS ; l'Arme plus utile qu'estimé en Roaming (même poids qu'en
DPS), mais moins décisive que prévu en PvP, où c'est plutôt la Grenade qui
compte davantage.

### Pourquoi une moyenne pondérée plutôt qu'une moyenne simple

L'ancienne formule faisait la moyenne des 6 paliers. Conséquence : un build
tiède partout battait un build spécialisé — l'inverse de ce que récompense
Destiny. Avec la pondération, un T20 Grenade rapporte beaucoup en roaming et
peu en DPS : la spécialisation est valorisée, mais seulement si elle porte sur
la bonne chose.

### Calibration de l'échelle : pourquoi 500 et pas 1200

Le total des stats d'un set **pleinement optimisé** se calcule à partir de la
section « Armor 3.0 » de `knowledge-base/08_GAME_MECHANICS.md` :

| Source (par pièce) | Apport |
|---|---|
| Stat primaire (intrinsèque) | 30 |
| Stat secondaire (intrinsèque) | 25 |
| Stat tertiaire | 20 |
| Masterwork T5 + Balanced Tuning (3 stats × 6) | 18 |
| Stat Mod majeur | 10 |
| **Total par pièce** | **≈ 103** |

Soit **≈ 515 points sur 5 pièces**, répartis sur les 6 statistiques.

Or le maximum théorique (6 stats × T20) vaut **1200**. Normaliser là-dessus
donnerait à un stuff parfait un score de **515 / 1200 ≈ 43 %** — tous les
builds se tasseraient en bas de l'échelle et le score perdrait tout pouvoir
discriminant.

**L'échelle est donc calibrée sur 500**, valeur d'un set optimisé. Un excellent
build approche 95-100, un build correct tourne vers 70, un build négligé vers
40.

### Deux pièges de calibration à connaître

**Les Fonts ne comptent pas.** Ils ajoutent environ +40 en combat, mais
**n'apparaissent pas dans les stats affichées hors combat** — et c'est ce que
lit l'appli. La référence de 500 porte donc sur les stats statiques ; la caler
sur le total « virtuel » ferait paraître tous les builds incomplets.

**La stat tertiaire n'est jamais l'une des deux intrinsèques.** Contrainte
structurelle confirmée sur données réelles, utile pour repérer une armure mal
lue ou une donnée aberrante.

### Piste non encore exploitée : les archétypes

`knowledge-base/08_GAME_MECHANICS.md` documente les **12 archétypes d'armure**
(Powerhouse = Weapons/Super, Grenadier = Grenade/Super, etc.). C'est
exploitable pour la cohérence : une pièce Powerhouse dans un build orienté
grenade est un mauvais choix, indépendamment de son total de stats. Prévu pour
enrichir le Pilier 4, aujourd'hui limité au comptage d'exotiques.

## Comment tester une fois connecté

1. Cliquez sur **Connexion Bungie.net**, autorisez l'accès sur la page Bungie.
2. De retour sur l'appli, le statut doit passer à **✅ connecté**.
3. Votre nom Bungie (`pseudo#1234`) s'affiche à gauche des boutons, après
   « Compte : ». S'il s'affiche, la connexion API fonctionne. Le bouton
   **Tester la connexion** relance ce chargement si besoin.
4. En cas d'erreur affichée, copiez le message et revenez me voir — la plupart
   des erreurs à ce stade viennent d'un scope OAuth mal coché sur bungie.net
   ou d'une clé API mal recopiée.

### Points en cours de test en conditions réelles (en jeu)

⚠️ Ces points ne peuvent être vérifiés que par l'utilisateur, en jouant —
Claude n'a pas d'accès à un compte Bungie réel dans son environnement de
développement. Statut au 27/08/2026 (checklist complète dans
`A-TESTER.pdf`) :

- **Bonus de ressources du Pilier 2** (`✨`) — à confirmer sur un build qui
  génère plusieurs types de ressources distincts (mêlée + grenade par
  exemple).
- **Confort — gestion d'erreur réseau à l'auto-chargement des
  sous-classes** — le cas nominal (chargement automatique, changement
  rapide de classe) est confirmé fonctionnel ; reste à tester une vraie
  coupure réseau pendant le chargement (bouton "Réessayer").
- **Correctifs de la passe d'audit du scoring (26/08)** — barème orphelin
  (6 pts au lieu de 0) et liens conditionnels plus robustes : logique
  vérifiée par script isolé, pas encore observée sur un vrai build en jeu.

## Tests rapides sans lancer l'appli (fixtures)

Pour valider juste la logique Manifest (recherche, détection de verbes)
sans passer par un vrai téléchargement de ~200 Mo :

```bash
node scripts/tester-avec-fixtures.mjs
```

**2 conditions :**
- Être dans le dossier du projet (terminal ouvert dedans, comme pour `npm run dev`)
- `npm install` déjà fait au moins une fois (le script importe `sql.js`,
  même s'il n'utilise pas de vraies données Bungie)

**Ce que ça teste** : uniquement `obtenirDefinition`, la recherche
(bilingue FR/EN), et la détection des verbes d'élément — sur des données
factices mais au bon format (`test-fixtures/manifest-mock.json`).
**Ce que ça NE teste PAS** : la connexion Bungie, l'inventaire réel,
l'interface, ni rien de visuel. Un test ciblé et rapide, pas un
remplacement de `npm run dev`.

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

## Prochaines étapes

Voir `TODO.md` pour la liste priorisée et à jour de ce qui reste à faire.

## Apprentissages techniques clés

Quelques pièges rencontrés qui valent d'être gardés en tête pour la suite
du développement (détails complets dans `CHANGELOG.md`) :

- **Hash Bungie signés vs non signés** : stockés en SQLite comme des
  entiers 32 bits signés, alors que l'API les renvoie non signés — sans
  conversion, ~50% des recherches par hash échouent silencieusement.
- **`defaultDamageType` des sous-classes est toujours à 0** pour les 3
  classes — aucun champ Manifest fiable ne donne l'élément d'une
  sous-classe. Solution retenue : table de hash codée en dur, construite à
  partir de diagnostics réels partagés par l'utilisateur.
- **Options de socket à rolls aléatoires** : `randomizedPlugSetHash`
  (distinct de `reusablePlugSetHash`) est nécessaire pour résoudre les
  perks à rolls aléatoires (barillet/munitions/perks d'arme) — un champ
  facile à manquer.
- **Icônes absentes du Manifest** : `DestinyClassDefinition` et
  `DestinyItemCategoryDefinition` ont `"hasIcon": false` pour les classes
  et catégories d'objets — ces icônes doivent être fournies séparément
  (SVG) plutôt que résolues depuis le Manifest.
- **`<summary>` + `display: flex` direct** supprime le triangle natif de
  repli — toujours mettre le flex sur un élément interne (`<span>`).
- **`<select>` HTML natif** ne peut afficher que du texte dans ses
  `<option>`, jamais une image — contrainte à garder en tête pour toute
  future UI de filtre avec icônes.

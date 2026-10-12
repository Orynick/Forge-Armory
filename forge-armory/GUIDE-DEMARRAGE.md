# Guide de démarrage — Forge Armory (Windows, via Invite de commandes)

Suivez les étapes dans l'ordre. Ne sautez rien, même si une étape vous semble
évidente. Si quelque chose ne se passe pas comme décrit, **arrêtez-vous et
copiez-moi le message d'erreur exact** plutôt que d'essayer de deviner.

---

## Étape 1 — Installer Node.js (l'outil qui fait tourner l'appli)

1. Allez sur https://nodejs.org
2. Téléchargez la version **LTS** (le gros bouton vert, pas l'autre)
3. Ouvrez le fichier téléchargé (`.msi`) et cliquez "Suivant" partout, sans
   rien changer aux options par défaut
4. Une fois l'installation terminée, **redémarrez votre ordinateur**
   (important : sinon Windows ne reconnaît pas encore la commande `npm`)

### Vérifier que ça a marché

1. Appuyez sur la touche **Windows**, tapez `cmd`, appuyez sur Entrée
   (une fenêtre noire s'ouvre — c'est le "terminal", votre nouvel outil de
   travail pour cette appli)
2. Tapez exactement ceci puis Entrée :
   ```
   node --version
   ```
3. Vous devez voir apparaître quelque chose comme `v22.x.x`. Si vous voyez
   plutôt "n'est pas reconnu en tant que commande", revenez à l'étape 1.4
   (le redémarrage) — c'est la cause la plus fréquente.

---

## Étape 2 — Décompresser le projet

1. Téléchargez le fichier `forge-armory.zip` que je vous ai donné
2. Faites un clic droit dessus → **Extraire tout...**
3. Choisissez un endroit facile à retrouver, par exemple directement dans
   `Documents` (évitez les noms de dossiers avec des accents ou espaces
   compliqués, ex: `C:\Users\VotreNom\Documents\forge-armory`)
4. Vous devez obtenir un dossier `forge-armory` contenant des fichiers
   comme `package.json`, `README.md`, un dossier `src`...

---

## Étape 3 — Ouvrir un terminal DANS ce dossier précis

C'est l'étape où tout le monde se trompe au début : le terminal doit être
**positionné dans le bon dossier**, sinon les commandes suivantes échouent.

1. Ouvrez le dossier `forge-armory` dans l'Explorateur Windows
2. Cliquez une fois dans la barre d'adresse en haut (celle qui affiche le
   chemin du dossier), pour la sélectionner
3. Tapez `cmd` par-dessus et appuyez sur Entrée
4. Une fenêtre de terminal s'ouvre, déjà positionnée dans le bon dossier
   (vous devriez voir le chemin du dossier affiché dans le terminal)

---

## Étape 4 — Installer les dépendances du projet

Dans ce même terminal, tapez :

```
npm install
```

Puis Entrée. Ça va afficher plein de lignes qui défilent pendant 1 à 3
minutes (ça télécharge tous les "morceaux" nécessaires : React, Vite,
etc.). C'est normal, laissez-le travailler.

**Si ça affiche des lignes en jaune ("npm warn")** : ignorez, c'est normal.
**Si ça affiche une ligne en rouge ("npm error")** à la fin : copiez-la-moi.

À la fin, un nouveau dossier `node_modules` doit être apparu dans le
dossier du projet — c'est le signe que ça a fonctionné.

---

## Étape 5 — Vérifier que votre clé API est bien présente

1. Dans le dossier du projet, cherchez un fichier nommé `.env.local`
   (attention : Windows cache parfois les fichiers commençant par un
   point — si vous ne le voyez pas, allez dans l'Explorateur → onglet
   **Affichage** → cochez **Éléments masqués**)
2. Ouvrez-le avec le Bloc-notes (clic droit → Ouvrir avec → Bloc-notes)
3. Vérifiez qu'il contient bien vos 3 lignes (API Key, client_id, URL de
   redirection) — je vous les avais déjà données, donc ce fichier devrait
   déjà être prêt dans le ZIP

---

## Étape 6 — Lancer l'appli

Toujours dans le même terminal :

```
npm run dev
```

**Premier lancement seulement** : Windows va probablement afficher une
fenêtre de sécurité demandant d'installer un certificat local (à cause de
mkcert, l'outil qui active le HTTPS local requis par Bungie). Cliquez
**Oui**. C'est nécessaire et sans danger — ce certificat ne sert qu'à faire
fonctionner votre navigateur en HTTPS avec votre propre ordinateur.

Le terminal doit ensuite afficher quelque chose comme :
```
Local:   https://127.0.0.1:5173/
```

**Laissez ce terminal ouvert** tant que vous utilisez l'appli — c'est lui
qui la fait fonctionner. Si vous le fermez, l'appli s'arrête.

---

## Étape 7 — Ouvrir l'appli dans le navigateur

1. Ouvrez votre navigateur (Chrome, Edge...)
2. Allez précisément à l'adresse : **https://127.0.0.1:5173**
   (pas `localhost:5173` — Bungie refuserait la connexion ensuite)
3. Si le navigateur affiche un avertissement "Connexion non privée" ou
   similaire : c'est normal la première fois (certificat local). Cliquez
   sur **Avancé** puis **Continuer vers 127.0.0.1**.
4. Vous devriez voir l'appli s'afficher : titre "Forge Armory" avec le sous-titre "Destiny 2 Build Analyzer", un
   bloc de connexion, un bloc de recherche, un bloc "Mon Inventaire", un
   bloc "Personnage", un bloc "Doctrine (Pilier 1)", un bloc "Mon Build",
   et le score du build de démo tout en bas (avec ses 5 piliers)

---

## Étape 8 — Tester la connexion Bungie

1. Cliquez sur **Connexion Bungie.net**
2. Vous êtes redirigé vers une page bungie.net officielle — connectez-vous
   avec votre compte de jeu si demandé, puis cliquez **Autoriser**
3. Vous revenez automatiquement sur l'appli, le statut doit passer à
   **✅ connecté**
4. Votre nom Bungie (`pseudo#1234`) doit s'afficher après « Compte : », à
   gauche des boutons
5. Sinon, cliquez sur **Tester la connexion** pour relancer le chargement

Si une erreur s'affiche à l'écran à cette étape, copiez-la-moi telle quelle.

---

## Étape 9 — Tester la recherche

1. Dans le bloc "Recherche dans le Manifest", cliquez **Charger le
   Manifest (FR + EN)** — ça télécharge le Manifest en français ET en
   anglais (~200 Mo au total, une fois seulement — mis en cache ensuite),
   ça peut prendre quelques minutes selon votre connexion. **Les fois
   suivantes, il se recharge tout seul** au démarrage (« Vérification de
   la version du Manifest… »), sauf quand Bungie publie une nouvelle
   version : le bouton réapparaît alors, rien n'est téléchargé sans votre
   clic
2. Une fois chargé, tapez un mot **en français OU en anglais** (ex:
   "dévoration" ou "devour" — les deux fonctionnent et trouvent le même
   objet)
3. Les résultats doivent s'afficher en dessous, avec leur miniature
4. Un menu déroulant permet de filtrer par catégorie (Armes/Armure/
   Aspects/Fragments...) — par défaut, les objets de quêtes/missions et
   les ornements sont masqués (pas utiles pour construire un build)

---

## Étape 10 — Choisir votre personnage et sa Doctrine

1. Dans le bloc "Personnage & Doctrine", choisissez votre classe
   (Chasseur/Titan/Arcaniste) — 3 rectangles cliquables
2. Vos 6 sous-classes se chargent **automatiquement**, sans autre clic
3. Cliquez sur l'élément de votre choix (Solaire, Arc, Abyssal, Stase,
   Filobscur, Prismatique) — une grille apparaît avec vos Super, Aspects,
   Fragments, Mêlée, Grenade, Saut et Compétence de classe disponibles
4. Cliquez sur les options pour les sélectionner (une coche ✓ apparaît) —
   le nombre d'emplacements possibles est indiqué entre parenthèses
5. Un petit 🎮 indique ce qui est réellement équipé sur votre personnage
   en jeu en ce moment, pour vous repérer

---

## Étape 11 — Construire un build avec vos vrais objets

1. Dans le bloc Bungie.net, si ce n'est pas déjà fait, cliquez **Tester la
   connexion** — ça permet aussi de connaître vos personnages
2. Dans le bloc "Mon Inventaire", cliquez **Charger mon inventaire** — il
   s'affiche en 4 sections repliables (Chasseur / Titan / Arcaniste /
   Coffre), chacune avec ses propres sous-parties (Équipé/Inventaire pour
   les personnages, Armes/Armure pour le coffre)
3. Survolez un objet avec la souris pour voir ses perks (armes) ou ses
   stats (armure) sans avoir à l'ajouter d'abord
4. Cliquez **+ Ajouter** sur n'importe quel objet (inventaire ou
   recherche) — ça ne fait QUE modifier la copie locale dans votre
   navigateur, rien ne change en jeu à ce stade
5. Le bloc "Mon Build" récapitule tout ce que vous avez sélectionné
   (armes, armure, et la Doctrine choisie à l'étape 10). Sa section
   « Doctrine » est repliée au départ : cliquez sur son titre pour la
   déplier
6. Deux façons d'équiper réellement en jeu (action réelle et immédiate,
   une confirmation s'affiche à chaque fois) :
   - **Équiper** sur un objet précis
   - **Équiper le build en jeu** pour tout équiper d'un coup
   - ⚠️ Un avertissement s'affiche si votre build contient plus d'une arme
     ou plus d'une armure exotique (impossible d'en équiper deux à la fois
     en jeu)

💡 **Blocs repliables** : Mon Inventaire, Personnage & Doctrine, Mon
Build, Artefact et Partage du build ont un triangle ▶/▼ devant leur titre.
Un clic sur la ligne de titre les replie ou les déplie.

---

## Étape 12 — Enregistrer, revoir et partager un build

1. **Enregistrer** : ouvrez le panneau **🗂️ Loadouts** (l'onglet
   vertical collé au bord droit de l'écran), donnez un nom au build en
   cours, puis **+ Enregistrer**
2. **Revoir** : sur un build enregistré, le bouton **👁 Voir** affiche tout
   son contenu en une fois (doctrine, armes et perks, armure et mods,
   stats, artefact)
3. **Équiper en jeu** : le bouton **🎮 Équiper en jeu** équipe le build sur
   **le personnage de la classe du build** (un build Chasseur sur votre
   Chasseur), sans rien demander. Si le build n'a pas de classe, ou si vous
   avez plusieurs personnages de cette classe, une fenêtre vous invite à
   choisir le personnage ; si le compte n'a aucun personnage de cette
   classe, elle l'explique et ne touche à rien. Si le build contient aussi
   de la Doctrine (sous-classe, super, aspects, fragments...), une
   **check-list** s'ouvre ensuite : ce qu'il reste à régler à la main en jeu
4. **Modifier** : le bouton **Modifier...** ouvre une fenêtre pour changer
   le **nom**, la **description** et l'**icône** du build d'un coup
5. **Partager** : le bouton **⬇ Exporter...** d'un build enregistré ouvre
   une fenêtre de choix (**Copie texte**, **Export JPEG**, **PNG**, **PDF**
   ou **JSON**), sans avoir à ouvrir « Voir ». On retrouve les mêmes choix
   dans la fiche « Voir », et dans le bloc **Partage du build** (sous
   l'Artefact, pour partager le build en cours **sans l'enregistrer**) :
   cinq boutons :
   - **⬇ Exporter le fichier** : un fichier `.json` que votre ami importe
     avec le bouton **Importer** de ses Loadouts
   - **📋 Copier en texte** : à coller sur Discord ou ailleurs
   - **🖼 Image JPEG**, **🖼 Image PNG**, **📄 PDF** : une fiche illustrée
     avec les icônes du jeu — ⚠️ **uniquement dans le logiciel installé**
     (voir la section « Fabriquer le logiciel installable » du README) ;
     dans le navigateur, ces trois boutons sont grisés, c'est normal

---

## Étape 13 — Régler la pondération du score (facultatif)

Le score global mélange les 5 piliers avec des poids qui dépendent du
contexte choisi (Neutre, Roaming, DPS, PvP). Pour utiliser vos propres
poids :

1. Dans le bloc **0. Contexte du build**, cliquez **✏️ Personnaliser…**
2. Donnez un pourcentage à chaque pilier — le total doit faire **100 %**
3. Donnez un nom au réglage, puis **💾 Enregistrer et activer**
4. Le menu **Pondération** permet ensuite de changer de réglage, ou de
   revenir à **Automatique (selon le contexte)**

Le réglage choisi s'applique à tous vos builds et reste mémorisé.

---

## Étape 14 — Les fois suivantes

Vous n'aurez plus besoin de refaire les étapes 1 à 5. À chaque fois que
vous voulez utiliser l'appli :

1. Ouvrez un terminal dans le dossier du projet (étape 3)
2. Tapez `npm run dev`
3. Ouvrez https://127.0.0.1:5173

Si vous avez installé le logiciel Windows, lancez-le simplement depuis
son raccourci sur le bureau.

---

## Ce qui ne fonctionne pas encore (pour ne pas être surpris)

- **La Doctrine ne s'équipe pas automatiquement en jeu** : « Équiper le
  build en jeu » équipe les armes et armures, puis une fenêtre liste ce
  qu'il reste à régler à la main (sous-classe, aspects, fragments...).
- **Si un objet d'un build enregistré a été démantelé**, un avertissement
  « objet(s) introuvable(s) » s'affiche : le bouton **🔧 Réparer
  automatiquement** retrouve l'exemplaire actuel du même objet.
- **Les perks et mods des armes et armures ne se modifient pas encore**
  dans l'appli : c'est prévu (voir `TODO.md`).
- **L'export vers DIM est mis de côté** — le bouton existe mais échoue,
  pas de priorité de correction dessus actuellement.
- Consultez `TODO.md` (inclus dans le ZIP) pour la liste à jour de ce qui
  est en cours de test ou de correction.

---

## En cas de blocage

Revenez me voir avec :
- L'étape exacte où ça bloque (le numéro ci-dessus, de 1 à 14)
- Le message d'erreur complet, copié-collé (pas juste "ça marche pas")
- Une capture d'écran si possible

Il n'y a pas de question bête ici — le but, c'est que ça marche, pas que
vous deviniez tout seul.

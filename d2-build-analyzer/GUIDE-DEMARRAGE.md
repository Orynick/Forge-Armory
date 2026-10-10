# Guide de démarrage — D2 Build Analyzer (Windows)

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

1. Appuyez sur la touche **Windows**, tapez `powershell`, appuyez sur Entrée
   (une fenêtre bleue foncée ou noire s'ouvre — c'est le "terminal", votre
   nouvel outil de travail pour cette appli)
2. Tapez exactement ceci puis Entrée :
   ```
   node --version
   ```
3. Vous devez voir apparaître quelque chose comme `v22.x.x`. Si vous voyez
   plutôt "n'est pas reconnu en tant que commande", revenez à l'étape 1.4
   (le redémarrage) — c'est la cause la plus fréquente.

---

## Étape 2 — Décompresser le projet

1. Téléchargez le fichier `d2-build-analyzer.zip` que je vous ai donné
2. Faites un clic droit dessus → **Extraire tout...**
3. Choisissez un endroit facile à retrouver, par exemple directement dans
   `Documents` (évitez les noms de dossiers avec des accents ou espaces
   compliqués, ex: `C:\Users\VotreNom\Documents\d2-build-analyzer`)
4. Vous devez obtenir un dossier `d2-build-analyzer` contenant des fichiers
   comme `package.json`, `README.md`, un dossier `src`...

---

## Étape 3 — Ouvrir un terminal DANS ce dossier précis

C'est l'étape où tout le monde se trompe au début : le terminal doit être
**positionné dans le bon dossier**, sinon les commandes suivantes échouent.

1. Ouvrez le dossier `d2-build-analyzer` dans l'Explorateur Windows
2. Cliquez une fois dans la barre d'adresse en haut (celle qui affiche le
   chemin du dossier), pour la sélectionner
3. Tapez `powershell` par-dessus et appuyez sur Entrée
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
4. Vous devriez voir l'appli s'afficher : titre "D2 Build Analyzer", un
   bloc de connexion, un bloc de recherche, et le score du build de démo.

---

## Étape 8 — Tester la connexion Bungie

1. Cliquez sur **Connexion Bungie.net**
2. Vous êtes redirigé vers une page bungie.net officielle — connectez-vous
   avec votre compte de jeu si demandé, puis cliquez **Autoriser**
3. Vous revenez automatiquement sur l'appli, le statut doit passer à
   **✅ connecté**
4. Cliquez sur **Tester la connexion (profil + coffre)**
5. Vous devriez voir s'afficher vos personnages (classe + lumière) et le
   nombre d'objets dans votre coffre

Si une erreur s'affiche à l'écran à cette étape, copiez-la-moi telle quelle.

---

## Étape 9 — Tester la recherche

1. Dans le bloc "Recherche dans le Manifest", cliquez **Charger le
   Manifest** (ça télécharge ~100 Mo, ça peut prendre une minute ou deux
   selon votre connexion — le bouton affiche la progression)
2. Une fois chargé, tapez un mot dans le champ de recherche, par exemple
   le nom d'une arme que vous connaissez
3. Les résultats doivent s'afficher en dessous

---

## Étape 10 — Les fois suivantes

Vous n'aurez plus besoin de refaire les étapes 1 à 5. À chaque fois que
vous voulez utiliser l'appli :

1. Ouvrez un terminal dans le dossier du projet (étape 3)
2. Tapez `npm run dev`
3. Ouvrez https://127.0.0.1:5173

---

## En cas de blocage

Revenez me voir avec :
- L'étape exacte où ça bloque (le numéro ci-dessus)
- Le message d'erreur complet, copié-collé (pas juste "ça marche pas")
- Une capture d'écran si possible

Il n'y a pas de question bête ici — le but, c'est que ça marche, pas que
vous deviniez tout seul.

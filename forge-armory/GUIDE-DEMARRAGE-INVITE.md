# Forge Armory — Guide de démarrage (invité)

*Créé par Orynick/Orygamer.*

Bienvenue ! Ce guide vous permet de tester l'application avec **votre
propre compte Bungie.net**, sans toucher aux données de la personne qui
vous l'a partagée.

---

## Ce qu'il vous faut avant de commencer

- **Node.js** installé sur votre ordinateur (**version 24.22.1 ou plus
  récente** — les versions antérieures sont refusées par l'application).
  Si vous ne l'avez pas : téléchargez-le sur https://nodejs.org (choisissez
  la version "LTS" la plus récente).
- Un compte Bungie.net avec au moins un personnage Destiny 2.
- Windows : utilisez l'invite de commandes (`cmd`), pas PowerShell.

---

## Étape 1 — Extraire le projet

Décompressez le fichier ZIP reçu dans un dossier de votre choix (ex: votre
Bureau).

---

## Étape 2 — Installer les dépendances

1. Ouvrez un terminal (`cmd` sur Windows, Terminal sur Mac) **dans le
   dossier du projet** décompressé.
2. Tapez :
   ```
   npm install
   ```
3. Attendez que ça se termine (une seule fois, ça peut prendre une minute
   ou deux).

---

## Étape 3 — Lancer l'application

Dans le même terminal, tapez :
```
npm run dev
```

Un lien s'affiche, généralement `https://127.0.0.1:5173`. Ouvrez-le dans
votre navigateur.

⚠️ Votre navigateur va probablement afficher un avertissement de sécurité
("Ce site n'est pas sûr" ou équivalent) — c'est normal, l'application
tourne en local sur votre ordinateur avec un certificat auto-signé.
Cliquez sur "Avancé" puis "Continuer quand même" (le libellé exact dépend
de votre navigateur).

---

## Étape 4 — Se connecter avec VOTRE compte

1. Cliquez sur **Connexion Bungie.net**.
2. Autorisez l'accès sur la page Bungie qui s'ouvre — c'est **votre**
   compte, pas celui de la personne qui vous a partagé le projet.
3. Une fois revenu sur l'application, vos personnages se chargent
   automatiquement. (Le bouton **Tester la connexion**
   permet de relancer ce chargement si besoin.)

💡 Si vous testez sur le même ordinateur qu'une autre personne qui utilise
déjà l'appli, ouvrez une **fenêtre de navigation privée** pour ne pas
mélanger vos connexions.

---

## Étape 5 — Charger le Manifest (une seule fois)

Dans le bloc "Recherche dans le Manifest", cliquez sur **Charger le
Manifest (FR + EN)**. Ça télécharge les données du jeu (~200 Mo, une
seule fois — mis en cache ensuite). **Les fois suivantes, il se recharge
tout seul** au démarrage, sauf quand Bungie publie une nouvelle version :
le bouton réapparaît alors, et rien n'est téléchargé sans votre clic.

---

## Ce que vous allez voir — tour rapide de l'appli

| Bloc | À quoi ça sert |
|---|---|
| **Connexion Bungie.net** | Se connecter et tester la connexion |
| **Recherche dans le Manifest** | Chercher n'importe quel objet/perk du jeu, en français ou en anglais |
| **Mon Inventaire** | Vos personnages (Chasseur/Titan/Arcaniste) + votre Coffre, avec filtres et recherche |
| **Personnage & Doctrine** | Choisir votre classe : vos 6 sous-classes se chargent automatiquement. Puis régler la sous-classe (Super, Aspects, Fragments, Mêlée, Grenade, Saut, Compétence de classe) |
| **Mon Build** | Récapitulatif de tout ce que vous avez sélectionné (sa section Doctrine est repliée au départ : cliquez sur son titre) |
| **Artefact** | Choisir l'artefact et ses perks |
| **Partage du build** | Partager le build affiché sans l'enregistrer : fichier `.json` à importer, ou texte à coller sur Discord |
| **🗂️ Loadouts** (onglet au bord droit de l'écran) | Enregistrer vos builds, les recharger, les revoir en entier (**👁 Voir**), les importer ou les exporter |
| **0. Contexte du build** et score | Choisir le contexte (Neutre, Roaming, DPS, PvP), éventuellement vos propres poids (**✏️ Personnaliser…**), puis le score et le détail des 5 piliers |

💡 Les blocs qui ont un triangle ▶/▼ devant leur titre se replient et se
déplient d'un clic sur ce titre.

**Comment ça marche, en bref :**
1. Ajoutez des armes/armures depuis la recherche ou votre inventaire (bouton **+ Ajouter**) — ça ne change **rien** en jeu, juste dans l'appli.
2. Choisissez votre sous-classe et ses aspects/fragments dans le bloc Personnage & Doctrine.
3. Le score de votre build (5 piliers) s'affiche tout en bas, avec le détail de chaque pilier.

**Partager un build avec un ami** : le bouton **⬇ Exporter...** d'un build
enregistré (panneau **🗂️ Loadouts**) propose copie texte, image, PDF ou
fichier ; le bouton **⬇ Exporter le fichier** (fiche **👁 Voir** ou bloc
**Partage du build**) produit un fichier que
votre ami importe avec le bouton **Importer** de ses Loadouts. Chez lui,
les objets du build apparaissent d'abord « introuvables » (ce ne sont pas
les mêmes exemplaires) ; le bouton **🔧 Réparer automatiquement** les
remplace par les siens quand il possède les mêmes objets. Les boutons
**🖼 Image JPEG / PNG** et **📄 PDF** ne fonctionnent que dans le logiciel
installé : dans le navigateur, ils sont grisés, c'est normal.

---

## Deux boutons à connaître avant de les tester

- **"Équiper"** (sur une pièce dans "Mon Build") et **"Équiper le build
  en jeu"** : équipent **réellement** les objets sur votre personnage en
  jeu. Une confirmation s'affiche avant chaque action — ne testez que sur
  un objet sans conséquence si vous n'êtes pas sûr. La Doctrine, elle,
  reste à régler à la main en jeu : une fenêtre vous liste quoi faire.
- **"Exporter vers DIM (bêta / en chantier)"** : ne fonctionne pas
  encore, ignorez-le pour l'instant.

---

## Aucun risque pour votre compte

- La clé API et l'identifiant de l'application ne sont **pas des secrets
  personnels** — ils identifient juste "quelle application" se connecte à
  Bungie, pas qui l'utilise.
- Votre connexion est **totalement séparée** de celle de la personne qui
  vous a partagé le projet : chacun se connecte avec son propre compte,
  et Bungie ne mélange jamais les deux.

## Une seule demande : ne redistribuez pas cette archive

Cette clé d'application est enregistrée au nom de la personne qui vous a
partagé le projet. Elle ne donne accès à **aucune** de ses données, mais
Bungie limite son usage et peut la bloquer en cas d'abus — ce qui
couperait l'application pour tout le monde. Si quelqu'un d'autre veut
tester, demandez-lui de s'adresser directement à l'auteur plutôt que de
lui transmettre ce dossier.

Bon test !

# Dossier de sauvegarde des builds

Placez ici les fichiers `.json` exportés depuis le panneau **🗂️ Loadouts**
(bouton **⬇ Exporter**).

## Pourquoi ce dossier n'est pas rempli automatiquement

Une page web n'a pas le droit de choisir où elle écrit sur votre disque
(sécurité du navigateur). L'export atterrit donc dans votre dossier de
**téléchargements habituel** — typiquement `C:\Users\<vous>\Downloads` sous
Windows. Il faut ensuite déplacer le fichier ici à la main.

C'est la même limite que pour le téléchargement des Manifests depuis l'appli
(voir README).

## À quoi ça sert

Les loadouts vivent normalement dans le `localStorage` du navigateur, ce qui
veut dire qu'ils disparaissent si vous videz les données du site, et qu'ils ne
suivent pas d'un PC à l'autre. Un export déposé ici :

- survit à un nettoyage du navigateur ;
- peut être copié sur une clé USB ou un dossier synchronisé (OneDrive,
  Dropbox…) pour retrouver ses builds sur une autre machine ;
- peut être réimporté à tout moment via le bouton **⬆ Importer** (l'import
  **ajoute** aux loadouts existants, il ne les remplace pas).

## Conseil

Exportez après chaque session où vous avez créé ou modifié des builds. Le
fichier est nommé automatiquement avec la date (`loadouts-d2-AAAA-MM-JJ.json`),
donc conserver plusieurs exports successifs ne pose aucun problème et vous
donne un historique.

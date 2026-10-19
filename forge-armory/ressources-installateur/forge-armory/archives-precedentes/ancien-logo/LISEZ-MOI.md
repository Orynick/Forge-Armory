# Ancien logo (Spectre / Cryptarque) — conservé pour y revenir

Conservé le 01/10/2026, avant l'essai du logo **Forge Armory** (demande de
l'utilisateur : « garder l'ancien pour y revenir plus facilement »). Ce dossier
n'est pas embarqué dans le logiciel.

| Fichier | Contenu |
|---|---|
| `icon.ico` | Ancienne icône Windows (Spectre) : installateur, désinstallateur, raccourci, barre des tâches, fenêtre |
| `favicon.svg` | Ancien favicon (Spectre sur rond bleu nuit) |
| `ancien-en-tete.txt` | Code exact de l'ancien en-tête de l'appli (Cryptarque à gauche, Spectre à droite) et de l'ancien favicon |
| `forge-armory-v1/` | **Première version du logo Forge Armory** (essai du 30/09 au 01/10/2026, avant l'image d'identité définitive) : image d'origine `logo-v1-source.png` et son script `generer-icones-v1.py` (régénère icône, favicons et logo d'en-tête de cette version ; à lancer depuis la racine du projet après l'avoir recopié dans `ressources-installateur/forge-armory/` avec l'image sous le nom `logo-forge-armory-source.png`) |

## Revenir à l'ancien logo (4 gestes, de l'ordre de 2 minutes pour Claude)

1. **Icône Windows** : copier `ancien-logo/icon.ico` par-dessus
   `ressources-installateur/icon.ico`.
2. **Favicon** : copier `ancien-logo/favicon.svg` dans `public/`, puis dans
   `index.html` remplacer les trois lignes `<link rel="icon" ... .png>` par la
   ligne d'origine (dans `ancien-en-tete.txt`, partie 3). Les `favicon-*.png`
   de `public/` peuvent alors être supprimés.
3. **En-tête de l'appli** : dans `src/pages/DashboardPage.tsx`, remplacer `<EnTeteApp />`
   par l'ancien bloc `<h1>` et remettre les deux imports (`ancien-en-tete.txt`, parties 1
   et 2) ; `public/logo-forge-armory-embleme.png` et `-texte.png` peuvent alors être supprimés.
4. Refabriquer l'installateur (`npm.cmd run build`, puis
   `npm.cmd run electron:build`) et réinstaller.

Astuce : Windows garde les icônes en mémoire. Si l'ancienne (ou la nouvelle)
icône persiste après une réinstallation, voir la note de `A-TESTER.pdf`.

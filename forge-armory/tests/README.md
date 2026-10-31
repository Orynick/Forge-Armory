# Tests du projet

Ce dossier contient les tests automatiques de Forge Armory. Ils servent à vérifier, après chaque modification, que rien n'a été cassé. **Ils ne sont pas nécessaires pour utiliser l'application.**

## Tout rejouer

Depuis la racine du projet : `node tests/lancer-tout.mjs`

Le programme affiche une ligne par série (✅ ou ❌) et le total des contrôles. Il se termine par un code d'erreur si un seul contrôle échoue.

## Contenu

| Dossier | Contenu |
|---|---|
| `logique/` | Tests de la logique, sans navigateur : visuels et catalogue, icônes (comparées à un instantané du rendu d'avant), export infographique, filtre d'élément, diagnostic des icônes. Chaque test se lance avec `node tests/logique/lancer.mjs <fichier>.test.ts`. |
| `ui/` | Tests d'interface dans un vrai navigateur (Playwright) avec les VRAIS composants et la VRAIE feuille de style : sélecteur à quatre boutons, inventaire (« Aller à », filtres). On construit d'abord la page : `node tests/ui/build.mjs <nom>`, puis `python3 tests/ui/<nom>.py`. |
| `logique/instantanes/` | Rendus de référence (icônes) pris sur le code d'avant un changement, pour prouver qu'un remaniement n'a rien changé à l'affichage. |
| `ui/faux/` | Faux modules (faux inventaire) utilisés à la place de ce qui interroge Bungie. |

## Ce qu'il faut pour les lancer

Node (déjà requis par le projet) ; `esbuild` et `react` (installés par `npm install`) ; pour les tests d'interface, Python 3 avec Playwright et un navigateur Chromium (variable `CHROME_PATH` si besoin). Les dossiers `_sortie/` sont des fichiers temporaires : on peut les supprimer.

## Limites

Ces tests n'appellent jamais Bungie et n'utilisent jamais le vrai Manifest : la lecture du Manifest est simulée par une fausse base (mêmes appels que la vraie). Ils ne remplacent pas les tests en jeu de la liste `A-TESTER`. Le typage strict n'est vérifié que par `npm run build` (`tsc -b`).

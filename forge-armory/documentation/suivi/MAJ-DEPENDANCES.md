# Mise à jour des dépendances majeures — chantier `draft-deps`

Créé le 20/10/2026, à la suite du merge de la PR #6 (branche `draft-sec`).

## Pourquoi un chantier séparé

Les mises à jour de **Vite** et **React** sont des montées de version **majeure**
(cassantes). Les faire en même temps que d'autres travaux masquerait la cause
d'un éventuel problème. Ce chantier est dédié, sur sa propre branche `draft-deps`.

## État des lieux (20/10/2026)

| Dépendance | Actuelle (lock) | Dernière  | Cible | Remarque |
|---|---|---|---|---|
| `react` | 18.3.1 | 19.2.9 | **19.x** | Majeur cassant (voir notes ci-dessous) |
| `react-dom` | 18.3.1 | 19.2.9 | **19.x** | À monter **en même temps** que react |
| `@types/react` | 18.3.x | 19.3.0 | **19.x** | À monter avec react |
| `@types/react-dom` | 18.3.x | 19.3.0 | **19.x** | À monter avec react |
| `react-router-dom` | 6.30.6 | 7.18.4 | 7.x (optionnel) | Compatible React 18 **et** 19 — peut attendre |
| `vite` | **7.3.7** ✅ | 8.3.4 | **7.x** d'abord | Palier 2 terminé |
| `@vitejs/plugin-react` | **5.2.0** ✅ | 6.1.2 | **5.2.0** | Palier 2 terminé (accepte Vite 4→8) |
| `vite-plugin-mkcert` | **2.1.0** ✅ | 2.1.0 | 2.x | Palier 2 terminé (compatible Vite >=3) |
| `typescript` | 5.9.3 | 7.0.2 | 5.9.x (conservateur) | TS 7 est très récent — attendre la maturité |
| `electron` | **44.9.3** ✅ | 44.9.3 | 44.9.3 (patch) | Palier 1 terminé |
| `sql.js` | **1.15.1** ✅ | 1.15.1 | 1.15.1 (patch) | Palier 1 terminé |

## Stratégie recommandée (par paliers)

### Palier 1 — Mises à jour mineures (sûr, rapide) ✅ **TERMINÉ**
- `electron` 44.9.0 → **44.9.3** ✅
- `sql.js` 1.15.0 → **1.15.1** ✅
- `typescript` 5.9.3 → **5.9.3** (déjà à jour, pas de changement nécessaire) ✅

**Résultat** : `npx tsc -b` OK, `npx vite build` OK, 36/36 suites de tests, 708/708 contrôles réussis.

### Palier 2 — Vite 5 → 7 (majeur, mais plugin-react 5.2.0 compatible) ✅ **TERMINÉ**
- `vite` 5.4.21 → **7.3.7** ✅
- `@vitejs/plugin-react` 4.7.0 → **5.2.0** ✅ (dernier 5.x, accepte Vite 4 à 8)
- `vite-plugin-mkcert` 1.17.12 → **2.1.0** ✅ (compatible Vite >=3)
- ⚠️ **Ne pas viser Vite 8 directement** : `@vitejs/plugin-react@6` (requis pour
  Vite 8) embarque `babel-plugin-react-compiler` et `@rolldown/plugin-babel` —
  c'est un changement d'architecture (Rolldown) qui mérite son propre test.

**Compatibilité vérifiée** :
- `@vitejs/plugin-react@5.2.0` : peer `vite: ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0` ✅
- `vite-plugin-mkcert@2.1.0` : peer `vite: >=3` ✅
- Vite 7.3.7 : Node `^20.19.0 || >=22.12.0` — on a Node 22.23.3 ✅

**Résultat** : `npx tsc -b` OK, `npx vite build` OK (196 modules), 36/36 suites de tests, 708/708 contrôles réussis.

### Palier 3 — React 18 → 19 (majeur cassant)
- `react` + `react-dom` 18.3.1 → **19.2.9** (toujours monter les deux ensemble)
- `@types/react` + `@types/react-dom` → **19.3.0** (avec)
- `react-router-dom` 6.30.6 → **7.18.4** (compatible React 19, migration
  possible en même temps ou après)

## Changements cassants connus à vérifier

### React 19
- `react-dom/test-utils` supprimé → utiliser `@testing-library/react`
- `ReactDOM.render` / `hydrate` supprimés → utiliser `createRoot` (déjà le cas
  dans `main.tsx` ✅)
- `PropTypes` et `defaultProps` pour les fonctions supprimés
- `ref` comme prop pour les function components (nouveau comportement)
- `useRef` nécessite un argument initial
- Changements de typage dans `@types/react@19` (plus stricts)

### Vite 6 / 7
- Vite 6 : fin du support de Node 18 (Node 20+ requis) — vérifier la version
  de Node visée pour les contributeurs
- Vite 6 : `resolve.conditions` par défaut changé
- Vite 7 : quelques suppressions de deprecated APIs
- Vérifier `vite.config.ts` (mkcert, `base: "./"`, plugin CSP custom)

### react-router-dom 7
- Quelques renommages d'API (`useLoaderData` → typage, etc.)
- Migration progressive possible

## Plan de travail proposé

1. **Palier 1** (patchs) → commit séparé, test complet
2. **Palier 2** (Vite 7 + plugin-react 5.2.0) → commit séparé, test complet
3. **Palier 3** (React 19 + types + router 7) → commit séparé, test complet
4. Chaque palier = sa propre PR (ou au moins son propre commit bien nommé)
5. Tests à chaque étape : `npx tsc -b`, `npx vite build`,
   `node tests/lancer-tout.mjs`, tests UI Playwright sur Windows

## Commandes utiles

```bash
# Voir les versions disponibles
npm view react@19 version
npm view vite@7 version

# Voir les peer dependencies (compatibilité)
npm view @vitejs/plugin-react@5.2.0 peerDependencies

# Mettre à jour une dépendance
npm install react@19 react-dom@19
npm install -D vite@7 @vitejs/plugin-react@5

# Vérifier les conflits
npm ls react react-dom vite

# Build + tests
npx tsc -b && npx vite build
node tests/lancer-tout.mjs
```

## Notes

- La branche `draft-deps` part de `main` post-merge PR #6 (commit `0c07ac3`).
- Le suffixe de version chantier affichera `0.4.14.deps` sur cette branche
  (merci au mécanisme `draft-*` de `vite.config.ts`).
- Ne pas oublier de mettre à jour `package-lock.json` (inclus dans les commits).
- Electron 44 embarque Chromium récent : vérifier que React 19 et Vite 7
  fonctionnent bien dans le contexte Electron (pas de souci attendu).

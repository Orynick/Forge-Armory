# SPEC — Avertissement « cache du navigateur » (version Web) — 2026-11-14

**Statut :** validée par l'utilisateur le 14/11/2026 (décisions ci-dessous tranchées par lui).
**Branche :** `draft-avertissement-cache-web`

## 1. Contexte

Les builds (loadouts) sont stockés dans le `localStorage` dans les DEUX versions de Forge Armory (`src/lib/loadouts/stockage.ts`) :
- **version Web** : cache du navigateur — volatile (vider les données du site ou changer de navigateur les efface), ne suit pas le compte Bungie ;
- **version installée** : le même localStorage vit dans le dossier de données persistant de l'application (`%APPDATA%`).

L'export **JSON réimportable existe déjà** (`exporterLoadouts`/`importerLoadouts`, même format dans les deux versions : un build exporté depuis le site s'importe dans l'application installée et inversement), de même que les exports texte, JPEG/PNG et PDF.

**Demande de l'utilisateur (14/11/2026)** : en version Web, avertir à la sauvegarde d'un build que celui-ci est conservé dans le cache du navigateur, parler des exports, et proposer un export JSON compatible avec la version installable (→ déjà existant, référencé par l'avertissement).

## 2. Périmètre

- `src/lib/avertissementCacheWeb.ts` (NOUVEAU — logique pure) ;
- `src/components/AvertissementCacheWeb.tsx` (NOUVEAU — bandeau) ;
- `src/components/PanneauLoadouts.tsx` (rendu du bandeau) ;
- `src/index.css` (styles du bandeau) ;
- `tests/logique/avertissement-cache-web.test.ts` (NOUVEAU) + `tests/logique/lancer.mjs` (define `__VERSION_APP__`, parité avec Vite) ;
- documentation : NOTICE, README, DEVLOG, cette spec, INDEX des specs.

## 3. Hors périmètre

- Toute modification du stockage des loadouts, du format JSON, des exports existants ;
- La version installée (aucun bandeau — son stockage est déjà persistant) ;
- Le dev local (bandeau jamais affiché : `__WEB__` est faux).

## 4. Comportement décidé

1. **Bandeau** « ⚠️ Builds conservés dans le cache de ce navigateur » en HAUT du panneau Load-outs — les DEUX présentations (tiroir latéral et onglet « Load-outs ») partagent `PanneauLoadouts`, donc le portent automatiquement. Visible **à chaque sauvegarde** (le bandeau est persistant tant que la coche n'est pas cochée — décision utilisateur : « le message est aussi persistant ailleurs sur Forge Armory, donc pas de risque que l'utilisateur ne le voit pas ») ;
2. **Raccourci direct** « ⬇ Exporter en JSON » : ouvre la fenêtre « Exporter... » existante du DERNIER build sauvegardé (premier de la liste). Masqué s'il n'y a aucun loadout ;
3. **Coche « Ne plus afficher cet avertissement »** : mémorisée dans le `localStorage` (clé `forge-armory-avertissement-cache-web`, `'1'` = masqué, `'0'` = réaffiché ; valeur parasite = affiché, choix prudent). **Pas de bouton de fermeture ✕** : la coche suffit (décision utilisateur) ;
4. **Version Web uniquement** (`__WEB__`, posée par `vite.config.ts` pour le build Netlify) — jamais l'appli installée, jamais le dev local ;
5. **Résilience** : `localStorage` indisponible ou refusé (mode privé strict) → l'avertissement s'affiche (jamais masqué à tort), la coche n'est pas mémorisée sans bloquer l'interface ;
6. **Styles** : mêmes couleurs que le bandeau « session expirée » (fond `#2a2418`, bordure `#6b5a2a`, titre `#e0c080`, texte `#b7b3a8`, coche `#9a968a`) — aperçu validé par l'utilisateur.

## 5. Critères d'acceptation (testables)

1. Le bandeau ne s'affiche QUE si version web ET coche absente (test logique, matrice 2×2) ;
2. La coche est lue/écrite sous la clé dédiée, avec repli prudent sur toute erreur de stockage (test logique) ;
3. Le raccourci n'apparaît que s'il existe au moins un loadout, et ouvre la fenêtre d'export du premier de la liste (câblage) ;
4. Le texte mentionne le compte Bungie, le vidage des données, le JSON réimportable dans l'application installée, et les autres exports (test logique) ;
5. `npx tsc -b` : 0 erreur ; `npm run test:logique` : N/N (65 suites attendues) ; `npm run build` : OK ; CI verte ;
6. Aucune modification hors périmètre (Article V) : diff limité aux fichiers du §2.

## 6. Décisions de l'utilisateur (consignées)

| Date | Décision |
|---|---|
| 14/11/2026 | Avertissement à CHAQUE sauvegarde, avec coche « ne plus afficher » |
| 14/11/2026 | Bandeau visible (pas un simple message discret) — aperçu validé |
| 14/11/2026 | Raccourci « Exporter en JSON » direct dans le bandeau |
| 14/11/2026 | Le raccourci ouvre le menu « Exporter... » existant (suggestion acceptée) |
| 14/11/2026 | Pas de bouton ✕ : la coche suffit |
| 14/11/2026 | Bandeau aussi dans l'onglet de gestion Load-outs ET le panneau latéral (même composant → automatique) |

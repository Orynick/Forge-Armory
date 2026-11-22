# SPEC — mobile-phase-2 (adaptation de l'affichage sur téléphone)

**Date :** 2026-11-19 (ébauche)
**Statut :** brouillon — rédigée EN AVANCE pour préparer le chantier ; ses §2 et §3 ne seront verrouillés qu'avec le **relevé d'affichage** du `A-TESTER-0.7.2` (phase 0). Aucun code tant qu'elle n'est pas validée (Constitution, Article VI).
**Branche de travail :** à décider (une `draft-…` dédiée, comme d'habitude ; `draft-pwa` reste la branche publiée du site)
**Version de l'appli à la rédaction :** 0.7.1
**Version visée :** à décider (0.7.x ; probablement 0.8.0 si l'adaptation est étendue, 0.7.3 si elle est ciblée — à trancher avec l'utilisateur)
**Prérequis :** phase 0 livrée et validée sur Android (PR #44, fusionnée le 19/11/2026) ; déploiement Netlify du site à jour ; `A-TESTER-0.7.2` déroulé.

---

## 1. Objectif

Que Forge Armory **se lise et se manipule correctement sur un téléphone Android** (Chrome visé, Firefox accepté) sur `https://forge-armory.orynick.fr` — sans toucher au comportement sur PC (site ou logiciel installé), qui reste la référence.

> Contexte : la phase 0 (spec `SPEC-MOBILE-PHASE-0-2026-11-05`) a mesuré la tenue du téléphone **sans adapter l'affichage**, volontairement. Elle a livré : Manifest français seul sur téléphone, diagnostic mobile, connexion durcie, progression d'indexation. Cette phase 2 consomme le **relevé d'affichage** du A-TESTER (liste guidée des débordements et irritants) et n'agit QUE dessus.
>
> Ordre décidé le 05/11/2026 : si le critère 7 de la phase 0 (l'analyse d'un build tient-elle sans fermer l'onglet ?) **échouait**, la phase 4 (Manifest allégé) remontait AVANT cette phase 2. À la rédaction de cette ébauche, le verdict n'est pas encore connu : cette spec ne s'applique que si le verdict est « l'onglet tient ».

## 2. Comportement attendu (À VERROUILLER avec le relevé d'affichage)

- **Rien ne déborde** : plus de colonne coupée, de bouton masqué, de texte tronqué — le contenu s'adapte à la largeur (défilement vertical ou empilement, jamais de zoom forcé).
- **Les zones tactiles sont exploitables au doigt** : boutons, onglets, cases à cocher et menus d'une taille et d'un espacement suffisants (cible ≥ 44 px, à confirmer).
- **La lisibilité prime** : contrastes et tailles de police conservés ; aucune information accessible sur PC ne disparaît sur téléphone (elle peut être repliée, jamais supprimée).
- **La pop-up « Détails »**, l'infographie et les tableaux — les trois zones signalées comme à risque au développé de la phase 0 — sont utilisables sur petit écran (le « comment » dépend du relevé).
- **PPC inchangé** : toute adaptation mobile est invisible sur grand écran (requêtes média par largeur, ou repli détection téléphone `lib/appareil.ts`).

`[À compléter avec le relevé du A-TESTER-0.7.2 : liste page par page des débordements/irritants et, pour chacun, le correctif proposé]`

## 3. Périmètre (`[provisoire — à ajuster avec le relevé]`)

- `src/index.css` / styles existants : requêtes média (points de rupture ≤ 900 px, cohérents avec l'appareil), tailles tactiles, empilement des colonnes.
- Les composants signalés par le relevé (attendus : `PopUpDetails.tsx` ou équivalent, infographie/export, tableaux, `DashboardPage`, onglets) ; liste fermée après relevé.
- Aucune modification de logique métier : scoring, Doctrine, Forge, Optimiseur, Legendarium ne changent PAS (Article V) — l'affichage seul bouge.
- Tests (Article III) : contrôle de câblage (points de rupture présents et cohérents), captures d'écran étroites comparées si le dépôt le permet déjà.
- Documentation : `CHANGELOG.md`, `DEVLOG.md`, `TODO.md`, `documentation/specs/INDEX.md`, `A-TESTER-<version>`.

### Hors périmètre (explicite)

- **Pas de couche PWA** : ni fiche d'application, ni service worker, ni icônes d'installation (phase 3).
- **Pas d'allègement du Manifest** au-delà du français seul déjà livré (phase 4, déclenchée seulement si le relevé mémoire l'exige).
- **Logiciel installé (`electron/`) : aucune modification** ; PC (site et `npm run dev`) : rendu inchangé.
- Pas de nouvelle fonctionnalité, pas de changement de comportement même sur téléphone : cette phase corrige des irritants d'affichage, elle n'ajoute rien.
- iPhone : toujours non visé (décision du 05/11/2026).

## 4. Règles métier et contraintes

- **Article X (données)** : aucune clé de stockage renommée ni déplacée.
- **Article II (écriture chez Bungie)** : aucun ajout, aucun changement.
- La CSP actuelle est conservée telle quelle.
- La détection « téléphone » existante (`lib/appareil.ts`) est réutilisée telle quelle : elle est déjà testée (`tests/logique/appareil.test.ts`).

## 5. Critères d'acceptation (testables, `[à affiner avec le relevé]`)

Sur téléphone Android, site à jour, en Wi-Fi :

1. Chaque page/onglet listée dans le relevé est corrigée et validée par l'utilisateur (`X/X` irritants corrigés, à consigner dans le DEVLOG).
2. Aucun débordement horizontal sur les largeurs 360, 412 et 768 px (Chrome devtools et/ou réel).
3. Les menus, onglets et boutons se manipulent au doigt sans faux clics.
4. La pop-up « Détails » s'ouvre, se lit et se ferme sur téléphone.
5. Sur PC (site et `npm run dev`) : rendu strictement inchangé (vérification visuelle rapide sur 3-4 pages).

Automatisés :
6. `tsc -b` : 0 erreur ; batterie logique N/N suites (aucune régression, déflexions ajoutées documentées).
7. `npm run build` + build web (`NETLIFY=1`) : OK.
8. CI GitHub Actions verte sur la PR.

## 6. Vérifications requises (remplies à la livraison)

- [ ] `npx tsc -b` : 0 erreur
- [ ] `npm run test:logique` : N/N suites, M/M contrôles
- [ ] `npm run build` + construction web (`NETLIFY=1`) : OK
- [ ] CI verte sur la PR ; diff vs `main` limité au périmètre §3
- [ ] Déploiement Netlify réussi (selon crédits)
- [ ] Validation utilisateur : X/X relevés corrigés (DEVLOG)
- [ ] Entrée DEVLOG + mise à jour INDEX

## 7. Risques et points d'attention

- **Le relevé d'affichage découpe le chantier** : sans lui, pas de périmètre fermé (Article V). S'il est long, découper la phase 2 en 2a (irritants majeurs) et 2b (le reste).
- **Régressions PC** : chaque règle CSS doit être sous requête média ; re-vérifier visuellement le rendu PC avant livraison.
- **La pop-up et l'infographie** sont les zones les plus risquées (composants denses, petites zones cliquables) ; à juger sur relevé.
- **Poids du chantier** : si le relevé révèle une refonte du menu/onglets (et non des retouches), la version visée devient probablement 0.8.0 — décision utilisateur.

## 8. Points à clarifier avant codage

1. `[Relevé d'affichage du A-TESTER-0.7.2]` — la liste fermée des irritants, condition du §3.
2. Verdict du critère 7 de la phase 0 : si l'onglet ne tient pas la charge, cette phase 2 cède la priorité à la phase 4.
3. Découpage 2a/2b si le relevé est long ; version visée (0.7.3 vs 0.8.0).
4. Branche de travail et priorité relative aux autres chantiers en attente (TODO).

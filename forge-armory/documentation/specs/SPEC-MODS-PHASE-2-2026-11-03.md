# SPEC — mods-phase-2

**Date :** 2026-11-03
**Statut :** décisions verrouillées par l'utilisateur le 03/11/2026 (variante A ; objets du Coffre modifiables ; scope OAuth `MoveEquipDestinyItems` confirmé par la doc Bungie) — prête pour la phase de codage.
**Branche prévue :** `draft-mods-phase-2` (préparation uniquement — aucun code tant que la spec n'est pas validée)
**Version de l'appli à la rédaction :** 0.5.7
**Version visée :** 0.6.0 (première écriture de perks/mods chez Bungie : passage de palier à justifier dans le DEVLOG à la livraison)

---

## 1. Objectif

Appliquer **réellement en jeu** les perks (armes) et mods (armes et armures) que l'utilisateur a déjà simulés dans la Forge — niveau 2 du TODO §2, tranché le 24/10/2026 : « En jeu : appliquer réellement le changement sur l'objet ».

> Contexte : la Phase 1 (simulation locale) est **livrée et validée** en v0.5.6/v0.5.7 (armes depuis la 0.4.x, armures via PR #19 : budget d'énergie, lien score, boutons Forge des fenêtres Détails). Le point d'avancement du 02/11/2026 place la Phase 2 en décision à cadrer avant de coder. Un diagnostic `InsertSocketPlugFree` existe déjà (`diagnostiquerInsertionPlug`, `src/lib/bungie/equiper.ts`) : il tente UNE insertion réelle derrière une confirmation et rapporte la réponse brute de Bungie — il a été conçu pour la doctrine mais prouve la mécanique d'appel. Rien d'autre ne doit bouger : ce chantier n'ajoute aucune lecture nouvelle, seulement l'écriture.

## 2. Comportement attendu (verrouillé à la validation)

Dans la fenêtre Forge d'une arme ou d'une armure possédée (vue Inventaire), l'utilisateur choisit ses perks/mods comme aujourd'hui (simulation inchangée), puis :

1. un bouton **« Appliquer en jeu »** apparaît, **uniquement** pour les pièces possédées (`itemInstanceId` réel) et uniquement si la sélection simulée **diffère** de l'état réel de l'objet ;
2. un **écran de confirmation** liste précisément ce qui va être écrit : objet, personnage porteur, chaque socket (index, nom du perk/mod actuel → nom du perk/mod visé), et l'avertissement « ces changements s'appliquent à ton compte Destiny 2, pas seulement à l'appli » ;
3. à la confirmation, l'appli insère les plugs **un par un, dans l'ordre affiché**, via `POST /Destiny2/Actions/Items/InsertSocketPlugFree/` ;
4. chaque insertion réussie est signalée (✓) ; un échec **arrête la chaîne** et affiche le `ErrorCode`/`ErrorStatus`/`Message` exact de Bungie avec un conseil (ex. 401/403 = autorisation, refus logique = plug non autorisé sur ce socket, limite du jeu) ; **rien n'est jamais annulé automatiquement** ;
5. après un succès complet, l'inventaire local est **re-lecture** (refresh Bungie) pour que Détails, Mon Build et le score repartent de l'état réel ; le badge « simulé » disparaît car il n'y a plus d'écart ;
6. **objet dans le Coffre (verrouillé le 03/11/2026) : les objets du Coffre DOIVENT être modifiables eux aussi** — l'insertion est tentée directement sur l'objet du Coffre (`itemInstanceId` réel, personnage porteur = le coffre) ; si Bungie refuse l'écriture sur un objet hors personnage, l'`ErrorCode`/`Message` exact est affiché tel quel (conformément au point 4), sans contournement (aucun transfert automatique — hors périmètre 3.2).

Sont **exclus** de l'écriture, comme de la simulation : ornements, revêtements (shaders), compteurs/trackers, mementos (sauf « Memento Mori », vrai perk) — la liste exclue est celle déjà maintenue pour l'affichage (protection de `obtenirPlugsDetailles`).

## 3. Périmètre

### 3.1 Dans le périmètre (fichiers / fonctionnalités concernés)

- `src/lib/bungie/equiper.ts` : nouvelle fonction d'insertion réelle `insererPlug(...)` bâtie sur le squelette de `diagnostiquerInsertionPlug` (mêmes en-têtes, même corps de requête, analyse `ErrorCode`) ; le diagnostic existant est conservé tel quel ;
- `src/lib/forge/` : export de l'état simulé « applicable » (écarts réels vs simulés, par `socketIndex`/`plugItemHash`) — petite extension des modules existants (`simulation.ts`, `storeSimulations.ts`), sans toucher au calcul du score ;
- `src/components/PageForge.tsx` (+ fenêtre de l'arme/de l'armure) : bouton « Appliquer en jeu », écran de confirmation, affichage de la progression socket par socket, gestion d'erreur ;
- `src/lib/bungie/inventaire.ts` : déclenchement du re-lecture après succès (fonction existante, appel supplémentaire) ;
- `tests/logique/` : nouvelle suite sur la constitution de la liste d'écarts (réel vs simulé) et sur l'exclusion des sockets interdits ;
- `TODO.md` / `DEVLOG.md` : suivi.

### 3.2 Hors périmètre (explicite — règle anti-régression, Article V)

- RIEN d'autre que la liste 3.1 ne doit être modifié. Toute modification hors périmètre doit être justifiée par écrit dans la PR.
- Ne pas toucher : moteur de scoring, fenêtres Détails (autre que le bouton déjà existant), Collection, Load-outs, Optimiseur, Legendarium, doctrine, OAuth (les droits déjà demandés suffisent : **vérifié le 03/11/2026 dans la doc Bungie** — `InsertSocketPlugFree` requiert le scope `MoveEquipDestinyItems`, n'exige PAS « Advanced Write Action » ; l'appli ne passe pas de paramètre `scope` dans son URL d'autorisation (`oauth.ts`) : le scope est déclaré dans le portail d'application Bungie.net, il suffit qu'il y soit coché — seul point de contrôle utilisateur avant codage).
- Aucune écriture « en lot » non confirmée, aucun transfert ni équipement d'objet (chantiers séparés).

## 4. Règles métier et contraintes

- **Contraintes Bungie (Article II) : Phase 2 DÉCLARÉE ici** — ce chantier écrit chez Bungie via `InsertSocketPlugFree` (insertion gratuite, sans matériaux). C'est la première écriture de perks/mods de l'appli (l'équipement et le transfert d'objets existent déjà par ailleurs). Garde-fous : confirmation explicite listant chaque socket, un plug par appel, arrêt au premier échec, jamais d'annulation automatique, journal complet dans les outils de diagnostic.
- **Limites connues du jeu (à vérifier avant codage, point 12 des « points à trancher »)** : les perks d'une arme à rolls aléatoires NON façonnée ne sont probablement **pas modifiables** via l'API ; l'endpoint a aussi été historiquement restreint pour les applications tierces. La spec distingue donc deux livrables possibles :
  - **Variante A (recommandée)** : première livraison = **mods d'armure uniquement** (usage confirmé par les autres outils), le bouton « Appliquer en jeu » des armes n'apparaît que si l'insertion est tentée et autorisée — avec le diagnostic existant pour trancher sur le compte réel de l'utilisateur ;
  - **Variante B** : perks d'armes et mods d'armure d'un coup si le diagnostic le prouve.
  - **Décision verrouillée le 03/11/2026 : VARIANTE A** — première livraison = mods d'armure uniquement ; les perks d'armes restent hors écriture dans ce chantier (chantier séparé si le diagnostic les prouve réalisables plus tard).
- Règles de scoring impactées : **aucune** — le score continue de consommer la simulation ; après re-lecture, réel et simulation convergent naturellement.
- Persistance / migration : aucune nouvelle donnée persistée ; l'état simulé existant (`storeSimulations`) est consommé tel quel, puis vidé pour l'objet appliqué après re-lecture réussie.
- Coût matériaux : l'endpoint « Free » n'en consomme pas ; si Bungie refuse un plug payant, l'erreur est affichée telle quelle (aucune gestion de matériaux dans l'appli).

## 5. Critères d'acceptation (testables)

1. Sans sélection simulée différant du réel, le bouton « Appliquer en jeu » n'apparaît pas (test logique) ;
2. La liste de confirmation montre exactement les sockets qui vont être écrits, et aucun socket exclu (ornement/shader/tracker/memento) n'y figure jamais (test logique) ;
3. Chaque appel émis est bien `InsertSocketPlugFree` avec `itemInstanceId`, `socketIndex`, `plugItemHash` corrects (espion réseau des outils de diagnostic, comme en 0.4.12) ;
4. Un échec simulé (refus ErrorCode) arrête la chaîne et affiche le message Bungie exact, sans écrire les sockets suivants ;
5. Après succès sur l'objet réel de l'utilisateur : re-lecture de l'inventaire, badge « simulé » retiré, score recalculé sur l'état réel — **à valider par l'utilisateur en jeu** ;
6. `npx tsc -b` : 0 erreur ; `npm run test:logique` : N/N suites ; `npm run build` : OK ; CI verte.

## 6. Vérifications requises (remplies à la livraison)

- [x] `npx tsc -b` : 0 erreur (03/11/2026)
- [x] `npm run test:logique` : 55/55 suites, 1114/1114 contrôles (03/11/2026 — nouvelle suite `ecarts-simulation.test.ts`, 10 contrôles ; aucune suite existante modifiée)
- [x] `npm run build` : OK (03/11/2026)
- [ ] CI GitHub Actions verte sur la PR (à cocher après le push)
- [x] Diff vs `main` limité au périmètre 3.1 (Article V) — `InventaireArmes.tsx` et `FenetreDetailsPiece.tsx` non touchés (variante A)
- [ ] Validation utilisateur : en jeu, sur l'objet réel (à consigner dans le DEVLOG)
- [x] Entrée DEVLOG rédigée (03/11/2026)

## 7. Risques et points d'attention

- **Autorisation API refusée** (401/403 ou ErrorCode métier) : le diagnostic existant tranche sur le compte réel avant tout codage de l'UI ; en cas de refus global, le chantier se réduit à l'affichage explicite de la limite ;
- **Limite du jeu sur les perks d'armes** (point 12) : traitée par la variante A/B ci-dessus ;
- **Écriture partielle** (échec au milieu d'une chaîne) : l'écran affiche l'état exact de ce qui a été écrit / pas écrit, l'utilisateur relance ce qu'il veut — jamais de ré-application aveugle ;
- **Perk améliorée / paliers** : l'insertion vise le hash du plug **tel que sélectionné dans la Forge** ; si le palier de l'arme ne permet pas la version améliorée, Bungie refuse et le message est affiché — aucun recalcul de palier dans ce chantier ;
- **Objet équipé par un autre personnage / dans le Coffre** : verrouillé le 03/11/2026 (voir 2.6) — tentative directe, message Bungie exact si refus ;
- Consommation de quota API : négligeable (un appel par plug, usage manuel confirmé).

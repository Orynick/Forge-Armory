# PLAN — mods-phase-2

**Date :** 2026-11-03
**Spec associée :** `documentation/specs/SPEC-MODS-PHASE-2-2026-11-03.md` (validée — décisions verrouillées le 03/11/2026 : variante A, objets du Coffre modifiables, scope `MoveEquipDestinyItems` déjà actif puisque l'équipement fonctionne)
**Branche :** `draft-mods-phase-2`

---

## 1. Ordre de réalisation

1. **Logique d'abord (Article III)** — `tests/logique/ecarts-simulation.test.ts` : nouvelle suite sur la constitution de la liste d'écarts (réel vs simulé, par socket, armures uniquement) et sur l'exclusion des sockets interdits (ornement/shader/tracker/memento) ;
2. `src/lib/forge/simulation.ts` : nouvelle fonction pure `ecartsApplicables(item, colonnes, simulations)` → liste d'écarts `{ socketIndex, plugActuel, plugVise }` pour UNE armure possédée, vide si rien ne diffère ou si un socket exclu est simulé (exclu = ignoré, jamais proposé à l'écriture) ; aucune modification des fonctions existantes (ajout uniquement) ;
3. `src/lib/bungie/equiper.ts` : nouvelle fonction `insererPlug(membership, characterId, itemInstanceId, socketIndex, plugItemHash)` → `{ reussi, errorCode, errorStatus, message }`, bâtie sur le squelette de `diagnostiquerInsertionPlug` (mêmes en-têtes, même corps de requête, analyse `ErrorCode`) ; le diagnostic existant est conservé tel quel ;
4. `src/components/InventaireArmures.tsx` : bouton « Appliquer en jeu » (visible uniquement si `ecartsApplicables` est non vide), écran de confirmation listant chaque socket (index, nom actuel → nom visé, avertissement compte Destiny 2), progression ✓ socket par socket, arrêt au premier échec avec `ErrorCode`/`ErrorStatus`/`Message` exact, bouton « Relancer » sur les écarts restants (jamais de ré-application aveugle) ;
5. `src/lib/bungie/inventaire.ts` + appel existant de re-lecture : après succès complet, déclenchement du refresh déjà utilisé par l'appli (aucune nouvelle fonction de lecture), puis vidage de la simulation de l'objet (`retirerColonne`/`reinitialiserArme` existants) ;
6. `TODO.md` / `DEVLOG.md` : suivi et entrée de livraison.

## 2. Fichiers touchés (doit correspondre au périmètre 3.1 de la spec)

| Fichier | Rôle dans le chantier |
|---|---|
| `tests/logique/ecarts-simulation.test.ts` | Nouvelle suite : écarts réel vs simulé, exclusion des sockets interdits, liste vide sans différence |
| `src/lib/forge/simulation.ts` | Ajout de `ecartsApplicables` (fonction pure, tests d'abord) — aucune fonction existante modifiée |
| `src/lib/bungie/equiper.ts` | Ajout de `insererPlug` (insertion réelle, analyse ErrorCode) — `diagnostiquerInsertionPlug` conservé tel quel |
| `src/components/InventaireArmures.tsx` | Bouton « Appliquer en jeu », écran de confirmation, progression, gestion d'erreur (variante A : armures uniquement — les armes n'ont PAS le bouton dans ce chantier) |
| `src/lib/bungie/inventaire.ts` | Appel supplémentaire de re-lecture après succès (fonction existante réutilisée) |
| `TODO.md` / `DEVLOG.md` | Suivi du chantier et entrée de livraison |

## 3. Choix techniques et justifications

- **Variante A appliquée à l'UI** : seul `InventaireArmures.tsx` reçoit le bouton — `InventaireArmes.tsx` n'est pas touché (spéc 3.2 : rien d'autre ne bouge) ;
- **`insererPlug` séparé du diagnostic** : le diagnostic renvoie du texte pour humain, l'écriture renvoie un résultat structuré exploitable par l'UI — deux contrats différents, la duplication du squelette d'appel est le prix de la clarté (le corps de requête est identique, aucune divergence possible sur le protocole) ;
- **`ecartsApplicables` fonction pure dans `simulation.ts`** : même foyer que le reste de la logique de simulation, testable sans Bungie ni React (Article III) ;
- **Objets du Coffre** : tentative directe sur l'objet du Coffre (décision verrouillée) — le `characterId` passé est celui du porteur renvoyé par la localisation existante ; si Bungie refuse, message exact affiché, aucun contournement ;
- **Re-lecture après succès** : réutilisation du refresh existant plutôt qu'une nouvelle lecture — la spec interdit toute lecture nouvelle ;
- **Complexité ajoutée minimale (Article VIII)** : aucun état global nouveau, aucune dépendance nouvelle ; l'état de progression est local au composant de l'écran de confirmation.

## 4. Risques et mitigation

| Risque | Mitigation |
|---|---|
| Bungie refuse globalement l'écriture aux applications tierces | `ErrorCode`/`Message` exact affiché tel quel ; le chantier se réduit à l'affichage explicite de la limite (spéc §7) |
| Écriture partielle (échec au milieu de la chaîne) | Arrêt immédiat, état exact affiché (✓ écrit / ✗ refusé / – restant), relance possible uniquement sur les écarts restants |
| Refus sur un objet du Coffre | Message Bungie exact affiché — aucun transfert automatique (hors périmètre 3.2) |
| Plug non autorisé sur un socket (ex. mod payant, énergie insuffisante) | Message Bungie exact affiché avec le conseil de la spec §2.4 ; la simulation locale reste la source du score |
| Régression du score / des fenêtres Détails | Aucune fonction existante modifiée dans `simulation.ts`/`equiper.ts` (ajouts uniquement) ; diff contrôlé contre le périmètre 3.1 |

## 5. Hors périmètre (rappel — ne pas toucher)

- Moteur de scoring, fenêtres Détails (autre que le bouton déjà existant), Collection, Load-outs, Optimiseur, Legendarium, doctrine, OAuth ;
- `InventaireArmes.tsx` (pas de bouton « Appliquer en jeu » pour les armes dans ce chantier — variante A) ;
- Aucune écriture « en lot » non confirmée, aucun transfert ni équipement d'objet, aucune annulation automatique.

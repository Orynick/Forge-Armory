# Index des specs de chantier

**Fichier cible :** `documentation/specs/INDEX.md` (à créer à partir de ce modèle). Une ligne par spec, tenue à jour à chaque changement de statut. Voir [`../README.md`](../README.md) §2 et §4.

**Statuts :** `brouillon` → `validée` (décisions verrouillées, codage autorisé) → `livrée` (merge, tag, DEVLOG) · ou `abandonnée` (avec la raison).

| Spec | Chantier | Date | Statut | Version visée | Branche / PR | Validation utilisateur | DEVLOG |
|---|---|---|---|---|---|---|---|
| [`SPEC-<SLUG>-<AAAA-MM-JJ>.md`](SPEC-<SLUG>-<AAAA-MM-JJ>.md) | <titre court> | AAAA-MM-JJ | brouillon | X.Y.Z | `draft-<slug>` / #<n> | X/X (JJ/MM) | <date de l'entrée> |

## Règles

- Une spec = une ligne ; ne jamais supprimer une ligne (une spec abandonnée garde sa ligne et sa raison).
- Une spec `validée` n'a plus aucun `[À CLARIFIER]` (Article VI).
- La ligne passe à `livrée` dans le même commit que l'entrée DEVLOG de livraison (Article VII).

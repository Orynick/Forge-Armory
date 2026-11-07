# Index des specs de chantier

Une ligne par spec, tenue à jour à chaque changement de statut (modèle : [`../methode/templates/INDEX-specs.md`](../methode/templates/INDEX-specs.md) ; méthode : [`../methode/README.md`](../methode/README.md) §2 et §4).

**Statuts :** `brouillon` → `validée` (décisions verrouillées, codage autorisé) → `livrée` (merge, tag, DEVLOG) · ou `abandonnée` (avec la raison).

| Spec | Chantier | Date | Statut | Version | Branche / PR | Validation utilisateur | DEVLOG |
|---|---|---|---|---|---|---|---|
| [`SPEC-LEGENDARIUM-2026-10-19.md`](SPEC-LEGENDARIUM-2026-10-19.md) | Legendarium (bibliothèque de Lore en lecture passive) | 19/10/2026 | livrée | 0.5.0 (22/10/2026) | `draft-legendarium`, mergée dans `main` par fast-forward (`821a785`), sans PR | 9 critères d'acceptation vérifiés (`legendarium-acceptation` 34/34) ; retour utilisateur chiffré non retrouvé dans le DEVLOG (spec antérieure à la méthode) | 22/10/2026 « LIVRAISON : branche `draft-legendarium` » et « Passage en version 0.5.0 » |
| [`SPEC-MODS-PHASE-2-2026-11-03.md`](SPEC-MODS-PHASE-2-2026-11-03.md) | Mods-phase-2 (écriture réelle des perks/mods chez Bungie via `InsertSocketPlugFree`, variante A puis B) | 03/11/2026 | livrée | 0.6.0 (04/11/2026) | `draft-mods-phase-2`, PR #27 (mergée le 04/11) ; branche supprimée après livraison | « Parfait ça fonctionne ! » (03/11, mods d'armure) puis « OK ça fonctionne » (04/11, perks d'armes — variante B) | 03-04/11/2026 « MODS-PHASE-2 » (correctifs du premier test réel, clôture du chantier) |

## Règles

- Une spec = une ligne ; ne jamais supprimer une ligne (une spec abandonnée garde sa ligne et sa raison).
- Une spec `validée` n'a plus aucun `[À CLARIFIER]` (Article VI).
- La ligne passe à `livrée` dans le même commit que l'entrée DEVLOG de livraison (Article VII).
- Les chantiers antérieurs à la méthode (31/10/2026) ne sont indexés que s'ils ont une spec dans ce dossier.

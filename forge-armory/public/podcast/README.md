# Podcast du Legendarium — enregistrements personnels

Ce dossier contient **vos propres enregistrements audio** (MP3), lus par le lecteur
flottant du Legendarium (branche `vibe/draft-podcast-840f64`, spec :
`documentation/specs/SPEC-PODCAST-ESSAI-2026-10-23.md`).

## Convention de nommage (obligatoire)

Le nom du fichier = **l'identifiant de la page du Legendarium**, extension `.mp3`.
Le caractère `:` de l'identifiant est remplacé par `-` (interdit sous Windows).

| Page du Legendarium | Identifiant | Fichier attendu |
|---|---|---|
| Lore D2 / Lore d'objet | `lore:<hashLore>` | `lore-<hashLore>.mp3` |
| Carte du Grimoire D1 | `grimoire:<idCarte>` | `grimoire-<idCarte>.mp3` |

Exemples : `lore-1716568313.mp3`, `grimoire-603020342.mp3`.

**Où trouver l'identifiant d'une page ?** Le lecteur flottant l'affiche quand vous
êtes sur la page (champ « id » / « page »). Sinon : `lore-<hash>` = le nombre après
`Lire le Lore` dans les fiches Détails ; `grimoire-<id>` = l'identifiant de la carte
D1 (visible dans le diagnostic dev ou dans l'URL de Ishtar Collective).

## Comment enregistrer

- **Téléphone** : application « Magnétophone » native, export MP3.
- **PC + casque gaming USB** : **Audacity** (gratuit) — piste mono, export MP3.
- Astuce : commencez chaque fichier par le **titre de la page** (comme un chapitre
  de podcast), puis lisez le texte.

## Mise à jour de l'index

Après avoir déposé des fichiers :

```bash
npm run podcast:index
```

Cela régénère `index.json` (liste des enregistrements + date). Le lecteur le lit
une fois au démarrage. `index.json` est **ignoré par git** ; le fichier
`index.modele.json` (structure vide) est versionné pour documenter le format.

## Confidentialité

- `*.mp3` et `index.json` (généré) sont **ignorés par git** (voir `.gitignore`) :
  vos enregistrements personnels ne sont **jamais** versionnés ni publiés.
- Seuls ce README et `index.modele.json` (structure) sont versionnés.
- Les fichiers sont embarqués dans l'application et lus **localement** : aucun
  envoi sur le réseau.

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
- **PC + casque gaming USB** : **Audacity 4** (gratuit, GPL — [audacityteam.org](https://www.audacityteam.org/) ou MuseHub). Avantages pour la voix :
  - **l'export MP3 est INTÉGRÉ** (plus besoin d'installer l'encodeur LAME à la main, comme sur les vieilles versions) ;
  - nouvelle interface avec **marqueurs sur la timeline** (pratique pour repérer le début de chaque page) ;
  - support officiel **ASIO** sous Windows (ton casque gaming USB peut l'utiliser, sinon WASAPI marche très bien) ;
  - enregistrement **mono** recommandé, 44 100 Hz.
  - Note : Audacity 4.0 a retiré quelques fonctions avancées d'Audacity 3 (MIDI, macros…) — sans importance pour de la voix parlée. Audacity 3.x reste un bon choix aussi si vous préférez l'ancienne interface.
- Astuce : commencez chaque fichier par le **titre de la page** (comme un chapitre
  de podcast), puis lisez le texte.

## Poids des fichiers (important)

De la voix en **stéréo 192 kbps** (le réglage par défaut d'Audacity) produit
~1,4 Mo par minute — 45 min ≈ 460 Mo, ingérable pour l'application. Pour de la
parole, le manuel Audacity recommande **mono 64 kbps CBR** (« qualité
raisonnable » ; 96 kbps = « excellente »). À ce débit : **~0,5 Mo par minute**,
soit **45 min ≈ 22 Mo** (et un installateur Electron qui reste raisonnable).

Deux façons d'y arriver :

**A. À l'enregistrement (recommandé)** — dans Audacity, avant d'exporter :
1. Piste → Mixage → **« Mixage stéréo vers mono »** ;
2. Effets → **Normaliser** → −1,0 dB ;
3. Fichier → Exporter → **MP3** → options : **Constant (CBR), 64 kbps, Mono**.

**B. Après coup (tes 13 fichiers déjà enregistrés)** — le script
`npm run podcast:optimiser` les ré-encode en lot (simulation par défaut,
`--appliquer` pour de vrai, originaux sauvegardés dans `originaux/`) :

```bash
npm run podcast:optimiser            # simulation : estime le gain
npm run podcast:optimiser -- --appliquer   # ré-encode les 13 fichiers
```

Le script a besoin de **ffmpeg**. S'il ne le trouve pas, il affiche la procédure
Audacity équivalente (méthode A). Pour lui donner ffmpeg : télécharger
[ffmpeg-release-essentials.zip](https://www.gyan.dev/ffmpeg/builds/) (gratuit),
décompresser, et **copier `ffmpeg.exe` dans ce dossier** (`public/podcast/`) —
le script le trouvera tout seul. (Ou définir la variable d'environnement `FFMPEG`
vers le chemin de `ffmpeg.exe`.)

> `ffmpeg.exe` et le dossier `originaux/` sont ignorés par git.

## Mise à jour de l'index

Après avoir déposé des fichiers :

```bash
npm run podcast:index
```

Cela régénère `index.json` (liste des enregistrements + date). Le lecteur le lit
une fois au démarrage. `index.json` est **ignoré par git** ; le fichier
`index.modele.json` (structure vide) est versionné pour documenter le format.

## Nommer les fichiers sans se tromper (recommandé)

Si vos MP3 portent des noms libres (« chapitre 1.mp3 », « 2026-10-23 page 3.mp3 »…),
un script apparie chaque fichier à sa page **sans deviner** :

1. **En dev** (`npm run dev`), ouvrez le Legendarium : le lecteur affiche, sous le
   titre, l'**identifiant de la page** avec un bouton **« copier l'id »** (dev
   uniquement — invisible dans la version installée).
2. Créez `public/podcast/association.txt` : **une ligne par MP3**, dans **l'ordre
   alphabétique des noms de fichiers**, chaque ligne = l'identifiant de la page
   (`lore:1716568313` ou `grimoire:603020342`). Lignes vides et `#` ignorés.

   Exemple (MP3 triés : `chapitre 1.mp3`, `chapitre 2.mp3`) :
   ```
   # mes enregistrements
   lore:1716568313
   grimoire:603020342
   ```

3. **Simulation** (rien n'est modifié) :
   ```bash
   npm run podcast:associer
   ```
4. **Application** (renomme les MP3 selon la convention, consomme
   `association.txt`, régénère l'index) :
   ```bash
   npm run podcast:associer -- --appliquer
   ```

   **Sécurité** : le script ne supprime ni n'écrase jamais un fichier existant ;
   un nom cible déjà présent ou un nombre d'associations incohérent bloque tout
   (corrigez `association.txt` et relancez).

## Confidentialité

- `*.mp3` et `index.json` (généré) sont **ignorés par git** (voir `.gitignore`) :
  vos enregistrements personnels ne sont **jamais** versionnés ni publiés.
- Seuls ce README et `index.modele.json` (structure) sont versionnés.
- Les fichiers sont embarqués dans l'application et lus **localement** : aucun
  envoi sur le réseau.

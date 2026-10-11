# 27_PATCHNOTES — Patch notes de Bungie

Emplacement créé le 28/09/2026 pour le chantier « Patch notes de Bungie »
(TODO, section 10). Premier sous-répertoire de la knowledge-base.

## Objectif

Une fiche par mise à jour de Destiny 2 publiée par Bungie, pour deux
usages :

- repérer quand une mise à jour rend obsolète une donnée du projet :
  multiplicateurs du moteur de dégâts (`01_DAMAGE_STACKING.md`), armatures
  anti-champion, artefacts, fragments, etc. ;
- servir de source à l'agent IA, dont l'ordre de recherche prévu passe par
  la knowledge-base avant Bungie et le Web.

## Lien avec l'affichage de l'appli

Tout en haut à droite du titre, l'appli affiche la version de Destiny 2 prise en compte, la date du patch et le **niveau des
correctifs**. Ces valeurs sont écrites à la main dans `src/data/versionJeu.ts` (source unique) : **à chaque fiche de correctif
ajoutée ici ET dont les effets sont reportés dans l'appli, passer le `integre` de ce correctif à `true`** ; à chaque nouveau
correctif publié par Bungie, l'ajouter à la fin de la liste avec `integre: false` ; pour une nouvelle version majeure, changer
`numero`, `nom`, `datePatch`. Aujourd'hui : 9.7.0, Monument of Triumph, 9 juin 2026, et cinq correctifs publiés depuis
(9.7.0.1 à 9.7.0.5, le dernier le 7 octobre 2026). **Une seule a sa fiche : la 9.7.0.5** (`2026-10-07_9.7.0.5.md`, première fiche du dossier, format à valider) ; elle est marquée intégrée (aucun effet à reporter), mais le niveau affiché reste « aucun intégré » : les correctifs sont cumulatifs et la 9.7.0.1 à la 9.7.0.4 n'ont pas encore de fiche (voir la TODO, section 10).

## Conventions

- **Un fichier par mise à jour**, nommé `AAAA-MM-JJ_<version>.md`, pour
  que les fichiers se rangent d'eux-mêmes dans l'ordre chronologique.
- **En tête de chaque fichier** : titre officiel, date de publication, lien
  vers la page source sur bungie.net, langue.
- **Des fiches rédigées, pas des copies** : les patch notes sont des textes
  de Bungie protégés par le droit d'auteur. Chaque fiche reprend avec ses
  propres mots tous les faits utiles (ce qui change, chiffres avant/après,
  objets concernés), avec le lien vers la page officielle.
- **En français ET en anglais**, pour faire le lien avec les Manifest FR
  et EN.
- **Depuis La Forme Finale** (juin 2024), en **ordre anti-chronologique** :
  les plus récentes d'abord.
- **Qui produit** : Claude, à partir des pages officielles sur bungie.net.
- **Une mise à jour publiée pendant qu'on remonte le temps passe en tête
  de file.**
- **Pas d'inclusion dans l'archive « invité »**, comme le reste de la
  documentation interne.

Ces conventions reprennent les décisions de l'utilisateur du 28/09/2026 ;
les points marqués « à valider » dans la TODO le restent.

## Format envisagé d'une fiche (à valider sur la première produite)

- **En-tête** : titre officiel FR/EN, date de publication, numéro de
  version, liens vers les deux pages sources (française et anglaise).
- **Corps** : une section par catégorie (armes, armures, sous-classes,
  artefacts, modificateurs, activités…).
- **Chaque changement sur une ligne** : nom FR / nom EN, nature du
  changement, valeurs avant → après. Les deux noms permettent de retrouver
  l'objet dans les Manifest FR et EN.

## Mise en route

1. Produire UNE fiche, celle de la mise à jour la plus récente, pour
   valider le format avec l'utilisateur. ✅ **Faite le 07/10/2026 : la 9.7.0.5** (texte français collé par l'utilisateur, recoupé avec un site de suivi ; **lien officiel EN reçu mais page illisible par mes outils, lien FR à compléter**). **Format à valider.**
2. Ajuster le format selon ses retours.
3. Remonter le temps par lots jusqu'à La Forme Finale (juin 2024).

Référence : section 10 de `TODO.md` (« Patch notes de Bungie dans la
knowledge-base »).

## Contenu actuel

| Fichier | Nature |
|---|---|
| `2026-06-09_9.7.0_RECAP-AMI.md` | Récapitulatif de Monument of Triumph (patch 9.7.0, 9 juin 2026), fourni par un ami avec la knowledge-base d'origine (anciennement `monument_of_triumph_recap.md`, à la racine). Sources : Dev Insights #2 et #3, patch notes 9.7.0. **Ce n'est pas une fiche au format ci-dessus** : la fiche officielle de la 9.7.0 prendra le nom `2026-06-09_9.7.0.md`, et ce récapitulatif restera à côté comme source d'origine. |

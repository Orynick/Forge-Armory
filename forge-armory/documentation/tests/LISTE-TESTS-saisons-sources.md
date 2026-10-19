# À tester — chantier « saisons et sources » (branche draft-saisons-sources)

> Liste à cocher pendant le test. Les tests validés sont retirés et leur historique va dans CHANGELOG.md (règle du projet). Le fichier historique A-TESTER-<version>.pdf reste le support habituel pour les versions ; cette liste couvre le NOUVEAU chantier.

## Recherche du Manifest (charger le Manifest d'abord)

1. ☐ **Saison de sortie en clair** (CORRIGÉE, 2e fois — à retester) : cherche la Mesure corrective : la fiche affiche « Saison de sortie : <nom> (saison N) — dates », et le SURVOL de l'icône de saison (fenêtres Détails, vignettes) donne le nom. La jointure est maintenant PAR LE HASH DE L'OBJET (la table de DIM, 57 439 objets) : elle ne dépend plus du filigrane. Dis-moi si un nom ou un numéro est FAUX.
2. ☐ **Source en clair** : la fiche d'une arme de raid (ex. une arme du Dernier Vœu) affiche « — Raid — Source: "Last Wish" Raid » : la CATÉGORIE (Raid) puis la chaîne brute. Dis-moi si la catégorie manque ou est fausse.
3. ☐ **MENU DÉROULANT Source** (NOUVEAU — remplace la syntaxe source:) : dans « Recherche dans le Manifest », un menu « Source de l'objet » apparaît à côté des menus élément et anti-champion : « Toutes les sources », 13 catégories, puis les activités. Choisir « Raid » + catégorie « Armes uniquement » : les armes de raid (le filtre s'applique aux résultats : tape un mot, ou cherche puis filtre).
4. ☐ Le menu se combine par ET avec le texte, la catégorie, l'anti-champion et l'élément.
4. ☐ **Autocomplétion** : tape « source: » : les 13 catégories puis les activités sont proposées en français ; un clic complète le filtre.
6. ☐ La syntaxe « source: » dans le champ de texte n'existe plus (RETIRÉE volontairement, remplacée par le menu) : la taper ne fait rien de spécial.
7. ☐ **Objet sans source** : un objet sans source connue ne fait pas échouer « source:raid » : simplement absent des résultats (l'ancien exemple « perk de raid » était obsolète).

## Crédits

7. ☐ **Pop-up Crédits** : en bas de l'appli, le lien « Crédits » ouvre la pop-up : mention fan/Bungie + d2-additional-info (MIT) avec liens cliquables. Dis-moi si tu veux une page dédiée plutôt que le pop-up.

## Ce qui n'est PAS dans ce chantier (pour mémoire)

- Le nom de saison sous l'icône (déjà livré en 0.4.11) ne change pas ; la table des saisons est un SECOURS et la source des dates.
- La négation `-source:raid` est exclue volontairement de la v1.

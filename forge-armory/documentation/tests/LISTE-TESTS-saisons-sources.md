# À tester — chantier « saisons et sources » (branche draft-saisons-sources)

> Liste à cocher pendant le test. Les tests validés sont retirés et leur historique va dans CHANGELOG.md (règle du projet). Le fichier historique A-TESTER-<version>.pdf reste le support habituel pour les versions ; cette liste couvre le NOUVEAU chantier.

## Recherche du Manifest (charger le Manifest d'abord)

1. ☐ **Saison de sortie en clair** (CORRIGÉE — à retester) : cherche la Mesure corrective : la fiche affiche « Saison de sortie : <nom> (saison N) — dates » — le numéro vient maintenant de la table filigrane de d2-additional-info quand le Manifest n'en dit rien. Dis-moi si un nom ou un numéro est FAUX.
2. ☐ **Source en clair** : la fiche d'une arme de raid (ex. une arme du Dernier Vœu) affiche « — Raid — Source: "Last Wish" Raid » : la CATÉGORIE (Raid) puis la chaîne brute. Dis-moi si la catégorie manque ou est fausse.
3. ☐ **Filtre source:** (CORRIGÉ — à retester) : tape « source:raid » SEUL : les objets de raid remontent (avant : rien). Idem « source:trials », « source:last-wish ».
4. ☐ **Filtre combiné** (CORRIGÉ — à retester) : « vérité source:trials » applique le mot ET le filtre.
4. ☐ **Autocomplétion** : tape « source: » : les 13 catégories puis les activités sont proposées en français ; un clic complète le filtre.
6. ☐ **Saisie libre** (CORRIGÉE — à retester) : tape « Last Wish » sans préfixe (catégorie « Armes uniquement » incluse) : le filtre source:last-wish s'active tout seul et liste les armes du Dernier Vœu.
7. ☐ **Objet sans source** : un objet sans source connue ne fait pas échouer « source:raid » : simplement absent des résultats (l'ancien exemple « perk de raid » était obsolète).

## Crédits

7. ☐ **Pop-up Crédits** : en bas de l'appli, le lien « Crédits » ouvre la pop-up : mention fan/Bungie + d2-additional-info (MIT) avec liens cliquables. Dis-moi si tu veux une page dédiée plutôt que le pop-up.

## Ce qui n'est PAS dans ce chantier (pour mémoire)

- Le nom de saison sous l'icône (déjà livré en 0.4.11) ne change pas ; la table des saisons est un SECOURS et la source des dates.
- La négation `-source:raid` est exclue volontairement de la v1.

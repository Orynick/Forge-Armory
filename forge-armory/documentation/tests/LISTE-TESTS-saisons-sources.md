# À tester — chantier « saisons et sources » (branche draft-saisons-sources)

> Liste à cocher pendant le test. Les tests validés sont retirés et leur historique va dans CHANGELOG.md (règle du projet). Le fichier historique A-TESTER-<version>.pdf reste le support habituel pour les versions ; cette liste couvre le NOUVEAU chantier.

## Recherche du Manifest (charger le Manifest d'abord)

1. ☐ **Saison de sortie en clair** : cherche un objet dont tu connais la saison (ex. la Mesure corrective) : la fiche affiche « Saison de sortie : <nom> (saison N) — dates ». Dis-moi si un nom ou un numéro est FAUX.
2. ☐ **Source en clair** : la fiche d'une arme de raid (ex. une arme du Dernier Vœu) affiche « — Raid — Source: "Last Wish" Raid » : la CATÉGORIE (Raid) puis la chaîne brute. Dis-moi si la catégorie manque ou est fausse.
3. ☐ **Filtre source:** : tape « source:raid » dans la recherche : seules les objets de raid remontent. Idem « source:trials », « source:last-wish » (activité précise). Combiné avec un mot (« vérité source:trials ») : les DEUX s'appliquent.
4. ☐ **Autocomplétion** : tape « source: » : les 13 catégories puis les activités sont proposées en français ; un clic complète le filtre.
5. ☐ **Saisie libre** : tape « Last Wish » ou « Prophétie » sans préfixe : la recherche trouve l'activité (alias). *(note : l'alias ouvre le filtre ; dis-moi si tu préfères un menu dédié)*
6. ☐ **Objet sans source** : une perk ou un fragment (pas de hash de source) ne fait pas échouer « source:raid » : simplement absents des résultats.

## Crédits

7. ☐ **Pop-up Crédits** : en bas de l'appli, le lien « Crédits » ouvre la pop-up : mention fan/Bungie + d2-additional-info (MIT) avec liens cliquables. Dis-moi si tu veux une page dédiée plutôt que le pop-up.

## Ce qui n'est PAS dans ce chantier (pour mémoire)

- Le nom de saison sous l'icône (déjà livré en 0.4.11) ne change pas ; la table des saisons est un SECOURS et la source des dates.
- La négation `-source:raid` est exclue volontairement de la v1.

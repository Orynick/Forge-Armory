# Legendarium — Spécification de développement (branche `draft-legendarium`)

**Date :** 19 octobre 2026
**Statut :** décisions verrouillées — document de transmission destiné à l'assistant de développement. Ce document fait foi ; toute divergence doit être signalée **avant** codage.
**Branche :** `draft-legendarium` (préparation uniquement — aucun code produit sur cette branche tant que la spécification n'est pas validée)
**Version de l'appli au moment de la rédaction :** 0.4.13

---

## 1. Objectif

Ajouter une bibliothèque de Lore en **lecture passive** dans Forge Armory.
Aucune interaction avec le moteur de scoring ni avec le système de builds : **aucune écriture, aucun état modifiable, aucune persistance**.

> Contexte existant : la page « Legendarium » existe déjà comme onglet (vue interne `bibliotheque`, composant `src/components/Bibliotheque.tsx`) et affiche actuellement un simple panneau « en construction » qui reçoit le Manifest (`db`) et indique s'il est prêt. C'est ce composant qu'il faudra remplacer par la bibliothèque décrite ici.

## 2. Contenu et sources

- **Destiny 2** : manifeste Bungie —
  - table `DestinyLoreDefinition` pour les pages de Légendes ;
  - table `DestinyItemDefinition` (champ `lore`) pour le Lore des objets.
  - Même cache local que le catalogue du jeu (voir §9).
- **Destiny 1** : Grimoire via l'endpoint legacy Bungie `https://www.bungie.net/d1/Platform/Destiny/Vanguard/Grimoire/Definition/` (en-tête `X-API-Key` obligatoire), **en repli** d'un jeu de données statique issu d'Ishtar Collective si l'API ne convient pas.

## 3. Structure de la bibliothèque

Ordre global de consultation :

1. **Grimoire (D1)** : navigation par livre puis par carte.
2. **Légendes (D2)** : navigation par livre puis par page.
3. **Lore des armes et armures** : consultation depuis la fiche Détails (bouton « Lire le Lore » si l'objet possède un Lore), et parcours inverse — depuis un texte de Lore, voir les objets qui le portent.
4. **Cosmétiques et utilitaires** : Spectres, Vaisseaux, Passereaux — liste avec leur Lore quand il existe.

**Règle des ensembles d'armures** : ordre casque, gants, torse, jambes, objet de classe, regroupés par classe (Titan, Chasseur, Arcaniste). Chaque classe suit sa mini-histoire dans cet ordre. (Cette règle est déjà consignée dans l'en-tête de `Bibliotheque.tsx` : armures rangées par classe sans jamais mélanger les classes, objets sans légende masqués par défaut, rééditions dédoublonnées, armures exotiques rangées par classe dans une section à part — à concilier avec la présente spécification lors du codage.)

## 4. Mise en page (verrouillée)

Trois zones d'écran :

1. **Bandeau supérieur** : titre « Legendarium », recherche par mots-clés (toujours accessible), indicateur de mise à jour du cache.
2. **Colonne latérale gauche** : fil des sections (Grimoire D1, Légendes D2, Armes et armures, Cosmétiques et utilitaires), puis liste des livres de la section active.
3. **Zone de lecture centrale** : titre du livre, page ou carte courante, texte du Lore, navigation précédent / suivant.

## 5. Palette (verrouillée)

Option retenue : **« Parchemin / Hologramme »**.

- **Contenu D1** : typographie serif, texte ivoire, bordures beige, fond brun profond (esprit carte ancienne).
- **Contenu D2** (Légendes, objets, cosmétiques) : sans serif, cyan pâle, bordures fines lumineuses, fond bleu-noir avec légère lueur froide.

**Solution de repli** si le rendu parchemin est trop coûteux ou peu lisible : ambre (D1) / bleu acier (D2) sur fond neutre commun.
**Le code couleur par section (cinq teintes) est explicitement exclu.**

Constantes de la maquette (à centraliser, comme `ERA_STYLES` dans l'annexe) :

| Élément | D1 (parchemin) | D2 (hologramme) |
|---|---|---|
| Fond de page | `#2b2116` | `#0d1520` |
| Bordure | `#8a6d3b` | `#1e3a5f` |
| Œilleton (étiquette) | `#b99a5e`, serif | `#3d7eb5` |
| Titre | serif `#f0e6d2` | semi-gras `#cfe8ff` |
| Corps de texte | serif italique `#e5d8bd` | `#a8c6e2` |

## 6. Interactions clés (verrouillées)

- **Bouton « Lire le Lore »** dans la fiche Détails : affiché **uniquement si l'objet possède un Lore**. Placement : **en haut de la fiche, justifié à droite, sous la croix de fermeture** du pop-up.
- **Action du bouton** : aiguiller l'utilisateur dans le Legendarium directement sur la page de Lore concernée (**lien profond vers la page**, pas seulement vers le livre).
- **Retour** : si la page a été atteinte depuis une fiche Détails, afficher un bouton de retour vers l'arme ou l'armure (même mécanique que le bouton existant de consultation des détails d'une arme depuis la Forge).
- **Recherche par mots-clés** : retrouve les pages de Lore ; les résultats sont cliquables et ouvrent la page.
- **Lecture passive** : aucune sélection, aucun impact sur le scoring ou le build, aucune persistance d'état.

## 7. Critères d'acceptation

1. Les Légendes D2 et le Grimoire D1 sont regroupés par livres, comme en jeu.
2. Ordre global respecté : D1, puis D2, puis armes et armures, puis cosmétiques.
3. Les ensembles d'armures respectent l'ordre casque, gants, torse, jambes, objet de classe, regroupés par classe.
4. La recherche par mots-clés permet de retrouver les pages de Lore.
5. Le bouton « Lire le Lore » n'apparaît que pour les objets qui en possèdent un, en haut de fiche, justifié à droite, sous la croix.
6. Le parcours inverse depuis une page de Lore vers les objets concernés fonctionne.
7. Les Spectres, Vaisseaux et Passereaux sont listés avec leur Lore quand il existe.
8. Aucun impact sur le scoring ni sur le build (lecture passive vérifiée).
9. Le cache de données se télécharge et se met à jour sans casser le catalogue du jeu.

## 8. Hors périmètre

- Lecteur audio « podcast » des pages et livres : idée notée pour un développement ultérieur, **exclue de cette version**.
- Toute écriture ou modification d'état liée au Lore.

## 9. Notes d'implémentation

- **Réutiliser le cache local du manifeste déjà en place** pour le catalogue du jeu (`src/lib/manifest/download.ts` : téléchargement, cache IndexedDB, `assurerManifestAJour`, `obtenirDefinition`, `lireTable`) ; **ne pas créer de second mécanisme de téléchargement**. Lire les tables `DestinyLoreDefinition` et `DestinyItemDefinition` (champ `lore`) via `lireTable`/`obtenirDefinition` sur la base SQLite existante.
- **Liens profonds** : chaque page de Lore possède un identifiant stable permettant l'aiguillage direct depuis une fiche Détails et le retour inverse. Les identifiants `lorePageId` des objets proviennent du champ `lore` de `DestinyItemDefinition`.
- **État « provenance »** (page atteinte depuis un objet) : **transitoire et non persistant** (état React local, pas de stockage).
- Le type `DestinyItemDefinition` dans `src/types/manifest.ts` ne déclare pas encore le champ `lore` : à ajouter au typage minimal (champ `lore?: number` — hash vers `DestinyLoreDefinition`).
- La page Legendarium est aujourd'hui une **vue interne** (`VueApp = "bibliotheque"` dans `SelecteurVues.tsx`), pas une route. Pour le lien profond depuis une fiche Détails, deux pistes à trancher avant codage : (a) basculer la vue courante vers `bibliotheque` via l'état existant du sélecteur de vues, avec un état « page cible + provenance » transmis en mémoire ; (b) ajouter une route React Router dédiée (ex. `/legendarium/:pageId`). **Recommandation** : (a) en première version, car l'appli est en vues internes et la persistance est interdite par la spécification ; (b) reste ouvert si l'utilisateur veut des URLs partageables.
- Le Grimoire D1 passe par l'API legacy Bungie (D1) avec `X-API-Key` ; prévoir le repli statique (Ishtar Collective) si l'endpoint ne convient pas. À noter : l'appli est une SPA locale (Vite + Electron) — vérifier la politique CORS/réseau de l'endpoint D1 avant de retenir cette source.
- Composants concernés existants : `src/components/Bibliotheque.tsx` (page à remplacer), fiches Détails avec croix de fermeture dans `src/components/InventaireArmes.tsx` (ligne ~202), `src/components/InventaireArmures.tsx` (ligne ~191), `src/components/CollectionArmes.tsx`, `src/components/CollectionArmures.tsx`, `src/components/PageForge.tsx`.

## 10. Plan de découpage proposé (à valider)

1. **Fondations** : typage `lore` + `DestinyLoreDefinition` ; module `src/lib/manifest/lore.ts` (lecture des tables Lore et items depuis le cache existant) ; état du Legendarium (section, livre, page, provenance) en mémoire.
2. **Page Legendarium** : les trois zones, palette Parchemin/Hologramme, navigation précédent/suivant, recherche par mots-clés.
3. **Contenu D2** : Légendes (livres → pages), armes/armures (avec règle des ensembles), cosmétiques (Spectres, Vaisseaux, Passereaux).
4. **Contenu D1** : Grimoire (API legacy ou repli statique), livres → cartes.
5. **Lien fiche Détails ↔ Legendarium** : bouton « Lire le Lore » (haut de fiche, droite, sous la croix, uniquement si Lore présent), lien profond vers la page, bouton de retour vers l'objet, parcours inverse (page → objets porteurs).
6. **Vérification** : les 9 critères d'acceptation, dont la lecture passive (aucun espion de score ne doit bouger, aucun journal réseau d'écriture).

## 11. Annexe — Maquette de référence (code React validé)

La maquette validée fournie avec la spécification (composant React complet, données fictives `SECTIONS` / `BOOKS` / `ITEMS`, palette centralisée dans `ERA_STYLES`, pop-up Détails avec croix puis bouton « Lire le Lore » justifié à droite, aiguillage direct `openLoreFromItem`, bouton de retour `backToItem`) est la référence d'implémentation. Points clés à en retenir :

- `sectionEra(sectionId)` : `"grimoire"` → `"d1"`, tout le reste → `"d2"`.
- `ERA_STYLES` centralise la palette ; passer à l'option de repli (ambre/bleu acier) ne demande qu'un échange de ces constantes.
- `findPage(pageId)` parcourt toutes les sections pour résoudre un lien profond.
- Ordre de navigation aplati `PAGE_ORDER` par section pour précédent/suivant.
- Recherche par mots-clés sur titres + textes, résultats cliquables.
- Le panneau latéral « Démo — Fiche Détails » de la maquette **n'existe que pour la démonstration** : l'implémentation réelle s'appuie sur la fiche Détails existante de Forge Armory.
- `returnToItem` est un état transitoire (pas de persistance).

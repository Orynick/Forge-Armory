# Forge Armory — visuels à intégrer dans l'appli (Destiny 2 Build Analyzer)

105 fichiers (103 SVG + 2 images PNG du logo), SVG au fond transparent, aucune police à charger. Détails, dimensions et catalogue : `docs/charte-graphique.html`.

## Structure
```
assets/
  selecteur/         18  Build Analyzer, Legendarium, Load-outs, Collection, Carrière, Accomplissements, Armes, Armures, Optimisation × repos / sélectionné
                         (viewBox 4316 × 1024 ; Accomplissements : 4897 × 1024, plaque élargie au titre)
  profils/            8  Neutre, PvE Roaming, PvE DPS, PVP × repos / sélectionné            viewBox 3781 × 1024
  blocs-repliables/  14  7 blocs × replié / déplié (losange + / −)                          viewBox 7805 × 1024
  actions/           12  boutons d'action (menus, pop-up et version Web) dont « Appliquer en jeu » et « Télécharger » × repos / sélectionné — hauteur 1024 (comme le sélecteur), largeur variable selon le texte
  titres/             8  contexte (0. + ligne), cartes 1 à 5, score global — repos          viewBox 7505 × 1024
  icones/            37  cercle + symbole seuls (barres réduites, onglets, export infographique)  viewBox 1024 × 1024
  symboles/           4  symboles des profils vectorisés, sans cercle
  marque/             3  emblème Forge Armory (SVG), logo avec titre (PNG), planche des déclinaisons (PNG)
  marques/            1  pictogramme « applicable en jeu » (losange doré en pointillés → cristal cyan), seul, sans cercle
manifest.json         catalogue de tous les actifs (id, libellé, état, fichier, dimensions, ratio)
forgeAssets.ts        même catalogue typé pour le code de l'appli
ENCARTS-BLOCS.md      spécifications des encarts à équerres des blocs repliables (CSS, états, alignements)
composants/           BlocRepliable.tsx + BlocRepliable.css : encart prêt à l'emploi (hors catalogue)
docs/charte-graphique.html
docs/encart-*.png     maquettes de référence des encarts
```

## Boutons d'action (`assets/actions/`, menus et pop-up)
**Même taille que les boutons du sélecteur** : cadre de 1024 de haut, même cercle (diamètre 894) et même plaque (524 de haut) que Collection, Inventaire, Armes, Armures… Il suffit d'afficher les boutons d'action à la **même hauteur CSS** que ceux-là pour qu'ils aient exactement la même taille de cercle et de plaque (voir `TAILLE-DES-BOUTONS.md`). Chaque bouton a la largeur de son texte (pas de largeur commune). Texte en casse mixte, sauf « Actualisation de l'inventaire » (capitales).
- `actions.retour-build-analyzer` · `actions.mettre-dans-mon-build` · `actions.lire-le-lore` · `actions.actualisation-inventaire` (remplace « Recharger mon inventaire »)
- `actions.forge-mods-armure` et `actions.forge-perks-arme` : dans les Détails d'une armure / arme possédée (Mon Inventaire, Coffre ou Mon Build), sur la ligne d'actions ; pas dans la Forge elle-même. Le second remplace le texte seul « 🔨 Forge : choisir les perks de cette arme ».
- `actions.modifier` (mods, dans les Détails) et `actions.fermer` : « Fermer » s'affiche à la place de « Modifier » quand on édite un mod ; même plaque et même hauteur.
- `actions.appliquer-en-jeu.repos` / `actions.appliquer-en-jeu.selectionne` : « Appliquer en jeu » (capitales du lettrage de la charte), 4902 × 1024 ; sélectionné avec la lueur habituelle. Logo : losange doré en pointillés → flèche → cristal cyan. Cadre de 1024 de haut, donc même hauteur d'affichage que les autres boutons.
- Les logos ronds seuls sont dans `icones/` (`icones.<même nom>`, y compris `icones.appliquer-en-jeu` et sa version sélectionnée).
- `actions.telecharger.repos` / `actions.telecharger.selectionne` : « Télécharger l’application » pour la **version Web** (télécharge la version Windows .exe de Forge Armory). Logo : papillon Forge Armory + pastille cyan « télécharger », avec les deux cristaux cyan du sélecteur ; 6496 × 1024. L'état « sélectionné » (lueur) est à utiliser **au survol**. Hauteur d'affichage conseillée sur le Web : 56 à 80 px (même hauteur CSS que les autres boutons Forge pour garder la même taille de cercle). `aria-label` conseillé : « Télécharger Forge Armory pour Windows (.exe) ».
- `marques.appliquer-en-jeu` (`assets/marques/`) : le pictogramme « Applicable en jeu » seul, à utiliser comme repère dans les listes (fond transparent, viewBox 668 × 456, hauteur minimale conseillée 16 px).

## Boutons du sélecteur et des menus
- Avec cristaux (haut et bas) : Build Analyzer, Legendarium, Load-outs, Collection.
- Sans cristaux, symbole agrandi : Carrière (blason, quartier cyan), Accomplissements (emblème, yeux cyan), Armes (épée), Armures (bouclier à cristal central) et Optimisation (trois curseurs à losanges cyan). Armes et Armures ont la même plaque que Collection.
- **Accomplissements** a une plaque plus large (4897 au lieu de 4316) car son titre est plus long. À la même hauteur d'affichage, il est donc plus large que les autres boutons : **décision prise, on garde cette largeur** (les autres boutons du sélecteur restent à 4316).

## Logo de l'appli (`marque/`)
- `logo-forge-armory.png` et `forge-armory-declinaisons.png` : le O de FORGE et le O d'ARMORY portent le même cristal cyan lumineux (images, pas de version vectorielle du titre).
- `forge-armory-emblem.svg` : l'emblème seul (papillon), sans titre.

## Bouton « Collection » (sous-menu de l'onglet Forge)
`selecteur.collection.repos` / `selecteur.collection.selectionne` : même cadre, mêmes cristaux et même lueur que les autres boutons du sélecteur (livre ouvert, dos cyan). Icône seule : `icones.collection`.

## Logos « Armes » et « Armures » (export infographique)
Trois logos, à afficher **au minimum** dans l'export infographique :
- `icones.armes-armures` — épée plantée dans le bouclier (logo de la carte « 3. Armes et Armures »)
- `icones.armes` — l'épée seule (grande, dressée), pour les armes
- `icones.armures` — le bouclier seul (cadre vide + cristal bleuté au centre), pour les armures
Hauteur minimale conseillée : 32 px (lisibles) ; à 24 px les détails fins se brouillent.

## Identifiants (`manifest.json`)
`<famille>.<clé>[.<état>]`, par exemple `selecteur.legendarium.selectionne`, `profils.pvp.repos`, `blocs-repliables.mon-build.deplie`, `titres.3-armes-armures.repos`, `icones.armes`.
Chaque entrée donne : `label` (texte du titre, à réutiliser en `alt` / `aria-label`), `fichier`, `largeur`, `hauteur`, `ratio`, `hauteurMinPx`.

## Règles d'intégration
1. **Même hauteur pour toute une famille** ; la largeur suit le ratio (ex. hauteur 44 px → boutons sélecteur ≈ 185 px de large). Hauteur minimale conseillée : 40 px (titres, boutons), 24 px (icônes). En dessous, utiliser l'icône seule.
2. **Logo + plaque + titre = un seul élément** : un seul bouton ou en-tête ; ne jamais séparer.
3. **Changement d'état = changement de fichier** (`repos` ↔ `selectionne`, `replie` ↔ `deplie`). Les deux fichiers ont exactement le même cadre : rien ne bouge à l'écran. Le halo de la sélection reste dans le cadre.
4. **Accessibilité** : le texte est en tracés, donc invisible pour un lecteur d'écran. Mettre `alt` / `aria-label` = `label`, et `aria-expanded` sur les blocs repliables.
5. Fonctionnent en `<img>` comme en SVG intégré directement dans la page (identifiants internes uniques `fa-<chemin>-…`, aucun mélange de couleurs).
6. Pas d'état sélectionné pour les titres de catégories et les cartes (ce ne sont pas des boutons). Le survol n'est pas fourni (à faire en CSS si besoin).

## Exemple (React / TypeScript)
```tsx
import { forgeAsset } from './forgeAssets';

function ForgeBouton({ id, hauteur = 44, onClick }: { id: string; hauteur?: number; onClick?: () => void }) {
  const a = forgeAsset(id)!;
  return (
    <button type="button" onClick={onClick} style={{ background: 'none', border: 0, padding: 0 }}>
      <img src={`/${a.fichier}`} alt={a.label} height={hauteur} width={Math.round(hauteur * a.ratio)} />
    </button>
  );
}
// <ForgeBouton id="selecteur.legendarium.selectionne" />
// <ForgeBouton id={ouvert ? 'blocs-repliables.mon-build.deplie' : 'blocs-repliables.mon-build.replie'} />
```
Adapter le chemin (`/${a.fichier}`) à la façon dont l'appli sert ses fichiers statiques (dossier `public`, import du bundler, etc.).

## À savoir
- Textes en français uniquement (versions anglaises non prévues pour l'instant).
- « Artefact » reprend un SVG fourni par Ory (shield-artifact, SVG Repo) : vérifier sa licence avant une diffusion publique.
- Le losange +/− n'est prévu que sur les 7 blocs repliables.

## Version 14 — lisibilité du « A » stylisé (Λ)
- La jambe gauche du Λ était trop fine (lisibilité faible en petit). Elle est épaissie (largeur horizontale constante ≈ 78 % de celle de la jambe droite, la jambe gauche reste parallèle à son bord extérieur ; bord extérieur et jambe droite inchangés) dans tous les visuels contenant un « A » : titres, boutons du sélecteur / de profil / d'action, titres des blocs repliables, etc. (37 fichiers SVG).
- Aucun identifiant, aucune dimension ni aucun nom de fichier ne change : remplacement direct des fichiers.
- `marque/logo-forge-armory.png` et `forge-armory-declinaisons.png` (images) : retouchées au pixel pour le même « A » d'ARMORY (jambe gauche épaissie, reste du lettrage intact). Même nom, même taille. Ce ne sont pas des vectoriels ; le « A » de l'écran de chargement, minuscule, est quasi inchangé.

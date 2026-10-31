# Forge Armory — visuels à intégrer dans l'appli (Destiny 2 Build Analyzer)

65 SVG prêts à l'emploi, fond transparent, aucune police à charger. Détails, dimensions et catalogue : `docs/charte-graphique.html`.

## Structure
```
assets/
  selecteur/          8  Build Analyzer, Bibliothèque, Load-outs, Collection × repos / sélectionné  viewBox 4316 × 1024
  profils/            8  Neutre, PvE Roaming, PvE DPS, PVP × repos / sélectionné            viewBox 3781 × 1024
  blocs-repliables/  14  7 blocs × replié / déplié (losange + / −)                          viewBox 7805 × 1024
  titres/             8  contexte (0. + ligne), cartes 1 à 5, score global — repos          viewBox 7505 × 1024
  icones/            22  cercle + symbole seuls (barres réduites, onglets, export infographique)  viewBox 1024 × 1024
  symboles/           4  symboles des profils vectorisés, sans cercle
  marque/             1  emblème Forge Armory
manifest.json         catalogue de tous les actifs (id, libellé, état, fichier, dimensions, ratio)
forgeAssets.ts        même catalogue typé pour le code de l'appli
docs/charte-graphique.html
```

## Bouton « Collection » (sous-menu de l'onglet Forge)
`selecteur.collection.repos` / `selecteur.collection.selectionne` : même cadre, mêmes cristaux et même lueur que les autres boutons du sélecteur (livre ouvert, dos cyan). Icône seule : `icones.collection`.

## Logos « Armes » et « Armures » (export infographique)
Trois logos, à afficher **au minimum** dans l'export infographique :
- `icones.armes-armures` — épée plantée dans le bouclier (logo de la carte « 3. Armes et Armures »)
- `icones.armes` — l'épée seule (grande, dressée), pour les armes
- `icones.armures` — le bouclier seul (cadre vide + cristal bleuté au centre), pour les armures
Hauteur minimale conseillée : 32 px (lisibles) ; à 24 px les détails fins se brouillent.

## Identifiants (`manifest.json`)
`<famille>.<clé>[.<état>]`, par exemple `selecteur.bibliotheque.selectionne`, `profils.pvp.repos`, `blocs-repliables.mon-build.deplie`, `titres.3-armes-armures.repos`, `icones.armes`.
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
// <ForgeBouton id="selecteur.bibliotheque.selectionne" />
// <ForgeBouton id={ouvert ? 'blocs-repliables.mon-build.deplie' : 'blocs-repliables.mon-build.replie'} />
```
Adapter le chemin (`/${a.fichier}`) à la façon dont l'appli sert ses fichiers statiques (dossier `public`, import du bundler, etc.).

## À savoir
- Textes en français uniquement (versions anglaises non prévues pour l'instant).
- « Artefact » reprend un SVG fourni par Ory (shield-artifact, SVG Repo) : vérifier sa licence avant une diffusion publique.
- Le losange +/− n'est prévu que sur les 7 blocs repliables.

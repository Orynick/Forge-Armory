# SPEC — Intégration des encarts à équerres des blocs repliables — 2026-11-22

**Statut :** validée puis CÂBLÉE le 22/11/2026 — **en attente de l'APERÇU utilisateur** (`npm run dev` sur la branche, validation avant merge, cf. §6.3).
**Branche :** `draft-encarts-equerres`
**Spec de design de référence — FAIT FOI (aucune invention)** : `ressources-installateur/forge-armory/app-assets/ENCARTS-BLOCS.md` + `composants/BlocRepliable.tsx` + `composants/BlocRepliable.css` + maquettes `docs/encart-*.png` (livrés par l'utilisateur dans le pack v14).

## 1. Contexte

Le pack v14 a livré le composant d'encart à équerres **prêt à l'emploi** dans l'archive de référence, mais **AUCUN câblage** dans l'appli n'a été fait (DEVLOG 22/11 : « les blocs gardent leur cadre actuel »). Les blocs repliables affichent donc toujours le cadre « rectangle gris arrondi ». Ce chantier est le **câblage** : remplacer le cadre actuel des blocs repliables par l'encart à équerres du pack.

## 2. Périmètre

- **Concerne** : les blocs REPLIABLES de l'appli — ceux qui utilisent `TitreRepliable` (losange +/−) : Doctrine (GrilleDoctrine ?), Artefact (SelecteurArtefact), Sauvegarde (BlocPartage), Inventaire (SelecteurInventaire), Manifest, Résumé du build — **liste EXACTE à établir au câblage** et à faire valider sur l'aperçu ; 
- **Ne concerne PAS** : les cartes fixes de la page (PilierCarte — « rectangle gris arrondi » conservé pour les cartes non repliables), les encarts de la Forge/Legendarium (styles propres), les titres non repliables ;
- Fichiers prévus : `composants/BlocRepliable.tsx/.css` **copiés dans `src/components/`** (l'archive reste la référence, jamais modifiée), `TitreRepliable`/blocs concernés recâblés dessus, `index.css` (retrait des règles de cadre devenues inutiles pour les blocs concernés).

## 3. Respect strict de la spec de l'utilisateur (ENCARTS-BLOCS.md)

- 3 équerres (haut droit, bas gauche, bas droite) ; pas d'équerre haut gauche ;
- 4 états : replié (aucun encart) → ouverture (hauteur 0→100 % en 0,35 s, équerres basses en fin de course) → déplié inactif (argentées) → **déplié actif (cyan lumineux, fondu 0,25 s)** ;
- **Un seul bloc actif à la fois** (ouvrir/click/focus dans le contenu l'active ; fermer le bloc actif n'en laisse aucun) ; plusieurs blocs peuvent rester dépliés ;
- ouverture par hauteur de grille CSS (aucune hauteur à connaître : les équerres ne se déforment jamais) ;
- habillage : fond dégradé 88 % d'opacité, disque derrière le logo, filet bas en fondu, gradient argent/cyan conformes ;
- `prefers-reduced-motion` : toutes transitions coupées ;
- accessibilité : titre en `<button aria-expanded aria-controls>`, image `alt`, corps replié `inert`, encart `aria-hidden` ;
- toutes les mesures proportionnelles au titre (`--titre-h`), comme dans le CSS du pack — **le CSS du pack n'est pas modifié**.

## 4. Décisions d'intégration (la présente spec)

1. **Largeur : OPTION B VALIDÉE par l'utilisateur (22/11/2026)** — « aujourd'hui les encarts s'adaptent à la taille de l'écran, y compris sur smartphone — évitons une régression ». Le composant reçoit donc une hauteur de titre **fluide**, pilotée par la MÊME variable responsive que l'appli utilise déjà pour ses titres (`--hauteur-logo-titre` : 3,5 rem en grand écran, ≥ 2,6 rem en écran étroit). L'encart suit le titre partout, y compris sur téléphone. **Critère de non-régression** : avant/après sur le même contenu, la largeur d'un bloc doit rester ≤ 100 % de la largeur disponible sur les points de rupture existants (verification manuelle + capture) ;
2. **Contenu : l'encart est le gabarit** — le contenu d'un bloc se contraint à l'encart (`max-width: 100 %`, wrap), l'encart ne s'élargit jamais au-delà du titre (confirmation utilisateur du 22/11 : la largeur est fixée par le titre) ;
3. **Composant copié, non importé de l'archive** : `src/components/BlocRepliable.tsx` + `.css` (l'archive reste intouchée) ; le composant du pack accepte une prop `hauteurTitre` — c'est par elle qu'arrive la valeur fluide ;
4. **Titres SVG inchangés** : l'appli continue d'afficher `blocs-repliables/titre-<bloc>-<replie|deplie>.svg` (catalogue actuel — le pack v14 les a épaissis, intégrés le 22/11).

## 5. Critères d'acceptation (testables)

1. Les blocs câblés affichent l'encart à équerres conforme aux 4 états de `ENCARTS-BLOCS.md` (vérification manuelle en `npm run dev`, comparison avec les maquettes `docs/encart-*.png`) ;
2. Un seul bloc actif à la fois ; fermer le bloc actif n'en laisse aucun ;
3. **Non-régression responsive** : sur fenêtre étroite (~375 px, inspecteur mobile), aucun bloc ne déborde de l'écran ; comportement au moins équivalent à l'existant ;
4. `prefers-reduced-motion` respecté ; navigation clavier fonctionnelle (focus visible sur le titre, corps replié non focusable) ;
5. Les cartes non repliables (PilierCarte) et le reste de l'interface sont **inchangés** ;
6. `npx tsc -b` 0 erreur ; `npm run test:logique` N/N ; `npm run build` OK ; CI verte.

## 6. Décisions tranchées par l'utilisateur (22/11/2026, puis « Ok, on y va comme ça »)

1. **TOUS les blocs repliables** ET **tous les blocs fixes du pack** → câblés : les **7 blocs du composant** (connexion, mon-build, inventaire, manifest, doctrine, artefact, sauvegarde) ;
2. Les 5 cartes piliers + Contexte + Score global restent **hors périmètre** (aucun asset prévu au pack v14 ; « on généralisera après l'aperçu + test » si l'utilisateur livre les assets) ;
3. **Aperçu de validation AVANT merge** : l'utilisateur vérifie en `npm run dev` sur la branche.

**Notes d'historique** : les blocs Connexion et Manifest avaient été déclarés « PAS repliables » en v0.3.17 (retours utilisateurs d'alors) — décisions **supersédées** par le pack v14 (SVG repliables fournis pour les deux) et la décision du 22/11 (« on applique à tous les blocs »).

**Câblage réalisé le 22/11/2026** (en attente d'aperçu) :
- `src/components/BlocRepliable.tsx/.css` : copie ADAPTÉE du pack (urlVisuel au lieu du forgeAsset du pack, ref transmise, hauteur de titre fluide par défaut — le CSS du pack est copié INTACT puis étendu d'un bloc d'intégration option B ; l'archive reste la référence) + contexte de page (`BlocsRepliablesProvider` : tous ouverts au départ, AUCUN actif — les équerres cyan n'apparaissent qu'à l'interaction) ;
- 7 blocs câblés : GrilleDoctrine, SelecteurArtefact, SelecteurInventaire, BlocPartage, ResumeBuild, RechercheManifest (devient repliable), carte Connexion du Dashboard (devient repliable) ;
- le STATUT de chargement et les boutons DEV qui vivaient dans les sommaires passent EN PREMIÈRE LIGNE du corps de chaque bloc (contenu inchangé) ; la ref d'ancre Inventaire (« Aller à ») est transmise au composant ;
- TitreRepliable et les règles CSS `details[open]…`/`.bloc-repliable-ligne` deviennent INUTILISÉS (conservés jusqu'à l'aperçu, suppression prévue après validation) ;
- tsc 0, batterie 68/68 (1354/1354), build OK.

## 7. Décisions de l'utilisateur (consignées)

| Date | Décision |
|---|---|
| 22/11/2026 | Le CSS du pack (encart figé sur le gabarit du titre) est confirmé : la largeur suit le titre |
| 22/11/2026 | **Option B** : hauteur de titre fluide (comme les titres actuels) — « évitons une régression » : les encarts doivent continuer de s'adapter à la taille de l'écran, y compris smartphone |

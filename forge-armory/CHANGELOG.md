# CHANGELOG — Forge Armory

> **Ce fichier est désormais un changelog orienté utilisateur.**
> L'historique complet et détaillé du développement (DEVLOG) se trouve dans [`DEVLOG.md`](DEVLOG.md).

## v0.5.6 — 28/10/2026

- **Forge des armures, étape 2 — la simulation des mods d'armure est terminée** : vous pouvez modifier les mods d'une armure **directement dans la pop-up « Détails »** (Mon Inventaire, Coffre et Mon Build), sans passer par la fenêtre Forge. Le **score et Mon Build réagissent en temps réel** : les statistiques de l'armure sont recalculées avec les mods simulés, et le bandeau « Score calculé avec des mods d'armure simulés » s'affiche à côté du score.
- **Budget d'énergie** : la simulation affiche une **jauge d'énergie** (coût de chaque mod / capacité de la pièce). Une simulation qui **dépasse l'énergie** de l'armure n'est pas réalisable en jeu : le score l'ignore et un avertissement vous le signale (badge dans Mon Build, bandeau sur la page principale).
- **Score réel → simulé** : à côté du score global, l'appli affiche la **comparaison** « réel → simulé (+N) » avec les piliers et les statistiques qui changent ; dans Mon Build, le delta des statistiques totales s'affiche à côté de chaque statistique (« Santé 5 (+5) »). Dans le bloc « Effets du Build », l'origine d'un verbe venant d'un perk **simulé** porte un badge « 🔨 simulé ».
- **Ajustement** : la statistique « + » propre à une armure légendaire est marquée du symbole **⇅** (en vert, devant le nom) partout où les six statistiques d'une armure s'affichent (sauf la Collection) ; la simulation permet de choisir l'ajustement (rien / équilibré / directionnel).
- **Interface allégée** : la fenêtre de simulation des mods est un **composant unique et compact** (résumé + « Modifier »), identique dans les trois pop-ups Détails et dans la Forge ; les statistiques s'affichent sur 2 lignes de 3, sans total.
- **Rien n'est modifié en jeu** : la simulation reste locale. L'enregistrement, le partage, l'export et l'équipement gardent vos mods réels.

→ Détails complets : [DEVLOG.md](DEVLOG.md)

## v0.5.5 — 24/10/2026

- **Livraison de l'audit du 23/10** (double audit Vibe + Opus 5.5, validé par les tests post-audit) : correctifs de scoring (Pilier 5 non plafonné, build vide honnête, pénalité des slots d'armes vides, détection « Radiance »), robustesse (bloc HMR mort supprimé, debounce annulé), code mort supprimé (icônes fantômes, 11 diagnostics archivés…), doublons centralisés (libellés de stats, normalisation de recherche, nommage de fichiers export, échappement HTML…).
- **Correctif** : le contenu du courrier (postmaster) n'apparaissait pas dans « Mon Inventaire » (point 5.8 des tests post-audit, non testable tant que le courrier n'était pas affiché). Les objets en attente y sont maintenant listés dans leur propre section « 📨 Courrier », et le bouton « Transférer vers » y est grisé avec l'explication : un objet au courrier ne se déplace pas d'ici (il faut d'abord le récupérer en jeu). L'équipement d'un objet au courrier reste refusé avec le même message.

→ Détails complets : [DEVLOG.md](DEVLOG.md)

## v0.5.4 — 23/10/2026

- **Correctif** : le chargement du Manifest ne fonctionnait plus dans le logiciel installé (bouton « charger le Manifest (FR+EN) » sans effet, `CompileError: WebAssembly.instantiate()` dans la console) : la politique de sécurité (CSP) bloquait la compilation WebAssembly de SQLite. Corrigé.

→ Détails complets : [DEVLOG.md](DEVLOG.md)

## v0.5.3 — 23/10/2026

- **Correctif** : la connexion à Bungie ne répondait plus après le clic sur la plateforme (Steam, PlayStation, Xbox, Google, Epic…) : la fenêtre de connexion restait blanche. Corrigé.

→ Détails complets : [DEVLOG.md](DEVLOG.md)

## v0.5.1 — 23/10/2026

- **Legendarium** : bibliothèque de Lore complète (Grimoire D1, Légendes D2, armes, armures, cosmétiques) avec export infographique PNG.
- **Page Carrière** : statistiques du compte (temps de jeu + 74+ stats traduites en français).
- **Page Accomplissements** : tous les Triomphes du compte, groupés par sceau (obtenus et à obtenir), avec recherche avancée.
- **Stack technique à jour** : Vite 7, React 19, React Router 7, Electron 45. **0 vulnérabilité.**

→ Détails complets : [DEVLOG.md](DEVLOG.md)

## v0.5.0 — 22/10/2026

- **Legendarium** livré : bibliothèque de Lore en lecture passive (Grimoire D1 hors-ligne, Légendes D2, armes, armures, cosmétiques), recherche avancée, parcours inverse, export infographique PNG.

→ Détails complets : [DEVLOG.md](DEVLOG.md)

---

*Historique complet du développement (avant v0.5.1) : [`DEVLOG.md`](DEVLOG.md)*

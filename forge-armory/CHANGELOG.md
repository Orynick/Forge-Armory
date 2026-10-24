# CHANGELOG — Forge Armory

> **Ce fichier est désormais un changelog orienté utilisateur.**
> L'historique complet et détaillé du développement (DEVLOG) se trouve dans [`DEVLOG.md`](DEVLOG.md).

## v0.5.5 — 24/10/2026 (branche test)

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

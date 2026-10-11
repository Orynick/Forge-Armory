# Agent IA — questions ouvertes et notes de relecture

**À lire avec** `ARCHITECTURE-AGENT-IA.md` (document de conception, 26/09/2026).
Ce fichier-ci rassemble ce qui reste à trancher et les points relevés en
relecture. Objectif : retrouver le fil rapidement, même dans plusieurs mois.

---

## 🔴 LA question à trancher en premier (26/09/2026)

**L'IA sera-t-elle pour l'utilisateur seul, ou aussi pour ses amis ?**

**Statut : EN SUSPENS, décision assumée de ne pas trancher tout de suite.**

Ce n'est pas un détail d'organisation : le choix conditionne toute
l'architecture, parce qu'une clé d'API IA se retrouve dans le `.exe`
fabriqué — exactement comme la clé Bungie aujourd'hui. Sauf qu'ici,
**chaque appel est facturé** : qui récupère l'exécutable peut consommer sur
le compte du propriétaire de la clé.

Les trois issues possibles :

| Option | Fonctionnement | Conséquence |
|---|---|---|
| **Usage personnel** | La clé de l'auteur dans son `.exe`, jamais partagé | Simple. Ferme la porte à la partie IA dans les archives invité. |
| **Chacun sa clé** | Écran de réglages où chacun colle la sienne | Aucun coût pour l'auteur. Friction pour les invités. Rejoint le besoin déjà noté pour la clé Bungie (voir TODO). |
| **Serveur intermédiaire** | Un service détient la clé | Seule solution propre pour une vraie distribution. **Contredit le « l'application reste locale »** du document, et l'auteur paie les appels de tous. |

⚠️ Trancher AVANT l'étape 4 du document (« connecter un premier agent »),
sinon le travail serait à refaire.

---

## Contexte qui a motivé la mise en attente (26/09/2026)

Bungie a communiqué cette semaine sur le fait que **Destiny sort de son
statut de fin de service** : le jeu pourrait donc de nouveau évoluer
(information rapportée par l'utilisateur).

Conséquence pour ce chantier : l'ampleur des évolutions à venir n'est pas
connue. Elle peut changer la donne sur ce que l'agent doit savoir faire
(nouvelles sous-classes, nouveau contenu, rythme des mises à jour du
Manifest), et donc sur l'intérêt d'une recherche Web ou d'une base
documentaire — deux points laissés ouverts par le document. Attendre d'y
voir clair est un choix délibéré, pas un oubli.

---

## Bonne nouvelle : les étapes 1 à 3 sont presque déjà faites

L'ordre de développement recommandé par le document commence par
« identifier l'architecture actuelle », « définir une interface interne
stable » puis « créer un premier outil `get_build()` ». Or ces briques
existent déjà :

- **Entrée** : `BuildDraft` (`src/types/build.ts`) décrit un build complet.
- **Sortie** : `evaluerBuild` (`src/lib/scoring/pillars.ts`) renvoie les
  5 piliers avec leurs lignes de détail déjà rédigées en français.

Un premier outil `get_build()` consisterait surtout à exposer l'existant,
pas à le réécrire.

---

## Deux points à ajouter au document lors de la reprise

**1. L'IA ne doit pas pouvoir contredire le score.** Si elle reçoit les
détails des piliers et rédige une analyse, son rôle est d'EXPLIQUER la
note, pas d'en produire une autre. Une analyse enthousiaste sur un build
noté 40 détruirait la confiance dans l'outil — c'est le pendant concret du
principe « le moteur calcule, l'IA explique ».

**2. Où placer les appels à l'API IA.** Dans le logiciel installé, ils
doivent partir du **processus principal** (`electron/main.cjs`), pas de la
page : sinon la clé est lisible depuis l'interface. Cela s'articule avec le
pont déjà en place (`electron/preload.cjs`), sur le modèle de ce qui a été
fait pour la connexion Bungie. À prévoir aussi : la future politique de
sécurité de contenu (CSP, notée au TODO) devra autoriser le domaine du
fournisseur IA.

---

## Rappel des points laissés ouverts par le document lui-même

Fournisseur et modèle, coût cible maximal, forme exacte de l'API interne,
liste définitive des outils, sources Web autorisées, stratégie
documentaire, base vectorielle/RAG, besoin réel d'un multi-agents,
conservation des journaux, mode de déploiement final.

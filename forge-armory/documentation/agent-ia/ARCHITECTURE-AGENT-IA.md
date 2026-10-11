# Destiny 2 --- Build Analyzer

## Architecture IA --- document de conception et décisions structurantes

**Date :** 26 septembre 2026\
**Statut :** proposition d'architecture issue des discussions du projet\
**Projet :** Destiny 2 - Build Analyzer

------------------------------------------------------------------------

## 1. Objet du document

Ce document formalise l'architecture IA envisagée pour **Destiny 2 -
Build Analyzer**.

L'objectif n'est pas de remplacer le moteur actuel de l'application,
mais d'ajouter au-dessus de celui-ci une couche d'agent IA capable de :

-   interpréter les données d'un build ;
-   produire des analyses approfondies en langage naturel ;
-   appeler certaines fonctions de l'application lorsque des calculs ou
    données précises sont nécessaires ;
-   effectuer, à terme, des recherches externes plus souples ;
-   mettre en relation les résultats calculés par l'application avec des
    informations documentaires ou récentes.

Le principe directeur est le suivant :

> **Le code de l'application reste responsable des données déterministes
> et des calculs vérifiables ; l'IA est principalement responsable de
> l'interprétation, du raisonnement ouvert et de l'orchestration des
> recherches/outils.**

------------------------------------------------------------------------

# 2. Architecture générale retenue

L'architecture envisagée est en couches :

``` text
┌──────────────────────────────────────────────┐
│              Interface utilisateur           │
│                Destiny 2 Build Analyzer       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Moteur de l'application         │
│                                              │
│  • données du build                          │
│  • équipement / mods / perks                 │
│  • statistiques                              │
│  • calculs                                   │
│  • comparaisons                              │
│  • données Bungie / Manifest / cache local   │
└──────────────────────┬───────────────────────┘
                       │
                 données structurées
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                    Agent IA                  │
│              « Build Analyst »               │
│                                              │
│  • interprétation                            │
│  • raisonnement                              │
│  • orchestration des outils                  │
│  • formulation des analyses                  │
└───────────────┬──────────────────┬───────────┘
                │                  │
                ▼                  ▼
┌────────────────────────┐  ┌───────────────────┐
│ Outils de l'application│  │ Recherche externe │
│                        │  │                   │
│ • get_build()          │  │ • Web             │
│ • get_weapon()         │  │ • patch notes     │
│ • calculate_damage()   │  │ • documentation   │
│ • compare_builds()     │  │ • guides          │
│ • etc.                 │  │ • autres sources  │
└────────────────────────┘  └───────────────────┘
```

L'application peut donc rester **locale**. L'agent peut communiquer avec
un service IA distant uniquement lorsque cela est nécessaire.

------------------------------------------------------------------------

# 3. Décision structurante n°1 --- conserver le moteur déterministe

### Décision

Ne pas demander à l'IA de remplacer les calculs déjà effectués par le
programme.

Le moteur de l'application doit rester la référence pour les résultats
calculables :

-   statistiques ;
-   dégâts ;
-   DPS ;
-   comparaisons ;
-   interactions explicitement modélisées ;
-   récupération et transformation des données du build.

### Motif

Un modèle IA est adapté à l'interprétation et au raisonnement souple,
mais il ne doit pas devenir la source de vérité pour un calcul numérique
qui peut être réalisé directement par le programme.

Exemple :

``` text
Mauvaise approche :

Build → IA → « calcule le DPS »

Approche retenue :

Build
  ↓
Moteur de calcul
  ↓
DPS = résultat numérique
  ↓
IA
  ↓
Interprétation du résultat
```

Cela permet notamment de rendre les analyses plus reproductibles et de
limiter les erreurs de calcul ou les « hallucinations » numériques.

------------------------------------------------------------------------

# 4. Décision structurante n°2 --- l'IA doit accéder aux données via des outils

L'agent ne devrait pas recevoir nécessairement toutes les informations
possibles à chaque requête.

On prévoit plutôt des fonctions/outils que l'agent peut appeler
lorsqu'il en a besoin.

Exemples conceptuels :

``` text
get_build(build_id)
get_weapon(item_id)
get_armor(item_id)
get_exotic(item_id)
get_mod(mod_id)

analyze_stats(build_id)

calculate_damage(parameters)
calculate_dps(parameters)

compare_weapons(weapon_a, weapon_b)
compare_builds(build_a, build_b)

search_local_database(query)
```

### Motif

Cette séparation permet à l'application de contrôler les données
exposées à l'IA et de conserver les calculs sensibles dans son propre
code.

Elle évite également d'envoyer inutilement de grandes quantités de
données au modèle.

------------------------------------------------------------------------

# 5. Exemple de fonctionnement

Un utilisateur pourrait demander :

> « Analyse ce build pour du Grandmaster Nightfall et dis-moi ce qui
> peut être amélioré. »

Le déroulement pourrait être :

``` text
1. L'agent reçoit l'identifiant du build.

2. Il demande les données nécessaires :
   get_build()

3. Il identifie une comparaison utile :
   compare_weapons()
   ou
   calculate_damage()

4. Le moteur de l'application effectue les calculs.

5. L'agent interprète les résultats.

6. Si l'information nécessaire n'est pas disponible localement,
   l'agent peut effectuer une recherche externe.

7. L'agent produit une analyse structurée.
```

L'agent devient donc un **orchestrateur**, et non le moteur de calcul
principal.

------------------------------------------------------------------------

# 6. Décision structurante n°3 --- architecture progressive

Il n'est pas prévu de construire immédiatement un système complexe de
type « multi-agents + RAG + base vectorielle + recherche Web ».

L'architecture doit évoluer par étapes.

## Étape 1 --- analyse IA simple

Premier objectif :

``` text
Build local
   ↓
Données structurées
   ↓
Agent IA
   ↓
Analyse
```

L'agent reçoit les données du build et les interprète.

## Étape 2 --- outils applicatifs

Ajouter progressivement des fonctions que l'agent peut appeler :

``` text
get_build()
calculate_damage()
compare_builds()
...
```

## Étape 3 --- recherche externe

Ajouter une capacité de recherche permettant de répondre aux questions
nécessitant des informations hors de la base locale.

Exemples :

-   patch notes ;
-   changements de sandbox ;
-   documentation ;
-   informations récentes ;
-   guides ou sources spécialisées.

## Étape 4 --- base documentaire

Si le besoin apparaît, ajouter une recherche spécialisée dans un corpus
de documents Destiny 2.

## Étape 5 --- spécialisation éventuelle

Seulement si le projet le justifie, introduire plusieurs spécialistes :

``` text
                 Agent principal
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Build Analyst  Research     Activity
                    Agent        Specialist
```

Spécialisations possibles :

-   analyse générale de build ;
-   recherche documentaire ;
-   GM ;
-   raids ;
-   donjons ;
-   PvP ;
-   DPS.

Cette étape est **une possibilité d'évolution, pas une décision
nécessaire pour la première version**.

------------------------------------------------------------------------

# 7. Pourquoi commencer par un seul agent

### Décision

La première version doit utiliser un agent principal unique.

### Motif

Un système multi-agents introduit immédiatement :

-   davantage de code ;
-   davantage de coûts potentiels ;
-   davantage de points de défaillance ;
-   une orchestration plus complexe ;
-   davantage de difficulté pour diagnostiquer une mauvaise réponse.

Pour un projet dont l'utilisateur souhaite conserver une architecture
compréhensible et maintenable, il est préférable de commencer avec :

``` text
Application
     ↓
Agent principal
     ↓
Outils
```

Puis de séparer des spécialistes uniquement lorsque le besoin réel
apparaît.

------------------------------------------------------------------------

# 8. Recherche Web : rôle envisagé

La recherche Web doit compléter les données de l'application, et non les
remplacer.

Exemple :

``` text
Question :
« Ce build est-il toujours pertinent après le dernier patch ? »

         ↓

Agent
         │
         ├── données locales du build
         │
         ├── calculs locaux
         │
         └── recherche externe
                  │
                  ├── patch notes
                  ├── informations Bungie
                  └── documentation récente
```

L'agent peut ensuite rapprocher les informations trouvées des résultats
calculés localement.

### Principe important

Les informations provenant du Web doivent rester distinguées des
résultats produits directement par l'application.

L'architecture devra donc idéalement conserver les sources utilisées
pour une analyse afin de pouvoir expliquer d'où vient une affirmation.

------------------------------------------------------------------------

# 9. Séparation des responsabilités

La séparation suivante constitue un principe central de l'architecture.

  Fonction                                      Application                  Agent IA
  --------------------------------------- ----------------- -------------------------
  Stockage local des données                            Oui                       Non
  Récupération des données Bungie                       Oui   Via outil si nécessaire
  Calculs numériques                                    Oui                       Non
  Comparaisons déterministes                            Oui                       Non
  Interprétation des résultats                Partiellement                       Oui
  Raisonnement en langage naturel                       Non                       Oui
  Recherche documentaire                    Optionnel/local            Oui, via outil
  Recherche Web                                         Non            Oui, via outil
  Orchestration de plusieurs opérations                 Non                       Oui
  Réponse conversationnelle                       Interface                       Oui

Cette séparation n'est pas absolue : certaines fonctions peuvent être
partagées. Le principe est surtout de conserver une **source de vérité
déterministe** pour les données et calculs.

------------------------------------------------------------------------

# 10. Exemple de données transmises à l'agent

L'application pourrait produire une structure similaire à :

``` json
{
  "class": "Hunter",
  "subclass": "Nightstalker",
  "exotic": "Omnioculus",
  "weapons": [
    "Graviton Lance"
  ],
  "stats": {
    "mobility": 100,
    "resilience": 100,
    "recovery": 80
  },
  "calculated": {
    "baseDps": 124500,
    "buildDps": 167300
  }
}
```

L'agent ne devrait pas avoir à « deviner » ces valeurs.

Il peut ensuite les utiliser pour produire une analyse telle que :

``` text
Le calcul fourni par le moteur indique que...
```

La formulation exacte dépendra naturellement du prompt et du modèle
utilisés.

------------------------------------------------------------------------

# 11. Architecture locale / distante

Le projet peut rester local :

``` text
PC de l'utilisateur
│
├── React / TypeScript / Vite
├── données locales
├── Manifest / sql.js / cache
├── moteur d'analyse
└── interface IA
        │
        │ Internet
        ▼
   API du modèle IA
```

### Motif

Cela évite de devoir transformer immédiatement l'application en service
Web hébergé.

Le serveur distant n'est donc pas une dépendance architecturale
obligatoire pour la première version.

En revanche, une API IA implique généralement une utilisation facturée
selon le fournisseur, le modèle et la quantité de données traitées.

------------------------------------------------------------------------

# 12. Confidentialité et données

L'ajout d'un agent IA crée une nouvelle frontière de données.

Avant d'envoyer une donnée au modèle, il faudra déterminer :

1.  quelles données sont réellement nécessaires ;
2.  lesquelles peuvent rester locales ;
3.  lesquelles peuvent être transmises ;
4.  si des identifiants Bungie ou informations personnelles doivent être
    exclus ;
5.  quelles données doivent être journalisées ;
6.  comment éviter d'envoyer inutilement le profil complet.

### Principe architectural

> **Minimiser les données envoyées à l'agent.**

L'agent devrait recevoir un contexte construit spécifiquement pour la
requête plutôt qu'un export brut de tout le profil.

------------------------------------------------------------------------

# 13. Traçabilité des analyses

Une évolution importante consiste à conserver une trace des opérations
réalisées par l'agent.

Exemple :

``` text
Question utilisateur
       ↓
Agent
       ↓
get_build()
       ↓
calculate_damage()
       ↓
compare_weapons()
       ↓
Recherche Web
       ↓
Analyse finale
```

### Motif

Cela facilite :

-   le débogage ;
-   la vérification d'une réponse ;
-   l'identification d'une mauvaise donnée ;
-   l'amélioration des prompts ;
-   la compréhension des coûts d'utilisation ;
-   la reproduction d'un problème.

La traçabilité doit rester compatible avec les contraintes de
confidentialité.

------------------------------------------------------------------------

# 14. Architecture cible à moyen terme

Une architecture plus complète pourrait devenir :

``` text
                         ┌──────────────────────┐
                         │ Interface D2 Analyzer│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Agent principal   │
                         │    Build Analyst     │
                         └──────┬───────┬───────┘
                                │       │
                 ┌──────────────┘       └──────────────┐
                 ▼                                     ▼
       ┌───────────────────┐                ┌───────────────────┐
       │ Outils applicatifs│                │ Recherche externe │
       │                   │                │                   │
       │ données           │                │ Web               │
       │ calculs           │                │ documentation     │
       │ comparaisons      │                │ patch notes       │
       └─────────┬─────────┘                └─────────┬─────────┘
                 │                                    │
                 └────────────────┬───────────────────┘
                                  ▼
                         ┌──────────────────────┐
                         │ Synthèse / analyse   │
                         │ avec sources         │
                         └──────────────────────┘
```

Des agents spécialisés pourraient être ajoutés ultérieurement sans
remettre en cause le principe de base.

------------------------------------------------------------------------

# 15. Ce qui est décidé vs ce qui reste ouvert

## Décisions structurantes déjà retenues

-   L'application actuelle reste le socle.
-   Le moteur déterministe n'est pas remplacé par l'IA.
-   L'IA est ajoutée comme couche supérieure.
-   L'agent doit pouvoir utiliser des outils exposés par l'application.
-   Les calculs numériques importants restent réalisés par le code.
-   Le développement doit être progressif.
-   La première version doit rester simple, avec un agent principal.
-   L'application peut rester locale.
-   La recherche Web est une capacité complémentaire.
-   La confidentialité doit être prise en compte dès la conception.
-   Les opérations de l'agent doivent idéalement être traçables.

## Points encore ouverts

Les discussions n'ont pas encore fixé :

-   le fournisseur/modèle IA définitif ;
-   le coût cible maximal ;
-   la forme exacte de l'API interne ;
-   la liste définitive des outils exposés ;
-   les sources Web autorisées ou prioritaires ;
-   la stratégie documentaire éventuelle ;
-   l'utilisation éventuelle d'une base vectorielle/RAG ;
-   la nécessité réelle d'un système multi-agents ;
-   la politique exacte de conservation des journaux ;
-   le mode de déploiement final de l'application.

Ces points ne doivent donc pas être considérés comme des décisions déjà
prises.

------------------------------------------------------------------------

# 16. Ordre de développement recommandé

Pour éviter une refonte inutile :

``` text
1. Identifier précisément l'architecture actuelle
        ↓
2. Définir une interface interne stable pour les données de build
        ↓
3. Créer un premier outil get_build()
        ↓
4. Connecter un premier agent IA
        ↓
5. Tester une analyse simple
        ↓
6. Ajouter les outils de calcul/comparaison
        ↓
7. Ajouter la recherche externe
        ↓
8. Ajouter la traçabilité et les sources
        ↓
9. Évaluer le besoin d'une base documentaire
        ↓
10. Évaluer seulement ensuite le multi-agent
```

------------------------------------------------------------------------

# 17. Principe directeur du projet

L'architecture doit rester fidèle à une idée simple :

> **Le Build Analyzer sait calculer ; l'agent IA sait raisonner,
> chercher et expliquer.**

Le but n'est donc pas de « donner le contrôle de l'application à une IA
», mais de fournir à l'IA un accès contrôlé aux capacités fiables de
l'application.

Cette distinction doit rester une contrainte de conception lors des
prochaines étapes du projet.

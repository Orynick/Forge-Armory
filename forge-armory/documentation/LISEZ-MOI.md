# Dossier documentation

FR : documents de référence du projet, qu'on consulte ponctuellement.
Les fichiers utilisés au quotidien restent à la racine (voir plus bas).

EN: project reference documents, read occasionally. Day-to-day files stay
at the project root (see below).

## Ce qu'on range ici

| Sous-dossier | Contenu | Nommage |
|---|---|---|
| `audits/` | Rapports d'audit (internes ou externes) | `AUDIT-AAAA-MM-JJ[-sujet].md` |
| `agent-ia/` | Conception de l'agent IA : architecture et notes de décision | libre |
| `todo/` | Archives de la TODO avant un tri (copie intégrale, mot pour mot) | `ARCHIVE-TODO-AAAA-MM-JJ.md` |
| `tests/` | Archives des tests validés, retirés de `A-TESTER.pdf` lors d'un tri, recopiés mot pour mot | `ARCHIVE-TESTS-AAAA-MM-JJ.md` |
| `sources/` | Sources des documents livrés en PDF à la racine, et le script qui les produit (outil de Claude) | même nom que le PDF, en `.md` |

Un nouveau type de document (conception d'un autre chantier, procédure,
etc.) reçoit son propre sous-dossier, sur le même principe.

**Suite donnée à un audit** : on ne réécrit pas le rapport d'origine. On
ajoute à la fin une courte section « Suite donnée », et le détail va dans
`CHANGELOG.md` à la date du jour.

## Ce qui reste à la racine, et pourquoi

- `README.md`, `GUIDE-DEMARRAGE.md`, `GUIDE-DEMARRAGE-INVITE.md` : premiers
  fichiers qu'ouvre quelqu'un qui découvre le projet (invités compris).
- `TODO.md`, `A-TESTER-<version>.pdf` (le numéro de version de l'appli figure dans le nom : `A-TESTER-0.3.1.pdf`), `CHANGELOG.md` : consultés ou mis à jour à
  chaque session de travail.
  `A-TESTER.pdf` se lit tel quel ; ses cases se cochent directement dans
  le lecteur PDF (puis Ctrl+S). Il est produit à partir de
  `sources/A-TESTER.md`, qu'on modifie à la place du PDF ; un PDF coché
  renvoyé à Claude est relu automatiquement dans cette source.
- `knowledge-base/` : données de jeu de référence du scoring, pas de la
  documentation du projet.

## Archives invité

Ce dossier est interne au projet et n'apporte rien à un invité : il peut
être retiré en bloc des archives partagées.

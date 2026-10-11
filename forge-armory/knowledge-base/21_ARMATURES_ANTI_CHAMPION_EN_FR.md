# Perks intrinsèques (armatures) — anglais/français et couverture anti-champion

Source de la liste anglaise : [Destinypedia — Intrinsic trait](https://www.destinypedia.com/Intrinsic_trait)
(page consultée le 24/08/2026, dernière modification wiki : 17/07/2024 — peut donc
ne pas couvrir les archétypes introduits depuis).

Règle Anti-Champion 2.0 (mise à jour 9.7.0) : chaque arme a une capacité
anti-Champion intrinsèque déterminée par son armature. Voir
`ARMATURE_VERS_CHAMPION` dans `src/lib/manifest/doctrine.ts` pour le code.

⚠️ Les noms français ci-dessous sont soit **confirmés** (déjà utilisés dans
le code, avec preuve à l'appui — commentaire ou observation utilisateur),
soit une **traduction probable** à vérifier en jeu (marquée « à vérifier »).

---

## Armatures génériques

| Anglais | Français | Armes concernées | Couverture anti-champion |
|---|---|---|---|
| Adaptive Frame | Cadre Adaptatif | Fusil auto, Arme de poing, PM, Fusil à fusion, Fusil de précision, Fusil à traceur, Lance-grenades lourd, Lance-roquettes, Mitrailleuse, Glaive | ✅ Bloqueur (`adaptative`/`adaptatif`) |
| Aggressive Frame | Cadre Agressif | Arme de poing, Fusil de précision, Fusil à pompe, Fusil de précision, Fusil à fusion, Lance-roquettes, Glaive, Mitrailleuse | ✅ Implacable (`agressive`/`agressif`) |
| High-Impact Frame | Cadre à Impact Élevé | Fusil auto, Fusil de précision, Fusil à impulsion, Fusil à fusion, Lance-roquettes, Mitrailleuse | ✅ Implacable (`impact eleve`/`fort impact`/`haut impact`) |
| Lightweight Frame | Cadre Léger | Fusil auto, Fusil de précision, Fusil à impulsion, PM, Arme de poing, Fusil à pompe, Lance-grenades spécial | ✅ Surchargé (`legere`/`leger`) |
| Precision Frame | Cadre de Précision | Fusil auto, Fusil de précision, Arme de poing, PM, Arme de poing, Fusil à pompe, Fusil à fusion, Lance-roquettes, Lance-grenades lourd, Fusil à fusion-lin. | ✅ Bloqueur (`precis`) |
| Rapid-Fire Frame | Cadre à Tir Rapide | Fusil auto, Fusil de précision, Fusil à impulsion, Arme de poing, Fusil à pompe, Fusil de précision, Fusil à fusion, Lance-grenades lourd, Mitrailleuse, Glaive | ✅ Surchargé (`tir rapide`) |
| Heavy Burst | Rafale Lourde | Arme de poing, Arme de poing, Fusil à impulsion | ✅ Implacable (`rafale lourde`) |
| Adaptive Burst | Rafale Adaptative | Fusil à impulsion, Arme de poing, Fusil à fusion-lin. | ⚠️ Probablement couvert par coïncidence via `adaptative` (Bloqueur) — jamais vérifié spécifiquement pour cette variante |
| Aggressive Burst | Rafale Agressive | Fusil à impulsion | ⚠️ Probablement couvert par coïncidence via `agressive` (Implacable) — jamais vérifié spécifiquement |

## Armatures d'arc

| Anglais | Français | Détails | Couverture |
|---|---|---|---|
| Lightweight Frame (arc) | Cadre Léger (arc) | Arc recourbé, dégainage rapide | ⚠️ Matche `legere` (Surchargé) par coïncidence — jamais vérifié spécifiquement sur un arc |
| Precision Frame (arc) | Cadre de Précision (arc) | Arc à poulies, dégainage lent | ⚠️ Matche `precis` (Bloqueur) par coïncidence — jamais vérifié spécifiquement sur un arc |

📌 **« Œil d'archer à impact élevé »**, observé en jeu par l'utilisateur
(→ Implacable, déjà couvert via `impact eleve`), **ne correspond à aucune
des deux armatures d'arc listées par Destinypedia** — probablement un
archétype d'arc introduit après 2024, absent de cette page.

## Armatures d'épée

| Anglais | Français | Détails | Couverture |
|---|---|---|---|
| Adaptive Frame (épée) | Cadre Adaptatif (épée) | Attaque lourde : uppercut | Matche `adaptative` (Bloqueur) |
| Aggressive Frame (épée) | Cadre Agressif (épée) | Attaque lourde : coup de masse | Matche `agressive` (Implacable) |
| Lightweight Frame (épée) | Cadre Léger (épée) | Attaque lourde : ruée | Matche `legere` (Surchargé) |
| Caster Frame | **Cadre Lanceur** (à confirmer) | Attaque lourde : projectile | 📌 **Pourrait expliquer « Armature de lanceur » → Bloqueur**, confirmée en jeu par l'utilisateur le 05/08 et déjà dans le code (`lanceur`) — si le nom français officiel de Caster Frame est bien « Cadre Lanceur », c'est cette armature-là qui a été identifiée. À confirmer. |
| Vortex Frame | Cadre Vortex | Attaque lourde : rotation | ✅ Surchargé (`vortex`) |
| Wave Sword Frame | Cadre à Onde (épée) | Attaque lourde : onde de choc | ✅ Implacable (`onde`) |

## Armatures uniques

| Anglais | Français | Arme(s) | Couverture |
|---|---|---|---|
| Support Frame | Cadre de Soutien | Fusil auto | ✅ Surchargé (`soutien`) |
| Pinpoint Slug Frame | Cadre à Munition Unique (à confirmer) | Fusil à pompe | ❌ **Non couvert** — aucun mot-clé actuel ne matche, nom français incertain |
| Wave Frame | Cadre à Onde | Lance-grenades spécial | ✅ Implacable (`onde`) |
| Compressed Wave Frame | Cadre à Onde Compressée | Lance-grenades lourd | ✅ Implacable (`onde`) — confirmé en jeu par l'utilisateur le 05/08 |
| Double Fire | Tir Double | Lance-grenades spécial | ✅ Implacable (`tir double`) |
| Area Denial Frame | Cadre de Déni de Zone | Lance-grenades spécial | ✅ Surchargé (`deni de zone`/`zone de deni`), confirmé en jeu |
| Rocket-Assisted Frame | Cadre Assisté par Fusée (à confirmer) | Arme de poing spéciale | ⚠️ Pourrait matcher `lanceur` (Bloqueur) si le nom français contient ce mot — à vérifier, risque de collision avec Caster Frame ci-dessus si les deux partagent le mot « lanceur » |
| Micro-Missile Frame | Cadre Micro-missile | The Mountaintop (exotique) | ✅ Implacable (`micro-missile`) |
| MIDA Synergy | **Synergie MIDA** | MIDA Mini-Tool, CALUS Mini-Tool | 🔴 **CAS PARTICULIER, volontairement NON codé.** Observé par l'utilisateur : PM → Surchargé, Fusil à pompe → Implacable. Le résultat dépend du TYPE D'ARME combiné, pas de l'armature seule — une entrée générique donnerait une réponse fausse pour l'un des deux cas. |
| Together Forever | **Ensemble à jamais** | Drang, Drang (Baroque), Zenith | 🔴 **CAS PARTICULIER, volontairement NON codé.** Observé par l'utilisateur : Drang seul → Bloqueur, Drang + Micro-missile (Imprévu) → Surchargé. ⚠️ Collision corrigée le 05/08 : le mot-clé `ensemble` (pour Felwinter's Lie) matchait aussi ce nom-ci par accident, donnant Implacable à tort. Rétréci à `tir d'ensemble`. |
| Shot Package | Tir d'ensemble | Le Mensonge de Felwinter (exotique) | ✅ Implacable (`tir d'ensemble`, corrigé le 05/08 pour ne plus matcher Together Forever) |
| Legacy PR-55 Frame | Cadre Héritage PR-55 | BxR-55 Battler | ✅ Bloqueur (`pr-55`), confirmé (Estoc de Redrix) |
| Exotic perks | Perks exotiques | Toutes les armes exotiques | Traité séparément — voir `JETONS_CHAMPION`, jetons du jeu sur le texte du perk intrinsèque, pas cette table |

## Mots-clés du code sans correspondance connue sur Destinypedia

Ces deux mots-clés sont dans `ARMATURE_VERS_CHAMPION` mais ne correspondent à
aucune armature listée par Destinypedia — probablement des noms français
observés en jeu par l'utilisateur pour des armatures absentes de cette page
(Lance-roquettes/Mitrailleuse ont des armatures spécifiques non détaillées
par le wiki), ou des variantes non documentées.

| Mot-clé | Champion | Origine |
|---|---|---|
| `interruption` | Bloqueur | Observation directe, sans nom d'armature Destinypedia correspondant |
| `attaque` | Implacable | Observation directe, sans nom d'armature Destinypedia correspondant |

## Cas exotiques à perk variable — Ergo Sum

L'épée exotique **Ergo Sum** change de perk intrinsèque selon la « mémoire »
équipée par le joueur (elle copie des traits d'autres exotiques). Observé
par l'utilisateur :

| Perk intrinsèque actif | Champion |
|---|---|
| Héraut de l'Orage | Bloqueur |
| Sursis imprévu | Surchargé |
| Munitions Meute de loups | Bloqueur |

📌 Cas **probablement déjà géré correctement** par le code existant : la
détection des armes exotiques lit le texte du perk intrinsèque ACTUELLEMENT
sélectionné (jetons du jeu, `JETONS_CHAMPION`) avant même de consulter la
table d'armature — si chacun des 3 perks d'Ergo Sum porte son propre jeton
dans sa description, le bon champion devrait déjà ressortir sans code
supplémentaire. **Non vérifié sur données réelles.**

---

## Statut global — armatures légendaires

- **21 mots-clés distincts couverts**, dont 19 correspondent clairement à
  une armature nommée par Destinypedia, et 2 (`interruption`, `attaque`)
  sans correspondance connue sur cette page précise.
- **1 armature légendaire identifiée comme manquante** : Pinpoint Slug Frame
  (fusils à pompe à munition unique).
- **2 cas volontairement non codés** car le résultat dépend de l'arme
  combinée, pas de l'armature seule : Synergie MIDA, Ensemble à jamais.
- **1 bug de collision corrigé** le 05/08 : `ensemble` matchait à la fois
  Felwinter's Lie et Together Forever, donnant une réponse fausse pour ce
  dernier.

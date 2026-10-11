# Contrôle de l'anti-champion des armes exotiques

Forge Armory v0.3.0 — 05/10/2026 21:37:02. Déduction de REPLI de l'appli (`deduireAntiChampion`, utilisée seulement pour une exotique absente de la liste) comparée à la liste de référence (knowledge-base/28), que l'appli utilise en priorité.

| Résultat | Nombre |
|---|---|
| Désaccords (l'appli déduit un AUTRE type que la liste) | 2 |
| Non détectés (la liste indique un type, l'appli ne trouve rien) | 115 |
| Versions divergentes (plusieurs versions de l'arme dans le Manifest, déductions différentes) | 0 |
| Détectés en trop (la liste n'indique pas de type, l'appli en déduit un) | 0 |
| Absents du Manifest (nom introuvable tel quel (orthographe différente, ou arme absente du Manifest français)) | 3 |
| Accords (même type des deux côtés) | 23 |
| Accords sans champion (aucun type des deux côtés) | 0 |
| Exotiques du Manifest absentes de la liste | 1 |

## Désaccords (2)

_l'appli déduit un AUTRE type que la liste_

| Arme | Emplacement | Liste | Appli (par version : hash → déduit) |
|---|---|---|---|
| Centrifuse | energie | Surchargé | 1912669214 → Implacable |
| Poigne du Salut | lourde | Implacable | 370712896 → Surchargé |

## Non détectés (115)

_la liste indique un type, l'appli ne trouve rien_

| Arme | Emplacement | Liste | Appli (par version : hash → déduit) |
|---|---|---|---|
| Belle Affaire | cinetique | Surchargé | 1345867570 → — |
| Sturm | cinetique | Implacable | 2907129556 → — |
| Aile de Vigilance | cinetique | Implacable | 3628991659 → — |
| Empereur des Rats | cinetique | Bloqueur | 2362471601 → — |
| Outil multifonction MIDA | cinetique | Bloqueur | 1331482397 → — |
| Garance | cinetique | Implacable | 3437746471 → — |
| Le Lapin de Jade | cinetique | Implacable | 3844694310 → — |
| L'opportun | cinetique | Bloqueur | 2286143274 → — |
| Règne de Suros | cinetique | Bloqueur | 2856683562 → — |
| Cerberus+1 | cinetique | Surchargé | 1541131350 → — |
| As de Pique | cinetique | Bloqueur | 347366834 → — |
| Fardeau d'Izanagi | cinetique | Bloqueur | 3211806999 → — |
| Dernières paroles | cinetique | Implacable | 1364093401 → — |
| Chardon | cinetique | Bloqueur | 3973202132 → — |
| Infection parfaite | cinetique | Surchargé | 3824673936 → — ; 400096939 → — |
| Lumina | cinetique | Surchargé | 3512014804 → — |
| Poupée vaudou | cinetique | Implacable | 2816212794 → — |
| Monte-Carlo | cinetique | Implacable | 4068264807 → — |
| Trésor asséché | cinetique | Surchargé | 2357297366 → — |
| Elu du Voyageur | cinetique | Surchargé | 1853180924 → — |
| Rapace noir | cinetique | Bloqueur | 3856705927 → — |
| Trop long à expliquer | cinetique | Bloqueur | 1594120904 → — |
| Récit d'un homme mort | cinetique | Bloqueur | 2188764214 → — ; 3654674561 → — |
| Cryosthésie 77k | cinetique | Implacable | 603721696 → — |
| Sceptre d'Ager | cinetique | Surchargé | 1833195496 → — |
| Prédécesseur | cinetique | Implacable | 2179048386 → — |
| Osteo Striga | cinetique | Surchargé | 46524085 → — |
| Once de méchanceté | cinetique | Bloqueur | 1802135586 → — |
| Tempête de vif-argent | cinetique | Implacable | 4293613902 → — |
| Dernier avertissement | cinetique | Surchargé | 3121540812 → — |
| Courbe verglacée | cinetique | Implacable | 3659414143 → — |
| Le Navigateur | cinetique | Surchargé | 1441805468 → — |
| Gouffre nécrotique | cinetique | Surchargé | 1034055198 → — |
| Garde-souhaits | cinetique | Implacable | 2910326942 → — |
| Khvostov 7G-0X | cinetique | Bloqueur | 4129629253 → — |
| Euphonie | cinetique | Bloqueur | 3284383335 → — |
| Aléthonyme | cinetique | Implacable | 2350354266 → — |
| Neo Finis Terræ | cinetique | Bloqueur | 2581676735 → — |
| Tumulus dyadique | cinetique | Surchargé | 1481594633 → — |
| Nouveau Malpais | cinetique | Implacable | 1736135946 → — |
| Lame praxique | cinetique | Bloqueur | 3049715579 → — |
| Ombre de Cull | cinetique | Implacable | 2200470033 → — |
| Cœur de glace | energie | Bloqueur | 1345867571 → — |
| Impitoyable | energie | Implacable | 4190156464 → — |
| Lion de guerre | energie | Implacable | 3549153978 → — |
| Rayon de soleil | energie | Implacable | 2907129557 → — |
| Lance du graviton | energie | Bloqueur | 3628991658 → — |
| Serment des Embraseurs | energie | Bloqueur | 4255268456 → — |
| Borealis | energie | Bloqueur | 3141979347 → — |
| Casse-cou | energie | Surchargé | 3089417789 → — |
| Ombres et lumière | energie | Surchargé | 4124984448 → — |
| Cristal de Prométhée | energie | Surchargé | 19024058 → — |
| Télesto | energie | Surchargé | 2208405142 → — |
| Lance de Polaris | energie | Bloqueur | 3413074534 → — |
| Goule trinitaire | energie | Surchargé | 814876685 → — |
| Diviseur d'ondes | energie | Surchargé | 1852863732 → — |
| Seigneur des Loups | energie | Implacable | 3413860063 → — |
| Jötunn | energie | Implacable | 417164956 → — |
| Tarrabah | energie | Bloqueur | 3110698812 → — |
| Symétrie | energie | Surchargé | 4017959782 → — |
| Pochette d'allumettes de Tommy | energie | Surchargé | 776191470 → — |
| Le Quatrième Cavalier | energie | Implacable | 1665952087 → — |
| Effigie désastreuse | energie | Implacable | 1363238943 → — |
| Dualité | energie | Implacable | 3460576091 → — |
| Frappe nuageuse | energie | Bloqueur | 2603483885 → — |
| Divination de Ticuu | energie | Implacable | 3260753130 → — |
| Exégèse du Vex | energie | Bloqueur | 4289226715 → — |
| Impulsion Lorentz | energie | Bloqueur | 3761898871 → — |
| Lame de compétition | energie | Surchargé | 542203595 → — |
| Lame d'action | energie | Bloqueur | 2535142413 → — |
| Lame d'intention | energie | Implacable | 14194600 → — |
| Messager mort | energie | Implacable | 2812324401 → — ; 46125926 → — |
| Obligation collective | energie | Bloqueur | 3505113722 → — |
| Tombe délicate | energie | Surchargé | 374573733 → — |
| L'Intrus | energie | Bloqueur | 1234150730 → — |
| La Manticore | energie | Surchargé | 219145368 → — |
| Hiérarchie des besoins | energie | Implacable | 4174431791 → — |
| Vexcalibur | energie | Surchargé | 3118061005 → — |
| Dallage | energie | Implacable | 3561203890 → — |
| Ex Diris | energie | Implacable | 3821409356 → — |
| Chorale solitaire | energie | Surchargé | 3698448090 → — |
| Lignée enterrée | energie | Bloqueur | 3886719505 → — |
| Mort rouge reformée | energie | Implacable | 427899681 → — |
| Chasse à l'affût | energie | Bloqueur | 2905188646 → — |
| Brise-glace | energie | Bloqueur | 1111334348 → — |
| Croc du Bourreau | energie | Surchargé | 1047932517 → — |
| Guide stellaire | energie | Surchargé | 3725585710 → — |
| Troisième itération | energie | Bloqueur | 2973900274 → — |
| Pique du graviton | energie | Surchargé | 648595258 → — |
| Girouette | energie | Bloqueur | 253843484 → — |
| Le Prospecteur | lourde | Implacable | 3549153979 → — |
| Bobine de Wardcliff | lourde | Implacable | 1508896098 → — |
| Légende d'Acrius | lourde | Surchargé | 3580904580 → — ; 1744115122 → — |
| La Colonie | lourde | Surchargé | 3899270607 → — |
| Ligne d'univers zéro | lourde | Implacable | 1864563948 → — |
| Image de l'Esprit dormant | lourde | Bloqueur | 4036115577 → — |
| Murmure du Ver | lourde | Bloqueur | 1891561814 → — ; 1983149589 → — |
| Mille voix | lourde | Implacable | 2069224589 → — |
| Griffe noire | lourde | Surchargé | 3766045777 → — |
| Anarchie | lourde | Surchargé | 2376481550 → — |
| Vérité | lourde | Implacable | 1201830623 → — |
| Xénophage | lourde | Implacable | 1395261499 → — |
| La Faucheuse | lourde | Surchargé | 2232171099 → — |
| Héritage évident | lourde | Surchargé | 2084878005 → — |
| Regard du lendemain | lourde | Implacable | 2399110176 → — |
| Gjallarhorn | lourde | Bloqueur | 1363886209 → — |
| Parasite | lourde | Bloqueur | 2812324400 → — |
| Grande ouverture | lourde | Implacable | 1763584999 → — |
| Cardiombre | lourde | Surchargé | 3664831848 → — |
| Microcosme | lourde | Bloqueur | 4207066264 → — |
| Foreuse finale | lourde | Implacable | 331231237 → — |
| Ovation tourbillonnante | lourde | Bloqueur | 1202007252 → — |
| Aconit | lourde | Implacable | 1753923263 → — |
| Service de Luzaku | lourde | Surchargé | 4284533075 → — |
| Fafnir | lourde | Implacable | 2197778303 → — |

## Absents du Manifest (3)

_nom introuvable tel quel (orthographe différente, ou arme absente du Manifest français)_

| Arme | Emplacement | Liste | Appli (par version : hash → déduit) |
|---|---|---|---|
| Ergo Sum solaire | energie | — | — |
| Ergo Sum abyssale | energie | — | — |
| Ergo Sum cryo-électrique | energie | — | — |

## Accords (23)

_même type des deux côtés_

| Arme | Emplacement | Liste | Appli (par version : hash → déduit) |
|---|---|---|---|
| Tueur de Souhaits | cinetique | Bloqueur | 814876684 → Bloqueur |
| Malveillance | cinetique | Implacable | 204878059 → Implacable |
| La Gouvernante | cinetique | Bloqueur | 3413860062 → Bloqueur |
| Arbalète | cinetique | Bloqueur | 2130065553 → Bloqueur |
| Bastion | cinetique | Implacable | 2415517654 → Implacable |
| Révision zéro | cinetique | Bloqueur | 1473821207 → Bloqueur |
| Finalité conditionnelle | cinetique | Implacable | 3371017761 → Implacable |
| Outil de folie | cinetique | Surchargé | 940371471 → Surchargé |
| Le Monarque | energie | Surchargé | 3588934839 → Surchargé |
| Serment d'Ériana | energie | Bloqueur | 3524313097 → Bloqueur |
| Divinité | energie | Surchargé | 4103414242 → Surchargé |
| Ruines du Diable | energie | Implacable | 3824106094 → Implacable |
| Hoirie | energie | Implacable | 1685137410 → Implacable |
| Canon tracteur | lourde | Surchargé | 3580904581 → Surchargé |
| D.A.R.C.I. | lourde | Surchargé | 3141979346 → Surchargé |
| Renard à deux queues | lourde | Surchargé | 2694576561 → Surchargé |
| Le Parjure | lourde | Implacable | 2044500762 → Implacable |
| Maitre du tonnerre | lourde | Surchargé | 3325463374 → Surchargé |
| Souffle du Léviathan | lourde | Implacable | 2591746970 → Implacable |
| Lamentation | lourde | Bloqueur | 3487253372 → Bloqueur |
| Chaos déterministe | lourde | Bloqueur | 449318888 → Bloqueur |
| Morsure hivernale | lourde | Implacable | 3118061004 → Implacable |
| Souffle du dragon | lourde | Implacable | 17096506 → Implacable |

## Exotiques du Manifest absentes de la liste (1)

_utile pour repérer un nom écrit différemment dans la liste_

| Nom dans le jeu | Hash | Appli |
|---|---|---|
| Ergo Sum | 1681583613 | — |

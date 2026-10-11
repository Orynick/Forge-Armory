# Contrôle de l'anti-champion des armes exotiques

Forge Armory v0.3.0 — 06/10/2026 00:25:25. Déduction de REPLI de l'appli (`deduireAntiChampion`, utilisée seulement pour une exotique absente de la liste) comparée à la liste de référence (knowledge-base/28), que l'appli utilise en priorité.

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

## Autres définitions de même nom que des armes de la liste (66, pour 39 armes)

_utile pour comprendre pourquoi la Recherche ou l'Inventaire affiche parfois un AUTRE objet que l'exotique attendu : ancienne version, objet factice, ornement…_

| Nom (liste) | Objet | Type d'objet | Rareté | Équipable | Type affiché | Sous-type | Seau | Catégories | Icône |
|---|---|---|---|---|---|---|---|---|---|
| Aconit | 3170398481 | 30 | 6 | false | Épée | 18 | 766235248 | 3726054802, 54 | /common/destiny2_content/icons/6acdff9af5ae274c70055f816aab2389.jpg |
| As de Pique | 1409726986 | 14 | 4 | true | Emblème | 0 | 4274335291 | 19, 52 | /common/destiny2_content/icons/48ec56bf4806e7e2024ff00dc45fd961.jpg |
| Bastion | 1602994569 | 19 | 0 | false | Aspect abyssal | 0 | 2422292810 | 59, 1043342778 | /common/destiny2_content/icons/5428b311ff07d2bacb073e551ed2bea1.jpg |
| Brise-glace | 2848175214 | 19 | 2 | false | Particularité | 0 | 1469714392 | 59, 3708671066, 610365472 | /common/destiny2_content/icons/1de2030a580f54e34b3282df37ac9cd5.png |
| Brise-glace | 4045752130 | 19 | 6 | false | — | 0 | 2422292810 | 59 | /common/destiny2_content/icons/8c97cfcc1a6837141d63f267de15180e.jpg |
| Chorale solitaire | 3083189562 | 30 | 6 | false | Fusil automatique | 6 | 766235248 | 5, 3726054802 | /common/destiny2_content/icons/80cc90861aa83c63de2273457a6c9345.jpg |
| Cœur de glace | 2927653646 | 20 | 6 | false | Fusil à rayon | 25 | 2422292810 | 2489664120, 3109687656 | /common/destiny2_content/icons/2a2a95b819312fc6fef728911cfd6fa2.jpg |
| Cristal de Prométhée | 2146650065 | 20 | 6 | true | Fusil à rayon | 25 | 2465295065 | 3, 1, 2489664120, 3109687656 | /common/destiny2_content/icons/76817c6b9ad482a19a180819fbe85def.jpg |
| Croc du Bourreau | 1254670671 | 30 | 6 | false | Fusil à pompe | 7 | 766235248 | 11, 3726054802 | /common/destiny2_content/icons/45ba5d9ee8e425e1f9d50cb561fe4982.jpg |
| Divination de Ticuu | 1538967359 | 20 | 6 | true | Arc de combat | 31 | 1498876634 | 2, 1, 3109687656, 3317538576 | /common/destiny2_content/icons/39ef1673136f2f463879a83a44f11b0d.jpg |
| Dualité | 2639743396 | 20 | 6 | true | Fusil automatique | 6 | 1498876634 | 2, 1, 5, 3109687656 | /common/destiny2_content/icons/084c8f65d56ce5d74718d49b17874315.jpg |
| Elu du Voyageur | 53159280 | 3 | 2 | true | Pistolet | 17 | 1498876634 | 2, 1, 14 | /common/destiny2_content/icons/19d95ca9010366f7befe92c38fa67cde.jpg |
| Garde-souhaits | 682995262 | 30 | 6 | false | Arc de combat | 31 | 766235248 | 3726054802, 3317538576 | /common/destiny2_content/icons/6b47d872840188bc913d6307fa537c3c.jpg |
| Impulsion Lorentz | 550118262 | 19 | 6 | false | — | 0 | 2422292810 | 59 | /common/destiny2_content/icons/f655ec9343e18cb811f69930d9cb426a.jpg |
| Infection parfaite | 3342878104 | 30 | 6 | false | Fusil à impulsion | 13 | 766235248 | 7, 3726054802 | /common/destiny2_content/icons/a1b6a5f3e52878610397249986300b23.jpg |
| La Faucheuse | 3160771169 | 26 | 2 | false | Ordre de Fonderie | 0 | 635141261 | 1784235469 | /common/destiny2_content/icons/c5da329a7734c27ca0c844ca7d34aa6e.png |
| Lame d'action | 1900919151 | 19 | 6 | false | Intrinsèque | 0 | 1469714392 | 59, 2237038328, 610365472 | /common/destiny2_content/icons/2ccfd5992fb00379612553280e5afef4.png |
| Lame d'action | 4284608583 | 30 | 6 | false | Glaive | 33 | 766235248 | 3726054802, 3871742104 | /common/destiny2_content/icons/add494c1e1fbdb062b7f6dc4c179c35b.jpg |
| Lame d'intention | 1665561856 | 30 | 6 | false | Glaive | 33 | 766235248 | 3726054802, 3871742104 | /common/destiny2_content/icons/beec2a35b2cffd3fac488e0fb8cf25a5.jpg |
| Lame d'intention | 3024740338 | 19 | 6 | false | Intrinsèque | 0 | 1469714392 | 59, 2237038328, 610365472 | /common/destiny2_content/icons/3bcf21a3418ad21d1953199fd4a4ef44.png |
| Lame de compétition | 3127165437 | 30 | 6 | false | Glaive | 33 | 766235248 | 3726054802, 3871742104 | /common/destiny2_content/icons/6301bf4e6d9d9728aaf5f9bea06c6a1a.jpg |
| Lame de compétition | 3551884421 | 19 | 6 | false | Intrinsèque | 0 | 1469714392 | 59, 2237038328, 610365472 | /common/destiny2_content/icons/8ab8aad4e05cec1b236d07f153203a36.png |
| Lance de Polaris | 877851123 | 20 | 5 | true | — | 0 | 2465295065 | 3109687656 | /common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg |
| Lance de Polaris | 926248327 | 20 | 5 | true | — | 0 | 2465295065 | 3109687656 | /common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg |
| Lance de Polaris | 995033813 | 20 | 5 | true | — | 0 | 2465295065 | 3109687656 | /common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg |
| Lance de Polaris | 1052436550 | 20 | 5 | true | — | 0 | 2465295065 | 3109687656 | /common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg |
| Lance de Polaris | 2572435700 | 20 | 5 | true | — | 0 | 2465295065 | 3109687656 | /common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg |
| Lance de Polaris | 3143479462 | 20 | 5 | true | — | 0 | 2465295065 | 3109687656 | /common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg |
| Lance de Polaris | 3375196983 | 20 | 5 | true | — | 0 | 2465295065 | 3109687656 | /common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg |
| Le Lapin de Jade | 460724140 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 546372301 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 1386238359 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 1718158916 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 2192598950 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 2257699986 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 2602176822 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 2896466320 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 2978016230 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 3229272315 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Le Lapin de Jade | 3536086285 | 20 | 5 | true | Colis | 0 | 1498876634 | 268598612, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Malveillance | 3656769954 | 12 | 6 | false | Étape de Quête | 0 | 1345459588 | 16 | /common/destiny2_content/icons/c74768b0b9f3f286d8eff9c5d4024f5a.jpg |
| Messager mort | 374313494 | 30 | 6 | false | Lance-grenades | 23 | 766235248 | 3726054802, 153950757 | /common/destiny2_content/icons/0824b34bb37e0bb7c32b91adf6dcb79e.jpg |
| Murmure du Ver | 2221042414 | 20 | 6 | false | Fusil de précision | 12 | 3621873013 | 10, 3109687656 | /common/destiny2_content/icons/e47c31826843f6fd0aa863eac6fd093e.jpg |
| Murmure du Ver | 2221042415 | 20 | 6 | false | Fusil de précision | 12 | 3621873013 | 10, 3109687656 | /common/destiny2_content/icons/e47c31826843f6fd0aa863eac6fd093e.jpg |
| Murmure du Ver | 3739748319 | 30 | 6 | false | Fusil de précision | 12 | 766235248 | 10, 3726054802 | /common/destiny2_content/icons/e47c31826843f6fd0aa863eac6fd093e.jpg |
| Ombres et lumière | 227756207 | 20 | 6 | false | Fusil à rayon | 25 | 2422292810 | 2489664120, 3109687656 | /common/destiny2_content/icons/94e6e474b4488d5a198b5dcbad534c3e.jpg |
| Once de méchanceté | 2724693746 | 19 | 2 | false | Intrinsèque | 0 | 1469714392 | 59, 2237038328, 610365472 | /common/destiny2_content/icons/c05e57ebabbfd46b0788d9cbb45a5510.png |
| Osteo Striga | 3024419320 | 20 | 6 | false | — | 0 | 2422292810 | 3109687656 | /common/destiny2_content/icons/26879dbadd0ade4f6d92cd0b37ce7261.jpg |
| Osteo Striga | 3364580479 | 30 | 6 | false | Pistolet-mitrailleur | 24 | 766235248 | 3726054802, 3954685534 | /common/destiny2_content/icons/2752ee2761149f004df20e78749c1bab.jpg |
| Outil multifonction MIDA | 377257911 | 19 | 2 | false | Intrinsèque | 0 | 1469714392 | 2237038328, 610365472, 59 | /common/destiny2_content/icons/e166ed5bda9363836024fdf72f1ebac0.png |
| Pique du graviton | 2200588698 | 30 | 6 | false | Revolver | 9 | 766235248 | 6, 3726054802 | /common/destiny2_content/icons/ac56ad66eb1ebb8a371f9d3d3c768c5a.jpg |
| Pochette d'allumettes de Tommy | 3242052935 | 20 | 6 | true | Fusil automatique | 6 | 1498876634 | 2, 1, 5, 3109687656 | /common/destiny2_content/icons/251630147cd942ade9414781e96237ec.jpg |
| Récit d'un homme mort | 1377069894 | 30 | 6 | false | Fusil d'éclaireur | 14 | 766235248 | 8, 3726054802 | /common/destiny2_content/icons/cfc2c246cfd404d749fffbfe3ae3dfec.jpg |
| Règne de Suros | 653948914 | 20 | 6 | false | Fusil automatique | 6 | 3621873013 | 5, 3109687656 | /common/destiny2_content/icons/42120a6f2e1f43dd7f67bedffc42d0d2.jpg |
| Règne de Suros | 973499765 | 20 | 6 | false | Fusil automatique | 6 | 3621873013 | 5, 3109687656 | /common/destiny2_content/icons/42120a6f2e1f43dd7f67bedffc42d0d2.jpg |
| Révision zéro | 2658740569 | 30 | 6 | false | Fusil à impulsion | 13 | 766235248 | 7, 3726054802 | /common/destiny2_content/icons/040a104defcc7011b570886e3ec3c73f.jpg |
| Ruines du Diable | 2613477126 | 25 | 5 | false | Colis | 0 | 1469714392 | 268598612 | /common/destiny2_content/icons/7d40d7dfd49abaf954f9cf473fce0f77.png |
| Serment d'Ériana | 2481356995 | 20 | 6 | true | Revolver | 9 | 1498876634 | 2, 1, 6, 3109687656 | /common/destiny2_content/icons/588133859fa98c801d8a9d66ea6aae2f.jpg |
| Serment d'Ériana | 2614062688 | 20 | 6 | true | Revolver | 9 | 1498876634 | 2, 1, 6, 3109687656 | /common/destiny2_content/icons/588133859fa98c801d8a9d66ea6aae2f.jpg |
| Symétrie | 2617963291 | 20 | 6 | true | Fusil d'éclaireur | 14 | 1498876634 | 2, 1, 8, 3109687656 | /common/destiny2_content/icons/55f9629f4674c351e3a2efd9ab9ca6e9.jpg |
| Trésor asséché | 2522817335 | 20 | 6 | true | Fusil automatique | 6 | 1498876634 | 2, 1, 5, 3109687656 | /common/destiny2_content/icons/3e4fc5bcc1dea42508124e11572367d2.jpg |
| Tueur de Souhaits | 757817572 | 20 | 5 | true | Colis | 0 | 1498876634 | 268598612, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Tueur de Souhaits | 2064394295 | 20 | 6 | false | Colis | 0 | 2422292810 | 268598612, 3109687656 | /common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg |
| Tueur de Souhaits | 2411744491 | 12 | 6 | false | Étape de Quête | 0 | 1345459588 | 16 | /common/destiny2_content/icons/3dec5d5acb59914c656717b8335bde65.jpg |
| Tumulus dyadique | 1388605795 | 30 | 6 | false | Pistolet-mitrailleur | 24 | 766235248 | 3726054802, 3954685534 | /common/destiny2_content/icons/938bc6eb5c5c772e2f3d066380179d36.jpg |
| Vexcalibur | 4223953031 | 30 | 6 | false | Glaive | 33 | 766235248 | 3726054802, 3871742104 | /common/destiny2_content/icons/735baec8c23ff1416ae6a8c72c729432.jpg |

## Exotiques du Manifest absentes de la liste (1)

_utile pour repérer un nom écrit différemment dans la liste_

| Nom dans le jeu | Hash | Appli |
|---|---|---|
| Ergo Sum | 1681583613 | — |

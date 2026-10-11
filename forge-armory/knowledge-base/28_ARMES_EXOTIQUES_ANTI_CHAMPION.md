# Armes exotiques et leur anti-champion (liste de référence)

Ajouté le 01/10/2026. **Source : liste fournie par l'utilisateur** (relevée EN JEU,
noms FRANÇAIS, jugée fiable par lui), recopiée telle quelle ci-dessous, sans aucune
modification. **Référence de l'anti-champion des armes exotiques, utilisée par l'appli
depuis le 01/10/2026** : elle passe avant la déduction d'origine (texte du perk
intrinsèque), qui échouait sur certaines armes et ne sert plus que de repli pour une
exotique absente de la liste (voir `src/lib/manifest/antiChampionExotiques.ts` et
`obtenirAntiChampion` dans `src/lib/manifest/doctrine.ts`). Les données de l'appli sont dans
`src/data/exotiquesAntiChampion.ts` : **à tenir à jour avec cette liste**.

Contenu : 143 armes (50 armes cinétiques, 57 armes énergétiques, 36 armes lourdes) ; 44 surchargé, 51 implacable, 45 bloqueur ; 3 sans anti-champion indiqué
(Ergo Sum solaire, Ergo Sum abyssale, Ergo Sum cryo-électrique).

**Ergo Sum (3 variantes) est un cas particulier** : son anti-champion peut varier. Il reste volontairement SANS anti-champion dans cette liste, et donc sans icône dans l'appli.

**Objets factices (06/10/2026)** : le Manifest contient, pour 39 armes de cette liste, 66 « autres définitions » de même nom, dont **35 objets factices** (`itemType` 20, « Dummy », catégorie d'objet 3109687656) qui imitent
une arme (Le Lapin de Jade : 11 copies ; Lance de Polaris : 7 ; Dualité : 1 ; des « Colis », etc.). L'appli les masque en Recherche et applique cette liste à une copie factice possédée en emplacement d'arme. Rapport conservé dans
`knowledge-base/sources-externes/controle-anti-champion-exotiques_2026-10-06.md`.

**Contrôle du 05/10/2026** sur le Manifest de l'utilisateur (rapport conservé dans `knowledge-base/sources-externes/controle-anti-champion-exotiques_2026-10-05.md`) :
**aucune arme oubliée**. 140 des 143 noms de cette liste sont retrouvés dans le Manifest ; les 3 restants sont les variantes d'Ergo Sum, et la seule exotique du Manifest absente
de la liste est « Ergo Sum ». Deux désaccords avec la déduction de repli de l'appli, sans conséquence car cette liste fait foi : Centrifuse (liste : Surchargé) et Poigne du Salut
(liste : Implacable).

**Historique** : le 02/10/2026, l'utilisateur a complété quatre armes jusque-là sans anti-champion (Tueur de Souhaits, Trop long à expliquer, Récit d'un homme mort, Obligation collective : Bloqueur) ; Le Lapin de Jade (Implacable), Symétrie (Surchargé) et Dualité (Implacable) y figuraient déjà avec ces valeurs.

⚠️ Les noms sont ceux du jeu en français, tels que saisis : pour un rapprochement
avec le Manifest, comparer sur le nom FR (accents et casse à normaliser).

---

```text
Liste armes exotiques et perks anti-champions :

--- Armes cinétiques
Belle Affaire - Surchargé
Sturm - Implacable
Aile de Vigilance - Implacable
Empereur des Rats - Bloqueur
Outil multifonction MIDA - Bloqueur
Garance - Implacable
Le Lapin de Jade - Implacable
L'opportun - Bloqueur
Règne de Suros - Bloqueur
Cerberus+1 - Surchargé
Tueur de Souhaits - Bloqueur
Malveillance - Implacable
As de Pique - Bloqueur
La Gouvernante - Bloqueur
Fardeau d'Izanagi - Bloqueur
Dernières paroles - Implacable
Arbalète - Bloqueur
Chardon - Bloqueur
Infection parfaite - Surchargé
Lumina - Surchargé
Poupée vaudou - Implacable
Monte-Carlo - Implacable
Bastion - Implacable
Trésor asséché - Surchargé
Elu du Voyageur - Surchargé
Rapace noir - Bloqueur
Trop long à expliquer - Bloqueur
Récit d'un homme mort - Bloqueur
Cryosthésie 77k - Implacable
Sceptre d'Ager - Surchargé
Prédécesseur - Implacable
Osteo Striga - Surchargé
Once de méchanceté - Bloqueur
Tempête de vif-argent - Implacable
Révision zéro - Bloqueur
Dernier avertissement - Surchargé
Finalité conditionnelle - Implacable
Courbe verglacée - Implacable
Outil de folie - Surchargé
Le Navigateur - Surchargé
Gouffre nécrotique - Surchargé
Garde-souhaits - Implacable
Khvostov 7G-0X - Bloqueur
Euphonie - Bloqueur
Aléthonyme - Implacable
Neo Finis Terræ - Bloqueur
Tumulus dyadique - Surchargé
Nouveau Malpais - Implacable
Lame praxique - Bloqueur
Ombre de Cull - Implacable

--- Armes énergétiques
Cœur de glace - Bloqueur
Impitoyable - Implacable
Lion de guerre - Implacable
Rayon de soleil - Implacable
Lance du graviton - Bloqueur
Serment des Embraseurs - Bloqueur
Borealis - Bloqueur
Casse-cou - Surchargé
Ombres et lumière - Surchargé
Cristal de Prométhée - Surchargé
Télesto - Surchargé
Lance de Polaris - Bloqueur
Goule trinitaire - Surchargé
Diviseur d'ondes - Surchargé
Seigneur des Loups - Implacable
Le Monarque - Surchargé
Jötunn - Implacable
Tarrabah - Bloqueur
Serment d'Ériana - Bloqueur
Divinité - Surchargé
Symétrie - Surchargé
Ruines du Diable - Implacable
Pochette d'allumettes de Tommy - Surchargé
Le Quatrième Cavalier - Implacable
Effigie désastreuse - Implacable
Dualité - Implacable
Frappe nuageuse - Bloqueur
Divination de Ticuu - Implacable
Exégèse du Vex - Bloqueur
Impulsion Lorentz - Bloqueur
Lame de compétition - Surchargé
Lame d'action - Bloqueur
Lame d'intention - Implacable
Messager mort - Implacable
Obligation collective - Bloqueur
Tombe délicate - Surchargé
L'Intrus - Bloqueur
La Manticore - Surchargé
Hiérarchie des besoins - Implacable
Vexcalibur - Surchargé
Dallage - Implacable
Centrifuse - Surchargé
Ex Diris - Implacable
Chorale solitaire - Surchargé
Lignée enterrée - Bloqueur
Mort rouge reformée - Implacable
Chasse à l'affût - Bloqueur
Ergo Sum solaire
Ergo Sum abyssale
Ergo Sum cryo-électrique
Brise-glace - Bloqueur
Croc du Bourreau - Surchargé
Guide stellaire - Surchargé
Troisième itération - Bloqueur
Pique du graviton - Surchargé
Hoirie - Implacable
Girouette - Bloqueur

--- Armes lourdes
Le Prospecteur - Implacable
Bobine de Wardcliff - Implacable
Canon tracteur - Surchargé
Légende d'Acrius - Surchargé
D.A.R.C.I. - Surchargé
La Colonie - Surchargé
Ligne d'univers zéro - Implacable
Image de l'Esprit dormant - Bloqueur
Murmure du Ver - Bloqueur
Mille voix - Implacable
Renard à deux queues - Surchargé
Griffe noire - Surchargé
Le Parjure - Implacable
Maitre du tonnerre - Surchargé
Anarchie - Surchargé
Vérité - Implacable
Souffle du Léviathan - Implacable
Xénophage - Implacable
La Faucheuse - Surchargé
Héritage évident - Surchargé
Poigne du Salut - Implacable
Regard du lendemain - Implacable
Lamentation - Bloqueur
Gjallarhorn - Bloqueur
Parasite - Bloqueur
Grande ouverture - Implacable
Cardiombre - Surchargé
Chaos déterministe - Bloqueur
Morsure hivernale - Implacable
Souffle du dragon - Implacable
Microcosme - Bloqueur
Foreuse finale - Implacable
Ovation tourbillonnante - Bloqueur
Aconit - Implacable
Service de Luzaku - Surchargé
Fafnir - Implacable
```

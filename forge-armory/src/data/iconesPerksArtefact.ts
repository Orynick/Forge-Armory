// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - ICÔNES DES PERKS D'ARTEFACT, figées dans les données. ⚠️ MIS À JOUR (06/10/2026, v0.3.4) : **147 perks sur 147** ont leur icône (125 le 05/10, 128 le 06/10 matin).
//
// Origine, en DEUX parties, toutes deux issues du Manifest de l'utilisateur (chemins d'icônes DE BUNGIE ; jamais des images du classeur communautaire, inutilisables ; à combiner avec `urlIcone`, lib/manifest/search.ts) :
//   1. TROUVÉS DIRECTEMENT (128) : le contrôle `lib/diagnostic/controleIconesPerksArtefact.ts` (rapports du 05/10 à 21 h 36 et du 06/10 à 00 h 22, conservés dans `knowledge-base/sources-externes/`) : même nom
//      (accents, casse, ligature « œ » et espaces ignorés) ET objet de type « Attribut d'artéfact » (catégorie de plug `artifact_perks`) ET une seule icône distincte ;
//   2. CHOISIS EN JEU PAR L'UTILISATEUR (19) le 06/10/2026 à 22 h 40, avec le panneau « Départager » (components/DepartagerIconesAmbigues.tsx ; fichier conservé dans
//      `knowledge-base/sources-externes/choix-icones-ambigues_2026-10-06.json`) : 13 perks AMBIGUS (le même nom existe avec deux icônes dans le Manifest, dont la saison n'est pas renseignée) et 6 perks dont le NOM
//      de nos données diffère d'une faute de celui du Manifest. L'utilisateur a désigné l'icône qui correspond au jeu pour CHACUN (19 sur 19, aucun « aucune ne correspond »). Aucune icône n'est devinée par l'appli.
//
// ⚠️ DISCORDANCE NON EXPLIQUÉE à revérifier : pour les 6 perks à nom différent, les icônes choisies le soir du 06/10 sont **exactement les mêmes** (chemin pour chemin) que celles enregistrées en 0.3.1, que l'utilisateur
// avait jugées fausses en jeu le matin du 06/10. Ses choix du soir (comparaison en jeu, icônes à 56 px) font foi ; la liste de tests de la 0.3.4 lui demande de recomparer ces 6 perks dans l'appli.
//
// « Orbes curatifs » et « Orbes de brisure » partagent la même icône : confirmé légitime par l'utilisateur (06/10/2026). « Broyeur de bouclier » a une icône DIFFÉRENTE selon l'artefact (Outillage de Curiosité /
// Journal du Chasseur) : c'est le choix de l'utilisateur.
// Le fichier `artefacts.ts`, généré depuis `knowledge-base/03_ARTIFACTS.md`, n'est pas modifié : le champ `icone` d'un perk, s'il existe un jour, reste prioritaire. Les noms de perks de nos données ne sont JAMAIS
// modifiés : la clé d'un perk de build enregistré en dépend. Clé : `identifiant de l'artefact|palier|nom du perk` (le nom EXACT des données de l'appli).
// EN: ⚠️ ADDED (2026-10-05), UPDATED (2026-10-06, v0.3.4) - ARTIFACT PERK ICONS baked into the data: ALL 147 perks. 128 found directly in the user's Manifest + 19 picked BY THE USER in game (13 ambiguous, 6 with a
// slightly different name). UNEXPLAINED: the 6 close-name icons picked in the evening are identical to those baked in 0.3.1 which the user judged wrong that morning. Keys keep OUR perk names.

import type { PerkArtefact } from "./artefacts";

export const ICONES_PERKS_ARTEFACT: Readonly<Record<string, string>> = {
  // =========== 1. TROUVÉS DIRECTEMENT (128) ===========
  // ---- encrypted-data-disk (20) ----
  "encrypted-data-disk|1|Profiter de l'avantage": "/common/destiny2_content/icons/e79751de6d62c4820278fd3f0b833b0b.png",
  "encrypted-data-disk|1|Synthèse cinétique": "/common/destiny2_content/icons/cf96e4e6ccba04d4948a7bb0ca90761b.png",
  "encrypted-data-disk|1|Rechargement à distance": "/common/destiny2_content/icons/2dacdd67e219bb9ec62226c82bfcfaaf.png",
  "encrypted-data-disk|1|Riposte": "/common/destiny2_content/icons/379e370534eed91f6ac666196ce56d3d.png",
  "encrypted-data-disk|1|Douleur contre puissance": "/common/destiny2_content/icons/b59af0e3a3880873b9055c3e0697b216.png",
  "encrypted-data-disk|1|Proxémie féroce": "/common/destiny2_content/icons/a8990e7598af609e1ffca8ff7e3a2f54.png",
  "encrypted-data-disk|1|Remède rapide": "/common/destiny2_content/icons/d4c2808826b8eceea0a1acca31079f87.png",
  "encrypted-data-disk|2|Diélectrique": "/common/destiny2_content/icons/2ba8a6fb47d9a36d8e5651bad5a86752.png",
  "encrypted-data-disk|2|Spécialiste des armures": "/common/destiny2_content/icons/f48754b849cbc1b813ea2d078e36ed0c.png",
  "encrypted-data-disk|2|Energie de contre": "/common/destiny2_content/icons/f9cff3113b9be57572ed6697be195a1a.png",
  "encrypted-data-disk|2|Combo lame d'argent": "/common/destiny2_content/icons/b1f285e95953d68a6e72312234bfd363.png",
  "encrypted-data-disk|2|Lame de singularité": "/common/destiny2_content/icons/f510c3b6aaee8ff2da5da4368bd4c63a.png",
  "encrypted-data-disk|2|Secousses aveuglantes": "/common/destiny2_content/icons/2944f8b47be4ff1f4a0ceaa8439d0367.png",
  "encrypted-data-disk|2|Equité de précision": "/common/destiny2_content/icons/09c1f017f974b0a8bee28bb519993957.png",
  "encrypted-data-disk|3|Orbes élémentaires : cryo-électriques": "/common/destiny2_content/icons/57df71b415811ddee77e55f4b95519aa.png",
  "encrypted-data-disk|3|Rupture cinétique": "/common/destiny2_content/icons/01fddf1eba3b2cca594be0fec0af049e.png",
  "encrypted-data-disk|3|Méditation du tireur": "/common/destiny2_content/icons/e7a8b3b1eb71f1d70e31d5642c92c5fb.png",
  "encrypted-data-disk|3|Infestation abyssale": "/common/destiny2_content/icons/5eacb6ab8ca7b9ed147dc842accdb41a.png",
  "encrypted-data-disk|3|Tazer tag": "/common/destiny2_content/icons/c30820ca53f6ec778ddf10c6a0d6956b.png",
  "encrypted-data-disk|3|Electroadhésion": "/common/destiny2_content/icons/132c4594b9738a242df26521caa6421f.png",
  // ---- implement-of-curiosity (16) ----
  "implement-of-curiosity|1|Fièvre et Frisson": "/common/destiny2_content/icons/8b19ceba1b2b7a5453de5198a2ca8a97.png",
  "implement-of-curiosity|1|Bienveillance élémentaire": "/common/destiny2_content/icons/17c1fe9ffd2c624a32b2a82c28eaa124.png",
  "implement-of-curiosity|1|Renouveau Glacé": "/common/destiny2_content/icons/f0a3adfaf8d6c88df24a35f38b3968d2.png",
  "implement-of-curiosity|1|Fils rafraîchis": "/common/destiny2_content/icons/d17dfad7a1475ae53527c9a208f19928.png",
  "implement-of-curiosity|1|Assaillant semi-automatique": "/common/destiny2_content/icons/b65af53611708b2ed9d6a6d9b079fb5b.png",
  "implement-of-curiosity|2|Ténèbres cautérisées": "/common/destiny2_content/icons/e1eb1a3e3bf6057643a9b52dd36d7cf0.png",
  "implement-of-curiosity|2|Confusion élémentaire": "/common/destiny2_content/icons/c9c223a63575ed646de09b28bf8e9297.png",
  "implement-of-curiosity|2|Soutien mutuel": "/common/destiny2_content/icons/50d5aacb8e5ea334f20e6effb16c669d.png",
  "implement-of-curiosity|2|Coalescence élémentaire": "/common/destiny2_content/icons/b84ec3e24f1cb8931885b69f18d31ce8.png",
  "implement-of-curiosity|2|L'arôme des balles neuves": "/common/destiny2_content/icons/6c3ed1334ca597eb7c4a3efeca50d172.png",
  "implement-of-curiosity|2|Accélération énergétique": "/common/destiny2_content/icons/7b7148c2dbb084f5ce94262022ff9c21.png",
  "implement-of-curiosity|3|Mitraille rayonnante": "/common/destiny2_content/icons/8abd6d007f5a6a53e85202fddbb0fbb7.png",
  "implement-of-curiosity|3|Toile enchevêtrée": "/common/destiny2_content/icons/82befe9a89b07a901cd352d7a4663239.png",
  "implement-of-curiosity|3|Regard glacial": "/common/destiny2_content/icons/a8e0ad8585c13eead66d224a18608556.png",
  "implement-of-curiosity|3|Vigueur du Seigneur de Fer": "/common/destiny2_content/icons/08493ea0baf9f657c82c5a7e32e0ff66.png",
  "implement-of-curiosity|3|Carquois argenté": "/common/destiny2_content/icons/be505c181030939d775fdd38fef428e5.png",
  // ---- tablet-of-ruin (18) ----
  "tablet-of-ruin|1|Tenir bon": "/common/destiny2_content/icons/27a2a50104033d0b152175a117b74645.png",
  "tablet-of-ruin|1|Diélectrique": "/common/destiny2_content/icons/2ba8a6fb47d9a36d8e5651bad5a86752.png",
  "tablet-of-ruin|1|Tir d'élite volatil": "/common/destiny2_content/icons/cc6ea0a9b8288f4483e6eeed678369fe.png",
  "tablet-of-ruin|1|Eclat photonique": "/common/destiny2_content/icons/888d22f5f20d5e4c5b7e9d3bdb15384b.png",
  "tablet-of-ruin|1|Destruction perpétuelle": "/common/destiny2_content/icons/7f676b258c7d0f54be3c2fc9a20678e8.png",
  "tablet-of-ruin|2|Tissage ignoble": "/common/destiny2_content/icons/30d7b4a86b37c00b7888c039ce928dae.png",
  "tablet-of-ruin|2|Récolte ignoble": "/common/destiny2_content/icons/4a2d1e613721d89b19e1cd272fa0e4df.png",
  "tablet-of-ruin|2|Electrification": "/common/destiny2_content/icons/39fa68afce49ce18debf66cca98d568c.png",
  "tablet-of-ruin|2|Pas de cloche": "/common/destiny2_content/icons/a25bf672c20acc4f3702806d79ad5be8.png",
  "tablet-of-ruin|2|Réfraction cruelle": "/common/destiny2_content/icons/83d3cd1ea4cfc888ad17c98857092d65.png",
  "tablet-of-ruin|2|Plomb en or": "/common/destiny2_content/icons/60b79563cd0c5e0585602692f2675720.png",
  "tablet-of-ruin|3|Reconstruction de particules": "/common/destiny2_content/icons/e93be604e075d37fb6553827bca8b145.png",
  "tablet-of-ruin|3|Superchargeur élémentaire": "/common/destiny2_content/icons/72bed48bdb3786392576557133af73c8.png",
  "tablet-of-ruin|3|Régénération d'artillerie lourde": "/common/destiny2_content/icons/d1e477b155ded312541855d8dc482084.png",
  "tablet-of-ruin|3|Explosion défibrillatrice": "/common/destiny2_content/icons/432d57ccbac460b2effe218c7b43de75.png",
  "tablet-of-ruin|3|Flux abyssal": "/common/destiny2_content/icons/1470eea452581c26e38a0fe8b132cdb0.png",
  "tablet-of-ruin|3|Plus de limite": "/common/destiny2_content/icons/bac87bfc4b21caf68c5e1994e95d6ded.png",
  "tablet-of-ruin|3|En lambeaux": "/common/destiny2_content/icons/db9994e38f3019475db3dd46162400fb.png",
  // ---- slayer-baron-apothecary-satchel (20) ----
  "slayer-baron-apothecary-satchel|1|Vent glacé": "/common/destiny2_content/icons/608b9c7dab2343690ad2a3090ef048d3.png",
  "slayer-baron-apothecary-satchel|1|Convertisseur cristallin": "/common/destiny2_content/icons/b62c35fd04b0295070bb26b99e2c31f1.png",
  "slayer-baron-apothecary-satchel|1|Carnage total": "/common/destiny2_content/icons/3645b62e3dbf97f12a6dac5b7ed52549.png",
  "slayer-baron-apothecary-satchel|1|Douleur contre puissance": "/common/destiny2_content/icons/b59af0e3a3880873b9055c3e0697b216.png",
  "slayer-baron-apothecary-satchel|1|Jeu de piste": "/common/destiny2_content/icons/9b81cc337afb3946688155fdc9a626b2.png",
  "slayer-baron-apothecary-satchel|1|Au coeur de l'action": "/common/destiny2_content/icons/c36d351fbde141013fcf806a23ac04a6.png",
  "slayer-baron-apothecary-satchel|1|Brise mortelle": "/common/destiny2_content/icons/af8f4f997357ffa1efd9dbc90935bf0b.png",
  "slayer-baron-apothecary-satchel|2|Renouveau glacé": "/common/destiny2_content/icons/f0a3adfaf8d6c88df24a35f38b3968d2.png",
  "slayer-baron-apothecary-satchel|2|Vague affaiblissante": "/common/destiny2_content/icons/2095c328d02e1f522564c25a977d6fbf.png",
  "slayer-baron-apothecary-satchel|2|Affaiblissement clair": "/common/destiny2_content/icons/0be012b38f318cde7d3f704e1c5f27c9.png",
  "slayer-baron-apothecary-satchel|2|Brûlure rétinienne": "/common/destiny2_content/icons/4c4871eebe2c22029dccd0939c718c35.png",
  "slayer-baron-apothecary-satchel|2|Orbes curatifs": "/common/destiny2_content/icons/5ed571e47400d0a33896eb2db3428dc6.png",
  "slayer-baron-apothecary-satchel|2|Renouveau abyssal": "/common/destiny2_content/icons/f50ee87fe85424ea395e9342031b7839.png",
  "slayer-baron-apothecary-satchel|3|Gel cérébral": "/common/destiny2_content/icons/a4530082e61b74247bffbb0a0b36f81d.png",
  "slayer-baron-apothecary-satchel|3|Supernova": "/common/destiny2_content/icons/815e319a7dd9b8675619aa2f515f03b8.png",
  "slayer-baron-apothecary-satchel|3|Cristal cosmique conducteur": "/common/destiny2_content/icons/e8476be17d4b1c2b6cc9569076b39436.png",
  "slayer-baron-apothecary-satchel|3|Se mange froid": "/common/destiny2_content/icons/52398f36d77016797d4a5aab9f51491e.png",
  "slayer-baron-apothecary-satchel|3|Impacts cinétiques": "/common/destiny2_content/icons/653848407ebd720e0b01bcb5b3a02375.png",
  "slayer-baron-apothecary-satchel|3|Combinaison cryo-électrique": "/common/destiny2_content/icons/841ae372a0f1df1351b111938b01aa7a.png",
  "slayer-baron-apothecary-satchel|3|Rite des dieux anciens": "/common/destiny2_content/icons/6a2f2cd24049470e18ff5aaf2bc44bd0.png",
  // ---- hunters-journal (16) ----
  "hunters-journal|1|Substrat de diffusion énergétique": "/common/destiny2_content/icons/2be15755a79c3795e2cca85341c8db62.png",
  "hunters-journal|1|Frisson insidieux": "/common/destiny2_content/icons/a0719ca991cc7c5b3029c36f5b7db153.png",
  "hunters-journal|1|Profiter de l'avantage": "/common/destiny2_content/icons/e79751de6d62c4820278fd3f0b833b0b.png",
  "hunters-journal|1|Munitions incendiaires pour fusil": "/common/destiny2_content/icons/7228bff6dcfbd5dbcc9e8da4675ef5c8.png",
  "hunters-journal|2|Energie de contre": "/common/destiny2_content/icons/f9cff3113b9be57572ed6697be195a1a.png",
  "hunters-journal|2|Endurance de Lame": "/common/destiny2_content/icons/943e21f0e02535c4ea107639fa45882e.png",
  "hunters-journal|2|Hégémonie abyssale": "/common/destiny2_content/icons/17d84346ffe49f92a4db97b2fa59ba21.png",
  "hunters-journal|2|Orbes radieux": "/common/destiny2_content/icons/504b0ee422c64b4baa8ba5c1bbbb8ada.png",
  "hunters-journal|2|Mauvaise amplitude": "/common/destiny2_content/icons/49206187423fa8c71de6c5058d237f21.png",
  "hunters-journal|2|Fulmination solaire": "/common/destiny2_content/icons/c652963de3a4e9860280e0a5a5e84817.png",
  "hunters-journal|2|Recharge automatique du ciblage": "/common/destiny2_content/icons/af01d655f6082ad2c9eb3ee81b77effa.png",
  "hunters-journal|3|Transfert prismatique": "/common/destiny2_content/icons/e2d5f4807e70f1f3ff310415cc44b67c.png",
  "hunters-journal|3|Lame d'argent": "/common/destiny2_content/icons/8c8ec47b96429cb02c2c7640defc79b8.png",
  "hunters-journal|3|Abîme déployé": "/common/destiny2_content/icons/f2a75f5858c1e49244972e97362d5c80.png",
  "hunters-journal|3|Transfert": "/common/destiny2_content/icons/ae11028a5a83ed41cb86d88a97161de2.png",
  "hunters-journal|3|Méditation du tireur": "/common/destiny2_content/icons/e7a8b3b1eb71f1d70e31d5642c92c5fb.png",
  // ---- queensfoil-censer (18) ----
  "queensfoil-censer|1|Fièvre et Frisson": "/common/destiny2_content/icons/8b19ceba1b2b7a5453de5198a2ca8a97.png",
  "queensfoil-censer|1|Torche": "/common/destiny2_content/icons/e438774c2bfe24507bb789adc8855ee1.png",
  "queensfoil-censer|1|Coeur de flamme": "/common/destiny2_content/icons/384727d91fc52e44109ef4544e80e191.png",
  "queensfoil-censer|1|Spécialiste des armures": "/common/destiny2_content/icons/f48754b849cbc1b813ea2d078e36ed0c.png",
  "queensfoil-censer|1|Voeu d'existence": "/common/destiny2_content/icons/f1fac794534049a58e51b0511bfc2ca5.png",
  "queensfoil-censer|1|Allume-feu": "/common/destiny2_content/icons/abaf5494df7860b116e12f02ee0accc9.png",
  "queensfoil-censer|2|Pilier de glace": "/common/destiny2_content/icons/ab6a016b75337cf8f8914ed5a23b62ea.png",
  "queensfoil-censer|2|Explosion revitalisante": "/common/destiny2_content/icons/71e60180bd32adc0a869a9d7384920d1.png",
  "queensfoil-censer|2|Coiffe anti-Champions": "/common/destiny2_content/icons/472be0e9c6152c0a702bd3d148c6b0a7.png",
  "queensfoil-censer|2|Morsure du Dragon": "/common/destiny2_content/icons/77302763049dc780df6693dbb7c01a6b.png",
  "queensfoil-censer|2|Frisson insidieux": "/common/destiny2_content/icons/a0719ca991cc7c5b3029c36f5b7db153.png",
  "queensfoil-censer|2|Destruction perpétuelle": "/common/destiny2_content/icons/7f676b258c7d0f54be3c2fc9a20678e8.png",
  "queensfoil-censer|3|Appel de tempête": "/common/destiny2_content/icons/71e4fa0e5b358e6b731e0415de6ce0e9.png",
  "queensfoil-censer|3|Rayons de précision": "/common/destiny2_content/icons/e4f1cd438eb61d85c896294ad7fd0e0b.png",
  "queensfoil-censer|3|Opérateur solitaire": "/common/destiny2_content/icons/0dfd63e45cf5b622a610301afebac679.png",
  "queensfoil-censer|3|Artillerie d'argent": "/common/destiny2_content/icons/7148f81e1d12751937f731bc97f37d53.png",
  "queensfoil-censer|3|Regard glacial": "/common/destiny2_content/icons/a8e0ad8585c13eead66d224a18608556.png",
  "queensfoil-censer|3|En Lambeaux": "/common/destiny2_content/icons/db9994e38f3019475db3dd46162400fb.png",
  // ---- npa-repulsion-regulator (20) ----
  "npa-repulsion-regulator|1|Effilochage amélioré": "/common/destiny2_content/icons/d0a3d776e9edc7c2cb24870707937b15.png",
  "npa-repulsion-regulator|1|Flux volatil": "/common/destiny2_content/icons/e695f6722f6b804915497124a4ca1878.png",
  "npa-repulsion-regulator|1|Jusqu'à la brèche": "/common/destiny2_content/icons/7e8236bfa362af6e9d6bad1c44c22085.png",
  "npa-repulsion-regulator|1|Energisé": "/common/destiny2_content/icons/1aaf471a9b1e75ddf7a50416b6104035.png",
  "npa-repulsion-regulator|1|Riposte foudroyante": "/common/destiny2_content/icons/67f99870af07f9244a7ee0bb8ca0dda9.png",
  "npa-repulsion-regulator|1|Tir soutenu": "/common/destiny2_content/icons/3485c4751f37951002170d05c4468a87.png",
  "npa-repulsion-regulator|1|Orbes de brisure": "/common/destiny2_content/icons/5ed571e47400d0a33896eb2db3428dc6.png",
  "npa-repulsion-regulator|2|Soldat de filobscur": "/common/destiny2_content/icons/6c0a55f052695864d195376f21a0fc0c.png",
  "npa-repulsion-regulator|2|Glaive neutralisant": "/common/destiny2_content/icons/5f2ab7afbfd950990b263ab0020b5c14.png",
  "npa-repulsion-regulator|2|Brèche protectrice": "/common/destiny2_content/icons/0fd65c61c83cbaafaebeb0a03a0f9456.png",
  "npa-repulsion-regulator|2|Charge de contre": "/common/destiny2_content/icons/e0c34da78b75368ee1c50926f895ab1a.png",
  "npa-repulsion-regulator|2|Briques de l'au-delà": "/common/destiny2_content/icons/d5eb9b63bbb4672a9adfec452c1c3d5d.png",
  "npa-repulsion-regulator|2|Grenades à surcharge": "/common/destiny2_content/icons/f9d64a247c90884cce173b29d28cff19.png",
  "npa-repulsion-regulator|2|Recharge automatique du ciblage": "/common/destiny2_content/icons/af01d655f6082ad2c9eb3ee81b77effa.png",
  "npa-repulsion-regulator|3|Aiguille cosmique conductrice": "/common/destiny2_content/icons/802a490f2b11e346091926e4b0a1ebb7.png",
  "npa-repulsion-regulator|3|Supernova": "/common/destiny2_content/icons/815e319a7dd9b8675619aa2f515f03b8.png",
  "npa-repulsion-regulator|3|Chef d'équipe": "/common/destiny2_content/icons/46656d890be5ef3870606c84360429b0.png",
  "npa-repulsion-regulator|3|Deuxième coup de foudre": "/common/destiny2_content/icons/11401dfda102df2b4da5c9ff09950144.png",
  "npa-repulsion-regulator|3|Garde passive agressive": "/common/destiny2_content/icons/c2b8daf574576911a89ae85dccaf67d3.png",
  "npa-repulsion-regulator|3|Canalisation d'arme abyssale": "/common/destiny2_content/icons/22ca2ec59b144ae96610b2b6f25e8190.png",
  // =========== 2. CHOISIS EN JEU PAR L'UTILISATEUR, le 06/10/2026 (19) ===========
  // ---- implement-of-curiosity (5) ----
  "implement-of-curiosity|1|Transport de Horde": "/common/destiny2_content/icons/e59d66773e3f17fca0ce9a1db1ad26d4.png",
  "implement-of-curiosity|2|Explosion entrelacée": "/common/destiny2_content/icons/1857757ec95e15d5e42311e647f86163.png",
  "implement-of-curiosity|3|Broyeur de bouclier": "/common/destiny2_content/icons/fdd095c3fee6fff410f09a57fe5c9f0e.png",
  "implement-of-curiosity|1|Tactique de meute": "/common/destiny2_content/icons/b912d5f9bba66cc24c2c282d768c6061.png",  // nom du Manifest : « Tactiques de meute »
  "implement-of-curiosity|3|Surealimentation élémentaire": "/common/destiny2_content/icons/08d63e99efb583e4d0d13058a7ed63f4.png",  // nom du Manifest : « Suralimentation élémentaire »
  // ---- tablet-of-ruin (3) ----
  "tablet-of-ruin|1|Orbes effilochants": "/common/destiny2_content/icons/14a1ddccf719d767162b94f3ff81db23.png",
  "tablet-of-ruin|1|Siphon élémentaire": "/common/destiny2_content/icons/cdbd8fb13483ef3c287727d88f53a5e0.png",
  "tablet-of-ruin|2|Transport de horde": "/common/destiny2_content/icons/e59d66773e3f17fca0ce9a1db1ad26d4.png",
  // ---- hunters-journal (5) ----
  "hunters-journal|1|Siphon élémentaire": "/common/destiny2_content/icons/cdbd8fb13483ef3c287727d88f53a5e0.png",
  "hunters-journal|1|Explosion entrelacée": "/common/destiny2_content/icons/1857757ec95e15d5e42311e647f86163.png",
  "hunters-journal|3|Broyeur de bouclier": "/common/destiny2_content/icons/d22083ccc81ece6444fa2c022df89705.png",
  "hunters-journal|3|Choc et effroi": "/common/destiny2_content/icons/d0619bebb5fe2dbaede5282a51c6d3fb.png",
  "hunters-journal|1|Tirs soutenu": "/common/destiny2_content/icons/3485c4751f37951002170d05c4468a87.png",  // nom du Manifest : « Tir soutenu »
  // ---- queensfoil-censer (3) ----
  "queensfoil-censer|2|Orbes effilochants": "/common/destiny2_content/icons/14a1ddccf719d767162b94f3ff81db23.png",
  "queensfoil-censer|3|Transport de horde": "/common/destiny2_content/icons/e59d66773e3f17fca0ce9a1db1ad26d4.png",
  "queensfoil-censer|1|Rayon de souffle": "/common/destiny2_content/icons/08966e730bae193ec6f30ed90b54662e.png",  // nom du Manifest : « Rayon du souffle »
  // ---- npa-repulsion-regulator (1) ----
  "npa-repulsion-regulator|3|Choc et effroi": "/common/destiny2_content/icons/d0619bebb5fe2dbaede5282a51c6d3fb.png",
  // ---- encrypted-data-disk (1) ----
  "encrypted-data-disk|3|Combo tempêtes de lames": "/common/destiny2_content/icons/daaa2ac873cf0d92f0386667b84450bd.png",  // nom du Manifest : « Combo Tempête de lames »
  // ---- slayer-baron-apothecary-satchel (1) ----
  "slayer-baron-apothecary-satchel|2|Appel tempête": "/common/destiny2_content/icons/71e4fa0e5b358e6b731e0415de6ce0e9.png",  // nom du Manifest : « Appel de tempête »
};

/** FR : clé d'un perk dans la table ci-dessus. / EN: a perk's key in the table above. */
export const cleIconePerk = (artefactId: string, tier: number, nom: string): string => `${artefactId}|${tier}|${nom}`;

/**
 * FR : chemin d'icône (relatif, à passer à `urlIcone`) d'un perk d'artefact, ou undefined s'il n'en a pas. Le champ `icone` du perk, s'il existe,
 * est prioritaire ; sinon la table figée ci-dessus.
 * EN: icon path (relative, to pass to `urlIcone`) of an artifact perk, or undefined.
 */
export function iconeDuPerk(artefactId: string, perk: Pick<PerkArtefact, "tier" | "nom" | "icone">): string | undefined {
  return perk.icone ?? ICONES_PERKS_ARTEFACT[cleIconePerk(artefactId, perk.tier, perk.nom)];
}

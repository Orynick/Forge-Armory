// FR : Données des 7 artefacts (Artifacts 2.0, Monument of Triumph).
//
// ⚠️ FICHIER GÉNÉRÉ PAR SCRIPT depuis knowledge-base/03_ARTIFACTS.md.
// Ne pas l'éditer à la main : modifier la base de connaissance puis relancer
// l'extraction. (Recopier de longues données manuellement est une source
// d'erreur silencieuse - 4 chemins SVG s'étaient retrouvés tronqués ainsi.)
//
// ⚠️ STRUCTURE CORRIGÉE (04/08/2026) d'après les captures d'écran du jeu
// fournies par l'utilisateur. Le modèle précédent était FAUX : il groupait les
// perks « par slot » (chaque slot ayant sa variante T1/T2/T3), alors que le
// jeu fonctionne autrement :
//
//   - un artefact propose 21 perks : 7 en Tier 1, 7 en Tier 2, 7 en Tier 3 ;
//   - il y a 7 EMPLACEMENTS, chacun plafonné à un tier :
//       2 emplacements plafonnés T1, 3 plafonnés T2, 2 plafonnés T3 ;
//   - un emplacement accepte tout perk de tier INFÉRIEUR OU ÉGAL à son
//     plafond (un slot T3 propose donc les 21 perks, un slot T1 seulement 7) ;
//   - chaque perk ne peut être équipé QU'UNE FOIS sur l'ensemble.
//
// Conséquence : les contraintes globales (« au moins 2 perks T1 », « T2+T3
// ≤ 5 », « T3 ≤ 2 ») ne sont pas des règles séparées — elles DÉCOULENT
// mécaniquement de la répartition des plafonds.
//
// EN: Data for the 7 artifacts. ⚠️ STRUCTURE FIXED (2026-08-04) from the user's
// in-game screenshots. The previous model was WRONG: it grouped perks "per
// slot" whereas an artifact offers 21 perks (7 per tier) across 7 SLOTS, each
// capped at a tier (2 capped T1, 3 capped T2, 2 capped T3). A slot accepts any
// perk of tier <= its cap, and each perk can be equipped only once.

import { DamageElement } from "../types/build";

export interface PerkArtefact {
  /** FR : 1, 2 ou 3. Détermine dans quels emplacements ce perk peut aller. / EN: 1, 2 or 3. Determines which slots this perk fits. */
  tier: number;
  nom: string;
  description: string;
  /**
   * FR : ⚠️ AJOUT (25/08/2026) - chemin d'icône du perk (relatif, à
   * combiner avec `urlIcone`). Optionnel : absent tant que l'extraction de
   * l'artefact ACTIF n'a pas été refaite pour cet artefact précis (voir
   * "⬇ Extraire l'artefact actif", qui la capture désormais).
   * EN: ⚠️ ADDED - perk icon path. Optional: absent until the active
   * artifact's extraction has been redone for this specific artifact.
   */
  icone?: string;
}

export interface Artefact {
  id: string;
  nom: string;
  /** FR : ⚠️ AJOUT (25/08/2026) - nom d'origine en anglais, préservé plutôt qu'écrasé lors de la traduction de `nom` en français. Utile pour retrouver l'artefact dans une recherche Manifest, ou en cas de doute sur la traduction. / EN: ⚠️ ADDED - original English name, kept rather than overwritten when `nom` was translated to French. */
  nomEn: string;
  /**
   * FR : ⚠️ AJOUT (25/08/2026) - hash `DestinyInventoryItemDefinition`
   * pour la miniature réelle du sélecteur. Chaque artefact a 3 hashes
   * candidats trouvés par recherche de nom (convention Manifest connue :
   * plusieurs définitions partagent le même texte affiché) ; vérifié par
   * l'utilisateur que les 3 renvoient la MÊME icône, le premier de chaque
   * liste est donc retenu sans conséquence visuelle. Détail complet :
   * `knowledge-base/24_HASH_ARTEFACTS.md`.
   * EN: ⚠️ ADDED - hash for the selector's real thumbnail. Each artifact
   * has 3 candidate hashes; verified all 3 return the SAME icon, so the
   * first is used without visual consequence.
   */
  itemHash: number;
  saison: string;
  /** FR : éléments de DOCTRINE soutenus ("Kinetic" est exclu, voir soutientCinetique). / EN: SUBCLASS elements supported. */
  elements: DamageElement[];
  /** FR : true si l'artefact soutient aussi les armes cinétiques. / EN: true if it also supports Kinetic weapons. */
  soutientCinetique: boolean;
  armes: string[];
  /** FR : les 21 perks, groupés par tier (7 par tier). / EN: the 21 perks, grouped by tier. */
  perksParTier: { 1: PerkArtefact[]; 2: PerkArtefact[]; 3: PerkArtefact[] };
}

/**
 * FR : plafond de tier de chacun des 7 emplacements, dans l'ordre d'affichage.
 * Relevé sur les captures du jeu : 2 emplacements à 1 carré, 3 à 2 carrés,
 * 2 à 3 carrés.
 * EN: tier cap of each of the 7 slots, in display order. Read from in-game
 * screenshots: 2 slots with 1 pip, 3 with 2 pips, 2 with 3 pips.
 */
export const PLAFOND_TIER_PAR_SLOT: number[] = [1, 1, 2, 2, 2, 3, 3];

/**
 * FR : contraintes de sélection. `perksMax` est le nombre d'emplacements ;
 * les autres valeurs DÉCOULENT de PLAFOND_TIER_PAR_SLOT et sont conservées
 * pour l'affichage des messages d'aide.
 * EN: selection constraints. `perksMax` is the slot count; the rest follows
 * from PLAFOND_TIER_PAR_SLOT and is kept for help messages.
 */
export const CONTRAINTES_ARTEFACT = {
  perksMax: 7,
  tier1Minimum: 2,
  tier2Et3Maximum: 5,
  tier3Maximum: 2,
} as const;

export const ARTEFACTS: Artefact[] = [
  {
    id: "encrypted-data-disk",
    nom: "Disque de données cryptées",
    nomEn: "Encrypted Data Disk",
    itemHash: 3980449645,
    saison: "Renegades",
    elements: ["arc", "abyssal"],
    soutientCinetique: true,
    armes: ["Sword", "Sniper Rifle", "Machine Gun"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Profiter de l'avantage", description: "Briser le bouclier d'un combattant augmente la stabilité, le maniement et la vitesse de rechargement d'\"arme\". Les épées obtiennent une résistance de garde améliorée." },
        { tier: 1, nom: "Synthèse cinétique", description: "Les \"dégâts d'arme cinétique\" continus et les frags rapides ont une chance de régénérer une seule brique de munitions. Ramasser cette brique vous donne des munitions pour les armes à dégâts cinétiques équipées et octroie de la progression de munitions lourdes et spéciales." },
        { tier: 1, nom: "Rechargement à distance", description: "Les tirs de précision avec des [icone arc] \"arcs\" et des [icone fusil de précision] \"fusils de précision\" confèrent un bonus cumulé à leur vitesse de rechargement." },
        { tier: 1, nom: "Riposte", description: "Peu après avoir paré avec une [icone épée] \"épée\", vos attaques lourdes et légères \"étourdissent\" les combattants sans bouclier. Efficace contre les [icone implacable] Champions implacables." },
        { tier: 1, nom: "Douleur contre puissance", description: "Les frags rapides contre des combattants \"affaiblis\" vous confèrent \"Dévoration\" et créent une \"Brèche abyssale\"." },
        { tier: 1, nom: "Proxémie féroce", description: "Les frags par \"coup de grâce\" confèrent de l'énergie de Grenade et de Mêlée." },
        { tier: 1, nom: "Remède rapide", description: "Les frags rapides à la [icone mitrailleuse] \"mitrailleuse\" vous soignent." },
      ],
      2: [
        { tier: 2, nom: "Diélectrique", description: "Eliminer des cibles souffrant de malus [icone cryo-électrique] \"cryo-électrique\" confère \"Charge éclair\". Eliminer rapidement des cibles souffrants de malus \"cryo-électrique\" fait apparaître un \"orbe de puissance\" et restaure une petite portion de santé." },
        { tier: 2, nom: "Spécialiste des armures", description: "Briser le bouclier d'un combattant vous confère temporairement de la résistance aux dégâts et des dégâts de mêlée augmentés." },
        { tier: 2, nom: "Energie de contre", description: "Quand vous ou un membre de votre escouade \"étourdissez\" un Champion, vous gagnez de l'énergie pour votre compétence la moins chargée." },
        { tier: 2, nom: "Combo lame d'argent", description: "Faites une courte pause après une attaque légère et attaque lourde pour énergiser votre [icone épée] \"épée\" pendant un court moment, ce qui lui confère un bonus de dégâts et de vitesse de charge." },
        { tier: 2, nom: "Lame de singularité", description: "Quand vous bénéficiez d'un \"bonus élémentaire abyssal\", les coups de mêlée et d'épée \"affaiblissent\" les cibles, et les frags à l'épée et en mêlée créent une \"rafale affaiblissante\"." },
        { tier: 2, nom: "Secousses aveuglantes", description: "Les frags de combattants affectés par une \"Secousse\" infligent \"Cécité\" aux combattants avoisinants." },
        { tier: 2, nom: "Equité de précision", description: "Les frags de précision font progresser un gros orbe de puissances, qui augmente les dégâts d'arme lorsqu'il est ramassé. Les cibles de rang élevé font progresser plus vite." },
      ],
      3: [
        { tier: 3, nom: "Orbes élémentaires : cryo-électriques", description: "Les frags à l'arme [icone cryo-électrique] \"cryo-électrique\" ont une chance de faire apparaître un orbe élémentaire cryo-électrique. Les orbes cryo-électriques peuvent être lancés ou tirés pour créer une explosion cryo-électrique qui inflige \"Secousse\" aux ennemis touchés." },
        { tier: 3, nom: "Rupture cinétique", description: "Les dégâts d'arme \"cinétique\" sur un combattant puissant ont une chance de créer une rupture cinétique. Cibler cette rupture crée une explosion qui inflige des dégâts et \"fait chanceler\" les combattants. Efficace contre les [icone implacable] Champions implacables." },
        { tier: 3, nom: "Méditation du tireur", description: "Les tirs au [icone fusil de précision] \"fusil de précision\" octroient un cumul de dégâts de fusil de précision, de stabilité et de bonus de rechargement. Les tirs au fusil de précision avec munitions lourdes compte pour plus d'un tir." },
        { tier: 3, nom: "Combo tempêtes de lames", description: "Réaliser 3 attaques légères à l'[icone épée] \"épée\" suivies d'une attaque lourde invoque des lames ténébreuses qui vous entourent afin d'infliger des dégâts et de désorienter les combattants. Les frags à l'épée allongent la durée de ces lames ténébreuses." },
        { tier: 3, nom: "Infestation abyssale", description: "Eliminer une cible \"affaiblie\" fait apparaitre un projectile traqueur qui affaiblit d'autres cibles." },
        { tier: 3, nom: "Tazer tag", description: "Les coups de mêlée [icone cryo-électrique] \"cryo-électrique\" infligent une \"Secousse\" aux combattants et augmentent les dégâts pendant un court moment." },
        { tier: 3, nom: "Electroadhésion", description: "Les grenades fluctuantes [icone cryo-électrique] \"cryo-électrique\", magnétiques [icone abyssal] \"abyssales\" et à fusion [icone solaire] \"solaires\" infligent plus de dégâts lorsqu'elles sont attachées aux combattants. En cas de frag, elles libèrent des micro-missiles qui traquent les combattants avoisinants." },
      ],
    },
  },
  {
    id: "implement-of-curiosity",
    nom: "Outillage de Curiosité",
    nomEn: "Implement of Curiosity",
    itemHash: 2694905144,
    saison: "Reclamation",
    elements: ["solaire", "stase", "filobscur"],
    soutientCinetique: true,
    armes: ["Bow", "Sword", "Micro-Missiles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Fièvre et Frisson", description: "Les tirs de précision rapides avec des armes [icone solaire] \"Solaires\" confèrent \"Radiance\". Les tirs de précision rapides avec des armes [icone stase] \"Stasiques\" confèrent \"Armure de Givre\"." },
        { tier: 1, nom: "Bienveillance élémentaire", description: "Donner un \"bonus élémentaire\" aux alliés confère de l'énergie de \"compétence de classe\"." },
        { tier: 1, nom: "Renouveau Glacé", description: "Quand vous avez \"Armure de Givre\", subir des dégats critiques libère une rafale qui \"Gèle\" les combattant proches et vous confère \"Armure de Givre\", ainsi qu'à vos alliés." },
        { tier: 1, nom: "Transport de Horde", description: "Les dégats d'arme infligés aux cibles \"Effilochées\" font parfois apparaître une \"Brindille\". Les Brindilles \"Sectionnent\" les cibles à qui elles infligent des dégats." },
        { tier: 1, nom: "Fils rafraîchis", description: "Rammasser un \"objet élémentaire\" qui correspond à votre doctrine ou un \"Enchevêtrement\" quand vous avec un Super [icone filobscur] \"Filobscur\" équipé confère de l'énergie à votre compétence la moins chargée." },
        { tier: 1, nom: "Tactique de meute", description: "Infliger des dégâts avec des \"Brindilles\" augmente les dégats des Brindilles. Lorsque les cumuls sont au maximum, les Brindilles \"étourdissent\" les [icone Implacable] Champions Implacables." },
        { tier: 1, nom: "Assaillant semi-automatique", description: "Si vous avez au moins 2 unités de charge d'armure, les tirs de précision rapides avec les arcs, les fusils de précision et les fusils d'éclaireurs génère une charge d'armure." },
      ],
      2: [
        { tier: 2, nom: "Explosion entrelacée", description: "Détruire un \"Enchevêtrement\" avec des dégats [icone filobscur] \"Filobscurs\" augmente le rayon de l'explosion et ses dégâts." },
        { tier: 2, nom: "Ténèbres cautérisées", description: "Les combattants non boss avec des malus [icone stase] \"Stasiques\" ou [icone filobscur] \"Filobscurs subissent plus de dégats [icone solaire] \"Solaires\" de toute source." },
        { tier: 2, nom: "Confusion élémentaire", description: "Etourdir un Champion avec une arme élémentaire crée une explosion élémentaire alignée, qui applique un malus élémentaire correspondant au Champion et aux cibles proches." },
        { tier: 2, nom: "Soutien mutuel", description: "Infliger des dégâts de précision continus contre des combattants quand vous êtes près d'au moins deux alliés vous confère de la résistance aux dégats." },
        { tier: 2, nom: "Coalescence élémentaire", description: "Eliminer dés cibles confèreune chance de créer un \"objet élémentaire\" qui correspond à votre élément de \"Super\" équipé." },
        { tier: 2, nom: "L'arôme des balles neuves", description: "Ramasser une brique de munitions augmente les dégâts de vos armes cinétiques pendant une courte durée." },
        { tier: 2, nom: "Accélération énergétique", description: "Des dégâts continus avec des \"micro-missiles\" font émettre au combattant une onde de choc \"cinétique\" qui inflige des dégâts aux combattants proches. Efficace contre les [icone Implacable] Champions Implacable." },
      ],
      3: [
        { tier: 3, nom: "Mitraille rayonnante", description: "Infliger des dégâts continus sous l'effet de \"Radiance\" ou éliminer un combattant souffrant de \"Blessures solaires\" avec une arme pousse la cible à libérer des projectiles solaires qui infligent des dégâts et des Blessures solaires à l'impact." },
        { tier: 3, nom: "Broyeur de bouclier", description: "Lorsque vous avez \"Maille tissée\", \"Armure de givre\"ou un \"Surbouclier abyssal\", votre \"Mêlée\" se recharge plus vite et inflige plus de dégâts. Lorsque vous êtes sous l'effet d'\"Amplificateur\" ou de \"Radiance\", votre \"Grenade\" se recharge plus vite et inflige plus de dégâts." },
        { tier: 3, nom: "Surealimentation élémentaire", description: "Ramasser un \"objet élémentaire\" ou un \"Enchevêtrement\" confère des dégâts accrus aux armes du même élément." },
        { tier: 3, nom: "Toile enchevêtrée", description: "Créer un \"Enchevêtrement\" en éliminant une cible ayant un malus [icone filobscur] \"Filobscur\" \"suspend\" les combattants proches." },
        { tier: 3, nom: "Regard glacial", description: "Quand \"Armure de givre\" est active, les frags de précision [icone stase] \"Stasiques\" poussent poussent les combattants à libérer une rafale de \"gel\"." },
        { tier: 3, nom: "Vigueur du Seigneur de Fer", description: "Quand vous portez une épée, vous subissez moins de dégâts ; les frags rapides octroient des munitions au porteur." },
        { tier: 3, nom: "Carquois argenté", description: "Recharger un \"arc\" consomme un cumul de \"charge d'armure\", augmentant les dégâts et la vitesse de rechargement de vos 3 prochains tirs ou jusqu'à ce que vous rangiez votre arc." },
      ],
    },
  },
  {
    id: "tablet-of-ruin",
    nom: "Tablette de la Ruine",
    nomEn: "Tablet of Ruin",
    itemHash: 2392273483,
    saison: "Heresy",
    elements: ["arc", "abyssal", "filobscur", "prismatique"],
    soutientCinetique: false,
    armes: ["Fusion Rifles", "Glaives", "Trace Rifles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Tenir bon", description: "Quand vous êtes encerclé, les [icone mitrailleuses] \"mitrailleuses\" et les [icone glaive] \"glaives\" ont une meilleure vitesse de rechargement et stabilité ; les frags vous soignent." },
        { tier: 1, nom: "Diélectrique", description: "Eliminer des cibles souffrant de malus [icone cryo-électrique] \"cryo-électriques\" confère \"Charge éclair\". Eliminer rapidement des cibles souffrant de malus \"cryo-électriques\" fait apparaître un \"orbe de puissance\" et restaure une petite porton de santé." },
        { tier: 1, nom: "Tir d'élite volatil", description: "Les tirs de précision rapides par arme [icone abyssale] \"abyssale\" et les frags rapides par arme abyssale confèrent des \"munitions volatiles\". Les explosions \"volatiles\" confèrent de l'énergie de compétence de classe." },
        { tier: 1, nom: "Orbes effilochants", description: "Ramasser un \"orbe de puissance\" ou un \"Enchevêtrement\" confère des \"munitions effilochantes\" aux armes [icone filobscur] \"filobscur\"." },
        { tier: 1, nom: "Eclat photonique", description: "Eliminer une cible \"épuisée\" ou \"sectionnée\" avec dégâts [icone cryo-électrique] \"cryo-électriques\" libère une rafale qui inflige \"Cécité\"" },
        { tier: 1, nom: "Siphon élémentaire", description: "Les frags rapides à l'aide d'une arme [icone cinétique] \"cinétique\" ou d'une arme correspondant à votre \"Super\" équipé créent un \"objet élémentaire\" à ramasser qui correspond à votre Super équipé. Les \"objets élémentaires\" confèrent de l'énergie de \"Super\" correspondante quand ils sont récupérés." },
        { tier: 1, nom: "Destruction perpétuelle", description: "Les frags rapides avec des [icone lance-roquettes] \"lance-roquettes\" non exotiques rechargent les munitions et augmentent la vitesse de rechargement pendant une courte durée." },
      ],
      2: [
        { tier: 2, nom: "Tissage ignoble", description: "Les cibles touchées par vos \"Enchevêtrements\" sont victimes de \"Sectionnement\". Ramasser un Enchevêtrement réduit leur temps de récupération." },
        { tier: 2, nom: "Récolte ignoble", description: "En appliquant rapidement \"Volatil\", votre prochaine occurence de dégâts d'arme [icone abyssale] \"abyssale\" crée une rafale \"affaiblissante\". Appliquer cet affaiblissement confère un petit \"surbouclier abyssal\"." },
        { tier: 2, nom: "Electrification", description: "Quand vous obtenez le maximum de \"Charge éclair\", vous recevez aussi \"Amplificateur\". Les éclairs infligent plus de dégâts." },
        { tier: 2, nom: "Transport de horde", description: "Les dégâts d'arme infligés aux cibles \"effilochées\" font parfois apparaître une \"Brindille\". Les Brindilles \"sectionnent\" les cibles à qui elles infligent des dégâts." },
        { tier: 2, nom: "Pas de cloche", description: "Les frags de mêlée rapides à l'aide de [icone glaive] \"glaives\" font apparaître des munitions spéciales de glaive supplémentaires. Bloquer des dégâts avec des glaives augmente les dégâts de mêlée qu'ils infligent aux cibles." },
        { tier: 2, nom: "Réfraction cruelle", description: "Les [icone fusil à rayon] \"fusil à rayon\" infligent plus de dégâts aux cibles qui subissent des malus élémentaires correspondant à leur type d'élément." },
        { tier: 2, nom: "Plomb en or", description: "Ramasser des munitions spéciales a une chance d'octroyer des munitions lourdes." },
      ],
      3: [
        { tier: 3, nom: "Reconstruction de particules", description: "Infliger des dégâts continus avec des [icone fusil à fusion] \"fusils à fusion\" ou des [icone fusil à fusion linéaire] \"fusil à fusion linéaire\" recharge partiellement le chargeur à partir des réserves et leur confère un bonus de dégâts pendant une courte durée contre cette cible." },
        { tier: 3, nom: "Superchargeur élémentaire", description: "Eliminer des cibles \"épuisées\" ou \"sectionnées\" avec des armes correspondant à votre élément de \"Super\" confère de l'énergie de Super." },
        { tier: 3, nom: "Régénération d'artillerie lourde", description: "Infliger des dégâts continus avec des [icone mitrailleuses] \"mitrailleuses\" ou des [icone lance-roquettes] \"lance-roquettes\" confère de la résistance aux dégâts et améliore la régénération d'énergie de \"Grenade\" et de \"Mêlée\" pendantune courte durée. Avec ce mod activé, éliminerdes combattants puissants désoriente les combattants de base proches." },
        { tier: 3, nom: "Explosion défibrillatrice", description: "Etourdir un Champion confère le cumul maximum de \"Charges éclair\". Toucher des cibles avec ces charges leur inflige \"Secousse\" et vous soigne." },
        { tier: 3, nom: "Flux abyssal", description: "Eliminer des cibles \"affaiblies\" avec une arme [icone abyssale] \"abyssale\" applique \"Volatil\" aux cibles proches. Les cibles puissantes augmentent le rayon d'explosion." },
        { tier: 3, nom: "Plus de limite", description: "Lancer un \"Super\" lorsque vous êtes en état critique ou que vous bénéficiez d'un bonus élémentaire correspondant à votre élément de Super augmente temporairement vos dégâts de Super." },
        { tier: 3, nom: "En lambeaux", description: "Infliger des dégâts continus à des cibles victimes de \"Sectionnement\" les \"effiloche\". Eliminer une cible \"sectionnée\" crée un point d'énergie [icone filobscur] filobscure et confère \"Maille tissée\" aux alliés proches pendant une courte durée." },
      ],
    },
  },
  {
    id: "slayer-baron-apothecary-satchel",
    nom: "Sacoche d'apothicaire de Baron-Bourreau",
    nomEn: "Slayer Baron Apothecary Satchel",
    itemHash: 3044482290,
    saison: "Revenant",
    elements: ["arc", "abyssal", "stase"],
    soutientCinetique: false,
    armes: ["Grenade Launchers", "Shotguns"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Vent glacé", description: "Les tirs de précision rapides avec une arme [icone stase] \"stasique\" vous confèrent un cumul d'\"Armure de Givre\" ; les touches sur des cibles ralenties ou gelées créent également un \"éclat stasique\"." },
        { tier: 1, nom: "Convertisseur cristallin", description: "Après avoir activé votre compétence de classe, votre prochain frag avec une arme [icone stase] \"stasique\" crée un \"éclat stasique\". Récupérez des \"éclats stasiques\" pour obtenir des cumuls de Convertisseur cristallin, qui permettent à votre prochaine \"attaque de mêlée [icone stase] stasique chargée\" de créer des \"cristaux de stase\" égaux au nombre de cumuls que vous avez." },
        { tier: 1, nom: "Carnage total", description: "Après un \"coup de grâce\" sur un combattant coriace, vous gagnez de la résistance aux dégâts temporaire et restaurez votre santé." },
        { tier: 1, nom: "Douleur contre puissance", description: "Les frags rapides contre des combattants \"affaiblis\" vous confèrent \"Dévoration\" et créent une \"Brèche abyssale\"." },
        { tier: 1, nom: "Jeu de piste", description: "Les tirs de précision rapides ou les frags rapides sur des cibles affectées par \"Secousse\" ou \"Cécité\" génèrent des \"Pistes ioniques\". Ramasser une Piste ionique confère une \"charge d'armure\"." },
        { tier: 1, nom: "Au coeur de l'action", description: "Lorsque l'ennemi vous encercle, les frags rapides vous confèrent une \"charge d'armure\". Quand vous êtes encerclés, le \"maniement\" de vos armes est amélioré ; les [icone épée] épées ont une meilleure \"vitesse de charge\"." },
        { tier: 1, nom: "Brise mortelle", description: "Les frags rapides avec une \"arme\" vous confèrent un bonus de mobilité." },
      ],
      2: [
        { tier: 2, nom: "Renouveau glacé", description: "Quand vous avez \"Armure de Givre\", subir des dégâts critiques libère une rafale qui \"gèle\" les combattants proches et vous confère Armure de Givre, ainsi qu'à vos alliés." },
        { tier: 2, nom: "Appel tempête", description: "Briser des cibles \"gelées\" et des cristaux de \"stase\" augmente les dégâts. Briser des cristaux de \"stase\" libère des éclats de glace qui infligent des dégâts aux cibles et les \"ralentissent\"." },
        { tier: 2, nom: "Vague affaiblissante", description: "Les \"coups de grâce\" émettent une onde à dégâts correspondant à l'élément de votre \"Super\" équipé. Les ondes \"cryo-électriques\", \"abyssales\" ou \"stasiques\" appliquent \"Cécité\", \"Affaiblissement\" et \"Ralentissement\"." },
        { tier: 2, nom: "Affaiblissement clair", description: "Utiliser un lance-grenades, blesser un boss, blesser un Champion ou briser le bouclier d'un combattant recharge vos armes rangées et \"affaiblit\" votre cible." },
        { tier: 2, nom: "Brûlure rétinienne", description: "Les frags rapides par tir de précision avec une arme [icone cryo-électrique] \"cryo-électrique\" utilisent une \"charge d'armure\" pour envoyer une rafale de \"Cécité\" à l'emplacement de la cible." },
        { tier: 2, nom: "Orbes curatifs", description: "La première fois que vous brisez le bouclier d'une cible ou celui d'un Gardien utilisant son Super, vous créez un \"orbe de puissance\". Ramasser un \"objet élémentaire\", ramasser un \"orbe de puissance\" ou détruire un \"Enchevêtrement\" vous confère une petite quantité de santé." },
        { tier: 2, nom: "Renouveau abyssal", description: "Lorsque \"Dévoration\" est activée, les frags à l'arme [icone abyssale] \"abyssale\" ont une chance de créer une \"Brèche abyssale\". Ramasser une Brèche abyssale augmente le \"rechargement\" et le \"maniement\" des armes ; les [icone fusil à pompe] \"fusils à pompe\" et les [icone lance-grenades] \"lance-grenades\" sont aussi rechargés depuis les réserves." },
      ],
      3: [
        { tier: 3, nom: "Gel cérébral", description: "Les combattants \"gelés\" sont entourés d'un brouillard glacial, qui \"ralentit\" ceux qui ne le sont pas encore." },
        { tier: 3, nom: "Supernova", description: "Ramasser une \"Brèche abyssale\" permet à votre prochaine source de dégâts abyssaux de créer un grand rayon \"affaiblissant\"." },
        { tier: 3, nom: "Cristal cosmique conducteur", description: "Vos compétences [icone cryo-électrique] \"cryo-électrique\" et [icone abyssale] \"abyssale\" infligent des dégâts bonus aux cibles affectés par un malus |icone stase] \"stasique\"." },
        { tier: 3, nom: "Se mange froid", description: "Ramasser un [icone stase] \"éclat stasique\" vous confère de l'énergie de compétence de \"classe\". Ramasser une [icone abyssale] \"Brèche abyssale\" vous confère de l'énergie de \"mêlée\"." },
        { tier: 3, nom: "Impacts cinétiques", description: "Infliger des dégâts continus avec un [icone lance-grenades] \"lance-grenades\" augmente temporairement la vitesse de rechargement des lance-grenades et déclenche un \"onde de choc cinétique\". Cette onde de choc peut \"étourdir\" les [icone Implacable] Champions Implacables." },
        { tier: 3, nom: "Combinaison cryo-électrique", description: "Les sources [icone cryo-électriques] \"cryo-électriques\" infligent plus de dégâts aux cibles souffrant de \"Cécité\"." },
        { tier: 3, nom: "Rite des dieux anciens", description: "Après avoir ramassé une [icone abyssale] \"Brèche abyssale\", infliger des dégâts à l'aide d'une arme \"abyssale\" crée une pluie de projectiles traqueurs." },
      ],
    },
  },
  {
    id: "hunters-journal",
    nom: "Journal du Chasseur",
    nomEn: "Hunter's Journal",
    itemHash: 2180638678,
    saison: "Echoes",
    elements: ["solaire", "arc", "abyssal", "prismatique"],
    soutientCinetique: false,
    armes: ["Auto Rifles", "Sniper Rifles", "Swords"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Siphon élémentaire", description: "Les frags rapides à l'aide d'une arme [icone cinétique] \"cinétique\" ou d'une arme correspondant à votre \"Super\" équipé créent un \"objet élémentaire\" à ramasser qui correspond à votre Super équipé." },
        { tier: 1, nom: "Substrat de diffusion énergétique", description: "Augmente légèrement votre résistance à tous les dégâts infligés par des combattants." },
        { tier: 1, nom: "Frisson insidieux", description: "Les frags [icone stase] \"Stasiques\" face aux cibles \"ralenties\" ou \"gelées\" relâchent une explosion qui \"ralentit\" les combattants et confère \"Armure de Givre\" aux alliés pris dans l'explosion." },
        { tier: 1, nom: "Profiter de l'avantage", description: "Briser le bouclier d'un combattant augmente la stabilité, le maniement et la vitesse de rechargement d'\"arme\". Les [icone épée] épées obtiennent une résistance de garde améliorée." },
        { tier: 1, nom: "Explosion entrelacée", description: "Détruire un \"Enchevêtrement\" avec des dégâts [icone filobscur] \"Filobscurs\" augmente le rayon de l'explosion et ses dégâts." },
        { tier: 1, nom: "Munitions incendiaires pour fusil", description: "Les tirs de précision réalisés avec un [icone fusil de précision][icone solaire] \"fusil de précision solaire\" infligent des \"Blessures solaires\" aux cibles." },
        { tier: 1, nom: "Tirs soutenu", description: "Infliger des dégâts à des combattants ou soigner des alliés en continu avec un [icone fusil automatique] vous confère une résistance aux dégâts." },
      ],
      2: [
        { tier: 2, nom: "Energie de contre", description: "Quand vous ou un membre de votre escouade \"étourdissez\" un Champion, vous gagnez de l'énergie pour votre compétence la moins chargée." },
        { tier: 2, nom: "Endurance de Lame", description: "Eliminer rapidement des combattants avec une [icone épée] \"épée\" recharge quelques munitions." },
        { tier: 2, nom: "Hégémonie abyssale", description: "Lorsque vous avez une doctrine \"Abyssale\" ou \"Prismatique\" équipée, éliminer les cibles \"affaibles\" fournit un petit \"surbouclier abyssal\"." },
        { tier: 2, nom: "Orbes radieux", description: "Lorsque vous avez une doctrine \"Solaire\" ou \"Prismatique\" équipée, ramasser un orbe de puissance vous octroie \"Radiance\"." },
        { tier: 2, nom: "Mauvaise amplitude", description: "Blesser un Champion avec une compétence [icone cryo-électrique] \"Cryo-électrique\" lui inflige une \"Secousse\"." },
        { tier: 2, nom: "Fulmination solaire", description: "Vos \"Embrasements\" infligent plus de dégâts dans un rayon plus large." },
        { tier: 2, nom: "Recharge automatique du ciblage", description: "Lorsqu'un [icone fusil automatique] \"fusil automatique\" est équipé, éliminer des combattants recharge votre arme équipée et augmente temporairement les dégâts d'arme. Les frags quand vous êtes encerclé octroient un bonus de progression." },
      ],
      3: [
        { tier: 3, nom: "Transfert prismatique", description: "Quand vous utilisez votre Super, chaque membre de votre escouade avec un type de Super différent du vôtre gagne de dégâts." },
        { tier: 3, nom: "Lame d'argent", description: "Lorsque vous avez de la \"charge d'armure\", infliger des dégâts avec un épée consomme un cumul de charge d'armure et renforce votre [icone épée] \"épée\" pendant un court moment, lui octroyant des dégâts bonus et de l'énergie de vitesse de charge." },
        { tier: 3, nom: "Abîme déployé", description: "Les sources \"abyssales\" infligent des dégâts aux cibles \"affaiblies\"." },
        { tier: 3, nom: "Broyeur de bouclier", description: "Lorsque vous avez \"Maille tissée\", \"Armure de givre\"ou un \"Surbouclier abyssal\", votre \"Mêlée\" se recharge plus vite et inflige plus de dégâts. Lorsque vous êtes sous l'effet d'\"Amplificateur\" ou de \"Radiance\", votre \"Grenade\" se recharge plus vite et inflige plus de dégâts." },
        { tier: 3, nom: "Transfert", description: "Les dégâts de \"Grenade\" et de \"Mêlée\" augmentent lorsque vous êtes sous l'effet de \"Transcendance\". Les frags avec une arme en étant sous l'effet de \"Transcendance\" rechargent votre énergie de \"Lumière\" et de \"Ténèbres\" une fois la Transcendance terminée." },
        { tier: 3, nom: "Méditation du tireur", description: "Les tirs au [icone fusil de précision] \"fusil de précision\" octroient un cumul de dégâts de fusil de précision, de stabilité et de bonus de rechargement. Les tirs au fusil de précision avec munitions lourdes compte pour plus d'un tir." },
        { tier: 3, nom: "Choc et effroi", description: "Lorsqu'une doctrine [icone cryo-électrique] \"Cryo-électrique\" ou \"Prismatique\" est équipée, les frags \"cryo-électriques\" sous l'effet d'\"Amplificateur\" attirent un éclair qui inflige des dégâts ainsi que des \"Secousses\" aux cibles." },
      ],
    },
  },
  {
    id: "queensfoil-censer",
    nom: "Encensoir à feuilles de Reine",
    nomEn: "Queensfoil Censer",
    itemHash: 3518286241,
    saison: "Wish",
    elements: ["solaire", "stase", "filobscur"],
    soutientCinetique: false,
    armes: ["Rocket Launcher", "Grenade Launchers"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Fièvre et Frisson", description: "Les tirs de précision rapides avec des armes [icone solaire] \"Solaires\" confèrent \"Radiance\". Les tirs de précision rapides avec des armes [icone stase] \"Stasiques\" confèrent \"Armure de Givre\"." },
        { tier: 1, nom: "Torche", description: "Lorsque \"Radiance\" est actif, les dégâts d'arme infligés aux combattants victimes de malus [icone filobscure] \"filobscur\" et [icone stasique] \"stasique\" augmentent." },
        { tier: 1, nom: "Coeur de flamme", description: "Lancer votre Super solaire propage \"Radiance\" aux alliés et les dégâts du Super augmentent en fonction des alliés proches." },
        { tier: 1, nom: "Spécialiste des armures", description: "Briser le bouclier d'un combattant vous confère temporairement de la résistance aux dégâts et des dégâts de mêlée augmentés." },
        { tier: 1, nom: "Voeu d'existence", description: "Quand votre Super est presque entièrement chargé, les frags de compétence font apparaître des orbes de puissance." },
        { tier: 1, nom: "Allume-feu", description: "Lorsque \"Radiance\" est actif, les armes [icone solaire] \"solaire\" infligent des \"Blessures solaires\" aux cibles qui n'en sont pas encore victimes." },
        { tier: 1, nom: "Rayon de souffle", description: "Les frags rapides par [icone lance-roquettes] lance-roquettes et [icone lance-grenade] lance-grenades confèrent de la \"charge d'armure\"." },
      ],
      2: [
        { tier: 2, nom: "Orbes effilochants", description: "Ramasser un \"orbe de puissance\" ou un \"Enchevêtrement\" confère des \"munitions effilochantes\" aux armes [icone filobscur] \"filobscures\"." },
        { tier: 2, nom: "Pilier de glace", description: "Eliminer une cible \"gelée\" fait apparaître des cristaux de \"stase\"." },
        { tier: 2, nom: "Explosion revitalisante", description: "Etourdir un Champion provoque un \"Embrasement\" et annule l'étourdissement de votre bouclier." },
        { tier: 2, nom: "Coiffe anti-Champions", description: "Les [icone lance-roquettes] lance-roquettes infligent plus de dégats aux Champions." },
        { tier: 2, nom: "Morsure du Dragon", description: "Briser le bouclier d'un combattant avec une arme [icone filobscure] filobscure ou [icone stasique] stasique offre une chance de \"suspendre\" ou \"geler\" ce combattant." },
        { tier: 2, nom: "Frisson insidieux", description: "Les frags [icone stasique] \"stasiques\" face aux cibles \"ralenties\" ou \"gelées\" relâchent une explosion qui \"ralentit\" les combattants et confère \"Armure de Givre\" aux alliés pris dans l'explosion." },
        { tier: 2, nom: "Destruction perpétuelle", description: "Les frags rapidesavec des [icone lance-roquettes] \"lance-roquettes\" non exotiques rechargent les munitions et augmentent la vitesse de rechargement pendant une courte durée." },
      ],
      3: [
        { tier: 3, nom: "Transport de horde", description: "Les dégâts d'arme infligés aux cibles \"effilochées\" font parfois apparaître une \"Brindille\". Les Brindilles \"sectionnent\" les cibles à qui elles infligent des dégats." },
        { tier: 3, nom: "Appel de tempête", description: "Briser des cibles \"gelées\" et des cristaux de \"stase\" augmente les dégâts. Briser des cristaux de \"stase\" libère des éclats de glace qui infligent des dégâts aux cibles et les \"ralentissent\"." },
        { tier: 3, nom: "Rayons de précision", description: "Lorsque \"Radiance\" est activée, les frags de précision [icone solaire] \"solaire\" embrasent les combattants." },
        { tier: 3, nom: "Opérateur solitaire", description: "Lorsque vous êtes l'unique membre de votre escouade, les frags à l'arme de précision augmentent les dégâts d'arme jusqu'à ce que vous soyez éliminé." },
        { tier: 3, nom: "Artillerie d'argent", description: "Les tirs au [icone lance-roquettes] lance-roquettes consomment un cumul de \"charge d'armure\", augmentant les dégâts et la vitesse de rechargement jusqu'à ce que vous rechargiez ou rangiez votre lance-roquettes." },
        { tier: 3, nom: "Regard glacial", description: "Quand \"Armure de Givre\" est active, les frags de précision [icone stasique] \"stasique\" poussent les combattants à libérer une rafale de \"gel\"." },
        { tier: 3, nom: "En Lambeaux", description: "INfliger des dégâts continus à des cibles victimes de \"Sectionnement\" les \"effiloche\". Eliminer une cible \"sectionnée\" crée un point d'énergie [icone filobscure] filobscure et confère \"Maille tissée\" aux alliés proches pendant une courte durée." },
      ],
    },
  },
  {
    id: "npa-repulsion-regulator",
    nom: "Régulateur répulsif ANP",
    nomEn: "NPA Repulsion Regulator",
    itemHash: 2785855278,
    saison: "Deep",
    elements: ["arc", "abyssal", "filobscur"],
    soutientCinetique: false,
    armes: ["Glaive", "Auto Rifles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Effilochage amélioré", description: "Augmente la quantité de dégâts infligés en \"Effilochant une cible." },
        { tier: 1, nom: "Flux volatil", description: "Ramasser un orbe de puissance confère des \"munitions volatiles\" à vos armes [icone abyssale] \"abyssales\"." },
        { tier: 1, nom: "Jusqu'à la brèche", description: "Eliminer une cible qui subit un \"malus [icone abyssale] abyssal\" crée une \"Brèche abyssale\" quand vous avez votre doctrine abyssale ou prismatique équipée." },
        { tier: 1, nom: "Energisé", description: "Vous restez plus longtemps sous l'effet d'\"Amplificateur\" quand vous avez votre doctrine cryo-électrique ou prismatique équipée." },
        { tier: 1, nom: "Riposte foudroyante", description: "Confère un bonus de dégâts au \"Super cryo-électrique\" si ce dernier est activédurant une blessure critique ou sous l'effet d'\"Amplificateur\". Dure jusqu'à la fin de l'activation du Super." },
        { tier: 1, nom: "Tir soutenu", description: "Infliger des dégâts à des combattants ou soigner des alliés en continu avec un [icone fusil automatique] \"fusil automatique\" vous confère une résistance aux dégâts." },
        { tier: 1, nom: "Orbes de brisure", description: "La première fois que vous brisez le bouclier d'un combattant, vous créez un orbe de puissance si vous le faitesavec le type de dégâts correspondant." },
      ],
      2: [
        { tier: 2, nom: "Soldat de filobscur", description: "Vos armes [icone filobscur] filobscures ont des \"munitions effilochantes\" dès que vous obtenez \"Maille tissée\" quand vousavez votre doctrine filobscure ou prismatique équipée." },
        { tier: 2, nom: "Glaive neutralisant", description: "Blesser des combattants avec votre [icone glaive] glaive les \"neutralise\" et les empêche temporairement d'utiliser des \"compétences\"." },
        { tier: 2, nom: "Brèche protectrice", description: "Ramasser une \"Brèche abyssale\" vous procure un \"surbouclier\" supplémentaire ou restaure votre \"surbouclier abyssale\"." },
        { tier: 2, nom: "Charge de contre", description: "Gagnez une \"charge d'armure\" quand vous étourdissez un Champion." },
        { tier: 2, nom: "Briques de l'au-delà", description: "Vaincre un combattant puissant avec une arme [icone abyssale] abyssale donne une chance de générer de la progression de munitions lourdes pour vous et vos coéquipiers." },
        { tier: 2, nom: "Grenades à surcharge", description: "Les grenades abyssales perturbent les combattants et les \"étourdissent\", ralentissant la régénération d'énergie de compétence et réduisant les dégâts infligés par un combattant. Efficace contre les [icone surchargé] Champions surchargés." },
        { tier: 2, nom: "Recharge automatique du ciblage", description: "Lorsqu'un [icone fusil automatique] \"fusil automatique\" est équipé, éliminer des combattants recharge votre arme équipée et augmente temporairement les dégâts d'arme. Les frags quand vous êtes encerclé octroient un bonus de progression." },
      ],
      3: [
        { tier: 3, nom: "Aiguille cosmique conductrice", description: "Les cibles affectées par des malus de [icone filobscur] filobscur subissent plus de dégâts des compétences [icone abyssal] abyssales et [icone cryo-électrique] cryo-électriques." },
        { tier: 3, nom: "Choc et effroi", description: "Lorsqu'une doctrine [icone cryo-électrique] \"Cryo-électrique\" ou \"Prismatique\" est équipée, les frags \"cryo-électriques\" sous l'effet d'\"Amplificateur\" attirent un éclair qui inflige des dégâts ainsi que des \"Secousses\" aux cibles." },
        { tier: 3, nom: "Supernova", description: "Ramasser une \"Brèche abyssale\" permet à votre prochaine source de dégâts abyssaux de créer un grand rayon \"affaiblissant\"." },
        { tier: 3, nom: "Chef d'équipe", description: "Réaliser un coup de grâce sous l'effet d'\"Amplificateur\" confère \"Amplificateur\" aux alliés proches. Réaliser un coup de grâce sous l'effet d'\"Maille tissée\" confère \"Maille tissée\" aux alliés proches. Réaliser un coup de grâce sous l'effet d'\"Dévoration\" confère \"Dévoration\" aux alliés proches." },
        { tier: 3, nom: "Deuxième coup de foudre", description: "Après avoir jeté une grenade cryo-électrique, vous obtenez une recharge de grenade améliorée pendant un bref moment. Les frags cryo-électriques augmentent la durée de ce bonus." },
        { tier: 3, nom: "Garde passive agressive", description: "Vous subissez moins de dégâts des combattants proches quand vous maniez un [icone de glaive] glaive." },
        { tier: 3, nom: "Canalisation d'arme abyssale", description: "Vous gagnez un bonue temporaire aux dégats d'arme [icone abyssale] abyssale après avoir vaincu une cible avec une arme [icone abyssale] abyssale alors qu'au moins une de vos compétences abyssales est totalement chargée. Ces bonus augmentent en fonction de votre nombre de compétences abyssales totalement chargées." },
      ],
    },
  },
];

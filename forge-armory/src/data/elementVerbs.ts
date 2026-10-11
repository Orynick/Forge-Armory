// FR : Catalogue des verbes d'element (Scorch, Jolt, Devour/Devoration...)
// - construit a partir de knowledge-base/02_SUBCLASSES_ALL.md (glossaires
// des 6 subclasses) et knowledge-base/01_DAMAGE_STACKING.md (regles de
// stacking). PAS EXHAUSTIF (~20 verbes les plus centraux), pensé pour être
// complété facilement (ajouter une entrée au tableau).
// EN: Catalog of element verbs (Scorch, Jolt, Devour...) - built from
// knowledge-base/02_SUBCLASSES_ALL.md (glossaries of the 6 subclasses) and
// knowledge-base/01_DAMAGE_STACKING.md (stacking rules). NOT EXHAUSTIVE
// (~20 most central verbs), meant to be easily extended (add a row to the
// array).

import { DamageElement } from "../types/build";

export type CategorieVerbe =
  | "debuff_ennemi" // effet infligé SUR l'ennemi (Weaken, Scorch, Jolt, Slow...)
  | "buff_soi" // effet appliqué SUR le Guardian (Devour, Radiant, Amplified...)
  /**
   * FR : ⚠️ AJOUT (24/08/2026) - mécanique de RESSOURCE, sans élément :
   * Charge d'armure (gagnée en ramassant un Orbe avec un mod de charge
   * équipé, consommée par les mods Surcharge/Font/Firepower...) et les mods
   * « Source de X » (énergie d'aptitude directe). Catégorie séparée de
   * buff_soi : une Charge d'armure n'est pas un buff temporaire sur le
   * Guardian, c'est une ressource qu'on accumule puis qu'on dépense.
   * EN: ⚠️ ADDED - RESOURCE mechanic, no element: Armor Charge (gained by
   * picking up an Orb with a charge mod equipped, spent by Surge/Font/
   * Firepower mods...) and "Source of X" mods (direct ability energy).
   */
  | "ressource";

export interface VerbeCatalogue {
  id: string;
  nomFr: string;
  nomEn: string;
  /**
   * FR : ⚠️ ÉLARGI (24/08/2026) - accepte `null` pour les mécaniques SANS
   * élément (Charge d'armure, mods « Source de X »). Avant cet ajout, tous
   * les verbes du catalogue étaient rattachés à un élément ; leur assigner
   * un élément arbitraire (ex: "solaire" pour un mod cinétique) aurait été
   * une donnée fausse, pas juste une approximation.
   * EN: ⚠️ WIDENED - accepts `null` for mechanics WITHOUT an element (Armor
   * Charge, "Source of X" mods). Assigning them a fake element would have
   * been wrong data, not just an approximation.
   */
  element: DamageElement | null;
  categorie: CategorieVerbe;
  /**
   * FR : ⚠️ AJOUT (24/08/2026) - champion étourdi par ce verbe, quand
   * confirmé par une citation en jeu (voir
   * `knowledge-base/22_CHAINES_DE_VERBES.md`). Rattaché directement au
   * verbe plutôt qu'une table séparée, pour éviter la même divergence que
   * les libellés d'élément avaient connue en étant dupliqués ailleurs.
   * Sert de 3e source anti-champion (Pilier 4), à côté des armes et
   * armures exotiques déjà en place.
   * EN: ⚠️ ADDED - champion stunned by this verb, when confirmed by an
   * in-game citation. Attached directly to the verb rather than a separate
   * table. Serves as Pillar 4's 3rd anti-champion source.
   */
  championEtourdi?: "surcharge" | "bloqueur" | "implacable";
  /** FR : mots-clés (normalisés sans accent en interne) pour détecter le verbe dans un texte de perk/aspect/fragment. / EN: keywords (internally accent-normalized) to detect the verb in perk/aspect/fragment text. */
  motsClesFr: string[];
  motsClesEn: string[];
  /**
   * FR : ⚠️ AJOUT (25/08/2026) - mots-clés à correspondance STRICTE (sur
   * frontière de mot), distincts de `motsClesFr`/`motsClesEn` qui restent en
   * SOUS-CHAÎNE. Trouvé sur données réelles : le mot-clé anglais `"cure"`
   * (Soin) matchait à tort « filobs**cure** », « oc**cure**nce »,
   * « pro**cure** » — 11 faux positifs, 0 vrai, sur les 7 artefacts.
   *
   * Les DEUX approches coexistent plutôt que de choisir l'une ou l'autre
   * globalement : la sous-chaîne reste indispensable pour les racines
   * volontairement tronquées (`suspend` doit capter « suspendues »,
   * `effiloch` doit capter « effilochant »), tandis que les mots courts et
   * complets (`cure`, `gel`...) ont besoin de la frontière de mot pour ne
   * pas matcher à l'intérieur d'un mot plus long sans rapport.
   *
   * Champ optionnel et vide par défaut : SEULS les mots-clés confirmés
   * problématiques y sont déplacés, pas une reclassification globale du
   * catalogue sans preuve - un mauvais classement dans l'autre sens
   * (marquer "strict" un mot-clé qui a en réalité besoin de sous-chaîne)
   * créerait des FAUX NÉGATIFS silencieux, aussi problématiques que les
   * faux positifs corrigés ici.
   *
   * EN: ⚠️ ADDED - STRICT (word-boundary) keywords, separate from
   * `motsClesFr`/`motsClesEn` which stay SUBSTRING-based. Found on real
   * data: the English keyword "cure" wrongly matched inside "filobscure",
   * "occurence", "procure" - 11 false positives, 0 true, across the 7
   * artifacts. BOTH approaches coexist rather than choosing one globally:
   * substring stays essential for intentionally-truncated roots, while
   * short complete words need word-boundary matching. Empty by default:
   * only CONFIRMED problematic keywords are moved here, not a blanket
   * reclassification without evidence.
   */
  motsClesStrictsFr?: string[];
  motsClesStrictsEn?: string[];
  /**
   * FR : ⚠️ AJOUT (25/08/2026) - ce que ce verbe PRODUIT parmi les AUTRES
   * verbes de ce catalogue, base du graphe de chaînes (Pilier 2). Un seul
   * sens stocké (ce qui est produit) ; ce qui est consommé se déduit en
   * cherchant qui produit quoi, sans dupliquer l'information dans les deux
   * sens - décision de conception du 25/08/2026, motivée par l'exemple
   * concret de `lib/scoring/contexte.ts` (données dupliquées, dérivées le
   * même jour). `conditionnel` porte la description officielle du
   * fragment/aspect requis, PAS son nom : c'est la description qui donne
   * l'effet, le nom peut changer sans que le mécanisme change (confirmé
   * par l'utilisateur) - la vérification cherchera cette description dans
   * les textes déjà extraits du build, avec le même principe de racines
   * que le reste du catalogue plutôt qu'une correspondance exacte.
   * Source exclusive : `knowledge-base/22_CHAINES_DE_VERBES.md`.
   * EN: ⚠️ ADDED - what this verb PRODUCES among the OTHER verbs in this
   * catalogue. Only one direction stored; `conditionnel` carries the
   * required fragment/aspect's DESCRIPTION, not its name - the name can
   * change without the mechanism changing.
   */
  produit?: { verbeId: string; conditionnel?: string }[];
  /**
   * FR : ⚠️ AJOUT (25/08/2026), ⚠️ ÉTENDU (25/08/2026 même jour) - type(s)
   * d'énergie d'aptitude que ce verbe génère, INDÉPENDAMMENT de sa
   * `categorie` principale. Sert de signal SÉPARÉ du score de chaînes,
   * nommé par type de ressource plutôt qu'un compteur générique.
   *
   * Structure changée d'un simple tableau de types vers un tableau
   * d'objets avec `conditionnel` optionnel, MÊME PRINCIPE que `produit` -
   * trouvé nécessaire via l'audit des fragments Solaire (25/08) : 3
   * fragments (Tison d'incandescence, Tison à calciner, Tison de
   * merveilles) donnent à des verbes normalement SANS ressource propre
   * (Embrasement, Blessure solaire) une production de ressource, mais
   * SEULEMENT si le fragment est équipé. Un champ purement inconditionnel
   * ne pouvait pas représenter ça sans mentir sur les verbes de base.
   *
   * EN: ⚠️ ADDED, ⚠️ EXTENDED same day - which ability-energy type(s) this
   * verb grants. Structure changed from a flat type array to an object
   * array with optional `conditionnel`, SAME PRINCIPLE as `produit` -
   * found necessary via the Solar fragment audit: 3 fragments grant a
   * resource to verbs that normally have none, but ONLY if equipped.
   */
  ressourceGeneree?: { type: "melee" | "grenade" | "classe" | "super" | "generique"; conditionnel?: string }[];
  /**
   * FR : ⚠️ AJOUT (26/08/2026, passe d'audit du scoring) - marque un verbe
   * dont le mot-clé est le NOM D'UNE CAPACITÉ (aspect, grenade) plutôt
   * qu'un terme de debuff/buff mentionné en prose. Pour ces verbes,
   * l'ANALYSE source/payoff par marqueurs textuels (`sourcePayoff.ts`) ne
   * peut structurellement JAMAIS fonctionner : dans un texte au format
   * "Nom — Description", le nom vient toujours AVANT sa propre
   * description, donc un marqueur comme "applique"/"inflige" décrivant ce
   * que fait la capacité ne peut être identifié comme signalant que LE NOM
   * s'applique - alors qu'équiper une capacité PORTANT ce nom EST en soi
   * la preuve qu'elle est source, sans avoir besoin qu'une phrase le dise.
   *
   * Trouvé sur un cas réel : Transcendance ne décrit dans son propre texte
   * que ce qui se passe UNE FOIS Transcendant (« Éliminer des cibles quand
   * vous êtes sous l'effet de Transcendance augmente sa durée » - un vrai
   * payoff, auto-entretenu), jamais un marqueur qui l'"applique" - la
   * mécanique d'obtention est un fonctionnement intrinsèque de la
   * sous-classe (accumulation d'énergie Lumière/Ténèbres), pas une phrase à
   * détecter. Sans ce champ, Transcendance ne peut jamais être `aSource`,
   * ce qui bloque TOUTE la chaîne en aval (grenades prismatiques →
   * Neutralisation/Ralentissement/etc.), quel que soit le texte réel.
   *
   * Quand `true`, `detecterVerbes` force `aSource = true` dès que le
   * mot-clé est mentionné (`nbMentions > 0`) dans les textes de DOCTRINE
   * (super/mêlée/grenade/classe/aspects/fragments) - PAS dans un perk
   * d'arme/armure/artefact qui ne ferait que CITER le nom en passant.
   * `aPayoff`/`aIndetermine` restent calculés normalement : si le texte
   * décrit aussi un vrai payoff (cas de Transcendance), le verbe peut très
   * bien finir classé "boucle" - source forcée, payoff détecté normalement.
   *
   * EN: ⚠️ ADDED (scoring audit pass) - marks a verb whose keyword is an
   * ABILITY'S OWN NAME rather than a debuff/buff term in prose. For these,
   * marker-based source/payoff analysis can structurally NEVER work: in a
   * "Name — Description" text, the name always precedes its description,
   * so a marker describing what the ability DOES can't be read as applying
   * to the NAME itself - yet equipping an ability WITH that name already
   * proves it's a source. Found via Transcendance, whose own text only
   * describes what happens ONCE Transcendent (a genuine, self-sustained
   * payoff) - never a marker "applying" it, since gaining it is an
   * intrinsic subclass mechanic, not a sentence to detect. Without this,
   * NO downstream chain could ever start regardless of the real text. When
   * `true`, `detecterVerbes` forces `aSource = true` as soon as the keyword
   * is mentioned in DOCTRINE texts only (not a weapon/armor/artifact perk
   * merely naming it in passing); `aPayoff`/`aIndetermine` stay computed
   * normally.
   */
  sourceImplicite?: boolean;
  /**
   * FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
   * force `aSource = true` pour CE verbe si un texte du build correspond à
   * l'une de ces phrases-signatures (vérifiées via `conditionVerifiee`,
   * mêmes garanties que les liens `produit`/`ressourceGeneree`
   * conditionnels : mots significatifs requis dans un MÊME texte, jamais
   * une supposition). Réservé à des exceptions PONCTUELLES et VÉRIFIÉES,
   * pas un mécanisme de contournement général comme `sourceImplicite`.
   *
   * Utilité : certaines phrases utilisent un marqueur ("vaincre",
   * "affecté par"...) dans un sens GÉNÉRIQUE ("tuer un ennemi", "combattants
   * concernés par CETTE capacité") plutôt que comme condition précise du
   * verbe consommé - notre heuristique de proximité les classe alors à tort
   * en payoff. Assouplir le marqueur globalement casserait des cas déjà
   * vérifiés ailleurs (ex : "Contre les cibles gelées, dégâts augmentés"
   * doit rester un vrai payoff) - une exception CIBLÉE, propre à cette
   * capacité précise, est plus sûre qu'un assouplissement général.
   *
   * Cas trouvés (voir CHANGELOG.md) : "Enfant des dieux anciens" (aspect
   * Arcaniste Abyssal) applique bien Neutralisation ("Les combattants
   * affectés PAR L'ÂME sont aussi brièvement neutralisés" - "affectés par"
   * fait référence à l'Âme, pas à la neutralisation elle-même) ; "Tir de
   * l'ombre : Carquois de Moebius" (Super Chasseur Abyssal) source bien
   * Charge d'armure ("Vaincre des cibles tenues en laisse crée des orbes
   * de puissance" - "vaincre" est utilisé au sens générique "tuer un
   * ennemi", pas comme condition de consommation d'un debuff déjà
   * appliqué).
   *
   * EN: ⚠️ ADDED (387-ability audit) - forces `aSource = true` for THIS
   * verb if a build text matches one of these signature phrases (same
   * verification guarantees as conditional `produit`/`ressourceGeneree`
   * links). Reserved for SPECIFIC, VERIFIED exceptions, not a general
   * bypass like `sourceImplicite`. Some phrases use a marker ("vaincre",
   * "affected by"...) in a GENERIC sense rather than as a precise
   * consumption condition, causing our proximity heuristic to misclassify
   * them as payoff. Loosening the marker globally would break cases
   * already verified elsewhere - a TARGETED exception is safer.
   */
  sourcesForcees?: string[];
  /** FR : résumé de la règle de stacking (source: 01_DAMAGE_STACKING.md). / EN: stacking rule summary (source: 01_DAMAGE_STACKING.md). */
  regleStacking: string;
}

export const CATALOGUE_VERBES: VerbeCatalogue[] = [
  // --- VOID ---
  {
    id: "weaken",
    nomFr: "Affaiblissement",
    nomEn: "Weaken",
    element: "abyssal",
    categorie: "debuff_ennemi",
    motsClesFr: ["affaibli"],
    motsClesEn: ["weaken"],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "volatile",
    nomFr: "Volatil",
    nomEn: "Volatile",
    championEtourdi: "bloqueur",
    element: "abyssal",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "volatil" seul est plus court que le
    // mot-clé anglais "volatile" (8 lettres), qui matche "volatile"/
    // "volatiles" et laisse le "s" du pluriel non surligné sur ce dernier.
    // Même catégorie de bug que "suspens"/"suspendues".
    // EN: ⚠️ FIXED - "volatil" alone is shorter than the English keyword
    // "volatile", which matches but leaves the plural "s" unhighlighted.
    motsClesFr: ["volatil", "volatile", "volatiles"],
    motsClesEn: ["volatile"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho de cessation) : "Éliminer des cibles volatiles crée
    // une Brèche abyssale."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "breche_abyssale", conditionnel: "eliminer des cibles volatiles cree une breche abyssale" }],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "suppression",
    nomFr: "Neutralisation",
    nomEn: "Suppression",
    championEtourdi: "surcharge",
    element: "abyssal",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "supprim" seul est plus court que le
    // mot-clé anglais "suppress" (8 lettres), qui matche "suppress-ion" et
    // laisse le "-ion" final non surligné. Même catégorie de bug que
    // "suspens"/"suspendues" signalée par l'utilisateur. Ajout du mot
    // français complet "suppression", identique à l'anglais dans ce cas.
    // EN: ⚠️ FIXED - "supprim" alone is shorter than the English keyword
    // "suppress" (8 letters), which matches "suppress-ion" and leaves the
    // final "-ion" unhighlighted. Same bug category as suspend/suspendues.
    motsClesFr: ["supprim", "suppression", "neutralis"],
    motsClesEn: ["suppress"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho d'autorité, confirmé par Facette de contrôle) :
    // "Éliminer des cibles neutralisées crée une Brèche abyssale."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "breche_abyssale", conditionnel: "eliminer des cibles neutralisees cree une breche abyssale" }],
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "Enfant des dieux anciens" (aspect Arcaniste Abyssal) applique bien
    // Neutralisation, mais était classé "payoff orphelin" à tort : "Les
    // combattants affectés PAR L'ÂME sont aussi brièvement neutralisés" -
    // notre heuristique de proximité voit "affecte par" juste avant
    // "neutralises" et conclut à un payoff, sans comprendre que "affectés
    // par" se rapporte à l'Âme (un autre nom), pas à la neutralisation
    // elle-même. Exception ciblée plutôt que d'assouplir "affecte par"
    // globalement (casserait le garde-fou "contre les cibles gelées").
    // EN: ⚠️ ADDED - "Enfant des dieux anciens" genuinely applies
    // Suppression, but was misclassified as an orphaned payoff: "affected
    // by" refers to a different noun (the Soul), not to suppression itself
    // - our proximity heuristic can't tell. Targeted exception rather than
    // loosening the marker globally.
    sourcesForcees: ["les combattants affectes par l'ame sont aussi brievement neutralises"],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "devour",
    ressourceGeneree: [{ type: "grenade" }],
    nomFr: "Dévoration",
    nomEn: "Devour",
    element: "abyssal",
    categorie: "buff_soi",
    motsClesFr: ["devoration"],
    motsClesEn: ["devour"],
    regleStacking: "Empowering Buff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "invisibilite",
    nomFr: "Invisibilité",
    nomEn: "Invisibility",
    element: "abyssal",
    categorie: "buff_soi",
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "invisible" (adjectif) manquait, seul le nom "invisibilite" était
    // couvert. Conséquence sérieuse : "Esquiver vous rend invisible."
    // (Esquive furtive, Chasseur Abyssal - une capacité DE BASE) n'était
    // même pas détectée du tout (0 mention), pas juste mal classée.
    // EN: ⚠️ ADDED - "invisible" (adjective) was missing, only the noun
    // form was covered. Serious consequence: "Dodging makes you invisible"
    // (a BASE-KIT Hunter ability) wasn't detected AT ALL.
    motsClesFr: ["invisibilite", "invisible"],
    motsClesEn: ["invisibility"],
    regleStacking: "Empowering Buff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "surbouclier",
    nomFr: "Surbouclier",
    nomEn: "Overshield",
    element: "abyssal",
    categorie: "buff_soi",
    motsClesFr: ["surbouclier"],
    motsClesEn: ["overshield"],
    regleStacking: "Empowering Buff — ne stack pas, seul le plus haut s'applique",
  },

  // --- ARC ---
  {
    id: "jolt",
    nomFr: "Secousse",
    nomEn: "Jolt",
    championEtourdi: "surcharge",
    element: "arc",
    categorie: "debuff_ennemi",
    motsClesFr: ["electrocut", "jolt", "secousse"],
    motsClesEn: ["jolt"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle ionique) : "Éliminer une cible qui subit des
    // Secousses ... crée une Piste ionique."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "piste_ionique", conditionnel: "eliminer une cible qui subit des secousses ou eliminer une cible en utilisant une charge eclair cree une piste ionique" }],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "aveuglement",
    nomFr: "Cécité",
    nomEn: "Blind",
    championEtourdi: "implacable",
    element: "arc",
    categorie: "debuff_ennemi",
    motsClesFr: ["aveugl", "cecit"],
    motsClesEn: ["blind"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle de brillance) : "Vaincre une cible touchée par
    // Cécité avec des dégâts de précision crée une explosion provoquant
    // Cécité." Auto-référence (le verbe se produit lui-même) : le graphe
    // la gère nativement, sans boucle infinie (le verbe est déjà marqué
    // atteint au moment où le lien est suivi).
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    // Self-reference: the graph handles it natively, no infinite loop.
    produit: [{ verbeId: "aveuglement", conditionnel: "vaincre une cible touchee par cecite avec des degats de precision cree une explosion provoquant cecite" }],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "amplifie",
    nomFr: "Amplifié",
    nomEn: "Amplified",
    element: "arc",
    categorie: "buff_soi",
    motsClesFr: ["amplifi"],
    motsClesEn: ["amplified"],
    // FR : ⚠️ AJOUT (26/08/2026) - production de ressource CONDITIONNELLE,
    // trouvée via l'audit des fragments Cryo-électrique (Étincelle
    // d'amplitude) : "Éliminer des cibles rapidement sous l'effet
    // d'Amplificateur créé un orbe de puissance." Même famille que les 3
    // cas trouvés hier sur Embrasement/Blessure solaire.
    // EN: ⚠️ ADDED - CONDITIONAL resource production, found via the
    // Cryo-electric fragment audit.
    ressourceGeneree: [
      { type: "super", conditionnel: "eliminer des cibles rapidement sous l'effet d'amplificateur cree un orbe de puissance" },
    ],
    regleStacking: "Empowering Buff — ne stack pas, seul le plus haut s'applique",
  },

  // --- SOLAR ---
  {
    id: "scorch",
    nomFr: "Blessure solaire",
    nomEn: "Scorch",
    element: "solaire",
    categorie: "debuff_ennemi",
    motsClesFr: ["consume", "scorch", "blessure solaire", "blessures solaires"],
    motsClesEn: ["scorch"],
    // FR : ⚠️ AJOUT (25/08/2026) - inconditionnel : seuil de cumul (100
    // stacks), pas un fragment/aspect à vérifier.
    produit: [{ verbeId: "ignition" }],
    // FR : ⚠️ AJOUT (25/08/2026) - production de ressource CONDITIONNELLE,
    // trouvée via l'audit des fragments Solaire (Tison à calciner).
    // Blessure solaire ne génère normalement AUCUNE ressource.
    // EN: ⚠️ ADDED - CONDITIONAL resource production, found via the Solar
    // fragment audit. Scorch normally generates NO resource.
    ressourceGeneree: [
      { type: "melee", conditionnel: "vaincre des cibles souffrant de blessures solaires octroie de l'energie de melee" },
    ],
    regleStacking: "Stacks jusqu'à un seuil, déclenche une Ignition — voir 01_DAMAGE_STACKING.md pour le détail",
  },
  {
    id: "ignition",
    nomFr: "Embrasement",
    nomEn: "Ignition",
    championEtourdi: "implacable",
    element: "solaire",
    categorie: "debuff_ennemi",
    motsClesFr: ["ignition", "embrasement"],
    motsClesEn: ["ignition"],
    // FR : ⚠️ AJOUT (25/08/2026) - lien conditionnel enfin comblé. La
    // description officielle du fragment Tison de charbon a été transmise
    // par l'utilisateur (capture d'écran DIM) : "Vos Embrasements solaires
    // infligent des Blessures solaires aux cibles touchées." Portion
    // distinctive retenue comme condition plutôt que la phrase intégrale -
    // assez précise pour ne matcher que ce fragment, assez robuste pour
    // tolérer une reformulation mineure du Manifest.
    // EN: ⚠️ ADDED - conditional link finally filled in. The official
    // description of the Ember of Ashes fragment was provided by the user.
    produit: [{ verbeId: "scorch", conditionnel: "embrasements solaires infligent des blessures solaires" }],
    // FR : ⚠️ AJOUT (25/08/2026) - 2 productions de ressource
    // CONDITIONNELLES, trouvées via l'audit des fragments Solaire.
    // Embrasement ne génère normalement AUCUNE ressource - ces deux
    // fragments lui en donnent une, chacun sous sa propre condition.
    // EN: ⚠️ ADDED - 2 CONDITIONAL resource productions, found via the
    // Solar fragment audit. Ignition normally generates NO resource.
    ressourceGeneree: [
      { type: "grenade", conditionnel: "eliminer des cibles avec des embrasements solaires confere de l'energie de grenade" },
      { type: "super", conditionnel: "eliminer rapidement plusieurs cibles avec des embrasements solaires genere un orbe de puissance" },
    ],
    regleStacking: "Explosion ponctuelle (payoff du Scorch), pas d'effet de stacking dans la durée",
  },
  {
    id: "radieux",
    nomFr: "Radiance",
    nomEn: "Radiant",
    championEtourdi: "bloqueur",
    element: "solaire",
    categorie: "buff_soi",
    motsClesFr: ["radieux", "radiance"],
    motsClesEn: ["radiant"],
    regleStacking: "Empowering Buff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "restauration",
    nomFr: "Restauration",
    nomEn: "Restoration",
    element: "solaire",
    categorie: "buff_soi",
    motsClesFr: ["restauration"],
    motsClesEn: ["restoration"],
    regleStacking: "Ne stack pas avec Healing Rift — la durée la plus longue obtenue est conservée au renouvellement",
  },
  {
    id: "soin",
    nomFr: "Soin",
    nomEn: "Cure",
    element: "solaire",
    categorie: "buff_soi",
    // FR : ⚠️ CORRIGÉ (25/08/2026) - "cure" retiré de motsClesFr : ce n'est
    // pas un vrai mot français ici (doublon inutile avec "soin", qui couvre
    // déjà les formes françaises réelles). Côté anglais, déplacé en
    // correspondance STRICTE : matchait à tort 11 perks sur les 7
    // artefacts (filobscure, occurence, procure), 0 vrai match.
    // ⚠️ SECOND problème trouvé EN TESTANT ce correctif (pas celui
    // demandé, mais sur la même entrée) : "soin" (nom) et "soign-" (racine
    // du verbe soigner) sont deux séquences DIFFÉRENTES en français -
    // elles divergent dès la 4e lettre ('n' contre 'g'). "soin" seul ne
    // couvrait donc AUCUNE forme conjuguée ("soigne", "soignez",
    // "soignent"). Ajouté "soign" comme racine distincte.
    // EN: ⚠️ FIXED - "cure" removed from motsClesFr. ⚠️ SECOND issue found
    // WHILE TESTING this fix: "soin" (noun) and "soign-" (verb stem) are
    // genuinely different letter sequences in French - "soin" alone never
    // matched any conjugated form of "soigner". Added "soign" as a
    // separate root.
    motsClesFr: ["soin", "soign"],
    motsClesEn: [],
    motsClesStrictsEn: ["cure"],
    regleStacking: "Effet instantané (à la pose), les stacks (x1/x2/x3) augmentent le montant soigné d'un coup",
  },

  // --- STASIS ---
  {
    id: "ralentissement",
    nomFr: "Ralentissement",
    nomEn: "Slow",
    championEtourdi: "implacable",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["ralenti"],
    motsClesEn: ["slow"],
    produit: [{ verbeId: "gel" }],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Murmure de réfraction) : "Vaincre des cibles ralenties ou
    // gelées vous confère de l'énergie de capacité de doctrine." Même
    // condition portée sur Gel ci-dessous.
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    ressourceGeneree: [{ type: "classe", conditionnel: "vaincre des cibles ralenties ou gelees vous confere de l'energie de capacite de doctrine" }],
    regleStacking: "Stacks jusqu'à un seuil qui déclenche le Gel",
  },
  {
    id: "gel",
    nomFr: "Gel",
    nomEn: "Freeze",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["gel", "gele"],
    motsClesEn: ["freeze", "frozen"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 nouveaux liens trouvés par audit de
    // fragments : Éclat stasique (Facette de contrôle : "Éliminer des
    // cibles gelées ... crée un éclat stasique") en plus de Brisure déjà
    // en place.
    // EN: ⚠️ ADDED - 2 new links found via fragment audit.
    produit: [
      { verbeId: "brisure" },
      { verbeId: "eclat_stasique", conditionnel: "eliminer des cibles gelees ou neutralisees cree un eclat stasique ou une breche abyssale" },
    ],
    // FR : ⚠️ AJOUT (26/08/2026) - Murmure de liens : "Éliminer des
    // cibles gelées génère un orbe de puissance" (énergie de Super), et
    // même condition de classe que Ralentissement ci-dessus (Murmure de
    // réfraction couvre les deux verbes dans une seule description).
    // EN: ⚠️ ADDED - conditional resources found via fragment audit.
    ressourceGeneree: [
      { type: "classe", conditionnel: "vaincre des cibles ralenties ou gelees vous confere de l'energie de capacite de doctrine" },
      { type: "super", conditionnel: "eliminer des cibles gelees genere un orbe de puissance" },
    ],
    regleStacking: "État binaire (geléou non) — payoff : Fracasser (Shatter)",
  },
  {
    id: "armure_givre",
    nomFr: "Armure de givre",
    nomEn: "Frost Armor",
    element: "stase",
    categorie: "buff_soi",
    motsClesFr: ["armure de givre", "armures de givre"],
    motsClesEn: ["frost armor"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Murmure de chaînes ("Éliminer des cibles pendant que
    // vous avez Armure de givre a une chance de créer un éclat stasique")
    // et Murmure d'inversion ("Quand vous avez l'Armure de givre, les
    // dégâts de mêlée ralentissent votre cible").
    // EN: ⚠️ ADDED - 2 conditional links found via fragment audit.
    produit: [
      { verbeId: "eclat_stasique", conditionnel: "eliminer des cibles pendant que vous avez armure de givre a une chance de creer un eclat stasique" },
      { verbeId: "ralentissement", conditionnel: "quand vous avez l'armure de givre les degats de melee ralentissent votre cible" },
    ],
    regleStacking: "Stacks (jusqu'à x5 ou x7 avec Whisper of Rime), décroît d'un stack toutes les 5s",
  },

  // --- STRAND ---
  {
    id: "rupture",
    nomFr: "Sectionnement",
    nomEn: "Sever",
    element: "filobscur",
    categorie: "debuff_ennemi",
    motsClesFr: ["rupture", "sectionn"],
    motsClesEn: ["sever"],
    produit: [{ verbeId: "enchevetrement" }],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "suspension",
    nomFr: "Suspension",
    nomEn: "Suspend",
    championEtourdi: "implacable",
    element: "filobscur",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "suspens" seul ne couvre que le NOM
    // (« suspension », « en suspens »), pas le VERBE conjugué
    // (« suspendu », « suspendues », « suspendre ») : le français a deux
    // racines différentes ici. Signalé par l'utilisateur : "suspendues"
    // n'était surligné que sur "suspend" (7 lettres), qui matchait par
    // COÏNCIDENCE via le mot-clé ANGLAIS "suspend" - ma fonction de
    // surlignage ne distingue pas la langue du texte, elle prend ce qui
    // matche. Ajout de la racine verbale française, pour un vrai match FR
    // plutôt qu'un accident via l'anglais.
    // EN: ⚠️ FIXED - "suspens" alone only covers the NOUN, not the
    // conjugated VERB - French has two different stems here. Reported by
    // the user: "suspendues" only highlighted "suspend" (7 letters), which
    // matched by COINCIDENCE via the ENGLISH keyword.
    motsClesFr: ["suspens", "suspend"],
    motsClesEn: ["suspend"],
    produit: [{ verbeId: "enchevetrement" }],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Fil d'esprit ("Éliminer des cibles en Suspension
    // confère de l'énergie de compétence de classe") et Fil de sagesse
    // ("Éliminer des cibles suspendues crée un orbe de puissance", énergie
    // de Super).
    // EN: ⚠️ ADDED - 2 conditional resources found via fragment audit.
    ressourceGeneree: [
      { type: "classe", conditionnel: "eliminer des cibles suspendues confere de l'energie de competence de classe" },
      { type: "super", conditionnel: "eliminer des cibles suspendues cree un orbe de puissance" },
    ],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "cotte_tissee",
    nomFr: "Maille tissée",
    nomEn: "Woven Mail",
    element: "filobscur",
    categorie: "buff_soi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - le renommage d'affichage
    // (Cotte tissée -> Maille tissée) n'avait pas mis à jour le MOT-CLÉ de
    // détection, qui ne matchait donc encore que "cotte tissee". Ajouté
    // "maille tissee", gardé l'ancien en repli au cas où un texte plus
    // ancien du Manifest utiliserait encore la formulation précédente.
    // EN: ⚠️ FIXED - the display rename didn't update the detection
    // KEYWORD, which still only matched "cotte tissee". Added
    // "maille tissee", kept the old one as a fallback.
    motsClesFr: ["maille tissee", "mailles tissees", "cotte tissee", "cottes tissees"],
    motsClesEn: ["woven mail"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Fil de transmutation) : "Sous l'effet de Maille tissée,
    // vos frags à l'arme spéciale créent un Enchevêtrement."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "enchevetrement", conditionnel: "sous l'effet de maille tissee vos frags a l'arme speciale creent un enchevetrement" }],
    regleStacking: "Empowering Buff — ne stack pas, seul le plus haut s'applique",
  },

  // FR : ⚠️ AJOUT (24/08/2026) - mécaniques de RESSOURCE (mods d'armure),
  // demande de l'utilisateur suite au diagnostic des stats d'armure.
  // Basées UNIQUEMENT sur ce que confirme knowledge-base/08_GAME_MECHANICS.md
  // (mécanisme Gain/Consommation) et les mods réellement vus dans les
  // diagnostics de l'utilisateur (Capuche d'eutechnologie, Rôdeur
  // nocturne) - pas de mod inventé ou supposé.
  // EN: ⚠️ ADDED - RESOURCE mechanics (armor mods), per user request
  // following the armor stat diagnostic. Based ONLY on what
  // 08_GAME_MECHANICS.md confirms and mods actually seen in the user's real
  // diagnostics - no invented or assumed mod.
  {
    id: "charge_armure",
    nomFr: "Charge d'armure",
    nomEn: "Armor Charge",
    element: null,
    categorie: "ressource",
    // FR : SOURCE — le gain est indirect (ramasser un Orbe avec un mod de
    // charge équipé), donc peu de texte de perk le formule explicitement.
    // On couvre les termes que la description d'un mod générateur emploie
    // réellement (Siphon, Reaper : "kill" + type d'arme/aptitude = Orbe).
    // FR : ⚠️ CORRIGÉ (26/08/2026, passe d'audit du scoring) - "orbe de
    // puissance" (le terme RÉEL employé par le jeu, "Orb of Power")
    // manquait de ce tableau, qui n'avait que "orbe de pouvoir" (coquille
    // de terminologie). Conséquence sérieuse : les 17 descriptions de
    // fragments transcrites lors de l'audit du 26/08 (dont Fil de tutelle,
    // Facette de détermination) disent TOUTES "orbe de puissance" - aucune
    // ne pouvait donc jamais donner `aSource=true` à charge_armure, ce qui
    // bloquait TOUTE la chaîne (Maille tissée, Charge éclair, Restauration,
    // Armure de givre, Surbouclier) dès le premier maillon. Signalé par
    // l'utilisateur : le test de Facette de détermination n'affichait rien.
    // EN: ⚠️ FIXED - "orbe de puissance" (the REAL term the game uses) was
    // missing from this list, which only had "orbe de pouvoir" (a
    // terminology typo). Serious consequence: all 17 fragment descriptions
    // transcribed during the 26/08 audit say "orbe de puissance" - none
    // could ever grant charge_armure `aSource=true`, blocking the entire
    // downstream chain from the very first link.
    motsClesFr: [
      "charge d'armure",
      "charges d'armure",
      "ramassage d'orbe",
      "orbe de lumiere",
      "orbe de pouvoir",
      "orbe de puissance",
      "orbes de puissance",
    ],
    motsClesEn: ["armor charge", "orb of power", "orb pickup"],
    // FR : ⚠️ AJOUT (26/08/2026) - liens conditionnels trouvés par audit
    // de fragments : Fil de tutelle ("Ramasser un orbe de puissance
    // confère Maille tissée") et Facette de détermination, exclusive au
    // Prismatique ("Ramasser un orbe de puissance confère Charge éclair,
    // Restauration, Armure de givre, Maille tissée ou Surbouclier, selon
    // le type de dégâts du Super équipé") - 4 verbes supplémentaires
    // confirmant et étendant le même mécanisme de ramassage d'orbe.
    // EN: ⚠️ ADDED - conditional links found via fragment audit, one
    // Prismatic-exclusive fragment confirming/extending the same orb
    // pickup mechanism across 5 subclass-specific verbs.
    produit: [
      { verbeId: "cotte_tissee", conditionnel: "ramasser un orbe de puissance confere maille tissee" },
      // FR : ⚠️ AJOUT (26/08/2026) - même lien, mais aussi vérifié via le
      // texte de Facette de détermination (Prismatique) : un build qui n'a
      // QUE ce fragment équipé (pas Fil de tutelle) doit quand même activer
      // le lien. Deux entrées vers la MÊME cible plutôt qu'une logique OU
      // dans un seul champ `conditionnel` (qui ne porte qu'une chaîne) -
      // `dejaAtteints` dans le moteur de détection évite un double
      // traitement si les deux conditions sont vraies à la fois.
      // EN: ⚠️ ADDED - same link, also verified via the Prismatic
      // fragment's text: a build with ONLY that fragment equipped should
      // still activate the link. Two entries to the SAME target rather
      // than an OR inside a single `conditionnel` string field.
      { verbeId: "cotte_tissee", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "charge_eclair", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "restauration", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "armure_givre", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "surbouclier", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
    ],
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "Tir de l'ombre : Carquois de Moebius" (Super Chasseur Abyssal)
    // source bien Charge d'armure, mais était classé "payoff orphelin" à
    // tort : "Vaincre des cibles tenues en laisse crée des orbes de
    // puissance" - "vaincre" est ici utilisé au sens générique ("tuer un
    // ennemi"), pas comme condition de consommation d'un debuff déjà
    // appliqué par CE verbe (le sens habituel de "vaincre" dans notre
    // liste de marqueurs payoff, ex : "vaincre une cible gelée"). Exception
    // ciblée plutôt que d'assouplir "vaincre" globalement (casserait sa
    // signification légitime ailleurs dans le catalogue).
    // EN: ⚠️ ADDED - this Super genuinely sources Charge d'armure, but was
    // misclassified as an orphaned payoff: "vaincre" is used here in a
    // generic sense ("kill an enemy"), not as a precise consumption
    // condition of an existing debuff. Targeted exception rather than
    // loosening the marker globally.
    sourcesForcees: ["vaincre des cibles tenues en laisse cree des orbes de puissance"],
    regleStacking: "Ressource à stacks (3 par défaut, jusqu'à 6 avec Charged Up) — se dégrade avec le temps, pas un buff/debuff classique",
  },
  {
    id: "surcharge_arme",
    nomFr: "Surcharge d'arme",
    nomEn: "Weapon Surge",
    element: null,
    categorie: "ressource",
    // FR : PAYOFF — consomme des Charges d'armure pour un bonus de dégâts
    // par type d'arme, tant que le stack est actif (mod passif, jambes).
    motsClesFr: ["surcharge"],
    motsClesEn: ["surge"],
    regleStacking: "Passif — bonus croissant par stack de Charge d'armure active, décroît avec le temps",
  },
  {
    id: "source_aptitude",
    nomFr: "Source d'aptitude",
    nomEn: "Ability Source",
    element: null,
    categorie: "ressource",
    // FR : mods "Source de Super"/"Source de Grenade" vus dans les
    // diagnostics réels de l'utilisateur (Capuche d'eutechnologie, Rôdeur
    // nocturne) : ils donnent de l'énergie d'aptitude à l'activation d'une
    // autre aptitude - source pure, pas de payoff à chercher.
    motsClesFr: ["source de super", "source de grenade", "source de melee", "siphon"],
    motsClesEn: ["ability source", "siphon"],
    // FR : ⚠️ AJOUT (25/08/2026) - les 3 types réunis dans une seule
    // entrée, moins précis que les autres verbes-ressources : cette entrée
    // conflate déjà plusieurs mods réels distincts ("Source de Super",
    // "Source de Grenade", "Source de Mêlée") en une seule ligne du
    // catalogue. Signal de ressource générique par nécessité, pas par
    // choix - une vraie séparation demanderait de scinder l'entrée en 3.
    // EN: ⚠️ ADDED - the 3 types combined in one entry, less precise than
    // other resource verbs since this entry already conflates several
    // distinct real mods into a single catalogue line.
    ressourceGeneree: [{ type: "super" }, { type: "grenade" }, { type: "melee" }],
    regleStacking: "Instantané à l'activation d'une aptitude — pas de stack",
  },

  // FR : ⚠️ AJOUT (24/08/2026) - 12 verbes identifiés dans
  // knowledge-base/22_CHAINES_DE_VERBES.md mais jamais portés dans ce
  // catalogue jusqu'ici. Noms anglais repris du fichier de documentation
  // (certains marqués "à confirmer" là-bas, gardés tels quels ici -
  // n'affecte que le libellé nomEn, pas la détection elle-même qui repose
  // sur motsClesFr/motsClesEn).
  // EN: ⚠️ ADDED - 12 verbs identified in the documentation file but never
  // ported into this catalogue until now.
  {
    id: "feu_follet",
    ressourceGeneree: [{ type: "grenade" }],
    nomFr: "Feu follet",
    nomEn: "Firesprite",
    element: "solaire",
    categorie: "ressource",
    motsClesFr: ["feu follet", "feux follets"],
    motsClesEn: ["firesprite"],
    // FR : ⚠️ AJOUT (25/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Tison de clémence) : "Ramasser un Feu follet octroie
    // Restauration." Racine distinctive retenue comme condition.
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "restauration", conditionnel: "ramasser un feu follet octroie restauration" }],
    regleStacking: "Ramassage au sol — pas de stack",
  },
  {
    id: "charge_eclair",
    ressourceGeneree: [{ type: "melee" }],
    nomFr: "Charge éclair",
    nomEn: "Ionic Charge", // à confirmer
    element: "arc",
    categorie: "ressource",
    motsClesFr: ["charge eclair", "charges eclair"],
    motsClesEn: ["ionic charge"],
    // FR : ⚠️ AJOUT (26/08/2026) - même condition que Secousse ci-dessus
    // (Étincelle ionique) : "... ou éliminer une cible en utilisant une
    // Charge éclair crée une Piste ionique."
    // EN: ⚠️ ADDED - same fragment as Jolt above, second trigger.
    produit: [{ verbeId: "piste_ionique", conditionnel: "eliminer une cible qui subit des secousses ou eliminer une cible en utilisant une charge eclair cree une piste ionique" }],
    regleStacking: "Cumuls — s'accumule tant qu'actif, effet à cumul maximum",
  },
  {
    id: "piste_ionique",
    ressourceGeneree: [{ type: "generique" }],
    nomFr: "Piste ionique",
    nomEn: "Ionic Traces",
    element: "arc",
    categorie: "ressource",
    motsClesFr: ["piste ionique", "pistes ioniques"],
    motsClesEn: ["ionic trace"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle de décharge) : "Ramasser une Piste ionique vous
    // confère un cumul de Charge éclair."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "charge_eclair", conditionnel: "ramasser une piste ionique vous confere un cumul de charge eclair" }],
    regleStacking: "Ramassage au sol — pas de stack",
  },
  {
    id: "breche_abyssale",
    ressourceGeneree: [{ type: "classe" }],
    nomFr: "Brèche abyssale",
    nomEn: "Void Breach", // à confirmer
    element: "abyssal",
    categorie: "ressource",
    motsClesFr: ["breche abyssale", "breches abyssales"],
    motsClesEn: ["void breach"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho de famine) : "Ramasser une Brèche abyssale ou un
    // orbe de puissance confère Dévoration."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "devour", conditionnel: "ramasser une breche abyssale ou un orbe de puissance confere devoration" }],
    regleStacking: "Ramassage au sol — pas de stack",
  },
  {
    id: "cristal_stase",
    nomFr: "Cristal de Stase",
    nomEn: "Stasis Crystal", // à confirmer
    element: "stase",
    categorie: "buff_soi",
    motsClesFr: ["cristal de stase", "cristaux de stase"],
    motsClesEn: ["stasis crystal"],
    produit: [{ verbeId: "gel" }, { verbeId: "ralentissement" }, { verbeId: "eclat_stasique" }],
    regleStacking: "Objet posé sur le terrain, détruisible — pas un buff/debuff classique",
  },
  {
    id: "brisure",
    nomFr: "Brisure",
    nomEn: "Shatter",
    championEtourdi: "implacable",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["brisure", "se brise", "se briser"],
    motsClesEn: ["shatter"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Murmure des fractures) : "Briser une cible gelée avec une
    // attaque de mêlée confère un cumul d'Armure de givre."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "armure_givre", conditionnel: "briser une cible gelee avec une attaque de melee confere un cumul d'armure de givre" }],
    regleStacking: "Instantané, à la rupture d'une cible gelée — pas de stack",
  },
  {
    id: "eclat_stasique",
    ressourceGeneree: [{ type: "melee" }],
    nomFr: "Éclat stasique",
    nomEn: "Shard of Stasis", // à confirmer
    element: "stase",
    categorie: "ressource",
    motsClesFr: ["eclat stasique", "eclats stasiques"],
    motsClesEn: ["stasis shard", "shard of stasis"],
    regleStacking: "Ramassage au sol — pas de stack",
  },
  {
    id: "enchevetrement",
    nomFr: "Enchevêtrement",
    nomEn: "Tangle", // à confirmer
    element: "filobscur",
    categorie: "ressource",
    // FR : "enchevetr" (sans accent, après normalisation) couvre
    // "Enchevêtrement", "Enchevêtré", "Enchevêtrés" via la racine commune.
    motsClesFr: ["enchevetr"],
    motsClesEn: ["tangle"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Fil de fureur ("Infliger des dégâts aux cibles avec
    // un Enchevêtrement vous confère de l'énergie de mêlée") et Facette
    // d'honneur, exclusive au Prismatique ("Détruire un Enchevêtrement
    // vous confère de l'énergie de Transcendance du même type").
    // EN: ⚠️ ADDED - 2 conditional links found via fragment audit.
    ressourceGeneree: [{ type: "melee", conditionnel: "infliger des degats aux cibles avec un enchevetrement vous confere de l'energie de melee" }],
    produit: [{ verbeId: "transcendance", conditionnel: "obtenir un objet elementaire ou detruire un enchevetrement vous confere de l'energie de transcendance du meme type" }],
    regleStacking: "Objet posé sur le terrain, détruisible ou ramassable — pas un buff/debuff classique",
  },
  {
    id: "brindille",
    nomFr: "Brindille",
    nomEn: "Threadling", // à confirmer
    element: "filobscur",
    categorie: "buff_soi",
    motsClesFr: ["brindille"],
    motsClesEn: ["threadling"],
    regleStacking: "Créature invoquée — pas un buff/debuff classique",
  },
  {
    // FR : ⚠️ AJOUT (24/08/2026) - trouvé par l'utilisateur dans le perk
    // « Éclat photonique » (Tablette de la Ruine), qui mentionne une cible
    // « épuisée » sans jamais définir le terme. Confirmé par l'utilisateur :
    // s'applique en perturbant les Champions Surchargés, ou via des armes
    // ayant les particularités d'origine « Psychopiratage » ou « Soumission ».
    // ⚠️ SANS ÉLÉMENT : contrairement aux autres états de combat du
    // catalogue, Épuisement n'appartient à aucune doctrine - il vient d'une
    // interaction avec un Champion ou d'une particularité d'arme. Lui
    // assigner un élément aurait été une donnée fausse (même raisonnement
    // que pour Charge d'armure).
    // Vérifié : c'est le SEUL état de combat mentionné dans les 7 artefacts
    // qui n'était pas déjà couvert par le catalogue (audit du 05/08).
    // EN: ⚠️ ADDED - found by the user in the "Éclat photonique" perk, which
    // mentions an "épuisée" target without ever defining it. Confirmed:
    // applied by disrupting Overload Champions, or via weapons with the
    // "Psychopiratage"/"Soumission" origin traits. NO ELEMENT: unlike other
    // combat states, this belongs to no subclass.
    id: "epuisement",
    nomFr: "Épuisement",
    nomEn: "Weaken?", // nom anglais non confirmé
    element: null,
    categorie: "debuff_ennemi",
    motsClesFr: ["epuis"],
    motsClesEn: [],
    regleStacking: "État de combat appliqué par perturbation d'un Champion Surchargé ou par particularité d'origine (Psychopiratage, Soumission)",
  },
  {
    id: "effilochage",
    nomFr: "Effilochage",
    nomEn: "Unravel",
    championEtourdi: "bloqueur",
    element: "filobscur",
    categorie: "debuff_ennemi",
    // FR : "effiloch" couvre "Effilochage", "effilochant", "effiloché" via
    // la racine commune.
    motsClesFr: ["effiloch"],
    motsClesEn: ["unravel"],
    produit: [{ verbeId: "enchevetrement" }],
    regleStacking: "Global Debuff — ne stack pas, seul le plus haut s'applique",
  },
  {
    id: "transcendance",
    nomFr: "Transcendance",
    nomEn: "Transcendence",
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["transcendance", "transcendant"],
    motsClesEn: ["transcendence"],
    // FR : ⚠️ AJOUT (26/08/2026) - voir la doc complète du champ sur
    // l'interface VerbeCatalogue. Sans ça, Transcendance ne peut jamais
    // être reconnue "source" (son propre texte ne décrit qu'un payoff
    // auto-entretenu), ce qui bloque toute chaîne prismatique en aval.
    // EN: ⚠️ ADDED - see the field's full doc on VerbeCatalogue. Without
    // it, Transcendance can never be "source", blocking the entire
    // downstream Prismatic chain.
    sourceImplicite: true,
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Facette de générosité) : "Éliminer des cibles quand vous
    // êtes sous l'effet de Transcendance crée des orbes de puissance pour
    // vos alliés" (énergie de Super).
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    ressourceGeneree: [{ type: "super", conditionnel: "eliminer des cibles quand vous etes sous l'effet de transcendance cree des orbes de puissance pour vos allies" }],
    regleStacking: "Durée prolongée par élimination — pas de stack classique",
  },
  {
    id: "grenade_prismatique_chasseur",
    nomFr: "Grenade prismatique (Chasseur)",
    nomEn: "Hail the Storm?", // nom anglais non confirmé, voir knowledge-base
    element: "prismatique",
    categorie: "buff_soi",
    // FR : nom en jeu confirmé par l'utilisateur : "Pic Grêle de Feu".
    motsClesFr: ["pic grele de feu"],
    motsClesEn: [],
    // FR : ⚠️ AJOUT (26/08/2026) - voir la doc complète sur
    // VerbeCatalogue. Ces 3 grenades sont identifiées par leur NOM propre
    // (pas un terme de debuff en prose) : sans ce champ, aucune ne peut
    // jamais être classée "source", bloquant les 4-2 verbes qu'elles
    // déclenchent en aval.
    // EN: ⚠️ ADDED - see full doc on VerbeCatalogue. These 3 grenades are
    // identified by their own NAME - without this, none can ever be
    // classified "source", blocking their downstream verbs.
    sourceImplicite: true,
    // FR : ⚠️ AJOUT (25/08/2026) - déclenche 4 verbes simultanément à
    // l'impact (2 par élément combiné), tous inconditionnels — confirmé
    // dans knowledge-base/22.
    produit: [{ verbeId: "scorch" }, { verbeId: "ignition" }, { verbeId: "ralentissement" }, { verbeId: "gel" }],
    regleStacking: "Disponible uniquement sous Transcendance — pas de stack",
  },
  {
    // FR : ⚠️ AJOUT (25/08/2026) - MANQUANTE jusqu'ici : seule la version
    // Chasseur avait été portée dans le code, bien que les 3 grenades
    // soient documentées et validées dans knowledge-base/22 depuis le
    // 24/08. Trouvé en construisant le graphe de chaînes.
    // EN: ⚠️ ADDED - MISSING until now: only the Hunter version had been
    // ported to code, even though all 3 grenades were already documented.
    id: "grenade_prismatique_titan",
    nomFr: "Grenade prismatique (Titan)",
    nomEn: "Titan Prismatic Grenade", // nom anglais non confirmé
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["piege electrifiant"],
    motsClesEn: [],
    sourceImplicite: true,
    produit: [{ verbeId: "suspension" }, { verbeId: "jolt" }],
    regleStacking: "Disponible uniquement sous Transcendance — pas de stack",
  },
  {
    id: "grenade_prismatique_arcaniste",
    nomFr: "Grenade prismatique (Arcaniste)",
    nomEn: "Warlock Prismatic Grenade", // nom anglais non confirmé
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["singularite glacee"],
    motsClesEn: [],
    sourceImplicite: true,
    // FR : ⚠️ Gel N'EST PAS listé ici, volontairement - confirmé par
    // l'utilisateur : c'est une conséquence EN CASCADE de Ralentissement
    // (via le lien ralentissement -> gel déjà posé plus bas dans ce
    // fichier), pas un 3e effet direct de cette grenade. L'ajouter ici en
    // double aurait été une redondance, pas une précision.
    // EN: ⚠️ Gel is NOT listed here on purpose - it's a CASCADING
    // consequence of Ralentissement, not a 3rd direct effect of this
    // grenade. Listing it here too would be redundant.
    produit: [{ verbeId: "suppression" }, { verbeId: "ralentissement" }],
    regleStacking: "Disponible uniquement sous Transcendance — pas de stack",
  },
];

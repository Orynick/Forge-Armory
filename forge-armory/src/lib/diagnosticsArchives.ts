// FR : Registre CENTRALISÉ des diagnostics (mode dev) résolus/archivés.
//
// ⚠️ POURQUOI CE FICHIER (24/08/2026) - demande de l'utilisateur : « on a
// beaucoup de boutons de diagnostics [...] cacher ceux qui ne sont plus
// utilisés ». Plutôt que de commenter `import.meta.env.DEV` un par un dans
// chaque composant (ce qui aurait dispersé l'information et rendu la
// réactivation fastidieuse), un registre unique : un diagnostic archivé
// passe à `false` ICI, sans toucher au composant qui le contient. Pour
// réactiver un diagnostic, changer sa valeur à `true` - le code du bouton
// reste intact, prêt à resservir.
//
// EN: CENTRALISED registry of resolved/archived dev-mode diagnostics.
// Rather than commenting `import.meta.env.DEV` individually in each
// component, a single registry: an archived diagnostic flips to `false`
// HERE, without touching the component. Flip back to `true` to reactivate -
// the button's code stays intact, ready to be used again.
export const DIAGNOSTICS_ACTIFS = {
  /** FR : "Tester l'insertion de plug" (GrilleDoctrine) — répondait à "peut-on équiper une doctrine complète via l'API ?". Réponse obtenue (non), le rappel manuel après équipement existe depuis en conséquence. / EN: answered "can a full subclass be equipped via the API?" (no) - the manual reminder popup exists because of this answer. */
  testInsertionPlug: false,

  /** FR : capacité en fragments par aspect (GrilleDoctrine) — confirmé correct par les tests réels de l'utilisateur. / EN: fragment capacity per aspect - confirmed correct by the user's real tests. */
  capaciteFragmentsAspect: false,

  /** FR : élément figé (Filobscur/Stase) d'un loadout — a permis de trouver le décalage d'énumération (Raid=5 manquant), résolu depuis le tout début de la session. Masqué le 25/08 à la demande de l'utilisateur. / EN: frozen element - found the enum offset bug, fixed since the very start of the session. Hidden on 25/08 at the user's request. */
  elementFigeLoadout: false,

  /** FR : état brut des triomphes Solo Flawless — a permis de trouver le bug Flèche de la vigie (characterRecords, pas profileRecords), résolu depuis. Masqué le 25/08 à la demande de l'utilisateur. / EN: raw triumph state - found the Spire of the Watcher bug, fixed since. Hidden on 25/08 at the user's request. */
  etatBrutTriomphes: false,
  /** FR : ⚠️ AJOUT (20/10/2026, v0.4.14) - vue « Carrière » : liste les statIds BRUTS réellement retournés par GetHistoricalStats (allTime, characterId = 0) pour figer la sélection des stats affichées sur des données réelles (même démarche que le composant 310 et les filigranes de saison). Une fois la sélection figée et validée par l'utilisateur, remettre à false. / EN: Career view - raw statIds diagnostic. */
  statIdsCarriere: true,

  /** FR : ✅ RÉSOLU (24/09/2026) - chemins JSON d'une recherche (RechercheManifest), avec le verdict de la recherche normale par objet (affiché / filtré / masqué). A servi à identifier puis vérifier le filtre anti-dialogue (`flavorText`), confirmé en jeu par l'utilisateur le 24/09. Masqué, mais conservé : à remettre à `true` si une réplique ou un texte sans rapport réapparaît un jour dans les résultats, pour identifier son champ avant d'étendre le filtre. / EN: ✅ RESOLVED - JSON paths of a search with the normal search's verdict per item; used to identify and then verify the anti-dialogue filter, confirmed in game on 24/09. Hidden but kept: set back to `true` if unrelated text ever reappears in results. */
  diagnosticCheminsJson: false,

  /** FR : recherche des triomphes Flawless — les 11 hashes ont été trouvés et figés dans triomphesSoloFlawless.ts. / EN: Flawless triumph search - all 11 hashes found and hardcoded. */
  rechercheTriomphesFlawless: false,

  /** FR : ⚠️ LIMITATION CONFIRMÉE (26/08) - `DestinyArtifactDefinition`
   * (la table lue par cette extraction) n'expose que l'ANCIEN système
   * d'artefact (5 paliers, 35 perks, un seul artefact actif par saison) —
   * incompatible avec le système actuel (7 artefacts, 3 paliers, 21 perks
   * chacun). Testé sur Outillage de Curiosité : les 35 perks extraits ne
   * correspondent à AUCUN des 21 déjà en code, confirmé par l'utilisateur
   * comme un souci déjà rencontré, pas une confusion d'artefact. Ma
   * mention d'hier ("a servi aux traductions officielles") était donc
   * fausse — les traductions viennent des fichiers texte fournis
   * directement par l'utilisateur, pas de cette extraction. Bouton
   * conservé actif (peut redevenir utile si Bungie remet la table à jour),
   * mais chantier des icônes de perks abandonné pour l'instant par cette
   * voie (voir TODO).
   * EN: ⚠️ CONFIRMED LIMITATION - the table this reads only exposes the
   * OLD artifact system (5 tiers, 35 perks, one active artifact per
   * season) - incompatible with the current system. My note from
   * yesterday claiming this button had produced the official translations
   * was WRONG - those came from text files the user provided directly.
   */
  extraireArtefactActif: true,

  /** FR : contenu du Manifest pour un artefact — a confirmé le cul-de-sac (structure héritée, 5 paliers), la traduction se fait à la main depuis. / EN: Manifest content for an artifact - confirmed the dead end, translation is now done by hand. */
  diagnosticManifestArtefact: false,

  /** FR : ⚠️ ACTIF - compare les 3 hashes candidats par artefact pour identifier lequel a une vraie icône. Bouton invisible jusqu'ici : imbriqué par erreur dans le bloc de diagnosticManifestArtefact, déjà archivé. / EN: ⚠️ ACTIVE - compares the 3 candidate hashes per artifact. Was invisible until now: wrongly nested inside the already-archived diagnosticManifestArtefact block. */
  diagnosticHashesArtefact: true,

  /** FR : correspondances anti-champion brutes sur une arme (SelecteurInventaire) — ancien, jamais réutilisé depuis sa création. / EN: raw anti-champion matches on a weapon - old, never reused since creation. */
  diagnosticAntiChampionArme: false,

  /** FR : stats brutes d'une pièce d'armure (SelecteurInventaire) — a permis de trouver et corriger le bug du masterwork puis des fragments, confirmé résolu. / EN: raw armor piece stats - found and fixed the masterwork then fragment bugs, confirmed resolved. */
  diagnosticStatsArmure: false,
  /** FR : hashes bruts de doctrine (Super/Mêlée/Grenade/Classe/Saut) sur chaque loadout affiché — a permis de trouver le bug du Super non sélectionné. Gardé actif "au cas où" jusqu'ici (demande explicite antérieure) ; masqué le 25/08, l'utilisateur revenant sur cette décision pour masquer tous les diagnostics des Loadouts. / EN: raw doctrine hashes - found the unselected-Super bug. Kept active "just in case" until now; hidden on 25/08 as the user reversed that earlier decision. */
  hashesDoctrineComplets: false,

  /** FR : définition complète d'un triomphe (Le Trône brisé) — a permis de confirmer que rewardItems est vide, plus besoin depuis. Masqué le 25/08 à la demande de l'utilisateur. / EN: full triumph definition - confirmed rewardItems is empty, no longer needed. Hidden on 25/08 at the user's request. */
  definitionCompleteTriomphe: false,

  /** FR : vérification des 11 emblèmes (nom, icône simple, image large) — a permis de trouver les 2 hashes erronés (Prophétie, Dogme fragmenté), tous deux corrigés depuis. Masqué le 25/08 à la demande de l'utilisateur. / EN: verification of the 11 emblems - found the 2 wrong hashes, both fixed since. Hidden on 25/08 at the user's request. */
  verificationEmblemes: false,

  /** FR : ⚠️ ACTIF (26/08) - dump texte de toutes les options de Super/
   * Mêlée/Grenade/Saut/Compétence de classe/Aspects d'une sous-classe, pour
   * l'audit du texte réel des capacités de base (voir la discussion sur les
   * "identités de capacité" et l'asymétrie source/payoff, DEVLOG.md).
   * Recurring workflow tool, PAS un diagnostic ponctuel résolu - reste actif
   * tant que l'audit progresse élément par élément.
   * EN: ⚠️ ACTIVE - text dump of all ability options for a subclass, for
   * auditing base-kit ability text. Recurring workflow tool, not a
   * one-off resolved diagnostic - stays active while the audit progresses.
   */
  diagnosticTextesDoctrine: true,

  /**
   * FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - 🔍 « Copier le diagnostic des icônes de doctrine » (GrilleDoctrine, `npm run dev` seulement) : bug signalé le 12/10/2026, « en Filobscur, les icônes de saut et de compétence de classe ont un fond bleu (Stase) au lieu de vert ». Les icônes viennent
   * telles quelles du Manifest (aucune fusion par nom entre éléments dans le code) : ce diagnostic donne, pour la sous-classe choisie, les prises (sockets) de la sous-classe avec leurs listes d'options (partagées ou non) et, pour chaque option, son objet, son icône brute et sa catégorie, afin de comparer la
   * Stase et le Filobscur. À lancer pour LES DEUX et à copier. Reste actif jusqu'à la résolution du bug. EN: ⚠️ ADDED - dumps the sockets/plug sets and each option's icon data for the chosen subclass, to compare Stasis and Strand.
   */
  diagnosticIconesDoctrine: true,

  /** FR : ✅ RÉSOLU (06/09/2026) - dump complet du pipeline du Pilier 2
   * (hashes du build -> lecture directe vs obtenirDescriptionComplete ->
   * textes transmis -> verbes détectés -> chaînes). Ajouté le 31/08 parce
   * que le problème des aspects était remonté 2 fois et que le 1er
   * correctif reposait sur une hypothèse jamais vérifiée sur un vrai
   * Manifest. VERDICT : l'hypothèse était BONNE - sur "Esquive furtive",
   * la lecture directe renvoie 0 caractère (VIDE) et
   * `obtenirDescriptionComplete` renvoie bien les 29 caractères du texte
   * réel, porté par 1 perk lié. Le correctif du 27/08 était donc correct,
   * il manquait seulement sa vérification sur données réelles. Masqué,
   * mais conservé : c'est l'outil le plus rapide pour trancher tout futur
   * écart entre ce que l'écran affiche et ce que le score lit.
   * EN: ✅ RESOLVED - full Pillar 2 pipeline dump. VERDICT: the 27/08
   * hypothesis was CORRECT - direct read returns 0 chars on a real
   * aspect, `obtenirDescriptionComplete` returns the real text from its
   * linked perk. Hidden but kept: fastest way to settle any future gap
   * between what the screen shows and what the score reads. */
  diagnosticPilier2: false,

  /** FR : ✅ ARCHIVÉ (01/10/2026) - bouton « simuler l'expiration de session » (DashboardPage). Test confirmé par l'utilisateur le 01/10/2026 (bannière apparue seule, et aussi après une vraie expiration de plus d'une heure). Remettre à true pour revérifier la bannière sans attendre ~1 h. / EN: ✅ ARCHIVED - "simulate session expiry" button; test confirmed. Set back to true to re-check. */
  simulerExpirationSession: false,

  /** FR : ⚠️ RÉACTIVÉ (05/10/2026) - contrôle de l'anti-champion des ARMES EXOTIQUES (DashboardPage), pour repérer les armes OUBLIÉES de la liste de référence de l'utilisateur : son rapport liste les exotiques du Manifest absentes de la liste, et les noms de la liste sans arme correspondante dans le jeu. Mode développement seulement. À archiver (false) une fois le rapport exploité. (Archivé le 01/10/2026, réactivé à la demande de l'utilisateur : « tu vois d'autres armes qui ont été oubliées ? ») / EN: ⚠️ RE-ENABLED - exotic anti-champion check, to find weapons MISSING from the user's reference list. Dev mode only. Archive once the report is used. */
  controleAntiChampionExotiques: true,

  /** FR : ⚠️ AJOUT (05/10/2026) - contrôle des ICÔNES DES PERKS D'ARTEFACT (DashboardPage) : vérifie, une fois et à la demande, si le Manifest de Bungie contient l'icône des 147 perks (aucune n'est enregistrée), et produit un rapport + les icônes trouvées. Mode développement seulement. À archiver (false) une fois les icônes figées dans les données. / EN: ⚠️ ADDED - artifact perk icons check: verifies once, on demand, whether Bungie's Manifest holds the 147 perks' icons. Dev mode only. Archive once the icons are baked into the data. */
  controleIconesPerksArtefact: true,
} as const;

# À tester — §2.1 lien armure → score (branche draft-armure-score)

> Charge le Manifest et ton inventaire. Chaque case = une vérification ; dis-moi ce qui est FAUX ou MANQUANT, le reste est validé.
> ⚠️ Rappel : les mods simulés ne sont jamais appliqués en jeu — le score et Mon Build réagissent localement.

## La boucle complète (Forge → score)

| ☐ | # | Test | Attendu |
|---|---|------|---------|
| ☐ | 1 | **Simuler un mod** : Forge → Inventaire → Armures → ouvre une armure qui est dans Mon Build, simule un mod qui change les stats (ex. mod de santé → mod de classe) | La fenêtre montre « avant → après » comme avant |
| ☐ | 2 | **Le score bouge** : retourne sur Build Analyzer sans fermer l'appli | Le Pilier 5 (Statistiques) et/ou le score global **changent en temps réel**. ⚠️ Note : le score est arrondi — un petit échange à total constant peut ne pas bouger le NOMBRE ; les stats du pilier, elles, changent. Teste avec un mod qui change vraiment le profil |
| ☐ | 3 | **Mon Build** : ouvre la fenêtre Détails de cette armure dans Mon Build | Badge/marque « simulé » visible ; les stats affichées sont les SIMULÉES |
| ☐ | 4 | **Avertissement d'équipement** : tente d'équiper cette armure en jeu | Le message dit que les mods SIMULÉS ne sont pas appliqués en jeu (l'armure réelle sera équipée) |
| ☐ | 5 | **Retour Forge depuis Mon Build** : bouton « Forge » de la fenêtre Détails | La Forge ouvre l'armure avec ses mods RÉELS cochés (✓), pas les simulés |
| ☐ | 6 | **Effacer la simulation** (bouton « Revenir à l'équipement réel » dans la Forge) | Le score retombe à sa valeur réelle, le badge disparaît |

## Cas annexes

| ☐ | # | Test | Attendu |
|---|---|------|---------|
| ☐ | 7 | Simuler un mod d'armure SANS Manifest chargé | Pas d'erreur ; le score ne bouge pas (les armures ont besoin du Manifest pour recalculer) ; les ARMES simulées continuent de fonctionner |
| ☐ | 8 | Deux armures identiques dans Mon Build, une seule simulée | Seule la bonne réagit ; l'autre garde ses stats réelles |
| ☐ | 9 | Enregistrer le build puis le recharger | Le build ENREGISTRÉ garde toujours ses stats RÉELLES (la simulation ne s'enregistre jamais) |

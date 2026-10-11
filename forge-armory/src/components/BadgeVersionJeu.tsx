// FR : ⚠️ AJOUT (05/10/2026, v0.3.0) - affichage de la VERSION DE DESTINY 2 prise en compte, de la date du patch et du
// NIVEAU DES CORRECTIFS, tout en haut de l'appli, à l'extrême droite du titre (demandes de l'utilisateur). Les valeurs
// viennent de `data/versionJeu.ts` (source unique). Discret : trois petites lignes alignées à droite ; la deuxième (saison et
// date du patch) est en ambre, la troisième (niveau des correctifs) en gris ; l'infobulle détaille la situation.
// EN: ⚠️ ADDED - the Destiny 2 version taken into account, the patch date and the HOTFIX LEVEL, at the far right of the title.
// Line 2 (season and patch date) is amber, line 3 (hotfix level) is grey.

import { VERSION_JEU, formaterDatePatch, infobulleVersionJeu, libelleCorrectifs, versionEffective } from "../data/versionJeu";

const COULEUR_AMBRE = "#d6a95a";
const COULEUR_GRIS = "#7d7a70";

export default function BadgeVersionJeu() {
  const correctifs = libelleCorrectifs();
  return (
    <div title={infobulleVersionJeu()} // FR : `maxWidth: 100%` - sur une fenêtre très étroite, les lignes passent à la ligne au lieu de déborder du cadre
      // (défaut trouvé à l'essai à 420 px avec une police large : la 3e ligne faisait 395 px pour 372 px disponibles).
      // EN: `maxWidth: 100%` - on a very narrow window, lines wrap instead of overflowing.
      style={{ textAlign: "right", lineHeight: 1.4, cursor: "help", flex: "0 0 auto", marginLeft: "auto", maxWidth: "100%" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7aa2f7" }}>
        Destiny 2 · version {versionEffective()}
      </div>
      {/* FR : ⚠️ CHANGÉ (05/10/2026, demande de l'utilisateur) - couleurs INVERSÉES entre les lignes 2 et 3 : la ligne du milieu (nom de la
      saison et date du patch) est en AMBRE, la ligne du niveau des correctifs en GRIS. La couleur du niveau ne signale donc plus à elle
      seule que des correctifs sont en attente : le texte le dit (« aucun intégré · dernier publié : ... »).
      EN: ⚠️ CHANGED - colours SWAPPED between lines 2 and 3: season name and patch date in AMBER, hotfix level in GREY. */}
      <div style={{ fontSize: "0.78rem", color: COULEUR_AMBRE }}>
        {VERSION_JEU.nom} · patch du {formaterDatePatch(VERSION_JEU.datePatch)}
      </div>
      {correctifs && <div style={{ fontSize: "0.74rem", color: COULEUR_GRIS }}>{correctifs}</div>}
    </div>
  );
}

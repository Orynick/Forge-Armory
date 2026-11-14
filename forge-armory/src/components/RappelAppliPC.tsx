// FR : ⚠️ AJOUT (08/11/2026, demande de l'utilisateur, aperçus validés sur le canevas : « il faut qu'il soit visible aussi en étant connecté, au même endroit ») - la ligne « Vous préférez l'application PC ? Télécharger pour Windows », en BAS de la carte « Connexion à Bungie », AU MÊME ENDROIT que l'on soit connecté ou non (dans la carte connectée, la grille la place automatiquement sur toute la largeur, sous le reste). Affichée seulement sur le SITE, hors appli installée, hors petit écran, et quand un lien https est réglé : voir `lib/rappelAppliPC.ts`. Le lien s'ouvre dans un nouvel onglet.
// EN: ⚠️ ADDED - the "Prefer the PC app? Download for Windows" line at the bottom of the connection card, same place whether connected or not.
import { useEffect, useState } from "react";
import { estBureau } from "../lib/bungie/oauth";
import { doitAfficherRappelAppliPC, lienTelechargementPC, REQUETE_PETIT_ECRAN } from "../lib/rappelAppliPC";
import { urlVisuel } from "../lib/visuelsForge";

/** FR : nom accessible du bouton (le texte du visuel est en tracés) : contient le texte visible « Télécharger l'application ». */
export const LIBELLE_TELECHARGEMENT = "Télécharger l'application Forge Armory pour Windows (.exe)";

/** FR : vrai dans le build WEB (constante `__WEB__` posée par vite.config.ts) ; faux si elle n'existe pas (tests, appli installée). */
const estVersionWeb = (): boolean => typeof __WEB__ !== "undefined" && __WEB__ === true;

function usePetitEcran(): boolean {
  const lire = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(REQUETE_PETIT_ECRAN).matches;
  const [petit, setPetit] = useState(lire);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(REQUETE_PETIT_ECRAN);
    const maj = () => setPetit(mq.matches);
    mq.addEventListener?.("change", maj);
    return () => mq.removeEventListener?.("change", maj);
  }, []);
  return petit;
}

interface Props {
  /** FR : réglages injectables pour les tests ; par défaut, l'état réel de l'appli. */
  web?: boolean;
  bureau?: boolean;
  lien?: string;
}

export default function RappelAppliPC({ web = estVersionWeb(), bureau = estBureau(), lien = lienTelechargementPC() }: Props) {
  const petitEcran = usePetitEcran();
  if (!doitAfficherRappelAppliPC({ web, bureau, petitEcran, lien })) return null;
  return (
    <div className="connexion-rappel-appli-pc" data-rappel-appli-pc="" style={{ borderTop: "1px solid #2a2e38", marginTop: "0.6rem", paddingTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#9a968a" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7aa2f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 19h14" /></svg>
      <span>Vous préférez l'application PC ?</span>
      {/* FR : ⚠️ CHANGÉ (12/11/2026, archive « telechargement-concept-3 ») - le lien est le BOUTON DE LA CHARTE « Télécharger l'application » (papillon + pastille de téléchargement) : image de repos, et image lumineuse au SURVOL et au focus clavier (règles `.lien-telecharger-appli` dans index.css) ; 3,5 rem (56 px) de haut, le bas de la fourchette conseillée (56 à 80 px). Texte en tracés : l'`aria-label` porte le nom complet. / EN: ⚠️ CHANGED - the link is the charter's "Download the app" button, with a hover image. */}
      <a href={lien} target="_blank" rel="noopener noreferrer" data-lien-appli-pc="" className="lien-telecharger-appli" aria-label={LIBELLE_TELECHARGEMENT} title={LIBELLE_TELECHARGEMENT}>
        <img className="lien-telecharger-appli__repos" src={urlVisuel("actions.telecharger-application.repos")} alt="" width={355} height={56} draggable={false} />
        <img className="lien-telecharger-appli__survol" src={urlVisuel("actions.telecharger-application.selectionne")} alt="" width={355} height={56} draggable={false} />
      </a>
    </div>
  );
}

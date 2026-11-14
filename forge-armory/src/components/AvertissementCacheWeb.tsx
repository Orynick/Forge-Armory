// FR : ⚠️ AJOUT (14/11/2026, chantier draft-avertissement-cache-web) - BANDEAU « Builds conservés dans le cache de ce navigateur », affiché en HAUT du panneau Load-outs (les DEUX présentations : tiroir latéral et onglet « Load-outs » partagent ce panneau), VERSION WEB UNIQUEMENT (`__WEB__`, constante posée par vite.config.ts pour le build Netlify — jamais l'appli installée, jamais le dev local). Raccourci « ⬇ Exporter en JSON » : ouvre la fenêtre « Exporter... » existante du DERNIER build sauvegardé (premier de la liste) — le JSON est réimportable ici OU dans l'application installée. Coche « Ne plus afficher » : mémorisée dans le localStorage (lib/avertissementCacheWeb.ts). Pas de bouton de fermeture : la coche suffit (décision de l'utilisateur du 14/11/2026).
// EN: ⚠️ ADDED - "builds kept in the browser cache" banner, top of the Load-outs panel (both presentations), WEB version only, with a direct JSON-export shortcut and a "don't show again" checkbox.
import { useState } from "react";
import { doitAfficherAvertissementCacheWeb, ecrireNePlusAfficher, lireNePlusAfficher, StockageSimple, TITRE_AVERTISSEMENT, TEXTE_AVERTISSEMENT } from "../lib/avertissementCacheWeb";

interface Props {
  /** FR : réglages injectables pour les tests ; par défaut, l'état réel de l'appli. / EN: injectable settings for tests. */
  web?: boolean;
  storage?: StockageSimple | null;
  /** FR : appelé par le raccourci « ⬇ Exporter en JSON » (ouvre la fenêtre d'export existante du dernier build sauvegardé). Absent : le bouton ne s'affiche pas. / EN: called by the JSON-export shortcut; hide the button when absent. */
  onExporterJson?: () => void;
}

export default function AvertissementCacheWeb({ web = typeof __WEB__ !== "undefined" && __WEB__ === true, storage = typeof localStorage !== "undefined" ? localStorage : null, onExporterJson }: Props) {
  const [nePlusAfficher, setNePlusAfficher] = useState(() => lireNePlusAfficher(storage));
  if (!doitAfficherAvertissementCacheWeb(web, nePlusAfficher)) return null;
  return (
    <div className="avertissement-cache-web" data-avertissement-cache-web="" role="note">
      <p className="avertissement-cache-web__titre">⚠️ {TITRE_AVERTISSEMENT}</p>
      <p className="avertissement-cache-web__texte">{TEXTE_AVERTISSEMENT}</p>
      <div className="avertissement-cache-web__actions">
        {onExporterJson && (
          <button type="button" onClick={onExporterJson} data-bouton-exporter-json="">
            ⬇ Exporter en JSON
          </button>
        )}
        <label className="avertissement-cache-web__coche">
          <input
            type="checkbox"
            checked={nePlusAfficher}
            data-coche-ne-plus-afficher=""
            onChange={(e) => {
              setNePlusAfficher(e.target.checked);
              ecrireNePlusAfficher(e.target.checked, storage);
            }}
          />
          Ne plus afficher cet avertissement
        </label>
      </div>
    </div>
  );
}

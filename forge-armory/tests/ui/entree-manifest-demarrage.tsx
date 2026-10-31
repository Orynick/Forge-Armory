// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - page de test du VRAI composant `RechercheManifest` (démarrage : vérification de la version, mise à jour automatique d'un Manifest périmé), avec des doubles pour le réseau, le disque et l'indexation (`tests/ui/faux/`). Le scénario vient de `window.__manifest`, défini par le test avant le chargement de la page. EN: ⚠️ ADDED - test page of the real RechercheManifest startup.
import { createRoot } from "react-dom/client";
import RechercheManifest from "../../src/components/RechercheManifest";

(window as unknown as { __charges: number }).__charges = 0;
createRoot(document.getElementById("racine")!).render(
  <div className="app-shell"><RechercheManifest onManifestCharge={() => { (window as unknown as { __charges: number }).__charges++; }} /></div>
);
(window as unknown as { __pret: boolean }).__pret = true;

// FR : ⚠️ AJOUT (12/10/2026, v0.4.0) - page de test du SÉLECTEUR DE VUES : le vrai composant `SelecteurVues` (4 boutons), un titre de bloc (pour comparer les hauteurs) et la page Forge en construction. / EN: selector test page.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import SelecteurVues, { VueApp } from "../../src/components/SelecteurVues";
import PageForge from "../../src/components/PageForge";
import TitreCategorie from "../../src/components/TitreCategorie";

function App() {
  const [vue, setVue] = useState<VueApp>("analyseur");
  return (
    <div className="app-shell">
      <TitreCategorie categorie="connexion" />
      <SelecteurVues vue={vue} onChanger={setVue} />
      {vue === "forge" && <PageForge db={null} />}
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<App />);
(window as unknown as { __pret: boolean }).__pret = true;

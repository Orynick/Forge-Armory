// FR : ⚠️ AJOUT (21/10/2026) - page de test du BLOC CONNEXION avec les boutons « Carrière » et « Accomplissements » : la structure de la carte de `DashboardPage` (classe `pilier-carte`, titre illustré, statut, ligne du compte, classes `pilier-carte--connexion` et `connexion-compte`) avec le VRAI composant `BoutonsVuesCompte`, le vrai titre et la vraie feuille de style (le test `connexion-boutons.py` vérifie en plus, dans le code source, que `DashboardPage` a bien cette structure). `?deconnecte=1` : état non connecté. `window.__clics` enregistre les clics. / EN: test page of the Connection block with the two buttons.
import { createRoot } from "react-dom/client";
import TitreCategorie from "../../src/components/TitreCategorie";
import BoutonsVuesCompte from "../../src/components/BoutonsVuesCompte";

const connecte = !new URLSearchParams(location.search).has("deconnecte");
(window as unknown as { __clics: string[] }).__clics = [];
const clic = (nom: string) => () => (window as unknown as { __clics: string[] }).__clics.push(nom);

function App() {
  return (
    <div className="app-shell">
      <div className={`pilier-carte${connecte ? " pilier-carte--connexion" : ""}`}>
        <h3><TitreCategorie categorie="connexion" /><span>{connecte ? "✅ connecté" : "◯ non connecté"}</span></h3>
        {!connecte && <p style={{ margin: "0 0 0.5rem" }}>Cliquez pour vous connecter — vous serez redirigé vers bungie.net.</p>}
        <div className="connexion-compte" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          {connecte && <span style={{ fontSize: "0.9rem", color: "#b7b3a8" }}>Compte : <strong style={{ color: "#e8e6df" }}>Orygamer#4497</strong></span>}
          {!connecte && <button>Connexion Bungie.net</button>}
          {connecte && (<><button>Se déconnecter</button><button>Tester la connexion</button></>)}
        </div>
        {connecte && <BoutonsVuesCompte onCarriere={clic("carriere")} onAccomplissements={clic("accomplissements")} />}
      </div>
    </div>
  );
}
createRoot(document.getElementById("racine")!).render(<App />);
(window as unknown as { __pret: boolean }).__pret = true;

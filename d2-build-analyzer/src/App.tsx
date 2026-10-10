// FR : Composant racine - routes principales, + garde-fou de configuration
// (message clair si .env.local est incomplet, plutot qu'un plantage confus
// plus tard dans le flux OAuth).
// EN: Root component - main routes, + config guard (clear message if
// .env.local is incomplete, instead of a confusing crash later in the
// OAuth flow).

import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { verifierConfig } from "./lib/bungie/config";

export default function App() {
  try {
    verifierConfig();
  } catch (e) {
    return (
      <div className="app-shell">
        <h1>Configuration incomplète</h1>
        <p>{(e as Error).message}</p>
        <p>
          Créez un fichier <code>.env.local</code> à la racine du projet (voir{" "}
          <code>.env.example</code> et le README) avant de relancer <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </div>
  );
}

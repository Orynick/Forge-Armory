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
import FondLogo from "./components/FondLogo";
import LecteurPodcast from "./components/LecteurPodcast";   // ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64) : lecteur podcast flottant du Legendarium (toujours visible, au-dessus du routeur)

export default function App() {
  try {
    verifierConfig();
  } catch (e) {
    // FR : ⚠️ CHANGÉ (21/09/2026) - message réécrit pour un débutant, en
    // prévision de l'archive invité "sans clé" : un invité qui lance l'appli
    // avant d'avoir créé son `.env.local` atterrit ici. L'ancien texte
    // listait des noms de variables techniques (VITE_BUNGIE_...) sans dire
    // quoi faire. Il renvoie maintenant au pas-à-pas du README et reprend
    // les deux pièges les plus fréquents. Le détail technique reste affiché,
    // en petit, pour le dépannage.
    // EN: ⚠️ CHANGED - message rewritten for beginners, ahead of the
    // "no-key" invite archive: points to the README walkthrough and the two
    // most common pitfalls; technical detail kept, small, for debugging.
    return (
      <>
        {/* FR : ⚠️ AJOUT (06/10/2026) - logo de fond fixe, voir components/FondLogo.tsx. / EN: fixed background logo. */}
        <FondLogo />
      <div className="app-shell">
        <h1>Configuration incomplète</h1>
        <p>
          L'appli n'a pas trouvé ses réglages Bungie : le fichier <code>.env.local</code> est absent ou
          incomplet. C'est normal au tout premier lancement.
        </p>
        <ol>
          <li>
            Suivez la section <strong>« Créer votre propre application Bungie »</strong> du fichier{" "}
            <code>NOTICE.md</code> (étapes A à D, une dizaine de minutes).
          </li>
          <li>
            Vérifiez que le fichier s'appelle exactement <code>.env.local</code> — et pas{" "}
            <code>.env.local.txt</code>.
          </li>
          <li>
            Relancez l'appli : <code>Ctrl</code> + <code>C</code> dans la fenêtre de commande, puis{" "}
            <code>npm run dev</code>.
          </li>
        </ol>
        <p style={{ fontSize: "0.75rem", color: "#7d7a70" }}>Détail technique : {(e as Error).message}</p>
      </div>
      </>
    );
  }

  return (
    <>
      {/* FR : ⚠️ AJOUT (06/10/2026) - logo de fond FIXE derrière tout le contenu, voir components/FondLogo.tsx. / EN: fixed background logo behind all content. */}
      <FondLogo />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </div>
      {/* FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64) - lecteur podcast flottant, monté AU-DESSUS des vues : visible où que l'on soit dans l'appli quand une page du Legendarium est publiée. Les demandes page suivante / retour page courante passent par le bus en mémoire (`lib/legendarium/podcast.ts`) : DashboardPage bascule la vue, Bibliotheque consomme la demande. / EN: floating podcast player, mounted ABOVE the views: visible anywhere in the app while a Legendarium page is published. Next-page / back-to-page requests go through the in-memory bus. */}
      <LecteurPodcast />
    </>
  );
}

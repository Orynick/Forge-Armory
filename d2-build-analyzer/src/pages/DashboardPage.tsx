// FR : Tableau de bord principal. Contient : le score du build de demo, et
// un bloc "Tester la connexion" qui fait le VRAI aller-retour avec l'API
// Bungie (comptes lies, personnages, coffre) une fois l'OAuth passe - c'est
// la seule facon de confirmer visuellement que la connexion fonctionne.
// EN: Main dashboard. Contains: the demo build's score, and a "Test
// connection" block that does the REAL round-trip with the Bungie API
// (linked accounts, characters, vault) once OAuth is done - it's the only
// way to visually confirm the connection actually works.

import { useEffect, useMemo, useState } from "react";
import { evaluerBuild } from "../lib/scoring/pillars";
import { demoBuild, demoExigences, demoMotsClesBuild } from "../data/demoBuild";
import PilierCarte from "../components/PilierCarte";
import { redirigerVersAutorisation, lireTokens, deconnecter } from "../lib/bungie/oauth";
import {
  recupererMembershipsActuels,
  recupererResumeProfil,
  DestinyMembership,
  ResumeProfil,
} from "../lib/bungie/api";
import { exporterVersDim } from "../lib/dim/export";
import RechercheManifest from "../components/RechercheManifest";

export default function DashboardPage() {
  // FR : OPTIMISATION - evaluerBuild() fait plusieurs calculs (5 piliers +
  // somme des stats) ; on ne le recalcule que si demoBuild change, pas à
  // chaque re-render (ex: quand on clique sur "Tester la connexion").
  // EN: OPTIMIZATION - evaluerBuild() runs several computations (5 pillars
  // + stat summing); only recompute it if demoBuild changes, not on every
  // re-render (e.g. when clicking "Test connection").
  const resultat = useMemo(
    () => evaluerBuild(demoBuild, demoExigences, demoMotsClesBuild),
    []
  );

  const [connecte, setConnecte] = useState(false);
  const [memberships, setMemberships] = useState<DestinyMembership[]>([]);
  const [resume, setResume] = useState<ResumeProfil | null>(null);
  const [erreurTest, setErreurTest] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    setConnecte(!!lireTokens());
  }, []);

  async function testerConnexion() {
    setEnCours(true);
    setErreurTest(null);
    setResume(null);
    try {
      const comptes = await recupererMembershipsActuels();
      setMemberships(comptes);
      if (comptes.length === 0) {
        setErreurTest("Connecté, mais aucun compte Destiny lié trouvé sur ce compte Bungie.net.");
        return;
      }
      // FR : on prend le premier compte lié par simplicité ; à affiner si
      // vous jouez sur plusieurs plateformes non reliées par Cross Save.
      // EN: we take the first linked account for simplicity; refine if you
      // play on several platforms not linked via Cross Save.
      const resumeProfil = await recupererResumeProfil(comptes[0]);
      setResume(resumeProfil);
    } catch (e) {
      setErreurTest((e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  function gererDeconnexion() {
    deconnecter();
    setConnecte(false);
    setMemberships([]);
    setResume(null);
  }

  async function gererExportDim() {
    try {
      const url = await exporterVersDim(demoBuild);
      window.open(url, "_blank");
    } catch (e) {
      alert(`Export DIM impossible pour le moment : ${(e as Error).message}`);
    }
  }

  return (
    <div>
      <h1>D2 Build Analyzer</h1>

      {/* FR : Bloc de connexion + test - c'est ici qu'on verifie que tout
          fonctionne apres avoir autorise l'appli sur Bungie.net.
          EN: Connection + test block - this is where you verify everything
          works after authorizing the app on Bungie.net. */}
      <div className="pilier-carte">
        <h3><span>Connexion Bungie.net</span><span>{connecte ? "✅ connecté" : "◯ non connecté"}</span></h3>
        {!connecte && (
          <p>Cliquez pour vous connecter — vous serez redirigé vers bungie.net.</p>
        )}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {!connecte && <button onClick={redirigerVersAutorisation}>Connexion Bungie.net</button>}
          {connecte && (
            <>
              <button onClick={testerConnexion} disabled={enCours}>
                {enCours ? "Test en cours..." : "Tester la connexion (profil + coffre)"}
              </button>
              <button onClick={gererDeconnexion}>Se déconnecter</button>
            </>
          )}
        </div>

        {erreurTest && <p style={{ color: "#e08080" }}>⚠️ {erreurTest}</p>}

        {resume && (
          <ul>
            <li>Compte : {resume.compte}</li>
            <li>Personnages : {resume.classesEtLumiere.join(", ") || "aucun"}</li>
            <li>Objets dans le coffre : {resume.nbObjetsCoffre}</li>
          </ul>
        )}

        {memberships.length > 1 && (
          <p style={{ fontSize: "0.8rem", color: "#b7b3a8" }}>
            Note : {memberships.length} comptes Destiny liés détectés, le résumé ci-dessus n'affiche
            que le premier ({memberships[0].displayName}).
          </p>
        )}
      </div>

      <RechercheManifest />

      <p>
        Build de démonstration : <strong>{demoBuild.nom}</strong> — le moteur de scoring
        fonctionne déjà sur des données factices ; branchez le Manifest et l'inventaire réels
        pour remplacer les hash placeholders.
      </p>

      <div className="score-global">{resultat.scoreGlobal}/100</div>

      {resultat.piliers.map((p) => (
        <PilierCarte key={p.pilier} pilier={p} stats={resultat.statsTotales} />
      ))}

      <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
        <button onClick={gererExportDim}>Exporter vers DIM</button>
      </div>
    </div>
  );
}

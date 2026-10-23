// FR : Vitrine « Solo sans mourir » — panneau glissant à GAUCHE, miroir de
// PanneauLoadouts (à droite). Uniquement une vitrine : aucun lien avec le
// scoring, c'est un affichage d'accomplissements (demande explicite de
// l'utilisateur).
//
// ⚠️ CHANGÉ (22/10/2026, TODO §25) : le tiroir RETROUVE son comportement
// d'origine (avant la v0.4.14) : son ouverture est un état INTERNE, il n'y a
// PLUS de navigation croisée avec la Carrière (les props `ouvertExterieur`,
// `onOuvertChange` et `onOuvrirCarriere` sont supprimées, ainsi que le bouton
// « Carrière » dans l'en-tête). Le bouton « Accomplissements » du bloc Connexion
// ouvre désormais la PAGE « Accomplissements » (onglet du sélecteur de vues),
// pas ce tiroir ; le tiroir reste disponible depuis le Build Analyzer, comme
// avant. Le CONTENU (liste des 11 donjons, diagnostics dev) est déplacé dans
// `VitrineSoloFlawless.tsx`, partagé avec cette page.
//
// ⚠️ Aucune image copiée. L'utilisateur avait proposé un visuel trouvé sur
// Dungeon Report (site communautaire tiers) : écarté, car on ne peut ni
// vérifier ses droits ni le recharger légitimement via l'API comme les
// icônes du Manifest. Le crâne SVG (fourni par l'utilisateur,
// justrealmilk/destiny-icons) le représente, dans le même esprit sombre,
// cohérent avec les autres icônes créées pour l'appli (voir IconeCrane.tsx).
//
// EN: "Solo Flawless" showcase — LEFT sliding panel, mirroring PanneauLoadouts
// (right). Showcase only: no link to scoring. CHANGED (TODO §25): back to the
// original self-contained drawer (no more cross-navigation with Career); the
// content lives in VitrineSoloFlawless.tsx, shared with the Accomplishments page.
import { useState } from "react";
import { Database } from "sql.js";
import { lireTriomphesSoloFlawless } from "../lib/bungie/triomphes";
import IconeCrane from "./IconeCrane";
import VitrineSoloFlawless from "./VitrineSoloFlawless";

interface Props {
  /** FR : profil complet renvoyé par l'API (composant 900 inclus). null tant qu'il n'est pas chargé. / EN: full profile from the API (component 900 included). */
  profil: unknown | null;
  /** FR : ⚠️ AJOUT (24/08/2026) - nécessaire pour le diagnostic ponctuel de définition de triomphe. / EN: needed for the one-off triumph definition diagnostic. */
  db?: Database | null;
}

export default function PanneauTriomphes({ profil, db }: Props) {
  const [ouvert, setOuvert] = useState(false);
  // FR : compteur du bouton fermé (`Solo (X/11)`) : lecture synchrone du profil déjà chargé, aucune requête. / EN: closed-button counter, read synchronously from the loaded profile.
  const accomplis = profil ? lireTriomphesSoloFlawless(profil).filter((t) => t.accompli).length : 0;

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        style={{
          position: "fixed",
          left: 0,
          top: "40%",
          zIndex: 900,
          writingMode: "vertical-rl",
          padding: "1.15rem 0.55rem",
          // FR : arrondi inversé par rapport aux loadouts (qui sont à droite).
          borderRadius: "0 6px 6px 0",
          fontSize: "1.2rem",
        }}
        title="Ouvrir la vitrine « Solo sans mourir »"
      >
        💀 Solo ({accomplis}/{profil ? lireTriomphesSoloFlawless(profil).length : 11})
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "min(90vw, 320px)",
        zIndex: 900,
        background: "#161922",
        borderRight: "1px solid #2a2e38",
        boxShadow: "8px 0 30px rgba(0,0,0,0.4)",
        padding: "0.75rem",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <strong style={{ fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <IconeCrane taille={18} />
          Solo sans mourir
        </strong>
        <button
          onClick={() => setOuvert(false)}
          style={{ background: "none", border: "none", color: "#7d7a70", cursor: "pointer", fontSize: "1rem" }}
        >
          ✕
        </button>
      </div>

      <VitrineSoloFlawless profil={profil} db={db} />
    </div>
  );
}

// FR : ⚠️ CHANGÉ (01/10/2026, v0.3.0) - en-tête de l'appli avec l'IDENTITÉ VISUELLE
// Forge Armory (image fournie par l'utilisateur), taille « B » choisie par lui :
// l'emblème à gauche, le bloc de texte (« Forge Armory », ligne de séparation,
// « Destiny 2 Build Analyzer | par Orynick/Orygamer ») décalé à DROITE, le CERCLE
// de l'emblème allant du haut du titre au bas du sous-titre.
// Géométrie : lib/enTete/geometrieIdentite.ts. Images (à fond transparent, tirées de
// l'image d'origine par ressources-installateur/forge-armory/generer-icones.py) :
// public/logo-forge-armory-embleme.png et -texte.png.
//
// ⚠️ Seul l'EN-TÊTE change de nom : `productName` et titre de la fenêtre sont
// « Forge Armory », mais les clés de stockage (localStorage/IndexedDB) restent
// historiquement « d2-build-analyzer.* » / « d2ba.* » : les renommer perdrait
// les données des utilisateurs (voir electron/dossierDonnees.cjs pour le dossier
// de données, géré de la même manière).
// Versions précédentes : ancien en-tête (Cryptarque + Spectre) dans
// ressources-installateur/forge-armory/archives-precedentes/ancien-logo/ancien-en-tete.txt ; essai du 01/10 (logo
// à côté de « D2 Build Analyzer », placement par mesure) remplacé.
// EN: ⚠️ CHANGED - header with the Forge Armory visual identity, size "B": emblem on the
// left, text block shifted RIGHT, the emblem's CIRCLE spanning from the title's top to
// the subtitle's bottom. Only the header name changes.

import { calculerGeometrieEnTete } from "../lib/enTete/geometrieIdentite";

const g = calculerGeometrieEnTete();
const BASE = import.meta.env.BASE_URL;
const commun = { position: "absolute", userSelect: "none", pointerEvents: "none" } as const;

export default function EnTeteApp() {
  return (
    <h1 style={{ position: "relative", width: g.largeur, height: g.hauteur, margin: "21px 0 18px" }}>
      <img
        src={`${BASE}logo-forge-armory-embleme.png`}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ ...commun, left: g.emblemeGauche, top: g.emblemeHaut, width: g.emblemeLargeur, height: g.emblemeHauteur }}
      />
      <img
        src={`${BASE}logo-forge-armory-texte.png`}
        alt="Forge Armory — Destiny 2 Build Analyzer, par Orynick/Orygamer"
        draggable={false}
        style={{ ...commun, left: g.texteGauche, top: g.texteHaut, width: g.texteLargeur, height: g.texteHauteur }}
      />
    </h1>
  );
}

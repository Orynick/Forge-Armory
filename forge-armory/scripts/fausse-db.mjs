// FR : Construit un objet imitant l'interface sql.js Database (prepare/
// bind/step/getAsObject/free) a partir de test-fixtures/manifest-mock.json,
// pour tester le code qui utilise obtenirDefinition()/lireTable() SANS
// avoir besoin d'un vrai telechargement du Manifest (~200 Mo).
//
// ⚠️ Usage TEST UNIQUEMENT - l'appli reelle continue de telecharger le
// vrai Manifest depuis Bungie (voir lib/manifest/download.ts), ce fichier
// ne sert que pour scripts/tester-avec-fixtures.mjs et les tests ad-hoc.
//
// EN: Builds an object mimicking the sql.js Database interface (prepare/
// bind/step/getAsObject/free) from test-fixtures/manifest-mock.json, to
// test code that uses obtenirDefinition()/lireTable() WITHOUT needing a
// real Manifest download (~200MB).
//
// ⚠️ TEST-ONLY usage - the real app keeps downloading the real Manifest
// from Bungie (see lib/manifest/download.ts), this file is only used by
// scripts/tester-avec-fixtures.mjs and ad-hoc tests.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const donnees = JSON.parse(
  readFileSync(path.join(__dirname, "..", "test-fixtures", "manifest-mock.json"), "utf8")
);

/** FR : langue = "fr" ou "en", comme les vrais Manifests telecharges par l'appli. / EN: langue = "fr" or "en", like the real Manifests the app downloads. */
export function fausseDB(langue = "fr") {
  return {
    prepare(sql) {
      const table = sql.match(/FROM (\w+)/)[1];
      const parId = sql.includes("WHERE id");
      const lignesTable = donnees[table]?.[langue] ?? {};
      const lignes = Object.entries(lignesTable).map(([id, def]) => ({ id: Number(id), def }));
      let idCherche = null;
      let i = -1;

      return {
        bind(params) {
          idCherche = params[0];
        },
        step() {
          if (parId) {
            if (i === -1 && lignes.some((l) => l.id === idCherche)) {
              i = 0;
              return true;
            }
            return false;
          }
          i++;
          return i < lignes.length;
        },
        getAsObject() {
          const ligne = parId ? lignes.find((l) => l.id === idCherche) : lignes[i];
          return { id: ligne.id, json: JSON.stringify(ligne.def) };
        },
        free() {},
      };
    },
  };
}

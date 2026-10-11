import { BuildDraft } from "../../types/build";
import { obtenirCleDimApi, obtenirTokenDimAcces } from "./apiKey";

const DIM_API_ROOT = "https://api.destinyitemmanager.com";

// Schéma simplifié d'un LoadoutShare compatible dim-api-types.
// Référence : github.com/DestinyItemManager/dim-api (api/shapes/loadouts.ts)
interface DimLoadoutShare {
  loadout: {
    name: string;
    classType: number; // 0 Titan, 1 Chasseur, 2 Arcaniste (DestinyClass)
    items: Array<{ hash: number; id?: string; socketOverrides?: Record<number, number> }>;
    parameters?: {
      assumeArmorMasterwork?: "none" | "all" | "legendary";
    };
  };
}

const CLASSE_VERS_ENUM: Record<Exclude<BuildDraft["subclass"]["classe"], null>, number> = {
  titan: 0,
  chasseur: 1,
  arcaniste: 2,
};

function construireLoadoutShare(build: BuildDraft): DimLoadoutShare {
  const items = [
    ...build.armes.map((a) => ({ hash: a.itemHash, id: a.itemInstanceId })),
    ...build.armure.map((a) => ({ hash: a.itemHash, id: a.itemInstanceId })),
  ];

  return {
    loadout: {
      name: build.nom,
      classType: build.subclass.classe ? CLASSE_VERS_ENUM[build.subclass.classe] : 3, // FR : 3 = "Unknown" côté DIM, repli si aucune classe choisie (export déjà non fonctionnel par ailleurs).
      items,
      parameters: { assumeArmorMasterwork: "legendary" },
    },
  };
}

/**
 * Envoie le build à l'API DIM et renvoie l'URL de partage à ouvrir dans DIM
 * (app.destinyitemmanager.com/loadout-share?shareId=...). L'utilisateur
 * clique ensuite sur "Importer" côté DIM pour l'ajouter à ses loadouts.
 */
export async function exporterVersDim(build: BuildDraft): Promise<string> {
  const payload = construireLoadoutShare(build);
  const cleDim = await obtenirCleDimApi();
  const tokenDim = await obtenirTokenDimAcces();

  const reponse = await fetch(`${DIM_API_ROOT}/loadout_share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": cleDim,
      Authorization: `Bearer ${tokenDim}`,
    },
    body: JSON.stringify(payload),
  });

  if (!reponse.ok) {
    const corps = await reponse.text().catch(() => "");
    throw new Error(`Export vers DIM échoué (${reponse.status})${corps ? ` : ${corps}` : ""}`);
  }

  const data = await reponse.json();
  const shareId = data.shareId as string;
  return `https://app.destinyitemmanager.com/loadout-share?shareId=${shareId}`;
}

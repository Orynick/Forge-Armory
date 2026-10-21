// FR : ⚠️ AJOUT (20/10/2026, chantier Legendarium, branche draft-legendarium) - GRIMOIRE D1 : lecture de l'endpoint legacy Bungie `https://www.bungie.net/d1/Platform/Destiny/Vanguard/Grimoire/Definition/` (en-tête `X-API-Key` obligatoire), EN REPLI d'un jeu de données statique issu d'Ishtar Collective si l'API ne convient pas. ⚠️ DÉCISION DE L'UTILISATEUR (20/10/2026) : « À toi de vérifier » — CONSTAT : la liste blanche réseau de l'appli (Electron `electron/main.cjs` HOTES_AUTORISES + CSP `connect-src` de `vite.config.ts`, branche draft-sec fusionnée dans main) N'AUTORISE QUE `https://www.bungie.net`, `https://api.destinyitemmanager.com` et `https://api.github.com`. L'endpoint D1 vit SUR `https://www.bungie.net/d1/...` : même hôte, DONC autorisé par la liste blanche existante (aucune modification de sécurité requise). ⚠️ NON VÉRIFIÉ en conditions réelles (pas d'accès réseau depuis cet environnement) : (1) que l'endpoint D1 réponde encore (Bungie a réduit le D1 legacy) ; (2) le format exact de la réponse (livres → cartes). Le module est écrit en LECTURE SEULE avec un repli statique prévu ; un diagnostic en `npm run dev` confirmera. / EN: D1 Grimoire: reads the legacy Bungie endpoint (same host as the whitelist — no security change needed), with a static Ishtar Collective fallback. Read-only.
import { BUNGIE_ROOT, bungieConfig } from "../bungie/config";
import type { LivreLore, PageLore } from "./types";

const ENDPOINT_GRIMOIRE = `${BUNGIE_ROOT}/d1/Platform/Destiny/Vanguard/Grimoire/Definition/`;

/** FR : une carte du Grimoire D1 (forme attendue de l'API legacy ; tolérante aux champs absents). / EN: a D1 Grimoire card (expected legacy API shape; tolerant of missing fields). */
interface CarteGrimoire {
  cardId?: number | string;
  cardName?: string;
  cardIntro?: string;
  cardDescription?: string;
  chapterHash?: number;
  chapterName?: string;
}

/** FR : un livre du Grimoire D1 (forme attendue ; tolérante). / EN: a D1 Grimoire book (expected shape; tolerant). */
interface LivreGrimoire {
  bookHash?: number;
  bookName?: string;
  cards?: CarteGrimoire[];
}

/** FR : jeu de données statique de REPLI (Ishtar Collective) — structure identique à ce que produit `lireGrimoire`, pour que l'interface ne voie aucune différence. Vide au départ : à alimenter si l'API legacy ne convient pas (décision de repli, spécification §2). / EN: static FALLBACK dataset (Ishtar Collective) — same shape as `lireGrimoire`'s output, so the UI sees no difference. Empty for now: to fill if the legacy API does not work out (fallback decision, spec §2). */
export const REPLI_GRIMOIRE_STATIQUE: LivreLore[] = [];

/** FR : convertit la réponse de l'API legacy en livres du Legendarium (livre → cartes). Tolérant : un livre sans carte ou une carte sans texte est écarté. / EN: converts the legacy API response into Legendarium books (book → cards). Tolerant: a book without cards or a card without text is dropped. */
export function convertirGrimoire(livres: LivreGrimoire[]): LivreLore[] {
  const resultat: LivreLore[] = [];
  livres.forEach((livre, indexLivre) => {
    const titreLivre = livre.bookName?.trim() || `Livre ${indexLivre + 1}`;
    const pages: PageLore[] = [];
    (livre.cards ?? []).forEach((carte, indexCarte) => {
      const texte = (carte.cardDescription ?? carte.cardIntro ?? "").trim();
      if (!texte) return;
      const idCarte = carte.cardId ?? indexCarte;
      pages.push({
        id: `grimoire:${idCarte}`,
        titre: carte.cardName?.trim() || `Carte ${indexCarte + 1}`,
        sousTitre: carte.chapterName?.trim() || undefined,
        texte,
      });
    });
    if (pages.length > 0) resultat.push({ id: `grimoire-livre-${livre.bookHash ?? indexLivre}`, titre: titreLivre, pages });
  });
  return resultat;
}

/** FR : ⚠️ AJOUT (20/10/2026) - diagnostic du Grimoire D1 (mode développement), pour figer la question « l'endpoint legacy accepte-t-il NOTRE clé ? » sur des données réelles. L'utilisateur a testé l'URL depuis son NAVIGATEUR (sans en-tête) : Bungie répond `ApiKeyMissingFromRequest` (ErrorCode 2102) — l'endpoint existe. Ce diagnostic refait l'appel AVEC la clé de l'appli et rapporte le statut HTTP + le premier message d'erreur Bungie, pour distinguer « clé absente » (pas de `.env.local`) de « clé refusée par Bungie pour le D1 » (repli statique à alimenter). / EN: dev diagnostic for the D1 Grimoire: replays the call WITH the app's key and reports the HTTP status + Bungie's first error message, to tell "no key configured" apart from "key rejected by Bungie for D1". */
export interface DiagnosticGrimoire {
  url: string;
  clePresente: boolean;
  statutHttp?: number;
  ok?: boolean;
  erreurBungie?: string;
  livres?: number;
  cartes?: number;
  erreur?: string;
}

export async function diagnostiquerGrimoire(): Promise<DiagnosticGrimoire> {
  const base: DiagnosticGrimoire = { url: ENDPOINT_GRIMOIRE, clePresente: Boolean(bungieConfig.apiKey) };
  if (!bungieConfig.apiKey) return { ...base, erreur: "Aucune clé API (VITE_BUNGIE_API_KEY absente du .env.local)" };
  try {
    const reponse = await fetch(ENDPOINT_GRIMOIRE, { headers: { "X-API-Key": bungieConfig.apiKey } });
    base.statutHttp = reponse.status;
    base.ok = reponse.ok;
    const data = await reponse.json().catch(() => undefined);
    if (!reponse.ok) {
      const e = data as { ErrorStatus?: string; Message?: string; ErrorCode?: number } | undefined;
      base.erreurBungie = e?.ErrorStatus ? `${e.ErrorStatus}${e.ErrorCode !== undefined ? ` (code ${e.ErrorCode})` : ""}${e.Message ? ` — ${e.Message}` : ""}` : `HTTP ${reponse.status}`;
      return base;
    }
    const livres = (data?.Response?.themeCollection?.flatMap((theme: { books?: LivreGrimoire[] }) => theme?.books ?? []) ?? []) as LivreGrimoire[];
    base.livres = livres.length;
    base.cartes = livres.reduce((n, l) => n + (l.cards?.length ?? 0), 0);
    return base;
  } catch (e) {
    return { ...base, erreur: (e as Error).message };
  }
}

/** FR : lit le Grimoire D1 depuis l'API legacy Bungie (en-tête `X-API-Key`). En cas d'échec (réseau, 404, réponse invalide, clé absente ou refusée) : RENVOIE LE REPLI STATIQUE (jamais d'erreur, jamais de blocage — lecture passive). / EN: reads the D1 Grimoire from the legacy Bungie API (X-API-Key header). On any failure (network, 404, invalid response, missing or rejected key): RETURNS THE STATIC FALLBACK (never throws, never blocks — passive reading). */
export async function lireGrimoire(): Promise<LivreLore[]> {
  if (!bungieConfig.apiKey) return REPLI_GRIMOIRE_STATIQUE;
  try {
    const reponse = await fetch(ENDPOINT_GRIMOIRE, { headers: { "X-API-Key": bungieConfig.apiKey } });
    if (!reponse.ok) return REPLI_GRIMOIRE_STATIQUE;
    const data = await reponse.json();
    const livres = data?.Response?.themeCollection?.flatMap((theme: { books?: LivreGrimoire[] }) => theme?.books ?? []) as LivreGrimoire[] | undefined;
    if (!Array.isArray(livres)) return REPLI_GRIMOIRE_STATIQUE;
    const convertis = convertirGrimoire(livres);
    return convertis.length > 0 ? convertis : REPLI_GRIMOIRE_STATIQUE;
  } catch {
    return REPLI_GRIMOIRE_STATIQUE;
  }
}

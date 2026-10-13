// FR : ⚠️ AJOUT (13/10/2026, v0.4.3) - DÉCISION DE DÉMARRAGE du Manifest (demande de l'utilisateur, 13/10/2026 : « si le Manifest est périmé, et uniquement dans ce cas, téléchargement du nouveau »). Fonctions SANS interface, pour être testées à fond ; `RechercheManifest` n'y branche que ses états.
// RÈGLES, langue par langue (état fourni par `etatCachesManifests`) :
//   - le français est la langue OBLIGATOIRE de l'appli : sans cache français, rien n'est jamais lancé seul (premier téléchargement = un clic) ;
//   - une langue « périmée » (en cache, d'une autre version) est RETÉLÉCHARGÉE automatiquement ; une langue « absente » n'est JAMAIS téléchargée seule (l'anglais n'est donc pas téléchargé « en douce ») ;
//   - FR ET EN à jour : chargement automatique depuis le cache, sans rien annoncer (comme depuis la 0.2.2) ;
//   - état inconnu (hors ligne, Bungie indisponible) : rien, le bouton manuel reste affiché.
// EN: ⚠️ ADDED - startup decision for the Manifest: an OUTDATED cached language is re-downloaded automatically; an ABSENT one never is; French is mandatory; unknown state does nothing.

export type LangueManifest = "fr" | "en";
export type EtatCaches = Partial<Record<LangueManifest, "a-jour" | "perime" | "absent">>;
export type Decision = { action: "rien" } | { action: "charger"; langues: LangueManifest[]; raison: "a-jour" | "perime" };

const LANGUES: LangueManifest[] = ["fr", "en"];

export function decider(etat: EtatCaches | null | undefined): Decision {
  if (!etat) return { action: "rien" };
  if (!etat.fr || etat.fr === "absent") return { action: "rien" };
  const presentes = LANGUES.filter((l) => etat[l] && etat[l] !== "absent");
  if (presentes.some((l) => etat[l] === "perime")) return { action: "charger", langues: presentes, raison: "perime" };
  if (etat.fr === "a-jour" && etat.en === "a-jour") return { action: "charger", langues: ["fr", "en"], raison: "a-jour" };
  return { action: "rien" };
}

export interface DependancesDemarrage {
  lireEtat: () => Promise<EtatCaches | null>;
  /** FR : charge ces langues ; renvoie vrai si tout s'est bien passé (les erreurs sont déjà affichées par l'appelant). / EN: loads these languages; true on success. */
  charger: (langues: LangueManifest[]) => Promise<boolean>;
  /** FR : message affiché à l'utilisateur ; `null` l'efface. / EN: message shown to the user; null clears it. */
  annoncer: (message: string | null) => void;
}

export async function demarrerManifests(dep: DependancesDemarrage): Promise<Decision & { reussi?: boolean }> {
  const decision = decider(await dep.lireEtat());
  if (decision.action === "rien") return decision;
  if (decision.raison === "a-jour") {
    dep.annoncer(null);
    return { ...decision, reussi: await dep.charger(decision.langues) };
  }
  const noms = decision.langues.map((l) => (l === "fr" ? "français" : "anglais")).join(" et ");
  dep.annoncer(`🔄 Bungie a publié une nouvelle version du Manifest : mise à jour automatique en cours (${noms}, environ 100 Mo par langue)…`);
  const reussi = await dep.charger(decision.langues);
  dep.annoncer(
    reussi
      ? "✅ Manifest mis à jour automatiquement (nouvelle version publiée par Bungie)."
      : "⚠️ La mise à jour automatique du Manifest a échoué : le bouton « Charger le Manifest » permet de réessayer."
  );
  return { ...decision, reussi };
}

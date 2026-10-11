// FR : ⚠️ AJOUT (07/10/2026, v0.3.7) - BARRE DE RECHERCHE ET FILTRES de l'onglet « Load-outs » (phase 2) : champ de recherche par mots-clés, trois listes (classe, élément, contexte), compteur « n sur N » et bouton
// « Réinitialiser » quand un critère est actif. Composant d'AFFICHAGE : les critères et leur application vivent dans `PanneauLoadouts` et `lib/loadouts/recherche.ts`. Visible seulement dans l'onglet (mode « page »),
// jamais dans le tiroir. Si le Manifest n'est pas chargé, une ligne le dit : les noms de la Doctrine ne sont alors pas couverts par la recherche.
// EN: ⚠️ ADDED - search and filter bar of the Load-outs tab (phase 2). Display only.

import { CRITERES_VIDES, CriteresLoadouts, ValeurFiltre, criteresActifs } from "../lib/loadouts/recherche";

interface Props {
  criteres: CriteresLoadouts;
  onChanger: (criteres: CriteresLoadouts) => void;
  disponibles: { classes: ValeurFiltre[]; elements: ValeurFiltre[]; contextes: ValeurFiltre[] };
  total: number;
  affiches: number;
  manifestCharge: boolean;
}

const STYLE_CHAMP = { fontSize: "0.75rem", background: "#0d0f14", color: "#e8e6df", border: "1px solid #3a3f4b", borderRadius: 6, padding: "0.3rem 0.5rem" } as const;

function Liste({ etiquette, tous, valeur, options, onChoisir }: { etiquette: string; tous: string; valeur: string; options: ValeurFiltre[]; onChoisir: (v: string) => void }) {
  return (
    <select aria-label={etiquette} value={valeur} onChange={(e) => onChoisir(e.target.value)} style={{ ...STYLE_CHAMP, cursor: "pointer" }}>
      <option value="">{tous}</option>
      {options.map((o) => (
        <option key={o.valeur} value={o.valeur}>
          {o.libelle} ({o.nombre})
        </option>
      ))}
    </select>
  );
}

export default function BarreRechercheLoadouts({ criteres, onChanger, disponibles, total, affiches, manifestCharge }: Props) {
  const actif = criteresActifs(criteres);
  return (
    <div style={{ margin: "0 0 0.6rem" }}>
      <div role="search" data-recherche-loadouts="" style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
        <input
          type="search"
          aria-label="Rechercher dans les loadouts"
          placeholder="🔎 Rechercher : nom, description, auteur, armes, armures, doctrine, artefact…"
          value={criteres.texte}
          onChange={(e) => onChanger({ ...criteres, texte: e.target.value })}
          style={{ ...STYLE_CHAMP, flex: "1 1 260px", minWidth: 0 }}
        />
        <Liste etiquette="Filtrer par classe" tous="Toutes les classes" valeur={criteres.classe} options={disponibles.classes} onChoisir={(v) => onChanger({ ...criteres, classe: v })} />
        <Liste etiquette="Filtrer par élément" tous="Tous les éléments" valeur={criteres.element} options={disponibles.elements} onChoisir={(v) => onChanger({ ...criteres, element: v })} />
        <Liste etiquette="Filtrer par contexte" tous="Tous les contextes" valeur={criteres.contexte} options={disponibles.contextes} onChoisir={(v) => onChanger({ ...criteres, contexte: v })} />
        {actif && (
          <button type="button" onClick={() => onChanger(CRITERES_VIDES)} style={{ fontSize: "0.72rem" }}>
            ✕ Réinitialiser
          </button>
        )}
        <span aria-live="polite" data-compte-resultats="" style={{ fontSize: "0.72rem", color: actif ? "#9ec1ff" : "#7d7a70" }}>
          {actif ? `${affiches} sur ${total}` : `${total} loadout${total > 1 ? "s" : ""}`}
        </span>
      </div>
      {!manifestCharge && (
        <p data-indice-manifest="" style={{ fontSize: "0.68rem", color: "#7d7a70", margin: "0.3rem 0 0" }}>
          Manifest non chargé : la recherche ne couvre pas encore les noms de la Doctrine (super, aspects, fragments…). Le reste (noms, description, auteur, armes, armures, artefact) est déjà couvert.
        </p>
      )}
    </div>
  );
}

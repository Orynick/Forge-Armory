// FR : ⚠️f AJOUT (22/11/2026, chantier draft-encarts-equerres, TODO §30) - CÂBLAGE DANS L'APPLI du composant « encart à équerres » LIVRÉ PAR L'UTILISATEUR dans le pack v14 (archive de référence : `ressources-installateur/forge-armory/app-assets/composants/BlocRepliable.tsx/.css` — JAMAIS MODIFIÉE ; spec design : `ENCARTS-BLOCS.md`, qui FAIT FOI). Adaptations d'intégration uniquement, sans toucher au design :
//   1. `urlVisuel` (catalogue applicatif) au lieu du `forgeAsset` du pack ; 2. hauteur de titre FLUIDE par défaut (option B validée : `--titre-h` piloté par le CSS de l'appli — aucun débordement mobile, cf. BlocRepliable.css) ; 3. `ref` transmise (l'onglet Inventaire défile vers son bloc) ; 4. CONTEXTE partagé : un seul bloc actif à la fois au niveau de la page (règle d'ENCARTS-BLOCS.md), fourni par `BlocsRepliablesProvider` (DashboardPage).
// EN: app-side wiring of the user's v14 pack component (design untouched): app catalogue, fluid title height (option B), forwarded ref, page-level context enforcing ONE active block at a time.
import { createContext, forwardRef, useCallback, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { urlVisuel } from "../lib/visuelsForge";
import "./BlocRepliable.css";

/** FR : les 7 blocs du pack (voir manifest.json, famille « blocs-repliables »). / EN: the pack's 7 block ids. */
export const BLOCS_REPLIABLES = ["connexion", "mon-build", "inventaire", "manifest", "doctrine", "artefact", "sauvegarde"] as const;
export type BlocId = (typeof BLOCS_REPLIABLES)[number];

type Props = {
  id: BlocId;
  ouvert: boolean;
  /** FR : un seul bloc actif à la fois : équerres cyan lumineuses. / EN: one active block at a time: glowing cyan brackets. */
  actif?: boolean;
  onBasculer: () => void;
  /** FR : appelé quand l'utilisateur interagit avec le contenu (clic, focus) : rend le bloc actif. / EN: content interaction marks the block active. */
  onActiver?: () => void;
  /** FR : hauteur d'affichage du titre en px (par défaut : FLUIDE — pilotée par le CSS de l'appli, option B). / EN: title height in px (default: fluid, CSS-driven). */
  hauteurTitre?: number;
  children: ReactNode;
};

/** FR : ⚠️f AJOUT (intégration) - version avec `ref` du composant du pack (l'onglet Inventaire défile vers son bloc via une ref d'ancre). / EN: ref-forwarding wrapper of the pack's component. */
export const BlocRepliable = forwardRef<HTMLElement, Props>(function BlocRepliable(
  { id, ouvert, actif = false, onBasculer, onActiver, hauteurTitre, children },
  ref
) {
  const titre = urlVisuel(`blocs-repliables.${id}.${ouvert ? "deplie" : "replie"}`);
  if (!titre) return null;
  const corpsId = `bloc-corps-${id}`;
  const classes = ["bloc", ouvert && "bloc--ouvert", ouvert && actif && "bloc--actif"].filter(Boolean).join(" ");

  return (
    <section
      className={classes}
      ref={ref}
      style={hauteurTitre !== undefined ? ({ ["--titre-h"]: `${hauteurTitre}px` } as CSSProperties) : undefined}
      data-bloc-repliable={id}
    >
      <div className="bloc__cadre" aria-hidden="true">
        {(["argent", "cyan"] as const).map((c) => (
          <div key={c} className={`bloc__eq bloc__eq--${c}`}>
            {["hd-h", "hd-v", "bg-h", "bg-v", "bd-h", "bd-v"].map((k) => (
              <i key={k} className={`${k.endsWith("h") ? "h" : "v"} ${k}`} />
            ))}
          </div>
        ))}
      </div>

      <button type="button" className="bloc__titre" aria-expanded={ouvert} aria-controls={corpsId} onClick={onBasculer}>
        <img src={titre} alt={`Titre du bloc ${id}`} draggable={false} />
      </button>

      <div className="bloc__corps" id={corpsId} role="region" aria-label={`Contenu du bloc ${id}`}
           onPointerDownCapture={onActiver} onFocusCapture={onActiver}
           {...(ouvert ? {} : ({ inert: "" } as object))}>
        <div className="bloc__contenu">
          <div className="bloc__contenu-int">{children}</div>
        </div>
      </div>
    </section>
  );
});

/** FR : l'état des blocs, partagé au niveau de la page. / EN: page-level block state. */
interface EtatBlocs {
  ouverts: ReadonlySet<BlocId>;
  actif: BlocId | null;
  basculer: (id: BlocId) => void;
  activer: (id: BlocId) => void;
}
const ContexteBlocs = createContext<EtatBlocs | null>(null);

/** FR : ⚠️f AJOUT (intégration, même logique que le pack) - état : plusieurs blocs ouverts, UN SEUL actif. Ouvrir un bloc l'active ; fermer le bloc actif n'en laisse aucun. / EN: pack's hook logic, unchanged. */
export function useBlocsRepliables(ouvertsAuDepart: BlocId[] = [], actifAuDepart: BlocId | null = null) {
  const [ouverts, setOuverts] = useState<Set<BlocId>>(new Set(ouvertsAuDepart));
  const [actif, setActif] = useState<BlocId | null>(actifAuDepart);

  const basculer = useCallback((id: BlocId) => {
    setOuverts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setActif((a) => (a === id ? null : a));
      } else {
        next.add(id);
        setActif(id);
      }
      return next;
    });
  }, []);

  return { ouverts, actif, basculer, activer: setActif };
}

/** FR : le fournisseur de contexte de la page : tous les blocs OUVERTS au départ (parité avec l'existant — tous les blocs sont ouverts aujourd'hui), AUCUN actif (les équerres cyan n'apparaissent qu'à l'interaction, règle d'ENCARTS-BLOCS.md). / EN: page provider: all blocks open initially (parity), none active until interaction. */
export function BlocsRepliablesProvider({ children }: { children: ReactNode }) {
  const { ouverts, actif, basculer, activer } = useBlocsRepliables([...BLOCS_REPLIABLES], null);
  return <ContexteBlocs.Provider value={{ ouverts, actif, basculer, activer }}>{children}</ContexteBlocs.Provider>;
}

/** FR : ce qu'un bloc consomme : ouvert ? actif ? + ses rappels. / EN: what a block consumes. */
export function useBlocRepliable(id: BlocId) {
  const etat = useContext(ContexteBlocs);
  if (!etat) throw new Error("useBlocRepliable : aucun BlocsRepliablesProvider au-dessus");
  return {
    ouvert: etat.ouverts.has(id),
    actif: etat.actif === id,
    onBasculer: () => etat.basculer(id),
    onActiver: () => etat.activer(id),
  };
}

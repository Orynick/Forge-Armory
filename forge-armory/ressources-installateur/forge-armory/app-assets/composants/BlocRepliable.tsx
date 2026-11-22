import { useCallback, useState, type ReactNode } from 'react';
import { forgeAsset } from '../forgeAssets';
import './BlocRepliable.css';

/** Identifiants des 7 blocs repliables (voir manifest.json, famille « blocs-repliables »). */
export type BlocId =
  | 'connexion' | 'mon-build' | 'inventaire' | 'manifest' | 'doctrine' | 'artefact' | 'sauvegarde';

type Props = {
  id: BlocId;
  ouvert: boolean;
  /** Un seul bloc actif à la fois : équerres cyan lumineuses. */
  actif?: boolean;
  onBasculer: () => void;
  /** Appelé quand l'utilisateur interagit avec le contenu (clic, focus) : rend le bloc actif. */
  onActiver?: () => void;
  /** Hauteur d'affichage du titre en px (défaut 105 ≈ titre de 800 px de large). */
  hauteurTitre?: number;
  children: ReactNode;
};

export function BlocRepliable({ id, ouvert, actif = false, onBasculer, onActiver, hauteurTitre = 105, children }: Props) {
  const titre = forgeAsset(`blocs-repliables.${id}.${ouvert ? 'deplie' : 'replie'}`);
  if (!titre) return null;
  const corpsId = `bloc-corps-${id}`;
  const classes = ['bloc', ouvert && 'bloc--ouvert', ouvert && actif && 'bloc--actif'].filter(Boolean).join(' ');

  return (
    <section className={classes} style={{ ['--titre-h' as string]: `${hauteurTitre}px` }}>
      <div className="bloc__cadre" aria-hidden="true">
        {(['argent', 'cyan'] as const).map((c) => (
          <div key={c} className={`bloc__eq bloc__eq--${c}`}>
            {['hd-h', 'hd-v', 'bg-h', 'bg-v', 'bd-h', 'bd-v'].map((k) => (
              <i key={k} className={`${k.endsWith('h') ? 'h' : 'v'} ${k}`} />
            ))}
          </div>
        ))}
      </div>

      <button type="button" className="bloc__titre" aria-expanded={ouvert} aria-controls={corpsId}
              onClick={onBasculer}>
        <img src={`/${titre.fichier}`} alt={titre.label} draggable={false} />
      </button>

      <div className="bloc__corps" id={corpsId} role="region" aria-label={titre.label}
           onPointerDownCapture={onActiver} onFocusCapture={onActiver}
           {...(ouvert ? {} : ({ inert: '' } as object))}>
        <div className="bloc__contenu">
          <div className="bloc__contenu-int">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** État des blocs : plusieurs peuvent être ouverts, un seul est actif. Ouvrir un bloc l'active. */
export function useBlocsRepliables(ouvertsAuDepart: BlocId[] = [], actifAuDepart: BlocId | null = null) {
  const [ouverts, setOuverts] = useState<Set<BlocId>>(new Set(ouvertsAuDepart));
  const [actif, setActif] = useState<BlocId | null>(actifAuDepart);

  const basculer = useCallback((id: BlocId) => {
    setOuverts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setActif((a) => (a === id ? null : a)); }
      else { next.add(id); setActif(id); }
      return next;
    });
  }, []);

  return { ouverts, actif, basculer, activer: setActif };
}

/* Exemple :
   const { ouverts, actif, basculer, activer } = useBlocsRepliables(['connexion'], 'connexion');
   <BlocRepliable id="connexion" ouvert={ouverts.has('connexion')} actif={actif === 'connexion'}
                  onBasculer={() => basculer('connexion')} onActiver={() => activer('connexion')}>
     …contenu du bloc…
   </BlocRepliable>
*/

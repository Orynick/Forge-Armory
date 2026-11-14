// FR : ⚠️ AJOUT (23/10/2026, branche vibe/draft-podcast-840f64) - LECTEUR PODCAST
// flottant du Legendarium (spec SPEC-PODCAST-ESSAI-2026-10-23.md). Monté dans
// App.tsx (AU-DESSUS du routeur) : visible sur TOUTES les vues de l'appli quand
// une lecture est en cours ; réductible en pastille. Source audio : les MP3
// personnels de l'utilisateur dans `public/podcast/` (embarqués, lus en local —
// aucun réseau). Bus « page courante » : `src/lib/legendarium/podcast.ts`
// (publication par Bibliotheque, abonnement ici — MÉMOIRE UNIQUEMENT, aucune
// persistance, lecture passive comme le Legendarium).
// EN: ADDED (draft-podcast branch) - FLOATING PODCAST player for the
// Legendarium. Mounted in App.tsx (ABOVE the router): visible on every view
// while a playback is running; collapsible to a pill. Audio source: the user's
// personal MP3s in `public/podcast/` (embedded, read locally — no network).
import { useEffect, useRef, useState } from "react";
import { chargerIndexPodcast, demanderPageSuivante, demanderRetourPageCourante, usePagePodcast } from "../lib/legendarium/podcast";

/** FR : formate un nombre de secondes en `m:ss`. / EN: formats seconds as `m:ss`. */
function formaterTemps(secondes: number): string {
  if (!Number.isFinite(secondes) || secondes < 0) return "0:00";
  const m = Math.floor(secondes / 60);
  const s = Math.floor(secondes % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LecteurPodcast() {
  const page = usePagePodcast();
  const refAudio = useRef<HTMLAudioElement>(null);
  // FR : état de lecture EN MÉMOIRE (jamais persisté) : « lecture » | « pause » | « arret » | « termine » | « sans-audio » | « chargement ». / EN: playback state IN MEMORY (never persisted).
  const [etat, setEtat] = useState<"lecture" | "pause" | "arret" | "termine" | "sans-audio" | "chargement">("arret");
  const [reduit, setReduit] = useState(false);
  const [progression, setProgression] = useState(0); // 0..1
  const [duree, setDuree] = useState(0);
  const [position, setPosition] = useState(0);
  // FR : l'index des enregistrements est chargé UNE FOIS (mis en cache dans le module podcast). On ne le recharge pas à chaque page. / EN: the recordings index is loaded ONCE (cached in the podcast module).
  const [index, setIndex] = useState<Map<string, string> | null>(null);
  // FR : nom du fichier effectivement servi (d'après l'index, pas d'après la convention — l'index fait foi). / EN: the file actually served (from the index, not the convention — the index is authoritative).
  const [fichier, setFichier] = useState<string | null>(null);
  // FR : demande d'enchaînement en attente : la page suivante a été demandée, on attend que Bibliotheque publie la page suivante (qui portera le fichier suivant). / EN: pending auto-chain: the next page was requested, we wait for Bibliotheque to publish it (it will carry the next file).
  const [enchainementEnAttente, setEnchainementEnAttente] = useState(false);
  // FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64, suite) - « identifiant copié » (affichage transitoire 1,5 s après un clic sur « copier l'id » : l'utilisateur sait quel nom donner à son MP3). Mémoire uniquement.
  // EN: ADDED (draft-podcast) - "id copied" (transient display 1.5 s after clicking "copy id": the user knows which name to give their MP3). Memory only.
  const [idCopie, setIdCopie] = useState(false);
  const copierId = async () => {
    try {
      await navigator.clipboard.writeText(page!.id);
      setIdCopie(true);
      window.setTimeout(() => setIdCopie(false), 1500);
    } catch {
      setIdCopie(false);
    }
  };

  useEffect(() => {
    chargerIndexPodcast().then(setIndex);
  }, []);

  // FR : à chaque changement de page publiée (ou de l'index), on résout le fichier audio de la page. RÈGLE (spec §5) : un changement de page MANUEL ne lance PAS la lecture tout seul ; seul l'enchaînement de fin de fichier enchaîne (et là, on lance). / EN: on each published page (or index) change, resolve the page's audio file. RULE (spec §5): a MANUAL page change does NOT auto-start playback; only end-of-file chaining does (and there, we start).
  useEffect(() => {
    if (!page || !index) return;
    const audio = refAudio.current;
    const f = index.get(page.id) ?? null;
    setFichier(f);
    if (!f) {
      audio?.pause();
      setEtat("sans-audio");
      setEnchainementEnAttente(false);
      return;
    }
    const etaitEnLecture = etat === "lecture";
    audio?.pause();
    if (audio) {
      audio.src = `podcast/${f}`;
      audio.load();
    }
    setProgression(0);
    setPosition(0);
    setDuree(0);
    // FR : enchaînement demandé (fin de fichier précédente) → on relance la lecture sur la nouvelle page. Sinon : arrêt (attendre le clic ▶).
    if (enchainementEnAttente || etaitEnLecture) {
      setEtat("chargement");
      audio?.play().then(() => setEtat("lecture")).catch(() => setEtat("pause"));
      setEnchainementEnAttente(false);
    } else {
      setEtat("arret");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id, index]);

  // FR : quand le fichier est prêt (métadonnées chargées), on connaît la durée. / EN: when the file is ready (metadata loaded), we know the duration.
  const gererMetadonnees = () => {
    const audio = refAudio.current;
    if (audio && Number.isFinite(audio.duration)) setDuree(audio.duration);
  };
  const gererTemps = () => {
    const audio = refAudio.current;
    if (!audio) return;
    setPosition(audio.currentTime);
    if (audio.duration > 0) setProgression(audio.currentTime / audio.duration);
  };
  // FR : fin de fichier → enchaînement sur la page suivante SI elle a un audio (dans l'index) ; sinon état « terminé ». La demande passe par le bus (mémoire) : DashboardPage bascule la vue si besoin, Bibliotheque ouvre la page. / EN: end of file → chain to the next page IF it has audio (in the index); else state « terminé ». The request goes through the bus (memory): DashboardPage switches the view if needed, Bibliotheque opens the page.
  const gererFin = () => {
    const audio = refAudio.current;
    audio?.pause();
    if (page?.idSuivante && index?.has(page.idSuivante)) {
      setEnchainementEnAttente(true);
      demanderPageSuivante(page.idSuivante);
    } else {
      setEtat("termine");
    }
  };
  const gererErreur = () => setEtat("sans-audio");

  const basculerLecture = () => {
    const audio = refAudio.current;
    if (!audio || !fichier) return;
    if (etat === "lecture") {
      audio.pause();
      setEtat("pause");
    } else {
      audio.play().then(() => setEtat("lecture")).catch(() => setEtat("pause"));
    }
  };
  const arreter = () => {
    const audio = refAudio.current;
    audio?.pause();
    if (audio) audio.currentTime = 0;
    setPosition(0);
    setProgression(0);
    setEtat("arret");
    setEnchainementEnAttente(false);
  };
  const allerSuivant = () => {
    if (page?.idSuivante) {
      setEnchainementEnAttente(true);
      demanderPageSuivante(page.idSuivante);
    }
  };
  const chercher = (valeur: number) => {
    const audio = refAudio.current;
    if (!audio || !duree) return;
    audio.currentTime = valeur * duree;
    setPosition(audio.currentTime);
    setProgression(valeur);
  };

  // FR : rien à afficher si aucune page n'est publiée (hors Legendarium, pas de lecture en cours) — le lecteur est invisible ailleurs. / EN: nothing to show if no page is published (outside the Legendarium, no playback running) — the player is invisible elsewhere.
  if (!page) return null;

  const enLecture = etat === "lecture";
  const enPause = etat === "pause";
  const avecAudio = fichier !== null;
  const styleBouton: React.CSSProperties = { background: "none", border: "1px solid #4a463c", borderRadius: "4px", color: "#e8e4d8", cursor: "pointer", padding: "0.15rem 0.5rem", fontSize: "0.85rem" };
  const conteneur: React.CSSProperties = { position: "fixed", right: "1rem", bottom: "1rem", zIndex: 900, background: "#1a1a1a", border: "1px solid #4a463c", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", color: "#e8e4d8", fontSize: "0.85rem", maxWidth: "22rem" };

  // FR : pastille réduite (rétractée) : icône + titre court + lecture/pause + arrêt. / EN: collapsed pill: icon + short title + play/pause + stop.
  if (reduit) {
    return (
      <div data-lecteur-podcast="" data-reduit="" style={{ ...conteneur, display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.6rem" }}>
        <button data-lecteur-ouvrir="" onClick={() => setReduit(false)} title="Ouvrir le lecteur" style={{ ...styleBouton, border: "none", fontSize: "1rem", padding: "0.1rem 0.3rem" }}>🎧</button>
        <button
          data-lecteur-titre=""
          onClick={() => demanderRetourPageCourante()}
          title={`${page.titre} — ${page.livre} (cliquer pour ouvrir la page)`}
          style={{ background: "none", border: "none", color: "#cfe8ff", cursor: "pointer", fontSize: "0.8rem", maxWidth: "10rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: 0, textAlign: "left" }}
        >
          {page.titre}
        </button>
        {avecAudio && (
          <>
            <button data-lecteur-lecture="" onClick={basculerLecture} style={styleBouton}>{enLecture ? "⏸" : "▶"}</button>
            <button data-lecteur-arreter="" onClick={arreter} style={styleBouton}>⏹</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div data-lecteur-podcast="" style={{ ...conteneur, padding: "0.6rem 0.8rem" }}>
      {/* FR : élément audio unique, source = le MP3 embarqué (chemin relatif, base ./ du build). Jamais de réseau externe. / EN: single audio element, source = the embedded MP3 (relative path, build's ./ base). Never external network. */}
      <audio ref={refAudio} preload="metadata" onLoadedMetadata={gererMetadonnees} onTimeUpdate={gererTemps} onEnded={gererFin} onError={gererErreur} />
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <span aria-hidden="true">🎧</span>
        <button
          data-lecteur-titre=""
          onClick={() => demanderRetourPageCourante()}
          title="Ouvrir cette page dans le Legendarium"
          style={{ background: "none", border: "none", color: "#cfe8ff", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", padding: 0, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1 1 auto", minWidth: 0 }}
        >
          {page.titre}
        </button>
        <button data-lecteur-reduire="" onClick={() => setReduit(true)} title="Réduire le lecteur" style={{ ...styleBouton, border: "none", padding: "0.1rem 0.3rem" }}>▾</button>
      </div>
      <p style={{ margin: "0 0 0.4rem", fontSize: "0.75rem", color: "#9a968a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.livre}</p>
      {/* FR : ⚠️ AJOUT (23/10/2026, vibe/draft-podcast-840f64, suite) - l'IDENTIFIANT de la page, avec un bouton « copier » : c'est le NOM que l'enregistrement MP3 de cette page doit porter (convention `lore-<hash>.mp3` / `grimoire-<id>.mp3`). Affiché uniquement en DEV (outil de préparation des enregistrements) : en production, il n'apparaît pas (l'utilisateur n'a pas à le manipuler une fois les fichiers nommés). / EN: ADDED (draft-podcast) - the page's ID, with a "copy" button: it is the NAME this page's MP3 recording must carry (convention `lore-<hash>.mp3` / `grimoire-<id>.mp3`). Shown in DEV only (recording-preparation tool): in production it does not appear (the user has no use for it once files are named). */}
      {import.meta.env.DEV && (
        <p data-lecteur-id-page="" style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", color: "#7d7a70", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontFamily: "monospace" }}>id : {page.id}</span>
          <button data-lecteur-copier-id="" onClick={copierId} style={{ ...styleBouton, fontSize: "0.68rem", padding: "0.05rem 0.4rem" }}>
            {idCopie ? "✅ copié" : "📋 copier l'id"}
          </button>
        </p>
      )}
      {!avecAudio ? (
        <p data-lecteur-sans-audio="" style={{ margin: "0.2rem 0 0.4rem", fontSize: "0.8rem", color: "#7d7a70" }}>
          Pas d'enregistrement pour cette page (lecture texte seule).
        </p>
      ) : (
        <>
          <input
            data-lecteur-progression=""
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progression}
            onChange={(e) => chercher(Number(e.target.value))}
            aria-label="Progression de la lecture"
            style={{ width: "100%", accentColor: "#3d7eb5", margin: "0.2rem 0" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#9a968a", marginBottom: "0.4rem" }}>
            <span data-lecteur-temps="">{formaterTemps(position)}</span>
            <span>{formaterTemps(duree)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button data-lecteur-lecture="" onClick={basculerLecture} style={styleBouton} disabled={etat === "chargement"}>
              {enLecture ? "⏸ Pause" : enPause ? "▶ Reprendre" : "▶ Lire"}
            </button>
            <button data-lecteur-arreter="" onClick={arreter} style={styleBouton}>⏹ Arrêter</button>
            <button data-lecteur-suivant="" onClick={allerSuivant} disabled={!page.idSuivante} style={styleBouton}>⏭ Suivant</button>
            <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#9a968a" }}>
              {etat === "chargement" ? "chargement…" : etat === "termine" ? "terminé" : enLecture ? "en lecture" : enPause ? "en pause" : ""}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

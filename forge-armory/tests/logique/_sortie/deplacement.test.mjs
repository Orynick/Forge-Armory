import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// <define:import.meta.env>
var define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };

// src/lib/bungie/config.ts
var BUNGIE_ROOT = "https://www.bungie.net";
var BUNGIE_API_ROOT = `${BUNGIE_ROOT}/Platform`;
var bungieConfig = {
  apiKey: define_import_meta_env_default.VITE_BUNGIE_API_KEY,
  clientId: define_import_meta_env_default.VITE_BUNGIE_CLIENT_ID,
  redirectUri: define_import_meta_env_default.VITE_BUNGIE_REDIRECT_URI
};

// src/lib/bungie/oauth.ts
var STORAGE_KEY = "d2ba.bungie.tokens";
var refreshPromise = null;
var authGeneration = 0;
async function rafraichirTokens() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = rafraichirTokensInterne();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
async function rafraichirTokensInterne() {
  const generation = authGeneration;
  const actuels = lireTokens();
  if (!actuels) throw new Error("Aucun token \xE0 rafra\xEEchir, reconnexion n\xE9cessaire");
  if (!actuels.refresh_token) {
    signalerSessionExpiree();
    throw new SessionExpiree();
  }
  const reponse = await fetch(`${BUNGIE_ROOT}/Platform/App/OAuth/Token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-API-Key": bungieConfig.apiKey
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: actuels.refresh_token,
      client_id: bungieConfig.clientId
    })
  });
  if (!reponse.ok) throw new Error(`Rafra\xEEchissement du token \xE9chou\xE9 (${reponse.status})`);
  const data = await reponse.json();
  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? actuels.refresh_token,
    expires_at: Date.now() + data.expires_in * 1e3,
    membership_id: data.membership_id ?? actuels.membership_id
  };
  if (generation !== authGeneration) throw new Error("Session Bungie modifi\xE9e pendant le rafra\xEEchissement du token.");
  sauvegarderTokens(tokens);
  return tokens;
}
function lireTokens() {
  try {
    const brut = localStorage.getItem(STORAGE_KEY);
    if (!brut) return null;
    const tokens = JSON.parse(brut);
    if (typeof tokens.access_token !== "string" || // FR : ⚠️ RETIRÉ (07/09/2026) - `refresh_token` n'est PLUS exigé ici.
    // C'était la cause réelle de l'impossibilité de se connecter : sur un
    // client public, ce champ est absent, donc des jetons parfaitement
    // valides étaient jugés corrompus puis effacés juste après la
    // connexion réussie.
    // EN: ⚠️ REMOVED - `refresh_token` is NO LONGER required here; it is
    // absent on a public client, so valid tokens were wrongly wiped.
    typeof tokens.expires_at !== "number" || typeof tokens.membership_id !== "string") {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return tokens;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
function sauvegarderTokens(tokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}
var EVENEMENT_SESSION_EXPIREE = "d2:session-expiree";
function signalerSessionExpiree() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE));
}
var SessionExpiree = class extends Error {
  constructor() {
    super("Votre session Bungie a expir\xE9. Reconnectez-vous pour continuer.");
    this.name = "SessionExpiree";
  }
};
async function obtenirAccessTokenValide() {
  const tokens = lireTokens();
  if (!tokens) throw new Error("Non connect\xE9 \xE0 Bungie.net");
  if (tokens.expires_at - 6e4 > Date.now()) return tokens.access_token;
  const rafraichi = await rafraichirTokens();
  return rafraichi.access_token;
}

// src/lib/bungie/equiper.ts
async function transfererObjet(membership2, characterId, itemInstanceId, itemHash, versCoffre = false) {
  const accessToken = await obtenirAccessTokenValide();
  const reponse = await fetch(`${BUNGIE_API_ROOT}/Destiny2/Actions/Items/TransferItem/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": bungieConfig.apiKey,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      itemReferenceHash: itemHash,
      stackSize: 1,
      // FR : false = "tirer" l'objet VERS ce personnage depuis le COFFRE,
      // true = l'envoyer AU coffre depuis ce personnage. ⚠️ Corrigé le
      // 30/09/2026 : l'ancien commentaire disait « depuis le coffre ou un
      // autre personnage » ; en réalité l'API ne tire que depuis le coffre
      // (un objet porté par un autre personnage doit d'abord passer au coffre).
      // EN: false = pull TO this character from the VAULT, true = send it to
      // the vault from this character. The API only pulls from the vault.
      transferToVault: versCoffre,
      itemId: itemInstanceId,
      characterId,
      membershipType: membership2.membershipType
    })
  });
  if (!reponse.ok) {
    const corps = await reponse.text().catch(() => "");
    throw new Error(`Transfert \xE9chou\xE9 (${reponse.status})${corps ? ` : ${corps}` : ""}`);
  }
  const data = await reponse.json();
  if (data.ErrorCode !== 1) {
    throw new Error(
      `[${data.ErrorCode ?? "?"}/${data.ErrorStatus ?? "Unknown"}] ${data.Message || "\xC9chec du transfert"}`
    );
  }
}
var LIEU_COFFRE = 2;
async function lireProfilEquipement(membership2) {
  const accessToken = await obtenirAccessTokenValide();
  let reponseBungie;
  try {
    const reponse = await fetch(
      `${BUNGIE_API_ROOT}/Destiny2/${membership2.membershipType}/Profile/${membership2.membershipId}/?components=102,200,201,205`,
      // ⚠️ CHANGÉ (12/10/2026, v0.4.2) : + 200 (personnages et leur classe), en lecture seule
      { headers: { "X-API-Key": bungieConfig.apiKey, Authorization: `Bearer ${accessToken}` } }
    );
    reponseBungie = await reponse.json();
    if (reponseBungie?.ErrorCode !== 1) {
      return { ok: false, raison: `lecture du profil refus\xE9e par Bungie (HTTP ${reponse.status}, ${reponseBungie?.ErrorStatus ?? "r\xE9ponse inattendue"})` };
    }
  } catch (e) {
    return { ok: false, raison: `lecture du profil impossible (${e.message})` };
  }
  const r = reponseBungie.Response;
  if (!r?.profileInventory?.data || !r?.characterInventories?.data || !r?.characterEquipment?.data) {
    return { ok: false, raison: "inventaires non renvoy\xE9s par Bungie (coffre, personnages ou \xE9quipement manquant)" };
  }
  const parPerso = (d) => Object.fromEntries(Object.entries(d).map(([id, inv]) => [id, inv.items ?? []]));
  return {
    ok: true,
    profil: {
      coffre: r.profileInventory.data.items ?? [],
      inventaires: parPerso(r.characterInventories.data),
      equipement: parPerso(r.characterEquipment.data),
      classes: Object.fromEntries(
        Object.entries(r.characters?.data ?? {}).flatMap(([id, c]) => {
          const cle = ["titan", "chasseur", "arcaniste"][c.classType ?? -1];
          return cle ? [[id, cle]] : [];
        })
      )
    }
  };
}
function localiserDansProfil(profil2, itemInstanceId) {
  const cible = String(itemInstanceId);
  const chercher = (items) => items.find((it) => String(it.itemInstanceId) === cible);
  for (const [charId, items] of Object.entries(profil2.equipement)) {
    const it = chercher(items);
    if (it) return { etat: "localisee", characterId: charId, location: it.location, equipe: true, bucketHash: it.bucketHash };
  }
  for (const [charId, items] of Object.entries(profil2.inventaires)) {
    const it = chercher(items);
    if (it) return { etat: "localisee", characterId: charId, location: it.location, equipe: false, bucketHash: it.bucketHash };
  }
  const coffre = chercher(profil2.coffre);
  if (coffre) return { etat: "localisee", location: coffre.location ?? LIEU_COFFRE, equipe: false };
  return { etat: "introuvable" };
}
var EMPLACEMENTS_ARMES = { cinetique: 1498876634, energie: 2465295065, lourde: 953998645 };
var LISTE_EMPLACEMENTS_ARMES = Object.values(EMPLACEMENTS_ARMES);

// src/lib/bungie/deplacer.ts
var LIBELLES_LIEU = { coffre: "le Coffre", titan: "le Titan", chasseur: "le Chasseur", arcaniste: "l'Arcaniste" };
var LIEU_COURRIER = 4;
function planifierDeplacement(entree) {
  const { position, classes, cible, classeRequise } = entree;
  if (position.etat === "introuvable") return { ok: false, code: "introuvable", message: "Bungie ne trouve plus cet objet : votre inventaire a chang\xE9 en jeu. Rechargez votre inventaire, puis r\xE9essayez." };
  if (position.etat === "inconnue") return { ok: false, code: "inconnue", message: `Impossible de v\xE9rifier o\xF9 se trouve l'objet chez Bungie (${position.raison}). Rien n'a \xE9t\xE9 d\xE9plac\xE9.` };
  if (position.equipe) return { ok: false, code: "equipe", message: "Cet objet est \xE9quip\xE9 : il ne peut pas \xEAtre transf\xE9r\xE9. \xC9quipez un autre objet \xE0 sa place en jeu, puis r\xE9essayez." };
  if (position.location === LIEU_COURRIER) return { ok: false, code: "courrier", message: "Cet objet est dans le courrier (r\xE9cup\xE9ration) : il ne peut pas \xEAtre transf\xE9r\xE9 d'ici." };
  let source;
  if (position.characterId) {
    const classe = classes?.[position.characterId];
    if (!classe) return { ok: false, code: "inconnue", message: "Impossible de savoir \xE0 quelle classe appartient le personnage qui porte l'objet. Rien n'a \xE9t\xE9 d\xE9plac\xE9." };
    source = classe;
  } else source = "coffre";
  if (source === cible) return { ok: false, code: "deja", message: `L'objet est d\xE9j\xE0 dans ${LIBELLES_LIEU[cible]}.`, lieuActuel: source };
  if (cible !== "coffre" && classeRequise && classeRequise !== cible) return { ok: false, code: "classe", message: `Une armure ${classeRequise === "arcaniste" ? "d'Arcaniste" : classeRequise === "titan" ? "de Titan" : "de Chasseur"} ne peut aller que chez un personnage de cette classe, ou au Coffre.` };
  const idDe = (lieu) => Object.entries(classes ?? {}).find(([, c]) => c === lieu)?.[0];
  const etapes = [];
  if (source !== "coffre") {
    const id = position.characterId;
    etapes.push({ op: "envoyer", characterId: id });
  }
  if (cible !== "coffre") {
    const id = idDe(cible);
    if (!id) return { ok: false, code: "sans-personnage", message: `Aucun personnage ${cible === "arcaniste" ? "Arcaniste" : cible === "titan" ? "Titan" : "Chasseur"} sur ce compte.` };
    etapes.push({ op: "tirer", characterId: id });
  }
  return { ok: true, source, cible, etapes, viaCoffre: source !== "coffre" && cible !== "coffre" };
}
function expliquerErreurTransfert(erreur) {
  const texte = erreur instanceof Error ? erreur.message : String(erreur);
  if (/NoRoomInDestination/i.test(texte)) return "Plus de place \xE0 destination : lib\xE9rez un emplacement (ou videz un peu le Coffre), puis r\xE9essayez.";
  if (/DestinyItemNotFound/i.test(texte)) return "Bungie ne trouve plus cet objet (votre inventaire a chang\xE9 en jeu) : rechargez votre inventaire.";
  if (/Equipped/i.test(texte)) return "L'objet est \xE9quip\xE9 : il ne peut pas \xEAtre transf\xE9r\xE9.";
  if (/NotTransferr?able/i.test(texte)) return "Cet objet ne peut pas \xEAtre transf\xE9r\xE9.";
  if (/Throttle/i.test(texte)) return "Trop de requ\xEAtes envoy\xE9es \xE0 Bungie : attendez quelques secondes, puis r\xE9essayez.";
  if (/SystemDisabled|UnderMaintenance|ServiceUnavailable|DestinyServiceFailure|DestinyUnexpectedError|DestinyThrottledByGameServer/i.test(texte)) return "Les serveurs de Destiny ne r\xE9pondent pas (maintenance ou surcharge) : r\xE9essayez plus tard.";
  return texte;
}
async function executerPlan(plan2, transferer) {
  for (let i = 0; i < plan2.etapes.length; i++) {
    const etape = plan2.etapes[i];
    try {
      await transferer(etape.characterId, etape.op === "envoyer");
    } catch (e) {
      if (e instanceof SessionExpiree) throw e;
      if (i === 0) return { ok: false, message: `\xC9chec du transfert : ${expliquerErreurTransfert(e)} Rien n'a \xE9t\xE9 d\xE9plac\xE9.` };
      return { ok: false, lieuFinal: "coffre", message: `L'objet est maintenant dans le Coffre, mais la seconde \xE9tape (vers ${plan2.cible === "arcaniste" ? "l'Arcaniste" : plan2.cible === "titan" ? "le Titan" : "le Chasseur"}) a \xE9chou\xE9 : ${expliquerErreurTransfert(e)}` };
    }
  }
  const via = plan2.viaCoffre ? " (en passant par le Coffre)" : "";
  return { ok: true, lieuFinal: plan2.cible, message: `Transf\xE9r\xE9 : ${LIBELLES_LIEU[plan2.source]} \u2192 ${LIBELLES_LIEU[plan2.cible]}${via}.` };
}
var DEPENDANCES_REELLES = { lireProfil: lireProfilEquipement, transferer: transfererObjet };
async function deplacerObjet(membership2, piece2, cible, dependances = DEPENDANCES_REELLES) {
  if (!piece2.itemInstanceId) return { ok: false, message: "Cet objet n'a pas d'identifiant d'instance : il ne peut pas \xEAtre transf\xE9r\xE9." };
  const lecture = await dependances.lireProfil(membership2);
  if (!lecture.ok) return { ok: false, message: `Impossible de v\xE9rifier o\xF9 se trouve l'objet chez Bungie (${lecture.raison}). Rien n'a \xE9t\xE9 d\xE9plac\xE9.` };
  const position = localiserDansProfil(lecture.profil, piece2.itemInstanceId);
  const plan2 = planifierDeplacement({ position, classes: lecture.profil.classes, cible, classeRequise: piece2.classeRequise });
  if (!plan2.ok) return { ok: false, message: plan2.message, lieuFinal: plan2.code === "deja" ? plan2.lieuActuel : void 0 };
  return executerPlan(plan2, (characterId, versCoffre) => dependances.transferer(membership2, characterId, piece2.itemInstanceId, piece2.itemHash, versCoffre));
}

// tests/logique/deplacement.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var CLASSES = { "id-titan": "titan", "id-chasseur": "chasseur", "id-arcaniste": "arcaniste" };
var loc = (characterId, equipe = false, location) => ({ etat: "localisee", characterId, equipe, location });
var plan = (position, cible, classeRequise, classes = CLASSES) => planifierDeplacement({ position, classes, cible, classeRequise });
var p1 = plan(loc(void 0), "titan");
ok("Coffre \u2192 Titan : UNE \xE9tape, tirer vers le Titan", p1.ok && JSON.stringify(p1.etapes) === JSON.stringify([{ op: "tirer", characterId: "id-titan" }]) && !p1.viaCoffre, p1);
var p2 = plan(loc("id-chasseur"), "coffre");
ok("Chasseur \u2192 Coffre : UNE \xE9tape, envoyer depuis le Chasseur", p2.ok && JSON.stringify(p2.etapes) === JSON.stringify([{ op: "envoyer", characterId: "id-chasseur" }]), p2);
var p3 = plan(loc("id-titan"), "arcaniste");
ok("Titan \u2192 Arcaniste : DEUX \xE9tapes dans cet ordre, envoyer au Coffre depuis le Titan PUIS tirer vers l'Arcaniste (l'API ne transf\xE8re qu'entre un personnage et le Coffre)", p3.ok && p3.viaCoffre && JSON.stringify(p3.etapes) === JSON.stringify([{ op: "envoyer", characterId: "id-titan" }, { op: "tirer", characterId: "id-arcaniste" }]), p3);
var refus = (p) => p.ok ? "ok" : p.code;
ok("un objet \xC9QUIP\xC9 est refus\xE9, avec une explication (r\xE8gle de l'utilisateur)", refus(plan(loc("id-titan", true), "coffre")) === "equipe" && /équipé/.test(plan(loc("id-titan", true), "coffre").message));
ok("un objet dans le COURRIER (emplacement 4) est refus\xE9", refus(plan(loc("id-titan", false, 4), "coffre")) === "courrier");
ok("un objet INTROUVABLE chez Bungie est refus\xE9 (inventaire modifi\xE9 en jeu) et un profil illisible aussi : rien n'est tent\xE9 \xE0 l'aveugle", refus(plan({ etat: "introuvable" }, "titan")) === "introuvable" && refus(plan({ etat: "inconnue", raison: "x" }, "titan")) === "inconnue");
var dj = plan(loc("id-titan"), "titan");
ok("d\xE9j\xE0 \xE0 destination : refus\xE9 sans rien appeler, et le lieu r\xE9el est rendu pour resynchroniser l'\xE9cran", !dj.ok && dj.code === "deja" && dj.lieuActuel === "titan");
ok("ARMURE : une armure d'Arcaniste ne va pas chez le Titan (refus\xE9), mais va au Coffre et chez l'Arcaniste ; une ARME (sans classe requise) va partout", refus(plan(loc(void 0), "titan", "arcaniste")) === "classe" && refus(plan(loc("id-arcaniste"), "coffre", "arcaniste")) === "ok" && refus(plan(loc(void 0), "arcaniste", "arcaniste")) === "ok" && refus(plan(loc(void 0), "chasseur")) === "ok");
ok("aucun personnage de la classe vis\xE9e sur le compte : refus\xE9 clairement", refus(plan(loc(void 0), "arcaniste", void 0, { "id-titan": "titan" })) === "sans-personnage");
ok("un personnage dont la classe est inconnue (profil sans composant 200) : refus\xE9, on ne devine pas", refus(plan(loc("id-x"), "coffre", void 0, {})) === "inconnue");
var journal = [];
var faux = (echecA, erreur = new Error("[1642/DestinyNoRoomInDestination] pas de place")) => {
  let n = 0;
  return async (c, v) => {
    if (echecA === n++) throw erreur;
    journal.push(`${v ? "ENVOYER" : "TIRER"}:${c}`);
  };
};
journal.length = 0;
var r1 = await executerPlan(p3, faux(null));
ok("ex\xE9cution r\xE9ussie : les deux appels sont faits dans le bon ordre et le r\xE9sultat dit \xAB en passant par le Coffre \xBB", journal.join() === "ENVOYER:id-titan,TIRER:id-arcaniste" && r1.ok && r1.lieuFinal === "arcaniste" && /en passant par le Coffre/.test(r1.message), [journal, r1]);
journal.length = 0;
var r2 = await executerPlan(p3, faux(0));
ok("\xE9chec \xE0 la PREMI\xC8RE \xE9tape : un seul appel tent\xE9, \xAB rien n'a \xE9t\xE9 d\xE9plac\xE9 \xBB, aucun lieu final (l'objet n'a pas boug\xE9)", journal.length === 0 && !r2.ok && r2.lieuFinal === void 0 && /Rien n'a été déplacé/.test(r2.message) && /Plus de place/.test(r2.message), r2);
journal.length = 0;
var r3 = await executerPlan(p3, faux(1));
ok("\xE9chec \xE0 la SECONDE \xE9tape : l'objet est dans le Coffre, le r\xE9sultat le dit clairement et rend \xAB coffre \xBB comme lieu final (l'\xE9cran se met \xE0 jour)", journal.join() === "ENVOYER:id-titan" && !r3.ok && r3.lieuFinal === "coffre" && /maintenant dans le Coffre/.test(r3.message), r3);
var remonte = false;
try {
  await executerPlan(p3, faux(0, new SessionExpiree()));
} catch (e) {
  remonte = e instanceof SessionExpiree;
}
ok("une SESSION EXPIR\xC9E n'est pas aval\xE9e : elle remonte \xE0 l'interface", remonte);
var m = (s) => expliquerErreurTransfert(new Error(s));
ok("erreurs Bungie traduites : plus de place, objet introuvable, \xE9quip\xE9, non transf\xE9rable, trop de requ\xEAtes, serveurs en maintenance", /Plus de place/.test(m("[1642/DestinyNoRoomInDestination] x")) && /ne trouve plus/.test(m("[1623/DestinyItemNotFound] x")) && /équipé/.test(m("[1665/DestinyCannotPerformActionOnEquippedItem] x")) && /ne peut pas être transféré/.test(m("[1/DestinyItemNotTransferrable] x")) && /Trop de requêtes/.test(m("[36/ThrottleLimitExceeded] x")) && /serveurs de Destiny/.test(m("[5/SystemDisabled] x")));
ok("un statut inconnu garde le texte d'origine de Bungie (rien d'invent\xE9)", m("[999/UnPetitStatutInconnu] Message original") === "[999/UnPetitStatutInconnu] Message original");
var profil = (equipement, inventaires, coffre, classes = CLASSES) => ({ ok: true, profil: { coffre, inventaires, equipement, classes } });
var appels = [];
var dep = (lecture, echec = false) => ({ lireProfil: async () => lecture, transferer: async (_m, c, id, h, v) => {
  appels.push(`${v ? "ENVOYER" : "TIRER"}:${c}:${id}:${h}`);
  if (echec) throw new Error("[1623/DestinyItemNotFound] x");
} });
var membership = { membershipType: 3, membershipId: "1", displayName: "Test" };
var piece = (o = {}) => ({ itemInstanceId: "i1", itemHash: 111, nom: "Arme A", ...o });
appels.length = 0;
var e1 = await deplacerObjet(membership, piece(), "coffre", dep(profil({}, { "id-titan": [{ itemInstanceId: "i1" }] }, [])));
ok("point d'entr\xE9e : position lue en direct (Titan), envoi au Coffre avec le BON identifiant de personnage, d'instance et d'objet", e1.ok && e1.lieuFinal === "coffre" && appels.join() === "ENVOYER:id-titan:i1:111", [e1, appels]);
appels.length = 0;
var e2 = await deplacerObjet(membership, piece(), "coffre", dep(profil({ "id-titan": [{ itemInstanceId: "i1" }] }, {}, [])));
ok("point d'entr\xE9e : l'objet est \xC9QUIP\xC9 en vrai (m\xEAme si l'\xE9cran le croyait rang\xE9) : refus, AUCUN appel de transfert", !e2.ok && /équipé/.test(e2.message) && appels.length === 0, [e2, appels]);
appels.length = 0;
var e3 = await deplacerObjet(membership, piece(), "titan", dep(profil({}, {}, [{ itemInstanceId: "i1" }]), true));
ok("point d'entr\xE9e : \xE9chec de Bungie \xE0 la premi\xE8re \xE9tape : message clair, aucun lieu final", !e3.ok && e3.lieuFinal === void 0 && /ne trouve plus/.test(e3.message), e3);
var e4 = await deplacerObjet(membership, piece(), "titan", dep({ ok: false, raison: "droits manquants" }));
ok("point d'entr\xE9e : profil illisible : rien n'est tent\xE9 et la raison est donn\xE9e", !e4.ok && /droits manquants/.test(e4.message) && appels.length === 1, [e4, appels]);
var e5 = await deplacerObjet(membership, piece({ itemInstanceId: void 0 }), "titan", dep(profil({}, {}, [])));
ok("un objet sans identifiant d'instance ne peut pas \xEAtre transf\xE9r\xE9 (message clair)", !e5.ok && /identifiant d'instance/.test(e5.message));
var e6 = await deplacerObjet(membership, piece(), "coffre", dep(profil({}, {}, [{ itemInstanceId: "i1" }])));
ok("d\xE9j\xE0 au Coffre : pas d'appel, et le lieu r\xE9el est rendu pour resynchroniser l'\xE9cran", !e6.ok && e6.lieuFinal === "coffre" && /déjà/.test(e6.message) && appels.length === 1, [e6, appels]);
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);

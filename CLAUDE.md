# ADN WebOS — Claude Context

Application WebOS non-officielle pour le service de streaming Animation Digital Network (ADN).
Cible : TV LG avec WebOS 4.x et supérieur.

---

## Objectif du projet

Créer une application TV native pour ADN (https://animationdigitalnetwork.com/), service français de streaming anime.
ADN n'a pas d'application officielle WebOS — l'utilisateur accède aujourd'hui au site via le navigateur TV, ce qui est inconfortable.

L'approche choisie est l'**intégration API complète** : pas de WebView, on consomme l'API REST d'ADN directement pour construire une interface native TV.

---

## Stack technique

| Élément | Choix | Raison |
|---|---|---|
| Framework UI | Enact + Sandstone | Framework officiel LG pour WebOS, navigation D-pad intégrée (Spotlight), composants TV-ready |
| Langage | JavaScript (ES2018) | Enact CLI gère la transpilation, pas besoin de configurer TypeScript séparément |
| Vidéo | `VideoPlayer` Sandstone + HLS natif WebOS | WebOS supporte HLS nativement, pas besoin de HLS.js |
| Styles | LESS (CSS Modules) + custom skin | Format natif Enact, surcharge via `customizations/custom_skin.css` |
| Build | Enact CLI (`enact pack`) | Outillage officiel, gère WebOS, résolution TV, i18n |
| Packaging WebOS | `ares-cli` | Outillage officiel LG pour créer les `.ipk` |

### Patterns Enact à respecter

- **`kind()`** : uniquement pour les composants purement présentationnels (pas de hooks)
- **React function components** : pour tout composant avec `useState`/`useEffect` — c'est le pattern officiel Enact pour les vues avec état (cf. sample `pattern-video-player`)
- **`useCallback`** : obligatoire pour les handlers passés en props JSX (règle ESLint `react/jsx-no-bind`)
- **Pas d'arrow functions dans les props JSX** : extraire les handlers avec `useCallback`

---

## Architecture de l'application

```
src/
├── App/
│   ├── App.js            # Composant racine (ThemeDecorator), routing manuel par état
│   └── App.module.less   # Styles globaux + classes login
├── api/
│   ├── client.js         # Fetch wrapper avec headers ADN (Authorization, X-Target-Distribution)
│   ├── auth.js           # Login, logout, refresh token
│   ├── catalog.js        # Home, recherche, shows, épisodes
│   └── player.js         # Config lecteur, URL stream HLS
├── views/                # Composants React avec état (pas kind())
│   ├── LoginPanel.js
│   ├── HomePanel.js
│   ├── SearchPanel.js
│   ├── SeriePanel.js
│   └── PlayerPanel.js
└── components/
    └── ShowGrid/
        └── ShowGrid.js   # kind() — purement visuel (liste de covers)
```

### Routing

Routing manuel par `useState` dans `App.js` (pas de react-router). Les vues sont montées/démontées conditionnellement selon `view` ∈ `{login, home, search, serie, player}`. L'historique de navigation est géré dans un tableau via `setNavHistory`.

---

## API ADN

**Base URL :** `https://gw.api.animationdigitalnetwork.com`

Le host n'est pas censé être codé en dur : les apps officielles lisent
`https://animationdigitalnetwork.com/api-definition.json` au démarrage, qui renvoie
`{"version": 3.0, "host": "https://gw.api.animationdigitalnetwork.com"}`. Aujourd'hui la valeur
est identique au défaut — c'est un interrupteur de secours pour une future migration d'infra.

### Endpoints

Colonne **Src** : `TV` = relevé dans les annotations Retrofit de l'app Android TV `fr.anidn`
Tv6.9.40 · `web` = capturé sur le site (cf. `resources/req-*`) · `?` = non vérifié.

| Méthode | Endpoint | Usage | Src |
|---|---|---|---|
| GET | `/show/home?maxAgeCategory&app=` | **Accueil : pilote l'ordre et le type des sections** | TV |
| GET | `/show/catalog?maxAgeCategory` + `search` `limit` `genres` | Catalogue / recherche | TV |
| GET | `/show/carousel` + `limit` `responseType=light` | Carrousel de mise en avant | TV+web |
| GET | `/show/top` + `limit` | Top séries | web |
| GET | `/show/{showId}` | Infos d'une série | TV |
| GET | `/show/{showId}/season` + `order` | Métadonnées des saisons (`{season, title, limit, offset}`) | TV |
| GET | `/show/{showId}/related?maxAgeCategory` + `limit` | « Anime à voir ensuite » | TV |
| GET | `/show/user/recommended?maxAgeCategory` | Reco personnalisées | TV |
| GET | `/show/user/viewing/recommended?maxAgeCategory` | Reco selon l'historique | TV |
| GET | `/video/show/{showId}` + `offset` `limit` `order` `season` | Épisodes d'une saison, paginés | TV |
| GET | `/video/show/{showId}/seasons` + `order` | Saisons **avec** leurs épisodes | ? |
| GET | `/video/calendar` + `date=YYYY-MM-DD` | Calendrier de diffusion | web |
| GET | `/video/user/notification` | Notifications | TV |
| GET | `/viewing/history` + `merged` `onlyNext` | Historique / reprise de lecture | TV+web |
| GET | `/viewing/history/show/{showId}/last` | Dernier épisode vu d'une série | TV |
| PUT | `/viewing/history/video/{videoId}` | Remonter la progression | TV+web |
| GET | `/watchlist?maxAgeCategory` | Watchlist | TV |
| PUT / DELETE | `/watchlist/show/{showId}` | Ajouter / retirer | TV |
| GET | `/watchlist/show/{showId}/status` | État d'une série | TV |
| PATCH | `/watchlist/sort` | Réordonner | TV |
| POST | `/authentication/login` · `/logout` · `/refresh` | Session | TV |
| POST | `/authentication/2fa/ask` · `/2fa/verify` | Double authentification | TV |
| GET | `/user` · POST `/user` · PUT `/user/lastvisit` | Compte, inscription | TV |
| GET | `/profile` · `/profile/{id}` · PUT `/profile/{id}` | Profils | TV |
| GET | `/player/publickey` | Clé publique RSA du lecteur | TV |
| GET | `/player/video/{id}/configuration` | Config du lecteur | TV |
| POST | `/player/chromecast/refresh/token` | Token Chromecast | TV |
| GET | `/geolocation/config` · `/geolocation/test` | Géoblocage | TV |

> ⚠️ Il n'existe **pas** d'endpoint `/player/video/{id}/link` en dur. Les appels du lecteur
> (`link`, `raw url`, `video location`, `subtitle location`, `refresh token`) utilisent des **URL
> dynamiques** renvoyées par `/player/video/{id}/configuration`. `POST /player/refresh/token` existe
> bien, mais il n'est pas dans l'interface Retrofit : il est appelé manuellement par
> `TokenAuthenticator` (cf. ci-dessous). C'est ce que fait déjà `src/api/player.ts`.

### Headers

Aucun header propriétaire n'est réellement obligatoire : les captures web n'envoient que
`accept`, `accept-language` et `authorization`. L'app TV n'envoie **jamais**
`X-Target-Distribution` (seule l'app mobile le fait, en minuscules).

```
Authorization: Bearer <accessToken>   # session compte
X-Profile-ID: <profileId>             # profil actif, sur les endpoints personnalisés
X-Player-Access-Token: <token>        # requêtes lecteur (progression, etc.)
X-Player-Refresh-Token: <token>       # rafraîchir le token lecteur
X-Player-Token: <RSA(...)>            # récupération du lien de stream
Accept-Language: fr                   # région (fr, de, pl)
```

### Deux conventions déclaratives à reprendre

Les apps officielles marquent les besoins d'un appel dans sa déclaration, et un interceptor unique
les résout. C'est plus propre que de passer profil et âge à chaque fonction :

- **`?maxAgeCategory` sans valeur** dans l'URL : `AgeCategoryInterceptor` le remplace par
  `maxAgeCategory=<âge du profil>`, ou le supprime si aucun âge n'est défini.
- **`<Header>: dummy`** en en-tête : l'interceptor correspondant remplace la valeur `dummy` par le
  vrai token, ou retire l'en-tête. Utilisé pour `Authorization`, `X-Profile-ID`,
  `X-Player-Access-Token`.

### Flux d'authentification

1. POST `/authentication/login` → reçoit `accessToken` + `refreshToken`
2. Stocker les deux tokens en `localStorage`
3. Rafraîchir l'access token via `/authentication/refresh` avant expiration
4. Lecture vidéo : `/player/video/{id}/configuration` → rafraîchir le token lecteur sur l'URL
   qu'elle fournit → chiffrer `{k, t}` en RSA-PKCS1 avec `/player/publickey` → appeler l'URL de
   `link` avec `X-Player-Token`. Implémenté dans `src/api/player.ts`.

Sur 401, l'app officielle distingue deux cas dans un `Authenticator` unique, avec
`/authentication/refresh` et `/player/refresh/token` **exclus** du retry pour éviter les boucles :

- la requête portait `X-Player-Access-Token` → rafraîchir le **token lecteur**, rejouer
- sinon, elle portait `Authorization` → rafraîchir l'**access token du compte**, rejouer

> Sources : annotations Retrofit de `fr.anidn.library.api.ADNService` (app Android TV Tv6.9.40),
> captures du site web dans `resources/req-*`, et pour mémoire
> [yt-dlp](https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/adn.py) /
> [multi-downloader-nx](https://github.com/anidl/multi-downloader-nx/blob/master/adn.ts) qui ciblent
> des versions plus anciennes de l'API.

---

## Spécificités WebOS TV

### Navigation télécommande
- Spotlight (Enact) gère la navigation D-pad automatiquement pour les composants Sandstone
- Touche `Back` = keyCode 461 sur WebOS
- Focus visuel critique — ne pas supprimer les outlines

### Keycodes WebOS
```
OK / Enter  : 13    Back        : 461
Up          : 38    Down        : 40
Left        : 37    Right       : 39
Play/Pause  : 415 / 19          Stop : 413
Rewind      : 412   FastForward : 417
```

### Contraintes moteur web
- WebOS 4.x ≈ Chrome 53 — Enact CLI transpile en conséquence
- WebOS 6.x ≈ Chrome 87
- Mémoire limitée : viser < 250 MB RAM

### Pagination et scroll infini

Deux endpoints acceptent `offset` / `limit` : `GET /video/show/{showId}` (épisodes d'une saison) et
`GET /show/catalog` (`limit`). `GET /show/{showId}/season` renvoie d'ailleurs un `limit` et un
`offset` par saison — le serveur indique lui-même comment paginer. Utile pour les grosses séries :
One Piece annonce `episodeCount: 1194`.

**Sandstone sait faire du scroll infini sans API dédiée** : il suffit de faire croître la prop
`dataSize` de `VirtualList` / `VirtualGridList`. Enact conserve `firstIndex` et le focus lors de
l'agrandissement — pas de saut de scroll. Le déclencheur vient de `onScrollStop`, dont l'événement
contient tout le nécessaire (vérifié dans `@enact/ui/useScroll/useScroll.js`) :

```js
onScrollStop({
    scrollLeft, scrollTop,
    moreInfo:        {firstVisibleIndex, lastVisibleIndex},
    reachedEdgeInfo: {top, bottom, left, right}
})
```

```jsx
const handleScrollStop = useCallback(({moreInfo, reachedEdgeInfo}) => {
    if (loading || items.length >= total) return;
    // marge d'anticipation pour masquer la latence réseau
    if (reachedEdgeInfo.bottom || moreInfo.lastVisibleIndex >= items.length - 12) {
        loadMore(items.length);   // offset = nombre d'éléments déjà chargés
    }
}, [loading, items.length, total]);

<VirtualGridList
    dataSize={items.length}
    itemSize={{minWidth: ri.scale(245), minHeight: ri.scale(454)}}
    itemRenderer={renderItem}
    onScrollStop={handleScrollStop}
/>
```

Le `total` renvoyé par `/show/catalog` et `/show/top` sert de condition d'arrêt.
⚠️ `/show/carousel` n'a **pas** de `total`.

Points d'attention :
- garder les items dans un `useRef` ou un state stable : `itemRenderer` doit rester référentiellement
  stable (`useCallback`), sinon la liste se re-render entièrement à chaque page ajoutée
- ne pas remonter `dataSize` puis le redescendre, cela casse la position de scroll
- une row par saison sur la fiche série multiplie les images à charger ; préférer une
  `VirtualGridList` horizontale par saison, chargée à la demande quand la row devient visible

---

## Build et déploiement

```bash
npm run serve        # Dev server (localhost:8080)
npm run pack         # Build dev → dist/
npm run pack-p       # Build production → dist/
npm run lint         # ESLint
```

### Packaging et installation TV

```bash
npm install -g @webos-tools/cli
ares-setup-device                # Configurer la TV (Developer Mode requis)
ares-package dist/               # Crée le .ipk
ares-install com.adn.webos.ipk   # Installe sur la TV
ares-launch com.adn.webos        # Lance l'app
```

---

## Roadmap

- [x] Scaffold Enact Sandstone
- [x] Client API ADN (auth, catalog, player)
- [x] Vues : Login, Home, Search, Serie, Player
- [x] Custom skin CSS (couleurs ADN)
- [x] appinfo.json WebOS
- [ ] Tester les endpoints avec de vrais credentials ADN
- [ ] Implémenter le player token RSA-2048
- [ ] Créer les icônes PNG (80px, 130px)
- [ ] Packaging `.ipk` et test sur TV
- [ ] Page d'accueil : affiner les sections (nouveautés, tendances)
- [ ] Gestion d'erreur 401 → re-login automatique
- [ ] Distribution via HomeBrew Channel

---

## Références

- [webOS TV Developer Portal](https://webostv.developer.lge.com/)
- [Enact documentation](https://enactjs.com/docs/)
- [Sandstone components](https://github.com/enactjs/sandstone)
- [Enact samples officiels](https://github.com/enactjs/samples/tree/master/sandstone)
- [multi-downloader-nx/adn.ts](https://github.com/anidl/multi-downloader-nx/blob/master/adn.ts) — référence API ADN
- [yt-dlp ADN extractor](https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/adn.py) — référence API ADN
- [Crunchyroll WebOS](https://github.com/mateussouzaweb/crunchyroll-webos) — inspiration projet WebOS

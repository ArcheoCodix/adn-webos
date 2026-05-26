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

### Endpoints

| Méthode | Endpoint | Usage |
|---|---|---|
| POST | `/authentication/login` | Connexion (email + password) |
| POST | `/authentication/refresh` | Rafraîchir l'access token |
| GET | `/show/catalog` | Catalogue / recherche (`?search=`, `?page=`) |
| GET | `/video/show/{id}` | Infos d'une série |
| GET | `/video/show/{id}/videos` | Liste des épisodes |
| GET | `/player/video/{id}/configuration` | Config du lecteur |
| GET | `/player/video/{id}/link` | URL du stream HLS |
| POST | `/player/refresh/token` | Rafraîchir le token player |

### Headers requis

```
X-Target-Distribution: fr        # Région (fr, de, pl)
Authorization: Bearer <token>    # Access token OAuth
Content-Type: application/json
```

### Flux d'authentification

1. POST `/authentication/login` → reçoit `accessToken` + `refreshToken`
2. Stocker les deux tokens en `localStorage`
3. Rafraîchir l'access token via `/authentication/refresh` avant expiration
4. Pour lire une vidéo : le player token RSA-2048 est probablement nécessaire (à implémenter — cf. [multi-downloader-nx/adn.ts](https://github.com/anidl/multi-downloader-nx/blob/master/adn.ts))

> Sources API : [yt-dlp ADN extractor](https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/adn.py) et [multi-downloader-nx/adn.ts](https://github.com/anidl/multi-downloader-nx/blob/master/adn.ts)

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

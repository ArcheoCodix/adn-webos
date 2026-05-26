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
| Langage | TypeScript | Typage fort, meilleure maintenabilité |
| Framework UI | React + Vite | Moderne, flexible, large écosystème |
| Navigation D-pad | `@noriginmedia/norigin-spatial-navigation` | Bibliothèque éprouvée pour navigation spatiale TV |
| Vidéo | HLS.js | Streaming adaptatif HLS, même approche que le projet Crunchyroll |
| Styles | SCSS | Structuration CSS, variables, nesting |
| Build | Vite | Rapide, config simple, TypeScript natif |
| Packaging WebOS | ares-cli (webOS CLI) | Outillage officiel LG pour créer les `.ipk` |

**Pourquoi pas Enact ?**
Enact (framework officiel LG) est très opinioné, impose le design system Sandstone/Moonstone, et a une courbe d'apprentissage élevée. React + navigation spatiale donne plus de contrôle sur l'UI avec un effort similaire.

---

## Architecture de l'application

```
src/
├── api/
│   ├── client.ts        # Fetch wrapper avec gestion des headers ADN
│   ├── auth.ts          # Login, logout, refresh token, RSA player token
│   ├── catalog.ts       # Recherche, catalogue, shows
│   ├── player.ts        # Configuration lecteur, stream links
│   └── types.ts         # Types TypeScript pour toutes les réponses API
├── components/
│   ├── App.tsx          # Composant racine, routing
│   ├── Navigation/      # Menu latéral TV
│   ├── Home/            # Page d'accueil (recommandations, nouveautés)
│   ├── Catalog/         # Browse / exploration du catalogue
│   ├── Search/          # Recherche
│   ├── Serie/           # Détail d'une série (saisons, épisodes)
│   ├── Player/          # Lecteur vidéo HLS
│   └── Login/           # Formulaire de connexion
├── hooks/
│   ├── useAuth.ts       # Gestion de l'état d'authentification
│   ├── useFocusable.ts  # Wrapper autour de la navigation spatiale
│   └── usePlayer.ts     # État et contrôles du lecteur
├── store/
│   └── auth.ts          # Tokens et profil stockés en localStorage
├── styles/
│   ├── globals.scss     # Variables, reset, typo
│   └── tv.scss          # Adaptations spécifiques TV (taille, curseur, focus)
└── main.tsx             # Point d'entrée
```

---

## API ADN

**Base URL :** `https://gw.api.animationdigitalnetwork.com`

### Endpoints connus

| Méthode | Endpoint | Usage |
|---|---|---|
| POST | `/authentication/login` | Connexion (email + password) |
| POST | `/authentication/refresh` | Rafraîchir l'access token |
| GET | `/show/catalog` | Catalogue / recherche |
| GET | `/video/show/{id}` | Infos d'une série |
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
2. Stocker les deux tokens en localStorage
3. Pour lire une vidéo : générer un **player token** via chiffrement RSA-2048
   - Générer une clé hex 16 caractères aléatoire
   - Concaténer avec `"7fac1178830cfe0c"`
   - Chiffrer les credentials via la clé publique RSA d'ADN
   - Envoyer dans le header `X-Player-Token`
4. Rafraîchir l'access token via `/authentication/refresh` avant expiration

> Sources : implémentations dans [yt-dlp](https://github.com/yt-dlp/yt-dlp) et [multi-downloader-nx](https://github.com/anidl/multi-downloader-nx/blob/master/adn.ts)

---

## Spécificités WebOS TV

### Navigation télécommande
- Toute l'interface doit être navigable au D-pad (haut/bas/gauche/droite + OK)
- Pas de souris — le focus visuel est critique (outline large et visible)
- Touche `Back` = retour (event `keydown` avec keyCode 461 sur WebOS)
- Géré via `@noriginmedia/norigin-spatial-navigation`

### Keycodes WebOS
```
OK / Enter  : 13
Back        : 461
Up          : 38
Down        : 40
Left        : 37
Right       : 39
Play/Pause  : 415 / 19
Stop        : 413
Rewind      : 412
FastForward : 417
```

### Types d'apps WebOS
- **Packaged app** : tous les fichiers dans le `.ipk`, tourne en local sur la TV
- **Hosted app** : l'`index.html` redirige vers une URL distante
- On choisit **packaged** pour éviter toute dépendance réseau pour l'app elle-même

### Contraintes moteur web
- WebOS utilise un moteur Chromium figé selon la version du firmware
- WebOS 4.x ≈ Chrome 53 — éviter les features CSS/JS très récentes
- WebOS 6.x ≈ Chrome 87
- Tester avec `@babel/preset-env` + cibles appropriées si nécessaire
- Mémoire limitée : viser < 250 MB RAM

### appinfo.json
```json
{
  "id": "com.adn.webos",
  "version": "0.1.0",
  "vendor": "Community",
  "type": "web",
  "main": "index.html",
  "title": "ADN",
  "icon": "images/icon80.png",
  "largeIcon": "images/icon130.png",
  "bgColor": "#1a1a2e",
  "iconColor": "#e63946",
  "disableBackHistoryAPI": true
}
```

---

## Build et déploiement

```bash
npm run dev          # Dev server (test navigateur)
npm run build        # Build production → dist/
npm run package      # Crée le .ipk WebOS → bin/
npm run install-tv   # Installe sur TV connectée (ares-install)
npm run launch-tv    # Lance l'app sur la TV
```

### Prérequis pour déployer sur TV
1. Activer le **Developer Mode** sur la TV LG (application "Developer Mode" du store)
2. Installer `@webos-tools/cli` : `npm install -g @webos-tools/cli`
3. Connecter la TV : `ares-setup-device`

### Distribution alternative
- Via [HomeBrew Channel](https://github.com/webosbrew/webos-homebrew-channel) (recommandé pour les utilisateurs finaux)
- Générer un manifest WebBrew avec `ares-generate` ou script custom

---

## Roadmap initiale

- [ ] Scaffold React + TypeScript + Vite
- [ ] Intégration client API ADN (auth + catalogue)
- [ ] Écran de connexion navigable D-pad
- [ ] Page d'accueil avec recommandations
- [ ] Page catalogue / recherche
- [ ] Page détail série + liste épisodes
- [ ] Lecteur vidéo HLS avec contrôles TV
- [ ] Persistance session (localStorage)
- [ ] Packaging WebOS (.ipk)
- [ ] Tests sur simulateur WebOS

---

## Références utiles

- [webOS TV Developer Portal](https://webostv.developer.lge.com/)
- [webOS CLI Guide](https://webostv.developer.lge.com/develop/tools/webos-tv-cli-dev-guide)
- [App Templates officiels](https://webostv.developer.lge.com/develop/getting-started/app-template)
- [norigin-spatial-navigation](https://github.com/NoriginMedia/Norigin-Spatial-Navigation)
- [multi-downloader-nx adn.ts](https://github.com/anidl/multi-downloader-nx/blob/master/adn.ts) — référence implémentation API ADN
- [yt-dlp ADN extractor](https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/adn.py) — autre référence API ADN
- [Crunchyroll WebOS](https://github.com/mateussouzaweb/crunchyroll-webos) — projet de référence pour l'approche WebOS

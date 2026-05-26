# ADN WebOS

Application non-officielle [Animation Digital Network](https://animationdigitalnetwork.com/) pour TV LG WebOS.

ADN ne propose pas d'application WebOS officielle. Ce projet comble ce manque en consommant directement leur API REST pour offrir une interface native TV — navigation télécommande, lecteur vidéo intégré, et thème sombre aux couleurs d'ADN.

> Projet communautaire, sans affiliation avec ADN / Kazé.

## Stack

- [Enact](https://enactjs.com/) + [Sandstone](https://github.com/enactjs/sandstone) — framework UI officiel LG WebOS
- React avec hooks pour les composants avec état
- API REST ADN (`gw.api.animationdigitalnetwork.com`)
- Lecteur HLS natif WebOS via le composant `VideoPlayer` Sandstone

## Fonctionnalités

- Connexion avec son compte ADN
- Page d'accueil avec les sections recommandées
- Recherche dans le catalogue
- Détail d'une série avec liste des épisodes
- Lecture vidéo en streaming HLS
- Navigation entièrement au D-pad (télécommande)
- Thème personnalisé aux couleurs ADN

## Développement

```bash
npm install
npm run serve       # Serveur de développement (localhost:8080)
npm run pack        # Build dev → dist/
npm run pack-p      # Build production → dist/
npm run lint        # Vérification ESLint
```

## Déploiement sur TV

Prérequis : activer le **Developer Mode** sur la TV LG (app "Developer Mode" du store LG), puis installer [webOS CLI](https://webostv.developer.lge.com/develop/tools/sdk-introduction).

```bash
npm install -g @webos-tools/cli

ares-setup-device               # Configurer la TV
ares-package dist/              # Créer le .ipk
ares-install *.ipk              # Installer sur la TV
ares-launch com.adn.webos       # Lancer l'app
```

## Distribution via HomeBrew Channel

[HomeBrew Channel](https://github.com/webosbrew/webos-homebrew-channel) est l'app store communautaire pour WebOS. Une fois le projet suffisamment stable, l'app pourra y être publiée.

## Crédits

Les endpoints de l'API ADN ont été découverts grâce aux implémentations existantes dans ces projets open-source :

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — extracteur ADN (`yt_dlp/extractor/adn.py`)
- [multi-downloader-nx](https://github.com/anidl/multi-downloader-nx) — client ADN (`adn.ts`)

## Licence

GPL-3.0

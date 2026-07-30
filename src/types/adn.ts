// Types basés sur les réponses réelles de l'API ADN

// Types UI communs
export interface InputChangeEvent {
    value: string;
}

export interface Show {
    id: number;
    title: string;
    type: string;
    originalTitle: string;
    shortTitle: string | null;
    reference: string;
    age: string;
    languages: string[];
    summary: string;
    image: string;
    image2x: string;
    imageHorizontal: string;
    imageHorizontal2x: string;
    carouselPortrait: string;
    carouselLandscape: string;
    logo: string;
    url: string;
    urlPath: string;
    episodeCount: number;
    genres: string[];
    copyright: string | null;
    rating: number;
    ratingsCount: number;
    commentsCount: number;
    qualities: string[];
    distributions: string;
    simulcast: boolean;
    free: boolean;
    available: boolean;
    download: boolean;
    nextVideoReleaseDate: string | null;
    basedOn: string | null;
    tagline: string | null;
    firstReleaseYear: string | null; // l'API renvoie une chaîne : "2026"
    productionStudio: string | null;
    countryOfOrigin: string | null;
    indexable: boolean;
}

// Le `show` imbriqué dans un Video omet les trois visuels de carrousel.
export type ShowInVideo = Omit<Show, 'carouselPortrait' | 'carouselLandscape' | 'logo'>;

// Forme allégée renvoyée par /show/carousel?responseType=light (21 champs au lieu de 40).
export type ShowLight = Pick<Show,
    'id' | 'title' | 'summary' | 'languages' | 'image' | 'image2x' |
    'imageHorizontal' | 'imageHorizontal2x' | 'carouselPortrait' | 'carouselLandscape' |
    'logo' | 'urlPath' | 'copyright' | 'simulcast' | 'free' | 'download' |
    'nextVideoReleaseDate' | 'firstReleaseYear' | 'episodeCount' | 'rating'
> & {
    nextVideoId: number;
};

export interface CarouselResponse {
    shows: ShowLight[];
}

export interface CatalogResponse {
    shows: Show[];
    total: number;
}

// Accueil — GET /show/home
// L'ordre du tableau `home` EST l'ordre d'affichage : ne pas trier côté client.
// Le champ `type` discrimine le contenu de `elements`. Un type inconnu doit être
// ignoré silencieusement (l'app officielle a un cas UNKNOWN sans fallback), ce qui
// permet au serveur d'introduire une nouvelle sorte de section sans casser le client.
export type HomeCategoryType = 'show' | 'video' | 'hero';

export interface Hero {
    id: number;
    name: string;
    image: string;
    show: Show;
}

export interface HomeCategoryShow {
    type: 'show';
    title: string;
    elements: Show[];
}

export interface HomeCategoryVideo {
    type: 'video';
    title: string;
    elements: Video[];
}

export interface HomeCategoryHero {
    type: 'hero';
    title: string;
    elements: Hero[];
}

export type HomeCategory = HomeCategoryShow | HomeCategoryVideo | HomeCategoryHero;

export interface HomeResponse {
    home: HomeCategory[];
}

export interface VideoUser {
    id: number;
    stoptime: number;
    watchDate: string | null;
    isFullyWatched: boolean;
}

export interface Video {
    id: number;
    title: string;
    name: string;
    number: string;        // libellé affichable : "Épisode 17"
    shortNumber: string;   // "17"
    season: string;        // identifiant de saison, chaîne : "2"
    reference: string;
    type: string;          // VideoTypeEnum : EPS | OAV | MOV | SHORT | BONUS | PV
    order: number;
    image: string;
    image2x: string;
    summary: string;
    releaseDate: string;
    duration: number;      // en secondes
    url: string;
    urlPath: string;
    embeddedUrl: string;
    languages: string[];
    qualities: string[];
    rating: number;
    ratingsCount: number;
    commentsCount: number;
    available: boolean;
    download: boolean;
    free: boolean;
    freeWithAds: boolean;
    indexable: boolean;
    show: ShowInVideo;
    user?: VideoUser;      // présent seulement sur les endpoints authentifiés
}

// GET /video/calendar?date=YYYY-MM-DD et GET /viewing/history
export interface VideosResponse {
    videos: Video[];
}

export interface Season {
    season: number | null;
    title: string;
    videos: Video[];
}

export interface SeasonsResponse {
    seasons: Season[];
}

export interface ShowDetail extends Show {
}

export interface ShowDetailResponse {
    show: ShowDetail;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user?: Record<string, unknown>;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken?: string;
}

export interface StreamingQuality {
    sd?: string;
    hd?: string;
    fhd?: string;
    auto?: string;
}

export interface PlayerLinkResponse {
    links: {
        streaming: Record<string, StreamingQuality>;
        subtitles: Record<string, string>;
        history: string;
        nextVideoUrl?: string;
        previousVideoUrl?: string;
    };
    video: {
        id: number;
        currentTime: number;
        duration: number;
        url: string;
        image: string;
        tcEndingEnd: string;
        tcEndingStart: string;
        tcEpisodeEnd: string;
        tcEpisodeStart: string;
        tcIntroEnd: string;
        tcIntroStart: string;
        isFullyWatched: boolean;
    };
    metadata: {
        title: string;
        subtitle: string;
        summary: string;
        rating: number;
    };
    languages: Array<{ label: string; audio: string; subtitles: string }>;
}

export interface PlayerUserOptions {
    hasAccess: boolean;
    profileId: number;
    refreshToken: string;
    refreshTokenUrl: string;
}

export interface PlayerConfigResponse {
    player: {
        image: string;
        options: {
            user: PlayerUserOptions;
            video: {
                startDate: string | null;
                currentDate: string;
                available: boolean;
                free: boolean;
                url: string;
            };
            preference: {
                quality: string;
                autoplay: boolean;
                language: string;
                green: boolean;
            };
        };
    };
}

export interface PlayerTokenResponse {
    token: string;
    accessToken: string;
    refreshToken: string;
}

export interface Profile {
    id: number;
    name: string;
    avatar: string;
    main: boolean;
    ageCategory: number | null;
    quality: string;
    language: string;
    autoplay: boolean;
}

export interface ProfilesResponse {
    profiles: Profile[];
}

export interface UserSubscription {
    period: string;
    endDate: string;
    name: string;
    maxVideoQuality: string;
    profilesLimit: number;
    concurrentPlayers: number;
}

export interface UserDetail {
    id: number;
    username: string;
    name: string;
    firstName: string;
    avatar: string;
    email: string;
    subscription: UserSubscription | null;
}

export interface UserResponse {
    user: UserDetail;
}
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
    firstReleaseYear: number | null;
    productionStudio: string | null;
    countryOfOrigin: string | null;
    indexable: boolean;
}

export interface CatalogResponse {
    shows: Show[];
    total: number;
}

export interface VideoUser {
    id: number;
    stoptime: number;
    watchDate: string | null;
}

export interface Video {
    id: number;
    title: string;
    name: string;
    number: string;
    image: string;
    duration: number;
    urlPath: string;
    free: boolean;
    freeWithAds: boolean;
    user?: VideoUser;
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
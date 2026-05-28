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

export interface Video {
	id: number;
	title: string;
	number: number;
	season: number;
	image: string | { thumbnail?: string; cover?: string } | null;
	summary?: string;
	duration?: number;
	releaseDate?: string;
	free?: boolean;
	available?: boolean;
}

export interface ShowDetail extends Show {
	// champs supplémentaires éventuels de /video/show/{id}
}

export interface ShowDetailResponse {
	show: ShowDetail;
}

export interface ShowVideosResponse {
	videos: Video[];
	total?: number;
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

export interface PlayerLinkResponse {
	links: {
		streaming: string;
		download?: string;
	};
	metadata?: Record<string, unknown>;
}

export interface PlayerConfigResponse {
	player?: Record<string, unknown>;
	video?: Record<string, unknown>;
}
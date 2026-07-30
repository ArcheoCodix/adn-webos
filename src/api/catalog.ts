import {get} from './client';
import type {
	CatalogResponse, ShowDetailResponse, SeasonsResponse, HomeResponse,
	CarouselResponse, VideosResponse
} from '../types/adn';

export const getCatalog = (page = 1): Promise<CatalogResponse> =>
	get<CatalogResponse>('/show/catalog', {page});

export const search = (query: string, page = 1): Promise<CatalogResponse> =>
	get<CatalogResponse>('/show/catalog', {search: query, page});

export const getShow = (id: number): Promise<ShowDetailResponse> =>
	get<ShowDetailResponse>(`/show/${id}`);

export const getShowSeasons = (showId: number): Promise<SeasonsResponse> =>
	get<SeasonsResponse>(`/video/show/${showId}/seasons`, {order: 'asc'});

// Accueil : source unique de l'ordre et du type des sections.
// L'app Android TV officielle construit tout son écran d'accueil avec ce seul appel,
// puis y insère côté client une section Watchlist en tête et une section Réglages en fin.
export const getHome = (): Promise<HomeResponse> =>
	get<HomeResponse>('/show/home');

// Sections d'accueil relevées sur le site web ; formes de réponse vérifiées sur les
// captures de resources/req-*.
// `responseType: 'light'` renvoie 21 champs au lieu de 40 — à privilégier sur TV.
// Attention : cette réponse n'a pas de `total`, contrairement à /show/catalog et /show/top.
export const getCarousel = (limit = 20): Promise<CarouselResponse> =>
	get<CarouselResponse>('/show/carousel', {limit, responseType: 'light'});

export const getTop = (limit = 8): Promise<CatalogResponse> =>
	get<CatalogResponse>('/show/top', {limit});

// Calendrier de diffusion. `date` au format YYYY-MM-DD.
export const getCalendar = (date: string): Promise<VideosResponse> =>
	get<VideosResponse>('/video/calendar', {date});

// Forme de réponse non vérifiée (aucune capture) : suppose `{shows, total}`.
export const getRelatedShows = (showId: number, limit = 20): Promise<CatalogResponse> =>
	get<CatalogResponse>(`/show/${showId}/related`, {limit});

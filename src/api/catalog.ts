import {get} from './client';
import type {CatalogResponse, ShowDetailResponse, SeasonsResponse} from '../types/adn';

export const getCatalog = (page = 1): Promise<CatalogResponse> =>
	get<CatalogResponse>('/show/catalog', {page});

export const search = (query: string, page = 1): Promise<CatalogResponse> =>
	get<CatalogResponse>('/show/catalog', {search: query, page});

export const getShow = (id: number): Promise<ShowDetailResponse> =>
	get<ShowDetailResponse>(`/show/${id}`);

export const getShowSeasons = (showId: number): Promise<SeasonsResponse> =>
	get<SeasonsResponse>(`/video/show/${showId}/seasons`, {order: 'asc'});

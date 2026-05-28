import {get} from './client';
import type {CatalogResponse, ShowDetailResponse, ShowVideosResponse} from '../types/adn';

export const getCatalog = (page = 1): Promise<CatalogResponse> =>
	get<CatalogResponse>('/show/catalog', {page});

export const search = (query: string, page = 1): Promise<CatalogResponse> =>
	get<CatalogResponse>('/show/catalog', {search: query, page});

export const getShow = (id: number): Promise<ShowDetailResponse> =>
	get<ShowDetailResponse>(`/video/show/${id}`);

export const getShowVideos = (showId: number): Promise<ShowVideosResponse> =>
	get<ShowVideosResponse>(`/video/show/${showId}/videos`);

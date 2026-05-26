import {get} from './client';

export const getHome = () =>
	get('/home');

export const search = (query, page = 1) =>
	get('/show/catalog', {search: query, page});

export const getCatalog = (params = {}) =>
	get('/show/catalog', {page: 1, ...params});

export const getShow = (id) =>
	get(`/video/show/${id}`);

export const getShowVideos = (showId) =>
	get(`/video/show/${showId}/videos`);

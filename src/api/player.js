import {get, post} from './client';

export const getVideoConfig = (videoId) =>
	get(`/player/video/${videoId}/configuration`);

export async function getStreamUrl(videoId) {
	const data = await get(`/player/video/${videoId}/link`, {
		freeWithAds: false,
		adaptive: true,
		withMetadata: true,
		source: 'Web'
	});
	// data.links.streaming contient l'URL HLS (.m3u8)
	return data?.links?.streaming || null;
}

export const refreshPlayerToken = (token) =>
	post('/player/refresh/token', {token});

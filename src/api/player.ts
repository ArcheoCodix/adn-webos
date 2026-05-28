import {get, post} from './client';
import type {PlayerConfigResponse, PlayerLinkResponse} from '../types/adn';

export const getVideoConfig = (videoId: number): Promise<PlayerConfigResponse> =>
	get<PlayerConfigResponse>(`/player/video/${videoId}/configuration`);

export async function getStreamUrl(videoId: number): Promise<string | null> {
	const data = await get<PlayerLinkResponse>(`/player/video/${videoId}/link`, {
		freeWithAds: false,
		adaptive: true,
		withMetadata: true,
		source: 'Web'
	});
	return data?.links?.streaming ?? null;
}

export const refreshPlayerToken = (token: string): Promise<unknown> =>
	post('/player/refresh/token', {token});

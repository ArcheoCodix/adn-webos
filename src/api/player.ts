import JSEncrypt from 'jsencrypt';
import {get, request} from './client';
import type {PlayerConfigResponse, PlayerLinkResponse, PlayerTokenResponse} from '../types/adn';

export interface SubtitleTrack {
	lang: string;
	label: string;
	url: string;
}

export interface PlayerData {
	streamUrl: string;
	subtitles: SubtitleTrack[];
}

const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCbQrCJBRmaXM4gJidDmcpWDssg
numHinCLHAgS4buMtdH7dEGGEUfBofLzoEdt1jqcrCDT6YNhM0aFCqbLOPFtx9cg
/X2G/G5bPVu8cuFM0L+ehp8s6izK1kjx3OOPH/kWzvstM5tkqgJkNyNEvHdeJl6
KhS+IFEqwvZqgbBpKuwIDAQAB
-----END PUBLIC KEY-----`;

function generateHexString(length: number): string {
	const chars = '0123456789abcdef';
	return Array.from({length}, () => chars[Math.floor(Math.random() * 16)]).join('');
}

export const getVideoConfig = (videoId: number): Promise<PlayerConfigResponse> =>
	get<PlayerConfigResponse>(`/player/video/${videoId}/configuration`);

export async function getPlayerData(videoId: number): Promise<PlayerData> {
	// Step 1: Get player configuration (contains player-specific refresh token)
	const config = await getVideoConfig(videoId);
	const {user, preference} = config.player.options;

	if (!user.hasAccess) throw new Error('Accès non autorisé à cette vidéo');

	// Step 2: Refresh player token via X-Player-Refresh-Token header
	const refreshPath = new URL(user.refreshTokenUrl).pathname;
	const tokenData = await request<PlayerTokenResponse>(refreshPath, {
		method: 'POST',
		body: JSON.stringify({}),
		headers: {'X-Player-Refresh-Token': user.refreshToken}
	});

	// Step 3: RSA-PKCS1 encrypt {k, t} with hardcoded public key
	const randomKey = generateHexString(16);
	const encrypt = new JSEncrypt();
	encrypt.setPublicKey(RSA_PUBLIC_KEY);
	const playerToken = encrypt.encrypt(JSON.stringify({k: randomKey, t: tokenData.token}));
	if (!playerToken) throw new Error('RSA encryption failed');

	// Step 4: Get stream URL with X-Player-Token header
	const linkPath = new URL(config.player.options.video.url).pathname;
	const data = await request<PlayerLinkResponse>(
		`${linkPath}?freeWithAds=true&adaptive=false&withMetadata=true&source=Web&subtitlesFormat=webvtt`,
		{headers: {'X-Player-Token': playerToken}}
	);

	// Select preferred language then best quality
	const lang = preference.language in data.links.streaming
		? preference.language
		: Object.keys(data.links.streaming)[0];

	if (!lang) throw new Error('Aucune langue disponible');
	const qualities = data.links.streaming[lang];
	// Prefer fixed-quality (MPEG-TS) over adaptive (fMP4/CMAF) for WebOS 4.x compatibility
	const loadbalancerUrl = qualities.fhd ?? qualities.hd ?? qualities.sd ?? qualities.auto;
	if (!loadbalancerUrl) throw new Error('Aucune qualité disponible');

	// Step 6: Follow video loadbalancer JSON redirect
	const loadbalancerPath = new URL(loadbalancerUrl).pathname + new URL(loadbalancerUrl).search;
	const redirect = await get<{location?: string}>(loadbalancerPath);
	const streamUrl = redirect.location;
	if (!streamUrl) throw new Error('Stream URL introuvable');

	// Step 7: Resolve subtitle loadbalancer URLs
	const subtitles = await Promise.all(
		Object.entries(data.links.subtitles).map(async ([subtitleLang, subtitleLbUrl]) => {
			const subtitlePath = new URL(subtitleLbUrl).pathname + new URL(subtitleLbUrl).search;
			const subtitleRedirect = await get<{location?: string}>(subtitlePath);
			const match = data.languages.find(l => l.subtitles === subtitleLang);
			return {
				lang: subtitleLang,
				label: match?.label ?? subtitleLang,
				url: subtitleRedirect.location ?? subtitleLbUrl
			};
		})
	);

	return {streamUrl, subtitles};
}

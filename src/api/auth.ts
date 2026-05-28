import {post} from './client';
import type {LoginResponse, RefreshResponse} from '../types/adn';

export async function login(username: string, password: string): Promise<LoginResponse> {
	const data = await post<LoginResponse>('/authentication/login', {username, password, source: 'Web'});
	localStorage.setItem('adn_access_token', data.accessToken);
	localStorage.setItem('adn_refresh_token', data.refreshToken);
	localStorage.setItem('adn_user', JSON.stringify(data.user || {}));
	return data;
}

export async function refreshToken(): Promise<RefreshResponse> {
	const stored = localStorage.getItem('adn_refresh_token');
	if (!stored) throw new Error('No refresh token');

	const data = await post<RefreshResponse>('/authentication/refresh', {refreshToken: stored});
	localStorage.setItem('adn_access_token', data.accessToken);
	if (data.refreshToken) {
		localStorage.setItem('adn_refresh_token', data.refreshToken);
	}
	return data;
}

export function logout(): void {
	localStorage.removeItem('adn_access_token');
	localStorage.removeItem('adn_refresh_token');
	localStorage.removeItem('adn_user');
}

export function isLoggedIn(): boolean {
	return !!localStorage.getItem('adn_access_token');
}

export function getUser(): Record<string, unknown> {
	try {
		return JSON.parse(localStorage.getItem('adn_user') || '{}') as Record<string, unknown>;
	} catch {
		return {};
	}
}

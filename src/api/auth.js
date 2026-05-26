import {post} from './client';

export async function login(username, password) {
	const data = await post('/authentication/login', {username, password});
	localStorage.setItem('adn_access_token', data.accessToken);
	localStorage.setItem('adn_refresh_token', data.refreshToken);
	localStorage.setItem('adn_user', JSON.stringify(data.user || {}));
	return data;
}

export async function refreshToken() {
	const stored = localStorage.getItem('adn_refresh_token');
	if (!stored) throw new Error('No refresh token');

	const data = await post('/authentication/refresh', {refreshToken: stored});
	localStorage.setItem('adn_access_token', data.accessToken);
	if (data.refreshToken) {
		localStorage.setItem('adn_refresh_token', data.refreshToken);
	}
	return data;
}

export function logout() {
	localStorage.removeItem('adn_access_token');
	localStorage.removeItem('adn_refresh_token');
	localStorage.removeItem('adn_user');
}

export function isLoggedIn() {
	return !!localStorage.getItem('adn_access_token');
}

export function getUser() {
	try {
		return JSON.parse(localStorage.getItem('adn_user') || '{}');
	} catch {
		return {};
	}
}

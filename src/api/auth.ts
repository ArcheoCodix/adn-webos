import {post, get} from './client';
import type {LoginResponse, RefreshResponse, Profile, ProfilesResponse, UserDetail, UserResponse} from '../types/adn';

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
	localStorage.removeItem('adn_profile_id');
	localStorage.removeItem('adn_profile');
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

export async function fetchProfiles(): Promise<Profile[]> {
	const data = await get<ProfilesResponse>('/profile?detailed=true&withPreference=true');
	return data.profiles;
}

export async function fetchUserDetail(): Promise<UserDetail> {
	const data = await get<UserResponse>('/user?detailed=true&withSubscription=true');
	return data.user;
}

export function getStoredProfileId(): number | null {
	const profileId = localStorage.getItem('adn_profile_id');
	return profileId ? parseInt(profileId, 10) : null;
}

export function setStoredProfile(profile: Profile): void {
	localStorage.setItem('adn_profile_id', String(profile.id));
	localStorage.setItem('adn_profile', JSON.stringify(profile));
}

export function getStoredProfile(): Profile | null {
	try {
		const profile = localStorage.getItem('adn_profile');
		return profile ? JSON.parse(profile) as Profile : null;
	} catch {
		return null;
	}
}

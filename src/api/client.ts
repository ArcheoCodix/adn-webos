const BASE_URL = process.env.NODE_ENV === 'development'
	? ''
	: 'https://gw.api.animationdigitalnetwork.com';

const DEFAULT_HEADERS: Record<string, string> = {
	'Accept': 'application/json',
	'Accept-Language': 'fr',
	'Content-Type': 'application/json',
	'X-Target-Distribution': 'fr',
	'X-Source': 'Web',
	'X-I18n-Platform': '1',
	'X-Profile-Id': '1'
};

export class ApiError extends Error {
	status: number;
	apiMessage: string;
	constructor(status: number, apiMessage = '') {
		super(apiMessage || `ADN API error: ${status}`);
		this.status = status;
		this.apiMessage = apiMessage;
	}
}

let refreshing: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
	const stored = localStorage.getItem('adn_refresh_token');
	if (!stored) throw new ApiError(401, 'No refresh token');

	const res = await fetch(`${BASE_URL}/authentication/refresh`, {
		method: 'POST',
		headers: DEFAULT_HEADERS,
		body: JSON.stringify({refreshToken: stored})
	});
	if (!res.ok) throw new ApiError(res.status, 'Refresh failed');

	const data = await res.json() as {accessToken: string; refreshToken?: string};
	localStorage.setItem('adn_access_token', data.accessToken);
	if (data.refreshToken) localStorage.setItem('adn_refresh_token', data.refreshToken);
}

export async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
	const token = localStorage.getItem('adn_access_token');
	const headers: Record<string, string> = {
		...DEFAULT_HEADERS,
		...(token ? {Authorization: `Bearer ${token}`} : {}),
		...(options.headers as Record<string, string> || {})
	};

	const res = await fetch(`${BASE_URL}${path}`, {...options, headers});

	if (res.status === 401 && retry) {
		if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null; });
		await refreshing;
		return request<T>(path, options, false);
	}

	if (!res.ok) {
		let apiMessage = '';
		try { apiMessage = ((await res.json()) as {message?: string}).message || ''; } catch { /* */ }
		throw new ApiError(res.status, apiMessage);
	}

	return res.json() as Promise<T>;
}

export const get = <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
	const url = params
		? `${path}?${new URLSearchParams(params as Record<string, string>)}`
		: path;
	return request<T>(url);
};

export const post = <T>(path: string, body: unknown): Promise<T> =>
	request<T>(path, {method: 'POST', body: JSON.stringify(body)});

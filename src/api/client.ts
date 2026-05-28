const BASE_URL = process.env.NODE_ENV === 'development'
	? ''
	: 'https://gw.api.animationdigitalnetwork.com';

const DEFAULT_HEADERS: Record<string, string> = {
	'Content-Type': 'application/json',
	'X-Target-Distribution': 'fr'
};

export class ApiError extends Error {
	status: number;
	constructor(status: number) {
		super(`ADN API error: ${status}`);
		this.status = status;
	}
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = localStorage.getItem('adn_access_token');
	const headers: Record<string, string> = {
		...DEFAULT_HEADERS,
		...(token ? {Authorization: `Bearer ${token}`} : {}),
		...(options.headers as Record<string, string> || {})
	};

	const res = await fetch(`${BASE_URL}${path}`, {...options, headers});

	if (!res.ok) {
		throw new ApiError(res.status);
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

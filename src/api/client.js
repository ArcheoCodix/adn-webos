const BASE_URL = 'https://gw.api.animationdigitalnetwork.com';
const DEFAULT_HEADERS = {
	'Content-Type': 'application/json',
	'X-Target-Distribution': 'fr'
};

export async function request(path, options = {}) {
	const token = localStorage.getItem('adn_access_token');
	const headers = {
		...DEFAULT_HEADERS,
		...(token ? {Authorization: `Bearer ${token}`} : {}),
		...(options.headers || {})
	};

	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers
	});

	if (!res.ok) {
		const err = new Error(`ADN API error: ${res.status}`);
		err.status = res.status;
		throw err;
	}

	return res.json();
}

export const get = (path, params) => {
	const url = params
		? `${path}?${new URLSearchParams(params)}`
		: path;
	return request(url);
};

export const post = (path, body) =>
	request(path, {method: 'POST', body: JSON.stringify(body)});

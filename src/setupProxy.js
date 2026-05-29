const {createProxyMiddleware} = require('http-proxy-middleware');

const ADN_API = 'https://gw.api.animationdigitalnetwork.com';
const ADN_HEADERS = {
	'Origin': 'https://animationdigitalnetwork.com',
	'Referer': 'https://animationdigitalnetwork.com/'
};

const proxyOptions = {
	target: ADN_API,
	changeOrigin: true,
	secure: true,
	headers: ADN_HEADERS
};

module.exports = function (app) {
	['/authentication', '/show', '/video', '/player', '/loadbalancer'].forEach(path => {
		app.use(path, createProxyMiddleware(proxyOptions));
	});
};
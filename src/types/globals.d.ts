declare const ENACT_PACK_ISOMORPHIC: boolean;

declare module '*.module.less' {
	const classes: Record<string, string>;
	export default classes;
}

declare module '*.less' {
	const classes: Record<string, string>;
	export default classes;
}

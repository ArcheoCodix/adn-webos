import {useState, useCallback, useEffect} from 'react';
import {isLoggedIn, getStoredProfileId} from '../api/auth';
import type {Show} from '../types/adn';

export type NavEntry =
	| {name: 'login'}
	| {name: 'home'}
	| {name: 'profile'}
	| {name: 'search'}
	| {name: 'serie'; show: Show}
	| {name: 'player'; videoId: number; title: string};

export function useNavigation() {
	const [stack, setStack] = useState<NavEntry[]>(() => {
		if (!isLoggedIn()) return [{name: 'login'}];
		if (!getStoredProfileId()) return [{name: 'profile'}];
		return [{name: 'home'}];
	});

	const push = useCallback((entry: NavEntry) => setStack(s => [...s, entry]), []);
	const pop = useCallback(() => setStack(s => s.length > 1 ? s.slice(0, -1) : s), []);

	useEffect(() => {
		const handleExpired = () => setStack([{name: 'login'}]);
		window.addEventListener('adn:session-expired', handleExpired);
		return () => window.removeEventListener('adn:session-expired', handleExpired);
	}, []);

	const goHome = useCallback(() => setStack([{name: 'home'}]), []);
	const afterLogin = useCallback(() => {
		setStack([getStoredProfileId() ? {name: 'home'} : {name: 'profile'}]);
	}, []);
	const goProfile = useCallback(() => push({name: 'profile'}), [push]);
	const goSearch = useCallback(() => push({name: 'search'}), [push]);
	const goShow = useCallback((show: Show) => push({name: 'serie', show}), [push]);
	const goPlayer = useCallback((videoId: number, title: string) =>
		push({name: 'player', videoId, title}), [push]);

	return {stack, pop, goHome, afterLogin, goProfile, goSearch, goShow, goPlayer};
}

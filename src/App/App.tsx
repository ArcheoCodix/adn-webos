import {useState, useCallback, useEffect} from 'react';
import {Panels} from '@enact/sandstone/Panels';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';

import {isLoggedIn, getStoredProfileId} from '../api/auth';
import LoginPanel from '../views/LoginPanel';
import HomePanel from '../views/HomePanel';
import ProfilePanel from '../views/ProfilePanel';
import SearchPanel from '../views/SearchPanel';
import SeriePanel from '../views/SeriePanel';
import PlayerPanel from '../views/PlayerPanel';
import type {Show} from '../types/adn';

import './App.module.less'

type NavEntry =
	| {name: 'login'}
	| {name: 'home'}
	| {name: 'profile'}
	| {name: 'search'}
	| {name: 'serie'; show: Show}
	| {name: 'player'; videoId: number; title: string};

const AppBase = () => {
	const initial: NavEntry = !isLoggedIn()
		? {name: 'login'}
		: !getStoredProfileId()
			? {name: 'profile'}
			: {name: 'home'};
	const [stack, setStack] = useState<NavEntry[]>([initial]);

	const push = useCallback((entry: NavEntry) => setStack(s => [...s, entry]), []);
	const pop = useCallback(() => setStack(s => s.length > 1 ? s.slice(0, -1) : s), []);

	useEffect(() => {
		const handleExpired = () => setStack([{name: 'login'}]);
		window.addEventListener('adn:session-expired', handleExpired);
		return () => window.removeEventListener('adn:session-expired', handleExpired);
	}, []);

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			document.body.style.backgroundColor = '#0d0d1a';
		}
	}, []);

	const goHome = useCallback(() => setStack([{name: 'home'}]), []);
	const afterLogin = useCallback(() => {
		if (getStoredProfileId()) {
			setStack([{name: 'home'}]);
		} else {
			setStack([{name: 'profile'}]);
		}
	}, []);
	const goProfile = useCallback(() => push({name: 'profile'}), [push]);
	const goSearch = useCallback(() => push({name: 'search'}), [push]);
	const handleShowSelect = useCallback((show: Show) => push({name: 'serie', show}), [push]);
	const handleEpisodeSelect = useCallback((videoId: number, title: string) =>
		push({name: 'player', videoId, title}), [push]);

	return (
		<Panels index={stack.length - 1} onBack={pop} noCloseButton>
			{stack.map((entry, i) => {
				switch (entry.name) {
					case 'login':
						return <LoginPanel key={i} onLogin={afterLogin} />;
					case 'profile':
						return (
							<ProfilePanel
								key={i}
								onSelect={goHome}
								onBack={stack.length > 1 ? pop : undefined}
							/>
						);
					case 'home':
						return (
							<HomePanel
								key={i}
								onShowSelect={handleShowSelect}
								onSearchOpen={goSearch}
								onProfileChange={goProfile}
							/>
						);
					case 'search':
						return (
							<SearchPanel
								key={i}
								onShowSelect={handleShowSelect}
								onBack={pop}
							/>
						);
					case 'serie':
						return (
							<SeriePanel
								key={i}
								show={entry.show}
								onEpisodeSelect={handleEpisodeSelect}
								onBack={pop}
							/>
						);
					case 'player':
						return (
							<PlayerPanel
								key={i}
								videoId={entry.videoId}
								title={entry.title}
								onBack={pop}
							/>
						);
				}
			})}
		</Panels>
	);
};

export default ThemeDecorator(AppBase);

import {useEffect} from 'react';
import {Panels} from '@enact/sandstone/Panels';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';

import {useNavigation} from './useNavigation';
import LoginPanel from '../views/LoginPanel';
import HomePanel from '../views/HomePanel';
import ProfilePanel from '../views/ProfilePanel';
import SearchPanel from '../views/SearchPanel';
import SeriePanel from '../views/SeriePanel';
import PlayerPanel from '../views/PlayerPanel';

import './App.module.less';

const AppBase = () => {
	const {stack, pop, afterLogin, goHome, goProfile, goSearch, goShow, goPlayer} = useNavigation();

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			document.body.style.backgroundColor = '#04121a';
		}
	}, []);

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
								onShowSelect={goShow}
								onSearchOpen={goSearch}
								onProfileChange={goProfile}
							/>
						);
					case 'search':
						return (
							<SearchPanel
								key={i}
								onShowSelect={goShow}
								onBack={pop}
							/>
						);
					case 'serie':
						return (
							<SeriePanel
								key={i}
								show={entry.show}
								onEpisodeSelect={goPlayer}
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

import {useState, useCallback} from 'react';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';

import {isLoggedIn} from '../api/auth';
import LoginPanel from '../views/LoginPanel';
import HomePanel from '../views/HomePanel';
import SearchPanel from '../views/SearchPanel';
import SeriePanel from '../views/SeriePanel';
import PlayerPanel from '../views/PlayerPanel';
import type {Show} from '../types/adn';

import css from './App.module.less';

type View = 'login' | 'home' | 'search' | 'serie' | 'player';

interface VideoState {
	videoId: number;
	title: string;
}

const AppBase = () => {
	const [view, setView] = useState<View>(isLoggedIn() ? 'home' : 'login');
	const [selectedShow, setSelectedShow] = useState<Show | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<VideoState | null>(null);
	const [, setNavHistory] = useState<View[]>([]);

	const goBack = useCallback(() => {
		setNavHistory(h => {
			const prev = h[h.length - 1];
			if (prev) setView(prev);
			return h.slice(0, -1);
		});
	}, []);

	const goHome = useCallback(() => setView('home'), []);

	const goSearch = useCallback(() => {
		setNavHistory(h => [...h, view]);
		setView('search');
	}, [view]);

	const handleShowSelect = useCallback((show: Show) => {
		setNavHistory(h => [...h, view]);
		setSelectedShow(show);
		setView('serie');
	}, [view]);

	const handleEpisodeSelect = useCallback((videoId: number, title: string) => {
		setNavHistory(h => [...h, view]);
		setSelectedVideo({videoId, title});
		setView('player');
	}, [view]);

	return (
		<div className={css.app}>
			{view === 'login' && (
				<LoginPanel onLogin={goHome} />
			)}
			{view === 'home' && (
				<HomePanel
					onShowSelect={handleShowSelect}
					onSearchOpen={goSearch}
				/>
			)}
			{view === 'search' && (
				<SearchPanel
					onShowSelect={handleShowSelect}
					onBack={goBack}
				/>
			)}
			{view === 'serie' && selectedShow && (
				<SeriePanel
					show={selectedShow}
					onEpisodeSelect={handleEpisodeSelect}
					onBack={goBack}
				/>
			)}
			{view === 'player' && selectedVideo && (
				<PlayerPanel
					videoId={selectedVideo.videoId}
					title={selectedVideo.title}
					onBack={goBack}
				/>
			)}
		</div>
	);
};

export default ThemeDecorator(AppBase);

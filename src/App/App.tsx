import {useState, useCallback} from 'react';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';

import {isLoggedIn} from '../api/auth';
import LoginPanel from '../views/LoginPanel';
import HomePanel from '../views/HomePanel';
import SearchPanel from '../views/SearchPanel';
import SeriePanel from '../views/SeriePanel';
import PlayerPanel from '../views/PlayerPanel';

import css from './App.module.less';

type View = 'login' | 'home' | 'search' | 'serie' | 'player';

interface ShowState {
	showId: number;
	title: string;
}

interface VideoState {
	videoId: number;
	title: string;
}

const AppBase = () => {
	const [view, setView] = useState<View>(isLoggedIn() ? 'home' : 'login');
	const [selectedShow, setSelectedShow] = useState<ShowState | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<VideoState | null>(null);
	const [, setNavHistory] = useState<View[]>([]);

	const navigate = useCallback((nextView: View, state: Partial<ShowState & VideoState> = {}) => {
		setNavHistory(h => [...h, view]);
		if (state.showId !== undefined) setSelectedShow(state as ShowState);
		if (state.videoId !== undefined) setSelectedVideo(state as VideoState);
		setView(nextView);
	}, [view]);

	const goBack = useCallback(() => {
		setNavHistory(h => {
			const prev = h[h.length - 1];
			if (prev) setView(prev);
			return h.slice(0, -1);
		});
	}, []);

	const goHome = useCallback(() => setView('home'), []);
	const goSearch = useCallback(() => navigate('search'), [navigate]);

	const handleShowSelect = useCallback((showId: number, title: string) => {
		navigate('serie', {showId, title});
	}, [navigate]);

	const handleEpisodeSelect = useCallback((videoId: number, title: string) => {
		navigate('player', {videoId, title});
	}, [navigate]);

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
					showId={selectedShow.showId}
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

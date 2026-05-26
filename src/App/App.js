import {useState, useCallback} from 'react';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';

import {isLoggedIn} from '../api/auth';
import LoginPanel from '../views/LoginPanel';
import HomePanel from '../views/HomePanel';
import SearchPanel from '../views/SearchPanel';
import SeriePanel from '../views/SeriePanel';
import PlayerPanel from '../views/PlayerPanel';

import css from './App.module.less';

const VIEWS = {
	LOGIN: 'login',
	HOME: 'home',
	SEARCH: 'search',
	SERIE: 'serie',
	PLAYER: 'player'
};

const AppBase = () => {
	const [view, setView] = useState(isLoggedIn() ? VIEWS.HOME : VIEWS.LOGIN);
	const [selectedShow, setSelectedShow] = useState(null);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [, setNavHistory] = useState([]);

	const navigate = useCallback((nextView, state = {}) => {
		setNavHistory(h => [...h, view]);
		if (state.showId !== undefined) setSelectedShow(state);
		if (state.videoId !== undefined) setSelectedVideo(state);
		setView(nextView);
	}, [view]);

	const goBack = useCallback(() => {
		setNavHistory(h => {
			const prev = h[h.length - 1];
			if (prev) setView(prev);
			return h.slice(0, -1);
		});
	}, []);

	const goHome = useCallback(() => setView(VIEWS.HOME), []);
	const goSearch = useCallback(() => navigate(VIEWS.SEARCH), [navigate]);

	const handleShowSelect = useCallback((showId, title) => {
		navigate(VIEWS.SERIE, {showId, title});
	}, [navigate]);

	const handleEpisodeSelect = useCallback((videoId, title) => {
		navigate(VIEWS.PLAYER, {videoId, title});
	}, [navigate]);

	return (
		<div className={css.app}>
			{view === VIEWS.LOGIN && (
				<LoginPanel onLogin={goHome} />
			)}
			{view === VIEWS.HOME && (
				<HomePanel
					onShowSelect={handleShowSelect}
					onSearchOpen={goSearch}
				/>
			)}
			{view === VIEWS.SEARCH && (
				<SearchPanel
					onShowSelect={handleShowSelect}
					onBack={goBack}
				/>
			)}
			{view === VIEWS.SERIE && selectedShow && (
				<SeriePanel
					showId={selectedShow.showId}
					onEpisodeSelect={handleEpisodeSelect}
					onBack={goBack}
				/>
			)}
			{view === VIEWS.PLAYER && selectedVideo && (
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

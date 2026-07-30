import type React from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Header, Panel} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import {VirtualList} from '@enact/sandstone/VirtualList';
import {scale} from '@enact/ui/resolution';
import Spinner from '../components/Spinner';
import {getShowSeasons} from '../api/catalog';
import type {Season, Show, Video} from '../types/adn';

const EPISODE_HEIGHT = scale(200);

type ScrollToFn = (opts: {index: number; animate?: boolean; focus?: boolean}) => void;

const episodeScrollCache = new Map<number, number>();
const seasonsCache = new Map<number, Season[]>();

// --- Base (presentational) ---

export interface SeriePanelBaseProps {
	show: Show;
	allVideos: Video[];
	loading: boolean;
	error: string | null;
	onEpisodeSelect?: (videoId: number, title: string) => void;
	onBack?: () => void;
}

export const SeriePanelBase = ({show, allVideos, loading, error, onEpisodeSelect, onBack}: SeriePanelBaseProps) => {
	const scrollToRef = useRef<ScrollToFn | null>(null);

	const getScrollTo = useCallback((scrollTo: ScrollToFn) => {
		scrollToRef.current = scrollTo;
		const saved = episodeScrollCache.get(show.id);
		if (saved !== undefined) {
			requestAnimationFrame(() => scrollTo({index: saved, animate: false, focus: true}));
		}
	}, [show.id]);

	const handleEpisodeClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const el = e.currentTarget as HTMLElement;
		const idx = parseInt(el.dataset.videoIndex ?? '0', 10);
		const videoId = parseInt(el.dataset.videoId ?? '0', 10);
		const title = el.dataset.videoTitle ?? '';
		episodeScrollCache.set(show.id, idx);
		onEpisodeSelect?.(videoId, title);
	}, [show.id, onEpisodeSelect]);

	const renderEpisode = useCallback(({index, ...rest}: {index: number; [key: string]: unknown}) => {
		const video = allVideos[index];
		return (
			<ImageItem
				{...rest}
				data-video-id={String(video.id)}
				data-video-title={video.title}
				data-video-index={String(index)}
				src={video.image}
				label={video.number}
				onClick={handleEpisodeClick}
				style={{height: EPISODE_HEIGHT}}
			>
				{video.name}
			</ImageItem>
		);
	}, [allVideos, handleEpisodeClick]);

	if (loading) {
		return <Panel><Spinner centered /></Panel>;
	}

	if (error) {
		return (
			<Panel>
				<Header title={show.title} onBack={onBack} />
				<p style={{color: '#e63946', padding: '2rem'}}>{error}</p>
			</Panel>
		);
	}

	return (
		<Panel>
			<Header
				title={show.title}
				subtitle={show.genres?.join(', ') || ''}
				onBack={onBack}
			/>
			<VirtualList
				spotlightId={`episodes-${show.id}`}
				cbScrollTo={getScrollTo}
				dataSize={allVideos.length}
				itemSize={EPISODE_HEIGHT}
				itemRenderer={renderEpisode}
				verticalScrollbar="hidden"
			/>
		</Panel>
	);
};

// --- Container ---

interface SeriePanelProps {
	show: Show;
	onEpisodeSelect?: (videoId: number, title: string) => void;
	onBack?: () => void;
}

const SeriePanel = ({show, ...props}: SeriePanelProps) => {
	const cached = seasonsCache.get(show.id);
	const [seasons, setSeasons] = useState<Season[]>(cached ?? []);
	const [loading, setLoading] = useState(!cached);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (seasonsCache.has(show.id)) return;
		getShowSeasons(show.id)
			.then(data => {
				const s = data.seasons || [];
				seasonsCache.set(show.id, s);
				setSeasons(s);
			})
			.catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
			.finally(() => setLoading(false));
	}, [show.id]);

	const allVideos = useMemo(() => seasons.flatMap(s => s.videos), [seasons]);

	return (
		<SeriePanelBase
			show={show}
			allVideos={allVideos}
			loading={loading}
			error={error}
			{...props}
		/>
	);
};

export default SeriePanel;

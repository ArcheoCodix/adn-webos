import type React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Header, Panel} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import {VirtualList} from '@enact/sandstone/VirtualList';
import {scale} from '@enact/ui/resolution';
import Spinner from '../components/Spinner';
import {getShowSeasons} from '../api/catalog';
import type {Show, Video} from '../types/adn';

const EPISODE_HEIGHT = scale(200);

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
	const handleEpisodeClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const videoId = parseInt((e.currentTarget as HTMLElement).dataset.videoId ?? '0', 10);
		const title = (e.currentTarget as HTMLElement).dataset.videoTitle ?? '';
		onEpisodeSelect?.(videoId, title);
	}, [onEpisodeSelect]);

	const renderEpisode = useCallback(({index, ...rest}: {index: number; [key: string]: unknown}) => {
		const video = allVideos[index];
		return (
			<ImageItem
				{...rest}
				data-video-id={String(video.id)}
				data-video-title={video.title}
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
	const [seasons, setSeasons] = useState<import('../types/adn').Season[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getShowSeasons(show.id)
			.then(data => setSeasons(data.seasons || []))
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

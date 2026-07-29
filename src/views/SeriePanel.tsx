import {useState, useEffect, useCallback, useMemo} from 'react';
import type React from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import Scroller from '@enact/sandstone/Scroller';
import Spinner from '../components/Spinner';
import {getShowSeasons} from '../api/catalog';
import type {Show, Video} from '../types/adn';

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
			<Scroller>
				{allVideos.map(video => (
					<ImageItem
						key={video.id}
						data-video-id={String(video.id)}
						data-video-title={video.title}
						src={video.image}
						label={video.number}
						onClick={handleEpisodeClick}
					>
						{video.name}
					</ImageItem>
				))}
			</Scroller>
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

import {useState, useEffect, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import Scroller from '@enact/sandstone/Scroller';
import Spinner from '../components/Spinner';

import {getShowSeasons} from '../api/catalog';
import type {Show, Season} from '../types/adn';

interface SeriePanelProps {
	show: Show;
	onEpisodeSelect?: (videoId: number, title: string) => void;
	onBack?: () => void;
}

const SeriePanel = ({show, onEpisodeSelect, onBack}: SeriePanelProps) => {
	const [seasons, setSeasons] = useState<Season[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getShowSeasons(show.id)
			.then(data => {
				setSeasons(data.seasons || []);
			})
			.catch((e: unknown) => {
				setError(e instanceof Error ? e.message : 'Erreur de chargement');
			})
			.finally(() => setLoading(false));
	}, [show.id]);

	const makeEpisodeHandler = useCallback((videoId: number, title: string) => () => {
		onEpisodeSelect?.(videoId, title);
	}, [onEpisodeSelect]);

	const allVideos = seasons.flatMap(s => s.videos);

	if (loading) return <Panel><Spinner /></Panel>;

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
						src={video.image}
						label={video.number}
						onClick={makeEpisodeHandler(video.id, video.title)}
					>
						{video.name}
					</ImageItem>
				))}
			</Scroller>
		</Panel>
	);
};

export default SeriePanel;

import {useState, useEffect, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import Scroller from '@enact/sandstone/Scroller';
import Spinner from '../components/Spinner';

import {getShow, getShowVideos} from '../api/catalog';
import type {ShowDetail, Video} from '../types/adn';

interface SeriePanelProps {
	showId?: number;
	onEpisodeSelect?: (videoId: number, title: string) => void;
	onBack?: () => void;
}

const SeriePanel = ({showId, onEpisodeSelect, onBack}: SeriePanelProps) => {
	const [show, setShow] = useState<ShowDetail | null>(null);
	const [videos, setVideos] = useState<Video[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!showId) return;
		Promise.all([getShow(showId), getShowVideos(showId)])
			.then(([showData, videosData]) => {
				setShow(showData.show);
				setVideos(videosData.videos || []);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [showId]);

	const makeEpisodeHandler = useCallback((videoId: number, title: string) => () => {
		onEpisodeSelect?.(videoId, title);
	}, [onEpisodeSelect]);

	if (loading) return <Panel><Spinner /></Panel>;

	return (
		<Panel>
			<Header
				title={show?.title || ''}
				subtitle={show?.genres?.join(', ') || ''}
				onBack={onBack}
			/>
			<Scroller>
				{videos.map(video => {
					const imgSrc = typeof video.image === 'string'
						? video.image
						: video.image?.thumbnail ?? video.image?.cover;
					return (
						<ImageItem
							key={video.id}
							src={imgSrc}
							label={`Épisode ${video.season}×${video.number}`}
							onClick={makeEpisodeHandler(video.id, video.title)}
						>
							{video.title}
						</ImageItem>
					);
				})}
			</Scroller>
		</Panel>
	);
};

export default SeriePanel;

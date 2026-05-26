import {useState, useEffect, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import Scroller from '@enact/sandstone/Scroller';
import Spinner from '@enact/sandstone/Spinner';

import {getShow, getShowVideos} from '../api/catalog';

const SeriePanel = ({showId, onEpisodeSelect, onBack}) => {
	const [show, setShow] = useState(null);
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!showId) return;
		Promise.all([getShow(showId), getShowVideos(showId)])
			.then(([showData, videosData]) => {
				setShow(showData.show || showData);
				setVideos(videosData.videos || []);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [showId]);

	const makeEpisodeHandler = useCallback((videoId, title) => () => {
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
				{videos.map(video => (
					<ImageItem
						key={video.id}
						src={video.image?.thumbnail || video.image}
						label={`Épisode ${video.season}×${video.number}`}
						onClick={makeEpisodeHandler(video.id, video.title)}
					>
						{video.title}
					</ImageItem>
				))}
			</Scroller>
		</Panel>
	);
};

export default SeriePanel;

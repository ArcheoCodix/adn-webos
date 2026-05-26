import {useState, useEffect} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import VideoPlayer from '@enact/sandstone/VideoPlayer';
import Spinner from '@enact/sandstone/Spinner';

import {getStreamUrl} from '../api/player';

const PlayerPanel = ({videoId, title, onBack}) => {
	const [streamUrl, setStreamUrl] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!videoId) return;
		getStreamUrl(videoId)
			.then(url => setStreamUrl(url))
			.catch(() => setError('Impossible de charger la vidéo'))
			.finally(() => setLoading(false));
	}, [videoId]);

	if (loading) {
		return <Panel><Spinner /></Panel>;
	}

	if (error) {
		return (
			<Panel>
				<p style={{color: '#e63946', padding: '2rem'}}>{error}</p>
			</Panel>
		);
	}

	return (
		<Panel>
			<VideoPlayer
				title={title}
				onBack={onBack}
				autoCloseTimeout={5000}
			>
				<source src={streamUrl} type="application/x-mpegURL" />
			</VideoPlayer>
		</Panel>
	);
};

export default PlayerPanel;

import {useState, useEffect} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import VideoPlayer from '../components/VideoPlayer';
import Spinner from '../components/Spinner';

import {getStreamUrl} from '../api/player';

interface PlayerPanelProps {
	videoId?: number;
	title?: string;
	onBack?: () => void;
}

const PlayerPanel = ({videoId, title, onBack}: PlayerPanelProps) => {
	const [streamUrl, setStreamUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!videoId) return;
		getStreamUrl(videoId)
			.then(url => setStreamUrl(url))
			.catch((e: unknown) => {
				setError(e instanceof Error ? e.message : 'Impossible de charger la vidéo');
			})
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
				<source src={streamUrl ?? undefined} type="application/x-mpegURL" />
			</VideoPlayer>
		</Panel>
	);
};

export default PlayerPanel;

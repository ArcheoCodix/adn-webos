import {useState, useEffect} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import VideoPlayer from '../components/VideoPlayer';
import Spinner from '../components/Spinner';

import {getPlayerData} from '../api/player';
import type {PlayerData} from '../api/player';

interface PlayerPanelProps {
	videoId?: number;
	title?: string;
	onBack?: () => void;
}

const PlayerPanel = ({videoId, title, onBack}: PlayerPanelProps) => {
	const [playerData, setPlayerData] = useState<PlayerData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!videoId) return;
		getPlayerData(videoId)
			.then(data => setPlayerData(data))
			.catch((e: unknown) => {
				setError(e instanceof Error ? e.message : 'Impossible de charger la vidéo');
			})
			.finally(() => setLoading(false));
	}, [videoId]);

	if (loading) {
		return <Panel><Spinner centered /></Panel>;
	}

	if (error || !playerData) {
		return (
			<Panel>
				<p style={{color: '#e63946', padding: '2rem'}}>{error ?? 'Erreur inconnue'}</p>
			</Panel>
		);
	}

	return (
		<Panel>
			<VideoPlayer
				title={title}
				onBack={onBack}
				autoCloseTimeout={5000}
				source={<>
					<source src={playerData.streamUrl} type="application/x-mpegURL" />
					{playerData.subtitles.map(sub => (
						<track
							key={sub.lang}
							kind="subtitles"
							src={sub.url}
							srcLang={sub.lang}
							label={sub.label}
						/>
					))}
				</>}
			/>
		</Panel>
	);
};

export default PlayerPanel;
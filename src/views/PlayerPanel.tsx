import {useState, useEffect, useCallback} from 'react';
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

	const adjustCuePositions = useCallback(() => {
		const video = document.querySelector('video');
		if (!video) return;
		// Keep subtitles at least MARGIN% from each edge
		const MARGIN = 15;
		for (let i = 0; i < video.textTracks.length; i++) {
			const cues = video.textTracks[i].cues;
			if (!cues) continue;
			for (let j = 0; j < cues.length; j++) {
				const cue = cues[j] as VTTCue;
				// Normalize to percentage: VTT stores either a line number (snapToLines=true) or a %
				let pct: number;
				if (cue.line === 'auto') {
					pct = 100; // browser default: bottom
				} else if (cue.snapToLines) {
					pct = (cue.line as number) < 0 ? 100 : 0; // negative = from bottom, positive = from top
				} else {
					pct = cue.line as number;
				}
				cue.snapToLines = false;
				cue.line = pct > 50
					? Math.min(pct, 100 - MARGIN) // bottom half → cap at 85%
					: Math.max(pct, MARGIN);       // top half → floor at 15%
			}
		}
	}, []);

	const forceSubtitles = useCallback(() => {
		const video = document.querySelector('video');
		if (!video) return;
		const tracks = video.textTracks;
		let preferred = 0;
		for (let i = 0; i < tracks.length; i++) {
			if (tracks[i].label === 'vostf' || tracks[i].language === 'vostf') {
				preferred = i;
				break;
			}
		}
		for (let i = 0; i < tracks.length; i++) {
			tracks[i].mode = i === preferred ? 'showing' : 'hidden';
		}
	}, []);

	useEffect(() => {
		if (!playerData?.subtitles.length) return;
		forceSubtitles();
		const trackEls = Array.from(document.querySelectorAll('track'));
		trackEls.forEach(el => el.addEventListener('load', adjustCuePositions));
		// In case tracks are already loaded
		adjustCuePositions();
		const video = document.querySelector('video');
		video?.addEventListener('loadedmetadata', forceSubtitles);
		return () => {
			trackEls.forEach(el => el.removeEventListener('load', adjustCuePositions));
			video?.removeEventListener('loadedmetadata', forceSubtitles);
		};
	}, [playerData, forceSubtitles, adjustCuePositions]);

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
					{playerData.subtitles.map((sub, index) => (
						<track
							key={sub.lang}
							kind="subtitles"
							src={sub.url}
							srcLang={sub.lang}
							label={sub.label}
							default={index === 0}
						/>
					))}
				</>}
			/>
		</Panel>
	);
};

export default PlayerPanel;
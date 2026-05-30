import type {ComponentType, ReactNode} from 'react';
import SandstoneVideoPlayer from '@enact/sandstone/VideoPlayer';

// VideoPlayerProps officiel est vide — VideoPlayerBaseProps a les vraies props mais
// n'est pas utilisé dans l'export. Ce wrapper expose les props nécessaires.
interface VideoPlayerProps {
	children?: ReactNode;
	source?: ReactNode;
	title?: string;
	onBack?: () => void;
	autoCloseTimeout?: number;
}

const VideoPlayer = SandstoneVideoPlayer as unknown as ComponentType<VideoPlayerProps>;
export default VideoPlayer;

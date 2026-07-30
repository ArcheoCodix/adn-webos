import type {ComponentProps, ComponentType} from 'react';
import SandstoneVideoPlayer from '@enact/sandstone/VideoPlayer';
import type {VideoPlayerBaseProps} from '@enact/sandstone/VideoPlayer';
import type {Merge} from '../types/enact';

// `VideoPlayerProps` ne contient que `SlottableProps` : les ~50 vraies props (title,
// autoCloseTimeout, onBack, source, spotlightId…) sont dans `VideoPlayerBaseProps`,
// jamais recomposé. On réapplique la composition oubliée.
export type VideoPlayerProps = Merge<
	ComponentProps<typeof SandstoneVideoPlayer>,
	VideoPlayerBaseProps
>;

const VideoPlayer = SandstoneVideoPlayer as unknown as ComponentType<VideoPlayerProps>;
export default VideoPlayer;

import {useCallback, useRef} from 'react';
import {VirtualList} from '@enact/sandstone/VirtualList';
import {scale} from '@enact/ui/resolution';
import Heading from '../Heading';
import ImageItem from '@enact/sandstone/ImageItem';

import type {Show} from '../../types/adn';

const ITEM_WIDTH = scale(360);
const ITEM_HEIGHT = scale(420);

type ScrollToFn = (opts: {index: number; animate?: boolean; focus?: boolean}) => void;

const scrollCache = new Map<string, number>();

interface ShowGridProps {
	id: string;
	title?: string;
	shows?: Show[];
	onSelect?: (show: Show) => void;
}

const ShowGrid = ({id, title, shows = [], onSelect}: ShowGridProps) => {
	const scrollToRef = useRef<ScrollToFn | null>(null);

	const getScrollTo = useCallback((scrollTo: ScrollToFn) => {
		scrollToRef.current = scrollTo;
		const saved = scrollCache.get(id);
		if (saved !== undefined) {
			requestAnimationFrame(() => scrollTo({index: saved, animate: false, focus: true}));
		}
	}, [id]);

	const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const idx = parseInt((e.currentTarget as HTMLElement).dataset.index ?? '0', 10);
		scrollCache.set(id, idx);
		if (shows[idx]) onSelect?.(shows[idx]);
	}, [id, shows, onSelect]);

	const renderItem = useCallback(({index, ...rest}: {index: number; [key: string]: unknown}) => {
		const show = shows[index];
		return (
			<ImageItem
				{...rest}
				data-index={index}
				src={show.image}
				onClick={handleClick}
				style={{width: ITEM_WIDTH, height: ITEM_HEIGHT}}
			>
				{show.title}
			</ImageItem>
		);
	}, [shows, handleClick]);

	if (!shows.length) return null;

	return (
		<div>
			{title && <Heading size="small">{title}</Heading>}
			<VirtualList
				direction="horizontal"
				spotlightId={id}
				cbScrollTo={getScrollTo}
				dataSize={shows.length}
				itemSize={ITEM_WIDTH}
				itemRenderer={renderItem}
				style={{height: ITEM_HEIGHT}}
				horizontalScrollbar="hidden"
				verticalScrollbar="hidden"
			/>
		</div>
	);
};

export default ShowGrid;

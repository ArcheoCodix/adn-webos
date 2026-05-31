import {memo, useCallback} from 'react';
import Heading from '../Heading';
import ImageItem from '@enact/sandstone/ImageItem';
import Scroller from '@enact/sandstone/Scroller';

import type {Show} from '../../types/adn';

interface ShowItemProps {
	show: Show;
	onSelect?: (show: Show) => void;
}

const ShowItem = memo(({show, onSelect}: ShowItemProps) => {
	const handleClick = useCallback(() => onSelect?.(show), [show, onSelect]);
	return (
		<ImageItem
			src={show.image}
			style={{minWidth: '300px', height: '400px'}}
			onClick={handleClick}
		>
			{show.title}
		</ImageItem>
	);
});

ShowItem.displayName = 'ShowItem';

interface ShowGridProps {
	title?: string;
	shows?: Show[];
	onSelect?: (show: Show) => void;
	limit?: number;
}

const ShowGrid = ({title, shows = [], onSelect, limit}: ShowGridProps) => {
	const visible = limit ? shows.slice(0, limit) : shows;

	if (!visible.length) return null;

	return (
		<div>
			{title && <Heading size="small">{title}</Heading>}
			<Scroller direction="horizontal">
				<div style={{display: 'flex', gap: '1rem'}}>
					{visible.map(show => (
						<ShowItem key={show.id} show={show} onSelect={onSelect} />
					))}
				</div>
			</Scroller>
		</div>
	);
};

export default ShowGrid;
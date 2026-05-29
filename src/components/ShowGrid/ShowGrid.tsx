import {useCallback} from 'react';
import Heading from '../Heading';
import ImageItem from '@enact/sandstone/ImageItem';
import Scroller from '@enact/sandstone/Scroller';

import type {Show} from '../../types/adn';

interface ShowGridProps {
	title?: string;
	shows?: Show[];
	onSelect?: (show: Show) => void;
}

const ShowGrid = ({title, shows = [], onSelect}: ShowGridProps) => {
	const makeSelectHandler = useCallback((show: Show) => () => {
		onSelect?.(show);
	}, [onSelect]);

	if (!shows.length) return null;

	return (
		<div>
			{title && <Heading size="small">{title}</Heading>}
			<Scroller direction="horizontal">
				<div style={{display: 'flex', gap: '1rem'}}>
					{shows.map(show => (
						<ImageItem
							key={show.id}
							src={show.image}
							style={{minWidth: '300px', height: '400px'}}
							onClick={makeSelectHandler(show)}
						>
							{show.title}
						</ImageItem>
					))}
				</div>
			</Scroller>
		</div>
	);
};

export default ShowGrid;

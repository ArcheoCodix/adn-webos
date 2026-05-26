import {useCallback} from 'react';
import kind from '@enact/core/kind';
import Heading from '@enact/sandstone/Heading';
import ImageItem from '@enact/sandstone/ImageItem';
import Scroller from '@enact/sandstone/Scroller';

const ShowGridBase = ({title, shows = [], onSelect}) => {
	const makeSelectHandler = useCallback((id, showTitle) => () => {
		onSelect?.(id, showTitle);
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
							src={show.image?.cover || show.image?.thumbnail || show.image}
							style={{minWidth: '200px'}}
							onClick={makeSelectHandler(show.id, show.title)}
						>
							{show.title}
						</ImageItem>
					))}
				</div>
			</Scroller>
		</div>
	);
};

const ShowGrid = kind({
	name: 'ShowGrid',
	render: ShowGridBase
});

export default ShowGrid;

import {useEffect, useState} from 'react';
import {Header, Panel} from '@enact/sandstone/Panels';
import Scroller from '@enact/sandstone/Scroller';
import Spinner from '../components/Spinner';

import {getCatalog} from '../api/catalog';
import ShowGrid from '../components/ShowGrid/ShowGrid';
import type {Show} from '../types/adn';

interface HomePanelProps {
	onShowSelect?: (show: Show) => void;
	onSearchOpen?: () => void;
}

const HomePanel = ({onShowSelect, onSearchOpen}: HomePanelProps) => {
	const [simulcasts, setSimulcasts] = useState<Show[]>([]);
	const [catalog, setCatalog] = useState<Show[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getCatalog()
			.then(data => {
				const shows = data.shows || [];
				setSimulcasts(shows.filter(s => s.simulcast));
				setCatalog(shows);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	return (
		<Panel>
			<Header title="ADN" onClose={onSearchOpen} />
			{loading
				? <Spinner />
				: <Scroller>
					<ShowGrid title="Simulcasts en cours" shows={simulcasts} onSelect={onShowSelect} />
					<ShowGrid title="Catalogue" shows={catalog} onSelect={onShowSelect} />
				</Scroller>
			}
		</Panel>
	);
};

export default HomePanel;

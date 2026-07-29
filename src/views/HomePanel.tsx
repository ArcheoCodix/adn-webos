import {useEffect, useState} from 'react';
import {Header, Panel} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';
import Scroller from '@enact/sandstone/Scroller';
import Spinner from '../components/Spinner';

import {getCatalog} from '../api/catalog';
import {getStoredProfile} from '../api/auth';
import ShowGrid from '../components/ShowGrid/ShowGrid';
import type {Show} from '../types/adn';

interface HomePanelProps {
	onShowSelect?: (show: Show) => void;
	onSearchOpen?: () => void;
	onProfileChange?: () => void;
}

const HomePanel = ({onShowSelect, onSearchOpen, onProfileChange}: HomePanelProps) => {
	const [simulcasts, setSimulcasts] = useState<Show[]>([]);
	const [catalog, setCatalog] = useState<Show[]>([]);
	const [loading, setLoading] = useState(true);
	const profile = getStoredProfile();

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
				? <Spinner centered />
				: <Scroller>
					<div style={{display: 'flex', justifyContent: 'flex-end', padding: '0 2rem 1rem'}}>
						<Button size="small" onClick={onProfileChange}>
							{profile?.name ?? 'Profil'}
						</Button>
					</div>
					<ShowGrid title="Simulcasts en cours" shows={simulcasts} onSelect={onShowSelect} />
					<ShowGrid title="Catalogue" shows={catalog} onSelect={onShowSelect} />
				</Scroller>
			}
		</Panel>
	);
};

export default HomePanel;

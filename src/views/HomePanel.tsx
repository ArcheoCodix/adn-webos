import {useEffect, useState} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';
import Scroller from '@enact/sandstone/Scroller';
import Spinner from '../components/Spinner';
import {getCatalog} from '../api/catalog';
import {getStoredProfile} from '../api/auth';
import ShowGrid from '../components/ShowGrid/ShowGrid';
import type {Show} from '../types/adn';

// --- Base (presentational) ---

export interface HomePanelBaseProps {
	simulcasts: Show[];
	catalog: Show[];
	loading: boolean;
	profileName: string;
	onShowSelect?: (show: Show) => void;
	onSearchOpen?: () => void;
	onProfileChange?: () => void;
}

export const HomePanelBase = ({simulcasts, catalog, loading, profileName, onShowSelect, onSearchOpen, onProfileChange}: HomePanelBaseProps) => (
	<Panel>
		<Header title="ADN" onClose={onSearchOpen} />
		{loading
			? <Spinner centered />
			: <Scroller>
				<div style={{display: 'flex', justifyContent: 'flex-end', padding: '0 2rem 1rem'}}>
					<Button size="small" onClick={onProfileChange}>
						{profileName}
					</Button>
				</div>
				<ShowGrid title="Simulcasts en cours" shows={simulcasts} onSelect={onShowSelect} />
				<ShowGrid title="Catalogue" shows={catalog} onSelect={onShowSelect} />
			</Scroller>
		}
	</Panel>
);

// --- Container ---

interface HomePanelProps {
	onShowSelect?: (show: Show) => void;
	onSearchOpen?: () => void;
	onProfileChange?: () => void;
}

const HomePanel = (props: HomePanelProps) => {
	const [simulcasts, setSimulcasts] = useState<Show[]>([]);
	const [catalog, setCatalog] = useState<Show[]>([]);
	const [loading, setLoading] = useState(true);
	const profileName = getStoredProfile()?.name ?? 'Profil';

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
		<HomePanelBase
			simulcasts={simulcasts}
			catalog={catalog}
			loading={loading}
			profileName={profileName}
			{...props}
		/>
	);
};

export default HomePanel;

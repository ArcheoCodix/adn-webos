import {useState, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import {search} from '../api/catalog';
import ShowGrid from '../components/ShowGrid/ShowGrid';
import type {Show, InputChangeEvent} from '../types/adn';

// --- Base (presentational) ---

export interface SearchPanelBaseProps {
	query: string;
	results: Show[];
	loading: boolean;
	onQueryChange: (e: InputChangeEvent) => void;
	onShowSelect?: (show: Show) => void;
	onBack?: () => void;
}

export const SearchPanelBase = ({query, results, loading, onQueryChange, onShowSelect, onBack}: SearchPanelBaseProps) => (
	<Panel>
		<Header title="Recherche" onBack={onBack} />
		<Input
			placeholder="Rechercher une série..."
			value={query}
			onChange={onQueryChange}
		/>
		{loading
			? <Spinner />
			: <ShowGrid id="search-results" shows={results} onSelect={onShowSelect} />
		}
	</Panel>
);

// --- Container ---

interface SearchPanelProps {
	onShowSelect?: (show: Show) => void;
	onBack?: () => void;
}

const SearchPanel = (props: SearchPanelProps) => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Show[]>([]);
	const [loading, setLoading] = useState(false);

	const handleQueryChange = useCallback(async ({value}: InputChangeEvent) => {
		setQuery(value);
		if (!value || value.length < 2) {
			setResults([]);
			return;
		}
		setLoading(true);
		try {
			const data = await search(value);
			setResults(data.shows || []);
		} catch {
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<SearchPanelBase
			query={query}
			results={results}
			loading={loading}
			onQueryChange={handleQueryChange}
			{...props}
		/>
	);
};

export default SearchPanel;

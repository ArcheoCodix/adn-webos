import {useState, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Input from '../components/Input';
import type {InputChangeEvent} from '../types/adn';
import Spinner from '../components/Spinner';

import {search} from '../api/catalog';
import ShowGrid from '../components/ShowGrid/ShowGrid';
import type {Show} from '../types/adn';

interface SearchPanelProps {
	onShowSelect?: (show: Show) => void;
	onBack?: () => void;
}

const SearchPanel = ({onShowSelect, onBack}: SearchPanelProps) => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Show[]>([]);
	const [loading, setLoading] = useState(false);

	const handleSearch = useCallback(async ({value}: InputChangeEvent) => {
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
		<Panel>
			<Header title="Recherche" onBack={onBack} />
			<Input
				placeholder="Rechercher une série..."
				value={query}
				onChange={handleSearch}
			/>
			{loading
				? <Spinner />
				: <ShowGrid shows={results} onSelect={onShowSelect} />
			}
		</Panel>
	);
};

export default SearchPanel;

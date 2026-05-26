import {useState, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Input from '@enact/sandstone/Input';
import Spinner from '@enact/sandstone/Spinner';

import {search} from '../api/catalog';
import ShowGrid from '../components/ShowGrid/ShowGrid';

const SearchPanel = ({onShowSelect, onBack}) => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleSearch = useCallback(async ({value}) => {
		setQuery(value);
		if (!value || value.length < 2) {
			setResults([]);
			return;
		}
		setLoading(true);
		try {
			const data = await search(value);
			setResults(data.shows || data.videos || []);
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

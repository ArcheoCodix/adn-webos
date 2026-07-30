import React, {useState, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Spinner from '../components/Spinner';
import {search} from '../api/catalog';
import ShowGrid from '../components/ShowGrid/ShowGrid';
import type {InputChangeEvent, Show} from '../types/adn';
import Input from '../components/Input';

// --- Base (presentational) ---

export interface SearchPanelBaseProps {
	query: string;
	results: Show[];
	loading: boolean;
	onQueryChange: (event: InputChangeEvent) => void;
	onShowSelect?: (show: Show) => void;
	onBack?: () => void;
}

export const SearchPanelBase = ({query, results, loading, onQueryChange, onShowSelect, onBack}: SearchPanelBaseProps) => (
	<Panel>
		<Header title="Recherche" onBack={onBack} />
		<Input
			placeholder="Rechercher une série..."
			value={query}
			onComplete={onQueryChange}
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

type SearchCache = {query: string; results: Show[]};
let searchCache: SearchCache = {query: '', results: []};

const SearchPanel = (props: SearchPanelProps) => {
	const [query, setQuery] = useState(searchCache.query);
	const [results, setResults] = useState<Show[]>(searchCache.results);
	const [loading, setLoading] = useState(false);

	const handleQueryChange = useCallback(async ({value}: InputChangeEvent) => {
		setQuery(value);
		searchCache.query = value;
		if (!value || value.length < 2) {
			setResults([]);
			searchCache.results = [];
			return;
		}
		setLoading(true);
		try {
			const data = await search(value);
			const shows = data.shows || [];
			setResults(shows);
			searchCache.results = shows;
		} catch {
			setResults([]);
			searchCache.results = [];
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

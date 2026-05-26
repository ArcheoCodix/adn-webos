import {useState, useEffect} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Spinner from '@enact/sandstone/Spinner';

import {getHome} from '../api/catalog';
import ShowGrid from '../components/ShowGrid/ShowGrid';

const HomePanel = ({onShowSelect, onSearchOpen}) => {
	const [sections, setSections] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getHome()
			.then(data => setSections(data.components || []))
			.catch(() => setSections([]))
			.finally(() => setLoading(false));
	}, []);

	return (
		<Panel>
			<Header title="ADN" onClose={onSearchOpen} />
			{loading
				? <Spinner />
				: sections.map((section, i) => (
					<ShowGrid
						key={i}
						title={section.title}
						shows={section.shows || section.videos || []}
						onSelect={onShowSelect}
					/>
				))
			}
		</Panel>
	);
};

export default HomePanel;

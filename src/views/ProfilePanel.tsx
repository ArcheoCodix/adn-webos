import {useState, useEffect, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import Spinner from '../components/Spinner';

import {fetchProfiles, setStoredProfile} from '../api/auth';
import type {Profile} from '../types/adn';
import css from './ProfilePanel.module.less';

interface ProfilePanelProps {
	onSelect?: () => void;
	onBack?: () => void;
}

const ProfilePanel = ({onSelect, onBack}: ProfilePanelProps) => {
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchProfiles()
			.then(setProfiles)
			.catch(() => setError('Impossible de charger les profils'))
			.finally(() => setLoading(false));
	}, []);

	const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const id = parseInt((e.currentTarget as HTMLElement).dataset.profileId ?? '0', 10);
		const profile = profiles.find(p => p.id === id);
		if (!profile) return;
		setStoredProfile(profile);
		onSelect?.();
	}, [profiles, onSelect]);

	return (
		<Panel>
			<Header title="Qui regarde ?" onBack={onBack} noCloseButton />
			{loading && <Spinner centered />}
			{!loading && error && (
				<p style={{color: '#e63946', padding: '2rem'}}>{error}</p>
			)}
			{!loading && !error && (
				<div className={css.profileGrid}>
					{profiles.map(profile => (
						<ImageItem
							key={profile.id}
							data-profile-id={String(profile.id)}
							src={profile.avatar}
							onClick={handleClick}
							style={{width: 270, height: 310}}
						>
							{profile.name}
						</ImageItem>
					))}
				</div>
			)}
		</Panel>
	);
};

export default ProfilePanel;

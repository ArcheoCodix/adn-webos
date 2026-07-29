import {useState, useEffect, useCallback} from 'react';
import type React from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import ImageItem from '@enact/sandstone/ImageItem';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import Spinner from '../components/Spinner';
import {fetchProfiles, setStoredProfile} from '../api/auth';
import type {Profile} from '../types/adn';
import css from './ProfilePanel.module.less';

const ProfileGrid = SpotlightContainerDecorator(
	{enterTo: 'last-focused'},
	({children}: {children: React.ReactNode}) => (
		<div className={css.profileGrid}>{children}</div>
	)
);

// --- Base (presentational) ---

export interface ProfilePanelBaseProps {
	profiles: Profile[];
	loading: boolean;
	error: string | null;
	onProfileSelect: (profile: Profile) => void;
	onBack?: () => void;
}

export const ProfilePanelBase = ({profiles, loading, error, onProfileSelect, onBack}: ProfilePanelBaseProps) => {
	const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const id = parseInt((e.currentTarget as HTMLElement).dataset.profileId ?? '0', 10);
		const profile = profiles.find(p => p.id === id);
		if (profile) onProfileSelect(profile);
	}, [profiles, onProfileSelect]);

	return (
		<Panel>
			<Header title="Qui regarde ?" onBack={onBack} noCloseButton />
			{loading && <Spinner centered />}
			{!loading && error && <p style={{color: '#e63946', padding: '2rem'}}>{error}</p>}
			{!loading && !error && (
				<ProfileGrid>
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
				</ProfileGrid>
			)}
		</Panel>
	);
};

// --- Container ---

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

	const handleProfileSelect = useCallback((profile: Profile) => {
		setStoredProfile(profile);
		onSelect?.();
	}, [onSelect]);

	return (
		<ProfilePanelBase
			profiles={profiles}
			loading={loading}
			error={error}
			onProfileSelect={handleProfileSelect}
			onBack={onBack}
		/>
	);
};

export default ProfilePanel;

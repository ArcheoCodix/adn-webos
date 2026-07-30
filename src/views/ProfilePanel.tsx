import type React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {Header, Panel} from '@enact/sandstone/Panels';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import {scale} from '@enact/ui/resolution';
import Spinner from '../components/Spinner';

const AVATAR_SIZE = `${scale(300)}px`;
import {fetchProfiles, setStoredProfile} from '../api/auth';
import type {Profile} from '../types/adn';
import css from './ProfilePanel.module.less';
import ImageItem from "@enact/sandstone/ImageItem";

const ProfileGrid = SpotlightContainerDecorator(
	{enterTo: 'last-focused'},
	({children}: {children: React.ReactNode}) => (
		<div
			className={css.profileGrid}
			style={{'--avatar-size': AVATAR_SIZE} as React.CSSProperties}
		>
			{children}
		</div>
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
			<Header title="Qui regarde ?" onBack={onBack} noCloseButton centered />
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
							centered
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
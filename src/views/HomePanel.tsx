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

export const HomePanelBase = ({
                                  simulcasts,
                                  catalog,
                                  loading,
                                  profileName,
                                  onShowSelect,
                                  onSearchOpen,
                                  onProfileChange
                              }: HomePanelBaseProps) => (
    <Panel>
        <Header title="ADN" slotAfter={
            <div>
                <Button size="small" onClick={onSearchOpen}>
                    Rechercher
                </Button>
                <Button size="small" onClick={onProfileChange}>
                    {profileName}
                </Button>
            </div>
        }/>

        {loading
            ? <Spinner centered/>
            : <Scroller>
                <ShowGrid id="simulcasts" title="Simulcasts en cours" shows={simulcasts} onSelect={onShowSelect}/>
                <ShowGrid id="catalog" title="Catalogue" shows={catalog} onSelect={onShowSelect}/>
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

type CatalogCache = {simulcasts: Show[]; catalog: Show[]};
let catalogCache: CatalogCache | null = null;

const HomePanel = (props: HomePanelProps) => {
    const [simulcasts, setSimulcasts] = useState<Show[]>(catalogCache?.simulcasts ?? []);
    const [catalog, setCatalog] = useState<Show[]>(catalogCache?.catalog ?? []);
    const [loading, setLoading] = useState(catalogCache === null);
    const profileName = getStoredProfile()?.name ?? 'Profil';

    useEffect(() => {
        if (catalogCache !== null) return;
        getCatalog()
            .then(data => {
                const shows = data.shows || [];
                const sim = shows.filter(s => s.simulcast);
                catalogCache = {simulcasts: sim, catalog: shows};
                setSimulcasts(sim);
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

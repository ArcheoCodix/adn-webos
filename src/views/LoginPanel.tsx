import {useState, useCallback} from 'react';
import Button from '@enact/sandstone/Button';
import Input from '../components/Input';
import type {InputChangeEvent} from '../types/adn';
import {Panel, Header} from '@enact/sandstone/Panels';
import Spinner from '../components/Spinner';

import {login} from '../api/auth';
import {ApiError} from '../api/client';

interface LoginPanelProps {
	onLogin?: () => void;
}

const LoginPanel = ({onLogin}: LoginPanelProps) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleUsernameChange = useCallback(({value}: InputChangeEvent) => setUsername(value), []);
	const handlePasswordChange = useCallback(({value}: InputChangeEvent) => setPassword(value), []);

	const handleLogin = useCallback(async () => {
		if (!username || !password) return;
		setLoading(true);
		setError(null);
		try {
			await login(username, password);
			onLogin?.();
		} catch (e) {
			setError(e instanceof ApiError && e.status === 401
				? 'Identifiants incorrects'
				: 'Erreur de connexion, réessayez'
			);
		} finally {
			setLoading(false);
		}
	}, [username, password, onLogin]);

	return (
		<Panel>
			<Header title="ADN" subtitle="Connectez-vous à votre compte" />
			<div className="login-form">
				{error && <p className="login-error">{error}</p>}
				<Input
					placeholder="Email"
					value={username}
					onChange={handleUsernameChange}
					disabled={loading}
				/>
				<Input
					placeholder="Mot de passe"
					type="password"
					value={password}
					onChange={handlePasswordChange}
					disabled={loading}
				/>
				{loading
					? <Spinner />
					: <Button onClick={handleLogin}>Se connecter</Button>
				}
			</div>
		</Panel>
	);
};

export default LoginPanel;

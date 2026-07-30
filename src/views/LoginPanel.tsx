import React, {useState, useCallback} from 'react';
import {Panel, Header} from '@enact/sandstone/Panels';
import Button from '@enact/sandstone/Button';
import Spinner from '../components/Spinner';
import {login} from '../api/auth';
import {ApiError} from '../api/client';
import css from './LoginPanel.module.less';
import {InputChangeEvent} from "../types/adn";
import Input from "../components/Input";

// --- Base (presentational) ---

export interface LoginPanelBaseProps {
	username: string;
	password: string;
	loading: boolean;
	error: string | null;
	onUsernameChange: (e: InputChangeEvent) => void;
	onPasswordChange: (e: InputChangeEvent) => void;
	onLogin: () => void;
}

export const LoginPanelBase = ({username, password, loading, error, onUsernameChange, onPasswordChange, onLogin}: LoginPanelBaseProps) => (
	<Panel>
		<Header title="ADN" subtitle="Connectez-vous à votre compte" />
		<div className={css.loginForm}>
			{error && <p className={css.loginError}>{error}</p>}
			<Input
				placeholder="Nom d'utilisateur ou adresse e-mail"
				value={username}
				onComplete={onUsernameChange}
				disabled={loading}
			/>
			<Input
				placeholder="Mot de passe"
				type="password"
				value={password}
				onComplete={onPasswordChange}
				disabled={loading}
			/>
			{loading
				? <Spinner />
				: <Button onClick={onLogin}>Se connecter</Button>
			}
		</div>
	</Panel>
);

// --- Container ---

interface LoginPanelProps {
	onLogin?: () => void;
}

const LoginPanel = ({onLogin}: LoginPanelProps) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onUsernameChange = useCallback((event: InputChangeEvent) => setUsername(event.value), []);
	const onPasswordChange = useCallback((event: InputChangeEvent) => setPassword(event.value), []);

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
		<LoginPanelBase
			username={username}
			password={password}
			loading={loading}
			error={error}
			onUsernameChange={onUsernameChange}
			onPasswordChange={onPasswordChange}
			onLogin={handleLogin}
		/>
	);
};

export default LoginPanel;

import {useState, useCallback} from 'react';
import Button from '@enact/sandstone/Button';
import Input from '@enact/sandstone/Input';
import {Panel, Header} from '@enact/sandstone/Panels';
import Spinner from '@enact/sandstone/Spinner';

import {login} from '../api/auth';

const LoginPanel = ({onLogin}) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleUsernameChange = useCallback(({value}) => setUsername(value), []);
	const handlePasswordChange = useCallback(({value}) => setPassword(value), []);

	const handleLogin = useCallback(async () => {
		if (!username || !password) return;
		setLoading(true);
		setError(null);
		try {
			await login(username, password);
			onLogin?.();
		} catch (e) {
			setError(e.status === 401
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

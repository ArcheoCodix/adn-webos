import type {ComponentType} from 'react';
import SandstoneInput from '@enact/sandstone/Input';
import type {InputChangeEvent} from '../types/adn';

interface InputProps {
	placeholder?: string;
	value?: string;
	type?: string;
	disabled?: boolean;
	onChange?: (event: InputChangeEvent) => void;
}

const Input = SandstoneInput as unknown as ComponentType<InputProps>;
export default Input;

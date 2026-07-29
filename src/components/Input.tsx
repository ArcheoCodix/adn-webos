import type {ComponentType} from 'react';
import SandstoneInput, {InputProps as SandstoneInputProps} from '@enact/sandstone/Input';
import type {InputChangeEvent} from '../types/adn';

interface InputProps extends SandstoneInputProps {
	onChange?: (event: InputChangeEvent) => void;
}

const Input = SandstoneInput as unknown as ComponentType<InputProps>;
export default Input;

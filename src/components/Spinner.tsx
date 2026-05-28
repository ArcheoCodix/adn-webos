import type {ComponentType, ReactNode} from 'react';
import SandstoneSpinner from '@enact/sandstone/Spinner';

interface SpinnerProps {
	children?: ReactNode;
}

const Spinner = SandstoneSpinner as unknown as ComponentType<SpinnerProps>;
export default Spinner;

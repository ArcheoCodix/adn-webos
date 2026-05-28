import type {ComponentType, ReactNode} from 'react';
import SandstoneHeading from '@enact/sandstone/Heading';

// Heading size conflit avec HTMLProps<HTMLElement>.size: number dans le type Merge.
// Ce wrapper expose la bonne signature.
interface HeadingProps {
	children?: ReactNode;
	size?: 'title' | 'subtitle' | 'large' | 'medium' | 'small' | 'tiny';
	spacing?: 'auto' | 'large' | 'medium' | 'small' | 'none';
}

const Heading = SandstoneHeading as unknown as ComponentType<HeadingProps>;
export default Heading;

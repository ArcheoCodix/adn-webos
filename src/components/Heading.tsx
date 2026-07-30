import type {ComponentProps, ComponentType} from 'react';
import SandstoneHeading from '@enact/sandstone/Heading';
import type {HeadingProps as UiHeadingProps} from '@enact/ui/Heading';
import type {Merge} from '../types/enact';

// `HeadingBaseProps` de Sandstone n'hérite pas de @enact/ui/Heading : `size` y manque et
// c'est `HTMLProps.size?: number` qui prend sa place (size="title" → "string not
// assignable to number"). On la réinjecte depuis sa déclaration en amont.
export type HeadingProps = Merge<
	ComponentProps<typeof SandstoneHeading>,
	Pick<UiHeadingProps, 'size'>
>;

const Heading = SandstoneHeading as unknown as ComponentType<HeadingProps>;
export default Heading;

import type {ComponentProps, ComponentType} from 'react';
import SandstoneInput from '@enact/sandstone/Input';
import type {InputPopupBaseProps} from '@enact/sandstone/Input';
import type {InputChangeEvent} from '../types/adn';
import type {Merge} from '../types/enact';

// `InputBaseProps` ne garde que disabled/placeholder/size/type/value. Tout le reste part
// dans `InputPopupBaseProps` (InputBase transmet `rest` à InputPopupBase) et n'est jamais
// recomposé — `onChange` tombait donc sur le `FormEventHandler` du DOM, alors qu'Enact
// émet un payload custom `{type, value, preventDefault, stopPropagation}`
// (cf. `prepareInputEventPayload` dans Input.js).
export type InputProps = Merge<
	ComponentProps<typeof SandstoneInput>,
	Merge<
		InputPopupBaseProps,
		{
			onChange?: (event: InputChangeEvent) => void;
			onBeforeChange?: (event: InputChangeEvent) => void;
			onComplete?: (event: InputChangeEvent) => void;
		}
	>
>;

const Input = SandstoneInput as unknown as ComponentType<InputProps>;
export default Input;

import type {ComponentProps, ComponentType} from 'react';
import SandstoneSpinner from '@enact/sandstone/Spinner';

// Les props sont complètes ici (`SpinnerBaseProps extends ui_Spinner_SpinnerBaseProps`),
// mais `component` — le slot d'animation que Sandstone fournit lui-même — a été recopié
// requis : `<Spinner />` ne compile pas. Aucune prop de Spinner n'est réellement
// obligatoire, `Partial` suffit donc à corriger.
export type SpinnerProps = Partial<ComponentProps<typeof SandstoneSpinner>>;

const Spinner = SandstoneSpinner as unknown as ComponentType<SpinnerProps>;
export default Spinner;

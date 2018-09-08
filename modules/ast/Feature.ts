import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { Text } from '../ast/Text';
import { Scenario } from './Scenario';
import { UIElement } from './UIElement';
import { Background } from './Background';
import { VariantBackground } from './VariantBackground';

/**
 * Feature node.
 *
 * @author Thiago Delgado Pinto
 */
export interface Feature extends NamedNode, MayHaveTags {

    description?: string;
    sentences?: Text[];
    background?: Background;
    variantBackground?: VariantBackground;
    scenarios?: Scenario[];
    uiElements?: UIElement[];
}
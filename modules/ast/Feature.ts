import { Background } from './Background';
import { NamedNode } from './Node';
import { Scenario } from './Scenario';
import { MayHaveTags } from './Tag';
import { Text } from './Text';
import { UIElement } from './UIElement';
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
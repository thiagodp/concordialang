import { NamedNode } from './Node';
import { Step } from './Step';
import { Variant } from './Variant';
import { VariantBackground } from './VariantBackground';

/**
 * Scenario node.
 *
 * @author Thiago Delgado Pinto
 */
export interface Scenario extends NamedNode {
    description?: string;
    sentences: Step[];
    variantBackground?: VariantBackground;
    variants?: Variant[];
}
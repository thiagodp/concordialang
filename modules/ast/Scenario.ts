import { Variant } from './Variant';
import { NamedNode } from './Node';
import { Step } from './Step';

/**
 * Scenario node.
 *
 * @author Thiago Delgado Pinto
 */
export interface Scenario extends NamedNode {
    description?: string;
    sentences: Array< Step >;
    variants?: Array< Variant >;
}
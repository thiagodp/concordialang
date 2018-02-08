import { Template } from './Variant';
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
    templates?: Array< Template >;
}
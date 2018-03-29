import { Node } from './Node';
import { Step } from './Step';

/**
 * Variant Background
 *
 * @author Thiago Delgado Pinto
 */
export interface VariantBackground extends Node {
    sentences: Step[];
}
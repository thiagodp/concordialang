import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { Step } from './Step';

/**
 * Variant
 *
 * @author Thiago Delgado Pinto
 */
export interface Variant extends NamedNode, MayHaveTags {
    sentences?: Step[];
}

/**
 * Test Case
 *
 * @author Thiago Delgado Pinto
 */
export interface TestCase extends Variant {
}
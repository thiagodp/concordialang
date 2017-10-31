import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { Step } from './Step';

/**
 * Test case
 * 
 * @author Thiago Delgado Pinto
 */
export interface TestCase extends NamedNode, MayHaveTags {
    sentences?: Step[];
}
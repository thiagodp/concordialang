import { NamedNode, ContentNode } from './Node';
import { MayHaveTags } from './Tag';
import { Step } from './Step';

/**
 * Test case
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface TestCase extends NamedNode, MayHaveTags {
    sentences?: Step[];
}
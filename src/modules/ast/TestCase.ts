import { NamedNode, ContentNode } from './Node';
import { MayHaveTags } from './Tag';

/**
 * Test case
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface TestCase extends NamedNode, MayHaveTags {
    sentences?: TestCaseSentence[];
}


/**
 * Test case sentence
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface TestCaseSentence extends ContentNode {
}
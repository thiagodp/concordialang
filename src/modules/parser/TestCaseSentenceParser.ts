import { TestCaseSentence } from '../ast/TestCase';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../req/SyntaticException";

/**
 * Test case sentence parser
 * 
 * @author Thiago Delgado Pinto
 */
export class TestCaseSentenceParser implements NodeParser< TestCaseSentence > {

    /** @inheritDoc */
    public analyze( node: TestCaseSentence, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks the context
        if ( ! context.inTestCase ) {
            let e = new SyntaticException(
                'The "' + node.keyword + '" clause must be declared after a test case.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Prepare the owner to receive the given node
        let owner = context.currentTestCase;
        if ( ! owner.sentences ) {
            owner.sentences = [];
        }

        // Adds the given node
        owner.sentences.push( node );

        return true;
    }

}
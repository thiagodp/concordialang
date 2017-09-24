import { Step } from '../ast/Step';
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { Keywords } from "../req/Keywords";
import { ParsingContext } from "./ParsingContext";

/**
 * Step node parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepParser implements NodeParser< Step > {

    /** @inheritDoc */
    public analyze( node: Step, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks the context
        if ( ! context.inScenario && ! context.inTestCase ) {
            let e = new SyntaticException(
                'The "' + node.keyword + '" clause must be declared after a scenario or a test case.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Prepare the owner to receive the given node
        let owner = context.inScenario ? context.currentScenario : context.currentTestCase;
        if ( ! owner.sentences ) {
            owner.sentences = [];
        }

        // Adds the given node
        owner.sentences.push( node );

        return true;
    }

}
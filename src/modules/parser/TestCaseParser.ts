import { Scenario } from "../ast/Scenario";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { Keywords } from "../req/Keywords";
import { ParsingContext } from "./ParsingContext";
import { TestCase } from "../ast/TestCase";
import { TagCollector } from "./TagCollector";

/**
 * Test case parser
 * 
 * @author Thiago Delgado Pinto
 */
export class TestCaseParser implements NodeParser< TestCase > {

    /** @inheritDoc */
    public analyze( node: TestCase, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a feature has been declared before it
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'A test case must be declared after a feature declaration.', node.location );
            errors.push( e );
            return false;
        }

        // Prepares the feature to receive the test case        
        let feature = context.doc.feature;
        if ( ! feature.testcases ) {
            feature.testcases = [];
        }

        // Adds the test case to the feature
        feature.testcases.push( node );

        // Adjusts the context
        context.inFeature = false;
        context.inScenario = false;
        context.inTestCase = true;
        context.currentTestCase = node;

        // Adds backward tags
        if ( ! node.tags ) {
            node.tags = [];
        }        
        ( new TagCollector() ).addBackwardTags( it, node.tags );        

        return true;
    }

}
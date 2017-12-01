import { Scenario } from "../ast/Scenario";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { Template } from '../ast/Variant';
import { TagCollector } from "./TagCollector";

/**
 * Template parser
 * 
 * @author Thiago Delgado Pinto
 */
export class TemplateParser implements NodeParser< Template > {

    /** @inheritDoc */
    public analyze( node: Template, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a scenario has been declared
        if ( ! context.doc.feature
            || ! context.doc.feature.scenarios
            || context.doc.feature.scenarios.length < 1
        ) {
            let e = new SyntaticException(
                'A template must be declared after a scenario.', node.location );
            errors.push( e );
            return false;
        }

        // Prepares the scenario to receive the template
        let scenario = context.doc.feature.scenarios[ context.doc.feature.scenarios.length - 1 ];
        if ( ! scenario.templates ) {
            scenario.templates = [];
        }

        // Adds it to the scenario
        scenario.templates.push( node );

        // Adjusts the context
        context.resetInValues();
        context.inTemplate = true; 
        context.currentTemplate = node;

        // Adds backward tags
        if ( ! node.tags ) {
            node.tags = [];
        }        
        ( new TagCollector() ).addBackwardTags( it, node.tags );        

        return true;
    }

}
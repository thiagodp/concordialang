import { Interaction } from '../ast/Interaction';
import { Document } from '../ast/Document';
import { Feature } from "../ast/Feature";
import { Scenario } from "../ast/Scenario";
import { TestCase } from "../ast/TestCase";

/**
 * Parsing context.
 * 
 * @author Thiago Delgado Pinto
 */
export class ParsingContext {

    doc: Document = {};

    inFeature: boolean = false;
    inScenario: boolean = false;
    inInteraction: boolean = false;
    inTestCase: boolean = false;

    currentScenario: Scenario = null;
    currentInteraction: Interaction = null;
    currentTestCase: TestCase = null;

    constructor( doc?: Document ) {
        if ( doc ) {
            this.doc = doc;
        }
    }
}
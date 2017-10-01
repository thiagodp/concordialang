import { UIElementItem } from '../ast/UIElement';
import { ConstantBlock } from '../ast/ConstantBlock';
import { RegexBlock } from '../ast/RegexBlock';
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
    inTestCase: boolean = false;
    inRegexBlock: boolean = false;
    inConstantBlock: boolean = false;
    inUIElementItem: boolean = false;

    currentScenario: Scenario = null; // because it's allowed more than one declaration
    currentTestCase: TestCase = null; // because it's allowed more than one declaration
    currentUIElementItem: UIElementItem = null;

    constructor( doc?: Document ) {
        if ( doc ) {
            this.doc = doc;
        }
    }

    public resetInValues(): void {
        this.inFeature = false;
        this.inScenario = false;
        this.inTestCase = false;
        this.inRegexBlock = false;
        this.inConstantBlock = false;        
        this.inUIElementItem = false;
    }
}
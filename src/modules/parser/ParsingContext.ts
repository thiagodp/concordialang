import { Database } from '../ast/DataSource';
import { Table } from '../ast/Table';
import { UIElement, UIProperty } from '../ast/UIElement';
import { ConstantBlock } from '../ast/ConstantBlock';
import { RegexBlock } from '../ast/RegexBlock';
import { Interaction } from '../ast/Interaction';
import { Document } from '../ast/Document';
import { Feature } from "../ast/Feature";
import { Scenario } from "../ast/Scenario";
import { Variant } from "../ast/Variant";

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
    inUIProperty: boolean = false;
    inTable: boolean = false;

    currentScenario: Scenario = null;
    currentTestCase: Variant = null;
    currentUIElement: UIElement = null;
    currentUIProperty: UIProperty = null;
    currentTable: Table = null;
    currentDatabase: Database = null;

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
        this.inUIProperty = false;
        this.inTable = false;
    }
}
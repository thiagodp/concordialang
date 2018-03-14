import { Database } from '../ast/Database';
import { Table } from '../ast/Table';
import { UIElement, UIProperty } from '../ast/UIElement';
import { ConstantBlock } from '../ast/ConstantBlock';
import { RegexBlock } from '../ast/RegexBlock';
import { Document } from '../ast/Document';
import { Feature } from "../ast/Feature";
import { Scenario } from "../ast/Scenario";
import { Variant, TestCase } from '../ast/Variant';
import { Background } from '../ast/Background';

/**
 * Parsing context.
 *
 * @author Thiago Delgado Pinto
 */
export class ParsingContext {

    doc: Document = {};

    inFeature: boolean = false;
    inBackground: boolean = false;
    inScenario: boolean = false;
    inVariant: boolean = false;
    inTestCase: boolean = false;
    inConstantBlock: boolean = false;
    inConstant: boolean = false;
    inRegexBlock: boolean = false;
    inRegex: boolean = false;
    inUIProperty: boolean = false;
    inTable: boolean = false;

    currentBackground: Background = null;
    currentScenario: Scenario = null;
    currentVariant: Variant = null;
    currentTestCase: TestCase = null;
    currentUIElement: UIElement = null;
    currentUIProperty: UIProperty = null;
    currentConstantBlock: ConstantBlock = null;
    currentRegexBlock: RegexBlock = null;
    currentTable: Table = null;
    currentDatabase: Database = null;

    constructor( doc?: Document ) {
        if ( doc ) {
            this.doc = doc;
        }
    }

    public resetInValues(): void {
        this.inFeature = false;
        this.inBackground = false;
        this.inScenario = false;
        this.inVariant = false;
        this.inTestCase = false;
        this.inConstantBlock = false;
        this.inConstant = false;
        this.inRegexBlock = false;
        this.inRegex = false;
        this.inUIProperty = false;
        this.inTable = false;
    }
}
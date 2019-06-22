import {
    Background,
    ConstantBlock,
    Database,
    Document,
    RegexBlock,
    Scenario,
    Table,
    TestCase,
    UIElement,
    UIProperty,
    Variant,
    VariantBackground
 } from '../ast';


/**
 * Parsing context.
 *
 * @author Thiago Delgado Pinto
 */
export class ParsingContext {

    doc: Document = {};

    inFeature: boolean = false;
    inBackground: boolean = false;
    inVariantBackground: boolean = false;
    inScenario: boolean = false;
    inScenarioVariantBackground: boolean = false;
    inVariant: boolean = false;
    inTestCase: boolean = false;
    inConstantBlock: boolean = false;
    inConstant: boolean = false;
    inRegexBlock: boolean = false;
    inRegex: boolean = false;
    inUIProperty: boolean = false;
    inTable: boolean = false;
    inBeforeAll: boolean = false;
    inAfterAll: boolean = false;
    inBeforeFeature: boolean = false;
    inAfterFeature: boolean = false;
    inBeforeEachScenario: boolean = false;
    inAfterEachScenario: boolean = false;

    currentBackground: Background = null;
    currentVariantBackground: VariantBackground = null;
    currentScenario: Scenario = null;
    currentScenarioVariantBackground: VariantBackground = null;
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
        this.inVariantBackground = false;
        this.inScenario = false;
        this.inScenarioVariantBackground = false;
        this.inVariant = false;
        this.inTestCase = false;
        this.inConstantBlock = false;
        this.inConstant = false;
        this.inRegexBlock = false;
        this.inRegex = false;
        this.inUIProperty = false;
        this.inTable = false;
        this.inBeforeAll = false;
        this.inAfterAll = false;
        this.inBeforeFeature = false;
        this.inAfterFeature = false;
        this.inBeforeEachScenario = false;
        this.inAfterEachScenario = false;
    }
}
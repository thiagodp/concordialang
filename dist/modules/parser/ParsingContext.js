/**
 * Parsing context.
 *
 * @author Thiago Delgado Pinto
 */
export class ParsingContext {
    constructor(doc) {
        this.doc = {};
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
        this.currentBackground = null;
        this.currentVariantBackground = null;
        this.currentScenario = null;
        this.currentScenarioVariantBackground = null;
        this.currentVariant = null;
        this.currentTestCase = null;
        this.currentUIElement = null;
        this.currentUIProperty = null;
        this.currentConstantBlock = null;
        this.currentRegexBlock = null;
        this.currentTable = null;
        this.currentDatabase = null;
        if (doc) {
            this.doc = doc;
        }
    }
    resetInValues() {
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

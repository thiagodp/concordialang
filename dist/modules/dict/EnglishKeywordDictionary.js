"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * English keyword dictionary as the base dictionary.
 *
 * @author  Thiago Delgado Pinto
 */
class EnglishKeywordDictionary {
    constructor() {
        // NOTE: If you want to change some attribute name,
        //       please do it in the parent interface.
        // Not available in Gherkin
        this.import = ['import'];
        this.regexBlock = ['regexes', 'regular expressions'];
        this.constantBlock = ['constants'];
        this.variant = ['variant'];
        this.variantBackground = ['variant background'];
        this.testCase = ['test case'];
        this.uiElement = ['ui element', 'user interface element'];
        this.database = ['database'];
        this.beforeAll = ['before all'];
        this.afterAll = ['after all'];
        this.beforeFeature = ['before feature'];
        this.afterFeature = ['after feature'];
        this.beforeEachScenario = ['before each scenario'];
        this.afterEachScenario = ['after each scenario'];
        this.i = ['i'];
        this.is = ['is'];
        this.with = ['with'];
        this.valid = ['valid'];
        this.invalid = ['invalid'];
        this.random = ['random'];
        this.from = ['from'];
        this.tagGlobal = ['global'];
        this.tagFeature = ['feature'];
        this.tagScenario = ['scenario'];
        this.tagVariant = ['variant'];
        this.tagImportance = ['importance'];
        this.tagIgnore = ['ignore'];
        this.tagGenerated = ['generated'];
        // Also available in Gherkin
        this.language = ['language'];
        this.feature = ['feature', 'story', 'user story'];
        this.background = ['background'];
        this.scenario = ['scenario'];
        this.stepGiven = ['given that', 'given'];
        this.stepWhen = ['when'];
        this.stepThen = ['then'];
        this.stepAnd = ['and', 'but'];
        this.stepOtherwise = ['otherwise', 'when invalid', 'if invalid', 'whether invalid']; // not in Gherkin
        this.table = ['table'];
    }
}
exports.EnglishKeywordDictionary = EnglishKeywordDictionary;

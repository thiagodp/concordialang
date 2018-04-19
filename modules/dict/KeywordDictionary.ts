/**
 * Keyword dictionary
 *
 * @see Keywords
 *
 * @author Thiago Delgado Pinto
 */
export interface KeywordDictionary { // properties should exist in Keywords

    // Not available in Gherkin

    import: string[];
    regexBlock: string[];
    constantBlock: string[];
    variant: string[];
    variantBackground: string[];
    testCase: string[];
    uiElement: string[];
    database: string[];

    beforeAll: string[];
    afterAll: string[];
    beforeFeature: string[];
    afterFeature: string[];
    beforeEachScenario: string[];
    afterEachScenario: string[];

    i: string[];
    is: string[];
    with: string[];
    valid: string[];
    invalid: string[];
    random: string[];

    tagGlobal: string[];
    tagFeature: string[];
    tagScenario: string[];
    tagVariant: string[];
    tagImportance: string[];
    tagIgnore: string[];
    tagGenerated: string[];

    // Also available in Gherkin

    language: string[];

    feature: string[];
    background: string[];
    scenario: string[];

    stepGiven: string[];
    stepWhen: string[];
    stepThen: string[];
    stepAnd: string[];
    stepOtherwise: string[];

    table: string[];

}
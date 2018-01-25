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
    is: string[];
    with: string[];
    state: string[];
    variant: string[];
    template: string[];
    uiElement: string[];
    database: string[];

    beforeAll: string[];
    afterAll: string[];
    beforeFeature: string[];
    afterFeature: string[];
    beforeEachScenario: string[];
    afterEachScenario: string[];

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
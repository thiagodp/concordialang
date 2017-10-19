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
    state: string[];
    testcase: string[];
    uiElement: string[];
    database: string[];

    // Also available in Gherkin

    language: string[];

    feature: string[];
    scenario: string[];

    stepGiven: string[];
    stepWhen: string[];
    stepThen: string[];
    stepAnd: string[];
    stepOtherwise: string[];

    table: string[];    

}